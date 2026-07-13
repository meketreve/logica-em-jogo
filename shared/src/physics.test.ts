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

  it("correr é mais rápido, agachar é mais lento (e agachar vence sprint)", () => {
    const w = flatWorld();
    const p = createPlayer(8, 8.001, 8);
    simulate(w, p, IDLE, 0.5); // assenta no chão: corrida só engata com os pés no chão
    stepPlayer(w, p, { ...IDLE, forward: 1, sprint: true }, 1 / 60);
    expect(Math.hypot(p.vel.x, p.vel.z)).toBeCloseTo(PLAYER.walkSpeed * PLAYER.sprintFactor, 5);
    stepPlayer(w, p, { ...IDLE, forward: 1, sneak: true }, 1 / 60);
    expect(Math.hypot(p.vel.x, p.vel.z)).toBeCloseTo(PLAYER.walkSpeed * PLAYER.sneakFactor, 5);
    stepPlayer(w, p, { ...IDLE, forward: 1, sprint: true, sneak: true }, 1 / 60);
    expect(Math.hypot(p.vel.x, p.vel.z)).toBeCloseTo(PLAYER.walkSpeed * PLAYER.sneakFactor, 5);
  });

  it("agachado não cai da borda do bloco (edge-guard); sem agachar, cai", () => {
    // pilar isolado de 1 bloco no ar: (8, 8, 8)
    const w = createWorld({ x: 1, z: 1, y: 1 });
    setBlock(w, 8, 8, 8, BlockId.Stone);
    const sneaky = createPlayer(8.5, 9.001, 8.5);
    simulate(w, sneaky, { ...IDLE, forward: 1, sneak: true }, 2);
    expect(sneaky.onGround).toBe(true); // ficou em cima
    expect(sneaky.pos.y).toBeCloseTo(9, 1);
    const walker = createPlayer(8.5, 9.001, 8.5);
    simulate(w, walker, { ...IDLE, forward: 1 }, 2);
    expect(walker.pos.y).toBeLessThan(5); // caiu do pilar
  });

  it("edge-guard desliza pelo eixo seguro na diagonal", () => {
    // trilho de 1 bloco de largura ao longo de -Z: andar diagonal (frente+direita)
    // deve avançar em -Z (eixo seguro) sem cair pra +X
    const w = createWorld({ x: 1, z: 1, y: 1 });
    for (let z = 0; z < 16; z++) setBlock(w, 8, 8, z, BlockId.Stone);
    const p = createPlayer(8.5, 9.001, 12.5);
    simulate(w, p, { ...IDLE, forward: 1, strafe: 1, sneak: true }, 2);
    expect(p.onGround).toBe(true); // não caiu do trilho
    expect(p.pos.z).toBeLessThan(11); // avançou em -Z
    // em X pode se debruçar até o AABB quase sair do bloco (footprint ainda
    // toca o trilho: |x-8.5| < 0.8), mas nunca além — não cai
    expect(Math.abs(p.pos.x - 8.5)).toBeLessThan(0.81);
  });

  it("corrida engatada segue sem a tecla de correr; solta o 'frente' e para", () => {
    const w = flatWorld();
    const walk = PLAYER.walkSpeed;
    const run = PLAYER.walkSpeed * PLAYER.sprintFactor;
    const p = createPlayer(8, 8.001, 8);
    simulate(w, p, IDLE, 0.5);

    stepPlayer(w, p, { ...IDLE, forward: 1, sprint: true }, 1 / 60); // engata
    stepPlayer(w, p, { ...IDLE, forward: 1 }, 1 / 60); // soltou o Ctrl, W segurado
    expect(Math.hypot(p.vel.x, p.vel.z)).toBeCloseTo(run, 5);
    stepPlayer(w, p, { ...IDLE, forward: 1, sneak: true }, 1 / 60); // agachar corta
    stepPlayer(w, p, { ...IDLE, forward: 1 }, 1 / 60);
    expect(Math.hypot(p.vel.x, p.vel.z)).toBeCloseTo(walk, 5);

    stepPlayer(w, p, { ...IDLE, forward: 1, sprint: true }, 1 / 60); // re-engata
    stepPlayer(w, p, IDLE, 1 / 60); // soltou o W
    stepPlayer(w, p, { ...IDLE, forward: 1 }, 1 / 60); // W de novo, sem Ctrl
    expect(Math.hypot(p.vel.x, p.vel.z)).toBeCloseTo(walk, 5);
  });

  it("corrida só engata no chão, mas sobrevive ao pulo", () => {
    const w = flatWorld();
    const walk = PLAYER.walkSpeed;
    const run = PLAYER.walkSpeed * PLAYER.sprintFactor;

    // apertar correr NO AR (caindo) não dá velocidade de corrida
    const aereo = createPlayer(8, 12, 8);
    stepPlayer(w, aereo, { ...IDLE, forward: 1, sprint: true }, 1 / 60);
    expect(Math.hypot(aereo.vel.x, aereo.vel.z)).toBeCloseTo(walk, 5);
    simulate(w, aereo, { ...IDLE, sprint: true }, 1.5); // cai e pisa no chão
    expect(aereo.onGround).toBe(true);
    stepPlayer(w, aereo, { ...IDLE, forward: 1, sprint: true }, 1 / 60);
    expect(Math.hypot(aereo.vel.x, aereo.vel.z)).toBeCloseTo(run, 5); // agora sim

    // engatado no chão, o pulo NÃO derruba a corrida
    const p = createPlayer(8, 8.001, 8);
    simulate(w, p, IDLE, 0.5);
    stepPlayer(w, p, { ...IDLE, forward: 1, sprint: true, jump: true }, 1 / 60);
    expect(p.onGround).toBe(false); // pulou
    stepPlayer(w, p, { ...IDLE, forward: 1, sprint: true }, 1 / 60);
    expect(Math.hypot(p.vel.x, p.vel.z)).toBeCloseTo(run, 5);
    // soltar o "frente" no ar desengata — e correr NÃO reengata sem tocar o chão
    stepPlayer(w, p, IDLE, 1 / 60);
    stepPlayer(w, p, { ...IDLE, forward: 1, sprint: true }, 1 / 60);
    expect(p.onGround).toBe(false);
    expect(Math.hypot(p.vel.x, p.vel.z)).toBeCloseTo(walk, 5);
  });

  it("agachar no ar não trava o movimento (guard só com chão)", () => {
    const w = flatWorld();
    const p = createPlayer(8, 12, 8); // no ar, caindo
    stepPlayer(w, p, { ...IDLE, forward: 1, sneak: true }, 1 / 60);
    expect(p.pos.z).toBeLessThan(8); // andou pra frente mesmo agachado no ar
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
