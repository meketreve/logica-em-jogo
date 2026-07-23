import { ATLAS, ITEM_BALDE_AGUA, blockIconTile, isBalde } from "@logica/shared";

/** Ícone procedural do balde (item, não tem tile no atlas): balde cinza em
 *  perspectiva; se cheio, água azul dentro. Desenhado na resolução do tile. */
function drawBalde(ctx: CanvasRenderingContext2D, px: number, cheio: boolean): void {
  ctx.clearRect(0, 0, px, px);
  const topY = px * 0.28;
  const botY = px * 0.82;
  const topL = px * 0.2;
  const topR = px * 0.8;
  const botL = px * 0.32;
  const botR = px * 0.68;
  if (cheio) {
    // água: da borda de cima pra dentro do balde
    ctx.fillStyle = "#2e6fd6";
    ctx.beginPath();
    ctx.moveTo(topL + px * 0.03, topY + px * 0.03);
    ctx.lineTo(topR - px * 0.03, topY + px * 0.03);
    ctx.lineTo(botR, botY);
    ctx.lineTo(botL, botY);
    ctx.closePath();
    ctx.fill();
  }
  // corpo do balde (trapézio), traço grosso
  ctx.strokeStyle = "#4a4a52";
  ctx.fillStyle = cheio ? "rgba(120,124,132,0.35)" : "#9a9ea8";
  ctx.lineWidth = Math.max(1, px * 0.06);
  ctx.beginPath();
  ctx.moveTo(topL, topY);
  ctx.lineTo(topR, topY);
  ctx.lineTo(botR, botY);
  ctx.lineTo(botL, botY);
  ctx.closePath();
  if (!cheio) ctx.fill();
  ctx.stroke();
  // alça
  ctx.beginPath();
  ctx.arc(px * 0.5, topY, (topR - topL) / 2, Math.PI, 2 * Math.PI);
  ctx.stroke();
}

/**
 * Ícones 2D dos blocos pra hotbar e pro inventário: recorta o tile LATERAL do
 * mesmo canvas do texture atlas (procedural — sem assets externos, regra do
 * projeto) e vira data URL. Gerado uma vez por partida; CSS amplia com
 * image-rendering: pixelated.
 */
export function makeBlockIcons(
  atlas: HTMLCanvasElement,
  ids: readonly number[],
): Map<number, string> {
  const px = ATLAS.tilePx;
  const out = new Map<number, string>();
  const c = document.createElement("canvas");
  c.width = px;
  c.height = px;
  const ctx = c.getContext("2d");
  if (!ctx) return out;
  for (const id of ids) {
    if (isBalde(id)) {
      drawBalde(ctx, px, id === ITEM_BALDE_AGUA); // item: ícone desenhado
      out.set(id, c.toDataURL());
      continue;
    }
    const tile = blockIconTile(id);
    const sx = (tile % ATLAS.tilesPerRow) * px;
    const sy = ((tile / ATLAS.tilesPerRow) | 0) * px;
    ctx.clearRect(0, 0, px, px);
    ctx.drawImage(atlas, sx, sy, px, px, 0, 0, px, px);
    out.set(id, c.toDataURL());
  }
  return out;
}
