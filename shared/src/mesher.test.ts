import { describe, expect, it } from "vitest";
import { BlockId, createWorld, isPlaceable, meshChunk, setBlock } from "./index";

const DIMS = { x: 1, z: 1, y: 1 } as const;

describe("culled mesher (função pura: bytes → geometria)", () => {
  it("chunk vazio gera geometria vazia", () => {
    const w = createWorld(DIMS);
    const g = meshChunk(w, 0, 0, 0);
    expect(g.indices.length).toBe(0);
    expect(g.positions.length).toBe(0);
  });

  it("1 bloco isolado = 6 faces (24 vértices, 36 índices)", () => {
    const w = createWorld(DIMS);
    setBlock(w, 8, 8, 8, BlockId.Stone);
    const g = meshChunk(w, 0, 0, 0);
    expect(g.positions.length).toBe(24 * 3);
    expect(g.normals.length).toBe(24 * 3);
    expect(g.uvs.length).toBe(24 * 2);
    expect(g.indices.length).toBe(36);
  });

  it("2 blocos adjacentes = 10 faces (faces internas culled)", () => {
    const w = createWorld(DIMS);
    setBlock(w, 8, 8, 8, BlockId.Stone);
    setBlock(w, 9, 8, 8, BlockId.Stone);
    const g = meshChunk(w, 0, 0, 0);
    expect(g.indices.length).toBe(10 * 6);
  });

  it("cubo 3×3×3 = só a superfície (54 faces), bloco central 100% culled", () => {
    const w = createWorld(DIMS);
    for (let x = 4; x < 7; x++)
      for (let y = 4; y < 7; y++)
        for (let z = 4; z < 7; z++) setBlock(w, x, y, z, BlockId.Stone);
    const g = meshChunk(w, 0, 0, 0);
    expect(g.indices.length).toBe(54 * 6);
  });

  it("UVs ficam dentro de [0,1]", () => {
    const w = createWorld(DIMS);
    setBlock(w, 0, 0, 0, BlockId.Grass);
    const g = meshChunk(w, 0, 0, 0);
    for (const uv of g.uvs) {
      expect(uv).toBeGreaterThanOrEqual(0);
      expect(uv).toBeLessThanOrEqual(1);
    }
  });

  it("TODO bloco colocável tem tiles no atlas — mesher não pula nenhum id", () => {
    for (let id = 1; isPlaceable(id); id++) {
      const w = createWorld(DIMS);
      setBlock(w, 8, 8, 8, id);
      // sem entrada em BLOCK_TILES o mesher pularia o bloco (0 faces) — bloco invisível
      expect(meshChunk(w, 0, 0, 0).indices.length, `bloco id ${id}`).toBe(36);
    }
  });

  it("borda do mundo conta como ar (face externa aparece)", () => {
    const w = createWorld(DIMS);
    setBlock(w, 0, 0, 0, BlockId.Stone); // canto do mundo
    const g = meshChunk(w, 0, 0, 0);
    expect(g.indices.length).toBe(36); // 6 faces mesmo encostado na borda
  });
});
