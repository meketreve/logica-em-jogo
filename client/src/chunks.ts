import * as THREE from "three";
import { CHUNK_SIZE, type World, chunkIndex, meshChunk } from "@logica/shared";

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

  /** `materials[0]` = opaco (cutout), `materials[1]` = água (transparente/blend),
   *  `materials[2]` = vidro colorido (blend, 2026-07-25). O mesher fatia os
   *  índices em 3 grupos por `opaqueIndexCount` + `aguaIndexCount`. */
  constructor(
    private world: World,
    private materials: [THREE.Material, THREE.Material, THREE.Material],
    private scene: THREE.Scene,
  ) {}

  /**
   * Troca o mundo inteiro (cp19: o professor mudou a aula sem derrubar a turma).
   * Descarta TODA a geometria antiga — o mundo novo pode ter até outro tamanho,
   * então não dá pra reaproveitar mesh nenhuma.
   */
  trocarMundo(novo: World): void {
    for (const mesh of this.meshes.values()) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
    }
    this.meshes.clear();
    this.world = novo;
    this.buildAll();
  }

  buildAll(): void {
    for (let cy = 0; cy < this.world.dims.y; cy++)
      for (let cz = 0; cz < this.world.dims.z; cz++)
        for (let cx = 0; cx < this.world.dims.x; cx++) this.remesh(cx, cy, cz);
  }

  remesh(cx: number, cy: number, cz: number): void {
    const t0 = performance.now();
    const key = chunkIndex(this.world, cx, cy, cz);

    const old = this.meshes.get(key);
    if (old) {
      this.scene.remove(old);
      old.geometry.dispose();
      this.meshes.delete(key);
    }

    const g = meshChunk(this.world, cx, cy, cz);
    if (g.indices.length > 0) {
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

    this.lastRemeshMs = performance.now() - t0;
    this.remeshMsTotal += this.lastRemeshMs;
    this.remeshCount++;
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
  enfileirarColuna(cx: number, cz: number): void {
    const poe = (qx: number, qy: number, qz: number): void => {
      const key = chunkIndex(this.world, qx, qy, qz);
      if (this.filaSet.has(key)) return;
      this.filaSet.add(key);
      this.fila.push({ cx: qx, cy: qy, cz: qz });
    };
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
   * Processa até `budget` chunks da fila (1×/frame no loop de render).
   * `onFalha` (§🔁): mesh que joga exceção NÃO derruba o frame — a coluna é
   * reportada pro chamador, que a marca como faltando e repede ao servidor.
   */
  processarFila(budget: number, onFalha?: (cx: number, cz: number) => void): void {
    for (let i = 0; i < budget && this.fila.length > 0; i++) {
      const c = this.fila.shift()!;
      this.filaSet.delete(chunkIndex(this.world, c.cx, c.cy, c.cz));
      try {
        this.remesh(c.cx, c.cy, c.cz);
      } catch (e) {
        console.warn(`[mesh] chunk ${c.cx},${c.cy},${c.cz} falhou:`, e);
        onFalha?.(c.cx, c.cz);
      }
    }
  }

  get filaPendente(): number {
    return this.fila.length;
  }

  /** Descarta a geometria da coluna (streaming: saiu do raio de render).
   *  Os BYTES do mundo são descartados pelo chamador (main). */
  descartarColuna(cx: number, cz: number): void {
    for (let cy = 0; cy < this.world.dims.y; cy++) {
      const key = chunkIndex(this.world, cx, cy, cz);
      const mesh = this.meshes.get(key);
      if (mesh) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        this.meshes.delete(key);
      }
    }
  }

  remeshBlock(x: number, y: number, z: number): void {
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
