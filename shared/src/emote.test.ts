import { describe, expect, it } from "vitest";
import { parseClientMessage, parseServerMessage } from "./protocol";
import { GameSession } from "./session";

/**
 * Menu radial de emojis (2026-09-03) — regra `emogis` (padrão DESLIGADA,
 * `regras.ts`) + `case "emote"` (session.ts) que broadcasta `gesto`. Sem
 * efeito de jogo nenhum: só o gesto visual pra turma ver.
 */

type Sent = { clientId: number; data: string | ArrayBuffer }[];
function collect(): { sent: Sent; send: (c: number, d: string | ArrayBuffer) => void } {
  const sent: Sent = [];
  return { sent, send: (clientId, data) => sent.push({ clientId, data }) };
}
const join = (name: string, pin?: string, codigo?: string) =>
  JSON.stringify({ type: "join", name, pin, codigo });
const regra = (texto: string) => JSON.stringify({ type: "chat", text: texto });
const emote = (nome: string) => JSON.stringify({ type: "emote", emote: nome });

function chatsDe(sent: Sent, clientId: number): string[] {
  const out: string[] = [];
  for (const s of sent) {
    if (s.clientId !== clientId) continue;
    const m = parseServerMessage(s.data as string);
    if (m?.type === "chat") out.push(m.text);
  }
  return out;
}
function gestosDe(sent: Sent, clientId: number): { id: number; gesto: string }[] {
  const out: { id: number; gesto: string }[] = [];
  for (const s of sent) {
    if (s.clientId !== clientId) continue;
    const m = parseServerMessage(s.data as string);
    if (m?.type === "gesto") out.push({ id: m.id, gesto: m.gesto });
  }
  return out;
}

function turma() {
  const { sent, send } = collect();
  const session = new GameSession(send, { dims: { x: 2, z: 2, y: 2 }, seed: 5, codigo: "sala" });
  session.handleMessage(1, join("prof", "4321", "sala"));
  session.handleMessage(2, join("ana", "1111"));
  session.handleMessage(3, join("bia", "2222"));
  return { session, sent };
}

describe("protocolo do emote", () => {
  it("aceita os 3 emojis válidos, recusa lixo", () => {
    expect(parseClientMessage(emote("aceno"))).toEqual({ type: "emote", emote: "aceno" });
    expect(parseClientMessage(emote("comemorar"))).toEqual({ type: "emote", emote: "comemorar" });
    expect(parseClientMessage(emote("danca"))).toEqual({ type: "emote", emote: "danca" });
    for (const lixo of ['{"type":"emote"}', '{"type":"emote","emote":"bater"}', '{"type":"emote","emote":"dança"}']) {
      expect(parseClientMessage(lixo)).toBeNull();
    }
  });

  it("`gesto` aceita os 5 tipos (2 antigos + 3 emojis novos)", () => {
    for (const g of ["bater", "interagir", "aceno", "comemorar", "danca"]) {
      expect(parseServerMessage(`{"type":"gesto","id":2,"gesto":"${g}"}`)).toEqual({
        type: "gesto",
        id: 2,
        gesto: g,
      });
    }
    expect(parseServerMessage('{"type":"gesto","id":2,"gesto":"pulando"}')).toBeNull();
  });
});

describe("regra `emogis` (padrão desligada)", () => {
  it("desligada: emoji não broadcasta gesto, e o autor recebe aviso com freio", () => {
    const { session, sent } = turma();
    session.handleMessage(2, emote("aceno"));
    expect(gestosDe(sent, 1)).toEqual([]);
    expect(chatsDe(sent, 2).at(-1) ?? "").toContain("desligado");

    // freio: pedir de novo na mesma janela não repete o aviso
    const antes = chatsDe(sent, 2).length;
    session.handleMessage(2, emote("aceno"));
    expect(chatsDe(sent, 2).length).toBe(antes);
  });

  it("ligada (`/regra emogis ligar`): o emoji escolhido chega pra TODO MUNDO, inclusive quem clicou", () => {
    const { session, sent } = turma();
    session.handleMessage(1, regra("/regra emogis ligar"));
    session.handleMessage(3, emote("comemorar"));
    for (const quem of [1, 2, 3]) {
      expect(gestosDe(sent, quem)).toEqual([{ id: 3, gesto: "comemorar" }]);
    }
  });

  it("os 3 emojis broadcastam certinho, cada um com o próprio nome", () => {
    const { session, sent } = turma();
    session.handleMessage(1, regra("/regra emogis ligar"));
    session.handleMessage(2, emote("aceno"));
    session.handleMessage(2, emote("danca"));
    expect(gestosDe(sent, 1)).toEqual([
      { id: 2, gesto: "aceno" },
      { id: 2, gesto: "danca" },
    ]);
  });

  it("quem não entrou no mundo não consegue emotar (no-op silencioso)", () => {
    const { session, sent } = turma();
    session.handleMessage(1, regra("/regra emogis ligar"));
    session.handleMessage(99, emote("aceno")); // clientId sem join
    expect(gestosDe(sent, 1)).toEqual([]);
  });

  it("mundo de AULA NÃO bloqueia o emote (decisão de projeto: sem efeito de jogo, ao contrário do pvp que muda vida de verdade)", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, {
      dims: { x: 2, z: 2, y: 2 },
      seed: 5,
      codigo: "sala",
      somenteLeitura: true,
    });
    session.handleMessage(1, join("prof", "4321", "sala"));
    session.handleMessage(1, regra("/regra emogis ligar"));
    session.handleMessage(1, emote("aceno"));
    expect(gestosDe(sent, 1)).toEqual([{ id: 1, gesto: "aceno" }]);
  });
});
