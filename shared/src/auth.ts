/**
 * Identidade por mundo (cp9): nome + PIN de 4 dígitos, papel professor/aluno.
 *
 * O hash é SÍNCRONO e puro de propósito: handleMessage da GameSession é
 * síncrono, e /shared não pode depender de crypto.subtle (async, e indisponível
 * fora de contexto seguro em alguns navegadores). A segurança NÃO vem do
 * algoritmo: PIN de 4 dígitos tem 10 mil combinações — qualquer hash é
 * quebrável por força bruta offline. O hash existe pra impedir a leitura
 * CASUAL dos PINs no save (o .ljw exportado circula via Drive); a ameaça real
 * (colega na LAN chutando PIN alheio) é tratada com rate-limit no join.
 */

export type Papel = "professor" | "aluno";

/** PIN válido = exatamente 4 dígitos. */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/** Tentativas erradas seguidas antes de travar o nome no join. */
export const MAX_PIN_ATTEMPTS = 5;
/** Quanto tempo o nome fica travado depois de estourar as tentativas. */
export const PIN_LOCKOUT_MS = 30_000;

/**
 * Hash de segredo (PIN com salt = nome do jogador; código de professor com
 * salt = "codigo"). FNV-1a 32 bits em duas passadas descorrelacionadas →
 * 16 chars hex. O salt impede que dois jogadores com o mesmo PIN tenham o
 * mesmo hash no save.
 */
export function hashSecret(salt: string, secret: string): string {
  const input = `${salt}\n${secret}`;
  let h1 = 0x811c9dc5; // offset basis oficial do FNV-1a
  let h2 = 0xcbf29ce4; // offset alternativo pra segunda metade
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul((h2 ^ c) + 0x9e3779b9, 0x01000193) >>> 0;
  }
  return (
    h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")
  );
}
