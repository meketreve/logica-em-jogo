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

describe("laje / escada (colisão parcial + step-up)", () => {
  it("pousa no TOPO de uma laje de baixo (pés em cell+0,5)", () => {
    const w = flatWorld(); // chão y∈[0,7], topo em y=8
    setBlock(w, 8, 8, 8, BlockId.LajePedraBaixo); // laje ocupa y∈[8, 8.5]
    const p = createPlayer(8.5, 12, 8.5);
    simulate(w, p, IDLE, 2);
    expect(p.onGround).toBe(true);
    expect(p.pos.y).toBeCloseTo(8.5, 2); // pousou no topo da meia-altura
  });

  it("laje de baixo NÃO bloqueia a passagem no nível do torso (só a metade baixa)", () => {
    const w = flatWorld();
    // laje de baixo suspensa no nível do TORSO (não dos pés): não deve barrar
    setBlock(w, 8, 10, 5, BlockId.LajePedraBaixo);
    const p = createPlayer(8.5, 8.001, 8);
    simulate(w, p, { ...IDLE, forward: 1 }, 2);
    expect(p.pos.z).toBeLessThan(4); // passou reto por baixo da metade vazia
  });

  it("SOBE numa laje de baixo andando, sem pular (step-up)", () => {
    const w = flatWorld();
    for (let z = 2; z <= 6; z++) setBlock(w, 8, 8, z, BlockId.LajePedraBaixo); // faixa de laje
    const p = createPlayer(8.5, 8.001, 8);
    simulate(w, p, { ...IDLE, forward: 1 }, 1); // anda pra -Z, SEM jump (~4 blocos)
    expect(p.onGround).toBe(true);
    expect(p.pos.y).toBeCloseTo(8.5, 1); // subiu meio bloco andando
    expect(p.pos.z).toBeGreaterThan(3); // parou EM CIMA da faixa de laje
    expect(p.pos.z).toBeLessThan(6.5);
  });

  it("NÃO sobe um cubo cheio andando (step-up é só ≤ meia altura)", () => {
    const w = flatWorld();
    for (let z = 3; z <= 6; z++) setBlock(w, 8, 8, z, BlockId.Stone); // parede de cubo cheio
    const p = createPlayer(8.5, 8.001, 8);
    simulate(w, p, { ...IDLE, forward: 1 }, 2);
    expect(p.pos.y).toBeLessThan(8.4); // não escalou o bloco inteiro
    expect(p.pos.z).toBeGreaterThan(6.9); // barrado na face do cubo
  });

  it("bate a cabeça na BASE de uma laje de cima (teto de meia altura)", () => {
    const w = flatWorld();
    setBlock(w, 8, 10, 8, BlockId.LajePedraCima); // laje ocupa y∈[10.5, 11]
    const p = createPlayer(8.5, 8.001, 8.5);
    p.vel.y = 6;
    simulate(w, p, { ...IDLE, jump: true }, 2);
    // a cabeça (pés+1.8) não passa da base do teto (10.5) → pés < 10.5-1.8 = 8.7
    expect(p.pos.y).toBeLessThan(8.71);
  });

  it("sobe o degrau de uma escada andando", () => {
    const w = flatWorld();
    setBlock(w, 8, 8, 5, BlockId.EscadaPedraZN); // escada sobe pra -z (base + degrau)
    for (let y = 8; y <= 10; y++) setBlock(w, 8, y, 4, BlockId.Stone); // parede: segura no degrau
    const p = createPlayer(8.5, 8.001, 8);
    simulate(w, p, { ...IDLE, forward: 1 }, 2); // anda -Z contra a escada
    expect(p.onGround).toBe(true);
    expect(p.pos.y).toBeCloseTo(9, 1); // subiu base (8,5) E degrau (9,0)
    expect(p.pos.y).toBeGreaterThan(8.4); // subiu pelo menos a base (meia altura)
  });

  // bug-512 (2026-07-25): o degrau da escada ocupa MEIA célula em XZ; encostar
  // nele empurrava o jogador até a fronteira da CÉLULA (~0,65 pra trás).
  it("não é EMPURRADO PRA TRÁS ao esbarrar no degrau da escada", () => {
    const w = flatWorld();
    setBlock(w, 8, 8, 5, BlockId.EscadaPedraZN); // sobe pra −z: degrau na metade −z
    const p = createPlayer(8.5, 8.001, 8);
    const dt = 1 / 60;
    let zAnterior = p.pos.z;
    for (let i = 0; i < 120; i++) {
      stepPlayer(w, p, { ...IDLE, forward: 1 }, dt); // anda −Z contra a escada
      expect(p.pos.z).toBeLessThanOrEqual(zAnterior + 1e-3); // nunca volta pra +Z
      zAnterior = p.pos.z;
    }
  });

  it("sobe uma ESCADARIA de 2 lances andando e para na parede do topo", () => {
    const w = flatWorld(); // chão topo em y=8
    setBlock(w, 8, 8, 5, BlockId.EscadaPedraZN); // 1º lance: 8 → 9
    setBlock(w, 8, 8, 4, BlockId.Stone);
    setBlock(w, 8, 9, 4, BlockId.EscadaPedraZN); // 2º lance: 9 → 10
    setBlock(w, 8, 8, 3, BlockId.Stone);
    setBlock(w, 8, 9, 3, BlockId.Stone); // patamar em y=10
    setBlock(w, 8, 10, 2, BlockId.Stone);
    setBlock(w, 8, 11, 2, BlockId.Stone); // parede que segura o jogador no topo
    const p = createPlayer(8.5, 8.001, 8);
    simulate(w, p, { ...IDLE, forward: 1 }, 3);
    expect(p.onGround).toBe(true);
    expect(p.pos.y).toBeCloseTo(10, 1); // subiu os 2 lances andando
    expect(p.pos.z).toBeLessThan(4); // chegou ao patamar
    expect(p.pos.z).toBeGreaterThan(3); // parado na parede, não dentro dela
  });
});

describe("nado (água)", () => {
  /** Piscina: chão sólido y∈[0,3] e água y∈[4,7] num miolo 4..11 (longe da borda
   *  do chunk, para os vizinhos do jogador serem água, não OOB). */
  function poolWorld() {
    const w = createWorld({ x: 1, z: 1, y: 1 });
    for (let x = 0; x < 16; x++)
      for (let z = 0; z < 16; z++) {
        for (let y = 0; y < 4; y++) setBlock(w, x, y, z, BlockId.Stone);
        if (x >= 4 && x <= 11 && z >= 4 && z <= 11)
          for (let y = 4; y < 8; y++) setBlock(w, x, y, z, BlockId.Agua);
      }
    return w;
  }

  it("pular em água ABERTA sobe devagar (swimSpeed, sem foguete)", () => {
    const w = poolWorld();
    const p = createPlayer(8.5, 6, 8.5); // torso (y≈6.9) submerso, sem parede ao lado
    stepPlayer(w, p, { ...IDLE, jump: true }, 1 / 60);
    expect(p.vel.y).toBeCloseTo(PLAYER.swimSpeed, 5);
  });

  it("pular com bloco cheio na borda dá pulo FORTE de saída (waterJumpSpeed)", () => {
    const w = poolWorld();
    setBlock(w, 9, 6, 8, BlockId.Stone); // parede a leste, na altura do torso/pés
    const p = createPlayer(8.5, 6, 8.5);
    stepPlayer(w, p, { ...IDLE, jump: true }, 1 / 60);
    expect(p.vel.y).toBeCloseTo(PLAYER.waterJumpSpeed, 5);
    expect(PLAYER.waterJumpSpeed).toBeGreaterThan(PLAYER.swimSpeed);
  });

  it("escala um bloco cheio na borda (pico ultrapassa o topo da muralha)", () => {
    const w = poolWorld();
    // muralha a leste (x=8, z=4..11) com topo em y=8 = nível da água
    for (let z = 4; z <= 11; z++) for (let y = 4; y < 8; y++) setBlock(w, 8, y, z, BlockId.Stone);
    // começa colado na muralha, submerso; olhar +X (leste) empurra contra ela
    const p = createPlayer(7.6, 5, 8.5);
    let picoPes = p.pos.y;
    const dt = 1 / 60;
    for (let t = 0; t < 2; t += dt) {
      stepPlayer(w, p, { ...IDLE, forward: 1, jump: true, yaw: -Math.PI / 2 }, dt);
      picoPes = Math.max(picoPes, p.pos.y);
    }
    // com swimSpeed (4) o pico dos pés não passa de ~7.4; o waterJumpSpeed leva
    // acima de 8 = limpa o topo da muralha e permite subir por cima
    expect(picoPes).toBeGreaterThan(8);
  });
});

describe("voo criativo (fly)", () => {
  it("em voo não cai — sem tecla, fica parado no ar", () => {
    const w = flatWorld();
    const p = createPlayer(8, 20, 8);
    simulate(w, p, { ...IDLE, fly: true }, 2);
    expect(p.pos.y).toBeCloseTo(20, 3); // gravidade desligada
    expect(p.onGround).toBe(false);
  });

  it("pular sobe e agachar desce em voo", () => {
    const w = flatWorld();
    const p = createPlayer(8, 20, 8);
    simulate(w, p, { ...IDLE, fly: true, jump: true }, 1);
    expect(p.pos.y).toBeGreaterThan(24); // ~flyVertSpeed blocos/s pra cima

    const q = createPlayer(8, 20, 8);
    simulate(w, q, { ...IDLE, fly: true, sneak: true }, 1);
    expect(q.pos.y).toBeLessThan(16); // desce
  });

  it("voo ainda colide com blocos (não atravessa o chão)", () => {
    const w = flatWorld(); // sólido y ∈ [0,7]
    const p = createPlayer(8, 8.001, 8);
    simulate(w, p, { ...IDLE, fly: true, sneak: true }, 2); // tenta descer pro chão
    expect(p.pos.y).toBeGreaterThanOrEqual(8 - 1e-2); // parou em cima
  });

  // `/invisivel` (2026-08-22): o professor fantasma atravessa parede. A física é
  // do CLIENTE, então sem este flag ele bateria na rocha mesmo com o servidor
  // aceitando o passo — os dois lados precisam concordar.
  it("noclip atravessa o chão que o voo comum respeita", () => {
    const w = flatWorld(); // sólido y ∈ [0,7]
    const p = createPlayer(8, 8.001, 8);
    simulate(w, p, { ...IDLE, fly: true, sneak: true, noclip: true }, 2);
    expect(p.pos.y).toBeLessThan(4); // afundou na pedra em vez de parar em cima
  });

  it("noclip sem voo não faz nada (o fantasma só atravessa voando)", () => {
    const w = flatWorld();
    const p = createPlayer(8, 8.001, 8);
    simulate(w, p, { ...IDLE, noclip: true }, 2); // caindo, sem fly
    expect(p.pos.y).toBeGreaterThanOrEqual(8 - 1e-2); // a gravidade parou no chão
  });

  it("voo move na horizontal mais rápido que andar", () => {
    const w = flatWorld();
    const p = createPlayer(8, 20, 8);
    simulate(w, p, { ...IDLE, fly: true, forward: 1 }, 1);
    expect(p.pos.z).toBeLessThan(8 - PLAYER.walkSpeed); // > walkSpeed blocos/s
  });
});
