# Mapa do projeto

## Comandos

| Ação | Comando |
|---|---|
| Build | `npm run build` (gera `build-info.json` + `client/dist`) |
| Teste (tudo) | `npm test` (vitest no `/shared`) |
| Teste (um só) | `npx vitest run --root shared src/<arquivo>.test.ts` |
| Typecheck | `npm run typecheck` (tsc nos 3 workspaces) |
| **Portão antes de commitar** | `npm run verify` (typecheck + testes + build + portão do dist) |
| Rede de verdade | `npm run smoke` (`--lista` diz o que cada cenário prova) |
| Rodar (cliente) | `npm run dev` → http://localhost:5173 |
| Rodar (servidor) | `npm run dev:server` |

### Sondas visuais (`shots:*`)

Sobem um host de verdade + Chrome de verdade e **asseveram no DOM** — não são só print.
**Rode `npm run build` antes**: elas servem o cliente COMPILADO. Mudança de UI só é "feita"
quando uma sonda a ENXERGA.

| Sonda | O que prova |
|---|---|
| `npm run shots:tablet` | UI em 1024×600 com `pointer:coarse` — a RÉGUA (`1280 800` e `COARSE=0 … 1920 1080` também valem) |
| `npm run shots:luz` | §💡 o MESMO bench ao meio-dia e à meia-noite (precisa do `npm run dev` em outro terminal) |
| `npm run shots:loja` | preços (inclusive de ITEM), rolagem, baú e fornalha |
| `npm run shots:quebra` | §🔨/§🪓 rachadura cresce, soltar cancela, barra de vida encolhe, machado e pá |
| `npm run bench:headless` | roda o `?bench` num Chrome headless e imprime o perfil |

No `shots:tablet` cada linha é uma medição: "cabe/ESTOURA" compara `getBoundingClientRect` com a
altura da janela, "menor alvo" tem piso de 40px, "chat × hotbar" mede a intersecção. Numa rodada
`COARSE=0` as linhas ✗ de joystick e alvo de dedo são ESPERADAS.

### Modo benchmark (o que mandar pro PC do lab)

```
http://<host>:8080/?bench            # 30 s, mundo E (streaming), seed 20260726
http://<host>:8080/?bench=60         # trajeto mais longo
http://<host>:8080/?bench&tamanho=P  # mundo denso: mede só render
http://<host>:8080/?bench&semvida    # lado B do A/B do §🌬️ (nuvens+balanço OFF)
```

A/B do §🌬️: `?bench` e depois `?bench&semvida` na MESMA máquina. O perfil se etiqueta sozinho e
o arquivo nasce `perf-bench-semvida-*.json` no lado B. Comparar com a régua do lab
(`…-l9xf.json`).

## Onde fica cada coisa

**Não existe índice de arquivos, e é decisão** (Decision Log 2026-09-22): o `anatomy.md` dava
mais manutenção do que economizava — desatualizava a cada arquivo criado. **Achar código é com
`grep`/`glob`**, que nunca mente. O que está aqui é só o que o nome da pasta não conta:

- `shared/` — a lógica de jogo, servidor autoritativo. Roda igual nos 3 hospedeiros.
  - `shared/src/session/` — o que tem estado (sessão, quebra, loja, presença, inventário).
  - o resto de `shared/src/` é PURO: sem I/O, sem rede, testável sozinho
    (`inventario.ts`, `drops.ts`, `receitas.ts`, `ferramentas.ts`, `fornalha.ts`, `blocks.ts`).
- `client/` — só renderiza e manda input. **`client/dist` é VERSIONADO** (a escola roda o dist).
- `server/` — o hospedeiro Node; `server/src/cenarios/` são os smokes de rede.
- `scripts/` — as sondas (`*-shot.mjs`), o gerador de build-info e os portões.
- `docs/projeto.txt` — a proposta pedagógica completa (BNCC, indicadores na seção 14).
- `registros/` — prints e perfis de playtest real.

## Pontos de entrada e fluxos principais

- **Padrão central:** UM módulo de lógica (servidor autoritativo) roda em 3 hospedeiros SEM
  reescrita: (a) Web Worker no singleplayer, (b) .exe portátil que serve HTTP+WebSocket,
  (c) servidor Node dedicado. Transporte WebSocket, mensagens iguais nos três.
- **Restrição dura do navegador:** aba não abre socket de escuta nem executa binário — por isso
  "abrir pra LAN" é papel do HOST (professor), não do aluno. WebAssembly não contorna.
- **Save:** mundo no PC do host, persiste entre aulas.
- **Bloco com inventário** (`shared/src/containers.ts`): conteúdo por POSIÇÃO, num mapa da
  `GameSession` + no meta do save — foi o primeiro estado que não coube no byte do chunk. O
  `use_block` é quem ABRE, e é a resposta do servidor que abre o painel, porque quem decide se o
  aluno pode LER aquele baú é o gate de claim.
