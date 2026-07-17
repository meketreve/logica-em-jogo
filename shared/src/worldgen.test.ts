import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { getBlock } from "./world";
import { generateCabinsWorld, generateFlatWorld, generateWorld } from "./worldgen";

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
