import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_BATATA,
  ITEM_BATATA_COZIDA,
  ITEM_CARVAO,
  ITEM_LINGOTE_FERRO,
  ITEM_PICARETA_MADEIRA,
  ITEM_PICARETA_PEDRA,
  ITEM_TRIGO,
} from "./blocks";
import { NIVEL_MADEIRA, NIVEL_PEDRA, liberadosPor, nomeDaFerramenta } from "./ferramentas";
import { type Uso, usosDoItem } from "./usos";

/** Só o campo `tipo` — as asserções abaixo perguntam "que usos ele tem?". */
const tipos = (id: number): string[] => usosDoItem(id).map((u) => u.tipo);

/** O uso de um tipo, já estreitado (`undefined` se o item não tem esse uso). */
function uso<T extends Uso["tipo"]>(id: number, tipo: T): Extract<Uso, { tipo: T }> | undefined {
  return usosDoItem(id).find((u): u is Extract<Uso, { tipo: T }> => u.tipo === tipo);
}

describe("§💬 usosDoItem — o 'serve pra quê' do tooltip", () => {
  it("bloco de construção não tem uso mecânico nenhum (o tooltip é só o nome)", () => {
    expect(tipos(BlockId.Dirt)).toEqual([]);
    expect(tipos(BlockId.Glass)).toEqual([]);
  });

  it("comida diz quanto enche, na mesma escala da barra", () => {
    expect(uso(ITEM_BATATA, "comida")?.fome).toBe(1);
    expect(uso(ITEM_BATATA_COZIDA, "comida")?.fome).toBe(5);
    // e o trigo NÃO se come: ele é ingrediente do pão
    expect(tipos(ITEM_TRIGO)).toEqual([]);
  });

  it("a batata crua acumula os DOIS usos: come-se e vira assada na fornalha", () => {
    expect(tipos(ITEM_BATATA)).toEqual(["comida", "funde"]);
    expect(uso(ITEM_BATATA, "funde")?.saida).toEqual({ id: ITEM_BATATA_COZIDA, qtd: 1 });
  });

  it("combustível conta COZIMENTOS, não ticks (8× é a descoberta do carvão)", () => {
    expect(uso(ITEM_CARVAO, "combustivel")?.cozimentos).toBe(8);
    expect(uso(BlockId.Planks, "combustivel")?.cozimentos).toBe(1);
  });

  it("minério de ferro funde e exige picareta — as duas coisas de uma vez", () => {
    expect(tipos(BlockId.MinerioFerro)).toEqual(["funde", "exigeFerramenta"]);
    expect(uso(BlockId.MinerioFerro, "funde")?.saida).toEqual({ id: ITEM_LINGOTE_FERRO, qtd: 1 });
    expect(uso(BlockId.MinerioFerro, "exigeFerramenta")?.ferramenta).toBe("picareta de pedra");
  });

  it("a picareta lista o que ELA destrava, e não o que a anterior já dava", () => {
    const madeira = uso(ITEM_PICARETA_MADEIRA, "ferramenta");
    const pedra = uso(ITEM_PICARETA_PEDRA, "ferramenta");
    expect(madeira?.nome).toBe("picareta de madeira");
    expect(madeira?.libera).toContain(BlockId.Stone);
    // o ferro é o degrau SEGUINTE: sai da de pedra, não da de madeira
    expect(madeira?.libera).not.toContain(BlockId.MinerioFerro);
    expect(pedra?.libera).toEqual([BlockId.MinerioFerro]);
  });

  it("muda de plantação diz o que ela devolve madura", () => {
    expect(uso(BlockId.Plantacao0, "colheita")?.item).toBe(ITEM_TRIGO);
  });

  it("nenhum uso mente: toda linha sai de uma tabela do jogo", () => {
    // a regressão que este teste pega é a lista escrita à mão saindo de sincronia
    expect(nomeDaFerramenta("picareta", NIVEL_MADEIRA)).toBe("picareta de madeira");
    expect(nomeDaFerramenta("picareta", 99)).toBeNull();
    for (const id of liberadosPor("picareta", NIVEL_PEDRA)) {
      expect(uso(id, "exigeFerramenta")?.ferramenta).toBe("picareta de pedra");
    }
  });
});
