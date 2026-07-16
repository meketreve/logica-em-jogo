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
  // cp20 (2026-07-16): blocos-glifo — letras A–Z e dígitos 0–9. Cubos opacos
  // (mesmo caminho das lãs); pedagogia de soletrar palavras / escrever números.
  // APPEND only: A=29 … Z=54, 0=55 … 9=64. LetterA e Digit0 são as âncoras dos
  // loops que derivam tiles/nomes (ver GLYPH em mesher.ts).
  LetterA: 29, LetterB: 30, LetterC: 31, LetterD: 32, LetterE: 33, LetterF: 34,
  LetterG: 35, LetterH: 36, LetterI: 37, LetterJ: 38, LetterK: 39, LetterL: 40,
  LetterM: 41, LetterN: 42, LetterO: 43, LetterP: 44, LetterQ: 45, LetterR: 46,
  LetterS: 47, LetterT: 48, LetterU: 49, LetterV: 50, LetterW: 51, LetterX: 52,
  LetterY: 53, LetterZ: 54,
  Digit0: 55, Digit1: 56, Digit2: 57, Digit3: 58, Digit4: 59,
  Digit5: 60, Digit6: 61, Digit7: 62, Digit8: 63, Digit9: 64,
} as const;

export type BlockId = (typeof BlockId)[keyof typeof BlockId];

/** Maior ID válido (mantém isPlaceable sem número mágico ao crescer a lista). */
const MAX_BLOCK_ID = BlockId.Digit9;

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
