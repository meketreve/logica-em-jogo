import * as THREE from "three";
import { BlockId, CHUNK_SIZE, type World, chunkIndex } from "@logica/shared";

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

  /**
   * Varre o mundo (snapshot inicial e troca de aula do cp19) por CHUNK, não por
   * bloco. A versão bloco a bloco custava `sizeX*sizeY*sizeZ` chamadas de
   * `getBlock` — 1,9 BILHÃO num mundo E — e travava a aba por ~41 s (medido),
   * tanto no join quanto no `/mundo carregar`. Era o maior long task do jogo:
   * os três perfis de 2026-07-26 marcavam ~38 s de long task independente da
   * duração da sessão, sempre esta varredura.
   * Chunk ausente (mundo lazy nasce com TODOS ausentes) sai em O(1).
   */
  setFromWorld(world: World): void {
    this.clear();
    const { x: nx, y: ny, z: nz } = world.dims;
    for (let cy = 0; cy < ny; cy++)
      for (let cz = 0; cz < nz; cz++)
        for (let cx = 0; cx < nx; cx++) this.varrerChunk(world, cx, cy, cz);
  }

  /** Coluna que acabou de chegar pelo streaming (F2): as tochas dela também
   *  precisam de halo — antes só ganhavam ao serem tocadas (`block_changed`). */
  varrerColuna(world: World, cx: number, cz: number): void {
    for (let cy = 0; cy < world.dims.y; cy++) this.varrerChunk(world, cx, cy, cz);
  }

  /** Coluna saiu do raio: solta os sprites dela (senão vazam enquanto se anda).
   *  Varre os SPRITES (poucos), nunca as células. */
  descartarColuna(cx: number, cz: number): void {
    for (const [key, sprite] of this.sprites) {
      const [x = 0, , z = 0] = key.split(",").map(Number);
      if (Math.floor(x / CHUNK_SIZE) === cx && Math.floor(z / CHUNK_SIZE) === cz) {
        this.scene.remove(sprite);
        this.sprites.delete(key);
      }
    }
  }

  private varrerChunk(world: World, cx: number, cy: number, cz: number): void {
    const chunk = world.chunks[chunkIndex(world, cx, cy, cz)];
    if (!chunk) return; // coluna ainda não chegou (ou já foi descartada)
    // mesma fórmula de índice do resto do projeto — sem inversão de módulo
    for (let ly = 0; ly < CHUNK_SIZE; ly++)
      for (let lz = 0; lz < CHUNK_SIZE; lz++)
        for (let lx = 0; lx < CHUNK_SIZE; lx++)
          if (chunk[(ly * CHUNK_SIZE + lz) * CHUNK_SIZE + lx] === BlockId.Tocha) {
            this.add(cx * CHUNK_SIZE + lx, cy * CHUNK_SIZE + ly, cz * CHUNK_SIZE + lz);
          }
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
