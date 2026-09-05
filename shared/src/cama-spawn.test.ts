import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { GameSession } from "./session";
import { machucar } from "./session/vitais";
import { findSpawnY, setBlock } from "./world";
import { parseServerMessage } from "./protocol";

/**
 * Cama como PONTO DE SPAWN (2026-08-14): clicar na cama com o botão de colocar
 * (clique direito / tap no ▣) define o PRÓPRIO nascimento; a morte passa a
 * devolver pra CAMA em vez do `ses.spawn` do mundo.
 */

function turmaComCama() {
  const sent: { clientId: number; data: string | ArrayBuffer }[] = [];
  const session = new GameSession((id, data) => sent.push({ clientId: id, data }), {
    dims: { x: 2, z: 2, y: 2 },
    seed: 5,
    flat: true,
    codigo: "sala",
  });
  const send = (id: number, msg: unknown): void =>
    session.handleMessage(id, JSON.stringify(msg));
  const join = (id: number, nome: string): void =>
    send(id, { type: "join", name: nome, pin: "0000", ...(id === 1 ? { codigo: "sala" } : {}) });
  join(1, "prof");
  join(2, "ana");
  const w = session.world;
  const sx = Math.floor(w.sizeX / 2);
  const sz = Math.floor(w.sizeZ / 2);
  const h = findSpawnY(w, sx, sz);
  // chão seguro onde a ana vai ficar (e onde a cama vai se apoiar)
  for (let x = sx - 2; x <= sx + 2; x++)
    for (let z = sz - 2; z <= sz + 2; z++) setBlock(w, x, h - 1, z, BlockId.Stone);
  for (let x = sx - 2; x <= sx + 2; x++)
    for (let z = sz - 2; z <= sz + 2; z++) setBlock(w, x, h, z, BlockId.Air);
  // cama par horizontal: CamaXP (frente +x → cabeceira −x) em (sx,h,sz) + cabeceira
  setBlock(w, sx, h, sz, BlockId.CamaXP);
  setBlock(w, sx - 1, h, sz, BlockId.CamaXP);
  // ana fica AO LADO da cama, dentro do alcance do use_block
  send(2, { type: "move", x: sx + 0.5, y: h, z: sz + 1.5, yaw: 0, pitch: 0 });
  const paraAna = (tipo: string): any[] =>
    sent
      .filter((s) => s.clientId === 2)
      .map((s) => parseServerMessage(s.data as string))
      .filter((m): m is NonNullable<typeof m> => !!m && m.type === tipo);
  const ultimoTeleport = (): any => paraAna("teleport").at(-1);
  return { session, sent, send, paraAna, ultimoTeleport, sx, sz, h };
}

describe("cama como ponto de spawn", () => {
  it("clicar na cama define o ponto de nascimento (feedback no chat)", () => {
    const { send, paraAna, sx, sz, h } = turmaComCama();
    send(2, { type: "use_block", x: sx, y: h, z: sz });
    const aviso = paraAna("chat").at(-1);
    expect((aviso as { text: string }).text).toContain("Ponto de nascimento");
    expect((aviso as { text: string }).text).toContain("cama");
    // 2026-09-03: mesmo clique manda o gesto "interagir" (a turma vê o braço)
    expect(paraAna("gesto")).toEqual([{ type: "gesto", id: 2, gesto: "interagir" }]);
  });

  it("a morte devolve pra CAMA (célula de ar acima), não pro spawn do mundo", () => {
    const t = turmaComCama();
    const { session, send, ultimoTeleport, sx, sz, h } = t;
    send(1, { type: "chat", text: "/modo sobrevivencia all" });
    session.tick();
    send(2, { type: "use_block", x: sx, y: h, z: sz });
    send(2, { type: "move", x: sx + 0.5, y: h + 3, z: sz + 1.5, yaw: 0, pitch: 0 });
    machucar(session, 2, 99, "queda");
    expect(ultimoTeleport()).toMatchObject({ x: sx + 0.5, y: h + 1, z: sz + 0.5 });
  });

  it("com bloco EM CIMA da cama (célula de respawn ocupada), cai no spawn do mundo", () => {
    const t = turmaComCama();
    const { session, send, ultimoTeleport, sx, sz, h } = t;
    send(1, { type: "chat", text: "/modo sobrevivencia all" });
    session.tick();
    send(2, { type: "use_block", x: sx, y: h, z: sz });
    setBlock(session.world, sx, h + 1, sz, BlockId.Stone); // construiu por cima
    send(2, { type: "move", x: sx + 0.5, y: h + 3, z: sz + 1.5, yaw: 0, pitch: 0 });
    machucar(session, 2, 99, "queda");
    expect(ultimoTeleport()).toMatchObject({
      x: session.spawn.x,
      y: session.spawn.y,
      z: session.spawn.z,
    });
  });

  it("clicar na CABECEIRA também define (par compartilha o id — clicar em qualquer metade)", () => {
    const { send, paraAna, sx, sz, h } = turmaComCama();
    send(2, { type: "use_block", x: sx - 1, y: h, z: sz });
    const aviso = paraAna("chat").at(-1);
    expect((aviso as { text: string }).text).toContain("Ponto de nascimento");
  });
});