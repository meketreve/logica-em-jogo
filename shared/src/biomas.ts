import { BlockId } from "./blocks";

/**
 * Biomas do gen procedural (2026-07-20) — a REGRA DE OURO aplicada ao terreno:
 * engrenagem genérica (clima → bioma → receita de coluna) + entradas
 * registradas. Bioma novo = registrar um objeto aqui; o motor não muda.
 *
 * Biomas BRASILEIROS de verdade (geografia na pedagogia): caatinga, cerrado,
 * mata e araucárias. A coerência de vizinhança NÃO usa tabela de adjacência —
 * emerge da continuidade dos campos de clima (temperatura/umidade são value
 * noise de baixa frequência): colunas vizinhas têm clima quase igual, então
 * caatinga nunca encosta em araucárias (sempre passa por cerrado/mata no meio).
 */

/** Clima da coluna (x,z), ambos em [0,1) — calculado em worldgen.climaAt. */
export interface Clima {
  readonly temp: number;
  readonly umid: number;
}

export type ArvoreTipo = "comum" | "ipe" | "araucaria" | "paubrasil";

export interface Bioma {
  readonly nome: string;
  /** Bloco do topo da coluna; "grama" = variante escolhida por gramaPorClima. */
  readonly topo: number | "grama";
  /** Camadas logo abaixo do topo (entre a pedra e a superfície). */
  readonly subsolo: number;
  readonly profundidadeSubsolo: number;
  /** Espécies que nascem AQUI e só aqui: [tipo, chance por coluna]. */
  readonly arvores: readonly (readonly [ArvoreTipo, number])[];
  /** Chance de flor por coluna (0 = sem flor). */
  readonly flores: number;
  /** Chance de GRAMA ALTA por coluna (§🌬️ 2026-07-27; 0 = campo pelado).
   *  Bem maior que a de flor: capim é o preenchimento do campo, flor é o
   *  detalhe. A variante (verde/seca/fria) sai do clima, como a grama do chão. */
  readonly gramaAlta: number;
  /** Chance de mandacaru por coluna (só caatinga). */
  readonly mandacaru: number;
}

export const BIOMAS = {
  caatinga: {
    nome: "caatinga",
    topo: BlockId.Sand,
    subsolo: BlockId.Sandstone,
    profundidadeSubsolo: 3,
    arvores: [],
    flores: 0,
    gramaAlta: 0, // caatinga é areia: nem grama nem capim
    // 1/16 (2026-07-26): com 1/96 o mundo M inteiro tinha ~2 cactos — caatinga
    // sem cacto nenhum. A densidade só vale nas colunas SECAS (h > NIVEL_MAR).
    mandacaru: 1 / 16,
  },
  cerrado: {
    nome: "cerrado",
    topo: "grama",
    subsolo: BlockId.Dirt,
    profundidadeSubsolo: 3,
    arvores: [["ipe", 1 / 160]],
    flores: 1 / 64,
    gramaAlta: 1 / 6, // cerrado é campo aberto: capim é a cara dele
    mandacaru: 0,
  },
  mata: {
    nome: "mata",
    topo: "grama",
    subsolo: BlockId.Dirt,
    profundidadeSubsolo: 3,
    arvores: [
      ["comum", 1 / 28],
      ["paubrasil", 1 / 80],
    ],
    flores: 1 / 48,
    gramaAlta: 1 / 10, // mata: o chão é mais sombreado, capim mais ralo
    mandacaru: 0,
  },
  araucarias: {
    nome: "araucárias",
    topo: "grama",
    subsolo: BlockId.Dirt,
    profundidadeSubsolo: 3,
    arvores: [["araucaria", 1 / 48]],
    flores: 1 / 128,
    gramaAlta: 1 / 12,
    mandacaru: 0,
  },
} as const satisfies Record<string, Bioma>;

/** Lookup Whittaker (clima → bioma). Thresholds sobre campos CONTÍNUOS. */
export function biomaPorClima(clima: Clima): Bioma {
  if (clima.temp < 0.35) return BIOMAS.araucarias;
  if (clima.temp > 0.65 && clima.umid < 0.4) return BIOMAS.caatinga;
  if (clima.umid > 0.55) return BIOMAS.mata;
  return BIOMAS.cerrado;
}

/** Variante de grama pelo CLIMA — thresholds PRÓPRIOS, de propósito diferentes
 *  dos de biomaPorClima: a grama vira seca/fria ANTES de o bioma trocar, então
 *  a fronteira ganha faixas de transição = blend visual de bioma. */
export function gramaPorClima(clima: Clima): number {
  if (clima.temp < 0.42) return BlockId.GramaFria;
  if (clima.temp > 0.58 && clima.umid < 0.5) return BlockId.GramaSeca;
  return BlockId.Grass;
}
