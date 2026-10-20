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

**Sondas** (`scripts/*-shot.mjs`; `shots:tablet` é a RÉGUA de 1024×600): sobem host + Chrome de
verdade e asseveram no DOM; `npm run build` antes. **UI só é "feita" quando uma sonda a ENXERGA.**

**Bateria completa (18), uma de cada vez** (em paralelo a máquina carrega e asserção de tempo
mente): 9 sobem host próprio; 7 pedem `BASE=` de um host servindo o `dist` (`luz` e
`bench-headless` tomam a URL como argv); `corrida` quer a aula 7.
⚠️ **`shots:fundo` GERA**: reescreve `menu-fundo/*.png` e as cópias no `dist` (~5 MB). Conferir
`git status` depois da bateria.

## Onde fica cada coisa

**Não existe índice de arquivos, e é decisão** (Decision Log 2026-09-22) — achar é com `grep`.
Só o não óbvio:

- `shared/` — a lógica (servidor autoritativo). `session/` tem estado; o resto é PURO e testável.
- **§🔌 circuito:** motor PURO em `shared/src/circuitos.ts` (ponto fixo, roda no tick só quando
  uma peça muda); ids ≥ 256 em `blocks.ts`; forma/textura em `mesher.ts` + `atlasTexture.ts`.
  Sonda `shots:circuito` (PIXEL). Porta nova = 2 linhas em `PORTAS`/`LIGA`.
- **§💰 venda ao sistema:** tabela de preço PURA em `shared/src/venda.ts` (lista de permissão
  do que se COLHE) · balcão por jogador em `shared/src/session/venda.ts` (fora do save; devolve
  ao fechar) · painel é o 4º tipo do `client/src/container.ts`. Sonda: `npm run shots:venda`.
  ⚠️ Preço novo tem de passar pelo portão de `venda.test.ts` (saída ≤ entrada em toda receita).
- **§💡 a luz, de ponta a ponta** (4 arquivos, e achar isso custou meia sessão): propagação em
  `shared/src/luz.ts` (`acenderColuna` = do zero, `atualizarBloco` = incremental — **os dois têm
  de calcular a MESMA função**, há teste de paridade) → luz por VÉRTICE no `mesher.ts`
  (`luzDoCanto`, e o cubo cheio emite num laço SEPARADO do `emitBox`) → atributo `luz` Uint16 →
  `client/src/luzShader.ts` (desempacota no VERTEX shader, nunca no fragmento: bug-544).
- `client/` — só renderiza. **`client/dist` é VERSIONADO**: a escola roda o dist, não o src.
- `server/src/cenarios/` smokes · `scripts/` sondas e portões · `docs/projeto.txt` BNCC.
- **Log de aula:** `mundos/<nome>/logs/<data>-{chat,eventos}.log` (`paths.ts: logsDaSessao`).
  Só escrita, e ⚠️ **só fala de servidor vira linha** — saída de jogador NÃO é registrada.
- **Pre-push NÃO está em `.git/hooks`** — `core.hooksPath` → `scripts/git-hooks/pre-push` (roda o `verify` inteiro; escape: `LJ_SEM_VERIFY=1 git push`).

## Fluxos principais

- **UM módulo roda em 3 hospedeiros sem reescrita** (Worker, .exe do professor, Node dedicado);
  a aba não abre socket de escuta nem executa binário — "abrir pra LAN" é do HOST.
- **Container** (`containers.ts`): o `use_block` pede e é a resposta do SERVIDOR que abre o
  painel — quem decide se o aluno lê aquele baú é o gate de claim.
- **Nome/presença:** nome em jogo + PIN certo = **posse** (o socket antigo cai, quem volta entra
  na hora); silêncio só derruba após 3 perguntas de verdade (`session/presenca.ts`).
