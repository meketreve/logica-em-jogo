import { MAX_CHAT_BYTES, MAX_CHAT_LENGTH, cortarEmBytes } from "@logica/shared";
import { candidatos, destinoDeToque } from "./commands";

/**
 * UI de chat em HTML/CSS por cima do canvas (regra: sem GUI de engine).
 * Enter abre (main.ts solta o pointer lock antes), Enter envia, Esc fecha.
 * Tab autocompleta comandos ("/…"): completa a palavra, e com várias opções
 * cicla entre elas a cada Tab (a lista aparece como dica acima do campo).
 * Mensagens somem depois de uns segundos, mas reaparecem com o chat aberto.
 * Segurança: sempre textContent — texto de outro jogador nunca vira HTML.
 */
const MESSAGE_VISIBLE_MS = 10_000;
const MAX_MESSAGES = 50;

/**
 * Painel de COMANDOS RÁPIDOS do chat (2026-08-14): os comandos são MUITOS pra
 * decorar. Reusa a MESMA árvore do autocomplete (candidatos/destinoDeToque em
 * commands.ts) — uma fonte só, sem lista curada. Regras: o clique/tap em
 * comando inteiro ENVIA; comando que pede NOME preenche o campo pra digitar o
 * resto.
 *
 * Nasceu só no dedo (lá não há Tab), e em 2026-10-23 passou a valer no
 * COMPUTADOR também, a pedido do usuário: o Tab só ajuda quem já sabe o nome
 * do comando — a lista é o que ensina QUAIS existem, e ela não tinha por que
 * ser privilégio do tablet. O layout LATERAL continua sendo do dedo (a media
 * query abaixo pede `pointer: coarse`); no mouse o painel fica empilhado,
 * acima do campo.
 */
const PAINEL_CSS = `
#chat-painel {
  margin-top: 4px;
  max-height: 26vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  pointer-events: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-content: flex-start;
  padding: 4px;
  border-radius: 4px;
}
#chat-painel button {
  min-height: 40px;
  padding: 6px 12px;
  font: inherit;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 4px;
  pointer-events: auto;
}
#chat-painel button:active {
  background: rgba(255, 215, 74, 0.3);
}
/* no mouse o realce é o hover (no dedo não existe hover, e :active basta) */
@media (hover: hover) {
  #chat-painel button:hover {
    background: rgba(255, 215, 74, 0.25);
  }
}
#chat-painel button.pnl-volta {
  border-color: #ffd74a;
}

/* PAINEL LATERAL (2026-08-25). Empilhado, o painel cresce PRA CIMA a partir do
   rodape do #chat e come a altura que o teclado virtual ja levou: medido a
   1024x600 com teclado de 280px, o bloco chat+painel comecava em y=-173, ou
   seja, log e campo FORA da tela.

   Deitado ele vira COLUNA, no vao entre o chat e a borda direita. E o vao e a
   tela inteira: o HUD de toque some com o chat aberto (main.ts, setShown com
   !chat.open), entao nao ha joystick, botao de acao nem barra do topo pra
   desviar — so o teclado, embaixo.

   A conta a 1024x600: 388px de largura (3 colunas de botao) x 304px de altura
   com o teclado aberto, 584px sem ele. Contra 440x156 de antes: ~21 dos 25
   comandos a vista em vez de ~11, e o log volta a caber.

   O piso de 700px e o vao minimo que ainda da UMA coluna: o #chat mede
   min(440px, 52vw), entao a 700px sobram 140px e a 600px so 92px — estreito
   demais pra um botao. Abaixo disso o caminho EMPILHADO continua valendo, e la
   a altura nao e o problema (em retrato o teclado deixa 600px de janela).
   As vars --chat-esq/--chat-larg vem do #chat do index.html (heranca: o painel
   e filho dele). */
@media (pointer: coarse) and (min-width: 700px) {
  #chat-painel {
    position: fixed;
    top: 8px;
    left: calc(var(--chat-esq, 168px) + var(--chat-larg, 440px) + 12px);
    right: 16px;
    bottom: calc(8px + var(--kb, 0px));
    width: auto;
    max-height: none;
    margin-top: 0;
  }
}
`;

/**
 * Teclado VIRTUAL do tablet (2026-07-27, layouts mobile): o campo do chat mora
 * em `bottom: 48px`, e em paisagem o teclado do Android come metade dos 600px
 * de altura — o campo ficava DEBAIXO dele, digitando às cegas.
 *
 * `visualViewport` é a única fonte que sabe disso: `window.innerHeight` não
 * muda quando o teclado abre (é o viewport de LAYOUT), mas `visualViewport
 * .height` encolhe. A diferença é o que o teclado escondeu; publicamos em
 * `--kb` no :root e o `#chat` do index.html soma isso no `bottom`.
 *
 * Sem `visualViewport` (desktop antigo) a var nunca é escrita e o fallback
 * `var(--kb, 0px)` do CSS vale — nada muda.
 */
function acompanharTecladoVirtual(): void {
  const vv = window.visualViewport;
  if (!vv) return;
  const aplicar = (): void => {
    // offsetTop entra porque o iOS ROLA a página em vez de encolher a janela
    const escondido = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    document.documentElement.style.setProperty("--kb", `${Math.round(escondido)}px`);
  };
  vv.addEventListener("resize", aplicar);
  vv.addEventListener("scroll", aplicar);
  aplicar();
}

export class ChatUi {
  private readonly root = document.getElementById("chat");
  private readonly log = document.getElementById("chat-log");
  private readonly field = document.getElementById("chat-input") as HTMLInputElement | null;
  private readonly hint = document.getElementById("chat-hint");

  /** Estado do ciclo de Tab: sobrevive entre Tabs, morre em qualquer outra tecla. */
  private cycle: { produced: string; matches: string[]; index: number; base: string } | null =
    null;

  /** O caminho navegado no painel de comandos (["/tpp"] → ["/tpp","bia"]). */
  private painelCaminho: string[] = [];

  /** O painel de comandos rápidos (dedo e mouse — ver PAINEL_CSS). */
  private painel: HTMLDivElement | null = null;

  /** Quando o chat abriu (performance.now). Serve a UMA pergunta: este keydown
   *  é mais antigo que a abertura? Ver o listener de janela no construtor. */
  private abertoEm = 0;

  constructor(
    onSend: (text: string) => void,
    /** Avisa o dono (main.ts) pra re-travar o mouse / atualizar o overlay. */
    private readonly onToggle: (open: boolean) => void,
  ) {
    if (!this.field) return;
    this.field.maxLength = MAX_CHAT_LENGTH;
    // O `maxLength` conta UNIDADES UTF-16, não bytes — então ele sozinho deixa
    // passar 200 emojis (800 bytes). O servidor corta em `MAX_CHAT_BYTES` de
    // qualquer jeito; cortar aqui também é pra o aluno VER o campo parar em vez
    // de descobrir no broadcast que a frase chegou pela metade.
    this.field.addEventListener("input", () => {
      const f = this.field;
      if (!f) return;
      const cortado = cortarEmBytes(f.value, MAX_CHAT_BYTES);
      if (cortado !== f.value) f.value = cortado;
    });
    acompanharTecladoVirtual();
    this.montarPainel();
    this.field.addEventListener("keydown", (e) => {
      e.stopPropagation(); // digitar no chat NUNCA vira input do jogo (WASD, hotbar…)
      if (e.code === "Tab") {
        e.preventDefault(); // Tab completa, não pula o foco pra fora do campo
        this.autocomplete();
        return;
      }
      // e.key cobre o teclado VIRTUAL (Android às vezes não preenche e.code)
      if (e.code === "Enter" || e.key === "Enter") {
        const text = this.field?.value.trim() ?? "";
        if (text) onSend(text);
        this.close();
      } else if (e.code === "Escape") {
        this.close();
      } else {
        this.resetCycle(); // digitou outra coisa: o próximo Tab recomeça do zero
      }
    });
    /**
     * Enter/Esc com o chat aberto e o campo SEM foco (2026-10-23, relato dele
     * no PC): um clique fora da caixa — no canvas, num botão do painel que
     * roubou o foco — e as duas teclas paravam de responder, porque o único
     * handler morava no `keydown` do próprio campo. O chat ficava preso aberto,
     * e nem o atalho de abrir resolvia (ele sai cedo quando `chat.open`).
     *
     * Em CAPTURA na janela pra chegar antes do `keydown` do Input (que é de
     * bolha): o `stopPropagation` evita que a mesma tecla vire ação do jogo.
     * O guarda do alvo é o que não pode faltar — captura na janela vê TAMBÉM
     * a tecla digitada no campo, e aí fechar aqui atropelaria o envio.
     *
     * ⚠️ E o guarda do TEMPO (`abertoEm`) existe porque a tecla que ABRE o chat
     * é a MESMA que o fecha aqui (Enter, por padrão): quem abre é o Input, de
     * bolha, e um keydown cujo alvo é a própria JANELA não tem captura nem
     * bolha — os dois listeners viram "no alvo" e correm na ordem de registro,
     * que é a do Input primeiro. Resultado: o chat abria e fechava no mesmo
     * evento (foi o que a sonda `shots:esc` acusou). Comparar o carimbo do
     * evento com o instante da abertura resolve sem depender de fase: keydown
     * mais ANTIGO que a abertura é o que a abriu, e não fecha nada.
     */
    window.addEventListener(
      "keydown",
      (e) => {
        if (!this.open) return;
        if (this.abertoEm > e.timeStamp) return; // foi este keydown que abriu o chat
        // o campo (e qualquer outro campo de texto na tela) cuida das suas teclas
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.code === "Enter" || e.key === "Enter" || e.code === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.close();
        }
      },
      true,
    );
  }

  get open(): boolean {
    return this.field !== null && !this.field.classList.contains("hidden");
  }

  openInput(): void {
    if (!this.field) return;
    this.field.value = "";
    this.resetCycle();
    this.field.classList.remove("hidden");
    this.root?.classList.add("open"); // histórico inteiro visível enquanto digita
    this.painelCaminho = [];
    this.renderPainel();
    this.painel?.classList.remove("hidden");
    this.field.focus();
    this.abertoEm = performance.now();
    this.scrollarFim(); // em tela baixa o log vira caixa rolável: abre no fim
    this.onToggle(true);
  }

  /** Público: no toque não existe Esc — tocar fora do campo fecha (main.ts). */
  close(): void {
    if (!this.field) return;
    this.field.value = "";
    this.resetCycle();
    this.field.classList.add("hidden");
    this.root?.classList.remove("open");
    this.painelCaminho = [];
    this.painel?.classList.add("hidden");
    this.field.blur();
    this.onToggle(false);
  }

  /**
   * Painel de comandos rápidos. Nasce no primeiro chat com o #chat do
   * index.html já pronto (é um filho dele), e pinta os botões da árvore em
   * commands.ts ao abrir. Cada tap: ENVIA se o comando está inteiro, desce um
   * nível se ainda há subcomando, ou PREENCHE o campo pra digitar o nome.
   * O `pointerdown` com `preventDefault` serve aos dois aparelhos: no mouse é
   * ele que impede o botão de ROUBAR o foco do campo a cada clique.
   */
  private montarPainel(): void {
    if (!this.root) return;
    const style = document.createElement("style");
    style.textContent = PAINEL_CSS;
    document.head.appendChild(style);
    this.painel = document.createElement("div");
    this.painel.id = "chat-painel";
    this.painel.className = "hidden";
    // antes do campo: o input é o último filho e o telcado é o que o painel
    // precisa completar — botão escondido atrás do teclado seria tocar às cegas
    this.root.insertBefore(this.painel, this.field);
  }

  private renderPainel(): void {
    const painel = this.painel;
    if (!painel) return;
    painel.textContent = "";
    for (const token of this.painelCaminho) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = token;
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        this.painelCaminho = this.painelCaminho.slice(0, -1);
        this.renderPainel();
      });
      painel.appendChild(btn);
    }
    for (const opcao of candidatos(this.painelCaminho)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = opcao;
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        this.toqueNaOpcao(opcao);
      });
      painel.appendChild(btn);
    }
  }

  /** O que um tap no painel faz (ver destinoDeToque em commands.ts). */
  private toqueNaOpcao(opcao: string): void {
    const caminho = [...this.painelCaminho, opcao];
    const destino = destinoDeToque(caminho);
    if (destino === "nivel") {
      this.painelCaminho = caminho;
      this.renderPainel();
    } else if (destino === "preencher") {
      // tem nome pra digitar: preenche o campo e mantém o painel aberto
      this.field!.value = caminho.join(" ") + " ";
      this.field!.focus();
      this.resetCycle();
    } else {
      // comando inteiro: manda como se tivesse digitado e fechado (Enter)
      this.painelCaminho = caminho;
      this.field!.value = caminho.join(" ");
      this.field!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
    }
  }

  /** Tab: completa a palavra atual de um comando; com várias opções, cicla. */
  private autocomplete(): void {
    const field = this.field;
    if (!field) return;
    const value = field.value;
    if (!value.startsWith("/")) return; // autocompletar é só pra comandos

    // Continuação de um ciclo: o campo é exatamente o que produzimos e há
    // mais de uma opção → avança pra próxima sem re-filtrar.
    if (this.cycle && value === this.cycle.produced && this.cycle.matches.length > 1) {
      const c = this.cycle;
      c.index = (c.index + 1) % c.matches.length;
      c.produced = c.base + c.matches[c.index];
      field.value = c.produced;
      this.showHint(c.matches, c.index);
      return;
    }

    // Ciclo novo: quebra o que já está digitado em palavras completas + o prefixo.
    const endsWithSpace = /\s$/.test(value);
    const trimmed = value.replace(/\s+$/, "");
    const parts = trimmed.length ? trimmed.split(/\s+/) : [];
    const completos = endsWithSpace ? parts : parts.slice(0, -1);
    const prefixo = endsWithSpace ? "" : (parts[parts.length - 1] ?? "");
    const opcoes = candidatos(completos);
    const matches = opcoes.filter((o) => o.toLowerCase().startsWith(prefixo.toLowerCase()));
    if (matches.length === 0) {
      this.resetCycle();
      return;
    }
    const base = completos.length ? `${completos.join(" ")} ` : "";
    if (matches.length === 1) {
      field.value = `${base}${matches[0]} `; // opção única: completa e segue a frase
      this.resetCycle();
    } else {
      field.value = base + matches[0];
      this.cycle = { produced: field.value, matches, index: 0, base };
      this.showHint(matches, 0);
    }
  }

  private showHint(matches: string[], index: number): void {
    if (!this.hint) return;
    this.hint.textContent = "";
    matches.forEach((m, i) => {
      const span = document.createElement("span");
      span.textContent = m;
      if (i === index) span.className = "sel";
      this.hint?.appendChild(span);
    });
    this.hint.classList.remove("hidden");
  }

  private resetCycle(): void {
    this.cycle = null;
    this.hint?.classList.add("hidden");
  }

  addMessage(author: string, text: string): void {
    if (!this.log) return;
    const el = document.createElement("div");
    el.className = "msg";
    el.textContent = `<${author}> ${text}`;
    this.log.appendChild(el);
    while (this.log.childElementCount > MAX_MESSAGES) this.log.firstElementChild?.remove();
    this.scrollarFim();
    setTimeout(() => el.classList.add("old"), MESSAGE_VISIBLE_MS);
  }

  /**
   * Mantém a mensagem NOVA à vista. Em tela alta o log não rola (a caixa
   * cresce pra cima e `scrollHeight === clientHeight`), então isto é no-op;
   * em tela baixa a regra `#chat.open #chat-log` do index.html limita a
   * altura e a rolagem passa a existir.
   */
  private scrollarFim(): void {
    if (this.log) this.log.scrollTop = this.log.scrollHeight;
  }
}
