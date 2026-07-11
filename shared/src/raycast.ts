import { BlockId } from "./blocks";
import { type World, getBlock } from "./world";

/**
 * Raycast de voxel (DDA de Amanatides-Woo): anda célula a célula do grid até
 * achar bloco sólido. Função PURA em /shared — o cliente usa pra MIRAR
 * (só visual); o servidor pode reusar depois pra validar linha de visão.
 */

export interface RayHit {
  /** Bloco sólido atingido (coordenadas inteiras de mundo). */
  x: number;
  y: number;
  z: number;
  /**
   * Normal da face por onde o raio ENTROU (aponta pra fora do bloco).
   * Célula onde colocar bloco = hit + normal. Origem dentro de bloco
   * sólido devolve normal (0,0,0) — não há face de entrada.
   */
  nx: number;
  ny: number;
  nz: number;
}

export function raycastBlock(
  world: World,
  ox: number,
  oy: number,
  oz: number,
  dx: number,
  dy: number,
  dz: number,
  maxDist: number,
): RayHit | null {
  const len = Math.hypot(dx, dy, dz);
  if (len === 0 || !Number.isFinite(len)) return null;
  dx /= len;
  dy /= len;
  dz /= len;

  let x = Math.floor(ox);
  let y = Math.floor(oy);
  let z = Math.floor(oz);

  const stepX = dx > 0 ? 1 : -1;
  const stepY = dy > 0 ? 1 : -1;
  const stepZ = dz > 0 ? 1 : -1;

  // t que o raio gasta pra atravessar 1 célula em cada eixo
  const tDeltaX = dx !== 0 ? Math.abs(1 / dx) : Infinity;
  const tDeltaY = dy !== 0 ? Math.abs(1 / dy) : Infinity;
  const tDeltaZ = dz !== 0 ? Math.abs(1 / dz) : Infinity;

  // t até a PRIMEIRA fronteira de célula em cada eixo
  let tMaxX = dx !== 0 ? (dx > 0 ? x + 1 - ox : ox - x) * tDeltaX : Infinity;
  let tMaxY = dy !== 0 ? (dy > 0 ? y + 1 - oy : oy - y) * tDeltaY : Infinity;
  let tMaxZ = dz !== 0 ? (dz > 0 ? z + 1 - oz : oz - z) * tDeltaZ : Infinity;

  let nx = 0;
  let ny = 0;
  let nz = 0;
  let t = 0;

  while (t <= maxDist) {
    if (getBlock(world, x, y, z) !== BlockId.Air) return { x, y, z, nx, ny, nz };
    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      x += stepX;
      t = tMaxX;
      tMaxX += tDeltaX;
      nx = -stepX; ny = 0; nz = 0;
    } else if (tMaxY < tMaxZ) {
      y += stepY;
      t = tMaxY;
      tMaxY += tDeltaY;
      nx = 0; ny = -stepY; nz = 0;
    } else {
      z += stepZ;
      t = tMaxZ;
      tMaxZ += tDeltaZ;
      nx = 0; ny = 0; nz = -stepZ;
    }
  }
  return null;
}
