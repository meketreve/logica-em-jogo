import * as THREE from "three";
import { CHUNK_SIZE, type World, chunkIndex, meshChunk } from "@logica/shared";

/**
 * 1 mesh por chunk (BufferGeometry única, culled mesher do /shared).
 * Guarda métricas de remesh pro HUD F3. remesh(cx,cy,cz) já serve pro
 * checkpoint 3 (block_changed → remesh do chunk afetado).
 */
export class ChunkRenderer {
  private meshes = new Map<number, THREE.Mesh>();
  remeshCount = 0;
  remeshMsTotal = 0;
  lastRemeshMs = 0;

  constructor(
    private world: World,
    private material: THREE.Material,
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
      const mesh = new THREE.Mesh(geometry, this.material);
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
