# Ideias para fazer

## Móveis / blocos

- [ ] tapete
- [ ] parte da janela que abre e fecha
- [ ] cama
- [ ] sofá
- [ ] cadeira
- [ ] mesa
- [ ] quadro (com interface para digitar textos e adicionar imagens)

## Comandos / jogador

- [x] comando para kicar aluno por mau comportamento — **JÁ EXISTE** (`/kicar`, cp22)
- [ ] arrumar sistema de dia e noite
- [x] voo do modo criativo do Minecraft — **FEITO** (2026-07-17: `/voo` do professor libera pra turma; duplo-toque no espaço)
- [x] alterar a geração de terreno dos mundos para adicionar bedrock na camada 0 — **FEITO** (2026-07-17)
- [ ] auto completar nomes dos jogadores
- [ ] corrigir o nome do jogador para não aceitar nomes com espaços
- [ ] corrigir a animação da porta — está girando no próprio eixo, precisa girar 90° usando uma das pontas como referência para o eixo de rotação
- [ ] interceptar atalhos do navegador quando o mouse estiver capturado (pra evitar de fechar a aba se apertar Ctrl+W ao correr)

## Mundo / professor

- [x] rocha-matriz só para professor (inventário/copiar/colocar) — **FEITO** (2026-07-17)
- [x] mundos com nome "aula" não salvam alterações, reutilizáveis sem mover arquivos — **FEITO** (2026-07-17)

## Sistema anti-griefing (claim de blocos)

- [ ] sistema anti-griefing (talvez): claim de blocos + alunos criam grupos de amigos para deixar só certos alunos alterarem suas áreas.

  Decisões pendentes:
  - claim por REGIÃO (varinha, reusa `regions.ts`) ou por bloco solto?
  - quem cria o claim: aluno sozinho ou só dentro de um grupo de amigos?
  - grupos de AMIGOS = os grupos do cp13 (pedagógicos) ou um sistema à parte?
  - professor ignora todo claim (sempre pode editar)?
  - persiste no `.ljw`? conflito com "mundos aula não salvam"?

- [x] bloquear que alunos coloquem blocos fora das áreas de cada grupo nos mundos de aula/atividades — **FEITO** (2026-07-17, cp25 confinamento: `/confinar ligar|desligar` + auto em mundo-aula; aluno só coloca/quebra na área do seu grupo (cp13); sem grupo = travado; professor livre. Playtest do usuário PENDENTE)

## Visual / player

- [ ] animação de sentar na cadeira e deitar na cama (pra passar a noite)
- [ ] trocar modelo do player pra estilo Minecraft
- [ ] trocar sol pra ser quadrado, estilo Minecraft (kkk)

## Ferramentas de dev

- [x] profiler complexo pra diagnóstico, com opção do cliente enviar o resultado pro servidor
  (salva na pasta do servidor — facilita rodar o profile em vários dispositivos e centralizar as medidas)
  — **FEITO** (2026-07-20): botão "enviar pro servidor" no HUD F3, ao lado do "exportar JSON"; msg
  `profile_report` nova no protocolo, tratada no HOST (como /mundo, /kicar — grava arquivo, a
  GameSession não tem filesystem); salva em `profiles/perf-<nome>-<timestamp>.json` (gitignored).
  Singleplayer (Web Worker) não tem fs — mensagem cai no vácuo em silêncio, sem erro no cliente.
  Playtest do usuário PENDENTE.

- [x] salvar o log do chat em arquivo (no servidor) — **FEITO** (2026-07-20): `registrarChat`
  no host (index.ts) engancha no `entregar` (ponto único server→cliente), deduplica o
  fan-out do broadcast e grava `mundos/<nome>/chat.log` (append, `[ISO] autor: texto`).
  Singleplayer (Web Worker) não tem fs — chat não vira arquivo lá, como planejado.

## Sistema de sobrevivência (feature grande)

- [ ] fome
- [ ] vida
- [ ] ferramentas
- [ ] craft
- [ ] minérios

## Geração de mundo / performance

- [ ] algoritmo de geração de terreno procedural pra mundos
- [ ] consequente otimização de como os mundos são salvos e carregados
- [x] salvar mundo em PASTAS (uma pasta por mundo) — **FEITO** (2026-07-20, HOST): cada
  mundo mora em `mundos/<nome>/` com `<nome>.ljw` + `chat.log` (paths.ts: `pastaDoMundo`,
  `savePathDoMundo`, `chatLogDoMundo`). Launcher migra layouts antigos e lista as pastas.
  Singleplayer (IndexedDB, export .ljw único via worldStore.ts) NÃO mudou — o navegador
  não tem filesystem; export de "pasta" no single fica de fora (não faz sentido lá).
