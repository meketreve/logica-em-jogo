# Cerebrum

> OpenWolf's learning memory. Curated knowledge only: User Preferences, timeless Key Learnings, Do-Not-Repeat.
> **Consolidado 2× — 2026-07-25 (27k→9k) e 2026-07-28 (20k→~10k).** A narrativa por sessão
> (motivação, antes/depois, números) vive em `.wolf/history.md` → `## Key Learnings arquivados
> (2026-07-25)` e `## Cerebrum arquivado (2026-07-28, sessão 32)`. Aqui fica só a REGRA
> acionável; o Decision Log completo também está no history.md (aqui vai só o índice).
> **Ao aprender algo novo, escrever a REGRA, não a história** — é isto que segura o orçamento.
> Last updated: 2026-08-06 (sessão 51)

## User Preferences

- **[2026-08-06] Quando levanta uma tecnologia nova, quer a ANÁLISE, não a migração** — e muda
  de ideia com argumento técnico. Apresentei os três eixos (janela nativa · Rust · SpacetimeDB)
  com custo e o que se PERDE, e ele descartou SpacetimeDB sozinho (*"o problema real é outro"*)
  e aceitou que janela própria estava fora. **O que ele queria de verdade era o sintoma:
  arquivos grandes demais.** Perguntar "que dor isso resolve" antes de orçar a tecnologia.
- **[2026-08-06, sessão 51] Quando a fila já está escrita e ordenada, ele DELEGA a escolha da
  rota** (*"aborda do melhor jeito que achar"*, depois de eu apresentar rota cara × rota barata
  com recomendação). Não é convite pra perguntar de novo: é pra executar a recomendada e contar
  o resultado. Perguntar ali seria devolver o trabalho que ele acabou de delegar.
- **[2026-08-06] Ele É a TI da escola** (*"o TI da escola é eu, posso testar o que eu quiser"*).
  A restrição de "aba de navegador não instala nada" continua valendo pro laboratório e pro
  Fire, mas NÃO é um veto de terceiro — é escolha dele.

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- **Manda BATERIA de pedidos num parágrafo só, misturando bug, regra de jogo e ideia de
  backlog** (2026-08-06: 11 itens numa frase). A separação é trabalho MEU: o que é bug vira
  fix + entrada no buglog, o que é regra vira código + teste, e o que ele mesmo marca como
  "ideias para o todo.md" vai pro TODO **sem ser implementado**. Implementar o que ele mandou
  anotar é escopo não pedido.
- **"Fica confuso ter 2 receitas separadas para a mesma coisa"** (2026-08-06) — a régua dele pra
  UI é a CRIANÇA ESCOLHENDO. Duas linhas com a mesma saída não são "informação", são uma
  escolha falsa. Quando uma decisão antiga foi tomada por limitação do motor ("`custo` não tem
  ou"), o pedido dele é pra mudar o MOTOR, não pra explicar a limitação.

- Dev é **100% vibecode**: ele orquestra, NÃO revisa código. A arquitetura carrega o peso
  sozinha (TS estrito, módulos pequenos, testes, checkpoints jogáveis).
- **Simplicidade > segurança quando não há dado sensível** (2026-07-12: mandou tirar o hash do
  PIN). Nada de cripto/ofuscação sem ameaça real; rate-limit basta.
- Fala português. Responde em blocos numerados às perguntas.
- **Exige POLIMENTO de sensação, não só "funciona"** (playtest 2026-07-25: reprovou o vidro
  dither e o step-up brusco). Ao entregar mecânica nova, já prever o acabamento visual/de
  câmera — ele testa JOGANDO, não lendo teste verde.
- **Mobile: régua é "os dois, Fire manda"** (1024×600 manda, tablet maior herda) e **celular
  foi RECUSADO** — não desenhar pra ~640×360 sem ele pedir.
- **Quando vai ficar AFK, pede as perguntas TODAS de uma vez** (2026-07-27): perguntar cedo,
  em lote, incluindo ATÉ ONDE ir sozinho (codar/testar/commitar/push).
- **Escolhe escopo GRANDE quando oferecido** (2026-07-27 e 2026-07-28: pegou "tudo 1 a 6" e
  depois "luz completa"). Oferecer o escopo cheio como opção real.
- **Aponta CONTRADIÇÃO de regra, não bug** (playtest 2026-07-27): aprovou o §🌬️ inteiro e
  reprovou UMA regra — o vento mandando na água que ESCORRE. A crítica dele vem como regra de
  mundo ("quem corre dita a própria direção"), não como defeito visual: ao propor animação
  ambiental, checar se há força mais LOCAL que deva ganhar da global.
- **Relata bug de orientação em forma de RECEITA** ("rotaciona 180 embaixo, 90 na sul…"), a
  partir de UM caso. A observação é boa; a receita nem sempre generaliza — conferir contra o
  modelo, mostrar a evidência e entregar a correção geral. Ele aceita bem furo apontado com
  número.
- Quer ser desafiado no design: aceita bem quando aponto furos pedagógicos/técnicos.
- **Convenções de Minecraft são o padrão esperado** (playtest 2026-07-13): em dúvida de UX de
  jogo, seguir o que o Minecraft faz — alunos e professor já têm esse modelo mental.
- **Uma tela = UM botão "voltar"** (playtest 2026-07-13): quem renderiza a tela é dono
  da navegação dela.
- **Feature grande / "talvez" → ENTREVISTA de escopo antes de codar** (2026-07-17), com
  AskUserQuestion objetivo. Pedido BEM DEFINIDO ele quer feito inline na hora. Costuma empilhar
  vários pedidos no mesmo turno — separar concreto de exploratório.
- **Painel HTML é sempre FASE 2**: comandos de chat primeiro (usáveis no playtest),
  painel numa rodada seguinte.
- **Ele PERFILA de verdade** (2026-07-26): joga no pior caso e manda o perfil pelo F3 (cai em
  `profiles/`). LER o perfil quando ele disser que perfilou — a resposta esperada é análise dos
  números, não "ok". Manter o F3 rico em contadores paga.
- **Backlog é para ANOTAR, não para fazer** (2026-07-26): "anota tudo isso no roadmap" =
  escrever com escopo e ORDEM por custo, e seguir a quest atual. Não implementar o que ele
  mandou anotar.
- **Ele decide a ordem das frentes** e costuma pedir "commita tudo, segue para X e Y, mas
  antes prepara para /clear" — ou seja: fechar handoff (STATUS/TODO/cerebrum) ANTES de
  encostar na próxima quest, e derrubar servidores de teste que ficaram no ar.
- **Ele trabalha em DUAS máquinas, e a de casa costuma estar na frente** (sessões 40 e 45: o
  local abriu 3 e depois 14 commits atrás). Sessão que começa com "onde paramos?" merece
  `git fetch` ANTES de responder — na 45 ele teve de mandar *"faz o fetch primeiro, tem coisa
  que não tá no repo local"* depois de eu responder pelo STATUS velho. O `.wolf/memory.md`
  sujo com cabeçalho de sessão VAZIO (hook) é descartável: `git checkout --` e `pull --ff-only`.
  ⚠️ **E o fetch tem de olhar os DOIS lados** (2026-08-05, sessão 47: o local estava 9 commits
  **À FRENTE** — a sessão 46 inteira nunca tinha sido empurrada). "Onde paramos?" quer saber
  também o que ainda não saiu daqui; **o `git push` entra na lista de opções da abertura.**
- **Ele pede o LOTE inteiro numa frase e espera a ordem certa** (2026-08-05: *"roda os prints,
  faz os refinos e depois o push, quando terminar faz o handoff e preparar para /clear"*). A
  ordem literal nem sempre é a melhor: prints ANTES e DEPOIS dos refinos custam uma rodada a
  mais e entregam o A/B visual de graça. Fazer as duas passadas e dizer por quê — ele não
  reclama de escopo maior quando a razão está escrita.
- **Playtest com turma REAL vira pedido de escopo, não de ajuste** (2026-08-04, 17 alunos:
  *"conseguiram fazer craft, plantar e comer"*). Ele não pediu número nenhum diferente — pediu
  o que FALTAVA (todas as receitas). Quando o playtest passa, a pergunta certa é "o que a turma
  não conseguiu alcançar?", não "que constante eu mexo?".

## Key Learnings

- [2026-08-17] **O `baseline` do objetivo NÃO é o estado de partida da CÉLULA — só da CAIXA da
  área.** `capturarBaseline` (`cenario.ts:285`) fotografa `o.alvos`, e os `extras` do cenário
  ficam FORA: a parede de manual da aula 6 é plantada em `o.x+3`/`o.x+4`, `o.y+1`
  (`gerar.ts:261-267`) numa área que tem `dx:3, dy:1`. Copiar área por área daria ao grupo novo a
  atividade **sem o enunciado**. Por isso a unidade de cópia da aula é o CHUNK inteiro
  (`caixaDaCelula`, `grade.ts`), não a região do objetivo.
- [2026-08-17] **`o.alvos`/`o.baseline` são CONGELADOS na criação do objetivo; `o.porGrupo` é
  DERIVADO no broadcast.** `resolveAlvos` (`cenario.ts:38`) resolve `<prefixo>-<g>` uma vez e
  guarda as caixas em `o.alvos[g-1]` (`cenario.ts:124`); `porGrupo` é remontado de `ses.grupos` a
  cada `broadcastObjectives` (`cenario.ts:478`). Consequência: criar a região `area-6` depois
  **não** estende o objetivo — é preciso empurrar em `alvos` E em `baseline` na mesma operação
  (e `porGrupo` se resolve sozinho).
- [2026-08-17] **Conteúdo de quadro mora FORA do id de bloco.** `ses.quadros`
  (`Map<quadroKey, QuadroConteudo>`, `session.ts:410`, PRIVADO) persiste no meta.
  `snapshotRegion` fotografa só ids, então qualquer cópia/limpeza de área tem de mexer no mapa
  junto (`moverQuadros`/`apagarQuadros`), senão o quadro chega em branco. E `quadro_set` exige
  **ALCANCE** (`session.ts:1149`): teste ou script que escreve quadro precisa aproximar o jogador
  antes, como o `Autoria.quadro` do gerador faz.
- [2026-08-17] **`/grupo criar X` é RESET, não ajuste** (`equipes.ts:586-587`: `grupos.clear()` +
  `completosGrupo.clear()`, "turma nova"). Ajustar a turma no meio da aula precisa de outro
  caminho — é o que `/aula grupos X` faz, preservando `1..min(N,X)`.
- [2026-08-17] **Os astros do céu (`client/src/daynight.ts`) são planos COPLANARES na mesma
  posição, com o mesmo `lookAt(camera)` — logo mudar a forma de um sem mudar a do outro sempre
  aparece.** `sunDisc` + `sunGlow` ficam ambos em `(sx,sy,sz)` e recebem `lookAt` idêntico:
  mesma quaternion, mesma orientação, concêntricos (não brigam no z-buffer porque os dois são
  `depthWrite:false`). Foi assim que o halo redondo em volta do sol quadrado ficou visível
  (bug-624). **A conta que decide o tamanho:** com o sol `PlaneGeometry(L,L)` (meio-lado L/2), um
  halo CIRCULAR de raio r dá borda `r - L/2` nos eixos e só `r - (L/2)·√2` nas quinas; um halo
  QUADRADO de lado `L + 2·e` dá borda `e` na volta inteira. Sol 56 + anel 24 = **104**.
  ⚠️ A **lua** (`CircleGeometry(20,24)`) segue redonda de propósito — o pedido do usuário era o
  par sol+halo, e ela é outro astro.
- [2026-08-17] **Dá pra provar mudança visual do CÉU sem escrever script de shot novo: reusar o
  `?foto`.** `window.__fotoApontar(yaw, pitch)` aponta a câmera; a direção do sol sai do próprio
  `daynight.ts` (`ang = ((h-6)/12)·π`, `dir = (cos ang, sin ang, 0.35)` normalizada) e a câmera
  FPS (rotation YXZ) tem `forward = (-sin y·cos p, sin p, -cos y·cos p)` → `pitch = asin(uy)`,
  `yaw = atan2(-ux, -uz)`. ⚠️ **A hora do mundo NÃO é legível da página** (não há hook), então a
  sonda varre `h = 7..17` e uma das prints pega o sol; com `HORA_PADRAO = 12` a de h=12 acerta.
  Sonda em `scratchpad/sol-shot.mjs`, moldada no `scripts/fundo-shots.mjs`.
- [2026-08-15] **Orientar as 6 faces do cubo do menu (`menuFundo.ts`) é UV do `BoxGeometry`
  contra o que a câmera FPS enquadra — dá pra derivar, não precisa chutar.** O
  `BoxGeometry.buildPlane` fixa, por face, qual eixo do mundo cresce com `u` e com `v`; a foto
  fixa o que fica à direita e no topo da imagem (com `flipY` padrão, topo da imagem = `v=1`).
  Onde os dois discordam, entra espelho. Resultado medido: as **4 laterais** precisam de
  espelho em X (ex.: face `-z` quer `u+ → -x`, a foto olhando `-z` põe `+x` à direita) e o
  **teto/chão** precisam de espelho em Y (face `+y` quer `v+ → -z`, a foto olhando pra cima com
  yaw=0 põe `+z` no topo; `-y` é o simétrico). Espelho = `repeat=-1` **com `offset=1`** e wrap
  ClampToEdge: com `RepeatWrapping` o texel da borda interpola com o da borda OPOSTA e desenha
  uma linha de 1 px bem na quina. E a câmera do menu tem que GIRAR no centro exato
  (`rotation.y`), não orbitar: a projeção do cubemap só fecha do centro.
- [2026-08-12] **Cenário de aula: o número de grupos é congelado na GERAÇÃO, mas o carimbo é uma
  ferramenta AO VIVO.** `npm run cenarios -- --grupos 5` (padrão 5, teto 8) decide quantas áreas o
  `.ljw` traz, e `dims.x` cresce com esse número (`gerar.ts:304`) — um chunk por grupo, todos na
  mesma fileira de Z (`gerar.ts:350-351`). Mas `/regiao carimbar modelo prefixo espacamento [z]`
  (`shared/src/session/regioes.ts:138`) lê **`ses.grupos.size` na hora**, copia com blocos inclusos
  e valida `inBounds` de todas as cópias antes de tocar em bloco nenhum. Quem for mexer em "mais/
  menos grupos durante a aula" começa daí, não do zero.
  ⚠️ **A armadilha: a região `modelo` está VAZIA nos cenários prontos.** Ela guarda o **gabarito**,
  é fotografada pelo objetivo e depois apagada (`/regiao encher modelo 0`, `gerar.ts:370`, salvo
  com `--revelar`). **Partida ≠ gabarito** (aula 3 nasce com 2 erros, aula 2 nasce vazia), então
  carimbar do `modelo` ao vivo estampa **AR**. Fonte tem de ser área de grupo intocada ou uma
  região `partida` que o gerador passe a gravar.

- [2026-08-11] **O `cmd.exe` lê arquivo `.bat` por DESLOCAMENTO DE BYTE — então `.bat` deste
  projeto é ASCII PURO, sem acento e sem emoji.** Um `⚠️` (6 bytes) num comentário `REM` do
  `iniciar-servidor.bat` fez a rodada inteira virar dezenas de *"'d' nao e reconhecido como um
  comando interno"* na escola (bug-621). Com o `chcp 65001` da linha 7 o número de bytes diverge
  do de caracteres e, **sem `\r` para reancorar**, o parser retoma no MEIO da linha seguinte e
  executa pedaços de comentário como comandos. A/B no `cmd.exe` de verdade, mesmo cabeçalho:
  **LF+emoji QUEBRA** · LF+ASCII ok · CRLF+emoji ok · CRLF+ASCII ok. O arquivo já seguia essa
  regra sozinho ("atualizacao", "voce", "nao") e ninguém tinha escrito por quê — agora o
  **`npm run check:launchers`** recusa, apontando a linha.
  ⚠️ **A regra é ASSIMÉTRICA e NÃO se aplica ao `.sh`: não "conserte" os acentos dele.** O
  `iniciar-servidor.sh` tem **179 linhas com byte não-ASCII** ("Lógica", "Atualização", travessão)
  e está certo — bash lê UTF-8 e não parseia por deslocamento de byte. O portão reflete isso: do
  `.bat` ele cobra ASCII puro (checagem 1), do `.sh` cobra **ausência de `\r`** (checagem 3), que é
  o defeito espelhado — CRLF em shell script quebra o shebang. Cada arquivo tem a SUA regra,
  vinda do SEU interpretador. ✅ Confirmado em campo (escola, 2026-08-12): rodada limpa, sem uma
  linha de "não é reconhecido".
- [2026-08-11] **Testar um script no formato de linha em que ele NÃO chega no usuário é não
  testar.** A matriz de 6 casos do bug-620 rodou com **CRLF** no meu driver, e o `.bat` **ships
  em LF** (o `.gitattributes` força `eol=lf`) — e `goto` de dentro de bloco `if (...)` é
  justamente o que fica frágil com LF. Refeita em LF passou, mas por sorte. **Gerar o arquivo de
  teste com os MESMOS bytes do arquivo real** (`open(...,"rb")` e fatiar), não redigitar.
- [2026-08-11] **Decidir por CAPACIDADE, não por PRESENÇA.** Os launchers perguntavam *"existe
  `.git`?"* quando a pergunta é *"o git consegue atualizar aqui?"* — e um `.git` sobrando numa
  máquina sem git desligava o auto-update inteiro (bug-620). O molde do conserto vale além dele:
  quando o programa **não pode** operar, cair pro caminho alternativo **dizendo o motivo na
  tela** (a próxima rodada do usuário vira o próprio diagnóstico); quando ele **pode** e recusa,
  parar — recusa informada é resposta, não falha.
- [2026-08-11] **O workspace `shared` NÃO tem `@types/node`, e isso é a garantia de que o código
  de produção dele não alcança API de Node.** Um teste em `shared/src/*.test.ts` que lesse
  arquivo (`node:fs`) derrubaria o `npm run typecheck -w shared` e, se "consertado" com
  `@types/node`, furaria a garantia do pacote inteiro. Verificação que precisa de disco mora em
  `scripts/*.mjs`. Nenhum outro teste do shared importa `node:` — o sinal estava lá.
- [2026-08-11] **Erro que passa VERDE em toda a bateria precisa de portão próprio.** O `.bat`
  quebrado passava em typecheck, 822 testes, build e 15/15 smokes — quem descobria era a escola
  no meio da aula. Daí `scripts/checar-launchers.mjs`, ligado em `npm run verify` e antes do
  `npm run smoke`. **A mensagem de falha dele diz a LINHA e o conserto**, não só "falhou".

- [2026-08-11] **O `cmd.exe` do Windows roda a partir do WSL — dá pra testar o
  `iniciar-servidor.bat` DE VERDADE**, e foi assim que a sub-rotina `:ler_versao` da sessão 68
  foi validada. ⚠️ **Mas o cmd NÃO aceita caminho UNC**: rodando de `/home/...` ou do
  scratchpad ele imprime *"Não há suporte para caminhos UNC. Padronizando para pasta do
  Windows"* e o `.bat` nem é encontrado. Receita: copiar os arquivos pra uma pasta em `C:\`
  (`mkdir -p /mnt/c/lj-tmp`) e chamar
  `/mnt/c/Windows/System32/cmd.exe /c "cd /d C:\lj-tmp\... && arquivo.bat"`, apagando a pasta no
  fim. Escapar aspas dentro de `for /f` com crase é a receita do erro silencioso em batch — no
  `findstr` do `:ler_versao` o padrão usa `.` no lugar da aspa (`^ *.version.: *.[0-9]`) e não
  tem nenhuma aspa dentro.
- [2026-08-11] **Botão `disabled` NÃO despacha evento de ponteiro — delegação por
  `e.target.closest(...)` não o encontra.** Apareceu no tooltip (sessão 68): as linhas de receita
  que o aluno ainda não pode fabricar são justamente onde "o que é isso?" importa, e eram as
  únicas mudas. Conserto sem tocar no `disabled` (3 scripts de shot dependem dele — `craft-shot`,
  `toque-shot`): quando o `closest` falha, cair pra `document.elementFromPoint(x, y)`, que
  **enxerga** o botão desabilitado porque ele continua desenhado. ⚠️ Deixar esse teste ATRÁS de
  um `closest('.craft-lista')`, senão ele roda a cada `pointermove` do jogo.
- [2026-08-11] **`Emulation.setEmulatedMedia` com `pointer: coarse` muda o CSS e portanto o
  LAYOUT** (os alvos de dedo crescem). Coordenada de slot medida na seção de mouse **não aponta
  mais pro mesmo slot** na seção de toque — no `tooltip-shot.mjs` a caixa dizia "picareta de
  pedra" onde o log afirmava "tronco". Remedir depois de trocar a emulação.
- [2026-08-11] **UI que nasce na beirada de um painel precisa ser OPACA.** O tooltip com
  `rgba(...,0.94)` saía em dois tons — metade sobre o painel escuro, metade sobre o céu — e o
  texto de 0,78 rem ficava ilegível justo na metade de fora. Cor sólida resolveu.

- [2026-08-10] **Prova de UI que mede a CONCESSÃO do pointer lock é vazia — o que vale é contar
  os PEDIDOS.** Na primeira versão da seção B2 do `shots:esc` a asserção era
  `document.pointerLockElement === null`, e ela passou **com o bug de volta** (revertido o fix,
  ✓ mesmo assim). Motivo: o Enter que o script dispara é sintético (`dispatchEvent`), não conta
  como gesto de usuário, e sem gesto o Chrome recusa `requestPointerLock` de qualquer jeito. O
  caminho certo é o que o `shots:toque` já usava: envelopar
  `HTMLCanvasElement.prototype.requestPointerLock` num contador e exigir zero. **Toda sonda de
  pointer lock em headless mede chamada, não estado.**
- [2026-08-10] **`position: fixed` sem `left`/`top` NÃO fica onde o elemento foi criado — ele
  cai na posição estática do fluxo do `<body>`.** É o que produzia o "ícone flutuando no meio da
  tela" do bug-609: medido no headless, (0,457) numa tela de 1024×600. Elemento flutuante que
  nasce fora de um gesto de movimento tem de ser posicionado **na criação**, não só no
  `pointermove` que talvez venha depois.
- [2026-08-10] **Mudar o `custo` de uma receita EXISTENTE é seguro; mexer na POSIÇÃO dela não
  é.** O que viaja no protocolo (`fabricar {receita}`) é o ÍNDICE em `RECEITAS`, então editar
  ingredientes no lugar não desloca nada — foi o que o §🍖 F10c já tinha feito com a lã branca
  (2 trigo → 3 algodão) e o que a sessão 65 fez com as 26 receitas de lã. Receita que sai de
  circulação continua sendo `aposentada: "…"`, nunca apagada.
- [2026-08-10] **Os 12 ids de lã NÃO são contíguos** (`WoolWhite`..`WoolPurple` = 11–18, depois
  `WoolPink`..`WoolBrown` = 23–26; entre eles moram Sandstone/StoneBricks/Snow/Obsidian). Um
  teste que varra "toda lã" com `id >= WoolWhite && id <= WoolBrown` pega 4 blocos que não são
  lã. A lista tem de ser explícita — `receitas.test.ts` já denunciava isso com dois laços
  separados (`for i<8` e `for i<4`).
- [2026-08-08] **Bump de versão tem TRÊS passos, e pular o do meio faz o cliente da escola
  mentir.** `shared/src/version.ts` importa o campo `version` do `package.json` da RAIZ e o
  perfilador anônimo grava o resultado **por versão** (`client/src/hud.ts:529`). Como
  `client/dist` é **versionado e embute a string**, a receita é: `npm version minor
  --no-git-tag-version` → `npm run build` → commit com `package.json` + `package-lock.json` +
  `client/dist` **juntos** → tag anotada (`v0.8.0` e `v0.9.0` existem; o repo TEM tags de
  release). Conferência barata: `grep -rl "0\.9\.0" client/dist/assets/*.js` acha, e a versão
  velha não acha mais. O bump é raro e por MARCO (0.7.0, 0.8.0, 0.9.0), não por commit.
- [2026-08-08] **`json.dump` no `.wolf/buglog.json` tem de ser `indent=1`.** O arquivo é
  `indent=1`; gravar com o `indent=2` habitual reformata as 4.585 linhas e uma entrada nova vira
  diff de 9.193. Conferir com `git diff --stat` DEPOIS de escrever — se passar de ~30 linhas,
  reverter e regravar.
- [2026-08-08] **`iniciar-servidor.bat` e `.sh` são PAR e derivam um do outro — conferir os dois
  quando um mudar.** Eles divergiram por dois commits que só tocaram o `.bat` (`c2c09c6` mundo
  procedural, com "`.sh` não tocado (pedido: só o `.bat`)" na própria mensagem; `8bfb086` update
  por ZIP). Diferenças que DEVEM permanecer, porque são de plataforma: o `.bat` baixa `.zip`
  (o `tar.exe` do Windows lê zip; o tar do GNU **não** lê) e o `.sh` baixa `.tar.gz`; o `.bat`
  copia com `robocopy` sem `/PURGE`, o `.sh` com `cp -R src/. .`; o `.bat` relança a janela
  depois de trocar o próprio launcher, o `.sh` grava o novo AO LADO e **renomeia** (rename só
  troca o nome — o bash em execução segue lendo o inode velho até o fim, e o temporário tem de
  ficar na MESMA pasta, senão `mv` vira cópia por cima do inode vivo).
- [2026-08-08] **O caminho de update do `.sh` é escolhido pela pasta, não por flag:** com `.git`
  → `git fetch` + `merge --ff-only` (máquina de quem desenvolve); sem `.git` → pacote do GitHub
  (máquina da escola). O `.bat` faz a mesma bifurcação ao contrário (com `.git` ele DESLIGA o
  update e manda usar `git pull`). Os dois gravam o mesmo `.lj-versao` (sha de 40 chars, no
  `.gitignore`).
- [2026-08-07] **Dims de mundo de teste NÃO são blocos: CHUNK_SIZE=16.** `{x:8,z:8,y:8}` é um
  mundo de 128³ blocos — limpar/enterrar o "canto 0..7" deixa o resto (terreno gerado, spawn no
  centro) intocado. Para encenar sufocamento/colisão: cubo até o TETO (`findSpawnY == sizeY` →
  `inBounds` false → coluna não é vão), senão o soterrado "escapa pelo topo" sempre.
- [2026-08-07] **`teleportar()` zera o pico de queda.** Reposicionar jogador em teste via `move`
  de spawn y=26 → y=1 cobra 22 blocos de dano de queda (machuca o HUD de corações). Para
  posicionar sem dano: `teleportar()` ou roster do save.
- [2026-08-07] **Tests de `move` antigos assumem posição no ar; com gate de colisão quebram.**
  `session.test.ts` usava y=20 num terreno cujo topo é ~23 (posição dentro de sólido). Ao
  adicionar validação de colisão, posições de teste viram `findSpawnY(world, x, z)`.
- [2026-08-06] **O critério de corte do `startGame` já rendeu quatro donos, e o que decide não é
  tamanho: é FRONTEIRA.** `MateriaisMundo` (atlas + 3 materiais + os relógios), `ProgressoCarga`
  (um número só, mas escrito em 3 pontos a 1.000 linhas de distância e lido 60×/s),
  `PainelHost` (5 painéis + a regra da §48 que estava em 5 cópias) e o `FreioDePose`. Regra
  prática: **estado próprio + API estreita**; despachante (`handleServerData`) fica.
- [2026-08-06] **Lógica pura do cliente vai pro `shared/`, não pra uma classe do cliente — lá há
  onde testar.** O `FreioDePose` (política do `move`) virou 7 testes; se tivesse ficado no
  `client/` seria zero. Pergunta antes de criar classe no cliente: *isto depende de DOM, THREE ou
  da conexão?* Se não, o lugar é `shared/`.
- [2026-08-06] **`onBeforeCompile` do three guarda UM só, e `aplicarLuz` encadeia o que achar.**
  Por isso `aplicarBalanco` vem ANTES de `aplicarLuz` no material do terreno. Trocar não dá erro
  nenhum: o terreno só deixa de escurecer à noite (bug-592).
- [2026-08-06] **Painel de container REABRE em `atualizar`, e a fornalha cozinhando manda 10×/s.**
  Toda mudança no fluxo de fechar tem de pensar na mensagem em voo (bug-593). O padrão que vale:
  pedido → CONFIRMAÇÃO do servidor → o cliente descarta o que chega no meio, e a ordem do TCP
  garante o corte.

### Corte por domínio de arquivo grande (2026-08-06)

- **A API pública é a prova.** Antes de cortar `session.ts` (4.677 linhas), o que autorizou o
  corte foi um `grep -c "as any\|@ts-expect"` nos testes de session: **0**. Nenhum dos 715
  testes toca campo interno, então mexer por dentro é livre e os testes valem como controle.
  Fazer essa conferência PRIMEIRO é o que separa refactor seguro de aposta.
- **Módulo de funções livres > mixin/prototype merging** pra quebrar classe grande em TS. Cada
  domínio vira `export function f(ses: GameSession, …)`; a classe segue dona do estado e da
  API. O ciclo `core → domínio → (type) core` some porque a volta é `import type` (apagado no
  runtime); ciclo entre DOMÍNIOS (modo↔vitais↔inventário) é seguro porque `export function` é
  hoisted.
- **`private` cai, e a razão tem de ficar escrita.** TS não tem visibilidade de PACOTE: módulo
  irmão não alcança `private`. A convenção mora num bloco no topo da classe, não em 40
  `/** @internal */` soltos (viram ruído e ninguém lê).
- **O transformador mecânico erra em `this` SOLTO.** Trocar `this.` → `ses.` deixa passar
  `foo(this, x)` — que aparece assim que um domínio anterior já foi religado. Trocar `\bthis\b`
  inteiro é o certo: dentro de função livre, `this` não tem outro significado.
  E `private static` não casa com a regex de método — vira lixo no meio do módulo.
- **Cortar de BAIXO pra cima.** Extrair não muda o arquivo; DELETAR muda. Fazendo os `sed -i`
  do maior número de linha pro menor, os intervalos que faltam continuam válidos.
- **Fronteira de bloco: conferir a chave.** Um `}` do lado errado do corte dá erro em DOIS
  arquivos ao mesmo tempo (um sobrando, um faltando) — é o sintoma de off-by-one no intervalo.
- **A poda de import não converge em uma passada:** tirar um import deixa outro sozinho. Laço
  com `tsc --noUnusedLocals` até dar zero (e o `TS6192` apaga o `import` inteiro, não um nome).
- **[2026-08-06, sessão 51] O que merece subir pro `shared/` não é "ser puro" — é ser a regra
  que os DOIS LADOS DO FIO têm de aplicar igual.** Pureza é o requisito de entrada; o que dá
  valor é a duplicação atravessando a fronteira. A geometria do raio de colunas estava escrita
  SEIS vezes (2× no `session/streaming.ts`, 2× no `main.ts`, 1× no `colunasFaltando.ts`) e as
  do cliente com `16` e `+ 2` DIGITADOS no lugar de `CHUNK_SIZE` e `FOLGA_DESCARTE` — a mesma
  constante que o cerebrum já dizia ser o que dispensa mensagem de unload. **Procurar a cópia
  pelo NÚMERO literal, não pelo nome da função:** `grep "+ 2"` acha o que `grep FOLGA_DESCARTE`
  nunca acharia, porque o ponto é justamente que ele não está lá.
- **[2026-08-06, sessão 51] Duas implementações do MESMO conjunto valem mais que uma testada.**
  O cliente conta as colunas do raio por fórmula fechada (`contarColunasNoRaio`, um retângulo
  recortado) e o servidor as ENUMERA andando em anéis (`streamColunas`). O teste que paga é o
  que cruza os dois — contar tem de dar exatamente o que o stream manda. E **a divergência mora
  na BORDA**: com o recorte removido, o caso do centro segue passando e só os cantos caem (o
  canto manda 49 colunas, a fórmula sem recorte diz 169). Caso de teste no meio do mundo não
  prova nada sobre fórmula de recorte.
- **No CLIENTE o padrão é outro, e ele já estava no arquivo:** `main.ts` não é classe, é script
  com 51 `let` de módulo e um `startGame` de 1.646 linhas de closure. Ali o corte que funciona
  é **composição por classe** — que é o que `TorchGlow`, `RegionRenderer`, `AguaFx` e
  `ChunkRenderer` já fazem. Subsistema novo vira classe dona do próprio estado, não função
  livre com bag de contexto.

<!-- Só a REGRA acionável. Narrativa, números e contexto de cada sessão: .wolf/history.md
     (`## Key Learnings arquivados (2026-07-25)` e `## Cerebrum arquivado (2026-07-28)`). -->

### Portões que se mantêm sozinhos

- **Portão que lê o FONTE não envelhece.** O `gate-claim.test.ts` (§🍖 F10f) importa
  `./protocol.ts?raw`, extrai a união `ClientMessage` e exige que toda mensagem com `x: number`
  esteja coberta — por um teste de bloqueio ou por uma isenção com razão escrita. Uma lista à
  mão envelheceria em silêncio na primeira mensagem nova, que é o buraco que o portão existe
  pra fechar. O `?raw` (declarado em `shared/src/raw.d.ts`) entra no lugar de `node:fs` porque
  `shared` é ISOMÓRFICO de propósito e não carrega `@types/node`.
- **Teto de id se EXPORTA, não se digita.** `MAX_BLOCK_ID` virou export porque os portões que
  varrem "todos os ids" fixavam o número à mão em dois arquivos — e esquecer de subi-lo
  significava um portão que deixava de olhar justamente o bloco recém-criado.
- **Família nova = TABELA, não segunda faixa de ids.** Quando o algodão entrou, a plantação
  virou `PLANTAS = [{base, estagios}]` e `plantaDe(id)` passou a responder por estágio, muda,
  madura, forma canônica e colocável. Escrever a 2ª faixa à mão nas 5 funções seriam 5 chances
  de esquecer uma — e o mesher, que derivava o tile de `plantacao0 + estagio`, teria dado o
  tile do trigo pro algodão.

### Verificação headless e mundos de teste

- **`createWorld(dims, alocar)` — o 2º argumento NÃO é "lazy".** Com `false` os chunks nem
  existem: `setBlock` não grava e `getBlock` devolve 0, então um teste que monta cenário à mão
  prova o nada (bug-578). Teste que constrói mundo próprio usa o padrão.
- **Mundo DENSO (P/M/G) × mundo LAZY (E).** `mundoLazy` só é verdadeiro no procedural ("E"):
  ele é o único que streama e DESCARTA coluna, então é o único onde existe "além do raio de
  render". Nos densos o `trocarMundo` monta o mundo inteiro. Consequência prática pra qualquer
  teste de streaming/culagem: **em mundo P nada fica além do raio** (128×128, e o raio padrão
  de 6 chunks já são 96 blocos) — o teste passa vazio. Use "E" e baixe `raioRender` no
  `localStorage['lj-config']` **antes** de entrar no mundo.
- **O three.js já corta por FRUSTUM.** Objeto fora do campo de visão não custa draw call, com
  ou sem culagem própria. Teste de culagem por distância que põe o alvo "longe" sem garantir
  que ele está NA TELA mede o frustum, não o patch — a saída é semear o alvo nas 4 direções.
- **Chrome headless nesta máquina:** flag é `--enable-unsafe-swiftshader` (o
  `--use-gl=swiftshader` NÃO serve — sem WebGL o jogo fica no menu pra sempre e o sintoma é
  `#hotbar .slot` nunca aparecer). E `?hud` já abre o F3 no boot: apertar F3 depois FECHA.
- **Instalar o chrome no notebook (sem sudo)** — ver bug-564 pro passo a passo. Resumo: o
  `npx @puppeteer/browsers install` **falha na extração e mesmo assim sai com código 0**
  porque falta `unzip`; extrair com `python3 -m zipfile -e` **e dar `chmod +x` em todos os
  binários** (o zipfile do python perde o bit de execução); libs de sistema por
  `apt-get download` + `dpkg-deb -x` + `LD_LIBRARY_PATH`.
- **[2026-08-05, sessão 47] Script de print monta o cenário com coordenadas `~` do professor**,
  e aí ele nunca precisa saber onde o spawn caiu: `/regiao criar palco ~-5 ~ ~-6 ~5 ~3 ~-1` +
  `/regiao encher palco 0` limpa um terraço em DUAS mensagens (dezenas de `/bloco` a 500 ms
  cada não cabem no orçamento). **A prateleira na altura do OLHO é o que faz o bloco aparecer
  de LADO** — bloco bem à frente mostra só a face de trás, e é justamente de lado que forma e
  direção existem. Fechar com `/regiao apagar`: a borda vermelha é andaime, não cena. E
  `limparChat()` antes de todo print de mundo (o `/bloco` deixa uma dúzia de linhas na tela).
- **[2026-08-05, sessão 47] Print de estado que depende do TEMPO se faz com o relógio do host
  acelerado, não com byte forjado.** Os 4 estágios do algodão num quadro só saíram de 4
  plantios em tempos diferentes com `LJ_CRESCIMENTO=30` (3 s por estágio em vez de 20): cada
  pulso sobe UM estágio, então quem entrou antes está mais maduro. Escrever os bytes 190/191/192
  à mão daria a mesma foto e não provaria nada.
- **[2026-08-05, sessão 47] Slot de painel se aciona por `.click()` do DOM, botão de UI de toque
  por CDP.** Os `button.inv-slot` do `ContainerPanel` escutam `click` de verdade, então
  `.click()` percorre o MESMO caminho do dedo; já o `tapButton` da barra escuta `pointerdown`
  e exige `Input.dispatchTouchEvent`. Misturar os dois é o jeito barato de dirigir o cliente
  inteiro sem pointer lock.

### Invariantes e contratos

- **Arquivo de mundo que começa com `aula` é MUNDO DE AULA** (`ehMundoDeAula`, server/src/
  paths.ts): read-only e reutilizável (sempre carrega do MODELO em `cenarios/`, nunca salva a
  turma) e o **confinamento nasce ligado**. Pra pista de corrida isso é a proteção de graça
  (ninguém cava atalho); pra qualquer mundo que PRECISE persistir, o nome não pode começar
  com "aula".
- **`server/src/cenarios/gerar.ts` roda uma CLI no corpo do módulo** — importar dele gera os 6
  cenários como efeito colateral. O que outros geradores reusam mora em `autoria.ts`.
- **Cenário só vira arquivo se o verificador aprovar**, e o verificador JOGA o cenário
  (monta o gabarito / corre a pista) num servidor novo. Ao escrever conferência nova, teste o
  lado NEGATIVO: quebre o cenário de propósito e veja se ela reprova. A do vão da corrida
  passou verde com a rampa REMOVIDA até o buraco ser cavado de verdade (bug-563).

- **A banda de ITENS (≥ 900) não é um intervalo aberto:** `isItem(id)` é um Set explícito
  (baldes, fruta, trigo, pão). Quem precisa aceitar "bloco OU item" (o `/dar`, o portão da
  tabela de drops) chama essa função — testar `id >= 900` deixaria byte inventado passar.
- **`apoioValido(id, idAbaixo)` é a fonte ÚNICA de "este apoio serve?"**, consultada pelo gate
  do `place_block` E pela regra de vizinhança do tick. Cubo cheio serve pra tocha/tapete/flor;
  a plantação exige SOLO (`isSolo`: terra + as 3 gramas). Se as duas pontas discordarem,
  aparece colocação que evapora no tick seguinte.
- **`precisaApoio()` não derruba nada sozinho.** Ele só barra o PLACE; quem apaga o que perdeu
  o apoio é a entrada no `rulesMap` (`torchRule`). Bloco novo que precisa de apoio tem de
  entrar nos DOIS lugares — foi a falta do segundo que fez o capim flutuar (bug-558).

- Índices: chunk = `(cy*dims.z+cz)*dims.x+cx`; bloco = `(ly*CHUNK_SIZE+lz)*CHUNK_SIZE+lx`.
  `getBlock` fora dos limites (ou chunk ausente) = Air.
- **Id de bloco é BYTE DE SAVE:** nunca renumerar/reordenar id antigo — só append no fim do
  `BlockId` + bump do `MAX_BLOCK_ID`. Família nova fica FORA da faixa antiga (`isFullCube` usa
  faixas; ver a pegadinha da porta R em Do-Not-Repeat).
- **[2026-08-05, sessão 47] Dar DIREÇÃO a um bloco que já existe: a família fica NÃO-CONTÍGUA,
  e tudo bem.** O idioma da casa é `âncora + k` (cadeira, cama, quadro, escada), mas ele só
  serve pra família que nasce inteira. A fornalha já tinha 186/187 gravados em mundo salvo:
  renumerar pra abrir espaço trocaria a fornalha de quem já jogou por outro bloco. **Solução:
  os ids velhos viram UMA das direções (a −Z) e as outras entram no fim, com uma TABELA
  (`FORNALHA_POR_FRENTE`) no lugar da aritmética.** Custa 4 funções pequenas
  (`isFornalha`/`fornalhaFrente`/`fornalhaComFrente`/`fornalhaComEstado`), zera migração, e é o
  mesmo raciocínio que APOSENTOU a receita de vidro em vez de apagá-la (o índice é o contrato).
- **[2026-08-05, sessão 47] Bloco com direção E estado: o par se troca pelo id VELHO, nunca por
  constante.** `alvo = aceso ? BlockId.FornalhaAcesa : BlockId.Fornalha` estava certo enquanto
  havia uma direção só; com quatro, acender giraria a fornalha pro norte na frente da turma.
  A regra geral: **toda transição de estado de bloco direcional lê o byte atual primeiro.**
- `world_snapshot` (LE): magic "LJW0" | dims x/z/y | reservado | u32 seed | chunks na ordem de
  `chunkIndex()`. Decode SEMPRE valida magic/dims/tamanho.
- `block_changed` é GENÉRICO por contrato: mesma msg pra jogador, outro jogador e regra do
  tick. O cliente aplica sem distinguir origem.
- **Valor do terreno PRISTINO (spawn etc.) é propriedade da CRIAÇÃO do mundo:** calcular no
  construtor e transmitir por protocolo, NUNCA derivar do snapshot (que já pode estar escavado).
- `/shared` é lib ES2022 pura: sem `performance` (clock injetável `opts.now`), sem
  TextEncoder/TextDecoder (`declare class` mínima no arquivo, nunca lib DOM no tsconfig).
- **Campo novo em mensagem do servidor entra OPCIONAL no `parseServerMessage`** — host antigo
  não manda, e parse exigente descartaria a mensagem INTEIRA por um número de diagnóstico.

### Servidor autoritativo e regras

- Validação de ação: join → bounds → célula compatível → alcance (`PLAYER_REACH+2` de folga,
  pos chega a 10 Hz) → AABB de jogadores. **Rejeição = SILÊNCIO**; o mundo do cliente só muda
  por `block_changed`.
- **Regra de bloco NUNCA escreve no mundo:** devolve `BlockChange[]` e a session aplica
  (broadcast + marca vizinhos). Sujeira nova vai pro PRÓXIMO tick (o lote é snapshot), e
  `changedThisTick` impede 2ª mudança da mesma célula — é o que faz a areia cair 1/tick sem
  teleporte. Materializar embaixo ANTES de limpar a origem. Queda é `fallingRule` GENÉRICA:
  bloco novo que cai = 1 linha no Map `RULES`.
- **Estado periódico novo = "manda quando muda + heartbeat"**, nunca "manda sempre" (molde do
  move: até 10 Hz + heartbeat 1×/2 s).
- Presença: o cliente NUNCA sabe o próprio id; relay só pros OUTROS (`broadcastExcept`).
- **Broadcast de estado (regions/objectives/groups/quadros) é LISTA COMPLETA e o cliente
  SUBSTITUI** (não mescla), com dedup por JSON. Não fazer mensagem por-destinatário: quebra o
  dedup, e é o cliente que escolhe a própria linha.
- Chat: broadcast ECOA pro autor (confirma round-trip); comando (`/`) responde SÓ pro autor.
- **Tempo é SERVER-AUTORITATIVO por TICK**, nunca relógio de parede (`horaDoDia += 24/(DIA_
  SEGUNDOS*TICK_RATE)`); broadcast 1×/s e o cliente interpola. Mesmo molde do vento.
- **Detecção de objetivo segue a regra de ouro:** `applyBlock` marca sujo e o tick recheca SÓ
  os tocados — nunca varredura periódica. Região MODELO ≠ região ALVO (fotografar e detectar na
  mesma nasceria completo). Reset repõe blocos do `Objective.baseline`.
- Comando SÓ do host (fecha socket / lê arquivo) é interceptado em `server/index.ts` ANTES do
  `session.handleMessage` — a GameSession é pura. Adicionar à mão no autocomplete.
- `parseCoordArg` (inteiro, `~`, `~n`) e `parseNamedRegion` (validador ÚNICO de região vinda
  de fora, protocolo E save; entrada quebrada é PULADA) são pra REUSAR.
- Encher em lote = `applyBlockQuieto` + UMA msg `blocks_filled`. O teto de detecção (4096) é
  menor que o de encher (65536) porque **detecção é custo RECORRENTE**, não pontual.
- Mar/lago: `NIVEL_MAR=22` inunda com água-FONTE (auto-regenerativa, não escorre → oceano
  estável e ZERO tick no boot, porque a fila de vizinhança só acorda em `applyBlock`).
  `SAND_HEIGHT = NIVEL_MAR+1`. Preset plano/cabines não tem água.
- Água fluida (`waterRule`), duas armadilhas: o custo até a queda conta TODA célula
  ATRAVESSADA (ar ou fluida), não só as preenchíveis; e `temQueda` conta ar **e** água fluida
  embaixo. O teto por tick conta só células que MUDAM.

### Mesher, materiais e formas

- **Mesher é FUNÇÃO PURA (bytes → geometria)** e roda no cliente — é o que o deixa caber num
  Worker. Todo acesso está em `[-1..CHUNK_SIZE]`, por isso a vizinhança padded 18³ basta.
- **Predicado de bloco que o mesher chama é O(1) OU É BUG DE PERF (bug-607).** `swayDoBloco`
  roda pra TODO bloco não-ar do chunk (até 4096 por chunk, ~2650 chunks por rodada de bench) e
  pergunta `ehCruzDeSprite`. Qualquer `for (const x of LISTA)` embaixo disso cresce junto com a
  LISTA, e o custo aparece longe de onde a lista foi editada: `PLANTAS` foi de 2 pra 8 linhas no
  F10h e o mesher ficou **63% mais lento** sem ninguém tocar no mesher. **Tabela indexada por id
  montada no import** (o molde do `BLOCK_TILES`, que já está no arquivo) resolve na raiz e faz
  entrada nova sair de graça. Vale pra `plantaDe`, `plantaPorSelvagem` — e pra qualquer
  `isXxx(id)` que vire varredura.
- **Oclusão de face se decide pela transparência do VIZINHO, não do dono da face:** face
  aparece se `vizinho == ar || (transparente(vizinho) && vizinho != id)`. Mesmo id funde
  (vidraça contínua); não-cubo NUNCA oclui vizinho.
- **Transparência de verdade = GRUPO de índices + material próprio** (1 vertex buffer, índices
  fatiados em opaco/água/vidro por `opaqueIndexCount` + `aguaIndexCount`; grupo com count 0 não
  gera draw call). **Cutout (alphaTest) é pra RECORTE** (folha, flor, moldura, vidro incolor),
  NUNCA pra meia-transparência de superfície — vira dither de mosquiteiro (reprovado em
  playtest). Tile do atlas fica OPACO: o ícone 2D da hotbar copia o tile e sai sólido.
- **Atributo por vértice atravessa 5 arquivos:** `ChunkGeometry` → `meshVizinhanca` (empurrar
  em PARALELO a `positions`) → `meshWorker` (**incluir na lista de transfer!**) →
  `ResultadoMesh` → `chunks.aplicar` + a constante `VAZIA`. Esquecer o transfer não quebra
  typecheck: copia em vez de mover.
- **`onBeforeCompile` > ShaderMaterial** (o material segue MeshLambertMaterial de verdade: luz,
  névoa, cutout e blend do three intactos). **Mas é UM só por material** — atribuir por cima
  apaga o anterior SEM ERRO NENHUM. Enxerto novo tem de ENCADEAR (guardar o anterior e chamar).
- Forma parcial: fonte única `collisionBoxes(id)` alimenta mesher E física; `blockSelectionBox`
  dá a caixa da mira. Sprite plano (flor/capim) usa `emitCrossPlane`, não `emitBox`.
- **Superfície de fluido = altura POR VÉRTICE:** cada canto é a média dos níveis das 4 células
  que o compartilham → a vizinha calcula o MESMO canto e as pontas encaixam, sem explosão
  combinatória. Água em cima de qualquer uma das 4 → canto = 1.
- **Tile direcional num cubo precisa de escolha POR FACE, não por célula** (nas laterais um dos
  eixos u/v é o VERTICAL). `FACE_BASES` dá o eixo de mundo por face. **Rotação fixa por face
  NÃO resolve** — parece que sim testando uma direção só. Relato de playtest em forma de
  "rotaciona 90 aqui, 180 ali" pede tabela DERIVADA numericamente, não offset.
- **UV do topo é `u = 1−x`, `v = z`**: o canvas 2D tem y pra baixo, então o atlas anda ao
  CONTRÁRIO do mundo nos dois eixos — animação que siga direção de mundo nega os dois.
- Animação de textura: repintar só o tile + `texture.needsUpdate` (que reenvia o atlas
  INTEIRO, ~262 KB → o que importa é a TAXA de repintura). `putImageData`, nunca `fillRect` por
  pixel. Ruído do tile FIXO (hash da posição), só a fase anda. Tiles de um grupo animado ficam
  CONTÍGUOS numa linha e compartilham o MESMO salt. Onda precisa de vetor INTEIRO pra fechar no
  tile de 16 px (daí 8 setores + interpolação entre vizinhos pra matar o "pop").
- Balanço de folha precisa de frequência ESPACIAL baixa (0,16 rad/bloco): cubos de folha são
  independentes e, se cada um se deslocar diferente, a copa abre fresta.
- `ATLAS.tilesPerRow` é dinâmico (grade cresce sem tocar UV/save). Tile não pintado = bloco
  invisível: o teste "todo colocável tem tile" pega o mesher, não o atlas.
- **[2026-08-05, sessão 47] O sintoma que pede forma parcial é "dois vizinhos viram UM bloco".**
  Baú de cubo cheio: dois lado a lado liam como parede de madeira contínua, porque a face do
  meio é ocluída por `nb === id`. **A régua do teste é essa mesma:** dois blocos encostados
  somam 72 índices se cada um tem forma própria e 60 se são cubo cheio — o A/B cabe numa linha
  e denuncia qualquer reversão.
- **[2026-08-05, sessão 47] Caixa com tampa diferente = UM `emitBox` com tile de Y separado**,
  não duas caixas coladas. Duas caixas na mesma altura z-fightam na junta e dobram as faces;
  um parâmetro `tileY` (padrão = o tile dos lados) resolve, e o `col`/`row` só precisa descer
  pra dentro do laço de faces.
- **[2026-08-05, sessão 47] Face FRONTAL num cubo: `FaceTiles.frente` + a direção vinda do ID.**
  A presença do campo é o que liga a pergunta (`tiles.frente === undefined ? null : …`), e ela
  se faz UMA vez por célula, não por face — o bloco sem frente não paga nada. E
  **`blockIconTile` tem de preferir a frente ao `side`**: com o tijolo liso no `side`, a
  fornalha viraria um cinza sem nome justamente no slot da hotbar, que é onde ela precisa ser
  reconhecível.
- **[2026-08-05, sessão 47] Sair do `isFullCube` tem QUATRO consequências além do desenho**, e
  vale conferir as quatro antes: a luz passa a atravessar (`opacidadeLuz`), a cerca deixa de se
  conectar, o bloco deixa de servir de apoio (`apoioValido`) e o raycast passa a testar a
  hitbox real (`blockSelectionBox` + `subBoxNormal`) em vez da célula. Pro baú as quatro são o
  comportamento do Minecraft, então saiu de graça — mas nenhuma delas está no arquivo que se
  edita.

### §💡 Luz voxel (2026-07-28)

- **Luz é função pura dos BYTES do mundo, então mora no CLIENTE** — ele já tem os bytes, logo
  zero banda e zero tick, e dois clientes convergem sozinhos. A entrevista estimou "mexe no
  tick e no protocolo"; não mexeu em nenhum. **Antes de aceitar que uma feature precisa de
  protocolo, perguntar se o cliente já tem os dados de entrada.**
- **Dois canais de 4 bits num byte** (`(ceu<<4)|bloco`): o céu escala com a hora no shader, a
  tocha não — caverna com tocha segue acesa às 3 da manhã, e anoitecer NÃO custa remesh (a
  hora é uniform, não geometria).
- **A regra que faz caverna existir é a DESCIDA RETA:** céu no máximo descendo por bloco
  transparente não perde nível. Sem ela o mundo vira gradiente vertical e nada é sombra.
- **Ordem é luz → mesh**, nunca o contrário: geometria montada antes nasce clara e escurece num
  segundo remesh (pisca). E luz roda na MAIN THREAD (o mundo mora lá), então entra na
  disciplina do mesher: fila + orçamento por frame, SEMPRE ≥1 por frame, e a fila conta no
  portão da tela de carga.
- **Conjunto sujo de luz > vizinhança do bloco:** `remeshBlock` cobre ±1 chunk, luz alcança 15.
  Remeshar o conjunto que o motor devolve (`remeshSujos`).
- Folha atenua 1 de propósito → `h+1` não é 15 sob copa. Nada de luz no save (é derivada).

### §🏔️ Geração de mundo e cavernas (2026-07-28)

- **Galeria = INTERSEÇÃO de dois ruídos 3D perto de 0,5** (duas fatias do espaço se cruzam num
  tubo). Ruído único com limiar dá bolha solta, sem passagem. Y comprimido = túnel caminhável.
- **Mundo lazy proíbe pós-processamento:** a caverna é pura em `(x,y,z,h,seed)` porque duas
  colunas vizinhas só fecham a mesma galeria respondendo igual sem consultar o mundo.
- **Calibrar densidade de ruído em UMA seed é armadilha:** varia 2,9%–7,3% num mundo 6×6
  (a célula do ruído tem 26 blocos), e a seed do `?bench` é das mais VAZIAS. Medir a MÉDIA de
  várias seeds.
- **Ter caverna custou +66% de triângulos** (153 852 → 255 234): o salto é ter caverna QUALQUER
  (chunk de subsolo deixa de ser sólido sem faces); densidade depois é barata.
- **Interpolação trilinear é separável** → value noise 3D amortiza por FATIA horizontal ao
  descer uma coluna (28,6 → 3,5 ms/coluna). **Havendo caminho rápido e caminho de referência,
  escrever o teste que compara os dois célula a célula** — é ele que autoriza otimizar.
- Escavar DEPOIS do minério deixa a veia cortada na parede (o que faz explorar valer a pena).

### §🍖 Sobrevivência (2026-08-02, F1 · F2 · F3)

- **Modo de jogo tem DUAS camadas:** padrão do MUNDO (no `.ljw`) + override pessoal por NOME
  (não por id de cliente — tem de sobreviver ao rejoin, igual ao roster). Quem resolve o
  efetivo é o SERVIDOR; o protocolo carrega só `modo {efetivo}`, porque o cliente não tem (nem
  precisa ter) o mapa de overrides.
- **Estado por-jogador novo vai SEMPRE no join, mesmo no valor padrão** — o `/voo` só manda
  quando liberado e isso é seguro porque o cliente nasce com o mesmo default; qualquer estado
  que possa vir DIFERENTE do mundo anterior tem de ser reafirmado, senão a troca de aula
  (sessão nova) deixa o cliente com o valor velho (família do bug-518).
- **Regra de mundo é REGISTRO, não campo:** `regras.ts` (nome, padrão, ajuda) + um comando
  genérico `/regra` + UM campo `regras?: Record<string, boolean>` no `SaveMeta`. Regra nova =
  uma entrada na lista: sem comando novo, sem campo novo, sem re-versionar o save.
- **Save guarda só o DIFF do padrão** (`regrasParaSave`, `modo !== MODO_PADRAO`): mundo que
  nunca viu a feature sai byte a byte como antes, e o padrão novo passa a valer nos mundos
  antigos sem migração.
- **Mundo-aula (`somenteLeitura`) impõe criativo**, vencendo o save e recusando o comando —
  a aula distribui um MODELO, não uma partida (mesma lógica do confinamento forçado no cp25).
- Comando que a turma inteira precisa CONSULTAR mas só o professor pode MUDAR: o gate vai no
  dispatcher por `parts.length` (`/modo` livre, `/modo x` professor-only), como o `/hora`.
- **UMA PORTA SÓ PRO DANO** (`aplicarDano(estado, n, causa)`): queda, afogamento, fome, PvP e
  mob entram pela MESMA função — causa nova é um valor a mais no union, não um caminho novo.
  Mesmo desenho do `fallingRule` genérico (areia e cascalho dividem uma regra).
- **Estado derivado do MOVIMENTO se fecha no servidor, do fluxo de `move` (10 Hz)** — ele tem
  o mundo; o cliente não reporta dano (seria autoridade no lugar errado). O preço é resolução:
  a ~4 blocos por amostra, a altura de queda erra PRA MENOS. **Escolher o lado do erro e
  ESCREVER isso no código** vale mais que fingir precisão.
- **Testar "chão" tem UMA definição só:** `apoiadoNoChao` (physics.ts) reusa o `collides`, que
  já sabe de laje/escada. Uma segunda definição sai de acordo com a física no primeiro bloco
  de forma parcial que aparecer.
- **Estado de tick que vira PIXEL só viaja quando o pixel muda:** o fôlego anda 10×/s, mas a
  mensagem `vida` só sai quando muda coração ou BOLHA (`GameSession.bolhas`) — a granularidade
  do desenho é que decide a cadência da rede.
- **Estado por-jogador que sobrevive ao rejoin mora por NOME** (vitais, modo), como o roster e
  o PIN; o que é rascunho de sessão mora por clientId e morre no disconnect (`picoQueda`).
- Teleporte (respawn, `/tp`) e troca de modo têm de ZERAR estado acumulado de movimento —
  senão quem voava em criativo pousa machucado ao entrar em sobrevivência.
- **`?param` na URL pra congelar estado de UI** (`?hora`, `?vento`, `?atlas`, `?vida`) é o
  idioma do projeto pra inspeção visual: o headless vê o que o servidor levaria uma partida
  inteira pra produzir. O forçado tem de VENCER o sync de rede, senão a 1ª mensagem apaga.
- **Recurso que desce com o USO desce por ESFORÇO, não por relógio** (§🍖 F3): acumulador
  fracionário de exaustão + conversão a cada limiar. Além de dispensar `Date.now()` (como o
  ciclo e o vento), é o que faz o gasto acompanhar o que o aluno FEZ — quem passou a aula lendo
  o quadro não pode chegar faminto. A régua fica em constantes exportadas, uma por atividade.
- **Cobrança de "o jogador editou o mundo" mora DEPOIS do `switch` do `handleMessage`, num
  ponto só** — cada caso já retornou cedo quando recusou (bounds, alcance, claim, confinamento),
  então "o mundo mudou" (`changedThisTick.size` cresceu) é o mesmo que "a ação valeu". Porta e
  cama, que materializam 2 células, custam UMA ação — e ramo de bloco novo entra cobrando sem
  ninguém lembrar de plugar nada.
- **Campo OPCIONAL no protocolo pode significar duas coisas ao mesmo tempo, e isso é útil:**
  `fome` ausente = host antigo **ou** mundo com a regra desligada; nos dois casos o cliente
  desenha nada, que é a resposta certa. Mas então mudar a REGRA tem de reenviar a mensagem
  (senão o HUD só reage no próximo dano) — regra que decide o que existe na tela avisa na hora.
- **Regra desligada tem de neutralizar o estado JÁ acumulado, não só parar de acumular:** com a
  fome desligada, o corpo se comporta como bem alimentado mesmo com a barra em 0 gravada —
  senão o aluno fica sem regeneração num mundo que não tem mais fome.
- **`RegraDef.pendente`**: regra sem mecânica avisa no `/regra`; quando a frente chega, some o
  flag. Sem isso, ou o comando mente ("ligada") ou avisa pra sempre.
- **Punição que depende de uma frente que ainda não existe ganha um PISO, não um adiamento**
  (`VIDA_MINIMA_POR_FOME = 6`): a fome já enfraquece de verdade (sem regeneração, perde vida),
  mas não mata enquanto não houver comida. A alternativa — não implementar o dano — deixaria a
  mecânica sem consequência; a outra — matar — é frustração de aula. Constante, com o caminho
  de volta escrito no comentário.
- **Ícone com metade recortada (`clip-path: inset(0 50% 0 0)`) decide o LADO do desenho:** a
  coxa teve de nascer com a carne à esquerda, senão meia coxa mostraria só osso. Vale pra
  qualquer ícone assimétrico que use o truque do meio-coração.

### §🍖 Sobrevivência (2026-08-03, F5 craft)

- **Craft é uma LISTA de receitas puras, o índice é o contrato do protocolo** (`receitas.ts`):
  `Receita { saida, custo[] }` + `podeFabricar`/`fabricar`. A mensagem `fabricar {receita}`
  manda o ÍNDICE na lista `RECEITAS`, então a lista é **APPEND-only como o `BlockId`** —
  inserir no meio desloca o que o cliente já conhece. O servidor confere e aplica; o cliente só
  pede (mesma disciplina do `mover_item`).
- **`fabricar` é TUDO-OU-NADA numa cópia:** consome cada custo e só credita a saída se tudo saiu
  E a saída CABE; qualquer furo devolve `null` e nada é gasto (senão o clique sumiria com os
  ingredientes numa mochila cheia). `podeFabricar` = `fabricar(...) !== null` — uma verdade só.
- **O balde virou item de mochila (fechou o pendente do F4):** o `case balde` agora tem dois
  mundos. Em criativo o servidor NÃO exige item na mão (paleta infinita — foi assim que o smoke
  criou uma fonte: `balde despeja` do professor). Em sobrevivência ele **confere o balde no
  slot ANTES de mexer na água** (recusa não deixa rastro no mundo, disciplina da mochila cheia)
  e troca vazio↔cheio **NO MESMO slot** com `definirSlot` — trocar por `remover`+`adicionar`
  jogaria o balde pra outro slot e o jogador perderia o que segura. O slot viaja no `slot?` da
  mensagem (opcional: criativo não manda).
- **Painel com sub-abas re-renderiza a lista, não o painel, ao filtrar:** o campo de filtro do
  craft atualiza `this.filtroCraft` e chama `montarReceitas(lista)` (só as linhas), pra o foco
  do input não piscar — o mesmo cuidado de "adiar enquanto um input tem foco". O gesto é
  **tocar-pra-fabricar** (a linha inteira é o botão), pelo mesmo motivo que a grade 3×3 foi
  descartada. "Falta N" sai em vermelho por `ingredientesDe` (have/need/falta por id).

### §🍖 Sobrevivência (2026-08-04, F9 preset) e o painel de amigos

- **"Preset de mundo" tem DOIS eixos, e misturá-los é o erro barato de cometer.** O
  `WorldPreset` (normal/plano/cabines) decide BYTES; o §🍖 F9 decide como o mundo NASCE
  JOGADO (modo + ciclo) e virou `SessionOptions.sobrevivencia`, não um quarto preset. Se
  fosse membro do union, todo `preset === "normal"` espalhado pela geração (água, veto de
  caverna no spawn) passaria a excluir a sobrevivência EM SILÊNCIO — e ainda fecharia a
  porta pra sobrevivência em mundo plano. O token de fora ("sobrevivencia" no `LJ_PRESET`,
  no select do menu) é traduzido num lugar só (`ehPresetSobrevivencia`, reusando o
  `parseModo` pra aceitar acento). **Teste do eixo: os bytes do mundo têm de sair idênticos
  com e sem o flag.**
- **Preset de nascimento grava só o que DIFERE do padrão.** O F9 escreve `modoMundo` e
  `cicloAtivo` e NÃO escreve `pvp: false` / confinamento, que já são o padrão: o save guarda
  o diff, então gravá-los prenderia o mundo ao padrão de hoje em vez de segui-lo.
- **Painel sobre comando revela o buraco do FEED, não do comando.** O `/amigos convidar`
  funcionava havia sessões porque a resposta de chat bastava; com painel, o botão parecia
  morto — o servidor mandava o `friends` novo pro CONVIDADO e não pra quem convidou, e é
  ali que o time nasce (bug-568). **Ao promover um comando a painel, listar TODO MUNDO cujo
  estado aquela ação muda e conferir se o feed chega em cada um** (aqui: quem convida, quem
  é convidado, quem teve o convite descartado por um aceite alheio).
- **O que a UI mostra pode precisar de estado que o comando nunca precisou:** o `friends` só
  carregava os convites RECEBIDOS (é o que o `/amigos lista` imprime). O painel precisa dos
  ENVIADOS pra dizer "aguardando", senão convidar não muda pixel nenhum. Campo novo entra
  OPCIONAL e tolerante (host antigo → lista vazia).
- **Painel novo = 8 grupos de seletor no `index.html`.** O CSS dos painéis é por ID
  (`#painel, #inventario, #jogadores`), então um painel novo tem de entrar em CADA grupo
  (moldura, h2, h3, button, hover, paisagem baixa, alvo coarse de button e de input) — o que
  se esquece é o `@media (pointer: coarse)`, e aí o alvo de 40px não vale no tablet.
- **Verificação de painel: medir os RÓTULOS DOS BOTÕES, nunca o `innerText` do painel** — o
  rodapé de todo painel deste projeto cita os comandos equivalentes ("pelo chat também dá:
  … /amigos expulsar nome"), então `includes("expulsar")` passa com a tela vazia (bug-569).
  E clique de verificação vai por LINHA (`.jog-row` do fulano), não por rótulo: lista
  ordenada por nome faz o primeiro botão ser de outra pessoa.
- **Barra de UI de toque: botão que não é DE JOGO desce pro menu de pausa, e botão que só
  serve às vezes SÓ APARECE às vezes.** A barra do topo tinha 6 botões fixos em 1024×600 e 3
  não eram de jogo (tela cheia é 1× por sessão, HUD é diagnóstico, varinha só serve a quem
  marca área). Ficou com ☰ 🧱 💬 + 🪄 e 👥 condicionados à proteção de áreas / ao papel. O
  critério que vale pra qualquer botão novo: **é de jogo? aparece. É de sessão ou de
  diagnóstico? menu de pausa. Serve só num modo? nasce escondido.**
- **Toggle que muda o significado de OUTROS botões precisa de sinal nos dois lugares:** a
  varinha destaca o próprio botão (`.ativo`) E renomeia ⛏/▣ pra ① canto 1 / ② canto 2. A
  linha da hotbar já avisava, mas ela fica do outro lado da tela do polegar.
- **Painel aberto ESCONDE a UI de toque** (`updateOverlay` → `touchControls.setShown`), então
  verificação headless que mede a barra depois de abrir um painel mede uma barra VAZIA
  (`offsetParent === null`). Fechar o painel antes é parte da medição.
- **Alvo de dedo que ninguém mediu está errado:** a barra do topo passou a 1ª e a 2ª rodada
  mobile inteiras com 30px porque as medições cobriam hotbar, chat, inventário e painéis — e
  não ela (bug-570). Ao revisar layout de toque, **listar os grupos de elementos tocáveis e
  conferir que TODOS têm uma linha no `tablet-shots.mjs`.**
- **Chrome sem sudo nesta máquina:** o binário está em `~/.cache/puppeteer/chrome/...` mas
  as libs não; `apt-get download libnspr4 libnss3 libasound2t64` + `dpkg-deb -x` num prefixo
  (`~/.local/chrome-libs`) + `LD_LIBRARY_PATH` no spawn resolve (receita do bug-564). O
  `amigos-shot.mjs` já injeta esse prefixo sozinho quando ele existe.
- **`npx openwolf scan` REGENERA o anatomy.md por baixo e ele ENCOLHE** (281 → 182 arquivos
  aqui, −1204 linhas): o scan não vê tudo que o índice acumulou. Ao criar arquivo, editar
  `anatomy.md` + `anatomy-index.json` À MÃO, e nunca aceitar um scan que apaga.

### Streaming de colunas (F2)

- **Config de cliente que o SERVIDOR espelha tem de ser RE-ENVIADA quando muda** (e no
  `reloadWorld`, porque troca de aula é sessão NOVA e o servidor volta ao padrão). Sintoma
  enganoso: diminuir o raio "funciona", só aumentar expõe o bug.
- Cliente e servidor descartam coluna pela MESMA regra (raio + folga) — é o que dispensa
  mensagem de unload.
- **Re-enviar não precisa de caminho paralelo de send:** mexer no ESTADO que decide o envio
  (`st.enviadas.delete`) e deixar o tick seguinte repor.
- **Comando cliente→servidor que dispara TRABALHO precisa de TETO no SERVIDOR**, não só de
  backoff no cliente (o fio vem da rede da escola). Teto mora no `protocol.ts` (é contrato).
- **Varredura periódica do cliente precisa de CARÊNCIA antes do 1º pedido:** streaming é
  gradual, então "não chegou ainda" e "buraco" são indistinguíveis no instante 0.
- **Decode/mesh que joga exceção precisa de try/catch NO LOOP:** a coluna simplesmente não
  entra em `colunasCarregadas` e a varredura a repede — "corrompido" sai de graça de "faltando".
- **Estrutura visual derivada do mundo precisa de TRÊS entradas em mundo lazy:** varredura
  inicial (por chunk), por COLUNA quando ela chega, e descarte quando sai do raio.

### Cliente: UI, input, câmera

- **`input.touchDevice` (APARELHO) × `input.touch` (MODO).** O modo liga e desliga durante a
  partida — o ☰ da barra o zera pra o menu de pausa aparecer, porque `updateOverlay` decide por
  `input.active = locked || touch`. O aparelho é decidido uma vez no boot e **é ele que barra o
  pointer lock**: sem essa separação, o click que sobra de um toque no ☰ atravessa o `#overlay`
  (`pointer-events: none`, de propósito — "só o painel captura clique") e chega no canvas, que
  pede lock e fecha o menu recém-aberto (bug-572). Qualquer botão novo que zere `input.touch`
  cai na mesma armadilha.
- **Painel que RE-RENDERIZA inteiro perde a rolagem e o foco.** `refresh()` → `render()` →
  `replaceChildren()` recria os filhos, então `scrollTop` (e foco de campo) morrem com o
  elemento velho. O `filtroCraft` já guardava o texto pelo mesmo motivo; o `scrollCraft` guarda
  a rolagem (bug-573). **Restaurar `scrollTop` só funciona DEPOIS do append** — em elemento
  fora do DOM não tem efeito.

- **Painéis são AÇÚCAR sobre comandos de chat:** o botão COMPÕE um `/comando`. Validação 100%
  no servidor, zero protocolo novo. Painel nunca decide estado; re-renderiza por broadcast e
  adia enquanto um input DELE tem foco.
- **SEM popups nativos** (prompt/confirm/alert proibidos — e `alert` TRAVA screenshot headless).
- **Suavização é do OLHO, nunca da física:** FOV/altura/step-up usam lerp exponencial
  `1-exp(-dt*k)` (independe do FPS) sobre `camera.position`; a simulação segue determinística.
- **Modificador de movimento precisa de estado ENGATADO no PlayerState**, não lido direto do
  input (senão dá turbo no ar). Engata com `onGround`, desengata ao soltar.
- Config em localStorage com merge DEFENSIVO por campo; teclas por `e.code`. Tecla de SEGURAR
  = entrada em `KeyAction` + default + label; tecla de ATALHO exige também `input.onKey` no
  startGame + entrada na lista do `onSettingsChanged`.
- **Toque só SINTETIZA o input de teclado/mouse** (`input.setKey`, `applyLook`, `press`) — logo
  rebind vale de graça. `input.active` = locked OU touch.
- **UI nova que cubra a tela sem pointer lock entra no `updateOverlay()` E no
  `touchControls.setShown`** — `!input.active` significa "sem lock", não "sem jogo". Quem
  devolve o menu de pausa ao fechar é o callback (o clique É o gesto que o lock exige).
- **Estado client-side indexado por POSIÇÃO entra na limpeza do `reloadWorld`** — mundo novo
  sem aquele conteúdo não manda mensagem nenhuma, e o antigo fica de fantasma.
- Áudio: AudioContext só nasce em GESTO; som disparado por REDE usa `playUiPassive`.
- Overlay de tela cheia (tint submerso) vai em `z-index: 1` — acima do canvas, abaixo de TODA a
  UI. `scene.fog` NÃO pinta o `scene.background`: submerso, quem cobre o céu é o tint DOM.

### Layout de tela pequena (régua: 1024×600 PAISAGEM, Kindle Fire)

- **Duas media queries INDEPENDENTES, nunca um breakpoint só:** `(pointer: coarse)` = alvo de
  dedo (qualquer tamanho); `(max-height: 700px)` = altura curta (vale com mouse). A terceira,
  `(min-width:700px) and (max-height:700px)` = paisagem baixa, é a que mais rende: ali sobra
  largura e falta altura → **alargar** o painel, não quebrar linha em duas.
- **`pointer: coarse` NÃO vem de `mobile:true` no CDP** — quem liga é `Emulation.setEmulatedMedia`.
  Sem isso a verificação headless aprova tudo mentindo.
- **O projeto não tem `box-sizing: border-box` global:** toda regra nova de `max-height` num
  elemento com padding precisa dele junto. **`dvh` sempre com o par `vh` na linha de cima.**
- **Custom property só é visível na subárvore de quem declara** (`--ts` mora no `:root`).
- **Teclado virtual só é mensurável pelo `visualViewport`** (`innerHeight` NÃO muda):
  `innerHeight − visualViewport.height − offsetTop` (o `offsetTop` entra porque o iOS ROLA).

### Perfilação, paralelismo e orçamento

- **`?bench` é como se compara MÁQUINA com máquina.** Trajeto é `pos = f(t)`, NUNCA integração
  por frame (com `pos += v·dt` a máquina lenta percorre menos terreno e ganha FPS de graça), e
  a velocidade é constante FIXA. O bench sobrescreve a config do navegador EM MEMÓRIA — senão
  "o lab está lento" pode ser só raio 12 contra 6.
- **Ruído do instrumento ≈ 1–2%** (duas rodadas na mesma máquina): acima disso é sinal.
  **Primeira rodada de um lote é suspeita** (aquecimento, shader): descartar.
- **`perfil.triangles` e `drawCalls` são SNAPSHOT do frame final, não média — sozinhos não
  fazem A/B (2026-08-08).** Eles oscilam entre DOIS valores fixos (aqui 135366/305 e
  119454/269) conforme o chunk que estava no frustum quando a gravação fechou, e os dois
  valores saem dos DOIS lados. Uma rodada de cada "provou" +11% de geometria que não existia.
  **O invariante é triângulo POR draw call** (452,5 vs 443,8 = mesma geometria por chunk);
  quem mede trabalho de verdade é `remeshWorkerMs` / `remeshPorCaminho`.
- **`remeshPorCaminho` (`fila` / `bloco` / `area`) separa carga de edição** e é o que localiza
  regressão de mesh — mas o `bench-headless.mjs` não o imprime. Dumpar o perfil inteiro:
  `sed 's#^if (perfil) {#... writeFileSync(process.env.LJ_DUMP, JSON.stringify(perfil))#'`
  numa cópia do script. `fila.ms / fila.n` = custo de MAIN THREAD por chunk (extração da
  vizinhança + `BufferGeometry`); `remeshWorkerMs` = o mesher em si.
- **A variável do experimento tem que sair no resultado** — A/B de knob sem o knob gravado no
  perfil só é atribuível pela memória de quem rodou (bug-529).
- **Percentil esconde a FORMA:** exportar histograma junto (p95 igual pode ser bimodal).
- **`p50` colado em 33,3 / 16,7 / 8,3 ms é REFRESH, não gargalo** (modo economia de bateria
  trava em 30 FPS). Conferir o estado da máquina antes de otimizar.
- **Trabalho de render IDÊNTICO ≠ custo idêntico:** contadores de geometria iguais com tempo
  diferente = o gargalo é a MÁQUINA, e greedy meshing não compra nada. **Comparar GPU com o
  frametime é o teste de "é render?"**. Em máquina com folga de VSYNC, FPS e frametime não
  medem custo de render — só `gpu.medioMs`/`p95Ms` respondem.
- **`carga.fasesMs` separa rede de CPU sem instrumentação nova** (`mundo` × `malha`);
  `carga.totalMs` sozinho engana (comparar com `remeshTotalMs`/`remeshCount`).
- **Orçamento de trabalho por frame tem DOIS papéis: fazer e LIMITAR.** Ao paralelizar algo que
  tinha orçamento, listar o que o orçamento limitava ALÉM do tempo — mover o mesher pro Worker
  levou só o primeiro papel e custou FPS 50 → 36. **Fila lenta é um COALESCEDOR**: acelerá-la
  pode aumentar o trabalho total; o dedup precisa cobrir "em voo", não só "na fila".
- **Throttle por FASE, não global** (na tela de carga não há frame a proteger; no jogo há).
- **Assíncrono exige versão por chunk** (resultado que volta depois de descarte/troca/edição vai
  fora) e **o gate da tela de carga é um contrato escondido**: quem lê o tamanho da fila como
  "acabou" tem de somar em-voo + prontos-não-aplicados. Worker que morre travaria a tela pra
  sempre → `onerror` colapsa o pool e segue síncrono.
- **Oversubscription de núcleo aparece na GPU** (a thread do driver também disputa): GPU subindo
  sem a cena mudar = suspeitar de contenção de CPU.
- **Não calibrar knob de paralelismo em headless** — SwiftShader roda a 8–16 fps. Headless
  decide ENCANAMENTO e razões por chunk; número de tuning sai da máquina que dói.

### Verificação e aparato de teste

- **`npm run verify` (typecheck+testes+build) e `npm run smoke` são o caminho oficial.** Metade
  do Do-Not-Repeat deste projeto é sobre o APARATO de teste, não sobre o código.
- **Config do vitest: `vitest.config.ts` na RAIZ reexporta `shared/vitest.config.ts`** (bug-612,
  2026-08-11). Os testes moram todos em `shared/src` e os dois limites que importam
  (`testTimeout: 20000`, `maxWorkers: 8`, calibrados no bug-545 pra mundos de 128³) têm UMA fonte
  só, no shared. A cópia da raiz existe pra `npx vitest run` digitado no diretório do repo não
  cair nos defaults — era esse o bug-612 inteiro.
- **Instabilidade de suíte se mede sob CARGA, com N suítes concorrentes** (`for k in a b c; do
  (npx vitest run > log-$k) & done; wait`). Repetir em série numa máquina ociosa é o método que
  não reproduz. Foi assim que o bug-612 saiu de "não reproduz em 3 rodadas" pra "9 em 9" em uma
  tentativa — e é o mesmo aparato pra conferir o conserto depois (portão de 9 verdes).
- **"Isso já foi feito" merece SONDA, não busca por palavra-chave** (2026-08-11). Três itens do
  `todo.md` dados como prontos precisaram de verificação diferente cada um: a água animada
  apareceu só ao procurar `AGUA_FRAMES` (grep por "anima"/"tooltip" não achava nada, porque o
  nome é outro); a laje exigiu **reverter o fix e ver o teste cair**; e a luz do céu (bug-598)
  precisou de uma sonda de 15 linhas que devolveu 15 × 13 — ela **não** estava consertada. Grep
  vazio não prova ausência e memória de STATUS não prova presença.
- `npm run smoke -- --lista` diz o que cada cenário prova SEM abrir arquivo. Porta própria por
  cenário (8091–8096), a 8080 fica livre pro dev server do usuário.
  `git bisect run npm run smoke -- <nome>` funciona. **`LJ_SEED` fixa o terreno**;
  `LJ_SAVE=cenarios/<aula>.ljw` é seguro (grava a cópia viva em `mundos/`).
- **Teste de perf precisa de TESTEMUNHA DE CORREÇÃO:** uma fila que zera sem produzir geometria
  pareceria vitória enorme. Medir "quanto trabalho SAIU" junto com "quanto tempo levou".
- **Número 100× melhor que o esperado é defeito de MEDIÇÃO, não vitória** (bug-546): worldgen a
  0,02 ms/coluna e cena do bench com 0 triângulo tinham a mesma causa — `createWorld(dims)`
  **aloca tudo por default**, então `colunaGerada` é true e `gerarColunaDeChunks` sai na 1ª
  linha. Mundo lazy de verdade = **`createWorld(dims, false)`**.
- **A/B de dois módulos no MESMO processo mede JIT, não código:** rodando o MESMO código HEAD
  duas vezes seguidas, a varredura levou 591 ms e depois 1512 ms (2,6×). Sempre incluir o
  controle "A × A" antes de acreditar num "A × B" — ou medir em processos separados.
- **Gate que muda de cor com a carga da máquina não é gate** (bug-545): o vitest sem config abre
  1 fork por núcleo (24 aqui) e este projeto GERA MUNDO em quase todo teste. Daí
  `shared/vitest.config.ts` com `maxWorkers: 8` + `testTimeout: 20000` — e a suíte ficou
  verde E mais rápida (92 s → 37 s). Tempo se mede no `?bench`, não no vitest.
- **Verificação headless que precisa LER dado (não olhar pixel) = CDP puro:**
  `--remote-debugging-port` + `fetch /json/list` + WebSocket global do Node + `Runtime.evaluate`
  lendo algo que o cliente publica (`window.__benchPerfil`, `__benchRodando`). Zero dependência.
  Moldes: `scripts/bench-headless.mjs`, `luz-shots.mjs`, `tablet-shots.mjs`.
- **Toda verificação comparativa precisa de âncora ABSOLUTA junto da razão** — "noite/dia <
  0,75" sozinho aprova tela preta (bug-540).
- **Aparência não tem teste unitário, mas tem pergunta binária:** medir `getBoundingClientRect`
  contra a janela, o menor alvo tocável, a intersecção de dois retângulos, a luminância de uma
  janela do quadro. Foi assim que os bugs 538, 539 e 540 apareceram — nenhum visível no código.
- **Convenção de log:** server prefixa `[server]`; client usa tag por subsistema (`[mesh]`,
  `[conn]`, `[streaming]`, `[input]`). É o que transforma investigação em `grep`.
- **A máquina não tem PIL, imagemagick, ffmpeg nem pandoc.** Converter imagem = Chrome do
  puppeteer, com a página em `file://` (de `data:` a origem é opaca e o print sai preto).

### Ambiente, build e campo

- **`rtk proxy "<comando>"` executa cru, sem filtro.** O hook reescreve `grep`/`cat` pra `rtk` e
  a saída volta COMPRIMIDA (nomes de função somem; às vezes só vem "N matches in M files").
  Quando o conteúdo exato importa, usar `rtk proxy`. Não há ferramenta Grep dedicada aqui.
- **`npm run dev:server` NÃO mostra mudança de cliente:** ele serve o cliente COMPILADO. Feature
  de UI em `:8080` exige `npm run build`; loop rápido é `npm run dev` (vite 5173). **Ao entregar
  feature de CLIENTE, dizer QUAL porta testar.**
- Verificação visual sem navegador: chrome headless `--headless=new --no-sandbox --disable-gpu
  --enable-unsafe-swiftshader`. O binário NÃO está no PATH (usar o do cache do puppeteer).
  `openwolf designqc` dá navigation timeout neste app — usar o comando cru.
- Worker de OUTRO workspace no Vite: `new Worker(new URL("../../server/src/worker.ts",
  import.meta.url), { type: "module" })` — sem `?worker`, sem export no package.json.
- Host ws (Node): socket sem handler de `error` derruba o processo; ignorar frames binários de
  subida; `data.toString()` no Buffer. Node 22+ tem WebSocket GLOBAL (smoke com zero deps).
- Canal de HOST do worker: `{hostType}` no MESMO postMessage, filtrado ANTES do protocolo de
  jogo. Quem grava no IndexedDB é o CLIENTE.
- `?server=` pula o menu (screenshot headless e link de LAN dependem disso); `?pin`, `?codigo`,
  `?painel`, `?touch`, `?hud`, `?atlas`, `?bench`, `?hora` completam o boot direto.
- Notebook da escola (Windows 11): PowerShell bloqueia `npm` → `npm.cmd` ou
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`; instrução com `$env:VAR="x";` numa
  linha só.
- **Launcher (`iniciar-servidor.sh/.bat`) — o `git fetch` NÃO é mais bloqueado por sujeira**
  (sessão 44). Arquivo rastreado modificado passou a ser tratado DEPOIS do merge falhar, com
  `git stash push -m "lj-auto"` + merge + aviso de como recuperar (**sem `stash pop`
  automático**: pop que conflita deixa a pasta em conflito no meio da aula; guardado é
  reversível, conflito na hora não). Consequência prática: sujeira em arquivo que a
  atualização **não** toca agora atualiza direto, sem perguntar nada — era esse o caso que o
  guarda antigo pulava em silêncio. **`mundos/` está no `.gitignore` e nada dela é rastreado**
  (só `cenarios/aula*.ljw` viaja no repo), então o merge nunca a alcança; mesmo assim o
  script confere `git diff --name-only HEAD...origin/main -- mundos/` e, se um dia der
  match, pergunta com padrão **NÃO sobrescrever**. Os hints do git ("rode `git rebase`") vão
  pra `2>/dev/null` — não é conversa pra ter com o professor no começo da aula.
- `anatomy.md` auto-update só ADICIONA: ao renomear/apagar, `grep` pelo nome velho e limpar.
- Restrição de assets é de LICENCIAMENTO (§9), não "zero PNG": asset PRÓPRIO ou CC0 é
  permitido. "Tudo procedural no canvas" é ESCOLHA nossa, revisável.

### Receitas (checklists)

- **Bloco cúbico novo (9 lugares, tudo append):** `BlockId` → **`MAX_BLOCK_ID`** ← o esquecido
  (pular faz o bloco aparecer no inventário e o servidor recusar o place) → `TILE` → `paint*` no
  atlas → `BLOCK_TILES` (ícone 2D) → forma no `emitShape` (se não-cubo) → helpers de `blocks.ts`
  (`isFullCube`/`isSolidBlock`/`precisaApoio`/`isReplaceable`) → `blocksUi` (nome PT) →
  `worldgen`. Hotbar, inventário, `/bloco` e `/regiao encher` saem automáticos.
- **Família com estado (aberto/direção/dobradiça): o estado mora NO ID** e o cliente manda só a
  variante base (o copy normaliza).
- **Mensagem servidor→cliente:** union + comentário em `protocol.ts` → `case` defensivo no
  `parseServerMessage` (senão null) → dispatch em `main.ts handleServerData` → emissão via
  `this.send`/`this.broadcast`. **Mas PREFIRA reusar chat/comando** quando é ação de professor.
- **Comando novo:** atualizar a árvore de autocomplete em `client/commands.ts`, senão o Tab não
  oferece.
- **[2026-08-03, §🍖 F4] "O mundo mudou por causa desta mensagem?" é um CONTADOR, não o tamanho
  de `changedThisTick`.** Aquele Set existe pra impedir a MESMA célula mudar duas vezes no
  mesmo tick, então ele dedupe por coordenada: quebrar e recolocar no mesmo tick não move o
  tamanho. O contador certo é `edicoesAplicadas`, monotônico, incrementado dentro do
  `applyBlockQuieto` (o ponto ÚNICO onde o mundo é escrito). Quem cobrar qualquer coisa por
  edição (esforço, item, futuro XP) compara o contador. Ver bug-549.
- **[2026-08-03, §🍖 F4] Um bloco tem BYTE e tem ITEM, e não são o mesmo número.** Porta aberta,
  cama virada, escada de cabeça pra baixo e laje de cima são bytes de mundo; o que o jogador
  guarda é a entrada da HOTBAR (`formaCanonica` em `drops.ts`). Direção e metade saem do olhar
  no `place_block`. Quem for cobrar/creditar item tem de converter — cobrar o byte cru cobraria
  um item que a mochila nunca teve.
- **[2026-08-03] O que o servidor NÃO manda também é informação.** A mensagem `inventario` só
  existe em sobrevivência, e é a AUSÊNCIA dela que diz ao cliente "aqui a paleta é infinita" —
  mesmo desenho do campo `fome` ausente do F3 ("este mundo não tem fome"). Isso evita um campo
  de modo em cada mensagem e faz o cliente antigo degradar pro comportamento certo.
- **[2026-08-03, §🍖 F5] Receita nova é APPEND em `RECEITAS`, nunca no meio.** O índice é a
  identidade da receita no protocolo (`fabricar {receita}`); inserir no meio remapeia o que o
  cliente já conhece, como renumerar `BlockId`. O smoke `_smoke-craft.mjs` fixa os índices em
  constantes — mudar a ordem quebra o smoke, que é o portão certo.
- **[2026-08-05, sessão 45] Bloco novo nasce com RECEITA ou com RAZÃO — o portão é um teste.**
  `receitas.test.ts` varre todo id `isPlaceable`, pula variante (`formaCanonica`) e
  professor-only, e exige que o resto esteja em `RECEITAS` ou em `SEM_RECEITA` (id → razão
  escrita). Foi o pedido do usuário depois do playtest ("faltam os crafts dos itens já
  adicionados") virado em invariante: a cobertura não se mantém sozinha.
- **[2026-08-05, sessão 45] Onde não há forno nem mob, a ponte se INVENTA com material do
  mundo.** Copiar a receita do Minecraft deixaria metade dos blocos inalcançáveis (vidro,
  tijolo, lã e todos os corantes passam por forno ou ovelha lá). Cada ponte usa o que o aluno
  tira com a mão e cabe numa frase de professor: vidro ← areia, lã ← trigo, tijolo ← terra +
  areia, pedra ← 2 pedregulho. E onde dá, a ponte VIRA conteúdo: as 4 cores sem flor própria
  saem de MISTURA (laranja = amarelo + vermelho).
- **[2026-08-05, §🍖 F7] Alcance de PvP se mede entre POSIÇÕES, não pela linha do olhar.** A
  direção do olhar chega a 10 Hz e a caixa do alvo desliza no cliente (lerp), então validar
  mira no servidor recusaria soco legítimo. Quem mira é o cliente (`raycastJogador`, puro); o
  servidor garante que ninguém soca do outro lado do mapa (mesma folga `+2` do `withinReach`).

### [2026-08-06, sessão 53] Um A/B que NÃO derruba nada é resultado do experimento, não do código

Dos seis A/B do `controleJogador.ts`, **dois passaram com a regra desligada** — e os dois eram
defeito meu, não prova de robustez:

1. **Inverter as duas linhas do `correndo`** (engatar antes/depois de desengatar) é INÓCUO: as
   duas guardas são condições OPOSTAS sobre a mesma tecla (`if (bateu(andando))` e
   `if (!andando)`), então a ordem não pode importar. O comentário do teste afirmava o contrário
   — corrigido. **Afirmação falsa.**
2. **Trocar `k = 1 - exp(-dt*20)` por `k = dt*20`** passava porque o teste media o valor FINAL
   depois de meio segundo, e *qualquer* suavização converge se der tempo. Refeito pra medir o
   MEIO da transição (0,1 s), e aí o linear cai. **Teste fraco.**

**A regra:** quando o A/B fica verde, a primeira hipótese não é "o código é robusto" — é "o
experimento está errado". Investigar QUAL das duas antes de seguir.

### [2026-08-06, sessão 53] Refactor mecânico grande: o `tsc` não é controle suficiente

A conversão do `startGame` (1.110 linhas de closure) em `class GameRuntime` passou no `tsc` com
**dois defeitos dentro**: `lookDir` inicializado duas vezes (campo + construtor) e o
`reloadWorld` chamando `applyObjectiveBoxes` pelo ponteiro de MÓDULO (`jogo?.`) em vez de
`this.` — os dois compilam e os dois rodam.

**O que achou foi um diff de LINHAS DE CÓDIGO com `this.` removido**, contando ocorrências dos
dois lados: toda linha que sumiu tem de ter contrapartida na que apareceu. É barato
(~30 linhas de Python) e é a única conferência que enxerga "código duplicado" e "código
perdido" num remanejo que o compilador aceita.

Armadilhas do transform automático que apareceram, todas caçadas pelo `tsc`:
- **template literals** (`` `${world.dims.x}` ``) — se o script trata `` ` `` como string, o
  `${}` de dentro não é transformado;
- **shorthand de objeto** (`{ colunasRecebidas, }`) vira `{ this.x, }`, que é erro de sintaxe;
- **chaves de objeto** (`{ bench: bench.meta() }`) — a chave não pode ganhar `this.`.
  Lookahead de `:` resolve as duas últimas.

### [2026-08-06, sessão 53] Ganchos de módulo `let … | null`: o cheiro é o TIPO, não o número

`main.ts` tinha 16 `let apply* : ((msg: {…}) => void) | null`, e o problema não era a
quantidade — era que **os tipos eram cópias escritas à mão do protocolo**
(`applyBlockChanged` re-declarava `{x,y,z,blockId}`). Um campo novo na mensagem passava
despercebido. Virando métodos de uma classe alcançada por UM ponteiro (`jogo`), as cópias
sumiram junto. E o `started` que morava ao lado dizia exatamente o mesmo que `jogo !== null`.

### [2026-08-06, sessão 54] "A luz não atualiza" era o canal do BLOCO, e o `apagar` sai cedo

`atualizarBloco` faz dois passes (céu e bloco) com a mesma engrenagem, mas só o do CÉU semeava os
6 vizinhos quando a célula ABRE. O do bloco não, e o buraco é invisível até existir um emissor:
quebrar parede opaca cai em `apagar` → `nivel0 === 0` → `return` → fila de reacender VAZIA.
**A regra pra lembrar: todo caminho que torna uma célula transparente precisa semear os vizinhos,
nos DOIS canais** — o `apagar` só devolve semente quando havia luz ali, e parede nunca tem.

### [2026-08-06, sessão 54] Bug de "menu" que na verdade é bug de PONTEIRO

"O Esc fecha o painel e abre o menu de pausa" não tinha nada a ver com o handler do Esc. O menu de
pausa é desenhado por ausência (`!input.active`), e fechar painel pede o pointer lock de volta
dentro da carência do Chrome pós-Esc (bug-585) — o pedido falha e a ausência vira "pausa".
**Estado desenhado por AUSÊNCIA precisa distinguir "não tenho" de "estou pedindo".** É o mesmo
formato do bug-585 (falha silenciosa de pointer lock) visto do lado do desenho.

### [2026-08-06, sessão 54] O teste do cliente que faltava era o de DESKTOP

`shots:toque` cobre a regra dos painéis no aparelho onde pointer lock NÃO existe — e era por isso
que a regra do Esc no teclado estava sem ninguém. `npm run shots:esc` é o par dele: mesmo harness,
sem emulação de toque, com clique real no canvas pra travar o ponteiro. A seção C ("lock recusado
de vez ainda devolve o menu de pausa") existe porque a correção podia esconder o menu pra sempre —
e o A/B mostra que ela pega exatamente isso.

### [2026-08-09, sessão 64] Uma medida só vale se a configuração medida EXECUTA o caminho

O `buildAll` ficou síncrono por três semanas com a justificativa escrita no código: *"no perfil do
lab eles foram 0% do custo — `remeshPorCaminho` acusou 5 267 remesh, TODOS pelo caminho `fila`"*.
A frase é verdadeira e a conclusão é falsa: **aquele perfil é de mundo E**, onde `mundoLazy` é true
e o `buildAll` nunca chega a ser chamado. Medir um caminho numa configuração que não o executa dá
0% **por construção** — não é evidência de que ele é barato, é evidência de que ele não rodou.
Antes de citar um perfil como prova de que algo custa pouco, confira que o cenário do perfil passa
por lá. O sintoma some no lugar mais provável de olhar: `stream.colunas = 0` no mesmo JSON dizia,
o tempo todo, que aquele mundo não tinha streaming nenhum.

### [2026-08-09, sessão 64] Fila que anda 1×/frame faz o tempo de carga ser refém do FPS

Tirar trabalho da main thread não é de graça: `trabalho / (orçamento_ms × fps)`. Trocar o laço
bloqueante do `buildAll` por fila cortou a main thread em 79% (2 096 → 444 ms) **e triplicou o
relógio de parede da carga em SwiftShader** (5,4 → 28 s), porque a 3 fps só há 3 oportunidades de
drenar por segundo. A 60 fps o mesmo código carrega em ~1 s. **A máquina lenta — que é a do
laboratório — é a mais punida por esse desenho**, então o número que decide tem que sair dela.
Dois freios independentes viraram piso de frames e precisaram de valor próprio na carga: o
orçamento em ms (6 → 50) e o `TETO_CHUNKS_POR_FRAME` (64 → 1024). Sobra um terceiro, não mexido:
a profundidade do pool (8 por worker = 32 jobs em voo) limita a ~64 idas e voltas, e cada uma
custa pelo menos um frame.

### [2026-08-10, sessão 66] "Mesma condição que X" quase nunca é a MESMA condição

O pedido "a hotbar some com qualquer menu aberto" virou, na sessão 58, o ESPELHO da condição do
overlay (`toggle("hidden", !A)` com o mesmo `A`). Espelhar deu o oposto do pedido: o overlay some
justamente **porque** o painel abriu (pra não cobrir o painel), então a barra passou a aparecer com
painel, com chat e durante a carga, e a sumir só no menu de pausa — bug-614. **Dois elementos que
reagem aos mesmos estados quase nunca reagem com o mesmo sinal**: quando escrever "a mesma condição
de", montar a tabela verdade dos estados (jogando / painel / chat / carga / pausa) antes de digitar
a expressão, e deixar a tabela no comentário. O comentário certo já estava lá; era o código que
discordava dele.

### [2026-08-10, sessão 66] Guarda de UI colado num callback protege só aquele caminho

O bug-610 (o `/amigos` prendia o mouse) foi consertado no callback de fechar o chat:
`if (!open && !paineis.algumAberto) input.lock()`. Só que **quem pede pointer lock não é só esse
callback** — o `reagendarLock` dispara `pedirLock()` 1,4 s depois de uma recusa, sem passar por
guarda nenhum (bug-613). O sintoma volta por outra porta: recusa dentro da carência do Esc → o
aluno abre a mochila → a tentativa atrasada trava o ponteiro por cima do painel. **Guarda de
política mora no ponto de estrangulamento** (`pedirLock`), não em cada chamador; o `Input` não
conhece painel, então quem conhece INJETA a pergunta (`input.podeTravar = () => …`).

### [2026-08-12, sessão 70] Caixa escura sem `color` própria nasce com texto PRETO — nos dois temas

O bug-622 (contraste do tooltip) parecia "coisa de tablet" e não era. `.tooltip-item` fixava
`background: #0c0e14` e **não declarava `color`**; `html,body` também não declara nenhuma. Como o
tooltip é o único filho direto do `body` com fundo escuro próprio (`document.body.appendChild`,
`client/src/tooltip.ts:65`), ele não herda o `color: #fff` que todo painel da UI traz — cai no
padrão do UA. **E o padrão é preto em light E em dark**: medido com `prefers-color-scheme`
emulado por CDP, `rgb(0,0,0)` nos dois, porque o documento **não declara `color-scheme` em lugar
nenhum** — sem essa declaração o Chrome renderiza a página em light mesmo com o SO no escuro, e
`canvastext` nunca vira branco. Duas regras que saem daí:

1. **Quem fixa `background` fixa `color` na mesma regra.** Fundo herdado + cor herdada é seguro;
   fundo próprio + cor herdada é a combinação que quebra.
2. **Antes de escrever "no tema claro fica X" num comentário, MEÇA** — a intuição "PC escuro,
   tablet claro" estava errada e eu quase deixei a explicação errada no CSS. O teste custa 40
   linhas: chrome headless + `Emulation.setEmulatedMedia` + `getComputedStyle(...).color`.

## Do-Not-Repeat

- [2026-08-17] **`npx vite` rodado da RAIZ do repo SOBE e escuta na 5173, mas serve página
  VAZIA (`curl … | wc -c` = 1).** O dev do cliente é `npm run dev -w client`, ou seja, vite com
  **CWD em `client/`** — a raiz só tem config de `vite build`. Sintoma: sonda headless fica os
  300 s inteiros em `__fotoRodando !== true` com `load-fase` = `…` e parece bug do CLIENTE.
  **Confira o servidor antes da sonda:** `curl -s --max-time 10 http://localhost:5173/ | wc -c`
  tem de dar dezenas de milhares de bytes, não 1.
- [2026-08-17] **`pkill -f "vite --port 5173"` MATA O PRÓPRIO SHELL do Bash** (a linha de
  comando do shell contém o padrão, então o pkill casa consigo mesmo) — a chamada volta com
  exit 144 e o comando seguinte some junto. Use classe de caractere: `pkill -f
  "[v]ite --port 5173"`.
- [2026-08-15] **Foto que vira FACE DE CUBO se tira com FOV 90 e aspect 1 — ponto.** Não é "o
  mesmo FOV do jogo", não é "o mesmo FOV da câmera do menu". Do centro do cubo cada face
  ocupa exatos 90°×90°; qualquer outro FOV de captura estica a textura na face e deixa um vão
  na aresta (com 75 sobra 15° e o horizonte PULA na quina). O FOV de VISUALIZAÇÃO do menu é
  independente e pode ser o que se quiser. Conferir na foto: com pitch=0 o horizonte tem que
  cair exatamente na metade vertical. Guarda no `fundo-shots.mjs` via `window.__fotoCam()`
  (bug-623).
- [2026-08-12] **Não atribuir diferença de aparência a "tema do aparelho" enquanto o documento
  não declarar `color-scheme`.** Sem essa declaração o navegador renderiza em light sempre, e o
  padrão de texto é preto nos dois esquemas (medido, bug-622). Se a queixa chega de um aparelho
  só, o mais provável é que o defeito esteja em TODOS e só ali alguém tenha lido de perto.
- [2026-08-11] **NUNCA pôr acento ou emoji no `iniciar-servidor.bat`** — nem em comentário `REM`.
  Quebra a rodada inteira no `cmd.exe` (bug-621, e foi a escola que descobriu). Escrever
  `ATENCAO`, `voce`, `nao`, `atualizacao`. O `npm run check:launchers` recusa, mas a regra vem
  antes do portão. **No `.sh` acento é livre** — o problema é só do `cmd`.
- [2026-08-11] **Não "verificar" um script gerando um driver redigitado.** Fatiar os BYTES do
  arquivo real (`open(...,"rb")`, `b.index(...)`) e preservar o terminador de linha dele. Duas
  vezes numa sessão isso deu problema: a extração por `src.index(":rotulo")` pegou a linha do
  `call` e rodou o launcher inteiro 3×, e a matriz do bug-620 rodou em CRLF quando o arquivo
  ships em LF.
- [2026-08-11] **`echo ==>` em batch é REDIRECIONAMENTO, não texto** — `echo   ==> VIA=PACOTE`
  cria um arquivo chamado `VIA` e não imprime nada. Custou uma rodada de matriz inteira lida como
  "nenhum caso decidiu". Mesma armadilha: `set X=valor && cmd` grava `valor ` **com espaço no
  fim**, e o `if /i "%X%"=="valor"` dá falso.

- [2026-08-11] **Extrair sub-rotina de `.bat` procurando `src.index(":rotulo")` pega a linha do
  `call :rotulo`, não o RÓTULO** — o "driver de teste" virou uma cópia do launcher inteiro, que
  rodou **três vezes** e deixou um `node_modules` em `C:\lj-tmp`. Casar a linha inteira
  (`l.strip() == ":rotulo"`), e conferir o começo do arquivo gerado antes de executar qualquer
  coisa copiada pro lado do Windows.

- [2026-08-11] **LER O NÚMERO DO TIMEOUT antes de teorizar sobre teste instável.** O bug-612
  passou duas sessões como "contenção de recurso / OOM / baseline de 3 falhas" e a resposta
  estava impressa na própria falha: `Test timed out in **5000**ms`. O projeto configura
  **20000**. Um timeout que não é o configurado quer dizer **config não aplicada** — não vale
  investigar carga, `maxWorkers` nem heap antes de conferir isso. Vale pra qualquer ferramenta
  com config por diretório.
- [2026-08-11] **`npx vitest run` da RAIZ não é o mesmo portão que `npm test`.** `npm test` é
  `npm run test -w shared` (CWD = `shared/`), e era só assim que a `shared/vitest.config.ts`
  entrava. Da raiz o vitest **coleta os mesmos 45 arquivos / 814 testes** — por isso ninguém
  percebia — mas com os defaults (5 s de timeout, 1 fork por núcleo). Consertado em 2026-08-11
  com um `vitest.config.ts` na raiz reexportando o do shared; se algum dia ele sumir, o sorteio
  volta. **Nunca comparar rodada da raiz com rodada de `npm test` sem checar qual config valeu.**
- [2026-08-11] **Suíte que só falha "às vezes" tem de ser medida SOB PRESSÃO, não repetida à
  toa.** 6 rodadas sequenciais em máquina ociosa deram 814/814 e não provaram nada; **3 suítes
  completas concorrentes** deram 9 vermelhas em 9 na primeira tentativa. Rodar N vezes em série
  é o jeito caro de não reproduzir — a variável é a carga, então crie a carga.
- ~~[2026-08-10] "3 falhas de worldgen = baseline"~~ — **MORTA em 2026-08-11**: era o bug-612,
  consertado. A suíte é 814/814 em qualquer caminho, com ou sem carga. Qualquer vermelho agora é
  vermelho de verdade; não existe mais falha "esperada" pra descontar.
  Rodar com `--reporter=json --outputFile=…` — a saída de texto do vitest via rtk é truncada e
  o `tail` esconde justamente a linha de contagem.
- [2026-08-10] **Sonda de `pointermove` por CDP no headless PARA de ser entregue depois de dois
  ou três `Input.dispatchMouseEvent` seguidos.** Medido: o evento congela em (378,437) enquanto
  o script continua mandando 105 e 140. Asserção ancorada na última coordenada que o SCRIPT
  disparou falha por motivo errado; ancorar no último `pointermove` que o NAVEGADOR entregou
  (guardado num `window.__pm` por um listener próprio) e comparar o elemento contra ele.
- [2026-08-08] **PERF medida no vite DEV MENTE — o número vale no `dist` compilado, e só nele.**
  Bissectando o bug-607 em vite dev, `e58814a` (um refactor NO-OP: `FOLGA_DESCARTE` é 2, igual
  ao `+2` que estava digitado) apareceu como **+37% de main thread por chunk**, reproduzível em
  8 rodadas e isolado até o arquivo. **No `dist` a diferença é ZERO** (0,165–0,172 dos dois
  lados): dev serve ESM não-bundleado, e a chamada que atravessa módulo não é inlinada pelo V8;
  o rollup junta tudo e o custo some. Bissecção em dev serve pra ORDENAR suspeitos rápido —
  **confirmar exige `npm run build` e servir `client/dist`**, que é o que o launcher entrega.
  Os dists antigos estão VERSIONADOS: `git worktree` + `python3 -m http.server` na pasta
  `client/dist` do commit velho dá A/B de binário sem rebuildar nada.
- [2026-08-08] **`npm run smoke` usa as portas 8091–8096.** Deixar um servidor de A/B em 8091/
  8092 derruba os smokes `mundo` e `kicar` com 13 falhas cujo texto não tem NADA a ver com a
  mudança em teste ("ana recebeu `kicked`…"). Liberar as portas antes: `fuser -k 8091/tcp`.
- [2026-08-09] **CORREÇÃO DA LINHA ACIMA: a faixa dos smokes vai até 8109, não 8096.**
  `grep -n "porta:" scripts/smoke.mjs` lista 8091–8105, 8107 e 8109; o cenário `modo` usa
  **8098 e 8099**. Escolhi 8098/8099 pro A/B de dist justamente por "estarem fora de 8091–8096"
  e derrubei o `modo` com **19 asserções**, todas do primeiro ✗ em diante ("ana entrou em
  criativo (recebeu 0 msg de modo)") — texto que não sugere porta nenhuma, e o smoke falha
  IGUAL isolado, então a flakiness não é pista. Servidor local de A/B: use 5173 ou 8181+, e
  confira com `ss -ltn` antes. Os `shots:*` do jogo (f10 8111, toque 8108, esc 8141) também
  moram por ali.
- [2026-08-09] **`npm run shots:luz` NÃO sobe servidor — ele espera algo na 5173.** Diferente do
  f10/toque/esc, que servem `client/dist` pela própria porta de jogo. Sem servidor ele não
  falha: imprime `t=0s …`, `t=15s …` até o teto de 180 s **por cena**, com o log do Bash em
  background VAZIO (buffer), e parece travado. Subir antes:
  `cd client/dist && python3 -m http.server 5173 --bind 127.0.0.1`.
- [2026-08-09] **Os 8 scripts de `shots:*` sondam prontidão por `#hotbar .slot`, que aparece
  ANTES de a tela de carga sair.** A hotbar nasce no `startGame`; a `#load-tela` só some quando
  o mundo está montado. Enquanto o mundo denso fechava a tela na hora isso empatava — no dia em
  que ele passou a esperar a malha (bug-608), os scripts passaram a clicar e medir POR BAIXO da
  tela de carga, e o `shots:toque` acusou 3 ✗ na seção A ("a barra de toque está na tela antes
  do ☰") sem nada a ver com a mudança. A sonda certa pede as duas coisas:
  `!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`.
- [2026-08-08] **`pkill -f "vite --port 5174"` mata o PRÓPRIO script** (o padrão casa com a
  linha de comando do bash que o contém) — sai com exit 144 e o resto do script nunca roda.
  Matar pelo DONO DA PORTA: `fuser -k 5174/tcp`.
- [2026-08-08] **`CHUNK_SIZE` mora em `constants.ts`, NÃO em `world.ts`.** Num `.mts` de
  scratchpad o import errado vira `undefined` calado, `x0`/`x1` viram `NaN`, o laço não executa
  nenhuma vez e o censo sai `{}` com **exit 0** — parece "não há diferença". É a mesma armadilha
  do `node --import tsx` não checar tipo (2026-08-06): num script de medição, **afirmar o que
  se importou** (`if (typeof X !== "number") throw`) custa uma linha.
- [2026-08-06] **Bissectar com `git stash` num script de print EXIGE `npm run build` no meio.**
  O `shots:f10` e o `shots:toque` servem `client/dist` — o cliente COMPILADO. Stashar o fonte
  e rodar o script mede o binário VELHO: a primeira bissecção do bug-591 deu falso negativo
  (as duas versões "falharam") justamente por isso. `shots:luz` é o oposto: roda no vite, então
  lê o fonte na hora.
- [2026-08-06] **Antes de culpar o próprio commit por falha em script de print, rode DE NOVO.**
  O `shots:f10` falhou 2 vezes em ~8 com as MESMAS 4 asserções, e a matriz pass/fail cruzou as
  duas versões do código — era corrida de servidor (bug-593), não regressão. A conclusão só sai
  da matriz; uma rodada não decide nada.
- [2026-08-06] **A/B de CORRIDA precisa de encenação, não de repetição.** Rodar o teste 2× com a
  guarda desligada não reproduziu o bug-593. O que provou foi injetar no servidor a mensagem em
  voo, na ORDEM certa (antes de tratar o pedido de fechar). A primeira tentativa injetou DEPOIS
  da confirmação e "falhou dos dois lados" — sem valor nenhum. **Numa corrida, a ordem da
  encenação É o experimento.**

- [2026-08-06] **`npm run shots:luz` NÃO sobe o dev server — ele espera um `:5173` já de pé.**
  O `shots:f10`, o `shots:toque` e o `shots:amigos` sobem host + chrome próprios; o
  `luz-shots.mjs` só sobe o CHROME e navega pra `http://localhost:5173/?bench=…`. Sem o vite
  no ar ele fica 180 s em `t=…s` esperando `window.__benchRodando` e morre no `timeout` —
  **e com pipe pra `tail` não sai NADA** (o do-not-repeat do stdout bufferizado, de novo).
  Subir antes com `nohup npx vite --port 5173 --strictPort client > log 2>&1 &`, conferir com
  `ss -tln`, e matar depois.
- [2026-08-06] **`npx tsc` passa pelo rtk e pode devolver erro CACHEADO que não existe**
  (bug-586): `npx tsc --noEmit` em `client/` acusou 2 erros em `vitals.ts` que o binário cru
  (`./node_modules/.bin/tsc --noEmit -p client`, exit 0, saída vazia) não vê. Cheguei a rodar
  `git stash` pra bissectar um erro inexistente. **Conferir typecheck pelo binário direto ou
  por `npm run typecheck`** — mesma família do do-not-repeat do `git status` (2026-07-11).

<!-- Cada entrada impede o mesmo erro de voltar. Narrativa completa: .wolf/history.md -->

### Autoria de teste e de smoke

- **[2026-08-10, sessão 66] Smoke que abre vários clientes EM PARALELO não pode afirmar ordem de
  jogador.** O `/grupo criar` distribui em round-robin sobre `[...ses.players.values()]` — ordem
  de INSERÇÃO do Map, ou seja, ordem em que cada join foi aceito. O `_smoke-atividade` abria os
  três WebSocket de uma vez e afirmava `ana→g1, bia→g2`: 1 rodada em 3 da suíte a bia chegava
  primeiro (bug-595, aberto desde a sessão 53). **O servidor estava certo o tempo todo.** Se a
  ordem importa, SERIALIZE o join (esperar a 1ª mensagem do host, que só vem depois do registro) e
  escreva a ordem na própria mensagem da asserção; se não importa, afirme o conjunto.
- **[2026-08-10, sessão 66] Resumo de bateria tem de sobreviver ao `| tail`.** O `smoke.mjs` já
  imprimia a saída completa da falha — mas ANTES do resumo, e todo mundo lê a bateria pelo fim.
  O que sobrava na tela era "atividade falhou", sem asserção nenhuma, e foi por isso que o bug-595
  passou **um mês** com `root_cause` vazio. Com as linhas ✗ repetidas DEPOIS do resumo, a rodada
  vermelha disse `[atividade] ✗ ana→g1, bia→g2` e a causa saiu em minutos. **Quem escreve runner
  decide o que o próximo vai conseguir depurar.**
- **[2026-08-10, sessão 66] Em shot headless, seção NOVA custa transição de pointer lock — meça
  DENTRO de uma seção que já segura o ponteiro.** A verificação da hotbar (bug-614) nasceu como
  seção B4 própria, e cada `Esc`/`voltar ao jogo` que ela precisou gastou a carência do Chrome:
  numa rodada o chat não abriu e "✓ a hotbar sumiu com o chat aberto" passou **com o chat
  FECHADO**; na outra a mochila não abriu e ainda derrubou a seção C, que herdava o estado. Movida
  pra dentro das seções A e B2 (que já provaram lock na mão), custou ZERO transição e ficou
  estável. E toda asserção de "sumiu" tem de exigir a causa na tela
  (`ok(chatAberto && sobChat.escondida, …)`) — senão ela passa por AUSÊNCIA.
- **[2026-08-10, sessão 66] Sonda que conta chamada de `requestPointerLock` conta 2 por
  tentativa.** `pedirLock()` chama `requestPointerLock({unadjustedMovement:true})` e, no `catch`,
  a forma antiga — uma tentativa lógica são duas chamadas. Ao ler `pedidos=2`, é UMA tentativa.
  Carimbe o instante (`performance.now() - t0`): o caminho do comando aparece em <50 ms, a
  tentativa atrasada do `reagendarLock` aparece ~600-1400 ms depois. Sem o carimbo não dá pra
  dizer QUEM pediu, e a sonda vira acusação sem réu.
- **[2026-08-06, sessão 48] Drop que virou SORTEIO derruba teste puro E smoke, e os dois se
  consertam de jeitos DIFERENTES.** A semente da colheita passou de 1 fixo pra 1–3 e quebrou 4
  asserções puras + 1 smoke (bug-583). No teste puro o `sorteio` é injetável: use as duas
  PONTAS (`() => 0` e `() => 0.99999`) e compare com as constantes exportadas
  (`SEMENTES_MIN`/`SEMENTES_MAX`), nunca com literais. No smoke **não há injeção** — o servidor
  usa o `Math.random` de verdade —, então a asserção tem de ser FAIXA (`n >= 3 && n <= 5`) com a
  conta escrita no comentário; número fixo ali reprova por sorte numa rodada em cinco.
  **Ao tornar qualquer drop aleatório, exporte MIN/MAX antes de escrever o primeiro teste.**
- **[2026-08-05, sessão 46] Asserção de smoke não pode correr contra o TICK.** O
  `_smoke-fornalha` conferia a tábua NO SLOT de combustível 350 ms depois de a pôr lá — e a
  fornalha acende no 1º tick com entrada + combustível, consumindo a única unidade (bug-577,
  a família do 560/574/575). Confira FATO ESTÁVEL (a tábua saiu da mochila), e deixe o efeito
  do tick pra asserção seguinte.
- **[2026-08-05, sessão 46] Transferência pra slot OCUPADO é TROCA, não empurrão.** O smoke
  esvaziava a fornalha mandando pro slot 1 da mochila, que tinha a picareta — o pedregulho saía
  e a picareta ENTRAVA na fornalha, que continuava cheia e (com razão) recusava a quebra
  (bug-579). Destino de transferência em smoke tem de ser slot comprovadamente vazio, e vale
  assertar que a origem ficou vazia antes de seguir.
- **[2026-08-05, sessão 46] Teste que passa com o patch REMOVIDO não prova nada — e o caso mais
  traiçoeiro é o estado que coincide.** "A fornalha apagou" e "a fornalha nunca acendeu" dão o
  MESMO byte; "o painel fechado não recebe mensagem" e "o tick não manda nada" dão a MESMA
  lista vazia. Os dois testes passavam com `tickFornalhas()` comentado. O conserto é o
  CONTROLE POSITIVO no meio do teste: prove que aconteceu antes de provar que parou.

### Ferramentas e ambiente

- **[2026-08-10, sessão 66] Os scripts de shot deixam CHROME ÓRFÃO vivo, e ele sobrevive à
  sessão.** Achados dois headless de `shots:luz` de **09/08 com 1 dia e 1h30 de vida**, ~420 MB de
  RSS somados, ainda escutando 9334/9357. Isso é candidato direto à contenção que faz o bug-612
  (3 testes de worldgen falhando só na suíte cheia, `STACK_TRACE_ERROR` sem mensagem). **Antes de
  medir qualquer coisa — suíte, bench ou shot — rodar `pgrep -af "chrome-linux64/chrome
  --headless"` e `ss -ltnp | grep 9[0-9][0-9][0-9]`**, e matar o que sobrou. Vale também pros
  servidores de A/B (do-not-repeat das portas 8090-8141).
- **[2026-08-10, sessão 66] `pgrep -f <padrão>` se AUTO-CASA quando o padrão está na linha de
  comando do bash que o chama** — `until ! pgrep -f "tablet-shots"; do sleep 5; done` nunca sai,
  porque o próprio `bash -c` carrega a string. Usar a classe de um caractere: `pgrep -f
  "[t]ablet-shots"`. E `cmd | grep …` redirecionado pra arquivo **segura a saída inteira até o
  fim** (o grep bufferiza fora de TTY): pra acompanhar script longo, redirecionar o script CRU e
  filtrar na leitura.
- **[2026-08-04, sessão 44] Gesto de TOQUE só se testa com `Input.dispatchTouchEvent` do CDP.**
  O `dispatchEvent(new PointerEvent(...))` do `tablet-shots.mjs` dispara o handler e NÃO gera o
  `click` de compatibilidade — e era o click que carregava o bug-572 (atravessa o `#overlay`
  `pointer-events: none` e chega no canvas). Quem gera a sequência inteira é o Chrome.
  Três armadilhas do harness, todas pagas nesta sessão: (1) **`cdp()` sem TETO trava mudo** —
  a página trava sob swiftshader de vez em quando, a Promise fica pendente pra sempre e o
  script parece estar trabalhando; (2) **stdout do node BUFFERIZA fora de TTY** — script morto
  no meio não deixa rastro do que já mediu, use `process.stdout.write`; (3) **host `detached`
  sobrevive ao `timeout`** e segura a porta na próxima rodada (`EADDRINUSE`). E o
  `tablet-shots.mjs` **não roda nesta máquina**: falta o `LD_LIBRARY_PATH` do bug-564 que só o
  `amigos-shot.mjs` tem.
- **[2026-08-04, sessão 44] Pointer lock em headless é FLAKY — conte o PEDIDO, não a
  concessão.** O mesmo build passou numa rodada e falhou na outra olhando
  `document.pointerLockElement`. Monkey-patch em `HTMLCanvasElement.prototype.requestPointerLock`
  contando chamadas é determinístico, e é exatamente o que o fix promete (o tablet nem pede).
- **[2026-08-04, sessão 44] Visibilidade de elemento `position: fixed`: `checkVisibility()`.**
  `#touch-topo` é fixed e quem o esconde é o PAI (`#touch-ui.hidden`); o computed style do
  filho segue dizendo `flex` e `offsetParent` é null mesmo visível. As duas medidas ingênuas
  mentem em direções opostas.
- **[2026-08-04, sessão 44] Testar o `.bat` no cmd.exe: resposta vai por PIPE de um `.cmd`,
  NUNCA por `< arquivo`.** O `chcp 65001` da 1ª linha do `iniciar-servidor.bat` faz o `set /p`
  ler **VAZIO** de stdin redirecionado (provado com mini-repro A/B: sem `chcp` lê `s`, com
  `chcp` lê nada). Como vazio é o padrão de toda pergunta do script, os 4 cenários pareciam
  verdes exercitando **só os padrões**, e o único com resposta não-vazia falhou em silêncio
  (bug-571 — é o bug-569 de novo: verde sobre estado errado). `(echo s&echo.)` também não
  serve: entrega `"s "` **com espaço** e nenhum `if /i "%VAR%"=="s"` casa. O que funciona:
  um `resp.cmd` com um `echo` por linha, `call resp.cmd | iniciar-servidor.bat`. O PATH do
  WSL também não serve pro cmd — montar um explícito no wrapper (`System32` + `Program
  Files\Git\cmd` + o stub).
- **[2026-08-04, sessão 43] NÃO rodar `npx openwolf scan` pra "atualizar o anatomy".** Ele
  reescreve o arquivo com o que ELE enxerga (182 arquivos contra os 281 indexados) e apaga
  1204 linhas de descrição acumulada. `git checkout .wolf/anatomy.md .wolf/anatomy-index.json`
  desfaz. Arquivo novo entra à mão nos dois (a entrada JSON aceita `symbols` opcional).
- **[2026-08-04, sessão 42] A linha do diário TEM de começar com `| HH:MM |` de verdade.**
  Escrevi `| --:-- |` por não saber a hora e o hook do `stop` avisou "no semantic summary"
  mesmo com a linha lá: `countSemanticEntries` (`.wolf/hooks/shared.js:630`) casa
  `^\|\s*(\d{1,2}:\d{2}|\d{4}-\d{2}-\d{2})[^|]*\|` — sem dígito na hora, a linha conta como
  mecânica. `date +%H:%M` antes de escrever.
- **[2026-08-04, sessão 41] NÃO aceitar "passou" de um teste sem rodar o CONTROLE NEGATIVO.**
  A verificação da culagem de wireframe passou duas vezes com o patch REMOVIDO — na 1ª porque
  a região de teste estava fora dos limites do mundo (nunca foi criada), na 2ª porque o mundo
  era denso e o frustum do three.js já cortava. Um "✓" que aparece igual com e sem a mudança
  não prova nada. Sempre que a asserção for "o número não sobe", rodar o par
  `git stash push <arquivos do patch>` / rodar / `git stash pop` — e **de dentro do repo ou
  com `git -C`**: um `cd` no subshell fez o stash falhar em silêncio e as duas metades do A/B
  saíram idênticas.
- **[2026-08-04, sessão 41] Medida de layout: comparar ALTURA, não `top`.** `.painel-row` usa
  `align-items: center`, então subir o alvo de toque de um filho já desalinha os topos sem
  quebrar linha nenhuma (bug-565). Linha que não quebrou tem a altura do filho mais alto.
- **[2026-08-03, sessão 37] Os hooks do OpenWolf são CÓDIGO DO REPO (`.wolf/hooks/*.js`,
  rastreados) — conserte-os em vez de contornar.** Os três falso-positivos que a sessão 36
  documentou (aviso de resumo semântico, de buglog e a linha "Session end" repetida) viraram
  bug-554/555/556 e estão corrigidos ali, com regressão em `.wolf/hooks/_test-hooks.mjs`
  (`node .wolf/hooks/_test-hooks.mjs`, 10/10 — roda o `stop.js` de verdade numa fixture de
  `/tmp`). **Os contornos que valiam antes estão MORTOS:** já dá pra escrever o `buglog.json`
  por `python3`/`cat` no Bash (o hook agora olha o mtime), e não é mais preciso pôr prefixo de
  data na linha do diário quando a sessão atravessa a meia-noite (o contador não compara data
  nenhuma — conta abaixo do último `## Session:`).
- **[2026-08-03] O pacote `openwolf` traz DUAS cópias dos hooks e a scaffolding instala a
  ERRADA.** `dist/hooks/` é o build do `tsconfig.hooks.json` (onde o PR #64 entrou) e
  `dist/src/hooks/` é o do tsc principal (sem o fix); o `copyHookScripts` do
  `dist/src/cli/init.js` procura nessa ordem e a segunda vence. **Consequência prática: um fix
  upstream pode estar no pacote e nunca chegar ao projeto** — depois de `openwolf init/update`,
  conferir com `diff .wolf/hooks/shared.js <pacote>/dist/src/hooks/shared.js`. O patch local
  vive nas duas cópias do pacote global (com `.bak-pre-fix`) e **`pnpm update -g openwolf` o
  apaga**; a fonte de verdade é `.wolf/hooks/` do repo.

### Código e arquitetura

- **[2026-08-06, sessão 48] DUAS listas do mesmo conjunto é um bug esperando a próxima feature.**
  `precisaApoio` (blocks.ts) dizia QUEM precisa de chão e o `rulesMap` (rules.ts) REGISTRAVA a
  regra do tick — duas listas de faixas de id escritas à mão. Esquecer a segunda não quebra
  nada: o bloco só fica FLUTUANDO. Custou o capim na sessão 36 (bug-558) e, dois meses depois,
  o algodão inteiro — 5 ids que o F10c pôs numa lista e não na outra (bug-581). A cura é
  DERIVAR uma da outra (`for id … if (precisaApoio(id)) rulesMap.set(id, torchRule)`) e pôr um
  teste-portão que varre `0..MAX_BLOCK_ID` cobrando a coerência. **Sempre que uma feature exigir
  tocar em duas listas pra funcionar, uma delas está sobrando.**
- **[2026-08-06, sessão 48] `remover` do inventário é TUDO OU NADA — pedir mais do que existe
  devolve ZERO, não o parcial.** O laço novo do `Ingrediente.ou` pedia o custo inteiro de cada
  alternativa, então "1 carvão + 1 vegetal" pra um custo de 2 não pagava nada e a receita
  parecia impossível com os ingredientes na mão (bug-584). Quem soma fontes tem de pedir
  `Math.min(falta, contar(inv, id))` de cada uma.
- **[2026-08-06, sessão 48] `preventDefault` de `contextmenu` no CANVAS cobre justamente o caso
  em que ele não é preciso.** Com pointer lock o navegador nem abre o menu; o problema mora
  quando o ponteiro está SOLTO (painel aberto), e aí o alvo do evento é o painel (bug-582).
  Handler de "o navegador não manda aqui" pertence ao `document`, com isenção pra campo de
  texto.
- **[2026-08-05, sessão 47] Meta POR POSIÇÃO tem de ser limpo quando o TIPO muda, não só quando
  o bloco deixa de ter meta.** O `applyBlockQuieto` apagava o container da célula com
  `if (containerTipoDe(blockId) === null)` — trocar fornalha por baú passa nesse teste e o
  conteúdo da fornalha SOBREVIVIA, então o `use_block` seguinte respondia "fornalha, 3 slots,
  com barra de fogo" em cima de um baú (bug-580). O guarda certo compara o tipo do byte VELHO
  (lido ANTES do `setBlock`) com o do novo: apagada↔acesa é o mesmo tipo e fica de fora,
  container novo nasce sempre limpo. **Vale pro quadro e pra qualquer meta futura por posição.**
- **[2026-08-05, sessão 47] O teste que denuncia isso é `/bloco` do professor**, e não o
  caminho do aluno: quebrar container com coisa dentro é RECUSADO, então pelo fio normal o meta
  órfão nunca aparece. **Toda invariante mantida por um gate merece um teste pelo caminho que
  NÃO passa pelo gate.**
- **[2026-08-03] Parâmetro de inspeção (`?vida=`, `?hora=`, `?mochila=`) tem de VENCER a rede,
  não só preencher no boot.** O `?mochila=` nasceu só preenchendo, e o `modo criativo` que TODO
  join manda (envio incondicional do F1) apagava tudo antes do print — o parâmetro só teria
  funcionado no mundo em que já não era preciso. Todo `?param` novo precisa de uma trava que
  transforme o handler da mensagem correspondente em no-op (bug-553).
- **[2026-08-03] "Mochila cheia" é por PILHA e por ID, não por slot.** Encher 27 slots de areia
  não impede um pedregulho de entrar se existir pilha PARCIAL de pedregulho. Cenário de
  inventário cheio tem de completar as parciais até o teto e conferir a soma
  (`INV_SLOTS * STACK_MAX`) — o smoke do F4 passou a fazer isso (bug-552).
- **[2026-07-25] Forma PARCIAL exige resolução por SUB-CAIXA nos 3 eixos.** `collisionBoxes`
  passou a alimentar a física, mas o `moveAxis` horizontal continuou encostando na fronteira da
  CÉLULA — o degrau de meia pegada jogava o jogador ~0,65 bloco PRA TRÁS (bug-512, achado em
  playtest, não pelos testes). Ao dar forma parcial a um bloco, revisar TODAS as resoluções
  (Y **e** X/Z). Teste bom aqui é de TRAJETÓRIA ("nunca recua no eixo do movimento").
  ⚠️ Um teste antigo passava POR CAUSA do bug — teste que depende do bug é falso-verde.
- **[2026-07-25] Translucidez = material com blend, NUNCA dither no atlas.** Cutout serve pra
  RECORTE (folha, flor, moldura); pra meia-transparência vira "tela de mosquiteiro" (reprovado
  em playtest). Padrão certo: grupo de índices próprio + `transparent/opacity/depthWrite:false`.
- **[2026-07-26] Constante de gen fazendo DOIS trabalhos quebra o bioma no dia que ela muda.**
  `SAND_HEIGHT` era a linha de praia E o gate do mandacaru; amarrar praia ao mar tirou TODOS os
  cactos da caatinga baixa (bug-210). Reescrever o gate na intenção REAL ("cacto não nasce
  molhado" = `h > NIVEL_MAR`), não pendurá-lo na constante.
  ⚠️ De quebra: `expect(n).toBeGreaterThan(0)` que passa por 2 unidades é falso-verde esperando
  acontecer — conferir a ORDEM DE GRANDEZA esperada, não só "> 0".
- **[2026-07-26] Orçamento de trabalho por frame é em TEMPO, não em contagem.** 8 chunks/frame
  custavam de 1 a 24 ms (0,1–3 ms por chunk) — origem direta dos frames >50 ms. Virou
  `meshMsPorFrame`, com teto duro e garantia de PELO MENOS 1 por frame (orçamento apertado não
  pode significar fila parada). Renomear o setting foi de propósito: o valor salvo antigo seria
  lido como ms e mentiria.
- **[2026-07-26] Campo novo em struct alimentada POR FRAME tem de entrar em TODA chamada.**
  `hud.setRemesh` SUBSTITUI o objeto; adicionei `porCaminho` só na chamada do boot e o frame
  seguinte apagava (bug-524). Typecheck não pega (campo opcional). `grep` por todas as chamadas
  — ou fazer o setter MESCLAR.
- **[2026-07-26] Varredura de mundo é POR CHUNK, nunca por bloco.** `TorchGlow.setFromWorld`
  varria célula a célula: mundo E = 1,887 bilhão de células = **41,4 s de main thread travada**
  ("página não está respondendo", bug-523). Por chunk (ausente sai em O(1)): **2,9 ms**.
  ⚠️ Sintoma num perfil: `longTasksMsTotal` quase IGUAL em sessões de duração bem diferente =
  é sempre a MESMA trava, não regime.
- **[2026-07-26] Troca de aula (cp19) é SESSÃO NOVA:** todo estado por-jogador do servidor volta
  ao padrão. O raio que o cliente anunciou morre com a sessão velha e o mundo fica cortado no
  anel 6 (bug-518). **Estado que o CLIENTE anuncia tem de ser reenviado no `reloadWorld`, não
  só no `connect`.** Mesma família: trabalho caro guardado por `if (!mundoLazy)` no `startGame`
  precisa do MESMO guarda no `trocarMundo` (bug-517: `buildAll` em mundo lazy = ~19 s de trava).
- **[2026-07-26] Tela de espera sobe no COMANDO, não no resultado** (bug-520): quando o
  trabalho é do SERVIDOR, ele avisa que começou — não dá pra inferir no cliente. E não basta
  abrir: segurar as mensagens por **2× rAF** (com `setTimeout` de segurança, porque aba em
  segundo plano não roda rAF) é o que faz a tela PINTAR antes do trabalho pesado.
- **[2026-07-30] Multiplicador de terreno com rampa ESTREITA = penhasco** (bug-544): o gradiente
  do fator × a amplitude da serra (88 blocos) é o degrau. Regra de bolso: pra degrau ≤ 6 com
  amplitude 88, o fator não pode variar mais de ~0,07 por bloco — e o campo de clima
  (célula ~80) já entrega 0,019/bloco, então rampa de meia-largura < 0,2 estoura sozinha.
  **Suavidade de fronteira se MEDE (degrau máx entre colunas vizinhas), não se estima** — e a
  régua certa é PARIDADE com o que existia antes (o heightmap global mede 4–6).
- **[2026-07-28] Ruído 3D célula a célula no worldgen custou 10,9×** (2,63 → 28,61 ms/coluna) e
  **derrubou o streaming** — o smoke `pedir-coluna` parou no anel 4 (bug-541). O worldgen roda
  no servidor, por coluna, sob demanda: qualquer coisa nova que varra o subsolo inteiro tem de
  ser amortizada antes de commitar, e **`npm run smoke` é quem pega**.
- [2026-07-20] Estado client-side indexado por POSIÇÃO precisa entrar na limpeza do
  `reloadWorld` — mundo novo sem aquele conteúdo não manda mensagem, e o antigo fica fantasma
  (bug-333: `quadroRenderer` ficou de fora quando a feature nasceu).
- [2026-07-19] `Number(null) === 0` — param numérico OPCIONAL de URL exige checar
  `raw === null` ANTES de `Number(raw)` (bug-302: sem `?hora`, céu travado na meia-noite).
- [2026-07-19] Bloco de código module-level em main.ts: declarar DEPOIS das consts que usa —
  TDZ dá tela cinza e nem vitest nem typecheck pegam (bug-301/bug-151). Screenshot headless pega.
- [2026-07-13] Oclusão de face NÃO se decide pela transparência do bloco DONO da face, só pela
  do VIZINHO (bug-167).
- [2026-07-13] Modificador de movimento (sprint) NÃO sai direto do input: precisa de estado
  ENGATADO no PlayerState, senão dá turbo no ar (bug-168).
- [2026-07-11] Parâmetro com default vindo de objeto `as const` infere TIPO LITERAL — anotar
  `yEnd: number = ATLAS.tilePx` (bug-001).
- [2026-07-11] Com `noUncheckedIndexedAccess`, indexar array/Uint8Array devolve `T | undefined`:
  usar `?? fallback`, nunca `!`. E **NUNCA `for (let i…)` + `arr[i]` em código novo** — usar
  `for (const x of arr)` ou `.entries()`.
- [2026-07-11] `Buffer.buffer` do Node é o POOL compartilhado (byteOffset ≠ 0): pra virar
  ArrayBuffer, `raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)`.
- [2026-07-11] /shared não declara TextEncoder/TextDecoder — `declare class` mínima no arquivo,
  NÃO lib DOM no tsconfig (quebraria a pureza).
- [2026-07-11] Não recalcular valor do terreno pristino (spawn) no join nem no cliente a partir
  do snapshot — mundo pode estar escavado (bug-010). Calcular na criação e transmitir.

### Medição e verificação

- **[2026-08-02] `LJ_NOVO=1` NÃO recria mundo que já existe** — ele só AUTORIZA criar onde não
  há arquivo. Smoke que ESCREVE estado persistente (modo, regra, blocos) passa na 1ª rodada e
  falha na 2ª com o estado da 1ª (bug-547). O manifesto do `scripts/smoke.mjs` ganhou `limpar:
  [pastas]` pra isso — usar em smoke de mundo P/M; mundo E fica de fora (regenerar custa
  dezenas de segundos). **Rodar o smoke novo DUAS vezes seguidas** é o que prova idempotência.
  ⚠️ Assimetria entre dois clientes quase iguais (um passa, o outro falha) é pista de estado
  herdado, não de corrida.
- **[2026-07-28] NÃO medir cor lendo o canvas do three pela página.** `drawImage(canvasWebGL,…)`
  devolve **PRETO** fora do frame (o three usa `preserveDrawingBuffer: false`). Não dá erro: dá
  0,0 — e 0,0 nos dois lados de um A/B ainda "passa" numa razão < limiar, falso POSITIVO
  (bug-540). Medir o print do CDP (`Page.captureScreenshot`, composto pelo navegador) e
  decodificar em Node — decodificador PNG mínimo já existe em `scripts/luz-shots.mjs`.
  **Toda verificação comparativa precisa de âncora ABSOLUTA junto da razão.**
- **[2026-07-26] Perfil sem CONTEXTO leva a conclusão errada.** Li "parado, 60 FPS" de um perfil
  feito VOANDO, inferindo o estado pela taxa de rede. Retrato de posição não diz se havia
  movimento: métrica de estado precisa de acumulado + DELTA na janela, nunca de amostra
  instantânea. O perfil hoje carrega `jogador`, `config` e `gravacao.movimento`.
- **[2026-07-26] `--virtual-time-budget` ACELERA os timers:** o relógio virtual corre solto
  entre frames, então `performance.now()`/`setInterval` avançam MUITO mais que o orçamento.
  Serve pra conferir LAYOUT; qualquer conclusão sobre duração real sai de navegador de verdade.
- **[2026-07-26] Headless a 1280×720 dá TELA CINZA intermitente** (~40%; a 800×450 foi 8/8).
  Antes de caçar bug por tela cinza, repetir menor e comparar o TAMANHO do PNG (mundo ≈ 200 KB+,
  cinza ≈ 28 KB).
- **[2026-07-23] NÃO confiar em "typecheck 0" do STATUS sem rodar.** O STATUS afirmava verde com
  3 erros na árvore (bug-490): o registrado pode ser aspiracional ou de outro estado. Rodar
  `npm run verify` antes de commitar.
- [2026-07-16] Mexer na sequência do `admitir()` (join) QUEBRA teste que indexa posição —
  FILTRAR por tipo (`.find(m => m.type === …)`).
- [2026-07-16] Smoke de valor que MUDA sozinho não usa igualdade exata: congelar primeiro
  (`/ciclo desligar`) ou usar faixa.
- [2026-07-19] Teste que quer "id de bloco inválido" usa 200, NUNCA `MAX+1` literal — cada
  append de bloco quebrava o assert.
- [2026-07-27] **Teste de "não mudou" compara com o valor ANTERIOR, nunca com constante**
  (bug-531): `const antes = get(); … toBe(antes)`.

### Ferramentas, processos e ambiente

- **[2026-07-28] NÃO escrever hora com placeholder no `memory.md`** (`| 23:0x |`): o stop hook
  conta com `^\|\s*\d{1,2}:\d{2}\s*\|`, a linha não conta e o aviso "no semantic summary" repete
  a cada turno. Escrevi 11 assim e ainda culpei a ferramenta — **era erro meu**. Reproduzir
  `countSemanticEntries` num `node -e` custa 30 s. ~~Sessão que atravessa a meia-noite precisa
  do prefixo de DATA~~ — **isso caiu na sessão 37** (bug-554): o contador não olha mais data,
  conta abaixo do último `## Session:`. A hora de verdade continua obrigatória.
- [2026-07-19/20] **Matar processo de fundo:** `pkill/pgrep -f '<padrão>'` casa o PRÓPRIO shell
  quando o padrão está no cmdline dele (exit 130/144) e o servidor SOBREVIVE segurando a porta —
  o restage seguinte fala com o servidor VELHO (screenshot idêntico byte a byte é a pista).
  Matar por PORTA (`fuser -k PORT/tcp`, conferindo `ss -tln` depois) ou rodar como JOB separado.
  ⚠️ **NÃO usar `fuser -k` cego em porta compartilhada (8080/5173)** — já matei o `dev:server`
  do USUÁRIO. Conferir dono antes (`ps -o pid,cmd -p $(fuser 8080/tcp)`).
  ⚠️ `tsx src/index.ts` roda em VÁRIOS processos e só o node filho FINAL registra `SIGINT`:
  pra disparar o save, `pkill -INT -f 'index.ts'`.
  ⚠️ O PID de `$!` com `nohup npx tsx &` é o WRAPPER; o dono real sai de `ss -tlnp` (bug-092).
- [2026-08-06] **`node --import tsx script.mts` NÃO checa tipo** — `BlockId.Pedra`,
  `BlockId.Vidro` e `BlockId.Folhas` não existem (são `Stone`, `Glass`, `Leaves`) e viram
  `undefined` em silêncio: `setBlock(w,x,y,z,undefined)` construiu um mundo de AR e três repros
  seguidos "provaram" que não havia bug. Rodar `tsc --noEmit` no arquivo, ou conferir um id com
  `getBlock` logo depois de escrever.
- [2026-08-06] **Quando `atualizarBloco` (luz) ganhar um canal ou uma regra nova, cruzar com
  `acenderColuna`** — os dois motores calculam a MESMA função dos bytes, e o fuzz que os compara
  célula por célula achou o bug-596 e o bug-598 de uma vez. Caso escrito à mão só pega o buraco
  que quem escreveu já suspeitava.
- [2026-08-06] **Sentinela "nunca aconteceu" NÃO pode ser `0` quando o relógio é
  `performance.now()`** — ele também começa em 0, então `agora - ultimo < janela` é VERDADE nos
  primeiros ms da página (bug-594). Usar `Number.NEGATIVE_INFINITY`.
- [2026-08-06] **Teste de "independe do FPS" tem de medir o MEIO da transição, não o fim** —
  qualquer suavização converge se der tempo, e um decaimento linear passa no teste do fim.
- [2026-08-06] Em refactor mecânico grande, **`tsc` verde não prova que o código não foi
  duplicado nem perdido**. Conferir com diff de linhas de código normalizadas (ver Key
  Learnings da 53).
- [2026-07-12] `npm run dev` via Bash background morre com exit 143 e log VAZIO — subir com
  `nohup npx tsx …` e conferir a porta com `ss -tln` (o vite pode pular pra 5174).
- [2026-07-13] Smoke `.mts` no scratchpad: `node --import tsx script.mts` **com CWD no repo**
  (tsx resolve de node_modules do projeto); do scratchpad dá ERR_MODULE_NOT_FOUND.
  ⚠️ **[2026-08-17] CWD no repo NÃO BASTA.** A resolução de `@logica/shared` parte do diretório
  do ARQUIVO, não do CWD — sonda que mora em `/tmp/...` falha com `ERR_MODULE_NOT_FOUND` mesmo
  rodada da raiz do repo. Copie o `.mts` para DENTRO do repo (raiz serve), rode, e apague depois
  — nunca `git add`.
- [2026-07-17] **Smoke do HOST sem `LJ_SAVE` sobrescreve o `server/world.ljw` RASTREADO.**
  Sempre passar `LJ_SAVE=<scratchpad>/teste.ljw` e `LJ_PORT` próprio. Se poluiu:
  `git checkout -- server/world.ljw`.
- [2026-08-03] **Água só entra no mundo por BALDE — `/bloco <id da água>` é RECUSADO** (a água
  não é `isPlaceable`, saiu da hotbar de propósito). Smoke que precisa de uma FONTE cria com o
  balde do PROFESSOR (criativo não exige item na mão): `{type:"balde", ...cel, encher:false}`.
  Custou uma rodada do `_smoke-craft.mjs` (o `/bloco AGUA` saiu calado e a asserção seguinte
  caiu).
- [2026-07-19] `/bloco` RECUSA porta (criaria metade órfã) — script de stage usa `place_block`
  de verdade (e precisa de um `move` pro spawn antes, por causa do alcance).
- [2026-07-11] Saída de git via rtk é comprimida/cacheada — `git status` pode mentir. Verdade:
  `git diff --numstat`, `git diff-index HEAD --`, ou `rtk proxy "<comando>"`.
- [2026-07-11] NUNCA rodar sed/normalização em `git ls-files` sem excluir binários (corrompeu o
  PDF do projeto). Filtrar por extensão ou usar `git grep -Il ''`.

### Produto e licenciamento

- [2026-07-10] NÃO usar código/assets do Minecraft ou Eaglercraft (port não licenciado);
  projeto.txt §9 rejeita software não licenciado. Copiar só o MODELO, com engine e assets
  próprios.
- [2026-07-10] Aba de navegador NÃO abre socket de escuta nem executa binário, e WebAssembly
  NÃO contorna. "Abrir pra LAN" é papel do HOST — não prometer cliente-web que vira servidor.
- [2026-07-10] Não escrever "relatório de aplicação" antes de o piloto real acontecer.

## Decision Log — índice das decisões ATIVAS

- [2026-08-17] **A aula tem GRADE de 6 colunas e teto de 20 grupos, com o mundo dimensionado
  pelo TETO.** 6 colunas porque fecha os três tamanhos que interessam (8 = 6×2, 20 = 6×4, e o
  teto futuro de 35 = 6×6 = 96×96 blocos, a pegada de sempre) e mantém `dims.x` em 6. O mundo
  nascer do tamanho do teto, e não do `--grupos` pedido, é o que tira o `inBounds` do caminho do
  professor durante a aula — **ao custo medido de +66% no `.ljw` (593 kB → 987 kB)**, porque o
  save destes mundos não é esparso. Decisão do usuário, com a ida a 35 adiada e anotada.
- [2026-08-17] **`/aula grupos X` é INCREMENTAL, e `/grupo criar X` continua sendo o reset.**
  Grupos `1..min(N,X)` preservam composição, progresso e blocos; só a diferença é criada ou
  removida. Encolher exige `/aula grupos X confirmar` (relatório do estrago no 1º passo) porque
  apaga trabalho de aluno — mesmo padrão de 2 cliques dos botões de expulsar/banir.
- [2026-08-17] **A fonte da cópia é uma CÉLULA-MOLDE no mundo (região `partida`), não o
  `baseline` do objetivo.** O baseline cobre só a caixa da área e perderia os `extras`. A célula
  fica no chunk atrás do professor, fora das fileiras de grupo. O gerador carimba os grupos com
  o MESMO `copiarCelula` do comando ao vivo — de propósito: se ele regredir, `npm run cenarios`
  quebra antes de o mundo chegar na escola.
- [2026-08-11] **`.bat` é ASCII puro; o `.gitattributes` NÃO ganha exceção de `eol=crlf`.**
  As duas coisas consertam o bug-621 isoladamente (medido), e a escolha foi a do ASCII: o projeto
  força `eol=lf` em tudo porque vive no WSL, e uma exceção por extensão é mais uma coisa pra
  lembrar — enquanto ASCII puro é a regra que o arquivo já seguia sozinho. Quem garante é o
  `npm run check:launchers`.
- [2026-08-11] **`LJ_UPDATE=pacote|zip|git` — o escape manual do auto-update.** Nasceu com o
  bug-620: se a detecção automática errar de novo, o professor tem uma linha pra digitar em vez
  de ficar sem atualização. `LJ_SEM_UPDATE=1` continua sendo "não procure nada".
- [2026-08-11] **O tooltip conta "serve pra quê" lendo as tabelas do JOGO (`usosDoItem`), nunca
  uma lista própria.** Lista à mão sai de sincronia no primeiro item novo e o aluno lê mentira.
  Custo aceito: o `shared` ganhou um módulo (`usos.ts`) que só a UI consome.

<!-- Uma linha por decisão. TEXTO COMPLETO (motivo, alternativas, contexto) em
     .wolf/history.md → "## Cerebrum — Decision Log" e "## Cerebrum arquivado (2026-07-28)". -->

- [2026-08-10, sessão 65] **A área do claim é ORÇAMENTO POR MEMBRO (1.024 blocos × pessoas no
  grupo, teto 6), e não um teto fixo — escolha do usuário entre três opções que apresentei.** Ele
  descartou tanto o "2.048 por membro (mantém o solo como está hoje)" quanto o "eixo Z escala, X
  fixo" e escolheu **o mais enxuto**, ciente e avisado de que isso ENCOLHE quem joga sozinho de
  2.048 para 1.024 e deixa claims salvos acima do limite. Razão da régua: a área protegida tem de
  crescer com quantas mãos vão construir nela.
- [2026-08-10, sessão 65] **Grupo que encolhe NÃO encolhe nem apaga o claim — só trava o
  remarcar, e avisa no chat.** As outras duas opções (cortar a área na hora, remover o claim)
  apagariam proteção de construção já feita, no meio da aula e sem o aluno pedir. Como
  `/claim modificar` valida a marcação NOVA contra o limite ATUAL, encolher para caber continua
  valendo — o mesmo portão serve para as duas coisas.
- [2026-08-10, sessão 65] **Editar claim é `/claim modificar`, não remover+criar** — escolha do
  usuário entre as duas. Remover+criar perde o rótulo e abre uma janela em que a construção fica
  desprotegida; `modificar` substitui no lugar, herda o rótulo e ignora o próprio claim no teste
  de cruzamento. `criar` e `modificar` dividem o corpo (`marcarClaim`), porque a diferença entre
  os dois cabe em três linhas.
- [2026-08-10, sessão 65] **A lã deixou de ser INGREDIENTE de qualquer receita** (pedido do
  playtest, com o usuário escolhendo as três famílias: móveis, tapetes e lãs coloridas). A
  conversão é mecânica e explicável em uma frase — **1 lã = os 3 algodões que ela custava**, com
  a tintura contando 1 por lote e não por fio. Ela segue sendo bloco de construção; o que morreu
  foi a etapa intermediária que obrigava a fabricar branco só pra desfazer no passo seguinte.
- [2026-08-06, sessão 51] **O `main.ts` termina o refactor ANTES do playtest — decisão DELE.**
  Apresentei os dois lados: a extração de peça solta esgotou (o arquivo fechou a 51 em +4 linhas,
  o que saiu do corpo voltou como import), o que resta é o `startGame` → `GameRuntime`, que muda
  muito código sem mudar nada para a turma, e a fila de JOGO não encosta desde a 47. Recomendei o
  playtest primeiro; ele mandou terminar o refactor. **Está decidido — a próxima sessão executa o
  plano do STATUS §1 e não reabre a pergunta.**
- [2026-08-06, sessão 51] **O que merece subir pro `shared/` é a regra que os DOIS LADOS DO FIO
  aplicam igual — pureza é só o requisito de entrada.** Complementa (não substitui) a decisão da
  50 sobre ganhar teste: a da 50 diz por que `shared/` é o destino, esta diz como ACHAR o
  candidato. A geometria do raio de colunas estava escrita 6× e as cópias do cliente com os
  números digitados (`/ 16`, `+ 2`) em vez de `CHUNK_SIZE` e `FOLGA_DESCARTE` — invisível por
  nome de função, achável pelo NÚMERO literal.
- [2026-08-06, sessão 50] **Despachante de protocolo FICA no arquivo de entrada.** O
  `handleServerData` (217 linhas, ~30 `let` de módulo) NÃO foi cortado, pela mesma razão que o
  `handleMessage` da 49 ficou no core do `session.ts`: extrair exigiria um objeto de contexto de
  ~30 campos cujo único trabalho é reexpor o escopo de módulo — mais linhas, não menos, e uma
  indireção a mais entre o nome da mensagem e o que ela faz. **O critério de corte é ter FRONTEIRA
  (estado próprio + API estreita), não tamanho.** `ColunasFaltando` tem: 1 mapa, 2 callbacks.
  `HotbarUi` tem: 9 slots e o que se faz com eles. O despachante não tem — ele é a porta.
- [2026-08-06, sessão 50] **Lógica pura do cliente sobe pro `shared/` pra GANHAR TESTE.** A
  orientação de colocar (eixo da porta, frente do móvel, metade da laje) era pura e vivia num
  handler de mouse, onde nenhum teste alcança. Em `shared/` ela entra na suíte que já roda. É a
  mesma razão de mesher, luz, física e raycast morarem lá apesar de rodarem no CLIENTE: o critério
  do `shared/` é ser PURO e valer um teste, não ser usado pelos dois lados.
- [2026-08-05, sessão 47] **Os ids de direção da fornalha NÃO são contíguos, e é escolha.**
  186/187 já estão gravados nos mundos da sessão 46; renumerar pra abrir um bloco de 8 trocaria
  a fornalha de quem já jogou por outro bloco. Eles viraram a direção −Z, as outras três foram
  pro fim (194-199), e a tradução mora numa TABELA (`FORNALHA_POR_FRENTE`), não em `âncora + k`.
  **Custo: 4 funções pequenas. Ganho: zero migração.** É o mesmo raciocínio da receita aposentada
  — id gravado é contrato, e contrato não se reescreve pra ficar bonito.
- [2026-08-05, sessão 47] **O baú desenha como CAIXA e colide como CÉLULA CHEIA** (a regra do
  móvel e da cerca, agora escrita). Vão de 1/16 onde o jogador "quase" entra é bug de travamento
  no meio da aula, não realismo. Quem segue a forma é a MIRA (`blockSelectionBox`) — é lá que a
  diferença serve pra alguma coisa: dizer qual dos dois baús encostados o clique vai abrir.
- [2026-08-05, sessão 46] **Receita não se APAGA: ela se APOSENTA.** O índice é a identidade
  no protocolo (`fabricar {receita}`), então tirar uma linha deslocaria todas as seguintes e o
  aluno com o painel aberto clicaria numa receita e receberia outra. `Receita.aposentada` é um
  texto com a razão; `receitaValida` e `fabricar` recusam, e o painel não lista. Foi assim que
  a receita direta de vidro saiu quando a fornalha entrou (pedido do usuário).
- [2026-08-05, sessão 46] **Container com coisa dentro NÃO QUEBRA** (decisão do usuário pro
  baú, ESTENDIDA por mim à fornalha — mesma regra, mesma frase, mesmo gate). Não existe item no
  chão, então quebrar cheio perderia a mochila que o colega guardou. Vale inclusive em criativo.
- [2026-08-05, sessão 46] **Machado e pá ficaram FORA do §🍖 F10d, e é decisão, não
  esquecimento.** (1) Travariam a aula: exigir machado pra tirar madeira, quando o machado é
  feito de madeira, é um mundo onde ninguém começa. (2) Não fariam nada: a quebra aqui é um
  clique instantâneo, então ferramenta que só ACELERA não tem onde aparecer. A tabela de
  `ferramentas.ts` já é (tipo × família), então eles entram sem redesenho no dia em que houver
  tempo de quebra.
- [2026-08-05, sessão 46] **A picareta vale onde ESTIVER na mochila, não só na mão.** "Você
  precisa de uma picareta" é uma frase que a criança resolve; "precisa dela na MÃO, não na
  mochila" é um 2º enigma em cima do 1º, e o clique não tem como dizer qual dos dois falhou.
  De quebra, o `break_block` continua sendo três coordenadas (o servidor não precisa do slot).
- [2026-08-05, sessão 46] **Algodão SELVAGEM é bloco SEPARADO do cultivado.** O selvagem larga
  SEMENTE por sorte (molde do capim) e nunca ele mesmo; o cultivado maduro larga 1–2 capulhos +
  a semente. Um id só faria "achar" e "colher" darem a mesma coisa, e o pé do gen viraria fonte
  infinita de algodão sem plantar nada.
- [2026-08-05] **§🍖 F10d — ferramenta SEM durabilidade e OBRIGATÓRIA pra minerar** (decisão do
  usuário, respondendo às duas perguntas). Sem durabilidade = `Stack` continua `{id, qtd}` e
  nenhum campo novo entra no save (`tamanhoStack = 1`, o mesmo do balde, basta). Obrigatória =
  **quem entra em sobrevivência não pega pedra até fabricar a picareta de madeira**, e é isso
  que dá sentido à cadeia madeira → picareta → pedra → minério → fornalha → lingote. O gate
  mora no `break_block` ANTES do `applyBlock` (recusa não deixa rastro no mundo).
- [2026-08-05] **Claim protege INTERAÇÃO, não só edição** (pedido do usuário: *"área com claim
  não permite qualquer interação de não autorizados, seja abrir porta ou inventário"*). Metade
  já era verdade — `use_block` (porta/janela), `quadro_set` e o balde já passam por
  `claimBloqueia`. O que a decisão fixa é o FUTURO: **abrir fornalha ou baú é acesso a
  inventário e passa pelo mesmo gate ANTES de responder o conteúdo** — senão dá pra LER o baú
  alheio, que é pior que mexer nele. Autorizado = dono + amigos do grupo dele + professor.
- [2026-08-05] **Bloco com INVENTÁRIO (fornalha, baú) segue o molde do QUADRO**: estado por
  POSIÇÃO num mapa da GameSession, persistido no META do save, sem byte novo no chunk. Fazer o
  BAÚ depois da fornalha é o barato — o encanamento nasce uma vez e serve pros dois.
- [2026-08-05] **§🍖 F10 — algodão substitui a ponte "lã ← trigo"** (que a 45 inventou por não
  haver mob). Vira planta de verdade: selvagem no gen dropa semente por sorte, cultivada dropa
  1–2 + a semente, `3 algodão → 1 lã branca`. O trigo volta a ser SÓ comida, e some a
  competição pão × lã.

- [2026-08-04] **§🏁 A corrida (`aula7-corrida.ljw`) é a 1ª aula que NÃO é de construir** —
  4 objetivos `chegar` em modo sequencial, mundo plano próprio, sem cabines. Os 3 primeiros
  postos são `um` (basta um da equipe) e a **CHEGADA é `todos`**: quem corre na frente volta a
  buscar quem ficou. Uma corrida que premia só o mais rápido não deixa o que discutir no fim.
- [2026-08-04] **Pista em mundo plano tem de ser CIRCUITO FECHADO.** O mundo em volta é caminho:
  corredor aberto na ponta vira atalho pela grama (bug-561). E **posto tem de atravessar a pista
  de parede a parede** — na curva, uma faixa vertical se dribla (bug-562).
- [2026-08-04] **§🍖 F6: A FOME VOLTOU A MATAR** — `VIDA_MINIMA_POR_FOME` 6 → **0**, decisão
  do usuário. O F3 tinha travado a inanição em 3 corações só porque não havia o que comer;
  agora há fruta, plantação e pão. Reversível numa linha (subir pra 6 devolve a fome que só
  enfraquece), e a saída pro fundamental 1 continua sendo `/regra fome desligar`.
- [2026-08-04] **§🍖 F6 = as DUAS fontes do ROADMAP** (escopo GRANDE de novo): fruta caindo da
  folha (fonte PASSIVA — quem só explora não passa fome) **e** plantação de 4 estágios (fonte
  ATIVA: semente do capim → plantar em solo → esperar → colher trigo → 3 trigo = 1 pão). O
  trigo NÃO se come de propósito: é a dependência que faz a horta ensinar sequência.
- [2026-08-04] **Crescer NÃO é regra de vizinhança.** A fila de células sujas acorda por
  "alguém mexeu do lado", e planta cresce por TEMPO — se `crescerPlantacao` estivesse no
  `rulesMap`, colocar um bloco ao lado da horta a amadureceria na hora. Ela fica FORA do
  registro e a session a chama num pulso, sobre um índice de células plantadas
  (`plantacoes`), que se reconstrói dos BYTES no `restore` — **nenhum campo novo no `.ljw`**.
- [2026-08-04] **Comer não cura vida.** A vida já volta pela regeneração passiva do F2, que
  exige fome alta: ter as duas coisas faria a comida virar curativo instantâneo e apagaria a
  única razão de a fome doer.
- [2026-08-03] **§🍖 F5 = receitas de MADEIRA + PEDRA, e o balde entrou junto** (escopo GRANDE
  escolhido pelo usuário). Sem forno no lite, o universo real é madeira (tronco→tábuas→
  laje/escada/mesa/cerca) e pedra (pedregulho→laje/escada). **O balde é `3 minério de ferro →
  1 balde vazio`** — NÃO é o número do Minecraft (lá são 3 lingotes), mas não há fundição pra
  virar lingote no lite, e o balde é o que destrava a água em sobrevivência. Reversível: mexer
  em `RECEITAS` é uma linha por receita (append).
- [2026-08-03] **`/dar <eu|all|nome> <id> [qtd]` criado FORA do escopo travado do §🍖 F4** —
  decisão minha, sinalizada ao usuário e reversível. Com inventário autoritativo o mundo de
  sobrevivência começa com todo mundo de mãos vazias e não há craft até o F5; sem o comando o
  professor perde a ferramenta que o ROADMAP §🍖 promete preservar ("o professor não fica sem
  ferramenta porque a turma está sobrevivendo"). É a contraparte do `/bloco`: teleoperação,
  sem custo de esforço e sem alcance.
- [2026-08-03] **Mexer na mochila é TOCAR NA ORIGEM e TOCAR NO DESTINO, não arrastar** — mesma
  razão que descartou a grade 3×3 do craft em 2026-07-27 (arrastar dói no tablet/Kindle Fire da
  escola e trava aluno de 2º ano). Vale como molde pro painel do F5.
- [2026-08-03] **Por padrão o bloco cai ELE MESMO** (`drops.ts`), com exceções curtas
  (grama→terra, pedra→pedregulho, folha/água/bedrock→nada). Numa aula, desfazer tem de ser
  reversível; a fidelidade ao Minecraft entra só onde ela cria o par que o craft usa.

- [2026-07-28] **§💡 Luz COMPLETA (céu + tocha) antes de escavar** — escolha do usuário no
  portão de produto da v2. E **caverna SECA mesmo abaixo do mar**, com casca fina de pedra
  separando: quem furar o teto depois deixa o mar entrar, e aí é a regra da água que resolve.
- [2026-07-28] **v2 da geração = cavernas + relevo por bioma, cavernas antes.** Cavernas em
  TODO mundo procedural; `plano`/`cabines` intocados (presets de AUTORIA). Relevo = "montanha
  de verdade", o que **reabre de propósito** o penhasco de fronteira que o heightmap global
  único evitou em 2026-07-20 — aquela decisão segue válida no que resolveu: foi ADIADO, não
  descartado. ⚠️ **Armadilha de nome:** a sessão 10 já chamou de "worldgen v2" outra coisa —
  preferir nome descritivo (§🏔️) a número de versão.
- [2026-07-27] **Escopo da SOBREVIVÊNCIA travado, 6 decisões, nenhuma pendente** (texto em
  `ROADMAP.md §🍖`): lite agora com `aplicarDano` como porta única · mobs hostis só em mundo de
  exploração · craft por LISTA (tablet) · `/modo` mundo+`@aluno`+`all`+`eu` · `/pvp` no lite,
  OFF · **o que a sobrevivência decide vira REGRA DE MUNDO** (`/regra`, mapa no `.ljw`,
  `manter-inventario` LIGADO). **Não retrofitar** `/ciclo`, `/voo`, `/vento`, `/confinar`,
  `/claim`: o professor já usou esses verbos no piloto.
- [2026-07-27] **Repo PÚBLICO + licença source-available:** redistribuir INALTERADO é livre
  pra instituição de ensino; código modificado, republicação e uso comercial exigem
  autorização. Cenário feito por professor é DELE. Não é OSI (o aviso do GitHub é esperado).
- [2026-07-27] **Apelidos de aluno no HISTÓRICO do git: decidido DEIXAR.** Não propor
  `filter-repo` de novo; escrita NOVA segue sem nome de aluno.
- [2026-07-27] **Água CORRENTE segue o próprio fluxo; PARADA segue o vento.** Uma regra só,
  sem flag: o fluxo sai do GRADIENTE DE NÍVEL na vizinhança (só vizinho de água conta); mar é
  tudo FONTE → gradiente zero → vento.
- [2026-07-27] **Vento é SÓ visual e server-autoritativo**, função pura de `tickCount` + seed.
  Não entra na física. `/vento` só LIGA/DESLIGA (o usuário recusou ajuste manual). Nasce
  ligado; só o DESLIGADO vai pro save.
- [2026-07-26] **Hitbox da laje ENCERRADA em playtest:** mira na metade + colisão de meia
  altura. Se uma sessão futura achar "inconsistente" com cerca/porta, é decisão validada.
- [2026-07-26] **`buglog.auto_detect: false`** (falso positivo poluía o índice) e
  **`anatomy.rescan_interval_hours: 168`** (o "stale" de 6 h virou alarme ignorado).
- [2026-07-20] **Heightmap ÚNICO e global** pra evitar penhasco na fronteira de bioma —
  ADIADO, não descartado; a fase §🏔️ o reabre com suavização própria.
