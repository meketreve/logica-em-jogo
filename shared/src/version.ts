/**
 * Versão do jogo — FONTE ÚNICA = campo "version" do package.json da raiz.
 * Suba com `npm version patch|minor|major` (bumpa o package.json e faz o commit
 * + tag git). Importada como named export do JSON: o bundler faz tree-shake, o
 * resto do package.json NÃO entra no bundle do cliente. Roda igual no navegador
 * (Vite), no Node do servidor (tsx) e nos testes (vitest).
 */
import { version } from "../../package.json";

export const VERSION: string = version;

/**
 * Rótulo de uma entrada da tela "📜 novidades" (`client/src/changelog.ts`).
 *
 * ⚠️ **A entrada do topo NÃO leva número escrito à mão.** Ela é sempre a
 * release atual, e o número sai daqui — do `package.json`. O motivo é
 * cicatriz: o bloco do topo ficou rotulado "recém-chegado" por 12 versões de
 * trabalho, porque nada obrigava ninguém a trocá-lo, e com o launcher se
 * atualizando sozinho na escola o professor via "recém-chegado" pra sempre.
 * Com isto, um `npm version` relabela a tela sozinho.
 *
 * Entrada HISTÓRICA passa o número que já tinha e o mantém — o passado é fixo.
 */
export function rotuloDeVersao(versao?: string): string {
  return versao ?? `v${VERSION}`;
}
