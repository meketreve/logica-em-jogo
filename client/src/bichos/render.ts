import * as THREE from "three";
import { BICHOS, FLAG_BICHO, TIPOS_BICHO, type TipoBicho, nomeDoBicho, varianteExiste } from "@logica/shared";
import { BIT_VARIANTE, MASCARA, type ModeloMontado, PAPEL, montarModelo } from "./geometria";
import { type DefModelo, modeloDe, paletasDe } from "./modelos";

/**
 * §🐄 Os bichos na tela — UM `InstancedMesh` por TIPO, animação no shader.
 *
 * O orçamento manda (notebook Intel UHD dos alunos, 31 → ~51 fps em 27/10, e
 * o tablet de 1024×600): **no máximo 8 draw calls pra todos os bichos**,
 * quantos forem. Por isso nada de Mesh por bicho nem por parte. Cada vértice
 * sabe de que PARTE é e em torno de que pivô ela gira (`geometria.ts`); cada
 * instância carrega fase da passada, amplitude, flags, variante e os pesos de
 * estado já suavizados (sentar, bola, voo, fora d'água, amor, ferido). O CPU
 * faz O(n) contas escalares por quadro; o resto é GPU.
 *
 * LUZ — igual à dos jogadores: `MeshLambertMaterial` com as MESMAS luzes da
 * cena (sol + ambiente, que o `SkyCycle` escurece de noite). Por cima, se o
 * `main.ts` ligar `luzEm`, a luz VOXEL do lugar onde o bicho está multiplica
 * a cor — o mesmo `vBrilho` que o terreno recebe (`luzShader.ts`): vaca em
 * caverna fica escura como a caverna. `brilhoDaLuzVoxel` abaixo é a conta do
 * terreno em JS, pra quem liga não ter de copiar a curva.
 *
 * UM PROGRAMA PRA OS OITO: os 8 materiais têm o MESMO código de shader (o GLSL
 * de cada bicho entra num `if (uTipo == n)` de uniforme — ramo coerente, custo
 * zero) e a mesma `customProgramCacheKey`, então o three compila UMA vez. Com
 * um programa por tipo, cada bicho novo que entrasse na vista travaria a aula
 * com uma compilação de shader (dezenas de ms no ANGLE do Windows do lab).
 *
 * CULLING — por INSTÂNCIA, no CPU (6 planos, O(n)), compactando os visíveis no
 * começo do buffer; o `InstancedMesh` fica com `frustumCulled = false`. A
 * esfera do three é calculada UMA vez e envelhece com bicho que anda, e
 * recalculá-la por quadro (o `computeBoundingSphere`) custa o mesmo laço e só
 * descarta o lote INTEIRO — que quase nunca sai da vista, porque os bichos
 * estão em volta do jogador. Por instância, a vaca atrás de você não sobe pra
 * GPU, e o tipo sem nenhum visível vira `visible = false` = zero draw call.
 */

/** Capacidade inicial de instâncias por tipo; dobra quando enche. */
const CAPACIDADE_INICIAL = 16;
/** LERP exponencial — o mesmo dos jogadores (`remotePlayers.ts`, ~90% em 190 ms). */
const LERP_POR_SEGUNDO = 12;
/** Pulou mais que isto entre dois pacotes = teleporte/recarga: aparece no lugar. */
const SALTO_TELEPORTE = 6;
/** Filhote: a escala do Minecraft (a cabeça cresce à parte, no shader). */
const ESCALA_FILHOTE = 0.55;
/** Duração do clarão vermelho + pulinho de quem apanhou. */
const DURACAO_FERIDO = 0.45;
/** Fase da passada dá a volta aqui: múltiplo de 2π que mantém o rolar do tatu
 *  (`fase × 0,42`) contínuo — 0,42 × 50 = 21 voltas inteiras. */
const VOLTA_FASE = Math.PI * 2 * 50;

/**
 * A curva do terreno (`luzShader.ts`) em JS: byte de luz `(céu<<4)|bloco` e a
 * hora (`SkyCycle.nivelCeu`) → brilho 0..1. Pra ligar no `luzEm` sem copiar
 * a conta: `luzEm: (x,y,z) => brilhoDaLuzVoxel(luzByte(grade, ⌊x⌋,⌊y⌋,⌊z⌋), sky.nivelCeu)`.
 */
export function brilhoDaLuzVoxel(byte: number, nivelCeu: number, luzMin = 0.05): number {
  const ceu = byte >> 4;
  const bloco = byte & 15;
  const efetivo = Math.max(ceu * nivelCeu, bloco);
  return luzMin + (1 - luzMin) * Math.pow(0.86, 15 - efetivo);
}

// ── o shader único ───────────────────────────────────────────────────────────

const DEFS: readonly DefModelo[] = TIPOS_BICHO.map((t) => modeloDe(t));

/** `#define` gerados das tabelas (PAPEL, MASCARA, FLAG_BICHO): uma fonte só. */
function defines(): string {
  const cobra = (s: string): string => s.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
  const linhas: string[] = ["#define PX 0.0625", `#define BIT_VARIANTE ${BIT_VARIANTE}`];
  for (const [k, v] of Object.entries(PAPEL)) linhas.push(`#define P_${cobra(k)} ${v}`);
  for (const [k, v] of Object.entries(MASCARA)) linhas.push(`#define M_${cobra(k)} ${v}`);
  for (const [k, v] of Object.entries(FLAG_BICHO)) linhas.push(`#define F_${cobra(k)} ${v}`);
  return linhas.join("\n");
}

const VERTEX_PRELUDIO = /* glsl */ `
${defines()}
attribute vec3 aPivo;
attribute vec2 aInfo;  // papel, máscara (estado | variantes << BIT_VARIANTE)
attribute vec3 aPose;  // pernas: pose de sentado (giro X, dy, dz) · coração: qual dos três
attribute vec4 aA;     // fase, amplitude, semente, flags
attribute vec4 aB;     // variante, sentaW, bolaW, voaW
attribute vec4 aC;     // feridoT, amorW, luz, foraW
uniform float uTempo;
uniform int uTipo;
uniform float uLinha;
uniform float uLinhaFilhote;
uniform vec4 uSenta;     // pivô do quadril (xyz) e ângulo de sentar (w)
uniform float uSentaDy;
uniform vec3 uCentro;
uniform vec3 uCoracoes;
uniform float uCabecaFilhote;
varying float vLuzB;
varying float vFerido;
varying float vEmis;
mat3 rotX(float a) { float c = cos(a); float s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotY(float a) { float c = cos(a); float s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotZ(float a) { float c = cos(a); float s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }
mat3 rot3(vec3 a) { return rotY(a.y) * rotX(a.x) * rotZ(a.z); }
float hash1(float n) { return fract(sin(n * 12.9898) * 43758.5453); }
`;

/** O GLSL de cada tipo, no `if` do uniforme. A ordem é a de `TIPOS_BICHO`. */
const GLSL_DOS_TIPOS = DEFS.map((d, i) => `${i === 0 ? "" : "else "}if (uTipo == ${i}) {${d.glsl}\n}`).join("\n");

const VERTEX_POSE = /* glsl */ `
vec3 objectNormal = vec3(normal);
vec3 bichoPos = vec3(0.0);
{
  int papel = int(aInfo.x + 0.5);
  int masc = int(aInfo.y + 0.5);
  int flags = int(aA.w + 0.5);
  int variante = int(aB.x + 0.5);
  float fase = aA.x;
  float amp = aA.y;
  float parado = 1.0 - clamp(amp, 0.0, 1.0);
  float semente = aA.z;
  float t = uTempo + semente * 97.0;
  float sentaW = aB.y;
  float bolaW = aB.z;
  float voaW = aB.w;
  float feridoT = aC.x;
  float amorW = aC.y;
  float foraW = aC.w;
  bool filhote = (flags & F_FILHOTE) != 0;
  bool tosquiada = (flags & F_TOSQUIADA) != 0;
  bool domado = (flags & F_DOMADO) != 0;
  bool movendo = (flags & F_MOVENDO) != 0;
  bool temOvo = (flags & F_OVO) != 0;

  // ── quem aparece: variante e estado (escondido = área zero, nenhum pixel) ──
  float vis = ((masc >> BIT_VARIANTE) & (1 << variante)) != 0 ? 1.0 : 0.0;
  if ((masc & M_SEM_TOSQUIA) != 0 && tosquiada) vis = 0.0;
  if ((masc & M_SO_TOSQUIA) != 0 && !tosquiada) vis = 0.0;
  if ((masc & M_SO_OVO) != 0 && !temOvo) vis = 0.0;
  if ((masc & M_SO_DOMADO) != 0 && !domado) vis = 0.0;
  if ((masc & M_SO_ADULTO) != 0 && filhote) vis = 0.0;
  if ((masc & M_SO_AMOR) != 0 && amorW < 0.01) vis = 0.0;
  // bola e asa aberta não PISCAM: uma silhueta encolhe e a outra cresce
  float encolhe = 1.0;
  vec3 centroEnc = uCentro;
  if ((masc & M_ESCONDE_BOLA) != 0) encolhe *= 1.0 - smoothstep(0.2, 0.5, bolaW);
  if ((masc & M_SO_BOLA) != 0) encolhe *= smoothstep(0.45, 0.85, bolaW);
  if ((masc & M_ESCONDE_VOO) != 0) encolhe *= 1.0 - step(0.5, voaW);
  if ((masc & M_SO_VOO) != 0) { encolhe *= smoothstep(0.5, 1.0, voaW); centroEnc = aPivo; }
  if (encolhe < 0.001) vis = 0.0;

  // ── a animação do tipo ──
  vec3 ang = vec3(0.0);
  vec3 desl = vec3(0.0);
  vec3 corpoDesl = vec3(0.0);
  float esc = 1.0;
  vec3 raizAng = vec3(0.0);
  vec3 raizDesl = vec3(0.0);
  ${GLSL_DOS_TIPOS}
  if (filhote && papel == P_CABECA) esc *= uCabecaFilhote;

  // parte: gira no próprio pivô
  mat3 R = rot3(ang);
  vec3 p = aPivo + R * ((position - aPivo) * esc) + desl;
  vec3 n = R * normal;
  // SENTADO. As de trás deitam pra frente (giro e deslocamento da caixa, em
  // \`aPose\`). As da frente seguem o OMBRO, que subiu com o peito, e ESTICAM
  // até o chão: o ombro novo sai do mesmo giro do corpo, então o pé encosta no
  // chão em qualquer ângulo de sentar — sem conta de cabeça por bicho.
  if (sentaW > 0.001) {
    if (papel == P_PERNA_FE || papel == P_PERNA_FD) {
      mat3 S = rotX(uSenta.w * sentaW);
      vec3 ombro = uSenta.xyz + S * (aPivo - uSenta.xyz) + vec3(0.0, uSentaDy * sentaW, 0.0);
      vec3 r = p - aPivo;
      r.y *= ombro.y / max(aPivo.y, 0.001);
      p = ombro + r;
    } else if (papel == P_PERNA_TE || papel == P_PERNA_TD) {
      mat3 S = rotX(aPose.x * sentaW);
      p = aPivo + S * (p - aPivo) + vec3(0.0, aPose.y, aPose.z) * sentaW;
      n = S * n;
    }
  }
  // o que é preso ao corpo: inclina ao sentar e balança com a passada
  if ((masc & M_PRESO) != 0) {
    mat3 S = rotX(uSenta.w * sentaW);
    p = uSenta.xyz + S * (p - uSenta.xyz) + vec3(0.0, uSentaDy * sentaW, 0.0) + corpoDesl;
    n = S * n;
  }
  p = centroEnc + (p - centroEnc) * encolhe;
  // quem apanhou dá um PULO e tomba de lado (o Minecraft faz igual): o estado
  // aparece na silhueta, não só no vermelho
  float pulo = sin(feridoT * PI);
  raizDesl.y += pulo * 1.6 * PX;
  raizAng.z += pulo * 0.3;
  mat3 Q = rot3(raizAng);
  p = uCentro + Q * (p - uCentro) + raizDesl;
  n = Q * n;

  // corações: sobem da cabeça, crescem e somem, sempre DE FRENTE pra câmera
  if (papel == P_CORACAO) {
    float k = aPose.x;
    float sobe = fract(t * 0.42 + k / 3.0);
    float tam = sin(sobe * PI) * amorW;
    vec3 d = cameraPosition - vec3(instanceMatrix[3]);
    float yawInst = atan(instanceMatrix[2].x, instanceMatrix[2].z);
    mat3 B = rotY(atan(-d.x, -d.z) - yawInst);
    vec3 base = uCoracoes + vec3((k - 1.0) * 2.6 * PX + sin(sobe * 6.0 + k * 2.1) * 1.2 * PX, sobe * 9.0 * PX, 0.0);
    p = base + B * (position * tam);
    n = B * normal;
  }
  bichoPos = p * vis;
  objectNormal = n;
  vLuzB = aC.z;
  vFerido = feridoT;
  vEmis = (masc & M_EMISSIVO) != 0 ? 1.0 : 0.0;
}
`;

const VERTEX_UV = /* glsl */ `
#include <uv_vertex>
{
  // a variante é uma LINHA da textura do tipo (o pintinho é a linha extra)
  int fl = int(aA.w + 0.5);
  float linha = ((fl & F_FILHOTE) != 0 && uLinhaFilhote >= 0.0) ? uLinhaFilhote : aB.x;
  vMapUv.y += linha * uLinha;
}
`;

const FRAG_PRELUDIO = /* glsl */ `
varying float vLuzB;
varying float vFerido;
varying float vEmis;
`;

const FRAG_COR = /* glsl */ `
#include <color_fragment>
vec3 bichoCor = diffuseColor.rgb;
// ferido: clarão vermelho curto (o pulo, no vertex, é a parte que não depende de cor)
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, 0.16, 0.1), vFerido * 0.6);
// luz voxel do lugar (caverna escura, tocha acesa) — 1 sem o \`luzEm\`
diffuseColor.rgb *= vLuzB;
`;

const FRAG_EMISSIVO = /* glsl */ `
#include <emissivemap_fragment>
totalEmissiveRadiance += bichoCor * vEmis * 0.7 + vec3(0.5, 0.03, 0.02) * vFerido * 0.5;
`;

const CHAVE_PROGRAMA = "logica-bichos-v1";

// ── estado ───────────────────────────────────────────────────────────────────

interface Alvo {
  id: number;
  x: number;
  y: number;
  z: number;
  largura: number;
  altura: number;
}

interface Bicho {
  id: number;
  lote: Lote;
  variante: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  tx: number;
  ty: number;
  tz: number;
  tyaw: number;
  flags: number;
  fase: number;
  amp: number;
  vel: number;
  sentaW: number;
  bolaW: number;
  voaW: number;
  foraW: number;
  amorW: number;
  feridoT: number;
  feridoAntes: boolean;
  luz: number;
  semente: number;
  /** variação individual de tamanho (0,95–1): o bando não sai de fôrma */
  tamanho: number;
  alvo: Alvo;
  /** posição em `lote.bichos` e em `BichosView.listaAlvos` (remoção O(1)) */
  iLote: number;
  iAlvo: number;
}

interface Lote {
  readonly indice: number;
  readonly tipo: TipoBicho;
  readonly def: DefModelo;
  readonly modelo: ModeloMontado;
  readonly textura: THREE.CanvasTexture;
  readonly material: THREE.MeshLambertMaterial;
  readonly velocidade: number;
  readonly raio: number;
  geo: THREE.BufferGeometry;
  mesh: THREE.InstancedMesh;
  cap: number;
  aA: THREE.InstancedBufferAttribute;
  aB: THREE.InstancedBufferAttribute;
  aC: THREE.InstancedBufferAttribute;
  readonly bichos: Bicho[];
  visiveis: number;
}

const aproxima = (v: number, alvo: number, passo: number): number =>
  v < alvo ? Math.min(alvo, v + passo) : Math.max(alvo, v - passo);

export class BichosView {
  private readonly bichos = new Map<number, Bicho>();
  private readonly lotes: (Lote | undefined)[] = new Array(TIPOS_BICHO.length);
  private readonly listaAlvos: Alvo[] = [];
  private readonly luzEm?: (x: number, y: number, z: number) => number;
  /** relógio da animação, COMPARTILHADO pelos 8 materiais (um uniforme só) */
  private readonly uTempo = { value: 0 };
  private _visivel = true;
  private ultimoCusto = { cpuMs: 0, drawCalls: 0, triangulos: 0, instancias: 0, tipos: 0 };
  // rascunho do culling — nada de `new` dentro do quadro
  private readonly frustum = new THREE.Frustum();
  private readonly projTela = new THREE.Matrix4();
  private readonly esfera = new THREE.Sphere();

  constructor(
    private readonly scene: THREE.Scene,
    opts?: { luzEm?: (x: number, y: number, z: number) => number },
  ) {
    this.luzEm = opts?.luzEm;
  }

  /** O desenho está ligado? (chave A/B do `?bench&sembichos`) */
  get visivel(): boolean {
    return this._visivel;
  }

  // ── lote por tipo (criado na 1ª aparição: textura e geometria são ms, não s) ──

  private lote(tipo: TipoBicho): Lote {
    const i = TIPOS_BICHO.indexOf(tipo);
    const existente = this.lotes[i];
    if (existente) return existente;
    const def = DEFS[i]!;
    const paletas = paletasDe(tipo, def);
    const modelo = montarModelo(def.caixas, paletas);
    const textura = new THREE.CanvasTexture(modelo.canvas);
    // mesma regra do atlas: pixel art nítido, sem mipmap (que misturaria as
    // faces vizinhas da folha), sRGB
    textura.flipY = false;
    textura.magFilter = THREE.NearestFilter;
    textura.minFilter = THREE.NearestFilter;
    textura.generateMipmaps = false;
    textura.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshLambertMaterial({ map: textura });
    const px = 1 / 16;
    const sentar = def.sentar;
    const uniforms = {
      uTempo: this.uTempo,
      uTipo: { value: i },
      uLinha: { value: modelo.linha },
      uLinhaFilhote: { value: def.paletaFilhote ? BICHOS[tipo].variantes.length : -1 },
      uSenta: {
        value: sentar
          ? new THREE.Vector4(sentar.pivo[0] * px, sentar.pivo[1] * px, sentar.pivo[2] * px, sentar.ang)
          : new THREE.Vector4(0, 0, 0, 0),
      },
      uSentaDy: { value: sentar ? sentar.dy * px : 0 },
      uCentro: { value: new THREE.Vector3(def.centro[0] * px, def.centro[1] * px, def.centro[2] * px) },
      uCoracoes: { value: new THREE.Vector3(def.coracoes[0] * px, def.coracoes[1] * px, def.coracoes[2] * px) },
      uCabecaFilhote: { value: def.cabecaFilhote },
    };
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${VERTEX_PRELUDIO}`)
        .replace("#include <uv_vertex>", VERTEX_UV)
        .replace("#include <beginnormal_vertex>", VERTEX_POSE)
        .replace("#include <begin_vertex>", "vec3 transformed = bichoPos;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\n${FRAG_PRELUDIO}`)
        .replace("#include <color_fragment>", FRAG_COR)
        .replace("#include <emissivemap_fragment>", FRAG_EMISSIVO);
    };
    // o MESMO texto de shader pros 8 tipos → um programa só (ver o topo)
    material.customProgramCacheKey = () => CHAVE_PROGRAMA;

    // raio da esfera de culling: a caixa de descanso inteira (asa aberta
    // inclusa) e os corações lá em cima
    const l = modelo.limites;
    const meio = new THREE.Vector3(0, BICHOS[tipo].altura / 2, 0);
    let raio = 0;
    for (const x of [l.min.x, l.max.x])
      for (const y of [l.min.y, l.max.y])
        for (const z of [l.min.z, l.max.z]) raio = Math.max(raio, meio.distanceTo(new THREE.Vector3(x, y, z)));
    raio = Math.max(raio, def.coracoes[1] * px + 0.7 - meio.y) + 0.15;

    const novo: Lote = {
      indice: i,
      tipo,
      def,
      modelo,
      textura,
      material,
      velocidade: BICHOS[tipo].velocidade,
      raio,
      geo: modelo.geometria,
      mesh: undefined as unknown as THREE.InstancedMesh,
      cap: 0,
      aA: undefined as unknown as THREE.InstancedBufferAttribute,
      aB: undefined as unknown as THREE.InstancedBufferAttribute,
      aC: undefined as unknown as THREE.InstancedBufferAttribute,
      bichos: [],
      visiveis: 0,
    };
    this.alocar(novo, CAPACIDADE_INICIAL);
    this.lotes[i] = novo;
    return novo;
  }

  /**
   * (Re)aloca as instâncias do lote. Crescer = geometria NOVA (os atributos
   * por vértice são os mesmos objetos, compartilhados) + `InstancedMesh` novo;
   * o velho é descartado inteiro. É raro (dobra a cada vez) e evita o buffer
   * órfão que trocar só o atributo deixaria na GPU até o coletor passar.
   */
  private alocar(lote: Lote, cap: number): void {
    const base = lote.modelo.geometria;
    const geo = new THREE.BufferGeometry();
    for (const nome of Object.keys(base.attributes)) geo.setAttribute(nome, base.getAttribute(nome));
    geo.setIndex(base.getIndex());
    const inst = (): THREE.InstancedBufferAttribute => {
      const a = new THREE.InstancedBufferAttribute(new Float32Array(cap * 4), 4);
      a.setUsage(THREE.DynamicDrawUsage);
      return a;
    };
    lote.aA = inst();
    lote.aB = inst();
    lote.aC = inst();
    geo.setAttribute("aA", lote.aA);
    geo.setAttribute("aB", lote.aB);
    geo.setAttribute("aC", lote.aC);
    const mesh = new THREE.InstancedMesh(geo, lote.material, cap);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false; // culling por instância no quadro (ver o topo)
    mesh.count = 0;
    mesh.visible = false;
    if (lote.mesh) {
      this.scene.remove(lote.mesh);
      lote.mesh.dispose();
      if (lote.geo !== base) lote.geo.dispose();
    }
    lote.geo = geo;
    lote.mesh = mesh;
    lote.cap = cap;
    this.scene.add(mesh);
  }

  // ── API ──

  adicionar(b: { id: number; tipo: TipoBicho; variante: number; x: number; y: number; z: number; yaw: number; flags: number }): void {
    const velho = this.bichos.get(b.id);
    if (velho && velho.lote.tipo !== b.tipo) this.remover(b.id);
    const atual = this.bichos.get(b.id);
    const variante = varianteExiste(b.tipo, b.variante) ? b.variante : 0;
    if (atual) {
      atual.variante = variante;
      atual.x = atual.tx = b.x;
      atual.y = atual.ty = b.y;
      atual.z = atual.tz = b.z;
      atual.yaw = atual.tyaw = b.yaw;
      this.aplicarFlags(atual, b.flags, true);
      return;
    }
    const lote = this.lote(b.tipo);
    const def = BICHOS[b.tipo];
    // semente e tamanho por id: o mesmo bicho sempre igual, o bando desencontrado
    const h = Math.imul(b.id ^ 0x9e3779b9, 2654435761) >>> 0;
    const bicho: Bicho = {
      id: b.id,
      lote,
      variante,
      x: b.x,
      y: b.y,
      z: b.z,
      yaw: b.yaw,
      tx: b.x,
      ty: b.y,
      tz: b.z,
      tyaw: b.yaw,
      flags: 0,
      fase: ((h & 1023) / 1024) * Math.PI * 2,
      amp: 0,
      vel: 0,
      sentaW: 0,
      bolaW: 0,
      voaW: 0,
      foraW: 0,
      amorW: 0,
      feridoT: 0,
      feridoAntes: false,
      luz: 1,
      semente: ((h >>> 10) & 1023) / 1024,
      tamanho: 0.95 + (((h >>> 20) & 255) / 255) * 0.05,
      alvo: { id: b.id, x: b.x, y: b.y, z: b.z, largura: def.largura, altura: def.altura },
      iLote: lote.bichos.length,
      iAlvo: this.listaAlvos.length,
    };
    this.aplicarFlags(bicho, b.flags, true);
    lote.bichos.push(bicho);
    this.listaAlvos.push(bicho.alvo);
    this.bichos.set(b.id, bicho);
    if (lote.bichos.length > lote.cap) this.alocar(lote, lote.cap * 2);
  }

  mover(id: number, x: number, y: number, z: number, yaw: number, flags: number): void {
    const b = this.bichos.get(id);
    if (!b) return;
    b.tx = x;
    b.ty = y;
    b.tz = z;
    b.tyaw = yaw;
    this.aplicarFlags(b, flags, false);
  }

  remover(id: number): void {
    const b = this.bichos.get(id);
    if (!b) return;
    // troca-com-o-último nas duas listas: O(1), sem buraco
    const lista = b.lote.bichos;
    const ultimo = lista[lista.length - 1]!;
    lista[b.iLote] = ultimo;
    ultimo.iLote = b.iLote;
    lista.pop();
    const ultimoAlvo = this.listaAlvos[this.listaAlvos.length - 1]!;
    const dono = this.bichos.get(ultimoAlvo.id)!;
    this.listaAlvos[b.iAlvo] = ultimoAlvo;
    dono.iAlvo = b.iAlvo;
    this.listaAlvos.pop();
    this.bichos.delete(id);
  }

  limpar(): void {
    for (const lote of this.lotes) {
      if (!lote) continue;
      lote.bichos.length = 0;
      lote.mesh.count = 0;
      lote.mesh.visible = false;
    }
    this.listaAlvos.length = 0;
    this.bichos.clear();
  }

  /** Estado novo. O ferido conta pela BORDA (o clarão nasce quando a flag liga). */
  private aplicarFlags(b: Bicho, flags: number, primeira: boolean): void {
    const ferido = (flags & FLAG_BICHO.ferido) !== 0;
    if (ferido && !b.feridoAntes && !primeira) b.feridoT = 1;
    b.feridoAntes = ferido;
    if (primeira) {
      // aparece JÁ no estado (sem a vaca "sentando" ao entrar na vista)
      b.sentaW = flags & FLAG_BICHO.sentado ? 1 : 0;
      b.bolaW = flags & FLAG_BICHO.bola ? 1 : 0;
      b.voaW = flags & FLAG_BICHO.voando ? 1 : 0;
      b.foraW = flags & FLAG_BICHO.foraDagua ? 1 : 0;
      b.amorW = flags & FLAG_BICHO.amor ? 1 : 0;
    }
    b.flags = flags;
  }

  /**
   * 1×/quadro, DEPOIS da câmera do quadro: LERP, animação, culling e escrita
   * das instâncias. O(n), sem alocação.
   */
  quadro(dt: number, camera: THREE.Camera): void {
    const t0 = performance.now();
    if (dt > 0.25) dt = 0.25; // aba voltando do fundo: não "teleporta" a animação
    this.uTempo.value = (this.uTempo.value + dt) % 3600;
    const k = 1 - Math.exp(-dt * LERP_POR_SEGUNDO);
    camera.updateMatrixWorld();
    this.projTela.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.projTela);
    let drawCalls = 0;
    let triangulos = 0;
    let instancias = 0;

    for (const lote of this.lotes) {
      if (!lote) continue;
      const def = lote.def;
      const altura = BICHOS[lote.tipo].altura;
      const m = lote.mesh.instanceMatrix.array as Float32Array;
      const A = lote.aA.array as Float32Array;
      const B = lote.aB.array as Float32Array;
      const C = lote.aC.array as Float32Array;
      let n = 0;
      for (const b of lote.bichos) {
        // ── LERP (o mesmo dos jogadores) ──
        const dxT = b.tx - b.x;
        const dyT = b.ty - b.y;
        const dzT = b.tz - b.z;
        let distXZ: number;
        if (dxT * dxT + dyT * dyT + dzT * dzT > SALTO_TELEPORTE * SALTO_TELEPORTE) {
          b.x = b.tx;
          b.y = b.ty;
          b.z = b.tz;
          b.yaw = b.tyaw;
          distXZ = 0;
        } else {
          b.x += dxT * k;
          b.y += dyT * k;
          b.z += dzT * k;
          distXZ = Math.hypot(dxT * k, dzT * k);
          const dyaw = b.tyaw - b.yaw;
          b.yaw += Math.atan2(Math.sin(dyaw), Math.cos(dyaw)) * k;
        }
        const f = b.flags;
        // ── passada: avança com a DISTÂNCIA (pé não patina), como no jogador ──
        const movendo = (f & FLAG_BICHO.movendo) !== 0;
        const velInst = dt > 0 ? distXZ / dt : 0;
        b.vel += (velInst - b.vel) * Math.min(1, dt * 6);
        const ampAlvo = movendo ? Math.min(1.7, Math.max(0.55, b.vel / lote.velocidade)) : 0;
        b.amp += (ampAlvo - b.amp) * Math.min(1, dt * 8);
        // empurrando parede (movendo sem andar) ainda pisa, devagar
        const passo = Math.max(distXZ, movendo ? dt * lote.velocidade * 0.35 : 0);
        b.fase = (b.fase + passo * def.passoPorBloco) % VOLTA_FASE;
        // ── estados suavizados ──
        b.sentaW = aproxima(b.sentaW, f & FLAG_BICHO.sentado ? 1 : 0, dt * 5);
        b.bolaW = aproxima(b.bolaW, f & FLAG_BICHO.bola ? 1 : 0, dt * 6);
        b.voaW = aproxima(b.voaW, f & FLAG_BICHO.voando ? 1 : 0, dt * 4);
        b.foraW = aproxima(b.foraW, f & FLAG_BICHO.foraDagua ? 1 : 0, dt * 6);
        b.amorW = aproxima(b.amorW, f & FLAG_BICHO.amor ? 1 : 0, dt * 3);
        b.feridoT = Math.max(0, b.feridoT - dt / DURACAO_FERIDO);
        const a = b.alvo;
        a.x = b.x;
        a.y = b.y;
        a.z = b.z;
        if (!this._visivel) continue;

        // ── culling por instância ──
        const s = (f & FLAG_BICHO.filhote ? ESCALA_FILHOTE : 1) * b.tamanho * (def.escala ?? 1);
        this.esfera.center.set(b.x, b.y + altura * 0.5 * s, b.z);
        this.esfera.radius = lote.raio * s;
        if (!this.frustum.intersectsSphere(this.esfera)) continue;

        if (this.luzEm) {
          const l = this.luzEm(b.x, b.y + Math.min(altura * 0.5 * s, 0.5), b.z);
          b.luz += (l - b.luz) * Math.min(1, dt * 8);
        }
        // ── escrita: matriz (posição, yaw, escala) + 3 vec4 ──
        const c = Math.cos(b.yaw) * s;
        const sn = Math.sin(b.yaw) * s;
        const o = n * 16;
        m[o] = c;
        m[o + 1] = 0;
        m[o + 2] = -sn;
        m[o + 3] = 0;
        m[o + 4] = 0;
        m[o + 5] = s;
        m[o + 6] = 0;
        m[o + 7] = 0;
        m[o + 8] = sn;
        m[o + 9] = 0;
        m[o + 10] = c;
        m[o + 11] = 0;
        m[o + 12] = b.x;
        m[o + 13] = b.y;
        m[o + 14] = b.z;
        m[o + 15] = 1;
        const q = n * 4;
        A[q] = b.fase;
        A[q + 1] = b.amp;
        A[q + 2] = b.semente;
        A[q + 3] = f;
        B[q] = b.variante;
        B[q + 1] = b.sentaW;
        B[q + 2] = b.bolaW;
        B[q + 3] = b.voaW;
        C[q] = b.feridoT;
        C[q + 1] = b.amorW;
        C[q + 2] = b.luz;
        C[q + 3] = b.foraW;
        n++;
      }
      lote.visiveis = n;
      const mesh = lote.mesh;
      mesh.count = n;
      mesh.visible = this._visivel && n > 0;
      if (n > 0) {
        // sobe só o pedaço usado (o resto do buffer é capacidade ociosa)
        this.subir(mesh.instanceMatrix, n * 16);
        this.subir(lote.aA, n * 4);
        this.subir(lote.aB, n * 4);
        this.subir(lote.aC, n * 4);
        drawCalls++;
        triangulos += n * lote.modelo.triangulos;
        instancias += n;
      }
    }
    const c = this.ultimoCusto;
    c.cpuMs = performance.now() - t0;
    c.drawCalls = drawCalls;
    c.triangulos = triangulos;
    c.instancias = instancias;
    c.tipos = drawCalls;
  }

  private subir(a: THREE.BufferAttribute, quantos: number): void {
    a.clearUpdateRanges();
    a.addUpdateRange(0, quantos);
    a.needsUpdate = true;
  }

  /** Posições INTERPOLADAS (pés), pra mira — as mesmas que o aluno vê. */
  alvos(): Iterable<{ id: number; x: number; y: number; z: number; largura: number; altura: number }> {
    return this.listaAlvos;
  }

  /** O nome que a mira mostra ("vira-lata caramelo"). */
  nome(id: number): string | null {
    const b = this.bichos.get(id);
    return b ? nomeDoBicho(b.lote.tipo, b.variante) : null;
  }

  /** Do último quadro, pro perfilador (F3). `triangulos` conta os ENVIADOS —
   *  inclusive os das silhuetas escondidas (área zero), que a GPU também processa. */
  custo(): { cpuMs: number; drawCalls: number; triangulos: number; instancias: number; tipos: number } {
    return { ...this.ultimoCusto };
  }

  setVisivel(v: boolean): void {
    this._visivel = v;
    for (const lote of this.lotes) if (lote) lote.mesh.visible = v && lote.visiveis > 0;
  }

  dispose(): void {
    for (const lote of this.lotes) {
      if (!lote) continue;
      this.scene.remove(lote.mesh);
      lote.mesh.dispose();
      lote.geo.dispose();
      lote.modelo.geometria.dispose();
      lote.material.dispose();
      lote.textura.dispose();
    }
    this.lotes.fill(undefined);
    this.bichos.clear();
    this.listaAlvos.length = 0;
  }

  /** Triângulos por modelo (prévia e relatório). */
  static triangulosPorTipo(): Record<TipoBicho, number> {
    const out = {} as Record<TipoBicho, number>;
    TIPOS_BICHO.forEach((t, i) => {
      out[t] = DEFS[i]!.caixas.reduce((s, c) => s + (c.faces?.length ?? 6) * 2, 0);
    });
    return out;
  }
}
