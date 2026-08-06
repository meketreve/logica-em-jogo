/**
 * Coordenada DIGITADA num comando (`/bloco`, `/regiao`, `/tp`): inteiro, `~`
 * (a coordenada atual do autor) ou `~n` (atual + n) — a convenção do Minecraft,
 * que é o modelo mental do público. `base` = a célula onde o autor está.
 * `null` = token inválido.
 *
 * Mora fora de `session.ts` porque os três comandos que a usam vivem em
 * domínios diferentes; deixá-la no core faria cada um deles importar a sessão
 * inteira pra ler um número.
 */
export function parseCoordArg(token: string | undefined, base: number): number | null {
  if (token === undefined) return null;
  if (token.startsWith("~")) {
    const off = token.slice(1);
    if (off === "") return base;
    const n = Number(off);
    return Number.isInteger(n) ? base + n : null;
  }
  const n = Number(token);
  return Number.isInteger(n) ? n : null;
}
