import { copyFileSync, existsSync } from "node:fs";

/**
 * Conversão AUTOMÁTICA dos saves de antes dos ids de 16 bits (2026-09-12).
 *
 * Não existe passo manual: o `decodeSave` lê os formatos antigos (LJW0 dentro
 * de LJS1, LJS2) e marca `legado`; o host só precisa gravar de novo, e o
 * `encodeSave` já escreve o formato novo. O que ESTE arquivo acrescenta é a
 * rede de segurança: antes da primeira gravação por cima de um save antigo,
 * guarda o original intacto ao lado — `<nome>.antes-ids16.ljw`, na mesma pasta
 * do mundo. A lista de mundos (host e launchers) só enxerga
 * `mundos/<nome>/<nome>.ljw`, então a cópia não aparece como mundo novo.
 *
 * Só vale pra CÓPIA VIVA (o arquivo que o autosave sobrescreve). Modelo de
 * `cenarios/` é distribuído e nunca é escrito; mundo de aula é só leitura —
 * os dois continuam no formato antigo e são lidos igual, pra sempre.
 *
 * Devolve o caminho da cópia, ou `null` se ela já existia (conversão já feita
 * numa subida anterior que caiu antes de gravar — não sobrescreve o original).
 */
export function guardarOriginalAntesDeConverter(caminhoDoSave: string): string | null {
  const destino = `${caminhoDoSave.replace(/\.ljw$/i, "")}.antes-ids16.ljw`;
  if (existsSync(destino)) return null;
  copyFileSync(caminhoDoSave, destino);
  return destino;
}
