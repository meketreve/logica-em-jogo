import type { ServerMessage } from "../protocol";
import type { GameSession } from "../session";

/**
 * `/invisivel` (2026-08-22) — o professor some do corpo dos ALUNOS, para
 * observar a turma trabalhando sem virar atração.
 *
 * ⚠️ **A decisão que define a feature: a filtragem é do SERVIDOR, por cliente.**
 * Se o cliente é que escondesse, a posição do professor continuaria viajando no
 * fio e um aluno curioso a leria no devtools. Então o que some é a MENSAGEM, em
 * `broadcastPose` (`session.ts`), e não o desenho.
 *
 * O que NÃO some (decisão do usuário, 2026-08-22): chat, blocos colocados e
 * som. `block_changed` não carrega autor, então bloco não denuncia identidade;
 * o painel `P` (`broadcastPlayers`) já era só-professor.
 *
 * Estado de SESSÃO, como o `spawnCama`: morre no `handleDisconnect`, não vai
 * pro save, e quem cai e volta volta visível.
 */

/** Vira FANTASMA junto (decisão do usuário): sem isto ele fica preso na parede
 *  e a sala vira assombração — três portões do servidor consultam isto.
 *  1. `move` (`session.ts`) não rejeita o passo pra dentro de sólido;
 *  2. `tickVitais` não conta soterramento (nem dano nem resgate);
 *  3. `overlapsAnyPlayer` o ignora, senão o aluno leva recusa SILENCIOSA ao
 *     colocar bloco num vazio aparente. */
export function ehFantasma(ses: GameSession, clientId: number): boolean {
  return ses.invisiveis.has(clientId);
}

export function sendInvisivel(ses: GameSession, clientId: number): void {
  ses.send(
    clientId,
    JSON.stringify({
      type: "invisivel",
      ativo: ses.invisiveis.has(clientId),
    } satisfies ServerMessage),
  );
}

/** `/invisivel`: alterna. Sem argumento porque é o único modo de uso — o
 *  professor liga pra observar e desliga pra voltar a existir. */
export function runInvisivel(ses: GameSession, clientId: number): string {
  const ligando = !ses.invisiveis.has(clientId);
  if (ligando) ses.invisiveis.add(clientId);
  else ses.invisiveis.delete(clientId);
  sendInvisivel(ses, clientId);

  const p = ses.players.get(clientId);
  if (p) {
    for (const [outroId, outro] of ses.players) {
      if (outroId === clientId || outro.papel === "professor") continue;
      if (ligando) {
        // ⚠️ sem o `player_left` a caixa dele CONGELA na tela do aluno, onde
        // estava — pior que continuar visível.
        ses.send(outroId, JSON.stringify({ type: "player_left", id: clientId } satisfies ServerMessage));
      } else {
        // ⚠️ e sem a pose de volta ele só reapareceria no próximo `move`: quem
        // está parado observando nunca manda um, e ficaria invisível pra sempre.
        ses.send(
          outroId,
          JSON.stringify({
            type: "player_moved",
            id: clientId,
            x: p.x, y: p.y, z: p.z,
            yaw: p.yaw, pitch: p.pitch,
            name: p.name,
          } satisfies ServerMessage),
        );
      }
    }
  }

  return ligando
    ? "Você está invisível para os alunos (outros professores continuam vendo você) e atravessa paredes. Digite /invisivel de novo para voltar."
    : "Você está visível de novo para a turma.";
}
