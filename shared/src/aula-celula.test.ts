import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { CELULA_Y0, caixaDaCelula } from "./grade";
import { GameSession } from "./session";
import { copiarCelula, limparCelula } from "./session/aula";
import { getBlock } from "./world";

/**
 * A CÉLULA é a unidade de cópia da aula (2026-08-17). O baseline do objetivo
 * cobre só a caixa da ÁREA, e os `extras` do cenário (a parede de manual da
 * aula 6) ficam FORA dela — copiar por área deixaria o grupo novo sem o
 * enunciado. A célula é o chunk inteiro, então pega os dois.
 */
function sessaoDeAula(): GameSession {
  const session = new GameSession(() => {}, {
    dims: { x: 4, z: 4, y: 2 },
    seed: 11,
    flat: true,
    codigo: "sala",
  });
  session.handleMessage(
    1,
    JSON.stringify({ type: "join", name: "prof", pin: "0000", codigo: "sala" }),
  );
  // o autor fica longe: célula com jogador em pé é PULADA
  session.handleMessage(1, JSON.stringify({ type: "move", x: 1.5, y: 20, z: 1.5, yaw: 0, pitch: 0 }));
  return session;
}

describe("copiarCelula / limparCelula", () => {
  it("copia bloco de dentro da área e extra de fora dela", () => {
    const ses = sessaoDeAula();
    const origem = caixaDaCelula({ cx: 0, cz: 0 });
    const destino = caixaDaCelula({ cx: 1, cz: 0 });
    // "área": perto do canto. "extra": longe, mas dentro do mesmo chunk.
    ses.applyBlock(origem.min.x + 1, CELULA_Y0, origem.min.z + 1, BlockId.Stone);
    ses.applyBlock(origem.min.x + 12, CELULA_Y0 + 1, origem.min.z + 9, BlockId.Cobblestone);

    const r = copiarCelula(ses, origem, destino);

    expect(r.pulados).toBe(0);
    expect(getBlock(ses.world, destino.min.x + 1, CELULA_Y0, destino.min.z + 1)).toBe(BlockId.Stone);
    expect(getBlock(ses.world, destino.min.x + 12, CELULA_Y0 + 1, destino.min.z + 9)).toBe(
      BlockId.Cobblestone,
    );
  });

  it("leva o conteúdo do quadro junto", () => {
    const ses = sessaoDeAula();
    const origem = caixaDaCelula({ cx: 0, cz: 0 });
    const destino = caixaDaCelula({ cx: 1, cz: 0 });
    const qx = origem.min.x + 3;
    const qy = CELULA_Y0 + 1;
    const qz = origem.min.z + 2;
    ses.applyBlock(qx, qy, qz, BlockId.QuadroXN);
    // quadro_set exige ALCANCE (session.ts) — o autor chega perto
    ses.handleMessage(1, JSON.stringify({ type: "move", x: qx - 2, y: qy, z: qz + 0.5, yaw: 0, pitch: 0 }));
    ses.handleMessage(1, JSON.stringify({ type: "quadro_set", x: qx, y: qy, z: qz, texto: "passo 1" }));
    // e sai de cima da célula de destino antes de copiar
    ses.handleMessage(1, JSON.stringify({ type: "move", x: 1.5, y: 20, z: 1.5, yaw: 0, pitch: 0 }));

    copiarCelula(ses, origem, destino);

    expect(ses.toSave().quadros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ x: destino.min.x + 3, z: destino.min.z + 2, texto: "passo 1" }),
      ]),
    );
  });

  it("sobrescreve o destino: célula que era bloco e virou ar volta a ar", () => {
    const ses = sessaoDeAula();
    const origem = caixaDaCelula({ cx: 0, cz: 0 });
    const destino = caixaDaCelula({ cx: 1, cz: 0 });
    ses.applyBlock(destino.min.x + 2, CELULA_Y0, destino.min.z + 2, BlockId.Stone);

    copiarCelula(ses, origem, destino);

    expect(getBlock(ses.world, destino.min.x + 2, CELULA_Y0, destino.min.z + 2)).toBe(BlockId.Air);
  });

  it("pula a célula onde há jogador em pé e conta o pulo", () => {
    const ses = sessaoDeAula();
    const origem = caixaDaCelula({ cx: 0, cz: 0 });
    const destino = caixaDaCelula({ cx: 1, cz: 0 });
    ses.applyBlock(origem.min.x + 1, CELULA_Y0, origem.min.z + 1, BlockId.Stone);
    // põe o professor exatamente na célula de destino correspondente
    ses.handleMessage(
      1,
      JSON.stringify({
        type: "move",
        x: destino.min.x + 1.5,
        y: CELULA_Y0,
        z: destino.min.z + 1.5,
        yaw: 0,
        pitch: 0,
      }),
    );

    const r = copiarCelula(ses, origem, destino);

    expect(r.pulados).toBeGreaterThan(0);
  });

  it("limparCelula zera blocos e conteúdo de quadro", () => {
    const ses = sessaoDeAula();
    const caixa = caixaDaCelula({ cx: 2, cz: 2 });
    const qx = caixa.min.x + 2;
    const qy = CELULA_Y0 + 1;
    const qz = caixa.min.z + 2;
    ses.applyBlock(caixa.min.x + 1, CELULA_Y0, caixa.min.z + 1, BlockId.Stone);
    ses.applyBlock(qx, qy, qz, BlockId.QuadroXN);
    ses.handleMessage(1, JSON.stringify({ type: "move", x: qx - 2, y: qy, z: qz + 0.5, yaw: 0, pitch: 0 }));
    ses.handleMessage(1, JSON.stringify({ type: "quadro_set", x: qx, y: qy, z: qz, texto: "x" }));
    ses.handleMessage(1, JSON.stringify({ type: "move", x: 1.5, y: 20, z: 1.5, yaw: 0, pitch: 0 }));

    const r = limparCelula(ses, caixa);

    expect(r.apagados).toBeGreaterThan(0);
    expect(getBlock(ses.world, caixa.min.x + 1, CELULA_Y0, caixa.min.z + 1)).toBe(BlockId.Air);
    expect(ses.toSave().quadros ?? []).toEqual([]);
  });
});
