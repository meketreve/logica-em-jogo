import { isBalde, isFerramenta } from "./blocks";

/**
 * §🍖 F4 — INVENTÁRIO AUTORITATIVO (stacks puros).
 *
 * Módulo PURO, no molde do `sobrevivencia.ts`: sem I/O, sem relógio, sem rede.
 * Toda função devolve um inventário NOVO — nada muta no lugar. A session
 * orquestra (quem gasta, quem ganha, quem é recusado); aqui só mora a
 * aritmética de slot e pilha.
 *
 * Layout fixo de 27 slots, no molde do Minecraft:
 *   0..8   = HOTBAR (o que o jogador segura e coloca)
 *   9..26  = MOCHILA (só aparece com o inventário aberto)
 * O índice é a identidade do slot — ele viaja assim no save e no protocolo,
 * porque é o que deixa o aluno arrumar a mochila e reencontrar tudo no lugar.
 *
 * **Não existe item no chão** (decisão travada no ROADMAP §🍖): quebrar com a
 * mochila cheia é RECUSADO. Por isso `cabe()` existe e é chamada ANTES de
 * quebrar — o servidor nunca cria item que não tem onde guardar.
 */

/** Uma pilha: id (bloco ou item ≥ 900) + quantidade ≥ 1. */
export interface Stack {
  readonly id: number;
  readonly qtd: number;
}

/** Slot do inventário: uma pilha ou vazio. */
export type Slot = Stack | null;

/** Inventário completo — SEMPRE `INV_SLOTS` posições (vazio = null). */
export type Inventario = readonly Slot[];

export const HOTBAR_SLOTS = 9;
export const MOCHILA_SLOTS = 18;
export const INV_SLOTS = HOTBAR_SLOTS + MOCHILA_SLOTS;

/** Teto padrão de uma pilha (número do Minecraft). */
export const STACK_MAX = 64;

/**
 * Teto de pilha DESTE id. Duas exceções, e as duas por 1 por slot: o balde
 * (carrega conteúdo, então duas unidades não são intercambiáveis) e a
 * ferramenta (§🍖 F10d — o número do Minecraft; e no dia em que durabilidade
 * existir, é aqui que ela entra, sem mexer em `adicionar`/`remover`).
 */
export function tamanhoStack(id: number): number {
  return isBalde(id) || isFerramenta(id) ? 1 : STACK_MAX;
}

/** Inventário vazio (27 slots nulos). */
export function inventarioVazio(): Inventario {
  return new Array<Slot>(INV_SLOTS).fill(null);
}

/** O inventário tem alguma coisa? (mochila vazia não vai pro save) */
export function estaVazio(inv: Inventario): boolean {
  return inv.every((s) => s === null);
}

/** Quantas unidades deste id o jogador tem, somando todos os slots. */
export function contar(inv: Inventario, id: number): number {
  let n = 0;
  for (const s of inv) if (s && s.id === id) n += s.qtd;
  return n;
}

/**
 * Quantas unidades deste id ainda CABEM: o que falta nas pilhas parciais que já
 * existem + os slots vazios × o teto da pilha. É a conta que decide se a quebra
 * acontece ou se o aluno ouve "mochila cheia".
 */
export function espacoPara(inv: Inventario, id: number): number {
  const teto = tamanhoStack(id);
  let n = 0;
  for (const s of inv) {
    if (s === null) n += teto;
    else if (s.id === id && s.qtd < teto) n += teto - s.qtd;
  }
  return n;
}

/** Cabe a quantidade INTEIRA? (o servidor não guarda pela metade) */
export function cabe(inv: Inventario, id: number, qtd: number): boolean {
  return qtd <= espacoPara(inv, id);
}

/**
 * Guarda `qtd` unidades. Completa as pilhas parciais que já existem ANTES de
 * ocupar slot vazio (senão a mochila enche de pilhas de 1), e varre sempre na
 * ordem hotbar → mochila, pra que o que o aluno acabou de cavar apareça na mão.
 *
 * Devolve o que NÃO coube em `sobra`. Quem chama decide o que fazer com ela —
 * hoje ninguém deixa sobrar, porque a quebra é recusada antes por `cabe()`.
 */
export function adicionar(
  inv: Inventario,
  id: number,
  qtd: number,
): { inv: Inventario; sobra: number } {
  if (qtd <= 0) return { inv, sobra: 0 };
  const teto = tamanhoStack(id);
  const slots = inv.slice();
  let resta = qtd;

  for (let i = 0; i < slots.length && resta > 0; i++) {
    const s = slots[i];
    if (!s || s.id !== id || s.qtd >= teto) continue;
    const leva = Math.min(teto - s.qtd, resta);
    slots[i] = { id, qtd: s.qtd + leva };
    resta -= leva;
  }
  for (let i = 0; i < slots.length && resta > 0; i++) {
    if (slots[i] !== null) continue;
    const leva = Math.min(teto, resta);
    slots[i] = { id, qtd: leva };
    resta -= leva;
  }
  if (resta === qtd) return { inv, sobra: resta }; // nada mudou
  return { inv: slots, sobra: resta };
}

/**
 * Tira `qtd` unidades. Consome a pilha MENOR primeiro (varrendo hotbar →
 * mochila em caso de empate): é o que junta os restos em vez de espalhar
 * pilhas quebradas pela mochila inteira.
 *
 * Devolve `removido: 0` e o inventário INTACTO se não houver o suficiente —
 * gasto parcial não existe (colocar bloco é tudo ou nada).
 */
export function remover(
  inv: Inventario,
  id: number,
  qtd: number,
): { inv: Inventario; removido: number } {
  if (qtd <= 0) return { inv, removido: 0 };
  if (contar(inv, id) < qtd) return { inv, removido: 0 };
  const ordem = inv
    .map((s, i) => ({ s, i }))
    .filter((e): e is { s: Stack; i: number } => e.s !== null && e.s.id === id)
    .sort((a, b) => a.s.qtd - b.s.qtd || a.i - b.i);

  const slots = inv.slice();
  let resta = qtd;
  for (const { s, i } of ordem) {
    if (resta <= 0) break;
    const tira = Math.min(s.qtd, resta);
    slots[i] = s.qtd === tira ? null : { id, qtd: s.qtd - tira };
    resta -= tira;
  }
  return { inv: slots, removido: qtd };
}

/**
 * Move/junta o slot `de` no slot `para` (o gesto do aluno arrumando a mochila).
 * Mesmo id = JUNTA até o teto (o que passar fica pra trás); ids diferentes (ou
 * pilha cheia) = TROCA. Índice inválido ou `de === para` devolve o inventário
 * como está — o servidor não pode confiar no índice que veio pelo fio.
 *
 * `qtd` (opcional, §🧹 playtest): move só UMA PARTE da pilha — a divisão que o
 * clique direito do PC pede. Ausente = pilha inteira, como sempre.
 */
export function moverSlot(inv: Inventario, de: number, para: number, qtd?: number): Inventario {
  if (!slotValido(de) || !slotValido(para)) return inv;
  return qtd === undefined
    ? moverEmArray(inv, de, para)
    : moverParteEmArray(inv, de, para, qtd);
}

/**
 * O NÚCLEO do movimento (junta ou troca), sobre um array de slots QUALQUER —
 * sem a régua de 27 do inventário do jogador. Índice fora do array, origem
 * vazia ou `de === para` devolvem o MESMO array (é essa identidade que quem
 * chama usa pra saber que nada mudou e nem mandar mensagem).
 *
 * §🍖 F10: existe separado porque a transferência mochila↔container (fornalha,
 * baú) trabalha num array CONCATENADO dos dois — a regra de juntar pilha e
 * trocar slot é a mesma dos dois lados, e escrevê-la duas vezes seria a receita
 * pra elas divergirem no dia em que uma mudasse.
 */
export function moverEmArray(
  slots: readonly Slot[],
  de: number,
  para: number,
): readonly Slot[] {
  if (!Number.isInteger(de) || !Number.isInteger(para)) return slots;
  if (de < 0 || para < 0 || de >= slots.length || para >= slots.length) return slots;
  if (de === para) return slots;
  const origem = slots[de] ?? null;
  const destino = slots[para] ?? null;
  if (origem === null) return slots;

  const out = slots.slice();
  if (destino !== null && destino.id === origem.id) {
    const teto = tamanhoStack(origem.id);
    const leva = Math.min(teto - destino.qtd, origem.qtd);
    if (leva <= 0) return slots; // destino cheio: nem junta nem troca
    out[para] = { id: destino.id, qtd: destino.qtd + leva };
    out[de] = origem.qtd === leva ? null : { id: origem.id, qtd: origem.qtd - leva };
    return out;
  }
  out[para] = origem;
  out[de] = destino;
  return out;
}

/**
 * Move só `qtd` unidades do slot `de` pro `para` — a pilha DIVIDIDA do §🧹
 * (playtest: o clique direito do PC pega a metade). A mesma semântica de
 * juntar/trocar do `moverEmArray`, mas movendo PARTE da origem: destino vazio
 * recebe a parte · mesmo id JUNTA até o teto (o que não couber fica na
 * origem) · id diferente TROCA a parte pela pilha do destino (Minecraft).
 *
 * `qtd` inválido (≤ 0, não-inteiro) devolve o mesmo array; `qtd` ≥ a pilha
 * inteira cai no movimento completo. No-op devolve o MESMO array — a
 * identidade é o sinal de "nada mudou" pra quem chama.
 */
export function moverParteEmArray(
  slots: readonly Slot[],
  de: number,
  para: number,
  qtd: number,
): readonly Slot[] {
  if (!Number.isInteger(de) || !Number.isInteger(para)) return slots;
  if (de < 0 || para < 0 || de >= slots.length || para >= slots.length) return slots;
  if (de === para) return slots;
  const origem = slots[de] ?? null;
  if (origem === null) return slots;
  if (!Number.isInteger(qtd) || qtd <= 0) return slots;
  if (qtd >= origem.qtd) return moverEmArray(slots, de, para);

  const destino = slots[para] ?? null;
  const out = slots.slice();
  if (destino === null) {
    out[para] = { id: origem.id, qtd };
    out[de] = { id: origem.id, qtd: origem.qtd - qtd };
    return out;
  }
  if (destino.id === origem.id) {
    const teto = tamanhoStack(origem.id);
    const leva = Math.min(qtd, teto - destino.qtd);
    if (leva <= 0) return slots; // destino cheio: nada muda
    out[para] = { id: destino.id, qtd: destino.qtd + leva };
    out[de] = origem.qtd === leva ? null : { id: origem.id, qtd: origem.qtd - leva };
    return out;
  }
  out[para] = { id: origem.id, qtd };
  out[de] = destino;
  return out;
}

/**
 * Substitui o conteúdo de UM slot (pilha nova ou vazio), sem mexer no resto.
 * É a troca in-place do balde vazio↔cheio no §🍖 F5: o item fica no mesmo slot
 * (senão pularia de lugar e o aluno perderia o que segura). Índice inválido
 * devolve o inventário como está. Não valida teto — quem chama é dono da pilha.
 */
export function definirSlot(inv: Inventario, slot: number, pilha: Slot): Inventario {
  if (!slotValido(slot)) return inv;
  const slots = inv.slice();
  slots[slot] = pilha;
  return slots;
}

/** Índice de slot válido? (o fio manda número; aqui é onde ele para) */
export function slotValido(i: number): boolean {
  return Number.isInteger(i) && i >= 0 && i < INV_SLOTS;
}

// --- save / protocolo -------------------------------------------------------

/**
 * Forma ESPARSA do inventário: só os slots ocupados, cada um com o índice.
 * É o que viaja no `.ljw` e na mensagem `inventario` — mochila quase vazia
 * custa quase nada, e um slot novo no futuro não re-versiona nada.
 */
export interface SlotSalvo {
  slot: number;
  id: number;
  qtd: number;
}

/** Inventário → forma esparsa (ordenada por slot). */
export function inventarioParaSave(inv: Inventario): SlotSalvo[] {
  const out: SlotSalvo[] = [];
  inv.forEach((s, i) => {
    if (s) out.push({ slot: i, id: s.id, qtd: s.qtd });
  });
  return out;
}

/**
 * Forma esparsa → inventário, com parse DEFENSIVO (mesma disciplina do
 * `parseSaveMeta` e do protocolo): entrada que não é objeto, slot fora da
 * faixa, id/qtd não-numérico ou pilha acima do teto é PULADA — não derruba o
 * inventário inteiro. Slot repetido: o último vence.
 *
 * `undefined` (campo ausente no save antigo) devolve inventário vazio.
 */
export function parseInventario(raw: unknown): Inventario {
  const slots = inventarioVazio().slice();
  if (!Array.isArray(raw)) return slots;
  for (const e of raw) {
    if (typeof e !== "object" || e === null) continue;
    const r = e as Record<string, unknown>;
    const slot = r["slot"];
    const id = r["id"];
    const qtd = r["qtd"];
    if (typeof slot !== "number" || !slotValido(slot)) continue;
    if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) continue;
    if (typeof qtd !== "number" || !Number.isInteger(qtd) || qtd <= 0) continue;
    if (qtd > tamanhoStack(id)) continue;
    slots[slot] = { id, qtd };
  }
  return slots;
}
