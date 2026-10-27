import { describe, expect, it } from "vitest";
import { ATLAS, BlockId, TILE, createWorld, meshChunk, separarRecorte, setBlock } from "./index";

/**
 * §📊 O RECORTE separado do terreno (2026-10-27). O `separarRecorte` acha o
 * tile de cada triângulo pela UV; este teste confere pela POSIÇÃO — qual
 * bloco está naquele lugar —, que é um caminho independente. Se a conta de UV
 * errar a linha ou a coluna do atlas, folha cai no material sem descarte e
 * vira quadrado preto no jogo; aqui ela cai do lado errado e o teste reprova.
 */

const DIMS = { x: 1, z: 1, y: 1 } as const;

/** Os furos como o cliente os lê do atlas — aqui só os tiles que o teste usa. */
function furosDe(...tiles: number[]): Uint8Array {
  const f = new Uint8Array(ATLAS.tilesPerRow * ATLAS.tilesPerRow);
  for (const t of tiles) f[t] = 1;
  return f;
}

/** Que bloco é dono do triângulo `t` (pelo centro dele, empurrado pra dentro). */
function donoDoTriangulo(
  g: ReturnType<typeof meshChunk>,
  indices: Uint32Array,
  t: number,
  bloco: (x: number, y: number, z: number) => number,
): number {
  let x = 0, y = 0, z = 0;
  for (let k = 0; k < 3; k++) {
    const v = indices[t + k]!;
    x += g.positions[v * 3]!;
    y += g.positions[v * 3 + 1]!;
    z += g.positions[v * 3 + 2]!;
  }
  x /= 3; y /= 3; z /= 3;
  // o centro de uma face de cubo cai na BORDA da célula: empurra pra dentro
  // pela normal (oposta), senão o floor pega o vizinho
  const v0 = indices[t]!;
  const nx = g.normals[v0 * 3]!, ny = g.normals[v0 * 3 + 1]!, nz = g.normals[v0 * 3 + 2]!;
  return bloco(Math.floor(x - nx * 0.01), Math.floor(y - ny * 0.01), Math.floor(z - nz * 0.01));
}

describe("§📊 o recorte separado do terreno", () => {
  it("folha, vidro e flor vão pro RECORTE; pedra, terra e grama ficam no SÓLIDO", () => {
    const w = createWorld(DIMS);
    const lugares: [number, number, number, number][] = [
      [2, 2, 2, BlockId.Stone],
      [5, 2, 2, BlockId.Leaves],
      [8, 2, 2, BlockId.Glass],
      [11, 2, 2, BlockId.FlorVermelha],
      [2, 2, 6, BlockId.Grass],
      [5, 2, 6, BlockId.Leaves],
      [8, 2, 6, BlockId.Dirt],
    ];
    const mapa = new Map<string, number>();
    for (const [x, y, z, id] of lugares) {
      setBlock(w, x, y, z, id);
      mapa.set(`${x},${y},${z}`, id);
    }
    const bloco = (x: number, y: number, z: number): number => mapa.get(`${x},${y},${z}`) ?? 0;
    const g = meshChunk(w, 0, 0, 0);
    const { indices, solidos } = separarRecorte(
      g.indices, g.opaqueIndexCount, g.uvs,
      furosDe(TILE.leaves, TILE.glass, TILE.florVermelha),
    );
    const noSolido = new Set<number>();
    const noRecorte = new Set<number>();
    for (let t = 0; t < g.opaqueIndexCount; t += 3) {
      (t < solidos ? noSolido : noRecorte).add(donoDoTriangulo(g, indices, t, bloco));
    }
    expect([...noSolido].sort()).toEqual([BlockId.Stone, BlockId.Grass, BlockId.Dirt].sort());
    expect([...noRecorte].sort()).toEqual([BlockId.Leaves, BlockId.Glass, BlockId.FlorVermelha].sort());
    // nada se perde nem se duplica: os mesmos triângulos, só em outra ordem
    expect([...indices].sort()).toEqual([...g.indices].sort());
  });

  it("chunk sem nenhum furo devolve o MESMO array (sem cópia)", () => {
    const w = createWorld(DIMS);
    setBlock(w, 3, 3, 3, BlockId.Stone);
    const g = meshChunk(w, 0, 0, 0);
    const r = separarRecorte(g.indices, g.opaqueIndexCount, g.uvs, furosDe(TILE.leaves));
    expect(r.indices).toBe(g.indices);
    expect(r.solidos).toBe(g.opaqueIndexCount);
  });

  it("CONTROLE NEGATIVO: sem furo cadastrado, a folha fica no sólido", () => {
    const w = createWorld(DIMS);
    setBlock(w, 3, 3, 3, BlockId.Leaves);
    const g = meshChunk(w, 0, 0, 0);
    expect(separarRecorte(g.indices, g.opaqueIndexCount, g.uvs, furosDe()).solidos).toBe(g.opaqueIndexCount);
  });
});
