import { describe, expect, it } from "vitest";
import { isValidPin } from "./auth";

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
