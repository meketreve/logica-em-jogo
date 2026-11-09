import { describe, expect, it } from "vitest";
import {
  CHANCE_PEIXE,
  ESPERA_MAX_TICKS,
  ESPERA_MIN_TICKS,
  JANELA_FISGADA_TICKS,
  SAI_DA_PESCA,
  esperaDaPesca,
  faseDaPesca,
  sortearPesca,
} from "./pesca";
import { BlockId, ITEM_PEIXE_CRU, ITEM_VARA_PESCAR, isFerramenta, isItem, blocoExiste } from "./blocks";
import { DURABILIDADE } from "./ferramentas";
import { RECEITAS } from "./receitas";
import { precoDeVenda } from "./venda";
import { usosDoItem } from "./usos";
import type { Slot } from "./inventario";
import { decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";

describe("§🎣 a vara de pescar (item)", () => {
  it("é ferramenta (1 por slot) com durabilidade 64, e é item conhecido", () => {
    expect(isFerramenta(ITEM_VARA_PESCAR)).toBe(true);
    expect(isItem(ITEM_VARA_PESCAR)).toBe(true);
    expect(DURABILIDADE.get(ITEM_VARA_PESCAR)).toBe(64);
  });

  it("a receita é a ÚLTIMA (índice é identidade) e custa 3 gravetos + 2 algodão", () => {
    const ultima = RECEITAS[RECEITAS.length - 1]!;
    expect(ultima.saida).toEqual({ id: ITEM_VARA_PESCAR, qtd: 1 });
    expect(ultima.custo.map((c) => c.qtd)).toEqual([3, 2]);
    expect(RECEITAS.filter((r) => r.saida.id === ITEM_VARA_PESCAR)).toHaveLength(1);
  });

  it("o tooltip diz o que sai da água — lido da MESMA tabela", () => {
    expect(usosDoItem(ITEM_VARA_PESCAR)).toEqual([{ tipo: "pesca", sai: SAI_DA_PESCA }]);
    expect(SAI_DA_PESCA[0]).toBe(ITEM_PEIXE_CRU);
  });
});

describe("§🎣 a regra pura", () => {
  it("PORTÃO: nada que sai da pesca tem preço de venda (sem cano de Dimas)", () => {
    // (o graveto estava no lixo e foi ESTE portão que o tirou: vale 1 Dimas)
    for (const id of SAI_DA_PESCA) expect(precoDeVenda(id), `id ${id}`).toBeNull();
  });

  it("controle negativo do portão: um id vendível É detectado", () => {
    // o diamante tem preço — se `precoDeVenda` devolvesse null pra tudo, o
    // portão acima passaria sem provar nada
    expect([...Array(2000).keys()].some((id) => precoDeVenda(id) !== null)).toBe(true);
  });

  it("tudo o que sai existe (bloco ou item)", () => {
    for (const id of SAI_DA_PESCA) expect(isItem(id) || blocoExiste(id), `id ${id}`).toBe(true);
  });

  it("a espera fica entre 5 e 20 s, nas pontas do sorteio", () => {
    expect(esperaDaPesca(0)).toBe(ESPERA_MIN_TICKS);
    expect(esperaDaPesca(0.9999999)).toBe(ESPERA_MAX_TICKS);
    expect(esperaDaPesca(-3)).toBe(ESPERA_MIN_TICKS);
    expect(esperaDaPesca(7)).toBe(ESPERA_MAX_TICKS);
  });

  it("peixe abaixo da chance, lixo acima", () => {
    expect(sortearPesca(0, 0)).toEqual({ id: ITEM_PEIXE_CRU, qtd: 1 });
    expect(sortearPesca(CHANCE_PEIXE - 1e-9, 0.5).id).toBe(ITEM_PEIXE_CRU);
    expect(sortearPesca(CHANCE_PEIXE, 0)).toEqual({ id: BlockId.Leaves, qtd: 1 });
    expect(sortearPesca(0.99, 0.999).id).not.toBe(ITEM_PEIXE_CRU);
  });

  it("a janela da fisgada: antes espera, dentro pega, depois escapou", () => {
    const f = 100;
    expect(faseDaPesca(99, f)).toBe("esperando");
    expect(faseDaPesca(100, f)).toBe("fisgado");
    expect(faseDaPesca(100 + JANELA_FISGADA_TICKS - 1, f)).toBe("fisgado");
    expect(faseDaPesca(100 + JANELA_FISGADA_TICKS, f)).toBe("escapou");
  });
});

describe("§🎣 a vara gasta volta do ARQUIVO igual (lição do bug-678)", () => {
  it("encodeSave → decodeSave → restore: a vara com dano 10 continua com dano 10", () => {
    const s1 = new GameSession(() => {}, { dims: { x: 2, z: 2, y: 2 }, seed: 5, codigo: "sala" });
    s1.handleMessage(1, JSON.stringify({ type: "join", name: "prof", pin: "4321", codigo: "sala" }));
    s1.handleMessage(2, JSON.stringify({ type: "join", name: "ana", pin: "1111" }));
    // pré-condição: a ana ENTROU (senão o roster nem a leva — lição de 02/11)
    expect([...s1.players.values()].some((p) => p.name === "ana")).toBe(true);
    const inv = Array.from({ length: 36 }, (): Slot => null);
    inv[0] = { id: ITEM_VARA_PESCAR, qtd: 1, dano: 10 };
    s1.inventarios.set("ana", inv);
    const save = decodeSave(encodeSave(s1.world, s1.toSave()));
    const s2 = new GameSession(() => {}, { restore: save, codigo: "sala" });
    expect(s2.inventarios.get("ana")?.[0]).toEqual({ id: ITEM_VARA_PESCAR, qtd: 1, dano: 10 });
  });
});
