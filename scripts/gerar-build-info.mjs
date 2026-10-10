#!/usr/bin/env node
/**
 * GERA `shared/src/build-info.json` (2026-08-27).
 *
 * Substitui o `npm version` como fonte do rótulo mostrado em tela. Motivo:
 * este projeto não tem executável nem artefato de release — o launcher da
 * escola atualiza comparando COMMIT (`iniciar-servidor.sh`, API do GitHub),
 * nunca número de versão. `npm version` virou ritual sem função técnica
 * nenhuma; o rótulo que o jogador vê (rodapé do menu, log do servidor, topo
 * do changelog) passa a ser a DATA do marco (ver o aviso do commit abaixo).
 *
 * Roda ANTES de `npm run build`/`npm run dev` (ver package.json da raiz).
 * O JSON gerado é COMMITADO, mesma disciplina do `client/dist`: uma pasta
 * clonada e nunca "buildada" ainda precisa de algo importável.
 *
 * ⚠️ **O COMMIT SAIU DAQUI (2026-09-25), e é o conserto de um defeito real.**
 * O campo `commit` carimbava o HEAD e era *inlined* no bundle — então o
 * `client/dist` deixava de ser função da FONTE e virava função de "qual
 * commit é o HEAD agora". Duas consequências, as duas medidas:
 *
 * 1. **Árvore suja a cada push.** O hook de pre-push roda `npm run verify`
 *    DEPOIS do commit; o build recarimbava o HEAD novo e reescrevia o dist
 *    inteiro. Árvore limpa + `npm run build` = 8 arquivos modificados, sem
 *    uma linha de código ter mudado.
 * 2. **O portão do dist ficava DESARMADO justo no pre-push.** O
 *    `checar-dist.mjs` desculpa um dist sujo quando há "fonte ainda não
 *    commitada", e este arquivo mora em `shared/src` — ou seja, a desculpa
 *    era SEMPRE verdadeira e o portão nunca podia falhar no único caminho
 *    para o qual foi feito (pegar "esqueci de reconstruir o dist"). O
 *    `checar-dist.mjs` agora ignora este arquivo, e isso só é seguro porque
 *    ele parou de mudar a cada commit.
 *
 * O rótulo de tela virou só a DATA. Quem precisa do commit tem o launcher
 * (que o imprime ao atualizar) e o `git log` da máquina.
 *
 * ⚠️ **`data` só muda quando o `titulo` muda.** É o que mantém este arquivo
 * ESTÁVEL entre commits — se ele voltasse a seguir o HEAD (`git log -1`), a
 * árvore sujaria de novo na primeira virada de meia-noite e o portão voltaria
 * a bloquear push honesto. A data passa a ser a do MARCO (quando o bloco do
 * topo do changelog nasceu), que é como a tela "📜 novidades" já se organiza.
 *
 * ⚠️ **bug-653 (2026-09-01): sem `git` no PATH, o rótulo zerava.** O launcher
 * da escola existe justamente pra rodar sem nada pré-instalado (Node
 * portátil) — se o `.bat` reconstrói `client/dist` numa máquina sem `git`, o
 * catch mudo escrevia "0000-00-00" por cima de um valor bom já commitado. O
 * valor ATUAL do arquivo agora é o ponto de partida; só falta git MESMO na
 * primeira vez de todas (pasta sem `.git` e sem `build-info.json` nenhum
 * ainda) cai no placeholder.
 *
 * ⚠️ **`titulo` (2026-09-03): o launcher parou de mostrar semver.** Ele
 * precisava de um nome de novidade pra mostrar no lugar do "0.9.0", e ler o
 * `changelog.ts` (texto livre, com dois-pontos/vírgula dentro do valor) em
 * batch/shell puro é a mesma armadilha da aspa escapada — por isso o campo
 * sai JÁ EXTRAÍDO daqui (Node, regex simples) e o launcher só lê um campo
 * JSON comum, igual `data`.
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const destino = join(RAIZ, "shared", "src", "build-info.json");

/** O que já está commitado — o fallback de verdade (bug-653). Só cai no
 *  placeholder zerado se este arquivo nunca existiu. */
function valorAtual() {
  try {
    const salvo = JSON.parse(readFileSync(destino, "utf8"));
    if (typeof salvo.data === "string") {
      return { data: salvo.data, titulo: typeof salvo.titulo === "string" ? salvo.titulo : "" };
    }
  } catch {
    // 1ª vez de todas: sem build-info.json ainda
  }
  return { data: "0000-00-00", titulo: "" };
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

let { data, titulo } = valorAtual();
const tituloNovo = tituloDoChangelog(titulo);

// MARCO NOVO = título diferente do que estava salvo. Só aí a data anda — e é
// isto que impede este arquivo (e o bundle que o inlina) de mudar sozinho a
// cada commit. Marco que continua o mesmo mantém a data em que nasceu.
// A data é a de HOJE, não a do último commit (2026-10-10). O marco nasce
// ANTES do commit que o carrega — com `git log -1` o rótulo saía com a data do
// commit ANTERIOR, e o marco de hoje aparecia na escola carimbado dias atrás.
// Continua estável entre commits pela MESMA razão de sempre: só entra aqui
// quando o TÍTULO muda. E deixa de depender de git, que era o caminho do
// bug-653 (máquina da escola sem git escrevia "0000-00-00" por cima).
if (tituloNovo !== titulo || data === "0000-00-00") {
  const hoje = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  data = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;
}
titulo = tituloNovo;

writeFileSync(destino, JSON.stringify({ data, titulo }, null, 2) + "\n");
console.log(`build-info: ${data} · ${titulo}`);
