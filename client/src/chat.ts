import { MAX_CHAT_LENGTH } from "@logica/shared";

/**
 * UI de chat em HTML/CSS por cima do canvas (regra: sem GUI de engine).
 * Enter abre (main.ts solta o pointer lock antes), Enter envia, Esc fecha.
 * Mensagens somem depois de uns segundos, mas reaparecem com o chat aberto.
 * Segurança: sempre textContent — texto de outro jogador nunca vira HTML.
 */
const MESSAGE_VISIBLE_MS = 10_000;
const MAX_MESSAGES = 50;

export class ChatUi {
  private readonly root = document.getElementById("chat");
  private readonly log = document.getElementById("chat-log");
  private readonly field = document.getElementById("chat-input") as HTMLInputElement | null;

  constructor(
    onSend: (text: string) => void,
    /** Avisa o dono (main.ts) pra re-travar o mouse / atualizar o overlay. */
    private readonly onToggle: (open: boolean) => void,
  ) {
    if (!this.field) return;
    this.field.maxLength = MAX_CHAT_LENGTH;
    this.field.addEventListener("keydown", (e) => {
      e.stopPropagation(); // digitar no chat NUNCA vira input do jogo (WASD, hotbar…)
      if (e.code === "Enter") {
        const text = this.field?.value.trim() ?? "";
        if (text) onSend(text);
        this.close();
      } else if (e.code === "Escape") {
        this.close();
      }
    });
  }

  get open(): boolean {
    return this.field !== null && !this.field.classList.contains("hidden");
  }

  openInput(): void {
    if (!this.field) return;
    this.field.value = "";
    this.field.classList.remove("hidden");
    this.root?.classList.add("open"); // histórico inteiro visível enquanto digita
    this.field.focus();
    this.onToggle(true);
  }

  private close(): void {
    if (!this.field) return;
    this.field.value = "";
    this.field.classList.add("hidden");
    this.root?.classList.remove("open");
    this.field.blur();
    this.onToggle(false);
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
