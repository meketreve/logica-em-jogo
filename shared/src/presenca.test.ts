import { describe, expect, it } from "vitest";
import { HEARTBEAT_PING_MS, HEARTBEAT_TIMEOUT_MS, SERVER_TICK_RATE } from "./constants";
import { parseClientMessage, parseServerMessage } from "./protocol";
import { GameSession } from "./session";

/**
 * PRESENÇA (bug-672) — "você ainda está aí?".
 *
 * A queixa: no tablet, minimizar/fechar o navegador nem sempre fecha o socket,
 * e o nome ficava preso em jogo — a própria criança não conseguia voltar.
 */

type Sent = { clientId: number; data: string | ArrayBuffer }[];
function collect(): { sent: Sent; send: (c: number, d: string | ArrayBuffer) => void } {
  const sent: Sent = [];
  return { sent, send: (clientId, data) => sent.push({ clientId, data }) };
}
const join = (name: string, pin?: string, codigo?: string) =>
  JSON.stringify({ type: "join", name, pin, codigo });

/** Sessão com relógio de MENTIRA: presença é tempo, e teste com tempo real
 *  seria um teste de 15 segundos (ou um teste que pisca). */
function sala() {
  const { sent, send } = collect();
  let agora = 0;
  const derrubados: number[] = [];
  const session = new GameSession(send, {
    dims: { x: 2, z: 2, y: 2 },
    seed: 1,
    codigo: "sala",
    now: () => agora,
    aoDerrubar: (id) => derrubados.push(id),
  });
  /** Avança o relógio e roda os ticks correspondentes. */
  const avancar = (ms: number) => {
    const ticks = Math.max(1, Math.round((ms / 1000) * SERVER_TICK_RATE));
    for (let i = 0; i < ticks; i++) {
      agora += ms / ticks;
      session.tick();
    }
  };
  return { session, sent, derrubados, avancar };
}

const pings = (sent: Sent, clientId: number) =>
  sent
    .filter((e) => e.clientId === clientId)
    .map((e) => parseServerMessage(e.data as string))
    .filter((m) => m?.type === "ping");

const nomesEmJogo = (s: GameSession) => s.jogadoresConectados().map((j) => j.name);

describe("bug-672 — o servidor pergunta, e quem não responde cai", () => {
  it("quem entrou recebe `ping` de tempos em tempos", () => {
    const { session, sent, avancar } = sala();
    session.handleMessage(1, join("ana", "1111", "sala"));
    expect(pings(sent, 1)).toHaveLength(0);
    avancar(HEARTBEAT_PING_MS + 200);
    expect(pings(sent, 1).length).toBeGreaterThanOrEqual(1);
  });

  it("o SILÊNCIO derruba: o nome fica livre e o hospedeiro é avisado", () => {
    const { session, derrubados, avancar } = sala();
    session.handleMessage(1, join("ana", "1111", "sala"));
    expect(nomesEmJogo(session)).toEqual(["ana"]);

    avancar(HEARTBEAT_TIMEOUT_MS - 1000);
    expect(nomesEmJogo(session)).toEqual(["ana"]); // ainda dentro da tolerância

    avancar(2000);
    expect(nomesEmJogo(session)).toEqual([]);
    expect(derrubados).toEqual([1]); // o host fecha o socket meio-aberto
  });

  it("A QUEIXA INTEIRA: o tablet minimizou, e a criança consegue voltar com o mesmo nome", () => {
    const { session, avancar } = sala();
    session.handleMessage(1, join("ana", "1111", "sala"));
    // antes do conserto, o socket fantasma segurava o nome e isto era recusado
    session.handleMessage(2, join("ana", "1111", "sala"));
    const negado = (id: number) =>
      session.jogadoresConectados().some((j) => j.id === id) === false;
    expect(negado(2)).toBe(true); // com o fantasma vivo, entrar é recusado MESMO

    avancar(HEARTBEAT_TIMEOUT_MS + 1000); // o fantasma cai
    session.handleMessage(3, join("ana", "1111", "sala"));
    expect(nomesEmJogo(session)).toEqual(["ana"]);
    expect(session.jogadoresConectados()[0]?.id).toBe(3);
  });

  it("o `pong` segura o jogador em jogo indefinidamente", () => {
    const { session, avancar } = sala();
    session.handleMessage(1, join("ana", "1111", "sala"));
    for (let i = 0; i < 10; i++) {
      avancar(HEARTBEAT_TIMEOUT_MS - 2000);
      session.handleMessage(1, JSON.stringify({ type: "pong", t: 1 }));
    }
    expect(nomesEmJogo(session)).toEqual(["ana"]);
  });

  it("QUALQUER mensagem conta como sinal de vida — quem joga nunca cai", () => {
    const { session, avancar } = sala();
    session.handleMessage(1, join("ana", "1111", "sala"));
    const p = session.players.get(1)!;
    for (let i = 0; i < 6; i++) {
      avancar(HEARTBEAT_TIMEOUT_MS - 2000);
      // um `move` comum: o cliente que está jogando manda isto o tempo todo
      session.handleMessage(1, JSON.stringify({
        type: "move", x: p.x, y: p.y, z: p.z, yaw: 0, pitch: 0,
      }));
    }
    expect(nomesEmJogo(session)).toEqual(["ana"]);
  });

  it("um aluno silencioso não leva os outros junto", () => {
    const { session, derrubados, avancar } = sala();
    session.handleMessage(1, join("ana", "1111", "sala"));
    session.handleMessage(2, join("bia", "2222"));
    for (let i = 0; i < 6; i++) {
      avancar(HEARTBEAT_TIMEOUT_MS - 2000);
      session.handleMessage(2, JSON.stringify({ type: "pong" })); // só a bia responde
    }
    expect(nomesEmJogo(session)).toEqual(["bia"]);
    expect(derrubados).toEqual([1]);
  });

  it("SINGLEPLAYER não vigia ninguém — o mundo é do próprio jogador", () => {
    const { send } = collect();
    let agora = 0;
    const derrubados: number[] = [];
    const s = new GameSession(send, {
      dims: { x: 2, z: 2, y: 2 }, seed: 1, singleplayer: true,
      now: () => agora, aoDerrubar: (id) => derrubados.push(id),
    });
    s.handleMessage(1, join("dono"));
    for (let i = 0; i < 400; i++) {
      agora += 100;
      s.tick();
    }
    expect(nomesEmJogo(s)).toEqual(["dono"]);
    expect(derrubados).toEqual([]);
  });

  it("o `pong` é aceito pelo parse (com e sem carimbo) e não faz mais nada", () => {
    expect(parseClientMessage(JSON.stringify({ type: "pong", t: 42 }))).toEqual({ type: "pong", t: 42 });
    expect(parseClientMessage(JSON.stringify({ type: "pong" }))).toEqual({ type: "pong" });
    expect(parseClientMessage(JSON.stringify({ type: "pong", t: "x" }))).toEqual({ type: "pong" });
  });

  it("o `ping` leva carimbo, e ping sem carimbo é lixo", () => {
    expect(parseServerMessage(JSON.stringify({ type: "ping", t: 7 }))).toEqual({ type: "ping", t: 7 });
    expect(parseServerMessage(JSON.stringify({ type: "ping" }))).toBeNull();
  });
});
