import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { parseGroups } from "./groups";
import { decodeSave, encodeSave } from "./save";
import { GameSession, type SessionOptions } from "./session";
import { getBlock } from "./world";

// mundo plano 2×2×2 chunks (32³) — superfície em y=3
const DIMS = { x: 2, z: 2, y: 2 };

function makeSession(opts: SessionOptions = {}) {
  const sent: { id: number; data: string | ArrayBuffer }[] = [];
  const session = new GameSession((id, data) => sent.push({ id, data }), {
    dims: DIMS,
    seed: 7,
    flat: true,
    codigo: "prof42",
    ...opts,
  });
  const msgsTo = (id: number): Record<string, unknown>[] =>
    sent
      .filter((s) => s.id === id && typeof s.data === "string")
      .map((s) => JSON.parse(s.data as string) as Record<string, unknown>);
  const send = (id: number, msg: unknown): void =>
    session.handleMessage(id, JSON.stringify(msg));
  const chat = (id: number, text: string): void => send(id, { type: "chat", text });
  const lastObjectives = (id: number) =>
    msgsTo(id).filter((m) => m["type"] === "objectives").at(-1) as
      | { objetivos: Record<string, unknown>[] }
      | undefined;
  const lastChat = (id: number): string =>
    (msgsTo(id).filter((m) => m["type"] === "chat").at(-1)?.["text"] as string) ?? "";
  const lastGroup = (id: number): number | null | undefined =>
    msgsTo(id).filter((m) => m["type"] === "group").at(-1)?.["grupo"] as
      | number
      | null
      | undefined;
  const move = (id: number, x: number, y: number, z: number): void =>
    send(id, { type: "move", x, y, z, yaw: 0, pitch: 0 });
  return { session, msgsTo, send, chat, lastObjectives, lastChat, lastGroup, move };
}

type S = ReturnType<typeof makeSession>;

function joinProf(s: S, id = 1): void {
  s.send(id, { type: "join", name: `prof${id}`, pin: "1234", codigo: "prof42" });
}
function joinAluno(s: S, id: number, nome = `aluno${id}`): void {
  s.send(id, { type: "join", name: nome, pin: "9999" });
}
function criarRegiao(s: S, id: number, nome: string, min: number[], max: number[]): void {
  s.send(id, { type: "wand_mark", corner: 1, x: min[0], y: min[1], z: min[2] });
  s.send(id, { type: "wand_mark", corner: 2, x: max[0], y: max[1], z: max[2] });
  s.chat(id, `/regiao criar ${nome}`);
}

describe("grupos — composição", () => {
  it("/grupo criar 2 distribui alunos online em round-robin (professor fora)", () => {
    const s = makeSession();
    joinProf(s);
    joinAluno(s, 2);
    joinAluno(s, 3);
    joinAluno(s, 4);
    s.chat(1, "/grupo criar 2");
    expect(s.lastGroup(2)).toBe(1);
    expect(s.lastGroup(3)).toBe(2);
    expect(s.lastGroup(4)).toBe(1);
    expect(s.lastGroup(1)).toBeNull(); // professor sem grupo
    s.chat(1, "/grupo lista");
    expect(s.lastChat(1)).toContain("grupo 1 (2)");
  });

  it("/grupo criar 2 alunos = grupos DE 2 (nº de grupos emerge da turma)", () => {
    const s = makeSession();
    joinProf(s);
    joinAluno(s, 2);
    joinAluno(s, 3);
    joinAluno(s, 4);
    s.chat(1, "/grupo criar 2 alunos"); // 3 alunos / 2 por grupo = 2 grupos
    s.chat(1, "/grupo lista");
    const lista = s.lastChat(1);
    expect(lista).toContain("grupo 1");
    expect(lista).toContain("grupo 2");
    expect(lista).not.toContain("grupo 3");
  });

  it("entrar/sair trocam de grupo; aluno que chega depois cai no MENOR grupo", () => {
    const s = makeSession();
    joinProf(s);
    joinAluno(s, 2);
    joinAluno(s, 3);
    s.chat(1, "/grupo criar 2"); // aluno2→g1, aluno3→g2
    s.chat(2, "/grupo entrar 2");
    expect(s.lastGroup(2)).toBe(2);
    s.chat(2, "/grupo sair");
    expect(s.lastGroup(2)).toBeNull();
    // g1 está vazio agora — recém-chegado cai nele (e é avisado)
    joinAluno(s, 5, "novato");
    expect(s.lastGroup(5)).toBe(1);
    expect(s.lastChat(5)).toContain("você entrou no grupo 1");
  });

  it("grupo persiste no save; /grupo criar de novo zera progresso por grupo", () => {
    const s = makeSession();
    joinProf(s);
    joinAluno(s, 2);
    s.chat(1, "/grupo criar 1");
    const decoded = decodeSave(encodeSave(s.session.world, s.session.toSave()));
    expect(decoded.grupos).toEqual([{ id: 1, membros: ["aluno2"] }]);

    const s2 = makeSession({ restore: decoded });
    joinAluno(s2, 9, "aluno2"); // rejoin mantém grupo salvo
    expect(s2.lastGroup(9)).toBe(1);
  });

  it("parseGroups pula entrada quebrada", () => {
    expect(
      parseGroups([{ id: 1, membros: ["a", 3] }, { id: "x" }, null]),
    ).toEqual([{ id: 1, membros: ["a"] }]);
  });
});

describe("grupos — carimbo e objetivos per-grupo", () => {
  /** prof + 2 alunos em 2 grupos; modelo 2×1×1 com lã vermelha+azul. */
  function setup(s: S): void {
    joinProf(s);
    joinAluno(s, 2);
    joinAluno(s, 3);
    s.chat(1, "/grupo criar 2");
    criarRegiao(s, 1, "modelo", [4, 4, 4], [5, 4, 4]);
    s.chat(1, `/bloco 4 4 4 ${BlockId.WoolRed}`);
    s.chat(1, `/bloco 5 4 4 ${BlockId.WoolBlue}`);
  }

  it("/regiao carimbar replica blocos e cria prefixo-1..N", () => {
    const s = makeSession();
    setup(s);
    s.chat(1, "/regiao carimbar modelo area 2 x"); // passo = 2+2 = 4
    expect(s.lastChat(1)).toContain("2 cópia(s)");
    // cópia 1 em x+4, cópia 2 em x+8 — blocos idênticos ao modelo
    expect(getBlock(s.session.world, 8, 4, 4)).toBe(BlockId.WoolRed);
    expect(getBlock(s.session.world, 9, 4, 4)).toBe(BlockId.WoolBlue);
    expect(getBlock(s.session.world, 12, 4, 4)).toBe(BlockId.WoolRed);
    s.chat(1, "/regiao lista");
    expect(s.lastChat(1)).toContain("area-1");
    expect(s.lastChat(1)).toContain("area-2");
  });

  it("construir per-grupo: cada grupo progride e conclui na PRÓPRIA área", () => {
    const s = makeSession();
    setup(s);
    // áreas vazias do mesmo tamanho do modelo (carimbar copiaria os blocos
    // e nasceria completo — aqui as áreas começam limpas)
    criarRegiao(s, 1, "area-1", [10, 4, 10], [11, 4, 10]);
    criarRegiao(s, 1, "area-2", [20, 4, 20], [21, 4, 20]);
    s.chat(1, "/objetivo add construir modelo area Copie o padrão");
    expect(s.lastChat(1)).toContain("objetivo #1");

    // grupo 1 (aluno2) completa a área 1
    s.chat(1, `/bloco 10 4 10 ${BlockId.WoolRed}`);
    s.chat(1, `/bloco 11 4 10 ${BlockId.WoolBlue}`);
    s.session.tick();
    const obj = s.lastObjectives(2)?.objetivos[0] as {
      porGrupo: { grupo: number; completo: boolean; atual: number }[];
      completo: boolean;
    };
    expect(obj.porGrupo[0]).toMatchObject({ grupo: 1, completo: true, atual: 2 });
    expect(obj.porGrupo[1]).toMatchObject({ grupo: 2, completo: false, atual: 0 });
    expect(obj.completo).toBe(false); // agregado: falta o grupo 2
    expect(s.lastChat(3)).toContain("grupo 1 concluiu");
  });

  it("sequencial anda POR GRUPO: grupo 1 avança pro objetivo 2, grupo 2 não", () => {
    const s = makeSession();
    setup(s);
    criarRegiao(s, 1, "area-1", [10, 4, 10], [11, 4, 10]);
    criarRegiao(s, 1, "area-2", [20, 4, 20], [21, 4, 20]);
    criarRegiao(s, 1, "meta", [26, 3, 26], [28, 6, 28]);
    s.chat(1, "/objetivo add construir modelo area Copie");
    s.chat(1, "/objetivo add chegar meta Corra até a meta");

    // grupo 2 tenta pular pro chegar antes de construir: não vale
    s.move(3, 27.5, 4, 27.5);
    let obj2 = s.lastObjectives(3)?.objetivos[1] as { porGrupo: { completo: boolean }[] };
    expect(obj2.porGrupo[1]?.completo).toBe(false);

    // grupo 1 constrói → objetivo 2 ativa SÓ pro grupo 1 → chega e conclui
    s.chat(1, `/bloco 10 4 10 ${BlockId.WoolRed}`);
    s.chat(1, `/bloco 11 4 10 ${BlockId.WoolBlue}`);
    s.session.tick();
    s.move(2, 27.5, 4, 27.5);
    obj2 = s.lastObjectives(3)?.objetivos[1] as { porGrupo: { completo: boolean }[] };
    expect(obj2.porGrupo[0]?.completo).toBe(true);
    expect(obj2.porGrupo[1]?.completo).toBe(false);
  });

  it("chegar 'todos': grupo inteiro dentro da região ao mesmo tempo", () => {
    const s = makeSession();
    joinProf(s);
    joinAluno(s, 2);
    joinAluno(s, 3);
    s.chat(1, "/grupo criar 1"); // os 2 alunos no MESMO grupo
    criarRegiao(s, 1, "meta", [20, 3, 20], [24, 6, 24]);
    s.chat(1, "/objetivo add chegar meta todos Venham todos até aqui");

    s.move(2, 22, 4, 22); // só metade do grupo dentro
    let obj = s.lastObjectives(2)?.objetivos[0] as
      | { porGrupo: { completo: boolean }[] }
      | undefined;
    expect(obj?.porGrupo[0]?.completo ?? false).toBe(false);
    s.move(3, 23, 4, 23); // agora os dois
    obj = s.lastObjectives(2)?.objetivos[0] as { porGrupo: { completo: boolean }[] };
    expect(obj.porGrupo[0]?.completo).toBe(true);
  });

  it("aluno sem grupo não pontua chegar; progresso por grupo persiste no save", () => {
    const s = makeSession();
    joinProf(s);
    joinAluno(s, 2);
    s.chat(1, "/grupo criar 1");
    criarRegiao(s, 1, "meta", [20, 3, 20], [24, 6, 24]);
    s.chat(1, "/objetivo add chegar meta Vá");
    s.chat(2, "/grupo sair");
    s.move(2, 22, 4, 22); // sem grupo: não conta
    const obj = s.lastObjectives(2)?.objetivos[0] as { porGrupo: { completo: boolean }[] };
    expect(obj.porGrupo[0]?.completo).toBe(false);

    s.chat(2, "/grupo entrar 1");
    s.move(2, 21, 4, 21);
    const decoded = decodeSave(encodeSave(s.session.world, s.session.toSave()));
    expect(decoded.cenario?.completosGrupos).toEqual([{ grupo: 1, objetivos: [1] }]);

    const s2 = makeSession({ restore: decoded });
    joinProf(s2, 5);
    const objs = s2.lastObjectives(5)?.objetivos[0] as { porGrupo: { completo: boolean }[] };
    expect(objs.porGrupo[0]?.completo).toBe(true);
  });
});
