import type { Input } from "./input";

/**
 * Controles de toque (tablet) — joystick, arrasto de olhar e botões. SÓ
 * sintetiza o input que o teclado+mouse já geram (input.setKey/applyLook/
 * press): zero caminho novo de decisão, o loop do main.ts não muda.
 * DOM e CSS próprios, injetados aqui (self-contained).
 */

/**
 * Tablet/celular = ponteiro PRIMÁRIO grosso (pointer: coarse). Notebook com
 * touchscreen fica FORA de propósito: o mouse é o ponteiro primário e o modo
 * toque desligaria o pointer lock dele. `?touch` força (testar no desktop).
 */
export function isTouchDevice(): boolean {
  if (new URLSearchParams(location.search).has("touch")) return true;
  return window.matchMedia("(pointer: coarse)").matches;
}

/** O que os botões fazem — fiação vem do main.ts (handlers já existentes). */
export interface TouchActions {
  /** Teclas configuradas AGORA (rebind ao vivo muda o retorno). */
  keys(): { forward: string; back: string; left: string; right: string; jump: string };
  quebrar(): void;
  colocar(): void;
  copiar(): void;
  inventario(): void;
  chat(): void;
  menu(): void;
}

/**
 * Tela cheia no celular/tablet (pedido do playtest mobile): precisa de gesto
 * do usuário — chamada no startPlay (tap no "voltar ao jogo") e no botão ⛶.
 * Falha em silêncio (iPhone não tem requestFullscreen). Com a tela cheia
 * concedida, tenta travar paisagem — o jogo é horizontal por natureza.
 */
export function solicitarTelaCheia(): void {
  const el = document.documentElement;
  void el
    .requestFullscreen?.()
    .then(() => {
      const o = screen.orientation as { lock?: (or: string) => Promise<void> };
      return o.lock?.("landscape");
    })
    .catch(() => {});
}

const CSS = `
#touch-ui, #touch-ui * { touch-action: none; user-select: none; -webkit-user-select: none; }
#touch-look { position: fixed; inset: 0; z-index: 4; }
#touch-joy {
  position: fixed; left: 20px; bottom: 88px; width: 128px; height: 128px;
  border-radius: 50%; background: rgba(255,255,255,0.08);
  border: 2px solid rgba(255,255,255,0.3); z-index: 8;
}
#touch-joy-thumb {
  position: absolute; left: 50%; top: 50%; width: 52px; height: 52px;
  margin: -26px 0 0 -26px; border-radius: 50%;
  background: rgba(255,255,255,0.4); pointer-events: none;
}
#touch-acoes {
  position: fixed; right: 16px; bottom: 88px; display: grid;
  grid-template-columns: repeat(2, 64px); gap: 10px; z-index: 8;
}
#touch-topo {
  position: fixed; top: 8px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 8px; z-index: 8;
}
.touch-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; width: 64px; height: 64px; border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.35); background: rgba(0,0,0,0.4);
  color: #fff; font: inherit; font-size: 22px; line-height: 1; cursor: pointer;
}
.touch-btn small { font-size: 10px; opacity: 0.85; }
.touch-btn:active { background: rgba(255,255,255,0.25); }
#touch-topo .touch-btn { width: auto; height: auto; padding: 6px 12px; font-size: 16px; flex-direction: row; gap: 6px; }
#touch-topo .touch-btn small { font-size: 12px; }
`;

export class TouchControls {
  private readonly root: HTMLDivElement;
  /** Teclas que o joystick/pular ligaram — pra soltar TODAS ao esconder. */
  private readonly heldKeys = new Set<string>();
  private joyPointer: number | null = null;
  private lookPointer: number | null = null;
  private lookX = 0;
  private lookY = 0;

  constructor(
    private readonly input: Input,
    private readonly actions: TouchActions,
  ) {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    this.root = document.createElement("div");
    this.root.id = "touch-ui";
    this.root.className = "hidden";

    // zona de olhar: tela inteira POR BAIXO dos demais controles (z-index) —
    // arrastar em qualquer lugar livre gira a câmera
    const look = document.createElement("div");
    look.id = "touch-look";
    look.addEventListener("pointerdown", (e) => {
      if (this.lookPointer !== null) return; // um dedo de olhar por vez
      this.lookPointer = e.pointerId;
      this.lookX = e.clientX;
      this.lookY = e.clientY;
      look.setPointerCapture(e.pointerId);
    });
    look.addEventListener("pointermove", (e) => {
      if (e.pointerId !== this.lookPointer) return;
      this.input.applyLook(e.clientX - this.lookX, e.clientY - this.lookY);
      this.lookX = e.clientX;
      this.lookY = e.clientY;
    });
    const lookEnd = (e: PointerEvent): void => {
      if (e.pointerId === this.lookPointer) this.lookPointer = null;
    };
    look.addEventListener("pointerup", lookEnd);
    look.addEventListener("pointercancel", lookEnd);

    // joystick: 8 direções via as MESMAS teclas de movimento (settings.keys)
    const joy = document.createElement("div");
    joy.id = "touch-joy";
    const thumb = document.createElement("div");
    thumb.id = "touch-joy-thumb";
    joy.appendChild(thumb);
    const moveStick = (e: PointerEvent): void => {
      const r = joy.getBoundingClientRect();
      const radius = r.width / 2;
      let dx = e.clientX - (r.left + radius);
      let dy = e.clientY - (r.top + radius);
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        dx *= radius / dist;
        dy *= radius / dist;
      }
      thumb.style.transform = `translate(${dx}px, ${dy}px)`;
      const k = this.actions.keys();
      const nx = dx / radius;
      const ny = dy / radius;
      // limiar 0.35 por eixo = deadzone no centro + diagonais naturais
      this.syncKey(k.forward, ny < -0.35);
      this.syncKey(k.back, ny > 0.35);
      this.syncKey(k.left, nx < -0.35);
      this.syncKey(k.right, nx > 0.35);
    };
    const dropStick = (e: PointerEvent): void => {
      if (e.pointerId !== this.joyPointer) return;
      this.joyPointer = null;
      thumb.style.transform = "";
      const k = this.actions.keys();
      for (const code of [k.forward, k.back, k.left, k.right]) this.syncKey(code, false);
    };
    joy.addEventListener("pointerdown", (e) => {
      if (this.joyPointer !== null) return;
      this.joyPointer = e.pointerId;
      joy.setPointerCapture(e.pointerId);
      moveStick(e);
    });
    joy.addEventListener("pointermove", (e) => {
      if (e.pointerId === this.joyPointer) moveStick(e);
    });
    joy.addEventListener("pointerup", dropStick);
    joy.addEventListener("pointercancel", dropStick);

    // botões de ação (direita): quebrar/colocar = tap; pular = segurar
    const acoes = document.createElement("div");
    acoes.id = "touch-acoes";
    acoes.append(
      this.tapButton("✋", "copiar", () => this.actions.copiar()),
      this.holdButton("⤒", "pular"),
      this.tapButton("⛏", "quebrar", () => this.actions.quebrar()),
      this.tapButton("▣", "colocar", () => this.actions.colocar()),
    );

    // topo: menu (pausa), inventário, chat e tela cheia
    const topo = document.createElement("div");
    topo.id = "touch-topo";
    topo.append(
      this.tapButton("☰", "menu", () => this.actions.menu()),
      this.tapButton("🧱", "blocos", () => this.actions.inventario()),
      this.tapButton("💬", "chat", () => this.actions.chat()),
      this.tapButton("⛶", "tela cheia", () => solicitarTelaCheia()),
    );

    this.root.append(look, joy, acoes, topo);
    document.body.appendChild(this.root);
  }

  /** Mostra/esconde a UI de toque (main.ts decide junto com o overlay). */
  setShown(shown: boolean): void {
    this.root.classList.toggle("hidden", !shown);
    if (!shown) this.releaseAll();
  }

  /** Solta tudo que estava pressionado (esconder no meio de um toque). */
  private releaseAll(): void {
    for (const code of this.heldKeys) this.input.setKey(code, false);
    this.heldKeys.clear();
    this.joyPointer = null;
    this.lookPointer = null;
  }

  /** setKey com memória — releaseAll sabe o que soltar mesmo após rebind. */
  private syncKey(code: string, down: boolean): void {
    this.input.setKey(code, down);
    if (down) this.heldKeys.add(code);
    else this.heldKeys.delete(code);
  }

  private tapButton(icon: string, label: string, fn: () => void): HTMLButtonElement {
    const btn = this.makeButton(icon, label);
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault(); // sem clique sintetizado depois
      fn();
    });
    return btn;
  }

  private holdButton(icon: string, label: string): HTMLButtonElement {
    const btn = this.makeButton(icon, label);
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      this.syncKey(this.actions.keys().jump, true);
    });
    const solta = (): void => this.syncKey(this.actions.keys().jump, false);
    btn.addEventListener("pointerup", solta);
    btn.addEventListener("pointercancel", solta);
    return btn;
  }

  private makeButton(icon: string, label: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "touch-btn";
    const ico = document.createElement("span");
    ico.textContent = icon;
    const nome = document.createElement("small");
    nome.textContent = label;
    btn.append(ico, nome);
    return btn;
  }
}
