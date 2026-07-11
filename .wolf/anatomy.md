# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-07-11T20:27:35.367Z
> Files: 26 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitattributes` — LF em tudo (projeto vive no WSL/ext4; evita ruído CRLF de ferramentas Windows) (~31 tok)

## .claude/


## .claude/rules/


## client/

- `index.html` — Lógica em Jogo (~755 tok)

## client/src/

- `atlasTexture.ts` — Texture atlas procedural pintado num canvas (sem assets externos — restrição (~804 tok)
- `chunks.ts` — 1 mesh por chunk (BufferGeometry única, culled mesher do /shared). (~786 tok)
- `connection.ts` — Conexão do cliente com O SERVIDOR — interface única, hospedeiro invisível. (~385 tok)
- `hud.ts` — HUD de perfilação (F3): FPS, frametime méd+p95, remesh, draw calls e (~1099 tok)
- `input.ts` — Teclado + mouse (pointer lock). SÓ coleta input — nenhuma decisão de (~844 tok)
- `main.ts` — Checkpoint 3: colocar e quebrar bloco. Raycast local SÓ pra mirar (visual); (~2280 tok)

## server/

- `tsconfig.json` — TypeScript configuration (~43 tok)

## server/src/

- `worker.ts` — Hospedeiro Web Worker do servidor (singleplayer): embrulha a GameSession (~252 tok)

## shared/


## shared/src/

- `blocks.ts` — IDs de bloco. Gravados como bytes crus nos chunks (Uint8Array), no save e no (~156 tok)
- `constants.ts` — Aresta do chunk em blocos (16³ = 4096 bytes, 1 byte por bloco). (~189 tok)
- `index.ts` (~70 tok)
- `mesher.test.ts` — Declares DIMS (~561 tok)
- `mesher.ts` — Culled mesher: função PURA (bytes do mundo → geometria). Só emite faces que (~1443 tok)
- `physics.test.ts` — Mundo 1 chunk com chão sólido em y ∈ [0,7]. (~856 tok)
- `physics.ts` — Física do jogador (andar, gravidade, colisão AABB com o grid de voxels). (~1079 tok)
- `protocol.test.ts` — Declares DIMS (~1212 tok)
- `protocol.ts` — Protocolo v0 (checkpoint 2). Mensagens JSON dos dois lados + world_snapshot (~1816 tok)
- `raycast.test.ts` — Mundo 16³ com chão sólido em y ∈ [0,7]. (~604 tok)
- `raycast.ts` — Raycast de voxel (DDA de Amanatides-Woo): anda célula a célula do grid até (~649 tok)
- `session.test.ts` — DIMS: collect (~1708 tok)
- `session.ts` — GameSession: o SERVIDOR autoritativo, independente de hospedeiro. (~1625 tok)
- `world.test.ts` — Declares DIMS (~761 tok)
- `world.ts` — Dimensões do mundo em chunks. Parâmetro de criação, gravado no header do save/snapshot. (~848 tok)
- `worldgen.ts` — Geração de terreno determinística (mesma seed = mesmos bytes em qualquer (~575 tok)
