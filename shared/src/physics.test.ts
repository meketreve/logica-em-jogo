import { describe, expect, it } from "vitest";
import {
  BlockId,
  type MoveInput,
  PLAYER,
  createPlayer,
  createWorld,
  setBlock,
  stepPlayer,
} from "./index";

const IDLE: MoveInput = { forward: 0, strafe: 0, jump: false, yaw: 0 };

/** Mundo 1 chunk com chão sólido em y ∈ [0,7]. */
function flatWorld() {
  const w = createWorld({ x: 1, z: 1, y: 1 });
  for (let x = 0; x < 16; x++)
    for (let z = 0; z < 16; z++)
      for (let y = 0; y < 8; y++) setBlock(w, x, y, z, BlockId.Stone);
  return w;
}

function simulate(w: ReturnType<typeof flatWorld>, p: ReturnType<typeof createPlayer>, input: MoveInput, seconds: number) {
  const dt = 1 / 60;
  for (let t = 0; t < seconds; t += dt) stepPlayer(w, p, input, dt);
}

describe("física do jogador (/shared — cliente usa, servidor valida)", () => {
  it("cai e para em cima do chão (onGround)", () => {
    const w = flatWorld();
    const p = createPlayer(8, 12, 8);
    simulate(w, p, IDLE, 2);
    expect(p.onGround).toBe(true);
    expect(p.pos.y).toBeCloseTo(8, 1);
    expect(p.vel.y).toBe(0);
  });

  it("anda para frente com yaw 0 = direção -Z", () => {
    const w = flatWorld();
    const p = createPlayer(8, 8.001, 8);
    simulate(w, p, { ...IDLE, forward: 1 }, 1);
    expect(p.pos.z).toBeLessThan(8 - 3); // ~4.3 blocos/s
    expect(p.pos.x).toBeCloseTo(8, 3);
  });

  it("diagonal não é mais rápida que reto (input normalizado)", () => {
    const w = flatWorld();
    const p = createPlayer(8, 8.001, 8);
    stepPlayer(w, p, { ...IDLE, forward: 1, strafe: 1 }, 1 / 60);
    const speed = Math.hypot(p.vel.x, p.vel.z);
    expect(speed).toBeCloseTo(PLAYER.walkSpeed, 5);
  });

  it("parede bloqueia o movimento", () => {
    const w = flatWorld();
    for (let y = 8; y < 12; y++) setBlock(w, 8, y, 5, BlockId.Stone); // parede em z=5
    const p = createPlayer(8.5, 8.001, 8);
    simulate(w, p, { ...IDLE, forward: 1 }, 2);
    // AABB (largura 0.6) encosta na face z=6 da parede: pés ficam em z ≈ 6.3
    expect(p.pos.z).toBeGreaterThan(6.2);
  });

  it("pulo sobe e volta pro chão", () => {
    const w = flatWorld();
    const p = createPlayer(8, 8.001, 8);
    simulate(w, p, IDLE, 1); // assenta no chão
    stepPlayer(w, p, { ...IDLE, jump: true }, 1 / 60);
    expect(p.vel.y).toBeGreaterThan(0);
    let peak = p.pos.y;
    for (let i = 0; i < 120; i++) {
      stepPlayer(w, p, IDLE, 1 / 60);
      peak = Math.max(peak, p.pos.y);
    }
    expect(peak).toBeGreaterThan(9); // subiu mais de 1 bloco
    expect(p.onGround).toBe(true); // e voltou
    expect(p.pos.y).toBeCloseTo(8, 1);
  });

  it("queda longa não atravessa o chão (sub-passos anti-tunneling)", () => {
    const w = flatWorld();
    const p = createPlayer(8, 15.9, 8);
    p.vel.y = -PLAYER.terminalVelocity;
    // dt exagerado de 50ms: deslocamento de 2 blocos por passo sem sub-passos
    for (let i = 0; i < 40; i++) stepPlayer(w, p, IDLE, 0.05);
    expect(p.pos.y).toBeCloseTo(8, 1);
    expect(p.onGround).toBe(true);
  });
});
