import { basename, dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * `npm run <script> -w server` roda com o cwd dentro de server/, então caminho
 * relativo digitado pelo professor (LJ_SAVE=cenarios/aula1.ljw) NÃO cai onde ele
 * espera. Todo caminho relativo do servidor é resolvido a partir da RAIZ do repo.
 */
export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export const daRaiz = (caminho: string): string =>
  isAbsolute(caminho) ? caminho : resolve(REPO_ROOT, caminho);

/** Modelos gerados por `npm run cenarios`. O servidor NUNCA escreve aqui. */
export const PASTA_CENARIOS = daRaiz("cenarios");
/** Mundos vivos: o que a turma construiu (mundo livre + cópias de trabalho das
 *  aulas). É aqui que o autosave grava e de onde o launcher carrega saves. */
export const PASTA_MUNDOS = daRaiz("mundos");
/** Relatórios do profiler (HUD F3 → "enviar pro servidor"): diagnóstico de
 *  vários dispositivos, não save de mundo. */
export const PASTA_PROFILES = daRaiz("profiles");

/** Nome do mundo (sem extensão .ljw) a partir de um caminho ou nome escolhido. */
export const nomeDoMundo = (escolhido: string): string =>
  basename(escolhido).replace(/\.ljw$/i, "");

/** Cada mundo mora na SUA pasta: mundos/<nome>/. Guarda o save e o log do chat. */
export const pastaDoMundo = (nome: string): string => resolve(PASTA_MUNDOS, nome);
/** Save do mundo: mundos/<nome>/<nome>.ljw. */
export const savePathDoMundo = (nome: string): string =>
  resolve(pastaDoMundo(nome), `${nome}.ljw`);
/** Log de chat do mundo: mundos/<nome>/chat.log (append-only, escrito pelo host). */
export const chatLogDoMundo = (nome: string): string =>
  resolve(pastaDoMundo(nome), "chat.log");

/**
 * Um cenário é MODELO, não save. Hospedar `cenarios/aula1.ljw` direto faria o
 * autosave gravar a turma (roster, PINs, progresso) dentro do arquivo que você
 * distribui — e a próxima turma começaria com a aula da anterior já resolvida.
 *
 * Então: cada mundo escolhido vira uma pasta própria em mundos/<nome>/ com o
 * save (<nome>.ljw) e o log do chat (chat.log). Um cenário de cenarios/ semeia
 * essa pasta na primeira vez; a cópia viva vence o modelo depois (turma
 * continuando). Para recomeçar do zero, apague a pasta do mundo em mundos/.
 */
export function mundoDeTrabalho(escolhido: string): {
  vivo: string;
  modelo?: string;
  somenteLeitura: boolean;
  chatLog: string;
} {
  const alvo = daRaiz(escolhido);
  const nome = nomeDoMundo(alvo);
  const somenteLeitura = ehMundoDeAula(alvo);
  const vivo = savePathDoMundo(nome);
  const chatLog = chatLogDoMundo(nome);
  // cenarios/ é MODELO (nunca escrito): a cópia viva nasce na pasta do mundo.
  if (dirname(alvo) === PASTA_CENARIOS) return { vivo, modelo: alvo, somenteLeitura, chatLog };
  return { vivo, somenteLeitura, chatLog };
}

/**
 * Mundos de AULA (lição) são REUTILIZÁVEIS: começam sempre do modelo e nunca
 * salvam a turma. Assim a próxima turma reaproveita a mesma aula sem o professor
 * mover ou apagar arquivos. Chave = nome do arquivo começa com "aula".
 */
export function ehMundoDeAula(caminho: string): boolean {
  return /^aula/i.test(basename(caminho));
}
