import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_CARVAO,
  ITEM_LINGOTE_FERRO,
  ITEM_PICARETA_MADEIRA,
  fornalhaComEstado,
  fornalhaComFrente,
  fornalhaFrente,
} from "./blocks";
import {
  FORNALHA_COMBUSTIVEL,
  FORNALHA_ENTRADA,
  FORNALHA_SAIDA,
} from "./containers";
import { TICKS_POR_COZIMENTO } from "./fornalha";
import { INV_SLOTS } from "./inventario";
import { parseServerMessage } from "./protocol";
import { type SaveData, decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { getBlock, setBlock } from "./world";

/**
 * §🍖 F10b — a fornalha PELO FIO. O `fornalha.test.ts` prova a simulação pura;
 * aqui é o que só a session responde: que o clique direito abre com o gate de
 * claim, que o conteúdo é do SERVIDOR, que o tick troca o byte do bloco (e com
 * ele a luz), que quebrar com coisa dentro é RECUSADO e que tudo isso sobrevive
 * ao save.
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
  return { session, sent, save };
}

/** Uma fornalha ao alcance de quem está no spawn (2 células ao lado). */
function poeFornalha(session: GameSession): { x: number; y: number; z: number } {
  const s = session.spawn;
  const x = Math.floor(s.x) + 2;
  const z = Math.floor(s.z);
  const y = Math.floor(s.y);
  setBlock(session.world, x, y, z, BlockId.Fornalha);
  return { x, y, z };
}

/** A última mensagem `container` que chegou pra este cliente. */
function ultimoContainer(sent: Sent, clientId: number) {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "container") return m;
  }
  return null;
}

/** Quanto do id `id` a última mensagem `inventario` mostra. */
function naMochila(sent: Sent, clientId: number, id: number): number {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type !== "inventario") continue;
    return m.slots.reduce((n, s) => (s.id === id ? n + s.qtd : n), 0);
  }
  return 0;
}

const abrir = (x: number, y: number, z: number) =>
  JSON.stringify({ type: "use_block", x, y, z });
const mover = (x: number, y: number, z: number, de: number, para: number) =>
  JSON.stringify({ type: "mover_container", x, y, z, de, para });

describe("§🍖 F10b — a fornalha pelo fio", () => {
  it("clique direito ABRE: o servidor responde com o conteúdo (vazio, e é ele que abre o painel)", () => {
    const { session, sent } = turma();
    const f = poeFornalha(session);
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    const c = ultimoContainer(sent, 2);
    expect(c).not.toBeNull();
    expect(c).toMatchObject({ x: f.x, y: f.y, z: f.z, tipo: "fornalha" });
    expect(c!.slots).toEqual([]);
  });

  it("sem abrir, mover é NO-OP: o fio não mexe em baú que o aluno nunca alcançou", () => {
    const { session, sent } = turma();
    const f = poeFornalha(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.MinerioFerro} 3`));
    const antes = sent.length;
    session.handleMessage(2, mover(f.x, f.y, f.z, 0, INV_SLOTS + FORNALHA_ENTRADA));
    expect(sent.length).toBe(antes);
    expect(naMochila(sent, 2, BlockId.MinerioFerro)).toBe(3);
  });

  it("a transferência é do SERVIDOR: o minério sai da mochila e entra na fornalha", () => {
    const { session, sent } = turma();
    const f = poeFornalha(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.MinerioFerro} 3`));
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    session.handleMessage(2, mover(f.x, f.y, f.z, 0, INV_SLOTS + FORNALHA_ENTRADA));
    expect(naMochila(sent, 2, BlockId.MinerioFerro)).toBe(0);
    expect(ultimoContainer(sent, 2)!.slots).toEqual([
      { slot: FORNALHA_ENTRADA, id: BlockId.MinerioFerro, qtd: 3 },
    ]);
  });

  it("cozinhar de ponta a ponta: o byte vira ACESA, sai lingote e o aluno o pega", () => {
    const { session, sent } = turma();
    const f = poeFornalha(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.MinerioFerro} 1`));
    session.handleMessage(1, cmd(`/dar ana ${ITEM_CARVAO} 1`));
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    // slot 0 = minério, slot 1 = carvão (a ordem do /dar)
    session.handleMessage(2, mover(f.x, f.y, f.z, 0, INV_SLOTS + FORNALHA_ENTRADA));
    session.handleMessage(2, mover(f.x, f.y, f.z, 1, INV_SLOTS + FORNALHA_COMBUSTIVEL));

    expect(getBlock(session.world, f.x, f.y, f.z)).toBe(BlockId.Fornalha);
    session.tick(); // o 1º tick acende
    expect(getBlock(session.world, f.x, f.y, f.z)).toBe(BlockId.FornalhaAcesa);
    const meio = ultimoContainer(sent, 2)!;
    expect(meio.queimando).toBeGreaterThan(0);

    for (let i = 1; i < TICKS_POR_COZIMENTO; i++) session.tick();
    const pronto = ultimoContainer(sent, 2)!;
    expect(pronto.slots).toContainEqual({
      slot: FORNALHA_SAIDA, id: ITEM_LINGOTE_FERRO, qtd: 1,
    });
    // e o aluno tira o lingote pra mochila
    session.handleMessage(2, mover(f.x, f.y, f.z, INV_SLOTS + FORNALHA_SAIDA, 0));
    expect(naMochila(sent, 2, ITEM_LINGOTE_FERRO)).toBe(1);
  });

  it("acabou o combustível: o byte volta a APAGADA sozinho (e a luz com ele)", () => {
    const { session } = turma();
    const f = poeFornalha(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Sand} 1`));
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Planks} 1`));
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    session.handleMessage(2, mover(f.x, f.y, f.z, 0, INV_SLOTS + FORNALHA_ENTRADA));
    session.handleMessage(2, mover(f.x, f.y, f.z, 1, INV_SLOTS + FORNALHA_COMBUSTIVEL));
    // o CONTROLE POSITIVO importa: sem ele o teste passaria com o tick da
    // fornalha desligado, porque "nunca acendeu" e "apagou" dão o mesmo byte
    session.tick();
    expect(getBlock(session.world, f.x, f.y, f.z)).toBe(BlockId.FornalhaAcesa);
    for (let i = 1; i < TICKS_POR_COZIMENTO; i++) session.tick();
    expect(getBlock(session.world, f.x, f.y, f.z)).toBe(BlockId.Fornalha);
  });

  it("a SAÍDA é de mão única: não dá pra empurrar item pra dentro dela", () => {
    const { session, sent } = turma();
    const f = poeFornalha(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Cobblestone} 4`));
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    session.handleMessage(2, mover(f.x, f.y, f.z, 0, INV_SLOTS + FORNALHA_SAIDA));
    expect(ultimoContainer(sent, 2)!.slots).toEqual([]);
    expect(naMochila(sent, 2, BlockId.Cobblestone)).toBe(4);
  });

  it("o slot de COMBUSTÍVEL recusa o que não queima e avisa (pedido do playtest)", () => {
    const { session, sent } = turma();
    const f = poeFornalha(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Cobblestone} 4`));
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    const antes = sent.length;
    session.handleMessage(2, mover(f.x, f.y, f.z, 0, INV_SLOTS + FORNALHA_COMBUSTIVEL));
    // o item VOLTOU pra mochila e o slot continua vazio
    expect(ultimoContainer(sent, 2)!.slots).toEqual([]);
    expect(naMochila(sent, 2, BlockId.Cobblestone)).toBe(4);
    // e a criança ouviu o porquê
    const avisos = sent
      .slice(antes)
      .map((s) => parseServerMessage(s.data as string))
      .filter((m) => m?.type === "chat");
    expect(avisos.length).toBe(1);
    expect((avisos[0] as { text: string }).text).toContain("não queima");
  });

  it("fornalha COM COISA DENTRO não quebra — e o aluno é avisado no chat", () => {
    const { session, sent } = turma();
    const f = poeFornalha(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.MinerioFerro} 1`));
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    session.handleMessage(2, mover(f.x, f.y, f.z, 0, INV_SLOTS + FORNALHA_ENTRADA));
    // §🍖 F10d: a fornalha é pedregulho — sem picareta a recusa seria a OUTRA
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PICARETA_MADEIRA} 1`));
    const antes = sent.length;
    session.handleMessage(2, JSON.stringify({ type: "break_block", ...f }));
    expect(getBlock(session.world, f.x, f.y, f.z)).toBe(BlockId.Fornalha);
    const avisos = sent
      .slice(antes)
      .map((s) => parseServerMessage(s.data as string))
      .filter((m) => m?.type === "chat");
    expect(avisos.length).toBe(1);
    expect((avisos[0] as { text: string }).text).toContain("esvazie");
  });

  it("fornalha VAZIA quebra normal, e volta pra mochila como fornalha", () => {
    const { session, sent } = turma();
    const f = poeFornalha(session);
    session.handleMessage(1, cmd(`/dar ana ${ITEM_PICARETA_MADEIRA} 1`)); // §🍖 F10d
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    session.handleMessage(2, JSON.stringify({ type: "break_block", ...f }));
    expect(getBlock(session.world, f.x, f.y, f.z)).toBe(BlockId.Air);
    expect(naMochila(sent, 2, BlockId.Fornalha)).toBe(1);
    // e o painel de quem estava com ela aberta FECHA (o bloco não existe mais)
    const fechou = sent.some((s) => {
      const m = parseServerMessage(s.data as string);
      return s.clientId === 2 && m?.type === "container_fechado";
    });
    expect(fechou).toBe(true);
  });

  it("o conteúdo sobrevive ao SAVE (e volta cozinhando de onde parou)", () => {
    const { session } = turma();
    const f = poeFornalha(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.MinerioFerro} 2`));
    session.handleMessage(1, cmd(`/dar ana ${ITEM_CARVAO} 1`));
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    session.handleMessage(2, mover(f.x, f.y, f.z, 0, INV_SLOTS + FORNALHA_ENTRADA));
    session.handleMessage(2, mover(f.x, f.y, f.z, 1, INV_SLOTS + FORNALHA_COMBUSTIVEL));
    for (let i = 0; i < 30; i++) session.tick();

    const save = decodeSave(encodeSave(session.world, session.toSave()));
    expect(save.containers).toHaveLength(1);
    expect(save.containers![0]).toMatchObject({ x: f.x, y: f.y, z: f.z, tipo: "fornalha" });

    const { session: s2, sent: sent2 } = turma(save);
    s2.handleMessage(2, abrir(f.x, f.y, f.z));
    const c = ultimoContainer(sent2, 2)!;
    expect(c.slots).toContainEqual({ slot: FORNALHA_ENTRADA, id: BlockId.MinerioFerro, qtd: 2 });
    expect(c.queimando).toBeGreaterThan(0);
    expect(c.progresso).toBe(30);
  });

  it("fornalha VAZIA não engorda o save (o vazio se refaz do byte do chunk)", () => {
    const { session } = turma();
    const f = poeFornalha(session);
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    expect(session.toSave().containers).toBeUndefined();
  });

  it("dois alunos no MESMO bloco veem a mesma coisa (o caso que a mochila não tem)", () => {
    const { session, sent } = turma();
    const f = poeFornalha(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Sand} 5`));
    session.handleMessage(1, abrir(f.x, f.y, f.z)); // o professor também abriu
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    session.handleMessage(2, mover(f.x, f.y, f.z, 0, INV_SLOTS + FORNALHA_ENTRADA));
    // o professor recebeu o conteúdo NOVO sem ter tocado em nada
    expect(ultimoContainer(sent, 1)!.slots).toEqual([
      { slot: FORNALHA_ENTRADA, id: BlockId.Sand, qtd: 5 },
    ]);
  });

  it("§🍖 F10e — o BAÚ reusa o encanamento inteiro: abre, guarda e devolve", () => {
    const { session, sent } = turma();
    const s = session.spawn;
    const b = { x: Math.floor(s.x) + 2, y: Math.floor(s.y), z: Math.floor(s.z) };
    setBlock(session.world, b.x, b.y, b.z, BlockId.Bau);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Cobblestone} 40`));
    session.handleMessage(2, abrir(b.x, b.y, b.z));
    expect(ultimoContainer(sent, 2)).toMatchObject({ tipo: "bau" });
    // guarda no ÚLTIMO slot do baú (os 27 valem: não há slot proibido aqui)
    session.handleMessage(2, mover(b.x, b.y, b.z, 0, INV_SLOTS + 26));
    expect(naMochila(sent, 2, BlockId.Cobblestone)).toBe(0);
    expect(ultimoContainer(sent, 2)!.slots).toEqual([
      { slot: 26, id: BlockId.Cobblestone, qtd: 40 },
    ]);
    // e volta
    session.handleMessage(2, mover(b.x, b.y, b.z, INV_SLOTS + 26, 3));
    expect(naMochila(sent, 2, BlockId.Cobblestone)).toBe(40);
  });

  it("§🍖 F10e — baú COM COISA DENTRO não quebra (a decisão do usuário)", () => {
    const { session, sent } = turma();
    const s = session.spawn;
    const b = { x: Math.floor(s.x) + 2, y: Math.floor(s.y), z: Math.floor(s.z) };
    setBlock(session.world, b.x, b.y, b.z, BlockId.Bau);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Cobblestone} 5`));
    session.handleMessage(2, abrir(b.x, b.y, b.z));
    session.handleMessage(2, mover(b.x, b.y, b.z, 0, INV_SLOTS + 0));
    session.handleMessage(2, JSON.stringify({ type: "break_block", ...b }));
    expect(getBlock(session.world, b.x, b.y, b.z)).toBe(BlockId.Bau);
    // esvaziado, quebra — e o pedregulho não se perdeu no caminho
    session.handleMessage(2, mover(b.x, b.y, b.z, INV_SLOTS + 0, 0));
    session.handleMessage(2, JSON.stringify({ type: "break_block", ...b }));
    expect(getBlock(session.world, b.x, b.y, b.z)).toBe(BlockId.Air);
    expect(naMochila(sent, 2, BlockId.Cobblestone)).toBe(5);
    expect(naMochila(sent, 2, BlockId.Bau)).toBe(1);
  });

  it("fechar o painel para o fluxo: o tick não manda mais nada pra quem saiu", () => {
    const { session, sent } = turma();
    const f = poeFornalha(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Sand} 5`));
    session.handleMessage(1, cmd(`/dar ana ${ITEM_CARVAO} 1`));
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    session.handleMessage(2, mover(f.x, f.y, f.z, 0, INV_SLOTS + FORNALHA_ENTRADA));
    session.handleMessage(2, mover(f.x, f.y, f.z, 1, INV_SLOTS + FORNALHA_COMBUSTIVEL));
    // controle POSITIVO primeiro: com o painel aberto, o tick manda mesmo
    const marcaAberto = sent.length;
    session.tick();
    const comPainel = sent
      .slice(marcaAberto)
      .map((s) => parseServerMessage(s.data as string))
      .filter((m) => m?.type === "container");
    expect(comPainel.length).toBeGreaterThan(0);

    session.handleMessage(2, JSON.stringify({ type: "fechar_container" }));
    const antes = sent.length;
    for (let i = 0; i < 5; i++) session.tick();
    const novos = sent
      .slice(antes)
      .map((s) => parseServerMessage(s.data as string))
      .filter((m) => m?.type === "container");
    expect(novos).toEqual([]);
  });

  it("§🍖 F10 refino: acender NÃO gira a fornalha — o tick preserva a frente", () => {
    // as quatro direções, e o par apagada/acesa das quatro. Antes do refino
    // havia UM id aceso, e escrevê-lo teria virado toda fornalha pro −Z no
    // instante em que o fogo pegasse — na frente da turma.
    for (let k = 0; k < 4; k++) {
      const { session, sent } = turma();
      const f = poeFornalha(session);
      const apagada = fornalhaComFrente(k);
      setBlock(session.world, f.x, f.y, f.z, apagada);
      session.handleMessage(1, cmd(`/dar ana ${BlockId.MinerioFerro} 1`));
      session.handleMessage(1, cmd(`/dar ana ${ITEM_CARVAO} 1`));
      session.handleMessage(2, abrir(f.x, f.y, f.z));
      session.handleMessage(2, mover(f.x, f.y, f.z, 0, INV_SLOTS + FORNALHA_ENTRADA));
      session.handleMessage(2, mover(f.x, f.y, f.z, 1, INV_SLOTS + FORNALHA_COMBUSTIVEL));
      expect(ultimoContainer(sent, 2)!.tipo).toBe("fornalha"); // o painel achou a nova
      session.tick(); // acende
      expect(getBlock(session.world, f.x, f.y, f.z)).toBe(fornalhaComEstado(apagada, true));
      expect(fornalhaFrente(getBlock(session.world, f.x, f.y, f.z))).toBe(k);
    }
  });

  it("bug-580: trocar fornalha por BAÚ na mesma célula não herda o conteúdo dela", () => {
    // o `/bloco` do professor troca o byte sem passar pelo gate de quebra, e
    // até aqui o mapa por posição só era limpo quando a célula deixava de ser
    // container — de fornalha pra baú ele SOBREVIVIA, e o `use_block` seguinte
    // respondia "fornalha, 3 slots, com barra de fogo" em cima de um baú.
    const { session, sent } = turma();
    const f = poeFornalha(session);
    session.handleMessage(1, cmd(`/dar ana ${BlockId.MinerioFerro} 3`));
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    session.handleMessage(2, mover(f.x, f.y, f.z, 0, INV_SLOTS + FORNALHA_ENTRADA));
    // controle POSITIVO: o minério está mesmo guardado na fornalha
    expect(ultimoContainer(sent, 2)!.slots).toEqual([
      { slot: FORNALHA_ENTRADA, id: BlockId.MinerioFerro, qtd: 3 },
    ]);

    session.handleMessage(1, cmd(`/bloco ${f.x} ${f.y} ${f.z} ${BlockId.Bau}`));
    session.handleMessage(2, abrir(f.x, f.y, f.z));
    const c = ultimoContainer(sent, 2)!;
    expect(c.tipo).toBe("bau");
    expect(c.slots).toEqual([]); // o minério não atravessou a troca de bloco
  });
});
