import { plantaDe } from "./blocks";
import { isComida, saciedadeDe } from "./comida";
import {
  FERRAMENTAS,
  exigenciaDe,
  liberadosPor,
  nomeDaFerramenta,
} from "./ferramentas";
import { COMBUSTIVEIS, COZIMENTO, TICKS_POR_COZIMENTO } from "./fornalha";
import type { Stack } from "./inventario";

/**
 * §💬 UI de jogo — "SERVE PRA QUÊ?", a resposta que o tooltip mostra.
 *
 * Módulo PURO, no molde do `drops.ts`/`comida.ts`: uma pergunta e nenhum
 * estado. Ele não inventa dado nenhum — **lê as mesmas tabelas que decidem o
 * jogo** (`comida`, `fornalha`, `ferramentas`, `PLANTAS`). Essa é a regra que
 * dá sentido ao arquivo: uma lista escrita à mão pro tooltip sairia de sincronia
 * no primeiro item novo, e o aluno leria mentira. Item novo aqui é de graça —
 * ele entra na tabela do jogo e o tooltip conta sozinho.
 *
 * Devolve FATO, não frase: quem monta o texto é o cliente, que é quem tem o
 * nome PT de um id (`nameOf`) e a largura da tela. O `shared` não sabe desenhar.
 *
 * ⚠️ A durabilidade das ferramentas (§🔨 do `todo.md`) entra aqui quando
 * existir — é o lugar já preparado pra ela.
 */
export type Uso =
  /** É ferramenta: o nome dela e os blocos que ELA destrava (nível exato). */
  | { readonly tipo: "ferramenta"; readonly nome: string; readonly libera: readonly number[] }
  /** Come-se: quantos pontos de fome devolve (escala de `FOME_MAX` = 20). */
  | { readonly tipo: "comida"; readonly fome: number }
  /** Vira outra coisa na fornalha. */
  | { readonly tipo: "funde"; readonly saida: Stack }
  /** Queima na fornalha: quantos cozimentos um item rende. */
  | { readonly tipo: "combustivel"; readonly cozimentos: number }
  /** É muda de plantação: o item que ela devolve quando madura. */
  | { readonly tipo: "colheita"; readonly item: number }
  /** É bloco que exige ferramenta pra quebrar (só vale em sobrevivência). */
  | { readonly tipo: "exigeFerramenta"; readonly ferramenta: string };

/**
 * Tudo que se sabe dizer sobre um id, na ordem em que a criança precisa ler:
 * primeiro o que o item FAZ na mão dela (ferramenta, comida), depois o que ele
 * VIRA (fornalha, colheita), e por último o que ele EXIGE. Lista vazia = item
 * sem uso mecânico (bloco de construção) — e aí o tooltip é só o nome, que já
 * era o pedido original.
 */
export function usosDoItem(id: number): readonly Uso[] {
  const usos: Uso[] = [];

  const f = FERRAMENTAS.get(id);
  if (f) usos.push({ tipo: "ferramenta", nome: f.nome, libera: liberadosPor(f.tipo, f.nivel) });

  if (isComida(id)) usos.push({ tipo: "comida", fome: saciedadeDe(id) });

  const saida = COZIMENTO.get(id);
  if (saida) usos.push({ tipo: "funde", saida });

  const ticks = COMBUSTIVEIS.get(id);
  if (ticks !== undefined) {
    usos.push({ tipo: "combustivel", cozimentos: Math.round(ticks / TICKS_POR_COZIMENTO) });
  }

  const planta = plantaDe(id);
  if (planta) usos.push({ tipo: "colheita", item: planta.colheita });

  const exige = exigenciaDe(id);
  if (exige) {
    const nome = nomeDaFerramenta(exige.tipo, exige.nivel);
    if (nome) usos.push({ tipo: "exigeFerramenta", ferramenta: nome });
  }

  return usos;
}
