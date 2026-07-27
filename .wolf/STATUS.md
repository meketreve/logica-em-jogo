# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.
> **SESSÃO 26 (2026-07-26) — §📊 AS 7 DO PERFILADOR: TODAS ENTREGUES.** Usuário disse só
> "continuar" → peguei a fila. **Item 7 já estava pronto** (`dispositivo()` do hud.ts já
> trazia `nucleos`/`ramGB` desde antes — confirmado no perfil headless: 24 núcleos, 16 GB).
> Os outros seis foram codados: **(1) `?bench`** — `client/src/bench.ts` novo. Abre sozinho um
> mundo de seed FIXA (20260726, `?tamanho=` muda; **padrão E**, porque em mundo denso o mesher
> já acabou antes do trajeto e a medida sairia sem a parte que mais varia entre PCs),
> teleporta pra coordenada fixa, voa um círculo a **velocidade fixa de 18 b/s** (não "uma
> volta no tempo dado" — senão `?bench=60` seria mais LEVE que `?bench=30` e os dois números
> não comparariam), gira 360° parado nos últimos 25% (separa "carregar" de "desenhar") e
> **baixa o JSON sozinho** no fim. Posição é `f(t)`, não física: PC de 20 e de 60 FPS
> percorrem o MESMO caminho — se fosse `pos += v·dt` a máquina lenta veria menos terreno e
> ganharia FPS de graça. Config canônica (`raioRender` 6, `meshMsPorFrame` 6, `pixelRatioCap`
> 1, fov 75) sobrescreve o localStorage do PC do lab em memória, sem salvar. **(2)** histograma
> de frametime (6 faixas, n + %) na gravação. **(3)** tempo de carga por FASE saindo da §🕐
> (`conectando/mundo/malha/pronto` + total), uma entrada por carga — join e cada troca de aula.
> **(4)** marcadores de evento com segundo e fase (join, carga concluída, troca de aula, raio
> A→B, início/fim do bench) — o pico agora tem causa. **(5)** custo das REGRAS no servidor no
> `debug_stats` (células/tick, pior tick, mudanças, água), campos OPCIONAIS no protocolo pra
> host velho não derrubar a mensagem. **(6)** tempo de GPU por `EXT_disjoint_timer_query_webgl2`
> (pool de 4 consultas, descarta leva em `GPU_DISJOINT`, só amostra com F3 aberto ou gravando).
> VERDE: typecheck 3/3, **331 testes** (2 novos: contador de regras no tick + opcionais do
> `debug_stats`), build ok. **Verificação headless via CDP** (script novo
> `scripts/bench-headless.mjs`, `npm run bench:headless`): bench de 15 s em mundo E fechou com
> trajeto exato (202,5 blocos = 18 b/s × 11,25 s), 251 colunas novas, 8,2 MB, carga medida
> (conectando 175 ms · mundo 2 369 ms · malha 15 167 ms), 4 marcadores, histograma e
> `regrasServidor` não-nulo (prova o campo novo atravessando o protocolo). **bug-525** achado
> nessa verificação (dois teleportes entravam na distância). O caminho de GPU está embrulhado
> em try/catch que desliga a medição em vez de derrubar o loop de render (headless cai no
> SwiftShader, que nem expõe a extensão — conferido).
> **PLAYTEST APROVADO ("que bench massa") e COMMITADO.** O usuário rodou nos dois modos, no
> RTX 2060: **(a) perfil manual** (F3 → enviar pro servidor, host Node `:8080` após
> `npm run build`) — GPU 7,38 ms méd / 10,37 p95 em raio 12 (**prova que o caminho de GPU
> funciona em hardware real**), e a `carga` expôs o número que faltava: **troca de aula custa
> 14,7 s** (mundo 7 970 ms + malha 6 317 ms, 625 colunas, 21,5 MB) contra 1,2 s no join.
> **(b) `?bench` de 30 s = A RÉGUA** (`profiles/perf-bench-2026-07-27T01-24-08-311Z.json`):
> 60 FPS travado, p50 16,7 · p95 **16,9** · p99 18,1 ms, 98,4% dos frames ≤33 ms, **0 long
> tasks**, GPU **4,02 ms** méd (de 16,7 disponíveis), carga 4,76 s, 443 colunas novas em
> 14,5 MB com **fila 0 no fim** (o streaming acompanha 18 b/s), trajeto exato (405 blocos =
> 18 × 22,5 s). **O que a régua revela:** `remesh` 7 756× / **12,78 s de CPU em 34 s de
> sessão** = 37% do tempo de parede, exatamente o teto do orçamento de 6 ms/frame — o mesher
> SATURA o orçamento o tempo todo voando. Não custa FPS aqui (o orçamento segura), mas é a
> prova quantitativa a favor do mesher em Web Worker; em PC fraco é a fila que não esvazia.
> Nesta máquina o gargalo não é GPU nem render — é malha e rede.
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

## 🚀 Próxima fase — RODAR O `?bench` NO PC DO LAB (e só então otimizar)

**O que fazer primeiro (é do USUÁRIO, não meu):** abrir `?bench` num PC do laboratório e
mandar o JSON. O link é `http://<ip-do-host>:8080/?bench` (30 s) — ou `?bench=60`,
`?tamanho=P|M|G` pra medir só render. **Precisa de `npm run build`** se o cliente for servido
pelo host Node (bug-516). Nada a decidir sobre otimização antes desse arquivo: o gatilho da
política é "FPS baixo em PC do lab", e agora existe um número comparável pra checar isso.

**A RÉGUA (PC de dev, RTX 2060, 2026-07-27):** `profiles/perf-bench-2026-07-27T01-24-08-311Z.json`
— 60 FPS · p95 16,9 ms · 98,4% dos frames ≤33 ms · 0 long tasks · GPU 4,02 ms · carga 4,76 s ·
fila 0 no fim. **É contra estes números que o perfil do lab se lê.** Se o lab vier com fila que
não zera ou `carga` alta, o alvo é malha/rede (mesher em Worker); se vier com GPU perto do
frametime, aí sim é render.

**Quando o perfil do lab chegar, olhar nesta ordem:** `carga` (quanto o aluno espera, por
fase) → `gravacao.histogramaMs` (a FORMA: bimodal ou cauda longa?) → `fases[]` +
`pioresTravadas` com os `marcadores` do lado (o pico tem causa agora) → `gpu` (se o driver do
lab expuser a extensão, separa GPU cara de CPU cara — **este caminho nunca rodou de verdade**,
headless não tem a extensão).

### Depois do número do lab — custo de render (o que sobrou)

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
npm run verify      # typecheck + testes + build (o portão antes de commitar)
npm run smoke       # cenários de rede reais (--lista diz o que cada um prova)
npm run bench:headless   # roda o ?bench num Chrome headless e imprime o perfil
```

**Modo benchmark (o que mandar pro PC do lab):**

```
http://<host>:8080/?bench            # 30 s, mundo E (streaming), seed 20260726
http://<host>:8080/?bench=60         # trajeto mais longo
http://<host>:8080/?bench&tamanho=P  # mundo denso: mede só render
```

---

## 📚 Referências (leia SE precisar)

- `projeto.txt` — proposta pedagógica completa (BNCC, fundamentação, indicadores seção 14).
- `.wolf/cerebrum.md` — Decision Log com o PORQUÊ de cada escolha.
- `.wolf/anatomy.md` — índice de arquivos.
