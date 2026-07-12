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

/** Canto superior-esquerdo do tile no canvas. */
function tileOrigin(tile: number): [number, number] {
  const px = ATLAS.tilePx;
  return [(tile % ATLAS.tilesPerRow) * px, ((tile / ATLAS.tilesPerRow) | 0) * px];
}

/** Tronco (lado): estrias verticais de casca por cima do ruído marrom. */
function paintLogStripes(ctx: CanvasRenderingContext2D, tile: number): void {
  const [ox, oy] = tileOrigin(tile);
  ctx.fillStyle = "rgb(74,54,34)";
  for (let x = 1; x < ATLAS.tilePx; x += 4) {
    for (let y = 0; y < ATLAS.tilePx; y++) {
      if (pixelHash(x, y, tile * 31 + 3) < 0.8) ctx.fillRect(ox + x, oy + y, 1, y === 0 ? 2 : 1);
    }
  }
}

/** Tronco (topo): anéis concêntricos sobre a madeira clara. */
function paintLogRings(ctx: CanvasRenderingContext2D, tile: number): void {
  const [ox, oy] = tileOrigin(tile);
  const c = ATLAS.tilePx / 2 - 0.5;
  ctx.fillStyle = "rgb(120,90,52)";
  for (let y = 0; y < ATLAS.tilePx; y++) {
    for (let x = 0; x < ATLAS.tilePx; x++) {
      const d = Math.hypot(x - c, y - c);
      if (Math.round(d) % 3 === 0 && d < 7.5) ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

/** Tábuas: sulcos horizontais a cada 4px + emendas verticais alternadas. */
function paintPlankLines(ctx: CanvasRenderingContext2D, tile: number): void {
  const [ox, oy] = tileOrigin(tile);
  ctx.fillStyle = "rgb(122,92,56)";
  for (let y = 3; y < ATLAS.tilePx; y += 4) ctx.fillRect(ox, oy + y, ATLAS.tilePx, 1);
  for (let row = 0; row < 4; row++) {
    ctx.fillRect(ox + (row % 2 === 0 ? 4 : 11), oy + row * 4, 1, 3);
  }
}

/** Tijolos: fiadas de 4px com juntas verticais desencontradas sobre argamassa. */
function paintBricks(ctx: CanvasRenderingContext2D, tile: number): void {
  const [ox, oy] = tileOrigin(tile);
  for (let row = 0; row < 4; row++) {
    for (let x = 0; x < ATLAS.tilePx; x++) {
      const shifted = (x + (row % 2 === 0 ? 0 : 4)) % 8;
      for (let y = 0; y < 3; y++) {
        if (shifted === 7) continue; // junta vertical fica com a argamassa de fundo
        const v = (pixelHash(x, row * 4 + y, tile * 53 + 9) - 0.5) * 20;
        ctx.fillStyle = `rgb(${Math.round(158 + v)},${Math.round(64 + v)},${Math.round(52 + v)})`;
        ctx.fillRect(ox + x, oy + row * 4 + y, 1, 1);
      }
    }
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

  // Grupo A (2026-07-11)
  paintNoise(ctx, TILE.logSide, [104, 78, 48], 10);
  paintLogStripes(ctx, TILE.logSide);
  paintNoise(ctx, TILE.logTop, [168, 132, 82], 8);
  paintLogRings(ctx, TILE.logTop);
  paintNoise(ctx, TILE.planks, [172, 136, 86], 8);
  paintPlankLines(ctx, TILE.planks);
  paintNoise(ctx, TILE.brick, [186, 180, 172], 8); // argamassa de fundo…
  paintBricks(ctx, TILE.brick); // …tijolos por cima
  paintNoise(ctx, TILE.gravel, [112, 106, 100], 30);
  paintNoise(ctx, TILE.bedrock, [42, 42, 46], 24);
  // lãs: cor forte + ruído sutil (leitura clara à distância — pedagogia de sequência)
  paintNoise(ctx, TILE.woolWhite, [232, 232, 230], 6);
  paintNoise(ctx, TILE.woolBlack, [38, 38, 42], 6);
  paintNoise(ctx, TILE.woolRed, [196, 52, 46], 8);
  paintNoise(ctx, TILE.woolOrange, [226, 132, 38], 8);
  paintNoise(ctx, TILE.woolYellow, [232, 206, 58], 8);
  paintNoise(ctx, TILE.woolGreen, [74, 164, 62], 8);
  paintNoise(ctx, TILE.woolBlue, [58, 94, 194], 8);
  paintNoise(ctx, TILE.woolPurple, [142, 72, 182], 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
