import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { acenderColuna, criarLuz } from "./luz";
import { meshChunk } from "./mesher";
import { createWorld, setBlock } from "./world";

/**
 * §💡 LUZ SUAVIZADA POR VÉRTICE (2026-10-19).
 *
 * A definição de "suave" é exata e testável: os 4 vértices de uma face deixam
 * de carregar o MESMO valor. Enquanto carregavam, cada célula era um degrau e
 * a sombra do voxel saía dura, com a borda marcada no chão.
 *
 * O que estes testes fixam é o CONTRATO do atributo (dois canais em dezesseis
 * avos) e o fato de a variação existir — a aparência final é do shader, e
 * quem olha é o usuário na aula.
 */

const DIMS = { x: 1, z: 1, y: 1 } as const;

/** Mundo 16³ com chão em y<=4 e uma tocha, já com a luz acesa. */
function cena(comTocha: boolean) {
  const w = createWorld(DIMS);
  for (let x = 0; x < 16; x++)
    for (let z = 0; z < 16; z++)
      for (let y = 0; y <= 4; y++) setBlock(w, x, y, z, BlockId.Stone);
  if (comTocha) setBlock(w, 4, 5, 4, BlockId.Tocha);
  const luz = criarLuz(DIMS);
  acenderColuna(w, luz, 0, 0);
  const g = meshChunk(w, 0, 0, 0, luz);
  return g;
}

/**
 * Faces de TOPO no MIOLO do chunk cujos 4 cantos não são todos iguais.
 *
 * O recorte não é capricho: as faces encostadas na borda do chunk leem a casca
 * da vizinhança e têm gradiente por motivo legítimo (o vizinho não existe).
 * Contá-las faria o controle negativo abaixo acusar suavização onde só há
 * fronteira — e um controle negativo que acusa sempre não controla nada.
 */
function topoDoMioloComGradiente(g: { luz: Uint16Array; normals: Float32Array; positions: Float32Array }): number {
  let n = 0;
  for (let i = 0; i + 3 < g.luz.length; i += 4) {
    if (g.normals[i * 3 + 1] !== 1) continue; // só o topo
    let noMiolo = true;
    for (let k = 0; k < 4; k++) {
      const x = g.positions[(i + k) * 3]!, z = g.positions[(i + k) * 3 + 2]!;
      if (x <= 1 || x >= 15 || z <= 1 || z >= 15) noMiolo = false;
    }
    if (!noMiolo) continue;
    const a = g.luz[i]!, b = g.luz[i + 1]!, c = g.luz[i + 2]!, d = g.luz[i + 3]!;
    if (a !== b || a !== c || a !== d) n++;
  }
  return n;
}

describe("a luz varia DENTRO da face", () => {
  it("com uma tocha no chão, muitas faces ganham gradiente", () => {
    const g = cena(true);
    expect(g.luz.length).toBeGreaterThan(0);
    // a tocha cria um halo: as faces do chão em volta dela têm cantos com
    // níveis diferentes, e é exatamente isso que a face chapada não tinha
    expect(topoDoMioloComGradiente(g)).toBeGreaterThan(8);
  });

  it("CONTROLE NEGATIVO: sem tocha e com o céu parelho, nada tem gradiente", () => {
    // se este passasse com gradiente, o teste acima estaria medindo ruído do
    // mesher em vez da luz
    const g = cena(false);
    expect(topoDoMioloComGradiente(g)).toBe(0);
  });

  it("o atributo é Uint16 com os dois canais em dezesseis avos", () => {
    const g = cena(true);
    expect(g.luz).toBeInstanceOf(Uint16Array);
    for (const v of g.luz) {
      const ceu16 = v >> 8;
      const bloco16 = v & 0xff;
      // cada canal vai de 0 a 15 níveis, em passos de 1/16
      expect(ceu16).toBeLessThanOrEqual(15 * 16);
      expect(bloco16).toBeLessThanOrEqual(15 * 16);
    }
  });

  it("céu aberto continua CHEIO nos quatro cantos (a média não escurece o topo)", () => {
    // a suavização pula as células que VEDAM a luz em vez de contá-las como
    // zero: contá-las daria oclusão de canto, que é outra decisão (e com
    // projetor ruim empasta). O topo do chão a céu aberto tem de dar 15 inteiro.
    const g = cena(false);
    let topoCheio = 0;
    for (let i = 0; i < g.luz.length; i++) {
      if (g.normals[i * 3 + 1] === 1 && (g.luz[i]! >> 8) === 15 * 16) topoCheio++;
    }
    expect(topoCheio).toBeGreaterThan(0);
  });
});
