/**
 * Autocompletar de comandos de chat (Tab). Puro, sem DOM — o chat.ts liga o
 * teclado; aqui mora só a árvore de comandos e a busca de candidatos.
 *
 * A árvore espelha os comandos do servidor (shared/session.ts: runCommand) e do
 * host (server/mundos.ts: /mundo; server/index.ts: /kicar). Se um comando novo
 * nascer lá, atualize aqui. O cliente NÃO tem sistema de arquivos: os nomes de
 * mundo entram ao vivo, pelo que o professor viu por último em "/mundo lista".
 *
 * ⚠️ E há um comando que NÃO é de servidor nenhum: `/painel` é interceptado no
 * `main.ts` e abre o painel do cp14 aqui mesmo. Ele entra na lista porque quem
 * lê a lista é o ALUNO, e pra ele a origem não importa — o que importa é que o
 * comando exista no Tab e no painel de comandos rápidos do dedo.
 *
 * A ORDEM desta lista é a ordem dos botões no painel do dedo, e a caixa deles
 * rola (`max-height: 26vh`): comando que cai no fim só aparece pra quem rola.
 */

import { nomesDeRegra } from "@logica/shared";

const COMANDOS = [
  // ⚠️ PRIMEIRO de propósito. O painel de comandos rápidos do dedo é uma caixa
  // de `max-height: 26vh` com wrap: com ~24 comandos, o que cai no fim da lista
  // só aparece ROLANDO. E `/painel` é justamente o comando de quem está no
  // tablet — o resto da lista é quase todo do professor no teclado.
  "painel",
  "bloco",
  "resetpin",
  "regiao",
  "objetivo",
  "grupo",
  "aula",
  "mundo",
  "tp",
  "tpr",
  "tpa",
  "iniciar",
  "hora",
  "ciclo",
  "vento",
  "voo",
  "invisivel",
  "modo",
  "regra",
  "pvp",
  "dar",
  "confinar",
  "kicar",
  "claim",
  "amigos",
];

const SUBCOMANDOS: Record<string, string[]> = {
  regiao: ["criar", "apagar", "lista", "encher", "sortear", "carimbar"],
  objetivo: ["add", "lista", "texto", "mover", "remover", "modo", "resetar"],
  grupo: ["criar", "entrar", "sair", "lista"],
  aula: ["grupos"],
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
  pvp: ["ligar", "desligar"],
};

/** Comandos cujo 2º token é um NOME de jogador. /tp também aceita "grupos".
 *  §🍖 F4: /dar também aceita "eu" e "all" (ver `candidatos`). */
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
    if (cmd === "dar") return ["eu", "all", ...jogadoresConhecidos];
    return SUBCOMANDOS[cmd] ?? [];
  }
  if (completos.length === 2) return nivel3(cmd, completos[1] ?? "");
  return [];
}

// ── Painel de COMANDOS RÁPIDOS do chat no mobile (2026-08-14) ────────────────
//
// O Tab não existe na tela de dedo, mas os comandos são MUITOS pra decorar. O
// painel reusa a MESMA árvore do autocomplete (`candidatos`): uma fonte só —
// comando novo que nasça lá ganha botão aqui junto, sem lista duplicada pra
// manter (mesma trip-wire da decisão 2026-08-14 de um predicado só pro botão
// interagir). O usuário decidiu:
//   (1) ÁRVORE COMPLETA navegável (comando → subcomando), não uma lista curada;
//   (2) o tap ENVIA na hora quando o comando está inteiro, e comando que
//       termina em NOME preenche o campo (pra digitar o resto).
export type DestinoDeToque = "enviar" | "nivel" | "preencher";

/** O que acontece ao TOCAR num nó da árvore dado o caminho já navegado (o 1º
 *  item tem a barra: ["/tpr"]). Regras:
 *  - `enviar` — comando inteiro, manda na hora;
 *  - `nivel`  — ainda há subcomando fixo pra escolher (abre o próximo nível);
 *  - `preencher` — o próximo argumento é um NOME (jogador/regra/modo), então o
 *    painel preenche o campo pra digitar o resto (o tap não manda sozinho —
 *    mandar "/tpr" sem nome é erro de uso no servidor).
 */
export function destinoDeToque(caminho: string[]): DestinoDeToque {
  const cmd = (caminho[0] ?? "").replace(/^\//, "");
  if (caminho.length === 1) {
    if (cmd === "tpa") return "enviar"; // aceita o pedido mais recente — inteiro
    if (cmd === "dar") return "preencher"; // §🍖 F4: /dar <nome> <id> — nome 1º
    if (CMD_COM_NOME.has(cmd)) return "preencher"; // kicar/resetpin/tpr pedem nome
    if (cmd === "tp") return "nivel"; // abre a lista: grupos + quem está online
    if (SUBCOMANDOS[cmd]?.length) return "nivel"; // há subcomando pra escolher
    return "enviar"; // /iniciar, /mundo atual… sem próximo token fixo
  }
  if (caminho.length === 2) {
    const sub = caminho[1];
    if (cmd === "tpa") return "enviar"; // /tpa nome aceita o pedido DAQUELE nome
    if (cmd === "dar") return "preencher"; // /dar eu <id> <qtd> ainda tem o id
    if (cmd === "tp") return "enviar"; // /tp grupos ou /tp <nome> — inteiros
    if (cmd === "amigos" && AMIGOS_COM_NOME.has(sub ?? "")) return "preencher";
    if (cmd === "modo" && (sub === "criativo" || sub === "sobrevivencia"))
      return "preencher"; // /modo <modo> <eu|all|nome>
    if (nivel3(cmd, sub ?? "").length) return "nivel"; // objetivo add/modo, mundo carregar…
    return "enviar"; // /regiao lista, /amigos lista, /grupo criar… inteiros
  }
  return "enviar";
}
