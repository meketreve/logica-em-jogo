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
