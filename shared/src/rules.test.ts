import { describe, expect, it } from "vitest";
import {
  BlockId,
  MAX_BLOCK_ID,
  PLANTAS,
  isSolidBlock,
  isTapete,
  precisaApoio,
} from "./blocks";
import { fallingRule, ruleFor, torchRule } from "./rules";
import { createWorld, setBlock } from "./world";

const DIMS = { x: 1, z: 1, y: 1 };

describe("regras de bloco (sistema genérico de vizinhança)", () => {
  it("areia e cascalho compartilham a MESMA regra de queda; o resto não tem regra", () => {
    expect(ruleFor(BlockId.Sand)).toBe(fallingRule);
    expect(ruleFor(BlockId.Gravel)).toBe(fallingRule);
    expect(ruleFor(BlockId.Air)).toBeUndefined();
    expect(ruleFor(BlockId.Grass)).toBeUndefined();
    expect(ruleFor(BlockId.Stone)).toBeUndefined();
    expect(ruleFor(BlockId.Cobblestone)).toBeUndefined();
    expect(ruleFor(BlockId.Bedrock)).toBeUndefined();
  });

  it("bloco sobre ar desce 1 PRESERVANDO o id: materializa embaixo antes de limpar a origem", () => {
    const world = createWorld(DIMS);
    setBlock(world, 5, 10, 5, BlockId.Sand);
    expect(fallingRule(world, 5, 10, 5)).toEqual([
      { x: 5, y: 9, z: 5, blockId: BlockId.Sand },
      { x: 5, y: 10, z: 5, blockId: BlockId.Air },
    ]);
    setBlock(world, 3, 10, 3, BlockId.Gravel);
    expect(fallingRule(world, 3, 10, 3)).toEqual([
      { x: 3, y: 9, z: 3, blockId: BlockId.Gravel },
      { x: 3, y: 10, z: 3, blockId: BlockId.Air },
    ]);
  });

  it("bloco sobre sólido não faz nada", () => {
    const world = createWorld(DIMS);
    setBlock(world, 5, 9, 5, BlockId.Stone);
    setBlock(world, 5, 10, 5, BlockId.Sand);
    expect(fallingRule(world, 5, 10, 5)).toBeNull();
  });

  it("bloco no fundo do mundo (y=0) não cai pro vazio", () => {
    const world = createWorld(DIMS);
    setBlock(world, 5, 0, 5, BlockId.Sand);
    expect(fallingRule(world, 5, 0, 5)).toBeNull();
  });

  it("tapete (12 cores): atravessável, precisa de apoio e evapora sem cubo embaixo", () => {
    for (let id = BlockId.TapeteBranco; id <= BlockId.TapeteMarrom; id++) {
      expect(isTapete(id)).toBe(true);
      expect(isSolidBlock(id)).toBe(false);
      expect(precisaApoio(id)).toBe(true);
      expect(ruleFor(id)).toBe(torchRule); // mesma regra de apoio da tocha
    }
    const world = createWorld(DIMS);
    setBlock(world, 5, 9, 5, BlockId.Stone);
    setBlock(world, 5, 10, 5, BlockId.TapeteVermelho);
    expect(torchRule(world, 5, 10, 5)).toBeNull(); // apoiado: fica
    setBlock(world, 5, 9, 5, BlockId.Air);
    expect(torchRule(world, 5, 10, 5)).toEqual([
      { x: 5, y: 10, z: 5, blockId: BlockId.Air }, // perdeu o apoio: some
    ]);
  });
});

/**
 * O PORTÃO DO APOIO (2026-08-05) — este teste é a razão de o registro ter
 * deixado de ser uma lista de faixas escritas à mão.
 *
 * `precisaApoio` e o `rulesMap` eram DUAS listas do mesmo conjunto, e quem
 * esquecia a segunda não via nada quebrar: o bloco simplesmente ficava
 * flutuando quando o chão sumisse. Custou o capim (bug-558) e depois o algodão
 * inteiro (bug-581). Agora uma varre a outra.
 */
describe("apoio — quem precisa de chão TEM regra de tick (bug-558 / bug-581)", () => {
  it("todo id com `precisaApoio` está registrado no torchRule", () => {
    const semRegra: number[] = [];
    for (let id = 0; id <= MAX_BLOCK_ID; id++) {
      if (precisaApoio(id) && ruleFor(id) !== torchRule) semRegra.push(id);
    }
    expect(semRegra).toEqual([]);
  });

  it("TODA planta entra — cultivada, selvagem, capim, flor e cacto", () => {
    const plantas = [
      ...PLANTAS.flatMap((p) =>
        Array.from({ length: p.estagios }, (_, i) => p.base + i),
      ),
      // §🍖 F10h: os pés SELVAGENS do gen entram pela tabela, não à mão — o
      // teste não pode esquecer o próximo gen que nascer.
      ...PLANTAS.flatMap((p) => (p.selvagem === undefined ? [] : [p.selvagem])),
      BlockId.GramaAlta,
      BlockId.GramaAltaSeca,
      BlockId.GramaAltaFria,
      BlockId.FlorVermelha,
      BlockId.Mandacaru, // era o último de fora: cacto pendurado no ar
    ];
    for (const id of plantas) {
      expect(precisaApoio(id)).toBe(true);
      expect(ruleFor(id)).toBe(torchRule);
    }
  });

  it("o algodão (o bug-581) cai de verdade quando cavam debaixo dele", () => {
    // o CONTROLE POSITIVO no meio: prove que ele FICA antes de provar que cai
    const world = createWorld(DIMS);
    setBlock(world, 5, 9, 5, BlockId.Dirt);
    for (const id of [BlockId.Algodao0, BlockId.Algodao3, BlockId.AlgodaoSelvagem]) {
      setBlock(world, 5, 10, 5, id);
      expect(ruleFor(id)!(world, 5, 10, 5)).toBeNull(); // em solo: fica
    }
    setBlock(world, 5, 9, 5, BlockId.Stone); // pedra não é SOLO
    expect(ruleFor(BlockId.Algodao3)!(world, 5, 10, 5)).toEqual([
      { x: 5, y: 10, z: 5, blockId: BlockId.Air },
    ]);
  });

  it("o cacto se empilha nele mesmo, mas a coluna cai sem a areia embaixo", () => {
    const world = createWorld(DIMS);
    setBlock(world, 5, 9, 5, BlockId.Sand);
    setBlock(world, 5, 10, 5, BlockId.Mandacaru);
    setBlock(world, 5, 11, 5, BlockId.Mandacaru);
    expect(torchRule(world, 5, 10, 5)).toBeNull();
    expect(torchRule(world, 5, 11, 5)).toBeNull(); // apoiado no de baixo
    setBlock(world, 5, 9, 5, BlockId.Air);
    expect(torchRule(world, 5, 10, 5)).toEqual([
      { x: 5, y: 10, z: 5, blockId: BlockId.Air },
    ]);
  });
});
