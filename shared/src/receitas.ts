import { BlockId, ITEM_BALDE_VAZIO, ITEM_PAO, ITEM_TRIGO } from "./blocks";
import {
  type Inventario,
  type Stack,
  adicionar,
  cabe,
  contar,
  remover,
} from "./inventario";

/**
 * §🍖 F5 — CRAFT POR LISTA (receitas puras).
 *
 * Módulo PURO, no molde do `inventario.ts`/`drops.ts`: sem I/O, sem rede. O
 * servidor valida e aplica (`fabricar`), o cliente só PEDE por índice — nunca
 * decide. **Grade 3×3 descartada** (arrastar dói no tablet, ROADMAP §🍖): o
 * jogador escolhe uma receita da lista e o servidor consome os ingredientes e
 * entrega a saída, tudo ou nada.
 *
 * **Sem bancada no lite.** Fabrica em qualquer lugar. O dia em que a bancada
 * servir pra ESCALONAR receitas avançadas, ela vira um campo `exige?` aqui —
 * sem tocar em quem chama.
 *
 * O índice na lista `RECEITAS` é a IDENTIDADE da receita no protocolo (a
 * mensagem `fabricar` manda o índice). Por isso a ordem é APPEND-only, como o
 * `BlockId`: inserir no meio deslocaria o que o cliente já conhece. Receita
 * nova entra no fim.
 */

/** Uma receita: o que sai + a lista de ingredientes (ids DISTINTOS entre si). */
export interface Receita {
  readonly saida: Stack;
  readonly custo: readonly Stack[];
}

/**
 * As receitas do lite. Sem fundição (não há forno no lite), então o universo é
 * madeira e pedra — as duas cadeias que ensinam DEPENDÊNCIA e SEQUÊNCIA
 * (tronco → tábuas → escada), que é a pedagogia. Cada tronco de espécie
 * diferente vira tábuas: são entradas separadas de propósito, pra a lista
 * mostrar ao aluno QUAL madeira ele pode usar.
 *
 * O balde fecha o pendente do F4 (era só item de criativo): 3 minérios de ferro
 * viram 1 balde vazio. Não é o número do Minecraft (lá são 3 lingotes), mas no
 * lite não há fundição pra transformar minério em lingote — o minério cru é o
 * material mais próximo, e o balde é o que destrava a água em sobrevivência.
 *
 * O **pão** (§🍖 F6) é a única receita de COMIDA, e é ela que dá sentido à
 * plantação: o trigo colhido não se come, então plantar → esperar → colher →
 * fabricar é uma cadeia de 4 passos com dependência de tempo no meio. É a mesma
 * pedagogia do tronco → tábua → escada, só que a recompensa é sobreviver.
 */
export const RECEITAS: readonly Receita[] = [
  // --- madeira ---
  { saida: { id: BlockId.Planks, qtd: 4 }, custo: [{ id: BlockId.Log, qtd: 1 }] },
  { saida: { id: BlockId.Planks, qtd: 4 }, custo: [{ id: BlockId.LogIpe, qtd: 1 }] },
  { saida: { id: BlockId.Planks, qtd: 4 }, custo: [{ id: BlockId.LogAraucaria, qtd: 1 }] },
  { saida: { id: BlockId.Planks, qtd: 4 }, custo: [{ id: BlockId.LogPauBrasil, qtd: 1 }] },
  { saida: { id: BlockId.LajeTabuaBaixo, qtd: 6 }, custo: [{ id: BlockId.Planks, qtd: 3 }] },
  { saida: { id: BlockId.EscadaTabuaXP, qtd: 4 }, custo: [{ id: BlockId.Planks, qtd: 6 }] },
  { saida: { id: BlockId.Mesa, qtd: 1 }, custo: [{ id: BlockId.Planks, qtd: 4 }] },
  { saida: { id: BlockId.Cerca, qtd: 3 }, custo: [{ id: BlockId.Planks, qtd: 4 }] },
  // --- pedra ---
  { saida: { id: BlockId.LajePedraBaixo, qtd: 6 }, custo: [{ id: BlockId.Cobblestone, qtd: 3 }] },
  { saida: { id: BlockId.EscadaPedraXP, qtd: 4 }, custo: [{ id: BlockId.Cobblestone, qtd: 6 }] },
  // --- ferramenta ---
  { saida: { id: ITEM_BALDE_VAZIO, qtd: 1 }, custo: [{ id: BlockId.MinerioFerro, qtd: 3 }] },
  // --- comida (§🍖 F6) — APPEND no fim, como manda a regra do índice ---
  { saida: { id: ITEM_PAO, qtd: 1 }, custo: [{ id: ITEM_TRIGO, qtd: 3 }] },
];

/** A receita EXISTE? (o índice veio pelo fio — aqui é onde ele para) */
export function receitaValida(indice: number): boolean {
  return Number.isInteger(indice) && indice >= 0 && indice < RECEITAS.length;
}

/** O jogador tem TODOS os ingredientes? (ainda não olha se a saída cabe) */
export function temIngredientes(inv: Inventario, receita: Receita): boolean {
  return receita.custo.every((c) => contar(inv, c.id) >= c.qtd);
}

/**
 * Dá pra fabricar AGORA? Precisa de todos os ingredientes E de lugar pra saída.
 * A saída quase sempre cabe (consumir liberou slot), mas uma mochila cheia de
 * outros ids com a saída de tipo novo pode não caber — e aí a UI mostra
 * "mochila cheia" em vez de deixar o clique sumir com os ingredientes.
 */
export function podeFabricar(inv: Inventario, receita: Receita): boolean {
  return fabricar(inv, receita) !== null;
}

/**
 * Consome os ingredientes e entrega a saída. **Tudo ou nada:** trabalha numa
 * cópia e só devolve o inventário novo se cada ingrediente saiu E a saída
 * coube; qualquer furo devolve `null` e nada é gasto. É a mesma disciplina do
 * `remover` (gasto parcial não existe).
 */
export function fabricar(inv: Inventario, receita: Receita): Inventario | null {
  let atual = inv;
  for (const c of receita.custo) {
    const { inv: depois, removido } = remover(atual, c.id, c.qtd);
    if (removido < c.qtd) return null;
    atual = depois;
  }
  if (!cabe(atual, receita.saida.id, receita.saida.qtd)) return null;
  return adicionar(atual, receita.saida.id, receita.saida.qtd).inv;
}

/** Quanto FALTA de cada ingrediente (`have`/`need` por id), pra a lista mostrar
 *  "falta 3 tábua". `falta` é 0 quando o jogador já tem o bastante. */
export function ingredientesDe(
  inv: Inventario,
  receita: Receita,
): readonly { id: number; need: number; have: number; falta: number }[] {
  return receita.custo.map((c) => {
    const have = contar(inv, c.id);
    return { id: c.id, need: c.qtd, have, falta: Math.max(0, c.qtd - have) };
  });
}
