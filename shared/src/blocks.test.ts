import { describe, expect, it } from "vitest";
import { BlockId, CHUNK_SIZE, CHUNK_VOLUME } from "./index";

describe("formato de bloco/chunk (contrato de save e snapshot)", () => {
  it("IDs de bloco batem com o formato binário", () => {
    expect(BlockId.Air).toBe(0);
    expect(BlockId.Grass).toBe(1);
    expect(BlockId.Stone).toBe(2);
    expect(BlockId.Cobblestone).toBe(3);
    expect(BlockId.Sand).toBe(4);
  });

  it("volume do chunk cabe em 1 byte por bloco", () => {
    expect(CHUNK_VOLUME).toBe(CHUNK_SIZE ** 3);
    expect(CHUNK_VOLUME).toBe(4096);
  });
});
