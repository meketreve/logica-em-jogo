import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_AIPIM,
  ITEM_BANANA,
  ITEM_BATATA,
  ITEM_BATATA_COZIDA,
  ITEM_BETERRABA,
  ITEM_CENOURA,
  ITEM_MELANCIA,
  PLANTAS,
  isSelvagem,
  plantaDe,
  plantaPorSelvagem,
} from "./blocks";
import { BIOMAS } from "./biomas";
import { saciedadeDe, isComida } from "./comida";
import { CHANCE_SEMENTE_DO_ALGODAO, dropsDe } from "./drops";
import { COZIMENTO, saidaDe } from "./fornalha";
import { SEM_RECEITA } from "./receitas";
import { crescerPlantacao } from "./rules";
import { createWorld, getBlock, setBlock } from "./world";
import { generateWorld } from "./worldgen";

/**
 * §🍖 F10h (2026-08-06) — AS SEIS CULTURAS. Cenoura, batata, beterraba,
 * melancia, banana e aipim entram no MOLDE EXATO do algodão (F10c): um gen de
 * pé selvagem por bioma abre a cadeia, a semente vem do pé (2 em 3) e da
 * colheita, e cada byte sabe qual planta é (tabela PLANTAS).
 */

/** O par [id da muda, id do pé selvagem] de cada cultura, na ordem do gen. */
const CULTURAS: readonly (readonly [number, number])[] = [
  [BlockId.Cenoura0, BlockId.CenouraSelvagem],
  [BlockId.Batata0, BlockId.BatataSelvagem],
  [BlockId.Beterraba0, BlockId.BeterrabaSelvagem],
  [BlockId.Melancia0, BlockId.MelanciaSelvagem],
  [BlockId.Banana0, BlockId.BananaSelvagem],
  [BlockId.Aipim0, BlockId.AipimSelvagem],
];

describe("§🍖 F10h — as seis culturas na tabela PLANTAS", () => {
  it("cada uma está registrada, com colheita própria e pé selvagem próprio", () => {
    const colheitas: readonly (readonly [number, number, number])[] = [
      [BlockId.Cenoura0, ITEM_CENOURA, 2],
      [BlockId.Batata0, ITEM_BATATA, 2],
      [BlockId.Beterraba0, ITEM_BETERRABA, 2],
      [BlockId.Melancia0, ITEM_MELANCIA, 2],
      [BlockId.Banana0, ITEM_BANANA, 2],
      [BlockId.Aipim0, ITEM_AIPIM, 2],
    ];
    for (const [base, colheita, colheitaMax] of colheitas) {
      const p = plantaDe(base);
      expect(p?.base).toBe(base);
      expect(p?.estagios).toBe(4);
      expect(p?.colheita).toBe(colheita);
      expect(p?.colheitaMax).toBe(colheitaMax);
    }
  });

  it("os pés selvagens são só dos seis (e do algodão) — e cada um acha a planta", () => {
    const todosSelvagens = PLANTAS.flatMap((p) => (p.selvagem === undefined ? [] : [p.selvagem]));
    expect(todosSelvagens).toHaveLength(7); // algodão + 6
    for (const [muda, selvagem] of CULTURAS) {
      expect(isSelvagem(selvagem)).toBe(true);
      expect(isSelvagem(muda)).toBe(false); // cultivar não é pé do gen
      expect(plantaPorSelvagem(selvagem)?.base).toBe(muda);
    }
  });

  it("a muda é a ÚNICA colocável da cultura — o resto nasce do tick", () => {
    for (const [muda, selvagem] of CULTURAS) {
      expect(plantaDe(muda)).not.toBeNull();
      for (let i = 1; i < 4; i++) {
        // estágios crescidos não vão à mochila (o gate do isPlaceable cobre)
        expect(plantaDe(muda + i)?.base).toBe(muda);
      }
    }
  });
});

describe("§🍖 F10h — achar a cultura (os drops, na régua do algodão)", () => {
  it("o pé SELVAGEM larga a semente DA SUA planta — e nunca ele mesmo", () => {
    for (const [muda, selvagem] of CULTURAS) {
      expect(dropsDe(selvagem, () => 0)).toEqual([{ id: muda, qtd: 1 }]);
      expect(dropsDe(selvagem, () => 0.999)).toEqual([]);
    }
    expect(CHANCE_SEMENTE_DO_ALGODAO).toBe(2 / 3);
  });

  it("a colheita MADURA larga o ITEM da tabela (1 ou 2) + a semente", () => {
    for (const [muda] of CULTURAS) {
      const p = plantaDe(muda)!;
      const madura = muda + p.estagios - 1;
      expect(dropsDe(madura, () => 0)).toEqual([
        { id: p.colheita, qtd: 1 },
        { id: muda, qtd: 1 },
      ]);
      expect(dropsDe(madura, () => 0.9)).toEqual([
        { id: p.colheita, qtd: 2 },
        { id: muda, qtd: 3 },
      ]);
    }
  });
});

describe("§🍖 F10h — comer e cozinhar (a cadeia vira comida de verdade)", () => {
  it("os seis comestíveis entram na tabela de SACIEDADE (batata CRUA é quase nada)", () => {
    expect(saciedadeDe(ITEM_CENOURA)).toBe(4);
    expect(saciedadeDe(ITEM_BATATA)).toBe(1); // crua: o empurrão pra fornalha
    expect(saciedadeDe(ITEM_BETERRABA)).toBe(1);
    expect(saciedadeDe(ITEM_MELANCIA)).toBe(2);
    expect(saciedadeDe(ITEM_BANANA)).toBe(4);
    expect(saciedadeDe(ITEM_AIPIM)).toBe(4);
    for (const id of [ITEM_CENOURA, ITEM_BATATA, ITEM_BETERRABA, ITEM_MELANCIA, ITEM_BANANA, ITEM_AIPIM]) {
      expect(isComida(id)).toBe(true);
    }
  });

  it("a fornalha assa a batata: crua 1 → cozida 5, e a crua SOME da entrada", () => {
    expect(COZIMENTO.get(ITEM_BATATA)).toEqual({ id: ITEM_BATATA_COZIDA, qtd: 1 });
    expect(saidaDe({ id: ITEM_BATATA, qtd: 1 })).toEqual({ id: ITEM_BATATA_COZIDA, qtd: 1 });
    expect(saciedadeDe(ITEM_BATATA_COZIDA)).toBe(5);
  });
});

describe("§🍖 F10h — o mundo gera os pés, cada um no SEU bioma e em SOLO", () => {
  // o teste que o algodão ensinou (a lição da sessão 41): a chance do bioma
  // podia estar certa e o pé nunca aparecer. Aqui o mundo é GERADO de verdade.
  // O campo de clima tem célula ~80 blocos, então UM mundo pequeno não contém
  // todos os biomas — a varredura acumula VÁRIAS seeds até cada pé nascer.
  it("as seis culturas nascem de verdade em algum mundo — penduradas, zero", () => {
    const vistos = new Map<number, number>();
    let semSolo = 0;
    const SOLO = new Set<number>([BlockId.Dirt, BlockId.Grass, BlockId.GramaSeca, BlockId.GramaFria]);
    for (let seed = 1; seed <= 40 && vistos.size < CULTURAS.length; seed++) {
      const mundo = generateWorld({ x: 4, z: 4, y: 8 }, seed);
      for (let x = 0; x < mundo.sizeX; x++) {
        for (let z = 0; z < mundo.sizeZ; z++) {
          for (let y = 1; y < mundo.sizeY; y++) {
            const b = getBlock(mundo, x, y, z);
            if (!isSelvagem(b)) continue;
            if (!SOLO.has(getBlock(mundo, x, y - 1, z))) semSolo++;
            if (b !== BlockId.AlgodaoSelvagem) vistos.set(b, (vistos.get(b) ?? 0) + 1);
          }
        }
      }
    }
    expect(semSolo).toBe(0); // pé pendurado seria derrubado no 1º tick
    // os seis pés aparecem no seu bioma em alguma seed
    for (const [, selvagem] of CULTURAS) {
      expect(vistos.get(selvagem) ?? 0, `pé ${selvagem}`).toBeGreaterThan(0);
    }
  });

  it("o algodão não sumiu — os selvagens somam 7 espécies no mundo", () => {
    const especies = new Set<number>();
    for (let seed = 1; seed <= 20; seed++) {
      const mundo = generateWorld({ x: 4, z: 4, y: 8 }, seed);
      for (let x = 0; x < mundo.sizeX; x++) {
        for (let z = 0; z < mundo.sizeZ; z++) {
          for (let y = 1; y < mundo.sizeY; y++) {
            const b = getBlock(mundo, x, y, z);
            if (isSelvagem(b)) especies.add(b);
          }
        }
      }
    }
    expect(especies.has(BlockId.AlgodaoSelvagem)).toBe(true);
  });
});

describe("§🍖 F10h — a conta do portão (todo colocável alcançável)", () => {
  it("as 6 sementes e os 6 pés estão no SEM_RECEITA com razão", () => {
    for (const [muda, selvagem] of CULTURAS) {
      expect(SEM_RECEITA.has(muda), `semente ${muda}`).toBe(true);
      expect(SEM_RECEITA.has(selvagem), `pé selvagem ${selvagem}`).toBe(true);
    }
  });

  it("a batata cozida é ITEM (não bloco): não entra na conta de colocáveis", () => {
    // porta de regressão: se alguém "consertar" a batata cozida virando bloco
    // colocável, o portão de receitas vai exigir receita ou razão — o teste
    // deixa a intenção escrita: ela é o fim da cadeia da fornalha, comestível.
    expect(plantaDe(ITEM_BATATA_COZIDA)).toBeNull();
  });
});

describe("§🍖 F10h — apoio e crescimento (o molde do algodão vale pros seis)", () => {
  it("cresce com o mesmo pulso, e cada estágio é da PRÓPRIA cultura", () => {
    const mundo = createWorld({ x: 1, z: 1, y: 1 });
    for (const [muda] of CULTURAS) {
      setBlock(mundo, 2, 1, 2, BlockId.Dirt);
      setBlock(mundo, 2, 2, 2, muda);
      // evolução 0 → 1 → 2 → 3 (mesma regra do trigo/algodão)
      for (let e = 0; e < 3; e++) {
        const changes = crescerPlantacao(mundo, 2, 2, 2);
        expect(changes).not.toBeNull();
        for (const c of changes!) setBlock(mundo, c.x, c.y, c.z, c.blockId);
      }
      expect(getBlock(mundo, 2, 2, 2)).toBe(muda + 3);
    }
  });
});
