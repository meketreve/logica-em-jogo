import { describe, expect, it } from "vitest";
import { BlockId, ITEM_BALDE_VAZIO } from "./blocks";
import {
  INV_SLOTS,
  type Inventario,
  STACK_MAX,
  contar,
  inventarioVazio,
} from "./inventario";
import {
  RECEITAS,
  type Receita,
  fabricar,
  ingredientesDe,
  podeFabricar,
  receitaValida,
  temIngredientes,
} from "./receitas";

/** Inventário com pilhas em slots escolhidos (o resto vazio). */
function inv(...pares: [slot: number, id: number, qtd: number][]): Inventario {
  const s = inventarioVazio().slice();
  for (const [i, id, qtd] of pares) s[i] = { id, qtd };
  return s;
}

/** Acha a receita cuja saída é `id` (a primeira, no caso das 4 de tábuas). */
function receitaDe(saidaId: number): Receita {
  const r = RECEITAS.find((x) => x.saida.id === saidaId);
  if (!r) throw new Error(`sem receita pra ${saidaId}`);
  return r;
}

describe("receitas — tabela", () => {
  it("todo ingrediente e toda saída são pilhas válidas (id > 0, qtd ≥ 1)", () => {
    for (const r of RECEITAS) {
      expect(r.saida.qtd).toBeGreaterThanOrEqual(1);
      expect(r.saida.id).toBeGreaterThan(0);
      expect(r.custo.length).toBeGreaterThanOrEqual(1);
      for (const c of r.custo) {
        expect(c.qtd).toBeGreaterThanOrEqual(1);
        expect(c.id).toBeGreaterThan(0);
      }
      // ingredientes DISTINTOS entre si (contar assume um id por custo)
      const ids = r.custo.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("a saída nunca passa do teto da própria pilha (senão não caberia num slot)", () => {
    for (const r of RECEITAS) {
      const teto = r.saida.id === ITEM_BALDE_VAZIO ? 1 : STACK_MAX;
      expect(r.saida.qtd).toBeLessThanOrEqual(teto);
    }
  });

  it("receitaValida barra o índice que veio pelo fio", () => {
    expect(receitaValida(0)).toBe(true);
    expect(receitaValida(RECEITAS.length - 1)).toBe(true);
    expect(receitaValida(RECEITAS.length)).toBe(false);
    expect(receitaValida(-1)).toBe(false);
    expect(receitaValida(1.5)).toBe(false);
    expect(receitaValida(Number.NaN)).toBe(false);
  });
});

describe("receitas — podeFabricar / temIngredientes", () => {
  const tabuas = receitaDe(BlockId.Planks); // 1 tronco → 4 tábuas
  const troncoId = tabuas.custo[0]!.id;

  it("com o ingrediente exato, dá pra fabricar", () => {
    const i = inv([0, troncoId, 1]);
    expect(temIngredientes(i, tabuas)).toBe(true);
    expect(podeFabricar(i, tabuas)).toBe(true);
  });

  it("sem o ingrediente, não dá", () => {
    const i = inv([0, BlockId.Sand, 10]);
    expect(temIngredientes(i, tabuas)).toBe(false);
    expect(podeFabricar(i, tabuas)).toBe(false);
  });

  it("ingrediente espalhado em várias pilhas SOMA (6 tábuas em 4+2 → escada)", () => {
    const escada = receitaDe(BlockId.EscadaTabuaXP); // 6 tábuas → 4 escadas
    const i = inv([0, BlockId.Planks, 4], [5, BlockId.Planks, 2]);
    expect(contar(i, BlockId.Planks)).toBe(6);
    expect(podeFabricar(i, escada)).toBe(true);
  });

  it("mochila cheia de OUTRO id sem parcial da saída: tem ingrediente mas não cabe", () => {
    // todos os 27 slots cheios de areia, e UM tronco não cabe em lugar nenhum…
    // então nem dá pra ter o tronco. Monta o caso real: 26 slots de areia +
    // 1 slot com o tronco. Fabricar tábuas libera o slot do tronco → cabe.
    const s = inventarioVazio().slice();
    for (let k = 0; k < INV_SLOTS - 1; k++) s[k] = { id: BlockId.Sand, qtd: STACK_MAX };
    s[INV_SLOTS - 1] = { id: troncoId, qtd: 1 };
    expect(temIngredientes(s, tabuas)).toBe(true);
    // o tronco vira ar e as tábuas ocupam o mesmo slot liberado
    expect(podeFabricar(s, tabuas)).toBe(true);
  });

  it("saída de TIPO NOVO não cabe numa mochila que o consumo não libera", () => {
    // 3 minérios de ferro num slot, os outros 26 cheios de areia. Fabricar
    // balde consome os 3 ferros (libera o slot) e o balde ocupa ele → cabe.
    // Mas se o ferro estivesse dividido em slots que NÃO esvaziam de vez, o
    // balde (id novo, pilha 1) não teria onde entrar. Testa o caso que cabe:
    const balde = receitaDe(ITEM_BALDE_VAZIO);
    const s = inventarioVazio().slice();
    for (let k = 0; k < INV_SLOTS - 1; k++) s[k] = { id: BlockId.Sand, qtd: STACK_MAX };
    s[INV_SLOTS - 1] = { id: BlockId.MinerioFerro, qtd: 3 };
    expect(podeFabricar(s, balde)).toBe(true);
  });

  it("saída não cabe (todos cheios, ingrediente parcial que não some) → recusa", () => {
    // 26 slots de areia CHEIOS + 1 slot com 2 ferros (a receita quer 3): sem
    // ingrediente suficiente. Já cobre a recusa por falta; agora o caso de
    // caber-não: ferro basta mas some só PARTE de um slot.
    const balde = receitaDe(ITEM_BALDE_VAZIO); // 3 ferro → 1 balde
    const s = inventarioVazio().slice();
    for (let k = 0; k < INV_SLOTS; k++) s[k] = { id: BlockId.Sand, qtd: STACK_MAX };
    // troca 1 slot por 4 ferros: consumir 3 deixa 1 ferro no slot (não esvazia)
    s[0] = { id: BlockId.MinerioFerro, qtd: 4 };
    expect(temIngredientes(s, balde)).toBe(true);
    // o balde (id novo) não tem slot livre → recusa
    expect(podeFabricar(s, balde)).toBe(false);
  });
});

describe("receitas — fabricar (tudo ou nada)", () => {
  const tabuas = receitaDe(BlockId.Planks);
  const troncoId = tabuas.custo[0]!.id;

  it("consome o custo e credita a saída", () => {
    const antes = inv([0, troncoId, 3]);
    const depois = fabricar(antes, tabuas);
    expect(depois).not.toBeNull();
    expect(contar(depois!, troncoId)).toBe(2); // gastou 1 tronco
    expect(contar(depois!, BlockId.Planks)).toBe(4); // ganhou 4 tábuas
  });

  it("não muta o inventário de entrada (função pura)", () => {
    const antes = inv([0, troncoId, 3]);
    fabricar(antes, tabuas);
    expect(contar(antes, troncoId)).toBe(3);
    expect(contar(antes, BlockId.Planks)).toBe(0);
  });

  it("sem ingrediente devolve null e não gasta nada", () => {
    const antes = inv([0, BlockId.Sand, 1]);
    expect(fabricar(antes, tabuas)).toBeNull();
  });

  it("empilha a saída numa pilha parcial já existente", () => {
    // 1 tronco + 62 tábuas: fabricar dá 4 tábuas → 66, que passa de um slot,
    // mas adicionar completa o parcial (64) e abre outro slot com 2.
    const antes = inv([0, troncoId, 1], [1, BlockId.Planks, 62]);
    const depois = fabricar(antes, tabuas);
    expect(depois).not.toBeNull();
    expect(contar(depois!, BlockId.Planks)).toBe(66);
  });
});

describe("receitas — ingredientesDe (o 'falta 3 tábua' do painel)", () => {
  it("reporta have/need/falta por ingrediente", () => {
    const escada = receitaDe(BlockId.EscadaTabuaXP); // 6 tábuas
    const i = inv([0, BlockId.Planks, 3]);
    const [ing] = ingredientesDe(i, escada);
    expect(ing).toEqual({ id: BlockId.Planks, need: 6, have: 3, falta: 3 });
  });

  it("falta 0 quando há de sobra", () => {
    const tabuas = receitaDe(BlockId.Planks);
    const troncoId = tabuas.custo[0]!.id;
    const [ing] = ingredientesDe(inv([0, troncoId, 9]), tabuas);
    expect(ing!.falta).toBe(0);
    expect(ing!.have).toBe(9);
  });
});
