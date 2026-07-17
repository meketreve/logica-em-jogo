import * as THREE from "three";
import { BlockId, type World, getBlock } from "@logica/shared";

/**
 * Halo das tochas (cp23) — SÓ visual (decisão 2026-07-17: tocha decorativa,
 * sem luz voxel). Um Sprite aditivo por tocha (gradiente radial num canvas,
 * zero assets — regra do projeto); as posições vêm do mundo autoritativo
 * (varredura no snapshot + block_changed), nunca de estado próprio.
 */
export class TorchGlow {
  private readonly sprites = new Map<string, THREE.Sprite>();
  private readonly material: THREE.SpriteMaterial;

  constructor(private readonly scene: THREE.Scene) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d indisponível");
    const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
    g.addColorStop(0, "rgba(255,225,140,0.55)");
    g.addColorStop(0.5, "rgba(255,190,80,0.18)");
    g.addColorStop(1, "rgba(255,170,60,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter; // sem mipmap: aditivo e pequeno
    this.material = new THREE.SpriteMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });
  }

  /** Varre o mundo inteiro (snapshot inicial e troca de aula do cp19). */
  setFromWorld(world: World): void {
    this.clear();
    for (let y = 0; y < world.sizeY; y++)
      for (let z = 0; z < world.sizeZ; z++)
        for (let x = 0; x < world.sizeX; x++)
          if (getBlock(world, x, y, z) === BlockId.Tocha) this.add(x, y, z);
  }

  /** Acompanha block_changed (tocha posta/tirada — inclusive pela regra). */
  onBlockChanged(x: number, y: number, z: number, blockId: number): void {
    if (blockId === BlockId.Tocha) this.add(x, y, z);
    else this.remove(x, y, z);
  }

  /** Caixa inteira virou um só bloco (blocks_filled do encher em lote). */
  onRegionFilled(
    min: { x: number; y: number; z: number },
    max: { x: number; y: number; z: number },
    blockId: number,
  ): void {
    if (blockId === BlockId.Tocha) {
      for (let y = min.y; y <= max.y; y++)
        for (let z = min.z; z <= max.z; z++)
          for (let x = min.x; x <= max.x; x++) this.add(x, y, z);
      return;
    }
    // outro bloco qualquer apagou as tochas da caixa: varre os SPRITES (poucos),
    // não a caixa (até 65k células)
    for (const key of [...this.sprites.keys()]) {
      const [x = 0, y = 0, z = 0] = key.split(",").map(Number);
      if (
        x >= min.x && x <= max.x &&
        y >= min.y && y <= max.y &&
        z >= min.z && z <= max.z
      ) {
        this.remove(x, y, z);
      }
    }
  }

  private add(x: number, y: number, z: number): void {
    const key = `${x},${y},${z}`;
    if (this.sprites.has(key)) return;
    const s = new THREE.Sprite(this.material);
    s.scale.set(2.4, 2.4, 1);
    // centro do halo na ponta da chama (a caixa da tocha sobe 10/16)
    s.position.set(x + 0.5, y + 0.55, z + 0.5);
    this.scene.add(s);
    this.sprites.set(key, s);
  }

  private remove(x: number, y: number, z: number): void {
    const key = `${x},${y},${z}`;
    const s = this.sprites.get(key);
    if (!s) return;
    this.scene.remove(s);
    this.sprites.delete(key);
  }

  private clear(): void {
    for (const s of this.sprites.values()) this.scene.remove(s);
    this.sprites.clear();
  }
}
