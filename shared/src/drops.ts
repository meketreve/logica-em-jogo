import {
  BlockId,
  ITEM_FRUTA,
  ITEM_TRIGO,
  escadaId,
  isAgua,
  isCadeira,
  isCama,
  isFolhas,
  isGramaAlta,
  isJanela,
  isPlantacao,
  isPlantacaoMadura,
  isPorta,
  isQuadro,
  isSlab,
  isSofa,
  isStairs,
  slabMaterial,
  stairsMaterial,
} from "./blocks";
import type { Stack } from "./inventario";

/**
 * §🍖 F4 — o que CAI ao quebrar um bloco. Tabela pura: entra o byte que estava
 * na célula, sai a lista de pilhas que vão pra mochila.
 *
 * Duas regras e uma tabela de exceções:
 *
 * 1. **Forma canônica.** Uma família de blocos tem vários bytes (porta aberta,
 *    cama virada pro sul, escada de cabeça pra baixo) mas UMA entrada na
 *    hotbar. Quebrar devolve sempre a entrada da hotbar, senão o aluno ganharia
 *    um item que não sabe recolocar — e a direção/metade sai do olhar dele no
 *    `place_block`, não do byte guardado.
 * 2. **Por padrão, o bloco cai ele mesmo** — é o que faz construir e desfazer
 *    ser reversível numa aula. Só o que está na tabela abaixo foge disso.
 *
 * ⚠️ **O drop é do `break_block` do JOGADOR, não das regras de vizinhança.**
 * Quebrar uma metade da porta faz o `doorRule` apagar a outra no tick seguinte;
 * essa segunda remoção NÃO passa por aqui, senão uma porta viraria duas.
 * Mesma coisa pra cama, tocha sem apoio, areia que cai e água que seca.
 */

/** Bytes cuja família tem várias direções/metades → a entrada da hotbar. */
export function formaCanonica(id: number): number {
  if (isPorta(id)) return BlockId.PortaXFechada;
  if (isJanela(id)) return BlockId.JanelaXFechada;
  if (isCama(id)) return BlockId.CamaXP;
  if (isCadeira(id)) return BlockId.CadeiraXP;
  if (isSofa(id)) return BlockId.SofaXP;
  if (isQuadro(id)) return BlockId.QuadroXP;
  if (isSlab(id)) return BlockId.LajePedraBaixo + slabMaterial(id) * 2;
  if (isStairs(id)) return escadaId(stairsMaterial(id), 0, false);
  // §🍖 F6: os 4 estágios da plantação têm UMA entrada na mochila — a muda. É a
  // mesma razão da porta: o aluno guarda o que sabe replantar.
  if (isPlantacao(id)) return BlockId.Plantacao0;
  return id;
}

/**
 * Exceções à regra "cai ele mesmo". `null` = não cai nada.
 *
 * - **grama → terra** (as três variantes climáticas): o número do Minecraft, e
 *   o que impede o aluno de fabricar tapete de grama no meio da pedra.
 * - **pedra → pedregulho**: idem. É o par que dá sentido ao craft do F5.
 * - **água → nada**: só o balde recolhe fonte (a mecânica é do `case "balde"`).
 * - **rocha-matriz → nada**: `isBreakable` já barra o jogador; a tabela é o
 *   cinto além do suspensório, porque `/bloco` do professor remove.
 */
const EXCECOES = new Map<number, number | null>([
  [BlockId.Grass, BlockId.Dirt],
  [BlockId.GramaSeca, BlockId.Dirt],
  [BlockId.GramaFria, BlockId.Dirt],
  [BlockId.Stone, BlockId.Cobblestone],
  [BlockId.Bedrock, null],
]);

/**
 * §🍖 F6 — as duas exceções SORTEADAS, e as únicas do jogo.
 *
 * A folha é a fonte PASSIVA de comida: quem só explora o mundo não passa fome,
 * e nenhuma aula trava porque a turma não entendeu a horta. A grama alta é a
 * porta de entrada da fonte ATIVA — sem semente não há plantação, e é caçando
 * capim que o aluno começa a cadeia.
 *
 * As chances são MUITO mais generosas que as do Minecraft (maçã de folha lá é
 * 1/200) porque aqui a unidade de tempo é a aula, não a temporada: 1 em 8 dá
 * fruta em meia dúzia de folhas, e 1 em 4 dá a primeira semente no primeiro
 * tufo de capim que o aluno derruba.
 */
export const CHANCE_FRUTA_DA_FOLHA = 1 / 8;
export const CHANCE_SEMENTE_DO_CAPIM = 1 / 4;

/**
 * O que o jogador ganha ao quebrar esta célula. Lista (e não pilha única)
 * porque a plantação madura devolve DUAS coisas (o trigo e a muda de replantar)
 * e o minério, um dia, vai querer "1 bruto + carvão".
 *
 * `sorteio` é injetável só por causa do teste: é a única parte não determinística
 * da tabela, e um drop aleatório que não dá pra fixar não se prova.
 */
export function dropsDe(
  blockId: number,
  sorteio: () => number = Math.random,
): readonly Stack[] {
  if (blockId === BlockId.Air) return [];
  if (isAgua(blockId)) return [];
  // folha → fruta ÀS VEZES (a folha em si continua não sendo material)
  if (isFolhas(blockId)) {
    return sorteio() < CHANCE_FRUTA_DA_FOLHA ? [{ id: ITEM_FRUTA, qtd: 1 }] : [];
  }
  // capim → semente às vezes (e nunca o próprio capim: é decoração do gen, e
  // devolvê-lo daria ao aluno um tapete de mato infinito)
  if (isGramaAlta(blockId)) {
    return sorteio() < CHANCE_SEMENTE_DO_CAPIM ? [{ id: BlockId.Plantacao0, qtd: 1 }] : [];
  }
  // plantação MADURA: colhe o trigo E devolve a muda — replantar é o passo que
  // fecha o ciclo, e cobrar uma semente nova a cada colheita transformaria a
  // horta num gargalo de sorte em vez de uma sequência.
  if (isPlantacaoMadura(blockId)) {
    return [
      { id: ITEM_TRIGO, qtd: 1 },
      { id: BlockId.Plantacao0, qtd: 1 },
    ];
  }
  if (EXCECOES.has(blockId)) {
    const alvo = EXCECOES.get(blockId) ?? null;
    return alvo === null ? [] : [{ id: alvo, qtd: 1 }];
  }
  return [{ id: formaCanonica(blockId), qtd: 1 }];
}
