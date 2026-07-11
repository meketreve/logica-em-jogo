import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { raycastBlock } from "./raycast";
import { createWorld, setBlock } from "./world";

const DIMS = { x: 1, z: 1, y: 1 };

/** Mundo 16³ com chão sólido em y ∈ [0,7]. */
function floorWorld() {
  const world = createWorld(DIMS);
  for (let x = 0; x < 16; x++)
    for (let z = 0; z < 16; z++)
      for (let y = 0; y < 8; y++) setBlock(world, x, y, z, BlockId.Stone);
  return world;
}

describe("raycastBlock (DDA de voxel)", () => {
  it("olhando pra baixo acerta o topo do chão com normal +Y", () => {
    const hit = raycastBlock(floorWorld(), 4.5, 12.5, 4.5, 0, -1, 0, 10);
    expect(hit).toEqual({ x: 4, y: 7, z: 4, nx: 0, ny: 1, nz: 0 });
  });

  it("olhando pro céu não acerta nada", () => {
    expect(raycastBlock(floorWorld(), 4.5, 12.5, 4.5, 0, 1, 0, 10)).toBeNull();
  });

  it("acerta parede lateral com a normal da face de entrada", () => {
    const world = floorWorld();
    setBlock(world, 8, 10, 4, BlockId.Cobblestone);
    const hit = raycastBlock(world, 4.5, 10.5, 4.5, 1, 0, 0, 10);
    expect(hit).toEqual({ x: 8, y: 10, z: 4, nx: -1, ny: 0, nz: 0 });
    const hitBack = raycastBlock(world, 12.5, 10.5, 4.5, -1, 0, 0, 10);
    expect(hitBack).toEqual({ x: 8, y: 10, z: 4, nx: 1, ny: 0, nz: 0 });
  });

  it("respeita maxDist", () => {
    expect(raycastBlock(floorWorld(), 4.5, 12.5, 4.5, 0, -1, 0, 3)).toBeNull();
  });

  it("origem dentro de bloco sólido devolve o próprio bloco com normal zero", () => {
    const hit = raycastBlock(floorWorld(), 4.5, 4.5, 4.5, 0, -1, 0, 10);
    expect(hit).toEqual({ x: 4, y: 4, z: 4, nx: 0, ny: 0, nz: 0 });
  });

  it("direção zero devolve null", () => {
    expect(raycastBlock(floorWorld(), 4.5, 12.5, 4.5, 0, 0, 0, 10)).toBeNull();
  });

  it("raio diagonal atravessa o ar e para no primeiro sólido", () => {
    const hit = raycastBlock(floorWorld(), 2.5, 9.5, 2.5, 1, -0.5, 1, 20);
    expect(hit).not.toBeNull();
    // primeiro bloco sólido é topo do chão (y=7), vindo de cima
    expect(hit?.y).toBe(7);
    expect(hit?.ny).toBe(1);
  });
});
