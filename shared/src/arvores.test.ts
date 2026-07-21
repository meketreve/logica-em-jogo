import { describe, expect, it } from "vitest";
import { plantarArvore, plantarMandacaru } from "./arvores";
import { BlockId } from "./blocks";
import { createWorld, getBlock } from "./world";

const DIMS = { x: 2, z: 2, y: 2 }; // 32³ — sobra teto pra qualquer espécie

describe("árvores (2026-07-20)", () => {
  const especies = [
    ["comum", BlockId.Log, BlockId.Leaves],
    ["ipe", BlockId.LogIpe, BlockId.FolhasIpe],
    ["araucaria", BlockId.LogAraucaria, BlockId.FolhasAraucaria],
    ["paubrasil", BlockId.LogPauBrasil, BlockId.FolhasPauBrasil],
  ] as const;

  it("copa envolve ao menos o bloco de topo do tronco (playtest 2026-07-20)", () => {
    for (const [tipo, log, folha] of especies) {
      const w = createWorld(DIMS);
      plantarArvore(w, 16, 4, 16, tipo, 0.2);
      // topo do tronco = célula de log mais alta da coluna
      let topo = -1;
      for (let y = 0; y < w.sizeY; y++) if (getBlock(w, 16, y, 16) === log) topo = y;
      expect(topo, tipo).toBeGreaterThan(4);
      // os 4 flancos do topo do tronco têm folha da PRÓPRIA espécie
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        expect(getBlock(w, 16 + dx, topo, 16 + dz), `${tipo} flanco ${dx},${dz}`).toBe(folha);
      }
    }
  });

  it("cada espécie usa o próprio tronco e a própria copa", () => {
    for (const [tipo, log, folha] of especies) {
      const w = createWorld(DIMS);
      plantarArvore(w, 16, 4, 16, tipo, 0.9);
      let logs = 0;
      let folhas = 0;
      for (let x = 0; x < w.sizeX; x++)
        for (let y = 0; y < w.sizeY; y++)
          for (let z = 0; z < w.sizeZ; z++) {
            const b = getBlock(w, x, y, z);
            if (b === log) logs++;
            else if (b === folha) folhas++;
            else expect(b, tipo).toBe(BlockId.Air);
          }
      expect(logs, tipo).toBeGreaterThanOrEqual(3);
      expect(folhas, tipo).toBeGreaterThan(logs); // copa maior que tronco
    }
  });

  it("mandacaru: coluna de 2-3 células", () => {
    const w = createWorld(DIMS);
    plantarMandacaru(w, 8, 4, 8, 0.9);
    expect(getBlock(w, 8, 4, 8)).toBe(BlockId.Mandacaru);
    expect(getBlock(w, 8, 5, 8)).toBe(BlockId.Mandacaru);
    expect(getBlock(w, 8, 6, 8)).toBe(BlockId.Mandacaru);
    expect(getBlock(w, 8, 7, 8)).toBe(BlockId.Air);
  });
});
