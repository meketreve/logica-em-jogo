import { describe, expect, it } from "vitest";
import { PLAYER_REACH } from "./constants";
import { parseClientMessage, parseServerMessage } from "./protocol";
import { raycastJogador } from "./raycast";
import { type SaveData, decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { DANO_PVP, TICKS_ENTRE_ATAQUES, VIDA_MAX, textoDaMorte } from "./sobrevivencia";

/**
 * §🍖 F7 — pvp (2026-08-05).
 *
 * O que estes testes protegem, e por quê: o soco é a primeira ação do jogo em
 * que um aluno mexe na vida de OUTRO, então tudo que decide se ele vale mora no
 * servidor — regra do mundo, modo dos DOIS, alcance, cooldown e mundo de aula.
 * O cliente só manda `atacar {alvo}`.
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
const atacar = (alvo: number) => JSON.stringify({ type: "atacar", alvo });

function ultimaVida(sent: Sent, clientId: number) {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "vida") return m;
  }
  return null;
}

function ultimaChat(sent: Sent, clientId: number): string | null {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "chat") return m.text;
  }
  return null;
}

/** Todos os `gesto` que um clientId recebeu, na ordem em que chegaram. */
function gestosDe(sent: Sent, clientId: number): { id: number; gesto: string }[] {
  const out: { id: number; gesto: string }[] = [];
  for (const s of sent) {
    if (s.clientId !== clientId) continue;
    const m = parseServerMessage(s.data as string);
    if (m?.type === "gesto") out.push({ id: m.id, gesto: m.gesto });
  }
  return out;
}

function ultimaModo(sent: Sent, clientId: number) {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "modo") return m;
  }
  return null;
}

/** Todas as falas do servidor pra TODO mundo (pra provar broadcast). */
function chatsDe(sent: Sent, clientId: number): string[] {
  const out: string[] = [];
  for (const s of sent) {
    if (s.clientId !== clientId) continue;
    const m = parseServerMessage(s.data as string);
    if (m?.type === "chat") out.push(m.text);
  }
  return out;
}

function baseSave(opts: { somenteLeitura?: boolean } = {}): SaveData {
  const { send } = collect();
  const s0 = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala", ...opts });
  return decodeSave(encodeSave(s0.world, s0.toSave()));
}

/**
 * Professor (1) + ana (2) + bia (3) num mundo de SOBREVIVÊNCIA, todos no mesmo
 * ponto de spawn (distância 0 = dentro do alcance). O pvp começa desligado,
 * como manda o padrão do registro.
 */
function turma(save: SaveData = baseSave(), opts: { somenteLeitura?: boolean } = {}) {
  save.modo = "sobrevivencia";
  const { sent, send } = collect();
  const session = new GameSession(send, { restore: save, codigo: "sala", ...opts });
  session.handleMessage(1, join("prof", "4321", "sala"));
  session.handleMessage(2, join("ana", "1111"));
  session.handleMessage(3, join("bia", "2222"));
  return { session, sent };
}

/** Move um cliente pra uma posição absoluta (o alcance do soco sai daqui). */
function mover(session: GameSession, clientId: number, x: number, y: number, z: number): void {
  session.handleMessage(clientId, JSON.stringify({ type: "move", x, y, z, yaw: 0, pitch: 0 }));
}

/** Passa `n` ticks (o cooldown do soco é contado em ticks). */
function ticks(session: GameSession, n: number): void {
  for (let i = 0; i < n; i++) session.tick();
}

describe("§🍖 F7 — o protocolo do soco", () => {
  it("`atacar` só passa com alvo inteiro (parse defensivo dos dois lados)", () => {
    expect(parseClientMessage(atacar(7))).toEqual({ type: "atacar", alvo: 7 });
    for (const lixo of ['{"type":"atacar"}', '{"type":"atacar","alvo":"2"}', '{"type":"atacar","alvo":1.5}']) {
      expect(parseClientMessage(lixo)).toBeNull();
    }
  });

  it("o `modo` carrega o pvp do mundo — e host antigo (sem o campo) vira desligado", () => {
    expect(parseServerMessage('{"type":"modo","efetivo":"sobrevivencia","pvp":true}')).toEqual({
      type: "modo",
      efetivo: "sobrevivencia",
      pvp: true,
    });
    // sem o campo a mensagem NÃO se perde: ela ainda decide o modo
    expect(parseServerMessage('{"type":"modo","efetivo":"criativo"}')).toEqual({
      type: "modo",
      efetivo: "criativo",
    });
    // valor de tipo errado é descartado como diagnóstico, não derruba a msg
    expect(parseServerMessage('{"type":"modo","efetivo":"criativo","pvp":"sim"}')).toEqual({
      type: "modo",
      efetivo: "criativo",
    });
  });
});

describe("§🍖 F7 — a mira em jogador (pura)", () => {
  const alvos = [{ id: 2, x: 0, y: 0, z: 3 }];

  it("acerta quem está na frente e devolve a distância", () => {
    const h = raycastJogador(0, 1.6, 0, 0, 0, 1, alvos, PLAYER_REACH);
    expect(h?.id).toBe(2);
    // a caixa tem 0,6 de largura: a face de entrada fica em z = 3 − 0,3
    expect(h?.dist).toBeCloseTo(2.7, 5);
  });

  it("erra quem está fora da caixa, atrás das costas ou além do alcance", () => {
    expect(raycastJogador(0, 1.6, 0, 0, 0, 1, [{ id: 2, x: 4, y: 0, z: 3 }], PLAYER_REACH)).toBeNull();
    expect(raycastJogador(0, 1.6, 0, 0, 0, -1, alvos, PLAYER_REACH)).toBeNull();
    expect(raycastJogador(0, 1.6, 0, 0, 0, 1, [{ id: 2, x: 0, y: 0, z: 30 }], PLAYER_REACH)).toBeNull();
  });

  it("mira acima da cabeça NÃO acerta (a caixa tem altura de jogador)", () => {
    expect(raycastJogador(0, 1.6, 0, 0, 1, 0, alvos, PLAYER_REACH)).toBeNull();
  });

  it("com dois na linha, devolve o MAIS PRÓXIMO", () => {
    const h = raycastJogador(0, 1.6, 0, 0, 0, 1, [
      { id: 3, x: 0, y: 0, z: 4 },
      { id: 2, x: 0, y: 0, z: 2 },
    ], PLAYER_REACH);
    expect(h?.id).toBe(2);
  });
});

describe("§🍖 F7 — o servidor decide o soco", () => {
  it("com o pvp DESLIGADO ninguém apanha, e quem bateu é avisado (com freio)", () => {
    const { session, sent } = turma();
    session.handleMessage(2, atacar(3));
    expect(ultimaVida(sent, 3)?.vida ?? VIDA_MAX).toBe(VIDA_MAX);
    expect(ultimaChat(sent, 2) ?? "").toContain("desligado neste mundo");

    // o freio: socar de novo na mesma janela não repete o aviso
    const antes = chatsDe(sent, 2).length;
    session.handleMessage(2, atacar(3));
    expect(chatsDe(sent, 2).length).toBe(antes);
  });

  it("ligado, o soco tira um coração e a vítima recebe a causa `pvp`", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/pvp ligar"));
    session.handleMessage(2, atacar(3));
    const v = ultimaVida(sent, 3);
    expect(v?.vida).toBe(VIDA_MAX - DANO_PVP);
    expect(v?.causa).toBe("pvp");
  });

  it("o cooldown segura o clique repetido: 2 socos seguidos = 1 coração", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/pvp ligar"));
    session.handleMessage(2, atacar(3));
    session.handleMessage(2, atacar(3)); // no MESMO tick: recusado
    expect(ultimaVida(sent, 3)?.vida).toBe(VIDA_MAX - DANO_PVP);
    ticks(session, TICKS_ENTRE_ATAQUES);
    session.handleMessage(2, atacar(3));
    expect(ultimaVida(sent, 3)?.vida).toBe(VIDA_MAX - DANO_PVP * 2);
  });

  it("de longe não alcança (o servidor mede a distância entre os dois)", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/pvp ligar"));
    const s = session.spawn;
    mover(session, 3, s.x + 20, s.y, s.z);
    session.handleMessage(2, atacar(3));
    expect(ultimaVida(sent, 3)?.vida ?? VIDA_MAX).toBe(VIDA_MAX);
    // e volta a valer quando ela chega perto
    mover(session, 3, s.x + 1, s.y, s.z);
    session.handleMessage(2, atacar(3));
    expect(ultimaVida(sent, 3)?.vida).toBe(VIDA_MAX - DANO_PVP);
  });

  it("bater em si mesmo e bater em quem não existe são no-op", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/pvp ligar"));
    session.handleMessage(2, atacar(2));
    session.handleMessage(2, atacar(99));
    expect(ultimaVida(sent, 2)?.vida ?? VIDA_MAX).toBe(VIDA_MAX);
  });

  it("quem está em CRIATIVO não bate nem apanha (o professor supervisiona em paz)", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/pvp ligar"));
    session.handleMessage(1, cmd("/modo criativo prof"));
    // o professor em criativo soca: nada acontece
    session.handleMessage(1, atacar(2));
    expect(ultimaVida(sent, 2)?.vida ?? VIDA_MAX).toBe(VIDA_MAX);
    // e ele também não apanha
    session.handleMessage(2, atacar(1));
    expect(ultimaVida(sent, 1)?.vida ?? VIDA_MAX).toBe(VIDA_MAX);
  });

  it("mata pelo mesmo caminho de sempre: a turma vê QUEM derrubou e a vítima volta ao spawn", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/pvp ligar"));
    const s = session.spawn;
    mover(session, 3, s.x + 1, s.y, s.z);
    // 10 socos de 2 pontos = 20 = vida cheia
    for (let i = 0; i < VIDA_MAX / DANO_PVP; i++) {
      session.handleMessage(2, atacar(3));
      ticks(session, TICKS_ENTRE_ATAQUES);
    }
    // o chat da TURMA (o professor precisa ver) nomeia quem bateu
    expect(chatsDe(sent, 1)).toContain(textoDaMorte("bia", "pvp", "ana"));
    expect(textoDaMorte("bia", "pvp", "ana")).toContain("ana");
    // respawn: vida cheia de novo
    expect(ultimaVida(sent, 3)?.vida).toBe(VIDA_MAX);
  });

  it("morrer de pvp obedece a `manter-inventario`, sem código novo", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/pvp ligar"));
    session.handleMessage(1, cmd("/regra manter-inventario desligar"));
    session.handleMessage(1, cmd("/dar bia 1 10")); // 10 gramas na mochila da bia
    for (let i = 0; i < VIDA_MAX / DANO_PVP; i++) {
      session.handleMessage(2, atacar(3));
      ticks(session, TICKS_ENTRE_ATAQUES);
    }
    // a mochila sumiu na morte (a regra decidiu; o pvp não sabe de inventário)
    for (let i = sent.length - 1; i >= 0; i--) {
      if (sent[i]?.clientId !== 3) continue;
      const m = parseServerMessage(sent[i]?.data as string);
      if (m?.type !== "inventario") continue;
      expect(m.slots.every((s) => s.id === 0 || s.qtd === 0)).toBe(true);
      break;
    }
  });
});

describe("2026-09-03 — o gesto de bater (visual, pra turma inteira ver o soco)", () => {
  it("soco válido manda `gesto bater` pra TODO MUNDO, inclusive o próprio atacante", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/pvp ligar"));
    session.handleMessage(2, atacar(3));
    for (const quem of [1, 2, 3]) {
      expect(gestosDe(sent, quem)).toEqual([{ id: 2, gesto: "bater" }]);
    }
  });

  it("o braço balança MESMO com o pvp desligado — só o dano é recusado", () => {
    const { session, sent } = turma();
    session.handleMessage(2, atacar(3)); // pvp começa desligado (padrão)
    expect(gestosDe(sent, 1)).toEqual([{ id: 2, gesto: "bater" }]);
    expect(ultimaVida(sent, 3)?.vida ?? VIDA_MAX).toBe(VIDA_MAX); // mas ninguém apanhou
  });

  it("bater em si mesmo ou em quem não existe não manda gesto nenhum", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/pvp ligar"));
    session.handleMessage(2, atacar(2));
    session.handleMessage(2, atacar(99));
    expect(gestosDe(sent, 1)).toEqual([]);
  });
});

describe("§🍖 F7 — /pvp, o atalho do professor", () => {
  it("sem argumento QUALQUER UM consulta; mudar é só do professor", () => {
    const { session, sent } = turma();
    session.handleMessage(2, cmd("/pvp"));
    expect(ultimaChat(sent, 2) ?? "").toContain("desligado");
    session.handleMessage(2, cmd("/pvp ligar"));
    expect(ultimaChat(sent, 2) ?? "").toContain("Somente o professor");
    expect(session.toSave().regras).toBeUndefined();
  });

  it("escreve na MESMA regra do /regra (os dois não podem discordar)", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/pvp ligar"));
    expect(session.toSave().regras).toEqual({ pvp: true });
    session.handleMessage(1, cmd("/regra"));
    expect(ultimaChat(sent, 1) ?? "").toContain("pvp: ligada");
    // desligar volta ao padrão e LIMPA o campo do save
    session.handleMessage(1, cmd("/pvp desligar"));
    expect(session.toSave().regras).toBeUndefined();
  });

  it("a turma inteira é avisada, e o `modo` de cada um traz o pvp novo", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/pvp ligar"));
    expect(chatsDe(sent, 2).at(-1) ?? "").toContain("LIGOU o ataque");
    expect(ultimaModo(sent, 2)?.pvp).toBe(true);
    session.handleMessage(1, cmd("/regra pvp desligar"));
    expect(chatsDe(sent, 3).at(-1) ?? "").toContain("desligou o ataque");
    expect(ultimaModo(sent, 3)?.pvp).toBe(false);
  });

  it("argumento inválido não grava nada", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/pvp talvez"));
    expect(ultimaChat(sent, 1) ?? "").toContain("Uso: /pvp ligar");
    session.handleMessage(1, cmd("/pvp ligar agora"));
    expect(ultimaChat(sent, 1) ?? "").toContain("Uso: /pvp ligar");
    expect(session.toSave().regras).toBeUndefined();
  });

  it("mundo de AULA ignora o pvp — como já força o criativo", () => {
    const { session, sent } = turma(baseSave({ somenteLeitura: true }), { somenteLeitura: true });
    session.handleMessage(1, cmd("/pvp ligar"));
    expect(ultimaChat(sent, 1) ?? "").toContain("mundo de aula");
    expect(session.toSave().regras).toBeUndefined();
    session.handleMessage(2, atacar(3));
    expect(ultimaVida(sent, 3)).toBeNull(); // ninguém apanhou (nem há vida: é criativo)
    expect(ultimaChat(sent, 2) ?? "").toContain("ninguém se ataca");
  });

  it("o comando aparece na lista do comando desconhecido (senão ninguém o descobre)", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/naoexiste"));
    expect(ultimaChat(sent, 1) ?? "").toContain("/pvp");
  });
});
