import { describe, expect, it } from "vitest";
import { CHUNK_SIZE } from "./constants";
import {
  CELULA_DY,
  CELULA_Y0,
  COLUNAS_AULA,
  MAX_GRUPOS_AULA,
  caixaDaCelula,
  chunkDoGrupo,
  chunkDoMolde,
  chunkDoProfessor,
  dimsDaAula,
  linhasDaGrade,
} from "./grade";

/**
 * A grade da aula (2026-08-17). O layout antigo era uma FILEIRA: um chunk por
 * grupo em X, todos no mesmo Z — 8 grupos = 128 blocos em linha. Agora é uma
 * grade de COLUNAS_AULA colunas, em ordem de LEITURA, e o mundo já nasce do
 * tamanho do teto, para o professor nunca esbarrar no inBounds durante a aula.
 */
describe("grade da aula", () => {
  it("mapeia o grupo na célula em ordem de leitura", () => {
    const prof = chunkDoProfessor();
    // primeira fileira: colunas 0..5, logo à frente do professor
    expect(chunkDoGrupo(1)).toEqual({ cx: 0, cz: prof.cz + 1 });
    expect(chunkDoGrupo(6)).toEqual({ cx: 5, cz: prof.cz + 1 });
    // grupo 7 quebra a linha
    expect(chunkDoGrupo(7)).toEqual({ cx: 0, cz: prof.cz + 2 });
    expect(chunkDoGrupo(20)).toEqual({ cx: 1, cz: prof.cz + 4 });
    // o teto: 35 = 5ª coluna da 6ª fileira (i=34 → 34%6=4, floor(34/6)=5)
    expect(chunkDoGrupo(MAX_GRUPOS_AULA)).toEqual({ cx: 4, cz: prof.cz + 6 });
  });

  it("usa 6 colunas e 6 fileiras para o teto de 35", () => {
    expect(COLUNAS_AULA).toBe(6);
    expect(MAX_GRUPOS_AULA).toBe(35);
    expect(linhasDaGrade()).toBe(6);
  });

  it("dimensiona o mundo para caber o teto inteiro", () => {
    const dims = dimsDaAula();
    for (let g = 1; g <= MAX_GRUPOS_AULA; g++) {
      const c = chunkDoGrupo(g);
      expect(c.cx).toBeGreaterThanOrEqual(0);
      expect(c.cx).toBeLessThan(dims.x);
      expect(c.cz).toBeGreaterThanOrEqual(0);
      expect(c.cz).toBeLessThan(dims.z);
    }
  });

  it("põe a célula-molde fora do professor e de qualquer grupo", () => {
    const molde = chunkDoMolde();
    const dims = dimsDaAula();
    expect(molde).not.toEqual(chunkDoProfessor());
    expect(molde.cz).toBeGreaterThanOrEqual(0);
    expect(molde.cz).toBeLessThan(dims.z);
    for (let g = 1; g <= MAX_GRUPOS_AULA; g++) {
      expect(chunkDoGrupo(g)).not.toEqual(molde);
    }
  });

  it("a caixa da célula é o chunk inteiro em XZ e CELULA_DY em Y", () => {
    const b = caixaDaCelula({ cx: 2, cz: 3 });
    expect(b.min).toEqual({ x: 2 * CHUNK_SIZE, y: CELULA_Y0, z: 3 * CHUNK_SIZE });
    expect(b.max).toEqual({
      x: 2 * CHUNK_SIZE + CHUNK_SIZE - 1,
      y: CELULA_Y0 + CELULA_DY - 1,
      z: 3 * CHUNK_SIZE + CHUNK_SIZE - 1,
    });
  });
});
