import * as THREE from "three";
import {
  CHUNK_SIZE,
  type ChunkGeometry,
  type World,
  chunkIndex,
  extrairVizinhanca,
  meshChunk,
} from "@logica/shared";
import { MeshPool } from "./meshPool";

/** Teto duro de chunks por frame: rede de segurança se o relógio for grosseiro
 *  (ou se um lote inteiro custar quase nada e o `while` virar loop longo). */
const TETO_CHUNKS_POR_FRAME = 64;

/** Geometria sem face nenhuma (chunk que virou 100% ar): `aplicar` só derruba
 *  a mesh antiga e sai. Compartilhada — nada a montar, nada a mutar. */
const VAZIA: ChunkGeometry = {
  positions: new Float32Array(0),
  normals: new Float32Array(0),
  uvs: new Float32Array(0),
  indices: new Uint32Array(0),
  opaqueIndexCount: 0,
  aguaIndexCount: 0,
};

/** Job de mesh no ar (main thread → worker → main thread). */
interface JobMesh {
  key: number;
  cx: number;
  cy: number;
  cz: number;
  /** Versão do chunk quando o job saiu. Resultado com versão vencida é
   *  DESCARTADO — o chunk mudou (edição, troca de aula, descarte de coluna)
   *  entre o envio e a volta, e aplicar geometria velha deixaria buraco. */
  versao: number;
  /** Custo de `extrairVizinhanca` — main thread, entra no contador junto com
   *  o custo de montar a `BufferGeometry` na volta. */
  msExtracao: number;
}

/**
 * 1 mesh por chunk (BufferGeometry única, culled mesher do /shared).
 * Guarda métricas de remesh pro HUD F3. remesh(cx,cy,cz) já serve pro
 * checkpoint 3 (block_changed → remesh do chunk afetado).
 */
export class ChunkRenderer {
  private meshes = new Map<number, THREE.Mesh>();
  /** Fila de remesh (streaming F2): chunks entram quando a coluna chega e
   *  saem N por frame (processarFila) — o custo de mesh não estoura o frame. */
  private fila: { cx: number; cy: number; cz: number }[] = [];
  private filaSet = new Set<number>();
  remeshCount = 0;
  remeshMsTotal = 0;
  lastRemeshMs = 0;
  /**
   * Mesmo custo, separado por QUEM pediu (2026-07-26): `fila` = coluna nova do
   * streaming, `bloco` = block_changed (jogador/regra/água célula a célula),
   * `area` = blocks_filled (encher em lote). Um contador só não deixava saber
   * de onde vinha o pico — foi por isso que precisei DEDUZIR a origem dos 475 k
   * remesh do perfil de 2026-07-26.
   */
  readonly porCaminho = {
    fila: { n: 0, ms: 0 },
    bloco: { n: 0, ms: 0 },
    area: { n: 0, ms: 0 },
  };
  /** Quem está pedindo o remesh corrente (o `remesh` público é chamado de
   *  vários lugares; a tag acompanha a chamada em vez de virar parâmetro). */
  private caminho: "fila" | "bloco" | "area" = "bloco";

  /**
   * Meshing da FILA (streaming) sai da main thread (2026-07-26). Só a fila:
   * `remeshBlock`/`remeshBox`/`buildAll` seguem síncronos porque são a resposta
   * visual a uma ação do jogador (um frame de atraso se nota) e porque no perfil
   * do lab eles foram 0% do custo — `remeshPorCaminho` acusou 5 267 remesh, TODOS
   * pelo caminho `fila`.
   */
  private pool: MeshPool | null = null;
  /** Versão corrente de cada chunk. Sobe a cada pedido de remesh; resultado do
   *  worker com versão diferente da corrente é lixo e some. */
  private versaoAtual = new Map<number, number>();
  private seq = 0;
  private emVoo = new Map<number, JobMesh>();
  /** Chunks com job no worker AGORA. Sem isto, `enfileirarColuna` (que também
   *  reenfileira as 4 colunas vizinhas) manda um job novo pro mesmo chunk antes
   *  do anterior voltar, e o anterior é jogado fora por versão vencida. No
   *  caminho síncrono a fila lenta fundia essas re-entradas de graça; com o pool
   *  esvaziando rápido elas viraram **2 448 jobs desperdiçados** de 7 904
   *  (perfil do lab, 2026-07-27). */
  private chavesEmVoo = new Set<number>();
  /** Chunk que pediu remesh enquanto tinha job no ar: re-enfileirado UMA vez
   *  quando o resultado (vencido) chega. Coalescer N pedidos em 1 job. */
  private sujosEmVoo = new Set<number>();
  /** §🔁: quem repedir a coluna quando o mesh falha (fixado por frame no
   *  `processarFila`, porque o resultado chega frames depois do pedido). */
  private onFalha?: (cx: number, cz: number) => void;
  /** Tempo de mesh gasto DENTRO dos workers. Não conta no orçamento do frame —
   *  existe pra F3/perfil mostrarem o trabalho total, já que `remeshMsTotal`
   *  agora mede só o que sobrou na main thread. */
  get remeshWorkerMsTotal(): number {
    return this.pool?.msTotal ?? 0;
  }

  /** Config do pool pro perfil (`null` = caminho síncrono, `?semworker` ou
   *  navegador sem Worker). É a etiqueta do experimento — ver `MeshPool.config`. */
  get meshConfig(): { workers: number; profundidadeJogo: number; profundidadeCarga: number } | null {
    return this.pool?.config ?? null;
  }

  /**
   * Tela de carga na frente? Enquanto sim o pool corre solto (não há frame pra
   * proteger); no jogo ele freia. Medido no lab (2026-07-27): sem esse freio, 4
   * workers a plena carga custaram FPS 50 → 36 e p95 28 → 44 ms disputando
   * núcleo com a main thread e com o driver D3D11.
   */
  set modoCarga(ativo: boolean) {
    if (this.pool) this.pool.modoCarga = ativo;
  }

  /** `materials[0]` = opaco (cutout), `materials[1]` = água (transparente/blend),
   *  `materials[2]` = vidro colorido (blend, 2026-07-25). O mesher fatia os
   *  índices em 3 grupos por `opaqueIndexCount` + `aguaIndexCount`.
   *
   *  `usarWorkers=false` força o caminho síncrono (testes, e o fallback quando
   *  o pool colapsa). */
  constructor(
    private world: World,
    private materials: [THREE.Material, THREE.Material, THREE.Material],
    private scene: THREE.Scene,
    usarWorkers = true,
    profundidadeJogo?: number,
  ) {
    if (usarWorkers && typeof Worker !== "undefined") {
      const pool = new MeshPool((idsPerdidos) => {
        // pool morreu: os chunks que estavam nele voltam pra fila e o resto da
        // sessão roda síncrono. A tela de carga espera `filaPendente === 0`,
        // então perder jobs em silêncio a travaria pra sempre.
        this.chavesEmVoo.clear();
        this.sujosEmVoo.clear();
        for (const id of idsPerdidos) {
          const job = this.emVoo.get(id);
          if (job) this.enfileirar(job.cx, job.cy, job.cz);
        }
        this.emVoo.clear();
        this.pool = null;
      }, profundidadeJogo);
      this.pool = pool.disponivel ? pool : null;
    }
  }

  /** Versão nova pro chunk: invalida qualquer job dele que ainda esteja no ar. */
  private novaVersao(key: number): number {
    const v = ++this.seq;
    this.versaoAtual.set(key, v);
    return v;
  }

  /**
   * Troca o mundo inteiro (cp19: o professor mudou a aula sem derrubar a turma).
   * Descarta TODA a geometria antiga — o mundo novo pode ter até outro tamanho,
   * então não dá pra reaproveitar mesh nenhuma.
   */
  /**
   * Troca de aula (cp19). `construir` = mundo DENSO, que chegou inteiro no
   * snapshot. Mundo ENORME (lazy) passa `false`: não há nada montado ainda, as
   * colunas chegam por streaming. Sem esse guarda o `buildAll` varria
   * `dims.x*dims.y*dims.z` slots vazios — 460 800 chamadas de `remesh` num
   * mundo E, ~19 s de trava na cara da turma (visto no perfil de 2026-07-26).
   * O `startGame` sempre teve esse mesmo guarda; aqui faltava.
   */
  trocarMundo(novo: World, construir = true): void {
    for (const mesh of this.meshes.values()) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
    }
    this.meshes.clear();
    // mundo novo pode ter até outro tamanho: TODA versão morre, e com ela todo
    // job no ar (o `key` de um mundo não vale no outro). A fila também.
    this.versaoAtual.clear();
    this.fila.length = 0;
    this.filaSet.clear();
    this.sujosEmVoo.clear(); // `key` do mundo velho não vale no novo
    this.chavesEmVoo.clear();
    this.world = novo;
    if (construir) this.buildAll();
  }

  buildAll(): void {
    this.caminho = "fila"; // mesh de CARREGAMENTO (mundo denso vem inteiro)
    for (let cy = 0; cy < this.world.dims.y; cy++)
      for (let cz = 0; cz < this.world.dims.z; cz++)
        for (let cx = 0; cx < this.world.dims.x; cx++) this.remesh(cx, cy, cz);
  }

  remesh(cx: number, cy: number, cz: number): void {
    const t0 = performance.now();
    const key = chunkIndex(this.world, cx, cy, cz);
    // pedido síncrono também invalida job no ar: sem isto, geometria antiga
    // voltando do worker sobrescreveria o bloco que o jogador acabou de pôr
    this.novaVersao(key);
    const g = meshChunk(this.world, cx, cy, cz);
    this.aplicar(key, cx, cy, cz, g);
    this.contabilizar(performance.now() - t0);
  }

  /** Troca a mesh do chunk pela geometria dada (vinda do mesher síncrono OU do
   *  worker). Sem contadores — quem chama decide o que medir. */
  private aplicar(
    key: number,
    cx: number,
    cy: number,
    cz: number,
    g: ChunkGeometry,
  ): void {
    const old = this.meshes.get(key);
    if (old) {
      this.scene.remove(old);
      old.geometry.dispose();
      this.meshes.delete(key);
    }
    if (g.indices.length === 0) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(g.positions, 3));
    geometry.setAttribute("normal", new THREE.BufferAttribute(g.normals, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(g.uvs, 2));
    geometry.setIndex(new THREE.BufferAttribute(g.indices, 1));
    // 3 grupos: opaco + água + vidro colorido, nessa ordem. Grupo com count 0
    // (chunk sem água / sem vidro) não gera draw call.
    const vidroStart = g.opaqueIndexCount + g.aguaIndexCount;
    geometry.addGroup(0, g.opaqueIndexCount, 0);
    geometry.addGroup(g.opaqueIndexCount, g.aguaIndexCount, 1);
    geometry.addGroup(vidroStart, g.indices.length - vidroStart, 2);
    const mesh = new THREE.Mesh(geometry, this.materials);
    mesh.position.set(cx * CHUNK_SIZE, cy * CHUNK_SIZE, cz * CHUNK_SIZE);
    this.scene.add(mesh);
    this.meshes.set(key, mesh);
  }

  /** Custo de MAIN THREAD de um chunk. No caminho do worker isso é só extrair a
   *  vizinhança + montar a `BufferGeometry`; o mesh em si está em
   *  `remeshWorkerMsTotal`. */
  private contabilizar(ms: number): void {
    this.lastRemeshMs = ms;
    this.remeshMsTotal += ms;
    this.remeshCount++;
    const c = this.porCaminho[this.caminho];
    c.n++;
    c.ms += ms;
  }

  /**
   * Remesh do chunk que contém o bloco (x,y,z) — e dos vizinhos quando o
   * bloco está na borda (a face culled do chunk ao lado depende dele).
   */
  /**
   * Remesh de todos os chunks que tocam a caixa [min..max] (encher em lote,
   * cp23b) — expandida em 1 bloco: a face culled do chunk vizinho depende da
   * borda. Cada chunk remesha UMA vez, não uma vez por bloco.
   */
  remeshBox(min: { x: number; y: number; z: number }, max: { x: number; y: number; z: number }): void {
    this.caminho = "area";
    const c = (v: number, hi: number): number =>
      Math.max(0, Math.min(Math.floor(v / CHUNK_SIZE), hi - 1));
    const cx0 = c(min.x - 1, this.world.dims.x);
    const cx1 = c(max.x + 1, this.world.dims.x);
    const cy0 = c(min.y - 1, this.world.dims.y);
    const cy1 = c(max.y + 1, this.world.dims.y);
    const cz0 = c(min.z - 1, this.world.dims.z);
    const cz1 = c(max.z + 1, this.world.dims.z);
    for (let cy = cy0; cy <= cy1; cy++)
      for (let cz = cz0; cz <= cz1; cz++)
        for (let cx = cx0; cx <= cx1; cx++) this.remesh(cx, cy, cz);
  }

  /** Enfileira os chunks da coluna (cx,cz) recém-chegada + os vizinhos JÁ
   *  carregados (a face culled na borda deles depende da coluna nova). */
  private enfileirar(qx: number, qy: number, qz: number): void {
    const key = chunkIndex(this.world, qx, qy, qz);
    if (this.filaSet.has(key)) return;
    // já está no worker: anota como sujo em vez de abrir job duplicado. O
    // resultado que voltar vai ser descartado por versão e re-enfileira o chunk.
    if (this.chavesEmVoo.has(key)) {
      this.sujosEmVoo.add(key);
      return;
    }
    this.filaSet.add(key);
    this.fila.push({ cx: qx, cy: qy, cz: qz });
  }

  enfileirarColuna(cx: number, cz: number): void {
    const poe = (qx: number, qy: number, qz: number): void => this.enfileirar(qx, qy, qz);
    for (let cy = 0; cy < this.world.dims.y; cy++) poe(cx, cy, cz);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = cx + dx;
      const nz = cz + dz;
      if (nx < 0 || nz < 0 || nx >= this.world.dims.x || nz >= this.world.dims.z) continue;
      // vizinho ausente não tem nada pra re-culled — pula
      if (!this.world.chunks[chunkIndex(this.world, nx, 0, nz)]) continue;
      for (let cy = 0; cy < this.world.dims.y; cy++) poe(nx, cy, nz);
    }
  }

  /**
   * Processa a fila por ORÇAMENTO DE TEMPO (1×/frame no loop de render).
   *
   * Era por CONTAGEM (`meshPorFrame`, 8 chunks). O custo de um chunk varia de
   * 0,1 ms (quase vazio) a ~3 ms (terreno cheio), então a mesma contagem tanto
   * custava 1 ms quanto 24 ms — os perfis de 2026-07-26 mostraram 30-50 frames
   * acima de 50 ms exatamente enquanto o terreno chegava. Com teto de tempo o
   * pior frame fica previsível; a fila só demora mais a esvaziar.
   *
   * Sempre monta PELO MENOS um chunk: orçamento apertado não pode significar
   * fila parada (o mundo nunca terminaria de aparecer).
   *
   * `onFalha` (§🔁): mesh que joga exceção NÃO derruba o frame — a coluna é
   * reportada pro chamador, que a marca como faltando e repede ao servidor.
   */
  processarFila(orcamentoMs: number, onFalha?: (cx: number, cz: number) => void): void {
    this.caminho = "fila";
    this.onFalha = onFalha;
    const fim = performance.now() + orcamentoMs;
    let n = 0;

    if (this.pool) {
      // (1) aplicar o que voltou dos workers. Vem PRIMEIRO: geometria pronta
      // parada é mundo com buraco na tela, e é o único passo aqui que ainda
      // custa caro na main thread (BufferGeometry + upload).
      let r = this.pool.colher();
      while (r && n < TETO_CHUNKS_POR_FRAME) {
        const t0 = performance.now();
        const job = this.emVoo.get(r.id);
        this.emVoo.delete(r.id);
        if (job) {
          this.chavesEmVoo.delete(job.key);
          // sujou enquanto estava no ar (coluna vizinha chegou): UM job novo
          // agora, no lugar dos N que teriam sido abertos em paralelo
          if (this.sujosEmVoo.delete(job.key)) this.enfileirar(job.cx, job.cy, job.cz);
          if (r.erro) {
            console.warn(`[mesh] chunk ${job.cx},${job.cy},${job.cz} falhou no worker: ${r.erro}`);
            this.onFalha?.(job.cx, job.cz);
          } else if (this.versaoAtual.get(job.key) === job.versao) {
            this.aplicar(job.key, job.cx, job.cy, job.cz, {
              positions: r.positions!,
              normals: r.normals!,
              uvs: r.uvs!,
              indices: r.indices!,
              opaqueIndexCount: r.opaqueIndexCount!,
              aguaIndexCount: r.aguaIndexCount!,
            });
          } // versão vencida = chunk mudou desde o envio; geometria vai fora
          this.contabilizar(job.msExtracao + (performance.now() - t0));
        }
        if (++n >= 1 && performance.now() >= fim) break;
        r = this.pool.colher();
      }

      // (2) alimentar os workers. Extrair a vizinhança custa ~30 µs contra os
      // ~3,5 ms do mesh, então enche fundo: com 1 job por worker eles ficariam
      // ociosos entre frames e o pool renderia MENOS que o caminho síncrono.
      while (this.fila.length > 0 && this.pool.temVaga && n < TETO_CHUNKS_POR_FRAME) {
        const c = this.fila.shift()!;
        const key = chunkIndex(this.world, c.cx, c.cy, c.cz);
        this.filaSet.delete(key);
        const t0 = performance.now();
        const versao = this.novaVersao(key);
        let viz: Uint8Array | null;
        try {
          viz = extrairVizinhanca(this.world, c.cx, c.cy, c.cz);
        } catch (e) {
          console.warn(`[mesh] vizinhança ${c.cx},${c.cy},${c.cz} falhou:`, e);
          this.onFalha?.(c.cx, c.cz);
          continue;
        }
        if (!viz) {
          // chunk 100% ar: nada a montar, mas a mesh antiga tem que sair
          this.aplicar(key, c.cx, c.cy, c.cz, VAZIA);
          this.contabilizar(performance.now() - t0);
        } else {
          const id = this.pool.enviar(viz);
          this.emVoo.set(id, { key, cx: c.cx, cy: c.cy, cz: c.cz, versao, msExtracao: performance.now() - t0 });
          this.chavesEmVoo.add(key);
        }
        if (++n >= 1 && performance.now() >= fim) break;
      }
      this.ultimoLote = n;
      return;
    }

    while (this.fila.length > 0 && n < TETO_CHUNKS_POR_FRAME) {
      const c = this.fila.shift()!;
      this.filaSet.delete(chunkIndex(this.world, c.cx, c.cy, c.cz));
      try {
        this.remesh(c.cx, c.cy, c.cz);
      } catch (e) {
        console.warn(`[mesh] chunk ${c.cx},${c.cy},${c.cz} falhou:`, e);
        onFalha?.(c.cx, c.cz);
      }
      // checa DEPOIS de montar: garante progresso mesmo com orçamento mínimo
      if (++n >= 1 && performance.now() >= fim) break;
    }
    this.ultimoLote = n; // F3: quantos chunks couberam no orçamento
  }

  /** Chunks montados no último frame (diagnóstico do orçamento). */
  ultimoLote = 0;

  /** Chunks que ainda NÃO estão na tela: na fila, no worker, ou já meshados e
   *  esperando virar `BufferGeometry`. A tela de carga sai em `=== 0` (main.ts
   *  §🕐) — contar só `fila.length` a faria sair com o mundo cheio de buraco. */
  get filaPendente(): number {
    return this.fila.length + (this.pool?.emVoo ?? 0) + (this.pool?.prontosPendentes ?? 0);
  }

  /** Descarta a geometria da coluna (streaming: saiu do raio de render).
   *  Os BYTES do mundo são descartados pelo chamador (main). */
  descartarColuna(cx: number, cz: number): void {
    for (let cy = 0; cy < this.world.dims.y; cy++) {
      const key = chunkIndex(this.world, cx, cy, cz);
      // some com a versão: job desta coluna que ainda esteja no worker volta
      // "vencido" e é descartado, em vez de recriar a mesh que acabou de sair.
      // E não re-enfileira: a coluna saiu do raio, não interessa mais.
      this.versaoAtual.delete(key);
      this.sujosEmVoo.delete(key);
      const mesh = this.meshes.get(key);
      if (mesh) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        this.meshes.delete(key);
      }
    }
  }

  remeshBlock(x: number, y: number, z: number): void {
    this.caminho = "bloco";
    const cx = (x / CHUNK_SIZE) | 0;
    const cy = (y / CHUNK_SIZE) | 0;
    const cz = (z / CHUNK_SIZE) | 0;
    this.remesh(cx, cy, cz);

    const lx = x - cx * CHUNK_SIZE;
    const ly = y - cy * CHUNK_SIZE;
    const lz = z - cz * CHUNK_SIZE;
    if (lx === 0 && cx > 0) this.remesh(cx - 1, cy, cz);
    if (lx === CHUNK_SIZE - 1 && cx < this.world.dims.x - 1) this.remesh(cx + 1, cy, cz);
    if (ly === 0 && cy > 0) this.remesh(cx, cy - 1, cz);
    if (ly === CHUNK_SIZE - 1 && cy < this.world.dims.y - 1) this.remesh(cx, cy + 1, cz);
    if (lz === 0 && cz > 0) this.remesh(cx, cy, cz - 1);
    if (lz === CHUNK_SIZE - 1 && cz < this.world.dims.z - 1) this.remesh(cx, cy, cz + 1);
  }
}
