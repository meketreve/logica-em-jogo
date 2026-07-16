# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-07-15T18:42:12.361Z
> Files: 81 tracked | Anatomy hits: 0 | Misses: 0

## ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/1e53a721-e45d-4911-a026-f385f8f2c4e6/scratchpad/

- `verificar.ts` — Verificação dos .ljw gerados: abre cada save num servidor NOVO (como o (~1304 tok)

## ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/3962ee9a-001c-4ba8-abf3-6b384e5cba47/scratchpad/

- `cp18-smoke.mts` — Smoke do cp18: professor constrói parede de VIDRO com lã vermelha atrás + (~703 tok)

## ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/3c79478b-bfb0-42c1-b3ad-9f5b5f6ef74e/scratchpad/

- `cp14-restore-check.mts` — Critério 4 do MVP v2: mundo com cenário + grupos aberto em OUTRO host (~664 tok)
- `cp14-smoke.mts` — Smoke do cp14 contra o servidor Node+ws REAL (LJ_PRESET=cabines): (~1087 tok)

## ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/4f89a4f0-8ef8-406e-8a21-9868f1120f83/scratchpad/

- `pin-smoke.mts` — Smoke do cp9: PIN + papel de professor contra o servidor Node+ws REAL. (~2005 tok)

## ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/a0d99221-e98e-49ca-885e-fb3fd914cb11/scratchpad/

- `chat-smoke.mts` — Smoke do checkpoint 6: chat + /bloco contra o servidor Node+ws REAL. (~1235 tok)
- `presence-smoke.mts` — Smoke bug-064: A entra, anda e FICA PARADO; B entra → tem que ver A. (~437 tok)
- `save-smoke.mts` — Smoke do cp7: persistência real do host Node. (~1159 tok)

## ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/a33579f2-d151-4a57-9677-89e57efca3e1/scratchpad/

- `repro-border.ts` — Repro: colocar bloco cruzando borda interna de chunk (x=16, entre chunk 0 e 1). (~825 tok)

## ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/c40a8d44-8352-4fa5-b8e1-1e1eddf552e9/scratchpad/

- `make-groups-save.mts` — Save cp13: mundo plano + 2 grupos + objetivo construir per-grupo. (~537 tok)
- `make-region-save.mts` — Gera um save .ljw com 1 região nomeada em volta do spawn (cp11) — (~332 tok)
- `make-scenario-save.mts` — Save .ljw de cp12: mundo PLANO + cenário (construir com modelo visível + (~453 tok)

## ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/f3234578-5a68-4273-9e45-1b7d17f2b3db/scratchpad/

- `ws-smoke.mts` — Smoke do checkpoint 5: dois clientes ws no servidor Node real. (~1166 tok)
- `ws-smoke.ts` — Smoke do checkpoint 5: dois clientes ws no servidor Node real. (~1146 tok)

## ./

- `.gitattributes` — LF em tudo (projeto vive no WSL/ext4; evita ruído CRLF de ferramentas Windows) (~31 tok)
- `package.json` — Node.js package manifest (~157 tok)

## .claude/


## .claude/rules/


## cenarios/

- `README.md` — Project documentation (~1264 tok)
- `README.md` — Roteiro de aula das 3 aulas (6º–9º): como gerar/hospedar/distribuir, gabarito de cada uma, condução e o que observar. Os .ljw são gitignored (regeneráveis) (~1100 tok)

## client/

- `index.html` — Lógica em Jogo (~4919 tok)
- `vite.config.ts` (~94 tok)

## client/src/

- `atlasTexture.ts` — Texture atlas procedural pintado num canvas (sem assets externos — restrição (~2656 tok)
- `audio.ts` — Som de INTERFACE (menus, botões, notificações) — sintetizado com WebAudio, (~992 tok)
- `blockIcons.ts` — Ícones 2D dos blocos pra hotbar e pro inventário: recorta o tile LATERAL do (~270 tok)
- `blocksUi.ts` — Blocos colocáveis com nome em português — fonte única pra hotbar (main.ts) (~444 tok)
- `chat.ts` — UI de chat em HTML/CSS por cima do canvas (regra: sem GUI de engine). Tab autocompleta comandos (cicla opções, hint acima do campo) via commands.ts. (~1476 tok)
- `chunks.ts` — 1 mesh por chunk (BufferGeometry única, culled mesher do /shared). (~914 tok)
- `commands.ts` — Autocompletar de comandos de chat (Tab). Puro, sem DOM — o chat.ts liga o (~526 tok)
- `commands.ts` — Autocompletar de comandos de chat (Tab). Puro, sem DOM — o chat.ts liga o (~516 tok)
- `connection.ts` — Conexão do cliente com O SERVIDOR — interface única, hospedeiro invisível. (~1175 tok)
- `events.ts` — Gatilhos de som (checkpoint 6): pontos de evento do jogo onde o áudio vai (~182 tok)
- `hud.ts` — HUD de perfilação (F3): FPS, frametime méd+p95, remesh, draw calls e (~1099 tok)
- `input.ts` — Teclado + mouse (pointer lock). SÓ coleta input — nenhuma decisão de (~1218 tok)
- `inventory.ts` — Inventário de blocos (cp16) — grade com TODOS os colocáveis + faixa da (~1150 tok)
- `main.ts` — O cliente não tem filesystem: aprende os nomes das aulas pela resposta de (~9535 tok)
- `menu.ts` — Menu principal (cp8) — HTML/CSS por cima do canvas, sem GUI de engine. (~4087 tok)
- `objectivesUi.ts` — Grupo do PRÓPRIO jogador (null = sem grupo). (~1244 tok)
- `panels.ts` — Painéis HTML do cp14 — açúcar visual sobre os comandos de chat: cada botão (~5834 tok)
- `regions.ts` — Wireframes das regiões nomeadas (cp11) — visão do PROFESSOR (o servidor só (~690 tok)
- `settings.ts` — Configurações do jogador, persistidas em localStorage (por navegador). (~989 tok)
- `worldStore.ts` — Mundos do SINGLEPLAYER, guardados no navegador (IndexedDB) — decisão de (~780 tok)

## server/

- `package.json` — Node.js package manifest (~119 tok)
- `tsconfig.json` — TypeScript configuration (~43 tok)

## server/src/

- `cenarios/gerar.ts` — Gerador dos 3 cenários pedagógicos (.ljw): digita os MESMOS comandos de chat do professor contra a GameSession real. Flags: --grupos --codigo --revelar --saida (~1900 tok)
- `cenarios/verificar.ts` — Conferência embutida na geração: abre o .ljw num servidor novo, entra prof+2 alunos, completa a área do grupo 1; + guarda de geometria da faixa (~1400 tok)
- `index.ts` — Hospedeiro Node+ws do servidor (LAN): embrulha a MESMA GameSession do Web (~2758 tok)
- `mundos.ts` — `/mundo` (cp19) — trocar a aula SEM derrubar a turma. Nomes exibidos SEM `.ljw` (semExt); comando aceita com ou sem extensão. (~1776 tok)
- `paths.ts` — REPO_ROOT + daRaiz() (caminho relativo conta da raiz, não do cwd de server/). `mundoDeTrabalho()`: mundo em cenarios/ = MODELO → cópia de trabalho em aulas/ (autosave nunca escreve no modelo distribuído). (~600 tok)
- `static.ts` — Serve o cliente já buildado (client/dist) NA MESMA PORTA do WebSocket. (~1055 tok)
- `worker.ts` — Hospedeiro Web Worker do servidor (singleplayer): embrulha a GameSession (~682 tok)

## server/src/cenarios/

- `_smoke-atividade.mjs` — Smoke de /tp grupos e /iniciar contra o servidor REAL (aula1 na 8080). (~794 tok)
- `_smoke-mundo.mjs` — Smoke do cp19 contra o servidor REAL: professor + aluno conectados, o (~853 tok)
- `gerar.ts` — Gerador dos cenários pedagógicos (.ljw) — MVP v2 em uso real. (~2986 tok)
- `verificar.ts` — Conferência de um .ljw recém-gerado: abre o save num servidor NOVO (como o (~1728 tok)

## shared/


## shared/src/

- `auth.ts` — Identidade por mundo (cp9): nome + PIN de 4 dígitos, papel professor/aluno. (~255 tok)
- `blocks.ts` — IDs de bloco. Gravados como bytes crus nos chunks (Uint8Array), no save e no (~553 tok)
- `constants.ts` — Aresta do chunk em blocos (16³ = 4096 bytes, 1 byte por bloco). (~252 tok)
- `cp14.test.ts` — mundo plano 2×2×2 chunks (32³) — superfície em y=3 (~1998 tok)
- `groups.test.ts` — prof + 2 alunos em 2 grupos; modelo 2×1×1 com lã vermelha+azul. (~3848 tok)
- `groups.ts` — Grupos de alunos (cp13) — membros por NOME (mesma identidade do roster: (~280 tok)
- `index.ts` (~114 tok)
- `mesher.test.ts` — Declares DIMS (~992 tok)
- `mesher.ts` — Culled mesher: função PURA (bytes do mundo → geometria). Só emite faces que (~2053 tok)
- `physics.test.ts` — Mundo 1 chunk com chão sólido em y ∈ [0,7]. (~2227 tok)
- `physics.ts` — Física do jogador (andar, gravidade, colisão AABB com o grid de voxels). (~1698 tok)
- `protocol.test.ts` — Declares DIMS (~2276 tok)
- `protocol.ts` — Protocolo v0 (checkpoint 2). Mensagens JSON dos dois lados + world_snapshot (~4041 tok)
- `raycast.test.ts` — Mundo 16³ com chão sólido em y ∈ [0,7]. (~604 tok)
- `raycast.ts` — Raycast de voxel (DDA de Amanatides-Woo): anda célula a célula do grid até (~649 tok)
- `regions.test.ts` — Marca os 2 cantos e cria a região "casa" (0,0,0)→(3,4,5). (~2480 tok)
- `regions.ts` — Regiões nomeadas (cp11) — caixas de blocos com nome, marcadas pelo professor (~756 tok)
- `rules.test.ts` — Declares DIMS (~504 tok)
- `rules.ts` — Sistema GENÉRICO de atualização de bloco por vizinhança — a REGRA DE OURO (~526 tok)
- `save.test.ts` — Declares DIMS (~1194 tok)
- `save.ts` — Formato de save (.ljw) — MESMO arquivo em todos os hospedeiros: disco do (~1834 tok)
- `scenario.test.ts` — Marca cantos e cria região nomeada via varinha + /regiao (professor id). (~3629 tok)
- `scenario.ts` — Cenário (cp12) — o coração pedagógico: objetivos que checam o ESTADO DO (~3583 tok)
- `session.test.ts` — Testes de MECÂNICA rodam com singleplayer: true (join sem PIN) — a (~9089 tok)
- `session.ts` — GameSession: o SERVIDOR autoritativo, independente de hospedeiro. (~19008 tok)
- `world.test.ts` — Declares DIMS (~761 tok)
- `world.ts` — Dimensões do mundo em chunks. Parâmetro de criação, gravado no header do save/snapshot. (~848 tok)
- `worldgen.ts` — Preset de criação de mundo (cp14): escolhido no menu/host, só vale pra (~1361 tok)
