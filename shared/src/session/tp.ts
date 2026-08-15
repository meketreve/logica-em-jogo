import { type ServerMessage } from "../protocol";
import { type Box } from "../scenario";
import { findSpawnY, inBounds } from "../world";
import { activeIdsFor, zerarProgresso } from "./cenario";
import { runGrupo } from "./equipes";
import { parseCoordArg } from "./coords";
import type { GameSession } from "../session";

/** Validade de um pedido de /tpr (aceite com /tpa) — 60 s (2026-08-14: pedido
 *  do usuário — "30 segundos é pouco"; o professor lê o aviso e o aluno ainda
 *  tem tempo de digitar). */
export const TP_PEDIDO_MS = 60_000;

/**
 * TELEPORTE e INÍCIO DA ATIVIDADE.
 *
 * `/tp` é do professor (teleoperação, sem custo e sem alcance); `/tpr` + `/tpa`
 * é o par que o ALUNO usa — pedir e aceitar —, porque teleporte unilateral de
 * aluno pra aluno é ferramenta de perseguir colega. `/tp grupos` e `/iniciar`
 * são o gesto de abrir a aula: levam cada grupo à área do seu objetivo.
 */

/**
 * Teleporta um jogador conectado: move no servidor e avisa a rede — o próprio
 * cliente pela msg `teleport` (reposiciona a câmera), os demais por
 * `player_moved` (veem o boneco no lugar novo). Zera a orientação para todos
 * olharem na mesma direção no começo da aula.
 */
export function teleportar(ses: GameSession, clientId: number, x: number, y: number, z: number): void {
  const p = ses.players.get(clientId);
  if (!p) return;
  p.x = x;
  p.y = y;
  p.z = z;
  p.yaw = 0;
  p.pitch = 0;
  // §🍖 F2: teleporte NÃO é queda — quem cai 40 blocos por comando (ou por
  // respawn) não pode pousar machucado
  ses.picoQueda.set(clientId, y);
  ses.send(
    clientId,
    JSON.stringify({ type: "teleport", x, y, z, yaw: 0, pitch: 0 } satisfies ServerMessage),
  );
  ses.broadcastExcept(clientId, {
    type: "player_moved",
    id: clientId,
    x,
    y,
    z,
    yaw: 0,
    pitch: 0,
    name: p.name,
  });
}

/**
 * Caixa-alvo para onde levar o grupo: a área do objetivo ATIVO do grupo (o
 * primeiro que ele ainda não fechou, no seu próprio ritmo); se já fechou
 * todos, a do primeiro objetivo. `null` se o cenário não tem objetivo. Um
 * objetivo per-grupo dá a área do grupo (`alvos[g-1]`); um compartilhado dá
 * a área única (o próprio objetivo tem min/max e serve de caixa).
 */
export function areaDoGrupo(ses: GameSession, grupo: number): Box | null {
  const objs = ses.scenario.objetivos;
  if (objs.length === 0) return null;
  const ativos = activeIdsFor(ses, grupo);
  const o = objs.find((x) => ativos.has(x.id)) ?? objs[0];
  if (!o) return null;
  return o.alvos && grupo > 0 ? (o.alvos[grupo - 1] ?? o) : o;
}

/** Ponto seguro para nascer dentro de uma caixa: centro no plano, chão da
 *  coluna (findSpawnY = primeira célula de ar — nunca dentro de um bloco). */
export function destinoNaCaixa(ses: GameSession, box: Box): { x: number; y: number; z: number } {
  const cx = Math.floor((box.min.x + box.max.x) / 2);
  const cz = Math.floor((box.min.z + box.max.z) / 2);
  return { x: cx + 0.5, y: findSpawnY(ses.world, cx, cz), z: cz + 0.5 };
}

/** `/tp grupos`: leva os alunos conectados de cada grupo à área do seu objetivo. */
/** Id do cliente ONLINE com este nome (identidade = nome, igual roster). */
export function clientePorNome(ses: GameSession, nome: string): number | null {
  for (const [id, p] of ses.players) if (p.name === nome) return id;
  return null;
}

/** `/tp nome` = professor vai até o jogador; `/tp nome x y z` = envia o
 *  jogador (~ copia a SUA coordenada — a de QUEM digita, convenção Minecraft:
 *  ~ é relativo a quem executa). Teleoperação do professor: sem pedido, sem aceite. */
export function runTp(ses: GameSession, clientId: number, parts: string[]): string {
  const nome = parts[1];
  if (!nome || (parts.length !== 2 && parts.length !== 5)) {
    return "Uso: /tp grupos · /tp nome (ir até o jogador) · /tp nome x y z (enviar o jogador; ~ copia a SUA coordenada).";
  }
  const alvoId = clientePorNome(ses, nome);
  const alvo = alvoId === null ? undefined : ses.players.get(alvoId);
  if (alvoId === null || !alvo) return `"${nome}" não está no mundo agora.`;
  if (parts.length === 2) {
    if (alvoId === clientId) return "Você já está aí.";
    teleportar(ses, clientId, alvo.x, alvo.y, alvo.z);
    return `Teleportado até ${nome}.`;
  }
  // ~ é relativo a QUEM DIGITA (o professor), não ao teleportado — igual ao
  // Minecraft (~ = posição de quem executa o comando).
  const autor = ses.players.get(clientId);
  if (!autor) return "Entre no mundo antes de usar /tp.";
  const base = { x: Math.floor(autor.x), y: Math.floor(autor.y), z: Math.floor(autor.z) };
  const x = parseCoordArg(parts[2], base.x);
  const y = parseCoordArg(parts[3], base.y);
  const z = parseCoordArg(parts[4], base.z);
  if (x === null || y === null || z === null) {
    return "Não entendi as coordenadas. Use números inteiros, ~ (a sua coordenada) ou ~n.";
  }
  if (!inBounds(ses.world, x, y, z)) return `As coordenadas (${x}, ${y}, ${z}) estão fora do mundo.`;
  teleportar(ses, alvoId, x + 0.5, y, z + 0.5);
  if (alvoId !== clientId) ses.sendServerChat(alvoId, "O professor teleportou você.");
  return `${nome} foi teleportado para (${x}, ${y}, ${z}).`;
}

/** `/tpr nome` (todos): pede para se teleportar até o jogador — ele aceita
 *  com /tpa. Um pedido por solicitante (o novo substitui o antigo). */
export function runTpr(ses: GameSession, clientId: number, parts: string[]): string {
  const nome = parts[1];
  if (parts.length !== 2 || !nome) {
    return "Uso: /tpr nome — pede para se teleportar até o jogador; ele aceita com /tpa.";
  }
  const de = ses.players.get(clientId);
  if (!de) return "Entre no mundo antes de pedir teleporte.";
  const alvoId = clientePorNome(ses, nome);
  if (alvoId === null) return `"${nome}" não está no mundo agora.`;
  if (alvoId === clientId) return "Você já está aí.";
  const fila = (ses.tpPedidos.get(alvoId) ?? []).filter((p) => p.deId !== clientId);
  fila.push({ deId: clientId, deNome: de.name, expira: ses.now() + TP_PEDIDO_MS });
  ses.tpPedidos.set(alvoId, fila);
  ses.sendServerChat(
    alvoId,
    `${de.name} quer se teleportar até você. Digite /tpa para aceitar — o pedido expira em ${TP_PEDIDO_MS / 1000} segundos.`,
  );
  return `Pedido enviado a ${nome}. Ele tem ${TP_PEDIDO_MS / 1000} segundos para aceitar com /tpa.`;
}

/** `/tpa [nome]`: aceita o pedido de teleporte mais recente (ou o de `nome`). */
export function runTpa(ses: GameSession, clientId: number, parts: string[]): string {
  if (parts.length > 2) return "Uso: /tpa (aceita o pedido mais recente) ou /tpa nome.";
  const eu = ses.players.get(clientId);
  if (!eu) return "Entre no mundo antes.";
  const agora = ses.now();
  // poda: pedidos expirados ou de quem já saiu do mundo
  const fila = (ses.tpPedidos.get(clientId) ?? []).filter(
    (p) => p.expira > agora && ses.players.has(p.deId),
  );
  const nome = parts[1];
  const pedido = nome ? fila.find((p) => p.deNome === nome) : fila.at(-1);
  if (!pedido) {
    ses.tpPedidos.set(clientId, fila);
    return nome
      ? `Não há pedido de teleporte de "${nome}" — pode ter expirado (o prazo é de ${TP_PEDIDO_MS / 1000} segundos).`
      : `Não há pedido de teleporte pendente. Peça com /tpr nome (o pedido dura ${TP_PEDIDO_MS / 1000} segundos).`;
  }
  ses.tpPedidos.set(clientId, fila.filter((p) => p !== pedido));
  teleportar(ses, pedido.deId, eu.x, eu.y, eu.z);
  ses.sendServerChat(pedido.deId, `${eu.name} aceitou: você foi teleportado.`);
  return `Você aceitou o pedido de ${pedido.deNome}.`;
}

export function teleportarGrupos(ses: GameSession): string {
  if (ses.grupos.size === 0) {
    return "Não há grupos. Crie-os com /grupo criar n antes de teleportar.";
  }
  if (ses.scenario.objetivos.length === 0) {
    return "Não há objetivos com áreas definidas — nada para onde levar os grupos.";
  }
  let movidos = 0;
  let semArea = 0;
  for (const [g, membros] of ses.grupos) {
    const box = areaDoGrupo(ses, g);
    if (!box) {
      semArea++;
      continue;
    }
    const d = destinoNaCaixa(ses, box);
    for (const [clientId, p] of ses.players) {
      if (p.papel === "aluno" && membros.has(p.name)) {
        teleportar(ses, clientId, d.x, d.y, d.z);
        movidos++;
      }
    }
  }
  if (movidos === 0) return "Nenhum aluno dos grupos está conectado para teleportar.";
  return (
    `${movidos} aluno(s) levado(s) para a área do seu grupo.` +
    (semArea > 0 ? ` ${semArea} grupo(s) ficaram sem área definida.` : "")
  );
}

/**
 * `/iniciar [n [alunos]]`: macro de abertura da atividade num comando só —
 * (opcional) recria os grupos com os alunos online, zera o progresso e leva
 * cada grupo para a sua área. Sem o número, mantém os grupos como estão.
 */
export function runIniciar(ses: GameSession, clientId: number, parts: string[]): string {
  const etapas: string[] = [];
  if (parts[1] !== undefined) {
    const args =
      parts[2] !== undefined
        ? ["grupo", "criar", parts[1], parts[2]]
        : ["grupo", "criar", parts[1]];
    const r = runGrupo(ses, clientId, args);
    if (!r.startsWith("grupos:")) return `Não consegui criar os grupos — ${r}`;
    etapas.push("grupos formados");
  }
  // zera o progresso E restaura as áreas ao estado autoral (a faixa volta às
  // sementes — sem isto o mundo ficaria com o que os alunos construíram)
  const repostos = zerarProgresso(ses);
  etapas.push(repostos > 0 ? `áreas restauradas (${repostos} bloco(s))` : "progresso zerado");
  etapas.push(teleportarGrupos(ses));
  ses.broadcast({
    type: "chat",
    author: "servidor",
    text: "A atividade começou! Confira o objetivo no canto da tela.",
  });
  return `Atividade iniciada: ${etapas.join(" · ")}.`;
}
