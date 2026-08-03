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

/** Fome cheia (§🍖 F3: a barra de coxas do HUD). */
export const FOME_MAX = 20;

/** De quanta fome pra cima o corpo se regenera sozinho (regra do Minecraft). */
export const FOME_PARA_REGENERAR = 18;

// --- §🍖 F3: fome ----------------------------------------------------------
//
// A barra NÃO desce por relógio: desce por ESFORÇO, como no Minecraft. Cada
// atividade soma "exaustão" num acumulador fracionário e, a cada
// EXAUSTAO_POR_PONTO acumulado, um ponto de fome vai embora. É o que faz o
// aluno que constrói a tarde inteira sentir a barra e o aluno que ficou parado
// lendo o quadro não sentir nada — o gasto acompanha o que ele fez, e não
// quanto tempo a aula durou.

/** Esforço acumulado que gasta UM ponto de fome (mesmo número do Minecraft). */
export const EXAUSTAO_POR_PONTO = 4;

/** Esforço de andar (ou nadar) UM bloco. */
export const EXAUSTAO_POR_BLOCO_ANDADO = 0.01;

/**
 * Esforço de colocar ou quebrar UM bloco. Acima do Minecraft (0,005) de
 * propósito: aqui a atividade principal da aula é CONSTRUIR, não correr, então
 * é a construção que tem de mover a barra.
 */
export const EXAUSTAO_POR_EDICAO = 0.02;

/** Curar 1 ponto de vida custa comida (Minecraft: 6,0). É o que amarra a fome
 *  ao dano: quem se machuca muito passa a comer mais. */
export const EXAUSTAO_POR_REGEN = 3;

/**
 * Passo maior que isto NÃO é passo: é teleporte (respawn, `/tp`), rejoin ou
 * desync. A 10 Hz o jogador andando cobre menos de 1 bloco por amostra e o
 * bloco de queda mais rápido cobre ~4 — acima disso não se cobra fome.
 */
export const PASSO_MAX_POR_AMOSTRA = 4;

/** Com a barra no zero, um dano a cada 4 s… */
export const TICKS_POR_DANO_FOME = 40;
/** …deste tamanho (meio coração). */
export const DANO_FOME = 1;

/**
 * **A fome não mata enquanto não houver o que comer.** O dano por inanição
 * para em 3 corações — é o análogo do nível "fácil" do Minecraft e a decisão de
 * sala de aula: o aluno faminto fica fraco (sem regeneração, ver
 * `FOME_PARA_REGENERAR`) mas não perde a construção por causa de uma frente que
 * ainda não existe. **No dia em que a comida existir (F6), baixar este número
 * pra 0 devolve a inanição letal** — o `textoDaMorte("fome")` já está escrito e
 * o resto do caminho é o mesmo.
 */
export const VIDA_MINIMA_POR_FOME = 6;

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

/** Estado vital de UM jogador. */
export interface EstadoVital {
  vida: number;
  fome: number;
  /** Ticks de ar restantes debaixo d'água (FOLEGO_TICKS = pulmão cheio). */
  folego: number;
  /** Ticks acumulados desde a última regeneração (zera ao curar). */
  regenTicks: number;
  /** Esforço fracionário desde o último ponto de fome gasto (§🍖 F3). NÃO vai
   *  pro save: perder no máximo 4 de exaustão no rejoin não muda partida
   *  nenhuma, e o save fica com número inteiro de professor. */
  exaustao: number;
  /** Ticks com a barra no zero desde o último dano de fome (§🍖 F3). */
  fomeTicks: number;
}

export function novoEstadoVital(): EstadoVital {
  return {
    vida: VIDA_MAX,
    fome: FOME_MAX,
    folego: FOLEGO_TICKS,
    regenTicks: 0,
    exaustao: 0,
    fomeTicks: 0,
  };
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
 * incompleta — com a barra abaixo de `FOME_PARA_REGENERAR` o corpo para de
 * sarar, e é isso que faz a fome doer antes mesmo de chegar ao zero.
 *
 * **Curar CUSTA comida**, mas quem cobra é a session (`EXAUSTAO_POR_REGEN`),
 * não esta função: assim existe um gate só pra regra `fome` desligada, em vez
 * de duas funções puras precisarem saber dela.
 */
export function tickRegen(e: EstadoVital, fome = e.fome): EstadoVital {
  if (!estaVivo(e) || e.vida >= VIDA_MAX || fome < FOME_PARA_REGENERAR) {
    return e.regenTicks === 0 ? e : { ...e, regenTicks: 0 };
  }
  const regenTicks = e.regenTicks + 1;
  if (regenTicks < TICKS_POR_REGEN) return { ...e, regenTicks };
  return { ...e, vida: Math.min(VIDA_MAX, e.vida + 1), regenTicks: 0 };
}

/**
 * Gasta esforço (§🍖 F3): acumula exaustão e, a cada `EXAUSTAO_POR_PONTO`
 * inteiro, tira UM ponto de fome. Quem chama só diz QUANTO esforço houve —
 * andar, editar bloco ou curar — e não precisa saber da conversão.
 *
 * Morto não tem fome (o respawn devolve a barra cheia).
 */
export function gastarEsforco(e: EstadoVital, esforco: number): EstadoVital {
  if (!Number.isFinite(esforco) || esforco <= 0 || !estaVivo(e)) return e;
  const acumulado = e.exaustao + esforco;
  const pontos = Math.floor(acumulado / EXAUSTAO_POR_PONTO);
  const exaustao = acumulado - pontos * EXAUSTAO_POR_PONTO;
  if (pontos === 0) return { ...e, exaustao };
  return { ...e, exaustao, fome: Math.max(0, e.fome - pontos) };
}

/**
 * Um tick com a barra de fome no zero. Devolve o estado novo e o dano a aplicar
 * (a session é quem chama `aplicarDano`, pra existir UMA porta só).
 *
 * O dano PARA em `VIDA_MINIMA_POR_FOME` — ver a nota lá: enquanto não houver
 * comida, a fome enfraquece, não mata.
 */
export function tickFome(e: EstadoVital): { estado: EstadoVital; dano: number } {
  if (e.fome > 0 || !estaVivo(e)) {
    return { estado: e.fomeTicks === 0 ? e : { ...e, fomeTicks: 0 }, dano: 0 };
  }
  const fomeTicks = e.fomeTicks + 1;
  if (fomeTicks < TICKS_POR_DANO_FOME) return { estado: { ...e, fomeTicks }, dano: 0 };
  const espaco = e.vida - VIDA_MINIMA_POR_FOME;
  return { estado: { ...e, fomeTicks: 0 }, dano: Math.max(0, Math.min(DANO_FOME, espaco)) };
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
