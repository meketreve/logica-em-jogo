import { BlockId } from "./blocks";
import { CHUNK_SIZE, CHUNK_VOLUME } from "./constants";

/** Dimensões do mundo em chunks. Parâmetro de criação, gravado no header do save/snapshot. */
export interface WorldDims {
  readonly x: number;
  readonly z: number;
  readonly y: number;
}

/**
 * Mundo voxel: grade de chunks, cada chunk um Uint8Array plano (1 byte por
 * bloco). Estrutura AUTORITATIVA — vive em /shared e roda igual no cliente,
 * no Web Worker e no Node.
 *
 * ESPARSO (2026-07-20, obra do streaming): o array de chunks é DENSO DE
 * REFERÊNCIAS mas cada slot pode ser undefined = chunk ainda não gerado.
 * Indexação segue O(1) (hot paths de mesher/física intocados; 4096² de mundo
 * = 4 MB de ponteiros). getBlock em chunk ausente devolve ar; setBlock
 * ignora — mesmo contrato que já valia fora dos limites.
 */
export interface World {
  readonly dims: WorldDims;
  /** Tamanho em blocos (dims × CHUNK_SIZE). */
  readonly sizeX: number;
  readonly sizeY: number;
  readonly sizeZ: number;
  /** Chunks indexados por chunkIndex(); undefined = não gerado ainda. */
  readonly chunks: (Uint8Array | undefined)[];
}

/** `alocar=false` cria o mundo VAZIO (todo slot undefined) pra geração
 *  preguiçosa por coluna — alocarColuna() materializa sob demanda. */
export function createWorld(dims: WorldDims, alocar = true): World {
  const count = dims.x * dims.y * dims.z;
  const chunks: (Uint8Array | undefined)[] = new Array(count);
  if (alocar) for (let i = 0; i < count; i++) chunks[i] = new Uint8Array(CHUNK_VOLUME);
  return {
    dims,
    sizeX: dims.x * CHUNK_SIZE,
    sizeY: dims.y * CHUNK_SIZE,
    sizeZ: dims.z * CHUNK_SIZE,
    chunks,
  };
}

/** A coluna de chunks (cx,cz) já foi materializada? (os chunks Y de uma
 *  coluna nascem SEMPRE juntos — cy=0 existir prova a coluna inteira). */
export function colunaGerada(world: World, cx: number, cz: number): boolean {
  return world.chunks[chunkIndex(world, cx, 0, cz)] !== undefined;
}

/** Aloca (zerada) a coluna de chunks (cx,cz) inteira — todos os cy. */
export function alocarColuna(world: World, cx: number, cz: number): void {
  for (let cy = 0; cy < world.dims.y; cy++) {
    const i = chunkIndex(world, cx, cy, cz);
    if (!world.chunks[i]) world.chunks[i] = new Uint8Array(CHUNK_VOLUME);
  }
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
