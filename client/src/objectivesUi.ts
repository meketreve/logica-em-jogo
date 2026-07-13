import {
  type GroupObjectiveState,
  type ObjectiveState,
  type ScenarioModo,
} from "@logica/shared";

export interface ObjectivesCtx {
  /** Grupo do PRÓPRIO jogador (null = sem grupo). */
  grupo: number | null;
  professor: boolean;
  /** Rótulo da tecla do painel (cp14) — entra no aviso "entre num grupo". */
  painelKey: string;
}

/**
 * Painel de objetivos (cp12/13) — HTML sobre o canvas, canto superior direito.
 * Sem grupos: objetivos ativos + contador. Com grupos: aluno vê o progresso
 * DO SEU grupo; professor vê o resumo de todos os grupos (observa a turma).
 * Texto vem do PROFESSOR (input externo) → sempre textContent, nunca innerHTML.
 */
export class ObjectivesUi {
  private readonly root = document.getElementById("objetivos");

  update(modo: ScenarioModo, list: ObjectiveState[], ctx: ObjectivesCtx): void {
    if (!this.root) return;
    this.root.textContent = "";
    if (list.length === 0) {
      this.root.classList.add("hidden");
      return;
    }
    this.root.classList.remove("hidden");

    const temGrupos = list.some((o) => o.porGrupo);
    const meu = (o: ObjectiveState): GroupObjectiveState | undefined =>
      ctx.grupo !== null ? o.porGrupo?.find((g) => g.grupo === ctx.grupo) : undefined;

    // aluno sem grupo num mundo com grupos: só o aviso — ele não pontua
    if (temGrupos && !ctx.professor && ctx.grupo === null) {
      const aviso = document.createElement("div");
      aviso.className = "obj";
      aviso.textContent = `⚠ entre num grupo pra participar — tecla ${ctx.painelKey} abre o painel de grupos`;
      this.root.appendChild(aviso);
      return;
    }

    const doneOf = (o: ObjectiveState): boolean =>
      temGrupos && !ctx.professor ? (meu(o)?.completo ?? false) : o.completo;
    const done = list.filter(doneOf).length;

    const head = document.createElement("div");
    head.className = "obj-head";
    head.textContent =
      `objetivos: ${done}/${list.length} concluídos` +
      (temGrupos && ctx.grupo !== null ? ` · seu grupo: ${ctx.grupo}` : "") +
      (modo === "livre" ? " · qualquer ordem" : "");
    this.root.appendChild(head);

    if (done === list.length) {
      const fim = document.createElement("div");
      fim.className = "obj";
      fim.textContent = "🏆 cenário completo!";
      this.root.appendChild(fim);
      return;
    }

    for (const o of list) {
      if (ctx.professor && temGrupos && o.porGrupo) {
        // resumo do professor: uma linha por objetivo com todos os grupos
        if (!o.porGrupo.some((g) => g.ativo || g.completo)) continue;
        const row = document.createElement("div");
        row.className = "obj";
        const title = document.createElement("div");
        title.textContent = `▸ ${o.texto}`;
        row.appendChild(title);
        const prog = document.createElement("small");
        prog.textContent = o.porGrupo
          .map((g) => {
            if (g.completo) return `g${g.grupo} ✓`;
            if (o.kind === "construir") return `g${g.grupo} ${g.atual}/${g.total}`;
            if (o.kind === "limpar") return `g${g.grupo} faltam ${g.atual}`;
            return `g${g.grupo} …`;
          })
          .join(" · ");
        row.appendChild(prog);
        this.root.appendChild(row);
        continue;
      }

      // visão de UM escopo: o grupo do aluno, ou o mundo (sem grupos)
      const g = meu(o);
      const ativo = g ? g.ativo : o.ativo;
      const completo = g ? g.completo : o.completo;
      if (!ativo || completo) continue;
      const atual = g ? g.atual : o.atual;
      const total = g ? g.total : o.total;
      const extras = g ? g.extras : o.extras;

      const row = document.createElement("div");
      row.className = "obj";
      const title = document.createElement("div");
      title.textContent = `▸ ${o.texto}`;
      row.appendChild(title);
      const prog = document.createElement("small");
      if (o.kind === "construir") {
        prog.textContent =
          `blocos corretos: ${atual}/${total}` + (extras > 0 ? ` · ${extras} sobrando` : "");
      } else if (o.kind === "limpar") {
        prog.textContent = `faltam ${atual} bloco(s)`;
      } else {
        prog.textContent =
          "chegue até a área marcada em verde" + (temGrupos ? " (do seu grupo)" : "");
      }
      row.appendChild(prog);
      this.root.appendChild(row);
    }
  }
}
