import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import {
  CELULA_Y0,
  REGIAO_PARTIDA,
  caixaDaCelula,
  chunkDoGrupo,
  chunkDoMolde,
  chunkDoProfessor,
} from "./grade";
import { GameSession } from "./session";
import { getBlock } from "./world";

/**
 * `/aula grupos X` diminuindo. Apaga trabalho de aluno, então é em DOIS passos:
 * o primeiro só relata o estrago e não escreve nada; o segundo, com "confirmar",
 * executa. Mesmo padrão de 2 cliques dos botões de expulsar/banir do painel.
 */
function mundoDeAula(quantos = 4) {
  const session = new GameSession(() => {}, {
    dims: { x: 6, z: 10, y: 4 },
    seed: 13,
    flat: true,
    codigo: "sala",
  });
  const cmd = (id: number, text: string): void =>
    session.handleMessage(id, JSON.stringify({ type: "chat", text }));
  session.handleMessage(
    1,
    JSON.stringify({ type: "join", name: "prof", pin: "0000", codigo: "sala" }),
  );
  session.handleMessage(1, JSON.stringify({ type: "move", x: 1.5, y: 30, z: 1.5, yaw: 0, pitch: 0 }));

  const molde = caixaDaCelula(chunkDoMolde());
  session.applyBlock(molde.min.x + 1, CELULA_Y0, molde.min.z + 1, BlockId.Stone);
  session.regions.set(REGIAO_PARTIDA, { nome: REGIAO_PARTIDA, min: molde.min, max: molde.max });

  const prof = caixaDaCelula(chunkDoProfessor());
  session.applyBlock(prof.min.x + 5, CELULA_Y0, prof.min.z + 5, BlockId.Cobblestone);
  session.regions.set("modelo", {
    nome: "modelo",
    min: { x: prof.min.x + 5, y: CELULA_Y0, z: prof.min.z + 5 },
    max: { x: prof.min.x + 7, y: CELULA_Y0, z: prof.min.z + 7 },
  });

  cmd(1, `/grupo criar ${quantos}`);
  for (let g = 1; g <= quantos; g++) {
    const c = caixaDaCelula(chunkDoGrupo(g));
    session.applyBlock(c.min.x + 1, CELULA_Y0, c.min.z + 1, BlockId.Stone);
    session.regions.set(`area-${g}`, {
      nome: `area-${g}`,
      min: { x: c.min.x, y: CELULA_Y0, z: c.min.z },
      max: { x: c.min.x + 2, y: CELULA_Y0, z: c.min.z + 2 },
    });
  }
  cmd(1, "/objetivo add construir modelo area monte a figura");
  return { session, cmd };
}

describe("/aula grupos — encolher", () => {
  it("sem confirmar, não muda bloco nem grupo", () => {
    const { session, cmd } = mundoDeAula();
    const c4 = caixaDaCelula(chunkDoGrupo(4));
    cmd(1, "/aula grupos 2");
    expect(session.grupos.size).toBe(4);
    expect(getBlock(session.world, c4.min.x + 1, CELULA_Y0, c4.min.z + 1)).toBe(BlockId.Stone);
    expect(session.regions.has("area-4")).toBe(true);
  });

  it("com confirmar, apaga células, regiões e grupos", () => {
    const { session, cmd } = mundoDeAula();
    const c4 = caixaDaCelula(chunkDoGrupo(4));
    cmd(1, "/aula grupos 2 confirmar");
    expect(session.grupos.size).toBe(2);
    expect(session.regions.has("area-4")).toBe(false);
    expect(getBlock(session.world, c4.min.x + 1, CELULA_Y0, c4.min.z + 1)).toBe(BlockId.Air);
  });

  it("encurta alvos e baseline do objetivo", () => {
    const { session, cmd } = mundoDeAula();
    const o = session.scenario.objetivos[0];
    expect(o?.alvos).toHaveLength(4);
    cmd(1, "/aula grupos 2 confirmar");
    expect(o?.alvos).toHaveLength(2);
    expect(o?.baseline).toHaveLength(2);
  });

  it("realoca os alunos dos grupos que sumiram", () => {
    const { session, cmd } = mundoDeAula();
    session.grupos.get(3)?.add("ana");
    session.grupos.get(4)?.add("bia");
    cmd(1, "/aula grupos 2 confirmar");
    const todos = [...(session.grupos.get(1) ?? []), ...(session.grupos.get(2) ?? [])];
    expect(todos.sort()).toEqual(["ana", "bia"]);
  });
});
