---
updated: 2026-10-20
tier: 3
---

# Mapa do projeto

<!-- TETO: 60 linhas. Bloco auto pertence ao script. -->

## Comandos

<!-- auto:start -->
gerado em: 2026-10-20

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

**Sondas** (`scripts/*-shot.mjs`; `shots:tablet` é a RÉGUA de 1024×600, `bench:headless` só prova
ENCANAMENTO): sobem host + Chrome de verdade e asseveram no DOM; `npm run build` antes. **Mudança
de UI só é "feita" quando uma sonda a ENXERGA.** Detalhe no cabeçalho de cada script.

**Bateria completa (17), uma de cada vez** (em paralelo a máquina carrega e asserção de tempo
mente): 9 sobem host próprio; 7 pedem `BASE=` de um host servindo o `dist` (`luz` e
`bench-headless` tomam a URL como argv); `corrida` quer a aula 7.
⚠️ **`shots:fundo` GERA**: reescreve `menu-fundo/*.png` e as cópias no `dist` (~5 MB versionados).
Conferir `git status` depois da bateria.

## Onde fica cada coisa

**Não existe índice de arquivos, e é decisão** (Decision Log 2026-09-22) — achar é com `grep`.
Só o não óbvio:

- `shared/` — a lógica (servidor autoritativo). `session/` tem estado; o resto é PURO e testável.
- **§🔌 circuito:** motor PURO em `shared/src/circuitos.ts` (ponto fixo, roda no tick da
  `session.ts` só quando uma peça muda); ids ≥ 256 em `blocks.ts`; forma e textura em
  `mesher.ts` + `client/src/atlasTexture.ts`. Sonda: `npm run shots:circuito` (mede PIXEL).
  Porta nova = 2 linhas nas tabelas `PORTAS`/`LIGA`; "conecta?" é só a `ligacaoDoCondutor`.
- **§💡 a luz, de ponta a ponta** (4 arquivos, e achar isso custou meia sessão): propagação em
  `shared/src/luz.ts` (`acenderColuna` = do zero, `atualizarBloco` = incremental — **os dois têm
  de calcular a MESMA função**, há teste de paridade) → luz por VÉRTICE no `mesher.ts`
  (`luzDoCanto`, e o cubo cheio emite num laço SEPARADO do `emitBox`) → atributo `luz` Uint16 →
  `client/src/luzShader.ts` (desempacota no VERTEX shader, nunca no fragmento: bug-544).
- `client/` — só renderiza. **`client/dist` é VERSIONADO**: a escola roda o dist, não o src.
- `server/src/cenarios/` smokes · `scripts/` sondas e portões · `docs/projeto.txt` BNCC.
- **Log de aula:** `mundos/<nome>/logs/<data>-{chat,eventos}.log`, um par por sessão do host
  (`paths.ts: logsDaSessao`). Ninguém LÊ esses arquivos no código — são só escrita.
- **Pre-push NÃO está em `.git/hooks`** — `core.hooksPath` → `scripts/git-hooks/pre-push` (roda o `verify` inteiro; escape: `LJ_SEM_VERIFY=1 git push`).

## Fluxos principais

- **UM módulo roda em 3 hospedeiros sem reescrita** (Worker, .exe do professor, Node dedicado).
- **A aba não abre socket de escuta nem executa binário** — "abrir pra LAN" é do HOST.
- **Container** (`containers.ts`): o `use_block` pede e é a resposta do SERVIDOR que abre o
  painel — quem decide se o aluno lê aquele baú é o gate de claim.
- **Nome/presença:** nome em jogo + PIN certo = **posse** (o socket antigo cai, quem volta entra
  na hora); silêncio só derruba após 3 perguntas de verdade (`session/presenca.ts`).
