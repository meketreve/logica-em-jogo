import { VIZ_VOLUME } from "@logica/shared";

/**
 * Pool de Web Workers pro mesher (2026-07-26).
 *
 * POR QUÊ: no perfil do PC de laboratório (Intel UHD 630, 8 núcleos) a fase
 * `malha` da carga custou 9,7–13,4 s de MAIN THREAD contra 1,9 s no PC de dev,
 * e no steady state o meshing comia 3,7–6,0 ms de cada frame de 20,4 ms. O
 * mesher é função pura (`meshVizinhanca`: cubo de bytes → geometria), então sai
 * daqui inteiro. O MUNDO continua na main thread — física e raycast leem
 * `world` direto, e `SharedArrayBuffer` exigiria COOP/COEP pra economizar uma
 * cópia de 5,8 kB que custa ~30 µs contra os 3,5 ms do mesh.
 *
 * O que atravessa: ida = a vizinhança 18³ por transfer; volta = os 4 typed
 * arrays por transfer. Zero cópia nos dois sentidos.
 */

/** Teto de workers. 4 satura a fila do streaming e ainda deixa núcleo pro
 *  render, pro áudio e pro servidor-em-worker do singleplayer. */
const MAX_WORKERS = 4;

/**
 * Jobs em voo, por MODO. Medido no notebook do lab (2026-07-27, par
 * `?bench` × `?bench&semworker`):
 *
 * - **CARGA**: fundo. Não há frame pra proteger — a tela de carga está na
 *   frente — e a main thread só alimenta 1×/frame (~16 ms) contra ~3 ms de
 *   mesh, então profundidade 1 deixaria o worker ocioso 80% do tempo. Com 8
 *   por worker a carga caiu de 11 535 → 5 147 ms (`malha` 8 481 → 2 208).
 * - **JOGO**: raso. Sem freio, 4 workers a plena carga disputam núcleo com a
 *   main thread e com a thread do driver D3D11 num i5 de 4 núcleos físicos:
 *   FPS 50 → 36, p95 28 → 44 ms, e até a GPU subiu (13,6 → 15,1 ms). O
 *   caminho síncrono tinha freio de graça (`meshMsPorFrame: 6` = 30% de UM
 *   núcleo); aqui o freio é a profundidade.
 *
 * **1 é o valor MEDIDO no lab** (2026-07-27, notebook na tomada, `?meshdepth`
 * 1 × 2 × 4). Ele empata o FPS do caminho síncrono (50) e ainda BATE a cauda
 * dele — p95 26,7 contra 28,1 ms, p99 31,4 contra 34,6, frames >50 ms 1 contra
 * 2 — com a carga em 4,5 s no lugar de 11,5 s. Contra o 4: FPS 50 × 47, p95
 * 26,7 × 31,9, p99 31,4 × 39,3.
 *
 * Fila rasa também faz MENOS trabalho total (13 738 ms de worker contra 16 036
 * do 4): o chunk espera mais na `fila`, então o `filaSet` funde mais
 * re-entradas antes de virar job — a coalescência melhora sozinha.
 *
 * O medo do 1 era a fila não esvaziar quando o FPS cai (a vazão escala com o
 * FPS, igual ao orçamento por frame do síncrono; em headless a 16 fps sobraram
 * 91 chunks). O lote em modo economia de bateria testou isso de graça: 30 Hz
 * cravados, `fila` fechou em 0 nas três profundidades.
 */
const PROFUNDIDADE_CARGA = 8;
const PROFUNDIDADE_JOGO = 1;

export interface ResultadoMesh {
  id: number;
  /** Tempo de mesh DENTRO do worker (não conta na main thread). */
  ms: number;
  positions?: Float32Array;
  normals?: Float32Array;
  uvs?: Float32Array;
  indices?: Uint32Array;
  opaqueIndexCount?: number;
  aguaIndexCount?: number;
  /** §🔁: mesh que jogou exceção. A coluna vira suspeita e é repedida. */
  erro?: string;
}

export class MeshPool {
  private workers: Worker[] = [];
  /** Jobs em voo por worker (índice = índice do worker). */
  private carga: number[] = [];
  private prontos: ResultadoMesh[] = [];
  private proximoId = 1;
  /** Worker que atende cada job em voo — pro `carga` voltar certo. */
  private dono = new Map<number, number>();
  /** Soma do tempo de mesh gasto NOS WORKERS (F3: separa do custo de main). */
  msTotal = 0;

  /**
   * `onColapso` recebe os ids em voo quando um worker morre (falha ao carregar
   * o módulo, OOM). Quem chama re-enfileira esses chunks e volta pro caminho
   * síncrono — a tela de carga não pode ficar esperando uma fila que nunca
   * esvazia (era o gate de `filaPendente === 0` em main.ts).
   */
  /** Profundidade de JOGO em vigor. `?meshdepth=N` sobrescreve — o valor 2 saiu
   *  de raciocínio sobre ocupação de núcleo, não de medida no lab, então existe
   *  um knob pra UMA sessão lá resolver em vez de eu chutar daqui. */
  private profundidadeJogo: number;

  constructor(
    private onColapso?: (idsPerdidos: number[]) => void,
    profundidadeJogo?: number,
  ) {
    this.profundidadeJogo = Math.max(1, profundidadeJogo ?? PROFUNDIDADE_JOGO);
    const nucleos = navigator.hardwareConcurrency ?? 4;
    const n = Math.max(1, Math.min(MAX_WORKERS, nucleos - 1));
    for (let i = 0; i < n; i++) {
      try {
        const w = new Worker(new URL("./meshWorker.ts", import.meta.url), {
          type: "module",
        });
        w.onmessage = (e: MessageEvent<ResultadoMesh>): void => {
          const r = e.data;
          const dono = this.dono.get(r.id);
          if (dono !== undefined) {
            this.carga[dono] = Math.max(0, (this.carga[dono] ?? 0) - 1);
            this.dono.delete(r.id);
          }
          this.msTotal += r.ms;
          this.prontos.push(r);
        };
        w.onerror = (): void => this.colapsar();
        this.workers.push(w);
        this.carga.push(0);
      } catch {
        break; // navegador sem Worker de módulo → cai no caminho síncrono
      }
    }
  }

  get disponivel(): boolean {
    return this.workers.length > 0;
  }

  /** Config efetiva do pool, pro PERFIL. Sem isto o `?meshdepth` não aparece no
   *  JSON e um A/B de profundidade fica sem etiqueta — foi o que aconteceu em
   *  2026-07-27: 6 rodadas no lab que só deu pra atribuir porque o usuário
   *  lembrava a ordem. A variável do experimento tem que sair no resultado. */
  get config(): { workers: number; profundidadeJogo: number; profundidadeCarga: number } {
    return {
      workers: this.workers.length,
      profundidadeJogo: this.profundidadeJogo,
      profundidadeCarga: PROFUNDIDADE_CARGA,
    };
  }

  get emVoo(): number {
    return this.dono.size;
  }

  get prontosPendentes(): number {
    return this.prontos.length;
  }

  /** Tela de carga na frente? Enquanto sim o pool corre solto; no jogo ele
   *  freia (ver PROFUNDIDADE_*). Quem chama é o `ChunkRenderer`. */
  modoCarga = true;

  /** Ainda cabe job? (a fila do renderer só extrai vizinhança se couber). */
  get temVaga(): boolean {
    const porWorker = this.modoCarga ? PROFUNDIDADE_CARGA : this.profundidadeJogo;
    return this.disponivel && this.emVoo < this.workers.length * porWorker;
  }

  /** Manda a vizinhança pro worker MENOS carregado. `viz` é TRANSFERIDA —
   *  quem chama não pode mais usá-la depois desta linha. */
  enviar(viz: Uint8Array): number {
    if (viz.length !== VIZ_VOLUME) throw new Error(`vizinhança ${viz.length} ≠ ${VIZ_VOLUME}`);
    let alvo = 0;
    for (let i = 1; i < this.workers.length; i++) {
      if ((this.carga[i] ?? 0) < (this.carga[alvo] ?? 0)) alvo = i;
    }
    const id = this.proximoId++;
    this.dono.set(id, alvo);
    this.carga[alvo] = (this.carga[alvo] ?? 0) + 1;
    this.workers[alvo]!.postMessage({ id, viz }, [viz.buffer]);
    return id;
  }

  /** Um resultado pronto, ou `undefined`. Quem chama aplica sob orçamento. */
  colher(): ResultadoMesh | undefined {
    return this.prontos.shift();
  }

  private colapsar(): void {
    const perdidos = [...this.dono.keys()];
    for (const w of this.workers) w.terminate();
    this.workers = [];
    this.carga = [];
    this.dono.clear();
    this.prontos = [];
    console.warn(`[mesh] pool de workers caiu — ${perdidos.length} chunks voltam pro caminho síncrono`);
    this.onColapso?.(perdidos);
  }

  encerrar(): void {
    for (const w of this.workers) w.terminate();
    this.workers = [];
    this.carga = [];
    this.dono.clear();
    this.prontos = [];
  }
}
