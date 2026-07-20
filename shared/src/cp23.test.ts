import { describe, expect, it } from "vitest";
import {
  BlockId,
  isFullCube,
  isPlaceable,
  isPorta,
  isSolidBlock,
  portaToggled,
} from "./blocks";
import { meshChunk } from "./mesher";
import { createPlayer, stepPlayer } from "./physics";
import { parseClientMessage } from "./protocol";
import { GameSession } from "./session";
import { getBlock, setBlock } from "./world";
import { FLAT_SURFACE_Y, generateFlatWorld } from "./worldgen";

// mundo plano 2×2×2 chunks (32³) — superfície em y=3 (mesma base do cp14)
const DIMS = { x: 2, z: 2, y: 2 };
const SOLO = FLAT_SURFACE_Y; // último y sólido; primeiro ar = SOLO + 1

function makeFlat(dims = DIMS) {
  const sent: { id: number; data: string | ArrayBuffer }[] = [];
  const session = new GameSession((id, data) => sent.push({ id, data }), {
    dims,
    seed: 1,
    singleplayer: true,
    flat: true,
  });
  session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
  const send = (msg: unknown): void =>
    session.handleMessage(1, JSON.stringify(msg));
  // perto das células-alvo dos testes (place_block valida ALCANCE)
  send({ type: "move", x: 4.5, y: SOLO + 1, z: 4.5, yaw: 0, pitch: 0 });
  const msgs = (): Record<string, unknown>[] =>
    sent
      .filter((s) => typeof s.data === "string")
      .map((s) => JSON.parse(s.data as string) as Record<string, unknown>);
  return { session, send, msgs, sent };
}

describe("cp23 — helpers de bloco", () => {
  it("classifica porta/cubo/sólido; porta aberta não é colocável na mão", () => {
    expect(isPorta(BlockId.PortaXFechada)).toBe(true);
    expect(isPorta(BlockId.PortaZAberta)).toBe(true);
    expect(isPorta(BlockId.Cerca)).toBe(false);
    expect(portaToggled(BlockId.PortaXFechada)).toBe(BlockId.PortaXAberta);
    expect(portaToggled(BlockId.PortaZAberta)).toBe(BlockId.PortaZFechada);
    // não-cubos não ocluem nem seguram tocha; cubos (inclusive vidro) sim
    expect(isFullCube(BlockId.Cerca)).toBe(false);
    expect(isFullCube(BlockId.Tocha)).toBe(false);
    expect(isFullCube(BlockId.Glass)).toBe(true);
    // física: porta aberta e tocha atravessam; cerca e porta fechada não
    expect(isSolidBlock(BlockId.PortaXAberta)).toBe(false);
    expect(isSolidBlock(BlockId.Tocha)).toBe(false);
    expect(isSolidBlock(BlockId.Cerca)).toBe(true);
    expect(isSolidBlock(BlockId.PortaXFechada)).toBe(true);
    expect(isPlaceable(BlockId.PortaXFechada)).toBe(true);
    expect(isPlaceable(BlockId.PortaXAberta)).toBe(false);
    expect(isPlaceable(BlockId.PortaZAberta)).toBe(false);
    expect(isPlaceable(BlockId.Tocha)).toBe(true);
  });

  it("protocolo: use_block roundtrip; coords quebradas = null", () => {
    expect(parseClientMessage(JSON.stringify({ type: "use_block", x: 1, y: 2, z: 3 })))
      .toEqual({ type: "use_block", x: 1, y: 2, z: 3 });
    expect(parseClientMessage(JSON.stringify({ type: "use_block", x: 1.5, y: 2, z: 3 })))
      .toBeNull();
  });
});

describe("cp23 — mesher (formas não-cubo)", () => {
  const geomLen = (world: Parameters<typeof meshChunk>[0]): number =>
    meshChunk(world, 0, 0, 0).positions.length;
  // 1 face = 4 cantos × 3 floats. Face RENTE à borda some contra cubo opaco
  // (ex.: fundo da caixa sobre a grama) ou contra o MESMO id (fusão).
  const FACE = 12;

  it("cerca isolada = só poste; vizinha de cerca ganha travessas", () => {
    const world = generateFlatWorld(DIMS);
    const empty = geomLen(world);
    setBlock(world, 5, SOLO + 1, 5, BlockId.Cerca);
    const solta = geomLen(world) - empty;
    expect(solta).toBe(5 * FACE); // poste (fundo rente à grama some)
    setBlock(world, 6, SOLO + 1, 5, BlockId.Cerca);
    const par = geomLen(world) - empty;
    // 2 postes + 2 travessas (alta/baixa) de CADA cerca em direção à outra;
    // a ponta da travessa rente à cerca vizinha (mesmo id) funde
    expect(par).toBe(2 * 5 * FACE + 4 * 5 * FACE);
  });

  it("cerca encostada em parede conecta; cubo vizinho de forma NÃO se esconde", () => {
    const world = generateFlatWorld(DIMS);
    setBlock(world, 5, SOLO + 1, 5, BlockId.Cerca);
    const antes = geomLen(world);
    setBlock(world, 4, SOLO + 1, 5, BlockId.Stone);
    // pedra: 5 faces (fundo tapado), INCLUINDO a virada pra cerca (forma não
    // oclui); grama sob a pedra perde a face de cima; cerca ganha 2 travessas
    // de 5 faces (a ponta rente à parede some)
    expect(geomLen(world) - antes).toBe(5 * FACE - FACE + 2 * 5 * FACE);
  });

  it("porta desenha as duas metades fundidas; cubo encostado mostra a face", () => {
    const world = generateFlatWorld(DIMS);
    const empty = geomLen(world);
    setBlock(world, 5, SOLO + 1, 5, BlockId.PortaXFechada);
    setBlock(world, 5, SOLO + 2, 5, BlockId.PortaXFechada);
    const comPorta = geomLen(world);
    // metade de baixo: 4 faces (fundo some na grama, topo funde com a de cima);
    // metade de cima: 5 (fundo funde com a de baixo)
    expect(comPorta - empty).toBe(4 * FACE + 5 * FACE);
    setBlock(world, 6, SOLO + 1, 5, BlockId.Stone);
    // 5 faces da pedra (incluindo a virada pra porta) − face de cima da grama
    expect(geomLen(world) - comPorta).toBe(5 * FACE - FACE);
  });

  it("tocha emite caixa pequena sem apagar a face do chão", () => {
    const world = generateFlatWorld(DIMS);
    const empty = geomLen(world);
    setBlock(world, 5, SOLO + 1, 5, BlockId.Tocha);
    expect(geomLen(world) - empty).toBe(5 * FACE);
  });
});

describe("cp23 — física", () => {
  it("porta aberta atravessa; fechada bloqueia", () => {
    const world = generateFlatWorld(DIMS);
    const y = SOLO + 1;
    // parede de 2 de altura em z=5, com porta (2 células) em x=5
    for (let x = 0; x < 12; x++) {
      setBlock(world, x, y, 5, BlockId.Stone);
      setBlock(world, x, y + 1, 5, BlockId.Stone);
    }
    setBlock(world, 5, y, 5, BlockId.PortaXAberta);
    setBlock(world, 5, y + 1, 5, BlockId.PortaXAberta);
    const anda = (): number => {
      const p = createPlayer(5.5, y, 3.5);
      for (let i = 0; i < 40; i++) {
        stepPlayer(world, p, { forward: 1, strafe: 0, jump: false, yaw: Math.PI }, 1 / 20);
      }
      return p.pos.z;
    };
    expect(anda()).toBeGreaterThan(6); // atravessou o vão da porta aberta
    setBlock(world, 5, y, 5, BlockId.PortaXFechada);
    setBlock(world, 5, y + 1, 5, BlockId.PortaXFechada);
    expect(anda()).toBeLessThan(5); // fechada: parou na lâmina
  });
});

describe("cp23 — sessão (porta e tocha)", () => {
  it("place de porta materializa as 2 células; clique alterna as duas", () => {
    const { session, send } = makeFlat();
    const y = SOLO + 1;
    send({ type: "place_block", x: 6, y, z: 5, blockId: BlockId.PortaZFechada });
    expect(getBlock(session.world, 6, y, 5)).toBe(BlockId.PortaZFechada);
    expect(getBlock(session.world, 6, y + 1, 5)).toBe(BlockId.PortaZFechada);
    // clique na metade de CIMA abre as duas
    send({ type: "use_block", x: 6, y: y + 1, z: 5 });
    expect(getBlock(session.world, 6, y, 5)).toBe(BlockId.PortaZAberta);
    expect(getBlock(session.world, 6, y + 1, 5)).toBe(BlockId.PortaZAberta);
    // clique na metade de BAIXO fecha de volta
    send({ type: "use_block", x: 6, y, z: 5 });
    expect(getBlock(session.world, 6, y, 5)).toBe(BlockId.PortaZFechada);
    // porta sobrevive aos ticks (par completo não é órfão)
    session.tick();
    session.tick();
    expect(getBlock(session.world, 6, y + 1, 5)).toBe(BlockId.PortaZFechada);
  });

  it("place de porta sem espaço pro par é recusado", () => {
    const { session, send } = makeFlat();
    const y = SOLO + 1;
    send({ type: "place_block", x: 7, y: y + 1, z: 7, blockId: BlockId.Stone });
    // célula de cima ocupada — porta não nasce pela metade
    send({ type: "place_block", x: 7, y, z: 7, blockId: BlockId.PortaXFechada });
    expect(getBlock(session.world, 7, y, 7)).toBe(BlockId.Air);
  });

  it("fechar porta com jogador no vão é recusado", () => {
    const { session, send } = makeFlat();
    const y = SOLO + 1;
    send({ type: "place_block", x: 5, y, z: 6, blockId: BlockId.PortaXFechada });
    send({ type: "use_block", x: 5, y, z: 6 }); // abre
    // jogador PISA no vão da porta
    send({ type: "move", x: 5.5, y, z: 6.5, yaw: 0, pitch: 0 });
    send({ type: "use_block", x: 5, y, z: 6 }); // tenta fechar
    expect(getBlock(session.world, 5, y, 6)).toBe(BlockId.PortaXAberta);
    // saiu do vão: fecha normal
    send({ type: "move", x: 3.5, y, z: 3.5, yaw: 0, pitch: 0 });
    send({ type: "use_block", x: 5, y, z: 6 });
    expect(getBlock(session.world, 5, y, 6)).toBe(BlockId.PortaXFechada);
  });

  it("quebrar uma metade derruba a outra no tick (regra da porta)", () => {
    const { session, send } = makeFlat();
    const y = SOLO + 1;
    send({ type: "place_block", x: 5, y, z: 5, blockId: BlockId.PortaXFechada });
    send({ type: "break_block", x: 5, y, z: 5 }); // quebra a de baixo
    expect(getBlock(session.world, 5, y + 1, 5)).toBe(BlockId.PortaXFechada);
    session.tick(); // vizinhança acorda: metade órfã evapora
    expect(getBlock(session.world, 5, y + 1, 5)).toBe(BlockId.Air);
  });

  it("tocha: sem apoio não coloca; apoio quebrado, some no tick", () => {
    const { session, send } = makeFlat();
    const y = SOLO + 1;
    // célula no ar (embaixo é ar): recusa silenciosa
    send({ type: "place_block", x: 5, y: y + 1, z: 5, blockId: BlockId.Tocha });
    expect(getBlock(session.world, 5, y + 1, 5)).toBe(BlockId.Air);
    // no chão: ok
    send({ type: "place_block", x: 5, y, z: 5, blockId: BlockId.Tocha });
    expect(getBlock(session.world, 5, y, 5)).toBe(BlockId.Tocha);
    // quebra o apoio: tocha some no tick seguinte
    send({ type: "break_block", x: 5, y: SOLO, z: 5 });
    session.tick();
    expect(getBlock(session.world, 5, y, 5)).toBe(BlockId.Air);
  });

  it("flor: atravessável, precisa de apoio, some sem chão no tick", () => {
    const { session, send } = makeFlat();
    const y = SOLO + 1;
    expect(isSolidBlock(BlockId.FlorVermelha)).toBe(false); // atravessável
    expect(isFullCube(BlockId.FlorVermelha)).toBe(false); // não oclui vizinho
    // no ar (sem apoio): recusa silenciosa
    send({ type: "place_block", x: 5, y: y + 1, z: 5, blockId: BlockId.FlorVermelha });
    expect(getBlock(session.world, 5, y + 1, 5)).toBe(BlockId.Air);
    // no chão: ok
    send({ type: "place_block", x: 5, y, z: 5, blockId: BlockId.FlorVermelha });
    expect(getBlock(session.world, 5, y, 5)).toBe(BlockId.FlorVermelha);
    // quebra o apoio: some no tick seguinte
    send({ type: "break_block", x: 5, y: SOLO, z: 5 });
    session.tick();
    expect(getBlock(session.world, 5, y, 5)).toBe(BlockId.Air);
  });

  it("/bloco recusa porta com explicação (metade órfã não nasce por comando)", () => {
    const { session, send } = makeFlat();
    send({ type: "chat", text: `/bloco 5 ${SOLO + 1} 5 ${BlockId.PortaXFechada}` });
    expect(getBlock(session.world, 5, SOLO + 1, 5)).toBe(BlockId.Air);
  });
});

describe("cp23b — /regiao encher em lote", () => {
  it("região acima do teto antigo enche com UMA blocks_filled; jogador não empareda", () => {
    const { session, send, msgs, sent } = makeFlat();
    // 17×17×17 = 4913 células (> 4096, o teto antigo)
    send({ type: "chat", text: "/regiao criar caixa 0 4 0 16 20 16" });
    sent.length = 0;
    send({ type: "chat", text: `/regiao encher caixa ${BlockId.Stone}` });
    const lote = msgs().filter((m) => m["type"] === "blocks_filled");
    expect(lote).toHaveLength(1);
    expect(lote[0]).toMatchObject({ x0: 0, y0: 4, z0: 0, x1: 16, y1: 20, z1: 16, blockId: BlockId.Stone });
    // as ÚNICAS block_changed são as células do jogador (correção pós-lote)
    const avulsas = msgs().filter((m) => m["type"] === "block_changed");
    expect(avulsas).toHaveLength(2); // pés (4,4,4) e cabeça (4,5,4)
    expect(avulsas.every((m) => m["blockId"] === BlockId.Air)).toBe(true);
    expect(getBlock(session.world, 10, 10, 10)).toBe(BlockId.Stone);
    expect(getBlock(session.world, 4, 4, 4)).toBe(BlockId.Air); // jogador vivo
    const resposta = msgs().filter((m) => m["type"] === "chat").at(-1);
    expect(resposta?.["text"]).toContain("4911 bloco(s)");
  });

  it("regras acordam no lote: areia enchida no ar cai no tick", () => {
    const { session, send } = makeFlat();
    send({ type: "chat", text: "/regiao criar areia 8 5 8 9 5 9" });
    send({ type: "chat", text: `/regiao encher areia ${BlockId.Sand}` });
    expect(getBlock(session.world, 8, 5, 8)).toBe(BlockId.Sand);
    session.tick(); // vizinhança marcada pelo lote → gravidade age
    expect(getBlock(session.world, 8, 4, 8)).toBe(BlockId.Sand);
    expect(getBlock(session.world, 8, 5, 8)).toBe(BlockId.Air);
  });

  it("acima de MAX_ENCHER_CELLS recusa com explicação", () => {
    const { send, msgs } = makeFlat({ x: 4, z: 4, y: 2 }); // 64×64×32
    send({ type: "chat", text: "/regiao criar grande 0 0 0 63 16 63" }); // 69632
    send({ type: "chat", text: `/regiao encher grande ${BlockId.Stone}` });
    expect(msgs().filter((m) => m["type"] === "chat").at(-1)?.["text"]).toContain(
      "grande demais",
    );
  });
});

describe("janela (2026-07-19) — sessão", () => {
  it("clique alterna aberta↔fechada; 1 célula só, sem par", () => {
    const { session, send } = makeFlat();
    const y = FLAT_SURFACE_Y + 1;
    send({ type: "place_block", x: 6, y, z: 5, blockId: BlockId.JanelaXFechada });
    expect(getBlock(session.world, 6, y, 5)).toBe(BlockId.JanelaXFechada);
    // janela NÃO materializa segunda célula (diferente da porta)
    expect(getBlock(session.world, 6, y + 1, 5)).toBe(BlockId.Air);
    send({ type: "use_block", x: 6, y, z: 5 });
    expect(getBlock(session.world, 6, y, 5)).toBe(BlockId.JanelaXAberta);
    send({ type: "use_block", x: 6, y, z: 5 });
    expect(getBlock(session.world, 6, y, 5)).toBe(BlockId.JanelaXFechada);
    // sobrevive ao tick (sem regra de par órfão)
    session.tick();
    expect(getBlock(session.world, 6, y, 5)).toBe(BlockId.JanelaXFechada);
  });

  it("duas janelas empilhadas NÃO alternam juntas (par é só de porta)", () => {
    const { session, send } = makeFlat();
    const y = FLAT_SURFACE_Y + 1;
    send({ type: "place_block", x: 5, y, z: 6, blockId: BlockId.JanelaZFechada });
    send({ type: "place_block", x: 5, y: y + 1, z: 6, blockId: BlockId.JanelaZFechada });
    send({ type: "use_block", x: 5, y, z: 6 }); // abre SÓ a de baixo
    expect(getBlock(session.world, 5, y, 6)).toBe(BlockId.JanelaZAberta);
    expect(getBlock(session.world, 5, y + 1, 6)).toBe(BlockId.JanelaZFechada);
  });

  it("fechar janela com jogador na célula é recusado", () => {
    const { session, send } = makeFlat();
    const y = FLAT_SURFACE_Y + 1;
    send({ type: "place_block", x: 5, y, z: 6, blockId: BlockId.JanelaXFechada });
    send({ type: "use_block", x: 5, y, z: 6 }); // abre
    send({ type: "move", x: 5.5, y, z: 6.5, yaw: 0, pitch: 0 }); // entra na célula
    send({ type: "use_block", x: 5, y, z: 6 }); // tenta fechar
    expect(getBlock(session.world, 5, y, 6)).toBe(BlockId.JanelaXAberta);
  });
});

describe("móveis (2026-07-19) — forma e classificação", () => {
  it("móvel não é cubo cheio (não oclui vizinho) mas colide como célula", () => {
    for (const id of [BlockId.Mesa, BlockId.CadeiraXP, BlockId.SofaZP, BlockId.CamaXN]) {
      expect(isFullCube(id)).toBe(false);
      expect(isSolidBlock(id)).toBe(true);
      expect(isPlaceable(id)).toBe(true);
    }
  });

  it("as 4 direções emitem a MESMA quantidade de geometria (rotação pura)", () => {
    const geomFor = (id: number): number => {
      const world = generateFlatWorld(DIMS);
      setBlock(world, 5, SOLO + 1, 5, id);
      return meshChunk(world, 0, 0, 0).positions.length;
    };
    const cadeira = geomFor(BlockId.CadeiraXP);
    for (let k = 1; k < 4; k++) expect(geomFor(BlockId.CadeiraXP + k)).toBe(cadeira);
    const cama = geomFor(BlockId.CamaXP);
    for (let k = 1; k < 4; k++) expect(geomFor(BlockId.CamaXP + k)).toBe(cama);
    const sofa = geomFor(BlockId.SofaXP);
    for (let k = 1; k < 4; k++) expect(geomFor(BlockId.SofaXP + k)).toBe(sofa);
    // e todas geram geometria de verdade
    expect(cadeira).toBeGreaterThan(0);
    expect(geomFor(BlockId.Mesa)).toBeGreaterThan(0);
  });
});

describe("cama de 2 células (2026-07-20)", () => {
  it("place materializa pé + cabeceira; quebrar uma derruba a outra no tick", () => {
    const { session, send } = makeFlat();
    const y = SOLO + 1;
    // CamaXP: frente +x, cabeceira em −x → pé em (5,y,5), cabeceira em (4,y,5)
    send({ type: "place_block", x: 5, y, z: 5, blockId: BlockId.CamaXP });
    expect(getBlock(session.world, 5, y, 5)).toBe(BlockId.CamaXP); // pé
    expect(getBlock(session.world, 4, y, 5)).toBe(BlockId.CamaXP); // cabeceira
    // par completo sobrevive aos ticks
    session.tick();
    session.tick();
    expect(getBlock(session.world, 4, y, 5)).toBe(BlockId.CamaXP);
    // quebra o pé → cabeceira fica órfã e evapora no tick seguinte
    send({ type: "break_block", x: 5, y, z: 5 });
    expect(getBlock(session.world, 4, y, 5)).toBe(BlockId.CamaXP);
    session.tick();
    expect(getBlock(session.world, 4, y, 5)).toBe(BlockId.Air);
  });

  it("place de cama sem espaço pro par é recusado", () => {
    const { session, send } = makeFlat();
    const y = SOLO + 1;
    setBlock(session.world, 4, y, 5, BlockId.Stone); // ocupa a célula da cabeceira
    send({ type: "place_block", x: 5, y, z: 5, blockId: BlockId.CamaXP });
    expect(getBlock(session.world, 5, y, 5)).toBe(BlockId.Air); // não nasce pela metade
  });
});
