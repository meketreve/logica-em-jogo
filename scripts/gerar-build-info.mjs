#!/usr/bin/env node
/**
 * GERA `shared/src/build-info.json` (2026-08-27).
 *
 * Substitui o `npm version` como fonte do rótulo mostrado em tela. Motivo:
 * este projeto não tem executável nem artefato de release — o launcher da
 * escola atualiza comparando COMMIT (`iniciar-servidor.sh`, API do GitHub),
 * nunca número de versão. `npm version` virou ritual sem função técnica
 * nenhuma; o rótulo que o jogador vê (rodapé do menu, log do servidor, topo
 * do changelog) passa a ser DATA + COMMIT curto, que é o que já decide se
 * "está atualizado" de verdade.
 *
 * Roda ANTES de `npm run build`/`npm run dev` (ver package.json da raiz).
 * O JSON gerado é COMMITADO, mesma disciplina do `client/dist`: uma pasta
 * clonada e nunca "buildada" ainda precisa de algo importável — o valor fica
 * um commit desatualizado (o próprio ato de commitar muda o sha do HEAD),
 * e isso é esperado, não um bug — é a mesma imprecisão de qualquer rótulo de
 * build auto-referente.
 */
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const git = (...args) =>
  execFileSync("git", args, { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

let data = "0000-00-00";
let commit = "sem-git";
try {
  if (git("rev-parse", "--is-inside-work-tree") === "true") {
    data = git("log", "-1", "--date=short", "--format=%ad");
    commit = git("rev-parse", "--short", "HEAD");
  }
} catch {
  // sem git, ou pasta que não é repositório — mantém o placeholder
}

const destino = join(RAIZ, "shared", "src", "build-info.json");
writeFileSync(destino, JSON.stringify({ data, commit }, null, 2) + "\n");
console.log(`build-info: ${data} · ${commit}`);
