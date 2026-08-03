import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { parseServerMessage } from "./protocol";
import { type SaveData, decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import {
  DANO_AFOGAMENTO,
  DANO_FOME,
  EXAUSTAO_POR_BLOCO_ANDADO,
  EXAUSTAO_POR_EDICAO,
  EXAUSTAO_POR_PONTO,
  EXAUSTAO_POR_REGEN,
  FOLEGO_TICKS,
  FOME_MAX,
  FOME_PARA_REGENERAR,
  TICKS_POR_AFOGAMENTO,
  TICKS_POR_DANO_FOME,
  TICKS_POR_REGEN,
  VIDA_MAX,
  VIDA_MINIMA_POR_FOME,
  aplicarDano,
  curar,
  danoDeQueda,
  estaVivo,
  gastarEsforco,
  novoEstadoVital,
  parseCausaDano,
  textoDaMorte,
  tickFolego,
  tickFome,
  tickRegen,
} from "./sobrevivencia";
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
const move = (x: number, y: number, z: number) =>
  JSON.stringify({ type: "move", x, y, z, yaw: 0, pitch: 0 });

function ultimaVida(sent: Sent, clientId: number) {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "vida") return m;
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

/** Professor (1) + ana (2). `modo` decide o padrão do mundo. */
function turma(modo: "criativo" | "sobrevivencia" = "sobrevivencia", save = baseSave()) {
  save.modo = modo;
  const { sent, send } = collect();
  const session = new GameSession(send, { restore: save, codigo: "sala" });
  session.handleMessage(1, join("prof", "4321", "sala"));
  session.handleMessage(2, join("ana", "1111"));
  return { session, sent };
}

/** Anda `blocos` no plano, um bloco por amostra (como o cliente a 10 Hz). */
function andar(session: GameSession, clientId: number, blocos: number): void {
  const s = session.spawn;
  session.handleMessage(clientId, move(s.x, s.y, s.z));
  for (let i = 1; i <= blocos; i++) {
    session.handleMessage(clientId, move(s.x + (i % 2), s.y, s.z));
  }
}

/** Cai de `altura` blocos acima do spawn e pousa nele. */
function cair(session: GameSession, clientId: number, altura: number): void {
  const s = session.spawn;
  session.handleMessage(clientId, move(s.x, s.y, s.z)); // apoiado: zera o pico
  session.handleMessage(clientId, move(s.x, s.y + altura, s.z)); // no ar
  session.handleMessage(clientId, move(s.x, s.y, s.z)); // pousa
}

describe("sobrevivencia — módulo puro", () => {
  it("a escala é a do Minecraft: 20 pontos, meio coração por ponto", () => {
    const e = novoEstadoVital();
    expect(e.vida).toBe(VIDA_MAX);
    expect(VIDA_MAX).toBe(20);
    expect(estaVivo(e)).toBe(true);
  });

  it("aplicarDano é a única porta: clampa em 0 e avisa a MORTE uma vez só", () => {
    const e = novoEstadoVital();
    const r1 = aplicarDano(e, 6, "queda");
    expect(r1.estado.vida).toBe(14);
    expect(r1.aplicado).toBe(6);
    expect(r1.morreu).toBe(false);
    const r2 = aplicarDano(r1.estado, 99, "queda");
    expect(r2.estado.vida).toBe(0);
    expect(r2.aplicado).toBe(14); // só o que ainda havia
    expect(r2.morreu).toBe(true);
    // já morto não morre de novo (senão o respawn dispararia duas vezes)
    const r3 = aplicarDano(r2.estado, 5, "afogamento");
    expect(r3.aplicado).toBe(0);
    expect(r3.morreu).toBe(false);
    // dano zero/negativo não mexe em nada
    expect(aplicarDano(e, 0, "outro").estado).toBe(e);
    expect(aplicarDano(e, -3, "outro").aplicado).toBe(0);
  });

  it("curar nunca passa da vida cheia", () => {
    const ferido = aplicarDano(novoEstadoVital(), 15, "queda").estado;
    expect(curar(ferido, 3).vida).toBe(8);
    expect(curar(ferido, 99).vida).toBe(VIDA_MAX);
    expect(curar(ferido, 0)).toBe(ferido);
  });

  it("queda: 3 blocos de graça, meio coração por bloco acima disso", () => {
    expect(danoDeQueda(3)).toBe(0);
    expect(danoDeQueda(3.9)).toBe(0);
    expect(danoDeQueda(4)).toBe(1);
    expect(danoDeQueda(10)).toBe(7);
    // 23 blocos matam de vida cheia (é a conta do Minecraft)
    expect(danoDeQueda(23)).toBe(20);
    expect(danoDeQueda(-5)).toBe(0);
    expect(danoDeQueda(NaN)).toBe(0);
  });

  it("fôlego: 15 s de ar, depois 1 coração por segundo, e enche fora d'água", () => {
    let e = novoEstadoVital();
    for (let i = 0; i < FOLEGO_TICKS; i++) {
      const r = tickFolego(e, true);
      expect(r.dano).toBe(0);
      e = r.estado;
    }
    expect(e.folego).toBe(0);
    // primeiro dano só depois de mais TICKS_POR_AFOGAMENTO ticks
    let danos = 0;
    for (let i = 0; i < TICKS_POR_AFOGAMENTO * 3; i++) {
      const r = tickFolego(e, true);
      danos += r.dano;
      e = r.estado;
    }
    expect(danos).toBe(DANO_AFOGAMENTO * 3);
    // o contador NÃO cresce sem limite (fica na janela de um segundo)
    expect(e.folego).toBeGreaterThanOrEqual(-TICKS_POR_AFOGAMENTO);
    // sair da água enche o pulmão de uma vez
    expect(tickFolego(e, false).estado.folego).toBe(FOLEGO_TICKS);
  });

  it("regeneração passiva: 1 ponto a cada 4 s, só com fome alta e vida faltando", () => {
    let e = aplicarDano(novoEstadoVital(), 4, "queda").estado;
    for (let i = 0; i < TICKS_POR_REGEN - 1; i++) e = tickRegen(e);
    expect(e.vida).toBe(16);
    e = tickRegen(e);
    expect(e.vida).toBe(17);
    // fome baixa não regenera
    let faminto = aplicarDano(novoEstadoVital(), 4, "queda").estado;
    for (let i = 0; i < TICKS_POR_REGEN * 2; i++) {
      faminto = tickRegen(faminto, FOME_PARA_REGENERAR - 1);
    }
    expect(faminto.vida).toBe(16);
    // vida cheia não acumula contador
    expect(tickRegen(novoEstadoVital()).regenTicks).toBe(0);
    // levar dano ADIA a regeneração
    expect(aplicarDano({ ...e, regenTicks: 39 }, 1, "queda").estado.regenTicks).toBe(0);
  });

  it("parseCausaDano recusa o que não está na lista", () => {
    expect(parseCausaDano("queda")).toBe("queda");
    expect(parseCausaDano("lava")).toBeNull();
    expect(parseCausaDano(7)).toBeNull();
  });

  it("a morte tem texto por causa (o professor precisa ver o que houve)", () => {
    expect(textoDaMorte("ana", "queda")).toContain("ana");
    expect(textoDaMorte("ana", "afogamento")).toContain("ar");
  });
});

describe("protocolo — mensagem `vida`", () => {
  it("vida é obrigatória; causa/morreu/folego são opcionais e validados", () => {
    expect(parseServerMessage(JSON.stringify({ type: "vida", vida: 12 }))).toEqual({
      type: "vida",
      vida: 12,
    });
    expect(
      parseServerMessage(
        JSON.stringify({ type: "vida", vida: 0, causa: "queda", morreu: true, folego: 30 }),
      ),
    ).toEqual({ type: "vida", vida: 0, causa: "queda", morreu: true, folego: 30 });
    // host antigo mandando causa desconhecida NÃO derruba a mensagem inteira
    expect(parseServerMessage(JSON.stringify({ type: "vida", vida: 8, causa: "lava" }))).toEqual({
      type: "vida",
      vida: 8,
    });
    expect(parseServerMessage(JSON.stringify({ type: "vida" }))).toBeNull();
  });
});

describe("§🍖 F2 — vida na sessão", () => {
  it("em sobrevivência o join manda a vida; em criativo não manda nada", () => {
    const { sent } = turma("sobrevivencia");
    expect(ultimaVida(sent, 2)?.vida).toBe(VIDA_MAX);
    const { sent: criativo } = turma("criativo");
    expect(ultimaVida(criativo, 2)).toBeNull();
  });

  it("queda longa machuca, e a conta é a do módulo puro", () => {
    const { session, sent } = turma("sobrevivencia");
    cair(session, 2, 20);
    expect(ultimaVida(sent, 2)).toMatchObject({ vida: VIDA_MAX - danoDeQueda(20), causa: "queda" });
  });

  it("queda curta não machuca (3 blocos de graça)", () => {
    const { session, sent } = turma("sobrevivencia");
    cair(session, 2, 3);
    expect(ultimaVida(sent, 2)?.vida).toBe(VIDA_MAX);
  });

  it("em CRIATIVO a mesma queda não tira nada", () => {
    const { session, sent } = turma("criativo");
    cair(session, 2, 30);
    expect(ultimaVida(sent, 2)).toBeNull();
  });

  it("queda que mata devolve ao spawn, cheio, e avisa a turma", () => {
    const { session, sent } = turma("sobrevivencia");
    cair(session, 2, 40);
    // a mensagem da morte vem antes; a última `vida` já é a do respawn
    const daMorte = sent
      .map((s) => (s.clientId === 2 ? parseServerMessage(s.data as string) : null))
      .find((m) => m?.type === "vida" && m.morreu);
    expect(daMorte).toMatchObject({ vida: 0, causa: "queda", morreu: true });
    expect(ultimaVida(sent, 2)?.vida).toBe(VIDA_MAX);
    // o professor (e a turma) veem no chat
    expect(chats(sent, 1).some((t) => t.includes("ana") && t.includes("caiu"))).toBe(true);
    // e o jogador foi teleportado de volta pro spawn
    const tp = sent
      .map((s) => (s.clientId === 2 ? parseServerMessage(s.data as string) : null))
      .filter((m) => m?.type === "teleport")
      .at(-1);
    expect(tp).toMatchObject({ x: session.spawn.x, y: session.spawn.y, z: session.spawn.z });
  });

  it("cair na ÁGUA não machuca (a água amortece)", () => {
    const { session, sent } = turma("sobrevivencia");
    const s = session.spawn;
    const bx = Math.floor(s.x), bz = Math.floor(s.z);
    const yAgua = Math.floor(s.y) + 10;
    setBlock(session.world, bx, yAgua, bz, BlockId.Agua);
    session.handleMessage(2, move(s.x, s.y, s.z));
    session.handleMessage(2, move(s.x, s.y + 30, s.z));
    session.handleMessage(2, move(s.x, yAgua + 0.2, s.z)); // entra na água
    session.handleMessage(2, move(s.x, s.y, s.z)); // e desce até o chão
    expect(ultimaVida(sent, 2)?.vida).toBe(VIDA_MAX);
  });

  it("teleporte não é queda (nem o do /tp, nem o do respawn)", () => {
    const { session, sent } = turma("sobrevivencia");
    const s = session.spawn;
    session.handleMessage(2, move(s.x, s.y + 40, s.z)); // lá no alto
    session.handleMessage(1, cmd("/tp ana")); // professor puxa a ana pra si
    session.handleMessage(2, move(s.x, s.y, s.z)); // ela pousa
    expect(ultimaVida(sent, 2)?.vida).toBe(VIDA_MAX);
  });

  it("afogamento: só depois do fôlego acabar, e para ao sair da água", () => {
    const { session, sent } = turma("sobrevivencia");
    const s = session.spawn;
    const bx = Math.floor(s.x), bz = Math.floor(s.z);
    // enche a coluna da cabeça de água e deixa a ana lá dentro
    for (let dy = 0; dy <= 3; dy++) setBlock(session.world, bx, Math.floor(s.y) + dy, bz, BlockId.Agua);
    session.handleMessage(2, move(s.x, s.y, s.z));
    for (let i = 0; i < FOLEGO_TICKS; i++) session.tick();
    expect(ultimaVida(sent, 2)?.vida).toBe(VIDA_MAX); // ainda tem ar
    for (let i = 0; i < TICKS_POR_AFOGAMENTO * 2; i++) session.tick();
    const ferida = ultimaVida(sent, 2);
    expect(ferida?.causa).toBe("afogamento");
    expect(ferida?.vida).toBe(VIDA_MAX - DANO_AFOGAMENTO * 2);
  });

  it("a vida MACHUCADA vai pro save; a cheia não polui o roster", () => {
    const { session } = turma("sobrevivencia");
    cair(session, 2, 20);
    const meta = session.toSave();
    const ana = meta.roster.find((p) => p.name === "ana");
    const prof = meta.roster.find((p) => p.name === "prof");
    expect(ana?.vida).toBe(VIDA_MAX - danoDeQueda(20));
    expect(prof?.vida).toBeUndefined();

    // e volta machucada no mundo recarregado
    const salvo = decodeSave(encodeSave(session.world, meta));
    const { sent } = turma("sobrevivencia", salvo);
    expect(ultimaVida(sent, 2)?.vida).toBe(VIDA_MAX - danoDeQueda(20));
  });

  it("save com vida doente (0, negativa, gigante, texto) degrada pra vida cheia", () => {
    const save = baseSave();
    save.roster = [
      { name: "ana", x: 1, y: 20, z: 1, yaw: 0, pitch: 0, vida: 0 },
      { name: "bia", x: 1, y: 20, z: 1, yaw: 0, pitch: 0, vida: -3 },
      { name: "caio", x: 1, y: 20, z: 1, yaw: 0, pitch: 0, vida: 999 },
    ];
    const lido = decodeSave(encodeSave(save.world, save));
    for (const p of lido.roster) expect(p.vida).toBeUndefined();
  });

  it("trocar pra sobrevivência no meio do voo não cobra a altura acumulada", () => {
    const { session, sent } = turma("criativo");
    const s = session.spawn;
    session.handleMessage(2, move(s.x, s.y + 50, s.z)); // voando alto em criativo
    session.handleMessage(1, cmd("/modo sobrevivencia all"));
    session.handleMessage(2, move(s.x, s.y, s.z)); // e pousa
    expect(ultimaVida(sent, 2)?.vida).toBe(VIDA_MAX);
  });
});

describe("§🍖 F3 — fome (módulo puro)", () => {
  it("esforço vira ponto de fome só quando FECHA a conta, e o resto fica guardado", () => {
    const e = novoEstadoVital();
    // metade do necessário: a barra não mexe, mas o esforço não se perde
    const meio = gastarEsforco(e, EXAUSTAO_POR_PONTO / 2);
    expect(meio.fome).toBe(FOME_MAX);
    expect(meio.exaustao).toBe(EXAUSTAO_POR_PONTO / 2);
    const fecha = gastarEsforco(meio, EXAUSTAO_POR_PONTO / 2);
    expect(fecha.fome).toBe(FOME_MAX - 1);
    expect(fecha.exaustao).toBe(0);
    // um esforço gigante gasta VÁRIOS pontos de uma vez (e nunca passa do zero)
    expect(gastarEsforco(e, EXAUSTAO_POR_PONTO * 3).fome).toBe(FOME_MAX - 3);
    expect(gastarEsforco(e, EXAUSTAO_POR_PONTO * 999).fome).toBe(0);
    // esforço nulo/doente não mexe em nada
    expect(gastarEsforco(e, 0)).toBe(e);
    expect(gastarEsforco(e, -1)).toBe(e);
    expect(gastarEsforco(e, NaN)).toBe(e);
  });

  it("a régua do dreno: 400 blocos andados ou 200 blocos editados = 1 ponto", () => {
    expect(EXAUSTAO_POR_PONTO / EXAUSTAO_POR_BLOCO_ANDADO).toBe(400);
    expect(EXAUSTAO_POR_PONTO / EXAUSTAO_POR_EDICAO).toBe(200);
  });

  it("a barra cheia não dói; no zero dói a cada 4 s", () => {
    let e = novoEstadoVital();
    for (let i = 0; i < TICKS_POR_DANO_FOME * 2; i++) {
      const r = tickFome(e);
      expect(r.dano).toBe(0); // barra cheia: inanição nem começa
      e = r.estado;
    }
    e = { ...e, fome: 0 };
    let danos = 0;
    for (let i = 0; i < TICKS_POR_DANO_FOME * 3; i++) {
      const r = tickFome(e);
      danos += r.dano;
      e = r.estado;
    }
    expect(danos).toBe(DANO_FOME * 3);
  });

  it("a fome ENFRAQUECE, não mata: o dano para em 3 corações", () => {
    let e: ReturnType<typeof novoEstadoVital> = { ...novoEstadoVital(), fome: 0 };
    for (let i = 0; i < TICKS_POR_DANO_FOME * 40; i++) {
      const r = tickFome(e);
      e = r.estado;
      if (r.dano > 0) e = aplicarDano(e, r.dano, "fome").estado;
    }
    expect(e.vida).toBe(VIDA_MINIMA_POR_FOME);
    expect(estaVivo(e)).toBe(true);
  });

  it("comer volta a existir no F6 — por ora o zero da barra é estado normal", () => {
    // o contador de inanição zera assim que a barra deixa de estar vazia (senão
    // o primeiro bocado ainda levaria um dano atrasado)
    const faminto = tickFome({ ...novoEstadoVital(), fome: 0 }).estado;
    expect(faminto.fomeTicks).toBe(1);
    expect(tickFome({ ...faminto, fome: 3 }).estado.fomeTicks).toBe(0);
  });
});

describe("§🍖 F3 — fome na sessão", () => {
  it("andar 400 blocos custa 1 ponto, e o cliente recebe a fome na mensagem `vida`", () => {
    const { session, sent } = turma("sobrevivencia");
    expect(ultimaVida(sent, 2)?.fome).toBe(FOME_MAX); // veio no join
    andar(session, 2, 399);
    expect(ultimaVida(sent, 2)?.fome).toBe(FOME_MAX); // 3,99 de esforço: nada ainda
    andar(session, 2, 1);
    expect(ultimaVida(sent, 2)?.fome).toBe(FOME_MAX - 1);
  });

  it("editar bloco também cansa", () => {
    const { session, sent } = turma("sobrevivencia");
    andar(session, 2, 399); // 3,99 acumulados: falta um fio de esforço
    expect(ultimaVida(sent, 2)?.fome).toBe(FOME_MAX);
    // §🍖 F4: QUEBRAR, não colocar — colocar em sobrevivência exige ter o bloco
    // na mochila, e a cobrança de esforço é a mesma pros dois. O professor
    // materializa o alvo por teleoperação (`/bloco` não cansa ninguém).
    const alvo = { x: Math.floor(session.spawn.x), y: Math.floor(session.spawn.y) + 3, z: Math.floor(session.spawn.z) };
    session.handleMessage(1, cmd(`/bloco ${alvo.x} ${alvo.y} ${alvo.z} ${BlockId.Stone}`));
    expect(getBlock(session.world, alvo.x, alvo.y, alvo.z)).toBe(BlockId.Stone);
    session.handleMessage(2, JSON.stringify({ type: "break_block", ...alvo }));
    expect(getBlock(session.world, alvo.x, alvo.y, alvo.z)).toBe(BlockId.Air);
    expect(ultimaVida(sent, 2)?.fome).toBe(FOME_MAX - 1);
  });

  it("teleporte não é passo: o pico de queda zera e a fome não é cobrada", () => {
    const { session, sent } = turma("sobrevivencia");
    const s = session.spawn;
    // 3,99 acumulados e um salto gigante logo depois (o molde do respawn/`/tp`)
    andar(session, 2, 399);
    session.handleMessage(2, move(s.x + 500, s.y, s.z + 500));
    expect(ultimaVida(sent, 2)?.fome).toBe(FOME_MAX);
  });

  it("criativo não tem fome nenhuma — nem mensagem", () => {
    const { session, sent } = turma("criativo");
    andar(session, 2, 900);
    expect(ultimaVida(sent, 2)).toBeNull();
  });

  it("`/regra fome desligar`: a barra some do HUD e o esforço deixa de contar", () => {
    const { session, sent } = turma("sobrevivencia");
    session.handleMessage(1, cmd("/regra fome desligar"));
    // a turma recebe uma `vida` NOVA na hora, agora sem o campo fome
    expect(ultimaVida(sent, 2)?.fome).toBeUndefined();
    andar(session, 2, 900);
    expect(ultimaVida(sent, 2)?.fome).toBeUndefined();
    // e ligar de volta devolve a barra sem ninguém precisar reentrar
    session.handleMessage(1, cmd("/regra fome ligar"));
    expect(ultimaVida(sent, 2)?.fome).toBe(FOME_MAX);
  });

  it("com a regra desligada, quem já estava faminto volta a se regenerar", () => {
    const save = baseSave();
    save.modo = "sobrevivencia";
    save.roster = [{ name: "ana", x: 1, y: 20, z: 1, yaw: 0, pitch: 0, vida: 10, fome: 0 }];
    const { session, sent } = turma("sobrevivencia", decodeSave(encodeSave(save.world, save)));
    session.handleMessage(1, cmd("/regra fome desligar"));
    for (let i = 0; i < TICKS_POR_REGEN + 1; i++) session.tick();
    expect(ultimaVida(sent, 2)?.vida).toBe(11); // sararia? sara.
  });

  it("barra no zero: dói no tick, avisa a causa e PARA em 3 corações", () => {
    const save = baseSave();
    save.modo = "sobrevivencia";
    save.roster = [{ name: "ana", x: 1, y: 20, z: 1, yaw: 0, pitch: 0, fome: 0 }];
    const { session, sent } = turma("sobrevivencia", decodeSave(encodeSave(save.world, save)));
    for (let i = 0; i < TICKS_POR_DANO_FOME + 1; i++) session.tick();
    expect(ultimaVida(sent, 2)?.causa).toBe("fome");
    expect(ultimaVida(sent, 2)?.vida).toBe(VIDA_MAX - DANO_FOME);
    // e por mais que a aula demore, ninguém morre de fome enquanto não há comida
    for (let i = 0; i < TICKS_POR_DANO_FOME * 40; i++) session.tick();
    expect(ultimaVida(sent, 2)?.vida).toBe(VIDA_MINIMA_POR_FOME);
    expect(ultimaVida(sent, 2)?.morreu).toBeUndefined();
  });

  it("curar custa comida, e a fome baixa TRAVA a regeneração", () => {
    const save = baseSave();
    save.modo = "sobrevivencia";
    save.roster = [{ name: "ana", x: 1, y: 20, z: 1, yaw: 0, pitch: 0, vida: 10, fome: 19 }];
    const { session, sent } = turma("sobrevivencia", decodeSave(encodeSave(save.world, save)));
    for (let i = 0; i < TICKS_POR_REGEN * 6; i++) session.tick();
    // 3 pontos curados a EXAUSTAO_POR_REGEN cada = 9 de esforço = 2 pontos de
    // fome; com 17 a barra cai abaixo de FOME_PARA_REGENERAR e o corpo para
    expect(EXAUSTAO_POR_REGEN * 3).toBeGreaterThanOrEqual(EXAUSTAO_POR_PONTO * 2);
    expect(ultimaVida(sent, 2)?.vida).toBe(13);
    expect(ultimaVida(sent, 2)?.fome).toBe(FOME_PARA_REGENERAR - 1);
  });

  it("a fome FAMINTA vai pro save (inclusive zerada); a cheia não polui o roster", () => {
    const { session } = turma("sobrevivencia");
    andar(session, 2, 410); // com folga: 400 passos de 0,01 somam 3,99999… (float)
    const meta = session.toSave();
    expect(meta.roster.find((p) => p.name === "ana")?.fome).toBe(FOME_MAX - 1);
    expect(meta.roster.find((p) => p.name === "prof")?.fome).toBeUndefined();

    // fome ZERO é estado válido de jogo (diferente da vida zero, que seria morte)
    const save = baseSave();
    save.roster = [
      { name: "ana", x: 1, y: 20, z: 1, yaw: 0, pitch: 0, fome: 0 },
      { name: "bia", x: 1, y: 20, z: 1, yaw: 0, pitch: 0, fome: -2 },
      { name: "caio", x: 1, y: 20, z: 1, yaw: 0, pitch: 0, fome: 999 },
    ];
    const lido = decodeSave(encodeSave(save.world, save));
    expect(lido.roster.find((p) => p.name === "ana")?.fome).toBe(0);
    expect(lido.roster.find((p) => p.name === "bia")?.fome).toBeUndefined();
    expect(lido.roster.find((p) => p.name === "caio")?.fome).toBeUndefined();
  });
});
