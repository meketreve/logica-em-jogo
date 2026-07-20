import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { MAX_WORLD_CHUNKS } from "./constants";
import { getBlock } from "./world";
import {
  TAMANHO_CHUNKS,
  generateCabinsWorld,
  generateFlatWorld,
  generateWorld,
  parseWorldTamanho,
} from "./worldgen";

const DIMS = { x: 2, z: 2, y: 2 };

describe("worldgen: rocha-matriz na camada 0", () => {
  it("mundo normal tem bedrock em y=0 e pedra logo acima (aluno não fura o fundo)", () => {
    const w = generateWorld(DIMS, 7);
    const cols: Array<{ x: number; z: number }> = [
      { x: 0, z: 0 },
      { x: 5, z: 9 },
      { x: w.sizeX - 1, z: w.sizeZ - 1 },
    ];
    for (const { x, z } of cols) {
      expect(getBlock(w, x, 0, z)).toBe(BlockId.Bedrock);
      expect(getBlock(w, x, 1, z)).toBe(BlockId.Stone);
    }
  });

  it("mundo plano e cabines já têm bedrock em y=0", () => {
    const flat = generateFlatWorld(DIMS);
    const cab = generateCabinsWorld(DIMS);
    expect(getBlock(flat, 3, 0, 3)).toBe(BlockId.Bedrock);
    expect(getBlock(cab, 3, 0, 3)).toBe(BlockId.Bedrock);
  });
});

describe("tamanho de mundo P/M/G (2026-07-19)", () => {
  it("parse defensivo e dims dentro do teto do motor", () => {
    expect(parseWorldTamanho("M")).toBe("M");
    expect(parseWorldTamanho("G")).toBe("G");
    expect(parseWorldTamanho("x")).toBe("P");
    expect(parseWorldTamanho(undefined)).toBe("P");
    expect(TAMANHO_CHUNKS.P).toEqual({ x: 8, z: 8, y: 4 });
    for (const t of ["P", "M", "G"] as const) {
      const d = TAMANHO_CHUNKS[t];
      expect(d.x).toBeLessThanOrEqual(MAX_WORLD_CHUNKS.x);
      expect(d.z).toBeLessThanOrEqual(MAX_WORLD_CHUNKS.z);
      expect(d.y).toBeLessThanOrEqual(MAX_WORLD_CHUNKS.y);
    }
  });

  it("mundo G gera nos limites novos (256×256×128) com bedrock no fundo", () => {
    const world = generateWorld(TAMANHO_CHUNKS.G, 7);
    expect(world.sizeX).toBe(256);
    expect(world.sizeY).toBe(128);
    expect(getBlock(world, 255, 0, 255)).toBe(BlockId.Bedrock);
    expect(getBlock(world, 128, 20, 128)).not.toBe(BlockId.Air); // terreno existe
  });
});
