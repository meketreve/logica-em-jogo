import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import {
  MAX_AMIGOS,
  caixasSeCruzam,
  claimDentroDoLimite,
  parseClaim,
  parseGrupoAmigos,
} from "./claims";
import { parseServerMessage } from "./protocol";
import { decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { findSpawnY, getBlock } from "./world";

const DIMS = { x: 2, z: 2, y: 2 };

type Sent = { clientId: number; data: string | ArrayBuffer }[];
function collect(): { sent: Sent; send: (c: number, d: string | ArrayBuffer) => void } {
  const sent: Sent = [];
  return { sent, send: (clientId, data) => sent.push({ clientId, data }) };
}
const join = (name: string, pin?: string, codigo?: string) =>
  JSON.stringify({ type: "join", name, pin, codigo });
const cmd = (text: string) => JSON.stringify({ type: "chat", text });
const mark = (corner: 1 | 2, x: number, y: number, z: number) =>
  JSON.stringify({ type: "wand_mark", corner, x, y, z });

/** Último texto de chat enviado a um cliente (rejeições/respostas de comando). */
function ultimaChat(sent: Sent, clientId: number): string | null {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "chat") return m.text;
  }
  return null;
}

describe("claims — helpers puros", () => {
  it("claimDentroDoLimite: até 16 por eixo", () => {
    expect(claimDentroDoLimite({ x: 0, y: 0, z: 0 }, { x: 15, y: 15, z: 15 })).toBe(true);
    expect(claimDentroDoLimite({ x: 0, y: 0, z: 0 }, { x: 16, y: 0, z: 0 })).toBe(false);
  });

  it("caixasSeCruzam é inclusiva (tocar num canto conta)", () => {
    const a = { min: { x: 0, y: 0, z: 0 }, max: { x: 2, y: 2, z: 2 } };
    expect(caixasSeCruzam(a, { min: { x: 2, y: 2, z: 2 }, max: { x: 4, y: 4, z: 4 } })).toBe(true);
    expect(caixasSeCruzam(a, { min: { x: 3, y: 0, z: 0 }, max: { x: 4, y: 2, z: 2 } })).toBe(false);
  });

  it("parseClaim recusa lixo e aceita válido", () => {
    expect(parseClaim(null)).toBeNull();
    expect(parseClaim({ dono: "", min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } })).toBeNull();
    expect(parseClaim({ dono: "ana", min: { x: 2, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } })).toBeNull();
    const c = parseClaim({ dono: "ana", nome: "casa", min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } });
    expect(c?.dono).toBe("ana");
    expect(c?.nome).toBe("casa");
  });

  it("parseGrupoAmigos remove duplicatas, o próprio dono e corta no limite", () => {
    const g = parseGrupoAmigos({ dono: "ana", membros: ["bia", "bia", "ana", "c", "d", "e", "f", "g"] });
    expect(g?.dono).toBe("ana");
    expect(g?.membros).not.toContain("ana");
    expect(g?.membros.length).toBeLessThanOrEqual(MAX_AMIGOS - 1);
  });
});

describe("claims — proteção de áreas (cp24)", () => {
  function mundoComTurma() {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
    session.handleMessage(1, join("prof", "4321", "sala")); // professor
    session.handleMessage(2, join("ana", "1111")); // aluno
    session.handleMessage(3, join("bia", "2222")); // aluno
    const world = session.world;
    const sx = Math.floor(world.sizeX / 2);
    const sz = Math.floor(world.sizeZ / 2);
    const h = findSpawnY(world, sx, sz);
    return { sent, session, world, sx, sz, h };
  }

  /** ana reivindica uma caixa ao redor do spawn (contém chão e ar, ao alcance). */
  function anaCriaClaim(session: GameSession, sx: number, sz: number, h: number, nome = ""): void {
    session.handleMessage(2, mark(1, sx - 2, h - 1, sz - 2));
    session.handleMessage(2, mark(2, sx + 2, h + 2, sz + 2));
    session.handleMessage(2, cmd(`/claim criar ${nome}`.trim()));
  }

  it("aluno não liga a proteção; professor liga", () => {
    const { sent, session } = mundoComTurma();
    session.handleMessage(2, cmd("/claim ligar"));
    expect(ultimaChat(sent, 2)).toContain("Somente o professor");
    session.handleMessage(1, cmd("/claim ligar"));
    expect(ultimaChat(sent, 1)).toContain("ligada");
  });

  it("dono edita, amigo aceito edita, estranho é barrado, professor ignora", () => {
    const { sent, session, world, sx, sz, h } = mundoComTurma();
    session.handleMessage(1, cmd("/claim ligar"));
    anaCriaClaim(session, sx, sz, h, "casa");

    const alvo = { x: sx, y: h - 1, z: sz };
    const antes = getBlock(world, alvo.x, alvo.y, alvo.z);
    expect(antes).not.toBe(BlockId.Air);

    // bia (estranho): quebra barrada, bloco intacto, aviso no chat
    session.handleMessage(3, JSON.stringify({ type: "break_block", ...alvo }));
    expect(getBlock(world, alvo.x, alvo.y, alvo.z)).toBe(antes);
    expect(ultimaChat(sent, 3)).toContain("protegida por ana");

    // ana (dona): quebra funciona
    session.handleMessage(2, JSON.stringify({ type: "break_block", ...alvo }));
    expect(getBlock(world, alvo.x, alvo.y, alvo.z)).toBe(BlockId.Air);

    // bia entra no grupo da ana e passa a colocar dentro do claim
    session.handleMessage(2, cmd("/amigos convidar bia"));
    session.handleMessage(3, cmd("/amigos aceitar ana"));
    const alto = { x: sx, y: h + 2, z: sz };
    session.handleMessage(3, JSON.stringify({ type: "place_block", ...alto, blockId: BlockId.WoolRed }));
    expect(getBlock(world, alto.x, alto.y, alto.z)).toBe(BlockId.WoolRed);

    // professor ignora a proteção
    session.handleMessage(1, JSON.stringify({ type: "place_block", ...alvo, blockId: BlockId.Stone }));
    expect(getBlock(world, alvo.x, alvo.y, alvo.z)).toBe(BlockId.Stone);
  });

  it("claim novo não sobrepõe outro nem passa do tamanho máximo", () => {
    const { sent, session, sx, sz, h } = mundoComTurma();
    session.handleMessage(1, cmd("/claim ligar"));
    anaCriaClaim(session, sx, sz, h);

    // bia tenta um claim encostando no da ana
    session.handleMessage(3, mark(1, sx, h - 1, sz));
    session.handleMessage(3, mark(2, sx + 1, h, sz + 1));
    session.handleMessage(3, cmd("/claim criar"));
    expect(ultimaChat(sent, 3)).toContain("encosta na área de ana");

    // bia tenta um claim gigante (17 de largura)
    session.handleMessage(3, mark(1, 0, 0, 0));
    session.handleMessage(3, mark(2, 16, 0, 0));
    session.handleMessage(3, cmd("/claim criar"));
    expect(ultimaChat(sent, 3)).toContain("grande demais");
  });

  it("claimsAtivo + claim + grupo de amigos sobrevivem ao save/restore", () => {
    const { session, sx, sz, h } = mundoComTurma();
    session.handleMessage(1, cmd("/claim ligar"));
    anaCriaClaim(session, sx, sz, h, "casa");
    session.handleMessage(2, cmd("/amigos convidar bia"));
    session.handleMessage(3, cmd("/amigos aceitar ana"));

    const restore = decodeSave(encodeSave(session.world, session.toSave()));
    expect(restore.claimsAtivo).toBe(true);
    expect(restore.claims?.[0]?.dono).toBe("ana");
    expect(restore.amigos?.[0]?.membros).toContain("bia");

    // nova sessão do save: a proteção continua barrando o estranho e liberando o amigo
    const { send: send2 } = collect();
    const s2 = new GameSession(send2, { restore, codigo: "sala" });
    const alvo = { x: sx, y: h - 1, z: sz };
    const antes = getBlock(s2.world, alvo.x, alvo.y, alvo.z);

    s2.handleMessage(5, join("carla", "3333")); // estranho
    s2.handleMessage(5, JSON.stringify({ type: "break_block", ...alvo }));
    expect(getBlock(s2.world, alvo.x, alvo.y, alvo.z)).toBe(antes);

    s2.handleMessage(6, join("bia", "2222")); // amigo do save
    s2.handleMessage(6, JSON.stringify({ type: "break_block", ...alvo }));
    expect(getBlock(s2.world, alvo.x, alvo.y, alvo.z)).toBe(BlockId.Air);
  });
});
