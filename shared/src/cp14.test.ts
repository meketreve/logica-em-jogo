import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { parseServerMessage } from "./protocol";
import { GameSession, type SessionOptions } from "./session";
import { getBlock } from "./world";
import { generateCabinsWorld } from "./worldgen";

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
  const lastGroups = (id: number) =>
    msgsTo(id).filter((m) => m["type"] === "groups").at(-1) as
      | { grupos: { id: number; membros: string[] }[] }
      | undefined;
  return { session, msgsTo, send, chat, lastObjectives, lastChat, lastGroups };
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

describe("cp14 — edição de objetivos (/objetivo texto e mover)", () => {
  function setup(s: S): void {
    joinProf(s);
    criarRegiao(s, 1, "a", [4, 4, 4], [6, 6, 6]);
    criarRegiao(s, 1, "b", [10, 4, 10], [12, 6, 12]);
    s.chat(1, "/objetivo add chegar a Primeiro");
    s.chat(1, "/objetivo add chegar b Segundo");
  }

  it("/objetivo texto troca o enunciado e o broadcast reflete", () => {
    const s = makeSession();
    setup(s);
    s.chat(1, "/objetivo texto 1 Enunciado novo");
    expect(s.lastChat(1)).toContain("enunciado atualizado");
    expect(s.lastObjectives(1)?.objetivos[0]?.["texto"]).toBe("Enunciado novo");
  });

  it("/objetivo mover reordena e o sequencial re-ativa na ordem nova", () => {
    const s = makeSession();
    setup(s);
    // ordem original: #1 ativo, #2 aguardando
    let objs = s.lastObjectives(1)?.objetivos;
    expect(objs?.[0]).toMatchObject({ id: 1, ativo: true });
    s.chat(1, "/objetivo mover 2 1");
    objs = s.lastObjectives(1)?.objetivos;
    expect(objs?.[0]).toMatchObject({ id: 2, ativo: true });
    expect(objs?.[1]).toMatchObject({ id: 1, ativo: false });
  });

  it("mover/texto com id inexistente responde erro sem quebrar nada", () => {
    const s = makeSession();
    setup(s);
    s.chat(1, "/objetivo mover 99 1");
    expect(s.lastChat(1)).toContain("Não existe objetivo #99");
    s.chat(1, "/objetivo texto 99 Oi");
    expect(s.lastChat(1)).toContain("Não existe objetivo #99");
    expect(s.lastObjectives(1)?.objetivos).toHaveLength(2);
  });
});

describe("cp14 — broadcast `groups` (composição pros painéis)", () => {
  it("/grupo criar manda a composição completa pra TODOS (aluno incluso)", () => {
    const s = makeSession();
    joinProf(s);
    joinAluno(s, 2);
    joinAluno(s, 3);
    s.chat(1, "/grupo criar 2");
    expect(s.lastGroups(2)?.grupos).toEqual([
      { id: 1, membros: ["aluno2"] },
      { id: 2, membros: ["aluno3"] },
    ]);
    expect(s.lastGroups(1)?.grupos).toHaveLength(2);
  });

  it("entrar/sair re-broadcasta; quem entra depois recebe no join", () => {
    const s = makeSession();
    joinProf(s);
    joinAluno(s, 2);
    s.chat(1, "/grupo criar 2");
    s.chat(2, "/grupo entrar 2");
    expect(s.lastGroups(1)?.grupos).toEqual([
      { id: 1, membros: [] },
      { id: 2, membros: ["aluno2"] },
    ]);
    // recém-chegado: auto-distribuído no menor grupo E todos sabem
    joinAluno(s, 3);
    expect(s.lastGroups(3)?.grupos).toEqual([
      { id: 1, membros: ["aluno3"] },
      { id: 2, membros: ["aluno2"] },
    ]);
    expect(s.lastGroups(1)?.grupos[0]?.membros).toEqual(["aluno3"]);
  });

  it("parseServerMessage aceita groups e pula entrada quebrada", () => {
    const msg = parseServerMessage(
      JSON.stringify({
        type: "groups",
        grupos: [{ id: 1, membros: ["ana", 7] }, { id: "x" }, null],
      }),
    );
    expect(msg).toEqual({ type: "groups", grupos: [{ id: 1, membros: ["ana"] }] });
  });
});

describe("cp14 — mundo-modelo cabines (plot demarcado)", () => {
  it("plot no canto de cada chunk: borda de pedra-lavrada rente ao chão, sem paredes", () => {
    const w = generateCabinsWorld(DIMS);
    // borda 5×5 no chão (y=3): cantos e lados = pedra-lavrada
    expect(getBlock(w, 0, 3, 0)).toBe(BlockId.StoneBricks);
    expect(getBlock(w, 4, 3, 0)).toBe(BlockId.StoneBricks);
    expect(getBlock(w, 0, 3, 4)).toBe(BlockId.StoneBricks);
    expect(getBlock(w, 2, 3, 4)).toBe(BlockId.StoneBricks); // lado z=4
    // miolo do plot continua grama (borda só no perímetro)
    expect(getBlock(w, 2, 3, 2)).toBe(BlockId.Grass);
    // NADA acima do chão: sem paredes, sem teto
    expect(getBlock(w, 0, 4, 0)).toBe(BlockId.Air);
    expect(getBlock(w, 0, 5, 0)).toBe(BlockId.Air);
    // um plot POR chunk (vizinho em x=16); fora do footprint = grama
    expect(getBlock(w, 16, 3, 0)).toBe(BlockId.StoneBricks);
    expect(getBlock(w, 16 + 8, 3, 8)).toBe(BlockId.Grass);
  });

  it("preset cabines na sessão: spawn desloca pro meio do chunk (fora do plot)", () => {
    const sent: unknown[] = [];
    const session = new GameSession(() => sent.push(0), {
      dims: DIMS,
      preset: "cabines",
      singleplayer: true,
    });
    // centro do mundo (16) é canto de chunk = borda do plot; spawn vai pra 16+8+0.5
    expect(session.spawn).toEqual({ x: 24.5, y: 4, z: 24.5 });
    expect(getBlock(session.world, 16, 3, 16)).toBe(BlockId.StoneBricks);
  });

  it("flat: true continua valendo como alias do preset plano", () => {
    const session = new GameSession(() => undefined, {
      dims: DIMS,
      flat: true,
      singleplayer: true,
    });
    expect(getBlock(session.world, 8, 3, 8)).toBe(BlockId.Grass);
    expect(getBlock(session.world, 8, 4, 8)).toBe(BlockId.Air); // sem cabine
  });
});
