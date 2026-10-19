import { describe, expect, it } from "vitest";
import { MAX_CHAT_BYTES } from "./constants";
import { bytesUtf8, cortarEmBytes } from "./texto";

describe("texto medido em bytes", () => {
  it("bytesUtf8 cobra 1/2/3/4 bytes conforme o code point", () => {
    expect(bytesUtf8("abc")).toBe(3);
    expect(bytesUtf8("ação")).toBe(6); // ç e ã valem 2 cada
    expect(bytesUtf8("日")).toBe(3);
    expect(bytesUtf8("😀")).toBe(4); // par substituto = UM code point
    // controle negativo: caractere não é byte — é por isso que o teto existe
    expect("😀".repeat(200)).toHaveLength(400); // 400 unidades UTF-16…
    expect(bytesUtf8("😀".repeat(200))).toBe(800); // …e 800 bytes no fio
  });

  it("cortarEmBytes devolve o mesmo texto quando cabe", () => {
    const frase = "olá, turma! vamos acender a lâmpada";
    expect(cortarEmBytes(frase, MAX_CHAT_BYTES)).toBe(frase);
    expect(cortarEmBytes("", 10)).toBe("");
  });

  it("corta em fronteira de code point, sem partir emoji nem acento", () => {
    // 😀 são 4 bytes: com teto 5 cabe UM e os 4 que faltam não entram
    expect(cortarEmBytes("😀😀", 5)).toBe("😀");
    expect(bytesUtf8(cortarEmBytes("😀😀", 5))).toBe(4);
    // teto 3 não comporta nem o primeiro
    expect(cortarEmBytes("😀", 3)).toBe("");
    // acento de 2 bytes com 1 byte de sobra também não parte
    expect(cortarEmBytes("aç", 2)).toBe("a");
    // nunca sai par substituto órfão (viraria � no JSON)
    for (let teto = 0; teto <= 9; teto++) {
      const r = cortarEmBytes("😀a😀", teto);
      expect(JSON.parse(JSON.stringify(r))).toBe(r);
      expect(r).not.toMatch(/[\uD800-\uDFFF]/u);
    }
  });

  it("nunca estoura o teto, qualquer que seja a mistura", () => {
    const bagunca = "a😀ç日b😀ã" .repeat(20);
    for (const teto of [0, 1, 2, 3, 7, 13, 50, MAX_CHAT_BYTES]) {
      expect(bytesUtf8(cortarEmBytes(bagunca, teto))).toBeLessThanOrEqual(teto);
    }
  });
});
