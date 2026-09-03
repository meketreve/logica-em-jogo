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
 *
 * ⚠️ **bug-653 (2026-09-01): sem `git` no PATH, o rótulo zerava.** O launcher
 * da escola existe justamente pra rodar sem nada pré-instalado (Node
 * portátil) — se o `.bat` reconstrói `client/dist` numa máquina sem `git`, o
 * catch mudo escrevia "0000-00-00" por cima de um valor bom já commitado. O
 * valor ATUAL do arquivo agora é o ponto de partida (stale é o esperado,
 * como o comentário acima já dizia); só falta git MESMO na primeira vez de
 * todas (pasta sem `.git` e sem `build-info.json` nenhum ainda) cai no
 * placeholder.
 *
 * ⚠️ **`titulo` (2026-09-03): o launcher parou de mostrar semver.** Ele
 * precisava de um nome de novidade pra mostrar no lugar do "0.9.0", e ler o
 * `changelog.ts` (texto livre, com dois-pontos/vírgula dentro do valor) em
 * batch/shell puro é a mesma armadilha da aspa escapada — por isso o campo
 * sai JÁ EXTRAÍDO daqui (Node, regex simples) e o launcher só lê um campo
 * JSON comum, igual `data`/`commit`.
 */
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const git = (...args) =>
  execFileSync("git", args, { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

const destino = join(RAIZ, "shared", "src", "build-info.json");

/** O que já está commitado — o fallback de verdade (bug-653). Só cai no
 *  placeholder zerado se este arquivo nunca existiu. */
function valorAtual() {
  try {
    const salvo = JSON.parse(readFileSync(destino, "utf8"));
    if (typeof salvo.data === "string" && typeof salvo.commit === "string") {
      return { data: salvo.data, commit: salvo.commit, titulo: typeof salvo.titulo === "string" ? salvo.titulo : "" };
    }
  } catch {
    // 1ª vez de todas: sem build-info.json ainda
  }
  return { data: "0000-00-00", commit: "sem-git", titulo: "" };
}

/** O `titulo` do bloco do TOPO de `changelog.ts` — sem `data` escrita à mão é
 *  sempre o build atual (ver o comentário lá). `changelog.ts` ilegível
 *  mantém o `fallback` (o que já estava salvo), nunca zera. */
function tituloDoChangelog(fallback) {
  try {
    const src = readFileSync(join(RAIZ, "client", "src", "changelog.ts"), "utf8");
    const m = src.match(/titulo:\s*"((?:[^"\\]|\\.)*)"/);
    if (m) return m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  } catch {
    // changelog.ts ilegível - mantém o titulo que já estava salvo
  }
  return fallback;
}

let { data, commit, titulo } = valorAtual();
try {
  if (git("rev-parse", "--is-inside-work-tree") === "true") {
    data = git("log", "-1", "--date=short", "--format=%ad");
    commit = git("rev-parse", "--short", "HEAD");
  }
} catch {
  // sem git, ou pasta que não é repositório — mantém o que já tinha (stale
  // por trás não é zerado, e é o que bug-653 corrigiu)
}
titulo = tituloDoChangelog(titulo);

writeFileSync(destino, JSON.stringify({ data, commit, titulo }, null, 2) + "\n");
console.log(`build-info: ${data} · ${commit} · ${titulo}`);
