# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.
> **SESSÃO 25b (2026-07-26) — §🧪 ENCANAMENTO DE VERIFICAÇÃO.** Papo sobre ferramental
> virou trabalho. Duas verdades ficaram claras: (1) o valor do OpenWolf aqui é STATUS +
> cerebrum (o handoff), não o resto; (2) **metade do Do-Not-Repeat deste projeto é sobre o
> APARATO de teste, não sobre o código** — foi ali que o token foi embora. Entregue:
> `npm run verify` (typecheck 3 pacotes + 329 testes + build) e **`scripts/smoke.mjs`**,
> runner com manifesto que sobe o host com a env certa, roda o cenário e mata tudo. Antes,
> cada `_smoke-*.mjs` só documentava sua env num comentário de cabeçalho e exigia montar a
> linha à mão. Agora: `npm run smoke` (5/5 em 38 s) · `-- <nome>` · `-- --rapido` (pula
> mundos E) · `-- --lista` (**diz o que cada cenário prova sem abrir arquivo nenhum** — use
> antes de ler um smoke). Porta própria por cenário (8091–8096) mantém a 8080 livre pro dev
> server; `LJ_SEED` fixa tira a loteria do terreno. Desbloqueia
> `git bisect run npm run smoke -- <nome>` pra achar QUANDO quebrou sem ler diff.
> Dois bugs no caminho: **bug-521** (asserção velha case-sensitive no `_smoke-mundo` —
> `/Continue a regra/` casava com o TÍTULO, não com o texto do objetivo; nunca pegou porque
> ninguém checava exit code) e **bug-522** (manifesto dava mundo novo vazio a um smoke que
> pressupõe nascer na aula1). Convenção de log auditada: já é 100% consistente
> (`[server]` no host, tag por subsistema no client), só nunca tinha sido escrita — foi pro
> cerebrum. Config OpenWolf ajustada: `buglog.auto_detect: false` (falso positivo poluía o
> índice) e `anatomy.rescan_interval_hours: 6 → 168` (stale falso todo boot).
> **NÃO commitado ainda** — entra junto com a §🕐 quando o playtest aprovar.
> **SESSÃO 25 (2026-07-26) — §🕐 TELA DE CARREGAMENTO CODADA E VERDE (playtest pendente).**
> Usuário disse só "continuar" → peguei a quest 1ª da fila. Novo `client/src/loading.ts`
> (self-contained, DOM+CSS injetados como o `touch.ts`), aberto no `connect()` e fechado
> quando o raio inicial INTEIRO está aplicado E `chunkRenderer.filaPendente === 0`. Progresso
> real = colunas prontas ÷ total do raio (mesma conta do `streamColunas`, recortada pelas
> bordas do mundo); spinner decorativo em CSS puro no canto, desacoplado de propósito. Taxa
> em **bits/s** (`bytesIn+bytesOut` ×8, amostragem 1×/s; DOM repinta 4×/s pra ficar suave).
> "Em transferência" reusa `colunasFaltando.size` da varredura §🔁 — zero segunda medição,
> como o handoff mandava. **bug-515 fechado** (o bloqueio que o próprio usuário apontou na
> sessão 23): `updateOverlay()` agora tem `loading.ativo` na condição, então o menu Esc não
> aparece mais por baixo da carga; idem `touchControls.setShown`. Ao fechar, o menu de pausa
> volta a ser a porta de entrada (o clique é o gesto que o pointer lock exige). Três decisões
> que nasceram da verificação: (a) anel **indeterminado** ("…" girando) enquanto não há total
> — mundo denso vem num blob só e 0% travado parece defeito; (b) fase troca sozinha pra
> "montando a malha…" quando as colunas acabaram e a fila não; (c) `WsConnection` ganhou
> `aoFalhar` → servidor fora do ar vira mensagem vermelha + "voltar ao menu", em vez de
> spinner eterno (é o modo de falha mais provável na escola). VERDE: typecheck 3/3, 329
> testes, headless conferido em mundo E (33% · 56/169 · 2.1 Mbps · ETA 4,7 s), mundo P
> (denso, fecha em 100%) e servidor inexistente. **NÃO commitado — esperando o playtest.**
> **PARTE 2 da sessão:** (a) o usuário não via a tela — rodou `npm run dev:server`, que serve
> o cliente COMPILADO; era build velho (**bug-516**, `npm run build` resolveu). (b) Pediu a
> mesma tela no `/mundo carregar` e mandou um perfil novo. **O perfil expôs 3 bugs, não um
> gargalo:** `remeshCount` 475 136 (24× o perfil anterior) com 34% MENOS triângulos →
> `trocarMundo` fazia `buildAll()` em mundo lazy = 460 800 remesh de slot vazio, ~19 s de
> trava (**bug-517**); `repedidas` 252/700 → `/mundo carregar` cria SESSÃO nova e o `admitir`
> zera o raio pra `RAIO_PADRAO`, com o cliente sem reanunciar (**bug-518**, provado pelo smoke
> novo `_smoke-troca-raio.mjs`: anel 10 → 6 → 12); `meta` do perfil era do mundo do JOIN
> (**bug-519**, `Hud.setMeta`). Os três corrigidos + a §🕐 agora reabre na troca de aula
> (título "trocando de aula", pointer lock CONTINUA travado = volta ao jogo sem clique).
> **PARTE 3:** perfil 3 (18:40) com os fixes = **remesh 475 136 → 10 984, repedidas 252 → 4,
> meta correta** (tabela no ROADMAP). Playtest do usuário: "a tela demora a aparecer no
> `/mundo carregar` e quando aparece já está quase pronta" (**bug-520**) — a tela abria no
> snapshot, que é o FIM da fila do host. Agora o servidor ANUNCIA: msg nova
> `mundo_trocando {nome}` (emitida após o decode do .ljw, antes de salvar/gerar), fase nova
> `preparando` com anel indeterminado, e uma **fila de 2× rAF** segura as mensagens seguintes
> pra garantir que o frame COM a tela pintou antes do trabalho pesado (o snapshot chega
> 1-2 ms depois do aviso em mundo lazy — sem isso não adiantaria abrir mais cedo).
> Smoke `_smoke-troca-raio.mjs` agora tem 6 checagens (inclui a ordem aviso→snapshot).
> **PARTE 4 — o achado grande (bug-523).** Playtest: "a tela funciona, só que a página diz
> que não está respondendo". Era `TorchGlow.setFromWorld` varrendo o mundo **bloco a bloco**:
> mundo E = 1,887 bilhão de células = **41,4 s de main thread travada**, no join E na troca de
> aula. É a explicação dos ~38 s de `longTasksMsTotal` iguais nos TRÊS perfis (sessões de
> 234/168/96 s — trava fixa, não regime). Varredura por CHUNK (ausente sai em O(1)):
> **41 361 ms → 2,9 ms**; P 77 → 11,5 ms. Equivalência conferida contra a varredura antiga
> com tochas em borda de chunk (9/9 idênticas) e wall clock do headless: join em mundo E que
> estourava 3 min agora fecha em 2,9 s. De quebra, tocha de coluna que chega por streaming
> agora ganha halo (`varrerColuna`) e some no descarte (`descartarColuna`) — antes só
> aparecia se alguém tocasse no bloco.
> **PARTE 5 — perfil com CONTEXTO + orçamento por tempo.** Erro meu que o usuário pegou: li
> "parado, 60 FPS" de perfis feitos VOANDO (inferi estado pela taxa de rede). Perfil agora
> carrega `jogador` (pos/yaw/pitch/voando/noChao/chunk), `config` (raioRender,
> `meshMsPorFrame`, pixelRatioCap, fov — eu vinha comparando perfis de raio 12 com raio 6 sem
> saber) e `gravacao.movimento` (estado, distância, velocidade, colunasNovas, bytes) medido
> como DELTA na janela. `?hud` abre o F3 no boot (headless). Depois, escolha dele: **orçamento
> de mesh por TEMPO** — `meshMsPorFrame` (1–16 ms, padrão 6) no lugar de `meshPorFrame`
> (contagem), com teto de 64 chunks e ≥1 garantido; a contagem fixa custava de 1 a 24 ms por
> frame e era a origem dos frames de 50–100 ms. Headless em mundo E fechou com `fila 0`,
> `faltando 0`, **0 long tasks**. Plano do mesher em Worker escopado no ROADMAP (pool, cópia
> de chunk+bordas, transfer de volta; mundo fica na main por causa de física/raycast).
> **Falta o perfil do usuário pra medir o ganho.** Sessão 24 abaixo ↓

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

---

## 🚀 Próxima fase — AS 7 MELHORIAS DO PERFILADOR (decidido pelo usuário)

> Backlog e escopo detalhado vivem em `.wolf/ROADMAP.md` → seção **`📊 BACKLOG —
> PERFILADOR`**, que tem os sete itens escritos com justificativa. **Ler aquela seção antes
> de codar.** Aqui fica só a ordem e o porquê.

**A sessão 25 inteira está COMMITADA** (playtest aprovado pelo usuário nos dois caminhos:
singleplayer e `/mundo carregar`). Árvore limpa ao fechar.

O usuário fechou a sessão assim: *"vou atacar depois as 7 coisas que é bom ter no
perfilador"*. Ordem sugerida (a 1ª vale mais que as outras seis somadas):

1. **Modo `?bench`** — teleporta pra coordenada fixa, voa trajeto fixo por 30 s com seed
   fixa, exporta sozinho. **É o que destrava o número do PC do LAB**, que a política de
   otimização exige há três sessões: hoje comparar máquinas depende de a pessoa voar igual.
2. **Histograma de frametime** (faixas 8/16/33/50/100+ ms) — percentil esconde a FORMA
   (bimodal = dois regimes; cauda longa = hitch raro).
3. **Tempo de carga por fase da tela** (conectando → mundo → malha): a §🕐 já calcula tudo,
   falta exportar no JSON. Vira "quanto o aluno espera" por máquina.
4. **Marcadores de evento** (join, troca de aula, mudança de raio) com timestamp — hoje um
   pico não tem causa registrada.
5. **Células tocadas por tick pela regra** (água/areia) no `debug_stats` do servidor — liga o
   custo de `remesh(bloco)` à causa real.
6. **Tempo de GPU** (`EXT_disjoint_timer_query_webgl2` quando existir) — todo o perfil hoje é
   CPU-side.
7. **`hardwareConcurrency` + `deviceMemory`** — uma linha cada, caracteriza o PC do lab.

**Base já pronta pra isso (sessão 25):** o perfil traz `jogador`, `config`,
`gravacao.movimento` (estado voando/andando/parado, distância, colunas novas), `fases[]`
(carregando × jogando com fps, `renderPct` e travadas), `pioresTravadas` (top 5 com fase e
segundo) e `remeshPorCaminho` (fila × bloco × área). `?hud` na URL abre o F3 no boot.

### Depois disso — custo de render (o que sobrou)

O pico morreu com o orçamento por tempo (MEDIÇÃO 5 do ROADMAP: p95 43–82 ms → 18,7/20,4 ms,
frames >50 ms 9–50 → **0**). O que resta é modesto: **mesher em Web Worker** compra 16–19% de
main thread (FPS 55–60 → 60 travado) e fila que esvazia mais rápido; plano escopado no
ROADMAP. **Greedy meshing desceu** (steady state já é 60 FPS com 500 k triângulos).
⚠️ Gatilho da política continua sendo "FPS baixo em PC do lab" — daí a prioridade do `?bench`.

### Backlog aberto (nasceu nas sessões 24–25)

- **`ROADMAP.md §🌬️` — vento + vida ambiental** (pedido do usuário no playtest da água):
  textura da água → vento autoritativo (molde do `horaDoDia`) → animação da água seguindo o
  vento → nuvens → folhas balançando → grama e flores. Nada codado.
- **Som de água** (splash/borbulha/balde, WebAudio em `audio.ts`) — 4ª opção do refino de
  água, nunca escolhida.

Sessões 20+21 commitadas e pushadas (`26151f9` blocos + `41211ff` wolf + `5d18899` handoff).
Sessão 24 commitada: `e3eaac4` (água + streaming §🔁). Sessão 25 commitada nesta data.

**Hitbox da laje: ENCERRADA (2026-07-26).** O usuário testou e confirmou — "hitbox já está
correta", NADA a mudar. Ou seja: laje segue com mira na METADE (`blockSelectionBox`) e
colisão de MEIA ALTURA (`temColisaoParcial`); NÃO copiar o modelo de célula cheia da
cerca/porta. Se uma sessão futura achar isso "inconsistente", é decisão validada em
playtest — deixar como está.

**Candidatos de backlog** (ver ROADMAP.md pro resto): layouts mobile · auto-update do
servidor · sobrevivência (fome/vida/craft) · v2 da geração.

**Entregável final (relatório) está essencialmente PRONTO** — pendências só opcionais:
embutir 2–4 prints no §3, refs em ABNT, diagrama no Anexo A. Se o usuário pedir entrega,
o passo é gerar PDF/HTML de `relatorio/relatorio-aplicacao.md`.

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
```

---

## 📚 Referências (leia SE precisar)

- `projeto.txt` — proposta pedagógica completa (BNCC, fundamentação, indicadores seção 14).
- `.wolf/cerebrum.md` — Decision Log com o PORQUÊ de cada escolha.
- `.wolf/anatomy.md` — índice de arquivos.
