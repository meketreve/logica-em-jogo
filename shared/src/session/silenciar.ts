import type { GameSession } from "../session";

/**
 * `/silenciar` (2026-08-27, pedido do usuário) — SÓ o professor roda: alterna
 * o chat de TURMA entre passar e ficar mudo. Comando (`/…`) sempre passa, é
 * resposta SÓ pro autor de qualquer forma (`sendServerChat`) — o gate mora no
 * broadcast de mensagem de JOGADOR (`case "chat"` em `session.ts`), não aqui.
 * Mesmo molde do `/ciclo`: sem argumento, alterna; estado do MUNDO, persiste.
 */
export function runSilenciar(ses: GameSession, parts: string[]): string {
  const arg = parts[1]?.toLowerCase();
  if (arg === "ligar" || arg === "on") ses.chatSilenciado = true;
  else if (arg === "desligar" || arg === "off") ses.chatSilenciado = false;
  else if (arg === undefined) ses.chatSilenciado = !ses.chatSilenciado;
  else return "Uso: /silenciar ligar ou /silenciar desligar (sem argumento, alterna).";
  ses.broadcast({
    type: "chat",
    author: "servidor",
    text: ses.chatSilenciado
      ? "Chat da turma SILENCIADO pelo professor: só comandos passam."
      : "Chat da turma liberado: mensagens voltam a valer.",
  });
  return ses.chatSilenciado
    ? "Chat silenciado — mensagens de jogador não chegam mais aos outros."
    : "Chat liberado.";
}
