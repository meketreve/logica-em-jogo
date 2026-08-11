import {
  BlockId,
  ITEM_PICARETA_DIAMANTE,
  ITEM_PICARETA_FERRO,
  ITEM_PICARETA_MADEIRA,
  ITEM_PICARETA_PEDRA,
  isFornalha,
  isSlab,
  isStairs,
  slabMaterial,
  stairsMaterial,
} from "./blocks";
import { type Inventario, contar } from "./inventario";

/**
 * §🍖 F10d (2026-08-05) — FERRAMENTAS. As duas decisões vieram do usuário:
 * **sem durabilidade** e **obrigatória pra minerar**.
 *
 * **Sem durabilidade** é o que mantém o save simples: a pilha continua sendo
 * `{id, qtd}` e nenhum campo novo entra em lugar nenhum. Durabilidade
 * contaminaria TODO o código de pilha (empilhar, mover, salvar, comparar), e é
 * exatamente por isso que ela ficou fora enquanto ninguém pediu. `tamanhoStack`
 * já dá 1 por slot pra ferramenta, como o balde.
 *
 * **Obrigatória pra minerar** muda a progressão da aula de propósito: quem
 * entra em sobrevivência **não pega pedra até fabricar a picareta de madeira**,
 * e é isso que dá sentido à cadeia inteira — madeira → picareta → pedra →
 * picareta de pedra → minério → fornalha → lingote → picareta de ferro →
 * diamante. ⚠️ Consequência a contar pro professor: a primeira coisa que a
 * turma faz numa aula de sobrevivência passa a ser derrubar árvore.
 *
 * **Só a PICARETA existe, e isso é uma decisão, não um esquecimento.** O
 * escopo anotado falava também em machado (madeira) e pá (terra/areia). Os dois
 * ficaram de fora por duas razões que se somam:
 *
 * 1. **Travariam a aula.** Madeira é o começo de tudo; exigir machado pra tirar
 *    madeira, quando o machado é feito DE madeira, é um mundo onde ninguém
 *    começa.
 * 2. **Não fariam nada.** Neste jogo a quebra é um clique instantâneo (não há
 *    tempo de quebra), então uma ferramenta que só ACELERA não tem onde
 *    aparecer. Machado e pá seriam 8 ids, 8 ícones e 8 receitas sem efeito
 *    nenhum na mesa do aluno.
 *
 * A tabela abaixo já é por (tipo × família), então o dia em que houver tempo de
 * quebra os dois entram sem redesenho.
 */

export type TipoFerramenta = "picareta";

/** Nível do material: cada um alcança tudo que os anteriores alcançam. */
export const NIVEL_MADEIRA = 1;
export const NIVEL_PEDRA = 2;
export const NIVEL_FERRO = 3;
export const NIVEL_DIAMANTE = 4;

export interface Ferramenta {
  readonly tipo: TipoFerramenta;
  readonly nivel: number;
  /** Nome em português, pro aviso do chat ("precisa de picareta de pedra"). */
  readonly nome: string;
}

/** Item → o que ele é. Set explícito: a banda ≥900 não é intervalo aberto. */
export const FERRAMENTAS: ReadonlyMap<number, Ferramenta> = new Map([
  [ITEM_PICARETA_MADEIRA, { tipo: "picareta" as const, nivel: NIVEL_MADEIRA, nome: "picareta de madeira" }],
  [ITEM_PICARETA_PEDRA, { tipo: "picareta" as const, nivel: NIVEL_PEDRA, nome: "picareta de pedra" }],
  [ITEM_PICARETA_FERRO, { tipo: "picareta" as const, nivel: NIVEL_FERRO, nome: "picareta de ferro" }],
  [ITEM_PICARETA_DIAMANTE, { tipo: "picareta" as const, nivel: NIVEL_DIAMANTE, nome: "picareta de diamante" }],
]);

/** O que este bloco EXIGE pra ser quebrado (`null` = a mão nua dá conta). */
export interface Exigencia {
  readonly tipo: TipoFerramenta;
  readonly nivel: number;
}

const PICARETA = (nivel: number): Exigencia => ({ tipo: "picareta", nivel });

/**
 * Blocos que exigem picareta, e de que nível.
 *
 * A régua é a do Minecraft, e ela é a própria cadeia: pedra e carvão saem com a
 * picareta mais barata (senão ninguém sai do lugar), ferro exige a de pedra,
 * ouro e diamante exigem a de ferro, e a obsidiana — que aqui é fabricada, não
 * achada — exige a de diamante, que é o que a mantém sendo o bloco difícil.
 *
 * **Terra, areia, madeira, folha, lã e vidro ficam de fora**: são o que o aluno
 * usa pra construir, e cobrar ferramenta neles transformaria uma aula de
 * construção numa aula de inventário.
 */
const EXIGE = new Map<number, Exigencia>([
  [BlockId.Stone, PICARETA(NIVEL_MADEIRA)],
  [BlockId.Cobblestone, PICARETA(NIVEL_MADEIRA)],
  [BlockId.Sandstone, PICARETA(NIVEL_MADEIRA)],
  [BlockId.StoneBricks, PICARETA(NIVEL_MADEIRA)],
  [BlockId.Brick, PICARETA(NIVEL_MADEIRA)],
  [BlockId.MinerioCarvao, PICARETA(NIVEL_MADEIRA)],
  [BlockId.MinerioFerro, PICARETA(NIVEL_PEDRA)],
  [BlockId.MinerioOuro, PICARETA(NIVEL_FERRO)],
  [BlockId.MinerioDiamante, PICARETA(NIVEL_FERRO)],
  [BlockId.Obsidian, PICARETA(NIVEL_DIAMANTE)],
]);

/** Materiais de laje/escada que são PEDRA (0 pedra, 2 tijolo; 1 é tábua). */
const MATERIAL_DE_PEDRA: ReadonlySet<number> = new Set([0, 2]);

/**
 * O que quebrar esta célula exige. Deriva das FAMÍLIAS onde elas existem —
 * escrever os 24 ids de escada à mão seria a garantia de esquecer um.
 */
export function exigenciaDe(blockId: number): Exigencia | null {
  const direto = EXIGE.get(blockId);
  if (direto) return direto;
  // laje e escada herdam do material (as de tábua saem com a mão)
  if (isSlab(blockId)) {
    return MATERIAL_DE_PEDRA.has(slabMaterial(blockId)) ? PICARETA(NIVEL_MADEIRA) : null;
  }
  if (isStairs(blockId)) {
    return MATERIAL_DE_PEDRA.has(stairsMaterial(blockId)) ? PICARETA(NIVEL_MADEIRA) : null;
  }
  // os 36 glifos são pedregulho escrito, e a fornalha é 8 pedregulhos
  if (blockId >= BlockId.LetterA && blockId <= BlockId.Digit9) return PICARETA(NIVEL_MADEIRA);
  if (isFornalha(blockId)) return PICARETA(NIVEL_MADEIRA);
  return null;
}

/**
 * A melhor ferramenta DESTE tipo que o jogador tem (nível 0 = nenhuma).
 *
 * **Olha a MOCHILA inteira, não a mão.** É uma escolha de sala de aula: "você
 * precisa de uma picareta" é uma frase que a criança resolve; "você precisa
 * dela na MÃO, e não na mochila" é um segundo enigma em cima do primeiro, e o
 * clique não tem como explicar qual dos dois falhou. Como consequência, o
 * servidor também não precisa saber qual slot está selecionado — e o
 * `break_block` continua sendo três coordenadas.
 */
export function melhorNivel(inv: Inventario, tipo: TipoFerramenta): number {
  let nivel = 0;
  for (const [id, f] of FERRAMENTAS) {
    if (f.tipo !== tipo) continue;
    if (f.nivel <= nivel) continue;
    if (contar(inv, id) > 0) nivel = f.nivel;
  }
  return nivel;
}

/** O nome PT da ferramenta de um (tipo × nível), ou `null` se não existe uma. */
export function nomeDaFerramenta(tipo: TipoFerramenta, nivel: number): string | null {
  return (
    [...FERRAMENTAS.values()].find((f) => f.tipo === tipo && f.nivel === nivel)?.nome ?? null
  );
}

/**
 * §💬 (tooltip) — os blocos que passam a sair com esta ferramenta, e SÓ eles:
 * os de nível menor já saíam com a anterior, então listá-los de novo faria toda
 * picareta dizer a mesma coisa. É o "serve pra quê" da picareta escrito com a
 * tabela que já decide a quebra — sem uma segunda lista pra sair de sincronia.
 *
 * Só o que está no `EXIGE` direto: laje, escada e glifo herdam do material e
 * apareceriam como dezenas de ids repetindo "pedra", que é ruído num tooltip.
 */
export function liberadosPor(tipo: TipoFerramenta, nivel: number): readonly number[] {
  const ids: number[] = [];
  for (const [id, ex] of EXIGE) {
    if (ex.tipo === tipo && ex.nivel === nivel) ids.push(id);
  }
  return ids;
}

/**
 * O jogador consegue quebrar esta célula? `null` = sim; string = o AVISO que
 * ele vai ler no chat.
 *
 * A decisão do usuário: sem a ferramenta certa o bloco **NÃO QUEBRA**, com
 * aviso — e não "quebra e não cai nada", que é o que o Minecraft faz. Lá existe
 * tempo de quebra pra avisar antes; aqui é um clique instantâneo, e "sumiu e eu
 * não ganhei nada" é frustração de aula, não desafio.
 */
export function faltaFerramenta(inv: Inventario, blockId: number): string | null {
  const exige = exigenciaDe(blockId);
  if (!exige) return null;
  if (melhorNivel(inv, exige.tipo) >= exige.nivel) return null;
  const nome = nomeDaFerramenta(exige.tipo, exige.nivel);
  return `Você precisa de uma ${nome ?? exige.tipo} para quebrar isso.`;
}
