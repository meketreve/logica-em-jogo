import { type ArvoreTipo } from "./biomas";
import { BlockId, isTransparentBlock } from "./blocks";
import { type World, getBlock, setBlock } from "./world";

/**
 * Formas das árvores brasileiras (2026-07-20) — usadas SÓ pelo gen
 * (worldgen.ts). Determinístico: a variação de altura vem de `varia` [0,1)
 * (hash da coluna), nunca de Math.random.
 *
 * REFEITO pra geração POR CHUNK (obra do streaming): `celulasDaArvore` é
 * PURA — devolve a lista de células sem tocar mundo nenhum. Cada coluna de
 * chunks re-deriva as árvores vizinhas (margem 2) e aplica SÓ a própria
 * fatia — mesma árvore, mesmos bytes, em qualquer ordem de geração.
 *
 * Política de escrita (aplicarCelula): TRONCO sobrescreve ar e folhas (duas
 * árvores coladas não se mutilam); COPA só preenche ar. Copa envolve ≥1
 * bloco de tronco (contrato do playtest, testado em arvores.test.ts).
 */

const TRONCO: Record<ArvoreTipo, number> = {
  comum: BlockId.Log,
  ipe: BlockId.LogIpe,
  araucaria: BlockId.LogAraucaria,
  paubrasil: BlockId.LogPauBrasil,
};

const COPA: Record<ArvoreTipo, number> = {
  comum: BlockId.Leaves,
  ipe: BlockId.FolhasIpe,
  araucaria: BlockId.FolhasAraucaria,
  paubrasil: BlockId.FolhasPauBrasil,
};

/** Raio máximo (em blocos, no plano XZ) que uma copa alcança do tronco —
 *  margem que a geração por chunk precisa re-derivar dos vizinhos. */
export const ARVORE_RAIO_MAX = 2;

export interface CelulaDeArvore {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly id: number;
  /** true = tronco (sobrescreve ar/folhas); false = copa (só ar). */
  readonly tronco: boolean;
}

/** Camada quadrada de copa (raio r) na altura y; `cantos=false` arredonda. */
function camada(
  out: CelulaDeArvore[],
  x: number,
  y: number,
  z: number,
  r: number,
  id: number,
  cantos: boolean,
): void {
  for (let dx = -r; dx <= r; dx++) {
    for (let dz = -r; dz <= r; dz++) {
      if (dx === 0 && dz === 0) continue; // célula do tronco
      if (!cantos && Math.abs(dx) === r && Math.abs(dz) === r) continue;
      out.push({ x: x + dx, y, z: z + dz, id, tronco: false });
    }
  }
}

/**
 * Células da árvore com BASE do tronco em (x, yBase, z) — função PURA.
 * `varia` em [0,1) escolhe a altura dentro da faixa da espécie. A ordem da
 * lista é fixa (tronco primeiro, copa por camada) — aplicar em ordem dá
 * sempre o mesmo resultado.
 */
export function celulasDaArvore(
  x: number,
  yBase: number,
  z: number,
  tipo: ArvoreTipo,
  varia: number,
): CelulaDeArvore[] {
  const tronco = TRONCO[tipo];
  const copa = COPA[tipo];
  const out: CelulaDeArvore[] = [];
  const poeTronco = (alt: number): void => {
    for (let i = 0; i < alt; i++) out.push({ x, y: yBase + i, z, id: tronco, tronco: true });
  };
  const centro = (y: number): void => {
    out.push({ x, y, z, id: copa, tronco: false });
  };
  switch (tipo) {
    case "comum": {
      // carvalho genérico: tronco 4-5, copa em bola (2 camadas largas + tampa)
      const alt = 4 + (varia < 0.5 ? 0 : 1);
      poeTronco(alt);
      camada(out, x, yBase + alt - 2, z, 2, copa, false);
      camada(out, x, yBase + alt - 1, z, 2, copa, false);
      camada(out, x, yBase + alt, z, 1, copa, true);
      centro(yBase + alt);
      centro(yBase + alt + 1);
      break;
    }
    case "ipe": {
      // ipê: tronco 3-4, copa LARGA e achatada envolvendo o topo do tronco
      const alt = 3 + (varia < 0.5 ? 0 : 1);
      poeTronco(alt);
      camada(out, x, yBase + alt - 1, z, 2, copa, false);
      camada(out, x, yBase + alt, z, 1, copa, true);
      centro(yBase + alt);
      centro(yBase + alt + 1);
      break;
    }
    case "araucaria": {
      // araucária: tronco ALTO e nu (6-8), copa em DISCO só no topo
      const alt = 6 + Math.floor(varia * 3);
      poeTronco(alt);
      camada(out, x, yBase + alt - 1, z, 2, copa, false);
      camada(out, x, yBase + alt, z, 1, copa, true);
      centro(yBase + alt);
      break;
    }
    case "paubrasil": {
      // pau-brasil: tronco 4-6, copa arredondada média
      const alt = 4 + Math.floor(varia * 3);
      poeTronco(alt);
      camada(out, x, yBase + alt - 1, z, 2, copa, false);
      camada(out, x, yBase + alt, z, 1, copa, false);
      centro(yBase + alt);
      centro(yBase + alt + 1);
      break;
    }
  }
  return out;
}

/** Células do mandacaru (coluna 2-3) — pura, mesmo contrato das árvores. */
export function celulasDoMandacaru(
  x: number,
  yBase: number,
  z: number,
  varia: number,
): CelulaDeArvore[] {
  const alt = 2 + (varia < 0.5 ? 0 : 1);
  const out: CelulaDeArvore[] = [];
  for (let i = 0; i < alt; i++) {
    out.push({ x, y: yBase + i, z, id: BlockId.Mandacaru, tronco: false });
  }
  return out;
}

/** Aplica UMA célula respeitando a política tronco/copa. setBlock ignora
 *  fora dos limites — árvore no teto do mundo é aparada sem guard. */
export function aplicarCelula(world: World, c: CelulaDeArvore): void {
  const atual = getBlock(world, c.x, c.y, c.z);
  if (atual === BlockId.Air || (c.tronco && isTransparentBlock(atual))) {
    setBlock(world, c.x, c.y, c.z, c.id);
  }
}

/** Planta a árvore inteira num mundo materializado (testes/uso direto). */
export function plantarArvore(
  world: World,
  x: number,
  yBase: number,
  z: number,
  tipo: ArvoreTipo,
  varia: number,
): void {
  for (const c of celulasDaArvore(x, yBase, z, tipo, varia)) aplicarCelula(world, c);
}

/** Mandacaru: coluna de 2-3 células (para no primeiro obstáculo). */
export function plantarMandacaru(
  world: World,
  x: number,
  yBase: number,
  z: number,
  varia: number,
): void {
  for (const c of celulasDoMandacaru(x, yBase, z, varia)) {
    if (getBlock(world, c.x, c.y, c.z) !== BlockId.Air) break;
    setBlock(world, c.x, c.y, c.z, c.id);
  }
}
