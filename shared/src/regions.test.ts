import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { parseClientMessage, parseServerMessage } from "./protocol";
import {
  parseNamedRegion,
  regionContains,
  regionDims,
  regionFromCorners,
} from "./regions";
import { decodeSave, encodeSave, type SaveMeta } from "./save";
import { GameSession, type SessionOptions } from "./session";
import { getBlock } from "./world";

// mundo pequeno (2×2×2 chunks = 32³ blocos) — geração rápida nos testes
const DIMS = { x: 2, z: 2, y: 2 };

function makeSession(opts: SessionOptions = {}) {
  const sent: { id: number; data: string | ArrayBuffer }[] = [];
  const session = new GameSession((id, data) => sent.push({ id, data }), {
    dims: DIMS,
    seed: 7,
    codigo: "prof42",
    ...opts,
  });
  const msgsTo = (id: number): Record<string, unknown>[] =>
    sent
      .filter((s) => s.id === id && typeof s.data === "string")
      .map((s) => JSON.parse(s.data as string) as Record<string, unknown>);
  const send = (id: number, msg: unknown): void =>
    session.handleMessage(id, JSON.stringify(msg));
  return { session, msgsTo, send };
}

function joinProf(s: ReturnType<typeof makeSession>, id = 1): void {
  s.send(id, { type: "join", name: `prof${id}`, pin: "1234", codigo: "prof42" });
}
function joinAluno(s: ReturnType<typeof makeSession>, id = 2): void {
  s.send(id, { type: "join", name: `aluno${id}`, pin: "9999" });
}
/** Marca os 2 cantos e cria a região "casa" (0,0,0)→(3,4,5). */
function criarCasa(s: ReturnType<typeof makeSession>, id = 1): void {
  s.send(id, { type: "wand_mark", corner: 1, x: 3, y: 4, z: 5 });
  s.send(id, { type: "wand_mark", corner: 2, x: 0, y: 0, z: 0 });
  s.send(id, { type: "chat", text: "/regiao criar casa" });
}

describe("regions — funções puras", () => {
  it("regionFromCorners normaliza min/max por eixo (ordem dos cliques não importa)", () => {
    const r = regionFromCorners({ x: 5, y: 0, z: 2 }, { x: 1, y: 3, z: 2 });
    expect(r.min).toEqual({ x: 1, y: 0, z: 2 });
    expect(r.max).toEqual({ x: 5, y: 3, z: 2 });
  });

  it("regionContains é inclusivo nas bordas", () => {
    const r = { nome: "r", min: { x: 1, y: 1, z: 1 }, max: { x: 3, y: 3, z: 3 } };
    expect(regionContains(r, 1, 1, 1)).toBe(true);
    expect(regionContains(r, 3, 3, 3)).toBe(true);
    expect(regionContains(r, 0, 2, 2)).toBe(false);
    expect(regionContains(r, 2, 4, 2)).toBe(false);
  });

  it("regionDims conta blocos inclusive (1 célula = 1×1×1)", () => {
    expect(
      regionDims({ nome: "r", min: { x: 2, y: 2, z: 2 }, max: { x: 2, y: 2, z: 2 } }),
    ).toEqual({ x: 1, y: 1, z: 1 });
  });

  it("parseNamedRegion rejeita nome vazio, coords não-inteiras e min>max", () => {
    const ok = { nome: "ok", min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } };
    expect(parseNamedRegion(ok)).toEqual(ok);
    expect(parseNamedRegion({ ...ok, nome: "" })).toBeNull();
    expect(parseNamedRegion({ ...ok, min: { x: 0.5, y: 0, z: 0 } })).toBeNull();
    expect(parseNamedRegion({ ...ok, max: { x: -1, y: 1, z: 1 } })).toBeNull();
    expect(parseNamedRegion(null)).toBeNull();
  });
});

describe("regions — protocolo", () => {
  it("wand_mark: roundtrip válido; corner fora de 1|2 e coords quebradas = null", () => {
    const raw = JSON.stringify({ type: "wand_mark", corner: 2, x: 1, y: 2, z: 3 });
    expect(parseClientMessage(raw)).toEqual({ type: "wand_mark", corner: 2, x: 1, y: 2, z: 3 });
    expect(
      parseClientMessage(JSON.stringify({ type: "wand_mark", corner: 3, x: 1, y: 2, z: 3 })),
    ).toBeNull();
    expect(
      parseClientMessage(JSON.stringify({ type: "wand_mark", corner: 1, x: 1.5, y: 2, z: 3 })),
    ).toBeNull();
  });

  it("spawn: papel opcional (host antigo sem papel continua válido)", () => {
    const com = parseServerMessage(
      JSON.stringify({ type: "spawn", x: 1, y: 2, z: 3, papel: "professor" }),
    );
    expect(com).toMatchObject({ papel: "professor" });
    const sem = parseServerMessage(JSON.stringify({ type: "spawn", x: 1, y: 2, z: 3 }));
    expect(sem).toEqual({ type: "spawn", x: 1, y: 2, z: 3 });
  });

  it("regions: entrada inválida é pulada sem derrubar a lista", () => {
    const ok = { nome: "a", min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } };
    const msg = parseServerMessage(
      JSON.stringify({ type: "regions", regions: [ok, { nome: "", min: 1 }] }),
    );
    expect(msg).toEqual({ type: "regions", regions: [ok] });
  });
});

describe("regions — sessão (varinha + /regiao)", () => {
  it("professor marca 2 cantos, cria região e recebe a lista; papel vai no spawn", () => {
    const s = makeSession();
    joinProf(s);
    criarCasa(s);
    const msgs = s.msgsTo(1);
    expect(msgs.find((m) => m["type"] === "spawn")).toMatchObject({ papel: "professor" });
    const regions = msgs.filter((m) => m["type"] === "regions").at(-1);
    expect(regions?.["regions"]).toEqual([
      { nome: "casa", min: { x: 0, y: 0, z: 0 }, max: { x: 3, y: 4, z: 5 } },
    ]);
    const reply = msgs.filter((m) => m["type"] === "chat").at(-1);
    expect(reply?.["text"]).toContain('Região "casa" criada: 4×5×6');
  });

  it("aluno não marca (aviso no chat) e não recebe lista de regiões", () => {
    const s = makeSession();
    joinProf(s);
    criarCasa(s);
    joinAluno(s);
    s.send(2, { type: "wand_mark", corner: 1, x: 0, y: 0, z: 0 });
    const msgs = s.msgsTo(2);
    expect(msgs.find((m) => m["type"] === "spawn")).not.toMatchObject({ papel: "professor" });
    expect(msgs.some((m) => m["type"] === "regions")).toBe(false);
    expect(msgs.filter((m) => m["type"] === "chat").at(-1)?.["text"]).toContain(
      "só o professor",
    );
  });

  it("criar sem os 2 cantos explica o uso; nome duplicado é recusado", () => {
    const s = makeSession();
    joinProf(s);
    s.send(1, { type: "chat", text: "/regiao criar casa" });
    expect(s.msgsTo(1).filter((m) => m["type"] === "chat").at(-1)?.["text"]).toContain(
      "Marque os dois cantos",
    );
    criarCasa(s);
    s.send(1, { type: "wand_mark", corner: 1, x: 1, y: 1, z: 1 });
    s.send(1, { type: "wand_mark", corner: 2, x: 2, y: 2, z: 2 });
    s.send(1, { type: "chat", text: "/regiao criar casa" });
    expect(s.msgsTo(1).filter((m) => m["type"] === "chat").at(-1)?.["text"]).toContain(
      "Já existe uma região",
    );
  });

  it("apagar remove e re-broadcasta; regiões persistem no save e no restore", () => {
    const s = makeSession();
    joinProf(s);
    criarCasa(s);

    // persiste: encode→decode devolve a região intacta
    const decoded = decodeSave(encodeSave(s.session.world, s.session.toSave()));
    expect(decoded.regioes).toEqual([
      { nome: "casa", min: { x: 0, y: 0, z: 0 }, max: { x: 3, y: 4, z: 5 } },
    ]);

    // restore: sessão nova enxerga a região (professor recebe no join)
    const s2 = makeSession({ restore: decoded });
    joinProf(s2, 5);
    const lista = s2.msgsTo(5).filter((m) => m["type"] === "regions").at(-1);
    expect(lista?.["regions"]).toEqual(decoded.regioes);

    // apagar: lista volta vazia pro professor online
    s.send(1, { type: "chat", text: "/regiao apagar casa" });
    expect(
      s.msgsTo(1).filter((m) => m["type"] === "regions").at(-1)?.["regions"],
    ).toEqual([]);
    expect(s.session.toSave().regioes).toBeUndefined();
  });

  it("/regiao lista devolve UMA região por linha", () => {
    const s = makeSession();
    joinProf(s);
    criarCasa(s);
    s.send(1, { type: "wand_mark", corner: 1, x: 10, y: 10, z: 10 });
    s.send(1, { type: "wand_mark", corner: 2, x: 12, y: 12, z: 12 });
    s.send(1, { type: "chat", text: "/regiao criar torre" });
    s.send(1, { type: "chat", text: "/regiao lista" });
    const reply = s.msgsTo(1).filter((m) => m["type"] === "chat").at(-1)?.["text"];
    expect(reply).toBe(
      "casa: (0,0,0)→(3,4,5) 4×5×6\ntorre: (10,10,10)→(12,12,12) 3×3×3",
    );
  });

  it("wand_mark fora do mundo é ignorado (não vira canto)", () => {
    const s = makeSession();
    joinProf(s);
    s.send(1, { type: "wand_mark", corner: 1, x: -1, y: 0, z: 0 });
    s.send(1, { type: "wand_mark", corner: 2, x: 0, y: 0, z: 0 });
    s.send(1, { type: "chat", text: "/regiao criar fora" });
    expect(s.msgsTo(1).filter((m) => m["type"] === "chat").at(-1)?.["text"]).toContain(
      "Marque os dois cantos",
    );
  });

  it("/regiao sortear preenche a região só com os ids dados", () => {
    const s = makeSession();
    joinProf(s);
    criarCasa(s); // (0,0,0)→(3,4,5)
    s.send(1, {
      type: "chat",
      text: `/regiao sortear casa ${BlockId.WoolRed} ${BlockId.WoolBlue}`,
    });
    expect(s.msgsTo(1).filter((m) => m["type"] === "chat").at(-1)?.["text"]).toContain(
      "sorteado(s) entre 2 tipo(s)",
    );
    // invariante independente do sorteio: toda célula é uma das duas lãs
    for (let y = 0; y <= 4; y++)
      for (let z = 0; z <= 5; z++)
        for (let x = 0; x <= 3; x++) {
          expect([BlockId.WoolRed, BlockId.WoolBlue]).toContain(
            getBlock(s.session.world, x, y, z),
          );
        }
  });

  it("/regiao sortear recusa id inexistente e região que não existe", () => {
    const s = makeSession();
    joinProf(s);
    criarCasa(s);
    s.send(1, { type: "chat", text: "/regiao sortear casa 999" });
    expect(s.msgsTo(1).filter((m) => m["type"] === "chat").at(-1)?.["text"]).toContain(
      "Não existe bloco",
    );
    s.send(1, { type: "chat", text: `/regiao sortear fantasma ${BlockId.WoolRed}` });
    expect(s.msgsTo(1).filter((m) => m["type"] === "chat").at(-1)?.["text"]).toContain(
      'Não existe região chamada "fantasma"',
    );
  });

  it("decodeSave pula entrada de região quebrada (save editado à mão)", () => {
    const s = makeSession();
    joinProf(s);
    criarCasa(s);
    const meta = s.session.toSave();
    const sujo = {
      ...meta,
      regioes: [...(meta.regioes ?? []), { nome: "", min: 0 }],
    } as unknown as SaveMeta;
    const decoded = decodeSave(encodeSave(s.session.world, sujo));
    expect(decoded.regioes).toHaveLength(1);
  });
});
