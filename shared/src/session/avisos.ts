import type { GameSession } from "../session";

/** §🍖 F4: freio do aviso "mochila cheia" (quebrar é clique repetido). */
export const AVISO_MOCHILA_MS = 5_000;

/**
 * Aviso da QUEBRA com FREIO. Quebrar é gesto de clique repetido, e sem teto o
 * chat da aula viraria uma parede de texto igual — um por `AVISO_MOCHILA_MS`
 * por aluno basta pra ele entender e resolver.
 *
 * O freio é UM por jogador, e não um por motivo: quem está com a mochila
 * cheia E sem picareta não precisa levar dois avisos no mesmo instante.
 */
export function avisarComFreio(ses: GameSession, clientId: number, texto: string): void {
  const agora = ses.now();
  const ultimo = ses.avisoMochila.get(clientId) ?? -Infinity;
  if (agora - ultimo < AVISO_MOCHILA_MS) return;
  ses.avisoMochila.set(clientId, agora);
  ses.sendServerChat(clientId, texto);
}
