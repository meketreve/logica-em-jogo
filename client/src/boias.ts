import * as THREE from "three";

/**
 * §🎣 As BOIAS na água e a LINHA até a ponta da vara (2026-11-09).
 *
 * Tudo aqui é desenho: onde a boia está, se afundou e quando sai da água quem
 * diz é o servidor (`boia`, `boia_fisgou`, `boia_fim`). O balanço é do
 * cliente, então 25 boias na sala custam zero bytes por quadro.
 *
 * A mordida é MOVIMENTO, não cor (estado que mora só na cor não existe no
 * projetor nem pra quem é daltônico): a boia afunda inteira e treme. O
 * respingo de três gotas reforça, e o som vem do `somMundo`.
 */

interface Boia {
  readonly grupo: THREE.Group;
  readonly linha: THREE.Line;
  x: number;
  y: number;
  z: number;
  afundada: boolean;
  /** relógio próprio (balanço, tremor, respingo) */
  t: number;
  /** segundos desde a mordida (respingo) */
  desdeMordida: number;
  readonly gotas: THREE.Mesh[];
}

/** Pontos da linha (curva com barriga). */
const PONTOS = 10;

export class BoiasView {
  private readonly boias = new Map<number, Boia>();
  private readonly geoTopo = new THREE.BoxGeometry(0.16, 0.1, 0.16);
  private readonly geoBase = new THREE.BoxGeometry(0.16, 0.08, 0.16);
  private readonly geoGota = new THREE.BoxGeometry(0.05, 0.05, 0.05);
  private readonly matTopo = new THREE.MeshLambertMaterial({ color: 0xd03a2c });
  private readonly matBase = new THREE.MeshLambertMaterial({ color: 0xf4f4f4 });
  private readonly matGota = new THREE.MeshBasicMaterial({ color: 0xcfe8ff });
  private readonly matLinha = new THREE.LineBasicMaterial({ color: 0x2a2a2a });

  constructor(
    private readonly scene: THREE.Scene,
    /** De onde a linha sai: a ponta do item na mão de quem pesca (null = não
     *  dá pra saber — corpo fora de vista; a linha some). */
    private readonly pontaDe: (id: number, alvo: THREE.Vector3) => THREE.Vector3 | null,
  ) {}

  lancar(id: number, x: number, y: number, z: number): void {
    let b = this.boias.get(id);
    if (!b) {
      const grupo = new THREE.Group();
      const topo = new THREE.Mesh(this.geoTopo, this.matTopo);
      topo.position.y = 0.05;
      const base = new THREE.Mesh(this.geoBase, this.matBase);
      base.position.y = -0.04;
      grupo.add(topo, base);
      const gotas = [0, 1, 2].map(() => {
        const g = new THREE.Mesh(this.geoGota, this.matGota);
        g.visible = false;
        grupo.add(g);
        return g;
      });
      const geoLinha = new THREE.BufferGeometry();
      geoLinha.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PONTOS * 3), 3));
      const linha = new THREE.Line(geoLinha, this.matLinha);
      linha.frustumCulled = false; // os pontos mudam todo quadro
      this.scene.add(grupo, linha);
      b = { grupo, linha, x, y, z, afundada: false, t: 0, desdeMordida: 99, gotas };
      this.boias.set(id, b);
    }
    b.x = x;
    b.y = y;
    b.z = z;
    b.afundada = false;
  }

  fisgou(id: number): void {
    const b = this.boias.get(id);
    if (!b) return;
    b.afundada = true;
    b.desdeMordida = 0;
  }

  tirar(id: number): void {
    const b = this.boias.get(id);
    if (!b) return;
    this.scene.remove(b.grupo, b.linha);
    b.linha.geometry.dispose();
    this.boias.delete(id);
  }

  limpar(): void {
    for (const id of [...this.boias.keys()]) this.tirar(id);
  }

  /** Sonda: as boias que estão na tela (id → célula e se afundou). */
  estado(): Record<number, { x: number; y: number; z: number; afundada: boolean; linha: boolean }> {
    const out: Record<number, { x: number; y: number; z: number; afundada: boolean; linha: boolean }> = {};
    for (const [id, b] of this.boias) out[id] = { x: b.x, y: b.y, z: b.z, afundada: b.afundada, linha: b.linha.visible };
    return out;
  }

  tem(id: number): boolean {
    return this.boias.has(id);
  }

  afundada(id: number): boolean {
    return this.boias.get(id)?.afundada ?? false;
  }

  private readonly ponta = new THREE.Vector3();

  quadro(dt: number): void {
    for (const [id, b] of this.boias) {
      b.t += dt;
      b.desdeMordida += dt;
      // a superfície da água fica ~0,9 da célula (a água não é cubo cheio)
      const sup = b.y + 0.88;
      const yBoia = b.afundada
        ? sup - 0.16 + Math.sin(b.t * 40) * 0.025 // afundou e treme
        : sup + Math.sin(b.t * 2.2) * 0.025; // balanço calmo
      b.grupo.position.set(b.x + 0.5, yBoia, b.z + 0.5);
      // o respingo: três gotas que sobem e caem no primeiro meio segundo
      const k = b.desdeMordida / 0.5;
      b.gotas.forEach((g, i) => {
        g.visible = k < 1;
        if (!g.visible) return;
        const ang = (i / 3) * Math.PI * 2;
        g.position.set(Math.cos(ang) * 0.18 * k, 0.1 + Math.sin(Math.PI * k) * 0.3, Math.sin(ang) * 0.18 * k);
      });
      // a linha: da ponta da vara até o topo da boia, com barriga no meio
      const p = this.pontaDe(id, this.ponta);
      b.linha.visible = p !== null;
      if (!p) continue;
      const attr = b.linha.geometry.getAttribute("position") as THREE.BufferAttribute;
      const ax = p.x, ay = p.y, az = p.z;
      const bx = b.x + 0.5, by = yBoia + 0.08, bz = b.z + 0.5;
      const comp = Math.hypot(bx - ax, by - ay, bz - az);
      const barriga = b.afundada ? 0.02 : Math.min(0.6, comp * 0.08); // fisgada estica a linha
      for (let i = 0; i < PONTOS; i++) {
        const s = i / (PONTOS - 1);
        attr.setXYZ(i, ax + (bx - ax) * s, ay + (by - ay) * s - barriga * 4 * s * (1 - s), az + (bz - az) * s);
      }
      attr.needsUpdate = true;
    }
  }
}
