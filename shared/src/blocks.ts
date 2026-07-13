/**
 * IDs de bloco. Gravados como bytes crus nos chunks (Uint8Array), no save e no
 * world_snapshot — NUNCA renumerar um ID existente; só adicionar no fim.
 */
export const BlockId = {
  Air: 0,
  Grass: 1,
  Stone: 2,
  Cobblestone: 3,
  Sand: 4,
  // Grupo A (2026-07-11): cubos opacos. Transparentes (vidro/folhas/água) e
  // não-cubos (tocha/laje) ficam pra depois — exigem mudança no mesher.
  Dirt: 5,
  Log: 6,
  Planks: 7,
  Brick: 8,
  Gravel: 9,
  /** Indestrutível pra jogador (professor delimita arena); /bloco passa por cima. */
  Bedrock: 10,
  // 8 lãs coloridas — base da pedagogia de "sequência de blocos coloridos".
  WoolWhite: 11,
  WoolBlack: 12,
  WoolRed: 13,
  WoolOrange: 14,
  WoolYellow: 15,
  WoolGreen: 16,
  WoolBlue: 17,
  WoolPurple: 18,
  // cp17 (2026-07-13): 2º lote de cubos opacos + 4 lãs (sequências mais ricas).
  Sandstone: 19,
  StoneBricks: 20,
  Snow: 21,
  Obsidian: 22,
  WoolPink: 23,
  WoolCyan: 24,
  WoolGray: 25,
  WoolBrown: 26,
  // cp18 (2026-07-13): grupo B — transparentes (cutout/alphaTest no cliente).
  Glass: 27,
  Leaves: 28,
} as const;

export type BlockId = (typeof BlockId)[keyof typeof BlockId];

/** Maior ID válido (mantém isPlaceable sem número mágico ao crescer a lista). */
const MAX_BLOCK_ID = BlockId.Leaves;

/** Bloco transparente (vidro/folhas): NÃO oculta a face do vizinho no mesher.
 *  Continua sólido pra física/raycast — transparência é só visual. */
export function isTransparentBlock(id: number): boolean {
  return id === BlockId.Glass || id === BlockId.Leaves;
}

/** O jogador pode colocar este ID? (qualquer bloco menos ar; valida bytes do fio) */
export function isPlaceable(id: number): boolean {
  return Number.isInteger(id) && id >= BlockId.Grass && id <= MAX_BLOCK_ID;
}

/** O jogador pode quebrar este ID? Bedrock não — só o comando /bloco remove. */
export function isBreakable(id: number): boolean {
  return id !== BlockId.Bedrock;
}
