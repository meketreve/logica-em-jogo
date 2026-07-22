import { isAgua, isSolidBlock } from "./blocks";
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
  /** Voo criativo: velocidade horizontal (mais rápido que andar). */
  flySpeed: 9,
  /** Voo criativo: subir/descer (tecla de pular / de agachar). */
  flyVertSpeed: 7,
  /** Água (2026-07-21): modificador de velocidade horizontal submerso. */
  waterFactor: 0.5,
  /** Água: empuxo — gravidade reduzida submerso (afunda devagar). */
  waterGravity: 8,
  /** Água: velocidade de nadar pra cima/baixo (pular sobe, agachar desce). */
  swimSpeed: 4,
  /** Água: pulo FORTE de saída — só perto de uma parede/borda (bloco cheio
   *  adjacente), salta pra cima do bloco em vez de bobear na superfície. */
  waterJumpSpeed: 7.5,
  /** Água: queda máxima submerso (afunda devagar, não despenca). */
  waterSinkMax: 3,
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
  /** Agachado: mais lento e, no chão, não cai da borda do bloco. Em voo, DESCE. */
  sneak?: boolean;
  /** Em voo (modo criativo): sem gravidade; `jump` sobe e `sneak` desce. */
  fly?: boolean;
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
        // cp23: sólido de FÍSICA, não "≠ ar" — porta aberta e tocha atravessam
        if (isSolidBlock(getBlock(world, x, y, z))) return true;
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

/** O TORSO do jogador está dentro de um bloco de água? (dispara nado/empuxo). */
function inWater(world: World, pos: Vec3): boolean {
  return isAgua(
    getBlock(
      world,
      Math.floor(pos.x),
      Math.floor(pos.y + PLAYER.height * 0.5),
      Math.floor(pos.z),
    ),
  );
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
      if (isSolidBlock(getBlock(world, x, y, z))) return true;
  return false;
}

/** Há bloco sólido colado ao jogador na horizontal (parede/borda para sair da
 *  água)? Amostra os 4 lados nos níveis dos pés E do torso. */
function paredeAdjacente(world: World, pos: Vec3): boolean {
  const half = PLAYER.width / 2;
  const cx = Math.floor(pos.x);
  const cz = Math.floor(pos.z);
  const xLeste = Math.floor(pos.x + half) + 1;
  const xOeste = Math.floor(pos.x - half) - 1;
  const zSul = Math.floor(pos.z + half) + 1;
  const zNorte = Math.floor(pos.z - half) - 1;
  const yPes = Math.floor(pos.y);
  const yTorso = Math.floor(pos.y + PLAYER.height * 0.5);
  for (let y = yPes; y <= yTorso; y++) {
    if (
      isSolidBlock(getBlock(world, xLeste, y, cz)) ||
      isSolidBlock(getBlock(world, xOeste, y, cz)) ||
      isSolidBlock(getBlock(world, cx, y, zSul)) ||
      isSolidBlock(getBlock(world, cx, y, zNorte))
    )
      return true;
  }
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

  // Voo criativo: sem gravidade; pular sobe, agachar desce. Ainda COLIDE com
  // blocos (não atravessa parede — convenção Minecraft criativo).
  if (input.fly === true) {
    p.sprinting = false;
    p.onGround = false;
    const sin = Math.sin(input.yaw);
    const cos = Math.cos(input.yaw);
    const len = Math.hypot(f, s);
    const scale = (len > 1 ? 1 / len : 1) * PLAYER.flySpeed;
    p.vel.x = (s * cos - f * sin) * scale;
    p.vel.z = (-f * cos - s * sin) * scale;
    p.vel.y = ((input.jump ? 1 : 0) - (input.sneak === true ? 1 : 0)) * PLAYER.flyVertSpeed;
    const maxDist = Math.max(Math.abs(p.vel.x), Math.abs(p.vel.y), Math.abs(p.vel.z)) * dt;
    const steps = Math.max(1, Math.ceil(maxDist / MAX_STEP));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      moveAxis(world, p, "y", p.vel.y * h);
      moveAxis(world, p, "x", p.vel.x * h);
      moveAxis(world, p, "z", p.vel.z * h);
    }
    return;
  }

  const sneak = input.sneak === true;
  // Nado (2026-07-21): torso submerso em água → mais lento, empuxo e nado
  // vertical (pular sobe, agachar desce). Água NÃO é sólida (blocks.ts), então
  // a colisão AABB a ignora — o movimento livre aqui é o que faz "entrar e nadar".
  const submerso = inWater(world, p.pos);
  // Corrida ENGATA só com os pés no chão (apertar correr no meio do pulo não
  // vira turbo aéreo). Engatada, a tecla de correr não precisa mais ser
  // segurada: vale enquanto andar pra frente — e atravessa pulo/queda.
  // Desengata ao soltar o "frente", agachar ou entrar na água.
  if (sneak || f <= 0 || submerso) p.sprinting = false;
  else if (input.sprint === true && p.onGround) p.sprinting = true;
  const factor =
    (sneak ? PLAYER.sneakFactor : p.sprinting ? PLAYER.sprintFactor : 1) *
    (submerso ? PLAYER.waterFactor : 1);
  const len = Math.hypot(f, s);
  const scale = (len > 1 ? 1 / len : 1) * PLAYER.walkSpeed * factor;
  const sin = Math.sin(input.yaw);
  const cos = Math.cos(input.yaw);
  p.vel.x = (s * cos - f * sin) * scale;
  p.vel.z = (-f * cos - s * sin) * scale;

  if (submerso) {
    // pular = subir, agachar = descer; solto = afunda devagar (empuxo).
    // Perto de uma parede/borda (bloco cheio adjacente) o pulo é FORTE para
    // saltar por cima do bloco; em água aberta é só o nado vertical suave
    // (não vira foguete).
    if (input.jump)
      p.vel.y = paredeAdjacente(world, p.pos) ? PLAYER.waterJumpSpeed : PLAYER.swimSpeed;
    else if (sneak) p.vel.y = -PLAYER.swimSpeed;
    else {
      p.vel.y -= PLAYER.waterGravity * dt;
      if (p.vel.y < -PLAYER.waterSinkMax) p.vel.y = -PLAYER.waterSinkMax;
      if (p.vel.y > PLAYER.waterSinkMax) p.vel.y = PLAYER.waterSinkMax;
    }
  } else {
    if (input.jump && p.onGround) p.vel.y = PLAYER.jumpSpeed;
    p.vel.y -= PLAYER.gravity * dt;
    if (p.vel.y < -PLAYER.terminalVelocity) p.vel.y = -PLAYER.terminalVelocity;
  }

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
