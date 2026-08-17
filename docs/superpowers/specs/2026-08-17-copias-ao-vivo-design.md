# Cópias da área de atividade ajustáveis ao vivo — desenho

**Data:** 2026-08-17 · **Item:** `todo.md` §Mundo/professor, "AJUSTAR AO VIVO O NÚMERO DE CÓPIAS
DA ÁREA DA ATIVIDADE" (sub-itens 1, 2, 3, 5 e 6).

## Problema

Hoje a quantidade de cópias da área de atividade é decidida **na geração do `.ljw`**
(`npm run cenarios -- --grupos 5`, teto 8). Se a turma real der 7 grupos, o professor não tem
como aumentar durante a aula: teria que regerar o mundo e reiniciar o servidor.

Três coisas travam o ajuste ao vivo:

1. **Não existe descarimbar.** `/regiao carimbar` só adiciona. Diminuir de 7 para 4 deixa
   `area-5…7` com blocos em pé, região nomeada viva e objetivo per-grupo pendurado.
2. **A fonte da cópia está vazia.** O gerador usa `modelo{suf}` para guardar o **gabarito**,
   fotografa o objetivo e depois **apaga** (`gerar.ts:370-374`). Carimbar dela ao vivo estamparia
   AR — e o que a cópia nova precisa é o estado de **partida**, que não é o gabarito.
3. **O mundo pode não caber.** `dims.x = max(6, n ímpar ? n+1 : n)` (`gerar.ts:304`) cresce com o
   número de grupos pedido na geração; um `.ljw` de `--grupos 5` tem 6 chunks de X e recusa a 8ª
   cópia no `inBounds`.

Somado a isso, o layout de hoje é uma **fileira**: um chunk por grupo em X, todos na mesma
fileira de Z (`gerar.ts:350-351`). Oito grupos = 128 blocos em linha, com o professor andando
~64 blocos até cada ponta.

## O que já existe e vamos reusar

- `/regiao carimbar` (`regioes.ts:137`) já valida `inBounds` de todas as cópias **antes** de
  mexer em bloco, já barra `MAX_REGIONS`, e já pula célula com jogador em pé. A ordem de
  operações dele é o molde a seguir.
- `capturarBaseline` (`cenario.ts:285`) fotografa o estado autoral de cada área. Serve para
  **preencher o `baseline` das áreas novas** (fotografando a área depois de escrita), mas **não**
  serve como fonte da cópia — ver a seção seguinte.

## Por que o `baseline` NÃO serve como fonte

A leitura inicial sugeria copiar de `o.baseline[0]`: ele guarda o estado de partida, já persiste
no save (`scenario.ts:58, 231-261`) e é imune ao que os alunos mexeram. **Mas ele só cobre a
caixa da área alvo.** Na aula 6 a área é `dx:3, dy:1` (`gerar.ts:252`) e os `extras` plantam a
parede de manual em `o.x+3`/`o.x+4`, `o.y+1` (`gerar.ts:261-267`) — **fora da caixa**. Copiar do
`baseline` daria ao grupo novo a área certa e **nenhuma parede de quadros**, que é justamente o
enunciado da atividade.

A fonte precisa cobrir **a célula inteira do grupo**, área e extras juntos.

## Restrições descobertas na leitura do código

- **`o.alvos` é congelado na criação do objetivo** (`cenario.ts:124`), e `alvos[g-1]` ↔ grupo `g`
  (`cenario.ts:479`). Criar a região `area-6` depois **não** estende o objetivo: `alvos`,
  `baseline` e `porGrupo` têm de ser mexidos juntos, na mesma operação.
- **`/grupo criar X` zera composição e progresso** (`equipes.ts:586-587`, "turma nova"). Não
  serve como knob de ajuste no meio da aula — o comando novo é outro.
- **Quadro tem conteúdo fora do bloco.** `extras` da aula 6 planta blocos `QuadroXN` **e**
  entradas em `ses.quadros` (`Map<quadroKey, QuadroConteudo>`, `session.ts:410`), que persiste no
  meta. `snapshotRegion` fotografa **só ids de bloco** — copiar o baseline sem traduzir os quadros
  daria ao grupo novo os 3 quadros-manual **em branco**.
- **`MAX_REGIONS = 64`** (`regions.ts:22`) não cabe no teto novo: 20 grupos × 3 fases + 3 modelos
  + 1 `partida` = **64 exatos**, zero folga para o professor criar região própria.
- **`conferirExtra` da aula 6 conta quadros** (`gerar.ts:270-275`): espera
  `grupos × PASSOS.length`. Com a célula-molde ganhando a própria parede de manual, o esperado
  vira `(grupos + 1) × PASSOS.length` — o conferidor tem de acompanhar, senão a geração falha.

## Decisões

| # | Decisão | Motivo |
|---|---------|--------|
| 1 | Escopo = fatia vertical completa (sub-itens 1, 2, 3, 5, 6) | Sem a fonte de partida e sem o mundo caber, o ajuste ao vivo não funciona de ponta a ponta. |
| 2 | Ajuste **incremental**: grupos `1..min(N,X)` preservam composição, progresso e blocos | É o único comportamento que serve no meio da aula. `/grupo criar X` segue sendo o reset explícito. |
| 3 | Grade de **6 colunas**, teto **20 grupos** (= `MAX_GRUPOS`) | 8 → 6×2 · 20 → 6×4 · 35 → 6×6 = 96×96, a pegada de hoje. `dims.x` fica em 6, o valor atual. |
| 4 | Mundo base dimensionado para o **teto**, não para `--grupos` | Tira o `inBounds` do caminho do professor. ⚠️ **Custa tamanho de arquivo:** medido na implementação, o `.ljw` foi de ~593 kB para ~987 kB (+66%, exatamente o crescimento de 144 → 240 chunks). O save destes mundos **não** é esparso — a suposição contrária, escrita aqui antes de medir, estava errada. 7 aulas passam de ~4,2 MB para ~6,9 MB no repositório e no download da escola; a 35 grupos (`dims.z = 14`) seriam ~1,38 MB por aula. |
| 5 | Encolher exige **confirmação em 2 passos** | Apaga blocos que alunos construíram. Mesmo padrão de 2 cliques do painel de jogadores. |
| 6 | Superfície = comando `/aula grupos X` **e** botão no painel P | Professor em tablet sem teclado. |
| 7 | Uma função pura compartilhada decide a geometria, usada pelo gerador **e** pelo ao vivo | Gerador e comando não podem discordar de onde fica o grupo `g`. |
| 8 | Fonte da cópia = região **`partida`**, uma CÉLULA inteira (16×16 em XZ, fatia em Y) numa célula pristina atrás do professor | É o único recorte que pega área **e** `extras` juntos. Fora do caminho dos alunos, então não se suja. |
| 9 | O gerador carimba os `n` grupos iniciais pela **mesma função** do comando ao vivo | Um caminho de código só; a geração vira o teste de fumaça do caminho ao vivo. |
| 10 | `MAX_REGIONS` 64 → 256 | 63/64 é folga nenhuma; com 35 grupos seria 108. |
| 11 | Todos os `.ljw` do repo são regerados no modelo novo e commitados | O auto-update do launcher entrega as aulas novas na próxima execução na escola. |

**Fora de escopo, anotado para depois:** subir o teto para 35 (turma individual). Custa **uma
constante** (`MAX_GRUPOS_AULA`) mais regerar os cenários — `dims.z` sai de 10 para 14 pela mesma
fórmula.

## Arquitetura

### `shared/src/grade.ts` (novo, puro)

Sem dependência de `World` ou `GameSession` — só aritmética, testável isolado.

```ts
export const COLUNAS_AULA = 6;
export const MAX_GRUPOS_AULA = 20;
/** Fatia em Y que a célula ocupa, a partir de FAIXA_Y. Cobre área e extras
 *  (o mais alto hoje é o quadro em o.y+1); sobra é AR e copiar AR é inócuo. */
export const CELULA_DY = 8;

/** Fileiras que o teto ocupa: ceil(MAX_GRUPOS_AULA / COLUNAS_AULA). */
export function linhasDaGrade(): number;

/** Dimensões do mundo de aula que comportam o teto, com o professor no chunk
 *  central: { x: COLUNAS_AULA, z: 2 * (1 + linhas), y: 4 }. */
export function dimsDaAula(): WorldDims;

/** Chunk da cabine do professor: o central (é onde todo mundo nasce). */
export function chunkDoProfessor(): { cx: number; cz: number };

/** Chunk da célula-molde: um ATRÁS do professor, fora das fileiras de grupo. */
export function chunkDoMolde(): { cx: number; cz: number };

/** Chunk ABSOLUTO do grupo g. Grupo 1 = coluna 0 da primeira fileira à frente
 *  do professor; ordem de LEITURA (esquerda→direita, frente→fundo) — é como o
 *  professor procura "o grupo 5". */
export function chunkDoGrupo(g: number): { cx: number; cz: number };

/** Caixa de uma célula (chunk inteiro em XZ, CELULA_DY em Y a partir de FAIXA_Y). */
export function caixaDaCelula(chunk: { cx: number; cz: number }): Box;
```

Com `COLUNAS_AULA = 6` e `MAX_GRUPOS_AULA = 20`: `linhas = 4`, `dims = { x: 6, z: 10, y: 4 }`.
O professor cai no chunk `(3, 5)`, as 4 fileiras de grupos ocupam os chunks `z = 6..9` (a metade
da frente, exatamente), e a **célula-molde** fica no chunk `(3, 4)` — atrás do professor, na
metade que os alunos não usam.

### A cópia de uma célula (`copiarCelula`, em `shared/src/session/aula.ts`)

Um único primitivo, usado pelo gerador e pelo comando:

1. Lê os blocos da caixa da célula-molde e escreve na caixa de destino via `ses.applyBlock`
   (mesma engrenagem do `/regiao encher`: `block_changed` + fila de vizinhança + recheca
   objetivo). Célula com jogador em pé é pulada e contada.
2. Traduz as entradas de `ses.quadros` cuja posição cai na caixa-molde, somando o deslocamento —
   é o que impede o grupo novo de ficar com os 3 quadros-manual **em branco**.
3. Devolve `{ escritos, pulados }`.

### `server/src/cenarios/gerar.ts`

`dims` passa a vir de `dimsDaAula()`, **independente de `--grupos`**. `cx0`/`cz` saem.
`--grupos` continua existindo (quantos grupos o `.ljw` nasce com), mas o teto sobe de 8 para
`MAX_GRUPOS_AULA`.

A ordem das operações passa a ser (ela importa, e é onde é fácil errar):

1. Planta `modelo{suf}` (o **gabarito**) na cabine do professor e registra as regiões — como hoje.
2. Planta `fase.partida` + `extras` **uma vez só**, na **célula-molde** (`chunkDoMolde()`), e
   registra a região `partida`.
3. `/grupo criar n` — como hoje, os grupos vêm antes do objetivo per-grupo.
4. Para `g = 1..n`: `copiarCelula(molde → chunkDoGrupo(g))` e registra as regiões
   `area{suf}-{g}` nos offsets das fases dentro da célula (é o que `resolveAlvos` procura).
5. Cria os objetivos — `capturarBaseline` fotografa cada área **já escrita**, então o `baseline`
   sai correto como hoje.
6. Esvazia `modelo{suf}` (o gabarito) se não veio `--revelar` — como hoje. A célula-molde
   **não** é esvaziada: é ela que alimenta o ajuste ao vivo.

`conferirExtra` da aula 6 passa a esperar `(grupos + 1) × PASSOS.length` quadros — a célula-molde
tem a própria parede de manual.

Efeito colateral bom: **a geração passa a exercitar o caminho ao vivo**. Se `copiarCelula`
quebrar, `npm run cenarios` quebra junto, antes de chegar na escola.

### `shared/src/session/aula.ts` (novo) — `/aula grupos X [confirmar]`

Só professor. `X` inteiro em `1..MAX_GRUPOS_AULA`.

**Crescer (N → X, X > N)** — valida tudo, depois escreve:

1. Para `g = N+1..X`, confere `inBounds` da caixa da célula. Confere
   `ses.regions.size + (X-N) * fases <= MAX_REGIONS`. Falhou qualquer um → recusa **sem tocar em
   bloco nenhum**.
2. `copiarCelula(molde → célula de g)` para cada `g` novo (blocos + quadros).
3. Cria as regiões `area{suf}-{g}` nos offsets das fases dentro da célula, e `broadcastRegions`.
4. Em cada objetivo per-grupo do prefixo, faz `push` em `alvos`, em `baseline`
   (`snapshotRegion` da área recém-escrita) e em `porGrupo` (estado zerado), e atualiza o rótulo
   `o.regiao`.
5. Cria os grupos `N+1..X` em `ses.grupos` **sem** limpar os existentes, e `broadcastGroups` +
   `broadcastObjectives`.

**Encolher (N → X, X < N)** — dois passos:

- Sem `confirmar`: **não toca em nada**. Responde o estrago — quais grupos somem, quantos alunos
  estão neles, e quantos blocos por área divergem do baseline (trabalho que será perdido).
- Com `confirmar`: apaga a **célula inteira** dos grupos `X+1..N` (volta ao AR via `applyBlock`,
  o que leva junto área e extras), apaga as entradas de `ses.quadros` dentro delas,
  `regions.delete` das `area{suf}-{g}` + `broadcastRegions`, encurta `alvos`/`baseline`/`porGrupo`
  de cada objetivo, remove os grupos de `ses.grupos` e **realoca os alunos** deles por round-robin
  nos grupos que ficaram, avisando cada um no chat.

**X == N:** re-executa a criação das áreas faltantes (é o caminho de re-tentativa quando blocos
foram pulados por jogador em pé) e responde o que completou.

### `shared/src/session/regioes.ts`

`carimbar` **fica como está**. Ele deixa de ser o caminho da aula (o gerador não o usa mais e
`/aula grupos` o substitui), mas continua sendo a ferramenta manual para um mundo autoral, onde
não há célula-molde nem grade. Mudar a assinatura dele agora seria quebrar um comando
documentado sem ganho.

O que muda são os **textos que apontam o professor para ele** no caso per-grupo — `cenario.ts:52`
e o uso do `/objetivo add construir` (`cenario.ts:84`) passam a citar `/aula grupos`.

### Cliente

- `client/src/players.ts`: seletor de número de grupos na aba do professor, mandando
  `/aula grupos X` e, na confirmação, `/aula grupos X confirmar` (2 cliques, igual
  expulsar/banir).
- `client/src/commands.ts`: `/aula` entra na árvore do painel de comandos rápidos do toque.

## Tratamento de erro

| Situação | Comportamento |
|----------|---------------|
| `X` fora de `1..MAX_GRUPOS_AULA` | Recusa com o teto na mensagem. |
| Alguma cópia não cabe no `inBounds` | Recusa **antes** de escrever bloco, dizendo qual grupo. Guarda defensiva: num `.ljw` gerado por `dimsDaAula()` isso não acontece até o teto, e mundo antigo já cai na linha da região `partida` ausente. |
| `MAX_REGIONS` estouraria | Recusa antes de escrever. |
| Aluno em pé numa célula que viraria bloco | Bloco é **pulado** (como hoje), mas o comando passa a **avisar** quais grupos ficaram incompletos e a dizer que re-executar completa. |
| Mundo sem a região `partida` (`.ljw` gerado antes desta mudança) | Recusa explicando que o mundo é de um modelo antigo e que a aula precisa ser baixada de novo. Todos os `.ljw` do repo são regerados no mesmo commit, e o auto-update os entrega. |
| Encolher sem `confirmar` | Relatório do estrago, zero escrita. |
| Não é professor | Recusa. |

## Testes

**`shared/src/grade.test.ts`** — puro:
- `chunkDoGrupo`: grupo 1 → (0, profCz+1); grupo 6 → (5, profCz+1); grupo 7 → (0, profCz+2);
  grupo 20 → (1, profCz+4)
- ordem de leitura preservada
- `dimsDaAula()` comporta `MAX_GRUPOS_AULA`: o chunk do último grupo cai dentro de `dims`
- `chunkDoMolde()` **não colide** com nenhum `chunkDoGrupo(1..MAX_GRUPOS_AULA)` nem com
  `chunkDoProfessor()`
- `caixaDaCelula` cobre o chunk inteiro em XZ e `CELULA_DY` em Y a partir de `FAIXA_Y`

**`shared/src/aula.test.ts`** — contra `GameSession`:
- crescer 5→7 preserva composição, progresso e blocos dos grupos 1..5
- crescer copia o estado de **partida** (não o gabarito, não AR)
- crescer copia os `extras` que ficam **fora** da caixa da área (o caso da aula 6)
- crescer traduz as entradas de `quadros` (o grupo novo não fica com quadro em branco)
- crescer estende `alvos`, `baseline` e `porGrupo` — o objetivo passa a valer para o grupo novo
- encolher **sem** `confirmar` não muda bloco nenhum e relata o estrago
- encolher **com** `confirmar` apaga blocos, regiões e quadros, e realoca os alunos
- `inBounds` e `MAX_REGIONS` recusam **antes** de qualquer escrita
- teto recusa `X > MAX_GRUPOS_AULA`
- mundo sem região `partida` recusa com mensagem de modelo antigo
- aluno em pé: bloco pulado e aviso emitido; re-executar completa

**Bateria completa:** `check:launchers` · typecheck 3/3 · testes · build · smokes ·
`npm run cenarios` + o `conferir` de cada cenário (inclusive o `conferirExtra` da aula 6, que
conta `grupos × PASSOS.length` quadros).

## Diff previsto

**Novos:** `shared/src/grade.ts`, `shared/src/session/aula.ts`, `shared/src/grade.test.ts`,
`shared/src/aula.test.ts`.

**Mexidos:** `shared/src/regions.ts` (`MAX_REGIONS`), `shared/src/session/cenario.ts`
(estender/encurtar objetivo per-grupo; textos de ajuda), `shared/src/session/equipes.ts` (criar
grupo sem zerar), `shared/src/session.ts` (registrar `/aula`), `shared/src/index.ts` (export),
`server/src/cenarios/gerar.ts` (dims, célula-molde, `copiarCelula`, `conferirExtra` da aula 6),
`client/src/players.ts`, `client/src/commands.ts`, `client/dist` (rebuild, é rastreado),
`cenarios/*.ljw` (regerados), `todo.md`, `.wolf/`.

## Riscos assumidos

- **`.ljw` gerados antes desta mudança param de aceitar `/aula grupos`** (não têm região
  `partida`). Continuam jogáveis; só não ganham ajuste ao vivo. Mitigação: os do repo são
  regerados no mesmo commit e o auto-update do launcher os entrega na próxima execução.
- **O gerador passa a depender do caminho ao vivo.** Se `copiarCelula` regredir,
  `npm run cenarios` quebra — o que é o comportamento desejado (falha cedo), mas acopla os dois.
- **A célula-molde é território do mundo.** Fica atrás do professor, fora das fileiras de grupo,
  mas nada impede um professor de destruí-la. `/aula grupos` daí em diante copiaria o estrago.
  Não vamos proteger a célula nesta entrega; fica anotado no `todo.md`.
