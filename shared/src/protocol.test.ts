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

  it("aceita place_block e break_block válidos; coordenadas devem ser inteiras", () => {
    expect(
      parseClientMessage('{"type":"place_block","x":1,"y":2,"z":3,"blockId":4}'),
    ).toEqual({ type: "place_block", x: 1, y: 2, z: 3, blockId: 4 });
    expect(parseClientMessage('{"type":"break_block","x":-1,"y":0,"z":7}')).toEqual({
      type: "break_block", x: -1, y: 0, z: 7,
    });
    expect(parseClientMessage('{"type":"place_block","x":1.5,"y":2,"z":3,"blockId":4}')).toBeNull();
    expect(parseClientMessage('{"type":"break_block","x":1,"y":2}')).toBeNull();
    expect(parseClientMessage('{"type":"place_block","x":1,"y":2,"z":3,"blockId":"4"}')).toBeNull();
  });

  it("descarta lixo: JSON quebrado, type desconhecido, campos errados", () => {
    expect(parseClientMessage("não é json")).toBeNull();
    expect(parseClientMessage('{"type":"hack"}')).toBeNull();
    expect(parseClientMessage('{"type":"join"}')).toBeNull();
    expect(parseClientMessage('{"type":"move","x":"a","y":2,"z":3,"yaw":0,"pitch":0}')).toBeNull();
    expect(parseClientMessage('{"type":"move","x":null,"y":2,"z":3,"yaw":0,"pitch":0}')).toBeNull();
    expect(parseClientMessage('{"type":"move","x":1e999,"y":2,"z":3,"yaw":0,"pitch":0}')).toBeNull();
  });

  it("parseServerMessage aceita player_moved e player_left (checkpoint 5)", () => {
    expect(
      parseServerMessage('{"type":"player_moved","id":2,"x":1.5,"y":10,"z":3,"yaw":0.5,"pitch":-0.1}'),
    ).toEqual({ type: "player_moved", id: 2, x: 1.5, y: 10, z: 3, yaw: 0.5, pitch: -0.1 });
    // nome viaja opcional (plaquinha sobre o boneco); inválido é descartado
    expect(
      parseServerMessage('{"type":"player_moved","id":2,"x":1,"y":2,"z":3,"yaw":0,"pitch":0,"name":"ana"}'),
    ).toEqual({ type: "player_moved", id: 2, x: 1, y: 2, z: 3, yaw: 0, pitch: 0, name: "ana" });
    expect(
      parseServerMessage('{"type":"player_moved","id":2,"x":1,"y":2,"z":3,"yaw":0,"pitch":0,"name":7}'),
    ).toEqual({ type: "player_moved", id: 2, x: 1, y: 2, z: 3, yaw: 0, pitch: 0 });
    expect(parseServerMessage('{"type":"player_left","id":2}')).toEqual({
      type: "player_left", id: 2,
    });
    // id deve ser inteiro; coordenadas devem ser números finitos
    expect(parseServerMessage('{"type":"player_moved","id":1.5,"x":1,"y":2,"z":3,"yaw":0,"pitch":0}')).toBeNull();
    expect(parseServerMessage('{"type":"player_moved","id":2,"x":"a","y":2,"z":3,"yaw":0,"pitch":0}')).toBeNull();
    expect(parseServerMessage('{"type":"player_moved","id":2,"x":1,"y":2,"z":3,"yaw":0}')).toBeNull();
    expect(parseServerMessage('{"type":"player_left","id":"2"}')).toBeNull();
    expect(parseServerMessage('{"type":"player_left"}')).toBeNull();
  });

  it("parseServerMessage aceita time (ciclo dia/noite, cp21)", () => {
    expect(parseServerMessage('{"type":"time","hora":13.5,"ciclo":true}')).toEqual({
      type: "time", hora: 13.5, ciclo: true,
    });
    expect(parseServerMessage('{"type":"time","hora":0,"ciclo":false}')).toEqual({
      type: "time", hora: 0, ciclo: false,
    });
    // hora tem que ser número finito; ciclo tem que ser boolean
    expect(parseServerMessage('{"type":"time","hora":"9","ciclo":true}')).toBeNull();
    expect(parseServerMessage('{"type":"time","hora":9,"ciclo":"sim"}')).toBeNull();
    expect(parseServerMessage('{"type":"time","hora":9}')).toBeNull();
  });

  it("parseServerMessage aceita kicked (aluno removido pelo professor, cp22)", () => {
    expect(parseServerMessage('{"type":"kicked","reason":"fora"}')).toEqual({
      type: "kicked", reason: "fora",
    });
    expect(parseServerMessage('{"type":"kicked"}')).toBeNull();
    expect(parseServerMessage('{"type":"kicked","reason":5}')).toBeNull();
  });

  it("parseServerMessage aceita teleport com orientação (volta-onde-parou / /tp)", () => {
    expect(
      parseServerMessage('{"type":"teleport","x":2.5,"y":20,"z":3.5,"yaw":1.2,"pitch":-0.3}'),
    ).toEqual({ type: "teleport", x: 2.5, y: 20, z: 3.5, yaw: 1.2, pitch: -0.3 });
    expect(parseServerMessage('{"type":"teleport","x":2.5,"y":20,"z":3.5}')).toBeNull();
    expect(parseServerMessage('{"type":"teleport","x":"a","y":20,"z":3.5,"yaw":0,"pitch":0}')).toBeNull();
  });

  it("parseServerMessage aceita spawn (ponto fixo do mundo)", () => {
    expect(parseServerMessage('{"type":"spawn","x":64.5,"y":27,"z":64.5}')).toEqual({
      type: "spawn", x: 64.5, y: 27, z: 64.5,
    });
    expect(parseServerMessage('{"type":"spawn","x":64.5,"y":27}')).toBeNull();
    expect(parseServerMessage('{"type":"spawn","x":"a","y":27,"z":64.5}')).toBeNull();
  });

  it("chat: cliente manda texto, servidor manda autor+texto (checkpoint 6)", () => {
    expect(parseClientMessage('{"type":"chat","text":"olá"}')).toEqual({
      type: "chat", text: "olá",
    });
    expect(parseClientMessage('{"type":"chat"}')).toBeNull();
    expect(parseClientMessage('{"type":"chat","text":5}')).toBeNull();
    expect(parseServerMessage('{"type":"chat","author":"ana#1","text":"olá"}')).toEqual({
      type: "chat", author: "ana#1", text: "olá",
    });
    expect(parseServerMessage('{"type":"chat","text":"olá"}')).toBeNull();
    expect(parseServerMessage('{"type":"chat","author":1,"text":"olá"}')).toBeNull();
  });

  it("parseServerMessage aceita debug_stats e block_changed, rejeita o resto", () => {
    expect(
      parseServerMessage('{"type":"debug_stats","tickAvgMs":0.1,"tickMaxMs":0.5,"tps":10}'),
    ).toEqual({ type: "debug_stats", tickAvgMs: 0.1, tickMaxMs: 0.5, tps: 10 });
    expect(
      parseServerMessage('{"type":"block_changed","x":1,"y":2,"z":3,"blockId":0}'),
    ).toEqual({ type: "block_changed", x: 1, y: 2, z: 3, blockId: 0 });
    expect(parseServerMessage('{"type":"block_changed","x":1.5,"y":2,"z":3,"blockId":0}')).toBeNull();
    expect(parseServerMessage('{"type":"outra"}')).toBeNull();
  });
});

describe("identidade cp9 no protocolo", () => {
  it("join aceita pin/codigo opcionais; presentes-mas-não-string rejeitam TUDO", () => {
    expect(parseClientMessage('{"type":"join","name":"ana","pin":"1234"}')).toEqual({
      type: "join", name: "ana", pin: "1234",
    });
    expect(
      parseClientMessage('{"type":"join","name":"p","pin":"4321","codigo":"salaverde"}'),
    ).toEqual({ type: "join", name: "p", pin: "4321", codigo: "salaverde" });
    // sem pin continua válido (singleplayer dispensa)
    expect(parseClientMessage('{"type":"join","name":"ana"}')).toEqual({
      type: "join", name: "ana",
    });
    // tipo errado = mensagem inteira inválida (parse defensivo)
    expect(parseClientMessage('{"type":"join","name":"ana","pin":1234}')).toBeNull();
    expect(parseClientMessage('{"type":"join","name":"ana","codigo":7}')).toBeNull();
  });

  it("join_denied: parse defensivo do lado do cliente", () => {
    expect(parseServerMessage('{"type":"join_denied","reason":"PIN incorreto."}')).toEqual({
      type: "join_denied", reason: "PIN incorreto.",
    });
    expect(parseServerMessage('{"type":"join_denied"}')).toBeNull();
    expect(parseServerMessage('{"type":"join_denied","reason":42}')).toBeNull();
  });
});
