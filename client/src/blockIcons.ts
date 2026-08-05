import {
  ATLAS,
  BlockId,
  ITEM_BALDE_AGUA,
  ITEM_ALGODAO,
  ITEM_CARVAO,
  ITEM_CARVAO_VEGETAL,
  ITEM_DIAMANTE,
  ITEM_FRUTA,
  ITEM_GRAVETO,
  ITEM_LINGOTE_FERRO,
  ITEM_LINGOTE_OURO,
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
function drawSemente(ctx: CanvasRenderingContext2D, px: number, algodao = false): void {
  ctx.clearRect(0, 0, px, px);
  const GRAOS: readonly [number, number][] = [
    [0.32, 0.4], [0.6, 0.34], [0.46, 0.58], [0.28, 0.68], [0.66, 0.64],
  ];
  for (const [gx, gy] of GRAOS) {
    // §🍖 F10c: a semente do algodão é a MESMA forma num tom claro — duas
    // sementes iguais na mochila seriam duas chances de plantar a errada.
    ctx.fillStyle = algodao ? "#6d7a4a" : "#8a6b32";
    ctx.beginPath();
    ctx.ellipse(px * gx, px * gy, px * 0.11, px * 0.16, Math.PI / 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = algodao ? "#b6c489" : "#c8a558"; // brilho: sem ele os grãos viram uma mancha só
    ctx.fillRect(px * gx - px * 0.04, px * gy - px * 0.1, px * 0.05, px * 0.1);
  }
}

/**
 * §🍖 F10: os itens da fundição. Mesma disciplina do balde e da comida — item
 * não tem tile no atlas, e o ícone é desenhado. O critério continua sendo a
 * leitura DE LONGE num slot de hotbar de aparelho de escola: uma pedra preta,
 * uma gema azul e um pauzinho marrom não se confundem nem com o rabo do olho.
 */
function drawItemF10(ctx: CanvasRenderingContext2D, px: number, id: number): void {
  ctx.clearRect(0, 0, px, px);
  if (id === ITEM_GRAVETO) {
    // gravetinho na diagonal, com dois nós — sem os nós vira um risco
    ctx.strokeStyle = "#7a5426";
    ctx.lineWidth = Math.max(1, px * 0.14);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(px * 0.26, px * 0.82);
    ctx.lineTo(px * 0.74, px * 0.2);
    ctx.stroke();
    ctx.fillStyle = "#9c6d33";
    ctx.fillRect(px * 0.4, px * 0.5, px * 0.12, px * 0.12);
    ctx.fillRect(px * 0.56, px * 0.3, px * 0.1, px * 0.1);
    return;
  }
  if (id === ITEM_DIAMANTE) {
    // gema em losango com faceta clara em cima (o brilho é o que a identifica)
    ctx.fillStyle = "#3fc9d6";
    ctx.beginPath();
    ctx.moveTo(px * 0.5, px * 0.16);
    ctx.lineTo(px * 0.84, px * 0.5);
    ctx.lineTo(px * 0.5, px * 0.84);
    ctx.lineTo(px * 0.16, px * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#a8f0f6";
    ctx.beginPath();
    ctx.moveTo(px * 0.5, px * 0.2);
    ctx.lineTo(px * 0.72, px * 0.46);
    ctx.lineTo(px * 0.5, px * 0.5);
    ctx.closePath();
    ctx.fill();
    return;
  }
  if (id === ITEM_LINGOTE_FERRO || id === ITEM_LINGOTE_OURO) {
    // lingote: barra em perspectiva (topo menor que a base). Ferro é cinza,
    // ouro é dourado — a MESMA forma, porque o que muda é o metal
    const ouro = id === ITEM_LINGOTE_OURO;
    ctx.fillStyle = ouro ? "#d8a72c" : "#b9bcc4";
    ctx.beginPath();
    ctx.moveTo(px * 0.3, px * 0.42);
    ctx.lineTo(px * 0.7, px * 0.42);
    ctx.lineTo(px * 0.82, px * 0.68);
    ctx.lineTo(px * 0.18, px * 0.68);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ouro ? "#f6dc7a" : "#e2e5ec"; // topo iluminado: dá o volume
    ctx.beginPath();
    ctx.moveTo(px * 0.3, px * 0.42);
    ctx.lineTo(px * 0.7, px * 0.42);
    ctx.lineTo(px * 0.66, px * 0.5);
    ctx.lineTo(px * 0.34, px * 0.5);
    ctx.closePath();
    ctx.fill();
    return;
  }
  if (id === ITEM_ALGODAO) {
    // capulho: três bolotas brancas com sombra e um cabinho seco
    ctx.strokeStyle = "#8a7d52";
    ctx.lineWidth = Math.max(1, px * 0.08);
    ctx.beginPath();
    ctx.moveTo(px * 0.5, px * 0.86);
    ctx.lineTo(px * 0.5, px * 0.56);
    ctx.stroke();
    for (const [cx, cy, r] of [[0.5, 0.36, 0.22], [0.31, 0.5, 0.17], [0.69, 0.5, 0.17]] as const) {
      ctx.fillStyle = "#f4f4ee";
      ctx.beginPath();
      ctx.arc(px * cx, px * cy, px * r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#cccdc6"; // sombra: sem ela o capulho some no fundo claro
      ctx.fillRect(px * (cx + r * 0.3), px * (cy + r * 0.1), px * r * 0.5, px * r * 0.6);
    }
    return;
  }
  // carvão (mineral ou vegetal): pedra preta irregular. O vegetal é o MESMO
  // desenho num marrom queimado — são a mesma brasa, e o aluno tem de ver isso.
  const vegetal = id === ITEM_CARVAO_VEGETAL;
  ctx.fillStyle = vegetal ? "#4a3524" : "#26262a";
  ctx.beginPath();
  ctx.moveTo(px * 0.22, px * 0.44);
  ctx.lineTo(px * 0.42, px * 0.2);
  ctx.lineTo(px * 0.76, px * 0.3);
  ctx.lineTo(px * 0.82, px * 0.62);
  ctx.lineTo(px * 0.56, px * 0.82);
  ctx.lineTo(px * 0.26, px * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = vegetal ? "#6d5136" : "#46464e"; // faceta: sem ela é um borrão
  ctx.beginPath();
  ctx.moveTo(px * 0.4, px * 0.28);
  ctx.lineTo(px * 0.66, px * 0.36);
  ctx.lineTo(px * 0.5, px * 0.54);
  ctx.closePath();
  ctx.fill();
}

/** Os itens que `drawItemF10` sabe desenhar. Set explícito (e não faixa de id)
 *  pela mesma razão do `ITENS` do shared: a banda ≥900 não é intervalo aberto. */
const ITENS_F10: ReadonlySet<number> = new Set([
  ITEM_CARVAO, ITEM_CARVAO_VEGETAL, ITEM_DIAMANTE, ITEM_GRAVETO,
  ITEM_LINGOTE_FERRO, ITEM_LINGOTE_OURO, ITEM_ALGODAO,
]);

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
    if (id === BlockId.Plantacao0 || id === BlockId.Algodao0) {
      drawSemente(ctx, px, id === BlockId.Algodao0);
      out.set(id, c.toDataURL());
      continue;
    }
    if (isComida(id) || id === ITEM_TRIGO) {
      drawComida(ctx, px, id); // §🍖 F6: idem — o trigo entra porque é da família
      out.set(id, c.toDataURL());
      continue;
    }
    if (ITENS_F10.has(id)) {
      drawItemF10(ctx, px, id);
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
