import {
  ITEM_ALGODAO,
  ITEM_BALDE_AGUA,
  ITEM_BALDE_VAZIO,
  ITEM_CARVAO,
  ITEM_CARVAO_VEGETAL,
  ITEM_DIAMANTE,
  ITEM_FRUTA,
  ITEM_GRAVETO,
  ITEM_LINGOTE_FERRO,
  ITEM_LINGOTE_OURO,
  ITEM_PAO,
  ITEM_PICARETA_DIAMANTE,
  ITEM_PICARETA_FERRO,
  ITEM_PICARETA_MADEIRA,
  ITEM_PICARETA_PEDRA,
  ITEM_TRIGO,
} from "@logica/shared";
import { makeBlockIcons } from "./blockIcons";
import { PLACEABLE, type PlaceableEntry, placeableFor } from "./blocksUi";
import type { Mochila } from "./mochila";

/** O que a barra precisa do resto do jogo, e nada além disso. */
export interface HotbarDeps {
  /** cp24: a proteção de áreas está ligada? É ela que dá varinha ao ALUNO, e
   *  ela liga e desliga no meio do jogo. */
  claimsAtivo: () => boolean;
  /** Barra de toque: ⛏/▣ viram canto 1 / canto 2. Callback porque o
   *  `TouchControls` nasce DEPOIS da barra. */
  setVarinhaToque: (ativa: boolean) => void;
  /** Os painéis que espelham a mochila (inventário e container) redesenham
   *  junto — a mesma pilha aparece nos três lugares. */
  aoRedesenhar: () => void;
}

/**
 * cp16 — a hotbar de 9 slots, e por que ela é um objeto.
 *
 * O que estava solto no `startGame` e agora mora aqui: os 9 slots locais (com a
 * persistência no `localStorage`), o slot SELECIONADO, o modo varinha, o mapa
 * de ícones recortados do atlas e a tabela de nomes.
 *
 * A regra que dá sentido ao conjunto está no `refresh`: **em sobrevivência os 9
 * slots são os do SERVIDOR** (`mochila.hotbar()`, com quantidade) e **em
 * criativo são a paleta escolhida no inventário**, que é a única que persiste.
 * Por isso `idNaMao()` existe: quem precisa saber o que o jogador segura
 * (colocar, quebrar com balde, comer) não pode escolher a fonte errada.
 *
 * `slotLocal` é a exceção deliberada: a mira do balde vazio lê o slot LOCAL
 * mesmo em sobrevivência, como fazia antes de a mochila existir.
 */
export class HotbarUi {
  private static readonly KEY = "lj-hotbar";
  private readonly el = document.getElementById("hotbar");
  /** Os 9 slots do modo criativo (persistem no navegador). */
  private readonly slots: number[];
  private sel = 0;
  /** varinha (cp11): cliques viram marcas de canto de região/claim. */
  private varinha = false;
  /** A lista de colocáveis DESTE papel — o aluno nunca vê rocha-matriz. */
  readonly meusBlocos: readonly PlaceableEntry[];
  /** Ícones recortados do próprio texture atlas (blockIcons.ts). */
  readonly icons: Map<number, string>;

  constructor(
    private readonly papel: "professor" | "aluno",
    private readonly mochila: Mochila,
    atlas: HTMLCanvasElement,
    private readonly deps: HotbarDeps,
  ) {
    this.meusBlocos = placeableFor(papel);
    this.slots = this.carregar();
    this.icons = makeBlockIcons(atlas, [
      ...PLACEABLE.map((b) => b.id),
      // itens não estão em PLACEABLE e precisam de ícone: o balde VAZIO (só o
      // cheio é colocável), a comida do §🍖 F6 e os itens da fundição do §🍖
      // F10 — a lista de craft mostra "1/1 carvão" com o ícone deles.
      ITEM_BALDE_VAZIO, ITEM_FRUTA, ITEM_TRIGO, ITEM_PAO,
      ITEM_CARVAO, ITEM_DIAMANTE, ITEM_GRAVETO,
      ITEM_CARVAO_VEGETAL, ITEM_LINGOTE_FERRO, ITEM_LINGOTE_OURO, ITEM_ALGODAO,
      ITEM_PICARETA_MADEIRA, ITEM_PICARETA_PEDRA, ITEM_PICARETA_FERRO, ITEM_PICARETA_DIAMANTE,
    ]);
    // Toque (2026-07-27, layouts mobile): tocar num slot escolhe o bloco. No
    // tablet não existe 1–9 nem scroll do mouse, então sem isto trocar de bloco
    // exigia abrir o inventário TODA vez. Delegação no #hotbar porque o
    // `refresh` troca o innerHTML inteiro. O CSS só dá pointer-events à faixa
    // .slots — no resto da barra o arrasto tem que chegar no #touch-look.
    this.el?.addEventListener("pointerdown", (e) => {
      const slot = (e.target as HTMLElement | null)?.closest?.(".slot");
      if (!slot || !this.el) return;
      const i = [...this.el.querySelectorAll(".slot")].indexOf(slot);
      if (i < 0) return;
      e.preventDefault(); // sem clique sintetizado depois (mesmo motivo do touch.ts)
      this.selecionar(i);
    });
  }

  /** Aparelho de dedo: a barra passa a capturar clique pra escolher o slot. */
  habilitarToque(): void {
    if (!this.el) return;
    this.el.style.pointerEvents = "auto";
    this.el.addEventListener("click", (e) => {
      const slot = e.target instanceof HTMLElement ? e.target.closest(".slot") : null;
      const idx = slot?.parentElement
        ? Array.from(slot.parentElement.children).indexOf(slot)
        : -1;
      if (idx < 0) return;
      this.selecionar(idx);
    });
  }

  get selected(): number {
    return this.sel;
  }

  get varinhaAtiva(): boolean {
    return this.varinha;
  }

  /** Os 9 slots LOCAIS — o inventário desenha a paleta a partir deles. */
  get paleta(): readonly number[] {
    return this.slots;
  }

  /** O id do slot local selecionado, ignorando a mochila. Só a mira do balde
   *  vazio usa isto; todo o resto quer `idNaMao()`. */
  get slotLocal(): number | undefined {
    return this.slots[this.sel];
  }

  /** Id na mão AGORA (null = mão vazia em sobrevivência). Fonte única pra quem
   *  precisa saber o que o jogador segura: colocar, quebrar com balde, comer. */
  idNaMao(): number | null {
    return this.mochila.ativa ? this.mochila.idDoSlot(this.sel) : (this.slots[this.sel] ?? null);
  }

  nome(id: number): string {
    if (id === ITEM_BALDE_VAZIO) return "balde vazio";
    if (id === ITEM_BALDE_AGUA) return "balde de água";
    if (id === ITEM_FRUTA) return "fruta";
    if (id === ITEM_TRIGO) return "trigo";
    if (id === ITEM_PAO) return "pão";
    if (id === ITEM_CARVAO) return "carvão";
    if (id === ITEM_DIAMANTE) return "diamante";
    if (id === ITEM_GRAVETO) return "graveto";
    if (id === ITEM_CARVAO_VEGETAL) return "carvão vegetal";
    if (id === ITEM_LINGOTE_FERRO) return "lingote de ferro";
    if (id === ITEM_LINGOTE_OURO) return "lingote de ouro";
    if (id === ITEM_ALGODAO) return "algodão";
    if (id === ITEM_PICARETA_MADEIRA) return "picareta de madeira";
    if (id === ITEM_PICARETA_PEDRA) return "picareta de pedra";
    if (id === ITEM_PICARETA_FERRO) return "picareta de ferro";
    if (id === ITEM_PICARETA_DIAMANTE) return "picareta de diamante";
    return PLACEABLE.find((b) => b.id === id)?.name ?? "?";
  }

  selecionar(i: number): void {
    this.sel = i;
    this.refresh();
  }

  /** Scroll do mouse cicla os 9 slots. */
  ciclar(dir: number): void {
    this.sel = (this.sel + dir + this.slots.length) % this.slots.length;
    this.refresh();
  }

  /** Escreve o slot local selecionado e GRAVA — o inventário, o botão do meio e
   *  o balde de criativo entram todos por aqui. */
  definirSlotLocal(id: number): void {
    this.slots[this.sel] = id;
    localStorage.setItem(HotbarUi.KEY, JSON.stringify(this.slots));
    this.refresh();
  }

  /** professor: varinha p/ regiões (sempre). aluno: só com a proteção de áreas
   *  ligada (cp24), pra marcar o próprio claim. */
  toggleVarinha(): void {
    if (this.papel !== "professor" && !this.deps.claimsAtivo()) return;
    this.varinha = !this.varinha;
    this.deps.setVarinhaToque(this.varinha);
    this.refresh();
  }

  /** A proteção desligou no meio do jogo: tira o aluno do modo varinha (senão a
   *  tecla R fica travada — o guard não deixa reentrar sem proteção ligada). */
  revalidarVarinha(): void {
    if (!this.deps.claimsAtivo() && this.papel !== "professor" && this.varinha) {
      this.varinha = false;
      this.deps.setVarinhaToque(false);
    }
  }

  refresh(): void {
    if (!this.el) return;
    // nomes/ícones são constantes do código (sem input externo) — innerHTML ok aqui
    if (this.varinha) {
      const criar = this.papel === "professor" ? "/regiao criar nome" : "/claim criar";
      this.el.innerHTML = `<b>[varinha]</b> esq = canto 1 · dir = canto 2 · ${criar} · R/🪄 volta`;
      return;
    }
    // §🍖 F4: em sobrevivência os 9 slots são os do SERVIDOR (com quantidade);
    // em criativo, a paleta escolhida no inventário, como sempre.
    const ids: (number | null | undefined)[] = this.mochila.ativa
      ? this.mochila.hotbar()
      : this.slots;
    const html = ids
      .map((id, i) => {
        const sel = i === this.sel ? " sel" : "";
        if (id === null || id === undefined)
          return `<span class="slot${sel} vazio"><small>${i + 1}</small></span>`;
        const qtd = this.mochila.ativa ? this.mochila.qtdDoSlot(i) : 0;
        const conta = qtd > 1 ? `<b class="qtd">${qtd}</b>` : "";
        return `<span class="slot${sel}"><small>${i + 1}</small><img src="${this.icons.get(id) ?? ""}" alt="">${conta}</span>`;
      })
      .join("");
    const naMao = ids[this.sel];
    this.el.innerHTML =
      `<span class="bar-nome">${naMao === null || naMao === undefined ? "mão vazia" : this.nome(naMao)}</span>` +
      `<span class="slots">${html}</span>`;
    this.deps.aoRedesenhar();
  }

  /** Defensivo por slot: id fora da lista (ou config velha) cai no default. O
   *  papel já chegou no spawn, então a hotbar do aluno nunca oferece
   *  rocha-matriz, nem por slot salvo antigo. */
  private carregar(): number[] {
    const def = this.meusBlocos.slice(0, 9).map((b) => b.id);
    const valid = new Set<number>(this.meusBlocos.map((b) => b.id));
    valid.add(ITEM_BALDE_VAZIO); // balde esvaziado guardado no slot sobrevive ao reload
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(HotbarUi.KEY) ?? "null");
      if (!Array.isArray(raw)) return def;
      return def.map((d, i) => {
        const v: unknown = raw[i];
        return typeof v === "number" && valid.has(v) ? v : d;
      });
    } catch {
      return def;
    }
  }
}
