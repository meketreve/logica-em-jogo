import * as THREE from "three";

/**
 * §🐄 A OFICINA dos bichos: transforma uma lista de CAIXAS (o jeito Minecraft
 * de modelar) numa geometria só por tipo e numa textura pintada em canvas.
 *
 * Por que caixas e não malha livre: é o idioma visual do jogo inteiro (bloco,
 * jogador, alavanca) e é barato — 12 triângulos por caixa, nada de esfera. E
 * por que UMA geometria por tipo com as partes marcadas por vértice: a
 * animação mora no VERTEX SHADER (`render.ts`), então cada vértice precisa
 * saber de que parte é (`aInfo.x`), em torno de que ponto ela gira (`aPivo`)
 * e em que estado ela aparece (`aInfo.y`). O resultado é um draw call por TIPO,
 * seja 1 vaca ou 40.
 *
 * Unidade: **px = 1/16 de bloco**, a mesma densidade do atlas (`ATLAS.tilePx`).
 * Caixa de 4 px de largura ganha 4 texels de textura — o bicho e o bloco onde
 * ele pisa têm o mesmo "tamanho de pixel", e é isso que faz os dois parecerem
 * do mesmo jogo.
 *
 * Eixos (os do jogador): x à direita, y pra cima, **frente = −Z**. Origem nos
 * PÉS, no centro. `yaw` do servidor gira em torno de y igual ao corpo do
 * jogador (`remotePlayers.ts`).
 */

export type V3 = readonly [number, number, number];
export type Rgb = [number, number, number];

/** Quantos px cabem num bloco — a régua do atlas. */
export const PX_POR_BLOCO = 16;
const PX = 1 / PX_POR_BLOCO;

/**
 * PAPEL = como a parte se mexe. O número viaja no atributo do vértice e o
 * shader decide o giro pela tabela do tipo (`modelos.ts`). Mesma lista no
 * GLSL (`render.ts` gera os `#define` DAQUI — uma tabela só, nunca duas).
 */
export const PAPEL = {
  corpo: 0,
  cabeca: 1,
  /** pernas: frente-esquerda, frente-direita, trás-esquerda, trás-direita.
   *  Bípede (galinha, arara) usa só FE/FD. */
  pernaFE: 2,
  pernaFD: 3,
  pernaTE: 4,
  pernaTD: 5,
  rabo: 6,
  asaE: 7,
  asaD: 8,
  barbatana: 9,
  ovo: 10,
  coracao: 11,
  bola: 12,
  /** barbatana do lado esquerdo (espelho da `barbatana`) */
  barbatanaE: 13,
} as const;

/**
 * MÁSCARA = em que ESTADO a caixa existe. Bit ligado = regra ligada. É assim
 * que a ovelha tosquiada fica MAGRA e o tatu vira BOLA sem trocar de malha: as
 * duas silhuetas estão na geometria e o shader esconde a que não vale
 * (os três vértices do triângulo vão pro mesmo ponto — área zero, nenhum
 * pixel). Os bits 12..19 são a máscara de VARIANTE (nelore tem cupim, a
 * caracu não).
 */
export const MASCARA = {
  semTosquia: 1,
  soTosquia: 2,
  escondeBola: 4,
  soBola: 8,
  soOvo: 16,
  soAmor: 32,
  soDomado: 64,
  soAdulto: 128,
  escondeVoo: 256,
  soVoo: 512,
  /** acompanha o CORPO: inclina ao sentar e balança com a passada */
  preso: 1024,
  /** brilha sozinho (os corações: legíveis de noite) */
  emissivo: 2048,
} as const;
export const BIT_VARIANTE = 12;
export const MAX_VARIANTES = 8;

/** Face da caixa: 0 +x · 1 −x · 2 +y (topo) · 3 −y (baixo) · 4 +z (trás) · 5 −z (frente). */
export type Face = 0 | 1 | 2 | 3 | 4 | 5;
export const FACE = { dir: 0, esq: 1, topo: 2, baixo: 3, tras: 4, frente: 5 } as const;

/** Um texel sendo pintado: ONDE ele está no bicho, não onde está no canvas. */
export interface Texel {
  /** ponto da superfície em px, na pose de descanso (antes do `giro`) */
  x: number;
  y: number;
  z: number;
  face: Face;
  /** coluna/linha dentro da face, vista de fora (0,0 = canto de cima à esquerda) */
  i: number;
  j: number;
  tw: number;
  th: number;
  /** semente da caixa — o ruído não se repete entre caixas iguais */
  s: number;
}

/** A paleta da variante, já em RGB, + o nome (o pintor muda de padrão por ele). */
export interface Paleta {
  readonly indice: number;
  readonly nome: string;
  readonly corpo: Rgb;
  readonly detalhe: Rgb;
  readonly acento: Rgb;
}

/**
 * Pintor: devolve a cor do texel. Recebe o ponto 3D, não a coordenada do
 * canvas — mancha de vaca e listra de gato atravessam a quina da caixa e
 * passam de uma caixa pra outra sem emenda, porque o padrão é função do
 * ESPAÇO do bicho e não da face.
 */
export type Pintor = (t: Texel, p: Paleta) => Rgb;

export interface Caixa {
  /** cantos mínimo e máximo, em px, na pose de descanso */
  readonly de: V3;
  readonly ate: V3;
  readonly papel: number;
  /** ponto em torno do qual o papel gira (px). Padrão: o centro da caixa. */
  readonly pivo?: V3;
  /** giro FIXO de descanso (rad, aplicado X→Y→Z) em torno de `giroEm` (padrão: `pivo`) */
  readonly giro?: V3;
  readonly giroEm?: V3;
  readonly mascara?: number;
  /** variantes que MOSTRAM a caixa (índices). Ausente = todas. */
  readonly variantes?: readonly number[];
  readonly pinta: Pintor;
  /** pose de SENTADO (só pernas): giro X (rad), dy, dz (px) */
  readonly sentado?: V3;
  /** faces emitidas (padrão: as 6). O coração só tem a da frente. */
  readonly faces?: readonly Face[];
  /** número livre que vai no `aPose.x` quando não há `sentado` (o coração usa) */
  readonly aux?: number;
}

export interface ModeloMontado {
  readonly geometria: THREE.BufferGeometry;
  readonly canvas: HTMLCanvasElement;
  /** fração da altura da textura que cada variante ocupa (o shader soma `variante * linha`) */
  readonly linha: number;
  readonly triangulos: number;
  /** caixa de descanso de TODAS as partes (todas as variantes e estados), em blocos */
  readonly limites: THREE.Box3;
}

// ── cor ──────────────────────────────────────────────────────────────────────

export function hexRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function mistura(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

export function escala(c: Rgb, f: number): Rgb {
  return [c[0] * f, c[1] * f, c[2] * f];
}

/** Luminância perceptiva 0..1 — o pintor escolhe olho claro em bicho escuro. */
export function luminancia(c: Rgb): number {
  return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
}

/** Hash determinístico (mesmo bicho a cada load, sem Math.random — regra do atlas). */
export function hash3(x: number, y: number, z: number, s: number): number {
  let h = Math.imul(Math.floor(x) | 0, 374761393) ^ Math.imul(Math.floor(y) | 0, 668265263);
  h ^= Math.imul(Math.floor(z) | 0, 2147483587) ^ Math.imul(s | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Ruído de valor 3D, suave (trilinear com smoothstep), em [0,1). */
export function ruido3(x: number, y: number, z: number, s: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const sz = fz * fz * (3 - 2 * fz);
  const l = (a: number, b: number, t: number): number => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number): number => hash3(ix + dx, iy + dy, iz + dz, s);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), sx), l(c(0, 1, 0), c(1, 1, 0), sx), sy),
    l(l(c(0, 0, 1), c(1, 0, 1), sx), l(c(0, 1, 1), c(1, 1, 1), sx), sy),
    sz,
  );
}

/** Granulado de pixel art: ±`vary` por texel, sem padrão visível. */
export function granulado(c: Rgb, t: Texel, vary: number): Rgb {
  const v = (hash3(t.i * 3 + t.face * 101, t.j * 5, t.s, 7) - 0.5) * 2 * vary;
  return [c[0] + v, c[1] + v, c[2] + v];
}

// ── montagem ─────────────────────────────────────────────────────────────────

/**
 * Cantos de cada face vistos de FORA: baixo-esq, baixo-dir, cima-dir,
 * cima-esq. Nessa ordem a face sai anti-horária (a frente do three) e a
 * textura sai sem espelhar. O topo tem a FRENTE do bicho (−z) pra cima no
 * canvas.
 */
function cantos(f: Face, a: V3, b: V3): [V3, V3, V3, V3] {
  switch (f) {
    case 0: return [[b[0], a[1], b[2]], [b[0], a[1], a[2]], [b[0], b[1], a[2]], [b[0], b[1], b[2]]];
    case 1: return [[a[0], a[1], a[2]], [a[0], a[1], b[2]], [a[0], b[1], b[2]], [a[0], b[1], a[2]]];
    case 2: return [[a[0], b[1], b[2]], [b[0], b[1], b[2]], [b[0], b[1], a[2]], [a[0], b[1], a[2]]];
    case 3: return [[b[0], a[1], b[2]], [a[0], a[1], b[2]], [a[0], a[1], a[2]], [b[0], a[1], a[2]]];
    case 4: return [[a[0], a[1], b[2]], [b[0], a[1], b[2]], [b[0], b[1], b[2]], [a[0], b[1], b[2]]];
    case 5: return [[b[0], a[1], a[2]], [a[0], a[1], a[2]], [a[0], b[1], a[2]], [b[0], b[1], a[2]]];
  }
}

const NORMAIS: readonly V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const TODAS: readonly Face[] = [0, 1, 2, 3, 4, 5];

/** Tamanho da face em texels: largura × altura vistas de fora. */
function tamanhoFace(f: Face, w: number, h: number, d: number): [number, number] {
  const r = (v: number): number => Math.max(1, Math.round(v));
  if (f === 0 || f === 1) return [r(d), r(h)];
  if (f === 2 || f === 3) return [r(w), r(d)];
  return [r(w), r(h)];
}

function girar(p: V3, giro: V3, em: V3): V3 {
  let x = p[0] - em[0];
  let y = p[1] - em[1];
  let z = p[2] - em[2];
  if (giro[0]) {
    const c = Math.cos(giro[0]);
    const s = Math.sin(giro[0]);
    [y, z] = [y * c - z * s, y * s + z * c];
  }
  if (giro[1]) {
    const c = Math.cos(giro[1]);
    const s = Math.sin(giro[1]);
    [x, z] = [x * c + z * s, -x * s + z * c];
  }
  if (giro[2]) {
    const c = Math.cos(giro[2]);
    const s = Math.sin(giro[2]);
    [x, y] = [x * c - y * s, x * s + y * c];
  }
  return [x + em[0], y + em[1], z + em[2]];
}

interface Retangulo {
  caixa: number;
  face: Face;
  tw: number;
  th: number;
  /** canto de cima à esquerda (dentro da calha de 1 texel) */
  x: number;
  y: number;
}

/**
 * Empacota as faces numa folha de prateleiras. Cada retângulo leva 1 texel de
 * CALHA em volta, pintada com a cor da borda da própria face: com filtro
 * NEAREST e sem mipmap (o atlas é igual), a amostra na quina da face às vezes
 * cai no texel vizinho — sem calha, o vizinho é a face de OUTRA caixa e a
 * quina pisca outra cor.
 */
function empacotar(rets: Retangulo[]): { largura: number; altura: number } {
  const maior = rets.reduce((m, r) => Math.max(m, r.tw + 2), 0);
  const largura = maior > 64 ? 128 : 64;
  const ordem = [...rets].sort((a, b) => b.th - a.th || b.tw - a.tw);
  let x = 0;
  let y = 0;
  let alturaPrateleira = 0;
  for (const r of ordem) {
    const w = r.tw + 2;
    const h = r.th + 2;
    if (x + w > largura) {
      y += alturaPrateleira;
      x = 0;
      alturaPrateleira = 0;
    }
    r.x = x + 1;
    r.y = y + 1;
    x += w;
    alturaPrateleira = Math.max(alturaPrateleira, h);
  }
  return { largura, altura: y + alturaPrateleira };
}

/**
 * Monta a geometria (atributos por vértice) e pinta a textura (uma LINHA por
 * variante, empilhadas). O shader troca de variante somando `variante*linha`
 * ao v — nenhum material por variante.
 */
export function montarModelo(caixas: readonly Caixa[], paletas: readonly Paleta[]): ModeloMontado {
  if (paletas.length > MAX_VARIANTES) throw new Error(`bicho com ${paletas.length} variantes (máx ${MAX_VARIANTES})`);
  const rets: Retangulo[] = [];
  caixas.forEach((c, ci) => {
    const w = c.ate[0] - c.de[0];
    const h = c.ate[1] - c.de[1];
    const d = c.ate[2] - c.de[2];
    for (const f of c.faces ?? TODAS) {
      const [tw, th] = tamanhoFace(f, w, h, d);
      rets.push({ caixa: ci, face: f, tw, th, x: 0, y: 0 });
    }
  });
  const folha = empacotar(rets);
  const alturaLinha = folha.altura;
  const alturaTotal = alturaLinha * paletas.length;

  // ── pintura ──
  const canvas = document.createElement("canvas");
  canvas.width = folha.largura;
  canvas.height = alturaTotal;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d indisponível");
  const img = ctx.createImageData(folha.largura, alturaTotal);
  const t: Texel = { x: 0, y: 0, z: 0, face: 0, i: 0, j: 0, tw: 1, th: 1, s: 0 };
  for (const pal of paletas) {
    const oy = pal.indice * alturaLinha;
    for (const r of rets) {
      const c = caixas[r.caixa]!;
      const [bl, br, , tl] = cantos(r.face, c.de, c.ate);
      t.face = r.face;
      t.tw = r.tw;
      t.th = r.th;
      t.s = r.caixa * 31 + 7;
      // a calha (−1 e tw) repete a borda: o `clamp` faz isso de graça
      for (let jj = -1; jj <= r.th; jj++) {
        for (let ii = -1; ii <= r.tw; ii++) {
          const i = Math.min(Math.max(ii, 0), r.tw - 1);
          const j = Math.min(Math.max(jj, 0), r.th - 1);
          const su = (i + 0.5) / r.tw;
          const sv = 1 - (j + 0.5) / r.th;
          t.x = bl[0] + (br[0] - bl[0]) * su + (tl[0] - bl[0]) * sv;
          t.y = bl[1] + (br[1] - bl[1]) * su + (tl[1] - bl[1]) * sv;
          t.z = bl[2] + (br[2] - bl[2]) * su + (tl[2] - bl[2]) * sv;
          t.i = i;
          t.j = j;
          const cor = c.pinta(t, pal);
          const k = ((oy + r.y + jj) * folha.largura + (r.x + ii)) * 4;
          img.data[k] = Math.max(0, Math.min(255, Math.round(cor[0])));
          img.data[k + 1] = Math.max(0, Math.min(255, Math.round(cor[1])));
          img.data[k + 2] = Math.max(0, Math.min(255, Math.round(cor[2])));
          img.data[k + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);

  // ── geometria ──
  const nFaces = rets.length;
  const pos = new Float32Array(nFaces * 4 * 3);
  const nor = new Float32Array(nFaces * 4 * 3);
  const uv = new Float32Array(nFaces * 4 * 2);
  const piv = new Float32Array(nFaces * 4 * 3);
  const info = new Float32Array(nFaces * 4 * 2);
  const pose = new Float32Array(nFaces * 4 * 3);
  const idx = new Uint16Array(nFaces * 6);
  const limites = new THREE.Box3();
  const ponto = new THREE.Vector3();
  let v = 0;
  let k = 0;
  for (const r of rets) {
    const c = caixas[r.caixa]!;
    const centro: V3 = [(c.de[0] + c.ate[0]) / 2, (c.de[1] + c.ate[1]) / 2, (c.de[2] + c.ate[2]) / 2];
    const pivo = c.pivo ?? centro;
    const giro = c.giro;
    const giroEm = c.giroEm ?? pivo;
    let mascara = c.mascara ?? 0;
    let mv = 0;
    for (const vi of c.variantes ?? paletas.map((p) => p.indice)) mv |= 1 << vi;
    mascara |= mv << BIT_VARIANTE;
    const quatro = cantos(r.face, c.de, c.ate);
    const n0 = NORMAIS[r.face]!;
    const n = giro ? girar(n0, giro, [0, 0, 0]) : n0;
    // UV: (u, v) com v medido de CIMA do canvas (textura com flipY=false)
    const u0 = r.x / folha.largura;
    const u1 = (r.x + r.tw) / folha.largura;
    const vTopo = r.y / alturaTotal;
    const vBase = (r.y + r.th) / alturaTotal;
    const uvs = [u0, vBase, u1, vBase, u1, vTopo, u0, vTopo];
    for (let q = 0; q < 4; q++) {
      const p = giro ? girar(quatro[q]!, giro, giroEm) : quatro[q]!;
      pos.set([p[0] * PX, p[1] * PX, p[2] * PX], (v + q) * 3);
      nor.set(n, (v + q) * 3);
      uv.set([uvs[q * 2]!, uvs[q * 2 + 1]!], (v + q) * 2);
      piv.set([pivo[0] * PX, pivo[1] * PX, pivo[2] * PX], (v + q) * 3);
      info.set([c.papel, mascara], (v + q) * 2);
      const s = c.sentado;
      pose.set(s ? [s[0], s[1] * PX, s[2] * PX] : [c.aux ?? 0, 0, 0], (v + q) * 3);
      if (c.papel !== PAPEL.coracao) limites.expandByPoint(ponto.set(p[0] * PX, p[1] * PX, p[2] * PX));
    }
    idx.set([v, v + 1, v + 2, v, v + 2, v + 3], k);
    v += 4;
    k += 6;
  }
  const geometria = new THREE.BufferGeometry();
  geometria.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geometria.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geometria.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometria.setAttribute("aPivo", new THREE.BufferAttribute(piv, 3));
  geometria.setAttribute("aInfo", new THREE.BufferAttribute(info, 2));
  geometria.setAttribute("aPose", new THREE.BufferAttribute(pose, 3));
  geometria.setIndex(new THREE.BufferAttribute(idx, 1));
  return { geometria, canvas, linha: alturaLinha / alturaTotal, triangulos: nFaces * 2, limites };
}
