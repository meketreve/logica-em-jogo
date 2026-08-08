# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.
> **SESSÃO 61 (2026-08-08) — DIVIDIR PILHA NO TABLET + PLAYTEST MARCADO COMO FEITO.**
> O usuário pediu a divisão de pilha e a marcação do playtest. O PC já dividia (clique
> DIREITO = metade, sessão 59, `slotDrag.ts`); o TABLET não tinha caminho pra partir uma
> pilha. Agora tem, nos dois painéis que mexem em inventário:
>
> **BOTÃO ✂ "dividir ao meio" no tablet:** mochila (`inventory.ts`) e painel de
> transferência (`container.ts`) mostram um botão quando o aluno está SEGURANDO uma pilha
> com mais de 1 item. O tap alterna `metadePegando` entre `null` (pilha inteira) e
> `ceil(qtd/2)`; o toque no destino manda o `mover_item`/`mover_container` com o `qtd`
> opcional que a sessão 59 já adicionou ao protocolo. Quem aplica segue sendo o servidor.
> Rótulo do botão mostra a metade ("✂ dividir ao meio (32)") e a dica avisa quanto a mão
> leva. CSS novo `.inv-dividir` (amarelo, igual ao slot selecionado).
> **FIX: `metadePegando` não resetava ao soltar no MESMO slot** (tocar de novo no pego) —
> ficava pendurado e o próximo "pegar" carregava uma metade velha. Resetado nos dois
> painéis junto com o `pegando = null`.
> **PLAYTEST (07/08/2026) marcado como FEITO no todo.md** — a linha agora é `[x]`.
> **Bateria verde:** typecheck client ✓ · `npm run build` ✓ · `npm run smoke` **15/15** ✓ ·
> `npm run shots:toque` **exit 0** ✓.
> **Nada commitado ainda** — o commit da sessão 61 é o próximo passo.

> **SESSÃO 60 (2026-08-07) — DÍVIDAS DE UI DO TODO: NOME DE MUNDO + PUSH + 2 ITENS JÁ FEITOS.**
> O usuário pediu pra continuar as tarefas e escolheu 4: cular bordas de claim por distância,
> push dos 4 commits, a 2ª rodada mobile dos painéis de autoria e o nome do mundo truncado no
> desktop. **As duas primeiras já estavam feitas** (a culação em `8d75527` de 2026-08-04; os
> painéis de autoria também em `8d75527`, com `shots:tablet` verde 0 ✗) — o TODO estava
> desatualizado e foi marcado com a evidência. O que a sessão FEZ de fato:
>
> **NOME DO MUNDO TRUNCADO NO DESKTOP:** `.menu-screen { width: min(460px, 92vw) }` →
> `min(680px, 92vw)` na base, sem media query (a troca que o TODO já sugeria; com o aval do
> usuário). Os 3 botões de alvo de dedo comiam a linha de 460px e o nome saía "seq…". Alargar
> resolve em qualquer altura; a regra de paisagem baixa (que já fazia `min(680px, 92vw)`) ficou
> redundante e inofensiva. O menu de pausa (`#overlay .menu-screen`) reusa a base e também
> alarga — mudança visual aprovada junto.
> **PUSH:** `9d4c485..a70fb32` (sessões 58+59) empurrados — o local não está mais à frente.
>
> **Bateria verde:** `npm test` shared 811/811 · `npm run typecheck` (3/3) ✓ · `npm run build`
> ✓ · `npm run smoke` **15/15** ✓ · `npm run shots:tablet` (1024×600 coarse) **0 ✗**.
> **Nada commitado ainda** — o commit da sessão 60 é o próximo passo.

> **SESSÃO 59 (2026-08-07) — PLAYTEST DO TODO: COMER NO TABLET, 🧱→🎒, CLICK'N'DRAG E SHIFT-CLIQUE.**
> A sessão fechou o pedido do playtest em 4 frentes: os 2 itens de toque (T1/T2) e os 2 do PC
> (T3/T4). Tudo sem decidir estado no cliente — as mensagens `mover_item`/`mover_container`
> ganharam `qtd` opcional (pilha parcial) e quem aplica segue sendo o servidor.
>
> **T1 — comer no tablet:** o botão ▣ do toque vira "comer 🍎" quando dá pra morder — mão com
> comida E fome pra gastar (`fome < FOME_MAX`). `touch.ts` ganhou `setModoComer()` e
> `atualizarBtnColocar()` (decide o rótulo ▣ entre varinha ② / comer 🍎 / colocar ▣); o
> `main.ts` chamou `atualizarComerToque()` no handler do `modo`, do `vida` e no `aoRedesenhar`
> da hotbar — comer SOME quando a barra enche. A recusa final (barriga cheia devolve o item)
> continua no servidor.
> **T2 — rótulo da mochila:** o botão 🧱 "blocos" do topo vira 🎒 "mochila" em sobrevivência
> (`setMochilaRotulo`), fiado no handler do `modo` e no boot.
> **T3 — click'n'drag no PC:** `client/src/slotDrag.ts` (NOVO) — `ArrastoDeSlot` adiciona o
> SEGURAR→arrastar→soltar do Minecraft POR CIMA do gesto de tocar-origem/destino (clique sem
> arrasto continua o toque de sempre). Traz o **fantasma** no cursor, a **divisão de pilha**
> (clique DIREITO pega a metade, arredondada pra cima; segurando, larga 1 item por destino) e o
> **shift-clique**. Anexado à mochila (`inventory.ts`) e ao painel de transferência
> (`container.ts`, com os índices UNIFICADOS — o painel do container fecha o da mochila). Reusa
> o estado `pegando` de sempre e envia `mover_item`/`mover_container` com `qtd?`.
> **T4 — shift-clique (quick move do Minecraft):** `primeiroLugar` (em `slotDrag.ts`) acha o
> primeiro slot que aceita — mesmo id com espaço ou vazio, na ordem do `adicionar` do servidor.
> Mochila: hotbar↔grade. Transferência: mochila↔container.
> **Protocolo — pilha parcial:** `mover_item`/`mover_container` ganharam `qtd?: number` (ausente
> = pilha inteira) com parser que valida inteiro ≥ 1; `moverSlot`/`moverEntre` usam o novo
> `moverParteEmArray` (destino vazio recebe a parte; mesmo id JUNTA até o teto; id diferente
> TROCA a parte pela pilha do destino; no-op devolve o MESMO array). 9 testes novos
> (`inventario.test.ts` + `containers.test.ts`, incluindo a regra da SAÍDA da fornalha).
> **Bateria verde:** `npm test` shared **45/45 arquivos, 811/811 testes** · `npm run typecheck`
> (shared/server/client) ✓ · `npm run build` ✓ · `npm run smoke` **15/15** ✓.
> **Nada commitado ainda** — o commit da sessão 59 é o próximo passo.

> **SESSÃO 58 (2026-08-07) — F10h CULTIVOS (6 CULTURAS + BATATA COZIDA) + bugs 599-604 FIXED.**
> A sessão fechou o playtest da 55: os **6 bugs consertados** (A1-A6), os 2 pedidos de toque
> (B1/B2) e o **pedido de conteúdo F10h** inteiro (6 culturas no molde do algodão + batata
> cozida na fornalha). Todos os 6 bugs do playtest viraram **FIXED** no buglog.json com causa
> raiz e conserto documentados — e o conserto mostrou que duas causas registradas na 55
> estavam erradas (bug-602 era RENDER, não colocação; bug-604 era no SERVIDOR, não em
> physics.ts).
>
> **Bugs 599-604 — todos FIXED (detalhe completo de cada um no buglog.json):**
> - **bug-599** (balde não funciona em survival) — era do CLIENTE: a mira usava `slotLocal`
>   (paleta criativa), que não via o balde da mochila; o raio atravessava a água. Agora usa
>   `hotbarUi.idNaMao() === ITEM_BALDE_VAZIO`. O `slotLocal` morreu (getter removido).
> - **bug-600** (botão "copiar" no touch em survival) — `touch.ts` ganhou `setCopiarDisponivel()`
>   (liga/desliga a classe `hidden`); fiado no handler do `modo` e no boot do runtime.
> - **bug-601** (baú não abre com a mão ocupada) — era do CLIENTE: os ramos comer/balde do clique
>   direito retornavam antes dos checks de container. Nova ordem: comer (só se o alvo não for
>   container/interativo) → varinha → **container/interativo → `use_block`** → balde → quadro →
>   colocar. Regra Minecraft (comida na mão + baú = abre o baú). O servidor nunca teve gate.
> - **bug-602** (laje só na metade de baixo) — NÃO era colocação: a regra metade-pela-face sempre
>   funcionou (`orientacao.ts`). Era RENDER: o mesher cullava a face vertical entre lajes do MESMO
>   id empilhadas. `emitBox` ganhou `fundeVertical`; lajes/escadas chamam com `false`. Teste novo
>   em `cp23.test.ts`.
> - **bug-603** (`/confinar` "travando" o mundo) — conserto de TEXTO: o `/confinar` é OUTRO sistema
>   do `/claim` (o claim guarda só as áreas marcadas; o confinamento restringe todo o mundo à área
>   do grupo). O `status` agora explica isso. ⚠️ "ligar sem grupos bloqueia tudo" continua
>   INTENCIONAL — não foi mudado (decisão de aula).
> - **bug-604** (oxigênio reseta) — `tickFolego` agora REGENERA gradual (`FOLEGO_POR_TICK = 8`,
>   cheio em ~1,9 s a 10 Hz), não mais reset instantâneo; `vitais.ts` só emite quando o nº de
>   bolhas muda. Teste atualizado em `sobrevivencia.test.ts`.
>
> **B1/B2 (pedidos de toque do TODO):**
> - **B1 — fornalha valida o slot de COMBUSTÍVEL**: `moverBloqueadoPorCombustivel` (containers.ts)
>   recusa item que não queima (só `COMBUSTIVEIS`); aviso no chat *"Este item não queima: o slot
>   de combustível da fornalha só aceita lenha ou carvão."* Testes em `containers.test.ts` +
>   `fornalha.session.test.ts`.
> - **B2 — hotbar some com painel/chat/carregando aberto**: `updateOverlay()` faz `toggle` da
>   classe `hidden` na `#hotbar` com a MESMA condição do overlay. (A de toque já sumia.)
>
> **F10h — 6 CULTURAS + BATATA COZIDA (a feature de conteúdo do pedido da 55):**
> cenoura, batata, beterraba, melancia, banana e aipim **no molde EXATO do algodão (F10c)**.
> - **Ids:** blocos 200-229 (4 estágios + pé SELVAGEM por cultura; `base+4` = selvagem; só estágio
>   0 colocável; `MAX_BLOCK_ID = AipimSelvagem`). Itens 916-922 (`ITEM_CENOURA`..`ITEM_AIPIM`,
>   `ITEM_BATATA_COZIDA` = 922), todos em `ITENS`.
> - **PLANTAS:** 8 linhas (trigo `colheitaMax:1` sem selvagem; algodão + 6 novas `colheitaMax:2`).
>   Ordem de plantio: cenoura, batata, beterraba, melancia, banana, aipim. Helpers
>   `plantaPorSelvagem(id)` e `isSelvagem(id)`.
> - **Worldgen (selvagem por bioma):** o campo `algodao` de `biomas.ts` virou o MAPA
>   `selvagem: { [BlockId]: chance }` (chance por coluna). Cerrado: Melancia 1/90 + Aipim 1/70 +
>   Algodão 1/40 · Mata: Banana 1/60 · Araucárias: Batata 1/50, Cenoura 1/110, Beterraba 1/130 ·
>   Caatinga fora. Selvagens mais raros que o capim (descoberta). `worldgen.ts` restruturado:
>   selvarvagens em loop (mais raro vence; sal do algodão `0xa16d` preservado p/ mundos antigos)
>   e o **bug do capim zerado corrigido**: capim agora é guardado por `getBlock == Air` (o
>   `else if (selvagens.length > 0)` comia o capim). Coberto por teste com múltiplas seeds.
> - **Drops:** a régua `CHANCE_SEMENTE_DO_ALGODAO = 2/3` vale pra todos os selvagens (pé selvagem →
>   1 item base por sorteio); maduro → `colheitaMax > 1 ? sorteio : 1` + semente de volta.
> - **Comida:** SACIEDADE — Cenoura 4 · Batata crua 1 (empurrão pra fornalha) · Beterraba 1 ·
>   Melancia 2 · Banana 4 · Aipim 4 · **Batata cozida 5 (= pão)**. **Fornalha**: `COZIMENTO`
>   ganhou `[ITEM_BATATA, { id: ITEM_BATATA_COZIDA, qtd: 1 }]`.
> - **UI/mesher:** TILEs 135-164 (24 estágios + 6 selvagens); `paintCultura` unificado com sal fixo
>   por cultura; ícones de comida desenhados pros 7 itens; nomes em `blocksUi`/`hotbarUi`.
> - **`SEM_RECEITA`**: as 6 sementes + 6 pés selvagens com razão (molde do algodão).
>
> **Bateria verde:** `npm test` shared **45/45 arquivos, 802/802 testes** · `npm run typecheck`
> (shared/server/client) ✓ · `npm run build` ✓ · `npm run smoke` **15/15** ✓. Novos/atualizados:
> `culturas.test.ts` (novo), `algodao.test.ts`, `rules.test.ts`, `blocks.test.ts`,
> `session.test.ts` (o `/bloco` "id inválido" 200→300), `sobrevivencia.test.ts`,
> `containers.test.ts`, `fornalha.session.test.ts`, `cp23.test.ts` (bug-602).
> **Nada commitado ainda** — o commit da sessão 58 (feature + fixes + testes) é o próximo passo.

> **SESSÃO 57 (2026-08-07) — bug-605 FIX: MECÂNICA DE SUFOCAMENTO (SOTERRADO) IMPLEMENTADA.**
> Implementação completa + testes + bateria verde. Mecânica final: (1) soterrado por sólidos
> recebe dano de sufocamento CONTÍNUO (1 coração/s, só sobrevivência); (2) a cada tick busca vão
> livre num RAIO DE 2 — achar = `teleportar()` pro vão (dano para); (3) NÃO achar vão = não pode
> se mover (servidor rejeita o `move` que entra em sólido) E morre de sufocamento → respawn.
>
> **O que mudou:**
> - `shared/src/sobrevivencia.ts` — `CausaDano`/`CAUSAS` + `"sufocamento"`; consts
>   `TICKS_POR_DANO_SUFOCAMENTO = 10`, `DANO_SUFOCAMENTO = 2`; `EstadoVital.sufocandoTicks` (não
>   vai pro save); função pura `tickSufocamento(e, soterrado)` (espelha `tickFome`, o dano cai no
>   10º tick); `textoDaMorte` case `"sufocamento"` → `${nome} ficou soterrado.`
> - `shared/src/physics.ts` — `sobrepoeSolidos(world, pos)` (wrapper de `collides`); nova
>   `acharEspacoVago(world, pos, raio = 2, rejeitar?): Vec3 | null` (busca por coluna via
>   `findSpawnY`, coluna própria → anéis de Chebyshev até o raio; coluna cheia até o TETO do mundo
>   não é vão — `inBounds` — senão "sem vão" seria impossível; determinística).
> - `shared/src/session/vitais.ts` (`tickVitais`) — soterrado → `tickSufocamento` → dano via
>   `machucar(..., "sufocamento")`; achar vão (raio 2, veto `overlapsAnyPlayer`) → `teleportar()`.
> - `shared/src/session.ts` (handler `move`, ~881) — posição nova soterrada: tenta vão raio 2 →
>   teleporta; sem vão → REJEITA (não atualiza pos, sem relay, manda `teleport` de volta à posição
>   válida atual, o cliente "quica" na parede).
> - `client/src/main.ts` (~813) — case `msg.causa === "sufocamento"` na morte.
>
> **Testes (785/785 + 15/15 smoke):** 2 puros novos em `sobrevivencia.test.ts` (tickSufocamento +
> textoDaMorte) + 3 de integração de sessão (sem vão → dano repetido + move rejeitado + morte/
> respawn; com vão no raio 2 → teleport pro vão e dano para; criativo sem dano). **4 testes
> antigos de `session.test.ts` foram ATUALIZADOS** p/ posições válidas (`findSpawnY`) — o y=20
> que usavam ficava dentro de bloco sólido e a nova validação (corretamente) recusa.
>
> **Bateria:** `npm run typecheck` (shared/server/client) ✓ · `npm test` 785 ✓ · `npm run build` ✓
> · `npm run smoke` 15/15 ✓. buglog bug-605 → **FIXED**.

> **SESSÃO 55 (2026-08-07) — PLAYTEST DO F10 NA ESCOLA: 6 BUGS RELATADOS + PEDIDO DE CULTIVOS.**
> Sessão ao vivo com a turma em curso; o usuário relatou os bugs um a um e eu registrei (nenhum
> foi consertado — registrar era o pedido). **bugs 599-604 no buglog.json**, todos
> `playtest-escola-2026-08-07`, `root_cause: NÃO INVESTIGADO`:
>
> - **bug-599** — balde de água não funciona no modo sobrevivência (900/901 não cria/recolhe).
> - **bug-600** — remover botão "copiar" dos controles do tablet no sobrevivência (botão do meio
>   não faz sentido lá; esconder do touch UI no modo sobrevivência).
> - **bug-601** — não abre baú com a mão ocupada (gate do use_block/container).
> - **bug-602** — laje (meio bloco) só coloca na metade de BAIXO (metade de cima nunca sai;
>   provável falha da regra "metade pela face clicada").
> - **bug-603** — `/confinar` travando TODO o mundo, não só fora das áreas; o esperado é que ele
>   só ATIVE/DESATIVE o sistema de claim (mantendo `/claim` + varinha). **Pergunta do usuário:
>   esse comando substituiu o `/claim` e a varinha?** Revisar a relação entre os três.
> - **bug-604** — barra de OXIGÊNIO reseta ao sair da água; o correto seria REGENERAR até 100%
>   (contínuo, estilo Minecraft). Conferir o handler do nado/sufocamento em physics.ts.
>
> **Pedido de conteúdo (vira TODO, não bug):** comidas/cultivos — **cenoura, batata, beterraba,
> melancia, banana e aipim** no molde do algodão (F10c) + **batata COZIDA na fornalha** (batata
> crua → cozida, tabela da F10b). E a validação do slot de COMBUSTÍVEL da fornalha (só item com
> `energiaCombustivel > 0`; já anotado no todo.md, refino existente). Tudo isso está no
> `todo.md` (comidas/cultivos + fornalha-combustível + esconder hotbar com menu aberto — este
> último JÁ EXISTIA no TODO da 48).
>
> **VERDE:** nada rodado (sessão de registro apenas). Nenhum código mudou.

> **SESSÃO 56 (2026-08-07) — REGISTRO DE PÓS-PLAYTEST: bug-605 + 2 PEDIDOS DE TOUCH NO TODO.**
> Continuação do playtest (nada de código mudou, sessão de anotação). O usuário pediu a
> mecânica de **sufocamento** (jogador soterrado anda dentro dos blocos) e 2 refinos de UI de
> toque. Tudo anotado:
> - **bug-605** no buglog.json (ABERTO, `root_cause: NÃO INVESTIGADO`): jogador fica soterrado
>   por blocos sólidos e anda livremente por dentro deles. Mecânica pedida: (1) dano de
>   sufocamento CONTÍNUO enquanto soterrado (`aplicarDano`, nova `CausaDano` + `textoDaMorte`),
>   (2) teleportar pro espaço vago mais próximo (`teleportar()` de tp.ts), (3) sem espaço vago →
>   morte. Gate no servidor (`session.ts`, perto do `overlapsAnyPlayer` ~1977) — física é
>   client-side e o servidor confia no `move`.
> - **todo.md (Mobile/toque):** comer no tablet — o botão ▣ "colocar" vira 🍎 "comer" quando o
>   slot selecionado tem comida (`isComida(hotbarUi.idNaMao())` + `mochila.ativa`), e só mostra
>   "comer" com fome pra gastar (barra cheia → continua ▣); recusa final no servidor.
> - **todo.md (Mobile/toque):** renomear o botão "🧱 blocos" → "🎒 mochila" quando `mochila.ativa`
>   (sobrevivência); criativo continua "blocos".
> - **todo.md (Sistema de sobrevivência):** item do bug-605 (mecânica de sufocamento completa).
> 
> **VERDE:** nada rodado (anotações apenas). Nenhum código mudou.

> **SESSÃO 54 (2026-08-06) — OS DOIS BUGS QUE ELE RELATOU, E UM TERCEIRO QUE O TESTE DO PRIMEIRO
> ACHOU E QUE NÃO FOI CONSERTADO.** Pedido de uma frase, com dois defeitos misturados: *"bug de
> iluminação, depois de colocar a tocha no chão, qualquer bloco quebrado continua fazendo sombra
> … esc fecha todos os menus e vai direto para o menu esc?"*. Os dois reproduzidos no cliente
> REAL antes de qualquer conserto. 3 commits.
>
> **bug-596 — e a frase dele já continha o diagnóstico: "depois de colocar a tocha".** Quebrar
> bloco OPACO nunca re-semeava o canal de luz de BLOCO. A célula era parede, logo tinha nível 0,
> logo o `apagar` saía na PRIMEIRA LINHA sem coletar vizinho nenhum; `luzEmitida(Air)` é 0; e o
> `propagar` recebia fila VAZIA. Ficava 0 pra sempre. **O canal do CÉU já semeava os 6 vizinhos
> ao abrir a célula, dez linhas abaixo, no mesmo `atualizarBloco`** — o do bloco não. Sem emissor
> no mundo não há luz de bloco pra faltar, e é por isso que só aparece com tocha.
>
> **O teste que vale é o de FUZZ, e ele achou dois bugs de uma vez.** `atualizarBloco` e
> `acenderColuna` calculam a MESMA função dos bytes, então cruzá-los célula por célula depois de
> 200 edições aleatórias pega qualquer semente esquecida em qualquer canal. **Um caso escrito à
> mão só pega o buraco que quem escreveu já suspeitava.**
>
> **bug-597 — e a causa não está no Esc, está no PONTEIRO.** O menu de pausa é desenhado por
> AUSÊNCIA (`!input.active`). Fechar painel chama `input.lock()`, mas o Esc do painel É o Esc do
> usuário, e o Chrome recusa `requestPointerLock` por ~1,25 s depois dele (a carência do
> bug-585). O pedido falha e a ausência vira "pausa". `Input.retomando` passou a distinguir "não
> tenho o ponteiro" de "estou PEDINDO ele". De brinde, o `reagendarLock` passou a cumprir o "uma
> tentativa e só uma" que o comentário já prometia — sem isso ele se reagendava a cada recusa e o
> `retomando` nunca voltaria a false, escondendo o menu de pausa pra sempre.
>
> **`npm run shots:esc` é NOVO, e é o par de DESKTOP do `shots:toque`** — que cobre a regra dos
> painéis justamente no aparelho onde pointer lock não existe. Era esse o vão por onde o 597
> passou. Três seções, com clique real no canvas: Esc no painel fecha só ele (**12 amostras em
> 3 s, porque o defeito PISCA** — uma leitura só depois de 2 s não o pegaria) · Esc na tela livre
> abre a pausa · **lock recusado DE VEZ devolve a pausa** (esta existe porque a correção podia
> esconder o menu pra sempre, e o A/B mostra que ela pega exatamente isso).
>
> ⚠️ **bug-598, ACHADO PELO FUZZ E NÃO CONSERTADO — está aberto.** Os dois motores de céu
> discordam sobre a PRÓPRIA célula que atenua (folha, água): o de coluna escreve o nível que
> CHEGA (15) e desconta só pra quem está abaixo; o BFS cobra passo + opacidade e escreve 13. As
> células de baixo coincidem em 14 num caso isolado, mas com copa larga a divergência se espalha.
> **Consertar exige mudar o modelo de raio de sol do `propagar`** (guardar "esta luz veio reta do
> céu" pra sobreviver à atenuação) — desenho novo, efeito visual em todo mundo gerado, e as
> cavernas dependem da regra atual. Fora do escopo dos dois pedidos. O fuzz tira folha e água da
> paleta **com a razão escrita no próprio teste**.
>
> ⚠️ **Armadilha de ferramenta que custou TRÊS repros falsos, no do-not-repeat:** `node --import
> tsx script.mts` **não checa tipo**. `BlockId.Pedra` não existe (é `Stone`), virou `undefined`
> em silêncio, e o `setBlock` construiu um mundo de AR — três repros seguidos "provaram" que não
> havia bug nenhum. Quem achou foi o `tsc --noEmit`, e a mesma armadilha derrubou o primeiro fuzz
> (`BlockId.Vidro`/`Folhas`).
>
> **VERDE:** typecheck 3/3 · **781 testes (+3)** · build · **15/15 smokes** · **`shots:f10` OK** ·
> **`shots:toque` OK** · **`shots:esc` OK (novo)** · **`shots:luz` 5/5** (razão 0.41).

> **SESSÃO 53 (2026-08-06) — A FILA DO `GameRuntime` FECHOU, E A ÚLTIMA FRENTE ACHOU UM CAMINHO
> SEM VOLTA QUE NINGUÉM TINHA VISTO.** Sessão de uma palavra ("continuar"): as frentes 5 e 6
> estavam escritas e ordenadas desde a 51, e foi a fila que mandou. **`main.ts` 2.174 → 2.176 —
> e o número mentiria se lido sozinho: o corpo do `startGame` (1.110 linhas de closure) virou
> uma classe, e o que entrou de volta foram as 44 declarações de campo e as chaves dos métodos.**
> 2 commits + o dist.
>
> **§🎮 5. `MovimentoDoJogador`, e a decisão que a 52 deixou em aberto foi resolvida do lado
> caro:** os duplo-toques e a câmera **subiram pro `shared/`** em vez de sair com o aviso de "o
> controle é o playtest". A razão é a do `FreioDePose` (§📡): **lá há onde rodar teste**. São
> quatro regras que erram calado — `sprintLatch`/`forwardWasDown`/`lastForwardTap`,
> `jumpWasDown`/`lastJumpTap`, `eyeHeight`, `stepSuave` — e o `posAnt{X,Y,Z}` (o odômetro do
> perfil) ficou no cliente, que é onde ele serve.
>
> **`shared/src/controleJogador.ts`: `DuploToque` + `ControleDoJogador`, 21 testes.** O detector
> conta BORDA de subida e anota o relógio em TODA borda — **três toques batem duas vezes, e isso
> foi mantido de propósito** (era o que o laço fazia; mudar é mudar o controle). **A propriedade
> que mais paga é a independência de FPS:** os dois decaimentos são `exp(-dt·k)`, e um `1 - dt·k`
> linear compila, parece igual a 60 fps e fica pesado a 20 — que é o Kindle Fire do alvo.
>
> **A/B honesto em SEIS frentes, e duas delas voltaram contra mim — é o achado metodológico da
> sessão.** `<` → `<=` derruba 2 asserções · anotar a borda depois do `return`, 8 · degrau
> linear, 1 · teto do degrau removido, 1 · sentinela do relógio de volta em `0`, 4. **As duas que
> NÃO derrubaram nada:** (a) inverter as duas linhas do `correndo` é INÓCUO — as duas guardas são
> condições opostas sobre a mesma tecla, e o comentário do teste que afirmava o contrário estava
> errado e foi corrigido; (b) trocar a suavização do olho por linear passava, porque o teste
> media o FIM da transição — qualquer suavização converge se der tempo. **Refeito pra medir o
> MEIO (0,1 s), e aí o linear cai.** A lição está no cerebrum: *um A/B que não derruba nada é um
> teste fraco ou uma afirmação falsa — nos dois casos o resultado é do experimento, não do
> código.*
>
> **bug-594, latente e sem sintoma:** `lastForwardTap = 0` guardava "nunca houve toque" com o
> MESMO valor que `performance.now()` tem na navegação — nos primeiros 300 ms o primeiro toque
> contaria como duplo e a corrida engataria sozinha. Sentinela virou `-Infinity`.
>
> **§🎮 6. `GameRuntime`, e o preço do `startGame` estava FORA dele.** Dezesseis `let … | null`
> de módulo existiam só pra que o despachante alcançasse aquele escopo, e os tipos que eles
> declaravam à mão eram **cópias do protocolo** (`applyBlockChanged` re-escrevia `{x,y,z,blockId}`
> na unha). Os 44 bindings viraram campos (29 `readonly`), o corpo virou construtor, o laço virou
> `iniciar()`, e os 16 ganchos viraram MÉTODOS. **`started` some: `jogo !== null` é a mesma
> pergunta.** O `hudAtual`, com sua interface estrutural de três métodos, virou o campo `hud`.
>
> **E a conversão achou um caminho sem volta que ninguém tinha visto:** o `started` era setado
> FORA do `startGame`, então um snapshot sem conexão o deixava `true` **com o jogo nunca
> construído** — nem `startGame` nem `reloadWorld` rodariam depois, para sempre. Agora a saída
> sem conexão deixa `jogo` em `null` e o próximo snapshot tenta de novo. Nunca aconteceu (o
> `connect()` vem antes do snapshot), mas era irrecuperável.
>
> **A conferência que autorizou o remanejo, e ela vale mais que o typecheck:** diff das linhas de
> código antes/depois **com `this.` removido** — toda linha que sumiu tem contrapartida na que
> apareceu. Ela achou **dois defeitos do próprio remanejo** que compilavam: `lookDir`
> inicializado DUAS vezes (campo + construtor) e o `reloadWorld` chamando `applyObjectiveBoxes`
> pelo ponteiro de módulo em vez de `this`. **O `tsc` passou nos dois.**
>
> **A/B do 6, com rebuild entre cada um** (o f10 e o toque servem `client/dist` — do-not-repeat
> da 52): sem `applyBlockChanged` o `shots:f10` cai em 8 asserções a partir de "o toque no ▣
> abriu o painel"; sem `aplicarColunas` o `shots:luz` cai em "as duas cenas foram capturadas" (a
> tela de carga nunca sai).
>
> **VERDE:** typecheck 3/3 (binário cru, bug-586) · **778 testes (+21)** · build · **15/15
> smokes** · **`shots:f10` OK** · **`shots:toque` OK** · **`shots:luz` 5/5** (dia 21.7, noite
> 8.4, razão 0.39).
>
> ⚠️ **bug-595 registrado SEM conserto:** o smoke `atividade` falhou 1 vez em 3 rodadas da suíte
> inteira e passa isolado em 3 s. Os smokes não tocam o cliente, então não pode vir desta sessão
> — anotado pra não custar bissecção depois.


> **SESSÃO 52 (2026-08-06) — QUATRO DAS SEIS FRENTES DO `GameRuntime`, E DUAS DELAS ACHARAM
> BURACO NO CONTROLE, NÃO NO CÓDIGO.** Sessão de uma palavra ("continuar"): a fila da 51 estava
> escrita e ordenada, e foi ela que mandou. **`main.ts` 2.343 → 2.174.** 4 commits.
>
> **§🧹 1. `MateriaisMundo`** — o atlas, os três materiais do chunk, os uniforms do balanço
> (§🌬️) e da luz (§💡) e os quatro `let` da animação da água. Estavam separados por 200 linhas
> mas são uma coisa só: o laço mexia em SEIS pontos que só existem por causa deles, e agora
> chama `atualizar(dt, vento, nivelCeu, balanco)` uma vez. O balanço veio junto de propósito
> (era `let` de módulo, e só o material do terreno o lê).
>
> **bug-592, e é a razão de esta frente valer mais que as linhas que economizou.** A regra que o
> construtor guarda é `aplicarBalanco` ANTES de `aplicarLuz` (os dois enxertam
> `onBeforeCompile`, o three guarda UM só). **Trocar não dá erro de shader nenhum:** o terreno
> deixa de escurecer à noite, céu/água/vidro continuam escurecendo, e a razão noite/dia vai de
> 0,37 pra **0,69** — passando raspando no `< 0,75` que o `shots:luz` cobrava. Portão apertado
> pra **0,55** (medidas com a ordem certa: 0,40 · 0,40 · 0,37 · 0,35 · 0,33 · 0,38 · 0,39) e
> verificado NOS DOIS SENTIDOS: ordem trocada falha com 0,74, ordem certa passa com 0,33.
>
> **§🧹 2. `ProgressoCarga`** — o total esperado do raio inicial. O estado próprio é um número
> só, e é por ser um número só que merecia dono: escrito em TRÊS pontos separados por 1.000
> linhas e lido 60×/s pelo portão do laço. A conta já tinha subido pro `shared/colunas.ts` na
> 51. As contagens vivas chegam por CALLBACK — o `Set` é reassinado na troca de aula (a
> armadilha que o `ColunasFaltando` documentou na 50). **A/B:** com `raioCompleto` fixo em
> `false` a tela nunca fecha, o `iniciarBench` (que roda no fechamento) nunca dispara e o
> `shots:luz` morre em "o bench não começou em 180s".
>
> **§🧹 3. `PainelHost`** — cinco `let` de módulo viraram um objeto, e com eles a regra da §48
> que estava em **cinco cópias** do mesmo `if` mais três cascatas de `hide()` em ordens
> diferentes. O que ficou escrito: o portão é só pra ABRIR (fechar sempre pode, senão o menu se
> tranca sozinho); `podeAlternar` existe separado porque o cp14 tem gate próprio no meio (o
> aviso de "sem grupos" sai ENTRE o portão e o toggle); `trocarPara*` são TROCA e não passam
> pelo portão; o container é a exceção declarada (quem o abre é o servidor).
>
> **A regra da §48 não tinha asserção NENHUMA — ganhou a seção D do `shots:toque`**, no palco
> que a seção C já deixava pronto (mochila aberta): G não abre amigos por cima, Enter não abre
> o chat por baixo, E ainda fecha a mochila, e com a tela livre o G abre. **A/B:** com
> `podeAbrir` fixo em `true` a seção D acusa 3 falhas.
>
> **§📡 4. `FreioDePose` — e ele foi pro `shared/`, não pro cliente, porque LÁ HÁ ONDE TESTAR.**
> "Manda quando muda; parado, heartbeat 1×/2 s" são duas comparações que erram calado, e o
> número que protegem é da LAN da escola (20 alunos parados = ~200 msg/s sem o freio). **7
> testes novos.** A/B: sem heartbeat caem 2 asserções; guardando a REFERÊNCIA da pose em vez de
> cópia cai 1. **`lastNet` NÃO veio junto** apesar de estar na lista da fase: é a taxa de rede
> do HUD, não tem a ver com envio de posição, e juntar faria sacola em vez de fronteira.
>
> **bug-593 — o achado da sessão, e ele veio de uma flakiness que eu primeiro tomei por
> lentidão.** O painel de container REABRE em `atualizar`, e a fornalha cozinhando manda
> `container` 10×/s: entre o clique em "fechar" e o servidor ver o `fechar_container` cabem
> mensagens que já estavam no fio — e o `fechar_container` **não respondia nada**, então nada as
> desfazia. O painel voltava **ZUMBI**: na tela, mas o servidor já o esquecera, logo nunca mais
> atualizava e todo clique pedia `mover_container` de um container fechado. No f10 o efeito era
> pior do que parece: com a fornalha de volta, a regra "um menu por vez" impedia o baú de abrir
> e as três asserções seguintes mediam o painel ERRADO — 4 falhas que leem como defeito de
> container. **Conserto dos dois lados:** o servidor CONFIRMA (reusando `fecharContainer`, que
> já mandava `container_fechado` — nenhuma mensagem nova no protocolo) e o cliente descarta
> `container` da MESMA célula entre o pedido e a confirmação; a ordem do TCP faz o resto.
>
> **O A/B do 593 precisou de ENCENAÇÃO, e a lição está no cerebrum:** a corrida não reproduz sob
> demanda (2 falhas em ~8 rodadas). O que provou foi injetar no servidor a mensagem em voo, na
> ORDEM certa — antes de tratar o pedido. Com o código ORIGINAL + injeção o f10 reproduz as 4
> falhas observadas; com o conserto + a MESMA injeção, verde. **A primeira tentativa injetou
> DEPOIS da confirmação e "falhou dos dois lados": numa corrida, a ordem da encenação É o
> experimento.**
>
> **bug-591, e ele custou uma bissecção falsa:** o `shots:f10` esperava `espera(900)` seca por
> round-trip de servidor. Virou `ateQue(ler, satisfeito, 4000)` sondando a cada 100 ms. **A
> primeira bissecção com `git stash` deu FALSO NEGATIVO porque o f10 serve `client/dist`** — o
> cliente COMPILADO. Stashar o fonte sem `npm run build` mede o binário velho. Está no
> do-not-repeat.
>
> **VERDE:** typecheck 3/3 (binário cru, bug-586) · **757 testes (+7)** · build · **15/15
> smokes** · **`shots:f10` OK** (com a asserção nova do 593) · **`shots:toque` OK** (com a seção
> D nova) · **`shots:luz` 5/5** (dia 22.8, noite 8.9, razão 0.39, contra o portão novo de 0,55).

> **SESSÃO 51 (2026-08-06) — A ROTA BARATA RENDEU MAIS QUE A CARA, E ELA ACHOU UMA CONSTANTE
> COPIADA À MÃO.** Sessão de uma frase (*"aborda do melhor jeito que achar"*) depois de eu pôr
> as duas rotas da 50 na mesa: (A) `startGame` → classe `GameRuntime`, do tamanho do que a 49
> fez no servidor e **sem teste de controle no cliente**; (B) continuar subindo lógica PURA pro
> `shared/`. Escolhi B — foi o que mais rendeu na 50 — e ela pagou melhor do que o STATUS
> previa.
>
> **Dos três candidatos que a 50 anotou, só UM era real, e ele era muito maior que o anunciado.**
> `target + normal` é `t.x + t.nx` inline em dois lugares (nada a extrair) e `podeVoar()` já
> delega ao `podeVoarNoModo` do shared — sobra uma linha. **O terceiro, `calcularTotalCarga`,
> não era uma função de 8 linhas: era a sexta cópia da mesma conta.**
>
> **§🧹 `shared/src/colunas.ts` — a geometria do raio de colunas num lugar só.** A regra que faz
> o streaming F2 dispensar mensagem de unload é cliente e servidor descartarem IGUAL (raio +
> folga). Ela estava escrita **seis vezes**: 2× em `session/streaming.ts` (enviar e evictar), 2×
> em `main.ts` (o total da tela de carga e a varredura de descarte 1×/s) e 1× em
> `colunasFaltando.ts`. `colunaDaPosicao` · `distanciaColunas` · `colunaInteressa` ·
> `colunaKey`/`colunaDeKey` · `contarColunasNoRaio`, e os seis pontos religados.
>
> **bug-590, latente e sem sintoma: o cliente DIGITAVA a folga.** `settings.raioRender + 2` e
> `player.pos.x / 16`, enquanto o servidor lia `FOLGA_DESCARTE` e `CHUNK_SIZE`. Nada quebra
> enquanto os dois números não mudam; no dia em que mudassem, o cliente guardaria coluna que o
> servidor já esqueceu e o sintoma seria buraco no mundo, longe do arquivo editado. **Achar isso
> exige procurar pelo NÚMERO literal — `grep FOLGA_DESCARTE` no cliente dá zero, e é esse o
> ponto.**
>
> **O teste que dá razão ao módulo cruza DUAS implementações do mesmo conjunto:** o cliente conta
> por fórmula fechada (retângulo recortado pelas bordas), o servidor ENUMERA andando em anéis
> (`streamColunas`). Se discordarem por uma coluna, a tela de carga nunca fecha — ou fecha com o
> mundo furado. 4 dos 11 testes novos sobem uma `GameSession` lazy de verdade, drenam o stream e
> conferem o CONJUNTO, no centro e em três bordas. **A/B honesto:** com o recorte de borda
> removido do `contarColunasNoRaio`, 4 asserções caem (o canto manda **49** colunas, a fórmula
> sem recorte diz **169**) e **o caso do centro segue passando** — é a BORDA que o teste mede, e
> um caso no meio do mundo não provaria nada.
>
> **VERDE:** typecheck 3/3 (binário cru, bug-586) · **750 testes (+11)** · build · **15/15
> smokes** · **`shots:f10` OK** e **`shots:toque` OK** — os dois com exit 0 e o veredito do
> próprio script (`SHOTS /f10 OK` / `tudo certo`); capturei só a CAUDA dos logs, então não
> recontei as 22 e as 15 asserções uma a uma.
>
> **SESSÃO 50 (2026-08-06) — O CORTE DO `main.ts` ANDOU, E A ÚLTIMA PEÇA DA FILA NÃO FOI
> CORTADA DE PROPÓSITO.** Sessão de uma palavra ("continue"): a fila da 49 estava escrita e
> ordenada por valor/risco, e foi ela que mandou. **`main.ts` 2.600 → 2.339**, `startGame`
> 1.646 → 1.283.
>
> **§🧹 `ColunasFaltando`** (item 1 da fila): o mapa dos buracos, os quatro números do backoff
> e o contador de repedidas. A decisão que importa é o que NÃO entrou no construtor —
> `colunasCarregadas` é REASSINADO na troca de aula, então guardar a referência daria um Set
> fantasma do mundo velho; ele chega por parâmetro a cada varredura. Descartar e pedir entram
> como callback (descartar mexe em quatro donos: mesh, tochas, luz e os bytes). **De brinde, o
> descarte virou UMA função:** o laço de distância do render e a repedida faziam as mesmas
> quatro operações, lado a lado, havia meses.
>
> **§🧹 `HotbarUi`** (item 2, o das 81 referências): 9 slots locais com persistência, o
> selecionado, o modo varinha, os ícones recortados do atlas e a tabela de nomes PT. A regra
> que dá sentido ao conjunto **agora está escrita no topo da classe**: em sobrevivência os 9
> slots são os do SERVIDOR (`mochila.hotbar()`), em criativo são a paleta do inventário — e é
> por isso que `idNaMao()` existe. **`slotLocal` é a exceção deliberada:** a mira do balde
> vazio lê o slot LOCAL mesmo em sobrevivência, como fazia antes de a mochila existir, e isso
> ficou documentado em vez de "consertado".
>
> **§🧹 A ORIENTAÇÃO SUBIU PRO `shared/` E GANHOU 24 TESTES — é o achado da sessão.** A regra
> que decide o id final ao colocar (eixo da porta/janela pelo olhar, frente do móvel e da
> fornalha encarando quem colocou, metade da laje e direção da escada pela face clicada) eram
> **sete `if` dentro do handler do botão direito**, e o caminho de volta (o botão do meio copia
> o bloco mirado pra entrada única da família) **mais nove no handler do botão do meio**.
> Puros, e sem teste nenhum — no cliente não há onde rodar um. Viraram
> `shared/src/orientacao.ts`: `orientarParaColocar` e `ancoraDeCopia`, **o mesmo contrato visto
> dos dois lados**, e é isso que o teste cobra (`ancoraDeCopia(orientar(a, …)) === a` pra toda
> âncora × 4 olhares × 2 faces). **A/B honesto:** o código velho copiado verbatim contra o novo
> em **30.800 casos** (todo id × 40 olhares × 2 faces) e nos 200 ids do copiar — **0
> diferenças**.
>
> **O item 3 da fila (`handleServerData`) NÃO foi cortado, e a razão está no cerebrum.** São
> 217 linhas que mexem em ~30 `let` de módulo; extrair exigiria um objeto de contexto de ~30
> campos cujo único trabalho é reexpor o escopo do arquivo — **mais linhas, não menos**, e uma
> indireção entre o nome da mensagem e o que ela faz. É a MESMA decisão que a 49 tomou sobre o
> `handleMessage` do `session.ts`. **O critério de corte é ter FRONTEIRA (estado próprio + API
> estreita), não tamanho:** `ColunasFaltando` tem um mapa e dois callbacks, `HotbarUi` tem nove
> slots e o que se faz com eles; o despachante não tem — ele é a porta.
>
> **VERDE:** typecheck 3/3 (binário cru, bug-586) · **739 testes (+24)** · build · **15/15
> smokes** · **`shots:f10` 22/22** · **`shots:toque` 15/15** · **`shots:luz` 5/5** (dia 22.1,
> noite 8.9, razão 0.40). **2 commits.**
>
> ⚠️ **Armadilha de ferramenta paga aqui, no cerebrum:** `npm run shots:luz` **não sobe o dev
> server** (o f10 e o toque sobem host próprio; o luz só sobe o Chrome). Sem `:5173` no ar ele
> espera 180 s e morre — e com pipe pra `tail` não sai NADA na tela.
>
> **SESSÃO 49 (2026-08-06) — A CONVERSA DE STACK VIROU UM DIAGNÓSTICO, E O DIAGNÓSTICO VIROU
> O CORTE POR DOMÍNIO.** A sessão abriu com o pendente da 48 (`git fetch`: local 1 commit à
> frente, nada novo no remote) e a análise dos três eixos que ele levantou. **Nenhum dos três
> sobreviveu ao próprio contexto do projeto — e ele descartou dois sozinho.**
>
> **A ANÁLISE, e o fato que quebrou a premissa do pedido.** O servidor autoritativo **não mora
> em `server/`**: mora em `shared/session.ts`, que tinha **4.677 linhas, 205 métodos e 65 `case`
> de protocolo**. `server/` são 2.451 linhas de transporte puro. Então "migrar o servidor pra
> SpacetimeDB" custava reescrever `session.ts` inteira em Rust — **e matava o singleplayer
> offline**, porque hoje a MESMA `GameSession` roda num Web Worker sem servidor nenhum
> (`server/src/worker.ts`), que é o que faz a aula sem wi-fi funcionar. Cliente em Rust custava
> os 11.7k do cliente MAIS os 14.2k de `shared/` (mesher, luz, física e raycast rodam no
> CLIENTE), levava junto os 715 testes, e **não roda no Fire**. Janela nativa (Tauri) era o
> único barato — e no Fire continuaria sendo uma webview, só que mais velha que o Chrome que ele
> já usa.
>
> **A resposta dele fechou o escopo:** *"separa o session.ts e main.ts por dominio… esquece a
> ideia do spacetimedb, parecia boa por o problema real é outro"*. E sobre a janela: ela era
> só pra **manter o mouse capturado e o aluno não sair do jogo** — não um requisito de produto.
>
> **§🧹 `session.ts` VIROU 12 ARQUIVOS: 4.677 → 2.163 no core + 11 módulos** (`session/`):
> cenário 535 · equipes 586 · vitais 306 · modo 263 · regiões 238 · tp 221 · inventário 177 ·
> containers 150 · ambiente 147 · streaming 112 · avisos 20 · coords 21.
>
> **O que autorizou o corte foi uma conferência de uma linha:** `grep -c "as any"` nos testes de
> session = **0**. Nenhum dos 715 testes toca campo interno, então a API pública é a única
> superfície e os testes valem como CONTROLE do refactor. Sem isso, seria aposta.
>
> **O padrão: funções livres que recebem `ses`, não mixin nem prototype merging.** A classe
> continua dona do estado e da API (`handleMessage`, `tick`, `toSave`, `adotar`, `banir`…), que
> não mudou uma linha. O ciclo core↔domínio some porque a volta é `import type`; ciclo ENTRE
> domínios (modo↔vitais↔inventário) é seguro porque `export function` é hoisted. **Os campos
> perderam o `private` porque TS não tem visibilidade de PACOTE** — a razão está escrita num
> bloco no topo da classe, não em 40 `@internal` soltos.
>
> **Duas coisas mudaram de casa por serem de mais de um domínio:** `parseCoordArg` (o `~` do
> Minecraft, usado por `/bloco`, `/regiao` e `/tp`) → `session/coords.ts`; e o freio de aviso
> `avisarComFreio` (mochila cheia, baú cheio, falta picareta) → `session/avisos.ts`.
>
> **§🧹 `main.ts`: 2.725 → 2.600, e AQUI O TRABALHO NÃO FECHOU — ver "Próxima fase".** O padrão
> do cliente é outro e ele já estava no arquivo: `main.ts` não é classe, é script com **51 `let`
> de módulo** e um **`startGame` de 1.646 linhas de closure**. Ali o corte que funciona é
> composição por classe — o que `TorchGlow`, `RegionRenderer`, `AguaFx` e `ChunkRenderer` já
> fazem. Saíram dois subsistemas: **`LuzCliente`** (a grade, a fila de colunas, o orçamento por
> frame e o custo — estavam espalhados por SEIS pontos) e **`RemotePlayersView`** (caixa,
> plaquinha e o LERP; a mira do pvp vem junto de propósito, porque ela tem de medir contra a
> posição interpolada, que é a que o aluno vê).
>
> **bug-585 — e ele é a resposta REAL ao "aluno saindo do jogo".** A Keyboard Lock API já
> existia (`shortcutGuard.ts`) com `Escape` fora do lock **de propósito** (o menu de pausa
> precisa dele). O defeito era outro: **o Chrome recusa `requestPointerLock` por ~1,25 s depois
> de o usuário sair com Esc**, e o retry que existia era IMEDIATO — caía dentro da mesma
> carência e falhava junto. As duas falhas eram SILENCIOSAS (não havia listener de
> `pointerlockerror`): o aluno clicava em "voltar ao jogo", nada acontecia, clicava de novo,
> nada, e concluía que o jogo travou. Agora o erro reagenda UMA tentativa depois da carência.
>
> **bug-586, e é armadilha de FERRAMENTA:** `npx tsc` passa pelo hook do rtk e devolveu 2 erros
> CACHEADOS em `vitals.ts` que não existem (binário cru: exit 0, saída vazia). Cheguei a rodar
> `git stash` pra bissectar um erro inexistente. Está no do-not-repeat.
>
> **VERDE:** typecheck 3/3 · **715 testes** (os mesmos — refactor não inventa teste) · build ·
> **15/15 smokes** · **`shots:f10` 22/22** · **`shots:toque` 15/15** (incluindo "o toque no ☰
> não pede pointer lock, pedidos=0" — o caminho de dedo não mudou) · **`shots:luz` 5/5**
> (shader compila, meio-dia 21.8, meia-noite 8.8, razão 0.40). **3 commits.**

## ⚠️ Pendência externa

**17 commits locais NÃO empurrados** (sessões 52, 53 e 54). `git fetch` na 54: nada novo no
remote, o local está só à frente. **Não empurrei porque ele não pediu** — a autorização da 47
(*"e depois o push"*) foi de uma vez, não permanente. Abrir a próxima sessão perguntando, como a
rotina de `git fetch` desde a 40.

## 🚀 Próxima fase

### 1. ⭐ A FILA DO REFACTOR ACABOU — e o que manda agora é o PLAYTEST

**As seis frentes do `GameRuntime` fecharam** (52: `MateriaisMundo`, `ProgressoCarga`,
`PainelHost`, `FreioDePose`; 53: `MovimentoDoJogador`, `GameRuntime`). O plano que o usuário
mandou anotar no fim da 51 está **cumprido inteiro**. Não há próxima frente de refactor
enfileirada, e **inventar uma seria escopo não pedido**.

**O playtest do F10 (o item 1 da fila) ACONTECEU na 55 (2026-08-07, escola):** a sessão produziu
**6 bugs relatados (599-604, todos no buglog.json, nenhum consertado)** + o pedido de cultivos
(comidas/cultivos + batata cozida na fornalha + validação do slot de combustível). **Consertar
os bugs e tocar o pedido de comidas é agora a fila de jogo real** — ver a seção 3.

**O que sobrou como candidato, e nenhum deles é óbvio:**
- `handleServerData` (o despachante do cliente) e `handleMessage` (o do `session.ts`, 532 linhas)
  seguem de fora **com razão escrita desde a 50**: são PORTA, e cada `case` é achável por Ctrl-F
  com o nome da mensagem. **Não reabrir sem pedido.**
- O construtor do `GameRuntime` tem ~600 linhas de construção + fiação. Ele é grande, mas é
  ORDEM DE CONSTRUÇÃO — quebrá-lo em `montarCena()` / `montarPaineis()` / `montarHud()` é
  cosmético, e o critério da casa é FRONTEIRA, não tamanho.

**⭐ O item 1 da fila de jogo virou o item 1 da fila inteira: o PLAYTEST DO F10.** É a única
coisa da lista que nenhuma máquina faz, e ela não encosta desde a 47. Ver a seção 3.

**A 54 reforçou isso do jeito mais direto possível:** os dois defeitos que ela consertou vieram
de ELE JOGANDO, não de teste nenhum. A luz da tocha e o Esc dos painéis passaram por 781 testes,
15 smokes e quatro scripts de print sem levantar um dedo — o primeiro porque nenhum teste cruzava
os dois motores de luz, o segundo porque a única cobertura de painel era a de TOQUE, e no toque
não existe pointer lock. **Onde não há olho humano, o buraco fica no lugar que ninguém pensou em
olhar.**

### 1b. ⚠️ A BATERIA DE CONTROLE (vale pra QUALQUER mexida no cliente)

No cliente **não há teste unitário nenhum** — o controle é este, e roda inteiro entre cada
frente:

```
cd shared && ../node_modules/.bin/tsc --noEmit   # binário CRU — npx tsc MENTE (bug-586)
cd client && ../node_modules/.bin/tsc --noEmit
cd server && ../node_modules/.bin/tsc --noEmit
npm test && npm run build && npm run smoke       # 781 testes · 15/15 smokes
npm run shots:f10                                # sobe host próprio
npm run shots:toque                              # sobe host próprio — prova a regra dos painéis
npm run shots:esc                                # DESKTOP: pointer lock + a regra do Esc (§54)
npm run shots:luz                                # ⚠️ EXIGE vite em :5173 de pé ANTES
```

Subir o vite: `nohup ./node_modules/.bin/vite --port 5173 --strictPort client > log 2>&1 &`
(`npm run dev` em background morre com exit 143 e log vazio — do-not-repeat).

⚠️ **O `shots:f10`, o `shots:toque` e o `shots:esc` servem `client/dist`** — o cliente COMPILADO. Rodar
`npm run build` ANTES, e de novo a cada A/B, senão eles medem o binário velho (custou uma
bissecção falsa na 52). O `shots:luz` é o oposto: roda no vite e lê o fonte na hora.

⚠️ Os scripts de print bufferizam stdout fora de TTY: **rodar sem pipe pra `tail`** (redirecionar
pra arquivo e ler depois), senão um script morto no meio não deixa rastro nenhum.

E a régua da casa: **A/B honesto** — desligar o que se acabou de escrever e mostrar quais
asserções caem. Sem teste unitário, é ele que separa "compilou" de "funciona". **E um A/B que
não derruba nada é resultado do EXPERIMENTO, não do código: ou o teste é fraco, ou a afirmação
era falsa** (aconteceu duas vezes na 53).

### 1c. ⚠️ ABERTO: bug-598 — os dois motores de luz discordam na célula que atenua

Achado pelo fuzz da 54, **não consertado, e não é urgente**: folha e água sob céu aberto ficam em
15 quando a coluna vem do worldgen (`semearCeuDaColuna` escreve o nível que CHEGA e desconta só
pra baixo) e em 13 quando a mesma célula é recalculada por edição (`propagar` cobra passo +
opacidade, e a exceção da descida reta exige `op === 0`).

**Sintoma de jogo:** quebrar/colocar bloco perto de uma árvore escurece a folha em 2 níveis. As
células ABAIXO coincidem num caso isolado (as colunas vizinhas as acendem de lado); com copa larga
a divergência se espalha.

**Por que não foi feito:** o conserto é mudar o modelo de raio de sol do `propagar` — guardar
"esta luz veio reta do céu" pra que a atenuação não vire gradiente. É desenho novo, com efeito
visual em TODO mundo gerado, e as cavernas dependem da regra atual (`descidaReta` só no máximo).
O teste `luz.test.ts` já tem o fuzz que o pegaria: basta devolver `BlockId.Leaves` à paleta.

### 2. Ainda aberto do `session.ts` (opcional, e menor)

`handleMessage` tem **532 linhas** — é o despachante do protocolo, um `switch` de 65 `case`.
Ficou no core de propósito: é a porta de entrada, e cada `case` é achável por Ctrl-F com o nome
da mensagem. Quebrá-lo por família de mensagem é possível, mas o ganho é menor que o do
`main.ts` e ele tem a contabilidade de fome (`mudancasAntes`) atravessada, que é fácil de
quebrar sem querer.

### 3. ⭐ A fila de JOGO (atualizada na 55 — o playtest aconteceu e mandou trabalho novo)

1. **⭐ CONSERTAR OS 6 BUGS DO PLAYTEST** (55): **599** (balde de água no sobrevivência) ·
   **600** (sumir com o botão "copiar" do touch UI no sobrevivência) · **601** (baú não abre com
   a mão ocupada) · **602** (laje só na metade de baixo) · **603** (`/confinar` travando o mundo
   todo — revisar relação com `/claim` + varinha) · **604** (oxigênio reseta ao sair da água, o
   certo é regenerar até 100%). Todos no buglog.json.
1b. **⭐ PEDIDO DE CONTEÚDO da 55 (vira TODO):** comidas/cultivos — **cenoura, batata,
   beterraba, melancia, banana e aipim** no molde do algodão (F10c) + **batata COZIDA na
   fornalha** (batata crua → cozida, tabela da F10b) + validação do slot de COMBUSTÍVEL da
   fornalha (só item com `energiaCombustivel > 0`). No `todo.md`.
2. **§🍖 F8 — MOBS**: a única frente do roadmap de sobrevivência ainda fora. 3+ sessões, e tem
   o aviso de GPU do laboratório pendurado nela.
2b. **§🔨 FERRAMENTAS v2 — 3 itens no `todo.md`** (pedido da 48): durabilidade · exigir a
   ferramenta no slot SELECIONADO · tempo de quebra por (bloco × ferramenta). As três andam
   juntas e destravam machado e pá.
2c. **§💬 UI: tooltip no hover + esconder a hotbar com menu aberto** (pedido da 48, no TODO; o
   "esconder a hotbar" foi REPEDIDO na 55 — "ocultar hotbar do hud principal quando tiver
   qualquer painel aberto" — e já consta no todo.md).
3. **O tile do algodão maduro** (⚠️ da sessão 47): o capulho lê como martelo cinza. Meia hora
   de `paintAlgodao` em `client/src/atlasTexture.ts` **se** ele achar que incomoda — o print
   `08-canteiro-algodao.png` é a evidência.
4. **Refinos de forma que NÃO foram feitos** (nenhum pedido, ficam anotados): a mesa e a cadeira
   ainda colidem como célula cheia; a água fluida ainda é cubo cheio (altura por nível).

### 4. Ideia dele que ficou anotada e NÃO foi feita

Na conversa de stack ele disse que a performance está aceitável, e sugeriu ele mesmo: **baixar
o update de água pra 64 por tick** (hoje `LJ_AGUA_TICK` / `aguaPorTick`) **ou fazer sistema de
budget igual ao do render pra update de vizinhos**. Não foi tocado — é otimização sem sintoma
medido, e a régua do projeto é medir na máquina que dói antes de mexer.

> **SESSÃO 48 (2026-08-06) — A BATERIA DE 11 PEDIDOS, E DEPOIS A PERGUNTA GRANDE DE STACK.**
> O usuário mandou tudo num parágrafo só, misturando bug, regra de jogo e ideia de backlog — e
> ele mesmo marcou onde a fronteira estava (*"agora ideias para o todo.md"*). **As 6 primeiras
> viraram código; as 5 últimas viraram TODO e não foram implementadas** (implementar o que ele
> mandou anotar seria escopo não pedido).
>
> **bug-582 — o menu do navegador em cima do baú.** O `preventDefault` do `contextmenu` estava
> só no CANVAS, que é exatamente o caso em que ele não é preciso: com pointer lock o navegador
> nem abre o menu. Abrir um baú SOLTA o ponteiro, o cursor reaparece no meio da tela (em cima do
> `#container`), e o `contextmenu` daquele mesmo clique cai no PAINEL. Subiu pro `document`, com
> isenção pra campo de texto (o chat precisa de copiar/colar).
>
> **UM MENU POR VEZ, e a diferença com o que já existia.** Antes cada tecla de painel FECHAVA os
> outros ("um painel por vez na tela"); com o baú aberto, apertar E trocava o baú pela mochila e
> **o servidor continuava achando que o baú estava aberto**. Agora o segundo menu simplesmente
> não abre (`podeAbrirMenu()`, que soma painéis + menu de pausa + chat) — e o **Esc fecha o menu
> de PAUSA**, que era o único que só saía com clique. O chat entrou na regra: o Enter atravessava
> o painel aberto e o aluno digitava numa caixa escondida atrás dele.
>
> **bug-581 — o algodão inteiro FLUTUAVA, e é o bug-558 outra vez.** `precisaApoio` (blocks.ts) e
> o `rulesMap` (rules.ts) eram DUAS listas do mesmo conjunto; o §🍖 F10c pôs os 5 ids do algodão
> numa e nenhum na outra, e quem derruba o que perdeu apoio é a regra do TICK. Esquecer não
> quebra nada — o pé só fica pendurado no ar. **O registro passou a ser DERIVADO** de
> `precisaApoio`, as 4 faixas escritas à mão sumiram, o **mandacaru** entrou (era a última planta
> de fora) e um teste-portão varre `0..MAX_BLOCK_ID` cobrando a coerência.
>
> **A TOCHA VIROU UMA RECEITA SÓ, e isso exigiu motor novo.** `Ingrediente.ou` é a alternativa de
> ingrediente que o `Receita.custo` não tinha — a razão de existirem duas receitas de tocha. A
> gêmea do carvão vegetal foi **APOSENTADA** (o índice é a identidade no protocolo: apagar
> deslocaria as picaretas logo abaixo), o `fabricar` gasta o **principal primeiro** e a linha do
> painel diz *"1/1 carvão ou carvão vegetal"*. **bug-584 no caminho:** `remover` é tudo-ou-nada,
> então pedir o custo inteiro de cada alternativa fazia "1 de cada pra um custo de 2" não pagar
> nada.
>
> **Números de horta, os dois pedidos dele:** a colheita devolve **1–3 sementes** (era 1 fixo — a
> horta se replantava mas nunca CRESCIA) e a semente do algodão selvagem subiu de **1/4 pra
> 2/3**, porque o capim cobre campo inteiro e o pé de algodão é esparso: com a mesma régua,
> "achei um algodão" era quase sempre "e não veio nada". E **"semente" virou "semente de
> trigo"** — duas bolsas quase iguais na mesma aba faziam plantar a errada.
>
> **O painel do baú ganhou DIVISOR** (linha + os dois rótulos, `▲ baú` / `sua mochila ▼`): 27
> slots do container e 27 da mochila são a mesma grade de 9 colunas coladas, e tirar da metade
> errada é mexer no baú da colega.
>
> ✅ **A FORNALHA JÁ ACEITAVA tábua e tronco como combustível, e tronco já virava carvão vegetal**
> (`COMBUSTIVEIS` + `COZIMENTO`, com teste desde o F10b: *"tronco é combustível E matéria-prima"*).
> Nada mudou — o pedido já estava atendido.
>
> **VERDE:** typecheck 3/3 · **715 testes** (+11) · build · **15/15 smokes** · **bug-583**
> (autoria de teste: 4 asserções puras + 1 smoke fixavam `qtd: 1` na semente; as puras viraram as
> duas PONTAS do sorteio, as de fio viraram FAIXA).
>
> ⚠️ **PENDENTE, e é a conversa que abre a próxima sessão: TROCA DE STACK.** O usuário levantou
> — sem decidir — migrar de web para **aplicação nativa em janela própria** (cliente servido pela
> rede, mas não uma aba), possivelmente **Rust** no cliente e **SpacetimeDB** no servidor. Nada
> foi analisado nem escrito ainda. Ver "🚀 Próxima fase".
> **SESSÃO 47 (2026-08-05) — OS PRINTS DO F10, OS DOIS REFINOS DE FORMA, E O PUSH DOS 11
> COMMITS.** Aberta com "onde paramos?" e `git fetch` (a rotina desde a 40) — desta vez o local
> estava **9 commits À FRENTE**: a sessão 46 inteira nunca tinha sido empurrada. O pedido foi
> *"roda os prints, faz os refinos e depois o push"*, e as três coisas fecharam.
>
> **§🔬 `npm run shots:f10` É NOVO, e ele achou um bug na primeira rodada.** O F10 inteiro
> nasceu com teste puro, teste de sessão e smoke pelo fio — e nenhum deles tem olho. O script
> sobe host + chrome próprios (nada de terminal ao lado), entra como professora e fotografa 8
> telas: o atlas, os 9 ícones da hotbar (7 nasceram no F10), o painel da fornalha com o fogo
> andando, a fornalha acesa no mundo, o painel do baú com os 27 slots, a vitrine de formas e o
> canteiro de algodão. **O painel abre pelo MESMO gesto do aluno** (toque REAL no ▣ →
> `input.press(2)` → `use_block` → e é a RESPOSTA do servidor que abre), não por chamada
> interna. **O canteiro é a parte que fez o script valer:** os 4 estágios saem de 4 pés
> plantados em TEMPOS diferentes, com `LJ_CRESCIMENTO` acelerado no host — nenhum byte é
> forjado. O mundo de estúdio se monta por `/bloco ~` e `/regiao encher` do professor, então o
> script nunca precisa saber onde o spawn caiu.
>
> **bug-580, e ele é do tipo que só o print acha.** Trocar fornalha por baú na mesma célula
> abria o painel como **FORNALHA em cima de um baú** — 3 slots com barra de fogo sobre um bloco
> que não queima nada. O `applyBlockQuieto` só limpava o mapa por posição quando a célula
> deixava de ser container (`containerTipoDe(blockId) === null`); de fornalha pra baú o
> conteúdo SOBREVIVIA. A pergunta passou a ser pelo TIPO, comparando o byte VELHO com o novo —
> apagada↔acesa segue fora do ramo (mesmo tipo) e container novo nasce sempre limpo.
>
> **§🍖 OS DOIS REFINOS DE FORMA, e os dois existem pela mesma razão: bloco encostado em bloco
> lia como PAREDE.** Dois baús viravam um bloco só de madeira — e "onde acaba um e começa o
> outro" é a primeira pergunta de quem organiza o depósito da turma; quatro fornalhas viravam
> uma parede de bocas, sem dizer pra onde nenhuma estava virada.
>
> **O BAÚ virou CAIXA** (14/16 de lado e de altura, o número do Minecraft). Saiu do
> `isFullCube` e ganhou um `case` no `emitShape`; o `emitBox` aprendeu um tile de Y separado (a
> tampa) — **uma caixa com dois tiles é mais barata, e mais fácil de ler, que duas coladas com
> z-fight na junta**. A MIRA segue a madeira (`blockSelectionBox`), que é o que diz qual dos
> dois baús o clique vai abrir; **a COLISÃO continua sendo a célula inteira**, como a do móvel e
> a da cerca — vão de 1/16 onde o aluno "quase" entra é bug de travamento na aula, não
> realismo. De brinde, a luz atravessa (como no Minecraft) e a cerca não se conecta a ele.
>
> **A FORNALHA ganhou FRENTE**, e a decisão do dia mora nos ids. A boca sai numa face só e a
> face vem do ID — a convenção da cadeira, da cama, do quadro e da escada. **Os seis ids novos
> NÃO são contíguos com os dois velhos, de propósito:** 186/187 nasceram sem direção e já estão
> gravados nos mundos que a 46 salvou, e renumerar trocaria a fornalha de quem já jogou por
> outro bloco (o mesmo raciocínio que APOSENTOU a receita de vidro em vez de apagá-la). Então
> eles viraram a direção **−Z** e as outras três entram em **194-199**, com a tradução numa
> **TABELA** (`FORNALHA_POR_FRENTE`) em vez de aritmética de id. **Mundo antigo abre sem
> migração nenhuma.** É a tabela que garante o que mais importa: **acender preserva a direção**
> — antes havia UM id aceso, e escrevê-lo teria virado toda fornalha pro norte no instante em
> que o fogo pegasse, na frente da turma. Três lados de trás ganharam um tijolo liso novo
> (`fornalhaCostas`), **um degrau mais escuro que o pedregulho comum**: sem isso a fornalha
> vista de trás some dentro da parede que o aluno acabou de levantar.
>
> **VERDE:** typecheck 3/3 · **704 testes** (+7) · build · **15/15 smokes** ·
> `npm run shots:f10` **22/22 com 8 prints conferidos** · **A/B honesto em três frentes**:
> com o baú de volta a cubo cheio dois vizinhos caem de **72 pra 60 índices** (a face do meio
> some); com a boca de volta ao `side` o teste da frente acha **4 bocas onde tem de achar 1**;
> com o guarda velho do container o painel volta a dizer **'fornalha' onde tem baú**.
> **Os 11 commits foram EMPURRADOS** (os 9 da 46 + os 2 desta).
>
> ⚠️ **UMA COISA PRO OLHO DO USUÁRIO, achada nos prints e NÃO consertada:** o tile do algodão
> maduro lê como um **martelo cinza** num cabo verde, e não como um capulho de algodão — o
> branco saiu acinzentado e a forma, retangular. Está no print `08-canteiro-algodao.png`. É
> escolha de arte, não bug, e por isso ficou pra ele decidir.
>
> **SESSÃO 46 (2026-08-05) — O §🍖 F10 INTEIRO, NUMA SESSÃO.** O usuário respondeu as cinco
> perguntas que travavam a fila e mandou o escopo grande: *"pode fazer tudo da f10 na ordem que
> achar melhor"*. Ordem executada, uma frente por commit: **F10a → F10b → F10e → F10f → F10c →
> F10d**. A abertura foi `git fetch` (a rotina desde a 40): local em dia com o remote.
>
> **As cinco decisões dele, e o que cada uma custou:** a fornalha SUBSTITUI a receita de vidro ·
> o graveto entra como ITEM e a tocha vira 1 graveto + 1 carvão (mineral OU vegetal) · sem
> picareta o bloco **não quebra** e mostra aviso · baú com item não quebra · confinamento barra
> interação.
>
> **🔥 A CADEIA FICOU HONESTA PONTA A PONTA.** Era isto que o F10 existia pra fazer:
> **derrubar árvore → picareta de madeira → pedra → picareta de pedra → minério → fornalha →
> lingote → picareta de ferro → diamante**. Antes, o minério de ferro era um cubo bonito que
> virava balde por decreto, e metade das pontes da sessão 45 (vidro ← areia, lã ← trigo) tinha
> sido INVENTADA porque não havia forno nem ovelha. As duas foram aposentadas: o vidro sai da
> fornalha, a lã sai do algodão.
>
> **§🍖 F10a — o minério larga ITEM, e a tocha ganhou um cabo.** Carvão e diamante são os dois
> minérios que no Minecraft não vão ao forno: a rocha entrega o material. Ferro e ouro
> continuam caindo como BLOCO de propósito — é o bloco que a fornalha funde, e **é essa
> diferença entre os quatro que ensina pra que serve fundir**. O graveto era o elo que faltava:
> a tocha saía de tábua + minério, errado dos dois lados (gastava uma tábua inteira e pedia um
> cubo de minério que agora nem cai). Virou o par do Minecraft, e o mesmo graveto é o cabo de
> toda picareta.
>
> **§🍖 F10b — A FORNALHA, e a decisão que fez o baú custar um dia.** O encanamento
> (`containers.ts`) nasceu UMA vez e serve aos dois blocos com inventário: conteúdo por POSIÇÃO
> no meta do save (o desenho do QUADRO, primeiro estado a não caber no byte), transferência num
> array CONCATENADO mochila+container reusando o núcleo de pilha do `inventario.ts`, e índice
> UNIFICADO no fio (`0..26` mochila, `27+i` container). Fazer o baú antes teria escrito isso
> duas vezes. `fornalha.ts` é simulação pura, sem relógio de parede: 100 ticks por peça, carvão
> rende **8×** a madeira. A ordem do tick está escrita e importa — **acender só se há o que
> cozinhar** (fornalha com carvão e nada dentro não gasta o carvão, que é o que qualquer criança
> espera), queimar, cozinhar. `tickFornalha` devolve o MESMO objeto quando nada muda, e é essa
> identidade que evita mensagem à toa a 10 Hz. Dois ids (apagada/acesa): a acesa não é colocável
> e **emite luz de graça**, porque a luz é função pura dos bytes.
>
> **A receita não se APAGA: ela se APOSENTA.** O índice é a identidade no protocolo, então tirar
> a linha do vidro deslocaria as 97 seguintes e o aluno com o painel aberto clicaria numa receita
> e receberia outra. `Receita.aposentada` guarda a razão; `receitaValida` e `fabricar` recusam.
>
> **§🍖 F10e — o BAÚ, e a prova de que o encanamento valeu.** Um id, uma receita (8 tábuas), dois
> tiles e uma linha no `containerTipoDe`. 27 slots. **Com coisa dentro não quebra** (decisão do
> usuário, que estendi à fornalha: mesma regra, mesma frase, mesmo gate — não existe item no
> chão, e um clique perderia a mochila que o colega guardou).
>
> **§🍖 F10f — o portão que impede a regra de furar de novo.** O teste LÊ a união
> `ClientMessage` do próprio `protocol.ts` (via `import "./protocol.ts?raw"`, e não `node:fs`,
> pra não custar `@types/node` num workspace isomórfico), acha toda mensagem com coordenada e
> exige que ela esteja coberta — por um teste de bloqueio ou por uma isenção com razão escrita
> (hoje `move` e `wand_mark`). **A/B honesto:** com um `abrir_cofre` de mentira na união, o
> portão o denuncia; com o gate do container removido, a estranha lê o baú da colega e o teste
> cai. O confinamento passou a barrar interação junto do claim, como o usuário pediu.
>
> **§🍖 F10c — a lã ganhou planta.** A plantação deixou de ser "o trigo" e virou TABELA
> (`PLANTAS = [{base, estagios}]`): `plantaDe` responde por estágio, muda, madura, forma
> canônica e colocável. Sem isso, a 2ª faixa de ids estaria escrita à mão em cinco funções — e o
> mesher, que derivava o tile de `plantacao0 + estagio`, teria dado o tile do trigo pro algodão.
> **Dois blocos, e a diferença é a pedagogia:** o cultivado (4 estágios, cresce no pulso que já
> existia, maduro dá **1–2 capulhos sorteados** + a semente — o 1º drop com quantidade aleatória
> do jogo) e o SELVAGEM do gen, que larga só semente por sorte e nunca ele mesmo. Cerrado, campo
> aberto; a caatinga fica fora porque lá o topo é areia e algodão não pega em areia.
>
> **A verificação que valeu a frente (a lição da 41, de novo):** um teste GERA um mundo de
> verdade e CONTA os pés — com o worldgen removido ele acusa zero — e confere que nenhum nasceu
> fora de solo. E um controle NEGATIVO prova que o capim continua nascendo: o algodão entrou
> ANTES dele na cadeia de `else if`, e um erro ali teria trocado a vegetação do cerrado inteiro.
>
> **§🍖 F10d — a picareta virou o portão da progressão.** 4 níveis, **sem durabilidade** (a
> pilha continua `{id, qtd}`, nenhum campo novo em lugar nenhum) e **obrigatória**: quem entra
> em sobrevivência não pega pedra até fabricar a de madeira. Sem a ferramenta certa o bloco
> **NÃO QUEBRA**, com aviso — o Minecraft quebra sem drop, mas lá existe tempo de quebra pra
> avisar antes; aqui é 1 clique, e "sumiu e não ganhei nada" é frustração de aula. Gate no
> `break_block` ANTES do `applyBlock`, e o freio de aviso virou UM por jogador.
> ⚠️ **Consequência a contar pro professor no playtest: a primeira coisa que a turma faz numa
> aula de sobrevivência passa a ser derrubar árvore.**
>
> **DESVIO DE ESCOPO, declarado:** machado e pá ficaram de fora. Exigir machado pra tirar
> madeira, quando o machado é feito de madeira, é um mundo onde ninguém começa; e como a quebra
> é instantânea, ferramenta que só ACELERA não tem onde aparecer. A tabela já é (tipo × família)
> e eles entram sem redesenho no dia em que houver tempo de quebra. **A picareta vale onde
> ESTIVER na mochila, não só na mão** — "precisa de picareta" a criança resolve; "precisa dela
> na MÃO" é um 2º enigma, e o clique não diz qual dos dois falhou.
>
> **Três bugs, os três de AUTORIA DE TESTE (a família do 560/574/575):** **bug-577** a asserção
> do smoke corria contra o tick (a tábua já tinha virado fogo quando ela foi conferir o slot);
> **bug-578** `createWorld(dims, false)` — o 2º argumento não é "lazy", é `alocar`, e sem chunks
> o teste montava um canteiro que nunca existiu; **bug-579** transferir pra slot OCUPADO é
> TROCA, não empurrão — a picareta entrava na fornalha no lugar do pedregulho e ela continuava
> cheia. A lição maior está no cerebrum: **o estado que COINCIDE é o teste traiçoeiro** —
> "apagou" e "nunca acendeu" dão o mesmo byte, e os dois testes passavam com o tick comentado.
> O conserto é o controle POSITIVO no meio: prove que aconteceu antes de provar que parou.
>
> **VERDE:** typecheck 3/3 · **697 testes** (+42) · build · **15/15 smokes** (o `fornalha` é
> novo e cobre também o baú, rodado 2× pra idempotência) · **A/B honesto em três frentes**
> (tick da fornalha, gate do claim, worldgen do algodão).
> **PLAYTEST PENDENTE — e desta vez ele tem uma pergunta específica: a turma aguenta ter de
> fazer a picareta antes de cavar?**

## 🚀 Próxima fase

### 1. A CONVERSA DE STACK (pedida na 48, nada decidido ainda) — **é o que abre a sessão**

O usuário escreveu, no fim da 48: *"devido a crescente complexidade do projeto, estou pensando em
mudar a stack para algo mais robusto e que aceite mais alterações. tem ainda como servir o cliente
por rede mas a página abrir uma janela separada do jogo? não mais um web mas sim uma aplicação.
algo ambicioso e novo, talvez usando SpacetimeDB por exemplo e o cliente como algo bem performático
talvez em Rust."*

**Nenhuma análise foi feita — a sessão acabou no limite de uso.** O que a próxima sessão tem de
entregar é a ANÁLISE, não a migração: três eixos separados (janela nativa · linguagem do cliente ·
banco/servidor autoritativo), o que cada um custa, e o que se PERDE. Contexto que já está na casa e
pesa na decisão:

- **O alvo de campo é KINDLE FIRE 1024×600 e laboratório de escola** (cerebrum: "os dois, Fire
  manda"; celular foi RECUSADO). Cliente nativo em Rust **não roda no Fire** do jeito que o
  navegador roda — isso é a primeira pergunta, não um detalhe.
- **O `.wolf/cerebrum.md` registra que aba de navegador não abre socket nem executa binário** —
  foi essa propriedade que fez a TI da escola aceitar o jogo. Aplicação instalada muda essa
  conversa.
- **`shared/` é ~40 arquivos de lógica pura testada** (715 testes) e é o ativo mais caro do
  projeto: worldgen, luz, mesher, física, receitas, regras. Qualquer plano tem de dizer o que
  acontece com ele.
- **Meio-termo que ninguém levantou ainda e cabe na resposta:** Tauri/Electron dão "janela
  própria, servida pela rede" **sem reescrever nada**, e WebGPU/wasm dão performance sem trocar
  de linguagem. Apresentar isso como opção real, não como consolo.

### 2. O resto da fila (inalterado desde a 47)

**A fila do §🍖 está VAZIA — os refinos que sobravam fecharam na 47.** O que resta é escolha do
usuário:

1. **PLAYTEST do F10** — é o que manda, e é a única coisa da lista que nenhuma máquina faz. A
   cadeia inteira (árvore → picareta → fornalha → lingote) nunca passou por uma turma, e a
   mudança de abertura da aula (derrubar árvore antes de qualquer coisa) é a que mais pode
   surpreender. **A pergunta específica: a turma aguenta ter de fazer a picareta antes de
   cavar?** Depois da 47 há uma segunda: a fornalha virada pro lado certo ajuda ou confunde?
2. **§🍖 F8 — MOBS**: a única frente do roadmap de sobrevivência ainda fora. 3+ sessões, e tem
   o aviso de GPU do laboratório pendurado nela.
2b. **§🔨 FERRAMENTAS v2 — 3 itens novos no `todo.md` (pedido da 48).** Durabilidade · exigir a
   ferramenta no slot SELECIONADO · tempo de quebra por (bloco × ferramenta). **As três andam
   juntas** e destravam machado e pá, que o F10d deixou de fora justamente porque a quebra é
   instantânea. A durabilidade é a 1ª coisa a quebrar o par `{id, qtd}` da pilha — a decisão
   (campo `dano?` vs. ids por faixa de desgaste) está escrita no TODO.
2c. **§💬 UI: tooltip no hover + esconder a hotbar com menu aberto** (pedido da 48, no TODO). O
   `menuAberto()` da 48 já responde a pergunta que a hotbar precisa fazer.
3. **O tile do algodão maduro** (ver o ⚠️ da sessão 47): o capulho lê como martelo cinza.
   Meia hora de `paintAlgodao` em `client/src/atlasTexture.ts` **se** ele achar que incomoda —
   o print `08-canteiro-algodao.png` é a evidência.
4. **Refinos de forma que NÃO foram feitos** (nenhum pedido, ficam anotados): a mesa e a cadeira
   ainda colidem como célula cheia; a água fluida ainda é cubo cheio (altura por nível).

> **SESSÃO 45 (2026-08-05) — O PLAYTEST COM 17 ALUNOS ACONTECEU, E ELE PEDIU O QUE FALTAVA:
> COBERTURA TOTAL DE RECEITAS + O §🍖 F7 QUE ELE MESMO TINHA PULADO.** A sessão abriu com uma
> lição de processo: respondi "onde paramos?" pelo STATUS local e ele corrigiu — *"faz o fetch
> primeiro, tem coisa que não tá no repo local"*. **O local estava 14 commits atrás** (as
> sessões 41–44 foram na outra máquina). Isso já aconteceu na 40, com 3 commits: **sessão que
> começa com "onde paramos?" faz `git fetch` ANTES de responder.**
>
> **O playtest: 17 alunos, e o veredito é que o laço FECHA.** *"conseguiram fazer craft, plantar
> e comer"*. **Nenhum número foi contestado** — crescimento, chances de fruta/semente, saciedade
> e o dreno de fome ficam como estão. O que ele pediu foi o BURACO que a turma esbarrou: quase
> tudo que dá pra colocar era inalcançável em sobrevivência.
>
> **🧱 12 → 110 RECEITAS, e a decisão do dia é POR QUE inventar os elos.** Metade das cadeias do
> Minecraft passa por FORNO (vidro, tijolo, lingote) ou por MOB (lã de ovelha), e o lite não tem
> nem um nem outro — copiar a receita de lá deixaria o bloco inalcançável do mesmo jeito. Então
> cada ponte usa material que o aluno JÁ tira com a mão e cabe numa frase de professor: **vidro
> ← areia · tijolo ← terra + areia (barro seco ao sol) · lã ← trigo (a horta passa a alimentar a
> construção, e é uma ESCOLHA: o mesmo trigo faz pão) · pedra ← 2 pedregulho · tocha ← tábua +
> carvão · folhagem ← tronco da MESMA espécie · grama ← terra + o que define o clima (semente,
> areia ou neve)**.
>
> **E onde deu, a ponte virou CONTEÚDO: as 12 cores saem de FLOR, e as quatro sem flor própria
> saem de MISTURA** — laranja = amarelo + vermelho, roxo = vermelho + azul, rosa = vermelho +
> branco, ciano = azul + verde (mandacaru, que é o verde da caatinga). Misturar cor é currículo
> de sala de aula, e aqui virou receita de verdade. Uma tabela `CORES` de 12 linhas gera as 36
> receitas de lã, vidro colorido e tapete — as três famílias têm a MESMA ordem no `BlockId`.
>
> **O portão que mantém isso vivo:** um teste varre TODO id `isPlaceable`, pula variante
> (`formaCanonica` responde pela família) e professor-only, e exige que o resto esteja em
> `RECEITAS` **ou** em `SEM_RECEITA` — um mapa id → razão escrita (terreno, minério, tronco,
> flor, muda, bedrock). Bloco novo sem receita e sem razão derruba a suíte. Os **12 índices
> antigos não se mexeram**: o índice é o contrato do protocolo (`fabricar {receita}`).
>
> **§🍖 F7 — PVP, a última regra sem mecânica.** `atacar {alvo}` novo (o id é o mesmo do
> `player_moved`), **2 pontos por soco** (1 coração, 10 socos pra derrubar) e **cooldown de 5
> ticks** — sem ele quem clica mais rápido ganha, e isso não é jogo. O servidor confere regra +
> **modo dos DOIS** (quem está em criativo não bate nem apanha: é o professor supervisionando) +
> alcance + cooldown. **O alcance se mede entre POSIÇÕES, não pela linha do olhar:** a direção
> chega a 10 Hz e a caixa do alvo desliza no cliente (lerp), então validar mira no servidor
> recusaria soco legítimo. Quem mira é o cliente (`raycastJogador`, puro e testado). Mundo de
> aula força OFF, como já força criativo. `/pvp ligar|desligar` escreve na MESMA regra do
> `/regra pvp` (os dois não podem discordar) e avisa a turma inteira — quem apanha sem saber
> que ligou acha que é bug. A mensagem `modo` ganhou `pvp?` (opcional, tolerante a host antigo)
> e é ela que deixa **a mira vermelha** em cima de quem se pode socar.
>
> **Três bugs, e os dois primeiros são autoria de smoke** (a mesma família do bug-560):
> **bug-574** a rajada do cooldown caía dentro do cooldown do soco anterior e media "recusa
> tudo"; **bug-575** o laço da morte continuava socando depois do respawn — e quem renasce
> nasce NO SPAWN, ao alcance de quem bateu. **bug-576** é do meu próprio design de teste: o
> `comida.test.ts` pegava o pão por `RECEITAS[length - 1]`, e as 97 receitas novas o empurraram
> pro meio — o teste passou a fabricar um GLIFO. **Índice de receita se acha pela SAÍDA; o que
> o protocolo promete é que o 11 continua sendo o pão, não que o pão continue sendo o fim.**
>
> **Extra de UI que a lista de 110 linhas exigiu:** o painel ganhou o interruptor **"só o que dá
> pra fazer agora"** (padrão desmarcado, alvo de 40px). Com a mochila vazia, 110 linhas cinzas
> não são uma lista — são uma parede.
>
> **O bug da lista de craft que ele mandou corrigir é o bug-573** (a rolagem voltava ao topo a
> cada peça), **e ele já estava corrigido no código que o fetch trouxe** (sessão 44). Confirmado
> com ele e conferido no fonte.
>
> **SESSÃO 44 (cont.) — TRÊS DEFEITOS DE TABLET QUE SÓ O DEDO ACHARIA.** Depois do launcher, o
> usuário reportou três coisas do jogo, todas de toque: o ☰ abria o menu e ele **fechava
> sozinho levando a barra junto**; `/amigos` devia **abrir o painel** no PC e no tablet; e a
> tela de craft **voltava ao topo** a cada peça fabricada.
>
> **bug-572 — o ☰, e a armadilha mora numa linha de CSS antiga.** O botão faz
> `input.touch = false` pra o menu aparecer (`updateOverlay` decide por
> `input.active = locked || touch`). Só que o CLICK do mesmo toque ainda está a caminho: quando
> chega, o `#touch-ui` já sumiu, o hit-test cai no `#overlay` — que é **`pointer-events: none`
> de propósito** ("só o painel captura clique") — e o evento ATRAVESSA até o canvas, cujo
> handler `canvas.addEventListener("click", () => this.lock())` pede pointer lock. Com `touch`
> recém-zerado, o guarda `if (this.touch || this.locked) return` **não barra mais**: o lock é
> concedido, `input.active` volta a true e o menu recém-aberto some — com a barra escondida
> junto. **Nem menu, nem barra: o aluno fica preso.** O `preventDefault()` do `tapButton` não
> salva porque o alvo original saiu do hit-test antes do click. **Fix: `Input.touchDevice`
> (APARELHO, decidido uma vez no boot) separado do `Input.touch` (MODO, que liga e desliga na
> partida)** — em aparelho de dedo não existe pointer lock, nunca. Qualquer botão futuro que
> zere `input.touch` cairia na mesma armadilha.
>
> **§👥 `/amigos` abre o painel, e é a ÚNICA porta que serve nos dois aparelhos.** A tecla G não
> existe no tablet e o botão 👥 só aparece com a proteção de áreas ligada — em mundo livre não
> havia caminho nenhum. Intercepta no cliente, no callback do `ChatUi`: `/amigos` **sem
> subcomando** vira gesto (e o chat não recebe mais o texto de uso); **com** subcomando
> (`/amigos convidar bia`) segue pro servidor como sempre. Antes do join também segue, e aí o
> servidor responde "Entre no mundo primeiro".
>
> **bug-573 — a rolagem do craft.** Fabricar muda a mochila → `refresh()` → `render()` →
> `replaceChildren()`, e a `.craft-lista` (quem tem o `overflow-y`) nasce de novo: o `scrollTop`
> morre com o elemento velho. Doía **por clique**, porque quem fabrica repete a receita. O
> `filtroCraft` já sobrevivia aos re-renders pelo mesmo motivo; agora o `scrollCraft` também.
> **Restaurar `scrollTop` só funciona DEPOIS do append** — em elemento fora do DOM não tem
> efeito. Filtrar zera de propósito (lista nova se lê do começo).
>
> **§🔬 `scripts/toque-shot.mjs` é NOVO (`npm run shots:toque`), e ele existe porque o
> tablet-shots não conseguia ver este bug.** O tablet-shots MEDE geometria e sintetiza toque com
> `dispatchEvent(new PointerEvent(...))`, que **não gera o `click` de compatibilidade** — e era
> justamente o click que carregava o defeito. Aqui o toque vai por `Input.dispatchTouchEvent` do
> CDP: quem monta a sequência inteira é o Chrome. O pedido de pointer lock é **CONTADO**
> (monkey-patch no protótipo) porque a CONCESSÃO é flaky em headless — o mesmo build passou numa
> rodada e falhou na outra.
>
> **VERDE:** typecheck 3/3 · **578 testes** · build · **13/13 smokes** · **`shots:toque` 15/15**,
> com **A/B honesto**: com os três fixes fora, **5 asserções falham** (menu fechado,
> `pedidos=2`, painel não abre, texto de uso no chat, rolagem **324 → 0**); com eles, 15/15 e
> rolagem **324 → 324**. O print do "antes" mostra o sintoma inteiro: tela de jogo **sem menu e
> sem barra**. **PLAYTEST PENDENTE — os três nasceram de dedo, e é o dedo que confirma.**
>
> ⚠️ **Três armadilhas de harness pagas nesta rodada, todas no cerebrum:** `cdp()` sem teto
> trava MUDO (a página trava sob swiftshader e a Promise fica pendente pra sempre); o stdout do
> node BUFFERIZA fora de TTY (script morto no meio não deixa rastro); e host `detached`
> sobrevive ao `timeout` e segura a porta na rodada seguinte (`EADDRINUSE`). ⚠️ O
> **`tablet-shots.mjs` não roda nesta máquina** — falta o `LD_LIBRARY_PATH` do bug-564, que só o
> `amigos-shot.mjs` tinha (o `toque-shot.mjs` já nasceu com ele).
>
> **SESSÃO 44 (2026-08-04) — O LAUNCHER PAROU DE PULAR A ATUALIZAÇÃO (sessão curta, fora do
> jogo).** A 42 tinha só melhorado a MENSAGEM do skip; o usuário voltou pedindo o
> comportamento: *"permitir o fetch mesmo com mudanças nos arquivos, apenas deixe uma regra
> para o usuário decidir se a pasta dos mundos salvos vai ser sobrescrita"*.
>
> **O guarda de sujeira saiu da frente do `git fetch` e virou tratamento DEPOIS do merge.** A
> ordem antiga (conferir sujeira → pular tudo) trocava um problema por outro: nesta máquina o
> `.wolf/memory.md` é rastreado e muda toda sessão, então a atualização nunca acontecia. Agora
> o fetch é incondicional e o `merge --ff-only` é quem decide — e ele só reclama do arquivo que
> a atualização REALMENTE toca. **O caso que mais aparece já fica resolvido sozinho:** sujeira
> em arquivo que o update não mexe atualiza direto, sem uma pergunta (cenário B do teste).
> Quando o merge recusa, a escolha é do usuário (opção dele entre 3): **`git stash push -m
> "lj-auto"` + merge + como recuperar**. **Sem `stash pop` automático, de propósito** — pop que
> conflita deixa a pasta em conflito no meio da aula; guardado é reversível, conflito não.
>
> **§🗺️ A REGRA DOS MUNDOS, e por que ela quase não existe.** `mundos/` está no
> `.gitignore:19` e **nenhum arquivo dela é rastreado** — os únicos mundos que viajam no repo
> são os MODELOS de aula, em `cenarios/`. Ou seja: o merge nunca alcança a pasta da turma, e a
> pergunta seria um clique a mais toda aula com resposta sempre igual. Então ela é
> **CONDICIONAL**: o script confere `git diff --name-only HEAD...origin/main -- mundos/` e só
> pergunta se der match, com padrão **NÃO sobrescrever** (e aí cancela a atualização inteira).
> Quando não dá match — sempre, hoje — sai a linha *"seus mundos salvos em mundos/ não são
> tocados pela atualização"*, que é informação, não pergunta. A conferência existe pro dia em
> que alguém versionar um `.ljw` de turma por engano: o professor tem de ser avisado ANTES de a
> turma perder o que construiu.
>
> **Os hints do git foram calados** (`2>/dev/null` / `2>nul`): no ramo de divergência ele
> mandava o professor rodar `git rebase` / `git merge --no-ff` em inglês, 10 linhas antes da
> mensagem em português. A mensagem honesta em português basta.
>
> **VERDE:** `bash -n` · **6 cenários rodados no `.sh` com fixture git de verdade** (upstream
> bare + clone "escola" + stub de `npm`): **A** sujeira NO arquivo do update → stash+merge, HEAD
> avança, trabalho no stash · **B** sujeira em OUTRO arquivo → merge direto, mudança local
> intacta (era o caso pulado) · **C** mundos tocados + Enter → cancela, HEAD parado · **D**
> mundos tocados + "s" → sobrescreve · **E** divergência real → mensagem limpa, nada mexido ·
> **F** recusar o stash → nada mexido. **Os 4 primeiros rodados TAMBÉM no `cmd.exe` DE VERDADE**
> (via `/mnt/c`, com `git.exe` do Windows). Controle negativo no repo real: o guarda dos mundos
> não dispara (`git diff -- mundos/` vazio). **Código do jogo não foi tocado.**
>
> **bug-571, e é o bug-569 outra vez:** os 4 cenários do `.bat` deram verde **exercitando só as
> respostas VAZIAS**. `chcp 65001` (1ª linha do `.bat`) faz o `set /p` ler **vazio** de arquivo
> redirecionado, então o único cenário com resposta não-vazia ("s" pra sobrescrever mundos)
> falhou em silêncio. Mini-repro A/B isolou o `chcp`; `(echo s&echo.)` também não serve
> (entrega `"s "` com espaço). O que funciona: `call resp.cmd | iniciar-servidor.bat`.
>
> **SESSÃO 43 (2026-08-04) — AS DUAS FRENTES QUE O USUÁRIO ESCOLHEU: §🍖 F9 (PRESET DE
> SOBREVIVÊNCIA) E O PAINEL DE AMIGOS.** Perguntado onde parávamos, ele respondeu "f9 e
> interface do /amigos" — e as duas fecharam nesta sessão.
>
> **§🍖 F9 — o preset NÃO virou um quarto `WorldPreset`, e essa é a decisão do dia.** O
> ROADMAP dizia `LJ_PRESET=sobrevivencia` ao lado de `plano|cabines`, mas terreno e partida
> são eixos DIFERENTES: se "sobrevivencia" entrasse no union, todo `preset === "normal"`
> espalhado pela geração (a água, o veto de boca de caverna no spawn) passaria a excluir a
> sobrevivência **em silêncio**, e ainda ficaria impossível querer sobrevivência em mundo
> plano. Virou `SessionOptions.sobrevivencia`, ortogonal, com um teste que prova que **os
> bytes do mundo saem idênticos com e sem o flag**. O token de fora é traduzido num lugar só
> (`ehPresetSobrevivencia`, reusando o `parseModo` — aceita "sobrevivência" com acento).
>
> **O que ele faz é o que o professor teria de digitar na frente da turma:** `modo
> sobrevivencia` no mundo + **ciclo dia/noite ligado** (sem noite, sobreviver não significa
> nada). **O que ele deliberadamente NÃO grava: pvp e confinamento** — já nascem no valor
> certo pelos próprios padrões, e o save guarda só o DIFF; escrevê-los prenderia o mundo ao
> padrão de hoje. Mundo de AULA continua vencendo o preset (criativo, ponto), e `restore`
> ignora (o .ljw traz o que gravou). Três hospedeiros: `LJ_PRESET=sobrevivencia` (atalho de
> uma variável) **ou** `LJ_SOBREVIVENCIA=1`, que COMPÕE com terreno plano · `sobrevivencia`
> no init do worker · e um select **"como jogar"** no formulário de mundo novo do menu.
>
> **§👥 PAINEL DE AMIGOS — e o buraco que só o painel revelou.** `client/src/friends.ts`
> (`FriendsPanel`, molde do `players.ts`, root `#amigos`), tecla **G** nova, e uma dica no
> chat quando a proteção de áreas LIGA (a única hora em que "quem pode construir na minha
> área" vira pergunta). Nenhuma função nova, como pedido: convites recebidos com
> aceitar/recusar · o grupo com **N/6**, expulsar (só dono) e "sair e DESFAZER o grupo"
> armado em 2 cliques · a lista de quem convidar, montada de quem está online.
> **bug-568:** `/amigos convidar` mandava o feed `friends` só pro CONVIDADO — e é ali que o
> time NASCE, com quem convidou dentro. Com comando de chat ninguém notava (a resposta
> textual bastava); com painel, o botão parecia morto. Agora o feed volta pros dois, o
> `recusar` avisa quem convidou, o `aceitar` avisa quem teve o convite descartado, e a
> mensagem ganhou **`enviados`** (opcional, tolerante) pro "aguardando" existir na tela.
>
> **A verificação é a lição de sempre, de novo (bug-569):** a 1ª rodada do
> `npm run shots:amigos` deu ✓ em "a dona pode expulsar" **com o grupo vazio** — o
> `innerText` do painel contém a DICA do rodapé, que cita `/amigos expulsar nome`; e o
> clique por rótulo pegou a linha da bia em vez da do caio, porque a lista é ordenada por
> nome. Asserção passou a ler os RÓTULOS DOS BOTÕES e o clique vai por LINHA.
>
> **§📱 A BARRA DE TOQUE — 3ª frente da sessão, e ela FECHOU o pendente das outras duas.**
> Eram 6 botões fixos em 1024×600 e só 3 de jogo. O critério que ficou (vale pro próximo
> botão que alguém quiser pôr lá): **é de jogo? fica. É de sessão ou diagnóstico? menu de
> pausa. Serve só num modo? nasce escondido.** Então: ☰ 🧱 💬 sempre · **🪄 varinha** só pra
> quem pode usá-la (professor, ou aluno com a proteção de áreas ligada) · **👥 amigos** só
> com a proteção ligada — que é exatamente quando "quem constrói na minha área" vira
> pergunta, e é o que **destrava o painel de amigos no tablet**. ⛶ tela cheia e 📊 desempenho
> desceram pro menu de pausa (o clique de botão É o gesto que o navegador exige).
> **A varinha deixou de ser toggle invisível:** ligada, o botão fica destacado e **⛏/▣ viram
> ① canto 1 / ② canto 2**.
>
> **bug-570, que só apareceu porque a barra passou a ser MEDIDA:** os botões dela tinham
> **30px** de alvo — abaixo do piso de 40 que o resto da UI respeita desde a 1ª rodada
> mobile. Atravessou as duas rodadas inteiras porque as medições do `tablet-shots.mjs`
> cobriam hotbar, chat, inventário e painéis, e não a barra. Agora ela tem 5 linhas lá
> (rótulos visíveis, alvo mínimo, largura contra a janela, relabel da varinha).
>
> **VERDE:** typecheck 3/3 · **578 testes** (+13) · build · **13/13 smokes** (o `preset` é
> novo, rodado 2× pra idempotência) · `npm run shots:amigos` com 13 asserções e **2 prints
> conferidos** (convite recebido / dona de grupo 2/6) · `npm run shots:tablet` verde, com o
> A/B do alvo da barra (30 → 40px, 433px de 1024) e o print `11-jogo-barra-varinha`.
> **PLAYTEST PENDENTE — e agora é ele que manda.**
>
> **SESSÃO 42 (2026-08-04) — SESSÃO CURTA, FORA DO JOGO: O LAUNCHER PARAVA DE PROCURAR
> ATUALIZAÇÃO EM SILÊNCIO.** O pedido foi conferir se `iniciar-servidor.sh/.bat` busca versão
> nova antes de subir o servidor — "está aparecendo uma mensagem que a atualização não está
> sendo buscada". **Busca sim; ele nunca chegava no `git fetch`** (bug-567).
>
> **A causa é a mordida da própria cauda:** o guarda de sujeira
> (`git status --porcelain --untracked-files=no`) roda ANTES do fetch e pula a atualização
> inteira se qualquer arquivo RASTREADO estiver modificado — e nesta máquina o hook do OpenWolf
> escreve em `.wolf/memory.md`, que é rastreado, em TODA sessão. Numa máquina de escola (sem
> Claude Code) o `.wolf` nunca suja e o script funciona como projetado; o defeito real era de
> UX: a mensagem não dizia QUAIS arquivos sujaram, então o skip era indiagnosticável.
>
> **Fix aplicado (opção do usuário entre 3): a mensagem passou a LISTAR os arquivos sujos**,
> teto de 10 + "(são N no total)" + a linha dizendo como voltar a atualizar. Nos dois scripts.
> No `.bat`, o `del` do arquivo temporário do `git status` teve de mover pra DEPOIS do uso —
> ele era apagado antes de dar pra ler.
> **O que eu NÃO fiz, de propósito: excluir `.wolf/` do teste de sujeira.** Commits `docs(wolf)`
> tocam `memory.md` quase toda sessão, então o `merge --ff-only` recusaria logo adiante e o
> aviso sairia com a razão ERRADA — a mensagem honesta é melhor que o skip movido de lugar.
>
> **VERDE:** `bash -n` + execução real do `.sh` com stub de `npm` (listou os 5 sujos de
> verdade) · ramo do >10 conferido · **bloco do `.bat` rodado no `cmd.exe` DE VERDADE**
> (via `/mnt/c`), nos dois ramos (3 e 13 arquivos), com o fixture apagado no fim.
> **Código do jogo não foi tocado — a fila do §🍖 continua onde a 41 deixou.**
>
> ⚠️ **Armadilha de diário anotada no cerebrum:** escrevi `| --:-- |` no `memory.md` por não
> saber a hora e o hook do `stop` avisou "no semantic summary" com a linha lá — a regex de
> `countSemanticEntries` (`.wolf/hooks/shared.js:630`) exige dígitos na hora. `date +%H:%M`
> antes de escrever.
>
> **SESSÃO 41 (2026-08-04) — O USUÁRIO PULOU O F7. DÍVIDA DE UI, E O CHROME DO NOTEBOOK
> RESOLVIDO.** Sessão aberta com `git fetch`: o local estava 4 commits atrás (a sessão 40 foi
> na máquina de casa), `pull --ff-only` limpo depois de descartar o cabeçalho de sessão VAZIO
> que o hook escreve no diário — **é a 2ª sessão seguida em que isso acontece; virou rotina de
> abertura.** Perguntado o que vinha depois, o usuário respondeu **"vamos pular o pvp"** e
> escolheu o lote de UI: borda de claim + 2ª rodada mobile.
>
> **A descoberta que destrava tudo nesta máquina: o chrome NÃO "não instala" no notebook.** O
> `npx @puppeteer/browsers install` **baixa os 190 MB, falha na extração por falta de `unzip`
> e mesmo assim sai com código 0** — foi esse exit 0 que fez as sessões 39 e 40 concluírem que
> a máquina não dava. Sem sudo: zip do chrome-for-testing + `python3 -m zipfile -e` +
> **`chmod +x` em TODOS os binários** (o zipfile do python perde o bit de execução, e sem o
> `chrome_crashpad_handler` executável o processo aborta) + libs por `apt-get download` /
> `dpkg-deb -x` / `LD_LIBRARY_PATH`. **Os scripts de print agora rodam nas DUAS máquinas.**
>
> **§🖼️ BORDA DE ÁREA RESERVADA ALÉM DO RAIO (pedido do usuário de 2026-08-03).**
> `RegionRenderer.cularPorDistancia(px, pz, raio)` novo: guarda os limites ao lado das caixas,
> esconde a que está além do raio pela MESMA régua chebyshev em x/z do descarte de coluna, e
> reaplica sozinha quando a lista troca. Chamado na varredura de 1×/s que já existia — **e
> DENTRO do `if (mundoLazy)` de propósito**: só o procedural descarta coluna; em mundo denso o
> mundo inteiro está montado e cular esconderia borda sobre terreno visível. As caixas de
> OBJETIVO ficam de fora (são alvo de navegação, têm de ser vistas de longe) — quem não chama
> o método continua desenhando tudo.
> **A verificação foi mais cara que o patch, e é a lição da sessão:** o teste passou DUAS vezes
> com o patch removido — 1º porque a área de teste caiu fora dos limites do mundo P (128×128) e
> nunca foi criada, 2º porque o three.js já corta por frustum e mundo P é denso. Só em mundo
> **E** (lazy), com `raioRender` baixado pra 2 no `localStorage` antes de entrar e 4 áreas a 60
> blocos nas 4 direções, o A/B falou a verdade: **sem o patch as 4 somam +1 draw call, com o
> patch somam 0, e a área perto continua desenhando** (bug-566).
>
> **§📱 2ª RODADA MOBILE — os painéis de AUTORIA.** O `scripts/tablet-shots.mjs` parava no
> inventário; agora abre o `#painel` e o `#jogadores`, e **semeia o painel pelo chat** (2
> regiões, 4 grupos, 2 objetivos) antes de medir — painel de mundo novo é quase vazio e a
> medição diria "cabe" sobre nada. **O baseline desmentiu a hipótese que estava no TODO:** a
> aposta era que as linhas quebravam por falta de largura; com o painel populado quebram só
> 4 de 19. **O defeito real que apareceu foi outro: 7 selects de 28px e 5 campos de 26px** — o
> bloco `@media (pointer: coarse)` cobria `#painel button` desde a 1ª rodada, mas nunca cobriu
> campo nem select, justamente onde o professor monta o objetivo. Fix: 40px de piso neles, e o
> `#painel`/`#jogadores` entraram no alargamento de paisagem baixa que o inventário já tinha.
> **A/B: selects 28→40, campos 26→54, linhas quebradas 4→3.** No caminho, bug-565: o detector
> de quebra comparava `top` dos filhos e virou falso-positivo assim que os alvos cresceram
> (`.painel-row` centraliza) — passou a medir ALTURA.
>
> **VERDE:** typecheck 3/3 · 565 testes · build · print do painel a 1024×600 conferido.
> **3 anotações novas no TODO a pedido do usuário** (interface do `/amigos`; a barra de toque
> com 6 botões; e o `/pvp` que ele pulou continua na fila). **PLAYTEST PENDENTE.**
>
> **SESSÃO 40 (2026-08-04) — §🍖 F6: A COMIDA, E A FOME QUE VOLTOU A MATAR.** Sessão aberta
> com `git fetch`: o local estava **3 commits atrás** (as sessões 38 e 39 foram feitas em
> outra máquina). Um `checkout` descartou o cabeçalho de sessão VAZIO que o hook tinha
> escrito no diário e o `pull --ff-only` trouxe o F5 inteiro. Depois, duas perguntas de
> escopo — o padrão das sessões 36 e 39 — e **o usuário escolheu GRANDE nas duas.**
>
> **A decisão do dia: `VIDA_MINIMA_POR_FOME` 6 → 0. A fome MATA de novo.** O F3 tinha travado
> a inanição em 3 corações porque não havia o que comer; agora há três coisas. O
> `textoDaMorte("fome")`, escrito na sessão 35 e nunca disparado, passa a acontecer — e o
> teste da session prova a morte pelo chat da turma. Continua reversível numa linha, e a saída
> pro fundamental 1 segue sendo `/regra fome desligar`, que tira a barra da tela.
>
> **O desenho que decidiu a frente inteira: CRESCER NÃO É REGRA DE VIZINHANÇA.** A fila de
> células sujas acorda por "alguém mexeu aqui do lado" — e planta não cresce por vizinho, ela
> cresce por TEMPO. Se `crescerPlantacao` estivesse no `rulesMap`, colocar um bloco ao lado da
> horta a amadureceria na hora. Então ela ficou **fora** do registro (é um `BlockRule` puro,
> testável igual aos outros) e a session a chama num PULSO, a cada `TICKS_POR_CRESCIMENTO`
> (200 ticks = 20 s por estágio, ~1 min da semente ao trigo), varrendo um índice
> `plantacoes` de células plantadas. O índice nasce e morre dentro do `applyBlockQuieto` — a
> mesma porta por onde TODA mudança de mundo passa, então não existe horta fora dele — e no
> `restore` ele **se reconstrói dos BYTES**: nenhum campo novo no `.ljw`, e mundo antigo abre
> sem migração. No `rulesMap` a plantação entra só pelo APOIO: cavar a terra derruba a horta.
>
> **As duas fontes, e por que duas.** A **fruta da folha** (1 em 8) é PASSIVA: quem só explora
> não passa fome, e nenhuma aula trava porque a turma não entendeu a horta. A **plantação** é
> ATIVA e é onde mora a pedagogia — semente do capim (1 em 4) → plantar em SOLO → esperar →
> colher **trigo + a semente de volta** → 3 trigo = 1 pão. **O trigo não se come de
> propósito:** é a dependência que transforma comida em sequência de 4 passos, em vez de um
> botão. As chances são muito mais generosas que as do Minecraft (maçã de folha lá é 1/200)
> porque aqui a unidade de tempo é a AULA, não a temporada.
>
> **`isSolo` e `apoioValido`:** planta não nasce em pedra, e essa é a regra que o aluno
> descobre na primeira tentativa. O detalhe que importa é que a pergunta é UMA — o gate do
> `place_block` e a regra do tick chamam a mesma função, senão dava pra colocar uma muda onde
> ela evaporaria no tick seguinte. **Comer não cura vida** (a vida já volta pela regeneração,
> que exige fome alta) e **de barriga cheia a mordida é RECUSADA**, senão o clique jogaria
> comida fora.
>
> **Três bugs, e um deles estava anotado desde a sessão 36:** **bug-558** o capim FLUTUAVA —
> `precisaApoio()` listava a grama alta, mas os 3 ids nunca entraram no `rulesMap`, e quem
> derruba o que perdeu apoio é a regra do tick, não o place. **bug-559** `/dar` recusava
> comida: a lista de exceções era "o balde", escrita à mão quando ele era o único item do
> jogo → virou `isItem()`, um Set explícito (a banda ≥900 não é intervalo aberto). **bug-560**
> era autoria de smoke: a asserção esperava o byte 182 e achava 183, porque o próprio smoke
> acelera o relógio com `LJ_CRESCIMENTO=5`.
>
> **VERDE:** typecheck 3/3 · **565 testes** (+28) · build · **12/12 smokes** (o `comida` é
> novo: prova pelo fio que a horta cresce no tick e chega como `block_changed` normal, que só
> pega em solo, que colher dá trigo + semente, que 3 trigo viram pão, e que comer gasta uma
> unidade) · **3 prints do F6 conferidos** (hotbar com os 4 ícones novos, atlas com os 4
> estágios, receita do pão filtrada) — **e o print do painel de craft que estava pendente da
> sessão 39, porque o chrome existe NESTA máquina.** **PLAYTEST PENDENTE.**
>
> **SESSÃO 40 (cont.) — §🏁 MAPA DE CORRIDA (`aula7-corrida.ljw`).** O usuário pediu "um mapa
> de corrida para aula". Corrida não é objetivo de CONSTRUIR: é `chegar`, que o motor tinha
> desde o cp12 e nunca tinha sido usado num cenário — a 1ª aula em que ninguém constrói nada.
>
> **Antes de codar, uma extração:** o `Autoria` (o "professor de mentira" que digita os comandos
> do cenário) morava dentro do `gerar.ts`, que roda uma CLI no corpo do módulo — importar dele
> geraria os 6 cenários como efeito colateral. Saiu pra `autoria.ts`, e os 6 `.ljw` regeneraram
> **byte a byte idênticos** antes de eu escrever uma linha da corrida.
>
> **A pista:** largada → escada → posto1 → vão com ponte de 1 bloco → posto2 → ziguezague →
> posto3 (na curva) → serpentina → chegada com pódio. Modo SEQUENCIAL: o HUD mostra um posto por
> vez, e o próximo só aparece quando a equipe fecha o atual — o aluno não escolhe a ordem, ele
> descobre que existe uma. **Os 3 primeiros postos são `um`** (basta um da equipe) **e a CHEGADA
> é `todos`**: quem correu na frente volta a buscar quem ficou. Corrida que premia só o mais
> rápido não deixa o que discutir no fim.
>
> **O verificador é o que fez a frente valer, e ele é o portão:** (1) acha caminho ANDÁVEL por
> BFS com o passo do jogador (sobe/desce no máximo 1), (2) faz uma aluna CORRER esse caminho e
> exige os 4 postos NA ORDEM, (3) exige que TODA célula do fundo do vão volte à pista. Os três
> pegaram erro real, e nenhum deles eu tinha visto lendo o próprio código: **bug-561** os
> corredores eram abertos na ponta -x e, em mundo plano, dava pra sair e contornar a pista pela
> grama (0 postos fechados); **bug-562** o posto 3 era faixa vertical numa curva que vira em z —
> dava pra driblar por fora; **bug-563** o vão tinha 1 de fundura (cavei só a camada do piso, e
> o plano é maciço abaixo), então a conferência da rampa passava **com a rampa removida** — e,
> cavado de verdade, apareceu o problema sério: a PONTE por cima parte o fundo em duas metades
> incomunicáveis e prende quem cai do lado sem rampa. Rampa espelhada + a conferência passou a
> exigir o fundo INTEIRO.
>
> **Mundo de aula de graça:** arquivo que começa com `aula` é read-only e reutilizável
> (`ehMundoDeAula`) — cada turma recebe a pista intacta e o confinamento nasce ligado, que aqui
> é a proteção da pista (ninguém cava atalho; o professor conserta).
>
> **VERDE:** typecheck 3/3 · 565 testes · build · 12/12 smokes · **7 cenários gerados** (a
> corrida passa pelo próprio portão) · 5 prints da pista (`npm run shots:corrida`).
> **PLAYTEST PENDENTE** — headless corre em linha reta; só o dedo diz se a pista é divertida.
>
> **SESSÃO 39 (2026-08-03) — §🍖 F5: CRAFT POR LISTA + O BALDE VIROU ITEM. Fecha numa sessão.**
> O usuário mandou "sigo pro F5" e escolheu o escopo GRANDE nas duas perguntas: **incluir o
> balde** (fecha o pendente do F4) e **receitas de madeira + pedra**. Antes de codar, uma
> interrupção do usuário virou anotação no TODO (não renderizar borda de área reservada além do
> raio de render) — backlog é pra ANOTAR.
>
> **`shared/src/receitas.ts` (puro):** `Receita { saida, custo[] }`, a lista `RECEITAS` é
> **APPEND-only** porque o índice é a identidade da receita no protocolo (`fabricar {receita}`).
> `podeFabricar`/`fabricar` são **tudo-ou-nada numa cópia** (consome os custos e só credita a
> saída se tudo saiu E ela cabe — senão o clique sumiria com os ingredientes), e `ingredientesDe`
> devolve have/need/falta por id pro "falta 3 tábua" do painel. Onze receitas: 4 troncos→tábuas,
> tábuas→laje/escada/mesa/cerca, pedregulho→laje/escada, e **3 minério de ferro → 1 balde vazio**
> (não é o número do Minecraft, mas não há forno no lite pra virar lingote).
>
> **O balde fechou o pendente do F4:** o `case balde` da session agora tem dois mundos. Em
> criativo o servidor NÃO exige item na mão (paleta infinita — e foi assim que o smoke criou uma
> fonte). Em sobrevivência ele **confere o balde no slot ANTES de mexer na água** (recusa não
> deixa rastro no mundo) e troca vazio↔cheio **NO MESMO slot** (`definirSlot` novo — trocar por
> remover+adicionar jogaria o balde pra outro slot e o aluno perderia o que segura). O slot viaja
> no `slot?` novo da mensagem `balde`. O ramo do balde no `main.ts` saiu do guarda `mochila.ativa`
> — em survival ele lê o item do slot do servidor e não escreve o próprio inventário.
>
> **Cliente:** o painel do E ganhou **abas mochila/criar**; a lista de craft é **tocar-pra-
> fabricar** (a linha inteira é o botão, o gesto do tablet), com "falta N" em vermelho, filtro de
> texto que re-renderiza SÓ as linhas (o foco do campo não pisca) e a hotbar do pé só mostra o
> que a mão segura. `fabricar {receita}` é a única mensagem nova client→server.
>
> **VERDE:** typecheck 3/3 · **537 testes** (+15 novos em `receitas.test.ts`) · build · **11/11
> smokes** (`craft` é novo: prova pelo fio que fabricar é do servidor, consome/credita, recusa
> por falta calado, criativo não fabrica, e o balde troca vazio↔cheio no mesmo slot — rodado 2×
> pra idempotência). **bug-557:** o smoke tentou criar a fonte com `/bloco <id da água>`, que é
> RECUSADO (água não é colocável, só entra por balde) — corrigido com o balde do professor.
> **PRINT DO PAINEL PENDENTE:** o chrome do puppeteer não está instalado nesta máquina (cache
> vazio) e não instalou no orçamento; o painel é DOM puro espelhando a mochila do F4, que já
> funciona. **PLAYTEST do usuário pendente** (headless não tem dedo pra tocar a receita).
>
> **SESSÃO 38 (2026-08-03) — SYNC COM O REMOTE + BALDE QUEBRA NO CRIATIVO (sessão curta).**
> O usuário pediu para clonar o repo por cima de uma cópia local desatualizada SEM `.git`:
> `git init` + `remote add` + `fetch` + `reset --hard origin/main` (renomeando `master`→`main`),
> preservando os untracked locais (`.wolf/`, `.claude/`, `node_modules/`). 91 arquivos-lixo
> `:Zone.Identifier` (artefato de download do WSL/Windows) apagados. **A mudança de jogo:** o
> balde (vazio OU cheio) agora QUEBRA bloco no modo criativo — antes `client/src/main.ts` (clique
> esquerdo) travava a quebra sempre que a mão segurava balde (`isBalde(...) → return`); agora só
> trava em sobrevivência (`&& modoAtual !== "criativo"`). O clique DIREITO do balde segue igual
> (despeja/recolhe fonte de água). O SERVIDOR não mudou: `break_block` (session.ts:984) nunca
> olhou o item na mão e em criativo `inventarioVale` é false → sem drop, quebra direto. **VERDE:**
> typecheck 3/3. **PLAYTEST PENDENTE** (headless não clica). A fila do jogo segue no §🍖 F5 (craft).
> **SESSÃO 37 (2026-08-03) — OS HOOKS PARARAM DE MENTIR (sessão curta, fora do jogo).** O
> pedido foi "corrigir erros com os hooks": os três falso-positivos que a sessão 36 documentou
> e não consertou. Os três são bug agora (554/555/556) e estão corrigidos em `.wolf/hooks/`,
> **que é código rastreado deste repo** — a lição de fundo é essa: hook do OpenWolf se
> conserta, não se contorna.
>
> **A descoberta que explica por que o fix upstream nunca chegou:** o pacote 2.0.1 traz DUAS
> cópias dos hooks — `dist/hooks/` (build do `tsconfig.hooks.json`, tem o PR #64) e
> `dist/src/hooks/` (build principal do tsc, não tem). O `copyHookScripts` do `init.js` procura
> nessa ordem e **a segunda vence**. Todo `openwolf init/update` instalou a versão velha,
> inclusive o commit `192acff`, que dizia sincronizar com o 2.0.1.
>
> **(1) "no semantic summary"** comparava DATA, e não havia data nenhuma para casar: o prefixo
> `| YYYY-MM-DD` não existe no diário (o formato que o próprio aviso pede é `| HH:MM |`), e o
> header `## Session:` é gravado no INÍCIO da sessão misturando data UTC com hora local — sessão
> que atravessa a meia-noite fica com a data de ontem. Agora conta abaixo do ÚLTIMO
> `## Session:`, **sem olhar data**. **(2) "buglog.json was not updated"** via só
> `session.files_written`, que só recebe Write/Edit — append por `python3` no Bash era invisível.
> Agora o **mtime** do arquivo também vale. **(3) A linha `Session end:` repetida** era append de
> contador CUMULATIVO a cada `stop`; agora só grava quando o resumo muda e **sobrescreve** a
> linha do fim do arquivo. As 41 cópias já gravadas foram colapsadas (só elas mudaram no diário).
>
> **VERDE:** `node .wolf/hooks/_test-hooks.mjs` **10/10** — roda o `stop.js` DE VERDADE numa
> fixture de `/tmp` e prova também o lado negativo (sessão sem resumo ainda avisa, buglog
> intocado ainda avisa, linha mecânica não passa por resumo semântico). No `memory.md` real o
> contador foi 0 → 1 ao escrever a entrada. ⚠️ O patch foi copiado à mão para as duas cópias do
> pacote global (`.bak-pre-fix` ao lado): **`pnpm update -g openwolf` apaga**, e aí a fonte é
> `.wolf/hooks/`. **O código do jogo não foi tocado** — a fila continua no §🍖 F5.
>
> **SESSÃO 36 (2026-08-03) — §🍖 F4: O INVENTÁRIO AUTORITATIVO. A "frente cara" (2–3 sessões
> no orçamento) fechou INTEIRA numa sessão.** O usuário pediu "continuar" e, antes, registrar
> no TODO a regra de vegetação precisar de apoio. Registrando, achei o buraco de verdade:
> `precisaApoio()` JÁ lista grama alta, mas `GramaAlta/Seca/Fria` (179–181) **não estão no
> `rulesMap`** — o capim flutua hoje. Ficou anotado com o fix (um `for` de 3 ids apontando pro
> `torchRule`), não implementado, porque o pedido foi registrar.
>
> **A mochila é ESTADO DO SERVIDOR, por NOME** (como o modo e os vitais — sobrevive ao rejoin e
> à troca de aula). 27 slots: 9 hotbar + 18 mochila, pilha de 64. `shared/src/inventario.ts` é
> puro e IMUTÁVEL (toda função devolve inventário novo, disciplina do `sobrevivencia.ts`), e
> `tamanhoStack(id)` já nasce com a porta pra ferramenta: hoje só o balde é 1 por slot.
>
> **`shared/src/drops.ts` tem duas regras e uma tabela curta.** (1) **Forma canônica**: porta
> aberta, cama virada pro sul e escada de cabeça pra baixo voltam como a entrada da HOTBAR —
> senão o aluno ganharia item que não sabe recolocar, e a direção sai do olhar dele no
> `place_block`, não do byte guardado. (2) **Por padrão o bloco cai ele mesmo** (desfazer tem de
> ser reversível numa aula); só grama→terra, pedra→pedregulho, folha/água/bedrock→nada fogem
> disso. Um teste-portão varre TODOS os ids e prova que nada cai em algo não-colocável ou
> só-de-professor.
>
> **Onde o débito mora: no MESMO ponto pós-`switch` que o esforço do F3.** "O mundo mudou" =
> "a colocação valeu", então porta e cama (2 células) custam UM item e os 4 ramos de
> materialização cobram sozinhos. **bug-549 saiu daí:** o detector era
> `changedThisTick.size > antes`, e aquilo é um CONJUNTO de coordenadas — quebrar e recolocar a
> MESMA célula no mesmo tick de 100 ms não mexia no tamanho, então a colocação saía DE GRAÇA
> (bloco infinito por clique rápido; o esforço do F3 também escapava). Virou contador
> monotônico `edicoesAplicadas`, incrementado dentro do `applyBlockQuieto`, com teste de
> regressão.
>
> **Mochila cheia RECUSA a quebra** (não existe item no chão — decisão travada no ROADMAP): a
> conferência vem ANTES do `applyBlock`, pra que a recusa não deixe rastro no mundo, e o aviso
> no chat tem freio de 5 s porque quebrar é clique repetido. O crédito vem DEPOIS de o mundo
> mudar, e a segunda metade da porta/cama — que o `doorRule`/`camaRule` apaga no tick seguinte —
> não passa por lá: uma porta não vira duas.
>
> **`manter-inventario` finalmente decide alguma coisa** (`matar()` lê a regra; desligada, a
> mochila some inteira) e saiu do `RegraDef.pendente`. Só o `pvp`/F7 ainda avisa "falta a
> mecânica".
>
> **`/dar <eu|all|nome> <id> [qtd]` é NOVO e está FORA do escopo travado** — decisão minha, e o
> usuário pode reverter. Razão: com inventário autoritativo o mundo de sobrevivência começa com
> todo mundo de mãos vazias e não há craft até o F5, então sem ele o professor não prepara
> atividade nem conserta acidente. É a contraparte do `/bloco` (teleoperação: não custa esforço,
> não exige alcance), professor-only, e foi o que destravou os testes também.
>
> **Cliente:** `mochila.ts` novo (espelho puro, sem DOM — **a UI nunca decide**), hotbar com
> contagem por slot e slot vazio que mantém a altura (senão a barra pula quando o aluno gasta o
> último bloco), e o painel do E vira "mochila" em sobrevivência: 9 colunas alinhadas com a
> hotbar e o gesto de **tocar na origem, tocar no destino** — arrastar dói no tablet, é a mesma
> razão que descartou a grade 3×3 do craft. `?mochila=3x64,-,4x7` pra inspeção (o par do
> `?vida=`), e ele TRANCA contra a rede, senão o `modo criativo` de todo join apagaria o print.
>
> **VERDE:** typecheck 3/3 · **522 testes** (63 novos) · build · **10/10 smokes** (o
> `inventario` é novo e rodou 2× pra provar idempotência) · prints da hotbar e da mochila
> conferidos, sem erro de console. **PLAYTEST PENDENTE** — headless não tem dedo.
>
> **SESSÃO 35 (2026-08-02) — §🍖 F3: A FOME. E a 33/34 finalmente FORAM PRO GIT.** O usuário
> pediu "continue, mas faça commit de tudo antes": a sessão 34 inteira (F1+F2) estava só no
> disco. Ela saiu em 2 commits (`ef29ee8` código, `6b7f63a` wolf) depois de verificar — e só
> então a fila andou.
>
> **A barra NÃO desce por relógio: desce por ESFORÇO.** É a mesma disciplina do ciclo, do vento
> e do fôlego (nada de `Date.now()`), mas com um segundo motivo: o dreno tem de acompanhar o que
> o aluno FEZ, não quanto a aula durou — quem passou vinte minutos lendo o quadro não pode
> chegar faminto. Cada atividade soma exaustão fracionária num acumulador e, a cada **4,0**
> acumulado, um ponto de fome vai embora (número do Minecraft). A régua escolhida: **0,01 por
> bloco andado (400 blocos = 1 ponto), 0,02 por bloco colocado ou quebrado (200 = 1 ponto) e
> 3,0 por ponto de vida regenerado.** A edição vale o DOBRO do passo de propósito — neste jogo
> a atividade principal da aula é construir, não correr, então é a construção que tem de mover
> a barra. Ordem de grandeza: uma turma construindo gasta a barra inteira em ~50 min.
>
> **`VIDA_MINIMA_POR_FOME = 6`: a fome ENFRAQUECE, não mata.** A decisão do dia. O roadmap dizia
> "fome no zero → dano lento", e o dano existe (meio coração a cada 4 s, pela porta única
> `aplicarDano(…, "fome")`), mas ele **para em 3 corações** enquanto a comida (F6) não existir —
> matar de fome num jogo onde não há o que comer é frustração de aula, não desafio. É o análogo
> do nível "fácil" do Minecraft. Baixar a constante pra 0 devolve a inanição letal em UMA linha;
> o `textoDaMorte("fome")` já está escrito e o cliente já sabe pintar a tela.
>
> **O dreno sai do fluxo que o servidor JÁ recebe** — o `move` a 10 Hz que fecha a queda do F2 —
> e a edição é cobrada **num lugar só, depois do `switch` do `handleMessage`**: cada caso já
> devolveu cedo quando recusou, então "o mundo mudou" é o mesmo que "a edição valeu". Porta e
> cama (2 células) custam UMA edição; abrir porta e teleoperação de professor (`/bloco`) não
> custam nada. Passo maior que 4 blocos numa amostra é teleporte, não passo (respawn e `/tp`
> não cobram fome).
>
> **A regra `fome` virou o gate de verdade** (era decorativa desde o F1): desligada, a barra
> some do HUD na hora — o campo `fome` simplesmente não vai na mensagem `vida`, e **ausente
> significa "este mundo não tem fome"**. Quem já estava faminto quando o professor desligou
> volta a se regenerar (senão ficaria travado sem regeneração num mundo sem fome). O `/regra`
> parou de avisar "só passa a valer quando a mecânica existir" para a `fome` — agora só as
> pendentes de verdade (`manter-inventario`/F4 e `pvp`/F7) levam o aviso, por um campo
> `pendente` novo no registro.
>
> **HUD:** coxas ao lado dos corações, mesma escala (20 pontos = 10 ícones, meia coxa no ímpar).
> As duas barras vivem num flex `wrap` — em tela estreita a linha QUEBRA sozinha, sem media
> query. Detalhe que só o print pegou: a carne da coxa teve de ir pro lado ESQUERDO do ícone,
> porque o `clip-path` da metade recorta a esquerda e meia coxa tem de mostrar carne, não osso.
> O `?vida=` virou `?vida=13,45,7` e o F3 (tecla) agora mostra `vida 13/20  fome 7/20`.
>
> **VERDE:** typecheck 3/3 · **459 testes** (14 novos) · build · **9/9 smokes** (o `fome` é novo:
> prova o dreno pelo fio, criativo imune no mesmo mundo, a regra ligando/desligando a barra na
> hora e o piso de 3 corações) · print do HUD conferido (3 bolhas · 6½ corações · 3½ coxas, sem
> erro de console). **PLAYTEST PENDENTE** — headless não diz se a barra desce rápido demais.
>
> **SESSÃO 34 (2026-08-02) — A SOBREVIVÊNCIA COMEÇOU: §🍖 F1 E F2 NUMA SESSÃO.** O usuário
> fechou as pendências da 33 num turno ("deixa o push, playtest de relevo, luz+cavernas feitas,
> pode seguir") — **os dois playtests estão FEITOS e ele não pediu ajuste nenhum**, e o push
> segue adiado por escolha dele. Então a fila andou duas casas: F1 (o interruptor) e F2 (a
> primeira mecânica).
>
> **F2 — VIDA, DANO, MORTE, RESPAWN.** `shared/src/sobrevivencia.ts` puro (sem I/O, sem relógio
> de parede: o tempo entra como CONTAGEM DE TICKS, igual ao ciclo e ao vento) com **uma porta só
> pro dano** — `aplicarDano(estado, n, causa)`. Queda e afogamento são as causas do lite; fome
> (F3), PvP (F7) e mob (F8) entram pela MESMA função, só somando um valor em `CausaDano`.
> Escala do Minecraft: 20 pontos = 10 corações, queda de 3 blocos de graça e meio coração por
> bloco acima disso, 15 s de ar e 1 coração/s afogando, regeneração de 1 ponto a cada 4 s.
>
> **Quem fecha a queda é o SERVIDOR, do fluxo de `move` que ele já recebe** (10 Hz): guarda o
> pico de altura por cliente e cobra quando o jogador pousa, testando o apoio com
> `apoiadoNoChao` (novo em `physics.ts`, reusando a MESMA lógica de laje/escada do `collides` —
> nada de uma segunda definição de "chão"). **O cliente nunca reporta dano.** ⚠️ A tolerância
> está escrita no código: a 10 Hz cada amostra pode pular ~4 blocos, então a altura medida erra
> PRA MENOS — o aluno leva menos dano do que a queda real, nunca mais. Num jogo de sala de aula
> esse é o lado certo do erro. Teleporte (respawn, `/tp`) e troca de modo ZERAM o pico: quem
> voava em criativo não pode pousar machucado ao entrar em sobrevivência.
>
> **HUD novo (`client/src/vitals.ts`)**, self-contained como o `loading.ts`: corações (meio
> coração via `clip-path`), bolhas de ar, vinheta vermelha ao levar dano e aviso de morte —
> ícones em SVG embutido, zero asset externo. Criado SOB DEMANDA: mundo criativo não paga DOM
> nem CSS. **A UI nunca decide** (mesma disciplina do `inventory.ts`).
>
> **`?vida=7,45` na URL** (par do `?hora`/`?vento`/`?atlas`) congela o HUD pra inspeção. Foi
> assim que os corações foram VISTOS: print sobre a cena do `?bench` com 3 bolhas, 3 corações
> cheios e um pela metade, dentro da tela e sem erro de console.
>
> **O que o F1 entrega, e o que ele deliberadamente NÃO entrega:** sobrevivência ainda joga
> IGUAL a criativo. O que muda é o rótulo e o **voo** — quem está em sobrevivência não voa, nem
> com `/voo` liberado, nem sendo professor (é justamente ele que digita `/modo sobrevivencia eu`
> pra demonstrar). Vida, fome, inventário finito e craft são F2..F6 e vão LER daqui.
>
> **Duas camadas, e a de baixo é por NOME:** padrão do MUNDO (gravado no `.ljw`) + override
> pessoal por nome de jogador — não por id de cliente, porque o modo tem de sobreviver ao
> rejoin, igual ao roster e ao PIN. Quem resolve o efetivo é o SERVIDOR; a mensagem nova carrega
> só `modo {efetivo}`, porque o cliente não tem (nem precisa ter) o mapa de overrides.
>
> **`/regra` nasceu junto, e é o que faz as frentes seguintes serem baratas:** registro em
> `shared/src/regras.ts` (nome, padrão, ajuda) + UM comando genérico + UM campo
> `regras?: Record<string, boolean>` no `SaveMeta`. `manter-inventario` (LIGADA), `pvp` e `fome`
> já existem sem mecânica — o F2 vai só ler `valorRegra(...)`. Regra nova = uma entrada na
> lista: sem comando novo, sem campo novo, sem re-versionar save.
>
> **Três decisões que o código carrega e o teste prova:**
> 1. **`all` não arrasta o professor que digitou** — ele fica como está (e volta pra turma com
>    `eu`). É ele que precisa continuar voando pra supervisionar.
> 2. **Mundo-aula é criativo à força**, vencendo o save e recusando o comando: a aula distribui
>    um MODELO, não uma partida (mesma lógica do confinamento forçado do cp25).
> 3. **O save só grava o DIFF do padrão** — mundo que nunca viu sobrevivência sai byte a byte
>    como antes, e padrão novo passa a valer em mundo antigo sem migração.
>
> **A armadilha que só o smoke pegou (bug-547):** o smoke novo passou na 1ª rodada e FALHOU na
> 2ª, sem uma linha de código mudar. `LJ_NOVO=1` **não recria mundo que já existe** — ele só
> AUTORIZA criar onde não há arquivo. Como o smoke ESCREVE estado persistente (modo, ajuste
> pessoal, regra), a 2ª rodada nascia com o estado da 1ª. A pista foi a assimetria: ana passava
> e bia falhava, que era exatamente o estado final da rodada anterior. O manifesto do
> `scripts/smoke.mjs` ganhou `limpar: [pastas]`, e o smoke rodou 2× seguidas pra provar.
>
> **VERDE:** typecheck 3/3 · **445 testes** (53 novos) · build · **8/8 smokes** (dois novos: o
> `modo` prova o `all`, quem entra depois, o aluno barrado e a ida-e-volta pelo DISCO; o `vida`
> prova que o servidor fecha a queda, que criativo é imune no MESMO mundo, que a morte devolve
> ao spawn avisando a turma e que a regeneração anda no tick) · bench headless boota, streama e
> mesha · print do HUD de vida conferido. **NÃO COMMITADA** — a 33 também segue sem push.
>
> **PLAYTEST PENDENTE, e é o que mais importa agora:** headless não diz se morrer de queda é
> justo, se 15 s de ar é pouco, nem se os corações ficam legíveis no tablet. Ver §pendências.
>

---

## 🎯 O que é o projeto

Jogo sandbox voxel 3D, **web**, engine e assets próprios (NÃO usar Minecraft/Eaglercraft
code ou assets — projeto.txt seção 9 proíbe software não licenciado). Objetivo pedagógico:
desenvolver pensamento lógico / raciocínio computacional (BNCC, ISTE/CSTA, Wing).
Alternativa gratuita e própria ao Minecraft Education para a rede estadual (SC).

**A pedagogia mora nos CENÁRIOS, não no motor.** O jogo é uma plataforma de autoria:
professores (e alunos) criam mundos + objetivos dentro do próprio jogo e distribuem.

Público: 2º ao 9º ano do fundamental. Turmas homogêneas (diferença máx. 3 anos por turma).
8–20 alunos simultâneos. Entrega final = **relatório de aplicação com alunos** (piloto),
com parte técnica como anexo. Dev 100% vibecode; o usuário orquestra, não revisa código.

Ordem real de trabalho: **motor → cenários → piloto com uma turma → relatório.**
Documento é o ÚLTIMO entregável, não o primeiro. Construir, não documentar.

---

## ✅ Concluído

- **§⚡ DESEMPENHO — CICLO FECHADO (sessão 27, 2026-07-27).** Perfilado o notebook do
  laboratório (Intel UHD 630), diagnosticado que o custo era CPU de meshing na main thread
  (`malha` 9,7–13,4 s contra 1,9 s no dev, com `mundo` idêntico → não era rede), movido o
  mesher do streaming pra Web Worker (`meshVizinhanca` = função pura sobre um cubo 18³),
  medido o A/B no lab, corrigida a regressão de FPS que o Worker sem freio causou
  (coalescência de job em voo + profundidade por fase) e fechada a profundidade em 1 com 6
  rodadas etiquetadas. **Resultado: FPS do caminho síncrono (50) com a carga em 4,5 s no
  lugar de 11,5 s, e cauda melhor que a do síncrono (p95 26,7 × 28,1).** Nenhum gatilho de
  otimização segue aceso.
- Entrevista de requisitos (2026-07-10). Todas as decisões abaixo.
- Revisão do projeto com Fable 5 (2026-07-10): render fechado em **three.js**;
  código vai morar em `~/projetos/logica-em-jogo` (WSL), fora do OneDrive.
- Git iniciado (branch `main`, identidade local) + commit dos docs (2026-07-10).
- **Scaffold do monorepo (2026-07-10):** npm workspaces `shared/` + `server/` + `client/`.
  TS 7 estrito (base em `tsconfig.base.json`), Vite 8, three.js 0.185, ws 8, tsx, vitest 4.
  `/shared` exporta `BlockId` (0=ar…4=areia), `CHUNK_SIZE=16`, dims de mundo, `SERVER_TICK_RATE=10`
  — com teste de contrato passando. `/client` = cena three.js mínima (prova pipeline).
  `/server` = placeholder ws (checkpoint 5). Verificado: typecheck 3/3, testes, build, smoke do ws.
- **Checkpoint 1 (2026-07-11): mundo estático + andar + HUD F3.** Novo em `/shared`
  (TS puro, zero deps): `world.ts` (chunks Uint8Array, get/setBlock em coords de mundo),
  `worldgen.ts` (value noise determinístico — mesma seed = mesmos bytes), `mesher.ts`
  (culled mesher FUNÇÃO PURA + layout do atlas), `physics.ts` (gravidade/colisão AABB/pulo,
  com sub-passos anti-tunneling; servidor reusa p/ validar depois). Novo em `/client`:
  `atlasTexture.ts` (atlas procedural via canvas, sem assets externos), `chunks.ts`
  (1 mesh/chunk, remesh() pronto pro checkpoint 3), `input.ts` (pointer lock + WASD),
  `hud.ts` (F3: FPS, frametime méd/p95, remesh, draw calls/tris, rede zerada, export JSON),
  `main.ts` reescrito. 20 testes passando (world/mesher/physics/blocks), typecheck 3/3,
  build ok, screenshot headless confirma o mundo renderizando (terreno + areia + overlay).
- **Push pro GitHub (2026-07-11):** repo privado `meketreve/logica-em-jogo` (criado no
  scaffold), remote `origin` já configurado — main sincronizada. Backup do código ok.
- **Checkpoint 2 (2026-07-11): servidor autoritativo via Web Worker.** Novo em `/shared`:
  `protocol.ts` (mensagens JSON com parse DEFENSIVO dos dois lados + `world_snapshot`
  binário — header "LJW0" LE com dims+seed, validado no decode) e `session.ts`
  (GameSession pura, independente de hospedeiro, clock injetável: `join`→snapshot,
  `move` registrado, `debug_stats` 1×/s com tick méd/máx). Novo em `/server`: `worker.ts`
  (host Web Worker — SÓ transporte + agendar tick). Novo em `/client`: `connection.ts`
  (interface `Connection` = mesma do WebSocket do checkpoint 5, com contadores de rede).
  `main.ts`: mundo agora CHEGA do servidor (join → snapshot → decode → render); cliente
  manda `move` 10×/s; HUD F3 mostra rede real (msg/s, B/s, tick méd/máx do servidor).
  Física do próprio jogador segue local (servidor valida depois). 33 testes (13 novos:
  protocol roundtrip/validação + session), typecheck 3/3, build ok (worker = bundle
  separado de 3,3 kB), screenshot idêntico ao checkpoint 1 — como planejado.
  Playtest do usuário ✅ ("tudo certo").
- **Checkpoint 3 (2026-07-11): colocar e quebrar bloco.** Novo em `/shared`: `raycast.ts`
  (DDA Amanatides-Woo, função pura — cliente mira, servidor pode validar depois),
  `PLAYER_REACH=5` em constants, `isPlaceable()` em blocks. Protocolo: `place_block`/
  `break_block` (coords inteiras validadas) e `block_changed` (ServerMessage virou união;
  cliente NÃO distingue origem — jogador, outro jogador ou gravidade futura). Session
  valida TUDO no servidor: join obrigatório, bounds, célula ar/sólida, alcance com folga
  (pos do move a 10 Hz), não emparedar jogador (AABB); spawn agora é autoritativo.
  Cliente: clique esq/dir → mensagem → servidor → `block_changed` → setBlock local +
  `remeshBlock()` (remesh do chunk + vizinhos na borda); highlight de mira (LineSegments),
  crosshair, hotbar 1–4 (grama/pedra/pedregulho/areia). 42 testes (9 novos), typecheck
  3/3, build ok, screenshot com crosshair+hotbar. Areia colocada FLUTUA — esperado,
  gravidade é o checkpoint 4. Playtest ✅; "não coloca na outra chunk" investigado =
  borda do MUNDO, by design (bug-004; repro script confirma place interno ok).
- **Checkpoint 4 (2026-07-11): areia cai — REGRA DE OURO implementada.** Novo em
  `/shared`: `rules.ts` — sistema GENÉRICO de atualização por vizinhança: `BlockRule`
  (lê mundo → devolve `BlockChange[]`), registro `RULES`, `ruleFor()`. Areia = 1 regra
  registrada ("baixo é ar → desce 1"); circuitos futuros = mais regras, MESMA engrenagem.
  Session: fila `dirty` (Set de coords empacotadas); `applyBlock` marca célula+6 vizinhos;
  tick drena o lote do tick anterior, roda regras, aplica mudanças (novas sujeiras ficam
  pro próximo tick → areia cai 1 célula/tick ≈ 10/s); guarda `changedThisTick` impede
  célula mudar 2× no mesmo tick (sem teleporte). Queda chega ao cliente como
  `block_changed` NORMAIS — cliente mudou ZERO linhas (só rótulo do HUD → 4). Ordem da
  regra: materializa embaixo antes de limpar origem (sem buraco piscando). 48 testes
  (6 novos: regra pura + cascata via protocolo + rejeição out-of-bounds do bug-004),
  typecheck 3/3, build ok. Playtest do usuário ✅ (2026-07-11, "tudo certo").
- **Checkpoint 5 (2026-07-11): segundo cliente (LAN) — Node+ws real.** Protocolo:
  `player_moved` (relay SÓ pros outros — servidor nunca ecoa pro autor; cliente não
  precisa saber o próprio id) e `player_left` (disconnect), parse defensivo dos dois.
  Session: move → broadcastExcept; handleDisconnect avisa quem fica (idempotente).
  `/server/src/index.ts` virou host real: embrulha a MESMA GameSession do worker
  (id por socket via contador, close→handleDisconnect, handler de error obrigatório,
  frames binários de subida ignorados), seed 20260710 igual ao worker. Cliente:
  `WsConnection` (mesma interface Connection; fila até open; binaryType arraybuffer),
  `?server=ws://host:8080` na URL escolhe hospedeiro (sem parâmetro = Web Worker
  local como antes); outros jogadores = caixa colorida por id (HSL golden ratio),
  sem lerp (gatilho: só se serrilhar). Sem "player_joined": presença emerge do move
  a 10 Hz. 51 testes (3 novos), typecheck 3/3, build ok. Smoke real (Node 24,
  WebSocket global, zero deps): 2 clientes ws no servidor — snapshot idêntico,
  relay sem eco, block_changed pros dois, player_left ✅. Screenshots headless:
  cliente via ws E via worker renderizam. **Playtest do usuário ✅ (2026-07-11,
  "tudo certo")** — achou o bug-010: rejoin nascia no fundo do buraco (spawn era
  recalculado por findSpawnY a cada join, sobre o mundo já escavado). **Corrigido:**
  spawn FIXO calculado uma vez no construtor da GameSession (terreno pristino) +
  mensagem `spawn` nova no protocolo (enviada antes do snapshot); cliente usa o
  ponto do servidor pra nascer e pra respawn (nunca deriva do snapshot). 53 testes
  (2 novos, incl. regressão: escavar coluna não muda spawn do próximo join),
  smoke real contra mundo escavado ✅. Re-playtest do usuário ✅ (2026-07-11, "top").
  **Checkpoint 5 FECHADO.** (Movimento remoto: usuário não reclamou de serrilhado —
  lerp continua adiado, gatilho não disparou.)
- **Checkpoint 6 (2026-07-11): chat + /bloco — código do MVP v0 COMPLETO.** Protocolo:
  `chat` client→server (texto) e server→client (autor+texto), parse defensivo;
  `MAX_CHAT_LENGTH=200` e `MAX_NAME_LENGTH=24` (servidor corta; nome vazio → "jogador").
  Session: chat exige join; texto vira broadcast pra TODOS com autor `nome#id`
  (eco pro autor = confirmação do round-trip); prefixo `/` = comando com resposta
  SÓ pro autor (autor "servidor"). 1 comando: `/bloco x y z id` — muda o mundo via
  applyBlock (MESMO pipeline: block_changed + fila de vizinhança → areia colocada
  por comando CAI no tick), sem checagem de alcance (comando é teleoperação),
  valida bounds/id/não-emparedar. Boas-vindas no join (chat do servidor) — prova o
  canal sem segundo cliente. Cliente: `chat.ts` (UI HTML/CSS sobre o canvas; Enter
  abre/envia, Esc fecha; mensagem some em 10 s e volta com o chat aberto;
  textContent = sem XSS), `events.ts` (gatilhos de som block_placed/block_broken/
  chat_message — áudio pluga depois, fora do MVP), input.ts ignora teclas vindas
  de campo de texto + `lock()` público (fechar chat re-trava o mouse). 57 testes
  (6 novos), typecheck 3/3, build ok. Smoke real (2 clientes ws): welcome,
  broadcast com autor, /bloco muda o mundo, resposta só pro autor, comando
  inválido não vaza ✅. Screenshot headless: welcome chat renderizado na tela.
  **Playtest do usuário ✅ (2026-07-11, "tudo funciona"). Checkpoint 6 FECHADO —
  MVP v0 COMPLETO: os 4 critérios de aceitação atendidos e jogados.**
- **Grupo A de blocos (2026-07-11, aprovado pelo usuário): 14 blocos novos** —
  terra, tronco (topo com anéis/lado com casca — prova textura por face), tábuas,
  tijolo, cascalho (CAI — regra de queda virou `fallingRule` GENÉRICA, areia e
  cascalho compartilham), rocha-matriz/bedrock (`isBreakable()` — jogador não
  quebra, `/bloco` remove = caminho do professor), 8 lãs coloridas (base da
  pedagogia de sequência). Atlas 4→8 tilesPerRow (20 tiles pintados, procedural).
  IDs 5–18 (APPEND only). Cliente: hotbar 18 blocos (1–9 direto + scroll do mouse
  cicla todos, `input.onWheel`), `?atlas` na URL mostra o atlas no canto
  (inspeção visual de texturas). 60 testes (3 novos: queda genérica, bedrock,
  cobertura mesher de TODO id colocável), typecheck 3/3, build ok, screenshot
  com atlas confere. Playtest do usuário pendente (texturas = gosto).
- **§🕐 TELA DE CARREGAMENTO (2026-07-26, sessão 25)** — `client/src/loading.ts` novo
  (self-contained, DOM+CSS injetados, padrão do `touch.ts`). Cobre do "jogar" até o mundo
  pronto, nos DOIS caminhos (worker e ws). **Progresso real** = `colunasCarregadas.size ÷
  total do raio` (o total é a MESMA conta do `streamColunas`: quadrado de `raioRender` em
  volta do chunk do spawn, recortado pelas bordas), monotônico e clampado; **spinner
  decorativo** no canto em CSS puro (gira mesmo se a rede parar = sinal de vida). Linhas:
  colunas prontas/total, em transferência (`colunasFaltando.size` da varredura §🔁 — sem
  segunda medição), chunks na fila de malha, taxa em **bits/s** (`bytesIn+bytesOut` ×8,
  amostrado 1×/s como o HUD F3), recebido, tempo + ETA pelo ritmo de colunas (EMA),
  hospedeiro. Fase honesta: conectando → recebendo/gerando o mundo → montando a malha →
  pronto (troca pra "malha" sozinha quando as colunas acabaram mas a fila não). Anel fica
  **indeterminado** (arco girando, "…") enquanto não há total — mundo denso vem num blob só
  e 0% parado parecia defeito. **Bloqueio do usuário resolvido (bug-515):** `updateOverlay()`
  ganhou `loading.ativo` (menu Esc não aparece mais durante a carga) e o mesmo na UI de
  toque. Fecha só com o raio inicial INTEIRO aplicado **E** `filaPendente === 0` (entrar
  antes = mundo com buracos), com um respiro de 400 ms em 100%; devolve o menu de pausa como
  porta de entrada (o clique é o gesto do pointer lock). **Extra:** `WsConnection` ganhou
  `aoFalhar` (onerror/onclose, avisa uma vez) → servidor fora do ar/IP errado vira mensagem
  vermelha + "voltar ao menu" (mesmo caminho do `join_denied`), em vez de spinner eterno;
  botão "entrar mesmo assim" aparece após 20 s. VERDE: typecheck 3/3, 329 testes, verificação
  headless em mundo E (33% · 56/169 colunas · 2.1 Mbps · ETA 4,7 s), mundo P (denso → 100% →
  fecha) e servidor inexistente (estado de erro). **Playtest do usuário PENDENTE.**

- **Sessão 25 — o resto (2026-07-26), tudo commitado:**
  - **§🕐 na TROCA DE AULA** (`/mundo carregar`): msg nova `mundo_trocando {nome}` sai do host
    logo APÓS o decode do .ljw e ANTES de salvar/gerar, a tela sobe na hora (fase `preparando`,
    anel indeterminado) e uma **fila de 2× rAF** garante que o frame COM a tela pintou antes do
    trabalho pesado. Pointer lock não é solto → ao fechar, volta a jogar sem clique.
  - **Quatro bugs achados LENDO PERFIL** (não por teste): **bug-517** `trocarMundo` fazia
    `buildAll()` em mundo lazy (460 800 remesh de slot vazio, ~19 s de trava); **bug-518** a
    sessão nova do `/mundo carregar` zerava o raio pra `RAIO_PADRAO` e o cliente não
    reanunciava (mundo cortado no anel 6, 252 repedidas); **bug-519** `meta` do perfil ficava
    no mundo do join; **bug-523** `TorchGlow.setFromWorld` varria BLOCO A BLOCO — 1,887 bilhão
    de células num mundo E = **41 s de aba travada** ("página não está respondendo"), e era a
    explicação dos ~38 s de long task iguais em três perfis de durações diferentes. Varredura
    por chunk: **41 361 ms → 2,9 ms**. Tocha de coluna do streaming agora ganha halo.
  - **Orçamento de mesh por TEMPO** (`meshMsPorFrame`, 1–16 ms, padrão 6) no lugar da contagem
    fixa: p95 da gravação **43–82 ms → 18,7/20,4 ms**, frames >50 ms **9–50 → 0**, FPS 41–53 →
    **57/60**, long tasks da sessão 128–299 → **2**. Preço combinado: `fila` 0 → 84/189.
  - **Perfilador com CONTEXTO e por FASE**: `jogador` (pos/yaw/pitch/voando/chunk), `config`
    (raio, orçamento, pixelRatio, fov), `gravacao.movimento` (estado, distância, velocidade,
    colunas novas), `fases[]` (carregando × jogando: fps, `renderPct`, travadas),
    `pioresTravadas` (top 5 com fase e segundo), `remeshPorCaminho` (fila × bloco × área),
    render × lógica. `?hud` abre o F3 no boot. **bug-524** (o `setRemesh` do loop apagava o
    campo novo) pego na verificação headless.
  - **§🧪 encanamento de verificação**: `npm run verify` e `npm run smoke` (manifesto em
    `scripts/smoke.mjs`, porta por cenário, `--lista`/`--rapido`), + smoke novo
    `_smoke-troca-raio.mjs` (6/6: anel 10 → 6 → 12 e a ordem aviso→snapshot).
  - **bug-516**: `npm run dev:server` serve o cliente COMPILADO — feature de cliente em
    `:8080` exige `npm run build` (loop rápido é `npm run dev`, vite 5173).

- **§📊 AS 7 DO PERFILADOR (2026-07-26, sessão 26) — playtest APROVADO, commitado:**
  - **`?bench` (`client/src/bench.ts` novo)** — mundo de seed fixa sem passar pelo menu,
    trajeto `pos = f(t)` (círculo a 18 b/s + giro 360° no fim), config canônica em memória,
    `hud.record()` do trajeto INTEIRO e download automático (`perf-bench-*.json`). Também
    publica em `window.__benchPerfil` (automação lê sem depender de download). O mundo do
    bench NÃO vai pro IndexedDB (encheria a lista do professor).
  - **Histograma** de frametime (≤8/≤16/≤33/≤50/≤100/>100 ms, n e %) na gravação.
  - **Carga por fase** exportada da §🕐 (`LoadingScreen.relatorio()`): uma entrada por carga,
    com `fasesMs` e `totalMs`. A fase MEDIDA é a efetiva (quando as colunas acabam e o mesher
    tem fila, quem segura é "malha").
  - **Marcadores** (`hud.marcar`): join, carga concluída, troca de aula, raio A→B, bench
    início/fim — cada um com segundo da sessão e fase; teto de 60.
  - **Regras do servidor no `debug_stats`**: células/tick, pior tick, mudanças e água por
    tick, agregadas na janela de 1 s. Campos **opcionais** no protocolo (host antigo não
    manda e o cliente não pode descartar a mensagem inteira).
  - **Tempo de GPU** (`EXT_disjoint_timer_query_webgl2`): pool de 4 consultas, leva inteira
    descartada em `GPU_DISJOINT`, amostra só com F3 aberto ou gravando, tudo em try/catch
    que DESLIGA a medição em vez de derrubar o render.
  - **`npm run bench:headless`** (`scripts/bench-headless.mjs`): roda o `?bench` num Chrome
    headless por CDP puro (sem puppeteer como dependência) e imprime o perfil. Os NÚMEROS
    dele não valem (SwiftShader) — é teste de encanamento.

- **§🏁 MAPA DE CORRIDA — `aula7-corrida.ljw` (sessão 40, 2026-08-04).** A 7ª aula, e a
  primeira que não é de construir: 4 objetivos `chegar` em modo sequencial numa pista fechada.
  - **`server/src/cenarios/autoria.ts` novo** — o `Autoria` saiu do `gerar.ts` (que roda CLI no
    import). Os 6 cenários antigos regeneram byte a byte idênticos.
  - **`server/src/cenarios/corrida.ts` novo** — pista construída com os MESMOS comandos do
    professor (`/regiao criar`+`encher`, `/bloco`, `quadro_set`), 5 placas de instrução, e o
    verificador próprio: BFS com o passo do jogador + uma aluna que CORRE e fecha os 4 postos na
    ordem + o fundo do vão inteiro tem de ter saída. **Reprovar = o arquivo não é gravado.**
  - **`um` nos 3 primeiros postos, `todos` na CHEGADA** — a equipe só vence junta.
  - Sai do MESMO `npm run cenarios` (agora 7 arquivos). `npm run shots:corrida` novo.
  - **bug-561/562/563**, todos achados pelo verificador (rota por fora, posto driblável, fundo
    do vão partido pela ponte).
- **§🍖 F6 — COMIDA (sessão 40, 2026-08-04).** O laço da fome fechou: existe o que comer, e
  por isso a fome voltou a matar (`VIDA_MINIMA_POR_FOME` 6 → **0**).
  - **`shared/src/comida.ts`** (puro): tabela `id → pontos de fome` (fruta 4, pão 5, números
    do Minecraft), `isComida`/`saciedadeDe`. O **trigo NÃO se come** — é ingrediente.
    `saciar(e, pontos)` novo no `sobrevivencia.ts`, par do `curar`; devolve o MESMO objeto de
    barriga cheia, e é assim que a session recusa a mordida sem gastar o item.
  - **Plantação: 4 blocos novos** (`Plantacao0..3`, ids 182-185, append). Só o estágio 0 é
    colocável; os outros nascem crescendo. Cruz de sprite como a flor, atravessável, balança
    no vento, e **exige SOLO** (`isSolo` = terra + as 3 gramas) pelo `apoioValido(id, abaixo)`
    — a mesma função no gate do place e na regra do tick.
  - **`crescerPlantacao` fica FORA do `rulesMap`** e a session a chama num pulso de
    `TICKS_POR_CRESCIMENTO` (200 ticks = 20 s/estágio) sobre o índice `plantacoes`, mantido no
    `applyBlockQuieto` e **reconstruído dos bytes no `restore`** (nenhum campo novo no `.ljw`).
    `LJ_CRESCIMENTO` / `crescimentoPorEstagio` é o botão (o smoke usa 5).
  - **3 itens novos** na banda ≥900: fruta 902, trigo 903, pão 904, mais `isItem()` — a banda
    virou um Set explícito, e `/dar` passou a aceitar bloco OU item.
  - **`drops.ts`:** folha → fruta 1 em 8 · capim → semente 1 em 4 (e nunca o próprio capim) ·
    plantação madura → trigo + a semente de volta (replantar não depende de sorte). `dropsDe`
    ganhou `sorteio` injetável — é a única parte não determinística da tabela.
  - **Receita do pão** (3 trigo → 1 pão), índice 11, APPEND. **`comer {slot}`** novo no
    protocolo: clique direito com comida na mão, ANTES do `if (!target)` (comer olhando pro
    céu tem de funcionar).
  - **Cliente:** 4 tiles de plantação no atlas (a altura e a cor contam a idade), ícones
    procedurais de semente/fruta/trigo/pão em `blockIcons.ts` — o do estágio 0 é um punhado de
    GRÃOS, porque o broto de 4 px sumia no slot. `npm run shots:comida` novo.
  - **bug-558** (o capim flutuava desde o §🌬️), **bug-559** (`/dar` recusava comida),
    **bug-560** (asserção do smoke × relógio acelerado).
  - VERDE: typecheck 3/3 · 565 testes (+28) · build · 12/12 smokes (`comida` é novo) · 3
    prints conferidos + o do craft, pendente da sessão 39. **Playtest PENDENTE.**
- **§🍖 F5 — CRAFT POR LISTA + BALDE-ITEM (sessão 39, 2026-08-03).** Fabricar virou estado do
  SERVIDOR; o balde fechou o pendente do F4 (era só de criativo).
  - **`shared/src/receitas.ts`** (puro): `Receita { saida, custo[] }`, `RECEITAS` **APPEND-only**
    (índice = identidade no protocolo), `podeFabricar`/`fabricar` **tudo-ou-nada numa cópia**,
    `ingredientesDe` (have/need/falta) pro "falta 3 tábua". 11 receitas: madeira
    (tronco→tábuas→laje/escada/mesa/cerca) + pedra (pedregulho→laje/escada) + **3 ferro→balde**.
  - **Protocolo:** `fabricar {receita}` client→server (reusa `inventario` na volta) e `slot?`
    novo na mensagem `balde`. Parse defensivo dos dois.
  - **Session:** `case fabricar` (só survival, índice válido, `fabricar`≠null); `case balde`
    integrou survival — confere o balde no slot ANTES de mexer na água e troca vazio↔cheio
    in-place (`definirSlot` novo em `inventario.ts`). Criativo não exige item na mão.
  - **Cliente:** painel do E com abas mochila/criar, lista tocar-pra-fabricar com "falta N" em
    vermelho e filtro que re-renderiza só as linhas; ramo do balde no `main.ts` funciona em
    survival (lê o slot do servidor). CSS `.craft-*` novo.
  - **bug-557** (smoke: `/bloco` recusa o id da água — água só entra por balde).
  - VERDE: typecheck 3/3 · 537 testes (+15) · build · 11/11 smokes (`craft` novo, 2×). **Print
    do painel PENDENTE (chrome ausente na máquina). Playtest PENDENTE.**
- **🪝 HOOKS DO OPENWOLF — OS 3 FALSO-POSITIVOS CONSERTADOS (sessão 37, 2026-08-03).**
  bug-554 (contador semântico comparava data que não existe / furava na meia-noite) · bug-555
  (buglog só via escrita de Write/Edit, cego ao Bash) · bug-556 (linha `Session end:` empilhada
  a cada `stop`). Fix em `.wolf/hooks/shared.js` e `.wolf/hooks/stop.js`, regressão nova em
  `.wolf/hooks/_test-hooks.mjs` (10/10, roda o `stop.js` real numa fixture de `/tmp`). Causa de
  o PR #64 nunca ter chegado: o pacote tem duas cópias dos hooks e a scaffolding copia a velha.
  Detalhe e a pegadinha do `pnpm update -g` na seção ✅ HOOKS abaixo e no `TODO.md §🧭`.
- **§🍖 F4 — INVENTÁRIO AUTORITATIVO (sessão 36, 2026-08-03).** A mochila virou estado do
  SERVIDOR. Criativo segue com a paleta infinita, intocado, no MESMO mundo.
  - **`shared/src/inventario.ts`** (puro, imutável): 27 slots (`HOTBAR_SLOTS` 9 +
    `MOCHILA_SLOTS` 18), `STACK_MAX` 64, `tamanhoStack(id)` (balde = 1, porta pra ferramenta),
    `adicionar` (completa parcial antes de ocupar vazio, hotbar→mochila), `remover` (tudo ou
    nada, consome a pilha MENOR primeiro pra juntar restos), `espacoPara`/`cabe`, `moverSlot`
    (mesmo id junta, diferente troca) e a forma ESPARSA `SlotSalvo` com `parseInventario`
    defensivo — **uma porta de entrada só** pro save e pro protocolo.
  - **`shared/src/drops.ts`**: `formaCanonica` (a família volta como entrada da hotbar) +
    tabela de exceções (grama→terra, pedra→pedregulho, folha/água/bedrock→nada). Devolve
    LISTA porque o F6 vai querer "folha → fruta às vezes". Teste-portão varre todos os ids.
  - **Session:** `inventarios` por NOME; débito no MESMO ponto pós-`switch` do esforço do F3
    (porta/cama = 1 item); **mochila cheia RECUSA a quebra**, conferida ANTES do `applyBlock`,
    com aviso freado em 5 s; crédito depois, e a metade apagada pela regra não dropa.
    `manter-inventario` ganhou mecânica em `matar()` e saiu do `pendente`.
  - **`/dar <eu|all|nome> <id> [qtd]` NOVO** (fora do escopo travado, ver o diário): contraparte
    do `/bloco` — sem ele o professor não prepara atividade num mundo onde ninguém tem nada.
  - **Protocolo/save:** `inventario { slots }` server→client (só em sobrevivência: a AUSÊNCIA é
    o que diz "paleta infinita") e `mover_item { de, para }` client→server;
    `SavedPlayer.inventario?` esparso, ausente = vazia (mundo criativo não engorda o `.ljw`).
  - **Cliente:** `mochila.ts` novo (espelho puro), hotbar com contagem e slot vazio de altura
    fixa, painel "mochila" com 9 colunas e gesto tocar-origem→tocar-destino, `?mochila=`.
  - **bug-549** (bloco infinito: `changedThisTick` é Set, virou contador `edicoesAplicadas`) e
    **bug-550** (grade de 9 colunas colapsada sem `width: 100%`).
  - VERDE: typecheck 3/3 · 522 testes (63 novos) · build · 10/10 smokes (`inventario` é novo) ·
    prints da hotbar e da mochila conferidos. **Playtest PENDENTE.**
- **§🍖 F3 — FOME (sessão 35, 2026-08-02).** A barra desce por ESFORÇO, não por relógio.
  - **`shared/src/sobrevivencia.ts`:** `gastarEsforco(estado, esforco)` acumula exaustão
    fracionária e converte a cada `EXAUSTAO_POR_PONTO` (4,0, número do Minecraft);
    `tickFome(estado)` cobra o dano da barra zerada. Régua: **0,01 por bloco andado · 0,02 por
    bloco editado · 3,0 por ponto regenerado** (construir cansa o DOBRO de andar, porque a
    atividade da aula é construir).
  - **`VIDA_MINIMA_POR_FOME = 6` — a fome enfraquece, não mata.** Sem regeneração abaixo de 18
    de fome e meio coração a cada 4 s no zero, mas o dano PARA em 3 corações enquanto não houver
    comida (F6). Baixar pra 0 devolve a inanição letal em uma linha.
  - **Session:** passo tirado do fluxo de `move` (o mesmo do F2, com teto de 4 blocos por
    amostra pra teleporte não virar caminhada) e edição cobrada **num ponto só, depois do
    `switch` do `handleMessage`** — porta/cama custam UMA edição, `use_block` e `/bloco` não
    custam. Curar cobra `EXAUSTAO_POR_REGEN` no tick.
  - **A regra `fome` virou gate real:** desligada, o campo `fome` não vai na mensagem e o HUD
    não desenha coxa nenhuma; quem já estava faminto volta a se regenerar. `RegraDef.pendente`
    novo faz o `/regra` avisar só o que ainda não tem mecânica (`manter-inventario`, `pvp`).
  - **Protocolo/save:** `fome?` OPCIONAL na mensagem `vida` que já existia e `SavedPlayer.fome?`
    no molde da vida — mas **fome ZERO é válida no save** (barra vazia é estado de jogo; vida
    zero seria um morto).
  - **Cliente:** coxas ao lado dos corações num flex `wrap` (tela estreita quebra a linha sem
    media query), meia coxa pelo mesmo `clip-path` — com a carne à ESQUERDA, senão a metade
    mostraria só osso. `?vida=13,45,7` e `vida/fome` na linha do F3.
  - VERDE: typecheck 3/3 · 459 testes (14 novos) · build · 9/9 smokes (`fome` é novo) · print
    do HUD conferido. **Playtest PENDENTE.**
- **§🍖 F2 — VIDA, DANO, MORTE, RESPAWN (sessão 34, 2026-08-02).** A primeira MECÂNICA da
  sobrevivência. Só vale em modo sobrevivência: criativo é imune no MESMO mundo.
  - **`shared/src/sobrevivencia.ts`** (puro): `aplicarDano(estado, n, causa)` é a **ÚNICA porta
    de perda de vida** — queda e afogamento hoje, fome (F3), PvP (F7) e mob (F8) entram por ela.
    Mais `curar`, `danoDeQueda`, `tickFolego`, `tickRegen`, `textoDaMorte`, `parseCausaDano`.
    Números do Minecraft: 20 pontos, 3 blocos de queda de graça, 15 s de ar, 1 coração/s
    afogando, 1 ponto de regeneração a cada 4 s (com fome alta — a fome é do F3, e até lá a
    session passa `FOME_MAX`).
  - **`apoiadoNoChao(world, pos)` novo em `physics.ts`** — o servidor fecha a queda pelo fluxo
    de `move` (10 Hz) reusando a lógica de laje/escada do `collides`. **O cliente NÃO reporta
    dano.** A tolerância (~4 blocos por amostra, errando PRA MENOS) está comentada no código.
  - **Session:** `vitais` por NOME (como o modo — sobrevive ao rejoin), `picoQueda` por cliente
    (rascunho, morre no disconnect), `machucar`/`matar`/`acompanharQueda`/`tickVitais`. Morte =
    aviso no chat pra TURMA + respawn no spawn autoritativo, cheio. Teleporte e troca de modo
    zeram o pico. Água amortece a queda.
  - **Protocolo:** `vida { vida, causa?, morreu?, folego? }` — só a vida é obrigatória; causa
    desconhecida NÃO derruba a mensagem. Vai no join (em sobrevivência) e quando muda o que o
    HUD desenha (coração ou bolha), nunca 10×/s.
  - **Save:** `SavedPlayer.vida?` — só o MACHUCADO viaja; valor doente (0, negativo, gigante,
    texto) degrada pra vida cheia.
  - **Cliente:** `client/src/vitals.ts` novo (corações com meio coração por `clip-path`, bolhas,
    vinheta de dano, aviso de morte; SVG embutido, criado sob demanda), eventos `dano`/`morte`
    em `events.ts` (som pluga depois) e `?vida=N[,folego]` pra inspeção visual.
  - VERDE: typecheck 3/3 · 445 testes (20 novos) · build · 8/8 smokes (`vida` é novo) · print
    do HUD conferido no headless. **Playtest PENDENTE.**
- **§🍖 F1 — `/modo` E `/regra`, O INTERRUPTOR (sessão 34, 2026-08-02).** Primeira frente da
  SOBREVIVÊNCIA. Nada de mecânica: o que muda é o rótulo e o voo.
  - **`shared/src/modo.ts`** (puro): `Modo = criativo|sobrevivencia`, `MODO_PADRAO`,
    `parseModo` (tolera acento e caixa), `modoEfetivo(mundo, pessoal)`, `podeVoarNoModo`.
    **Sobrevivência não voa — nem professor**, de propósito.
  - **`shared/src/regras.ts`** (puro): registro `manter-inventario` (LIGADA) · `pvp` · `fome`,
    com `valorRegra`/`parseRegras`/`regrasParaSave`. Comando genérico `/regra [nome [ligar|
    desligar]]`. **Sem mecânica ainda** — a resposta do comando avisa isso ao professor.
  - **Session:** `modoMundo` + `modosPorJogador` (por NOME) + `regras`; `/modo` com as 5
    formas fixadas com o usuário (consulta · mundo · `eu` · `nome`/`@nome` · `all`), consulta
    liberada pra turma e mudança professor-only pelo `parts.length` (molde do `/hora`).
  - **Protocolo:** `modo {efetivo}` novo, resolvido no servidor e mandado em TODO join —
    inclusive criativo, porque troca de aula é sessão NOVA (família do bug-518).
  - **Save:** `modo?`, `modosPorJogador?`, `regras?` (MAPA) — opcionais e gravando só o DIFF
    do padrão; parse defensivo pula nome/valor inválido. Mundo-aula força criativo.
  - **Cliente:** `podeVoar()` passa por `podeVoarNoModo`, F3 mostra `modo`/`voo`, autocomplete
    conhece `/modo` e `/regra` (e o `/vento`, que faltava desde a sessão 28).
  - **bug-547:** `LJ_NOVO=1` não recria mundo existente → smoke com estado persistente virava
    sorteio. `limpar: [pastas]` novo no manifesto do `scripts/smoke.mjs`.
  - VERDE: typecheck 3/3 · 425 testes (33 novos) · build · 7/7 smokes · bench headless ok.
- **§🏔️ RELEVO POR BIOMA — a v2 DA GERAÇÃO FECHADA (sessão 33, 2026-07-30).**
  - **`Bioma` ganhou relevo e neve:** `relevo` (teto de amplitude da serra, [0,1]) e `neve`
    (flag). `relevoPorClima(clima)` mistura os tetos pela pertinência de cada bioma e
    multiplica pelo fator de NÚCLEO — que zera na divisa, e é isso que mantém a montanha
    dentro de um bioma só em vez de montada na fronteira.
  - **`heightAt` multiplica a amplitude da serra por esse fator** (5º parâmetro `clima` opcional,
    só pra quem já calculou não pagar 2 ruídos de novo). Colinas seguem GLOBAIS de propósito:
    é o que dá continuidade onde o relevo é zerado. Mundo baixo (aula, sizeY 64) sai antes da
    serra e **não mudou um byte** — tem teste.
  - **Neve virou `Bioma.neve`** no lugar de `temp < 0.6`: `topoPrevisto` continua a fonte única
    do bloco de topo, e o HUD F3 mostra o relevo da coluna (`relevo 0.42 (teto do bioma 1)`).
  - **O portão de fronteira (bug-544):** a 1ª ligação passou typecheck e testes e abriu penhasco
    de **14–23 blocos**. Sweep medido escolheu `RAMPA 0,25` + `NÚCLEO (0,4→1,0)` → **degrau máx
    4–6, paridade exata com o heightmap global, zero pares acima de 6.** Tetos medidos:
    araucárias 106 · mata 68 · cerrado 53 · caatinga 36 (era 106 — a duna do playtest).
  - **Custo negativo:** geração 4,53 → 4,00 ms/coluna, triângulos da cena do `?bench`
    700 230 → **647 858 (−7,5%)**, chunks com malha 586 → 549. Terreno mais baixo alivia a GPU.
  - **`shared/vitest.config.ts` novo (bug-545):** `maxWorkers: 8` + `testTimeout: 20000` porque
    o default (1 fork por núcleo × mundos de 128³) fazia a suíte falhar por contenção, não por
    código. **392/392 e 92 s → 37 s.**
  - VERDE: typecheck 3/3 · 392 testes (4 novos) · build · 6/6 smokes · 5/5 luz.
    **Playtest PENDENTE.**
- **§💡 LUZ VOXEL + §🏔️ CAVERNAS (sessão 32, 2026-07-28)** — commits `1be4ab0` e `f1dd05f`.
  A fase da fila era a v2 da geração; o portão de produto aberto era a luz, e o usuário
  escolheu **luz COMPLETA antes de escavar** (mais: **caverna seca sob o mar**, com casca).
  - **Luz mora 100% no CLIENTE** — é função pura dos bytes do mundo e o cliente já os tem, então
    não há mensagem nova nem custo de tick, e dois clientes convergem sozinhos. `shared/src/
    luz.ts`: 1 byte/célula com céu e tocha em dois nibbles, BFS com a regra da **descida reta**
    (céu no máximo descendo não perde nível — é o que faz existir sombra sob teto),
    `atualizarBloco` incremental devolvendo o conjunto de chunks sujos.
  - **Mesher** ganhou o atributo `luz` por vértice (a face mostra a luz da célula que ela
    ENCARA); **shader** enxertado ENCADEANDO o `onBeforeCompile` do §🌬️ — o canal do céu escala
    com a hora, o da tocha não. Anoitecer não custa remesh: é uniform.
  - **Cavernas** por interseção de dois ruídos 3D, função pura de `(x,y,z,h,seed)` (mundo E é
    lazy: coluna vizinha só fecha a galeria respondendo igual sem consultar o mundo). Escava
    depois do minério (veia cortada na parede) e `findSpawnSeco` ganhou veto de boca de caverna.
  - **Três medições mudaram decisão:** acender coluna 18,4 → **2,48 ms** (a BFS enfileirava as
    ~32 mil células de céu; só a banda rente ao relevo tem trabalho) · worldgen 2,63 → 28,6 →
    **3,49 ms/coluna** (ruído célula a célula derrubou o smoke `pedir-coluna`; amortizado por
    fatia, mundo byte a byte idêntico) · densidade de caverna **varia 2,9%–7,3% por seed**, e a
    do `?bench` é das mais vazias — calibrar por ela teria dado o dobro.
  - **Verificação nova `npm run shots:luz`**: compara a mesma cena do `?bench` ao meio-dia e à
    meia-noite. Pega os dois modos de a luz falhar calada (shader que não compila; shader que
    compila sem fazer nada). 5/5, noite/dia = 0,48.
  - **Custo:** +66% de triângulos (153 852 → 255 234), +28% de draw calls. **Não medido no lab.**
  - VERDE: typecheck 3/3 · 388 testes (30 novos) · build · 6/6 smokes. **Playtest PENDENTE.**

---

## ✅ §🍖 F10 — FEITO INTEIRO (sessão 46, 2026-08-05)

A sessão 45 anotou o F10 e o usuário respondeu as cinco perguntas em aberto; a 46 executou as
seis frentes, uma por commit. **Com ela, o roadmap de sobrevivência tem F1..F7, F9 e F10 —
só o §🍖 F8 (mobs) segue fora.** Detalhe de cada frente no bloco da sessão 46, no topo.

| frente | o que entrou | commit |
|---|---|---|
| **F10a** | itens carvão/diamante/graveto; minério larga item; tocha = graveto + carvão | `903e72d` |
| **F10b** | FORNALHA: `containers.ts` + `fornalha.ts`, mapa por posição no save, tick, protocolo, painel | `931d974` |
| **F10e** | BAÚ (27 slots, 8 tábuas), reusando o encanamento inteiro | `32927e1` |
| **F10f** | claim/confinamento na INTERAÇÃO + o portão que lê o `protocol.ts` | `08ffd52` |
| **F10c** | ALGODÃO (cultivado + selvagem), plantação virou tabela, lã ← 3 algodão | `0e3a94a` |
| **F10d** | 4 PICARETAS, sem durabilidade, obrigatórias; gate no `break_block` | `a953c32` |

**As decisões do usuário, aplicadas (não perguntar de novo):** fornalha SUBSTITUI a receita de
vidro · graveto é ITEM e a tocha é 1 graveto + 1 carvão (mineral ou vegetal) · sem picareta o
bloco **não quebra** e mostra aviso · baú com item **não quebra** · confinamento barra
interação. **Uma decisão minha, declarada:** machado e pá ficaram fora (travariam a aula e não
fariam nada sem tempo de quebra) — razão escrita em `ferramentas.ts`.

## 📁 Arquitetura ativa

- **Padrão central:** UM módulo de lógica de jogo (servidor autoritativo) que roda em 3
  hospedeiros SEM reescrita: (a) Web Worker no singleplayer, (b) .exe portátil (Tauri/Node
  SEA) que serve HTTP+WebSocket, (c) servidor Node dedicado. Cliente só renderiza + envia input.
- **Transporte:** WebSocket (mensagens iguais em todos os hospedeiros).
- **Save:** mundo salvo no PC do host (professor). Persiste entre aulas.
- **Restrição dura do navegador:** aba NÃO abre socket de escuta e NÃO executa binário.
  Por isso "abrir pra LAN" é papel do HOST (professor roda .exe/servidor), não do aluno.
  WebAssembly NÃO contorna isso (roda dentro do sandbox). Confirmado nesta entrevista.
- **§🍖 F10: BLOCO COM INVENTÁRIO (`shared/src/containers.ts`).** Conteúdo por POSIÇÃO num mapa
  da `GameSession` + no meta do save — o desenho do QUADRO, que foi o primeiro estado a não
  caber no byte do chunk. Serve fornalha e baú, e serve o próximo. Transferência num array
  CONCATENADO mochila+container (reusa `moverEmArray` do `inventario.ts`), índice UNIFICADO no
  fio (`0..26` mochila, `27+i` container), e o `use_block` é quem ABRE — a resposta do servidor
  é que abre o painel, porque quem decide se o aluno pode LER aquele baú é o gate de claim.
- **§🍖 F10: os módulos PUROS novos** — `fornalha.ts` (cozimento em TICKS, nunca relógio de
  parede) e `ferramentas.ts` (tipo × família × nível). Mesma disciplina de `inventario.ts`,
  `drops.ts`, `receitas.ts` e `sobrevivencia.ts`: sem I/O, sem rede, testáveis sozinhos.

---

## 🌐 Rede: WSL invisível na LAN (em curso 2026-07-27)

O host roda no WSL2 → IP próprio (`172.28.17.24`) atrás de NAT. Windows entra por
`localhost` (encaminhamento só vale pra conexão originada no Windows), **outro PC da rede
não** — bate em `192.168.3.100:8080` e não há ninguém escutando.

**Aplicado:** `C:\Users\Meketreve\.wslconfig` criado com `networkingMode=mirrored` +
`hostAddressLoopback=true` (WSL 2.6.3, Windows 11 24H2 — suporta). Falta o usuário rodar
`wsl --shutdown` e, em PowerShell ADMIN, as duas regras de firewall: `New-NetFirewallRule`
(porta 8080, perfis Private/Domain — trocar por `Any` se a escola for rede Pública) e
`New-NetFirewallHyperVRule` (VMCreatorId `{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}`) — no modo
espelhado o tráfego passa pelos DOIS firewalls.

**✅ PEGOU (conferido em 2026-07-27, sessão 29):** `hostname -I` dentro do WSL devolve
`192.168.3.100` — modo espelhado ativo, o `wsl --shutdown` já aconteceu. O que NÃO foi
verificado é o par de regras de firewall (nenhum outro PC da rede foi testado contra a
porta 8080); se o outro PC não abrir, é ali que falta.
**Desfazer:** apagar o `.wslconfig` + `wsl --shutdown`.
**Plano B** (sem mexer em config, mas o IP do WSL muda a cada boot): `netsh interface
portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080
connectaddress=<IP do WSL>`.
**Saída definitiva:** host nativo no Windows (o .exe portátil do professor já está no plano) —
sem camada de WSL no meio.

## ⚠️ Pendências externas (não bloqueia coding)

- Testar cedo num PC REAL do lab (usuário tem admin em todas as máquinas/escolas).
- Distribuição inicial: pasta compartilhada do Drive.
- Certificado de assinatura de código (custo anual) — futuro, pra adoção fora da escola-piloto.

---

## 🔧 Comandos úteis

```bash
npm run dev         # Vite dev server do cliente (http://localhost:5173)
npm run dev:server  # servidor Node+ws em watch (placeholder até checkpoint 5)
npm test            # testes do /shared (vitest)
npm run typecheck   # tsc --noEmit nos 3 workspaces
npm run build       # build de produção do cliente
npm run verify      # typecheck + testes + build (o portão antes de commitar)
npm run smoke       # cenários de rede reais (--lista diz o que cada um prova)
npm run bench:headless   # roda o ?bench num Chrome headless e imprime o perfil
npm run shots:tablet     # mede+fotografa a UI em 1024×600 com pointer:coarse
npm run shots:luz        # §💡 compara o MESMO bench ao meio-dia e à meia-noite
```

**Verificação da luz** (precisa do `npm run dev` rodando em outro terminal): mede a
luminância de uma janela de terreno nas duas horas e falha se o meio-dia estiver escuro, se a
meia-noite estiver em preto absoluto, se a razão noite/dia não cair, ou se o console cuspir
erro de shader. Prints em `.wolf/designqc-captures/luz/`. ⚠️ **Nunca medir cor lendo o canvas
pela página** — `drawImage` de canvas WebGL fora do frame devolve preto e o A/B "passa" com
0/0 (bug-540); o script decodifica o PNG do CDP justamente por isso.

**Verificação de layout mobile** (precisa do `npm run dev` rodando em outro terminal):

```bash
npm run shots:tablet                       # 1024×600, Kindle Fire — a RÉGUA
npm run shots:tablet 1280 800              # tablet Android comum
COARSE=0 npm run shots:tablet 1920 1080    # regressão do desktop
```

Cada linha do relatório é uma medição, não uma impressão: "cabe / ESTOURA" compara
`getBoundingClientRect` com a altura da janela, "menor alvo" tem piso de 40px, e
"chat × hotbar" mede a intersecção dos dois retângulos. Prints em
`.wolf/designqc-captures/tablet-<L>x<A>/` (ignorada pelo git). Numa rodada `COARSE=0` as
linhas ✗ de joystick e alvo de dedo são ESPERADAS — só valem em aparelho de toque.

**Modo benchmark (o que mandar pro PC do lab):**

```
http://<host>:8080/?bench            # 30 s, mundo E (streaming), seed 20260726
http://<host>:8080/?bench=60         # trajeto mais longo
http://<host>:8080/?bench&tamanho=P  # mundo denso: mede só render
http://<host>:8080/?bench&semvida    # lado B do A/B do §🌬️ (nuvens+balanço OFF)
```

**A/B do §🌬️ (custo da vida ambiental), 2 URLs seguidas na MESMA máquina:**
`?bench` depois `?bench&semvida`. O perfil se etiqueta sozinho (`meta.bench.semVida`,
`config.nuvens/balanco`) e o arquivo nasce `perf-bench-semvida-*.json` no lado B, então o par
não se confunde na pasta. Comparar com a régua do lab (`…-l9xf.json`).

---

## 📚 Referências (leia SE precisar)

- `projeto.txt` — proposta pedagógica completa (BNCC, fundamentação, indicadores seção 14).
- `.wolf/cerebrum.md` — Decision Log com o PORQUÊ de cada escolha.
- `.wolf/anatomy.md` — índice de arquivos.
