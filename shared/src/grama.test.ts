import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { grassRule, ruleFor } from "./rules";
import { type World, createWorld, getBlock, setBlock } from "./world";

const DIMS = { x: 1, z: 1, y: 1 }; // 1 chunk = 16³

/** Autômato celular síncrono do water.test.ts — força-bruta da regra. */
function simular(world: World, ticks: number): void {
  const S = 16;
  for (let t = 0; t < ticks; t++) {
    const changes: { x: number; y: number; z: number; blockId: number }[] = [];
    for (let y = 0; y < S; y++) {
      for (let z = 0; z < S; z++) {
        for (let x = 0; x < S; x++) {
          const rule = ruleFor(getBlock(world, x, y, z));
          if (!rule) continue;
          const cs = rule(world, x, y, z);
          if (cs) changes.push(...cs);
        }
      }
    }
    for (const c of changes) setBlock(world, c.x, c.y, c.z, c.blockId);
  }
}

/** Piso de grama na camada y (cubos cheios), com terra `n` células à frente
 *  na MESMA camada e ar em cima — a superfície pronta pra grama avançar. */
function superfice(
  world: World,
  y: number,
  grama: number,
  n: number,
): { first: number; last: number } {
  for (let z = 0; z < 16; z++) {
    for (let x = 0; x < 16; x++) {
      setBlock(world, x, y, z, x < grama ? BlockId.Grass : BlockId.Dirt);
      setBlock(world, x, y + 1, z, BlockId.Air);
    }
  }
  return { first: grama, last: grama + n - 1 };
}

describe("grama espalha (grassRule — regra de vizinhança na grama de ouro)", () => {
  it("as TRÊS gramas usam o grassRule; terra e pedra não", () => {
    for (const id of [BlockId.Grass, BlockId.GramaSeca, BlockId.GramaFria]) {
      expect(ruleFor(id)).toBe(grassRule);
    }
    expect(ruleFor(BlockId.Dirt)).toBeUndefined();
    expect(ruleFor(BlockId.Stone)).toBeUndefined();
  });

  it("grama espalha UM passo por chama: terra logo à frente vira da MESMA variante", () => {
    const world = createWorld(DIMS);
    setBlock(world, 2, 2, 2, BlockId.Grass);
    setBlock(world, 3, 2, 2, BlockId.Dirt); // vizinho leste
    setBlock(world, 3, 3, 2, BlockId.Air); // exposta
    const changes = grassRule(world, 2, 2, 2);
    expect(changes).toEqual([{ x: 3, y: 2, z: 2, blockId: BlockId.Grass }]);
  });

  it("terra com TETO não vira — a grama não desce pro subsolo", () => {
    const world = createWorld(DIMS);
    setBlock(world, 2, 2, 2, BlockId.Grass);
    setBlock(world, 3, 2, 2, BlockId.Dirt);
    setBlock(world, 3, 3, 2, BlockId.Stone); // tampada: subsolo
    expect(grassRule(world, 2, 2, 2)).toBeNull();
  });

  it("cada variante espalha a PRÓPRIA dela (GramaSeca não vira Grass)", () => {
    const world = createWorld(DIMS);
    setBlock(world, 2, 2, 2, BlockId.GramaSeca);
    setBlock(world, 3, 2, 2, BlockId.Dirt);
    setBlock(world, 3, 3, 2, BlockId.Air);
    expect(grassRule(world, 2, 2, 2)).toEqual([
      { x: 3, y: 2, z: 2, blockId: BlockId.GramaSeca },
    ]);
  });

  it("a onda anda com o tempo: uma faixa de terra vira grama célula a célula", () => {
    const world = createWorld(DIMS);
    const { first, last } = superfice(world, 2, 3, 4); // 3 de grama + 4 de terra
    expect(getBlock(world, first, 2, 0)).toBe(BlockId.Dirt);
    simular(world, 4); // um passo por tick: a faixa inteira
    for (let x = first; x <= last; x++) {
      expect(getBlock(world, x, 2, 0)).toBe(BlockId.Grass);
    }
  });

  it("não atravessa sólido que não é terra: a fronteira para no pedregulho", () => {
    const world = createWorld(DIMS);
    superfice(world, 2, 3, 2);
    setBlock(world, 5, 2, 0, BlockId.Cobblestone); // barreira
    simular(world, 4);
    expect(getBlock(world, 4, 2, 0)).toBe(BlockId.Grass); // chegou até a barreira
    expect(getBlock(world, 5, 2, 0)).toBe(BlockId.Cobblestone); // a barreira segue
  });

  it("só os 4 vizinhos HORIZONTAIS — a terra em cima da grama não vira", () => {
    const world = createWorld(DIMS);
    setBlock(world, 2, 2, 2, BlockId.Grass);
    setBlock(world, 2, 3, 2, BlockId.Dirt); // em cima
    setBlock(world, 2, 4, 2, BlockId.Air); // exposta
    expect(grassRule(world, 2, 2, 2)).toBeNull();
  });

  it("Dirt também pega pelos lados NORTE/SUL", () => {
    const world = createWorld(DIMS);
    setBlock(world, 2, 2, 2, BlockId.Grass);
    setBlock(world, 2, 2, 3, BlockId.Dirt);
    setBlock(world, 2, 3, 3, BlockId.Air);
    const changes = grassRule(world, 2, 2, 2);
    expect(changes).toEqual([{ x: 2, y: 2, z: 3, blockId: BlockId.Grass }]);
  });

  it("uma ilha de GRAMA cercada de terra cobre a redondeza", () => {
    const world = createWorld(DIMS);
    // grama no meio, terra nos 4 lados da MESMA camada, ar em cima
    setBlock(world, 2, 2, 2, BlockId.Grass);
    for (const d of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const [dx, dz] = d;
      setBlock(world, 2 + dx, 2, 2 + dz, BlockId.Dirt);
      setBlock(world, 2 + dx, 3, 2 + dz, BlockId.Air);
    }
    const changes = grassRule(world, 2, 2, 2);
    expect(changes).toHaveLength(4);
    for (const c of changes!) expect(c.blockId).toBe(BlockId.Grass);
  });
});