import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { parseServerMessage } from "./protocol";
import { GameSession } from "./session";

type Sent = { clientId: number; data: string | ArrayBuffer }[];
function collect(): { sent: Sent; send: (c: number, d: string | ArrayBuffer) => void } {
  const sent: Sent = [];
  return { sent, send: (clientId, data) => sent.push({ clientId, data }) };
}
const join = (name: string, pin?: string, codigo?: string) =>
  JSON.stringify({ type: "join", name, pin, codigo });

/** Última mensagem `dimas` que este cliente recebeu, ou `null`. */
function ultimoDimas(sent: Sent, clientId: number): number | null {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "dimas") return m.saldo;
  }
  return null;
}

describe("Dimas (2026-09-01) — saldo por jogador", () => {
  it("todo aluno nasce com o saldo padrão na 1ª vez que entra", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: { x: 2, z: 2, y: 2 }, seed: 1, codigo: "sala" });
    session.handleMessage(1, join("ana", "1111", "sala"));
    expect(ultimoDimas(sent, 1)).toBe(50); // DIMAS_INICIAL_PADRAO
  });

  it("saldo customizado por dimasInicial (o host LJ_DIMAS_INICIAL)", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, {
      dims: { x: 2, z: 2, y: 2 }, seed: 1, codigo: "sala", dimasInicial: 200,
    });
    session.handleMessage(1, join("ana", "1111", "sala"));
    expect(ultimoDimas(sent, 1)).toBe(200);
  });

  it("rejoin NÃO reseta o saldo (só a 1ª entrada seeda)", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: { x: 2, z: 2, y: 2 }, seed: 1, codigo: "sala" });
    session.handleMessage(1, join("ana", "1111", "sala"));
    session.dimas.set("ana", 3); // gastou quase tudo comprando
    session.handleDisconnect(1);
    sent.length = 0;
    session.handleMessage(2, join("ana", "1111", "sala"));
    expect(ultimoDimas(sent, 2)).toBe(3);
  });

  it("sobrevive a save/restore (toSave → decodeSave/encodeSave → GameSession novo)", () => {
    const { send } = collect();
    const s1 = new GameSession(send, { dims: { x: 2, z: 2, y: 2 }, seed: 1, codigo: "sala" });
    s1.handleMessage(1, join("ana", "1111", "sala"));
    s1.dimas.set("ana", 12);
    const meta = s1.toSave();
    expect(meta.roster.find((r) => r.name === "ana")?.dimas).toBe(12);

    const { sent: sent2, send: send2 } = collect();
    const s2 = new GameSession(send2, {
      dims: { x: 2, z: 2, y: 2 }, seed: 1, codigo: "sala",
      restore: { ...meta, world: s1.world },
    });
    s2.handleMessage(1, join("ana", "1111", "sala"));
    expect(ultimoDimas(sent2, 1)).toBe(12); // NÃO volta a seedar — já tinha saldo
  });
});

describe("colocar o Baú-Loja grava o criador na hora", () => {
  it("quem coloca vira o criador — sem isto nem ele conseguiria gerenciar", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: { x: 4, z: 4, y: 4 }, seed: 1, codigo: "sala", flat: true });
    session.handleMessage(1, join("prof", "0000", "sala"));
    const p = session.players.get(1)!;
    const x = Math.floor(p.x);
    const y = Math.floor(p.y);
    const z = Math.floor(p.z) + 1; // célula na frente, dentro do alcance
    session.handleMessage(1, JSON.stringify({ type: "place_block", x, y, z, blockId: BlockId.BauLoja }));

    sent.length = 0;
    session.handleMessage(1, JSON.stringify({ type: "use_block", x, y, z }));
    const painel = sent.find((s) => parseServerMessage(s.data as string)?.type === "container");
    const msg = painel && parseServerMessage(painel.data as string);
    expect(msg).toMatchObject({ type: "container", tipo: "loja" });
  });
});
