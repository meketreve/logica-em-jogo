# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.
> **SESSÃO 21 (2026-07-25) — PLAYTEST da sessão 20: 3 correções + re-playtest ✅ + COMMITADO E PUSHADO (`26151f9` blocos, `41211ff` wolf; main == origin/main).**
> Usuário jogou os blocos novos e reprovou 3 coisas. **(1) ESCADA EMPURRAVA PRA TRÁS (bug-512):**
> `moveAxis` (physics.ts) encostava o jogador na fronteira da CÉLULA — premissa de pegada XZ cheia.
> O degrau da escada ocupa MEIA célula em XZ → esbarrar nele teleportava ~0,65 bloco pra trás.
> Fix: `resolveHoriz()` novo — devolve a face REAL da sub-caixa penetrada (menor x0 indo pro +,
> maior x1 indo pro −); fronteira de célula virou fallback. **(2) VIDRO COLORIDO (bug-513):** o dither
> cutout virou "tela de mosquiteiro" → agora tile do atlas é cor CHEIA opaca (ícone da hotbar sólido)
> e a translucidez mora num MATERIAL novo (`materialVidro`, **opacity 0.4** — calibrado no playtest,
> 0.2 ficou fraco; depthWrite false). Mesher
> ganhou 3º grupo de índices (opaco | água | vidro) via `aguaIndexCount`; `ChunkRenderer` recebe 3
> materiais. **(3) STEP-UP BRUSCO (bug-514):** física continua subindo 0,5 de uma vez (servidor valida
> a mesma) — quem suaviza é o OLHO: `stepSuave` desconta de `camera.position.y` e decai `exp(-dt*14)`
> (~0,15 s). `STEP_HEIGHT` virou export do physics. **VERDE: typecheck 3/3, 316 testes (+3), build ok.**
> **RE-PLAYTEST ✅ (2026-07-25):** usuário aprovou movimentação (escada/step-up suave) e vidros;
> pediu opacidade do vidro 0.2 → **0.4** (aplicado em `materialVidro`, main.ts, dist rebuildado).
> **PENDENTE:** só a pergunta ABERTA do usuário — "hitbox dos meio blocos
> igual das cercas/portas": mira (`blockSelectionBox`: laje = só a metade hoje, o raio atravessa a
> metade vazia) OU colisão (cerca/porta = célula CHEIA)? Não mexi até ele responder.
> **MANUTENÇÃO:** cerebrum.md consolidado (~27k → ~8k tokens) — narrativa por checkpoint foi pro
> `history.md` (`## Key Learnings arquivados`), cerebrum ficou só regra/receita; User Preferences e
> Do-Not-Repeat preservados 100%; budget do config 2000 → 10000 (o de 2k era inatingível). Sessão 20 abaixo ↓
> **SESSÃO 20 (2026-07-25) — VIDRO COLORIDO + LAJES + ESCADAS (colisão parcial + step-up). VERDE, NÃO commitado; PLAYTEST no browser PENDENTE.**
> Usuário: revisar backlog do todo.md + "fazer os blocos: vidros, slabs e escadas" + perguntou se
> troca OpenWolf por Obsidian. **RESPOSTA TOOLING:** não trocar — Obsidian é visualizador humano, não
> substitui o protocolo de handoff da IA; complementar (apontar Obsidian pro repo, `.wolf/` é md).
> PROBLEMA REAL levantado: STATUS.md tá gigante (1785 linhas/65k tok) — sugeri PODAR (só estado atual
> + próxima quest, logs antigos num HISTORICO.md). Usuário NÃO respondeu essa pergunta ainda (não podei).
> **FEITO (append ids 137-178, MAX_BLOCK_ID=178):** (1) **VIDRO COLORIDO** 12 cores (137-148) — cubo
> cheio transparente via cutout DITHER tingido (`paintVidroCor` no atlas, sem material novo). (2)
> **LAJES** 6 ids (149-154, pedra/tábua/tijolo × baixo/cima). (3) **ESCADAS** 24 ids (155-178, 3 mat ×
> 4 dir × base/cima). **Fonte única `collisionBoxes(id)` em blocks.ts alimenta mesher (forma) E física
> (colisão).** Física ganhou COLISÃO PARCIAL + `resolveVertical` (pousa no topo real 0.5) + **STEP-UP
> automático** (`moveHoriz`: sobe ≤0.55 andando, cubo cheio não sobe) + `hasSupport` parcial. Cliente:
> blocksUi (1 entrada/material) + main.ts (metade pela face clicada, direção da escada pelo olhar,
> `escadaId`; copy normaliza pra âncora). **SERVER NÃO MUDOU** (1 célula, applyBlock genérico). **VERDE:
> typecheck 0 (3/3), 313 testes (+9: colisão laje/escada, step-up, vidro), build ok.** Detalhes no
> cerebrum Key Learnings 2026-07-25. **DE QUEBRA:** marquei no todo.md 2 itens que estavam [ ] à toa
> (água fluida — feita sessões 15c/16; abas do inventário — feita sessão 10). **PRÓXIMA:** PLAYTEST no
> browser (colocar laje/escada, subir andando, vidro colorido translúcido) — UI cliente não testável
> aqui. Backlog aberto restante: layouts mobile, textura de água animada/refino, auto-update servidor,
> sobrevivência (fome/vida/craft), v2 geração. Sessão 19 abaixo ↓

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

## 🚀 Próxima fase — A DECIDIR com o usuário

> Backlog e referência de escopo vivem em `.wolf/ROADMAP.md` (inclui o checklist de dia de
> aula do piloto). Mantenha aqui só a quest ATIVA.

Sessões 20+21 fechadas, commitadas e pushadas (`26151f9` blocos + `41211ff` wolf).
Árvore limpa, main == origin/main. Nada em andamento.

**Pergunta ABERTA (não respondida):** "a hitbox dos meio blocos precisa ser igual das
cercas, portas e afins" — qual das duas?
- **Mira** (`blockSelectionBox`, mesher.ts): hoje a laje devolve só a metade, então o
  raio atravessa a metade vazia e acerta o bloco de trás. Cerca/porta têm caixa própria.
- **Colisão**: cerca/porta/móvel colidem como CÉLULA CHEIA (`temColisaoParcial` só liga
  pra laje/escada). Copiar isso pra laje = ela vira parede e o jogador anda 0,5 acima do
  topo visível. Provavelmente NÃO é o que ele quer — confirmar antes de mexer.

**Candidatos de backlog** (ver ROADMAP.md pro resto): layouts mobile · textura de água
animada/refino · auto-update do servidor · sobrevivência (fome/vida/craft) · v2 da geração.

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
