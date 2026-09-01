import { type Container, type Preco, containerKey } from "../containers";
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

/**
 * Compra `qtd` unidades de `item` de uma loja. Devolve o motivo da recusa em
 * chat, ou `null` se aplicou — a mesma convenção de `aplicarDefinirPreco`.
 *
 * A ordem das checagens é a ordem que o spec pede: existe preço, tem
 * estoque, o comprador tem o pagamento, e (só na trilha ITEM) o baú tem
 * espaço pro pagamento depois de sair o estoque. Nenhuma escrita acontece
 * até TODAS passarem — a compra é tudo ou nada.
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
  const preco = cont.precos.get(item);
  if (!preco) return "Este item não está à venda.";
  if (contar(cont.slots, item) < qtd) return "A loja não tem estoque suficiente.";
  const totalPago = preco.qtd * qtd;
  const mochilaAntes = inventarioDe(ses, comprador.name);
  if (!cabe(mochilaAntes, item, qtd)) return "Sua mochila está cheia.";

  if (preco.tipo === "dimas") {
    if ((ses.dimas.get(comprador.name) ?? 0) < totalPago) return "Você não tem Dimas suficiente.";
  } else {
    if (contar(mochilaAntes, preco.item) < totalPago) {
      return "Você não tem o item de pagamento suficiente.";
    }
    const estoqueDepois = remover(cont.slots, item, qtd).inv;
    if (!cabe(estoqueDepois, preco.item, totalPago)) {
      return "A loja não tem espaço para o pagamento.";
    }
  }

  let slotsNovos = remover(cont.slots, item, qtd).inv;
  let mochilaDepois = mochilaAntes;
  if (preco.tipo === "dimas") {
    ses.dimas.set(comprador.name, (ses.dimas.get(comprador.name) ?? 0) - totalPago);
    ses.dimas.set(cont.criador, (ses.dimas.get(cont.criador) ?? 0) + totalPago);
  } else {
    mochilaDepois = remover(mochilaDepois, preco.item, totalPago).inv;
    slotsNovos = adicionar(slotsNovos, preco.item, totalPago).inv;
  }
  mochilaDepois = adicionar(mochilaDepois, item, qtd).inv;

  ses.inventarios.set(comprador.name, mochilaDepois);
  ses.containers.set(containerKey(x, y, z), { ...cont, slots: slotsNovos });
  sendInventario(ses, clientId);
  avisarContainer(ses, x, y, z);
  if (preco.tipo === "dimas") {
    sendDimas(ses, clientId);
    for (const [id, p] of ses.players) if (p.name === cont.criador) sendDimas(ses, id);
  }
  return null;
}
