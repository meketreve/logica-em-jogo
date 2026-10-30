// O /shared não carrega os tipos do Node (mesma razão do ids16.test.ts)
// @ts-expect-error — tipos do Node ausentes de propósito no /shared
import { existsSync, readFileSync } from "node:fs";
// @ts-expect-error — idem
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { estaLigado, isAlavanca } from "./circuitos";
import { decodeSave } from "./save";
import type { Box } from "./scenario";
import { GameSession } from "./session";
import { getBlock } from "./world";

/**
 * §🔌 REVISÃO PRÉ-AULA (2026-10-30): a aula 8 do jeito que a escola a abre —
 * o `.ljw` VERSIONADO, em modo aula (`somenteLeitura`, o confinamento nasce
 * ligado) — com uma TURMA, e não com a aluna sozinha do verificador do
 * gerador: gente demais pros grupos, aluno de um grupo na área do outro,
 * tablet que cai e volta pela posse no meio da fase, colega que sai.
 *
 * As respostas não vêm do gerador (ele mora no `server/`): a ordem das
 * alavancas na área é a ordem do desenho (linha a linha), então "A" é a 1ª
 * alavanca achada varrendo z e depois x.
 */

declare const __dirname: string;
const ARQUIVO = join(__dirname, "..", "..", "cenarios", "aula8-circuitos.ljw");
/** Índices (na ordem A, B, C…) das alavancas da resposta de cada fase. */
const RESPOSTAS = [[0], [0, 1], [0], [0, 1]];

function abrirAula() {
  const b: Uint8Array = readFileSync(ARQUIVO);
  const save = decodeSave(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
  const falas = new Map<number, string[]>();
  const s = new GameSession(
    (id, data) => {
      if (typeof data !== "string") return;
      const m = JSON.parse(data) as Record<string, unknown>;
      if (m["type"] === "chat") falas.set(id, [...(falas.get(id) ?? []), String(m["text"])]);
    },
    { restore: save, codigo: "prof", somenteLeitura: true },
  );
  const send = (id: number, m: unknown): void => s.handleMessage(id, JSON.stringify(m));
  const objetivos = s.scenario.objetivos;
  const area = (f: number, g: number): Box => objetivos[f]!.alvos![g - 1]!;
  const alavancas = (f: number, g: number): { x: number; y: number; z: number }[] => {
    const a = area(f, g);
    const out: { x: number; y: number; z: number }[] = [];
    for (let z = a.min.z; z <= a.max.z; z++) {
      for (let x = a.min.x; x <= a.max.x; x++) {
        if (isAlavanca(getBlock(s.world, x, a.min.y, z))) out.push({ x, y: a.min.y, z });
      }
    }
    return out;
  };
  const clicar = (id: number, c: { x: number; y: number; z: number }): void => {
    send(id, { type: "move", x: c.x - 1.5, y: c.y, z: c.z + 0.5, yaw: 0, pitch: 0 });
    send(id, { type: "use_block", ...c });
  };
  const ligada = (c: { x: number; y: number; z: number }): boolean => estaLigado(getBlock(s.world, c.x, c.y, c.z));
  const completa = (f: number, g: number): boolean => s.completosGrupo.has(`${objetivos[f]!.id}:${g}`);
  const tick = (n = 2): void => {
    for (let i = 0; i < n; i++) s.tick();
  };
  /** O grupo `g` (pela aluna `id`) deixa a fase `f` com a resposta certa. */
  const resolver = (id: number, f: number, g: number): void => {
    alavancas(f, g).forEach((c, i) => {
      if (ligada(c) !== RESPOSTAS[f]!.includes(i)) clicar(id, c);
    });
    tick();
  };
  const ultimaFala = (id: number): string => falas.get(id)?.at(-1) ?? "";
  return { s, send, objetivos, alavancas, clicar, ligada, completa, tick, resolver, ultimaFala };
}

describe.skipIf(!existsSync(ARQUIVO))("§🔌 aula 8 com a TURMA (o .ljw versionado, em modo aula)", () => {
  it("o arquivo abre como a escola abre: confinamento, peças travadas, 5 grupos e 4 fases", () => {
    const a = abrirAula();
    expect(a.s.confinamentoAtivo).toBe(true);
    expect(a.s.scenario.pecasTravadas).toBe(true);
    expect(a.s.scenario.modo).toBe("sequencial");
    expect(a.s.grupos.size).toBe(5);
    expect(a.objetivos).toHaveLength(4);
    for (let f = 0; f < 4; f++) {
      for (let g = 1; g <= 5; g++) expect(a.alavancas(f, g).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("7 alunos em 5 grupos: todos caem num grupo (ninguém fica sem poder clicar)", () => {
    const a = abrirAula();
    a.send(1, { type: "join", name: "profa", pin: "1234", codigo: "prof" });
    const nomes = ["ana", "bia", "caio", "duda", "edu", "fabi", "gui"];
    nomes.forEach((n, i) => a.send(10 + i, { type: "join", name: n, pin: "1111" }));
    const tamanhos = [...a.s.grupos.values()].map((m) => m.size).sort();
    expect(tamanhos).toEqual([1, 1, 1, 2, 2]);
    // o 6º e o 7º alunos (os que sobram) clicam a alavanca do PRÓPRIO grupo
    for (const i of [5, 6]) {
      const g = [...a.s.grupos.entries()].find(([, m]) => m.has(nomes[i]!))![0];
      const c = a.alavancas(0, g)[0]!;
      const antes = a.ligada(c);
      a.clicar(10 + i, c);
      expect(a.ligada(c)).toBe(!antes);
    }
  });

  it("aluno do grupo 2 NÃO mexe na alavanca do grupo 1 (o confinamento do modo aula)", () => {
    const a = abrirAula();
    a.send(2, { type: "join", name: "ana", pin: "1111" }); // grupo 1
    a.send(3, { type: "join", name: "bia", pin: "2222" }); // grupo 2
    const c = a.alavancas(0, 1)[0]!;
    a.clicar(3, c);
    expect(a.ligada(c)).toBe(false);
    expect(a.ultimaFala(3)).toMatch(/^Modo confinamento/);
    // controle: a dona da área clica e liga
    a.clicar(2, c);
    expect(a.ligada(c)).toBe(true);
  });

  it("tablet que cai e VOLTA pela posse no meio da fase: mesmo grupo, alavanca como deixou, fase fecha", () => {
    const a = abrirAula();
    a.send(2, { type: "join", name: "ana", pin: "1111" }); // grupo 1
    a.send(3, { type: "join", name: "bia", pin: "2222" }); // grupo 2
    a.resolver(2, 0, 1);
    expect(a.completa(0, 1)).toBe(true);
    // fase 2 pela metade: só a A ligada
    const [la, lb] = a.alavancas(1, 1);
    a.clicar(2, la!);
    a.tick();
    expect(a.completa(1, 1)).toBe(false);
    // o socket morre seco (1006) e o tablet volta sozinho com outro clientId
    a.send(4, { type: "join", name: "ana", pin: "1111", queda: { codigo: 1006, escondidaMs: 3000, semNoticiaMs: 3000, online: true, como: "sozinho" } });
    a.s.handleDisconnect(2); // o `close` do socket velho chega atrasado no host
    expect(a.s.grupos.get(1)?.has("ana")).toBe(true);
    expect(a.s.grupos.get(2)?.has("ana")).toBe(false);
    expect(a.ligada(la!)).toBe(true); // ninguém desfez o que ela tinha feito
    a.clicar(4, lb!);
    a.tick();
    expect(a.completa(1, 1)).toBe(true);
    expect(a.completa(1, 2)).toBe(false); // e só o grupo dela
  });

  it("a colega SAI do jogo: quem fica no grupo continua e o progresso é do GRUPO", () => {
    const a = abrirAula();
    a.send(2, { type: "join", name: "ana", pin: "1111" }); // grupo 1
    for (let i = 0; i < 4; i++) a.send(20 + i, { type: "join", name: `x${i}`, pin: "1111" }); // 2..5
    a.send(3, { type: "join", name: "caio", pin: "3333" }); // grupo 1 de novo (o menor)
    expect(a.s.grupos.get(1)?.has("caio")).toBe(true);
    a.resolver(2, 0, 1);
    a.s.handleDisconnect(2);
    a.resolver(3, 1, 1);
    expect(a.completa(0, 1) && a.completa(1, 1)).toBe(true);
  });

  it("peças travadas vale na camada de CIMA da área (a das marcas verde/vermelha)", () => {
    const a = abrirAula();
    a.send(2, { type: "join", name: "ana", pin: "1111" });
    const c = a.alavancas(0, 1)[0]!;
    a.send(2, { type: "move", x: c.x - 1.5, y: c.y, z: c.z + 0.5, yaw: 0, pitch: 0 });
    a.send(2, { type: "place_block", x: c.x, y: c.y + 1, z: c.z, blockId: 1 });
    a.tick();
    expect(getBlock(a.s.world, c.x, c.y + 1, c.z)).toBe(0);
    expect(a.ultimaFala(2)).toMatch(/peças estão travadas/);
  });

  it("SEQUENCIAL: alavanca da fase 2 ligada ANTES da fase 1 fechar volta pro começo quando a fase 1 fecha", () => {
    // Não é bug — é o `carregarProximaSequencia` repondo a próxima fase ao
    // estado de partida. Mas é o que a criança que clica em tudo VAI ver, e
    // o roteiro de aula precisa dizer isso pro professor.
    const a = abrirAula();
    a.send(2, { type: "join", name: "ana", pin: "1111" });
    const la = a.alavancas(1, 1)[0]!;
    a.clicar(2, la);
    a.tick();
    expect(a.ligada(la)).toBe(true);
    a.resolver(2, 0, 1);
    expect(a.completa(0, 1)).toBe(true);
    expect(a.ligada(la)).toBe(false);
  });
});
