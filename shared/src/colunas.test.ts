import { describe, expect, it } from "vitest";
import {
  colunaDaPosicao,
  colunaDeKey,
  colunaInteressa,
  colunaKey,
  contarColunasNoRaio,
  distanciaColunas,
} from "./colunas";
import { CHUNK_SIZE } from "./constants";
import { COLUNAS_MAGIC, FOLGA_DESCARTE, RAIO_PADRAO, decodeColunas, peekMagic } from "./protocol";
import { GameSession } from "./session";
import { createWorld } from "./world";

const DIMS = { x: 64, z: 64, y: 8 };

describe("colunas — a coluna do jogador", () => {
  it("é o piso da divisão por CHUNK_SIZE quando a posição está dentro do mundo", () => {
    for (const [x, z, cx, cz] of [
      [0, 0, 0, 0],
      [15.9, 15.9, 0, 0],
      [16, 16, 1, 1],
      [100.5, 33.2, 6, 2],
    ] as const) {
      expect(colunaDaPosicao(DIMS, x, z)).toEqual({ cx, cz });
    }
  });

  it("clampa nas bordas — fora do mundo cai na coluna da borda, nunca em índice inválido", () => {
    expect(colunaDaPosicao(DIMS, -1, -999)).toEqual({ cx: 0, cz: 0 });
    expect(colunaDaPosicao(DIMS, 1e9, 1e9)).toEqual({ cx: DIMS.x - 1, cz: DIMS.z - 1 });
  });

  it("key e volta são a mesma coluna, pra TODA coluna do mundo", () => {
    const d = { x: 7, z: 5, y: 4 }; // dims não-quadrado: x e z trocados apareceriam
    for (let cx = 0; cx < d.x; cx++) {
      for (let cz = 0; cz < d.z; cz++) {
        expect(colunaDeKey(d, colunaKey(d, cx, cz))).toEqual({ cx, cz });
      }
    }
  });
});

describe("colunas — o raio é um QUADRADO", () => {
  it("distância é Chebyshev: a diagonal custa o mesmo que a reta", () => {
    expect(distanciaColunas(3, 3, 0, 0)).toBe(3);
    expect(distanciaColunas(3, 0, 0, 0)).toBe(3);
    expect(distanciaColunas(-2, 1, 0, 0)).toBe(2);
  });

  it("a fronteira de `colunaInteressa` é raio + FOLGA_DESCARTE — lida da constante", () => {
    const raio = 6;
    // exatamente na folga: interessa. Um passo além: não.
    expect(colunaInteressa(raio + FOLGA_DESCARTE, 0, 0, 0, raio)).toBe(true);
    expect(colunaInteressa(raio + FOLGA_DESCARTE + 1, 0, 0, 0, raio)).toBe(false);
    // e a folga é REAL: quem está além do raio, mas dentro dela, continua valendo
    expect(FOLGA_DESCARTE).toBeGreaterThan(0);
    expect(colunaInteressa(raio + 1, 0, 0, 0, raio)).toBe(true);
  });

  it("contar bate com a varredura força-bruta do quadrado recortado", () => {
    for (const raio of [0, 1, 6, 40]) {
      for (const [pcx, pcz] of [[32, 32], [0, 0], [63, 63], [0, 63], [5, 60]] as const) {
        let bruto = 0;
        for (let cx = 0; cx < DIMS.x; cx++) {
          for (let cz = 0; cz < DIMS.z; cz++) {
            if (distanciaColunas(cx, cz, pcx, pcz) <= raio) bruto++;
          }
        }
        expect(contarColunasNoRaio(DIMS, pcx, pcz, raio)).toBe(bruto);
      }
    }
  });

  it("com o centro dentro do mundo o total é sempre ≥ 1 — é o que autoriza dividir por ele", () => {
    // a tela de carga usa o total como DENOMINADOR do anel de progresso.
    for (const raio of [0, 1, 12]) {
      for (let cx = 0; cx < DIMS.x; cx += 7) {
        for (let cz = 0; cz < DIMS.z; cz += 11) {
          expect(contarColunasNoRaio(DIMS, cx, cz, raio)).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });
});

/**
 * O teste que dá razão de existir ao módulo: o total que o CLIENTE mostra na
 * tela de carga é uma conta fechada (`contarColunasNoRaio`), e o que ele espera
 * chegar é o que o SERVIDOR decide mandar (`streamColunas`, que anda em anéis).
 * São dois algoritmos diferentes para o mesmo conjunto. Se discordarem por uma
 * coluna, a tela de carga ou nunca fecha ou fecha cedo, com o mundo furado — e
 * é justamente na BORDA do mundo, onde o quadrado é recortado, que uma fórmula
 * escrita à mão erra.
 */
describe("colunas — o total do cliente é o que o servidor manda", () => {
  /** Colunas DISTINTAS que a sessão mandou pro cliente 1. */
  function colunasEnviadas(sent: ArrayBuffer[]): Set<number> {
    const alvo = createWorld(DIMS, false);
    const out = new Set<number>();
    for (const lote of sent) {
      if (peekMagic(lote) !== COLUNAS_MAGIC) continue;
      for (const { cx, cz } of decodeColunas(lote, alvo)) out.add(colunaKey(DIMS, cx, cz));
    }
    return out;
  }

  /** Sessão lazy nova, jogador parado em (bx,bz), drenada até o stream secar. */
  function drenar(bx: number, bz: number): Set<number> {
    const bins: ArrayBuffer[] = [];
    const session = new GameSession(
      (clientId, data) => {
        if (clientId === 1 && data instanceof ArrayBuffer) bins.push(data);
      },
      { singleplayer: true, dims: DIMS, seed: 7, now: () => 0 },
    );
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    // move ANTES do 1º tick: o join em mundo lazy só manda o header, então
    // nenhuma coluna do spawn viaja e a contagem sai limpa deste centro.
    session.handleMessage(
      1,
      JSON.stringify({ type: "move", x: bx, y: 40, z: bz, yaw: 0, pitch: 0 }),
    );
    for (let i = 0; i < 400; i++) session.tick();
    return colunasEnviadas(bins);
  }

  for (const [nome, bx, bz] of [
    ["no meio do mundo (quadrado inteiro)", 32 * CHUNK_SIZE, 32 * CHUNK_SIZE],
    ["no canto 0,0 (recortado nos DOIS eixos)", 0, 0],
    ["na borda de x (recortado num eixo só)", 0, 30 * CHUNK_SIZE],
    ["no canto oposto", 63 * CHUNK_SIZE + 8, 63 * CHUNK_SIZE + 8],
  ] as const) {
    it(`bate ${nome}`, () => {
      const enviadas = drenar(bx, bz);
      const { cx, cz } = colunaDaPosicao(DIMS, bx, bz);
      expect(enviadas.size).toBe(contarColunasNoRaio(DIMS, cx, cz, RAIO_PADRAO));
      // e é o MESMO conjunto, não só o mesmo tamanho
      for (const key of enviadas) {
        const c = colunaDeKey(DIMS, key);
        expect(distanciaColunas(c.cx, c.cz, cx, cz)).toBeLessThanOrEqual(RAIO_PADRAO);
      }
    });
  }
});
