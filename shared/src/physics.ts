import { BlockId } from "./blocks";
import { type World, getBlock } from "./world";

/**
 * Física do jogador (andar, gravidade, colisão AABB com o grid de voxels).
 * Vive em /shared: o cliente usa agora (checkpoint 1) e o servidor reusa
 * depois para validar movimento. Determinística — sem dependência de host.
 * Unidades: blocos e segundos.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const PLAYER = {
  width: 0.6,
  height: 1.8,
  eyeHeight: 1.62,
  /** Olhos mais baixos enquanto agachado (feedback visual do sneak). */
  sneakEyeHeight: 1.32,
  walkSpeed: 4.3,
  /** Multiplicador de velocidade correndo (Ctrl/duplo-toque no andar). */
  sprintFactor: 1.6,
  /** Multiplicador de velocidade agachado (Shift). */
  sneakFactor: 0.3,
  jumpSpeed: 8.4,
  gravity: 25,
  /** Velocidade máxima de queda (evita atravessar blocos com dt grande). */
  terminalVelocity: 40,
} as const;

/** Folga deixada ao encostar num bloco (evita re-colisão por arredondamento). */
const EPS = 1e-3;
/** Deslocamento máximo por sub-passo de integração (< 1 bloco = sem tunneling). */
const MAX_STEP = 0.4;

export interface PlayerState {
  /** Posição dos PÉS (centro do AABB em x/z, base em y). */
  pos: Vec3;
  vel: Vec3;
  onGround: boolean;
  /** Corrida ENGATADA: só liga com os pés no chão; segue valendo no ar. */
  sprinting: boolean;
}

/** Input de movimento de um passo. forward/strafe em [-1,1]; yaw em radianos (0 = olhando -Z). */
export interface MoveInput {
  forward: number;
  strafe: number;
  jump: boolean;
  yaw: number;
  /** Correndo. Agachar vence: sneak=true ignora sprint. */
  sprint?: boolean;
  /** Agachado: mais lento e, no chão, não cai da borda do bloco. */
  sneak?: boolean;
}

export function createPlayer(x: number, y: number, z: number): PlayerState {
  return { pos: { x, y, z }, vel: { x: 0, y: 0, z: 0 }, onGround: false, sprinting: false };
}

/** O AABB do jogador na posição `pos` sobrepõe algum bloco sólido? */
function collides(world: World, pos: Vec3): boolean {
  const half = PLAYER.width / 2;
  const x0 = Math.floor(pos.x - half);
  const x1 = Math.floor(pos.x + half);
  const y0 = Math.floor(pos.y);
  const y1 = Math.floor(pos.y + PLAYER.height);
  const z0 = Math.floor(pos.z - half);
  const z1 = Math.floor(pos.z + half);
  for (let y = y0; y <= y1; y++) {
    for (let z = z0; z <= z1; z++) {
      for (let x = x0; x <= x1; x++) {
        if (getBlock(world, x, y, z) !== BlockId.Air) return true;
      }
    }
  }
  return false;
}

/** Move um eixo e, se colidir, encosta na face do bloco e zera a velocidade do eixo. */
function moveAxis(world: World, p: PlayerState, axis: "x" | "y" | "z", dist: number): void {
  if (dist === 0) return;
  p.pos[axis] += dist;
  if (!collides(world, p.pos)) return;

  const half = PLAYER.width / 2;
  if (axis === "y") {
    if (dist < 0) {
      p.pos.y = Math.floor(p.pos.y) + 1 + EPS;
      p.onGround = true;
    } else {
      p.pos.y = Math.floor(p.pos.y + PLAYER.height) - PLAYER.height - EPS;
    }
    p.vel.y = 0;
  } else {
    if (dist > 0) {
      p.pos[axis] = Math.floor(p.pos[axis] + half) - half - EPS;
    } else {
      p.pos[axis] = Math.floor(p.pos[axis] - half) + 1 + half + EPS;
    }
    p.vel[axis] = 0;
  }
}

/** Há bloco sólido logo abaixo dos pés (sustentando o AABB)? */
function hasSupport(world: World, pos: Vec3): boolean {
  const half = PLAYER.width / 2;
  const y = Math.floor(pos.y) - 1;
  const x0 = Math.floor(pos.x - half);
  const x1 = Math.floor(pos.x + half);
  const z0 = Math.floor(pos.z - half);
  const z1 = Math.floor(pos.z + half);
  for (let z = z0; z <= z1; z++)
    for (let x = x0; x <= x1; x++)
      if (getBlock(world, x, y, z) !== BlockId.Air) return true;
  return false;
}

/** moveAxis horizontal com edge-guard do agachar: passo que tiraria o chão de baixo dos pés é desfeito (por eixo — na diagonal o eixo seguro continua deslizando). */
function moveAxisGuarded(
  world: World,
  p: PlayerState,
  axis: "x" | "z",
  dist: number,
  guard: boolean,
): void {
  const before = p.pos[axis];
  moveAxis(world, p, axis, dist);
  if (guard && !hasSupport(world, p.pos)) {
    p.pos[axis] = before;
    p.vel[axis] = 0;
  }
}

/** Um passo de simulação do jogador. Muta `p`. */
export function stepPlayer(world: World, p: PlayerState, input: MoveInput, dt: number): void {
  // Velocidade horizontal direto do input (sem inércia — controle imediato).
  const f = input.forward;
  const s = input.strafe;
  const sneak = input.sneak === true;
  // Corrida ENGATA só com os pés no chão (apertar correr no meio do pulo não
  // vira turbo aéreo). Engatada, a tecla de correr não precisa mais ser
  // segurada: vale enquanto andar pra frente — e atravessa pulo/queda.
  // Desengata ao soltar o "frente" ou agachar.
  if (sneak || f <= 0) p.sprinting = false;
  else if (input.sprint === true && p.onGround) p.sprinting = true;
  const factor = sneak ? PLAYER.sneakFactor : p.sprinting ? PLAYER.sprintFactor : 1;
  const len = Math.hypot(f, s);
  const scale = (len > 1 ? 1 / len : 1) * PLAYER.walkSpeed * factor;
  const sin = Math.sin(input.yaw);
  const cos = Math.cos(input.yaw);
  p.vel.x = (s * cos - f * sin) * scale;
  p.vel.z = (-f * cos - s * sin) * scale;

  if (input.jump && p.onGround) p.vel.y = PLAYER.jumpSpeed;
  p.vel.y -= PLAYER.gravity * dt;
  if (p.vel.y < -PLAYER.terminalVelocity) p.vel.y = -PLAYER.terminalVelocity;

  p.onGround = false;

  const maxDist =
    Math.max(Math.abs(p.vel.x), Math.abs(p.vel.y), Math.abs(p.vel.z)) * dt;
  const steps = Math.max(1, Math.ceil(maxDist / MAX_STEP));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    moveAxis(world, p, "y", p.vel.y * h);
    // edge-guard só com os pés no chão — no ar (pulo/queda) agachar não trava nada
    const guard = sneak && p.onGround;
    moveAxisGuarded(world, p, "x", p.vel.x * h, guard);
    moveAxisGuarded(world, p, "z", p.vel.z * h, guard);
  }
}
