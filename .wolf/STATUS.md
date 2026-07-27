# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.
> **SESSÃO 28b (2026-07-27) — PLAYTEST DO §🌬️: a regra da correnteza.**
> O usuário rodou bench no PC dele e no notebook: **"achei tudo muito top"**, com UMA ressalva
> — e ela é de REGRA, não de bug: *"só a animação do vento na agua fluindo que achei
> contraditório, pois a correnteza da agua fluindo deve ditar o movimento e direção da
> textura"*. Está certo: vento não manda em correnteza.
>
> **Uma regra resolve os dois casos, sem flag nova.** `tileDaAgua` (mesher) tira o fluxo do
> **GRADIENTE DE NÍVEL** da vizinhança: cada vizinho horizontal de nível MENOR puxa a água pra
> lá, com peso na diferença. Só vizinho de ÁGUA conta — contar ar faria a borda de todo lago
> "escorrer pra fora". Daí:
> - **mar/lago** do worldgen é 100% FONTE (nível 8) → gradiente zero → **água parada, segue o
>   vento** (a frente 3 continua valendo onde ela faz sentido);
> - **riacho/queda** é 8→7→6→… → gradiente aponta pra jusante → **segue o fluxo**, com ritmo
>   próprio (8 fps fixos), alheio ao vento. A fonte no topo da queda tem vizinho mais baixo,
>   então ela corre também.
>
> **Como foi feito:** 8 tiles de atlas (`TILE.aguaFluxo` 112-119), um por setor de
> `setorDaDirecao`, e o MESHER escolhe o tile por célula. Não virou atributo de vértice nem
> material novo de propósito — assim o mesher segue função pura de bytes, o contrato do Worker
> não muda e o remesh que a água já dispara ao mudar de nível reaproveita tudo.
>
> **Dois cuidados de custo que entraram junto.** (1) A pintura da água virou `putImageData`: a
> versão anterior montava uma string `rgb(r,g,b)` e trocava o `fillStyle` A CADA PIXEL, e com 9
> tiles de água isso seriam 2 304 strings alocadas e reparseadas por repintura. (2) **Teto de
> 12 repinturas/s**, porque `texture.needsUpdate` reenvia o atlas INTEIRO (256², 262 KB) — não
> só o tile mexido — e dois relógios independentes somariam mais de 20/s na GPU do lab.
> ⚠️ Por isso os 8 tiles de fluxo TÊM de ficar contíguos no começo de uma linha do atlas: um
> `putImageData` de 128×16 exige retângulo (travado em teste).
>
> **Verificação:** typecheck · **355 testes** (5 novos: lago de fontes fica parado · riacho
> 8→7→6 aponta pra jusante · rumo acompanha o eixo · contiguidade dos 8 tiles ·
> `setorDaDirecao`) · build · **riacho SIMULADO com o `waterRule` de verdade** (fonte num platô,
> 40 ticks) mostrando os 8 setores radiais e o mar na água parada · `?atlas` no headless
> confirmando a faixa dos 8 tiles pintada no lugar certo.

> **SESSÃO 28 (2026-07-27) — §🌬️ VENTO + VIDA AMBIENTAL: as 6 frentes, de uma vez.**
> O usuário escolheu o §🌬️ do ROADMAP, pediu as perguntas em LOTE antes de ficar AFK e
> respondeu: **escopo TODO (frentes 1 a 6)** · vento com **rotação lenta + rajadas** ·
> `/vento` **só liga/desliga** (recusou ajuste manual de direção/força) · **codar, testar e
> commitar, sem push**.
>
> **A base é o vento como ESTADO DO MUNDO** (`shared/src/vento.ts`): `ventoNoTick(tick, seed)`
> é função PURA do tick, mesmo molde do `horaDoDia` — nada de relógio de parede, nada de
> `Math.random`, dois hosts no mesmo tick veem o mesmo vento. Direção gira 360° em 300 s com
> bamboleio; força soma maré de 97 s + rajada de 13,7 s (períodos primos entre si pra o padrão
> não fechar ciclo curto). Vai pelo fio na msg `vento` (join + 1×/s, junto do `time`); o
> cliente suaviza por frame. **Nasce LIGADO** (é ambiência, não regra de atividade) e **só o
> DESLIGADO ocupa bytes no save**.
>
> | Frente | Entregue |
> |---|---|
> | 1 textura da água | onda com vetor **INTEIRO** (fecha no tile de 16 px = sem costura), 2 senos cruzados, crista com brilho especular fake |
> | 2 vento | estado autoritativo + `/vento ligar\|desligar` + persistência |
> | 3 água segue o vento | 8 setores + **crossfade entre setores vizinhos** (mata o "pop" a cada ~37 s); velocidade da correnteza pela força |
> | 4 nuvens | UM plano no skyGroup, FBM tileável no alpha, scroll pelo vento, cor seguindo o sol, **ancorado ao MUNDO** (desconta a câmera → tem paralaxe) |
> | 5 folhas | atributo `sway` por vértice no mesher + `onBeforeCompile` no material do terreno |
> | 6 grama alta | `GramaAlta/Seca/Fria` (179-181), cruz de 2 lâminas, 3 tiles, hotbar, worldgen por clima |
>
> **Dois cuidados que o código guarda e não são óbvios.** (a) **O canvas do atlas anda ao
> CONTRÁRIO do mundo nos dois eixos** — no topo do bloco o mesher mapeia `u = 1 − x`, `v = z`,
> e o canvas 2D tem y pra baixo. Sem negar os dois, a água corre CONTRA o vento. Travado em
> `ondaAguaDoVento` (shared) + teste de sinal. (b) **O balanço de folha usa frequência
> espacial BAIXA** (0,16 rad/bloco): cubos de folha vizinhos são independentes, e se cada um
> se deslocar diferente a copa abre fresta — a 0,16 o desencontro fica em ~0,2 px de tela.
>
> **Custo de GPU: chaves prontas, número NÃO medido em máquina real.** Nuvens (fill rate) e
> balanço (vértice) entram num orçamento de GPU que **já estava no teto** no notebook do lab
> (p95 16,8–19,6 ms contra 16,7 ms). As duas viraram config em **Configurações → seção de
> desempenho** (`settings.nuvens`, `settings.balanco`), ambas ON, e estão fixadas em
> `BENCH_SETTINGS` — perfil tem de medir o jogo que o aluno joga. **Falta rodar `?bench` no
> notebook do lab pra saber o preço.**
>
> **Verificação:** typecheck (3 pacotes) · **350 testes verdes** · build · `npm run smoke` 6/6
> · 3 screenshots headless (CDP + `?bench`, escondendo todo filho de `<body>` que não é
> canvas) confirmando água, capim, nuvens de dia e ao entardecer. Bugs: **bug-530**
> (`MAX_BLOCK_ID` não acompanhou o append do bloco novo → grama alta recusada no place) e
> **bug-531** (teste de claim acoplado ao conteúdo do worldgen).

> **SESSÃO 27 (2026-07-26) — O NÚMERO DO LAB CHEGOU. Veredito: jogável; o custo é a ESPERA.**
> O usuário rodou `?bench` DUAS vezes no notebook de professor (idêntico aos PCs da sala):
> `profiles/perf-bench-1785117299927-v1w4.json` e `-1785117351891-nfhx.json`.
> Máquina: **Intel UHD 630** (ANGLE D3D11, `0x00009B41`, Comet Lake) · **8 núcleos** ·
> 1920×1080 · dpr 1 — contra RTX 2060 / 24 núcleos da régua.
> **As duas rodadas concordam** (p50 18,8/18,6 · p95 30,6/30,1 · GPU 14,64/14,16 · remesh
> total −1,2%) → dentro do ruído de 1–2% medido na sessão anterior. **É sinal.**
>
> | | dev (régua) | lab v1w4 | lab nfhx |
> |---|---|---|---|
> | FPS médio | 60 | 49 | 50 |
> | p50 / p95 / p99 ms | 16,7 / 16,9 / 18,1 | 18,8 / 30,6 / 42,2 | 18,6 / 30,1 / 40,3 |
> | frames >50 ms | 1 | 7 | 4 |
> | **GPU méd / p95 ms** | 4,22 / 7,21 | **14,64 / 19,56** | **14,16 / 18,87** |
> | **carga total ms** | **4 760** | **16 519** | **12 938** |
> | carga: mundo / **malha** | 2 406 / **1 856** | 2 328 / **13 401** | 2 507 / **9 732** |
> | remesh ms por chunk | **1,65** | **3,58** | **3,54** |
> | draw calls / triângulos | 633 / 188 048 | 633 / 188 048 | 630 / 186 716 |
> | fila no fim | 0 | 0 | 0 |
>
> **Leitura, na ordem combinada.** (1) **`carga` é onde dói**: 12,9–16,5 s contra 4,76 s, e o
> delta é INTEIRO em `malha` — `mundo` é idêntico (2,3–2,5 s), logo **não é rede nem
> worldgen, é CPU de meshing** (2,2× mais lento por chunk). A tela de carga roda a 30–42 FPS
> com 1,5–2,4 s de long task. A diferença 16,5 × 12,9 entre as duas rodadas **não é cache
> quente**: o trabalho TOTAL de meshing é o mesmo (18 835 × 18 614 ms, −1,2%) — o que mudou
> foi onde o "pronto" disparou, empurrando meshing pra dentro do bench. (2) **Histograma NÃO
> é bimodal**: é a distribuição inteira deslocada com cauda fina (≤16 ms 15% · ≤33 ms 82% ·
> >33 ms 3%; no dev era 98,4% num pico só). (3) **`pioresTravadas` prova que o orçamento por
> tempo (MEDIÇÃO 5) aguentou na máquina fraca**: TODA travada grande (2 185, 799, 407 ms)
> está em `carregando`; em `jogando` o pior é 76 ms, depois 56/54/51. (4) **`gpu` rodou DE
> VERDADE pela primeira vez** — o driver Intel expõe `EXT_disjoint_timer_query_webgl2`, 240
> amostras (headless nunca teve a extensão; ver STATUS anterior).
>
> **O que isso muda na decisão.** Mesmo trabalho de render (draw calls e triângulos
> IDÊNTICOS aos do dev), GPU 3,5× mais lenta. **Mesher em Worker segue certo, agora com dois
> motivos medidos em vez de um:** (a) tira 9,7–13,4 s de meshing da main thread → corta ~10 s
> da espera do aluno e destrava a tela de carga; (b) no steady state o meshing come
> **3,7–6,0 ms/frame** (18–30% do frame; a rodada `nfhx` bate no teto `meshMsPorFrame: 6`),
> devolvidos levam p50 de 18,7 → ~15 ms. **MAS o teto mudou**: a previsão do dev era "60
> travado" e aqui não vale — **GPU p95 19,6 ms > 16,7 ms de orçamento**, então depois do
> Worker o p95 encosta em ~20 ms de qualquer jeito. Worker leva 50 → ~57–60 FPS, não 60
> travado; a cauda só cai cortando trabalho de GPU (raio, overdraw da água, fragment).
> ⚠️ **Ressalva do bench:** `serverHost: "web-worker (benchmark)"` — o servidor rodou local
> na aba. **Este número NÃO mede o WiFi da sala.** Carga real na aula = estes 13 s + rede.
>
> **MESHER EM WEB WORKER — CODADO NA MESMA SESSÃO.** Arquivos: `shared/src/mesher.ts`
> (refatorado), `client/src/meshWorker.ts` e `client/src/meshPool.ts` (novos),
> `client/src/chunks.ts`, `client/src/hud.ts`, `client/src/main.ts`, `scripts/bench-headless.mjs`.
> **Desenho.** O mesher virou função pura de verdade: `meshVizinhanca(viz)` recebe um cubo
> **18³ (`CHUNK_SIZE+2`)** e não conhece mais `World`. Isso cabe porque TODO acesso a bloco do
> mesher está em `[-1..16]` nos 3 eixos (face culled, cerca, pé/cabeceira da cama, porta de
> cima, e os cantos inclinados da água que olham ±1 em x/z e +1 em y). `extrairVizinhanca`
> monta o cubo: interior por `set()` de linhas de 16 bytes (x é contíguo nos dois layouts),
> só a casca por `getBlock`. `meshChunk(world,…)` continua existindo como wrapper —
> servidor e testes não mudaram. O MUNDO fica na main thread (física e raycast leem `world`);
> `SharedArrayBuffer` exigiria COOP/COEP pra poupar uma cópia de 5,8 kB.
> **Pool:** `min(4, núcleos−1)` workers, **8 jobs em voo por worker** — com 1 job cada eles
> ficariam ociosos entre frames (a main só alimenta 1×/frame ≈16 ms e um chunk custa ~3,5 ms)
> e o pool renderia MENOS que o caminho síncrono. Ida e volta por transfer, zero cópia.
> **Correção (o que impede buraco na tela):** versão monotônica por chunk — resultado que
> volta com versão vencida é DESCARTADO (o chunk mudou por edição, `descartarColuna` ou
> `trocarMundo` entre o envio e a volta). `filaPendente` agora soma fila + em-voo +
> prontos-não-aplicados, senão a tela de carga (§🕐, gate `=== 0` em main.ts) sairia com o
> mundo cheio de furo. `onerror` do worker → pool colapsa, chunks em voo voltam pra fila e a
> sessão segue síncrona (fila que nunca esvazia travaria a tela de carga pra sempre).
> **ESCOPO:** só o caminho `fila` (streaming) foi pro Worker. `remeshBlock`/`remeshBox`/
> `buildAll` seguem síncronos — são resposta a ação do jogador (1 frame de atraso se nota) e
> no perfil do lab foram **0% do custo** (`remeshPorCaminho`: 5 267 na fila, 0 em bloco/área).
> **VERDE:** typecheck 3/3, **334 testes** (3 novos: a casca reproduz `getBlock` célula a
> célula inclusive quinas e fora do mundo; `meshVizinhanca(extrairVizinhanca(…))` é
> **byte-idêntico** a `meshChunk(…)`; o fast path de chunk ar/ausente continua devolvendo
> nada), build ok (`meshWorker-*.js`, 18 kB).
> **A/B HEADLESS (`?semworker` novo, mesma máquina, mesmo minuto)** — `npm run bench:headless`
> com `?bench=15&tamanho=E`. O script agora imprime `geometria` e `remesh`, porque uma fila
> que zera SEM produzir mesh passaria despercebida (era o risco do refactor):
>
> | | com Worker | `?semworker` |
> |---|---|---|
> | carga total / `malha` | **4 696 / 1 527 ms** | 14 376 / **11 370 ms** |
> | remesh (n) | 4 815 | 2 622 |
> | remesh **main thread** | **761 ms** (0,158 ms/chunk) | 2 447 ms (0,933 ms/chunk) |
> | remesh dentro do worker | 4 065 ms | 0 |
> | fila no fim | **0** | **1 057** (nem terminou) |
> | draw calls / triângulos | **636 / 196 012** | 318 / 113 578 |
>
> **O que este A/B prova e o que NÃO prova.** Prova: (a) a geometria é real e completa — 636
> draw calls e 196 k triângulos, na mesma ordem do bench real (633/188 k); (b) **~6× menos
> main thread por chunk** (0,158 × 0,933 ms), que é a razão estrutural extract+BufferGeometry
> contra mesh inteiro; (c) o trabalho TOTAL se conserva — 761+4 065 = 4 826 ms para 4 815
> chunks (1,00 ms/chunk) contra 0,93 ms/chunk síncrono, ou seja **a cópia padded custa ~7% de
> CPU a mais**, e essa CPU está fora do frame. **NÃO prova o ganho de FPS:** headless roda em
> SwiftShader a 8–10 fps, então o orçamento de 6 ms/frame vira 60 ms/s de meshing e o caminho
> síncrono nem termina de carregar — o 3× de carga aqui está EXAGERADO pelo ambiente.
>
> **O PAR A/B DO LAB CHEGOU (2026-07-27, notebook de professor).**
> `perf-bench-1785120251535-jkso.json` = COM Worker · `perf-bench-1785120314529-t3xn.json`
> = `?semworker`. **Resultado DIVIDIDO — e é o dado que decidiu o desenho final.**
>
> | | `?semworker` (t3xn) | Worker sem freio (jkso) | |
> |---|---|---|---|
> | **carga total** | 11 535 ms | **5 147 ms** | ✅ −55% |
> | **carga `malha`** | 8 481 ms | **2 208 ms** | ✅ −74% |
> | remesh main ms/chunk | 3,064 | **0,375** | ✅ 8,2× menos |
> | **FPS médio** | **50** | 36 | ❌ |
> | p50 / p95 ms | 19 / 28,1 | **25,4 / 44** | ❌ |
> | frames >50 ms | 2 | **23** | ❌ |
> | frames ≤16 ms | 17,1% | **1,8%** | ❌ |
> | remesh (n) | 5 456 | **7 904** | ⚠️ +45% |
> | trabalho de mesh | 16,7 s (main) | **23,7 s** (worker) | ⚠️ +42% |
> | GPU méd | 13,6 ms | 15,13 ms | ⚠️ |
>
> **Duas causas, ambas por eu ter TIRADO O FREIO junto com o mesher.**
> (1) **Trabalho duplicado (+45%).** `enfileirarColuna` põe a coluna nova E as 4 vizinhas.
> Com a fila lenta do caminho síncrono, `filaSet` fundia essas re-entradas — coalescência de
> graça. Com o pool esvaziando rápido, cada re-entrada virou job próprio e o anterior foi
> descartado por versão vencida: **2 448 jobs de puro desperdício em 7 904**.
> (2) **Sem throttle no steady state.** O síncrono tinha `meshMsPorFrame: 6` = meshing preso
> a ~30% de UM núcleo. O pool rodava 4 workers a plena carga; num i5 de 4 núcleos físicos
> isso disputa núcleo com a main thread e com a thread do driver D3D11 — por isso até a GPU
> subiu (13,6 → 15,1 ms), o que meshing por si só não explicaria.
>
> **CORREÇÃO APLICADA (mesma sessão).**
> - **Coalescência de volta:** `chavesEmVoo` + `sujosEmVoo` no `ChunkRenderer`. Chunk que já
>   tem job no worker não abre job duplicado — fica marcado sujo e é re-enfileirado UMA vez
>   quando o resultado (vencido) chega.
> - **Freio por FASE:** `MeshPool.modoCarga`, ligado a `loading.ativo` em main.ts.
>   Profundidade **8 jobs/worker na CARGA** (não há frame pra proteger, a tela de carga está
>   na frente) e **2 na JOGATINA** (~30% de ocupação de worker, vazão ~400 chunks/s contra
>   ~100/s do síncrono, que já mantinha fila 0 no lab).
> - **Knob `?meshdepth=N`** — profundidade de jogo por worker. Existe porque o **2 saiu de
>   conta de ocupação de núcleo, NÃO de medida no lab**; headless roda a 8–16 fps e é o
>   regime errado pra calibrar isso.
>
> **Verificação headless (mesma máquina, 3 rodadas):** dedup cortou remesh 4 815 → 3 803
> (−21%) e worker 4 065 → 3 566 ms, com `carga.malha` 1 527 → 1 229 ms. Profundidade 1
> terminou com **fila 91** (a vazão escala com o FPS, e a 16 fps não dava conta); com
> profundidade 2 a **fila fecha em 0** e a geometria volta pro nível certo (576 draw calls).
> **VERDE:** typecheck 3/3, 334 testes, build ok.
>
>
> **KNOB FECHADO: `PROFUNDIDADE_JOGO = 1` (2026-07-27, 6 rodadas no notebook do lab).**
> O usuário rodou a sequência `?bench` (=2) → `&meshdepth=1` → `&meshdepth=4` DUAS vezes:
> primeiro **na bateria em modo economia com <30%**, depois **na tomada**.
>
> **O lote da bateria não serve pra escolher e o perfil diz por quê:** `p50 = 33,3 ms` nas
> TRÊS rodadas — 30 Hz exato, vsync cravado pelo modo economia, não carga — com GPU ~28% mais
> cara (méd 16,7–17,4 · p95 25,7–27,6). Frametime nesse regime não mede contenção de mesh.
> Rodadas: `rmcb` (=2) · `t87u` (=1) · `l9yc` (=4).
>
> **Lote da tomada — o que decidiu** (`tkc7`=2 · `l9xf`=1 · `bjrv`=4, contra `t3xn`=síncrono):
>
> | | depth 2 | **depth 1** | depth 4 | síncrono |
> |---|---|---|---|---|
> | FPS | 42 | **50** | 47 | 50 |
> | p50 / p95 ms | 22,7 / 34,3 | **20,0 / 26,7** | 20,1 / 31,9 | 19 / 28,1 |
> | p99 ms | 44,3 | **31,4** | 39,3 | 34,6 |
> | frames >50 ms | 8 | **1** | 3 | 2 |
> | GPU méd / p95 | 14,6 / 18,8 | **13,0 / 16,8** | 13,1 / 16,6 | 13,6 / 18,5 |
> | carga total ms | 5 056 | **4 508** | 4 927 | 11 535 |
> | trabalho no worker | 18 090 | **13 738** | 16 036 | — |
>
> **Depth 1 empata o FPS do síncrono (50) e BATE a cauda dele** (p95 26,7 × 28,1 · p99 31,4 ×
> 34,6 · frames >50 ms 1 × 2), com a carga em 4,5 s no lugar de 11,5 s. Contra o 4 ganha em
> todas as métricas de frametime.
>
> **Três leituras que dão coerência:**
> 1. **Fila rasa faz MENOS trabalho total** (13 738 × 16 036 ms de worker): o chunk espera
>    mais na `fila`, então o `filaSet` funde mais re-entradas antes de virar job. A
>    coalescência melhora sozinha quando o freio aperta.
> 2. **A carga é igual nas três (4,5–5,1 s) porque o knob NÃO a afeta** — `PROFUNDIDADE_CARGA`
>    é fixa em 8. Essa variação é ruído de rodada.
> 3. **O `depth 2` da tomada está contaminado**: foi a primeira rodada depois do lote de
>    bateria, com a máquina saindo do throttle (FPS 42 destoa de 47–50). A escolha real foi
>    entre 1 e 4.
> ✅ **O risco do depth 1 morreu de graça:** o medo era a fila não esvaziar em FPS baixo. O
> lote em modo economia rodou a 30 Hz travado — exatamente esse regime — e **`fila` fechou em
> 0 nas três profundidades**, com draw calls 630–633 e triângulos 186 716–188 048.
>
> ⚠️ **FATO DE IMPLANTAÇÃO (novo): notebook em modo economia de bateria trava em 30 FPS.**
> Nenhuma otimização atravessa isso. Se algum PC da sala for notebook em bateria, o aluno vê
> 30 FPS por política de energia do Windows, não por causa do jogo.
> ⚠️ **Teto que knob nenhum passa: GPU p95 ~16,8–19,6 ms contra 16,7 ms de orçamento.** O
> mesher ACABOU. O próximo alvo, se ainda incomodar, é GPU (raio de render em GPU fraca,
> overdraw da água, custo de fragment) — ver TODO ⏭️.

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

---

## 🚀 Próxima fase — MEDIR O PREÇO DO §🌬️ NO LAB, depois escolher do backlog.

**O §🌬️ (vento + vida ambiental) foi entregue INTEIRO na sessão 28** — as 6 frentes, verde em
typecheck/testes/build/smoke e conferido em screenshot headless. **O usuário já fez o bench e
aprovou** ("achei tudo muito top"); a única ressalva dele, a regra da correnteza, foi
implementada na sessão 28b (ver o diário acima). **Há UM passo pendente e ele é de medição,
não de código:**

> **Rodar `?bench` no notebook do laboratório com o §🌬️ ligado** e comparar com a régua
> `…-l9xf.json` (50 FPS · p95 26,7 · GPU méd 13,0 / p95 16,8 · carga 4 508 ms). Nuvens custam
> **fill rate** e balanço custa **vértice**, e esse orçamento de GPU já estava no teto. Se o
> p95 piorar acima do ruído de 1–2%, o A/B é imediato: desligar `nuvens` em Configurações e
> gravar o segundo perfil (mesma régua do `?semworker`). As duas chaves existem justamente
> pra isso — `settings.nuvens` e `settings.balanco`, ambas ON e fixadas em `BENCH_SETTINGS`.

O que ainda não foi visto em jogo é **a regra da correnteza da 28b**: falta olhar um riacho ou
uma queda de balde e conferir que a textura desce COM a água (o mar, que é tudo fonte, segue o
vento de propósito). O headless não resolve isso — roda em SwiftShader a 16 FPS, a câmera do
bench voa alto e o mar gerado não tem fluxo nenhum. É playtest de balde na mão.

Fora isso, **nenhum gatilho de desempenho está aceso** e quem retomar ESCOLHE do backlog.

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

1. **GPU p95 16,8–19,6 ms contra 16,7 ms** de orçamento de 60 FPS no lab. **O mesher acabou.**
   Se um dia o FPS incomodar de novo, o alvo é GPU — teto de `raioRender` em GPU fraca,
   overdraw da água, custo de fragment. **Greedy meshing continua DESCARTADO:** draw calls
   (633) e triângulos (188 048) do lab são IDÊNTICOS aos do PC de dev, então não é aí que a
   máquina fraca perde.
2. **Notebook em modo economia de bateria trava em 30 FPS** (`p50` 33,3 ms cravado, GPU 28%
   mais cara). É política de energia do Windows. Perfil medido nesse estado NÃO serve pra
   comparar otimização — checar o estado da máquina antes de concluir qualquer coisa.

### Backlog aberto — o usuário escolhe

- ~~`ROADMAP.md §🌬️` — vento + vida ambiental~~ **FEITO na sessão 28** (frentes 1 a 6).
  Sobrou só o que o §🌬️ NÃO pediu: som do vento; vento empurrando partículas/chuva;
  o vento entrar na física (decisão explícita: é SÓ visual até alguém decidir o contrário).
- **Som de água** (splash/borbulha/balde, WebAudio em `audio.ts`) — 4ª opção do refino de
  água, nunca escolhida.
- **Candidatos** (ver ROADMAP.md): layouts mobile · auto-update do servidor · sobrevivência
  (fome/vida/craft) · v2 da geração.

**Entregável final (relatório) está essencialmente PRONTO** — pendências só opcionais:
embutir 2–4 prints no §3, refs em ABNT, diagrama no Anexo A. Se o usuário pedir entrega,
o passo é gerar PDF/HTML de `relatorio/relatorio-aplicacao.md`. **O §desempenho do relatório
agora tem material forte:** o par A/B com o caminho síncrono e a régua dev × lab.

**Hitbox da laje: ENCERRADA (2026-07-26).** O usuário testou e confirmou — "hitbox já está
correta", NADA a mudar. Laje segue com mira na METADE (`blockSelectionBox`) e colisão de MEIA
ALTURA (`temColisaoParcial`); NÃO copiar o modelo de célula cheia da cerca/porta. Se uma
sessão futura achar isso "inconsistente", é decisão validada em playtest — deixar como está.

Sessões 20+21 (`26151f9`/`41211ff`/`5d18899`), 24 (`e3eaac4`) e 25 commitadas.
**Sessão 27 commitada e pushada:** `51bc5c8` (mesher em Worker) + `b3669ff` (wolf) +
`0a3dd3f` (PR do openwolf) + `efaf6df` (profundidade 1 + etiqueta no perfil).
**Sessão 28 COMMITADA, sem push** (o usuário pediu review antes de empurrar): `b9bc7a3`
(§🌬️ frentes 1-6) + o commit da regra da correnteza (28b).

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

**Como conferir que pegou:** `hostname -I` dentro do WSL mostra `192.168.3.100` em vez de
`172.28.x.x`. Aí o outro PC abre `http://192.168.3.100:8080`.
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
```

**Modo benchmark (o que mandar pro PC do lab):**

```
http://<host>:8080/?bench            # 30 s, mundo E (streaming), seed 20260726
http://<host>:8080/?bench=60         # trajeto mais longo
http://<host>:8080/?bench&tamanho=P  # mundo denso: mede só render
```

---

## 📚 Referências (leia SE precisar)

- `projeto.txt` — proposta pedagógica completa (BNCC, fundamentação, indicadores seção 14).
- `.wolf/cerebrum.md` — Decision Log com o PORQUÊ de cada escolha.
- `.wolf/anatomy.md` — índice de arquivos.
