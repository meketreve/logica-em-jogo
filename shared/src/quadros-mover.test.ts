import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { MAX_GRUPOS_AULA } from "./grade";
import { MAX_REGIONS } from "./regions";
import { GameSession } from "./session";

/**
 * Conteúdo de quadro mora FORA do id de bloco (mapa por posição). Copiar uma
 * célula da aula tem de levar o conteúdo junto, senão o grupo novo recebe a
 * parede de manual EM BRANCO — que é justamente o enunciado da atividade.
 */
function sessaoComQuadro(): GameSession {
  const session = new GameSession(() => {}, {
    dims: { x: 4, z: 4, y: 2 },
    seed: 7,
    flat: true,
    codigo: "sala",
  });
  session.handleMessage(
    1,
    JSON.stringify({ type: "join", name: "prof", pin: "0000", codigo: "sala" }),
  );
  return session;
}

/** `quadro_set` exige ALCANCE (session.ts), então o autor chega perto — é o
 *  mesmo truque do helper `Autoria.quadro` do gerador. */
function escrever(ses: GameSession, x: number, y: number, z: number, texto: string): void {
  ses.applyBlock(x, y, z, BlockId.QuadroXN);
  ses.handleMessage(1, JSON.stringify({ type: "move", x: x - 2, y, z: z + 0.5, yaw: 0, pitch: 0 }));
  ses.handleMessage(1, JSON.stringify({ type: "quadro_set", x, y, z, texto }));
}

describe("mover e apagar conteúdo de quadro", () => {
  it("move o conteúdo junto com o deslocamento", () => {
    const ses = sessaoComQuadro();
    escrever(ses, 4, 5, 6, "passo 1");
    ses.applyBlock(14, 5, 6, BlockId.QuadroXN); // destino já tem o BLOCO

    const movidos = ses.moverQuadros(
      { min: { x: 0, y: 0, z: 0 }, max: { x: 9, y: 9, z: 9 } },
      10,
      0,
      0,
    );

    expect(movidos).toBe(1);
    expect(ses.toSave().quadros).toEqual(
      expect.arrayContaining([expect.objectContaining({ x: 14, y: 5, z: 6, texto: "passo 1" })]),
    );
  });

  it("não apaga a origem ao mover (o molde continua servindo)", () => {
    const ses = sessaoComQuadro();
    escrever(ses, 4, 5, 6, "passo 1");
    ses.applyBlock(14, 5, 6, BlockId.QuadroXN);

    ses.moverQuadros({ min: { x: 0, y: 0, z: 0 }, max: { x: 9, y: 9, z: 9 } }, 10, 0, 0);

    expect(ses.toSave().quadros).toEqual(
      expect.arrayContaining([expect.objectContaining({ x: 4, y: 5, z: 6, texto: "passo 1" })]),
    );
  });

  it("não escreve onde o destino não é quadro", () => {
    const ses = sessaoComQuadro();
    escrever(ses, 4, 5, 6, "passo 1");
    // destino SEM o bloco de quadro

    const movidos = ses.moverQuadros(
      { min: { x: 0, y: 0, z: 0 }, max: { x: 9, y: 9, z: 9 } },
      10,
      0,
      0,
    );

    expect(movidos).toBe(0);
  });

  it("apaga só o conteúdo de dentro da caixa", () => {
    const ses = sessaoComQuadro();
    escrever(ses, 4, 5, 6, "dentro");
    escrever(ses, 20, 5, 6, "fora");

    const apagados = ses.apagarQuadros({ min: { x: 0, y: 0, z: 0 }, max: { x: 9, y: 9, z: 9 } });

    expect(apagados).toBe(1);
    const restantes = ses.toSave().quadros ?? [];
    expect(restantes.map((q) => q.texto)).toEqual(["fora"]);
  });

  it("MAX_REGIONS comporta o teto de grupos com folga", () => {
    // A conta que o teto obriga, no `expect` e não só no comentário: cada grupo
    // gasta uma região por FASE, mais os 3 modelos e a `partida`. Com o teto de
    // 20 dava 64 exatos — o valor antigo de MAX_REGIONS, zero folga para o
    // professor criar região própria. Subir o teto refaz esta conta sozinho.
    const FASES = 3;
    const FIXAS = 3 + 1; // 3 modelos + partida
    expect(MAX_GRUPOS_AULA * FASES + FIXAS).toBeLessThan(MAX_REGIONS);
    expect(MAX_REGIONS).toBe(256);
  });
});
