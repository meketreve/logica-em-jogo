import { BlockId, isBreakable } from "../blocks";
import {
  faltaFerramentaNaMao,
  ferramentaDe,
  ferramentaIdealDe,
  gastar,
  ticksDeQuebra,
} from "../ferramentas";
import { definirSlot, slotValido } from "../inventario";
import { dropsDe } from "../drops";
import { claimBloqueia, confinaBloqueia } from "./equipes";
import { avisarComFreio } from "./avisos";
import { EXAUSTAO_POR_EDICAO } from "../sobrevivencia";
import { esforcar } from "./vitais";
import { containerTemEstoque } from "../containers";
import { avisarContainerCheio, containerDe } from "./containers";
import {
  cabemTodos,
  guardarDrops,
  inventarioDe,
  inventarioVale,
  avisarMochilaCheia,
  sendInventario,
} from "./inventario";
import { getBlock, inBounds } from "../world";
import type { GameSession } from "../session";

/**
 * §🔨 Ferramentas v2 (2026-09-17) — QUEBRA POR TEMPO, contada no servidor.
 *
 * Antes da v2 quebrar era um clique: o cliente mandava `break_block` e o bloco
 * sumia. Com tempo de quebra, alguém tem de CONTAR — e quem conta é o servidor,
 * pelo mesmo motivo de sempre (o cliente pede, o servidor decide). O desenho é o
 * mais curto que mantém isso verdade:
 *
 *   `break_start` ARMA (uma entrada no mapa, com quantos ticks faltam) →
 *   cada `tick` desconta 1 e reconfere o mundo → chegou a zero, o SERVIDOR
 *   quebra. `break_cancel` (soltar o botão) apaga a entrada.
 *
 * O cliente não manda "acabei": ele só prevê a MESMA conta com o mesmo módulo
 * puro pra desenhar a rachadura. Assim não existe "confiar no cronômetro do
 * aluno" — nem sequer há mensagem pra mentir.
 *
 * **Criativo continua em 1 clique.** O professor quebrando cenário não espera
 * 2 segundos por bloco, e é o mesmo portão (`inventarioVale`) que já separa
 * mochila finita de paleta infinita.
 */

/** O que um jogador está quebrando AGORA (transitório: morre no rejoin). */
export interface Quebra {
  x: number;
  y: number;
  z: number;
  /** O bloco que estava lá quando começou — se mudar, o progresso não vale. */
  blockId: number;
  /** A mão de quando começou; trocar de slot recomeça (é outra ferramenta). */
  slot: number | undefined;
  /** Ticks que ainda faltam. */
  restam: number;
}

/** A pilha que o jogador tem na MÃO (slot informado pelo cliente), ou `null`. */
export function maoDe(ses: GameSession, clientId: number, slot: number | undefined) {
  const p = ses.players.get(clientId);
  if (!p || slot === undefined || !slotValido(slot)) return null;
  return inventarioDe(ses, p.name)[slot] ?? null;
}

/**
 * As conferências que valem TANTO ao apertar quanto ao terminar: existe, dá pra
 * quebrar, está no alcance, ninguém protegeu, e a mão tem a ferramenta.
 *
 * Elas rodam DUAS vezes de propósito. No aperto, pra que o aviso ("pegue uma
 * picareta") chegue na hora — e não depois de a criança segurar 2 segundos
 * olhando pra um bloco que nunca ia quebrar. No fim, porque o mundo pode ter
 * mudado no meio: quem entrou no claim do colega, ou se afastou, não quebra.
 *
 * Devolve `false` quando barrou (já tendo avisado, quando havia o que avisar).
 */
function podeQuebrar(
  ses: GameSession,
  clientId: number,
  x: number,
  y: number,
  z: number,
  slot: number | undefined,
  avisar: boolean,
): boolean {
  const p = ses.players.get(clientId);
  if (!p) return false;
  if (!inBounds(ses.world, x, y, z)) return false;
  const atual = getBlock(ses.world, x, y, z);
  if (atual === BlockId.Air) return false;
  if (!isBreakable(atual)) return false; // bedrock: só /bloco remove
  if (!ses.withinReach(p, x, y, z)) return false;

  const bloqueio =
    claimBloqueia(ses, clientId, x, y, z) ?? confinaBloqueia(ses, clientId, x, y, z);
  if (bloqueio) {
    if (avisar) ses.sendServerChat(clientId, bloqueio);
    return false;
  }

  // §🍖 F10: container com coisa dentro NÃO QUEBRA (decisão do usuário pro baú,
  // estendida à fornalha porque a regra e a frase são as mesmas). Sem isto, um
  // clique perdia a mochila inteira que o colega guardou — e não existe item no
  // chão pra devolver. Vale inclusive em criativo. Sobe pro aperto junto com os
  // outros: "esvazie primeiro" depois de 2 s segurando seria um castigo.
  {
    const cont = containerDe(ses, x, y, z, atual);
    if (cont && containerTemEstoque(cont)) {
      if (avisar) avisarContainerCheio(ses, clientId);
      return false;
    }
  }

  // §🔨 v2: o gate olha a MÃO, não a mochila inteira (decisão do usuário, que
  // reabre a do F10d). Criativo e mundo de aula ficam de fora pelo portão que
  // já existe — lá a mochila nem é finita.
  if (inventarioVale(ses, clientId)) {
    const falta = faltaFerramentaNaMao(maoDe(ses, clientId, slot), atual);
    if (falta) {
      if (avisar) avisarComFreio(ses, clientId, falta);
      return false;
    }
  }
  return true;
}

/**
 * Apertou o botão nesta célula: confere tudo AGORA (pra o aviso ser imediato) e
 * arma o cronômetro. Recomeçar na mesma célula com a mesma mão NÃO reinicia o
 * progresso — senão uma sobreposição de mensagens do cliente zeraria a barra.
 */
export function iniciarQuebra(
  ses: GameSession,
  clientId: number,
  x: number,
  y: number,
  z: number,
  slot: number | undefined,
): void {
  if (!podeQuebrar(ses, clientId, x, y, z, slot, true)) {
    ses.quebrando.delete(clientId);
    return;
  }
  const blockId = getBlock(ses.world, x, y, z);
  const atual = ses.quebrando.get(clientId);
  if (atual && atual.x === x && atual.y === y && atual.z === z && atual.slot === slot) return;
  ses.quebrando.set(clientId, {
    x, y, z, blockId, slot,
    restam: ticksDeQuebra(blockId, maoDe(ses, clientId, slot)),
  });
}

/** Soltou o botão / mirou noutro lugar: o progresso some (não acumula). */
export function cancelarQuebra(ses: GameSession, clientId: number): void {
  ses.quebrando.delete(clientId);
}

/**
 * Um passo de todas as quebras em curso. Cada uma reconfere o mundo antes de
 * descontar: bloco trocado, jogador que saiu ou se afastou perdem o progresso —
 * é a mesma disciplina do resto do tick (o mundo manda, não a intenção).
 */
export function tickQuebras(ses: GameSession): void {
  for (const [clientId, q] of ses.quebrando) {
    if (!ses.players.has(clientId)) {
      ses.quebrando.delete(clientId);
      continue;
    }
    if (getBlock(ses.world, q.x, q.y, q.z) !== q.blockId) {
      ses.quebrando.delete(clientId);
      continue;
    }
    if (!podeQuebrar(ses, clientId, q.x, q.y, q.z, q.slot, false)) {
      ses.quebrando.delete(clientId);
      continue;
    }
    if (--q.restam > 0) continue;
    ses.quebrando.delete(clientId);
    quebrarCelula(ses, clientId, q.x, q.y, q.z, q.slot);
  }
}

/**
 * QUEBRA de verdade — o corpo que era o `case "break_block"` inteiro. Serve aos
 * dois caminhos (o clique do criativo e o fim do cronômetro da sobrevivência),
 * e é por isso que ele existe separado: duas cópias dessas regras divergiriam
 * no dia em que uma mudasse.
 */
export function quebrarCelula(
  ses: GameSession,
  clientId: number,
  x: number,
  y: number,
  z: number,
  slot: number | undefined,
): void {
  const p = ses.players.get(clientId);
  if (!p) return;
  if (!podeQuebrar(ses, clientId, x, y, z, slot, true)) return;
  const current = getBlock(ses.world, x, y, z);

  // §🍖 F4: quebrar DÁ o que a tabela diz — e, se não couber, NÃO QUEBRA. Não
  // existe item no chão (ROADMAP §🍖): recusar é mais honesto que fazer o bloco
  // evaporar. A conferência vem ANTES do applyBlock pra que a recusa não deixe
  // rastro no mundo.
  const drops = inventarioVale(ses, clientId) ? dropsDe(current) : [];
  if (drops.length && !cabemTodos(inventarioDe(ses, p.name), drops)) {
    avisarMochilaCheia(ses, clientId);
    return;
  }
  const mudancasAntes = ses.edicoesAplicadas;
  ses.applyBlock(x, y, z, BlockId.Air);
  // §🍖 F3: UMA edição do aluno = um custo. Mora AQUI (e não no fim do
  // `handleMessage`, como o `place_block`) porque a quebra da v2 acontece no
  // tick, muito depois da mensagem que a armou.
  if (ses.edicoesAplicadas > mudancasAntes) esforcar(ses, clientId, EXAUSTAO_POR_EDICAO);
  // Crédito DEPOIS do mundo mudar: a mochila e a célula andam juntas, e a
  // segunda metade da porta/cama, que o `doorRule`/`camaRule` apaga no tick
  // seguinte, NÃO passa por aqui (uma porta não vira duas).
  guardarDrops(ses, clientId, drops);
  gastarDurabilidade(ses, clientId, slot, current);
}

/**
 * Gasta 1 de vida da ferramenta que estava na mão — e só dela.
 *
 * **Só gasta em bloco que PEDE aquela ferramenta.** Cavar terra com a picareta
 * na mão não consome nada: se consumisse, a picareta de madeira (59 quebras)
 * morreria arrumando o jardim, e a criança aprenderia a guardá-la em vez de
 * usá-la — o contrário do que a durabilidade quer ensinar.
 *
 * Ao zerar, a ferramenta SOME (decisão do usuário), com aviso no chat e um
 * evento pro cliente tocar o som.
 */
function gastarDurabilidade(
  ses: GameSession,
  clientId: number,
  slot: number | undefined,
  blockId: number,
): void {
  if (!inventarioVale(ses, clientId)) return;
  const p = ses.players.get(clientId);
  if (!p || slot === undefined || !slotValido(slot)) return;
  const mao = inventarioDe(ses, p.name)[slot] ?? null;
  const f = ferramentaDe(mao);
  if (!mao || !f) return;
  if (f.tipo !== ferramentaIdealDe(blockId)) return;

  const depois = gastar(mao);
  ses.inventarios.set(p.name, definirSlot(inventarioDe(ses, p.name), slot, depois));
  sendInventario(ses, clientId);
  if (depois === null) {
    ses.sendServerChat(clientId, `Sua ${f.nome} quebrou.`);
    ses.send(clientId, JSON.stringify({ type: "ferramenta_quebrou", item: mao.id }));
  }
}
