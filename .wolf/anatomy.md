# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-07-12T01:18:20.866Z
> Files: 35 tracked | Anatomy hits: 0 | Misses: 0

## ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/a0d99221-e98e-49ca-885e-fb3fd914cb11/scratchpad/

- `chat-smoke.mts` — Smoke do checkpoint 6: chat + /bloco contra o servidor Node+ws REAL. (~1235 tok)

## ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/a33579f2-d151-4a57-9677-89e57efca3e1/scratchpad/

- `repro-border.ts` — Repro: colocar bloco cruzando borda interna de chunk (x=16, entre chunk 0 e 1). (~825 tok)

## ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/f3234578-5a68-4273-9e45-1b7d17f2b3db/scratchpad/

- `ws-smoke.mts` — Smoke do checkpoint 5: dois clientes ws no servidor Node real. (~1166 tok)
- `ws-smoke.ts` — Smoke do checkpoint 5: dois clientes ws no servidor Node real. (~1146 tok)

## ./

- `.gitattributes` — LF em tudo (projeto vive no WSL/ext4; evita ruído CRLF de ferramentas Windows) (~31 tok)

## .claude/


## .claude/rules/


## client/

- `index.html` — Lógica em Jogo (~1195 tok)

## client/src/

- `atlasTexture.ts` — Texture atlas procedural pintado num canvas (sem assets externos — restrição (~1742 tok)
- `chat.ts` — UI de chat em HTML/CSS por cima do canvas (regra: sem GUI de engine). (~644 tok)
- `chunks.ts` — 1 mesh por chunk (BufferGeometry única, culled mesher do /shared). (~786 tok)
- `connection.ts` — Conexão do cliente com O SERVIDOR — interface única, hospedeiro invisível. (~846 tok)
- `events.ts` — Gatilhos de som (checkpoint 6): pontos de evento do jogo onde o áudio vai (~172 tok)
- `hud.ts` — HUD de perfilação (F3): FPS, frametime méd+p95, remesh, draw calls e (~1099 tok)
- `input.ts` — Teclado + mouse (pointer lock). SÓ coleta input — nenhuma decisão de (~1069 tok)
- `main.ts` — Checkpoint 6: chat + 1 comando (/bloco, parser no SERVIDOR — fecha o MVP v0). (~3532 tok)

## server/

- `tsconfig.json` — TypeScript configuration (~43 tok)

## server/src/

- `index.ts` — Hospedeiro Node+ws do servidor (LAN, checkpoint 5): embrulha a MESMA (~504 tok)
- `worker.ts` — Hospedeiro Web Worker do servidor (singleplayer): embrulha a GameSession (~252 tok)

## shared/


## shared/src/

- `blocks.ts` — IDs de bloco. Gravados como bytes crus nos chunks (Uint8Array), no save e no (~388 tok)
- `constants.ts` — Aresta do chunk em blocos (16³ = 4096 bytes, 1 byte por bloco). (~252 tok)
- `index.ts` (~77 tok)
- `mesher.test.ts` — Declares DIMS (~673 tok)
- `mesher.ts` — Culled mesher: função PURA (bytes do mundo → geometria). Só emite faces que (~1695 tok)
- `physics.test.ts` — Mundo 1 chunk com chão sólido em y ∈ [0,7]. (~856 tok)
- `physics.ts` — Física do jogador (andar, gravidade, colisão AABB com o grid de voxels). (~1079 tok)
- `protocol.test.ts` — Declares DIMS (~1781 tok)
- `protocol.ts` — Protocolo v0 (checkpoint 2). Mensagens JSON dos dois lados + world_snapshot (~2420 tok)
- `raycast.test.ts` — Mundo 16³ com chão sólido em y ∈ [0,7]. (~604 tok)
- `raycast.ts` — Raycast de voxel (DDA de Amanatides-Woo): anda célula a célula do grid até (~649 tok)
- `rules.test.ts` — Declares DIMS (~504 tok)
- `rules.ts` — Sistema GENÉRICO de atualização de bloco por vizinhança — a REGRA DE OURO (~526 tok)
- `session.test.ts` — DIMS: collect (~5075 tok)
- `session.ts` — GameSession: o SERVIDOR autoritativo, independente de hospedeiro. (~3216 tok)
- `world.test.ts` — Declares DIMS (~761 tok)
- `world.ts` — Dimensões do mundo em chunks. Parâmetro de criação, gravado no header do save/snapshot. (~848 tok)
- `worldgen.ts` — Geração de terreno determinística (mesma seed = mesmos bytes em qualquer (~575 tok)
