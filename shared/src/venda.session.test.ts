import { describe, expect, it } from "vitest";
import { BlockId, ITEM_DIAMANTE, ITEM_TRIGO } from "./blocks";
import { CONTAINER_SLOTS } from "./containers";
import { INV_SLOTS, STACK_MAX, inventarioVazio } from "./inventario";
import { GameSession } from "./session";

/**
 * §💰 O BALCÃO DE VENDA PELO FIO. O `venda.test.ts` prova a tabela de preço e o
 * total (conta pura); aqui é o que só a session responde: que o `/vender` abre
 * o balcão, que o Dimas é CRIADO ao vender, que item sem preço não entra, que o
 * que fica no balcão volta pra mochila ao fechar, e que o balcão não aparece em
 * nenhum save.
 */

const DIMS = { x: 2, z: 2, y: 2 };

function sala() {
  const sent: { id: number; data: string }[] = [];
  const session = new GameSession(
    (id, data) => {
      if (typeof data === "string") sent.push({ id, data });
    },
    { dims: DIMS, seed: 5, flat: true, codigo: "prof42", dimasInicial: 50 },
  );
  const send = (id: number, msg: unknown): void => session.handleMessage(id, JSON.stringify(msg));
  send(1, { type: "join", name: "ana", pin: "2222" });
  // O balcão é do modo SOBREVIVÊNCIA (no criativo a paleta é infinita, e vender
  // dela seria imprimir Dimas). `/modo <algo>` é do PROFESSOR, então aqui o
  // modo é posto no estado — a Ana é aluna.
  session.modoMundo = "sobrevivencia";

  /** Põe uma pilha na mochila da Ana, direto no estado (sem passar pelo chão). */
  const naMochila = (slot: number, id: number, qtd: number): void => {
    // o mapa é POVOADO SOB DEMANDA (mundo de aula cheio de nome não paga por
    // mochila vazia), então a primeira escrita cria a entrada
    const inv = (session.inventarios.get("ana") ?? inventarioVazio()).slice();
    inv[slot] = { id, qtd };
    session.inventarios.set("ana", inv);
  };
  const chat = (text: string): void => session.handleMessage(1, JSON.stringify({ type: "chat", text }));
  /** A última mensagem `balcao` que saiu pro cliente 1. */
  const balcao = (): { slots: { slot: number; id: number; qtd: number }[]; precos: { porItem: number; qtd: number }[]; total: number } | null => {
    for (let i = sent.length - 1; i >= 0; i--) {
      const m = JSON.parse(sent[i]!.data) as { type?: string };
      if (m.type === "balcao") return m as never;
    }
    return null;
  };
  /** Todo texto de chat que o servidor mandou, do mais novo pro mais velho. */
  const falas = (): string[] =>
    sent
      .map((s) => JSON.parse(s.data) as { type?: string; author?: string; text?: string })
      .filter((m) => m.type === "chat" && m.author === "servidor")
      .map((m) => m.text!)
      .reverse();
  const dimas = (): number => session.dimas.get("ana") ?? 0;
  const mochila = (slot: number) => (session.inventarios.get("ana") ?? inventarioVazio())[slot] ?? null;

  return { session, send, naMochila, chat, balcao, falas, dimas, mochila, sent };
}

/** O índice unificado do slot `i` do balcão. */
const noBalcao = (i: number): number => INV_SLOTS + i;

describe("§💰 /vender abre o balcão", () => {
  it("abre vazio, com total ZERO — e diz o que fazer", () => {
    const s = sala();
    s.chat("/vender");
    expect(s.balcao()).toEqual({ type: "balcao", slots: [], precos: [], total: 0 });
    expect(s.falas()[0]).toContain("ponha nele o que você quer vender");
  });

  it("o balcão tem 9 slots — uma linha, não um baú", () => {
    expect(CONTAINER_SLOTS.venda).toBe(9);
  });

  it("CONTROLE NEGATIVO: sem `/vender`, mover não faz nada", () => {
    // O painel estar ABERTO é o único gate que o balcão tem (ele não tem
    // posição pra conferir alcance). Se este passar, não há gate nenhum.
    const s = sala();
    s.naMochila(0, ITEM_TRIGO, 10);
    s.send(1, { type: "mover_venda", de: 0, para: noBalcao(0) });
    expect(s.balcao()).toBeNull();
    expect(s.mochila(0)).toEqual({ id: ITEM_TRIGO, qtd: 10 });
  });
});

describe("§💰 o que entra no balcão", () => {
  it("trigo entra, e o total aparece ANTES de vender", () => {
    const s = sala();
    s.naMochila(0, ITEM_TRIGO, 10);
    s.chat("/vender");
    s.send(1, { type: "mover_venda", de: 0, para: noBalcao(0) });
    expect(s.balcao()).toEqual({
      type: "balcao",
      slots: [{ slot: 0, id: ITEM_TRIGO, qtd: 10 }],
      precos: [{ porItem: ITEM_TRIGO, qtd: 2 }],
      total: 20,
    });
    // e o Dimas NÃO mudou: pôr no balcão não é vender
    expect(s.dimas()).toBe(50);
    expect(s.mochila(0)).toBeNull();
  });

  it("item SEM PREÇO não entra, e o aluno ouve por quê", () => {
    const s = sala();
    s.naMochila(0, BlockId.Planks, 64); // tábua: 1 tronco dá 4, não se vende
    s.chat("/vender");
    s.send(1, { type: "mover_venda", de: 0, para: noBalcao(0) });
    expect(s.balcao()).toEqual({ type: "balcao", slots: [], precos: [], total: 0 });
    expect(s.mochila(0)).toEqual({ id: BlockId.Planks, qtd: 64 });
    expect(s.falas()[0]).toContain("só compra o que você COLHE");
  });

  it("tirar DO balcão é sempre livre — desistir da venda não é vender", () => {
    const s = sala();
    s.naMochila(0, ITEM_TRIGO, 10);
    s.chat("/vender");
    s.send(1, { type: "mover_venda", de: 0, para: noBalcao(0) });
    s.send(1, { type: "mover_venda", de: noBalcao(0), para: 0 });
    expect(s.balcao()?.total).toBe(0);
    expect(s.mochila(0)).toEqual({ id: ITEM_TRIGO, qtd: 10 });
  });
});

describe("§💰 vender CRIA o Dimas — é a fonte da economia", () => {
  it("o saldo sobe pelo total, e o balcão esvazia", () => {
    const s = sala();
    s.naMochila(0, ITEM_TRIGO, 10); // 20
    s.naMochila(1, ITEM_DIAMANTE, 2); // 40
    s.chat("/vender");
    s.send(1, { type: "mover_venda", de: 0, para: noBalcao(0) });
    s.send(1, { type: "mover_venda", de: 1, para: noBalcao(1) });
    expect(s.balcao()?.total).toBe(60);

    s.send(1, { type: "vender" });
    // ⚠️ O ponto do lote inteiro: 50 + 60 = 110, e os 60 não saíram do saldo de
    // NINGUÉM. Até aqui o Dimas da turma era só o inicial.
    expect(s.dimas()).toBe(110);
    expect(s.balcao()).toEqual({ type: "balcao", slots: [], precos: [], total: 0 });
    expect(s.falas()[0]).toEqual("Vendido: 12 itens por 60 Dimas.");
  });

  it("vender com o balcão VAZIO avisa em vez de pagar zero", () => {
    const s = sala();
    s.chat("/vender");
    s.send(1, { type: "vender" });
    expect(s.dimas()).toBe(50);
    expect(s.falas()[0]).toContain("está vazio");
  });

  it("uma unidade só fala no SINGULAR", () => {
    const s = sala();
    s.naMochila(0, ITEM_DIAMANTE, 1);
    s.chat("/vender");
    s.send(1, { type: "mover_venda", de: 0, para: noBalcao(0) });
    s.send(1, { type: "vender" });
    // frase INTEIRA, não `toContain`: foi `toContain` que deixou passar o
    // "objetivo concluído: objetivo concluído:" em 19/10.
    expect(s.falas()[0]).toEqual("Vendido: 1 item por 20 Dimas.");
  });
});

describe("§💰 fechar DEVOLVE — nada se perde no painel", () => {
  it("o que ficou no balcão volta pra mochila", () => {
    const s = sala();
    s.naMochila(0, ITEM_TRIGO, 10);
    s.chat("/vender");
    s.send(1, { type: "mover_venda", de: 0, para: noBalcao(0) });
    expect(s.mochila(0)).toBeNull();

    s.send(1, { type: "fechar_venda" });
    expect(s.mochila(0)).toEqual({ id: ITEM_TRIGO, qtd: 10 });
    expect(s.dimas()).toBe(50); // fechar não vende
    expect(s.session.balcoes.get("ana")).toBeUndefined();
  });

  it("a QUEDA de conexão também devolve", () => {
    // Sem isto o trabalho da criança ficaria preso num painel que ninguém vê —
    // e é o caso que de fato acontece na aula (tablet que engasga).
    const s = sala();
    s.naMochila(0, ITEM_TRIGO, 10);
    s.chat("/vender");
    s.send(1, { type: "mover_venda", de: 0, para: noBalcao(0) });
    s.session.handleDisconnect(1);
    expect(s.session.inventarios.get("ana")?.[0]).toEqual({ id: ITEM_TRIGO, qtd: 10 });
    expect(s.session.balcoes.get("ana")).toBeUndefined();
  });

  it("mochila CHEIA: o resto fica guardado no balcão em vez de sumir", () => {
    const s = sala();
    // enche a mochila inteira de diamante e põe uma pilha no balcão
    for (let i = 0; i < INV_SLOTS; i++) s.naMochila(i, ITEM_DIAMANTE, STACK_MAX);
    s.chat("/vender");
    s.send(1, { type: "mover_venda", de: 0, para: noBalcao(0) });
    // agora o slot 0 está livre; enche ele de outra coisa pra devolução não caber
    s.naMochila(0, ITEM_TRIGO, STACK_MAX);
    s.send(1, { type: "fechar_venda" });
    expect(s.session.balcoes.get("ana")?.slots[0]).toEqual({ id: ITEM_DIAMANTE, qtd: STACK_MAX });
    expect(s.falas()[0]).toContain("mochila está cheia");
  });
});

describe("§💰 o balcão NÃO vai pro save", () => {
  it("nenhum container do save tem tipo venda", () => {
    const s = sala();
    s.naMochila(0, ITEM_TRIGO, 10);
    s.chat("/vender");
    s.send(1, { type: "mover_venda", de: 0, para: noBalcao(0) });
    const save = s.session.toSave();
    for (const c of save.containers ?? []) {
      expect(c.tipo, "o balcão não é do mundo — não pode entrar no save").not.toBe("venda");
    }
  });
});
