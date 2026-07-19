import { describe, expect, it } from "vitest";
import { isValidPin, sanitizeName } from "./auth";

describe("auth (cp9): PIN", () => {
  it("isValidPin: exatamente 4 dígitos", () => {
    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin("0000")).toBe(true);
    expect(isValidPin("123")).toBe(false);
    expect(isValidPin("12345")).toBe(false);
    expect(isValidPin("12a4")).toBe(false);
    expect(isValidPin("")).toBe(false);
    expect(isValidPin(" 1234")).toBe(false);
  });
});

describe("auth: sanitizeName (nome sem espaço nem especial)", () => {
  it("remove espaço interno e das pontas", () => {
    expect(sanitizeName("  ana  ")).toBe("ana");
    expect(sanitizeName("ana maria")).toBe("anamaria");
  });
  it("mantém letra, número, acento, _ e -", () => {
    expect(sanitizeName("José")).toBe("José");
    expect(sanitizeName("João_9")).toBe("João_9");
    expect(sanitizeName("jogador-ab3x")).toBe("jogador-ab3x");
  });
  it("descarta caractere especial e emoji", () => {
    expect(sanitizeName("a!n@a#")).toBe("ana");
    expect(sanitizeName("bob/../etc")).toBe("bobetc");
    expect(sanitizeName("😀mari😀a")).toBe("maria");
  });
  it("corta em MAX_NAME_LENGTH (24)", () => {
    expect(sanitizeName("a".repeat(40))).toBe("a".repeat(24));
  });
  it("vazio ou só lixo cai no genérico 'jogador'", () => {
    expect(sanitizeName("")).toBe("jogador");
    expect(sanitizeName("   ")).toBe("jogador");
    expect(sanitizeName("!!! ###")).toBe("jogador");
  });
});
