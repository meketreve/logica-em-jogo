import { describe, expect, it } from "vitest";
import { BlockId, isFullCube, isPlaceable, isQuadro, isSolidBlock } from "./blocks";
import { parseClientMessage, parseServerMessage } from "./protocol";
import { MAX_QUADRO_IMAGEM_CHARS, parseQuadroConteudo } from "./quadros";
import { GameSession } from "./session";
import { getBlock } from "./world";
import { FLAT_SURFACE_Y } from "./worldgen";

const DIMS = { x: 2, z: 2, y: 2 };
const SOLO = FLAT_SURFACE_Y;

function makeFlat() {
  const sent: { id: number; data: string | ArrayBuffer }[] = [];
  const session = new GameSession((id, data) => sent.push({ id, data }), {
    dims: DIMS,
    seed: 1,
    singleplayer: true,
    flat: true,
  });
  session.handleMessage(1, JSON.stringify({ type: "join", name: "ana" }));
  const send = (msg: unknown): void => session.handleMessage(1, JSON.stringify(msg));
  send({ type: "move", x: 4.5, y: SOLO + 1, z: 4.5, yaw: 0, pitch: 0 });
  const msgs = (): Record<string, unknown>[] =>
    sent
      .filter((s) => typeof s.data === "string")
      .map((s) => JSON.parse(s.data as string) as Record<string, unknown>);
  return { session, send, msgs, sent };
}

const IMG = "data:image/jpeg;base64,AAAA";

describe("quadros — parse defensivo", () => {
  it("aceita conteúdo válido; corta texto no teto; recusa imagem estranha", () => {
    expect(parseQuadroConteudo({ x: 1, y: 2, z: 3, texto: "oi" })).toEqual({
      x: 1, y: 2, z: 3, texto: "oi",
    });
    expect(parseQuadroConteudo({ x: 1, y: 2, z: 3, texto: "oi", imagem: IMG })).toEqual({
      x: 1, y: 2, z: 3, texto: "oi", imagem: IMG,
    });
    expect(parseQuadroConteudo({ x: 1.5, y: 2, z: 3, texto: "oi" })).toBeNull();
    expect(parseQuadroConteudo({ x: 1, y: 2, z: 3, texto: 7 })).toBeNull();
    expect(parseQuadroConteudo({ x: 1, y: 2, z: 3, texto: "oi", imagem: "http://x" })).toBeNull();
    expect(
      parseQuadroConteudo({
        x: 1, y: 2, z: 3, texto: "",
        imagem: `data:image/jpeg;base64,${"A".repeat(MAX_QUADRO_IMAGEM_CHARS)}`,
      }),
    ).toBeNull(); // acima do teto
  });

  it("roundtrip no protocolo: quadro_set, quadro_changed e lista com lixo", () => {
    expect(
      parseClientMessage(JSON.stringify({ type: "quadro_set", x: 1, y: 2, z: 3, texto: "a" })),
    ).toEqual({ type: "quadro_set", x: 1, y: 2, z: 3, texto: "a" });
    expect(
      parseServerMessage(JSON.stringify({ type: "quadro_changed", x: 1, y: 2, z: 3, texto: "a" })),
    ).toEqual({ type: "quadro_changed", x: 1, y: 2, z: 3, texto: "a" });
    const lista = parseServerMessage(
      JSON.stringify({
        type: "quadros",
        lista: [{ x: 1, y: 2, z: 3, texto: "ok" }, { x: "ruim" }],
      }),
    );
    expect(lista).toEqual({ type: "quadros", lista: [{ x: 1, y: 2, z: 3, texto: "ok" }] });
  });
});

describe("quadros — sessão", () => {
  it("ids em append; painel fino: não-cubo, atravessável, colocável", () => {
    expect(BlockId.QuadroXP).toBe(100);
    expect(BlockId.QuadroZN).toBe(103);
    for (let id = BlockId.QuadroXP; id <= BlockId.QuadroZN; id++) {
      expect(isQuadro(id)).toBe(true);
      expect(isFullCube(id)).toBe(false);
      expect(isSolidBlock(id)).toBe(false);
      expect(isPlaceable(id)).toBe(true);
    }
  });

  it("quadro_set grava, broadcast quadro_changed; vazio limpa; persiste no meta", () => {
    const { session, send, msgs } = makeFlat();
    const y = SOLO + 1;
    send({ type: "place_block", x: 5, y, z: 5, blockId: BlockId.QuadroZP });
    expect(getBlock(session.world, 5, y, 5)).toBe(BlockId.QuadroZP);
    send({ type: "quadro_set", x: 5, y, z: 5, texto: "olá turma", imagem: IMG });
    const changed = msgs().filter((m) => m["type"] === "quadro_changed");
    expect(changed.at(-1)).toEqual({
      type: "quadro_changed", x: 5, y, z: 5, texto: "olá turma", imagem: IMG,
    });
    expect(session.toSave().quadros).toEqual([
      { x: 5, y, z: 5, texto: "olá turma", imagem: IMG },
    ]);
    // vazio = limpa (e some do save)
    send({ type: "quadro_set", x: 5, y, z: 5, texto: "  " });
    expect(session.toSave().quadros).toBeUndefined();
  });

  it("quadro_set em célula que NÃO é quadro é ignorado", () => {
    const { session, send } = makeFlat();
    const y = SOLO + 1;
    send({ type: "place_block", x: 6, y, z: 5, blockId: BlockId.Stone });
    send({ type: "quadro_set", x: 6, y, z: 5, texto: "não" });
    expect(session.toSave().quadros).toBeUndefined();
  });

  it("quebrar o quadro derruba o conteúdo junto", () => {
    const { session, send } = makeFlat();
    const y = SOLO + 1;
    send({ type: "place_block", x: 5, y, z: 6, blockId: BlockId.QuadroXP });
    send({ type: "quadro_set", x: 5, y, z: 6, texto: "efêmero" });
    expect(session.toSave().quadros).toHaveLength(1);
    send({ type: "break_block", x: 5, y, z: 6 });
    expect(session.toSave().quadros).toBeUndefined();
  });

  it("restore: conteúdo volta; conteúdo órfão (célula não é quadro) é descartado", () => {
    const { session, send } = makeFlat();
    const y = SOLO + 1;
    send({ type: "place_block", x: 5, y, z: 5, blockId: BlockId.QuadroZP });
    send({ type: "quadro_set", x: 5, y, z: 5, texto: "persistente" });
    const meta = session.toSave();
    const restaurada = new GameSession(() => {}, {
      restore: {
        world: session.world,
        ...meta,
        quadros: [
          ...(meta.quadros ?? []),
          { x: 1, y: 1, z: 1, texto: "órfão" }, // célula de pedra: descarta
        ],
      },
      singleplayer: true,
    });
    expect(restaurada.toSave().quadros).toEqual([
      { x: 5, y, z: 5, texto: "persistente" },
    ]);
  });
});
