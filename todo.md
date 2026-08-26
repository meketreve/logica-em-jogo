# Ideias para fazer

## Móveis / blocos

* \[x] tapete — **FEITO** (2026-07-19): 12 cores (ids 71-82), lâmina 1/16 atravessável, regra de apoio da tocha.
* \[x] parte da janela que abre e fecha — **FEITO** (2026-07-19): ids 83-86, 1 célula, clique direito abre/fecha (dobradiça da porta). Pivô escolhido pelo vizinho em 2026-07-20 (ids R 112-115).
* \[x] cama — **FEITO** (2026-07-19 móvel direcional; 2026-07-20 virou PAR de 2 células estilo Minecraft, orientada pelo yaw, ids 96-99, metade órfã evapora).
* \[x] sofá — **FEITO** (2026-07-19): móvel direcional em 4 direções (rotXZ k×90°, frente encara o jogador ao colocar), faixa de ids 87-99.
* \[x] cadeira — **FEITO** (2026-07-19): móvel direcional, entrada única na hotbar.
* \[x] mesa — **FEITO** (2026-07-19): móvel, faixa 87-99.
* \[x] quadro (com interface para digitar textos e adicionar imagens) — **FEITO** (2026-07-19): ids 100-103; `shared/quadros.ts` + `client/quadros.ts`, editor overlay, imagem JPEG 192px comprimida local (teto 32k chars), persiste no meta.
* \[x] flores — **FEITO** (2026-07-19 ids 104-107, 4 cores atravessáveis com regra de apoio da tocha; 2026-07-20 sessão 8 refez render com `emitCrossPlane` = 2 lâminas planas na diagonal, estilo Minecraft cross, fim do z-fight/sprite esticado).
* \[x] bloco de água — **FEITO** (2026-07-21): id 129, atravessável (não-sólido), translúcida via furos em xadrez + alphaTest (sem blending). Nado em physics.ts: torso submerso → velocidade × `waterFactor` (0.5), empuxo (gravidade reduzida, afunda devagar), pular sobe / agachar desce (`swimSpeed`). SEM fluxo/espalhamento — fluido dinâmico é fase própria.
* \[x] vidro colorido — **FEITO** (2026-07-25): 12 cores (ids 137-148, paleta das lãs).
  Cubo cheio TRANSPARENTE via cutout tingido (dither ~40% no atlas, `paintVidroCor`) —
  sem material novo, mesmo alphaTest do vidro comum. Funde com vidro do MESMO id no mesher.
* \[x] **meio-blocos (slabs)** — **FEITO** (2026-07-25): ids 149-154 (pedra/tábua/tijolo ×
  baixo/cima). NÃO-cubo com forma no mesher = a própria `collisionBoxes` (meia altura). Física
  ganhou COLISÃO PARCIAL (`collides` testa sub-caixas) + resolução Y precisa (`resolveVertical`:
  pousa no topo real 0.5, não no topo da célula) + **STEP-UP AUTOMÁTICO** (`moveHoriz`: sobe ≤0.55
  andando, sem pular; cubo cheio NÃO sobe). 1 entrada por material na hotbar; metade escolhida pela
  face clicada (mira por baixo = laje de cima). Tile reusa o do material. +9 testes. Refino original:
  * IDs: uma família por material vira caro (pedra/madeira/… × 2 metades). Melhor
    começar com poucos materiais (pedra, tábua, uma cor de lã) e um bit de "metade"
    no par de ids (Baixo/Cima), estilo porta (2 ids por variante). Append depois de 129.
  * Mesher (`shared/mesher.ts`, PURO): já tem `emitBox` com UV proporcional — o slab é
    uma caixa de 0..0.5 (ou 0.5..1) em Y. Cai fora de `isFullCube` (não funde faces com
    vizinho cheio → a face do meio aparece). Fica em `isTransparentBlock`? Não — é opaco,
    mas NÃO é cubo cheio, então precisa emitir todas as faces expostas (como cerca/tocha).
  * **FÍSICA é o trabalho pesado:** `physics.ts collides()` trata todo `isSolidBlock` como
    cubo 1×1×1. Slab exige colisão de ALTURA PARCIAL (subir meio bloco sem pular, cabeça
    passa por baixo do slab de cima). Hoje o AABB não sabe de sub-blocos → precisa de uma
    `alturaColisao(id)` (ou caixa de colisão por bloco, reusando a ideia do
    `blockSelectionBox` do mesher) e `collides`/`moveAxis` passam a ler essa caixa. Decisão
    a travar: step-up automático (subir slab andando) ou só pulo?
  * 2 slabs no mesmo lugar = bloco cheio (Minecraft) — opcional, decisão de escopo.
* \[x] **BUG slab: topo do bloco não renderiza a face de baixo** (2026-08-07, playtest na
  escola) — **FEITO no MESMO dia, era o bug-602** (sessão 58); só a marcação ficou pra trás,
  conferida em 2026-08-11. O item e o bug-602 descrevem o mesmo defeito por dois lados: o
  `emitBox` cullava a face rente sempre que o vizinho tinha o MESMO id, e duas lajes de baixo
  empilhadas NÃO se encostam (vão de 0,5 entre elas) → a de cima ficava sem a face de baixo e
  se via o buraco. **Conserto:** parâmetro `fundeVertical` no `emitBox` (`mesher.ts:904`);
  laje/escada passam `false`, então a fusão por mesmo id vale só nas laterais X/Z
  (`mesher.ts:918`). **Teste-portão:** `cp23.test.ts:141` "lajes empilhadas do MESMO id não
  fundem a face vertical (bug-602)" — exige 4 cantos de normal −Y na laje de cima.
  **Sonda de 2026-08-11 (`meshChunk` puro, sem navegador):** `LajePedraCima` solta, sobre
  `Stone` e empilhada emitem a face −Y em `y+0.5` nos três casos. A metade de CIMA tem
  `y0 = 0.5`, logo a face de baixo **nunca é `flush`** e nunca passou pelo culling — quem
  aparecia com buraco era a pilha de metades de BAIXO, exatamente o que o bug-602 consertou.
* \[x] **escadas (stairs)** — **FEITO** (2026-07-25): ids 155-178 (pedra/tábua/tijolo × 4
  direções × base/cabeça-pra-baixo). Forma em L = 2 caixas em `collisionBoxes` (base meia-altura
  pegada cheia + degrau meia-pegada), reusadas pelo mesher E pela física. Sobe andando via o mesmo
  step-up da laje (a base é meia-altura). Direção SOBE pra onde o jogador olha; metade pela face
  clicada. 1 entrada por material; `escadaId(mat,dir,cima)` monta o id. Mira = envelope de cubo.
  Refino original:
  * Extensão natural do slab, MAIS complexo: orientação direcional (rotXZ k×90°, como os
    móveis 87-99) + variante superior/inferior. IDs: 4 direções × 2 = 8 por material →
    caro; escopo mínimo = 1 material (pedra) primeiro.
  * Mesher: 2 caixas (`emitBox` base 0..0.5 + degrau 0.5..1 em metade da célula) — o
    culling de face rente já existe. Forma pura, sem material novo (1 draw call).
  * Física: mesma dor do slab, PIOR — a caixa de colisão é um L (não uma altura única).
    Ou aproxima por step-up de meio bloco (colide como slab, sobe andando) — mais simples
    e "bom o bastante" pra um jogo pedagógico. Travar isso antes de codar.
  * Depende de `alturaColisao`/caixa-por-bloco do slab → fazer slab PRIMEIRO.
* \[x] **hitbox REAL dos não-cubos na mira/colocação (raycast por FORMA, não cubo cheio)** —
  **FEITO** (2026-07-22): `raycastBlock` (raycast.ts) agora, ao entrar numa célula com NÃO-cubo
  (`!isFullCube`), faz ray-vs-AABB (slab test, `subBoxNormal`) contra `blockSelectionBox(id)` —
  a MESMA caixa do contorno da mira. Acertou → hit com a normal da face do sub-box (pro
  `hit+normal` da colocação); errou → segue marchando (o raio passa reto pelo VÃO — buraco da
  cerca, porta aberta). Cubo cheio mantém o fast path (normal do DDA); água pulada de vez.
  `raycast.ts` importa `blockSelectionBox` do mesher (sem ciclo: mesher não importa raycast).
  292 testes (+2: mira no centro da cerca acerta o poste; mira pelo vão passa e acerta o sólido
  atrás), typecheck 0, build ok. Playtest no browser PENDENTE. Refino original abaixo:
  o DDA tratava TODA célula como cubo 1×1×1 → a mira "grudava" na porta/cerca/tocha/flor/tapete
  mesmo olhando pelo vão. O contorno JÁ seguia a forma (sessão 8), só o RAIO enxergava cubo cheio.
  * Consequência natural: pra USAR (porta/janela clique direito) e COPIAR (botão do meio) agora
    é preciso mirar na FORMA real (ex.: painel fino da porta fechada), não em qualquer ponto da
    célula — é o comportamento pedido ("hitbox = textura"), estilo Minecraft.
  * Casa com slab/escada (backlog): a MESMA caixa-por-bloco serve pra mira E pra colisão
    (physics.ts ainda trata tudo como cubo cheio) — unificar `blockSelectionBox`/`alturaColisao`
    numa fonte só de AABB-por-id quando fizer slab.
  * Nota: `blockSelectionBox(Cerca)` cobre só o POSTE (não as travessas de conexão) — a mira
    ignora os trilhos, como o contorno já fazia. Refinar a caixa da cerca é opcional.

## Comandos / jogador

* \[x] **`/invisivel` — professor some para os alunos; só outro professor o vê** — **FEITO**
  (2026-08-22, v0.11.0). A filtragem é do SERVIDOR, por cliente: `broadcastPose` no `session.ts`
  é o funil de TODA pose, e o laço de presença do `admitir` é a 2ª porta. Esconde **só o corpo**
  (chat, blocos e som seguem) + faixa 👻 permanente na tela do professor. **Vira fantasma:** 3
  portões (`move`, `tickVitais`, `overlapsAnyPlayer`) + `noclip` no `physics.ts` (só no ramo
  `fly`). Estado de SESSÃO — rejoin volta visível. Ver `shared/src/session/invisivel.ts` e
  `shared/src/invisivel.test.ts` (13 testes).
* \[x] comando para kicar aluno por mau comportamento — **JÁ EXISTE** (`/kicar`, cp22)
* \[x] arrumar sistema de dia e noite — **FEITO** (2026-07-19): sol/lua/estrelas visíveis (grupo segue câmera), keyframes com smoothstep, dia 10→20min (`DIA_SEGUNDOS=1200`), `/hora` liberado pro aluno. Corrigiu bug-301 (TDZ) e bug-302 (céu travado na meia-noite).
* \[x] voo do modo criativo do Minecraft — **FEITO** (2026-07-17: `/voo` do professor libera pra turma; duplo-toque no espaço)
* \[x] alterar a geração de terreno dos mundos para adicionar bedrock na camada 0 — **FEITO** (2026-07-17)
* \[x] auto completar nomes dos jogadores — **FEITO** (2026-07-19): Tab completa nomes via `learnPlayers` (commands.ts, alimentado por player_moved/left) em /tp /tpr /tpa /kicar /resetpin /amigos /claim.
* \[x] corrigir o nome do jogador para não aceitar nomes com espaços — **FEITO** (2026-07-19): `sanitizeName` (shared/auth.ts) filtra pra letra/número/acento/_/- e corta em 24; servidor sanitiza no join, menu migra nome antigo, input com pattern.
* \[x] corrigir a animação da porta — girava no próprio eixo — **FEITO** (2026-07-19: painel na aresta do canto = dobradiça, abre pivotando 90° na ponta)
* \[x] interceptar atalhos do navegador quando o mouse estiver capturado (pra evitar de fechar a aba se apertar Ctrl+W ao correr) — **FEITO** (2026-07-19): `client/shortcutGuard.ts`, guarda de 3 camadas — beforeunload + preventDefault nos combos + Keyboard Lock API (Chrome, só em tela cheia F11). Janela comum só mostra diálogo (limite do navegador → tela cheia = proteção total).
* \[x] porta: escolher o lado do PIVÔ (dobradiça) pelo lado que TEM bloco; 2 portas lado a lado =
pivôs OPOSTOS (abrem pro meio, double door) — **FEITO** (2026-07-20): 4 ids R (108-111,
dobradiça alta) espelham as base; o SERVIDOR escolhe a dobradiça no place\_block pelos
vizinhos (porta do mesmo eixo → oposta; senão parede/cubo cheio → lado da parede; empate →
base). Só o mesher muda a folha ABERTA de lado; física/cliente não mudam (tudo em /shared).
* \[x] janela: escolher o lado do PIVÔ igual à porta — **FEITO** (2026-07-20): 4 ids R
(112-115); reusa o MESMO `escolherDobradica` do servidor (agora genérico, parametrizado
por altura=1 e pelos helpers da janela). Mesma regra: janela vizinha do mesmo eixo → oposta;
senão lado com parede; empate → base. Cliente inalterado.
* \[x] **mais tempo pra usar o /tpa (pedido do usuário, 2026-08-14: "os 30 segundos é pouco")** —
  o pedido de `/tpr` expira em 30 s (`TP_PEDIDO_MS` em `shared/src/session/tp.ts:10`, citado em
  3 frases: o aviso pro alvo, a resposta do solicitante e o erro de "expirado"). Decidido
  (2026-08-14): **60 s** — uma constante e as 3 mensagens; o teste `tp.test.ts` tem de conferir
  o prazo novo (não só o fato de o pedido expirar). — **FEITO** (2026-08-14): `TP_PEDIDO_MS` virou
  `export const` 60_000 e as 4 frases interpolam `${TP_PEDIDO_MS / 1000}`; `tp.test.ts` ganhou a
  conferência do "60 segundos" + o teste de fronteira (`TP_PEDIDO_MS - 1_000` ainda vale).
* \[ ] **SILENCIAR o chat: só os COMANDOS (pedido do usuário, 2026-08-15: "desativar as
  mensagens e deixar apenas os comandos")** — não existe hoje. O material já está pronto: a
  mensagem de JOGADOR chega como broadcast com `author` de verdade (`nome#id`,
  `session.ts:1403` → `main.ts:888`), e a resposta de COMANDO chega SÓ pro autor com
  `author: "servidor"` (`sendServerChat`, `session.ts:1831-1836`). Refino:
  * Filtro do LAZER (só esconde na tela) é pureza de cliente: botão 🚫 ou tecla no chat
    esconde o `addMessage` quando `author !== "servidor"` — nada no servidor, nada no
    protocolo. O broadcast continua acontecendo (outros leem), o autor some da tela.
  * Ou comando `/silenciar [nome]` (nos dois extremos: o professor cansa do papo da turma,
    ou o aluno quieto quer foco) — vira estado PESSOAL do jogador, no molde do
    `settings.chatSilenciado` (persistido no localStorage) e não afeta ninguém.
  * Quem manda: o servidor NÃO precisa saber — é só a regra de CLIENTE no handler da msg
    `chat` (main.ts:888). Teste de UI (shots:chat) fecha a porta.

## Mundo / professor

* \[x] rocha-matriz só para professor (inventário/copiar/colocar) — **FEITO** (2026-07-17)
* \[x] mundos com nome "aula" não salvam alterações, reutilizáveis sem mover arquivos — **FEITO** (2026-07-17)
* \[x] professor cria área com /claim (mesmo acesso do aluno) — **FEITO** (2026-07-21): removido o bloqueio do professor no `/claim criar`; ele reserva "terreno"/plot como o aluno. Claim SEGUE sendo COLUNA cheia (camada 0 → teto — decisão do usuário 2026-07-21, mantida); limite horizontal 64 (X) × 32 (Z) pra TODOS (era 32×32).
* \[x] **aba de JOGADORES no painel da tecla P (professor)** — **FEITO** (2026-07-21): `client/players.ts` (PlayersPanel, estrutura do inventário: altura fixa, abas, scroll só na lista). Abas "conectados" (botões expulsar/banir, 2 cliques) e "banidos" (desbanir). Aberto por um botão "👥 jogadores" no topo do painel de autoria. Ban por NICK: estado + gate de join na GameSession (`banir`/`desbanir`/`estaBanido`, persiste no meta `banidos[]`); `/banir`·`/desbanir` no HOST (fecham socket como o /kicar); msg `players` (conectados+banidos) → só professores, no join/saída/ban.

* \[x] **AJUSTAR AO VIVO O NÚMERO DE CÓPIAS DA ÁREA DA ATIVIDADE, CONFORME O NÚMERO DE GRUPOS**
  — **FEITO** (2026-08-17). Ideia do usuário em 2026-08-12; entregue como `/aula grupos X
  [confirmar]` (`shared/src/session/aula.ts`) mais a aba **grupos** no painel P. Spec e plano em
  `docs/superpowers/specs/2026-08-17-copias-ao-vivo-design.md` e
  `docs/superpowers/plans/2026-08-17-copias-ao-vivo.md`.
  **Como ficou:**
  * **Grade de 6 colunas** (`shared/src/grade.ts`, módulo PURO) é a fonte única de "onde fica o
    grupo g", usada pelo gerador **e** pelo comando. Ordem de LEITURA. 8 grupos = 6×2,
    20 = 6×4; o teto futuro de 35 = 6×6 = 96×96 blocos.
  * **Mundo nasce no tamanho do TETO** (`dimsDaAula()` = 6×10×4 chunks), não do `--grupos`:
    o professor nunca esbarra no `inBounds` durante a aula. ⚠️ Custou tamanho: o `.ljw` foi de
    ~593 kB para ~987 kB (+66%) — o save destes mundos **não** é esparso.
  * **Célula-molde** com o estado de PARTIDA + os `extras`, no chunk atrás do professor, região
    `partida`. ⚠️ **O `baseline` do objetivo NÃO servia como fonte:** ele cobre só a caixa da
    ÁREA, e os extras ficam fora dela (a parede de manual da aula 6 mora em x+3/x+4 de uma área
    com dx=3). A unidade de cópia é o CHUNK inteiro.
  * **Conteúdo de quadro viaja junto** (`GameSession.moverQuadros`/`apagarQuadros`): ele mora
    fora do id de bloco, então sem isso o grupo novo receberia a parede de manual EM BRANCO.
  * **Incremental:** grupos `1..min(N,X)` mantêm composição, progresso e blocos. `/grupo criar X`
    segue sendo o reset explícito ("turma nova"). Encolher exige `confirmar` e realoca os alunos.
  * O gerador carimba os grupos com o **mesmo** `copiarCelula` do comando ao vivo — se ele
    regredir, `npm run cenarios` quebra antes de o mundo chegar na escola.
  * `MAX_REGIONS` 64 → 256 (o teto usava 64 exatos). `--grupos` do gerador: teto 8 → 20.
  * **Prova contra o `.ljw` REAL** (aula6, sonda no scratchpad): 5→8 cria 3 áreas e leva os
    quadros (18→27 com conteúdo); 8→3 sem `confirmar` relata "5 grupos, 45 blocos" e não escreve
    nada; com `confirmar` remove 5 áreas (27→12 quadros, célula vazia, região apagada).
  * Bateria: `check:launchers` 5/5 · typecheck 3/3 · **874/874** (+25) · build · 15/15 smokes ·
    `npm run cenarios` 7/7 conferidos.

* \[x] **subir o teto de grupos para 35** — **FEITO** (2026-08-26; pedido do usuário de
  2026-08-17: turma de 35 fazendo individualmente). `MAX_GRUPOS_AULA` 20 → 35 em
  `shared/src/grade.ts` e `dimsDaAula()` acompanhou sozinha: `dims.z` 10 → 14, grade 6×6,
  `linhasDaGrade()` 4 → 6. `MAX_REGIONS` já comportava (35×3 + 3 + 1 = **109** de 256) — e a
  conta saiu do comentário para o `expect` de `quadros-mover.test.ts`.
  * **Custo medido, não estimado:** os `.ljw` das aulas 1–6 foram de ~964 kB para ~1,35 MB
    (240 → 336 chunks); os 7 cenários somam **6,70 MB → 9,06 MB** (+2,36 MB no repositório e no
    auto-update do launcher). `aula7-corrida` tem `dims` próprias e saiu **byte-idêntico**.
  * **`.ljw` gerado ANTES desta subida** tem o `dims.z` do teto velho: `/aula grupos X` além do
    que ele comporta é recusado pelo `inBounds` de `session/aula.ts` **antes de escrever bloco**
    (não pela constante). Passou a ter teste — não tinha.
  * ⚠️ **A subida descobriu o bug-647:** a aba **grupos** do painel P desenha um botão por grupo
    numa `.jog-row`, que é flex **sem `flex-wrap`** — já transbordava 181px com o teto de 20
    (A/B medido), e com 35 virou 941px, com o botão do grupo 35 nascendo 800px fora da tela.
    Virou `.jog-grade` (grid `auto-fill` de 44px). Sonda nova: `npm run shots:grupos`.
  * Bateria: typecheck 3/3 · **933/933** (+2) · build · portão do dist · **16/16 smokes** ·
    launchers 7/7 · `npm run cenarios` 7/7 · `shots:grupos` verde a 1024×600 e 600×1024.

* \[ ] **proteger a célula-molde contra edição** (achado ao implementar o item acima,
  2026-08-17). A região `partida` fica no chunk atrás do professor, fora das fileiras de grupo,
  mas nada impede alguém de destruí-la — e daí em diante `/aula grupos` copiaria o estrago.
  Candidatos: bloquear edição dentro da região `partida` (mesma engrenagem do claim), ou tirar o
  molde do mundo e guardá-lo no meta do save.

## Sistema anti-griefing (claim de blocos)

* \[x] sistema anti-griefing: claim de blocos + alunos criam grupos de amigos para deixar só certos alunos alterarem suas áreas — **FEITO** (cp24, 2026-07-17; PLAYTEST DO USUÁRIO PENDENTE). `shared/claims.ts` (Claim/GrupoAmigos, MAX_AMIGOS=6; a pegada máxima virou orçamento por membro em 2026-08-10 — ver o item logo abaixo). Claim = COLUNA de altura total (camada 0 → teto), decidido 2026-07-20: aluno marca só a pegada XZ; servidor força min.y=0/max.y=sizeY-1 → ninguém faz ilha flutuante por cima nem escava por baixo. Saves antigos sobem pra coluna cheia no restore. Gate `claimBloqueia` em place/break/use_block; `/claim ligar|desligar|criar|modificar|remover|lista|limite` e `/amigos convidar|aceitar|recusar|sair|expulsar|lista`; msgs `claims`+`friends`; persiste no meta do save de mundo livre (some em mundo-aula read-only). Cliente: wireframes laranja + varinha do aluno.

  Decisões (todas travadas 2026-07-17):

  * claim por REGIÃO (varinha, reusa `regions.ts`) — SIM, região por varinha (esq=canto1, dir=canto2).
  * quem cria o claim: ALUNO sozinho (varinha liberada pro aluno quando a proteção está ligada).
  * grupos de AMIGOS = sistema À PARTE (convite+aceite), NÃO os grupos pedagógicos do cp13.
  * professor IGNORA todo claim (sempre edita).
  * persiste no `.ljw` (meta do mundo livre); em mundo-aula read-only o claim some — sem conflito.
* \[x] **área máxima do claim cresce com o TAMANHO DO GRUPO** — **FEITO** (2026-08-10, pedido do
  playtest). O teto fixo de 64×32 saiu; entrou orçamento de área: `AREA_CLAIM_POR_MEMBRO = 1024`
  blocos de pegada × nº de pessoas no grupo de amigos (dono incluído, teto `MAX_AMIGOS = 6` →
  6.144), com `MAX_CLAIM_EIXO = 128` pra faixa de 1 bloco não virar atalho barato.
  `areaMaxDoClaim(membros)` e `claimDentroDoLimite(min, max, membros)` em `shared/src/claims.ts`;
  `tamanhoDaEquipe`/`areaMaxDe` em `shared/src/session/equipes.ts`. ⚠️ **quem joga sozinho
  ENCOLHEU** (2.048 → 1.024): claim antigo maior que o limite continua valendo, e o que trava é
  só remarcar. `/claim limite` diz a conta na tela.
* \[x] **`/claim modificar`** — **FEITO** (2026-08-10, pedido do playtest; o usuário escolheu
  "modificar" em vez de "rodar criar de novo"). Remarca com a varinha e roda: substitui a área no
  lugar, **herda o rótulo**, ignora o próprio claim no teste de cruzamento e não abre a janela em
  que a construção fica desprotegida (que era o que remover+criar fazia). `criar` e `modificar`
  compartilham o corpo (`marcarClaim` em `equipes.ts`); `editar` é apelido. Quando o grupo
  encolhe, quem ficou com claim maior que o limite novo recebe aviso no chat
  (`avisarClaimApertado`, chamado no sair/dissolver/expulsar) — a área NÃO é encolhida nem
  removida, decisão do usuário.
* \[x] **conferir se o claim cria a coluna da camada 0 até a mais alta** — **CONFERIDO**
  (2026-08-10): cria sim, e nos dois caminhos. Na marcação, `equipes.ts marcarClaim` força
  `min.y = 0` / `max.y = ses.world.sizeY - 1` depois de validar a pegada; na CARGA de save,
  `session.ts:580-583` sobe todo claim restaurado pra coluna cheia (saves antigos guardavam
  altura parcial). Coberto por `claims.test.ts` (`min.y === 0` e `max.y === sizeY - 1` para aluno,
  professor e para o `/claim modificar`). Nada a corrigir.
* \[x] bloquear que alunos coloquem blocos fora das áreas de cada grupo nos mundos de aula/atividades — **FEITO** (2026-07-17, cp25 confinamento: `/confinar ligar|desligar` + auto em mundo-aula; aluno só coloca/quebra na área do seu grupo (cp13); sem grupo = travado; professor livre. Playtest do usuário PENDENTE)

## Mobile / toque

* \[ ] **BOTÃO DE COMANDOS NO HUD DE TOQUE + `/painel` QUE ABRE O MESMO PAINEL** (ideia do
  usuário, 2026-08-21). Duas portas novas pro painel de comandos do mobile, para não depender de
  achar o caminho pelo chat. **Irmã do item logo abaixo** (painel ao LADO) — decidir se as duas
  entram juntas ou se esta vem primeiro, já que é bem menor.
  * **Porta 1 — botão no HUD de toque.** A fileira de cima é `#touch-topo`
    (`client/src/touch.ts:251-263`), montada com o helper `this.tapButton(ícone, nome, ação)`.
    Hoje tem ☰ menu · 🧱 blocos · 💬 chat · 🪄 varinha · 👥 amigos. O botão novo entra ali com o
    mesmo molde (uma linha), e a ação chama o que o `/painel` chamar.
  * **Porta 2 — comando `/painel`.** ⚠️ **O molde EXATO já existe e é para copiar:**
    `abrirAmigosPorComando()` em `client/src/main.ts:475-485`. `/amigos` sem subcomando abre o
    painel NO CLIENTE e não vai ao servidor; com subcomando segue pro fio como sempre. O
    comentário lá explica a razão que vale igual aqui: *"é a única porta que serve nos dois — a
    tecla não existe no tablet"*. Registrar `/painel` no mesmo ponto de intercepção.
  * ⚠️ **`/painel` NÃO existe no servidor** (`session.ts:1602` lista os comandos, e ele não está
    lá). Se a intercepção do cliente falhar, o aluno recebe "Comando desconhecido" — então o
    teste tem de provar a intercepção, não só o clique do botão.
  * **Pontos a decidir antes:**
    * Qual ícone e rótulo? (`⌨` comandos? `/` comandos?) A fileira já tem 5 botões e em retrato
      a largura é escassa — conferir se cabe um 6º sem quebrar linha.
    * O botão aparece pra TODO MUNDO ou só pro professor? (o 👥 amigos, por exemplo, só aparece
      com a proteção de áreas ligada — há precedente pra botão condicional.)
    * `/painel` alterna (abre/fecha) ou só abre? O `/amigos` só abre.
  * **Verificação:** `npm run shots:toque` já fotografa o HUD de toque e tem seção que abre o
    painel de comandos — é onde o botão novo tem de aparecer.

* \[x] **ROLAGEM DO PAINEL DO PROFESSOR (botão `P`)** — **FEITO** (2026-08-21). Não era só
  possibilidade: **estava cortando conteúdo no notebook da escola**, não só no tablet.
  * **Medido antes:** 701px de conteúdo em 536px de painel → **165px cortados a 600px de
    viewport** (417px com o teclado do tablet aberto). A seção **👥 grupos inteira** e a dica
    final ficavam invisíveis e inalcançáveis.
  * **Causa:** o `#painel` divide a moldura de altura FIXA (`min(560px, 84vh)` + `overflow:
    hidden`, `client/index.html:167-190`) com `#inventario`/`#jogadores`, mas era o ÚNICO sem um
    filho rolável — os irmãos têm `.inv-grid` e `.jog-lista`.
  * **Conserto:** `Panel.abrir(titulo)` na base (`client/src/panels.ts`) limpa o root, prega o
    `.painel-head` no topo e devolve um `.painel-corpo` (`flex: 1; min-height: 0; overflow-y:
    auto`). Os dois subtipos (`AuthorPanel`, `GroupPanel`) trocaram `this.root` por
    `this.abrir(...)`. ⚠️ `min-height: 0` é obrigatório — sem ele o item flex não encolhe abaixo
    do conteúdo e o `overflow-y` nunca age.
  * **Somado:** `scrollCorpo` guarda a rolagem entre renders. A `update()` de broadcast redesenha
    o painel INTEIRO, e o professor rolado até "regiões" voltava pro topo a cada aluno que
    entrasse. A/B com broadcast real (`/grupo criar 3`): **com a restauração 155→155; sem ela
    155→0.**
  * ⚠️ **Armadilha de medição:** `overflow: hidden` ainda aceita `scrollTop` por SCRIPT, então
    `el.scrollTop = 99999` dá falso positivo num painel cortado. Medir com
    `getComputedStyle(el).overflowY` e checando se o elemento entra no retângulo do container.
  * **Sondas:** `.wolf/designqc-captures/painel-p/` (600px, 300px e rolado). Aceitação: "grupos"
    passa de invisível a visível ao rolar, head fica no topo, "✕ fechar" segue alcançável.

* \[ ] **PAINEL DE COMANDOS DO MOBILE AO LADO, não embaixo** (ideia do usuário, 2026-08-17).
  Hoje o painel é uma faixa horizontal DEPOIS do campo (`#chat-painel { margin-top: 4px;
  max-height: 26vh; flex-wrap: wrap }`, `client/src/chat.ts:24-35`), empilhada com o input no
  mesmo `#chat`. Com o teclado virtual aberto sobra pouca altura, e o conjunto campo+painel
  espreme ou empurra o campo pra fora. **Queremos: painel numa COLUNA lateral**, para que campo,
  histórico do chat e comandos fiquem os três visíveis com o teclado na tela.
  **O que já existe e ajuda:** `acompanharTecladoVirtual()` (`chat.ts:~70`) já mede o teclado
  com `visualViewport` e publica `--kb` no `:root`; o `#chat` do `index.html` soma isso no
  `bottom`. A conta de altura já está resolvida — o que muda é o EIXO do layout.
  **Pontos a decidir antes:**
  * Qual lado? Em paisagem provavelmente à direita (a mão que digita costuma tapar a esquerda),
    mas quem decide é o playtest, não o palpite.
  * Em RETRATO a coluna lateral rouba largura do histórico do chat — talvez o layout tenha de
    ser por orientação (`@media (orientation: landscape)`), não fixo.
  * O painel hoje tem `max-height: 26vh` e quebra em linhas; virando coluna passa a querer
    `max-width` e rolagem vertical.
  * ⚠️ O `#chat` é `pointer-events: none` e o painel/botões são `auto` — mover o painel para
    fora do `#chat` quebraria isso. Manter dentro.
  * ⚠️ Piso de toque de 40px por botão (`min-height: 40px`) não pode cair.
  * **Verificação:** `npm run shots:toque` tem a seção E, que abre o painel, desce um nível no
    `/tp` e envia "grupos" — ela tem de continuar verde. E `npm run shots:tablet` para o
    enquadramento (⚠️ exige `npm run dev` na 5173, não sobe servidor sozinho).

* \[x] varinha no celular (sem tecla R) — **FEITO** (2026-07-21): botão 🪄 na fileira do topo do touch UI liga/desliga o modo varinha (mesmo `toggleVarinha` da tecla R); aí os botões ⛏/▣ marcam canto 1/canto 2 (já roteiam pelo mesmo handler de clique esq/dir que checa `varinhaAtiva`).
* \[x] botão de AGACHAR no celular — **FEITO** (2026-07-21): botão de SEGURAR ⤓ nas ações do touch, mantém a tecla `agachar` (Shift) pressionada — andando não cai da borda, voando DESCE (mesma `input.down(settings.keys.agachar)` do teclado).
* \[x] **config no painel do mobile pra mudar a ESCALA da UI dos controles** — **FEITO** (2026-07-21): `settings.uiScale` (persistido, 60–180%), slider "escala dos controles (toque)" na aba controles (só em dispositivo touch). Aplicado por `--ts` (var CSS) nos tamanhos do `#touch-ui` via `calc()` — NÃO transform:scale() (o joystick lê getBoundingClientRect e o polegar se posiciona por px reais).
* \[ ] **layouts diferentes pros controles do mobile** — o usuário escolhe a disposição
  dos botões de toque (não só a escala). Refino:
  * Presets nomeados (ex.: "destro"/"canhoto" espelham joystick↔botões de ação; "compacto"
    junta as ações; "espalhado" separa) — `settings.touchLayout` (persistido, sibling do
    `uiScale`), seletor na aba controles (só em touch).
  * Implementar como CLASSE no `#touch-ui` (`data-layout="canhoto"`) + CSS por classe —
    NÃO recriar os elementos. `touch.ts` já monta os botões uma vez; layout é só
    posicionamento (grid-area / left↔right). Joystick lê getBoundingClientRect → posição
    real por px continua valendo, como no uiScale.
  * Escopo mínimo travável: só destro/canhoto (espelhar) — já cobre o pedido mais comum.
    Botões reposicionáveis por arrasto = fase 2 (guarda x/y por botão no settings).
* \[x] **comer no tablet: o botão de COLOCAR vira de COMER quando tem comida no slot
  selecionado** — **FEITO** (sessão 59, commit `a70fb32`; `touch.ts` ganhou `setModoComer()` +
  `atualizarBtnColocar()`, que decide o rótulo ▣ entre varinha ② / comer 🍎 / colocar ▣;
  fiado em `main.ts:2216` pelos handlers do `modo`, da `vida` e do `aoRedesenhar` da hotbar,
  então o "comer" SOME quando a barra de fome enche. A recusa final continua no servidor).
  (2026-08-07, pedido no playtest da escola). No touch a ação de comer hoje é a
  mesma tecla/clique do PC (clique direito no main.ts:1305 já detecta comida e manda `comer`),
  mas o botão ▣ continua parecendo "colocar bloco". O gesto é o mesmo (tap no ▣), só o RÓTULO
  que muda — mesma mecânica do `setVarinha` (rotular o botão com ícone + nome). Refino:
  * Ícone/legenda quando `mochila.ativa` E o slot selecionado (`hotbarUi.selected`) é comida
    (`isComida(hotbarUi.idNaMao())`): ex. 🍎 "comer" — e o tap chama a ação de comer
    (`comer` → manda `{type: comer, slot}`), NÃO `colocar`. Sem comida na mão, volta ▣ "colocar".
  * **Regra de fome**: só oferece "comer" (ícone de comida) quando o jogador TEM fome pra
    gastar — com a barra cheia (`vida` mostra fome == FOME_MAX) o botão fica ▣ "colocar"
    mesmo com comida na mão. A recusa final continua no servidor (`comer` com fome cheia
    devolve o item intacto); esta regra é só pra UI não oferecer mordida inútil. Pode
    exigir guardar a fome no estado de HUD (o `vitals().aplicar` já recebe `fome`).
* \[x] **renomear o botão "blocos" → "mochila" no modo sobrevivência** — **FEITO** (sessão 59,
  commit `a70fb32`; `setMochilaRotulo` em `touch.ts`, fiado no handler do `modo`
  (`main.ts:785`) e no boot (`main.ts:1533`). Criativo continua "🧱 blocos").
  (2026-08-07, pedido do usuário). O botão 🧱 do topo do touch (touch.ts ~228) abre o inventário, mas em
  sobrevivência o aluno o chama de "mochila" (e o inventário do servidor é literalmente a
  `Mochila` do `client/src/mochila.ts`). Refino:
  * Só troca o RÓTULO quando `mochila.ativa` (sobrevivência): `rotular(btn, "🎒", "mochila")`.
  * Em criativo continua "🧱 blocos". Mesmo mecanismo do `setVarinha`/comida (rotular por
    estado). Fiação junto do handler da msg `modo` (main.ts:765–792) ou do `setAtiva` da
    Mochila.
* \[x] **o botão ▣ de COLOCAR vira de INTERAGIR conforme a mira (pedido do usuário,
  2026-08-14)** — **SÓ na UI do MOBILE (touch)** — mirando baú/fornalha (container) ou
  porta/janela (interativo), o ícone deixa de ser ▣ "colocar" (ou 🍎 "comer") e vira
  "interagir"; o mesmo vale pra TODO bloco que o botão usa em vez de colocar. — **FEITO**
  (2026-08-14): `ehInterativo(alvoId)` em `main.ts` como fonte única (`containerTipoDe !==
  null || isInterativo || isCama`), usada pelo rótulo E pelos dois handlers do clique
  (main.ts:1366/1383); o loop realimenta `touchControls.setModoInteragir` quando o id mirado
  muda (guarda `ultimoIdMirado`); `touch.ts` ganhou `modoInteragir`/`setModoInteragir` com
  prioridade `varinha ② > interagir 👆 > comer 🍎 > colocar ▣`. Refino (histórico):
  * **O TAP já faz a coisa certa**: `colocar()` = `input.press(2)` (main.ts:1535) = clique
    direito, e o handler dele (main.ts:1383) já ABRE/USA container e interativo com prioridade
    sobre o comer. Só o RÓTULO mente — `atualizarBtnColocar()` (`touch.ts:323`) só conhece
    varinha ② / comer 🍎 / colocar ▣.
  * **Fonte única do "é interativo?":** extrair o predicado inline de `main.ts:1366`/`1383`
    (`containerTipoDe(alvoId) !== null || isInterativo(alvoId)`) pra UMA função reusada pelo
    rótulo E pelo clique — senão a barra e o gesto divergem no primeiro bloco novo. A cama-de-
    spawn (item da seção de sobrevivência) entra nesse predicado também.
  * **Quem alimenta:** `this.target` é recalculado a cada frame (`main.ts:1874`); fiar um
    `setModoInteragir(bool)` no loop quando o id mirado muda (ou junto dos handlers do `modo`/
    hotbar, como o `setModoComer` de `main.ts:2216`). Prioridade do rótulo = varinha >
    interagir > comer > colocar — espelha a ordem real do clique (interagir ganha de comer
    com comida na mão, main.ts:1362-1383).
  * **PC:** não existe botão no clique direito — o escopo é o ▣ do touch; o crosshair não muda.
* \[x] **painel de COMANDOS RÁPIDOS no chat do MOBILE (pedido do usuário, 2026-08-14)** — ao
  abrir o chat no touch, um painel mostra os comandos de texto que dá pra usar; toque usa.
  — **FEITO** (2026-08-14): `destinoDeToque` em `commands.ts` (UMA árvore, reusa `candidatos`)
  + painel em `chat.ts` (só `isTouchDevice()`, nasce com o chat, some no `close()`,
  `pointer-events:auto`). Verificação: seção E do `toque-shot.mjs` (abre, desce pro nível do
  `/tp`, tap em "grupos" ENVIA) — tudo verde.
  **Decisões (2026-08-14):** (1) **ÁRVORE COMPLETA** do autocomplete navegável por toque
  (comando → subcomando → depois), não uma lista curada; (2) o tap **ENVIA na hora** quando o
  comando está inteiro (sem argumento pendente); comando que termina em NOME de jogador
  **preenche o campo** (`/tpr `) pra digitar o nome. Refino:
  * **Lógica pura em `commands.ts`** (o `chat.ts` só renderiza): `destinoDeToque(caminho,
    botao)` → `enviar` | `nivel` | `preencher`, reusando `candidatos` — UMA árvore só, senão
    o painel e o autocomplete divergem no primeiro comando novo. Botão "voltar" no painel e a
    primeira tela sempre com os comandos-raiz.
  * **Trato dos nomes:** `/tpa` é comando SOLTO (sem argumento = inteiro): envia `/tpa` na
    hora, não vira lista. `tpr/kicar/resetpin/dar`, `amigos convidar|aceitar|recusar|expulsar`
    e `modo <modo>` preenchem o campo (o próximo token é NOME/Jogador — espelha as zonas de
    nome do autocomplete: `CMD_COM_NOME` + `AMIGOS_COM_NOME` + nível 3 do `/modo`). `/tp` abre
    a lista (`grupos` + nomes); tap num nome = `/tp ana`, comando inteiro.
  * **UI em `chat.ts`**: painel criado só com `isTouchDevice()`; aparece só com o chat aberto
    (`openInput()`, some no `close()`), dentro do `#chat` (que é pointer-events:none — os
    botões precisam de `pointer-events:auto`). Alvo de dedo: piso de 40px (régua coarse).

## Visual / player

* \[x] **deitar na cama para passar a noite** — **FEITO e VALIDADO NA ESCOLA** (2026-08-17;
  relato do usuário no mesmo dia: *"testei e a animação funcionou"*). O MESMO clique da cama
  define o ponto de nascimento (2026-08-14) **e** deita — decisão do usuário, sem gesto novo; o
  rótulo ▣ "interagir" já cobria a cama. `shared/src/session/dormir.ts` (novo).
  * **Maioria dos acordados** (`dormem * 2 > online`) faz a noite passar. Os dois extremos são
    ruins numa sala: "um basta" vira brincadeira, "todos" nunca acontece com 30 crianças.
    Reavaliado também na DESCONEXÃO — sair pode completar a maioria, e travar a noite porque
    alguém fechou a aba seria o defeito da regra "todos".
  * **A noite ACELERA, não corta**: `PULO_NOITE_FATOR = 120` multiplica o mesmo avanço de
    `horaDoDia` que o tick já fazia, então o céu gira à vista de todos (inclusive de quem não
    deitou) e a mensagem `time` que já existe carrega tudo — zero estado de transição no cliente.
  * Acorda ao: andar para longe da cama, amanhecer, ou desconectar. Cama ocupada por outro recusa.
  * ⚠️ **Mundo de aula fica inerte de graça**: ele nasce com `/ciclo desligar` (`gerar.ts`), e o
    gate do `cicloAtivo` é o que impede a mecânica de aparecer onde não faz sentido.
  * Cliente: a câmera desce até a cama e olha pra cima; a caixa dos OUTROS tomba -90° em X e
    desce pra `PLAYER.width/2`. ⚠️ A plaquinha é FILHA da mesh — sob a caixa tombada o local
    `+y` vira `-z` no mundo (nome na frente do corpo), então ela passa a usar o local `+z`.
    Medido com three: local `+y` → `(0,0,-h)`, local `+z` → `(0,h,0)`.
  * Protocolo: `player_moved` ganhou `dormindo?: boolean` (ausente = em pé, compatível com host
    antigo) e nasceu a msg `dormindo` (só para o autor — o servidor nunca ecoa o move de quem o
    mandou). ⚠️ `parseServerMessage` é LISTA BRANCA: sem o ramo novo a mensagem seria descartada
    calada. Tem teste.
  * **12 testes** (`shared/src/dormir.test.ts`), com A/B: trocar a maioria por "um basta" derruba
    o teste da minoria; tirar o gate do ciclo derruba o do mundo de aula; tirar o acordar-ao-sair
    derruba o dele.
  * **Playtest na escola no mesmo dia derrubou 2 bugs** (a parte que eu tinha marcado como não
    verificada em tela era exatamente onde eles estavam):
    * **bug-626** — `/hora noite` e nada acontecia. O gate `if (!cicloAtivo) return null` era
      SILENCIOSO (e `/hora` não liga o ciclo; o `.ljw` de aula nasce com ele desligado) e
      conceitualmente errado: `cicloAtivo` diz se o tempo anda SOZINHO, e dormir é ação
      explícita. Removido. De quebra, a regra virou **metade ou mais** (`>=`): com maioria
      estrita a dupla precisaria dos dois.
    * **bug-627** — tela piscando e boneco deitando fora da cama. O flicker era estrutural: eu
      interpolava a CÂMERA depois de ela ser reescrita todo frame, então o valor estacionava em
      13% do caminho. Agora quem interpola é um progresso persistente. E o corpo ia para os pés
      do jogador porque o servidor não move quem dorme — `player_moved` passou a levar a célula
      da cama.

* \[ ] **animação de SENTAR na cadeira** (o par do item acima; L298 original juntava os dois).
  O gesto e os gates são outros: cadeira não tem noite nem maioria, e provavelmente quer travar
  o movimento sem mexer na hora. Reusa a mesma engrenagem de pose (`player_moved.dormindo` viraria
  algo como `pose`), então vale fazer depois de o dormir ter rodado num playtest.
* \[ ] trocar modelo do player pra estilo Minecraft
* \[x] trocar sol pra ser quadrado, estilo Minecraft (kkk) — **FEITO** (2026-08-15): `sunDisc` virou `PlaneGeometry(56, 56)` (bilboard, `lookAt` da câmera) no lugar do `CircleGeometry(30, 24)`; lado 56 ≈ diâmetro do disco antigo, céu não encolheu. Lua segue circular (não pedida).

## Água (visual + fluido)

* \[x] **tirar os FUROS da água + material próprio** — **FEITO** (2026-07-22): a água ganhou
  um 2º material transparente DE VERDADE (blend, `opacity:0.72`, `depthWrite:false`) separado
  do material opaco/cutout do chunk. O mesher fatia os índices em 2 grupos por
  `opaqueIndexCount` (água concatenada depois do opaco); `ChunkRenderer` usa `[material,
  materialAgua]` com `geometry.addGroup` — three manda o grupo da água pro passe de
  transparência sozinho. `paintAgua` repintado azul CHEIO (sem xadrez), com ondulação/ruído
  sutil. +1 draw call SÓ em chunk com água (grupo count 0 não desenha). 287 testes (novo:
  split de grupo no mesher.test), typecheck 0 erros, build ok. Playtest no browser PENDENTE.
* \[x] **água SEM hitbox na mira + LÍQUIDO SUBSTITUÍVEL** — **FEITO** (2026-07-22, opção B):
  raycast pula `isAgua` (raycast.ts) → a mira atravessa a água e para no sólido atrás; `place_block`
  aceita célula com líquido substituível (`isReplaceable` novo em blocks.ts) nos 3 gates (célula
  principal + 2ª da porta + 2ª da cama, session.ts) → colocar bloco por cima da água a TROCA sem
  quebrar antes. 290 testes (+2 raycast: atravessa água/origem submersa; +1 session: place troca
  água), typecheck 0, build ok. Registro original abaixo:
  a água (id 129, `isAgua` blocks.ts:153) atravessa na física, mas `raycastBlock` (raycast.ts)
  PARA nela. DECISÃO DO USUÁRIO: **sempre pular água no raycast** (não só ao colocar). Refino:
  * A mira NUNCA pega água → dá pra colocar bloco olhando através dela (pedido original), MAS
    também não dá pra QUEBRAR água direto — a mira é a MESMA pra place e break (main.ts `target`),
    então left-click atravessa e quebra o sólido atrás. Consequência aceita: **remover água = pôr
    outro bloco NO LUGAR dela** (sem o ciclo quebrar+colocar).
  * Pra isso o líquido precisa ser SUBSTITUÍVEL: hoje `place_block` recusa célula ocupada
    (`getBlock !== Air` em session.ts:594; idem 2ª célula da porta:620 e da cama:645). Trocar o
    gate por "célula vazia OU substituível" → `isReplaceable(id)` NOVO em blocks.ts (água agora;
    lava/outros líquidos — e talvez capim alto/neve — no futuro herdam). `applyBlock` já
    sobrescreve; só o gate muda. Claim/confinamento/apoio (precisaApoio) continuam valendo.
  * **Qual célula de água a colocação atinge:** o raio pula a água e para no SÓLIDO atrás/embaixo;
    `target+normal` (main.ts:1117) cai na água COLADA nesse sólido → é ela que o bloco substitui.
    Efeito: poça funda enche de TRÁS pra frente (a colada no fundo/parede primeiro). OK pro escopo
    estático; a fase de água FLUIDA reavalia (níveis/fluxo). Sem sólido no alcance (água flutuando)
    → raio não acha nada → aquela água não dá pra substituir. Borda rara (água precisa de apoio).
  * Testes (raycast.test/session): raio atravessa água e para no sólido; place sobre água TROCA
    (não é recusado); break através de água atinge o de trás. É o caso EXTREMO do item "hitbox real
    dos não-cubos" (Móveis/blocos) — água não tem forma sólida, some de vez da mira.
* \[x] **mudar a textura da água (refino visual)** — **FEITO** (2026-07-26 `e3eaac4` /
  2026-07-27 `3418cf4`), junto com a animação do item abaixo; marcação conferida em
  2026-08-11. `escreverAgua`/`pintarAguas` (atlasTexture.ts:686/743) pintam o tile por onda
  senoidal em vez de cor chapada, e há **dois** tiles: água PARADA (onda do vento) e água de
  FLUXO (fase própria, direção da correnteza). Quem escolhe o tile por bloco é o mesher
  (`tileDaAgua`).
* \[x] **textura ANIMADA (ciclo de N tiles) — FEITO** (2026-07-26/27, mesmos commits acima;
  marcação conferida em 2026-08-11). Saiu pelo caminho **flipbook procedural**, não pelos dois
  listados abaixo: `AGUA_FRAMES = 16` (atlasTexture.ts:659) e `animarAguaAtlas(atlas,
  quadroParada, ondaAgua, quadroFluxo)` repinta **só as células da água no atlas** 1×/frame
  (materiaisMundo.ts:113-127) — sem `map.offset`, então não há risco de arrastar o tile dos
  blocos opacos, que era a ressalva anotada aqui embaixo. A parada anda pela fase do vento
  (`vento.ts:55`, 5,6 a 12 quadros/s) e a de fluxo por relógio próprio. Plano original:
  1. **UV-scroll**: animar `materialAgua.map.offset` no render loop → correnteza contínua.
     Mais barato; a textura precisa ladrilhar (tile-able) no eixo do scroll.
  2. **Flipbook**: N quadros lado a lado no atlas + trocar `map.offset.x` a cada ~200ms.
     Como a água tem material próprio, o offset NÃO afeta os blocos opacos.
  * Atenção: `map.offset` é da TEXTURA (compartilhada com o material opaco via mesmo atlas).
    Pra animar SÓ a água sem mexer no resto, clonar a textura pro materialAgua
    (`atlas.clone()`, `needsUpdate=true`) OU usar um shader/uniform próprio. Decidir ao codar.
  * Fazer como teste isolado primeiro (1 bloco), medir custo em tablet.
* \[x] **água FLUIDA (fluido dinâmico — FASE PRÓPRIA, grande)** — **FEITO** (2026-07-22, sessões
  15c/16): ids `Agua`=129 (fonte, nível 8) + `AguaFluida1..7`=130-136; `waterRule` (rules.ts) autômato
  celular no tick do servidor (empurra/cai/seca/infinito), item BALDE (900/901) cria/recolhe fonte,
  fluxo prioriza o desnível (`DROP_SEARCH=4`, estilo Minecraft — fio, não disco), teto de células/tick
  (`LJ_AGUA_TICK`, padrão 256). Playtest no browser feito e aprovado (sessão 18). Plano original abaixo:
  hoje a água é ESTÁTICA
  (bloco parado, sem espalhar). Regra pedida pelo usuário: bloco-fonte cria água e ela FLUI
  pros blocos adjacentes na MESMA camada (limite de 8 na horizontal) SE houver bloco de
  apoio embaixo; se a água (fonte ou fluida) estiver sobre AR, cai; ao cair, a regra dos 8
  se reaplica na camada onde pousa. Refino:
  * **FONTE vs FLUINDO + NÍVEL.** Bloco é 1 byte de id só (sem metadata). Codar o nível NO
    id: `AguaFonte` + `Agua1..Agua7` (8 ids novos, append depois de 129). Fonte = nível 8;
    fluir na horizontal DECREMENTA o nível (8→7→…→1, 0 seca); queda restaura nível cheio.
    (Estilo Minecraft: o nível vira a ALTURA visual do fluido no mesher.)
  * **AUTORIDADE = SERVIDOR** (`session.ts`), como place/break — é estado de mundo que
    persiste e sincroniza pra turma. Cliente só renderiza. NÃO é física de cliente.
  * **Propagação:** o `rules.ts` (REGRA DE OURO) é update por VIZINHANÇA em cima de UMA
    mudança — fluido precisa TICAR até assentar (autômato celular). Precisa de uma FILA de
    células de água "ativas" que o tick do servidor processa (N por tick, configurável, como
    o streaming) e ESVAZIA ao assentar (senão tica pra sempre — mata tablet). Regras por
    célula: sobre ar → cria queda (nível cheio) abaixo e some horizontalmente; sobre sólido →
    espalha pros 4 vizinhos da MESMA camada com nível-1, respeitando o teto de 8 de distância;
    procura o "buraco mais próximo" (desce preferível a espalhar) = comportamento Minecraft.
  * **Save:** os ids (com nível) já vão pro `.ljw` de graça (é byte cru). Mas fluido salvo
    pode congelar meio-fluxo — decisão: no restore, marcar só as FONTES e recomputar o fluxo
    (re-enfileira vizinhos das fontes), OU salvar como está e deixar reassentar no 1º tick.
  * **Interações:** física do nado (já existe) vale pra fonte E fluindo (`isAgua` cobre a
    faixa toda). Quebrar a fonte → o fluxo recua (níveis reavaliam e secam). Colocar bloco
    sólido no caminho → corta o fluxo (rules reenfileira vizinhos).
  * **Escopo/decisões a travar ANTES:** teto de células ativas por tick (orçamento de
    tablet); água infinita (2 fontes fazem fonte nova, estilo Minecraft) SIM/NÃO; nível
    vira altura visual no mesher SIM/NÃO (senão fica cubo cheio "degrau"). Feature grande —
    provavelmente depois do relatório/piloto.

## Ferramentas de dev

* \[x] profiler complexo pra diagnóstico, com opção do cliente enviar o resultado pro servidor
(salva na pasta do servidor — facilita rodar o profile em vários dispositivos e centralizar as medidas)
— **FEITO** (2026-07-20): botão "enviar pro servidor" no HUD F3, ao lado do "exportar JSON"; msg
`profile\_report` nova no protocolo, tratada no HOST (como /mundo, /kicar — grava arquivo, a
GameSession não tem filesystem); salva em `profiles/perf-<nome>-<timestamp>.json` (gitignored).
Singleplayer (Web Worker) não tem fs — mensagem cai no vácuo em silêncio, sem erro no cliente.
Playtest do usuário PENDENTE.
* \[x] profiler grava 10s + RAM/vídeo no F3 — **FEITO** (2026-07-21): "exportar JSON" e "enviar
pro servidor" agora GRAVAM 10s (`hud.record`, contagem regressiva no F3) e devolvem relatório
AGREGADO (frametime min/méd/p50/p95/p99/pior-frame, frames lentos >50ms/>100ms, faixa de
memória) — só o resumo vai no fio (poucos KB, sem array cru). F3 mostra RAM (JS heap
`performance.memory`; n/d fora do Chrome) e vídeo (contadores `renderer.info.memory`:
geometrias/texturas). O relatório guarda também o dispositivo (núcleos, RAM GB, DPR, tela, GPU
via WEBGL_debug_renderer_info). Playtest PENDENTE.
* \[x] mais dados úteis no profiler — **FEITO** (2026-07-21): long tasks (PerformanceObserver,
jank do main thread + delta na gravação de 10s), jitter de rede (desvio-padrão do gap entre msgs),
colunas carregadas + fila de mesh (mundo procedural), points/lines do renderer, contexto WebGL
perdido, tempo de sessão, bateria (getBattery), conexão (navigator.connection effectiveType/
downlink/rtt). Tudo no F3 + no relatório agregado. Ainda ABERTO (candidato): limites do WebGL
(MAX_TEXTURE_SIZE), uso de storage (navigator.storage.estimate).
* \[x] salvar o log do chat em arquivo (no servidor) — **FEITO** (2026-07-20): `registrarChat`
no host (index.ts) engancha no `entregar` (ponto único server→cliente), deduplica o
fan-out do broadcast e grava `mundos/<nome>/chat.log` (append, `\[ISO] autor: texto`).
Singleplayer (Web Worker) não tem fs — chat não vira arquivo lá, como planejado.

## Deploy / auto-update

* \[x] **auto-update do servidor** — **FEITO E FECHADO NA ESCOLA (2026-08-12).** Código,
  documentação, mensagem `vX → vY` e **as três rodadas de piloto**: a 1ª derrubou o bug-620, a 2ª
  atualizou mas trouxe o launcher com o bug-621, e a **3ª rodada limpa confirmou** — relato do
  usuário: *"testei na escola e funcionou corretamente, a nova versão já não teve os erros de
  texto no início. Fechou a versão antiga e abriu a versão nova corretamente"*. Ou seja: **zero
  linhas de "não é reconhecido como um comando interno"** (bug-621 morto no ambiente real) e a
  **troca-e-relançamento do próprio launcher** funcionando na cara do professor — que era o
  comportamento mais assustador de todos e o único que não dava pra provar daqui.
  ✅ **A mensagem de versão também foi confirmada:** *"atualizou para a versão mais nova mostrando
  quantos commits estava atrás"*. Os três itens do auto-update (código, README, mensagem) estão
  provados no ambiente real. Sessões 68/68b/68c + confirmação em 2026-08-12.
  * ✅ **Feito:** `8bfb086` (2026-08-07) pôs o update no `iniciar-servidor.bat` e `3a43954`
    (2026-08-08, bug-606) espelhou no `iniciar-servidor.sh`. Bifurca **pela pasta**: com
    `.git` segue `git fetch` + `merge --ff-only`; **sem `.git`** baixa o pacote do GitHub
    (`.zip` no Windows, `.tar.gz` no Linux/macOS) — que é o caso real da escola, que baixa
    ZIP. A versão instalada mora em `.lj-versao` (o sha de 40 hex do commit, pela API
    `Accept: application/vnd.github.sha`), o MESMO arquivo nos dois launchers. `LJ_SEM_UPDATE=1`
    desliga. Pacote que traz `mundos/` avisa e o padrão é NÃO sobrescrever.
  * ✅ **O pré-requisito do repo público está satisfeito:** `api.github.com/repos/meketreve/
    logica-em-jogo` responde **200 sem credencial** (conferido em 2026-08-11) — é o que faz o
    caminho do pacote funcionar no PC da escola sem token nem deploy key.
  * ✅ **FEITO (1) — o README (2026-08-11, sessão 68).** A linha da tabela virou *"Git — **não**
    precisa"*, entrou uma seção **Baixar** (Code → Download ZIP, que é como a escola pega) e a
    seção **Atualizar** foi reescrita com os DOIS caminhos: sem `.git` (pacote, `curl`+`tar`,
    sem PowerShell, `.lj-versao`, copiar-por-cima-sem-apagar, o aviso do `mundos/`, o
    `client/dist` já pronto) e com `.git` (ff-only + `git stash`), mais o que vale nos dois
    (`LJ_SEM_UPDATE=1`, sem rede não trava a aula, `mundos/` intocado).
  * ✅ **FEITO (2) — O PILOTO RODOU NA ESCOLA E FECHOU EM TRÊS RODADAS (2026-08-11 → 08-12).**
    Não é mais teoria: a máquina da escola **baixou o pacote, trocou os arquivos e
    relançou a janela sozinha**. O ambiente está validado — Windows, rede da escola, sem git,
    sem PowerShell. **Mas o piloto derrubou DOIS defeitos que nenhuma bateria pegava:**
    * **bug-620** — a 1ª rodada nem tentou: a pasta de lá tem um `.git` sobrando e nenhum git
      instalado, e os launchers decidiam por PRESENÇA de pasta em vez de CAPACIDADE do git.
      Consertado (`f114fb6`), com `LJ_UPDATE=pacote|zip|git` de escape.
    * **bug-621** — a 2ª rodada atualizou, mas o launcher NOVO chegou cuspindo dezenas de
      *"'d' nao e reconhecido como um comando interno"*: um `⚠️` que eu pus num comentário `REM`,
      e o `cmd.exe` lê `.bat` por deslocamento de BYTE. Consertado (`ddc3866`) + portão
      `npm run check:launchers`, porque isso passava VERDE em typecheck, 822 testes, build e
      15/15 smokes.
    * ✅ **3ª rodada, 2026-08-12 — LIMPA.** Relato do usuário: *"funcionou corretamente, a nova
      versão já não teve os erros de texto no início; fechou a versão antiga e abriu a versão
      nova corretamente"*. **Sem nenhuma linha de "não é reconhecido"** e com a troca-e-reabertura
      do próprio launcher acontecendo direito. Confirmou também a previsão da 68c: **não precisou
      de passo manual nenhum** — o `.bat` quebrado ainda executava o update e trouxe o consertado
      sozinho. ✅ **E a mensagem de versão APARECEU** (confirmado pelo usuário na mesma conversa):
      *"atualizou para a versão mais nova mostrando quantos commits estava atrás"* — a comparação
      que o `.bat` imprime em `Existe versao nova: voce esta na <X> (commit <sha>) e o GitHub esta
      na <sha>` (L145). Com isso os TRÊS itens do auto-update estão provados no ambiente real.
    (O A/B da 62 tinha rodado em pasta isolada com `npm` falso: validava a lógica, não o
    ambiente. O do-not-repeat de 2026-07-10 — *não escrever relatório de aplicação antes de o
    piloto acontecer* — está honrado: o relatório acima é do piloto que aconteceu.)
  * ✅ **FEITO (3) — a mensagem "atualizado da vX pra vY" (2026-08-11, sessão 68).** Os dois
    launchers passaram a ler o campo `version` do `package.json` da raiz (`versao_do_pacote` no
    `.sh`, a sub-rotina `:ler_versao` no `.bat`) e a dizer **duas frases diferentes**, porque os
    dois casos são diferentes pro professor: *"Atualizado da versão 0.9.0 para a 1.0.0 (commit
    abc1234)"* quando o número muda, e *"Atualizado — continua na versão 0.9.0, com as correções
    mais novas"* quando o conserto veio dentro da mesma versão (o caso comum — "atualizado para
    a 0.9.0" faria parecer que nada aconteceu). O sha **continua sendo a identidade** do update
    (é ele que responde "estou na última?"); o número é só o que a pessoa lê. Vale nos TRÊS
    caminhos: pacote, `merge --ff-only` e o ff depois do `git stash`. Os dois números são lidos
    ANTES da cópia — depois dela o `package.json` de casa já é o novo. Sem o campo (ou sem o
    arquivo) a frase cai na antiga, com o sha: a mensagem piora, nada quebra.
    **A/B real com o `cmd.exe` do Windows** (a sub-rotina do `.bat` extraída e rodada em
    `C:\`, porque cmd não roda em caminho UNC do WSL): `package.json` 0.9.0 e pacote 1.2.3 →
    *"da versão 0.9.0 para a 1.2.3"*; os dois 0.9.0 → *"continua na versão 0.9.0"*; arquivo
    inexistente e arquivo SEM o campo → vazio nos dois, caindo na frase velha.
  * Refino original (o plano era pelo git; o que saiu foi git **ou** pacote):
  * **Gatilho no LAUNCHER** (`iniciar-servidor.bat` Windows/escola + `iniciar-servidor.sh` WSL/casa):
    antes do `npm run start`, um passo de update opcional. Fluxo mínimo: `git fetch` → comparar
    versão local × remota → se houver nova, `git pull` + `npm install` (se `package-lock` mudou) e
    seguir. Já existe o esqueleto: os launchers rodam `npm install` na 1ª vez (bat:20, sh:18) — o
    update entra no MESMO ponto, antes do boot.
  * **REPO PÚBLICO (obstáculo principal, aceito pelo usuário):** `git pull` sem credencial exige
    repo PÚBLICO (ou deploy key/token no PC da escola — pior de manter). Público resolve e ia
    acontecer de qualquer jeito. ⚠️ ANTES de tornar público: varrer histórico por segredo (não
    deve haver — PIN/código são texto simples por decisão, e mundos/profiles são gitignored; mas
    conferir `chat.log`, saves e QUALQUER token). O README/licença viram públicos também.
  * **Pré-requisito: a cópia da escola tem de ser um CLONE git, não ZIP.** bug-233: pasta de ZIP
    `-main` (baixada à mão) NÃO é repo git → `git pull` falha. O auto-update FORÇA padronizar em
    `git clone` no PC da escola (documentar no README/launcher; detectar `.git` ausente e avisar).
  * **Windows tem git?** O notebook da escola bloqueia `npm` no PowerShell (bug-232) — por isso os
    launchers rodam por cmd.exe/duplo-clique. `git` via cmd.exe deve passar igual; confirmar que o
    Git está instalado (checar `git --version`, senão instruir a instalar / cair no modo manual).
  * ✅ **`client/dist` versionado — DECISÃO TRAVADA (2026-08-23): os DOIS.** A pergunta do
    usuário ("não seria melhor o launcher rodar o build?") derrubou o argumento de que a escola
    não compila: o `npm install` do launcher **não usa `--omit=dev`** — e não pode, porque o
    próprio servidor roda com `tsx`, que é devDependency — então o `vite` já está lá, e o build
    custa ~2s aqui / dezenas de segundos no PC do professor. Ficou cinto **e** suspensório:
    * o dist **continua versionado e viajando pronto** (é o caminho rápido e o fallback);
    * **`scripts/checar-dist.mjs`** (`npm run check:dist`, dentro do `verify`) falha quando a
      FONTE está commitada e o dist não — o estado exato que chega na escola como TELA VELHA.
      Com fonte e dist sujos juntos só avisa: falhar no desenvolvimento normal ensinaria a
      ignorar o portão. Testado nos 4 casos num repo git sintético;
    * **`npm run build` no `concluir_atualizacao` dos DOIS launchers**, **nunca fatal** — se
      falhar, avisa, aponta o log e segue com o dist do pacote. O bloco do `.bat` foi rodado no
      `cmd.exe` de verdade nos dois ramos (é o arquivo do bug-621, não se mexe às cegas);
    * **`checar-launchers` ganhou a regra 5**: some o `npm run build` de um dos dois e o `verify`
      fecha;
    * **hook `scripts/git-hooks/pre-push`** roda o `verify` inteiro antes de publicar. ⚠️ Inteiro
      de propósito: `check:dist` sozinho dá **falso-verde** (ele pergunta "o build mudou o dist?"
      e, sem build antes, nada mudou). Ligar num clone: `git config core.hooksPath
      scripts/git-hooks`. Escape: `LJ_SEM_VERIFY=1 git push`.
  * **Segurança/robustez:** só puxa com a árvore limpa (a escola só RODA, não edita tracked; mundos/
    são gitignored — sem conflito esperado); se `git pull` falhar (offline, conflito), NÃO travar —
    cair pro servidor com a versão atual e avisar. Boot já loga a versão (`v0.8.0`) — dá pra mostrar
    "atualizado da vX pra vY" ou "sem internet, rodando vX".
  * **Escopo mínimo travável:** um prompt no launcher "procurar atualização? (Enter=sim)" →
    `git pull --ff-only` + `npm install` se o lock mudou → boot. Sem UI no jogo, sem daemon. A
    checagem de versão bonita (comparar tags, changelog) é fase 2.

## Sistema de sobrevivência (feature grande)

* \[x] fome — **FEITO** (§🍖 F3, sessão 35; F6 fechou o laço e ela voltou a matar)
* \[x] vida — **FEITO** (§🍖 F2, sessão 34: queda, afogamento, morte, respawn)
* \[x] **cama como PONTO DE SPAWN do jogador (pedido do usuário, 2026-08-14)** — quem clicar
  na cama com o botão de colocar (clique direito / tap no ▣) define o PRÓPRIO ponto de
  nascimento; a morte passa a devolver pra CAMA em vez do `ses.spawn` do mundo. — **FEITO**
  (2026-08-14): ramo `isCama` no `use_block` (`session.ts`) grava `spawnCama` por NOME
  (sessão-só, sobrevive ao rejoin) com os MESMOS gates claim+confinamento do container;
  `matar()` (`vitais.ts`) respawna na célula de AR acima da cama (fallback pro `ses.spawn` se
  ocupada — senão o bug-605 morde); feedback no chat. Testes novos em
  `shared/src/cama-spawn.test.ts` (4: clicar define + aviso, morte devolve pra cama, célula
  ocupada → spawn do mundo, cabeceira também define). Refino:
  * **Servidor:** o `use_block` (`session.ts:1071`) hoje só trata container (`containerTipoDe`)
    e interativo (`isInterativo` = porta/janela); a cama (`isCama`, `blocks.ts:760`) cai no
    `return` mudo. Entra um ramo `isCama` que grava o override de spawn por NOME (molde do
    `ses.vitais`/roster — sobrevive ao rejoin; sessão-só, como os vitais, ou persistir no
    SaveMeta se quiser sobreviver ao fechamento). Mesmos gates do container: claim +
    confinamento (senão o aluno marca spawn na área/baú do colega).
  * **A cama é um PAR de 2 células** (ids 96-99; cabeceira via `camaHeadDir`, `blocks.ts:766`) —
    clicar em QUALQUER metade marca o mesmo ponto, e não há helper "outra metade" (o par é
    HORIZONTAL, não tem o `yPar` da porta, `session.ts:1105`). Definir onde a célula irmã está
    antes de gravar.
  * **`matar()`** (`vitais.ts:220`) teleporta pro `ses.spawn`; passa a ler o override por
    jogador com fallback pro spawn do mundo. O ponto da cama tem de ser uma célula de AR acima
    dela — senão o `teleportar` nasce DENTRO do bloco e o bug-605 (sufocamento) morde no
    respawn.
  * Feedback no chat ("ponto de nascimento definido aqui"); `/tp` e o "volta onde parou" do join
    (`session.ts:1559`) continuam usando o caminho atual — o override vale SÓ pra morte
    (decisão a confirmar).
* \[x] **grama ESPALHA pra terra exposta ao redor (pedido do usuário, 2026-08-15: "grama em
  bloco de grama se espalha para blocos de terra ao redor")** — **FEITO** (2026-08-15):
  `grassRule` em `shared/src/rules.ts` (módulo puro, na MESMA engrenagem da regra de ouro).
  Um bloco de grama sujo (vizinho mudou — o `markDirtyAround` já acorda a célula) olha os 4
  vizinhos da MESMA camada: terra com ar EM CIMA vira grama da MESMA variante climática
  (Grass→Grass, GramaSeca→GramaSeca…). Terra tampada = subsolo, NÃO vira (senão o mundo
  inteiro, que nasce com grama em cima de terra, seria engolido). Registrada na `rulesMap`
  pros 3 ids de grama; a TERRA (`Dirt`) deliberadamente NÃO tem regra própria — quem espalha
  é a grama (onda anda 1 célula/tick: o `applyBlock` da conversão suja a grama nova pro
  próximo tick). Sem pulso periódico nem índice novo — custo = perímetro da mudança, não do
  mundo. 9 testes em `shared/src/grama.test.ts` (regra pura + onda pelo fio); `rules.test.ts`
  atualizado (Grass ganhou regra; Dirt segue sem). Refino original:
  * Se a grama espalhar no MESMO tick da colocação? Não — o batch é o `dirty` do tick
    ANTERIOR, então a conversão nasce no tick seguinte à sujeira; isso é o que dá o efeito
    "cura célula a célula" e barra loop infinito (a nova grama só espalha no próximo tick).
  * Crescer não olha luz (como a plantação, `crescerPlantacao`): o servidor não tem o byte de
    luz (§💡 é 100% do cliente) — a condição de "exposta" é AR acima, o proxy do céu aberto.
  * Decisão aberta pro usuário: TAMBÉM espalhar pra cima/baixo (encostas) e a VELOCIDADE
    (spread 1 célula/tick = ~10 cél/s). Hoje é só horizontal e não configurável.
* \[x] **muda de árvore — a porta da cadeia das árvores (pedido do usuário, 2026-08-15: "plantar
  a árvore")** — **FEITO** (2026-08-15). 4 espécies × 4 estágios = 16 ids APPEND
  (`MudaComum0..MudaPauBrasil3`, 230-245). "Árvore" = a folha É a única fonte: quebrar folha
  larga fruta (1/8) E/OU a muda DA PRÓPRIA espécie (1/10, decisão do usuário); quebrar muda
  devolve a muda-base. Plantar na terra/grama (`apoioValido` exige solo), só o estágio 0 entra
  na hotbar (crescidos nascem do tick); cresce no MESMO pulso da plantação
  (`TICKS_POR_CRESCIMENTO = 200`, abraça o `index plantacoes` com `isMuda`); o estágio maduro
  vira a árvore COMPLETA via `celulasDaArvore` — a base É a muda → vira o 1º tronco,
  `varia` = hash determinístico da posição (sem Math.random no servidor), e **aborta** se
  qualquer célula estiver ocupada. Render: cruz de sprite, `TILE.mudaComum0=165..180`,
  `paintMuda` (copa na cor da FOLHAGEM, casca na do TRONCO da espécie-adulta). 13 testes em
  `shared/src/mudas.test.ts` (layout dos 16, colocação, solo, drops, determinismo, aborto,
  crescimento pelo fio); `drops.test.ts:129` atualizado (folha larga muda também). Bateria
  verde: 849/849, typecheck 3/3, build, 15/15 smokes.
* \[x] **ferramentas** — **FEITO** (§🍖 F10d, sessão 46). 4 picaretas, sem durabilidade e
  OBRIGATÓRIAS pra minerar: sem picareta o bloco **não quebra** e o aluno é avisado (decisão do
  usuário). Machado e pá ficaram de fora com razão escrita em `ferramentas.ts`.
* \[x] **baú + painel de transferência** — **FEITO** (§🍖 F10e, sessão 46). 27 slots, 8 tábuas,
  gesto de tocar-origem/tocar-destino, e **com item dentro não quebra**.
* \[x] **claim protege INTERAÇÃO, não só edição** — **FEITO** (§🍖 F10f, sessão 46). Fornalha e
  baú passam pelo gate ANTES de responder o conteúdo, o confinamento passou a barrar interação
  também, e um teste-portão lê a união `ClientMessage` do fonte pra não deixar mensagem nova
  escapar.
* \[x] **minérios: fornalha + lingotes + carvão** — **FEITO** (§🍖 F10a/F10b, sessão 46).
  Carvão e diamante saem do minério como ITEM; ferro e ouro continuam bloco e vão à fornalha.
  Tempo de   queima por combustível (carvão rende 8× a madeira), e a fornalha é o primeiro bloco
  com inventário — o encanamento (`containers.ts`) nasceu uma vez e serve ao baú.
* \[x] **fornalha: filtrar o que entra no slot de COMBUSTÍVEL** — **FEITO** (B1 da sessão 58,
  commit `9d4c485`; `moverBloqueadoPorCombustivel` em `shared/src/containers.ts:120` recusa
  item que não queima — só `COMBUSTIVEIS` — com aviso no chat *"Este item não queima: o slot
  de combustível da fornalha só aceita lenha ou carvão."*. Testes em `containers.test.ts` e
  `fornalha.session.test.ts`).
  (2026-08-07, playtest na escola) — hoje dá pra colocar QUALQUER item no slot de baixo da fornalha (ex.: grama,
  picareta), que não queima e fica preso até a criança perceber. Regra: o slot de
  combustível só aceita item com `energiaCombustivel > 0` (a mesma tabela da F10b); se
  não tem energia, o mover/deixar é RECUSADO (item volta pra origem + aviso), igual o
  baú "não quebra com item dentro". O slot de minério continua livre. Refino: a validação
  entra no MESMO gate do mover (o `containers.ts` já valida lugar-cheio; falta o tipo) e o
  teste-portão de "mensagem nova não escapa" (F10f) cobre o caso.
* \[x] **algodão no lugar da lã-de-trigo** — **FEITO** (§🍖 F10c, sessão 46). Pé selvagem no
  cerrado larga semente por sorte; cultivado maduro dá 1–2 capulhos + a semente. `3 algodão →
  1 lã branca`, e o trigo voltou a ser só comida.
* \[x] **comidas/cultivos: cenoura, batata, beterraba, melancia, banana e aipim** — **FEITO**
  (§🍖 F10h, sessão 58, commit `9d4c485`; blocos 200-229 — 4 estágios + pé selvagem por
  cultura — e itens 916-922 em `blocks.ts`; `PLANTAS` foi de 2 pra 8 linhas; selvagem por bioma
  em `biomas.ts`/`worldgen.ts`; saciedade em `comida.ts`; **batata cozida** (`ITEM_BATATA_COZIDA`
  = 922, saciedade 5 = pão) na tabela `COZIMENTO` de `fornalha.ts`; TILEs 135-164 no mesher.
  Testes: `culturas.test.ts` novo + `algodao/rules/blocks/session/sobrevivencia` atualizados.
  ⚠️ Esta linha é a origem do **bug-607**: `PLANTAS` 2→8 tornou a varredura linear de
  `plantaDe`/`plantaPorSelvagem` cara no mesher — consertado na sessão 63, `ef53d8f`).
  (2026-08-07, pedido no playtest da escola). Refino:
  * Mesmo molde do algodão (F10c): semente plantada no solo, pé maduro larga o item + a
    semente — vale pros seis. Comer enche a fome (F3/F6), como o trigo.
  * **BATATA COZIDA na fornalha**: receita nova na fornalha (tabela da F10b) — batata crua →
    batata cozida (comida que enche mais fome que a crua).
* \[x] pvp — **FEITO** (§🍖 F7, sessão 45)
* \[x] **sufocamento / ficar SOTERRADO — o jogador anda dentro de blocos sólidos** (bug-605,
  2026-08-07) — **FEITO** (§🍖 F7b, sessão 57; bateria verde: 785 testes + 15/15 smoke).
  Mecânica implementada: (1) soterrado por sólidos (`sobrepoeSolidos` = AABB vs colisão) recebe
  dano de sufocamento CONTÍNUO no tick do servidor (1 coração/s, `tickSufocamento`,
  `TICKS_POR_DANO_SUFOCAMENTO=10`/`DANO_SUFOCAMENTO=2`, só sobrevivência, `machucar`); (2) a cada
  tick busca vão livre num RAIO DE 2 (`acharEspacoVago`: por coluna via `findSpawnY`, coluna cheia
  até o teto não é vão, veto de outros jogadores) — achar = `teleportar()` pro vão, dano para;
  (3) não achar vão → NÃO pode se mover: o handler `move` rejeita posição nova soterrada (sem
  relay, manda `teleport` de volta à posição válida) e o dano leva à morte → respawn normal;
  morte avisa "X ficou soterrado." Testes: 2 puros + 3 de sessão (sem vão → dano+morte; com vão →
  teleporte; criativo sem dano). 4 testes antigos de session.test.ts atualizados p/ findSpawnY
  (posição y=20 ficava dentro de sólido). Registrar original abaixo:
  * **Detectar soterrado**: jogador com AABB sobreposto a sólido (`isSolidBlock`,
    blocks.ts:880). Em vez de "não deixa andar", o jogo age.
  * **Dano de sufocamento CONTÍNUO**: enquanto soterrado, `aplicarDano` a cada tick (gate
    autoritativo no servidor, `vitais.ts` — o cliente NÃO reporta dano). Nova `CausaDano`
    tipo sufocamento + `textoDaMorte` correspondente em `shared/src/sobrevivencia.ts`
    (ex.: "sufocou").
  * **Mover pro espaço vago mais próximo**: quando soterrado, teleportar o jogador pro vão
    livre mais próximo (busca por raio) via `teleportar()` (`shared/src/session/tp.ts`).
  * **Sem espaço vago → morte**: se não achar vão (ex.: completamente enclausurado), o dano
    contínuo leva à morte — não fica preso pra sempre.
  * Servidor já é autoridade de dano/vida; falta o detector de overlap no tick da sessão
    (`session.ts`, ao lado do `overlapsAnyPlayer` ~1977).
* \[ ] mobs (§🍖 F8) — fora do lite, 3+ sessões, com o aviso de GPU do laboratório

### §🔨 Ferramentas v2 — as 3 peças que faltam (pedido do usuário, 2026-08-06)

As três andam JUNTAS e é por isso que estão no mesmo bloco: hoje a quebra é **1 clique
instantâneo**, e foi essa instantaneidade que barrou machado e pá no F10d ("ferramenta que só
ACELERA não tem onde aparecer"). Fazer só a durabilidade seria punição sem recompensa; fazer só
o tempo de quebra seria espera sem razão. As três juntas fecham o laço do Minecraft: a
ferramenta certa quebra rápido, gasta, e precisa ser refeita.

* \[ ] **durabilidade das ferramentas.** É a 1ª coisa do jogo que quebra o par `{id, qtd}` da
  pilha (o F10d anotou isso de propósito: "a pilha continua `{id, qtd}`, nenhum campo novo em
  lugar nenhum"). Decisão a tomar ANTES de codar: um campo `dano?` opcional no `Stack`
  (atravessa save, protocolo e todo `moverEmArray`/`adicionar`, que hoje juntam pilhas por id) ou
  ids separados por faixa de desgaste. **Ferramenta danificada não empilha com a inteira** — é
  essa consequência que decide o desenho.
* \[ ] **exigir a ferramenta no slot SELECIONADO pra usar.** Hoje a picareta vale onde ESTIVER
  na mochila, e isso foi decisão explícita do F10d ("precisa dela na MÃO é um 2º enigma, e o
  clique não diz qual dos dois falhou"). O pedido reabre a decisão — e ela só fica justa junto
  do tooltip e do aviso na tela, senão a criança fica com a picareta na mochila achando que o
  bloco é inquebrável.
* \[ ] **tempo de quebra por (bloco × ferramenta).** A tabela do `ferramentas.ts` já é
  (tipo × família), então o número entra sem redesenho. Isto é o que destrava **machado e pá**,
  que ficaram de fora do F10d. Precisa de progresso VISÍVEL (rachadura no bloco ou anel na mira)
  e de segurar o botão — o `mousedown`/`mouseup` hoje é um clique só, e no toque é um tap.

### §💬 UI de jogo (pedido do usuário, 2026-08-06)

* \[x] **contraste do tooltip no tablet** — **FEITO** (2026-08-12, sessão 70, **bug-622**).
  Queixa do usuário: o texto saía PRETO sobre a caixa escura. A caixa nunca declarou `color`,
  e o `body` também não — então ela caía no padrão do navegador. **E o padrão é preto nos DOIS
  esquemas:** medido com `prefers-color-scheme` emulado em light e em dark, `rgb(0,0,0)` nas
  duas, porque o documento não declara `color-scheme` em lugar nenhum (o tema do aparelho nem
  entra na conta — não era um bug "de tablet", era de toda tela; o tablet foi só onde alguém
  leu de perto). Todo o resto da UI escapava por herdar de um painel que já traz `color: #fff`;
  o tooltip pendura no `body`. Agora `client/index.html` fixa `color: #ffffff`, o fundo desceu
  de `#0c0e14` para `#05070b` e a borda subiu de 0.22 para 0.28 de alfa (a caixa mais escura
  precisava da beirada de volta). Prova: `npm run shots:tooltip -- 1024 600` contra o
  `client/dist` servido, 18/18, e o print `tooltip-toque.png` com o texto legível.
* \[x] **tooltip no hover de item** — **FEITO** (2026-08-11, sessão 68). `client/src/tooltip.ts`
  (NOVO) + `shared/src/usos.ts` (NOVO). Vale nos quatro lugares pedidos: mochila, baú/fornalha,
  hotbar e lista de craft. **PC** = hover, na hora, seguindo o cursor; **tablet** = toque e
  segure (400 ms), a caixa nasce ACIMA do dedo (senão a criança lê a própria unha) e fica 2,5 s
  na tela depois de o dedo sair. **O toque que abre o tooltip não conta como tap** — senão
  segurar pra ler também pegaria a pilha, que é o gesto do §🍖 F4; quem garante isso é um
  engolidor de `click` em CAPTURA, com remoção por tempo caso o clique nunca venha.
  Por **delegação** (`data-tip-id` no botão + listener no `document`): os painéis se redesenham
  inteiros e a fornalha faz isso 10×/s, então listener por slot morreria a cada frame.
  O **"serve pra quê"** sai do `usosDoItem`, que lê as MESMAS tabelas que decidem o jogo
  (comida, fornalha, ferramentas, `PLANTAS`) — seis linhas possíveis: ferramenta (o que ELA
  destrava, e só o nível dela), comida (quanto enche), funde na fornalha, queima na fornalha
  (em cozimentos, não ticks), colheita da muda, e "para quebrar: picareta de X" (**só em
  sobrevivência** — em criativo seria mentira). Lista escrita à mão sairia de sincronia no
  primeiro item novo; assim, item novo conta sozinho. É o lugar já preparado pra **durabilidade**
  (§🔨) aparecer sem tocar no tooltip. O `btn.title` do navegador saiu dos dois painéis.
  **Prova:** 8 testes em `shared/src/usos.test.ts` + `npm run shots:tooltip` (NOVO, 18
  asserções em 1280×800 e em 1024×600, contra o dev E contra o `client/dist`). **A/B: com o
  carimbo `data-tip-id` revertido caem 9 asserções** — inclusive a B3, porque sem tooltip o
  toque longo volta a pegar a pilha.
* \[x] **esconder a hotbar com QUALQUER menu aberto** (incluindo a mochila) — **FEITO**
  (2026-08-10, sessão 66, **bug-614**). A 58 tinha escrito o `toggle` da classe `hidden` na
  `#hotbar` como o ESPELHO da condição do overlay, e espelhar dá o oposto: o overlay some
  justamente quando o painel abre, então a barra ficava na tela com painel, com chat e durante
  a CARGA, e sumia só no menu de pausa (no tablet nunca sumia — `input.active` inclui `touch`).
  Agora `client/src/main.ts` usa `noControle && !chat.open && !panelOpen && !loading.ativo`.
  Prova: 4 asserções novas no `npm run shots:esc` (seções A e B2), e com o dist do código
  velho as 3 que importam CAEM (a barra media 81px de altura com a mochila aberta).
* \[x] **clique e arraste (click'n'drag) pra mover item na versão PC** — **FEITO** (T3 da
  sessão 59, commit `a70fb32`; `client/src/slotDrag.ts` NOVO — `ArrastoDeSlot` (linha 77)
  põe o SEGURAR→arrastar→soltar POR CIMA do gesto tocar-origem/destino, que continua valendo
  no clique sem arrasto. Traz o fantasma no cursor e a divisão de pilha (clique DIREITO pega
  a metade). Anexado à mochila (`inventory.ts`) e ao painel de transferência (`container.ts`).
  O protocolo ganhou `qtd?` em `mover_item`/`mover_container` — quem aplica segue sendo o
  servidor). Hoje o item é
  movido por gesto tocar-origem/tocar-destino (que serve pro tablet). No PC a criança
  espera o Minecraft: SEGURAR o item, mover o mouse e soltar. Isso destrava também o
  **dividir pilha** (segurado, botão direito solta 1 por vez; tecla ou gesto pra dividir
  ao meio). Refino:
  * Arrastar = `pointerdown` no slot de origem, `pointermove` atualiza o fantasma (ícone
    acompanha o cursor), `pointerup` solta no slot sob o mouse (troca/junta como o
    mover-origem/destino atual). Sem hover lock — só repor no alvo.
  * Botão direito no arrasto: solta UM item por clique no destino (e o fantasma vira o
    resto). Shift+clique direito / meio no slot = divide a pilha ao meio (arredonda pra
    cima) — modo "espalhar".
  * Continuar aceitando o gesto tocar-origem/tocar-destino no tablet (sem mouse); o
    handler de toque já é outro caminho.
* \[x] **shift-clique pra mover item direto pro OUTRO inventário** — **FEITO** (T4 da sessão
  59, commit `a70fb32`; `primeiroLugar` em `slotDrag.ts:63` acha o primeiro slot que aceita —
  mesmo id com espaço, ou vazio — na MESMA ordem do `adicionar` do servidor. Mochila:
  hotbar↔grade. Transferência: mochila↔container).
  (baú ↔ mochila, e mochila
  ↔ hotbar). Click + Shift no PC (e no toque: botão dedicado ou gesto) joga o item da
  origem pro primeiro espaço equivalente do destino — mochila→baú, baú→mochila,
  mochila↔hotbar. Sem isso hoje a criança faz tocar-origem/tocar-destino sempre. Refino:
  * "Equivalente": da mochila/hotbar → vai pro inventário do container aberto (baú/
    fornalha); do container → volta pra mochila (e da mochila pra hotbar se tiver no
    mesmo panel e o slot-alvo for de hotbar). Regra simples: o DESTINO é sempre o "outro
    lado" do container atual.
  * Junta pilha como o mover normal (mesma `adicionar`); lotou tudo → não move (devolve
    aviso, não perde item).
* \[x] **botão de CHANGELOG/NOVIDADES no menu (ideia do usuário, 2026-08-15)**. Botão
  "📜 novidades" que abre a tela de mudanças da versão. Nomenclatura fixada (a MESMA do
  código): o primeiro menu, que aparece ao entrar no jogo (tela de título), é o **menu
  principal** (`#menu`, `menu.ts`, cp8); o menu do Esc dentro do jogo é o **menu de pausa**
  (`#overlay`, `overlay.ts` — guarda a referência `overlay-main`/`overlay-config`). **O botão
  aparece SÓ no menu principal** (decisão do usuário, 2026-08-15) — no menu de pausa fica de
  fora. Conteúdo: lista por versão (o que mudou v0.8.0 → atual 0.10.1); garantir que a tela
  `changelog` DELE fecha como as outras (voltam pro menu correspondente — em jogo, evento de
  fechar restaura o ponteiro/overlay; no menu principal, só alterna a `.menu-screen` ativa).
  Refino: fonte de verdade única do texto (ex.: `client/src/changelog.ts` com `CHANGELOG`),
  e o `#menu-version`/F3 já exibem `VERSION` — a tela pode reusar essa constante.
  (Sem URL externa — tela local, estilo as outras do `#menu`.)
  * ✅ **O "← voltar" subiu pro topo e virou `sticky` (pedido do usuário, 2026-08-23)** — v0.12.1
    *"O voltar fica à mão"*. Esta é a única tela do menu que rola por dentro e a lista só cresce a
    cada release: com o botão no fim, sair dela exigia rolar o changelog inteiro. Duas armadilhas
    que só a MEDIDA pegou: a **área rolável de um `.menu-screen` inclui o próprio `padding`**
    (sobrava vão acima da faixa grudada — o padding de cima saiu do painel e virou `margin-top` do
    `<h2>`), e `@media (max-height: 700px)` **troca o padding pra 16/18px**, então a margem
    negativa fixa estourava 11px pra fora justamente em 1024×600, a régua da escola (o padding
    virou `--pad-y`/`--pad-x`; quem sangra até a borda usa `calc(-1 * var(--pad-x))`).
    ⚠️ Sonda de sticky mede **ESTABILIDADE** (`meio == fim < parado`), nunca uma coordenada.
  * ✅ **A entrada do topo não leva `versao`** (2026-08-22) e o `npm version` relabela a tela
    sozinho — por isso **bump SEMPRE arrasta o painel de novidades**, que virou regra de workflow
    no cerebrum (2026-08-23).
* \[ ] **fundo ANIMADO do menu principal (ideia do usuário, 2026-08-15)**. Três peças:
  1. **Cena 3D de fundo BARATA — "câmera dentro de um cubo"**: um cubo coroado de OFFLINE
     gerada-ser-fashion (ou imagens) e câmera no MEIO, dando a impressão de um ambiente 3D de
     verdade por um custo mínimo (projeção das faces internas). Alternativa aceita: **carrosel
     de fotos** (galeria do professor) — deslizar/desvanecer por trás do menu. Objetivo: o menu
     não ser um fundo estático de gradiente. — **FEITO** (2026-08-15, escolha do usuário: cubo
     ️3D, sem galeria): `client/src/menuFundo.ts` — cubo 48×48×48 com as 6 FACES INTERNAS
     como TEXTURAS REAIS do mundo (`?foto=SEED` + `scripts/fundo-shots.mjs`: Chrome headless
     fotografa o mundo procedural nas 6 direções → `client/public/menu-fundo/*.png`, servido
     pelo Vite). Fallback: as faces procedurais pintadas em canvas 2D (céu, sol quadrado,
     nuvens, chão de blocos, árvore, vinheta) aparecem PRA ENQUANTO o PNG chega. Detalhe do
     BackSide: as 4 faces LATERAIS leem espelhadas de dentro → `repeat.x=-1` desespelha
     (verificado por amostra de pixels: comFlip bateu com a foto fonte, semFlip era a imagem
     inversa); +y/-y não espelham. Câmera orbital 0.6u devagar (`bola*0.00004`), renderer
     webgl2 PRÓPRIO (`preserveDrawingBuffer` pra screenshot), pixelRatio 1, canvas
     `position:fixed; z:29` ATRÁS do `#menu` (translúcido `rgba(9,15,28,.55)`);
     `iniciarFundoMenu()` nasce no `showMenu`, `encerrar()` ao jogar (single e rede). Testado:
     `tablet-shots` confere o cubo por PINTA (toDataURL das 4 pontas ≠ mesma cor) e que ele
     SAI ao entrar no jogo.
  2. **Frase engraçada por vez** (splashes estilo Minecraft/Terraria — *público LIVRE*, pensado
     pra criança e pra sala): histórias aleatórias, rola uma por vez logo ACIMA do título
     "Lógica em Jogo". — **FEITO** (2026-08-15): `SPLASHES` (15 frases) + `#menu-splash` acima
     do `h1` na `#menu-home`; sorteio aleatório a cada `showMenu` (`menu.ts`), CSS `.menu-splash`
     (itálico, âmbar `#ffd98a`); `shots:tablet` confirma que `#menu-home` continua cabendo
     (92..508 de 600px).
     * ✅ **Refeito em 2026-08-23 (pedido do usuário):** gira **+15° HORÁRIO** (era -15°) e
       **saiu de dentro do painel** — lá dentro a frase longa era RECORTADA pelo `overflow-y`
       do `.menu-screen` e caía em cima do `<h1>`. Virou irmão absoluto do painel, ancorado por
       medida (`posicionaSplash`, com `resize` de MÓDULO porque `showMenu` roda a cada volta ao
       menu). Sonda com a frase mais longa (53 chars) nos 3 tamanhos: não corta, não sai da tela,
       não toca o título.
     * ✅ **Frases limpas em 2026-08-23:** saíram as 15 com **mob** (creeper, zumbi, esqueleto,
       aranha, galinha, porco — o jogo não tem bicho nenhum, F8 é fase futura) e as **16
       duplicadas**: **149 → 118**. As guardas ficaram no comentário do bloco `SPLASHES`.
  3. **Rodapé**: *"feito com [❤️], [☕] e IA"* no rodapé do menu principal. — **FEITO**
     (2026-08-15): `<p class="menu-footer">feito com ❤️ ☕ e IA</p>` no fim da `#menu-home`,
     CSS `.menu-footer` (0.75rem, opacidade 0.55).
     * ✅ **Bandeiras da escola no rodapé da TELA (pedido do usuário, 2026-08-23)** — v0.12.0
       *"Orgulho da minha terra!"*. Brasil → Santa Catarina → Araranguá em SVG inline (22px),
       fora das `<section>` (aparecem em toda tela do menu), com **E.E.B. Prof.ª Otília da Silva
       Berti**. Símbolos conferidos na web e as fontes anotadas no CSS: SC = 3 faixas
       vermelha/branca/vermelha + losango verde-claro com as Armas; Araranguá = **Lei municipal
       547/1972** (azul larga / branca / vermelha / amarela larga, brasão ao centro); escola =
       **INEP 42076820**. ⚠️ A tira exigiu **ENCURTAR o painel**, não só posicionar: `#menu` é
       flex centrado e `.menu-screen` ia até `calc(100dvh - 20px)`, então a tela "📜 novidades"
       imprimia texto POR BAIXO das bandeiras (bug-641). `padding-bottom: 44px` no `#menu` +
       `max-height` menor **escopado em `#menu`** (o `#overlay` em jogo não tem rodapé).
     * ✅ **As mesmas bandeiras no cabeçalho do README (2026-08-23)** — `docs/bandeiras/*.svg`
       extraídos do `client/index.html` (que segue sendo a fonte) e rasterizados em `*.png`
       100×70 via Chrome headless, porque `<img>` de PNG renderiza no GitHub sem depender de
       como ele serve SVG. ⚠️ Mudou a bandeira no jogo? Reextraia os dois, senão o README mente.

## Geração de mundo / performance

* \[x] algoritmo de geração de terreno procedural pra mundos — **DUPLICATA** da linha "geração
  de terreno procedural — FEITO v1" (2026-07-20) lá embaixo, em *Inventário*; conferido e
  marcado em 2026-08-11. Os candidatos de v2 (altura por bioma, cavernas, mandacaru, madeira
  por espécie) ficam registrados naquele item, não aqui.
* \[x] consequente otimização de como os mundos são salvos e carregados — **FEITO** (F2/F3,
  conferido em 2026-08-11). Três peças, todas com teste: (1) **save ESPARSO** do mundo lazy —
  magia `LJS2`/`LAZY_SAVE_MAGIC` (save.ts:45) grava só os chunks EDITADOS, o resto volta do
  seed no restore (`save-lazy.test.ts`); (2) **streaming por colunas de interesse** — o
  servidor manda só o raio ao redor do aluno e re-manda o que ele esqueceu na ida
  (`streaming.test.ts`, geometria única em `colunas.ts`, bug-590); (3) **carga pelo pool de
  workers** no cliente, com o mundo denso enfileirando em vez de meshar na main thread
  (bug-608, sessão 64: trava de 9,5 s → 99 ms na máquina real).
* \[x] salvar mundo em PASTAS (uma pasta por mundo) — **FEITO** (2026-07-20, HOST): cada
mundo mora em `mundos/<nome>/` com `<nome>.ljw` + `chat.log` (paths.ts: `pastaDoMundo`,
`savePathDoMundo`, `chatLogDoMundo`). Launcher migra layouts antigos e lista as pastas.
Singleplayer (IndexedDB, export .ljw único via worldStore.ts) NÃO mudou — o navegador
não tem filesystem; export de "pasta" no single fica de fora (não faz sentido lá).


## Inventário

* \[x] abas/categorias no painel de inventário (mobília, blocos, vegetação, minérios, …)
  — **FEITO** (2026-07-20, sessão 10): categoria em blocksUi (`PlaceableEntry.cat`), tab bar no
  InventoryPanel (filtro de exibição, aba ativa sobrevive abrir/fechar), painel altura fixa com
  scroll só na grade. Pedido do playtest 2026-07-20 (100+ blocos = grade única longa demais).
* \[x] geração de terreno procedural — **FEITO v1** (2026-07-20): biomas brasileiros
  (caatinga/cerrado/mata/araucárias) por campos de clima, minérios em veia, árvores
  por bioma (ipê/araucária/pau-brasil), gramas climáticas com blend. Candidatos v2:
  altura por bioma, cavernas, forma custom do mandacaru, madeira por espécie.
* \[x] **função de DIVIDIR itens de um slot** — **FEITO** (2026-08-08): PC (clique DIREITO
  pega a metade / larga 1 por clique, sessão 59) e tablet (botão ✂ "dividir ao meio" na mochila
  e no painel de transferência). O protocolo `mover_item`/`mover_container` já aceita `qtd`
  opcional (pilha parcial) e quem aplica é o servidor. Ações:
  * Clique DIREITO no slot em modo arrasto = solta 1 item por clique (já previsto no
    item de click'n'drag da UI).
  * Tecla ou gesto de "dividir ao meio" (metade pra cima, arredonda) no PC e um botão
    no tablet (parte do item de click'n'drag) — precisa que o mover aceite QUANTIDADE
    parcial, que hoje não existe no protocolo do mover (provavelmente). Refino:
    * `moverEmArray`/`adicionar` já juntam pilhas por id; a divisão é só "pegar N da
      origem e mover como pilha nova pro destino" — checar se o handler de mover já
      aceita um `qtd` opcional na mensagem (hoje move a pilha toda).
    * Mantém o par `{id, qtd}` — NÃO cria campo novo (a decisão de durabilidade no
      §🔨 v2 é que vai mexer no Stack, não esta).

* \[x] **VARRER TODA RECEITA DE CRAFT ATRÁS DE "LÃ" QUE DEVIA SER "ALGODÃO"** — **FEITO**
  (2026-08-19; pedido de 2026-08-17). ⚠️ **A varredura inverteu a premissa: nenhuma receita
  cobrava lã.** Isso já tinha sido resolvido no bug-611 (2026-08-10), quando as 26 receitas
  passaram a cobrar `ITEM_ALGODAO` com `FIBRA_POR_BLOCO = 3`; o teste-portão em `algodao.test.ts`
  segue provando isso. O que sobrava era **só vocabulário**: os 12 blocos ainda se chamavam "lã"
  num jogo sem ovelha, e algodão não vira lã — o nome ensinava errado.
  * **Renomeado rótulo E identificador** (decisão do usuário, 2026-08-19): `"lã <cor>"` →
    **`"bloco de algodão <cor>"`**, `BlockId.WoolXxx` → **`BlocoAlgodaoXxx`**, `TILE.woolXxx` →
    `blocoAlgodaoXxx`, `Cor.la` → `Cor.blocoAlgodao`, `FIBRA_POR_LA` → `FIBRA_POR_BLOCO`,
    `LAS` → `BLOCOS_ALGODAO`. **Os NÚMEROS não mudaram** (11–18, 23–26).
  * ⚠️ **A nota antiga aqui estava ERRADA**: dizia que mexer no `BlockId` "atravessa save,
    protocolo e os `.ljw`". Não atravessa — não existe `BlockId[nome]` nem lookup reverso em
    lugar nenhum, e save/fio/`.ljw` carregam o NÚMERO. Prova dura: regerar os 7 cenários deu
    `.ljw` **byte-idênticos** (md5 conferido antes/depois).
  * **Por que renomear o id também:** a ovelha entra depois, e a lã vai ser **outro** item, com
    receita e blocos próprios (ids NOVOS, append). Deixar `Wool*` ocupado pelo algodão criaria
    a colisão exatamente quando ela custasse caro.
  * Tapetes e vidros já estavam certos (`tapete ${cor}` / `vidro ${cor}`, geradas em loop).
  * Bateria: `check:launchers` 5/5 · typecheck 3/3 · **891/891** · build · **15/15 smokes** ·
    `npm run cenarios` 7/7 byte-idênticos.

* \[x] **ABA "TODOS" NO INVENTÁRIO DO CRIATIVO: todos os blocos por ID, com BARRA DE PESQUISA**
  — **FEITO** (2026-08-21; ideia de 2026-08-17). Aba nova no fim da barra + campo de busca.
  * **Decisões tomadas:** "todos" é **modo de exibição**, não `Categoria` (`AbaInventario =
    Categoria | "todos"`, grade filtra por `aba === "todos" || b.cat === aba`) — como categoria,
    cada entrada precisaria de dois `cat`. A busca vale na aba **ATUAL** e o texto **sobrevive à
    troca de aba**. Casa por nome **sem acento** ("algodao" acha "algodão") e por **id EXATO**
    quando são só dígitos — `includes` no id faria "1" trazer 1, 11, 12, 100…
  * **Onde:** `client/src/blocksUi.ts` (`AbaInventario`, `ABAS`), `client/src/inventory.ts`
    (`montarGrade()` novo, `cat` → `aba`, `filtroBlocos`, `normalizarBusca`),
    `client/index.html` (`.inv-busca` + media query).
  * ⚠️ **A armadilha do tablet era REAL e foi medida.** Com o teclado virtual aberto a viewport
    cai pra ~300px; o painel é de altura FIXA (`min(560px, 84vh)`) com `overflow: hidden`, e
    cabeçalho + dica + 7 abas comiam 132 dos 286px — **a grade sobrava com 7px**. Media query
    `@media (max-height: 460px)` encolhe o enfeite e põe `min-height: 92px` na grade (uma fileira
    inteira). Medido depois: grade de **7px → 92px**, painel e hotbar ainda cabendo.
    ⚠️ O seletor tem de ser `#inventario > .inv-dica`: a mensagem de "nenhum bloco com esse nome"
    usa a MESMA classe dentro da grade, e esconder as duas cegaria a busca.
  * ⚠️ O tooltip por delegação (`data-tip-id`) foi mantido — sonda conferiu **145/145** botões
    com o atributo.
  * **Sonda headless** (`.wolf/designqc-captures/aba-todos/`): 145 colocáveis ordenados por id,
    busca com/sem acento e maiúscula = mesmo resultado, `"11"` → 1 item, foco no campo
    **sobrevive a cada letra** digitada.

* \[x] **CERCA está na aba "mobília", não em "blocos"** (relato do usuário, 2026-08-17) —
  **RESOLVIDO no mesmo dia**: movida para `cat: "blocos"` a pedido do usuário. Não era ausência —
  existe UM bloco de cerca (`BlockId.Cerca = 65`), ele já estava no menu e `isPlaceable` o
  aceitava; era categorização (estava junto de porta, tocha e tapete). Registro em bug-625.


* \[x] **DESCARTAR ITENS (botão de lixeira 🗑️)** — **FEITO** (2026-08-25; ideia do mesmo dia).
  Não havia como se livrar de um item: a mochila entope de terra/pedregulho no playtest.
  * **O item EVAPORA** — não cai no chão (decisão travada do ROADMAP §🍖; a morte já é sem túmulo).
  * **Puro:** `descartarSlot` (mochila) e `descartarEmArray` (núcleo) em `shared/src/inventario.ts`;
    `descartarEm` (índice UNIFICADO) em `shared/src/containers.ts`. Contrato do `moverSlot`:
    devolvem o MESMO objeto (ou `null`) no no-op, que é o sinal de "nem manda mensagem".
  * **Fio:** `descartar_item { slot, qtd? }` e `descartar_container { x, y, z, slot, qtd? }` —
    mesma régua de `qtd` do `mover_item`. Handlers ao lado dos `mover_*` em `shared/src/session.ts`,
    com os MESMOS gates: `inventarioVale` (criativo cai fora de graça), e no container também
    container ABERTO + `inBounds` + alcance + claim/confinamento. O portão do `gate-claim.test.ts`
    já cobre a mensagem nova (ela entrou no `COM_GATE`).
  * **Decisões do usuário:** vale nos DOIS painéis (mochila e baú/fornalha) · **sem confirmação**
    (um toque joga fora) · escondida no criativo (lá a paleta é infinita).
  * **UI:** botão `🗑️ descartar (N)` ao lado do `✂`, e no PC ele é também o ALVO do arrasto
    (`lixeiraSob` em `slotDrag.ts`, testado antes do `slotEm` no `soltar`).
  * ⚠️ **De quebra, consertou o ✂ (bug-646):** o botão de dividir era chamado por `dica.after(...)`
    com o `dica` ainda FORA do documento — `after()` sem pai é no-op silencioso. Ou seja, o ✂ de
    2026-08-08 NUNCA apareceu. Agora os dois entram por `linhaDeAcoes()` no `root.append` do fim,
    numa `<div class="inv-acoes">` flex (uma linha só: o painel é de altura fixa).
  * **Sonda headless** (mouse, dedo, criativo e baú): arrasto até a lixeira descarta e o fantasma
    some · toque no 🗑️ descarta · sem item na mão a lixeira não existe · no criativo não há painel
    de mochila · o baú descarta pelo índice unificado. Bateria: typecheck 3/3 · **931/931** ·
    15/15 smokes · `npm run cenarios` 7/7 byte-idênticos.


## Registros / apresentação

* \[x] PRINTS DE PONTOS-CHAVE p/ apresentação — **FEITO** (2026-07-23, sessão 18): 6 cenas
  headless em `registros/prints/` (README indexa): `01-menu` (título + badge v0.8.0),
  `02-biomas` (procedural seed 314 — mata + ipê dourado + serra), `03-agua` (cascata),
  `04-aula` (aula1 cores, painel 4/12), `05-construcao` (sala mobiliada), `06-hud-f3` (perfilador).
  Multiplayer não capturado (difícil headless) → print manual do usuário se quiser.
* \[x] perfilador anônimo + versão do jogo — **FEITO** (2026-07-23): saída carrega `versao:VERSION`,
  nome do aluno não é mais coletado (filename `perf-<timestamp>-<sufixo>.json`). profiles-escola/
  removido do tracking + gitignored; resumo agregado anônimo em `registros/perfilador-v0.8.0-escola.md`.

## Playtest na escola

* \[x] **playtest na escola** (2026-08-07): sessão ao vivo na escola — **FEITO** no registro:
  os 6 bugs relatados (599-604) estão no `.wolf/buglog.json` e o resumo da sessão no
  `.wolf/STATUS.md` (sessão 55). Os pedidos de conteúdo e a fila de consertos estão nas seções
  de sobrevivência/backlog acima.
* \[x] **playtest 2026-08-10 — 3 bugs relatados, os 3 consertados no mesmo dia** (bug-609/610/611
  no `.wolf/buglog.json`; sessão 65 no `.wolf/STATUS.md`):
  * \[x] **dividir pilha deixa o ícone flutuando no meio da tela (notebook/PC)** — bug-609.
    O fantasma era do ARRASTO e a divisão por clique direito o criava sem `cand`, então ele
    nascia sem `left`/`top` (medido: (0,457) numa tela de 1024×600), não seguia o cursor e
    nunca sumia. `client/src/slotDrag.ts` + o `sincronizar()` chamado por `inventory.ts` e
    `container.ts`. Prova: `shots:esc` seção **B3**.
  * \[x] **`/amigos` não libera o mouse** — bug-610. O painel abria e o `close()` do chat
    mandava `input.lock()` por cima dele. `client/src/main.ts`: o lock só volta se nenhum
    painel estiver aberto. Prova: `shots:esc` seção **B2** (conta os PEDIDOS de
    `requestPointerLock`: 4 → 0).
  * \[x] **crafts ainda cobrando lã em vez de algodão** — bug-611. As 26 receitas que
    consumiam lã (11 coloridas, 12 tapetes, sofá/cama/quadro) passaram a cobrar a FIBRA, na
    regra 1 lã = 3 algodão (`FIBRA_POR_LA`), com a tintura contando 1 por lote. Teste-portão
    novo: "nenhuma receita ativa cobra LÃ" (`algodao.test.ts`). A lã segue como bloco de
    construção — só não é mais matéria-prima de ninguém.
  * Os dois pedidos de FEATURE da mesma conversa (área do claim por membro e `/claim
    modificar`) estão na seção **Sistema anti-griefing**, acima.
