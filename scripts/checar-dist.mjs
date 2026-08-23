#!/usr/bin/env node
/**
 * PORTÃO DO DIST (2026-08-23).
 *
 * `client/dist` é VERSIONADO: o launcher da escola não compila nada, só baixa
 * o repositório e sobe o servidor — o bundle viaja pronto. Consequência: um
 * commit que mexe em `client/src` e esquece de reconstruir e commitar o
 * `client/dist` chega na escola como **tela velha**, e nada na bateria acusa:
 * typecheck, testes e o próprio build passam todos verdes.
 *
 * Este portão roda DEPOIS do build no `npm run verify` e pergunta uma coisa só:
 * "o build acabou de mudar algum arquivo de `client/dist`?". Se mudou, o dist
 * commitado estava defasado — e agora não dá mais para pushar assim.
 *
 * Pula sozinho (sem falhar) onde a pergunta não faz sentido: fora de um
 * repositório git, ou sem git instalado. Lá o `verify` nem é a bateria de quem
 * publica.
 */
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const git = (...args) =>
  execFileSync("git", args, { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });

console.log("portão do dist (client/dist é versionado):");

let dentro = false;
try {
  dentro = git("rev-parse", "--is-inside-work-tree").trim() === "true";
} catch {
  /* sem git, ou pasta que não é repositório */
}
if (!dentro) {
  console.log("  · fora de um repositório git — nada a conferir");
  process.exit(0);
}

// A pergunta NÃO é "a árvore está limpa?" — durante o desenvolvimento fonte e
// dist mudam juntos, e falhar aí só ensinaria a ignorar o portão. A pergunta é
// "a FONTE já foi commitada e o dist não?", que é exatamente o estado que chega
// na escola como tela velha.
//
// `--porcelain` lista rastreado modificado E arquivo solto ("??"): o bundle
// novo nasce com outro hash no nome, então ele aparece como solto e o antigo
// como apagado. Os dois contam.
const status = (...caminhos) =>
  git("status", "--porcelain", "--", ...caminhos)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

const dist = status("client/dist");
if (dist.length === 0) {
  console.log("  ✓ client/dist commitado bate com o build");
  process.exit(0);
}

// tudo que entra no bundle. `client/dist` fica de fora de propósito.
const fonte = status("client/src", "shared/src", "client/index.html", "package.json", "package-lock.json");
if (fonte.length > 0) {
  console.log("  · client/dist mudou junto com fonte ainda não commitada — normal");
  console.log("      lembre de commitar os dois JUNTOS: a escola roda o dist, não o src");
  process.exit(0);
}

console.log("  ✗ a fonte já está commitada e o client/dist NÃO — a escola rodaria a tela velha");
for (const linha of dist.slice(0, 10)) console.log(`      ${linha}`);
if (dist.length > 10) console.log(`      ... e mais ${dist.length - 10} (são ${dist.length} no total)`);
console.log(
  "\n      A escola NÃO compila: o launcher baixa o repositório e sobe o\n" +
    "      servidor, então é este client/dist que ela vai rodar. Commite:\n\n" +
    "          git add client/dist && git commit --amend --no-edit\n",
);
process.exit(1);
