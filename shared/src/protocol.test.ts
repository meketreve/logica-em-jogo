import { describe, expect, it } from "vitest";
import { CHUNK_VOLUME, MAX_WORLD_CHUNKS } from "./constants";
import {
  SNAPSHOT_HEADER_BYTES,
  SNAPSHOT_MAGIC,
  decodeSnapshot,
  encodeSnapshot,
  parseClientMessage,
  parseServerMessage,
} from "./protocol";
import { generateWorld } from "./worldgen";

const DIMS = { x: 2, z: 2, y: 2 };

describe("snapshot binário", () => {
  it("roundtrip: decode(encode(mundo)) devolve os MESMOS bytes e a seed", () => {
    const world = generateWorld(DIMS, 42);
    const snap = decodeSnapshot(encodeSnapshot(world, 42));
    expect(snap.seed).toBe(42);
    expect(snap.world.dims).toEqual(DIMS);
    expect(snap.world.chunks.length).toBe(world.chunks.length);
    for (let i = 0; i < world.chunks.length; i++) {
      expect(snap.world.chunks[i]).toEqual(world.chunks[i]);
    }
  });

  it("header carrega as dimensões — cliente não assume tamanho", () => {
    const world = generateWorld({ x: 3, z: 2, y: 1 }, 7);
    const buf = encodeSnapshot(world, 7);
    expect(buf.byteLength).toBe(SNAPSHOT_HEADER_BYTES + 6 * CHUNK_VOLUME);
    const view = new DataView(buf);
    expect(view.getUint32(0, true)).toBe(SNAPSHOT_MAGIC);
    expect([view.getUint8(4), view.getUint8(5), view.getUint8(6)]).toEqual([3, 2, 1]);
  });

  it("rejeita magic inválido", () => {
    const buf = encodeSnapshot(generateWorld(DIMS, 1), 1);
    new DataView(buf).setUint32(0, 0xdeadbeef, true);
    expect(() => decodeSnapshot(buf)).toThrow(/magic/);
  });

  it("rejeita buffer truncado", () => {
    const buf = encodeSnapshot(generateWorld(DIMS, 1), 1);
    expect(() => decodeSnapshot(buf.slice(0, buf.byteLength - 1))).toThrow(/tamanho/);
    expect(() => decodeSnapshot(buf.slice(0, 4))).toThrow(/header/);
  });

  it("rejeita dims acima do teto do servidor", () => {
    const buf = encodeSnapshot(generateWorld(DIMS, 1), 1);
    new DataView(buf).setUint8(4, MAX_WORLD_CHUNKS.x + 1);
    expect(() => decodeSnapshot(buf)).toThrow(/dims/);
  });
});

describe("parse de mensagens JSON", () => {
  it("aceita join e move válidos", () => {
    expect(parseClientMessage('{"type":"join","name":"ana"}')).toEqual({
      type: "join",
      name: "ana",
    });
    expect(
      parseClientMessage('{"type":"move","x":1,"y":2,"z":3,"yaw":0.5,"pitch":-0.1}'),
    ).toEqual({ type: "move", x: 1, y: 2, z: 3, yaw: 0.5, pitch: -0.1 });
  });

  it("descarta lixo: JSON quebrado, type desconhecido, campos errados", () => {
    expect(parseClientMessage("não é json")).toBeNull();
    expect(parseClientMessage('{"type":"hack"}')).toBeNull();
    expect(parseClientMessage('{"type":"join"}')).toBeNull();
    expect(parseClientMessage('{"type":"move","x":"a","y":2,"z":3,"yaw":0,"pitch":0}')).toBeNull();
    expect(parseClientMessage('{"type":"move","x":null,"y":2,"z":3,"yaw":0,"pitch":0}')).toBeNull();
    expect(parseClientMessage('{"type":"move","x":1e999,"y":2,"z":3,"yaw":0,"pitch":0}')).toBeNull();
  });

  it("parseServerMessage aceita debug_stats e rejeita o resto", () => {
    expect(
      parseServerMessage('{"type":"debug_stats","tickAvgMs":0.1,"tickMaxMs":0.5,"tps":10}'),
    ).toEqual({ type: "debug_stats", tickAvgMs: 0.1, tickMaxMs: 0.5, tps: 10 });
    expect(parseServerMessage('{"type":"outra"}')).toBeNull();
  });
});
