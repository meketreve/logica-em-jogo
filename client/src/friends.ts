import { MAX_AMIGOS } from "@logica/shared";
import { playUi } from "./audio";

/**
 * Painel de amigos (2026-08-04) — a interface do `/amigos`, para TODO jogador.
 *
 * É a "fase 2" que o cp24 já anotava: os comandos vieram primeiro (usáveis em
 * playtest), o painel vem depois. **Nenhuma função nova** — os seis
 * subcomandos, apresentados melhor:
 *   convidar · aceitar · recusar · sair · expulsar (só dono) · lista
 * `lista` é o CORPO do painel (nunca um botão): quem está no grupo, quantos
 * cabem e quem convidou você.
 *
 * Disciplina de sempre: o botão COMPÕE um `/amigos ...` e espera o `friends`
 * novo voltar — nada de mexer na lista local no clique. Mesma moldura do
 * painel de jogadores (`#amigos`, altura fixa, rolagem só na lista).
 */
export interface FriendsData {
  /** Nome do PRÓPRIO jogador — é o que diz se eu sou o dono do grupo. */
  eu: string;
  /** Grupo de amigos (null = não estou em nenhum). Vem do servidor. */
  equipe: { dono: string; membros: string[] } | null;
  /** Quem me convidou e ainda espera resposta. */
  convites: string[];
  /** Quem EU convidei e ainda não respondeu. */
  enviados: string[];
  /** Quem está online agora (o main aprende pelo player_moved/player_left).
   *  Não inclui quem já está em outro grupo — isso só o servidor sabe, e é ele
   *  quem recusa. */
  online: string[];
}

export class FriendsPanel {
  private readonly root = document.getElementById("amigos");
  private isOpen = false;
  private data: FriendsData = { eu: "", equipe: null, convites: [], enviados: [], online: [] };

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

  /** Estado novo (do `friends` ou da lista de online) — re-render se aberto. */
  update(data: FriendsData): void {
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

  // --- fábrica de controles (textContent sempre — nome é digitado por gente) ---

  private btn(label: string, onClick: () => void): HTMLButtonElement {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }

  /** Botão perigoso em 2 cliques (padrão dos painéis): 1º arma, 2º executa. */
  private armedBtn(label: string, onConfirm: () => void): HTMLButtonElement {
    const b = this.btn(label, () => {
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

  private sec(titulo: string): HTMLHeadingElement {
    const h = document.createElement("h3");
    h.textContent = titulo;
    return h;
  }

  private hint(texto: string): HTMLParagraphElement {
    const p = document.createElement("p");
    p.className = "painel-hint";
    p.textContent = texto;
    return p;
  }

  private linha(nome: string, ...botoes: HTMLElement[]): HTMLDivElement {
    const row = document.createElement("div");
    row.className = "jog-row";
    const span = document.createElement("span");
    span.className = "jog-nome";
    span.textContent = nome;
    row.append(span, ...botoes);
    return row;
  }

  // --- render ---

  private render(): void {
    const root = this.root;
    if (!root) return;
    root.replaceChildren();

    const head = document.createElement("div");
    head.className = "painel-head";
    const h = document.createElement("h2");
    h.textContent = "amigos";
    head.append(h, this.btn("✕ fechar", () => this.hide()));

    // uma lista só rola (o painel tem altura fixa) — as seções vivem dentro
    const lista = document.createElement("div");
    lista.className = "jog-lista";
    this.renderConvites(lista);
    this.renderGrupo(lista);
    this.renderConvidar(lista);
    lista.append(
      this.hint(
        "pelo chat também dá: /amigos convidar nome · /amigos aceitar · /amigos recusar · " +
          "/amigos sair · /amigos expulsar nome · /amigos lista",
      ),
    );

    root.append(head, lista);
  }

  private renderConvites(lista: HTMLElement): void {
    if (this.data.convites.length === 0) return; // sem convite, sem seção
    lista.append(this.sec(`✉ convites para você (${this.data.convites.length})`));
    for (const dono of this.data.convites) {
      lista.append(
        this.linha(
          `${dono} convidou você`,
          this.btn("aceitar", () => this.send(`/amigos aceitar ${dono}`)),
          this.btn("recusar", () => this.send(`/amigos recusar ${dono}`)),
        ),
      );
    }
    lista.append(this.hint("aceitar um convite descarta os outros — você fica em UM grupo só."));
  }

  private renderGrupo(lista: HTMLElement): void {
    const { eu, equipe } = this.data;
    if (!equipe) {
      lista.append(this.sec("👥 seu grupo"));
      lista.append(
        this.hint(
          `Você não está em nenhum grupo. Quem está no seu grupo pode construir na sua ÁREA ` +
            `PROTEGIDA (e você na dele). Cabem ${MAX_AMIGOS} pessoas, contando você.`,
        ),
      );
      return;
    }
    const souDono = equipe.dono === eu;
    lista.append(this.sec(`👥 grupo de ${equipe.dono} — ${equipe.membros.length}/${MAX_AMIGOS}`));
    for (const nome of equipe.membros) {
      const rotulos = [nome === equipe.dono ? "dono" : "", nome === eu ? "você" : ""].filter(
        (s) => s,
      );
      const texto = rotulos.length ? `${nome} (${rotulos.join(", ")})` : nome;
      lista.append(
        souDono && nome !== eu
          ? this.linha(texto, this.armedBtn("expulsar", () => this.send(`/amigos expulsar ${nome}`)))
          : this.linha(texto),
      );
    }
    // dono saindo DISSOLVE o grupo: o comando já faz isso, mas em texto ninguém lê
    const row = document.createElement("div");
    row.className = "painel-row";
    row.append(
      souDono
        ? this.armedBtn("sair e DESFAZER o grupo", () => this.send("/amigos sair"))
        : this.armedBtn("sair do grupo", () => this.send("/amigos sair")),
    );
    lista.append(row);
    if (souDono) {
      lista.append(this.hint("você é o dono: se sair, o grupo acaba para todo mundo."));
    }
  }

  private renderConvidar(lista: HTMLElement): void {
    const { eu, equipe, enviados, online } = this.data;
    lista.append(this.sec("＋ convidar"));
    if (equipe && equipe.dono !== eu) {
      lista.append(
        this.hint(`Só ${equipe.dono} convida para este grupo. Saia dele para montar o seu.`),
      );
      return;
    }
    if (equipe && equipe.membros.length >= MAX_AMIGOS) {
      lista.append(this.hint(`Grupo cheio (${MAX_AMIGOS}/${MAX_AMIGOS}).`));
      return;
    }
    for (const nome of enviados) {
      lista.append(this.linha(`${nome} — convite enviado, aguardando`));
    }
    const naEquipe = new Set(equipe?.membros ?? []);
    const candidatos = online.filter(
      (n) => n !== eu && !naEquipe.has(n) && !enviados.includes(n),
    );
    for (const nome of candidatos) {
      lista.append(this.linha(nome, this.btn("convidar", () => this.send(`/amigos convidar ${nome}`))));
    }
    if (candidatos.length === 0 && enviados.length === 0) {
      lista.append(this.hint("ninguém mais está na aula agora."));
    }
  }
}
