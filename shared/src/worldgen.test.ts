import { describe, expect, it } from "vitest";
import { BIOMAS, biomaPorClima, gramaPorClima } from "./biomas";
import { BlockId } from "./blocks";
import { MAX_WORLD_CHUNKS } from "./constants";
import { type World, getBlock } from "./world";
import {
  SAND_HEIGHT,
  TAMANHO_CHUNKS,
  climaAt,
  generateCabinsWorld,
  generateFlatWorld,
  generateWorld,
  heightAt,
  parseWorldTamanho,
} from "./worldgen";

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

  it("mandacaru só na caatinga e fora da praia", () => {
    let n = 0;
    varre(mundo, BlockId.Mandacaru, (x, y, z) => {
      n++;
      expect(biomaPorClima(climaAt(x, z, seed))).toBe(BIOMAS.caatinga);
      expect(y).toBeGreaterThan(SAND_HEIGHT + 1); // base acima da linha de praia
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
