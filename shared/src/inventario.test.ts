import { describe, expect, it } from "vitest";
import { BlockId, ITEM_BALDE_VAZIO, ITEM_FRUTA, ITEM_PICARETA_MADEIRA, mudaDaFolhagem } from "./blocks";
import {
  HOTBAR_SLOTS,
  INV_SLOTS,
  type Inventario,
  STACK_MAX,
  adicionar,
  cabe,
  contar,
  espacoPara,
  estaVazio,
  inventarioParaSave,
  inventarioVazio,
  moverSlot,
  parseInventario,
  remover,
  slotValido,
  tamanhoStack,
} from "./inventario";

/** Inventário com pilhas em slots escolhidos (o resto vazio). */
function inv(...pares: [slot: number, id: number, qtd: number][]): Inventario {
  const s = inventarioVazio().slice();
  for (const [i, id, qtd] of pares) s[i] = { id, qtd };
  return s;
}

describe("inventário — forma", () => {
  it("nasce com 27 slots vazios (9 hotbar + 18 mochila)", () => {
    const i = inventarioVazio();
    expect(i).toHaveLength(INV_SLOTS);
    expect(INV_SLOTS).toBe(27);
    expect(HOTBAR_SLOTS).toBe(9);
    expect(estaVazio(i)).toBe(true);
  });

  it("só aceita índice inteiro dentro da faixa (o fio manda qualquer coisa)", () => {
    expect(slotValido(0)).toBe(true);
    expect(slotValido(26)).toBe(true);
    expect(slotValido(27)).toBe(false);
    expect(slotValido(-1)).toBe(false);
    expect(slotValido(1.5)).toBe(false);
    expect(slotValido(Number.NaN)).toBe(false);
  });

  it("o balde não empilha (1 por slot); bloco empilha 64", () => {
    expect(tamanhoStack(BlockId.Stone)).toBe(STACK_MAX);
    expect(tamanhoStack(ITEM_BALDE_VAZIO)).toBe(1);
  });
});

describe("inventário — adicionar", () => {
  it("completa pilha PARCIAL antes de ocupar slot vazio", () => {
    const antes = inv([3, BlockId.Stone, 60]);
    const { inv: depois, sobra } = adicionar(antes, BlockId.Stone, 4);
    expect(sobra).toBe(0);
    expect(depois[3]).toEqual({ id: BlockId.Stone, qtd: 64 });
    expect(depois.filter((s) => s !== null)).toHaveLength(1);
  });

  it("transborda pro próximo slot quando a pilha enche", () => {
    const { inv: depois, sobra } = adicionar(inv([0, BlockId.Dirt, 60]), BlockId.Dirt, 10);
    expect(sobra).toBe(0);
    expect(depois[0]).toEqual({ id: BlockId.Dirt, qtd: 64 });
    expect(depois[1]).toEqual({ id: BlockId.Dirt, qtd: 6 });
  });

  it("varre hotbar ANTES da mochila (o que se cava aparece na mão)", () => {
    const { inv: depois } = adicionar(inventarioVazio(), BlockId.Sand, 1);
    expect(depois[0]).toEqual({ id: BlockId.Sand, qtd: 1 });
  });

  it("devolve SOBRA quando não cabe, e não perde o que coube", () => {
    const cheio = inventarioVazio().map(() => ({ id: BlockId.Stone, qtd: 63 }));
    const { inv: depois, sobra } = adicionar(cheio, BlockId.Stone, 100);
    expect(sobra).toBe(100 - INV_SLOTS); // 1 espaço por slot
    expect(contar(depois, BlockId.Stone)).toBe(63 * INV_SLOTS + INV_SLOTS);
  });

  it("quantidade zero ou negativa não mexe em nada", () => {
    const antes = inv([0, BlockId.Stone, 1]);
    expect(adicionar(antes, BlockId.Stone, 0).inv).toBe(antes);
    expect(adicionar(antes, BlockId.Stone, -5).inv).toBe(antes);
  });

  it("o balde ocupa um slot por unidade (teto 1)", () => {
    const { inv: depois, sobra } = adicionar(inventarioVazio(), ITEM_BALDE_VAZIO, 3);
    expect(sobra).toBe(0);
    expect(depois.slice(0, 3)).toEqual([
      { id: ITEM_BALDE_VAZIO, qtd: 1 },
      { id: ITEM_BALDE_VAZIO, qtd: 1 },
      { id: ITEM_BALDE_VAZIO, qtd: 1 },
    ]);
  });
});

describe("inventário — espaço e recusa (não existe item no chão)", () => {
  it("conta o que falta nas parciais MAIS os slots vazios", () => {
    const i = inv([0, BlockId.Stone, 60], [1, BlockId.Dirt, 64]);
    // 4 na parcial de pedra + 25 slots vazios × 64
    expect(espacoPara(i, BlockId.Stone)).toBe(4 + 25 * 64);
    expect(cabe(i, BlockId.Stone, 4 + 25 * 64)).toBe(true);
    expect(cabe(i, BlockId.Stone, 4 + 25 * 64 + 1)).toBe(false);
  });

  it("mochila CHEIA de outra coisa não tem espaço pra nada novo", () => {
    const cheio = inventarioVazio().map((_, i) => ({ id: BlockId.Dirt + (i % 3), qtd: 64 }));
    expect(espacoPara(cheio, BlockId.Stone)).toBe(0);
    expect(cabe(cheio, BlockId.Stone, 1)).toBe(false);
  });
});

describe("inventário — remover", () => {
  it("gasto é TUDO OU NADA: sem o suficiente, nada sai", () => {
    const antes = inv([0, BlockId.Stone, 2]);
    const { inv: depois, removido } = remover(antes, BlockId.Stone, 3);
    expect(removido).toBe(0);
    expect(depois).toBe(antes);
  });

  it("consome a pilha MENOR primeiro (junta os restos)", () => {
    const antes = inv([0, BlockId.Stone, 40], [5, BlockId.Stone, 3]);
    const { inv: depois, removido } = remover(antes, BlockId.Stone, 3);
    expect(removido).toBe(3);
    expect(depois[5]).toBeNull();
    expect(depois[0]).toEqual({ id: BlockId.Stone, qtd: 40 });
  });

  it("atravessa mais de uma pilha quando precisa", () => {
    const antes = inv([0, BlockId.Stone, 10], [1, BlockId.Stone, 4]);
    const { inv: depois, removido } = remover(antes, BlockId.Stone, 12);
    expect(removido).toBe(12);
    expect(contar(depois, BlockId.Stone)).toBe(2);
  });

  it("esvaziar o slot deixa null (não pilha de zero)", () => {
    const { inv: depois } = remover(inv([2, BlockId.Sand, 1]), BlockId.Sand, 1);
    expect(depois[2]).toBeNull();
    expect(estaVazio(depois)).toBe(true);
  });
});

describe("inventário — mover slot", () => {
  it("junta pilhas do MESMO id até o teto e deixa o resto pra trás", () => {
    const depois = moverSlot(inv([0, BlockId.Stone, 40], [1, BlockId.Stone, 40]), 0, 1);
    expect(depois[1]).toEqual({ id: BlockId.Stone, qtd: 64 });
    expect(depois[0]).toEqual({ id: BlockId.Stone, qtd: 16 });
  });

  it("ids diferentes TROCAM de lugar", () => {
    const depois = moverSlot(inv([0, BlockId.Stone, 1], [9, BlockId.Sand, 5]), 0, 9);
    expect(depois[9]).toEqual({ id: BlockId.Stone, qtd: 1 });
    expect(depois[0]).toEqual({ id: BlockId.Sand, qtd: 5 });
  });

  it("mover pra slot vazio esvazia a origem", () => {
    const depois = moverSlot(inv([0, BlockId.Stone, 7]), 0, 20);
    expect(depois[0]).toBeNull();
    expect(depois[20]).toEqual({ id: BlockId.Stone, qtd: 7 });
  });

  it("destino CHEIO do mesmo id não troca nem junta (não some com nada)", () => {
    const antes = inv([0, BlockId.Stone, 5], [1, BlockId.Stone, 64]);
    expect(moverSlot(antes, 0, 1)).toBe(antes);
  });

  it("índice inválido, origem vazia ou de===para devolvem o inventário intacto", () => {
    const antes = inv([0, BlockId.Stone, 5]);
    expect(moverSlot(antes, 0, 99)).toBe(antes);
    expect(moverSlot(antes, -1, 0)).toBe(antes);
    expect(moverSlot(antes, 4, 5)).toBe(antes); // origem vazia
    expect(moverSlot(antes, 0, 0)).toBe(antes);
  });
});

describe("inventário — save (forma esparsa, parse defensivo)", () => {
  it("só os slots ocupados viajam, com o índice", () => {
    expect(inventarioParaSave(inv([0, BlockId.Stone, 3], [26, BlockId.Sand, 64]))).toEqual([
      { slot: 0, id: BlockId.Stone, qtd: 3 },
      { slot: 26, id: BlockId.Sand, qtd: 64 },
    ]);
  });

  it("ida e volta preserva o inventário", () => {
    const antes = inv([0, BlockId.Stone, 3], [9, BlockId.Dirt, 64], [26, ITEM_BALDE_VAZIO, 1]);
    expect(parseInventario(inventarioParaSave(antes))).toEqual(antes);
  });

  it("campo ausente ou lixo vira inventário VAZIO, não erro", () => {
    expect(estaVazio(parseInventario(undefined))).toBe(true);
    expect(estaVazio(parseInventario("nada"))).toBe(true);
    expect(estaVazio(parseInventario({ slot: 0 }))).toBe(true);
  });

  it("entrada doente é PULADA sem derrubar as sadias", () => {
    const lido = parseInventario([
      { slot: 0, id: BlockId.Stone, qtd: 3 }, // boa
      null,
      { slot: 99, id: BlockId.Stone, qtd: 1 }, // slot fora da faixa
      { slot: 1, id: BlockId.Stone, qtd: 0 }, // quantidade zero
      { slot: 2, id: BlockId.Stone, qtd: 65 }, // acima do teto
      { slot: 3, id: 0, qtd: 1 }, // ar não é item
      { slot: 4, id: BlockId.Stone, qtd: 1.5 }, // fração
      { slot: 5, id: ITEM_BALDE_VAZIO, qtd: 2 }, // acima do teto DO BALDE
      { slot: 6, id: BlockId.Sand, qtd: 12 }, // boa
    ]);
    expect(lido[0]).toEqual({ id: BlockId.Stone, qtd: 3 });
    expect(lido[6]).toEqual({ id: BlockId.Sand, qtd: 12 });
    expect(inventarioParaSave(lido)).toHaveLength(2);
  });

  it("slot repetido: o último vence (não duplica nem soma)", () => {
    const lido = parseInventario([
      { slot: 0, id: BlockId.Stone, qtd: 3 },
      { slot: 0, id: BlockId.Sand, qtd: 1 },
    ]);
    expect(lido[0]).toEqual({ id: BlockId.Sand, qtd: 1 });
  });
});

// --- §🍖 F4 na sessão --------------------------------------------------------

import { camaHeadDir } from "./blocks";
import { parseServerMessage } from "./protocol";
import { type SaveData, decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { getBlock, setBlock } from "./world";

const DIMS = { x: 2, z: 2, y: 2 };

type Sent = { clientId: number; data: string | ArrayBuffer }[];
function collect(): { sent: Sent; send: (c: number, d: string | ArrayBuffer) => void } {
  const sent: Sent = [];
  return { sent, send: (clientId, data) => sent.push({ clientId, data }) };
}
const join = (name: string, pin?: string, codigo?: string) =>
  JSON.stringify({ type: "join", name, pin, codigo });
const cmd = (text: string) => JSON.stringify({ type: "chat", text });
const colocar = (x: number, y: number, z: number, blockId: number) =>
  JSON.stringify({ type: "place_block", x, y, z, blockId });
/** §🍖 F10d: a ana ganha a picareta mais barata. Pedra, pedregulho, minério e
 *  companhia deixaram de sair com a mão — sem isto, todo teste de quebra de
 *  pedra passaria a medir a RECUSA por falta de ferramenta. */
const darPicareta = (session: GameSession) =>
  session.handleMessage(1, cmd(`/dar ana ${ITEM_PICARETA_MADEIRA} 1`));
const quebrar = (x: number, y: number, z: number) =>
  JSON.stringify({ type: "break_block", x, y, z });

/** Último inventário mandado a este cliente (null = nenhum — criativo). */
function ultimoInv(sent: Sent, clientId: number): Inventario | null {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "inventario") return parseInventario(m.slots);
  }
  return null;
}
function chats(sent: Sent, clientId: number): string[] {
  const out: string[] = [];
  for (const s of sent) {
    if (s.clientId !== clientId) continue;
    const m = parseServerMessage(s.data as string);
    if (m?.type === "chat") out.push(m.text);
  }
  return out;
}

function baseSave(): SaveData {
  const { send } = collect();
  const s0 = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
  return decodeSave(encodeSave(s0.world, s0.toSave()));
}

/** Professor (1) + ana (2), com o mundo no modo pedido. */
function turma(modo: "criativo" | "sobrevivencia" = "sobrevivencia", save = baseSave()) {
  save.modo = modo;
  const { sent, send } = collect();
  const session = new GameSession(send, { restore: save, codigo: "sala" });
  session.handleMessage(1, join("prof", "4321", "sala"));
  session.handleMessage(2, join("ana", "1111"));
  return { session, sent };
}

/** Célula VAZIA ao alcance de ana, com a vizinhança 3×3 também livre e apoiada
 *  — porta e cama ocupam 2 células, e o lado que elas usam depende do id. */
function alvoLivre(session: GameSession) {
  const x = Math.floor(session.spawn.x);
  const y = Math.floor(session.spawn.y) + 2;
  const z = Math.floor(session.spawn.z);
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      setBlock(session.world, x + dx, y, z + dz, BlockId.Air);
      setBlock(session.world, x + dx, y - 1, z + dz, BlockId.Stone);
    }
  }
  return { x, y, z };
}

describe("§🍖 F4 — colocar GASTA (e criativo segue infinito)", () => {
  it("sem o bloco na mochila, o mundo não muda (e nada é dito no chat)", () => {
    const { session, sent } = turma("sobrevivencia");
    const a = alvoLivre(session);
    const antes = chats(sent, 2).length;
    session.handleMessage(2, colocar(a.x, a.y, a.z, BlockId.Stone));
    expect(getBlock(session.world, a.x, a.y, a.z)).toBe(BlockId.Air);
    expect(chats(sent, 2)).toHaveLength(antes); // silencioso: o slot vazio já diz
  });

  it("com o bloco na mochila, coloca e DESCONTA uma unidade", () => {
    const { session, sent } = turma("sobrevivencia");
    const a = alvoLivre(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Stone} 3`));
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.Stone)).toBe(3);
    session.handleMessage(2, colocar(a.x, a.y, a.z, BlockId.Stone));
    expect(getBlock(session.world, a.x, a.y, a.z)).toBe(BlockId.Stone);
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.Stone)).toBe(2);
  });

  it("em CRIATIVO a paleta segue infinita — nem mensagem de inventário existe", () => {
    const { session, sent } = turma("criativo");
    const a = alvoLivre(session);
    session.handleMessage(2, colocar(a.x, a.y, a.z, BlockId.Stone));
    expect(getBlock(session.world, a.x, a.y, a.z)).toBe(BlockId.Stone);
    expect(ultimoInv(sent, 2)).toBeNull();
  });

  it("a CAMA ocupa 2 células e custa UM item", () => {
    const { session, sent } = turma("sobrevivencia");
    const a = alvoLivre(session);
    const cabeceira = camaHeadDir(BlockId.CamaXP);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.CamaXP} 2`));
    session.handleMessage(2, colocar(a.x, a.y, a.z, BlockId.CamaXP));
    expect(getBlock(session.world, a.x, a.y, a.z)).toBe(BlockId.CamaXP);
    expect(getBlock(session.world, a.x + cabeceira.dx, a.y, a.z + cabeceira.dz)).toBe(BlockId.CamaXP);
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.CamaXP)).toBe(1);
  });

  it("a mochila guarda a FORMA CANÔNICA: uma cama serve pras 4 direções", () => {
    const { session, sent } = turma("sobrevivencia");
    const a = alvoLivre(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.CamaXP} 1`));
    // o cliente manda a direção que o olhar escolheu (ZP), não a âncora
    session.handleMessage(2, colocar(a.x, a.y, a.z, BlockId.CamaZP));
    expect(getBlock(session.world, a.x, a.y, a.z)).toBe(BlockId.CamaZP);
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.CamaXP)).toBe(0);
  });

  it("quebrar e recolocar a MESMA célula no mesmo tick não duplica bloco", () => {
    const { session, sent } = turma("sobrevivencia");
    const a = alvoLivre(session);
    darPicareta(session); // §🍖 F10d: pedregulho exige picareta
    setBlock(session.world, a.x, a.y, a.z, BlockId.Cobblestone);
    session.handleMessage(2, quebrar(a.x, a.y, a.z)); // ganha 1 pedregulho
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.Cobblestone)).toBe(1);
    session.handleMessage(2, colocar(a.x, a.y, a.z, BlockId.Cobblestone));
    expect(getBlock(session.world, a.x, a.y, a.z)).toBe(BlockId.Cobblestone);
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.Cobblestone)).toBe(0);
  });
});

describe("§🍖 F4 — quebrar DÁ (pela tabela de drops)", () => {
  it("grama cai como terra, pedra como pedregulho", () => {
    const { session, sent } = turma("sobrevivencia");
    const a = alvoLivre(session);
    darPicareta(session); // §🍖 F10d: a grama sai com a mão, a PEDRA não
    setBlock(session.world, a.x, a.y, a.z, BlockId.Grass);
    session.handleMessage(2, quebrar(a.x, a.y, a.z));
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.Dirt)).toBe(1);
    setBlock(session.world, a.x, a.y, a.z, BlockId.Stone);
    session.handleMessage(2, quebrar(a.x, a.y, a.z));
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.Cobblestone)).toBe(1);
  });

  it("folha quebra sempre — o que ela dá virou SORTEIO no §🍖 F6", () => {
    const { session, sent } = turma("sobrevivencia");
    const a = alvoLivre(session);
    setBlock(session.world, a.x, a.y, a.z, BlockId.Leaves);
    session.handleMessage(2, quebrar(a.x, a.y, a.z));
    expect(getBlock(session.world, a.x, a.y, a.z)).toBe(BlockId.Air);
    // a chance mora em `drops.ts` (e o teste dela injeta o sorteio); aqui o que
    // importa é que a folha NUNCA vira folha na mochila. Desde o §🪵 a folha
    // também é a fonte da MUDA (1 em 10) — o sorteio real pode dar só fruta,
    // só muda, as duas ou nada (sorteios independentes em `drops.ts`).
    const inv = ultimoInv(sent, 2) ?? inventarioVazio();
    expect(contar(inv, BlockId.Leaves)).toBe(0);
    expect(
      estaVazio(inv) ||
        contar(inv, ITEM_FRUTA) === 1 ||
        contar(inv, mudaDaFolhagem(BlockId.Leaves)) === 1,
    ).toBe(true);
  });

  it("em CRIATIVO quebrar não dá nada (paleta infinita, mochila intocada)", () => {
    const { session, sent } = turma("criativo");
    const a = alvoLivre(session);
    setBlock(session.world, a.x, a.y, a.z, BlockId.Stone);
    session.handleMessage(2, quebrar(a.x, a.y, a.z));
    expect(getBlock(session.world, a.x, a.y, a.z)).toBe(BlockId.Air);
    expect(ultimoInv(sent, 2)).toBeNull();
  });

  it("MOCHILA CHEIA recusa a quebra — o bloco fica no mundo e o aviso vai uma vez", () => {
    const { session, sent } = turma("sobrevivencia");
    const a = alvoLivre(session);
    // a picareta ocupa 1 slot (§🍖 F10d), então o resto enche os outros 26
    darPicareta(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Sand} ${(INV_SLOTS - 1) * STACK_MAX}`));
    setBlock(session.world, a.x, a.y, a.z, BlockId.Stone);
    session.handleMessage(2, quebrar(a.x, a.y, a.z));
    expect(getBlock(session.world, a.x, a.y, a.z)).toBe(BlockId.Stone); // NÃO quebrou
    session.handleMessage(2, quebrar(a.x, a.y, a.z));
    session.handleMessage(2, quebrar(a.x, a.y, a.z));
    const avisos = chats(sent, 2).filter((t) => t.includes("Mochila cheia"));
    expect(avisos).toHaveLength(1); // o freio segurou as repetições
  });

  it("mochila cheia de PEDREGULHO com uma pilha parcial ainda aceita", () => {
    const { session, sent } = turma("sobrevivencia");
    const a = alvoLivre(session);
    darPicareta(session); // §🍖 F10d: 1 slot pra ela, 26 pro pedregulho
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Cobblestone} ${(INV_SLOTS - 1) * STACK_MAX - 1}`));
    setBlock(session.world, a.x, a.y, a.z, BlockId.Stone);
    session.handleMessage(2, quebrar(a.x, a.y, a.z));
    expect(getBlock(session.world, a.x, a.y, a.z)).toBe(BlockId.Air);
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.Cobblestone)).toBe(
      (INV_SLOTS - 1) * STACK_MAX,
    );
  });
});

describe("§🍖 F4 — morte e a regra manter-inventario", () => {
  it("LIGADA (padrão): morrer não custa a mochila", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Stone} 5`));
    session.handleMessage(1, cmd("/bloco ~ ~ ~ 0")); // nada a ver: só garante o tick
    matarAna(session);
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.Stone)).toBe(5);
  });

  it("DESLIGADA: a mochila some inteira (não há túmulo — decisão do ROADMAP)", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd("/regra manter-inventario desligar"));
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Stone} 5`));
    matarAna(session);
    expect(estaVazio(ultimoInv(sent, 2) ?? inventarioVazio())).toBe(true);
  });

  it("o /regra manter-inventario NÃO avisa mais que falta mecânica", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd("/regra manter-inventario desligar"));
    const resposta = chats(sent, 1).at(-1) ?? "";
    expect(resposta).not.toContain("mecânica");
  });
});

/** Mata ana por queda: sobe 100 blocos e pousa (o servidor fecha a queda). */
function matarAna(session: GameSession): void {
  const s = session.spawn;
  const alto = (y: number) =>
    JSON.stringify({ type: "move", x: s.x, y, z: s.z, yaw: 0, pitch: 0 });
  session.handleMessage(2, alto(s.y + 100));
  session.handleMessage(2, alto(s.y));
}

describe("§🍖 F4 — /dar (a contraparte do /bloco)", () => {
  it("aluno não pode usar", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(2, cmd(`/dar eu ${BlockId.Stone} 1`));
    expect(chats(sent, 2).at(-1)).toContain("Somente o professor");
  });

  it("id inexistente e quantidade doente são recusados", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd("/dar ana 9999 1"));
    expect(chats(sent, 1).at(-1)).toContain("Não existe item");
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Stone} 0`));
    expect(chats(sent, 1).at(-1)).toContain("Quantidade inválida");
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Stone} 99999`));
    expect(chats(sent, 1).at(-1)).toContain("Quantidade inválida");
  });

  it("`all` pega a turma inteira, inclusive o professor", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd(`/dar all ${BlockId.Sand} 2`));
    expect(contar(ultimoInv(sent, 1) ?? inventarioVazio(), BlockId.Sand)).toBe(2);
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.Sand)).toBe(2);
  });

  it("nome que o mundo não conhece devolve recado, não silêncio", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd(`/dar ninguem ${BlockId.Stone} 1`));
    expect(chats(sent, 1).at(-1)).toContain("Ninguém chamado");
  });
});

describe("§🍖 F4 — a mochila é por NOME (rejoin, save, troca de modo)", () => {
  it("sai e volta com a mesma mochila", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Stone} 7`));
    session.handleDisconnect(2);
    session.handleMessage(9, join("ana", "1111"));
    expect(contar(ultimoInv(sent, 9) ?? inventarioVazio(), BlockId.Stone)).toBe(7);
  });

  it("a mochila atravessa o DISCO (.ljw) e volta igual", () => {
    const { session } = turma("sobrevivencia");
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Stone} 7`));
    const meta = session.toSave();
    expect(meta.roster.find((p) => p.name === "ana")?.inventario).toEqual([
      { slot: 0, id: BlockId.Stone, qtd: 7 },
    ]);
    const salvo = decodeSave(encodeSave(session.world, meta));
    const { sent } = turma("sobrevivencia", salvo);
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.Stone)).toBe(7);
  });

  it("mundo CRIATIVO não engorda o save com mochila vazia", () => {
    const { session } = turma("criativo");
    for (const p of session.toSave().roster) expect(p.inventario).toBeUndefined();
  });

  it("entrar em sobrevivência no meio da aula MOSTRA a mochila na hora", () => {
    const { session, sent } = turma("criativo");
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Stone} 4`));
    expect(ultimoInv(sent, 2)).toBeNull(); // ainda criativo: nada foi mandado
    session.handleMessage(1, cmd("/modo sobrevivencia all"));
    expect(contar(ultimoInv(sent, 2) ?? inventarioVazio(), BlockId.Stone)).toBe(4);
  });
});

describe("§🍖 F4 — mover_item (o aluno arruma a mochila)", () => {
  const mover = (de: number, para: number) => JSON.stringify({ type: "mover_item", de, para });

  it("move a pilha e devolve o inventário inteiro", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Stone} 5`));
    session.handleMessage(2, mover(0, 20));
    const i = ultimoInv(sent, 2) ?? inventarioVazio();
    expect(i[0]).toBeNull();
    expect(i[20]).toEqual({ id: BlockId.Stone, qtd: 5 });
  });

  it("índice do fio fora da faixa não derruba nem muda nada", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Stone} 5`));
    session.handleMessage(2, mover(0, 999));
    session.handleMessage(2, mover(-1, 0));
    expect((ultimoInv(sent, 2) ?? inventarioVazio())[0]).toEqual({ id: BlockId.Stone, qtd: 5 });
  });

  it("em criativo o comando é ignorado (não existe mochila lá)", () => {
    const { session, sent } = turma("criativo");
    session.handleMessage(2, mover(0, 1));
    expect(ultimoInv(sent, 2)).toBeNull();
  });
});

describe("§🧹 moverSlot com qtd — o PC divide a pilha (playtest)", () => {
  it("move só a parte e o resto fica na origem", () => {
    const antes = inv([0, BlockId.Stone, 10]);
    const depois = moverSlot(antes, 0, 20, 3);
    expect(depois[0]).toEqual({ id: BlockId.Stone, qtd: 7 });
    expect(depois[20]).toEqual({ id: BlockId.Stone, qtd: 3 });
  });

  it("destino vazio recebe a parte (e nada mais muda)", () => {
    const antes = inv([0, BlockId.Stone, 10], [5, BlockId.WoolRed, 2]);
    const depois = moverSlot(antes, 0, 25, 4);
    expect(depois[0]).toEqual({ id: BlockId.Stone, qtd: 6 });
    expect(depois[25]).toEqual({ id: BlockId.Stone, qtd: 4 });
    expect(depois[5]).toEqual({ id: BlockId.WoolRed, qtd: 2 });
  });

  it("mesmo id JUNTA até o teto e devolve o resto à origem", () => {
    const antes = inv([0, BlockId.Stone, 64], [5, BlockId.Stone, 10]);
    const depois = moverSlot(antes, 0, 5, 3);
    expect(depois[5]).toEqual({ id: BlockId.Stone, qtd: 13 });
    expect(depois[0]).toEqual({ id: BlockId.Stone, qtd: 61 });
  });

  it("id diferente TROCA a parte pela pilha do destino (Minecraft)", () => {
    const antes = inv([0, BlockId.Stone, 10], [5, BlockId.WoolRed, 2]);
    const depois = moverSlot(antes, 0, 5, 4);
    expect(depois[0]).toEqual({ id: BlockId.WoolRed, qtd: 2 });
    expect(depois[5]).toEqual({ id: BlockId.Stone, qtd: 4 });
  });

  it("qtd ≥ a pilha inteira cai no movimento completo", () => {
    const antes = inv([0, BlockId.Stone, 5]);
    const depois = moverSlot(antes, 0, 20, 99);
    expect(depois[0]).toBeNull();
    expect(depois[20]).toEqual({ id: BlockId.Stone, qtd: 5 });
  });

  it("qtd inválida (0, negativa, fracionária) não muda nada", () => {
    const antes = inv([0, BlockId.Stone, 10]);
    expect(moverSlot(antes, 0, 20, 0)).toBe(antes);
    expect(moverSlot(antes, 0, 20, -3)).toBe(antes);
    expect(moverSlot(antes, 0, 20, 2.5)).toBe(antes);
  });

  it("origem vazia, índice fora da faixa ou de === para não muda nada", () => {
    const antes = inv([0, BlockId.Stone, 10]);
    expect(moverSlot(antes, 9, 20, 2)).toBe(antes);
    expect(moverSlot(antes, 0, 999, 2)).toBe(antes);
    expect(moverSlot(antes, 0, 0, 2)).toBe(antes);
  });
});
