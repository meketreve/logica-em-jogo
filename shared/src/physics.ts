import { collisionBoxes, isAgua, isSlab, isSolidBlock, isStairs } from "./blocks";
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
/** Altura máxima que o jogador SOBE andando, sem pular (laje/degrau de escada =
 *  0,5). Uma pitada acima de 0,5 pra limpar o topo da laje com folga. */
export const STEP_HEIGHT = 0.55;

/** Bloco com colisão PARCIAL (sub-caixas, não a célula inteira)? Só laje/escada
 *  hoje; o resto sólido colide como célula cheia (cubo, cerca, porta, móvel). */
function temColisaoParcial(id: number): boolean {
  return isSlab(id) || isStairs(id);
}

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

/** O AABB do jogador na posição `pos` sobrepõe algum bloco sólido? Cubo cheio
 *  (e cerca/porta/móvel) ocupa a célula inteira → overlap imediato; laje/escada
 *  testam as sub-caixas de `collisionBoxes` (colisão de altura parcial). */
function collides(world: World, pos: Vec3): boolean {
  const half = PLAYER.width / 2;
  const pMinX = pos.x - half, pMaxX = pos.x + half;
  const pMinY = pos.y, pMaxY = pos.y + PLAYER.height;
  const pMinZ = pos.z - half, pMaxZ = pos.z + half;
  const x0 = Math.floor(pMinX), x1 = Math.floor(pMaxX);
  const y0 = Math.floor(pMinY), y1 = Math.floor(pMaxY);
  const z0 = Math.floor(pMinZ), z1 = Math.floor(pMaxZ);
  for (let y = y0; y <= y1; y++) {
    for (let z = z0; z <= z1; z++) {
      for (let x = x0; x <= x1; x++) {
        const id = getBlock(world, x, y, z);
        // cp23: sólido de FÍSICA, não "≠ ar" — porta aberta e tocha atravessam
        if (!isSolidBlock(id)) continue;
        // célula inteira (cubo cheio, cerca, porta fechada, móvel) → overlap certo
        if (!temColisaoParcial(id)) return true;
        // laje/escada: overlap AABB contra cada sub-caixa (frações da célula)
        for (const b of collisionBoxes(id)) {
          if (
            pMaxX > x + b[0] && pMinX < x + b[3] &&
            pMaxY > y + b[1] && pMinY < y + b[4] &&
            pMaxZ > z + b[2] && pMinZ < z + b[5]
          )
            return true;
        }
      }
    }
  }
  return false;
}

const FULL_BOX: readonly (readonly [number, number, number, number, number, number])[] =
  [[0, 0, 0, 1, 1, 1]];

/**
 * O jogador está APOIADO nesta posição? (§🍖 F2) Testa o AABB uma folga abaixo
 * dos pés — mesma lógica de laje/escada do `collides`, então não há uma segunda
 * definição de "chão" pra sair de acordo com a física.
 *
 * O SERVIDOR usa isto pra fechar a queda a partir do fluxo de `move` (10 Hz):
 * ele tem o mundo e não confia no cliente pra dizer que pousou.
 */
export function apoiadoNoChao(world: World, pos: Vec3): boolean {
  return collides(world, { x: pos.x, y: pos.y - 0.05, z: pos.z });
}

/** Superfície de apoio (topo/base) de colisão sob/sobre o jogador ao longo de Y,
 *  respeitando sub-caixas parciais. `dir<0` = descendo (topo mais alto sob os
 *  pés → onde os pés pousam); `dir>0` = subindo (base mais baixa sobre a cabeça).
 *  Só considera caixas que o AABB toca em X/Z. Devolve NaN se não achar. */
function resolveVertical(world: World, pos: Vec3, dir: number): number {
  const half = PLAYER.width / 2;
  const pMinX = pos.x - half, pMaxX = pos.x + half;
  const pMinZ = pos.z - half, pMaxZ = pos.z + half;
  const x0 = Math.floor(pMinX), x1 = Math.floor(pMaxX);
  const z0 = Math.floor(pMinZ), z1 = Math.floor(pMaxZ);
  // janela de células em Y que cobre o AABB (+1 de folga em cada ponta)
  const yLo = Math.floor(pos.y) - 1;
  const yHi = Math.floor(pos.y + PLAYER.height) + 1;
  const feet = pos.y;
  const head = pos.y + PLAYER.height;
  let best = NaN;
  for (let y = yLo; y <= yHi; y++) {
    for (let z = z0; z <= z1; z++) {
      for (let x = x0; x <= x1; x++) {
        const id = getBlock(world, x, y, z);
        if (!isSolidBlock(id)) continue;
        const boxes = temColisaoParcial(id) ? collisionBoxes(id) : FULL_BOX;
        for (const b of boxes) {
          // toca o jogador em X/Z?
          if (pMaxX <= x + b[0] || pMinX >= x + b[3]) continue;
          if (pMaxZ <= z + b[2] || pMinZ >= z + b[5]) continue;
          const wy0 = y + b[1], wy1 = y + b[4];
          if (dir < 0) {
            // caixa de PISO (base no ou abaixo dos pés) → maior topo
            if (wy0 <= feet + EPS && (Number.isNaN(best) || wy1 > best)) best = wy1;
          } else {
            // caixa de TETO (topo no ou acima da cabeça) → menor base
            if (wy1 >= head - EPS && (Number.isNaN(best) || wy0 < best)) best = wy0;
          }
        }
      }
    }
  }
  return best;
}

/** Face de colisão HORIZONTAL mais restritiva no eixo `axis`, respeitando
 *  sub-caixas parciais. `dir>0` = indo pro + (queremos a MENOR face de entrada
 *  `x0`); `dir<0` = indo pro − (a MAIOR face de saída `x1`). Só conta caixa que
 *  o AABB do jogador realmente penetra nos 3 eixos. Devolve NaN se não achar.
 *  (2026-07-25 — bug-512: o snap antigo era na fronteira da CÉLULA, o que jogava
 *  o jogador pra trás ao esbarrar no degrau de meia pegada da escada.) */
function resolveHoriz(world: World, pos: Vec3, axis: "x" | "z", dir: number): number {
  const half = PLAYER.width / 2;
  const eixoX = axis === "x";
  // índices da caixa: [min,max] do eixo do movimento e do outro eixo horizontal
  const iMinA = eixoX ? 0 : 2, iMaxA = eixoX ? 3 : 5;
  const iMinO = eixoX ? 2 : 0, iMaxO = eixoX ? 5 : 3;
  const pMinA = pos[axis] - half, pMaxA = pos[axis] + half;
  const outro = eixoX ? pos.z : pos.x;
  const pMinO = outro - half, pMaxO = outro + half;
  const pMinY = pos.y, pMaxY = pos.y + PLAYER.height;
  const a0 = Math.floor(pMinA), a1 = Math.floor(pMaxA);
  const o0 = Math.floor(pMinO), o1 = Math.floor(pMaxO);
  const y0 = Math.floor(pMinY), y1 = Math.floor(pMaxY);
  let best = NaN;
  for (let y = y0; y <= y1; y++) {
    for (let o = o0; o <= o1; o++) {
      for (let a = a0; a <= a1; a++) {
        const id = getBlock(world, eixoX ? a : o, y, eixoX ? o : a);
        if (!isSolidBlock(id)) continue;
        const boxes = temColisaoParcial(id) ? collisionBoxes(id) : FULL_BOX;
        for (const b of boxes) {
          // só caixa realmente penetrada (overlap nos 3 eixos) empurra
          if (pMaxY <= y + b[1] || pMinY >= y + b[4]) continue;
          if (pMaxO <= o + b[iMinO] || pMinO >= o + b[iMaxO]) continue;
          if (pMaxA <= a + b[iMinA] || pMinA >= a + b[iMaxA]) continue;
          if (dir > 0) {
            const face = a + b[iMinA];
            if (Number.isNaN(best) || face < best) best = face;
          } else {
            const face = a + b[iMaxA];
            if (Number.isNaN(best) || face > best) best = face;
          }
        }
      }
    }
  }
  return best;
}

/** Move um eixo e, se colidir, encosta na face do bloco e zera a velocidade do eixo. */
function moveAxis(world: World, p: PlayerState, axis: "x" | "y" | "z", dist: number): void {
  if (dist === 0) return;
  p.pos[axis] += dist;
  if (!collides(world, p.pos)) return;

  const half = PLAYER.width / 2;
  if (axis === "y") {
    if (dist < 0) {
      // pousa no TOPO da superfície de apoio (laje = 0,5; cubo = topo da célula)
      const top = resolveVertical(world, p.pos, -1);
      p.pos.y = (Number.isNaN(top) ? Math.floor(p.pos.y) + 1 : top) + EPS;
      p.onGround = true;
    } else {
      // bate a cabeça na BASE da caixa acima
      const bot = resolveVertical(world, p.pos, 1);
      p.pos.y =
        (Number.isNaN(bot) ? Math.floor(p.pos.y + PLAYER.height) : bot) - PLAYER.height - EPS;
    }
    p.vel.y = 0;
  } else {
    // X/Z: encosta na face REAL da caixa que bloqueou (cubo cheio = fronteira de
    // célula; degrau de escada = meia célula). Fallback na fronteira de célula
    // se nada for achado (não deve acontecer — `collides` já disse que há caixa).
    const face = resolveHoriz(world, p.pos, axis, dist);
    if (dist > 0) {
      p.pos[axis] = (Number.isNaN(face) ? Math.floor(p.pos[axis] + half) : face) - half - EPS;
    } else {
      p.pos[axis] = (Number.isNaN(face) ? Math.floor(p.pos[axis] - half) + 1 : face) + half + EPS;
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

/** Há superfície de colisão sustentando os pés (topo ≈ pos.y)? Considera laje/
 *  escada: o apoio pode ser um topo parcial (0,5) na PRÓPRIA célula dos pés, não
 *  só a célula de baixo. */
function hasSupport(world: World, pos: Vec3): boolean {
  const half = PLAYER.width / 2;
  const pMinX = pos.x - half, pMaxX = pos.x + half;
  const pMinZ = pos.z - half, pMaxZ = pos.z + half;
  const x0 = Math.floor(pMinX), x1 = Math.floor(pMaxX);
  const z0 = Math.floor(pMinZ), z1 = Math.floor(pMaxZ);
  const yLo = Math.floor(pos.y - 0.06);
  const yHi = Math.floor(pos.y);
  for (let y = yLo; y <= yHi; y++) {
    for (let z = z0; z <= z1; z++) {
      for (let x = x0; x <= x1; x++) {
        const id = getBlock(world, x, y, z);
        if (!isSolidBlock(id)) continue;
        const boxes = temColisaoParcial(id) ? collisionBoxes(id) : FULL_BOX;
        for (const b of boxes) {
          if (pMaxX <= x + b[0] || pMinX >= x + b[3]) continue;
          if (pMaxZ <= z + b[2] || pMinZ >= z + b[5]) continue;
          const top = y + b[4];
          if (top <= pos.y + EPS && top >= pos.y - 0.06) return true;
        }
      }
    }
  }
  return false;
}

/** Move na horizontal com SUBIDA automática de degrau/laje (≤ STEP_HEIGHT). Se
 *  a parede bloqueou o passo e há espaço pra subir e continuar, o jogador sobe
 *  andando (sem pular) e pousa no ressalto — estilo Minecraft. `canStep` só
 *  liga com os pés no chão. Mantém o edge-guard do agachar (`guard`). */
function moveHoriz(
  world: World,
  p: PlayerState,
  axis: "x" | "z",
  dist: number,
  guard: boolean,
  canStep: boolean,
): void {
  const startAxis = p.pos[axis];
  moveAxisGuarded(world, p, axis, dist, guard);
  const moved = p.pos[axis] - startAxis;
  if (!canStep || Math.abs(moved) >= Math.abs(dist) - EPS) return; // chegou ou não pode subir

  // parede no caminho: tenta subir o ressalto. Trabalha numa posição de teste,
  // só confirma se subir + avançar + pousar der certo.
  const savedAxis = p.pos[axis];
  const savedY = p.pos.y;
  p.pos.y = savedY + STEP_HEIGHT;
  if (collides(world, p.pos)) { p.pos.y = savedY; return; } // sem teto pra subir
  p.pos[axis] += dist - moved; // avança o que faltava, já elevado
  if (collides(world, p.pos)) { // ainda bate → não é ressalto subível
    p.pos[axis] = savedAxis;
    p.pos.y = savedY;
    return;
  }
  moveAxis(world, p, "y", -STEP_HEIGHT); // pousa no ressalto (Y preciso, seta onGround)
  if (guard && !hasSupport(world, p.pos)) { // agachado: não pisa no vazio
    p.pos[axis] = savedAxis;
    p.pos.y = savedY;
  }
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
    // subida automática de laje/degrau só com os pés no chão e fora d'água
    // (submerso o nado resolve a subida; no ar não sobe ressalto).
    const canStep = p.onGround && !submerso;
    moveHoriz(world, p, "x", p.vel.x * h, guard, canStep);
    moveHoriz(world, p, "z", p.vel.z * h, guard, canStep);
  }
}
