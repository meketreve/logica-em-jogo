import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_FRUTA,
  ITEM_PAO,
  ITEM_TRIGO,
  apoioValido,
  estagioPlantacao,
  isPlantacao,
  isPlantacaoMadura,
  isSolo,
} from "./blocks";
import { isComida, saciedadeDe } from "./comida";
import { contar, inventarioVazio } from "./inventario";
import { parseClientMessage, parseServerMessage } from "./protocol";
import { RECEITAS, fabricar } from "./receitas";
import { type SaveData, decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { TICKS_POR_CRESCIMENTO, crescerPlantacao } from "./rules";
import { FOME_MAX, novoEstadoVital, saciar } from "./sobrevivencia";
import { createWorld, getBlock, setBlock } from "./world";

const DIMS = { x: 2, z: 2, y: 2 };

type Sent = { clientId: number; data: string | ArrayBuffer }[];
function collect(): { sent: Sent; send: (c: number, d: string | ArrayBuffer) => void } {
  const sent: Sent = [];
  return { sent, send: (clientId, data) => sent.push({ clientId, data }) };
}
const join = (name: string, pin?: string, codigo?: string) =>
  JSON.stringify({ type: "join", name, pin, codigo });
const cmd = (text: string) => JSON.stringify({ type: "chat", text });

function ultimaVida(sent: Sent, clientId: number) {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "vida") return m;
  }
  return null;
}

/** Quantas unidades de `id` a última mensagem `inventario` mostra. */
function naMochila(sent: Sent, clientId: number, id: number): number {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type !== "inventario") continue;
    return m.slots.reduce((n, s) => (s.id === id ? n + s.qtd : n), 0);
  }
  return 0;
}

function baseSave(): SaveData {
  const { send } = collect();
  const s0 = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
  return decodeSave(encodeSave(s0.world, s0.toSave()));
}

/** Professor (1) + ana (2), mundo em sobrevivência. */
function turma(save = baseSave()) {
  save.modo = "sobrevivencia";
  const { sent, send } = collect();
  const session = new GameSession(send, { restore: save, codigo: "sala" });
  session.handleMessage(1, join("prof", "4321", "sala"));
  session.handleMessage(2, join("ana", "1111"));
  return { session, sent };
}

/**
 * Terra ao alcance de quem está no spawn, com ar em cima. Fica 2 blocos ao lado
 * de propósito: na célula do próprio jogador o servidor recusa a colocação
 * (`overlapsAnyPlayer`), e aí o teste provaria a coisa errada.
 */
function canteiro(session: GameSession): { x: number; y: number; z: number } {
  const s = session.spawn;
  const x = Math.floor(s.x) + 2;
  const z = Math.floor(s.z);
  const y = Math.floor(s.y) - 1; // altura do chão em que o jogador pisa
  setBlock(session.world, x, y, z, BlockId.Dirt);
  setBlock(session.world, x, y + 1, z, BlockId.Air);
  return { x, y: y + 1, z }; // a célula ONDE a muda vai
}

describe("§🍖 F6 — comida (módulo puro)", () => {
  it("fruta e pão alimentam; o trigo NÃO (é ingrediente)", () => {
    expect(isComida(ITEM_FRUTA)).toBe(true);
    expect(isComida(ITEM_PAO)).toBe(true);
    expect(isComida(ITEM_TRIGO)).toBe(false);
    expect(isComida(BlockId.Stone)).toBe(false);
    expect(saciedadeDe(ITEM_TRIGO)).toBe(0);
  });

  it("o pão alimenta MAIS que a fruta (é o fim da cadeia)", () => {
    expect(saciedadeDe(ITEM_PAO)).toBeGreaterThan(saciedadeDe(ITEM_FRUTA));
  });

  it("saciar enche a barra sem passar do teto", () => {
    const e = { ...novoEstadoVital(), fome: FOME_MAX - 2 };
    expect(saciar(e, 5).fome).toBe(FOME_MAX);
  });

  it("barriga cheia devolve o MESMO objeto (a session recusa sem gastar)", () => {
    const cheio = novoEstadoVital();
    expect(saciar(cheio, 5)).toBe(cheio);
    const morto = { ...novoEstadoVital(), vida: 0, fome: 0 };
    expect(saciar(morto, 5)).toBe(morto);
  });

  it("comer NÃO cura vida — quem cura é a regeneração, que exige fome alta", () => {
    const ferido = { ...novoEstadoVital(), vida: 4, fome: 0 };
    expect(saciar(ferido, 5).vida).toBe(4);
  });
});

describe("§🍖 F6 — a plantação (módulo puro)", () => {
  it("os 4 estágios são ids consecutivos, e só o último é maduro", () => {
    expect(estagioPlantacao(BlockId.Plantacao0)).toBe(0);
    expect(estagioPlantacao(BlockId.Plantacao3)).toBe(3);
    expect(estagioPlantacao(BlockId.Stone)).toBe(-1);
    expect(isPlantacaoMadura(BlockId.Plantacao2)).toBe(false);
    expect(isPlantacaoMadura(BlockId.Plantacao3)).toBe(true);
    for (let id = BlockId.Plantacao0; id <= BlockId.Plantacao3; id++) {
      expect(isPlantacao(id)).toBe(true);
    }
  });

  it("SOLO é terra e as três gramas — pedra, areia e tábua não servem", () => {
    for (const id of [BlockId.Dirt, BlockId.Grass, BlockId.GramaSeca, BlockId.GramaFria]) {
      expect(isSolo(id)).toBe(true);
      expect(apoioValido(BlockId.Plantacao0, id)).toBe(true);
    }
    for (const id of [BlockId.Stone, BlockId.Sand, BlockId.Planks, BlockId.Air]) {
      expect(isSolo(id)).toBe(false);
      expect(apoioValido(BlockId.Plantacao0, id)).toBe(false);
    }
    // e o apoio da TOCHA continua sendo cubo cheio qualquer (a pergunta é uma só)
    expect(apoioValido(BlockId.Tocha, BlockId.Stone)).toBe(true);
  });

  it("crescer avança UM estágio por chamada e para na madura", () => {
    const world = createWorld(DIMS);
    setBlock(world, 4, 4, 4, BlockId.Dirt);
    setBlock(world, 4, 5, 4, BlockId.Plantacao0);
    for (let esperado = 1; esperado <= 3; esperado++) {
      const changes = crescerPlantacao(world, 4, 5, 4);
      expect(changes).toEqual([{ x: 4, y: 5, z: 4, blockId: BlockId.Plantacao0 + esperado }]);
      setBlock(world, 4, 5, 4, changes![0]!.blockId);
    }
    expect(crescerPlantacao(world, 4, 5, 4)).toBeNull(); // madura não cresce mais
  });

  it("sem solo embaixo a planta não cresce (a regra de apoio a derruba)", () => {
    const world = createWorld(DIMS);
    setBlock(world, 4, 4, 4, BlockId.Stone);
    setBlock(world, 4, 5, 4, BlockId.Plantacao0);
    expect(crescerPlantacao(world, 4, 5, 4)).toBeNull();
  });

  it("crescer não é regra de vizinhança: quem não é plantação é ignorado", () => {
    const world = createWorld(DIMS);
    setBlock(world, 4, 5, 4, BlockId.Stone);
    expect(crescerPlantacao(world, 4, 5, 4)).toBeNull();
  });
});

describe("§🍖 F6 — a receita do pão", () => {
  it("3 trigo viram 1 pão, e o índice é o ÚLTIMO (append-only)", () => {
    const receita = RECEITAS[RECEITAS.length - 1]!;
    expect(receita.saida).toEqual({ id: ITEM_PAO, qtd: 1 });
    expect(receita.custo).toEqual([{ id: ITEM_TRIGO, qtd: 3 }]);
  });

  it("com 2 trigo não sai pão; com 3, sai", () => {
    const receita = RECEITAS[RECEITAS.length - 1]!;
    const dois = [...inventarioVazio()];
    dois[0] = { id: ITEM_TRIGO, qtd: 2 };
    expect(fabricar(dois, receita)).toBeNull();
    const tres = [...inventarioVazio()];
    tres[0] = { id: ITEM_TRIGO, qtd: 3 };
    const depois = fabricar(tres, receita);
    expect(depois).not.toBeNull();
    expect(contar(depois!, ITEM_TRIGO)).toBe(0);
    expect(contar(depois!, ITEM_PAO)).toBe(1);
  });
});

describe("§🍖 F6 — o protocolo", () => {
  it("`comer` exige slot INTEIRO (o resto do fio é descartado)", () => {
    expect(parseClientMessage(JSON.stringify({ type: "comer", slot: 3 }))).toEqual({
      type: "comer",
      slot: 3,
    });
    expect(parseClientMessage(JSON.stringify({ type: "comer", slot: 1.5 }))).toBeNull();
    expect(parseClientMessage(JSON.stringify({ type: "comer" }))).toBeNull();
    expect(parseClientMessage(JSON.stringify({ type: "comer", slot: "0" }))).toBeNull();
  });
});

describe("§🍖 F6 — pelo fio: plantar, crescer, colher, comer", () => {
  it("a muda plantada AMADURECE sozinha, um estágio por pulso", () => {
    const { session } = turma();
    const c = canteiro(session);
    session.handleMessage(2, JSON.stringify({ type: "place_block", ...c, blockId: BlockId.Plantacao0 }));
    // o professor semeia a mochila da ana, senão ela não tem muda pra plantar
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Air); // mãos vazias: nem planta
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Plantacao0} 4`));
    session.handleMessage(2, JSON.stringify({ type: "place_block", ...c, blockId: BlockId.Plantacao0 }));
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Plantacao0);
    for (let estagio = 1; estagio <= 3; estagio++) {
      for (let i = 0; i < TICKS_POR_CRESCIMENTO; i++) session.tick();
      expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Plantacao0 + estagio);
    }
    // madura fica madura: mais tempo não vira byte inválido
    for (let i = 0; i < TICKS_POR_CRESCIMENTO * 2; i++) session.tick();
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Plantacao3);
  });

  it("planta só pega em SOLO — em pedra o servidor recusa a colocação", () => {
    const { session } = turma();
    const c = canteiro(session);
    setBlock(session.world, c.x, c.y - 1, c.z, BlockId.Stone);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Plantacao0} 4`));
    session.handleMessage(2, JSON.stringify({ type: "place_block", ...c, blockId: BlockId.Plantacao0 }));
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Air);
  });

  it("cavar a terra debaixo da horta derruba a horta (regra de apoio)", () => {
    const { session } = turma();
    const c = canteiro(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Plantacao0} 4`));
    session.handleMessage(2, JSON.stringify({ type: "place_block", ...c, blockId: BlockId.Plantacao0 }));
    session.handleMessage(2, JSON.stringify({ type: "break_block", x: c.x, y: c.y - 1, z: c.z }));
    session.tick();
    session.tick();
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Air);
  });

  it("colher a madura dá trigo + muda; 3 trigo viram pão pela mensagem `fabricar`", () => {
    const { session, sent } = turma();
    const c = canteiro(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Plantacao0} 4`));
    for (let colheita = 0; colheita < 3; colheita++) {
      session.handleMessage(2, JSON.stringify({ type: "place_block", ...c, blockId: BlockId.Plantacao0 }));
      for (let i = 0; i < TICKS_POR_CRESCIMENTO * 3; i++) session.tick();
      expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Plantacao3);
      session.handleMessage(2, JSON.stringify({ type: "break_block", x: c.x, y: c.y, z: c.z }));
    }
    expect(naMochila(sent, 2, ITEM_TRIGO)).toBe(3);
    // a muda voltou toda vez: plantou 3, colheu 3, continua com as 4 do /dar
    expect(naMochila(sent, 2, BlockId.Plantacao0)).toBe(4);
    session.handleMessage(2, JSON.stringify({ type: "fabricar", receita: RECEITAS.length - 1 }));
    expect(naMochila(sent, 2, ITEM_TRIGO)).toBe(0);
    expect(naMochila(sent, 2, ITEM_PAO)).toBe(1);
  });

  it("comer enche a barra, gasta UMA unidade e não mexe na vida", () => {
    const save = baseSave();
    save.roster = [{ name: "ana", x: 1, y: 20, z: 1, yaw: 0, pitch: 0, vida: 8, fome: 4 }];
    const { session, sent } = turma(decodeSave(encodeSave(save.world, save)));
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PAO} 2`));
    expect(ultimaVida(sent, 2)?.fome).toBe(4);
    session.handleMessage(2, JSON.stringify({ type: "comer", slot: 0 }));
    expect(ultimaVida(sent, 2)?.fome).toBe(4 + saciedadeDe(ITEM_PAO));
    expect(ultimaVida(sent, 2)?.vida).toBe(8); // comer não cura
    expect(naMochila(sent, 2, ITEM_PAO)).toBe(1); // gastou UM
  });

  it("de barriga CHEIA a mordida é recusada — comida não se joga fora", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PAO} 2`));
    session.handleMessage(2, JSON.stringify({ type: "comer", slot: 0 }));
    expect(naMochila(sent, 2, ITEM_PAO)).toBe(2);
  });

  it("o que não é comida não se come (trigo cru continua na mochila)", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd(`/dar ana ${ITEM_TRIGO} 3`));
    session.handleMessage(2, JSON.stringify({ type: "comer", slot: 0 }));
    expect(naMochila(sent, 2, ITEM_TRIGO)).toBe(3);
  });

  it("em CRIATIVO ninguém come (paleta infinita, sem barra pra encher)", () => {
    const save = baseSave();
    save.modo = "criativo";
    const { sent, send } = collect();
    const session = new GameSession(send, { restore: save, codigo: "sala" });
    session.handleMessage(1, join("prof", "4321", "sala"));
    session.handleMessage(2, join("ana", "1111"));
    session.handleMessage(2, JSON.stringify({ type: "comer", slot: 0 }));
    expect(ultimaVida(sent, 2)).toBeNull();
  });

  it("a horta do SAVE volta a crescer depois de recarregar o mundo", () => {
    const { session } = turma();
    const c = canteiro(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Plantacao0} 4`));
    session.handleMessage(2, JSON.stringify({ type: "place_block", ...c, blockId: BlockId.Plantacao0 }));
    expect(getBlock(session.world, c.x, c.y, c.z)).toBe(BlockId.Plantacao0);

    // sai e volta pelo DISCO (o índice de plantações não vai no `.ljw`: ele se
    // reconstrói dos bytes, senão a horta do mundo salvo congelaria pra sempre)
    const salvo = decodeSave(encodeSave(session.world, session.toSave()));
    const { session: depois } = turma(salvo);
    expect(getBlock(depois.world, c.x, c.y, c.z)).toBe(BlockId.Plantacao0);
    for (let i = 0; i < TICKS_POR_CRESCIMENTO; i++) depois.tick();
    expect(getBlock(depois.world, c.x, c.y, c.z)).toBe(BlockId.Plantacao1);
  });
});
