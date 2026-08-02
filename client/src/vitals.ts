/**
 * HUD de vida (§🍖 F2) — corações, bolhas de ar e o feedback de levar dano.
 *
 * DOM e CSS próprios, injetados aqui (self-contained, padrão do `loading.ts` e
 * do `touch.ts`): o `index.html` não sabe que este HUD existe.
 *
 * **A UI nunca decide.** Quem machuca, cura e mata é o servidor; aqui só se
 * DESENHA o que a mensagem `vida` disser — mesma disciplina do `inventory.ts`.
 * Em criativo o painel some inteiro (sem coração, sem bolha).
 *
 * Coração = 2 pontos (escala do Minecraft, o modelo mental que aluno e
 * professor já têm): 20 pontos = 10 corações, e vida ímpar mostra meio coração.
 */

import { FOLEGO_TICKS, VIDA_MAX } from "@logica/shared";

const CORACOES = 10;
const BOLHAS = 10;
/** Ticks de ar por bolha desenhada (a mesma conta que o servidor usa pra
 *  decidir quando vale mandar `vida` — ver `GameSession.bolhas`). */
const TICKS_POR_BOLHA = FOLEGO_TICKS / BOLHAS;

const CSS = `
#lj-vitals {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  /* logo acima da hotbar (que fica no rodapé) */
  bottom: 96px;
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  pointer-events: none;
  z-index: 12;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}
#lj-vitals.ativo { display: flex; }
#lj-vitals .linha { display: flex; gap: 2px; height: 18px; }
#lj-vitals .linha.vazia { display: none; }
#lj-vitals .icone {
  width: 18px;
  height: 18px;
  background-size: 18px 18px;
  background-repeat: no-repeat;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.7));
}
/* o "meio" recorta o ícone cheio pela METADE da esquerda */
#lj-vitals .icone.meio { clip-path: inset(0 50% 0 0); }
#lj-vitals .fundo { position: absolute; opacity: 0.35; }
#lj-vitals .casa { position: relative; width: 18px; height: 18px; }

/* dano: vinheta vermelha curta nas bordas — sem cobrir o meio da tela, que é
   onde o aluno está mirando */
#lj-dano {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  z-index: 11;
  background: radial-gradient(ellipse at center, rgba(180, 0, 0, 0) 45%, rgba(180, 0, 0, 0.55) 100%);
  transition: opacity 420ms ease-out;
}
#lj-dano.piscar { opacity: 1; transition: opacity 60ms ease-in; }

/* morte: aviso curto no meio, some sozinho (o respawn já aconteceu) */
#lj-morte {
  position: fixed;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 13;
  background: rgba(90, 0, 0, 0.35);
  color: #fff;
  font: 700 28px/1.3 system-ui, sans-serif;
  text-align: center;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
}
#lj-morte.ativo { display: flex; }
`;

/** Coração e bolha como SVG embutido (data URI) — zero asset externo, igual ao
 *  atlas procedural: o projeto não carrega imagem de fora. */
function svgUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
const CORACAO = svgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 14.5 1.8 8.3a3.8 3.8 0 0 1 5.4-5.4L8 3.7l.8-.8a3.8 3.8 0 0 1 5.4 5.4z" fill="#e23b3b" stroke="#5a0d0d" stroke-width="1.2"/></svg>`,
);
const CORACAO_VAZIO = svgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 14.5 1.8 8.3a3.8 3.8 0 0 1 5.4-5.4L8 3.7l.8-.8a3.8 3.8 0 0 1 5.4 5.4z" fill="#1a1a1a" stroke="#000" stroke-width="1.2"/></svg>`,
);
const BOLHA = svgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#7fd4ff" stroke="#0a3550" stroke-width="1.2"/><circle cx="5.8" cy="5.8" r="1.6" fill="#fff" opacity="0.9"/></svg>`,
);

/** O que o servidor mandou na última mensagem `vida`. */
export interface VidaInfo {
  vida: number;
  folego?: number;
  causa?: string;
  morreu?: boolean;
}

export class VitalsUi {
  private readonly raiz: HTMLDivElement;
  private readonly linhaVida: HTMLDivElement;
  private readonly linhaAr: HTMLDivElement;
  private readonly dano: HTMLDivElement;
  private readonly morte: HTMLDivElement;
  private readonly casasVida: HTMLDivElement[] = [];
  private readonly casasAr: HTMLDivElement[] = [];
  private morteTimer: number | null = null;
  private danoTimer: number | null = null;
  /** Última vida desenhada — o "levou dano" sai da DIFERENÇA, não de adivinhar. */
  private ultimaVida = VIDA_MAX;
  private visivel = false;

  constructor() {
    const estilo = document.createElement("style");
    estilo.textContent = CSS;
    document.head.appendChild(estilo);

    this.raiz = document.createElement("div");
    this.raiz.id = "lj-vitals";
    this.linhaVida = document.createElement("div");
    this.linhaVida.className = "linha";
    this.linhaAr = document.createElement("div");
    this.linhaAr.className = "linha vazia";
    for (let i = 0; i < CORACOES; i++) {
      const casa = document.createElement("div");
      casa.className = "casa";
      const fundo = document.createElement("div");
      fundo.className = "icone fundo";
      fundo.style.backgroundImage = CORACAO_VAZIO;
      const frente = document.createElement("div");
      frente.className = "icone";
      frente.style.backgroundImage = CORACAO;
      casa.append(fundo, frente);
      this.linhaVida.appendChild(casa);
      this.casasVida.push(casa);
    }
    for (let i = 0; i < BOLHAS; i++) {
      const casa = document.createElement("div");
      casa.className = "casa";
      const frente = document.createElement("div");
      frente.className = "icone";
      frente.style.backgroundImage = BOLHA;
      casa.appendChild(frente);
      this.linhaAr.appendChild(casa);
      this.casasAr.push(casa);
    }
    this.raiz.append(this.linhaAr, this.linhaVida);
    document.body.appendChild(this.raiz);

    this.dano = document.createElement("div");
    this.dano.id = "lj-dano";
    this.morte = document.createElement("div");
    this.morte.id = "lj-morte";
    document.body.append(this.dano, this.morte);
  }

  /** Liga/desliga o painel inteiro — criativo não tem coração nem bolha. */
  setVisivel(v: boolean): void {
    this.visivel = v;
    this.raiz.classList.toggle("ativo", v);
    if (!v) this.esconderMorte();
  }

  /** Aplica a mensagem `vida` do servidor. */
  aplicar(info: VidaInfo): void {
    const vida = Math.max(0, Math.min(VIDA_MAX, Math.round(info.vida)));
    this.desenharVida(vida);
    this.desenharAr(info.folego);
    // levou dano = vida caiu (o `causa` confirma, mas a queda de vida basta e
    // funciona mesmo com host antigo que não mande a causa)
    if (vida < this.ultimaVida && this.visivel) this.piscarDano();
    if (info.morreu && this.visivel) this.mostrarMorte(info.causa);
    this.ultimaVida = vida;
  }

  private desenharVida(vida: number): void {
    for (const [i, casa] of this.casasVida.entries()) {
      const frente = casa.children[1] as HTMLElement | undefined;
      if (!frente) continue;
      const cheio = vida >= (i + 1) * 2;
      const meio = !cheio && vida === i * 2 + 1;
      frente.style.display = cheio || meio ? "block" : "none";
      frente.classList.toggle("meio", meio);
    }
  }

  /** Bolhas só aparecem com o fôlego INCOMPLETO — fora d'água a linha some. */
  private desenharAr(folego: number | undefined): void {
    const cheio = folego === undefined || folego >= FOLEGO_TICKS;
    this.linhaAr.classList.toggle("vazia", cheio);
    if (cheio) return;
    const bolhas = Math.max(0, Math.ceil(folego / TICKS_POR_BOLHA));
    for (const [i, casa] of this.casasAr.entries()) {
      const frente = casa.children[0] as HTMLElement | undefined;
      if (frente) frente.style.display = i < bolhas ? "block" : "none";
    }
  }

  private piscarDano(): void {
    this.dano.classList.add("piscar");
    if (this.danoTimer !== null) clearTimeout(this.danoTimer);
    this.danoTimer = setTimeout(() => this.dano.classList.remove("piscar"), 90);
  }

  private mostrarMorte(causa?: string): void {
    this.morte.textContent =
      causa === "queda"
        ? "Você caiu de muito alto"
        : causa === "afogamento"
          ? "Você ficou sem ar"
          : "Você não sobreviveu";
    this.morte.classList.add("ativo");
    if (this.morteTimer !== null) clearTimeout(this.morteTimer);
    this.morteTimer = setTimeout(() => this.esconderMorte(), 2600);
  }

  private esconderMorte(): void {
    this.morte.classList.remove("ativo");
  }
}
