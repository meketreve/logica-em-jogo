import { BlockId, isFullCube } from "./blocks";
import { type World, getBlock } from "./world";

/**
 * Sistema GENÉRICO de atualização de bloco por vizinhança — a REGRA DE OURO
 * da arquitetura: "bloco muda, avisa vizinhos, propaga no tick do servidor".
 * Areia usa 1 vizinho/1 regra hoje; circuitos lógicos (9º ano) usarão
 * N vizinhos/N regras na MESMA engrenagem. Nada aqui é código especial de areia:
 * pra criar comportamento novo, escreve-se uma regra e registra-se em RULES.
 */

export interface BlockChange {
  x: number;
  y: number;
  z: number;
  blockId: number;
}

/**
 * Regra de um tipo de bloco: chamada no tick do servidor quando a célula
 * (x,y,z) está "suja" (ela ou um vizinho mudou). SÓ LÊ o mundo — devolve as
 * mudanças desejadas (a sessão aplica e propaga) ou null se nada a fazer.
 */
export type BlockRule = (
  world: World,
  x: number,
  y: number,
  z: number,
) => BlockChange[] | null;

/** Queda: se a célula de baixo é ar, o bloco (o que ESTIVER na célula) desce 1
 *  por tick. Genérica — serve areia, cascalho e qualquer futuro "bloco que cai". */
export const fallingRule: BlockRule = (world, x, y, z) => {
  if (y === 0) return null; // fundo do mundo (fora = Air, mas não há onde cair)
  if (getBlock(world, x, y - 1, z) !== BlockId.Air) return null;
  return [
    // materializa embaixo ANTES de limpar a origem: o transiente (1 frame no
    // cliente) fica duplicado e invisível; na ordem inversa piscaria um buraco
    { x, y: y - 1, z, blockId: getBlock(world, x, y, z) },
    { x, y, z, blockId: BlockId.Air },
  ];
};

/** Porta (cp23): metade sem o PAR (mesmo id logo acima OU logo abaixo)
 *  evapora — quebrar uma célula derruba a outra no tick seguinte, sem
 *  código especial no break_block. */
export const doorRule: BlockRule = (world, x, y, z) => {
  const id = getBlock(world, x, y, z);
  if (getBlock(world, x, y + 1, z) === id) return null;
  if (getBlock(world, x, y - 1, z) === id) return null;
  return [{ x, y, z, blockId: BlockId.Air }];
};

/** Tocha (cp23): precisa de cubo CHEIO embaixo; perdeu o suporte, some. */
export const torchRule: BlockRule = (world, x, y, z) => {
  if (isFullCube(getBlock(world, x, y - 1, z))) return null;
  return [{ x, y, z, blockId: BlockId.Air }];
};

const RULES: ReadonlyMap<number, BlockRule> = new Map([
  [BlockId.Sand, fallingRule],
  [BlockId.Gravel, fallingRule],
  [BlockId.PortaXFechada, doorRule],
  [BlockId.PortaXAberta, doorRule],
  [BlockId.PortaZFechada, doorRule],
  [BlockId.PortaZAberta, doorRule],
  [BlockId.Tocha, torchRule],
]);

/** Regra registrada pro tipo de bloco, se houver. */
export function ruleFor(blockId: number): BlockRule | undefined {
  return RULES.get(blockId);
}
