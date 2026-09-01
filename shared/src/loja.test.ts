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
const cmd = (text: string) => JSON.stringify({ type: "chat", text });

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

describe("o gate — ler é o ponto da feature, mexer continua do criador", () => {
  function turmaComLoja() {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: { x: 6, z: 6, y: 4 }, seed: 1, codigo: "sala" });
    session.handleMessage(1, join("prof", "0000", "sala"));
    const p = session.players.get(1)!;
    const x = Math.floor(p.x);
    const y = Math.floor(p.y);
    const z = Math.floor(p.z) + 1;
    session.handleMessage(1, JSON.stringify({ type: "place_block", x, y, z, blockId: BlockId.BauLoja }));
    session.handleMessage(2, join("ana", "1111")); // aluna de FORA do terreno do prof
    return { session, sent, x, y, z };
  }

  it("quem NÃO é do terreno abre pra COMPRAR mesmo assim (claimBloqueia não entra)", () => {
    const { session, sent, x, y, z } = turmaComLoja();
    sent.length = 0;
    session.handleMessage(2, JSON.stringify({ type: "use_block", x, y, z }));
    const msg = sent.find((s) => parseServerMessage(s.data as string)?.type === "container");
    expect(msg).toBeDefined();
  });

  it("quem NÃO é o criador não move nem descarta estoque (silencioso, como todo gate)", () => {
    const { session, x, y, z } = turmaComLoja();
    session.handleMessage(1, JSON.stringify({
      type: "place_block", x: x - 1, y, z, blockId: BlockId.MinerioFerro,
    })); // ana precisa ter algo na mochila pra tentar mover
    session.handleMessage(2, JSON.stringify({ type: "use_block", x, y, z }));
    const antes = session.containers.get(`${x},${y},${z}`);
    session.handleMessage(2, JSON.stringify({
      type: "mover_container", x, y, z, de: 0, para: 27,
    }));
    session.handleMessage(2, JSON.stringify({
      type: "descartar_container", x, y, z, slot: 27,
    }));
    const depois = session.containers.get(`${x},${y},${z}`);
    expect(depois).toEqual(antes);
  });

  // O teste acima passa mesmo sem o fix, de graça: em modo criativo (padrão),
  // `inventarioVale` já barra QUALQUER `mover_container`/`descartar_container`
  // antes mesmo de chegar no `criador` — e o container nasce vazio, então
  // "nada mudou" não prova nada. Este aqui estoca a loja de VERDADE (o
  // criador em modo sobrevivência) e tenta mexer nesse estoque real — e ainda
  // roda um CONTROLE POSITIVO: o próprio criador consegue mexer no que
  // guardou, senão um gate invertido (bloqueando todo mundo) passaria batido.
  it("com estoque REAL: ana não rouba nem descarta o que o criador guardou; o criador sim", () => {
    const { session, x, y, z } = turmaComLoja();
    session.handleMessage(1, cmd("/modo sobrevivencia all"));
    session.handleMessage(1, cmd("/modo sobrevivencia eu")); // `all` poupa quem digitou (§🍖 F1)
    session.handleMessage(1, cmd(`/dar prof ${BlockId.MinerioFerro} 5`));
    session.handleMessage(1, JSON.stringify({ type: "use_block", x, y, z }));
    // o criador estoca a loja de verdade (mochila slot 0 → container slot 0)
    session.handleMessage(1, JSON.stringify({ type: "mover_container", x, y, z, de: 0, para: 27 }));
    const antes = session.containers.get(`${x},${y},${z}`);
    expect(antes?.slots[0]).not.toBeNull(); // sanity: a loja TEM estoque real agora

    // ana (não-criadora) tenta roubar e tenta descartar o MESMO estoque
    session.handleMessage(2, JSON.stringify({ type: "use_block", x, y, z }));
    session.handleMessage(2, JSON.stringify({
      type: "mover_container", x, y, z, de: 27, para: 0,
    }));
    session.handleMessage(2, JSON.stringify({
      type: "descartar_container", x, y, z, slot: 27,
    }));
    const depoisDeAna = session.containers.get(`${x},${y},${z}`);
    expect(depoisDeAna).toEqual(antes); // estoque intacto — nem roubou nem descartou
    expect(depoisDeAna?.slots[0]).not.toBeNull();

    // controle positivo: o CRIADOR mexe no PRÓPRIO estoque sem problema —
    // prova que o gate não travou todo mundo (o erro oposto seria tão grave
    // quanto ana conseguir mexer)
    session.handleMessage(1, JSON.stringify({
      type: "mover_container", x, y, z, de: 27, para: 1,
    }));
    const depoisDoCriador = session.containers.get(`${x},${y},${z}`);
    expect(depoisDoCriador?.slots[0]).toBeNull(); // o criador esvaziou o próprio slot 0
  });
});

describe("definir_preco", () => {
  function lojaAberta() {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: { x: 6, z: 6, y: 4 }, seed: 1, codigo: "sala" });
    session.handleMessage(1, join("prof", "0000", "sala"));
    const p = session.players.get(1)!;
    const x = Math.floor(p.x);
    const y = Math.floor(p.y);
    const z = Math.floor(p.z) + 1;
    session.handleMessage(1, JSON.stringify({ type: "place_block", x, y, z, blockId: BlockId.BauLoja }));
    session.handleMessage(2, join("ana", "1111"));
    session.handleMessage(1, JSON.stringify({ type: "use_block", x, y, z }));
    return { session, sent, x, y, z };
  }

  it("o criador define um preço em item; a loja passa a mostrá-lo", () => {
    const { session, x, y, z } = lojaAberta();
    session.handleMessage(1, JSON.stringify({
      type: "definir_preco", x, y, z,
      item: BlockId.Planks,
      preco: { tipo: "item", item: BlockId.MinerioFerro, qtd: 3 },
    }));
    const cont = session.containers.get(`${x},${y},${z}`)!;
    expect(cont.precos.get(BlockId.Planks)).toEqual({ tipo: "item", item: BlockId.MinerioFerro, qtd: 3 });
  });

  it("o criador define um preço em Dimas", () => {
    const { session, x, y, z } = lojaAberta();
    session.handleMessage(1, JSON.stringify({
      type: "definir_preco", x, y, z, item: BlockId.Planks, preco: { tipo: "dimas", qtd: 5 },
    }));
    expect(session.containers.get(`${x},${y},${z}`)?.precos.get(BlockId.Planks)).toEqual({ tipo: "dimas", qtd: 5 });
  });

  it("preco: null REMOVE o item da lista de comprável", () => {
    const { session, x, y, z } = lojaAberta();
    session.handleMessage(1, JSON.stringify({
      type: "definir_preco", x, y, z, item: BlockId.Planks, preco: { tipo: "dimas", qtd: 5 },
    }));
    session.handleMessage(1, JSON.stringify({ type: "definir_preco", x, y, z, item: BlockId.Planks, preco: null }));
    expect(session.containers.get(`${x},${y},${z}`)?.precos.has(BlockId.Planks)).toBe(false);
  });

  it("quem NÃO é o criador não define preço (silencioso)", () => {
    const { session, x, y, z } = lojaAberta();
    session.handleMessage(2, JSON.stringify({ type: "use_block", x, y, z })); // ana abre pra comprar
    session.handleMessage(2, JSON.stringify({
      type: "definir_preco", x, y, z, item: BlockId.Planks, preco: { tipo: "dimas", qtd: 1 },
    }));
    expect(session.containers.get(`${x},${y},${z}`)?.precos.size ?? 0).toBe(0);
  });
});
