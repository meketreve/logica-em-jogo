import { describe, expect, it } from "vitest";
import buildInfo from "./build-info.json";
import { DATA_BUILD, ROTULO_BUILD, rotuloDoBloco } from "./version";

/**
 * A tela "📜 novidades" (client/src/changelog.ts) tinha o bloco do topo
 * rotulado à mão com a string "recém-chegado" — e ele ficou lá por 12 versões
 * de trabalho, porque nada obrigava ninguém a trocá-lo. Com o launcher se
 * atualizando sozinho na escola, o professor via "recém-chegado" pra sempre.
 *
 * O conserto é este rótulo: a entrada do topo NÃO carrega data, e ganha a do
 * build (`shared/src/build-info.json`, gerado por `scripts/gerar-build-info.mjs`).
 * `npm run build`/`npm run dev` passam a relabelar a tela sozinhos.
 */
describe("rótulo de build do changelog", () => {
  it("a entrada SEM data fixa vira o build atual (a data do marco)", () => {
    expect(rotuloDoBloco()).toBe(ROTULO_BUILD);
    expect(rotuloDoBloco(undefined)).toBe(ROTULO_BUILD);
  });

  // §portão: o rótulo NÃO pode voltar a carregar o sha do HEAD. Ele é inlined
  // no `client/dist`, que é versionado — um valor que muda a cada commit faz o
  // bundle mudar sozinho e desarma o `checar-dist.mjs` (2026-09-25).
  it("PORTÃO: o rótulo não carrega sha de commit — só a data DD/MM/AAAA", () => {
    expect(ROTULO_BUILD).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    expect(Object.keys(buildInfo)).toEqual(["data", "titulo"]);
  });

  it("entrada histórica mantém a data que já tinha", () => {
    expect(rotuloDoBloco("21/07/2026")).toBe("21/07/2026");
  });

  it("DATA_BUILD é ISO (git --date=short) e vira DD/MM/AAAA no rótulo", () => {
    const [ano, mes, dia] = DATA_BUILD.split("-");
    expect(ROTULO_BUILD.startsWith(`${dia}/${mes}/${ano}`)).toBe(true);
  });
});
