import { isFornalha } from "./blocks";
import {
  INV_SLOTS,
  type Inventario,
  type Slot,
  type SlotSalvo,
  moverEmArray,
  tamanhoStack,
} from "./inventario";

/**
 * §🍖 F10 (2026-08-05) — BLOCO COM INVENTÁRIO PRÓPRIO.
 *
 * Módulo PURO, no molde do `inventario.ts`. O conteúdo de uma fornalha (F10b)
 * ou de um baú (F10e) não cabe no byte do chunk, então mora num mapa por
 * POSIÇÃO na GameSession (servidor = verdade) e persiste no meta do save —
 * exatamente o desenho do QUADRO, que foi o primeiro estado a não caber no id.
 *
 * **O encanamento nasce UMA vez e serve aos dois.** Fornalha e baú diferem em
 * três coisas — quantos slots, o que o tick faz com eles, e como se desenham —
 * e em NADA mais: a transferência, o save, a validação de índice e a regra de
 * quem pode abrir são as mesmas. Foi por isso que a fornalha veio primeiro na
 * ordem do F10: fazer o baú antes obrigaria a escrever isto duas vezes.
 */

/** Que tipo de container é este bloco? `null` = a célula não é container. */
export type ContainerTipo = "fornalha" | "bau";

/** Quantos slots cada tipo tem. A fornalha tem 3 (entrada · combustível ·
 *  saída); o baú tem 27, uma mochila inteira — é o mais simples de desenhar
 *  com a grade de 9 colunas que o inventário já usa. */
export const CONTAINER_SLOTS: Readonly<Record<ContainerTipo, number>> = {
  fornalha: 3,
  bau: 27,
};

/** Os 3 slots da fornalha, por nome. O índice é a identidade deles no fio. */
export const FORNALHA_ENTRADA = 0;
export const FORNALHA_COMBUSTIVEL = 1;
export const FORNALHA_SAIDA = 2;

/** O tipo de container deste byte de bloco (`null` se não for um). É a fonte
 *  ÚNICA da pergunta "esta célula guarda coisa?" — o `use_block`, o gate de
 *  quebra e o save consultam esta função, e não uma lista própria cada um. */
export function containerTipoDe(blockId: number): ContainerTipo | null {
  return isFornalha(blockId) ? "fornalha" : null;
}

/**
 * O conteúdo de UM container. Os três campos de fogo só a fornalha usa; o baú
 * os carrega em zero. Um campo a mais num objeto é mais barato que dois tipos
 * que quem chama teria de distinguir a cada acesso — e o save só grava o que
 * não é zero.
 */
export interface Container {
  readonly tipo: ContainerTipo;
  readonly slots: readonly Slot[];
  /** Ticks de queima que ainda restam do combustível aceso (0 = fogo apagado). */
  readonly queimando: number;
  /** Ticks que a unidade de combustível acesa deu — é a régua da barra de fogo
   *  (`queimando / queimaTotal`), e sem ela o cliente não sabe desenhar quanto
   *  falta. */
  readonly queimaTotal: number;
  /** Ticks já cozidos do item da entrada (0 = ainda não começou). */
  readonly progresso: number;
}

/** Container recém-colocado: todos os slots vazios, fogo apagado. */
export function containerVazio(tipo: ContainerTipo): Container {
  return {
    tipo,
    slots: new Array<Slot>(CONTAINER_SLOTS[tipo]).fill(null),
    queimando: 0,
    queimaTotal: 0,
    progresso: 0,
  };
}

/** Tem alguma coisa dentro? É a pergunta que decide se o baú pode ser quebrado
 *  (§🍖 F10e: **baú com item NÃO quebra**) — e a que o save usa pra não gravar
 *  container vazio nenhum. Fogo aceso conta como conteúdo: a fornalha está
 *  trabalhando. */
export function containerTemConteudo(c: Container): boolean {
  return c.slots.some((s) => s !== null) || c.queimando > 0;
}

/** Chave canônica do mapa por posição (a mesma forma do `quadroKey`). */
export function containerKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

// --- índice unificado (mochila + container) ---------------------------------

/**
 * O aluno move item entre DOIS inventários, e o fio manda UM número por ponta.
 * O espaço de índices é a concatenação: `0..INV_SLOTS-1` é a mochila,
 * `INV_SLOTS + i` é o slot `i` do container. Um número só (em vez de "onde" +
 * "qual") porque é exatamente o que o `mover_item` do §🍖 F4 já faz dentro da
 * mochila — e porque um índice inválido para num lugar só.
 */
export function totalDeSlots(tipo: ContainerTipo): number {
  return INV_SLOTS + CONTAINER_SLOTS[tipo];
}

/** O índice unificado aponta pro CONTAINER (e não pra mochila)? */
export function ehSlotDeContainer(i: number): boolean {
  return i >= INV_SLOTS;
}

/**
 * Move do índice unificado `de` pro `para`, atravessando (ou não) a fronteira
 * entre a mochila e o container. Devolve `null` quando NADA mudou — índice
 * fora da faixa, origem vazia, destino cheio da mesma pilha, ou o destino
 * proibido do parágrafo abaixo.
 *
 * **A saída da fornalha é de mão única.** Dá pra tirar dela, nunca pôr nela: um
 * item largado ali ficaria preso num slot que não cozinha e não queima, e a
 * criança não teria como saber por quê. É a única regra de destino do jogo, e
 * ela mora aqui (e não na UI) pela disciplina de sempre — a UI nunca decide.
 */
export function moverEntre(
  mochila: Inventario,
  c: Container,
  de: number,
  para: number,
): { mochila: Inventario; container: Container } | null {
  const total = totalDeSlots(c.tipo);
  if (!Number.isInteger(de) || !Number.isInteger(para)) return null;
  if (de < 0 || para < 0 || de >= total || para >= total) return null;
  if (c.tipo === "fornalha" && para === INV_SLOTS + FORNALHA_SAIDA) return null;

  const juntos: readonly Slot[] = [...mochila, ...c.slots];
  const depois = moverEmArray(juntos, de, para);
  if (depois === juntos) return null; // `moverEmArray` devolve o MESMO array no no-op
  return {
    mochila: depois.slice(0, INV_SLOTS),
    container: { ...c, slots: depois.slice(INV_SLOTS) },
  };
}

// --- save / protocolo -------------------------------------------------------

/** Um container no save/no fio: a posição, o tipo e a forma ESPARSA dos slots
 *  (só os ocupados), como o inventário do jogador. Os campos de fogo viajam só
 *  quando não são zero — baú e fornalha apagada não pagam por eles. */
export interface ContainerSalvo {
  x: number;
  y: number;
  z: number;
  tipo: ContainerTipo;
  slots: SlotSalvo[];
  queimando?: number;
  queimaTotal?: number;
  progresso?: number;
}

/** Container → forma esparsa. */
export function containerParaSave(
  x: number,
  y: number,
  z: number,
  c: Container,
): ContainerSalvo {
  const slots: SlotSalvo[] = [];
  c.slots.forEach((s, i) => {
    if (s) slots.push({ slot: i, id: s.id, qtd: s.qtd });
  });
  return {
    x, y, z,
    tipo: c.tipo,
    slots,
    ...(c.queimando ? { queimando: c.queimando } : {}),
    ...(c.queimaTotal ? { queimaTotal: c.queimaTotal } : {}),
    ...(c.progresso ? { progresso: c.progresso } : {}),
  };
}

/** Inteiro ≥ 0 vindo de fora, ou 0. (Os três campos de fogo têm o mesmo parse.) */
function inteiroNaoNegativo(v: unknown): number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : 0;
}

/**
 * Valida um container vindo de FORA (save ou fio), com o parse DEFENSIVO da
 * casa: entrada quebrada devolve `null` (quem chama PULA a entrada, não derruba
 * o mundo), e slot inválido dentro de um container válido é pulado sozinho —
 * uma pilha corrompida não custa o baú inteiro.
 */
export function parseContainerSalvo(v: unknown): ContainerSalvo | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  const { x, y, z } = o;
  if (typeof x !== "number" || !Number.isInteger(x)) return null;
  if (typeof y !== "number" || !Number.isInteger(y)) return null;
  if (typeof z !== "number" || !Number.isInteger(z)) return null;
  const tipo = o["tipo"];
  if (tipo !== "fornalha" && tipo !== "bau") return null;
  const max = CONTAINER_SLOTS[tipo];
  const slots: SlotSalvo[] = [];
  if (Array.isArray(o["slots"])) {
    for (const e of o["slots"]) {
      if (typeof e !== "object" || e === null) continue;
      const r = e as Record<string, unknown>;
      const slot = r["slot"];
      const id = r["id"];
      const qtd = r["qtd"];
      if (typeof slot !== "number" || !Number.isInteger(slot)) continue;
      if (slot < 0 || slot >= max) continue;
      if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) continue;
      if (typeof qtd !== "number" || !Number.isInteger(qtd) || qtd <= 0) continue;
      if (qtd > tamanhoStack(id)) continue;
      slots.push({ slot, id, qtd });
    }
  }
  const queimando = inteiroNaoNegativo(o["queimando"]);
  const queimaTotal = inteiroNaoNegativo(o["queimaTotal"]);
  const progresso = inteiroNaoNegativo(o["progresso"]);
  return {
    x, y, z, tipo, slots,
    ...(queimando ? { queimando } : {}),
    // fogo aceso sem régua não desenha barra nenhuma: a régua vira a própria
    // chama restante, que é o pior caso honesto (barra cheia esvaziando)
    ...(queimaTotal || queimando ? { queimaTotal: queimaTotal || queimando } : {}),
    ...(progresso ? { progresso } : {}),
  };
}

/** Forma esparsa → container. Slot repetido: o último vence (como no inventário). */
export function containerDeSave(s: ContainerSalvo): Container {
  const base = containerVazio(s.tipo);
  const slots = base.slots.slice();
  for (const e of s.slots) slots[e.slot] = { id: e.id, qtd: e.qtd };
  return {
    tipo: s.tipo,
    slots,
    queimando: s.queimando ?? 0,
    queimaTotal: s.queimaTotal ?? 0,
    progresso: s.progresso ?? 0,
  };
}
