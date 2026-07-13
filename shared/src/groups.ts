/**
 * Grupos de alunos (cp13) — membros por NOME (mesma identidade do roster:
 * grupo sobrevive a reconexão e a fechar/abrir o mundo). Progresso de
 * objetivo por grupo mora no cenário (scenario.ts); aqui só a composição.
 */

export interface GroupDef {
  id: number;
  membros: string[];
}

export const MAX_GRUPOS = 20;

/** Valida grupos vindos de fora (save .ljw). Entrada quebrada é pulada. */
export function parseGroups(v: unknown): GroupDef[] {
  if (!Array.isArray(v)) return [];
  const out: GroupDef[] = [];
  for (const entry of v) {
    if (typeof entry !== "object" || entry === null) continue;
    const o = entry as Record<string, unknown>;
    const id = o["id"];
    if (typeof id !== "number" || !Number.isInteger(id) || id < 1 || id > MAX_GRUPOS) continue;
    const membros = Array.isArray(o["membros"])
      ? o["membros"].filter((m): m is string => typeof m === "string" && m.length > 0)
      : [];
    out.push({ id, membros });
  }
  return out;
}
