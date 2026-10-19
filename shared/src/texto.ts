/**
 * Texto medido em BYTES, não em caracteres.
 *
 * O porquê (2026-10-19): todo teto de texto do jogo contava CARACTERES
 * (`MAX_CHAT_LENGTH`, `MAX_QUADRO_TEXTO`), e caractere não é byte — acento
 * ocupa 2, emoji 4. 200 emojis são 800 bytes no fio e no `-chat.log`, o
 * quádruplo do que o número prometia. Quem fala português cabe folgado nos
 * tetos daqui; quem enche de emoji é cortado.
 *
 * Módulo PURO: nada de estado, roda nos 3 hospedeiros e no cliente.
 */

/** Quantos bytes UTF-8 o texto ocupa. */
export function bytesUtf8(s: string): number {
  let n = 0;
  for (const c of s) {
    const cp = c.codePointAt(0)!;
    n += cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
  }
  return n;
}

/**
 * Corta `s` para caber em `maxBytes` SEM partir caractere: o corte acontece
 * em fronteira de code point, então nunca sai meio emoji (par substituto
 * órfão viraria `�` no `JSON.stringify` e sujaria o log).
 */
export function cortarEmBytes(s: string, maxBytes: number): string {
  let total = 0;
  let fim = 0; // índice em unidades UTF-16, que é o que o `slice` entende
  for (const c of s) {
    const cp = c.codePointAt(0)!;
    const custo = cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
    if (total + custo > maxBytes) break;
    total += custo;
    fim += c.length;
  }
  return fim === s.length ? s : s.slice(0, fim);
}
