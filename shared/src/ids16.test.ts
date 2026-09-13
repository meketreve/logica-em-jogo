// O /shared não carrega os tipos do Node (roda no navegador também), mas o
// vitest roda no Node: o portão com os .ljw REAIS precisa ler arquivo.
// @ts-expect-error — tipos do Node ausentes de propósito no /shared
import { readFileSync } from "node:fs";
// @ts-expect-error — idem
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BlockId, ITEM_BALDE_VAZIO, MAX_BLOCK_ID } from "./blocks";
import { LARGURA_ESTREITA, LARGURA_LARGA, bytesDoChunk, escreverChunk, lerChunk } from "./chunkCodec";
import { CHUNK_VOLUME } from "./constants";
import { extrairVizinhanca } from "./mesher";
import {
  COLUNAS_MAGIC,
  COLUNAS_MAGIC_V0,
  SNAPSHOT_HEADER_BYTES,
  SNAPSHOT_MAGIC_V0,
  decodeColunas,
  decodeSnapshot,
  encodeColunas,
  encodeSnapshot,
} from "./protocol";
import { LAZY_SAVE_MAGIC_V2, SAVE_MAGIC, decodeSave, encodeLazySave, encodeSave, saveEhLegado } from "./save";
import { GameSession } from "./session";
import { createWorld, getBlock, setBlock } from "./world";

/**
 * Ids de bloco em 16 bits (2026-09-12). Um id ≥ 256 ainda não existe no jogo,
 * então os testes escrevem direto no chunk um valor ALTO que continua ≤
 * MAX_BLOCK_ID quando ele crescer — e, enquanto não cresce, provam o caminho
 * com o maior id que existe. O que importa é que NADA no caminho corte o valor
 * em 8 bits: por isso o teste de "largo" usa um valor montado com o byte alto.
 */
declare const __dirname: string;
declare class TextEncoder {
  encode(input: string): Uint8Array;
}

const ALTO = 0x0100 | BlockId.Stone; // 258: se algo cortar em 8 bits, vira 2 (pedra)

/** Escreve um valor cru no chunk, sem passar pelo `setBlock` (que não valida). */
function cru(w: ReturnType<typeof createWorld>, x: number, y: number, z: number, v: number) {
  setBlock(w, x, y, z, v);
}

describe("chunkCodec: largura por chunk", () => {
  it("chunk só com ids ≤ 255 vai ESTREITO (1 + 4096 bytes) — mundo de hoje não cresce", () => {
    const c = new Uint16Array(CHUNK_VOLUME).fill(BlockId.Stone);
    expect(bytesDoChunk(c)).toBe(1 + CHUNK_VOLUME);
    const dest = new Uint8Array(bytesDoChunk(c));
    escreverChunk(dest, 0, c);
    expect(dest[0]).toBe(LARGURA_ESTREITA);
  });

  it("um id ≥ 256 deixa o chunk LARGO e volta inteiro (todos os 16 bits)", () => {
    const c = new Uint16Array(CHUNK_VOLUME).fill(BlockId.Stone);
    c[123] = ALTO;
    c[4095] = 0xffff;
    expect(bytesDoChunk(c)).toBe(1 + 2 * CHUNK_VOLUME);
    const buf = new Uint8Array(bytesDoChunk(c));
    escreverChunk(buf, 0, c);
    expect(buf[0]).toBe(LARGURA_LARGA);
    const volta = new Uint16Array(CHUNK_VOLUME);
    lerChunk(buf, 0, volta, "t", 0xffff);
    expect(Array.from(volta)).toEqual(Array.from(c));
  });

  it("id acima do que ESTA versão conhece é recusado (mundo de versão mais nova)", () => {
    const c = new Uint16Array(CHUNK_VOLUME);
    c[0] = MAX_BLOCK_ID + 1 > 0xff ? MAX_BLOCK_ID + 1 : 0x0100 + MAX_BLOCK_ID;
    const buf = new Uint8Array(bytesDoChunk(c));
    escreverChunk(buf, 0, c);
    expect(() => lerChunk(buf, 0, new Uint16Array(CHUNK_VOLUME), "t")).toThrow(/não existe/);
  });

  it("largura desconhecida e chunk truncado lançam", () => {
    const buf = new Uint8Array(1 + CHUNK_VOLUME);
    buf[0] = 7;
    expect(() => lerChunk(buf, 0, undefined, "t")).toThrow(/largura/);
    buf[0] = LARGURA_ESTREITA;
    expect(() => lerChunk(buf.subarray(0, 100), 0, undefined, "t")).toThrow(/truncado/);
  });
});

describe("nada no caminho do chunk corta o id em 8 bits", () => {
  it("o World guarda 16 bits por célula", () => {
    const w = createWorld({ x: 1, y: 1, z: 1 });
    cru(w, 3, 3, 3, ALTO);
    expect(getBlock(w, 3, 3, 3)).toBe(ALTO);
  });

  it("a vizinhança do mesher (o que vai pro Worker) também", () => {
    const w = createWorld({ x: 1, y: 1, z: 1 });
    cru(w, 3, 3, 3, ALTO);
    const viz = extrairVizinhanca(w, 0, 0, 0)!;
    expect(viz).toBeInstanceOf(Uint16Array);
    expect(Array.from(viz)).toContain(ALTO);
  });
});

describe("formatos NOVOS: ida e volta com o maior id existente (e o tamanho de hoje)", () => {
  const mundo = () => {
    const w = createWorld({ x: 2, y: 1, z: 2 });
    cru(w, 1, 1, 1, MAX_BLOCK_ID);
    cru(w, 20, 5, 20, BlockId.CamaCabecaZN);
    return w;
  };

  it("snapshot LJW1", () => {
    const w = mundo();
    const s = decodeSnapshot(encodeSnapshot(w, 9));
    expect(s.legado).toBeUndefined();
    expect(getBlock(s.world, 1, 1, 1)).toBe(MAX_BLOCK_ID);
    expect(getBlock(s.world, 20, 5, 20)).toBe(BlockId.CamaCabecaZN);
  });

  it("lote de colunas LJC1", () => {
    const w = mundo();
    const buf = encodeColunas(w, [{ cx: 0, cz: 0 }, { cx: 1, cz: 1 }]);
    expect(new DataView(buf).getUint32(0, true)).toBe(COLUNAS_MAGIC);
    const alvo = createWorld(w.dims, false);
    expect(decodeColunas(buf, alvo)).toEqual([{ cx: 0, cz: 0 }, { cx: 1, cz: 1 }]);
    expect(getBlock(alvo, 1, 1, 1)).toBe(MAX_BLOCK_ID);
    expect(getBlock(alvo, 20, 5, 20)).toBe(BlockId.CamaCabecaZN);
  });

  it("save esparso LJS3", () => {
    const w = mundo();
    const s0 = new GameSession(() => {}, { dims: w.dims, seed: 3, codigo: "c" });
    const buf = encodeLazySave(w, s0.toSave(), [0, 3]);
    const d = decodeSave(buf);
    expect(d.legado).toBeUndefined();
    expect(d.editedChunks?.map((c) => c.index)).toEqual([0, 3]);
    expect(d.editedChunks?.[0]?.bytes).toBeInstanceOf(Uint16Array);
  });

  it("snapshot de mundo sem id ≥ 256 custa só 1 byte a mais por chunk", () => {
    const w = mundo();
    expect(encodeSnapshot(w, 1).byteLength).toBe(SNAPSHOT_HEADER_BYTES + w.chunks.length * (1 + CHUNK_VOLUME));
  });
});

/** Monta à mão os formatos ANTIGOS (1 byte por bloco, sem largura por chunk). */
function snapshotV0(w: ReturnType<typeof createWorld>, seed: number): ArrayBuffer {
  const buf = new ArrayBuffer(SNAPSHOT_HEADER_BYTES + w.chunks.length * CHUNK_VOLUME);
  const v = new DataView(buf);
  v.setUint32(0, SNAPSHOT_MAGIC_V0, true);
  v.setUint8(4, w.dims.x);
  v.setUint8(5, w.dims.z);
  v.setUint8(6, w.dims.y);
  v.setUint32(8, seed, true);
  const body = new Uint8Array(buf);
  w.chunks.forEach((c, i) => c && body.set(c, SNAPSHOT_HEADER_BYTES + i * CHUNK_VOLUME));
  return buf;
}

describe("formatos ANTIGOS continuam sendo lidos (e avisam que são antigos)", () => {
  const velho = () => {
    const w = createWorld({ x: 2, y: 1, z: 2 });
    cru(w, 1, 1, 1, BlockId.Brick);
    return w;
  };

  it("LJW0 dentro de LJS1 (o .ljw de cenário distribuído)", () => {
    const w = velho();
    const s0 = new GameSession(() => {}, { dims: w.dims, seed: 3, codigo: "c" });
    const json = new TextEncoder().encode(JSON.stringify(s0.toSave()));
    const snap = new Uint8Array(snapshotV0(w, 3));
    const buf = new ArrayBuffer(8 + json.byteLength + snap.byteLength);
    const v = new DataView(buf);
    v.setUint32(0, SAVE_MAGIC, true);
    v.setUint32(4, json.byteLength, true);
    new Uint8Array(buf, 8).set(json);
    new Uint8Array(buf, 8 + json.byteLength).set(snap);
    const d = decodeSave(buf);
    expect(d.legado).toBe(true);
    expect(getBlock(d.world, 1, 1, 1)).toBe(BlockId.Brick);
  });

  it("LJC0 (lote de colunas antigo)", () => {
    const w = velho();
    const buf = new ArrayBuffer(8 + 4 + w.dims.y * CHUNK_VOLUME);
    const v = new DataView(buf);
    v.setUint32(0, COLUNAS_MAGIC_V0, true);
    v.setUint16(4, 1, true);
    new Uint8Array(buf, 12).set(w.chunks[0]!);
    const alvo = createWorld(w.dims, false);
    decodeColunas(buf, alvo);
    expect(getBlock(alvo, 1, 1, 1)).toBe(BlockId.Brick);
  });

  it("LJS2 (save esparso antigo)", () => {
    const w = velho();
    const s0 = new GameSession(() => {}, { dims: w.dims, seed: 3, codigo: "c" });
    const json = new TextEncoder().encode(JSON.stringify({ ...s0.toSave(), dims: w.dims }));
    const buf = new ArrayBuffer(8 + json.byteLength + 4 + 4 + CHUNK_VOLUME);
    const v = new DataView(buf);
    v.setUint32(0, LAZY_SAVE_MAGIC_V2, true);
    v.setUint32(4, json.byteLength, true);
    new Uint8Array(buf, 8).set(json);
    let off = 8 + json.byteLength;
    v.setUint32(off, 1, true);
    v.setUint32(off + 4, 0, true);
    new Uint8Array(buf, off + 8).set(w.chunks[0]!);
    const d = decodeSave(buf);
    expect(d.legado).toBe(true);
    expect(d.editedChunks?.[0]?.bytes[1 + 16 + 256]).toBe(BlockId.Brick); // (1,1,1)
  });

  it("save novo (LJS1 com LJW1) NÃO é marcado antigo", () => {
    const w = velho();
    const s0 = new GameSession(() => {}, { dims: w.dims, seed: 3, codigo: "c" });
    expect(decodeSave(encodeSave(w, s0.toSave())).legado).toBeUndefined();
  });

  it("saveEhLegado responde pelo cabeçalho (o singleplayer guarda o original com isso)", () => {
    const w = velho();
    const s0 = new GameSession(() => {}, { dims: w.dims, seed: 3, codigo: "c" });
    expect(saveEhLegado(encodeSave(w, s0.toSave()))).toBe(false);
    expect(saveEhLegado(encodeLazySave(w, s0.toSave(), [0]))).toBe(false);
    const json = new TextEncoder().encode(JSON.stringify(s0.toSave()));
    const snap = new Uint8Array(snapshotV0(w, 3));
    const antigo = new ArrayBuffer(8 + json.byteLength + snap.byteLength);
    const v = new DataView(antigo);
    v.setUint32(0, SAVE_MAGIC, true);
    v.setUint32(4, json.byteLength, true);
    new Uint8Array(antigo, 8).set(json);
    new Uint8Array(antigo, 8 + json.byteLength).set(snap);
    expect(saveEhLegado(antigo)).toBe(true);
    expect(saveEhLegado(new ArrayBuffer(3))).toBe(false);
  });
});

describe("portão: .ljw REAIS de antes da mudança abrem com os MESMOS blocos", () => {
  /** FNV-1a sobre todas as células dos chunks alocados. Os valores esperados
   *  foram medidos com o código de 1 byte, ANTES da troca (2026-09-12). */
  const hash = (caminho: string) => {
    const b: Uint8Array = readFileSync(join(__dirname, "..", "..", caminho));
    const d = decodeSave(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer);
    let h = 0x811c9dc5 >>> 0;
    for (const c of d.world.chunks) {
      if (!c) continue;
      for (let i = 0; i < c.length; i++) h = Math.imul(h ^ c[i]!, 0x01000193) >>> 0;
    }
    return { h, legado: d.legado };
  };

  it("cenarios/aula1-sequencia.ljw", () => {
    expect(hash("cenarios/aula1-sequencia.ljw")).toEqual({ h: 20783349, legado: true });
  });

  it("server/world.ljw", () => {
    expect(hash("server/world.ljw")).toEqual({ h: 4158559134, legado: true });
  });
});

describe("teto dos ids de bloco", () => {
  it("todo bloco fica ABAIXO dos itens (que começam em 900)", () => {
    expect(MAX_BLOCK_ID).toBeLessThan(ITEM_BALDE_VAZIO);
    for (const v of Object.values(BlockId)) expect(v).toBeLessThan(ITEM_BALDE_VAZIO);
  });
});
