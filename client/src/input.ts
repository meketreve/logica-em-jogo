/**
 * Teclado + mouse (pointer lock). SÓ coleta input — nenhuma decisão de
 * estado do mundo aqui (regra de arquitetura: cliente só desenha e envia input).
 */
export class Input {
  yaw = 0;
  pitch = 0;

  private keys = new Set<string>();
  private keyHandlers = new Map<string, () => void>();

  private static readonly SENSITIVITY = 0.0025;
  private static readonly PITCH_LIMIT = Math.PI / 2 - 0.01;
  /** Chrome com pointer lock solta deltas absurdos esporádicos (câmera "teleporta") — descarta. */
  private static readonly MAX_DELTA = 200;

  /** Diagnóstico dos eventos de mouse (mostrado no HUD F3). */
  readonly mouseStats = { maxDelta: 0, dropped: 0, lastDropped: 0 };

  constructor(private canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", (e) => {
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

    canvas.addEventListener("click", () => {
      if (this.locked) return;
      // unadjustedMovement: movimento cru, sem aceleração do SO (menos spikes no Chrome/Windows)
      const req = canvas.requestPointerLock({ unadjustedMovement: true }) as
        | Promise<void>
        | undefined;
      req?.catch(() => canvas.requestPointerLock());
    });

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
      this.yaw -= e.movementX * Input.SENSITIVITY;
      this.pitch -= e.movementY * Input.SENSITIVITY;
      const lim = Input.PITCH_LIMIT;
      if (this.pitch > lim) this.pitch = lim;
      if (this.pitch < -lim) this.pitch = -lim;
    });
  }

  get locked(): boolean {
    return document.pointerLockElement === this.canvas;
  }

  down(code: string): boolean {
    return this.keys.has(code);
  }

  /** Registra atalho (ex.: F3 → HUD). preventDefault automático. */
  onKey(code: string, fn: () => void): void {
    this.keyHandlers.set(code, fn);
  }
}
