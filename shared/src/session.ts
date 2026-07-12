import { BlockId, isBreakable, isPlaceable } from "./blocks";
import {
  DEFAULT_WORLD_CHUNKS,
  MAX_CHAT_LENGTH,
  MAX_NAME_LENGTH,
  PLAYER_REACH,
  SERVER_TICK_RATE,
} from "./constants";
import { PLAYER } from "./physics";
import {
  type ServerMessage,
  encodeSnapshot,
  parseClientMessage,
} from "./protocol";
import { ruleFor } from "./rules";
import { type SaveData, type SaveMeta } from "./save";
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
  /** Mundo carregado de um save (.ljw) — ignora dims/seed e NÃO gera terreno. */
  restore?: SaveData;
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
  /** Spawn FIXO: calculado uma vez sobre o terreno pristino (na criação).
   *  Nunca recalcular no join — o mundo pode já estar escavado (bug-010). */
  readonly spawn: { x: number; y: number; z: number };
  tickCount = 0;

  private readonly players = new Map<number, SessionPlayer>();
  /** Jogadores que o MUNDO lembra (por nome): volta onde parou, olhando pra
   *  onde olhava. Base da identidade do cp9 (PIN e papel entram aqui). */
  private readonly roster = new Map<
    string,
    { x: number; y: number; z: number; yaw: number; pitch: number }
  >();
  private readonly now: () => number;
  private tickMsSum = 0;
  private tickMsMax = 0;
  private ticksInWindow = 0;
  /** Células a examinar no próximo tick (fila de vizinhança — regra de ouro). */
  private dirty = new Set<number>();
  /** Células já alteradas neste tick (máx. 1 mudança por célula por tick). */
  private changedThisTick = new Set<number>();

  constructor(
    private readonly send: SendFn,
    opts: SessionOptions = {},
  ) {
    this.now = opts.now ?? (() => Date.now());
    if (opts.restore) {
      // mundo vem do save: NADA é recalculado (spawn é do terreno pristino —
      // recalcular sobre mundo escavado repetiria o bug-010)
      this.world = opts.restore.world;
      this.seed = opts.restore.seed;
      this.spawn = { ...opts.restore.spawn };
      for (const p of opts.restore.roster) {
        this.roster.set(p.name, { x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch });
      }
    } else {
      this.seed = opts.seed ?? 1;
      this.world = generateWorld(opts.dims ?? DEFAULT_WORLD_CHUNKS, this.seed);
      const sx = this.world.sizeX / 2 + 0.5;
      const sz = this.world.sizeZ / 2 + 0.5;
      this.spawn = {
        x: sx,
        y: findSpawnY(this.world, Math.floor(sx), Math.floor(sz)),
        z: sz,
      };
    }
  }

  /**
   * Metadados pro save (.ljw). Jogadores ONLINE entram com a posição atual;
   * quem já saiu fica com a última posição vista (roster). O host grava:
   * `encodeSave(session.world, session.toSave())`.
   */
  toSave(): SaveMeta {
    const merged = new Map(this.roster);
    for (const p of this.players.values()) {
      merged.set(p.name, { x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch });
    }
    return {
      seed: this.seed,
      spawn: { ...this.spawn },
      roster: [...merged.entries()].map(([name, pos]) => ({ name, ...pos })),
    };
  }

  /** Mensagem crua vinda do transporte. Inválida = descartada em silêncio. */
  handleMessage(clientId: number, raw: string): void {
    const msg = parseClientMessage(raw);
    if (!msg) return;
    switch (msg.type) {
      case "join": {
        const name = msg.name.trim().slice(0, MAX_NAME_LENGTH) || "jogador";
        // mundo salvo lembra o jogador: volta onde parou (senão, spawn do mundo)
        const returning = this.roster.get(name);
        const start = returning ?? this.spawn;
        this.players.set(clientId, {
          name,
          x: start.x,
          y: start.y,
          z: start.z,
          yaw: returning?.yaw ?? 0,
          pitch: returning?.pitch ?? 0,
        });
        // spawn ANTES do snapshot (transporte preserva ordem) — quando o
        // snapshot chegar e o jogo começar, o cliente já sabe onde nascer.
        this.send(
          clientId,
          JSON.stringify({ type: "spawn", ...this.spawn } satisfies ServerMessage),
        );
        this.send(clientId, encodeSnapshot(this.world, this.seed));
        if (returning) {
          // depois do snapshot: cliente já montou o jogo quando isto chegar
          this.send(
            clientId,
            JSON.stringify({ type: "teleport", ...returning } satisfies ServerMessage),
          );
        }
        this.sendServerChat(
          clientId,
          `bem-vindo, ${this.authorTag(clientId)}! Enter abre o chat · /bloco x y z id`,
        );
        // Presença (bug-064): jogador PARADO não manda move — sem isto o
        // recém-chegado só via quem se mexia. Estado atual de todo mundo pro
        // novo (depois do snapshot: o cliente já montou o jogo) e o novo pros
        // outros. Formato = player_moved normal, cliente não muda nada.
        for (const [otherId, other] of this.players) {
          if (otherId === clientId) continue;
          this.send(
            clientId,
            JSON.stringify({
              type: "player_moved",
              id: otherId,
              x: other.x, y: other.y, z: other.z,
              yaw: other.yaw, pitch: other.pitch,
            } satisfies ServerMessage),
          );
        }
        this.broadcastExcept(clientId, {
          type: "player_moved",
          id: clientId,
          x: start.x, y: start.y, z: start.z,
          yaw: returning?.yaw ?? 0, pitch: returning?.pitch ?? 0,
        });
        break;
      }
      case "move": {
        const p = this.players.get(clientId);
        if (!p) return;
        p.x = msg.x; p.y = msg.y; p.z = msg.z;
        p.yaw = msg.yaw; p.pitch = msg.pitch;
        // Relay pros OUTROS (nunca ecoa pro autor — cliente não precisa saber
        // o próprio id). Validação de física vem depois do MVP.
        this.broadcastExcept(clientId, {
          type: "player_moved",
          id: clientId,
          x: msg.x, y: msg.y, z: msg.z,
          yaw: msg.yaw, pitch: msg.pitch,
        });
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
        const current = getBlock(this.world, msg.x, msg.y, msg.z);
        if (current === BlockId.Air) return;
        if (!isBreakable(current)) return; // bedrock: só /bloco remove
        if (!this.withinReach(p, msg.x, msg.y, msg.z)) return;
        this.applyBlock(msg.x, msg.y, msg.z, BlockId.Air);
        break;
      }
      case "chat": {
        if (!this.players.has(clientId)) return;
        const text = msg.text.trim().slice(0, MAX_CHAT_LENGTH);
        if (!text) return;
        if (text.startsWith("/")) {
          // comando: executa no servidor, resposta SÓ pro autor
          this.sendServerChat(clientId, this.runCommand(text));
          return;
        }
        this.broadcast({ type: "chat", author: this.authorTag(clientId), text });
        break;
      }
    }
  }

  /**
   * Comandos de chat (prefixo "/"). v0: só /bloco — existe pra provar o
   * pipeline comando→estado→broadcast: a mudança sai como block_changed
   * normal e acorda as regras de vizinhança (areia cai), igual a qualquer
   * ação de jogador. Sem checagem de alcance: comando é teleoperação.
   * Devolve a resposta pro autor.
   */
  private runCommand(text: string): string {
    const parts = text.slice(1).split(/\s+/);
    if (parts[0] !== "bloco") {
      return `comando desconhecido: ${text} (existe: /bloco x y z id)`;
    }
    const x = Number(parts[1]);
    const y = Number(parts[2]);
    const z = Number(parts[3]);
    const id = Number(parts[4]);
    if (parts.length !== 5 || ![x, y, z, id].every(Number.isInteger)) {
      return "uso: /bloco x y z id (inteiros; 0=ar; demais ids na ordem da hotbar)";
    }
    if (!inBounds(this.world, x, y, z)) return `(${x}, ${y}, ${z}) está fora do mundo`;
    if (id !== BlockId.Air && !isPlaceable(id)) return `id de bloco inválido: ${id}`;
    if (id !== BlockId.Air && this.overlapsAnyPlayer(x, y, z)) {
      return "tem um jogador nessa célula";
    }
    this.applyBlock(x, y, z, id);
    return `bloco (${x}, ${y}, ${z}) = ${id}`;
  }

  /** Nome público do jogador no chat: nome#id (distingue nomes repetidos). */
  private authorTag(clientId: number): string {
    return `${this.players.get(clientId)?.name ?? "?"}#${clientId}`;
  }

  /** Mensagem de chat do PRÓPRIO servidor (boas-vindas, resposta de comando). */
  private sendServerChat(clientId: number, text: string): void {
    this.send(
      clientId,
      JSON.stringify({ type: "chat", author: "servidor", text } satisfies ServerMessage),
    );
  }

  /**
   * Aplica mudança no mundo autoritativo, avisa TODOS (inclusive o autor) e
   * marca a célula + vizinhos como sujos — é isso que faz areia (e circuitos
   * futuros) reagirem a QUALQUER mudança, sem código especial no chamador.
   */
  private applyBlock(x: number, y: number, z: number, blockId: number): void {
    setBlock(this.world, x, y, z, blockId);
    this.changedThisTick.add(this.packCoord(x, y, z));
    this.markDirtyAround(x, y, z);
    this.broadcast({ type: "block_changed", x, y, z, blockId });
  }

  /** Chave inteira única da célula (mundo ≤ 256×256×128 cabe em int32). */
  private packCoord(x: number, y: number, z: number): number {
    return (y * this.world.sizeZ + z) * this.world.sizeX + x;
  }

  private markDirty(x: number, y: number, z: number): void {
    if (inBounds(this.world, x, y, z)) this.dirty.add(this.packCoord(x, y, z));
  }

  private markDirtyAround(x: number, y: number, z: number): void {
    this.markDirty(x, y, z);
    this.markDirty(x - 1, y, z);
    this.markDirty(x + 1, y, z);
    this.markDirty(x, y - 1, z);
    this.markDirty(x, y + 1, z);
    this.markDirty(x, y, z - 1);
    this.markDirty(x, y, z + 1);
  }

  private broadcast(msg: ServerMessage): void {
    const raw = JSON.stringify(msg);
    for (const clientId of this.players.keys()) this.send(clientId, raw);
  }

  private broadcastExcept(exceptId: number, msg: ServerMessage): void {
    const raw = JSON.stringify(msg);
    for (const clientId of this.players.keys()) {
      if (clientId !== exceptId) this.send(clientId, raw);
    }
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
    const p = this.players.get(clientId);
    if (!p) return;
    // mundo lembra onde o jogador parou (vai pro save; volta aqui no rejoin)
    this.roster.set(p.name, { x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch });
    // delete ANTES do broadcast — quem saiu não recebe (socket já fechou).
    this.players.delete(clientId);
    this.broadcast({ type: "player_left", id: clientId });
  }

  /**
   * Um tick do servidor: drena a fila de células sujas marcadas até o tick
   * anterior e roda a regra de cada bloco (areia hoje; circuitos depois —
   * MESMA engrenagem). Mudanças novas sujam vizinhos pro PRÓXIMO tick, então
   * areia cai 1 célula por tick (~10 células/s). A cada SERVER_TICK_RATE
   * ticks (~1 s) emite debug_stats pra todo mundo.
   */
  tick(): void {
    const t0 = this.now();

    this.changedThisTick.clear();
    const batch = this.dirty;
    this.dirty = new Set();
    for (const key of batch) {
      if (this.changedThisTick.has(key)) continue; // célula já mudou neste tick
      const x = key % this.world.sizeX;
      const rest = (key - x) / this.world.sizeX;
      const z = rest % this.world.sizeZ;
      const y = (rest - z) / this.world.sizeZ;
      const rule = ruleFor(getBlock(this.world, x, y, z));
      if (!rule) continue;
      const changes = rule(this.world, x, y, z);
      if (!changes) continue;
      for (const c of changes) {
        if (!inBounds(this.world, c.x, c.y, c.z)) continue; // regra defeituosa não vaza
        this.applyBlock(c.x, c.y, c.z, c.blockId);
      }
    }

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
