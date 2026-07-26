import { describe, expect, it } from "vitest";
import { BlockId, createWorld, isPlaceable, meshChunk, setBlock } from "./index";

const DIMS = { x: 1, z: 1, y: 1 } as const;

describe("culled mesher (função pura: bytes → geometria)", () => {
  it("chunk vazio gera geometria vazia", () => {
    const w = createWorld(DIMS);
    const g = meshChunk(w, 0, 0, 0);
    expect(g.indices.length).toBe(0);
    expect(g.positions.length).toBe(0);
  });

  it("1 bloco isolado = 6 faces (24 vértices, 36 índices)", () => {
    const w = createWorld(DIMS);
    setBlock(w, 8, 8, 8, BlockId.Stone);
    const g = meshChunk(w, 0, 0, 0);
    expect(g.positions.length).toBe(24 * 3);
    expect(g.normals.length).toBe(24 * 3);
    expect(g.uvs.length).toBe(24 * 2);
    expect(g.indices.length).toBe(36);
  });

  it("água vai pro grupo separado (opaqueIndexCount fatia opaco × água)", () => {
    // só pedra → tudo opaco, sem grupo de água
    const so = createWorld(DIMS);
    setBlock(so, 8, 8, 8, BlockId.Stone);
    const gso = meshChunk(so, 0, 0, 0);
    expect(gso.opaqueIndexCount).toBe(gso.indices.length); // 36, zero água

    // só água isolada → 6 faces, TODAS no grupo da água (opaco = 0)
    const sa = createWorld(DIMS);
    setBlock(sa, 8, 8, 8, BlockId.Agua);
    const gsa = meshChunk(sa, 0, 0, 0);
    expect(gsa.indices.length).toBe(36);
    expect(gsa.opaqueIndexCount).toBe(0); // nada opaco

    // pedra + água lado a lado: opaco antes, água depois (concatenados)
    const mix = createWorld(DIMS);
    setBlock(mix, 8, 8, 8, BlockId.Stone);
    setBlock(mix, 10, 8, 8, BlockId.Agua); // separadas (não fundem, não se ocluem)
    const gmix = meshChunk(mix, 0, 0, 0);
    expect(gmix.opaqueIndexCount).toBe(36); // 6 faces de pedra
    expect(gmix.indices.length - gmix.opaqueIndexCount).toBe(36); // 6 faces de água
  });

  // 2026-07-25: vidro colorido saiu do cutout e virou 3º grupo (blend ~20%)
  it("vidro colorido vai pro 3º grupo (opaco | água | vidro, nessa ordem)", () => {
    const w = createWorld(DIMS);
    setBlock(w, 8, 8, 8, BlockId.Stone);
    setBlock(w, 10, 8, 8, BlockId.Agua);
    setBlock(w, 12, 8, 8, BlockId.VidroAzul); // os 3 separados: nada funde/oclui
    const g = meshChunk(w, 0, 0, 0);
    expect(g.opaqueIndexCount).toBe(36); // pedra
    expect(g.aguaIndexCount).toBe(36); // água, logo depois
    expect(g.indices.length - g.opaqueIndexCount - g.aguaIndexCount).toBe(36); // vidro por último
  });

  it("2 blocos adjacentes = 10 faces (faces internas culled)", () => {
    const w = createWorld(DIMS);
    setBlock(w, 8, 8, 8, BlockId.Stone);
    setBlock(w, 9, 8, 8, BlockId.Stone);
    const g = meshChunk(w, 0, 0, 0);
    expect(g.indices.length).toBe(10 * 6);
  });

  it("cubo 3×3×3 = só a superfície (54 faces), bloco central 100% culled", () => {
    const w = createWorld(DIMS);
    for (let x = 4; x < 7; x++)
      for (let y = 4; y < 7; y++)
        for (let z = 4; z < 7; z++) setBlock(w, x, y, z, BlockId.Stone);
    const g = meshChunk(w, 0, 0, 0);
    expect(g.indices.length).toBe(54 * 6);
  });

  it("UVs ficam dentro de [0,1]", () => {
    const w = createWorld(DIMS);
    setBlock(w, 0, 0, 0, BlockId.Grass);
    const g = meshChunk(w, 0, 0, 0);
    for (const uv of g.uvs) {
      expect(uv).toBeGreaterThanOrEqual(0);
      expect(uv).toBeLessThanOrEqual(1);
    }
  });

  it("TODO bloco colocável tem tiles no atlas — mesher não pula nenhum id", () => {
    for (let id = 1; isPlaceable(id); id++) {
      const w = createWorld(DIMS);
      setBlock(w, 8, 8, 8, id);
      // sem entrada em BLOCK_TILES o mesher pularia o bloco (0 faces) — bloco invisível
      expect(meshChunk(w, 0, 0, 0).indices.length, `bloco id ${id}`).toBe(36);
    }
  });

  it("cp18: opaco encostado em vidro EMITE a face (dá pra ver através)", () => {
    const w = createWorld(DIMS);
    setBlock(w, 8, 8, 8, BlockId.Stone);
    setBlock(w, 8, 9, 8, BlockId.Glass);
    const g = meshChunk(w, 0, 0, 0);
    // pedra: 6 faces (5 ar + 1 contra o vidro); vidro: 5 faces (base coplanar
    // com o topo da pedra NÃO é emitida — z-fight)
    expect(g.indices.length).toBe(11 * 6);
  });

  it("cp18: transparentes IGUAIS fundem; transparentes DIFERENTES mostram as faces", () => {
    const w = createWorld(DIMS);
    setBlock(w, 8, 8, 8, BlockId.Glass);
    setBlock(w, 9, 8, 8, BlockId.Glass);
    // mesmo id encostado = vidraça contínua (sem face interna, sem z-fight)
    expect(meshChunk(w, 0, 0, 0).indices.length).toBe(10 * 6); // 5 + 5

    // folha colada no vidro: OS DOIS emitem a face de contato (bug do playtest —
    // a folha sumia atrás do vidro). Coplanares opostas = uma é backface e some
    // no culling, então não brigam por profundidade.
    setBlock(w, 10, 8, 8, BlockId.Leaves);
    expect(meshChunk(w, 0, 0, 0).indices.length).toBe(16 * 6); // 5 + 5 + 6
  });

  it("borda do mundo conta como ar (face externa aparece)", () => {
    const w = createWorld(DIMS);
    setBlock(w, 0, 0, 0, BlockId.Stone); // canto do mundo
    const g = meshChunk(w, 0, 0, 0);
    expect(g.indices.length).toBe(36); // 6 faces mesmo encostado na borda
  });
});

describe("fast path de chunk vazio (2026-07-19)", () => {
  it("chunk 100% ar devolve geometria vazia; com 1 bloco, emite", () => {
    const world = createWorld({ x: 1, z: 1, y: 2 });
    setBlock(world, 5, 5, 5, BlockId.Stone); // chunk de BAIXO tem 1 bloco
    const cheio = meshChunk(world, 0, 0, 0);
    expect(cheio.positions.length).toBeGreaterThan(0);
    const vazio = meshChunk(world, 0, 1, 0); // chunk de cima é só ar
    expect(vazio.positions.length).toBe(0);
    expect(vazio.indices.length).toBe(0);
  });
});
