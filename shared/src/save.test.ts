import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { SAVE_MAGIC, decodeSave, encodeSave } from "./save";
import { getBlock, setBlock } from "./world";
import { generateWorld } from "./worldgen";

const DIMS = { x: 2, z: 2, y: 2 };
const META = {
  seed: 42,
  spawn: { x: 16.5, y: 20, z: 16.5 },
  roster: [
    { name: "ana", x: 3.5, y: 18, z: 7.5, yaw: 1.2, pitch: -0.3 },
    { name: "bia", x: 20.1, y: 25, z: 4.9, yaw: 0, pitch: 0 },
  ],
};

describe("save .ljw (JSON de metadados + snapshot binário)", () => {
  it("roundtrip: mundo EDITADO, seed, spawn e roster voltam idênticos", () => {
    const world = generateWorld(DIMS, 42);
    setBlock(world, 5, 30, 5, BlockId.Brick); // edição pós-geração TEM que persistir
    const save = decodeSave(encodeSave(world, META));
    expect(save.seed).toBe(42);
    expect(save.spawn).toEqual(META.spawn);
    expect(save.roster).toEqual(META.roster);
    expect(getBlock(save.world, 5, 30, 5)).toBe(BlockId.Brick);
    for (let i = 0; i < world.chunks.length; i++) {
      expect(save.world.chunks[i]).toEqual(world.chunks[i]);
    }
  });

  it("rejeita lixo: magic errado, truncado, JSON quebrado, meta incompleta", () => {
    const world = generateWorld(DIMS, 1);
    const buf = encodeSave(world, META);

    const badMagic = buf.slice(0);
    new DataView(badMagic).setUint32(0, 0xdeadbeef, true);
    expect(() => decodeSave(badMagic)).toThrow(/magic/);

    expect(() => decodeSave(buf.slice(0, 4))).toThrow(/header/);
    expect(() => decodeSave(buf.slice(0, 40))).toThrow(); // corta o snapshot

    const badJsonLen = buf.slice(0);
    new DataView(badJsonLen).setUint32(4, buf.byteLength * 2, true);
    expect(() => decodeSave(badJsonLen)).toThrow(/truncado/);
  });

  it("roster inválido é descartado entrada a entrada (não derruba o load)", () => {
    const world = generateWorld(DIMS, 1);
    const meta = {
      seed: 1,
      spawn: { x: 1, y: 2, z: 3 },
      roster: [
        { name: "ok", x: 1, y: 2, z: 3 }, // formato ANTIGO (sem yaw/pitch)
        { name: 5, x: 1, y: 2, z: 3 }, // nome não-string
        { name: "sempos", x: "a", y: 2, z: 3 }, // pos inválida
      ],
    } as never;
    const save = decodeSave(encodeSave(world, meta));
    // save antigo continua válido: orientação faltando vira 0
    expect(save.roster).toEqual([{ name: "ok", x: 1, y: 2, z: 3, yaw: 0, pitch: 0 }]);
  });

  it("magic LJS1 correto no arquivo", () => {
    const buf = encodeSave(generateWorld(DIMS, 1), META);
    expect(new DataView(buf).getUint32(0, true)).toBe(SAVE_MAGIC);
    // bytes literais "LJS1" (identificável num hexdump)
    expect([...new Uint8Array(buf, 0, 4)]).toEqual([0x4c, 0x4a, 0x53, 0x31]);
  });
});
