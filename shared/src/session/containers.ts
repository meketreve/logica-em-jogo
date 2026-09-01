import { getBlock } from "../world";
import { isFornalha, fornalhaComEstado } from "../blocks";
import {
  type Container,
  type ContainerSalvo,
  containerKey,
  containerParaSave,
  containerTemConteudo,
  containerTipoDe,
  containerVazio,
} from "../containers";
import { fornalhaAcesa, tickFornalha } from "../fornalha";
import { type ServerMessage } from "../protocol";
import { avisarComFreio } from "./avisos";
import type { GameSession } from "../session";

/**
 * §🍖 F10 — containers (fornalha e baú) do lado do SERVIDOR.
 *
 * O que mora aqui: a leitura do conteúdo por célula, o envio pra quem está com
 * o painel aberto, o fechamento e o tick das fornalhas. O que NÃO mora aqui: o
 * encanamento de transferência entre mochila e container, que é lógica pura e
 * vive em `../containers.ts` — este módulo é só a parte que precisa da sessão
 * (mundo, clientes conectados, broadcast).
 */

/**
 * O container daquela célula, ou `null` se a célula não é um. Container
 * ainda sem entrada no mapa nasce VAZIO aqui e **não é guardado**: o mapa só
 * ganha entrada quando alguém põe alguma coisa dentro, e é isso que faz um
 * mundo de aula cheio de baú vazio não pesar no save nem na memória.
 */
export function containerDe(
  ses: GameSession,
  x: number,
  y: number,
  z: number,
  blockId: number,
): Container | null {
  const tipo = containerTipoDe(blockId);
  if (!tipo) return null;
  return ses.containers.get(containerKey(x, y, z)) ?? containerVazio(tipo);
}

/** Os containers que têm ALGUMA coisa dentro, na forma do save. */
export function containersParaSave(ses: GameSession): ContainerSalvo[] {
  const out: ContainerSalvo[] = [];
  for (const [key, c] of ses.containers) {
    if (!containerTemConteudo(c)) continue;
    const [x, y, z] = key.split(",").map(Number) as [number, number, number];
    out.push(containerParaSave(x, y, z, c));
  }
  return out;
}

/** Manda o conteúdo daquela célula pra UM cliente (quem acabou de abrir). */
export function sendContainer(
  ses: GameSession,
  clientId: number,
  x: number,
  y: number,
  z: number,
): void {
  const c = containerDe(ses, x, y, z, getBlock(ses.world, x, y, z));
  if (!c) {
    fecharContainer(ses, clientId);
    return;
  }
  const s = containerParaSave(x, y, z, c);
  const nome = ses.players.get(clientId)?.name;
  ses.send(
    clientId,
    JSON.stringify({
      type: "container",
      x, y, z,
      tipo: s.tipo,
      slots: s.slots,
      ...(s.queimando ? { queimando: s.queimando } : {}),
      ...(s.queimaTotal ? { queimaTotal: s.queimaTotal } : {}),
      ...(s.progresso ? { progresso: s.progresso } : {}),
      ...(c.tipo === "loja"
        ? {
            loja: {
              criador: c.criador,
              precos: [...c.precos].map(([porItem, preco]) => ({ porItem, preco })),
              souOCriador: nome === c.criador,
            },
          }
        : {}),
    } satisfies ServerMessage),
  );
}

/** Manda o conteúdo pra TODOS que estão com aquela célula aberta. É por aqui
 *  que dois alunos no mesmo baú (e o dono que vê a fornalha cozinhando) veem
 *  a mesma coisa. */
export function avisarContainer(ses: GameSession, x: number, y: number, z: number): void {
  for (const [clientId, pos] of ses.containerAberto) {
    if (pos.x === x && pos.y === y && pos.z === z) sendContainer(ses, clientId, x, y, z);
  }
}

/** Fecha o painel deste cliente (bloco quebrou, direito mudou, célula sumiu). */
export function fecharContainer(ses: GameSession, clientId: number): void {
  if (!ses.containerAberto.delete(clientId)) return;
  ses.send(clientId, JSON.stringify({ type: "container_fechado" } satisfies ServerMessage));
}

/** Fecha o painel de TODOS que estão com aquela célula aberta. */
export function fecharContainerEm(ses: GameSession, x: number, y: number, z: number): void {
  for (const [clientId, pos] of [...ses.containerAberto]) {
    if (pos.x === x && pos.y === y && pos.z === z) fecharContainer(ses, clientId);
  }
}

/**
 * Aviso de "tem coisa dentro" com o MESMO freio do "mochila cheia", e pela
 * mesma razão: quebrar é clique repetido, e o aluno que insiste no baú cheio
 * encheria o chat da turma.
 */
export function avisarContainerCheio(ses: GameSession, clientId: number): void {
  avisarComFreio(ses, 
    clientId,
    "Tem coisa aí dentro — esvazie antes de quebrar (o que está guardado não cai no chão).",
  );
}

/**
 * §🍖 F10b: um tick de TODAS as fornalhas. Varre o mapa de containers (que
 * tem dezenas de entradas, não milhões — ver o comentário do campo), pula o
 * que não é fornalha e deixa o `tickFornalha` decidir. Ele devolve o MESMO
 * objeto quando nada muda, e é essa identidade que evita mensagem à toa.
 *
 * Duas coisas saem daqui quando o estado muda: o BYTE do bloco (apagada ↔
 * acesa, que é o que acende a luz e a boca de fogo pra turma inteira) e a
 * mensagem `container` pra quem está com o painel aberto.
 */
export function tickFornalhas(ses: GameSession): void {
  if (ses.containers.size === 0) return;
  for (const [key, antes] of [...ses.containers]) {
    if (antes.tipo !== "fornalha") continue;
    const depois = tickFornalha(antes);
    if (depois === antes) continue;
    const [x, y, z] = key.split(",").map(Number) as [number, number, number];
    if (containerTemConteudo(depois)) ses.containers.set(key, depois);
    else ses.containers.delete(key); // fornalha que esvaziou volta a não custar nada
    if (fornalhaAcesa(depois) !== fornalhaAcesa(antes)) {
      // só troca o byte se a célula AINDA é fornalha (o bloco pode ter sido
      // quebrado neste mesmo tick por outro caminho). O id novo sai do id
      // VELHO, e não de uma constante: desde o refino da frente, acender uma
      // fornalha virada pro leste com `BlockId.FornalhaAcesa` a giraria pro
      // norte na frente da turma.
      const atual = getBlock(ses.world, x, y, z);
      if (isFornalha(atual)) {
        ses.applyBlock(x, y, z, fornalhaComEstado(atual, fornalhaAcesa(depois)));
      }
    }
    avisarContainer(ses, x, y, z);
  }
}
