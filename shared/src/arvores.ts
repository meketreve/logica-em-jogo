import { type ArvoreTipo } from "./biomas";
import { BlockId, isTransparentBlock } from "./blocks";
import { type World, getBlock, setBlock } from "./world";

/**
 * Formas das árvores brasileiras (2026-07-20) — mutação de mundo usada SÓ pelo
 * gen (worldgen.ts). Determinístico: a variação de altura vem de `varia` [0,1)
 * (hash da coluna), nunca de Math.random. setBlock ignora fora de bounds, então
 * árvore rente ao teto do mundo é aparada sem guard extra.
 *
 * Copa nunca sobrescreve bloco sólido (só ar); tronco atravessa copa vizinha
 * (sobrescreve ar e folhas) — duas árvores coladas não se mutilam.
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

function poeTronco(world: World, x: number, y: number, z: number, id: number): void {
  const atual = getBlock(world, x, y, z);
  if (atual === BlockId.Air || isTransparentBlock(atual)) setBlock(world, x, y, z, id);
}

function poeCopa(world: World, x: number, y: number, z: number, id: number): void {
  if (getBlock(world, x, y, z) === BlockId.Air) setBlock(world, x, y, z, id);
}

/** Camada quadrada de copa (raio r em x/z) centrada em (x,z), na altura y.
 *  `cantos` = false corta os 4 cantos (copa arredondada). */
function camadaCopa(
  world: World,
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
      poeCopa(world, x + dx, y, z + dz, id);
    }
  }
}

/**
 * Planta uma árvore com a BASE do tronco em (x, yBase, z) — yBase = primeira
 * célula ACIMA do chão. `varia` em [0,1) escolhe a altura dentro da faixa da
 * espécie.
 */
export function plantarArvore(
  world: World,
  x: number,
  yBase: number,
  z: number,
  tipo: ArvoreTipo,
  varia: number,
): void {
  const tronco = TRONCO[tipo];
  const copa = COPA[tipo];
  switch (tipo) {
    case "comum": {
      // carvalho genérico: tronco 4-5, copa em bola (2 camadas largas + tampa)
      const alt = 4 + (varia < 0.5 ? 0 : 1);
      for (let i = 0; i < alt; i++) poeTronco(world, x, yBase + i, z, tronco);
      camadaCopa(world, x, yBase + alt - 2, z, 2, copa, false);
      camadaCopa(world, x, yBase + alt - 1, z, 2, copa, false);
      camadaCopa(world, x, yBase + alt, z, 1, copa, true);
      poeCopa(world, x, yBase + alt, z, copa);
      poeCopa(world, x, yBase + alt + 1, z, copa);
      break;
    }
    case "ipe": {
      // ipê: tronco 3-4, copa LARGA e achatada (guarda-chuva florido amarelo).
      // Copa começa NA altura do topo do tronco — envolve ≥1 bloco de tronco
      // (playtest 2026-07-20: copa flutuando acima do tronco ficava estranho).
      const alt = 3 + (varia < 0.5 ? 0 : 1);
      for (let i = 0; i < alt; i++) poeTronco(world, x, yBase + i, z, tronco);
      camadaCopa(world, x, yBase + alt - 1, z, 2, copa, false);
      camadaCopa(world, x, yBase + alt, z, 1, copa, true);
      poeCopa(world, x, yBase + alt, z, copa);
      poeCopa(world, x, yBase + alt + 1, z, copa);
      break;
    }
    case "araucaria": {
      // araucária: tronco ALTO e nu (6-8), copa em DISCO só no topo — a
      // silhueta de candelabro do Sul/SC
      const alt = 6 + Math.floor(varia * 3);
      for (let i = 0; i < alt; i++) poeTronco(world, x, yBase + i, z, tronco);
      camadaCopa(world, x, yBase + alt - 1, z, 2, copa, false);
      camadaCopa(world, x, yBase + alt, z, 1, copa, true);
      poeCopa(world, x, yBase + alt, z, copa);
      break;
    }
    case "paubrasil": {
      // pau-brasil: tronco 4-6, copa arredondada média
      const alt = 4 + Math.floor(varia * 3);
      for (let i = 0; i < alt; i++) poeTronco(world, x, yBase + i, z, tronco);
      camadaCopa(world, x, yBase + alt - 1, z, 2, copa, false);
      camadaCopa(world, x, yBase + alt, z, 1, copa, false);
      poeCopa(world, x, yBase + alt, z, copa);
      poeCopa(world, x, yBase + alt + 1, z, copa);
      break;
    }
  }
}

/** Mandacaru: coluna de 2-3 células de cacto (caatinga). */
export function plantarMandacaru(
  world: World,
  x: number,
  yBase: number,
  z: number,
  varia: number,
): void {
  const alt = 2 + (varia < 0.5 ? 0 : 1);
  for (let i = 0; i < alt; i++) {
    if (getBlock(world, x, yBase + i, z) !== BlockId.Air) break;
    setBlock(world, x, yBase + i, z, BlockId.Mandacaru);
  }
}
