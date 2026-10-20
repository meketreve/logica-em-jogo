import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_CARVAO_VEGETAL,
  ITEM_DIAMANTE,
  ITEM_LINGOTE_FERRO,
  ITEM_PAO,
  ITEM_TRIGO,
  PLANTAS,
  podeEstarNaMochila,
} from "./blocks";
import { FERRAMENTAS } from "./ferramentas";
import { COZIMENTO } from "./fornalha";
import type { Slot } from "./inventario";
import { RECEITAS, idsDoIngrediente, receitaAtiva } from "./receitas";
import { idsVendiveis, podeSerVendido, precoDeVenda, totalDoBalcao } from "./venda";

describe("§💰 preço de venda", () => {
  it("a escala aprovada em 2026-10-20 é a que está na tabela", () => {
    expect(precoDeVenda(BlockId.Dirt)).toBe(1);
    expect(precoDeVenda(BlockId.Stone)).toBe(1);
    expect(precoDeVenda(BlockId.Log)).toBe(1);
    expect(precoDeVenda(ITEM_TRIGO)).toBe(2);
    expect(precoDeVenda(ITEM_PAO)).toBe(3);
    expect(precoDeVenda(ITEM_LINGOTE_FERRO)).toBe(6);
    expect(precoDeVenda(ITEM_DIAMANTE)).toBe(20);
  });

  it("as 8 colheitas de PLANTAS vendem — planta nova nasce vendível", () => {
    // Derivado da tabela, não escrito à mão: é o que impede a 9ª planta de
    // entrar no jogo sem preço e sem ninguém notar.
    for (const p of PLANTAS) {
      expect(podeSerVendido(p.colheita), `colheita ${p.colheita}`).toBe(true);
    }
  });

  it("id que não existe, ar e negativo não têm preço", () => {
    expect(precoDeVenda(BlockId.Air)).toBeNull();
    expect(precoDeVenda(-1)).toBeNull();
    expect(precoDeVenda(9999)).toBeNull();
  });

  it("CONTROLE NEGATIVO: o fabricado NÃO se vende", () => {
    // Se um destes passar a ter preço, a lista de permissão virou lista de
    // tudo — e com ela volta o cano de lavagem que o portão abaixo cobre.
    for (const id of [
      BlockId.Planks, // 1 tronco → 4 tábuas
      BlockId.Leaves, // 1 tronco → 4 folhas (quem pegou este foi o portão)
      BlockId.FolhasIpe,
      BlockId.Gravel, // 1 pedregulho → 2 cascalhos
      BlockId.Sandstone,
      BlockId.StoneBricks,
      BlockId.Glass,
      BlockId.Mesa,
      BlockId.Cerca,
      BlockId.Tocha,
      BlockId.PortaXFechada,
      BlockId.LetterA,
      ITEM_CARVAO_VEGETAL, // sai de 1 tronco na fornalha: é combustível
    ]) {
      expect(podeSerVendido(id), `id ${id} não devia ter preço`).toBe(false);
    }
  });

  it("CONTROLE NEGATIVO: nenhuma FERRAMENTA tem preço", () => {
    // Decisão do usuário (2026-10-20): ferramenta tem DURABILIDADE, e vender a
    // picareta de diamante quase quebrada pelo preço da nova é brecha óbvia.
    for (const id of FERRAMENTAS.keys()) {
      expect(podeSerVendido(id), `ferramenta ${id} não se vende`).toBe(false);
    }
  });

  it("todo id com preço pode estar numa mochila", () => {
    for (const id of idsVendiveis()) {
      expect(podeEstarNaMochila(id), `id ${id}`).toBe(true);
    }
  });
});

/**
 * ⚠️ **O PORTÃO que sustenta a tabela de preços.**
 *
 * Com venda ao sistema e SEM TETO (decisão do usuário), qualquer receita cuja
 * saída valha mais que a entrada é uma máquina de Dimas infinita: o aluno
 * fabrica, vende, fabrica de novo. O caso que de fato existia é `1 tronco → 4
 * tábuas` — com os dois a 1 Dimas, 1 vira 4.
 *
 * Então o teto de preço não é escolhido no olho: ele é VARRIDO. Receita nova,
 * cozimento novo ou preço novo que abra o cano reprova no mesmo commit, e é por
 * isso que este teste vale mais que a tabela inteira.
 *
 * O ingrediente com alternativas (`ou`) conta pelo MAIS BARATO — é o que o
 * aluno escolheria, e é o pior caso pra economia.
 */
describe("§💰 portão: nenhuma receita imprime Dimas", () => {
  /** Quanto custa, em Dimas, o ingrediente mais barato que satisfaz `ing`. */
  function custoDoIngrediente(ing: Parameters<typeof idsDoIngrediente>[0]): number | null {
    let menor: number | null = null;
    for (const id of idsDoIngrediente(ing)) {
      const p = precoDeVenda(id);
      if (p === null) continue; // alternativa sem preço: não serve pra lavar
      if (menor === null || p < menor) menor = p;
    }
    return menor === null ? null : menor * ing.qtd;
  }

  it("toda RECEITA ativa: saída vale ≤ entrada", () => {
    for (const r of RECEITAS) {
      if (!receitaAtiva(r)) continue;
      const precoSaida = precoDeVenda(r.saida.id);
      if (precoSaida === null) continue; // saída sem preço não lava nada
      const valorSaida = precoSaida * r.saida.qtd;

      // Entrada: se QUALQUER ingrediente não tem preço, o aluno teve de obtê-lo
      // de outro jeito e a receita não é um ciclo fechado de Dimas.
      let valorEntrada = 0;
      let fechada = true;
      for (const ing of r.custo) {
        const c = custoDoIngrediente(ing);
        if (c === null) {
          fechada = false;
          break;
        }
        valorEntrada += c;
      }
      if (!fechada) continue;

      expect(
        valorSaida,
        `receita ${r.saida.qtd}× id ${r.saida.id} vale ${valorSaida} e custa ${valorEntrada} — máquina de Dimas`,
      ).toBeLessThanOrEqual(valorEntrada);
    }
  });

  it("todo COZIMENTO: saída vale ≤ entrada", () => {
    // A fornalha é o caso mais perigoso: ela roda sozinha e o combustível não
    // entra nesta conta, então "empatar" já é o teto.
    for (const [entrada, saida] of COZIMENTO) {
      const precoSaida = precoDeVenda(saida.id);
      const precoEntrada = precoDeVenda(entrada);
      if (precoSaida === null || precoEntrada === null) continue;
      expect(
        precoSaida * saida.qtd,
        `cozinhar id ${entrada} (${precoEntrada}) devolve ${saida.qtd}× id ${saida.id} — máquina de Dimas`,
      ).toBeLessThanOrEqual(precoEntrada);
    }
  });
});

describe("§💰 total do balcão", () => {
  const vazio: Slot[] = Array.from({ length: 9 }, () => null);

  it("balcão vazio vale zero", () => {
    expect(totalDoBalcao(vazio)).toBe(0);
  });

  it("soma preço × quantidade, com buraco no meio", () => {
    const slots: Slot[] = [...vazio];
    slots[0] = { id: ITEM_TRIGO, qtd: 10 }; // 2 × 10 = 20
    slots[4] = { id: ITEM_DIAMANTE, qtd: 2 }; // 20 × 2 = 40
    expect(totalDoBalcao(slots)).toBe(60);
  });

  it("item sem preço conta ZERO em vez de derrubar a soma", () => {
    const slots: Slot[] = [...vazio];
    slots[0] = { id: ITEM_TRIGO, qtd: 1 };
    slots[1] = { id: BlockId.Planks, qtd: 64 };
    expect(totalDoBalcao(slots)).toBe(2);
  });
});
