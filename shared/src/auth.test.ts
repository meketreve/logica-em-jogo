import { describe, expect, it } from "vitest";
import { hashSecret, isValidPin } from "./auth";

describe("auth (cp9): PIN e hash", () => {
  it("isValidPin: exatamente 4 dígitos", () => {
    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin("0000")).toBe(true);
    expect(isValidPin("123")).toBe(false);
    expect(isValidPin("12345")).toBe(false);
    expect(isValidPin("12a4")).toBe(false);
    expect(isValidPin("")).toBe(false);
    expect(isValidPin(" 1234")).toBe(false);
  });

  it("hashSecret: determinístico, 16 hex, e salt separa PINs iguais", () => {
    const h = hashSecret("ana", "1234");
    expect(h).toBe(hashSecret("ana", "1234")); // mesmo par = mesmo hash
    expect(h).toMatch(/^[0-9a-f]{16}$/);
    expect(h).not.toBe(hashSecret("bia", "1234")); // salt (nome) muda o hash
    expect(h).not.toBe(hashSecret("ana", "4321")); // PIN muda o hash
  });
});
