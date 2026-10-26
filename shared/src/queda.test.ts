import { describe, expect, it } from "vitest";
import { parseClientMessage } from "./protocol";
import { type RelatoQueda, descreverVolta, lerRelatoQueda } from "./queda";

const base: RelatoQueda = {
  codigo: 1006,
  escondidaMs: null,
  semNoticiaMs: 2400,
  online: true,
  como: "sozinho",
};

describe("§📱 bug-675 — o relato de COMO a conexão caiu", () => {
  it("as três causas saem em frases DIFERENTES (o log tem de distinguir)", () => {
    const escondida = descreverVolta("Adriam", { ...base, escondidaMs: 41_200 });
    const semRede = descreverVolta("Adriam", { ...base, online: false });
    const aVista = descreverVolta("Adriam", base);
    expect(escondida).toEqual(
      "Adriam voltou sozinho: tinha caído com a tela ESCONDIDA havia 41 s (botão Home, tela bloqueada ou outro app) — 2 s sem notícia do servidor, código 1006",
    );
    expect(semRede).toEqual(
      "Adriam voltou sozinho: tinha caído com a tela à vista e o tablet SEM Wi-Fi — 2 s sem notícia do servidor, código 1006",
    );
    expect(aVista).toEqual(
      "Adriam voltou sozinho: tinha caído com a tela à vista (rede ou servidor) — 2 s sem notícia do servidor, código 1006",
    );
  });

  it("volta pelo MENU se diz diferente, e menos de 1 s não vira \"0 s\"", () => {
    expect(descreverVolta("Tilapia", { ...base, como: "menu", escondidaMs: 300, semNoticiaMs: 0 })).toEqual(
      "Tilapia voltou pelo menu: tinha caído com a tela ESCONDIDA havia menos de 1 s (botão Home, tela bloqueada ou outro app) — menos de 1 s sem notícia do servidor, código 1006",
    );
  });

  it("relato torto vira null; número fora da faixa é aparado, não recusado", () => {
    expect(lerRelatoQueda(base)).toEqual(base);
    expect(lerRelatoQueda(undefined)).toBeNull();
    expect(lerRelatoQueda({ ...base, codigo: "1006" })).toBeNull();
    expect(lerRelatoQueda({ ...base, codigo: 1.5 })).toBeNull();
    expect(lerRelatoQueda({ ...base, semNoticiaMs: Infinity })).toBeNull();
    expect(lerRelatoQueda({ ...base, escondidaMs: "muito" })).toBeNull();
    expect(lerRelatoQueda({ ...base, escondidaMs: undefined })).toBeNull();
    expect(lerRelatoQueda({ ...base, como: "voando" })).toBeNull();
    expect(lerRelatoQueda({ ...base, online: 1 })).toBeNull();
    expect(lerRelatoQueda({ ...base, semNoticiaMs: -5, escondidaMs: 1e12 })).toEqual({
      ...base,
      semNoticiaMs: 0,
      escondidaMs: 24 * 60 * 60 * 1000,
    });
  });

  it("no join: relato bom viaja; relato torto SOME e o join segue (nunca deixa a criança de fora)", () => {
    const bom = parseClientMessage(JSON.stringify({ type: "join", name: "ana", pin: "1111", queda: base }));
    expect(bom).toEqual({ type: "join", name: "ana", pin: "1111", queda: base });
    const torto = parseClientMessage(
      JSON.stringify({ type: "join", name: "ana", pin: "1111", queda: { codigo: "x" } }),
    );
    expect(torto).toEqual({ type: "join", name: "ana", pin: "1111" });
  });
});
