import {
  BlockId,
  escadaId,
  isAgua,
  isCadeira,
  isCama,
  isFolhas,
  isJanela,
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
  return id;
}

/**
 * Exceções à regra "cai ele mesmo". `null` = não cai nada.
 *
 * - **grama → terra** (as três variantes climáticas): o número do Minecraft, e
 *   o que impede o aluno de fabricar tapete de grama no meio da pedra.
 * - **pedra → pedregulho**: idem. É o par que dá sentido ao craft do F5.
 * - **folha → nada**: a folha é copa de árvore gerada, não material. É daqui
 *   que a FRUTA vai cair quando o F6 existir — a entrada já tem lugar.
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
 * O que o jogador ganha ao quebrar esta célula. Lista (e não pilha única)
 * porque o F6 vai querer "folha → 1 fruta às vezes" e o minério, um dia, "1
 * bruto + carvão": a assinatura já aguenta, sem tocar em quem chama.
 */
export function dropsDe(blockId: number): readonly Stack[] {
  if (blockId === BlockId.Air) return [];
  if (isAgua(blockId)) return [];
  if (isFolhas(blockId)) return [];
  if (EXCECOES.has(blockId)) {
    const alvo = EXCECOES.get(blockId) ?? null;
    return alvo === null ? [] : [{ id: alvo, qtd: 1 }];
  }
  return [{ id: formaCanonica(blockId), qtd: 1 }];
}
