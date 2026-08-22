import { describe, expect, it } from "vitest";
import { version as versaoDoPackage } from "../../package.json";
import { VERSION, rotuloDeVersao } from "./version";

/**
 * A tela "📜 novidades" (client/src/changelog.ts) tinha o bloco do topo
 * rotulado à mão com a string "recém-chegado" — e ele ficou lá por 12 versões
 * de trabalho, porque nada obrigava ninguém a trocá-lo. Com o launcher se
 * atualizando sozinho na escola, o professor via "recém-chegado" pra sempre.
 *
 * O conserto é este rótulo: a entrada do topo NÃO carrega número, e ganha o do
 * `package.json`. Um `npm version` passa a relabelar a tela sozinho.
 */
describe("rótulo de versão do changelog", () => {
  it("a entrada SEM versão fixa vira a release atual do package.json", () => {
    expect(rotuloDeVersao()).toBe(`v${versaoDoPackage}`);
    expect(rotuloDeVersao(undefined)).toBe(`v${VERSION}`);
  });

  it("entrada histórica mantém o número que já tinha", () => {
    expect(rotuloDeVersao("v0.10.1")).toBe("v0.10.1");
  });

  it("o rótulo atual anda junto com o VERSION (nunca fica pra trás)", () => {
    expect(rotuloDeVersao()).toContain(VERSION);
  });
});
