import { describe, expect, it } from "vitest";
import { BlockId, ITEM_CARVAO, MAX_BLOCK_ID } from "./blocks";
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
  descartarEm,
  ehSlotDeContainer,
  moverBloqueadoPorCombustivel,
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

  it("o baú é o segundo container, e tem uma MOCHILA INTEIRA de slots", () => {
    expect(containerTipoDe(BlockId.Bau)).toBe("bau");
    expect(CONTAINER_SLOTS.bau).toBe(INV_SLOTS);
    expect(containerVazio("bau").slots.length).toBe(INV_SLOTS);
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

  it("§🧹 com qtd: só PARTE atravessa, o resto fica na origem", () => {
    const r = moverEntre(
      inv([0, BlockId.MinerioFerro, 5]),
      containerVazio("fornalha"),
      0,
      INV_SLOTS + FORNALHA_ENTRADA,
      2,
    );
    expect(r).not.toBeNull();
    expect(r!.mochila[0]).toEqual({ id: BlockId.MinerioFerro, qtd: 3 });
    expect(r!.container.slots[FORNALHA_ENTRADA]).toEqual({ id: BlockId.MinerioFerro, qtd: 2 });
  });

  it("§🧹 com qtd na SAÍDA da fornalha: a regra de mão única continua valendo", () => {
    const r = moverEntre(
      inv([0, BlockId.MinerioFerro, 5]),
      forno(FORNALHA_SAIDA, BlockId.Glass, 2),
      0,
      INV_SLOTS + FORNALHA_SAIDA,
      2,
    );
    expect(r).toBeNull();
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

  it("slot de COMBUSTÍVEL só aceita quem queima (pedido do playtest)", () => {
    // pedra NÃO queima → o mover é recusado (item fica onde está)
    expect(
      moverEntre(
        inv([0, BlockId.Cobblestone, 3]),
        containerVazio("fornalha"),
        0,
        INV_SLOTS + FORNALHA_COMBUSTIVEL,
      ),
    ).toBeNull();
    // carvão queima → entra normal
    const comCarvao = moverEntre(
      inv([0, ITEM_CARVAO, 3]),
      containerVazio("fornalha"),
      0,
      INV_SLOTS + FORNALHA_COMBUSTIVEL,
    );
    expect(comCarvao).not.toBeNull();
    expect(comCarvao!.container.slots[FORNALHA_COMBUSTIVEL]).toEqual({ id: ITEM_CARVAO, qtd: 3 });
    // a TÁBUA (bloco colocável de lenha) também queima → entra
    expect(
      moverEntre(
        inv([0, BlockId.Planks, 2]),
        containerVazio("fornalha"),
        0,
        INV_SLOTS + FORNALHA_COMBUSTIVEL,
      ),
    ).not.toBeNull();
    // tirar COMBUSTÍVEL da fornalha continua livre (de já é combustível)
    const deVolta = moverEntre(
      inventarioVazio(),
      forno(FORNALHA_COMBUSTIVEL, ITEM_CARVAO, 4),
      INV_SLOTS + FORNALHA_COMBUSTIVEL,
      3,
    );
    expect(deVolta!.mochila[3]).toEqual({ id: ITEM_CARVAO, qtd: 4 });
    expect(deVolta!.container.slots[FORNALHA_COMBUSTIVEL]).toBeNull();
  });

  it("o BAÚ não tem slot de combustível: a regra não engancha nele", () => {
    const bau = containerVazio("bau");
    expect(moverBloqueadoPorCombustivel(inv([0, BlockId.Cobblestone, 1]), bau, 0, 0)).toBe(false);
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

  it("no BAÚ não há slot proibido: os 27 recebem qualquer coisa", () => {
    // a regra de mão única é da SAÍDA da fornalha, e só dela — no baú, um slot
    // proibido não teria explicação nenhuma pra dar à criança
    const bau = containerVazio("bau");
    for (const alvo of [0, 13, CONTAINER_SLOTS.bau - 1]) {
      const r = moverEntre(inv([0, BlockId.Cobblestone, 3]), bau, 0, INV_SLOTS + alvo);
      expect(r).not.toBeNull();
      expect(r!.container.slots[alvo]).toEqual({ id: BlockId.Cobblestone, qtd: 3 });
    }
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

describe("§🗑️ descartarEm — a lixeira também vale com o baú aberto", () => {
  const bau = (i: number, id: number, qtd: number): Container => {
    const base = containerVazio("bau");
    const slots = base.slots.slice();
    slots[i] = { id, qtd };
    return { ...base, slots };
  };

  it("descarta um slot da MOCHILA sem tocar no container", () => {
    const c = bau(0, BlockId.Stone, 5);
    const r = descartarEm(inv([2, BlockId.Sand, 9]), c, 2);
    expect(r).not.toBeNull();
    expect(r?.mochila[2]).toBeNull();
    expect(r?.container.slots[0]).toEqual({ id: BlockId.Stone, qtd: 5 });
  });

  it("descarta um slot do CONTAINER pelo índice unificado", () => {
    const r = descartarEm(inventarioVazio(), bau(1, BlockId.Sand, 7), INV_SLOTS + 1);
    expect(r?.container.slots[1]).toBeNull();
  });

  it("com qtd, tira só a parte da pilha do container", () => {
    const r = descartarEm(inventarioVazio(), bau(1, BlockId.Sand, 7), INV_SLOTS + 1, 2);
    expect(r?.container.slots[1]).toEqual({ id: BlockId.Sand, qtd: 5 });
  });

  it("a SAÍDA da fornalha pode ser descartada — a mão única proíbe PÔR, não tirar", () => {
    const r = descartarEm(inventarioVazio(), forno(FORNALHA_SAIDA, ITEM_CARVAO, 3), INV_SLOTS + FORNALHA_SAIDA);
    expect(r?.container.slots[FORNALHA_SAIDA]).toBeNull();
  });

  it("nada pra descartar devolve null (o sinal de no-op do moverEntre)", () => {
    const c = bau(0, BlockId.Stone, 5);
    expect(descartarEm(inventarioVazio(), c, 3)).toBeNull(); // slot vazio
    expect(descartarEm(inventarioVazio(), c, -1)).toBeNull();
    expect(descartarEm(inventarioVazio(), c, totalDeSlots("bau"))).toBeNull(); // fora da faixa
    expect(descartarEm(inventarioVazio(), c, INV_SLOTS, 0)).toBeNull(); // qtd inválida
  });
});

describe("loja (2026-09-01) — terceiro tipo de container", () => {
  it("containerTipoDe reconhece o Baú-Loja; 27 slots, como o baú", () => {
    expect(containerTipoDe(BlockId.BauLoja)).toBe("loja");
    expect(CONTAINER_SLOTS.loja).toBe(27);
  });

  it("nasce sem criador nem preço; ganha os dois com a atribuição direta", () => {
    const vazio = containerVazio("loja");
    expect(vazio.criador).toBe("");
    expect(vazio.precos.size).toBe(0);
    expect(containerTemConteudo(vazio)).toBe(false);

    const comCriador: Container = { ...vazio, criador: "ana" };
    // criador sem estoque nem preço AINDA conta como "tem conteúdo" — senão a
    // loja recém-criada (ou que vendeu tudo) evapora do save e perde o dono.
    expect(containerTemConteudo(comCriador)).toBe(true);

    const comPreco: Container = {
      ...vazio,
      precos: new Map([[BlockId.Planks, 2]]),
    };
    expect(containerTemConteudo(comPreco)).toBe(true);
  });

  it("containerParaSave/parseContainerSalvo fazem roundtrip de criador+precos (sempre Dimas)", () => {
    const c: Container = {
      ...containerVazio("loja"),
      criador: "ana",
      precos: new Map<number, number>([
        [BlockId.Planks, 2],
        [BlockId.MinerioOuro, 10],
      ]),
    };
    const salvo = containerParaSave(1, 2, 3, c);
    expect(salvo.criador).toBe("ana");
    expect(salvo.precos).toEqual([
      { porItem: BlockId.Planks, qtd: 2 },
      { porItem: BlockId.MinerioOuro, qtd: 10 },
    ]);

    const reparsed = parseContainerSalvo(JSON.parse(JSON.stringify(salvo)));
    expect(reparsed).toEqual(salvo);
    const devolta = containerDeSave(reparsed!);
    expect(devolta.criador).toBe("ana");
    expect(devolta.precos).toEqual(c.precos);
  });

  it("save/fio com criador ou preço quebrados descarta só a entrada doente", () => {
    const raw = {
      x: 0, y: 0, z: 0, tipo: "loja", slots: [],
      criador: 42, // tipo errado — vira "" (sem dono, como o baú comum)
      precos: [
        { porItem: BlockId.Planks, qtd: 2 },
        { porItem: -1, qtd: 5 }, // porItem inválido — descartada
        { porItem: BlockId.MinerioOuro, qtd: 0 }, // qtd<1 — descartada
        { porItem: MAX_BLOCK_ID + 1, qtd: 3 }, // acima do teto — descartada (achado na revisão final)
        "lixo",
      ],
    };
    const parsed = parseContainerSalvo(raw);
    expect(parsed?.criador).toBeUndefined();
    expect(parsed?.precos).toEqual([
      { porItem: BlockId.Planks, qtd: 2 },
    ]);
  });

  it("baú comum e fornalha continuam sem criador/preço (campos ausentes)", () => {
    const salvo = containerParaSave(0, 0, 0, containerVazio("bau"));
    expect(salvo.criador).toBeUndefined();
    expect(salvo.precos).toBeUndefined();
  });
});
