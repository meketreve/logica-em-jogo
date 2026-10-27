---
updated: 2026-10-25
tier: 3
---

# Mapa do projeto

<!-- TETO: 60 linhas. Bloco auto pertence ao script. -->
## Comandos

<!-- auto:start -->
gerado em: 2026-10-25

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

O que o script **não** acha é o que manda aqui:

| Ação | Comando |
|---|---|
| **Portão antes de commitar** | `npm run verify` (typecheck+testes+build+portão do dist) |
| Rede de verdade | `npm run smoke` (`--lista` diz o que cada cenário prova) |
| Um smoke só | `npm run smoke -- <nome>` (filtra por nome; ex.: `-- presenca kicar`) |
| Um teste só | `npx vitest run --root shared src/<arquivo>.test.ts` |
| **Bateria de GPU (no LAB)** | `npm run bench:lab` — `?bench` com chaves (`comaa`, `semdescarte`, `aguaparada`, `semvida`) intercaladas; resultado em `registros/bench-lab/` |

**Sondas** (`scripts/*-shot.mjs`, `shots:tablet` é a RÉGUA de 1024×600): host + Chrome reais, e
asseveram no DOM (`npm run build` antes). **UI só é "feita" quando uma sonda a ENXERGA.** Bateria
de **18**, uma por vez (em paralelo a asserção de tempo mente): 9 sobem host próprio, 7 pedem
`BASE=`, `corrida` quer a aula 7. ⚠️ **`shots:fundo` GERA** ~5 MB versionados — `git status` depois.

## Onde fica cada coisa

**Não existe índice de arquivos, e é decisão** (2026-09-22) — achar é com `grep`. Só o não óbvio:

- `shared/` — a lógica (servidor autoritativo): `session/` tem estado, o resto é PURO. `client/` só renderiza, e **`client/dist` é VERSIONADO** (a escola roda o dist).
- **§🔌 circuito:** motor PURO em `circuitos.ts` (ponto fixo, roda no tick só quando uma peça
  muda); ids ≥ 256 em `blocks.ts`; forma/textura em `mesher.ts` + `atlasTexture.ts`. Sonda
  `shots:circuito` (PIXEL). Porta nova = 2 linhas em `PORTAS`/`LIGA`; peça rasteira nova = 1 em
  `RASTEIRAS` + faixa gêmea em `blocks.ts`. **Peça colada numa FACE** (parede/teto): a face mora
  no id e o desenho sai de UM giro — `giroDaFace` (caixa alinhada, serve forma E mira) e
  `emitCaixaInclinada` (8 cantos, o cabo que tomba), sobre `pontoNaFace`/`direcaoNaFace`.
  **Saída que não é peça** (a porta de passagem): `propagarSinal` a devolve como vizinha
  alimentada; abrir/fechar o par é da sessão (`moverPortasPeloSinal`, pela borda do sinal).
- **§💰 venda:** preço PURO em `venda.ts` (permissão do que se COLHE) · balcão por jogador em
  `session/venda.ts` (fora do save) · painel no `container.ts`. Sonda `shots:venda`. ⚠️ Preço
  novo passa pelo portão de `venda.test.ts` (saída ≤ entrada em TODA receita e cozimento).
- **§💡 a luz** (4 arquivos, achar custou meia sessão): `shared/src/luz.ts` (`acenderColuna` ×
  `atualizarBloco` — **a MESMA função**, com paridade) → vértice no `mesher.ts` (`luzDoCanto`;
  cubo cheio em laço SEPARADO) → Uint16 → `luzShader.ts` (desempacota no VERTEX: bug-544).
- `server/src/cenarios/` smokes · `scripts/` sondas/portões · `docs/projeto.txt` BNCC. **Pre-push
  NÃO está em `.git/hooks`** — `core.hooksPath` → `scripts/git-hooks/pre-push` (roda o `verify`;
  escape: `LJ_SEM_VERIFY=1 git push`).
- **Log de aula:** `mundos/<nome>/logs/<data>-{chat,eventos}.log` (`paths.ts: logsDaSessao`).
  Gente no `-chat.log`, servidor no `-eventos.log` — e desde 20/10 a **SAÍDA com o MOTIVO**
  (`registrarEvento`/`motivoDaSaida`): fechou a página (4001) × sem responder × substituído × rede.

## Fluxos principais
- **UM módulo em 3 hospedeiros sem reescrita** (Worker, .exe, Node); a aba não abre socket de
  escuta nem executa binário — "abrir pra LAN" é do HOST.
- **Container** (`containers.ts`): o `use_block` pede e é a resposta do SERVIDOR que abre o
  painel — o gate de claim decide quem lê aquele baú. O **balcão de venda** é o 4º tipo e o
  único que NÃO é bloco: endereçado pelo jogador, fora do save.
- **Ciclo da AULA pelo launcher:** `[10]` plano → construir → `[11]` publicar (copia pra
  `cenarios/` com prefixo `aula`, que é o que torna REUTILIZÁVEL) → `[8]` abre as duas pastas.
  Portão de paridade `.sh`×`.bat`: `scripts/checar-launchers.mjs`.
- **Nome/presença:** nome + PIN certo = **posse** (o socket antigo cai, quem volta entra na
  hora); silêncio só derruba após 3 perguntas de verdade (`session/presenca.ts`).
