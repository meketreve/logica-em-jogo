import { BlockId, isFullCube, isTapete, isTransparentBlock } from "./blocks";
import { CHUNK_SIZE } from "./constants";
import { type World, getBlock } from "./world";

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
  [BlockId.Tocha]: uniform(TILE.tocha),
};

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

export interface ChunkGeometry {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint32Array;
}

export function meshChunk(world: World, cx: number, cy: number, cz: number): ChunkGeometry {
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
      case BlockId.PortaZAberta: {
        // metade de cima se reconhece pelo vizinho de baixo com o MESMO id
        const tile =
          getBlock(world, wx, wy - 1, wz) === id ? TILE.portaCima : TILE.portaBaixo;
        // lâmina fina no eixo que a porta BLOQUEIA. Painel na BORDA da célula
        // (não centrado): fechada e aberta compartilham a aresta vertical do
        // canto (0,·,0) = DOBRADIÇA — abrir pivota 90° na ponta, como porta de
        // verdade, em vez de girar no próprio eixo (backlog 2026-07-17).
        const finaEmX = id === BlockId.PortaXFechada || id === BlockId.PortaZAberta;
        if (finaEmX) emitBox(lx, ly, lz, id, tile, 0, 0, 0, 2 * P, 1, 1);
        else emitBox(lx, ly, lz, id, tile, 0, 0, 0, 1, 1, 2 * P);
        return true;
      }
      case BlockId.Tocha: {
        emitBox(lx, ly, lz, id, TILE.tocha, 7 * P, 0, 7 * P, 9 * P, 10 * P, 9 * P);
        return true;
      }
      default: {
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
