// O /shared não carrega os tipos do Node (roda no navegador também), mas o
// vitest roda no Node: o portão confere os OGG REAIS da pasta servida.
// @ts-expect-error — tipos do Node ausentes de propósito no /shared
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
// @ts-expect-error — idem
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { type MaterialSonoro, VOZES_DE_BICHO } from "./sons";
import {
  type UsoDeMaterial,
  CONJUNTOS_DE_AMOSTRA,
  amostraDoBicho,
  amostraDoMaterial,
  todosOsArquivosDeSom,
} from "./sonsAmostras";

// o vitest roda de `shared/` (npm test) OU da raiz (config reexportada): achar pelos dois
const PASTA: string = [join("..", "client/public/sons"), join("client/public/sons")].find((p: string) =>
  existsSync(join(p, "CREDITOS.md")),
) ?? "client/public/sons";
const MATERIAIS: MaterialSonoro[] = ["pedra", "madeira", "terra", "areia", "vidro", "planta", "tecido", "metal"];
const USOS: UsoDeMaterial[] = ["quebrar", "colocar", "golpe", "passo"];

describe("§🔊 sons v2 — as amostras gravadas", () => {
  it("todo arquivo que a tabela pede EXISTE na pasta servida", () => {
    const faltando = todosOsArquivosDeSom().filter((f) => !existsSync(join(PASTA, f)));
    expect(faltando).toEqual([]);
  });

  it("nenhum OGG da pasta SOBRA sem uso (peso que o tablet baixaria à toa)", () => {
    const pedidos = new Set(todosOsArquivosDeSom());
    const sobra = readdirSync(PASTA).filter((f: string) => f.endsWith(".ogg") && !pedidos.has(f));
    expect(sobra).toEqual([]);
  });

  it("todo arquivo tem ORIGEM e licença no CREDITOS.md", () => {
    const creditos = readFileSync(join(PASTA, "CREDITOS.md"), "utf8");
    const linhas: string[] = (creditos as string).split("\n");
    const semCredito = todosOsArquivosDeSom().filter(
      (f) => !linhas.some((l: string) => l.startsWith(`| \`${f}\``) && /CC0 1\.0/.test(l) && /https:\/\//.test(l)),
    );
    expect(semCredito).toEqual([]);
  });

  it("o pacote inteiro cabe no orçamento do tablet (≤ 700 KB, cada arquivo ≤ 20 KB)", () => {
    const tamanhos = todosOsArquivosDeSom().map((f) => [f, statSync(join(PASTA, f)).size] as const);
    const total = tamanhos.reduce((s, [, b]) => s + b, 0);
    expect(total).toBeLessThanOrEqual(700 * 1024);
    expect(tamanhos.filter(([, b]) => b > 20 * 1024)).toEqual([]);
  });

  it("todo par material × uso decide: amostra que EXISTE ou síntese (null)", () => {
    for (const m of MATERIAIS) {
      for (const u of USOS) {
        const a = amostraDoMaterial(u, m);
        if (a === null) continue;
        expect(CONJUNTOS_DE_AMOSTRA[a.conjunto], `${u}/${m}`).toBeGreaterThan(0);
        expect(a.ganho).toBeGreaterThan(0);
        expect(a.ganho).toBeLessThanOrEqual(1);
        expect(a.tom).toBeGreaterThan(0.5);
        expect(a.tom).toBeLessThan(1.5);
      }
    }
  });

  it("areia fica TODA sintetizada; pedra tem os quatro usos gravados", () => {
    expect(USOS.map((u) => amostraDoMaterial(u, "areia"))).toEqual([null, null, null, null]);
    expect(USOS.map((u) => amostraDoMaterial(u, "pedra")?.conjunto)).toEqual([
      "quebrar-pedra",
      "golpe-pedra",
      "golpe-pedra",
      "passo-pedra",
    ]);
  });

  it("os bichos com voz gravada são exatamente os 5 do plano; o resto é síntese", () => {
    const gravados = VOZES_DE_BICHO.filter((v) => amostraDoBicho(v) !== null);
    expect(gravados).toEqual(["vaca", "galinha", "ovelha", "cachorro", "gato"]);
    expect(amostraDoBicho(null)).toBeNull();
  });
});
