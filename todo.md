# Ideias para fazer

## Móveis / blocos

* \[x] tapete — **FEITO** (2026-07-19): 12 cores (ids 71-82), lâmina 1/16 atravessável, regra de apoio da tocha.
* \[x] parte da janela que abre e fecha — **FEITO** (2026-07-19): ids 83-86, 1 célula, clique direito abre/fecha (dobradiça da porta). Pivô escolhido pelo vizinho em 2026-07-20 (ids R 112-115).
* \[x] cama — **FEITO** (2026-07-19 móvel direcional; 2026-07-20 virou PAR de 2 células estilo Minecraft, orientada pelo yaw, ids 96-99, metade órfã evapora).
* \[x] sofá — **FEITO** (2026-07-19): móvel direcional em 4 direções (rotXZ k×90°, frente encara o jogador ao colocar), faixa de ids 87-99.
* \[x] cadeira — **FEITO** (2026-07-19): móvel direcional, entrada única na hotbar.
* \[x] mesa — **FEITO** (2026-07-19): móvel, faixa 87-99.
* \[x] quadro (com interface para digitar textos e adicionar imagens) — **FEITO** (2026-07-19): ids 100-103; `shared/quadros.ts` + `client/quadros.ts`, editor overlay, imagem JPEG 192px comprimida local (teto 32k chars), persiste no meta.
* \[x] flores — **FEITO** (2026-07-19 ids 104-107, 4 cores atravessáveis com regra de apoio da tocha; 2026-07-20 sessão 8 refez render com `emitCrossPlane` = 2 lâminas planas na diagonal, estilo Minecraft cross, fim do z-fight/sprite esticado).
* \[ ] vidro colorido

## Comandos / jogador

* \[x] comando para kicar aluno por mau comportamento — **JÁ EXISTE** (`/kicar`, cp22)
* \[x] arrumar sistema de dia e noite — **FEITO** (2026-07-19): sol/lua/estrelas visíveis (grupo segue câmera), keyframes com smoothstep, dia 10→20min (`DIA_SEGUNDOS=1200`), `/hora` liberado pro aluno. Corrigiu bug-301 (TDZ) e bug-302 (céu travado na meia-noite).
* \[x] voo do modo criativo do Minecraft — **FEITO** (2026-07-17: `/voo` do professor libera pra turma; duplo-toque no espaço)
* \[x] alterar a geração de terreno dos mundos para adicionar bedrock na camada 0 — **FEITO** (2026-07-17)
* \[x] auto completar nomes dos jogadores — **FEITO** (2026-07-19): Tab completa nomes via `learnPlayers` (commands.ts, alimentado por player_moved/left) em /tp /tpr /tpa /kicar /resetpin /amigos /claim.
* \[x] corrigir o nome do jogador para não aceitar nomes com espaços — **FEITO** (2026-07-19): `sanitizeName` (shared/auth.ts) filtra pra letra/número/acento/_/- e corta em 24; servidor sanitiza no join, menu migra nome antigo, input com pattern.
* \[x] corrigir a animação da porta — girava no próprio eixo — **FEITO** (2026-07-19: painel na aresta do canto = dobradiça, abre pivotando 90° na ponta)
* \[x] interceptar atalhos do navegador quando o mouse estiver capturado (pra evitar de fechar a aba se apertar Ctrl+W ao correr) — **FEITO** (2026-07-19): `client/shortcutGuard.ts`, guarda de 3 camadas — beforeunload + preventDefault nos combos + Keyboard Lock API (Chrome, só em tela cheia F11). Janela comum só mostra diálogo (limite do navegador → tela cheia = proteção total).
* \[x] porta: escolher o lado do PIVÔ (dobradiça) pelo lado que TEM bloco; 2 portas lado a lado =
pivôs OPOSTOS (abrem pro meio, double door) — **FEITO** (2026-07-20): 4 ids R (108-111,
dobradiça alta) espelham as base; o SERVIDOR escolhe a dobradiça no place\_block pelos
vizinhos (porta do mesmo eixo → oposta; senão parede/cubo cheio → lado da parede; empate →
base). Só o mesher muda a folha ABERTA de lado; física/cliente não mudam (tudo em /shared).
* \[x] janela: escolher o lado do PIVÔ igual à porta — **FEITO** (2026-07-20): 4 ids R
(112-115); reusa o MESMO `escolherDobradica` do servidor (agora genérico, parametrizado
por altura=1 e pelos helpers da janela). Mesma regra: janela vizinha do mesmo eixo → oposta;
senão lado com parede; empate → base. Cliente inalterado.

## Mundo / professor

* \[x] rocha-matriz só para professor (inventário/copiar/colocar) — **FEITO** (2026-07-17)
* \[x] mundos com nome "aula" não salvam alterações, reutilizáveis sem mover arquivos — **FEITO** (2026-07-17)

## Sistema anti-griefing (claim de blocos)

* \[x] sistema anti-griefing: claim de blocos + alunos criam grupos de amigos para deixar só certos alunos alterarem suas áreas — **FEITO** (cp24, 2026-07-17; PLAYTEST DO USUÁRIO PENDENTE). `shared/claims.ts` (Claim/GrupoAmigos, MAX_CLAIM_XZ=32, MAX_AMIGOS=6). Claim = COLUNA de altura total (camada 0 → teto), decidido 2026-07-20: aluno marca só a pegada XZ; servidor força min.y=0/max.y=sizeY-1 → ninguém faz ilha flutuante por cima nem escava por baixo. Saves antigos sobem pra coluna cheia no restore. Gate `claimBloqueia` em place/break/use_block; `/claim ligar|desligar|criar|remover|lista` e `/amigos convidar|aceitar|recusar|sair|expulsar|lista`; msgs `claims`+`friends`; persiste no meta do save de mundo livre (some em mundo-aula read-only). Cliente: wireframes laranja + varinha do aluno.

  Decisões (todas travadas 2026-07-17):

  * claim por REGIÃO (varinha, reusa `regions.ts`) — SIM, região por varinha (esq=canto1, dir=canto2).
  * quem cria o claim: ALUNO sozinho (varinha liberada pro aluno quando a proteção está ligada).
  * grupos de AMIGOS = sistema À PARTE (convite+aceite), NÃO os grupos pedagógicos do cp13.
  * professor IGNORA todo claim (sempre edita).
  * persiste no `.ljw` (meta do mundo livre); em mundo-aula read-only o claim some — sem conflito.
* \[x] bloquear que alunos coloquem blocos fora das áreas de cada grupo nos mundos de aula/atividades — **FEITO** (2026-07-17, cp25 confinamento: `/confinar ligar|desligar` + auto em mundo-aula; aluno só coloca/quebra na área do seu grupo (cp13); sem grupo = travado; professor livre. Playtest do usuário PENDENTE)

## Visual / player

* \[ ] animação de sentar na cadeira e deitar na cama (pra passar a noite)
* \[ ] trocar modelo do player pra estilo Minecraft
* \[ ] trocar sol pra ser quadrado, estilo Minecraft (kkk)

## Ferramentas de dev

* \[x] profiler complexo pra diagnóstico, com opção do cliente enviar o resultado pro servidor
(salva na pasta do servidor — facilita rodar o profile em vários dispositivos e centralizar as medidas)
— **FEITO** (2026-07-20): botão "enviar pro servidor" no HUD F3, ao lado do "exportar JSON"; msg
`profile\_report` nova no protocolo, tratada no HOST (como /mundo, /kicar — grava arquivo, a
GameSession não tem filesystem); salva em `profiles/perf-<nome>-<timestamp>.json` (gitignored).
Singleplayer (Web Worker) não tem fs — mensagem cai no vácuo em silêncio, sem erro no cliente.
Playtest do usuário PENDENTE.
* \[x] salvar o log do chat em arquivo (no servidor) — **FEITO** (2026-07-20): `registrarChat`
no host (index.ts) engancha no `entregar` (ponto único server→cliente), deduplica o
fan-out do broadcast e grava `mundos/<nome>/chat.log` (append, `\[ISO] autor: texto`).
Singleplayer (Web Worker) não tem fs — chat não vira arquivo lá, como planejado.

## Sistema de sobrevivência (feature grande)

* \[ ] fome
* \[ ] vida
* \[ ] ferramentas
* \[ ] craft
* \[ ] minérios

## Geração de mundo / performance

* \[ ] algoritmo de geração de terreno procedural pra mundos
* \[ ] consequente otimização de como os mundos são salvos e carregados
* \[x] salvar mundo em PASTAS (uma pasta por mundo) — **FEITO** (2026-07-20, HOST): cada
mundo mora em `mundos/<nome>/` com `<nome>.ljw` + `chat.log` (paths.ts: `pastaDoMundo`,
`savePathDoMundo`, `chatLogDoMundo`). Launcher migra layouts antigos e lista as pastas.
Singleplayer (IndexedDB, export .ljw único via worldStore.ts) NÃO mudou — o navegador
não tem filesystem; export de "pasta" no single fica de fora (não faz sentido lá).

