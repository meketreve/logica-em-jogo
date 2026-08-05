import { BlockId, isAgua, isFullCube } from "./blocks";
import { blockSelectionBox } from "./mesher";
import { PLAYER } from "./physics";
import { type World, getBlock } from "./world";

/**
 * Raycast de voxel (DDA de Amanatides-Woo): anda célula a célula do grid até
 * achar bloco sólido. Função PURA em /shared — o cliente usa pra MIRAR
 * (só visual); o servidor pode reusar depois pra validar linha de visão.
 *
 * NÃO-cubos (porta/cerca/tocha/flor/tapete/móveis) usam a hitbox REAL da forma
 * (`blockSelectionBox`, a mesma do contorno da mira): o raio testa a AABB DENTRO
 * da célula — passa reto pelo vão (buraco da cerca, porta aberta) e só acerta a
 * parte cheia. Água é pulada de vez (líquido invisível pra mira).
 */

export interface RayHit {
  /** Bloco sólido atingido (coordenadas inteiras de mundo). */
  x: number;
  y: number;
  z: number;
  /**
   * Normal da face por onde o raio ENTROU (aponta pra fora do bloco).
   * Célula onde colocar bloco = hit + normal. Origem dentro de bloco
   * sólido devolve normal (0,0,0) — não há face de entrada.
   */
  nx: number;
  ny: number;
  nz: number;
}

/**
 * Ray-vs-AABB (slab test) contra a hitbox de um NÃO-cubo, DENTRO da célula
 * (cx,cy,cz). `box` = [x0,y0,z0,x1,y1,z1] em coords locais 0..1 (blockSelectionBox).
 * Devolve a normal da face de entrada, ou null se o raio erra o sub-box (segue
 * marchando). Origem dentro do sub-box → normal (0,0,0).
 */
function subBoxNormal(
  ox: number, oy: number, oz: number,
  dx: number, dy: number, dz: number,
  cx: number, cy: number, cz: number,
  box: readonly [number, number, number, number, number, number],
  maxDist: number,
): readonly [number, number, number] | null {
  let tmin = 0; // origem conta como t=0 (dentro do box = normal zero)
  let tmax = maxDist;
  let axis = -1; // eixo da face de ENTRADA (-1 = origem dentro do box)

  { // eixo X
    const lo = cx + box[0], hi = cx + box[3];
    if (dx !== 0) {
      const inv = 1 / dx;
      let tN = (lo - ox) * inv, tF = (hi - ox) * inv;
      if (tN > tF) { const s = tN; tN = tF; tF = s; }
      if (tN > tmin) { tmin = tN; axis = 0; }
      if (tF < tmax) tmax = tF;
      if (tmin > tmax) return null;
    } else if (ox < lo || ox > hi) return null; // paralelo e fora do slab
  }
  { // eixo Y
    const lo = cy + box[1], hi = cy + box[4];
    if (dy !== 0) {
      const inv = 1 / dy;
      let tN = (lo - oy) * inv, tF = (hi - oy) * inv;
      if (tN > tF) { const s = tN; tN = tF; tF = s; }
      if (tN > tmin) { tmin = tN; axis = 1; }
      if (tF < tmax) tmax = tF;
      if (tmin > tmax) return null;
    } else if (oy < lo || oy > hi) return null;
  }
  { // eixo Z
    const lo = cz + box[2], hi = cz + box[5];
    if (dz !== 0) {
      const inv = 1 / dz;
      let tN = (lo - oz) * inv, tF = (hi - oz) * inv;
      if (tN > tF) { const s = tN; tN = tF; tF = s; }
      if (tN > tmin) { tmin = tN; axis = 2; }
      if (tF < tmax) tmax = tF;
      if (tmin > tmax) return null;
    } else if (oz < lo || oz > hi) return null;
  }

  if (tmin > maxDist) return null;
  if (axis === 0) return [dx > 0 ? -1 : 1, 0, 0];
  if (axis === 1) return [0, dy > 0 ? -1 : 1, 0];
  if (axis === 2) return [0, 0, dz > 0 ? -1 : 1];
  return [0, 0, 0]; // origem dentro do sub-box
}

/** Um jogador mirável: id de cliente + a posição dos PÉS (a mesma que viaja no
 *  `player_moved`). A caixa é a AABB da física — a mesma que colide. */
export interface AlvoJogador {
  id: number;
  x: number;
  y: number;
  z: number;
}

/**
 * §🍖 F7: mira em JOGADOR. Ray-vs-AABB contra a caixa de cada um, devolvendo o
 * MAIS PRÓXIMO dentro do alcance (a distância volta junto pra quem chama poder
 * comparar com o bloco mirado — quem estiver na frente ganha o clique).
 *
 * Função pura como o resto do módulo: o cliente usa pra saber que o soco tem
 * alvo, e o SERVIDOR não depende dela — lá a conferência é de distância entre
 * jogadores, porque a direção do olhar chega a 10 Hz e mentiria.
 */
export function raycastJogador(
  ox: number, oy: number, oz: number,
  dx: number, dy: number, dz: number,
  alvos: Iterable<AlvoJogador>,
  maxDist: number,
): { id: number; dist: number } | null {
  const len = Math.hypot(dx, dy, dz);
  if (len === 0 || !Number.isFinite(len)) return null;
  dx /= len;
  dy /= len;
  dz /= len;
  const half = PLAYER.width / 2;
  let melhor: { id: number; dist: number } | null = null;
  for (const a of alvos) {
    const t = rayAabb(
      ox, oy, oz, dx, dy, dz,
      a.x - half, a.y, a.z - half,
      a.x + half, a.y + PLAYER.height, a.z + half,
      maxDist,
    );
    if (t === null) continue;
    if (!melhor || t < melhor.dist) melhor = { id: a.id, dist: t };
  }
  return melhor;
}

/** Slab test contra uma AABB de MUNDO. Devolve a distância de entrada (0 se a
 *  origem está dentro), ou null se erra / passa do alcance. */
function rayAabb(
  ox: number, oy: number, oz: number,
  dx: number, dy: number, dz: number,
  x0: number, y0: number, z0: number,
  x1: number, y1: number, z1: number,
  maxDist: number,
): number | null {
  let tmin = 0;
  let tmax = maxDist;
  const eixos: readonly [number, number, number, number][] = [
    [ox, dx, x0, x1],
    [oy, dy, y0, y1],
    [oz, dz, z0, z1],
  ];
  for (const [o, d, lo, hi] of eixos) {
    if (d === 0) {
      if (o < lo || o > hi) return null; // paralelo e fora do slab
      continue;
    }
    const inv = 1 / d;
    let tN = (lo - o) * inv;
    let tF = (hi - o) * inv;
    if (tN > tF) { const s = tN; tN = tF; tF = s; }
    if (tN > tmin) tmin = tN;
    if (tF < tmax) tmax = tF;
    if (tmin > tmax) return null;
  }
  return tmin > maxDist ? null : tmin;
}

export function raycastBlock(
  world: World,
  ox: number,
  oy: number,
  oz: number,
  dx: number,
  dy: number,
  dz: number,
  maxDist: number,
  /** Balde VAZIO na mão: a mira PARA na água (pra recolher a fonte). Fora isso
   *  a água é invisível pra mira (atravessa e para no sólido atrás). */
  pararNaAgua = false,
): RayHit | null {
  const len = Math.hypot(dx, dy, dz);
  if (len === 0 || !Number.isFinite(len)) return null;
  dx /= len;
  dy /= len;
  dz /= len;

  let x = Math.floor(ox);
  let y = Math.floor(oy);
  let z = Math.floor(oz);

  const stepX = dx > 0 ? 1 : -1;
  const stepY = dy > 0 ? 1 : -1;
  const stepZ = dz > 0 ? 1 : -1;

  // t que o raio gasta pra atravessar 1 célula em cada eixo
  const tDeltaX = dx !== 0 ? Math.abs(1 / dx) : Infinity;
  const tDeltaY = dy !== 0 ? Math.abs(1 / dy) : Infinity;
  const tDeltaZ = dz !== 0 ? Math.abs(1 / dz) : Infinity;

  // t até a PRIMEIRA fronteira de célula em cada eixo
  let tMaxX = dx !== 0 ? (dx > 0 ? x + 1 - ox : ox - x) * tDeltaX : Infinity;
  let tMaxY = dy !== 0 ? (dy > 0 ? y + 1 - oy : oy - y) * tDeltaY : Infinity;
  let tMaxZ = dz !== 0 ? (dz > 0 ? z + 1 - oz : oz - z) * tDeltaZ : Infinity;

  let nx = 0;
  let ny = 0;
  let nz = 0;
  let t = 0;

  while (t <= maxDist) {
    // Líquido (água) é INVISÍVEL pra mira: o raio atravessa e para no sólido
    // atrás → dá pra colocar bloco olhando através da água (decisão 2026-07-22).
    // EXCEÇÃO: balde vazio (pararNaAgua) mira a água pra recolher a fonte.
    const b = getBlock(world, x, y, z);
    if (pararNaAgua && isAgua(b)) return { x, y, z, nx, ny, nz };
    if (b !== BlockId.Air && !isAgua(b)) {
      if (isFullCube(b)) return { x, y, z, nx, ny, nz }; // cubo cheio: normal do DDA
      // não-cubo: testa a hitbox REAL da forma dentro da célula. Acertou →
      // retorna com a normal da face do sub-box; errou → segue marchando (vão).
      const n = subBoxNormal(ox, oy, oz, dx, dy, dz, x, y, z, blockSelectionBox(b), maxDist);
      if (n) return { x, y, z, nx: n[0], ny: n[1], nz: n[2] };
    }
    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      x += stepX;
      t = tMaxX;
      tMaxX += tDeltaX;
      nx = -stepX; ny = 0; nz = 0;
    } else if (tMaxY < tMaxZ) {
      y += stepY;
      t = tMaxY;
      tMaxY += tDeltaY;
      nx = 0; ny = -stepY; nz = 0;
    } else {
      z += stepZ;
      t = tMaxZ;
      tMaxZ += tDeltaZ;
      nx = 0; ny = 0; nz = -stepZ;
    }
  }
  return null;
}
