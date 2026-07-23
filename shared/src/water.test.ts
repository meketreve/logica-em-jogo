import { describe, expect, it } from "vitest";
import { BlockId, aguaNivel } from "./blocks";
import { ruleFor, waterRule } from "./rules";
import { type World, createWorld, getBlock, setBlock } from "./world";

const DIMS = { x: 1, z: 1, y: 1 }; // 1 chunk = 16³, coords 0..15

/** Autômato celular síncrono: coleta as mudanças de TODA célula com regra
 *  (usando o mundo pré-tick) e aplica depois. Espelha o tick do servidor
 *  (fila de vizinhança) sem depender da propagação de "dirty" — força-bruta
 *  num mundo pequeno. Roda N ticks pra deixar o fluido ASSENTAR. */
function simular(world: World, ticks: number): void {
  const S = 16;
  for (let t = 0; t < ticks; t++) {
    const changes: { x: number; y: number; z: number; blockId: number }[] = [];
    for (let y = 0; y < S; y++) {
      for (let z = 0; z < S; z++) {
        for (let x = 0; x < S; x++) {
          const rule = ruleFor(getBlock(world, x, y, z));
          if (!rule) continue;
          const cs = rule(world, x, y, z);
          if (cs) changes.push(...cs);
        }
      }
    }
    for (const c of changes) setBlock(world, c.x, c.y, c.z, c.blockId);
  }
}

/** Piso sólido cobrindo TODA a camada y (plano cheio). A água corre/espalha em
 *  cima sem beira artificial — um canal de 1 bloco de largura teria queda nas
 *  laterais e ativaria a priorização de fluxo (a água escorreria pros lados). */
function pisoPlano(world: World, y: number): void {
  for (let z = 0; z < 16; z++) {
    for (let x = 0; x < 16; x++) setBlock(world, x, y, z, BlockId.Stone);
  }
}

describe("água fluida (waterRule — autômato celular na regra de ouro)", () => {
  it("todos os 8 ids (fonte + 7 níveis) usam o waterRule", () => {
    for (let id = BlockId.Agua; id <= BlockId.AguaFluida7; id++) {
      expect(ruleFor(id)).toBe(waterRule);
    }
    expect(ruleFor(BlockId.Stone)).toBeUndefined();
  });

  it("fonte espalha na horizontal decrementando o nível (alcance 7)", () => {
    const world = createWorld(DIMS);
    pisoPlano(world, 9); // plano cheio: sem queda perto → poça (espalha em disco)
    setBlock(world, 7, 10, 7, BlockId.Agua); // fonte no meio
    simular(world, 30);
    expect(getBlock(world, 7, 10, 7)).toBe(BlockId.Agua); // fonte permanece
    // distância d da fonte → nível 8−d (d=1→7 … d=7→1, d=8 seca)
    expect(aguaNivel(getBlock(world, 8, 10, 7))).toBe(7); // 1 célula
    expect(aguaNivel(getBlock(world, 11, 10, 7))).toBe(4); // 4 células
    expect(aguaNivel(getBlock(world, 14, 10, 7))).toBe(1); // 7 células (ponta)
    expect(getBlock(world, 15, 10, 7)).toBe(BlockId.Air); // 8 células: seco
  });

  it("queda PREFERÍVEL: fonte no AR despenca em coluna — sem disco flutuante", () => {
    const world = createWorld(DIMS);
    setBlock(world, 7, 10, 7, BlockId.Agua); // fonte suspensa no ar (nada por perto)
    simular(world, 30);
    // sem chão sólido embaixo → NÃO espalha lateral (nenhum disco de água no ar)
    expect(getBlock(world, 8, 10, 7)).toBe(BlockId.Air);
    expect(getBlock(world, 6, 10, 7)).toBe(BlockId.Air);
    // a coluna abaixo da fonte encheu (queda reta)
    expect(aguaNivel(getBlock(world, 7, 9, 7))).toBe(7);
    expect(aguaNivel(getBlock(world, 7, 5, 7))).toBe(7);
  });

  it("cachoeira: ao pousar no piso, o pé espalha lateral", () => {
    const world = createWorld(DIMS);
    pisoPlano(world, 5);
    setBlock(world, 7, 10, 7, BlockId.Agua);
    simular(world, 30);
    expect(aguaNivel(getBlock(world, 7, 6, 7))).toBe(7); // coluna cheia até acima do piso
    expect(aguaNivel(getBlock(world, 8, 6, 7))).toBeGreaterThan(0); // pé espalha
    expect(aguaNivel(getBlock(world, 6, 6, 7))).toBeGreaterThan(0);
  });

  it("remover a fonte SECA todo o fluxo (recomputo baixa o nível a 0)", () => {
    const world = createWorld(DIMS);
    pisoPlano(world, 9);
    setBlock(world, 7, 10, 7, BlockId.Agua);
    simular(world, 30); // enche a poça
    expect(aguaNivel(getBlock(world, 11, 10, 7))).toBeGreaterThan(0);
    setBlock(world, 7, 10, 7, BlockId.Air); // tira a fonte
    simular(world, 30);
    for (let x = 0; x <= 15; x++) {
      expect(getBlock(world, x, 10, 7)).toBe(BlockId.Air); // tudo seco
    }
  });

  it("água infinita: 2 fontes com 1 célula de chão no meio geram fonte nova", () => {
    const world = createWorld(DIMS);
    pisoPlano(world, 9); // chão sólido embaixo
    setBlock(world, 6, 10, 7, BlockId.Agua);
    setBlock(world, 8, 10, 7, BlockId.Agua);
    // meio (7,10,7) começa vazio
    expect(getBlock(world, 7, 10, 7)).toBe(BlockId.Air);
    simular(world, 30);
    expect(getBlock(world, 7, 10, 7)).toBe(BlockId.Agua); // virou FONTE
  });

  it("prioriza o desnível: escorre pro buraco mais próximo, NÃO dá a volta", () => {
    const world = createWorld(DIMS);
    pisoPlano(world, 9);
    setBlock(world, 10, 9, 7, BlockId.Air); // buraco no piso → (10,10,7) é uma queda
    setBlock(world, 7, 10, 7, BlockId.Agua); // fonte 3 células a OESTE do buraco
    simular(world, 30);
    // fluiu pra LESTE, rumo ao buraco, e despencou nele
    expect(aguaNivel(getBlock(world, 8, 10, 7))).toBeGreaterThan(0);
    expect(aguaNivel(getBlock(world, 10, 8, 7))).toBeGreaterThan(0); // caiu no buraco
    // NÃO lateralizou: a oeste da fonte E no eixo perpendicular fica SECO
    expect(getBlock(world, 5, 10, 7)).toBe(BlockId.Air);
    expect(getBlock(world, 7, 10, 8)).toBe(BlockId.Air);
  });

  it("sem desnível no alcance → espalha nos 4 lados (poça, não fio)", () => {
    const world = createWorld(DIMS);
    pisoPlano(world, 9);
    setBlock(world, 7, 10, 7, BlockId.Agua);
    simular(world, 4);
    expect(aguaNivel(getBlock(world, 8, 10, 7))).toBeGreaterThan(0);
    expect(aguaNivel(getBlock(world, 6, 10, 7))).toBeGreaterThan(0);
    expect(aguaNivel(getBlock(world, 7, 10, 8))).toBeGreaterThan(0);
    expect(aguaNivel(getBlock(world, 7, 10, 6))).toBeGreaterThan(0);
  });
});
