import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { parseServerMessage } from "./protocol";
import { type SaveData, decodeSave, encodeSave } from "./save";
import type { Box, Objective } from "./scenario";
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
const place = (x: number, y: number, z: number, blockId: number) =>
  JSON.stringify({ type: "place_block", x, y, z, blockId });
const quebra = (x: number, y: number, z: number) =>
  JSON.stringify({ type: "break_block", x, y, z });

function ultimaChat(sent: Sent, clientId: number): string | null {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "chat") return m.text;
  }
  return null;
}

/** Save-base válido (mundo/spawn reais) para injetar grupos + áreas per-grupo. */
function baseSave(): { save: SaveData; sx: number; sz: number; h: number } {
  const { send } = collect();
  const s0 = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
  const save = decodeSave(encodeSave(s0.world, s0.toSave()));
  const sx = Math.floor(s0.world.sizeX / 2);
  const sz = Math.floor(s0.world.sizeZ / 2);
  const h = findSpawnY(s0.world, sx, sz);
  return { save, sx, sz, h };
}

/**
 * Turma com dois grupos e um objetivo per-grupo: g1 na caixa ESQUERDA, g2 na
 * DIREITA (disjuntas, ambas ao alcance do spawn). ana∈g1, bia∈g2. `somenteLeitura`
 * liga o confinamento por auto (mundo de aula); senão o professor liga por comando.
 */
function turmaConfinada(somenteLeitura = false) {
  const { save, sx, sz, h } = baseSave();
  const box1: Box = { min: { x: sx - 3, y: h - 2, z: sz - 1 }, max: { x: sx - 1, y: h + 6, z: sz + 1 } };
  const box2: Box = { min: { x: sx + 1, y: h - 2, z: sz - 1 }, max: { x: sx + 3, y: h + 6, z: sz + 1 } };
  const objetivo: Objective = {
    id: 1,
    kind: "chegar",
    regiao: "zona",
    texto: "chegue à área do seu grupo",
    min: box1.min,
    max: box1.max,
    alvos: [box1, box2],
    regra: "um",
  };
  save.grupos = [
    { id: 1, membros: ["ana"] },
    { id: 2, membros: ["bia"] },
  ];
  save.cenario = { modo: "livre", objetivos: [objetivo], completos: [] };

  const { sent, send } = collect();
  const session = new GameSession(send, {
    restore: save,
    codigo: "sala",
    ...(somenteLeitura ? { somenteLeitura: true } : {}),
  });
  session.handleMessage(1, join("prof", "4321", "sala")); // professor
  session.handleMessage(2, join("ana", "1111")); // aluno g1
  session.handleMessage(3, join("bia", "2222")); // aluno g2
  // célula de teste no meio de cada caixa: y=h+2 é ar acima do chão e não
  // colide com o boneco (todos nascem no spawn, x deslocado 2 evita overlap)
  const cel1 = { x: sx - 2, y: h + 2, z: sz };
  const cel2 = { x: sx + 2, y: h + 2, z: sz };
  return { sent, session, cel1, cel2 };
}

describe("confinamento por área de grupo (cp25)", () => {
  it("só o professor controla o confinamento", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
    session.handleMessage(1, join("prof", "4321", "sala"));
    session.handleMessage(2, join("ana", "1111"));

    session.handleMessage(2, cmd("/confinar ligar"));
    expect(ultimaChat(sent, 2)).toContain("Somente o professor");
    session.handleMessage(1, cmd("/confinar ligar"));
    expect(ultimaChat(sent, 1)?.toLowerCase()).toContain("confinamento");
  });

  it("ligado sem grupos: aluno é barrado e o professor é avisado", () => {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
    session.handleMessage(1, join("prof", "4321", "sala"));
    session.handleMessage(2, join("ana", "1111"));
    session.handleMessage(1, cmd("/confinar ligar"));
    expect(ultimaChat(sent, 1)).toContain("ainda não há grupos");

    const world = session.world;
    const sx = Math.floor(world.sizeX / 2);
    const sz = Math.floor(world.sizeZ / 2);
    const h = findSpawnY(world, sx, sz);
    const cel = { x: sx - 2, y: h + 2, z: sz };
    session.handleMessage(2, place(cel.x, cel.y, cel.z, BlockId.WoolRed));
    expect(getBlock(world, cel.x, cel.y, cel.z)).not.toBe(BlockId.WoolRed);
    expect(ultimaChat(sent, 2)).toContain("não está em um grupo");
  });

  it("cada grupo só edita na sua área; o professor edita em qualquer lugar", () => {
    const { sent, session, cel1, cel2 } = turmaConfinada();
    session.handleMessage(1, cmd("/confinar ligar"));
    const world = session.world;

    // limpa as duas células-alvo (professor ignora o confinamento; idempotente)
    session.handleMessage(1, quebra(cel1.x, cel1.y, cel1.z));
    session.handleMessage(1, quebra(cel2.x, cel2.y, cel2.z));

    // ana (g1) coloca DENTRO da sua área → funciona
    session.handleMessage(2, place(cel1.x, cel1.y, cel1.z, BlockId.WoolRed));
    expect(getBlock(world, cel1.x, cel1.y, cel1.z)).toBe(BlockId.WoolRed);

    // ana tenta colocar na área do OUTRO grupo → barrada, com aviso
    session.handleMessage(2, place(cel2.x, cel2.y, cel2.z, BlockId.WoolBlue));
    expect(getBlock(world, cel2.x, cel2.y, cel2.z)).not.toBe(BlockId.WoolBlue);
    expect(ultimaChat(sent, 2)).toContain("área do seu grupo");

    // bia (g2) coloca na SUA área (a mesma célula que barrou a ana) → funciona
    session.handleMessage(3, place(cel2.x, cel2.y, cel2.z, BlockId.WoolBlue));
    expect(getBlock(world, cel2.x, cel2.y, cel2.z)).toBe(BlockId.WoolBlue);

    // professor coloca na área do g1 sem restrição
    session.handleMessage(1, place(cel1.x, cel1.y + 1, cel1.z, BlockId.Stone));
    expect(getBlock(world, cel1.x, cel1.y + 1, cel1.z)).toBe(BlockId.Stone);
  });

  it("confinamento também barra QUEBRAR fora da área", () => {
    const { sent, session, cel1, cel2 } = turmaConfinada();
    session.handleMessage(1, cmd("/confinar ligar"));
    const world = session.world;

    // professor semeia um bloco sólido em cada área
    const b1 = { x: cel1.x, y: cel1.y + 1, z: cel1.z };
    const b2 = { x: cel2.x, y: cel2.y + 1, z: cel2.z };
    session.handleMessage(1, place(b1.x, b1.y, b1.z, BlockId.Stone));
    session.handleMessage(1, place(b2.x, b2.y, b2.z, BlockId.Stone));
    expect(getBlock(world, b1.x, b1.y, b1.z)).toBe(BlockId.Stone);
    expect(getBlock(world, b2.x, b2.y, b2.z)).toBe(BlockId.Stone);

    // ana quebra na SUA área → funciona; na área do g2 → barrada
    session.handleMessage(2, quebra(b1.x, b1.y, b1.z));
    expect(getBlock(world, b1.x, b1.y, b1.z)).toBe(BlockId.Air);
    session.handleMessage(2, quebra(b2.x, b2.y, b2.z));
    expect(getBlock(world, b2.x, b2.y, b2.z)).toBe(BlockId.Stone);
    expect(ultimaChat(sent, 2)).toContain("área do seu grupo");
  });

  it("mundo de aula (somenteLeitura) nasce confinado, sem /confinar", () => {
    const { sent, session, cel1, cel2 } = turmaConfinada(true);
    const world = session.world;
    session.handleMessage(1, quebra(cel1.x, cel1.y, cel1.z)); // professor limpa

    // ana constrói na área dela sem o professor ter digitado nada
    session.handleMessage(2, place(cel1.x, cel1.y, cel1.z, BlockId.WoolRed));
    expect(getBlock(world, cel1.x, cel1.y, cel1.z)).toBe(BlockId.WoolRed);

    // e continua barrada na área do outro grupo
    session.handleMessage(2, place(cel2.x, cel2.y, cel2.z, BlockId.WoolBlue));
    expect(getBlock(world, cel2.x, cel2.y, cel2.z)).not.toBe(BlockId.WoolBlue);
    expect(ultimaChat(sent, 2)).toContain("área do seu grupo");
  });

  it("o flag do confinamento sobrevive ao save/restore (mundo livre)", () => {
    const { send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
    session.handleMessage(1, join("prof", "4321", "sala"));
    session.handleMessage(1, cmd("/confinar ligar"));

    const restore = decodeSave(encodeSave(session.world, session.toSave()));
    expect(restore.confinamento).toBe(true);

    // desligar não deixa resíduo no save
    session.handleMessage(1, cmd("/confinar desligar"));
    const restore2 = decodeSave(encodeSave(session.world, session.toSave()));
    expect(restore2.confinamento).toBeUndefined();
  });
});
