# Memory

> Chronological action log. Hooks and AI append to this file automatically.
> Old sessions are consolidated by the daemon weekly.

## Session: 2026-07-10 09:08

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-10 09:09

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-10 09:09

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-10 09:09

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-10 09:13

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-10 09:16

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| —    | Entrevista de requisitos completa; travou escopo MVP v0 e arquitetura cliente=servidor | STATUS.md, cerebrum.md | Decisões gravadas; próximo passo = walking skeleton | ~15k |

## Session: 2026-07-10 14:11

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 14:30 | Revisão do projeto: render fechado em three.js (vs Babylon); código irá pra ~/projetos/logica-em-jogo (WSL, fora do OneDrive) | .wolf/STATUS.md, .wolf/cerebrum.md | decisões registradas | ~400 |
| 15:00 | Pesquisa de otimização voxel + política fechada (baseline/adiada/proibida); WebGLRenderer confirmado | .wolf/STATUS.md, .wolf/cerebrum.md | política registrada | ~600 |
| 15:20 | Decidido: tamanho de mundo = parâmetro de criação (header save/snapshot, teto no servidor); HUD F3 de perfilação desde checkpoint 1 + debug_stats + export JSON | .wolf/STATUS.md, .wolf/cerebrum.md | decisões registradas | ~350 |
| 15:35 | FIM DE SESSÃO. Resumo: revisão do projeto; render fechado three.js (WebGLRenderer); política de otimização (baseline/adiada/proibida); tamanho de mundo = parâmetro de criação; HUD F3 de perfilação; projeto inteiro migra pra ~/projetos/logica-em-jogo (WSL), OneDrive vira backup. Próxima sessão: git init + scaffold + checkpoint 1 | .wolf/* | sessão encerrada | — |

## Session: 2026-07-10 15:11

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 15:35 | git init (branch main) na raiz do projeto | .git/ | ok | ~50 |
| 16:39 | Created .gitignore | — | ~17 |
| 16:40 | Created package.json | — | ~120 |
| 16:40 | Created tsconfig.base.json | — | ~121 |
| 16:40 | Created shared/package.json | — | ~56 |
| 16:40 | Created shared/tsconfig.json | — | ~18 |
| 16:40 | Created shared/src/index.ts | — | ~16 |
| 16:40 | Created shared/src/blocks.ts | — | ~93 |
| 16:41 | Created shared/src/constants.ts | — | ~156 |
| 16:41 | Created shared/src/blocks.test.ts | — | ~165 |
| 16:41 | Created server/package.json | — | ~70 |
| 16:41 | Created server/tsconfig.json | — | ~33 |
| 16:41 | Created server/src/index.ts | — | ~173 |
| 16:41 | Created client/package.json | — | ~72 |
| 16:41 | Created client/tsconfig.json | — | ~39 |
| 16:41 | Created client/vite.config.ts | — | ~30 |
| 16:41 | Created client/index.html | — | ~120 |
| 16:41 | Created client/src/main.ts | — | ~370 |
| 16:43 | commit docs + scaffold monorepo (shared/server/client, TS estrito, Vite, three.js, ws, vitest); typecheck+test+build+smoke ok | package.json, tsconfig.base.json, shared/, server/, client/ | ok | ~4000 |
| 16:44 | Session end: 17 writes across 11 files (.gitignore, package.json, tsconfig.base.json, tsconfig.json, index.ts) | 0 reads | ~1679 tok |

## Session: 2026-07-10 17:46

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 17:49 | resumo de sessão: git init, commit docs (aae8a06), scaffold monorepo (3fbca1c), STATUS.md atualizado p/ checkpoint 1 | .wolf/ | ok | ~sessão |

## Session: 2026-07-10 18:08

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-11 22:51

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-11 22:52

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 00:02 | Created shared/src/world.ts | — | ~848 |
| 00:02 | Created shared/src/worldgen.ts | — | ~575 |
| 00:02 | Created shared/src/mesher.ts | — | ~1443 |
| 00:02 | Created shared/src/physics.ts | — | ~1079 |
| 00:03 | Created shared/src/index.ts | — | ~46 |
| 00:03 | Created shared/src/world.test.ts | — | ~761 |
| 00:03 | Created shared/src/mesher.test.ts | — | ~561 |
| 00:03 | Created shared/src/physics.test.ts | — | ~856 |
| 10:35 | Created client/src/atlasTexture.ts | — | ~799 |
| 10:35 | Created client/src/chunks.ts | — | ~527 |
| 10:35 | Created client/src/input.ts | — | ~450 |
| 10:35 | Created client/src/hud.ts | — | ~1019 |
| 10:36 | Created client/src/main.ts | — | ~980 |
| 10:36 | Created client/index.html | — | ~527 |
| 10:36 | Edited client/src/atlasTexture.ts | 2→2 lines | ~15 |
| 10:49 | designqc: captured 0 screenshots (0KB, ~0 tok) | / | ready for eval | ~0 |
| 10:30 | npm install (node_modules ausente pós-migração pro WSL) | package-lock.json | ok, vitest voltou | ~200 |
| 10:35 | Checkpoint 1 /shared: world.ts, worldgen.ts, mesher.ts, physics.ts + 3 arquivos de teste (16 testes novos) | shared/src/* | 20/20 testes, typecheck ok | ~8000 |
| 10:45 | Checkpoint 1 /client: atlasTexture, chunks, input, hud, main reescrito, index.html (overlay+HUD) | client/src/*, client/index.html | typecheck 3/3, build ok | ~6000 |
| 10:50 | Fix TS2345 literal-type em default param (bug-001) | client/src/atlasTexture.ts | corrigido | ~300 |
| 10:55 | Chrome p/ screenshot: unzip ausente quebrava puppeteer install; extraído manual c/ python3, chrome_path setado (bug-002) | .wolf/config.json | chrome headless funcional | ~1500 |
| 10:58 | Screenshot headless valida checkpoint 1: terreno grama/areia renderizando + overlay | scratchpad/checkpoint1.png | ✅ visual ok | ~1500 |
| 11:00 | STATUS/anatomy/cerebrum/buglog atualizados; próxima: playtest do usuário + commit + checkpoint 2 | .wolf/* | ok | ~1000 |
| 10:54 | Session end: 15 writes across 14 files (world.ts, worldgen.ts, mesher.ts, physics.ts, index.ts) | 9 reads | ~10523 tok |
| 11:15 | Edited client/src/input.ts | 2→4 lines | ~72 |
| 11:16 | Edited client/src/input.ts | added optional chaining | ~188 |
| 11:20 | Fix câmera teleportando (spikes de movementX/Y do Chrome no pointer lock): MAX_DELTA=350 + unadjustedMovement (bug-003) | client/src/input.ts | typecheck ok, aguarda re-teste | ~800 |
| 11:16 | Session end: 17 writes across 14 files (world.ts, worldgen.ts, mesher.ts, physics.ts, index.ts) | 9 reads | ~10783 tok |
| 11:19 | Edited client/src/input.ts | 2→5 lines | ~79 |
| 11:19 | Edited client/src/input.ts | added 1 condition(s) | ~161 |
| 11:19 | Edited client/src/hud.ts | 2→5 lines | ~69 |
| 11:19 | Edited client/src/hud.ts | added 1 condition(s) | ~128 |
| 11:19 | Edited client/src/main.ts | 1→5 lines | ~53 |
| 11:19 | Session end: 22 writes across 14 files (world.ts, worldgen.ts, mesher.ts, physics.ts, index.ts) | 9 reads | ~11273 tok |
| 11:45 | Playtest usuário: checkpoint 1 ok; pulos de câmera melhoraram (fix parcial bug-003), restam raros | client/src/input.ts | parcial — dados no HUD p/ próxima rodada | ~500 |
| 11:50 | STATUS/buglog atualizados (bug-004 auto-falso-positivo removido); commit do checkpoint 1 | .wolf/*, git | ok | ~800 |
| 11:37 | Created .gitattributes | — | ~31 |
| 12:10 | Saneamento git: CRLF→LF (sed corrompeu PDF, restaurado), .gitattributes, identidade local refeita, renormalize (bug-004) | .gitattributes, git config | árvore limpa | ~3000 |
| 12:15 | Commits: 1d0c0a7 feat checkpoint 1 (+1140), e4e43f7 chore(wolf) (+860); push GitHub PENDENTE | git | ✅ | ~500 |
| 16:51 | Session end: 23 writes across 15 files (world.ts, worldgen.ts, mesher.ts, physics.ts, index.ts) | 9 reads | ~11306 tok |

## Session: 2026-07-11 16:55

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 17:10 | Created shared/src/protocol.ts | — | ~1386 |
| 17:10 | Created shared/src/session.ts | — | ~919 |
| 17:10 | Created shared/src/protocol.test.ts | — | ~935 |
| 17:11 | Created shared/src/session.test.ts | — | ~900 |
| 17:11 | Created shared/src/index.ts | — | ~62 |
| 17:11 | Created server/src/worker.ts | — | ~252 |
| 17:11 | Edited server/tsconfig.json | 3→4 lines | ~25 |
| 17:11 | Created client/src/connection.ts | — | ~385 |
| 17:12 | Created client/src/main.ts | — | ~1520 |
| 17:12 | Edited client/src/hud.ts | modified netcode() | ~46 |
| 17:12 | Edited client/src/hud.ts | "rede ${s.net.msgsPerSec} " → "rede ${s.net.msgsPerSec} " | ~36 |
| 17:06 | push main pro GitHub (repo privado meketreve/logica-em-jogo já existia; commit chore(wolf) antes) | — | ok, main=origin/main | ~2k |
| 17:14 | checkpoint 2: protocol.ts+session.ts em /shared (+13 testes), worker.ts em /server (lib WebWorker no tsconfig), connection.ts + main.ts refeito no /client, HUD tick méd/máx | shared/src/{protocol,session}{,.test}.ts server/src/worker.ts client/src/{connection,main,hud}.ts | 33 testes, typecheck 3/3, build ok, screenshot = checkpoint 1 | ~35k |
| 17:17 | Session end: 11 writes across 10 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 10 reads | ~10559 tok |
| 17:18 | Session end: 11 writes across 10 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 10 reads | ~10559 tok |
| 17:40 | playtest do checkpoint 2 pelo usuário: "tudo certo" | — | aprovado, próximo = checkpoint 3 | ~1k |
| 17:20 | Session end: 11 writes across 10 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 10 reads | ~10559 tok |
| 17:23 | Edited shared/src/constants.ts | 2→5 lines | ~62 |
| 17:23 | Edited shared/src/blocks.ts | modified isPlaceable() | ~81 |
| 17:23 | Created shared/src/raycast.ts | — | ~649 |
| 17:23 | Created shared/src/raycast.test.ts | — | ~604 |
| 17:23 | Edited shared/src/protocol.ts | expanded (+11 lines) | ~237 |
| 17:23 | Edited shared/src/protocol.ts | added 2 condition(s) | ~311 |
| 17:24 | Edited shared/src/protocol.ts | modified switch() | ~254 |
| 17:24 | Edited shared/src/session.ts | added 2 import(s) | ~115 |
| 17:24 | Edited shared/src/session.ts | added 11 condition(s) | ~912 |
| 17:24 | Edited shared/src/session.ts | modified if() | ~95 |
| 17:24 | Edited shared/src/index.ts | 2→3 lines | ~23 |
| 17:24 | Edited shared/src/session.test.ts | added 1 import(s) | ~82 |
| 17:25 | Edited shared/src/session.test.ts | added optional chaining | ~800 |
| 17:25 | Edited shared/src/protocol.test.ts | expanded (+12 lines) | ~218 |
| 17:25 | Edited shared/src/protocol.test.ts | 6→10 lines | ~175 |
| 17:26 | Edited shared/src/session.test.ts | toBeNull() → Error() | ~102 |
| 17:26 | Edited client/src/input.ts | 2→3 lines | ~42 |
| 17:26 | Edited client/src/input.ts | added optional chaining | ~91 |
| 17:26 | Edited client/src/input.ts | 4→9 lines | ~95 |
| 17:26 | Edited client/src/chunks.ts | added 6 condition(s) | ~295 |
| 17:26 | Edited client/index.html | expanded (+30 lines) | ~222 |
| 17:26 | Edited client/index.html | 2→5 lines | ~61 |
| 17:27 | Edited client/src/main.ts | 24→28 lines | ~222 |
| 17:27 | Edited client/src/main.ts | added optional chaining | ~150 |
| 17:27 | Edited client/src/main.ts | added 4 condition(s) | ~555 |
| 17:27 | Edited client/src/main.ts | added 1 condition(s) | ~231 |
| 17:30 | checkpoint 3: raycast DDA em /shared, place/break+block_changed no protocolo, validação completa na session (bounds/reach/AABB), highlight+crosshair+hotbar no cliente, remeshBlock com vizinhos | shared/src/{raycast,raycast.test,protocol,protocol.test,session,session.test,constants,blocks,index}.ts client/src/{main,input,chunks}.ts client/index.html | 42 testes, typecheck 3/3, build ok, screenshot com crosshair+hotbar | ~30k |
| 17:31 | Session end: 37 writes across 17 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 15 reads | ~19578 tok |
| 17:36 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/a33579f2-d151-4a57-9677-89e57efca3e1/scratchpad/repro-border.ts | — | ~825 |
| 17:45 | playtest cp3: quebrar/colocar ok, remesh na borda ok; "não coloca na outra chunk" investigado = borda do MUNDO (by design, bug-004); repro script confirma place interno entre chunks funciona | .wolf/buglog.json | não-bug documentado; polish futuro: feedback de rejeição | ~8k |
| 17:37 | Session end: 38 writes across 18 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 15 reads | ~20403 tok |
| 17:40 | Created shared/src/rules.ts | — | ~481 |
| 17:40 | Edited shared/src/session.ts | added 1 import(s) | ~36 |
| 17:41 | Edited shared/src/session.ts | 5→9 lines | ~122 |
| 17:41 | Edited shared/src/session.ts | added 1 condition(s) | ~336 |
| 17:41 | Edited shared/src/session.ts | added 4 condition(s) | ~337 |
| 17:41 | Edited shared/src/index.ts | 1→2 lines | ~15 |
| 17:41 | Created shared/src/rules.test.ts | — | ~392 |
| 17:41 | Edited shared/src/session.test.ts | added optional chaining | ~909 |
| 17:42 | Edited shared/src/session.test.ts | 3→3 lines | ~28 |
| 17:42 | Edited client/src/main.ts | 2→2 lines | ~15 |
| 17:43 | checkpoint 4: rules.ts (sistema genérico de vizinhança + sandRule), fila dirty/changedThisTick na session, tick drena e aplica; cliente ZERO mudanças (só rótulo HUD) | shared/src/{rules,rules.test,session,session.test,index}.ts client/src/main.ts | 48 testes, typecheck 3/3, build ok | ~20k |
| 17:43 | Session end: 48 writes across 20 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 15 reads | ~23074 tok |
| 17:50 | playtest cp4 aprovado ("tudo certo"); sessão encerrada | — | STATUS.md pronto pra próxima sessão: começar no checkpoint 5 (Node+ws) | ~2k |

## Resumo da sessão 2026-07-11 (tarde)
Push inicial pro GitHub + checkpoints 2, 3 e 4 completos e playtestados no mesmo dia:
- CP2: GameSession autoritativa em /shared + host Web Worker + protocolo (JSON defensivo + snapshot binário LJW0) + Connection no cliente. 33 testes.
- CP3: raycast DDA puro, place/break validados no servidor (bounds/reach/AABB), block_changed genérico, crosshair/highlight/hotbar. 42 testes. bug-004 investigado = borda do mundo, by design.
- CP4: rules.ts — sistema genérico de vizinhança (REGRA DE OURO); areia = 1 regra; fila dirty + changedThisTick; cliente zero mudanças. 48 testes.
Próxima sessão: checkpoint 5 (segundo cliente via Node+ws) — detalhes no STATUS.md.
