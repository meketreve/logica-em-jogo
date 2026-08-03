/**
 * HUD de vida (§🍖 F2) e fome (§🍖 F3) — corações, coxas, bolhas de ar e o
 * feedback de levar dano.
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
 * A coxa segue a MESMA escala: 20 pontos de fome = 10 coxas.
 *
 * A barra de fome só existe quando o servidor manda o campo `fome` — mundo com
 * a regra `fome` desligada não desenha coxa nenhuma (nem cheia, nem vazia).
 */

import { FOLEGO_TICKS, FOME_MAX, VIDA_MAX } from "@logica/shared";

const CORACOES = 10;
const COXAS = 10;
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
/* corações e coxas lado a lado (como no Minecraft); em tela estreita a linha
   QUEBRA sozinha em vez de escapar da tela — sem media query */
#lj-vitals .barras {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 16px;
}
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
/**
 * Coxa de frango (§🍖 F3): carne em cima à ESQUERDA, osso descendo pra direita.
 * Desenhada cheia e vazia como o coração — meia coxa é o mesmo recorte por
 * `clip-path`, e é por isso que a carne fica do lado esquerdo: o recorte pega a
 * metade da esquerda, e meia coxa tem de mostrar CARNE, não osso.
 */
const coxaSvg = (carne: string, osso: string, traco: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">` +
  `<path d="M12.8 12.8 8.6 8.6" stroke="${osso}" stroke-width="3" stroke-linecap="round"/>` +
  `<circle cx="12.9" cy="12.9" r="2.1" fill="${osso}" stroke="${traco}" stroke-width="0.9"/>` +
  `<circle cx="6" cy="6" r="4.7" fill="${carne}" stroke="${traco}" stroke-width="1.1"/>` +
  `</svg>`;
const COXA = svgUrl(coxaSvg("#b2601f", "#f3e7cf", "#4d2a10"));
const COXA_VAZIA = svgUrl(coxaSvg("#1a1a1a", "#1a1a1a", "#000"));

/** O que o servidor mandou na última mensagem `vida`. */
export interface VidaInfo {
  vida: number;
  folego?: number;
  /** Ausente = este mundo não tem fome (regra desligada) — nem desenha a barra. */
  fome?: number;
  causa?: string;
  morreu?: boolean;
}

/**
 * Uma linha de `n` ícones. `vazio` (quando existe) fica de FUNDO e `cheio` por
 * cima — é esse par que faz o meio-ícone do `clip-path` aparecer sobre a casa
 * apagada. O ícone da frente é sempre o ÚLTIMO filho da casa.
 */
function criarLinha(
  n: number,
  cheio: string,
  vazio?: string,
): { linha: HTMLDivElement; casas: HTMLDivElement[] } {
  const linha = document.createElement("div");
  linha.className = "linha";
  const casas: HTMLDivElement[] = [];
  for (let i = 0; i < n; i++) {
    const casa = document.createElement("div");
    casa.className = "casa";
    if (vazio !== undefined) {
      const fundo = document.createElement("div");
      fundo.className = "icone fundo";
      fundo.style.backgroundImage = vazio;
      casa.appendChild(fundo);
    }
    const frente = document.createElement("div");
    frente.className = "icone";
    frente.style.backgroundImage = cheio;
    casa.appendChild(frente);
    linha.appendChild(casa);
    casas.push(casa);
  }
  return { linha, casas };
}

/** Barra de 0..20 pontos em 10 ícones, com meio ícone no ímpar (corações e
 *  coxas usam a MESMA conta — só muda o desenho). */
function desenharBarra(casas: readonly HTMLDivElement[], pontos: number): void {
  for (const [i, casa] of casas.entries()) {
    const frente = casa.lastElementChild as HTMLElement | null;
    if (!frente) continue;
    const cheio = pontos >= (i + 1) * 2;
    const meio = !cheio && pontos === i * 2 + 1;
    frente.style.display = cheio || meio ? "block" : "none";
    frente.classList.toggle("meio", meio);
  }
}

export class VitalsUi {
  private readonly raiz: HTMLDivElement;
  private readonly linhaVida: HTMLDivElement;
  private readonly linhaFome: HTMLDivElement;
  private readonly linhaAr: HTMLDivElement;
  private readonly dano: HTMLDivElement;
  private readonly morte: HTMLDivElement;
  private readonly casasVida: readonly HTMLDivElement[];
  private readonly casasFome: readonly HTMLDivElement[];
  private readonly casasAr: readonly HTMLDivElement[];
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
    const vida = criarLinha(CORACOES, CORACAO, CORACAO_VAZIO);
    const fome = criarLinha(COXAS, COXA, COXA_VAZIA);
    const ar = criarLinha(BOLHAS, BOLHA);
    this.linhaVida = vida.linha;
    this.casasVida = vida.casas;
    this.linhaFome = fome.linha;
    this.casasFome = fome.casas;
    this.linhaAr = ar.linha;
    this.casasAr = ar.casas;
    // ar e fome nascem escondidos: pulmão cheio não mostra bolha, e mundo sem a
    // regra `fome` nunca manda o campo
    this.linhaAr.classList.add("vazia");
    this.linhaFome.classList.add("vazia");
    const barras = document.createElement("div");
    barras.className = "barras";
    barras.append(this.linhaVida, this.linhaFome);
    this.raiz.append(this.linhaAr, barras);
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
    desenharBarra(this.casasVida, vida);
    this.desenharFome(info.fome);
    this.desenharAr(info.folego);
    // levou dano = vida caiu (o `causa` confirma, mas a queda de vida basta e
    // funciona mesmo com host antigo que não mande a causa)
    if (vida < this.ultimaVida && this.visivel) this.piscarDano();
    if (info.morreu && this.visivel) this.mostrarMorte(info.causa);
    this.ultimaVida = vida;
  }

  /**
   * Coxas (§🍖 F3). Diferente das bolhas, a barra CHEIA continua na tela: é um
   * medidor permanente, como os corações. O que a faz sumir é o campo `fome`
   * ausente — mundo com a regra desligada não tem barra nenhuma.
   */
  private desenharFome(fome: number | undefined): void {
    this.linhaFome.classList.toggle("vazia", fome === undefined);
    if (fome === undefined) return;
    desenharBarra(this.casasFome, Math.max(0, Math.min(FOME_MAX, Math.round(fome))));
  }

  /** Bolhas só aparecem com o fôlego INCOMPLETO — fora d'água a linha some. */
  private desenharAr(folego: number | undefined): void {
    const cheio = folego === undefined || folego >= FOLEGO_TICKS;
    this.linhaAr.classList.toggle("vazia", cheio);
    if (cheio) return;
    const bolhas = Math.max(0, Math.ceil(folego / TICKS_POR_BOLHA));
    for (const [i, casa] of this.casasAr.entries()) {
      const frente = casa.lastElementChild as HTMLElement | null;
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
          : causa === "fome"
            ? "Você passou fome demais"
            : "Você não sobreviveu";
    this.morte.classList.add("ativo");
    if (this.morteTimer !== null) clearTimeout(this.morteTimer);
    this.morteTimer = setTimeout(() => this.esconderMorte(), 2600);
  }

  private esconderMorte(): void {
    this.morte.classList.remove("ativo");
  }
}
