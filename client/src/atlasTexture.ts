import * as THREE from "three";
import { ATLAS, TILE } from "@logica/shared";

/**
 * Texture atlas procedural pintado num canvas (sem assets externos — restrição
 * de licença do projeto). Segue o layout ATLAS/TILE definido em /shared: o
 * mesher gera UVs para ESTE grid.
 */

/** Hash determinístico por pixel — textura idêntica a cada load (sem Math.random). */
function pixelHash(x: number, y: number, salt: number): number {
  let h = salt ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

type Rgb = readonly [number, number, number];

function paintNoise(
  ctx: CanvasRenderingContext2D,
  tile: number,
  base: Rgb,
  vary: number,
  yStart: number = 0,
  yEnd: number = ATLAS.tilePx,
): void {
  const px = ATLAS.tilePx;
  const ox = (tile % ATLAS.tilesPerRow) * px;
  const oy = ((tile / ATLAS.tilesPerRow) | 0) * px;
  for (let y = yStart; y < yEnd; y++) {
    for (let x = 0; x < px; x++) {
      const v = (pixelHash(x, y, tile * 7919 + 1) - 0.5) * 2 * vary;
      const r = Math.round(base[0] + v);
      const g = Math.round(base[1] + v);
      const b = Math.round(base[2] + v);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

/** Linhas de "argamassa" escuras por cima do ruído de pedra. */
function paintCobbleCracks(ctx: CanvasRenderingContext2D, tile: number): void {
  const px = ATLAS.tilePx;
  const ox = (tile % ATLAS.tilesPerRow) * px;
  const oy = ((tile / ATLAS.tilesPerRow) | 0) * px;
  ctx.fillStyle = "rgb(72,72,72)";
  for (let i = 0; i < px; i++) {
    ctx.fillRect(ox + i, oy + (i % 2 === 0 ? 4 : 5), 1, 1);
    ctx.fillRect(ox + i, oy + (i % 3 === 0 ? 11 : 10), 1, 1);
    ctx.fillRect(ox + (i % 2 === 0 ? 7 : 8), oy + i, 1, 1);
  }
}

export function createAtlasTexture(): THREE.Texture {
  const size = ATLAS.tilesPerRow * ATLAS.tilePx;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d indisponível");

  paintNoise(ctx, TILE.grassTop, [92, 158, 60], 14);
  // grassSide: terra com faixa de grama nos 4px de cima
  paintNoise(ctx, TILE.grassSide, [121, 88, 58], 12);
  paintNoise(ctx, TILE.grassSide, [92, 158, 60], 14, 0, 4);
  paintNoise(ctx, TILE.dirt, [121, 88, 58], 12);
  paintNoise(ctx, TILE.stone, [136, 136, 136], 12);
  paintNoise(ctx, TILE.cobblestone, [120, 120, 120], 20);
  paintCobbleCracks(ctx, TILE.cobblestone);
  paintNoise(ctx, TILE.sand, [219, 207, 142], 10);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
