import { BlockId } from "./blocks";
import { type Vec3i, parseVec3i } from "./regions";
import { type World, getBlock } from "./world";

/**
 * Cenário (cp12) — o coração pedagógico: objetivos que checam o ESTADO DO
 * MUNDO contra um padrão (regra de ouro: mesma engrenagem das rules — a
 * detecção roda no tick do servidor, acordada pela fila de vizinhança).
 *
 * Tipos de objetivo:
 * - construir: reproduzir na região ALVO o gabarito FOTOGRAFADO da região
 *   modelo no momento do /objetivo add (WYSIWYG — professor constrói, não
 *   digita padrão). Modelo e alvo podem ser a MESMA região (aí o professor
 *   apaga o modelo depois de fotografar, senão o objetivo já nasce completo).
 * - chegar: um jogador pisar dentro da região.
 * - limpar: a região ficar 100% ar.
 *
 * Persiste no meta JSON do .ljw (cresce sem re-versionar, desenho do cp7).
 */

export type ObjectiveKind = "construir" | "chegar" | "limpar";
export type ScenarioModo = "sequencial" | "livre";

export interface Box {
  min: Vec3i;
  max: Vec3i;
}

export interface Objective {
  id: number;
  kind: ObjectiveKind;
  /** Rótulo da região ALVO na hora do add. As coords são CÓPIA (min/max) —
   *  apagar/reusar a região nomeada depois não afeta o objetivo. */
  regiao: string;
  /** Rótulo da região modelo (só construir; informativo pro /objetivo lista). */
  modelo?: string;
  texto: string;
  min: Vec3i;
  max: Vec3i;
  /** Só construir: fotografia do modelo (ids), na ordem canônica y→z→x. */
  gabarito?: number[];
  /**
   * cp13: uma área POR GRUPO (índice 0 = grupo 1). Presente = objetivo
   * per-grupo (construir/limpar detectam na área do grupo; min/max acima
   * viram só referência visual — modelo do construir, área 1 dos demais).
   */
  alvos?: Box[];
  /** Só chegar: "um" (default) = 1 membro basta; "todos" = grupo inteiro
   *  (online) dentro da região ao mesmo tempo. */
  regra?: "um" | "todos";
  /**
   * Estado AUTORAL das áreas (construir/limpar) — uma fotografia por área na
   * ordem canônica y→z→x, alinhada com `alvos` (ou uma só, a compartilhada).
   * Capturado no /objetivo add e PERSISTIDO: reiniciar a atividade restaura as
   * áreas a isto (a faixa da aula de sequência volta aos blocos-semente, não
   * fica vazia). Ausente = chegar, ou save antigo (reiniciar não mexe nos blocos).
   */
  baseline?: number[][];
}

export interface ScenarioMeta {
  modo: ScenarioModo;
  objetivos: Objective[];
  /** Ids concluídos (modo turma / objetivo compartilhado). Contadores NÃO
   *  persistem — o mundo salvo já carrega o estado; recontar é de graça. */
  completos: number[];
  /** cp13: conclusões POR GRUPO. */
  completosGrupos?: { grupo: number; objetivos: number[] }[];
}

/** Progresso de UM grupo num objetivo (vai no ObjectiveState quando há grupos). */
export interface GroupObjectiveState {
  grupo: number;
  /** Área DESTE grupo (alvo próprio, ou a compartilhada repetida). */
  min: Vec3i;
  max: Vec3i;
  atual: number;
  total: number;
  extras: number;
  completo: boolean;
  ativo: boolean;
}

/** Estado por objetivo enviado aos clientes (HUD de todos, aluno incluso). */
export interface ObjectiveState {
  id: number;
  kind: ObjectiveKind;
  regiao: string;
  texto: string;
  min: Vec3i;
  max: Vec3i;
  completo: boolean;
  /** sequencial: só o primeiro incompleto; livre: todos os incompletos. */
  ativo: boolean;
  /** construir: blocos corretos; limpar: blocos que FALTAM limpar; chegar: 0. */
  atual: number;
  /** construir: alvo (blocos não-ar do gabarito); demais: 0. */
  total: number;
  /** construir: blocos onde o gabarito pede ar (sobras); demais: 0. */
  extras: number;
  /** cp13: presente quando o mundo tem grupos — cliente escolhe a SUA linha. */
  porGrupo?: GroupObjectiveState[];
}

export const MAX_OBJETIVOS = 32;
export const MAX_OBJETIVO_TEXTO = 120;
/** Teto de células de região fotografada/varrida (e do /regiao encher). */
export const MAX_OBJETIVO_CELLS = 4096;

export function boxVolume(b: Box): number {
  return (
    (b.max.x - b.min.x + 1) * (b.max.y - b.min.y + 1) * (b.max.z - b.min.z + 1)
  );
}

/**
 * Fotografa os ids da região na ordem CANÔNICA y→z→x — snapshotRegion e
 * matchRegion precisam da MESMA ordem, senão o gabarito compara célula errada.
 */
export function snapshotRegion(world: World, b: Box): number[] {
  const out: number[] = [];
  for (let y = b.min.y; y <= b.max.y; y++) {
    for (let z = b.min.z; z <= b.max.z; z++) {
      for (let x = b.min.x; x <= b.max.x; x++) {
        out.push(getBlock(world, x, y, z));
      }
    }
  }
  return out;
}

export interface MatchResult {
  /** Células não-ar do gabarito que já batem. */
  corretos: number;
  /** Total de células não-ar do gabarito. */
  alvo: number;
  /** Células onde o gabarito pede ar mas tem bloco (sobras). */
  extras: number;
}

/** Compara a região do mundo com um gabarito (mesma ordem do snapshotRegion). */
export function matchRegion(world: World, b: Box, gabarito: number[]): MatchResult {
  let corretos = 0;
  let alvo = 0;
  let extras = 0;
  let i = 0;
  for (let y = b.min.y; y <= b.max.y; y++) {
    for (let z = b.min.z; z <= b.max.z; z++) {
      for (let x = b.min.x; x <= b.max.x; x++) {
        const want = gabarito[i++] ?? BlockId.Air;
        const cur = getBlock(world, x, y, z);
        if (want !== BlockId.Air) {
          alvo++;
          if (cur === want) corretos++;
        } else if (cur !== BlockId.Air) {
          extras++;
        }
      }
    }
  }
  return { corretos, alvo, extras };
}

/** Quantas células da região ainda têm bloco (objetivo limpar: 0 = pronto). */
export function countSolid(world: World, b: Box): number {
  let n = 0;
  for (let y = b.min.y; y <= b.max.y; y++) {
    for (let z = b.min.z; z <= b.max.z; z++) {
      for (let x = b.min.x; x <= b.max.x; x++) {
        if (getBlock(world, x, y, z) !== BlockId.Air) n++;
      }
    }
  }
  return n;
}

function isKind(v: unknown): v is ObjectiveKind {
  return v === "construir" || v === "chegar" || v === "limpar";
}

/** Caixa min/max válida (inteiros, min ≤ max) ou null. */
function parseBox(min: unknown, max: unknown): Box | null {
  const mn = parseVec3i(min);
  const mx = parseVec3i(max);
  if (!mn || !mx) return null;
  if (mn.x > mx.x || mn.y > mx.y || mn.z > mx.z) return null;
  return { min: mn, max: mx };
}

/** Valida um objetivo vindo de fora (save/fio). null = entrada inválida. */
export function parseObjective(v: unknown): Objective | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  if (typeof o["id"] !== "number" || !Number.isInteger(o["id"]) || o["id"] < 1) return null;
  if (!isKind(o["kind"])) return null;
  if (typeof o["regiao"] !== "string" || !o["regiao"]) return null;
  if (typeof o["texto"] !== "string") return null;
  const box = parseBox(o["min"], o["max"]);
  if (!box) return null;
  let gabarito: number[] | undefined;
  if (o["kind"] === "construir") {
    if (
      !Array.isArray(o["gabarito"]) ||
      o["gabarito"].length !== boxVolume(box) ||
      !o["gabarito"].every((n) => typeof n === "number" && Number.isInteger(n) && n >= 0)
    ) {
      return null; // construir sem gabarito coerente não é recuperável
    }
    gabarito = o["gabarito"] as number[];
  }
  // cp13: áreas por grupo — qualquer entrada quebrada invalida o objetivo
  // (metade das áreas seria pior que nenhuma)
  let alvos: Box[] | undefined;
  if (o["alvos"] !== undefined) {
    if (!Array.isArray(o["alvos"]) || o["alvos"].length === 0) return null;
    alvos = [];
    for (const entry of o["alvos"]) {
      const e = entry as Record<string, unknown> | null;
      const b = e ? parseBox(e["min"], e["max"]) : null;
      if (!b) return null;
      if (gabarito && boxVolume(b) !== boxVolume(box)) return null; // gabarito não caberia
      alvos.push(b);
    }
  }
  // baseline autoral das áreas (uma por área, alinhado com alvos ou a shared).
  // Malformado é DESCARTADO — não invalida o objetivo, só faz reiniciar não
  // restaurar os blocos dessa área (degrada com elegância; save antigo idem).
  let baseline: number[][] | undefined;
  if (Array.isArray(o["baseline"])) {
    const areas = alvos ?? [box];
    const listas = o["baseline"];
    if (
      listas.length === areas.length &&
      listas.every(
        (arr, k) =>
          Array.isArray(arr) &&
          arr.length === boxVolume(areas[k] as Box) &&
          arr.every((n) => typeof n === "number" && Number.isInteger(n) && n >= 0),
      )
    ) {
      baseline = listas as number[][];
    }
  }
  return {
    id: o["id"],
    kind: o["kind"],
    regiao: o["regiao"],
    texto: o["texto"].slice(0, MAX_OBJETIVO_TEXTO),
    min: box.min,
    max: box.max,
    ...(typeof o["modelo"] === "string" ? { modelo: o["modelo"] } : {}),
    ...(gabarito ? { gabarito } : {}),
    ...(alvos ? { alvos } : {}),
    ...(o["regra"] === "todos" || o["regra"] === "um" ? { regra: o["regra"] } : {}),
    ...(baseline ? { baseline } : {}),
  };
}

/** Valida o bloco `cenario` do meta do save. null = ausente/irrecuperável. */
export function parseScenarioMeta(v: unknown): ScenarioMeta | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  const objetivos: Objective[] = [];
  if (Array.isArray(o["objetivos"])) {
    for (const entry of o["objetivos"]) {
      const parsed = parseObjective(entry);
      if (parsed) objetivos.push(parsed); // entrada quebrada é pulada
    }
  }
  const completos = Array.isArray(o["completos"])
    ? o["completos"].filter((n): n is number => typeof n === "number" && Number.isInteger(n))
    : [];
  const completosGrupos: { grupo: number; objetivos: number[] }[] = [];
  if (Array.isArray(o["completosGrupos"])) {
    for (const entry of o["completosGrupos"]) {
      if (typeof entry !== "object" || entry === null) continue;
      const e = entry as Record<string, unknown>;
      if (typeof e["grupo"] !== "number" || !Number.isInteger(e["grupo"])) continue;
      completosGrupos.push({
        grupo: e["grupo"],
        objetivos: Array.isArray(e["objetivos"])
          ? e["objetivos"].filter(
              (n): n is number => typeof n === "number" && Number.isInteger(n),
            )
          : [],
      });
    }
  }
  return {
    modo: o["modo"] === "livre" ? "livre" : "sequencial",
    objetivos,
    completos,
    ...(completosGrupos.length ? { completosGrupos } : {}),
  };
}

/** Valida um ObjectiveState vindo do fio (cliente nunca confia no servidor às cegas). */
export function parseObjectiveState(v: unknown): ObjectiveState | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  if (typeof o["id"] !== "number" || !Number.isInteger(o["id"])) return null;
  if (!isKind(o["kind"])) return null;
  if (typeof o["regiao"] !== "string" || typeof o["texto"] !== "string") return null;
  const min = parseVec3i(o["min"]);
  const max = parseVec3i(o["max"]);
  if (!min || !max) return null;
  if (typeof o["completo"] !== "boolean" || typeof o["ativo"] !== "boolean") return null;
  const nums = [o["atual"], o["total"], o["extras"]];
  if (!nums.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
  let porGrupo: GroupObjectiveState[] | undefined;
  if (o["porGrupo"] !== undefined) {
    if (!Array.isArray(o["porGrupo"])) return null;
    porGrupo = [];
    for (const entry of o["porGrupo"]) {
      if (typeof entry !== "object" || entry === null) return null;
      const e = entry as Record<string, unknown>;
      const b = parseBox(e["min"], e["max"]);
      if (
        !b ||
        typeof e["grupo"] !== "number" || !Number.isInteger(e["grupo"]) ||
        typeof e["completo"] !== "boolean" || typeof e["ativo"] !== "boolean" ||
        ![e["atual"], e["total"], e["extras"]].every(
          (n) => typeof n === "number" && Number.isInteger(n),
        )
      ) {
        return null;
      }
      porGrupo.push({
        grupo: e["grupo"],
        min: b.min,
        max: b.max,
        atual: e["atual"] as number,
        total: e["total"] as number,
        extras: e["extras"] as number,
        completo: e["completo"],
        ativo: e["ativo"],
      });
    }
  }
  return {
    id: o["id"],
    kind: o["kind"],
    regiao: o["regiao"],
    texto: o["texto"],
    min,
    max,
    completo: o["completo"],
    ativo: o["ativo"],
    atual: o["atual"] as number,
    total: o["total"] as number,
    extras: o["extras"] as number,
    ...(porGrupo ? { porGrupo } : {}),
  };
}
