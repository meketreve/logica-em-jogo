import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { SERVER_TICK_RATE } from "./constants";
import { decodeSnapshot, parseServerMessage } from "./protocol";
import { GameSession } from "./session";
import { findSpawnY, getBlock } from "./world";

const DIMS = { x: 2, z: 2, y: 2 };

function collect() {
  const sent: { clientId: number; data: string | ArrayBuffer }[] = [];
  return { sent, send: (clientId: number, data: string | ArrayBuffer) => sent.push({ clientId, data }) };
}

describe("GameSession (servidor autoritativo)", () => {
  it("join responde com world_snapshot idêntico ao mundo do servidor", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 99 });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));

    expect(sent).toHaveLength(1);
    expect(sent[0]?.clientId).toBe(1);
    const snap = decodeSnapshot(sent[0]?.data as ArrayBuffer);
    expect(snap.seed).toBe(99);
    for (let i = 0; i < session.world.chunks.length; i++) {
      expect(snap.world.chunks[i]).toEqual(session.world.chunks[i]);
    }
    // amostra: mesmo bloco nas mesmas coordenadas
    expect(getBlock(snap.world, 5, 10, 5)).toBe(getBlock(session.world, 5, 10, 5));
  });

  it("mensagem inválida não derruba nem responde", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS });
    session.handleMessage(1, "lixo");
    session.handleMessage(1, '{"type":"place_block"}');
    expect(sent).toHaveLength(0);
  });

  it("move só é aceito depois do join", () => {
    const { send } = collect();
    const session = new GameSession(send, { dims: DIMS });
    // sem join: não lança, só ignora
    session.handleMessage(1, JSON.stringify({ type: "move", x: 1, y: 2, z: 3, yaw: 0, pitch: 0 }));
    expect(session.tickCount).toBe(0);
  });

  it("emite debug_stats a cada SERVER_TICK_RATE ticks, só pra quem entrou", () => {
    const { sent, send } = collect();
    let t = 0;
    const session = new GameSession(send, { dims: DIMS, now: () => (t += 2) });
    session.handleMessage(7, JSON.stringify({ type: "join", name: "ana" }));
    sent.length = 0; // descarta o snapshot do join

    for (let i = 0; i < SERVER_TICK_RATE - 1; i++) session.tick();
    expect(sent).toHaveLength(0);

    session.tick();
    expect(sent).toHaveLength(1);
    const stats = parseServerMessage(sent[0]?.data as string);
    if (stats?.type !== "debug_stats") throw new Error("esperava debug_stats");
    expect(stats.tps).toBe(SERVER_TICK_RATE);
    expect(stats.tickAvgMs).toBe(2); // relógio fake avança 2 ms por chamada
    expect(stats.tickMaxMs).toBe(2);

    // janela zera: próximo lote só depois de mais SERVER_TICK_RATE ticks
    session.tick();
    expect(sent).toHaveLength(1);
  });

  it("place/break: aplica, vira block_changed pra TODOS; inválido é ignorado", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5 });
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
      type: "place_block", x: sx, y: spawnY + 3, z: sz, blockId: 99,
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
    const session = new GameSession(send, { dims: DIMS, seed: 5 });
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
    const session = new GameSession(send, { dims: DIMS, seed: 5 });
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
    const session = new GameSession(send, { dims: DIMS });
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    sent.length = 0;
    session.handleDisconnect(1);
    for (let i = 0; i < SERVER_TICK_RATE; i++) session.tick();
    expect(sent).toHaveLength(0);
  });
});
