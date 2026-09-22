import { HEARTBEAT_PING_MS, HEARTBEAT_TIMEOUT_MS } from "../constants";
import { type ServerMessage } from "../protocol";
import type { GameSession } from "../session";

/**
 * PRESENÇA — "você ainda está aí?" (bug-672, 2026-09-22).
 *
 * A queixa da escola: no tablet, minimizar ou fechar o navegador nem sempre
 * fecha o socket. O aparelho congela a aba e o TCP fica meio aberto; pro
 * servidor o aluno continua em jogo, e como o `join` recusa nome repetido
 * ("Já existe alguém em jogo com o nome X"), a própria criança fica trancada
 * do lado de fora até o socket morrer sozinho — o que pode levar minutos.
 *
 * O desenho é o mais simples que resolve:
 *
 *   a cada `HEARTBEAT_PING_MS` o servidor manda `ping` a quem está em jogo →
 *   QUALQUER mensagem de volta conta como sinal de vida (o `pong`, mas também
 *   um `move`, um chat, uma quebra) → quem passar `HEARTBEAT_TIMEOUT_MS` sem
 *   dar sinal é DESCONECTADO: sai da lista de jogadores (o nome fica livre na
 *   hora) e o hospedeiro fecha o socket pelo `aoDerrubar`.
 *
 * **Por que não o ping do próprio WebSocket:** aquele é respondido pela pilha
 * de rede do aparelho, sem JavaScript nenhum rodando — ele responderia "vivo"
 * exatamente no caso que este módulo existe pra pegar (aba congelada). Este
 * `ping` só volta se o cliente estiver de fato executando.
 *
 * **Singleplayer fica de fora.** Lá o "servidor" é um Web Worker dentro da
 * mesma página: quando o aluno troca de aba, o navegador estrangula a página e
 * o worker pode continuar contando — derrubar alguém do MUNDO DELE MESMO por
 * ter olhado outra aba seria inventar um problema que não existe. Sem contar
 * que não há nome pra liberar: a sessão tem um jogador só.
 */

/** Chegou mensagem deste cliente — ele está vivo AGORA. */
export function marcarSinal(ses: GameSession, clientId: number): void {
  ses.ultimoSinal.set(clientId, ses.now());
}

/** Quem saiu não precisa mais ser vigiado. */
export function esquecerSinal(ses: GameSession, clientId: number): void {
  ses.ultimoSinal.delete(clientId);
}

/**
 * Um passo da vigília, chamado a cada tick. Manda os `ping` da vez e derruba
 * quem ficou em silêncio tempo demais.
 *
 * ⚠️ A lista de quem derrubar é montada ANTES de derrubar: `handleDisconnect`
 * mexe em `players` (e em mais uma dúzia de mapas), e iterar um mapa enquanto
 * ele encolhe é o jeito clássico de pular um elemento.
 */
export function tickPresenca(ses: GameSession): void {
  if (ses.singleplayer) return;
  const agora = ses.now();

  const mortos: number[] = [];
  for (const clientId of ses.players.keys()) {
    // quem nunca deu sinal começa a contar do join (o `admitir` carimba)
    const ultimo = ses.ultimoSinal.get(clientId) ?? agora;
    if (agora - ultimo >= HEARTBEAT_TIMEOUT_MS) mortos.push(clientId);
  }
  for (const clientId of mortos) derrubar(ses, clientId);

  if (agora - ses.ultimoPing < HEARTBEAT_PING_MS) return;
  ses.ultimoPing = agora;
  for (const clientId of ses.players.keys()) {
    ses.send(clientId, JSON.stringify({ type: "ping", t: agora } satisfies ServerMessage));
  }
}

/**
 * Tira o jogador da sessão por silêncio: o nome fica livre IMEDIATAMENTE (é o
 * ponto do conserto) e o hospedeiro fecha o socket meio-aberto.
 *
 * Os outros alunos veem a saída normal, pelo `handleDisconnect` — pra turma é
 * igual a alguém ter fechado a página, que é justamente o que aconteceu.
 */
function derrubar(ses: GameSession, clientId: number): void {
  ses.handleDisconnect(clientId);
  esquecerSinal(ses, clientId);
  // quem fecha socket (e quem escreve no console do professor) é o hospedeiro:
  // a sessão não conhece transporte nenhum
  ses.aoDerrubar?.(clientId);
}
