# Cerebrum

> OpenWolf's learning memory. Curated knowledge only: User Preferences, timeless Key Learnings, Do-Not-Repeat.
> **Consolidado 2× — 2026-07-25 (27k→9k) e 2026-07-28 (20k→~10k).** A narrativa por sessão
> (motivação, antes/depois, números) vive em `.wolf/history.md` → `## Key Learnings arquivados
> (2026-07-25)` e `## Cerebrum arquivado (2026-07-28, sessão 32)`. Aqui fica só a REGRA
> acionável; o Decision Log completo também está no history.md (aqui vai só o índice).
> **Ao aprender algo novo, escrever a REGRA, não a história** — é isto que segura o orçamento.
> Last updated: 2026-08-04 (sessão 43)

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

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

## Key Learnings

<!-- Só a REGRA acionável. Narrativa, números e contexto de cada sessão: .wolf/history.md
     (`## Key Learnings arquivados (2026-07-25)` e `## Cerebrum arquivado (2026-07-28)`). -->

### Verificação headless e mundos de teste

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

## Do-Not-Repeat

<!-- Cada entrada impede o mesmo erro de voltar. Narrativa completa: .wolf/history.md -->

### Ferramentas e ambiente

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
- [2026-07-12] `npm run dev` via Bash background morre com exit 143 e log VAZIO — subir com
  `nohup npx tsx …` e conferir a porta com `ss -tln` (o vite pode pular pra 5174).
- [2026-07-13] Smoke `.mts` no scratchpad: `node --import tsx script.mts` **com CWD no repo**
  (tsx resolve de node_modules do projeto); do scratchpad dá ERR_MODULE_NOT_FOUND.
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

<!-- Uma linha por decisão. TEXTO COMPLETO (motivo, alternativas, contexto) em
     .wolf/history.md → "## Cerebrum — Decision Log" e "## Cerebrum arquivado (2026-07-28)". -->

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
