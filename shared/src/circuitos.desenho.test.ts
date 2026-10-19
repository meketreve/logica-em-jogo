import { describe, expect, it } from "vitest";
import {
  BlockId,
  blockSelectionBox,
  createWorld,
  isFullCube,
  isSolidBlock,
  meshChunk,
  setBlock,
} from "./index";
import { TILE } from "./mesher";

/**
 * §🔌 O DESENHO DAS PEÇAS (2026-10-19) — a parte que a sonda de pixel não
 * isola.
 *
 * A sonda prova que a lâmpada acende NA TELA (luminância), que é o que uma
 * asserção de geometria nunca provaria. O que ela NÃO consegue separar é
 * silhueta de COR: alavanca ligada e desligada mudam as duas juntas no mesmo
 * frame. Aqui a pergunta é exata, porque o mesher é função pura dos bytes:
 * a altura da malha, o braço do fio, o pino do chip.
 *
 * O porquê de tudo isto (doc "Circuitos modelos melhores", 2026-10-19): o
 * produto do jogo é ENXERGAR a lógica. Peça cuja diferença mora só na cor some
 * em projetor ruim, de longe, e pra quem não distingue as cores.
 */

const DIMS = { x: 1, z: 1, y: 1 } as const;

/** A altura máxima da malha gerada por UMA peça isolada no meio do chunk. */
function alturaDe(id: number): number {
  const w = createWorld(DIMS);
  setBlock(w, 8, 8, 8, id);
  const g = meshChunk(w, 0, 0, 0);
  let maxY = 0;
  for (let i = 1; i < g.positions.length; i += 3) maxY = Math.max(maxY, g.positions[i]! - 8);
  return maxY;
}

/**
 * Vértices do FIO, e só dele: os que estão no plano do TOPO da lâmina
 * (y = 8 + 2/16). Contar a malha inteira contaria o vizinho junto — pedra ao
 * lado traz os 24 vértices dela e o teste "não ganhou braço" passaria a medir
 * o cubo do vizinho. Nenhuma outra peça tem vértice nessa altura: cubo cheio
 * só tem em 8 e 9, e os pinos do chip ficam em 5/16..11/16.
 */
function verticesDoFio(id: number, vizinhos: [number, number, number, number][] = []): number {
  const w = createWorld(DIMS);
  setBlock(w, 8, 8, 8, id);
  for (const [dx, dy, dz, nb] of vizinhos) setBlock(w, 8 + dx, 8 + dy, 8 + dz, nb);
  const g = meshChunk(w, 0, 0, 0);
  let n = 0;
  for (let i = 0; i < g.positions.length; i += 3) {
    const x = g.positions[i]!, y = g.positions[i + 1]!, z = g.positions[i + 2]!;
    // só a célula do fio (o vizinho que também é fio tem o seu próprio topo)
    if (x < 8 || x > 9 || z < 8 || z > 9) continue;
    if (Math.abs(y - (8 + 2 / 16)) < 1e-6) n++;
  }
  return n;
}
const vertices = verticesDoFio;

describe("alavanca: a diferença é a SILHUETA, não a cor", () => {
  it("ligada fica EM PÉ e desligada fica DEITADA", () => {
    const emPe = alturaDe(BlockId.AlavancaLigada);
    const deitada = alturaDe(BlockId.AlavancaDesligada);
    expect(emPe).toBeCloseTo(12 / 16, 5);
    expect(deitada).toBeCloseTo(6 / 16, 5);
    // o dobro de altura: é o que se lê do outro lado da sala, sem cor nenhuma
    expect(emPe).toBeGreaterThan(deitada * 1.8);
  });

  it("mas a CAIXA DE MIRA é a mesma nos dois (o ▣ não pode voltar a 'colocar')", () => {
    expect(blockSelectionBox(BlockId.AlavancaLigada)).toEqual(
      blockSelectionBox(BlockId.AlavancaDesligada),
    );
    expect(blockSelectionBox(BlockId.AlavancaDesligada)[4]).toBeCloseTo(12 / 16, 5);
  });
});

describe("fio: o braço só aparece onde o SINAL passa", () => {
  it("fio sozinho é só o pad central; cada vizinho ligável acrescenta um braço", () => {
    const sozinho = vertices(BlockId.FioDesligado);
    const comUm = vertices(BlockId.FioDesligado, [[1, 0, 0, BlockId.FioDesligado]]);
    const comDois = vertices(BlockId.FioDesligado, [
      [1, 0, 0, BlockId.FioDesligado],
      [-1, 0, 0, BlockId.FioDesligado],
    ]);
    expect(comUm).toBeGreaterThan(sozinho);
    expect(comDois).toBeGreaterThan(comUm);
  });

  it("CONTROLE NEGATIVO: bloco comum ao lado NÃO ganha braço", () => {
    const sozinho = vertices(BlockId.FioDesligado);
    expect(vertices(BlockId.FioDesligado, [[1, 0, 0, BlockId.Stone]])).toBe(sozinho);
    expect(vertices(BlockId.FioDesligado, [[1, 0, 0, BlockId.Glass]])).toBe(sozinho);
  });

  it("e NEM as costas de uma porta — o desenho é a topologia do motor", () => {
    const sozinho = vertices(BlockId.FioDesligado);
    // porta virada pro +x colada no +x do fio: o fio está nas COSTAS dela
    expect(vertices(BlockId.FioDesligado, [[1, 0, 0, BlockId.PortaEXPDesligada]])).toBe(sozinho);
    // a MESMA porta virada pro −x: agora a saída cai no fio, e o braço aparece
    expect(
      vertices(BlockId.FioDesligado, [[1, 0, 0, BlockId.PortaEXNDesligada]]),
    ).toBeGreaterThan(sozinho);
    // e pela LATERAL dela (o fio é entrada): também liga
    expect(
      vertices(BlockId.FioDesligado, [[0, 0, 1, BlockId.PortaEXPDesligada]]),
    ).toBeGreaterThan(sozinho);
  });

  it("fio EM CIMA ganha poste (a ligação vertical era invisível)", () => {
    const sozinho = vertices(BlockId.FioDesligado);
    expect(vertices(BlockId.FioDesligado, [[0, 1, 0, BlockId.FioDesligado]])).toBeGreaterThan(
      sozinho,
    );
  });
});

describe("placa de pressão: pisável e rasteira", () => {
  it("NÃO é sólida — senão o servidor resgata quem pisa e a peça nunca liga", () => {
    // foi o teste de sessão que pegou isto: com a placa sólida, o portão do
    // bug-605 ("jogador dentro de bloco sólido") tirava a pessoa de cima dela
    for (const id of [BlockId.PlacaDesligada, BlockId.PlacaLigada]) {
      expect(isSolidBlock(id)).toBe(false);
      expect(isFullCube(id)).toBe(false);
    }
  });

  it("afunda quando pisada, e a mira NÃO muda junto", () => {
    expect(alturaDe(BlockId.PlacaDesligada)).toBeCloseTo(2 / 16, 5);
    expect(alturaDe(BlockId.PlacaLigada)).toBeCloseTo(1 / 16, 5);
    // a caixa de mira é a mesma: afundar não pode mudar onde se clica pra quebrar
    expect(blockSelectionBox(BlockId.PlacaLigada)).toEqual(
      blockSelectionBox(BlockId.PlacaDesligada),
    );
  });
});

describe("porta lógica: o chip mostra as regras na própria peça", () => {
  it("saiu do cubo cheio (sem isso o `emitShape` nem seria chamado)", () => {
    for (const id of [BlockId.PortaEXPDesligada, BlockId.PortaOUZNLigada]) {
      expect(isFullCube(id)).toBe(false);
    }
  });

  it("o PINO DE ENTRADA acende sozinho quando aquele lado já entrega sinal", () => {
    // o pino usa um tile PRÓPRIO, então a prova é o tile aparecer na malha
    const tilesDe = (vizinhos: [number, number, number, number][]): Set<number> => {
      const w = createWorld(DIMS);
      setBlock(w, 8, 8, 8, BlockId.PortaEXPDesligada); // frente = +x, entradas em z
      for (const [dx, dy, dz, nb] of vizinhos) setBlock(w, 8 + dx, 8 + dy, 8 + dz, nb);
      const g = meshChunk(w, 0, 0, 0);
      // o v do UV identifica a LINHA do atlas; basta saber se o tile aceso
      // entrou na malha, e pra isso comparamos a coluna/linha dele
      const n = ATLAS_POR_LINHA;
      const alvo = TILE.portaPinoLigado;
      const col = alvo % n;
      const row = (alvo / n) | 0;
      const achados = new Set<number>();
      for (let i = 0; i < g.uvs.length; i += 2) {
        const u = g.uvs[i]!;
        const v = g.uvs[i + 1]!;
        if (u > col / n && u < (col + 1) / n && v > 1 - (row + 1) / n && v < 1 - row / n) {
          achados.add(alvo);
        }
      }
      return achados;
    };
    // nada ligado em volta: nenhum pino aceso
    expect(tilesDe([]).size).toBe(0);
    // alavanca LIGADA numa lateral: aquele pino acende
    expect(tilesDe([[0, 0, 1, BlockId.AlavancaLigada]]).size).toBe(1);
    // CONTROLE NEGATIVO: a mesma alavanca DESLIGADA não acende nada
    expect(tilesDe([[0, 0, 1, BlockId.AlavancaDesligada]]).size).toBe(0);
    // e alavanca ligada nas COSTAS da porta também não — ali não há ligação
    expect(tilesDe([[-1, 0, 0, BlockId.AlavancaLigada]]).size).toBe(0);
  });

  it("a mira segue o CORPO do chip, não a célula inteira", () => {
    const [x0, , , x1] = blockSelectionBox(BlockId.PortaEXPDesligada);
    expect(x0).toBeCloseTo(2 / 16, 5);
    expect(x1).toBeCloseTo(14 / 16, 5);
  });
});

const ATLAS_POR_LINHA = 16;
