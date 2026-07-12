import { decodeSnapshot, encodeSnapshot } from "./protocol";
import { type World } from "./world";

/**
 * Formato de save (.ljw) — MESMO arquivo em todos os hospedeiros: disco do
 * host Node (professor), IndexedDB do navegador (singleplayer) e o arquivo
 * exportado/importado pra distribuir mundos via Drive.
 *
 * Layout (little-endian):
 *   u32  magic "LJS1"
 *   u32  tamanho do JSON de metadados (bytes UTF-8)
 *   ...  JSON de metadados (seed, spawn, roster — cresce sem quebrar formato)
 *   ...  world_snapshot binário (formato LJW0 existente, auto-validado)
 *
 * Metadados em JSON de propósito: campos futuros (hash de PIN, papel de
 * professor, objetivos de cenário) entram no JSON sem re-versionar o binário.
 */

// TextEncoder/TextDecoder existem em TODOS os hospedeiros (Node 11+, navegador,
// Web Worker), mas a lib ES2022 pura do /shared não os declara — declaração
// ambiente mínima, só do que usamos aqui.
declare class TextEncoder {
  encode(input: string): Uint8Array;
}
declare class TextDecoder {
  decode(input: Uint8Array): string;
}

export const SAVE_MAGIC = 0x31534a4c; // bytes "LJS1" em little-endian
const SAVE_HEADER_BYTES = 8;

/** Jogador lembrado pelo mundo (volta onde parou, olhando pra onde olhava).
 *  Cresce no cp9: PIN, papel. */
export interface SavedPlayer {
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

/** Metadados do save (a parte JSON — o mundo vai como snapshot binário). */
export interface SaveMeta {
  seed: number;
  spawn: { x: number; y: number; z: number };
  roster: SavedPlayer[];
}

export interface SaveData extends SaveMeta {
  world: World;
}

export function encodeSave(world: World, meta: SaveMeta): ArrayBuffer {
  const json = new TextEncoder().encode(JSON.stringify(meta));
  const snapshot = encodeSnapshot(world, meta.seed);
  const buf = new ArrayBuffer(SAVE_HEADER_BYTES + json.byteLength + snapshot.byteLength);
  const view = new DataView(buf);
  view.setUint32(0, SAVE_MAGIC, true);
  view.setUint32(4, json.byteLength, true);
  new Uint8Array(buf, SAVE_HEADER_BYTES).set(json);
  new Uint8Array(buf, SAVE_HEADER_BYTES + json.byteLength).set(new Uint8Array(snapshot));
  return buf;
}

function isFinitePos(p: unknown): p is { x: number; y: number; z: number } {
  if (typeof p !== "object" || p === null) return false;
  const o = p as Record<string, unknown>;
  return ["x", "y", "z"].every(
    (k) => typeof o[k] === "number" && Number.isFinite(o[k]),
  );
}

/** Decodifica e VALIDA um save (arquivo vem de fora — Drive, disco). Lança Error. */
export function decodeSave(buf: ArrayBuffer): SaveData {
  if (buf.byteLength < SAVE_HEADER_BYTES) {
    throw new Error(`save menor que o header (${buf.byteLength} bytes)`);
  }
  const view = new DataView(buf);
  if (view.getUint32(0, true) !== SAVE_MAGIC) {
    throw new Error("save com magic inválido — não é um arquivo .ljw");
  }
  const jsonLen = view.getUint32(4, true);
  if (SAVE_HEADER_BYTES + jsonLen > buf.byteLength) {
    throw new Error("save truncado: JSON de metadados maior que o arquivo");
  }
  let meta: unknown;
  try {
    meta = JSON.parse(
      new TextDecoder().decode(new Uint8Array(buf, SAVE_HEADER_BYTES, jsonLen)),
    );
  } catch {
    throw new Error("save com JSON de metadados quebrado");
  }
  if (typeof meta !== "object" || meta === null) throw new Error("metadados não são objeto");
  const m = meta as Record<string, unknown>;
  if (typeof m["seed"] !== "number" || !Number.isFinite(m["seed"])) {
    throw new Error("save sem seed válida");
  }
  if (!isFinitePos(m["spawn"])) throw new Error("save sem spawn válido");
  const roster: SavedPlayer[] = [];
  if (Array.isArray(m["roster"])) {
    for (const entry of m["roster"]) {
      if (
        typeof entry === "object" && entry !== null &&
        typeof (entry as Record<string, unknown>)["name"] === "string" &&
        isFinitePos(entry)
      ) {
        const e = entry as Record<string, unknown> & { name: string; x: number; y: number; z: number };
        // yaw/pitch entraram depois — save antigo sem eles continua válido (0)
        const angle = (v: unknown): number =>
          typeof v === "number" && Number.isFinite(v) ? v : 0;
        roster.push({
          name: e.name,
          x: e.x, y: e.y, z: e.z,
          yaw: angle(e["yaw"]),
          pitch: angle(e["pitch"]),
        });
      }
    }
  }
  // snapshot valida a si mesmo (magic LJW0, dims, tamanho)
  const snapshot = decodeSnapshot(buf.slice(SAVE_HEADER_BYTES + jsonLen));
  return {
    world: snapshot.world,
    seed: m["seed"],
    spawn: { x: m["spawn"].x, y: m["spawn"].y, z: m["spawn"].z },
    roster,
  };
}
