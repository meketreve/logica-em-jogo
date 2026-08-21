import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { TICKS_POR_GRAMA } from "./rules";
import { GameSession } from "./session";
import { getBlock, setBlock } from "./world";

/**
 * Grama PELO TICK DA SESSION (2026-08-21). O `grama.test.ts` prova a regra pura
 * — "um passo por chamada" — e continua valendo: o freio pedido pelo usuário
 * ("deixa mais demorado pra grama espalhar") NÃO está na `grassRule`, está em
 * quem decide de quantos em quantos ticks ela roda.
 *
 * ⚠️ O que estes testes existem pra proteger é a armadilha do desenho: o laço do
 * tick DESCARTA a célula cuja regra devolve `null`, e só quem mexe ao lado suja
 * uma célula. Se a grama fora da vez não voltasse pra fila, a onda morreria no
 * primeiro tick de espera em vez de ficar mais lenta.
 */

const DIMS = { x: 1, z: 1, y: 1 };
const send = (): void => {};

/** Sessão com uma faixa: grama em `x=0`, terra exposta de `x=1` em diante. */
function faixa(gramaPorPasso?: number): { s: GameSession; y: number; z: number } {
  const s = new GameSession(send, {
    dims: DIMS,
    seed: 7,
    codigo: "sala",
    ...(gramaPorPasso === undefined ? {} : { gramaPorPasso }),
  });
  const y = 2;
  const z = 0;
  for (let x = 0; x < 8; x++) {
    setBlock(s.world, x, y, z, x === 0 ? BlockId.Grass : BlockId.Dirt);
    setBlock(s.world, x, y + 1, z, BlockId.Air);
  }
  // acorda a fronteira: é o gesto que a regra de vizinhança espera (alguém
  // mexeu do lado). `applyBlock` é o que suja a célula e os vizinhos dela.
  s.applyBlock(0, y, z, BlockId.Grass);
  return { s, y, z };
}

const correr = (s: GameSession, ticks: number): void => {
  for (let t = 0; t < ticks; t++) s.tick();
};

describe("grama espalha DEVAGAR (freio no tick da session)", () => {
  it(`um passo a cada ${TICKS_POR_GRAMA} ticks — não um por tick`, () => {
    const { s, y, z } = faixa();
    // um tick a menos que o período: a fronteira ainda não pode ter andado
    correr(s, TICKS_POR_GRAMA - 1);
    expect(getBlock(s.world, 1, y, z)).toBe(BlockId.Dirt);
    // fechado o período, anda UMA célula — e só uma
    correr(s, 1);
    expect(getBlock(s.world, 1, y, z)).toBe(BlockId.Grass);
    expect(getBlock(s.world, 2, y, z)).toBe(BlockId.Dirt);
  });

  it("a onda NÃO morre na espera: passos seguidos continuam andando", () => {
    const { s, y, z } = faixa();
    // esta é a asserção que pega o erro de esquecer o `dirty.add` da grama fora
    // da vez: com a célula descartada, o passo 1 aconteceria e o 2 nunca mais
    correr(s, TICKS_POR_GRAMA * 3);
    expect(getBlock(s.world, 1, y, z)).toBe(BlockId.Grass);
    expect(getBlock(s.world, 2, y, z)).toBe(BlockId.Grass);
    expect(getBlock(s.world, 3, y, z)).toBe(BlockId.Grass);
    expect(getBlock(s.world, 4, y, z)).toBe(BlockId.Dirt);
  });

  it("`gramaPorPasso: 1` devolve o ritmo antigo (um passo por tick)", () => {
    const { s, y, z } = faixa(1);
    correr(s, 3);
    expect(getBlock(s.world, 1, y, z)).toBe(BlockId.Grass);
    expect(getBlock(s.world, 2, y, z)).toBe(BlockId.Grass);
    expect(getBlock(s.world, 3, y, z)).toBe(BlockId.Grass);
  });

  it("o freio é SÓ da grama: a areia continua caindo um por tick", () => {
    const { s, y, z } = faixa();
    // areia flutuando 3 acima do piso — a coluna entre ela e o chão tem de
    // estar VAZIA (o gen enche o resto do mundo; sem limpar, ela já nasce apoiada)
    for (let dy = 1; dy <= 4; dy++) setBlock(s.world, 5, y + dy, z, BlockId.Air);
    setBlock(s.world, 5, y + 4, z, BlockId.Sand);
    s.applyBlock(5, y + 4, z, BlockId.Sand);
    correr(s, 3);
    expect(getBlock(s.world, 5, y + 4, z)).toBe(BlockId.Air);
    expect(getBlock(s.world, 5, y + 1, z)).toBe(BlockId.Sand);
  });
});
