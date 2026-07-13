import { BlockId } from "./blocks";
import { CHUNK_SIZE, DEFAULT_WORLD_CHUNKS } from "./constants";
import { type World, type WorldDims, createWorld, setBlock } from "./world";

/** Preset de criação de mundo (cp14): escolhido no menu/host, só vale pra
 *  mundo NOVO. "plano" e "cabines" são determinísticos (ignoram seed). */
export type WorldPreset = "normal" | "plano" | "cabines";

export function parseWorldPreset(v: unknown): WorldPreset {
  return v === "plano" || v === "cabines" ? v : "normal";
}

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

/** Superfície do mundo plano (o y da grama). */
export const FLAT_SURFACE_Y = 3;

/**
 * Mundo PLANO (cp12, preset pra cenários): rocha-matriz no fundo (aluno não
 * fura o chão do mapa), terra, grama na superfície — resto ar. Determinístico
 * sem seed (plano é plano).
 */
export function generateFlatWorld(dims: WorldDims = DEFAULT_WORLD_CHUNKS): World {
  const world = createWorld(dims);
  for (let x = 0; x < world.sizeX; x++) {
    for (let z = 0; z < world.sizeZ; z++) {
      setBlock(world, x, 0, z, BlockId.Bedrock);
      setBlock(world, x, 1, z, BlockId.Dirt);
      setBlock(world, x, 2, z, BlockId.Dirt);
      setBlock(world, x, FLAT_SURFACE_Y, z, BlockId.Grass);
    }
  }
  return world;
}

/** Lado da cabine em blocos (footprint CABIN_SIZE×CABIN_SIZE no canto do chunk). */
export const CABIN_SIZE = 5;
/** Altura das paredes (2 blocos: aluno não pula pra fora, professor vê por cima ao redor). */
export const CABIN_WALL_HEIGHT = 2;

/**
 * Mundo-modelo "cabines" (cp14): plano + uma cabine de tábuas no canto de CADA
 * chunk, sem teto, com o lado aberto voltado pro centro do chunk. A cabine do
 * professor guarda a sequência-gabarito; os grupos replicam nas deles
 * (marcar com a varinha ou /regiao carimbar). Determinístico, sem seed.
 */
export function generateCabinsWorld(dims: WorldDims = DEFAULT_WORLD_CHUNKS): World {
  const world = generateFlatWorld(dims);
  const y0 = FLAT_SURFACE_Y + 1; // paredes em cima da grama
  for (let cx = 0; cx < dims.x; cx++) {
    for (let cz = 0; cz < dims.z; cz++) {
      const ox = cx * CHUNK_SIZE;
      const oz = cz * CHUNK_SIZE;
      for (let y = y0; y < y0 + CABIN_WALL_HEIGHT; y++) {
        for (let i = 0; i < CABIN_SIZE; i++) {
          setBlock(world, ox, y, oz + i, BlockId.Planks); // parede x=0
          setBlock(world, ox + i, y, oz, BlockId.Planks); // parede z=0
          setBlock(world, ox + i, y, oz + CABIN_SIZE - 1, BlockId.Planks); // parede z=4
          // lado x=4 fica ABERTO — é o que olha pro centro do chunk
        }
      }
    }
  }
  return world;
}

/** Gera o mundo NOVO do preset escolhido (mundo restaurado de save ignora isto). */
export function generateWorldForPreset(
  preset: WorldPreset,
  dims: WorldDims,
  seed: number,
): World {
  if (preset === "plano") return generateFlatWorld(dims);
  if (preset === "cabines") return generateCabinsWorld(dims);
  return generateWorld(dims, seed);
}
