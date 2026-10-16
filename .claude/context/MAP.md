---
updated: 2026-10-16
tier: 3
---

# Mapa do projeto

<!-- TETO: 60 linhas. Bloco auto pertence ao script. -->

## Comandos

<!-- auto:start -->
gerado em: 2026-10-16

| Ação | Comando |
|---|---|
| Build | npm run build |
| Teste (tudo) | npm test |
| Rodar | npm run dev |

primeiro nível:

```
cenarios
client
docs
ferramentas
iniciar-servidor.bat
iniciar-servidor.sh
LICENSE
package.json
package-lock.json
README.md
registros
relatorio
scripts
server
shared
todo.md
tsconfig.base.json
vitest.config.ts
```
<!-- auto:end -->

Acima é do script. O que ele **não** acha é o que manda aqui:

| Ação | Comando |
|---|---|
| **Portão antes de commitar** | `npm run verify` (typecheck+testes+build+portão do dist) |
| Rede de verdade | `npm run smoke` (`--lista` diz o que cada cenário prova) |
| Um smoke só | `npm run smoke -- <nome>` (filtra por nome; ex.: `-- presenca kicar`) |
| Um teste só | `npx vitest run --root shared src/<arquivo>.test.ts` |

**Sondas** (`shots:tablet` a RÉGUA de 1024×600, `shots:quebra`, `shots:loja`, `shots:luz`,
`shots:queda`, `shots:restaurar`, `shots:circuito`, `bench:headless` — este só prova ENCANAMENTO, o FPS dele é
ruído de SwiftShader): sobem host + Chrome de verdade e asseveram no DOM; `npm run build` antes.
**Mudança de UI só é "feita" quando uma sonda a ENXERGA.** Detalhe no cabeçalho de cada script.

**Bateria completa (17), uma de cada vez** — em paralelo a máquina carrega e asserção de tempo
mente: 9 sobem host próprio (`f10 loja quebra queda restaurar amigos grupos toque esc`); 7 pedem
`BASE=` de um host servindo o `dist` (`tablet craft comida tooltip fundo`, mais `luz` e
`bench-headless`, que tomam a URL como argv); `corrida` quer a aula 7 (`LJ_SAVE=cenarios/aula7-corrida.ljw LJ_PORT=8090`).
⚠️ **`shots:fundo` GERA**: reescreve `client/public/menu-fundo/*.png` e as cópias no `dist` (~5 MB
versionados). Conferir `git status` depois da bateria e reverter se fundo novo não era o pedido.

## Onde fica cada coisa

**Não existe índice de arquivos, e é decisão** (Decision Log 2026-09-22) — achar é com `grep`.
Só o não óbvio:

- `shared/` — a lógica (servidor autoritativo). `session/` tem estado; o resto é PURO e testável.
- **§🔌 circuito:** motor PURO em `shared/src/circuitos.ts` (ponto fixo, roda no tick da
  `session.ts` só quando uma peça muda); ids ≥ 256 em `blocks.ts`; forma e textura em
  `mesher.ts` + `client/src/atlasTexture.ts`. Sonda: `npm run shots:circuito` (mede PIXEL).
- `client/` — só renderiza. **`client/dist` é VERSIONADO**: a escola roda o dist, não o src.
- `server/src/cenarios/` smokes · `scripts/` sondas e portões · `docs/projeto.txt` BNCC.
- **Log de aula:** `mundos/<nome>/logs/<AAAA-MM-DD_HH-MM>-{chat,eventos}.log`, um par por sessão
  do host (`paths.ts: logsDaSessao`). Ninguém LÊ esses arquivos no código — são só escrita.
- **O hook de pre-push NÃO está em `.git/hooks`** — `core.hooksPath` aponta pra
  `scripts/git-hooks/pre-push` (roda o `verify` inteiro; escape: `LJ_SEM_VERIFY=1 git push`).

## Fluxos principais

- **UM módulo roda em 3 hospedeiros sem reescrita** (Worker do singleplayer, .exe do professor,
  Node dedicado), WebSocket, mensagens iguais nos três.
- **A aba não abre socket de escuta nem executa binário** — "abrir pra LAN" é do HOST, não do
  aluno; WebAssembly não contorna.
- **Container** (`containers.ts`): o `use_block` pede e é a resposta do SERVIDOR que abre o
  painel — quem decide se o aluno pode ler aquele baú é o gate de claim.
- **Nome/presença:** nome em jogo + PIN certo = **posse** (o socket antigo cai e quem volta
  entra na hora); silêncio só derruba após 3 perguntas de verdade depois do último sinal
  (`shared/src/session/presenca.ts` + `substituir` no `session.ts`).
