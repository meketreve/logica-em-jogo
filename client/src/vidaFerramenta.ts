import { type Slot, vidaDe } from "@logica/shared";

/**
 * §🔨 Ferramentas v2 — a BARRA DE VIDA da ferramenta dentro do slot.
 *
 * Decisão do usuário: durabilidade com barra por ferramenta. Ela só aparece em
 * ferramenta JÁ GASTA — uma barra cheia em toda picataxe nova seria ruído em
 * todo slot, e o que a criança precisa perceber é "esta aqui vai acabar".
 *
 * A cor é a informação: verde enquanto sobra, amarelo perto do fim, vermelho no
 * finzinho. Sem número, porque "37/59" não é uma frase de 5º ano.
 */

/** Fração de vida (0..1) da pilha, ou `null` se ela não é ferramenta gasta. */
export function fracaoDeVida(pilha: Slot): number | null {
  if (!pilha) return null;
  const v = vidaDe(pilha);
  if (!v || v.atual >= v.max) return null; // inteira: sem barra
  return Math.max(0, v.atual / v.max);
}

/** Verde (cheia) → amarelo (metade) → vermelho (acabando). */
export function corDaVida(f: number): string {
  if (f > 0.5) return "#5bd75b";
  if (f > 0.2) return "#e8d34a";
  return "#e05a4a";
}

/** A barrinha como HTML (a hotbar monta seus slots por string). */
export function barraDeVidaHtml(pilha: Slot): string {
  const f = fracaoDeVida(pilha);
  if (f === null) return "";
  return `<span class="vida"><i style="width:${Math.round(f * 100)}%;--vida-cor:${corDaVida(f)}"></i></span>`;
}

/** A mesma barrinha como elemento (o painel da mochila monta por DOM). */
export function barraDeVidaEl(pilha: Slot): HTMLElement | null {
  const f = fracaoDeVida(pilha);
  if (f === null) return null;
  const fora = document.createElement("span");
  fora.className = "vida";
  const dentro = document.createElement("i");
  dentro.style.width = `${Math.round(f * 100)}%`;
  dentro.style.setProperty("--vida-cor", corDaVida(f));
  fora.appendChild(dentro);
  return fora;
}
