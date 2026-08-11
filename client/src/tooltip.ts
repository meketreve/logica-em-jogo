import { type Uso, usosDoItem } from "@logica/shared";

/**
 * §💬 UI de jogo (todo §💬, pedido de 2026-08-06) — O TOOLTIP DE ITEM.
 *
 * O que existia era `btn.title = nome`, que é o tooltip do NAVEGADOR: demora
 * ~1 s, **não aparece no tablet** e some sozinho depois de alguns segundos. Num
 * jogo em que metade da turma joga no dedo, isso é meio recurso.
 *
 * Este é próprio, e serve os dois aparelhos com o mesmo elemento:
 *  - **PC:** aparece no hover, na hora, e segue o cursor;
 *  - **tablet:** **toque e segure** (`ESPERA_TOQUE`) e fica na tela mais um
 *    tempo depois de o dedo sair, pra a criança conseguir ler. O toque que
 *    abriu o tooltip **não conta como tap** — senão segurar pra ler também
 *    pegaria a pilha, que é o gesto de mover item do §🍖 F4.
 *
 * **Por DELEGAÇÃO, e isso é o que o faz caber aqui.** Os painéis se
 * redesenham inteiros (`replaceChildren`) a cada movimento — a fornalha
 * cozinhando faz isso 10×/s — então listener por botão morreria e renasceria o
 * tempo todo. Aqui o painel só carimba `data-tip-id="<id>"` no botão e este
 * módulo escuta o `document`. Um elemento na tela, zero listeners por slot.
 *
 * O conteúdo vem do `usosDoItem` do shared, que lê as MESMAS tabelas que
 * decidem o jogo (comida, fornalha, ferramentas, plantas). É por isso que a
 * durabilidade (§🔨 do `todo.md`) vai aparecer aqui sozinha no dia em que
 * existir: ela entra na tabela, não neste arquivo.
 */

/** Quanto tempo o dedo precisa ficar parado até o tooltip abrir. */
const ESPERA_TOQUE = 400;
/** ...e quanto ele fica na tela depois de o dedo sair (tempo de leitura). */
const PERSISTE_APOS_TOQUE = 2500;
/** Dedo que andou mais que isto estava rolando a lista, não segurando. */
const ARRASTOU = 12;
/** Folga entre o ponteiro e a caixa. */
const AFASTAMENTO = 16;
/** Quantos blocos a picareta lista antes de virar "e mais N". */
const MAX_LIBERA = 3;

export interface TooltipDeps {
  /** Nome PT de um id (bloco ou item) — o cliente é quem tem essa tabela. */
  nameOf(id: number): string;
  /** Em CRIATIVO não há exigência de ferramenta: a linha "para quebrar" seria
   *  mentira, e mentira num tooltip é pior que tooltip nenhum. */
  sobrevivencia(): boolean;
}

let deps: TooltipDeps = {
  nameOf: (id) => `#${id}`,
  sobrevivencia: () => false,
};

class Tooltip {
  private readonly el: HTMLDivElement;
  /** O elemento que o tooltip está descrevendo (evita repintar a cada pixel). */
  private alvo: HTMLElement | null = null;
  private visivel = false;
  private timerToque: number | null = null;
  private timerSaida: number | null = null;
  private toque: { x: number; y: number } | null = null;

  constructor() {
    this.el = document.createElement("div");
    this.el.className = "tooltip-item hidden";
    document.body.appendChild(this.el);

    // mouse: `pointerover` pega a entrada, `pointermove` faz seguir o cursor.
    // Os dois caem na mesma função porque a decisão é a mesma: quem está sob o
    // ponteiro agora? (Com o ponteiro travado no jogo o alvo é o canvas, que
    // não tem `data-tip-id` — então isto é um `closest` por movimento e nada
    // mais.)
    const mouse = (e: PointerEvent): void => this.aoApontar(e);
    document.addEventListener("pointerover", mouse);
    document.addEventListener("pointermove", mouse);

    document.addEventListener("touchstart", (e) => this.aoTocar(e), { passive: true });
    document.addEventListener("touchmove", (e) => this.aoArrastar(e), { passive: true });
    document.addEventListener("touchend", () => this.aoSoltar());
    document.addEventListener("touchcancel", () => this.aoSoltar());
    // rolar a mochila com o tooltip aberto deixaria a caixa parada no ar
    document.addEventListener("scroll", () => this.esconder(), true);
  }

  // ----------------------------------------------------------------- mouse --

  private aoApontar(e: PointerEvent): void {
    if (e.pointerType !== "mouse") return;
    const alvo = dono(e.target, e.clientX, e.clientY);
    if (!alvo) {
      this.esconder();
      return;
    }
    if (alvo !== this.alvo) {
      this.alvo = alvo;
      if (!this.pintar(alvo)) return;
    }
    this.posicionar(e.clientX, e.clientY);
  }

  // ----------------------------------------------------------------- toque --

  private aoTocar(e: TouchEvent): void {
    this.limparTimers();
    const t = e.touches[0];
    const alvo = t ? dono(e.target, t.clientX, t.clientY) : null;
    if (!t || !alvo) {
      this.esconder();
      return;
    }
    this.toque = { x: t.clientX, y: t.clientY };
    this.timerToque = window.setTimeout(() => {
      this.timerToque = null;
      const p = this.toque;
      if (!p) return;
      this.alvo = alvo;
      if (!this.pintar(alvo)) return;
      // ACIMA do dedo: no toque o ponteiro é uma mão inteira em cima do slot, e
      // uma caixa 16px abaixo dele nasce escondida embaixo da própria criança.
      this.posicionar(p.x, p.y, true);
      // segurar pra LER não pode valer como tocar pra PEGAR (§🍖 F4)
      this.engolirProximoClique();
    }, ESPERA_TOQUE);
  }

  private aoArrastar(e: TouchEvent): void {
    const t = e.touches[0];
    const p = this.toque;
    if (!t || !p) return;
    if (Math.hypot(t.clientX - p.x, t.clientY - p.y) < ARRASTOU) return;
    this.limparTimers(); // estava rolando a lista, não segurando um item
    this.esconder();
  }

  private aoSoltar(): void {
    if (this.timerToque !== null) {
      window.clearTimeout(this.timerToque);
      this.timerToque = null;
    }
    this.toque = null;
    if (!this.visivel) return;
    // o dedo sai, o texto fica: no tablet o dedo TAPA o que ele acabou de abrir
    this.timerSaida = window.setTimeout(() => this.esconder(), PERSISTE_APOS_TOQUE);
  }

  /**
   * O `click` que nasce do toque que abriu o tooltip morre aqui — em CAPTURA,
   * antes de qualquer painel. A remoção por tempo é o cinto: se o dedo escorregar
   * pra fora do botão, o `click` nunca vem, e um engolidor esquecido comeria o
   * próximo toque de verdade.
   */
  private engolirProximoClique(): void {
    const engolir = (ev: Event): void => {
      ev.stopPropagation();
      ev.preventDefault();
    };
    document.addEventListener("click", engolir, { capture: true, once: true });
    window.setTimeout(() => document.removeEventListener("click", engolir, true), 1200);
  }

  // --------------------------------------------------------------- desenho --

  /** Monta o conteúdo. `false` = não havia o que dizer (e nada foi mostrado). */
  private pintar(alvo: HTMLElement): boolean {
    const cru = alvo.dataset["tipId"];
    const linhas: HTMLElement[] = [];
    if (cru !== undefined) {
      const id = Number(cru);
      if (!Number.isInteger(id)) {
        this.esconder();
        return false;
      }
      const nome = document.createElement("b");
      nome.className = "tip-nome";
      nome.textContent = deps.nameOf(id);
      linhas.push(nome);
      for (const uso of usosDoItem(id)) {
        const texto = frase(uso);
        if (texto) linhas.push(linhaDeUso(texto));
      }
    } else {
      const livre = alvo.dataset["tip"];
      if (!livre) {
        this.esconder();
        return false;
      }
      const nome = document.createElement("b");
      nome.className = "tip-nome";
      nome.textContent = livre;
      linhas.push(nome);
    }
    this.el.replaceChildren(...linhas);
    this.el.classList.remove("hidden");
    this.visivel = true;
    return true;
  }

  /** Ao lado do ponteiro, e sempre DENTRO da tela — no tablet de 1024×600 um
   *  slot da última linha jogaria a caixa pra fora por baixo. Medir exige a
   *  caixa já visível, por isso isto roda depois do `pintar`. */
  private posicionar(x: number, y: number, acima = false): void {
    const caixa = this.el.getBoundingClientRect();
    let left = x + AFASTAMENTO;
    let top = acima ? y - AFASTAMENTO - caixa.height : y + AFASTAMENTO;
    if (left + caixa.width > window.innerWidth - 8) left = x - AFASTAMENTO - caixa.width;
    if (top < 8) top = y + AFASTAMENTO; // não cabia em cima: desce
    if (top + caixa.height > window.innerHeight - 8) top = y - AFASTAMENTO - caixa.height;
    this.el.style.left = `${Math.round(Math.max(8, left))}px`;
    this.el.style.top = `${Math.round(Math.max(8, top))}px`;
  }

  esconder(): void {
    this.limparTimers();
    this.alvo = null;
    this.toque = null;
    if (!this.visivel) return;
    this.visivel = false;
    this.el.classList.add("hidden");
  }

  private limparTimers(): void {
    if (this.timerToque !== null) window.clearTimeout(this.timerToque);
    if (this.timerSaida !== null) window.clearTimeout(this.timerSaida);
    this.timerToque = null;
    this.timerSaida = null;
  }
}

const SELETOR = "[data-tip-id],[data-tip]";

/** O elemento que pediu tooltip sob este alvo de evento (ou `null`). */
function dono(alvo: EventTarget | null, x: number, y: number): HTMLElement | null {
  if (!(alvo instanceof Element)) return null;
  const direto = alvo.closest<HTMLElement>(SELETOR);
  if (direto) return direto;
  // Botão DESABILITADO não despacha evento de ponteiro: o `target` que chega é
  // a lista, não a receita. E é bem na receita que o aluno AINDA não consegue
  // fazer que o "o que é isso?" importa. `elementFromPoint` enxerga o botão
  // desabilitado, que continua desenhado — e o teste caro fica ATRÁS do
  // `closest` da lista, senão ele rodaria a cada `pointermove` do jogo.
  if (!alvo.closest(".craft-lista")) return null;
  const sob = document.elementFromPoint(x, y);
  return sob instanceof Element ? sob.closest<HTMLElement>(SELETOR) : null;
}

function linhaDeUso(texto: string): HTMLElement {
  const p = document.createElement("small");
  p.className = "tip-uso";
  p.textContent = texto;
  return p;
}

/** Um fato do `usosDoItem` virando a frase que a criança lê. `null` = não
 *  mostrar (a exigência de ferramenta não vale em criativo). */
function frase(uso: Uso): string | null {
  switch (uso.tipo) {
    case "ferramenta":
      return uso.libera.length === 0
        ? "⛏ ferramenta"
        : `⛏ quebra ${listar(uso.libera)}`;
    case "comida":
      return `🍗 comida — enche ${uso.fome} de fome`;
    case "funde":
      return `🔥 na fornalha vira ${uso.saida.qtd}× ${deps.nameOf(uso.saida.id)}`;
    case "combustivel":
      return `🪵 queima na fornalha — ${uso.cozimentos} ${
        uso.cozimentos === 1 ? "cozimento" : "cozimentos"
      }`;
    case "colheita":
      return `🌱 quando madura dá ${deps.nameOf(uso.item)}`;
    case "exigeFerramenta":
      return deps.sobrevivencia() ? `⛏ para quebrar: ${uso.ferramenta}` : null;
  }
}

/** Nomes separados por vírgula, cortados em `MAX_LIBERA` — a picareta de
 *  madeira destrava 6 blocos, e seis nomes numa linha viram parede. */
function listar(ids: readonly number[]): string {
  const nomes = ids.slice(0, MAX_LIBERA).map((id) => deps.nameOf(id));
  const sobra = ids.length - nomes.length;
  return sobra > 0 ? `${nomes.join(", ")} e mais ${sobra}` : nomes.join(", ");
}

let unico: Tooltip | null = null;

function garantir(): Tooltip {
  unico ??= new Tooltip();
  return unico;
}

/** Liga o tooltip ao resto do jogo. Chamado uma vez, no boot. */
export function configurarTooltip(d: TooltipDeps): void {
  deps = d;
  garantir();
}

/**
 * Marca um elemento como dono do tooltip do item `id` (`null` = slot vazio,
 * apaga a marca). Uma linha por slot, chamada no render — é só um atributo, não
 * um listener, e é por isso que redesenhar o painel inteiro não custa nada.
 */
export function tipDeItem(el: HTMLElement, id: number | null): void {
  if (id === null) delete el.dataset["tipId"];
  else el.dataset["tipId"] = String(id);
}

/** Some com a caixa (painel fechou, o dono dela saiu do DOM). */
export function esconderTooltip(): void {
  unico?.esconder();
}
