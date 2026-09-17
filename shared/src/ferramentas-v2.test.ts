import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_BALDE_VAZIO,
  ITEM_PICARETA_DIAMANTE,
  ITEM_PICARETA_FERRO,
  ITEM_PICARETA_MADEIRA,
  ITEM_PICARETA_PEDRA,
} from "./blocks";
import { SERVER_TICK_RATE } from "./constants";
import {
  DURABILIDADE,
  QUEBRA_MINIMA_MS,
  durabilidadeDe,
  faltaFerramentaNaMao,
  ferramentaDe,
  gastar,
  tempoDeQuebraMs,
  ticksDeQuebra,
  vidaDe,
} from "./ferramentas";
import {
  type Slot,
  type Stack,
  inventarioParaSave,
  moverEmArray,
  parseInventario,
  podeJuntar,
} from "./inventario";

const picareta = (id: number, dano?: number): Stack =>
  dano === undefined ? { id, qtd: 1 } : { id, qtd: 1, dano };

describe("§🔨 v2 — durabilidade", () => {
  it("as 4 picaretas têm durabilidade; bloco e balde não têm", () => {
    expect(durabilidadeDe(ITEM_PICARETA_MADEIRA)).toBe(59);
    expect(durabilidadeDe(ITEM_PICARETA_DIAMANTE)).toBe(1561);
    expect(durabilidadeDe(BlockId.Stone)).toBeNull();
    expect(durabilidadeDe(ITEM_BALDE_VAZIO)).toBeNull();
  });

  it("ferramenta SEM o campo `dano` está inteira (é o save antigo abrindo)", () => {
    expect(vidaDe(picareta(ITEM_PICARETA_MADEIRA))).toEqual({ atual: 59, max: 59 });
  });

  it("gastar tira 1 de vida e devolve pilha NOVA (nada muta no lugar)", () => {
    const antes = picareta(ITEM_PICARETA_PEDRA, 10);
    const depois = gastar(antes);
    expect(antes.dano).toBe(10);
    expect(depois).toEqual({ id: ITEM_PICARETA_PEDRA, qtd: 1, dano: 11 });
    expect(vidaDe(depois as Stack)).toEqual({ atual: 120, max: 131 });
  });

  it("na ÚLTIMA quebra a ferramenta SOME (null), que é a decisão do usuário", () => {
    const quase = picareta(ITEM_PICARETA_MADEIRA, 58);
    expect(vidaDe(quase)).toEqual({ atual: 1, max: 59 });
    expect(gastar(quase)).toBeNull();
  });

  it("quem não é ferramenta atravessa o gasto intacto", () => {
    const terra: Stack = { id: BlockId.Dirt, qtd: 12 };
    expect(gastar(terra)).toBe(terra);
  });

  it("dano absurdo vindo do save é clampado — a picareta não fica com vida negativa", () => {
    expect(vidaDe(picareta(ITEM_PICARETA_MADEIRA, 9999))).toEqual({ atual: 0, max: 59 });
  });

  it("toda ferramenta do jogo tem durabilidade (ninguém entra na tabela pela metade)", () => {
    for (const id of DURABILIDADE.keys()) expect(ferramentaDe({ id, qtd: 1 })).not.toBeNull();
  });
});

describe("§🔨 v2 — o dano atravessa save e fio, e ferramenta nova não engorda", () => {
  it("ferramenta INTEIRA sai do save sem o campo (forma idêntica à de antes da v2)", () => {
    const inv = parseInventario([{ slot: 0, id: ITEM_PICARETA_MADEIRA, qtd: 1 }]);
    expect(inventarioParaSave(inv)).toEqual([{ slot: 0, id: ITEM_PICARETA_MADEIRA, qtd: 1 }]);
  });

  it("ferramenta GASTA leva o dano na ida e na volta", () => {
    const salvo = [{ slot: 3, id: ITEM_PICARETA_FERRO, qtd: 1, dano: 42 }];
    const inv = parseInventario(salvo);
    expect(inv[3]).toEqual({ id: ITEM_PICARETA_FERRO, qtd: 1, dano: 42 });
    expect(inventarioParaSave(inv)).toEqual(salvo);
  });

  it("dano em coisa que NÃO é ferramenta é jogado fora (parse defensivo)", () => {
    const inv = parseInventario([{ slot: 0, id: BlockId.Dirt, qtd: 5, dano: 7 }]);
    expect(inv[0]).toEqual({ id: BlockId.Dirt, qtd: 5 });
  });

  it("dano estragado devolve a ferramenta INTEIRA — nunca apaga a ferramenta do aluno", () => {
    for (const ruim of ["x", -3, 0, 1.5, null]) {
      const inv = parseInventario([{ slot: 0, id: ITEM_PICARETA_PEDRA, qtd: 1, dano: ruim }]);
      expect(inv[0]).toEqual({ id: ITEM_PICARETA_PEDRA, qtd: 1 });
    }
  });
});

describe("§🔨 v2 — duas ferramentas nunca se fundem", () => {
  it("podeJuntar recusa ferramenta (teto 1) e recusa pilha com desgaste", () => {
    expect(podeJuntar(picareta(ITEM_PICARETA_MADEIRA), picareta(ITEM_PICARETA_MADEIRA))).toBe(false);
    expect(podeJuntar({ id: BlockId.Dirt, qtd: 1 }, { id: BlockId.Dirt, qtd: 2 })).toBe(true);
  });

  it("arrastar picareta gasta sobre picareta inteira TROCA as duas (antes não fazia nada)", () => {
    const slots: Slot[] = [picareta(ITEM_PICARETA_MADEIRA, 50), picareta(ITEM_PICARETA_MADEIRA)];
    const out = moverEmArray(slots, 0, 1);
    expect(out[1]).toEqual({ id: ITEM_PICARETA_MADEIRA, qtd: 1, dano: 50 });
    expect(out[0]).toEqual({ id: ITEM_PICARETA_MADEIRA, qtd: 1 });
  });

  it("terra sobre terra continua JUNTANDO — a régua velha não mudou pro resto do jogo", () => {
    const slots: Slot[] = [{ id: BlockId.Dirt, qtd: 10 }, { id: BlockId.Dirt, qtd: 5 }];
    const out = moverEmArray(slots, 0, 1);
    expect(out[1]).toEqual({ id: BlockId.Dirt, qtd: 15 });
    expect(out[0]).toBeNull();
  });
});

describe("§🔨 v2 — tempo de quebra", () => {
  const mao = (id?: number): Slot => (id === undefined ? null : picareta(id));

  it("a picareta melhor quebra a pedra mais rápido, e a régua é monotônica", () => {
    const tempos = [
      tempoDeQuebraMs(BlockId.Stone, mao(ITEM_PICARETA_MADEIRA)),
      tempoDeQuebraMs(BlockId.Stone, mao(ITEM_PICARETA_PEDRA)),
      tempoDeQuebraMs(BlockId.Stone, mao(ITEM_PICARETA_FERRO)),
      tempoDeQuebraMs(BlockId.Stone, mao(ITEM_PICARETA_DIAMANTE)),
    ];
    expect(tempos).toEqual([...tempos].sort((a, b) => b - a));
    expect(new Set(tempos).size).toBe(4);
  });

  it("picareta NÃO acelera terra — ela não é a ferramenta daquele bloco", () => {
    expect(tempoDeQuebraMs(BlockId.Dirt, mao(ITEM_PICARETA_DIAMANTE))).toBe(
      tempoDeQuebraMs(BlockId.Dirt, null),
    );
  });

  it("desgaste não deixa a ferramenta lenta (vida é vida, não velocidade)", () => {
    expect(tempoDeQuebraMs(BlockId.Stone, picareta(ITEM_PICARETA_FERRO, 200))).toBe(
      tempoDeQuebraMs(BlockId.Stone, picareta(ITEM_PICARETA_FERRO)),
    );
  });

  it("nada quebra em tempo zero — o piso protege o segurar-pra-quebrar", () => {
    expect(tempoDeQuebraMs(BlockId.Obsidian, mao(ITEM_PICARETA_DIAMANTE))).toBeGreaterThanOrEqual(
      QUEBRA_MINIMA_MS,
    );
    for (const id of [BlockId.Dirt, BlockId.Sand, BlockId.Stone]) {
      expect(tempoDeQuebraMs(id, mao(ITEM_PICARETA_DIAMANTE))).toBeGreaterThanOrEqual(
        QUEBRA_MINIMA_MS,
      );
    }
  });

  it("obsidiana com diamante é longa, mas cabe numa aula", () => {
    const ms = tempoDeQuebraMs(BlockId.Obsidian, mao(ITEM_PICARETA_DIAMANTE));
    expect(ms).toBeGreaterThan(1000);
    expect(ms).toBeLessThan(3000);
  });

  it("ticksDeQuebra é o MESMO tempo no relógio do servidor, nunca zero", () => {
    expect(ticksDeQuebra(BlockId.Stone, mao(ITEM_PICARETA_MADEIRA))).toBe(
      Math.ceil((tempoDeQuebraMs(BlockId.Stone, mao(ITEM_PICARETA_MADEIRA)) * SERVER_TICK_RATE) / 1000),
    );
    expect(ticksDeQuebra(BlockId.Dirt, mao(ITEM_PICARETA_DIAMANTE))).toBeGreaterThanOrEqual(1);
  });
});

describe("§🔨 v2 — o gate olha a MÃO", () => {
  it("picareta na mão quebra a pedra; mão vazia é recusada com a frase do PEGUE", () => {
    expect(faltaFerramentaNaMao(picareta(ITEM_PICARETA_MADEIRA), BlockId.Stone)).toBeNull();
    expect(faltaFerramentaNaMao(null, BlockId.Stone)).toMatch(/Pegue uma picareta de madeira/);
  });

  it("picareta fraca demais é recusada pelo NOME da que falta", () => {
    expect(faltaFerramentaNaMao(picareta(ITEM_PICARETA_MADEIRA), BlockId.MinerioOuro)).toMatch(
      /picareta de ferro/,
    );
  });

  it("terra não exige nada, nem com a mão vazia", () => {
    expect(faltaFerramentaNaMao(null, BlockId.Dirt)).toBeNull();
  });

  it("ferramenta gasta ainda vale — só a vida acabando a tira da mão", () => {
    expect(faltaFerramentaNaMao(picareta(ITEM_PICARETA_PEDRA, 130), BlockId.MinerioFerro)).toBeNull();
  });
});
