# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-07-11T20:12:44.382Z
> Files: 22 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitattributes` — LF em tudo (projeto vive no WSL/ext4; evita ruído CRLF de ferramentas Windows) (~31 tok)

## .claude/


## .claude/rules/


## client/

- `index.html` — Lógica em Jogo (~527 tok)

## client/src/

- `atlasTexture.ts` — Texture atlas procedural pintado num canvas (sem assets externos — restrição (~804 tok)
- `chunks.ts` — 1 mesh por chunk (BufferGeometry única, culled mesher do /shared). (~527 tok)
- `connection.ts` — Conexão do cliente com O SERVIDOR — interface única, hospedeiro invisível. (~385 tok)
- `hud.ts` — HUD de perfilação (F3): FPS, frametime méd+p95, remesh, draw calls e (~1099 tok)
- `input.ts` — Teclado + mouse (pointer lock). SÓ coleta input — nenhuma decisão de (~708 tok)
- `main.ts` — Checkpoint 2: o mundo VEM DO SERVIDOR (GameSession de /shared rodando num (~1520 tok)

## server/

- `tsconfig.json` — TypeScript configuration (~43 tok)

## server/src/

- `worker.ts` — Hospedeiro Web Worker do servidor (singleplayer): embrulha a GameSession (~252 tok)

## shared/


## shared/src/

- `index.ts` (~62 tok)
- `mesher.test.ts` — Declares DIMS (~561 tok)
- `mesher.ts` — Culled mesher: função PURA (bytes do mundo → geometria). Só emite faces que (~1443 tok)
- `physics.test.ts` — Mundo 1 chunk com chão sólido em y ∈ [0,7]. (~856 tok)
- `physics.ts` — Física do jogador (andar, gravidade, colisão AABB com o grid de voxels). (~1079 tok)
- `protocol.test.ts` — Declares DIMS (~935 tok)
- `protocol.ts` — Protocolo v0 (checkpoint 2). Mensagens JSON dos dois lados + world_snapshot (~1386 tok)
- `session.test.ts` — DIMS: collect (~900 tok)
- `session.ts` — GameSession: o SERVIDOR autoritativo, independente de hospedeiro. (~919 tok)
- `world.test.ts` — Declares DIMS (~761 tok)
- `world.ts` — Dimensões do mundo em chunks. Parâmetro de criação, gravado no header do save/snapshot. (~848 tok)
- `worldgen.ts` — Geração de terreno determinística (mesma seed = mesmos bytes em qualquer (~575 tok)
