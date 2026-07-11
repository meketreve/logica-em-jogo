import { DEFAULT_WORLD_CHUNKS, SERVER_TICK_RATE } from "./constants";
import {
  type ServerMessage,
  encodeSnapshot,
  parseClientMessage,
} from "./protocol";
import type { World, WorldDims } from "./world";
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
      case "join":
        this.players.set(clientId, {
          name: msg.name,
          x: 0, y: 0, z: 0, yaw: 0, pitch: 0,
        });
        this.send(clientId, encodeSnapshot(this.world, this.seed));
        break;
      case "move": {
        // Checkpoint 2: só registra (validação e player_moved vêm depois).
        const p = this.players.get(clientId);
        if (!p) return;
        p.x = msg.x; p.y = msg.y; p.z = msg.z;
        p.yaw = msg.yaw; p.pitch = msg.pitch;
        break;
      }
    }
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
      const stats: ServerMessage = {
        type: "debug_stats",
        tickAvgMs: +(this.tickMsSum / this.ticksInWindow).toFixed(3),
        tickMaxMs: +this.tickMsMax.toFixed(3),
        tps: this.ticksInWindow,
      };
      const raw = JSON.stringify(stats);
      for (const clientId of this.players.keys()) this.send(clientId, raw);
      this.tickMsSum = this.tickMsMax = this.ticksInWindow = 0;
    }
  }
}
