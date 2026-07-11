import { BlockId } from "./blocks";
import { CHUNK_SIZE, CHUNK_VOLUME } from "./constants";

/** Dimensões do mundo em chunks. Parâmetro de criação, gravado no header do save/snapshot. */
export interface WorldDims {
  readonly x: number;
  readonly z: number;
  readonly y: number;
}

/**
 * Mundo voxel: grade densa de chunks, cada chunk um Uint8Array plano
 * (1 byte por bloco). Estrutura AUTORITATIVA — vive em /shared e roda
 * igual no cliente, no Web Worker e no Node.
 */
export interface World {
  readonly dims: WorldDims;
  /** Tamanho em blocos (dims × CHUNK_SIZE). */
  readonly sizeX: number;
  readonly sizeY: number;
  readonly sizeZ: number;
  /** Chunks indexados por chunkIndex(). */
  readonly chunks: Uint8Array[];
}

export function createWorld(dims: WorldDims): World {
  const count = dims.x * dims.y * dims.z;
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < count; i++) chunks.push(new Uint8Array(CHUNK_VOLUME));
  return {
    dims,
    sizeX: dims.x * CHUNK_SIZE,
    sizeY: dims.y * CHUNK_SIZE,
    sizeZ: dims.z * CHUNK_SIZE,
    chunks,
  };
}

/** Índice do chunk (cx,cy,cz) dentro de world.chunks. */
export function chunkIndex(world: World, cx: number, cy: number, cz: number): number {
  return (cy * world.dims.z + cz) * world.dims.x + cx;
}

/** Índice do bloco (coordenadas locais 0..CHUNK_SIZE-1) dentro do Uint8Array do chunk. */
export function blockIndex(lx: number, ly: number, lz: number): number {
  return (ly * CHUNK_SIZE + lz) * CHUNK_SIZE + lx;
}

export function inBounds(world: World, x: number, y: number, z: number): boolean {
  return (
    x >= 0 && y >= 0 && z >= 0 && x < world.sizeX && y < world.sizeY && z < world.sizeZ
  );
}

/** Bloco em coordenadas de mundo. Fora dos limites = Air. */
export function getBlock(world: World, x: number, y: number, z: number): number {
  if (!inBounds(world, x, y, z)) return BlockId.Air;
  const cx = (x / CHUNK_SIZE) | 0;
  const cy = (y / CHUNK_SIZE) | 0;
  const cz = (z / CHUNK_SIZE) | 0;
  const chunk = world.chunks[chunkIndex(world, cx, cy, cz)];
  if (!chunk) return BlockId.Air;
  return chunk[blockIndex(x - cx * CHUNK_SIZE, y - cy * CHUNK_SIZE, z - cz * CHUNK_SIZE)] ?? BlockId.Air;
}

/** Escreve bloco em coordenadas de mundo. Fora dos limites: ignora. */
export function setBlock(world: World, x: number, y: number, z: number, id: number): void {
  if (!inBounds(world, x, y, z)) return;
  const cx = (x / CHUNK_SIZE) | 0;
  const cy = (y / CHUNK_SIZE) | 0;
  const cz = (z / CHUNK_SIZE) | 0;
  const chunk = world.chunks[chunkIndex(world, cx, cy, cz)];
  if (!chunk) return;
  chunk[blockIndex(x - cx * CHUNK_SIZE, y - cy * CHUNK_SIZE, z - cz * CHUNK_SIZE)] = id;
}

/** Y dos pés para spawnar: topo do bloco sólido mais alto da coluna (x,z). */
export function findSpawnY(world: World, x: number, z: number): number {
  for (let y = world.sizeY - 1; y >= 0; y--) {
    if (getBlock(world, x, y, z) !== BlockId.Air) return y + 1;
  }
  return 1;
}
