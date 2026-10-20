import {
  CONTAINER_SLOTS,
  type Container,
  containerVazio,
  moverBloqueadoPorSemPreco,
  moverEntre,
} from "../containers";
import { adicionar } from "../inventario";
import { type ServerMessage } from "../protocol";
import type { GameSession } from "../session";
import { precoDeVenda, totalDoBalcao } from "../venda";
import { sendDimas } from "./loja";
import { inventarioDe, sendInventario } from "./inventario";

/**
 * §💰 BALCÃO DE VENDA (2026-10-20) — o lado da SESSÃO do `/vender`.
 *
 * A regra de preço é pura e mora em `../venda.ts`; aqui fica só o que precisa
 * da sessão (o balcão de cada jogador, a mochila, o saldo, o envio).
 *
 * **O balcão é do JOGADOR, não de uma célula.** É a única diferença de verdade
 * em relação ao baú e à loja, e ela simplifica em vez de complicar: não há gate
 * de alcance, não há claim, não há dois alunos no mesmo painel — o endereço é
 * quem mandou a mensagem. Em troca, o balcão **não vai pro save**: ele é estado
 * de SESSÃO, e o que estiver dentro volta pra mochila quando o painel fecha
 * (inclusive se a conexão cair). Nada fica preso num painel que ninguém vê.
 *
 * ⚠️ **Fechar devolve, e é por isso que o balcão pode ser de sessão.** Se o
 * conteúdo sumisse ao fechar, ele teria de ser persistido pra não comer o
 * trabalho da criança — e aí entraria no save, no claim e na releitura do
 * mundo. Devolver é a decisão que mantém o lote pequeno E honesto.
 */

/** O balcão deste jogador (nasce vazio; não é guardado até ter conteúdo). */
export function balcaoDe(ses: GameSession, nome: string): Container {
  return ses.balcoes.get(nome) ?? containerVazio("venda");
}

/** Este cliente está com o balcão ABERTO? */
export function balcaoAberto(ses: GameSession, clientId: number): boolean {
  return ses.balcaoAberto.has(clientId);
}

/** Manda o estado do balcão pra este cliente — slots, preço de cada pilha e o
 *  TOTAL. O total é calculado aqui, do mesmo lado que paga (ver o protocolo). */
export function sendBalcao(ses: GameSession, clientId: number): void {
  const nome = ses.players.get(clientId)?.name;
  if (nome === undefined) return;
  const c = balcaoDe(ses, nome);
  const slots: { slot: number; id: number; qtd: number }[] = [];
  // Preço só dos ids PRESENTES: quem já escolheu o que vender não precisa da
  // tabela inteira, e a mensagem fica do tamanho do que está na tela.
  const precos = new Map<number, number>();
  c.slots.forEach((s, i) => {
    if (!s) return;
    slots.push({ slot: i, id: s.id, qtd: s.qtd });
    const p = precoDeVenda(s.id);
    if (p !== null) precos.set(s.id, p);
  });
  ses.send(
    clientId,
    JSON.stringify({
      type: "balcao",
      slots,
      precos: [...precos].map(([porItem, qtd]) => ({ porItem, qtd })),
      total: totalDoBalcao(c.slots),
    } satisfies ServerMessage),
  );
}

/** O `/vender`: abre o balcão deste cliente e manda o estado. */
export function abrirBalcao(ses: GameSession, clientId: number): void {
  if (!ses.players.has(clientId)) return;
  ses.balcaoAberto.add(clientId);
  sendBalcao(ses, clientId);
}

/**
 * Move item entre a mochila e o balcão, no índice unificado. Devolve o motivo
 * da recusa em chat, ou `null` se aplicou — a mesma convenção do resto da loja.
 *
 * O "sem preço" é conferido ANTES do `moverEntre` só pra ter o que dizer: o
 * `moverEntre` já recusaria sozinho (a regra mora nele), mas recusar em silêncio
 * deixaria o item pulando de volta sem a criança saber por quê.
 */
export function aplicarMoverVenda(
  ses: GameSession,
  clientId: number,
  de: number,
  para: number,
  qtd?: number,
): string | null {
  const nome = ses.players.get(clientId)?.name;
  if (nome === undefined || !balcaoAberto(ses, clientId)) return null;
  const c = balcaoDe(ses, nome);
  const mochila = inventarioDe(ses, nome);
  if (moverBloqueadoPorSemPreco(mochila, c, de, para)) {
    return "Isso não se vende aqui — o balcão só compra o que você COLHE (bloco do chão, madeira, plantação, carvão, lingote).";
  }
  const depois = moverEntre(mochila, c, de, para, qtd);
  if (!depois) return null; // no-op: índice fora da faixa, origem vazia, destino cheio
  ses.inventarios.set(nome, depois.mochila);
  ses.balcoes.set(nome, depois.container);
  sendInventario(ses, clientId);
  sendBalcao(ses, clientId);
  return null;
}

/**
 * O aluno apertou **vender**: tudo que está no balcão vira Dimas, e o Dimas é
 * CRIADO aqui — é a fonte da economia (não sai do saldo de ninguém).
 *
 * Tudo ou nada, como a compra: o total é somado, o balcão esvazia e o saldo
 * sobe numa tacada. Balcão vazio não é erro — é o aluno conferindo a conta
 * antes de pôr coisa —, e por isso devolve aviso em vez de recusa seca.
 */
export function aplicarVender(ses: GameSession, clientId: number): string | null {
  const nome = ses.players.get(clientId)?.name;
  if (nome === undefined || !balcaoAberto(ses, clientId)) return null;
  const c = balcaoDe(ses, nome);
  const total = totalDoBalcao(c.slots);
  if (total <= 0) return "Ponha no balcão o que você quer vender — ele está vazio.";

  const quantas = c.slots.reduce((n, s) => n + (s ? s.qtd : 0), 0);
  ses.balcoes.set(nome, containerVazio("venda"));
  ses.dimas.set(nome, (ses.dimas.get(nome) ?? 0) + total);
  sendBalcao(ses, clientId);
  sendDimas(ses, clientId);
  ses.sendServerChat(clientId, `Vendido: ${quantas} ${quantas === 1 ? "item" : "itens"} por ${total} Dimas.`);
  return null;
}

/**
 * Fecha o balcão deste cliente e **devolve pra mochila** o que ficou dentro.
 *
 * Chamado por três caminhos: o aluno pediu pra fechar, ele vendeu e saiu, ou a
 * conexão caiu (`handleDisconnect`). Nos três o conteúdo volta — ver o
 * cabeçalho deste arquivo pra por que devolver é o que deixa o balcão ser
 * estado de sessão.
 *
 * ⚠️ A devolução **sempre cabe** na prática (o item saiu daquela mochila e o
 * slot ficou livre), mas `adicionar` pode transbordar se outra pilha tiver
 * ocupado o lugar no meio. O que não couber fica no balcão e o aluno é avisado
 * — o único jeito honesto: sumir com o item seria comer o trabalho dele.
 */
export function fecharBalcao(ses: GameSession, clientId: number, avisar = true): void {
  if (!ses.balcaoAberto.delete(clientId)) return;
  const nome = ses.players.get(clientId)?.name;
  if (nome !== undefined) {
    const c = balcaoDe(ses, nome);
    let mochila = inventarioDe(ses, nome);
    const sobrou: (typeof c.slots)[number][] = [];
    for (const s of c.slots) {
      if (!s) {
        sobrou.push(null);
        continue;
      }
      const r = adicionar(mochila, s.id, s.qtd);
      mochila = r.inv;
      sobrou.push(r.sobra > 0 ? { id: s.id, qtd: r.sobra } : null);
    }
    ses.inventarios.set(nome, mochila);
    if (sobrou.some((s) => s !== null)) {
      // Não cabe: o balcão GUARDA o resto e fica pra próxima abertura.
      ses.balcoes.set(nome, { ...c, slots: sobrou });
      if (avisar) {
        ses.sendServerChat(
          clientId,
          "Sua mochila está cheia — o que não caiu ficou guardado no balcão, abra o /vender de novo.",
        );
      }
    } else {
      ses.balcoes.delete(nome);
    }
    if (avisar) sendInventario(ses, clientId);
  }
  // Na queda de conexão (`avisar: false`) não há socket pra responder: mandar
  // `balcao_fechado` pra quem já saiu não chega a ninguém.
  if (avisar) {
    ses.send(clientId, JSON.stringify({ type: "balcao_fechado" } satisfies ServerMessage));
  }
}

/** Esquece o balcão de quem saiu de vez (o conteúdo já voltou pra mochila, que
 *  é salva). Sem isto, o mapa cresceria com um balcão por nome que já passou. */
export function esquecerBalcao(ses: GameSession, clientId: number): void {
  // `avisar: false` — mandar chat pra socket que fechou não chega a ninguém.
  fecharBalcao(ses, clientId, false);
}

/** Quantos slots o balcão tem — pro cliente e pros testes não repetirem o 9. */
export const BALCAO_SLOTS = CONTAINER_SLOTS.venda;
