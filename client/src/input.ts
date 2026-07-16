/**
 * Teclado + mouse (pointer lock). SÓ coleta input — nenhuma decisão de
 * estado do mundo aqui (regra de arquitetura: cliente só desenha e envia input).
 */
export class Input {
  yaw = 0;
  pitch = 0;
  /** Multiplicador da sensibilidade do mouse (configurações do jogador). */
  sensitivity = 1;
  /** Modo toque (tablet): controles de toque sintetizam teclas/olhar/cliques. */
  touch = false;

  private keys = new Set<string>();
  private keyHandlers = new Map<string, () => void>();
  private mouseHandlers = new Map<number, () => void>();
  private wheelHandler: ((dir: 1 | -1) => void) | null = null;

  private static readonly SENSITIVITY = 0.0025;
  /** Sensibilidade do arrasto de olhar no toque (px de dedo → radianos). */
  private static readonly TOUCH_LOOK = 0.004;
  private static readonly PITCH_LIMIT = Math.PI / 2 - 0.01;
  /** Chrome com pointer lock solta deltas absurdos esporádicos (câmera "teleporta") — descarta. */
  private static readonly MAX_DELTA = 200;

  /** Diagnóstico dos eventos de mouse (mostrado no HUD F3). */
  readonly mouseStats = { maxDelta: 0, dropped: 0, lastDropped: 0 };

  constructor(private canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", (e) => {
      // digitando num campo de texto (chat): tecla é do campo, não do jogo
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const handler = this.keyHandlers.get(e.code);
      if (handler) {
        e.preventDefault();
        handler();
        return;
      }
      this.keys.add(e.code);
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    window.addEventListener("blur", () => this.keys.clear());

    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("mousedown", (e) => {
      if (!this.locked) return; // primeiro clique só trava o mouse
      if (e.button === 1) e.preventDefault(); // botão do meio: sem autoscroll
      this.mouseHandlers.get(e.button)?.();
    });

    canvas.addEventListener(
      "wheel",
      (e) => {
        if (!this.locked) return;
        e.preventDefault();
        this.wheelHandler?.(e.deltaY > 0 ? 1 : -1);
      },
      { passive: false },
    );

    canvas.addEventListener("click", () => this.lock());

    document.addEventListener("mousemove", (e) => {
      if (!this.locked) return;
      const mag = Math.max(Math.abs(e.movementX), Math.abs(e.movementY));
      if (mag > this.mouseStats.maxDelta) this.mouseStats.maxDelta = mag;
      if (mag > Input.MAX_DELTA) {
        this.mouseStats.dropped++;
        this.mouseStats.lastDropped = mag;
        console.warn(`[input] spike de mouse descartado: ${e.movementX},${e.movementY}`);
        return;
      }
      this.yaw -= e.movementX * Input.SENSITIVITY * this.sensitivity;
      this.pitch -= e.movementY * Input.SENSITIVITY * this.sensitivity;
      const lim = Input.PITCH_LIMIT;
      if (this.pitch > lim) this.pitch = lim;
      if (this.pitch < -lim) this.pitch = -lim;
    });
  }

  get locked(): boolean {
    return document.pointerLockElement === this.canvas;
  }

  /** Jogo "tem o controle": mouse travado (desktop) OU modo toque (tablet). */
  get active(): boolean {
    return this.locked || this.touch;
  }

  /** Pede pointer lock (clique no canvas ou ao fechar o chat). Pode falhar sem gesto do usuário — aí o overlay "clique para jogar" cobre. */
  lock(): void {
    if (this.touch || this.locked) return; // no toque não existe pointer lock
    // unadjustedMovement: movimento cru, sem aceleração do SO (menos spikes no Chrome/Windows)
    const req = this.canvas.requestPointerLock({ unadjustedMovement: true }) as
      | Promise<void>
      | undefined;
    req?.catch(() => this.canvas.requestPointerLock());
  }

  down(code: string): boolean {
    return this.keys.has(code);
  }

  /** Toque: joystick liga/desliga a MESMA tecla que o teclado ligaria. */
  setKey(code: string, down: boolean): void {
    if (down) this.keys.add(code);
    else this.keys.delete(code);
  }

  /** Toque: arrasto de olhar — mesma conta (e mesmo clamp) do mousemove. */
  applyLook(dx: number, dy: number): void {
    this.yaw -= dx * Input.TOUCH_LOOK * this.sensitivity;
    this.pitch -= dy * Input.TOUCH_LOOK * this.sensitivity;
    const lim = Input.PITCH_LIMIT;
    if (this.pitch > lim) this.pitch = lim;
    if (this.pitch < -lim) this.pitch = -lim;
  }

  /** Toque: botão da tela dispara o MESMO handler do botão do mouse. */
  press(button: number): void {
    this.mouseHandlers.get(button)?.();
  }

  /** Registra atalho (ex.: F3 → HUD). preventDefault automático. */
  onKey(code: string, fn: () => void): void {
    this.keyHandlers.set(code, fn);
  }

  /** Move um atalho pra tecla nova (rebind AO VIVO no menu de pausa). */
  rebind(oldCode: string, newCode: string): void {
    if (oldCode === newCode) return;
    const fn = this.keyHandlers.get(oldCode);
    if (!fn) return;
    this.keyHandlers.delete(oldCode);
    this.keyHandlers.set(newCode, fn);
  }

  /** Botão do mouse com pointer lock ativo (0 = esquerdo, 2 = direito). */
  onMouseButton(button: number, fn: () => void): void {
    this.mouseHandlers.set(button, fn);
  }

  /** Roda do mouse com pointer lock ativo (1 = baixo/próximo, -1 = cima/anterior). */
  onWheel(fn: (dir: 1 | -1) => void): void {
    this.wheelHandler = fn;
  }
}
