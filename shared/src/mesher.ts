import { BlockId, isTransparentBlock } from "./blocks";
import { CHUNK_SIZE } from "./constants";
import { type World, getBlock } from "./world";

/**
 * Culled mesher: função PURA (bytes do mundo → geometria). Só emite faces que
 * encostam em ar (corta >90% das faces). Posições locais ao chunk — o cliente
 * posiciona o mesh na origem do chunk. Sem dependência de three.js/navegador,
 * então dá pra mover pra Worker depois sem mexer aqui.
 */

/** Layout do texture atlas. O cliente pinta a textura seguindo ESTE layout. */
export const ATLAS = { tilesPerRow: 8, tilePx: 16 } as const;

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
} as const;

interface FaceTiles {
  readonly top: number;
  readonly bottom: number;
  readonly side: number;
}

/** Bloco com o mesmo tile nas 6 faces. */
const uniform = (tile: number): FaceTiles => ({ top: tile, bottom: tile, side: tile });

const BLOCK_TILES: Readonly<Record<number, FaceTiles>> = {
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
};

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

  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        const id = getBlock(world, ox + lx, oy + ly, oz + lz);
        if (id === BlockId.Air) continue;
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
          if (neighbor !== BlockId.Air) {
            if (!isTransparentBlock(neighbor) || neighbor === id) continue;
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
