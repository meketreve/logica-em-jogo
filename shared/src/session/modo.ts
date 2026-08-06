import { type Modo, modoEfetivo, nomeModo, parseModo } from "../modo";
import { type ServerMessage } from "../protocol";
import { REGRAS, regraDef, valorRegra } from "../regras";
import { sendVida, temPvp } from "./vitais";
import { sendInventario } from "./inventario";
import type { GameSession } from "../session";

/**
 * §🍖 F1 — MODO DE JOGO (criativo/sobrevivência) e as REGRAS do mundo.
 *
 * O override pessoal (`/modo criativo @bia`) vence o padrão do mundo e é por
 * NOME, não por id de cliente: o modo tem de sobreviver ao rejoin, igual ao
 * roster. `/regra` é o registro de regras do mundo (`../regras.ts`) e guarda só
 * o DIFF do padrão; `/pvp` é um atalho pra a MESMA entrada `pvp` do registro —
 * não é regra nova, e os dois não podem discordar.
 */

/** Modo EFETIVO de um jogador pelo NOME: o override pessoal vence o mundo. */
export function modoDe(ses: GameSession, nome: string): Modo {
  return modoEfetivo(ses.modoMundo, ses.modosPorJogador.get(nome));
}

/** Modo efetivo de cada jogador ONLINE agora — fotografia pra comparar depois
 *  da mudança e avisar SÓ quem realmente mudou (mesma disciplina do dedup dos
 *  broadcasts de estado: nada de churn pra quem ficou igual). */
export function modosAgora(ses: GameSession): Map<number, Modo> {
  const m = new Map<number, Modo>();
  for (const [clientId, p] of ses.players) m.set(clientId, modoDe(ses, p.name));
  return m;
}

export function sendModo(ses: GameSession, clientId: number): void {
  const p = ses.players.get(clientId);
  if (!p) return;
  ses.send(
    clientId,
    JSON.stringify({
      type: "modo",
      efetivo: modoDe(ses, p.name),
      // §🍖 F7: viaja junto porque é a MESMA pergunta ("como se joga aqui") e
      // porque a mira precisa saber, sem mensagem nova no protocolo
      pvp: temPvp(ses),
    } satisfies ServerMessage),
  );
}

/** Avisa quem MUDOU de modo (msg `modo` + uma linha no chat). O autor do
 *  comando recebe só a mensagem de protocolo — a confirmação em texto dele é
 *  o retorno do próprio comando, e duas linhas iguais confundem. */
export function avisarModos(ses: GameSession, antes: ReadonlyMap<number, Modo>, autorId: number): void {
  for (const [clientId, p] of ses.players) {
    const agora = modoDe(ses, p.name);
    if (antes.get(clientId) === agora) continue;
    sendModo(ses, clientId);
    // §🍖 F2: quem estava VOANDO em criativo tem um pico de queda antigo
    // guardado; entrar em sobrevivência não pode cobrar essa altura
    ses.picoQueda.set(clientId, p.y);
    if (agora === "sobrevivencia") {
      sendVida(ses, clientId);
      // §🍖 F4: a mochila aparece na hora que ele entra em sobrevivência —
      // o cliente troca a paleta infinita pelo inventário de verdade e
      // precisa saber COM O QUE está entrando (rejoin traz a de ontem).
      sendInventario(ses, clientId);
    }
    if (clientId === autorId) continue;
    ses.sendServerChat(
      clientId,
      agora === "sobrevivencia"
        ? "Você entrou no modo sobrevivência — nele não dá para voar."
        : "Você voltou para o modo criativo.",
    );
  }
}

/**
 * `/modo` (§🍖 F1). Consultar é de todos; mudar é do professor (o dispatcher
 * já barrou o aluno). Semântica fixada com o usuário em 2026-07-27:
 *   /modo                  → mostra o do mundo e o seu
 *   /modo <modo>           → padrão do MUNDO (quem tem ajuste pessoal segue nele)
 *   /modo <modo> eu        → só quem digitou (demonstrar sem mexer na turma)
 *   /modo <modo> nome      → ajuste pessoal de um jogador (vence o do mundo)
 *   /modo <modo> all       → padrão do mundo + APAGA todos os ajustes pessoais
 * O `all` não pega o professor que digitou: ele fica como está (e se muda com
 * `eu`) — é ele que precisa continuar voando pra supervisionar a turma.
 */
export function runModo(ses: GameSession, clientId: number, parts: string[]): string {
  const p = ses.players.get(clientId);
  if (!p) return "Entre no mundo antes de usar /modo.";
  const professor = p.papel === "professor";
  if (parts.length === 1) {
    const meu = modoDe(ses, p.name);
    const linha =
      `O mundo está em modo ${nomeModo(ses.modoMundo)} e você está em ${nomeModo(meu)}` +
      (ses.modosPorJogador.has(p.name) ? " (ajuste pessoal)." : ".");
    return professor
      ? `${linha} Mude com /modo criativo|sobrevivencia (o mundo), /modo <modo> eu, /modo <modo> nome ou /modo <modo> all.`
      : linha;
  }
  if (ses.somenteLeitura) {
    return "Este é um mundo de aula: ele é sempre criativo, e o modo não se troca aqui.";
  }
  const novo = parseModo(parts[1]);
  if (!novo || parts.length > 3) {
    return "Uso: /modo criativo|sobrevivencia [eu | all | nome do aluno]. Sem o terceiro termo, muda o padrão do mundo.";
  }
  const alvo = parts[2];
  const antes = modosAgora(ses);

  if (alvo === undefined) {
    ses.modoMundo = novo;
    avisarModos(ses, antes, clientId);
    const presos = ses.modosPorJogador.size;
    return (
      `Modo do mundo agora é ${nomeModo(novo)}.` +
      (presos
        ? ` ${presos} jogador(es) seguem com ajuste pessoal — use /modo ${parts[1]} all para apagar os ajustes.`
        : "")
    );
  }

  if (alvo === "all" || alvo === "todos") {
    // o autor não é arrastado junto: guarda o modo dele como ajuste pessoal
    // (só se for diferente do novo padrão — senão o save ganharia ruído)
    const meuAtual = modoDe(ses, p.name);
    ses.modosPorJogador.clear();
    ses.modoMundo = novo;
    if (meuAtual !== novo) ses.modosPorJogador.set(p.name, meuAtual);
    avisarModos(ses, antes, clientId);
    return (
      `Modo ${nomeModo(novo)} aplicado a TODA a turma (agora e para quem entrar). ` +
      `Você continua em ${nomeModo(meuAtual)} — use /modo ${parts[1]} eu para acompanhar a turma.`
    );
  }

  const alvoNome = alvo === "eu" ? p.name : acharNomeConhecido(ses, alvo);
  if (alvoNome === null) {
    return `Ninguém chamado "${alvo.replace(/^@/, "")}" neste mundo. Use /modo ${parts[1]} eu, /modo ${parts[1]} all ou o nome exato do aluno.`;
  }
  // ajuste pessoal só existe pra quem está DIFERENTE do mundo: igual ao padrão
  // = volta a seguir o mundo (mesmo efeito hoje, e o save fica enxuto)
  if (novo === ses.modoMundo) ses.modosPorJogador.delete(alvoNome);
  else ses.modosPorJogador.set(alvoNome, novo);
  avisarModos(ses, antes, clientId);
  const online = ses.jogadoresConectados().some((j) => j.name === alvoNome);
  return (
    `${alvoNome === p.name ? "Você está" : `${alvoNome} está`} em modo ${nomeModo(novo)}.` +
    (online ? "" : " (ele não está conectado agora — vale quando entrar.)")
  );
}

/** Nome de jogador que o MUNDO conhece (online ou lembrado no roster), sem
 *  diferenciar maiúsculas e aceitando o `@nome` da tabela do comando. Devolve
 *  o nome como o mundo o guarda — é ele que vai pro save. */
export function acharNomeConhecido(ses: GameSession, digitado: string): string | null {
  const alvo = digitado.replace(/^@/, "").toLowerCase();
  if (!alvo) return null;
  for (const p of ses.players.values()) {
    if (p.name.toLowerCase() === alvo) return p.name;
  }
  for (const nome of ses.roster.keys()) {
    if (nome.toLowerCase() === alvo) return nome;
  }
  return null;
}

/**
 * `/regra` (§🍖 F1) — registro genérico de regras de mundo, no molde do
 * `/gamerule`. Listar/consultar é de todos; mudar é do professor (o
 * dispatcher já barrou o aluno). Regra nova = uma entrada em `regras.ts`,
 * sem comando novo e sem campo novo no save.
 */
export function runRegra(ses: GameSession, parts: string[]): string {
  if (parts.length === 1) {
    const lista = REGRAS.map(
      (r) => `${r.nome}: ${valorRegra(ses.regras, r.nome) ? "ligada" : "desligada"}`,
    ).join(" · ");
    return `Regras deste mundo — ${lista}. Veja o que cada uma faz com /regra nome; mude com /regra nome ligar|desligar.`;
  }
  const nome = (parts[1] ?? "").toLowerCase();
  const def = regraDef(nome);
  if (!def) {
    return `Não existe a regra "${parts[1]}". As regras são: ${REGRAS.map((r) => r.nome).join(", ")}.`;
  }
  const atual = valorRegra(ses.regras, nome);
  if (parts.length === 2) {
    return `${nome} está ${atual ? "ligada" : "desligada"} (padrão: ${def.padrao ? "ligada" : "desligada"}). ${def.ajuda}`;
  }
  const arg = (parts[2] ?? "").toLowerCase();
  let valor: boolean;
  if (arg === "ligar" || arg === "on") valor = true;
  else if (arg === "desligar" || arg === "off") valor = false;
  else return `Uso: /regra ${nome} ligar|desligar.`;
  if (parts.length > 3) return `Uso: /regra ${nome} ligar|desligar.`;
  // guarda SÓ o que difere do padrão do registro (ver regras.ts)
  if (valor === def.padrao) ses.regras.delete(nome);
  else ses.regras.set(nome, valor);
  if (valor === atual) return `A regra ${nome} já estava ${valor ? "ligada" : "desligada"}.`;
  // §🍖 F3: as coxas aparecem (ou somem) na hora — o HUD só conhece a fome
  // pelo campo da mensagem `vida`, então quem está em sobrevivência recebe uma
  if (nome === "fome") {
    for (const [id, j] of ses.players) {
      if (modoDe(ses, j.name) === "sobrevivencia") sendVida(ses, id);
    }
  }
  // §🍖 F7: pelo `/regra pvp` o aviso à turma é o MESMO do `/pvp` — quem
  // apanha sem saber que ligou acha que é bug. Os dois comandos escrevem no
  // mesmo mapa; só o texto da resposta ao professor difere.
  if (nome === "pvp") anunciarPvp(ses, valor);
  // regra ainda sem mecânica (F4 e F7) avisa; a `fome` parou de avisar no F3,
  // senão o professor liga, vê a barra andar e desconfia do que o jogo diz
  return (
    `Regra ${nome} ${valor ? "ligada" : "desligada"} e gravada neste mundo.` +
    (def.pendente ? " (Ela só passa a valer quando a mecânica correspondente existir.)" : "")
  );
}

/**
 * `/pvp` (§🍖 F7) — atalho de professor pra a regra `pvp`, no molde do
 * `/hora`. Escreve na MESMA `ses.regras`, então `/regra pvp` e `/pvp` não
 * podem discordar, e o valor viaja no save pelo caminho que já existia.
 *
 * Mundo de aula responde a verdade e não muda nada: lá o pvp é desligado pelo
 * host, como o modo criativo (recusar calado faria o professor achar que
 * ligou).
 */
export function runPvp(ses: GameSession, parts: string[]): string {
  const def = regraDef("pvp")!;
  const atual = temPvp(ses);
  if (parts.length === 1) {
    return ses.somenteLeitura
      ? "Este é um mundo de aula: ninguém se ataca aqui, e isso não se troca."
      : `O ataque entre jogadores está ${atual ? "LIGADO" : "desligado"}. ${def.ajuda} Mude com /pvp ligar ou /pvp desligar.`;
  }
  if (parts.length > 2) return "Uso: /pvp ligar ou /pvp desligar.";
  const arg = (parts[1] ?? "").toLowerCase();
  let valor: boolean;
  if (arg === "ligar" || arg === "on") valor = true;
  else if (arg === "desligar" || arg === "off") valor = false;
  else return "Uso: /pvp ligar ou /pvp desligar.";
  if (ses.somenteLeitura) {
    return "Este é um mundo de aula: ninguém se ataca aqui, e isso não se troca.";
  }
  if (valor === def.padrao) ses.regras.delete("pvp");
  else ses.regras.set("pvp", valor);
  if (valor === atual) return `O ataque entre jogadores já estava ${valor ? "ligado" : "desligado"}.`;
  anunciarPvp(ses, valor);
  return `Ataque entre jogadores ${valor ? "ligado" : "desligado"} e gravado neste mundo.`;
}

/** A turma inteira precisa saber que o pvp mudou — quem apanha sem aviso acha
 *  que é bug —, e cada cliente recebe o `modo` de novo porque é ele que
 *  carrega o `pvp` da mira (§🍖 F7). */
export function anunciarPvp(ses: GameSession, valor: boolean): void {
  ses.broadcast({
    type: "chat",
    author: "servidor",
    text: valor
      ? "O professor LIGOU o ataque entre jogadores (só em sobrevivência)."
      : "O professor desligou o ataque entre jogadores.",
  });
  for (const clientId of ses.players.keys()) sendModo(ses, clientId);
}

