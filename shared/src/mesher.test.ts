import { describe, expect, it } from "vitest";
import {
  AGUA_TOPO,
  BlockId,
  createWorld,
  extrairVizinhanca,
  getBlock,
  isPlaceable,
  meshChunk,
  meshVizinhanca,
  setBlock,
} from "./index";

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

describe("superfície da água por nível (2026-07-26)", () => {
  /** Todos os vértices de topo, agrupados por canto (x,z) do mundo. */
  function cantos(g: { positions: Float32Array }, yCelula: number): Map<string, Set<number>> {
    const m = new Map<string, Set<number>>();
    for (let i = 0; i < g.positions.length; i += 3) {
      const y = g.positions[i + 1]!;
      if (y <= yCelula + 1e-6 || y > yCelula + 1 + 1e-6) continue; // só o topo da célula
      const k = `${g.positions[i]!.toFixed(3)},${g.positions[i + 2]!.toFixed(3)}`;
      const s = m.get(k) ?? new Set<number>();
      s.add(Number(y.toFixed(5)));
      m.set(k, s);
    }
    return m;
  }

  it("fonte isolada: topo abaixo do teto da célula (lâmina d'água)", () => {
    const w = createWorld(DIMS);
    setBlock(w, 8, 8, 8, BlockId.Agua);
    const g = meshChunk(w, 0, 0, 0);
    for (const [, alturas] of cantos(g, 8)) {
      expect([...alturas]).toEqual([8 + AGUA_TOPO]);
    }
  });

  it("níveis vizinhos casam as pontas: 1 altura por canto compartilhado", () => {
    const w = createWorld(DIMS);
    setBlock(w, 8, 8, 8, BlockId.Agua); // nível 8
    setBlock(w, 9, 8, 8, BlockId.AguaFluida4); // nível 4
    setBlock(w, 10, 8, 8, BlockId.AguaFluida1); // nível 1
    const g = meshChunk(w, 0, 0, 0);
    // cada canto (x,z) tem UM único y — sem degrau/fresta entre as células
    for (const [k, alturas] of cantos(g, 8)) {
      expect(`${k}: ${[...alturas]}`).toBe(`${k}: ${[...alturas][0]}`);
    }
    // e a superfície DESCE com o nível: canto entre 8 e 4 > canto entre 4 e 1
    const alto = [...(cantos(g, 8).get("9.000,8.000") ?? [])][0]!;
    const baixo = [...(cantos(g, 8).get("10.000,8.000") ?? [])][0]!;
    expect(alto).toBeGreaterThan(baixo);
  });

  it("água submersa (água em cima) vai ao teto da célula — sem fresta", () => {
    const w = createWorld(DIMS);
    setBlock(w, 8, 8, 8, BlockId.Agua);
    setBlock(w, 8, 9, 8, BlockId.Agua);
    const g = meshChunk(w, 0, 0, 0);
    for (const [, alturas] of cantos(g, 8)) expect([...alturas]).toEqual([9]);
  });
});

describe("vizinhança padded (o que atravessa pro Web Worker)", () => {
  /** Mundo 2×2×2 chunks com padrão determinístico e denso o bastante pra ter
   *  bloco em toda borda — é a borda que o `set()` de linha NÃO cobre. */
  function mundoRuidoso() {
    const w = createWorld({ x: 2, z: 2, y: 2 });
    for (let y = 0; y < 32; y++)
      for (let z = 0; z < 32; z++)
        for (let x = 0; x < 32; x++) {
          const n = (x * 7 + y * 13 + z * 31) % 5;
          if (n !== 0)
            setBlock(
              w, x, y, z,
              n === 1 ? BlockId.Stone : n === 2 ? BlockId.Dirt : n === 3 ? BlockId.Agua : BlockId.Glass,
            );
        }
    return w;
  }

  /** Comparação MANUAL: `toEqual` em typed array de centenas de milhares de
   *  itens estoura o timeout de 5 s do vitest (visto em 2026-07-26). Devolve
   *  a primeira divergência, que é o que a mensagem de erro precisa mostrar. */
  function difere(a: ArrayLike<number>, b: ArrayLike<number>, nome: string): string | null {
    if (a.length !== b.length) return `${nome}: ${a.length} itens != ${b.length}`;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return `${nome}[${i}]: ${a[i]} != ${b[i]}`;
    }
    return null;
  }

  it("reproduz getBlock em TODA a casca, inclusive quinas e fora do mundo", () => {
    const w = mundoRuidoso();
    let erro: string | null = null;
    for (let cy = 0; cy < 2 && !erro; cy++)
      for (let cz = 0; cz < 2 && !erro; cz++)
        for (let cx = 0; cx < 2 && !erro; cx++) {
          const viz = extrairVizinhanca(w, cx, cy, cz);
          if (!viz) { erro = `chunk ${cx},${cy},${cz} veio null`; break; }
          for (let ly = -1; ly <= 16 && !erro; ly++)
            for (let lz = -1; lz <= 16 && !erro; lz++)
              for (let lx = -1; lx <= 16; lx++) {
                const esperado = getBlock(w, cx * 16 + lx, cy * 16 + ly, cz * 16 + lz);
                const lido = viz[((ly + 1) * 18 + (lz + 1)) * 18 + (lx + 1)];
                if (lido !== esperado) {
                  erro = `chunk ${cx},${cy},${cz} celula ${lx},${ly},${lz}: ${lido} != ${esperado}`;
                  break;
                }
              }
        }
    expect(erro).toBeNull();
  });

  it("meshVizinhanca(extrairVizinhanca(...)) === meshChunk(...) — é o mesmo mesh", () => {
    const w = mundoRuidoso();
    let erro: string | null = null;
    for (let cy = 0; cy < 2 && !erro; cy++)
      for (let cz = 0; cz < 2 && !erro; cz++)
        for (let cx = 0; cx < 2 && !erro; cx++) {
          const direto = meshChunk(w, cx, cy, cz);
          const viaWorker = meshVizinhanca(extrairVizinhanca(w, cx, cy, cz)!);
          const onde = `chunk ${cx},${cy},${cz} `;
          erro =
            difere(viaWorker.positions, direto.positions, onde + "positions") ??
            difere(viaWorker.normals, direto.normals, onde + "normals") ??
            difere(viaWorker.uvs, direto.uvs, onde + "uvs") ??
            difere(viaWorker.indices, direto.indices, onde + "indices") ??
            (viaWorker.opaqueIndexCount !== direto.opaqueIndexCount ? onde + "opaqueIndexCount" : null) ??
            (viaWorker.aguaIndexCount !== direto.aguaIndexCount ? onde + "aguaIndexCount" : null);
        }
    expect(erro).toBeNull();
  });

  it("chunk 100% ar (e chunk ausente) devolve null — fast path preservado", () => {
    const w = createWorld({ x: 1, z: 1, y: 1 });
    expect(extrairVizinhanca(w, 0, 0, 0)).toBeNull();
    const esparso = createWorld({ x: 1, z: 1, y: 1 }, false);
    expect(extrairVizinhanca(esparso, 0, 0, 0)).toBeNull();
  });
});
