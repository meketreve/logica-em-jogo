import { describe, expect, it } from "vitest";
import { BlockId, ITEM_CARVAO } from "./blocks";
import {
  CONTAINER_SLOTS,
  type Container,
  FORNALHA_COMBUSTIVEL,
  FORNALHA_ENTRADA,
  FORNALHA_SAIDA,
  containerDeSave,
  containerKey,
  containerParaSave,
  containerTemConteudo,
  containerTipoDe,
  containerVazio,
  ehSlotDeContainer,
  moverEntre,
  parseContainerSalvo,
  totalDeSlots,
} from "./containers";
import {
  INV_SLOTS,
  type Inventario,
  STACK_MAX,
  inventarioVazio,
} from "./inventario";

/** Inventário com pilhas em slots escolhidos (o resto vazio). */
function inv(...pares: [slot: number, id: number, qtd: number][]): Inventario {
  const s = inventarioVazio().slice();
  for (const [i, id, qtd] of pares) s[i] = { id, qtd };
  return s;
}

/** Fornalha com o slot `i` ocupado. */
function forno(i: number, id: number, qtd: number): Container {
  const base = containerVazio("fornalha");
  const slots = base.slots.slice();
  slots[i] = { id, qtd };
  return { ...base, slots };
}

describe("containers — o tipo vem do BYTE, e é uma pergunta só", () => {
  it("as duas fornalhas (apagada e acesa) são o MESMO container", () => {
    expect(containerTipoDe(BlockId.Fornalha)).toBe("fornalha");
    expect(containerTipoDe(BlockId.FornalhaAcesa)).toBe("fornalha");
  });

  it("bloco comum não é container", () => {
    for (const id of [BlockId.Air, BlockId.Stone, BlockId.QuadroXP, BlockId.PortaXFechada]) {
      expect(containerTipoDe(id)).toBeNull();
    }
  });

  it("vazio não tem conteúdo; um item (ou fogo aceso) tem", () => {
    expect(containerTemConteudo(containerVazio("fornalha"))).toBe(false);
    expect(containerTemConteudo(forno(FORNALHA_ENTRADA, BlockId.Sand, 1))).toBe(true);
    // fogo aceso conta: a fornalha está TRABALHANDO, quebrá-la perderia a queima
    expect(
      containerTemConteudo({ ...containerVazio("fornalha"), queimando: 50, queimaTotal: 100 }),
    ).toBe(true);
  });
});

describe("containers — o índice unificado (mochila + container)", () => {
  it("0..26 é mochila, 27+ é container", () => {
    expect(ehSlotDeContainer(0)).toBe(false);
    expect(ehSlotDeContainer(INV_SLOTS - 1)).toBe(false);
    expect(ehSlotDeContainer(INV_SLOTS)).toBe(true);
    expect(totalDeSlots("fornalha")).toBe(INV_SLOTS + CONTAINER_SLOTS.fornalha);
  });

  it("da mochila pro container: o item atravessa e sai da mochila", () => {
    const r = moverEntre(
      inv([0, BlockId.MinerioFerro, 5]),
      containerVazio("fornalha"),
      0,
      INV_SLOTS + FORNALHA_ENTRADA,
    );
    expect(r).not.toBeNull();
    expect(r!.mochila[0]).toBeNull();
    expect(r!.container.slots[FORNALHA_ENTRADA]).toEqual({ id: BlockId.MinerioFerro, qtd: 5 });
  });

  it("do container pra mochila: pegar o que ficou pronto", () => {
    const r = moverEntre(
      inventarioVazio(),
      forno(FORNALHA_SAIDA, BlockId.Glass, 3),
      INV_SLOTS + FORNALHA_SAIDA,
      4,
    );
    expect(r!.container.slots[FORNALHA_SAIDA]).toBeNull();
    expect(r!.mochila[4]).toEqual({ id: BlockId.Glass, qtd: 3 });
  });

  it("mesmo id JUNTA até o teto, e o que passar fica pra trás", () => {
    const r = moverEntre(
      inv([0, ITEM_CARVAO, STACK_MAX - 2]),
      forno(FORNALHA_COMBUSTIVEL, ITEM_CARVAO, 5),
      INV_SLOTS + FORNALHA_COMBUSTIVEL,
      0,
    );
    expect(r!.mochila[0]).toEqual({ id: ITEM_CARVAO, qtd: STACK_MAX });
    expect(r!.container.slots[FORNALHA_COMBUSTIVEL]).toEqual({ id: ITEM_CARVAO, qtd: 3 });
  });

  it("ids diferentes TROCAM de lugar (o gesto de trocar o que está na fornalha)", () => {
    const r = moverEntre(
      inv([0, BlockId.Sand, 8]),
      forno(FORNALHA_ENTRADA, BlockId.MinerioFerro, 2),
      0,
      INV_SLOTS + FORNALHA_ENTRADA,
    );
    expect(r!.mochila[0]).toEqual({ id: BlockId.MinerioFerro, qtd: 2 });
    expect(r!.container.slots[FORNALHA_ENTRADA]).toEqual({ id: BlockId.Sand, qtd: 8 });
  });

  it("a SAÍDA da fornalha é de mão única: dá pra tirar, nunca pra pôr", () => {
    // um item largado ali ficaria preso num slot que não cozinha e não queima,
    // e a criança não teria como saber por quê
    const r = moverEntre(
      inv([0, BlockId.Cobblestone, 1]),
      containerVazio("fornalha"),
      0,
      INV_SLOTS + FORNALHA_SAIDA,
    );
    expect(r).toBeNull();
  });

  it("índice do FIO fora da faixa, origem vazia e de===para não mudam nada", () => {
    const c = forno(FORNALHA_ENTRADA, BlockId.Sand, 1);
    const m = inv([0, BlockId.Cobblestone, 1]);
    expect(moverEntre(m, c, -1, 0)).toBeNull();
    expect(moverEntre(m, c, 0, totalDeSlots("fornalha"))).toBeNull();
    expect(moverEntre(m, c, 1.5, 0)).toBeNull();
    expect(moverEntre(m, c, 5, 6)).toBeNull(); // origem vazia
    expect(moverEntre(m, c, 0, 0)).toBeNull();
  });

  it("não muta nem a mochila nem o container de entrada (funções puras)", () => {
    const m = inv([0, BlockId.Sand, 4]);
    const c = containerVazio("fornalha");
    moverEntre(m, c, 0, INV_SLOTS + FORNALHA_ENTRADA);
    expect(m[0]).toEqual({ id: BlockId.Sand, qtd: 4 });
    expect(c.slots[FORNALHA_ENTRADA]).toBeNull();
  });
});

describe("containers — save (o conteúdo não cabe no byte do chunk)", () => {
  it("round-trip: sai esparso, volta igual", () => {
    const c: Container = {
      ...forno(FORNALHA_ENTRADA, BlockId.MinerioFerro, 7),
      queimando: 42,
      queimaTotal: 100,
      progresso: 13,
    };
    const s = containerParaSave(3, 4, 5, c);
    expect(s).toMatchObject({ x: 3, y: 4, z: 5, tipo: "fornalha", queimando: 42, progresso: 13 });
    expect(s.slots).toEqual([{ slot: FORNALHA_ENTRADA, id: BlockId.MinerioFerro, qtd: 7 }]);
    expect(containerDeSave(s)).toEqual(c);
  });

  it("vazio grava enxuto: nenhum slot e nenhum campo de fogo", () => {
    const s = containerParaSave(0, 0, 0, containerVazio("fornalha"));
    expect(s.slots).toEqual([]);
    expect(s.queimando).toBeUndefined();
    expect(s.progresso).toBeUndefined();
  });

  it("parse DEFENSIVO: entrada quebrada é null, slot quebrado é só PULADO", () => {
    expect(parseContainerSalvo(null)).toBeNull();
    expect(parseContainerSalvo({ x: 1, y: 2, z: 3 })).toBeNull(); // sem tipo
    expect(parseContainerSalvo({ x: 1, y: 2, z: 3, tipo: "cofre" })).toBeNull();
    expect(parseContainerSalvo({ x: 1.5, y: 2, z: 3, tipo: "bau" })).toBeNull();
    const c = parseContainerSalvo({
      x: 1, y: 2, z: 3, tipo: "fornalha",
      slots: [
        { slot: 0, id: BlockId.Sand, qtd: 2 }, // bom
        { slot: 99, id: BlockId.Sand, qtd: 1 }, // fora da faixa DESTE container
        { slot: 1, id: BlockId.Sand, qtd: 999 }, // acima do teto da pilha
        "lixo",
      ],
    });
    expect(c!.slots).toEqual([{ slot: 0, id: BlockId.Sand, qtd: 2 }]);
  });

  it("fogo aceso sem régua ganha a régua da própria chama (barra que só esvazia)", () => {
    const c = parseContainerSalvo({ x: 0, y: 0, z: 0, tipo: "fornalha", queimando: 30 });
    expect(c!.queimaTotal).toBe(30);
  });

  it("a chave é a posição, e é a mesma forma do quadro", () => {
    expect(containerKey(1, -2, 3)).toBe("1,-2,3");
  });
});
