import type * as THREE from "three";

/**
 * HUD de perfilação (F3): FPS, frametime méd+p95, remesh, draw calls e
 * triângulos (renderer.info), rede (zerado até o checkpoint 2). Botão exporta
 * JSON — dados pros testes no lab e pro relatório final.
 */

const FRAME_WINDOW = 120;
const REFRESH_MS = 250;

export interface HudRemeshStats {
  count: number;
  totalMs: number;
  lastMs: number;
}

export class Hud {
  /** Preenchido pelo netcode a partir do checkpoint 2. */
  net = { msgsPerSec: 0, bytesPerSec: 0, tickMs: 0 };

  /** Linhas extras de diagnóstico (ex.: stats de input) — avaliadas a cada refresh. */
  extra: (() => string) | null = null;

  private frameTimes: number[] = [];
  private remesh: HudRemeshStats = { count: 0, totalMs: 0, lastMs: 0 };
  private lastRefresh = 0;
  private el: HTMLElement;
  private textEl: HTMLElement;

  constructor(
    private renderer: THREE.WebGLRenderer,
    private meta: Record<string, unknown>,
  ) {
    const el = document.getElementById("hud");
    const textEl = document.getElementById("hud-text");
    const exportBtn = document.getElementById("hud-export");
    if (!el || !textEl || !exportBtn) throw new Error("elementos do HUD ausentes no index.html");
    this.el = el;
    this.textEl = textEl;
    exportBtn.addEventListener("click", () => this.exportJson());
  }

  get visible(): boolean {
    return !this.el.classList.contains("hidden");
  }

  toggle(): void {
    this.el.classList.toggle("hidden");
  }

  setRemesh(stats: HudRemeshStats): void {
    this.remesh = { ...stats };
  }

  /** Chamar 1×/frame com o frametime em ms. */
  frame(dtMs: number): void {
    this.frameTimes.push(dtMs);
    if (this.frameTimes.length > FRAME_WINDOW) this.frameTimes.shift();
    const now = performance.now();
    if (this.visible && now - this.lastRefresh >= REFRESH_MS) {
      this.lastRefresh = now;
      this.refresh();
    }
  }

  private frameStats() {
    const times = this.frameTimes;
    if (times.length === 0) return { fps: 0, avgMs: 0, p95Ms: 0 };
    const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = [...times].sort((a, b) => a - b);
    const p95Ms = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? 0;
    return { fps: 1000 / avgMs, avgMs, p95Ms };
  }

  private stats() {
    const { fps, avgMs, p95Ms } = this.frameStats();
    const info = this.renderer.info;
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      meta: this.meta,
      fps: Math.round(fps),
      frametimeAvgMs: +avgMs.toFixed(2),
      frametimeP95Ms: +p95Ms.toFixed(2),
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      remeshCount: this.remesh.count,
      remeshTotalMs: +this.remesh.totalMs.toFixed(1),
      remeshLastMs: +this.remesh.lastMs.toFixed(2),
      net: { ...this.net },
    };
  }

  private refresh(): void {
    const s = this.stats();
    const lines = [
      `FPS ${s.fps}  frame ${s.frametimeAvgMs}ms méd / ${s.frametimeP95Ms}ms p95`,
      `draw calls ${s.drawCalls}  triângulos ${s.triangles}`,
      `remesh ${s.remeshCount}× / ${s.remeshTotalMs}ms total / ${s.remeshLastMs}ms último`,
      `rede ${s.net.msgsPerSec} msg/s  ${s.net.bytesPerSec} B/s  tick ${s.net.tickMs}ms`,
    ];
    if (this.extra) lines.push(this.extra());
    this.textEl.textContent = lines.join("\n");
  }

  private exportJson(): void {
    const blob = new Blob([JSON.stringify(this.stats(), null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `perf-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
