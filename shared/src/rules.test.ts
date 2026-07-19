import { describe, expect, it } from "vitest";
import { BlockId, isSolidBlock, isTapete, precisaApoio } from "./blocks";
import { fallingRule, ruleFor, torchRule } from "./rules";
import { createWorld, setBlock } from "./world";

const DIMS = { x: 1, z: 1, y: 1 };

describe("regras de bloco (sistema genérico de vizinhança)", () => {
  it("areia e cascalho compartilham a MESMA regra de queda; o resto não tem regra", () => {
    expect(ruleFor(BlockId.Sand)).toBe(fallingRule);
    expect(ruleFor(BlockId.Gravel)).toBe(fallingRule);
    expect(ruleFor(BlockId.Air)).toBeUndefined();
    expect(ruleFor(BlockId.Grass)).toBeUndefined();
    expect(ruleFor(BlockId.Stone)).toBeUndefined();
    expect(ruleFor(BlockId.Cobblestone)).toBeUndefined();
    expect(ruleFor(BlockId.Bedrock)).toBeUndefined();
  });

  it("bloco sobre ar desce 1 PRESERVANDO o id: materializa embaixo antes de limpar a origem", () => {
    const world = createWorld(DIMS);
    setBlock(world, 5, 10, 5, BlockId.Sand);
    expect(fallingRule(world, 5, 10, 5)).toEqual([
      { x: 5, y: 9, z: 5, blockId: BlockId.Sand },
      { x: 5, y: 10, z: 5, blockId: BlockId.Air },
    ]);
    setBlock(world, 3, 10, 3, BlockId.Gravel);
    expect(fallingRule(world, 3, 10, 3)).toEqual([
      { x: 3, y: 9, z: 3, blockId: BlockId.Gravel },
      { x: 3, y: 10, z: 3, blockId: BlockId.Air },
    ]);
  });

  it("bloco sobre sólido não faz nada", () => {
    const world = createWorld(DIMS);
    setBlock(world, 5, 9, 5, BlockId.Stone);
    setBlock(world, 5, 10, 5, BlockId.Sand);
    expect(fallingRule(world, 5, 10, 5)).toBeNull();
  });

  it("bloco no fundo do mundo (y=0) não cai pro vazio", () => {
    const world = createWorld(DIMS);
    setBlock(world, 5, 0, 5, BlockId.Sand);
    expect(fallingRule(world, 5, 0, 5)).toBeNull();
  });

  it("tapete (12 cores): atravessável, precisa de apoio e evapora sem cubo embaixo", () => {
    for (let id = BlockId.TapeteBranco; id <= BlockId.TapeteMarrom; id++) {
      expect(isTapete(id)).toBe(true);
      expect(isSolidBlock(id)).toBe(false);
      expect(precisaApoio(id)).toBe(true);
      expect(ruleFor(id)).toBe(torchRule); // mesma regra de apoio da tocha
    }
    const world = createWorld(DIMS);
    setBlock(world, 5, 9, 5, BlockId.Stone);
    setBlock(world, 5, 10, 5, BlockId.TapeteVermelho);
    expect(torchRule(world, 5, 10, 5)).toBeNull(); // apoiado: fica
    setBlock(world, 5, 9, 5, BlockId.Air);
    expect(torchRule(world, 5, 10, 5)).toEqual([
      { x: 5, y: 10, z: 5, blockId: BlockId.Air }, // perdeu o apoio: some
    ]);
  });
});
