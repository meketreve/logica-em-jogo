import { describe, expect, it } from "vitest";
import { CHUNK_SIZE } from "./constants";
import {
  COLUNAS_MAGIC,
  LAZY_MAGIC,
  RAIO_MAX,
  RAIO_PADRAO,
  SNAPSHOT_MAGIC,
  decodeColunas,
  decodeLazyInfo,
  peekMagic,
} from "./protocol";
import { GameSession } from "./session";
import { type World, colunaGerada, getBlock } from "./world";
import { generateWorld, gerarColunaDeChunks } from "./worldgen";
import { createWorld } from "./world";

/** Dims LAZY de teste: 64×64×8 chunks (33k chunks > teto denso de 2048) —
 *  o mesmo caminho do tamanho E real (240×240) sem custar memória à toa. */
const DIMS_LAZY = { x: 64, z: 64, y: 8 };
const SEED = 13;

interface Sent {
  clientId: number;
  data: string | ArrayBuffer;
}

function novaSessaoLazy() {
  const sent: Sent[] = [];
  const session = new GameSession(
    (clientId, data) => sent.push({ clientId, data }),
    { singleplayer: true, dims: DIMS_LAZY, seed: SEED, now: () => 0 },
  );
  return { session, sent };
}

const binaries = (sent: Sent[], id: number): ArrayBuffer[] =>
  sent.filter((s) => s.clientId === id && s.data instanceof ArrayBuffer)
    .map((s) => s.data as ArrayBuffer);

describe("streaming F2 — mundo lazy por raio de interesse", () => {
  it("join em mundo lazy manda LJE0 (header), NUNCA o snapshot inteiro", () => {
    const { session, sent } = novaSessaoLazy();
    expect(session.isLazy).toBe(true);
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    const bins = binaries(sent, 1);
    expect(bins.length).toBe(1);
    expect(peekMagic(bins[0]!)).toBe(LAZY_MAGIC);
    const snap = decodeLazyInfo(bins[0]!);
    expect(snap.world.dims).toEqual(DIMS_LAZY);
    expect(snap.seed).toBe(SEED);
    // mundo do cliente nasce VAZIO — nenhuma coluna ainda
    expect(colunaGerada(snap.world, 32, 32)).toBe(false);
  });

  it("mundo denso segue mandando o snapshot LJW0 de sempre (regressão)", () => {
    const sent: Sent[] = [];
    const session = new GameSession(
      (clientId, data) => sent.push({ clientId, data }),
      { singleplayer: true, dims: { x: 2, z: 2, y: 2 }, seed: 7 },
    );
    expect(session.isLazy).toBe(false);
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    const bins = binaries(sent, 1);
    expect(bins.length).toBe(1);
    expect(peekMagic(bins[0]!)).toBe(SNAPSHOT_MAGIC);
  });

  it("tick envia colunas do centro pra fora; bytes batem com a geração local", () => {
    const { session, sent } = novaSessaoLazy();
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    const cliente: World = decodeLazyInfo(binaries(sent, 1)[0]!).world;
    // alguns ticks = alguns lotes
    for (let i = 0; i < 12; i++) session.tick();
    const lotes = binaries(sent, 1).slice(1);
    expect(lotes.length).toBeGreaterThan(0);
    let aplicadas = 0;
    for (const lote of lotes) {
      expect(peekMagic(lote)).toBe(COLUNAS_MAGIC);
      aplicadas += decodeColunas(lote, cliente).length;
    }
    expect(aplicadas).toBeGreaterThan(8);
    // coluna do spawn chegou e os bytes são EXATAMENTE os do gen local
    const scx = Math.floor(DIMS_LAZY.x / 2);
    const scz = Math.floor(DIMS_LAZY.z / 2);
    expect(colunaGerada(cliente, scx, scz)).toBe(true);
    const ref = createWorld(DIMS_LAZY, false);
    gerarColunaDeChunks(ref, scx, scz, SEED);
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let y = 0; y < 24; y++) {
        expect(getBlock(cliente, scx * CHUNK_SIZE + lx, y, scz * CHUNK_SIZE))
          .toBe(getBlock(ref, scx * CHUNK_SIZE + lx, y, scz * CHUNK_SIZE));
      }
    }
  });

  it("andar pra longe puxa colunas novas; voltar re-envia (esquecidas na ida)", () => {
    const { session, sent } = novaSessaoLazy();
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    const spawnBins = binaries(sent, 1).length;
    // drena o entorno do spawn
    for (let i = 0; i < 40; i++) session.tick();
    const aposSpawn = binaries(sent, 1).length;
    // teleporta o interesse pra LONGE (move direto — física é do cliente)
    session.handleMessage(1, JSON.stringify({
      type: "move", x: 4 * CHUNK_SIZE, y: 40, z: 4 * CHUNK_SIZE, yaw: 0, pitch: 0,
    }));
    for (let i = 0; i < 40; i++) session.tick();
    const aposLonge = binaries(sent, 1).length;
    expect(aposLonge).toBeGreaterThan(aposSpawn); // colunas novas viajaram
    // volta pro spawn: as antigas foram esquecidas → re-envia
    session.handleMessage(1, JSON.stringify({
      type: "move", x: (DIMS_LAZY.x / 2) * CHUNK_SIZE, y: 40,
      z: (DIMS_LAZY.z / 2) * CHUNK_SIZE, yaw: 0, pitch: 0,
    }));
    for (let i = 0; i < 40; i++) session.tick();
    expect(binaries(sent, 1).length).toBeGreaterThan(aposLonge);
    expect(spawnBins).toBe(1); // sanidade: join só mandou o header
  });

  it("radius clampa e reduz o alcance do interesse", () => {
    const { session, sent } = novaSessaoLazy();
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    session.handleMessage(1, JSON.stringify({ type: "radius", chunks: 999 }));
    // 999 clampa em RAIO_MAX; RAIO_MAX ≥ RAIO_PADRAO — segue mandando
    for (let i = 0; i < 4; i++) session.tick();
    expect(binaries(sent, 1).length).toBeGreaterThan(1);
    expect(RAIO_MAX).toBeGreaterThanOrEqual(RAIO_PADRAO);
  });

  it("place_block em mundo lazy: servidor aplica, faz broadcast e materializa", () => {
    const { session, sent } = novaSessaoLazy();
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    for (let i = 0; i < 20; i++) session.tick(); // entorno do spawn chega
    // célula de AR ao alcance do spawn (spawn = centro, topo do terreno)
    const sx = Math.floor((DIMS_LAZY.x / 2) * CHUNK_SIZE + 0.5) + 1;
    const sz = Math.floor((DIMS_LAZY.z / 2) * CHUNK_SIZE + 0.5) + 1;
    let y = 100;
    while (y > 1 && getBlock(session.world, sx, y - 1, sz) === 0) y--;
    session.handleMessage(1, JSON.stringify({
      type: "move", x: sx + 0.5, y, z: sz + 0.5, yaw: 0, pitch: 0,
    }));
    session.handleMessage(1, JSON.stringify({
      type: "place_block", x: sx + 1, y, z: sz + 1, blockId: 2,
    }));
    expect(getBlock(session.world, sx + 1, y, sz + 1)).toBe(2);
    const changed = sent.some(
      (s) => typeof s.data === "string" && s.data.includes("\"block_changed\""),
    );
    expect(changed).toBe(true);
  });

  it("gen lazy sob demanda = mesmo mundo do gen completo (amostra)", () => {
    // materializa 2 colunas isoladas num mundo lazy e compara com o denso
    const lazy = createWorld({ x: 4, z: 4, y: 8 }, false);
    gerarColunaDeChunks(lazy, 3, 0, 99);
    gerarColunaDeChunks(lazy, 1, 2, 99);
    const denso = generateWorld({ x: 4, z: 4, y: 8 }, 99);
    for (const [cx, cz] of [[3, 0], [1, 2]] as const) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
          for (let y = 0; y < 40; y++) {
            const x = cx * CHUNK_SIZE + lx;
            const z = cz * CHUNK_SIZE + lz;
            expect(getBlock(lazy, x, y, z), `${x},${y},${z}`).toBe(getBlock(denso, x, y, z));
          }
        }
      }
    }
  });
});
