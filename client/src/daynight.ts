import * as THREE from "three";
import { DIA_SEGUNDOS } from "@logica/shared";

/**
 * Ciclo dia/noite (cp21; astros no backlog 2026-07-19) — SÓ visual. A hora é
 * autoritativa do SERVIDOR (msg `time`, 1×/s): o cliente guarda a última hora
 * recebida e, se o ciclo está ativo, avança localmente entre as sincronizações
 * para o céu não andar aos trancos. A cada `time` do servidor, corrige (o
 * drift de 1 s num ciclo de 20 min é imperceptível). Nunca escurece 100%: de
 * noite o aluno ainda constrói.
 *
 * Astros: sol/lua = discos, estrelas = Points, todos num grupo que SEGUE a
 * câmera (nunca chegam perto). Materiais transparentes com depthWrite off →
 * renderizam no passe transparente DEPOIS do terreno e o depthTest esconde o
 * que fica atrás de montanha — oclusão certa de graça.
 */

interface Keyframe {
  hora: number;
  ceu: THREE.Color;
  sol: THREE.Color;
  solInt: number;
  ambInt: number;
}

/** Cores em hex sRGB (THREE.Color já converte pro espaço de trabalho). */
const kf = (hora: number, ceu: number, sol: number, solInt: number, ambInt: number): Keyframe => ({
  hora,
  ceu: new THREE.Color(ceu),
  sol: new THREE.Color(sol),
  solInt,
  ambInt,
});

// Quadros ao longo do dia. A lista fecha o laço: 24h == 0h (mesmo estado
// noturno). Amanhecer/entardecer têm quadros EXTRAS (clarão azul → laranja →
// dia) pra transição encorpada — era um degrau só e ficava artificial.
const KEYFRAMES: readonly Keyframe[] = [
  kf(0, 0x04060f, 0x3a4780, 0.14, 0.3), // meia-noite — azul quase preto, "luar"
  kf(4.5, 0x0a1230, 0x45589a, 0.18, 0.31), // fim da madrugada
  kf(5.5, 0x27356e, 0x7a6a9a, 0.35, 0.34), // primeiro clarão azul
  kf(6.5, 0xe08a4e, 0xffc98a, 1.15, 0.44), // amanhecer alaranjado
  kf(7.5, 0xa8cdec, 0xffeccc, 1.9, 0.5), // manhã clara
  kf(12, 0x87ceeb, 0xffffff, 2.4, 0.55), // meio-dia (céu original do jogo)
  kf(16.5, 0x8fc3e8, 0xfff3da, 2.1, 0.51), // tarde
  kf(17.8, 0xd9995c, 0xffc07a, 1.5, 0.46), // hora dourada
  kf(18.7, 0xd96a44, 0xff8a55, 0.9, 0.4), // pôr do sol
  kf(19.6, 0x1b2450, 0x4a5590, 0.3, 0.33), // crepúsculo azul
  kf(21, 0x0a1026, 0x3a4780, 0.17, 0.3), // noite
  kf(24, 0x04060f, 0x3a4780, 0.14, 0.3), // volta à meia-noite
];

/** Distância dos discos (câmera tem far=512; terreno na frente ainda oclui). */
const RAIO_ASTRO = 420;
const RAIO_ESTRELAS = 460;
const N_ESTRELAS = 400;

const scratchCeu = new THREE.Color();
const scratchSol = new THREE.Color();

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

export class SkyCycle {
  private hora = 12;
  private ciclo = false;

  private readonly skyGroup = new THREE.Group();
  private readonly sunDisc: THREE.Mesh;
  private readonly sunGlow: THREE.Mesh;
  private readonly moonDisc: THREE.Mesh;
  private readonly stars: THREE.Points;
  private readonly sunMat: THREE.MeshBasicMaterial;
  private readonly glowMat: THREE.MeshBasicMaterial;
  private readonly moonMat: THREE.MeshBasicMaterial;
  private readonly starsMat: THREE.PointsMaterial;

  constructor(
    private readonly sun: THREE.DirectionalLight,
    private readonly ambient: THREE.AmbientLight,
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.Camera,
  ) {
    // sol: disco quente + halo aditivo maior (sem textura, na regra do projeto)
    this.sunMat = new THREE.MeshBasicMaterial({ color: 0xffdf6b, transparent: true, depthWrite: false });
    this.sunDisc = new THREE.Mesh(new THREE.CircleGeometry(30, 24), this.sunMat);
    this.glowMat = new THREE.MeshBasicMaterial({
      color: 0xffb050,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.sunGlow = new THREE.Mesh(new THREE.CircleGeometry(52, 24), this.glowMat);
    // lua: disco pálido no ponto OPOSTO do arco do sol
    this.moonMat = new THREE.MeshBasicMaterial({ color: 0xdfe6f2, transparent: true, depthWrite: false });
    this.moonDisc = new THREE.Mesh(new THREE.CircleGeometry(20, 24), this.moonMat);

    // estrelas: pontos fixos numa esfera; determinísticas (LCG com seed fixa —
    // mesmo céu todo load, sem Math.random)
    const pos = new Float32Array(N_ESTRELAS * 3);
    let s = 20260719;
    const rand = (): number => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
    for (let i = 0; i < N_ESTRELAS; i++) {
      // direção uniforme na esfera (z=cos φ uniforme em [-1,1])
      const z = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - z * z);
      pos[i * 3] = Math.cos(a) * r * RAIO_ESTRELAS;
      pos[i * 3 + 1] = z * RAIO_ESTRELAS;
      pos[i * 3 + 2] = Math.sin(a) * r * RAIO_ESTRELAS;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.starsMat = new THREE.PointsMaterial({
      color: 0xf2f4ff,
      size: 2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.stars = new THREE.Points(starGeo, this.starsMat);

    this.skyGroup.add(this.sunDisc, this.sunGlow, this.moonDisc, this.stars);
    scene.add(this.skyGroup);
  }

  /** Sincroniza com a hora autoritativa do servidor. */
  sync(hora: number, ciclo: boolean): void {
    if (Number.isFinite(hora)) this.hora = ((hora % 24) + 24) % 24;
    this.ciclo = ciclo;
  }

  /** Um frame: avança o relógio local (se o ciclo roda) e pinta o céu. */
  update(dt: number): void {
    if (this.ciclo) this.hora = (this.hora + (dt * 24) / DIA_SEGUNDOS) % 24;
    this.apply();
  }

  private apply(): void {
    const h = this.hora;
    // acha o par de keyframes que cerca a hora atual
    let a = KEYFRAMES[0]!;
    let b = KEYFRAMES[KEYFRAMES.length - 1]!;
    for (let i = 0; i < KEYFRAMES.length - 1; i++) {
      if (h >= KEYFRAMES[i]!.hora && h <= KEYFRAMES[i + 1]!.hora) {
        a = KEYFRAMES[i]!;
        b = KEYFRAMES[i + 1]!;
        break;
      }
    }
    const span = b.hora - a.hora || 1;
    let t = clamp01((h - a.hora) / span);
    t = t * t * (3 - 2 * t); // smoothstep: entra e sai macio de cada quadro

    scratchCeu.copy(a.ceu).lerp(b.ceu, t);
    (this.scene.background as THREE.Color).copy(scratchCeu);

    scratchSol.copy(a.sol).lerp(b.sol, t);
    this.sun.color.copy(scratchSol);
    this.sun.intensity = a.solInt + (b.solInt - a.solInt) * t;
    this.ambient.intensity = a.ambInt + (b.ambInt - a.ambInt) * t;

    // arco do sol: 6h nasce no leste, 12h no zênite, 18h se põe no oeste.
    // De noite fica abaixo do horizonte (luz fraca vinda de baixo/lado = "luar").
    const ang = ((h - 6) / 12) * Math.PI;
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    this.sun.position.set(dx * 100, Math.max(dy * 100, -40), 40);

    // astros seguem a câmera (nunca chegam mais perto que o RAIO)
    this.skyGroup.position.copy(this.camera.position);
    const norm = Math.hypot(dx, dy, 0.35);
    const sx = (dx / norm) * RAIO_ASTRO;
    const sy = (dy / norm) * RAIO_ASTRO;
    const sz = (0.35 / norm) * RAIO_ASTRO;
    this.sunDisc.position.set(sx, sy, sz);
    this.sunGlow.position.set(sx, sy, sz);
    this.moonDisc.position.set(-sx, -sy, sz); // ponto oposto do arco
    this.sunDisc.lookAt(this.camera.position);
    this.sunGlow.lookAt(this.camera.position);
    this.moonDisc.lookAt(this.camera.position);

    // fade dos astros perto do horizonte (some suave em vez de pop)
    const solVis = clamp01((dy + 0.14) / 0.28);
    this.sunMat.opacity = solVis;
    this.glowMat.opacity = 0.28 * solVis;
    this.sunDisc.visible = this.sunGlow.visible = solVis > 0;
    const luaVis = clamp01((-dy + 0.14) / 0.28);
    this.moonMat.opacity = 0.92 * luaVis;
    this.moonDisc.visible = luaVis > 0;

    // estrelas: aparecem com o sol bem abaixo do horizonte; giram com a noite
    const noite = clamp01((-dy - 0.08) / 0.3);
    this.starsMat.opacity = noite;
    this.stars.visible = noite > 0;
    this.stars.rotation.z = ang * 0.5;
  }
}
