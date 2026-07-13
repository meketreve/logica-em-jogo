import {
  type GroupDef,
  type NamedRegion,
  type ObjectiveState,
  type ScenarioModo,
  regionDims,
} from "@logica/shared";
import { playUi } from "./audio";
import { PLACEABLE } from "./blocksUi";

/**
 * Painéis HTML do cp14 — açúcar visual sobre os comandos de chat: cada botão
 * COMPÕE um comando (/objetivo, /regiao, /grupo) e manda pro servidor, que
 * valida como sempre (o painel nunca decide estado). A resposta volta pelo
 * chat e o estado novo chega pelos broadcasts (regions/objectives/groups),
 * que re-renderizam o painel aberto.
 *
 * AuthorPanel = professor (autoria: objetivos, regiões, grupos — substitui
 * decorar comandos). GroupPanel = aluno (entrar/trocar de grupo; só abre
 * depois do professor criar grupos). Texto de professor/aluno é input
 * externo → sempre textContent, nunca innerHTML.
 */

export interface PanelData {
  regions: NamedRegion[];
  modo: ScenarioModo;
  objetivos: ObjectiveState[];
  grupos: GroupDef[];
  /** Grupo do PRÓPRIO jogador (null = sem grupo). */
  myGrupo: number | null;
}

/** O que o main.ts precisa de qualquer painel (professor OU aluno). */
export interface GamePanel {
  readonly open: boolean;
  toggle(): void;
  hide(): void;
  update(data: PanelData): void;
}

abstract class Panel implements GamePanel {
  protected readonly root = document.getElementById("painel");
  protected data: PanelData = {
    regions: [],
    modo: "sequencial",
    objetivos: [],
    grupos: [],
    myGrupo: null,
  };
  private isOpen = false;
  private dirty = false;

  private readonly onEsc = (e: KeyboardEvent): void => {
    if (e.code !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    this.hide();
  };

  constructor(
    protected readonly send: (cmd: string) => void,
    private readonly onToggle: (open: boolean) => void,
  ) {
    // som de UI por delegação, igual ao menu
    this.root?.addEventListener("click", (e) => {
      const btn = e.target instanceof HTMLElement ? e.target.closest("button") : null;
      if (btn) playUi("click");
    });
    // broadcast chegou com um campo em foco: re-render fica pra quando o
    // foco sair (não apagar o que o professor está digitando)
    this.root?.addEventListener("focusout", () => {
      if (this.dirty && this.isOpen) {
        this.dirty = false;
        this.render();
      }
    });
  }

  get open(): boolean {
    return this.isOpen;
  }

  update(data: PanelData): void {
    this.data = data;
    if (!this.isOpen) return;
    const ae = document.activeElement;
    if (
      ae &&
      this.root?.contains(ae) &&
      (ae instanceof HTMLInputElement || ae instanceof HTMLSelectElement)
    ) {
      this.dirty = true;
      return;
    }
    this.render();
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
    // capture: fecha o painel ANTES do Input ver a tecla
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

  protected abstract render(): void;

  // --- fábrica de controles (textContent sempre — entrada vem de gente) ---

  protected head(titulo: string): HTMLElement {
    const head = document.createElement("div");
    head.className = "painel-head";
    const h = document.createElement("h2");
    h.textContent = titulo;
    head.append(h, this.btn("✕ fechar", () => this.hide()));
    return head;
  }

  protected sec(titulo: string): HTMLHeadingElement {
    const h = document.createElement("h3");
    h.textContent = titulo;
    return h;
  }

  protected btn(label: string, onClick: () => void): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  /** Botão perigoso em 2 cliques (padrão do menu): 1º arma, 2º executa;
   *  3 s sem o 2º clique desarma sozinho. */
  protected armedBtn(label: string, onConfirm: () => void): HTMLButtonElement {
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

  protected row(...children: (HTMLElement | string)[]): HTMLDivElement {
    const div = document.createElement("div");
    div.className = "painel-row";
    for (const c of children) {
      if (typeof c === "string") {
        const span = document.createElement("span");
        span.textContent = c;
        div.appendChild(span);
      } else {
        div.appendChild(c);
      }
    }
    return div;
  }

  protected hint(texto: string): HTMLParagraphElement {
    const p = document.createElement("p");
    p.className = "painel-hint";
    p.textContent = texto;
    return p;
  }

  protected select(
    options: { value: string; label: string }[],
    value: string,
    onChange: (v: string) => void,
  ): HTMLSelectElement {
    const sel = document.createElement("select");
    for (const o of options) sel.appendChild(new Option(o.label, o.value));
    if (options.some((o) => o.value === value)) sel.value = value;
    onChange(sel.value); // sincroniza o rascunho mesmo se o valor antigo sumiu
    sel.addEventListener("change", () => onChange(sel.value));
    return sel;
  }

  protected textInput(
    placeholder: string,
    value: string,
    onInput: (v: string) => void,
    size?: number,
  ): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.value = value;
    if (size) {
      input.size = size;
      input.classList.add("painel-input-curto");
    }
    input.addEventListener("input", () => onInput(input.value));
    return input;
  }
}

// --- Painel de autoria (professor) ---

export class AuthorPanel extends Panel {
  /** Rascunho dos formulários — sobrevive aos re-renders dos broadcasts. */
  private draft = {
    objKind: "construir" as "construir" | "chegar" | "limpar",
    objModelo: "",
    objAlvo: "",
    objRegra: "um" as "um" | "todos",
    objTexto: "",
    regiaoNome: "",
    encherRegiao: "",
    encherBloco: String(PLACEABLE[0]?.id ?? 1),
    carimbModelo: "",
    carimbPrefixo: "",
    carimbEsp: "2",
    carimbEixo: "x" as "x" | "z",
    grupoN: "4",
  };
  private editandoId: number | null = null;
  private editandoTexto = "";
  private erroMsg = "";

  private flash(msg: string): void {
    this.erroMsg = msg;
    this.render();
  }

  private cmd(c: string): void {
    this.erroMsg = "";
    this.send(c);
  }

  /** Opções de região pros selects; com grupos, prefixos per-grupo
   *  (nome-1…N, como o /regiao carimbar cria) viram UMA opção. */
  private regionOptions(comPrefixos: boolean): { value: string; label: string }[] {
    const nomes = new Set(this.data.regions.map((r) => r.nome));
    const opts = this.data.regions.map((r) => {
      const d = regionDims(r);
      return { value: r.nome, label: `${r.nome} (${d.x}×${d.y}×${d.z})` };
    });
    if (comPrefixos && this.data.grupos.length > 0) {
      for (const nome of nomes) {
        const m = /^(.+)-1$/.exec(nome);
        if (m?.[1] && !nomes.has(m[1])) {
          opts.push({
            value: m[1],
            label: `${m[1]}-1…${this.data.grupos.length} (uma área por grupo)`,
          });
        }
      }
    }
    return opts;
  }

  private estadoDe(o: ObjectiveState): string {
    if (o.porGrupo?.length) {
      const done = o.porGrupo.filter((g) => g.completo).length;
      return done === o.porGrupo.length
        ? "✓ todos os grupos"
        : `${done}/${o.porGrupo.length} grupos ✓`;
    }
    return o.completo ? "✓ concluído" : o.ativo ? "ativo" : "aguardando";
  }

  protected render(): void {
    const root = this.root;
    if (!root) return;
    root.textContent = "";
    root.append(this.head("painel de autoria"));
    if (this.erroMsg) {
      const p = document.createElement("p");
      p.className = "painel-erro";
      p.textContent = this.erroMsg;
      root.append(p);
    }
    this.renderObjetivos(root);
    this.renderRegioes(root);
    this.renderGrupos(root);
    root.append(this.hint("as respostas dos comandos aparecem no chat (canto inferior esquerdo)"));
  }

  private renderObjetivos(root: HTMLElement): void {
    root.append(this.sec("🎯 objetivos"));
    const modoRow = this.row("modo:");
    for (const modo of ["sequencial", "livre"] as const) {
      const b = this.btn(modo === this.data.modo ? `● ${modo}` : modo, () =>
        this.cmd(`/objetivo modo ${modo}`),
      );
      if (modo === this.data.modo) b.disabled = true;
      modoRow.append(b);
    }
    modoRow.append("(sequencial = um de cada vez, na ordem)");
    root.append(modoRow);

    this.data.objetivos.forEach((o, i) => {
      const box = document.createElement("div");
      box.className = "painel-obj";
      const title = document.createElement("div");
      title.textContent = `#${o.id} ${o.kind} → ${o.regiao} — ${this.estadoDe(o)}`;
      box.append(title);
      if (this.editandoId === o.id) {
        const input = this.textInput("texto do objetivo", this.editandoTexto, (v) => {
          this.editandoTexto = v;
        });
        const ok = this.btn("salvar", () => {
          const t = this.editandoTexto.trim();
          if (!t) return;
          this.editandoId = null;
          this.cmd(`/objetivo texto ${o.id} ${t}`);
          this.render();
        });
        const cancelar = this.btn("cancelar", () => {
          this.editandoId = null;
          this.render();
        });
        box.append(this.row(input, ok, cancelar));
      } else {
        const txt = document.createElement("small");
        txt.textContent = o.texto;
        box.append(txt);
        const up = this.btn("↑", () => this.cmd(`/objetivo mover ${o.id} ${i}`));
        up.disabled = i === 0;
        const down = this.btn("↓", () => this.cmd(`/objetivo mover ${o.id} ${i + 2}`));
        down.disabled = i === this.data.objetivos.length - 1;
        const editar = this.btn("✎ texto", () => {
          this.editandoId = o.id;
          this.editandoTexto = o.texto;
          this.render();
        });
        box.append(
          this.row(up, down, editar, this.armedBtn("✕ remover", () => this.cmd(`/objetivo remover ${o.id}`))),
        );
      }
      root.append(box);
    });

    root.append(this.sec("＋ novo objetivo"));
    const kindSel = this.select(
      [
        { value: "construir", label: "construir (copiar um modelo)" },
        { value: "chegar", label: "chegar (ir até uma área)" },
        { value: "limpar", label: "limpar (esvaziar uma área)" },
      ],
      this.draft.objKind,
      (v) => {
        this.draft.objKind = v as "construir" | "chegar" | "limpar";
      },
    );
    kindSel.addEventListener("change", () => this.render()); // campos mudam com o tipo
    root.append(this.row("tipo:", kindSel));
    const alvoOpts = this.regionOptions(true);
    if (alvoOpts.length === 0) {
      root.append(this.hint("crie uma região antes (seção regiões, logo abaixo)"));
    } else {
      if (this.draft.objKind === "construir") {
        const modeloSel = this.select(this.regionOptions(false), this.draft.objModelo, (v) => {
          this.draft.objModelo = v;
        });
        const alvoSel = this.select(alvoOpts, this.draft.objAlvo, (v) => {
          this.draft.objAlvo = v;
        });
        root.append(this.row("modelo:", modeloSel), this.row("alvo:", alvoSel));
        root.append(
          this.hint(
            "fotografa o modelo AGORA (construa antes); o alvo precisa ter o mesmo tamanho",
          ),
        );
      } else {
        const alvoSel = this.select(alvoOpts, this.draft.objAlvo, (v) => {
          this.draft.objAlvo = v;
        });
        root.append(this.row("área:", alvoSel));
        if (this.draft.objKind === "chegar") {
          const regraSel = this.select(
            [
              { value: "um", label: "basta um do grupo chegar" },
              { value: "todos", label: "o grupo todo dentro, junto" },
            ],
            this.draft.objRegra,
            (v) => {
              this.draft.objRegra = v as "um" | "todos";
            },
          );
          root.append(this.row("conclui quando:", regraSel));
        }
      }
      const texto = this.textInput(
        "texto que o aluno vê (ex.: Copie o padrão do modelo)",
        this.draft.objTexto,
        (v) => {
          this.draft.objTexto = v;
        },
      );
      const criar = this.btn("criar objetivo", () => {
        const t = this.draft.objTexto.trim();
        if (!t) {
          this.flash("escreva o texto do objetivo");
          return;
        }
        const k = this.draft.objKind;
        if (k === "construir") {
          this.cmd(`/objetivo add construir ${this.draft.objModelo} ${this.draft.objAlvo} ${t}`);
        } else if (k === "chegar") {
          const regra = this.draft.objRegra === "todos" ? "todos " : "";
          this.cmd(`/objetivo add chegar ${this.draft.objAlvo} ${regra}${t}`);
        } else {
          this.cmd(`/objetivo add limpar ${this.draft.objAlvo} ${t}`);
        }
        this.draft.objTexto = "";
        this.render();
      });
      root.append(this.row(texto, criar));
    }
    if (this.data.objetivos.length > 0) {
      root.append(
        this.row(this.armedBtn("zerar progresso da turma", () => this.cmd("/objetivo resetar"))),
      );
    }
  }

  private renderRegioes(root: HTMLElement): void {
    root.append(this.sec("📐 regiões"));
    for (const r of this.data.regions) {
      const d = regionDims(r);
      const row = this.row(
        `${r.nome} — ${d.x}×${d.y}×${d.z} em (${r.min.x}, ${r.min.y}, ${r.min.z})`,
      );
      row.classList.add("painel-obj");
      row.append(this.armedBtn("apagar", () => this.cmd(`/regiao apagar ${r.nome}`)));
      root.append(row);
    }
    root.append(
      this.hint("criar: tecla R no jogo (varinha), clique esq/dir marca os 2 cantos, aí:"),
    );
    const nomeIn = this.textInput("nome da região (sem espaços)", this.draft.regiaoNome, (v) => {
      this.draft.regiaoNome = v;
    });
    const criarReg = this.btn("criar região", () => {
      const nome = this.draft.regiaoNome.trim();
      if (!nome) {
        this.flash("dê um nome pra região");
        return;
      }
      if (/\s/.test(nome)) {
        this.flash("nome de região não pode ter espaço");
        return;
      }
      this.draft.regiaoNome = "";
      this.cmd(`/regiao criar ${nome}`);
      this.render();
    });
    root.append(this.row(nomeIn, criarReg));

    if (this.data.regions.length > 0) {
      const encherReg = this.select(this.regionOptions(false), this.draft.encherRegiao, (v) => {
        this.draft.encherRegiao = v;
      });
      const blocoOpts = [
        { value: "0", label: "ar (limpar)" },
        ...PLACEABLE.map((b) => ({ value: String(b.id), label: b.name })),
      ];
      const encherBloco = this.select(blocoOpts, this.draft.encherBloco, (v) => {
        this.draft.encherBloco = v;
      });
      root.append(
        this.row(
          "encher",
          encherReg,
          "com",
          encherBloco,
          this.btn("aplicar", () =>
            this.cmd(`/regiao encher ${this.draft.encherRegiao} ${this.draft.encherBloco}`),
          ),
        ),
      );
      if (this.data.grupos.length > 0) {
        const carimbSel = this.select(this.regionOptions(false), this.draft.carimbModelo, (v) => {
          this.draft.carimbModelo = v;
        });
        const prefixo = this.textInput("prefixo", this.draft.carimbPrefixo, (v) => {
          this.draft.carimbPrefixo = v;
        }, 10);
        const esp = this.textInput("espaço", this.draft.carimbEsp, (v) => {
          this.draft.carimbEsp = v;
        }, 4);
        const eixo = this.select(
          [
            { value: "x", label: "eixo x" },
            { value: "z", label: "eixo z" },
          ],
          this.draft.carimbEixo,
          (v) => {
            this.draft.carimbEixo = v as "x" | "z";
          },
        );
        const go = this.btn("carimbar: 1 cópia por grupo", () => {
          const p = this.draft.carimbPrefixo.trim();
          const e = Number(this.draft.carimbEsp);
          if (!p || /\s/.test(p)) {
            this.flash("prefixo precisa ser uma palavra sem espaço");
            return;
          }
          if (!Number.isInteger(e) || e < 0) {
            this.flash("espaçamento precisa ser um número inteiro ≥ 0");
            return;
          }
          this.cmd(
            `/regiao carimbar ${this.draft.carimbModelo} ${p} ${e}` +
              (this.draft.carimbEixo === "z" ? " z" : ""),
          );
        });
        root.append(this.row("carimbar", carimbSel, prefixo, esp, eixo, go));
        root.append(this.hint("carimbar copia a região (com blocos!) e nomeia prefixo-1…N — as áreas dos grupos"));
      } else {
        root.append(this.hint("a ferramenta de carimbar (1 área por grupo) aparece depois de criar grupos"));
      }
    }
  }

  private renderGrupos(root: HTMLElement): void {
    root.append(this.sec("👥 grupos"));
    for (const g of this.data.grupos) {
      const row = this.row(`grupo ${g.id} (${g.membros.length}): ${g.membros.join(", ") || "—"}`);
      row.classList.add("painel-obj");
      root.append(row);
    }
    const nIn = this.textInput("nº", this.draft.grupoN, (v) => {
      this.draft.grupoN = v;
    }, 4);
    const criarG = (porAluno: boolean): void => {
      const n = Number(this.draft.grupoN);
      if (!Number.isInteger(n) || n < 1) {
        this.flash("quantidade precisa ser um número ≥ 1");
        return;
      }
      this.cmd(`/grupo criar ${n}${porAluno ? " alunos" : ""}`);
    };
    root.append(
      this.row(
        nIn,
        this.armedBtn("criar N grupos", () => criarG(false)),
        this.armedBtn("grupos de N alunos", () => criarG(true)),
      ),
    );
    root.append(
      this.hint(
        this.data.grupos.length
          ? "criar de novo redistribui a turma e ZERA o progresso por grupo"
          : "criar grupos distribui os alunos online automaticamente (professor fica fora)",
      ),
    );
  }
}

// --- Painel de grupo (aluno) ---

export class GroupPanel extends Panel {
  protected render(): void {
    const root = this.root;
    if (!root) return;
    root.textContent = "";
    root.append(this.head("grupos"));
    if (this.data.grupos.length === 0) {
      root.append(this.hint("o professor ainda não criou grupos"));
      return;
    }
    const meu = this.data.myGrupo;
    root.append(
      this.hint(
        meu !== null
          ? `você está no grupo ${meu}`
          : "você está SEM grupo — entre num grupo pra participar dos objetivos",
      ),
    );
    for (const g of this.data.grupos) {
      const row = this.row(`grupo ${g.id} (${g.membros.length}): ${g.membros.join(", ") || "—"}`);
      row.classList.add("painel-obj");
      row.append(
        g.id === meu
          ? this.btn("sair", () => this.send("/grupo sair"))
          : this.btn("entrar", () => this.send(`/grupo entrar ${g.id}`)),
      );
      root.append(row);
    }
    root.append(this.hint("pelo chat também dá: /grupo entrar n · /grupo sair"));
  }
}
