import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import {
  CELULA_Y0,
  MAX_GRUPOS_AULA,
  REGIAO_PARTIDA,
  caixaDaCelula,
  chunkDoGrupo,
  chunkDoMolde,
  chunkDoProfessor,
  dimsDaAula,
} from "./grade";
import { GameSession } from "./session";
import { getBlock } from "./world";

/**
 * `/aula grupos X` crescendo. O que importa e não é óbvio: os grupos que já
 * existiam ficam INTOCADOS (composição, progresso e os blocos que os alunos já
 * puseram), e os objetivos per-grupo passam a valer para os grupos novos — o
 * `o.alvos` é congelado na criação, então criar a região sozinha não bastaria.
 */
function mundoDeAula(quantos = 2, dims = { x: 6, z: 10, y: 4 }) {
  const ditos: string[] = [];
  const session = new GameSession((_id, data) => {
    if (typeof data !== "string") return;
    const m = JSON.parse(data) as { type?: string; text?: string };
    if (m.type === "chat" && typeof m.text === "string") ditos.push(m.text);
  }, {
    dims,
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

  // célula-molde: o estado de PARTIDA, atrás do professor
  const molde = caixaDaCelula(chunkDoMolde());
  session.applyBlock(molde.min.x + 1, CELULA_Y0, molde.min.z + 1, BlockId.Stone);
  session.regions.set(REGIAO_PARTIDA, { nome: REGIAO_PARTIDA, min: molde.min, max: molde.max });

  // modelo (GABARITO) na cabine do professor — NÃO na célula-molde, senão o
  // carimbo copiaria a resposta para dentro da área de cada grupo
  const prof = caixaDaCelula(chunkDoProfessor());
  session.applyBlock(prof.min.x + 5, CELULA_Y0, prof.min.z + 5, BlockId.Cobblestone);
  session.regions.set("modelo", {
    nome: "modelo",
    min: { x: prof.min.x + 5, y: CELULA_Y0, z: prof.min.z + 5 },
    max: { x: prof.min.x + 7, y: CELULA_Y0, z: prof.min.z + 7 },
  });

  cmd(1, `/grupo criar ${quantos}`);
  // as áreas de grupo, como se tivessem saído do carimbo do gerador
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
  return { session, cmd, ditos };
}

describe("/aula grupos — crescer", () => {
  it("cria as áreas dos grupos novos a partir da célula-molde", () => {
    const { session, cmd } = mundoDeAula();
    cmd(1, "/aula grupos 4");

    for (const g of [3, 4]) {
      const c = caixaDaCelula(chunkDoGrupo(g));
      expect(getBlock(session.world, c.min.x + 1, CELULA_Y0, c.min.z + 1)).toBe(BlockId.Stone);
      expect(session.regions.has(`area-${g}`)).toBe(true);
    }
    expect(session.grupos.size).toBe(4);
  });

  it("preserva composição e blocos dos grupos que já existiam", () => {
    const { session, cmd } = mundoDeAula();
    session.grupos.get(1)?.add("ana");
    const c1 = caixaDaCelula(chunkDoGrupo(1));
    session.applyBlock(c1.min.x + 4, CELULA_Y0, c1.min.z + 4, BlockId.Cobblestone);

    cmd(1, "/aula grupos 4");

    expect([...(session.grupos.get(1) ?? [])]).toEqual(["ana"]);
    expect(getBlock(session.world, c1.min.x + 4, CELULA_Y0, c1.min.z + 4)).toBe(BlockId.Cobblestone);
  });

  it("estende alvos e baseline do objetivo per-grupo", () => {
    const { session, cmd } = mundoDeAula();
    const o = session.scenario.objetivos[0];
    expect(o?.alvos).toHaveLength(2);

    cmd(1, "/aula grupos 4");

    expect(o?.alvos).toHaveLength(4);
    expect(o?.baseline).toHaveLength(4);
  });

  it("recusa acima do teto sem tocar em nada", () => {
    const { session, cmd } = mundoDeAula();
    cmd(1, "/aula grupos 99");
    expect(session.grupos.size).toBe(2);
  });

  it("recusa o grupo que não cabe no mundo, sem tocar em bloco nenhum", () => {
    // O teto subiu para 35 em 2026-08-26, mas os `.ljw` que a escola já baixou
    // nasceram com `dims.z = 10` (teto de 20). Pedir 25 num mundo desses manda
    // o grupo para `cz = 10`, fora do mundo: o `inBounds` de `aula.ts` valida
    // TODOS os grupos ANTES de escrever, senão o carimbo pararia pela metade.
    const { session, cmd, ditos } = mundoDeAula();
    const fora = caixaDaCelula(chunkDoGrupo(25));
    expect(fora.max.z).toBeGreaterThanOrEqual(session.world.dims.z * 16);

    cmd(1, "/aula grupos 25");

    expect(session.grupos.size).toBe(2);
    expect(session.regions.has("area-3")).toBe(false);
    expect(ditos.at(-1)).toContain("não cabe neste mundo");
  });

  it("aceita o teto inteiro no mundo dimensionado para ele", () => {
    const { session, cmd } = mundoDeAula(2, dimsDaAula());
    cmd(1, `/aula grupos ${MAX_GRUPOS_AULA}`);
    expect(session.grupos.size).toBe(MAX_GRUPOS_AULA);
    const ultimo = caixaDaCelula(chunkDoGrupo(MAX_GRUPOS_AULA));
    expect(getBlock(session.world, ultimo.min.x + 1, CELULA_Y0, ultimo.min.z + 1)).toBe(
      BlockId.Stone,
    );
  });

  it("recusa em mundo sem a região partida", () => {
    const { session, cmd } = mundoDeAula();
    session.regions.delete(REGIAO_PARTIDA);
    cmd(1, "/aula grupos 4");
    expect(session.grupos.size).toBe(2);
  });

  it("aluno não usa o comando", () => {
    const { session } = mundoDeAula();
    session.handleMessage(2, JSON.stringify({ type: "join", name: "ana", pin: "1111" }));
    session.handleMessage(2, JSON.stringify({ type: "chat", text: "/aula grupos 4" }));
    expect(session.grupos.size).toBe(2);
  });
});
