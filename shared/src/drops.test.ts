import { describe, expect, it } from "vitest";
import { BlockId, isPlaceable, isProfessorOnly } from "./blocks";
import { dropsDe, formaCanonica } from "./drops";

describe("drops — forma canônica (o byte volta como entrada da hotbar)", () => {
  it("porta aberta, fechada e variante R viram UMA porta", () => {
    for (const id of [
      BlockId.PortaXFechada, BlockId.PortaXAberta,
      BlockId.PortaZFechada, BlockId.PortaZAberta,
      BlockId.PortaXFechadaR, BlockId.PortaZAbertaR,
    ]) {
      expect(formaCanonica(id)).toBe(BlockId.PortaXFechada);
    }
  });

  it("janela (4 direções × 2 estados × R) vira UMA janela", () => {
    for (const id of [
      BlockId.JanelaXFechada, BlockId.JanelaZAberta, BlockId.JanelaXAbertaR,
    ]) {
      expect(formaCanonica(id)).toBe(BlockId.JanelaXFechada);
    }
  });

  it("móveis com 4 direções voltam pela âncora XP", () => {
    expect(formaCanonica(BlockId.CamaZN)).toBe(BlockId.CamaXP);
    expect(formaCanonica(BlockId.CadeiraZP)).toBe(BlockId.CadeiraXP);
    expect(formaCanonica(BlockId.SofaXN)).toBe(BlockId.SofaXP);
    expect(formaCanonica(BlockId.QuadroZN)).toBe(BlockId.QuadroXP);
  });

  it("laje de cima volta como laje de baixo, mantendo o MATERIAL", () => {
    expect(formaCanonica(BlockId.LajePedraCima)).toBe(BlockId.LajePedraBaixo);
    expect(formaCanonica(BlockId.LajeTabuaCima)).toBe(BlockId.LajeTabuaBaixo);
    expect(formaCanonica(BlockId.LajeTijoloCima)).toBe(BlockId.LajeTijoloBaixo);
  });

  it("escada de qualquer direção/metade volta na âncora do material", () => {
    expect(formaCanonica(BlockId.EscadaPedraZNC)).toBe(BlockId.EscadaPedraXP);
    expect(formaCanonica(BlockId.EscadaTabuaXN)).toBe(BlockId.EscadaTabuaXP);
    expect(formaCanonica(BlockId.EscadaTijoloZPC)).toBe(BlockId.EscadaTijoloXP);
  });

  it("bloco comum é a própria forma canônica", () => {
    expect(formaCanonica(BlockId.Stone)).toBe(BlockId.Stone);
    expect(formaCanonica(BlockId.WoolRed)).toBe(BlockId.WoolRed);
  });
});

describe("drops — a tabela", () => {
  it("por PADRÃO o bloco cai ele mesmo (construir e desfazer é reversível)", () => {
    expect(dropsDe(BlockId.Cobblestone)).toEqual([{ id: BlockId.Cobblestone, qtd: 1 }]);
    expect(dropsDe(BlockId.WoolBlue)).toEqual([{ id: BlockId.WoolBlue, qtd: 1 }]);
    expect(dropsDe(BlockId.MinerioCarvao)).toEqual([{ id: BlockId.MinerioCarvao, qtd: 1 }]);
  });

  it("as três gramas climáticas caem como TERRA", () => {
    for (const g of [BlockId.Grass, BlockId.GramaSeca, BlockId.GramaFria]) {
      expect(dropsDe(g)).toEqual([{ id: BlockId.Dirt, qtd: 1 }]);
    }
  });

  it("pedra cai como pedregulho (o par que dá sentido ao craft do F5)", () => {
    expect(dropsDe(BlockId.Stone)).toEqual([{ id: BlockId.Cobblestone, qtd: 1 }]);
  });

  it("folha, água e ar não caem em nada", () => {
    for (const id of [
      BlockId.Leaves, BlockId.FolhasIpe, BlockId.FolhasAraucaria, BlockId.FolhasPauBrasil,
      BlockId.Agua, BlockId.AguaFluida3, BlockId.Air,
    ]) {
      expect(dropsDe(id)).toEqual([]);
    }
  });

  it("rocha-matriz não cai em nada (o /bloco do professor remove sem premiar)", () => {
    expect(dropsDe(BlockId.Bedrock)).toEqual([]);
  });

  it("porta quebrada dá UMA porta, não duas (a outra metade some pela regra)", () => {
    expect(dropsDe(BlockId.PortaXAbertaR)).toEqual([{ id: BlockId.PortaXFechada, qtd: 1 }]);
  });

  it("O PORTÃO: tudo que cai é COLOCÁVEL e não é só-de-professor", () => {
    for (let id = 1; id <= BlockId.GramaAltaFria; id++) {
      for (const d of dropsDe(id)) {
        expect(isPlaceable(d.id), `bloco ${id} caiu em ${d.id}, que não é colocável`).toBe(true);
        expect(isProfessorOnly(d.id), `bloco ${id} caiu em ${d.id}, que é só de professor`).toBe(false);
        expect(d.qtd).toBeGreaterThan(0);
      }
    }
  });
});
