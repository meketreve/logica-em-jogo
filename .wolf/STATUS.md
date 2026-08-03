# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.
> **SESSÃO 36 (2026-08-03) — §🍖 F4: O INVENTÁRIO AUTORITATIVO. A "frente cara" (2–3 sessões
> no orçamento) fechou INTEIRA numa sessão.** O usuário pediu "continuar" e, antes, registrar
> no TODO a regra de vegetação precisar de apoio. Registrando, achei o buraco de verdade:
> `precisaApoio()` JÁ lista grama alta, mas `GramaAlta/Seca/Fria` (179–181) **não estão no
> `rulesMap`** — o capim flutua hoje. Ficou anotado com o fix (um `for` de 3 ids apontando pro
> `torchRule`), não implementado, porque o pedido foi registrar.
>
> **A mochila é ESTADO DO SERVIDOR, por NOME** (como o modo e os vitais — sobrevive ao rejoin e
> à troca de aula). 27 slots: 9 hotbar + 18 mochila, pilha de 64. `shared/src/inventario.ts` é
> puro e IMUTÁVEL (toda função devolve inventário novo, disciplina do `sobrevivencia.ts`), e
> `tamanhoStack(id)` já nasce com a porta pra ferramenta: hoje só o balde é 1 por slot.
>
> **`shared/src/drops.ts` tem duas regras e uma tabela curta.** (1) **Forma canônica**: porta
> aberta, cama virada pro sul e escada de cabeça pra baixo voltam como a entrada da HOTBAR —
> senão o aluno ganharia item que não sabe recolocar, e a direção sai do olhar dele no
> `place_block`, não do byte guardado. (2) **Por padrão o bloco cai ele mesmo** (desfazer tem de
> ser reversível numa aula); só grama→terra, pedra→pedregulho, folha/água/bedrock→nada fogem
> disso. Um teste-portão varre TODOS os ids e prova que nada cai em algo não-colocável ou
> só-de-professor.
>
> **Onde o débito mora: no MESMO ponto pós-`switch` que o esforço do F3.** "O mundo mudou" =
> "a colocação valeu", então porta e cama (2 células) custam UM item e os 4 ramos de
> materialização cobram sozinhos. **bug-549 saiu daí:** o detector era
> `changedThisTick.size > antes`, e aquilo é um CONJUNTO de coordenadas — quebrar e recolocar a
> MESMA célula no mesmo tick de 100 ms não mexia no tamanho, então a colocação saía DE GRAÇA
> (bloco infinito por clique rápido; o esforço do F3 também escapava). Virou contador
> monotônico `edicoesAplicadas`, incrementado dentro do `applyBlockQuieto`, com teste de
> regressão.
>
> **Mochila cheia RECUSA a quebra** (não existe item no chão — decisão travada no ROADMAP): a
> conferência vem ANTES do `applyBlock`, pra que a recusa não deixe rastro no mundo, e o aviso
> no chat tem freio de 5 s porque quebrar é clique repetido. O crédito vem DEPOIS de o mundo
> mudar, e a segunda metade da porta/cama — que o `doorRule`/`camaRule` apaga no tick seguinte —
> não passa por lá: uma porta não vira duas.
>
> **`manter-inventario` finalmente decide alguma coisa** (`matar()` lê a regra; desligada, a
> mochila some inteira) e saiu do `RegraDef.pendente`. Só o `pvp`/F7 ainda avisa "falta a
> mecânica".
>
> **`/dar <eu|all|nome> <id> [qtd]` é NOVO e está FORA do escopo travado** — decisão minha, e o
> usuário pode reverter. Razão: com inventário autoritativo o mundo de sobrevivência começa com
> todo mundo de mãos vazias e não há craft até o F5, então sem ele o professor não prepara
> atividade nem conserta acidente. É a contraparte do `/bloco` (teleoperação: não custa esforço,
> não exige alcance), professor-only, e foi o que destravou os testes também.
>
> **Cliente:** `mochila.ts` novo (espelho puro, sem DOM — **a UI nunca decide**), hotbar com
> contagem por slot e slot vazio que mantém a altura (senão a barra pula quando o aluno gasta o
> último bloco), e o painel do E vira "mochila" em sobrevivência: 9 colunas alinhadas com a
> hotbar e o gesto de **tocar na origem, tocar no destino** — arrastar dói no tablet, é a mesma
> razão que descartou a grade 3×3 do craft. `?mochila=3x64,-,4x7` pra inspeção (o par do
> `?vida=`), e ele TRANCA contra a rede, senão o `modo criativo` de todo join apagaria o print.
>
> **VERDE:** typecheck 3/3 · **522 testes** (63 novos) · build · **10/10 smokes** (o
> `inventario` é novo e rodou 2× pra provar idempotência) · prints da hotbar e da mochila
> conferidos, sem erro de console. **PLAYTEST PENDENTE** — headless não tem dedo.
>
> **SESSÃO 35 (2026-08-02) — §🍖 F3: A FOME. E a 33/34 finalmente FORAM PRO GIT.** O usuário
> pediu "continue, mas faça commit de tudo antes": a sessão 34 inteira (F1+F2) estava só no
> disco. Ela saiu em 2 commits (`ef29ee8` código, `6b7f63a` wolf) depois de verificar — e só
> então a fila andou.
>
> **A barra NÃO desce por relógio: desce por ESFORÇO.** É a mesma disciplina do ciclo, do vento
> e do fôlego (nada de `Date.now()`), mas com um segundo motivo: o dreno tem de acompanhar o que
> o aluno FEZ, não quanto a aula durou — quem passou vinte minutos lendo o quadro não pode
> chegar faminto. Cada atividade soma exaustão fracionária num acumulador e, a cada **4,0**
> acumulado, um ponto de fome vai embora (número do Minecraft). A régua escolhida: **0,01 por
> bloco andado (400 blocos = 1 ponto), 0,02 por bloco colocado ou quebrado (200 = 1 ponto) e
> 3,0 por ponto de vida regenerado.** A edição vale o DOBRO do passo de propósito — neste jogo
> a atividade principal da aula é construir, não correr, então é a construção que tem de mover
> a barra. Ordem de grandeza: uma turma construindo gasta a barra inteira em ~50 min.
>
> **`VIDA_MINIMA_POR_FOME = 6`: a fome ENFRAQUECE, não mata.** A decisão do dia. O roadmap dizia
> "fome no zero → dano lento", e o dano existe (meio coração a cada 4 s, pela porta única
> `aplicarDano(…, "fome")`), mas ele **para em 3 corações** enquanto a comida (F6) não existir —
> matar de fome num jogo onde não há o que comer é frustração de aula, não desafio. É o análogo
> do nível "fácil" do Minecraft. Baixar a constante pra 0 devolve a inanição letal em UMA linha;
> o `textoDaMorte("fome")` já está escrito e o cliente já sabe pintar a tela.
>
> **O dreno sai do fluxo que o servidor JÁ recebe** — o `move` a 10 Hz que fecha a queda do F2 —
> e a edição é cobrada **num lugar só, depois do `switch` do `handleMessage`**: cada caso já
> devolveu cedo quando recusou, então "o mundo mudou" é o mesmo que "a edição valeu". Porta e
> cama (2 células) custam UMA edição; abrir porta e teleoperação de professor (`/bloco`) não
> custam nada. Passo maior que 4 blocos numa amostra é teleporte, não passo (respawn e `/tp`
> não cobram fome).
>
> **A regra `fome` virou o gate de verdade** (era decorativa desde o F1): desligada, a barra
> some do HUD na hora — o campo `fome` simplesmente não vai na mensagem `vida`, e **ausente
> significa "este mundo não tem fome"**. Quem já estava faminto quando o professor desligou
> volta a se regenerar (senão ficaria travado sem regeneração num mundo sem fome). O `/regra`
> parou de avisar "só passa a valer quando a mecânica existir" para a `fome` — agora só as
> pendentes de verdade (`manter-inventario`/F4 e `pvp`/F7) levam o aviso, por um campo
> `pendente` novo no registro.
>
> **HUD:** coxas ao lado dos corações, mesma escala (20 pontos = 10 ícones, meia coxa no ímpar).
> As duas barras vivem num flex `wrap` — em tela estreita a linha QUEBRA sozinha, sem media
> query. Detalhe que só o print pegou: a carne da coxa teve de ir pro lado ESQUERDO do ícone,
> porque o `clip-path` da metade recorta a esquerda e meia coxa tem de mostrar carne, não osso.
> O `?vida=` virou `?vida=13,45,7` e o F3 (tecla) agora mostra `vida 13/20  fome 7/20`.
>
> **VERDE:** typecheck 3/3 · **459 testes** (14 novos) · build · **9/9 smokes** (o `fome` é novo:
> prova o dreno pelo fio, criativo imune no mesmo mundo, a regra ligando/desligando a barra na
> hora e o piso de 3 corações) · print do HUD conferido (3 bolhas · 6½ corações · 3½ coxas, sem
> erro de console). **PLAYTEST PENDENTE** — headless não diz se a barra desce rápido demais.
>
> **SESSÃO 34 (2026-08-02) — A SOBREVIVÊNCIA COMEÇOU: §🍖 F1 E F2 NUMA SESSÃO.** O usuário
> fechou as pendências da 33 num turno ("deixa o push, playtest de relevo, luz+cavernas feitas,
> pode seguir") — **os dois playtests estão FEITOS e ele não pediu ajuste nenhum**, e o push
> segue adiado por escolha dele. Então a fila andou duas casas: F1 (o interruptor) e F2 (a
> primeira mecânica).
>
> **F2 — VIDA, DANO, MORTE, RESPAWN.** `shared/src/sobrevivencia.ts` puro (sem I/O, sem relógio
> de parede: o tempo entra como CONTAGEM DE TICKS, igual ao ciclo e ao vento) com **uma porta só
> pro dano** — `aplicarDano(estado, n, causa)`. Queda e afogamento são as causas do lite; fome
> (F3), PvP (F7) e mob (F8) entram pela MESMA função, só somando um valor em `CausaDano`.
> Escala do Minecraft: 20 pontos = 10 corações, queda de 3 blocos de graça e meio coração por
> bloco acima disso, 15 s de ar e 1 coração/s afogando, regeneração de 1 ponto a cada 4 s.
>
> **Quem fecha a queda é o SERVIDOR, do fluxo de `move` que ele já recebe** (10 Hz): guarda o
> pico de altura por cliente e cobra quando o jogador pousa, testando o apoio com
> `apoiadoNoChao` (novo em `physics.ts`, reusando a MESMA lógica de laje/escada do `collides` —
> nada de uma segunda definição de "chão"). **O cliente nunca reporta dano.** ⚠️ A tolerância
> está escrita no código: a 10 Hz cada amostra pode pular ~4 blocos, então a altura medida erra
> PRA MENOS — o aluno leva menos dano do que a queda real, nunca mais. Num jogo de sala de aula
> esse é o lado certo do erro. Teleporte (respawn, `/tp`) e troca de modo ZERAM o pico: quem
> voava em criativo não pode pousar machucado ao entrar em sobrevivência.
>
> **HUD novo (`client/src/vitals.ts`)**, self-contained como o `loading.ts`: corações (meio
> coração via `clip-path`), bolhas de ar, vinheta vermelha ao levar dano e aviso de morte —
> ícones em SVG embutido, zero asset externo. Criado SOB DEMANDA: mundo criativo não paga DOM
> nem CSS. **A UI nunca decide** (mesma disciplina do `inventory.ts`).
>
> **`?vida=7,45` na URL** (par do `?hora`/`?vento`/`?atlas`) congela o HUD pra inspeção. Foi
> assim que os corações foram VISTOS: print sobre a cena do `?bench` com 3 bolhas, 3 corações
> cheios e um pela metade, dentro da tela e sem erro de console.
>
> **O que o F1 entrega, e o que ele deliberadamente NÃO entrega:** sobrevivência ainda joga
> IGUAL a criativo. O que muda é o rótulo e o **voo** — quem está em sobrevivência não voa, nem
> com `/voo` liberado, nem sendo professor (é justamente ele que digita `/modo sobrevivencia eu`
> pra demonstrar). Vida, fome, inventário finito e craft são F2..F6 e vão LER daqui.
>
> **Duas camadas, e a de baixo é por NOME:** padrão do MUNDO (gravado no `.ljw`) + override
> pessoal por nome de jogador — não por id de cliente, porque o modo tem de sobreviver ao
> rejoin, igual ao roster e ao PIN. Quem resolve o efetivo é o SERVIDOR; a mensagem nova carrega
> só `modo {efetivo}`, porque o cliente não tem (nem precisa ter) o mapa de overrides.
>
> **`/regra` nasceu junto, e é o que faz as frentes seguintes serem baratas:** registro em
> `shared/src/regras.ts` (nome, padrão, ajuda) + UM comando genérico + UM campo
> `regras?: Record<string, boolean>` no `SaveMeta`. `manter-inventario` (LIGADA), `pvp` e `fome`
> já existem sem mecânica — o F2 vai só ler `valorRegra(...)`. Regra nova = uma entrada na
> lista: sem comando novo, sem campo novo, sem re-versionar save.
>
> **Três decisões que o código carrega e o teste prova:**
> 1. **`all` não arrasta o professor que digitou** — ele fica como está (e volta pra turma com
>    `eu`). É ele que precisa continuar voando pra supervisionar.
> 2. **Mundo-aula é criativo à força**, vencendo o save e recusando o comando: a aula distribui
>    um MODELO, não uma partida (mesma lógica do confinamento forçado do cp25).
> 3. **O save só grava o DIFF do padrão** — mundo que nunca viu sobrevivência sai byte a byte
>    como antes, e padrão novo passa a valer em mundo antigo sem migração.
>
> **A armadilha que só o smoke pegou (bug-547):** o smoke novo passou na 1ª rodada e FALHOU na
> 2ª, sem uma linha de código mudar. `LJ_NOVO=1` **não recria mundo que já existe** — ele só
> AUTORIZA criar onde não há arquivo. Como o smoke ESCREVE estado persistente (modo, ajuste
> pessoal, regra), a 2ª rodada nascia com o estado da 1ª. A pista foi a assimetria: ana passava
> e bia falhava, que era exatamente o estado final da rodada anterior. O manifesto do
> `scripts/smoke.mjs` ganhou `limpar: [pastas]`, e o smoke rodou 2× seguidas pra provar.
>
> **VERDE:** typecheck 3/3 · **445 testes** (53 novos) · build · **8/8 smokes** (dois novos: o
> `modo` prova o `all`, quem entra depois, o aluno barrado e a ida-e-volta pelo DISCO; o `vida`
> prova que o servidor fecha a queda, que criativo é imune no MESMO mundo, que a morte devolve
> ao spawn avisando a turma e que a regeneração anda no tick) · bench headless boota, streama e
> mesha · print do HUD de vida conferido. **NÃO COMMITADA** — a 33 também segue sem push.
>
> **PLAYTEST PENDENTE, e é o que mais importa agora:** headless não diz se morrer de queda é
> justo, se 15 s de ar é pouco, nem se os corações ficam legíveis no tablet. Ver §pendências.
>

---

## 🎯 O que é o projeto

Jogo sandbox voxel 3D, **web**, engine e assets próprios (NÃO usar Minecraft/Eaglercraft
code ou assets — projeto.txt seção 9 proíbe software não licenciado). Objetivo pedagógico:
desenvolver pensamento lógico / raciocínio computacional (BNCC, ISTE/CSTA, Wing).
Alternativa gratuita e própria ao Minecraft Education para a rede estadual (SC).

**A pedagogia mora nos CENÁRIOS, não no motor.** O jogo é uma plataforma de autoria:
professores (e alunos) criam mundos + objetivos dentro do próprio jogo e distribuem.

Público: 2º ao 9º ano do fundamental. Turmas homogêneas (diferença máx. 3 anos por turma).
8–20 alunos simultâneos. Entrega final = **relatório de aplicação com alunos** (piloto),
com parte técnica como anexo. Dev 100% vibecode; o usuário orquestra, não revisa código.

Ordem real de trabalho: **motor → cenários → piloto com uma turma → relatório.**
Documento é o ÚLTIMO entregável, não o primeiro. Construir, não documentar.

---

## ✅ Concluído

- **§⚡ DESEMPENHO — CICLO FECHADO (sessão 27, 2026-07-27).** Perfilado o notebook do
  laboratório (Intel UHD 630), diagnosticado que o custo era CPU de meshing na main thread
  (`malha` 9,7–13,4 s contra 1,9 s no dev, com `mundo` idêntico → não era rede), movido o
  mesher do streaming pra Web Worker (`meshVizinhanca` = função pura sobre um cubo 18³),
  medido o A/B no lab, corrigida a regressão de FPS que o Worker sem freio causou
  (coalescência de job em voo + profundidade por fase) e fechada a profundidade em 1 com 6
  rodadas etiquetadas. **Resultado: FPS do caminho síncrono (50) com a carga em 4,5 s no
  lugar de 11,5 s, e cauda melhor que a do síncrono (p95 26,7 × 28,1).** Nenhum gatilho de
  otimização segue aceso.
- Entrevista de requisitos (2026-07-10). Todas as decisões abaixo.
- Revisão do projeto com Fable 5 (2026-07-10): render fechado em **three.js**;
  código vai morar em `~/projetos/logica-em-jogo` (WSL), fora do OneDrive.
- Git iniciado (branch `main`, identidade local) + commit dos docs (2026-07-10).
- **Scaffold do monorepo (2026-07-10):** npm workspaces `shared/` + `server/` + `client/`.
  TS 7 estrito (base em `tsconfig.base.json`), Vite 8, three.js 0.185, ws 8, tsx, vitest 4.
  `/shared` exporta `BlockId` (0=ar…4=areia), `CHUNK_SIZE=16`, dims de mundo, `SERVER_TICK_RATE=10`
  — com teste de contrato passando. `/client` = cena three.js mínima (prova pipeline).
  `/server` = placeholder ws (checkpoint 5). Verificado: typecheck 3/3, testes, build, smoke do ws.
- **Checkpoint 1 (2026-07-11): mundo estático + andar + HUD F3.** Novo em `/shared`
  (TS puro, zero deps): `world.ts` (chunks Uint8Array, get/setBlock em coords de mundo),
  `worldgen.ts` (value noise determinístico — mesma seed = mesmos bytes), `mesher.ts`
  (culled mesher FUNÇÃO PURA + layout do atlas), `physics.ts` (gravidade/colisão AABB/pulo,
  com sub-passos anti-tunneling; servidor reusa p/ validar depois). Novo em `/client`:
  `atlasTexture.ts` (atlas procedural via canvas, sem assets externos), `chunks.ts`
  (1 mesh/chunk, remesh() pronto pro checkpoint 3), `input.ts` (pointer lock + WASD),
  `hud.ts` (F3: FPS, frametime méd/p95, remesh, draw calls/tris, rede zerada, export JSON),
  `main.ts` reescrito. 20 testes passando (world/mesher/physics/blocks), typecheck 3/3,
  build ok, screenshot headless confirma o mundo renderizando (terreno + areia + overlay).
- **Push pro GitHub (2026-07-11):** repo privado `meketreve/logica-em-jogo` (criado no
  scaffold), remote `origin` já configurado — main sincronizada. Backup do código ok.
- **Checkpoint 2 (2026-07-11): servidor autoritativo via Web Worker.** Novo em `/shared`:
  `protocol.ts` (mensagens JSON com parse DEFENSIVO dos dois lados + `world_snapshot`
  binário — header "LJW0" LE com dims+seed, validado no decode) e `session.ts`
  (GameSession pura, independente de hospedeiro, clock injetável: `join`→snapshot,
  `move` registrado, `debug_stats` 1×/s com tick méd/máx). Novo em `/server`: `worker.ts`
  (host Web Worker — SÓ transporte + agendar tick). Novo em `/client`: `connection.ts`
  (interface `Connection` = mesma do WebSocket do checkpoint 5, com contadores de rede).
  `main.ts`: mundo agora CHEGA do servidor (join → snapshot → decode → render); cliente
  manda `move` 10×/s; HUD F3 mostra rede real (msg/s, B/s, tick méd/máx do servidor).
  Física do próprio jogador segue local (servidor valida depois). 33 testes (13 novos:
  protocol roundtrip/validação + session), typecheck 3/3, build ok (worker = bundle
  separado de 3,3 kB), screenshot idêntico ao checkpoint 1 — como planejado.
  Playtest do usuário ✅ ("tudo certo").
- **Checkpoint 3 (2026-07-11): colocar e quebrar bloco.** Novo em `/shared`: `raycast.ts`
  (DDA Amanatides-Woo, função pura — cliente mira, servidor pode validar depois),
  `PLAYER_REACH=5` em constants, `isPlaceable()` em blocks. Protocolo: `place_block`/
  `break_block` (coords inteiras validadas) e `block_changed` (ServerMessage virou união;
  cliente NÃO distingue origem — jogador, outro jogador ou gravidade futura). Session
  valida TUDO no servidor: join obrigatório, bounds, célula ar/sólida, alcance com folga
  (pos do move a 10 Hz), não emparedar jogador (AABB); spawn agora é autoritativo.
  Cliente: clique esq/dir → mensagem → servidor → `block_changed` → setBlock local +
  `remeshBlock()` (remesh do chunk + vizinhos na borda); highlight de mira (LineSegments),
  crosshair, hotbar 1–4 (grama/pedra/pedregulho/areia). 42 testes (9 novos), typecheck
  3/3, build ok, screenshot com crosshair+hotbar. Areia colocada FLUTUA — esperado,
  gravidade é o checkpoint 4. Playtest ✅; "não coloca na outra chunk" investigado =
  borda do MUNDO, by design (bug-004; repro script confirma place interno ok).
- **Checkpoint 4 (2026-07-11): areia cai — REGRA DE OURO implementada.** Novo em
  `/shared`: `rules.ts` — sistema GENÉRICO de atualização por vizinhança: `BlockRule`
  (lê mundo → devolve `BlockChange[]`), registro `RULES`, `ruleFor()`. Areia = 1 regra
  registrada ("baixo é ar → desce 1"); circuitos futuros = mais regras, MESMA engrenagem.
  Session: fila `dirty` (Set de coords empacotadas); `applyBlock` marca célula+6 vizinhos;
  tick drena o lote do tick anterior, roda regras, aplica mudanças (novas sujeiras ficam
  pro próximo tick → areia cai 1 célula/tick ≈ 10/s); guarda `changedThisTick` impede
  célula mudar 2× no mesmo tick (sem teleporte). Queda chega ao cliente como
  `block_changed` NORMAIS — cliente mudou ZERO linhas (só rótulo do HUD → 4). Ordem da
  regra: materializa embaixo antes de limpar origem (sem buraco piscando). 48 testes
  (6 novos: regra pura + cascata via protocolo + rejeição out-of-bounds do bug-004),
  typecheck 3/3, build ok. Playtest do usuário ✅ (2026-07-11, "tudo certo").
- **Checkpoint 5 (2026-07-11): segundo cliente (LAN) — Node+ws real.** Protocolo:
  `player_moved` (relay SÓ pros outros — servidor nunca ecoa pro autor; cliente não
  precisa saber o próprio id) e `player_left` (disconnect), parse defensivo dos dois.
  Session: move → broadcastExcept; handleDisconnect avisa quem fica (idempotente).
  `/server/src/index.ts` virou host real: embrulha a MESMA GameSession do worker
  (id por socket via contador, close→handleDisconnect, handler de error obrigatório,
  frames binários de subida ignorados), seed 20260710 igual ao worker. Cliente:
  `WsConnection` (mesma interface Connection; fila até open; binaryType arraybuffer),
  `?server=ws://host:8080` na URL escolhe hospedeiro (sem parâmetro = Web Worker
  local como antes); outros jogadores = caixa colorida por id (HSL golden ratio),
  sem lerp (gatilho: só se serrilhar). Sem "player_joined": presença emerge do move
  a 10 Hz. 51 testes (3 novos), typecheck 3/3, build ok. Smoke real (Node 24,
  WebSocket global, zero deps): 2 clientes ws no servidor — snapshot idêntico,
  relay sem eco, block_changed pros dois, player_left ✅. Screenshots headless:
  cliente via ws E via worker renderizam. **Playtest do usuário ✅ (2026-07-11,
  "tudo certo")** — achou o bug-010: rejoin nascia no fundo do buraco (spawn era
  recalculado por findSpawnY a cada join, sobre o mundo já escavado). **Corrigido:**
  spawn FIXO calculado uma vez no construtor da GameSession (terreno pristino) +
  mensagem `spawn` nova no protocolo (enviada antes do snapshot); cliente usa o
  ponto do servidor pra nascer e pra respawn (nunca deriva do snapshot). 53 testes
  (2 novos, incl. regressão: escavar coluna não muda spawn do próximo join),
  smoke real contra mundo escavado ✅. Re-playtest do usuário ✅ (2026-07-11, "top").
  **Checkpoint 5 FECHADO.** (Movimento remoto: usuário não reclamou de serrilhado —
  lerp continua adiado, gatilho não disparou.)
- **Checkpoint 6 (2026-07-11): chat + /bloco — código do MVP v0 COMPLETO.** Protocolo:
  `chat` client→server (texto) e server→client (autor+texto), parse defensivo;
  `MAX_CHAT_LENGTH=200` e `MAX_NAME_LENGTH=24` (servidor corta; nome vazio → "jogador").
  Session: chat exige join; texto vira broadcast pra TODOS com autor `nome#id`
  (eco pro autor = confirmação do round-trip); prefixo `/` = comando com resposta
  SÓ pro autor (autor "servidor"). 1 comando: `/bloco x y z id` — muda o mundo via
  applyBlock (MESMO pipeline: block_changed + fila de vizinhança → areia colocada
  por comando CAI no tick), sem checagem de alcance (comando é teleoperação),
  valida bounds/id/não-emparedar. Boas-vindas no join (chat do servidor) — prova o
  canal sem segundo cliente. Cliente: `chat.ts` (UI HTML/CSS sobre o canvas; Enter
  abre/envia, Esc fecha; mensagem some em 10 s e volta com o chat aberto;
  textContent = sem XSS), `events.ts` (gatilhos de som block_placed/block_broken/
  chat_message — áudio pluga depois, fora do MVP), input.ts ignora teclas vindas
  de campo de texto + `lock()` público (fechar chat re-trava o mouse). 57 testes
  (6 novos), typecheck 3/3, build ok. Smoke real (2 clientes ws): welcome,
  broadcast com autor, /bloco muda o mundo, resposta só pro autor, comando
  inválido não vaza ✅. Screenshot headless: welcome chat renderizado na tela.
  **Playtest do usuário ✅ (2026-07-11, "tudo funciona"). Checkpoint 6 FECHADO —
  MVP v0 COMPLETO: os 4 critérios de aceitação atendidos e jogados.**
- **Grupo A de blocos (2026-07-11, aprovado pelo usuário): 14 blocos novos** —
  terra, tronco (topo com anéis/lado com casca — prova textura por face), tábuas,
  tijolo, cascalho (CAI — regra de queda virou `fallingRule` GENÉRICA, areia e
  cascalho compartilham), rocha-matriz/bedrock (`isBreakable()` — jogador não
  quebra, `/bloco` remove = caminho do professor), 8 lãs coloridas (base da
  pedagogia de sequência). Atlas 4→8 tilesPerRow (20 tiles pintados, procedural).
  IDs 5–18 (APPEND only). Cliente: hotbar 18 blocos (1–9 direto + scroll do mouse
  cicla todos, `input.onWheel`), `?atlas` na URL mostra o atlas no canto
  (inspeção visual de texturas). 60 testes (3 novos: queda genérica, bedrock,
  cobertura mesher de TODO id colocável), typecheck 3/3, build ok, screenshot
  com atlas confere. Playtest do usuário pendente (texturas = gosto).
- **§🕐 TELA DE CARREGAMENTO (2026-07-26, sessão 25)** — `client/src/loading.ts` novo
  (self-contained, DOM+CSS injetados, padrão do `touch.ts`). Cobre do "jogar" até o mundo
  pronto, nos DOIS caminhos (worker e ws). **Progresso real** = `colunasCarregadas.size ÷
  total do raio` (o total é a MESMA conta do `streamColunas`: quadrado de `raioRender` em
  volta do chunk do spawn, recortado pelas bordas), monotônico e clampado; **spinner
  decorativo** no canto em CSS puro (gira mesmo se a rede parar = sinal de vida). Linhas:
  colunas prontas/total, em transferência (`colunasFaltando.size` da varredura §🔁 — sem
  segunda medição), chunks na fila de malha, taxa em **bits/s** (`bytesIn+bytesOut` ×8,
  amostrado 1×/s como o HUD F3), recebido, tempo + ETA pelo ritmo de colunas (EMA),
  hospedeiro. Fase honesta: conectando → recebendo/gerando o mundo → montando a malha →
  pronto (troca pra "malha" sozinha quando as colunas acabaram mas a fila não). Anel fica
  **indeterminado** (arco girando, "…") enquanto não há total — mundo denso vem num blob só
  e 0% parado parecia defeito. **Bloqueio do usuário resolvido (bug-515):** `updateOverlay()`
  ganhou `loading.ativo` (menu Esc não aparece mais durante a carga) e o mesmo na UI de
  toque. Fecha só com o raio inicial INTEIRO aplicado **E** `filaPendente === 0` (entrar
  antes = mundo com buracos), com um respiro de 400 ms em 100%; devolve o menu de pausa como
  porta de entrada (o clique é o gesto do pointer lock). **Extra:** `WsConnection` ganhou
  `aoFalhar` (onerror/onclose, avisa uma vez) → servidor fora do ar/IP errado vira mensagem
  vermelha + "voltar ao menu" (mesmo caminho do `join_denied`), em vez de spinner eterno;
  botão "entrar mesmo assim" aparece após 20 s. VERDE: typecheck 3/3, 329 testes, verificação
  headless em mundo E (33% · 56/169 colunas · 2.1 Mbps · ETA 4,7 s), mundo P (denso → 100% →
  fecha) e servidor inexistente (estado de erro). **Playtest do usuário PENDENTE.**

- **Sessão 25 — o resto (2026-07-26), tudo commitado:**
  - **§🕐 na TROCA DE AULA** (`/mundo carregar`): msg nova `mundo_trocando {nome}` sai do host
    logo APÓS o decode do .ljw e ANTES de salvar/gerar, a tela sobe na hora (fase `preparando`,
    anel indeterminado) e uma **fila de 2× rAF** garante que o frame COM a tela pintou antes do
    trabalho pesado. Pointer lock não é solto → ao fechar, volta a jogar sem clique.
  - **Quatro bugs achados LENDO PERFIL** (não por teste): **bug-517** `trocarMundo` fazia
    `buildAll()` em mundo lazy (460 800 remesh de slot vazio, ~19 s de trava); **bug-518** a
    sessão nova do `/mundo carregar` zerava o raio pra `RAIO_PADRAO` e o cliente não
    reanunciava (mundo cortado no anel 6, 252 repedidas); **bug-519** `meta` do perfil ficava
    no mundo do join; **bug-523** `TorchGlow.setFromWorld` varria BLOCO A BLOCO — 1,887 bilhão
    de células num mundo E = **41 s de aba travada** ("página não está respondendo"), e era a
    explicação dos ~38 s de long task iguais em três perfis de durações diferentes. Varredura
    por chunk: **41 361 ms → 2,9 ms**. Tocha de coluna do streaming agora ganha halo.
  - **Orçamento de mesh por TEMPO** (`meshMsPorFrame`, 1–16 ms, padrão 6) no lugar da contagem
    fixa: p95 da gravação **43–82 ms → 18,7/20,4 ms**, frames >50 ms **9–50 → 0**, FPS 41–53 →
    **57/60**, long tasks da sessão 128–299 → **2**. Preço combinado: `fila` 0 → 84/189.
  - **Perfilador com CONTEXTO e por FASE**: `jogador` (pos/yaw/pitch/voando/chunk), `config`
    (raio, orçamento, pixelRatio, fov), `gravacao.movimento` (estado, distância, velocidade,
    colunas novas), `fases[]` (carregando × jogando: fps, `renderPct`, travadas),
    `pioresTravadas` (top 5 com fase e segundo), `remeshPorCaminho` (fila × bloco × área),
    render × lógica. `?hud` abre o F3 no boot. **bug-524** (o `setRemesh` do loop apagava o
    campo novo) pego na verificação headless.
  - **§🧪 encanamento de verificação**: `npm run verify` e `npm run smoke` (manifesto em
    `scripts/smoke.mjs`, porta por cenário, `--lista`/`--rapido`), + smoke novo
    `_smoke-troca-raio.mjs` (6/6: anel 10 → 6 → 12 e a ordem aviso→snapshot).
  - **bug-516**: `npm run dev:server` serve o cliente COMPILADO — feature de cliente em
    `:8080` exige `npm run build` (loop rápido é `npm run dev`, vite 5173).

- **§📊 AS 7 DO PERFILADOR (2026-07-26, sessão 26) — playtest APROVADO, commitado:**
  - **`?bench` (`client/src/bench.ts` novo)** — mundo de seed fixa sem passar pelo menu,
    trajeto `pos = f(t)` (círculo a 18 b/s + giro 360° no fim), config canônica em memória,
    `hud.record()` do trajeto INTEIRO e download automático (`perf-bench-*.json`). Também
    publica em `window.__benchPerfil` (automação lê sem depender de download). O mundo do
    bench NÃO vai pro IndexedDB (encheria a lista do professor).
  - **Histograma** de frametime (≤8/≤16/≤33/≤50/≤100/>100 ms, n e %) na gravação.
  - **Carga por fase** exportada da §🕐 (`LoadingScreen.relatorio()`): uma entrada por carga,
    com `fasesMs` e `totalMs`. A fase MEDIDA é a efetiva (quando as colunas acabam e o mesher
    tem fila, quem segura é "malha").
  - **Marcadores** (`hud.marcar`): join, carga concluída, troca de aula, raio A→B, bench
    início/fim — cada um com segundo da sessão e fase; teto de 60.
  - **Regras do servidor no `debug_stats`**: células/tick, pior tick, mudanças e água por
    tick, agregadas na janela de 1 s. Campos **opcionais** no protocolo (host antigo não
    manda e o cliente não pode descartar a mensagem inteira).
  - **Tempo de GPU** (`EXT_disjoint_timer_query_webgl2`): pool de 4 consultas, leva inteira
    descartada em `GPU_DISJOINT`, amostra só com F3 aberto ou gravando, tudo em try/catch
    que DESLIGA a medição em vez de derrubar o render.
  - **`npm run bench:headless`** (`scripts/bench-headless.mjs`): roda o `?bench` num Chrome
    headless por CDP puro (sem puppeteer como dependência) e imprime o perfil. Os NÚMEROS
    dele não valem (SwiftShader) — é teste de encanamento.

- **§🍖 F4 — INVENTÁRIO AUTORITATIVO (sessão 36, 2026-08-03).** A mochila virou estado do
  SERVIDOR. Criativo segue com a paleta infinita, intocado, no MESMO mundo.
  - **`shared/src/inventario.ts`** (puro, imutável): 27 slots (`HOTBAR_SLOTS` 9 +
    `MOCHILA_SLOTS` 18), `STACK_MAX` 64, `tamanhoStack(id)` (balde = 1, porta pra ferramenta),
    `adicionar` (completa parcial antes de ocupar vazio, hotbar→mochila), `remover` (tudo ou
    nada, consome a pilha MENOR primeiro pra juntar restos), `espacoPara`/`cabe`, `moverSlot`
    (mesmo id junta, diferente troca) e a forma ESPARSA `SlotSalvo` com `parseInventario`
    defensivo — **uma porta de entrada só** pro save e pro protocolo.
  - **`shared/src/drops.ts`**: `formaCanonica` (a família volta como entrada da hotbar) +
    tabela de exceções (grama→terra, pedra→pedregulho, folha/água/bedrock→nada). Devolve
    LISTA porque o F6 vai querer "folha → fruta às vezes". Teste-portão varre todos os ids.
  - **Session:** `inventarios` por NOME; débito no MESMO ponto pós-`switch` do esforço do F3
    (porta/cama = 1 item); **mochila cheia RECUSA a quebra**, conferida ANTES do `applyBlock`,
    com aviso freado em 5 s; crédito depois, e a metade apagada pela regra não dropa.
    `manter-inventario` ganhou mecânica em `matar()` e saiu do `pendente`.
  - **`/dar <eu|all|nome> <id> [qtd]` NOVO** (fora do escopo travado, ver o diário): contraparte
    do `/bloco` — sem ele o professor não prepara atividade num mundo onde ninguém tem nada.
  - **Protocolo/save:** `inventario { slots }` server→client (só em sobrevivência: a AUSÊNCIA é
    o que diz "paleta infinita") e `mover_item { de, para }` client→server;
    `SavedPlayer.inventario?` esparso, ausente = vazia (mundo criativo não engorda o `.ljw`).
  - **Cliente:** `mochila.ts` novo (espelho puro), hotbar com contagem e slot vazio de altura
    fixa, painel "mochila" com 9 colunas e gesto tocar-origem→tocar-destino, `?mochila=`.
  - **bug-549** (bloco infinito: `changedThisTick` é Set, virou contador `edicoesAplicadas`) e
    **bug-550** (grade de 9 colunas colapsada sem `width: 100%`).
  - VERDE: typecheck 3/3 · 522 testes (63 novos) · build · 10/10 smokes (`inventario` é novo) ·
    prints da hotbar e da mochila conferidos. **Playtest PENDENTE.**
- **§🍖 F3 — FOME (sessão 35, 2026-08-02).** A barra desce por ESFORÇO, não por relógio.
  - **`shared/src/sobrevivencia.ts`:** `gastarEsforco(estado, esforco)` acumula exaustão
    fracionária e converte a cada `EXAUSTAO_POR_PONTO` (4,0, número do Minecraft);
    `tickFome(estado)` cobra o dano da barra zerada. Régua: **0,01 por bloco andado · 0,02 por
    bloco editado · 3,0 por ponto regenerado** (construir cansa o DOBRO de andar, porque a
    atividade da aula é construir).
  - **`VIDA_MINIMA_POR_FOME = 6` — a fome enfraquece, não mata.** Sem regeneração abaixo de 18
    de fome e meio coração a cada 4 s no zero, mas o dano PARA em 3 corações enquanto não houver
    comida (F6). Baixar pra 0 devolve a inanição letal em uma linha.
  - **Session:** passo tirado do fluxo de `move` (o mesmo do F2, com teto de 4 blocos por
    amostra pra teleporte não virar caminhada) e edição cobrada **num ponto só, depois do
    `switch` do `handleMessage`** — porta/cama custam UMA edição, `use_block` e `/bloco` não
    custam. Curar cobra `EXAUSTAO_POR_REGEN` no tick.
  - **A regra `fome` virou gate real:** desligada, o campo `fome` não vai na mensagem e o HUD
    não desenha coxa nenhuma; quem já estava faminto volta a se regenerar. `RegraDef.pendente`
    novo faz o `/regra` avisar só o que ainda não tem mecânica (`manter-inventario`, `pvp`).
  - **Protocolo/save:** `fome?` OPCIONAL na mensagem `vida` que já existia e `SavedPlayer.fome?`
    no molde da vida — mas **fome ZERO é válida no save** (barra vazia é estado de jogo; vida
    zero seria um morto).
  - **Cliente:** coxas ao lado dos corações num flex `wrap` (tela estreita quebra a linha sem
    media query), meia coxa pelo mesmo `clip-path` — com a carne à ESQUERDA, senão a metade
    mostraria só osso. `?vida=13,45,7` e `vida/fome` na linha do F3.
  - VERDE: typecheck 3/3 · 459 testes (14 novos) · build · 9/9 smokes (`fome` é novo) · print
    do HUD conferido. **Playtest PENDENTE.**
- **§🍖 F2 — VIDA, DANO, MORTE, RESPAWN (sessão 34, 2026-08-02).** A primeira MECÂNICA da
  sobrevivência. Só vale em modo sobrevivência: criativo é imune no MESMO mundo.
  - **`shared/src/sobrevivencia.ts`** (puro): `aplicarDano(estado, n, causa)` é a **ÚNICA porta
    de perda de vida** — queda e afogamento hoje, fome (F3), PvP (F7) e mob (F8) entram por ela.
    Mais `curar`, `danoDeQueda`, `tickFolego`, `tickRegen`, `textoDaMorte`, `parseCausaDano`.
    Números do Minecraft: 20 pontos, 3 blocos de queda de graça, 15 s de ar, 1 coração/s
    afogando, 1 ponto de regeneração a cada 4 s (com fome alta — a fome é do F3, e até lá a
    session passa `FOME_MAX`).
  - **`apoiadoNoChao(world, pos)` novo em `physics.ts`** — o servidor fecha a queda pelo fluxo
    de `move` (10 Hz) reusando a lógica de laje/escada do `collides`. **O cliente NÃO reporta
    dano.** A tolerância (~4 blocos por amostra, errando PRA MENOS) está comentada no código.
  - **Session:** `vitais` por NOME (como o modo — sobrevive ao rejoin), `picoQueda` por cliente
    (rascunho, morre no disconnect), `machucar`/`matar`/`acompanharQueda`/`tickVitais`. Morte =
    aviso no chat pra TURMA + respawn no spawn autoritativo, cheio. Teleporte e troca de modo
    zeram o pico. Água amortece a queda.
  - **Protocolo:** `vida { vida, causa?, morreu?, folego? }` — só a vida é obrigatória; causa
    desconhecida NÃO derruba a mensagem. Vai no join (em sobrevivência) e quando muda o que o
    HUD desenha (coração ou bolha), nunca 10×/s.
  - **Save:** `SavedPlayer.vida?` — só o MACHUCADO viaja; valor doente (0, negativo, gigante,
    texto) degrada pra vida cheia.
  - **Cliente:** `client/src/vitals.ts` novo (corações com meio coração por `clip-path`, bolhas,
    vinheta de dano, aviso de morte; SVG embutido, criado sob demanda), eventos `dano`/`morte`
    em `events.ts` (som pluga depois) e `?vida=N[,folego]` pra inspeção visual.
  - VERDE: typecheck 3/3 · 445 testes (20 novos) · build · 8/8 smokes (`vida` é novo) · print
    do HUD conferido no headless. **Playtest PENDENTE.**
- **§🍖 F1 — `/modo` E `/regra`, O INTERRUPTOR (sessão 34, 2026-08-02).** Primeira frente da
  SOBREVIVÊNCIA. Nada de mecânica: o que muda é o rótulo e o voo.
  - **`shared/src/modo.ts`** (puro): `Modo = criativo|sobrevivencia`, `MODO_PADRAO`,
    `parseModo` (tolera acento e caixa), `modoEfetivo(mundo, pessoal)`, `podeVoarNoModo`.
    **Sobrevivência não voa — nem professor**, de propósito.
  - **`shared/src/regras.ts`** (puro): registro `manter-inventario` (LIGADA) · `pvp` · `fome`,
    com `valorRegra`/`parseRegras`/`regrasParaSave`. Comando genérico `/regra [nome [ligar|
    desligar]]`. **Sem mecânica ainda** — a resposta do comando avisa isso ao professor.
  - **Session:** `modoMundo` + `modosPorJogador` (por NOME) + `regras`; `/modo` com as 5
    formas fixadas com o usuário (consulta · mundo · `eu` · `nome`/`@nome` · `all`), consulta
    liberada pra turma e mudança professor-only pelo `parts.length` (molde do `/hora`).
  - **Protocolo:** `modo {efetivo}` novo, resolvido no servidor e mandado em TODO join —
    inclusive criativo, porque troca de aula é sessão NOVA (família do bug-518).
  - **Save:** `modo?`, `modosPorJogador?`, `regras?` (MAPA) — opcionais e gravando só o DIFF
    do padrão; parse defensivo pula nome/valor inválido. Mundo-aula força criativo.
  - **Cliente:** `podeVoar()` passa por `podeVoarNoModo`, F3 mostra `modo`/`voo`, autocomplete
    conhece `/modo` e `/regra` (e o `/vento`, que faltava desde a sessão 28).
  - **bug-547:** `LJ_NOVO=1` não recria mundo existente → smoke com estado persistente virava
    sorteio. `limpar: [pastas]` novo no manifesto do `scripts/smoke.mjs`.
  - VERDE: typecheck 3/3 · 425 testes (33 novos) · build · 7/7 smokes · bench headless ok.
- **§🏔️ RELEVO POR BIOMA — a v2 DA GERAÇÃO FECHADA (sessão 33, 2026-07-30).**
  - **`Bioma` ganhou relevo e neve:** `relevo` (teto de amplitude da serra, [0,1]) e `neve`
    (flag). `relevoPorClima(clima)` mistura os tetos pela pertinência de cada bioma e
    multiplica pelo fator de NÚCLEO — que zera na divisa, e é isso que mantém a montanha
    dentro de um bioma só em vez de montada na fronteira.
  - **`heightAt` multiplica a amplitude da serra por esse fator** (5º parâmetro `clima` opcional,
    só pra quem já calculou não pagar 2 ruídos de novo). Colinas seguem GLOBAIS de propósito:
    é o que dá continuidade onde o relevo é zerado. Mundo baixo (aula, sizeY 64) sai antes da
    serra e **não mudou um byte** — tem teste.
  - **Neve virou `Bioma.neve`** no lugar de `temp < 0.6`: `topoPrevisto` continua a fonte única
    do bloco de topo, e o HUD F3 mostra o relevo da coluna (`relevo 0.42 (teto do bioma 1)`).
  - **O portão de fronteira (bug-544):** a 1ª ligação passou typecheck e testes e abriu penhasco
    de **14–23 blocos**. Sweep medido escolheu `RAMPA 0,25` + `NÚCLEO (0,4→1,0)` → **degrau máx
    4–6, paridade exata com o heightmap global, zero pares acima de 6.** Tetos medidos:
    araucárias 106 · mata 68 · cerrado 53 · caatinga 36 (era 106 — a duna do playtest).
  - **Custo negativo:** geração 4,53 → 4,00 ms/coluna, triângulos da cena do `?bench`
    700 230 → **647 858 (−7,5%)**, chunks com malha 586 → 549. Terreno mais baixo alivia a GPU.
  - **`shared/vitest.config.ts` novo (bug-545):** `maxWorkers: 8` + `testTimeout: 20000` porque
    o default (1 fork por núcleo × mundos de 128³) fazia a suíte falhar por contenção, não por
    código. **392/392 e 92 s → 37 s.**
  - VERDE: typecheck 3/3 · 392 testes (4 novos) · build · 6/6 smokes · 5/5 luz.
    **Playtest PENDENTE.**
- **§💡 LUZ VOXEL + §🏔️ CAVERNAS (sessão 32, 2026-07-28)** — commits `1be4ab0` e `f1dd05f`.
  A fase da fila era a v2 da geração; o portão de produto aberto era a luz, e o usuário
  escolheu **luz COMPLETA antes de escavar** (mais: **caverna seca sob o mar**, com casca).
  - **Luz mora 100% no CLIENTE** — é função pura dos bytes do mundo e o cliente já os tem, então
    não há mensagem nova nem custo de tick, e dois clientes convergem sozinhos. `shared/src/
    luz.ts`: 1 byte/célula com céu e tocha em dois nibbles, BFS com a regra da **descida reta**
    (céu no máximo descendo não perde nível — é o que faz existir sombra sob teto),
    `atualizarBloco` incremental devolvendo o conjunto de chunks sujos.
  - **Mesher** ganhou o atributo `luz` por vértice (a face mostra a luz da célula que ela
    ENCARA); **shader** enxertado ENCADEANDO o `onBeforeCompile` do §🌬️ — o canal do céu escala
    com a hora, o da tocha não. Anoitecer não custa remesh: é uniform.
  - **Cavernas** por interseção de dois ruídos 3D, função pura de `(x,y,z,h,seed)` (mundo E é
    lazy: coluna vizinha só fecha a galeria respondendo igual sem consultar o mundo). Escava
    depois do minério (veia cortada na parede) e `findSpawnSeco` ganhou veto de boca de caverna.
  - **Três medições mudaram decisão:** acender coluna 18,4 → **2,48 ms** (a BFS enfileirava as
    ~32 mil células de céu; só a banda rente ao relevo tem trabalho) · worldgen 2,63 → 28,6 →
    **3,49 ms/coluna** (ruído célula a célula derrubou o smoke `pedir-coluna`; amortizado por
    fatia, mundo byte a byte idêntico) · densidade de caverna **varia 2,9%–7,3% por seed**, e a
    do `?bench` é das mais vazias — calibrar por ela teria dado o dobro.
  - **Verificação nova `npm run shots:luz`**: compara a mesma cena do `?bench` ao meio-dia e à
    meia-noite. Pega os dois modos de a luz falhar calada (shader que não compila; shader que
    compila sem fazer nada). 5/5, noite/dia = 0,48.
  - **Custo:** +66% de triângulos (153 852 → 255 234), +28% de draw calls. **Não medido no lab.**
  - VERDE: typecheck 3/3 · 388 testes (30 novos) · build · 6/6 smokes. **Playtest PENDENTE.**

---

## 🚀 Próxima fase — §🍖 F5: CRAFT POR LISTA (~1 sessão)

A ordem do backlog está **travada pelo usuário** (sessão 29):
**auto-update ✅ → layouts mobile ✅ (1ª rodada) → v2 da geração ✅ (sessões 32+33) →
sobrevivência ← EM CURSO (F1..F4 feitos nas sessões 34, 35 e 36).**

⚠️ **Decidir com o usuário se o F6 (comida) vem antes, depois ou JUNTO.** O F3 nasceu com a
inanição LIMITADA a 3 corações (`VIDA_MINIMA_POR_FOME`) porque não havia o que comer; agora que
existe inventário, o laço da fome dá pra fechar. As duas frentes se cruzam (pão = uma receita),
e cada uma é ~1 sessão. A ordem travada é F5 → F6.

**F5 = `shared/src/receitas.ts` puro** (`Receita { saida, custo[] }` + `podeFabricar(inv,
receita)`) + painel-lista com filtro e "falta 3 tábua". O servidor valida e aplica; o cliente só
pede. Decisões travadas no `.wolf/ROADMAP.md §🍖` — quem pegar NÃO reabre:

- **Grade 3×3 DESCARTADA** — arrastar dói no tablet/Kindle Fire e trava aluno de 2º ano. O
  gesto que o F4 estreou no painel da mochila (tocar na origem, tocar no destino) é o molde.
- **Sem bancada no lite** — fabrica em qualquer lugar. A bancada, se um dia servir pra
  *escalonar* receitas avançadas, vira um campo `exige` na receita.
- **O F4 já entregou tudo de que o F5 precisa:** `contar`/`remover`/`cabe`/`adicionar` puros,
  a mensagem `inventario` que já redesenha a tela sozinha, e o `/dar` pra semear a aula.
- **O balde entra aqui** (ver TODO): hoje ele não é item de mochila, e o ramo dele no
  `main.ts` está guardado por `mochila.ativa` justamente por isso.

**Depois do F5:** F6 comida → F7 `/pvp` (atalho da regra que já existe) → F8 mobs (fora do
lite) → F9 preset `sobrevivencia`. Escopo item a item em `.wolf/ROADMAP.md §🍖`.

### §🍖 F4 — o que ficou aberto

- **`/dar` está FORA do escopo travado** (decisão minha na sessão 36, ver o diário). Se o
  usuário não quiser, some com um `case` — mas aí a aula de sobrevivência começa com todo
  mundo de mãos vazias e sem craft até o F5.
- **Não existe DESCARTAR item.** Mochila cheia só destrava quebrando menos ou usando o que
  tem. "Soltar no chão" é entidade (orçamento do F8); "jogar fora" (item some) seria uma
  mensagem nova de 5 linhas, se o playtest pedir.
- **A hotbar de criativo continua em `localStorage`** e a de sobrevivência é a do servidor. Não
  há sincronia entre as duas de propósito: são coisas diferentes (paleta × mochila).
- **Nenhuma tecla move item.** Só o painel (tocar/clicar). Se alguém pedir "shift-clique manda
  pra mochila", é uma chamada a `moverSlot` com o primeiro slot livre — barato.
- **Minério cai como ele mesmo** (não há item bruto até existir fundição). É uma linha em
  `EXCECOES` no dia em que houver.

### §🏔️ Relevo por bioma — o que ficou aberto

- **Os 4 tetos são o botão de ajuste** (`Bioma.relevo` em `shared/src/biomas.ts`): caatinga 0,1 ·
  cerrado 0,35 · mata 0,5 · araucárias 1. Mexer neles é UMA linha cada, e o teste do portão
  (`O PORTÃO: nenhum degrau maior que 6 blocos`) diz na hora se a mudança criou penhasco.
- **`RAMPA = 0,25` e `NUCLEO = (0,4 → 1,0)` são MEDIDOS** — não afinar a olho. O sweep está no
  comentário do próprio arquivo, com as variantes rejeitadas e o número de cada uma.
- **Chapada (`ROCHA_HEIGHT = 85`) está inalcançável de propósito** e documentada assim no
  `worldgen.ts`. Se o usuário pedir mesa de pedra no cerrado, o caminho é BAIXAR o número (ou
  subir o `relevo` do cerrado), não escrever gen novo.
- **Mata chega a 68 e não neva** — grama em pico de 68 é decisão da flag `Bioma.neve`, não
  esquecimento. Se ficar estranho no playtest, `neve: true` na mata é uma linha.
- **Neve só nas araucárias** derrubou a área nevada 5× (4 925 → 935 blocos de neve num mundo M).
  Era exatamente o pedido do playtest ("neve em cima de morro de cerrado não combina").

### §💡 Luz voxel — o que ficou aberto

- **Iluminação é POR FACE, não suavizada por vértice.** Os 4 vértices de uma face levam o
  mesmo byte. Suavizar (média das células em volta de cada vértice, estilo AO) é refino
  conhecido e **não muda o pipeline** — o atributo já existe. Só fazer se alguém reclamar do
  degrau entre faces.
- **`torchGlow.ts` continua existindo** como halo decorativo, agora POR CIMA da luz de bloco
  real. Ninguém olhou se os dois juntos ficam exagerados — é pergunta de playtest.
- **Piso de brilho = 0,05** (`luzMin` em `client/src/luzShader.ts`). Escolhido pra caverna dar
  silhueta sem dar leitura, num jogo de sala de aula. Se o playtest disser "não dá pra andar",
  é UMA linha.
- **Nada de luz no SAVE.** A luz é derivada dos bytes, então mundo antigo abre e acende igual
  — nenhuma migração de formato. Mundo salvo ANTES da sessão 32 continua sem caverna (a
  caverna fica assada no `.ljw`), e isso está certo: mundo de aula não muda debaixo do
  professor.

### Layouts mobile — o que ficou aberto da 1ª rodada

- **Playtest no tablet** virou pendência externa (o usuário faz na escola — ver ⚠️ abaixo).
- **Painéis de AUTORIA** (`#painel`: quadros, objetivos, regiões) e o de **grupo/jogadores**
  não foram revistos — o usuário os deixou fora do escopo. Seguem em `min(580px, 94vw)` /
  `min(560px, 84vh)` com box-sizing content-box; os botões internos já têm alvo de 40px.
  O caminho que funcionou no inventário foi **ALARGAR em paisagem baixa**, não quebrar linha.
- **Nome do mundo truncado no DESKTOP** ("seque…", "labirin…"): a coluna do nome fica com
  ~84px depois dos 3 botões. Em paisagem baixa já resolveu (painel de 680px). No desktop
  resolve com UMA linha (`.menu-screen { width: min(680px, 92vw) }` sem media query), mas é
  mudança visual não pedida numa tela de uso diário — **só com o aval do usuário.**

### Pendências que não bloqueiam nada, e quem faz é o usuário

-3. **PLAYTEST DA SOBREVIVÊNCIA (F1..F4, sessões 34, 35 e 36) — o mais novo, e o único que
   headless não substitui.** Do **F4**, o que só o dedo responde: o painel "mochila" (tecla E)
   usa **tocar no item → tocar no destino**, não arrastar — funciona no tablet? A contagem no
   canto do slot é legível no DPI do aparelho? Os 9 slots por linha cabem em RETRATO? Começar
   de mãos vazias frustra, ou `/dar all <id> <qtd>` resolve a aula? E **mochila cheia recusando
   a quebra** lê como cuidado ou como bug? Exige `npm run build` se for pelo `:8080`. Como entrar: professor digita
   `/modo sobrevivencia all` (a turma vai junto, ele fica em criativo pra supervisionar) ou
   `/modo sobrevivencia eu` pra sentir na pele. O que olhar:
   1. **Morrer de queda é JUSTO?** O dano começa em 4 blocos e mata em 23 (contas do
      Minecraft). ⚠️ A altura vem de amostras a 10 Hz e erra PRA MENOS — se ele achar que
      "caiu de 10 e não doeu", é a tolerância, não bug. O botão é `danoDeQueda`.
   2. **15 s de ar é pouco ou muito?** `FOLEGO_TICKS` (150 ticks). Afogar tira 1 coração/s.
   3. **Os corações e as bolhas são legíveis?** Estão 96px acima do rodapé, 18px cada. **No
      tablet ninguém olhou** — pode brigar com a hotbar de toque (é a mesma faixa).
   4. **A vinheta vermelha de dano incomoda?** Ela é curta (~90 ms) e só nas bordas.
   5. **Voltar ao spawn ao morrer funciona pra aula?** Em mundo grande o spawn pode ficar
      longe do que o aluno estava construindo. Se incomodar, "cama = ponto de renascer" é
      feature nova (a cama já existe como bloco), não ajuste.
   6. **Regenerar 1 ponto a cada 4 s é rápido demais?** Curar agora CUSTA comida
      (`EXAUSTAO_POR_REGEN = 3`), então quem se machuca muito passa a sentir a barra.
   7. **A fome desce rápido demais? (§🍖 F3, o número mais provável de mudar)** A régua está em
      `shared/src/sobrevivencia.ts`: **400 blocos andados = 1 ponto** (`EXAUSTAO_POR_BLOCO_ANDADO`)
      e **200 blocos construídos = 1 ponto** (`EXAUSTAO_POR_EDICAO`). A ordem de grandeza mirada
      é a barra inteira em ~50 min de aula ativa. Se descer rápido demais, o botão é UM número.
   8. **As coxas ficam legíveis ao lado dos corações?** Em tela estreita a linha quebra sozinha
      (flex `wrap`) e as duas barras empilham. **No tablet ninguém olhou** — mesma faixa da
      hotbar de toque, e agora com uma barra a mais.
   9. **A fome parar em 3 corações parece bug ou parece cuidado?** É deliberado
      (`VIDA_MINIMA_POR_FOME = 6`): não há comida no jogo até o F6. Se ele quiser que mate,
      é uma linha — mas aí o F6 vira a próxima frente, não o F4.
   10. **Vale a `/regra fome desligar` pro fundamental 1?** Ela já funciona: a barra some da
       tela na hora e ninguém cansa mais. É a resposta pronta se a turma menor se atrapalhar.
-2. ✅ **PLAYTEST DO RELEVO POR BIOMA (sessão 33) — FEITO** (declarado em 2026-08-02), **sem
   pedido de ajuste**. Os botões seguem documentados caso ele mude de ideia: `BIOMAS.*.relevo`
   (caatinga 0,1 · cerrado 0,35 · mata 0,5 · araucárias 1), `SNOW_HEIGHT`, `Bioma.neve` — e o
   teste `O PORTÃO: nenhum degrau maior que 6 blocos` diz na hora se a mudança criou penhasco.
-1. ✅ **PLAYTEST DA LUZ E DAS CAVERNAS (sessão 32) — FEITO** (declarado em 2026-08-02), **sem
   pedido de ajuste**. Botões, se voltar o assunto: `luzMin` = 0,05 (`client/src/luzShader.ts`),
   `PISO_LUAR` = 0,22 (`client/src/daynight.ts`), `LIMIAR_CAVERNA` = 0,06
   (`shared/src/worldgen.ts`). **O que continua NÃO medido é o FPS do lab** — ver ⚠️ abaixo.
0. **PLAYTEST MOBILE — o usuário faz NA ESCOLA** (declarado em 2026-07-28). A 1ª rodada de
   layouts está verde no headless, mas headless não tem dedo, teclado do Android nem o DPI do
   aparelho. O que olhar, na ordem em que foi mexido:
   1. **Hotbar:** tocar num slot troca de bloco? (caminho NOVO — antes só o inventário trocava)
   2. **Chat:** com o teclado aberto, o campo continua visível? O histórico rola?
   3. **Menu → Meus mundos:** com vários mundos, dá pra chegar no "voltar" lá embaixo?
   4. **Inventário:** as 6 abas cabem numa linha? Dá pra acertar aba e slot com o dedo?
   5. **F3 (📊) e objetivos:** ainda passam por baixo da barra de botões do topo?

   **Não bloqueia a v2 da geração** — são arquivos disjuntos (CSS/UI × `shared/src/worldgen`).
   Se voltar com ressalva, é edição pontual no `client/index.html` + `npm run shots:tablet`.
1. **Rodar `iniciar-servidor.bat` no Windows uma vez.** O auto-update do `.sh` foi exercitado
   nos 8 caminhos (clone local + npm falso); o `.bat` NÃO — não há cmd.exe no WSL. É duplo
   clique; se o bloco de update falhar, o pior caso é ele avisar e subir a versão instalada.
2. **A/B do §🌬️ no notebook do lab:** `?bench` e depois `?bench&semvida`, duas URLs seguidas
   na MESMA máquina. O perfil se etiqueta sozinho (`meta.bench.semVida`, `config.nuvens/
   balanco`) e o lado B nasce `perf-bench-semvida-*.json`. Comparar com a régua abaixo. Só
   vale se o relatório quiser o custo de nuvens/balanço — **não é gatilho de desempenho.**
   **O lado do PC de dev JÁ FOI FEITO (sessão 30):** custo ≈0,54 ms de GPU (méd 5,16 → 4,62;
   p95 8,81 → 8,19), **invisível em FPS por causa do vsync**. Só falta a máquina apertada.
3. **Deck da CRE** (`relatorio/apresentacao-cre.html`) pronto e não apresentado. Se ele voltar
   com pedido de mudança, editar por Edit ancorado em texto de slide — o base64 dos prints
   vive no mapa `IMGS` do `<script>`, não no `src`, justamente pra isso.

Único detalhe visual nunca olhado ao vivo: **o sentido por face da 28c** (a tabela está no
diário acima). Se um dia despejar um balde, conferir — e lembrar que as laterais
PERPENDICULARES ao fluxo mostram a onda DESCENDO de propósito (não há horizontal a mostrar
numa face que o fluxo atravessa) e que o mar segue o vento, também de propósito. Headless não
resolve isso: o mar gerado não tem fluxo nenhum.

**Nenhum gatilho de desempenho está aceso.** Quem retomar ESCOLHE do backlog abaixo.

**A régua, pra qualquer perfil futuro se ler contra:**
- **PC de dev (RTX 2060):** `profiles/perf-bench-2026-07-27T01-24-08-311Z.json` — 60 FPS ·
  p95 16,9 ms · GPU 4,02 ms · carga 4,76 s · fila 0.
- **Notebook do lab (Intel UHD 630, 8 núcleos, NA TOMADA):** `…-l9xf.json` — 50 FPS ·
  p50 20,0 · p95 26,7 · p99 31,4 ms · GPU méd 13,0 / p95 16,8 · carga 4 508 ms · fila 0.
- **Ruído do instrumento ≈ 1–2%** (duas rodadas na mesma máquina): diferença acima disso é
  SINAL. É esta linha que autoriza tratar um número novo como evidência.

**Como ler um perfil, na ordem que funcionou:** `carga.fasesMs` (`mundo` = rede/worldgen,
`malha` = CPU de meshing — separa os dois sem instrumentação nova) → `gravacao.histogramaMs`
(a FORMA) → `fases[]` + `pioresTravadas` com os `marcadores` do lado → `gpu` comparada com o
frametime (é o teste de "é render?") → `mesher` (workers e profundidades: a etiqueta do
experimento, existe desde bug-529).

### ⚠️ Dois tetos que NÃO se atravessa com código

-1. **O RELEVO POR BIOMA DEVOLVEU 7,5% DE TRIÂNGULOS** (cena do `?bench`: 700 230 → 647 858;
   chunks com malha 586 → 549), medido pelo mesher em Node (função pura — não depende de a fila
   de malha drenar, que no SwiftShader não drena). Alívio parcial no item 0 abaixo: terreno mais
   baixo fora das araucárias mesha menos. **Ainda NÃO foi medido no lab** — segue valendo o teto
   do item 1.
0. **§🏔️ AS CAVERNAS COBRARAM +66% DE TRIÂNGULOS** (153 852 → 255 234; draw calls 518 → 665),
   medido no `?bench` do PC de dev em 2026-07-28. O salto grande é ter caverna QUALQUER — o
   chunk de subsolo deixa de ser sólido-sem-faces; aumentar densidade depois é barato
   (0,075 daria 294 256, só +15% sobre o 0,06 escolhido). **Isso ainda NÃO foi medido no
   lab**, e é lá que a GPU já está no teto (item 1 abaixo). Se o FPS cair na escola, o botão
   é `LIMIAR_CAVERNA` (`shared/src/worldgen.ts`) — e a régua de densidade está no teste
   `escava na densidade calibrada`, que mede a média de 5 seeds.
   ⚠️ **A seed do `?bench` (20260726) é das mais VAZIAS** (2,9% contra 7,3% da pior): o número
   acima é o melhor caso, não o típico.
1. **GPU p95 16,8–19,6 ms contra 16,7 ms** de orçamento de 60 FPS no lab. **O mesher acabou.**
   Se um dia o FPS incomodar de novo, o alvo é GPU — teto de `raioRender` em GPU fraca,
   overdraw da água, custo de fragment. **Greedy meshing continua DESCARTADO:** draw calls
   (633) e triângulos (188 048) do lab são IDÊNTICOS aos do PC de dev, então não é aí que a
   máquina fraca perde.
2. **Notebook em modo economia de bateria trava em 30 FPS** (`p50` 33,3 ms cravado, GPU 28%
   mais cara). É política de energia do Windows. Perfil medido nesse estado NÃO serve pra
   comparar otimização — checar o estado da máquina antes de concluir qualquer coisa.

### Backlog — ORDEM TRAVADA pelo usuário (sessão 29)

1. ~~**Auto-update do servidor**~~ **FEITO** (`fbbe3d0`): `git pull` no launcher, pergunta
   antes, `--ff-only`, 6 escapes. Falta só o teste no Windows (pendência 1 acima).
2. ~~**Layouts mobile**~~ **1ª RODADA FEITA (sessão 31)**: menu, inventário/hotbar e chat/HUD
   em 1024×600. Falta o **playtest no tablet** (pendência 0) e os **painéis de autoria**, que
   o usuário deixou de fora desta rodada.
3. ~~**v2 da geração de mundo**~~ **FEITA (sessões 32 e 33)**. `ROADMAP.md §🏔️`.
   - ~~**Luz voxel** (pré-requisito que o usuário mandou entregar antes)~~ **FEITA (sessão
     32)**: céu + tocha, repropagação incremental, 100% no cliente.
   - ~~**Cavernas**~~ **FEITAS (sessão 32)**: interseção de 2 ruídos 3D, todo mundo
     procedural, secas sob o mar com casca.
   - ~~**Relevo "montanha de verdade" por bioma**~~ **FEITO (sessão 33)**: teto por bioma +
     fator de núcleo, degrau de fronteira em paridade com o heightmap global (≤ 6), neve por
     flag de bioma, custo NEGATIVO (−7,5% de triângulos).
4. **Sobrevivência** (fome/vida/craft) ← **AQUI**. **Escopo ABERTO na sessão 30 (2026-07-27)**,
   nada codado. Entrevista feita, decisões travadas, 9 frentes e as colisões (mundo-aula, claims,
   bench, save, protocolo) escritas em `.wolf/ROADMAP.md §🍖`. Ler de lá e começar pelo F1
   (`/modo`, o interruptor sem mecânica).

Fora da fila, sem ordem definida:
- ~~`ROADMAP.md §🌬️` — vento + vida ambiental~~ **FEITO na sessão 28** (frentes 1 a 6).
  Sobrou só o que o §🌬️ NÃO pediu: som do vento; vento empurrando partículas/chuva;
  o vento entrar na física (decisão explícita: é SÓ visual até alguém decidir o contrário).
- **Som de água** (splash/borbulha/balde, WebAudio em `audio.ts`) — 4ª opção do refino de
  água, nunca escolhida.

**Entregável final (relatório) está essencialmente PRONTO** — pendências só opcionais:
embutir 2–4 prints no §3, refs em ABNT, diagrama no Anexo A. Se o usuário pedir entrega,
o passo é gerar PDF/HTML de `relatorio/relatorio-aplicacao.md`. **O §desempenho do relatório
agora tem material forte:** o par A/B com o caminho síncrono e a régua dev × lab.

**Hitbox da laje: ENCERRADA (2026-07-26).** O usuário testou e confirmou — "hitbox já está
correta", NADA a mudar. Laje segue com mira na METADE (`blockSelectionBox`) e colisão de MEIA
ALTURA (`temColisaoParcial`); NÃO copiar o modelo de célula cheia da cerca/porta. Se uma
sessão futura achar isso "inconsistente", é decisão validada em playtest — deixar como está.

**Sessão 34 (2026-08-02) NÃO COMMITADA** — §🍖 F1 e F2 estão só na árvore de trabalho (mais o
`client/dist` reconstruído pelo `npm run verify`). O usuário mandou **deixar o push** e seguir
pra próxima fase; quando ele pedir, vão os 3 commits da 33 + os desta. Sugestão de recorte:
`feat(sobrevivencia): /modo e /regra (F1)` · `feat(sobrevivencia): vida, dano, morte (F2)` ·
`fix(smoke): limpar mundo antes do smoke (bug-547)` · `docs(wolf)`.
**Sessão 33 COMMITADA (2026-07-30), 3 commits, PUSH PENDENTE:** `cb987ed` (config do vitest —
o gate era sorteio) · `2aaf0e9` (§🏔️ relevo por bioma + dist) · `docs(wolf)` do handoff.
Sessões 20+21 (`26151f9`/`41211ff`/`5d18899`), 24 (`e3eaac4`) e 25 commitadas.
**Sessão 27 commitada e pushada:** `51bc5c8` (mesher em Worker) + `b3669ff` (wolf) +
`0a3dd3f` (PR do openwolf) + `efaf6df` (profundidade 1 + etiqueta no perfil).
**Sessão 28 COMMITADA E PUSHADA** (2026-07-27): `b9bc7a3` (§🌬️ frentes 1-6) + `3418cf4`
(regra da correnteza, 28b) + `7db6890` (sentido por face, 28c). Diário completo da 28 está em
`.wolf/history.md` (rotacionado pra fora do STATUS).
**Sessão 29 COMMITADA E PUSHADA** (2026-07-27), 7 commits: `26b7650` (`?semvida` + etiqueta
do A/B) · `fbbe3d0` (auto-update no launcher) · `f23d5a9` (README + deck da CRE + relatório
sem data) · `e49aa15` (privacidade: apelido e save de teste fora da árvore) · `edec801`
(wolf) · `f6d72af` (LICENSE source-available) · `26ee413` (decisões no cerebrum).
**Sessões 30, 31 e 32 COMMITADAS E PUSHADAS** (2026-07-28, 9 commits de uma vez — as sessões
30 e 31 tinham ficado só locais). Da 32: `1be4ab0` (§💡 luz voxel) · `f1dd05f` (§🏔️ cavernas) ·
`dd80426` (wolf) · `3064aae` (cerebrum consolidado 20,3k → 9,9k) · `581fbcd` (handoff).
**O repo é PÚBLICO agora:** `github.com/meketreve/logica-em-jogo` — e é daí que o launcher da
escola puxa, então push atrasado = notebook do lab desatualizado.

---

## 📁 Arquitetura ativa

- **Padrão central:** UM módulo de lógica de jogo (servidor autoritativo) que roda em 3
  hospedeiros SEM reescrita: (a) Web Worker no singleplayer, (b) .exe portátil (Tauri/Node
  SEA) que serve HTTP+WebSocket, (c) servidor Node dedicado. Cliente só renderiza + envia input.
- **Transporte:** WebSocket (mensagens iguais em todos os hospedeiros).
- **Save:** mundo salvo no PC do host (professor). Persiste entre aulas.
- **Restrição dura do navegador:** aba NÃO abre socket de escuta e NÃO executa binário.
  Por isso "abrir pra LAN" é papel do HOST (professor roda .exe/servidor), não do aluno.
  WebAssembly NÃO contorna isso (roda dentro do sandbox). Confirmado nesta entrevista.

---

## 🌐 Rede: WSL invisível na LAN (em curso 2026-07-27)

O host roda no WSL2 → IP próprio (`172.28.17.24`) atrás de NAT. Windows entra por
`localhost` (encaminhamento só vale pra conexão originada no Windows), **outro PC da rede
não** — bate em `192.168.3.100:8080` e não há ninguém escutando.

**Aplicado:** `C:\Users\Meketreve\.wslconfig` criado com `networkingMode=mirrored` +
`hostAddressLoopback=true` (WSL 2.6.3, Windows 11 24H2 — suporta). Falta o usuário rodar
`wsl --shutdown` e, em PowerShell ADMIN, as duas regras de firewall: `New-NetFirewallRule`
(porta 8080, perfis Private/Domain — trocar por `Any` se a escola for rede Pública) e
`New-NetFirewallHyperVRule` (VMCreatorId `{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}`) — no modo
espelhado o tráfego passa pelos DOIS firewalls.

**✅ PEGOU (conferido em 2026-07-27, sessão 29):** `hostname -I` dentro do WSL devolve
`192.168.3.100` — modo espelhado ativo, o `wsl --shutdown` já aconteceu. O que NÃO foi
verificado é o par de regras de firewall (nenhum outro PC da rede foi testado contra a
porta 8080); se o outro PC não abrir, é ali que falta.
**Desfazer:** apagar o `.wslconfig` + `wsl --shutdown`.
**Plano B** (sem mexer em config, mas o IP do WSL muda a cada boot): `netsh interface
portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080
connectaddress=<IP do WSL>`.
**Saída definitiva:** host nativo no Windows (o .exe portátil do professor já está no plano) —
sem camada de WSL no meio.

## ⚠️ Pendências externas (não bloqueia coding)

- Testar cedo num PC REAL do lab (usuário tem admin em todas as máquinas/escolas).
- Distribuição inicial: pasta compartilhada do Drive.
- Certificado de assinatura de código (custo anual) — futuro, pra adoção fora da escola-piloto.

---

## 🔧 Comandos úteis

```bash
npm run dev         # Vite dev server do cliente (http://localhost:5173)
npm run dev:server  # servidor Node+ws em watch (placeholder até checkpoint 5)
npm test            # testes do /shared (vitest)
npm run typecheck   # tsc --noEmit nos 3 workspaces
npm run build       # build de produção do cliente
npm run verify      # typecheck + testes + build (o portão antes de commitar)
npm run smoke       # cenários de rede reais (--lista diz o que cada um prova)
npm run bench:headless   # roda o ?bench num Chrome headless e imprime o perfil
npm run shots:tablet     # mede+fotografa a UI em 1024×600 com pointer:coarse
npm run shots:luz        # §💡 compara o MESMO bench ao meio-dia e à meia-noite
```

**Verificação da luz** (precisa do `npm run dev` rodando em outro terminal): mede a
luminância de uma janela de terreno nas duas horas e falha se o meio-dia estiver escuro, se a
meia-noite estiver em preto absoluto, se a razão noite/dia não cair, ou se o console cuspir
erro de shader. Prints em `.wolf/designqc-captures/luz/`. ⚠️ **Nunca medir cor lendo o canvas
pela página** — `drawImage` de canvas WebGL fora do frame devolve preto e o A/B "passa" com
0/0 (bug-540); o script decodifica o PNG do CDP justamente por isso.

**Verificação de layout mobile** (precisa do `npm run dev` rodando em outro terminal):

```bash
npm run shots:tablet                       # 1024×600, Kindle Fire — a RÉGUA
npm run shots:tablet 1280 800              # tablet Android comum
COARSE=0 npm run shots:tablet 1920 1080    # regressão do desktop
```

Cada linha do relatório é uma medição, não uma impressão: "cabe / ESTOURA" compara
`getBoundingClientRect` com a altura da janela, "menor alvo" tem piso de 40px, e
"chat × hotbar" mede a intersecção dos dois retângulos. Prints em
`.wolf/designqc-captures/tablet-<L>x<A>/` (ignorada pelo git). Numa rodada `COARSE=0` as
linhas ✗ de joystick e alvo de dedo são ESPERADAS — só valem em aparelho de toque.

**Modo benchmark (o que mandar pro PC do lab):**

```
http://<host>:8080/?bench            # 30 s, mundo E (streaming), seed 20260726
http://<host>:8080/?bench=60         # trajeto mais longo
http://<host>:8080/?bench&tamanho=P  # mundo denso: mede só render
http://<host>:8080/?bench&semvida    # lado B do A/B do §🌬️ (nuvens+balanço OFF)
```

**A/B do §🌬️ (custo da vida ambiental), 2 URLs seguidas na MESMA máquina:**
`?bench` depois `?bench&semvida`. O perfil se etiqueta sozinho (`meta.bench.semVida`,
`config.nuvens/balanco`) e o arquivo nasce `perf-bench-semvida-*.json` no lado B, então o par
não se confunde na pasta. Comparar com a régua do lab (`…-l9xf.json`).

---

## 📚 Referências (leia SE precisar)

- `projeto.txt` — proposta pedagógica completa (BNCC, fundamentação, indicadores seção 14).
- `.wolf/cerebrum.md` — Decision Log com o PORQUÊ de cada escolha.
- `.wolf/anatomy.md` — índice de arquivos.
