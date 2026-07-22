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
* \[ ] vidro colorido
* \[ ] **meio-blocos (slabs)** — meia altura (superior/inferior) de blocos existentes.
  Refino:
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
* \[ ] **escadas (stairs)** — bloco em L (degrau), 4 orientações + meia-volta (topo/base).
  Refino:
  * Extensão natural do slab, MAIS complexo: orientação direcional (rotXZ k×90°, como os
    móveis 87-99) + variante superior/inferior. IDs: 4 direções × 2 = 8 por material →
    caro; escopo mínimo = 1 material (pedra) primeiro.
  * Mesher: 2 caixas (`emitBox` base 0..0.5 + degrau 0.5..1 em metade da célula) — o
    culling de face rente já existe. Forma pura, sem material novo (1 draw call).
  * Física: mesma dor do slab, PIOR — a caixa de colisão é um L (não uma altura única).
    Ou aproxima por step-up de meio bloco (colide como slab, sobe andando) — mais simples
    e "bom o bastante" pra um jogo pedagógico. Travar isso antes de codar.
  * Depende de `alturaColisao`/caixa-por-bloco do slab → fazer slab PRIMEIRO.

## Comandos / jogador

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

## Mundo / professor

* \[x] rocha-matriz só para professor (inventário/copiar/colocar) — **FEITO** (2026-07-17)
* \[x] mundos com nome "aula" não salvam alterações, reutilizáveis sem mover arquivos — **FEITO** (2026-07-17)
* \[x] professor cria área com /claim (mesmo acesso do aluno) — **FEITO** (2026-07-21): removido o bloqueio do professor no `/claim criar`; ele reserva "terreno"/plot como o aluno. Claim SEGUE sendo COLUNA cheia (camada 0 → teto — decisão do usuário 2026-07-21, mantida); limite horizontal 64 (X) × 32 (Z) pra TODOS (era 32×32).
* \[x] **aba de JOGADORES no painel da tecla P (professor)** — **FEITO** (2026-07-21): `client/players.ts` (PlayersPanel, estrutura do inventário: altura fixa, abas, scroll só na lista). Abas "conectados" (botões expulsar/banir, 2 cliques) e "banidos" (desbanir). Aberto por um botão "👥 jogadores" no topo do painel de autoria. Ban por NICK: estado + gate de join na GameSession (`banir`/`desbanir`/`estaBanido`, persiste no meta `banidos[]`); `/banir`·`/desbanir` no HOST (fecham socket como o /kicar); msg `players` (conectados+banidos) → só professores, no join/saída/ban.

## Sistema anti-griefing (claim de blocos)

* \[x] sistema anti-griefing: claim de blocos + alunos criam grupos de amigos para deixar só certos alunos alterarem suas áreas — **FEITO** (cp24, 2026-07-17; PLAYTEST DO USUÁRIO PENDENTE). `shared/claims.ts` (Claim/GrupoAmigos, MAX_CLAIM_XZ=32, MAX_AMIGOS=6). Claim = COLUNA de altura total (camada 0 → teto), decidido 2026-07-20: aluno marca só a pegada XZ; servidor força min.y=0/max.y=sizeY-1 → ninguém faz ilha flutuante por cima nem escava por baixo. Saves antigos sobem pra coluna cheia no restore. Gate `claimBloqueia` em place/break/use_block; `/claim ligar|desligar|criar|remover|lista` e `/amigos convidar|aceitar|recusar|sair|expulsar|lista`; msgs `claims`+`friends`; persiste no meta do save de mundo livre (some em mundo-aula read-only). Cliente: wireframes laranja + varinha do aluno.

  Decisões (todas travadas 2026-07-17):

  * claim por REGIÃO (varinha, reusa `regions.ts`) — SIM, região por varinha (esq=canto1, dir=canto2).
  * quem cria o claim: ALUNO sozinho (varinha liberada pro aluno quando a proteção está ligada).
  * grupos de AMIGOS = sistema À PARTE (convite+aceite), NÃO os grupos pedagógicos do cp13.
  * professor IGNORA todo claim (sempre edita).
  * persiste no `.ljw` (meta do mundo livre); em mundo-aula read-only o claim some — sem conflito.
* \[x] bloquear que alunos coloquem blocos fora das áreas de cada grupo nos mundos de aula/atividades — **FEITO** (2026-07-17, cp25 confinamento: `/confinar ligar|desligar` + auto em mundo-aula; aluno só coloca/quebra na área do seu grupo (cp13); sem grupo = travado; professor livre. Playtest do usuário PENDENTE)

## Mobile / toque

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

## Visual / player

* \[ ] animação de sentar na cadeira e deitar na cama (pra passar a noite)
* \[ ] trocar modelo do player pra estilo Minecraft
* \[ ] trocar sol pra ser quadrado, estilo Minecraft (kkk)

## Água (visual + fluido)

* \[x] **tirar os FUROS da água + material próprio** — **FEITO** (2026-07-22): a água ganhou
  um 2º material transparente DE VERDADE (blend, `opacity:0.72`, `depthWrite:false`) separado
  do material opaco/cutout do chunk. O mesher fatia os índices em 2 grupos por
  `opaqueIndexCount` (água concatenada depois do opaco); `ChunkRenderer` usa `[material,
  materialAgua]` com `geometry.addGroup` — three manda o grupo da água pro passe de
  transparência sozinho. `paintAgua` repintado azul CHEIO (sem xadrez), com ondulação/ruído
  sutil. +1 draw call SÓ em chunk com água (grupo count 0 não desenha). 287 testes (novo:
  split de grupo no mesher.test), typecheck 0 erros, build ok. Playtest no browser PENDENTE.
* \[ ] **mudar a textura da água (refino visual)** — agora que a água tem material próprio,
  dá pra caprichar no tile sem restrição de furos. Pintar no atlas procedural (`paintAgua`
  em atlasTexture.ts) — gradiente, espuma na borda, tom por profundidade. Barato e isolado.
* \[ ] **textura ANIMADA (ciclo de N tiles) — DESTRAVADA** (a água já está em material
  próprio, 2026-07-22). Caminhos agora diretos:
  1. **UV-scroll**: animar `materialAgua.map.offset` no render loop → correnteza contínua.
     Mais barato; a textura precisa ladrilhar (tile-able) no eixo do scroll.
  2. **Flipbook**: N quadros lado a lado no atlas + trocar `map.offset.x` a cada ~200ms.
     Como a água tem material próprio, o offset NÃO afeta os blocos opacos.
  * Atenção: `map.offset` é da TEXTURA (compartilhada com o material opaco via mesmo atlas).
    Pra animar SÓ a água sem mexer no resto, clonar a textura pro materialAgua
    (`atlas.clone()`, `needsUpdate=true`) OU usar um shader/uniform próprio. Decidir ao codar.
  * Fazer como teste isolado primeiro (1 bloco), medir custo em tablet.
* \[ ] **água FLUIDA (fluido dinâmico — FASE PRÓPRIA, grande)** — hoje a água é ESTÁTICA
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

## Sistema de sobrevivência (feature grande)

* \[ ] fome
* \[ ] vida
* \[ ] ferramentas
* \[ ] craft
* \[ ] minérios

## Geração de mundo / performance

* \[ ] algoritmo de geração de terreno procedural pra mundos
* \[ ] consequente otimização de como os mundos são salvos e carregados
* \[x] salvar mundo em PASTAS (uma pasta por mundo) — **FEITO** (2026-07-20, HOST): cada
mundo mora em `mundos/<nome>/` com `<nome>.ljw` + `chat.log` (paths.ts: `pastaDoMundo`,
`savePathDoMundo`, `chatLogDoMundo`). Launcher migra layouts antigos e lista as pastas.
Singleplayer (IndexedDB, export .ljw único via worldStore.ts) NÃO mudou — o navegador
não tem filesystem; export de "pasta" no single fica de fora (não faz sentido lá).


## Inventário

* \[ ] abas/categorias no painel de inventário (mobília, blocos, vegetação, minérios, …)
  — pedido do playtest 2026-07-20: com 100+ blocos a grade única ficou longa demais.
* \[x] geração de terreno procedural — **FEITO v1** (2026-07-20): biomas brasileiros
  (caatinga/cerrado/mata/araucárias) por campos de clima, minérios em veia, árvores
  por bioma (ipê/araucária/pau-brasil), gramas climáticas com blend. Candidatos v2:
  altura por bioma, cavernas, forma custom do mandacaru, madeira por espécie.
