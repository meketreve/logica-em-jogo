import {
  type ContextoVivo,
  type DestinoDeToque,
  type Papel,
  candidatosPara,
  destinoDeToquePara,
} from "@logica/shared";

/**
 * O que só o CLIENTE sabe sobre os comandos: os nomes vivos.
 *
 * A árvore em si — quais comandos existem, quais subcomandos cada um tem e **de
 * quem é cada um** — mora em `shared/src/comandos.ts`, do lado do gate de
 * permissão que é a verdade (`session.ts: runCommand`) e onde `npm test` roda.
 * Aqui ficam só as duas listas que nascem da partida em andamento e o PAPEL de
 * quem está olhando.
 *
 * O cliente NÃO tem sistema de arquivos: os nomes de mundo entram ao vivo, pelo
 * que o professor viu por último em "/mundo lista".
 */
export type { DestinoDeToque };

const vivo: ContextoVivo = { mundos: [], jogadores: [], pedidosTp: [] };

/** Pedidos de teleporte abertos PRA MIM, com a hora em que cada um morre.
 *  O servidor manda o que FALTA do prazo (`emMs`) e não um horário: o relógio
 *  do tablet não bate com o do host. */
let pedidosTp: { de: string; validoAte: number }[] = [];

/** Joga fora o que venceu desde a última mensagem — o host avisa quando a fila
 *  MUDA, não a cada segundo, então quem expira em silêncio é podado aqui. */
function pedidosVivos(): string[] {
  const agora = Date.now();
  pedidosTp = pedidosTp.filter((p) => p.validoAte > agora);
  return pedidosTp.map((p) => p.de);
}

/** Papel de quem está jogando — o `main.ts` carimba no join. Começa como aluno
 *  de propósito: enquanto não se sabe, mostrar comando de professor seria
 *  oferecer ao aluno o que o servidor vai recusar. */
let papelAtual: Papel = "aluno";

/** O cliente memoriza os nomes que o professor viu em /mundo lista. */
export function learnWorlds(nomes: string[]): void {
  vivo.mundos = nomes;
}

/** Quem está online agora — o main.ts alimenta pelo player_moved/player_left. */
export function learnPlayers(nomes: string[]): void {
  vivo.jogadores = nomes;
}

/** Quem pediu teleporte pra mim (msg `tp_pedidos` do servidor). */
export function learnPedidosTp(pedidos: { de: string; emMs: number }[]): void {
  const agora = Date.now();
  pedidosTp = pedidos.map((p) => ({ de: p.de, validoAte: agora + p.emMs }));
}

/** O papel do jogador local (join / troca de aula). */
export function learnPapel(papel: Papel): void {
  papelAtual = papel;
}

/**
 * Candidatos para a palavra que está sendo digitada, dadas as palavras JÁ
 * completas antes dela (a primeira inclui a barra: "/objetivo"). Filtrados pelo
 * PAPEL: o Tab do aluno não oferece o que o servidor recusa dele.
 */
export function candidatos(completos: string[]): string[] {
  vivo.pedidosTp = pedidosVivos();
  return candidatosPara(completos, papelAtual, vivo);
}

/** O que acontece ao TOCAR num nó da árvore (painel de comandos do dedo). */
export function destinoDeToque(caminho: string[]): DestinoDeToque {
  vivo.pedidosTp = pedidosVivos();
  return destinoDeToquePara(caminho, papelAtual, vivo);
}
