import { describe, expect, it } from "vitest";
import { BlockId, isPlaceable } from "./blocks";
import { migrarCamasLegado } from "./camas";
import { formaCanonica } from "./drops";
import { decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { createWorld, getBlock, setBlock } from "./world";

// CamaXP: frente +x, cabeceira em −x — o PÉ é a ponta de +x da fileira
const Y = 20;
const Z = 5;
const fileira = (w: ReturnType<typeof createWorld>, de: number, ate: number) => {
  for (let x = de; x <= ate; x++) setBlock(w, x, Y, Z, BlockId.CamaXP);
};
const ler = (w: ReturnType<typeof createWorld>, de: number, ate: number) => {
  const out: number[] = [];
  for (let x = de; x <= ate; x++) out.push(getBlock(w, x, Y, Z));
  return out;
};
const { CamaXP: PE, CamaCabecaXP: CAB, Air: AR } = BlockId;

describe("migrarCamasLegado (bug-662): cama salva com o mesmo id nas 2 metades", () => {
  it("par antigo vira pé + cabeceira", () => {
    const w = createWorld({ x: 2, y: 2, z: 2 });
    fileira(w, 4, 5);
    expect(migrarCamasLegado(w)).toBe(1);
    expect(ler(w, 4, 5)).toEqual([CAB, PE]);
  });

  it("corrente de 4 (2 camas em fila) vira 2 camas, emparelhadas a partir do pé", () => {
    const w = createWorld({ x: 2, y: 2, z: 2 });
    fileira(w, 2, 5);
    expect(migrarCamasLegado(w)).toBe(2);
    expect(ler(w, 2, 5)).toEqual([CAB, PE, CAB, PE]);
  });

  it("sobra ímpar da corrente (a que duplicava) vira ar", () => {
    const w = createWorld({ x: 2, y: 2, z: 2 });
    fileira(w, 3, 5);
    expect(migrarCamasLegado(w)).toBe(1);
    expect(ler(w, 3, 5)).toEqual([AR, CAB, PE]);
  });

  it("é idempotente: mundo já migrado (e cama nova em fila) passa sem mudar um byte", () => {
    const w = createWorld({ x: 2, y: 2, z: 2 });
    fileira(w, 2, 5);
    migrarCamasLegado(w);
    setBlock(w, 10, Y, Z, CAB); // cama nova, colocada depois
    setBlock(w, 11, Y, Z, PE);
    const antes = ler(w, 0, 15);
    expect(migrarCamasLegado(w)).toBe(0);
    expect(ler(w, 0, 15)).toEqual(antes);
  });

  it("pé sozinho não é tocado (a regra do par cuida dele no tick)", () => {
    const w = createWorld({ x: 2, y: 2, z: 2 });
    setBlock(w, 5, Y, Z, PE);
    expect(migrarCamasLegado(w)).toBe(0);
    expect(getBlock(w, 5, Y, Z)).toBe(PE);
  });

  it("roda no RESTORE da sessão: save antigo abre com as camas certas", () => {
    const s0 = new GameSession(() => {}, { dims: { x: 2, y: 2, z: 2 }, seed: 5, codigo: "sala" });
    fileira(s0.world, 2, 5);
    const save = decodeSave(encodeSave(s0.world, s0.toSave()));
    const s1 = new GameSession(() => {}, { restore: save, codigo: "sala" });
    expect(ler(s1.world, 2, 5)).toEqual([CAB, PE, CAB, PE]);
    // e o tick não evapora nada: os pares agora se reconhecem
    s1.tick();
    s1.tick();
    expect(ler(s1.world, 2, 5)).toEqual([CAB, PE, CAB, PE]);
  });
});

describe("cabeceira da cama (id próprio desde o bug-662)", () => {
  it("não se coloca pelo fio — só nasce junto do pé", () => {
    expect(isPlaceable(BlockId.CamaCabecaZN)).toBe(false);
    expect(isPlaceable(BlockId.CamaZN)).toBe(true);
  });

  it("volta pra mochila como a cama da hotbar", () => {
    for (let k = 0; k < 4; k++) expect(formaCanonica(BlockId.CamaCabecaXP + k)).toBe(BlockId.CamaXP);
  });
});
