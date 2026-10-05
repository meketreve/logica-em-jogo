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
/**
 * Logs do mundo: mundos/<nome>/logs/ — uma PASTA, um par de arquivos por
 * SESSÃO do host (2026-10-05).
 *
 * Antes era um `chat.log` único e append-only por mundo, e ele crescia sem
 * fim: o maior aqui chegou a 344 KB / 2434 linhas, que não abre num editor de
 * texto pra procurar o que a turma falou numa terça.
 *
 * E o tamanho era só o sintoma. Medido, **2434 das 2434 linhas eram do
 * `servidor:`** — zero de aluno. O que enchia era mensagem de SISTEMA repetida
 * a cada entrada no jogo (335× "Você entrou no grupo 1", 189× o banner de
 * boas-vindas com a lista inteira de comandos), e tablet que minimiza
 * reconecta o tempo todo (é o cenário do bug-672). Por isso a sessão grava
 * DOIS arquivos: `-chat.log` é só fala de gente (fica minúsculo e é o que o
 * professor quer ler) e `-eventos.log` é só o que o servidor disse. O
 * discriminador é exato, não heurística de texto: `sendServerChat` carimba
 * `author: "servidor"` num lugar só.
 *
 * Os dois nascem PREGUIÇOSAMENTE (só na primeira linha), então aula em que
 * ninguém falou não deixa arquivo vazio pra trás.
 */
export const pastaDeLogsDoMundo = (nome: string): string =>
  resolve(pastaDoMundo(nome), "logs");

/**
 * Carimbo da sessão do host: "AAAA-MM-DD_HH-MM", em horário **LOCAL**.
 *
 * Local e não UTC de propósito: quem lê este nome é o professor procurando a
 * aula das 14:30, e `toISOString()` a chamaria de 17-30 no Brasil. Ordena
 * sozinho no explorador de arquivos porque começa pela data.
 */
export function carimboDeSessao(d: Date = new Date()): string {
  const p = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}`;
}

/** Hora local "HH:MM:SS" de uma linha — a DATA já está no nome do arquivo. */
export function horaDaLinha(d: Date = new Date()): string {
  const p = (n: number): string => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** Os dois arquivos desta sessão, na pasta de logs do mundo em vigor. */
export function logsDaSessao(nome: string, carimbo: string): { chat: string; eventos: string } {
  const dir = pastaDeLogsDoMundo(nome);
  return { chat: resolve(dir, `${carimbo}-chat.log`), eventos: resolve(dir, `${carimbo}-eventos.log`) };
}

/**
 * Um cenário é MODELO, não save. Hospedar `cenarios/aula1.ljw` direto faria o
 * autosave gravar a turma (roster, PINs, progresso) dentro do arquivo que você
 * distribui — e a próxima turma começaria com a aula da anterior já resolvida.
 *
 * Então: cada mundo escolhido vira uma pasta própria em mundos/<nome>/ com o
 * save (<nome>.ljw) e a pasta logs/. Um cenário de cenarios/ semeia
 * essa pasta na primeira vez; a cópia viva vence o modelo depois (turma
 * continuando). Para recomeçar do zero, apague a pasta do mundo em mundos/.
 */
export function mundoDeTrabalho(escolhido: string): {
  vivo: string;
  modelo?: string;
  somenteLeitura: boolean;
  /** Nome do mundo: é com ele que o host monta `logsDaSessao`. */
  nome: string;
} {
  const alvo = daRaiz(escolhido);
  const nome = nomeDoMundo(alvo);
  const somenteLeitura = ehMundoDeAula(alvo);
  const vivo = savePathDoMundo(nome);
  // cenarios/ é MODELO (nunca escrito): a cópia viva nasce na pasta do mundo.
  if (dirname(alvo) === PASTA_CENARIOS) return { vivo, modelo: alvo, somenteLeitura, nome };
  return { vivo, somenteLeitura, nome };
}

/**
 * Mundos de AULA (lição) são REUTILIZÁVEIS: começam sempre do modelo e nunca
 * salvam a turma. Assim a próxima turma reaproveita a mesma aula sem o professor
 * mover ou apagar arquivos. Chave = nome do arquivo começa com "aula".
 */
export function ehMundoDeAula(caminho: string): boolean {
  return /^aula/i.test(basename(caminho));
}
