import { describe, expect, it } from "vitest";
import { GameSession, type SessionOptions } from "./session";
import { TP_PEDIDO_MS } from "./session/tp";

/**
 * /tpp (pedir teleporte) + /tpa (aceitar) — todos os jogadores; e /tp nome /
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

describe("o servidor AVISA quem tem pedido aberto (msg tp_pedidos, 2026-10-15)", () => {
  /** A última lista que ESTE cliente recebeu (ou null se nunca recebeu uma). */
  const ultimaLista = (s: ReturnType<typeof makeTp>, id: number): string[] | null => {
    const m = s.msgsTo(id).filter((x) => x["type"] === "tp_pedidos").at(-1);
    if (!m) return null;
    return (m["pedidos"] as { de: string }[]).map((p) => p.de);
  };

  it("quem recebe o pedido passa a saber QUEM pediu", () => {
    // o pedido chegava só como texto no chat: o painel do dedo oferecia a
    // turma inteira no /tpa porque o cliente não tinha como saber
    const s = makeTp();
    expect(ultimaLista(s, 3)).toBeNull();
    s.chat(2, "/tpp bia");
    expect(ultimaLista(s, 3)).toEqual(["ana"]);
    expect(ultimaLista(s, 2)).toBeNull(); // quem PEDE não ganha lista nenhuma
  });

  it("dois pedidos ao mesmo tempo chegam os dois, na ordem em que foram feitos", () => {
    const s = makeTp();
    s.chat(2, "/tpp bia");
    s.chat(1, "/tpp bia");
    expect(ultimaLista(s, 3)).toEqual(["ana", "prof"]);
  });

  it("aceitar TIRA da lista na hora", () => {
    const s = makeTp();
    s.chat(2, "/tpp bia");
    s.chat(1, "/tpp bia");
    s.chat(3, "/tpa ana");
    expect(ultimaLista(s, 3)).toEqual(["prof"]);
    s.chat(3, "/tpa");
    expect(ultimaLista(s, 3)).toEqual([]);
  });

  it("o prazo vai como o que FALTA, não como horário (relógio de tablet não bate)", () => {
    const s = makeTp();
    s.chat(2, "/tpp bia");
    const m = s.msgsTo(3).filter((x) => x["type"] === "tp_pedidos").at(-1);
    const pedidos = m?.["pedidos"] as { de: string; emMs: number }[];
    expect(pedidos[0]?.emMs).toBe(TP_PEDIDO_MS);
  });

  it("pedido EXPIRADO some da lista no próximo aviso", () => {
    const s = makeTp();
    s.chat(2, "/tpp bia");
    s.clock.t += TP_PEDIDO_MS + 1;
    s.chat(1, "/tpp bia"); // um pedido novo força o aviso
    expect(ultimaLista(s, 3)).toEqual(["prof"]);
  });

  it("quem SAI do mundo some da lista de quem ele tinha pedido", () => {
    // sem isto o tablet de bia oferece "ana" depois de ana fechar a aba, e o
    // toque só rende recusa — o contrário do que a lista existe pra fazer
    const s = makeTp();
    s.chat(2, "/tpp bia");
    expect(ultimaLista(s, 3)).toEqual(["ana"]);
    s.session.handleDisconnect(2);
    expect(ultimaLista(s, 3)).toEqual([]);
  });

  it("CONTROLE NEGATIVO: sem pedido nenhum ninguém recebe lista", () => {
    const s = makeTp();
    s.chat(3, "/tpa"); // tentativa sem pedido: responde no chat…
    expect(s.lastChat(3)).toContain("Não há pedido");
    expect(ultimaLista(s, 3)).toEqual([]); // …e a lista vazia é a verdade
    expect(ultimaLista(s, 1)).toBeNull();
    expect(ultimaLista(s, 2)).toBeNull();
  });
});

describe("/tpp e /tpa — pedido e aceite", () => {
  it("fluxo feliz: ana pede, bia aceita, ana aparece na bia; pedido é consumido", () => {
    const s = makeTp();
    s.chat(2, "/tpp bia");
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

  it("/tpp valida: nome offline, si mesmo, uso", () => {
    const s = makeTp();
    s.chat(2, "/tpp caio");
    expect(s.lastChat(2)).toContain('"caio" não está no mundo');
    s.chat(2, "/tpp ana");
    expect(s.lastChat(2)).toContain("Você já está aí");
    s.chat(2, "/tpp");
    expect(s.lastChat(2)).toContain("Uso: /tpp nome");
  });

  it("pedido expira em 60 s (clock injetado)", () => {
    const s = makeTp();
    s.chat(2, "/tpp bia");
    expect(s.lastChat(3)).toContain("60 segundos");
    s.clock.t += TP_PEDIDO_MS + 1_000;
    s.chat(3, "/tpa");
    expect(s.lastChat(3)).toContain("Não há pedido");
    expect(s.lastTeleport(2)).toBeUndefined();
  });

  it("dentro do prazo o pedido ainda vale (fronteira do 60 s)", () => {
    const s = makeTp();
    s.chat(2, "/tpp bia");
    s.clock.t += TP_PEDIDO_MS - 1_000;
    s.chat(3, "/tpa");
    expect(s.lastTeleport(2)).toMatchObject({ x: 20.5, z: 20.5 });
  });

  it("dois pedidos: /tpa nome escolhe; /tpa sem nome pega o restante mais recente", () => {
    const s = makeTp();
    s.chat(2, "/tpp bia"); // ana → bia
    s.chat(1, "/tpp bia"); // prof → bia (mais recente)
    s.chat(3, "/tpa ana"); // escolhe o da ana explicitamente
    expect(s.lastTeleport(2)).toMatchObject({ x: 20.5, z: 20.5 });
    s.chat(3, "/tpa"); // sobrou o do prof
    expect(s.lastTeleport(1)).toMatchObject({ x: 20.5, z: 20.5 });
  });

  it("quem pediu e desconectou não é teleportado (poda no aceite)", () => {
    const s = makeTp();
    s.chat(2, "/tpp bia");
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
    expect(s.lastChat(2)).toContain("/tpp");
  });

  it("/tp nome x y z envia o aluno; ~ é relativo a QUEM DIGITA (o professor)", () => {
    const s = makeTp();
    s.chat(1, "/tp ana 25 ~ ~2");
    // professor está em (4.5, 4, 4.5) → célula (4,4,4); ~ em y = 4, ~2 em z = 6
    expect(s.lastTeleport(2)).toMatchObject({ x: 25.5, y: 4, z: 6.5 });
    expect(s.lastChat(2)).toContain("O professor teleportou você");
    expect(s.lastChat(1)).toContain("ana foi teleportado para (25, 4, 6)");
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
