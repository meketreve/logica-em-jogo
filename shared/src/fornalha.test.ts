import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_CARVAO,
  ITEM_CARVAO_VEGETAL,
  ITEM_LINGOTE_FERRO,
  ITEM_LINGOTE_OURO,
  isItem,
  isPlaceable,
} from "./blocks";
import {
  CONTAINER_SLOTS,
  type Container,
  FORNALHA_COMBUSTIVEL,
  FORNALHA_ENTRADA,
  FORNALHA_SAIDA,
  containerVazio,
} from "./containers";
import { STACK_MAX, type Slot } from "./inventario";
import {
  COMBUSTIVEIS,
  COZIMENTO,
  TICKS_POR_COZIMENTO,
  ehCombustivel,
  fornalhaAcesa,
  podeCozinhar,
  tickFornalha,
} from "./fornalha";

/** Fornalha com os 3 slots escolhidos (o que não vier é vazio). */
function forno(
  entrada: Slot = null,
  combustivel: Slot = null,
  saida: Slot = null,
): Container {
  const base = containerVazio("fornalha");
  const slots = base.slots.slice();
  slots[FORNALHA_ENTRADA] = entrada;
  slots[FORNALHA_COMBUSTIVEL] = combustivel;
  slots[FORNALHA_SAIDA] = saida;
  return { ...base, slots };
}

/** Roda `n` ticks seguidos (o tempo do jogo é CONTAGEM DE TICKS, nunca relógio). */
function ticks(c: Container, n: number): Container {
  let atual = c;
  for (let i = 0; i < n; i++) atual = tickFornalha(atual);
  return atual;
}

describe("fornalha — as tabelas", () => {
  it("tudo que entra é bloco colocável ou item conhecido, e tudo que sai também", () => {
    for (const [entrada, saida] of COZIMENTO) {
      expect(isPlaceable(entrada) || isItem(entrada)).toBe(true);
      expect(isPlaceable(saida.id) || isItem(saida.id)).toBe(true);
      expect(saida.qtd).toBeGreaterThanOrEqual(1);
      expect(saida.qtd).toBeLessThanOrEqual(STACK_MAX);
    }
    for (const [id, t] of COMBUSTIVEIS) {
      expect(isPlaceable(id) || isItem(id)).toBe(true);
      expect(t).toBeGreaterThan(0);
    }
  });

  it("as quatro cadeias da v1: ferro, ouro, tronco e areia", () => {
    expect(COZIMENTO.get(BlockId.MinerioFerro)?.id).toBe(ITEM_LINGOTE_FERRO);
    expect(COZIMENTO.get(BlockId.MinerioOuro)?.id).toBe(ITEM_LINGOTE_OURO);
    expect(COZIMENTO.get(BlockId.Sand)?.id).toBe(BlockId.Glass);
    // as 4 espécies de tronco viram carvão vegetal — nenhuma fica de fora
    for (const log of [BlockId.Log, BlockId.LogIpe, BlockId.LogAraucaria, BlockId.LogPauBrasil]) {
      expect(COZIMENTO.get(log)?.id).toBe(ITEM_CARVAO_VEGETAL);
    }
  });

  it("carvão (mineral OU vegetal) rende 8× a madeira — é o que faz achar carvão importar", () => {
    expect(COMBUSTIVEIS.get(ITEM_CARVAO)).toBe(TICKS_POR_COZIMENTO * 8);
    expect(COMBUSTIVEIS.get(ITEM_CARVAO_VEGETAL)).toBe(TICKS_POR_COZIMENTO * 8);
    expect(COMBUSTIVEIS.get(BlockId.Planks)).toBe(TICKS_POR_COZIMENTO);
    expect(ehCombustivel(BlockId.Cobblestone)).toBe(false);
    expect(ehCombustivel(ITEM_LINGOTE_FERRO)).toBe(false); // o produto não é lenha
  });
});

describe("fornalha — podeCozinhar", () => {
  it("sem entrada, ou com entrada que não funde, não cozinha", () => {
    expect(podeCozinhar(forno())).toBe(false);
    expect(podeCozinhar(forno({ id: BlockId.Cobblestone, qtd: 8 }))).toBe(false);
  });

  it("com entrada que funde e saída vazia, cozinha", () => {
    expect(podeCozinhar(forno({ id: BlockId.MinerioFerro, qtd: 1 }))).toBe(true);
  });

  it("saída ocupada por OUTRO id trava (senão a peça pronta não teria onde cair)", () => {
    const c = forno(
      { id: BlockId.MinerioFerro, qtd: 1 },
      null,
      { id: BlockId.Cobblestone, qtd: 1 },
    );
    expect(podeCozinhar(c)).toBe(false);
  });

  it("saída CHEIA do mesmo id também trava — e o combustível não é gasto à toa", () => {
    const c = forno(
      { id: BlockId.MinerioFerro, qtd: 1 },
      { id: ITEM_CARVAO, qtd: 1 },
      { id: ITEM_LINGOTE_FERRO, qtd: STACK_MAX },
    );
    expect(podeCozinhar(c)).toBe(false);
    const depois = tickFornalha(c);
    expect(depois).toBe(c); // MESMO objeto: nada mudou, nem mensagem sai
  });
});

describe("fornalha — o tick", () => {
  it("fornalha vazia não faz nada (e devolve o MESMO objeto)", () => {
    const c = containerVazio("fornalha");
    expect(tickFornalha(c)).toBe(c);
  });

  it("com carvão e NADA pra cozinhar, o carvão não é gasto", () => {
    const c = forno(null, { id: ITEM_CARVAO, qtd: 1 });
    expect(tickFornalha(c)).toBe(c);
    expect(fornalhaAcesa(tickFornalha(c))).toBe(false);
  });

  it("acende no 1º tick: gasta UMA unidade de combustível e o fogo pega", () => {
    const c = forno({ id: BlockId.MinerioFerro, qtd: 1 }, { id: ITEM_CARVAO, qtd: 2 });
    const d = tickFornalha(c);
    expect(fornalhaAcesa(d)).toBe(true);
    expect(d.slots[FORNALHA_COMBUSTIVEL]).toEqual({ id: ITEM_CARVAO, qtd: 1 });
    // o tick que acende TAMBÉM queima e cozinha: sobra 8 cozimentos − 1 tick
    expect(d.queimando).toBe(TICKS_POR_COZIMENTO * 8 - 1);
    expect(d.queimaTotal).toBe(TICKS_POR_COZIMENTO * 8);
    expect(d.progresso).toBe(1);
  });

  it("100 ticks = 1 lingote: o minério sai da entrada e o lingote entra na saída", () => {
    const c = forno({ id: BlockId.MinerioFerro, qtd: 2 }, { id: ITEM_CARVAO, qtd: 1 });
    const d = ticks(c, TICKS_POR_COZIMENTO);
    expect(d.slots[FORNALHA_ENTRADA]).toEqual({ id: BlockId.MinerioFerro, qtd: 1 });
    expect(d.slots[FORNALHA_SAIDA]).toEqual({ id: ITEM_LINGOTE_FERRO, qtd: 1 });
    expect(d.progresso).toBe(0);
    // e o 2º minério continua: mais 100 ticks, mais um lingote na MESMA pilha
    const e = ticks(d, TICKS_POR_COZIMENTO);
    expect(e.slots[FORNALHA_ENTRADA]).toBeNull();
    expect(e.slots[FORNALHA_SAIDA]).toEqual({ id: ITEM_LINGOTE_FERRO, qtd: 2 });
  });

  it("uma tábua queima 1 cozimento EXATO — a peça fica pronta e o fogo apaga", () => {
    const c = forno({ id: BlockId.Sand, qtd: 5 }, { id: BlockId.Planks, qtd: 1 });
    const d = ticks(c, TICKS_POR_COZIMENTO);
    expect(d.slots[FORNALHA_SAIDA]).toEqual({ id: BlockId.Glass, qtd: 1 });
    expect(fornalhaAcesa(d)).toBe(false); // acabou a lenha
    expect(d.queimaTotal).toBe(0);
    // sem combustível, o resto da areia não anda
    const e = ticks(d, TICKS_POR_COZIMENTO);
    expect(e.slots[FORNALHA_SAIDA]).toEqual({ id: BlockId.Glass, qtd: 1 });
  });

  it("o carvão dá 8 peças com UMA unidade (a régua que a turma vai comparar)", () => {
    const c = forno({ id: BlockId.Sand, qtd: 64 }, { id: ITEM_CARVAO, qtd: 1 });
    const d = ticks(c, TICKS_POR_COZIMENTO * 8);
    expect(d.slots[FORNALHA_SAIDA]).toEqual({ id: BlockId.Glass, qtd: 8 });
    expect(fornalhaAcesa(d)).toBe(false);
  });

  it("tronco é combustível E matéria-prima — cozinhar tronco com tronco funciona", () => {
    // é a fornalha que se sustenta sozinha, e é a saída de quem só tem árvore
    const c = forno({ id: BlockId.Log, qtd: 1 }, { id: BlockId.Log, qtd: 1 });
    const d = ticks(c, TICKS_POR_COZIMENTO);
    expect(d.slots[FORNALHA_SAIDA]).toEqual({ id: ITEM_CARVAO_VEGETAL, qtd: 1 });
  });

  it("tirar a entrada no meio ESFRIA a peça: o progresso volta a zero", () => {
    const c = forno({ id: BlockId.MinerioFerro, qtd: 1 }, { id: ITEM_CARVAO, qtd: 1 });
    const meio = ticks(c, 50);
    expect(meio.progresso).toBe(50);
    const semEntrada: Container = {
      ...meio,
      slots: meio.slots.map((s, i) => (i === FORNALHA_ENTRADA ? null : s)),
    };
    const d = tickFornalha(semEntrada);
    expect(d.progresso).toBe(0);
    expect(fornalhaAcesa(d)).toBe(true); // o fogo continua: lenha gasta não volta
  });

  it("o fogo aceso QUEIMA mesmo sem nada pra cozinhar (combustível não se recupera)", () => {
    const c = forno({ id: BlockId.MinerioFerro, qtd: 1 }, { id: BlockId.Planks, qtd: 1 });
    const aceso = tickFornalha(c);
    const semEntrada: Container = {
      ...aceso,
      slots: aceso.slots.map((s, i) => (i === FORNALHA_ENTRADA ? null : s)),
    };
    const d = tickFornalha(semEntrada);
    expect(d.queimando).toBe(aceso.queimando - 1);
  });

  it("a fornalha tem 3 slots, e o baú tem uma mochila inteira", () => {
    expect(CONTAINER_SLOTS.fornalha).toBe(3);
    expect(containerVazio("fornalha").slots.length).toBe(3);
  });
});
