/**
 * Versão do jogo — FONTE ÚNICA = campo "version" do package.json da raiz.
 * Suba com `npm version patch|minor|major` (bumpa o package.json e faz o commit
 * + tag git). Importada como named export do JSON: o bundler faz tree-shake, o
 * resto do package.json NÃO entra no bundle do cliente. Roda igual no navegador
 * (Vite), no Node do servidor (tsx) e nos testes (vitest).
 */
import { version } from "../../package.json";

export const VERSION: string = version;
