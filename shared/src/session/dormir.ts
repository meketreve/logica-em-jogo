/**
 * Dormir na cama para passar a noite (2026-08-17).
 *
 * O clique na cama já definia o PONTO DE NASCIMENTO (2026-08-14); agora ele
 * **também deita**, no mesmo gesto — decisão do usuário. Não há tecla nova nem
 * comando: o rótulo ▣ "interagir" já cobre cama desde a sessão 71.
 *
 * Quem decide a passagem da noite é a MAIORIA DOS ACORDADOS. Os dois extremos
 * são ruins numa sala: "um basta" vira brincadeira (um aluno pula todas as
 * noites), e "todos" nunca acontece com 30 crianças — basta uma distraída.
 *
 * ⚠️ **Mundo de aula fica inerte de graça:** ele nasce com `/ciclo desligar`
 * (`gerar.ts`), e sem ciclo não há noite para passar. O gate do `cicloAtivo` é
 * o que evita a mecânica aparecer onde ela não faz sentido.
 *
 * A passagem NÃO é um corte: liga um multiplicador no MESMO avanço de
 * `horaDoDia` que o tick já faz, então o céu gira à vista de todos — inclusive
 * de quem não dormiu — e a mensagem `time` que já existe carrega tudo. Zero
 * estado de transição no cliente.
 */
import { isCama } from "../blocks";
import type { GameSession } from "../session";

/** Início da noite (hora do dia). Bate com o preset `/hora noite`. */
export const NOITE_INICIO = 21;
/** Fim da noite = amanhecer. Bate com o preset `/hora amanhecer`. */
export const NOITE_FIM = 6;

/** Quantas vezes o tempo corre enquanto a turma dorme. 120× leva a noite de
 *  9 h em ~2 s reais com o DIA_SEGUNDOS padrão — dá para ver o céu girar sem
 *  virar espera. */
export const PULO_NOITE_FATOR = 120;

/** É noite agora? (janela circular: 21h→6h atravessa a meia-noite.) */
export function ehNoite(hora: number): boolean {
  return hora >= NOITE_INICIO || hora < NOITE_FIM;
}

/** Este cliente está deitado? */
export function dormindoAgora(ses: GameSession, clientId: number): boolean {
  return ses.dormindo.has(clientId);
}

/**
 * Tenta deitar na cama daquela célula. Devolve a frase para o jogador, ou
 * `null` quando não há nada a dizer além do que o chamador já disse.
 *
 * O chamador (o ramo `isCama` do `use_block`) já validou alcance, claim e
 * confinamento, e já gravou o ponto de nascimento — aqui só entra o deitar.
 */
export function tentarDormir(
  ses: GameSession,
  clientId: number,
  x: number,
  y: number,
  z: number,
): string | null {
  if (!ses.cicloAtivo) return null; // mundo de aula: não há noite passando
  if (!ehNoite(ses.horaDoDia)) return "Só dá para dormir à noite.";
  if (ses.dormindo.has(clientId)) return null;
  for (const [outro, cama] of ses.dormindo) {
    if (outro !== clientId && cama.x === x && cama.y === y && cama.z === z) {
      return "Esta cama já está ocupada.";
    }
  }
  ses.dormindo.set(clientId, { x, y, z });
  avisarPose(ses, clientId);
  const nome = ses.players.get(clientId)?.name ?? "alguém";
  const { dormem, acordados } = contagem(ses);
  ses.broadcast({
    type: "chat",
    author: "servidor",
    text: `${nome} foi dormir (${dormem}/${acordados}).`,
  });
  reavaliar(ses);
  return null;
}

/** Tira o jogador da cama. `motivo` vazio = sem aviso (saída, amanhecer). */
export function acordar(ses: GameSession, clientId: number): void {
  if (!ses.dormindo.delete(clientId)) return;
  avisarPose(ses, clientId);
  reavaliar(ses);
}

/** Acorda TODO mundo (amanheceu) e desliga o pulo. */
export function acordarTodos(ses: GameSession): void {
  const ids = [...ses.dormindo.keys()];
  ses.dormindo.clear();
  ses.pulandoNoite = false;
  for (const id of ids) avisarPose(ses, id);
}

/**
 * Chamado pelo `move`: sair de cima da cama acorda. Compara a célula dos pés
 * com a cama guardada — mexer o olhar não acorda, andar acorda.
 */
export function acordarSeSaiu(ses: GameSession, clientId: number, x: number, y: number, z: number): void {
  const cama = ses.dormindo.get(clientId);
  if (!cama) return;
  const perto =
    Math.abs(Math.floor(x) - cama.x) <= 1 &&
    Math.abs(Math.floor(z) - cama.z) <= 1 &&
    Math.abs(Math.floor(y) - cama.y) <= 1;
  if (!perto) acordar(ses, clientId);
}

/** Quantos dormem e quantos estão online. */
function contagem(ses: GameSession): { dormem: number; acordados: number } {
  return { dormem: ses.dormindo.size, acordados: ses.players.size };
}

/**
 * Decide se a noite deve começar a passar. MAIORIA ESTRITA dos online:
 * `dormem * 2 > online`. Reavaliado a cada entrada/saída da cama e a cada
 * desconexão — sair do mundo pode COMPLETAR a maioria, e travar a noite porque
 * alguém fechou a aba seria o defeito da regra "todos".
 */
export function reavaliar(ses: GameSession): void {
  const { dormem, acordados } = contagem(ses);
  const maioria = acordados > 0 && dormem * 2 > acordados;
  if (maioria && !ses.pulandoNoite && ehNoite(ses.horaDoDia)) {
    ses.pulandoNoite = true;
    ses.broadcast({ type: "chat", author: "servidor", text: "A noite está passando…" });
  } else if (!maioria && ses.pulandoNoite) {
    // alguém levantou antes do amanhecer: para de correr
    ses.pulandoNoite = false;
  }
}

/**
 * Roda no tick, DEPOIS de `horaDoDia` avançar. Desliga o pulo e acorda todo
 * mundo quando o dia chega.
 */
export function tickDormir(ses: GameSession): void {
  if (!ses.pulandoNoite) return;
  if (!ehNoite(ses.horaDoDia)) {
    acordarTodos(ses);
    ses.broadcast({ type: "chat", author: "servidor", text: "Amanheceu." });
  }
}

/** Célula da cama do jogador (para o cliente deitar a câmera/o boneco). */
export function camaDe(ses: GameSession, clientId: number): { x: number; y: number; z: number } | undefined {
  return ses.dormindo.get(clientId);
}

/** A pose mudou de em-pé para deitada (ou o contrário): reemite o
 *  `player_moved` para os OUTROS, com a flag. */
function avisarPose(ses: GameSession, clientId: number): void {
  const p = ses.players.get(clientId);
  if (!p) return;
  ses.broadcastExcept(clientId, {
    type: "player_moved",
    id: clientId,
    x: p.x, y: p.y, z: p.z,
    yaw: p.yaw, pitch: p.pitch,
    name: p.name,
    ...(ses.dormindo.has(clientId) ? { dormindo: true } : {}),
  });
  // e o próprio autor precisa saber que deitou/levantou
  ses.send(
    clientId,
    JSON.stringify({ type: "dormindo", dormindo: ses.dormindo.has(clientId), cama: ses.dormindo.get(clientId) }),
  );
}

/** Guarda de sanidade usada pelo `use_block`: a célula é mesmo uma cama? */
export function ehCama(id: number): boolean {
  return isCama(id);
}
