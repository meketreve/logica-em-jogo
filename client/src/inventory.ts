import { HOTBAR_SLOTS, INV_SLOTS } from "@logica/shared";
import { playUi } from "./audio";
import { CATEGORIAS, type Categoria, type PlaceableEntry } from "./blocksUi";
import type { Mochila } from "./mochila";

/**
 * Inventário de blocos (cp16) — grade dos colocáveis + faixa da hotbar de 9
 * slots. Clicar um bloco põe no slot selecionado; clicar um slot seleciona.
 * O estado da hotbar mora no main.ts (vem pelos callbacks) — o painel é SÓ
 * UI, igual aos painéis do cp14: nunca decide estado de jogo.
 *
 * ABAS por categoria (2026-07-20, pedido do playtest): com 100+ blocos a
 * grade única ficou longa. A aba ativa é só filtro de exibição.
 *
 * §🍖 F4 (2026-08-02): em SOBREVIVÊNCIA o painel vira outra coisa — a mochila
 * de verdade (27 slots com quantidade), e mexer nela é **tocar na origem e
 * tocar no destino**, não arrastar. Arrastar dói no tablet e trava aluno de 2º
 * ano; é a mesma razão que descartou a grade 3×3 do craft (ROADMAP §🍖).
 * A UI continua sem decidir: o toque vira uma mensagem `mover_item` e quem
 * aplica é o servidor.
 */
export class InventoryPanel {
  private readonly root = document.getElementById("inventario");
  private isOpen = false;
  /** Aba ativa — sobrevive a abrir/fechar dentro da sessão. */
  private cat: Categoria = "blocos";
  /** §🍖 F4: slot "pego" esperando o destino (null = nenhum). */
  private pegando: number | null = null;

  private readonly onEsc = (e: KeyboardEvent): void => {
    if (e.code !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    this.hide();
  };

  constructor(
    private readonly icons: Map<number, string>,
    /** Colocáveis visíveis pra este jogador (aluno não vê rocha-matriz). */
    private readonly blocks: () => readonly PlaceableEntry[],
    private readonly state: () => { hotbar: readonly number[]; selected: number },
    private readonly pick: (blockId: number) => void,
    private readonly select: (slot: number) => void,
    private readonly onToggle: (open: boolean) => void,
    /** §🍖 F4: a mochila autoritativa. `ativa === false` = criativo (paleta). */
    private readonly mochila: Mochila,
    /** §🍖 F4: pede ao servidor pra mover uma pilha de slot. */
    private readonly mover: (de: number, para: number) => void,
  ) {
    // som de UI por delegação, igual aos painéis do cp14
    this.root?.addEventListener("click", (e) => {
      const btn = e.target instanceof HTMLElement ? e.target.closest("button") : null;
      if (btn) playUi("click");
    });
  }

  get open(): boolean {
    return this.isOpen;
  }

  toggle(): void {
    if (this.isOpen) this.hide();
    else this.show();
  }

  show(): void {
    if (this.isOpen || !this.root) return;
    this.isOpen = true;
    this.render();
    this.root.classList.remove("hidden");
    // capture: fecha o inventário ANTES do Input ver a tecla
    window.addEventListener("keydown", this.onEsc, true);
    this.onToggle(true);
  }

  hide(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.root?.classList.add("hidden");
    window.removeEventListener("keydown", this.onEsc, true);
    this.onToggle(false);
  }

  /** Re-renderiza se estiver aberto (slot mudou por tecla 1–9 fora do painel). */
  refresh(): void {
    if (this.isOpen) this.render();
  }

  private render(): void {
    if (this.mochila.ativa) {
      this.renderMochila();
      return;
    }
    const root = this.root;
    if (!root) return;
    root.replaceChildren();

    const head = document.createElement("div");
    head.className = "painel-head";
    const h = document.createElement("h2");
    h.textContent = "inventário de blocos";
    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.textContent = "✕ fechar";
    fechar.addEventListener("click", () => this.hide());
    head.append(h, fechar);

    const dica = document.createElement("p");
    dica.className = "inv-dica";
    dica.textContent =
      "clique num bloco pra pôr no slot selecionado · 1–9 ou clique escolhem o slot";

    // abas de categoria — só aparecem as que têm bloco visível pro papel
    const todos = this.blocks();
    const abas = document.createElement("div");
    abas.className = "inv-abas";
    for (const c of CATEGORIAS) {
      if (!todos.some((b) => b.cat === c.id)) continue;
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "inv-aba" + (c.id === this.cat ? " sel" : "");
      tab.textContent = c.label;
      tab.addEventListener("click", () => {
        this.cat = c.id;
        this.render();
      });
      abas.appendChild(tab);
    }

    const grid = document.createElement("div");
    grid.className = "inv-grid";
    for (const b of todos.filter((x) => x.cat === this.cat)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "inv-bloco";
      btn.title = b.name;
      const img = document.createElement("img");
      img.src = this.icons.get(b.id) ?? "";
      img.alt = b.name;
      const nome = document.createElement("small");
      nome.textContent = b.name;
      btn.append(img, nome);
      btn.addEventListener("click", () => {
        this.pick(b.id);
        this.render();
      });
      grid.appendChild(btn);
    }

    const bar = document.createElement("div");
    bar.className = "inv-hotbar";
    const { hotbar, selected } = this.state();
    hotbar.forEach((id, i) => {
      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = "inv-slot" + (i === selected ? " sel" : "");
      const num = document.createElement("small");
      num.textContent = String(i + 1);
      const img = document.createElement("img");
      img.src = this.icons.get(id) ?? "";
      img.alt = "";
      slot.append(num, img);
      slot.addEventListener("click", () => {
        this.select(i);
        this.render();
      });
      bar.appendChild(slot);
    });

    root.append(head, dica, abas, grid, bar);
  }

  /**
   * §🍖 F4 — a mochila de verdade (sobrevivência). 18 slots de mochila em cima,
   * os 9 da hotbar embaixo (a mesma ordem que a barra da tela mostra), com a
   * quantidade em cada pilha.
   *
   * Gesto: tocar num slot com item o PEGA (fica marcado); tocar em outro pede o
   * movimento ao servidor; tocar no mesmo de novo solta. Nada muda na tela até
   * o servidor responder — a UI não decide.
   */
  private renderMochila(): void {
    const root = this.root;
    if (!root) return;
    root.replaceChildren();

    const head = document.createElement("div");
    head.className = "painel-head";
    const h = document.createElement("h2");
    h.textContent = "mochila";
    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.textContent = "✕ fechar";
    fechar.addEventListener("click", () => this.hide());
    head.append(h, fechar);

    const dica = document.createElement("p");
    dica.className = "inv-dica";
    dica.textContent =
      this.pegando === null
        ? "toque num item para pegar, depois toque onde ele deve ficar · 1–9 escolhem o slot da mão"
        : "agora toque no slot de destino (ou no mesmo item para soltar)";

    const slotBtn = (i: number): HTMLButtonElement => {
      const id = this.mochila.idDoSlot(i);
      const qtd = this.mochila.qtdDoSlot(i);
      const b = document.createElement("button");
      b.type = "button";
      b.className =
        "inv-slot" +
        (i === this.pegando ? " pego" : "") +
        (i === this.state().selected && i < HOTBAR_SLOTS ? " sel" : "");
      if (id !== null) {
        const img = document.createElement("img");
        img.src = this.icons.get(id) ?? "";
        img.alt = "";
        b.appendChild(img);
        if (qtd > 1) {
          const n = document.createElement("b");
          n.className = "qtd";
          n.textContent = String(qtd);
          b.appendChild(n);
        }
      }
      b.addEventListener("click", () => {
        if (this.pegando === null) {
          if (id === null) {
            // slot vazio da HOTBAR sem nada pego: vale como escolher a mão
            if (i < HOTBAR_SLOTS) this.select(i);
            this.render();
            return;
          }
          this.pegando = i;
        } else if (this.pegando === i) {
          this.pegando = null;
        } else {
          this.mover(this.pegando, i);
          this.pegando = null;
        }
        this.render();
      });
      return b;
    };

    const grade = document.createElement("div");
    grade.className = "inv-mochila";
    for (let i = HOTBAR_SLOTS; i < INV_SLOTS; i++) grade.appendChild(slotBtn(i));

    const bar = document.createElement("div");
    bar.className = "inv-hotbar";
    for (let i = 0; i < HOTBAR_SLOTS; i++) {
      const b = slotBtn(i);
      const num = document.createElement("small");
      num.textContent = String(i + 1);
      b.prepend(num);
      bar.appendChild(b);
    }

    root.append(head, dica, grade, bar);
  }
}
