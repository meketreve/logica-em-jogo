/**
 * Modo de jogo (§🍖 F1, 2026-08-02) — o INTERRUPTOR, ainda SEM mecânica.
 *
 * Sobrevivência hoje joga igual a criativo: o que muda é o rótulo e o VOO
 * (quem está em sobrevivência não voa, nem com /voo liberado pra turma). Vida,
 * fome, inventário finito e craft entram nas frentes F2..F6 e vão ler daqui —
 * é por isso que o modo nasce como módulo puro em vez de um booleano solto na
 * session: as frentes seguintes perguntam `modoEfetivo(...)`, não `session.algo`.
 *
 * Duas camadas, decisão do usuário (2026-07-27):
 *  - PADRÃO DO MUNDO, gravado no .ljw — vale pra quem entra e pra quem já está
 *    dentro sem override.
 *  - OVERRIDE PESSOAL por NOME de jogador — vence o padrão do mundo. É por nome
 *    (não por id de cliente) porque o modo tem de sobreviver ao rejoin, igual ao
 *    roster e ao PIN.
 */

export type Modo = "criativo" | "sobrevivencia";

/** Mundo novo (e save antigo, que não tem o campo) nasce criativo — é o que a
 *  escola já usa hoje, e o único modo que o mundo-aula aceita. */
export const MODO_PADRAO: Modo = "criativo";

/**
 * Modo digitado por um humano no chat. Aceita com e sem acento e em qualquer
 * caixa; null = token inválido (quem chama devolve o "Uso: ...").
 */
export function parseModo(raw: unknown): Modo | null {
  if (typeof raw !== "string") return null;
  const t = raw
    .trim()
    .toLowerCase()
    // acento fora: "sobrevivência" e "sobrevivencia" são a MESMA palavra pro
    // professor, e o comando é digitado no meio da aula
    .replace(/[áàâã]/g, "a")
    .replace(/[éèê]/g, "e")
    .replace(/[íì]/g, "i")
    .replace(/[óòôõ]/g, "o")
    .replace(/[úù]/g, "u")
    .replace(/ç/g, "c");
  if (t === "criativo") return "criativo";
  if (t === "sobrevivencia") return "sobrevivencia";
  return null;
}

/** O modo que VALE pra um jogador: o override pessoal vence o padrão do mundo. */
export function modoEfetivo(mundo: Modo, pessoal: Modo | undefined): Modo {
  return pessoal ?? mundo;
}

/**
 * Sobrevivência NÃO voa — nem o professor. É de propósito: o professor que
 * digita `/modo sobrevivencia eu` está justamente demonstrando a sobrevivência
 * pra turma, e voar durante a demonstração desmentiria a aula. Ele volta a voar
 * com um `/modo criativo eu`.
 */
export function podeVoarNoModo(modo: Modo): boolean {
  return modo === "criativo";
}

/** Nome do modo como o professor lê no chat (com acento). */
export function nomeModo(modo: Modo): string {
  return modo === "sobrevivencia" ? "sobrevivência" : "criativo";
}
