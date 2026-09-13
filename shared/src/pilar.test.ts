import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { FLAT_SURFACE_Y } from "./worldgen";
import { GameSession } from "./session";
import { getBlock, setBlock } from "./world";

/**
 * bug-652 (2026-09-12): "pula e coloca bloco embaixo dele, acaba sendo
 * teleportado pro lado". A jogada é a torre de qualquer jogo voxel: pular e
 * colocar o bloco na célula onde os pés estavam.
 *
 * O servidor aplica o bloco na hora, mas o cliente só fica sabendo dele um
 * instante depois — nesse meio tempo ele continua caindo e manda um `move` com
 * os pés DENTRO do bloco novo. O resgate de soterramento (bug-605) prefere a
 * MESMA altura (bug-632, pra não tirar ninguém da caverna pela rocha), então a
 * célula do lado ganhava da de cima do bloco: teleporte pro lado.
 */
const SOLO = FLAT_SURFACE_Y; // último y sólido; primeiro ar = SOLO + 1

function mundo() {
  const sent: { id: number; data: string | ArrayBuffer }[] = [];
  const session = new GameSession((id, data) => sent.push({ id, data }), {
    dims: { x: 2, y: 2, z: 2 },
    seed: 1,
    singleplayer: true,
    flat: true,
  });
  session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
  const send = (msg: unknown): void => session.handleMessage(1, JSON.stringify(msg));
  const teleportes = (): Record<string, unknown>[] =>
    sent
      .filter((s) => typeof s.data === "string")
      .map((s) => JSON.parse(s.data as string) as Record<string, unknown>)
      .filter((m) => m["type"] === "teleport");
  const pos = () => {
    const p = session.players.get(1)!;
    return { x: p.x, y: p.y, z: p.z };
  };
  return { session, send, teleportes, pos };
}

const move = (x: number, y: number, z: number) => ({ type: "move", x, y, z, yaw: 0, pitch: 0 });

describe("bug-652: pular e colocar bloco embaixo de si", () => {
  it("o move que chega com os pés DENTRO do bloco novo pousa EM CIMA dele, sem teleporte", () => {
    const { session, send, teleportes, pos } = mundo();
    send(move(4.5, SOLO + 1, 4.5)); // de pé no chão
    send(move(4.5, SOLO + 2.2, 4.5)); // no alto do pulo: a célula dos pés esvaziou
    send({ type: "place_block", x: 4, y: SOLO + 1, z: 4, blockId: BlockId.Stone });
    expect(getBlock(session.world, 4, SOLO + 1, 4)).toBe(BlockId.Stone);
    const antes = teleportes().length;
    // o cliente ainda não sabia do bloco e caiu pra dentro dele
    send(move(4.5, SOLO + 1.6, 4.5));
    expect(teleportes()).toHaveLength(antes); // nada de jogar pro lado
    const p = pos();
    expect([p.x, p.z]).toEqual([4.5, 4.5]);
    expect(p.y).toBeGreaterThanOrEqual(SOLO + 2); // pés no topo do bloco novo
    expect(p.y).toBeLessThan(SOLO + 2.01);
  });

  it("afundado quase o bloco inteiro (pés rente ao chão) também sobe só 1", () => {
    const { session, send, teleportes, pos } = mundo();
    send(move(4.5, SOLO + 2.2, 4.5));
    send({ type: "place_block", x: 4, y: SOLO + 1, z: 4, blockId: BlockId.Stone });
    const antes = teleportes().length;
    send(move(4.5, SOLO + 1.02, 4.5));
    expect(teleportes()).toHaveLength(antes);
    expect(pos().y).toBeGreaterThanOrEqual(SOLO + 2);
    expect(getBlock(session.world, 4, SOLO + 1, 4)).toBe(BlockId.Stone);
  });

  it("soterramento de VERDADE (bloco na altura da cabeça) continua indo pro resgate", () => {
    const { session, send, pos } = mundo();
    send(move(4.5, SOLO + 1, 4.5));
    // a cabeça dentro de pedra, os pés no ar: subir não resolve — é resgate
    setBlock(session.world, 4, SOLO + 2, 4, BlockId.Stone);
    send(move(4.5, SOLO + 1.1, 4.5));
    const p = pos();
    expect(!(p.x === 4.5 && p.z === 4.5 && p.y >= SOLO + 3)).toBe(true); // não "escalou" a pedra da cabeça
  });

  it("dois blocos empilhados nos pés e na cabeça: subir 1 não cabe — resgate", () => {
    const { session, send, pos } = mundo();
    send(move(4.5, SOLO + 1, 4.5));
    setBlock(session.world, 4, SOLO + 1, 4, BlockId.Stone);
    setBlock(session.world, 4, SOLO + 2, 4, BlockId.Stone);
    setBlock(session.world, 4, SOLO + 3, 4, BlockId.Stone);
    send(move(4.5, SOLO + 1.3, 4.5));
    expect(pos().y).toBeLessThan(SOLO + 3); // não subiu pela coluna
  });
});
