# Prints de pontos-chave — v0.8.0 (2026-07-23)

Capturas de marcos do jogo para apresentação/relatório. Render **headless**
(chrome + WebGL software), 1280×720. Não são todas as telas — só os pontos-chave
(decisão do usuário: capturar só alguns marcos).

| Arquivo | O que mostra |
|---|---|
| `01-menu.png` | Tela-título "Lógica em Jogo" (Jogar sozinho / em rede / Configurações) + badge de versão **v0.8.0** no canto. |
| `02-biomas.png` | Mundo procedural (seed 314): vale de **mata** (floresta densa), **ipê** dourado ao centro e **serra rochosa/nevada** à direita — vários biomas BR num só quadro. |
| `03-agua.png` | **Cascata de água fluida** transparente caindo do topo de um muro numa bacia de pedra (autômato celular + material transparente). |
| `04-aula.png` | **Aula 1 — sequência de cores**: painel de objetivos ("Fase 1… blocos corretos 4/12"), região-alvo (contorno verde) e o padrão de blocos no chão a continuar. |
| `05-construcao.png` | **Construção livre**: sala com parede, 2 **quadros** (texto na parede), **sofá**, **cama**, **mesa + cadeira**, **tapete** e **flores**. |
| `06-hud-f3.png` | **HUD F3 (perfilador)** completo — FPS, frametime, draw calls/triângulos, long tasks, RAM/vídeo, rede (msg/s, jitter, tick), bioma/seed — sobre a paisagem, com "exportar JSON" / "enviar pro servidor". |

## Caveats do render headless (não são bugs do jogo)
- **Emoji vira quadradinho** no `01-menu` (chrome headless sem fonte de emoji). Num PC/tablet real os ícones aparecem — se quiser o menu com emojis, capture manual.
- **FPS 8** no `06-hud-f3` = renderizador **software** (swiftshader) do headless, NÃO hardware. Na escola o mesmo mundo roda a **60–90 FPS** (medido, sessão 12). O print serve pra mostrar o painel, não o número.
- Multiplayer (2+ clientes) e mobile/touch não dão print headless bom — capture manual se for pro relatório.

## Como foram gerados
Scripts em scratchpad (não versionados): `capture.mjs` (chrome via CDP: navega, espera,
tecla F3, esconde o overlay de pausa, screenshot) e `build.mjs` (constrói cena via
websocket — place_block/balde/quadro_set — pra água e móveis). Servidor de teste sempre
com `LJ_SAVE` fora de `mundos/mundo-livre`. Receita completa no `.wolf/cerebrum.md`
(Key Learnings 2026-07-23).
