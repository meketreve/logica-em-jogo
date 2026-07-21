import { playUi } from "./audio";

/**
 * Painel de jogadores (2026-07-21) — SÓ para o professor. Mesma estrutura do
 * inventário (cp16): altura FIXA, abas no topo e rolagem só na lista quando não
 * cabe. Duas abas: "conectados" (expulsar/banir) e "banidos" (desbanir). Os
 * botões COMPÕEM comandos de chat (/kicar, /banir, /desbanir) — o servidor
 * valida como sempre; o painel nunca decide estado.
 */
export interface PlayersData {
  conectados: { name: string; papel: "professor" | "aluno" }[];
  banidos: string[];
}

type Aba = "conectados" | "banidos";

export class PlayersPanel {
  private readonly root = document.getElementById("jogadores");
  private isOpen = false;
  /** Aba ativa — sobrevive a abrir/fechar dentro da sessão. */
  private aba: Aba = "conectados";
  private data: PlayersData = { conectados: [], banidos: [] };

  private readonly onEsc = (e: KeyboardEvent): void => {
    if (e.code !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    this.hide();
  };

  constructor(
    private readonly send: (cmd: string) => void,
    private readonly onToggle: (open: boolean) => void,
  ) {
    this.root?.addEventListener("click", (e) => {
      const btn = e.target instanceof HTMLElement ? e.target.closest("button") : null;
      if (btn) playUi("click");
    });
  }

  get open(): boolean {
    return this.isOpen;
  }

  /** Novo estado (conectados/banidos) vindo do servidor — re-render se aberto. */
  update(data: PlayersData): void {
    this.data = data;
    if (this.isOpen) this.render();
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

  /** Botão perigoso em 2 cliques (padrão dos painéis): 1º arma, 2º executa;
   *  3 s sem o 2º clique desarma sozinho. */
  private armedBtn(label: string, onConfirm: () => void): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", () => {
      if (b.dataset["armado"]) {
        onConfirm();
        return;
      }
      b.dataset["armado"] = "1";
      b.textContent = "confirma?";
      b.classList.add("painel-armado");
      window.setTimeout(() => {
        delete b.dataset["armado"];
        b.textContent = label;
        b.classList.remove("painel-armado");
      }, 3000);
    });
    return b;
  }

  private hint(texto: string): HTMLParagraphElement {
    const p = document.createElement("p");
    p.className = "painel-hint";
    p.textContent = texto;
    return p;
  }

  private render(): void {
    const root = this.root;
    if (!root) return;
    root.replaceChildren();

    const head = document.createElement("div");
    head.className = "painel-head";
    const h = document.createElement("h2");
    h.textContent = "jogadores";
    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.textContent = "✕ fechar";
    fechar.addEventListener("click", () => this.hide());
    head.append(h, fechar);

    const abas = document.createElement("div");
    abas.className = "inv-abas";
    const tabs: { id: Aba; label: string }[] = [
      { id: "conectados", label: `conectados (${this.data.conectados.length})` },
      { id: "banidos", label: `banidos (${this.data.banidos.length})` },
    ];
    for (const t of tabs) {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "inv-aba" + (t.id === this.aba ? " sel" : "");
      tab.textContent = t.label;
      tab.addEventListener("click", () => {
        this.aba = t.id;
        this.render();
      });
      abas.appendChild(tab);
    }

    const lista = document.createElement("div");
    lista.className = "jog-lista";
    if (this.aba === "conectados") this.renderConectados(lista);
    else this.renderBanidos(lista);

    root.append(head, abas, lista);
  }

  private renderConectados(lista: HTMLElement): void {
    if (this.data.conectados.length === 0) {
      lista.append(this.hint("ninguém conectado agora."));
      return;
    }
    for (const j of this.data.conectados) {
      const row = document.createElement("div");
      row.className = "jog-row";
      const nome = document.createElement("span");
      nome.className = "jog-nome";
      nome.textContent = j.papel === "professor" ? `${j.name} (professor)` : j.name;
      row.append(nome);
      // professor não expulsa/bane outro professor nem a si mesmo
      if (j.papel !== "professor") {
        row.append(
          this.armedBtn("expulsar", () => this.send(`/kicar ${j.name}`)),
          this.armedBtn("banir", () => this.send(`/banir ${j.name}`)),
        );
      }
      lista.append(row);
    }
  }

  private renderBanidos(lista: HTMLElement): void {
    if (this.data.banidos.length === 0) {
      lista.append(this.hint("ninguém banido. Bane pela aba “conectados” ou com /banir nome."));
      return;
    }
    for (const nick of this.data.banidos) {
      const row = document.createElement("div");
      row.className = "jog-row";
      const nome = document.createElement("span");
      nome.className = "jog-nome";
      nome.textContent = nick;
      const desb = document.createElement("button");
      desb.type = "button";
      desb.textContent = "desbanir";
      desb.addEventListener("click", () => this.send(`/desbanir ${nick}`));
      row.append(nome, desb);
      lista.append(row);
    }
  }
}
