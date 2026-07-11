import { describe, expect, it } from "vitest";
import {
  BlockId,
  CHUNK_SIZE,
  createWorld,
  findSpawnY,
  generateWorld,
  getBlock,
  heightAt,
  setBlock,
} from "./index";

const DIMS = { x: 2, z: 2, y: 2 } as const;

describe("world (get/set em coordenadas de mundo)", () => {
  it("set/get roundtrip, inclusive cruzando bordas de chunk", () => {
    const w = createWorld(DIMS);
    const spots: Array<[number, number, number]> = [
      [0, 0, 0],
      [CHUNK_SIZE - 1, CHUNK_SIZE - 1, CHUNK_SIZE - 1],
      [CHUNK_SIZE, 0, 0], // primeiro bloco do chunk vizinho em x
      [5, CHUNK_SIZE, 7], // chunk vizinho em y
      [w.sizeX - 1, w.sizeY - 1, w.sizeZ - 1],
    ];
    for (const [x, y, z] of spots) setBlock(w, x, y, z, BlockId.Cobblestone);
    for (const [x, y, z] of spots) expect(getBlock(w, x, y, z)).toBe(BlockId.Cobblestone);
    expect(getBlock(w, 1, 0, 0)).toBe(BlockId.Air);
  });

  it("fora dos limites: get devolve Air, set não explode", () => {
    const w = createWorld(DIMS);
    expect(getBlock(w, -1, 0, 0)).toBe(BlockId.Air);
    expect(getBlock(w, 0, w.sizeY, 0)).toBe(BlockId.Air);
    expect(() => setBlock(w, -1, -1, -1, BlockId.Stone)).not.toThrow();
    expect(() => setBlock(w, w.sizeX, 0, 0, BlockId.Stone)).not.toThrow();
  });
});

describe("worldgen (determinístico — contrato de snapshot/save)", () => {
  it("mesma seed gera exatamente os mesmos bytes", () => {
    const a = generateWorld(DIMS, 42);
    const b = generateWorld(DIMS, 42);
    for (let i = 0; i < a.chunks.length; i++) {
      expect(a.chunks[i]).toEqual(b.chunks[i]);
    }
  });

  it("seeds diferentes geram mundos diferentes", () => {
    const a = generateWorld(DIMS, 1);
    const b = generateWorld(DIMS, 2);
    const differs = a.chunks.some((chunk, i) => {
      const other = b.chunks[i]!;
      return chunk.some((v, j) => v !== other[j]);
    });
    expect(differs).toBe(true);
  });

  it("coluna: sólido até a altura, topo grama/areia, ar acima", () => {
    const w = generateWorld(DIMS, 7);
    for (const [x, z] of [
      [0, 0],
      [10, 20],
      [w.sizeX - 1, w.sizeZ - 1],
    ] as const) {
      const h = Math.min(heightAt(x, z, 7), w.sizeY - 2);
      expect(getBlock(w, x, h - 1, z)).toBe(BlockId.Stone);
      expect([BlockId.Grass, BlockId.Sand]).toContain(getBlock(w, x, h, z));
      expect(getBlock(w, x, h + 1, z)).toBe(BlockId.Air);
    }
  });

  it("findSpawnY devolve o topo do sólido mais alto + 1", () => {
    const w = generateWorld(DIMS, 7);
    const y = findSpawnY(w, 5, 5);
    expect(getBlock(w, 5, y - 1, 5)).not.toBe(BlockId.Air);
    expect(getBlock(w, 5, y, 5)).toBe(BlockId.Air);
  });
});
