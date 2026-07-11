import { BlockId, isPlaceable } from "./blocks";
import { DEFAULT_WORLD_CHUNKS, PLAYER_REACH, SERVER_TICK_RATE } from "./constants";
import { PLAYER } from "./physics";
import {
  type ServerMessage,
  encodeSnapshot,
  parseClientMessage,
} from "./protocol";
import { type World, type WorldDims, findSpawnY, getBlock, inBounds, setBlock } from "./world";
import { generateWorld } from "./worldgen";

/**
 * GameSession: o SERVIDOR autoritativo, independente de hospedeiro.
 * TS puro — o host (Web Worker agora, Node+ws no checkpoint 5) só faz
 * transporte: entrega mensagens cruas e agenda tick() no ritmo de
 * SERVER_TICK_RATE. Toda decisão de estado do mundo mora aqui.
 */

export type SendFn = (clientId: number, data: string | ArrayBuffer) => void;

export interface SessionOptions {
  dims?: WorldDims;
  seed?: number;
  /** Relógio em ms (injetável nos testes). Hosts passam performance.now. */
  now?: () => number;
}

interface SessionPlayer {
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

export class GameSession {
  readonly world: World;
  readonly seed: number;
  tickCount = 0;

  private readonly players = new Map<number, SessionPlayer>();
  private readonly now: () => number;
  private tickMsSum = 0;
  private tickMsMax = 0;
  private ticksInWindow = 0;

  constructor(
    private readonly send: SendFn,
    opts: SessionOptions = {},
  ) {
    this.seed = opts.seed ?? 1;
    this.now = opts.now ?? (() => Date.now());
    this.world = generateWorld(opts.dims ?? DEFAULT_WORLD_CHUNKS, this.seed);
  }

  /** Mensagem crua vinda do transporte. Inválida = descartada em silêncio. */
  handleMessage(clientId: number, raw: string): void {
    const msg = parseClientMessage(raw);
    if (!msg) return;
    switch (msg.type) {
      case "join": {
        // Spawn autoritativo: mesmo cálculo que o cliente faz ao decodificar
        // o snapshot (mesmos bytes ⇒ mesmo resultado).
        const sx = this.world.sizeX / 2 + 0.5;
        const sz = this.world.sizeZ / 2 + 0.5;
        this.players.set(clientId, {
          name: msg.name,
          x: sx,
          y: findSpawnY(this.world, Math.floor(sx), Math.floor(sz)),
          z: sz,
          yaw: 0,
          pitch: 0,
        });
        this.send(clientId, encodeSnapshot(this.world, this.seed));
        break;
      }
      case "move": {
        // Checkpoint 3: só registra (validação de física e player_moved vêm depois).
        const p = this.players.get(clientId);
        if (!p) return;
        p.x = msg.x; p.y = msg.y; p.z = msg.z;
        p.yaw = msg.yaw; p.pitch = msg.pitch;
        break;
      }
      case "place_block": {
        const p = this.players.get(clientId);
        if (!p) return;
        if (!inBounds(this.world, msg.x, msg.y, msg.z)) return;
        if (!isPlaceable(msg.blockId)) return;
        if (getBlock(this.world, msg.x, msg.y, msg.z) !== BlockId.Air) return;
        if (!this.withinReach(p, msg.x, msg.y, msg.z)) return;
        if (this.overlapsAnyPlayer(msg.x, msg.y, msg.z)) return;
        this.applyBlock(msg.x, msg.y, msg.z, msg.blockId);
        break;
      }
      case "break_block": {
        const p = this.players.get(clientId);
        if (!p) return;
        if (!inBounds(this.world, msg.x, msg.y, msg.z)) return;
        if (getBlock(this.world, msg.x, msg.y, msg.z) === BlockId.Air) return;
        if (!this.withinReach(p, msg.x, msg.y, msg.z)) return;
        this.applyBlock(msg.x, msg.y, msg.z, BlockId.Air);
        break;
      }
    }
  }

  /** Aplica mudança no mundo autoritativo e avisa TODOS (inclusive o autor). */
  private applyBlock(x: number, y: number, z: number, blockId: number): void {
    setBlock(this.world, x, y, z, blockId);
    this.broadcast({ type: "block_changed", x, y, z, blockId });
  }

  private broadcast(msg: ServerMessage): void {
    const raw = JSON.stringify(msg);
    for (const clientId of this.players.keys()) this.send(clientId, raw);
  }

  /** Distância olho→centro do bloco, com folga (pos do move chega a 10 Hz). */
  private withinReach(p: SessionPlayer, x: number, y: number, z: number): boolean {
    const dx = x + 0.5 - p.x;
    const dy = y + 0.5 - (p.y + PLAYER.eyeHeight);
    const dz = z + 0.5 - p.z;
    return Math.hypot(dx, dy, dz) <= PLAYER_REACH + 2;
  }

  /** Célula (x,y,z) sobrepõe o AABB de algum jogador? (não emparedar ninguém) */
  private overlapsAnyPlayer(x: number, y: number, z: number): boolean {
    const half = PLAYER.width / 2;
    for (const p of this.players.values()) {
      if (
        x < p.x + half && x + 1 > p.x - half &&
        y < p.y + PLAYER.height && y + 1 > p.y &&
        z < p.z + half && z + 1 > p.z - half
      ) {
        return true;
      }
    }
    return false;
  }

  handleDisconnect(clientId: number): void {
    this.players.delete(clientId);
  }

  /**
   * Um tick do servidor. Checkpoint 4 pluga aqui a fila de atualização por
   * vizinhança (areia — e depois circuitos, MESMA engrenagem). A cada
   * SERVER_TICK_RATE ticks (~1 s) emite debug_stats pra todo mundo.
   */
  tick(): void {
    const t0 = this.now();

    // (sem regras de mundo ainda — o checkpoint 4 começa aqui)

    const ms = this.now() - t0;
    this.tickCount++;
    this.ticksInWindow++;
    this.tickMsSum += ms;
    if (ms > this.tickMsMax) this.tickMsMax = ms;

    if (this.ticksInWindow >= SERVER_TICK_RATE) {
      this.broadcast({
        type: "debug_stats",
        tickAvgMs: +(this.tickMsSum / this.ticksInWindow).toFixed(3),
        tickMaxMs: +this.tickMsMax.toFixed(3),
        tps: this.ticksInWindow,
      });
      this.tickMsSum = this.tickMsMax = this.ticksInWindow = 0;
    }
  }
}
