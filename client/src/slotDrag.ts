import { type Stack, tamanhoStack } from "@logica/shared";

/**
 * §🧹 (playtest da escola) — CLIQUE E ARRASTE no inventário do PC.
 *
 * O tablet move item por tocar-na-origem/tocar-no-destino; no PC a criança
 * espera o Minecraft: SEGURAR, arrastar e soltar. Este módulo adiciona o
 * ARRASTO POR CIMA do gesto de toque, que segue vivo (clique sem arrasto =
 * o tocar-origem/destino de sempre). Traz também a DIVISÃO de pilha do
 * Minecraft:
 *   - clique DIREITO numa pilha pega a METADE (arredonda pra cima);
 *   - clique direito SEGURANDO uma pilha larga UM item no destino, de cada vez.
 *
 * A UI continua sem decidir NADA: o arrasto vira `mover_item`/`mover_container`
 * (com `qtd` opcional quando é divisão) e quem aplica é o servidor. O fantasma
 * que segue o cursor é só desenho — quem muda as pilhas de lugar é a resposta
 * dele, como em todo o resto.
 */

/** O que um painel de inventário oferece ao arrasto (o resto fica no painel). */
export interface SlotDragHooks {
  /** Índice do slot no ESPAÇO DO PAINEL (unificado no container) sob a
   *  coordenada, ou null. Implementado por `slotSob` + `data-slot`. */
  slotEm(x: number, y: number): number | null;
  /** Ícone (data URL) do item no slot, ou null se vazio. */
  iconeDe(slot: number): string | null;
  /** Quantidade no slot (0 se vazio). */
  qtdDe(slot: number): number;
  /** O slot "pego" (na mão), ou null. */
  pegando(): number | null;
  setPegando(slot: number | null): void;
  /** Quantas unidades a MÃO carrega quando é uma pilha DIVIDIDA (null = a
   *  pilha inteira). */
  metade(): number | null;
  setMetade(q: number | null): void;
  /** Move (`qtd` opcional = pilha parcial) — o servidor decide e responde. */
  mover(de: number, para: number, qtd?: number): void;
  /** Redesenha o painel (o pego ou a mochila mudou). */
  redesenhar(): void;
  /** §🗑️: a coordenada caiu em cima da LIXEIRA do painel? */
  sobreLixeira(x: number, y: number): boolean;
  /** §🗑️: joga fora a pilha do slot (`qtd` opcional = só parte). Quem apaga é
   *  o servidor — aqui é só a intenção, como no `mover`. */
  descartar(slot: number, qtd?: number): void;
  /** Clique SEM arrasto: o gesto tocar-origem/destino segue vivo. `shift` =
   *  o shift-clique do quick move (ver o painel). */
  aoClicar(slot: number, vazio: boolean, shift: boolean): void;
}

/** A partir daqui o pointerdown é ARRASTO, e não clique. */
const LIMIAR = 6;

/** O slot de um painel sob a coordenada — via `data-slot` que o `anexar`
 *  grava no botão (vale pros dois painéis, grade e hotbar usam a mesma
 *  classe `.inv-slot`). */
export function slotSob(x: number, y: number): number | null {
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  const btn = el?.closest?.(".inv-slot") as HTMLElement | null;
  const raw = btn?.dataset["slot"];
  if (raw === undefined) return null;
  const n = Number(raw);
  return Number.isInteger(n) ? n : null;
}

/** Primeiro slot de `[de, ate)` que aceita a pilha: mesmo id com espaço (junta
 *  até o teto) ou vazio. Ordem do `adicionar` do servidor (junta antes de
 *  ocupar slot novo) — é só a escolha do destino; quem valida é ele. */
export function primeiroLugar(
  inv: readonly (Stack | null)[],
  de: number,
  ate: number,
  id: number,
): number | null {
  for (let i = de; i < ate; i++) {
    const s = inv[i];
    if (s == null) return i;
    if (s.id === id && s.qtd < tamanhoStack(id)) return i;
  }
  return null;
}

/** A coordenada está em cima da lixeira? Mesmo molde do `slotSob`: quem marca
 *  o alvo é a CLASSE no botão, e não uma medida de retângulo que o scroll do
 *  painel invalidaria. Vale pros dois painéis. */
export function lixeiraSob(x: number, y: number): boolean {
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  return !!el?.closest?.(".inv-lixeira");
}

/** A fileira de botões de ação do item NA MÃO (✂ dividir, 🗑️ descartar). Os
 *  dois painéis desenham a mesma coisa, e ela é UMA LINHA porque o painel tem
 *  altura fixa: dois botões empilhados comeriam a fileira de slots que a media
 *  query do tablet luta pra manter visível. */
export function linhaDeAcoes(botoes: readonly HTMLElement[]): HTMLElement {
  const linha = document.createElement("div");
  linha.className = "inv-acoes";
  linha.append(...botoes);
  return linha;
}

export class ArrastoDeSlot {
  /** Pressionado aguardando decidir se é clique ou arrasto. */
  private cand: { slot: number; x: number; y: number } | null = null;
  private arrastando = false;
  /** O clique que nasce DEPOIS de um arrasto (ou de um clique direito) não
   *  pode processar o mesmo slot de novo. */
  private suprimirClique = false;
  private ghost: HTMLDivElement | null = null;
  /** Quantas unidades o fantasma mostra (o contador cai no larga-1-a-1). */
  private qtdFantasma = 0;
  /** Última posição conhecida do ponteiro. O fantasma do clique DIREITO nasce
   *  SEM arrasto, então não há `pointermove` pra posicioná-lo depois: sem esta
   *  memória ele aparecia no canto onde o `position:fixed` sem `left/top` cai —
   *  o "ícone flutuando no meio da tela" do playtest (bug-609). */
  private px = 0;
  private py = 0;

  constructor(private readonly hooks: SlotDragHooks) {
    document.addEventListener("pointermove", (e) => this.mover(e));
    document.addEventListener("pointerup", (e) => this.soltar(e));
  }

  /**
   * O painel mudou de estado (render, fechar, resposta do servidor): o fantasma
   * só pode existir enquanto há pilha NA MÃO. Sem esta chamada a divisão por
   * clique direito deixava o ícone na tela pra sempre — quem larga a metade com
   * o clique ESQUERDO nunca passa pelo `soltar` (bug-609).
   */
  sincronizar(): void {
    if (this.hooks.pegando() === null) this.esconderFantasma();
  }

  /** Liga ponteiro + clique a UM slot. O painel chama por botão, a cada render. */
  anexar(b: HTMLButtonElement, slot: number, id: number | null, qtd: number): void {
    b.dataset["slot"] = String(slot);
    b.addEventListener("pointerdown", (e) => this.pressionar(slot, id, qtd, e));
    b.addEventListener("click", (e) => this.clique(slot, id === null, e));
  }

  private pressionar(slot: number, id: number | null, qtd: number, e: PointerEvent): void {
    this.suprimirClique = false;
    this.px = e.clientX;
    this.py = e.clientY;
    if (e.pointerType !== "mouse") return; // tablet segue com tocar-origem/destino
    if (e.button === 2) {
      // direito: divide — pega a METADE, ou (segurando) larga 1 no destino
      e.preventDefault(); // sem menu de contexto do navegador no inventário
      const naMao = this.hooks.pegando();
      if (naMao === null) {
        if (id === null || qtd < 2) return; // nada pra dividir
        const metade = Math.ceil(qtd / 2);
        this.hooks.setPegando(slot);
        this.hooks.setMetade(metade);
        this.mostrarFantasma(slot, metade);
        this.hooks.redesenhar();
      } else if (naMao !== slot) {
        this.hooks.mover(naMao, slot, 1); // larga 1, continua segurando o resto
        this.qtdFantasma = Math.max(1, this.qtdFantasma - 1);
        this.hooks.redesenhar();
      }
      this.suprimirClique = true;
      return;
    }
    if (e.button !== 0) return;
    // esquerdo: candidato a arrasto (ou clique, se o dedo não sair do lugar)
    this.cand = { slot: this.hooks.pegando() ?? slot, x: e.clientX, y: e.clientY };
  }

  private mover(e: PointerEvent): void {
    // o fantasma segue o cursor mesmo SEM arrasto: a metade pega no clique
    // direito fica na mão até o aluno largar em algum lugar (bug-609)
    this.px = e.clientX;
    this.py = e.clientY;
    this.posicionarFantasma();
    if (!this.cand) return;
    const dx = e.clientX - this.cand.x;
    const dy = e.clientY - this.cand.y;
    if (!this.arrastando && Math.hypot(dx, dy) < LIMIAR) return;
    if (!this.arrastando) {
      this.arrastando = true;
      if (this.hooks.pegando() === null) {
        this.hooks.setPegando(this.cand.slot); // pega a pilha inteira do slot
        this.hooks.setMetade(null);
      }
      const naMao = this.hooks.pegando();
      if (naMao !== null) {
        this.mostrarFantasma(naMao, this.hooks.metade() ?? this.hooks.qtdDe(naMao));
        this.hooks.redesenhar();
      }
    }
    this.posicionarFantasma();
  }

  private soltar(e: PointerEvent): void {
    if (!this.cand) return;
    const de = this.cand.slot;
    this.cand = null;
    if (!this.arrastando) return; // clique sem arrasto: quem cuida é o `click`
    this.arrastando = false;
    this.suprimirClique = true;
    // §🗑️: largar em cima da lixeira JOGA FORA (o destino que não é slot). A
    // pergunta vem antes do `slotEm` porque a lixeira mora fora da grade — e
    // largar fora de qualquer alvo continua sendo "não fez nada".
    if (this.hooks.sobreLixeira(e.clientX, e.clientY)) {
      this.hooks.descartar(de, this.hooks.metade() ?? undefined);
    } else {
      const para = this.hooks.slotEm(e.clientX, e.clientY);
      if (para !== null && para !== de) {
        this.hooks.mover(de, para, this.hooks.metade() ?? undefined);
      }
    }
    this.hooks.setPegando(null);
    this.hooks.setMetade(null);
    this.esconderFantasma();
    this.hooks.redesenhar();
  }

  private clique(slot: number, vazio: boolean, e: MouseEvent): void {
    if (this.suprimirClique) {
      this.suprimirClique = false;
      return;
    }
    this.hooks.aoClicar(slot, vazio, e.shiftKey);
  }

  private mostrarFantasma(slot: number, qtd: number): void {
    if (!this.ghost) {
      this.ghost = document.createElement("div");
      // classe estável (não id: mochila e container têm um arrasto CADA, e dois
      // ids iguais no documento seriam mentira). É o que o `shots:esc` mede pra
      // provar que o fantasma nasce no cursor e some com a mão vazia (bug-609).
      this.ghost.className = "arrasto-fantasma";
      this.ghost.style.cssText =
        "position:fixed;pointer-events:none;z-index:999;" +
        "filter:drop-shadow(0 2px 3px rgba(0,0,0,0.5));";
      document.body.appendChild(this.ghost);
    }
    this.qtdFantasma = qtd;
    const img = document.createElement("img");
    img.src = this.hooks.iconeDe(slot) ?? "";
    img.style.cssText = "width:40px;height:40px;";
    this.ghost.replaceChildren(img);
    if (qtd > 1) {
      const n = document.createElement("b");
      n.textContent = String(qtd);
      n.style.cssText =
        "position:absolute;right:-2px;bottom:-2px;color:#fff;" +
        "background:rgba(0,0,0,0.7);border-radius:8px;padding:0 5px;" +
        "font:700 13px/1.4 system-ui,sans-serif;";
      this.ghost.appendChild(n);
    }
    this.posicionarFantasma(); // já nasce no cursor, mesmo sem arrasto
  }

  /** `position:fixed` sem `left`/`top` cai no fluxo do `<body>` — por isso o
   *  fantasma tem de ser posicionado na hora em que nasce, não só no arrasto. */
  private posicionarFantasma(): void {
    if (!this.ghost) return;
    this.ghost.style.setProperty("left", `${this.px + 8}px`);
    this.ghost.style.setProperty("top", `${this.py + 8}px`);
  }

  private esconderFantasma(): void {
    this.ghost?.replaceChildren();
    this.qtdFantasma = 0;
  }
}
