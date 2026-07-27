# Memory

> Chronological action log. Hooks and AI append to this file automatically.
> Old sessions are consolidated by the daemon weekly.

## Session: 2026-07-25 00:59

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-25 01:44

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 01:47 | Edited todo.md | 2→4 lines | ~100 |
| 01:47 | Edited todo.md | 1→6 lines | ~142 |
| 01:58 | Edited shared/src/blocks.ts | modified colorido() | ~604 |
| 01:58 | Edited shared/src/blocks.ts | 2→2 lines | ~37 |
| 01:59 | Edited shared/src/blocks.ts | added 2 condition(s) | ~928 |
| 01:59 | Edited shared/src/blocks.ts | modified isTransparentBlock() | ~76 |
| 01:59 | Edited shared/src/blocks.ts | modified isFullCube() | ~133 |
| 01:59 | Edited shared/src/mesher.ts | 3→8 lines | ~132 |
| 01:59 | Edited shared/src/mesher.ts | modified fluida() | ~305 |
| 02:00 | Edited shared/src/mesher.ts | 22→27 lines | ~108 |
| 02:00 | Edited shared/src/mesher.ts | added 2 condition(s) | ~155 |
| 02:00 | Edited shared/src/mesher.ts | added 1 condition(s) | ~213 |
| 02:00 | Edited client/src/atlasTexture.ts | added 1 condition(s) | ~409 |
| 02:01 | Edited client/src/atlasTexture.ts | modified gua() | ~152 |
| 02:01 | Session end: 14 writes across 4 files (todo.md, blocks.ts, mesher.ts, atlasTexture.ts) | 9 reads | ~91601 tok |
| 02:02 | Edited shared/src/physics.ts | 2→2 lines | ~38 |
| 02:03 | Edited shared/src/physics.ts | modified temColisaoParcial() | ~183 |
| 02:03 | Edited shared/src/physics.ts | added 8 condition(s) | ~1316 |
| 02:03 | Edited shared/src/physics.ts | modified resolveVertical() | ~145 |
| 02:03 | Edited shared/src/physics.ts | 4→1 lines | ~26 |
| 02:04 | Edited shared/src/physics.ts | added 7 condition(s) | ~731 |
| 02:04 | Edited shared/src/physics.ts | moveAxisGuarded() → moveHoriz() | ~147 |
| 02:05 | Edited shared/src/blocks.test.ts | modified escada() | ~199 |
| 02:06 | Edited shared/src/physics.test.ts | modified TORSO() | ~785 |
| 02:06 | Edited shared/src/blocks.test.ts | modified it() | ~611 |
| 02:07 | Edited shared/src/blocks.test.ts | expanded (+11 lines) | ~96 |
| 02:07 | Edited shared/src/physics.test.ts | 9→10 lines | ~155 |
| 02:09 | Edited client/src/blocksUi.ts | modified colorido() | ~383 |
| 02:09 | Edited client/src/main.ts | expanded (+6 lines) | ~56 |
| 02:09 | Edited client/src/main.ts | added 2 condition(s) | ~337 |
| 02:10 | Edited client/src/main.ts | added 2 condition(s) | ~139 |
| 02:10 | Edited todo.md | expanded (+6 lines) | ~227 |
| 02:11 | Edited todo.md | 2→6 lines | ~133 |

## Sessão 20 (2026-07-25) — vidro colorido + lajes + escadas
Backlog revisado; usuário pediu vidros/slabs/escadas + perguntou OpenWolf vs Obsidian
(resposta: não trocar, complementar; STATUS.md precisa poda — não feita, aguarda ok).
Implementado (ids 137-178): vidro colorido (12, cutout dither), lajes (6), escadas (24).
`collisionBoxes(id)` = fonte única forma(mesher)+colisão(física). Física: colisão parcial,
resolveVertical (topo real), STEP-UP automático (moveHoriz), hasSupport parcial. Cliente:
blocksUi + main.ts (metade pela face, direção pelo olhar). Server intacto. VERDE: typecheck
0, 313 testes (+9), build ok. Marcados 2 itens stale do todo (água fluida, abas inventário).
NÃO commitado; playtest no browser pendente.
| 02:12 | Session end: 32 writes across 9 files (todo.md, blocks.ts, mesher.ts, atlasTexture.ts, physics.ts) | 11 reads | ~101950 tok |
| 02:13 | Session end: 32 writes across 9 files (todo.md, blocks.ts, mesher.ts, atlasTexture.ts, physics.ts) | 11 reads | ~101950 tok |

## Session: 2026-07-25 09:52

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 22:08 | Edited shared/src/physics.ts | added 7 condition(s) | ~632 |
| 22:08 | Edited shared/src/physics.ts | modified if() | ~153 |
| 22:09 | Edited shared/src/physics.test.ts | modified 496() | ~466 |
| 22:09 | Edited shared/src/physics.test.ts | 8→10 lines | ~166 |
| 22:10 | Edited shared/src/mesher.ts | 7→11 lines | ~172 |
| 22:10 | Edited shared/src/mesher.ts | 4→5 lines | ~28 |
| 22:10 | Edited shared/src/mesher.ts | modified gua() | ~106 |
| 22:10 | Edited shared/src/mesher.ts | gua() → isVidroColorido() | ~64 |
| 22:10 | Edited shared/src/mesher.ts | modified concat() | ~133 |
| 22:10 | Edited shared/src/mesher.ts | 2→3 lines | ~15 |
| 22:10 | Edited client/src/chunks.ts | modified constructor() | ~110 |
| 22:10 | Edited client/src/chunks.ts | 4→6 lines | ~112 |
| 22:11 | Edited client/src/main.ts | modified colorido() | ~192 |
| 22:11 | Edited client/src/main.ts | inline fix | ~28 |
| 22:11 | Edited client/src/atlasTexture.ts | modified paintVidroCor() | ~213 |
| 22:11 | Edited shared/src/physics.ts | inline fix | ~10 |
| 22:11 | Edited client/src/main.ts | modified suave() | ~124 |
| 22:11 | Edited client/src/main.ts | added 2 condition(s) | ~174 |
| 22:11 | Edited client/src/main.ts | inline fix | ~26 |
| 22:12 | Edited client/src/main.ts | 2→3 lines | ~12 |
| 22:12 | Edited shared/src/mesher.test.ts | expanded (+12 lines) | ~219 |
| 22:13 | Edited shared/src/physics.ts | inline fix | ~24 |
| 22:13 | Edited shared/src/physics.test.ts | 496 → 512 | ~23 |
| 22:20 | SESSÃO 21 — playtest v0.8.1: fix colisão horizontal parcial (resolveHoriz, escada não empurra mais pra trás), vidro colorido virou material blend 20%, step-up suave na câmera | physics.ts, mesher.ts, chunks.ts, main.ts, atlasTexture.ts | 316 testes ✅ typecheck 3/3 ✅ build ✅ | ~9k |
| 22:15 | Session end: 23 writes across 7 files (physics.ts, physics.test.ts, mesher.ts, chunks.ts, main.ts) | 9 reads | ~56363 tok |
| 22:35 | Consolidou cerebrum.md (~27k → ~8k tokens): narrativa por checkpoint arquivada em history.md, cerebrum ficou só regra/receita; budget do config 2000 → 10000 (realista) | .wolf/cerebrum.md, .wolf/history.md, .wolf/config.json | User Preferences e Do-Not-Repeat preservados 100% | ~40k |
| 22:20 | Session end: 23 writes across 7 files (physics.ts, physics.test.ts, mesher.ts, chunks.ts, main.ts) | 9 reads | ~56363 tok |
| 22:20 | Session end: 23 writes across 7 files (physics.ts, physics.test.ts, mesher.ts, chunks.ts, main.ts) | 9 reads | ~56363 tok |
| 22:48 | Corrigiu 2 falsos positivos dos hooks OpenWolf: countSemanticEntries casava `| DATA` (formato real é `| HH:MM` sob header de sessão) e usava data UTC; checkForMissingBugLogs só olhava files_written (ignorava escrita via Bash) | .wolf/hooks/shared.js, .wolf/hooks/stop.js, .wolf/hooks/session-start.js | novo localDate() local; verificado: semanticEntries 0 → 2, buglog reconhecido | ~12k |
| 22:23 | Session end: 23 writes across 7 files (physics.ts, physics.test.ts, mesher.ts, chunks.ts, main.ts) | 9 reads | ~56363 tok |
| 22:31 | Edited client/src/main.ts | modified colorido() | ~156 |
| 22:56 | Playtest aprovado (movimentação + vidros); opacidade do vidro colorido 0.2 → 0.4 a pedido do usuário | client/src/main.ts | build ok, dist regerado | ~2k |
| 22:32 | Session end: 24 writes across 7 files (physics.ts, physics.test.ts, mesher.ts, chunks.ts, main.ts) | 9 reads | ~56519 tok |
| 22:35 | Edited .gitignore | expanded (+6 lines) | ~87 |
| 23:05 | Commit + push das sessões 20+21 (2 commits) e STATUS/TODO preparados pro /clear; quest velha do piloto movida pro ROADMAP | git, .wolf/STATUS.md, .wolf/TODO.md, .wolf/ROADMAP.md | main == origin/main, árvore limpa | ~6k |
| 22:38 | Session end: 25 writes across 8 files (physics.ts, physics.test.ts, mesher.ts, chunks.ts, main.ts) | 10 reads | ~56787 tok |

## Session: 2026-07-26 03:00

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 23:20 | Hitbox da laje ENCERRADA: usuário confirmou que já está correta (mira na metade + colisão meia altura ficam como estão); STATUS/TODO/cerebrum fechados pro /clear | .wolf/STATUS.md, .wolf/TODO.md, .wolf/cerebrum.md | sem mudança de código; nenhuma quest ativa | ~3k |

## Session: 2026-07-26 12:12

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 12:26 | Edited shared/src/mesher.ts | added 2 condition(s) | ~378 |
| 12:26 | Edited shared/src/mesher.ts | modified for() | ~257 |
| 12:26 | Edited shared/src/mesher.ts | added optional chaining | ~158 |
| 12:26 | Edited shared/src/mesher.ts | 5→6 lines | ~22 |
| 12:27 | Edited shared/src/mesher.ts | expanded (+6 lines) | ~115 |
| 12:28 | Created client/src/aguaFx.ts | — | ~690 |
| 12:28 | Edited client/src/atlasTexture.ts | diagonal() → leve() | ~143 |
| 12:28 | Edited client/src/atlasTexture.ts | added 1 condition(s) | ~217 |
| 12:29 | Edited client/src/main.ts | added 1 import(s) | ~34 |
| 12:29 | Edited client/src/main.ts | added 1 condition(s) | ~146 |
| 12:29 | Edited client/src/main.ts | modified gua() | ~74 |
| 12:30 | Edited shared/src/worldgen.ts | modified mar() | ~214 |
| 12:30 | Edited shared/src/worldgen.ts | 4→9 lines | ~150 |
| 12:31 | Edited shared/src/world.ts | added 3 condition(s) | ~373 |
| 12:31 | Edited shared/src/world.ts | inline fix | ~13 |
| 12:31 | Edited shared/src/session.ts | modified lago() | ~181 |
| 12:33 | Edited shared/src/worldgen.ts | 20 → 22 | ~8 |
| 12:34 | Edited shared/src/worldgen.ts | modified if() | ~89 |
| 12:34 | Edited shared/src/biomas.ts | modified 16() | ~52 |
| 12:34 | Edited shared/src/worldgen.test.ts | 7→7 lines | ~83 |
| 12:40 | Edited client/src/aguaFx.ts | modified UI() | ~112 |
| 12:20 | backlog revisto: água fluida JÁ existia (ROADMAP desatualizado); usuário escolheu 3 refinos + perguntou como casar as pontas dos níveis | .wolf/ROADMAP.md, TODO.md | procedural (altura por vértice), não modelo por vizinho | ~12k |
| 12:28 | superfície de água por nível: alturaCantoAgua (média das 4 células do canto) + AGUA_TOPO=0.875 | shared/src/mesher.ts, mesher.test.ts | 3 testes novos, pontas casam | ~6k |
| 12:33 | tint+névoa submerso e correnteza no atlas | client/src/aguaFx.ts (novo), atlasTexture.ts, main.ts | z-index 1 (UI limpa), 8 fps | ~5k |
| 12:40 | mar/lagos: NIVEL_MAR=22, praia = mar+1, água FONTE estática, findSpawnSeco | shared/src/worldgen.ts, world.ts, session.ts, biomas.ts | 5 testes novos; bug-210 (mandacaru zerado) | ~9k |
| 12:45 | verificação headless contra servidor real (seed 66) | scratchpad/*.png | lago+praia ✅, submerso ✅, 324 testes, build | ~7k |
| 12:47 | Session end: 21 writes across 9 files (mesher.ts, aguaFx.ts, atlasTexture.ts, main.ts, worldgen.ts) | 16 reads | ~85316 tok |
| 12:48 | Session end: 21 writes across 9 files (mesher.ts, aguaFx.ts, atlasTexture.ts, main.ts, worldgen.ts) | 16 reads | ~85316 tok |

## Session: 2026-07-26 13:10

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 14:05 | backlog: tela de carregamento (bits/s, chunks, spinner idle + progresso real, suprimir menu Esc) | .wolf/ROADMAP.md, .wolf/TODO.md | anotado, não iniciado | ~4k |
| 14:20 | backlog: recarregar coluna faltando/corrompida + causa raiz do bug-211 (radius só no join) | .wolf/ROADMAP.md, .wolf/TODO.md, .wolf/buglog.json | anotado, não corrigido | ~6k |
| 14:35 | handoff da sessão 23: STATUS (bloco sessão 23 + próxima fase = §🔁 antes de §🕐), TODO reordenado, cerebrum ganhou "Streaming F2 — quem sabe o quê" | .wolf/STATUS.md, .wolf/TODO.md, .wolf/cerebrum.md | pronto pro /clear | ~8k |

## Session: 2026-07-26 13:36

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 13:47 | Edited shared/src/protocol.ts | modified Streaming() | ~180 |
| 13:47 | Edited shared/src/protocol.ts | added 1 condition(s) | ~100 |
| 13:47 | Edited shared/src/protocol.ts | 4→5 lines | ~70 |
| 13:47 | Edited shared/src/protocol.ts | 2→7 lines | ~123 |
| 13:47 | Edited shared/src/session.ts | expanded (+9 lines) | ~70 |
| 13:48 | Edited shared/src/session.ts | 1→6 lines | ~44 |
| 13:48 | Edited shared/src/session.ts | added 5 condition(s) | ~430 |
| 13:48 | Edited shared/src/session.ts | 2→3 lines | ~16 |
| 13:48 | Edited client/src/main.ts | added 1 condition(s) | ~369 |
| 13:48 | Edited client/src/main.ts | 4→5 lines | ~70 |
| 13:48 | Edited client/src/main.ts | 2→6 lines | ~124 |
| 13:49 | Edited client/src/main.ts | added error handling | ~219 |
| 13:49 | Edited client/src/main.ts | 2→3 lines | ~17 |
| 13:49 | Edited client/src/main.ts | modified for() | ~214 |
| 13:50 | Edited client/src/main.ts | added 5 condition(s) | ~793 |
| 13:50 | Edited client/src/chunks.ts | added error handling | ~195 |
| 13:50 | Edited client/src/main.ts | 1→5 lines | ~73 |
| 13:50 | Edited client/src/hud.ts | modified Streaming() | ~90 |
| 13:50 | Edited client/src/hud.ts | "stream ${s.stream.colunas" → "stream ${s.stream.colunas" | ~38 |
| 13:50 | Edited client/src/main.ts | 1→6 lines | ~46 |
| 13:50 | Edited client/src/main.ts | 2→3 lines | ~43 |
| 13:51 | Edited client/src/main.ts | inline fix | ~22 |
| 13:51 | Edited client/src/main.ts | modified tochas() | ~36 |
| 13:52 | Edited shared/src/streaming.test.ts | modified jogador() | ~1008 |
| 13:52 | Edited shared/src/streaming.test.ts | added 1 condition(s) | ~278 |
| 13:52 | Edited shared/src/streaming.test.ts | 3→4 lines | ~19 |
| 13:52 | Edited shared/src/streaming.test.ts | 3→2 lines | ~37 |
| 13:53 | Edited shared/src/protocol.test.ts | expanded (+19 lines) | ~320 |
| 13:53 | Edited shared/src/streaming.test.ts | expanded (+22 lines) | ~366 |
| 13:55 | Created server/src/cenarios/_smoke-pedir-coluna.mjs | — | ~1344 |
| 14:05 | SESSÃO 24 — usuário APROVOU o playtest da água (sessão 22) e pediu backlog de vento/vida ambiental | .wolf/ROADMAP.md §🌬️ | anotado: textura da água, vento autoritativo, animação seguindo o vento, nuvens, folhas, grama, flores | ~900 |
| 14:05 | §🔁 frente 1 — bug-211 FECHADO: `enviarRaio()` reanuncia `{type:"radius"}` quando a config muda (connect + onSettingsChanged) | client/src/main.ts | horizonte volta a crescer ao aumentar o raio; regressão no streaming.test.ts | ~700 |
| 14:05 | §🔁 frente 2 — rede de segurança: msg `pedir_coluna`, teto de 8/s no servidor, varredura 1×/s no cliente com carência 4s + backoff 2→30s, try/catch no decode e no mesh, F3 faltando/repedidas | shared/{protocol,session}.ts, client/{main,chunks,hud}.ts | typecheck 3/3, 329 testes (+5), build ok | ~3200 |
| 14:05 | Smoke ws REAL contra host LJ_TAMANHO=E na 8099 | server/src/cenarios/_smoke-pedir-coluna.mjs | 10/10 ✅ (raio 4→8 = 200 colunas novas; reenvio ok; flood 24→7; inválidos não derrubam) | ~800 |
| 14:05 | bug-215 logado (rede de segurança); bug-211 marcado corrigido; duplicata de id criada por hook virou bug-214 | .wolf/buglog.json | índice consistente de novo | ~400 |
| 13:59 | Session end: 30 writes across 8 files (protocol.ts, session.ts, main.ts, chunks.ts, hud.ts) | 8 reads | ~89084 tok |
| 14:22 | Session end: 30 writes across 8 files (protocol.ts, session.ts, main.ts, chunks.ts, hud.ts) | 8 reads | ~89084 tok |
| 14:28 | Session end: 30 writes across 8 files (protocol.ts, session.ts, main.ts, chunks.ts, hud.ts) | 9 reads | ~89084 tok |
| 14:35 | PLAYTEST do §🔁 aprovado pelo usuário (raio de render carrega, F3 correto) | — | bug-211 confirmado fechado em jogo | ~200 |
| 14:35 | Analisado perfil do pior caso (mundo E, raio 12, voando, RTX 2060) | profiles/perf-1785086834711-wmi5.json | §🔁 saudável (faltando 0, repedidas 16/719); custo real = draw calls + mesh | ~600 |
| 14:40 | Medição registrada na política de otimização (gatilho de greedy meshing / mesher em Worker) | .wolf/ROADMAP.md | tabela + leitura honesta: falta número do PC do lab | ~700 |
| 14:45 | COMMIT e3eaac4 — água + streaming §🔁 (20 arquivos, +839/-73) | git main | árvore de código limpa | ~400 |
| 14:50 | Handoff pro /clear: próxima quest = §🕐 tela de carregamento, depois custo de render | STATUS.md, TODO.md, cerebrum.md | ordem decidida pelo usuário | ~900 |
| 14:35 | Session end: 30 writes across 8 files (protocol.ts, session.ts, main.ts, chunks.ts, hud.ts) | 9 reads | ~89084 tok |

## Session: 2026-07-26 14:38

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 14:43 | Created client/src/loading.ts | — | ~3295 |
| 14:44 | Edited client/src/loading.ts | inline fix | ~21 |
| 14:44 | Edited client/src/main.ts | added 1 import(s) | ~24 |
| 14:44 | Edited client/src/main.ts | 2→7 lines | ~112 |
| 14:44 | Edited client/src/main.ts | 8→10 lines | ~216 |
| 14:44 | Edited client/src/main.ts | modified connect() | ~204 |
| 14:44 | Edited client/src/main.ts | added 1 condition(s) | ~436 |
| 14:44 | Edited client/src/main.ts | added 1 condition(s) | ~120 |
| 14:44 | Edited client/src/main.ts | added 1 condition(s) | ~102 |
| 14:52 | Edited client/src/loading.ts | mesher() → CHUNKS() | ~52 |
| 14:52 | Edited client/src/loading.ts | inline fix | ~12 |
| 14:52 | Edited client/src/loading.ts | added 1 condition(s) | ~166 |
| 14:52 | Edited client/src/loading.ts | inline fix | ~14 |
| 14:55 | Edited client/src/loading.ts | modified svg() | ~153 |
| 14:55 | Edited client/src/loading.ts | 3→4 lines | ~26 |
| 14:55 | Edited client/src/loading.ts | 3→4 lines | ~66 |
| 14:55 | Edited client/src/loading.ts | added 1 condition(s) | ~260 |
| 14:55 | Edited client/src/loading.ts | added 1 condition(s) | ~44 |
| 14:55 | Edited client/src/main.ts | added 1 condition(s) | ~95 |
| 14:56 | Edited client/src/loading.ts | modified if() | ~142 |
| 14:57 | Edited client/src/loading.ts | 2→3 lines | ~53 |
| 14:57 | Edited client/src/loading.ts | 2→5 lines | ~72 |
| 14:57 | Edited client/src/loading.ts | added optional chaining | ~247 |
| 14:57 | Edited client/src/connection.ts | 5→9 lines | ~141 |
| 14:57 | Edited client/src/connection.ts | 3→7 lines | ~70 |
| 14:57 | Edited client/src/connection.ts | added optional chaining | ~88 |
| 14:57 | Edited client/src/main.ts | added 1 condition(s) | ~224 |
| 14:58 | Edited client/src/loading.ts | 6→7 lines | ~76 |
| 15:10 | SESSÃO 25 — §🕐 tela de carregamento: `loading.ts` novo (anel real + spinner decorativo, bits/s, colunas/fila, fases honestas, estado de erro do ws), `loading.ativo` no `updateOverlay`/toque (bug-515), `WsConnection.aoFalhar`. typecheck 3/3, 329 testes, headless conferido em mundo E/P/servidor-off. NÃO commitado — playtest pendente | client/src/loading.ts · main.ts · connection.ts · .wolf/{STATUS,TODO,ROADMAP,cerebrum,anatomy,buglog}.* | ✅ verde | ~46k |
| 15:06 | Session end: 28 writes across 3 files (loading.ts, main.ts, connection.ts) | 12 reads | ~29660 tok |
| 15:11 | Session end: 28 writes across 3 files (loading.ts, main.ts, connection.ts) | 12 reads | ~29660 tok |
| 15:19 | Edited client/src/chunks.ts | added 1 condition(s) | ~204 |
| 15:19 | Edited client/src/hud.ts | modified aula() | ~131 |
| 15:19 | Edited client/src/loading.ts | 3→6 lines | ~74 |
| 15:19 | Edited client/src/loading.ts | 2→2 lines | ~13 |
| 15:19 | Edited client/src/loading.ts | added nullish coalescing | ~86 |
| 15:19 | Edited client/src/loading.ts | modified reabertura() | ~91 |
| 15:19 | Edited client/src/loading.ts | 2→3 lines | ~23 |
| 15:19 | Edited client/src/loading.ts | added 1 condition(s) | ~176 |
| 15:20 | Edited client/src/main.ts | expanded (+9 lines) | ~382 |
| 15:20 | Edited client/src/main.ts | 3→5 lines | ~91 |
| 15:20 | Edited client/src/main.ts | added 1 condition(s) | ~335 |
| 15:22 | Created server/src/cenarios/_smoke-troca-raio.mjs | — | ~1121 |
| 15:35 | Perfil 18:14 analisado → 3 bugs (517 buildAll em lazy no trocarMundo ~19s; 518 raio volta a RAIO_PADRAO na troca de aula; 519 meta do HUD congelado no join) + §🕐 reaberta no `/mundo carregar` | client/src/{chunks,hud,main,loading}.ts · server/src/cenarios/_smoke-troca-raio.mjs | ✅ typecheck 3/3, 329 testes, smoke troca-raio 5/5 (anel 10→6→12), build refeito | ~38k |
| 15:30 | Session end: 40 writes across 6 files (loading.ts, main.ts, connection.ts, chunks.ts, hud.ts) | 17 reads | ~38063 tok |
| 15:35 | Session end: 40 writes across 6 files (loading.ts, main.ts, connection.ts, chunks.ts, hud.ts) | 17 reads | ~38063 tok |
| 15:43 | Edited shared/src/protocol.ts | expanded (+12 lines) | ~175 |
| 15:43 | Edited shared/src/protocol.ts | added 1 condition(s) | ~77 |
| 15:43 | Edited server/src/mundos.ts | 3→6 lines | ~82 |
| 15:44 | Edited server/src/mundos.ts | 1→5 lines | ~75 |
| 15:44 | Edited server/src/index.ts | 4→8 lines | ~86 |
| 15:44 | Edited server/src/index.ts | 2→3 lines | ~16 |
| 15:44 | Edited client/src/main.ts | modified ANUNCIADA() | ~78 |
| 15:44 | Edited client/src/main.ts | added optional chaining | ~81 |
| 15:45 | Edited client/src/loading.ts | 2→6 lines | ~89 |
| 15:45 | Edited client/src/loading.ts | 4→6 lines | ~73 |
| 15:45 | Edited client/src/loading.ts | added 1 condition(s) | ~68 |
| 15:45 | Edited client/src/loading.ts | 2→3 lines | ~29 |
| 15:45 | Edited client/src/loading.ts | 3→4 lines | ~32 |
| 15:45 | Edited client/src/main.ts | expanded (+19 lines) | ~192 |
| 15:45 | Edited server/src/cenarios/_smoke-troca-raio.mjs | added 2 condition(s) | ~228 |
| 15:46 | Edited server/src/cenarios/_smoke-troca-raio.mjs | 2→6 lines | ~76 |
| 15:47 | Edited client/src/main.ts | added 3 condition(s) | ~410 |
| 15:48 | Edited client/src/main.ts | 3→4 lines | ~74 |

## Session: 2026-07-26 15:50

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 15:52 | bug-520: tela de carga subia só no snapshot (fim da fila do host) → msg nova `mundo_trocando` + fase `preparando` + fila de 2× rAF (garante a PINTURA antes do trabalho pesado). Perfil 3 analisado: remesh −98%, repedidas 252→4 | shared/protocol.ts · server/{index,mundos}.ts · client/{main,loading}.ts · _smoke-troca-raio.mjs | ✅ typecheck 3/3, 329 testes, smoke 6/6, build refeito | ~30k |
| 15:58 | Ajuste OpenWolf: buglog.auto_detect→false (falso positivo poluía índice) + anatomy.rescan 6h→168h (stale falso no boot) | .wolf/config.json · .wolf/cerebrum.md | ✅ aplicado | ~2k |
| 16:12 | Edited server/src/cenarios/_smoke-mundo.mjs | added nullish coalescing | ~22 |
| 16:12 | Edited server/src/cenarios/_smoke-kicar.mjs | added nullish coalescing | ~22 |
| 16:12 | Edited server/src/cenarios/_smoke-atividade.mjs | added nullish coalescing | ~22 |
| 16:14 | Created scripts/smoke.mjs | — | ~2158 |
| 16:14 | Edited package.json | 2→5 lines | ~91 |
| 16:14 | Edited scripts/smoke.mjs | 8→10 lines | ~85 |
| 16:15 | Edited server/src/cenarios/_smoke-mundo.mjs | 1→4 lines | ~35 |
| 16:17 | §🧪 encanamento de verificação: runner de smokes com manifesto + npm run verify/smoke/verify:all; 3 smokes ganharam porta por argv | scripts/smoke.mjs (novo) · package.json · server/src/cenarios/_smoke-{mundo,kicar,atividade}.mjs | ✅ smoke 5/5 (38s) · verify verde (329 testes, build ok) | ~35k |
| 16:18 | Session end: 7 writes across 5 files (_smoke-mundo.mjs, _smoke-kicar.mjs, _smoke-atividade.mjs, smoke.mjs, package.json) | 5 reads | ~11450 tok |
| 16:31 | Session end: 7 writes across 5 files (_smoke-mundo.mjs, _smoke-kicar.mjs, _smoke-atividade.mjs, smoke.mjs, package.json) | 5 reads | ~11450 tok |
| 20:03 | Edited client/src/torchGlow.ts | 2→2 lines | ~32 |
| 20:03 | Edited client/src/torchGlow.ts | added 2 condition(s) | ~620 |
| 20:03 | Edited client/src/main.ts | modified for() | ~81 |
| 20:03 | Edited client/src/main.ts | modified for() | ~83 |
| 20:04 | Edited client/src/main.ts | modified for() | ~66 |
| 20:12 | bug-523 (o achado da sessão): TorchGlow.setFromWorld varria bloco a bloco → 41,4 s de trava em mundo E ("página não está respondendo"); varredura por chunk = 2,9 ms. Explica os ~38 s de long task iguais nos 3 perfis. + halo de tocha em coluna do streaming | client/src/torchGlow.ts · client/src/main.ts | ✅ typecheck 3/3, 329 testes, equivalência 9/9, headless 3min→2,9s, build refeito | ~25k |
| 20:10 | Session end: 12 writes across 7 files (_smoke-mundo.mjs, _smoke-kicar.mjs, _smoke-atividade.mjs, smoke.mjs, package.json) | 7 reads | ~13328 tok |
| 20:30 | Perfis 4-9 analisados (2 pré-tocha às 19:34, 4 snapshots da mesma sessão às 23:18). Confirmado: trava fixa sumiu (longTask agora escala), jitter 1750→320, repedidas 0. Sobrou mesh de terreno: 18-29% do tempo de parede, 1,25-1,71 ms/chunk; PARADO = 60 FPS travado. Medição 4 + ordem revisada no ROADMAP | .wolf/ROADMAP.md | ✅ análise registrada | ~18k |
| 20:23 | Session end: 12 writes across 7 files (_smoke-mundo.mjs, _smoke-kicar.mjs, _smoke-atividade.mjs, smoke.mjs, package.json) | 7 reads | ~13328 tok |
| 20:29 | Edited client/src/hud.ts | modified perfil() | ~312 |
| 20:29 | Edited client/src/hud.ts | 4→6 lines | ~72 |
| 20:29 | Edited client/src/hud.ts | added optional chaining | ~43 |
| 20:29 | Edited client/src/hud.ts | expanded (+24 lines) | ~261 |
| 20:30 | Edited client/src/hud.ts | added optional chaining | ~343 |
| 20:30 | Edited client/src/hud.ts | 4→4 lines | ~17 |
| 20:30 | Edited client/src/main.ts | 3→4 lines | ~63 |
| 20:30 | Edited client/src/main.ts | 1→5 lines | ~80 |
| 20:30 | Edited client/src/main.ts | modified frame() | ~146 |
| 20:30 | Edited client/src/main.ts | 3→6 lines | ~64 |
| 20:30 | Edited client/src/main.ts | expanded (+17 lines) | ~194 |
| 20:31 | Edited client/src/main.ts | added 1 condition(s) | ~80 |
| 20:55 | Contexto no perfil (pedido do usuário): `Hud.contexto` provider → bloco `jogador` (pos/yaw/pitch/voando/noChao/chunk) + `config` (raioRender/meshPorFrame/pixelRatioCap/fov) + `gravacao.movimento` (estado voando/andando/parado, distância, velocidade, colunasNovas, bytesRecebidos na janela). `?hud` na URL abre o F3 (verificação headless) | client/src/hud.ts · client/src/main.ts | ✅ typecheck 3/3, 329 testes, F3 conferido em headless, build refeito | ~22k |
| 20:40 | Edited client/src/settings.ts | expanded (+6 lines) | ~120 |
| 20:41 | Edited client/src/menu.ts | 5→5 lines | ~44 |
| 20:41 | Edited client/src/chunks.ts | added 1 condition(s) | ~452 |
| 20:41 | Edited client/src/chunks.ts | 5→9 lines | ~115 |
| 20:42 | Edited client/src/hud.ts | added optional chaining | ~70 |
| 21:00 | Orçamento de mesh por TEMPO (escolha do usuário): `meshMsPorFrame` (1-16 ms, padrão 6) substitui `meshPorFrame`; teto 64 chunks + garantia de ≥1; F3 mostra "malha N chunks (orçamento X ms)"; slider novo na config. Plano do worker escopado no ROADMAP | client/src/{chunks,settings,menu,hud,main}.ts | ✅ typecheck 3/3, 329 testes, headless E: fila 0, long tasks 0, build refeito | ~20k |
| 20:49 | Session end: 29 writes across 11 files (_smoke-mundo.mjs, _smoke-kicar.mjs, _smoke-atividade.mjs, smoke.mjs, package.json) | 14 reads | ~24611 tok |
| 21:10 | Perfis 23:51 (2, voando raio 12, 125 colunas novas na janela) analisados: orçamento por tempo VALIDADO — p95 43-82→18,7/20,4 ms, frames>50ms 9-50→0, FPS 41-53→57/60, longTasks sessão 128-299→2, fila 0→84/189 (preço previsto). MEDIÇÃO 5 no ROADMAP; worker do mesher rebaixado até medir no lab | .wolf/ROADMAP.md · .wolf/TODO.md | ✅ análise registrada | ~16k |
| 20:53 | Session end: 29 writes across 11 files (_smoke-mundo.mjs, _smoke-kicar.mjs, _smoke-atividade.mjs, smoke.mjs, package.json) | 14 reads | ~24611 tok |
| 21:02 | Edited client/src/hud.ts | modified netcode() | ~216 |
| 21:02 | Edited client/src/hud.ts | expanded (+8 lines) | ~164 |
| 21:02 | Edited client/src/hud.ts | expanded (+10 lines) | ~182 |
| 21:03 | Edited client/src/hud.ts | modified frame() | ~141 |
| 21:03 | Edited client/src/hud.ts | modified toFixed() | ~234 |
| 21:03 | Edited client/src/chunks.ts | modified pediu() | ~214 |
| 21:03 | Edited client/src/chunks.ts | 4→7 lines | ~60 |
| 21:04 | Edited client/src/main.ts | 2→6 lines | ~101 |
| 21:15 | Edited client/src/main.ts | 5→6 lines | ~66 |
| 21:40 | Playtest da §🕐 APROVADO (single + /mundo carregar). Perfilador por FASE (carregando×jogando: frames/fps/render%/travadas), top 5 piores travadas (ms+fase+segundo), remesh por caminho (fila/bloco/área), render×lógica (renderMs). bug-524 (setRemesh do loop apagava porCaminho) pego no headless. Backlog do perfilador escopado no ROADMAP (modo ?bench é o item 1) | client/src/{hud,chunks,main}.ts · .wolf/{ROADMAP,TODO,cerebrum,buglog} | ✅ typecheck 3/3, 329 testes, F3 conferido, build refeito | ~24k |
| 21:23 | Session end: 38 writes across 11 files (_smoke-mundo.mjs, _smoke-kicar.mjs, _smoke-atividade.mjs, smoke.mjs, package.json) | 17 reads | ~25989 tok |
| 21:55 | Handoff da sessão 25: STATUS ✅ consolidado + 🚀 Próxima fase = as 7 do perfilador (ordem: ?bench primeiro), TODO zerado, anatomy rescan. Commit da leva inteira | .wolf/{STATUS,TODO,memory}.md | ✅ pronto pro /clear | ~12k |
| 21:29 | Session end: 38 writes across 11 files (_smoke-mundo.mjs, _smoke-kicar.mjs, _smoke-atividade.mjs, smoke.mjs, package.json) | 17 reads | ~25989 tok |

## Session: 2026-07-26 21:31

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 21:34 | Edited client/src/hud.ts | expanded (+8 lines) | ~151 |
| 21:34 | Edited client/src/hud.ts | expanded (+24 lines) | ~352 |
| 21:34 | Edited client/src/hud.ts | 4→9 lines | ~154 |
| 21:34 | Edited client/src/hud.ts | modified GPU() | ~225 |
| 21:35 | Edited client/src/hud.ts | added optional chaining | ~1045 |
| 21:35 | Edited client/src/hud.ts | modified if() | ~64 |
| 21:35 | Edited client/src/hud.ts | 15→18 lines | ~192 |
| 21:35 | Edited client/src/hud.ts | added optional chaining | ~125 |
| 21:35 | Edited client/src/hud.ts | 2→4 lines | ~50 |
| 21:35 | Edited client/src/hud.ts | expanded (+7 lines) | ~171 |
| 21:35 | Edited client/src/hud.ts | added 1 condition(s) | ~220 |
| 21:35 | Edited client/src/hud.ts | modified regras() | ~147 |
| 21:36 | Edited client/src/loading.ts | expanded (+20 lines) | ~251 |
| 21:36 | Edited client/src/loading.ts | expanded (+8 lines) | ~159 |
| 21:36 | Edited client/src/loading.ts | added nullish coalescing | ~74 |
| 21:36 | Edited client/src/loading.ts | added nullish coalescing | ~224 |
| 21:36 | Edited client/src/loading.ts | modified concluir() | ~34 |
| 21:36 | Edited client/src/loading.ts | added optional chaining | ~190 |
| 21:37 | Edited client/src/loading.ts | modified faseEfetiva() | ~70 |
| 21:37 | Edited client/src/loading.ts | added 1 condition(s) | ~46 |
| 21:37 | Edited shared/src/session.ts | modified s() | ~156 |
| 21:37 | Edited shared/src/session.ts | modified for() | ~69 |
| 21:37 | Edited shared/src/session.ts | added 2 condition(s) | ~174 |
| 21:37 | Edited shared/src/session.ts | 3→8 lines | ~133 |
| 21:37 | Edited shared/src/session.ts | 1→3 lines | ~50 |
| 21:37 | Edited shared/src/protocol.ts | expanded (+7 lines) | ~126 |
| 21:37 | Edited shared/src/protocol.ts | expanded (+9 lines) | ~238 |
| 21:39 | Created client/src/bench.ts | — | ~1824 |
| 21:39 | Edited client/src/bench.ts | 1→3 lines | ~44 |
| 21:39 | Edited client/src/main.ts | added 1 import(s) | ~34 |
| 21:39 | Edited client/src/main.ts | modified applySettings() | ~150 |
| 21:39 | Edited client/src/main.ts | modified applySettings() | ~108 |
| 21:39 | Edited client/src/main.ts | modified startSingleplayer() | ~61 |
| 21:39 | Edited client/src/main.ts | 2→3 lines | ~65 |
| 21:40 | Edited client/src/main.ts | added 1 condition(s) | ~217 |
| 21:40 | Edited client/src/main.ts | 2→3 lines | ~16 |
| 21:40 | Edited client/src/main.ts | expanded (+6 lines) | ~153 |
| 21:40 | Edited client/src/main.ts | 1→4 lines | ~36 |
| 21:41 | Edited client/src/main.ts | added 2 condition(s) | ~413 |
| 21:41 | Edited client/src/main.ts | added optional chaining | ~190 |
| 21:41 | Edited client/src/main.ts | added optional chaining | ~127 |
| 21:41 | Edited client/src/main.ts | 1→4 lines | ~39 |
| 21:41 | Edited client/src/main.ts | 2→3 lines | ~53 |
| 21:41 | Edited client/src/main.ts | 2→3 lines | ~56 |
| 21:41 | Edited client/src/main.ts | expanded (+8 lines) | ~99 |
| 21:42 | Edited client/src/main.ts | added nullish coalescing | ~162 |
| 21:42 | Edited client/src/main.ts | 2→3 lines | ~35 |
| 21:42 | Edited client/src/hud.ts | download() → baixar() | ~138 |
| 21:42 | Edited client/src/hud.ts | inline fix | ~24 |
| 21:42 | Edited client/src/main.ts | modified if() | ~81 |
| 21:42 | Edited client/src/main.ts | 3→7 lines | ~93 |
| 21:43 | Edited shared/src/session.test.ts | added optional chaining | ~494 |
| 21:43 | Edited shared/src/protocol.test.ts | expanded (+18 lines) | ~276 |
| 21:44 | Edited shared/src/session.test.ts | inline fix | ~25 |
| 21:47 | Edited client/src/bench.ts | expanded (+9 lines) | ~160 |
| 21:47 | Edited client/src/bench.ts | modified if() | ~63 |
| 21:47 | Edited client/src/bench.ts | 4→9 lines | ~82 |
| 21:47 | Edited client/src/main.ts | 1→5 lines | ~104 |
| 21:48 | Edited client/src/bench.ts | modified pontoDoVoo() | ~410 |
| 21:49 | Edited client/src/main.ts | expanded (+7 lines) | ~141 |
| 21:51 | Edited client/src/hud.ts | added error handling | ~427 |
| 21:51 | Edited client/src/hud.ts | added error handling | ~267 |
| 21:51 | Edited client/src/hud.ts | modified O() | ~246 |
| 21:53 | Created scripts/bench-headless.mjs | — | ~1460 |
| 21:53 | Edited package.json | 1→2 lines | ~28 |
| 22:05 | SESSÃO 26 — as 7 do perfilador entregues: ?bench (bench.ts novo), histograma, carga por fase (§🕐), marcadores, regras do servidor no debug_stats, tempo de GPU; item 7 já existia. + scripts/bench-headless.mjs (CDP). VERDE: typecheck 3/3, 331 testes, build, bench headless E de ponta a ponta. bug-525 logado. NÃO commitado (playtest pendente) | bench.ts, hud.ts, loading.ts, main.ts, session.ts, protocol.ts, scripts/bench-headless.mjs | ok | ~95k |
| 21:57 | Session end: 65 writes across 10 files (hud.ts, loading.ts, session.ts, protocol.ts, bench.ts) | 9 reads | ~109155 tok |
| 22:13 | Session end: 65 writes across 10 files (hud.ts, loading.ts, session.ts, protocol.ts, bench.ts) | 9 reads | ~109155 tok |
| 22:20 | Session end: 65 writes across 10 files (hud.ts, loading.ts, session.ts, protocol.ts, bench.ts) | 9 reads | ~109155 tok |
| 22:27 | Session end: 65 writes across 10 files (hud.ts, loading.ts, session.ts, protocol.ts, bench.ts) | 9 reads | ~109155 tok |
| 22:29 | Created server/src/perfis.ts | — | ~1176 |
| 22:29 | Edited server/src/index.ts | 7→4 lines | ~56 |
| 22:29 | Edited server/src/index.ts | added 1 import(s) | ~50 |
| 22:29 | Edited server/src/index.ts | 7→5 lines | ~75 |
| 22:29 | Edited server/src/index.ts | added 1 condition(s) | ~89 |
| 22:29 | Edited client/src/main.ts | 8→7 lines | ~90 |
| 22:30 | Edited client/src/main.ts | added error handling | ~390 |
| 22:32 | Created server/src/cenarios/_smoke-perfil-http.mjs | — | ~917 |
| 22:32 | Edited scripts/smoke.mjs | expanded (+13 lines) | ~134 |
| 22:32 | Edited server/src/cenarios/_smoke-perfil-http.mjs | inline fix | ~21 |
| 22:32 | Edited server/src/cenarios/_smoke-perfil-http.mjs | 1→5 lines | ~72 |
| 22:35 | ?bench passa a POSTAR o perfil pro host (POST /perfil → profiles/, prefixo perf-bench-), fallback pro download sem host; server/src/perfis.ts novo concentra WS+HTTP; smoke novo perfil-http (6/6 suíte) | server/src/perfis.ts, server/src/index.ts, client/src/main.ts, scripts/smoke.mjs, _smoke-perfil-http.mjs | ok | ~28k |
| 22:35 | Session end: 76 writes across 14 files (hud.ts, loading.ts, session.ts, protocol.ts, bench.ts) | 9 reads | ~112306 tok |
