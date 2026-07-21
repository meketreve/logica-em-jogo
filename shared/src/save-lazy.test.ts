import { describe, expect, it } from "vitest";
import { CHUNK_VOLUME } from "./constants";
import { LAZY_SAVE_MAGIC, decodeSave, encodeLazySave } from "./save";
import { GameSession } from "./session";
import { getBlock } from "./world";

/** Dims lazy de teste (33k chunks > teto denso) — mesmo caminho do tamanho E. */
const DIMS = { x: 64, z: 64, y: 8 };
const SEED = 20260721;
const CX = DIMS.x / 2; // coluna do spawn (centro)
const bx = CX * 16 + 4; // coordenada de bloco perto do spawn

function novaLazy() {
  const sent: { clientId: number; data: string | ArrayBuffer }[] = [];
  const s = new GameSession(
    (clientId, data) => sent.push({ clientId, data }),
    { singleplayer: true, dims: DIMS, seed: SEED, now: () => 0 },
  );
  return s;
}

describe("F3 — save esparso do mundo lazy", () => {
  it("round-trip: edições sobrevivem, terreno regenera do seed", () => {
    const s = novaLazy();
    expect(s.isLazy).toBe(true);
    s.handleMessage(1, JSON.stringify({ type: "join", name: "prof" }));
    // /bloco é teleoperação (sem alcance): coloca 3 blocos no AR acima do terreno
    s.handleMessage(1, JSON.stringify({ type: "chat", text: `/bloco ${bx} 70 ${bx} 2` }));
    s.handleMessage(1, JSON.stringify({ type: "chat", text: `/bloco ${bx + 1} 70 ${bx} 13` }));
    s.handleMessage(1, JSON.stringify({ type: "chat", text: `/bloco ${bx} 71 ${bx} 2` }));
    const editados = s.editedChunkIndices();
    expect(editados.length).toBeGreaterThan(0);
    // terreno gerado na coluna do spawn (bedrock na base) pra comparar depois
    const bedrockAntes = getBlock(s.world, bx, 0, bx);
    expect(bedrockAntes).not.toBe(0);

    const buf = encodeLazySave(s.world, s.toSave(), editados);
    expect(new DataView(buf).getUint32(0, true)).toBe(LAZY_SAVE_MAGIC);

    const save = decodeSave(buf);
    expect(save.dims).toEqual(DIMS);
    expect(save.editedChunks?.length).toBe(editados.length);

    // restaura numa sessão nova
    const s2 = new GameSession(() => {}, { singleplayer: true, restore: save, now: () => 0 });
    expect(s2.isLazy).toBe(true);
    // edições vivem
    expect(getBlock(s2.world, bx, 70, bx)).toBe(2);
    expect(getBlock(s2.world, bx + 1, 70, bx)).toBe(13);
    expect(getBlock(s2.world, bx, 71, bx)).toBe(2);
    // terreno NÃO editado regenerou igual (mesmo seed)
    expect(getBlock(s2.world, bx, 0, bx)).toBe(bedrockAntes);
    // re-salvar preserva o delta
    expect(s2.editedChunkIndices().sort()).toEqual(editados.sort());
  });

  it("save esparso é PEQUENO: header + JSON + só os chunks editados", () => {
    const s = novaLazy();
    s.handleMessage(1, JSON.stringify({ type: "join", name: "prof" }));
    s.handleMessage(1, JSON.stringify({ type: "chat", text: `/bloco ${bx} 70 ${bx} 2` }));
    const editados = s.editedChunkIndices();
    const buf = encodeLazySave(s.world, s.toSave(), editados);
    // 1 bloco editado = 1 chunk no save; o mundo INTEIRO seria dims*CHUNK_VOLUME
    const mundoInteiro = DIMS.x * DIMS.y * DIMS.z * CHUNK_VOLUME;
    expect(buf.byteLength).toBeLessThan(editados.length * CHUNK_VOLUME + 4096);
    expect(buf.byteLength).toBeLessThan(mundoInteiro / 100); // ordens de grandeza menor
  });

  it("save esparso truncado é rejeitado com erro claro", () => {
    const s = novaLazy();
    s.handleMessage(1, JSON.stringify({ type: "join", name: "prof" }));
    s.handleMessage(1, JSON.stringify({ type: "chat", text: `/bloco ${bx} 70 ${bx} 2` }));
    const buf = encodeLazySave(s.world, s.toSave(), s.editedChunkIndices());
    expect(() => decodeSave(buf.slice(0, buf.byteLength - 100))).toThrow(/truncado/);
  });
});
