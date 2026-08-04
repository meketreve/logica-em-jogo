import {
  ATLAS,
  BlockId,
  ITEM_BALDE_AGUA,
  ITEM_FRUTA,
  ITEM_TRIGO,
  blockIconTile,
  isBalde,
  isComida,
} from "@logica/shared";

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
 * Comida (§🍖 F6): ícone desenhado, como o do balde — item não tem tile no
 * atlas (não é bloco, nunca vira face de cubo). Três formas bem diferentes de
 * longe, que é o que o aluno de 2º ano precisa pra achar o que comer na barra:
 * bolinha vermelha, feixe dourado, pão marrom.
 */
function drawComida(ctx: CanvasRenderingContext2D, px: number, id: number): void {
  ctx.clearRect(0, 0, px, px);
  if (id === ITEM_FRUTA) {
    ctx.fillStyle = "#c8322c";
    ctx.beginPath();
    ctx.arc(px * 0.5, px * 0.58, px * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8c1f1c"; // sombra do lado direito (dá volume)
    ctx.fillRect(px * 0.62, px * 0.42, px * 0.1, px * 0.3);
    ctx.strokeStyle = "#5a3a1e"; // cabinho
    ctx.lineWidth = Math.max(1, px * 0.07);
    ctx.beginPath();
    ctx.moveTo(px * 0.5, px * 0.3);
    ctx.lineTo(px * 0.56, px * 0.14);
    ctx.stroke();
    ctx.fillStyle = "#4a8c3a"; // folhinha
    ctx.fillRect(px * 0.56, px * 0.14, px * 0.22, px * 0.1);
    return;
  }
  if (id === ITEM_TRIGO) {
    ctx.strokeStyle = "#b8912e";
    ctx.lineWidth = Math.max(1, px * 0.09);
    for (const dx of [-0.16, 0, 0.16]) {
      ctx.beginPath();
      ctx.moveTo(px * (0.5 + dx * 0.4), px * 0.9);
      ctx.lineTo(px * (0.5 + dx), px * 0.16);
      ctx.stroke();
    }
    ctx.fillStyle = "#e6c458"; // grãos
    for (const dx of [-0.16, 0, 0.16]) {
      ctx.fillRect(px * (0.5 + dx) - px * 0.11, px * 0.14, px * 0.22, px * 0.26);
    }
    return;
  }
  // pão: pãozinho oval com dois cortes claros em cima
  ctx.fillStyle = "#b5762f";
  ctx.beginPath();
  ctx.ellipse(px * 0.5, px * 0.54, px * 0.36, px * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d9a45c"; // cortes da casca
  for (const dx of [-0.14, 0.08]) {
    ctx.fillRect(px * (0.5 + dx), px * 0.4, px * 0.1, px * 0.16);
  }
}

/**
 * Semente (§🍖 F6): o ícone do estágio 0 NÃO é o tile do bloco. O broto tem 4
 * px de 16 e sai quase invisível num slot de hotbar — e o que o aluno carrega
 * na mochila não é um broto, é um punhado de semente. O bloco no mundo continua
 * sendo o broto; aqui é só o retrato dele na bolsa.
 */
function drawSemente(ctx: CanvasRenderingContext2D, px: number): void {
  ctx.clearRect(0, 0, px, px);
  const GRAOS: readonly [number, number][] = [
    [0.32, 0.4], [0.6, 0.34], [0.46, 0.58], [0.28, 0.68], [0.66, 0.64],
  ];
  for (const [gx, gy] of GRAOS) {
    ctx.fillStyle = "#8a6b32";
    ctx.beginPath();
    ctx.ellipse(px * gx, px * gy, px * 0.11, px * 0.16, Math.PI / 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c8a558"; // brilho: sem ele os grãos viram uma mancha só
    ctx.fillRect(px * gx - px * 0.04, px * gy - px * 0.1, px * 0.05, px * 0.1);
  }
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
    if (id === BlockId.Plantacao0) {
      drawSemente(ctx, px);
      out.set(id, c.toDataURL());
      continue;
    }
    if (isComida(id) || id === ITEM_TRIGO) {
      drawComida(ctx, px, id); // §🍖 F6: idem — o trigo entra porque é da família
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
