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
  /** Avança o relógio SEM rodar tick — o host parado (bug-675). */
  const pular = (ms: number) => {
    agora += ms;
  };
  return { session, sent, derrubados, avancar, pular };
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

  it("bug-675: o HOST é que parou — a turma inteira não pode cair por isso", () => {
    // Máquina do professor dormiu / travou / troca de aula lenta: o relógio de
    // parede anda, mas nenhum `ping` sai, então ninguém foi perguntado. Antes
    // do conserto o tick seguinte derrubava 3 de 3 de uma vez.
    const { session, derrubados, avancar, pular } = sala();
    for (const [id, nome] of [[1, "ana"], [2, "bia"], [3, "caio"]] as const) {
      session.handleMessage(id, join(nome, "1111", "sala"));
    }
    avancar(HEARTBEAT_PING_MS + 200);
    expect(nomesEmJogo(session)).toHaveLength(3);

    pular(HEARTBEAT_TIMEOUT_MS + 5000); // host fora do ar, sem tick nenhum
    session.tick();
    expect(nomesEmJogo(session)).toHaveLength(3);
    expect(derrubados).toEqual([]);

    // e a vigília volta a valer: quem continua calado DEPOIS da volta cai
    avancar(HEARTBEAT_TIMEOUT_MS + 1000);
    expect(nomesEmJogo(session)).toEqual([]);
  });

  it("bug-675 (sobra): a parada MÉDIA do host não come a janela do aluno", () => {
    // O reset do bug-675 só dispara com buraco > PAUSA_DO_HOSPEDEIRO_MS (8 s).
    // Um buraco de 7,8 s NÃO reseta — e se o aluno tinha engasgado a rede
    // (perdeu uma ou duas perguntas), o silêncio COMPOSTO estoura os 15 s num
    // tick que roda com o host recém-voltado: ele paga por um tempo em que
    // ninguém o perguntou, e cai no instante em que voltaria a responder. A
    // ana responde à 1ª pergunta, engasga nas duas seguintes, o host trava
    // 7,8 s — e o tick da volta NÃO pode derrubá-la: com três perguntas de
    // verdade é que se cobra silêncio, e a 3ª ainda nem saiu.
    const { session, derrubados, avancar, pular } = sala();
    session.handleMessage(1, join("ana", "1111", "sala"));
    avancar(HEARTBEAT_PING_MS + 200); // 1ª rodada de ping sai
    session.handleMessage(1, JSON.stringify({ type: "pong", t: 1 })); // ela responde
    avancar(HEARTBEAT_PING_MS * 2); // 2ª e 3ª rodadas saem; a rede dela engasgou
    pular(7800); // host travado 7,8 s — abaixo do limiar, sem reset
    session.tick(); // o tick da volta
    expect(derrubados).toEqual([]);
    expect(nomesEmJogo(session)).toEqual(["ana"]);
    // e a vigília segue pra ela: responde à pergunta que saiu agora e continua
    session.handleMessage(1, JSON.stringify({ type: "pong", t: 1 }));
    avancar(HEARTBEAT_PING_MS + 200);
    expect(nomesEmJogo(session)).toEqual(["ana"]);
  });

  it("A QUEIXA INTEIRA: o tablet minimizou, e a criança consegue voltar com o mesmo nome", () => {
    // 2026-10-13: nem precisa esperar o fantasma cair — com o PIN certo, quem
    // volta TOMA POSSE do nome na hora (o socket antigo é derrubado aqui). A
    // vigília segue como rede de segurança pra quando NINGUÉM volta.
    const { session, derrubados } = sala();
    session.handleMessage(1, join("ana", "1111", "sala"));
    session.handleMessage(2, join("ana", "1111", "sala"));
    expect(nomesEmJogo(session)).toEqual(["ana"]);
    expect(session.jogadoresConectados()[0]?.id).toBe(2); // o nome é dela de novo
    expect(derrubados).toEqual([1]); // e o fantasma foi derrubado na hora
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
