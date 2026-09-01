import { type ServerMessage } from "../protocol";
import type { GameSession } from "../session";

/**
 * §Loja (2026-09-01) — o lado do SERVIDOR do baú-loja: saldo de Dimas,
 * definição de preço e a compra em si. O encanamento de container puro
 * (slots, save) mora em `../containers.ts`; aqui só o que precisa da sessão
 * (jogadores, saldo, broadcast) — mesmo corte de `session/dormir.ts` e
 * `session/containers.ts`.
 */

/** Manda o saldo ATUAL de Dimas pra este cliente. */
export function sendDimas(ses: GameSession, clientId: number): void {
  const p = ses.players.get(clientId);
  if (!p) return;
  ses.send(
    clientId,
    JSON.stringify({
      type: "dimas",
      saldo: ses.dimas.get(p.name) ?? 0,
    } satisfies ServerMessage),
  );
}
