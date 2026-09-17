import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_PICARETA_DIAMANTE,
  ITEM_PICARETA_MADEIRA,
  ITEM_PICARETA_PEDRA,
} from "./blocks";
import { DURABILIDADE, ticksDeQuebra } from "./ferramentas";
import { type Inventario, parseInventario } from "./inventario";
import { parseServerMessage } from "./protocol";
import { segurarAteQuebrar } from "./quebraTeste";
import { type SaveData, decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { getBlock, setBlock } from "./world";

/**
 * §🔨 Ferramentas v2 — a quebra POR TEMPO, pelo fio. O que estes testes provam é
 * que quem conta o tempo é o SERVIDOR: o cliente só arma e solta.
 */

const DIMS = { x: 2, z: 2, y: 2 };
type Sent = { clientId: number; data: string | ArrayBuffer }[];
function collect(): { sent: Sent; send: (c: number, d: string | ArrayBuffer) => void } {
  const sent: Sent = [];
  return { sent, send: (clientId, data) => sent.push({ clientId, data }) };
}
const join = (name: string, pin?: string, codigo?: string) =>
  JSON.stringify({ type: "join", name, pin, codigo });
const cmd = (text: string) => JSON.stringify({ type: "chat", text });
const segurar = (c: { x: number; y: number; z: number }, slot?: number) =>
  JSON.stringify({ type: "break_start", ...c, ...(slot === undefined ? {} : { slot }) });

function turma(modo: "criativo" | "sobrevivencia") {
  const { send: s0 } = collect();
  const base = new GameSession(s0, { dims: DIMS, seed: 5, codigo: "sala" });
  const save: SaveData = decodeSave(encodeSave(base.world, base.toSave()));
  save.modo = modo;
  const { sent, send } = collect();
  const session = new GameSession(send, { restore: save, codigo: "sala" });
  session.handleMessage(1, join("prof", "4321", "sala"));
  session.handleMessage(2, join("ana", "1111"));
  return { session, sent };
}

/** Célula ao alcance de quem está no spawn, com o bloco pedido. */
function celula(session: GameSession, id: number) {
  const s = session.spawn;
  const c = { x: Math.floor(s.x) + 2, y: Math.floor(s.y), z: Math.floor(s.z) };
  setBlock(session.world, c.x, c.y, c.z, id);
  return c;
}

function ultimoInv(sent: Sent, clientId: number): Inventario | null {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "inventario") return parseInventario(m.slots);
  }
  return null;
}
function chats(sent: Sent, clientId: number): string[] {
  return sent
    .filter((e) => e.clientId === clientId)
    .map((e) => parseServerMessage(e.data as string))
    .filter((m): m is { type: "chat"; author: string; text: string } => m?.type === "chat")
    .map((m) => m.text);
}

describe("§🔨 v2 — quebrar leva tempo, e o tempo é do servidor", () => {
  it("um tick antes do fim a pedra AINDA está lá; no tick certo ela cai", () => {
    const { session } = turma("sobrevivencia");
    const c = celula(session, BlockId.Stone);
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PICARETA_MADEIRA} 1`));
    const precisa = ticksDeQuebra(BlockId.Stone, { id: ITEM_PICARETA_MADEIRA, qtd: 1 });
    expect(precisa).toBeGreaterThan(1); // senão este teste não prova nada

    session.handleMessage(2, segurar(c, 0));
    for (let i = 0; i < precisa - 1; i++) session.tick();
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Stone);
    session.tick();
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Air);
  });

  it("a picareta MELHOR quebra a mesma pedra em menos ticks", () => {
    const conta = (item: number) => {
      const { session } = turma("sobrevivencia");
      const c = celula(session, BlockId.Stone);
      session.handleMessage(1, cmd(`/dar ana ${item} 1`));
      session.handleMessage(2, segurar(c, 0));
      let t = 0;
      while (getBlock(session.world, c.x, c.y, c.z) !== BlockId.Air && t < 400) {
        session.tick();
        t++;
      }
      return t;
    };
    expect(conta(ITEM_PICARETA_DIAMANTE)).toBeLessThan(conta(ITEM_PICARETA_MADEIRA));
  });

  it("SOLTAR o botão apaga o progresso — segurar de novo recomeça do zero", () => {
    const { session } = turma("sobrevivencia");
    const c = celula(session, BlockId.Stone);
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PICARETA_MADEIRA} 1`));
    const precisa = ticksDeQuebra(BlockId.Stone, { id: ITEM_PICARETA_MADEIRA, qtd: 1 });

    session.handleMessage(2, segurar(c, 0));
    for (let i = 0; i < precisa - 1; i++) session.tick();
    session.handleMessage(2, JSON.stringify({ type: "break_cancel" }));
    session.tick();
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Stone);

    session.handleMessage(2, segurar(c, 0));
    for (let i = 0; i < precisa - 1; i++) session.tick();
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Stone); // recomeçou mesmo
    session.tick();
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Air);
  });

  it("segurar a MESMA célula de novo não zera a barra (mensagem repetida do cliente)", () => {
    const { session } = turma("sobrevivencia");
    const c = celula(session, BlockId.Stone);
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PICARETA_MADEIRA} 1`));
    const precisa = ticksDeQuebra(BlockId.Stone, { id: ITEM_PICARETA_MADEIRA, qtd: 1 });
    session.handleMessage(2, segurar(c, 0));
    for (let i = 0; i < precisa - 1; i++) {
      session.handleMessage(2, segurar(c, 0)); // o cliente repetindo
      session.tick();
    }
    session.tick();
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Air);
  });

  it("CRIATIVO segue em 1 clique — o professor não espera 2 s por bloco", () => {
    const { session } = turma("criativo");
    const c = celula(session, BlockId.Stone);
    session.handleMessage(2, JSON.stringify({ type: "break_block", ...c }));
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Air);
  });

  it("o bloco mudar no meio CANCELA a quebra (o mundo manda, não a intenção)", () => {
    const { session } = turma("sobrevivencia");
    const c = celula(session, BlockId.Stone);
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PICARETA_MADEIRA} 1`));
    session.handleMessage(2, segurar(c, 0));
    session.tick();
    setBlock(session.world, c.x, c.y, c.z, BlockId.Dirt); // o professor trocou
    for (let i = 0; i < 40; i++) session.tick();
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Dirt);
  });
});

describe("§🔨 v2 — a ferramenta gasta, e some quando acaba", () => {
  it("cada pedra tira 1 de vida da picareta que está na mão", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PICARETA_PEDRA} 1`));
    for (let n = 1; n <= 3; n++) {
      const c = celula(session, BlockId.Stone);
      expect(segurarAteQuebrar(session, 2, c, 0)).toBe(true);
      expect(ultimoInv(sent, 2)?.[0]).toEqual({ id: ITEM_PICARETA_PEDRA, qtd: 1, dano: n });
    }
  });

  it("cavar TERRA com a picareta na mão não gasta nada (a picareta não é pá)", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PICARETA_MADEIRA} 1`));
    const c = celula(session, BlockId.Dirt);
    expect(segurarAteQuebrar(session, 2, c, 0)).toBe(true);
    expect(ultimoInv(sent, 2)?.[0]).toEqual({ id: ITEM_PICARETA_MADEIRA, qtd: 1 });
  });

  it("na última quebra ela SOME da mão, avisa no chat e manda o evento do som", () => {
    const { session, sent } = turma("sobrevivencia");
    const max = DURABILIDADE.get(ITEM_PICARETA_MADEIRA)!;
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PICARETA_MADEIRA} 1`));
    for (let n = 0; n < max; n++) {
      const c = celula(session, BlockId.Stone);
      segurarAteQuebrar(session, 2, c, 0);
    }
    expect(ultimoInv(sent, 2)?.[0] ?? null).toBeNull();
    expect(chats(sent, 2).some((t) => t.includes("picareta de madeira quebrou"))).toBe(true);
    const evento = sent
      .map((e) => parseServerMessage(e.data as string))
      .some((m) => m?.type === "ferramenta_quebrou" && m.item === ITEM_PICARETA_MADEIRA);
    expect(evento).toBe(true);
  });

  it("sem a ferramenta a pedra NÃO quebra, por mais que a criança segure", () => {
    const { session } = turma("sobrevivencia");
    const c = celula(session, BlockId.Stone);
    expect(segurarAteQuebrar(session, 2, c)).toBe(false);
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Stone);
  });

  it("o desgaste sobrevive ao save (é o campo novo da pilha atravessando o .ljw)", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PICARETA_PEDRA} 1`));
    const c = celula(session, BlockId.Stone);
    segurarAteQuebrar(session, 2, c, 0);
    expect(ultimoInv(sent, 2)?.[0]).toEqual({ id: ITEM_PICARETA_PEDRA, qtd: 1, dano: 1 });

    const salvo = decodeSave(encodeSave(session.world, session.toSave()));
    const { sent: sent2, send } = collect();
    const s2 = new GameSession(send, { restore: salvo, codigo: "sala" });
    s2.handleMessage(2, join("ana", "1111"));
    expect(ultimoInv(sent2, 2)?.[0]).toEqual({ id: ITEM_PICARETA_PEDRA, qtd: 1, dano: 1 });
  });
});
