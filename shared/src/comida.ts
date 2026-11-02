import {
  ITEM_BALDE_VAZIO,
  ITEM_AIPIM,
  ITEM_BANANA,
  ITEM_BATATA,
  ITEM_BATATA_COZIDA,
  ITEM_BETERRABA,
  ITEM_CENOURA,
  ITEM_FRUTA,
  ITEM_MELANCIA,
  ITEM_PAO,
  ITEM_BALDE_LEITE,
  ITEM_BOLO,
  ITEM_CARNE_ASSADA,
  ITEM_CARNE_CRUA,
  ITEM_FRANGO_ASSADO,
  ITEM_FRANGO_CRU,
  ITEM_PEIXE_ASSADO,
  ITEM_PEIXE_CRU,
} from "./blocks";

/**
 * §🍖 F6 — O QUE ALIMENTA, E QUANTO (2026-08-04). Módulo PURO, no molde do
 * `drops.ts`/`receitas.ts`: uma tabela e duas perguntas. Quem mexe no estado
 * vital é o `sobrevivencia.ts` (`saciar`); quem decide "este item some da
 * mochila" é a session. Aqui só mora a tabela.
 *
 * **Comer NÃO cura vida** — e isso é decisão, não esquecimento. A vida já volta
 * pela regeneração passiva do F2, que exige `FOME_PARA_REGENERAR` de barra: quem
 * come sara, mas sara pelo caminho que já existe. Ter as duas coisas faria a
 * comida ser curativo instantâneo e apagaria a única razão de a fome doer.
 *
 * Números do Minecraft (o modelo mental que aluno e professor já têm): fruta 4,
 * pão 5, cenoura 4, batata CRUA 1 (é o número do jogo — e é o que faz a
 * fornalha valer a pena no §🍖 F10h), batata assada 5, beterraba 1, melancia 2,
 * banana 4, aipim 4. A escala é a mesma da barra — `FOME_MAX` = 20 = 10 coxas.
 */

/** Quanto de fome cada item devolve. Fora da tabela = não se come. */
const SACIEDADE = new Map<number, number>([
  [ITEM_FRUTA, 4],
  [ITEM_PAO, 5],
  // §🍖 F10h (2026-08-06): as seis culturas + a batata assada da fornalha.
  [ITEM_CENOURA, 4],
  [ITEM_BATATA, 1], // crua, quase não alimenta — é o empurrão pra fornalha
  [ITEM_BATATA_COZIDA, 5], // a assada vale como o pão: o fim da cadeia
  [ITEM_BETERRABA, 1],
  [ITEM_MELANCIA, 2],
  [ITEM_BANANA, 4],
  [ITEM_AIPIM, 4],
  // §🐄 (2026-11-02): o que vem dos bichos. Cru alimenta pouco, assado como o
  // pão ou mais (números do Minecraft: bife 3/8, frango 2/6, peixe 2/5). O
  // leite mata a fome (pedido dele — no Minecraft ele só cura efeito) e o
  // BALDE VOLTA vazio pra mão. O bolo é o topo: 1 leite + 1 ovo + 2 trigo.
  [ITEM_CARNE_CRUA, 3],
  [ITEM_CARNE_ASSADA, 8],
  [ITEM_FRANGO_CRU, 2],
  [ITEM_FRANGO_ASSADO, 6],
  [ITEM_PEIXE_CRU, 2],
  [ITEM_PEIXE_ASSADO, 5],
  [ITEM_BALDE_LEITE, 3],
  [ITEM_BOLO, 8],
]);

/** Este item se come? (O trigo NÃO: é ingrediente do pão — é essa dependência
 *  que faz a plantação ensinar sequência em vez de virar um botão.) */
export function isComida(id: number): boolean {
  return SACIEDADE.has(id);
}

/**
 * O que FICA na mão depois de comer/beber (§🐄): o balde de leite devolve o
 * balde vazio. `null` = o item some inteiro, que é o caso de toda outra comida.
 */
export function recipienteDe(id: number): number | null {
  return id === ITEM_BALDE_LEITE ? ITEM_BALDE_VAZIO : null;
}

/** Pontos de fome que o item devolve (0 se não for comida). */
export function saciedadeDe(id: number): number {
  return SACIEDADE.get(id) ?? 0;
}
