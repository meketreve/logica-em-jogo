# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-07-11T14:37:40.506Z
> Files: 15 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitattributes` — LF em tudo (projeto vive no WSL/ext4; evita ruído CRLF de ferramentas Windows) (~31 tok)

## .claude/


## .claude/rules/


## client/

- `index.html` — Lógica em Jogo (~527 tok)

## client/src/

- `atlasTexture.ts` — Texture atlas procedural pintado num canvas (sem assets externos — restrição (~804 tok)
- `chunks.ts` — 1 mesh por chunk (BufferGeometry única, culled mesher do /shared). (~527 tok)
- `hud.ts` — HUD de perfilação (F3): FPS, frametime méd+p95, remesh, draw calls e (~1076 tok)
- `input.ts` — Teclado + mouse (pointer lock). SÓ coleta input — nenhuma decisão de (~708 tok)
- `main.ts` — Checkpoint 1: mundo estático + andar (WASD + pointer lock) + HUD F3. (~1021 tok)

## server/


## server/src/


## shared/


## shared/src/

- `index.ts` (~46 tok)
- `mesher.test.ts` — Declares DIMS (~561 tok)
- `mesher.ts` — Culled mesher: função PURA (bytes do mundo → geometria). Só emite faces que (~1443 tok)
- `physics.test.ts` — Mundo 1 chunk com chão sólido em y ∈ [0,7]. (~856 tok)
- `physics.ts` — Física do jogador (andar, gravidade, colisão AABB com o grid de voxels). (~1079 tok)
- `world.test.ts` — Declares DIMS (~761 tok)
- `world.ts` — Dimensões do mundo em chunks. Parâmetro de criação, gravado no header do save/snapshot. (~848 tok)
- `worldgen.ts` — Geração de terreno determinística (mesma seed = mesmos bytes em qualquer (~575 tok)
