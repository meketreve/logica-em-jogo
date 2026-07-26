import { describe, expect, it } from "vitest";
import { CHUNK_SIZE } from "./constants";
import {
  COLUNAS_MAGIC,
  LAZY_MAGIC,
  PEDIDOS_COLUNA_POR_S,
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

/** Relógio da sessão de teste (§🔁 precisa avançar a janela do teto de pedidos). */
const relogio = { t: 0 };

function novaSessaoLazy() {
  relogio.t = 0;
  const sent: Sent[] = [];
  const session = new GameSession(
    (clientId, data) => sent.push({ clientId, data }),
    { singleplayer: true, dims: DIMS_LAZY, seed: SEED, now: () => relogio.t },
  );
  return { session, sent };
}

const binaries = (sent: Sent[], id: number): ArrayBuffer[] =>
  sent.filter((s) => s.clientId === id && s.data instanceof ArrayBuffer)
    .map((s) => s.data as ArrayBuffer);

/** Colunas [cx,cz] contidas nos lotes LJC0 (mundo descartável só pro decode). */
function colunasDe(lotes: ArrayBuffer[]): [number, number][] {
  const alvo = createWorld(DIMS_LAZY, false);
  const out: [number, number][] = [];
  for (const lote of lotes) {
    if (peekMagic(lote) !== COLUNAS_MAGIC) continue;
    for (const { cx, cz } of decodeColunas(lote, alvo)) out.push([cx, cz]);
  }
  return out;
}

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

  it("bug-211: AUMENTAR o raio depois do join traz o anel novo", () => {
    const { session, sent } = novaSessaoLazy();
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    for (let i = 0; i < 60; i++) session.tick(); // drena tudo do raio padrão
    const antes = binaries(sent, 1).length;
    for (let i = 0; i < 5; i++) session.tick();
    expect(binaries(sent, 1).length).toBe(antes); // raio padrão esgotado
    // o cliente mexeu no "raio de render" na config e REANUNCIOU (o fix mora no
    // cliente; aqui trava o contrato do servidor de que o anel novo entra no lote)
    session.handleMessage(1, JSON.stringify({ type: "radius", chunks: RAIO_PADRAO + 3 }));
    for (let i = 0; i < 40; i++) session.tick();
    const novas = colunasDe(binaries(sent, 1).slice(antes));
    expect(novas.length).toBeGreaterThan(0);
    const scx = Math.floor(DIMS_LAZY.x / 2);
    const scz = Math.floor(DIMS_LAZY.z / 2);
    // e são do ANEL NOVO (distância > raio padrão), não re-envio do que já tinha
    const maisLonge = Math.max(
      ...novas.map(([cx, cz]) => Math.max(Math.abs(cx - scx), Math.abs(cz - scz))),
    );
    expect(maisLonge).toBeGreaterThan(RAIO_PADRAO);
  });

  it("pedir_coluna reenvia a coluna que o cliente perdeu (§🔁)", () => {
    const { session, sent } = novaSessaoLazy();
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    for (let i = 0; i < 40; i++) session.tick(); // entorno do spawn todo enviado
    const scx = Math.floor(DIMS_LAZY.x / 2);
    const scz = Math.floor(DIMS_LAZY.z / 2);
    // sem pedido, ticar de novo NÃO reenvia nada (fire-and-forget: já está em `enviadas`)
    const antes = binaries(sent, 1).length;
    for (let i = 0; i < 5; i++) session.tick();
    expect(binaries(sent, 1).length).toBe(antes);
    // o cliente perdeu a coluna do spawn e pede de volta
    session.handleMessage(1, JSON.stringify({ type: "pedir_coluna", cx: scx, cz: scz }));
    session.tick();
    expect(colunasDe(binaries(sent, 1).slice(antes))).toContainEqual([scx, scz]);
  });

  it("pedir_coluna: fora do raio, fora do mundo e sem join são ignorados (§🔁)", () => {
    const { session, sent } = novaSessaoLazy();
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    for (let i = 0; i < 40; i++) session.tick();
    const scx = Math.floor(DIMS_LAZY.x / 2);
    const scz = Math.floor(DIMS_LAZY.z / 2);
    const antes = binaries(sent, 1).length;
    // longe do jogador (raio padrão 6 + folga 2): pedido sem sentido
    session.handleMessage(1, JSON.stringify({ type: "pedir_coluna", cx: scx + 20, cz: scz }));
    // fora do mundo (negativo e além das dims): não pode quebrar o servidor
    session.handleMessage(1, JSON.stringify({ type: "pedir_coluna", cx: -1, cz: scz }));
    session.handleMessage(1, JSON.stringify({ type: "pedir_coluna", cx: 9999, cz: scz }));
    // cliente que nunca entrou
    session.handleMessage(9, JSON.stringify({ type: "pedir_coluna", cx: scx, cz: scz }));
    for (let i = 0; i < 5; i++) session.tick();
    expect(binaries(sent, 1).length).toBe(antes);
    expect(binaries(sent, 9).length).toBe(0);
  });

  it("pedir_coluna tem teto por segundo no SERVIDOR (comando vem da rede da escola)", () => {
    const { session, sent } = novaSessaoLazy(); // relógio parado em 0 = 1 janela só
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    for (let i = 0; i < 60; i++) session.tick();
    const scx = Math.floor(DIMS_LAZY.x / 2);
    const scz = Math.floor(DIMS_LAZY.z / 2);
    const antes = binaries(sent, 1).length;
    // flood: 3× o teto, todas dentro do raio
    const pedidas: [number, number][] = [];
    for (let i = 0; i < PEDIDOS_COLUNA_POR_S * 3; i++) {
      const cx = scx + (i % 5) - 2;
      const cz = scz + Math.floor(i / 5) - 2;
      pedidas.push([cx, cz]);
      session.handleMessage(1, JSON.stringify({ type: "pedir_coluna", cx, cz }));
    }
    for (let i = 0; i < 10; i++) session.tick();
    const voltaram = colunasDe(binaries(sent, 1).slice(antes));
    // exatamente o teto: as primeiras foram atendidas, o excedente calou
    expect(voltaram.length).toBe(PEDIDOS_COLUNA_POR_S);
    // janela nova (1 s depois) libera de novo
    relogio.t = 1000;
    const marca = binaries(sent, 1).length;
    const [fx, fz] = pedidas[pedidas.length - 1]!;
    session.handleMessage(1, JSON.stringify({ type: "pedir_coluna", cx: fx, cz: fz }));
    session.tick();
    expect(colunasDe(binaries(sent, 1).slice(marca))).toContainEqual([fx, fz]);
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

  it("F5 eviction: coluna longe de todos e sem edição é liberada", () => {
    const { session } = novaSessaoLazy();
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    for (let i = 0; i < 30; i++) session.tick(); // entorno do spawn resident
    const scx = Math.floor(DIMS_LAZY.x / 2);
    const scz = Math.floor(DIMS_LAZY.z / 2);
    expect(colunaGerada(session.world, scx, scz)).toBe(true);
    const residentesAntes = session.residentColCount;
    // teletransporta o interesse pra LONGE (18 chunks > raio+folga)
    session.handleMessage(1, JSON.stringify({
      type: "move", x: (scx + 18) * CHUNK_SIZE, y: 40, z: (scz + 18) * CHUNK_SIZE, yaw: 0, pitch: 0,
    }));
    for (let i = 0; i < 40; i++) session.tick(); // stream novo + evict (1×/10 ticks)
    // a coluna do spawn (agora longe, sem edição) foi liberada
    expect(colunaGerada(session.world, scx, scz)).toBe(false);
    // e a RAM não cresceu sem parar: resident ~ área de interesse, não tudo
    expect(session.residentColCount).toBeLessThanOrEqual(residentesAntes + 40);
  });

  it("F5: coluna EDITADA nunca é liberada (bytes só vivem na RAM até o save)", () => {
    const { session } = novaSessaoLazy();
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    for (let i = 0; i < 20; i++) session.tick();
    const scx = Math.floor(DIMS_LAZY.x / 2);
    const scz = Math.floor(DIMS_LAZY.z / 2);
    const bx = scx * CHUNK_SIZE + 4;
    const bz = scz * CHUNK_SIZE + 4;
    // edita a coluna do spawn (via /bloco — teleoperação, no ar alto)
    session.handleMessage(1, JSON.stringify({ type: "chat", text: `/bloco ${bx} 70 ${bz} 22` }));
    // vai pra LONGE e roda a eviction
    session.handleMessage(1, JSON.stringify({
      type: "move", x: (scx + 18) * CHUNK_SIZE, y: 40, z: (scz + 18) * CHUNK_SIZE, yaw: 0, pitch: 0,
    }));
    for (let i = 0; i < 40; i++) session.tick();
    // coluna editada segue residente E o bloco continua lá
    expect(colunaGerada(session.world, scx, scz)).toBe(true);
    expect(getBlock(session.world, bx, 70, bz)).toBe(22);
  });

  it("F5: coluna liberada regenera IDÊNTICA quando o jogador volta", () => {
    const { session } = novaSessaoLazy();
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    for (let i = 0; i < 20; i++) session.tick();
    const scx = Math.floor(DIMS_LAZY.x / 2);
    const scz = Math.floor(DIMS_LAZY.z / 2);
    const bx = scx * CHUNK_SIZE + 7;
    const bz = scz * CHUNK_SIZE + 7;
    const antes: number[] = [];
    for (let y = 0; y < 40; y++) antes.push(getBlock(session.world, bx, y, bz));
    // longe → evict → volta
    session.handleMessage(1, JSON.stringify({
      type: "move", x: (scx + 18) * CHUNK_SIZE, y: 40, z: (scz + 18) * CHUNK_SIZE, yaw: 0, pitch: 0,
    }));
    for (let i = 0; i < 40; i++) session.tick();
    expect(colunaGerada(session.world, scx, scz)).toBe(false);
    session.handleMessage(1, JSON.stringify({
      type: "move", x: (scx + 0.5) * CHUNK_SIZE, y: 40, z: (scz + 0.5) * CHUNK_SIZE, yaw: 0, pitch: 0,
    }));
    for (let i = 0; i < 20; i++) session.tick();
    expect(colunaGerada(session.world, scx, scz)).toBe(true);
    for (let y = 0; y < 40; y++) expect(getBlock(session.world, bx, y, bz)).toBe(antes[y]);
  });

  it("F4 borda: areia colocada no mundo lazy CAI (rules com vizinhos materializados)", () => {
    const { session } = novaSessaoLazy();
    session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
    for (let i = 0; i < 10; i++) session.tick();
    // areia (id 4) no AR alto, na aresta de uma coluna de chunks (x múltiplo de 16)
    const scx = Math.floor(DIMS_LAZY.x / 2);
    const bx = scx * CHUNK_SIZE; // aresta exata da coluna
    const bz = scx * CHUNK_SIZE;
    session.handleMessage(1, JSON.stringify({ type: "chat", text: `/bloco ${bx} 90 ${bz} 4` }));
    expect(getBlock(session.world, bx, 90, bz)).toBe(4);
    for (let i = 0; i < 60; i++) session.tick(); // deixa cair
    // caiu: não está mais em 90, e existe areia em algum y < 90 da coluna
    expect(getBlock(session.world, bx, 90, bz)).not.toBe(4);
    let achou = false;
    for (let y = 0; y < 90; y++) if (getBlock(session.world, bx, y, bz) === 4) achou = true;
    expect(achou).toBe(true);
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
