/**
 * `import x from "./arquivo?raw"` — o fonte do arquivo como string.
 *
 * Existe por causa do portão do §🍖 F10f (`gate-claim.test.ts`), que precisa
 * LER a união `ClientMessage` do `protocol.ts` pra descobrir sozinho toda
 * mensagem nova que aponta pra uma célula do mundo. A alternativa seria
 * `node:fs`, e ela custaria `@types/node` no workspace `shared` — que é
 * isomórfico DE PROPÓSITO (roda no navegador, no Web Worker e no Node), e onde
 * um global de Node disponível é um convite a usá-lo por engano.
 */
declare module "*?raw" {
  const conteudo: string;
  export default conteudo;
}
