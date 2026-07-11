import { BlockId } from "./blocks";
import { DEFAULT_WORLD_CHUNKS } from "./constants";
import { type World, type WorldDims, createWorld, setBlock } from "./world";

/**
 * Geração de terreno determinística (mesma seed = mesmos bytes em qualquer
 * hospedeiro — requisito para snapshot/save binário e testes).
 * Value noise com hash inteiro; nada de Math.random.
 */

function hash2(ix: number, iz: number, seed: number): number {
  let h = seed ^ Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Value noise 2D em [0,1). */
function valueNoise2(x: number, z: number, seed: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const sx = smooth(x - ix);
  const sz = smooth(z - iz);
  const v00 = hash2(ix, iz, seed);
  const v10 = hash2(ix + 1, iz, seed);
  const v01 = hash2(ix, iz + 1, seed);
  const v11 = hash2(ix + 1, iz + 1, seed);
  const a = v00 + (v10 - v00) * sx;
  const b = v01 + (v11 - v01) * sx;
  return a + (b - a) * sz;
}

/** Altura do terreno (y do bloco de topo) na coluna (x,z). */
export function heightAt(x: number, z: number, seed: number): number {
  const n1 = valueNoise2(x / 24, z / 24, seed);
  const n2 = valueNoise2(x / 7, z / 7, seed ^ 0x9e3779b9);
  return Math.floor(16 + n1 * 12 + n2 * 4);
}

/** Abaixo (ou igual) a esta altura o topo vira areia — cria "praias" nas partes baixas. */
export const SAND_HEIGHT = 18;

export function generateWorld(dims: WorldDims = DEFAULT_WORLD_CHUNKS, seed = 1): World {
  const world = createWorld(dims);
  for (let x = 0; x < world.sizeX; x++) {
    for (let z = 0; z < world.sizeZ; z++) {
      const h = Math.min(heightAt(x, z, seed), world.sizeY - 2);
      for (let y = 0; y < h; y++) setBlock(world, x, y, z, BlockId.Stone);
      setBlock(world, x, h, z, h <= SAND_HEIGHT ? BlockId.Sand : BlockId.Grass);
    }
  }
  return world;
}
