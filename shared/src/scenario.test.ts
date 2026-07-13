import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { parseServerMessage } from "./protocol";
import { decodeSave, encodeSave } from "./save";
import {
  type Box,
  matchRegion,
  parseScenarioMeta,
  snapshotRegion,
} from "./scenario";
import { GameSession, type SessionOptions } from "./session";
import { getBlock, setBlock } from "./world";
import { generateFlatWorld } from "./worldgen";

// mundo pequeno e PLANO (2×2×2 chunks = 32³): superfície previsível em y=3
const DIMS = { x: 2, z: 2, y: 2 };

function makeSession(opts: SessionOptions = {}) {
  const sent: { id: number; data: string | ArrayBuffer }[] = [];
  const session = new GameSession((id, data) => sent.push({ id, data }), {
    dims: DIMS,
    seed: 7,
    flat: true,
    codigo: "prof42",
    ...opts,
  });
  const msgsTo = (id: number): Record<string, unknown>[] =>
    sent
      .filter((s) => s.id === id && typeof s.data === "string")
      .map((s) => JSON.parse(s.data as string) as Record<string, unknown>);
  const send = (id: number, msg: unknown): void =>
    session.handleMessage(id, JSON.stringify(msg));
  const chat = (id: number, text: string): void => send(id, { type: "chat", text });
  const lastObjectives = (id: number) =>
    msgsTo(id).filter((m) => m["type"] === "objectives").at(-1) as
      | { modo: string; objetivos: Record<string, unknown>[] }
      | undefined;
  const lastChat = (id: number): string =>
    (msgsTo(id).filter((m) => m["type"] === "chat").at(-1)?.["text"] as string) ?? "";
  return { session, msgsTo, send, chat, lastObjectives, lastChat };
}

type S = ReturnType<typeof makeSession>;

function joinProf(s: S, id = 1): void {
  s.send(id, { type: "join", name: `prof${id}`, pin: "1234", codigo: "prof42" });
}
function joinAluno(s: S, id = 2): void {
  s.send(id, { type: "join", name: `aluno${id}`, pin: "9999" });
}
/** Marca cantos e cria região nomeada via varinha + /regiao (professor id). */
function criarRegiao(s: S, id: number, nome: string, min: number[], max: number[]): void {
  s.send(id, { type: "wand_mark", corner: 1, x: min[0], y: min[1], z: min[2] });
  s.send(id, { type: "wand_mark", corner: 2, x: max[0], y: max[1], z: max[2] });
  s.chat(id, `/regiao criar ${nome}`);
}

describe("worldgen — mundo plano", () => {
  it("camadas fixas: bedrock/terra/terra/grama e ar acima; determinístico", () => {
    const w = generateFlatWorld(DIMS);
    expect(getBlock(w, 10, 0, 10)).toBe(BlockId.Bedrock);
    expect(getBlock(w, 10, 1, 10)).toBe(BlockId.Dirt);
    expect(getBlock(w, 10, 2, 10)).toBe(BlockId.Dirt);
    expect(getBlock(w, 10, 3, 10)).toBe(BlockId.Grass);
    expect(getBlock(w, 10, 4, 10)).toBe(BlockId.Air);
    expect(generateFlatWorld(DIMS).chunks).toEqual(w.chunks);
  });
});

describe("scenario — funções puras", () => {
  it("snapshotRegion e matchRegion usam a mesma ordem (roundtrip = tudo correto)", () => {
    const w = generateFlatWorld(DIMS);
    const box: Box = { min: { x: 4, y: 3, z: 4 }, max: { x: 6, y: 4, z: 6 } };
    const foto = snapshotRegion(w, box);
    expect(foto).toHaveLength(18); // 3×2×3
    const m = matchRegion(w, box, foto);
    expect(m.corretos).toBe(m.alvo); // mundo bate consigo mesmo
    expect(m.alvo).toBe(9); // camada de grama y=3
    expect(m.extras).toBe(0);
  });

  it("matchRegion conta corretos, alvo e extras separados", () => {
    const w = generateFlatWorld(DIMS);
    // gabarito: 1 lã vermelha em y=4 (acima da grama), resto conforme mundo
    const box: Box = { min: { x: 4, y: 4, z: 4 }, max: { x: 5, y: 4, z: 5 } };
    const gabarito = [BlockId.WoolRed, BlockId.Air, BlockId.Air, BlockId.Air];
    let m = matchRegion(w, box, gabarito);
    expect(m).toEqual({ corretos: 0, alvo: 1, extras: 0 });
    // bloco certo no lugar certo + um sobrando onde devia ser ar
    // (ordem canônica y→z→x: índice 0 = (4,4,4), índice 3 = (5,4,5))
    const w2 = generateFlatWorld(DIMS);
    setBlock(w2, 4, 4, 4, BlockId.WoolRed);
    setBlock(w2, 5, 4, 5, BlockId.Stone);
    m = matchRegion(w2, box, gabarito);
    expect(m).toEqual({ corretos: 1, alvo: 1, extras: 1 });
  });

  it("parseScenarioMeta pula objetivo quebrado e normaliza modo", () => {
    const ok = {
      id: 1,
      kind: "chegar",
      regiao: "r",
      texto: "vá",
      min: { x: 0, y: 0, z: 0 },
      max: { x: 1, y: 1, z: 1 },
    };
    const meta = parseScenarioMeta({
      modo: "xyz",
      objetivos: [ok, { id: 2, kind: "construir", regiao: "r", texto: "t", min: ok.min, max: ok.max, gabarito: [1] }],
      completos: [1, "a"],
    });
    expect(meta?.modo).toBe("sequencial");
    expect(meta?.objetivos).toHaveLength(1); // construir com gabarito de tamanho errado cai
    expect(meta?.completos).toEqual([1]);
  });
});

describe("scenario — sessão (autoria, detecção, HUD)", () => {
  /** Cenário padrão: modelo 2×1×2 de lã em (4..5,4,4..5), alvo em (10..11,4,10..11). */
  function setupConstruir(s: S) {
    joinProf(s);
    criarRegiao(s, 1, "modelo", [4, 4, 4], [5, 4, 5]);
    criarRegiao(s, 1, "alvo", [10, 4, 10], [11, 4, 11]);
    // constrói o modelo: 4 lãs vermelhas
    for (const [x, z] of [[4, 4], [4, 5], [5, 4], [5, 5]]) {
      s.chat(1, `/bloco ${x} 4 ${z} ${BlockId.WoolRed}`);
    }
    s.chat(1, "/objetivo add construir modelo alvo Reproduza o quadrado vermelho");
  }

  it("construir: fotografa o modelo, conta progresso ao vivo e conclui", () => {
    const s = makeSession();
    setupConstruir(s);
    joinAluno(s);
    // aluno recebeu o cenário no join; contador zerado
    let obj = s.lastObjectives(2)?.objetivos[0];
    expect(obj).toMatchObject({ kind: "construir", ativo: true, completo: false, atual: 0, total: 4 });

    // 3 blocos certos + 1 errado → tick → 3/4 e um extra em célula de ar? não:
    // célula errada DENTRO do padrão conta como não-correto, sem extra
    s.chat(1, `/bloco 10 4 10 ${BlockId.WoolRed}`);
    s.chat(1, `/bloco 10 4 11 ${BlockId.WoolRed}`);
    s.chat(1, `/bloco 11 4 10 ${BlockId.WoolRed}`);
    s.chat(1, `/bloco 11 4 11 ${BlockId.Stone}`); // errado
    s.session.tick();
    obj = s.lastObjectives(2)?.objetivos[0];
    expect(obj).toMatchObject({ atual: 3, total: 4, extras: 0, completo: false });

    // corrige o último → concluído + anúncio no chat DEPOIS do estado
    s.chat(1, `/bloco 11 4 11 ${BlockId.WoolRed}`);
    s.session.tick();
    obj = s.lastObjectives(2)?.objetivos[0];
    expect(obj).toMatchObject({ completo: true, atual: 4 });
    expect(s.lastChat(2)).toContain("objetivo concluído: Reproduza o quadrado vermelho");
  });

  it("construir: alvo que já bate com o modelo é recusado (nasceria completo)", () => {
    const s = makeSession();
    joinProf(s);
    criarRegiao(s, 1, "modelo", [4, 4, 4], [5, 4, 5]);
    s.chat(1, `/bloco 4 4 4 ${BlockId.WoolRed}`);
    s.chat(1, "/objetivo add construir modelo modelo Copie aqui");
    expect(s.lastChat(1)).toContain("JÁ bate com o modelo");
  });

  it("construir: modelo vazio e tamanhos diferentes são recusados", () => {
    const s = makeSession();
    joinProf(s);
    criarRegiao(s, 1, "vazia", [4, 5, 4], [5, 5, 5]);
    criarRegiao(s, 1, "outra", [10, 5, 10], [11, 5, 11]); // mesmo tamanho
    criarRegiao(s, 1, "grande", [20, 5, 20], [22, 5, 22]); // tamanho diferente
    s.chat(1, "/objetivo add construir vazia outra Copie");
    expect(s.lastChat(1)).toContain("está vazia");
    s.chat(1, `/bloco 4 5 4 ${BlockId.Stone}`);
    s.chat(1, "/objetivo add construir vazia grande Copie");
    expect(s.lastChat(1)).toContain("mesmo tamanho");
  });

  it("chegar: conclui quando um jogador pisa na região (via move)", () => {
    const s = makeSession();
    joinProf(s);
    criarRegiao(s, 1, "meta", [20, 3, 20], [24, 6, 24]);
    s.chat(1, "/objetivo add chegar meta Vá até a plataforma");
    joinAluno(s);
    s.send(2, { type: "move", x: 22.5, y: 4.2, z: 22.5, yaw: 0, pitch: 0 });
    const obj = s.lastObjectives(2)?.objetivos[0];
    expect(obj).toMatchObject({ kind: "chegar", completo: true });
    expect(s.lastChat(1)).toContain("objetivo concluído");
  });

  it("limpar: conta o que falta e conclui quando a região vira ar", () => {
    const s = makeSession();
    joinProf(s);
    criarRegiao(s, 1, "entulho", [8, 4, 8], [9, 4, 9]);
    s.chat(1, `/regiao encher entulho ${BlockId.Gravel}`);
    s.chat(1, "/objetivo add limpar entulho Limpe o entulho");
    let obj = s.lastObjectives(1)?.objetivos[0];
    expect(obj).toMatchObject({ kind: "limpar", atual: 4, completo: false });
    s.chat(1, "/regiao encher entulho 0");
    s.session.tick();
    obj = s.lastObjectives(1)?.objetivos[0];
    expect(obj).toMatchObject({ completo: true, atual: 0 });
  });

  it("sequencial: só o primeiro incompleto é ativo; concluir ativa o próximo", () => {
    const s = makeSession();
    joinProf(s);
    criarRegiao(s, 1, "a", [20, 3, 20], [21, 5, 21]);
    criarRegiao(s, 1, "b", [26, 3, 26], [27, 5, 27]);
    s.chat(1, "/objetivo add chegar a Primeiro aqui");
    s.chat(1, "/objetivo add chegar b Depois aqui");
    let objs = s.lastObjectives(1)?.objetivos;
    expect(objs?.map((o) => o["ativo"])).toEqual([true, false]);
    // pisar no B antes da hora NÃO conclui (não está ativo)
    s.send(1, { type: "move", x: 26.5, y: 4, z: 26.5, yaw: 0, pitch: 0 });
    expect(s.lastObjectives(1)?.objetivos.map((o) => o["completo"])).toEqual([false, false]);
    // A conclui → B ativa; /objetivo modo livre ativa todos
    s.send(1, { type: "move", x: 20.5, y: 4, z: 20.5, yaw: 0, pitch: 0 });
    objs = s.lastObjectives(1)?.objetivos;
    expect(objs?.map((o) => [o["completo"], o["ativo"]])).toEqual([
      [true, false],
      [false, true],
    ]);
  });

  it("aluno não usa /objetivo; /objetivo resetar zera o progresso", () => {
    const s = makeSession();
    joinProf(s);
    criarRegiao(s, 1, "meta", [20, 3, 20], [21, 5, 21]);
    s.chat(1, "/objetivo add chegar meta Vá");
    joinAluno(s);
    s.chat(2, "/objetivo add chegar meta hack");
    expect(s.lastChat(2)).toContain("só o professor");
    s.send(2, { type: "move", x: 20.5, y: 4, z: 20.5, yaw: 0, pitch: 0 });
    expect(s.lastObjectives(2)?.objetivos[0]).toMatchObject({ completo: true });
    s.chat(1, "/objetivo resetar");
    expect(s.lastObjectives(2)?.objetivos[0]).toMatchObject({ completo: false, ativo: true });
  });

  it("cenário persiste no save e volta no restore (objetivos, modo, completos)", () => {
    const s = makeSession();
    joinProf(s);
    criarRegiao(s, 1, "meta", [20, 3, 20], [21, 5, 21]);
    criarRegiao(s, 1, "meta2", [26, 3, 26], [27, 5, 27]);
    s.chat(1, "/objetivo add chegar meta Vá");
    s.chat(1, "/objetivo add chegar meta2 Vá de novo");
    s.chat(1, "/objetivo modo livre");
    s.send(1, { type: "move", x: 20.5, y: 4, z: 20.5, yaw: 0, pitch: 0 });

    const decoded = decodeSave(encodeSave(s.session.world, s.session.toSave()));
    expect(decoded.cenario?.modo).toBe("livre");
    expect(decoded.cenario?.objetivos).toHaveLength(2);
    expect(decoded.cenario?.completos).toEqual([1]);

    const s2 = makeSession({ restore: decoded });
    joinProf(s2, 5);
    const objs = s2.lastObjectives(5)?.objetivos;
    expect(objs?.map((o) => o["completo"])).toEqual([true, false]);
    // id novo NÃO colide com os antigos
    criarRegiao(s2, 5, "meta3", [4, 3, 4], [5, 5, 5]);
    s2.chat(5, "/objetivo add chegar meta3 Mais um");
    expect(s2.lastChat(5)).toContain("objetivo #3");
  });

  it("/regiao encher respeita jogador dentro da região (não empareda)", () => {
    const s = makeSession();
    joinProf(s);
    criarRegiao(s, 1, "sala", [30, 4, 30], [31, 5, 31]);
    // professor fica DENTRO da região
    s.send(1, { type: "move", x: 30.5, y: 4, z: 30.5, yaw: 0, pitch: 0 });
    s.chat(1, `/regiao encher sala ${BlockId.Stone}`);
    // células do corpo do jogador ficaram ar
    expect(getBlock(s.session.world, 30, 4, 30)).toBe(BlockId.Air);
    expect(getBlock(s.session.world, 31, 5, 31)).toBe(BlockId.Stone);
  });
});

describe("scenario — protocolo", () => {
  it("objectives: roundtrip válido; objetivo quebrado é pulado; modo inválido = null", () => {
    const ok = {
      id: 1,
      kind: "chegar",
      regiao: "r",
      texto: "vá",
      min: { x: 0, y: 0, z: 0 },
      max: { x: 1, y: 1, z: 1 },
      completo: false,
      ativo: true,
      atual: 0,
      total: 0,
      extras: 0,
    };
    const msg = parseServerMessage(
      JSON.stringify({ type: "objectives", modo: "livre", objetivos: [ok, { id: "x" }] }),
    );
    expect(msg).toEqual({ type: "objectives", modo: "livre", objetivos: [ok] });
    expect(
      parseServerMessage(JSON.stringify({ type: "objectives", modo: "x", objetivos: [] })),
    ).toBeNull();
  });
});
