import { isItem, isPlaceable } from "../blocks";
import {
  INV_SLOTS,
  type Inventario,
  STACK_MAX,
  type SlotSalvo,
  adicionar,
  cabe,
  estaVazio,
  inventarioParaSave,
  inventarioVazio,
  remover,
} from "../inventario";
import { type ServerMessage } from "../protocol";
import { avisarComFreio } from "./avisos";

/** §🍖 F4: teto de um `/dar` (27 slots × 64 = a mochila inteira de uma vez). */
const MAX_DAR_QTD = INV_SLOTS * STACK_MAX;
import { acharNomeConhecido, modoDe } from "./modo";
import { vidaVale } from "./vitais";
import type { GameSession } from "../session";

/**
 * §🍖 F4 — INVENTÁRIO autoritativo (a mochila do aluno) e o `/dar` do professor.
 *
 * A mochila é por NOME, não por id de cliente — mesma disciplina do modo e dos
 * vitais: sobrevive ao rejoin e à troca de aula. Só existe entrada pra quem já
 * pegou alguma coisa, e o criativo nunca cria uma.
 *
 * O que NÃO mora aqui: o núcleo de pilha (adicionar, remover, mover, cabe),
 * que é lógica pura em `../inventario.ts`.
 */

/** Mochila de um NOME (nasce vazia na primeira vez que alguém pergunta). */
export function inventarioDe(ses: GameSession, nome: string): Inventario {
  let i = ses.inventarios.get(nome);
  if (!i) {
    i = inventarioVazio();
    ses.inventarios.set(nome, i);
  }
  return i;
}

/** O inventário FINITO vale pra este cliente? Mesmo portão da vida: só
 *  sobrevivência. Criativo segue com a paleta infinita do cliente, intocado —
 *  é o mesmo mundo, o que muda é o modo do jogador. */
export function inventarioVale(ses: GameSession, clientId: number): boolean {
  return vidaVale(ses, clientId);
}

export function sendInventario(ses: GameSession, clientId: number): void {
  const p = ses.players.get(clientId);
  if (!p) return;
  ses.send(
    clientId,
    JSON.stringify({
      type: "inventario",
      slots: inventarioParaSave(inventarioDe(ses, p.name)),
    } satisfies ServerMessage),
  );
}

/** Forma esparsa pro roster do save — `undefined` se a mochila está vazia
 *  (mundo criativo não engorda o `.ljw` com 27 nulos por aluno). */
export function inventarioParaRoster(ses: GameSession, nome: string): SlotSalvo[] | undefined {
  const i = ses.inventarios.get(nome);
  if (!i || estaVazio(i)) return undefined;
  return inventarioParaSave(i);
}

/**
 * Gasta UMA unidade do id ao colocar bloco. Fora da sobrevivência é no-op —
 * é o que mantém criativo intocado sem um `if` em cada ramo do `place_block`.
 * O id que sai da mochila é a FORMA CANÔNICA: o aluno guarda "porta", não
 * "porta do eixo Z aberta com dobradiça alta".
 */
export function gastarItem(ses: GameSession, clientId: number, id: number): void {
  if (!inventarioVale(ses, clientId)) return;
  const p = ses.players.get(clientId);
  if (!p) return;
  const { inv, removido } = remover(inventarioDe(ses, p.name), id, 1);
  if (!removido) return;
  ses.inventarios.set(p.name, inv);
  sendInventario(ses, clientId);
}

/**
 * As pilhas cabem TODAS na mochila? Simula guardar uma a uma, porque duas
 * pilhas do mesmo id disputam o mesmo espaço — somar `espacoPara` de cada uma
 * contaria o slot vazio duas vezes.
 */
export function cabemTodos(inv: Inventario, pilhas: readonly { id: number; qtd: number }[]): boolean {
  let atual = inv;
  for (const d of pilhas) {
    if (!cabe(atual, d.id, d.qtd)) return false;
    atual = adicionar(atual, d.id, d.qtd).inv;
  }
  return true;
}

/** Guarda o que caiu (já conferido por `cabemTodos`) e avisa o cliente. */
export function guardarDrops(ses: GameSession, clientId: number, pilhas: readonly { id: number; qtd: number }[]): void {
  const p = ses.players.get(clientId);
  if (!p || !pilhas.length) return;
  let inv = inventarioDe(ses, p.name);
  for (const d of pilhas) inv = adicionar(inv, d.id, d.qtd).inv;
  ses.inventarios.set(p.name, inv);
  sendInventario(ses, clientId);
}

/**
 * `/dar <quem> <id> [qtd]` — o professor enche a mochila de um aluno (ou da
 * turma). É a contraparte do `/bloco`: com o inventário AUTORITATIVO, o mundo
 * de sobrevivência começa com todo mundo de mãos vazias, e sem este comando o
 * professor não tem como preparar uma atividade nem consertar um acidente.
 * Teleoperação, como o `/bloco`: não custa esforço, não exige alcance.
 *
 * `<quem>` = `eu` · `all` · nome do aluno (o mesmo casamento do `/modo`).
 * `<id>` = número, igual ao `/bloco` (o cliente mostra o id no inventário).
 */
export function runDar(ses: GameSession, clientId: number, parts: string[]): string {
  const p = ses.players.get(clientId);
  if (!p) return "Entre no mundo antes de usar /dar.";
  const alvo = parts[1]?.toLowerCase();
  const id = Number(parts[2]);
  const qtd = parts.length === 4 ? Number(parts[3]) : 1;
  if (parts.length < 3 || parts.length > 4 || !alvo || !Number.isInteger(id)) {
    return "Uso: /dar eu|all|nome id [quantidade] — o id segue a ordem do inventário, igual ao /bloco.";
  }
  // §🍖 F6: bloco OU item conhecido. Sem isto o professor não consegue dar
  // comida — e dar comida é a versão de sala de aula do "consertar acidente"
  // que justificou o /dar no F4.
  if (!isPlaceable(id) && !isItem(id)) return `Não existe item com o id ${id}.`;
  if (!Number.isInteger(qtd) || qtd < 1 || qtd > MAX_DAR_QTD) {
    return `Quantidade inválida: use de 1 a ${MAX_DAR_QTD}.`;
  }

  const nomes =
    alvo === "all" || alvo === "todos"
      ? ses.jogadoresConectados().map((j) => j.name)
      : [alvo === "eu" ? p.name : acharNomeConhecido(ses, alvo)].filter(
          (n): n is string => n !== null,
        );
  if (!nomes.length) {
    return `Ninguém chamado "${parts[1]?.replace(/^@/, "")}" neste mundo. Use /dar eu, /dar all ou o nome exato do aluno.`;
  }

  const cheias: string[] = [];
  let entregues = 0;
  for (const nome of nomes) {
    const { inv, sobra } = adicionar(inventarioDe(ses, nome), id, qtd);
    if (sobra === qtd) {
      cheias.push(nome);
      continue;
    }
    ses.inventarios.set(nome, inv);
    entregues++;
    // quem está online E em sobrevivência vê a mochila mudar na hora; quem
    // está em criativo recebe calado (o item fica guardado pra quando trocar)
    for (const [cid, j] of ses.players) {
      if (j.name === nome && modoDe(ses, nome) === "sobrevivencia") sendInventario(ses, cid);
    }
    if (sobra) cheias.push(`${nome} (só ${qtd - sobra})`);
  }
  if (!entregues) return `Mochila cheia: ${cheias.join(", ")} não coube nada.`;
  return (
    `Entregue ${qtd}× do item ${id} para ${nomes.length === 1 ? nomes[0] : `${entregues} jogador(es)`}.` +
    (cheias.length ? ` Mochila cheia: ${cheias.join(", ")}.` : "") +
    (ses.modoMundo === "criativo" ? " (O mundo está em criativo — a mochila só aparece em sobrevivência.)" : "")
  );
}
export function avisarMochilaCheia(ses: GameSession, clientId: number): void {
  avisarComFreio(ses, 
    clientId,
    "Mochila cheia — guarde ou solte alguma coisa antes de continuar cavando.",
  );
}
