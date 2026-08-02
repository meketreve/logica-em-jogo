/**
 * Autocompletar de comandos de chat (Tab). Puro, sem DOM — o chat.ts liga o
 * teclado; aqui mora só a árvore de comandos e a busca de candidatos.
 *
 * A árvore espelha os comandos do servidor (shared/session.ts: runCommand) e do
 * host (server/mundos.ts: /mundo; server/index.ts: /kicar). Se um comando novo
 * nascer lá, atualize aqui. O cliente NÃO tem sistema de arquivos: os nomes de
 * mundo entram ao vivo, pelo que o professor viu por último em "/mundo lista".
 */

import { nomesDeRegra } from "@logica/shared";

const COMANDOS = [
  "bloco",
  "resetpin",
  "regiao",
  "objetivo",
  "grupo",
  "mundo",
  "tp",
  "tpr",
  "tpa",
  "iniciar",
  "hora",
  "ciclo",
  "vento",
  "voo",
  "modo",
  "regra",
  "confinar",
  "kicar",
  "claim",
  "amigos",
];

const SUBCOMANDOS: Record<string, string[]> = {
  regiao: ["criar", "apagar", "lista", "encher", "sortear", "carimbar"],
  objetivo: ["add", "lista", "texto", "mover", "remover", "modo", "resetar"],
  grupo: ["criar", "entrar", "sair", "lista"],
  mundo: ["lista", "atual", "carregar"],
  tp: ["grupos"],
  hora: ["dia", "noite", "amanhecer", "entardecer", "meio-dia", "meia-noite"],
  ciclo: ["ligar", "desligar"],
  vento: ["ligar", "desligar"],
  voo: ["ligar", "desligar"],
  modo: ["criativo", "sobrevivencia"],
  regra: nomesDeRegra(),
  confinar: ["ligar", "desligar", "status"],
  claim: ["ligar", "desligar", "criar", "remover", "lista"],
  amigos: ["convidar", "aceitar", "recusar", "sair", "expulsar", "lista"],
};

/** Comandos cujo 2º token é um NOME de jogador. /tp também aceita "grupos". */
const CMD_COM_NOME = new Set(["kicar", "resetpin", "tpr", "tpa"]);
/** Subcomandos de /amigos cujo 3º token é um nome de jogador. */
const AMIGOS_COM_NOME = new Set(["convidar", "aceitar", "recusar", "expulsar"]);

let mundosConhecidos: string[] = [];
let jogadoresConhecidos: string[] = [];

/** O cliente memoriza os nomes que o professor viu em /mundo lista. */
export function learnWorlds(nomes: string[]): void {
  mundosConhecidos = nomes;
}

/** Quem está online agora — o main.ts alimenta pelo player_moved/player_left. */
export function learnPlayers(nomes: string[]): void {
  jogadoresConhecidos = nomes;
}

function nivel3(cmd: string, sub: string): string[] {
  if (cmd === "objetivo" && sub === "add") return ["construir", "chegar", "limpar"];
  if (cmd === "objetivo" && sub === "modo") return ["sequencial", "livre"];
  if (cmd === "mundo" && sub === "carregar") return mundosConhecidos;
  if (cmd === "amigos" && AMIGOS_COM_NOME.has(sub)) return jogadoresConhecidos;
  // §🍖 F1: /modo <modo> [eu|all|nome] — os alvos fixos primeiro, depois a turma
  if (cmd === "modo") return ["eu", "all", ...jogadoresConhecidos];
  if (cmd === "regra") return ["ligar", "desligar"];
  return [];
}

/**
 * Candidatos para a palavra que está sendo digitada, dadas as palavras JÁ
 * completas antes dela (a primeira inclui a barra: "/objetivo").
 */
export function candidatos(completos: string[]): string[] {
  if (completos.length === 0) return COMANDOS.map((c) => `/${c}`);
  const cmd = (completos[0] ?? "").replace(/^\//, "");
  if (completos.length === 1) {
    if (CMD_COM_NOME.has(cmd)) return jogadoresConhecidos;
    if (cmd === "tp") return ["grupos", ...jogadoresConhecidos];
    return SUBCOMANDOS[cmd] ?? [];
  }
  if (completos.length === 2) return nivel3(cmd, completos[1] ?? "");
  return [];
}
