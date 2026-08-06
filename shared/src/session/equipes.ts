import {
  type Claim,
  MAX_AMIGOS,
  MAX_CLAIM_NAME,
  MAX_CLAIM_X,
  MAX_CLAIM_Z,
  caixasSeCruzam,
  claimDentroDoLimite,
} from "../claims";
import { MAX_GRUPOS } from "../groups";
import { type ServerMessage } from "../protocol";
import { regionContains, regionDims, regionFromCorners } from "../regions";
import { type Box } from "../scenario";
import { broadcastObjectives } from "./cenario";
import type { GameSession } from "../session";

/**
 * EQUIPES — as três formas de "com quem eu jogo" que o servidor conhece.
 *
 * **Claims (cp24)**: a área que o ALUNO reserva pra si, com `/claim`. Protege
 * contra griefing e é a única das três que o próprio aluno cria.
 * **Amigos**: o grupo informal que atravessa o claim — quem está no meu grupo
 * constrói na minha área. Convite + aceite, e o feed volta pros DOIS lados
 * (bug-568).
 * **Grupos (cp13)**: a divisão da TURMA que o professor faz pra atividade. É o
 * escopo dos objetivos e do confinamento — não tem nada a ver com "amigos",
 * apesar do nome parecido, e é por isso que os três moram no mesmo arquivo:
 * quem mexe num tem de ver os outros dois.
 */

/** Claim que contém a célula, ou null. */
export function claimEm(ses: GameSession, x: number, y: number, z: number): Claim | null {
  for (const c of ses.claims.values()) {
    if (regionContains(c, x, y, z)) return c;
  }
  return null;
}

/** Time de amigos do aluno (chave = dono), como dono OU membro. null = sem time. */
export function equipeDe(ses: GameSession, name: string): string | null {
  if (ses.amigos.has(name)) return name;
  for (const [dono, membros] of ses.amigos) {
    if (membros.has(name)) return dono;
  }
  return null;
}

/** Dois nomes no MESMO time de amigos? (o próprio nome conta). */
export function mesmaEquipe(ses: GameSession, a: string, b: string): boolean {
  if (a === b) return true;
  const ea = equipeDe(ses, a);
  return ea !== null && ea === equipeDe(ses, b);
}

/** Nomes do time (dono + membros). Vazio se o dono não tem time. */
export function membrosDaEquipe(ses: GameSession, dono: string): string[] {
  const membros = ses.amigos.get(dono);
  return membros ? [dono, ...membros] : [];
}

/**
 * A célula está protegida contra ESTE cliente? Devolve a mensagem de recusa,
 * ou null se pode editar. Regra da rocha-matriz: o servidor é a barreira real.
 * Professor ignora todo claim; o dono e os amigos do dono passam.
 */
export function claimBloqueia(ses: GameSession, clientId: number, x: number, y: number, z: number): string | null {
  if (!ses.claimsAtivo) return null;
  const p = ses.players.get(clientId);
  if (!p || p.papel === "professor") return null;
  const c = claimEm(ses, x, y, z);
  if (!c || c.dono === p.name || mesmaEquipe(ses, p.name, c.dono)) return null;
  return `Esta área é protegida por ${c.dono}. Entre no grupo de amigos dele (/amigos) para construir aqui.`;
}

/**
 * Todas as caixas de trabalho do grupo: para CADA objetivo, a área do grupo
 * (`alvos[g-1]`, per-grupo) ou a área compartilhada (o próprio objetivo). O
 * aluno confinado edita dentro de QUALQUER uma (todos os objetivos do seu
 * grupo, não só o ativo); a área compartilhada é liberada para todo grupo.
 */
export function areasDoGrupo(ses: GameSession, grupo: number): Box[] {
  const boxes: Box[] = [];
  for (const o of ses.scenario.objetivos) {
    const b = o.alvos && grupo > 0 ? o.alvos[grupo - 1] : o;
    if (b) boxes.push(b);
  }
  return boxes;
}

/**
 * Confinamento (cp25) — INVERSO do claim: em mundo de aula/atividade o aluno
 * só edita DENTRO da área do seu grupo. Devolve o motivo (string) se a célula
 * (x,y,z) está fora, ou null se pode editar. Professor ignora. Aluno SEM grupo
 * (ou grupo sem área) é barrado em tudo — decisão de escopo: sem grupo, nada.
 * Mesma barreira-no-servidor da rocha-matriz/claim; o cliente já vê a caixa
 * verde do objetivo, então não precisa de UI nova.
 */
export function confinaBloqueia(ses: GameSession, clientId: number, x: number, y: number, z: number): string | null {
  if (!ses.confinamentoAtivo) return null;
  const p = ses.players.get(clientId);
  if (!p || p.papel === "professor") return null;
  const grupo = grupoDe(ses, p.name);
  if (grupo === null) {
    return "Modo confinamento: você ainda não está em um grupo. Peça ao professor para criar os grupos (/grupo) — só então poderá construir na área do seu grupo.";
  }
  for (const a of areasDoGrupo(ses, grupo)) {
    if (
      x >= a.min.x && x <= a.max.x &&
      y >= a.min.y && y <= a.max.y &&
      z >= a.min.z && z <= a.max.z
    ) {
      return null;
    }
  }
  return "Modo confinamento: você só pode construir e quebrar na área do seu grupo. Use /tp grupos ou siga a caixa verde do seu objetivo.";
}

/** O nome é conhecido nesta aula? (online, roster salvo ou identidade). Evita
 *  convidar/remover um nome que nunca existiu. */
export function nomeConhecido(ses: GameSession, name: string): boolean {
  if (ses.roster.has(name) || ses.identity.has(name)) return true;
  for (const p of ses.players.values()) {
    if (p.name === name) return true;
  }
  return false;
}

/** clientId de um nome ONLINE, ou null. */
export function clientIdDe(ses: GameSession, name: string): number | null {
  for (const [id, p] of ses.players) {
    if (p.name === name) return id;
  }
  return null;
}

export function claimsJson(ses: GameSession): string {
  return JSON.stringify({
    type: "claims",
    ativo: ses.claimsAtivo,
    claims: [...ses.claims.values()],
  } satisfies ServerMessage);
}

/** Claims mudaram (ou o toggle liga/desliga): a lista COMPLETA vai pra todos. */
export function broadcastClaims(ses: GameSession): void {
  const raw = claimsJson(ses);
  for (const id of ses.players.keys()) ses.send(id, raw);
}

export function sendClaims(ses: GameSession, clientId: number): void {
  ses.send(clientId, claimsJson(ses));
}

/** Convites que ESTE jogador mandou e que ninguém respondeu ainda. O mapa é
 *  indexado pelo CONVIDADO (alvo → quem convidou), então a volta é uma
 *  varredura — numa turma de 20 é barato, e evita um segundo índice pra
 *  manter em sincronia. */
export function convitesEnviadosPor(ses: GameSession, name: string): string[] {
  const alvos: string[] = [];
  for (const [alvo, quem] of ses.convitesAmigo) {
    if (quem.has(name)) alvos.push(alvo);
  }
  return alvos;
}

/** Manda ao cliente o PRÓPRIO grupo de amigos + convites (recebidos e feitos). */
export function sendFriends(ses: GameSession, clientId: number): void {
  const p = ses.players.get(clientId);
  if (!p) return;
  const dono = equipeDe(ses, p.name);
  ses.send(
    clientId,
    JSON.stringify({
      type: "friends",
      equipe: dono !== null ? { dono, membros: membrosDaEquipe(ses, dono) } : null,
      convites: [...(ses.convitesAmigo.get(p.name) ?? [])],
      enviados: convitesEnviadosPor(ses, p.name),
    } satisfies ServerMessage),
  );
}

/** Reenvia o feed `friends` a todo membro ONLINE do time (entrar/sair/expulsar). */
export function atualizarEquipe(ses: GameSession, dono: string): void {
  for (const n of membrosDaEquipe(ses, dono)) {
    const id = clientIdDe(ses, n);
    if (id !== null) sendFriends(ses, id);
  }
}

/** Chat do servidor a cada membro ONLINE do time. */
export function avisarEquipe(ses: GameSession, dono: string, texto: string): void {
  for (const n of membrosDaEquipe(ses, dono)) {
    const id = clientIdDe(ses, n);
    if (id !== null) ses.sendServerChat(id, texto);
  }
}

/** `/claim` — proteção de áreas. ligar/desligar = professor; criar/remover/
 *  lista = aluno. O professor edita qualquer lugar (ignora claims). */
export function runClaim(ses: GameSession, clientId: number, parts: string[]): string {
  const p = ses.players.get(clientId);
  if (!p) return "Entre no mundo primeiro.";
  const professor = p.papel === "professor";
  switch (parts[1]) {
    case "ligar":
    case "desligar": {
      if (!professor) return "Somente o professor liga ou desliga a proteção de áreas.";
      const novo = parts[1] === "ligar";
      if (novo === ses.claimsAtivo) {
        return novo ? "A proteção de áreas já está ligada." : "A proteção de áreas já está desligada.";
      }
      ses.claimsAtivo = novo;
      broadcastClaims(ses);
      ses.broadcast({
        type: "chat",
        author: "servidor",
        text: novo
          ? "Proteção de áreas LIGADA. Marque sua área com a varinha (tecla R) e use /claim criar; convide amigos com /amigos convidar nome."
          : "Proteção de áreas desligada — as áreas voltam a ser livres.",
      });
      return novo ? "Proteção de áreas ligada." : "Proteção de áreas desligada.";
    }
    case "criar": {
      // 2026-07-21: o PROFESSOR também reserva área (mesmo acesso do aluno).
      if (!ses.claimsAtivo) return "A proteção de áreas está desligada. Ligue com /claim ligar.";
      if (ses.claims.has(p.name)) return "Você já tem uma área reservada. Use /claim remover antes de marcar outra.";
      const marks = ses.wandMarks.get(clientId);
      if (!marks?.c1 || !marks.c2) {
        return "Marque os dois cantos com a varinha primeiro (tecla R ou o botão 🪄: clique esquerdo = canto 1, direito = canto 2).";
      }
      const { min, max } = regionFromCorners(marks.c1, marks.c2);
      if (!claimDentroDoLimite(min, max)) {
        return `A área é grande demais (máximo de ${MAX_CLAIM_X}×${MAX_CLAIM_Z} blocos na horizontal).`;
      }
      // o claim protege a COLUNA inteira: da camada 0 (bedrock) ao teto do
      // mundo. Assim ninguém constrói ilha flutuante por cima nem escava por
      // baixo — só a pegada XZ que o autor marcou define a área.
      min.y = 0;
      max.y = ses.world.sizeY - 1;
      for (const c of ses.claims.values()) {
        if (caixasSeCruzam({ min, max }, c)) return `Sua área encosta na área de ${c.dono}. Marque em outro lugar.`;
      }
      for (const r of ses.regions.values()) {
        if (caixasSeCruzam({ min, max }, r)) {
          return "Sua área encosta numa região reservada pelo professor. Marque em outro lugar.";
        }
      }
      const nome = parts[2];
      const claim: Claim = {
        dono: p.name,
        min,
        max,
        ...(nome && nome.length <= MAX_CLAIM_NAME ? { nome } : {}),
      };
      ses.claims.set(p.name, claim);
      ses.wandMarks.delete(clientId);
      broadcastClaims(ses);
      const d = regionDims({ nome: "", min, max });
      return `Área reservada: coluna de ${d.x}×${d.z} blocos, da base ao topo do mundo. Só você e seus amigos constroem aqui (/amigos convidar nome).`;
    }
    case "remover": {
      const alvo = parts[2];
      if (alvo) {
        if (!professor) return "Você só pode remover a SUA área (/claim remover, sem nome).";
        if (!ses.claims.delete(alvo)) return `${alvo} não tem área protegida.`;
        broadcastClaims(ses);
        return `Área de ${alvo} removida.`;
      }
      if (!ses.claims.delete(p.name)) return "Você não tem área protegida.";
      broadcastClaims(ses);
      return "Sua área protegida foi removida.";
    }
    case "lista": {
      if (ses.claims.size === 0) return "Nenhuma área protegida ainda.";
      return [...ses.claims.values()]
        .map((c) => {
          const d = regionDims({ nome: "", min: c.min, max: c.max });
          return `${c.dono}${c.nome ? ` (${c.nome})` : ""}: (${c.min.x},${c.min.y},${c.min.z})→(${c.max.x},${c.max.y},${c.max.z}) ${d.x}×${d.y}×${d.z}`;
        })
        .join("\n");
    }
    default:
      return professor
        ? "Uso: /claim ligar · /claim desligar · /claim criar · /claim remover [nome] · /claim lista"
        : "Uso: /claim criar [nome] (marque a área com a varinha R antes) · /claim remover · /claim lista";
  }
}

/** `/amigos` — grupo de amigos do aluno. Entrada por convite + aceite. */
export function runAmigos(ses: GameSession, clientId: number, parts: string[]): string {
  const p = ses.players.get(clientId);
  if (!p) return "Entre no mundo primeiro.";
  const me = p.name;
  switch (parts[1]) {
    case "convidar": {
      const alvo = parts.slice(2).join(" ").trim();
      if (!alvo) return "Uso: /amigos convidar nome.";
      if (alvo === me) return "Você não pode convidar a si mesmo.";
      const minha = equipeDe(ses, me);
      if (minha !== null && minha !== me) {
        return "Você está no grupo de outra pessoa. Saia dele (/amigos sair) para criar o seu.";
      }
      if (!nomeConhecido(ses, alvo)) return `Ninguém chamado "${alvo}" está nesta aula.`;
      if (equipeDe(ses, alvo) !== null) return `${alvo} já está em um grupo de amigos.`;
      const membros = ses.amigos.get(me) ?? new Set<string>();
      if (1 + membros.size >= MAX_AMIGOS) {
        return `Seu grupo já está cheio (máximo de ${MAX_AMIGOS}, contando você).`;
      }
      ses.amigos.set(me, membros); // primeira vez cria o time (vazio)
      const conv = ses.convitesAmigo.get(alvo) ?? new Set<string>();
      if (conv.has(me)) return `Você já convidou ${alvo}. Espere ele aceitar.`;
      conv.add(me);
      ses.convitesAmigo.set(alvo, conv);
      const idAlvo = clientIdDe(ses, alvo);
      if (idAlvo !== null) {
        ses.sendServerChat(idAlvo, `${me} convidou você para o grupo de amigos. Aceite com /amigos aceitar ${me}.`);
        sendFriends(ses, idAlvo);
      }
      // e pra quem convidou também: o time acabou de nascer (com ele dentro)
      // e o convite entrou nos `enviados` — sem isto o painel dele não muda
      sendFriends(ses, clientId);
      return `Convite enviado para ${alvo}.`;
    }
    case "aceitar": {
      const conv = ses.convitesAmigo.get(me);
      if (!conv || conv.size === 0) return "Você não tem convites de amigo pendentes.";
      let dono = parts.slice(2).join(" ").trim();
      if (!dono) {
        if (conv.size > 1) return `Você tem convites de ${[...conv].join(", ")}. Escolha: /amigos aceitar nome.`;
        dono = [...conv][0] ?? "";
      }
      if (!conv.has(dono)) return `${dono || "Esse jogador"} não te convidou.`;
      if (equipeDe(ses, me) !== null) return "Você já está em um grupo. Saia dele antes (/amigos sair).";
      const membros = ses.amigos.get(dono);
      if (!membros) {
        conv.delete(dono);
        return `O grupo de ${dono} não existe mais.`;
      }
      if (1 + membros.size >= MAX_AMIGOS) return `O grupo de ${dono} está cheio.`;
      membros.add(me);
      const descartados = [...conv].filter((n) => n !== dono);
      ses.convitesAmigo.delete(me); // aceitou um: descarta os outros convites
      // os outros que convidaram param de esperar: o "aguardando" some do
      // painel deles junto com o convite que acabou de ser descartado
      for (const outro of descartados) {
        const id = clientIdDe(ses, outro);
        if (id !== null) sendFriends(ses, id);
      }
      avisarEquipe(ses, dono, `${me} entrou no grupo de amigos.`);
      atualizarEquipe(ses, dono);
      return `Você entrou no grupo de ${dono}.`;
    }
    case "recusar": {
      const conv = ses.convitesAmigo.get(me);
      if (!conv || conv.size === 0) return "Você não tem convites pendentes.";
      let dono = parts.slice(2).join(" ").trim();
      if (!dono) {
        if (conv.size > 1) return `Escolha qual recusar: /amigos recusar nome (${[...conv].join(", ")}).`;
        dono = [...conv][0] ?? "";
      }
      if (!conv.delete(dono)) return `${dono || "Esse jogador"} não te convidou.`;
      if (conv.size === 0) ses.convitesAmigo.delete(me);
      sendFriends(ses, clientId);
      // quem convidou tira o "aguardando" da tela na hora (e fica sabendo
      // pelo chat: recusa em silêncio deixaria o convite pendente pra sempre)
      const idDono = clientIdDe(ses, dono);
      if (idDono !== null) {
        ses.sendServerChat(idDono, `${me} recusou o seu convite de amigos.`);
        sendFriends(ses, idDono);
      }
      return `Convite de ${dono} recusado.`;
    }
    case "sair": {
      const equipe = equipeDe(ses, me);
      if (equipe === null) return "Você não está em nenhum grupo de amigos.";
      if (equipe === me) {
        // dono saiu: dissolve o time (membros ficam livres)
        const outros = membrosDaEquipe(ses, me).filter((n) => n !== me);
        ses.amigos.delete(me);
        for (const n of outros) {
          const id = clientIdDe(ses, n);
          if (id !== null) {
            ses.sendServerChat(id, `${me} dissolveu o grupo de amigos.`);
            sendFriends(ses, id);
          }
        }
        sendFriends(ses, clientId);
        return "Seu grupo de amigos foi dissolvido.";
      }
      ses.amigos.get(equipe)?.delete(me);
      avisarEquipe(ses, equipe, `${me} saiu do grupo de amigos.`);
      atualizarEquipe(ses, equipe);
      sendFriends(ses, clientId);
      return `Você saiu do grupo de ${equipe}.`;
    }
    case "expulsar": {
      const alvo = parts.slice(2).join(" ").trim();
      if (!alvo) return "Uso: /amigos expulsar nome.";
      const membros = ses.amigos.get(me);
      if (!membros) return "Você não é dono de um grupo de amigos.";
      if (!membros.delete(alvo)) return `${alvo} não está no seu grupo.`;
      const id = clientIdDe(ses, alvo);
      if (id !== null) {
        ses.sendServerChat(id, `${me} removeu você do grupo de amigos.`);
        sendFriends(ses, id);
      }
      atualizarEquipe(ses, me);
      sendFriends(ses, clientId);
      return `${alvo} foi removido do seu grupo.`;
    }
    case "lista": {
      const equipe = equipeDe(ses, me);
      const conv = ses.convitesAmigo.get(me);
      const linhas: string[] = [];
      linhas.push(
        equipe !== null
          ? `Grupo de ${equipe}: ${membrosDaEquipe(ses, equipe).join(", ")}`
          : "Você não está em nenhum grupo de amigos.",
      );
      if (conv && conv.size) {
        linhas.push(`Convites pendentes: ${[...conv].join(", ")} (aceite com /amigos aceitar nome).`);
      }
      return linhas.join("\n");
    }
    default:
      return "Uso: /amigos convidar nome · /amigos aceitar [nome] · /amigos recusar [nome] · /amigos sair · /amigos expulsar nome · /amigos lista";
  }
}


/** @internal */
export function grupoDe(ses: GameSession, name: string): number | null {
  for (const [id, membros] of ses.grupos) {
    if (membros.has(name)) return id;
  }
  return null;
}

/** Manda ao cliente o PRÓPRIO grupo (join e mudanças). */
export function sendGroup(ses: GameSession, clientId: number): void {
  const p = ses.players.get(clientId);
  if (!p) return;
  ses.send(
    clientId,
    JSON.stringify({
      type: "group",
      grupo: grupoDe(ses, p.name),
    } satisfies ServerMessage),
  );
}

export function groupsJson(ses: GameSession): string {
  return JSON.stringify({
    type: "groups",
    grupos: [...ses.grupos.entries()].map(([id, membros]) => ({
      id,
      membros: [...membros],
    })),
  } satisfies ServerMessage);
}

/** Composição completa pro cliente novo (painéis do cp14 vivem disto). */
export function sendGroups(ses: GameSession, clientId: number): void {
  ses.send(clientId, groupsJson(ses));
}

/** Composição mudou (criar/entrar/sair/auto-distribuição): avisa TODOS. */
export function broadcastGroups(ses: GameSession): void {
  const raw = groupsJson(ses);
  for (const clientId of ses.players.keys()) ses.send(clientId, raw);
}

/** Subcomandos de /grupo. criar = só professor; entrar/sair/lista = todos. */
export function runGrupo(ses: GameSession, clientId: number, parts: string[]): string {
  const professor = ses.players.get(clientId)?.papel === "professor";
  switch (parts[1]) {
    case "criar": {
      if (!professor) return "Somente o professor pode criar grupos.";
      const n = Number(parts[2]);
      const porAluno = parts[3] === "alunos";
      if (
        !Number.isInteger(n) || n < 1 ||
        (parts.length !== 3 && !(parts.length === 4 && porAluno))
      ) {
        return "Uso: /grupo criar 5 (cria 5 grupos) · /grupo criar 5 alunos (grupos de 5 alunos cada).";
      }
      const alunosOnline = [...ses.players.values()]
        .filter((p) => p.papel === "aluno")
        .map((p) => p.name);
      const quantos = porAluno ? Math.max(1, Math.ceil(alunosOnline.length / n)) : n;
      if (quantos > MAX_GRUPOS) return `O máximo é ${MAX_GRUPOS} grupos.`;
      // recriar grupos ZERA composição e progresso por grupo (turma nova)
      ses.grupos.clear();
      ses.completosGrupo.clear();
      for (let g = 1; g <= quantos; g++) ses.grupos.set(g, new Set());
      // round-robin: um pra cada grupo até não sobrar aluno sem grupo
      alunosOnline.forEach((name, i) => {
        ses.grupos.get((i % quantos) + 1)?.add(name);
      });
      ses.broadcast({
        type: "chat",
        author: "servidor",
        text: `${quantos} grupo(s) criados. Veja o seu no aviso da tela; para trocar, use /grupo entrar n.`,
      });
      for (const [id, p] of ses.players) {
        const g = grupoDe(ses, p.name);
        if (g !== null) ses.sendServerChat(id, `você está no grupo ${g}`);
        sendGroup(ses, id);
      }
      broadcastGroups(ses);
      broadcastObjectives(ses, true);
      return `grupos: ${[...ses.grupos.entries()]
        .map(([g, m]) => `g${g}(${m.size})`)
        .join(" ")}`;
    }
    case "entrar": {
      const g = Number(parts[2]);
      if (parts.length !== 3 || !Number.isInteger(g)) return "Uso: /grupo entrar n.";
      if (!ses.grupos.has(g)) return `Não existe o grupo ${g}.`;
      const p = ses.players.get(clientId);
      if (!p) return "Entre no mundo primeiro.";
      const atual = grupoDe(ses, p.name);
      if (atual !== null) ses.grupos.get(atual)?.delete(p.name);
      ses.grupos.get(g)?.add(p.name);
      sendGroup(ses, clientId);
      broadcastGroups(ses);
      return `Você agora está no grupo ${g}.`;
    }
    case "sair": {
      const p = ses.players.get(clientId);
      if (!p) return "Entre no mundo primeiro.";
      const atual = grupoDe(ses, p.name);
      if (atual === null) return "Você não está em nenhum grupo.";
      ses.grupos.get(atual)?.delete(p.name);
      sendGroup(ses, clientId);
      broadcastGroups(ses);
      return `Você saiu do grupo ${atual}.`;
    }
    case "lista": {
      if (ses.grupos.size === 0) return "Nenhum grupo foi criado. O professor cria os grupos com /grupo criar n.";
      return [...ses.grupos.entries()]
        .map(([g, membros]) => `grupo ${g} (${membros.size}): ${[...membros].join(", ") || "—"}`)
        .join("\n");
    }
    default:
      return "Uso: /grupo criar n [alunos] · /grupo entrar n · /grupo sair · /grupo lista";
  }
}

export function runConfinar(ses: GameSession, parts: string[]): string {
  const arg = parts[1]?.toLowerCase();
  if (arg === undefined || arg === "status") {
    return `Confinamento por área de grupo está ${ses.confinamentoAtivo ? "LIGADO" : "desligado"}. Use /confinar ligar ou /confinar desligar.`;
  }
  let novo: boolean;
  if (arg === "ligar" || arg === "on") novo = true;
  else if (arg === "desligar" || arg === "off") novo = false;
  else return "Uso: /confinar ligar ou /confinar desligar (ou /confinar status).";
  if (novo === ses.confinamentoAtivo) {
    return `O confinamento já está ${novo ? "ligado" : "desligado"}.`;
  }
  ses.confinamentoAtivo = novo;
  // a turma inteira precisa saber que a regra mudou (o aluno já vê a caixa
  // verde do objetivo, então não há UI nova — só o aviso de chat)
  ses.broadcast({
    type: "chat",
    author: "servidor",
    text: novo
      ? "Modo confinamento LIGADO: cada aluno só constrói e quebra na área do seu grupo."
      : "Modo confinamento desligado: os alunos voltam a editar livremente.",
  });
  if (novo && (ses.grupos.size === 0 || ses.scenario.objetivos.length === 0)) {
    return (
      "Confinamento ligado, mas ATENÇÃO: ainda não há " +
      (ses.grupos.size === 0 ? "grupos" : "áreas de objetivo") +
      " definidos — nenhum aluno conseguirá construir até você criar " +
      (ses.grupos.size === 0 ? "os grupos (/grupo)" : "os objetivos com área de grupo (/objetivo)") +
      "."
    );
  }
  return novo
    ? "Confinamento ligado: cada aluno fica preso à área do seu grupo (você, professor, edita em qualquer lugar)."
    : "Confinamento desligado.";
}

/** Subcomandos de /regiao (cp11) — só chega aqui com papel professor. */
