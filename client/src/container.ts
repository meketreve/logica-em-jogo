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
import { ArrastoDeSlot, linhaDeAcoes, lixeiraSob, primeiroLugar, slotSob } from "./slotDrag";
import { esconderTooltip, tipDeItem } from "./tooltip";

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
  /** §🧹 (playtest): quantas unidades a MÃO carrega numa pilha DIVIDIDA (clique
   *  direito no PC) — null = a pilha inteira. */
  private metadePegando: number | null = null;
  /** §🧹 (playtest): arrasto com o mouse por cima do tocar-origem/destino. */
  private readonly arrasto: ArrastoDeSlot;
  /**
   * O aluno pediu pra fechar e o servidor ainda não confirmou (bug-593).
   *
   * A fornalha COZINHANDO manda `container` 10×/s. Entre o clique em "fechar" e
   * o servidor processar o `fechar_container` cabem mensagens que já estavam no
   * fio — e `atualizar` REABRE o painel. O resultado é um painel zumbi: de volta
   * na tela, mas o servidor já o esqueceu, então ele nunca mais atualiza e todo
   * clique nele pede um `mover_container` de um container que não está aberto.
   *
   * A confirmação é o `container_fechado` que o servidor passou a responder. A
   * ordem do TCP faz o resto: tudo que ele mandou ANTES de ver o pedido chega
   * antes da confirmação, e é justamente isso que se descarta.
   */
  private esperandoFechar = false;

  private readonly onEsc = (e: KeyboardEvent): void => {
    if (e.code !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    this.fechar();
  };

  constructor(
    private readonly icons: Map<number, string>,
    private readonly mochila: Mochila,
    /** Pede ao servidor pra mover (índices UNIFICADOS). */
    private readonly mover: (
      x: number,
      y: number,
      z: number,
      de: number,
      para: number,
      qtd?: number,
    ) => void,
    /** §🗑️: pede pra JOGAR FORA a pilha do slot UNIFICADO (`qtd` = só parte). */
    private readonly descartar: (
      x: number,
      y: number,
      z: number,
      slot: number,
      qtd?: number,
    ) => void,
    /** Avisa o servidor que o painel fechou (senão ele manda o conteúdo pra sempre). */
    private readonly avisarFechado: () => void,
    private readonly onToggle: (open: boolean) => void,
  ) {
    this.root?.addEventListener("click", (e) => {
      const btn = e.target instanceof HTMLElement ? e.target.closest("button") : null;
      if (btn) playUi("click");
    });
    // §🧹 (playtest): o arrasto do PC reusa o `pegando` do gesto de toque e o
    // MESMO `mover_container` — quem aplica é o servidor, como sempre.
    this.arrasto = new ArrastoDeSlot({
      slotEm: (x, y) => slotSob(x, y),
      iconeDe: (slot) => {
        const id =
          slot < INV_SLOTS
            ? this.mochila.idDoSlot(slot)
            : (this.slots[slot - INV_SLOTS]?.id ?? null);
        return id === null ? null : (this.icons.get(id) ?? null);
      },
      qtdDe: (slot) =>
        slot < INV_SLOTS
          ? this.mochila.qtdDoSlot(slot)
          : (this.slots[slot - INV_SLOTS]?.qtd ?? 0),
      pegando: () => this.pegando,
      setPegando: (s) => {
        this.pegando = s;
      },
      metade: () => this.metadePegando,
      setMetade: (q) => {
        this.metadePegando = q;
      },
      mover: (de, para, qtd) => {
        if (this.pos) this.mover(this.pos.x, this.pos.y, this.pos.z, de, para, qtd);
      },
      sobreLixeira: (x, y) => lixeiraSob(x, y),
      descartar: (slot, qtd) => {
        if (this.pos) this.descartar(this.pos.x, this.pos.y, this.pos.z, slot, qtd);
      },
      redesenhar: () => this.render(),
      aoClicar: (slot, vazio, shift) => this.clicar(slot, vazio, shift),
    });
  }

  /** §🗑️: jogar fora com o painel aberto. Mesmo botão (e mesma classe
   *  `inv-lixeira`, que é o alvo do arrasto) do painel da mochila. */
  private botaoLixeira(quantos: number): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "inv-lixeira";
    b.textContent = `🗑️ descartar (${quantos})`;
    b.addEventListener("click", () => {
      const slot = this.pegando;
      if (slot === null || !this.pos) return;
      this.descartar(this.pos.x, this.pos.y, this.pos.z, slot, this.metadePegando ?? undefined);
      this.pegando = null;
      this.metadePegando = null;
      this.render();
    });
    return b;
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
    // §🍖 F10 (bug-593): mensagem de ANTES do "fechar" não reabre o painel. A de
    // OUTRA célula reabre: ela só pode ter nascido de um clique novo, e é o
    // cinto além do suspensório caso o host seja velho e não confirme nada.
    if (this.esperandoFechar && !trocouDeCelula) return;
    this.esperandoFechar = false;
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
    // ...e o `container_fechado` do servidor é que solta este freio.
    this.esperandoFechar = true;
  }

  /** Fecha porque o SERVIDOR mandou (`container_fechado`: o bloco sumiu, o
   *  direito mudou). Não devolve aviso — ele já sabe. */
  fecharSemAvisar(): void {
    this.esperandoFechar = false; // o servidor falou: o que vier daqui é novo
    if (!this.isOpen) return;
    this.isOpen = false;
    this.pos = null;
    this.pegando = null;
    // sem isto o fantasma da divisão (clique direito) ficava na tela depois de
    // o painel sumir — bug-609, o mesmo do inventário
    this.metadePegando = null;
    this.arrasto.sincronizar();
    esconderTooltip(); // o dono da caixa sai do DOM com o painel
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

  /** Quantidade num slot do espaço unificado (mochila ou container). */
  private qtdUnificado(unificado: number): number {
    return unificado < INV_SLOTS
      ? this.mochila.qtdDoSlot(unificado)
      : (this.slots[unificado - INV_SLOTS]?.qtd ?? 0);
  }

  private clicar(unificado: number, vazio: boolean, shift: boolean): void {
    if (this.pegando === null) {
      if (vazio) return; // nada pra pegar
      if (shift) {
        this.moverRapido(unificado);
        return;
      }
      this.pegando = unificado;
    } else if (this.pegando === unificado) {
      this.pegando = null; // tocar de novo solta
      this.metadePegando = null;
    } else if (this.pos) {
      this.mover(this.pos.x, this.pos.y, this.pos.z, this.pegando, unificado, this.metadePegando ?? undefined);
      this.metadePegando = null;
      this.pegando = null;
    }
    this.render();
  }

  /**
   * §🧹 (playtest) — shift+clique no painel de transferência: manda o item pro
   * primeiro lugar que aceita no OUTRO lado — mochila → container, container →
   * hotbar/grade. O servidor valida e aplica; se nada aceitar, nada muda.
   */
  private moverRapido(unificado: number): void {
    if (this.pos === null) return;
    const naMochila = unificado < INV_SLOTS;
    let id: number | null;
    let qtd: number;
    if (naMochila) {
      id = this.mochila.idDoSlot(unificado);
      qtd = this.mochila.qtdDoSlot(unificado);
    } else {
      const s = this.slots[unificado - INV_SLOTS];
      id = s?.id ?? null;
      qtd = s?.qtd ?? 0;
    }
    if (id === null || qtd <= 0) return;
    if (naMochila) {
      const para = primeiroLugar(
        this.slots,
        0,
        this.slots.length,
        id,
      );
      if (para === null) return;
      this.mover(this.pos.x, this.pos.y, this.pos.z, unificado, INV_SLOTS + para);
    } else {
      const inv = this.mochila.estado();
      const para = primeiroLugar(inv, 0, INV_SLOTS, id);
      if (para === null) return;
      this.mover(this.pos.x, this.pos.y, this.pos.z, unificado, para);
    }
  }

  /** Um slot: ícone, quantidade e o contorno de "pego". */
  private slotBtn(unificado: number, id: number | null, qtd: number): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "inv-slot" + (unificado === this.pegando ? " pego" : "");
    tipDeItem(b, id);
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
    // §🧹 (playtest): o botão entra no arrasto do PC (que reusa o `pegando`);
    // o clique SEM arrasto continua sendo o tocar-origem/destino de sempre.
    this.arrasto.anexar(b, unificado, id, qtd);
    return b;
  }

  private render(): void {
    // mão vazia = sem fantasma na tela (bug-609)
    this.arrasto.sincronizar();
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
        : this.metadePegando !== null
          ? `agora toque no destino (leva ${this.metadePegando} do item) — ou no mesmo item para soltar`
          : "agora toque no destino (ou no mesmo item para soltar)";

    // ⚠️ mesmo cuidado do painel da mochila: o `dica` ainda não está no
    // documento aqui, então os botões entram no `append` do fim (bug-646).
    const acoes: HTMLElement[] = [];
    if (this.pegando !== null) {
      const qtd = this.qtdUnificado(this.pegando);
      if (qtd > 1) {
        const dividir = document.createElement("button");
        dividir.type = "button";
        dividir.className = "inv-dividir";
        dividir.textContent =
          this.metadePegando !== null
            ? "↩ voltar a pilha inteira"
            : `✂ dividir ao meio (${Math.ceil(qtd / 2)})`;
        dividir.addEventListener("click", () => {
          const pego = this.pegando;
          this.metadePegando =
            this.metadePegando === null
              ? Math.ceil(this.qtdUnificado(pego!) / 2)
              : null;
          this.render();
        });
        acoes.push(dividir);
      }
      // §🗑️: a mesma lixeira da mochila, aqui no espaço UNIFICADO — dá pra
      // jogar fora tanto o que está na mochila quanto o que está no baú.
      acoes.push(this.botaoLixeira(this.metadePegando ?? qtd));
    }

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

    root.append(head, fechar, dica, ...(acoes.length ? [linhaDeAcoes(acoes)] : []), cima);

    // --- a barra de fogo e a de cozimento (só a fornalha) ---
    if (this.tipo === "fornalha") {
      root.appendChild(
        this.barra("fogo", this.queimaTotal > 0 ? this.queimando / this.queimaTotal : 0, "fogo"),
      );
      root.appendChild(
        this.barra("cozinhando", this.progresso / TICKS_POR_COZIMENTO, "coz"),
      );
    }

    // --- o DIVISOR (2026-08-05, pedido do usuário) ---
    // Os 27 slots do baú e os 27 da mochila são a MESMA grade de 9 colunas, com
    // o mesmo desenho de slot, coladas uma na outra: quem abre o baú pela
    // primeira vez não tem como saber onde acaba um e começa o outro — e o erro
    // é caro, porque tirar da metade errada é dar o item pro baú da colega.
    // Uma faixa com o nome dos dois lados resolve sem custar altura de painel.
    root.append(this.divisor(this.tipo === "fornalha" ? "fornalha" : "baú", "sua mochila"));

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

  /** A faixa que separa o container da mochila: o rótulo de CIMA à esquerda, o
   *  de BAIXO à direita, e a linha entre eles. Dois nomes (e não um traço) —
   *  "onde é o baú" e "onde sou eu" é a pergunta, e a resposta tem dois lados. */
  private divisor(cima: string, baixo: string): HTMLElement {
    const wrap = document.createElement("div");
    wrap.className = "cont-divisor";
    const a = document.createElement("small");
    a.textContent = `▲ ${cima}`;
    const linha = document.createElement("i");
    const b = document.createElement("small");
    b.textContent = `${baixo} ▼`;
    wrap.append(a, linha, b);
    return wrap;
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
