# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.
> **SESSÃO 29 (2026-07-27) — A/B FERRAMENTADO, DECK DA CRE, AUTO-UPDATE DO LAUNCHER.**
> O usuário escolheu: relatório **sem data** (vai apresentar informalmente pra CRE antes da
> apresentação formal), **ponto 2** (o número do §🌬️) e **ponto 4** com ordem fixada —
> **auto-update → layouts mobile → v2 da geração → sobrevivência**. Pediu também um deck.
>
> **1. Relatório sem data:** saiu só o `(2026-07-21)` da linha de versão na ficha. O
> *período de aplicação* (13–20/07) FICA — é dado do piloto, não data do documento.
>
> **2. A/B do §🌬️ ferramentado (não medido ainda):** `?bench&semvida` desliga nuvens+balanço
> só no bench, no molde do `?semworker`. `benchSettings()` é a fonte única da config efetiva
> (senão o perfil do lado B mentiria dizendo `nuvens: true` — quase aconteceu). O perfil se
> etiqueta em 3 lugares: `meta.bench.semVida`, `config.nuvens/balanco` (agora no contexto do
> HUD, então vale pra QUALQUER perfil, não só bench) e o nome do arquivo
> (`perf-bench-semvida-*.json`). Headless confirmou os dois lados (true/true × false/false).
> **Falta rodar as duas URLs no notebook do lab** — é o único passo que precisa da máquina.
>
> **3. Deck da CRE** — `relatorio/apresentacao-cre.html`, 20 slides, um arquivo, offline,
> ← → navega, **N** mostra notas do apresentador (ou `?notas`), Ctrl+P sai handout com nota
> por slide. Sem data. Cobre pedagógico + demo + técnico (o usuário pediu os três).
>
> **4. Auto-update do launcher** (`iniciar-servidor.sh` e `.bat`): pergunta antes
> (Enter = sim), `--ff-only`, pula sozinho em 6 situações (LJ_SEM_UPDATE=1 · pasta sem
> `.git` · git ausente · branch ≠ main · código rastreado modificado · rede muda) e roda
> `npm install` só depois de atualizar de verdade. `client/dist` é versionado → escola não
> compila. **O `.sh` foi testado nos 8 caminhos** (clone local + npm falso). **O `.bat` NÃO
> pôde ser testado** — não há cmd.exe aqui; precisa de uma rodada no Windows.
>
> ### ⛔ O repo NÃO pode virar público como está (achado desta sessão)
> O usuário autorizou abrir o repo, mas a varredura achou **dado de aluno**:
> - `.wolf/history.md` (RASTREADO) tem apelidos de aluno numa linha de FPS;
> - o **histórico** do git tem `profiles-escola/perf-<apelido>-*.json` (removidos no working
>   tree em `1da93cd`, mas commit antigo guarda os nomes) — e o relatório afirma que os
>   perfis crus foram apagados por privacidade. Abrir o repo desmentiria isso.
> - `server/world.ljw` (RASTREADO, 1 MB) traz PIN `7410` e código de professor `K2AS7X` de
>   um mundo de TESTE (`aluno1`/`aluno2` são fictícios) — sem dado de aluno real, mas não é
>   coisa pra repositório público.
>
> **DESFECHO (mesma sessão):** o usuário abriu ESTE repo mesmo —
> `github.com/meketreve/logica-em-jogo` está **PÚBLICO**. Consertei o que dava na árvore
> atual (`e49aa15`): apelido virou rótulo em `history.md`, `server/world.ljw` saiu do índice
> e entrou no `.gitignore`. **Sobre o histórico o usuário decidiu: "não tem problema"** — os
> `profiles-escola/perf-<apelido>-*.json` seguem recuperáveis por `git log` e NÃO serão
> limpos. Não reabrir esse assunto.
>
> **Licença (`f6d72af`): source-available, decidida pelo usuário** — "uso livre nas escolas,
> modificações passam por mim". `LICENSE` em português simples: escola usa/roda/redistribui
> INALTERADO de graça; distribuir código modificado, republicar sem autoria ou uso comercial
> exigem autorização escrita. Três pontos explícitos porque mudam o uso real: **cenário
> criado por professor é do professor**, modificar a PRÓPRIA cópia é livre (o que trava é
> distribuir), e escola privada como ferramenta de ensino NÃO é uso comercial. Não é OSI — o
> GitHub marca "licença não reconhecida", e isso é esperado.

> **SESSÃO 28c (2026-07-27) — SENTIDO DA CORRENTEZA, FACE POR FACE.**
> Segundo retorno do playtest: *"as texturas estão rotacionadas para cada face"*, com receita
> tirada de UM caso (correnteza sul→norte): topo certo · baixo 180° · sul 90° CW · leste 180° ·
> oeste certa · norte 90° CW.
>
> **A receita não generaliza — e isso foi verificado antes de aplicar.** Medindo o sentido da
> onda em cada face: com fluxo pro NORTE as 4 laterais mostram a onda **descendo**; com fluxo
> pro LESTE elas já mostram **horizontal**. Nenhuma rotação constante acerta os dois casos.
>
> **A causa real** é que a regra da 28b escolhia UM tile por CÉLULA e usava nas 6 faces. O tile
> é uma imagem de 2 eixos, e cada face amarra esses eixos a direções de mundo diferentes: no
> topo u/v seguem x/z; na face de baixo seguem x/z INVERTIDOS; nas laterais **um dos eixos é o
> VERTICAL**. Daí o topo sair certo e o resto torto.
>
> **Correção:** `tileAguaDaFace` escolhe o tile **por face**, projetando o vetor de fluxo nos
> eixos daquela face (`FACE_BASES`, derivado de FACES e não escrito à mão — se um canto mudar
> lá, isto acompanha). Lateral perpendicular ao fluxo, e água CAINDO, mostram a onda descendo:
> é a leitura de cachoeira, e é o que provavelmente o usuário viu como "oeste tá certa".
>
> | fluxo | topo | baixo | leste | oeste | norte | sul |
> |---|---|---|---|---|---|---|
> | sul→**norte** (referência) | norte | norte | norte | norte | baixo | baixo |
> | oeste→**leste** | leste | leste | baixo | baixo | leste | leste |
> | **sudeste** (diagonal) | leste+sul | leste+sul | sul | sul | leste | leste |
> | **parada** (mar/lago) | — segue o vento nas 6 — ||||||
>
> **358 testes** (3 novos, escritos sobre o helper PURO em vez de UV crua — muito mais legível
> que reverter UV no teste) · typecheck · build · smoke 6/6. Bug-533.

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

## 🚀 Próxima fase — §🌬️ FECHADO E APROVADO. Escolher do backlog.

**O §🌬️ (vento + vida ambiental) foi entregue INTEIRO na sessão 28** — as 6 frentes — e o
usuário **rodou o bench no PC dele e no notebook do lab e aprovou**: *"achei tudo muito top"*.
As duas ressalvas que ele levantou já foram fechadas: a regra da correnteza (28b) e o sentido
dela por face (28c). **Não há próximo passo obrigatório.**

**⚠️ O que NÃO existe é o NÚMERO.** Ele aprovou por sensação; nenhum perfil JSON com o §🌬️
ligado voltou pra análise. Isso só importa se alguém quiser o custo de nuvens/balanço **no
relatório** — aí o passo é exportar o perfil e comparar com a régua do lab (`…-l9xf.json`:
50 FPS · p95 26,7 · GPU méd 13,0 / p95 16,8 · carga 4 508 ms). O A/B já está pronto pra isso:
`settings.nuvens` e `settings.balanco` desligam as duas em Configurações, e ambas estão
fixadas em `BENCH_SETTINGS` pra o perfil medir o jogo que o aluno joga. **Não é gatilho aceso
— é material opcional de relatório.**

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

1. **GPU p95 16,8–19,6 ms contra 16,7 ms** de orçamento de 60 FPS no lab. **O mesher acabou.**
   Se um dia o FPS incomodar de novo, o alvo é GPU — teto de `raioRender` em GPU fraca,
   overdraw da água, custo de fragment. **Greedy meshing continua DESCARTADO:** draw calls
   (633) e triângulos (188 048) do lab são IDÊNTICOS aos do PC de dev, então não é aí que a
   máquina fraca perde.
2. **Notebook em modo economia de bateria trava em 30 FPS** (`p50` 33,3 ms cravado, GPU 28%
   mais cara). É política de energia do Windows. Perfil medido nesse estado NÃO serve pra
   comparar otimização — checar o estado da máquina antes de concluir qualquer coisa.

### Backlog aberto — o usuário escolhe

- ~~`ROADMAP.md §🌬️` — vento + vida ambiental~~ **FEITO na sessão 28** (frentes 1 a 6).
  Sobrou só o que o §🌬️ NÃO pediu: som do vento; vento empurrando partículas/chuva;
  o vento entrar na física (decisão explícita: é SÓ visual até alguém decidir o contrário).
- **Som de água** (splash/borbulha/balde, WebAudio em `audio.ts`) — 4ª opção do refino de
  água, nunca escolhida.
- **Candidatos** (ver ROADMAP.md): layouts mobile · auto-update do servidor · sobrevivência
  (fome/vida/craft) · v2 da geração.

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
```

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
