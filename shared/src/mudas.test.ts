import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_FRUTA,
  MAX_BLOCK_ID,
  apoioValido,
  isMuda,
  isMudaInicial,
  isMudaMadura,
  isPlaceable,
  mudaDaFolhagem,
  mudaEstagio,
  mudaTipo,
} from "./blocks";
import {
  CHANCE_FRUTA_DA_FOLHA,
  CHANCE_MUDA_DA_FOLHA,
  dropsDe,
  formaCanonica,
} from "./drops";
import { TICKS_POR_CRESCIMENTO, crescerMuda } from "./rules";
import { decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { createWorld, getBlock, setBlock } from "./world";

/** Dimensões do mundo-meta dos testes de sessão (mundo pequeno, 2×2×2 chunks). */
const DIMS = { x: 2, z: 2, y: 2 };

/**
 * §🪵 (2026-08-15) — MUDAS DE ÁRVORE. A muda é a porta da cadeia das árvores:
 * plantar → esperar → ela VIRA a árvore completa do bioma, e a única fonte da
 * muda são as FOLHAS (1 em 10, junto da fruta). 4 espécies × 4 estágios = 16
 * ids, no molde da plantação: só o estágio 0 se coloca; os outros nascem no
 * tick; o estágio 3 (madura) materializa tronco + copa.
 */

/** Mundo pequeno com solo em (2,1,2) e ar em cima — o berçário dos testes. */
function berçario() {
  const world = createWorld({ x: 1, z: 1, y: 1 });
  setBlock(world, 2, 1, 2, BlockId.Dirt);
  setBlock(world, 2, 2, 2, BlockId.Air);
  return world;
}

/** Aplica crescerMuda em (x,y,z) e devolve as mudanças (setBlock pra dentro). */
function aplicar(world: ReturnType<typeof berçario>, x: number, y: number, z: number) {
  const changes = crescerMuda(world, x, y, z);
  if (changes) for (const c of changes) setBlock(world, c.x, c.y, c.z, c.blockId);
  return changes;
}

describe("§🪵 — os 16 ids: espécie × estágio", () => {
  it("o layout é quadrante por espécie, na ordem das ArvoreTipo", () => {
    const especies: readonly (readonly [number, string, number])[] = [
      [BlockId.MudaComum0, "comum", BlockId.MudaComum3],
      [BlockId.MudaIpe0, "ipe", BlockId.MudaIpe3],
      [BlockId.MudaAraucaria0, "araucaria", BlockId.MudaAraucaria3],
      [BlockId.MudaPauBrasil0, "paubrasil", BlockId.MudaPauBrasil3],
    ];
    for (const [base, tipo, ultimo] of especies) {
      expect(mudaTipo(base)).toBe(tipo);
      expect(mudaEstagio(base)).toBe(0);
      expect(isMudaInicial(base)).toBe(true);
      expect(mudaEstagio(ultimo)).toBe(3);
      expect(isMudaMadura(ultimo)).toBe(true);
      for (let e = 0; e < 4; e++) {
        expect(isMuda(base + e)).toBe(true);
        expect(mudaEstagio(base + e)).toBe(e);
        expect(mudaTipo(base + e)).toBe(tipo);
      }
    }
    expect(isMuda(BlockId.AipimSelvagem)).toBe(false);
    expect(mudaTipo(BlockId.Stone)).toBeNull();
    expect(mudaEstagio(BlockId.AipimSelvagem)).toBe(-1);
  });

  it("o teto de ids alcança as mudas (o portão de drops varre até ele)", () => {
    expect(MAX_BLOCK_ID).toBe(BlockId.BauLoja);
  });

  it("mudaDaFolhagem casa a folha com a MUDA DA PRÓPRIA espécie", () => {
    expect(mudaDaFolhagem(BlockId.Leaves)).toBe(BlockId.MudaComum0);
    expect(mudaDaFolhagem(BlockId.FolhasIpe)).toBe(BlockId.MudaIpe0);
    expect(mudaDaFolhagem(BlockId.FolhasAraucaria)).toBe(BlockId.MudaAraucaria0);
    expect(mudaDaFolhagem(BlockId.FolhasPauBrasil)).toBe(BlockId.MudaPauBrasil0);
  });
});

describe("§🪵 — colocação e apoio", () => {
  it("só a muda INICIAL se coloca — os crescidos nascem do tick", () => {
    for (const base of [
      BlockId.MudaComum0, BlockId.MudaIpe0,
      BlockId.MudaAraucaria0, BlockId.MudaPauBrasil0,
    ]) {
      expect(isPlaceable(base)).toBe(true);
      for (let e = 1; e < 4; e++) expect(isPlaceable(base + e)).toBe(false);
    }
  });

  it("muda exige SOLO, como toda planta (não pega em pedra nem areia)", () => {
    expect(apoioValido(BlockId.MudaComum0, BlockId.Dirt)).toBe(true);
    expect(apoioValido(BlockId.MudaComum0, BlockId.Grass)).toBe(true);
    expect(apoioValido(BlockId.MudaIpe0, BlockId.GramaSeca)).toBe(true);
    expect(apoioValido(BlockId.MudaIpe0, BlockId.Stone)).toBe(false);
    expect(apoioValido(BlockId.MudaPauBrasil0, BlockId.Sand)).toBe(false);
  });
});

describe("§🪵 — o drop é a cadeia: folha → muda → quebrar devolve a muda", () => {
  it("folha dá fruta E/OU a muda da própria espécie, em dois sorteios", () => {
    // sorteio 0: cai TUDO que a folha pode dar
    expect(dropsDe(BlockId.FolhasIpe, () => 0)).toEqual([
      { id: ITEM_FRUTA, qtd: 1 },
      { id: BlockId.MudaIpe0, qtd: 1 },
    ]);
    expect(dropsDe(BlockId.FolhasPauBrasil, () => 0)).toEqual([
      { id: ITEM_FRUTA, qtd: 1 },
      { id: BlockId.MudaPauBrasil0, qtd: 1 },
    ]);
    // sorteio no teto: nada cai
    expect(dropsDe(BlockId.Leaves, () => 0.999)).toEqual([]);
    // só fruta (muda falha) e só muda (fruta falha) — os dois são independentes
    const frutaSola = (() => {
      let n = 0;
      return () => (n++ % 2 === 0 ? 0 : 0.999);
    })();
    const got = dropsDe(BlockId.Leaves, frutaSola);
    expect(got).toEqual([{ id: ITEM_FRUTA, qtd: 1 }]);
    expect(CHANCE_MUDA_DA_FOLHA).toBeGreaterThan(0);
    expect(CHANCE_MUDA_DA_FOLHA).toBeLessThan(CHANCE_FRUTA_DA_FOLHA);
  });

  it("cada estágio volta como a muda-base DA SUA espécie (não a comum sempre)", () => {
    expect(formaCanonica(BlockId.MudaIpe2)).toBe(BlockId.MudaIpe0);
    expect(formaCanonica(BlockId.MudaAraucaria3)).toBe(BlockId.MudaAraucaria0);
    expect(formaCanonica(BlockId.MudaComum1)).toBe(BlockId.MudaComum0);
    expect(formaCanonica(BlockId.MudaPauBrasil0)).toBe(BlockId.MudaPauBrasil0);
  });

  it("quebrar a muda crescida devolve a muda-base", () => {
    expect(dropsDe(BlockId.MudaIpe3)).toEqual([{ id: BlockId.MudaIpe0, qtd: 1 }]);
    expect(dropsDe(BlockId.MudaComum2)).toEqual([{ id: BlockId.MudaComum0, qtd: 1 }]);
  });
});

describe("§🪵 — crescerMuda: avança e, na madura, MATERIALIZA a árvore", () => {
  it("avança um estágio por pulso, e só com SOLO no pé", () => {
    const world = berçario();
    setBlock(world, 2, 2, 2, BlockId.MudaComum0);
    for (let e = 0; e < 3; e++) {
      const changes = aplicar(world, 2, 2, 2);
      expect(changes).not.toBeNull();
      expect(getBlock(world, 2, 2, 2)).toBe(BlockId.MudaComum0 + e + 1);
    }
    // sem solo embaixo, não cresce
    const world2 = berçario();
    setBlock(world2, 2, 1, 2, BlockId.Stone);
    setBlock(world2, 2, 2, 2, BlockId.MudaComum0);
    expect(crescerMuda(world2, 2, 2, 2)).toBeNull();
    // não-muda: null
    expect(crescerMuda(world2, 2, 1, 2)).toBeNull();
  });

  it("a MADURA vira a árvore completa da espécie (tronco + copa)", () => {
    const world = berçario();
    setBlock(world, 2, 2, 2, BlockId.MudaIpe3);
    const changes = aplicar(world, 2, 2, 2);
    expect(changes).not.toBeNull();
    // a muda era a base → o primeiro tronco é LogIpe, não muda nem ar
    expect(getBlock(world, 2, 2, 2)).toBe(BlockId.LogIpe);
    // tronco acima + pelo menos uma folha de ipê na copa
    let tronco = 0;
    let copa = 0;
    for (let x = 0; x < 6; x++) {
      for (let y = 2; y < 9; y++) {
        for (let z = 0; z < 6; z++) {
          const b = getBlock(world, x, y, z);
          if (b === BlockId.LogIpe) tronco++;
          if (b === BlockId.FolhasIpe) copa++;
        }
      }
    }
    expect(tronco).toBeGreaterThanOrEqual(3);
    expect(copa).toBeGreaterThan(0);
    // e a árvore inteira sai no pulso: muda + tronco + copa
    expect(changes!.length).toBeGreaterThan(5);
  });

  it("é determinístico: a MESMA posição nasce a MESMA árvore", () => {
    const worldA = berçario();
    const worldB = berçario();
    for (const w of [worldA, worldB]) setBlock(w, 2, 2, 2, BlockId.MudaAraucaria3);
    const a = crescerMuda(worldA, 2, 2, 2);
    const b = crescerMuda(worldB, 2, 2, 2);
    expect(a).toEqual(b);
    // e ESPÉCIES diferentes geram troncos diferentes no mesmo lugar
    const worldC = berçario();
    setBlock(worldC, 2, 2, 2, BlockId.MudaComum3);
    const c = crescerMuda(worldC, 2, 2, 2);
    expect(c![0]!.blockId).toBe(BlockId.Log);
  });

  it("com o espaço ocupado, ABORTA e espera o próximo pulso", () => {
    const world = berçario();
    setBlock(world, 2, 2, 2, BlockId.MudaPauBrasil3);
    setBlock(world, 2, 3, 2, BlockId.Stone); // tronco não passa por pedra
    expect(crescerMuda(world, 2, 2, 2)).toBeNull();
    expect(getBlock(world, 2, 2, 2)).toBe(BlockId.MudaPauBrasil3); // segue vivo
  });
});

describe("§🪵 — pelo fio: a muda planta, cresce e vira árvore", () => {
  function baseSave() {
    const session = new GameSession(() => {}, { dims: DIMS, seed: 5, codigo: "sala" });
    return decodeSave(encodeSave(session.world, session.toSave()));
  }
  function turma(save = baseSave()) {
    save.modo = "sobrevivencia";
    const sent: { clientId: number; data: string | ArrayBuffer }[] = [];
    const session = new GameSession(
      (clientId, data) => sent.push({ clientId, data }),
      { restore: save, codigo: "sala" },
    );
    session.handleMessage(1, JSON.stringify({ type: "join", name: "prof", pin: "4321", codigo: "sala" }));
    session.handleMessage(2, JSON.stringify({ type: "join", name: "ana", pin: "1111" }));
    return { session };
  }

  it("a muda plantada no solo amadurece no pulso e vira a árvore", () => {
    const { session } = turma();
    const s = session.spawn;
    // canteiro ao lado do spawn (não na célula do jogador), com solo e ar acima
    const x = Math.floor(s.x) + 2;
    const z = Math.floor(s.z);
    const chao = Math.floor(s.y) - 1; // altura do chão
    setBlock(session.world, x, chao, z, BlockId.Dirt);
    setBlock(session.world, x, chao + 1, z, BlockId.Air);
    const py = chao + 1; // célula onde a muda vai
    session.handleMessage(1, JSON.stringify({ type: "chat", text: `/dar ana ${BlockId.MudaComum0} 4` }));
    session.handleMessage(2, JSON.stringify({ type: "place_block", x, y: py, z, blockId: BlockId.MudaComum0 }));
    expect(getBlock(session.world, x, py, z)).toBe(BlockId.MudaComum0);

    // 4 pulsos: estágios 1, 2, 3 e — no último — a árvore
    for (let pulso = 0; pulso < 4; pulso++) {
      for (let i = 0; i < TICKS_POR_CRESCIMENTO; i++) session.tick();
      if (pulso < 3) {
        expect(getBlock(session.world, x, py, z)).toBe(BlockId.MudaComum0 + pulso + 1);
      }
    }
    // no 4º pulso a muda MADURA virou carvalho: a base é o tronco
    expect(getBlock(session.world, x, py, z)).toBe(BlockId.Log);
    // e mais tempo não nasce vegetação no lugar da árvore (índice limpo)
    const antes = getBlock(session.world, x, py, z);
    for (let i = 0; i < TICKS_POR_CRESCIMENTO * 2; i++) session.tick();
    expect(getBlock(session.world, x, py, z)).toBe(antes);
  });
});