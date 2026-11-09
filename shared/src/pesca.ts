import { BlockId, ITEM_COURO, ITEM_PEIXE_CRU, ITEM_PENA } from "./blocks";
import { SERVER_TICK_RATE } from "./constants";
import type { Stack } from "./inventario";

/**
 * §🎣 A PESCA (2026-11-09) — a regra PURA, no molde do `drops.ts`: nenhum
 * estado, nenhum relógio de parede. Quem conta ticks e sorteia é a sessão
 * (`session/pesca.ts`), com o `rand` dela; aqui só moram os números e as
 * perguntas.
 *
 * As decisões DELE (09/11), que são o formato inteiro deste arquivo:
 *
 * 1. **Abstrata, como no Minecraft.** O peixe sai de QUALQUER água, por um
 *    tempo sorteado — e não do peixe-bicho do lago. O peixe-bicho não se
 *    reproduz e cada coluna é povoada uma vez só: pescar o bicho esvaziaria o
 *    lago pra sempre, e mundo de aula nem tem bicho natural.
 * 2. **Tem de clicar na fisgada.** A boia afunda e há uma JANELA pra puxar;
 *    o relógio dela é do SERVIDOR, medido na chegada do clique (o tablet não
 *    decide nada). 2 s porque o Wi-Fi da escola atrasa — o Minecraft dá menos.
 * 3. **Sem tesouro.** Tudo o que sai daqui tem de ficar FORA da tabela de
 *    venda, senão a pesca parada vira renda infinita de Dimas — o portão está
 *    em `pesca.test.ts`, lendo o `precoDeVenda` de verdade.
 * 4. **No criativo DÁ peixe** (diverge dos bichos, onde nada se ganha) — quem
 *    cuida disso é a sessão; a tabela é a mesma.
 */

/** Distância máxima (blocos, do olho ao centro da célula) pra lançar a boia —
 *  a vara alcança mais que a mão (`PLAYER_REACH` = 5). Só pra este raycast. */
export const ALCANCE_PESCA = 12;

/** Quem se afasta mais que isto da boia recolhe a linha sem querer. */
export const LONGE_DA_BOIA = 16;

/** Espera até a fisgada: 5 a 20 s, sorteada por lançamento. */
export const ESPERA_MIN_TICKS = 5 * SERVER_TICK_RATE;
export const ESPERA_MAX_TICKS = 20 * SERVER_TICK_RATE;

/** Quanto tempo a boia fica afundada esperando o puxão (decisão 2). */
export const JANELA_FISGADA_TICKS = 2 * SERVER_TICK_RATE;

/** Chance de sair peixe (o resto é lixo) — 85 em 100. */
export const CHANCE_PEIXE = 0.85;

/**
 * O "lixo" que a linha traz: coisas que já existem, NENHUMA com preço. O
 * graveto estava aqui e o portão de `pesca.test.ts` o derrubou (vale 1 Dimas);
 * o couro faz o papel da "bota velha" — raro, e ainda sem receita.
 */
export const LIXO_DA_PESCA: readonly { readonly id: number; readonly peso: number }[] = [
  { id: BlockId.Leaves, peso: 3 },
  { id: ITEM_PENA, peso: 2 },
  { id: ITEM_COURO, peso: 1 },
];

/** Tudo o que pode sair da água — a lista que o tooltip e o portão de venda leem. */
export const SAI_DA_PESCA: readonly number[] = [ITEM_PEIXE_CRU, ...LIXO_DA_PESCA.map((l) => l.id)];

/** Quantos ticks até fisgar, dado um sorteio `r` em [0, 1). */
export function esperaDaPesca(r: number): number {
  const k = Math.min(Math.max(r, 0), 0.999999);
  return ESPERA_MIN_TICKS + Math.floor(k * (ESPERA_MAX_TICKS - ESPERA_MIN_TICKS + 1));
}

/** O que a linha trouxe: `r1` decide peixe × lixo, `r2` qual lixo. */
export function sortearPesca(r1: number, r2: number): Stack {
  if (r1 < CHANCE_PEIXE) return { id: ITEM_PEIXE_CRU, qtd: 1 };
  const total = LIXO_DA_PESCA.reduce((s, l) => s + l.peso, 0);
  let alvo = Math.min(Math.max(r2, 0), 0.999999) * total;
  for (const l of LIXO_DA_PESCA) {
    if (alvo < l.peso) return { id: l.id, qtd: 1 };
    alvo -= l.peso;
  }
  return { id: LIXO_DA_PESCA[0]!.id, qtd: 1 };
}

/**
 * Em que pé está a pescaria, no tick `t`, pra quem fisgou em `fisgaEm`:
 * - `"esperando"` — a boia ainda não afundou (puxar agora recolhe vazia);
 * - `"fisgado"` — afundada, dentro da janela (puxar agora PEGA);
 * - `"escapou"` — a janela passou sem puxão (o peixe foi embora; a espera
 *   recomeça — quem decide isso é a sessão).
 */
export type FaseDaPesca = "esperando" | "fisgado" | "escapou";

export function faseDaPesca(t: number, fisgaEm: number): FaseDaPesca {
  if (t < fisgaEm) return "esperando";
  if (t < fisgaEm + JANELA_FISGADA_TICKS) return "fisgado";
  return "escapou";
}
