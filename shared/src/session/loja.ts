import { MAX_BLOCK_ID } from "../blocks";
import { CONTAINER_SLOTS, type Container, containerKey } from "../containers";
import { adicionar, cabe, contar, remover } from "../inventario";
import { type ServerMessage } from "../protocol";
import type { GameSession } from "../session";
import { avisarContainer } from "./containers";
import { inventarioDe, sendInventario } from "./inventario";

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
 * O criador define (ou remove, `qtd: null`) o preço — em DIMAS — de UM tipo
 * de item. Devolve o motivo da recusa em chat, ou `null` se aplicou.
 *
 * Moeda decidida em 2026-09-02: só Dimas, nunca item-por-item — o `Preco`
 * de duas trilhas (item/dimas) que existia antes disto foi removido junto.
 *
 * I2 (2026-09-01): duas travas que faltavam. (1) `item` não pode passar de
 * `MAX_BLOCK_ID`: sem teto, um id inventado (bloco que nunca vai existir)
 * entrava no save do mesmo jeito. (2) `precos.size` não pode passar de
 * `CONTAINER_SLOTS.loja` (27) — não existem mais TIPOS distintos de item
 * possíveis no estoque do que slots, então esse é o teto natural. O teto só
 * barra uma entrada NOVA; atualizar (ou remover, `qtd: null`) uma entrada JÁ
 * EXISTENTE continua liberado mesmo no teto — não é a loja que fica presa,
 * é só o crescimento.
 */
export function aplicarDefinirPreco(
  ses: GameSession,
  clientId: number,
  cont: Container,
  x: number,
  y: number,
  z: number,
  item: number,
  qtd: number | null,
): string | null {
  const p = ses.players.get(clientId);
  if (!p) return null;
  if (cont.criador !== p.name) return "Só quem criou esta loja define preço.";
  if (!Number.isInteger(item) || item <= 0 || item > MAX_BLOCK_ID) return "Item inválido.";
  if (qtd !== null && !cont.precos.has(item) && cont.precos.size >= CONTAINER_SLOTS.loja) {
    return "Esta loja já tem o máximo de preços diferentes definidos.";
  }
  const precosNovos = new Map(cont.precos);
  if (qtd === null) precosNovos.delete(item);
  else precosNovos.set(item, qtd);
  ses.containers.set(containerKey(x, y, z), { ...cont, precos: precosNovos });
  avisarContainer(ses, x, y, z);
  return null;
}

/**
 * Compra `qtd` unidades de `item` de uma loja, pagando em Dimas. Devolve o
 * motivo da recusa em chat, ou `null` se aplicou — a mesma convenção de
 * `aplicarDefinirPreco`.
 *
 * A ordem das checagens é a ordem que o spec pede: existe preço, tem
 * estoque, a mochila do comprador tem espaço pro item, tem saldo. Nenhuma
 * escrita acontece até TODAS passarem — a compra é tudo ou nada. Dimas
 * NUNCA ocupa slot — não há mais "espaço pro pagamento" a checar (essa
 * checagem só existia na trilha item-por-item, removida em 2026-09-02).
 */
export function aplicarCompra(
  ses: GameSession,
  clientId: number,
  cont: Container,
  x: number,
  y: number,
  z: number,
  item: number,
  qtd: number,
): string | null {
  const comprador = ses.players.get(clientId);
  if (!comprador) return null;
  const precoUnitario = cont.precos.get(item);
  if (!precoUnitario) return "Este item não está à venda.";
  if (contar(cont.slots, item) < qtd) return "A loja não tem estoque suficiente.";
  const mochilaAntes = inventarioDe(ses, comprador.name);
  if (!cabe(mochilaAntes, item, qtd)) return "Sua mochila está cheia.";
  const totalPago = precoUnitario * qtd;
  if ((ses.dimas.get(comprador.name) ?? 0) < totalPago) return "Você não tem Dimas suficiente.";

  const slotsNovos = remover(cont.slots, item, qtd).inv;
  const mochilaDepois = adicionar(mochilaAntes, item, qtd).inv;
  ses.dimas.set(comprador.name, (ses.dimas.get(comprador.name) ?? 0) - totalPago);
  ses.dimas.set(cont.criador, (ses.dimas.get(cont.criador) ?? 0) + totalPago);

  ses.inventarios.set(comprador.name, mochilaDepois);
  ses.containers.set(containerKey(x, y, z), { ...cont, slots: slotsNovos });
  sendInventario(ses, clientId);
  avisarContainer(ses, x, y, z);
  sendDimas(ses, clientId);
  for (const [id, p] of ses.players) if (p.name === cont.criador) sendDimas(ses, id);
  return null;
}
