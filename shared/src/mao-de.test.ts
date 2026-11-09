import { describe, expect, it } from "vitest";
import { ITEM_VARA_PESCAR } from "./blocks";
import { parseServerMessage } from "./protocol";
import { GameSession } from "./session";

type Sent = { clientId: number; data: string | ArrayBuffer }[];

/** §🎣 o item na mão: o colega vê o que eu seguro. */
function sala() {
  const sent: Sent = [];
  const s = new GameSession((clientId, data) => sent.push({ clientId, data }), {
    dims: { x: 2, z: 2, y: 2 },
    seed: 3,
    codigo: "sala",
  });
  s.handleMessage(1, JSON.stringify({ type: "join", name: "prof", pin: "4321", codigo: "sala" }));
  s.handleMessage(2, JSON.stringify({ type: "join", name: "ana", pin: "1111" }));
  return { s, sent };
}

const maosPara = (sent: Sent, quem: number) =>
  sent
    .filter((m) => m.clientId === quem && typeof m.data === "string")
    .map((m) => parseServerMessage(m.data as string))
    .filter((m) => m?.type === "mao_de");

describe("§🎣 mao_de — o que o colega segura", () => {
  it("a troca de item chega aos OUTROS, uma vez só por mudança", () => {
    const { s, sent } = sala();
    expect(s.players.size).toBe(2); // pré-condição: os dois entraram
    s.handleMessage(2, JSON.stringify({ type: "mao", id: ITEM_VARA_PESCAR }));
    s.handleMessage(2, JSON.stringify({ type: "mao", id: ITEM_VARA_PESCAR })); // igual: calado
    expect(maosPara(sent, 1)).toEqual([{ type: "mao_de", id: 2, item: ITEM_VARA_PESCAR }]);
    expect(maosPara(sent, 2)).toEqual([]); // o próprio não recebe o eco
    s.handleMessage(2, JSON.stringify({ type: "mao", id: null }));
    expect(maosPara(sent, 1).at(-1)).toEqual({ type: "mao_de", id: 2, item: null });
  });

  it("quem ENTRA depois recebe o que cada um já segura", () => {
    const { s, sent } = sala();
    s.handleMessage(2, JSON.stringify({ type: "mao", id: ITEM_VARA_PESCAR }));
    s.handleMessage(3, JSON.stringify({ type: "join", name: "bia", pin: "2222" }));
    expect(s.players.size).toBe(3);
    expect(maosPara(sent, 3)).toEqual([{ type: "mao_de", id: 2, item: ITEM_VARA_PESCAR }]);
  });

  it("o /invisivel esconde a mão do professor dos alunos, como esconde a pose", () => {
    const { s, sent } = sala();
    s.invisiveis.add(1);
    s.handleMessage(1, JSON.stringify({ type: "mao", id: ITEM_VARA_PESCAR }));
    expect(maosPara(sent, 2)).toEqual([]);
    // controle: visível, a mesma troca chega
    s.invisiveis.delete(1);
    s.handleMessage(1, JSON.stringify({ type: "mao", id: null }));
    expect(maosPara(sent, 2)).toEqual([{ type: "mao_de", id: 1, item: null }]);
  });
});
