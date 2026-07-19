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

import { MAX_NAME_LENGTH } from "./constants";

export type Papel = "professor" | "aluno";

/** PIN válido = exatamente 4 dígitos. */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/**
 * Normaliza o nome de um jogador: só letra, número, acento, `_` e `-`.
 * ESPAÇO e caractere especial são REMOVIDOS — o espaço quebrava todo comando
 * que lê o nome por posição (`/kicar ana maria` viraria `parts[1]="ana"`, sem
 * como mirar o aluno; idem /tp, /grupo entrar, /amigos…). Acento de nome
 * brasileiro (José, João) continua valendo — `\p{L}`/`\p{M}` cobrem Unicode.
 * Corta em MAX_NAME_LENGTH; se sobrar vazio, cai no genérico "jogador".
 * Servidor e cliente chamam a MESMA função (fio adulterado é saneado no host).
 */
export function sanitizeName(raw: string): string {
  const limpo = [...raw.trim()]
    .filter((c) => /[\p{L}\p{N}\p{M}_-]/u.test(c))
    .join("");
  return limpo.slice(0, MAX_NAME_LENGTH) || "jogador";
}

/** Tentativas erradas seguidas antes de travar o nome no join. */
export const MAX_PIN_ATTEMPTS = 5;
/** Quanto tempo o nome fica travado depois de estourar as tentativas. */
export const PIN_LOCKOUT_MS = 30_000;
