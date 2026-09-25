/**
 * Rótulo de BUILD — a DATA do marco atual (2026-08-27; o commit saiu em
 * 2026-09-25).
 *
 * Substitui o `npm version`/semver: este projeto não tem executável nem
 * artefato de release — o launcher da escola atualiza comparando COMMIT via
 * API do GitHub (`iniciar-servidor.sh`/`.bat`), nunca número de versão.
 * Bumpar `package.json` virou ritual sem função técnica nenhuma; o número que
 * o jogador via na tela não correspondia a NADA que decidisse "está
 * atualizado" de verdade.
 *
 * ⚠️ **O COMMIT curto saiu do rótulo (2026-09-25).** Ele carimbava o HEAD e
 * era inlined no bundle, então o `client/dist` — que é VERSIONADO — mudava
 * sozinho a cada commit: árvore suja em todo push, e o portão do dist
 * desarmado justo no pre-push (ele desculpa dist sujo quando há "fonte não
 * commitada", e o build-info mora em `shared/src`). Um rótulo auto-referente
 * dentro de um artefato versionado não fecha: ou o rótulo mente por um
 * commit, ou o artefato nunca estabiliza. Quem precisa do sha tem o launcher
 * (imprime ao atualizar) e o `git log`. Ver `scripts/gerar-build-info.mjs`.
 *
 * `data` vem de `shared/src/build-info.json`, GERADO por
 * `scripts/gerar-build-info.mjs` antes de `npm run build`/`npm run dev` (ver
 * package.json da raiz) — nunca editado à mão. Importado como named export do
 * JSON: roda igual no navegador (Vite), no Node do servidor (tsx) e nos
 * testes (vitest), mesma disciplina que o antigo `VERSION` já tinha.
 */
import buildInfo from "./build-info.json";

export const DATA_BUILD: string = buildInfo.data;

/** "2026-08-27" (ISO do `git log --date=short`) → "27/08/2026". */
function dataBr(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
}

/** Rótulo pronto pra tela: "27/08/2026". */
export const ROTULO_BUILD: string = dataBr(DATA_BUILD);

/**
 * Rótulo de um bloco da tela "📜 novidades" (`client/src/changelog.ts`).
 *
 * ⚠️ **A entrada do topo NÃO leva data escrita à mão.** Ela é sempre a
 * release em uso agora, e a data sai daqui — do build. O motivo é cicatriz:
 * o bloco do topo já ficou rotulado "recém-chegado" por 12 versões de
 * trabalho, porque nada obrigava ninguém a trocá-lo, e com o launcher se
 * atualizando sozinho na escola o professor via "recém-chegado" pra sempre.
 * Com isto, o build relabela a tela sozinho.
 *
 * Entrada HISTÓRICA passa a data que já tinha e a mantém — o passado é fixo.
 */
export function rotuloDoBloco(data?: string): string {
  return data ?? ROTULO_BUILD;
}
