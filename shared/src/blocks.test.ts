import { describe, expect, it } from "vitest";
import { BlockId, CHUNK_SIZE, CHUNK_VOLUME, isPlaceable } from "./index";

describe("formato de bloco/chunk (contrato de save e snapshot)", () => {
  it("IDs de bloco batem com o formato binário", () => {
    expect(BlockId.Air).toBe(0);
    expect(BlockId.Grass).toBe(1);
    expect(BlockId.Stone).toBe(2);
    expect(BlockId.Cobblestone).toBe(3);
    expect(BlockId.Sand).toBe(4);
  });

  it("blocos-glifo cp20: append A–Z, 0–9 (nunca renumerar ids antigos)", () => {
    expect(BlockId.LetterA).toBe(29);
    expect(BlockId.LetterZ).toBe(54);
    expect(BlockId.Digit0).toBe(55);
    expect(BlockId.Digit9).toBe(64);
    // cp23: não-cubos em append depois dos glifos
    expect(BlockId.Cerca).toBe(65);
    expect(BlockId.Tocha).toBe(70);
    // tapetes (2026-07-19): 12 cores em append depois da tocha
    expect(BlockId.TapeteBranco).toBe(71);
    expect(BlockId.TapeteMarrom).toBe(82);
    // isPlaceable acompanha o último id; o próximo byte NÃO é bloco
    expect(isPlaceable(BlockId.TapeteMarrom)).toBe(true);
    expect(isPlaceable(83)).toBe(false);
  });

  it("volume do chunk cabe em 1 byte por bloco", () => {
    expect(CHUNK_VOLUME).toBe(CHUNK_SIZE ** 3);
    expect(CHUNK_VOLUME).toBe(4096);
  });
});
