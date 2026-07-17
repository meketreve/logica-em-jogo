import { describe, expect, it } from "vitest";
import { GameSession, type SessionOptions } from "./session";

/**
 * /tpr (pedir teleporte) + /tpa (aceitar) — todos os jogadores; e /tp nome /
 * /tp nome x y z — teleoperação direta do professor. Convenção combinada em
 * 2026-07-17: aluno nunca teleporta ninguém sem consentimento.
 */

const DIMS = { x: 2, z: 2, y: 2 };

function makeTp(opts: SessionOptions = {}) {
  const sent: { id: number; data: string | ArrayBuffer }[] = [];
  const clock = { t: 1_000_000 };
  const session = new GameSession((id, data) => sent.push({ id, data }), {
    dims: DIMS,
    seed: 3,
    flat: true,
    codigo: "prof42",
    now: () => clock.t,
    ...opts,
  });
  const send = (id: number, msg: unknown): void =>
    session.handleMessage(id, JSON.stringify(msg));
  const chat = (id: number, text: string): void => send(id, { type: "chat", text });
  const msgsTo = (id: number): Record<string, unknown>[] =>
    sent
      .filter((s) => s.id === id && typeof s.data === "string")
      .map((s) => JSON.parse(s.data as string) as Record<string, unknown>);
  const lastChat = (id: number): string =>
    (msgsTo(id).filter((m) => m["type"] === "chat").at(-1)?.["text"] as string) ?? "";
  const lastTeleport = (id: number) =>
    msgsTo(id).filter((m) => m["type"] === "teleport").at(-1);

  // professor + 2 alunos em posições conhecidas
  send(1, { type: "join", name: "prof", pin: "1111", codigo: "prof42" });
  send(2, { type: "join", name: "ana", pin: "2222" });
  send(3, { type: "join", name: "bia", pin: "3333" });
  send(1, { type: "move", x: 4.5, y: 4, z: 4.5, yaw: 0, pitch: 0 });
  send(2, { type: "move", x: 10.5, y: 4, z: 10.5, yaw: 0, pitch: 0 });
  send(3, { type: "move", x: 20.5, y: 4, z: 20.5, yaw: 0, pitch: 0 });
  return { session, send, chat, msgsTo, lastChat, lastTeleport, clock };
}

describe("/tpr e /tpa — pedido e aceite", () => {
  it("fluxo feliz: ana pede, bia aceita, ana aparece na bia; pedido é consumido", () => {
    const s = makeTp();
    s.chat(2, "/tpr bia");
    expect(s.lastChat(2)).toContain("Pedido enviado a bia");
    expect(s.lastChat(3)).toContain("ana quer se teleportar até você");
    s.chat(3, "/tpa");
    expect(s.lastChat(3)).toContain("aceitou o pedido de ana");
    expect(s.lastTeleport(2)).toMatchObject({ x: 20.5, z: 20.5 });
    expect(s.lastChat(2)).toContain("bia aceitou");
    // consumido: aceitar de novo não tem o que aceitar
    s.chat(3, "/tpa");
    expect(s.lastChat(3)).toContain("Não há pedido");
  });

  it("/tpr valida: nome offline, si mesmo, uso", () => {
    const s = makeTp();
    s.chat(2, "/tpr caio");
    expect(s.lastChat(2)).toContain('"caio" não está no mundo');
    s.chat(2, "/tpr ana");
    expect(s.lastChat(2)).toContain("Você já está aí");
    s.chat(2, "/tpr");
    expect(s.lastChat(2)).toContain("Uso: /tpr nome");
  });

  it("pedido expira em 30 s (clock injetado)", () => {
    const s = makeTp();
    s.chat(2, "/tpr bia");
    s.clock.t += 31_000;
    s.chat(3, "/tpa");
    expect(s.lastChat(3)).toContain("Não há pedido");
    expect(s.lastTeleport(2)).toBeUndefined();
  });

  it("dois pedidos: /tpa nome escolhe; /tpa sem nome pega o restante mais recente", () => {
    const s = makeTp();
    s.chat(2, "/tpr bia"); // ana → bia
    s.chat(1, "/tpr bia"); // prof → bia (mais recente)
    s.chat(3, "/tpa ana"); // escolhe o da ana explicitamente
    expect(s.lastTeleport(2)).toMatchObject({ x: 20.5, z: 20.5 });
    s.chat(3, "/tpa"); // sobrou o do prof
    expect(s.lastTeleport(1)).toMatchObject({ x: 20.5, z: 20.5 });
  });

  it("quem pediu e desconectou não é teleportado (poda no aceite)", () => {
    const s = makeTp();
    s.chat(2, "/tpr bia");
    s.session.handleDisconnect(2);
    s.chat(3, "/tpa");
    expect(s.lastChat(3)).toContain("Não há pedido");
  });
});

describe("/tp nome — teleoperação do professor", () => {
  it("professor vai até o aluno; aluno não usa /tp", () => {
    const s = makeTp();
    s.chat(1, "/tp ana");
    expect(s.lastTeleport(1)).toMatchObject({ x: 10.5, z: 10.5 });
    s.chat(2, "/tp bia");
    expect(s.lastChat(2)).toContain("Somente o professor");
    expect(s.lastChat(2)).toContain("/tpr");
  });

  it("/tp nome x y z envia o aluno; ~ é relativo ao TELEPORTADO", () => {
    const s = makeTp();
    s.chat(1, "/tp ana 25 ~ ~2");
    // ana estava em (10.5, 4, 10.5) → célula (10,4,10); ~2 em z = 12
    expect(s.lastTeleport(2)).toMatchObject({ x: 25.5, y: 4, z: 12.5 });
    expect(s.lastChat(2)).toContain("O professor teleportou você");
    expect(s.lastChat(1)).toContain("ana foi teleportado para (25, 4, 12)");
  });

  it("/tp valida: offline, coords fora do mundo, coord quebrada", () => {
    const s = makeTp();
    s.chat(1, "/tp caio");
    expect(s.lastChat(1)).toContain('"caio" não está no mundo');
    s.chat(1, "/tp ana 99 0 0");
    expect(s.lastChat(1)).toContain("fora do mundo");
    s.chat(1, "/tp ana ~a ~ ~");
    expect(s.lastChat(1)).toContain("Não entendi as coordenadas");
  });

  it("/tp grupos continua roteando (sem grupos = mensagem própria)", () => {
    const s = makeTp();
    s.chat(1, "/tp grupos");
    expect(s.lastChat(1)).toContain("Não há grupos");
  });
});
