import { type Container, type Preco, containerKey } from "../containers";
import { type ServerMessage } from "../protocol";
import type { GameSession } from "../session";
import { avisarContainer } from "./containers";

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

/**
 * O criador define (ou remove, `preco: null`) o preço de UM tipo de item.
 * Devolve o motivo da recusa em chat, ou `null` se aplicou.
 */
export function aplicarDefinirPreco(
  ses: GameSession,
  clientId: number,
  cont: Container,
  x: number,
  y: number,
  z: number,
  item: number,
  preco: Preco | null,
): string | null {
  const p = ses.players.get(clientId);
  if (!p) return null;
  if (cont.criador !== p.name) return "Só quem criou esta loja define preço.";
  if (!Number.isInteger(item) || item <= 0) return "Item inválido.";
  const precosNovos = new Map(cont.precos);
  if (preco === null) precosNovos.delete(item);
  else precosNovos.set(item, preco);
  ses.containers.set(containerKey(x, y, z), { ...cont, precos: precosNovos });
  avisarContainer(ses, x, y, z);
  return null;
}
