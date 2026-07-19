import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { MAX_CHAT_LENGTH, SERVER_TICK_RATE } from "./constants";
import { decodeSnapshot, parseServerMessage } from "./protocol";
import { GameSession } from "./session";
import { findSpawnY, getBlock, setBlock } from "./world";

// Testes de MECÂNICA rodam com singleplayer: true (join sem PIN) — a
// identidade do cp9 tem bateria própria no describe do fim do arquivo.
const DIMS = { x: 2, z: 2, y: 2 };

function collect() {
  const sent: { clientId: number; data: string | ArrayBuffer }[] = [];
  return { sent, send: (clientId: number, data: string | ArrayBuffer) => sent.push({ clientId, data }) };
}

describe("GameSession (servidor autoritativo)", () => {
  it("join responde com spawn + world_snapshot idêntico ao mundo do servidor", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 99, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));

    expect(sent).toHaveLength(4); // spawn + snapshot + time (cp21) + boas-vindas
    expect(sent[0]?.clientId).toBe(1);
    expect(parseServerMessage(sent[0]?.data as string)).toEqual({
      // singleplayer: todo join é professor (cp9); papel viaja no spawn (cp11)
      type: "spawn", ...session.spawn, papel: "professor",
    });
    // sent[2] = hora do dia (cp21) — mundo novo nasce ao meio-dia, ciclo PARADO
    const hora = parseServerMessage(sent[2]?.data as string);
    if (hora?.type !== "time") throw new Error("esperava mensagem de hora");
    expect(hora).toEqual({ type: "time", hora: 12, ciclo: false });
    const welcome = parseServerMessage(sent[3]?.data as string);
    if (welcome?.type !== "chat") throw new Error("esperava chat de boas-vindas");
    expect(welcome.author).toBe("servidor");
    expect(welcome.text).toContain("ana#1");
    const snap = decodeSnapshot(sent[1]?.data as ArrayBuffer);
    expect(snap.seed).toBe(99);
    for (let i = 0; i < session.world.chunks.length; i++) {
      expect(snap.world.chunks[i]).toEqual(session.world.chunks[i]);
    }
    // amostra: mesmo bloco nas mesmas coordenadas
    expect(getBlock(snap.world, 5, 10, 5)).toBe(getBlock(session.world, 5, 10, 5));
  });

  it("mensagem inválida não derruba nem responde", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, singleplayer: true });
    session.handleMessage(1, "lixo");
    session.handleMessage(1, '{"type":"place_block"}');
    expect(sent).toHaveLength(0);
  });

  it("move só é aceito depois do join", () => {
    const { send } = collect();
    const session = new GameSession(send, { dims: DIMS, singleplayer: true });
    // sem join: não lança, só ignora
    session.handleMessage(1, JSON.stringify({ type: "move", x: 1, y: 2, z: 3, yaw: 0, pitch: 0 }));
    expect(session.tickCount).toBe(0);
  });

  it("emite debug_stats a cada SERVER_TICK_RATE ticks, só pra quem entrou", () => {
    const { sent, send } = collect();
    let t = 0;
    const session = new GameSession(send, { dims: DIMS, singleplayer: true, now: () => (t += 2) });
    session.handleMessage(7, JSON.stringify({ type: "join", name: "ana" }));
    sent.length = 0; // descarta o snapshot do join

    for (let i = 0; i < SERVER_TICK_RATE - 1; i++) session.tick();
    expect(sent).toHaveLength(0);

    session.tick();
    // janela cheia (1×/s): debug_stats E hora do dia (cp21) saem juntas
    const stats = sent
      .map((s) => parseServerMessage(s.data as string))
      .find((m) => m?.type === "debug_stats");
    if (stats?.type !== "debug_stats") throw new Error("esperava debug_stats");
    expect(stats.tps).toBe(SERVER_TICK_RATE);
    expect(stats.tickAvgMs).toBe(2); // relógio fake avança 2 ms por chamada
    expect(stats.tickMaxMs).toBe(2);
    expect(sent.some((s) => parseServerMessage(s.data as string)?.type === "time")).toBe(true);

    // janela zera: próximo lote só depois de mais SERVER_TICK_RATE ticks
    sent.length = 0;
    session.tick();
    expect(sent).toHaveLength(0);
  });

  it("place/break: aplica, vira block_changed pra TODOS; inválido é ignorado", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    session.handleMessage(2, JSON.stringify({ type: "join", name: "bia" }));
    const world = session.world;
    const sx = Math.floor(world.sizeX / 2);
    const sz = Math.floor(world.sizeZ / 2);
    const spawnY = findSpawnY(world, sx, sz);
    sent.length = 0;

    // quebra o bloco embaixo dos pés (sólido, ao alcance)
    const target = { x: sx, y: spawnY - 1, z: sz };
    expect(getBlock(world, target.x, target.y, target.z)).not.toBe(BlockId.Air);
    session.handleMessage(1, JSON.stringify({ type: "break_block", ...target }));
    expect(getBlock(world, target.x, target.y, target.z)).toBe(BlockId.Air);
    expect(sent).toHaveLength(2); // broadcast: ana E bia
    expect(sent.map((s) => s.clientId).sort()).toEqual([1, 2]);
    expect(parseServerMessage(sent[0]?.data as string)).toEqual({
      type: "block_changed", ...target, blockId: BlockId.Air,
    });
    sent.length = 0;

    // coloca de volta (célula agora é ar, ao alcance, não empareda ninguém)
    session.handleMessage(2, JSON.stringify({
      type: "place_block", ...target, blockId: BlockId.Cobblestone,
    }));
    expect(getBlock(world, target.x, target.y, target.z)).toBe(BlockId.Cobblestone);
    expect(sent).toHaveLength(2);
    sent.length = 0;

    // rejeições: tudo ignorado em silêncio, mundo intacto
    const before = getBlock(world, target.x, target.y, target.z);
    // place em célula sólida
    session.handleMessage(1, JSON.stringify({
      type: "place_block", ...target, blockId: BlockId.Stone,
    }));
    // blockId inválido (ar e desconhecido)
    session.handleMessage(1, JSON.stringify({
      type: "place_block", x: sx, y: spawnY + 3, z: sz, blockId: 0,
    }));
    session.handleMessage(1, JSON.stringify({
      type: "place_block", x: sx, y: spawnY + 3, z: sz, blockId: 200,
    }));
    // fora do alcance (chão do mundo, ≥16 blocos abaixo)
    session.handleMessage(1, JSON.stringify({ type: "break_block", x: sx, y: 0, z: sz }));
    // emparedar o próprio jogador (célula dos pés)
    session.handleMessage(1, JSON.stringify({
      type: "place_block", x: sx, y: spawnY, z: sz, blockId: BlockId.Stone,
    }));
    // sem join
    session.handleMessage(9, JSON.stringify({ type: "break_block", ...target }));
    expect(sent).toHaveLength(0);
    expect(getBlock(world, target.x, target.y, target.z)).toBe(before);
    expect(getBlock(world, sx, 0, sz)).not.toBe(BlockId.Air);
    expect(getBlock(world, sx, spawnY, sz)).toBe(BlockId.Air);
  });

  it("areia cai no tick do servidor: 1 célula por tick, em cascata, e para no chão", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    const world = session.world;
    const sx = Math.floor(world.sizeX / 2);
    const sz = Math.floor(world.sizeZ / 2);
    const h = findSpawnY(world, sx, sz); // primeira célula de ar da coluna

    // areia flutuando 2 células acima do topo (h+2); h e h+1 ficam de ar
    session.handleMessage(1, JSON.stringify({
      type: "place_block", x: sx, y: h + 2, z: sz, blockId: BlockId.Sand,
    }));
    sent.length = 0;

    // tick 1: desce pra h+1 (2 block_changed: areia embaixo, ar na origem)
    session.tick();
    expect(getBlock(world, sx, h + 1, sz)).toBe(BlockId.Sand);
    expect(getBlock(world, sx, h + 2, sz)).toBe(BlockId.Air);
    const msgs1 = sent.map((s) => parseServerMessage(s.data as string));
    expect(msgs1).toEqual([
      { type: "block_changed", x: sx, y: h + 1, z: sz, blockId: BlockId.Sand },
      { type: "block_changed", x: sx, y: h + 2, z: sz, blockId: BlockId.Air },
    ]);
    sent.length = 0;

    // tick 2: desce pra h (pousa no terreno)
    session.tick();
    expect(getBlock(world, sx, h, sz)).toBe(BlockId.Sand);
    expect(getBlock(world, sx, h + 1, sz)).toBe(BlockId.Air);
    sent.length = 0;

    // tick 3: estável — nenhuma mensagem
    session.tick();
    expect(sent).toHaveLength(0);

    // quebra o suporte de baixo (terreno) → areia cai em cadeia no próximo tick
    session.handleMessage(1, JSON.stringify({
      type: "break_block", x: sx, y: h - 1, z: sz,
    }));
    sent.length = 0;
    session.tick();
    expect(getBlock(world, sx, h - 1, sz)).toBe(BlockId.Sand);
    expect(getBlock(world, sx, h, sz)).toBe(BlockId.Air);
  });

  it("bloco sem regra não cai; place fora do mundo é rejeitado (bug-004)", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    const world = session.world;
    const sx = Math.floor(world.sizeX / 2);
    const sz = Math.floor(world.sizeZ / 2);
    const h = findSpawnY(world, sx, sz);

    // pedregulho flutuando: sem regra, fica parado
    session.handleMessage(1, JSON.stringify({
      type: "place_block", x: sx, y: h + 2, z: sz, blockId: BlockId.Cobblestone,
    }));
    sent.length = 0;
    session.tick();
    session.tick();
    expect(sent).toHaveLength(0);
    expect(getBlock(world, sx, h + 2, sz)).toBe(BlockId.Cobblestone);

    // acima do teto do mundo, ao alcance (move é aceito sem validação física ainda)
    session.handleMessage(1, JSON.stringify({
      type: "move", x: sx + 0.5, y: world.sizeY - 2, z: sz + 0.5, yaw: 0, pitch: 0,
    }));
    session.handleMessage(1, JSON.stringify({
      type: "place_block", x: sx, y: world.sizeY, z: sz, blockId: BlockId.Stone,
    }));
    expect(sent).toHaveLength(0);
  });

  it("disconnect remove o jogador dos broadcasts", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    sent.length = 0;
    session.handleDisconnect(1);
    for (let i = 0; i < SERVER_TICK_RATE; i++) session.tick();
    expect(sent).toHaveLength(0);
  });

  it("spawn é FIXO: escavar a coluna do spawn não muda onde o próximo nasce (bug-010)", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    const first = parseServerMessage(sent[0]?.data as string);
    if (first?.type !== "spawn") throw new Error("esperava spawn");

    // escava a coluna do spawn até o fundo do mundo (direto no mundo — o
    // alcance não deixaria fazer isso via mensagens num teste curto)
    const bx = Math.floor(session.spawn.x);
    const bz = Math.floor(session.spawn.z);
    for (let y = 0; y < session.world.sizeY; y++) {
      setBlock(session.world, bx, y, bz, BlockId.Air);
    }
    expect(findSpawnY(session.world, bx, bz)).not.toBe(first.y); // buraco mudaria o cálculo…
    sent.length = 0;

    session.handleMessage(2, JSON.stringify({ type: "join", name: "bia" }));
    const second = parseServerMessage(sent[0]?.data as string);
    if (second?.type !== "spawn") throw new Error("esperava spawn");
    expect(second).toEqual(first); // …mas o spawn não recalcula: mesmo ponto
  });

  it("chat vira broadcast pra TODOS com autor nome#id; vazio ou sem join é ignorado", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, singleplayer: true });
    // sem join: ignorado
    session.handleMessage(9, JSON.stringify({ type: "chat", text: "oi" }));
    expect(sent).toHaveLength(0);

    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    session.handleMessage(2, JSON.stringify({ type: "join", name: "bia" }));
    sent.length = 0;

    session.handleMessage(1, JSON.stringify({ type: "chat", text: "  olá, turma!  " }));
    expect(sent).toHaveLength(2); // TODOS, inclusive o autor (eco = confirmação)
    expect(sent.map((s) => s.clientId).sort()).toEqual([1, 2]);
    expect(parseServerMessage(sent[0]?.data as string)).toEqual({
      type: "chat", author: "ana#1", text: "olá, turma!",
    });
    sent.length = 0;

    // só espaço = nada; texto gigante é cortado no limite
    session.handleMessage(1, JSON.stringify({ type: "chat", text: "   " }));
    expect(sent).toHaveLength(0);
    session.handleMessage(1, JSON.stringify({ type: "chat", text: "x".repeat(999) }));
    const long = parseServerMessage(sent[0]?.data as string);
    if (long?.type !== "chat") throw new Error("esperava chat");
    expect(long.text).toHaveLength(MAX_CHAT_LENGTH);
  });

  it("/bloco muda o mundo longe do jogador, responde SÓ ao autor e acorda a gravidade", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    session.handleMessage(2, JSON.stringify({ type: "join", name: "bia" }));
    const world = session.world;
    // canto do mundo, MUITO além do alcance de place_block — comando não checa alcance
    const h = findSpawnY(world, 1, 1);
    sent.length = 0;

    session.handleMessage(1, JSON.stringify({ type: "chat", text: `/bloco 1 ${h + 1} 1 ${BlockId.Sand}` }));
    expect(getBlock(world, 1, h + 1, 1)).toBe(BlockId.Sand);
    // block_changed pros DOIS + resposta de chat só pro autor
    const msgs = sent.map((s) => ({ to: s.clientId, msg: parseServerMessage(s.data as string) }));
    expect(msgs.filter((m) => m.msg?.type === "block_changed").map((m) => m.to).sort()).toEqual([1, 2]);
    const replies = msgs.filter((m) => m.msg?.type === "chat");
    expect(replies).toHaveLength(1);
    expect(replies[0]?.to).toBe(1);
    sent.length = 0;

    // areia colocada por comando cai no tick — mesma engrenagem de vizinhança
    session.tick();
    expect(getBlock(world, 1, h, 1)).toBe(BlockId.Sand);
    expect(getBlock(world, 1, h + 1, 1)).toBe(BlockId.Air);
  });

  it("/bloco com ~ usa a célula do autor como base (~n desloca)", () => {
    const { send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    const base = {
      x: Math.floor(session.spawn.x),
      y: Math.floor(session.spawn.y),
      z: Math.floor(session.spawn.z),
    };
    // 3 acima dos pés = acima da cabeça: célula de ar garantida
    session.handleMessage(1, JSON.stringify({ type: "chat", text: `/bloco ~ ~3 ~ ${BlockId.Stone}` }));
    expect(getBlock(session.world, base.x, base.y + 3, base.z)).toBe(BlockId.Stone);
    // ~ quebrado (letra depois do ~) explica o uso, mundo intacto
    session.handleMessage(1, JSON.stringify({ type: "chat", text: "/bloco ~a ~ ~ 1" }));
    expect(getBlock(session.world, base.x, base.y, base.z)).toBe(BlockId.Air);
  });

  it("bedrock: jogador não quebra; /bloco coloca e remove (caminho do professor)", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    const world = session.world;
    const sx = Math.floor(world.sizeX / 2);
    const sz = Math.floor(world.sizeZ / 2);
    const h = findSpawnY(world, sx, sz);

    // professor materializa bedrock via comando (célula de ar, acima da cabeça)
    session.handleMessage(1, JSON.stringify({ type: "chat", text: `/bloco ${sx} ${h + 3} ${sz} ${BlockId.Bedrock}` }));
    expect(getBlock(world, sx, h + 3, sz)).toBe(BlockId.Bedrock);
    sent.length = 0;

    // jogador tenta quebrar (ao alcance): rejeitado em silêncio
    session.handleMessage(1, JSON.stringify({ type: "break_block", x: sx, y: h + 3, z: sz }));
    expect(sent).toHaveLength(0);
    expect(getBlock(world, sx, h + 3, sz)).toBe(BlockId.Bedrock);

    // /bloco 0 remove (comando ignora isBreakable — teleoperação do professor)
    session.handleMessage(1, JSON.stringify({ type: "chat", text: `/bloco ${sx} ${h + 3} ${sz} 0` }));
    expect(getBlock(world, sx, h + 3, sz)).toBe(BlockId.Air);
  });

  it("rocha-matriz: aluno não coloca (só professor); professor coloca", () => {
    const { send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "prof", pin: "4321", codigo: "sala" }));
    session.handleMessage(2, JSON.stringify({ type: "join", name: "ana", pin: "1111" }));
    const world = session.world;
    const sx = Math.floor(world.sizeX / 2);
    const sz = Math.floor(world.sizeZ / 2);
    const h = findSpawnY(world, sx, sz);
    const alvo = { x: sx, y: h + 3, z: sz }; // ar, ao alcance dos dois no spawn

    // aluno tenta colocar rocha-matriz: recusado em silêncio, célula segue ar
    session.handleMessage(2, JSON.stringify({ type: "place_block", ...alvo, blockId: BlockId.Bedrock }));
    expect(getBlock(world, alvo.x, alvo.y, alvo.z)).toBe(BlockId.Air);

    // professor coloca no mesmo lugar: aceito
    session.handleMessage(1, JSON.stringify({ type: "place_block", ...alvo, blockId: BlockId.Bedrock }));
    expect(getBlock(world, alvo.x, alvo.y, alvo.z)).toBe(BlockId.Bedrock);
  });

  it("cascalho cai igual areia — regra de queda é genérica", () => {
    const { send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    const world = session.world;
    const sx = Math.floor(world.sizeX / 2);
    const sz = Math.floor(world.sizeZ / 2);
    const h = findSpawnY(world, sx, sz);

    session.handleMessage(1, JSON.stringify({
      type: "place_block", x: sx, y: h + 2, z: sz, blockId: BlockId.Gravel,
    }));
    session.tick();
    expect(getBlock(world, sx, h + 1, sz)).toBe(BlockId.Gravel);
    expect(getBlock(world, sx, h + 2, sz)).toBe(BlockId.Air);
  });

  it("comando inválido: resposta de erro só pro autor, mundo intacto", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    session.handleMessage(2, JSON.stringify({ type: "join", name: "bia" }));
    sent.length = 0;

    const bad = [
      "/teleporte 1 2 3",                 // comando desconhecido
      "/bloco 1 2",                       // args faltando
      "/bloco 1.5 2 3 4",                 // não inteiro
      "/bloco 999 0 0 1",                 // fora do mundo
      "/bloco 5 5 5 200",                 // id inválido
    ];
    for (const text of bad) {
      session.handleMessage(1, JSON.stringify({ type: "chat", text }));
    }
    expect(sent).toHaveLength(bad.length); // 1 resposta por comando…
    for (const s of sent) {
      expect(s.clientId).toBe(1); // …todas SÓ pro autor
      expect(parseServerMessage(s.data as string)?.type).toBe("chat");
    }
  });

  it("ciclo dia/noite (cp21): nasce parado ao meio-dia; /ciclo liga, /hora ajusta", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "prof" }));
    sent.length = 0;

    const ultimaHora = (): { hora: number; ciclo: boolean } => {
      const times = sent
        .map((s) => (typeof s.data === "string" ? parseServerMessage(s.data) : null))
        .filter((m): m is { type: "time"; hora: number; ciclo: boolean } => m?.type === "time");
      const t = times[times.length - 1];
      if (!t) throw new Error("nenhuma mensagem de hora foi enviada");
      return { hora: t.hora, ciclo: t.ciclo };
    };

    // mundo de atividade: dia permanente, ciclo PARADO — ticks NÃO mexem na hora
    for (let i = 0; i < SERVER_TICK_RATE * 2; i++) session.tick();
    expect(ultimaHora()).toEqual({ hora: 12, ciclo: false });
    sent.length = 0;

    // /ciclo ligar → agora o tempo passa (1 s de ticks avança a hora)
    session.handleMessage(1, JSON.stringify({ type: "chat", text: "/ciclo ligar" }));
    expect(ultimaHora().ciclo).toBe(true);
    for (let i = 0; i < SERVER_TICK_RATE; i++) session.tick();
    expect(ultimaHora().hora).toBeGreaterThan(12);
    sent.length = 0;

    // /hora noite → preset 21h + broadcast; resposta de texto só pro autor
    session.handleMessage(1, JSON.stringify({ type: "chat", text: "/hora noite" }));
    expect(ultimaHora().hora).toBe(21);
    expect(sent.some((s) => parseServerMessage(s.data as string)?.type === "chat")).toBe(true);
    sent.length = 0;

    // /ciclo desligar → congela; ticks não mexem mais na hora
    session.handleMessage(1, JSON.stringify({ type: "chat", text: "/ciclo desligar" }));
    expect(ultimaHora()).toEqual({ hora: 21, ciclo: false });
    sent.length = 0;
    for (let i = 0; i < SERVER_TICK_RATE * 2; i++) session.tick();
    expect(ultimaHora().hora).toBe(21); // congelado em 21h
  });

  it("ciclo dia/noite (cp21): hora e ciclo PERSISTEM no save/restore", () => {
    const { send } = collect();
    const s1 = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    s1.handleMessage(1, JSON.stringify({ type: "join", name: "prof" }));
    // sobrevivência: liga o ciclo e move a hora
    s1.handleMessage(1, JSON.stringify({ type: "chat", text: "/ciclo ligar" }));
    s1.handleMessage(1, JSON.stringify({ type: "chat", text: "/hora entardecer" }));
    const meta = s1.toSave();
    expect(meta.hora).toBe(18);
    expect(meta.ciclo).toBe(true);

    // recarrega: a hora e o ciclo voltam do save (não o padrão meio-dia/parado)
    const { sent: sent2, send: send2 } = collect();
    const s2 = new GameSession(send2, { restore: { world: s1.world, ...meta }, singleplayer: true });
    s2.handleMessage(7, JSON.stringify({ type: "join", name: "prof" }));
    const hora = sent2
      .map((s) => (typeof s.data === "string" ? parseServerMessage(s.data) : null))
      .find((m) => m?.type === "time");
    if (hora?.type !== "time") throw new Error("esperava time no join");
    expect(hora).toEqual({ type: "time", hora: 18, ciclo: true });
  });

  it("ciclo dia/noite: aluno não pode mudar a hora nem o ciclo", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana", pin: "1111" }));
    sent.length = 0;
    for (const text of ["/hora dia", "/ciclo desligar"]) {
      session.handleMessage(1, JSON.stringify({ type: "chat", text }));
      const reply = parseServerMessage(sent[0]?.data as string);
      if (reply?.type !== "chat") throw new Error("esperava recusa em chat");
      expect(reply.text).toContain("Somente o professor");
      // aluno não disparou broadcast de hora
      expect(sent.some((s) => parseServerMessage(s.data as string)?.type === "time")).toBe(false);
      sent.length = 0;
    }
  });

  it("presença no join (bug-064): novo vê quem está PARADO; os outros veem o novo", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    // ana anda até um canto e FICA PARADA (nenhum move depois)
    session.handleMessage(1, JSON.stringify({ type: "move", x: 3.5, y: 20, z: 4.5, yaw: 1, pitch: 0 }));
    sent.length = 0;

    session.handleMessage(2, JSON.stringify({ type: "join", name: "bia" }));
    // bia recebe o estado atual da ana (mesmo sem a ana mandar move de novo)…
    const toBia = sent.filter((s) => s.clientId === 2 && typeof s.data === "string")
      .map((s) => parseServerMessage(s.data as string));
    expect(toBia).toContainEqual({
      type: "player_moved", id: 1, x: 3.5, y: 20, z: 4.5, yaw: 1, pitch: 0, name: "ana",
    });
    // …e a ana fica sabendo da bia (nascendo no spawn)
    const toAna = sent.filter((s) => s.clientId === 1)
      .map((s) => parseServerMessage(s.data as string));
    expect(toAna).toContainEqual({
      type: "player_moved", id: 2,
      x: session.spawn.x, y: session.spawn.y, z: session.spawn.z, yaw: 0, pitch: 0,
      name: "bia",
    });
    // ordem: presença só DEPOIS do snapshot (cliente já montou o jogo)
    const biaTypes = sent.filter((s) => s.clientId === 2)
      .map((s) => (typeof s.data === "string" ? parseServerMessage(s.data)?.type : "snapshot"));
    expect(biaTypes.indexOf("snapshot")).toBeLessThan(biaTypes.indexOf("player_moved"));
  });

  it("move vira player_moved SÓ pros outros — autor nunca recebe eco", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    session.handleMessage(2, JSON.stringify({ type: "join", name: "bia" }));
    sent.length = 0;

    session.handleMessage(1, JSON.stringify({
      type: "move", x: 5.5, y: 20, z: 6.5, yaw: 1.2, pitch: -0.3,
    }));
    expect(sent).toHaveLength(1);
    expect(sent[0]?.clientId).toBe(2);
    expect(parseServerMessage(sent[0]?.data as string)).toEqual({
      type: "player_moved", id: 1, x: 5.5, y: 20, z: 6.5, yaw: 1.2, pitch: -0.3, name: "ana",
    });
  });

  it("restore: mundo salvo volta byte a byte, spawn NÃO recalcula, roster teleporta", () => {
    // sessão original: escava perto do spawn e move a ana pra longe
    const { send } = collect();
    const s1 = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    s1.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    const sx = Math.floor(s1.spawn.x);
    const sz = Math.floor(s1.spawn.z);
    s1.handleMessage(1, JSON.stringify({
      type: "break_block", x: sx, y: Math.floor(s1.spawn.y) - 1, z: sz,
    }));
    s1.handleMessage(1, JSON.stringify({ type: "move", x: 2.5, y: 20, z: 3.5, yaw: 1.2, pitch: -0.3 }));
    s1.handleDisconnect(1);

    // "grava e recarrega" (encode/decode reais ficam no save.test — aqui o contrato da sessão)
    const save = { world: s1.world, ...s1.toSave() };
    expect(save.roster).toEqual([{ name: "ana", x: 2.5, y: 20, z: 3.5, yaw: 1.2, pitch: -0.3 }]);

    const { sent: sent2, send: send2 } = collect();
    const s2 = new GameSession(send2, { restore: save, singleplayer: true });
    expect(s2.spawn).toEqual(s1.spawn); // spawn vem do save, nunca de findSpawnY de novo
    for (let i = 0; i < s1.world.chunks.length; i++) {
      expect(s2.world.chunks[i]).toEqual(s1.world.chunks[i]);
    }

    // ana volta: nasce onde parou (teleport depois do snapshot)
    s2.handleMessage(7, JSON.stringify({ type: "join", name: "ana" }));
    const types = sent2.map((s) =>
      typeof s.data === "string" ? parseServerMessage(s.data)?.type : "snapshot",
    );
    // time (cp21) entra depois do snapshot, antes do teleport
    expect(types).toEqual(["spawn", "snapshot", "time", "teleport", "chat"]);
    const tp = sent2
      .map((s) => (typeof s.data === "string" ? parseServerMessage(s.data) : null))
      .find((m) => m?.type === "teleport");
    // volta onde parou E olhando pra onde olhava
    expect(tp).toEqual({ type: "teleport", x: 2.5, y: 20, z: 3.5, yaw: 1.2, pitch: -0.3 });

    // nome desconhecido: sem teleport (nasce no spawn do mundo)
    sent2.length = 0;
    s2.handleMessage(8, JSON.stringify({ type: "join", name: "bia" }));
    expect(
      sent2.some((s) => typeof s.data === "string" && parseServerMessage(s.data)?.type === "teleport"),
    ).toBe(false);
  });

  it("toSave inclui jogador ONLINE com a posição atual (não só quem desconectou)", () => {
    const { send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    session.handleMessage(1, JSON.stringify({ type: "move", x: 9.5, y: 22, z: 8.5, yaw: 1, pitch: 0 }));
    expect(session.toSave().roster).toEqual([{ name: "ana", x: 9.5, y: 22, z: 8.5, yaw: 1, pitch: 0 }]);
  });

  it("disconnect vira player_left pra quem fica; id desconhecido é silêncio", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, singleplayer: true });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    session.handleMessage(2, JSON.stringify({ type: "join", name: "bia" }));
    sent.length = 0;

    session.handleDisconnect(1);
    expect(sent).toHaveLength(1);
    expect(sent[0]?.clientId).toBe(2);
    expect(parseServerMessage(sent[0]?.data as string)).toEqual({
      type: "player_left", id: 1,
    });
    sent.length = 0;

    // desconectar quem nunca entrou (ou de novo) não emite nada
    session.handleDisconnect(1);
    session.handleDisconnect(99);
    expect(sent).toHaveLength(0);
  });
});

describe("identidade cp9: PIN + papel (default = estrito, PIN exigido)", () => {
  const join = (name: string, pin?: string, codigo?: string) =>
    JSON.stringify({ type: "join", name, pin, codigo });
  const chatCmd = (text: string) => JSON.stringify({ type: "chat", text });

  it("sem PIN ou PIN malformado → join_denied e NADA mais (nem snapshot)", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS });
    session.handleMessage(1, join("ana"));
    session.handleMessage(1, join("ana", "12"));
    session.handleMessage(1, join("ana", "abcd"));
    expect(sent).toHaveLength(3); // 1 recusa por tentativa, zero snapshot
    for (const s of sent) {
      expect(parseServerMessage(s.data as string)).toEqual({
        type: "join_denied", reason: "O PIN precisa ter exatamente 4 números.",
      });
    }
  });

  it("1ª entrada registra o PIN; rejoin exige o MESMO; errado → join_denied", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS });
    session.handleMessage(1, join("ana", "1234"));
    expect(parseServerMessage(sent[0]?.data as string)?.type).toBe("spawn");
    session.handleDisconnect(1);
    sent.length = 0;

    session.handleMessage(2, join("ana", "9999"));
    expect(sent).toHaveLength(1);
    expect(parseServerMessage(sent[0]?.data as string)).toEqual({
      type: "join_denied", reason: "PIN incorreto para este nome.",
    });
    sent.length = 0;

    session.handleMessage(2, join("ana", "1234"));
    expect(parseServerMessage(sent[0]?.data as string)?.type).toBe("spawn");
  });

  it("nome já ONLINE → recusado mesmo com o PIN certo (fecha o bug-061)", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS });
    session.handleMessage(1, join("ana", "1234"));
    sent.length = 0;

    session.handleMessage(2, join("ana", "1234"));
    expect(sent).toHaveLength(1);
    expect(sent[0]?.clientId).toBe(2);
    const deny = parseServerMessage(sent[0]?.data as string);
    if (deny?.type !== "join_denied") throw new Error("esperava join_denied");
    expect(deny.reason).toContain("Já existe alguém em jogo");
  });

  it("rate-limit: 5 PINs errados travam o nome por 30 s — até com o PIN certo", () => {
    let t = 1000;
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, now: () => t });
    session.handleMessage(1, join("ana", "1234"));
    session.handleDisconnect(1);
    for (let i = 0; i < 5; i++) session.handleMessage(2, join("ana", "0000"));
    sent.length = 0;

    session.handleMessage(2, join("ana", "1234")); // PIN certo, mas travado
    expect(parseServerMessage(sent[0]?.data as string)).toEqual({
      type: "join_denied", reason: "Muitas tentativas com o PIN errado. Aguarde 30 segundos e tente de novo.",
    });
    sent.length = 0;

    t += 31_000; // trava expira
    session.handleMessage(2, join("ana", "1234"));
    expect(parseServerMessage(sent[0]?.data as string)?.type).toBe("spawn");
  });

  it("código de professor: certo eleva o papel (e fica); errado nega o join", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, codigo: "salaverde" });
    session.handleMessage(1, join("prof", "4321", "errado"));
    expect(parseServerMessage(sent[0]?.data as string)).toEqual({
      type: "join_denied", reason: "Código de professor incorreto.",
    });
    sent.length = 0;

    session.handleMessage(1, join("prof", "4321", "salaverde"));
    const welcome = sent
      .map((s) => (typeof s.data === "string" ? parseServerMessage(s.data) : null))
      .find((m) => m?.type === "chat");
    if (welcome?.type !== "chat") throw new Error("esperava boas-vindas");
    expect(welcome.text).toContain("/resetpin"); // dica só de professor

    // /bloco funciona pra professor
    const h = findSpawnY(session.world, 1, 1);
    session.handleMessage(1, chatCmd(`/bloco 1 ${h} 1 ${BlockId.Stone}`));
    expect(getBlock(session.world, 1, h, 1)).toBe(BlockId.Stone);

    // papel + PIN + código persistem no save (texto puro — ver auth.ts)
    const meta = session.toSave();
    expect(meta.codigo).toBe("salaverde");
    const entry = meta.roster.find((p) => p.name === "prof");
    expect(entry?.papel).toBe("professor");
    expect(entry?.pin).toBe("4321");

    // rejoin SEM o código continua professor (papel ficou na identidade)
    session.handleDisconnect(1);
    sent.length = 0;
    session.handleMessage(2, join("prof", "4321"));
    const welcome2 = sent
      .map((s) => (typeof s.data === "string" ? parseServerMessage(s.data) : null))
      .find((m) => m?.type === "chat");
    if (welcome2?.type !== "chat") throw new Error("esperava boas-vindas");
    expect(welcome2.text).toContain("/resetpin");
  });

  it("aluno não roda /bloco nem /resetpin — mundo intacto, recusa só pro autor", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5 });
    session.handleMessage(1, join("ana", "1111"));
    const h = findSpawnY(session.world, 1, 1);
    const before = getBlock(session.world, 1, h, 1);
    sent.length = 0;

    session.handleMessage(1, chatCmd(`/bloco 1 ${h} 1 ${BlockId.Stone}`));
    session.handleMessage(1, chatCmd("/resetpin ana"));
    expect(getBlock(session.world, 1, h, 1)).toBe(before);
    expect(sent).toHaveLength(2);
    for (const s of sent) {
      expect(s.clientId).toBe(1);
      const msg = parseServerMessage(s.data as string);
      if (msg?.type !== "chat") throw new Error("esperava chat");
      expect(msg.text).toContain("Somente o professor");
    }
  });

  it("/resetpin apaga o PIN e a próxima entrada registra um novo", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, codigo: "salaverde" });
    session.handleMessage(1, join("prof", "4321", "salaverde"));
    session.handleMessage(2, join("ana", "1111"));
    session.handleDisconnect(2); // ana esqueceu o PIN e saiu
    sent.length = 0;

    session.handleMessage(1, chatCmd("/resetpin ana"));
    const reply = parseServerMessage(sent[0]?.data as string);
    if (reply?.type !== "chat") throw new Error("esperava chat");
    expect(reply.text).toContain("apagado");
    sent.length = 0;

    // nome sem PIN registrado: resposta explica
    session.handleMessage(1, chatCmd("/resetpin beto"));
    const missing = parseServerMessage(sent[0]?.data as string);
    if (missing?.type !== "chat") throw new Error("esperava chat");
    expect(missing.text).toContain("não há PIN para apagar");
    sent.length = 0;

    // ana volta com PIN NOVO (o velho não vale mais nada)
    session.handleMessage(3, join("ana", "2222"));
    expect(parseServerMessage(sent[0]?.data as string)?.type).toBe("spawn");
    session.handleDisconnect(3);
    sent.length = 0;
    session.handleMessage(3, join("ana", "1111")); // PIN velho
    expect(parseServerMessage(sent[0]?.data as string)).toEqual({
      type: "join_denied", reason: "PIN incorreto para este nome.",
    });
  });

  it("singleplayer: entra sem PIN como professor, e o save NÃO carrega papel/PIN", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(0, join("dona do mundo"));
    const welcome = sent
      .map((s) => (typeof s.data === "string" ? parseServerMessage(s.data) : null))
      .find((m) => m?.type === "chat");
    if (welcome?.type !== "chat") throw new Error("esperava boas-vindas");
    expect(welcome.text).toContain("/bloco"); // professor automático

    const h = findSpawnY(session.world, 1, 1);
    session.handleMessage(0, chatCmd(`/bloco 1 ${h} 1 ${BlockId.Stone}`));
    expect(getBlock(session.world, 1, h, 1)).toBe(BlockId.Stone);

    // exportar este mundo pra LAN não pode dar professor de graça a ninguém
    const meta = session.toSave();
    const entry = meta.roster.find((p) => p.name === "dona do mundo");
    expect(entry?.papel).toBeUndefined();
    expect(entry?.pin).toBeUndefined();
    expect(meta.codigo).toBeUndefined();
  });

  it("identidade sobrevive ao save/restore: recarregou, o MESMO PIN vale", () => {
    const { send } = collect();
    const s1 = new GameSession(send, { dims: DIMS, seed: 5, codigo: "salaverde" });
    s1.handleMessage(1, join("prof", "4321", "salaverde"));
    s1.handleMessage(2, join("ana", "1111"));
    s1.handleDisconnect(1);
    s1.handleDisconnect(2);

    const { sent: sent2, send: send2 } = collect();
    const s2 = new GameSession(send2, { restore: { world: s1.world, ...s1.toSave() } });
    s2.handleMessage(7, join("ana", "9999"));
    expect(parseServerMessage(sent2[0]?.data as string)).toEqual({
      type: "join_denied", reason: "PIN incorreto para este nome.",
    });
    sent2.length = 0;
    s2.handleMessage(7, join("ana", "1111"));
    expect(parseServerMessage(sent2[0]?.data as string)?.type).toBe("spawn");
    sent2.length = 0;

    // professor volta professor (papel restaurado do save, sem código)
    s2.handleMessage(8, join("prof", "4321"));
    const welcome = sent2
      .map((s) => (typeof s.data === "string" ? parseServerMessage(s.data) : null))
      .find((m) => m?.type === "chat");
    if (welcome?.type !== "chat") throw new Error("esperava boas-vindas");
    expect(welcome.text).toContain("/resetpin");
  });
});

describe("voo criativo (/voo): professor libera pra turma", () => {
  const join = (name: string, pin?: string, codigo?: string) =>
    JSON.stringify({ type: "join", name, pin, codigo });
  const chatCmd = (text: string) => JSON.stringify({ type: "chat", text });

  it("professor liga/desliga e a turma recebe o broadcast", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
    session.handleMessage(1, join("prof", "4321", "sala")); // professor
    session.handleMessage(2, join("ana", "1111")); // aluno
    sent.length = 0;

    session.handleMessage(1, chatCmd("/voo ligar"));
    // broadcast `voo liberado` pros DOIS + resposta do comando só pro autor
    const voos = sent
      .map((s) => ({ id: s.clientId, m: parseServerMessage(s.data as string) }))
      .filter((x) => x.m?.type === "voo");
    expect(voos.map((v) => v.id).sort()).toEqual([1, 2]);
    expect(voos.every((v) => v.m?.type === "voo" && v.m.liberado)).toBe(true);
    sent.length = 0;

    session.handleMessage(1, chatCmd("/voo desligar"));
    const off = sent
      .map((s) => parseServerMessage(s.data as string))
      .filter((m) => m?.type === "voo");
    expect(off.length).toBe(2);
    expect(off.every((m) => m?.type === "voo" && m.liberado === false)).toBe(true);
  });

  it("aluno não libera voo — recusa só pro autor, turma nada recebe", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
    session.handleMessage(1, join("prof", "4321", "sala"));
    session.handleMessage(2, join("ana", "1111"));
    sent.length = 0;

    session.handleMessage(2, chatCmd("/voo ligar"));
    expect(sent).toHaveLength(1);
    expect(sent[0]?.clientId).toBe(2);
    const msg = parseServerMessage(sent[0]?.data as string);
    if (msg?.type !== "chat") throw new Error("esperava chat");
    expect(msg.text).toContain("Somente o professor");
  });

  it("aluno que entra DEPOIS do /voo ligar recebe o estado no join", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
    session.handleMessage(1, join("prof", "4321", "sala"));
    session.handleMessage(1, chatCmd("/voo ligar"));
    sent.length = 0;

    session.handleMessage(2, join("bia", "2222")); // aluno chega com voo já liberado
    const voo = sent
      .filter((s) => s.clientId === 2)
      .map((s) => parseServerMessage(s.data as string))
      .find((m) => m?.type === "voo");
    if (voo?.type !== "voo") throw new Error("esperava msg voo no join");
    expect(voo.liberado).toBe(true);
  });

  it("voo trancado (default): join NÃO manda msg voo (sem churn)", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, singleplayer: true });
    session.handleMessage(1, join("ana"));
    const temVoo = sent.some((s) => parseServerMessage(s.data as string)?.type === "voo");
    expect(temVoo).toBe(false);
  });
});
