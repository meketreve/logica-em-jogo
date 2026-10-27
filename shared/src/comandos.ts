import { type Papel } from "./auth";
import { nomesDeRegra } from "./regras";

/**
 * A ÁRVORE DE COMANDOS e de quem é cada um (2026-10-15).
 *
 * Mora no `shared` por dois motivos medidos, e não por organização:
 *
 *  1. **O gate de permissão é aqui do lado.** Quem decide se um comando é do
 *     professor é o `runCommand` (`session.ts`) e os handlers de
 *     `session/*`; a árvore que o cliente mostra tem de dizer a MESMA coisa.
 *     Com os dois no mesmo pacote, o teste de PARIDADE existe
 *     (`comandos.test.ts` lê a lista do "Comando desconhecido" e compara).
 *  2. **`npm test` só roda `shared`.** Em `client/src` esta tabela não tinha
 *     como ganhar teste nenhum — e o filtro por papel sem teste seria
 *     exatamente o tipo de lista que cala e some com um comando do aluno.
 *
 * O cliente põe por cima o que só ele sabe (nomes de mundo e quem está
 * online): `client/src/commands.ts`.
 *
 * ⚠️ **Comando novo no servidor entra AQUI junto**, com o `de` certo. O teste
 * de paridade reprova a falta — mas ele só vê o `runCommand`, então os dois
 * comandos de HOST (`/mundo` e `/expulsar`, que vivem em `server/`) estão na
 * lista de exceções dele.
 */

/** De quem é um comando: `todos` inclui o professor — ele pode tudo. */
export type DonoDeComando = "todos" | "professor";

export interface ComandoDef {
  nome: string;
  /** Quem pode USAR (o gate do servidor é a verdade). */
  de: DonoDeComando;
}

/**
 * A ORDEM aqui é a ordem dos botões no painel do dedo, e ele rola: comando que
 * cai no fim só aparece pra quem rola. Por isso a lista é ordenada por PAPEL —
 * `comandosPara` põe os do próprio papel primeiro.
 *
 * ⚠️ `/painel` não é comando de servidor nenhum: o `main.ts` o intercepta e
 * abre o painel ali mesmo. Ele é o PRIMEIRO da lista do aluno de propósito —
 * é o comando de quem está no tablet.
 */
const COMANDOS: ComandoDef[] = [
  // --- de todo jogador (o aluno vê SÓ estes) ---
  { nome: "painel", de: "todos" },
  { nome: "amigos", de: "todos" },
  { nome: "grupo", de: "todos" },
  { nome: "terreno", de: "todos" },
  { nome: "vender", de: "todos" },
  { nome: "tpp", de: "todos" },
  { nome: "tpa", de: "todos" },
  // Estes quatro são "de todos" porque CONSULTAR é de todos: o servidor só
  // exige professor quando vem argumento (`parts.length > 1` no `runCommand`).
  // Quem corta o argumento pro aluno é o `SUB_SO_PROFESSOR` abaixo — e é lá que
  // mora a diferença do `/regra`, cujo 2º token (o nome da regra) ainda é
  // consulta e só o 3º (`ligar`/`desligar`) é do professor.
  { nome: "hora", de: "todos" },
  { nome: "modo", de: "todos" },
  { nome: "regra", de: "todos" },
  { nome: "pvp", de: "todos" },
  // --- só do professor ---
  { nome: "objetivo", de: "professor" },
  { nome: "regiao", de: "professor" },
  { nome: "aula", de: "professor" },
  { nome: "iniciar", de: "professor" },
  { nome: "tp", de: "professor" },
  { nome: "mundo", de: "professor" },
  { nome: "bloco", de: "professor" },
  { nome: "dar", de: "professor" },
  { nome: "ciclo", de: "professor" },
  { nome: "vento", de: "professor" },
  { nome: "voo", de: "professor" },
  { nome: "invisivel", de: "professor" },
  { nome: "confinar", de: "professor" },
  { nome: "silenciar", de: "professor" },
  { nome: "expulsar", de: "professor" },
  { nome: "redefinirpin", de: "professor" },
  { nome: "perfil", de: "professor" },
];

/** Todos os subcomandos de cada comando (2º token). */
const SUBCOMANDOS: Record<string, string[]> = {
  regiao: ["criar", "apagar", "lista", "encher", "sortear", "carimbar"],
  objetivo: ["add", "lista", "texto", "mover", "remover", "modo", "pecas", "resetar"],
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
  silenciar: ["ligar", "desligar"],
  terreno: ["ligar", "desligar", "criar", "remover", "lista"],
  amigos: ["convidar", "aceitar", "recusar", "sair", "expulsar", "lista"],
  pvp: ["ligar", "desligar"],
};

/**
 * Subcomandos que o servidor recusa ao aluno DENTRO de um comando que é de
 * todos. São três casos, e cada um tem o gate no servidor:
 *  - `/grupo criar` — `equipes.ts: runGrupo` ("só professor cria grupo");
 *  - `/terreno ligar|desligar` — `equipes.ts: runClaim` (a proteção é do mundo);
 *  - os de CONSULTA (`/hora dia`, `/modo criativo`, `/pvp ligar`) — o
 *    `runCommand` recusa quando vem argumento.
 */
const SUB_SO_PROFESSOR: Record<string, string[]> = {
  grupo: ["criar"],
  terreno: ["ligar", "desligar"],
  hora: ["dia", "noite", "amanhecer", "entardecer", "meio-dia", "meia-noite"],
  modo: ["criativo", "sobrevivencia"],
  pvp: ["ligar", "desligar"],
};

/**
 * Comandos cujo 3º token é do professor mesmo o 2º sendo de todos: `/regra
 * <nome>` MOSTRA a regra (de todos), `/regra <nome> ligar` MUDA (do professor,
 * `parts.length > 2` no `runCommand`).
 */
const NIVEL3_SO_PROFESSOR = new Set(["regra"]);

/** Comandos cujo 2º token é um NOME de jogador. */
export const CMD_COM_NOME = new Set(["expulsar", "redefinirpin", "tpp", "tpa"]);
/** Subcomandos de /amigos cujo 3º token é um nome de jogador. */
export const AMIGOS_COM_NOME = new Set(["convidar", "aceitar", "recusar", "expulsar"]);

/** O que existe no mundo além da tabela — o cliente preenche (nomes vivos). */
export interface ContextoVivo {
  /** Nomes de mundo que o professor viu por último em `/mundo lista`. */
  mundos: string[];
  /** Quem está online agora. */
  jogadores: string[];
  /** Quem tem pedido de teleporte aberto PARA MIM (msg `tp_pedidos`, já podada
   *  pelo prazo no cliente). Vazia em host antigo, que não manda a mensagem. */
  pedidosTp?: string[];
}

const SEM_CONTEXTO: ContextoVivo = { mundos: [], jogadores: [] };

/**
 * Os comandos que ESTE papel pode usar, com os dele PRIMEIRO.
 *
 * O professor vê tudo (ele também convida amigos e reserva terreno), mas vê os
 * de autoria antes: o painel do dedo rola, e o 1º da lista é o que cabe sem
 * rolar. O aluno vê só os dele — eram 26 botões para chegar nos 10 que o
 * servidor aceita dele.
 */
export function comandosPara(papel: Papel): string[] {
  const deTodos = COMANDOS.filter((c) => c.de === "todos");
  if (papel === "aluno") return deTodos.map((c) => c.nome);
  const deProfessor = COMANDOS.filter((c) => c.de === "professor");
  return [...deProfessor, ...deTodos].map((c) => c.nome);
}

/** Os subcomandos que este papel pode usar (2º token). */
export function subcomandosPara(cmd: string, papel: Papel): string[] {
  const todos = SUBCOMANDOS[cmd] ?? [];
  if (papel === "professor") return todos;
  const proibidos = SUB_SO_PROFESSOR[cmd] ?? [];
  return todos.filter((s) => !proibidos.includes(s));
}

/** O 3º token, quando ele vem de uma lista FIXA ou do mundo vivo. */
export function nivel3Para(
  cmd: string,
  sub: string,
  papel: Papel,
  vivo: ContextoVivo = SEM_CONTEXTO,
): string[] {
  if (papel === "aluno" && NIVEL3_SO_PROFESSOR.has(cmd)) return [];
  if (cmd === "objetivo" && sub === "add") return ["construir", "chegar", "limpar", "acender"];
  if (cmd === "objetivo" && sub === "modo") return ["sequencial", "livre"];
  if (cmd === "objetivo" && sub === "pecas") return ["travadas", "livres"];
  if (cmd === "mundo" && sub === "carregar") return vivo.mundos;
  if (cmd === "amigos" && AMIGOS_COM_NOME.has(sub)) return vivo.jogadores;
  // §🍖 F1: /modo <modo> [eu|all|nome] — os alvos fixos primeiro, depois a turma
  if (cmd === "modo") return ["eu", "all", ...vivo.jogadores];
  if (cmd === "regra") return ["ligar", "desligar"];
  return [];
}

/**
 * Candidatos para a palavra que está sendo digitada, dadas as palavras JÁ
 * completas antes dela (a primeira inclui a barra: "/objetivo").
 */
export function candidatosPara(
  completos: string[],
  papel: Papel,
  vivo: ContextoVivo = SEM_CONTEXTO,
): string[] {
  if (completos.length === 0) return comandosPara(papel).map((c) => `/${c}`);
  const cmd = (completos[0] ?? "").replace(/^\//, "");
  if (papel === "aluno" && !comandosPara("aluno").includes(cmd)) return [];
  if (completos.length === 1) {
    // `/tpa` não oferece a turma: oferece QUEM PEDIU (2026-10-15). Listar todo
    // mundo era barulho — tocar em quem não pediu só rende recusa do servidor
    // numa lista que existe pra não errar.
    if (cmd === "tpa") return vivo.pedidosTp ?? [];
    if (CMD_COM_NOME.has(cmd)) return vivo.jogadores;
    if (cmd === "tp") return ["grupos", ...vivo.jogadores];
    if (cmd === "dar") return ["eu", "all", ...vivo.jogadores];
    // `/perfil` sozinho já vale (a turma toda); a lista é pra escolher UM
    if (cmd === "perfil") return ["todos", ...vivo.jogadores];
    return subcomandosPara(cmd, papel);
  }
  if (completos.length === 2) return nivel3Para(cmd, completos[1] ?? "", papel, vivo);
  return [];
}

// ── O que um TOQUE num nó da árvore faz (painel do dedo, 2026-08-14) ─────────
export type DestinoDeToque = "enviar" | "nivel" | "preencher";

/**
 * Nós que ficam INCOMPLETOS sem um argumento digitado (um id, uma quantidade,
 * um nome que não está online). Só valem quando NÃO há lista pra mostrar —
 * havendo lista, quem manda é a lista.
 */
function exigeArgumento(cmd: string, caminho: string[]): boolean {
  const sub = caminho[1] ?? "";
  // `/tpa` é o único comando de nome que vale SOZINHO: sem nome ele aceita o
  // pedido mais recente. Então ele nunca "exige argumento" — com gente online
  // ele lista (a regra geral), e com a sala vazia ele MANDA em vez de botar
  // "/tpa " num campo que ninguém teria como completar.
  if (cmd === "tpa") return false;
  if (caminho.length === 1) return CMD_COM_NOME.has(cmd) || cmd === "dar";
  if (caminho.length === 2) {
    if (cmd === "dar") return true; // §🍖 F4: /dar <alvo> <id> <qtd> — o id é digitado
    if (cmd === "amigos") return AMIGOS_COM_NOME.has(sub);
    if (cmd === "modo") return sub === "criativo" || sub === "sobrevivencia";
  }
  return false;
}

/**
 * Dado o caminho já navegado (o 1º item tem a barra: ["/tpp"]):
 *  - `nivel`  — há o que ESCOLHER no próximo passo (subcomando fixo, nome de
 *    quem está online, mundo, regra): o painel troca os botões pelas opções
 *    daquele comando;
 *  - `enviar` — comando inteiro, manda na hora;
 *  - `preencher` — falta um argumento que NINGUÉM pode listar (um id de item,
 *    uma quantidade, o nome de quem não está online): o painel põe o começo no
 *    campo e o aluno digita o resto.
 *
 * Não há exceção por comando: até o `/tpa`, que vale sozinho, LISTA quando há
 * gente online (pedido do usuário, 2026-10-15) — tocar no nome de quem pediu é
 * mais direto do que confiar em "o mais recente", principalmente quando dois
 * colegas pedem ao mesmo tempo. Com a sala vazia ele volta a mandar sozinho.
 *
 * **A regra é "lista ganha de digitação"** (pedido do usuário, 2026-10-15:
 * *"para comandos como /tpp quero que apareça a lista de alunos para facilitar
 * o uso"*). Antes, todo comando que pedia NOME caía em `preencher` — `/tpp`
 * botava "/tpp " no campo e devolvia o aluno pro teclado, que é justamente o
 * que o painel existe pra evitar. Agora qualquer nó que tenha candidatos vira
 * um NÍVEL, e `preencher` só sobra onde não há o que listar.
 *
 * O PAPEL muda o destino, e é parte do mesmo ponto: `/hora` tem seis
 * subcomandos pro professor (`nivel`) e nenhum pro aluno, pra quem consultar a
 * hora é um comando inteiro de UM toque (`enviar`).
 */
export function destinoDeToquePara(
  caminho: string[],
  papel: Papel,
  vivo: ContextoVivo = SEM_CONTEXTO,
): DestinoDeToque {
  const cmd = (caminho[0] ?? "").replace(/^\//, "");
  // `/tpa` é o único nó cuja lista NÃO abre sozinha, e é decisão do usuário
  // (2026-10-15): com UM pedido aberto, escolher entre uma opção só seria um
  // toque a troco de nada — `/tpa` sem nome já aceita aquele. A lista aparece
  // quando ela resolve alguma coisa: DOIS ou mais pedidos ao mesmo tempo, que
  // é quando "o mais recente" vira adivinhação.
  if (cmd === "tpa" && caminho.length === 1) {
    return (vivo.pedidosTp ?? []).length > 1 ? "nivel" : "enviar";
  }
  if (candidatosPara(caminho, papel, vivo).length) return "nivel";
  if (exigeArgumento(cmd, caminho)) return "preencher";
  return "enviar";
}

/** Os comandos que o servidor conhece, pra teste de paridade e pra mensagem. */
export function todosOsComandos(): readonly ComandoDef[] {
  return COMANDOS;
}
