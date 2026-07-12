import { CHUNK_VOLUME, MAX_WORLD_CHUNKS } from "./constants";
import { type World, createWorld } from "./world";

/**
 * Protocolo v0 (checkpoint 2). Mensagens JSON dos dois lados + world_snapshot
 * BINÁRIO (único frame binário do protocolo). O cliente fala isto com QUALQUER
 * hospedeiro (Web Worker agora, Node+ws no checkpoint 5) — mesmas mensagens.
 */

// --- Mensagens JSON cliente→servidor ---

export type ClientMessage =
  | {
      /**
       * Entrada no mundo. pin: 4 dígitos — 1ª entrada com um nome registra o
       * PIN, as seguintes exigem o mesmo (cp9). codigo: código de professor
       * (opcional) — certo eleva o papel; errado NEGA o join (professor que
       * digitou errado precisa saber, não entrar como aluno em silêncio).
       * Hospedeiro singleplayer dispensa os dois.
       */
      type: "join";
      name: string;
      pin?: string;
      codigo?: string;
    }
  | { type: "move"; x: number; y: number; z: number; yaw: number; pitch: number }
  | { type: "place_block"; x: number; y: number; z: number; blockId: number }
  | { type: "break_block"; x: number; y: number; z: number }
  | { type: "chat"; text: string };

// --- Mensagens JSON servidor→cliente ---

export type ServerMessage =
  | {
      type: "debug_stats";
      /** Duração média/máxima do tick (ms) na última janela de 1 s. */
      tickAvgMs: number;
      tickMaxMs: number;
      /** Ticks executados na janela (alvo = SERVER_TICK_RATE). */
      tps: number;
    }
  | {
      /** Bloco mudou no mundo autoritativo (ação de jogador OU regra do tick — o cliente não distingue). */
      type: "block_changed";
      x: number;
      y: number;
      z: number;
      blockId: number;
    }
  | {
      /** OUTRO jogador se moveu (o servidor nunca ecoa o move do próprio autor). */
      type: "player_moved";
      id: number;
      x: number;
      y: number;
      z: number;
      yaw: number;
      pitch: number;
    }
  | {
      /** Jogador desconectou — cliente remove a representação dele. */
      type: "player_left";
      id: number;
    }
  | {
      /**
       * Ponto de spawn do mundo (fixo, calculado na CRIAÇÃO sobre o terreno
       * pristino). Cliente NUNCA deriva spawn do snapshot — o snapshot pode
       * já estar escavado/construído.
       */
      type: "spawn";
      x: number;
      y: number;
      z: number;
    }
  | {
      /** Chat: mensagem de jogador (autor "nome#id") ou do servidor (autor "servidor"). */
      type: "chat";
      author: string;
      text: string;
    }
  | {
      /**
       * Join RECUSADO (PIN errado, nome já em uso, código de professor
       * errado, tentativas demais…). Cliente mostra o motivo e volta pro
       * menu — nenhuma outra mensagem chega depois desta.
       */
      type: "join_denied";
      reason: string;
    }
  | {
      /**
       * Servidor manda o jogador pra uma posição E orientação (volta-onde-
       * parou de mundo salvo; futuro /tp). Cliente aplica, zera velocidade
       * e aponta a câmera (yaw/pitch).
       */
      type: "teleport";
      x: number;
      y: number;
      z: number;
      yaw: number;
      pitch: number;
    };

/** Parse defensivo: servidor autoritativo nunca confia no que chega do fio. */
export function parseClientMessage(raw: string): ClientMessage | null {
  let msg: unknown;
  try {
    msg = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof msg !== "object" || msg === null) return null;
  const m = msg as Record<string, unknown>;
  switch (m["type"]) {
    case "join": {
      if (typeof m["name"] !== "string") return null;
      // pin/codigo são opcionais, mas se vierem TÊM que ser string
      if (m["pin"] !== undefined && typeof m["pin"] !== "string") return null;
      if (m["codigo"] !== undefined && typeof m["codigo"] !== "string") return null;
      return {
        type: "join",
        name: m["name"],
        ...(typeof m["pin"] === "string" ? { pin: m["pin"] } : {}),
        ...(typeof m["codigo"] === "string" ? { codigo: m["codigo"] } : {}),
      };
    }
    case "move": {
      const nums = [m["x"], m["y"], m["z"], m["yaw"], m["pitch"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "move",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        yaw: m["yaw"] as number,
        pitch: m["pitch"] as number,
      };
    }
    case "place_block": {
      const ints = [m["x"], m["y"], m["z"], m["blockId"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "place_block",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        blockId: m["blockId"] as number,
      };
    }
    case "break_block": {
      const ints = [m["x"], m["y"], m["z"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "break_block",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
      };
    }
    case "chat":
      if (typeof m["text"] !== "string") return null;
      return { type: "chat", text: m["text"] };
    default:
      return null;
  }
}

export function parseServerMessage(raw: string): ServerMessage | null {
  let msg: unknown;
  try {
    msg = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof msg !== "object" || msg === null) return null;
  const m = msg as Record<string, unknown>;
  switch (m["type"]) {
    case "debug_stats": {
      const nums = [m["tickAvgMs"], m["tickMaxMs"], m["tps"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "debug_stats",
        tickAvgMs: m["tickAvgMs"] as number,
        tickMaxMs: m["tickMaxMs"] as number,
        tps: m["tps"] as number,
      };
    }
    case "block_changed": {
      const ints = [m["x"], m["y"], m["z"], m["blockId"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "block_changed",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        blockId: m["blockId"] as number,
      };
    }
    case "player_moved": {
      if (typeof m["id"] !== "number" || !Number.isInteger(m["id"])) return null;
      const nums = [m["x"], m["y"], m["z"], m["yaw"], m["pitch"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "player_moved",
        id: m["id"],
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        yaw: m["yaw"] as number,
        pitch: m["pitch"] as number,
      };
    }
    case "player_left": {
      if (typeof m["id"] !== "number" || !Number.isInteger(m["id"])) return null;
      return { type: "player_left", id: m["id"] };
    }
    case "spawn": {
      const nums = [m["x"], m["y"], m["z"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "spawn",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
      };
    }
    case "chat":
      if (typeof m["author"] !== "string" || typeof m["text"] !== "string") return null;
      return { type: "chat", author: m["author"], text: m["text"] };
    case "join_denied":
      if (typeof m["reason"] !== "string") return null;
      return { type: "join_denied", reason: m["reason"] };
    case "teleport": {
      const nums = [m["x"], m["y"], m["z"], m["yaw"], m["pitch"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "teleport",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        yaw: m["yaw"] as number,
        pitch: m["pitch"] as number,
      };
    }
    default:
      return null;
  }
}

// --- world_snapshot binário ---
//
// Layout (little-endian):
//   u32  magic "LJW0" (0x304a574c lido como LE dos bytes L J W 0)
//   u8   dims.x   u8 dims.z   u8 dims.y   u8 reservado(0)
//   u32  seed (worldgen determinístico: mesma seed = mesmos bytes)
//   depois: chunks concatenados na ordem de chunkIndex(), CHUNK_VOLUME bytes cada.
// O header carrega as dimensões — o cliente NUNCA assume tamanho de mundo.

export const SNAPSHOT_MAGIC = 0x304a574c; // bytes "LJW0" em little-endian
export const SNAPSHOT_HEADER_BYTES = 12;

export interface Snapshot {
  world: World;
  seed: number;
}

export function encodeSnapshot(world: World, seed: number): ArrayBuffer {
  const buf = new ArrayBuffer(
    SNAPSHOT_HEADER_BYTES + world.chunks.length * CHUNK_VOLUME,
  );
  const view = new DataView(buf);
  view.setUint32(0, SNAPSHOT_MAGIC, true);
  view.setUint8(4, world.dims.x);
  view.setUint8(5, world.dims.z);
  view.setUint8(6, world.dims.y);
  view.setUint8(7, 0);
  view.setUint32(8, seed >>> 0, true);
  const body = new Uint8Array(buf, SNAPSHOT_HEADER_BYTES);
  for (let i = 0; i < world.chunks.length; i++) {
    const chunk = world.chunks[i];
    if (chunk) body.set(chunk, i * CHUNK_VOLUME);
  }
  return buf;
}

/** Decodifica e VALIDA um snapshot. Lança Error em dados inválidos. */
export function decodeSnapshot(buf: ArrayBuffer): Snapshot {
  if (buf.byteLength < SNAPSHOT_HEADER_BYTES) {
    throw new Error(`snapshot menor que o header (${buf.byteLength} bytes)`);
  }
  const view = new DataView(buf);
  if (view.getUint32(0, true) !== SNAPSHOT_MAGIC) {
    throw new Error("snapshot com magic inválido — não é um world_snapshot");
  }
  const dims = { x: view.getUint8(4), z: view.getUint8(5), y: view.getUint8(6) };
  if (
    dims.x < 1 || dims.z < 1 || dims.y < 1 ||
    dims.x > MAX_WORLD_CHUNKS.x || dims.z > MAX_WORLD_CHUNKS.z || dims.y > MAX_WORLD_CHUNKS.y
  ) {
    throw new Error(`snapshot com dims fora do limite: ${dims.x}×${dims.z}×${dims.y}`);
  }
  const seed = view.getUint32(8, true);
  const world = createWorld(dims);
  const expected = SNAPSHOT_HEADER_BYTES + world.chunks.length * CHUNK_VOLUME;
  if (buf.byteLength !== expected) {
    throw new Error(
      `snapshot com tamanho errado: ${buf.byteLength} bytes (esperado ${expected})`,
    );
  }
  for (let i = 0; i < world.chunks.length; i++) {
    world.chunks[i]?.set(
      new Uint8Array(buf, SNAPSHOT_HEADER_BYTES + i * CHUNK_VOLUME, CHUNK_VOLUME),
    );
  }
  return { world, seed };
}
