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
* \[ ] **BUG slab: topo do bloco não renderiza a face de baixo** (2026-08-07, playtest na
  escola): a laje de CIMA (metade superior) não desenha a parte de baixo da textura — vê-se
  o buraco por baixo. A face inferior da metade superior fica órfã (culling acha que é
  interior?). Conferir o `emitBox` do slab no mesher: a face de baixo da caixa 0.5..1 cai
  fora do culling da face do vizinho inferior (que não existe/é outra metade) — provável
  falta de regra de "laje em cima de laje de baixo" ou de face exposta sempre.
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

* \[ ] **auto-update do servidor** — hoje a escola atualiza rodando `git pull` À MÃO (é o padrão
  de deploy: quase todo bloco de STATUS termina com "escola: git pull"). Ideia: o launcher busca a
  versão nova sozinho antes de subir o servidor. Refino:
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
  * **`client/dist` versionado:** hoje o dist buildado é COMMITADO (vai no repo) → um `git pull`
    já traz o cliente novo, SEM `npm run build` na escola (bom: build no PC fraco é lento). Manter
    essa disciplina (buildar+commitar o dist ao lançar versão) OU mudar pra buildar no update —
    decisão a travar. Se manter, o auto-update é só pull (barato).
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
* \[x] craft — **FEITO** (§🍖 F5, sessão 39; sessão 45 levou de 12 pra 110 receitas, cobrindo
  todo bloco colocável)
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

* \[ ] **tooltip no hover de item.** Vale pra mochila, baú, hotbar e lista de craft. Hoje o nome
  só existe no `title` do botão (`container.ts`/`inventory.ts`), que é o tooltip do NAVEGADOR:
  demora ~1 s, não aparece no tablet e some sozinho. Um tooltip próprio serve os dois aparelhos
  (hover no PC, toque-e-segure no tablet) e é onde a durabilidade e o "serve pra quê" vão morar
  quando existirem.
* \[ ] **esconder a hotbar com QUALQUER menu aberto** (incluindo a mochila). O `updateOverlay`
  já sabe se há menu (`menuAberto()`, 2026-08-05) e já esconde a barra de TOQUE por isso — falta
  a hotbar do PC. Ela hoje fica visível atrás dos painéis, e no painel de container aparece
  DUAS vezes (a de verdade atrás e a faixa de 9 slots dentro do painel), que é a confusão que o
  pedido aponta.
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

## Geração de mundo / performance

* \[ ] algoritmo de geração de terreno procedural pra mundos
* \[ ] consequente otimização de como os mundos são salvos e carregados
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
