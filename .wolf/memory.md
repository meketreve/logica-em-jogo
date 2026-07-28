# Memory

> Chronological action log. Hooks and AI append to this file automatically.
> Old sessions are consolidated by the daemon weekly.

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
| 22:39 | Session end: 76 writes across 14 files (hud.ts, loading.ts, session.ts, protocol.ts, bench.ts) | 9 reads | ~112306 tok |
| 22:49 | Session end: 76 writes across 14 files (hud.ts, loading.ts, session.ts, protocol.ts, bench.ts) | 9 reads | ~112306 tok |
| 22:50 | Session end: 76 writes across 14 files (hud.ts, loading.ts, session.ts, protocol.ts, bench.ts) | 9 reads | ~112306 tok |

## Session: 2026-07-26 22:56

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 23:10 | Lidos os 2 perfis do lab (`v1w4`,`nfhx`, Intel UHD 630/8 núcleos) contra a régua RTX 2060 | profiles/*.json | 49-50 FPS, p95 30 ms, GPU 14,6 ms, carga 12,9-16,5 s (malha 9,7-13,4 s) — mesher em Worker CONFIRMADO | ~8k |
| 23:12 | Veredito e tabela comparativa registrados no handoff | .wolf/STATUS.md | sessão 27 no topo | ~3k |
| 23:12 | Edited shared/src/mesher.ts | added nullish coalescing | ~1048 |
| 23:12 | Edited shared/src/mesher.ts | 5→1 lines | ~9 |
| 23:12 | Edited shared/src/mesher.ts | getBlock() → bloco() | ~23 |
| 23:12 | Edited shared/src/mesher.ts | getBlock() → bloco() | ~47 |
| 23:12 | Edited shared/src/mesher.ts | 4→4 lines | ~84 |
| 23:12 | Edited shared/src/mesher.ts | modified switch() | ~29 |
| 23:12 | Edited shared/src/mesher.ts | inline fix | ~17 |
| 23:12 | Edited shared/src/mesher.ts | getBlock() → bloco() | ~112 |
| 23:12 | Edited shared/src/mesher.ts | inline fix | ~11 |
| 23:13 | Edited shared/src/mesher.ts | reduced (-6 lines) | ~49 |
| 23:13 | Edited shared/src/mesher.ts | getBlock() → bloco() | ~25 |
| 23:13 | Edited shared/src/mesher.ts | getBlock() → bloco() | ~25 |
| 23:15 | Created client/src/meshWorker.ts | — | ~442 |
| 23:16 | Created client/src/meshPool.ts | — | ~1414 |
| 23:16 | Edited client/src/chunks.ts | expanded (+23 lines) | ~269 |
| 23:17 | Edited client/src/chunks.ts | added optional chaining | ~725 |
| 23:17 | Edited client/src/chunks.ts | modified remesh() | ~632 |
| 23:17 | Edited client/src/chunks.ts | modified enfileirar() | ~128 |
| 23:18 | Edited client/src/chunks.ts | added 7 condition(s) | ~959 |
| 23:18 | Edited client/src/chunks.ts | modified nenhuma() | ~120 |
| 23:18 | Edited client/src/chunks.ts | added optional chaining | ~105 |
| 23:18 | Edited client/src/chunks.ts | modified descartarColuna() | ~112 |
| 23:18 | Edited client/src/chunks.ts | 3→8 lines | ~91 |
| 23:18 | Edited client/src/hud.ts | modified THREAD() | ~122 |
| 23:18 | Edited client/src/hud.ts | added nullish coalescing | ~48 |
| 23:18 | Edited client/src/hud.ts | added nullish coalescing | ~36 |
| 23:26 | Edited scripts/bench-headless.mjs | added optional chaining | ~151 |
| 23:27 | Edited client/src/main.ts | expanded (+10 lines) | ~150 |
| 23:15 | Mesher virou função pura: núcleo lê vizinhança padded 18³, `meshChunk` vira wrapper | shared/src/mesher.ts | typecheck ok, 331 testes verdes (comportamento idêntico) | ~14k |
| 23:20 | Worker + pool (4 workers, 8 jobs em voo, transfer nos 2 sentidos) | client/src/meshWorker.ts, meshPool.ts (novos) | build emite meshWorker-*.js 18 kB | ~9k |
| 23:24 | ChunkRenderer usa o pool no caminho `fila`; versão por chunk mata resultado vencido; filaPendente soma em-voo | client/src/chunks.ts | typecheck ok | ~11k |
| 23:26 | 3 testes novos (casca × getBlock, equivalência byte a byte, fast path) + bug-526/527 | shared/src/mesher.test.ts, .wolf/buglog.json | 334 testes verdes | ~6k |
| 23:32 | `?semworker` + `geometria`/`remesh` no bench headless; A/B rodado | client/src/main.ts, scripts/bench-headless.mjs | main thread 0,933 → 0,158 ms/chunk; fila 1057 → 0; 636 draw calls | ~7k |
| 23:31 | Session end: 28 writes across 7 files (mesher.ts, meshWorker.ts, meshPool.ts, chunks.ts, hud.ts) | 9 reads | ~50104 tok |
| 02:43 | Edited client/src/meshPool.ts | modified lab() | ~261 |
| 02:43 | Edited client/src/meshPool.ts | modified temVaga() | ~123 |
| 02:44 | Edited client/src/chunks.ts | expanded (+10 lines) | ~204 |
| 02:44 | Edited client/src/chunks.ts | added 1 condition(s) | ~138 |
| 02:44 | Edited client/src/chunks.ts | added 1 condition(s) | ~125 |
| 02:44 | Edited client/src/chunks.ts | 4→5 lines | ~63 |
| 02:44 | Edited client/src/chunks.ts | modified for() | ~78 |
| 02:44 | Edited client/src/chunks.ts | 4→6 lines | ~59 |
| 02:44 | Edited client/src/chunks.ts | 3→5 lines | ~86 |
| 02:44 | Edited client/src/chunks.ts | added 1 condition(s) | ~133 |
| 02:44 | Edited client/src/main.ts | 3→6 lines | ~97 |
| 02:46 | Edited client/src/meshPool.ts | modified a() | ~166 |
| 02:47 | Edited client/src/meshPool.ts | added nullish coalescing | ~131 |
| 02:47 | Edited client/src/meshPool.ts | inline fix | ~24 |
| 02:48 | Edited client/src/main.ts | expanded (+6 lines) | ~172 |
| 02:35 | Lido o par A/B do lab (jkso=worker, t3xn=semworker) | profiles/*.json | carga −55% (malha 8481→2208) MAS FPS 50→36, p95 28→44, remesh +45% | ~7k |
| 02:44 | Coalescência de job em voo (chavesEmVoo/sujosEmVoo) + freio por fase (modoCarga 8/2) | client/src/chunks.ts, meshPool.ts, main.ts | 334 testes verdes | ~10k |
| 02:50 | Knob `?meshdepth=N` pro lab fechar a profundidade de jogo | client/src/main.ts, meshPool.ts, chunks.ts | headless: fila 0, remesh 4815→4322, malha 1229 ms | ~5k |
| 02:50 | Session end: 43 writes across 7 files (mesher.ts, meshWorker.ts, meshPool.ts, chunks.ts, hud.ts) | 10 reads | ~52506 tok |
| 02:55 | SESSÃO 27 fechada: perfil do lab lido → mesher em Web Worker codado → par A/B expôs regressão de FPS → coalescência + freio por fase + knob | shared/src/mesher.ts(+test), client/src/{meshWorker,meshPool}.ts (novos), chunks.ts, hud.ts, main.ts, scripts/bench-headless.mjs, .wolf/{STATUS,TODO,cerebrum,buglog} | typecheck 3/3, 334 testes, build ok. Carga 11,5→5,1 s no lab; FPS pendente de fechar com `?meshdepth` | ~180k |
| 02:50 | Session end: 43 writes across 7 files (mesher.ts, meshWorker.ts, meshPool.ts, chunks.ts, hud.ts) | 10 reads | ~52506 tok |
| 02:51 | Session end: 43 writes across 7 files (mesher.ts, meshWorker.ts, meshPool.ts, chunks.ts, hud.ts) | 10 reads | ~52506 tok |
| 2026-07-27 | SESSÃO 27: perfil do lab → mesher em Web Worker → par A/B expôs regressão de FPS → coalescência de job em voo + freio por fase + knob ?meshdepth | shared/src/mesher.ts(+test), client/src/{meshWorker,meshPool}.ts (novos), chunks.ts, hud.ts, main.ts, scripts/bench-headless.mjs | typecheck 3/3, 334 testes, build ok. Carga no lab 11,5→5,1 s; FPS pendente de fechar com ?meshdepth | ~180k |
| 02:52 | Session end: 43 writes across 7 files (mesher.ts, meshWorker.ts, meshPool.ts, chunks.ts, hud.ts) | 10 reads | ~52506 tok |
| 03:28 | Session end: 43 writes across 7 files (mesher.ts, meshWorker.ts, meshPool.ts, chunks.ts, hud.ts) | 12 reads | ~52506 tok |
| 06:35 | Push do projeto (9 commits) e PR upstream do bug do hook de summary | origin/main b3669ff · cytostack/openwolf#64 | PR +98 -1, 32/32 testes e typecheck limpos no fork | ~12k |
| 03:35 | Session end: 43 writes across 7 files (mesher.ts, meshWorker.ts, meshPool.ts, chunks.ts, hud.ts) | 12 reads | ~52506 tok |
| 03:39 | Session end: 43 writes across 7 files (mesher.ts, meshWorker.ts, meshPool.ts, chunks.ts, hud.ts) | 12 reads | ~52506 tok |
| 03:52 | Edited client/src/meshPool.ts | modified total() | ~300 |
| 03:52 | Edited client/src/meshPool.ts | modified disponivel() | ~180 |
| 03:52 | Edited client/src/chunks.ts | modified remeshWorkerMsTotal() | ~110 |
| 03:52 | Edited client/src/hud.ts | 3→7 lines | ~142 |
| 03:52 | Edited client/src/hud.ts | 1→2 lines | ~30 |
| 03:52 | Edited scripts/bench-headless.mjs | 1→3 lines | ~117 |
| 04:05 | Lidas as 6 rodadas do lab (bateria eco + tomada) e fechado o knob em PROFUNDIDADE_JOGO=1 | client/src/meshPool.ts | depth 1 empata FPS do síncrono (50) e bate a cauda (p95 26,7 × 28,1); carga 4,5 s × 11,5 s | ~14k |
| 04:12 | Perfil passa a gravar `mesher` (workers + profundidades) — o A/B saiu sem etiqueta | hud.ts, chunks.ts, meshPool.ts, main.ts, bench-headless.mjs | verificado com ?meshdepth=3 → "4 workers · profundidade 3 (jogo) / 8 (carga)" | ~8k |
| 03:56 | Session end: 49 writes across 7 files (mesher.ts, meshWorker.ts, meshPool.ts, chunks.ts, hud.ts) | 13 reads | ~61656 tok |
| 04:30 | Handoff pro /clear: §🚀 reescrita (perf ENCERRADA, nada disparado), ciclo varrido pro ✅, TODO limpo e desduplicado | .wolf/STATUS.md, .wolf/TODO.md | STATUS aponta backlog (§🌬️ vento) como próxima escolha do usuário | ~9k |
| 04:03 | Session end: 49 writes across 7 files (mesher.ts, meshWorker.ts, meshPool.ts, chunks.ts, hud.ts) | 13 reads | ~61656 tok |

## Session: 2026-07-27 04:04

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 04:13 | Created shared/src/vento.ts | — | ~1059 |
| 04:13 | Edited shared/src/index.ts | 1→2 lines | ~14 |
| 04:13 | Edited shared/src/protocol.ts | expanded (+13 lines) | ~171 |
| 04:13 | Edited shared/src/protocol.ts | added 3 condition(s) | ~122 |
| 04:13 | Edited shared/src/session.ts | 4→8 lines | ~146 |
| 04:13 | Edited shared/src/session.ts | added 1 condition(s) | ~73 |
| 04:13 | Edited shared/src/session.ts | 4→6 lines | ~62 |
| 04:14 | Edited shared/src/session.ts | added optional chaining | ~480 |
| 04:14 | Edited shared/src/session.ts | added 1 condition(s) | ~117 |
| 04:14 | Edited shared/src/session.ts | "Comando desconhecido: ${t" → "Comando desconhecido: ${t" | ~60 |
| 04:14 | Edited shared/src/session.ts | added 1 condition(s) | ~88 |
| 04:14 | Edited shared/src/session.ts | 1→2 lines | ~46 |
| 04:14 | Edited shared/src/session.ts | expanded (+7 lines) | ~56 |
| 04:14 | Edited shared/src/save.ts | 2→5 lines | ~60 |
| 04:14 | Edited shared/src/save.ts | 2→4 lines | ~58 |
| 04:15 | Created shared/src/vento.test.ts | — | ~904 |
| 04:15 | Edited shared/src/vento.test.ts | 1→2 lines | ~30 |
| 04:15 | Edited shared/src/session.test.ts | added 1 condition(s) | ~289 |
| 04:16 | Edited shared/src/session.test.ts | 2→2 lines | ~48 |
| 04:17 | Edited shared/src/session.test.ts | added optional chaining | ~1025 |
| 04:18 | Created client/src/vento.ts | — | ~1014 |
| 04:19 | Edited client/src/atlasTexture.ts | added 1 condition(s) | ~895 |
| 04:19 | Edited client/src/vento.ts | 5→7 lines | ~114 |
| 04:19 | Edited client/src/vento.ts | modified setor() | ~256 |
| 04:20 | Edited client/src/atlasTexture.ts | modified paintAgua() | ~591 |
| 04:20 | Edited client/src/atlasTexture.ts | modified animarAguaAtlas() | ~28 |
| 04:20 | Edited client/src/main.ts | added 3 condition(s) | ~252 |
| 04:20 | Edited client/src/main.ts | added 2 condition(s) | ~83 |
| 04:20 | Edited client/src/main.ts | added 1 import(s) | ~23 |
| 04:20 | Edited client/src/main.ts | atlas() → VENTO() | ~199 |
| 04:21 | Edited client/src/main.ts | 3→2 lines | ~17 |
| 04:22 | Edited client/src/daynight.ts | added 1 condition(s) | ~1033 |
| 04:22 | Edited client/src/daynight.ts | expanded (+8 lines) | ~307 |
| 04:22 | Edited client/src/daynight.ts | modified nuvens() | ~418 |
| 04:22 | Edited client/src/daynight.ts | added 1 condition(s) | ~227 |
| 04:22 | Edited client/src/daynight.ts | added 1 condition(s) | ~240 |
| 04:23 | Edited client/src/settings.ts | modified toque() | ~208 |
| 04:23 | Edited client/src/settings.ts | 3→5 lines | ~22 |
| 04:23 | Edited client/src/settings.ts | 3→5 lines | ~57 |
| 04:23 | Edited client/src/settings.ts | modified num() | ~76 |
| 04:23 | Edited client/src/menu.ts | modified streaming() | ~285 |
| 04:24 | Edited client/src/bench.ts | expanded (+6 lines) | ~128 |
| 04:25 | Edited shared/src/blocks.ts | modified ALTA() | ~205 |
| 04:25 | Edited shared/src/blocks.ts | modified isReplaceable() | ~320 |
| 04:25 | Edited shared/src/blocks.ts | 2→2 lines | ~24 |
| 04:25 | Edited shared/src/blocks.ts | 5→6 lines | ~55 |
| 04:25 | Edited shared/src/blocks.ts | 4→5 lines | ~48 |
| 04:25 | Edited shared/src/mesher.ts | 4→9 lines | ~121 |
| 04:26 | Edited shared/src/mesher.ts | inline fix | ~24 |
| 04:26 | Edited shared/src/mesher.ts | added 1 condition(s) | ~170 |
| 04:26 | Edited shared/src/mesher.ts | added 2 condition(s) | ~353 |
| 04:26 | Edited shared/src/mesher.ts | 8→9 lines | ~71 |
| 04:26 | Edited shared/src/mesher.ts | expanded (+9 lines) | ~161 |
| 04:26 | Edited shared/src/mesher.ts | 5→6 lines | ~54 |
| 04:26 | Edited shared/src/mesher.ts | 5→8 lines | ~105 |
| 04:27 | Edited shared/src/mesher.ts | 4→5 lines | ~77 |
| 04:27 | Edited shared/src/mesher.ts | 3→4 lines | ~73 |
| 04:27 | Edited shared/src/mesher.ts | 2→3 lines | ~34 |
| 04:27 | Edited shared/src/mesher.ts | 1→3 lines | ~11 |
| 04:27 | Edited client/src/meshWorker.ts | 8→9 lines | ~92 |
| 04:27 | Edited client/src/meshPool.ts | 4→6 lines | ~58 |
| 04:27 | Edited client/src/chunks.ts | 4→5 lines | ~47 |
| 04:28 | Edited client/src/chunks.ts | 2→5 lines | ~107 |
| 04:28 | Edited client/src/vento.ts | added 1 import(s) | ~171 |
| 04:29 | Edited client/src/main.ts | 4→9 lines | ~116 |
| 04:29 | Edited client/src/main.ts | inline fix | ~22 |
| 04:29 | Edited client/src/main.ts | 1→4 lines | ~76 |
| 04:29 | Edited client/src/main.ts | 2→7 lines | ~148 |
| 04:29 | Edited client/src/main.ts | 3→4 lines | ~56 |
| 04:29 | Edited client/src/chunks.ts | 7→8 lines | ~57 |
| 04:30 | Edited client/src/atlasTexture.ts | added 2 condition(s) | ~444 |
| 04:30 | Edited client/src/atlasTexture.ts | modified gua() | ~96 |
| 04:30 | Edited client/src/blocksUi.ts | modified Flores() | ~149 |
| 04:31 | Edited shared/src/mesher.ts | modified flores() | ~136 |
| 04:31 | Edited shared/src/biomas.ts | 5→9 lines | ~122 |
| 04:31 | Edited shared/src/worldgen.ts | added 2 condition(s) | ~327 |
| 04:32 | Edited shared/src/claims.test.ts | 3→7 lines | ~137 |
| 04:32 | Edited shared/src/mesher.test.ts | 2→3 lines | ~58 |
| 04:33 | Edited shared/src/mesher.test.ts | added 1 condition(s) | ~636 |
| 04:33 | Edited shared/src/blocks.ts | inline fix | ~13 |
| 04:34 | Edited shared/src/blocks.test.ts | modified alta() | ~113 |
| 04:39 | Edited client/src/daynight.ts | 3→5 lines | ~98 |
| 04:41 | Edited shared/src/vento.ts | modified ventoIntensidade() | ~574 |
| 04:41 | Edited client/src/vento.ts | added 1 import(s) | ~24 |
| 04:41 | Edited client/src/vento.ts | removed 22 lines | ~8 |
| 04:41 | Edited client/src/vento.ts | modified ondaAgua() | ~86 |
| 04:41 | Edited shared/src/vento.test.ts | modified for() | ~522 |
| 04:41 | Edited shared/src/vento.test.ts | 7→9 lines | ~45 |

## Sessão 28 (2026-07-27) — §🌬️ vento + vida ambiental, frentes 1 a 6

Usuário escolheu o §🌬️ do ROADMAP e pediu as perguntas em lote antes de ficar AFK.
Decisões: escopo TODO (frentes 1–6) · vento com rotação lenta + rajadas · `/vento` só
liga/desliga · codar+testar+commitar sem push.

| Frente | O que entrou | Arquivos |
|---|---|---|
| 2 vento (base) | `ventoNoTick(tick, seed)` puro; msg `vento` 1×/s + no join; `/vento`; persiste no save | `shared/src/vento.ts` (novo), `protocol.ts`, `session.ts`, `save.ts` |
| 1 textura da água | onda seamless (vetor INTEIRO), 2 senos cruzados, crista com brilho | `client/src/atlasTexture.ts` |
| 3 água segue o vento | 8 setores + crossfade entre vizinhos (mata o "pop"); velocidade pela força | `shared/src/vento.ts`, `client/src/vento.ts` (novo), `main.ts` |
| 4 nuvens | plano único no skyGroup, FBM tileável em alpha, scroll pelo vento, tinge com o sol, ancorado ao MUNDO | `client/src/daynight.ts` |
| 5 folhas | atributo `sway` por vértice + `onBeforeCompile` no material do terreno | `shared/src/mesher.ts`, `meshWorker.ts`, `meshPool.ts`, `chunks.ts`, `client/src/vento.ts` |
| 6 grama alta | `GramaAlta/Seca/Fria` 179-181, cruz, 3 tiles, hotbar, worldgen por clima | `blocks.ts`, `mesher.ts`, `biomas.ts`, `worldgen.ts`, `atlasTexture.ts`, `blocksUi.ts` |

Config nova: `settings.nuvens` e `settings.balanco` (seção DESEMPENHO do menu), ambas ON e
fixadas em `BENCH_SETTINGS` pra perfil medir o jogo que o aluno joga.

Verificação: `npm run typecheck` (3 pacotes) verde · 350 testes verdes · `npm run build` ok ·
`npm run smoke` 6/6 · 3 screenshots headless via CDP (`?bench` + esconder DOM não-canvas)
confirmando água, capim, nuvens de dia e ao entardecer.

Bugs: bug-530 (MAX_BLOCK_ID não acompanhou o append de bloco novo) e bug-531 (teste de claim
acoplado ao conteúdo do worldgen).
| 04:47 | Session end: 88 writes across 24 files (vento.ts, index.ts, protocol.ts, session.ts, save.ts) | 26 reads | ~170159 tok |
| 07:57 | Edited shared/src/vento.ts | added 1 condition(s) | ~177 |
| 07:57 | Edited shared/src/mesher.ts | modified gua() | ~228 |
| 07:58 | Edited shared/src/mesher.ts | added 3 condition(s) | ~451 |
| 07:58 | Edited shared/src/mesher.ts | expanded (+8 lines) | ~77 |
| 07:58 | Edited shared/src/mesher.ts | modified tileDaAgua() | ~138 |
| 07:58 | Edited shared/src/mesher.ts | 2→7 lines | ~59 |
| 07:58 | Edited shared/src/mesher.ts | added 1 import(s) | ~41 |
| 08:00 | Edited client/src/main.ts | modified gios() | ~227 |
| 08:00 | Edited client/src/main.ts | 2→5 lines | ~56 |
| 08:01 | Edited shared/src/mesher.test.ts | modified for() | ~652 |
| 08:01 | Edited shared/src/mesher.test.ts | modified tilesUsados() | ~170 |
| 08:01 | Edited shared/src/mesher.test.ts | 11→14 lines | ~55 |
| 08:02 | Edited shared/src/vento.test.ts | modified for() | ~347 |
| 08:02 | Edited shared/src/vento.test.ts | modified for() | ~198 |
| 08:06 | Edited client/src/main.ts | expanded (+8 lines) | ~242 |
| 08:06 | Edited client/src/main.ts | 3→5 lines | ~67 |

### Sessão 28b (2026-07-27) — playtest do §🌬️: regra da correnteza

Usuário rodou bench no PC e no notebook. Veredito: "achei tudo muito top" — **uma** ressalva,
e é de REGRA, não de bug: o vento mandando na animação da água que escorre é contraditório;
"a correnteza da agua fluindo deve ditar o movimento e direção da textura".

Regra nova, e ela resolve os dois casos sem flag: `tileDaAgua` no mesher tira o fluxo do
**gradiente de nível** da vizinhança (só vizinho de ÁGUA conta — contar ar faria a borda de
todo lago escorrer pra fora). Gradiente zero = água parada = segue o vento; gradiente = corre
pra jusante. Mar/lago do worldgen é 100% fonte (nível 8) → parada. Riacho é 8→7→6→… → corre.

Implementação: **8 tiles de atlas** (`TILE.aguaFluxo` 112-119, contíguos na linha 7), um por
setor de `setorDaDirecao`. O mesher escolhe o tile por célula — segue função pura de bytes,
sem material novo e sem atributo novo no Worker. Dois relógios no cliente: água parada anda no
ritmo do vento, corrente a 8 fps fixos.

De quebra: a pintura da água virou `putImageData` (era `fillRect` + string `rgb()` por pixel —
9 tiles × 256 px seriam 2 304 strings por repintura) e ganhou **teto de 12 repinturas/s**,
porque `needsUpdate` reenvia o atlas inteiro (262 KB) e dois relógios somariam >20/s.

Verificação: typecheck · 355 testes (5 novos: lago parado · riacho pra jusante · rumo pelo
eixo · contiguidade dos 8 tiles · `setorDaDirecao`) · build · riacho SIMULADO com `waterRule`
de verdade mostrando os 8 setores radiais + mar na água parada · `?atlas` no headless
confirmando a faixa dos 8 tiles pintada no lugar certo.
| 08:10 | Session end: 104 writes across 24 files (vento.ts, index.ts, protocol.ts, session.ts, save.ts) | 29 reads | ~174443 tok |
| 08:53 | Edited shared/src/mesher.ts | added nullish coalescing | ~380 |
| 08:53 | Edited shared/src/mesher.ts | added 3 condition(s) | ~578 |
| 08:53 | Edited shared/src/mesher.ts | modified for() | ~130 |
| 08:54 | Edited shared/src/mesher.ts | modified fluxoDaAgua() | ~134 |
| 08:54 | Edited shared/src/mesher.ts | added 1 condition(s) | ~96 |

### Sessão 28c (2026-07-27) — sentido da correnteza face por face

Usuário: "as texturas estão rotacionadas para cada face", com receita a partir de um caso
(correnteza sul→norte): topo certo · baixo 180 · sul 90 CW · leste 180 · oeste certa · norte 90 CW.

Derivei a tabela antes de aplicar e a receita NÃO generaliza. Com fluxo pro norte as 4
laterais mostram a onda DESCENDO; com fluxo pro leste elas já mostram horizontal — nenhuma
rotação constante acerta os dois. Causa real: a regra da 28b escolhia UM tile por CÉLULA e
usava nas 6 faces, mas cada face amarra os 2 eixos do tile a direções de mundo diferentes
(no topo u/v seguem x/z; embaixo x/z invertidos; nas laterais um eixo é o VERTICAL).

Correção geral: `tileAguaDaFace` escolhe o tile POR FACE, projetando o vetor de fluxo em
`FACE_BASES` (eixos de mundo de u e v por face, derivados de FACES, não escritos à mão).
Lateral perpendicular ao fluxo — e água CAINDO — mostra a onda descendo (cachoeira).

Resultado medido pro caso do usuário: as 6 faces acompanham o fluxo (topo/baixo/leste/oeste =
norte; norte/sul = baixo, que são as perpendiculares). Mar/lago segue parado no vento.

358 testes (3 novos, sobre o helper puro em vez de UV crua) · typecheck · build · smoke 6/6.
Bug-533.
| 08:59 | Session end: 109 writes across 24 files (vento.ts, index.ts, protocol.ts, session.ts, save.ts) | 29 reads | ~177538 tok |

**Sessão 28 encerrada** (2026-07-27). §🌬️ aprovado no playtest do usuário ("achei tudo muito
top") depois de bench no PC dele e no notebook do lab. Commitada e pushada em 3 commits:
`b9bc7a3` (frentes 1-6) · `3418cf4` (regra da correnteza) · `7db6890` (sentido por face).
Nenhum gatilho aceso; próxima sessão escolhe do backlog (som de água/vento é o vizinho natural).
| 09:04 | Session end: 109 writes across 24 files (vento.ts, index.ts, protocol.ts, session.ts, save.ts) | 29 reads | ~177538 tok |

## Session: 2026-07-27 09:15

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 09:27 | Edited relatorio/relatorio-aplicacao.md | inline fix | ~8 |
| 09:27 | Edited client/src/bench.ts | perfil() → benchSettings() | ~534 |
| 09:28 | Edited client/src/bench.ts | modified constructor() | ~139 |
| 09:28 | Edited client/src/bench.ts | 6→10 lines | ~82 |
| 09:28 | Edited client/src/bench.ts | 2→5 lines | ~77 |
| 09:28 | Edited client/src/main.ts | inline fix | ~21 |
| 09:28 | Edited client/src/main.ts | inline fix | ~27 |
| 09:28 | Edited client/src/main.ts | 3→6 lines | ~78 |
| 09:29 | Edited server/src/perfis.ts | modified salvarPerfil() | ~272 |
| 09:29 | Edited client/src/main.ts | 4→7 lines | ~109 |
| 09:31 | Edited client/src/hud.ts | 5→9 lines | ~100 |
| 09:31 | Edited client/src/hud.ts | 6→8 lines | ~80 |
| 09:31 | Edited client/src/main.ts | 3→5 lines | ~48 |
| 09:31 | Edited scripts/bench-headless.mjs | added optional chaining | ~114 |
| 09:39 | Created relatorio/apresentacao-cre.html | — | ~8768 |
| 09:40 | Edited relatorio/apresentacao-cre.html | 2→4 lines | ~40 |
| 09:42 | Edited relatorio/apresentacao-cre.html | 10→5 lines | ~79 |
| 09:42 | Edited relatorio/apresentacao-cre.html | inline fix | ~28 |
| 09:42 | Edited relatorio/apresentacao-cre.html | added 1 condition(s) | ~66 |
| 09:20 | Relatório sem data (só a data da versão saiu da ficha; período do piloto é DADO, fica) | relatorio/relatorio-aplicacao.md | 1 linha | ~1k |
| 09:35 | Flag `?bench&semvida` = lado B do A/B do §🌬️ + etiqueta no perfil (`meta.bench.semVida`, `config.nuvens/balanco`) e nome de arquivo `perf-bench-semvida-*` | client/src/bench.ts, main.ts, hud.ts, server/src/perfis.ts, scripts/bench-headless.mjs | typecheck 3/3, 358 testes, build; headless A e B conferidos (true/true × false/false) | ~14k |
| 10:10 | Deck da CRE: 20 slides, HTML autocontido, notas do apresentador (N / `?notas`), handout no Ctrl+P | relatorio/apresentacao-cre.html | 289 KB, 4 slides verificados por screenshot | ~22k |
| 10:12 | PNG→JPEG por CDP (máquina sem PIL/imagemagick): 2 MB de print → 473 KB base64 | scratchpad/png2jpg.mjs | 6 prints convertidos | ~4k |
| 09:49 | Edited iniciar-servidor.bat | expanded (+74 lines) | ~761 |
| 09:50 | Edited iniciar-servidor.sh | modified atualizar() | ~663 |
| 09:51 | Edited iniciar-servidor.sh | trabalho() → conta() | ~148 |
| 09:51 | Edited iniciar-servidor.bat | tenta() → REM() | ~122 |
| 10:40 | Auto-update no launcher (pergunta antes, --ff-only, 6 escapes, npm install só após atualizar) | iniciar-servidor.sh, iniciar-servidor.bat | .sh testado em 8 caminhos com clone local + npm falso; .bat NÃO testável em Linux | ~12k |
| 10:55 | Varredura pró-repo-público: apelido de aluno em .wolf/history.md (tracked) + profiles-escola/perf-<apelido>-*.json no HISTÓRICO + server/world.ljw com PIN/código de teste | git history, .wolf/STATUS.md | ⛔ abrir o repo como está desmentiria o relatório; recomendado repo público novo | ~6k |
| 09:54 | Session end: 23 writes across 9 files (relatorio-aplicacao.md, bench.ts, main.ts, perfis.ts, hud.ts) | 17 reads | ~60223 tok |
| 09:55 | Session end: 23 writes across 9 files (relatorio-aplicacao.md, bench.ts, main.ts, perfis.ts, hud.ts) | 17 reads | ~60223 tok |
| 10:15 | Created README.md | — | ~1840 |
| 10:16 | Edited .gitignore | 4→8 lines | ~110 |
| 11:20 | README público + 5 commits + push (repo já estava PUBLIC) | README.md, git | 26b7650 bench · fbbe3d0 launcher · f23d5a9 docs · e49aa15 privacidade · edec801 wolf | ~10k |
| 10:20 | Session end: 25 writes across 11 files (relatorio-aplicacao.md, bench.ts, main.ts, perfis.ts, hud.ts) | 18 reads | ~62535 tok |
| 10:31 | Created LICENSE | — | ~1070 |
| 10:31 | Edited README.md | expanded (+13 lines) | ~351 |
| 11:35 | LICENSE source-available (uso livre em escola · modificar/distribuir passa pelo autor · cenário do professor é dele) + resumo no README | LICENSE, README.md | f6d72af pushado | ~6k |
| 11:45 | Decisões da sessão no cerebrum: repo público + licença source-available; histórico com apelidos fica (decisão do usuário, não reabrir) | .wolf/cerebrum.md, STATUS.md, TODO.md | Decision Log + handoff atualizados | ~4k |
| 10:33 | Session end: 27 writes across 12 files (relatorio-aplicacao.md, bench.ts, main.ts, perfis.ts, hud.ts) | 18 reads | ~64058 tok |

## Resumo da sessão 29 (2026-07-27)

Pedido do usuário: pontos 2 e 4 do backlog + relatório sem data + um deck pra apresentar
informalmente na CRE. Ordem do backlog fixada por ele: auto-update → mobile → v2 da geração →
sobrevivência.

Entregue: (1) relatório sem data; (2) `?bench&semvida` = lado B do A/B do §🌬️, com etiqueta
em 3 lugares e `benchSettings()` como fonte única (o `meta` ia mentir `nuvens:true`);
(3) deck da CRE em HTML autocontido, 20 slides, notas em N, handout no Ctrl+P; (4) auto-update
no launcher (`git pull`, pergunta antes, `--ff-only`, 6 escapes) — `.sh` testado nos 8
caminhos, `.bat` NÃO (sem cmd.exe aqui); (5) README público; (6) LICENSE source-available.

Achado do caminho: varredura pré-abertura do repo pegou apelido de aluno em `.wolf/history.md`
(rastreado), no HISTÓRICO (`profiles-escola/perf-<apelido>-*.json`) e `server/world.ljw`
rastreado com PIN/código de teste. Árvore limpa em `e49aa15`; sobre o histórico o usuário
decidiu deixar ("não tem problema") — encerrado no Decision Log.

4 bugs logados (534 screenshot preto por data: URL · 535 flex stretch na tag · 536 print com
FPS 8 no slide de desempenho · 537 etiqueta do A/B ia mentir). Verify verde: typecheck 3/3,
358 testes, build. 7 commits pushados.
| 11:48 | Session end: 27 writes across 12 files (relatorio-aplicacao.md, bench.ts, main.ts, perfis.ts, hud.ts) | 18 reads | ~64058 tok |

## Session: 2026-07-27 19:43

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 20:10 | leitura do A/B do §🌬️ rodado pelo usuário (PC dev): GPU 5,16→4,62 ms, FPS igual por vsync | profiles/*52k0.json, *y9ew.json | custo da vida ambiental ≈0,54 ms GPU (sinal, ruído é 1-2%) | ~4k |
| 20:25 | entrevista de escopo da SOBREVIVÊNCIA (4 perguntas) + escrita do escopo | .wolf/ROADMAP.md §🍖 | 5 decisões travadas, 9 frentes (F1 /modo → F9 preset), colisões mapeadas | ~12k |
| 20:30 | escopo referenciado no handoff e nas decisões | .wolf/STATUS.md, TODO.md, cerebrum.md | ordem da fila inalterada (sobrevivência segue 4ª) | ~3k |
| 20:45 | decisão do usuário: inventário na morte vira REGRA DE MUNDO (/regra, molde do /gamerule), manter-inventario ON por padrão | .wolf/ROADMAP.md §🍖, TODO.md, cerebrum.md | registro de regras entra no F1; /pvp vira atalho da regra; ramo "off" = itens somem (não há baú no jogo) | ~6k |
| 20:55 | preparo pro /clear: diário da sessão 30 no topo do STATUS + pendência 2 atualizada | .wolf/STATUS.md | handoff fechado; sessão sem código, só perfil lido e escopo aberto | ~5k |

**Resumo da sessão 30 (2026-07-27):** zero código. (1) Lidos os dois perfis do A/B do §🌬️ que
o usuário rodou no PC de dev — custo de nuvens+balanço ≈0,54 ms de GPU, invisível em FPS por
vsync; falta a rodada do lab. (2) Entrevista de escopo da SOBREVIVÊNCIA (4 perguntas) → 6
decisões travadas e 9 frentes escritas em `.wolf/ROADMAP.md §🍖`, incluindo o registro de
regras de mundo (`/regra`, molde do `/gamerule`) pedido pelo usuário. Ordem da fila inalterada:
layouts mobile segue sendo o próximo.

## Session: 2026-07-27 23:31

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 23:38 | Edited client/index.html | 5→7 lines | ~80 |
| 23:38 | Edited client/index.html | modified media() | ~1428 |
| 23:38 | Edited client/src/touch.ts | 5→8 lines | ~135 |
| 23:38 | Edited client/src/touch.ts | modified setScale() | ~54 |
| 23:39 | Edited client/src/chat.ts | added 1 condition(s) | ~342 |
| 23:39 | Edited client/src/chat.ts | 2→3 lines | ~30 |
| 23:39 | Edited client/src/chat.ts | 4→5 lines | ~73 |
| 23:39 | Edited client/src/chat.ts | added 1 condition(s) | ~170 |
| 23:39 | Edited client/src/main.ts | added optional chaining | ~248 |
| 23:42 | Edited client/index.html | 13→17 lines | ~171 |
| 23:43 | Edited client/index.html | modified baixa() | ~217 |
| 23:43 | Edited client/index.html | reduced (-7 lines) | ~20 |
| 23:45 | Edited client/index.html | 7→9 lines | ~126 |
| 23:46 | Edited client/index.html | modified and() | ~115 |
| 23:49 | Edited package.json | 1→2 lines | ~32 |
| 23:50 | Edited scripts/tablet-shots.mjs | expanded (+16 lines) | ~332 |
| 23:50 | Edited scripts/tablet-shots.mjs | modified designqc() | ~50 |

## Sessão 31 (2026-07-27) — layouts mobile, 1ª rodada

| 23:05 | entrevista de escopo mobile (2 perguntas) | — | usuário: menu + inventário/hotbar + chat/HUD; régua "os dois, Fire manda"; celular RECUSADO | ~2k |
| 23:12 | levantamento: `@media` = 0 no index.html, uiScale só escala touch.ts | client/index.html, touch.ts | 5 defeitos reais mapeados | ~8k |
| 23:20 | 3 media queries + box-sizing + alvos de dedo | client/index.html | menu/inventário/chat/HUD/hotbar em 1024×600 | ~6k |
| 23:26 | `--ts` de #touch-ui → :root (o #chat precisa do valor) | client/src/touch.ts | chat desvia do joystick | ~1k |
| 23:32 | `--kb` via visualViewport + scroll do log pro fim | client/src/chat.ts | campo do chat sobrevive ao teclado virtual | ~2k |
| 23:38 | hotbar tocável (delegação de pointerdown na faixa .slots) | client/src/main.ts | tablet troca de bloco sem abrir inventário | ~1k |
| 23:45 | verificação headless nova (CDP + setEmulatedMedia coarse) | scripts/tablet-shots.mjs, package.json | 15/15 medições verdes; pegou bug-538 e bug-539 | ~9k |
| 23:52 | verify + regressão desktop 1920×1080 e tablet 1280×800 | — | typecheck 3/3, 358 testes, build ok | ~3k |
| 23:54 | Session end: 17 writes across 6 files (index.html, touch.ts, chat.ts, main.ts, package.json) | 12 reads | ~45406 tok |
| 2026-07-28 00:12 | entrevista de escopo da v2 da geração (3 perguntas) | .wolf/ROADMAP.md §🏔️ | os dois/cavernas antes · todo mundo procedural · relevo "montanha de verdade" | ~3k |
| 2026-07-28 00:25 | levantamento do ponto de partida: cavernas=0, Bioma sem campo de relevo, SEM luz voxel | shared/{worldgen,biomas}.ts, client/torchGlow.ts | 7 colisões escritas; "madeira por espécie" descoberta OBSOLETA (já feita na sessão 10) | ~5k |
| 2026-07-28 00:38 | handoff pro /clear | .wolf/{STATUS,TODO,cerebrum,ROADMAP}.md | playtest mobile virou pendência de escola; v2 vira quest ativa | ~4k |
| 08:21 | Session end: 17 writes across 6 files (index.html, touch.ts, chat.ts, main.ts, package.json) | 12 reads | ~45406 tok |
| 08:21 | Session end: 17 writes across 6 files (index.html, touch.ts, chat.ts, main.ts, package.json) | 12 reads | ~45406 tok |
| 08:21 | Session end: 17 writes across 6 files (index.html, touch.ts, chat.ts, main.ts, package.json) | 12 reads | ~45406 tok |
| 08:23 | Session end: 17 writes across 6 files (index.html, touch.ts, chat.ts, main.ts, package.json) | 12 reads | ~45406 tok |
| 08:25 | Session end: 17 writes across 6 files (index.html, touch.ts, chat.ts, main.ts, package.json) | 12 reads | ~45406 tok |

## Session: 2026-07-28 08:25

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 08:33 | Created shared/src/luz.ts | — | ~4894 |
| 08:34 | Edited shared/src/index.ts | 2→3 lines | ~22 |
| 08:35 | Created shared/src/luz.test.ts | — | ~3319 |
| 08:36 | Edited shared/src/luz.ts | added 1 condition(s) | ~123 |
| 08:36 | Edited shared/src/luz.ts | inline fix | ~26 |
| 08:36 | Edited shared/src/luz.test.ts | has() → toBeUndefined() | ~114 |
| 08:38 | Edited shared/src/luz.ts | added 4 condition(s) | ~1173 |
| 08:38 | Edited shared/src/luz.ts | modified semearVizinhanca() | ~428 |
| 08:39 | Edited shared/src/luz.ts | added 2 condition(s) | ~325 |
| 08:39 | Edited shared/src/luz.ts | added 4 condition(s) | ~349 |
| 08:40 | Edited shared/src/luz.ts | added 4 condition(s) | ~867 |
| 08:40 | Edited shared/src/luz.ts | added 1 condition(s) | ~168 |
| 08:40 | Edited shared/src/luz.ts | 3→6 lines | ~70 |
| 08:40 | Edited shared/src/luz.ts | modified if() | ~41 |
| 08:41 | Edited shared/src/luz.ts | modified for() | ~114 |
| 08:42 | Edited shared/src/luz.test.ts | modified for() | ~402 |
| 08:43 | Edited shared/src/mesher.ts | expanded (+12 lines) | ~204 |
| 08:43 | Edited shared/src/mesher.ts | 5→6 lines | ~56 |
| 08:43 | Edited shared/src/mesher.ts | added nullish coalescing | ~595 |
| 08:43 | Edited shared/src/mesher.ts | added 1 import(s) | ~31 |
| 08:43 | Edited shared/src/mesher.ts | expanded (+7 lines) | ~138 |
| 08:44 | Edited shared/src/mesher.ts | modified luzDe() | ~117 |
| 08:44 | Edited shared/src/mesher.ts | 4→5 lines | ~38 |
| 08:44 | Edited shared/src/mesher.ts | modified lula() | ~93 |
| 08:44 | Edited shared/src/mesher.ts | 2→5 lines | ~104 |
| 08:44 | Edited shared/src/mesher.ts | 3→4 lines | ~44 |
| 08:44 | Edited client/src/meshPool.ts | 2→4 lines | ~59 |
| 08:44 | Edited client/src/meshPool.ts | added 2 condition(s) | ~259 |
| 08:45 | Edited client/src/meshWorker.ts | 5→8 lines | ~87 |
| 08:45 | Edited client/src/meshWorker.ts | 4→4 lines | ~35 |
| 08:45 | Edited client/src/meshWorker.ts | 6→10 lines | ~86 |
| 08:45 | Edited client/src/chunks.ts | 8→11 lines | ~55 |
| 08:45 | Edited client/src/chunks.ts | 6→7 lines | ~46 |
| 08:45 | Edited client/src/chunks.ts | expanded (+8 lines) | ~111 |
| 08:45 | Edited client/src/chunks.ts | modified constructor() | ~71 |
| 08:45 | Edited client/src/chunks.ts | inline fix | ~20 |
| 08:45 | Edited client/src/chunks.ts | modified remeshSujos() | ~232 |
| 08:45 | Edited client/src/chunks.ts | 2→2 lines | ~24 |
| 08:45 | Edited client/src/chunks.ts | 1→4 lines | ~89 |
| 08:46 | Edited client/src/chunks.ts | 2→3 lines | ~24 |
| 08:46 | Edited client/src/chunks.ts | 2→2 lines | ~32 |
| 08:47 | Created client/src/luzShader.ts | — | ~896 |
| 08:47 | Edited client/src/daynight.ts | 2→7 lines | ~132 |
| 08:47 | Edited client/src/daynight.ts | expanded (+9 lines) | ~152 |
| 08:47 | Edited client/src/daynight.ts | modified nivelCeu() | ~79 |
| 08:48 | Edited client/src/main.ts | added 1 import(s) | ~40 |
| 08:48 | Edited client/src/main.ts | 3→7 lines | ~36 |
| 08:48 | Edited client/src/main.ts | expanded (+7 lines) | ~135 |
| 08:48 | Edited client/src/main.ts | 1→6 lines | ~97 |
| 08:48 | Edited client/src/main.ts | 3→5 lines | ~37 |
| 08:49 | Edited client/src/main.ts | 2→3 lines | ~26 |
| 08:49 | Edited client/src/main.ts | modified if() | ~190 |
| 08:49 | Edited client/src/main.ts | 2→6 lines | ~114 |
| 08:49 | Edited client/src/main.ts | modified for() | ~62 |
| 08:49 | Edited client/src/main.ts | modified for() | ~60 |
| 08:49 | Edited client/src/main.ts | added 1 condition(s) | ~97 |
| 08:49 | Edited client/src/main.ts | 3→7 lines | ~139 |
| 08:49 | Edited client/src/main.ts | expanded (+7 lines) | ~219 |
| 08:50 | Edited client/src/main.ts | 1→5 lines | ~93 |
| 08:52 | Created scripts/luz-shots.mjs | — | ~2154 |
| 08:52 | Edited client/src/main.ts | 2→6 lines | ~115 |
| 08:52 | Edited client/src/main.ts | 3→4 lines | ~48 |
| 08:52 | Edited package.json | 1→2 lines | ~29 |
| 08:54 | Edited scripts/luz-shots.mjs | added 6 condition(s) | ~980 |
| 08:54 | Edited scripts/luz-shots.mjs | removed 24 lines | ~35 |
| 08:54 | Edited scripts/luz-shots.mjs | 6→7 lines | ~104 |
| 08:55 | Edited client/src/main.ts | added 1 condition(s) | ~165 |
| 08:56 | Edited client/src/main.ts | expanded (+11 lines) | ~162 |
| 08:56 | Edited client/src/main.ts | added 2 condition(s) | ~388 |
| 08:56 | Edited client/src/main.ts | modified if() | ~92 |
| 08:56 | Edited client/src/main.ts | 1→6 lines | ~100 |
| 08:56 | Edited client/src/main.ts | 2→4 lines | ~54 |
| 08:57 | Edited client/src/hud.ts | 1→6 lines | ~127 |
| 08:57 | Edited client/src/hud.ts | modified toFixed() | ~82 |
| 08:57 | Edited client/src/hud.ts | 1→2 lines | ~18 |
| 08:57 | Edited client/src/main.ts | 3→4 lines | ~45 |
| 09:01 | Edited shared/src/worldgen.ts | added 1 condition(s) | ~894 |
| 09:02 | Edited shared/src/worldgen.ts | added 3 condition(s) | ~499 |
| 09:02 | Edited shared/src/worldgen.ts | added 1 condition(s) | ~86 |
| 09:07 | Edited shared/src/world.ts | added optional chaining | ~397 |
| 09:07 | Edited shared/src/session.ts | modified cavernas() | ~265 |
| 09:07 | Edited shared/src/session.ts | 1→3 lines | ~15 |
| 09:08 | Edited shared/src/worldgen.test.ts | added 1 import(s) | ~81 |
| 09:09 | Edited shared/src/worldgen.test.ts | 3→4 lines | ~85 |
| 09:10 | Edited shared/src/worldgen.test.ts | modified for() | ~448 |
| 09:14 | Edited shared/src/worldgen.ts | modified cavFatia() | ~437 |
| 09:14 | Edited shared/src/worldgen.ts | added 8 condition(s) | ~853 |
| 09:14 | Edited shared/src/worldgen.ts | modified for() | ~238 |
| 09:14 | Edited shared/src/worldgen.test.ts | modified for() | ~273 |
