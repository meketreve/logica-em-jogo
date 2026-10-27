import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { estaLigado } from "./circuitos";
import { parseServerMessage } from "./protocol";
import { type SaveData, decodeSave, encodeSave } from "./save";
import type { Box, Objective } from "./scenario";
import { GameSession } from "./session";
import { findSpawnY, getBlock, setBlock } from "./world";

/**
 * §🔌 PEÇAS TRAVADAS (2026-10-27): a regra das aulas de circuito pronto. Com
 * ela ligada, dentro da área de QUALQUER objetivo o aluno só liga e desliga
 * alavancas; fora da área e pro professor nada muda. Cada caminho que mexe no
 * mundo (colocar, quebrar, usar, balde, quadro) tem a sua linha aqui — o
 * portão novo que esquecer um deles deixa um buraco que só a aula acharia.
 */

const DIMS = { x: 2, z: 2, y: 2 };
type Sent = { clientId: number; data: string | ArrayBuffer }[];
const join = (name: string, pin: string, codigo?: string) =>
  JSON.stringify({ type: "join", name, pin, codigo });
const cmd = (text: string) => JSON.stringify({ type: "chat", text });
const TRAVADA = "Nesta atividade as peças estão travadas: aqui você só liga e desliga as ALAVANCAS.";

function ultimaChat(sent: Sent, clientId: number): string | null {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "chat") return m.text;
  }
  return null;
}

/** Turma de 1 grupo com UM objetivo per-grupo; a área tem alavanca, fio e lâmpada. */
function sala(opts: { travadas: boolean }) {
  const s0 = new GameSession(() => {}, { dims: DIMS, seed: 5, codigo: "sala" });
  const sx = Math.floor(s0.world.sizeX / 2);
  const sz = Math.floor(s0.world.sizeZ / 2);
  const h = findSpawnY(s0.world, sx, sz);
  // a área: 5×2×3 a 2 blocos do spawn; o circuito na linha do meio
  const area: Box = { min: { x: sx + 2, y: h, z: sz - 1 }, max: { x: sx + 6, y: h + 1, z: sz + 1 } };
  const alavanca = { x: sx + 2, y: h, z: sz };
  setBlock(s0.world, alavanca.x, h, sz, BlockId.AlavancaDesligada);
  setBlock(s0.world, sx + 3, h, sz, BlockId.FioDesligado);
  setBlock(s0.world, sx + 4, h, sz, BlockId.LampadaApagada);
  // uma porta dentro da área: o clique nela NÃO pode passar
  setBlock(s0.world, sx + 6, h, sz + 1, BlockId.PortaXFechada);
  setBlock(s0.world, sx + 6, h + 1, sz + 1, BlockId.PortaXFechada);
  // as duas células de teste nascem AR (o terreno pode ter grama alta ali)
  setBlock(s0.world, sx + 5, h, sz - 1, BlockId.Air);
  setBlock(s0.world, sx - 2, h, sz, BlockId.Air);
  const save: SaveData = decodeSave(encodeSave(s0.world, s0.toSave()));
  const objetivo: Objective = {
    id: 1, kind: "limpar", regiao: "area-1…1", texto: "teste",
    min: area.min, max: area.max, alvos: [area],
  };
  save.grupos = [{ id: 1, membros: ["ana"] }];
  save.cenario = {
    modo: "livre",
    ...(opts.travadas ? { pecasTravadas: true } : {}),
    objetivos: [objetivo],
    completos: [],
  };
  const sent: Sent = [];
  const session = new GameSession((clientId, data) => sent.push({ clientId, data }), {
    restore: save,
    codigo: "sala",
  });
  session.handleMessage(1, join("prof", "4321", "sala"));
  session.handleMessage(2, join("ana", "1111"));
  for (const id of [1, 2]) {
    session.handleMessage(id, JSON.stringify({ type: "move", x: sx + 0.5, y: h, z: sz + 0.5, yaw: 0, pitch: 0 }));
  }
  const dentro = { x: sx + 5, y: h, z: sz - 1 }; // ar dentro da área
  const fora = { x: sx - 2, y: h, z: sz }; // ar fora dela
  const bloco = (c: { x: number; y: number; z: number }) => getBlock(session.world, c.x, c.y, c.z);
  return { session, sent, sx, sz, h, area, alavanca, dentro, fora, bloco };
}

const place = (c: { x: number; y: number; z: number }, blockId: number) =>
  JSON.stringify({ type: "place_block", ...c, blockId });
const quebrar = (c: { x: number; y: number; z: number }) => JSON.stringify({ type: "break_block", ...c });
const usar = (c: { x: number; y: number; z: number }) => JSON.stringify({ type: "use_block", ...c });

describe("§🔌 peças travadas", () => {
  it("o aluno NÃO coloca, NÃO quebra e NÃO clica outra coisa dentro da área — e ouve por quê", () => {
    const s = sala({ travadas: true });
    s.session.handleMessage(2, place(s.dentro, BlockId.Stone));
    expect(s.bloco(s.dentro)).toBe(BlockId.Air);
    expect(ultimaChat(s.sent, 2)).toEqual(TRAVADA);

    const fio = { x: s.sx + 3, y: s.h, z: s.sz };
    s.session.handleMessage(2, quebrar(fio));
    s.session.tick();
    expect(s.bloco(fio)).toBe(BlockId.FioDesligado);

    const porta = { x: s.sx + 6, y: s.h, z: s.sz + 1 };
    s.session.handleMessage(2, usar(porta));
    expect(s.bloco(porta)).toBe(BlockId.PortaXFechada);
    expect(ultimaChat(s.sent, 2)).toEqual(TRAVADA);

    s.session.handleMessage(2, JSON.stringify({ type: "balde", ...s.dentro, encher: false }));
    expect(s.bloco(s.dentro)).toBe(BlockId.Air);
  });

  it("…mas a ALAVANCA funciona, e o circuito acende", () => {
    const s = sala({ travadas: true });
    s.session.handleMessage(2, usar(s.alavanca));
    s.session.tick();
    expect(estaLigado(s.bloco(s.alavanca))).toBe(true);
    expect(s.bloco({ x: s.sx + 4, y: s.h, z: s.sz })).toBe(BlockId.LampadaAcesa);
  });

  it("fora da área e pro professor nada muda", () => {
    const s = sala({ travadas: true });
    s.session.handleMessage(2, place(s.fora, BlockId.Stone));
    expect(s.bloco(s.fora)).toBe(BlockId.Stone);
    s.session.handleMessage(1, place(s.dentro, BlockId.Stone));
    expect(s.bloco(s.dentro)).toBe(BlockId.Stone);
  });

  it("CONTROLE NEGATIVO: sem a regra, o aluno coloca dentro da área", () => {
    const s = sala({ travadas: false });
    s.session.handleMessage(2, place(s.dentro, BlockId.Stone));
    expect(s.bloco(s.dentro)).toBe(BlockId.Stone);
  });

  it("o professor liga e desliga com /objetivo pecas, e a regra sobrevive ao save", () => {
    const s = sala({ travadas: false });
    s.session.handleMessage(2, cmd("/objetivo pecas travadas"));
    expect(s.session.scenario.pecasTravadas).toBe(false); // aluno não manda
    s.session.handleMessage(1, cmd("/objetivo pecas travadas"));
    expect(ultimaChat(s.sent, 1)).toEqual(
      "Peças travadas: nas áreas dos objetivos o aluno só liga e desliga as ALAVANCAS (não coloca nem quebra nada).",
    );
    const volta = decodeSave(encodeSave(s.session.world, s.session.toSave()));
    expect(volta.cenario?.pecasTravadas).toBe(true);
    s.session.handleMessage(1, cmd("/objetivo pecas livres"));
    expect(s.session.scenario.pecasTravadas).toBe(false);
    expect(decodeSave(encodeSave(s.session.world, s.session.toSave())).cenario?.pecasTravadas).toBeUndefined();
  });
});
