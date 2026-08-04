import { describe, expect, it } from "vitest";
import {
  MODO_PADRAO,
  type Modo,
  ehPresetSobrevivencia,
  modoEfetivo,
  nomeModo,
  parseModo,
  podeVoarNoModo,
} from "./modo";
import { parseServerMessage } from "./protocol";
import { type SaveData, decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";

const DIMS = { x: 2, z: 2, y: 2 };

type Sent = { clientId: number; data: string | ArrayBuffer }[];
function collect(): { sent: Sent; send: (c: number, d: string | ArrayBuffer) => void } {
  const sent: Sent = [];
  return { sent, send: (clientId, data) => sent.push({ clientId, data }) };
}
const join = (name: string, pin?: string, codigo?: string) =>
  JSON.stringify({ type: "join", name, pin, codigo });
const cmd = (text: string) => JSON.stringify({ type: "chat", text });

function ultimaChat(sent: Sent, clientId: number): string | null {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "chat") return m.text;
  }
  return null;
}

/** Último modo que o servidor MANDOU pra este cliente (null = nunca mandou). */
function ultimoModo(sent: Sent, clientId: number): Modo | null {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "modo") return m.efetivo;
  }
  return null;
}

function baseSave(): SaveData {
  const { send } = collect();
  const s0 = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
  return decodeSave(encodeSave(s0.world, s0.toSave()));
}

/** Professor (1) + duas alunas (2, 3) num mundo restaurado do save. */
function turma(save: SaveData = baseSave(), somenteLeitura = false) {
  const { sent, send } = collect();
  const session = new GameSession(send, {
    restore: save,
    codigo: "sala",
    ...(somenteLeitura ? { somenteLeitura: true } : {}),
  });
  session.handleMessage(1, join("prof", "4321", "sala"));
  session.handleMessage(2, join("ana", "1111"));
  session.handleMessage(3, join("bia", "2222"));
  return { session, sent };
}

describe("modo — módulo puro", () => {
  it("o padrão é criativo (é o que a escola já usa)", () => {
    expect(MODO_PADRAO).toBe("criativo");
    expect(podeVoarNoModo("criativo")).toBe(true);
    expect(podeVoarNoModo("sobrevivencia")).toBe(false);
  });

  it("parseModo aceita acento e caixa (o professor digita no meio da aula)", () => {
    expect(parseModo("sobrevivência")).toBe("sobrevivencia");
    expect(parseModo("Sobrevivencia")).toBe("sobrevivencia");
    expect(parseModo("  CRIATIVO ")).toBe("criativo");
    expect(parseModo("criativa")).toBeNull();
    expect(parseModo("")).toBeNull();
    expect(parseModo(3)).toBeNull();
    expect(parseModo(undefined)).toBeNull();
  });

  it("o ajuste pessoal vence o padrão do mundo", () => {
    expect(modoEfetivo("criativo", undefined)).toBe("criativo");
    expect(modoEfetivo("criativo", "sobrevivencia")).toBe("sobrevivencia");
    expect(modoEfetivo("sobrevivencia", "criativo")).toBe("criativo");
  });

  it("nomeModo devolve o texto com acento pro chat", () => {
    expect(nomeModo("sobrevivencia")).toBe("sobrevivência");
    expect(nomeModo("criativo")).toBe("criativo");
  });
});

describe("protocolo — mensagem `modo`", () => {
  it("faz round-trip e recusa modo desconhecido", () => {
    const m = parseServerMessage(JSON.stringify({ type: "modo", efetivo: "sobrevivencia" }));
    expect(m).toEqual({ type: "modo", efetivo: "sobrevivencia" });
    expect(parseServerMessage(JSON.stringify({ type: "modo", efetivo: "aventura" }))).toBeNull();
    expect(parseServerMessage(JSON.stringify({ type: "modo" }))).toBeNull();
  });
});

describe("/modo — o interruptor (§🍖 F1)", () => {
  it("todo join recebe o modo, mesmo criativo (troca de aula é sessão nova)", () => {
    const { sent } = turma();
    expect(ultimoModo(sent, 2)).toBe("criativo");
    expect(ultimoModo(sent, 3)).toBe("criativo");
  });

  it("consultar é de todos; o aluno não recebe a dica de professor", () => {
    const { session, sent } = turma();
    session.handleMessage(2, cmd("/modo"));
    const aluno = ultimaChat(sent, 2) ?? "";
    expect(aluno).toContain("O mundo está em modo criativo");
    expect(aluno).not.toContain("/modo <modo> all");
    session.handleMessage(1, cmd("/modo"));
    expect(ultimaChat(sent, 1) ?? "").toContain("/modo <modo> all");
  });

  it("aluno não muda modo nenhum", () => {
    const { session, sent } = turma();
    session.handleMessage(2, cmd("/modo sobrevivencia"));
    expect(ultimaChat(sent, 2) ?? "").toContain("Somente o professor");
    expect(ultimoModo(sent, 2)).toBe("criativo");
  });

  it("`/modo <modo>` muda o PADRÃO DO MUNDO e alcança quem está dentro", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/modo sobrevivencia"));
    expect(ultimoModo(sent, 2)).toBe("sobrevivencia");
    expect(ultimoModo(sent, 3)).toBe("sobrevivencia");
    expect(ultimoModo(sent, 1)).toBe("sobrevivencia"); // sem ajuste pessoal, pega o professor também
    expect(ultimaChat(sent, 1) ?? "").toContain("Modo do mundo agora é sobrevivência");
  });

  it("`eu` muda só quem digitou; `nome` só o alvo", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/modo sobrevivencia eu"));
    expect(ultimoModo(sent, 1)).toBe("sobrevivencia");
    expect(ultimoModo(sent, 2)).toBe("criativo");

    session.handleMessage(1, cmd("/modo sobrevivencia ana"));
    expect(ultimoModo(sent, 2)).toBe("sobrevivencia");
    expect(ultimoModo(sent, 3)).toBe("criativo");
  });

  it("o ajuste pessoal VENCE a troca do padrão do mundo", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/modo criativo ana")); // igual ao mundo: sem ajuste ainda
    session.handleMessage(1, cmd("/modo sobrevivencia")); // mundo inteiro
    expect(ultimoModo(sent, 2)).toBe("sobrevivencia");
    session.handleMessage(1, cmd("/modo criativo bia")); // agora DIFERE do mundo
    expect(ultimoModo(sent, 3)).toBe("criativo");
    session.handleMessage(1, cmd("/modo sobrevivencia")); // repete o padrão
    expect(ultimoModo(sent, 3)).toBe("criativo"); // bia continua no ajuste pessoal
  });

  it("`all` apaga os ajustes pessoais e NÃO arrasta o professor que digitou", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/modo criativo bia"));
    session.handleMessage(1, cmd("/modo sobrevivencia all"));
    expect(ultimoModo(sent, 2)).toBe("sobrevivencia");
    expect(ultimoModo(sent, 3)).toBe("sobrevivencia"); // o ajuste da bia foi apagado
    expect(ultimoModo(sent, 1)).toBe("criativo"); // o professor fica como estava
    expect(ultimaChat(sent, 1) ?? "").toContain("Você continua em criativo");
  });

  it("`all` também pega quem entra DEPOIS", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/modo sobrevivencia all"));
    session.handleMessage(4, join("caio", "3333"));
    expect(ultimoModo(sent, 4)).toBe("sobrevivencia");
  });

  it("o professor volta pra turma com `eu`", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/modo sobrevivencia all"));
    session.handleMessage(1, cmd("/modo sobrevivencia eu"));
    expect(ultimoModo(sent, 1)).toBe("sobrevivencia");
  });

  it("recusa alvo desconhecido e uso errado sem mexer em nada", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/modo sobrevivencia ninguem"));
    expect(ultimaChat(sent, 1) ?? "").toContain('Ninguém chamado "ninguem"');
    session.handleMessage(1, cmd("/modo aventura"));
    expect(ultimaChat(sent, 1) ?? "").toContain("Uso: /modo");
    expect(ultimoModo(sent, 2)).toBe("criativo");
  });

  it("aceita @nome e não diferencia maiúsculas", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/modo sobrevivencia @ANA"));
    expect(ultimoModo(sent, 2)).toBe("sobrevivencia");
  });

  it("avisa no chat quem MUDOU, e ninguém mais", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/modo sobrevivencia ana"));
    expect(ultimaChat(sent, 2) ?? "").toContain("sobrevivência");
    expect(ultimaChat(sent, 3) ?? "").not.toContain("sobrevivência");
  });

  it("modo e ajustes pessoais sobrevivem ao salvar e recarregar o .ljw", () => {
    const { session } = turma();
    session.handleMessage(1, cmd("/modo sobrevivencia all"));
    session.handleMessage(1, cmd("/modo criativo ana"));
    const salvo = decodeSave(encodeSave(session.world, session.toSave()));
    expect(salvo.modo).toBe("sobrevivencia");
    expect(salvo.modosPorJogador).toMatchObject({ prof: "criativo", ana: "criativo" });

    const { sent } = turma(salvo);
    expect(ultimoModo(sent, 3)).toBe("sobrevivencia"); // bia segue o mundo
    expect(ultimoModo(sent, 2)).toBe("criativo"); // ana manteve o ajuste
    expect(ultimoModo(sent, 1)).toBe("criativo"); // o professor também
  });

  it("mundo criativo sem ajuste nenhum NÃO ganha campo no save", () => {
    const { session } = turma();
    const meta = session.toSave();
    expect(meta.modo).toBeUndefined();
    expect(meta.modosPorJogador).toBeUndefined();
  });

  it("save com modo inválido degrada pro padrão em vez de derrubar o mundo", () => {
    const save = baseSave();
    (save as { modo?: unknown }).modo = "aventura";
    const bytes = encodeSave(save.world, save);
    expect(decodeSave(bytes).modo).toBeUndefined();
  });

  it("mundo de AULA é criativo à força: ignora o save e recusa a troca", () => {
    const salvo = baseSave();
    salvo.modo = "sobrevivencia";
    salvo.modosPorJogador = { ana: "sobrevivencia" };
    const { session, sent } = turma(salvo, true);
    expect(ultimoModo(sent, 2)).toBe("criativo");
    session.handleMessage(1, cmd("/modo sobrevivencia"));
    expect(ultimaChat(sent, 1) ?? "").toContain("mundo de aula");
    expect(ultimoModo(sent, 2)).toBe("criativo");
  });
});

/** Mundo NOVO (sem restore) com o preset do §🍖 F9 ligado ou não. */
function mundoNovo(sobrevivencia: boolean, somenteLeitura = false) {
  const { sent, send } = collect();
  const session = new GameSession(send, {
    dims: DIMS,
    seed: 5,
    codigo: "sala",
    ...(sobrevivencia ? { sobrevivencia: true } : {}),
    ...(somenteLeitura ? { somenteLeitura: true } : {}),
  });
  session.handleMessage(2, join("ana", "1111"));
  return { session, sent };
}

describe("§🍖 F9 — preset de mundo de sobrevivência", () => {
  it("ehPresetSobrevivencia lê o token com e sem acento, e só ele", () => {
    expect(ehPresetSobrevivencia("sobrevivencia")).toBe(true);
    expect(ehPresetSobrevivencia("Sobrevivência")).toBe(true);
    expect(ehPresetSobrevivencia("criativo")).toBe(false);
    expect(ehPresetSobrevivencia("plano")).toBe(false);
    expect(ehPresetSobrevivencia(undefined)).toBe(false);
  });

  it("quem entra num mundo nascido com o preset já entra em sobrevivência", () => {
    const { sent } = mundoNovo(true);
    expect(ultimoModo(sent, 2)).toBe("sobrevivencia");
  });

  it("o preset também liga o ciclo dia/noite (sem noite, sobreviver não significa nada)", () => {
    expect(mundoNovo(true).session.toSave().ciclo).toBe(true);
    expect(mundoNovo(false).session.toSave().ciclo).toBe(false);
  });

  it("pvp e confinamento continuam no PADRÃO — o preset não grava diff que não precisa", () => {
    const meta = mundoNovo(true).session.toSave();
    expect(meta.regras).toBeUndefined();
    expect(meta.confinamento).toBeUndefined();
    expect(meta.modo).toBe("sobrevivencia"); // o que ele grava é só isto
  });

  it("não toca no TERRENO: os bytes do mundo saem idênticos com e sem o preset", () => {
    // é o que justifica ele NÃO ser um quarto WorldPreset — terreno e partida
    // são eixos separados, e `LJ_PRESET=plano LJ_SOBREVIVENCIA=1` tem de valer
    const { send } = collect();
    const a = new GameSession(send, { dims: DIMS, seed: 5 });
    const b = new GameSession(send, { dims: DIMS, seed: 5, sobrevivencia: true });
    for (let i = 0; i < a.world.chunks.length; i++) {
      expect(b.world.chunks[i]).toEqual(a.world.chunks[i]);
    }
    expect(b.spawn).toEqual(a.spawn);
  });

  it("é escolha de NASCIMENTO: mundo restaurado ignora o preset e mantém o que gravou", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, {
      restore: baseSave(), // save de mundo criativo
      codigo: "sala",
      sobrevivencia: true,
    });
    session.handleMessage(2, join("ana", "1111"));
    expect(ultimoModo(sent, 2)).toBe("criativo");
    expect(session.toSave().modo).toBeUndefined();
  });

  it("mundo de AULA vence o preset (a aula distribui um modelo, não uma partida)", () => {
    const { sent } = mundoNovo(true, true);
    expect(ultimoModo(sent, 2)).toBe("criativo");
  });
});
