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
}
