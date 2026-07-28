# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.
> **SESSÃO 32 (2026-07-28) — §💡 LUZ VOXEL COMPLETA E §🏔️ CAVERNAS. Dois commits,
> tudo verde.** A fase da fila era "v2 da geração"; o portão de produto que o escopo tinha
> deixado aberto era a luz, e **o usuário escolheu luz COMPLETA (céu + tocha) ANTES de
> escavar** — mais a decisão da água: **caverna seca mesmo abaixo do mar**, com casca fina
> de pedra separando (quem furar o teto depois deixa o mar entrar).
>
> **A escolha de arquitetura que mudou o tamanho da obra:** o cardápio dizia que luz completa
> "mexe no tick do servidor e no protocolo". **Não mexeu em nenhum dos dois.** Luz é função
> pura dos BYTES do mundo e o cliente já tem os bytes — então a grade de luz mora 100% no
> cliente, e dois clientes chegam na mesma luz sozinhos. Zero mensagem nova, zero cirurgia no
> `session.ts` (137 KB).
>
> **O que foi construído:** `shared/src/luz.ts` (motor PURO, 1 byte/célula, céu e tocha em
> dois nibbles, BFS com a regra da descida reta, incremental no `atualizarBloco`) ·
> atributo `luz` por vértice no mesher · shader encadeado no `onBeforeCompile` do §🌬️ ·
> fila de luz com orçamento por frame ANTES do mesher · cavernas por interseção de dois
> ruídos 3D, função pura de `(x,y,z,h,seed)`.
>
> **Três medições que mudaram decisão** (nenhuma delas óbvia lendo o código):
> 1. **Acender coluna custava 18,4 ms** — mais que meshar a coluna inteira, e na main
>    thread. A BFS enfileirava as ~32 mil células de céu, quase todas em céu aberto cercadas
>    de céu aberto. Enfileirando só a BANDA rente ao relevo: **2,48 ms** (1,87 no navegador).
> 2. **Ruído de caverna célula a célula levou o worldgen de 2,63 a 28,61 ms/coluna** (10,9×)
>    e **derrubou o smoke `pedir-coluna`**. Amortizando o ruído por FATIA: **3,49 ms**, com
>    mundo gerado byte a byte idêntico (há teste comparando os dois caminhos).
> 3. **A densidade de caverna varia 2,9%–7,3% conforme a SEED** — e a seed do `?bench` é das
>    mais vazias. Calibrar por ela teria entregado o dobro do pretendido. O teste mede a
>    média de 5 seeds.
>
> **Verificação nova: `npm run shots:luz`.** Compara a MESMA cena do `?bench` ao meio-dia e
> à meia-noite e mede luminância. Pega os DOIS jeitos de a luz falhar calada: shader que não
> compila (tudo preto) e shader que compila sem fazer nada (as duas horas iguais). 5/5,
> noite/dia = 0,48. ⚠️ A 1ª versão dela mediu 0,0 nas duas horas e **passou mesmo assim**
> (bug-540): `drawImage` de canvas WebGL fora do frame devolve preto, e 0/0 satisfaz a razão.
> Agora decodifica o PNG do CDP e checa âncoras absolutas junto da razão.
>
> **VERDE:** typecheck 3/3 · **388 testes** (30 novos) · build · 6/6 smokes · 5/5 na luz.
> **Playtest do usuário PENDENTE** — headless não diz se caverna escura é *divertida*, nem se
> o piso de 0,05 de brilho deixa andar lá dentro sem tocha.
> **SESSÃO 31 (2026-07-27) — LAYOUTS MOBILE, 1ª RODADA: MENU + INVENTÁRIO/HOTBAR + CHAT/HUD.**
> Escopo escolhido pelo usuário na entrevista: essas três telas (painéis de AUTORIA ficaram de
> fora) e régua **"os dois, Fire manda"** — 1024×600 paisagem manda, tablet maior herda.
> **Celular foi RECUSADO** por ele; não desenhar pra ~640×360 sem pedido.
>
> **O ponto de partida era pior do que parecia:** `client/index.html` (que guarda TODO o CSS da
> UI) tinha **`@media` = 0**. Nenhum breakpoint existia. O que já funcionava em tela pequena era
> acidente de `min(920px, 92vw)`, e o `settings.uiScale` escalava **só** joystick/botões do
> `touch.ts` — HUD, hotbar, inventário e chat eram px fixo.
>
> **Os 5 defeitos reais consertados** (nenhum deles óbvio na leitura do CSS):
> 1. **Painel mais alto que a janela sumia pra CIMA** — `#menu`/`#overlay` são flex
>    `align-items:center`, e item que estoura não rola até o topo. Em 600px isso pegava "Meus
>    mundos" e configurações. Agora o painel se cabe sozinho (`max-height` + `overflow-y`).
> 2. **`box-sizing` é content-box neste projeto** (bug-538): o `max-height` novo errava pela
>    soma exata de padding+borda (580+32+2 = 614 numa janela de 600). `border-box` nas duas
>    regras novas — os painéis de altura FIXA ficaram como estavam de propósito (o 560px foi
>    ajustado a olho em playtest de 2026-07-20).
> 3. **No toque não havia como trocar de bloco sem abrir o inventário** — `#hotbar` era
>    `pointer-events:none` e tablet não tem 1–9 nem scroll. Agora tapa no slot escolhe; só a
>    faixa `.slots` recebe o dedo (o resto deixa o arrasto de olhar chegar no `#touch-look`).
> 4. **Teclado virtual cobria o campo do chat** — `visualViewport` é a única fonte que sabe
>    disso (`window.innerHeight` NÃO muda quando o teclado abre). `chat.ts` publica a altura
>    escondida em `--kb` e o CSS soma no `bottom`.
> 5. **Log do chat caía sobre a hotbar** (bug-539) e `#hud`/`#objetivos` colidiam com o
>    `#touch-topo`. Ambos reposicionados em `(pointer: coarse)`.
>
> **A jogada que mais rendeu:** a 3ª media query, `(min-width:700px) and (max-height:700px)` =
> paisagem baixa. Ali **sobra largura e falta altura**, então o certo é **alargar** (menu
> 460→680, inventário 580→760), não quebrar linha em duas. Isso devolveu as 6 abas do
> inventário numa linha só, 9 colunas de bloco e tirou o nome do mundo do truncamento "seq…".
>
> **Verificação nova: `npm run shots:tablet`** (`scripts/tablet-shots.mjs`). Layout de tela
> pequena não tem teste unitário, mas tem pergunta binária: mede `getBoundingClientRect` contra
> a janela ("cabe / ESTOURA"), o menor alvo tocável (piso 40px) e a intersecção chat × hotbar —
> e salva o print do lado. **15/15 verde em 1024×600 e em 1280×800; desktop 1920×1080 sem
> regressão.** Foi ele que pegou os bugs 538 e 539. ⚠️ `pointer: coarse` NÃO vem de
> `mobile:true` no CDP — quem liga é `Emulation.setEmulatedMedia`; sem isso a verificação
> aprova tudo mentindo.
>
> **VERDE:** typecheck 3/3 · 358 testes · build ok. **Playtest do usuário no tablet PENDENTE** —
> é o próximo passo, e headless não substitui (dedo real, teclado real do Android, DPI real).

> **SESSÃO 30 (2026-07-27) — A/B DO §🌬️ MEDIDO (no PC de dev) E ESCOPO DA SOBREVIVÊNCIA ABERTO.**
> **Zero linha de código.** Sessão de leitura de perfil + entrevista de escopo.
>
> **1. O A/B do §🌬️ rodou** — o usuário executou `?bench` e `?bench&semvida` no PC de dev. Os
> dois perfis estão em `profiles/` (`…52k0.json` = A, `perf-bench-semvida-…y9ew.json` = B) e as
> 3 etiquetas conferem. **FPS 60 × 60 e p50/p95 16,7/16,9 idênticos — vsync, 11 ms de folga.**
> O sinal está na GPU: **méd 5,16 → 4,62 ms, p95 8,81 → 8,19** ⇒ nuvens+balanço custam
> **≈0,54 ms de GPU (−10% méd)**, acima do ruído de 1–2%. Draws/tris iguais nos dois = A/B
> limpo. **A rodada que decide FPS ainda é a do lab** (GPU p95 lá já bate 16,8–19,6 ms contra
> 16,7 de orçamento) — a pendência 2 abaixo continua de pé.
>
> **2. Escopo da SOBREVIVÊNCIA aberto** (o usuário pediu; a ordem da fila **não mudou**, ela
> segue 4ª). Tudo em `.wolf/ROADMAP.md §🍖`: 6 decisões travadas, 9 frentes (F1 `/modo` +
> registro de regras → F9 preset de mundo), onde cada peça mora, as colisões com o que já
> existe e o que prova cada frente. Resumo do que ficou decidido: **lite agora** com toda perda
> de vida por uma função só (`aplicarDano`, pra mob/PvP entrarem pela mesma porta) · **mobs
> hostis só em mundo de exploração**, nunca em aula de matéria · **craft por LISTA** (grade 3×3
> descartada: tablet/Kindle Fire) · **`/modo`** mundo + `@aluno` + `all` + `eu` · **`/regra`**
> no molde do `/gamerule`, com `manter-inventario` **LIGADO** por padrão e `/pvp` como atalho
> da regra `pvp`. **Nenhuma decisão pendente** — quem pegar a frente não reabre nada.
>
> **Achados do levantamento que mudaram o desenho:** a banda de itens ≥ 900 já existe
> (`ITEM_BALDE_VAZIO=900`) e `isPlaceable` já a recusa → comida/ferramenta não precisam de
> sistema novo · `rules.ts` serve pra plantação sem motor novo · `session.ts` tem 137 KB, então
> a lógica nova mora em módulos PUROS de `/shared` e a session só orquestra · **não existe
> nenhum bloco contêiner** em `blocks.ts`, por isso o ramo "morte sem manter-inventario" é
> "os itens somem" (baú/item no chão são orçamento do F8).

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

---

## 🚀 Próxima fase — RELEVO POR BIOMA (a 2ª metade da v2 da geração)

A ordem do backlog está **travada pelo usuário** (sessão 29):
**auto-update ✅ → layouts mobile ✅ (1ª rodada) → v2 da geração ← AQUI (metade feita) →
sobrevivência.**

**Cavernas: FEITAS (sessão 32).** Falta a outra metade decidida no escopo: **relevo "montanha
de verdade" por bioma** — araucária vira serra alta com neve, não só um multiplicador de
amplitude. Tudo em `.wolf/ROADMAP.md §🏔️`.

**O que torna essa metade diferente (e o motivo de ela ser a parte difícil):** hoje `heightAt`
é um heightmap **único e global** e a interface `Bioma` (`shared/src/biomas.ts`) **não tem
campo nenhum de relevo** — bioma só PINTA e DECORA. Dar relevo por bioma **reabre de
propósito** o penhasco de fronteira que o heightmap global evitou em 2026-07-20: a suavização
entre biomas passa a ser o trabalho da fase, não um detalhe. O portão: teste de fronteira sem
degrau maior que N blocos entre colunas adjacentes, `topoPrevisto` continua a fonte ÚNICA do
bloco de topo, e o determinismo (mesma seed = mesmos bytes) tem de continuar passando.

**Duas coisas novas que a fase de relevo herda e não pode ignorar:**
1. **Serra alta = mais coluna materializada = mais malha E mais luz.** O custo por coluna hoje
   é worldgen 3,49 ms + luz 2,48 ms, e os dois escalam com a altura do terreno. Medir com
   `?bench` antes de levantar os picos.
2. **A caverna acompanha o terreno** (`cavernaEm` recebe `h` e escava de y=2 até o topo).
   Montanha mais alta = mais subsolo = mais caverna e mais triângulo. A conta de GPU abaixo
   já está no limite.

> ⚠️ **ARMADILHA DE NOME:** a sessão 10 já chamou de "worldgen v2" o que ELA entregou (biomas
> por clima + minério em veia + árvores brasileiras). **Não é essa a v2 da fila.** E
> **"madeira por espécie" saiu do escopo: já está feita** — `LogIpe`/`LogAraucaria`/
> `LogPauBrasil` existem e cada espécie só nasce no bioma dono.

### §💡 Luz voxel — o que ficou aberto

- **Iluminação é POR FACE, não suavizada por vértice.** Os 4 vértices de uma face levam o
  mesmo byte. Suavizar (média das células em volta de cada vértice, estilo AO) é refino
  conhecido e **não muda o pipeline** — o atributo já existe. Só fazer se alguém reclamar do
  degrau entre faces.
- **`torchGlow.ts` continua existindo** como halo decorativo, agora POR CIMA da luz de bloco
  real. Ninguém olhou se os dois juntos ficam exagerados — é pergunta de playtest.
- **Piso de brilho = 0,05** (`luzMin` em `client/src/luzShader.ts`). Escolhido pra caverna dar
  silhueta sem dar leitura, num jogo de sala de aula. Se o playtest disser "não dá pra andar",
  é UMA linha.
- **Nada de luz no SAVE.** A luz é derivada dos bytes, então mundo antigo abre e acende igual
  — nenhuma migração de formato. Mundo salvo ANTES da sessão 32 continua sem caverna (a
  caverna fica assada no `.ljw`), e isso está certo: mundo de aula não muda debaixo do
  professor.

### Layouts mobile — o que ficou aberto da 1ª rodada

- **Playtest no tablet** virou pendência externa (o usuário faz na escola — ver ⚠️ abaixo).
- **Painéis de AUTORIA** (`#painel`: quadros, objetivos, regiões) e o de **grupo/jogadores**
  não foram revistos — o usuário os deixou fora do escopo. Seguem em `min(580px, 94vw)` /
  `min(560px, 84vh)` com box-sizing content-box; os botões internos já têm alvo de 40px.
  O caminho que funcionou no inventário foi **ALARGAR em paisagem baixa**, não quebrar linha.
- **Nome do mundo truncado no DESKTOP** ("seque…", "labirin…"): a coluna do nome fica com
  ~84px depois dos 3 botões. Em paisagem baixa já resolveu (painel de 680px). No desktop
  resolve com UMA linha (`.menu-screen { width: min(680px, 92vw) }` sem media query), mas é
  mudança visual não pedida numa tela de uso diário — **só com o aval do usuário.**

### Cinco pendências que não bloqueiam nada, e quem faz é o usuário

-1. **PLAYTEST DA LUZ E DAS CAVERNAS (sessão 32) — o mais novo, e o único que headless não
   substitui.** O que olhar:
   1. **Dá pra andar numa caverna sem tocha?** O piso de brilho é 0,05 — se ficar cego, é uma
      linha (`luzMin`, `client/src/luzShader.ts`).
   2. **A tocha ilumina o suficiente?** Ela emite 14 e o halo decorativo continua por cima;
      ninguém viu os dois juntos.
   3. **A noite ficou escura demais pra construir?** O piso de luar é 0,22 (`PISO_LUAR`,
      `client/src/daynight.ts`).
   4. **Achar uma caverna é fácil ou raro demais?** Densidade em `LIMIAR_CAVERNA = 0,06`
      (`shared/src/worldgen.ts`) — ~5% do subsolo, ~1 boca a cada 400 colunas.
   5. **FPS no notebook do lab.** Cavernas somaram **+66% de triângulos** (153 852 → 255 234)
      e a GPU de lá já fecha o p95 em 16,8–19,6 ms contra 16,7 de orçamento. É a medição que
      mais falta — ver ⚠️ abaixo.
0. **PLAYTEST MOBILE — o usuário faz NA ESCOLA** (declarado em 2026-07-28). A 1ª rodada de
   layouts está verde no headless, mas headless não tem dedo, teclado do Android nem o DPI do
   aparelho. O que olhar, na ordem em que foi mexido:
   1. **Hotbar:** tocar num slot troca de bloco? (caminho NOVO — antes só o inventário trocava)
   2. **Chat:** com o teclado aberto, o campo continua visível? O histórico rola?
   3. **Menu → Meus mundos:** com vários mundos, dá pra chegar no "voltar" lá embaixo?
   4. **Inventário:** as 6 abas cabem numa linha? Dá pra acertar aba e slot com o dedo?
   5. **F3 (📊) e objetivos:** ainda passam por baixo da barra de botões do topo?

   **Não bloqueia a v2 da geração** — são arquivos disjuntos (CSS/UI × `shared/src/worldgen`).
   Se voltar com ressalva, é edição pontual no `client/index.html` + `npm run shots:tablet`.
1. **Rodar `iniciar-servidor.bat` no Windows uma vez.** O auto-update do `.sh` foi exercitado
   nos 8 caminhos (clone local + npm falso); o `.bat` NÃO — não há cmd.exe no WSL. É duplo
   clique; se o bloco de update falhar, o pior caso é ele avisar e subir a versão instalada.
2. **A/B do §🌬️ no notebook do lab:** `?bench` e depois `?bench&semvida`, duas URLs seguidas
   na MESMA máquina. O perfil se etiqueta sozinho (`meta.bench.semVida`, `config.nuvens/
   balanco`) e o lado B nasce `perf-bench-semvida-*.json`. Comparar com a régua abaixo. Só
   vale se o relatório quiser o custo de nuvens/balanço — **não é gatilho de desempenho.**
   **O lado do PC de dev JÁ FOI FEITO (sessão 30):** custo ≈0,54 ms de GPU (méd 5,16 → 4,62;
   p95 8,81 → 8,19), **invisível em FPS por causa do vsync**. Só falta a máquina apertada.
3. **Deck da CRE** (`relatorio/apresentacao-cre.html`) pronto e não apresentado. Se ele voltar
   com pedido de mudança, editar por Edit ancorado em texto de slide — o base64 dos prints
   vive no mapa `IMGS` do `<script>`, não no `src`, justamente pra isso.

Único detalhe visual nunca olhado ao vivo: **o sentido por face da 28c** (a tabela está no
diário acima). Se um dia despejar um balde, conferir — e lembrar que as laterais
PERPENDICULARES ao fluxo mostram a onda DESCENDO de propósito (não há horizontal a mostrar
numa face que o fluxo atravessa) e que o mar segue o vento, também de propósito. Headless não
resolve isso: o mar gerado não tem fluxo nenhum.

**Nenhum gatilho de desempenho está aceso.** Quem retomar ESCOLHE do backlog abaixo.

**A régua, pra qualquer perfil futuro se ler contra:**
- **PC de dev (RTX 2060):** `profiles/perf-bench-2026-07-27T01-24-08-311Z.json` — 60 FPS ·
  p95 16,9 ms · GPU 4,02 ms · carga 4,76 s · fila 0.
- **Notebook do lab (Intel UHD 630, 8 núcleos, NA TOMADA):** `…-l9xf.json` — 50 FPS ·
  p50 20,0 · p95 26,7 · p99 31,4 ms · GPU méd 13,0 / p95 16,8 · carga 4 508 ms · fila 0.
- **Ruído do instrumento ≈ 1–2%** (duas rodadas na mesma máquina): diferença acima disso é
  SINAL. É esta linha que autoriza tratar um número novo como evidência.

**Como ler um perfil, na ordem que funcionou:** `carga.fasesMs` (`mundo` = rede/worldgen,
`malha` = CPU de meshing — separa os dois sem instrumentação nova) → `gravacao.histogramaMs`
(a FORMA) → `fases[]` + `pioresTravadas` com os `marcadores` do lado → `gpu` comparada com o
frametime (é o teste de "é render?") → `mesher` (workers e profundidades: a etiqueta do
experimento, existe desde bug-529).

### ⚠️ Dois tetos que NÃO se atravessa com código

0. **§🏔️ AS CAVERNAS COBRARAM +66% DE TRIÂNGULOS** (153 852 → 255 234; draw calls 518 → 665),
   medido no `?bench` do PC de dev em 2026-07-28. O salto grande é ter caverna QUALQUER — o
   chunk de subsolo deixa de ser sólido-sem-faces; aumentar densidade depois é barato
   (0,075 daria 294 256, só +15% sobre o 0,06 escolhido). **Isso ainda NÃO foi medido no
   lab**, e é lá que a GPU já está no teto (item 1 abaixo). Se o FPS cair na escola, o botão
   é `LIMIAR_CAVERNA` (`shared/src/worldgen.ts`) — e a régua de densidade está no teste
   `escava na densidade calibrada`, que mede a média de 5 seeds.
   ⚠️ **A seed do `?bench` (20260726) é das mais VAZIAS** (2,9% contra 7,3% da pior): o número
   acima é o melhor caso, não o típico.
1. **GPU p95 16,8–19,6 ms contra 16,7 ms** de orçamento de 60 FPS no lab. **O mesher acabou.**
   Se um dia o FPS incomodar de novo, o alvo é GPU — teto de `raioRender` em GPU fraca,
   overdraw da água, custo de fragment. **Greedy meshing continua DESCARTADO:** draw calls
   (633) e triângulos (188 048) do lab são IDÊNTICOS aos do PC de dev, então não é aí que a
   máquina fraca perde.
2. **Notebook em modo economia de bateria trava em 30 FPS** (`p50` 33,3 ms cravado, GPU 28%
   mais cara). É política de energia do Windows. Perfil medido nesse estado NÃO serve pra
   comparar otimização — checar o estado da máquina antes de concluir qualquer coisa.

### Backlog — ORDEM TRAVADA pelo usuário (sessão 29)

1. ~~**Auto-update do servidor**~~ **FEITO** (`fbbe3d0`): `git pull` no launcher, pergunta
   antes, `--ff-only`, 6 escapes. Falta só o teste no Windows (pendência 1 acima).
2. ~~**Layouts mobile**~~ **1ª RODADA FEITA (sessão 31)**: menu, inventário/hotbar e chat/HUD
   em 1024×600. Falta o **playtest no tablet** (pendência 0) e os **painéis de autoria**, que
   o usuário deixou de fora desta rodada.
3. **v2 da geração de mundo** ← AQUI, **METADE FEITA**. `ROADMAP.md §🏔️`.
   - ~~**Luz voxel** (pré-requisito que o usuário mandou entregar antes)~~ **FEITA (sessão
     32)**: céu + tocha, repropagação incremental, 100% no cliente.
   - ~~**Cavernas**~~ **FEITAS (sessão 32)**: interseção de 2 ruídos 3D, todo mundo
     procedural, secas sob o mar com casca.
   - **Relevo "montanha de verdade" por bioma** ← o que falta. É a parte difícil: reabre o
     penhasco de fronteira que o heightmap global evitou.
4. **Sobrevivência** (fome/vida/craft) — **escopo ABERTO na sessão 30 (2026-07-27)**, nada
   codado. Entrevista feita, decisões travadas, 9 frentes e as colisões (mundo-aula, claims,
   bench, save, protocolo) escritas em `.wolf/ROADMAP.md §🍖`. Ler de lá e começar pelo F1
   (`/modo`, o interruptor sem mecânica). Ordem da fila **não mudou** — segue 4º.

Fora da fila, sem ordem definida:
- ~~`ROADMAP.md §🌬️` — vento + vida ambiental~~ **FEITO na sessão 28** (frentes 1 a 6).
  Sobrou só o que o §🌬️ NÃO pediu: som do vento; vento empurrando partículas/chuva;
  o vento entrar na física (decisão explícita: é SÓ visual até alguém decidir o contrário).
- **Som de água** (splash/borbulha/balde, WebAudio em `audio.ts`) — 4ª opção do refino de
  água, nunca escolhida.

**Entregável final (relatório) está essencialmente PRONTO** — pendências só opcionais:
embutir 2–4 prints no §3, refs em ABNT, diagrama no Anexo A. Se o usuário pedir entrega,
o passo é gerar PDF/HTML de `relatorio/relatorio-aplicacao.md`. **O §desempenho do relatório
agora tem material forte:** o par A/B com o caminho síncrono e a régua dev × lab.

**Hitbox da laje: ENCERRADA (2026-07-26).** O usuário testou e confirmou — "hitbox já está
correta", NADA a mudar. Laje segue com mira na METADE (`blockSelectionBox`) e colisão de MEIA
ALTURA (`temColisaoParcial`); NÃO copiar o modelo de célula cheia da cerca/porta. Se uma
sessão futura achar isso "inconsistente", é decisão validada em playtest — deixar como está.

Sessões 20+21 (`26151f9`/`41211ff`/`5d18899`), 24 (`e3eaac4`) e 25 commitadas.
**Sessão 27 commitada e pushada:** `51bc5c8` (mesher em Worker) + `b3669ff` (wolf) +
`0a3dd3f` (PR do openwolf) + `efaf6df` (profundidade 1 + etiqueta no perfil).
**Sessão 28 COMMITADA E PUSHADA** (2026-07-27): `b9bc7a3` (§🌬️ frentes 1-6) + `3418cf4`
(regra da correnteza, 28b) + `7db6890` (sentido por face, 28c). Diário completo da 28 está em
`.wolf/history.md` (rotacionado pra fora do STATUS).
**Sessão 29 COMMITADA E PUSHADA** (2026-07-27), 7 commits: `26b7650` (`?semvida` + etiqueta
do A/B) · `fbbe3d0` (auto-update no launcher) · `f23d5a9` (README + deck da CRE + relatório
sem data) · `e49aa15` (privacidade: apelido e save de teste fora da árvore) · `edec801`
(wolf) · `f6d72af` (LICENSE source-available) · `26ee413` (decisões no cerebrum).
**O repo é PÚBLICO agora:** `github.com/meketreve/logica-em-jogo`.

---

## 📁 Arquitetura ativa

- **Padrão central:** UM módulo de lógica de jogo (servidor autoritativo) que roda em 3
  hospedeiros SEM reescrita: (a) Web Worker no singleplayer, (b) .exe portátil (Tauri/Node
  SEA) que serve HTTP+WebSocket, (c) servidor Node dedicado. Cliente só renderiza + envia input.
- **Transporte:** WebSocket (mensagens iguais em todos os hospedeiros).
- **Save:** mundo salvo no PC do host (professor). Persiste entre aulas.
- **Restrição dura do navegador:** aba NÃO abre socket de escuta e NÃO executa binário.
  Por isso "abrir pra LAN" é papel do HOST (professor roda .exe/servidor), não do aluno.
  WebAssembly NÃO contorna isso (roda dentro do sandbox). Confirmado nesta entrevista.

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
