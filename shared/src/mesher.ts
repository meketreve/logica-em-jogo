import {
  BlockId,
  camaHeadDir,
  isCadeira,
  isCama,
  isFlor,
  isFullCube,
  isJanela,
  isJanelaAberta,
  isMovel,
  isPorta,
  isPortaAberta,
  isQuadro,
  isSofa,
  isTapete,
  isTransparentBlock,
  janelaEixoX,
  janelaHingeAlta,
  portaEixoX,
  portaHingeAlta,
} from "./blocks";
import { CHUNK_SIZE } from "./constants";
import { type World, chunkIndex, getBlock } from "./world";

/**
 * Culled mesher: função PURA (bytes do mundo → geometria). Só emite faces que
 * encostam em ar (corta >90% das faces). Posições locais ao chunk — o cliente
 * posiciona o mesh na origem do chunk. Sem dependência de three.js/navegador,
 * então dá pra mover pra Worker depois sem mexer aqui.
 */

/** Layout do texture atlas. O cliente pinta a textura seguindo ESTE layout.
 *  cp20: 16×16 = 256 tiles (era 8×8 = 64) — coube os blocos-glifo + folga. */
export const ATLAS = { tilesPerRow: 16, tilePx: 16 } as const;

/** Índice de cada tile no atlas (coluna = i % tilesPerRow, linha = ⌊i / tilesPerRow⌋). */
export const TILE = {
  grassTop: 0,
  grassSide: 1,
  dirt: 2,
  stone: 3,
  cobblestone: 4,
  sand: 5,
  logTop: 6,
  logSide: 7,
  planks: 8,
  brick: 9,
  gravel: 10,
  bedrock: 11,
  woolWhite: 12,
  woolBlack: 13,
  woolRed: 14,
  woolOrange: 15,
  woolYellow: 16,
  woolGreen: 17,
  woolBlue: 18,
  woolPurple: 19,
  // cp17
  sandstone: 20,
  stoneBricks: 21,
  snow: 22,
  obsidian: 23,
  woolPink: 24,
  woolCyan: 25,
  woolGray: 26,
  woolBrown: 27,
  // cp18 (transparentes)
  glass: 28,
  leaves: 29,
  // cp23 (não-cubos) — glifos ocupam 30..65 (ver GLYPH)
  cerca: 66,
  portaBaixo: 67,
  portaCima: 68,
  tocha: 69,
  // 2026-07-19: janela (moldura + cruz de madeira, vidro = ausência/cutout)
  janela: 70,
  // 2026-07-19: móveis — estofado (sofá) e colchão (cama); mesa/cadeira
  // reusam o tile das tábuas
  estofado: 71,
  colchao: 72,
  // 2026-07-19: quadro (moldura de madeira + tela branca; o CONTEÚDO é um
  // plane com canvas por cima, no cliente)
  quadro: 73,
  // 2026-07-20: flores (sprite em cruz, fundo transparente/cutout). Ordem =
  // âncora florVermelha + (id − FlorVermelha).
  florVermelha: 74,
  florAmarela: 75,
  florAzul: 76,
  florBranca: 77,
  // 2026-07-20: minérios (pedra + pepitas + sigla — placeholder do survival)
  minerioCarvao: 78,
  minerioFerro: 79,
  minerioOuro: 80,
  minerioDiamante: 81,
  // 2026-07-20: gramas climáticas (topo + lado; bottom reusa dirt)
  gramaSecaTop: 82,
  gramaSecaSide: 83,
  gramaFriaTop: 84,
  gramaFriaSide: 85,
  // 2026-07-20: árvores brasileiras — casca (lado; topo reusa logTop) + copa
  logIpe: 86,
  folhasIpe: 87,
  logAraucaria: 88,
  folhasAraucaria: 89,
  logPauBrasil: 90,
  folhasPauBrasil: 91,
  // 2026-07-20: mandacaru (cacto da caatinga; topo próprio)
  mandacaruSide: 92,
  mandacaruTop: 93,
} as const;

/** cp20: blocos-glifo. Letras A–Z e dígitos 0–9 ocupam tiles consecutivos a
 *  partir de `base` (A=30 … Z=55, 0=56 … 9=65). O cliente pinta o glifo; o
 *  mesher só precisa do índice do tile. FONTE ÚNICA de layout: atlas, tiles e
 *  nomes (blocksUi) derivam daqui — mantém letras/dígitos sempre em sincronia. */
export const GLYPH = {
  base: 30,
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
} as const;

interface FaceTiles {
  readonly top: number;
  readonly bottom: number;
  readonly side: number;
}

/** Bloco com o mesmo tile nas 6 faces. */
const uniform = (tile: number): FaceTiles => ({ top: tile, bottom: tile, side: tile });

const BLOCK_TILES: Record<number, FaceTiles> = {
  [BlockId.Grass]: { top: TILE.grassTop, bottom: TILE.dirt, side: TILE.grassSide },
  [BlockId.Stone]: uniform(TILE.stone),
  [BlockId.Cobblestone]: uniform(TILE.cobblestone),
  [BlockId.Sand]: uniform(TILE.sand),
  [BlockId.Dirt]: uniform(TILE.dirt),
  [BlockId.Log]: { top: TILE.logTop, bottom: TILE.logTop, side: TILE.logSide },
  [BlockId.Planks]: uniform(TILE.planks),
  [BlockId.Brick]: uniform(TILE.brick),
  [BlockId.Gravel]: uniform(TILE.gravel),
  [BlockId.Bedrock]: uniform(TILE.bedrock),
  [BlockId.WoolWhite]: uniform(TILE.woolWhite),
  [BlockId.WoolBlack]: uniform(TILE.woolBlack),
  [BlockId.WoolRed]: uniform(TILE.woolRed),
  [BlockId.WoolOrange]: uniform(TILE.woolOrange),
  [BlockId.WoolYellow]: uniform(TILE.woolYellow),
  [BlockId.WoolGreen]: uniform(TILE.woolGreen),
  [BlockId.WoolBlue]: uniform(TILE.woolBlue),
  [BlockId.WoolPurple]: uniform(TILE.woolPurple),
  [BlockId.Sandstone]: uniform(TILE.sandstone),
  [BlockId.StoneBricks]: uniform(TILE.stoneBricks),
  [BlockId.Snow]: uniform(TILE.snow),
  [BlockId.Obsidian]: uniform(TILE.obsidian),
  [BlockId.WoolPink]: uniform(TILE.woolPink),
  [BlockId.WoolCyan]: uniform(TILE.woolCyan),
  [BlockId.WoolGray]: uniform(TILE.woolGray),
  [BlockId.WoolBrown]: uniform(TILE.woolBrown),
  [BlockId.Glass]: uniform(TILE.glass),
  [BlockId.Leaves]: uniform(TILE.leaves),
  // cp23: não-cubos NÃO passam pelo caminho de cubo do mesher (têm forma
  // própria) — estas entradas alimentam só o ícone 2D (blockIconTile).
  [BlockId.Cerca]: uniform(TILE.cerca),
  [BlockId.PortaXFechada]: uniform(TILE.portaCima),
  [BlockId.PortaXAberta]: uniform(TILE.portaCima),
  [BlockId.PortaZFechada]: uniform(TILE.portaCima),
  [BlockId.PortaZAberta]: uniform(TILE.portaCima),
  // portas R (dobradiça alta) — mesmo ícone; nunca vão à hotbar (o servidor as
  // grava, o cliente sempre copia porta → PortaXFechada), mas blockIconTile não
  // pode faltar caso algo peça o ícone de uma porta R.
  [BlockId.PortaXFechadaR]: uniform(TILE.portaCima),
  [BlockId.PortaXAbertaR]: uniform(TILE.portaCima),
  [BlockId.PortaZFechadaR]: uniform(TILE.portaCima),
  [BlockId.PortaZAbertaR]: uniform(TILE.portaCima),
  [BlockId.Tocha]: uniform(TILE.tocha),
  [BlockId.JanelaXFechada]: uniform(TILE.janela),
  [BlockId.JanelaXAberta]: uniform(TILE.janela),
  [BlockId.JanelaZFechada]: uniform(TILE.janela),
  [BlockId.JanelaZAberta]: uniform(TILE.janela),
  // janelas R (dobradiça alta) — mesmo ícone; nunca vão à hotbar (copy → base)
  [BlockId.JanelaXFechadaR]: uniform(TILE.janela),
  [BlockId.JanelaXAbertaR]: uniform(TILE.janela),
  [BlockId.JanelaZFechadaR]: uniform(TILE.janela),
  [BlockId.JanelaZAbertaR]: uniform(TILE.janela),
  // móveis (2026-07-19): estas entradas alimentam SÓ o ícone 2D — a forma
  // (e o tile por caixa) vive no emitShape
  [BlockId.Mesa]: uniform(TILE.planks),
  // 2026-07-20: minérios + gramas climáticas + árvores brasileiras + mandacaru
  [BlockId.MinerioCarvao]: uniform(TILE.minerioCarvao),
  [BlockId.MinerioFerro]: uniform(TILE.minerioFerro),
  [BlockId.MinerioOuro]: uniform(TILE.minerioOuro),
  [BlockId.MinerioDiamante]: uniform(TILE.minerioDiamante),
  [BlockId.GramaSeca]: { top: TILE.gramaSecaTop, bottom: TILE.dirt, side: TILE.gramaSecaSide },
  [BlockId.GramaFria]: { top: TILE.gramaFriaTop, bottom: TILE.dirt, side: TILE.gramaFriaSide },
  [BlockId.LogIpe]: { top: TILE.logTop, bottom: TILE.logTop, side: TILE.logIpe },
  [BlockId.FolhasIpe]: uniform(TILE.folhasIpe),
  [BlockId.LogAraucaria]: { top: TILE.logTop, bottom: TILE.logTop, side: TILE.logAraucaria },
  [BlockId.FolhasAraucaria]: uniform(TILE.folhasAraucaria),
  [BlockId.LogPauBrasil]: { top: TILE.logTop, bottom: TILE.logTop, side: TILE.logPauBrasil },
  [BlockId.FolhasPauBrasil]: uniform(TILE.folhasPauBrasil),
  [BlockId.Mandacaru]: { top: TILE.mandacaruTop, bottom: TILE.mandacaruTop, side: TILE.mandacaruSide },
};

// móveis direcionais: mesmo ícone pras 4 direções
for (let k = 0; k < 4; k++) {
  BLOCK_TILES[BlockId.CadeiraXP + k] = uniform(TILE.planks);
  BLOCK_TILES[BlockId.SofaXP + k] = uniform(TILE.estofado);
  BLOCK_TILES[BlockId.CamaXP + k] = uniform(TILE.colchao);
  BLOCK_TILES[BlockId.QuadroXP + k] = uniform(TILE.quadro);
}

// flores (2026-07-20): um tile por cor; alimenta o ícone 2D e a forma-cruz.
for (let i = 0; i < 4; i++) {
  BLOCK_TILES[BlockId.FlorVermelha + i] = uniform(TILE.florVermelha + i);
}

// cp20: letras/dígitos = cubos uniformes com o tile do glifo (append A→Z, 0→9).
for (let i = 0; i < GLYPH.letters.length; i++) {
  BLOCK_TILES[BlockId.LetterA + i] = uniform(GLYPH.base + i);
}
for (let i = 0; i < GLYPH.digits.length; i++) {
  BLOCK_TILES[BlockId.Digit0 + i] = uniform(GLYPH.base + GLYPH.letters.length + i);
}

/** Tapetes (2026-07-19): tile da PRÓPRIA lã, na ordem TapeteBranco..TapeteMarrom
 *  (a forma fina vive no emitShape; estas entradas dão o ícone 2D + o tile). */
const TAPETE_TILES: readonly number[] = [
  TILE.woolWhite, TILE.woolBlack, TILE.woolRed, TILE.woolOrange,
  TILE.woolYellow, TILE.woolGreen, TILE.woolBlue, TILE.woolPurple,
  TILE.woolPink, TILE.woolCyan, TILE.woolGray, TILE.woolBrown,
];
for (let i = 0; i < TAPETE_TILES.length; i++) {
  BLOCK_TILES[BlockId.TapeteBranco + i] = uniform(TAPETE_TILES[i]!);
}

/** Tile usado como ÍCONE 2D do bloco (hotbar/inventário do cliente) — a face lateral. */
export function blockIconTile(id: number): number {
  return BLOCK_TILES[id]?.side ?? TILE.stone;
}

/** Caixa de SELEÇÃO (o contorno preto da mira / "hitbox" visual) de um bloco,
 *  em frações da célula: [x0,y0,z0,x1,y1,z1]. Cubo cheio = célula inteira;
 *  cada não-cubo devolve a caixa que ENVOLVE a forma do mesher, então o
 *  contorno segue a textura (estilo Minecraft). PURA — estado/direção moram no
 *  próprio id (porta/janela aberta, quadro/móvel direcional). */
export function blockSelectionBox(
  id: number,
): readonly [number, number, number, number, number, number] {
  if (isFlor(id)) return [4 * P, 0, 4 * P, 12 * P, 1, 12 * P];
  if (isTapete(id)) return [0, 0, 0, 1, P, 1];
  if (id === BlockId.Tocha) return [7 * P, 0, 7 * P, 9 * P, 10 * P, 9 * P];
  if (id === BlockId.Cerca) return [6 * P, 0, 6 * P, 10 * P, 1, 10 * P];
  if (isPorta(id)) {
    if (!isPortaAberta(id))
      return portaEixoX(id) ? [0, 0, 0, 2 * P, 1, 1] : [0, 0, 0, 1, 1, 2 * P];
    const c = portaHingeAlta(id) ? 1 - 2 * P : 0;
    return portaEixoX(id) ? [0, 0, c, 1, 1, c + 2 * P] : [c, 0, 0, c + 2 * P, 1, 1];
  }
  if (isJanela(id)) {
    if (!isJanelaAberta(id))
      return janelaEixoX(id) ? [0, 0, 0, 2 * P, 1, 1] : [0, 0, 0, 1, 1, 2 * P];
    const c = janelaHingeAlta(id) ? 1 - 2 * P : 0;
    return janelaEixoX(id) ? [0, 0, c, 1, 1, c + 2 * P] : [c, 0, 0, c + 2 * P, 1, 1];
  }
  if (isQuadro(id)) {
    const [rxa, rza, rxb, rzb] = rotXZ(0, 1 * P, 2 * P, 15 * P, id - BlockId.QuadroXP);
    return [
      Math.min(rxa, rxb), 1 * P, Math.min(rza, rzb),
      Math.max(rxa, rxb), 15 * P, Math.max(rza, rzb),
    ];
  }
  if (id === BlockId.Mesa) return [0, 0, 0, 1, 14 * P, 1];
  if (isCadeira(id)) return [3 * P, 0, 3 * P, 13 * P, 1, 13 * P];
  if (isSofa(id)) return [0, 0, 0, 1, 15 * P, 1];
  if (isCama(id)) return [0, 0, 0, 1, 9 * P, 1];
  return [0, 0, 0, 1, 1, 1]; // cubo cheio (e fallback)
}

interface FaceCorner {
  readonly pos: readonly [number, number, number];
  readonly uv: readonly [0 | 1, 0 | 1];
}

interface Face {
  readonly dir: readonly [number, number, number];
  readonly corners: readonly [FaceCorner, FaceCorner, FaceCorner, FaceCorner];
}

/** 6 faces do cubo unitário, winding CCW visto de fora (front face do three.js). */
const FACES: readonly Face[] = [
  {
    dir: [-1, 0, 0],
    corners: [
      { pos: [0, 1, 0], uv: [0, 1] },
      { pos: [0, 0, 0], uv: [0, 0] },
      { pos: [0, 1, 1], uv: [1, 1] },
      { pos: [0, 0, 1], uv: [1, 0] },
    ],
  },
  {
    dir: [1, 0, 0],
    corners: [
      { pos: [1, 1, 1], uv: [0, 1] },
      { pos: [1, 0, 1], uv: [0, 0] },
      { pos: [1, 1, 0], uv: [1, 1] },
      { pos: [1, 0, 0], uv: [1, 0] },
    ],
  },
  {
    dir: [0, -1, 0],
    corners: [
      { pos: [1, 0, 1], uv: [1, 0] },
      { pos: [0, 0, 1], uv: [0, 0] },
      { pos: [1, 0, 0], uv: [1, 1] },
      { pos: [0, 0, 0], uv: [0, 1] },
    ],
  },
  {
    dir: [0, 1, 0],
    corners: [
      { pos: [0, 1, 1], uv: [1, 1] },
      { pos: [1, 1, 1], uv: [0, 1] },
      { pos: [0, 1, 0], uv: [1, 0] },
      { pos: [1, 1, 0], uv: [0, 0] },
    ],
  },
  {
    dir: [0, 0, -1],
    corners: [
      { pos: [1, 0, 0], uv: [0, 0] },
      { pos: [0, 0, 0], uv: [1, 0] },
      { pos: [1, 1, 0], uv: [0, 1] },
      { pos: [0, 1, 0], uv: [1, 1] },
    ],
  },
  {
    dir: [0, 0, 1],
    corners: [
      { pos: [0, 0, 1], uv: [0, 0] },
      { pos: [1, 0, 1], uv: [1, 0] },
      { pos: [0, 1, 1], uv: [0, 1] },
      { pos: [1, 1, 1], uv: [1, 1] },
    ],
  },
];

/** Eixo do mundo que uma coordenada UV da face percorre (pré-computado das
 *  FACES): u=0→1 anda neste eixo; flip = anda no sentido decrescente. */
interface UvAxis {
  axis: 0 | 1 | 2;
  flip: boolean;
}

function uvAxisOf(a: FaceCorner, b: FaceCorner): UvAxis {
  for (const axis of [0, 1, 2] as const) {
    if (a.pos[axis] !== b.pos[axis]) return { axis, flip: a.pos[axis] === 1 };
  }
  return { axis: 0, flip: false };
}

const FACE_UVS: readonly { u: UvAxis; v: UvAxis }[] = FACES.map((f) => {
  const at = (u: 0 | 1, v: 0 | 1): FaceCorner =>
    f.corners.find((c) => c.uv[0] === u && c.uv[1] === v) ?? f.corners[0];
  return { u: uvAxisOf(at(0, 0), at(1, 0)), v: uvAxisOf(at(0, 0), at(0, 1)) };
});

/** 1/16 da célula — o "pixel" das formas não-cubo (16 texels por face). */
const P = 1 / 16;

/** Gira o retângulo XZ de uma caixa k×90° em torno do centro da célula
 *  (0.5, 0.5). Usado pelos móveis direcionais: forma escrita uma vez de
 *  frente pra +x, as outras 3 direções saem daqui. */
function rotXZ(
  xa: number, za: number, xb: number, zb: number, k: number,
): [number, number, number, number] {
  for (let i = 0; i < k; i++) {
    const nxa = 1 - zb;
    const nzb = xb;
    const nxb = 1 - za;
    const nza = xa;
    xa = nxa; za = nza; xb = nxb; zb = nzb;
  }
  return [xa, za, xb, zb];
}

export interface ChunkGeometry {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint32Array;
}

export function meshChunk(world: World, cx: number, cy: number, cz: number): ChunkGeometry {
  // Fast path (2026-07-19): chunk 100% AR não emite face nenhuma (culled
  // mesher só olha células sólidas DESTE chunk). No mundo G, 75% dos chunks
  // são céu — varrer 4096 células × 6 faces à toa dominava o mesh do join
  // (bench: 1,1 s → ~0,3 s). Checar 4096 bytes custa ~µs.
  // chunk ausente (mundo esparso, 2026-07-20) = ar puro → mesmo fast path
  const bytes = world.chunks[chunkIndex(world, cx, cy, cz)];
  if (!bytes || bytes.every((b) => b === 0)) {
    return {
      positions: new Float32Array(0),
      normals: new Float32Array(0),
      uvs: new Float32Array(0),
      indices: new Uint32Array(0),
    };
  }

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const ox = cx * CHUNK_SIZE;
  const oy = cy * CHUNK_SIZE;
  const oz = cz * CHUNK_SIZE;

  const n = ATLAS.tilesPerRow;
  // Meia-texel de recuo nas UVs contra bleeding entre tiles vizinhos.
  const inset = 0.5 / (n * ATLAS.tilePx);

  /** Caixa parcial da célula (frações [0..1]), UV PROPORCIONAL: cada face
   *  amostra do tile a mesma região que ocuparia no cubo cheio — textura de
   *  caixa fina não estica. Face RENTE à borda da célula é coplanar com a face
   *  do vizinho: some se o vizinho é cubo opaco (oclusão) OU tem o MESMO id
   *  (metades da porta fundem — sem z-fight). Base das formas do cp23. */
  const emitBox = (
    lx: number, ly: number, lz: number, id: number, tile: number,
    x0: number, y0: number, z0: number, x1: number, y1: number, z1: number,
  ): void => {
    const col = tile % n;
    const row = (tile / n) | 0;
    const lo = [x0, y0, z0] as const;
    const hi = [x1, y1, z1] as const;
    for (let i = 0; i < FACES.length; i++) {
      const face = FACES[i];
      const axes = FACE_UVS[i];
      if (!face || !axes) continue;
      const flush =
        face.dir[0] === -1 ? x0 === 0 : face.dir[0] === 1 ? x1 === 1 :
        face.dir[1] === -1 ? y0 === 0 : face.dir[1] === 1 ? y1 === 1 :
        face.dir[2] === -1 ? z0 === 0 : z1 === 1;
      if (flush) {
        const nb = getBlock(
          world,
          ox + lx + face.dir[0],
          oy + ly + face.dir[1],
          oz + lz + face.dir[2],
        );
        if (nb === id) continue;
        if (isFullCube(nb) && !isTransparentBlock(nb)) continue;
      }
      const base = positions.length / 3;
      for (const corner of face.corners) {
        const px = corner.pos[0] === 0 ? x0 : x1;
        const py = corner.pos[1] === 0 ? y0 : y1;
        const pz = corner.pos[2] === 0 ? z0 : z1;
        positions.push(lx + px, ly + py, lz + pz);
        normals.push(face.dir[0], face.dir[1], face.dir[2]);
        const fracOf = (a: UvAxis, flag: 0 | 1): number => {
          const world01 = flag === 0 ? (a.flip ? hi[a.axis] : lo[a.axis])
                                     : (a.flip ? lo[a.axis] : hi[a.axis]);
          return a.flip ? 1 - world01 : world01;
        };
        const uf = fracOf(axes.u, corner.uv[0]);
        const vf = fracOf(axes.v, corner.uv[1]);
        uvs.push(
          col / n + inset + uf * (1 / n - 2 * inset),
          1 - (row + 1) / n + inset + vf * (1 / n - 2 * inset),
        );
      }
      indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
    }
  };

  /** Plano vertical fino (2 triângulos) com o tile INTEIRO (UV 0..1), varrendo
   *  a célula em Y (0..1) e a diagonal XZ de (x0,z0) a (x1,z1). Emitido dos DOIS
   *  lados (verso com winding invertido + normal negada) pra aparecer de
   *  qualquer ângulo com material FrontSide. Base do sprite em cruz das flores
   *  (duas lâminas a 90° na diagonal, estilo Minecraft). */
  const emitCrossPlane = (
    lx: number, ly: number, lz: number, tile: number,
    x0: number, z0: number, x1: number, z1: number,
  ): void => {
    const col = tile % n;
    const row = (tile / n) | 0;
    const u0 = col / n + inset;
    const u1 = (col + 1) / n - inset;
    const v0 = 1 - (row + 1) / n + inset;
    const v1 = 1 - row / n - inset;
    // cantos: base-esq, base-dir, topo-dir, topo-esq
    const corners: readonly (readonly [number, number, number])[] = [
      [lx + x0, ly, lz + z0],
      [lx + x1, ly, lz + z1],
      [lx + x1, ly + 1, lz + z1],
      [lx + x0, ly + 1, lz + z0],
    ];
    const cu = [u0, u1, u1, u0] as const;
    const cv = [v0, v0, v1, v1] as const;
    // normal horizontal perpendicular à diagonal (o Lambert precisa iluminar)
    let nx = z1 - z0;
    let nz = -(x1 - x0);
    const len = Math.hypot(nx, nz) || 1;
    nx /= len;
    nz /= len;
    for (const sign of [1, -1] as const) {
      const base = positions.length / 3;
      for (let i = 0; i < 4; i++) {
        const c = corners[i]!;
        positions.push(c[0], c[1], c[2]);
        normals.push(nx * sign, 0, nz * sign);
        uvs.push(cu[i]!, cv[i]!);
      }
      if (sign > 0) indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
      else indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
    }
  };

  /** Cerca conecta neste vizinho? Outra cerca ou qualquer cubo cheio. */
  const cercaConecta = (wx: number, wy: number, wz: number): boolean => {
    const nb = getBlock(world, wx, wy, wz);
    return nb === BlockId.Cerca || isFullCube(nb);
  };

  /** Geometria das formas não-cubo (cp23). true = era forma, célula emitida. */
  const emitShape = (id: number, lx: number, ly: number, lz: number): boolean => {
    const wx = ox + lx;
    const wy = oy + ly;
    const wz = oz + lz;
    switch (id) {
      case BlockId.Cerca: {
        // poste central + travessas (2 alturas) até cada vizinho conectável
        emitBox(lx, ly, lz, id, TILE.cerca, 6 * P, 0, 6 * P, 10 * P, 1, 10 * P);
        const rails = (
          xa: number, za: number, xb: number, zb: number,
        ): void => {
          emitBox(lx, ly, lz, id, TILE.cerca, xa, 12 * P, za, xb, 15 * P, zb);
          emitBox(lx, ly, lz, id, TILE.cerca, xa, 6 * P, za, xb, 9 * P, zb);
        };
        if (cercaConecta(wx - 1, wy, wz)) rails(0, 7 * P, 6 * P, 9 * P);
        if (cercaConecta(wx + 1, wy, wz)) rails(10 * P, 7 * P, 1, 9 * P);
        if (cercaConecta(wx, wy, wz - 1)) rails(7 * P, 0, 9 * P, 6 * P);
        if (cercaConecta(wx, wy, wz + 1)) rails(7 * P, 10 * P, 9 * P, 1);
        return true;
      }
      case BlockId.PortaXFechada:
      case BlockId.PortaXAberta:
      case BlockId.PortaZFechada:
      case BlockId.PortaZAberta:
      case BlockId.PortaXFechadaR:
      case BlockId.PortaXAbertaR:
      case BlockId.PortaZFechadaR:
      case BlockId.PortaZAbertaR: {
        // metade de cima se reconhece pelo vizinho de baixo com o MESMO id
        const tile =
          getBlock(world, wx, wy - 1, wz) === id ? TILE.portaCima : TILE.portaBaixo;
        // Lâmina fina na BORDA da célula (não centrada), pivota 90° na aresta
        // vertical do canto = DOBRADIÇA (backlog 2026-07-17). FECHADA: varre o
        // vão todo, encostada na face do eixo que BLOQUEIA (idêntica nas 2
        // dobradiças). ABERTA: dobrada contra a parede do flanco — na aresta
        // BAIXA (base) ou ALTA (variante R, dobradiça oposta) do flanco. Assim
        // 2 portas lado a lado abrem pra lados opostos (porta dupla, 2026-07-20).
        const eixoX = portaEixoX(id); // bloqueia X ⇒ flanco varre Z
        if (!isPortaAberta(id)) {
          if (eixoX) emitBox(lx, ly, lz, id, tile, 0, 0, 0, 2 * P, 1, 1);
          else emitBox(lx, ly, lz, id, tile, 0, 0, 0, 1, 1, 2 * P);
        } else {
          const c = portaHingeAlta(id) ? 1 - 2 * P : 0; // borda do flanco: alta ou baixa
          if (eixoX) emitBox(lx, ly, lz, id, tile, 0, 0, c, 1, 1, c + 2 * P);
          else emitBox(lx, ly, lz, id, tile, c, 0, 0, c + 2 * P, 1, 1);
        }
        return true;
      }
      case BlockId.Tocha: {
        emitBox(lx, ly, lz, id, TILE.tocha, 7 * P, 0, 7 * P, 9 * P, 10 * P, 9 * P);
        return true;
      }
      case BlockId.JanelaXFechada:
      case BlockId.JanelaXAberta:
      case BlockId.JanelaZFechada:
      case BlockId.JanelaZAberta:
      case BlockId.JanelaXFechadaR:
      case BlockId.JanelaXAbertaR:
      case BlockId.JanelaZFechadaR:
      case BlockId.JanelaZAbertaR: {
        // mesma dobradiça da porta (aresta do canto), 1 célula só. FECHADA varre
        // o vão; ABERTA dobra no flanco BAIXO (base) ou ALTO (variante R) — o
        // servidor escolhe a dobradiça pelos vizinhos (igual à porta).
        const eixoX = janelaEixoX(id);
        if (!isJanelaAberta(id)) {
          if (eixoX) emitBox(lx, ly, lz, id, TILE.janela, 0, 0, 0, 2 * P, 1, 1);
          else emitBox(lx, ly, lz, id, TILE.janela, 0, 0, 0, 1, 1, 2 * P);
        } else {
          const c = janelaHingeAlta(id) ? 1 - 2 * P : 0;
          if (eixoX) emitBox(lx, ly, lz, id, TILE.janela, 0, 0, c, 1, 1, c + 2 * P);
          else emitBox(lx, ly, lz, id, TILE.janela, c, 0, 0, c + 2 * P, 1, 1);
        }
        return true;
      }
      case BlockId.Mesa: {
        // tampo + 4 pernas nos cantos (tábuas)
        emitBox(lx, ly, lz, id, TILE.planks, 0, 12 * P, 0, 1, 14 * P, 1);
        for (const [xa, za] of [[1, 1], [13, 1], [1, 13], [13, 13]] as const) {
          emitBox(lx, ly, lz, id, TILE.planks, xa * P, 0, za * P, (xa + 2) * P, 12 * P, (za + 2) * P);
        }
        return true;
      }
      default: {
        // quadro (2026-07-19): painel fino encostado na parede de trás (lado
        // oposto da frente), mesma rotação dos móveis
        if (isQuadro(id)) {
          const [rxa, rza, rxb, rzb] = rotXZ(0, 1 * P, 2 * P, 15 * P, id - BlockId.QuadroXP);
          emitBox(lx, ly, lz, id, TILE.quadro, rxa, 1 * P, rza, rxb, 15 * P, rzb);
          return true;
        }
        // flores (2026-07-20, refeitas): duas lâminas PLANAS na diagonal da
        // célula, a 90° uma da outra (X estilo Minecraft), tile de fundo
        // TRANSPARENTE (cutout). Cada lâmina aparece dos 2 lados (emitCrossPlane
        // emite o verso). Atravessável.
        if (isFlor(id)) {
          const tile = TILE.florVermelha + (id - BlockId.FlorVermelha);
          emitCrossPlane(lx, ly, lz, tile, 0, 0, 1, 1); // diagonal ↘
          emitCrossPlane(lx, ly, lz, tile, 0, 1, 1, 0); // anti-diagonal ↗
          return true;
        }
        // móveis direcionais (2026-07-19): forma definida DE FRENTE PRA +x,
        // girada k×90° pro sufixo do id (XP=0, ZP=1, XN=2, ZN=3)
        // cama (2026-07-20): 2 células horizontais. Cabeceira (com travesseiro)
        // ou pé, decidido pelo vizinho no eixo. Forma DE FRENTE PRA +x, girada k.
        if (isCama(id)) {
          const k = id - BlockId.CamaXP;
          const { dx, dz } = camaHeadDir(id);
          // é o PÉ se a cabeceira (mesma cama) está no vizinho da direção dela
          const ehPe = getBlock(world, ox + lx + dx, oy + ly, oz + lz + dz) === id;
          const boxes: readonly (readonly [number, number, number, number, number, number, number])[] =
            ehPe
              ? [
                  // pé: estrado + colchão, sem travesseiro
                  [TILE.planks, 0, 0, 0, 1, 3 * P, 1],
                  [TILE.colchao, 0, 3 * P, 1 * P, 1, 7 * P, 15 * P],
                ]
              : [
                  // cabeceira: estrado + colchão + travesseiro no fundo (−x)
                  [TILE.planks, 0, 0, 0, 1, 3 * P, 1],
                  [TILE.colchao, 0, 3 * P, 1 * P, 1, 7 * P, 15 * P],
                  [TILE.woolWhite, 1 * P, 7 * P, 3 * P, 6 * P, 9 * P, 13 * P],
                ];
          for (const [tile, xa, ya, za, xb, yb, zb] of boxes) {
            const [rxa, rza, rxb, rzb] = rotXZ(xa, za, xb, zb, k);
            emitBox(lx, ly, lz, id, tile, rxa, ya, rza, rxb, yb, rzb);
          }
          return true;
        }
        // móveis direcionais (2026-07-19): forma definida DE FRENTE PRA +x,
        // girada k×90° pro sufixo do id (XP=0, ZP=1, XN=2, ZN=3)
        if (isCadeira(id) || isSofa(id)) {
          const k = isCadeira(id) ? id - BlockId.CadeiraXP : id - BlockId.SofaXP;
          const boxes: readonly (readonly [number, number, number, number, number, number, number])[] =
            isCadeira(id)
              ? [
                  // assento, 4 pernas, encosto no lado −x (costas)
                  [TILE.planks, 3 * P, 6 * P, 3 * P, 13 * P, 8 * P, 13 * P],
                  [TILE.planks, 3 * P, 0, 3 * P, 5 * P, 6 * P, 5 * P],
                  [TILE.planks, 11 * P, 0, 3 * P, 13 * P, 6 * P, 5 * P],
                  [TILE.planks, 3 * P, 0, 11 * P, 5 * P, 6 * P, 13 * P],
                  [TILE.planks, 11 * P, 0, 11 * P, 13 * P, 6 * P, 13 * P],
                  [TILE.planks, 3 * P, 8 * P, 3 * P, 5 * P, 1, 13 * P],
                ]
              : [
                  // assento cheio, encosto no −x, braços nas laterais z
                  [TILE.estofado, 0, 0, 0, 1, 8 * P, 1],
                  [TILE.estofado, 0, 8 * P, 0, 4 * P, 15 * P, 1],
                  [TILE.estofado, 4 * P, 8 * P, 0, 1, 12 * P, 2 * P],
                  [TILE.estofado, 4 * P, 8 * P, 14 * P, 1, 12 * P, 1],
                ];
          for (const [tile, xa, ya, za, xb, yb, zb] of boxes) {
            const [rxa, rza, rxb, rzb] = rotXZ(xa, za, xb, zb, k);
            emitBox(lx, ly, lz, id, tile, rxa, ya, rza, rxb, yb, rzb);
          }
          return true;
        }
        // tapete: lâmina de 1/16 cobrindo o chão da célula, tile da própria lã
        if (isTapete(id)) {
          emitBox(lx, ly, lz, id, TAPETE_TILES[id - BlockId.TapeteBranco]!, 0, 0, 0, 1, P, 1);
          return true;
        }
        return false;
      }
    }
  };

  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        const id = getBlock(world, ox + lx, oy + ly, oz + lz);
        if (id === BlockId.Air) continue;
        // cp23: não-cubo tem forma própria e nunca passa pelo caminho de cubo
        if (!isFullCube(id)) {
          emitShape(id, lx, ly, lz);
          continue;
        }
        const tiles = BLOCK_TILES[id];
        if (!tiles) continue;

        for (const face of FACES) {
          const neighbor = getBlock(
            world,
            ox + lx + face.dir[0],
            oy + ly + face.dir[1],
            oz + lz + face.dir[2],
          );
          // cp18: face aparece se o vizinho é ar OU transparente de OUTRO tipo
          // (vidro encostado em folha: cada um mostra a sua face — a face oposta
          // do outro é backface e some por culling, sem z-fight). Vizinho opaco
          // esconde; MESMO transparente encostado funde (vidro contínuo).
          // cp23: não-cubo (cerca/porta/tocha) NUNCA oclui o vizinho.
          if (neighbor !== BlockId.Air) {
            if (!isFullCube(neighbor)) {
              // vizinho é forma: minha face aparece
            } else if (!isTransparentBlock(neighbor) || neighbor === id) {
              continue;
            }
          }

          const tile =
            face.dir[1] === 1 ? tiles.top : face.dir[1] === -1 ? tiles.bottom : tiles.side;
          const col = tile % n;
          const row = (tile / n) | 0;
          const u0 = col / n + inset;
          const u1 = (col + 1) / n - inset;
          const v0 = 1 - (row + 1) / n + inset;
          const v1 = 1 - row / n - inset;

          const base = positions.length / 3;
          for (const corner of face.corners) {
            positions.push(lx + corner.pos[0], ly + corner.pos[1], lz + corner.pos[2]);
            normals.push(face.dir[0], face.dir[1], face.dir[2]);
            uvs.push(corner.uv[0] === 1 ? u1 : u0, corner.uv[1] === 1 ? v1 : v0);
          }
          indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
        }
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint32Array(indices),
  };
}
