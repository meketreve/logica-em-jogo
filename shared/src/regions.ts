/**
 * Regiões nomeadas (cp11) — caixas de blocos com nome, marcadas pelo professor
 * com a varinha (2 cantos) e criadas via /regiao. São a BASE dos objetivos do
 * MVP v2: "construir padrão", "chegar em local" e "limpar" checam o estado do
 * mundo DENTRO de uma região (mesma engrenagem das rules — regra de ouro).
 * Persistem no meta JSON do .ljw (cresce sem re-versionar, desenho do cp7).
 */

export interface Vec3i {
  x: number;
  y: number;
  z: number;
}

/** Caixa inclusiva de blocos: min ≤ célula ≤ max nos 3 eixos. */
export interface NamedRegion {
  nome: string;
  min: Vec3i;
  max: Vec3i;
}

/** Teto de regiões nomeadas por mundo. 256 desde 2026-08-17: o mundo de aula
 *  no teto usa 20 grupos × 3 fases + 3 modelos + 1 partida = 64, que era o
 *  valor antigo INTEIRO — não sobrava uma região para o professor criar. */
export const MAX_REGIONS = 256;
export const MAX_REGION_NAME = 24;

/** Normaliza 2 cantos quaisquer em min/max por eixo (ordem dos cliques não importa). */
export function regionFromCorners(a: Vec3i, b: Vec3i): { min: Vec3i; max: Vec3i } {
  return {
    min: { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), z: Math.min(a.z, b.z) },
    max: { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y), z: Math.max(a.z, b.z) },
  };
}

/** Aceita qualquer caixa min/max (região nomeada OU objetivo do cenário). */
export function regionContains(
  r: { min: Vec3i; max: Vec3i },
  x: number,
  y: number,
  z: number,
): boolean {
  return (
    x >= r.min.x && x <= r.max.x &&
    y >= r.min.y && y <= r.max.y &&
    z >= r.min.z && z <= r.max.z
  );
}

/** Tamanho da região em blocos por eixo (inclusiva: max−min+1). */
export function regionDims(r: NamedRegion): Vec3i {
  return {
    x: r.max.x - r.min.x + 1,
    y: r.max.y - r.min.y + 1,
    z: r.max.z - r.min.z + 1,
  };
}

/** Valida um vetor inteiro vindo de fora (save/fio). null = inválido. */
export function parseVec3i(p: unknown): Vec3i | null {
  if (typeof p !== "object" || p === null) return null;
  const q = p as Record<string, unknown>;
  if (![q["x"], q["y"], q["z"]].every((n) => typeof n === "number" && Number.isInteger(n))) {
    return null;
  }
  return { x: q["x"] as number, y: q["y"] as number, z: q["z"] as number };
}

/**
 * Valida uma região vinda de FORA (save .ljw do Drive, mensagem do fio).
 * Devolve null em vez de lançar — chamador decide pular a entrada inválida.
 */
export function parseNamedRegion(v: unknown): NamedRegion | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  const nome = o["nome"];
  if (typeof nome !== "string" || !nome || nome.length > MAX_REGION_NAME) return null;
  const min = parseVec3i(o["min"]);
  const max = parseVec3i(o["max"]);
  if (!min || !max) return null;
  if (min.x > max.x || min.y > max.y || min.z > max.z) return null;
  return { nome, min, max };
}
