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
/** Mundos vivos: o que a turma construiu. É aqui que o autosave grava. */
export const PASTA_AULAS = daRaiz("aulas");

/**
 * Um cenário é MODELO, não save. Hospedar `cenarios/aula1.ljw` direto faria o
 * autosave gravar a turma (roster, PINs, progresso) dentro do arquivo que você
 * distribui — e a próxima turma começaria com a aula da anterior já resolvida.
 *
 * Então: mundo escolhido dentro de cenarios/ vira uma CÓPIA DE TRABALHO em
 * aulas/. Se a cópia já existe, ela vence o modelo — é a turma continuando de
 * onde parou. Para recomeçar do zero, basta apagar o arquivo em aulas/.
 */
export function mundoDeTrabalho(escolhido: string): { vivo: string; modelo?: string } {
  const alvo = daRaiz(escolhido);
  if (dirname(alvo) !== PASTA_CENARIOS) return { vivo: alvo };
  return { vivo: resolve(PASTA_AULAS, basename(alvo)), modelo: alvo };
}
