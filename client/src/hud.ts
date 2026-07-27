import type * as THREE from "three";
import { VERSION } from "@logica/shared";

/**
 * HUD de perfilação (F3): FPS, frametime méd+p95, remesh, draw calls e
 * triângulos (renderer.info), memória (JS heap + contadores de vídeo) e rede.
 * Dois botões: "exportar JSON" (baixa) e "enviar pro servidor" (host grava).
 *
 * GRAVAÇÃO (2026-07-21): em vez de um retrato instantâneo, os botões gravam
 * RECORD_MS (10 s) de frames e devolvem um relatório AGREGADO — distribuição de
 * frametime (p50/p95/p99/pior frame), frames lentos (hitch) e faixa de memória.
 * Só o resumo vai no relatório (poucos KB — nunca o array de frames cru).
 *
 * §📊 (2026-07-26) o relatório ganhou o que faltava pra comparar MÁQUINAS, não
 * só sessões: **histograma** de frametime (a forma que o percentil esconde),
 * **marcadores** de evento (o pico passa a ter causa), **tempo de carga por
 * fase** da tela §🕐 (quanto o aluno espera), **tempo de GPU** onde o driver
 * deixa medir (o resto é tudo CPU-side) e o **custo das regras** do servidor
 * (água/areia por tick). Quem dirige a coleta comparável é o `?bench`
 * (`bench.ts`): trajeto fixo, config canônica, `record()` do trajeto inteiro.
 */

const FRAME_WINDOW = 120;
const REFRESH_MS = 250;
const RECORD_MS = 10000;
/** Faixas do histograma de frametime (ms). Percentil diz o VALOR, o histograma
 *  diz a FORMA: distribuição bimodal (dois regimes) e cauda longa (hitch raro)
 *  saem iguais no p95 e são problemas diferentes. */
const FAIXAS_MS = [8, 16, 33, 50, 100];
/** Teto de marcadores no perfil — é resumo, não log de sessão. */
const MAX_MARCADORES = 60;
/** Amostras de GPU guardadas pro F3 (a gravação junta as suas em separado). */
const GPU_WINDOW = 240;

export interface HudRemeshStats {
  count: number;
  /** MAIN THREAD (2026-07-26): desde o mesher em Worker isto é só extrair a
   *  vizinhança + montar a `BufferGeometry`. O mesh em si está em `workerMs`. */
  totalMs: number;
  lastMs: number;
  /** Tempo de mesh dentro dos workers. Não disputa o frame — serve pra ver o
   *  trabalho TOTAL (comparável com o `remeshTotalMs` de antes do Worker). */
  workerMs?: number;
  /** Config do pool de mesh (`null` = caminho síncrono). Vai pro JSON: é a
   *  ETIQUETA do experimento de profundidade. Sem ela, um A/B de `?meshdepth`
   *  sai sem dizer qual perfil é qual (acontecido em 2026-07-27). */
  config?: { workers: number; profundidadeJogo: number; profundidadeCarga: number } | null;
  /** Custo separado por quem pediu (fila do streaming × bloco × área). */
  porCaminho?: { fila: { n: number; ms: number }; bloco: { n: number; ms: number }; area: { n: number; ms: number } };
}

interface Recording {
  frames: number[];
  memSamples: number[];
  /** Tempo de GPU (ms) medido dentro da janela — vazio onde a extensão não existe. */
  gpuSamples: number[];
  endAt: number;
  onDone: (report: object) => void;
  /** Contadores no INÍCIO da gravação (long tasks são acumulados globais). */
  longTasksStart: number;
  longTasksMsStart: number;
  /** Contexto no INÍCIO (posição/distância/colunas) — o fim vira delta. */
  contextoStart: ContextoPerfil | null;
  /** Marcadores já registrados quando a gravação começou (o corte vira "os
   *  eventos DESTA janela"). */
  marcadoresStart: number;
}

/** Um evento com hora — sem isto um pico no perfil não tem causa registrada.
 *  O main.ts marca join, troca de aula, mudança de raio, fim da carga… */
export interface Marcador {
  /** Segundo da sessão (mesma régua do `emS` das piores travadas). */
  emS: number;
  fase: FaseSessao;
  evento: string;
  detalhe?: string;
}

/** Custo das REGRAS no servidor (água/areia), vindo do `debug_stats`. Liga o
 *  custo de `remesh(bloco)` no cliente à causa real do outro lado. */
export interface RegrasServidor {
  celulasPorTick: number;
  celulasMaxTick: number;
  mudancasPorTick: number;
  aguaPorTick: number;
}

/**
 * Contexto do perfil (2026-07-26): sem isto, dois perfis do mesmo mundo não são
 * comparáveis — o usuário perfilou VOANDO e eu li "parado" pela taxa de rede.
 * Posição sozinha não resolve (um retrato não diz se estava se movendo), então
 * o que entra é o ESTADO + os acumulados, pra virar DELTA na janela de gravação.
 */
export interface ContextoPerfil {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  voando: boolean;
  noChao: boolean;
  /** Config que muda o custo — comparar perfis sem ela é chute. */
  raioRender: number;
  meshMsPorFrame: number;
  pixelRatioCap: number;
  fov: number;
  /** §🌬️: vida ambiental custa GPU (fill rate das nuvens, vértices do balanço).
   *  Sem isto no perfil, dois JSON da mesma máquina divergem sem explicação. */
  nuvens: boolean;
  balanco: boolean;
  /** Acumulados desde o boot (viram delta na gravação). */
  distanciaTotal: number;
  colunasRecebidas: number;
  bytesRecebidos: number;
}

/** Fase da sessão. Sem isto, "158 long tasks" não diz se travou CARREGANDO
 *  (o aluno esperando, tolerável) ou JOGANDO (o aluno sentindo). */
export type FaseSessao = "carregando" | "jogando";

interface ContadorFase {
  frames: number;
  tempoMs: number;
  renderMs: number;
  longTasks: number;
  longTasksMs: number;
}

/**
 * Frames por faixa de frametime. Devolve array (a ORDEM importa na leitura) com
 * a contagem e a fração de cada faixa — 60 FPS mora em "≤16", tudo acima de 33
 * é travada visível.
 */
function histograma(frames: number[]): { faixa: string; frames: number; pct: number }[] {
  const contagem = new Array<number>(FAIXAS_MS.length + 1).fill(0);
  for (const f of frames) {
    let i = FAIXAS_MS.findIndex((teto) => f <= teto);
    if (i < 0) i = FAIXAS_MS.length;
    contagem[i]!++;
  }
  const total = frames.length || 1;
  return contagem.map((n, i) => ({
    faixa: i < FAIXAS_MS.length ? `≤${FAIXAS_MS[i]}ms` : `>${FAIXAS_MS[FAIXAS_MS.length - 1]}ms`,
    frames: n,
    pct: +((n / total) * 100).toFixed(1),
  }));
}

const faseZerada = (): ContadorFase => ({
  frames: 0,
  tempoMs: 0,
  renderMs: 0,
  longTasks: 0,
  longTasksMs: 0,
});

export class Hud {
  /** Preenchido pelo netcode (checkpoint 2+): taxas por segundo + tick + jitter. */
  net = { msgsPerSec: 0, bytesPerSec: 0, tickAvgMs: 0, tickMaxMs: 0, jitterMs: 0 };
  /** Fase corrente — o main.ts alterna quando a tela de carregamento abre/fecha. */
  fase: FaseSessao = "carregando";
  /** Onde o jogador está e o que ele estava fazendo — alimentado pelo main.ts. */
  contexto: (() => ContextoPerfil) | null = null;
  /** Streaming (mundo procedural): colunas carregadas + fila de remesh +
   *  (§🔁) colunas faltando no raio e total de re-pedidos. Alimentado pelo
   *  main.ts (1×/s). Sem `faltando`, o playtest não distingue "buraco" de
   *  "ainda chegando". */
  stream = { colunas: 0, fila: 0, faltando: 0, repedidas: 0, ultimoLote: 0 };
  /** Custo das regras no servidor (último `debug_stats`) — alimentado pelo main.ts. */
  regras: RegrasServidor | null = null;
  /** Tempo de carga da tela §🕐 por fase — alimentado pelo main.ts (a tela já
   *  mede tudo; aqui só entra no JSON). Vira "quanto o aluno espera" por PC. */
  carga: (() => object | null) | null = null;

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
  /** Mesmos contadores, separados por FASE — responde "de onde vem a travada". */
  private porFase: Record<FaseSessao, ContadorFase> = {
    carregando: faseZerada(),
    jogando: faseZerada(),
  };
  /** As piores travadas da sessão (duração, fase, segundo em que aconteceram).
   *  Um total de 38 s não diz nada; "450 ms aos 2 s, carregando" diz tudo. */
  private pioresTravadas: { ms: number; fase: FaseSessao; emS: number }[] = [];
  /** Linha do tempo de eventos (join, troca de aula, raio…) — ver `marcar()`. */
  private marcadores: Marcador[] = [];
  /** Tempo de GPU (`EXT_disjoint_timer_query_webgl2`): `undefined` = ainda não
   *  procurei, `null` = não existe neste navegador/driver. Todo o resto do
   *  perfil é CPU-side; sem isto "está lento" não separa GPU de CPU. */
  private gpuExt: { TIME_ELAPSED_EXT: number; GPU_DISJOINT_EXT: number } | null | undefined;
  private gpuQueries: WebGLQuery[] = []; // consultas em voo (aguardando resultado)
  private gpuAtiva: WebGLQuery | null = null;
  private gpuSamples: number[] = []; // janela pro F3 (ms)
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
    exportBtn.addEventListener("click", () => this.record((r) => this.baixar(r)));

    // long tasks (jank do main thread >50ms) — Chrome; ignora onde não existe
    try {
      const obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          this.longTasks++;
          this.longTasksMs += e.duration;
          const f = this.porFase[this.fase];
          f.longTasks++;
          f.longTasksMs += e.duration;
          this.pioresTravadas.push({
            ms: +e.duration.toFixed(1),
            fase: this.fase,
            emS: +((performance.now() - this.sessionStartMs) / 1000).toFixed(1),
          });
          this.pioresTravadas.sort((a, b) => b.ms - a.ms);
          this.pioresTravadas.length = Math.min(this.pioresTravadas.length, 5);
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

  /** Troca a fase (o main.ts avisa quando a tela de carregamento abre/fecha).
   *  Os contadores de cada fase seguem separados a sessão inteira. */
  setFase(f: FaseSessao): void {
    this.fase = f;
  }

  setRemesh(stats: HudRemeshStats): void {
    this.remesh = { ...stats };
  }

  /**
   * Registra um evento na linha do tempo (join, troca de aula, mudança de raio,
   * fim da carga, respawn). Hoje um pico de 400 ms no perfil não tem causa
   * anotada — com marcador, o perfil vira narrativa: "travou aos 12 s, e aos
   * 11,8 s o professor trocou a aula".
   */
  marcar(evento: string, detalhe?: string): void {
    if (this.marcadores.length >= MAX_MARCADORES) return; // resumo, não log
    this.marcadores.push({
      emS: +((performance.now() - this.sessionStartMs) / 1000).toFixed(1),
      fase: this.fase,
      evento,
      ...(detalhe ? { detalhe } : {}),
    });
  }

  /**
   * Abre a consulta de tempo de GPU do frame (chamar ANTES de
   * `renderer.render`). Só uma consulta `TIME_ELAPSED_EXT` pode estar aberta
   * por vez — o resultado chega alguns frames depois e é colhido em `frame()`.
   * Amostra só quando alguém está olhando (F3 aberto) ou gravando: consulta em
   * todo frame custa e não serve pra ninguém com o painel fechado.
   */
  gpuInicio(): void {
    if (!this.recording && !this.visible) return;
    try {
      const gl = this.renderer.getContext();
      if (!(gl instanceof WebGL2RenderingContext)) return;
      if (this.gpuExt === undefined) {
        const ext = gl.getExtension("EXT_disjoint_timer_query_webgl2") as {
          TIME_ELAPSED_EXT: number;
          GPU_DISJOINT_EXT: number;
        } | null;
        this.gpuExt = ext ?? null;
      }
      if (!this.gpuExt || this.gpuAtiva || this.gpuQueries.length >= 4) return;
      const q = gl.createQuery();
      if (!q) return;
      gl.beginQuery(this.gpuExt.TIME_ELAPSED_EXT, q);
      this.gpuAtiva = q;
    } catch {
      this.desligarGpu(); // perfilação nunca pode derrubar o loop de render
    }
  }

  /** Fecha a consulta aberta em `gpuInicio` (chamar DEPOIS de `render`). */
  gpuFim(): void {
    if (!this.gpuAtiva || !this.gpuExt) return;
    try {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      gl.endQuery(this.gpuExt.TIME_ELAPSED_EXT);
      this.gpuQueries.push(this.gpuAtiva);
      this.gpuAtiva = null;
    } catch {
      this.desligarGpu();
    }
  }

  /** Desiste do tempo de GPU pelo resto da sessão (driver reclamou ou o contexto
   *  se foi). Medir é opcional; renderizar não — este caminho só roda em GPU de
   *  verdade (headless com swiftshader nem expõe a extensão). */
  private desligarGpu(): void {
    this.gpuExt = null;
    this.gpuQueries.length = 0;
    this.gpuAtiva = null;
  }

  /** Colhe as consultas que já ficaram prontas (ns → ms). Descarta a leva
   *  inteira se a GPU sinalizou `DISJOINT` (mudou de clock/contexto: o número
   *  vira lixo, e um lixo no p95 estraga a comparação entre máquinas). */
  private gpuColher(): void {
    if (!this.gpuExt || this.gpuQueries.length === 0) return;
    try {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      if (gl.getParameter(this.gpuExt.GPU_DISJOINT_EXT)) {
        for (const q of this.gpuQueries) gl.deleteQuery(q);
        this.gpuQueries.length = 0;
        return;
      }
      const restantes: WebGLQuery[] = [];
      for (const q of this.gpuQueries) {
        if (!gl.getQueryParameter(q, gl.QUERY_RESULT_AVAILABLE)) {
          restantes.push(q);
          continue;
        }
        const ns = gl.getQueryParameter(q, gl.QUERY_RESULT) as number;
        gl.deleteQuery(q);
        const ms = ns / 1e6;
        this.gpuSamples.push(ms);
        if (this.gpuSamples.length > GPU_WINDOW) this.gpuSamples.shift();
        this.recording?.gpuSamples.push(ms);
      }
      this.gpuQueries = restantes;
    } catch {
      this.desligarGpu();
    }
  }

  /** Média/p95 do tempo de GPU na janela (null onde a extensão não existe). */
  private gpuStats(amostras: number[]): { medioMs: number; p95Ms: number; amostras: number } | null {
    if (this.gpuExt === null || amostras.length === 0) return null;
    const sorted = [...amostras].sort((a, b) => a - b);
    const soma = amostras.reduce((a, b) => a + b, 0);
    return {
      medioMs: +(soma / amostras.length).toFixed(2),
      p95Ms: +(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? 0).toFixed(2),
      amostras: amostras.length,
    };
  }

  /**
   * Chamar 1×/frame com o frametime em ms. `renderMs` = quanto desse frame foi
   * `renderer.render()` — separa custo de DESENHO do custo da nossa lógica
   * (mesh, física, streaming), que antes vinham somados num número só.
   */
  frame(dtMs: number, renderMs = 0): void {
    this.frameTimes.push(dtMs);
    if (this.frameTimes.length > FRAME_WINDOW) this.frameTimes.shift();
    const f = this.porFase[this.fase];
    f.frames++;
    f.tempoMs += dtMs;
    f.renderMs += renderMs;

    const now = performance.now();
    this.gpuColher(); // consultas de GPU dos frames anteriores que já ficaram prontas
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
   * Grava `duracaoMs` (padrão RECORD_MS) de frames e chama `onDone` com o
   * relatório agregado. Ignora se já está gravando. Garante o HUD visível pra
   * mostrar a contagem. O modo `?bench` grava o trajeto inteiro (30 s).
   */
  record(onDone: (report: object) => void, duracaoMs = RECORD_MS): void {
    if (this.recording) return;
    this.recording = {
      frames: [],
      memSamples: [],
      gpuSamples: [],
      endAt: performance.now() + duracaoMs,
      onDone,
      longTasksStart: this.longTasks,
      longTasksMsStart: this.longTasksMs,
      contextoStart: this.contexto?.() ?? null,
      marcadoresStart: this.marcadores.length,
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

  /**
   * Troca de aula (cp19): dims/seed do mundo mudam com o jogo rodando. Sem
   * isto o perfil exportado sai com o mundo do JOIN e os contadores do mundo
   * ATUAL — leitura contraditória (perfil de 2026-07-26: meta 8×8×4 com 700
   * colunas em streaming).
   */
  setMeta(meta: Record<string, unknown>): void {
    this.meta = { ...this.meta, ...meta };
  }

  /** Retrato instantâneo — base do relatório (device/memória/vídeo/rede). */
  stats() {
    const { fps, avgMs, p95Ms } = this.frameStats();
    const info = this.renderer.info;
    return {
      versao: VERSION, // versão do jogo que rodou o teste (registro por versão)
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      meta: this.meta,
      // retrato do jogador + config de desempenho no instante do relatório
      ...(this.contexto
        ? (() => {
            const c = this.contexto();
            return {
              jogador: {
                x: +c.x.toFixed(1),
                y: +c.y.toFixed(1),
                z: +c.z.toFixed(1),
                yaw: +c.yaw.toFixed(2),
                pitch: +c.pitch.toFixed(2),
                voando: c.voando,
                noChao: c.noChao,
                chunk: { cx: Math.floor(c.x / 16), cz: Math.floor(c.z / 16) },
              },
              config: {
                raioRender: c.raioRender,
                meshMsPorFrame: c.meshMsPorFrame,
                pixelRatioCap: c.pixelRatioCap,
                fov: c.fov,
                nuvens: c.nuvens,
                balanco: c.balanco,
              },
            };
          })()
        : {}),
      fps: Math.round(fps),
      frametimeAvgMs: +avgMs.toFixed(2),
      frametimeP95Ms: +p95Ms.toFixed(2),
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      lines: info.render.lines,
      remeshCount: this.remesh.count,
      remeshPorCaminho: this.remesh.porCaminho ?? null,
      remeshTotalMs: +this.remesh.totalMs.toFixed(1),
      remeshWorkerMs: +(this.remesh.workerMs ?? 0).toFixed(1),
      mesher: this.remesh.config ?? null,
      remeshLastMs: +this.remesh.lastMs.toFixed(2),
      longTasksTotal: this.longTasks,
      // POR FASE: onde o tempo foi gasto e onde travou (carregando × jogando).
      // `renderPct` = quanto do frame é desenho; o resto é lógica nossa.
      fases: (Object.keys(this.porFase) as FaseSessao[]).map((nome) => {
        const f = this.porFase[nome];
        return {
          fase: nome,
          segundos: +(f.tempoMs / 1000).toFixed(1),
          frames: f.frames,
          fpsMedio: f.tempoMs > 0 ? Math.round(f.frames / (f.tempoMs / 1000)) : 0,
          renderMsMedio: f.frames > 0 ? +(f.renderMs / f.frames).toFixed(2) : 0,
          renderPct: f.tempoMs > 0 ? Math.round((f.renderMs / f.tempoMs) * 100) : 0,
          longTasks: f.longTasks,
          longTasksMs: +f.longTasksMs.toFixed(1),
        };
      }),
      pioresTravadas: this.pioresTravadas,
      // linha do tempo: o que ACONTECEU, pra dar causa aos picos acima
      marcadores: this.marcadores,
      // tempo de carga por fase da tela §🕐 (join e cada troca de aula)
      carga: this.carga?.() ?? null,
      // tempo de GPU quando o driver deixa medir (o resto do perfil é CPU-side)
      gpu: this.gpuStats(this.gpuSamples),
      longTasksMsTotal: +this.longTasksMs.toFixed(1),
      contextLost: this.contextLost,
      sessaoS: Math.round((performance.now() - this.sessionStartMs) / 1000),
      memoriaJsMB: this.memoriaJs(),
      video: { geometrias: info.memory.geometries, texturas: info.memory.textures },
      stream: { ...this.stream },
      // custo das regras do outro lado (água/areia por tick) — ver `regras`
      regrasServidor: this.regras,
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
    const segundos = sum / 1000;
    // o que MUDOU durante os 10 s: é isto que diz "voando" × "parado" e quanto
    // terreno novo entrou (o custo de mesh acompanha essa coluna, não o relógio)
    const ini = rec.contextoStart;
    const fim = this.contexto?.() ?? null;
    const movimento =
      ini && fim
        ? (() => {
            const distancia = fim.distanciaTotal - ini.distanciaTotal;
            const velocidade = segundos > 0 ? distancia / segundos : 0;
            return {
              estado: fim.voando ? "voando" : velocidade > 0.5 ? "andando" : "parado",
              distanciaBlocos: +distancia.toFixed(1),
              velocidadeBlocosS: +velocidade.toFixed(2),
              colunasNovas: fim.colunasRecebidas - ini.colunasRecebidas,
              bytesRecebidos: fim.bytesRecebidos - ini.bytesRecebidos,
            };
          })()
        : null;
    return {
      ...base,
      gravacao: {
        duracaoS: +segundos.toFixed(1),
        frames: n,
        movimento,
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
        // FORMA da distribuição: o p95 sozinho não distingue "sempre 20 ms" de
        // "metade a 10 e metade a 40" (bimodal), nem cauda longa de piso alto
        histogramaMs: histograma(frames),
        // tempo de GPU da janela (null onde a extensão não existe)
        gpu: this.gpuStats(rec.gpuSamples),
        // o que aconteceu DENTRO da janela (o resto da linha do tempo fica em `marcadores`)
        marcadores: this.marcadores.slice(rec.marcadoresStart),
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
      `remesh ${s.remeshCount}× / ${s.remeshTotalMs}ms main / ${s.remeshWorkerMs ?? 0}ms worker / ${s.remeshLastMs}ms último`,
      `stream ${s.stream.colunas} colunas · fila ${s.stream.fila} · faltando ${s.stream.faltando} · repedidas ${s.stream.repedidas}`,
      `malha ${s.stream.ultimoLote} chunks no último frame (orçamento ${s.config?.meshMsPorFrame ?? "?"} ms)`,
      s.remeshPorCaminho
        ? `remesh por caminho: fila ${s.remeshPorCaminho.fila.n}× (${Math.round(s.remeshPorCaminho.fila.ms)}ms) · bloco ${s.remeshPorCaminho.bloco.n}× (${Math.round(s.remeshPorCaminho.bloco.ms)}ms) · área ${s.remeshPorCaminho.area.n}× (${Math.round(s.remeshPorCaminho.area.ms)}ms)`
        : "remesh por caminho: n/d",
      `fase ${this.fase} · ${s.fases.map((f) => `${f.fase} ${f.segundos}s ${f.fpsMedio}fps render ${f.renderPct}% travadas ${f.longTasks}×/${Math.round(f.longTasksMs)}ms`).join(" · ")}`,
      s.gpu
        ? `GPU ${s.gpu.medioMs}ms méd / ${s.gpu.p95Ms}ms p95 (${s.gpu.amostras} amostras)`
        : "GPU: n/d (sem EXT_disjoint_timer_query_webgl2)",
      s.regrasServidor
        ? `regras (servidor) ${s.regrasServidor.celulasPorTick} cél/tick (máx ${s.regrasServidor.celulasMaxTick}) · ${s.regrasServidor.mudancasPorTick} mudanças · água ${s.regrasServidor.aguaPorTick}`
        : "regras (servidor): n/d",
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

  /** Baixa o relatório como JSON. Público porque o `?bench` também exporta —
   *  lá o gatilho é o fim do trajeto, não o botão. */
  baixar(report: object, prefixo = "perf"): void {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `perf-${prefixo === "perf" ? "" : `${prefixo}-`}${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
