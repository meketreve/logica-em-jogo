import { describe, expect, it } from "vitest";
import {
  BlockId,
  MAX_BLOCK_ID,
  PLANTAS,
  isSolidBlock,
  isTapete,
  precisaApoio,
} from "./blocks";
import { doorRule, fallingRule, parDaPorta, ruleFor, torchRule } from "./rules";
import { createWorld, getBlock, setBlock } from "./world";

const DIMS = { x: 1, z: 1, y: 1 };

describe("regras de bloco (sistema genérico de vizinhança)", () => {
  it("areia e cascalho compartilham a MESMA regra de queda; a grama espalha (grassRule); o resto não tem", () => {
    expect(ruleFor(BlockId.Sand)).toBe(fallingRule);
    expect(ruleFor(BlockId.Gravel)).toBe(fallingRule);
    expect(ruleFor(BlockId.Air)).toBeUndefined();
    expect(ruleFor(BlockId.Stone)).toBeUndefined();
    expect(ruleFor(BlockId.Cobblestone)).toBeUndefined();
    expect(ruleFor(BlockId.Bedrock)).toBeUndefined();
    expect(ruleFor(BlockId.Dirt)).toBeUndefined();
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

describe("porta empilhada: pares a partir da BASE da pilha (2026-09-12)", () => {
  const P = BlockId.PortaXFechada;
  /** Coluna x=z=5 com `n` células de porta a partir de y=2. */
  const pilha = (n: number) => {
    const w = createWorld(DIMS);
    for (let i = 0; i < n; i++) setBlock(w, 5, 2 + i, 5, P);
    return w;
  };

  it("o par de cada célula de 3 portas empilhadas é a outra metade da MESMA porta", () => {
    const w = pilha(6);
    expect([2, 3, 4, 5, 6, 7].map((y) => parDaPorta(w, 5, y, 5))).toEqual([3, 2, 5, 4, 7, 6]);
  });

  it("pilha inteira não evapora nada", () => {
    const w = pilha(6);
    for (let y = 2; y <= 7; y++) expect(doorRule(w, 5, y, 5)).toBeNull();
  });

  it("quebrar a BASE da porta do meio: só o topo DELA fica sem par", () => {
    const w = pilha(6);
    setBlock(w, 5, 4, 5, BlockId.Air);
    expect(doorRule(w, 5, 5, 5)).toEqual([{ x: 5, y: 5, z: 5, blockId: BlockId.Air }]); // a ponta vizinha do buraco
    expect(doorRule(w, 5, 3, 5)).toBeNull(); // a porta de baixo segue inteira
    setBlock(w, 5, 5, 5, BlockId.Air); // o que o tick faz com a ponta órfã
    expect(parDaPorta(w, 5, 6, 5)).toBe(7); // e a de cima também
    expect(doorRule(w, 5, 6, 5)).toBeNull();
  });

  it("quebrar o TOPO da porta do meio: só a base DELA fica sem par", () => {
    const w = pilha(6);
    setBlock(w, 5, 5, 5, BlockId.Air);
    expect(doorRule(w, 5, 4, 5)).toEqual([{ x: 5, y: 4, z: 5, blockId: BlockId.Air }]);
    expect(doorRule(w, 5, 6, 5)).toBeNull();
    expect(getBlock(w, 5, 2, 5)).toBe(P);
  });

  it("porta sozinha: o par é o vizinho; metade órfã evapora", () => {
    const w = pilha(2);
    expect(parDaPorta(w, 5, 2, 5)).toBe(3);
    expect(parDaPorta(w, 5, 3, 5)).toBe(2);
    setBlock(w, 5, 3, 5, BlockId.Air);
    expect(parDaPorta(w, 5, 2, 5)).toBeNull();
    expect(doorRule(w, 5, 2, 5)).toEqual([{ x: 5, y: 2, z: 5, blockId: BlockId.Air }]);
  });
});
