import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { ruleFor, sandRule } from "./rules";
import { createWorld, setBlock } from "./world";

const DIMS = { x: 1, z: 1, y: 1 };

describe("regras de bloco (sistema genérico de vizinhança)", () => {
  it("só areia tem regra registrada (v0)", () => {
    expect(ruleFor(BlockId.Sand)).toBe(sandRule);
    expect(ruleFor(BlockId.Air)).toBeUndefined();
    expect(ruleFor(BlockId.Grass)).toBeUndefined();
    expect(ruleFor(BlockId.Stone)).toBeUndefined();
    expect(ruleFor(BlockId.Cobblestone)).toBeUndefined();
  });

  it("areia sobre ar desce 1: materializa embaixo ANTES de limpar a origem", () => {
    const world = createWorld(DIMS);
    setBlock(world, 5, 10, 5, BlockId.Sand);
    expect(sandRule(world, 5, 10, 5)).toEqual([
      { x: 5, y: 9, z: 5, blockId: BlockId.Sand },
      { x: 5, y: 10, z: 5, blockId: BlockId.Air },
    ]);
  });

  it("areia sobre sólido não faz nada", () => {
    const world = createWorld(DIMS);
    setBlock(world, 5, 9, 5, BlockId.Stone);
    setBlock(world, 5, 10, 5, BlockId.Sand);
    expect(sandRule(world, 5, 10, 5)).toBeNull();
  });

  it("areia no fundo do mundo (y=0) não cai pro vazio", () => {
    const world = createWorld(DIMS);
    setBlock(world, 5, 0, 5, BlockId.Sand);
    expect(sandRule(world, 5, 0, 5)).toBeNull();
  });
});
