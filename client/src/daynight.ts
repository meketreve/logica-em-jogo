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

/** §💡 Extremos de `solInt` na tabela acima — a régua que normaliza a hora em
 *  0..1 pro canal CÉU da luz voxel. Se um keyframe novo sair desta faixa, é aqui
 *  que se ajusta (o `clamp01` já protege de estourar). */
const SOL_MIN = 0.14;
const SOL_MAX = 2.4;
/** Céu de MEIA-NOITE não vai a zero: a superfície continua legível ao luar, e é
 *  a diferença entre ela e a caverna (que fica em 0 sempre) que dá a leitura. */
const PISO_LUAR = 0.22;

/** Distância dos discos (câmera tem far=512; terreno na frente ainda oclui). */
const RAIO_ASTRO = 420;
const RAIO_ESTRELAS = 460;
const N_ESTRELAS = 400;

/** Nuvens (§🌬️, 2026-07-27): UM plano horizontal alto com textura procedural
 *  de alpha, andando na direção do vento.
 *
 *  Por que um plano só e não volumes: o teto desta fase é GPU, não CPU — o
 *  notebook do laboratório já fecha o p95 de GPU em 16,8–19,6 ms contra os
 *  16,7 ms do orçamento de 60 FPS (perfil de 2026-07-27). Cada nuvem volumétrica
 *  seria overdraw transparente em cima disso. O plano custa, no pior caso
 *  (olhando pra cima), uma tela de fill — e o `alphaTest` abaixo corta os
 *  buracos entre as nuvens ANTES do blend, que é a metade barata da conta.
 *  Quem ainda achar caro desliga em Configurações (`settings.nuvens`). */
const NUVEM_ALTURA = 100;
const NUVEM_LADO = 1400;
/** Unidades de mundo por repetição da textura — define o TAMANHO das nuvens. */
const NUVEM_ESCALA = 260;
/** Velocidade das nuvens (blocos/s) com o vento na força máxima. */
const NUVEM_VELOCIDADE = 9;
const NUVEM_TEX_PX = 128;

/** Hash de lattice pro ruído das nuvens — determinístico (mesmo céu todo load) e
 *  com WRAP no período: é isso que faz a textura ser tileável de verdade. */
function latticeHash(ix: number, iy: number, periodo: number): number {
  const x = ((ix % periodo) + periodo) % periodo;
  const y = ((iy % periodo) + periodo) % periodo;
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Value noise bilinear com smoothstep, num lattice de período `freq`. */
function valueNoise(u: number, v: number, freq: number): number {
  const x = u * freq;
  const y = v * freq;
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a = latticeHash(ix, iy, freq);
  const b = latticeHash(ix + 1, iy, freq);
  const c = latticeHash(ix, iy + 1, freq);
  const d = latticeHash(ix + 1, iy + 1, freq);
  return (a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy;
}

/** Textura de nuvem: FBM de 4 oitavas no canal ALPHA (o RGB é branco puro — a
 *  cor vem do material, que segue a luz do sol e escurece de noite). O corte
 *  em `limiar` é o que separa nuvem de céu limpo em vez de dar uma névoa
 *  uniforme sobre o mapa inteiro. */
function criarTexturaNuvens(): THREE.CanvasTexture {
  const n = NUVEM_TEX_PX;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = n;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d indisponível");
  const img = ctx.createImageData(n, n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const u = x / n;
      const v = y / n;
      const fbm =
        valueNoise(u, v, 3) * 0.52 +
        valueNoise(u, v, 6) * 0.26 +
        valueNoise(u, v, 12) * 0.14 +
        valueNoise(u, v, 24) * 0.08;
      // limiar + rampa: abaixo do limiar é céu limpo; a rampa dá a borda fofa
      // (sem ela a nuvem sai com recorte de tesoura). Calibrado no headless de
      // 2026-07-27: com 0,52/0,22 as nuvens sumiam contra o azul — viravam
      // fiapos de cirrus em vez de cúmulos.
      const a = Math.min(1, Math.max(0, (fbm - 0.44) / 0.17));
      const i = (y * n + x) * 4;
      img.data[i] = 255;
      img.data[i + 1] = 255;
      img.data[i + 2] = 255;
      img.data[i + 3] = Math.round(a * 235);
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const r = NUVEM_LADO / NUVEM_ESCALA;
  tex.repeat.set(r, r);
  return tex;
}

const scratchCeu = new THREE.Color();
const scratchSol = new THREE.Color();

const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1);

export class SkyCycle {
  private hora = 12;
  private ciclo = false;
  private nivelCeuAtual = 1;

  /** §💡 Peso do canal CÉU da luz voxel agora (0..1). O loop de render copia
   *  isto pro uniform dos materiais do chunk 1×/frame. */
  get nivelCeu(): number {
    return this.nivelCeuAtual;
  }
  /** Deslocamento acumulado das nuvens (em repetições de textura). */
  private nuvemScrollU = 0;
  private nuvemScrollV = 0;

  private readonly skyGroup = new THREE.Group();
  private readonly sunDisc: THREE.Mesh;
  private readonly sunGlow: THREE.Mesh;
  private readonly moonDisc: THREE.Mesh;
  private readonly stars: THREE.Points;
  private readonly nuvens: THREE.Mesh;
  private readonly sunMat: THREE.MeshBasicMaterial;
  private readonly glowMat: THREE.MeshBasicMaterial;
  private readonly moonMat: THREE.MeshBasicMaterial;
  private readonly starsMat: THREE.PointsMaterial;
  private readonly nuvemMat: THREE.MeshBasicMaterial;
  private readonly nuvemTex: THREE.CanvasTexture;

  constructor(
    private readonly sun: THREE.DirectionalLight,
    private readonly ambient: THREE.AmbientLight,
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.Camera,
    /** Nuvens ligadas? (Configurações — protege a GPU do PC de laboratório.) */
    nuvensLigadas = true,
  ) {
    // sol: QUADRADO quente estilo Minecraft + halo aditivo TAMBÉM quadrado (o
    // plano olha pra câmera no apply(); sem textura, na regra do projeto). Lado
    // 56 ≈ diâmetro do disco antigo (60), pra não encolher o céu.
    // ⚠️ O halo era CircleGeometry(52): redondo em volta de um sol quadrado, a
    // borda de brilho ficava 24 nos eixos e só 12 nas quinas (a quina do sol
    // avança 28·√2 ≈ 39,6). Quadrado 104 = 56 do sol + 24 de anel em VOLTA
    // INTEIRA — mesmo alcance nos eixos de antes, uniforme. Os dois usam o
    // mesmo `lookAt`, então saem com a MESMA orientação e ficam concêntricos.
    this.sunMat = new THREE.MeshBasicMaterial({ color: 0xffdf6b, transparent: true, depthWrite: false });
    this.sunDisc = new THREE.Mesh(new THREE.PlaneGeometry(56, 56), this.sunMat);
    this.glowMat = new THREE.MeshBasicMaterial({
      color: 0xffb050,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.sunGlow = new THREE.Mesh(new THREE.PlaneGeometry(104, 104), this.glowMat);
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

    // nuvens (§🌬️): plano horizontal alto. `alphaTest` baixo descarta os buracos
    // entre as nuvens antes do blend — é o que segura o custo de fill na GPU
    // fraca. `depthWrite:false` pelo mesmo motivo dos astros: passe transparente,
    // depthTest ainda esconde o que fica atrás de montanha.
    this.nuvemTex = criarTexturaNuvens();
    this.nuvemMat = new THREE.MeshBasicMaterial({
      map: this.nuvemTex,
      transparent: true,
      alphaTest: 0.02,
      depthWrite: false,
      side: THREE.DoubleSide, // visível também de cima (voo criativo)
      fog: false,
    });
    this.nuvens = new THREE.Mesh(
      new THREE.PlaneGeometry(NUVEM_LADO, NUVEM_LADO),
      this.nuvemMat,
    );
    this.nuvens.rotation.x = -Math.PI / 2; // deita o plano: local +x → +x, local +y → −z
    this.nuvens.position.y = NUVEM_ALTURA;
    this.nuvens.visible = nuvensLigadas;

    this.skyGroup.add(this.sunDisc, this.sunGlow, this.moonDisc, this.stars, this.nuvens);
    scene.add(this.skyGroup);
  }

  /** Liga/desliga as nuvens em tempo real (Configurações). */
  setNuvens(ligadas: boolean): void {
    this.nuvens.visible = ligadas;
  }

  /** Libera a textura das nuvens (a cena vive o processo todo; existe pro par
   *  com quem cria SkyCycle em teste/headless). */
  dispose(): void {
    this.nuvemTex.dispose();
    this.nuvemMat.dispose();
    this.nuvens.geometry.dispose();
  }

  /** Sincroniza com a hora autoritativa do servidor. */
  sync(hora: number, ciclo: boolean): void {
    if (Number.isFinite(hora)) this.hora = ((hora % 24) + 24) % 24;
    this.ciclo = ciclo;
  }

  /** Um frame: avança o relógio local (se o ciclo roda) e pinta o céu.
   *  `vento` (§🌬️) empurra as nuvens; sem ele, o céu fica parado. */
  update(dt: number, vento?: { x: number; z: number; forca: number }): void {
    if (this.ciclo) this.hora = (this.hora + (dt * 24) / DIA_SEGUNDOS) % 24;
    if (vento && this.nuvens.visible) {
      // as nuvens andam PRO rumo do vento. Sinais: no plano deitado, u cresce com
      // +x e v cresce com −z, e mexer o `offset` move o padrão pro lado CONTRÁRIO
      // — daí o −u/+v (mesma inversão que a água tem no tile do atlas).
      const passo = (dt * NUVEM_VELOCIDADE * vento.forca) / NUVEM_ESCALA;
      this.nuvemScrollU -= vento.x * passo;
      this.nuvemScrollV += vento.z * passo;
    }
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
    // §💡 quanto vale o canal CÉU da luz voxel agora. Sai da MESMA curva que já
    // acende o sol — céu e terreno escurecem juntos, sem uma segunda tabela de
    // horas pra sair de sincronia com esta.
    this.nivelCeuAtual =
      PISO_LUAR + (1 - PISO_LUAR) * clamp01((this.sun.intensity - SOL_MIN) / (SOL_MAX - SOL_MIN));

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

    // nuvens (§🌬️): a cor segue a luz do sol (brancas ao meio-dia, laranjas no
    // pôr do sol, azul-escuras de noite) e a textura fica ANCORADA NO MUNDO —
    // o skyGroup segue a câmera, então o offset desconta a posição dela, senão
    // as nuvens andariam junto com o jogador e nunca haveria paralaxe.
    if (this.nuvens.visible) {
      this.nuvemMat.color.copy(scratchSol).multiplyScalar(0.92);
      this.nuvemMat.opacity = 0.5 + 0.35 * clamp01(dy + 0.35); // some um pouco de noite
      this.nuvemTex.offset.set(
        this.camera.position.x / NUVEM_ESCALA + this.nuvemScrollU,
        -this.camera.position.z / NUVEM_ESCALA + this.nuvemScrollV,
      );
    }
  }
}
