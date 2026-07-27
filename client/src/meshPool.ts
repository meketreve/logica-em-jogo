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
 *   núcleo); aqui o freio é a profundidade. Com 2 por worker num frame de 20 ms
 *   os workers ficam ~30% ocupados e a vazão dá ~400 chunks/s, contra ~100/s do
 *   síncrono (que já mantinha a fila em 0 no lab) — folga sem saturar núcleo.
 *   Com 1 por worker a fila não esvaziava quando o FPS caía (headless a 16 fps
 *   terminou com 91 chunks pendentes): a vazão escala com o FPS, igual ao
 *   orçamento por frame do caminho síncrono.
 */
const PROFUNDIDADE_CARGA = 8;
const PROFUNDIDADE_JOGO = 2;

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
