import { BlockId } from "./blocks";
import { getBlock } from "./world";
import type { GameSession } from "./session";

/**
 * §🔨 v2 — **ajuda de TESTE**: segura o botão até o bloco cair.
 *
 * Existe porque a v2 mudou o gesto: em sobrevivência, quebrar deixou de ser uma
 * mensagem e virou um cronômetro contado no servidor (`session/quebra.ts`).
 * Cada teste que antes mandava `break_block` e conferia o mundo na linha
 * seguinte agora precisa ARMAR e deixar o tempo passar — escrever esse laço em
 * 7 arquivos seria a receita pra eles divergirem.
 *
 * Devolve `true` se a célula ficou vazia dentro do orçamento de ticks. `false`
 * é resposta legítima (a quebra foi recusada), e é o que os testes de recusa
 * conferem.
 */
export function segurarAteQuebrar(
  ses: GameSession,
  clientId: number,
  c: { x: number; y: number; z: number },
  slot?: number,
  maxTicks = 400,
): boolean {
  ses.handleMessage(
    clientId,
    JSON.stringify({ type: "break_start", ...c, ...(slot === undefined ? {} : { slot }) }),
  );
  for (let i = 0; i < maxTicks; i++) {
    if (getBlock(ses.world, c.x, c.y, c.z) === BlockId.Air) return true;
    ses.tick();
  }
  return getBlock(ses.world, c.x, c.y, c.z) === BlockId.Air;
}
