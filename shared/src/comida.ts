import { ITEM_FRUTA, ITEM_PAO } from "./blocks";

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
 * pão 5. A escala é a mesma da barra — `FOME_MAX` = 20 = 10 coxas.
 */

/** Quanto de fome cada item devolve. Fora da tabela = não se come. */
const SACIEDADE = new Map<number, number>([
  [ITEM_FRUTA, 4],
  [ITEM_PAO, 5],
]);

/** Este item se come? (O trigo NÃO: é ingrediente do pão — é essa dependência
 *  que faz a plantação ensinar sequência em vez de virar um botão.) */
export function isComida(id: number): boolean {
  return SACIEDADE.has(id);
}

/** Pontos de fome que o item devolve (0 se não for comida). */
export function saciedadeDe(id: number): number {
  return SACIEDADE.get(id) ?? 0;
}
