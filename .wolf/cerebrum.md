# Cerebrum

> OpenWolf's learning memory. Curated knowledge only: User Preferences, timeless Key Learnings, Do-Not-Repeat.
> **Consolidado 2× — 2026-07-25 (27k→9k) e 2026-07-28 (20k→~10k).** A narrativa por sessão
> (motivação, antes/depois, números) vive em `.wolf/history.md` → `## Key Learnings arquivados
> (2026-07-25)` e `## Cerebrum arquivado (2026-07-28, sessão 32)`. Aqui fica só a REGRA
> acionável; o Decision Log completo também está no history.md (aqui vai só o índice).
> **Ao aprender algo novo, escrever a REGRA, não a história** — é isto que segura o orçamento.
> Last updated: 2026-07-28

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

### Invariantes e contratos

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

## Do-Not-Repeat

<!-- Cada entrada impede o mesmo erro de voltar. Narrativa completa: .wolf/history.md -->

### Código e arquitetura

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
  `countSemanticEntries` num `node -e` custa 30 s. **Sessão que atravessa a MEIA-NOITE precisa
  do prefixo de DATA** (`| 2026-07-28 00:12 |`): o cabeçalho `## Session:` ainda é o de ontem, e
  cabeçalho escrito por mim não casa com o regex do contador.
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
