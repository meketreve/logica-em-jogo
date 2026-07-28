import { describe, expect, it } from "vitest";
import { BIOMAS, biomaPorClima, gramaPorClima } from "./biomas";
import { BlockId, isAgua } from "./blocks";
import { MAX_WORLD_CHUNKS } from "./constants";
import {
  type World,
  colunaGerada,
  createWorld,
  findSpawnSeco,
  findSpawnY,
  getBlock,
} from "./world";
import {
  NIVEL_MAR,
  SAND_HEIGHT,
  TAMANHO_CHUNKS,
  cavernaEm,
  cavernasDaColuna,
  climaAt,
  generateCabinsWorld,
  generateFlatWorld,
  generateWorld,
  gerarColunaDeChunks,
  heightAt,
  parseWorldTamanho,
} from "./worldgen";
import { LUZ_MAX, acenderColuna, criarLuz, luzCeu } from "./luz";

const DIMS = { x: 2, z: 2, y: 2 };

describe("worldgen: rocha-matriz na camada 0", () => {
  it("mundo normal tem bedrock em y=0 e pedra logo acima (aluno não fura o fundo)", () => {
    const w = generateWorld(DIMS, 7);
    const cols: Array<{ x: number; z: number }> = [
      { x: 0, z: 0 },
      { x: 5, z: 9 },
      { x: w.sizeX - 1, z: w.sizeZ - 1 },
    ];
    for (const { x, z } of cols) {
      expect(getBlock(w, x, 0, z)).toBe(BlockId.Bedrock);
      expect(getBlock(w, x, 1, z)).toBe(BlockId.Stone);
    }
  });

  it("mundo plano e cabines já têm bedrock em y=0", () => {
    const flat = generateFlatWorld(DIMS);
    const cab = generateCabinsWorld(DIMS);
    expect(getBlock(flat, 3, 0, 3)).toBe(BlockId.Bedrock);
    expect(getBlock(cab, 3, 0, 3)).toBe(BlockId.Bedrock);
  });
});

describe("tamanho de mundo P/M/G (2026-07-19)", () => {
  it("parse defensivo e dims dentro do teto do motor", () => {
    expect(parseWorldTamanho("M")).toBe("M");
    expect(parseWorldTamanho("G")).toBe("G");
    expect(parseWorldTamanho("x")).toBe("P");
    expect(parseWorldTamanho(undefined)).toBe("P");
    // altura 128 em todos os tamanhos (2026-07-20, montanhas de verdade)
    expect(TAMANHO_CHUNKS.P).toEqual({ x: 8, z: 8, y: 8 });
    expect(TAMANHO_CHUNKS.M).toEqual({ x: 12, z: 12, y: 8 });
    for (const t of ["P", "M", "G"] as const) {
      const d = TAMANHO_CHUNKS[t];
      expect(d.x).toBeLessThanOrEqual(MAX_WORLD_CHUNKS.x);
      expect(d.z).toBeLessThanOrEqual(MAX_WORLD_CHUNKS.z);
      expect(d.y).toBeLessThanOrEqual(MAX_WORLD_CHUNKS.y);
    }
  });

  it("mundo G gera nos limites novos (256×256×128) com bedrock no fundo", () => {
    const world = generateWorld(TAMANHO_CHUNKS.G, 7);
    expect(world.sizeX).toBe(256);
    expect(world.sizeY).toBe(128);
    expect(getBlock(world, 255, 0, 255)).toBe(BlockId.Bedrock);
    expect(getBlock(world, 128, 20, 128)).not.toBe(BlockId.Air); // terreno existe
  });
});

describe("gen procedural com biomas (2026-07-20)", () => {
  it("determinístico: mesma seed = mesmos bytes (requisito de save/snapshot)", () => {
    const a = generateWorld({ x: 4, z: 4, y: 4 }, 42);
    const b = generateWorld({ x: 4, z: 4, y: 4 }, 42);
    for (let i = 0; i < a.chunks.length; i++) {
      expect(a.chunks[i]).toEqual(b.chunks[i]);
    }
  });

  it("ORDEM-INDEPENDENTE: colunas geradas em ordem embaralhada = mesmos bytes (streaming F1)", () => {
    const dims = { x: 4, z: 4, y: 8 };
    const a = generateWorld(dims, 13); // ordem natural (ccx,ccz crescente)
    const b = createWorld(dims, false);
    // ordem embaralhada determinística (stride primo cobre todas as colunas)
    const colunas: Array<[number, number]> = [];
    for (let cx = 0; cx < dims.x; cx++)
      for (let cz = 0; cz < dims.z; cz++) colunas.push([cx, cz]);
    const n = colunas.length;
    for (let i = 0; i < n; i++) {
      const [cx, cz] = colunas[(i * 7) % n]!;
      gerarColunaDeChunks(b, cx, cz, 13);
    }
    for (let i = 0; i < a.chunks.length; i++) {
      expect(a.chunks[i], `chunk ${i}`).toEqual(b.chunks[i]);
    }
  });

  it("mundo esparso: coluna não gerada = ar (getBlock) e colunaGerada responde", () => {
    const w = createWorld({ x: 4, z: 4, y: 8 }, false);
    gerarColunaDeChunks(w, 1, 1, 13);
    expect(colunaGerada(w, 1, 1)).toBe(true);
    expect(colunaGerada(w, 0, 0)).toBe(false);
    expect(getBlock(w, 20, 0, 20)).not.toBe(BlockId.Air); // bedrock gerado
    expect(getBlock(w, 0, 0, 0)).toBe(BlockId.Air); // coluna ausente = ar
  });

  it("biomaPorClima: lookup Whittaker nos 4 biomas brasileiros", () => {
    expect(biomaPorClima({ temp: 0.2, umid: 0.5 })).toBe(BIOMAS.araucarias);
    expect(biomaPorClima({ temp: 0.8, umid: 0.2 })).toBe(BIOMAS.caatinga);
    expect(biomaPorClima({ temp: 0.5, umid: 0.7 })).toBe(BIOMAS.mata);
    expect(biomaPorClima({ temp: 0.5, umid: 0.45 })).toBe(BIOMAS.cerrado);
    // quente mas ÚMIDO não é caatinga (é mata — coerência do diagrama)
    expect(biomaPorClima({ temp: 0.8, umid: 0.7 })).toBe(BIOMAS.mata);
  });

  it("gramaPorClima: thresholds próprios criam faixa de transição (blend)", () => {
    expect(gramaPorClima({ temp: 0.3, umid: 0.5 })).toBe(BlockId.GramaFria);
    expect(gramaPorClima({ temp: 0.62, umid: 0.4 })).toBe(BlockId.GramaSeca);
    expect(gramaPorClima({ temp: 0.5, umid: 0.5 })).toBe(BlockId.Grass);
    // temp 0.38: bioma ainda NÃO é araucárias (>0.35) mas a grama JÁ é fria
    // (<0.42) — a faixa de blend na fronteira
    expect(biomaPorClima({ temp: 0.38, umid: 0.5 })).not.toBe(BIOMAS.araucarias);
    expect(gramaPorClima({ temp: 0.38, umid: 0.5 })).toBe(BlockId.GramaFria);
  });

  const varre = (world: World, alvo: number, cb: (x: number, y: number, z: number) => void) => {
    for (let x = 0; x < world.sizeX; x++) {
      for (let z = 0; z < world.sizeZ; z++) {
        for (let y = 0; y < world.sizeY; y++) {
          if (getBlock(world, x, y, z) === alvo) cb(x, y, z);
        }
      }
    }
  };

  // mundo M inteiro: variedade de clima suficiente pra amostrar os biomas
  const mundo = generateWorld(TAMANHO_CHUNKS.M, 20260720);
  const seed = 20260720;

  it("minérios respeitam a banda de profundidade (raro fica fundo)", () => {
    let carvao = 0;
    let diamante = 0;
    varre(mundo, BlockId.MinerioCarvao, (_x, y) => {
      carvao++;
      expect(y).toBeLessThan(72);
    });
    varre(mundo, BlockId.MinerioDiamante, (_x, y) => {
      diamante++;
      expect(y).toBeLessThan(8);
    });
    varre(mundo, BlockId.MinerioFerro, (_x, y) => expect(y).toBeLessThan(40));
    varre(mundo, BlockId.MinerioOuro, (_x, y) => expect(y).toBeLessThan(16));
    expect(carvao).toBeGreaterThan(0);
    expect(diamante).toBeGreaterThan(0);
    expect(carvao).toBeGreaterThan(diamante); // comum > raro
  });

  it("árvore só nasce no bioma dono da espécie", () => {
    let araucarias = 0;
    varre(mundo, BlockId.LogAraucaria, (x, _y, z) => {
      araucarias++;
      expect(biomaPorClima(climaAt(x, z, seed))).toBe(BIOMAS.araucarias);
    });
    varre(mundo, BlockId.LogPauBrasil, (x, _y, z) => {
      expect(biomaPorClima(climaAt(x, z, seed))).toBe(BIOMAS.mata);
    });
    varre(mundo, BlockId.LogIpe, (x, _y, z) => {
      expect(biomaPorClima(climaAt(x, z, seed))).toBe(BIOMAS.cerrado);
    });
    expect(araucarias).toBeGreaterThan(0); // a seed amostra o bioma frio
  });

  it("serras: alguma coluna passa de 64 (montanha de verdade), sem furar o teto", () => {
    let maxH = 0;
    for (let x = 0; x < mundo.sizeX; x++) {
      for (let z = 0; z < mundo.sizeZ; z++) {
        const h = heightAt(x, z, seed);
        if (h > maxH) maxH = h;
      }
    }
    expect(maxH).toBeGreaterThan(64);
    expect(maxH).toBeLessThan(127); // cabe no mundo de 128 sem clamp
  });

  it("neve só onde é FRIO — nunca em cima da caatinga (playtest 2026-07-20)", () => {
    let n = 0;
    varre(mundo, BlockId.Snow, (x, _y, z) => {
      n++;
      expect(climaAt(x, z, seed).temp).toBeLessThan(0.6);
    });
    expect(n).toBeGreaterThan(0); // a seed tem pico frio nevado
  });

  it("mandacaru só na caatinga e fora d'água", () => {
    let n = 0;
    varre(mundo, BlockId.Mandacaru, (x, y, z) => {
      n++;
      expect(biomaPorClima(climaAt(x, z, seed))).toBe(BIOMAS.caatinga);
      expect(y).toBeGreaterThan(NIVEL_MAR + 1); // base acima da linha d'água
    });
    expect(n).toBeGreaterThan(0);
  });

  it("topo da coluna segue clima: grama variante bate com gramaPorClima", () => {
    // amostra colunas de grama (fora praia/neve) e confere a variante
    let conferidas = 0;
    for (let x = 0; x < mundo.sizeX; x += 7) {
      for (let z = 0; z < mundo.sizeZ; z += 7) {
        const h = Math.min(heightAt(x, z, seed), mundo.sizeY - 2);
        const topo = getBlock(mundo, x, h, z);
        const ehGrama =
          topo === BlockId.Grass || topo === BlockId.GramaSeca || topo === BlockId.GramaFria;
        if (!ehGrama) continue;
        expect(topo).toBe(gramaPorClima(climaAt(x, z, seed)));
        conferidas++;
      }
    }
    expect(conferidas).toBeGreaterThan(50);
  });
});

describe("mar e lagos (2026-07-26)", () => {
  const seedMar = 20260720;
  const mundoMar = generateWorld(TAMANHO_CHUNKS.P, seedMar);

  it("coluna abaixo do nível do mar é inundada até a linha d'água; acima fica seca", () => {
    let inundadas = 0;
    let secas = 0;
    for (let x = 0; x < mundoMar.sizeX; x++) {
      for (let z = 0; z < mundoMar.sizeZ; z++) {
        const h = heightAt(x, z, seedMar, mundoMar.sizeY);
        if (h < NIVEL_MAR) {
          inundadas++;
          // água da superfície do terreno até o nível do mar, e AR logo acima
          expect(getBlock(mundoMar, x, h + 1, z)).toBe(BlockId.Agua);
          expect(getBlock(mundoMar, x, NIVEL_MAR, z)).toBe(BlockId.Agua);
          expect(getBlock(mundoMar, x, NIVEL_MAR + 1, z)).toBe(BlockId.Air);
        } else {
          secas++;
          expect(getBlock(mundoMar, x, h + 1, z)).not.toBe(BlockId.Agua);
        }
      }
    }
    expect(inundadas).toBeGreaterThan(0); // a seed tem bacia
    expect(secas).toBeGreaterThan(inundadas); // ...e o mundo não é só oceano
  });

  it("a água é FONTE (nível 8) — poça auto-regenerativa, não escorre sozinha", () => {
    for (let x = 0; x < mundoMar.sizeX && x < 64; x++) {
      for (let z = 0; z < mundoMar.sizeZ && z < 64; z++) {
        const b = getBlock(mundoMar, x, NIVEL_MAR, z);
        if (b !== BlockId.Air) expect(b === BlockId.Agua || !isAgua(b)).toBe(true);
      }
    }
  });

  it("praia: o topo seco na beira d'água é areia (SAND_HEIGHT acompanha o mar)", () => {
    expect(SAND_HEIGHT).toBe(NIVEL_MAR + 1);
    for (let x = 0; x < mundoMar.sizeX; x++) {
      for (let z = 0; z < mundoMar.sizeZ; z++) {
        const h = heightAt(x, z, seedMar, mundoMar.sizeY);
        if (h === NIVEL_MAR || h === SAND_HEIGHT) {
          expect(getBlock(mundoMar, x, h, z)).toBe(BlockId.Sand);
        }
      }
    }
  });

  it("mundo plano e cabines (aulas) NÃO têm água", () => {
    for (const w of [generateFlatWorld(DIMS), generateCabinsWorld(DIMS)]) {
      let agua = 0;
      for (let x = 0; x < w.sizeX; x++)
        for (let z = 0; z < w.sizeZ; z++)
          for (let y = 0; y < w.sizeY; y++) if (isAgua(getBlock(w, x, y, z))) agua++;
      expect(agua).toBe(0);
    }
  });

  it("findSpawnSeco tira o spawn de dentro d'água", () => {
    // acha uma coluna inundada e pede um spawn seco a partir dela
    let molhada: { x: number; z: number } | null = null;
    for (let x = 0; x < mundoMar.sizeX && !molhada; x++) {
      for (let z = 0; z < mundoMar.sizeZ; z++) {
        if (heightAt(x, z, seedMar, mundoMar.sizeY) < NIVEL_MAR) {
          molhada = { x, z };
          break;
        }
      }
    }
    expect(molhada).not.toBeNull();
    const seco = findSpawnSeco(mundoMar, molhada!.x, molhada!.z);
    const y = findSpawnY(mundoMar, seco.x, seco.z);
    expect(isAgua(getBlock(mundoMar, seco.x, y - 1, seco.z))).toBe(false);
  });
});

describe("§🏔️ cavernas (2026-07-28)", () => {
  /** Mundo denso de 4×4 colunas com altura cheia — as cavernas moram em y≥2 e
   *  o relevo alto só existe com sizeY 128. */
  const DIMS_CAV = { x: 4, z: 4, y: 8 };
  const SEED_CAV = 20260728;

  const mundoComCaverna = (): World => generateWorld(DIMS_CAV, SEED_CAV);

  /** Fração do subsolo (y de 2 até o topo) que virou vazio. */
  const fracaoEscavada = (w: World, seed: number): number => {
    let subsolo = 0;
    let vazio = 0;
    for (let x = 0; x < w.sizeX; x++)
      for (let z = 0; z < w.sizeZ; z++) {
        const h = Math.min(heightAt(x, z, seed, w.sizeY), w.sizeY - 2);
        for (let y = 2; y <= h; y++) {
          subsolo++;
          if (getBlock(w, x, y, z) === BlockId.Air) vazio++;
        }
      }
    return vazio / subsolo;
  };

  it("escava na densidade calibrada — medida em VÁRIAS seeds, não em uma", () => {
    // Medido em 2026-07-28: a densidade varia MUITO de seed pra seed (1,2% a
    // 7,7% num mundo 4×4), porque a célula do ruído tem 26 blocos e um mundo
    // pequeno mal cobre duas delas. Uma seed só, portanto, não calibra nada — a
    // do `?bench` (20260726) é justamente das mais vazias. A média de um punhado
    // de seeds é o que segura o LIMIAR_CAVERNA.
    const seeds = [1, 42, 13, 20260726, SEED_CAV];
    const fracs = seeds.map((s) => fracaoEscavada(generateWorld(DIMS_CAV, s), s));
    const media = fracs.reduce((a, b) => a + b, 0) / fracs.length;
    // toda seed tem ALGUMA caverna (mundo sem nenhuma seria bug de gate)
    for (const f of fracs) expect(f).toBeGreaterThan(0.005);
    // e a média fica na faixa: abaixo, a caverna não se acha; acima, o subsolo
    // vira queijo suíço e a conta de triângulos explode (sem caverna eram
    // 153 852 tris no bench; com elas, 255 234).
    expect(media).toBeGreaterThan(0.02);
    expect(media).toBeLessThan(0.07);
  });

  it("a rocha-matriz e o piso sobre ela NUNCA se abrem", () => {
    const w = mundoComCaverna();
    for (let x = 0; x < w.sizeX; x++)
      for (let z = 0; z < w.sizeZ; z++) {
        expect(getBlock(w, x, 0, z)).toBe(BlockId.Bedrock);
        expect(getBlock(w, x, 1, z)).not.toBe(BlockId.Air);
      }
  });

  it("a galeria FECHA na fronteira de coluna, gere-se na ordem que for", () => {
    // o portão do mundo LAZY: cada coluna nasce sozinha, e se as duas não
    // concordarem sobra uma parede de pedra no meio do túnel.
    const a = createWorld(DIMS_CAV, false);
    for (let cx = 0; cx < DIMS_CAV.x; cx++)
      for (let cz = 0; cz < DIMS_CAV.z; cz++) gerarColunaDeChunks(a, cx, cz, SEED_CAV);
    const b = createWorld(DIMS_CAV, false);
    for (let cx = DIMS_CAV.x - 1; cx >= 0; cx--)
      for (let cz = DIMS_CAV.z - 1; cz >= 0; cz--) gerarColunaDeChunks(b, cx, cz, SEED_CAV);
    for (let i = 0; i < a.chunks.length; i++) {
      expect(Array.from(b.chunks[i] ?? [])).toEqual(Array.from(a.chunks[i] ?? []));
    }

    // e a fronteira x=16 de fato tem vazio ATRAVESSANDO (não só bytes iguais):
    // sem isto o teste passaria num mundo onde a caverna simplesmente para na
    // borda dos dois lados.
    let atravessa = 0;
    for (let z = 0; z < a.sizeZ; z++)
      for (let y = 2; y < 40; y++) {
        if (
          getBlock(a, 15, y, z) === BlockId.Air &&
          getBlock(a, 16, y, z) === BlockId.Air &&
          getBlock(a, 17, y, z) === BlockId.Air
        ) atravessa++;
      }
    expect(atravessa).toBeGreaterThan(0);
  });

  it("a caverna não escava água, e sob o mar sobra casca (fica SECA)", () => {
    const w = mundoComCaverna();
    for (let x = 0; x < w.sizeX; x++)
      for (let z = 0; z < w.sizeZ; z++) {
        const h = Math.min(heightAt(x, z, SEED_CAV, w.sizeY), w.sizeY - 2);
        if (h > NIVEL_MAR) continue; // coluna seca: boca de caverna é permitida
        // coluna SUBMERSA: o topo é a casca que separa o mar da galeria
        expect(getBlock(w, x, h, z)).not.toBe(BlockId.Air);
      }
  });

  it("plano e cabines seguem INTOCADOS (não passam pelo gerador procedural)", () => {
    const plano = generateFlatWorld(DIMS_CAV);
    const cabines = generateCabinsWorld(DIMS_CAV);
    for (const w of [plano, cabines]) {
      for (let x = 0; x < w.sizeX; x++)
        for (let z = 0; z < w.sizeZ; z++)
          for (let y = 1; y <= 2; y++) expect(getBlock(w, x, y, z)).not.toBe(BlockId.Air);
    }
  });

  it("`cavernaEm` é pura: mesma entrada, mesma resposta, e nunca acima do topo", () => {
    for (let i = 0; i < 200; i++) {
      const x = i * 7919;
      const z = i * 104729;
      const h = 40;
      const y = 2 + (i % 38);
      expect(cavernaEm(x, y, z, h, SEED_CAV)).toBe(cavernaEm(x, y, z, h, SEED_CAV));
      expect(cavernaEm(x, h + 1, z, h, SEED_CAV)).toBe(false);
      expect(cavernaEm(x, 1, z, h, SEED_CAV)).toBe(false);
    }
  });

  it("o caminho RÁPIDO da coluna concorda com `cavernaEm` célula a célula", () => {
    // `cavernasDaColuna` amortiza o ruído por fatia (é ela que a geração usa) e
    // `cavernaEm` é a referência por célula (guardas de árvore e de spawn). Se as
    // duas divergirem, a árvore flutua sobre um buraco e o spawn cai num poço —
    // sem erro nenhum aparecendo. Este teste é a costura entre elas.
    const saida = new Uint8Array(128);
    for (const seed of [1, SEED_CAV]) {
      for (let i = 0; i < 60; i++) {
        const x = i * 37 - 500;
        const z = i * 91 - 300;
        const h = 12 + ((i * 7) % 90);
        cavernasDaColuna(x, z, h, seed, saida);
        for (let y = 0; y < 128; y++) {
          expect(saida[y] === 1, `x=${x} y=${y} z=${z} h=${h} seed=${seed}`).toBe(
            cavernaEm(x, y, z, h, seed),
          );
        }
      }
    }
  });

  it("§💡 a caverna nasce ESCURA e a superfície não (é o ponto da fase)", () => {
    const w = mundoComCaverna();
    const luz = criarLuz(w.dims);
    for (let cx = 0; cx < w.dims.x; cx++)
      for (let cz = 0; cz < w.dims.z; cz++) acenderColuna(w, luz, cx, cz);

    let escuras = 0;
    let fundas = 0;
    for (let x = 0; x < w.sizeX; x++)
      for (let z = 0; z < w.sizeZ; z++) {
        const h = Math.min(heightAt(x, z, SEED_CAV, w.sizeY), w.sizeY - 2);
        // céu aberto acima de TUDO: 15 em toda coluna. (Em h+1 não vale — ali
        // pode haver copa de árvore por cima, e folha atenua 1 de propósito.)
        expect(luzCeu(luz, x, w.sizeY - 1, z)).toBe(LUZ_MAX);
        // célula de caverna 8+ blocos abaixo do topo: sem poço, é breu
        for (let y = 2; y <= h - 8; y++) {
          if (getBlock(w, x, y, z) !== BlockId.Air) continue;
          fundas++;
          if (luzCeu(luz, x, y, z) === 0) escuras++;
        }
      }
    expect(fundas).toBeGreaterThan(100);
    // a esmagadora maioria é breu; o resto é o que fica embaixo de um poço que
    // atravessa até a superfície — e esse É pra ser claro.
    expect(escuras / fundas).toBeGreaterThan(0.9);
  });
});
