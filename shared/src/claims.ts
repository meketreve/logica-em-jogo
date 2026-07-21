/**
 * Anti-griefing (cp24) — CLAIMS + GRUPOS DE AMIGOS.
 *
 * O aluno reivindica uma REGIÃO (marcada com a varinha, reusa regions.ts) para
 * proteger sua construção. Só o dono e os amigos do grupo dele constroem/quebram
 * ali; o resto é bloqueado NO SERVIDOR (mesma barreira da rocha-matriz — o
 * cliente só dá feedback). O professor liga/desliga o sistema por mundo e ignora
 * todo claim.
 *
 * Persistem no meta JSON do .ljw (cresce sem re-versionar — cp7). Em mundo-aula
 * (read-only) NÃO salvam, então o claim reseta por turma, coerente com aula
 * efêmera. Dono/membros por NOME (sobrevivem à reconexão, como o roster).
 */
import { type Vec3i, parseVec3i } from "./regions";

/** Pegada horizontal máxima do claim (2026-07-21). O claim é sempre uma COLUNA
 *  de altura total (camada 0 → teto do mundo) — só a pegada X×Z que o autor marca
 *  com a varinha importa; a altura é forçada no servidor. Assim ninguém constrói
 *  ilha flutuante por cima nem escava por baixo. Professor e aluno reservam plots
 *  do mesmo tamanho. */
export const MAX_CLAIM_X = 64;
export const MAX_CLAIM_Z = 32;
/** Tamanho do grupo de amigos, INCLUINDO o dono (dono + 5 convidados). */
export const MAX_AMIGOS = 6;
export const MAX_CLAIM_NAME = 24;

/** Área reivindicada por um aluno. `dono` = nome; 1 claim por aluno. */
export interface Claim {
  dono: string;
  /** Rótulo opcional dado pelo aluno (só decorativo). */
  nome?: string;
  min: Vec3i;
  max: Vec3i;
}

/** Time de amigos: `dono` criou, `membros` aceitaram (NÃO inclui o dono). Um
 *  aluno está em no máximo UM time (como dono OU membro). */
export interface GrupoAmigos {
  dono: string;
  membros: string[];
}

/** Pegada (2 cantos já normalizados) cabe no limite horizontal? A altura é
 *  ignorada — o claim vira sempre uma coluna de altura total. */
export function claimDentroDoLimite(min: Vec3i, max: Vec3i): boolean {
  return (
    max.x - min.x + 1 <= MAX_CLAIM_X &&
    max.z - min.z + 1 <= MAX_CLAIM_Z
  );
}

/** Duas caixas inclusivas se cruzam? (claim novo não pode tocar outro claim
 *  nem uma região reservada do professor). */
export function caixasSeCruzam(
  a: { min: Vec3i; max: Vec3i },
  b: { min: Vec3i; max: Vec3i },
): boolean {
  return (
    a.min.x <= b.max.x && a.max.x >= b.min.x &&
    a.min.y <= b.max.y && a.max.y >= b.min.y &&
    a.min.z <= b.max.z && a.max.z >= b.min.z
  );
}

/** Valida um claim vindo de FORA (save/fio). null = pular a entrada. */
export function parseClaim(v: unknown): Claim | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  const dono = o["dono"];
  if (typeof dono !== "string" || !dono) return null;
  const min = parseVec3i(o["min"]);
  const max = parseVec3i(o["max"]);
  if (!min || !max) return null;
  if (min.x > max.x || min.y > max.y || min.z > max.z) return null;
  const claim: Claim = { dono, min, max };
  const nome = o["nome"];
  if (typeof nome === "string" && nome && nome.length <= MAX_CLAIM_NAME) claim.nome = nome;
  return claim;
}

/** Valida um grupo de amigos vindo de FORA (save). Corta no limite e remove
 *  duplicatas/o próprio dono da lista de membros. */
export function parseGrupoAmigos(v: unknown): GrupoAmigos | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  const dono = o["dono"];
  if (typeof dono !== "string" || !dono) return null;
  const membros: string[] = [];
  if (Array.isArray(o["membros"])) {
    for (const m of o["membros"]) {
      if (typeof m === "string" && m && m !== dono && !membros.includes(m)) membros.push(m);
    }
  }
  return { dono, membros: membros.slice(0, MAX_AMIGOS - 1) };
}
