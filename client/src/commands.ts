/**
 * Autocompletar de comandos de chat (Tab). Puro, sem DOM — o chat.ts liga o
 * teclado; aqui mora só a árvore de comandos e a busca de candidatos.
 *
 * A árvore espelha os comandos do servidor (shared/session.ts: runCommand) e do
 * host (server/mundos.ts: /mundo; server/index.ts: /kicar). Se um comando novo
 * nascer lá, atualize aqui. O cliente NÃO tem sistema de arquivos: os nomes de
 * mundo entram ao vivo, pelo que o professor viu por último em "/mundo lista".
 */

const COMANDOS = [
  "bloco",
  "resetpin",
  "regiao",
  "objetivo",
  "grupo",
  "mundo",
  "tp",
  "iniciar",
  "hora",
  "ciclo",
  "kicar",
];

const SUBCOMANDOS: Record<string, string[]> = {
  regiao: ["criar", "apagar", "lista", "encher", "sortear", "carimbar"],
  objetivo: ["add", "lista", "texto", "mover", "remover", "modo", "resetar"],
  grupo: ["criar", "entrar", "sair", "lista"],
  mundo: ["lista", "atual", "carregar"],
  tp: ["grupos"],
  hora: ["dia", "noite", "amanhecer", "entardecer", "meio-dia", "meia-noite"],
  ciclo: ["ligar", "desligar"],
};

let mundosConhecidos: string[] = [];

/** O cliente memoriza os nomes que o professor viu em /mundo lista. */
export function learnWorlds(nomes: string[]): void {
  mundosConhecidos = nomes;
}

function nivel3(cmd: string, sub: string): string[] {
  if (cmd === "objetivo" && sub === "add") return ["construir", "chegar", "limpar"];
  if (cmd === "objetivo" && sub === "modo") return ["sequencial", "livre"];
  if (cmd === "mundo" && sub === "carregar") return mundosConhecidos;
  return [];
}

/**
 * Candidatos para a palavra que está sendo digitada, dadas as palavras JÁ
 * completas antes dela (a primeira inclui a barra: "/objetivo").
 */
export function candidatos(completos: string[]): string[] {
  if (completos.length === 0) return COMANDOS.map((c) => `/${c}`);
  const cmd = (completos[0] ?? "").replace(/^\//, "");
  if (completos.length === 1) return SUBCOMANDOS[cmd] ?? [];
  if (completos.length === 2) return nivel3(cmd, completos[1] ?? "");
  return [];
}
