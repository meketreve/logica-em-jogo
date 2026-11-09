import { describe, expect, it } from "vitest";
import { BlockId, ITEM_PEIXE_CRU, ITEM_VARA_PESCAR } from "./blocks";
import { type Slot, inventarioVazio } from "./inventario";
import { ALCANCE_PESCA, JANELA_FISGADA_TICKS, SAI_DA_PESCA } from "./pesca";
import { type ServerMessage, parseServerMessage } from "./protocol";
import { type SaveData, decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { setBlock } from "./world";

/**
 * §🎣 A pescaria pelo FIO: lançar, a mordida, puxar na hora e fora dela, o
 * peixe que escapa, a vara que gasta, as saídas que recolhem a linha e o
 * criativo que DÁ peixe (decisão dele, 09/11). Cada "não acontece" afirma
 * antes que a pré-condição existia (a lição do "jogador nem entrou", 02/11).
 */

type Sent = { clientId: number; data: string | ArrayBuffer }[];
const VARA = ITEM_VARA_PESCAR;

function sala(modo: "sobrevivencia" | "criativo") {
  const base = new GameSession(() => {}, { dims: { x: 2, z: 2, y: 2 }, seed: 7, flat: true, codigo: "sala" });
  const save: SaveData = decodeSave(encodeSave(base.world, base.toSave()));
  save.modo = modo;
  const sent: Sent = [];
  const s = new GameSession((clientId, data) => sent.push({ clientId, data }), { restore: save, codigo: "sala" });
  s.handleMessage(1, JSON.stringify({ type: "join", name: "prof", pin: "4321", codigo: "sala" }));
  s.handleMessage(2, JSON.stringify({ type: "join", name: "ana", pin: "1111" }));
  expect(s.players.size).toBe(2);
  const ana = s.players.get(2)!;
  // água a 3 blocos da Ana, na altura dos pés (coluna de 2: a boia vai pro topo)
  const agua = { x: Math.floor(ana.x) + 3, y: Math.floor(ana.y), z: Math.floor(ana.z) };
  setBlock(s.world, agua.x, agua.y, agua.z, BlockId.Agua);
  setBlock(s.world, agua.x, agua.y - 1, agua.z, BlockId.Agua);
  if (modo === "sobrevivencia") {
    const inv: Slot[] = [...inventarioVazio()];
    inv[0] = { id: VARA, qtd: 1 };
    s.inventarios.set("ana", inv);
  }
  s.handleMessage(2, JSON.stringify({ type: "mao", id: VARA }));
  return { s, sent, agua };
}

const msgs = (sent: Sent, quem: number, tipo: ServerMessage["type"]) =>
  sent
    .filter((m) => m.clientId === quem && typeof m.data === "string")
    .map((m) => parseServerMessage(m.data as string))
    .filter((m): m is ServerMessage => m?.type === tipo);

const pescar = (s: GameSession, c: { x: number; y: number; z: number }, slot: number | undefined = 0) =>
  s.handleMessage(2, JSON.stringify({ type: "pescar", ...c, ...(slot !== undefined ? { slot } : {}) }));

/** Faz o peixe morder AGORA e passa um tick (o `boia_fisgou` sai no tick). */
function morder(s: GameSession): void {
  const b = s.pesca.porCliente.get(2)!;
  b.fisgaEm = s.tickCount;
  s.tick();
}

describe("§🎣 lançar", () => {
  it("com a vara na mão e mirando a água, a boia cai na SUPERFÍCIE e todos veem", () => {
    const { s, sent, agua } = sala("sobrevivencia");
    pescar(s, { ...agua, y: agua.y - 1 }); // mirou a de baixo
    expect(s.pesca.porCliente.get(2)).toMatchObject({ x: agua.x, y: agua.y, z: agua.z });
    expect(msgs(sent, 1, "boia")).toEqual([{ type: "boia", id: 2, ...agua }]);
    expect(msgs(sent, 2, "boia")).toEqual([{ type: "boia", id: 2, ...agua }]);
  });

  it("CONTROLE NEGATIVO: sem a vara no slot, nada é lançado", () => {
    const { s, agua } = sala("sobrevivencia");
    pescar(s, agua, 1); // slot 1 está vazio
    expect(s.pesca.porCliente.size).toBe(0);
    pescar(s, agua, 0); // controle do controle: o slot certo lança
    expect(s.pesca.porCliente.size).toBe(1);
  });

  it("fora d'água e longe demais (> alcance da vara) também não", () => {
    const { s, agua } = sala("sobrevivencia");
    pescar(s, { ...agua, x: agua.x + 1 }); // ar
    expect(s.pesca.porCliente.size).toBe(0);
    const longe = { ...agua, x: agua.x + ALCANCE_PESCA + 2 };
    setBlock(s.world, longe.x, longe.y, longe.z, BlockId.Agua);
    pescar(s, longe);
    expect(s.pesca.porCliente.size).toBe(0);
  });
});

describe("§🎣 puxar", () => {
  it("cedo demais: a linha volta VAZIA, nada entra e a vara não gasta", () => {
    const { s, sent, agua } = sala("sobrevivencia");
    pescar(s, agua);
    expect(s.pesca.porCliente.size).toBe(1);
    pescar(s, agua);
    expect(s.pesca.porCliente.size).toBe(0);
    expect(msgs(sent, 2, "boia_fim")).toEqual([{ type: "boia_fim", id: 2, motivo: "vazia" }]);
    const inv = s.inventarios.get("ana")!;
    expect(inv[0]).toEqual({ id: VARA, qtd: 1 });
    expect(inv.filter((x) => x !== null)).toHaveLength(1);
  });

  it("na mordida: avisa (boia_fisgou), puxar PEGA, a vara gasta 1 e o chat conta", () => {
    const { s, sent, agua } = sala("sobrevivencia");
    pescar(s, agua);
    morder(s);
    expect(msgs(sent, 1, "boia_fisgou")).toEqual([{ type: "boia_fisgou", id: 2 }]);
    pescar(s, agua);
    expect(msgs(sent, 2, "boia_fim")).toEqual([{ type: "boia_fim", id: 2, motivo: "pegou" }]);
    const inv = s.inventarios.get("ana")!;
    expect(inv[0]).toEqual({ id: VARA, qtd: 1, dano: 1 });
    const veio = inv.filter((x) => x !== null && x.id !== VARA);
    expect(veio).toHaveLength(1);
    expect(SAI_DA_PESCA).toContain(veio[0]!.id);
    const chat = msgs(sent, 2, "chat").map((m) => (m as { text: string }).text);
    expect(chat.some((t) => /^Você pescou um .+!$|^Só veio lixo/.test(t))).toBe(true);
  });

  it("o PEIXE diz a espécie do bioma (rodando até sair um)", () => {
    const { s, sent, agua } = sala("sobrevivencia");
    let achou = false;
    for (let i = 0; i < 40 && !achou; i++) {
      pescar(s, agua);
      morder(s);
      pescar(s, agua);
      achou = (s.inventarios.get("ana") ?? []).some((x) => x?.id === ITEM_PEIXE_CRU);
    }
    expect(achou).toBe(true);
    const chat = msgs(sent, 2, "chat").map((m) => (m as { text: string }).text);
    expect(chat.some((t) => /^Você pescou um (lambari|tambaqui|tilápia|pacu|peixe)!$/.test(t))).toBe(true);
  });

  it("a janela passou sem puxão: o peixe ESCAPA e a boia volta a boiar", () => {
    const { s, sent, agua } = sala("sobrevivencia");
    pescar(s, agua);
    morder(s);
    const b = s.pesca.porCliente.get(2)!;
    b.fisgaEm = s.tickCount - JANELA_FISGADA_TICKS;
    s.tick();
    expect(msgs(sent, 1, "boia")).toHaveLength(2); // o lançamento e a volta
    expect(s.pesca.porCliente.get(2)!.fisgaEm).toBeGreaterThan(s.tickCount);
    pescar(s, agua); // puxar agora é fora da hora
    expect(msgs(sent, 2, "boia_fim").at(-1)).toEqual({ type: "boia_fim", id: 2, motivo: "vazia" });
  });

  it("a vara ACABA: com 63 de dano, o próximo peixe a quebra", () => {
    const { s, sent, agua } = sala("sobrevivencia");
    const inv: Slot[] = [...s.inventarios.get("ana")!];
    inv[0] = { id: VARA, qtd: 1, dano: 63 };
    s.inventarios.set("ana", inv);
    pescar(s, agua);
    morder(s);
    pescar(s, agua);
    expect(s.inventarios.get("ana")![0]).toBeNull();
    expect(msgs(sent, 2, "ferramenta_quebrou")).toEqual([{ type: "ferramenta_quebrou", item: VARA }]);
  });
});

describe("§🎣 as saídas recolhem a linha", () => {
  it("largar a vara (trocar o item da mão)", () => {
    const { s, sent, agua } = sala("sobrevivencia");
    pescar(s, agua);
    expect(s.pesca.porCliente.size).toBe(1);
    s.handleMessage(2, JSON.stringify({ type: "mao", id: null }));
    s.tick();
    expect(s.pesca.porCliente.size).toBe(0);
    expect(msgs(sent, 1, "boia_fim")).toEqual([{ type: "boia_fim", id: 2, motivo: "recolheu" }]);
  });

  it("a água some (balde, coluna fora da RAM)", () => {
    const { s, agua } = sala("sobrevivencia");
    pescar(s, agua);
    s.tick();
    expect(s.pesca.porCliente.size).toBe(1); // ainda lá depois de um tick normal
    setBlock(s.world, agua.x, agua.y, agua.z, BlockId.Air);
    s.tick();
    expect(s.pesca.porCliente.size).toBe(0);
  });

  it("ir longe da boia", () => {
    const { s, agua } = sala("sobrevivencia");
    pescar(s, agua);
    s.players.get(2)!.x += 30;
    s.tick();
    expect(s.pesca.porCliente.size).toBe(0);
  });

  it("sair do jogo: os outros veem a boia sumir", () => {
    const { s, sent, agua } = sala("sobrevivencia");
    pescar(s, agua);
    s.handleDisconnect(2);
    expect(s.pesca.porCliente.size).toBe(0);
    expect(msgs(sent, 1, "boia_fim")).toEqual([{ type: "boia_fim", id: 2, motivo: "recolheu" }]);
  });

  it("quem ENTRA depois vê a boia que já está na água", () => {
    const { s, sent, agua } = sala("sobrevivencia");
    pescar(s, agua);
    s.handleMessage(3, JSON.stringify({ type: "join", name: "bia", pin: "2222" }));
    expect(msgs(sent, 3, "boia")).toEqual([{ type: "boia", id: 2, ...agua }]);
  });
});

describe("§🎣 criativo DÁ peixe (decisão dele)", () => {
  it("a mão do criativo vale (`mao`) e o item vai no boia_fim pro cliente guardar", () => {
    const { s, sent, agua } = sala("criativo");
    pescar(s, agua, undefined);
    expect(s.pesca.porCliente.size).toBe(1);
    morder(s);
    pescar(s, agua, undefined);
    const fim = msgs(sent, 2, "boia_fim").at(-1) as Extract<ServerMessage, { type: "boia_fim" }>;
    expect(fim.motivo).toBe("pegou");
    expect(SAI_DA_PESCA).toContain(fim.item);
  });

  it("CONTROLE NEGATIVO: no criativo sem a vara na mão, não lança", () => {
    const { s, agua } = sala("criativo");
    s.handleMessage(2, JSON.stringify({ type: "mao", id: BlockId.Stone }));
    pescar(s, agua, undefined);
    expect(s.pesca.porCliente.size).toBe(0);
  });
});
