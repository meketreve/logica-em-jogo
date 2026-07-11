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
} as const;

export type BlockId = (typeof BlockId)[keyof typeof BlockId];

/** O jogador pode colocar este ID? (v0: qualquer bloco menos ar; valida bytes do fio) */
export function isPlaceable(id: number): boolean {
  return Number.isInteger(id) && id >= BlockId.Grass && id <= BlockId.Sand;
}
