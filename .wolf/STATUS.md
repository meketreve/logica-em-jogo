# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Last updated: 2026-07-16
> **TOUCH CONTROLS FEITOS (2026-07-16):** tablet joga (joystick/arrasto/botões);
> teste em TABLET REAL pendente — era o último blocker do piloto de amanhã.
> **INFRA DO PILOTO (2026-07-15, PLAYTEST DO USUÁRIO PENDENTE):** (1) servidor
> serve o cliente na MESMA porta (aluno abre http://ip-do-prof:8080 e joga, sem
> Vite separado); (2) varredura das mensagens de erro (66+ reescritas, frase
> culta e clara); (3) **cp19 — trocar de aula SEM derrubar a turma** (`/mundo
> carregar nome`, ninguém reconecta, professor segue professor); (4) cenários em
> `cenarios/` são MODELO (nunca escritos) — o autosave grava CÓPIA DE TRABALHO em
> `aulas/`, então distribuir um .ljw não carrega a turma anterior. Smoke cp19
> 13/13, typecheck 3/3. **.exe/empacotamento ADIADO** (usuário ainda vai mexer).
> **MVP v2 FECHADO (2026-07-13): plataforma de autoria completa — professor cria
> cenário inteiro dentro do jogo (painel ou comandos), grupos, mundo-modelo
> cabines, tudo persiste e viaja no .ljw.
> POLIMENTO "blocos + mecânica" FECHADO (2026-07-13): cp15–cp18 playtestados e
> APROVADOS. 137 testes, typecheck 3/3, build.
> **CENÁRIOS PEDAGÓGICOS CODADOS (2026-07-14) — PLAYTEST DO USUÁRIO PENDENTE.**
> 3 aulas geradas por script (`npm run cenarios`), auto-conferidas, com roteiro
> de aula. Turma do piloto: **6º–9º**. Achado que bloqueava o piloto e já
> corrigido: bug-172 (Vite dev só atendia localhost → aluno na LAN não abria o
> cliente).
> **PRÓXIMO: playtest dos 3 cenários → piloto com a turma → relatório.** Água
> fica FORA (fluido = fase própria). cp10 (validação de física no servidor)
> segue ADIADO — sem gatilho.**

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

---

## 🚀 Próxima fase — pós-MVP (v0 FECHADO 2026-07-11; seções abaixo = referência viva de escopo/stack/política)

**Objetivo:** mundo voxel jogável no navegador com netcode cliente=servidor, blocos
colocáveis/quebráveis, areia com gravidade, e chat com 1 comando de teste.

### Escopo do MVP v0 (ENXUTO — travado)
- Blocos: **grama, pedra, pedregulho, areia** (areia afetada por gravidade).
- Movimentação 1ª pessoa (WASD + mouse look / pointer lock).
- Colocar e quebrar bloco.
- **Netcode cliente=servidor** (igual Minecraft): singleplayer roda servidor local
  embutido no cliente; LAN = host serve os outros. Servidor é autoritativo.
- Chat + **1 comando simples** só pra provar o pipeline de comando (parser no servidor).
- Sem som (mas prever **gatilhos de som** — hooks de evento pra plugar áudio depois).
- Texturas simples.

### FORA do MVP v0 (adiar, explicitamente)
- Crafting / inventário / "produzir item".
- Comandos complexos (`/tp` etc.), níveis de permissão elaborados.
- Salvar mundo no Drive (fica só no host; exportar Drive é manual/futuro).
- Circuitos lógicos, truth tables, sequência de blocos coloridos (vêm depois; ver arquitetura).
- Contas com senha; painel completo de professor.
- Mundos publicados online (por ora compartilhamento manual via Drive).

### Critérios de aceitação
1. ✅ Abrir no navegador, andar num mundo de blocos, colocar e quebrar bloco.
2. ✅ Areia cai quando o bloco de baixo é removido — via TICK DO SERVIDOR, não hack no cliente.
3. ✅ Dois clientes veem o mesmo mundo e as mudanças um do outro (host + 1 cliente).
4. ✅ Chat funciona e 1 comando de teste executa no servidor e reflete no mundo
   (playtest do usuário 2026-07-11 ✅).

### ⚠️ Regra de ouro de arquitetura (vibecode vai errar isso)
Areia, circuitos e detecção de objetivo são **o MESMO subsistema**: "bloco muda de estado,
avisa vizinhos, propaga no tick do servidor". NÃO implementar areia como `if (bloco===AREIA)`
especial — implementar como regra genérica de atualização de bloco por vizinhança, senão
circuitos do 9º ano exigem reescrita. Areia = 1 vizinho/1 regra. Circuito = N vizinhos/N regras.

Idem: validação de objetivo (coletar N, chegar em coord) e sequência de blocos coloridos
= mesmo sistema de "checar estado do mundo contra um padrão". Um sistema, várias idades.

### Stack (TRAVADA — completa)
TypeScript em tudo + módulo de lógica compartilhado; build **Vite**; servidor **Node + ws**;
empacotar depois com Tauri/Node SEA. Render 3D: **three.js** (FECHADO 2026-07-10 — ver
cerebrum Decision Log). UI/chat em HTML/CSS por cima do canvas, não GUI de engine.

**Local do projeto (ATUALIZADO 2026-07-10):** projeto INTEIRO (docs + `.wolf/` + código
futuro) movido para `~/projetos/logica-em-jogo` (filesystem do WSL). Motivo: node_modules
no OneDrive trava sync e watcher do Vite via /mnt/c é lento. Cópia no OneDrive fica como
arquivo morto/backup dos docs. Backup do código: git (repo privado no GitHub) — criar no scaffold.

### Política de otimização (FECHADA 2026-07-10 — "não otimizar o desnecessário")

**Baseline (checkpoint 1 — viabilidade/estrutura, não otimização):**
- 1 mesh por chunk (BufferGeometry única). NUNCA 1 mesh/objeto por bloco.
- Culled meshing: só gerar faces vizinhas de ar (corta >90% das faces).
- Chunk = `Uint8Array` plano (4096 bytes por 16³). Estrutural: afeta /shared, snapshot, save.
- Texture atlas → 1 material, 1 draw call por chunk.
- Mesher = função pura (bytes → geometria) → mover pra Worker depois fica barato.
- Tick fixo do servidor (~10 tps) desacoplado do render.
- Updates por fila de vizinhança sujos (regra de ouro), sem scan do mundo todo.
- Mundo pequeno de tamanho **definido na criação** (em chunks X×Z×Y), gravado no header
  do save e do `world_snapshot` — cliente nunca assume tamanho. Sem resize ao vivo.
  Default v0: 8×8×4 chunks (128×128×64 blocos, 1 MB). Teto validado pelo servidor:
  16×16×8 (revisar com métricas do lab). UI de escolha = fase de autoria, não MVP.
- `world_snapshot` binário (bytes de chunk); resto do protocolo JSON.
- Render: **WebGLRenderer** (WebGPU experimental + PCs fracos de escola).
- **HUD de perfilação (F3)** desde o checkpoint 1: FPS, frametime (méd+p95), tempo de
  remesh, draw calls/triângulos (`renderer.info`), msgs/s + bytes/s. Servidor manda
  `debug_stats` 1×/s com duração do tick (a partir do checkpoint 2). Botão exporta JSON
  (dados p/ testes no lab e p/ relatório final). FORA: flame graph, telemetria persistente,
  dashboard — DevTools já cobre análise profunda.

**Adiadas (só com gatilho medido):**
- Greedy meshing ← FPS baixo em PC do lab (32³: ~73k→4k vértices, mas remesh + UV complicam).
- Meshing em Web Worker ← hitch de frame ao editar/carregar chunk.
- ✅ Lerp de jogadores remotos — GATILHO DISPAROU (2026-07-11, usuário reportou
  serrilhado): interpolação exponencial no render loop (bug-062). Taxa segue 10 Hz.
- gzip no save ← save > alguns MB.

**Proibidas (overengineering p/ 20 alunos LAN, mundo pequeno):**
- Client-side prediction/rollback (LAN ~1ms). ECS. Octree/SVO. InstancedMesh/BatchedMesh
  por bloco. WebGPURenderer. protobuf/msgpack. LOD/streaming/occlusion culling.
  Servidor multithread. WASM.
- Frustum culling: three.js já faz por objeto — nada a construir.

### Plano de arquitetura (APROVADO 2026-07-10 — construir a partir daqui)

Monorepo:
- `/shared` — lógica AUTORITATIVA (mundo, blocos, física da areia, tick, aplicar ações).
  TS puro, ZERO dependência de navegador ou Node. Roda igual nos 3 hospedeiros.
- `/server` — embrulha `/shared`. Web Worker (single) OU Node+ws (host). Única "verdade".
- `/client` — three.js. SÓ desenha e manda input. Nunca decide estado.
  REGRA: se uma linha decide estado do mundo e está em `/client`, está no lugar errado.

Cliente=servidor: o cliente SEMPRE fala com um servidor por WebSocket, mesmo sozinho
(single = Web Worker na aba; LAN = .exe do professor). Mesmo código de cliente, mesma
conexão, mesmas mensagens — cliente não sabe qual hospedeiro é.

Protocolo v0 (só isso):
- cliente→servidor: `join`, `move`, `place_block`, `break_block`, `chat`
- servidor→cliente: `world_snapshot`, `block_changed`, `player_moved`, `chat`, `debug_stats` (1×/s, duração do tick)
- Areia caindo chega como `block_changed` normais (cliente não sabe que foi gravidade).
- Header do `world_snapshot` carrega dimensões do mundo em chunks.

Mundo: chunks pequenos (~16³). IDs: 0=ar, 1=grama, 2=pedra, 3=pedregulho, 4=areia.
Areia = regra de atualização por vizinhança no tick do servidor (MESMA engrenagem dos
circuitos futuros — NÃO código especial de areia).

Ordem dos checkpoints (cada um jogável antes do próximo):
1. ✅ Mundo estático + andar (só cliente three.js, WASD+mouse, sem rede).
2. ✅ Servidor autoritativo (mundo vem de `/shared` via Web Worker; tela igual).
3. ✅ Colocar/quebrar (clique→ação→`block_changed`).
4. ✅ Areia cai (tick de gravidade no servidor).
5. ✅ Segundo cliente (Web Worker → Node+ws; 2 navegadores, mesmo mundo).
6. ✅ Chat + 1 comando (parser no servidor).

Rede de segurança (dev sem revisão): TS estrito; `/shared` sem deps; testes automáticos
em `/shared` desde o checkpoint 2 (gravidade testável sem abrir navegador); cada checkpoint jogável.

**MVP v1 "Aula persistente" — APROVADO pelo usuário (2026-07-11). Decisões travadas:**
- Servidor LAN: SÓ o host salva. Singleplayer: cada jogador salva no PRÓPRIO
  navegador (IndexedDB) + exportar/importar arquivo .ljw (= distribuição Drive).
- Identidade: nome + PIN 4 dígitos por mundo; `/resetpin` do professor.
- Código de professor definido na CRIAÇÃO do mundo; singleplayer = professor automático.
- Menu principal pedido pelo usuário: singleplayer, multiplayer, configurações
  (teclas, som, gráficos). Config v1 = sensibilidade do mouse + teclas + gráficos
  básicos; SOM é placeholder até áudio existir (avisar na tela).

**Checkpoints do MVP v1:**
1. ✅ **cp7 — save/load no host Node (2026-07-11).** `/shared/save.ts`: formato
   .ljw = u32 magic "LJS1" | u32 len | JSON meta (seed, spawn, roster) |
   snapshot LJW0 (auto-validado). JSON de meta cresce sem re-versionar (PIN/papel
   entram aí no cp9). Session: `opts.restore` (NADA recalculado — princípio
   bug-010), `toSave()` (online = pos atual; offline = roster), roster por nome →
   volta-onde-parou via msg `teleport` nova (enviada após snapshot; serve o /tp
   futuro). Host index.ts: LJ_PORT/LJ_SAVE por env, carrega no boot (corrompido →
   renomeia .corrompido-*, NUNCA sobrescreve evidência), autosave 30 s, SIGINT/
   SIGTERM gravam (escrita atômica tmp+rename). Cliente: handler de teleport
   (5 linhas). 67 testes (7 novos), typecheck 3/3, build ok. Smoke real 2 fases
   (sobe→edita→SIGINT→reabre): tijolo persiste, ana volta onde parou ✅.
   `.gitignore`: *.ljw. Worker (singleplayer) NÃO salva ainda — é o cp8.
   Playtest ✅ (2026-07-11: "editei, fechei, voltei e salvou") com 2 achados,
   ambos corrigidos: bug-061 (todos os clientes entravam como "jogador" → roster
   por nome fundia os dois; ponte = nome único por navegador via localStorage
   `lj-nome`, `?nome=` força; fix DEFINITIVO = PIN no cp9) e bug-062 (movimento
   remoto serrilhado → lerp exponencial, ver política de otimização).
2. ✅ **cp8 — menu principal (2026-07-11, playtest pendente).** Novos no cliente:
   `menu.ts` (telas início/mundos/rede/config; só ESCOLHE — main inicia),
   `worldStore.ts` (IndexedDB "logica-em-jogo"/"worlds": list/put/delete +
   exportar = download .ljw + importar valida com decodeSave), `settings.ts`
   (localStorage "lj-config", merge defensivo: sensibilidade, FOV, nitidez/
   pixelRatioCap, volume guardado-mas-inerte, rebind de 7 ações). Worker ganhou
   canal de HOST fora do protocolo de jogo: `{hostType:"init", save?, seed?}`
   antes do join e `save_request`→`save` (quem grava IndexedDB é o CLIENTE;
   worker só serializa). main.ts: boot → menu (ou `?server=` pula), conn virou
   let, `connect()` reaplica config, singleplayer autossalva 30 s + grava logo
   após snapshot (mundo nasce salvo), botão "salvar e voltar ao menu" no overlay
   (rede: só "voltar" — host salva). Nome do jogador editável no menu (lj-nome).
   Teclas do loop vêm de settings.keys. Typecheck 3/3, build ok, 67 testes,
   screenshots: menu renderiza; jogo via ?server intacto.
   **Playtest ✅ (2026-07-12, "top") com 4 pedidos, todos feitos:** rebind trava
   1 captura por vez (bug-075); F3 mostra pos + bloco; move REATIVO no cliente
   (parado = heartbeat 1×/2 s, mudou = 10 Hz — 20 alunos parados: ~200 msg/s →
   ~10); presença no join (bug-076: servidor manda player_moved do estado de
   cada online pro novo, pós-snapshot, e anuncia o novo — sem isto jogador
   parado era invisível pro recém-chegado, e o heartbeat agravaria). 68 testes,
   smoke de presença contra servidor real ✅.
   **+ Orientação persistida (2026-07-12, pedido do usuário):** roster/SavedPlayer
   ganharam yaw/pitch; `teleport` carrega orientação e o cliente aponta a câmera
   (input.yaw/pitch) — volta olhando pra onde olhava. Saves ANTIGOS continuam
   válidos (campo faltando → 0; testado). Playtest do usuário ✅ ("funcionou").
   **cp8 FECHADO.**
3. ✅ **cp9 — PIN + papel de professor (2026-07-12, FECHADO — playtest do
   usuário ✅ "tudo rodou").** PIN e código de professor em **TEXTO PURO** no
   save (decisão do usuário: sem dado sensível, sem hash — a pendência de
   crypto.subtle/pré-hash morreu junto; `/shared/auth.ts` = isValidPin +
   constantes de rate-limit). Protocolo: join ganha `pin`/`codigo`
   opcionais; msg `join_denied` (motivo) — recusa não manda MAIS NADA.
   Session: mapa `identity` (pin/papel por nome) SEPARADO do roster
   (posição); ordem do join estrito: nome-já-online (antes do PIN — fecha
   bug-061 de vez e não vaza acerto) → lockout (5 erros no nome → 30 s;
   código errado tem contador GLOBAL próprio) → PIN 4 dígitos → código de
   professor (errado NEGA — professor precisa saber que errou); 1ª entrada
   registra o PIN; papel persiste. `/bloco` e `/resetpin nome` só professor
   (resposta explica); welcome anuncia comandos só pra professor.
   `singleplayer: true` (worker) = sem PIN, professor automático, e papel/PIN
   NÃO persistem (mundo single exportado pra LAN não dá professor de graça);
   identity restaurada do save sobrevive mesmo em singleplayer (LAN→single→LAN
   não perde PINs da turma). Save: pin/papel/codigo no JSON de meta (save
   antigo segue válido). Host Node: LJ_CODIGO define/troca o código; sem env
   usa o do save; mundo novo gera 6 chars — e IMPRIME no console em TODO
   boot (recuperação grátis, texto puro permite). Cliente: campos PIN
   (numeric, nunca salvo — PC de lab é compartilhado) e código na tela rede;
   `?pin=`/`?codigo=` no boot via `?server=`; join_denied → alert + menu
   limpo. 82 testes (14 novos), typecheck 3/3, build ok. Smoke real 2 fases
   (registro/recusas/gating/resetpin → reboot: PIN e papel persistem)
   12/12 ✅. Screenshot headless: join com PIN renderiza mundo + welcome
   de aluno.
4. **cp10 — ADIADO (2026-07-12):** validação de física do move no servidor.
   Playtest do MVP v1 não apontou necessidade; retomar só com gatilho (trapaça
   real em aula ou física divergindo entre cliente e servidor).

**Critérios de aceitação do MVP v1:**
1. Fechar o host (Ctrl+C ou autosave), reabrir → mundo E posições intactos. ✅ (cp7)
2. Menu: criar mundo single, jogar, fechar aba, voltar → continua do save local. ✅ (cp8)
3. Exportar mundo single pra arquivo e importá-lo em outro navegador/host. ✅ (cp8; smoke)
4. Aluno não entra com nome alheio sem o PIN; professor reseta PIN; aluno não roda /bloco.
   ✅ (cp9; playtest do usuário 2026-07-12 ✅).

**→ MVP v1 FECHADO (2026-07-12): os 4 critérios atendidos e jogados.**

**MVP v2 "Cenários/Autoria" — entrevista de escopo (2026-07-12). Decisões travadas:**
- Cenário = mundo + objetivos + texto por objetivo, TUDO no MESMO .ljw
  (meta JSON cresce sem re-versionar — desenho do cp7).
- Modo de progressão POR CENÁRIO, autor escolhe: sequencial (fase a fase)
  OU lista livre (qualquer ordem).
- Tipos de objetivo v2 (TODOS aprovados; mesma engrenagem das rules — checar
  estado do mundo contra padrão): (a) construir padrão em região (gabarito),
  (b) chegar em local (região-alvo), (c) limpar região (= (a) com padrão ar).
- Autoria: comandos de chat PRIMEIRO (usáveis antes do painel existir),
  painel HTML depois; marcar região com cliques (varinha do professor) +
  painel pra texto/ordem.
- Gabarito WYSIWYG: professor constrói o exemplo no mundo, marca a região,
  jogo "fotografa" os blocos. Escolha POR OBJETIVO: manter modelo visível
  pro aluno copiar OU apagar.
- Progresso por MUNDO e por GRUPO (ambos). Sistema de grupos NOVO:
  professor cria grupos por comando `{quantidade por grupo}`; aluno entra
  por comando OU painel; painel do aluno só abre DEPOIS do professor criar
  grupos com sucesso. Singleplayer = grupo de 1 implícito.
- HUD do aluno: objetivo ativo + texto + contador ao vivo (ex. 12/20
  corretos); completou → mensagem de chat do servidor + próximo objetivo.
  Gatilho de som via events.ts (já existe).
- Grupos (2ª rodada, 2026-07-12): `/grupo criar` AUTO-DISTRIBUI todos os
  online (round-robin) e NOTIFICA cada aluno; entrar/trocar por comando ou
  painel; aluno sem grupo NÃO participa (HUD/chat avisa — professor vê quem
  ficou de fora); mundo SEM grupos criados = modo turma-toda-junta (grupos
  são opcionais); grupo PERSISTE no save (projetos de várias aulas);
  `/grupo criar` de novo = reseta. Parâmetro (decidido 2026-07-12): as DUAS
  sintaxes — `/grupo criar 5` = 5 grupos; `/grupo criar 5 alunos` = grupos
  de 5 alunos.
- Construir por grupo: 1 gabarito + 1 área de trabalho POR GRUPO (grupo
  completa quando a SUA área bate com o gabarito). Marcação manual (varinha)
  + comando/painel de CARIMBO: dita tamanho da área e espaçamento em blocos
  entre áreas, replica N vezes.
- Mundo modelo "cabines": plano; cabines no canto do chunk com o lado aberto
  voltado pro centro do chunk; cabine do professor guarda a sequência-gabarito,
  alunos replicam nas cabines dos grupos.
- "Chegar em local": conclusão CONFIGURÁVEL POR OBJETIVO — todos os membros
  do grupo na região OU basta um (depende da idade da turma).
- Mundos predefinidos: SIM no v2 (pedido do usuário) — preset "plano" na
  criação de mundo + mundo-modelo de cabines gerado com a ferramenta de
  carimbo.

**Checkpoints do MVP v2 (plano APROVADO 2026-07-12):**
1. ✅ **cp11 — varinha + regiões nomeadas (2026-07-12, playtest do usuário ✅
   "testei tudo" — inclui áudio de UI). cp11 FECHADO.**
   Novo em `/shared`: `regions.ts` (NamedRegion min/max inclusivo,
   regionFromCorners normaliza cantos, regionContains/regionDims,
   parseNamedRegion defensivo — reusado por protocolo E save; MAX_REGIONS=64).
   Protocolo: `wand_mark {corner:1|2,x,y,z}` client→server; `regions` (lista
   COMPLETA) server→SÓ professores (join + após criar/apagar — o que o aluno
   vê é decisão do objetivo no cp12); `spawn` ganhou `papel?` opcional
   (cliente habilita UI de professor; host antigo compatível). Session:
   cantos pendentes por cliente (rascunho, morre no disconnect/criar),
   `/regiao criar nome · apagar nome · lista` (só professor), regiões no
   meta do save via toSave/restore. Cliente: `regions.ts` (wireframes HSL +
   2 marcas de canto amarelo/ciano), tecla R (rebindável, "varinha") alterna
   modo varinha — clique esq/dir marca canto 1/2 na célula MIRADA, hotbar
   vira hint; welcome do professor anuncia /regiao. 95 testes (8 novos em
   regions.test.ts: puras + protocolo + sessão + persistência), typecheck
   3/3, build ok. Screenshot headless: professor via ?server vê wireframe
   da região do save ✅.
   **+ Áudio de UI (pedido do usuário, mesmo dia):** `client/audio.ts` —
   WebAudio sintetizado (zero assets, regra do projeto): click/back/confirm
   nos botões do menu (delegação), notify no chat recebido, denied no
   join_denied; volume das configurações agora FUNCIONA (slider ativo,
   amostra ao soltar); AudioContext só nasce em gesto (autoplay policy) —
   mensagens de rede só tocam se o contexto já existe. Playtest PENDENTE.
2. ✅ **cp12 — objetivos + detecção + HUD (2026-07-12, playtest do usuário ✅
   "tudo testado e funcionando"). cp12 FECHADO.**
   **+ Polimento de UI pós-playtest (2026-07-12, pedidos do usuário, playtest
   PENDENTE):** (a) ZERO popups nativos — prompt/confirm/alert viraram UI
   inline (criar mundo = input+checkbox plano na tela de mundos; apagar = 2
   cliques com desarme em 3 s; erros de import/endereço/PIN = `.menu-erro`
   inline; join_denied atravessa o reload via sessionStorage "lj-erro" e vira
   banner no menu — bônus: alert não trava mais screenshot headless/bug-093);
   (b) mira invisível sem pointer lock (updateOverlay também controla
   #crosshair); (c) menu Esc DE VERDADE: overlay virou painel .menu-screen
   com "voltar ao jogo" (re-lock), "configurações" (MESMO buildConfigScreen
   do menu principal, exportado com parâmetro body+onChanged — aplica AO
   VIVO: sensibilidade/FOV/nitidez/volume/teclas; Input.rebind() move
   atalhos chat/HUD/varinha na hora) e "salvar e voltar ao menu". Screenshot
   headless do menu Esc ✅ (sem mira no centro).
   Novo em `/shared`: `scenario.ts` — Objective (id/kind/texto/min-max CÓPIA
   da região + gabarito), snapshotRegion/matchRegion (ordem canônica y→z→x;
   corretos/alvo/extras separados), countSolid, parsers defensivos
   (parseScenarioMeta pro save, parseObjectiveState pro fio). DECISÃO DE
   DESIGN: construir tem região MODELO (fotografada no add) ≠ região ALVO
   (detectada) — mesma região = fluxo "apagar depois" (senão nasce completo;
   o comando RECUSA alvo que já bate). Sessão: `/objetivo add construir
   modelo alvo texto…` / `add chegar|limpar regiao texto…` / lista / remover
   / `modo sequencial|livre` / resetar (conclusão NUNCA desfaz; reset exige
   ação nova); detecção pela REGRA DE OURO: applyBlock marca objetivosDirty
   → tick recheca (areia caindo no alvo conta); chegar = move pisou na
   região; sequencial só ativa o primeiro incompleto (pisar no futuro não
   vale). Broadcast `objectives` pra TODOS (dedup por JSON; anúncio de
   conclusão no chat SEMPRE depois do estado — som certo no cliente).
   `/regiao encher nome id` (autoria: id 0 limpa; não empareda jogador;
   teto 4096). Preset "plano" (`generateFlatWorld`: bedrock/terra/grama):
   confirm() na criação de mundo, `?flat` no init do worker, LJ_PLANO=1 no
   host Node. Cenário persiste no meta .ljw (save antigo válido). Cliente:
   `objectivesUi.ts` (painel canto sup. direito: ativos + contador ao vivo
   + "cenário completo"), caixas VERDES nos alvos ativos (aluno vê o alvo;
   RegionRenderer ganhou cor fixa), som de conquista (confirm) suprime o
   ping de chat por 800 ms. 110 testes (14 novos), typecheck 3/3, build ok,
   screenshot e2e visão do aluno ✅ (mundo plano + painel 0/4 + caixa verde
   + modelo de lãs).
3. ✅ **cp13 — grupos + progresso por grupo (2026-07-12, playtest do usuário
   ✅ "testei tudo, funciona"). cp13 FECHADO.**
   Novo em `/shared`: `groups.ts` (GroupDef, parseGroups, MAX_GRUPOS=20).
   `/grupo criar 5` = 5 grupos; `/grupo criar 5 alunos` = grupos de 5
   (só professor; RE-CRIAR zera composição E progresso por grupo);
   auto-distribui alunos online em round-robin (professor FORA) + notifica
   cada um; `/grupo entrar n · sair · lista` (todos); aluno que chega depois
   cai no MENOR grupo; grupo persiste no save (meta `grupos`); msg `group`
   (pessoal: join + mudanças). Progresso: `completosGrupo` (chaves
   `obj:grupo`, persiste em cenario.completosGrupos); objetivo COMPARTILHADO
   concluído vale pra todos os grupos; chegar em modo grupos é SEMPRE por
   grupo (sem grupo NÃO pontua); sequencial anda POR GRUPO (ritmos
   diferentes — pisar em objetivo futuro não vale). Objetivo per-grupo:
   `alvos: Box[]` (área por grupo) — `/objetivo add` resolve nome exato =
   compartilhado, `nome-1…N` = per-grupo; construir valida dims/instant-
   complete POR área; min/max do construir per-grupo = caixa do MODELO
   (referência visual). `/regiao carimbar modelo prefixo espacamento [z]`:
   replica a região modelo (BLOCOS inclusos — cabines!) 1× por grupo ao
   longo do eixo e nomeia prefixo-1…N (valida bounds ANTES de mudar
   qualquer bloco). `/objetivo add chegar regiao [todos|um] texto` — todos =
   grupo inteiro online dentro ao mesmo tempo. `objectives` ganhou
   `porGrupo[]` (mesma msg pra todos; cliente escolhe a própria linha).
   Cliente: HUD do aluno = progresso DO SEU grupo + "seu grupo: n"; aluno
   sem grupo = aviso; professor = resumo por grupo (`g1 2/4 · g2 ✓`);
   caixas verdes = alvo do MEU grupo (+ modelo no construir; professor vê
   todas); trocar de grupo re-sincroniza sem tocar som. 120 testes (10
   novos), typecheck 3/3, build ok, screenshots professor+aluno ✅.
   **+ Config em CATEGORIAS (pedido do usuário): controles (sensibilidade +
   teclas) · som (volume) · gráficos (FOV + nitidez), mesma tela no menu
   principal e no Esc.**
4. ✅ **cp14 — painéis HTML + mundo modelo (2026-07-13, playtest do usuário
   ✅ "testado". cp14 FECHADO — MVP v2 COMPLETO).** Desenho central:
   painel = AÇÚCAR sobre comandos de chat —
   cada botão compõe /objetivo|/regiao|/grupo e manda como msg `chat`;
   validação segue 100% no servidor, ZERO protocolo novo pra ações; estado
   volta pelos broadcasts. Novo em `/shared`: msg `groups` (composição
   completa pra TODOS — join manda direto pro novo, mudanças broadcast);
   `/objetivo texto id novo…` e `/objetivo mover id pos` (ordem re-ativa o
   sequencial); `WorldPreset` normal|plano|cabines + `generateCabinsWorld`
   (1 cabine de tábuas POR CHUNK no canto, 5×5, paredes 2 alto, lado +x
   aberto pro centro do chunk, sem teto; spawn desloca +8 pro meio do
   chunk); SessionOptions.preset (vence flat, que virou alias). Hosts:
   worker init aceita `preset`; Node LJ_PRESET=plano|cabines (LJ_PLANO=1
   ainda vale). Cliente: `panels.ts` (AuthorPanel professor: modo, lista de
   objetivos com ↑↓/editar texto/remover armado, criar objetivo com selects
   de região — inclui opção per-grupo prefixo-1…N, regiões com criar/apagar/
   encher/carimbar, grupos criar N/de N; GroupPanel aluno: lista com
   membros, entrar/sair; rascunho sobrevive re-render, re-render adia com
   input focado, Esc fecha); tecla P rebindável ("painel"); `blocksUi.ts`
   (PLACEABLE compartilhado hotbar+painel); menu de criação com SELECT de
   tipo de mundo (pedido do usuário no meio da sessão); aviso de aluno sem
   grupo aponta a tecla do painel; `?painel` abre no boot (headless).
   129 testes (9 novos em cp14.test.ts), typecheck 3/3, build ok. Smoke
   real 10/10 (cabines+spawn, groups broadcast, trocar grupo, texto/mover).
   Restore noutro host 8/8 = critério 4 verificado (papel/regiões/ordem/
   texto/grupos/cabines intactos). Screenshots ✅ (painel autoria + painel
   grupo, cabines no fundo). bug-151 (TDZ activePanel) corrigido e logado.

**Critérios de aceitação do MVP v2:**
1. Professor cria cenário inteiro DENTRO do jogo e ele persiste no .ljw.
   ✅ (cp12/cp13, playtests do usuário; cp14 soma o painel)
2. Aluno vê objetivo/progresso no HUD, completa, sequência avança. ✅ (cp12)
3. Turma em grupos: auto-distribuição funciona, cada grupo progride na própria área. ✅ (cp13)
4. Mundo-modelo cabines exportado abre em outro host com cenário intacto.
   ✅ (restore-check 8/8 + playtest do usuário 2026-07-13).

**→ MVP v2 FECHADO (2026-07-13): os 4 critérios atendidos e jogados.**

**Checkpoints do polimento "blocos + mecânica" (2026-07-13, TODOS codados —
playtest do usuário pendente):**
1. **cp15 — corrida + agachar.** `/shared/physics.ts`: MoveInput ganhou
   `sprint?`/`sneak?`; PLAYER: sprintFactor 1.6, sneakFactor 0.3,
   sneakEyeHeight 1.32. Edge-guard estilo Minecraft: agachado NO CHÃO,
   passo horizontal que tiraria o suporte é desfeito POR EIXO (hasSupport
   checa bloco sob o footprint; na diagonal o eixo seguro desliza; pode se
   debruçar até |0.8| do centro — footprint ainda toca). Guard só com
   onGround (no ar não trava). Cliente: Ctrl segurado OU duplo-toque no
   andar (<300 ms, latch até soltar); Shift agacha; agachar VENCE sprint;
   sprint exige forward>0. Teclas `correr`/`agachar` rebindáveis (entram
   sozinhas no menu — itera KEY_ACTION_LABEL). FOV +10% correndo e olho
   desce agachado, transições exponenciais (kCam = 1-exp(-dt·20)).
   5 testes novos de física.
2. **cp16 — inventário + hotbar de slots.** Hotbar virou 9 SLOTS
   configuráveis (persistem em localStorage `lj-hotbar`, parse defensivo
   por slot); 1–9 escolhe slot, scroll cicla os 9; HUD mostra slots com
   ÍCONES + nome do bloco selecionado. Tecla E (rebindável `inventario`)
   abre `client/inventory.ts`: grade de TODOS os colocáveis (ícone+nome) +
   faixa da hotbar; clique no bloco → slot selecionado; clique no slot →
   seleciona; Esc/E fecha e re-trava o mouse; exclusão mútua com painel P;
   `?inv` abre no boot (headless). Ícones: `client/blockIcons.ts` recorta o
   tile LATERAL do próprio atlas (blockIconTile novo no mesher) → data URL.
3. **cp17 — 8 opacos novos (IDs 19–26, append):** arenito (estratos),
   pedra-lavrada (fiadas 8×4), neve, obsidiana (pontinhos roxos) + lãs
   rosa/ciano/cinza/marrom (12 lãs no total — sequências mais ricas).
   Atlas tiles 20–27; cobertura automática pelo teste "todo colocável".
4. **cp18 — vidro + folhas (grupo B, IDs 27–28, tiles 28–29).** Abordagem
   CUTOUT: alphaTest 0.5 no material único — pixel opaco ou descartado,
   SEM blending/sorting/draw call extra. `isTransparentBlock()` em blocks;
   regra do mesher: face aparece se vizinho=ar OU opaco→transparente;
   entre transparentes NUNCA (coplanar = z-fight). Transparência é só
   visual (física/raycast tratam como sólido). Vidro = moldura+brilhos
   (resto alpha 0); folhas = verde com 22% de furos. 2 testes de mesher.
   Smoke real 21/21 via /bloco (servidor aceita ids novos) + screenshot:
   lã vermelha visível ATRAVÉS da parede de vidro.

**Critérios de aceitação do polimento — TODOS ✅ (playtest do usuário 2026-07-13):**
1. ✅ Correr com Ctrl E com duplo-W; agachado na beirada não cai; FOV/câmera
   respondem. 2. ✅ E abre inventário, monta hotbar própria, persiste ao
   reabrir o navegador. 3. ✅ Blocos novos aparecem no inventário e no mundo
   com textura certa ("todos top" — cobre o playtest pendente do grupo A).
   4. ✅ Vidro/folhas: vê-se através, sem faces piscando.

**→ POLIMENTO FECHADO (2026-07-13).** Achados do playtest, todos corrigidos e
re-playtestados ✅:
- **bug-168 (cp15):** correr dava velocidade total no ar. `PlayerState.sprinting`
  novo = corrida ENGATADA: só liga com os pés no chão + tecla de correr.
  **2ª rodada de playtest:** a tecla NÃO precisa ficar segurada — engatada, a
  corrida vale enquanto o "frente" estiver apertado (semântica do Minecraft) e
  atravessa pulo/queda; desengata ao soltar o "frente" ou agachar. FOV do
  cliente segue `player.sprinting`, não a tecla. 2 testes.
- **bug-167 (cp18):** face da folha colada no vidro sumia. Regra do mesher agora
  olha SÓ o vizinho: aparece se vizinho é ar OU transparente de OUTRO id; mesmo
  id funde (vidraça contínua); vizinho opaco esconde. Coplanares opostas não
  brigam (material FrontSide → a de trás é backface). Teste atualizado.
- **bug-169 (UI):** config tinha DOIS "voltar". `buildConfigScreen(body, onChanged?,
  onBack?)` virou dona do único botão (raiz → menu anterior; categoria → raiz);
  backs estáticos saíram de #menu-config e #overlay-config. Demais menus revisados
  (mundos/rede/pausa: um voltar cada).
- **Pedido novo (feito):** botão do MEIO do mouse copia o bloco mirado pro slot
  selecionado (só colocáveis — bedrock não vai pra mão); hint do Esc atualizado.
136 testes ✅, typecheck 3/3 ✅, build ✅.

- **CENÁRIOS PEDAGÓGICOS — 3 aulas (2026-07-14, PLAYTEST DO USUÁRIO PENDENTE).**
  Decisões da abertura: piloto no **6º–9º**; 1º cenário = sequência de lãs nas
  cabines (confirmado); produção por **script gerador**, não à mão no jogo.
  Novo em `/server`: `src/cenarios/gerar.ts` — digita os MESMOS comandos de chat
  do professor (`/grupo criar`, `/regiao criar`, `/bloco`, `/objetivo add
  construir`) contra a GameSession real e grava o .ljw. Não existe caminho de
  autoria privado: cenário que não sai daí também não sai da mão do professor.
  `src/cenarios/verificar.ts` — conferência EMBUTIDA na geração: abre o .ljw num
  servidor NOVO, professor entra com o código, 2 alunos entram e são
  auto-distribuídos, o grupo 1 monta o gabarito e o objetivo TEM que fechar
  (+ guarda de geometria: faixa no chão, fora da cabine, dentro do chunk).
  Cenário que não fecha NÃO vira arquivo (exit 1) — testado negativamente.
  Mundo de cada aula: cabines, dims 6×6×4; cabine do professor no chunk central
  (spawn), 1 cabine por grupo na fileira à frente; faixa de blocos no chão a 4
  passos da porta. As 3 aulas (6º–9º, 5 grupos por padrão):
  1. `aula1-sequencia.ljw` — "Continue a regra" (padrão/generalização): faixa de
     12, os 4 primeiros dados (vermelho-azul-azul-vermelho) → contador nasce 4/12.
  2. `aula2-binario.ljw` — "Escreva 45 em binário" (abstração/representação):
     8 blocos, branco=0/preto=1, faixa vazia → 0/8.
  3. `aula3-depurar.ljw` — "Ache os 2 erros" (depuração): faixa já montada com 2
     células erradas → 10/12; o contador diz QUANTOS, não QUAIS.
  Gabarito é fotografado e APAGADO (aluno infere a regra); flag `--revelar` deixa
  o modelo à vista (vira cópia — turmas mais novas). `.ljw` NÃO vai pro git
  (577 kB, regenerável): versiona-se o gerador + `cenarios/README.md` (roteiro de
  aula: gerar, hospedar, distribuir, gabarito e condução de cada aula, o que
  observar). O .ljw sai com `roster: []` — não viaja com PIN/papel do autor.
  **bug-172 (bloqueava o piloto, corrigido):** Vite dev só escutava em localhost
  → aluno da LAN não abria o cliente; `host: true` em `client/vite.config.ts`.
  bug-173 (cwd do workspace) e bug-174 (comando gera VÁRIAS falas do servidor)
  também logados. 137 testes ✅, typecheck 3/3 ✅.

- **INFRA DO PILOTO — servidor serve cliente + mensagens + cp19 (2026-07-15,
  PLAYTEST DO USUÁRIO PENDENTE).** Três frentes pedidas pelo usuário, nesta ordem:
  1. **Servidor serve o cliente (mesma porta).** Novo `server/src/static.ts`:
     `servirCliente(req,res)` entrega `client/dist` na MESMA porta do WebSocket —
     o aluno abre `http://ip-do-professor:8080` no navegador e joga, sem servidor
     de página à parte e sem digitar endereço de WebSocket. HTTP+WS convivem via
     `createServer(servirCliente)` + `new WebSocketServer({ server: http })`.
     Guarda de path traversal (caminho resolvido tem que ser DIST ou começar com
     DIST+sep; rota desconhecida → index.html; no-store no index). Página 503 de
     aviso se o cliente não foi buildado. Boot imprime o IP da LAN
     (`enderecoDaRede`) e avisa se falta `npm run build`. Motivo de subir tudo na
     mesma porta: HTTPS bloqueia `ws://` (mixed content) e o servidor da escola
     não tem certificado pra `wss://` — mesma origem resolve.
  2. **Varredura das mensagens de erro (bug-176).** 66+ mensagens de
     `shared/src/session.ts` reescritas de log-de-dev (minúsculo, telegráfico)
     pra frase culta e clara: diz O QUE aconteceu + O QUE fazer. Ex.: "PIN errado"
     → "PIN incorreto para este nome."; "só o professor pode usar /bloco" →
     "Somente o professor pode usar /bloco." ~16 asserts de teste seguiram os
     textos novos (só string, zero mudança de comportamento).
  3. **cp19 — trocar de aula SEM derrubar a turma.** Novo `server/src/mundos.ts`:
     `/mundo lista · atual · carregar nome` (SÓ professor; intercepta no HOST, não
     na sessão — trocar de aula é ler arquivo, e a GameSession não tem filesystem).
     Aceita só NOME de arquivo, nunca caminho (comando chega pela rede da escola).
     A troca: salva o mundo atual → decodifica o novo (corrompido → aborta, nada
     muda) → `session.jogadoresConectados()` → nova GameSession → `adotar()` cada
     cliente (sem PIN/reconexão; professor segue professor; teleport obrigatório —
     coords do mundo velho podem cair na rocha). `session.ts`: join refatorado —
     2ª metade virou `admitir(id,name,papel,migrado)` (reusada por join e adotar);
     `jogadoresConectados()` e `adotar()` novos. Cliente: `chunks.ts` `trocarMundo`
     (descarta TODA a geometria — mundo novo pode ter outro tamanho); `main.ts`
     `reloadWorld` (snapshot pós-jogo recarrega mundo, zera regiões/objetivos/
     grupos, respawn). Smoke real `server/src/cenarios/_smoke-mundo.mjs` 13/13 ✅.
  4. **cenarios/ = MODELO, aulas/ = cópia viva (integridade de dado).** Achado
     durante o cp19: hospedar `cenarios/aula1.ljw` direto fazia o autosave gravar
     roster/PINs/progresso DENTRO do arquivo distribuído — a próxima turma
     começaria com a aula da anterior resolvida. Novo em `server/src/paths.ts`:
     `mundoDeTrabalho(escolhido)` — se o mundo está em `cenarios/`, a cópia de
     trabalho vai pra `aulas/` (mesmo nome); a cópia viva vence o modelo (turma
     continua de onde parou); apagar em `aulas/` recomeça do zero. index.ts
     (boot) e mundos.ts (`/mundo carregar`) carregam do modelo só na 1ª vez e
     autossalvam SEMPRE em `aulas/`; modelo corrompido NÃO é renomeado (é
     distribuído — regenerar). Verificado: swap real deixou os 3 modelos
     byte-idênticos (md5 OK) e criou as cópias em `aulas/`. Gerador regerado com
     `roster: []` confirmado (boot: "0 jogador(es) no roster"). `_smoke-mundo.mjs`
     é smoke MANUAL (precisa do servidor no ar na 8080), não entra no `npm test`.

- **cp20 — BLOCOS LETRA/NÚMERO (2026-07-16, do backlog `ideias para fazer.txt`;
  legibilidade a confirmar no playtest).** 36 blocos-glifo: letras A–Z (ids
  29–54) + dígitos 0–9 (ids 55–64), cubos opacos pelo MESMO caminho das lãs
  (append de id + tile no atlas procedural, zero mesher/protocolo novo).
  `ATLAS.tilesPerRow` 8→16 (64→256 tiles — coube o glifo + folga). FONTE ÚNICA
  `GLYPH` em `shared/mesher.ts` (base=30, letras, dígitos) alimenta BLOCK_TILES,
  o atlas (`paintGlyph`: base creme p/ letra, azul-claro p/ número + a letra via
  `ctx.fillText` bold) e os nomes PT em `blocksUi.ts` — tudo por loop, sempre em
  sincronia. Pedagogia: soletrar palavras / escrever números (enriquece
  sequência e binário). typecheck 3/3, 143 testes (rede "todo colocável" do
  mesher cobre cada glifo como cubo cheio + guard de append), build ok, layout
  do atlas conferido em node (sem overflow, ícones certos, isPlaceable fecha em
  64). **Falta só olho humano na legibilidade do glifo 16px (playtest).**

- **cp21 — CICLO DIA/NOITE (2026-07-16, do backlog; render a confirmar no
  playtest).** SÓ visual, server-autoritativo (a hora não decide nada de jogo).
  Sessão guarda `horaDoDia` (0..24) + `cicloAtivo`; avança determinístico por
  tick (`DIA_SEGUNDOS=600` → dia de 10 min; NÃO usa relógio de parede, hosts
  andam iguais). Broadcast msg nova `time {hora,ciclo}` no join + 1×/s (junto do
  debug_stats). Comandos de professor `/hora dia|noite|amanhecer|entardecer|
  meio-dia|meia-noite|0-23` e `/ciclo ligar|desligar` (sem arg alterna). Cliente
  `daynight.ts`: `SkyCycle` interpola céu (`scene.background`), cor/intensidade
  do sol (arco leste→zênite→oeste) e luz ambiente entre keyframes por hora;
  guarda a última hora do servidor e avança localmente entre syncs (céu sem
  trancos). **NUNCA escurece 100%** (piso de ambiente — aluno constrói de noite).
  **CONFIG (2026-07-16, decisão do usuário):** mundo NOVO nasce em **DIA
  PERMANENTE, ciclo PARADO** (default `HORA_PADRAO=12` + `cicloAtivo=false` —
  o céu não muda durante a aula). **hora + ciclo PERSISTEM no save** (SaveMeta,
  cresce sem re-versionar): mundo de atividade grava ciclo OFF; **sobrevivência
  (futuro) grava a hora corrente → continua de onde parou** no reload. Os 3
  cenários foram REGENERADOS (`npm run cenarios`) com `/hora meio-dia` +
  `/ciclo desligar` explícitos no gerador (day-lock não depende do default —
  sobrevivência pode nascer com ciclo ON no futuro); .ljw conferido: hora=12
  ciclo=false. typecheck 3/3, 150 testes (+time no protocolo; +/hora //ciclo,
  default off e persistência na sessão; +hora/ciclo no save), build; smoke ws
  real: cenário abre em dia permanente travado, /hora exato, /ciclo congela e
  religa, hora avança só com ciclo ON ✅.

- **cp22 — /kicar (2026-07-16, do backlog).** Professor remove aluno por mau
  comportamento. Mora no HOST (`server/index.ts interceptarKicar`, padrão do
  /mundo) porque FECHAR socket é transporte, não estado do mundo. Resolve
  nome→id via `session.jogadoresConectados()` (case-insensitive; remove TODOS os
  homônimos, menos o próprio professor → não se auto-remove), manda msg nova
  `kicked {reason}` pro alvo e fecha o socket 150 ms depois (aviso sai antes),
  avisa a turma no chat. É EXPULSÃO, não banimento — o aluno pode reentrar com o
  PIN (ban list = trabalho futuro se o piloto pedir). Cliente trata `kicked` como
  join_denied (banner no menu, sem alert). smoke ws real 9/9
  (`_smoke-kicar.mjs`): kick, aviso, aluno barrado, nome inexistente, não
  auto-remove ✅.

- **CABINES → PLOT DEMARCADO + /regiao sortear (2026-07-16, pedido do usuário).**
  (1) Tirar as tábuas das cabines: `generateCabinsWorld` não faz mais paredes —
  desenha uma BORDA de pedra-lavrada (StoneBricks) rente ao chão no perímetro do
  footprint 5×5 de cada chunk. Delimita a área do grupo sem parede/teto. Preset
  key segue `"cabines"`; spawn ainda vai pro meio do chunk. `verificar.ts` agora
  confere o marcador. Label do menu virou "áreas demarcadas". As 3 aulas foram
  REGENERADAS (`npm run cenarios`) e passaram no `conferir` embutido.
  (2) `/regiao sortear nome id…` (novo, só professor): preenche a região
  sorteando entre os ids dados — o professor gera um gabarito ALEATÓRIO na hora,
  refotografa com `/objetivo add construir` e reinicia. typecheck 3/3, 152
  testes (+2 sortear), build ✓. **Gerar sequência nova ao vivo já era possível
  só com os comandos existentes** (remover objetivo → limpar area-N → montar na
  faixa modelo → `/objetivo add construir modelo area`); "sequência de
  sequências" = `/objetivo modo sequencial` + N objetivos (uma faixa por
  objetivo por grupo).

- **CONTROLES DE TOQUE (2026-07-16, TESTE EM TABLET REAL PENDENTE).** Tablet
  joga sem teclado/mouse. Novo `client/src/touch.ts`: `isTouchDevice()` =
  media query **`pointer: coarse`** (ponteiro PRIMÁRIO é o dedo; notebook com
  touchscreen fica FORA de propósito — o mouse continua mandando e o pointer
  lock não quebra; `?touch` na URL força, pra testar no desktop) e
  `TouchControls` (DOM+CSS injetados, self-contained): joystick esquerdo
  (8 direções + deadzone, sintetiza as MESMAS teclas de `settings.keys` via
  `input.setKey` — rebind vale), arrasto em área livre = olhar
  (`input.applyLook`, mesma conta e clamp do mousemove), botões quebrar/
  colocar/copiar (disparam os handlers de mouse existentes via
  `input.press(0|2|1)`), pular (segurar), menu (pausa) e blocos (inventário —
  fecha no "✕ fechar" que já existia). `input.ts`: flag `touch` +
  `get active()` (= locked OU touch); `lock()` vira no-op no toque — todos os
  `input.lock()` espalhados (fechar chat/painéis) ficam inofensivos. main.ts:
  loop de movimento/raycast/overlay/mira leem `input.active` (linha do
  pointerlockchange segue `locked`); `startPlay()` no "▶ voltar ao jogo"
  decide lock vs toque; botão menu do touch desliga o modo e mostra o overlay
  de pausa; hotbar TOCÁVEL (pointer-events auto + tap escolhe slot); UI de
  toque some sob chat/painéis/pausa (updateOverlay → `setShown`, que SOLTA
  teclas seguradas — sem andar fantasma). index.html: viewport sem zoom
  (maximum-scale=1, user-scalable=no, viewport-fit=cover) +
  `overscroll-behavior:none; touch-action:none` no body (mata pull-to-refresh;
  menus com overflow próprio seguem roláveis — touch-action não herda pra
  scroller interno). Desktop INTACTO (sem touch, `active === locked`).
  typecheck 3/3, 153 testes, build ✓; screenshots headless contra servidor
  real: com `?touch` = joystick/botões/mira/hotbar no mundo; sem = overlay
  normal, zero UI de toque. **Falta só tocar num TABLET real (rede da
  escola).**

- **TRILHA SEQUENCIAL — auto-limpa + próxima sequência na MESMA faixa
  (2026-07-16, pedido do usuário).** No modo `sequencial`, quando um grupo
  conclui a sequência ativa, o servidor LIMPA a faixa dele e carrega
  automaticamente a próxima na MESMA área (`carregarProximaSequencia` repõe o
  baseline/semente do próximo objetivo ativo). Professor só cria os modelos; o
  aluno percorre as sequências em ordem sem ninguém limpar à mão. **Autoria:**
  `/objetivo modo sequencial` → (para cada etapa) construir o modelo numa região
  `modelo` e `/objetivo add construir modelo <alvo> <texto>`, reusando o MESMO
  `<alvo>` (`area` per-grupo ou uma região compartilhada) em todos → `/iniciar`.
  Cada etapa começa VAZIA por padrão (baseline = estado da faixa no `add`; semeie
  antes do `add` se quiser pista por etapa). `restaurarAreasBaseline` agora
  depende do modo (sequencial = só a faixa ativa; livre = todas). 100% servidor
  (cliente já trata block_changed + objectives). typecheck 3/3, 153 testes (+1).

---

## 🚀 PRÓXIMA QUEST — PILOTO AMANHÃ (2026-07-17): testar touch no tablet + checklist

**Contexto:** o usuário dá aula AMANHÃ (piloto com a turma + relatório de uso).
**Touch controls FEITOS (2026-07-16, ver ✅) — o único blocker de código caiu.**
`npm run build` já rodou DEPOIS do touch: o cliente servido pelo servidor já tem
os controles (se mexer no cliente de novo, rebuildar).

### A. TESTE NO TABLET REAL (única pendência do touch)
Tablet abre `http://<ip-do-professor>:8080` — a UI de toque liga sozinha
(`pointer: coarse`); no desktop, `?touch` na URL força pra demonstrar. Olhar:
joystick anda, arrasto gira a câmera, quebrar/colocar acertam o bloco mirado,
pular segura, hotbar/inventário escolhem a lã, botão menu pausa e "▶ voltar ao
jogo" retoma. Notebook com touchscreen NÃO liga a UI (mouse é o ponteiro
primário — de propósito).

### B. CHECKLIST DE DIA DE AULA (não-código)
1. Host: `npm run build` uma vez, depois
   `LJ_SAVE=cenarios/aula1-sequencia.ljw LJ_CODIGO=<código> npm run start -w server`.
   O boot imprime o IP da LAN.
2. Notebook do professor = host (precisa de Node). Alunos (tablet/notebook) abrem
   `http://<ip>:8080`. TODOS na MESMA rede/Wi-Fi.
3. Rede: Wi-Fi da escola pode ter **isolamento de clientes** (AP isolation) → os
   dispositivos não se enxergam. **Testar UM tablet ANTES da aula.** Firewall do
   host pode bloquear a 8080 → liberar.
   **⚠️ Se o servidor rodar dentro do WSL** (como no PC de dev): o IP que o boot
   imprime é o INTERNO do WSL (172.x.x.x, NAT) — aluno da LAN NÃO alcança. Usar
   o IP do WINDOWS (`ipconfig`) e encaminhar a porta (PowerShell admin):
   `netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=<ip-do-wsl>`
   (+ liberar 8080 no firewall do Windows). Alternativas: Node instalado no
   Windows (roda o servidor fora do WSL, zero proxy) ou WSL2 `networkingMode=mirrored`.
4. Fluxo: aluno digita nome + PIN (registra na 1ª vez); professor também põe o
   código. Auto-distribui em grupos → professor aperta **▶ iniciar** (ou
   `/iniciar 5`). Trocar de aula ao vivo: `/mundo carregar aula2-binario`.
5. **Fallback:** se o tablet falhar (isolamento/WebGL), roda só nos notebooks
   (já funciona hoje).

### C. RELATÓRIO DE USO
Ainda NÃO existe log de conclusão por aluno. Amanhã = **manual**: o HUD do
professor mostra progresso por grupo (`g1 2/4 · g2 ✓`) → screenshots + anotações;
F3 exporta JSON de perf. Relatório de verdade (quem/o quê/quando concluiu,
export) = tarefa à parte, NÃO hoje.

### Deferido / não precisa amanhã
Empacotar em binário único (tem admin, Node roda); trocar stack (decidido: manter
web + empacotar host depois — ver Decision Log); água/outros blocos.

---

## 🗒️ Referência — playtest dos cenários (quando o touch estiver pronto)

**Estado:** motor + autoria + 3 cenários prontos. Falta a única coisa que o
código não prova: **um humano jogando as aulas**.

**Como rodar (1 terminal — servidor já serve o cliente):**
```bash
npm run cenarios                                                    # gera os 3 .ljw
npm run build                                                       # compila o cliente
LJ_SAVE=cenarios/aula1-sequencia.ljw LJ_CODIGO=prof2026 npm run start -w server
```
Todos (professor E alunos) abrem `http://ip-do-professor:8080` no navegador — o
IP sai impresso no boot do servidor. Professor entra com nome + PIN + código
`prof2026`; aluno, sem o código. Trocar de aula ao vivo: `/mundo carregar
aula2-binario` (só professor, ninguém cai). Para desenvolver o cliente com
hot-reload, `npm run dev` (Vite na 5173) segue funcionando. Roteiro e gabaritos
em `cenarios/README.md`.

**Comandos de organização da aula (2026-07-15):** dois comandos de professor
que facilitam abrir a atividade. (1) **`/tp grupos`** — teleporta os alunos
conectados de cada grupo para a área do seu objetivo ATIVO (`areaDoGrupo` →
`alvos[g-1]`; destino = centro da caixa no plano + `findSpawnY` na coluna, nunca
dentro de bloco; professor NÃO se move). (2) **`/iniciar [n [alunos]]`** — macro
num comando: (opcional) recria os grupos com os alunos online, zera o progresso
(mesma semântica de `/objetivo resetar` — exige ação nova) e leva cada grupo à
sua área; avisa a turma "A atividade começou". Botões no painel do professor:
"▶ iniciar atividade" (armado, 2 cliques — zera progresso) e "↦ levar grupos às
áreas". ZERO protocolo novo (reusa `teleport`/`player_moved` — cliente já
trata). Autocomplete conhece ambos. smoke ws real 11/11
(`server/src/cenarios/_smoke-atividade.mjs`).
**+ RESET DE VERDADE (bug-207, 2026-07-15):** reiniciar (`/iniciar` e `/objetivo
resetar`) agora restaura os BLOCOS das áreas ao estado autoral, não só os flags.
`Objective.baseline: number[][]` = fotografia autoral de cada área, capturada no
`/objetivo add` e PERSISTIDA no .ljw; `restaurarAreasBaseline()` repõe via
applyBlock. A faixa da aula1 volta a 4/12 (sementes), não fica vazia nem com o
que os alunos colocaram. Baseline mora no OBJETIVO (não no mundo) → sobrevive ao
autosave da cópia de trabalho. **CENÁRIOS REGENERADOS** (`npm run cenarios`) pra
capturar o baseline — save antigo sem baseline degrada (reset não mexe nos
blocos). 142 testes, smoke ws 11/11, aula1 confere 4/12 no servidor real.

**QoL adicionado no playtest (2026-07-15):** (1) **Tab autocompleta comandos**
no chat — completa a palavra e, com várias opções, cicla a cada Tab (dica acima
do campo); árvore em `client/commands.ts` espelha runCommand (shared) + /mundo
(server). (2) **/mundo sem `.ljw`** — o comando já aceitava extensão opcional;
agora os nomes SÃO EXIBIDOS sem `.ljw` (`semExt` em mundos.ts) e o cliente
cacheia os nomes vistos em `/mundo lista` pra oferecê-los no Tab de `/mundo
carregar` (precisa digitar `/mundo lista` uma vez pra popular). typecheck 3/3,
build, 137 testes, lógica do autocomplete validada em node.

**O que olhar no playtest:**
- O aluno ENTENDE o que fazer só com o enunciado + a caixa verde? (o enunciado
  tem teto de 120 chars — se não couber, isso é atrito de motor)
- A faixa está num lugar bom? (4 passos à frente da porta da cabine)
- A caixa verde VAZIA na cabine do professor (gabarito apagado) confunde?
- ✅ (RESOLVIDO cp19) Trocar de aula ao vivo com `/mundo carregar nome` — validar
  no playtest que o fluxo é natural pro professor (achar o nome, avisar a turma).
- **Fluxo de abertura (2026-07-15):** alunos entram → auto-distribuem nos 5 grupos
  → professor aperta **▶ iniciar atividade** no painel (ou `/iniciar 5` pra
  rebalancear pelos presentes). Valida: teleporte cai num lugar bom pra começar?
  **▶ iniciar** de novo restaura a faixa ao estado inicial (aula1→4/12)? O aluno
  entende que foi reiniciado?
- Tab autocompleta os comandos — o professor acha isso útil / descobre sozinho?
- Falta algum comando que o professor gostaria de ter na hora?
- **Features novas (cp20–cp22, 2026-07-16) a olhar:** (a) blocos LETRA/NÚMERO
  (tecla E, fim da grade) — o glifo 16px é LEGÍVEL no mundo? servem pra soletrar/
  numerar? (b) DIA/NOITE — cenário abre em dia permanente (confirmado no fio); o
  professor consegue demonstrar com `/hora noite` + `/ciclo ligar`? o céu de
  noite deixa ver o suficiente pra construir? (c) `/kicar nome` — o fluxo de
  remover um aluno bagunceiro é natural? (d) PLOT demarcado (sem cabines de
  tábua) — a borda de pedra-lavrada no chão delimita bem a área do grupo? o mapa
  ficou melhor sem paredes? (e) `/regiao sortear modelo <ids>` seguido de
  refotografar + reiniciar — o professor consegue gerar uma sequência nova/
  aleatória na hora?

**Depois:** piloto com a turma no lab → relatório de aplicação (entregável final).

⚠️ **Pendência real do piloto:** o servidor já serve o cliente na mesma porta
(basta `npm run build` uma vez + `npm run start -w server`; o aluno abre o IP no
navegador). Falta só empacotar (Tauri/Node SEA) — ADIADO por decisão do usuário
(ainda vai mexer em coisas); por ora o professor precisa de Node instalado.

**Depois (anotado, não esquecer):**
- **MVP v2 = CENÁRIOS/AUTORIA** (coração pedagógico): objetivos, detecção de
  padrão no mundo = mesma engrenagem das rules.
- **Água** (resto do grupo B: fluido via regra de vizinhança + nado — fase
  própria; vidro/folhas saíram no cp18). **Grupo C** (não-cubos: tocha,
  laje, escada — geometria nova no mesher).
- Playtest das texturas do grupo A pelo usuário (o playtest do cp17/18 cobre).
- **Backlog do usuário `ideias para fazer.txt`** (12 itens). FEITO: letra/número
  (cp20), `/kicar` aluno (cp22), dia/noite (cp21). PENDENTE, por frente: móveis
  (tapete/cadeira/mesa/sofá/cama = GRUPO C, geometria não-cubo — mesher novo);
  porta + janela abre-fecha (bloco COM ESTADO + interação, base de mecanismos
  lógicos); quadro com texto/imagem (feature grande de UI); vidro (já existe
  cp18 — talvez o usuário queira vidraça/painel). Escolha da próxima frente é do
  usuário.

⚠️ Issue conhecida (bug-003, fix PARCIAL, NÃO bloqueante): pulos ocasionais de câmera
por spikes de movementX/Y do Chrome no pointer lock. Filtro MAX_DELTA=200 +
unadjustedMovement melhorou bastante; restam pulos raros. HUD F3 mostra
`mouse Δmáx/descartados` — pedir esses números ao usuário antes de mexer de novo.

### Decisões pendentes (só quando chegar na fase)
- Circuitos: blocos-no-mundo (estilo redstone) vs painel que colapsa em 1 bloco.
  Inclinação atual: **painel que vira bloco reutilizável** (= abstração, pilar da Wing).
  Decidir só quando chegar nessa fase.
- Assinatura de código do .exe (SmartScreen bloqueia .exe não assinado → professor de outra
  escola desiste). Problema de ADOÇÃO, não de código. Resolver antes de distribuir amplo.

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
