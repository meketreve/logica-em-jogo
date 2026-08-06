import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_CARVAO,
  ITEM_DIAMANTE,
  ITEM_FRUTA,
  ITEM_TRIGO,
  MAX_BLOCK_ID,
  isItem,
  isPlaceable,
  isProfessorOnly,
} from "./blocks";
import {
  CHANCE_FRUTA_DA_FOLHA,
  CHANCE_SEMENTE_DO_CAPIM,
  dropsDe,
  formaCanonica,
} from "./drops";

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
    expect(dropsDe(BlockId.Sandstone)).toEqual([{ id: BlockId.Sandstone, qtd: 1 }]);
  });

  it("§🍖 F10: carvão e diamante largam o ITEM — o bloco de minério não volta", () => {
    expect(dropsDe(BlockId.MinerioCarvao)).toEqual([{ id: ITEM_CARVAO, qtd: 1 }]);
    expect(dropsDe(BlockId.MinerioDiamante)).toEqual([{ id: ITEM_DIAMANTE, qtd: 1 }]);
  });

  it("§🍖 F10: ferro e ouro continuam caindo como BLOCO (é ele que a fornalha funde)", () => {
    // a diferença entre os quatro minérios É a lição: dois entregam o material
    // direto, dois entregam a rocha que precisa passar pelo fogo.
    expect(dropsDe(BlockId.MinerioFerro)).toEqual([{ id: BlockId.MinerioFerro, qtd: 1 }]);
    expect(dropsDe(BlockId.MinerioOuro)).toEqual([{ id: BlockId.MinerioOuro, qtd: 1 }]);
  });

  it("as três gramas climáticas caem como TERRA", () => {
    for (const g of [BlockId.Grass, BlockId.GramaSeca, BlockId.GramaFria]) {
      expect(dropsDe(g)).toEqual([{ id: BlockId.Dirt, qtd: 1 }]);
    }
  });

  it("pedra cai como pedregulho (o par que dá sentido ao craft do F5)", () => {
    expect(dropsDe(BlockId.Stone)).toEqual([{ id: BlockId.Cobblestone, qtd: 1 }]);
  });

  it("água e ar não caem em nada", () => {
    for (const id of [BlockId.Agua, BlockId.AguaFluida3, BlockId.Air]) {
      expect(dropsDe(id)).toEqual([]);
    }
  });

  it("rocha-matriz não cai em nada (o /bloco do professor remove sem premiar)", () => {
    expect(dropsDe(BlockId.Bedrock)).toEqual([]);
  });

  it("porta quebrada dá UMA porta, não duas (a outra metade some pela regra)", () => {
    expect(dropsDe(BlockId.PortaXAbertaR)).toEqual([{ id: BlockId.PortaXFechada, qtd: 1 }]);
  });

  it("O PORTÃO: tudo que cai é COLOCÁVEL (ou item conhecido) e nunca de professor", () => {
    // §🍖 F6: o portão passou a aceitar ITEM, porque comida não é bloco. O que
    // ele continua provando é o que importa: nada cai em byte que o aluno não
    // consiga usar, e nada cai em ferramenta de autoria.
    // sempre (1) e nunca (0) — as duas pontas do sorteio, pra o portão ver os
    // dois ramos das exceções sorteadas em vez de depender da sorte
    for (const sorteio of [() => 0, () => 0.999]) {
      for (let id = 1; id <= MAX_BLOCK_ID; id++) {
        for (const d of dropsDe(id, sorteio)) {
          expect(
            isPlaceable(d.id) || isItem(d.id),
            `bloco ${id} caiu em ${d.id}, que não é colocável nem item conhecido`,
          ).toBe(true);
          expect(isProfessorOnly(d.id), `bloco ${id} caiu em ${d.id}, que é só de professor`).toBe(false);
          expect(d.qtd).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("§🍖 F6 — as duas fontes de comida", () => {
  it("folha dá fruta ÀS VEZES, e nada no resto das vezes", () => {
    for (const folha of [
      BlockId.Leaves, BlockId.FolhasIpe, BlockId.FolhasAraucaria, BlockId.FolhasPauBrasil,
    ]) {
      expect(dropsDe(folha, () => 0)).toEqual([{ id: ITEM_FRUTA, qtd: 1 }]);
      expect(dropsDe(folha, () => 0.999)).toEqual([]);
    }
  });

  it("capim dá SEMENTE às vezes — e nunca o próprio capim", () => {
    for (const capim of [BlockId.GramaAlta, BlockId.GramaAltaSeca, BlockId.GramaAltaFria]) {
      expect(dropsDe(capim, () => 0)).toEqual([{ id: BlockId.Plantacao0, qtd: 1 }]);
      expect(dropsDe(capim, () => 0.999)).toEqual([]);
    }
  });

  it("a chance da folha é MAIS generosa que a do Minecraft (aula, não temporada)", () => {
    expect(CHANCE_FRUTA_DA_FOLHA).toBeGreaterThan(1 / 200);
    expect(CHANCE_SEMENTE_DO_CAPIM).toBeGreaterThan(CHANCE_FRUTA_DA_FOLHA);
  });

  it("plantação MADURA dá o trigo E devolve a semente (replantar fecha o ciclo)", () => {
    // o trigo é 1 fixo; a semente é 1–3 desde 2026-08-05 (a horta tem de poder
    // CRESCER, não só se replantar) — as duas pontas do sorteio provam a faixa
    expect(dropsDe(BlockId.Plantacao3, () => 0)).toEqual([
      { id: ITEM_TRIGO, qtd: 1 },
      { id: BlockId.Plantacao0, qtd: 1 },
    ]);
    expect(dropsDe(BlockId.Plantacao3, () => 0.99)).toEqual([
      { id: ITEM_TRIGO, qtd: 1 },
      { id: BlockId.Plantacao0, qtd: 3 },
    ]);
  });

  it("plantação VERDE devolve só a muda — arrancar cedo não premia", () => {
    for (const id of [BlockId.Plantacao0, BlockId.Plantacao1, BlockId.Plantacao2]) {
      expect(dropsDe(id)).toEqual([{ id: BlockId.Plantacao0, qtd: 1 }]);
    }
  });

  it("os 4 estágios têm UMA entrada na mochila: a muda", () => {
    for (const id of [
      BlockId.Plantacao0, BlockId.Plantacao1, BlockId.Plantacao2, BlockId.Plantacao3,
    ]) {
      expect(formaCanonica(id)).toBe(BlockId.Plantacao0);
    }
  });
});
