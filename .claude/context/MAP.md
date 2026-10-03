---
updated: 2026-10-02
tier: 3
---

# Mapa do projeto

<!-- TETO: 60 linhas. Bloco auto pertence ao script. -->

## Comandos

<!-- auto:start -->
gerado em: 2026-10-02

| Ação | Comando |
|---|---|
| Build | npm run build |
| Teste (tudo) | npm test |
| Rodar | npm run dev |

primeiro nível:

```
AGENTS.md
cenarios
CLAUDE.md
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
| Um teste só | `npx vitest run --root shared src/<arquivo>.test.ts` |

**Sondas** (`shots:tablet` a RÉGUA de 1024×600, `shots:quebra`, `shots:loja`, `shots:luz`,
`bench:headless`): sobem host + Chrome de verdade e asseveram no DOM; `npm run build` antes.
**Mudança de UI só é "feita" quando uma sonda a ENXERGA.** Detalhe no cabeçalho de cada script.

## Onde fica cada coisa

**Não existe índice de arquivos, e é decisão** (Decision Log 2026-09-22) — achar é com `grep`.
Só o não óbvio:

- `shared/` — a lógica (servidor autoritativo). `session/` tem estado; o resto é PURO e testável.
- `client/` — só renderiza. **`client/dist` é VERSIONADO**: a escola roda o dist, não o src.
- `server/src/cenarios/` smokes · `scripts/` sondas e portões · `docs/projeto.txt` BNCC.

## Fluxos principais

- **UM módulo roda em 3 hospedeiros sem reescrita** (Worker do singleplayer, .exe do professor,
  Node dedicado), WebSocket, mensagens iguais nos três.
- **A aba não abre socket de escuta nem executa binário** — "abrir pra LAN" é do HOST, não do
  aluno; WebAssembly não contorna.
- **Container** (`containers.ts`): o `use_block` pede e é a resposta do SERVIDOR que abre o
  painel — quem decide se o aluno pode ler aquele baú é o gate de claim.
