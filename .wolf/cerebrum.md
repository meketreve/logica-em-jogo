# Cerebrum

> OpenWolf's learning memory. Curated knowledge only: User Preferences, timeless Key Learnings, Do-Not-Repeat.
> **Consolidado em 2026-07-25** (27k → ~9k tokens): a narrativa por checkpoint (motivação, antes/depois,
> números de bug) foi movida pra `.wolf/history.md` → `## Key Learnings arquivados (2026-07-25)`.
> Aqui fica só a REGRA acionável. O Decision Log completo também vive no history.md.
> Last updated: 2026-07-25

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- Dev é **100% vibecode**: o usuário orquestra, NÃO revisa código. Arquitetura precisa
  carregar o peso sozinha (TS estrito, módulos pequenos, testes, checkpoints jogáveis).
- **Simplicidade > segurança quando não há dado sensível** (correção 2026-07-12): usuário
  mandou tirar o hash do PIN/código — "uso muito básico, sem informações importantes".
  Não construir criptografia/ofuscação sem ameaça real; rate-limit basta.
- Fala português. Responde em blocos numerados às perguntas.
- **Exige POLIMENTO de sensação, não só "funciona"** (playtest 2026-07-25): reprovou
  vidro que "funcionava" (dither) por parecer mosquiteiro e pediu suavização do
  step-up ("movimento muito brusco"). Ao entregar mecânica nova, já prever o
  acabamento visual/de câmera — ele testa jogando, não lendo teste verde.
- **Quando vai ficar AFK, pede as perguntas TODAS de uma vez** (2026-07-27):
  "vamos no vento, me faça perguntas agora porque vou ficar afk logo". Nesse
  modo, perguntar cedo, em lote, e incluir a pergunta de ATÉ ONDE ir sozinho
  (codar/testar/commitar/push) — depois é execução sem interrupção.
- **Escolhe escopo GRANDE quando oferecido** (2026-07-27): diante de 4 opções de
  fatia do §🌬️, pegou "tudo (1 a 6)". Não subdimensionar a proposta por medo do
  tamanho; oferecer o escopo cheio como opção real.
- **Aponta CONTRADIÇÃO de regra, não bug** (playtest 2026-07-27): aprovou o §🌬️
  inteiro ("achei tudo muito top") e reprovou UMA regra — o vento mandando na
  animação da água que ESCORRE: "a correnteza da agua fluindo deve ditar o
  movimento e direção da textura". A crítica dele vem em forma de regra de
  mundo ("quem corre dita a própria direção"), não de defeito visual. Ao propor
  animação ambiental, checar antes se há uma força mais LOCAL que deveria ganhar
  da global.
- **Relata bug de orientação em forma de RECEITA** ("rotaciona 180 na face de
  baixo, 90 horário na sul…"), a partir de UM caso observado (2026-07-27). A
  observação é boa; a receita nem sempre generaliza. Conferir a receita contra o
  modelo antes de aplicar, mostrar a evidência e entregar a correção geral —
  ele aceita bem quando o furo é apontado com número.
- Quer ser desafiado no design: aceita bem quando aponto furos pedagógicos/técnicos.
- **Convenções de Minecraft são o padrão esperado** (playtest 2026-07-13): pediu
  botão-do-meio = copiar bloco mirado; sprint que só engata com os pés no chão.
  Quando houver dúvida de UX de jogo, seguir o que o Minecraft faz — o público
  (alunos e professor) já tem esse modelo mental.
- **Uma tela = UM botão "voltar"** (playtest 2026-07-13): quem renderiza a tela é dono
  da navegação dela.
- **Feature grande / "talvez" → ENTREVISTA de escopo antes de codar** (2026-07-17):
  gosta de travar decisões com AskUserQuestion objetivo. Pedidos BEM DEFINIDOS ele
  quer feitos inline na hora; ideias vagas/"talvez" ele quer scopadas primeiro.
  Costuma empilhar vários pedidos no mesmo turno — separar concreto de exploratório.
- **Painel HTML é sempre FASE 2**: comandos de chat primeiro (usáveis no playtest),
  painel numa rodada seguinte.
- **Ele PERFILA de verdade** (2026-07-26): quando entrego feature de streaming/render, ele
  joga no pior caso (raio no máximo, voando) e manda o perfil pelo botão do F3 → o arquivo
  cai em `profiles/perf-*.json` no host. LER o perfil quando ele disser que perfilou — a
  resposta esperada é análise dos números, não "ok". Manter o F3 rico em contadores paga.
- **Backlog é para ANOTAR, não para fazer** (2026-07-26): "pode anotar só pra melhorar
  depois… anota tudo isso no roadmap" = escrever no ROADMAP com escopo e ORDEM por custo, e
  seguir a quest atual. Não começar a implementar o que ele mandou anotar.
- **Ele decide a ordem das frentes** e costuma pedir "commita tudo, segue para X e Y, mas
  antes prepara para /clear" — ou seja: fechar handoff (STATUS/TODO/cerebrum) ANTES de
  encostar na próxima quest, e derrubar servidores de teste que ficaram no ar.

## Key Learnings

<!-- Regra acionável. Narrativa/histórico completo: .wolf/history.md -->

### Streaming F2 (colunas) — quem sabe o quê

- **Config de cliente que o SERVIDOR precisa saber tem que ser re-enviada quando muda.**
  `{type:"radius"}` sai UMA vez, logo após o join (`main.ts:542`); a config de raio de render
  aplica ao vivo no cliente mas nunca reavisa o servidor → `st.raio` (`session.ts:603`) fica
  velho e o anel novo não é streamado (bug-211). Ao adicionar QUALQUER setting que o servidor
  espelha, ligar no `onChanged` do `buildConfigScreen` além do `connect()`.
- Cliente e servidor descartam coluna pela MESMA regra (raio + FOLGA_DESCARTE) — é o que
  dispensa mensagem de unload. Consequência: DIMINUIR o raio parece funcionar mesmo com o
  servidor desatualizado; só AUMENTAR expõe o bug. Sintoma enganoso = "mantém mais chunks
  renderizados, não carrega novos".
- Re-enviar coluna NÃO precisa de caminho de envio paralelo: basta `st.enviadas.delete(key)`
  e o `streamColunas` do tick seguinte a repõe no lote. **Implementado em 2026-07-26**
  (`pedir_coluna`, bug-215) — o padrão vale pra qualquer "reenvia isso pra mim": mexer no
  ESTADO que decide o envio, nunca abrir um segundo caminho de send.
- **Comando cliente→servidor que dispara TRABALHO precisa de teto no SERVIDOR**, não só de
  backoff no cliente: o fio chega pela rede da escola e um cliente adulterado vira gerador de
  carga. Receita usada em `pedir_coluna`: contador + início de janela no estado por cliente,
  `if (agora - desde >= 1000) { desde = agora; n = 0 }` e `if (++n > TETO) return`. O teto
  fica em `protocol.ts` (é contrato, não detalhe do host).
- **Varredura periódica do cliente: dar CARÊNCIA antes do 1º pedido.** O streaming é gradual
  (`colunasPorTick`), então "não chegou ainda" e "buraco" são indistinguíveis no instante 0 —
  sem carência (4 s hoje) a rede de segurança repede o mundo inteiro durante o load normal.
- **`repedidas` é o termômetro da varredura** (F3). Playtest de 2026-07-26 (234 s voando a raio
  12, mundo E): **16 re-pedidos em 719 colunas = 2%, `faltando` fechou em 0**. Guardar como
  BASELINE: se uma mudança futura na carência/backoff levar isso pra dezenas de %, a rede de
  segurança virou gerador de tráfego.
- **Decode/mesh que joga exceção precisa de try/catch NO LOOP**, não só de log: `decodeColunas`
  subia pelo handler de mensagem e matava o resto do frame; `remesh` matava o resto da fila. Com
  o catch, a coluna simplesmente não entra em `colunasCarregadas` e a varredura 1×/s a repede —
  "detecção de corrompido" sai de graça da detecção de "faltando".

### Contratos binários e invariantes

- Índices: chunk em `world.chunks` = `(cy*dims.z+cz)*dims.x+cx`; bloco no Uint8Array =
  `(ly*CHUNK_SIZE+lz)*CHUNK_SIZE+lx`. `getBlock` fora dos limites = Air.
- `world_snapshot` (LE): u32 magic "LJW0" | u8 dims.x | u8 dims.z | u8 dims.y | u8 reservado |
  u32 seed | chunks na ordem de `chunkIndex()`, CHUNK_VOLUME bytes cada. decode SEMPRE
  valida magic/dims/tamanho.
- Id de bloco é BYTE DE SAVE: **nunca renumerar/reordenar id antigo**, só append no fim do
  `BlockId` + bump do `MAX_BLOCK_ID`. Famílias novas ficam fora da faixa antiga (ver a
  pegadinha do `isFullCube` em Do-Not-Repeat/porta R).
- `block_changed` é GENÉRICO por contrato: mesma msg pra ação de jogador, de outro jogador e
  de regra do tick. Cliente aplica sem distinguir origem.
- Spawn (e qualquer valor "do terreno pristino") é propriedade da CRIAÇÃO do mundo: calcular
  no construtor, transmitir por protocolo, NUNCA derivar do snapshot (mundo já escavado).
- `/shared` é lib ES2022 pura: sem `performance` (clock injetável `opts.now`), sem
  TextEncoder/TextDecoder (usar `declare class` mínima no arquivo, não lib DOM no tsconfig).

### Servidor autoritativo, regras e rede

- Validação de ação (session.ts): join obrigatório → bounds → célula compatível → alcance
  (`PLAYER_REACH+2` de folga, pos do move chega a 10 Hz) → AABB de jogadores (place não
  emparedar). Rejeição = SILÊNCIO; cliente só muda mundo via `block_changed`.
- Regra de bloco NUNCA escreve no mundo: devolve `BlockChange[]` e a session aplica
  (broadcast + marca vizinhos). Fila de vizinhança: sujeiras novas vão pro PRÓXIMO tick
  (lote é snapshot) → areia cai 1 célula/tick; `changedThisTick` impede 2ª mudança da mesma
  célula no mesmo tick. Ordem da areia: materializar embaixo ANTES de limpar a origem.
- Queda é `fallingRule` GENÉRICA — bloco novo que cai = 1 linha no Map `RULES`.
- Move do cliente é REATIVO: manda quando muda (até 10 Hz) + heartbeat 1×/2 s. Qualquer
  estado periódico novo segue "manda quando muda + heartbeat", não "manda sempre".
- Presença: cliente NUNCA sabe o próprio id; relay `player_moved` só pros OUTROS
  (broadcastExcept). O JOIN envia `player_moved` de cada online pro novo (DEPOIS do
  snapshot) e anuncia o novo pros demais. `player_left` no disconnect.
- Chat: broadcast ECOA pro autor (confirmação de round-trip); comando (`/`) responde SÓ pro
  autor com author "servidor". Resposta multi-linha = 1 msg com "\n" (`white-space: pre-line`).
- Teleporte: helper `teleportar(clientId,x,y,z)` reusa `teleport` (pro próprio) +
  `player_moved` (pros outros). ZERO protocolo novo — base de `/tp`, `/iniciar`, `/tpa`.
- Broadcast de estado (regions/objectives/groups/quadros): lista COMPLETA, cliente
  SUBSTITUI (não mescla); dedup por JSON; join manda direto pro recém-chegado. Não fazer
  mensagem por-destinatário (quebra o dedup) — o cliente escolhe a própria linha.
- Anúncio "objetivo concluído" sai SEMPRE DEPOIS do estado novo (o cliente toca conquista
  e suprime o ping em janela de 800 ms).
- Rate-limit do join: PIN errado conta por NOME (5 → 30 s de trava); código de professor
  tem contador GLOBAL próprio (quem chuta troca de nome).
- Identidade (cp9) separa POSIÇÃO (roster) de IDENTIDADE (pin/papel por nome, TEXTO PURO).
  `singleplayer:true` pula tudo e todo join é professor; save de single sai sem pin/papel,
  mas identidade restaurada de save é preservada.
- Comando SÓ do host (fecha socket / lê arquivo): interceptar em `server/index.ts` ANTES do
  `session.handleMessage` (`/mundo`, `/kicar`). GameSession é pura. No worker esses caem em
  "comando desconhecido" — aceitável. Adicionar à mão no autocomplete.
- Terminal do host: readline no stdin = console do professor sem entrar no jogo (`/say`).
- Ciclo dia/noite: tempo SERVER-AUTORITATIVO por TICK (`horaDoDia += 24/(DIA_SEGUNDOS*
  TICK_RATE)`), NUNCA relógio de parede; broadcast `time` 1×/s + no join, cliente interpola.
  Mundo de ATIVIDADE = dia permanente, ciclo parado (`HORA_PADRAO=12`, `cicloAtivo=false`);
  hora+ciclo PERSISTEM no save. Gerador de cenários trava o dia EXPLÍCITO. Mexeu no default
  ou no formato → **regerar cenários** (`npm run cenarios`).
- Objetivos: região MODELO ≠ região ALVO (fotografar e detectar na mesma nasceria completo).
  Detecção segue a regra de ouro — `applyBlock` marca `objetivosDirty`, o tick recheca SÓ os
  tocados (nunca varredura periódica); "chegar" conclui no handler do move (heartbeat cobre
  parado). Reset (`/objetivo resetar`, `/iniciar`) precisa REPOR os blocos:
  `Objective.baseline` (fotografia por área, persistida no .ljw, ordem canônica y→z→x).
- Grupos: membros por NOME (sobrevivem a rejoin/reboot); professor fora da auto-distribuição;
  recém-chegado cai no MENOR grupo; re-criar zera composição e progresso.
- Água fluida (`waterRule`): cada célula em chão sólido busca a QUEDA mais próxima
  (`passosAteQueda`, `DROP_SEARCH=4`) e escorre SÓ naquela direção; sem queda = espalha nos 4
  lados (poça). 2 armadilhas: (1) o custo até a queda mede TODA célula ATRAVESSADA (ar OU
  fluida, `aguaAtravessa`), não só as preenchíveis — array `empurra[]` separado diz quais
  encher; (2) `temQueda` conta ar **e água fluida** embaixo. Teto por tick:
  `AGUA_POR_TICK_PADRAO=256` (opt `aguaPorTick`, env `LJ_AGUA_TICK`), conta só células que
  MUDAM, resto volta pra `dirty`.
- Mar/lago do worldgen (2026-07-26): `NIVEL_MAR=22` inunda toda coluna com `h < NIVEL_MAR` de
  água-FONTE (nível 8) — fonte é auto-regenerativa e não escorre, então o oceano é estável. A
  água nasce ESTÁTICA: a fila de vizinhança só acorda em `applyBlock`, logo o mar custa ZERO
  tick no boot. `SAND_HEIGHT = NIVEL_MAR + 1` (a praia contorna a água). Preset plano/cabines
  (aulas) NÃO tem água. Spawn: `findSpawnSeco` (world.ts) anda anel por anel até uma coluna
  cujo topo não seja água — ninguém nasce nadando.
- Encher em lote: `applyBlockQuieto` (tudo menos broadcast) + UMA msg `blocks_filled`;
  células puladas corrigidas com `block_changed` depois. `MAX_ENCHER_CELLS=65536`;
  `MAX_OBJETIVO_CELLS` segue 4096 (detecção recheca a cada mudança = custo recorrente).
- `parseCoordArg(token, base)` (session.ts) entende inteiro, `~` e `~n` relativos à célula do
  autor — REUSAR em qualquer comando com coordenada.
- `parseNamedRegion` (regions.ts) é o validador ÚNICO de região vinda de fora (protocolo E
  save); entrada quebrada é PULADA. Padrão pra qualquer estrutura futura no meta do save.
- Regiões: canal `regions` é SÓ pra professor; o que o aluno vê é decisão do OBJETIVO.
  Varinha = rascunho POR CLIENTE (`wandMarks`), some no criar/disconnect, não persiste.

### Render / mesher / atlas

- Mesher é FUNÇÃO PURA (bytes → geometria) e roda no cliente.
- **Transparência de verdade = GRUPO de índices + material próprio** (água 2026-07-22,
  vidro colorido 2026-07-25). UM vertex buffer, índices fatiados em 3 grupos — opaco,
  água, vidro — expostos por `ChunkGeometry.opaqueIndexCount` + `aguaIndexCount`;
  `ChunkRenderer` monta `addGroup` ×3 e recebe material ARRAY `[opaco, agua, vidro]`.
  Grupo com count 0 não gera draw call. Materiais transparentes: `transparent:true`,
  `opacity`, `depthWrite:false`, MESMA textura do atlas. Tile do atlas fica OPACO (o ícone
  2D da hotbar copia o tile e sai sólido).
- **Cutout (alphaTest 0.5) é pra RECORTE** (folha, flor, moldura, vidro incolor): sem
  sorting, sem draw call extra. NUNCA pra meia-transparência de superfície (vira dither).
- Oclusão de face se decide pela transparência do VIZINHO, não do dono da face: face aparece
  se `vizinho == ar || (transparente(vizinho) && vizinho != id)`. Mesmo id funde (vidraça
  contínua); não-cubo NUNCA oclui vizinho.
- Remesh na borda: mudar bloco com coord local 0 ou 15 exige remesh do chunk vizinho
  (`ChunkRenderer.remeshBlock()` cuida).
- Não-cubos: forma no `emitShape` + `emitBox` com UV PROPORCIONAL (face amostra do tile a
  região que ocuparia no cubo cheio); face RENTE à borda some se o vizinho é cubo opaco ou
  tem o MESMO id. Sprite plano (flor) NÃO usa emitBox — usa `emitCrossPlane` (2 lâminas
  diagonais a 90°, UV do tile inteiro, cada uma emitindo os 2 lados porque o material é
  FrontSide).
- `blockSelectionBox(id)` (mesher) = caixa que envolve a forma, PURA (estado/direção já moram
  no id). O contorno da mira é um cubo unitário reescalado por frame a partir dela.
- `raycastBlock` segue a FORMA: pula `isAgua` (água invisível pra mira) e faz ray-vs-AABB
  contra `blockSelectionBox` em célula `!isFullCube`; cubo cheio = fast path com a normal do
  DDA. Mira é 100% cliente; o servidor valida a regra à parte.
- Colisão parcial (laje/escada, 2026-07-25): fonte única `collisionBoxes(id)` em blocks.ts
  alimenta mesher (forma) E física. `resolveVertical` (pouso/teto) e `resolveHoriz` (parede)
  resolvem contra a SUB-CAIXA, nunca contra a fronteira da célula. Step-up ≤ `STEP_HEIGHT`
  (0.55) em `moveHoriz`, só com os pés no chão. Cerca/porta/móvel continuam com colisão de
  CÉLULA CHEIA (simplificação deliberada). **Validado em playtest (2026-07-26): a laje FICA
  com mira na metade + colisão de meia altura** — o usuário confirmou "hitbox já está
  correta". Não uniformizar com o modelo de célula cheia da cerca/porta.
- **Superfície de fluido = altura POR VÉRTICE, nunca modelo por vizinho** (água 2026-07-26):
  a altura de cada canto do topo é a média dos níveis das **4 células que compartilham aquele
  canto**. A vizinha calcula o MESMO canto a partir do MESMO conjunto → as pontas encaixam sem
  costura, e não existe explosão combinatória (8⁴ variantes). Regras de borda: água EM CIMA de
  qualquer uma das 4 → canto = 1 (coluna submersa não pode ter fresta); nível máximo →
  `AGUA_TOPO` (0.875, lâmina d'água). Vale pro quad de topo E pro topo das faces laterais
  (trapézios). Água↔água continua FUNDINDO (sem face entre elas) — o topo inclinado fecha o
  volume. É só VISUAL: colisão/mira não olham (água não é sólida, `raycastBlock` a pula).
- Textura animada sem custo: repintar SÓ o tile no canvas do atlas + `texture.needsUpdate`
  (`animarAguaAtlas`, ~8 fps a partir do render loop). Ruído do tile fica FIXO (hash da
  posição) e só a fase da onda anda — senão o bloco pisca. Zero UV/material/geometria novos.
- Overlay de tela cheia (tint submerso) vai em `z-index: 1` — ACIMA do canvas e ABAIXO de
  TODA a UI (mira 5, hotbar 6, toque 8, chat 10, menus 20+). Com z-index 5 a hotbar e os
  botões de toque saem tingidos.
- `scene.fog` (FogExp2) NÃO pinta o `scene.background` do three: submerso, o tint DOM é que
  cobre o céu. Os dois juntos = sensação de fundo; sozinho, cada um deixa buraco.
- `ATLAS.tilesPerRow` é dinâmico (mesher/atlasTexture/blockIcons leem dele) — dá pra crescer
  a grade sem tocar em UV, save ou snapshot.
- Tiles com alpha: canvas nasce transparente, `clearRect` = furo. Tile não pintado = bloco
  invisível — o teste "todo colocável tem tile" pega o lado do mesher, não o do atlas.
- Família regular de blocos (glifos A–Z/0–9) sai de UMA const (`GLYPH`) iterada em
  BLOCK_TILES, pintura e nomes — não 36 linhas explícitas.
- `?atlas` na URL pendura o canvas do atlas no canto (inspeção visual em screenshot headless).

### Receitas (checklists)

- **Bloco cúbico novo** (tudo append): (1) `shared/blocks.ts` id no FIM + bump `MAX_BLOCK_ID`;
  (2) `shared/mesher.ts` BLOCK_TILES id→tile; (3) `client/atlasTexture.ts` pintar o tile;
  (4) `client/blocksUi.ts` PLACEABLE nome PT. Hotbar/ícones/inventário/`/bloco`/`/regiao
  encher` são automáticos.
- **Bloco NÃO-cubo:** id + `isFullCube`/`isSolidBlock` + case no `emitShape` + tile +
  BLOCK_TILES (ícone) + PLACEABLE. Se a família tem estado (aberto/direção/dobradiça), o
  estado mora NO ID e o cliente manda só a variante base (copy normaliza).
- **Mensagem servidor→cliente:** (1) union + comentário em `protocol.ts`; (2) `case` no
  `parseServerMessage` (defensivo, senão null); (3) dispatch em `main.ts handleServerData`;
  (4) servidor emite via `this.send`/`this.broadcast`. Cliente→servidor espelha — mas
  PREFIRA reusar chat/comando quando é ação de professor (painel = açúcar sobre `/comando`).
- **Comando novo:** atualizar a árvore de autocomplete em `client/commands.ts` (espelha
  `runCommand` do shared + `/mundo` do server), senão o Tab não oferece.

### Cliente (UI, input, câmera)

- Painéis (`panels.ts`) são AÇÚCAR sobre comandos de chat: o botão COMPÕE um `/comando` e
  manda como msg `chat`. Validação 100% no servidor, zero protocolo novo. Painel NUNCA decide
  estado; re-renderiza pelos broadcasts, adia re-render enquanto um input DELE tem foco.
- **SEM popups nativos** (prompt/confirm/alert proibidos): UI inline; erro que precisa
  sobreviver a reload vai por sessionStorage. (Bônus: `alert` TRAVA screenshot headless.)
- Config do jogador: localStorage `lj-config`, merge DEFENSIVO por campo; teclas por
  `e.code`; rebind com keydown `{once, capture}` + stopPropagation.
- Tecla de SEGURAR nova = entrada em `KeyAction` + default + label (o loop lê
  `settings.keys` por frame). Tecla de ATALHO nova exige também `input.onKey` no startGame
  + entrada na lista do `onSettingsChanged`.
- Hotbar = 9 slots em localStorage `lj-hotbar` com parse defensivo POR SLOT; inventário é
  100% local. Ícones via `blockIconTile` recortado do canvas do atlas.
- `PLACEABLE` mora em `client/src/blocksUi.ts` — main.ts e os selects do painel usam a MESMA
  lista.
- Movimento: edge-guard do agachar é POR EIXO no sub-passo (diagonal desliza pelo eixo
  seguro). Sprint = duplo-toque detectado por POLLING no render loop, ENGATA só com
  `onGround`, agachar vence. Voo criativo é 100% cliente (`MoveInput.fly`), mas COLIDE.
- Suavização é do OLHO, nunca da física: FOV/altura do olho/step-up usam lerp exponencial
  `1-exp(-dt*k)` (independe do FPS) sobre `camera.position`; a simulação continua
  determinística porque o servidor valida a mesma.
- Lerp de jogador remoto: `1-exp(-dt*12)`, yaw pelo caminho curto (`atan2(sin Δ, cos Δ)`);
  a caixa NASCE na primeira posição recebida.
- Plaquinha de nome: `THREE.Sprite` FILHO da mesh (ignora o yaw do pai), textura de canvas
  procedural, `depthTest:false`. Redimensionar canvas RESETA `ctx.font`.
- Chat/pointer lock: Enter dá transient activation → `requestPointerLock()` ao fechar o chat
  funciona sem clique; guard em input.ts pra teclas vindas de `<input>`.
- Estado client-side indexado por POSIÇÃO precisa entrar na limpeza do `reloadWorld`.
- Toque (`touch.ts`): a UI de toque só SINTETIZA o input de teclado/mouse (`input.setKey`,
  `applyLook`, `press`) — rebind vale de graça. `input.active` = locked OU touch.
  `setShown(false)` solta as teclas seguradas. Fullscreen/orientation lock só em gesto.
- Áudio (`audio.ts`): WebAudio sintetizado, zero assets; AudioContext só nasce em gesto —
  som disparado por REDE usa `playUiPassive`.
- Tela de carregamento (`loading.ts`, §🕐): `chunkRenderer.filaPendente` conta **CHUNKS**, não
  colunas (1 coluna = `dims.y` chunks + os vizinhos re-enfileirados) — rotular como "colunas"
  mente por 8×. O ritmo de chegada (8 colunas/tick × 10 tps = 80 col/s = 640 chunks/s) passa a
  capacidade do mesher (`meshPorFrame` 8 × 60 fps = 480/s), então a fila CRESCE durante o
  streaming e drena depois: fechar a tela exige `filaPendente === 0` **além** de colunas
  completas, senão o aluno entra num mundo com buracos.
- Qualquer UI nova que cubra a tela sem pointer lock entra na condição do `updateOverlay()`
  (menu Esc) E do `touchControls.setShown` — `!input.active` sozinho significa "sem lock",
  não "sem jogo". Ao fechar, quem devolve o menu de pausa é o callback (o clique do "voltar
  ao jogo" É o gesto que o pointer lock exige — não dá pra travar sozinho).

### Ambiente, build e campo

- Verificação visual sem navegador: `npm run dev` em background + chrome headless
  (`--headless=new --no-sandbox --disable-gpu --enable-unsafe-swiftshader
  --virtual-time-budget=8000 --screenshot=out.png`). `openwolf designqc` dá navigation
  timeout neste app — usar o comando cru.
- Worker de OUTRO workspace no Vite: `new Worker(new URL("../../server/src/worker.ts",
  import.meta.url), { type: "module" })` — sem `?worker`, sem export no package.json.
- `tsx watch` do `dev:server` observa também os imports de /shared (editar session/protocol
  reinicia sozinho). Node 22+ tem WebSocket GLOBAL → smoke de netcode com zero deps.
- Host ws (Node): socket sem handler de `error` derruba o processo; ignorar frames binários
  de subida; `data.toString()` no Buffer.
- Canal de HOST do worker: msgs `{hostType: ...}` no MESMO postMessage, filtradas ANTES do
  protocolo de jogo. Quem grava no IndexedDB é o CLIENTE; o worker só serializa.
- `?server=` pula o menu (screenshots headless e links de LAN dependem disso); `?pin=`/
  `?codigo=`/`?painel`/`?touch` completam o boot direto.
- Notebook da escola (Windows 11): PowerShell bloqueia `npm` (shim + ExecutionPolicy) →
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` ou `npm.cmd`. Instrução pro usuário
  sempre com `$env:VAR="x";` em linha única.
- **`npm run dev:server` NÃO mostra mudança de cliente** (bug-516): ele sobe só o host Node,
  que serve o cliente COMPILADO (`static.ts` → `client/dist`, `readFileSync` por request).
  Feature nova de UI em `:8080` exige `npm run build` (host não precisa reiniciar). Loop
  rápido do cliente = `npm run dev` (vite 5173): single roda sozinho; multiplayer aponta o
  menu pra `ws://localhost:8080`. Ao entregar feature de CLIENTE, dizer QUAL porta testar.
- Dá pra DATAR a versão rodando no notebook pelas frases do boot ("escutando em ws://" =
  pré-2026-07-15). Erro estranho vindo de lá → primeiro conferir se a cópia é o main atual.
- `anatomy.md` auto-update só ADICIONA: ao renomear/apagar arquivo, `grep` pelo nome velho e
  limpar à mão.
- "Chunk não carrega" ≠ bug do streaming se o raio de render foi mexido ao vivo (sintoma
  local do cliente que mexeu). Perguntar antes de investigar.
- `remeshCount` do F3 é ACUMULADO da sessão; o que importa é `remeshLastMs` (≤ 2.1 ms = sem
  hitch).
- Restrição de assets é de LICENCIAMENTO (projeto.txt §9), não "zero PNG": asset PRÓPRIO ou
  CC0 é permitido. "Tudo procedural no canvas" é ESCOLHA nossa (repo 100% texto, sem loader,
  testável headless) — convenção defensável, revisável.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->

### Colisor de forma PARCIAL exige resolução por SUB-CAIXA nos 3 eixos (2026-07-25)
- Ao criar laje/escada, `collisionBoxes` passou a alimentar a física, mas o
  `moveAxis` horizontal continuou encostando o jogador na **fronteira da CÉLULA**
  (`Math.floor(pos±half)`). Isso só é exato pra caixa de pegada XZ cheia. O degrau
  da escada ocupa meia célula → o snap jogava o jogador ~0,65 bloco PRA TRÁS
  (bug-512, achado no playtest, não pelos testes). LIÇÃO: ao dar forma parcial a um
  bloco, revisar TODAS as resoluções de colisão (Y **e** X/Z) — `resolveVertical`
  existia, `resolveHoriz` faltava. Teste de regressão bom aqui é de TRAJETÓRIA
  ("nunca recua no eixo do movimento"), não só de posição final.
- Efeito colateral: um teste antigo ("sobe o degrau de uma escada") passava POR
  CAUSA do bug (o empurrão prendia o jogador perto da escada). Com o fix ele
  atravessava e caía. Teste que depende do bug é falso-verde: precisou de parede.

### Translucidez de bloco: material com blend, NÃO dither no atlas (2026-07-25)
- Vidro colorido foi feito com dither cutout (~40% dos pixels, alphaTest) pra
  evitar um material novo. Usuário reprovou no playtest: parece "tela de
  mosquiteiro", não vidro. Cutout serve pra recorte (folha, flor, moldura), NUNCA
  pra meia-transparência de superfície. Padrão certo neste projeto: grupo de
  índices próprio no mesher + material `transparent/opacity/depthWrite:false`
  (é o que a água já fazia). Bônus: mantendo o tile do atlas OPACO, o ícone 2D da
  hotbar (que copia o tile) sai sólido de graça.

### Constante de gen fazendo DOIS trabalhos quebra o bioma no dia que ela muda (2026-07-26)
- `SAND_HEIGHT` era ao mesmo tempo (a) a linha de praia e (b) o gate "não nasce mandacaru
  aqui". Ao criar o mar, amarrei praia = `NIVEL_MAR+1` → SAND_HEIGHT 18→23 → a caatinga baixa
  da seed de teste perdeu TODOS os cactos (bug-210, pego pelo `npm test`). Lição: quando uma
  constante de worldgen for reusada como gate de feature, reescrever o gate na intenção REAL
  (aqui: "cacto não nasce molhado" = `h > NIVEL_MAR`), não deixá-lo pendurado na constante.
- De quebra: densidade da caatinga era 1/96 → ~2 cactos no mundo M INTEIRO (bioma sem sua
  planta). Teste `expect(n).toBeGreaterThan(0)` que passa por 2 unidades é falso-verde
  esperando acontecer — subiu pra 1/16 (~5 nas colunas secas).

### Orçamento de trabalho por frame é em TEMPO, não em contagem (2026-07-26)
- `processarFila(meshPorFrame=8)` meshava 8 chunks/frame. Custo por chunk varia 0,1–3 ms
  (vazio × terreno cheio), então o mesmo "8" custava de 1 a 24 ms — origem direta dos 30-50
  frames >50 ms por 10 s nos perfis. Virou `meshMsPorFrame` (ms de orçamento, default 6),
  com teto duro de 64 chunks e garantia de PELO MENOS 1 chunk por frame (orçamento apertado
  não pode significar fila parada). Vale pra qualquer fila de trabalho pesado no loop.
- Setting renomeado de propósito (`meshPorFrame` → `meshMsPorFrame`): o valor salvo antigo
  seria lido como ms e mentiria. Config nova = default, e o perfil agora registra qual foi.

### Campo novo em struct alimentada POR FRAME tem que entrar em TODA chamada (2026-07-26)
- `hud.setRemesh({...})` roda 1× no startGame e 1×/FRAME no loop; `setRemesh` substitui o
  objeto inteiro. Adicionei `porCaminho` só na primeira → o frame seguinte apagava (bug-524).
  Typecheck não pega (campo opcional). Ao estender um "setter de estado" chamado em loop,
  `grep` por TODAS as chamadas antes de dar por feito — ou fazer o setter MESCLAR.

### Perfil sem CONTEXTO leva a conclusão errada (2026-07-26)
- Li "parado, 60 FPS travado" de um perfil que o usuário fez VOANDO — inferi o estado pela
  taxa de rede (106 B/s), que só dizia "streaming zerado". O perfil agora carrega `jogador`
  (pos/yaw/pitch/voando/noChao/chunk), `config` (raioRender, meshPorFrame, pixelRatioCap,
  fov — sem isso dois perfis não são comparáveis) e `gravacao.movimento` (estado, distância,
  velocidade, colunas novas, bytes) medido como DELTA na janela de 10 s.
- Regra geral: retrato de posição não diz se havia movimento. Métrica de estado precisa de
  acumulado + delta na janela, nunca de amostra instantânea.
- `?hud` na URL abre o F3 no boot (headless consegue conferir o painel de perfil).

### Varredura de mundo é POR CHUNK, nunca por bloco (2026-07-26)
- `TorchGlow.setFromWorld` fazia `for y/z/x` com `getBlock` no mundo INTEIRO. Custo medido:
  mundo P 77 ms, mundo **E 41,4 s de main thread travada** (1,887 bilhão de células) — no
  join e na troca de aula (bug-523, virou "página não está respondendo"). Trocando pra
  varredura por chunk (ausente sai em O(1), presente lê o `Uint8Array` direto): **2,9 ms**.
- Sintoma que denuncia isso num perfil: `longTasksMsTotal` quase IGUAL (~38 s) em sessões de
  duração bem diferente (234 s, 168 s, 96 s) = é sempre a MESMA trava, não regime.
- Toda estrutura visual derivada do mundo (halo de tocha, quadro, o que vier) precisa de
  três entradas em mundo lazy: varredura inicial (por chunk), **por COLUNA quando ela chega
  pelo streaming**, e descarte quando a coluna sai do raio — senão ou some ou vaza.

### Tela de espera tem que subir no COMANDO, não no resultado (2026-07-26)
- A §🕐 abria no `reloadWorld` (chegada do snapshot) — o FIM da fila. Entre o `/mundo
  carregar` e o snapshot o host salva, decodifica e monta a sessão nova; o aluno via jogo
  normal e depois uma tela "quase pronta" (bug-520). Regra: quando o trabalho é do SERVIDOR,
  ele avisa que começou (`mundo_trocando`) — não dá pra inferir isso no cliente.
- E não basta abrir: se o resultado chega no mesmo frame (medido: 1-2 ms depois), o
  navegador nunca PINTA a tela antes de travar no trabalho pesado. Segurar as mensagens por
  **2× requestAnimationFrame** (com `setTimeout` de segurança, porque aba em segundo plano
  não roda rAF) é o que faz a tela realmente aparecer primeiro.

### Troca de aula (cp19) é SESSÃO NOVA: todo estado por-jogador do servidor volta ao padrão (2026-07-26)
- `/mundo carregar` não muda a sessão: cria uma `GameSession` NOVA e `adotar`a os conectados.
  Tudo que o cliente tinha ANUNCIADO (raio de interesse via `radius`) morre com a sessão velha
  — `admitir` registra `raio: RAIO_PADRAO`. Cliente que não reanuncia fica com o mundo
  cortado no anel 6, e o `pedir_coluna` do §🔁 é RECUSADO lá fora (bug-518, achado lendo
  perfil do usuário; smoke `_smoke-troca-raio.mjs` prova). REGRA: estado por-jogador que o
  CLIENTE anuncia tem que ser reenviado no `reloadWorld`, não só no `connect`.
- Mesma família: qualquer trabalho caro guardado por `if (!mundoLazy)` no `startGame` precisa
  do MESMO guarda no caminho de troca (`trocarMundo` fazia `buildAll` em mundo lazy = 460 800
  remesh vazios, ~19 s de trava — bug-517).

### `--virtual-time-budget` ACELERA os timers: não medir tempo real por ele (2026-07-26)
- Screenshot com `--virtual-time-budget=3000` mostrou "tempo 58.0 s" na tela de carregamento
  (e disparou o botão de escape dos 20 s). O relógio virtual do Chrome corre solto entre
  frames — `performance.now()`/`setInterval` avançam MUITO mais que o orçamento. Serve pra
  conferir LAYOUT e valores derivados de contadores; qualquer conclusão sobre duração real
  (ETA, timeout, taxa por segundo) tem que sair de navegador de verdade.
- O binário do Chrome aqui NÃO está no PATH: usar
  `~/.cache/puppeteer/chrome/linux-<versão>/chrome-linux64/chrome` (`google-chrome` não existe;
  a versão do diretório muda — listar antes).

### Verificação headless a 1280×720 dá TELA CINZA intermitente (2026-07-26)
- Chrome headless + swiftshader: ~40% dos screenshots a 1280×720 saíram cinza (HTML estático
  do `index.html` visível, mundo não renderizado, PNG de 28 KB idêntico). A 800×450 foi 8/8.
  NÃO é TDZ nem bug do cliente — antes de caçar bug por tela cinza, repetir em resolução
  menor e comparar o TAMANHO do PNG (mundo renderizado ≈ 200 KB+; cinza ≈ 28 KB).

### NÃO confiar em "typecheck 0" do STATUS sem rodar (2026-07-23)
- STATUS.md da sessão 16 afirmava "VERDE: typecheck 0" mas a árvore tinha 3 erros
  em rules.ts (bug-490). Testes passavam (304) mas typecheck estava vermelho. LIÇÃO:
  antes de qualquer commit/push, RODAR `npm run typecheck` — o "verde" registrado no
  STATUS pode ser aspiracional ou de um estado que não foi o commitado.
- Causa técnica: `noUncheckedIndexedAccess: true` (tsconfig.base). Índice de array
  (`arr[i]`) tipa `T | undefined`. NUNCA usar `for (let i...)` + `arr[i]` em código
  novo neste repo — usar `for (const x of arr)` ou `for (const [i, x] of arr.entries())`
  (elemento não-undefined) e narrow (`?? default`) ao ler outro array por índice.
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

- [2026-07-20] Smoke do HOST — `pkill/pgrep -f '<padrão>'` casa o PRÓPRIO shell do
  comando quando o padrão está no cmdline dele (ex: `pgrep -f 'src/index.ts'` dentro de
  um comando cujo script menciona `src/index.ts` → mata o próprio shell, exit 130). Não
  use `-f` com um padrão presente no seu comando. Mate por PORTA (`lsof -ti tcp:PORT | xargs kill`)
  OU rode o server como JOB de background separado e mande o sinal de outro comando.
- [2026-07-20] Smoke do HOST: pra disparar o save de SIGINT do servidor,
  `tsx src/index.ts` roda em VÁRIOS processos (sh → node .bin/tsx → node --require
  --import). Só o node filho FINAL registra `process.on("SIGINT")`. `kill -INT <pid>`
  num wrapper NÃO grava. Use `pkill -INT -f 'index.ts'` (pega todos) e rode o server
  como JOB de background separado do shell — senão o SIGINT propaga pro próprio shell
  do comando e mata o teste antes de conferir o resultado.

- [2026-07-20] Novo state client-side indexado por POSIÇÃO (tipo QuadroRenderer)
  precisa entrar na lista de limpeza do `reloadWorld` (main.ts, cp19) — o
  servidor só reenvia mensagens "lista completa" (regions/objectives/quadros)
  quando o mundo NOVO tem conteúdo daquele tipo; mundo sem conteúdo não manda
  nada e o estado antigo fica fantasma na cena. bug-333: quadroRenderer ficou
  de fora do bloco de reset quando a feature foi codada (2026-07-19), só
  regions/objectives/groups foram lembrados. Checklist ao adicionar renderer
  novo indexado por posição: registrar em reloadWorld também.
- [2026-07-19] `Number(null) === 0` — param numérico OPCIONAL de URL exige
  checar `raw === null` ANTES de `Number(raw)`, senão a ausência vira 0 válido
  (bug-302: cliente sem ?hora travou o céu na meia-noite ignorando o servidor).
- [2026-07-19] Teste que quer "id de bloco inválido" usa 200, NUNCA `MAX+1`
  literal — cada append de bloco quebrava o assert (aconteceu 2× na mesma
  sessão: 71 virou tapete, 99 virou cama, 100 virou quadro).
- [2026-07-19] Bloco de código module-level em main.ts: declarar DEPOIS das
  consts que usa — `?yaw` referenciou `input` antes do `const input` e o módulo
  inteiro morreu em TDZ (tela cinza; bug-301). Screenshot headless pega.
- [2026-07-19] `pkill -f` no ambiente com hook rtk mata o próprio wrapper (exit
  144) e o servidor de stage SOBREVIVE segurando a porta — o restage seguinte
  fala com o servidor VELHO e o screenshot sai da cena antiga (idêntico byte a
  byte foi a pista). Matar por `fuser -k PORT/tcp` e conferir `ss -tln | grep
  PORT` ANTES de subir o novo. E `node --import tsx` resolve o tsx a partir do
  CWD — rodar da RAIZ do repo, nunca do scratchpad (ERR_MODULE_NOT_FOUND).
- [2026-07-19] `/bloco` RECUSA porta (criaria metade órfã) — script de stage
  que precisa de porta usa `place_block` de verdade (materializa as 2 células
  e exige alcance: mandar um `move` pro spawn antes).

- [2026-07-16] Adicionar uma mensagem à sequência de `admitir()` (join) QUEBRA os
  testes que contam/indexam mensagens do join. O `sendTime` do cp21 entrou depois
  do snapshot e derrubou 3 asserts em session.test.ts (join `toHaveLength(3)→4`;
  welcome saiu de sent[2]→sent[3]; sequência `["spawn","snapshot","teleport",
  "chat"]` ganhou "time"). Ao mexer no join, rode `npm test` e ajuste esses
  asserts — prefira FILTRAR por tipo (`.find(m=>m.type===...)`) a indexar posição.
- [2026-07-16] Smoke de valor que MUDA sozinho não usa igualdade exata. O
  primeiro `_smoke` de `time` assertou `hora===21` com o ciclo LIGADO — a hora já
  tinha avançado pra 21.00x quando o check rodou. Congele primeiro (`/ciclo
  desligar`) e então confira valor exato, ou use faixa. (Não era bug do produto.)

- [2026-07-13] Oclusão de face NÃO se decide pela transparência do bloco DONO da
  face — só pela do VIZINHO. A regra do cp18 ("pula se id é transparente ou
  vizinho é opaco") sumia com a face da folha colada no vidro (bug-167). Regra
  certa: `face aparece se vizinho == ar || (transparente(vizinho) && vizinho != id)`.
  Mesmo id encostado funde (vidraça contínua); ids transparentes diferentes
  emitem as DUAS faces coplanares — sem z-fight, porque o material é FrontSide e
  a face oposta vira backface.
- [2026-07-13] Modificador de movimento (sprint) NÃO pode sair direto do input:
  precisa de estado ENGATADO no PlayerState (bug-168). Ler `input.sprint` no
  passo dava turbo no ar. Padrão: engata com `onGround`, desengata ao soltar.

- [2026-07-10] NÃO usar código/assets do Minecraft ou Eaglercraft (Eaglercraft = port não
  licenciado). projeto.txt §9 rejeita software não licenciado. Copiar só o MODELO (voxel no
  navegador), com engine e assets próprios.
- [2026-07-10] Aba de navegador NÃO abre socket de escuta nem executa binário; WebAssembly
  NÃO contorna (roda no sandbox). "Abrir pra LAN" é papel do HOST (.exe/servidor Node),
  não do aluno. Não prometer cliente-web que vira servidor-web.
- [2026-07-10] Não escrever "relatório de aplicação" antes do piloto real acontecer.
- [2026-07-11] Parâmetro de função com default vindo de objeto `as const` infere TIPO LITERAL
  (ex.: `yEnd = ATLAS.tilePx` vira tipo `16` e rejeita outros valores). Sempre anotar:
  `yEnd: number = ATLAS.tilePx`. (bug-001)
- [2026-07-11] Com `noUncheckedIndexedAccess`, indexação de Uint8Array/array devolve
  `T | undefined` — usar `?? fallback` (ex.: `?? BlockId.Air`) em vez de `!` nos acessos a chunk.
- [2026-07-11] NUNCA rodar sed/normalização em `git ls-files` sem excluir binários — corrompeu
  o PDF do projeto (restaurado do index). Filtrar por extensão ou usar `git grep -Il ''` (só texto).
- [2026-07-11] Saída de git via rtk é comprimida/cacheada — `git status` pode mentir. Verdade:
  `git diff --numstat` / `git diff-index HEAD --` / `git hash-object <arq>` vs `git ls-files -s`.
- [2026-07-11] NÃO usar `fuser -k` cego em porta compartilhada (8080/5173): matei o
  `npm run dev:server` do USUÁRIO achando que era o meu processo de fundo. Antes de matar,
  conferir dono: `ps -o pid,cmd -p $(fuser 8080/tcp 2>/dev/null)` ou guardar o PID do
  processo que EU iniciei e matar só ele.
- [2026-07-11] Não recalcular valores do terreno pristino (spawn etc.) no join ou no cliente
  a partir do snapshot — mundo/snapshot podem estar modificados (bug-010). Calcular na
  criação do mundo e transmitir pelo protocolo.
- [2026-07-11] `Buffer.buffer` do Node é o POOL compartilhado (byteOffset ≠ 0 em
  readFileSync) — pra virar ArrayBuffer: `raw.buffer.slice(raw.byteOffset,
  raw.byteOffset + raw.byteLength)`. Passar `.buffer` direto lê lixo de outros buffers.
- [2026-07-11] /shared (lib ES2022 pura) não declara TextEncoder/TextDecoder (existem
  em runtime nos 3 hospedeiros) — usar `declare class` ambiente mínima no arquivo que
  precisa (save.ts), NÃO adicionar lib DOM ao tsconfig (quebraria a pureza).
- [2026-07-12] `npm run dev`/`dev:server` via Bash background do Claude morre com
  exit 143 e log VAZIO (atrito npm+rtk+wrapper de background). Subir direto:
  `cd server && nohup npx tsx src/index.ts > log 2>&1 &` e conferir porta com
  `ss -tln`. Vite pode pular pra 5174 se 5173 estiver ocupada — sempre verificar
  a porta real antes de passar URL ao usuário.
- [2026-07-13] Variável de módulo usada por função chamada NO BOOT precisa ser
  declarada ANTES do primeiro call site, não só do ponto de uso: `let activePanel`
  no meio do main.ts + `updateOverlay()` no boot = TDZ ReferenceError e tela
  cinza (bug-151). Vitest/typecheck NÃO pegam — só rodar a página pega.
- [2026-07-13] Matar servidor de fundo iniciado com `nohup npx tsx &`: o PID do
  `$!` é o wrapper npx — o node filho segue vivo segurando a porta (bug-092).
  Achar o dono REAL com `ss -tlnp | grep PORTA` e matar esse PID (SIGINT no host
  Node = salva antes de sair).
- [2026-07-17] Smoke do HOST Node sem `LJ_SAVE` grava/sobrescreve o
  `server/world.ljw` RASTREADO (save-default do host, versionado no commit de
  sync casa↔escola) — poluiu o arquivo e depois `rm` deu `D` no git. Ao subir o
  host pra teste/screenshot, SEMPRE passar `LJ_SAVE=<scratchpad>/teste.ljw` (e
  LJ_PORT próprio). Se já poluiu: `git checkout -- server/world.ljw`.
- [2026-07-13] Smoke `.mts` no scratchpad: rodar `node --import tsx script.mts`
  com CWD no repo (tsx resolve de node_modules do projeto); do scratchpad dá
  ERR_MODULE_NOT_FOUND. Import de /shared por caminho absoluto continua valendo.

## Key Learnings — perfilação comparável (2026-07-26, sessão 26)

- **Modo `?bench` (`client/src/bench.ts`) é como se compara MÁQUINA com máquina.**
  Abre mundo de seed fixa sem menu, teleporta, voa trajeto fixo, exporta sozinho.
  Antes disso todo perfil dependia de a pessoa voar igual nos dois PCs — e não voa.
  `npm run bench:headless` roda o mesmo caminho num Chrome headless por CDP.
- **Trajeto de benchmark é `pos = f(t)`, NUNCA integração por frame.** Com
  `pos += v·dt` a máquina lenta percorre menos terreno e ganha FPS de graça: o
  teste premiaria justamente o PC ruim. E a velocidade é constante FIXA (18 b/s),
  não "uma volta no tempo disponível" — senão `?bench=60` seria mais leve que
  `?bench=30` e os dois números não comparariam.
- **Benchmark tem que sobrescrever a config do navegador (em memória, sem salvar).**
  `raioRender`/`meshMsPorFrame`/`pixelRatioCap`/`fov` moram no localStorage de cada
  PC; sem travar isso o "PC do lab está lento" pode ser só raio 12 contra raio 6.
- **Teleporte contamina telemetria acumulada.** Todo salto (ir pro início do
  trajeto, voltar pro ponto de partida na troca de fase) entra em
  `distanciaPercorrida` e dispara rajada de streaming. Ao teleportar de propósito,
  sincronizar `posAnt*` na hora e nunca voltar pro início no meio da medição
  (bug-525).
- **Percentil esconde a FORMA — exportar histograma junto.** p95 igual pode ser
  "tudo em 20 ms" ou "metade em 10 e metade em 40" (bimodal): problemas diferentes.
- **Campo novo em mensagem do servidor entra OPCIONAL no `parseServerMessage`.**
  Host de versão antiga não manda; se o parse exigir, o cliente descarta a mensagem
  INTEIRA (perderia `tickAvgMs` por causa de um número de diagnóstico).
- **Tempo de GPU (`EXT_disjoint_timer_query_webgl2`) não é verificável headless:**
  SwiftShader nem expõe a extensão (conferido). Por isso o caminho inteiro vive em
  try/catch que DESLIGA a medição — perfilação não pode derrubar o loop de render.
  Uma consulta `TIME_ELAPSED_EXT` por vez; o resultado chega alguns frames depois.
- **O `?bench` foi VALIDADO como instrumento (2026-07-27):** duas rodadas na mesma
  máquina deram p50/p95 idênticos, distância e colunas novas iguais e **draw calls
  e triângulos idênticos** (mesmo terreno nos mesmos instantes); remesh, GPU e carga
  variaram 0,6–2,7%. **Ruído ≈ 1–2%** — diferença acima disso entre PCs é sinal.
  Sem essa checagem de repetibilidade, o número do lab seria anedota.
- **Perfil do bench entra pelo HOST por `POST /perfil`, não por WebSocket.** O bench
  roda em singleplayer (Web Worker): não há socket. A página vem do host, então o
  POST de mesma origem grava em `profiles/` (`server/src/perfis.ts`, prefixo
  `perf-bench-` quando o payload tem `meta.bench`). Sem host, cai no download.
- **Verificação headless que precisa LER dado (não olhar pixel) = CDP.** Chrome com
  `--remote-debugging-port`, `fetch /json/list`, WebSocket global do Node, e
  `Runtime.evaluate` lendo uma variável que o cliente publica (`window.__benchPerfil`).
  Zero dependência nova. Screenshot só serve pra tela; número sai por aqui.

## Key Learnings — material de apresentação (2026-07-27, sessão 29)

- **A máquina não tem PIL, imagemagick, ffmpeg nem pandoc/libreoffice.** Pra converter
  imagem, o Chrome do puppeteer serve: página com o `<img>` em tamanho fixo +
  `Page.captureScreenshot { format:"jpeg", quality }` devolve o base64 direto na
  resposta CDP (sem arquivo intermediário). 2 MB de PNG → 473 KB de JPEG.
  Receita em `scratchpad/png2jpg.mjs` da sessão 29.
  ⚠️ Dois detalhes que custaram uma rodada cada: (1) a página tem de ser ARQUIVO
  (`file://…html`) — de `data:` URL a origem é opaca e o `file://` da imagem não
  carrega, o screenshot sai preto (todos com o mesmo tamanho, foi o sintoma);
  (2) `overflow:hidden` no html/body, senão as barras de rolagem entram na captura.
- **HTML autocontido com base64: guardar os data URI num mapa `IMGS` no `<script>`
  e usar `<img data-img="chave">`.** Com 100 KB de base64 no meio do corpo, nenhuma
  busca de texto casa em volta da imagem e o arquivo fica ineditável por Edit.
  Continua autocontido — só muda de lugar.
- **`registros/prints/06-hud-f3.png` NÃO vai em material de divulgação:** foi capturado
  em render de software e mostra `FPS 8` na tela. Num slide que afirma que os aparelhos
  da escola dão conta, a imagem contradiz o texto no projetor. (O README dos prints já
  avisava; o aviso foi lido tarde.)

## Key Learnings — vento e vida ambiental (2026-07-27, sessão 28)

- **Tile direcional num cubo precisa de escolha POR FACE, não por célula.** O
  tile é uma imagem de 2 eixos e cada face amarra esses eixos a direções de mundo
  diferentes: no topo u/v seguem x/z; na face de baixo seguem x/z invertidos; nas
  LATERAIS um dos eixos é o VERTICAL. Um tile só pra célula sai certo no topo e
  torto no resto. `FACE_BASES` (derivado de FACES, não escrito à mão) dá o eixo
  de mundo de u e de v por face; projetar a direção desejada nele resolve.
- **Rotação fixa por face NÃO conserta tile direcional** — parece que sim quando
  se testa uma direção só. Prova numérica: com fluxo pro NORTE as 4 laterais
  mostram a onda descendo; com fluxo pro LESTE elas já mostram horizontal.
  Nenhuma rotação constante acerta os dois. Quando um relato de playtest vier em
  forma de "rotaciona 90 aqui, 180 ali", DERIVAR a tabela numericamente antes de
  aplicar: pode ser sintoma de um mapeamento faltando, não de um offset.
- **Animação de tile do atlas: `putImageData`, não `fillRect` por pixel.** A
  versão antiga montava uma string `rgb(r,g,b)` e trocava o `fillStyle` a cada
  pixel — 256 strings alocadas e reparseadas por repintura. Com os 9 tiles de
  água da regra de correnteza seriam 2 304. Escrever no buffer e mandar UM
  `putImageData` por retângulo contíguo é ordens de grandeza mais barato — e por
  isso os tiles de um mesmo grupo animado precisam ficar contíguos numa LINHA.
- **Tiles animados irmãos precisam do MESMO salt de ruído.** Os 9 tiles de água
  compartilham `AGUA_SALT`; se cada um usasse o próprio índice, o grão mudaria
  junto com a direção e a água "piscaria" de padrão ao trocar de setor.
- **`texture.needsUpdate` reenvia o atlas INTEIRO** (256² = 262 KB), não só o
  tile mexido. Logo o que importa é a TAXA de repintura, não quantos tiles se
  repintou. Dois relógios independentes somam taxas — daí o teto de 12/s.
- **Teste que compara `.a` de um par interpolado é frágil.** `ondaAguaDoVento`
  faz `floor` + mistura (precisa do par pro crossfade) e `setorDaDirecao` faz
  `round`; na fronteira exata de setor o float cai em `mistura ≈ 1`, então a onda
  EFETIVA é a certa e a `.a` não. Asserção tem de olhar o vizinho mais pesado.

- **Bloco NOVO toca 9 lugares.** Checklist que a grama alta cobrou (bug-530):
  (1) `BlockId`, (2) **`MAX_BLOCK_ID`** ← o esquecido, (3) `TILE`, (4) `paint*` no
  atlas, (5) `BLOCK_TILES` (só pro ícone 2D da hotbar), (6) forma no `emitShape`,
  (7) helpers de `blocks.ts` (`isFullCube`/`isSolidBlock`/`precisaApoio`/
  `isReplaceable`), (8) `blocksUi`, (9) `worldgen`. Pular o (2) faz o bloco
  aparecer no inventário e o servidor recusar o place.
- **Convenção de UV do topo do bloco: `u = 1 − x`, `v = z`** (FACES/FACE_UVS do
  mesher). Com o canvas 2D tendo y pra baixo, o canvas do atlas anda ao
  CONTRÁRIO do mundo nos DOIS eixos. Qualquer animação de textura que precise
  seguir uma direção de mundo (correnteza) tem de negar os dois. Travado em
  `ondaAguaDoVento` + teste de sinal em `vento.test.ts`.
- **Onda de textura tem de ter vetor INTEIRO** pra fechar no tile de 16 px. Um
  `sin((x+y)*0.9)` não fecha e mostra costura de bloco pra bloco. Por isso a
  direção da água vive em 8 setores, e a virada entre setores é apagada
  interpolando os dois vizinhos (senão dá "pop" a cada ~37 s de giro).
- **`onBeforeCompile` > ShaderMaterial** pra enxertar efeito no terreno: o
  material continua MeshLambertMaterial de verdade (luz, névoa, cutout, sombra
  do three seguem funcionando) e o enxerto é um `replace` em `#include
  <begin_vertex>`. Uniforms compartilhados por objeto literal — atualizar o
  `.value` 1×/frame não recompila nada.
- **Balanço de folha precisa de frequência ESPACIAL baixa** (0,16 rad/bloco).
  Blocos de folha vizinhos são cubos independentes: se cada um se deslocar
  diferente, a copa abre fresta. A 0,16 o desencontro entre vizinhos fica em
  ~0,2 px de tela.
- **Atributo por vértice do mesher atravessa 5 arquivos**: `ChunkGeometry` →
  `meshVizinhanca` (empurrar em PARALELO a `positions`) → `meshWorker` (incluir
  na lista de transfer!) → `ResultadoMesh` → `chunks.aplicar` + a constante
  `VAZIA`. Esquecer o transfer não quebra typecheck — copia em vez de mover.
- **Teste de "não mudou" compara com o valor ANTERIOR, nunca com constante**
  (bug-531): `expect(x).toBe(BlockId.Air)` quebrou sozinho quando o worldgen
  passou a espalhar capim naquela célula. `const antes = get(); … toBe(antes)`.
- **Verificação visual headless funciona com `?bench` + CDP.** `?bench` entra no
  mundo SEM menu e sem servidor; o script CDP navega, espera em segundos reais e
  chama `Page.captureScreenshot`. Pra ver o jogo e não o HUD: esconder todo filho
  de `<body>` que não seja `CANVAS` (o HUD deste projeto mora no index.html, não
  tem id/classe caçável). Molde em `scripts/bench-headless.mjs`.

## Decision Log

- [2026-07-27] **Repo PÚBLICO + licença source-available** (decisão do usuário, sessão 29).
  `github.com/meketreve/logica-em-jogo` é público. Regra que ele pediu: *"livre uso nas
  escolas, mas modificações devem passar por mim"* → `LICENSE` em pt-BR: usar/rodar/
  redistribuir INALTERADO é livre pra qualquer instituição de ensino; distribuir código
  modificado, republicar sem autoria e uso comercial exigem autorização escrita. **Cenário
  feito por professor é DELE** (a licença não reivindica os `.ljw` de autoria) e modificar a
  própria cópia é livre — o que trava é distribuir. Não é OSI: GitHub marca "licença não
  reconhecida", e é esperado. Consequência prática pro auto-update: clone da escola puxa sem
  credencial.
- [2026-07-27] **Apelidos de aluno no HISTÓRICO do git: o usuário decidiu deixar** ("não tem
  problema"). A árvore atual foi limpa (`e49aa15`), o histórico NÃO. Não reabrir; não propor
  `filter-repo` de novo. Ao escrever qualquer coisa NOVA em arquivo versionado, seguir sem
  nome de aluno — a régua é a do relatório, que afirma anonimização.
- [2026-07-27] **Água CORRENTE segue o fluxo; água PARADA segue o vento** (playtest).
  Uma regra só resolve os dois casos, sem flag nova: o mesher tira o fluxo do
  GRADIENTE DE NÍVEL na vizinhança (só vizinho de água conta — contar ar faria a
  borda de todo lago escorrer pra fora). Mar/lago é tudo FONTE (nível 8) →
  gradiente zero → parada → vento. Riacho é 8→7→6→… → gradiente aponta pra
  jusante → fluxo. Implementado como 8 TILES de atlas (um por setor) escolhidos
  pelo mesher, não como atributo de vértice: mantém o mesher função pura de bytes
  e não mexe em material. Os 8 têm de ficar contíguos numa linha do atlas.
- [2026-07-27] **Vento é SÓ visual e server-autoritativo**, função pura de
  `tickCount` + seed (molde do `horaDoDia`, não do relógio de parede). Não empurra
  jogador, não entra na física. `/vento` só LIGA/DESLIGA — o usuário recusou
  ajuste manual de direção/força: "apenas comando para ativar e desativar". Nasce
  LIGADO (é ambiência, não regra de atividade) e só o DESLIGADO vai pro save.
- [2026-07-27] **Nuvens = UM plano com textura de alpha, não volumes.** O teto
  desta fase é GPU (p95 16,8–19,6 ms contra 16,7 ms de orçamento no notebook do
  lab), e volume seria overdraw transparente em cima disso. `alphaTest: 0.02`
  corta os buracos entre nuvens antes do blend. Nuvens e balanço têm chave em
  Configurações, na seção de DESEMPENHO — não de "gráficos bonitos".

- [2026-07-26] **`buglog.auto_detect: false`** em `.wolf/config.json`. O detector
  automático gerava falso positivo (ex.: "pURO should be PURO" virou bug) e poluía
  `buglog.md` — justamente o índice que serve pra achar bug de verdade. Log manual
  pelo protocolo continua obrigatório; o sinal bom vem de lá.
- [2026-07-26] **`anatomy.rescan_interval_hours: 6 → 168`**. O ritmo real de
  criar/apagar arquivo é ~1× por sessão, não 4× por dia; o "stale" no boot virou
  alarme falso ignorado. Rodar `openwolf scan` à mão quando arquivo nascer/morrer.
- [2026-07-26] **`npm run verify` + `npm run smoke` são o caminho oficial de
  verificação.** Antes: typecheck, teste, build e cada smoke eram 4+ invocações
  lembradas de cabeça, e os smokes exigiam ler o comentário do cabeçalho pra
  montar a env à mão. Agora `verify` = typecheck(3 pacotes) + testes(shared) +
  build(client); `smoke` = runner com manifesto. Motivo: metade do Do-Not-Repeat
  deste projeto é sobre o APARATO de teste, não sobre o código.

## Key Learnings — verificação (2026-07-26)

- **Runner dos smokes: `scripts/smoke.mjs`.** O manifesto no topo é a fonte da
  verdade (mundo, env, porta, o que cada um prova). `npm run smoke -- --lista`
  diz o que cada cenário prova SEM abrir os arquivos — use isso antes de ler
  qualquer `_smoke-*.mjs`. `--rapido` pula os de mundo E. Suíte inteira: ~38 s.
- **Porta própria por cenário (8091–8096).** A 8080 fica livre pro dev server do
  usuário — já derrubei o servidor dele matando processo na porta compartilhada.
- **`git bisect run npm run smoke -- <nome>`** funciona: cada cenário sobe o
  próprio host, sai 0/1 e limpa tudo. É o jeito barato de achar QUANDO quebrou,
  em vez de eu ler diff.
- **Convenção de log (já 100% consistente no código, nunca estava escrita):**
  server prefixa TUDO com `[server]`; client usa tag por subsistema —
  `[mesh]`, `[conn]`, `[streaming]`, `[input]`. O gerador de cenários
  (`gerar.ts`) é CLI de usuário e por isso NÃO leva tag. Ao adicionar log novo,
  siga isso: é o que transforma investigação em `grep` em vez de leitura.
- **`LJ_SEED` fixa o terreno**; sem ela cada mundo novo sorteia e smoke vira
  loteria. O runner usa `LJ_SEED=20260726` em todo cenário de mundo novo.
- **`LJ_SAVE=cenarios/<aula>.ljw` é SEGURO.** `paths.ts` trata `cenarios/` como
  MODELO somente-leitura e grava a cópia viva em `mundos/` (gitignored). Não
  confundir com rodar SEM `LJ_SAVE`, que aí sim escreve em `world.ljw` versionado.

### [2026-07-26] Perfil do lab (Intel UHD 630) — o que a comparação com o dev ensinou

- **Trabalho de render IDÊNTICO entre máquinas não significa custo idêntico.** O bench do lab
  fechou com `drawCalls` 633 e `triangles` 188 048 exatamente iguais aos do PC de dev (mesma
  seed, mesmo trajeto determinístico) e mesmo assim a GPU custou 14,6 ms contra 4,2 ms. Ou
  seja: quando os contadores de geometria batem e o tempo não, o gargalo é a MÁQUINA, não a
  cena — greedy meshing (que ataca triângulos/draw calls) não compra nada nesse caso.
- **`carga.fasesMs` separa rede de CPU sem instrumentação nova.** `mundo` igual (2,3–2,5 s
  nas duas máquinas) + `malha` 7× maior no lab = o problema é CPU de meshing, não rede nem
  worldgen. Sempre ler essas duas fases juntas antes de culpar a rede.
- **`carga.totalMs` sozinho engana.** Duas rodadas na mesma máquina deram 16,5 s e 12,9 s,
  mas o `remeshTotalMs` foi o mesmo (−1,2%): o que mudou foi ONDE o "pronto" disparou, que
  empurra meshing pra dentro do bench. Comparar sempre `remeshTotalMs`/`remeshCount` junto.
- **`EXT_disjoint_timer_query_webgl2` existe no driver Intel/ANGLE D3D11** (240 amostras) e
  NÃO existe no SwiftShader do headless. O caminho de GPU do perfilador só se valida em
  hardware real — não tentar validá-lo por CDP headless de novo.
- **Comparar GPU com o frametime é o teste de "é render?"**: 14,6 ms de GPU num frame de
  20,4 ms = 72% → o teto de FPS é a GPU, e nenhum ganho de main thread atravessa esse teto.

### [2026-07-26] Mesher em Web Worker — decisões e armadilhas

- **A vizinhança padded é o que torna o Worker barato.** Copiar os 27 chunks vizinhos seriam
  110 kB por job; a casca de 1 bloco cabe num cubo 18³ = 5,8 kB, porque TODO acesso do mesher
  está em `[-1..CHUNK_SIZE]`. Antes de refatorar, o jeito de provar isso foi `grep getBlock`
  no mesher e conferir offset por offset — e o typecheck fecha a prova, já que `world` deixa
  de existir dentro do núcleo e qualquer acesso esquecido vira erro de compilação.
- **Pool com 1 job por worker é PIOR que síncrono.** A main thread só alimenta 1×/frame
  (~16 ms) e um chunk custa ~3,5 ms → o worker dormiria 80% do tempo. Profundidade 8.
- **Assíncrono exige versão por chunk.** Resultado que volta depois de `descartarColuna`,
  `trocarMundo` ou uma edição do jogador tem que ser DESCARTADO, senão recria mesh de coluna
  já descartada. Versão monotônica + `versaoAtual.delete(key)` no descarte.
- **Gate de tela de carga é um contrato escondido.** `main.ts` fecha a §🕐 em
  `filaPendente === 0`; com pool isso PRECISA somar em-voo + prontos-não-aplicados. Antes de
  tornar algo assíncrono, procurar quem lê o tamanho da fila como "acabou".
- **Worker que morre trava a tela de carga pra sempre** (fila nunca zera). `onerror` →
  colapsa o pool, devolve os jobs em voo pra fila, segue síncrono.
- **Teste de perf precisa de testemunha de correção.** O A/B do headless só vale porque o
  script passou a imprimir `draw calls`/`triângulos`/`fila no fim`: uma fila que zera sem
  produzir geometria pareceria uma vitória enorme. Sempre medir "quanto trabalho SAIU" junto
  com "quanto tempo levou".
- **Headless SwiftShader distorce A/B de orçamento por frame.** A 8–10 fps, um orçamento de
  6 ms/frame vira 60 ms/s de meshing (contra 300 ms/s a 50 fps) — o caminho síncrono nem
  termina de carregar. Serve pra ENCANAMENTO e pra razões por chunk; não pra o ganho de FPS.

### [2026-07-27] Mover trabalho pra Worker TIRA O FREIO junto — a lição da sessão

- **Todo caminho síncrono com orçamento por frame tem DOIS papéis: fazer o trabalho e
  LIMITAR o trabalho.** `meshMsPorFrame: 6` não era só "não estoure o frame", era também
  "meshing nunca passa de ~30% de um núcleo" e "a fila lenta funde re-entradas do mesmo
  chunk". Ao mover o mesher pro Worker eu levei o primeiro papel e deixei os dois outros pra
  trás — carga caiu 55% e o FPS de jogo caiu de 50 pra 36. Antes de paralelizar algo que
  tinha orçamento, listar o que o orçamento limitava ALÉM do tempo.
- **Fila lenta é um coalescedor.** `enfileirarColuna` reenfileira as 4 colunas vizinhas; com
  a fila lenta o `filaSet` fundia isso de graça. Fila rápida = +45% de jobs, e os extras são
  jogados fora por versão vencida. Dedup precisa cobrir "em voo", não só "na fila".
- **Oversubscription de núcleo aparece na GPU, não só na CPU.** 4 workers a plena carga num
  i5 de 4 núcleos físicos empurraram a GPU de 13,6 → 15,1 ms: a thread do driver D3D11 também
  disputa núcleo. Se o tempo de GPU sobe sem a cena mudar, suspeitar de contenção de CPU.
- **Throttle por FASE, não global.** Durante a tela de carga não existe frame pra proteger →
  pool solto. No jogo existe → pool raso. A mesma peça quer políticas opostas nas duas fases.
- **Não calibrar knob de paralelismo em headless.** SwiftShader roda a 8–16 fps; como a vazão
  do pool escala com o FPS, profundidade 1 deixou 91 chunks pendentes lá e seria ampla no lab
  a 50 fps. Headless decide ENCANAMENTO e razões por chunk; número de tuning sai da máquina
  que dói — daí `?meshdepth=N` em vez de eu escolher no escuro.

### [2026-07-27] O aviso "no semantic summary" do OpenWolf era bug, não descuido

`countSemanticEntries` (`src/hooks/shared.ts`) contava só linha começando com
`| YYYY-MM-DD`, mas NADA escreve nesse formato: o template `OPENWOLF.md`, o texto do próprio
aviso e as linhas que o hook grava usam `| HH:MM |`, e a sessão é delimitada por
`## Session: YYYY-MM-DD HH:MM`. Resultado: contagem sempre 0 e o "ACTION REQUIRED" repetindo
a cada stop, sem jeito de satisfazer seguindo as instruções dele mesmo.

- **Corrigido localmente** em `~/.local/share/pnpm/global/.../openwolf/dist/hooks/shared.js`
  (a edição quebrou o hardlink, o store do pnpm ficou intacto). ⚠️ `pnpm update -g openwolf`
  sobrescreve; backup do original ficou no scratchpad da sessão.
- **PR upstream: [cytostack/openwolf#64](https://github.com/cytostack/openwolf/pull/64)**
  (branch `fix/semantic-summary-detection` no fork `meketreve/openwolf`).
- **Lição de método:** aviso de hook que repete mesmo depois de cumprido é suspeito de
  detector inconsistente com a própria instrução. Ler o código do hook custou 3 comandos e
  poupou repetir a mesma ação em loop. Antes de "cumprir mais uma vez", conferir o que o
  detector realmente procura.

### [2026-07-27] Fechando o knob do mesher — três lições que valem além deste caso

- **A variável do experimento tem que sair no resultado.** Pedi um A/B de `?meshdepth` sem
  gravar `meshdepth` no perfil (bug-529). As 6 rodadas do lab só foram atribuíveis porque o
  usuário lembrava a ordem. Regra: antes de pedir uma medição com knob, conferir que o knob
  aparece no artefato de saída.
- **Modo economia de bateria trava o notebook em 30 FPS** (`p50 = 33,3 ms` cravado nas três
  rodadas, GPU ~28% mais cara). É vsync por política de energia, não carga — e nenhum perfil
  medido nesse estado serve pra comparar otimização. Ao ler um perfil, `p50` colado em 33,3 /
  16,7 / 8,3 ms é REFRESH, não gargalo: procurar o estado da máquina antes de otimizar.
- **Freio mais apertado pode fazer MENOS trabalho total, não mais.** Profundidade 1 gastou
  13 738 ms de worker contra 16 036 do 4: com a fila drenando devagar, o `filaSet` funde mais
  re-entradas do mesmo chunk antes de virarem job. Quando uma fila também COALESCE, acelerá-la
  aumenta o trabalho — contra-intuitivo e foi o que custou 14 FPS na primeira versão.
- **Primeira rodada de um lote é suspeita.** Nos dois lotes o primeiro perfil destoou (FPS 42
  contra 47-50; worker 20 958 contra ~32 000): aquecimento, compilação de shader, saída de
  throttle. Descartar ou repetir a primeira antes de comparar.
