import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_ALGODAO,
  ITEM_TRIGO,
  MAX_BLOCK_ID,
  PLANTAS,
  apoioValido,
  estagioPlantacao,
  isMudaDePlantacao,
  isPlantacao,
  isPlantacaoMadura,
  isGramaAlta,
  isPlaceable,
  isSolo,
  plantaDe,
} from "./blocks";
import { BIOMAS } from "./biomas";
import { CHANCE_SEMENTE_DO_ALGODAO, dropsDe, formaCanonica } from "./drops";
import { RECEITAS, receitaAtiva } from "./receitas";
import { TICKS_POR_CRESCIMENTO, crescerPlantacao } from "./rules";
import { createWorld, getBlock, setBlock } from "./world";
import { generateWorld } from "./worldgen";

/**
 * §🍖 F10c — ALGODÃO. A ponte HONESTA que aposenta a lã-de-trigo: o lite não
 * tem ovelha, e a sessão 45 resolveu isso com "lã ← trigo", o que fez a horta
 * escolher entre alimentar e vestir. Agora a fibra tem planta própria, com a
 * mesma cadeia que o trigo já ensina.
 */

/** Mundo pequeno com terra em (2,1,2) e ar por cima — o canteiro dos testes. */
function canteiro() {
  // `alocar` = true: sem os chunks alocados o `setBlock` não grava nada e o
  // teste provaria a coisa errada (o 2º argumento NÃO é "lazy")
  const world = createWorld({ x: 1, z: 1, y: 1 });
  setBlock(world, 2, 1, 2, BlockId.Dirt);
  setBlock(world, 2, 2, 2, BlockId.Air);
  return world;
}

describe("§🍖 F10c — a planta virou TABELA (trigo e algodão são o mesmo motor)", () => {
  it("as duas plantas estão na tabela, e cada byte sabe de qual é", () => {
    expect(PLANTAS).toHaveLength(2);
    expect(plantaDe(BlockId.Plantacao2)?.base).toBe(BlockId.Plantacao0);
    expect(plantaDe(BlockId.Algodao2)?.base).toBe(BlockId.Algodao0);
    expect(plantaDe(BlockId.Stone)).toBeNull();
    expect(plantaDe(BlockId.AlgodaoSelvagem)).toBeNull(); // o selvagem não CRESCE
  });

  it("estágio, muda e madura respondem certo pras DUAS", () => {
    for (const p of PLANTAS) {
      expect(isMudaDePlantacao(p.base)).toBe(true);
      expect(estagioPlantacao(p.base)).toBe(0);
      expect(isPlantacaoMadura(p.base)).toBe(false);
      const madura = p.base + p.estagios - 1;
      expect(isPlantacaoMadura(madura)).toBe(true);
      expect(estagioPlantacao(madura)).toBe(p.estagios - 1);
      expect(isPlantacao(madura)).toBe(true);
    }
  });

  it("só a MUDA se coloca — os estágios crescidos nascem do tick", () => {
    for (const p of PLANTAS) {
      expect(isPlaceable(p.base)).toBe(true);
      for (let i = 1; i < p.estagios; i++) expect(isPlaceable(p.base + i)).toBe(false);
    }
  });

  it("cada estágio volta como a muda DA SUA planta (não a do trigo sempre)", () => {
    expect(formaCanonica(BlockId.Algodao3)).toBe(BlockId.Algodao0);
    expect(formaCanonica(BlockId.Plantacao3)).toBe(BlockId.Plantacao0);
  });

  it("algodão precisa de SOLO, como toda planta (não pega em pedra nem em areia)", () => {
    expect(apoioValido(BlockId.Algodao0, BlockId.Dirt)).toBe(true);
    expect(apoioValido(BlockId.Algodao0, BlockId.Grass)).toBe(true);
    expect(apoioValido(BlockId.Algodao0, BlockId.Stone)).toBe(false);
    expect(apoioValido(BlockId.Algodao0, BlockId.Sand)).toBe(false);
    expect(apoioValido(BlockId.AlgodaoSelvagem, BlockId.Stone)).toBe(false);
    expect(isSolo(BlockId.Sand)).toBe(false); // por isso ele NÃO nasce na caatinga
  });

  it("o mesmo pulso faz o algodão crescer — sem regra nova, sem tick novo", () => {
    const world = canteiro();
    setBlock(world, 2, 2, 2, BlockId.Algodao0);
    for (let e = 0; e < 3; e++) {
      const changes = crescerPlantacao(world, 2, 2, 2);
      expect(changes).not.toBeNull();
      for (const c of changes!) setBlock(world, c.x, c.y, c.z, c.blockId);
      expect(getBlock(world, 2, 2, 2)).toBe(BlockId.Algodao0 + e + 1);
    }
    // maduro não passa disso
    expect(crescerPlantacao(world, 2, 2, 2)).toBeNull();
    expect(TICKS_POR_CRESCIMENTO).toBeGreaterThan(0);
  });

  it("sem solo embaixo, o algodão não cresce (a mesma pergunta do place)", () => {
    const world = canteiro();
    setBlock(world, 2, 1, 2, BlockId.Stone);
    setBlock(world, 2, 2, 2, BlockId.Algodao0);
    expect(crescerPlantacao(world, 2, 2, 2)).toBeNull();
  });
});

describe("§🍖 F10c — os drops (achar, plantar, colher)", () => {
  it("o pé SELVAGEM larga SEMENTE por sorte — e NUNCA ele mesmo", () => {
    expect(dropsDe(BlockId.AlgodaoSelvagem, () => 0)).toEqual([
      { id: BlockId.Algodao0, qtd: 1 },
    ]);
    expect(dropsDe(BlockId.AlgodaoSelvagem, () => 0.999)).toEqual([]);
    expect(CHANCE_SEMENTE_DO_ALGODAO).toBeGreaterThan(0);
  });

  it("o cultivado MADURO é o 1º drop com QUANTIDADE sorteada (1 ou 2) + a semente", () => {
    expect(dropsDe(BlockId.Algodao3, () => 0)).toEqual([
      { id: ITEM_ALGODAO, qtd: 1 },
      { id: BlockId.Algodao0, qtd: 1 },
    ]);
    expect(dropsDe(BlockId.Algodao3, () => 0.9)).toEqual([
      { id: ITEM_ALGODAO, qtd: 2 },
      { id: BlockId.Algodao0, qtd: 1 },
    ]);
  });

  it("colher VERDE devolve só a semente — arrancar cedo não premia", () => {
    for (const id of [BlockId.Algodao0, BlockId.Algodao1, BlockId.Algodao2]) {
      expect(dropsDe(id)).toEqual([{ id: BlockId.Algodao0, qtd: 1 }]);
    }
  });

  it("o trigo NÃO virou sorteio junto: a colheita dele continua fixa", () => {
    expect(dropsDe(BlockId.Plantacao3, () => 0.9)).toEqual([
      { id: ITEM_TRIGO, qtd: 1 },
      { id: BlockId.Plantacao0, qtd: 1 },
    ]);
  });
});

describe("§🍖 F10c — a lã honesta", () => {
  it("a lã branca sai de 3 ALGODÃO, e nenhuma receita cobra trigo pra vestir", () => {
    const la = RECEITAS.find((r) => r.saida.id === BlockId.WoolWhite && receitaAtiva(r));
    expect(la?.custo).toEqual([{ id: ITEM_ALGODAO, qtd: 3 }]);
    // o trigo volta a ser SÓ comida: a única receita que o cobra é o pão
    const comTrigo = RECEITAS.filter(
      (r) => receitaAtiva(r) && r.custo.some((c) => c.id === ITEM_TRIGO),
    );
    expect(comTrigo).toHaveLength(1);
    expect(comTrigo[0]!.saida.id).toBe(904); // ITEM_PAO
  });

  it("as 11 lãs coloridas não mudaram: continuam saindo da BRANCA + corante", () => {
    for (let i = 1; i < 12; i++) {
      const cor = [
        BlockId.WoolBlack, BlockId.WoolRed, BlockId.WoolOrange, BlockId.WoolYellow,
        BlockId.WoolGreen, BlockId.WoolBlue, BlockId.WoolPurple, BlockId.WoolPink,
        BlockId.WoolCyan, BlockId.WoolGray, BlockId.WoolBrown,
      ][i - 1]!;
      const r = RECEITAS.find((x) => x.saida.id === cor && receitaAtiva(x));
      expect(r?.custo[0]?.id, `lã ${cor}`).toBe(BlockId.WoolWhite);
    }
  });
});

describe("§🍖 F10c — onde o aluno ACHA a cadeia", () => {
  it("o algodão selvagem nasce no CERRADO, e não na caatinga (lá o topo é areia)", () => {
    expect(BIOMAS.cerrado.algodao).toBeGreaterThan(0);
    expect(BIOMAS.caatinga.algodao).toBe(0);
    // e é mais raro que o capim: achar tem de ser descoberta, não chão inteiro
    expect(BIOMAS.cerrado.algodao).toBeLessThan(BIOMAS.cerrado.gramaAlta);
  });

  it("todo bioma declara a chance (bioma novo não nasce sem responder isto)", () => {
    for (const b of Object.values(BIOMAS)) {
      expect(typeof b.algodao).toBe("number");
      expect(b.algodao).toBeGreaterThanOrEqual(0);
    }
  });

  // o teto deixou de ser o algodão quando o refino da frente da fornalha
  // apendou 194-199; o que importa (e o que este teste guarda) é que ele
  // ALCANCE o algodão, que é o portão de drops varrendo até lá
  it("o teto de ids alcança o algodão (o portão de drops varre até ele)", () => {
    expect(MAX_BLOCK_ID).toBeGreaterThanOrEqual(BlockId.AlgodaoSelvagem);
  });
});

describe("§🍖 F10c — e ele NASCE MESMO no mundo (a lição da sessão 41)", () => {
  it("um mundo gerado tem pé de algodão, e ele está sempre em SOLO", () => {
    // o teste que importa: `bioma.algodao` podia estar certo e o pé nunca
    // aparecer (sorteio pulado, `else if` na ordem errada, apoio recusando).
    // Aqui o mundo é GERADO de verdade e os pés são CONTADOS.
    const world = generateWorld({ x: 4, z: 4, y: 4 }, 12345);
    let pes = 0;
    let semSolo = 0;
    for (let x = 0; x < world.sizeX; x++) {
      for (let z = 0; z < world.sizeZ; z++) {
        for (let y = 1; y < world.sizeY; y++) {
          if (getBlock(world, x, y, z) !== BlockId.AlgodaoSelvagem) continue;
          pes++;
          if (!isSolo(getBlock(world, x, y - 1, z))) semSolo++;
        }
      }
    }
    expect(pes).toBeGreaterThan(0);
    expect(semSolo).toBe(0); // pé pendurado seria derrubado no 1º tick
  });

  it("e o capim continua nascendo junto (o algodão não comeu a vez dele)", () => {
    // controle NEGATIVO do `else if`: o algodão entrou ANTES do capim na
    // cadeia, e um erro ali teria trocado o cerrado inteiro de vegetação.
    const world = generateWorld({ x: 4, z: 4, y: 4 }, 12345);
    let capim = 0;
    for (let x = 0; x < world.sizeX; x++) {
      for (let z = 0; z < world.sizeZ; z++) {
        for (let y = 1; y < world.sizeY; y++) {
          if (isGramaAlta(getBlock(world, x, y, z))) capim++;
        }
      }
    }
    expect(capim).toBeGreaterThan(0);
  });
});
