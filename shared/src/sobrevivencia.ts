/**
 * Vida, dano e morte (§🍖 F2, 2026-08-02) — módulo PURO, sem I/O e sem relógio
 * de parede (o tempo entra como CONTAGEM DE TICKS, igual ao ciclo dia/noite e
 * ao vento). A session orquestra; quem decide é aqui.
 *
 * **Uma porta só pro dano.** Toda perda de vida passa por `aplicarDano`. Queda e
 * afogamento são as causas do lite; fome (F3), PvP (F7) e mob (F8) entram pela
 * MESMA função, só somando um valor em `CausaDano`. É o que faz o F8 ser plugue
 * e não cirurgia — a lição do `fallingRule` genérico, onde areia e cascalho
 * dividem uma regra só.
 *
 * Escala igual à do Minecraft (o modelo mental que aluno e professor já têm):
 * 20 pontos = 10 corações, e 1 ponto = meio coração.
 */

export const VIDA_MAX = 20;

/** Fome cheia. A barra é do F3; até lá a session passa este valor, e a
 *  regeneração se comporta como "bem alimentado". */
export const FOME_MAX = 20;

/** De quanta fome pra cima o corpo se regenera sozinho (regra do Minecraft). */
export const FOME_PARA_REGENERAR = 18;

/** Ticks entre dois pontos de regeneração (10 Hz → 4 s por meio coração). */
export const TICKS_POR_REGEN = 40;

/** Queda "de graça": abaixo disso não dói (3 blocos, como no Minecraft). */
export const QUEDA_LIVRE_BLOCOS = 3;

/** Fôlego submerso, em ticks (10 Hz → 15 s antes de começar a afogar). */
export const FOLEGO_TICKS = 150;

/** Com o fôlego no fim, um dano a cada 10 ticks (1 s)… */
export const TICKS_POR_AFOGAMENTO = 10;
/** …deste tamanho (1 coração por segundo). */
export const DANO_AFOGAMENTO = 2;

export type CausaDano = "queda" | "afogamento" | "fome" | "pvp" | "outro";

const CAUSAS: readonly CausaDano[] = ["queda", "afogamento", "fome", "pvp", "outro"];

/** Causa vinda de fora (protocolo). Desconhecida = null — quem chama decide se
 *  descarta ou trata como sem-causa; a mensagem de vida NÃO se perde por isso. */
export function parseCausaDano(raw: unknown): CausaDano | null {
  return typeof raw === "string" && (CAUSAS as readonly string[]).includes(raw)
    ? (raw as CausaDano)
    : null;
}

/** Estado vital de UM jogador. `fome` já mora aqui pro F3 não mexer no formato. */
export interface EstadoVital {
  vida: number;
  fome: number;
  /** Ticks de ar restantes debaixo d'água (FOLEGO_TICKS = pulmão cheio). */
  folego: number;
  /** Ticks acumulados desde a última regeneração (zera ao curar). */
  regenTicks: number;
}

export function novoEstadoVital(): EstadoVital {
  return { vida: VIDA_MAX, fome: FOME_MAX, folego: FOLEGO_TICKS, regenTicks: 0 };
}

/** Está vivo? (a morte é vida ZERADA, não um flag — assim não há dois estados
 *  pra manter em acordo) */
export function estaVivo(e: EstadoVital): boolean {
  return e.vida > 0;
}

/**
 * A ÚNICA porta de perda de vida. Devolve estado novo (nunca muta) + quanto
 * doeu de fato e se ESTA pancada matou — `morreu` só é true na transição, então
 * a session pode disparar o respawn uma vez só.
 */
export function aplicarDano(
  e: EstadoVital,
  pontos: number,
  _causa: CausaDano,
): { estado: EstadoVital; aplicado: number; morreu: boolean } {
  const n = Math.max(0, Math.floor(pontos));
  if (n === 0 || !estaVivo(e)) return { estado: e, aplicado: 0, morreu: false };
  const vida = Math.max(0, e.vida - n);
  // levar dano adia a regeneração (senão o dano lento vira empate perpétuo)
  return {
    estado: { ...e, vida, regenTicks: 0 },
    aplicado: e.vida - vida,
    morreu: vida === 0,
  };
}

/** Cura direta (respawn, comida do F6). Nunca passa de VIDA_MAX. */
export function curar(e: EstadoVital, pontos: number): EstadoVital {
  const n = Math.max(0, Math.floor(pontos));
  if (n === 0) return e;
  return { ...e, vida: Math.min(VIDA_MAX, e.vida + n), regenTicks: 0 };
}

/**
 * Dano de uma queda de `blocos` de altura. Fórmula do Minecraft: cada bloco
 * acima de 3 tira meio coração. Queda de 4 = 1 ponto; de 23 = morte de vida
 * cheia. `blocos` fracionário é ARREDONDADO PRA BAIXO — ver a nota de
 * tolerância em `session.ts` (a altura vem de amostras a 10 Hz).
 */
export function danoDeQueda(blocos: number): number {
  if (!Number.isFinite(blocos)) return 0;
  return Math.max(0, Math.floor(blocos) - QUEDA_LIVRE_BLOCOS);
}

/**
 * Um tick submerso ou fora d'água. Devolve o estado novo e o dano a aplicar
 * (a session é quem chama `aplicarDano`, pra existir UMA porta só).
 * Fora d'água o pulmão enche na hora — nadar de novo recomeça do zero.
 */
export function tickFolego(
  e: EstadoVital,
  cabecaNaAgua: boolean,
): { estado: EstadoVital; dano: number } {
  if (!cabecaNaAgua) {
    return { estado: e.folego === FOLEGO_TICKS ? e : { ...e, folego: FOLEGO_TICKS }, dano: 0 };
  }
  if (e.folego > 0) return { estado: { ...e, folego: e.folego - 1 }, dano: 0 };
  // pulmão vazio: o contador desce até -TICKS_POR_AFOGAMENTO, cobra o dano e
  // volta a 0. Fica LIMITADO (nunca cresce sem fim) e não se confunde com o
  // pulmão cheio, porque só o ramo de cima recarrega.
  const folego = e.folego - 1;
  if (folego <= -TICKS_POR_AFOGAMENTO) {
    return { estado: { ...e, folego: 0 }, dano: DANO_AFOGAMENTO };
  }
  return { estado: { ...e, folego }, dano: 0 };
}

/**
 * Um tick de regeneração passiva. Só com fome alta (regra do Minecraft) e vida
 * incompleta. A fome é do F3: até lá a session passa FOME_MAX e o corpo sara.
 */
export function tickRegen(e: EstadoVital, fome = e.fome): EstadoVital {
  if (!estaVivo(e) || e.vida >= VIDA_MAX || fome < FOME_PARA_REGENERAR) {
    return e.regenTicks === 0 ? e : { ...e, regenTicks: 0 };
  }
  const regenTicks = e.regenTicks + 1;
  if (regenTicks < TICKS_POR_REGEN) return { ...e, regenTicks };
  return { ...e, vida: Math.min(VIDA_MAX, e.vida + 1), regenTicks: 0 };
}

/** Texto da morte pro chat da turma (o professor precisa ver o que aconteceu). */
export function textoDaMorte(nome: string, causa: CausaDano): string {
  switch (causa) {
    case "queda":
      return `${nome} caiu de muito alto.`;
    case "afogamento":
      return `${nome} ficou sem ar debaixo d'água.`;
    case "fome":
      return `${nome} passou fome demais.`;
    case "pvp":
      return `${nome} foi derrotado por outro jogador.`;
    default:
      return `${nome} não sobreviveu.`;
  }
}
