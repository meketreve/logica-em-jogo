import { describe, expect, it } from "vitest";
import { BICHOS, TIPOS_BICHO, dropsDoBicho, parseBichosSalvos, tipoPorNome, variantePorNome } from "./bichos";
import { acharCaminho } from "./bichos-caminho";
import {
  BlockId,
  ITEM_BALDE_AGUA,
  ITEM_BALDE_LEITE,
  ITEM_BALDE_PEIXE,
  ITEM_BALDE_VAZIO,
  ITEM_CARNE_CRUA,
  ITEM_COURO,
  ITEM_TESOURA,
  ITEM_TRIGO,
} from "./blocks";
import { inventarioVazio } from "./inventario";
import { type SaveData, decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { nascerBicho } from "./session/bichos";
import { createWorld, findSpawnY, getBlock, setBlock } from "./world";

/**
 * §🐄 OS BICHOS (2026-11-02). A tabela é pura (`bichos.ts`), o caminho é puro
 * (`bichos-caminho.ts`); aqui se prova o que só a SESSÃO responde: quem nasce
 * onde, o que cada clique faz, quem pode machucar quem, o save, e o orçamento
 * do tick. Cada regra tem o CONTROLE NEGATIVO dela ao lado (LEARNINGS: a
 * sabotagem derruba SÓ a coisa testada).
 */

const PLANO = { x: 2, z: 2, y: 2 };

function sala(opts: { sobrevivencia?: boolean; bichosNaturais?: boolean } = {}) {
  const sent: { id: number; data: string }[] = [];
  const session = new GameSession(
    (id, data) => {
      if (typeof data === "string") sent.push({ id, data });
    },
    { dims: PLANO, seed: 5, flat: true, codigo: "prof42", bichosNaturais: opts.bichosNaturais ?? false },
  );
  const send = (id: number, msg: unknown): void => session.handleMessage(id, JSON.stringify(msg));
  send(1, { type: "join", name: "ana", pin: "2222" });
  if (opts.sobrevivencia) session.modoMundo = "sobrevivencia";
  const p = session.players.get(1)!;
  const chao = Math.floor(p.y);
  const naMochila = (slot: number, id: number, qtd: number): void => {
    const inv = (session.inventarios.get("ana") ?? inventarioVazio()).slice();
    inv[slot] = { id, qtd };
    session.inventarios.set("ana", inv);
  };
  const mochila = (slot: number) => (session.inventarios.get("ana") ?? inventarioVazio())[slot] ?? null;
  const conta = (id: number): number =>
    (session.inventarios.get("ana") ?? []).reduce((n, s) => n + (s && s.id === id ? s.qtd : 0), 0);
  /** Um bicho a 2 blocos da Ana, no chão. */
  const bicho = (tipo: (typeof TIPOS_BICHO)[number], variante = 0) =>
    nascerBicho(session, tipo, variante, p.x + 2, chao, p.z);
  const falas = (): string[] =>
    sent
      .map((s) => JSON.parse(s.data) as { type?: string; author?: string; text?: string })
      .filter((m) => m.type === "chat" && m.author === "servidor")
      .map((m) => m.text!);
  const doTipo = (t: string) =>
    sent.map((s) => JSON.parse(s.data) as { type?: string }).filter((m) => m.type === t) as never[];
  /** O cooldown de golpe é por TICK; o teste não quer andar o relógio (o bicho fugiria). */
  const bater = (id: number): void => {
    session.ultimoAtaque.delete(1);
    send(1, { type: "bater_bicho", id });
  };
  return { session, send, p, chao, naMochila, mochila, conta, bicho, falas, doTipo, bater, sent };
}

// ---------------------------------------------------------------------------

describe("§🐄 a tabela", () => {
  it("8 tipos, cada um com variante, vida e corpo", () => {
    expect(TIPOS_BICHO).toEqual(["vaca", "galinha", "ovelha", "cao", "gato", "tatu", "peixe", "arara"]);
    for (const t of TIPOS_BICHO) {
      const d = BICHOS[t];
      expect(d.variantes.length).toBeGreaterThan(0);
      expect(d.vidaMax).toBeGreaterThan(0);
      expect(d.altura).toBeGreaterThan(0);
    }
  });

  it("o nome digitado acha o tipo — com acento, sem acento, pela variante", () => {
    expect(tipoPorNome("cão")).toBe("cao");
    expect(tipoPorNome("CAO")).toBe("cao");
    expect(tipoPorNome("tucano")).toBe("arara");
    expect(tipoPorNome("dragão")).toBeNull();
    expect(variantePorNome("ovelha", "ovelha preta")).toBeGreaterThan(0);
  });

  it("decisão dele: tatu, cão e gato NÃO dão carne", () => {
    for (const t of ["tatu", "cao", "gato"] as const) {
      expect(BICHOS[t].drops.map((d) => d.id)).not.toContain(ITEM_CARNE_CRUA);
    }
    // controle: a vaca dá
    expect(BICHOS.vaca.drops.map((d) => d.id)).toContain(ITEM_CARNE_CRUA);
  });

  it("filhote não dá nada; ovelha NÃO tosquiada dá a lã da cor dela", () => {
    expect(dropsDoBicho("vaca", 0, true, false, () => 0.99)).toEqual([]);
    const preta = variantePorNome("ovelha", "ovelha preta");
    const ids = dropsDoBicho("ovelha", preta, false, false, () => 0).map((d) => d.id);
    expect(ids).toContain(BlockId.LaPreta);
    const tosq = dropsDoBicho("ovelha", preta, false, true, () => 0).map((d) => d.id);
    expect(tosq).not.toContain(BlockId.LaPreta);
  });
});

// ---------------------------------------------------------------------------

describe("§🐄 o caminho (A*)", () => {
  const VACA = { altura: 1.4, maxQueda: 3, nada: true };

  function chao(): ReturnType<typeof createWorld> {
    const w = createWorld({ x: 2, z: 2, y: 1 });
    for (let x = 0; x < 32; x++) for (let z = 0; z < 32; z++) setBlock(w, x, 0, z, BlockId.Stone);
    return w;
  }

  it("contorna um muro", () => {
    const w = chao();
    for (let z = 2; z < 20; z++) for (let y = 1; y <= 3; y++) setBlock(w, 10, y, z, BlockId.Stone);
    const c = acharCaminho(w, 5, 1, 10, 15, 1, 10, VACA, 400)!;
    expect(c.completo).toBe(true);
    // nenhuma célula do caminho dentro do muro
    for (let i = 0; i < c.celulas.length; i += 3) {
      expect(getBlock(w, c.celulas[i]!, c.celulas[i + 1]!, c.celulas[i + 2]!)).not.toBe(BlockId.Stone);
    }
  });

  it("sobe UM degrau e não sobe dois", () => {
    const w = chao();
    setBlock(w, 6, 1, 5, BlockId.Stone);
    expect(acharCaminho(w, 5, 1, 5, 6, 2, 5, VACA, 50)!.completo).toBe(true);
    const w2 = chao();
    for (let z = 0; z < 32; z++) {
      setBlock(w2, 6, 1, z, BlockId.Stone);
      setBlock(w2, 6, 2, z, BlockId.Stone);
    }
    // CONTROLE NEGATIVO: parede de 2 fecha a passagem inteira
    const c = acharCaminho(w2, 5, 1, 5, 8, 1, 5, VACA, 400)!;
    expect(c.completo).toBe(false);
  });

  it("a cerca segura: o bicho não sobe nela (é o curral)", () => {
    const w = chao();
    for (let z = 0; z < 32; z++) setBlock(w, 6, 1, z, BlockId.Cerca);
    expect(acharCaminho(w, 5, 1, 5, 8, 1, 5, VACA, 400)!.completo).toBe(false);
    // controle: a mesma linha de PEDRA (1 de altura) a vaca sobe
    const w2 = chao();
    for (let z = 0; z < 32; z++) setBlock(w2, 6, 1, z, BlockId.Stone);
    expect(acharCaminho(w2, 5, 1, 5, 8, 1, 5, VACA, 400)!.completo).toBe(true);
  });

  it("o teto de nós SEGURA a busca (e devolve o pedaço mais perto)", () => {
    const w = chao();
    const c = acharCaminho(w, 1, 1, 1, 30, 1, 30, VACA, 20)!;
    // o teto fecha a ABERTURA: o último nó expandido ainda abre até 8 vizinhos
    expect(c.nos).toBeLessThanOrEqual(20 + 8);
    expect(c.completo).toBe(false);
    expect(c.celulas.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------

describe("§🐄 quem nasce sozinho (decisão dele: procedural sim, aula não)", () => {
  function andar(s: GameSession, n: number): void {
    for (let i = 0; i < n; i++) s.tick();
  }

  it("mundo procedural povoa ao redor de quem joga", () => {
    const s = new GameSession(() => {}, { dims: { x: 8, z: 8, y: 4 }, seed: 11, singleplayer: true });
    s.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    andar(s, 12);
    expect(s.bichos.natural).toBe(true);
    expect(s.bichos.lista.size).toBeGreaterThan(0);
  });

  it("é DETERMINÍSTICO: o mesmo seed dá os mesmos bichos nas mesmas colunas", () => {
    const um = (): string => {
      const s = new GameSession(() => {}, { dims: { x: 8, z: 8, y: 4 }, seed: 11, singleplayer: true });
      s.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
      andar(s, 10); // a passada de 1 s povoa
      return [...s.bichos.lista.values()]
        .map((b) => `${b.tipo}${b.variante}@${Math.floor(b.x)},${Math.floor(b.z)}`)
        .sort()
        .join(" ");
    };
    expect(um()).toBe(um());
  });

  it("CONTROLE NEGATIVO: mundo plano não povoa", () => {
    const s = new GameSession(() => {}, { dims: { x: 8, z: 8, y: 4 }, seed: 11, flat: true, singleplayer: true });
    s.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    andar(s, 12);
    expect(s.players.size).toBe(1); // a Ana entrou mesmo (senão o "zero" seria de graça)
    expect(s.bichos.natural).toBe(false);
    expect(s.bichos.lista.size).toBe(0);
  });

  it("CONTROLE NEGATIVO: mundo de aula (somente leitura) não povoa — mesmo o procedural", () => {
    const s = new GameSession(() => {}, { dims: { x: 8, z: 8, y: 4 }, seed: 11, somenteLeitura: true, singleplayer: true });
    s.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    andar(s, 12);
    expect(s.players.size).toBe(1);
    expect(s.bichos.lista.size).toBe(0);
  });

  it("/bicho põe na aula; aluno não pode", () => {
    const s = sala();
    s.send(2, { type: "join", name: "prof", pin: "1111", codigo: "prof42" });
    s.send(2, { type: "chat", text: "/bicho vaca 3" });
    expect(s.session.bichos.lista.size).toBe(3);
    s.send(1, { type: "chat", text: "/bicho vaca" });
    expect(s.session.bichos.lista.size).toBe(3);
    expect(s.falas().at(-1)).toBe("Somente o professor pode trazer bichos.");
    s.send(2, { type: "chat", text: "/bichos limpar todos" });
    expect(s.session.bichos.lista.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------

describe("§🐄 o fio", () => {
  it("quem está perto recebe o bicho que nasce, e o sumiço", () => {
    const s = sala();
    s.session.tick(); // a 1ª passada de vista cria o conjunto da Ana
    const b = s.bicho("vaca");
    const add = s.doTipo("bichos") as { add: number[][] }[];
    expect(add.some((m) => m.add.some((e) => e[0] === b.id))).toBe(true);
    s.send(2, { type: "join", name: "prof", pin: "1111", codigo: "prof42" });
    s.send(2, { type: "chat", text: "/bichos limpar" });
    const sum = s.doTipo("bichos_sumiram") as { ids: number[] }[];
    expect(sum.some((m) => m.ids.includes(b.id))).toBe(true);
  });
});

// ---------------------------------------------------------------------------

describe("§🐄 bater (decisões 1 e 2)", () => {
  it("na sobrevivência a vaca morre em 5 golpes e dá carne e couro", () => {
    const s = sala({ sobrevivencia: true });
    const b = s.bicho("vaca");
    for (let i = 0; i < 4; i++) s.bater(b.id);
    expect(s.session.bichos.lista.has(b.id)).toBe(true);
    s.bater(b.id);
    expect(s.session.bichos.lista.has(b.id)).toBe(false);
    expect(s.conta(ITEM_CARNE_CRUA)).toBeGreaterThanOrEqual(1);
    expect(s.conta(ITEM_CARNE_CRUA) + s.conta(ITEM_COURO)).toBeGreaterThanOrEqual(1);
  });

  it("CONTROLE NEGATIVO: no criativo ninguém machuca", () => {
    const s = sala();
    const b = s.bicho("vaca");
    for (let i = 0; i < 6; i++) s.bater(b.id);
    expect(b.vida).toBe(BICHOS.vaca.vidaMax);
  });

  it("a regra machucar-bichos desligada protege (e avisa)", () => {
    const s = sala({ sobrevivencia: true });
    s.session.regras.set("machucar-bichos", false);
    const b = s.bicho("vaca");
    s.bater(b.id);
    expect(b.vida).toBe(BICHOS.vaca.vidaMax);
    expect(s.falas().at(-1)).toContain("os bichos não se machucam");
  });

  it("bicho DOMADO de outro só apanha com pvp ligado", () => {
    const s = sala({ sobrevivencia: true });
    const b = s.bicho("cao");
    b.dono = "bia";
    s.bater(b.id);
    expect(b.vida).toBe(BICHOS.cao.vidaMax);
    s.session.regras.set("pvp", true);
    s.bater(b.id);
    expect(b.vida).toBeLessThan(BICHOS.cao.vidaMax);
  });

  it("o tatu enrolado não sente o golpe", () => {
    const s = sala({ sobrevivencia: true });
    const b = s.bicho("tatu");
    s.bater(b.id); // apanha e enrola
    const depois = b.vida;
    expect(depois).toBeLessThan(BICHOS.tatu.vidaMax); // o 1º golpe pegou (senão o resto é de graça)
    s.session.tick(); // o estado vira Bola no pensar
    s.bater(b.id);
    expect(b.vida).toBe(depois);
  });
});

// ---------------------------------------------------------------------------

describe("§🐄 clique direito (as interações)", () => {
  it("tesoura na ovelha: lã da COR dela, sem machucar, e gasta a tesoura", () => {
    const s = sala({ sobrevivencia: true });
    const preta = variantePorNome("ovelha", "ovelha preta");
    const b = s.bicho("ovelha", preta);
    s.naMochila(0, ITEM_TESOURA, 1);
    s.send(1, { type: "usar_bicho", id: b.id, slot: 0 });
    expect(s.conta(BlockId.LaPreta)).toBeGreaterThanOrEqual(1);
    expect(b.vida).toBe(BICHOS.ovelha.vidaMax);
    expect(s.mochila(0)?.dano).toBe(1);
    // a 2ª tosquia espera a lã crescer
    const antes = s.conta(BlockId.LaPreta);
    s.send(1, { type: "usar_bicho", id: b.id, slot: 0 });
    expect(s.conta(BlockId.LaPreta)).toBe(antes);
    expect(s.falas().at(-1)).toContain("crescendo");
  });

  it("CONTROLE NEGATIVO: tesoura na vaca não tira nada", () => {
    const s = sala({ sobrevivencia: true });
    const b = s.bicho("vaca");
    s.naMochila(0, ITEM_TESOURA, 1);
    s.send(1, { type: "usar_bicho", id: b.id, slot: 0 });
    expect(s.conta(BlockId.LaBranca)).toBe(0);
    expect(s.mochila(0)?.dano).toBeUndefined();
  });

  it("balde vazio na vaca dá leite; beber devolve o balde e mata a fome", () => {
    const s = sala({ sobrevivencia: true });
    const b = s.bicho("vaca");
    s.naMochila(0, ITEM_BALDE_VAZIO, 1);
    s.send(1, { type: "usar_bicho", id: b.id, slot: 0 });
    expect(s.mochila(0)).toEqual({ id: ITEM_BALDE_LEITE, qtd: 1 });
    // a vaca não dá leite de novo na hora
    s.naMochila(1, ITEM_BALDE_VAZIO, 1);
    s.send(1, { type: "usar_bicho", id: b.id, slot: 1 });
    expect(s.mochila(1)).toEqual({ id: ITEM_BALDE_VAZIO, qtd: 1 });
    // beber
    const v = s.session.vitais.get("ana");
    s.session.vitais.set("ana", { ...(v ?? { vida: 20, fome: 20, folego: 300 }), fome: 10 } as never);
    s.send(1, { type: "comer", slot: 0 });
    expect(s.session.vitais.get("ana")?.fome).toBeGreaterThan(10);
    expect(s.conta(ITEM_BALDE_LEITE)).toBe(0);
    expect(s.conta(ITEM_BALDE_VAZIO)).toBe(2); // o do leite voltou
  });

  it("balde de água pega o peixe; despejar solta ele de novo", () => {
    const s = sala({ sobrevivencia: true });
    const b = s.bicho("peixe");
    s.naMochila(0, ITEM_BALDE_AGUA, 1);
    s.send(1, { type: "usar_bicho", id: b.id, slot: 0 });
    expect(s.session.bichos.lista.has(b.id)).toBe(false);
    expect(s.mochila(0)).toEqual({ id: ITEM_BALDE_PEIXE, qtd: 1 });
    const x = Math.floor(s.p.x) + 1;
    const z = Math.floor(s.p.z);
    s.send(1, { type: "balde", x, y: s.chao, z, encher: false, slot: 0 });
    expect(getBlock(s.session.world, x, s.chao, z)).toBe(BlockId.Agua);
    expect(s.mochila(0)).toEqual({ id: ITEM_BALDE_VAZIO, qtd: 1 });
    expect([...s.session.bichos.lista.values()].some((o) => o.tipo === "peixe")).toBe(true);
  });

  it("CONTROLE NEGATIVO: balde de água despejado NÃO solta peixe", () => {
    const s = sala({ sobrevivencia: true });
    s.naMochila(0, ITEM_BALDE_AGUA, 1);
    s.send(1, { type: "balde", x: Math.floor(s.p.x) + 1, y: s.chao, z: Math.floor(s.p.z), encher: false, slot: 0 });
    expect(s.session.bichos.lista.size).toBe(0);
  });

  it("trigo na vaca adulta: amor (gasta 1); curral cheio recusa", () => {
    const s = sala({ sobrevivencia: true });
    const b = s.bicho("vaca");
    s.naMochila(0, ITEM_TRIGO, 5);
    s.send(1, { type: "usar_bicho", id: b.id, slot: 0 });
    expect(s.mochila(0)?.qtd).toBe(4);
    expect(b.amorAte).toBeGreaterThan(s.session.tickCount);
    // curral cheio: 12 vacas ao redor
    for (let i = 0; i < 12; i++) s.bicho("vaca");
    const outra = s.bicho("vaca");
    s.send(1, { type: "usar_bicho", id: outra.id, slot: 0 });
    expect(s.mochila(0)?.qtd).toBe(4);
    expect(s.falas().at(-1)).toContain("curral está cheio");
  });

  it("duas vacas apaixonadas fazem um bezerro", () => {
    const s = sala({ sobrevivencia: true });
    const a = s.bicho("vaca");
    const b = s.bicho("vaca");
    s.naMochila(0, ITEM_TRIGO, 5);
    s.send(1, { type: "usar_bicho", id: a.id, slot: 0 });
    s.send(1, { type: "usar_bicho", id: b.id, slot: 0 });
    for (let i = 0; i < 80 && s.session.bichos.lista.size < 3; i++) s.session.tick();
    expect(s.session.bichos.lista.size).toBe(3);
    const cria = [...s.session.bichos.lista.values()].find((o) => o.id !== a.id && o.id !== b.id)!;
    expect(cria.filhoteAte).toBeGreaterThan(s.session.tickCount);
  });
});

// ---------------------------------------------------------------------------

describe("§🐄 placa de pressão (decisão 11)", () => {
  it("o bicho em cima liga a placa", () => {
    const s = sala();
    const x = Math.floor(s.p.x) + 3;
    const z = Math.floor(s.p.z);
    s.send(1, { type: "place_block", x, y: s.chao, z, blockId: BlockId.PlacaDesligada });
    s.session.tick();
    expect(getBlock(s.session.world, x, s.chao, z)).toBe(BlockId.PlacaDesligada);
    const b = nascerBicho(s.session, "vaca", 0, x + 0.5, s.chao, z + 0.5);
    b.estado = 4 as never; // sentada: não sai de cima no tick
    b.sentado = true;
    s.session.tick();
    expect(getBlock(s.session.world, x, s.chao, z)).toBe(BlockId.PlacaLigada);
  });
});

// ---------------------------------------------------------------------------

describe("§🐄 save", () => {
  it("vai e volta: tipo, variante, vida, dono, prazo da lã", () => {
    const s = sala({ sobrevivencia: true });
    const preta = variantePorNome("ovelha", "ovelha preta");
    const o = s.bicho("ovelha", preta);
    s.naMochila(0, ITEM_TESOURA, 1);
    s.send(1, { type: "usar_bicho", id: o.id, slot: 0 });
    const c = s.bicho("cao");
    c.dono = "ana";
    c.vida = 3;
    const meta = JSON.parse(JSON.stringify(s.session.toSave())) as SaveData;
    const lido = parseBichosSalvos(meta.bichos);
    expect(lido?.lista).toHaveLength(2);
    const s2 = new GameSession(() => {}, { restore: { ...meta, world: s.session.world } });
    const lista = [...s2.bichos.lista.values()];
    const o2 = lista.find((b) => b.tipo === "ovelha")!;
    const c2 = lista.find((b) => b.tipo === "cao")!;
    expect(o2.variante).toBe(preta);
    expect(o2.tosquiadaAte).toBeGreaterThan(s2.tickCount);
    expect(c2.dono).toBe("ana");
    expect(c2.vida).toBe(3);
    // ids novos não colidem com os salvos
    const novo = nascerBicho(s2, "vaca", 0, 5, s.chao, 5);
    expect(lista.map((b) => b.id)).not.toContain(novo.id);
  });

  it("o .ljw de verdade carrega os bichos", () => {
    const s = sala();
    s.bicho("galinha");
    const bytes = encodeSave(s.session.world, s.session.toSave());
    const save = decodeSave(bytes);
    expect(save.bichos?.lista).toHaveLength(1);
  });

  it("save de ANTES dos bichos: plano não liga o spawn, procedural liga", () => {
    const plano = sala();
    const meta = JSON.parse(JSON.stringify(plano.session.toSave())) as SaveData;
    delete meta.bichos;
    const r1 = new GameSession(() => {}, { restore: { ...meta, world: plano.session.world } });
    expect(r1.bichos.natural).toBe(false);
    const proc = new GameSession(() => {}, { dims: { x: 8, z: 8, y: 4 }, seed: 11, singleplayer: true });
    const m2 = JSON.parse(JSON.stringify(proc.toSave())) as SaveData;
    delete m2.bichos;
    const r2 = new GameSession(() => {}, { restore: { ...m2, world: proc.world } });
    expect(r2.bichos.natural).toBe(true);
  });

  it("CONTROLE NEGATIVO: mundo sem bicho e sem spawn não ganha campo no save", () => {
    const s = sala();
    expect(s.session.toSave().bichos).toBeUndefined();
  });

  it("entrada doente é pulada, não derruba o mundo", () => {
    const r = parseBichosSalvos({
      natural: true,
      proximoId: 9,
      lista: [{ t: 99, v: 0, x: 1, y: 1, z: 1, vida: 3 }, { t: 0, v: 0, x: 1, y: 1, z: 1, vida: 3 }, "lixo"],
    });
    expect(r?.lista).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------

describe("§🐄 orçamento (o notebook do professor)", () => {
  it("200 bichos andando num tick: buscas de caminho nunca passam de 8 por tick", () => {
    const s = sala();
    s.session.tick();
    for (let i = 0; i < 200; i++) {
      nascerBicho(s.session, "vaca", 0, 4 + (i % 24) + 0.5, s.chao, 4 + Math.floor(i / 24) * 2 + 0.5);
    }
    let maxBuscas = 0;
    let antes = 0;
    for (let t = 0; t < 60; t++) {
      s.session.tick();
      const st = s.session.bichos;
      const agora = st.buscasJanela;
      const nesteTick = agora >= antes ? agora - antes : agora;
      if (nesteTick > maxBuscas) maxBuscas = nesteTick;
      antes = agora;
    }
    expect(maxBuscas).toBeLessThanOrEqual(8);
    expect(maxBuscas).toBeGreaterThan(0); // controle: eles andaram mesmo
  });

  it("ninguém perto = ninguém simulado (o bicho dorme)", () => {
    const s = new GameSession(() => {}, { dims: PLANO, seed: 5, flat: true, bichosNaturais: false });
    const y = findSpawnY(s.world, 5, 5);
    const b = nascerBicho(s, "vaca", 0, 5.5, y, 5.5);
    const x0 = b.x;
    const ate0 = b.ate;
    for (let i = 0; i < 200; i++) s.tick();
    expect(b.x).toBe(x0);
    expect(b.ate).toBe(ate0);
  });
});

// ---------------------------------------------------------------------------

describe("§🐄 /bichos parar e /bichos fila (o bench e a vitrine)", () => {
  function comProf() {
    const s = sala();
    s.send(2, { type: "join", name: "prof", pin: "1111", codigo: "prof42" });
    const prof = s.session.players.get(2)!;
    return { ...s, prof, chatProf: (t: string) => s.send(2, { type: "chat", text: t }) };
  }

  it("parados, ninguém sai do lugar; soltos, andam", () => {
    const s = comProf();
    for (let i = 0; i < 6; i++) s.bicho("vaca");
    s.chatProf("/bichos parar");
    const antes = [...s.session.bichos.lista.values()].map((b) => `${b.x},${b.z}`).join(" ");
    for (let i = 0; i < 300; i++) s.session.tick();
    const depois = [...s.session.bichos.lista.values()].map((b) => `${b.x},${b.z}`).join(" ");
    expect(depois).toBe(antes);
    // CONTROLE NEGATIVO: soltos, em 30 s alguém passeia
    s.chatProf("/bichos soltar");
    for (let i = 0; i < 300; i++) s.session.tick();
    const solto = [...s.session.bichos.lista.values()].map((b) => `${b.x},${b.z}`).join(" ");
    expect(solto).not.toBe(antes);
  });

  it("a fila põe TODA espécie e variante (+ um filhote por fileira), parada", () => {
    // mundo maior que a `sala`: 8 fileiras a 3 blocos chegam a 25 do professor
    const ses = new GameSession(() => {}, {
      dims: { x: 6, z: 6, y: 2 }, seed: 5, flat: true, singleplayer: true, bichosNaturais: false,
    });
    ses.handleMessage(1, JSON.stringify({ type: "join", name: "prof" }));
    const s = { session: ses };
    ses.handleMessage(1, JSON.stringify({ type: "chat", text: "/bichos fila" }));
    const lista = [...s.session.bichos.lista.values()];
    const esperado = TIPOS_BICHO.reduce((n, t) => n + BICHOS[t].variantes.length + 1, 0);
    expect(lista).toHaveLength(esperado);
    for (const t of TIPOS_BICHO) {
      const vs = new Set(lista.filter((b) => b.tipo === t && b.filhoteAte === 0).map((b) => b.variante));
      expect(vs.size).toBe(BICHOS[t].variantes.length);
    }
    expect(s.session.bichos.parados).toBe(true);
    // o peixe ficou NA água (o rego cavado), e a água não escorreu
    for (const b of lista.filter((o) => o.tipo === "peixe")) {
      expect(getBlock(s.session.world, Math.floor(b.x), Math.floor(b.y), Math.floor(b.z))).toBe(BlockId.Agua);
    }
    for (let i = 0; i < 30; i++) s.session.tick();
    expect(s.session.bichos.lista.size).toBe(esperado); // ninguém morreu (peixe parado não sufoca)
  });

  it("aluno não para nem enfileira", () => {
    const s = comProf();
    s.send(1, { type: "chat", text: "/bichos fila" });
    expect(s.session.bichos.lista.size).toBe(0);
    expect(s.session.bichos.parados).toBe(false);
  });
});
