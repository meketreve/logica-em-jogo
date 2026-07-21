import type * as THREE from "three";

/**
 * HUD de perfilação (F3): FPS, frametime méd+p95, remesh, draw calls e
 * triângulos (renderer.info), memória (JS heap + contadores de vídeo) e rede.
 * Dois botões: "exportar JSON" (baixa) e "enviar pro servidor" (host grava).
 *
 * GRAVAÇÃO (2026-07-21): em vez de um retrato instantâneo, os botões gravam
 * RECORD_MS (10 s) de frames e devolvem um relatório AGREGADO — distribuição de
 * frametime (p50/p95/p99/pior frame), frames lentos (hitch) e faixa de memória.
 * Só o resumo vai no relatório (poucos KB — nunca o array de frames cru).
 */

const FRAME_WINDOW = 120;
const REFRESH_MS = 250;
const RECORD_MS = 10000;

export interface HudRemeshStats {
  count: number;
  totalMs: number;
  lastMs: number;
}

interface Recording {
  frames: number[];
  memSamples: number[];
  endAt: number;
  onDone: (report: object) => void;
  /** Contadores no INÍCIO da gravação (long tasks são acumulados globais). */
  longTasksStart: number;
  longTasksMsStart: number;
}

export class Hud {
  /** Preenchido pelo netcode (checkpoint 2+): taxas por segundo + tick + jitter. */
  net = { msgsPerSec: 0, bytesPerSec: 0, tickAvgMs: 0, tickMaxMs: 0, jitterMs: 0 };
  /** Streaming (mundo procedural): colunas carregadas + fila de remesh. Alimentado
   *  pelo main.ts (1×/s). */
  stream = { colunas: 0, fila: 0 };

  /** Linhas extras de diagnóstico (ex.: stats de input) — avaliadas a cada refresh. */
  extra: (() => string) | null = null;

  private frameTimes: number[] = [];
  private remesh: HudRemeshStats = { count: 0, totalMs: 0, lastMs: 0 };
  private lastRefresh = 0;
  private recording: Recording | null = null;
  private gpuCache: string | null | undefined;
  private readonly sessionStartMs = performance.now();
  private longTasks = 0; // nº acumulado de long tasks (>50ms no main thread)
  private longTasksMs = 0; // tempo bloqueado acumulado
  private contextLost = 0; // nº de perdas de contexto WebGL (crash de GPU)
  private batteryMgr: { level: number; charging: boolean } | null = null;
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
    // exportar = gravar 10 s e baixar o relatório agregado
    exportBtn.addEventListener("click", () => this.record((r) => this.download(r)));

    // long tasks (jank do main thread >50ms) — Chrome; ignora onde não existe
    try {
      const obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          this.longTasks++;
          this.longTasksMs += e.duration;
        }
      });
      obs.observe({ entryTypes: ["longtask"] });
    } catch {
      /* PerformanceObserver/longtask indisponível (FF/Safari) */
    }
    // contexto WebGL perdido = crash de GPU (comum em tablet fraco)
    renderer.domElement.addEventListener("webglcontextlost", () => {
      this.contextLost++;
    });
    // bateria (async): guarda o manager e lê nível/carga na hora do relatório —
    // bateria baixa / throttle térmico derruba FPS no tablet. Só Chrome.
    const navB = navigator as Navigator & {
      getBattery?: () => Promise<{ level: number; charging: boolean }>;
    };
    navB
      .getBattery?.()
      .then((b) => {
        this.batteryMgr = b;
      })
      .catch(() => {
        /* sem API de bateria */
      });
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
    // gravação de 10 s: coleta frame + amostra de memória; fecha ao expirar
    if (this.recording) {
      this.recording.frames.push(dtMs);
      const mem = this.memoryUsedMB();
      if (mem !== null) this.recording.memSamples.push(mem);
      if (now >= this.recording.endAt) {
        const rec = this.recording;
        this.recording = null;
        rec.onDone(this.buildRecordingReport(rec));
      }
    }

    if (this.visible && now - this.lastRefresh >= REFRESH_MS) {
      this.lastRefresh = now;
      this.refresh();
    }
  }

  /**
   * Grava RECORD_MS de frames e chama `onDone` com o relatório agregado.
   * Ignora se já está gravando. Garante o HUD visível pra mostrar a contagem.
   */
  record(onDone: (report: object) => void): void {
    if (this.recording) return;
    this.recording = {
      frames: [],
      memSamples: [],
      endAt: performance.now() + RECORD_MS,
      onDone,
      longTasksStart: this.longTasks,
      longTasksMsStart: this.longTasksMs,
    };
    if (!this.visible) this.toggle();
    this.refresh();
  }

  private frameStats() {
    const times = this.frameTimes;
    if (times.length === 0) return { fps: 0, avgMs: 0, p95Ms: 0 };
    const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = [...times].sort((a, b) => a - b);
    const p95Ms = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? 0;
    return { fps: 1000 / avgMs, avgMs, p95Ms };
  }

  /** Memória do JS heap (Chrome/Chromium — n/d em Firefox/Safari). */
  private memoriaJs(): { usadaMB: number; limiteMB: number } | null {
    const m = (performance as unknown as {
      memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number };
    }).memory;
    if (!m) return null;
    return {
      usadaMB: Math.round(m.usedJSHeapSize / 1048576),
      limiteMB: Math.round(m.jsHeapSizeLimit / 1048576),
    };
  }

  private memoryUsedMB(): number | null {
    return this.memoriaJs()?.usadaMB ?? null;
  }

  /** Nome da GPU (WEBGL_debug_renderer_info) — cacheado (a string é fixa). */
  private gpu(): string | null {
    if (this.gpuCache !== undefined) return this.gpuCache;
    try {
      const gl = this.renderer.getContext();
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      this.gpuCache = ext
        ? String(gl.getParameter((ext as { UNMASKED_RENDERER_WEBGL: number }).UNMASKED_RENDERER_WEBGL))
        : null;
    } catch {
      this.gpuCache = null;
    }
    return this.gpuCache;
  }

  /** Retrato do aparelho — vai no relatório (ajuda a comparar dispositivos). */
  private dispositivo() {
    const nav = navigator as Navigator & { hardwareConcurrency?: number; deviceMemory?: number };
    return {
      nucleos: nav.hardwareConcurrency ?? null,
      ramGB: nav.deviceMemory ?? null, // RAM aproximada do aparelho (Chrome)
      dpr: window.devicePixelRatio,
      tela: `${window.screen.width}×${window.screen.height}`,
      gpu: this.gpu(),
      bateria: this.batteryMgr
        ? { nivelPct: Math.round(this.batteryMgr.level * 100), carregando: this.batteryMgr.charging }
        : null,
    };
  }

  /** Qualidade da rede do aparelho (Network Information API — Chrome). */
  private conexao() {
    const c = (navigator as Navigator & {
      connection?: { effectiveType?: string; downlink?: number; rtt?: number };
    }).connection;
    if (!c) return null;
    return { tipo: c.effectiveType ?? null, downlinkMbps: c.downlink ?? null, rttMs: c.rtt ?? null };
  }

  /** Retrato instantâneo — base do relatório (device/memória/vídeo/rede). */
  stats() {
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
      points: info.render.points,
      lines: info.render.lines,
      remeshCount: this.remesh.count,
      remeshTotalMs: +this.remesh.totalMs.toFixed(1),
      remeshLastMs: +this.remesh.lastMs.toFixed(2),
      longTasksTotal: this.longTasks,
      longTasksMsTotal: +this.longTasksMs.toFixed(1),
      contextLost: this.contextLost,
      sessaoS: Math.round((performance.now() - this.sessionStartMs) / 1000),
      memoriaJsMB: this.memoriaJs(),
      video: { geometrias: info.memory.geometries, texturas: info.memory.textures },
      stream: { ...this.stream },
      rede: this.conexao(),
      dispositivo: this.dispositivo(),
      net: { ...this.net },
    };
  }

  /** Agrega os 10 s gravados por cima do retrato instantâneo. */
  private buildRecordingReport(rec: Recording) {
    const { frames, memSamples } = rec;
    const base = this.stats();
    const n = frames.length;
    if (n === 0) return { ...base, gravacao: { duracaoS: 0, frames: 0 } };
    const sorted = [...frames].sort((a, b) => a - b);
    const sum = frames.reduce((a, b) => a + b, 0);
    const pct = (p: number): number => sorted[Math.min(n - 1, Math.floor(n * p))] ?? 0;
    return {
      ...base,
      gravacao: {
        duracaoS: +(sum / 1000).toFixed(1),
        frames: n,
        fpsMedio: Math.round(n / (sum / 1000)),
        frametimeMs: {
          min: +(sorted[0] ?? 0).toFixed(2),
          med: +(sum / n).toFixed(2),
          p50: +pct(0.5).toFixed(2),
          p95: +pct(0.95).toFixed(2),
          p99: +pct(0.99).toFixed(2),
          max: +(sorted[n - 1] ?? 0).toFixed(2), // pior frame = maior hitch
        },
        framesLentos50ms: frames.filter((f) => f > 50).length,
        framesLentos100ms: frames.filter((f) => f > 100).length,
        // long tasks DENTRO da janela dos 10 s (delta dos acumulados)
        longTasks: this.longTasks - rec.longTasksStart,
        longTasksMs: +(this.longTasksMs - rec.longTasksMsStart).toFixed(1),
        memoriaMB: memSamples.length
          ? {
              min: Math.min(...memSamples),
              max: Math.max(...memSamples),
              med: Math.round(memSamples.reduce((a, b) => a + b, 0) / memSamples.length),
            }
          : null,
      },
    };
  }

  private refresh(): void {
    const s = this.stats();
    const mem = s.memoriaJsMB;
    const lines = [
      `FPS ${s.fps}  frame ${s.frametimeAvgMs}ms méd / ${s.frametimeP95Ms}ms p95`,
      `draw calls ${s.drawCalls}  triângulos ${s.triangles}  long tasks ${s.longTasksTotal}×`,
      `remesh ${s.remeshCount}× / ${s.remeshTotalMs}ms total / ${s.remeshLastMs}ms último`,
      `stream ${s.stream.colunas} colunas · fila ${s.stream.fila}`,
      mem ? `RAM (JS) ${mem.usadaMB}/${mem.limiteMB} MB` : "RAM (JS): n/d (só no Chrome)",
      `vídeo ${s.video.geometrias} geometrias · ${s.video.texturas} texturas`,
      `rede ${s.net.msgsPerSec} msg/s  ${s.net.bytesPerSec} B/s  jitter ${s.net.jitterMs}ms  tick ${s.net.tickAvgMs}/${s.net.tickMaxMs}ms`,
    ];
    if (this.extra) lines.push(this.extra());
    if (this.recording) {
      const restante = Math.max(0, Math.ceil((this.recording.endAt - performance.now()) / 1000));
      lines.push(`⏺ GRAVANDO perfil de 10 s… faltam ${restante}s`);
    }
    this.textEl.textContent = lines.join("\n");
  }

  private download(report: object): void {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `perf-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
