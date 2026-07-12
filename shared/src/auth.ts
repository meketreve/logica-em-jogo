/**
 * Identidade por mundo (cp9): nome + PIN de 4 dígitos, papel professor/aluno.
 *
 * PIN e código de professor ficam em TEXTO PURO no save — decisão do usuário
 * (2026-07-12): não há dado sensível (nome de fantasia + mundo de aula), um
 * PIN de 4 dígitos é quebrável por força bruta de qualquer jeito, e texto puro
 * deixa o professor recuperar código/PIN olhando o console ou o save. O que
 * segura a ameaça real (colega na LAN chutando PIN alheio) é o rate-limit
 * do join, não criptografia.
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
