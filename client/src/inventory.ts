import { playUi } from "./audio";
import { PLACEABLE } from "./blocksUi";

/**
 * Inventário de blocos (cp16) — grade com TODOS os colocáveis + faixa da
 * hotbar de 9 slots. Clicar um bloco põe no slot selecionado; clicar um slot
 * seleciona. O estado da hotbar mora no main.ts (vem pelos callbacks) — o
 * painel é SÓ UI, igual aos painéis do cp14: nunca decide estado de jogo.
 */
export class InventoryPanel {
  private readonly root = document.getElementById("inventario");
  private isOpen = false;

  private readonly onEsc = (e: KeyboardEvent): void => {
    if (e.code !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    this.hide();
  };

  constructor(
    private readonly icons: Map<number, string>,
    private readonly state: () => { hotbar: readonly number[]; selected: number },
    private readonly pick: (blockId: number) => void,
    private readonly select: (slot: number) => void,
    private readonly onToggle: (open: boolean) => void,
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

    const grid = document.createElement("div");
    grid.className = "inv-grid";
    for (const b of PLACEABLE) {
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

    root.append(head, dica, grid, bar);
  }
}
