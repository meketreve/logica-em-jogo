import { describe, expect, it } from "vitest";
import { parseServerMessage } from "./protocol";
import { REGRAS, parseRegras, regraDef, regrasParaSave, valorRegra } from "./regras";
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

function baseSave(): SaveData {
  const { send } = collect();
  const s0 = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
  return decodeSave(encodeSave(s0.world, s0.toSave()));
}

function turma(save: SaveData = baseSave()) {
  const { sent, send } = collect();
  const session = new GameSession(send, { restore: save, codigo: "sala" });
  session.handleMessage(1, join("prof", "4321", "sala"));
  session.handleMessage(2, join("ana", "1111"));
  return { session, sent };
}

describe("regras — o registro puro", () => {
  it("as regras do lite têm os padrões decididos com o usuário", () => {
    expect(regraDef("manter-inventario")?.padrao).toBe(true); // padrão de escola
    expect(regraDef("pvp")?.padrao).toBe(false);
    expect(regraDef("fome")?.padrao).toBe(true);
    expect(regraDef("inexistente")).toBeUndefined();
    // toda regra tem ajuda em português de professor (é o que o /regra mostra)
    for (const r of REGRAS) expect(r.ajuda.length).toBeGreaterThan(20);
  });

  it("valorRegra cai no padrão do registro quando o mundo não guardou nada", () => {
    const vazio = new Map<string, boolean>();
    expect(valorRegra(vazio, "pvp")).toBe(false);
    expect(valorRegra(vazio, "fome")).toBe(true);
    expect(valorRegra(new Map([["pvp", true]]), "pvp")).toBe(true);
    expect(valorRegra(vazio, "regra-que-não-existe")).toBe(false);
  });

  it("parseRegras é defensivo: nome desconhecido e valor não-booleano são pulados", () => {
    const m = parseRegras({ pvp: true, fome: "sim", inventado: true, "manter-inventario": false });
    expect([...m]).toEqual([
      ["pvp", true],
      ["manter-inventario", false],
    ]);
    for (const lixo of [null, undefined, 3, "pvp", [1, 2]]) {
      expect(parseRegras(lixo).size).toBe(0);
    }
  });

  it("o save guarda SÓ o que difere do padrão (mundo intocado não ganha campo)", () => {
    expect(regrasParaSave(new Map())).toBeUndefined();
    expect(regrasParaSave(new Map([["fome", true]]))).toBeUndefined(); // já é o padrão
    expect(regrasParaSave(new Map([["pvp", true]]))).toEqual({ pvp: true });
  });
});

describe("/regra — o comando genérico (§🍖 F1)", () => {
  it("sem argumento lista todas com o valor do mundo", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/regra"));
    const txt = ultimaChat(sent, 1) ?? "";
    expect(txt).toContain("manter-inventario: ligada");
    expect(txt).toContain("pvp: desligada");
    expect(txt).toContain("fome: ligada");
  });

  it("com o nome mostra o valor, o padrão e o que ela faz", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/regra manter-inventario"));
    const txt = ultimaChat(sent, 1) ?? "";
    expect(txt).toContain("está ligada");
    expect(txt).toContain("MANTÉM");
  });

  it("o professor liga e desliga; o aluno só consulta", () => {
    const { session, sent } = turma();
    session.handleMessage(2, cmd("/regra pvp ligar"));
    expect(ultimaChat(sent, 2) ?? "").toContain("Somente o professor");
    expect(session.toSave().regras).toBeUndefined();

    session.handleMessage(2, cmd("/regra pvp"));
    expect(ultimaChat(sent, 2) ?? "").toContain("desligada");

    session.handleMessage(1, cmd("/regra pvp ligar"));
    expect(ultimaChat(sent, 1) ?? "").toContain("Regra pvp ligada");
    expect(session.toSave().regras).toEqual({ pvp: true });
  });

  it("voltar ao padrão limpa o campo do save", () => {
    const { session } = turma();
    session.handleMessage(1, cmd("/regra fome desligar"));
    expect(session.toSave().regras).toEqual({ fome: false });
    session.handleMessage(1, cmd("/regra fome ligar"));
    expect(session.toSave().regras).toBeUndefined();
  });

  it("recusa nome e argumento inválidos sem gravar nada", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/regra inventada ligar"));
    expect(ultimaChat(sent, 1) ?? "").toContain('Não existe a regra "inventada"');
    session.handleMessage(1, cmd("/regra pvp talvez"));
    expect(ultimaChat(sent, 1) ?? "").toContain("Uso: /regra pvp ligar|desligar");
    expect(session.toSave().regras).toBeUndefined();
  });

  it("§🍖 F7: NENHUMA regra é pendente hoje — a `pvp` foi a última a ganhar mecânica", () => {
    // o aviso "só passa a valer quando a mecânica existir" existe pra o
    // professor não achar que ligou e o jogo ignorou. Com o F7, nenhuma regra
    // do registro precisa dele — e ligar a pvp não pode mais avisar isso.
    for (const r of REGRAS) expect(r.pendente).toBeUndefined();
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/regra pvp ligar"));
    expect(ultimaChat(sent, 1) ?? "").not.toContain("mecânica correspondente");
  });

  it("as regras sobrevivem ao salvar e recarregar o .ljw", () => {
    const { session } = turma();
    session.handleMessage(1, cmd("/regra pvp ligar"));
    session.handleMessage(1, cmd("/regra manter-inventario desligar"));
    const salvo = decodeSave(encodeSave(session.world, session.toSave()));
    expect(salvo.regras).toEqual({ "manter-inventario": false, pvp: true });

    const { session: s2, sent } = turma(salvo);
    s2.handleMessage(1, cmd("/regra"));
    const txt = ultimaChat(sent, 1) ?? "";
    expect(txt).toContain("manter-inventario: desligada");
    expect(txt).toContain("pvp: ligada");
  });

  it("save com regra desconhecida ou valor errado degrada pro padrão", () => {
    const save = baseSave();
    (save as { regras?: unknown }).regras = { pvp: "sim", inventada: true };
    expect(decodeSave(encodeSave(save.world, save)).regras).toBeUndefined();
  });
});
