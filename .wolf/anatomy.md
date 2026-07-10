# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-07-10T19:41:31.298Z
> Files: 21 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~17 tok)
- `CLAUDE.md` — OpenWolf (~57 tok)
- `package.json` — Node.js package manifest (~120 tok)
- `tsconfig.base.json` (~121 tok)

## .claude/

- `settings.json` (~441 tok)
- `settings.local.json` (~89 tok)

## .claude/rules/

- `openwolf.md` (~364 tok)

## client/

- `index.html` — Lógica em Jogo (~120 tok)
- `package.json` — Node.js package manifest (~72 tok)
- `tsconfig.json` — TypeScript configuration (~39 tok)
- `vite.config.ts` (~30 tok)

## client/src/

- `main.ts` — Cena mínima: prova o pipeline Vite + three.js + import de /shared. (~370 tok)

## server/

- `package.json` — Node.js package manifest (~70 tok)
- `tsconfig.json` — TypeScript configuration (~33 tok)

## server/src/

- `index.ts` — Servidor LAN (hospedeiro Node+ws). Placeholder até o checkpoint 5 — (~173 tok)

## shared/

- `package.json` — Node.js package manifest (~56 tok)
- `tsconfig.json` — TypeScript configuration (~18 tok)

## shared/src/

- `blocks.test.ts` (~165 tok)
- `blocks.ts` — IDs de bloco. Gravados como bytes crus nos chunks (Uint8Array), no save e no (~93 tok)
- `constants.ts` — Aresta do chunk em blocos (16³ = 4096 bytes, 1 byte por bloco). (~156 tok)
- `index.ts` (~16 tok)
