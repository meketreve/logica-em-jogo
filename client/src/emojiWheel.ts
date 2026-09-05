import type { TipoEmote } from "@logica/shared";
import { playUi } from "./audio";

/**
 * Menu radial de emojis (2026-09-03, tecla V) — regra `emogis` do professor
 * (padrão DESLIGADA). Mesma moldura de "um menu por vez" que mochila/amigos:
 * abre solto o mouse, Esc fecha, clicar num emoji FECHA e dispara o gesto.
 *
 * Não sabe NADA de câmera/animação — só devolve qual emoji foi escolhido
 * (`onEscolher`). Quem decide o que fazer com isso é o `main.ts`.
 */
const EMOJIS: { tipo: TipoEmote; icone: string; rotulo: string }[] = [
  { tipo: "aceno", icone: "👋", rotulo: "aceno" },
  { tipo: "comemorar", icone: "🙌", rotulo: "comemorar" },
  { tipo: "danca", icone: "💃", rotulo: "dança" },
];

export class EmojiWheelPanel {
  private readonly root = document.getElementById("emojis");
  private isOpen = false;

  private readonly onEsc = (e: KeyboardEvent): void => {
    if (e.code !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    this.hide();
  };

  constructor(
    private readonly onEscolher: (tipo: TipoEmote) => void,
    private readonly onToggle: (open: boolean) => void,
  ) {
    this.render();
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

  /** Monta o círculo UMA vez (não muda depois — nenhum dado dinâmico aqui). */
  private render(): void {
    if (!this.root) return;
    this.root.textContent = "";
    const roda = document.createElement("div");
    roda.className = "roda";
    const n = EMOJIS.length;
    const raio = 78; // px do centro até o meio de cada botão
    EMOJIS.forEach(({ tipo, icone, rotulo }, i) => {
      // primeiro emoji no TOPO, o resto em volta no sentido horário
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const x = Math.cos(ang) * raio;
      const y = Math.sin(ang) * raio;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.style.transform = `translate(${x}px, ${y}px)`;
      btn.textContent = icone;
      btn.setAttribute("aria-label", rotulo);
      const label = document.createElement("span");
      label.className = "rotulo";
      label.textContent = rotulo;
      btn.appendChild(label);
      btn.addEventListener("click", () => {
        playUi("click");
        this.hide();
        this.onEscolher(tipo);
      });
      roda.appendChild(btn);
    });
    this.root.appendChild(roda);
  }
}
