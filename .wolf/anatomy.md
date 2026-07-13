# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-07-13T02:22:05.169Z
> Files: 56 tracked | Anatomy hits: 0 | Misses: 0

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

## .claude/


## .claude/rules/


## client/

- `index.html` — Lógica em Jogo (~3278 tok)

## client/src/

- `atlasTexture.ts` — Texture atlas procedural pintado num canvas (sem assets externos — restrição (~1742 tok)
- `audio.ts` — Som de INTERFACE (menus, botões, notificações) — sintetizado com WebAudio, (~992 tok)
- `chat.ts` — UI de chat em HTML/CSS por cima do canvas (regra: sem GUI de engine). (~644 tok)
- `chunks.ts` — 1 mesh por chunk (BufferGeometry única, culled mesher do /shared). (~786 tok)
- `connection.ts` — Conexão do cliente com O SERVIDOR — interface única, hospedeiro invisível. (~1175 tok)
- `events.ts` — Gatilhos de som (checkpoint 6): pontos de evento do jogo onde o áudio vai (~182 tok)
- `hud.ts` — HUD de perfilação (F3): FPS, frametime méd+p95, remesh, draw calls e (~1099 tok)
- `input.ts` — Teclado + mouse (pointer lock). SÓ coleta input — nenhuma decisão de (~1196 tok)
- `main.ts` — Checkpoint 8: menu principal. Sem parâmetro na URL o menu escolhe o rumo: (~7214 tok)
- `menu.ts` — Menu principal (cp8) — HTML/CSS por cima do canvas, sem GUI de engine. (~3943 tok)
- `objectivesUi.ts` — Grupo do PRÓPRIO jogador (null = sem grupo). (~1212 tok)
- `regions.ts` — Wireframes das regiões nomeadas (cp11) — visão do PROFESSOR (o servidor só (~690 tok)
- `settings.ts` — Configurações do jogador, persistidas em localStorage (por navegador). (~892 tok)
- `worldStore.ts` — Mundos do SINGLEPLAYER, guardados no navegador (IndexedDB) — decisão de (~780 tok)

## server/

- `tsconfig.json` — TypeScript configuration (~43 tok)

## server/src/

- `index.ts` — Hospedeiro Node+ws do servidor (LAN): embrulha a MESMA GameSession do Web (~1211 tok)
- `worker.ts` — Hospedeiro Web Worker do servidor (singleplayer): embrulha a GameSession (~633 tok)

## shared/


## shared/src/

- `auth.ts` — Identidade por mundo (cp9): nome + PIN de 4 dígitos, papel professor/aluno. (~255 tok)
- `blocks.ts` — IDs de bloco. Gravados como bytes crus nos chunks (Uint8Array), no save e no (~388 tok)
- `constants.ts` — Aresta do chunk em blocos (16³ = 4096 bytes, 1 byte por bloco). (~252 tok)
- `groups.test.ts` — prof + 2 alunos em 2 grupos; modelo 2×1×1 com lã vermelha+azul. (~2744 tok)
- `groups.ts` — Grupos de alunos (cp13) — membros por NOME (mesma identidade do roster: (~280 tok)
- `index.ts` (~114 tok)
- `mesher.test.ts` — Declares DIMS (~673 tok)
- `mesher.ts` — Culled mesher: função PURA (bytes do mundo → geometria). Só emite faces que (~1695 tok)
- `physics.test.ts` — Mundo 1 chunk com chão sólido em y ∈ [0,7]. (~856 tok)
- `physics.ts` — Física do jogador (andar, gravidade, colisão AABB com o grid de voxels). (~1079 tok)
- `protocol.test.ts` — Declares DIMS (~1919 tok)
- `protocol.ts` — Protocolo v0 (checkpoint 2). Mensagens JSON dos dois lados + world_snapshot (~3891 tok)
- `raycast.test.ts` — Mundo 16³ com chão sólido em y ∈ [0,7]. (~604 tok)
- `raycast.ts` — Raycast de voxel (DDA de Amanatides-Woo): anda célula a célula do grid até (~649 tok)
- `regions.test.ts` — Marca os 2 cantos e cria a região "casa" (0,0,0)→(3,4,5). (~2480 tok)
- `regions.ts` — Regiões nomeadas (cp11) — caixas de blocos com nome, marcadas pelo professor (~756 tok)
- `rules.test.ts` — Declares DIMS (~504 tok)
- `rules.ts` — Sistema GENÉRICO de atualização de bloco por vizinhança — a REGRA DE OURO (~526 tok)
- `save.test.ts` — Declares DIMS (~1194 tok)
- `save.ts` — Formato de save (.ljw) — MESMO arquivo em todos os hospedeiros: disco do (~1834 tok)
- `scenario.test.ts` — Marca cantos e cria região nomeada via varinha + /regiao (professor id). (~3629 tok)
- `scenario.ts` — Cenário (cp12) — o coração pedagógico: objetivos que checam o ESTADO DO (~3246 tok)
- `session.test.ts` — Testes de MECÂNICA rodam com singleplayer: true (join sem PIN) — a (~9089 tok)
- `session.ts` — GameSession: o SERVIDOR autoritativo, independente de hospedeiro. (~15316 tok)
- `world.test.ts` — Declares DIMS (~761 tok)
- `world.ts` — Dimensões do mundo em chunks. Parâmetro de criação, gravado no header do save/snapshot. (~848 tok)
- `worldgen.ts` — Geração de terreno determinística (mesma seed = mesmos bytes em qualquer (~778 tok)
