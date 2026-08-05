import {
  CONTAINER_SLOTS,
  type ContainerTipo,
  FORNALHA_COMBUSTIVEL,
  FORNALHA_ENTRADA,
  FORNALHA_SAIDA,
  HOTBAR_SLOTS,
  INV_SLOTS,
  type SlotSalvo,
  TICKS_POR_COZIMENTO,
} from "@logica/shared";
import { playUi } from "./audio";
import type { Mochila } from "./mochila";

/**
 * §🍖 F10 — O PAINEL DE TRANSFERÊNCIA (fornalha e baú).
 *
 * **Mochila de um lado, container do outro** (pedido literal do usuário), com o
 * gesto de **tocar na origem e tocar no destino** — o mesmo do §🍖 F4. Arrastar
 * dói no tablet e trava aluno de 2º ano, e esta decisão já foi tomada três
 * vezes (mochila, craft e agora aqui).
 *
 * A UI continua sem decidir NADA: o toque vira um `mover_container` com dois
 * índices no espaço unificado (`0..26` mochila, `27+i` container) e quem aplica
 * é o servidor, que responde com os dois inventários. Enquanto a resposta não
 * chega, a tela mostra o estado velho — e é o certo, porque o estado velho é o
 * que o servidor ainda tem.
 *
 * O painel é uma classe só pros DOIS containers porque eles diferem em três
 * coisas e nada mais: quantos slots, os rótulos, e a barrinha de fogo que só a
 * fornalha tem.
 */
export class ContainerPanel {
  private readonly root = document.getElementById("container");
  private isOpen = false;
  /** A célula aberta — vai em toda mensagem, e o servidor reconfere. */
  private pos: { x: number; y: number; z: number } | null = null;
  private tipo: ContainerTipo = "bau";
  /** Conteúdo do container, no índice LOCAL dele (0..n-1). */
  private slots: (SlotSalvo | null)[] = [];
  private queimando = 0;
  private queimaTotal = 0;
  private progresso = 0;
  /** Slot "pego" esperando destino, no índice UNIFICADO (ou null). */
  private pegando: number | null = null;

  private readonly onEsc = (e: KeyboardEvent): void => {
    if (e.code !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    this.fechar();
  };

  constructor(
    private readonly icons: Map<number, string>,
    private readonly mochila: Mochila,
    private readonly nameOf: (id: number) => string,
    /** Pede ao servidor pra mover (índices UNIFICADOS). */
    private readonly mover: (x: number, y: number, z: number, de: number, para: number) => void,
    /** Avisa o servidor que o painel fechou (senão ele manda o conteúdo pra sempre). */
    private readonly avisarFechado: () => void,
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

  /**
   * Conteúdo novo vindo do servidor (`container`). É ele que ABRE o painel: o
   * cliente nunca abre por conta própria, porque quem decide se o aluno pode
   * ler aquele baú é o gate de claim do servidor.
   *
   * Mensagem de OUTRA célula (o aluno clicou noutro baú sem fechar o primeiro)
   * simplesmente troca o que está na tela — o servidor já esqueceu o anterior.
   */
  atualizar(msg: {
    x: number;
    y: number;
    z: number;
    tipo: ContainerTipo;
    slots: SlotSalvo[];
    queimando?: number;
    queimaTotal?: number;
    progresso?: number;
  }): void {
    const trocouDeCelula =
      !this.pos || this.pos.x !== msg.x || this.pos.y !== msg.y || this.pos.z !== msg.z;
    if (trocouDeCelula) this.pegando = null; // o item pego era do outro container
    this.pos = { x: msg.x, y: msg.y, z: msg.z };
    this.tipo = msg.tipo;
    this.slots = new Array<SlotSalvo | null>(CONTAINER_SLOTS[msg.tipo]).fill(null);
    for (const s of msg.slots) {
      if (s.slot >= 0 && s.slot < this.slots.length) this.slots[s.slot] = s;
    }
    this.queimando = msg.queimando ?? 0;
    this.queimaTotal = msg.queimaTotal ?? 0;
    this.progresso = msg.progresso ?? 0;
    if (!this.isOpen) {
      this.isOpen = true;
      this.root?.classList.remove("hidden");
      window.addEventListener("keydown", this.onEsc, true);
      this.onToggle(true);
    }
    this.render();
  }

  /** Fecha e AVISA o servidor (o gesto do aluno: Esc, botão ou tecla). */
  fechar(): void {
    if (!this.isOpen) return;
    this.avisarFechado();
    this.fecharSemAvisar();
  }

  /** Fecha porque o SERVIDOR mandou (`container_fechado`: o bloco sumiu, o
   *  direito mudou). Não devolve aviso — ele já sabe. */
  fecharSemAvisar(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.pos = null;
    this.pegando = null;
    this.root?.classList.add("hidden");
    window.removeEventListener("keydown", this.onEsc, true);
    this.onToggle(false);
  }

  /** A mochila mudou (chegou `inventario` novo): redesenha o lado de baixo. */
  refresh(): void {
    if (this.isOpen) this.render();
  }

  /** Rótulo do slot da fornalha — sem ele os 3 quadrados são um enigma. */
  private rotuloDoSlot(i: number): string {
    if (this.tipo !== "fornalha") return "";
    if (i === FORNALHA_ENTRADA) return "cozinhar";
    if (i === FORNALHA_COMBUSTIVEL) return "queimar";
    return "pronto";
  }

  private clicar(unificado: number, vazio: boolean): void {
    if (this.pegando === null) {
      if (vazio) return; // nada pra pegar
      this.pegando = unificado;
    } else if (this.pegando === unificado) {
      this.pegando = null; // tocar de novo solta
    } else if (this.pos) {
      this.mover(this.pos.x, this.pos.y, this.pos.z, this.pegando, unificado);
      this.pegando = null;
    }
    this.render();
  }

  /** Um slot: ícone, quantidade e o contorno de "pego". */
  private slotBtn(unificado: number, id: number | null, qtd: number): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "inv-slot" + (unificado === this.pegando ? " pego" : "");
    if (id !== null) {
      b.title = this.nameOf(id);
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
    b.addEventListener("click", () => this.clicar(unificado, id === null));
    return b;
  }

  private render(): void {
    const root = this.root;
    if (!root) return;
    root.replaceChildren();

    const head = document.createElement("h2");
    head.textContent = this.tipo === "fornalha" ? "fornalha" : "baú";

    const fechar = document.createElement("button");
    fechar.type = "button";
    fechar.className = "cont-fechar";
    fechar.textContent = "fechar";
    fechar.addEventListener("click", () => this.fechar());

    const dica = document.createElement("p");
    dica.className = "inv-dica";
    dica.textContent =
      this.pegando === null
        ? "toque num item para pegar, depois toque onde ele deve ficar"
        : "agora toque no destino (ou no mesmo item para soltar)";

    // --- o container, em cima ---
    const cima = document.createElement("div");
    cima.className = this.tipo === "fornalha" ? "cont-fornalha" : "cont-bau";
    for (let i = 0; i < this.slots.length; i++) {
      const s = this.slots[i] ?? null;
      const cel = document.createElement("div");
      cel.className = "cont-cel";
      cel.appendChild(this.slotBtn(INV_SLOTS + i, s?.id ?? null, s?.qtd ?? 0));
      const rot = this.rotuloDoSlot(i);
      if (rot) {
        const small = document.createElement("small");
        small.textContent = rot;
        cel.appendChild(small);
      }
      cima.appendChild(cel);
    }

    root.append(head, fechar, dica, cima);

    // --- a barra de fogo e a de cozimento (só a fornalha) ---
    if (this.tipo === "fornalha") {
      root.appendChild(
        this.barra("fogo", this.queimaTotal > 0 ? this.queimando / this.queimaTotal : 0, "fogo"),
      );
      root.appendChild(
        this.barra("cozinhando", this.progresso / TICKS_POR_COZIMENTO, "coz"),
      );
    }

    // --- a mochila, embaixo: a grade de 18 e a faixa da hotbar de 9 ---
    const grade = document.createElement("div");
    grade.className = "inv-mochila";
    for (let i = HOTBAR_SLOTS; i < INV_SLOTS; i++) {
      grade.appendChild(this.slotBtn(i, this.mochila.idDoSlot(i), this.mochila.qtdDoSlot(i)));
    }

    const bar = document.createElement("div");
    bar.className = "inv-hotbar";
    for (let i = 0; i < HOTBAR_SLOTS; i++) {
      const b = this.slotBtn(i, this.mochila.idDoSlot(i), this.mochila.qtdDoSlot(i));
      const num = document.createElement("small");
      num.textContent = String(i + 1);
      b.prepend(num);
      bar.appendChild(b);
    }

    root.append(grade, bar);
  }

  /** Barrinha de 0..1 com rótulo. Duas cores: fogo (laranja) e cozimento
   *  (azul) — de longe, num tablet, a cor diz mais rápido que o rótulo. */
  private barra(rotulo: string, fracao: number, classe: string): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "cont-barra";
    const nome = document.createElement("small");
    nome.textContent = rotulo;
    const trilho = document.createElement("div");
    trilho.className = "cont-trilho";
    const cheio = document.createElement("i");
    cheio.className = classe;
    cheio.style.width = `${Math.round(Math.max(0, Math.min(1, fracao)) * 100)}%`;
    trilho.appendChild(cheio);
    wrap.append(nome, trilho);
    return wrap;
  }
}
