import { ATLAS, blockIconTile } from "@logica/shared";

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
    const tile = blockIconTile(id);
    const sx = (tile % ATLAS.tilesPerRow) * px;
    const sy = ((tile / ATLAS.tilesPerRow) | 0) * px;
    ctx.clearRect(0, 0, px, px);
    ctx.drawImage(atlas, sx, sy, px, px, 0, 0, px, px);
    out.set(id, c.toDataURL());
  }
  return out;
}
