import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_PICARETA_DIAMANTE,
  ITEM_PICARETA_FERRO,
  ITEM_PICARETA_MADEIRA,
  ITEM_PICARETA_PEDRA,
  MAX_BLOCK_ID,
  isFerramenta,
  isItem,
  isPlaceable,
} from "./blocks";
import {
  FERRAMENTAS,
  NIVEL_DIAMANTE,
  NIVEL_FERRO,
  NIVEL_MADEIRA,
  NIVEL_PEDRA,
  exigenciaDe,
  faltaFerramenta,
  melhorNivel,
} from "./ferramentas";
import {
  type Inventario,
  STACK_MAX,
  inventarioVazio,
  tamanhoStack,
} from "./inventario";
import { parseServerMessage } from "./protocol";
import { RECEITAS, receitaAtiva } from "./receitas";
import { type SaveData, decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { getBlock, setBlock } from "./world";

/** Mochila com uma picareta (ou vazia). */
function comPicareta(...ids: number[]): Inventario {
  const s = inventarioVazio().slice();
  ids.forEach((id, i) => (s[i] = { id, qtd: 1 }));
  return s;
}

describe("§🍖 F10d — ferramenta SEM durabilidade (a decisão do usuário)", () => {
  it("1 por slot, como o balde — e nenhum campo novo entrou na pilha", () => {
    for (const id of FERRAMENTAS.keys()) {
      expect(isFerramenta(id)).toBe(true);
      expect(isItem(id)).toBe(true);
      expect(tamanhoStack(id)).toBe(1);
    }
    expect(tamanhoStack(BlockId.Cobblestone)).toBe(STACK_MAX);
  });

  it("as 4 picaretas, na ordem que É a progressão da aula", () => {
    expect(FERRAMENTAS.get(ITEM_PICARETA_MADEIRA)?.nivel).toBe(NIVEL_MADEIRA);
    expect(FERRAMENTAS.get(ITEM_PICARETA_PEDRA)?.nivel).toBe(NIVEL_PEDRA);
    expect(FERRAMENTAS.get(ITEM_PICARETA_FERRO)?.nivel).toBe(NIVEL_FERRO);
    expect(FERRAMENTAS.get(ITEM_PICARETA_DIAMANTE)?.nivel).toBe(NIVEL_DIAMANTE);
    expect(NIVEL_MADEIRA).toBeLessThan(NIVEL_PEDRA);
    expect(NIVEL_PEDRA).toBeLessThan(NIVEL_FERRO);
    expect(NIVEL_FERRO).toBeLessThan(NIVEL_DIAMANTE);
  });
});

describe("§🍖 F10d — quem exige o quê", () => {
  it("o que o aluno CONSTRÓI sai com a mão (terra, madeira, bloco de algodão, vidro, areia)", () => {
    for (const id of [
      BlockId.Dirt, BlockId.Grass, BlockId.Sand, BlockId.Log, BlockId.Planks,
      BlockId.BlocoAlgodaoBranco, BlockId.Glass, BlockId.Leaves, BlockId.Gravel,
      BlockId.LajeTabuaBaixo, BlockId.EscadaTabuaXP, BlockId.Bau, BlockId.Cerca,
    ]) {
      expect(exigenciaDe(id), `bloco ${id}`).toBeNull();
    }
  });

  it("a família da PEDRA exige picareta, e as lajes/escadas herdam do material", () => {
    for (const id of [
      BlockId.Stone, BlockId.Cobblestone, BlockId.Sandstone, BlockId.StoneBricks,
      BlockId.Brick, BlockId.LajePedraBaixo, BlockId.LajeTijoloCima,
      BlockId.EscadaPedraZNC, BlockId.EscadaTijoloXP, BlockId.LetterA, BlockId.Digit9,
      BlockId.Fornalha, BlockId.FornalhaAcesa,
    ]) {
      expect(exigenciaDe(id)?.nivel, `bloco ${id}`).toBe(NIVEL_MADEIRA);
    }
  });

  it("os minérios sobem o degrau: carvão(1), ferro(2), ouro e diamante(3), obsidiana(4)", () => {
    expect(exigenciaDe(BlockId.MinerioCarvao)?.nivel).toBe(NIVEL_MADEIRA);
    expect(exigenciaDe(BlockId.MinerioFerro)?.nivel).toBe(NIVEL_PEDRA);
    expect(exigenciaDe(BlockId.MinerioOuro)?.nivel).toBe(NIVEL_FERRO);
    expect(exigenciaDe(BlockId.MinerioDiamante)?.nivel).toBe(NIVEL_FERRO);
    expect(exigenciaDe(BlockId.Obsidian)?.nivel).toBe(NIVEL_DIAMANTE);
  });

  it("PORTÃO: nada que o aluno precisa pra COMEÇAR exige ferramenta", () => {
    // o mundo tem de ser jogável de mãos vazias até a 1ª picareta. Se algum dia
    // alguém puser exigência em madeira, este teste diz que a aula travou.
    const inicio = [BlockId.Log, BlockId.LogIpe, BlockId.LogAraucaria, BlockId.LogPauBrasil];
    for (const id of inicio) expect(exigenciaDe(id)).toBeNull();
    // e a picareta de madeira só cobra tábua e graveto (nada de pedra)
    const p1 = RECEITAS.find((r) => r.saida.id === ITEM_PICARETA_MADEIRA && receitaAtiva(r));
    expect(p1).toBeDefined();
    for (const c of p1!.custo) expect(exigenciaDe(c.id)).toBeNull();
  });

  it("todo bloco com exigência é alcançável com a picareta do nível dela", () => {
    // varre TUDO: um bloco que exigisse um nível que não existe seria eterno
    for (let id = 1; id <= MAX_BLOCK_ID; id++) {
      const e = exigenciaDe(id);
      if (!e) continue;
      expect(isPlaceable(id) || e.nivel > 0).toBe(true);
      expect(e.nivel).toBeGreaterThanOrEqual(NIVEL_MADEIRA);
      expect(e.nivel).toBeLessThanOrEqual(NIVEL_DIAMANTE);
    }
  });
});

describe("§🍖 F10d — o veredito (melhorNivel / faltaFerramenta)", () => {
  it("a picareta MELHOR alcança tudo que as anteriores alcançam", () => {
    const inv = comPicareta(ITEM_PICARETA_DIAMANTE);
    expect(melhorNivel(inv, "picareta")).toBe(NIVEL_DIAMANTE);
    for (const id of [BlockId.Stone, BlockId.MinerioFerro, BlockId.MinerioOuro, BlockId.Obsidian]) {
      expect(faltaFerramenta(inv, id)).toBeNull();
    }
  });

  it("a de madeira não abre o ferro — e o AVISO diz qual serve", () => {
    const inv = comPicareta(ITEM_PICARETA_MADEIRA);
    expect(faltaFerramenta(inv, BlockId.Cobblestone)).toBeNull();
    const aviso = faltaFerramenta(inv, BlockId.MinerioFerro);
    expect(aviso).toContain("picareta de pedra");
  });

  it("de mãos vazias, a pedra não sai — mas a terra sai", () => {
    const vazia = inventarioVazio();
    expect(faltaFerramenta(vazia, BlockId.Stone)).toContain("picareta de madeira");
    expect(faltaFerramenta(vazia, BlockId.Dirt)).toBeNull();
    expect(melhorNivel(vazia, "picareta")).toBe(0);
  });

  it("a picareta vale onde ela ESTIVER na mochila, não só na mão", () => {
    // decisão de sala de aula: "precisa de picareta" é uma frase que a criança
    // resolve; "precisa dela na MÃO" seria um 2º enigma em cima do 1º
    const s = inventarioVazio().slice();
    s[26] = { id: ITEM_PICARETA_PEDRA, qtd: 1 }; // último slot da mochila
    expect(faltaFerramenta(s, BlockId.MinerioFerro)).toBeNull();
  });
});

// --- pelo fio -------------------------------------------------------------

const DIMS = { x: 2, z: 2, y: 2 };
type Sent = { clientId: number; data: string | ArrayBuffer }[];
function collect(): { sent: Sent; send: (c: number, d: string | ArrayBuffer) => void } {
  const sent: Sent = [];
  return { sent, send: (clientId, data) => sent.push({ clientId, data }) };
}
const join = (name: string, pin?: string, codigo?: string) =>
  JSON.stringify({ type: "join", name, pin, codigo });
const cmd = (text: string) => JSON.stringify({ type: "chat", text });

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

/** Célula de pedra ao alcance de quem está no spawn. */
function pedra(session: GameSession) {
  const s = session.spawn;
  const c = { x: Math.floor(s.x) + 2, y: Math.floor(s.y), z: Math.floor(s.z) };
  setBlock(session.world, c.x, c.y, c.z, BlockId.Stone);
  return c;
}

function chats(sent: Sent, clientId: number): string[] {
  return sent
    .filter((e) => e.clientId === clientId)
    .map((e) => parseServerMessage(e.data as string))
    .filter((m): m is { type: "chat"; author: string; text: string } => m?.type === "chat")
    .map((m) => m.text);
}

describe("§🍖 F10d — o gate no break_block (pelo fio)", () => {
  it("sem picareta o bloco NÃO QUEBRA, e o aviso sai UMA vez (freio)", () => {
    const { session, sent } = turma("sobrevivencia");
    const c = pedra(session);
    const quebrar = JSON.stringify({ type: "break_block", ...c });
    session.handleMessage(2, quebrar);
    session.handleMessage(2, quebrar);
    session.handleMessage(2, quebrar);
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Stone);
    const avisos = chats(sent, 2).filter((t) => t.includes("picareta"));
    expect(avisos).toHaveLength(1);
  });

  it("com a picareta, quebra normal e o pedregulho vai pra mochila", () => {
    const { session, sent } = turma("sobrevivencia");
    const c = pedra(session);
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PICARETA_MADEIRA} 1`));
    session.handleMessage(2, JSON.stringify({ type: "break_block", ...c }));
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Air);
    const inv = sent
      .filter((e) => e.clientId === 2)
      .map((e) => parseServerMessage(e.data as string))
      .filter((m) => m?.type === "inventario")
      .at(-1) as { slots: { id: number; qtd: number }[] } | undefined;
    expect(inv?.slots.some((s) => s.id === BlockId.Cobblestone)).toBe(true);
  });

  it("CRIATIVO ignora o gate — o professor não catou picareta pra dar aula", () => {
    const { session } = turma("criativo");
    const c = pedra(session);
    session.handleMessage(2, JSON.stringify({ type: "break_block", ...c }));
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Air);
  });

  it("a TERRA continua saindo com a mão em sobrevivência (a aula começa)", () => {
    const { session } = turma("sobrevivencia");
    const s = session.spawn;
    const c = { x: Math.floor(s.x) + 2, y: Math.floor(s.y), z: Math.floor(s.z) };
    setBlock(session.world, c.x, c.y, c.z, BlockId.Dirt);
    session.handleMessage(2, JSON.stringify({ type: "break_block", ...c }));
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Air);
  });
});
