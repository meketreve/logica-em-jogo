import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { GameSession } from "./session";
import { parseServerMessage } from "./protocol";
import { NOITE_FIM, NOITE_INICIO, dormindoAgora, ehNoite } from "./session/dormir";

/**
 * Dormir na cama para passar a noite (2026-08-17).
 *
 * O clique na cama continua definindo o PONTO DE NASCIMENTO (2026-08-14) e
 * passou a também DEITAR — as duas coisas no mesmo gesto, decisão do usuário.
 *
 * A regra de quantos precisam dormir é a MAIORIA dos acordados: um aluno
 * sozinho não decide pela turma, e ninguém fica refém do colega que saiu.
 */
function mundoComCama(quantos = 1) {
  const session = new GameSession(() => {}, {
    dims: { x: 2, z: 2, y: 2 },
    seed: 9,
    flat: true,
    codigo: "sala",
  });
  const send = (id: number, msg: unknown): void =>
    session.handleMessage(id, JSON.stringify(msg));
  send(1, { type: "join", name: "prof", pin: "0000", codigo: "sala" });
  for (let i = 2; i <= quantos + 1; i++) send(i, { type: "join", name: `aluno${i}`, pin: "1111" });

  // UMA cama por jogador (cama ocupada por outro é recusada — ver o último
  // teste). Cada uma é um PAR horizontal, os dois com o mesmo id.
  const w = session.world;
  const cx = Math.floor(w.sizeX / 2);
  const cy = 4;
  const cz0 = Math.floor(w.sizeZ / 2);
  const camaDe = (id: number): { x: number; y: number; z: number } => ({
    x: cx,
    y: cy,
    z: cz0 + (id - 1) * 2,
  });
  for (let i = 1; i <= quantos + 1; i++) {
    const c = camaDe(i);
    session.applyBlock(c.x, c.y, c.z, BlockId.CamaXP);
    session.applyBlock(c.x + 1, c.y, c.z, BlockId.CamaXP);
    // cada um fica perto da PRÓPRIA cama (use_block exige ALCANCE)
    send(i, { type: "move", x: c.x + 0.5, y: c.y, z: c.z + 1.5, yaw: 0, pitch: 0 });
  }

  session.cicloAtivo = true;
  session.horaDoDia = 22; // noite
  const deitar = (id: number): void => {
    const c = camaDe(id);
    send(id, { type: "use_block", x: c.x, y: c.y, z: c.z });
  };
  return { session, send, deitar, camaDe, cama: camaDe(1) };
}

describe("dormir na cama", () => {
  it("o clique na cama define o spawn E deita", () => {
    const { session, deitar } = mundoComCama();
    deitar(1);
    expect(session.spawnCama.has("prof")).toBe(true);
    expect(dormindoAgora(session, 1)).toBe(true);
  });

  it("de dia só define o spawn, não deita", () => {
    const { session, deitar } = mundoComCama();
    session.horaDoDia = 12;
    deitar(1);
    expect(session.spawnCama.has("prof")).toBe(true);
    expect(dormindoAgora(session, 1)).toBe(false);
  });

  it("com o ciclo parado não deita (mundo de aula)", () => {
    const { session, deitar } = mundoComCama();
    session.cicloAtivo = false;
    deitar(1);
    expect(session.spawnCama.has("prof")).toBe(true);
    expect(dormindoAgora(session, 1)).toBe(false);
  });

  it("a MINORIA não faz a noite passar", () => {
    const { session, deitar } = mundoComCama(2); // 3 online
    deitar(1); // 1 de 3
    // 400 ticks: no ritmo normal a hora anda 0,8 h; acelerada andaria 96 h e o
    // dia já teria chegado. Se este teste passar com "um basta", ele é vazio.
    for (let i = 0; i < 400; i++) session.tick();
    expect(ehNoite(session.horaDoDia)).toBe(true);
    expect(dormindoAgora(session, 1)).toBe(true); // ninguém acordou: não amanheceu
  });

  it("a MAIORIA amanhece", () => {
    const { session, deitar } = mundoComCama(2); // 3 online
    deitar(1);
    deitar(2); // 2 de 3 = maioria
    for (let i = 0; i < 400; i++) session.tick();
    expect(session.horaDoDia).toBeGreaterThanOrEqual(NOITE_FIM);
    expect(session.horaDoDia).toBeLessThan(NOITE_INICIO);
  });

  it("amanhecer acorda todo mundo", () => {
    const { session, deitar } = mundoComCama(1); // 2 online
    deitar(1);
    deitar(2);
    for (let i = 0; i < 400; i++) session.tick();
    expect(dormindoAgora(session, 1)).toBe(false);
    expect(dormindoAgora(session, 2)).toBe(false);
  });

  it("sair da cama acorda", () => {
    const { session, send, deitar, cama } = mundoComCama();
    deitar(1);
    expect(dormindoAgora(session, 1)).toBe(true);
    send(1, { type: "move", x: cama.x + 4, y: cama.y, z: cama.z + 4, yaw: 0, pitch: 0 });
    expect(dormindoAgora(session, 1)).toBe(false);
  });

  it("desconectar tira o jogador da conta da maioria", () => {
    const { session, deitar } = mundoComCama(2); // 3 online
    deitar(1);
    expect(session.horaDoDia).toBeLessThan(24);
    // com 3 online, 1 dormindo não é maioria; saindo 2, vira 1 de 1
    session.handleDisconnect(2);
    session.handleDisconnect(3);
    for (let i = 0; i < 400; i++) session.tick();
    expect(session.horaDoDia).toBeGreaterThanOrEqual(NOITE_FIM);
    expect(session.horaDoDia).toBeLessThan(NOITE_INICIO);
  });

  it("cama ocupada por outro recusa", () => {
    const { session, send, camaDe } = mundoComCama(1);
    const c = camaDe(1);
    send(1, { type: "use_block", x: c.x, y: c.y, z: c.z });
    // o 2 tenta a cama do 1 — precisa chegar perto dela primeiro
    send(2, { type: "move", x: c.x + 0.5, y: c.y, z: c.z + 1.5, yaw: 0, pitch: 0 });
    send(2, { type: "use_block", x: c.x, y: c.y, z: c.z });
    expect(dormindoAgora(session, 1)).toBe(true);
    expect(dormindoAgora(session, 2)).toBe(false);
  });
});

describe("protocolo do dormir", () => {
  it("parseia a mensagem dormindo com a cama", () => {
    const m = parseServerMessage(
      JSON.stringify({ type: "dormindo", dormindo: true, cama: { x: 1, y: 2, z: 3 } }),
    );
    expect(m).toEqual({ type: "dormindo", dormindo: true, cama: { x: 1, y: 2, z: 3 } });
  });

  it("deitado SEM cama válida vira em pé (a câmera não teria pra onde ir)", () => {
    const m = parseServerMessage(JSON.stringify({ type: "dormindo", dormindo: true }));
    expect(m).toEqual({ type: "dormindo", dormindo: false });
  });

  it("player_moved carrega a flag; ausente = em pé (host antigo)", () => {
    const base = { type: "player_moved", id: 7, x: 1, y: 2, z: 3, yaw: 0, pitch: 0 };
    const deitado = parseServerMessage(JSON.stringify({ ...base, dormindo: true }));
    const emPe = parseServerMessage(JSON.stringify(base));
    expect(deitado).toMatchObject({ dormindo: true });
    expect(emPe).not.toHaveProperty("dormindo");
  });
});
