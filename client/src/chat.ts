import { MAX_CHAT_LENGTH } from "@logica/shared";
import { candidatos } from "./commands";

/**
 * UI de chat em HTML/CSS por cima do canvas (regra: sem GUI de engine).
 * Enter abre (main.ts solta o pointer lock antes), Enter envia, Esc fecha.
 * Tab autocompleta comandos ("/…"): completa a palavra, e com várias opções
 * cicla entre elas a cada Tab (a lista aparece como dica acima do campo).
 * Mensagens somem depois de uns segundos, mas reaparecem com o chat aberto.
 * Segurança: sempre textContent — texto de outro jogador nunca vira HTML.
 */
const MESSAGE_VISIBLE_MS = 10_000;
const MAX_MESSAGES = 50;

export class ChatUi {
  private readonly root = document.getElementById("chat");
  private readonly log = document.getElementById("chat-log");
  private readonly field = document.getElementById("chat-input") as HTMLInputElement | null;
  private readonly hint = document.getElementById("chat-hint");

  /** Estado do ciclo de Tab: sobrevive entre Tabs, morre em qualquer outra tecla. */
  private cycle: { produced: string; matches: string[]; index: number; base: string } | null =
    null;

  constructor(
    onSend: (text: string) => void,
    /** Avisa o dono (main.ts) pra re-travar o mouse / atualizar o overlay. */
    private readonly onToggle: (open: boolean) => void,
  ) {
    if (!this.field) return;
    this.field.maxLength = MAX_CHAT_LENGTH;
    this.field.addEventListener("keydown", (e) => {
      e.stopPropagation(); // digitar no chat NUNCA vira input do jogo (WASD, hotbar…)
      if (e.code === "Tab") {
        e.preventDefault(); // Tab completa, não pula o foco pra fora do campo
        this.autocomplete();
        return;
      }
      if (e.code === "Enter") {
        const text = this.field?.value.trim() ?? "";
        if (text) onSend(text);
        this.close();
      } else if (e.code === "Escape") {
        this.close();
      } else {
        this.resetCycle(); // digitou outra coisa: o próximo Tab recomeça do zero
      }
    });
  }

  get open(): boolean {
    return this.field !== null && !this.field.classList.contains("hidden");
  }

  openInput(): void {
    if (!this.field) return;
    this.field.value = "";
    this.resetCycle();
    this.field.classList.remove("hidden");
    this.root?.classList.add("open"); // histórico inteiro visível enquanto digita
    this.field.focus();
    this.onToggle(true);
  }

  private close(): void {
    if (!this.field) return;
    this.field.value = "";
    this.resetCycle();
    this.field.classList.add("hidden");
    this.root?.classList.remove("open");
    this.field.blur();
    this.onToggle(false);
  }

  /** Tab: completa a palavra atual de um comando; com várias opções, cicla. */
  private autocomplete(): void {
    const field = this.field;
    if (!field) return;
    const value = field.value;
    if (!value.startsWith("/")) return; // autocompletar é só pra comandos

    // Continuação de um ciclo: o campo é exatamente o que produzimos e há
    // mais de uma opção → avança pra próxima sem re-filtrar.
    if (this.cycle && value === this.cycle.produced && this.cycle.matches.length > 1) {
      const c = this.cycle;
      c.index = (c.index + 1) % c.matches.length;
      c.produced = c.base + c.matches[c.index];
      field.value = c.produced;
      this.showHint(c.matches, c.index);
      return;
    }

    // Ciclo novo: quebra o que já está digitado em palavras completas + o prefixo.
    const endsWithSpace = /\s$/.test(value);
    const trimmed = value.replace(/\s+$/, "");
    const parts = trimmed.length ? trimmed.split(/\s+/) : [];
    const completos = endsWithSpace ? parts : parts.slice(0, -1);
    const prefixo = endsWithSpace ? "" : (parts[parts.length - 1] ?? "");
    const opcoes = candidatos(completos);
    const matches = opcoes.filter((o) => o.toLowerCase().startsWith(prefixo.toLowerCase()));
    if (matches.length === 0) {
      this.resetCycle();
      return;
    }
    const base = completos.length ? `${completos.join(" ")} ` : "";
    if (matches.length === 1) {
      field.value = `${base}${matches[0]} `; // opção única: completa e segue a frase
      this.resetCycle();
    } else {
      field.value = base + matches[0];
      this.cycle = { produced: field.value, matches, index: 0, base };
      this.showHint(matches, 0);
    }
  }

  private showHint(matches: string[], index: number): void {
    if (!this.hint) return;
    this.hint.textContent = "";
    matches.forEach((m, i) => {
      const span = document.createElement("span");
      span.textContent = m;
      if (i === index) span.className = "sel";
      this.hint?.appendChild(span);
    });
    this.hint.classList.remove("hidden");
  }

  private resetCycle(): void {
    this.cycle = null;
    this.hint?.classList.add("hidden");
  }

  addMessage(author: string, text: string): void {
    if (!this.log) return;
    const el = document.createElement("div");
    el.className = "msg";
    el.textContent = `<${author}> ${text}`;
    this.log.appendChild(el);
    while (this.log.childElementCount > MAX_MESSAGES) this.log.firstElementChild?.remove();
    setTimeout(() => el.classList.add("old"), MESSAGE_VISIBLE_MS);
  }
}
