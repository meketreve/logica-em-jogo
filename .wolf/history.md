# History Archive

> Older content rotated out of STATUS.md / memory.md by the stop hook (newest first). Read only when you need history beyond the live files.

## Session Journal

> **SESSÃO 19 (2026-07-25) — RELATÓRIO DE APLICAÇÃO PREENCHIDO + REVISADO ponta-a-ponta. NÃO commitado (só o entregável; sem código). O entregável final está essencialmente PRONTO.**
> Trabalho 100% no `relatorio/relatorio-aplicacao.md` (NÃO mexi em código). Usuário preencheu a
> Ficha (autor **Leonardo De Jesus Silvano**; **E.E.B. Prof. Otília da Silva Berti**, rede estadual
> SC; período **13–20/07/2026**; **61 alunos**; público 2º ao 9º) e eu redigi tema-a-tema, via
> AskUserQuestion, TODAS as seções que dependiam de dado de sala: §1 resumo, §2 justificativa,
> §5 metodologia, §6 resultados, §8 discussão, §9 conclusão, referências. **DADOS DE SALA (agora
> no relatório):** ~4 **turmas MULTISSERIADAS** (2 anos/turma: 2º/3º, 4º/5º, 6º/7º, 8º/9º, ~15 cada);
> **laboratório de informática**; **várias sessões** por turma; condução combinou projetor+regra+
> mediação+exploração livre. **AULAS: aplicou 1 (sequência), 3 (depurar), 5 (simetria), 6 (manual) +
> construção livre; NÃO aplicou 2 (binário) nem 4 (César)** — alunos sem conhecimento prévio (virou
> ponto do §8: preparar pré-requisito/escalonar). **RESULTADOS:** maioria fechou o contador COM
> mediação; **aula 1 travou vários alunos = valor DIAGNÓSTICO** (expôs fragilidade lógica); **AEE 3–5
> alunos, mediação pontual, bom desempenho** (sequência+construção livre); engajamento alto (4 sinais).
> **FALAS (§6.3):** contentamento ao completar a sequência; **unânime a felicidade na construção livre,
> "grito de alegria" dos pequenos**. **DE QUEBRA — 4 FATOS TÉCNICOS DEFASADOS corrigidos no relatório:**
> (1) 283→**304 testes**; (2) `profiles-escola/` foi APAGADA (privacidade, sessão 17) → aponta agora no
> agregado anônimo `registros/perfilador-v0.8.0-escola.md`; (3) **25→52 perfis** (nº real, 2 lugares);
> (4) screenshots agora existem em `registros/prints/` (§3 aponta os 6). **REVISÃO ponta-a-ponta:** 5
> fixes mecânicos (espaço na ficha, ref quebrada "seção 14"→projeto pedagógico, bullet duplicado no §6.2,
> "padrão"→"período crescente", nota no §4) + turmas=multisseriadas alinhadas (ficha+§5.1). **TODO.md:
> item dos prints marcado [x]** (estava [ ] à toa — prints já eram da sessão 18). **PENDENTE (só opcional,
> NÃO bloqueia entrega):** embutir 2–4 screenshots no §3; obs específicas das aulas 3 e 6; diagrama no
> Anexo A; formatar refs em ABNT. **PRÓXIMA:** usuário pode pedir PDF/HTML do relatório pra entrega, ou
> embutir os prints. O relatório é o ÚLTIMO entregável — depois dele o projeto está fechado. Sessão 18 abaixo ↓

> **SESSÃO 18 (2026-07-23) — PRINTS DE PONTOS-CHAVE (6) + BUG-495 (TDZ no boot do vite DEV; prod OK) + hook ?yaw/?pitch. ✅ COMMITADO + PUSHADO.**
> Usuário pediu: "faz os prints enquanto eu faço a playtest". Montei render headless e capturei
> **6 prints em `registros/prints/`** (README indexa cada um): `01-menu.png` (título + badge v0.8.0),
> `02-biomas.png` (mundo procedural seed 314 = mata + ipê dourado + serra rochosa/nevada, vários
> biomas num quadro), `03-agua.png` (CASCATA de água transparente caindo numa bacia — água fluida),
> `04-aula.png` (aula1 sequência de cores: painel de objetivos "4/12" + região-alvo + padrão no chão),
> `05-construcao.png` (sala mobiliada: parede + 2 quadros c/ texto + sofá + cama + mesa+cadeira +
> tapete + flores), `06-hud-f3.png` (perfilador F3 completo sobre a paisagem). **QUEST PARKADA DOS
> PRINTS = FEITA.** ⚠️ Caveats headless: menu com emoji-quadradinho (falta fonte emoji no chrome —
> num PC real aparece); HUD mostra **FPS 8** = swiftshader SOFTWARE do headless, NÃO hardware (no PC
> da escola é 60–90, documentado sessão 12). **DE QUEBRA — BUG-495 (TDZ, só no vite DEV):** ao rodar o
> client headless (dev) descobri `ReferenceError: Cannot access 'touchControls' before initialization`
> em `main.ts` (`applySettings()` no top-level lia `touchControls?.setScale` mas o `let touchControls`
> estava declarado ABAIXO da chamada → TDZ; `?.` NÃO salva de TDZ). **SÓ afeta o vite DEV server** (ESM
> nativo, ordem de topo estrita) — o BUILD de produção (o que a escola roda) NÃO disparava o TDZ: o
> usuário **rodou com a turma em 2026-07-23 e funcionou normal, playtest da água inclusive ("ficou
> top")**. Ficou latente no DEV porque ninguém abriu o vite dev desde a sessão 12 (13–17 deferiram
> playtest de browser); apareceu agora nos prints. **FIX:** movi `let touchControls` pra ANTES de
> `applySettings()` (mesmo padrão de bug-093/activePanel e do ?yaw-TDZ) — tira o TDZ latente independente
> do bundler. **VERDE: typecheck 0 (3/3), 304 testes.** **DE QUEBRA 2:** o hook de screenshot `?yaw`
> estava QUEBRADO (o `applyTeleport` do join sobrescrevia com o yaw do spawn) — fiz `?yaw`/`?pitch`
> (novo) vencerem o spawn; sem isso não dá pra enquadrar screenshot nenhum. **COMMITADO EM 3 COMMITS
> SEPARADOS + PUSHADO** (fix client / prints / chore wolf). **PENDENTE p/ próxima:** só o **RELATÓRIO**
> (entregável final — preencher campos de sala). Playtest (mundo procedural + água) já FEITO e aprovado
> pelo usuário. Escola: `git pull` pega o fix do dev + os 6 prints.
> **Receita dos prints (cerebrum Key Learnings 2026-07-23):** vite dev em porta própria (5199) +
> game server com `LJ_SAVE` em scratchpad (NUNCA `mundos/mundo-livre` = mundo do usuário) + chrome
> headless dirigido por CDP (`scratchpad/capture.mjs`: navega, espera, teclas F3, esconde `#overlay`
> de pausa que aparece sem pointer-lock, screenshot). Água/móveis headless = CONSTRUIR via ws
> (`scratchpad/build.mjs`: join → lê spawn → place_block/balde/quadro_set; `PLAYER_REACH=7`); a água
> precisa de CAIXA de contenção senão inunda e afoga a câmera. Aula pra screenshot: `LJ_SAVE=cenarios/aulaN.ljw` (modelo read-only, semeia cópia viva em mundos/, não escreve no tracked).

> **SESSÃO 17 (2026-07-23) — LAUNCHER opção 8 + PERFILADOR ANÔNIMO + registros/. ✅ COMMITADO + PUSHADO.**
> Pedidos do usuário nesta sessão: (1) **launcher opção [8] (carregar mundo salvo) não perguntar
> tamanho** — o save já tem as dimensões. FIX (.bat e .sh): ao escolher um save válido marca
> `PULAR_TAMANHO=1` e pula o menu de tamanho (bug-489). (2) **Perfilador ANÔNIMO + versão**:
> `hud.ts stats()` agora carrega `versao: VERSION` (import @logica/shared); o host parou de pôr o
> nome do aluno no arquivo — filename virou `perf-<timestamp>-<sufixo>.json` (index.ts
> `interceptarProfile`), corpo já era anônimo. (3) **profiles-escola/**: era TRACKED (nomes de aluno
> no histórico desde a sessão 12) — removido do tracking + gitignored (`/profiles-escola/`); os 52
> JSONs crus deletados; resumo AGREGADO e anônimo salvo em `registros/perfilador-v0.8.0-escola.md`
> (FPS 25–90, tick servidor <5.4ms). (4) **registros/** NOVA pasta na raiz (README + log) =
> memória de evolução fora do `.wolf/`; prints de marcos vão em `registros/prints/` (ainda vazia —
> capturas headless de dev não são guardadas hoje). **DE QUEBRA: bug-490** — STATUS da sessão 16
> alegava "typecheck 0" mas rules.ts tinha 3 erros (`noUncheckedIndexedAccess` + `for(let i)` com
> `LADOS[i]`/`custo[i]`); troquei por `LADOS.entries()` + narrow. **VERDE de verdade: typecheck 0,
> 304 testes, build ok.** Esta sessão fechou o PUSH ACUMULADO das sessões 14/15/15b/15c/16/17
> (água fluida + balde, hitbox real dos não-cubos, água transparente, fluxo priorizado, launcher,
> perfilador anônimo). **PENDENTE p/ próxima:** o PLAYTEST no browser de TODA a água acumulada
> (balde/fonte/fluir/cair/secar/nadar/pulo de saída + fluxo-em-fio na cascata-pirâmide + FPS) e o
> **RELATÓRIO** (entregável final — preencher campos de sala). Histórico do git ainda contém os
> nomes antigos em profiles-escola (purga de history = force-push, quebra clones da escola — NÃO
> feito de propósito; só remoção do tracking daqui pra frente).
> **PRÓXIMA QUEST (parkada 2026-07-23) — PRINTS DE PONTOS-CHAVE p/ apresentação:** montar render
> headless (receita no cerebrum Key Learnings 2026-07-20: `fuser -k`, NUNCA `kill $!`) e capturar ~6
> cenas em `registros/prints/`: (1) menu/título c/ badge de versão; (2) mundo procedural com os 4
> biomas BR (caatinga/cerrado/mata/araucária); (3) água fluindo (cascata); (4) uma aula (aula1
> sequência de cores OU aula2 binário); (5) construção livre (móveis/quadro); (6) HUD F3 (perfilador).
> Multiplayer é difícil headless → print manual do usuário se quiser. Decisão do usuário: SÓ alguns
> prints de pontos-chave (não capturar tudo). **DECISÃO (2026-07-23):** histórico do git NÃO será
> purgado — só primeiros nomes/apelidos (baixo risco) e purga (force-push) quebraria os clones da
> escola; o fix desta sessão resolve o vazamento daqui pra frente, o passado fica.
> **SESSÃO 16 (2026-07-22) — FLUXO DE ÁGUA PRIORIZA O DESNÍVEL (estilo Minecraft) + TETO/TICK. NÃO commitado; PLAYTEST no browser PENDENTE.**
> Relato do usuário: FPS morre (Xeon/RTX2060) numa cascata em forma de PIRÂMIDE com água só de um
> lado — "a água dá a volta na pirâmide, tá muito lateralizado". Causa: `waterRule` (rules.ts)
> espalhava pros 4 lados IGUALMENTE (disco) → cada degrau da pirâmide enchia toda a superfície e
> cascateava pelas 4 faces → centenas de células ativas = tick + REMESH afogados. Decisões do
> usuário (AskUserQuestion): (1) alcance da busca = 4 blocos (padrão Minecraft); (2) SIM ao teto
> de água/tick. **FIX (rules.ts):** cada célula de água em chão sólido faz busca em profundidade
> (`passosAteQueda`, `DROP_SEARCH=4`) pela QUEDA mais próxima e só escorre PRA LÁ; sem queda no
> alcance → espalha nos 4 lados (poça). Água em FIO, não disco (pirâmide de teste: **12 células**
> vs. centenas). 2 sub-bugs corrigidos no caminho: o custo é medido sobre TODA célula que a água
> ATRAVESSA (ar OU fluida — `aguaAtravessa`), não só as preenchíveis (`empurra[]` separado), senão
> a direção do desnível já-cheia saía da conta e floodava perpendicular; e `temQueda` conta descida
> em AR **e ÁGUA FLUIDA** embaixo (ao encher o buraco a coluna vira água — se só ar contasse, o
> alvo "sumia" e voltava ao disco). **TETO/TICK (session.ts):** `AGUA_POR_TICK_PADRAO=256`
> (constants.ts), opt `aguaPorTick`, env host `LJ_AGUA_TICK` (espelha `LJ_COLUNAS_TICK`); no tick
> conta só água que MUDA, excedente volta pra `dirty` (escorre no tick seguinte); água parada não
> gasta orçamento. **VERDE: typecheck 0, 304 testes (+2 água: prioriza-desnível/não-dá-a-volta e
> poça-sem-queda; 6 testes de canal 1-wide viraram plano cheio pq a água agora escorre pelas beiras
> — correto; 1 teste de session de plataforma 1-wide idem), build ok.** **PENDENTE:** PLAYTEST no
> browser (fazer a cascata-pirâmide e ver o fio descer uma face só + FPS) e o `git push` acumulado
> das sessões 15/15b/15c/16. `LJ_AGUA_TICK` JÁ exposto nos launchers .bat/.sh (prompt opcional
> "água por tick — só se o FPS cair", Enter = padrão 256).
> **SESSÃO 15c (2026-07-22) — ÁGUA FLUIDA (autômato celular) + ITEM BALDE. NÃO commitado; PLAYTEST no browser PENDENTE.**
> Decisões do usuário (AskUserQuestion, 2 rodadas): (1) v1 CUBO CHEIO (nível=alcance, não altura visual;
> altura-por-nível fica p/ refino); (2) água INFINITA (2 fontes+chão→fonte); (3) fonte via ITEM BALDE (não
> bloco na hotbar); (4) fluxo SEMPRE LIGADO (sem comando de professor); (5) balde RECOLHE (cheio↔vazio);
> (6) o bloco de água 129 SAIU da hotbar (só balde/fluxo criam água).
> **NÚCLEO (shared, testado):** ids `Agua`=129 vira a FONTE (nível 8); `AguaFluida1..7`=130-136 (nível=alcance,
> 7 mais alta). `blocks.ts`: `isAgua` vira FAIXA 129-136; novos `isAguaFonte`/`aguaNivel`/`aguaComNivel`;
> `isReplaceable`/`isTransparentBlock` cobrem a faixa; `isPlaceable` RECUSA água (só balde). `waterRule`
> (rules.ts) na REGRA DE OURO (registrado p/ os 8 ids): cada célula recomputa o próprio nível (enche E
> seca) e EMPURRA água — AR embaixo → CAI (coluna cheia 7, sem lateral, sem disco flutuante); chão SÓLIDO
> (cubo cheio NÃO-água) embaixo → espalha 4 lados com nível−1; infinito = fluida em chão sólido com ≥2
> fontes laterais vira FONTE. Fonte permanente (só balde/bloco-por-cima remove); alcance 7 = bounded (não
> trava tablet). O tick do servidor JÁ roda tudo (rule no RULES + dirty + applyBlock broadcast) — ZERO
> mudança na engenharia do tick. `mesher.ts`: os 7 ids fluidos = tile da água; água (fonte OU fluida)
> roteada p/ `waterIndices` (grupo transparente); culling FUNDE água-com-água de QUALQUER nível (sem
> z-fight). **BALDE (item, não-bloco):** `ITEM_BALDE_VAZIO`=900/`ITEM_BALDE_AGUA`=901 + `isBalde` em
> blocks.ts (acima da faixa de bloco → nunca colocável). Msg nova `balde{x,y,z,encher}` (protocol.ts) +
> handler no session.ts (mesma disciplina de place/break: join/bounds/alcance/claim/confinamento; encher=false
> despeja FONTE em ar/substituível, encher=true recolhe SÓ fonte). `raycastBlock` ganhou `pararNaAgua` (balde
> vazio mira a água p/ recolher; senão água invisível pra mira). Cliente: entrada "balde de água" (cat nova
> "ferramentas") em blocksUi; ícone procedural do balde (blockIcons `drawBalde`, cheio=água azul); main.ts —
> botão esq com balde não quebra; botão dir com balde faz água (cheio despeja em target+normal e esvazia o
> slot; vazio recolhe a fonte mirada só se for id Agua e enche o slot); raycast passa pararNaAgua quando slot
> = balde vazio. **VERDE: typecheck 0, 302 testes (+10: 6 water.test fluxo/queda/seca/infinita, blocks nível↔id,
> session balde+integração-pelo-tick, protocol balde), build ok, boot do host ok (v0.8.0).**
> **PENDENTE:** (a) PLAYTEST no browser — balde na hotbar (aba ferramentas), despejar fonte (clique dir),
> ver fluir/cair/secar, encher lago com 2 fontes (infinito), recolher com balde vazio; nadar no fluxo.
> (b) `git push` (sessões 15/15b/15c acumuladas sem push). (c) Refinos deixados p/ depois: altura-visual-por-nível
> no mesher; RESTORE do save re-tica a água (hoje fluxo salvo fica congelado até algo encostar — água antiga
> vira fonte que só flui quando editada perto; aceitável v1); orçamento de células/tick (hoje o alcance-7
> já limita; sem teto explícito).
> **SESSÃO 15b (2026-07-22) — HITBOX REAL DOS NÃO-CUBOS NO RAYCAST DE MIRA.** `raycastBlock`
> (raycast.ts) agora, ao entrar em célula com NÃO-cubo (`!isFullCube`), faz ray-vs-AABB
> (`subBoxNormal`, slab test) contra `blockSelectionBox(id)` — a MESMA caixa do contorno da mira.
> Acertou → hit com a normal da face do sub-box; errou → segue marchando (raio passa pelo VÃO:
> buraco da cerca, porta aberta). Cubo cheio mantém fast path (normal DDA); água pulada de vez.
> Importa `blockSelectionBox` do mesher (sem ciclo). Consequência: usar (porta/janela) e copiar
> (botão do meio) agora exigem mirar na FORMA real. 292 testes (+2 cerca: poste no centro / vão
> passa reto), typecheck 0, build ok. ✅ COMMITADO (feat c0a4012 + chore wolf), NÃO pushado; playtest no browser PENDENTE. Fica p/ slab
> (backlog): unificar essa caixa-por-bloco com a colisão (physics.ts ainda trata tudo como cubo).
> **SESSÃO 15 (2026-07-22) — ÁGUA SEM HITBOX NA MIRA + LÍQUIDO SUBSTITUÍVEL (opção B).**
> `raycastBlock` (raycast.ts) agora PULA `isAgua` → a mira atravessa a água e para no sólido
> atrás (dá pra colocar bloco olhando através da água). Pra REMOVER água = colocar bloco no lugar
> dela: `isReplaceable` NOVO em blocks.ts (água agora; lava/capim/neve futuros herdam) + os 3
> gates de `place_block` (session.ts: célula principal + 2ª da porta + 2ª da cama) aceitam "vazio
> OU substituível" → colocar por cima da água TROCA direto, sem quebrar antes. Água nunca mais é
> alvo (a mira é a MESMA pra place e break) → não dá pra QUEBRAR água, só substituir. A colocação
> atinge a água colada no sólido atrás (`target+normal`) — poça funda enche de trás pra frente (OK
> no estático; a fase de água FLUIDA reavalia). 290 testes (+2 raycast: atravessa água/origem
> submersa; +1 session: place troca água), typecheck 0, build ok. ✅ COMMITADO (feat c0a4012), NÃO
> pushado; playtest no browser PENDENTE. (O caso GERAL dos não-cubos foi RESOLVIDO na sessão 15b, acima.)
> **SESSÃO 14 (2026-07-22) — PULO DE SAÍDA DA ÁGUA + REFINO DE IDEIAS.** (1) FÍSICA:
> nadar pra cima com `swimSpeed`(4) não escalava bloco cheio na borda (bobava na
> superfície). Fix em `physics.ts`: constante `waterJumpSpeed`(7.5) + helper
> `paredeAdjacente` (4 lados nos níveis pés+torso); no ramo submerso, pular perto de
> parede/borda usa o pulo FORTE (limpa o topo do bloco), água ABERTA mantém `swimSpeed`
> (não vira foguete). +3 testes em `physics.test.ts` (nado NUNCA teve teste): água aberta =
> swimSpeed, borda = waterJumpSpeed, integração escala muralha (pico > y8). 286 testes,
> typecheck 0 erros, build ok. NÃO commitado, NÃO playtestado (UI cliente). (2) TODO.MD
> ganhou 6 ideias REFINADAS (com escopo/decisões/obstáculo técnico ancorado no código):
> slabs + escadas (Móveis/blocos — trabalho pesado = colisão de altura parcial em
> physics.ts, que hoje trata tudo como cubo cheio); layouts do mobile (Mobile — presets
> destro/canhoto por classe CSS no #touch-ui); e nova seção **Água**: trocar textura (repintar
> tile do atlas), TESTE de textura animada (obstáculo: mesher assa UV → precisa água em
> material próprio; 3 opções listadas), e água FLUIDA (fase grande: ids AguaFonte+Agua1..7
> pro nível, autoridade no servidor, fila de células ativas por tick, regra dos 8 + queda,
> decisões a travar antes). ANTES de codar as próximas: começar por slab (escada e a colisão
> parcial dependem dele); água animada destrava com "água em 2º material/mesh".
> **(3) ÁGUA SEM FUROS + MATERIAL PRÓPRIO (2026-07-22, decisão do usuário via AskUserQuestion
> = "transparente de verdade").** Tirei o xadrez de furos; água agora usa 2º material
> transparente com blend. COMO: `mesher.ts` fatia índices em 2 grupos (`ChunkGeometry.
> opaqueIndexCount` — opaco primeiro, água concatenada depois; faces de água roteadas p/
> `waterIndices` no caminho de cubo); `ChunkRenderer` (chunks.ts) virou material ARRAY
> `[material, materialAgua]` + `geometry.addGroup(0,opaque,0)`/`addGroup(opaque,resto,1)`
> (three manda o grupo transparente pro passe de transparência sozinho; grupo count 0 = sem
> draw); `main.ts` cria `materialAgua` (MeshLambert, transparent, opacity 0.72, depthWrite
> false, MESMA textura do atlas); `paintAgua` (atlasTexture.ts) repintado azul cheio +
> ondulação (sem furos). +1 draw call SÓ em chunk com água. 287 testes (+1 split de grupo no
> mesher.test), typecheck 0, build ok. NÃO commitado, playtest no browser PENDENTE.
> **(4) RESTRIÇÃO DE ASSETS esclarecida (projeto.txt §9):** §9 proíbe SOFTWARE/ASSET NÃO
> LICENCIADO de terceiro (Minecraft/Eaglercraft) e exige plataforma PRÓPRIA — NÃO proíbe
> assets próprios nem CC0. "Tudo procedural no canvas" é ESCOLHA nossa (repo texto, sem
> pipeline, deploy simples, testável), não exigência. Registrado no cerebrum. Textura animada
> agora DESTRAVADA (água em material próprio) — ver todo.md seção Água.
> **✅ FEITO (2026-07-21) — MAIS MÉTRICAS NO PROFILER (7 itens). typecheck 0 erros, 283
> testes, build ok. NÃO playtestado (UI cliente, precisa browser).** Plano executado como
> escrito abaixo. hud.ts ganhou: long tasks (PerformanceObserver), points/lines, contexto
> WebGL perdido, tempo de sessão, bateria (getBattery), conexão (navigator.connection),
> `net.jitterMs` + `stream{colunas,fila}` alimentados pelo main.ts (jitter = desvio-padrão do
> gap entre msgs no `handleServerData`; colunas/fila no intervalo de 1s). F3 mostra tudo; o
> relatório de 10s inclui long tasks DA JANELA. Plano original (referência):
> Pedido: implementar long tasks + jitter de rede + colunas/fila + os outros. Fontes de
> dado JÁ mapeadas. Onde cada uma entra:
> 1. **Long tasks** (jank do main thread) — `PerformanceObserver({type:'longtask'})` no
>    construtor do Hud (try/catch; Chrome-only). Contador acumulado + tempo bloqueado; a
>    gravação de 10s captura o DELTA da janela. Linha no F3 + `gravacao.longTasks`.
> 2. **points/lines** — `renderer.info.render.points/lines` (hoje só calls/triangles) → stats().
> 3. **Contexto WebGL perdido** — listener `webglcontextlost` em `renderer.domElement` (o Hud
>    tem o renderer) incrementa contador → stats(). Sinal de crash de GPU no tablet.
> 4. **Tempo de sessão** — `sessionStartMs` no construtor do Hud → `sessaoS` (normaliza o
>    remeshCount acumulado, que hoje cresce sem denominador).
> 5. **Bateria** — `navigator.getBattery()` (async, cacheia {level,charging}; Chrome) → em
>    `dispositivo()`. Bateria baixa/throttle térmico derruba FPS no tablet.
> 6. **Conexão** — `navigator.connection` {effectiveType,downlink,rtt} → seção rede do relatório.
> 7. **Jitter de rede + colunas/fila** — precisam de dado de FORA do Hud:
>    - jitter: em `handleServerData` (main.ts:481) medir o gap entre msgs (ring buffer ~300),
>      desvio-padrão em ms → `hud.net.jitterMs`. Linha no F3.
>    - colunas/fila: no intervalo de 1s (main.ts:1239) setar `hud.stream = {colunas:
>      colunasCarregadas.size, fila: chunkRenderer.filaPendente}` (getter JÁ existe). F3 + stats.
> **Arquivos:** hud.ts (métricas próprias + campos novos `stream`/`net.jitterMs` + linhas F3 +
> relatório), main.ts (jitter no handleServerData + stream/jitter no intervalo de 1s). O relatório
> agregado continua pequeno (só resumo, respeita `MAX_PROFILE_REPORT_CHARS=8192`). Sem teste de UI
> (browser) — a lógica é toda cliente. Depois de codar: typecheck + build, atualizar este bloco.
> **SESSÃO 13 (2026-07-21) — ÁGUA+NADO · /CLAIM (professor cria, COLUNA) · PAINEL DE
> JOGADORES+BAN · MOBILE (varinha, agachar, escala UI) · PROFILER 10s+RAM/vídeo.
> CODADO + VERDE (typecheck 0 erros, 283 testes, build ok). ✅ COMMITADO + PUSHADO
> + TAG `v0.8.0` (bump minor 0.7.0→0.8.0, badge rebuildado). Commits: `d8ca720` (feat)
> · `240acd9` (chore wolf) · `5466ab8` (docs relatório com features v0.8.0). origin/main
> sincronizado, escola faz `git pull`. **FALTA SÓ PLAYTEST no navegador** (UI cliente não
> validável aqui).** Sessão longa, 4 mensagens de pedido acumuladas — TUDO implementado:
> (1) **ÁGUA (id 129, append)** — bloco ESTÁTICO (sem fluxo; fluido dinâmico = fase própria).
> Atravessável (`isSolidBlock`=false → entra e NADA) mas cubo cheio pro mesher
> (`isFullCube`=true → funde com água vizinha, só a casca aparece). Translúcida SEM mexer no
> material (chunk = 1 draw call cutout `alphaTest:0.5`): tile azul com FUROS em xadrez
> `(x+y)%3===0`. NADO (physics.ts): `inWater` amostra o torso; submerso = velocidade ×
> `waterFactor`(0.5) + empuxo (`waterGravity` 8, afunda até `waterSinkMax` 3) + pular sobe /
> agachar desce (`swimSpeed` 4). blocks/mesher/atlasTexture/blocksUi/physics + sentinel bumpado.
> (2) **/CLAIM: professor cria; SEGUE COLUNA CHEIA (0→teto)** — o usuário PRIMEIRO pediu caixa
> 64×63×32, DEPOIS mandou MANTER a coluna cheia (decisão final = COLUNA). Então: professor
> deixou de ser bloqueado no `/claim criar` (reserva plot como o aluno, 1-por-dono); claim
> força min.y=0/max.y=teto como sempre; limite horizontal virou 64(X)×32(Z) (era 32×32).
> `claims.ts`: MAX_CLAIM_X=64 + MAX_CLAIM_Z=32 (tirei MAX_CLAIM_Y — altura livre).
> (3) **PAINEL DE JOGADORES + BANIMENTO** — `client/players.ts` (PlayersPanel, ESTRUTURA DO
> INVENTÁRIO: altura fixa, abas, scroll só na lista). Abas "conectados" (expulsar/banir, 2
> cliques) e "banidos" (desbanir). Aberto por botão "👥 jogadores" no topo do painel de
> autoria. Ban por NICK: ESTADO + gate de join na GameSession (`banir`/`desbanir`/`estaBanido`,
> case-insensitive; persiste no meta `banidos[]` do save de mundo livre); `/banir`·`/desbanir`
> no HOST (index.ts, fecham socket como o /kicar); msg `players` (conectados+banidos) → SÓ
> professores, no join/saída/ban. `broadcastPlayers` PULA singleplayer (Web Worker não gere
> turma; mantém o retrato de mensagens dos testes de contrato). save.ts (banidos), protocol.ts
> (msg players), 3 testes de ban.
> (4) **MOBILE**: (a) **varinha** — botão 🪄 no touch UI → `toggleVarinha` (⛏/▣ viram
> canto1/canto2). (b) **agachar** — botão de SEGURAR ⤓ mantém a tecla `agachar` (Shift):
> andando não cai da borda, voando DESCE. (c) **escala da UI** — `settings.uiScale` (60–180%,
> persistido), slider "escala dos controles (toque)" (só em touch); aplicado por var CSS `--ts`
> nos tamanhos do `#touch-ui` via `calc()` (NÃO transform:scale — o joystick lê
> getBoundingClientRect).
> (5) **PROFILER grava 10s + F3 RAM/vídeo** — "exportar JSON" e "enviar pro servidor" agora
> GRAVAM 10s (`hud.record`, contagem regressiva no F3) e devolvem relatório AGREGADO (frametime
> min/méd/p50/p95/p99/pior-frame, frames lentos >50ms/>100ms, faixa de memória) — só o resumo
> vai no fio (poucos KB). F3 mostra RAM (JS heap `performance.memory`; n/d fora do Chrome) e
> vídeo (contadores `renderer.info.memory`). Relatório guarda dispositivo (núcleos, RAM GB, DPR,
> tela, GPU via WEBGL_debug_renderer_info). Sugeri MAIS dados úteis (todo.md, seção profiler):
> points/lines, long tasks (PerformanceObserver), bateria, tipo de conexão, colunas/fila de
> mesh, tempo de sessão, jitter de rede, limites do WebGL.
> **DE QUEBRA:** consertei 2 erros de typecheck PRÉ-EXISTENTES (não meus): arvores.ts:85 (arrow
> `():void=>` corpo concha → bloco) e world.test.ts:53 (`chunk!`). typecheck 0 erros.
> **PRÓXIMA (v0.8.0 já commitada+pushada+relatada):** (1) **PLAYTEST** em notebook E tablet:
> nadar na água; professor /claim criar (coluna); painel P → botão jogadores → aba
> conectados (expulsar/banir) + aba banidos (desbanir), LAN com 2+ clientes; varinha+agachar+
> escala da UI no celular; profiler "gravar 10s" (F3 mostra RAM/vídeo/long-tasks/stream/jitter
> + relatório agregado). (2) **RELATÓRIO** (entregável final) — preencher os campos `✏️
> PREENCHER` de SALA (datas, nº alunos/turma, AEE, resultados por aula, qualitativo,
> screenshots). A parte técnica + as features v0.8.0 já estão no relatório. UI cliente não é
> testável aqui (só a lógica de servidor tem teste).
> **SESSÃO 12 (2026-07-21) — ✅ PLAYTEST MULTIPLAYER DO MUNDO PROCEDURAL NA ESCOLA
> (MARCO — streaming validado EM CAMPO com turma real).** Usuário criou um mundo
> procedural (streaming F1-F5, `worldChunks` 240×240×8 = 3840²×128, seed 3158887957)
> e rodou COM A TURMA: **10 alunos + 2 professores simultâneos**. **ZERO problema de
> sincronismo com os alunos.** Único incidente: chunk não carregava — SÓ no notebook
> do próprio usuário, e a causa foi ele mexendo AO VIVO na QUANTIDADE de chunks
> exibidos (raio de render), NÃO bug do streaming. Reports de performance de todos os
> dispositivos salvos em `profiles-escola/` (25 arquivos JSON, `checkpoint:14`).
> NÚMEROS: tablets Android da escola (Kindle Fire Silk / Chrome Android) rodaram o
> mundo GIGANTE a **60-90 FPS** (Adriamff 89 / Tilapia 90 / Teste-Kindle 60 fps,
> frametime ~11-17ms); servidor FOLGADO em TODOS (tickAvgMs < 1ms, tickMax < 1.7ms →
> confirma sem gargalo de sync); rede 22-101 msg/s, 3-16 KB/s por cliente. Notebook do
> usuário (host = servidor+cliente+ele mexendo em chunks, Windows Chrome, ws://
> localhost) = 37 FPS / P95 37ms / remesh acumulado 66s — o mais carregado da sessão,
> esperado (host + dev mexendo ao vivo). remeshCount alto (22k-496k) é acumulado da
> sessão, remeshLastMs ≤ 2.1ms → sem hitch por frame. **CONCLUSÃO: o motor + streaming
> estão PRONTOS e PROVADOS com turma real.**
> **✅ PILOTO FEITO (2026-07-21) — o usuário JÁ APLICOU o jogo com alunos de TODAS as
> turmas** (não foi evento único; foi cobertura incremental, turma a turma). Inclui aula
> com alunos do **AEE (Atendimento Educacional Especializado / educação especial)** —
> **tiveram BOM DESEMPENHO** nas atividades de SEQUÊNCIA DE CORES e CONSTRUÇÃO LIVRE.
> Resultado de inclusão/acessibilidade forte pro relatório. **RESTA SÓ O ENTREGÁVEL
> FINAL: o RELATÓRIO de aplicação (parte técnica como anexo).** ✅ ESQUELETO DO RELATÓRIO
> MONTADO (2026-07-21): `relatorio/relatorio-aplicacao.md` — 9 seções + 3 anexos + refs.
> JÁ preenchido com dado TÉCNICO (tabela dos 6 pilares↔atividade; tabela de perf da
> escola: tablets 60-90 FPS, tick servidor < 1ms, 12 clientes, zero dessincronia;
> arquitetura/stack). Campos `✏️ PREENCHER` = dados de SALA que só o usuário tem (datas,
> nº alunos/turma, detalhe AEE, observações qualitativas, screenshots do jogo, refs
> bibliográficas completas). Ordem de escrita sugerida: seção 5 (metodologia) → 6
> (resultados) → 1 (resumo por último). **Seções 2 (introdução/justificativa) e 3 (visão
> geral do jogo) podem ser REDIGIDAS SEM dado de sala** — bom ponto de partida numa
> próxima sessão. Roteiro pedagógico das 6 aulas (pilar/gabarito/condução) em
> `cenarios/README.md` → vira o Anexo C. Daqui pra frente o
> trabalho é ESCREVER o relatório, não codar — o código está completo e provado. Backlog
> de motor é OPCIONAL e não bloqueia nada: HUD de colunas/raio carregado; v2 da geração
> (cavernas, altura por bioma, madeira por espécie — nunca feita).**
> **SESSÃO 11 (2026-07-21) — STREAMING DE CHUNKS F1-F5 COMPLETO (mundo GIGANTE
> em runtime). Plano detalhado em `.wolf/streaming-plan.md`. COMMITADO + PUSHADO
> (`c9e465e`) — escola faz `git pull`. Usuário vai PLAYTESTAR sozinho na escola
> (teste solo controlado, não é o piloto com a turma ainda).** Commits desta obra:
> `e7dc4f7` F1 (mundo esparso + gen por coluna ordem-independente) ·
> `0da59be` F2 (tamanho E 3840²×128, protocolo LJE0/LJC0/radius, streaming por
> raio de interesse, configs raioRender+meshPorFrame+LJ_COLUNAS_TICK) ·
> `2c1a2e3` F3 (save ESPARSO LJS2 — só chunks editados; smoke: obsidiana
> sobrevive save+restart) · `b95e40f` F4+F5 (bordas verificadas + evictColunas
> 1×/s libera coluna sem interesse e sem edição; regenera idêntica ao voltar).
> 278 testes, typecheck 3/3, build ok. Smokes reais: streaming 81+81 colunas,
> save/restore de edição, eviction unit-testada.
> **COMO USAR:** menu → novo mundo → tamanho "ENORME"; ou host `LJ_TAMANHO=E`.
> Mundo E nasce vazio, colunas chegam conforme explora. Denso (P/M/G/aula/plano)
> INTOCADO. **JÁ PUSHADO (usuário autorizou); escola faz `git pull`. Follow-ups
> desta sessão TB pushados: launcher .bat opção [9] "Criar mundo PROCEDURAL"
> (mundos/<nome>/, LJ_TAMANHO=E) + prompt de tamanho com [E]; menu do jogo e
> config renomeiam "ENORME"→"procedural" (value="E" inalterado; tirado o falso
> "sem save ainda"). PRÓXIMA: (a) usuário vai PLAYTESTAR o mundo procedural
> SOZINHO na escola (andar longe, cavar, construir, sair e voltar → persiste),
> (b) opcional: HUD mostrar colunas carregadas/raio, (c) v2 da geração (backlog:
> cavernas, altura por bioma, madeira por espécie — NUNCA feita), (d) PILOTO +
> relatório — o entregável real.**
> **SESSÃO 10 (2026-07-20) — GERAÇÃO PROCEDURAL COM BIOMAS v1 (NÃO commitado):**
> Arquitetura travada (decisões no cerebrum): biomas via 2 CAMPOS DE CLIMA (value
> noise temp+umid, x/80) → lookup Whittaker — truth table descartada (N², vira WFC);
> heightmap GLOBAL único, bioma = pintura+decoração (sem penhasco de fronteira);
> variante de grama = ID próprio (mesher puro, save carrega aparência) com thresholds
> INDEPENDENTES dos do bioma → faixas de transição = blend visual nas fronteiras.
> (A) 13 BLOCOS NOVOS (ids 116-128, append; bug-370 sentinel 116→129): 4 minérios
> placeholder (Carvão/Ferro/Ouro/Diamante — pedra+pepitas+SIGLA, porta de entrada do
> survival, sem drop/craft), GramaSeca+GramaFria, árvores BRASILEIRAS (LogIpe/
> FolhasIpe AMARELAS, LogAraucaria/FolhasAraucaria, LogPauBrasil/FolhasPauBrasil),
> Mandacaru (cubo cheio v1). Folhas novas em isTransparentBlock (cutout); tudo na
> hotbar (blocksUi); 14 tiles novos no atlas (TILE 78-93).
> (B) `biomas.ts` NOVO: registro caatinga/cerrado/mata/araucárias (geografia BR na
> pedagogia) — topo/subsolo/árvores/flores/mandacaru por bioma; biomaPorClima +
> gramaPorClima. Bioma novo = registrar objeto. (C) `arvores.ts` NOVO: formas
> (ipê=copa larga amarela, araucária=tronco alto nu+copa disco, pau-brasil, comum,
> mandacaru 2-3); espécie SÓ nasce no bioma dono. (D) worldgen v2: climaAt, coluna
> bedrock→pedra→subsolo(3)→topo (praia SAND_HEIGHT=18 e neve SNOW_HEIGHT=28 globais
> por altura), veias de minério (mulberry32 seedado, banda de profundidade: carvão
> <40, ferro <24, ouro <16, diamante <8, só substitui Stone), features por hash de
> coluna. Presets plano/cabines e saves antigos INTOCADOS. (E) seed do host Node
> vira ALEATÓRIA sem LJ_SEED (singleplayer já era); save guarda a seed no header.
> 257 testes (+7: determinismo, Whittaker, blend, bandas de minério, árvore-só-no-
> bioma-dono, mandacaru-só-caatinga, grama=clima), typecheck 3/3, build ok. 4
> screenshots headless conferem os 4 biomas + blend caatinga↔cerrado (receita de
> captura no cerebrum Key Learnings 2026-07-20 — fuser -k, nunca kill $!).
> **PLAYTEST DO USUÁRIO ✅ ("ficou massa") + REFINOS aplicados:** neve agora exige
> altura E frio (temp<0.6 — caatinga sem neve, pedido do playtest); copa do ipê
> desceu 1 nível (copa DEVE englobar ≥1 bloco de tronco — contrato testado nas 4
> espécies em `arvores.test.ts` NOVO). todo.md: +abas/categorias no inventário
> (mobília/blocos/vegetação/minérios — grade única ficou longa). 261 testes.
> Minérios e inventário NÃO playtestados ainda. Server de teste no ar (porta 8080,
> código BIOMAS, mundo `mundos/teste-biomas/` — descartável).
> **MINÉRIOS + INVENTÁRIO PLAYTESTADOS ✅. MONTANHAS (pedido do usuário):** altura
> 128 em P/M/G (P {8,8,8} 2MB, M {12,12,8} 4,5MB; DEFAULT/plano/aula fica 64 — save
> menor, sem céu à toa). `heightAt` ganhou SERRAS: máscara smoothstep (x/90) × pico
> (x/28) levanta até ~120, **gated por `sizeY>=128`** (param novo — mundo baixo
> manteria mesa clampada E quebraria 15 testes de session/claims que assumem o
> relevo antigo; quem compara heightAt com mundo gerado passa world.sizeY).
> SNOW_HEIGHT 28→58 (neve = coisa de serra, só frio), ROCHA_HEIGHT=85 (serra quente
> expõe pedra — chapada), carvão teto 72 / ferro 40 (montanha minerável). Minério
> aparece exposto em encosta íngreme de graça (encosta corta abaixo do subsolo).
> 262 testes, typecheck 3/3, screenshot serra seed 13 confere (paredão + araucárias).
> Server de teste reiniciado (8080, código BIOMAS, mundo novo 128).
> **TUDO DA SESSÃO 10 PLAYTESTADO ✅ E COMMITADO (biomas+serras+F3: e08cf0e,
> 3a82c3f, 0fffc7c). ABAS DO INVENTÁRIO FEITAS ✅ (playtest ok):** categoria em
> blocksUi (fonte única, `PlaceableEntry.cat`: blocos/vegetação/mobília/minérios/
> letras-e-números), tab bar no InventoryPanel (filtro só de exibição; aba ativa
> sobrevive abrir/fechar), painel com ALTURA FIXA (560px/84vh) e rolagem SÓ na
> grade. Hotbar/scroll//regiao encher intocados. TUDO PUSHADO — escola: `git pull`.
> **OBRA NOVA (pedido do usuário, decisão travada): STREAMING DE CHUNKS — mundo
> GIGANTE FINITO (ex. 4096²) com chunks gerados em RUNTIME + configs de
> desempenho (raio de render, chunks/tick). Plano de 5 fases no cerebrum
> (Decision Log 2026-07-20). ⚠️ ESCOLA NÃO DEVE DAR git pull até estabilizar.**
> **F1 FEITA (NÃO commitada): núcleo esparso + gen por coluna de chunks.**
> World.chunks virou `(Uint8Array|undefined)[]` (denso de REFERÊNCIAS — hot
> paths O(1) intactos; ausente = ar/ignora). `alocarColuna`/`colunaGerada`;
> createWorld(dims, alocar=false) = mundo vazio. arvores.ts refeito PURO
> (`celulasDaArvore` devolve células; `aplicarCelula` aplica com política
> tronco/copa). worldgen: `gerarColunaDeChunks(world,ccx,ccz,seed)` ORDEM-
> INDEPENDENTE — decisões puras (`topoPrevisto`/`arvoreDaColuna` nunca leem o
> mundo), veias re-derivadas das 3×3 vizinhas (filtro de escrita local),
> árvores re-derivadas com margem ARVORE_RAIO_MAX=2, flores leem só a própria
> coluna. TESTADO: gerar colunas embaralhadas = mesmos bytes. 264 testes,
> typecheck 3/3, build ok. Minério muda de layout vs v1 (PRNG por coluna) —
> só em mundo NOVO.
> **PRÓXIMA — F2 (protocolo/cliente): tamanho "E" (gigante, ex. 256×256 chunks
> = 4096²); join manda SÓ header+spawn; msgs novas chunk_data (lote binário por
> raio de interesse) + chunk_unsub; server materializa colunas sob demanda pelo
> interest por jogador (N colunas/tick configurável); cliente: carregar/mesh
> por fila (M/frame), descartar fora do raio, física trata coluna ausente como
> SÓLIDA até chegar; configs: raio de render (menu settings), LJ_RAIO/LJ_CHUNKS_TICK
> (launcher). Depois F3 save esparso LJW1 (só chunks EDITADOS), F4 bordas
> (rules//tp/spawn), F5 eviction. Piloto usa o commit 89d6710 (estável).**
> **SESSÃO 9 (2026-07-20) — CLAIM = COLUNA + VERSÃO DO package.json (commit único desta sessão):**
> (A) CLAIM VIRA COLUNA DE ALTURA TOTAL — pedido do usuário: claim protege da camada 0
> (bedrock) ao teto do mundo, não só a caixa marcada — mata ilha flutuante por cima e
> escavação por baixo. `claims.ts`: removido `MAX_CLAIM_Y`; `claimDentroDoLimite` só checa
> XZ (altura livre). `session.ts` runClaim/criar: após `regionFromCorners`, força `min.y=0`
> / `max.y=world.sizeY-1` antes dos overlaps; mensagens atualizadas ("coluna de X×Z, da base
> ao topo"). Restore sobe claims de saves antigos pra coluna cheia. Cliente inalterado
> (wireframe laranja já desenha a caixa → agora coluna alta).
> (B) VERSÃO SAI DO package.json — `shared/src/version.ts` deixou de ter a string
> hardcoded; agora `import { version } from "../../package.json"` (named import → tree-shake
> não vaza o resto pro bundle). `resolveJsonModule:true` no tsconfig.base. Root package.json
> ganhou `"version"`. **Bump daqui pra frente: `npm version patch|minor|major`** na raiz com
> a árvore limpa (bumpa package.json + faz commit + tag `vX.Y.Z`; push com `git push
> --follow-tags`). Bump desta sessão: 0.6.0 → **0.7.0**. Server loga `v0.7.0`, badge do menu
> idem (lê VERSION). Este commit inclui TB a sessão 8 (flor `emitCrossPlane` + hitbox segue a
> forma). 250 testes (+1 claim-coluna), typecheck 3/3, build + boot do server ok (loga v0.7.0).
> **PENDENTE: `git push` (commitei local; push não foi pedido — escola precisa de `git pull`).**
> **SESSÃO 8 (2026-07-20) — FLOR refeita + HITBOX segue a forma (NÃO commitado ainda):**
> Playtest: porta+janela OK; FLOR com textura bugada. Causa: flor era 2 emitBox (caixas
> finas) → sprite esticado + z-fight (bug-375). Fix: `emitCrossPlane` (mesher) = 2 lâminas
> PLANAS na diagonal da célula, a 90°, UV do tile inteiro, emitidas dos 2 LADOS (estilo
> Minecraft cross). Além disso `blockSelectionBox(id)` (mesher, PURA) devolve a caixa que
> envolve cada não-cubo; o contorno da mira (client/main.ts) virou cubo unitário
> reescalado por frame por essa caixa → "hitbox segue a textura" (flor/tapete/tocha/porta/
> janela/quadro/móveis). 249 testes (+3 em cp23.test: flor=48 floats, blockSelectionBox
> cubo/flor/tapete/porta), typecheck 3/3, build ok. Screenshot headless das 4 flores no
> muro confere (cruz diagonal limpa). PRÓXIMA: playtest da flor + hitbox; depois commitar.
> Last updated: 2026-07-20 (SESSÃO 7 — PIVÔ DA PORTA **E DA JANELA**, ambos COMMITADOS+PUSHADOS.
> Commits: `ab3e87d` porta + `a10ad81` janela. Escola: `git pull`. Próxima: PLAYTEST — ver blocos abaixo.)
> **SESSÃO 7b (2026-07-20) — PIVÔ DA JANELA (igual à porta):** 4 ids R da janela
> (`JanelaXFechadaR`..`JanelaZAbertaR` = 112-115); helpers espelho (`isJanelaAberta`,
> `janelaEixoX`, `janelaHingeAlta`, `janelaComHinge`). `escolherDobradica` (session.ts) virou
> GENÉRICO — parametrizado por `alturas` (porta=2, janela=1) + os helpers da família; porta e
> janela chamam o mesmo método. Branch novo de janela no place_block (1 célula, sem par). Mesher
> da janela reescrito igual ao da porta (folha aberta dobra no flanco alto se R). Cliente
> inalterado (copy `isJanela`→base já cobre R). 246 testes (+5 janela em cp23.test), typecheck
> 3/3, build ok, screenshot da janela dupla confere. bug-370 recorreu (sentinel do blocks.test
> 108→112→116 ao subir MAX 2×). COMMITADO+PUSHADO (`a10ad81`).
> **SESSÃO 7 (2026-07-20) — PIVÔ/DOBRADIÇA DA PORTA (backlog do todo.md):** porta agora
> escolhe o lado da DOBRADIÇA ao ser colocada. 4 ids R novos (`PortaXFechadaR`..`PortaZAbertaR`
> = 108-111, APPEND depois das flores; dobradiça na aresta ALTA do flanco, espelho das base
> 66-69). `isPorta` cobre os 2 trechos; helpers novos em blocks.ts: `isPortaAberta`,
> `portaEixoX`, `portaHingeAlta`, `portaComHinge`. A ESCOLHA mora no SERVIDOR (autoridade):
> `escolherDobradica` (session.ts) roda no `place_block` da porta, na ordem — (1) porta vizinha
> do MESMO eixo → dobradiça OPOSTA (2 portas lado a lado abrem pro meio = porta dupla); (2)
> senão, parede (cubo cheio) num lado do flanco e não no outro → dobradiça do lado da parede;
> (3) empate → base (dobradiça baixa, comportamento antigo). O cliente NÃO muda: segue mandando
> só o eixo (PortaXFechada/PortaZFechada); o servidor grava a variante. Só o MESHER muda a folha
> ABERTA de lado (dobra no flanco alto se R); FECHADA e física idênticas (célula sólida/vazia —
> dobradiça é puro visual). `isFullCube`/`isSolidBlock`/`isPlaceable`/`portaToggled`/`doorRule`
> estendidos pros ids R (`isFullCube` ganhou `!isPorta` porque R saiu da faixa Cerca..Tocha).
> BLOCK_TILES ganhou os 4 R (mesmo tile portaCima — nunca vão à hotbar). 241 testes (+8 em
> cp23.test: helpers R, 4 casos de placement, abre/fecha+órfã R, e mesher provando a folha base
> dobra no flanco baixo e a R no alto), typecheck 3/3, build ok. Screenshot headless da porta
> dupla aberta confere (folhas dobram pra lados opostos). NÃO commitado ainda.
> **SESSÃO 6 FECHADA + COMMITADA + PUSHADA (2026-07-20)** — versão, mundos/ em pastas,
> chat.log, claim 32×32×64, cama de 2 blocos, flores, fix /tp ~. Próxima: PLAYTEST — ver bloco abaixo.
> **SESSÃO 6c (2026-07-20):** (6) MUNDO = PASTA PRÓPRIA — cada
> mundo agora mora em `mundos/<nome>/` com `<nome>.ljw` (save) + `chat.log`
> (transcrição). paths.ts ganhou `nomeDoMundo`/`pastaDoMundo`/`savePathDoMundo`/
> `chatLogDoMundo`; `mundoDeTrabalho` devolve `chatLog` junto. mundos.ts
> `mundosDisponiveis` agora escaneia SUBPASTAS de mundos/ + cenarios/ (save vivo
> vence modelo). (7) LOG DE CHAT EM ARQUIVO — `registrarChat` (index.ts) engancha
> no `entregar` (ponto único server→cliente), deduplica o fan-out do broadcast
> (`ultimoChatLogado`) e grava `mundos/<nome>/chat.log` (append, `[ISO] autor: texto`);
> reaponta na troca de aula. Mora no HOST (fs) — singleplayer/Web Worker não loga,
> como o profiler. (8) LAUNCHERS migram layouts antigos (`world.ljw` raiz e
> `mundos/*.ljw` achatados → `mundos/<nome>/<nome>.ljw`) e a opção [8] lista as
> PASTAS. todo.md: os 2 itens (log de chat, salvar em pastas) marcados FEITO (host).
> typecheck 3/3, build ok, smoke real com cliente ws: join+chat gravaram em
> `mundos/mundo-livre/chat.log` (welcome + msg, dedup ok) e save na pasta ✓.
> NÃO commitado ainda. (9) LIMITE DE CLAIM 16³ → 32×32×64: `claims.ts` agora tem
> `MAX_CLAIM_XZ=32` + `MAX_CLAIM_Y=64` (por eixo, não mais um valor só);
> `claimDentroDoLimite`, import e mensagem de erro em session.ts atualizados; testes
> em claims.test.ts ajustados (mundoComTurma parametrizável). 230 testes, typecheck 3/3.
> (10) CAMA = PAR DE 2 CÉLULAS (horizontal, estilo Minecraft) orientada pelo yaw:
> sem novos ids — as 4 direções (96-99) ocupam 2 células com o mesmo id; `camaHeadDir`
> (blocks.ts) = vetor pé→cabeceira; placement valida o par (session.ts, igual à porta);
> `camaRule` (rules.ts) evapora metade órfã; mesher infere pé/cabeceira pelo vizinho
> (pé sem travesseiro). 232 testes (2 novos em cp23.test), typecheck 3/3, build, mesh
> smoke ✓. (11) TODO anotado: porta escolher pivô pelo lado com bloco (2 portas lado a
> lado = pivôs opostos). (12) FLORES (ids 104-107, 4 cores: vermelha/amarela/azul/
> branca) — plantinhas atravessáveis, precisam de apoio, somem sem chão (regra da
> tocha). Render = 2 lâminas cruzadas + tile cutout (transparente, como folhas);
> `isFlor` fora de isFullCube/isSolidBlock; entrada na hotbar (blocksUi). (13) FIX
> bug-359: `/tp nome x y z` com `~` usava a coordenada do jogador ALVO; agora usa a
> de QUEM digita (o professor), convenção Minecraft. 233 testes (cama+flor), typecheck
> 3/3, build, mesh smokes ✓.
> **TODA A SESSÃO 6 COMMITADA + PUSHADA (2026-07-20).** Commits desta sessão:
> versão no boot/menu → mundos/ saves + launcher → mundo=pasta + chat.log + claim
> 32×32×64 → cama de 2 blocos + flores + fix /tp ~. Escola: `git pull`.
> **PRÓXIMA SESSÃO — PLAYTEST do que a sessão 6 entregou:** (a) versão aparece no
> boot do server e no canto do menu; (b) mundo livre salva em `mundos/mundo-livre/`;
> launcher opção [8] "carregar mundo salvo" lista as pastas; (c) `chat.log` grava em
> `mundos/<nome>/` (abrir o arquivo depois de uma aula); (d) claim até 32×32×64 (aluno
> marca área maior com a varinha); (e) CAMA colocada vira 2 blocos orientados pelo
> olhar (cabeceira longe, com travesseiro; quebrar 1 metade some a outra); (f) FLORES
> na hotbar (colocar no chão, atravessar, quebrar o chão → some); (g) `/tp nome ~ ~ ~`
> manda o aluno pra posição do PROFESSOR. Backlog aberto (todo.md): ~~pivô da porta~~
> (FEITO sessão 7), animação sentar/deitar, modelo de player, atalhos do navegador,
> sobrevivência, geração procedural. Depois do playtest: o PILOTO e o relatório.
> **Playtest da SESSÃO 7 (adicionar ao roteiro):** (h) porta com PAREDE só de um lado →
> dobra pro lado da parede; (i) 2 portas lado a lado → abrem pra lados opostos (porta dupla);
> (j) porta solta (sem parede/vizinha) → dobra como antes (base).
> **SESSÃO 6b (2026-07-20, sem commit ainda):** (4) PASTA `aulas/` → `mundos/`
> (`PASTA_AULAS`→`PASTA_MUNDOS` em paths.ts). Agora é o lar de TODOS os saves vivos:
> mundo livre + cópias de trabalho das aulas. Mundo livre PADRÃO (sem LJ_SAVE) mudou
> de `world.ljw` (raiz) → `mundos/mundo-livre.ljw` (index.ts). Saves vivos viraram
> GITIGNORED (`/mundos/`, `/world.ljw`); modelos seguem tracked em `cenarios/`.
> Resquício stale `aulas/aula1-sequencia.ljw` removido (git rm; era cópia regenerável
> do modelo). (5) LAUNCHER (.sh + .bat) opção [8] "Carregar mundo salvo": lista
> `mundos/*.ljw` e carrega o escolhido; migra `world.ljw` antigo → `mundos/mundo-livre.ljw`
> na 1ª execução (não perde a construção da turma). `/mundo lista` no jogo já pega os
> saves (escaneia dirname(savePath)=mundos/ + cenarios/) — nada a mudar. typecheck 3/3,
> build ok, boot smoke real: server sobe, autosave E save-ao-encerrar gravam em
> `mundos/mundo-livre.ljw` ✓. NÃO commitado ainda (aguardando ordem do usuário).
> **SESSÃO 6 (2026-07-20):** (1) ARQUIVO DE VERSÃO — `shared/src/version.ts`
> exporta `VERSION` ("0.6.0"), FONTE ÚNICA (barrel `shared/index.ts` reexporta;
> nenhum package.json tem `version`). Server loga `Lógica em Jogo v0.6.0` no boot
> (`server/index.ts`, callback do http.listen). Cliente: badge `#menu-version` no
> canto inferior direito do overlay `#menu` (`menu.ts` seta em `showMenu`; CSS
> `position:absolute` no `#menu` que já é `position:fixed` → visível em TODA tela
> do menu). typecheck 3/3, build ok, 230 testes. Bump futuro: mexer SÓ em
> version.ts. (2) TODO.MD +2 itens de backlog: (a) salvar o log do chat em arquivo
> (mesmo padrão do profiler "enviar pro servidor" — HOST grava, GameSession não tem
> fs; singleplayer/Web Worker sem fs cai no vácuo); (b) salvar mundo em PASTAS (uma
> pasta por mundo em vez de `.ljw` único) — VAI PRECISAR mudar o sistema de exportar
> mundos do singleplayer (hoje worldStore.ts exporta blob .ljw único via download).
> (3) Commit da sessão — versionado tudo EXCETO os arquivos de runtime do OpenWolf
> (`_session.json`, `token-ledger.json`).
> **SESSÃO 5 (2026-07-20, sem commit ainda):** (0) PLAYTEST a/b/c CONFIRMADO pelo usuário: (a)
> roteiro sessão 2 (atalhos/dia-noite/tapetes/janela/móveis/quadro), (b) aulas 4-6 + aula1 3
> fases, (c) mundo M/G no lab (FPS/hitch de join). Restam (d) cp24 claims + cp25 confinamento.
> (0b) PROFILER "ENVIAR PRO SERVIDOR" (backlog todo.md) — botão novo no HUD F3 ao lado de
> "exportar JSON"; msg `profile_report{stats}` nova no protocolo (opaco, cresce sem
> re-versionar — mesmo padrão do meta de save/quadros), teto `MAX_PROFILE_REPORT_CHARS=8192`
> contra abuso de disco. Tratada no HOST (index.ts, `interceptarProfile`, MESMO padrão de
> /mundo e /kicar: escrever arquivo é transporte, GameSession não tem filesystem) — exige
> join, grava `profiles/perf-<nome>-<timestamp>.json` (pasta gitignored), responde confirmação
> por chat. Singleplayer (Web Worker) não tem fs: a mensagem cai no vácuo em silêncio (sem case
> no switch da session), sem erro no cliente — comportamento intencional. 230 testes (2 novos
> em protocol.test.ts: roundtrip + teto de tamanho), typecheck 3/3, build ok. Smoke real (host
> Node + ws real, join com PIN → profile_report → arquivo em disco + confirmação por chat) ✅.
> Playtest do usuário PENDENTE (botão no F3, testar em notebook + tablet). (1) PLAYTEST MUNDO G CONFIRMADO —
> usuário testou com os alunos: mundo tamanho G renderiza e carrega normal em
> notebooks E tablets da escola (item do checklist de playtest acumulado, ver
> "PRÓXIMA SESSÃO" abaixo). (2) BUG-333 — quadro (texto/imagem) ficava fantasma:
> painel branco com texto renderizado na MESMA coordenada mesmo depois de trocar
> de mundo. Causa: `reloadWorld` (cp19, main.ts) zera regions/objectives/groups
> na troca de aula mas esquecia `quadroRenderer` — servidor só reenvia a msg
> `quadros` se o mundo NOVO tiver conteúdo (session.ts, `this.quadros.size`), daí
> mundo sem quadro não manda nada e o plane 3D antigo sobrevive na cena. Fix: 1
> linha (`quadroRenderer.setAll([], world)` junto da limpeza de regions/
> objectives). typecheck 3/3. Playtest da correção PENDENTE. (3) `ideias.md` →
> `todo.md` (rename pedido pelo usuário; anatomy.md atualizado; histórico de
> sessões passadas mantido como estava, sem reescrever log).
> **SESSÃO 4 (2026-07-20, sem commit ainda):** (1) BOTÃO HUD NO TOQUE — tablet não
> tem tecla F3; `TouchActions.hud()` novo (touch.ts) + botão "📊 hud" na fileira do
> topo, chama o MESMO `hud.toggle()` do atalho de teclado (main.ts: criação do
> `Hud` movida pra ANTES do bloco `isTouchDevice()` só pra existir no escopo da
> wiring — zero lógica nova). typecheck 3/3 ok; playtest em tablet real PENDENTE
> (sem harness pra DOM de toque). (2) BACKLOG VIROU `ideias.md` — `ideias para
> fazer.txt` apagado, conteúdo migrado pra markdown com checkboxes `[x]`/`[ ]`
> por seção (móveis, comandos, mundo, anti-griefing) preservando os registros de
> FEITO existentes; 4 seções novas de ideias do usuário: animação sentar/deitar
> (cadeira/cama, passar a noite), modelo de player estilo Minecraft, sol
> quadrado estilo Minecraft, profiler complexo com upload de resultado do
> cliente pro servidor (centraliza medidas de vários dispositivos — puxa a
> política de otimização/HUD F3 já existente), sistema de sobrevivência (fome/
> vida/ferramentas/craft/minérios — feature grande, sem escopo ainda), geração
> procedural de terreno + otimização de save/load de mundo. Nenhuma dessas 4
> tem decisão de escopo — são candidatas de backlog, não próxima fase travada.
> **FASES (2026-07-20): Cenario.fases[] no gerador — 2+ fases = modo sequencial
> automático, cada grupo no seu ritmo; aula1 virou 3 fases (período 3 → 4 →
> crescente). Receita de criar/mudar fases no cenarios/README.md.**
> **SESSÃO 3 (2026-07-20, 3 commits):** (1) TAMANHO DE MUNDO P/M/G na criação —
> menu select, worker init `tamanho`, LJ_TAMANHO no host, launchers perguntam;
> P=128² (padrão), M=192², G=256²×128; save sempre carregou dims = zero migração.
> (2) OTIMIZAÇÃO MEDIDA (bench no scratchpad, números no cerebrum): fast path
> de chunk 100% ar no meshChunk + perMessageDeflate no ws (snapshot G de 8 MB
> = 41,6 KB no fio — join da turma 160 MB→<1 MB). Greedy/worker/gzip-save
> ADIADOS com registro (sem dor medida). (3) CENÁRIOS 4-6 (aprovados pelo
> usuário, gerados+conferidos): aula4-decifrar (cifra de César em blocos-letra,
> dica cifrada visível ao lado da área), aula5-simetria (parede 7×6 de coração
> com 4 erros assimétricos — gerador agora suporta área em CAIXA dx×dy×dz),
> aula6-manual (3 QUADROS com passos guiam sala 3×3 de móveis DIRECIONAIS —
> cadeira virada errada conta erro). Gerador refatorado: gabarito/partida viram
> funções (i,j,k), extras() por grupo, conferirExtra(). bug-303: launchers
> apontavam cenarios/aulaN.ljw que nunca existiu — corrigido + aulas 4-6 no
> menu. README dos cenários atualizado (6 aulas, .ljw versionados). 228 testes,
> typecheck 3/3, screenshots das 3 aulas novas ✅ (contador 38/42 da aula5
> confere os 4 erros).
> **PRÓXIMA SESSÃO:** (a)(b)(c) abaixo CONFIRMADOS pelo usuário (2026-07-20, sessão 5) — resta
> playtest de: (d) cp24 claims + cp25 confinamento (roteiros nos blocos antigos), (e) fix
> bug-333 (quadro fantasma na troca de mundo), (f) botão HUD no touch (tablet real), (g)
> profiler "enviar pro servidor" (botão no F3, notebook + tablet, conferir `profiles/` no
> host). Playtest ACUMULADO original (a-d, referência): (a) roteiro da sessão 2
> (atalhos Ctrl+W em tela cheia F11, dia/noite com astros, tapetes, janela,
> móveis direcionais, quadro texto+imagem), (b) aulas 4-6 + aula1 em 3 FASES
> com a turma, (c) mundo M/G no lab (medir FPS/hitch de join no PC fraco —
> gatilho registrado do greedy/worker), (d) cp24 claims + cp25 confinamento
> (roteiros nos blocos antigos). Depois do playtest: o PILOTO e o relatório.
> Tudo commitado e PUSHADO (escola: git pull). 228 testes, typecheck 3/3.
> **BACKLOG COMPLETO FEITO (2026-07-19 sessão 2, 5 commits — playtest AMANHÃ):**
> (1) ATALHOS DO NAVEGADOR: guarda de 3 camadas (client/shortcutGuard.ts) —
> beforeunload ("sair do site?"), preventDefault nos combos interceptáveis
> (Ctrl/Alt/Meta+tecla, Tab, F1/F5/F6/F7/F10/F12) e Keyboard Lock API (Chrome,
> só em tela cheia F11 — aí Ctrl+W/T/N/R vira keydown comum). Desarma em saída
> legítima (menu/kick). Ctrl+W em janela COMUM só mostra o diálogo — limitação
> do navegador, avisar professor: tela cheia = proteção total. (2) DIA/NOITE:
> sol/lua/estrelas visíveis (grupo segue câmera, oclusão grátis), keyframes
> ricos c/ smoothstep, dia 10→20 min (DIA_SEGUNDOS=1200), /hora consulta
> liberada pra aluno, ?hora=/?yaw= na URL pra screenshot. bug-301 (TDZ) e
> bug-302 (Number(null)=0 travava céu na meia-noite) achados e corrigidos.
> (3) TAPETES 12 cores (ids 71-82): lâmina 1/16, atravessável, regra de apoio
> da tocha (precisaApoio). (4) JANELA abre-fecha (83-86): 1 célula, dobradiça
> da porta, isInterativo/interativoToggled generalizam use_block (par vertical
> segue SÓ da porta). (5) MÓVEIS (87-99): mesa + cadeira/sofá/cama em 4
> direções (rotXZ k×90°, frente encara o jogador no place, entrada única na
> hotbar). (6) QUADRO texto+imagem (100-103): 1º estado FORA do id —
> shared/quadros.ts + client/quadros.ts, quadro_set/quadro_changed/quadros no
> protocolo, Map por posição na session, persiste no meta, editor overlay sem
> popup, imagem comprimida local (192px JPEG, teto 32k chars). 225 testes,
> typecheck 3/3, build+dist, screenshots headless de tudo.
> **PLAYTEST AMANHÃ — roteiro extra do backlog novo:** correr com Ctrl+W (aba
> não fecha em tela cheia; janela comum pergunta antes de sair); F11 tela
> cheia; /hora como aluno; noite com estrelas + lua (professor /ciclo ligar ou
> /hora noite); tapetes/janela (clique direito)/mesa+cadeira+sofá+cama (direção
> ao colocar); quadro: colocar na parede, clique direito, digitar texto,
> escolher foto do PC, ver no outro cliente, fechar host e reabrir (persiste).
> **BACKLOG RÁPIDO FEITO (2026-07-19, 3 commits — playtest pendente):**
> (1) nome SEM espaço/especial — `sanitizeName` (shared/auth.ts) filtra pra
> letra/número/acento/_/- e corta em 24; servidor sanitiza no join, menu migra
> nome antigo do localStorage, input com pattern (9c5349a; grosso já vinha
> codado da sessão 2026-07-18, verificado+commitado aqui). (2) autocomplete de
> NOMES no Tab — learnPlayers (commands.ts) alimentado pelo player_moved/left;
> /tp /tpr /tpa /kicar /resetpin /amigos; fecha gap: /claim e /amigos entraram
> na árvore (b46f52c). (3) PORTA pivota na DOBRADIÇA — painel na borda da
> célula, fechada/aberta compartilham a aresta do canto = abrir gira 90° na
> ponta, não no próprio eixo (mesher.ts). 212 testes, typecheck 3/3, build+dist,
> screenshot headless das 2 portas confere.
> **COMMITADO + PUSHADO (2026-07-18):** commit 361f73d varreu TUDO desde voo/bedrock
> (cp25 confinamento, cp24 claims/amigos, rocha-matriz só-professor, mundos-aula
> read-only, launchers, docs, dist). `git push origin main` OK — escola faz `git pull`.
> **LAUNCHERS DO SERVIDOR (2026-07-18):** `iniciar-servidor.bat` (Windows/escola,
> DUPLO-CLIQUE via cmd.exe — escapa do bloqueio PowerShell/npm bug-232) e
> `iniciar-servidor.sh` (WSL/Linux/casa). Menu de mundo (1=livre→world.ljw, 2-4=
> cenarios/aulaN.ljw), pergunta código do professor (LJ_CODIGO opcional), LJ_NOVO=1,
> auto-npm-install, roda `npm run start -w server`. Boot smoke do .sh OK (imprime
> código + URL). Trocar de aula ao vivo segue via /mundo carregar no jogo.
> **cp25 CONFINAMENTO CODADO (2026-07-17, PLAYTEST DO USUÁRIO PENDENTE):** inverso
> do claim — em mundo de aula/atividade o aluno só COLOCA e QUEBRA dentro da área
> do seu grupo (cp13, `areaDoGrupo`→ nova `areasDoGrupo(g)` = todas as caixas do
> grupo, todos os objetivos). `confinamentoAtivo` na session; gate `confinaBloqueia`
> plugado em place_block (porta checa as 2 células) e break_block, ao lado do
> `claimBloqueia`. Professor isento; aluno SEM grupo = travado em tudo (decisão de
> escopo). Liga por `/confinar ligar|desligar|status` (professor) E auto em
> mundo-aula (`SessionOptions.somenteLeitura` novo, propagado pelo host: index.ts
> boot + mundos.ts `novaSessao(restore, somenteLeitura)`). Persiste no save de
> mundo LIVRE (`SaveMeta.confinamento`); em aula não salva (read-only) — reseta por
> turma. SEM protocolo/UI novo: aluno já vê a caixa VERDE do objetivo; barra =
> chat de aviso (mesma barreira-no-servidor da rocha-matriz/claim). 207 testes (6
> novos em confinamento.test.ts), typecheck 3/3, build+dist ok, boot smoke do host
> limpo. Entrevista de escopo feita (4 perguntas AskUserQuestion — decisões travadas).
> **PLAYTEST cp25 — roteiro:** professor cria grupos (/grupo criar N) + objetivo
> per-grupo com área (/objetivo add ... prefixo-1..N), `/confinar ligar`; aluno A
> (grupo 1) constrói só na área dele, tenta na área do grupo 2 → barrado com aviso;
> aluno sem grupo → barrado em tudo; professor edita em qualquer lugar; trocar pra
> mundo-aula já entra confinado sem digitar /confinar.
> **CENÁRIOS APROVADOS ✅ (2026-07-17):** usuário aplicou as 3 aulas com a turma
> INTEIRA — "cenarios testados, todos bons". Playtest pedagógico FEITO.
> **ROCHA-MATRIZ SÓ-PROFESSOR (2026-07-17):** `isProfessorOnly(id)` novo em
> blocks.ts (só bedrock por ora). Servidor recusa `place_block` de rocha-matriz
> se papel≠professor (barreira real). Cliente: `placeableFor(papel)` esconde do
> inventário e da hotbar (default+valid set), botão-do-meio não copia. 193 testes
> (1 novo), typecheck 3/3, build ok. bug-281 logado (aluno colocava/copiava antes).
> **MUNDOS "AULA" NÃO SALVAM (2026-07-17):** mundo cujo arquivo começa com "aula"
> (as 3 lições) roda REUTILIZÁVEL: `ehMundoDeAula()` em paths.ts → começa SEMPRE
> do modelo em cenarios/ e `saveNow` vira no-op (autosave + SIGINT + troca de
> aula). Próxima turma reaproveita sem mover/apagar arquivos. `/mundo carregar`
> propaga o flag (TrocaDeMundo.somenteLeitura). Smoke real: boot em aula1 loga
> "mundo de AULA", carrega do modelo, mtime de aulas/ intacto no exit. typecheck
> 3/3, build ok. (server sem harness de teste — verificado por boot real.)
> **cp24 ANTI-GRIEFING CODADO (2026-07-17, PLAYTEST DO USUÁRIO PENDENTE):**
> claim por REGIÃO (varinha) + grupo de amigos do aluno (convite+aceite).
> `shared/claims.ts` (Claim/GrupoAmigos, MAX_CLAIM_DIM=16, MAX_AMIGOS=6,
> caixasSeCruzam/claimDentroDoLimite/parseClaim/parseGrupoAmigos). Servidor:
> gate `claimBloqueia` em place/break/use_block (professor e dono+amigos passam;
> estranho recebe chat de aviso), `/claim ligar|desligar|criar|remover|lista`,
> `/amigos convidar|aceitar|recusar|sair|expulsar|lista`, msgs `claims` (todos)
> + `friends` (pessoal), toSave/restore (claimsAtivo+claims+amigos no meta; some
> em mundo-aula read-only). Varinha liberada pro ALUNO quando a proteção está
> ligada (marca cantos → /claim criar). Cliente: wireframes laranja dos claims
> pra todos, varinha do aluno, dica role-aware. Painel de amigos = FASE 2
> (comandos primeiro, convenção cp14). 201 testes (8 novos em claims.test.ts),
> typecheck 3/3, build+dist ok. Decisões no cerebrum Decision Log (2026-07-17).
> **PLAYTEST cp24 — roteiro:** professor `/claim ligar`; aluno A marca área com
> R (esq=canto1, dir=canto2) e `/claim criar casa`; aluno B tenta quebrar dentro
> → barrado com aviso; A `/amigos convidar B`, B `/amigos aceitar A` → B edita;
> professor edita por cima (ignora); trocar pra mundo-aula → claim some (ok).
> **VOO CRIATIVO + BEDROCK CAMADA 0 (2026-07-17, PLAYTEST DO USUÁRIO PENDENTE):**
> (a) voo do modo criativo — professor voa SEMPRE (duplo-toque no espaço; espaço
> sobe, agachar desce, sem gravidade mas colide); `/voo ligar|desligar` libera/
> tranca pra turma (professor + alternável, escolha do usuário). Física 100%
> cliente (`MoveInput.fly` em physics.ts), msg `voo {liberado}` nova no protocolo
> (join só manda se liberado = zero churn), `vooLiberado` NÃO persiste. (b) bedrock
> na camada 0 do preset NORMAL (plano/cabines já tinham). 192 testes (10 novos),
> typecheck 3/3, build+dist ok, screenshot de boot confere (sem TDZ, welcome com
> /voo). Autocomplete e welcome atualizados.
> **BACKLOG RESTANTE (ideias para fazer.txt, 2026-07-17):** ✅ FEITOS 2026-07-19:
> autocompletar nomes, nome sem espaços, porta pivota na dobradiça. AINDA ABERTOS:
> interceptar atalhos do navegador com mouse capturado
> (Ctrl+W fecha aba ao correr); móveis (tapete/janela abre-fecha/cama/sofá/
> cadeira/mesa/quadro com interface texto+imagem); arrumar dia/noite. /kicar já
> existe (cp22). **NOVA IDEIA (cp25 candidato):** modo "confinamento" — em
> mundos de aula/atividade, aluno só coloca bloco DENTRO da sua área/da área do
> seu grupo (inverte o claim: confinar em vez de proteger). ✅ CODADO (bloco cp25
> no topo) — playtest pendente. Reusou claims (cp24) + grupos pedagógicos (cp13).
> **PRÓXIMA SESSÃO:** playtest acumulado (cp24 anti-griefing + voo + bedrock +
> cp25 confinamento + backlog de 2026-07-19: nome sem espaço, Tab completa nomes,
> porta na dobradiça — todos codados, roteiros nos blocos respectivos). Depois:
> próximo item do backlog (atalhos do navegador, móveis, dia/noite). E o piloto.
> **Playtest anterior FEITO (resultados no ideias para fazer.txt):** cp23,
> /regiao encher/criar, /tp·/tpr·/tpa aprovados — backlog acima veio dele.
> **/TPR + /TPA + /TP NOME (2026-07-17):** aluno pede teleporte (/tpr nome,
> expira 30 s) e o outro aceita (/tpa [nome]); professor teleporta direto
> (/tp nome = ir até; /tp nome x y z = enviar, ~ relativo ao teleportado).
> Welcome atualizado, autocomplete com /tpr /tpa. 182 testes, typecheck 3/3,
> build+dist ok.
> **cp23 — CERCA + PORTA + TOCHA (grupo C rodada 1) + ENCHER EM LOTE
> (2026-07-17, playtest do usuário PENDENTE):** primeiros NÃO-CUBOS (ids
> 65–70). Cerca conecta sozinha (poste+travessas, estilo Minecraft); porta de
> 2 blocos abre/fecha no clique direito (`use_block` novo no protocolo; estado
> no ID, metade órfã evapora por regra); tocha decorativa (halo no cliente,
> precisa de apoio, SEM luz voxel — decisão do usuário). Física: porta aberta
> e tocha atravessam (`isSolidBlock`). Mesher ganhou formas (`emitBox` UV
> proporcional + culling de face rente). `/regiao encher` virou LOTE: 1 msg
> `blocks_filled`, teto 4096→65536 (`MAX_ENCHER_CELLS`); regras/objetivos
> acordam igual. 173 testes, typecheck 3/3, build+dist ok, screenshots
> headless (cena + platô de 5390 blocos) conferem.
> **/REGIAO CRIAR POR COORDENADAS (2026-07-17):** `/regiao criar nome x1 y1 z1
> x2 y2 z2` cria sem varinha; `~`/`~n` = coordenada atual do autor (célula,
> estilo Minecraft). Varinha continua valendo (3 parts). MESMO `~` no
> `/bloco x y z id`. parseCoordArg em session.ts é reusável pro /tp futuro.
> 157 testes (4 novos), typecheck 3/3, build + dist atualizados.
> **PLAQUINHA DE NOME (2026-07-17):** nome do jogador flutua sobre o boneco
> (Sprite canvas, visível através de parede — professor acha aluno). `name`
> opcional em `player_moved` (host antigo compatível). 153 testes, typecheck
> 3/3, build + dist atualizados, screenshot headless confirma.
> **TOUCH CONTROLS FEITOS + PLAYTEST MOBILE ✅ (2026-07-16):** celular jogou na
> rede de casa via notebook Windows (host = clone do git). Rodada 2 (tela cheia,
> botão chat, hotbar fixa, /say no terminal) FEITA e pushada. Piloto é HOJE —
> checklist na seção 🚀; notebook da escola: `git pull` antes de rodar.
> **INFRA DO PILOTO (2026-07-15, PLAYTEST DO USUÁRIO PENDENTE):** (1) servidor
> serve o cliente na MESMA porta (aluno abre http://ip-do-prof:8080 e joga, sem
> Vite separado); (2) varredura das mensagens de erro (66+ reescritas, frase
> culta e clara); (3) **cp19 — trocar de aula SEM derrubar a turma** (`/mundo
> carregar nome`, ninguém reconecta, professor segue professor); (4) cenários em
> `cenarios/` são MODELO (nunca escritos) — o autosave grava CÓPIA DE TRABALHO em
> `aulas/`, então distribuir um .ljw não carrega a turma anterior. Smoke cp19
> 13/13, typecheck 3/3. **.exe/empacotamento ADIADO** (usuário ainda vai mexer).
> **MVP v2 FECHADO (2026-07-13): plataforma de autoria completa — professor cria
> cenário inteiro dentro do jogo (painel ou comandos), grupos, mundo-modelo
> cabines, tudo persiste e viaja no .ljw.
> POLIMENTO "blocos + mecânica" FECHADO (2026-07-13): cp15–cp18 playtestados e
> APROVADOS. 137 testes, typecheck 3/3, build.
> **CENÁRIOS PEDAGÓGICOS CODADOS (2026-07-14) — APROVADOS ✅ (playtest com a
> turma inteira, 2026-07-17: "todos bons").**
> 3 aulas geradas por script (`npm run cenarios`), auto-conferidas, com roteiro
> de aula. Turma do piloto: **6º–9º**. Achado que bloqueava o piloto e já
> corrigido: bug-172 (Vite dev só atendia localhost → aluno na LAN não abria o
> cliente).
> **PRÓXIMO: playtest dos 3 cenários → piloto com a turma → relatório.** Água
> fica FORA (fluido = fase própria). cp10 (validação de física no servidor)
> segue ADIADO — sem gatilho.**

## Action Log

## Session: 2026-07-21 13:37

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 13:52 | Edited shared/src/blocks.ts | modified isAgua() | ~212 |
| 13:52 | Edited shared/src/blocks.ts | 5→5 lines | ~55 |
| 13:52 | Edited shared/src/blocks.ts | 9→10 lines | ~95 |
| 13:52 | Edited shared/src/mesher.ts | 4→6 lines | ~58 |
| 13:53 | Edited shared/src/mesher.ts | modified gua() | ~84 |
| 13:53 | Edited client/src/atlasTexture.ts | added 1 condition(s) | ~256 |
| 13:53 | Edited client/src/atlasTexture.ts | modified gua() | ~50 |
| 13:53 | Edited client/src/blocksUi.ts | modified gua() | ~54 |
| 13:53 | Edited shared/src/physics.ts | 2→2 lines | ~28 |
| 13:53 | Edited shared/src/physics.ts | modified gua() | ~133 |
| 13:53 | Edited shared/src/physics.ts | modified inWater() | ~102 |
| 13:53 | Edited shared/src/physics.ts | added 5 condition(s) | ~494 |
| 13:54 | Edited shared/src/blocks.test.ts | modified gua() | ~97 |
| 13:54 | Edited shared/src/blocks.test.ts | expanded (+8 lines) | ~38 |
| 13:54 | Edited shared/src/blocks.test.ts | expanded (+6 lines) | ~110 |
| 13:54 | Edited shared/src/claims.ts | 5→6 lines | ~95 |
| 13:54 | Edited shared/src/claims.ts | modified claimDentroDoLimite() | ~79 |
| 13:54 | Edited shared/src/session.ts | 8→10 lines | ~46 |
| 13:54 | Edited shared/src/session.ts | added 1 condition(s) | ~135 |
| 13:55 | Edited shared/src/session.ts | modified if() | ~531 |
| 13:55 | Edited client/src/touch.ts | modified quebrar() | ~64 |
| 13:55 | Edited client/src/touch.ts | 7→10 lines | ~162 |
| 13:55 | Edited client/src/main.ts | 7→9 lines | ~124 |
| 13:55 | Edited client/src/main.ts | 8→9 lines | ~75 |
| 13:55 | Edited client/src/main.ts | 2→2 lines | ~31 |
| 13:55 | Edited shared/src/claims.test.ts | 5→6 lines | ~137 |
| 13:56 | Edited shared/src/claims.test.ts | expanded (+15 lines) | ~503 |
| 13:56 | Edited shared/src/claims.test.ts | 18→18 lines | ~252 |
| 14:00 | Edited shared/src/claims.test.ts | 5→6 lines | ~125 |
| 14:00 | Edited shared/src/arvores.ts | 1→3 lines | ~28 |
| 14:00 | Edited shared/src/world.test.ts | 4→4 lines | ~41 |
| 14:01 | Edited todo.md | 2→3 lines | ~167 |
| 14:01 | Edited todo.md | modified NOVO() | ~268 |
| 14:01 | Edited todo.md | 3→8 lines | ~177 |

## SESSÃO 13 (2026-07-21) — água + /claim professor/caixa + varinha mobile
| HH:MM | descrição | arquivo(s) | resultado | ~tokens |
| --- | --- | --- | --- | --- |
| — | bloco de água id 129 (atravessável, translúcida por furos+alphaTest, nado) | blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, physics.ts, blocks.test.ts | typecheck ok, testes ok | ~4k |
| — | /claim: professor cria + CAIXA + limite 64×63×32 (reverte coluna cheia sessão 9) | claims.ts, session.ts, claims.test.ts | 280 testes verdes | ~3k |
| — | varinha no mobile: botão 🪄 no touch UI (toggleVarinha extraído) | touch.ts, main.ts | build ok | ~1k |
| — | consertei 2 typecheck pré-existentes (arvores.ts:85, world.test.ts:53) | arvores.ts, world.test.ts | typecheck 0 erros | ~0.5k |
| — | 2 backlog novos anotados (aba jogadores P + ban por nick; escala UI mobile) | todo.md | logado | ~0.5k |
| 14:04 | Session end: 34 writes across 14 files (blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, physics.ts) | 16 reads | ~91063 tok |
| 14:18 | Edited shared/src/claims.ts | 6→7 lines | ~119 |
| 14:18 | Edited shared/src/claims.ts | Caixa() → Pegada() | ~88 |
| 14:18 | Edited shared/src/session.ts | 10→9 lines | ~42 |
| 14:18 | Edited shared/src/session.ts | modified for() | ~133 |
| 14:19 | Edited shared/src/session.ts | 26→29 lines | ~408 |
| 14:19 | Edited shared/src/claims.test.ts | 6→6 lines | ~144 |
| 14:19 | Edited shared/src/claims.test.ts | modified rea() | ~600 |
| 14:21 | Edited shared/src/save.ts | 2→5 lines | ~80 |
| 14:21 | Edited shared/src/save.ts | added 2 condition(s) | ~139 |
| 14:21 | Edited shared/src/save.ts | 3→4 lines | ~56 |
| 14:21 | Edited shared/src/protocol.ts | expanded (+10 lines) | ~141 |
| 14:21 | Edited shared/src/protocol.ts | added 3 condition(s) | ~221 |
| 14:22 | Edited shared/src/session.ts | 3→7 lines | ~133 |
| 14:22 | Edited shared/src/session.ts | 2→3 lines | ~73 |
| 14:22 | Edited shared/src/session.ts | 9→10 lines | ~102 |
| 14:22 | Edited shared/src/session.ts | added 1 condition(s) | ~128 |
| 14:22 | Edited shared/src/session.ts | added 4 condition(s) | ~578 |
| 14:22 | Edited shared/src/session.ts | modified jogadores() | ~127 |
| 14:23 | Edited shared/src/session.ts | 4→5 lines | ~69 |
| 14:23 | Edited server/src/index.ts | added error handling | ~779 |
| 14:23 | Edited server/src/index.ts | added 1 condition(s) | ~105 |
| 14:25 | Created client/src/players.ts | — | ~1668 |
| 14:25 | Edited client/index.html | 2→3 lines | ~36 |
| 14:25 | Edited client/index.html | 3→5 lines | ~58 |
| 14:25 | Edited client/index.html | 5→6 lines | ~31 |
| 14:25 | Edited client/index.html | modified not() | ~302 |
| 14:25 | Edited client/src/panels.ts | expanded (+9 lines) | ~110 |
| 14:26 | Edited client/src/panels.ts | added optional chaining | ~69 |
| 14:26 | Edited client/src/main.ts | 1→2 lines | ~35 |
| 14:26 | Edited client/src/main.ts | 2→4 lines | ~73 |
| 14:26 | Edited client/src/main.ts | added 1 import(s) | ~34 |
| 14:26 | Edited client/src/main.ts | added optional chaining | ~147 |
| 14:26 | Edited client/src/main.ts | added optional chaining | ~126 |
| 14:27 | Edited client/src/main.ts | 4→5 lines | ~48 |
| 14:27 | Edited client/src/main.ts | 3→4 lines | ~33 |
| 14:27 | Edited client/src/main.ts | modified if() | ~62 |
| 14:28 | Edited shared/src/claims.test.ts | added optional chaining | ~566 |
| 14:29 | Edited client/src/settings.ts | modified toque() | ~91 |
| 14:29 | Edited client/src/settings.ts | 3→4 lines | ~17 |
| 14:30 | Edited client/src/settings.ts | 3→4 lines | ~66 |
| 14:30 | Edited client/src/touch.ts | expanded (+6 lines) | ~313 |
| 14:30 | Edited client/src/touch.ts | 7→7 lines | ~126 |
| 14:30 | Edited client/src/touch.ts | modified agachar() | ~144 |
| 14:31 | Edited client/src/touch.ts | inline fix | ~30 |
| 14:31 | Edited client/src/touch.ts | 12→14 lines | ~180 |
| 14:31 | Edited client/src/touch.ts | modified setScale() | ~104 |
| 14:31 | Edited client/src/main.ts | added optional chaining | ~55 |
| 14:31 | Edited client/src/main.ts | 5→6 lines | ~52 |
| 14:31 | Edited client/src/menu.ts | added 1 import(s) | ~49 |
| 14:31 | Edited client/src/menu.ts | added 1 condition(s) | ~122 |
| 14:34 | Created client/src/hud.ts | — | ~2524 |
| 14:34 | Edited client/src/main.ts | 3→6 lines | ~80 |
| 14:35 | Edited shared/src/session.ts | added 1 condition(s) | ~147 |
| 14:36 | Edited todo.md | 2→2 lines | ~242 |
| 14:36 | Edited todo.md | 2→3 lines | ~247 |
| 14:37 | Edited todo.md | modified profiler() | ~281 |

## SESSÃO 13 cont. (2026-07-21) — ban/painel + mobile + profiler
| HH:MM | descrição | arquivo(s) | resultado | ~tokens |
| --- | --- | --- | --- | --- |
| — | /claim REVERTIDO pra COLUNA cheia (usuário mudou de ideia); professor cria; limite 64×32 | claims.ts, session.ts, claims.test.ts | 283 testes verdes | ~2k |
| — | painel de jogadores (abas conectados/banidos) + ban por nick (host+session+save+protocol) | players.ts, session.ts, index.ts, save.ts, protocol.ts, main.ts, panels.ts, index.html | typecheck ok, 3 testes ban | ~6k |
| — | mobile: botão agachar (segurar) + escala da UI (settings.uiScale, var --ts) | touch.ts, settings.ts, menu.ts, main.ts | build ok | ~2k |
| — | profiler grava 10s (relatório agregado) + F3 RAM(JS heap)/vídeo(info.memory) + GPU | hud.ts, main.ts | typecheck ok | ~2k |
| — | fix bug-435: broadcastPlayers pula singleplayer (não quebra testes de contrato) | session.ts | 283 testes | ~0.3k |
| 14:40 | Session end: 90 writes across 23 files (blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, physics.ts) | 25 reads | ~140194 tok |
| 14:46 | Edited client/src/hud.ts | added error handling | ~837 |
| 14:46 | Edited client/src/hud.ts | modified if() | ~48 |
| 14:46 | Edited client/src/hud.ts | expanded (+7 lines) | ~101 |
| 14:46 | Edited client/src/hud.ts | added 1 condition(s) | ~284 |
| 14:46 | Edited client/src/hud.ts | expanded (+8 lines) | ~216 |
| 14:46 | Edited client/src/hud.ts | modified buildRecordingReport() | ~446 |
| 14:47 | Edited client/src/hud.ts | modified RAM() | ~193 |
| 14:47 | Edited client/src/main.ts | added 3 condition(s) | ~208 |
| 14:47 | Edited client/src/main.ts | modified handleServerData() | ~48 |
| 14:47 | Edited client/src/main.ts | modified streaming() | ~140 |
| 14:48 | Edited todo.md | modified ABERTO() | ~144 |

## SESSÃO 13 cont.2 (2026-07-21) — 7 métricas novas no profiler
| HH:MM | descrição | arquivo(s) | resultado | ~tokens |
| --- | --- | --- | --- | --- |
| — | plano escrito no STATUS antes de codar (pedido do usuário) | .wolf/STATUS.md | plano | ~0.5k |
| — | hud.ts: long tasks, points/lines, ctx-lost, sessão, bateria, conexão + campos net.jitterMs/stream | client/hud.ts | typecheck ok | ~2k |
| — | main.ts: jitter (desvio do gap entre msgs no handleServerData) + colunas/fila no intervalo 1s | client/main.ts | 283 testes, build ok | ~0.5k |
| 14:49 | Session end: 101 writes across 23 files (blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, physics.ts) | 26 reads | ~144666 tok |
| 14:57 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/e684f215-8460-451a-81e1-2d120f98d9a6/scratchpad/commitmsg.txt | — | ~376 |
| 14:58 | Session end: 102 writes across 24 files (blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, physics.ts) | 26 reads | ~145068 tok |
| 15:18 | Session end: 102 writes across 24 files (blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, physics.ts) | 26 reads | ~145068 tok |
| 15:19 | Edited relatorio/relatorio-aplicacao.md | 3→4 lines | ~70 |
| 15:19 | Edited relatorio/relatorio-aplicacao.md | modified professor() | ~389 |
| 15:19 | Edited relatorio/relatorio-aplicacao.md | modified ampliado() | ~176 |
| 15:20 | Edited relatorio/relatorio-aplicacao.md | expanded (+6 lines) | ~303 |
| 15:20 | Edited relatorio/relatorio-aplicacao.md | modified Campos() | ~186 |
| 15:20 | Session end: 107 writes across 25 files (blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, physics.ts) | 27 reads | ~148791 tok |
| 15:22 | Session end: 107 writes across 25 files (blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, physics.ts) | 27 reads | ~148791 tok |
| 21:36 | Session end: 107 writes across 25 files (blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, physics.ts) | 27 reads | ~148791 tok |

## Session: 2026-07-21 09:38

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 10:01 | Playtest MULTIPLAYER escola: mundo procedural 3840²×128, 10 alunos + 2 profs, ZERO dessincronia; tablets 60-90fps, tick<1ms; chunk-nao-carrega so no host (raio de render mexido ao vivo) | profiles-escola/*.json (25), STATUS.md, cerebrum.md | MARCO validado em campo | ~9000 |
| 10:54 | PILOTO FEITO: aplicado com TODAS as turmas + AEE (bom desempenho em sequencia de cores + construcao livre). Resta so o RELATORIO. | STATUS.md, cerebrum.md | entregavel pedagogico cumprido | ~4000 |
| 10:58 | Created relatorio/relatorio-aplicacao.md | — | ~2688 |
| 10:58 | Montou esqueleto do relatorio de aplicacao (entregavel final): estrutura completa + perf/tech pre-preenchidos, campos PREENCHER pro usuario | relatorio/relatorio-aplicacao.md (novo), anatomy.md | esqueleto pronto | ~6000 |
| 10:58 | Session end: 1 writes across 1 files (relatorio-aplicacao.md) | 1 reads | ~4846 tok |
| 13:36 | Session-end prep (/clear): STATUS aponta proxima sessao ao esqueleto do relatorio (sec 2/3 redigivel sem dado de sala) | STATUS.md | pronto pra /clear | ~2500 |

## Session: 2026-07-20 20:34

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 23:59 | Plano v1 terreno procedural: clima 2-noise (não truth table), bioma=pintura sobre heightmap global, 11 blocos novos (4 minérios placeholder, 2 gramas climáticas, bétula/pinheiro, cacto), seed por mundo | .wolf/cerebrum.md | plano entregue, decisões no cerebrum, implementação aguarda ordem | ~9k |
| 21:13 | Edited shared/src/blocks.ts | modified rios() | ~333 |
| 21:13 | Edited shared/src/blocks.ts | inline fix | ~12 |
| 21:13 | Edited shared/src/blocks.ts | modified isTransparentBlock() | ~66 |
| 21:13 | Edited shared/src/mesher.ts | expanded (+20 lines) | ~198 |
| 21:13 | Edited shared/src/mesher.ts | modified veis() | ~342 |
| 21:13 | Edited shared/src/blocks.test.ts | expanded (+7 lines) | ~158 |
| 21:13 | Edited client/src/blocksUi.ts | modified Flores() | ~340 |
| 21:13 | Edited client/src/atlasTexture.ts | added 2 condition(s) | ~732 |
| 21:14 | Edited client/src/atlasTexture.ts | modified flores() | ~524 |
| 21:14 | Created shared/src/biomas.ts | — | ~886 |
| 21:15 | Created shared/src/arvores.ts | — | ~1299 |
| 21:16 | Edited shared/src/worldgen.ts | added 2 import(s) | ~96 |
| 21:16 | Edited shared/src/worldgen.ts | added 9 condition(s) | ~1584 |
| 21:16 | Edited shared/src/index.ts | 2→4 lines | ~30 |
| 21:16 | Edited server/src/index.ts | expanded (+7 lines) | ~131 |
| 21:17 | Edited shared/src/worldgen.test.ts | 11→15 lines | ~118 |
| 21:17 | Edited shared/src/worldgen.test.ts | added 2 condition(s) | ~1318 |
| 21:18 | Edited shared/src/world.test.ts | modified 20() | ~241 |
| 21:18 | Edited shared/src/worldgen.test.ts | modified for() | ~62 |
| 21:20 | Created ../.claude/jobs/a35a297d/tmp/acha-seeds.mts | — | ~462 |
| 21:30 | GEN PROCEDURAL v1 COMPLETO: 13 blocos novos (116-128: 4 minérios placeholder, 2 gramas climáticas, ipê/araucária/pau-brasil, mandacaru), biomas.ts (caatinga/cerrado/mata/araucárias via clima 2-noise), arvores.ts (formas), worldgen v2 (subsolo+minérios em veia+features por bioma), seed aleatória no host Node | shared/{blocks,mesher,biomas,arvores,worldgen,index}.ts, client/{atlasTexture,blocksUi}.ts, server/index.ts, testes | 257 testes, typecheck 3/3, build ok, 4 screenshots headless dos biomas conferem (blend caatinga-cerrado visível). NÃO commitado | ~60k |
| 21:29 | Session end: 20 writes across 12 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 17 reads | ~84180 tok |
| 21:37 | Session end: 20 writes across 12 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 18 reads | ~84180 tok |
| 21:42 | Edited shared/src/worldgen.ts | modified gramaPorClima() | ~101 |
| 21:42 | Edited shared/src/arvores.ts | 10→12 lines | ~177 |
| 21:43 | Created shared/src/arvores.test.ts | — | ~661 |
| 21:43 | Edited shared/src/worldgen.test.ts | expanded (+9 lines) | ~101 |
| 21:45 | Refinos do playtest: neve exige frio (temp<0.6, caatinga sem neve), copa do ipê desce 1 (engloba topo do tronco), todo.md ganha abas de inventário; arvores.test.ts novo (4 espécies, copa envolve tronco) | worldgen.ts, arvores.ts, worldgen.test.ts, arvores.test.ts, todo.md | 261 testes, typecheck 3/3; server de teste reiniciado com mundo novo | ~8k |
| 21:44 | Session end: 24 writes across 13 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 18 reads | ~85220 tok |
| 21:51 | Edited shared/src/worldgen.ts | modified tamanhos() | ~122 |
| 21:52 | Edited shared/src/worldgen.ts | modified heightAt() | ~255 |
| 21:52 | Edited shared/src/worldgen.ts | modified colinas() | ~82 |
| 21:52 | Edited shared/src/worldgen.ts | modified gramaPorClima() | ~130 |
| 21:52 | Edited shared/src/worldgen.ts | modified 40() | ~89 |
| 21:52 | Edited shared/src/worldgen.test.ts | 3→5 lines | ~84 |
| 21:52 | Edited shared/src/worldgen.test.ts | 9→9 lines | ~87 |
| 21:52 | Edited shared/src/worldgen.test.ts | added 1 condition(s) | ~139 |
| 21:53 | Edited shared/src/worldgen.ts | added 1 condition(s) | ~278 |
| 21:54 | Edited shared/src/worldgen.ts | modified for() | ~60 |
| 21:54 | Edited shared/src/worldgen.ts | modified for() | ~82 |
| 21:54 | Edited shared/src/world.test.ts | inline fix | ~19 |
| 22:00 | ALTURA 128 em P/M/G + SERRAS no heightAt (máscara smoothstep x/90, picos ~120, só em mundo sizeY>=128 — mundo 64 de aula/teste mantém colinas, 15 testes de session/claims intactos); SNOW_HEIGHT 28→58, ROCHA_HEIGHT=85 (chapada), carvão teto 72 / ferro 40 (minerar montanha); minério fica exposto em encosta íngreme de graça | worldgen.ts, worldgen.test.ts, world.test.ts | 262 testes, typecheck 3/3, screenshot da serra seed 13 confere; server teste reiniciado | ~15k |
| 21:57 | Session end: 36 writes across 13 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 19 reads | ~86647 tok |
| 22:00 | Edited client/src/main.ts | expanded (+7 lines) | ~62 |
| 22:00 | Edited client/src/main.ts | 3→4 lines | ~48 |
| 22:00 | Edited client/src/main.ts | 2→3 lines | ~54 |
| 22:01 | Edited client/src/main.ts | modified atual() | ~408 |
| 22:10 | F3 ganha linhas de clima pra afinar o gen: bioma/temp/umid/seed + h do terreno + topo previsto + thresholds (praia/neve/chapada); worldSeed vira let (troca de aula atualiza) | client/src/main.ts (hud.extra) | typecheck 3/3, build, server 8080 reiniciado servindo dist novo | ~4k |
| 22:02 | Session end: 40 writes across 14 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 20 reads | ~88390 tok |
| 22:27 | Session end: 40 writes across 14 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 20 reads | ~88390 tok |
| 22:35 | Created client/src/blocksUi.ts | — | ~1751 |
| 22:36 | Edited client/src/inventory.ts | modified categoria() | ~222 |
| 22:36 | Edited client/src/inventory.ts | 3→3 lines | ~54 |
| 22:36 | Edited client/src/inventory.ts | added 1 condition(s) | ~266 |
| 22:36 | Edited client/src/inventory.ts | inline fix | ~13 |
| 22:36 | Edited client/index.html | expanded (+18 lines) | ~164 |
| 22:25 | 3 COMMITS da sessão 10 (e08cf0e blocos, 3a82c3f gen+serras, 0fffc7c hud+dist+wolf; push pendente, 4 à frente). ABAS no inventário: Categoria em blocksUi (fonte única, PlaceableEntry.cat), tab bar no InventoryPanel (filtro de exibição, aba sobrevive abrir/fechar), CSS .inv-abas; hotbar/scroll intocados | client/src/{blocksUi,inventory}.ts, client/index.html | typecheck 3/3, build, screenshot com ?inv confere (5 abas, aluno sem rocha-matriz). Abas NÃO commitadas — aguardando playtest | ~10k |
| 22:38 | Session end: 46 writes across 16 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 23 reads | ~97298 tok |
| 22:42 | Edited client/index.html | modified FIXA() | ~173 |
| 22:42 | Edited client/index.html | 5→9 lines | ~86 |
| 22:40 | Refino das abas: painel de inventário com ALTURA FIXA (560px/84vh, flex column) + rolagem SÓ na grade (flex:1, overflow-y, align-content:start) — trocar de aba não muda o tamanho. Verificado com harness estático de CSS (aba 36 vs aba 4, mesma altura) | client/index.html | build ok, server 8080 reiniciado. Abas ainda NÃO commitadas | ~5k |
| 22:46 | Session end: 48 writes across 16 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 25 reads | ~97702 tok |
| 22:48 | Session end: 48 writes across 16 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 25 reads | ~97702 tok |
| 22:51 | Session end: 48 writes across 16 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 25 reads | ~97702 tok |
| 23:03 | Edited shared/src/world.ts | added 2 condition(s) | ~573 |
| 23:04 | Created shared/src/arvores.ts | — | ~1642 |
| 23:04 | Edited shared/src/worldgen.ts | expanded (+13 lines) | ~124 |
| 23:06 | Edited shared/src/worldgen.ts | inline fix | ~25 |
| 23:06 | Edited shared/src/mesher.ts | 2→3 lines | ~52 |
| 23:07 | Edited shared/src/worldgen.test.ts | modified for() | ~449 |
| 23:07 | Edited shared/src/worldgen.test.ts | 15→16 lines | ~132 |
| 23:10 | STREAMING F1 COMPLETA: World esparso ((Uint8Array|undefined)[], alocarColuna/colunaGerada), arvores.ts refeito puro (celulasDaArvore/aplicarCelula), worldgen por COLUNA DE CHUNKS (gerarColunaDeChunks: terreno + veias re-derivadas 3×3 + árvores margem 2 + flores/mandacaru) com decisões 100% puras (topoPrevisto/arvoreDaColuna); generateWorld = materializa tudo (compat). TESTE de ordem-independência (embaralhado = mesmos bytes) ✓ | shared/src/{world,arvores,worldgen,mesher}.ts, worldgen.test.ts | 264 testes, typecheck 3/3, build ok. NÃO commitado. F2 (protocolo streaming+cliente+configs) é a próxima | ~35k |
| 23:08 | Session end: 55 writes across 17 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 26 reads | ~109257 tok |
| 23:16 | Edited shared/src/protocol.ts | added 1 condition(s) | ~146 |
| 23:16 | Edited shared/src/protocol.ts | modified Streaming() | ~77 |
| 23:17 | Edited shared/src/protocol.ts | added 9 condition(s) | ~1504 |
| 23:17 | Edited shared/src/protocol.ts | inline fix | ~27 |
| 23:19 | Edited shared/src/session.ts | expanded (+8 lines) | ~66 |
| 23:19 | Edited shared/src/session.ts | expanded (+13 lines) | ~68 |
| 23:19 | Edited shared/src/session.ts | modified atividade() | ~106 |
| 23:19 | Edited shared/src/worldgen.ts | modified parseWorldTamanho() | ~331 |
| 23:19 | Edited shared/src/worldgen.ts | added 1 condition(s) | ~177 |
| 23:20 | Edited shared/src/session.ts | added 1 condition(s) | ~337 |
| 23:20 | Edited shared/src/session.ts | modified constructor() | ~316 |
| 23:20 | Edited shared/src/session.ts | added 1 condition(s) | ~190 |
| 23:20 | Edited shared/src/session.ts | modified handleDisconnect() | ~81 |
| 23:21 | Edited shared/src/session.ts | added 1 condition(s) | ~157 |
| 23:21 | Edited shared/src/session.ts | added 1 condition(s) | ~189 |
| 23:21 | Edited shared/src/session.ts | added 8 condition(s) | ~914 |
| 23:22 | Created shared/src/streaming.test.ts | — | ~2041 |
| 23:24 | Edited client/src/settings.ts | modified Streaming() | ~159 |
| 23:24 | Edited client/src/settings.ts | 4→6 lines | ~89 |
| 23:24 | Edited client/src/menu.ts | modified streaming() | ~122 |
| 23:24 | Edited client/index.html | 2→3 lines | ~51 |
| 23:24 | Edited client/src/chunks.ts | modified remesh() | ~114 |
| 23:25 | Edited client/src/chunks.ts | added 4 condition(s) | ~535 |
| 23:25 | Edited client/src/main.ts | modified Streaming() | ~128 |
| 23:25 | Edited client/src/main.ts | added 1 condition(s) | ~193 |
| 23:25 | Edited client/src/main.ts | expanded (+6 lines) | ~149 |
| 23:25 | Edited client/src/main.ts | added 1 condition(s) | ~117 |
| 23:25 | Edited client/src/main.ts | 4→6 lines | ~82 |
| 23:26 | Edited client/src/main.ts | added 4 condition(s) | ~404 |
| 23:26 | Edited client/src/main.ts | 4→5 lines | ~86 |
| 23:26 | Edited client/src/main.ts | 7→10 lines | ~126 |
| 23:26 | Edited client/src/main.ts | 12→12 lines | ~139 |
| 23:26 | Edited client/src/main.ts | added 1 condition(s) | ~108 |
| 23:26 | Edited client/src/main.ts | 13→18 lines | ~84 |
| 23:27 | Edited server/src/index.ts | added 1 condition(s) | ~180 |
| 23:27 | Edited server/src/index.ts | added 1 condition(s) | ~54 |
| 23:27 | Edited server/src/worker.ts | added 1 condition(s) | ~108 |
| 06:45 | Created ../.claude/jobs/a35a297d/tmp/move-smoke.mjs | — | ~493 |
| 00:15 | STREAMING F2 COMPLETA fim-a-fim: protocolo LJE0 (header lazy, dims u16) + LJC0 (lote de colunas) + msg radius; session com motor de interesse por anéis (streamColunas, esquece além raio+2 e re-envia), materialização em applyBlockQuieto; cliente com roteamento por magic, fila de mesh (N/frame), descarte espelhado, física congelada sem chão; configs raioRender+meshPorFrame (menu sliders) e LJ_COLUNAS_TICK (host); tamanho E 3840×3840×128 no menu/env; save bloqueado em E (F3) | protocol.ts, session.ts, worldgen.ts, chunks.ts, main.ts, settings.ts, menu.ts, index.html, server/{index,worker}.ts, streaming.test.ts | 271 testes, typecheck 3/3, build; smoke real: 81 colunas join (9×9 raio 4), +81 longe, +81 re-envio; screenshot mundo E renderizado ✓ | ~55k |
| 06:51 | Edited shared/src/session.ts | 4→8 lines | ~173 |
| 06:52 | Edited shared/src/session.ts | 9→10 lines | ~40 |
| 06:52 | Edited shared/src/session.ts | added 1 condition(s) | ~203 |
| 06:52 | Edited shared/src/session.ts | modified isLazy() | ~102 |
| 06:53 | Edited shared/src/save.ts | added 1 import(s) | ~163 |
| 06:53 | Edited shared/src/save.ts | 2→6 lines | ~111 |
| 06:53 | Edited shared/src/save.ts | modified F3() | ~130 |
| 06:53 | Edited shared/src/save.ts | added 1 condition(s) | ~317 |
| 06:53 | Edited shared/src/save.ts | added 1 condition(s) | ~159 |
| 06:55 | Edited shared/src/save.ts | added 4 condition(s) | ~1727 |
| 06:55 | Edited shared/src/session.ts | added optional chaining | ~306 |
| 06:56 | Edited server/src/index.ts | 4→5 lines | ~23 |
| 06:56 | Edited server/src/index.ts | modified saveNow() | ~137 |
| 06:56 | Edited server/src/index.ts | modified if() | ~67 |
| 06:57 | Edited server/src/worker.ts | 5→6 lines | ~32 |
| 06:57 | Edited server/src/worker.ts | modified if() | ~125 |
| 06:57 | Edited client/src/main.ts | modified persistWorld() | ~108 |
| 06:58 | Created shared/src/save-lazy.test.ts | — | ~1031 |
| 06:59 | Edited shared/src/save.ts | 10→8 lines | ~74 |
| 07:00 | Created ../.claude/jobs/a35a297d/tmp/f3-place.mjs | — | ~370 |
| 07:02 | Created ../.claude/jobs/a35a297d/tmp/f3-verify.mjs | — | ~459 |
| 07:03 | STREAMING F3 (save esparso) COMPLETA: session rastreia editedChunks (marcado em applyBlockQuieto, só lazy); save.ts formato LJS2 (encodeLazySave = header+meta com dims+chunks editados; decodeLazySave → world vazio + editedChunks; readSaveMeta compartilhado denso/lazy); restore regenera coluna + sobrepõe bytes; host/worker/cliente usam save esparso. Plano em .wolf/streaming-plan.md | shared/{session,save,save-lazy.test}.ts, server/{index,worker}.ts, client/main.ts | 274 testes (+3), typecheck 3/3, build; SMOKE REAL: obsidiana 1920,70,1920 no E → save 4341 bytes → restart → volta ✓ | ~40k |
| 07:05 | Edited shared/src/session.ts | expanded (+7 lines) | ~212 |
| 07:06 | Edited shared/src/session.ts | added 3 condition(s) | ~740 |
| 07:06 | Edited shared/src/session.ts | gerarColunaDeChunks() → gerarColuna() | ~46 |
| 07:06 | Edited shared/src/session.ts | gerarColunaDeChunks() → gerarColuna() | ~135 |
| 07:06 | Edited shared/src/session.ts | gerarColunaDeChunks() → gerarColuna() | ~86 |
| 07:06 | Edited shared/src/session.ts | 7→8 lines | ~135 |
| 07:06 | Edited shared/src/session.ts | added 1 condition(s) | ~177 |
| 07:07 | Edited shared/src/streaming.test.ts | added 1 condition(s) | ~1244 |
| 07:09 | STREAMING F4+F5 COMPLETO: F4 = verificação de bordas (areia cai na aresta de coluna — teste; packCoord no E cabe em 2³¹; borda finita esperada). F5 = evictColunas() 1×/s no tick lazy libera colunas sem interesse E sem edição; toda geração via gerarColuna (residentCols); editedCols nunca liberada; regenera idêntica ao voltar. residentColCount exposto | shared/{session,streaming.test}.ts | 278 testes (+4), typecheck 3/3, build. STREAMING F1-F5 FEITO | ~30k |
| 07:11 | Created ../.claude/jobs/a35a297d/tmp/stream-check.mjs | — | ~422 |
| 07:12 | Session end: 123 writes across 30 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 32 reads | ~145069 tok |
| 07:35 | Session end: 123 writes across 30 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 32 reads | ~145069 tok |
| 08:14 | Edited iniciar-servidor.bat | modified Enter() | ~58 |
| 08:14 | Edited iniciar-servidor.bat | 2→3 lines | ~42 |
| 08:14 | Edited iniciar-servidor.bat | modified E() | ~184 |
| 08:15 | Edited iniciar-servidor.bat | modified mundo() | ~184 |
| (sessão 11 cont.) | iniciar-servidor.bat: opção [9] "Criar mundo PROCEDURAL" (nome próprio → mundos/<nome>/, LJ_TAMANHO=E, pula menu de tamanho) + prompt de tamanho ganhou [E] procedural (rótulo do usuário). [8] já reconhecia mundos/<nome>/ (nada a mudar). .sh NÃO tocado (usuário pediu só .bat) | iniciar-servidor.bat | commitado+pushado | ~2k |
| 08:16 | Session end: 127 writes across 31 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 33 reads | ~146994 tok |
| 08:18 | Edited client/index.html | inline fix | ~24 |
| 08:18 | Edited client/src/menu.ts | modified streaming() | ~47 |
| 08:19 | Session end: 129 writes across 31 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 33 reads | ~147197 tok |
| 08:23 | Session end: 129 writes across 31 files (blocks.ts, mesher.ts, blocks.test.ts, blocksUi.ts, atlasTexture.ts) | 33 reads | ~147197 tok |

## Session: 2026-07-20 19:45

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 20:10 | Edited todo.md | 10→11 lines | ~340 |
| 20:10 | Edited todo.md | inline fix | ~71 |
| 20:10 | Edited todo.md | 2→2 lines | ~120 |
| 20:10 | Edited todo.md | inline fix | ~102 |
| 20:10 | atualizar todo.md: marca FEITO 11 itens já entregados (tapete/janela/cama/sofá/cadeira/mesa/quadro/flores + dia-noite/autocomplete-nome/nome-sem-espaço/atalhos-navegador) c/ ids e datas | todo.md | pendentes reais: vidro colorido, sentar/deitar, modelo player, sol quadrado, sobrevivência, geração procedural, anti-griefing claim | ~1k |
| 20:10 | Session end: 4 writes across 1 files (todo.md) | 1 reads | ~1877 tok |
| 20:16 | Edited todo.md | modified es() | ~297 |
| 20:16 | fix todo.md: claim (cp24) É o anti-griefing e já FOI codado 2026-07-17 → marcado FEITO (playtest pendente); decisões pendentes viraram travadas | todo.md | correção do usuário | ~300 |
| 20:17 | Session end: 5 writes across 1 files (todo.md) | 1 reads | ~2195 tok |
| 20:17 | Session end: 5 writes across 1 files (todo.md) | 1 reads | ~2195 tok |
| 20:22 | Edited shared/src/claims.ts | 3→5 lines | ~99 |
| 20:22 | Edited shared/src/claims.ts | modified claimDentroDoLimite() | ~88 |
| 20:22 | Edited shared/src/session.ts | 3→2 lines | ~10 |
| 20:22 | Edited shared/src/session.ts | 4→9 lines | ~148 |
| 20:22 | Edited shared/src/session.ts | 2→2 lines | ~60 |
| 20:22 | Edited shared/src/session.ts | modified for() | ~109 |
| 20:22 | Edited shared/src/claims.test.ts | 5→5 lines | ~115 |
| 20:22 | Edited shared/src/claims.test.ts | added optional chaining | ~319 |
| 20:23 | Edited todo.md | inline fix | ~84 |
| 20:23 | claim vira COLUNA de altura total (0..teto) — mata ilha flutuante/escavação por baixo | shared/claims.ts, shared/session.ts, shared/claims.test.ts, todo.md, STATUS.md | removido MAX_CLAIM_Y, claimDentroDoLimite só XZ, criar força min.y=0/max.y=sizeY-1, restore sobe saves antigos; 250 testes (+1), typecheck 3/3, build ok | ~4k |
| 20:24 | Session end: 14 writes across 4 files (todo.md, claims.ts, session.ts, claims.test.ts) | 4 reads | ~40077 tok |
| 20:29 | Edited package.json | 3→4 lines | ~26 |
| 20:30 | Edited tsconfig.base.json | 1→2 lines | ~19 |
| 20:30 | Created shared/src/version.ts | — | ~135 |
| 20:32 | versão sai do package.json (import JSON tree-shaken) + resolveJsonModule; bump via npm version; 0.6.0->0.7.0 | shared/src/version.ts, package.json, tsconfig.base.json | typecheck 3/3, 250 testes, build+boot ok (server loga v0.7.0) | ~3k |
| 20:34 | Session end: 17 writes across 7 files (todo.md, claims.ts, session.ts, claims.test.ts, package.json) | 5 reads | ~40347 tok |
| 20:34 | Session end: 17 writes across 7 files (todo.md, claims.ts, session.ts, claims.test.ts, package.json) | 5 reads | ~40347 tok |

## Session: 2026-07-20 18:36

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 18:41 | Edited shared/src/mesher.ts | 6→8 lines | ~30 |
| 18:42 | Edited shared/src/mesher.ts | added 1 condition(s) | ~536 |
| 18:42 | Edited shared/src/mesher.ts | modified flores() | ~157 |
| 18:42 | Edited shared/src/mesher.ts | added 13 condition(s) | ~545 |
| 18:42 | Edited client/src/main.ts | 4→5 lines | ~27 |
| 18:42 | Edited client/src/main.ts | 5→7 lines | ~101 |
| 18:42 | Edited client/src/main.ts | modified if() | ~143 |
| 18:43 | Edited shared/src/cp23.test.ts | expanded (+9 lines) | ~190 |
| 18:43 | Edited shared/src/cp23.test.ts | inline fix | ~16 |
| 18:43 | Edited shared/src/cp23.test.ts | expanded (+23 lines) | ~452 |
| 18:45 | Created ../.claude/jobs/a35a297d/tmp/flor-stage.mts | — | ~513 |
| 22:20 | SESSÃO 8 — FLOR refeita (cruz diagonal 45°, estilo Minecraft) | shared/src/mesher.ts (emitCrossPlane), flor-stage screenshot | flor com textura bugada → 2 lâminas planas na diagonal, 2 lados; bug-375 | ~600 |
| 22:20 | HITBOX segue a forma (contorno da mira) | shared/src/mesher.ts (blockSelectionBox), client/src/main.ts (highlight reescala/reposiciona) | não-cubos: caixa que envolve a forma (flor/tapete/tocha/porta/janela/quadro/móveis) | ~400 |
| 22:20 | Testes: +3 em cp23.test (flor 48 floats, blockSelectionBox cubo/flor/tapete/porta) | shared/src/cp23.test.ts | 249 testes, typecheck 3/3, build ok | ~150 |
| 18:48 | Session end: 11 writes across 4 files (mesher.ts, main.ts, cp23.test.ts, flor-stage.mts) | 8 reads | ~40329 tok |
| 19:45 | Session end: 11 writes across 4 files (mesher.ts, main.ts, cp23.test.ts, flor-stage.mts) | 8 reads | ~40329 tok |

## Session: 2026-07-20 15:48

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 16:01 | Edited shared/src/blocks.ts | expanded (+11 lines) | ~261 |
| 16:01 | Edited shared/src/blocks.ts | modified isPorta() | ~628 |
| 16:01 | Edited shared/src/blocks.ts | modified isFullCube() | ~92 |
| 16:01 | Edited shared/src/blocks.ts | 11→10 lines | ~76 |
| 16:01 | Edited shared/src/blocks.ts | modified isPlaceable() | ~89 |
| 16:02 | Edited shared/src/mesher.ts | 6→9 lines | ~39 |
| 16:02 | Edited shared/src/mesher.ts | added 2 condition(s) | ~421 |
| 16:02 | Edited shared/src/mesher.ts | expanded (+7 lines) | ~181 |
| 16:02 | Edited shared/src/rules.ts | modified R() | ~118 |
| 16:02 | Edited shared/src/session.ts | 8→11 lines | ~51 |
| 16:03 | Edited shared/src/session.ts | modified lulas() | ~215 |
| 16:04 | Edited shared/src/session.ts | added 2 condition(s) | ~586 |
| 16:04 | Edited shared/src/blocks.test.ts | modified flores() | ~230 |
| 16:06 | Edited shared/src/cp23.test.ts | 8→12 lines | ~51 |
| 16:06 | Edited shared/src/cp23.test.ts | added 1 condition(s) | ~1584 |
| 16:08 | Created ../.claude/jobs/a35a297d/tmp/porta-stage.mts | — | ~541 |
| 16:11 | Edited todo.md | 4→7 lines | ~199 |

## Sessão 7 (2026-07-20) — pivô/dobradiça da porta
Backlog "pivô da porta" FEITO. 4 ids R (108-111, dobradiça alta) espelham as portas base;
servidor escolhe a dobradiça no place_block (porta vizinha do mesmo eixo → oposta = porta
dupla; senão lado com parede/cubo cheio; empate → base). Cliente inalterado (manda só o eixo);
só o mesher muda a folha ABERTA de lado. Files: shared/src/blocks.ts, mesher.ts, rules.ts,
session.ts (+escolherDobradica), cp23.test.ts (+8), blocks.test.ts. 241 testes, typecheck 3/3,
build ok, screenshot da porta dupla confere. NÃO commitado.
| 16:13 | Session end: 17 writes across 8 files (blocks.ts, mesher.ts, rules.ts, session.ts, blocks.test.ts) | 10 reads | ~69831 tok |
| 16:35 | Edited shared/src/blocks.ts | expanded (+9 lines) | ~215 |
| 16:35 | Edited shared/src/blocks.ts | modified isJanela() | ~666 |
| 16:36 | Edited shared/src/blocks.ts | 10→9 lines | ~71 |
| 16:36 | Edited shared/src/blocks.ts | 3→3 lines | ~68 |
| 16:36 | Edited shared/src/mesher.ts | 9→12 lines | ~54 |
| 16:36 | Edited shared/src/mesher.ts | added 2 condition(s) | ~292 |
| 16:36 | Edited shared/src/mesher.ts | 4→9 lines | ~137 |
| 16:36 | Edited shared/src/session.ts | 11→15 lines | ~70 |
| 16:37 | Edited shared/src/session.ts | added 1 condition(s) | ~599 |
| 16:37 | Edited shared/src/session.ts | added 1 condition(s) | ~239 |
| 16:37 | Edited shared/src/blocks.test.ts | modified R() | ~280 |
| 16:37 | Edited shared/src/cp23.test.ts | 12→17 lines | ~74 |
| 16:38 | Edited shared/src/cp23.test.ts | added 1 condition(s) | ~1160 |
| 16:39 | Created ../.claude/jobs/a35a297d/tmp/janela-stage.mts | — | ~450 |
| 16:40 | Edited todo.md | 3→7 lines | ~136 |

## Sessão 7b (2026-07-20) — pivô da janela + commit da porta
Porta commitada+pushada (ab3e87d). Depois: JANELA ganhou a mesma dobradiça — 4 ids R (112-115),
helpers espelho, `escolherDobradica` generalizado (alturas + predicados da família; porta e
janela compartilham). Branch de janela no place_block (1 célula). Mesher da janela reescrito.
Cliente inalterado. 246 testes, typecheck 3/3, build ok, screenshot da janela dupla confere.
Files: blocks.ts, mesher.ts, session.ts, blocks.test.ts, cp23.test.ts. Commitar+pushar janela.
| 16:41 | Session end: 32 writes across 9 files (blocks.ts, mesher.ts, rules.ts, session.ts, blocks.test.ts) | 11 reads | ~78296 tok |
| 18:33 | Session end: 32 writes across 9 files (blocks.ts, mesher.ts, rules.ts, session.ts, blocks.test.ts) | 11 reads | ~78296 tok |

## Session: 2026-07-20 09:39

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 11:10 | Edited todo.md | 2→6 lines | ~96 |
| 11:10 | Edited todo.md | 2→6 lines | ~126 |
| 11:12 | Created shared/src/version.ts | — | ~76 |
| 11:12 | Edited shared/src/index.ts | 2→3 lines | ~22 |
| 11:12 | Edited server/src/index.ts | 11→12 lines | ~59 |
| 11:12 | Edited server/src/index.ts | 2→3 lines | ~63 |
| 11:12 | Edited client/index.html | 2→3 lines | ~38 |
| 11:12 | Edited client/index.html | expanded (+8 lines) | ~74 |
| 11:12 | Edited client/src/menu.ts | 7→8 lines | ~41 |
| 11:12 | Edited client/src/menu.ts | 2→3 lines | ~34 |
| 11:15 | versão: shared/src/version.ts (VERSION) + boot server loga + badge no menu cliente | version.ts, shared/index.ts, server/index.ts, client/index.html, menu.ts | typecheck 3/3, build, 230 testes | ~9k |
| 11:15 | todo.md +2: log do chat em arquivo; salvar mundo em pastas (muda export single) | todo.md | done | ~1k |
| 11:16 | Session end: 10 writes across 5 files (todo.md, version.ts, index.ts, index.html, menu.ts) | 5 reads | ~15434 tok |
| 11:17 | Session end: 10 writes across 5 files (todo.md, version.ts, index.ts, index.html, menu.ts) | 5 reads | ~15434 tok |
| 11:24 | Edited server/src/paths.ts | 4→5 lines | ~95 |
| 11:24 | Edited server/src/index.ts | 8→9 lines | ~129 |
| 11:24 | Edited server/src/mundos.ts | inline fix | ~24 |
| 11:24 | Edited server/src/mundos.ts | 2→2 lines | ~47 |
| 11:25 | Edited server/src/paths.ts | 4→4 lines | ~67 |
| 11:25 | Edited server/src/paths.ts | inline fix | ~25 |
| 11:26 | Edited iniciar-servidor.sh | modified Enter() | ~544 |
| 11:27 | Edited iniciar-servidor.bat | modified Enter() | ~332 |
| 11:27 | Edited iniciar-servidor.bat | modified salvo() | ~184 |
| 11:28 | Edited server/src/cenarios/_smoke-kicar.mjs | inline fix | ~24 |
| 11:28 | Edited .gitignore | 3→8 lines | ~55 |
| 11:35 | pasta aulas/ -> mundos/ (PASTA_MUNDOS); mundo livre salva em mundos/mundo-livre.ljw | paths.ts, index.ts, mundos.ts, .gitignore | typecheck ok, boot smoke: save em mundos/ ✓ | ~7k |
| 11:35 | launcher opcao [8] carregar mundo salvo + migra world.ljw antigo | iniciar-servidor.sh, .bat | bash -n ok, listagem simulada ✓ | ~3k |
| 11:35 | Session end: 21 writes across 11 files (todo.md, version.ts, index.ts, index.html, menu.ts) | 9 reads | ~20971 tok |
| 11:38 | Session end: 21 writes across 11 files (todo.md, version.ts, index.ts, index.html, menu.ts) | 9 reads | ~20971 tok |
| 11:50 | Edited server/src/paths.ts | modified mundoDeTrabalho() | ~515 |
| 11:50 | Edited server/src/mundos.ts | 4→4 lines | ~75 |
| 11:51 | Edited server/src/mundos.ts | added 2 condition(s) | ~227 |
| 11:51 | Edited server/src/mundos.ts | modified acharMundo() | ~80 |
| 11:51 | Edited server/src/mundos.ts | modified aula() | ~94 |
| 11:51 | Edited server/src/mundos.ts | inline fix | ~12 |
| 11:51 | Edited server/src/mundos.ts | inline fix | ~12 |
| 11:51 | Edited server/src/mundos.ts | inline fix | ~23 |
| 11:51 | Edited server/src/mundos.ts | inline fix | ~22 |
| 11:51 | Edited server/src/index.ts | inline fix | ~30 |
| 11:52 | Edited server/src/index.ts | 5→6 lines | ~48 |
| 11:52 | Edited server/src/index.ts | added 1 condition(s) | ~69 |
| 11:52 | Edited server/src/index.ts | added error handling | ~466 |
| 11:52 | Edited server/src/index.ts | modified if() | ~44 |
| 11:53 | Edited iniciar-servidor.sh | expanded (+10 lines) | ~223 |
| 11:53 | Edited iniciar-servidor.sh | modified salvo() | ~246 |
| 11:53 | Edited iniciar-servidor.bat | expanded (+10 lines) | ~217 |
| 11:53 | Edited iniciar-servidor.bat | 2→2 lines | ~30 |
| 11:53 | Edited iniciar-servidor.bat | modified salvo() | ~162 |
| 11:54 | Created ../.claude/jobs/a35a297d/tmp/chatsmoke.mjs | — | ~175 |
| 13:19 | Edited todo.md | grava() → host() | ~94 |
| 13:19 | Edited todo.md | 4→5 lines | ~118 |
| 14:23 | mundo = pasta mundos/<nome>/ com <nome>.ljw + chat.log; helpers em paths.ts | paths.ts, mundos.ts, index.ts | typecheck ok, smoke: chat.log + save na pasta ✓ | ~10k |
| 14:23 | log de chat: registrarChat engancha entregar, dedup broadcast; launcher migra+lista pastas | index.ts, iniciar-servidor.sh/.bat | smoke real: welcome+chat gravados ✓ | ~5k |
| 14:23 | Session end: 43 writes across 12 files (todo.md, version.ts, index.ts, index.html, menu.ts) | 9 reads | ~24045 tok |
| 14:27 | Edited shared/src/claims.ts | 2→3 lines | ~40 |
| 14:27 | Edited shared/src/claims.ts | modified claimDentroDoLimite() | ~78 |
| 14:27 | Edited shared/src/session.ts | 1→2 lines | ~9 |
| 14:27 | Edited shared/src/session.ts | "A área é grande demais (m" → "A área é grande demais (m" | ~48 |
| 14:27 | Edited shared/src/claims.test.ts | 4→5 lines | ~110 |
| 14:27 | Edited shared/src/claims.test.ts | modified mundoComTurma() | ~45 |
| 14:27 | Edited shared/src/claims.test.ts | 17→18 lines | ~253 |
| 14:30 | limite de claim 16^3 -> 32x32x64 (MAX_CLAIM_XZ=32, MAX_CLAIM_Y=64) | claims.ts, session.ts, claims.test.ts | typecheck ok, 230 testes | ~3k |
| 14:31 | Session end: 50 writes across 15 files (todo.md, version.ts, index.ts, index.html, menu.ts) | 12 reads | ~60159 tok |
| 14:37 | Edited todo.md | 1→3 lines | ~88 |
| 14:39 | Edited shared/src/blocks.ts | modified isCama() | ~194 |
| 14:39 | Edited shared/src/rules.ts | inline fix | ~18 |
| 14:39 | Edited shared/src/rules.ts | added 2 condition(s) | ~200 |
| 14:40 | Edited shared/src/rules.ts | modified Tapetes() | ~106 |
| 14:40 | Edited shared/src/session.ts | 13→15 lines | ~63 |
| 14:40 | Edited shared/src/session.ts | added 4 condition(s) | ~578 |
| 14:40 | Edited shared/src/mesher.ts | 11→12 lines | ~45 |
| 14:41 | Edited shared/src/mesher.ts | added 1 condition(s) | ~832 |
| 14:42 | Edited shared/src/cp23.test.ts | expanded (+28 lines) | ~395 |
| 14:57 | cama = par horizontal de 2 células (pé+cabeceira) orientado por yaw; regra de órfão | blocks.ts, rules.ts, session.ts, mesher.ts, cp23.test.ts | typecheck ok, 232 testes, mesh smoke ✓ | ~11k |
| 14:57 | todo: porta escolhe pivô pelo lado com bloco; 2 portas lado a lado = pivôs opostos | todo.md | anotado | ~0.5k |
| 15:00 | Edited shared/src/session.ts | added 1 condition(s) | ~442 |
| 15:00 | Edited shared/src/tp.test.ts | 8→8 lines | ~128 |
| 15:03 | Edited shared/src/blocks.ts | modified decorativas() | ~83 |
| 15:03 | Edited shared/src/blocks.ts | modified isFlor() | ~79 |
| 15:03 | Edited shared/src/blocks.ts | modified precisaApoio() | ~33 |
| 15:03 | Edited shared/src/blocks.ts | 6→7 lines | ~30 |
| 15:04 | Edited shared/src/blocks.ts | 5→6 lines | ~27 |
| 15:04 | Edited shared/src/mesher.ts | expanded (+6 lines) | ~98 |
| 15:04 | Edited shared/src/mesher.ts | 12→13 lines | ~48 |
| 15:04 | Edited shared/src/mesher.ts | modified for() | ~145 |
| 15:04 | Edited shared/src/mesher.ts | added 1 condition(s) | ~206 |
| 15:04 | Edited shared/src/rules.ts | modified Cama() | ~108 |
| 15:05 | Edited client/src/atlasTexture.ts | modified paintFlor() | ~302 |
| 15:05 | Edited client/src/atlasTexture.ts | modified flores() | ~90 |
| 15:05 | Edited client/src/blocksUi.ts | modified Flores() | ~123 |
| 15:06 | Edited shared/src/blocks.test.ts | modified flores() | ~156 |
| 15:07 | Edited shared/src/cp23.test.ts | modified ar() | ~271 |
| 15:08 | flores (ids 104-107, 4 cores): cruz de 2 lâminas + tile cutout, apoio+regra da tocha | blocks.ts, mesher.ts, atlasTexture.ts, rules.ts, blocksUi.ts | typecheck ok, 233 testes, mesh ✓ | ~10k |
| 15:08 | FIX bug-359: /tp ~ usava coord do alvo, agora usa a do autor (professor) | session.ts, tp.test.ts | 9/9 tp, buglog | ~3k |
| 15:08 | Session end: 77 writes across 23 files (todo.md, version.ts, index.ts, index.html, menu.ts) | 21 reads | ~101148 tok |
| 15:47 | Session end: 77 writes across 23 files (todo.md, version.ts, index.ts, index.html, menu.ts) | 21 reads | ~101148 tok |

## Session: 2026-07-20 09:21

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 09:28 | Edited shared/src/protocol.ts | modified Profiler() | ~289 |
| 09:28 | Edited shared/src/protocol.ts | added 2 condition(s) | ~213 |
| 09:28 | Edited server/src/paths.ts | modified profiler() | ~84 |
| 09:28 | Edited .gitignore | 2→3 lines | ~11 |
| 09:28 | Edited server/src/index.ts | 18→19 lines | ~180 |
| 09:28 | Edited server/src/index.ts | added 2 condition(s) | ~324 |
| 09:28 | Edited server/src/index.ts | added 1 condition(s) | ~84 |
| 09:28 | Edited client/src/hud.ts | modified stats() | ~27 |
| 09:28 | Edited client/index.html | 2→3 lines | ~40 |
| 09:29 | Edited client/src/main.ts | added optional chaining | ~150 |
| 09:29 | Edited shared/src/protocol.test.ts | 8→9 lines | ~52 |
| 09:29 | Edited shared/src/protocol.test.ts | expanded (+19 lines) | ~402 |
| 09:32 | Edited todo.md | 2→7 lines | ~166 |
| 09:33 | Session end: 13 writes across 9 files (protocol.ts, paths.ts, .gitignore, index.ts, hud.ts) | 9 reads | ~63948 tok |
| 09:35 | Session end: 13 writes across 9 files (protocol.ts, paths.ts, .gitignore, index.ts, hud.ts) | 9 reads | ~63948 tok |

## Session: 2026-07-20 09:14

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 09:17 | Edited client/src/main.ts | 4→5 lines | ~67 |
| — | Playtest confirmado: mundo G renderiza+carrega em notebooks e tablets da escola | — | ✅ | — |
| — | bug-333: quadro fantasma na troca de mundo — reloadWorld esquecia quadroRenderer.setAll([]) | client/src/main.ts | fixed, typecheck 3/3 | ~400 |
| — | Rename ideias.md → todo.md (pedido do usuário) | ideias.md, .wolf/anatomy.md | done | ~150 |
| 09:20 | Session end: 1 writes across 1 files (main.ts) | 3 reads | ~17826 tok |
| 09:21 | Session end: 1 writes across 1 files (main.ts) | 3 reads | ~17826 tok |

## Session: 2026-07-20 09:13

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-20 09:13

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-20 07:13

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 08:50 | Created ../.claude/plans/zesty-kindling-lighthouse.md | — | ~640 |
| 08:58 | Edited client/src/main.ts | modified toque() | ~472 |
| 08:58 | Edited client/src/touch.ts | modified inventario() | ~20 |
| 08:58 | Edited client/src/touch.ts | 3→4 lines | ~57 |
| 08:58 | botão HUD/F3 nos controles de toque (touch.ts topo + main.ts) | client/src/touch.ts, client/src/main.ts | typecheck 3/3 ok | ~1.2k |
| 08:58 | Session end: 4 writes across 3 files (zesty-kindling-lighthouse.md, main.ts, touch.ts) | 2 reads | ~17791 tok |
| 09:01 | Created ideias para fazer.md | — | ~548 |
| 09:01 | Session end: 5 writes across 4 files (zesty-kindling-lighthouse.md, main.ts, touch.ts, ideias para fazer.md) | 4 reads | ~18834 tok |
| 09:08 | Edited ideias.md | expanded (+24 lines) | ~273 |
| 09:08 | Session end: 6 writes across 5 files (zesty-kindling-lighthouse.md, main.ts, touch.ts, ideias para fazer.md, ideias.md) | 5 reads | ~19126 tok |
| 09:12 | Sessão 4 fechada: botão HUD/F3 no touch + backlog migrado pra ideias.md (rm .txt) | client/src/touch.ts, client/src/main.ts, ideias.md, .wolf/STATUS.md, .wolf/anatomy.md | typecheck 3/3, sem playtest ainda | ~2k |
| 09:12 | Session end: 6 writes across 5 files (zesty-kindling-lighthouse.md, main.ts, touch.ts, ideias para fazer.md, ideias.md) | 5 reads | ~19126 tok |

## Session: 2026-07-20 00:19

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-19 14:35

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 18:14 | Created client/src/shortcutGuard.ts | — | ~995 |
| 18:15 | Edited client/src/main.ts | added 1 import(s) | ~51 |
| 18:15 | Edited client/src/main.ts | 3→4 lines | ~56 |
| 18:15 | Edited client/src/main.ts | 3→4 lines | ~50 |
| 18:15 | Edited client/src/main.ts | 4→5 lines | ~80 |
| 18:15 | Edited client/src/main.ts | modified startGame() | ~74 |
| 18:15 | guarda de atalhos do navegador: beforeunload + preventDefault combos + Keyboard Lock (Ctrl+W ao correr não fecha aba) | client/src/shortcutGuard.ts, main.ts | 212 testes, typecheck 3/3, build+dist | ~8k |
| 18:21 | Edited shared/src/constants.ts | modified noite() | ~74 |
| 18:21 | Edited shared/src/session.ts | 4→5 lines | ~75 |
| 18:21 | Edited shared/src/session.ts | modified runHora() | ~139 |
| 18:22 | Created client/src/daynight.ts | — | ~2281 |
| 18:22 | Edited client/src/main.ts | inline fix | ~17 |
| 18:23 | Edited client/src/main.ts | added 1 condition(s) | ~62 |
| 18:23 | Edited client/src/main.ts | added 1 condition(s) | ~125 |
| 18:24 | Edited client/src/main.ts | added 1 condition(s) | ~78 |
| 18:25 | Edited client/src/main.ts | 4→1 lines | ~18 |
| 18:25 | Edited client/src/main.ts | added 1 condition(s) | ~74 |
| 18:27 | dia/noite: sol/lua/estrelas visíveis + keyframes ricos c/ smoothstep + DIA_SEGUNDOS 1200 + /hora consulta liberada + ?hora/?yaw debug | daynight.ts, main.ts, constants.ts, session.ts | 212 testes, screenshots noite/entardecer/sol ✅ | ~15k |
| 18:28 | Edited shared/src/blocks.ts | modified Decorativa() | ~201 |
| 18:28 | Edited shared/src/blocks.ts | modified isTapete() | ~141 |
| 18:28 | Edited shared/src/blocks.ts | modified isFullCube() | ~45 |
| 18:28 | Edited shared/src/blocks.ts | modified isSolidBlock() | ~61 |
| 18:29 | Edited shared/src/rules.ts | modified Tapetes() | ~149 |
| 18:29 | Edited shared/src/session.ts | 6→6 lines | ~65 |
| 18:29 | Edited shared/src/session.ts | 4→5 lines | ~25 |
| 18:29 | Edited shared/src/mesher.ts | inline fix | ~22 |
| 18:29 | Edited shared/src/mesher.ts | modified for() | ~243 |
| 18:29 | Edited shared/src/mesher.ts | added 1 condition(s) | ~121 |
| 18:29 | Edited client/src/blocksUi.ts | modified Tapetes() | ~121 |
| 18:29 | Edited shared/src/rules.test.ts | 4→4 lines | ~66 |
| 18:30 | Edited shared/src/rules.test.ts | modified it() | ~278 |
| 18:30 | Edited shared/src/blocks.test.ts | modified tapetes() | ~126 |
| 18:31 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/d5fb946a-7df1-4f81-8d6e-b29e8b26f43a/scratchpad/tapetes.mts | — | ~711 |
| 18:31 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/d5fb946a-7df1-4f81-8d6e-b29e8b26f43a/scratchpad/tapetes.mts | "./shared/src/index" → "/home/meketreve/logica-em" | ~36 |
| 18:31 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/d5fb946a-7df1-4f81-8d6e-b29e8b26f43a/scratchpad/tapetes.mts | inline fix | ~12 |
| 18:33 | Edited client/src/main.ts | added 1 condition(s) | ~146 |
| 18:33 | Edited client/src/main.ts | 3→3 lines | ~65 |
| 18:38 | tapetes 12 cores (ids 71-82): lâmina 1/16, atravessável, regra de apoio da tocha; + fix Number(null)=0 no ?hora (bug-302) | blocks.ts, rules.ts, mesher.ts, session.ts, blocksUi.ts, main.ts | 213 testes, smoke 12/12 + evaporação ✅, screenshot ✅ | ~12k |
| 18:40 | Edited shared/src/blocks.ts | modified Janela() | ~153 |
| 18:40 | Edited shared/src/blocks.ts | inline fix | ~13 |
| 18:40 | Edited shared/src/blocks.ts | modified portaToggled() | ~344 |
| 18:40 | Edited shared/src/blocks.ts | modified isFullCube() | ~53 |
| 18:40 | Edited shared/src/blocks.ts | modified isSolidBlock() | ~81 |
| 18:40 | Edited shared/src/blocks.ts | added 1 condition(s) | ~129 |
| 18:40 | Edited shared/src/session.ts | modified janela() | ~212 |
| 18:40 | Edited shared/src/session.ts | 5→6 lines | ~31 |
| 18:40 | Edited shared/src/mesher.ts | 6→8 lines | ~63 |
| 18:40 | Edited shared/src/mesher.ts | 4→8 lines | ~98 |
| 18:41 | Edited shared/src/mesher.ts | added 1 condition(s) | ~178 |
| 18:41 | Edited client/src/atlasTexture.ts | 5→7 lines | ~70 |
| 18:41 | Edited client/src/atlasTexture.ts | modified paintJanela() | ~256 |
| 18:41 | Edited client/src/main.ts | 3→3 lines | ~65 |
| 18:41 | Edited client/src/main.ts | added 1 condition(s) | ~175 |
| 18:41 | Edited client/src/main.ts | added 1 condition(s) | ~66 |
| 18:41 | Edited client/src/blocksUi.ts | modified olhar() | ~70 |
| 18:41 | Edited client/src/main.ts | 3→5 lines | ~21 |
| 18:41 | Edited shared/src/blocks.test.ts | modified tapetes() | ~160 |
| 19:38 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/d5fb946a-7df1-4f81-8d6e-b29e8b26f43a/scratchpad/janela.mts | — | ~587 |
| 19:40 | janela abre-fecha (ids 83-86): 1 célula, dobradiça da porta, isInterativo/interativoToggled generalizam use_block | blocks.ts, session.ts, mesher.ts, atlasTexture.ts, main.ts, blocksUi.ts | 216 testes, stage+screenshot ✅ | ~10k |
| 19:41 | Edited shared/src/blocks.ts | modified Janela() | ~250 |
| 19:41 | Edited shared/src/blocks.ts | modified isCadeira() | ~202 |
| 19:41 | Edited shared/src/blocks.ts | modified isFullCube() | ~59 |
| 19:42 | Edited shared/src/mesher.ts | 3→7 lines | ~68 |
| 19:42 | Edited shared/src/mesher.ts | expanded (+9 lines) | ~38 |
| 19:42 | Edited shared/src/mesher.ts | modified veis() | ~178 |
| 19:42 | Edited shared/src/mesher.ts | added 1 condition(s) | ~833 |
| 19:42 | Edited shared/src/mesher.ts | modified rotXZ() | ~152 |
| 19:42 | Edited client/src/atlasTexture.ts | modified paintEstofado() | ~253 |
| 19:42 | Edited client/src/atlasTexture.ts | 2→4 lines | ~40 |
| 19:43 | Edited client/src/blocksUi.ts | modified olhar() | ~103 |
| 19:43 | Edited client/src/main.ts | added 1 condition(s) | ~258 |
| 19:43 | Edited client/src/main.ts | added 3 condition(s) | ~106 |
| 19:43 | Edited client/src/main.ts | 5→8 lines | ~30 |
| 19:43 | Edited shared/src/blocks.test.ts | modified veis() | ~128 |
| 20:08 | Edited shared/src/session.test.ts | 3→3 lines | ~36 |
| 20:08 | Edited shared/src/session.test.ts | "/bloco 5 5 5 99" → "/bloco 5 5 5 200" | ~16 |
| 20:09 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/d5fb946a-7df1-4f81-8d6e-b29e8b26f43a/scratchpad/moveis.mts | — | ~499 |
| 20:26 | móveis decorativos (ids 87-99): mesa + cadeira/sofá/cama em 4 direções (rotXZ 90°, forma escrita 1× de frente pra +x); direção pelo olhar no place | blocks.ts, mesher.ts, atlasTexture.ts, main.ts, blocksUi.ts | 218 testes, stage+screenshot ✅ | ~12k |
| 20:29 | Created shared/src/quadros.ts | — | ~540 |
| 20:29 | Edited shared/src/index.ts | 1→2 lines | ~16 |
| 20:29 | Edited shared/src/blocks.ts | modified Quadro() | ~134 |
| 20:29 | Edited shared/src/blocks.ts | modified isQuadro() | ~53 |
| 20:29 | Edited shared/src/blocks.ts | 5→6 lines | ~25 |
| 20:29 | Edited shared/src/blocks.ts | 4→5 lines | ~21 |
| 20:29 | Edited shared/src/protocol.ts | modified Quadro() | ~120 |
| 20:29 | Edited shared/src/protocol.ts | added 1 condition(s) | ~74 |
| 20:30 | Edited shared/src/protocol.ts | modified Quadro() | ~228 |
| 20:30 | Edited shared/src/protocol.ts | added 3 condition(s) | ~186 |
| 20:30 | Edited shared/src/protocol.ts | added 1 import(s) | ~35 |
| 20:30 | Edited shared/src/session.ts | added 1 condition(s) | ~129 |
| 20:30 | Edited shared/src/session.ts | modified quadros() | ~81 |
| 20:30 | Edited shared/src/session.ts | modified Confinamento() | ~161 |
| 20:30 | Edited shared/src/session.ts | added 1 condition(s) | ~97 |
| 20:31 | Edited shared/src/session.ts | added 6 condition(s) | ~425 |
| 20:31 | Edited shared/src/session.ts | added 1 condition(s) | ~104 |
| 20:31 | Edited shared/src/session.ts | added 1 import(s) | ~56 |
| 20:31 | Edited shared/src/save.ts | modified Quadros() | ~62 |
| 20:31 | Edited shared/src/save.ts | added 2 condition(s) | ~133 |
| 20:31 | Edited shared/src/save.ts | 2→3 lines | ~51 |
| 20:31 | Edited shared/src/save.ts | added 1 import(s) | ~45 |
| 20:31 | Edited shared/src/mesher.ts | 5→8 lines | ~80 |
| 20:31 | Edited shared/src/mesher.ts | modified for() | ~92 |
| 20:31 | Edited shared/src/mesher.ts | added 1 condition(s) | ~212 |
| 20:31 | Edited shared/src/mesher.ts | 10→11 lines | ~41 |
| 20:31 | Edited client/src/atlasTexture.ts | 4→5 lines | ~52 |
| 20:31 | Edited client/src/atlasTexture.ts | modified paintQuadro() | ~170 |
| 20:32 | Created client/src/quadros.ts | — | ~3156 |
| 20:33 | Edited client/src/main.ts | modified Quadros() | ~97 |
| 20:33 | Edited client/src/main.ts | added 2 condition(s) | ~143 |
| 20:33 | Edited client/src/main.ts | 2→4 lines | ~18 |
| 20:33 | Edited client/src/main.ts | added 1 import(s) | ~40 |
| 20:33 | Edited client/src/main.ts | modified quadros() | ~137 |
| 20:33 | Edited client/src/main.ts | 4→5 lines | ~80 |
| 20:33 | Edited client/src/main.ts | 2→3 lines | ~48 |
| 20:33 | Edited client/src/main.ts | added 2 condition(s) | ~252 |
| 20:33 | Edited client/src/main.ts | 14→16 lines | ~213 |
| 20:33 | Edited client/src/main.ts | added 1 condition(s) | ~50 |
| 20:33 | Edited client/src/blocksUi.ts | 4→5 lines | ~60 |
| 20:34 | Created shared/src/quadros.test.ts | — | ~1603 |
| 20:34 | Edited shared/src/blocks.test.ts | modified veis() | ~154 |
| 20:35 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/d5fb946a-7df1-4f81-8d6e-b29e8b26f43a/scratchpad/quadro.mts | — | ~642 |
| 20:41 | quadro texto+imagem (ids 100-103): 1º estado FORA do id — quadros.ts (shared+client), quadro_set/quadro_changed/quadros no protocolo, Map na session, persiste no meta, editor HTML sem popup, imagem comprimida a data URL ≤32k | quadros.ts ×2, protocol, session, save, mesher, atlas, main, blocksUi | 225 testes, stage 2 quadros + screenshot ✅ | ~25k |
| 21:04 | fecho de sessão: STATUS.md + cerebrum + push — backlog 100% (atalhos, dia/noite, tapetes, janela, móveis, quadro) | .wolf/* | 225 testes, 5 commits | ~4k |
| 21:05 | Session end: 116 writes across 22 files (shortcutGuard.ts, main.ts, constants.ts, session.ts, daynight.ts) | 27 reads | ~107032 tok |
| 22:00 | Edited shared/src/worldgen.ts | modified parseWorldPreset() | ~314 |
| 22:00 | Edited client/index.html | expanded (+7 lines) | ~179 |
| 22:00 | Edited client/src/menu.ts | modified NOVO() | ~57 |
| 22:00 | Edited client/src/menu.ts | 7→8 lines | ~70 |
| 22:01 | Edited client/src/menu.ts | expanded (+6 lines) | ~38 |
| 22:01 | Edited client/src/connection.ts | modified init() | ~122 |
| 22:01 | Edited client/src/main.ts | 3→8 lines | ~74 |
| 22:01 | Edited server/src/worker.ts | modified startSession() | ~226 |
| 22:01 | Edited server/src/worker.ts | modified if() | ~168 |
| 22:01 | Edited server/src/worker.ts | 9→12 lines | ~61 |
| 22:01 | Edited server/src/index.ts | modified NOVO() | ~120 |
| 22:02 | Edited server/src/index.ts | 8→10 lines | ~50 |
| 22:02 | Edited iniciar-servidor.sh | modified professor() | ~114 |
| 22:02 | Edited iniciar-servidor.bat | modified professor() | ~115 |
| 22:08 | Edited shared/src/worldgen.test.ts | expanded (+7 lines) | ~85 |
| 22:08 | tamanho de mundo P/M/G na criação: menu select + worker init dims + LJ_TAMANHO + launchers | worldgen.ts, menu.ts, index.html, connection.ts, main.ts, worker.ts, server/index.ts, launchers | 227 testes | ~8k |
| 22:09 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/d5fb946a-7df1-4f81-8d6e-b29e8b26f43a/scratchpad/bench.mts | — | ~965 |
| 22:11 | Edited shared/src/mesher.ts | added 1 condition(s) | ~248 |
| 22:11 | Edited shared/src/mesher.ts | 2→2 lines | ~29 |
| 22:11 | Edited server/src/index.ts | modified perMessageDeflate() | ~167 |
| 23:55 | medição mundo G + otimizações: fast path chunk-ar no mesher, perMessageDeflate no ws (8MB→41,6KB no fio); greedy/gzip-save adiados com registro | mesher.ts, server/index.ts, cerebrum | 228 testes, bench + smoke deflate ✅ | ~10k |
| 23:59 | Edited server/src/cenarios/verificar.ts | modified conferirGeometria() | ~174 |
| 00:01 | Created server/src/cenarios/gerar.ts | — | ~4746 |
| 00:02 | Edited iniciar-servidor.sh | modified Enter() | ~208 |
| 00:02 | Edited iniciar-servidor.bat | modified Enter() | ~219 |
| 00:03 | Edited cenarios/README.md | 11→12 lines | ~152 |
| 00:03 | Edited cenarios/README.md | modified Erros() | ~600 |
| 00:04 | Edited cenarios/README.md | Erros() → erros() | ~120 |
| 00:04 | 3 cenários novos (aula4 decifrar/glifos, aula5 simetria 2D, aula6 manual/quadros+móveis): gerador refatorado pra área em CAIXA + extras + conferirExtra; launchers corrigidos (bug-303) e com aulas novas; README atualizado | gerar.ts, verificar.ts, launchers, cenarios/*.ljw, README | 6/6 gerados+conferidos, 3 screenshots ✅, 228 testes | ~20k |
| 00:05 | Session end: 142 writes across 34 files (shortcutGuard.ts, main.ts, constants.ts, session.ts, daynight.ts) | 43 reads | ~141775 tok |
| 00:09 | Session end: 142 writes across 34 files (shortcutGuard.ts, main.ts, constants.ts, session.ts, daynight.ts) | 43 reads | ~141775 tok |
| 00:13 | Created server/src/cenarios/gerar.ts | — | ~5369 |
| 00:14 | Edited server/src/cenarios/verificar.ts | added nullish coalescing | ~238 |
| 00:14 | Edited server/src/cenarios/verificar.ts | modified for() | ~505 |
| 00:16 | Edited cenarios/README.md | expanded (+8 lines) | ~309 |
| 00:16 | FASES nos cenários: Cenario.fases[] (1=livre, 2+=sequencial auto), layout lado a lado, verificador joga todas em ordem; aula1 virou 3 fases (período 3 → período 4 → crescente) | gerar.ts, verificar.ts, cenarios/*.ljw, README | 6/6 gerados, HUD 0/3 + fase 1 ativa no screenshot ✅ | ~12k |
| 00:17 | Session end: 146 writes across 34 files (shortcutGuard.ts, main.ts, constants.ts, session.ts, daynight.ts) | 44 reads | ~148218 tok |
| 00:18 | Session end: 146 writes across 34 files (shortcutGuard.ts, main.ts, constants.ts, session.ts, daynight.ts) | 44 reads | ~148218 tok |
| 00:19 | fecho de sessão pré-/clear: STATUS com próxima sessão (playtest acumulado → piloto), tudo pushado | .wolf/* | 228 testes, 5 commits na sessão | ~3k |
| 00:19 | Session end: 146 writes across 34 files (shortcutGuard.ts, main.ts, constants.ts, session.ts, daynight.ts) | 44 reads | ~148218 tok |

## Session: 2026-07-19 12:48

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 13:00 | Edited client/src/commands.ts | 4→6 lines | ~17 |
| 13:00 | Edited client/src/commands.ts | added 1 condition(s) | ~370 |
| 13:00 | Edited client/src/commands.ts | added 2 condition(s) | ~91 |
| 13:00 | Edited client/src/main.ts | inline fix | ~16 |
| 13:00 | Edited client/src/main.ts | added 1 condition(s) | ~152 |
| 13:00 | Edited client/src/main.ts | 2→5 lines | ~77 |
| 13:02 | Edited shared/src/mesher.ts | 4→7 lines | ~153 |
| 13:03 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/260487cb-8d41-4a2f-8969-3ebc1582156d/scratchpad/porta-stage.mts | — | ~438 |
| 13:03 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/260487cb-8d41-4a2f-8969-3ebc1582156d/scratchpad/porta-stage.mts | — | ~637 |
| 13:11 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/260487cb-8d41-4a2f-8969-3ebc1582156d/scratchpad/porta-stage.mts | modified for() | ~220 |
| 13:00 | Backlog 1/3: sanitizeName (já codado sessão anterior) verificado + commitado 9c5349a | auth.ts, session.ts, menu.ts, index.html | 212 testes ok | ~2k |
| 13:05 | Backlog 2/3: autocomplete de nomes no Tab + /claim /amigos na árvore, commit b46f52c | commands.ts, main.ts | smoke tsx ok | ~3k |
| 13:20 | Backlog 3/3: porta pivota na dobradiça (painel na borda, aresta compartilhada) | mesher.ts | 212 testes + screenshot headless | ~8k |
| 13:59 | Session end: 10 writes across 4 files (commands.ts, main.ts, mesher.ts, porta-stage.mts) | 11 reads | ~23092 tok |
| 13:30 | Session end: backlog 3/3 (sanitizeName, autocomplete nomes, porta dobradiça) — commits 9c5349a b46f52c 6875406 + push | STATUS/cerebrum/memory atualizados | próxima: playtest acumulado | ~60k |
| 14:28 | Session end: 10 writes across 4 files (commands.ts, main.ts, mesher.ts, porta-stage.mts) | 11 reads | ~23092 tok |

## Session: 2026-07-19 12:48

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-18 13:39

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 13:44 | Edited shared/src/auth.ts | modified isValidPin() | ~276 |
| 13:45 | Edited shared/src/session.ts | inline fix | ~28 |
| 13:45 | Edited shared/src/session.ts | inline fix | ~13 |
| 13:45 | Edited shared/src/session.ts | 3→2 lines | ~10 |
| 13:45 | Edited client/src/menu.ts | inline fix | ~24 |
| 13:45 | Edited client/src/menu.ts | modified getPlayerName() | ~119 |
| 13:45 | Edited client/src/menu.ts | 5→6 lines | ~68 |
| 13:46 | Edited client/index.html | inline fix | ~60 |
| 13:46 | Edited shared/src/auth.test.ts | modified describe() | ~427 |

## Session: 2026-07-18 22:52

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 23:01 | Edited shared/src/save.ts | modified Confinamento() | ~80 |
| 23:01 | Edited shared/src/save.ts | 3→5 lines | ~81 |
| 23:02 | Edited shared/src/session.ts | modified Confinamento() | ~131 |
| 23:02 | Edited shared/src/session.ts | modified NOVO() | ~84 |
| 23:02 | Edited shared/src/session.ts | 3→4 lines | ~88 |
| 23:02 | Edited shared/src/session.ts | added 1 condition(s) | ~126 |
| 23:02 | Edited shared/src/session.ts | 4→6 lines | ~62 |
| 23:03 | Edited shared/src/session.ts | added 5 condition(s) | ~604 |
| 23:03 | Edited shared/src/session.ts | modified claimBloqueia() | ~222 |
| 23:03 | Edited shared/src/session.ts | modified if() | ~136 |
| 23:03 | Edited shared/src/session.ts | added 1 condition(s) | ~149 |
| 23:04 | Edited shared/src/session.ts | added optional chaining | ~603 |
| 23:04 | Edited shared/src/session.ts | " Comandos: /bloco · /rese" → " Comandos: /bloco · /rese" | ~49 |
| 23:04 | Edited server/src/mundos.ts | 2→6 lines | ~75 |
| 23:04 | Edited server/src/mundos.ts | inline fix | ~17 |
| 23:04 | Edited server/src/index.ts | modified NOVO() | ~130 |
| 23:04 | Edited server/src/index.ts | 2→7 lines | ~53 |
| 23:05 | Edited client/src/commands.ts | 4→5 lines | ~14 |
| 23:05 | Edited client/src/commands.ts | 2→3 lines | ~22 |
| 23:06 | Created shared/src/confinamento.test.ts | — | ~2498 |
| 23:08 | Edited ideias para fazer.txt | inline fix | ~81 |
| 23:10 | cp25 CONFINAMENTO por área de grupo: /confinar + auto em mundo-aula; confinaBloqueia (inverso do claim) em place/break; 207 testes (+6), typecheck 3/3, build+dist, boot smoke ok. Playtest PENDENTE | shared/session.ts+save.ts+confinamento.test.ts, server/index.ts+mundos.ts, client/commands.ts | ~9000 |
| 23:09 | Session end: 21 writes across 7 files (save.ts, session.ts, mundos.ts, index.ts, commands.ts) | 8 reads | ~48498 tok |
| 08:24 | Created iniciar-servidor.bat | — | ~526 |
| 08:25 | Created iniciar-servidor.sh | — | ~465 |
| 23:20 | Launchers do servidor: iniciar-servidor.bat (Windows/escola, duplo-clique via cmd.exe evita bloqueio PowerShell) + .sh (casa/WSL). Menu de mundo (livre/aula1-3), codigo opcional, LJ_NOVO=1, npm run start -w server. Boot smoke via .sh ok | iniciar-servidor.bat, iniciar-servidor.sh | ~1200 |
| 08:40 | Session end: 23 writes across 9 files (save.ts, session.ts, mundos.ts, index.ts, commands.ts) | 9 reads | ~50182 tok |
| 08:41 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/260487cb-8d41-4a2f-8969-3ebc1582156d/scratchpad/commitmsg.txt | — | ~391 |
| 08:41 | Session end: 24 writes across 10 files (save.ts, session.ts, mundos.ts, index.ts, commands.ts) | 9 reads | ~50601 tok |
| 08:43 | Session end: 24 writes across 10 files (save.ts, session.ts, mundos.ts, index.ts, commands.ts) | 9 reads | ~50601 tok |
| 23:35 | FECHO sessão 2026-07-18: cp25 confinamento + launchers .bat/.sh, commit 361f73d pushado pra origin/main. Handoff no STATUS. Playtest acumulado pendente (cp24+voo+bedrock+cp25) | .wolf/STATUS.md, .wolf/memory.md | ~600 |
| 13:38 | Session end: 24 writes across 10 files (save.ts, session.ts, mundos.ts, index.ts, commands.ts) | 9 reads | ~50601 tok |

## Session: 2026-07-18 22:51

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-17 16:00

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 16:07 | Edited shared/src/blocks.ts | modified isBreakable() | ~142 |
| 16:07 | Edited shared/src/session.ts | 4→5 lines | ~21 |
| 16:07 | Edited shared/src/session.ts | added 1 condition(s) | ~122 |
| 16:07 | Edited client/src/blocksUi.ts | inline fix | ~19 |
| 16:07 | Edited client/src/blocksUi.ts | added 1 condition(s) | ~141 |
| 16:07 | Edited client/src/inventory.ts | 2→1 lines | ~10 |
| 16:07 | Edited client/src/inventory.ts | 4→6 lines | ~101 |
| 16:07 | Edited client/src/inventory.ts | 3→3 lines | ~34 |
| 16:07 | Edited client/src/main.ts | 3→4 lines | ~16 |
| 16:07 | Edited client/src/main.ts | inline fix | ~16 |
| 16:08 | Edited client/src/main.ts | modified spawn() | ~140 |
| 16:08 | Edited client/src/main.ts | 3→4 lines | ~30 |
| 16:08 | Edited client/src/main.ts | added 1 condition(s) | ~63 |
| 16:08 | Edited server/src/paths.ts | modified mundoDeTrabalho() | ~204 |
| 16:08 | Edited server/src/index.ts | expanded (+12 lines) | ~192 |
| 16:08 | Edited server/src/index.ts | added 1 condition(s) | ~123 |
| 16:08 | Edited server/src/index.ts | added 1 condition(s) | ~54 |
| 16:09 | Edited server/src/mundos.ts | modified aula() | ~68 |
| 16:09 | Edited server/src/mundos.ts | modified if() | ~140 |
| 16:09 | Edited server/src/mundos.ts | 2→2 lines | ~20 |
| 16:09 | Edited server/src/index.ts | modified if() | ~39 |
| 16:10 | Edited shared/src/session.test.ts | expanded (+20 lines) | ~342 |
| 16:20 | Edited ideias para fazer.txt | modified griefing() | ~212 |
| 16:10 | rocha-matriz só-professor: isProfessorOnly() + gate no place_block + placeableFor(papel) esconde no cliente | shared/blocks.ts, shared/session.ts, client/blocksUi.ts, client/inventory.ts, client/main.ts | 193 testes, typecheck 3/3, build ok; bug-281 | ~9k |
| 16:11 | mundos "aula" read-only: ehMundoDeAula() → carrega do modelo + saveNow no-op; /mundo propaga flag | server/paths.ts, server/index.ts, server/mundos.ts | smoke boot real ✅ (loga AULA, mtime intacto), typecheck 3/3 | ~6k |
| 16:12 | cenários APROVADOS pela turma; anti-griefing (claim+grupos de amigos) foi pro backlog (talvez, precisa entrevista) | STATUS.md, ideias para fazer.txt | registrado | ~1k |
| 16:22 | Session end: 23 writes across 10 files (blocks.ts, session.ts, blocksUi.ts, inventory.ts, main.ts) | 10 reads | ~60184 tok |
| 16:32 | Session end: 23 writes across 10 files (blocks.ts, session.ts, blocksUi.ts, inventory.ts, main.ts) | 10 reads | ~60184 tok |
| 16:41 | Created shared/src/claims.ts | — | ~953 |
| 16:42 | Edited shared/src/index.ts | 3→4 lines | ~30 |
| 16:42 | Edited shared/src/protocol.ts | added 1 import(s) | ~77 |
| 16:42 | Edited shared/src/protocol.ts | expanded (+19 lines) | ~230 |
| 16:42 | Edited shared/src/protocol.ts | added 4 condition(s) | ~313 |
| 16:42 | Edited shared/src/save.ts | added 1 import(s) | ~69 |
| 16:42 | Edited shared/src/save.ts | modified griefing() | ~109 |
| 16:42 | Edited shared/src/save.ts | added 4 condition(s) | ~179 |
| 16:42 | Edited shared/src/save.ts | 3→7 lines | ~115 |
| 16:43 | Edited shared/src/session.ts | expanded (+8 lines) | ~75 |
| 16:43 | Edited shared/src/session.ts | modified Grupos() | ~236 |
| 16:43 | Edited shared/src/session.ts | modified for() | ~122 |
| 16:43 | Edited shared/src/session.ts | expanded (+11 lines) | ~194 |
| 16:43 | Edited shared/src/session.ts | modified if() | ~318 |
| 16:44 | Edited shared/src/session.ts | added 1 condition(s) | ~182 |
| 16:44 | Edited shared/src/session.ts | added 1 condition(s) | ~108 |
| 16:44 | Edited shared/src/session.ts | added 1 condition(s) | ~134 |
| 16:44 | Edited shared/src/session.ts | 6→10 lines | ~149 |
| 16:44 | Edited shared/src/session.ts | added optional chaining | ~161 |
| 16:44 | Edited shared/src/session.ts | 3→6 lines | ~129 |
| 16:47 | Edited shared/src/session.ts | added optional chaining | ~3996 |
| 16:47 | Edited client/src/main.ts | modified griefing() | ~128 |
| 16:47 | Edited client/src/main.ts | 5→6 lines | ~30 |
| 16:48 | Edited client/src/main.ts | added optional chaining | ~188 |
| 16:48 | Edited client/src/main.ts | added 1 condition(s) | ~208 |
| 16:48 | Edited client/src/main.ts | modified if() | ~110 |
| 16:48 | Edited client/src/main.ts | modified nomeadas() | ~274 |
| 16:49 | Edited client/src/main.ts | 5→7 lines | ~84 |
| 16:49 | Edited client/src/main.ts | modified if() | ~67 |
| 16:52 | Created shared/src/claims.test.ts | — | ~2206 |
| 16:52 | cp24 anti-griefing CODADO: claims por região + grupos de amigos (convite/aceite); gate no servidor; varinha liberada pro aluno; wireframes | shared/claims.ts(+test), protocol.ts, save.ts, session.ts, client/main.ts | 201 testes (8 novos), typecheck 3/3, build+dist ok; playtest pendente | ~34k |
| 16:54 | Edited client/src/main.ts | added 1 condition(s) | ~135 |
| 16:54 | Session end: 54 writes across 14 files (blocks.ts, session.ts, blocksUi.ts, inventory.ts, main.ts) | 15 reads | ~81579 tok |
| 17:05 | fecho de sessão pré-/clear: STATUS com cp24 CODADO+playtest pendente, nova ideia cp25 (confinamento em mundos-aula), cerebrum com prefs de entrevista/fase-2 | STATUS.md, cerebrum.md, memory.md | handoff pronto | ~2k |
| 22:46 | Session end: 54 writes across 14 files (blocks.ts, session.ts, blocksUi.ts, inventory.ts, main.ts) | 15 reads | ~81579 tok |

## Session: 2026-07-17 14:23

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 14:39 | Edited shared/src/protocol.ts | expanded (+9 lines) | ~132 |
| 14:39 | Edited shared/src/protocol.ts | added 1 condition(s) | ~109 |
| 14:39 | Edited shared/src/physics.ts | 5→9 lines | ~91 |
| 14:39 | Edited shared/src/physics.ts | modified voo() | ~80 |
| 14:39 | Edited shared/src/physics.ts | added 1 condition(s) | ~346 |
| 14:40 | Edited shared/src/worldgen.ts | 3→5 lines | ~101 |
| 14:40 | Edited shared/src/session.ts | 3→7 lines | ~123 |
| 14:40 | Edited shared/src/session.ts | added 1 condition(s) | ~151 |
| 14:40 | Edited shared/src/session.ts | added optional chaining | ~322 |
| 14:40 | Edited shared/src/session.ts | added 1 condition(s) | ~165 |
| 14:40 | Edited client/src/main.ts | modified podeVoar() | ~138 |
| 14:41 | Edited client/src/main.ts | added 2 condition(s) | ~144 |
| 14:41 | Edited client/src/main.ts | 4→7 lines | ~75 |
| 14:41 | Edited client/src/main.ts | added 2 condition(s) | ~179 |
| 14:41 | Edited client/src/main.ts | inline fix | ~28 |
| 14:41 | Edited client/src/commands.ts | 5→6 lines | ~16 |
| 14:41 | Edited client/src/commands.ts | 3→4 lines | ~41 |
| 14:43 | Edited shared/src/session.test.ts | added 2 condition(s) | ~913 |
| 14:43 | Edited shared/src/physics.test.ts | expanded (+35 lines) | ~418 |
| 14:43 | Created shared/src/worldgen.test.ts | — | ~264 |
| 14:44 | Edited shared/src/worldgen.test.ts | modified for() | ~97 |
| 15:58 | Sessão: voo criativo (/voo) + bedrock camada 0 | physics/protocol/session/worldgen/main/commands | 192 testes, typecheck 3/3, build+dist ok, screenshot boot ok | ~sessão |
| 15:58 | Edited ideias para fazer.txt | 6→6 lines | ~95 |
| 15:59 | Session end: 22 writes across 10 files (protocol.ts, physics.ts, worldgen.ts, session.ts, main.ts) | 10 reads | ~61910 tok |
| 16:00 | Session end: 22 writes across 10 files (protocol.ts, physics.ts, worldgen.ts, session.ts, main.ts) | 10 reads | ~61910 tok |

## Session: 2026-07-17 09:58

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 10:51 | Edited shared/src/session.ts | added 3 condition(s) | ~208 |
| 10:52 | Edited shared/src/session.ts | added 4 condition(s) | ~775 |
| 10:52 | Edited shared/src/session.ts | "Uso: /regiao criar nome ·" → "Uso: /regiao criar nome [" | ~58 |
| 10:52 | Edited shared/src/regions.test.ts | added optional chaining | ~655 |
| 10:53 | /regiao criar por coordenadas digitadas com ~ e ~n (varinha segue valendo) | shared/src/session.ts, shared/src/regions.test.ts | 156 testes + typecheck 3/3 + build ok | ~35k |
| 10:54 | Session end: 4 writes across 2 files (session.ts, regions.test.ts) | 4 reads | ~27351 tok |
| 10:56 | Edited shared/src/session.ts | added 1 condition(s) | ~202 |
| 10:57 | Edited shared/src/session.test.ts | expanded (+17 lines) | ~281 |
| 10:57 | Edited shared/src/session.test.ts | inline fix | ~19 |
| 10:57 | ~ e ~n também no /bloco (mesmo parseCoordArg) | shared/src/session.ts, shared/src/session.test.ts | 157 testes + typecheck 3/3 + build ok | ~8k |
| 10:57 | Session end: 7 writes across 3 files (session.ts, regions.test.ts, session.test.ts) | 5 reads | ~38331 tok |
| 10:58 | Session end: 7 writes across 3 files (session.ts, regions.test.ts, session.test.ts) | 6 reads | ~38331 tok |
| 11:10 | Edited shared/src/blocks.ts | added 1 condition(s) | ~816 |
| 11:10 | Edited shared/src/physics.ts | 2→2 lines | ~26 |
| 11:10 | Edited shared/src/physics.ts | 6→7 lines | ~52 |
| 11:10 | Edited shared/src/physics.ts | 5→5 lines | ~43 |
| 11:10 | Edited shared/src/rules.ts | 2→2 lines | ~28 |
| 11:10 | Edited shared/src/rules.ts | added 3 condition(s) | ~282 |
| 11:10 | Edited shared/src/mesher.ts | inline fix | ~20 |
| 11:10 | Edited shared/src/mesher.ts | 4→9 lines | ~52 |
| 11:11 | Edited shared/src/mesher.ts | expanded (+8 lines) | ~148 |
| 11:11 | Edited shared/src/mesher.ts | added nullish coalescing | ~268 |
| 11:11 | Edited shared/src/mesher.ts | added 8 condition(s) | ~1492 |
| 11:12 | Edited shared/src/protocol.ts | 2→5 lines | ~102 |
| 11:12 | Edited shared/src/protocol.ts | added 1 condition(s) | ~174 |
| 11:12 | Edited shared/src/session.ts | expanded (+8 lines) | ~36 |
| 11:12 | Edited shared/src/session.ts | added 13 condition(s) | ~579 |
| 11:12 | Edited shared/src/session.ts | added 1 condition(s) | ~90 |
| 11:12 | Edited shared/src/session.ts | added 1 condition(s) | ~134 |
| 11:12 | Edited shared/src/session.ts | added 1 condition(s) | ~117 |
| 11:13 | Created shared/src/cp23.test.ts | — | ~2698 |
| 11:15 | Created shared/src/cp23.test.ts | — | ~2743 |
| 11:16 | Edited shared/src/blocks.test.ts | 4→7 lines | ~83 |
| 11:17 | Edited shared/src/mesher.ts | added 3 condition(s) | ~392 |
| 11:17 | Edited shared/src/mesher.ts | 9→9 lines | ~130 |
| 11:17 | Edited shared/src/mesher.ts | 9→9 lines | ~115 |
| 11:18 | Edited shared/src/cp23.test.ts | 48→50 lines | ~689 |
| 11:19 | Edited client/src/atlasTexture.ts | added 2 condition(s) | ~539 |
| 11:19 | Edited client/src/atlasTexture.ts | expanded (+6 lines) | ~92 |
| 11:19 | Edited client/src/blocksUi.ts | 4→9 lines | ~111 |
| 11:20 | Created client/src/torchGlow.ts | — | ~757 |
| 11:20 | Edited client/src/main.ts | modified tochas() | ~68 |
| 11:20 | Edited client/src/main.ts | 3→4 lines | ~36 |
| 11:20 | Edited client/src/main.ts | 3→4 lines | ~58 |
| 11:20 | Edited client/src/main.ts | added 2 condition(s) | ~320 |
| 11:20 | Edited client/src/main.ts | added 1 condition(s) | ~139 |
| 11:20 | Edited client/src/main.ts | 3→4 lines | ~17 |
| 11:20 | Edited client/src/main.ts | added 1 import(s) | ~34 |
| 11:21 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/8d9e190e-57d7-40a0-86df-331736df0502/scratchpad/cp23-stage.mts | — | ~451 |
| 11:30 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/8d9e190e-57d7-40a0-86df-331736df0502/scratchpad/cp23-stage2.mts | — | ~235 |
| 11:39 | Edited shared/src/protocol.ts | expanded (+12 lines) | ~200 |
| 11:39 | Edited shared/src/protocol.ts | added 1 condition(s) | ~163 |
| 11:39 | Edited shared/src/session.ts | modified applyBlock() | ~222 |
| 11:39 | Edited shared/src/scenario.ts | expanded (+6 lines) | ~108 |
| 11:40 | Edited shared/src/session.ts | added 1 condition(s) | ~686 |
| 11:40 | Edited shared/src/session.ts | 1→2 lines | ~12 |
| 11:40 | Edited client/src/chunks.ts | modified remeshBox() | ~272 |
| 11:40 | Edited client/src/torchGlow.ts | added 2 condition(s) | ~309 |
| 11:40 | Edited client/src/main.ts | expanded (+7 lines) | ~83 |
| 11:40 | Edited client/src/main.ts | added 1 condition(s) | ~58 |
| 11:41 | Edited client/src/main.ts | modified lote() | ~349 |
| 11:41 | Edited shared/src/cp23.test.ts | modified makeFlat() | ~221 |
| 11:41 | Edited shared/src/cp23.test.ts | added optional chaining | ~701 |
| 11:42 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/8d9e190e-57d7-40a0-86df-331736df0502/scratchpad/cp23-stage3.mts | — | ~500 |
| 11:56 | cp23: cerca+porta+tocha (não-cubos) e /regiao encher em lote (blocks_filled, teto 65536) | shared: blocks/mesher/physics/rules/protocol/session/scenario + cp23.test; client: atlas/blocksUi/main/chunks/torchGlow | 173 testes, typecheck 3/3, build, screenshots ok | ~85k |
| 11:57 | Session end: 59 writes across 19 files (session.ts, regions.test.ts, session.test.ts, blocks.ts, physics.ts) | 21 reads | ~85484 tok |
| 12:00 | Edited shared/src/session.ts | modified parseCoordArg() | ~50 |
| 12:00 | Edited shared/src/session.ts | expanded (+6 lines) | ~123 |
| 12:00 | Edited shared/src/session.ts | modified if() | ~116 |
| 12:00 | Edited shared/src/session.ts | 2→2 lines | ~52 |
| 12:01 | Edited shared/src/session.ts | added nullish coalescing | ~1188 |
| 12:01 | Edited shared/src/session.ts | modified handleDisconnect() | ~80 |
| 12:01 | Edited shared/src/session.ts | 4→4 lines | ~102 |
| 12:01 | Edited client/src/commands.ts | 3→5 lines | ~14 |
| 12:01 | Created shared/src/tp.test.ts | — | ~1490 |
| 12:02 | /tpr pede + /tpa aceita (30s) + /tp nome direto do professor (~ relativo ao teleportado) | shared/src/session.ts, shared/src/tp.test.ts, client/src/commands.ts | 182 testes, typecheck 3/3, build ok | ~25k |
| 12:03 | Session end: 68 writes across 21 files (session.ts, regions.test.ts, session.test.ts, blocks.ts, physics.ts) | 21 reads | ~89059 tok |
| 14:22 | SESSÃO FECHADA (handoff pré /clear): /regiao criar coords+~, ~ no /bloco, cp23 cerca/porta/tocha, encher em lote 65536, /tpr+/tpa+/tp nome. 182 testes, 4 commits pushados. Backlog novo: voo criativo, bedrock camada 0 | .wolf/* | tudo verde, dist no repo | - |
| 14:22 | Session end: 68 writes across 21 files (session.ts, regions.test.ts, session.test.ts, blocks.ts, physics.ts) | 21 reads | ~89059 tok |

## Session: 2026-07-17 09:20

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 09:22 | Edited shared/src/protocol.ts | 10→13 lines | ~113 |
| 09:22 | Edited shared/src/protocol.ts | 9→11 lines | ~108 |
| 09:22 | Edited shared/src/session.ts | 6→7 lines | ~62 |
| 09:22 | Edited shared/src/session.ts | 16→18 lines | ~139 |
| 09:23 | Edited shared/src/session.ts | 9→10 lines | ~49 |
| 09:23 | Edited client/src/main.ts | added optional chaining | ~984 |
| 09:23 | Edited shared/src/session.test.ts | 3→3 lines | ~38 |
| 09:23 | Edited shared/src/session.test.ts | 4→5 lines | ~52 |
| 09:23 | Edited shared/src/session.test.ts | 3→3 lines | ~48 |
| 09:23 | Edited shared/src/protocol.test.ts | expanded (+7 lines) | ~168 |
| 09:24 | Edited client/src/main.ts | 3→3 lines | ~39 |
| 09:25 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/96d96e4c-0809-43a9-bed0-c422babfbfe8/scratchpad/nametag-fakes.mts | — | ~296 |
| 09:35 | Plaquinha de nome sobre jogadores remotos: name opcional em player_moved (4 emissões na session) + Sprite canvas no cliente; screenshot headless prova | shared/protocol.ts, shared/session.ts, client/main.ts, testes | 153 testes ✅, typecheck 3/3, build+dist | ~35k |
| 09:53 | Session end: 12 writes across 6 files (protocol.ts, session.ts, main.ts, session.test.ts, protocol.test.ts) | 7 reads | ~51861 tok |

## Sessão 2026-07-17 (manhã, pré-piloto) — plaquinha de nome
- Quest única: nome do jogador flutuando sobre o boneco. FEITA e pushada (ce897a3).
- name opcional em player_moved (4 emissões na session; parse defensivo; host antigo ok).
- Cliente: Sprite filho da mesh, canvas procedural, depthTest false (vê através de parede).
- 153 testes ✅ · typecheck 3/3 ✅ · build + client/dist no push · screenshot headless prova.
- bug-239: campo novo no protocolo não propaga pro tipo local do callback apply* no main.ts.
- Handoff: STATUS.md atualizado; piloto é HOJE — notebook da escola: git pull.
| 09:58 | Session end: 12 writes across 6 files (protocol.ts, session.ts, main.ts, session.test.ts, protocol.test.ts) | 7 reads | ~51861 tok |

## Session: 2026-07-16 15:24

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 15:29 | Edited client/src/input.ts | modified toque() | ~69 |
| 15:29 | Edited client/src/input.ts | 2→4 lines | ~66 |
| 15:29 | Edited client/src/input.ts | modified locked() | ~136 |
| 15:29 | Edited client/src/input.ts | added optional chaining | ~223 |
| 15:30 | Created client/src/touch.ts | — | ~2436 |
| 15:30 | Edited client/src/main.ts | added 1 import(s) | ~56 |
| 15:30 | Edited client/src/main.ts | 2→4 lines | ~74 |
| 15:30 | Edited client/src/main.ts | added 1 condition(s) | ~280 |
| 15:31 | Edited client/src/main.ts | inline fix | ~26 |
| 15:31 | Edited client/src/main.ts | 9→9 lines | ~119 |
| 15:31 | Edited client/src/main.ts | 3→3 lines | ~54 |
| 15:31 | Edited client/src/main.ts | 2→2 lines | ~14 |
| 15:31 | Edited client/src/main.ts | added optional chaining | ~423 |
| 15:31 | Edited client/src/main.ts | added 1 condition(s) | ~103 |
| 15:31 | Edited client/index.html | 1→4 lines | ~40 |
| 15:32 | Edited client/index.html | 7→11 lines | ~95 |
| 16:20 | Touch controls (tablet): touch.ts novo, input.active/setKey/applyLook/press, main.ts locked→active + startPlay + hotbar tocável, index.html viewport/touch-action | client/src/touch.ts, input.ts, main.ts, index.html | typecheck 3/3, 153 testes, build ✓, screenshots ?touch e desktop ok | ~55k |
| 16:24 | Session end: 16 writes across 4 files (input.ts, touch.ts, main.ts, index.html) | 7 reads | ~22241 tok |
| 16:40 | Sync casa↔escola via git: gitignore mínimo (só temp de teste), .ljw + aulas/ + dist versionados, checklist ganhou passo 0 (clone no notebook) e sintaxe PowerShell | .gitignore, .wolf/STATUS.md, .wolf/cerebrum.md | commit + push | ~8k |
| 16:49 | Session end: 16 writes across 4 files (input.ts, touch.ts, main.ts, index.html) | 7 reads | ~22241 tok |
| 19:06 | bug-232: ExecutionPolicy do PowerShell bloqueava npm no notebook da escola — fix Set-ExecutionPolicy CurrentUser RemoteSigned / npm.cmd | .wolf/buglog.json, cerebrum | orientação dada, logado | ~3k |
| 17:05 | Session end: 16 writes across 4 files (input.ts, touch.ts, main.ts, index.html) | 7 reads | ~22241 tok |
| 19:30 | bug-233: notebook rodava ZIP velho do repo (boot antigo denuncia — "escutando em ws://" morreu no 6973fe7); fix = clone atual | .wolf/buglog.json | diagnóstico por fingerprint do boot | ~10k |
| 18:28 | Session end: 16 writes across 4 files (input.ts, touch.ts, main.ts, index.html) | 9 reads | ~26256 tok |
| 18:40 | Edited client/src/touch.ts | added optional chaining | ~279 |
| 18:41 | Edited client/src/touch.ts | 7→9 lines | ~121 |
| 18:41 | Edited client/src/chat.ts | modified if() | ~80 |
| 18:41 | Edited client/src/chat.ts | modified close() | ~37 |
| 18:41 | Edited client/src/main.ts | inline fix | ~22 |
| 18:41 | Edited client/src/main.ts | modified startPlay() | ~82 |
| 18:41 | Edited client/src/main.ts | added 1 condition(s) | ~75 |
| 18:41 | Edited client/src/main.ts | added 1 condition(s) | ~69 |
| 18:42 | Edited client/index.html | 8→12 lines | ~102 |
| 18:42 | Edited server/src/index.ts | added 1 import(s) | ~87 |
| 18:42 | Edited server/src/index.ts | added 3 condition(s) | ~288 |
| 18:43 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/79e5e357-9896-4502-b4f6-697b125f1983/scratchpad/smoke-say.mjs | — | ~522 |
| 20:10 | Rodada 2 mobile: tela cheia (auto+botão, lock paisagem), botão chat + Enter virtual + tocar fora fecha, hotbar sticky no inventário, /say no terminal do host (smoke 3/3) | touch.ts, chat.ts, main.ts, index.html, server/index.ts | typecheck 3/3, 153 testes, build, screenshots ok | ~40k |
| 18:46 | Session end: 28 writes across 7 files (input.ts, touch.ts, main.ts, index.html, chat.ts) | 12 reads | ~29541 tok |
| 07:00 | Sessão 2026-07-16→17 encerrada: touch controls (cp-touch) + rodada 2 mobile + sync via git + bug-232/233; STATUS aponta piloto HOJE, git pull no notebook antes de rodar | .wolf/* | handoff pronto pro /clear | — |
| 09:19 | Session end: 28 writes across 7 files (input.ts, touch.ts, main.ts, index.html, chat.ts) | 12 reads | ~29541 tok |

## Session: 2026-07-16 13:12

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 13:33 | commit cp20-22 (letra/número, dia/noite, /kicar) | 25 arquivos | 47ae4f5, árvore limpa, 150 testes verdes | ~4k |
| 13:54 | Edited shared/src/worldgen.ts | paredes() → deles() | ~383 |
| 13:54 | Edited shared/src/cp14.test.ts | modified o() | ~418 |
| 13:54 | Edited server/src/cenarios/verificar.ts | modified for() | ~214 |
| 13:55 | Edited shared/src/session.ts | added 6 condition(s) | ~560 |
| 13:55 | Edited shared/src/regions.test.ts | added 1 import(s) | ~44 |
| 13:55 | Edited shared/src/regions.test.ts | added 1 import(s) | ~46 |
| 13:55 | Edited shared/src/regions.test.ts | added optional chaining | ~392 |
| 13:55 | Edited client/src/commands.ts | inline fix | ~21 |
| 13:56 | Edited client/index.html | inline fix | ~25 |
| 14:13 | cabines→plot demarcado (borda pedra-lavrada rente ao chão, sem tábua) + /regiao sortear | worldgen.ts, session.ts, verificar.ts, cp14/regions.test, index.html, commands.ts | typecheck 3/3, 152 testes, 3 aulas regeradas ✓, build ✓ | ~9k |
| 14:14 | Session end: 9 writes across 7 files (worldgen.ts, cp14.test.ts, verificar.ts, session.ts, regions.test.ts) | 9 reads | ~37787 tok |
| 14:21 | Edited shared/src/session.ts | added 3 condition(s) | ~798 |
| 14:21 | Edited shared/src/session.ts | added 1 condition(s) | ~300 |
| 14:23 | Edited shared/src/scenario.test.ts | added optional chaining | ~502 |
| 14:23 | trilha sequencial: ao concluir, faixa auto-limpa e carrega a próxima sequência na MESMA área | session.ts (carregarProximaSequencia, restaurarAreaBaseline, tick, restaurarAreasBaseline split por modo), scenario.test.ts | typecheck 3/3, 153 testes | ~11k |
| 14:24 | Session end: 12 writes across 8 files (worldgen.ts, cp14.test.ts, verificar.ts, session.ts, regions.test.ts) | 10 reads | ~43524 tok |
| 15:02 | Session end: 12 writes across 8 files (worldgen.ts, cp14.test.ts, verificar.ts, session.ts, regions.test.ts) | 10 reads | ~43524 tok |
| 15:12 | Session end: 12 writes across 8 files (worldgen.ts, cp14.test.ts, verificar.ts, session.ts, regions.test.ts) | 10 reads | ~43524 tok |
| 15:21 | Edited client/src/input.ts | modified ENGATADO() | ~74 |
| 15:21 | Edited client/src/input.ts | 8→6 lines | ~45 |
| 15:23 | PIVOT: plano de touch controls p/ piloto amanhã gravado no STATUS (não codar agora, /clear e próxima sessão executa) | STATUS.md | plano A(touch)/B(checklist)/C(relatório); input.ts stub revertido | ~6k |
| 15:23 | Session end: 14 writes across 9 files (worldgen.ts, cp14.test.ts, verificar.ts, session.ts, regions.test.ts) | 12 reads | ~54601 tok |

## Session: 2026-07-16 22:17

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| — | cp20: 36 blocos-glifo letra A–Z (29–54) + dígito 0–9 (55–64), do backlog `ideias para fazer.txt`. Append de id + atlas procedural (tilesPerRow 8→16), fonte única GLYPH alimenta mesher/atlas/nomes | shared/blocks.ts, shared/mesher.ts, client/atlasTexture.ts, client/blocksUi.ts, shared/blocks.test.ts | typecheck 3/3, 143 testes, build ok, layout do atlas conferido em node; legibilidade do glifo p/ playtest | ~12k |
| — | cp20 aprovado pelo usuário ("ficou bom"). | — | fechado | — |
| — | cp21: ciclo dia/noite server-autoritativo (VISUAL). horaDoDia+cicloAtivo na sessão, avança por tick (DIA_SEGUNDOS=600), msg `time` no join+1×/s; /hora e /ciclo (professor); cliente SkyCycle interpola céu/sol/ambiente, nunca escurece 100%; hora não persiste | shared/constants.ts, protocol.ts, session.ts, client/daynight.ts (novo), main.ts, commands.ts | typecheck 3/3, 147 testes, build; smoke ws real time OK | ~20k |
| — | cp22: /kicar aluno (professor). HOST intercepta (padrão /mundo, fecha socket), msg `kicked`→cliente volta ao menu; expulsão, não banimento | server/index.ts, shared/protocol.ts, client/main.ts, commands.ts, server/cenarios/_smoke-kicar.mjs (novo) | smoke ws real 9/9 | ~6k |
| — | cp21 CONFIG (pedido do usuário): mundo de atividade = DIA PERMANENTE ciclo PARADO (default HORA_PADRAO=12, cicloAtivo=false); hora+ciclo PERSISTEM no save (sobrevivência futura continua a hora); gerador trava dia explícito; 3 cenários regerados (hora=12 ciclo=false) | shared/constants.ts, save.ts, session.ts, server/cenarios/gerar.ts, +testes | typecheck 3/3, 150 testes, build; smoke ws real: cenário abre em dia travado | ~14k |
| 09:15 | Edited shared/src/blocks.ts | modified cp18() | ~307 |
| 09:15 | Edited shared/src/mesher.ts | 2→3 lines | ~63 |
| 09:15 | Edited shared/src/mesher.ts | expanded (+10 lines) | ~141 |
| 09:15 | Edited shared/src/mesher.ts | 2→2 lines | ~38 |
| 09:15 | Edited shared/src/mesher.ts | modified for() | ~118 |
| 09:15 | Edited client/src/atlasTexture.ts | 2→2 lines | ~24 |
| 09:16 | Edited client/src/atlasTexture.ts | modified paintGlyph() | ~220 |
| 09:16 | Edited client/src/atlasTexture.ts | modified for() | ~154 |
| 09:16 | Edited client/src/blocksUi.ts | expanded (+7 lines) | ~186 |
| 09:16 | Edited client/src/blocksUi.ts | 3→4 lines | ~30 |
| 09:16 | Edited shared/src/blocks.test.ts | expanded (+10 lines) | ~239 |
| 09:30 | Session end: 11 writes across 5 files (blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, blocks.test.ts) | 8 reads | ~7610 tok |
| 10:21 | Edited shared/src/constants.ts | modified noite() | ~111 |
| 10:21 | Edited shared/src/protocol.ts | expanded (+19 lines) | ~272 |
| 10:22 | Edited shared/src/protocol.ts | added 3 condition(s) | ~226 |
| 10:22 | Edited shared/src/session.ts | 8→10 lines | ~50 |
| 10:22 | Edited shared/src/session.ts | expanded (+7 lines) | ~136 |
| 10:22 | Edited shared/src/session.ts | 2→3 lines | ~61 |
| 10:23 | Edited shared/src/session.ts | added optional chaining | ~884 |
| 10:23 | Edited shared/src/session.ts | " Comandos: /bloco · /rese" → " Comandos: /bloco · /rese" | ~38 |
| 10:23 | Edited shared/src/session.ts | added 1 condition(s) | ~102 |
| 10:23 | Edited shared/src/session.ts | modified if() | ~126 |
| 10:23 | Created client/src/daynight.ts | — | ~971 |
| 10:23 | Edited client/src/main.ts | modified noite() | ~102 |
| 10:24 | Edited client/src/main.ts | added 1 import(s) | ~35 |
| 10:24 | Edited client/src/main.ts | added 2 condition(s) | ~143 |
| 10:24 | Edited client/src/main.ts | modified noite() | ~41 |
| 10:24 | Edited server/src/index.ts | added error handling | ~662 |
| 10:24 | Edited server/src/index.ts | added 1 condition(s) | ~58 |
| 10:24 | Edited client/src/commands.ts | expanded (+14 lines) | ~252 |
| 10:25 | Edited shared/src/session.test.ts | added 1 condition(s) | ~210 |
| 10:26 | Edited shared/src/session.test.ts | modified cheia() | ~232 |
| 10:26 | Edited shared/src/protocol.test.ts | expanded (+21 lines) | ~316 |
| 10:27 | Edited shared/src/session.test.ts | added 2 condition(s) | ~790 |
| 10:28 | Edited shared/src/session.test.ts | modified parseServerMessage() | ~159 |
| 10:29 | Created server/src/cenarios/_smoke-kicar.mjs | — | ~746 |
| 11:03 | Session end: 35 writes across 15 files (blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, blocks.test.ts) | 15 reads | ~62249 tok |
| 11:08 | Edited shared/src/constants.ts | modified noite() | ~130 |
| 11:08 | Edited shared/src/save.ts | expanded (+6 lines) | ~145 |
| 11:08 | Edited shared/src/save.ts | 6→9 lines | ~134 |
| 11:09 | Edited shared/src/session.ts | 5→5 lines | ~25 |
| 11:09 | Edited shared/src/session.ts | 6→7 lines | ~124 |
| 11:09 | Edited shared/src/session.ts | added 2 condition(s) | ~151 |
| 11:09 | Edited shared/src/session.ts | 10→14 lines | ~128 |
| 11:09 | Edited server/src/cenarios/gerar.ts | expanded (+6 lines) | ~186 |
| 11:10 | Edited shared/src/session.test.ts | toBe() → toEqual() | ~82 |
| 11:10 | Edited shared/src/session.test.ts | added 1 condition(s) | ~913 |
| 11:10 | Edited shared/src/save.test.ts | expanded (+22 lines) | ~409 |
| 11:35 | Session end: 46 writes across 18 files (blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, blocks.test.ts) | 18 reads | ~70770 tok |
| 13:07 | Session end: 46 writes across 18 files (blocks.ts, mesher.ts, atlasTexture.ts, blocksUi.ts, blocks.test.ts) | 18 reads | ~70770 tok |

## Session: 2026-07-15 (playtest — QoL de comandos)
| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| — | Tab autocompleta comandos do chat (cicla opções + hint) | client/commands.ts (novo), chat.ts, index.html, main.ts | typecheck 3/3, build ok, lógica testada em node | ~8k |
| — | /mundo exibe nomes SEM .ljw (já aceitava sem extensão) | server/mundos.ts | semExt helper; cliente cacheia nomes de /mundo lista | — |
| 13:26 | Session end: 14 writes across 5 files (commands.ts, chat.ts, index.html, main.ts, mundos.ts) | 7 reads | ~36674 tok |
| 13:44 | Edited shared/src/session.ts | added 3 condition(s) | ~186 |
| 13:45 | Edited shared/src/session.ts | added nullish coalescing | ~1281 |
| 13:45 | Edited shared/src/session.ts | " Comandos: /bloco · /rese" → " Comandos: /bloco · /rese" | ~33 |
| 13:45 | Edited client/src/commands.ts | 8→9 lines | ~113 |
| 13:46 | Edited shared/src/groups.test.ts | added optional chaining | ~698 |
| 13:47 | Edited client/src/panels.ts | modified renderAtividade() | ~216 |
| 13:49 | Edited server/src/cenarios/_smoke-mundo.mjs | 4→4 lines | ~41 |
| 13:49 | Created server/src/cenarios/_smoke-atividade.mjs | — | ~794 |
| — | /tp grupos + /iniciar [n]: teleporta grupos p/ suas áreas, macro de abertura da aula | shared/session.ts, client/commands.ts, client/panels.ts | 141 testes, smoke ws 11/11, botões no painel prof | ~14k |
| 14:07 | Session end: 22 writes across 10 files (commands.ts, chat.ts, index.html, main.ts, mundos.ts) | 13 reads | ~57058 tok |
| 15:40 | Edited shared/src/scenario.ts | expanded (+8 lines) | ~168 |
| 15:40 | Edited shared/src/scenario.ts | added nullish coalescing | ~327 |
| 15:40 | Edited shared/src/session.ts | 7→8 lines | ~116 |
| 15:40 | Edited shared/src/session.ts | added 1 condition(s) | ~72 |
| 15:41 | Edited shared/src/session.ts | 9→6 lines | ~85 |
| 15:41 | Edited shared/src/session.ts | 7→5 lines | ~97 |
| 15:41 | Edited shared/src/session.ts | added optional chaining | ~648 |
| 15:42 | Edited shared/src/groups.test.ts | expanded (+28 lines) | ~527 |
| — | reset restaura BLOCOS das áreas ao estado autoral (bug-207): Objective.baseline persistido no .ljw | shared/session.ts, shared/scenario.ts, gerar (regen) | 142 testes, smoke 11/11, aula1 4/12 no ar | ~16k |
| 21:21 | Session end: 30 writes across 11 files (commands.ts, chat.ts, index.html, main.ts, mundos.ts) | 14 reads | ~60338 tok |
| 22:15 | Session end: 30 writes across 11 files (commands.ts, chat.ts, index.html, main.ts, mundos.ts) | 14 reads | ~60338 tok |
| 22:16 | Session end: 30 writes across 11 files (commands.ts, chat.ts, index.html, main.ts, mundos.ts) | 14 reads | ~60338 tok |
| 22:16 | Session end: 30 writes across 11 files (commands.ts, chat.ts, index.html, main.ts, mundos.ts) | 14 reads | ~60338 tok |
| 22:17 | Session end: 30 writes across 11 files (commands.ts, chat.ts, index.html, main.ts, mundos.ts) | 14 reads | ~60338 tok |

## Session: 2026-07-15 11:01

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 13:20 | Created client/src/commands.ts | — | ~512 |
| 13:20 | Created client/src/chat.ts | — | ~1476 |
| 13:20 | Edited client/index.html | 9→10 lines | ~80 |
| 13:20 | Edited client/index.html | expanded (+18 lines) | ~145 |
| 13:20 | Edited client/src/main.ts | added 1 condition(s) | ~57 |
| 13:21 | Edited client/src/main.ts | added 1 import(s) | ~34 |
| 13:21 | Edited client/src/main.ts | added 2 condition(s) | ~178 |
| 13:21 | Edited server/src/mundos.ts | 2→5 lines | ~88 |
| 13:21 | Edited server/src/mundos.ts | basename() → semExt() | ~34 |
| 13:21 | Edited server/src/mundos.ts | 9→9 lines | ~97 |
| 13:21 | Edited server/src/mundos.ts | basename() → semExt() | ~34 |
| 13:21 | Edited server/src/mundos.ts | basename() → semExt() | ~50 |
| 13:22 | Edited client/src/commands.ts | 5→5 lines | ~76 |
| 13:22 | Edited client/src/main.ts | added optional chaining | ~49 |

## Session: 2026-07-15 09:33

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 09:41 | Edited server/src/paths.ts | inline fix | ~20 |
| 09:43 | Edited server/src/index.ts | 2→2 lines | ~26 |
| 09:43 | Edited server/src/index.ts | modified if() | ~363 |
| 09:43 | Edited server/src/index.ts | added 1 condition(s) | ~350 |
| 09:43 | Edited server/src/index.ts | "${restore ? " → "mundo de ${CARREGAR_DE}" | ~25 |
| 09:43 | Edited server/src/mundos.ts | 4→4 lines | ~66 |
| 09:43 | Edited server/src/mundos.ts | modified mundosDisponiveis() | ~174 |
| 09:44 | Edited server/src/mundos.ts | added nullish coalescing | ~482 |
| 10:00 | Wired mundoDeTrabalho into boot | server/src/index.ts | model→aulas/ working copy at boot | ~120 |
| 10:12 | Ran cp19 smoke after separation | _smoke-mundo.mjs | 13/13 ✅ | ~200 |
| 10:14 | Verified models byte-identical post-swap | cenarios/*.ljw | md5 OK, copies in aulas/ | ~60 |
| 10:18 | Regenerated scenarios | cenarios/*.ljw | roster:[] confirmed (boot "0 no roster") | ~80 |

### Resumo da sessão 2026-07-15 (infra do piloto + integridade)
Fechei 3 frentes pedidas (servidor serve cliente na mesma porta · varredura de
mensagens de erro · cp19 trocar de aula sem derrubar) já codadas antes da compactação,
e o refino que faltava: **cenarios/ = MODELO, aulas/ = cópia viva**. `mundoDeTrabalho()`
em paths.ts, ligado no boot (index.ts) e no `/mundo carregar` (mundos.ts). Prova de
integridade: swap real deixou os 3 modelos em cenarios/ byte-idênticos (md5 OK) e criou
as cópias em aulas/; regeração confirmou roster:[] (boot "0 jogador(es) no roster").
Smoke cp19 13/13, typecheck 3/3. buglog: +bug-194 (modelo poluído pelo autosave) e
bug-195 (basename sem import). .exe/empacotamento segue ADIADO (decisão do usuário).
**Próximo: playtest das 3 aulas pelo usuário.** Commit ainda NÃO feito — aguarda o usuário.
| 10:57 | Session end: 8 writes across 3 files (paths.ts, index.ts, mundos.ts) | 2 reads | ~4940 tok |
| 10:58 | Session end: 8 writes across 3 files (paths.ts, index.ts, mundos.ts) | 2 reads | ~4940 tok |

## Session: 2026-07-15 09:31

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-15 09:28

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-14 08:48

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 10:16 | Created server/src/cenarios/gerar.ts | — | ~2732 |
| 10:16 | Edited server/package.json | 1→2 lines | ~22 |
| 10:16 | Edited package.json | 1→2 lines | ~25 |
| 10:17 | Edited server/src/cenarios/gerar.ts | modified constructor() | ~160 |
| 10:17 | Edited server/src/cenarios/gerar.ts | modified cmd() | ~119 |
| 10:17 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/1e53a721-e45d-4911-a026-f385f8f2c4e6/scratchpad/verificar.ts | — | ~1304 |
| 10:18 | Edited server/src/cenarios/gerar.ts | added 1 import(s) | ~45 |
| 10:18 | Edited server/src/cenarios/gerar.ts | 7→11 lines | ~123 |
| 10:45 | Created server/src/cenarios/verificar.ts | — | ~1231 |
| 10:45 | Edited server/src/cenarios/gerar.ts | added 1 import(s) | ~29 |
| 10:45 | Edited server/src/cenarios/gerar.ts | added 2 condition(s) | ~165 |
| 10:59 | Edited client/vite.config.ts | expanded (+7 lines) | ~82 |
| 11:00 | Created cenarios/README.md | — | ~1349 |
| 11:00 | Edited server/src/cenarios/verificar.ts | expanded (+9 lines) | ~52 |
| 11:01 | Edited server/src/cenarios/verificar.ts | added 5 condition(s) | ~482 |
| 11:01 | Edited server/src/cenarios/verificar.ts | 2→4 lines | ~43 |

## Sessão 2026-07-14 — cenários pedagógicos (fase de CONTEÚDO, pós-polimento)
| 12:00 | Decisões de abertura com o usuário | — | piloto 6º–9º; cenário 1 = sequência de lãs nas cabines; produção via SCRIPT GERADOR (.ljw regenerável, não versionado) | ~1k |
| 12:00 | Gerador de cenários | server/src/cenarios/gerar.ts | 3 aulas (sequência/binário/depurar) — digita os MESMOS comandos de chat do professor contra a GameSession real | ~4k |
| 12:00 | Conferência embutida | server/src/cenarios/verificar.ts | abre o .ljw num servidor novo, entra prof+2 alunos, completa a área do grupo 1; + geometria (faixa no chão, fora da cabine, dentro do chunk). Cenário que não fecha NÃO vira arquivo | ~3k |
| 12:00 | Roteiro de aula | cenarios/README.md | como gerar/hospedar/distribuir + gabarito e condução das 3 aulas + o que observar | ~2k |
| 12:00 | bug-172 (bloqueava o piloto) | client/vite.config.ts | Vite dev só atendia localhost → aluno na LAN não abria o cliente. host: true | ~200 |
| 12:00 | bug-173 / bug-174 | server/src/cenarios/gerar.ts | saída caía em server/cenarios/ (cwd do workspace); asserção pegava só a última fala do servidor | ~300 |
| 12:00 | Verificado | — | 137 testes ✅, typecheck 3/3 ✅, 3 .ljw gerados e conferidos; guarda de geometria testada NEGATIVAMENTE (reprova e não grava) | ~500 |
| 11:15 | Session end: 16 writes across 5 files (gerar.ts, package.json, verificar.ts, vite.config.ts, README.md) | 6 reads | ~28023 tok |
| 14:03 | Created server/src/paths.ts | — | ~158 |
| 14:03 | Edited server/src/index.ts | added 2 import(s) | ~112 |
| 14:04 | Edited server/src/index.ts | added 1 condition(s) | ~359 |
| 14:04 | Edited server/src/index.ts | modified saveNow() | ~77 |
| 14:31 | Created server/src/static.ts | — | ~1055 |
| 14:31 | Edited server/src/index.ts | 3→6 lines | ~78 |
| 14:31 | Edited server/src/index.ts | added 2 import(s) | ~51 |
| 14:31 | Edited server/src/index.ts | added 1 import(s) | ~28 |
| 14:31 | Edited server/src/index.ts | added nullish coalescing | ~258 |
| 15:10 | Edited shared/src/session.ts | 11→15 lines | ~142 |
| 15:11 | Edited shared/src/session.ts | expanded (+6 lines) | ~93 |
| 15:11 | Edited shared/src/session.ts | 3→4 lines | ~93 |
| 15:11 | Edited shared/src/session.ts | expanded (+6 lines) | ~95 |
| 15:11 | Edited shared/src/session.ts | 2→3 lines | ~87 |
| 15:17 | Edited shared/src/protocol.test.ts | 3→3 lines | ~44 |
| 16:03 | Edited shared/src/session.ts | parou() → admitir() | ~42 |
| 16:04 | Edited shared/src/session.ts | added optional chaining | ~1461 |
| 16:19 | Edited shared/src/session.ts | added optional chaining | ~17 |
| 16:19 | Edited server/src/index.ts | expanded (+6 lines) | ~153 |
| 16:19 | Edited server/src/index.ts | modified saveNow() | ~134 |
| 16:20 | Created server/src/mundos.ts | — | ~1534 |
| 16:20 | Edited server/src/index.ts | added 1 condition(s) | ~88 |
| 16:20 | Edited server/src/index.ts | added error handling | ~461 |
| 16:20 | Edited server/src/index.ts | added 1 import(s) | ~39 |
| 16:21 | Edited server/src/index.ts | modified gerarCodigo() | ~119 |
| 16:21 | Edited client/src/chunks.ts | modified trocarMundo() | ~134 |
| 16:21 | Edited client/src/main.ts | 2→4 lines | ~76 |
| 16:21 | Edited client/src/main.ts | added optional chaining | ~79 |
| 16:22 | Edited client/src/main.ts | added optional chaining | ~358 |
| 16:22 | Edited client/src/main.ts | 4→9 lines | ~87 |
| 16:23 | Created server/src/cenarios/_smoke-mundo.mjs | — | ~851 |
| 16:40 | Edited server/src/paths.ts | added 1 condition(s) | ~314 |

## Session: 2026-07-13 13:13

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 15:58 | Edited shared/src/physics.ts | 6→8 lines | ~68 |
| 15:58 | Edited shared/src/physics.ts | inline fix | ~27 |
| 15:58 | Edited shared/src/physics.ts | added 2 condition(s) | ~112 |
| 15:58 | Edited shared/src/mesher.ts | modified if() | ~128 |
| 15:58 | Edited client/index.html | 5→4 lines | ~40 |
| 15:58 | Edited client/index.html | 4→3 lines | ~30 |
| 15:59 | Edited client/index.html | 2→2 lines | ~51 |
| 15:59 | Edited client/src/menu.ts | modified buildConfigScreen() | ~253 |
| 15:59 | Edited client/src/menu.ts | added 1 condition(s) | ~254 |
| 15:59 | Edited client/src/menu.ts | 7→2 lines | ~20 |
| 15:59 | Edited client/src/menu.ts | 2→2 lines | ~22 |
| 15:59 | Edited client/src/main.ts | modified closest() | ~169 |
| 15:59 | Edited client/src/main.ts | added 2 condition(s) | ~130 |
| 15:59 | Edited client/src/main.ts | 3→5 lines | ~23 |
| 15:59 | Edited client/src/input.ts | added 1 condition(s) | ~71 |
| 16:00 | Edited shared/src/mesher.test.ts | 9→13 lines | ~200 |
| 16:00 | Edited shared/src/physics.test.ts | 4→5 lines | ~88 |
| 16:00 | Edited shared/src/physics.test.ts | expanded (+27 lines) | ~411 |
| 16:01 | Edited shared/src/physics.test.ts | 4→4 lines | ~75 |
| 16:00 | playtest cp15-cp18 do usuário: 4 achados corrigidos (sprint só engata no chão; face vidro↔folha; 1 só botão voltar na config; botão do meio copia bloco) | shared/physics.ts, shared/mesher.ts, client/menu.ts, client/main.ts, client/input.ts, client/index.html, 2 testes | 136 testes ✅ typecheck 3/3 ✅ build ✅ — re-playtest pendente | ~18k |
| 16:13 | Session end: 19 writes across 8 files (physics.ts, mesher.ts, index.html, menu.ts, main.ts) | 10 reads | ~27290 tok |
| 19:38 | Edited shared/src/physics.ts | 4→6 lines | ~110 |
| 19:38 | Edited shared/src/physics.test.ts | expanded (+20 lines) | ~300 |
| 19:38 | Edited shared/src/physics.test.ts | desengata() → toBe() | ~82 |
| 19:39 | Edited client/src/main.ts | 1→3 lines | ~63 |
| 19:40 | re-playtest: cp18/voltar/pick-block ✅; sprint refinado — Ctrl só ENGATA, corrida segue enquanto W apertado (MC), FOV segue player.sprinting | shared/physics.ts, client/main.ts, physics.test.ts | 137 testes ✅ typecheck 3/3 ✅ | ~6k |
| 19:39 | Session end: 23 writes across 8 files (physics.ts, mesher.ts, index.html, menu.ts, main.ts) | 10 reads | ~27961 tok |
| 19:43 | Session end: 23 writes across 8 files (physics.ts, mesher.ts, index.html, menu.ts, main.ts) | 10 reads | ~27961 tok |
| 19:43 | Session end: 23 writes across 8 files (physics.ts, mesher.ts, index.html, menu.ts, main.ts) | 10 reads | ~27961 tok |

## Session: 2026-07-13 11:21

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 11:47 | Edited shared/src/physics.ts | expanded (+6 lines) | ~144 |
| 11:47 | Edited shared/src/physics.ts | 7→11 lines | ~105 |
| 11:48 | Edited shared/src/physics.ts | added 2 condition(s) | ~417 |
| 11:48 | Edited shared/src/physics.ts | modified for() | ~91 |
| 11:48 | Edited shared/src/physics.test.ts | expanded (+43 lines) | ~656 |
| 11:49 | Edited shared/src/physics.test.ts | 3→5 lines | ~88 |
| 11:49 | Edited client/src/settings.ts | 3→3 lines | ~40 |
| 11:49 | Edited client/src/settings.ts | 2→4 lines | ~26 |
| 11:49 | Edited client/src/settings.ts | 2→4 lines | ~38 |
| 11:50 | Edited client/src/main.ts | added 3 condition(s) | ~390 |
| 11:50 | Edited client/src/main.ts | added 1 condition(s) | ~157 |
| 11:56 | Edited client/index.html | 2→3 lines | ~58 |
| 11:56 | cp15: corrida (Ctrl/2×W) + agachar Shift com edge-guard MC na física compartilhada; teclas rebindáveis novas; FOV kick + olho abaixa; 5 testes novos | shared/physics.ts, physics.test.ts, client/settings.ts, main.ts, index.html | 133 testes, typecheck 3/3, build ok, screenshot boot ok | ~9k |
| 11:59 | Edited shared/src/mesher.ts | added optional chaining | ~61 |
| 11:59 | Created client/src/blockIcons.ts | — | ~270 |
| 12:00 | Created client/src/inventory.ts | — | ~1150 |
| 12:00 | Edited client/src/settings.ts | 3→3 lines | ~45 |
| 12:00 | Edited client/src/settings.ts | 4→5 lines | ~21 |
| 12:00 | Edited client/src/settings.ts | 2→3 lines | ~28 |
| 12:01 | Edited client/index.html | 2→3 lines | ~33 |
| 12:01 | Edited client/index.html | 4→5 lines | ~26 |
| 12:01 | Edited client/index.html | modified not() | ~121 |
| 12:01 | Edited client/index.html | expanded (+96 lines) | ~649 |
| 12:01 | Edited client/index.html | 1→2 lines | ~23 |
| 12:01 | Edited client/src/main.ts | added 2 import(s) | ~70 |
| 12:01 | Edited client/src/main.ts | 3→5 lines | ~86 |
| 12:02 | Edited client/src/main.ts | 4→4 lines | ~42 |
| 12:02 | Edited client/src/main.ts | modified for() | ~51 |
| 12:02 | Edited client/src/main.ts | added error handling | ~930 |
| 12:03 | Edited client/src/main.ts | 11→11 lines | ~81 |
| 12:03 | Edited client/src/main.ts | modified if() | ~78 |
| 12:03 | Edited client/src/main.ts | added 1 condition(s) | ~46 |
| 12:42 | cp16: inventário (tecla E, grid de colocáveis com ícones do atlas) + hotbar 9 slots configuráveis com persistência localStorage lj-hotbar | client/inventory.ts, blockIcons.ts, main.ts, settings.ts, index.html, shared/mesher.ts | 133 testes, typecheck 3/3, build ok, screenshot ?inv ok | ~12k |
| 12:39 | Edited shared/src/blocks.ts | modified cp17() | ~126 |
| 12:39 | Edited shared/src/mesher.ts | expanded (+9 lines) | ~53 |
| 12:39 | Edited shared/src/mesher.ts | expanded (+8 lines) | ~134 |
| 12:40 | Edited client/src/atlasTexture.ts | added 2 condition(s) | ~406 |
| 12:40 | Edited client/src/atlasTexture.ts | modified cp17() | ~204 |
| 12:40 | Edited client/src/blocksUi.ts | expanded (+8 lines) | ~136 |
| 12:42 | Edited shared/src/blocks.ts | modified isTransparentBlock() | ~181 |
| 12:42 | Edited shared/src/mesher.ts | 5→8 lines | ~37 |
| 12:42 | Edited shared/src/mesher.ts | 5→7 lines | ~78 |
| 12:42 | Edited shared/src/mesher.ts | added 1 condition(s) | ~107 |
| 12:42 | Edited shared/src/mesher.ts | 2→2 lines | ~28 |
| 12:43 | Edited client/src/atlasTexture.ts | added 1 condition(s) | ~335 |
| 12:43 | Edited client/src/atlasTexture.ts | 2→6 lines | ~69 |
| 12:43 | Edited client/src/main.ts | modified transparentes() | ~74 |
| 12:43 | Edited client/src/blocksUi.ts | 3→5 lines | ~54 |
| 12:43 | Edited shared/src/mesher.test.ts | expanded (+20 lines) | ~263 |
| 12:59 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/3962ee9a-001c-4ba8-abf3-6b384e5cba47/scratchpad/cp18-smoke.mts | — | ~703 |
| 13:05 | cp17: 8 opacos novos (arenito, pedra-lavrada, neve, obsidiana, 4 lãs — IDs 19-26, tiles 20-27) | shared/blocks.ts, mesher.ts, client/atlasTexture.ts, blocksUi.ts | 133 testes, screenshot atlas+inventário ok | ~5k |
| 13:20 | cp18: vidro+folhas (IDs 27-28) via CUTOUT alphaTest; regra de visibilidade do mesher p/ transparentes; 2 testes novos | shared/blocks.ts, mesher.ts, mesher.test.ts, client/atlasTexture.ts, main.ts, blocksUi.ts | 135 testes, smoke 21/21, screenshot vidro ok | ~7k |
| 13:25 | Sessão: fase de polimento cp15-cp18 completa (código); STATUS/cerebrum atualizados; playtest do usuário pendente nos 4 cps | .wolf/* | wrap-up | ~2k |
| 13:06 | Session end: 48 writes across 13 files (physics.ts, physics.test.ts, settings.ts, main.ts, index.html) | 18 reads | ~36078 tok |
| 13:07 | Session end: 48 writes across 13 files (physics.ts, physics.test.ts, settings.ts, main.ts, index.html) | 18 reads | ~36078 tok |

## Session: 2026-07-13 23:37

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 23:42 | Edited shared/src/worldgen.ts | modified parseWorldPreset() | ~145 |
| 23:43 | Edited shared/src/worldgen.ts | added 2 condition(s) | ~610 |
| 23:43 | Edited shared/src/protocol.ts | added 1 import(s) | ~62 |
| 23:43 | Edited shared/src/protocol.ts | modified jogador() | ~167 |
| 23:43 | Edited shared/src/protocol.ts | 5→8 lines | ~97 |
| 23:43 | Edited shared/src/session.ts | added 1 import(s) | ~60 |
| 23:43 | Edited shared/src/session.ts | 7→8 lines | ~41 |
| 23:43 | Edited shared/src/session.ts | 3→2 lines | ~48 |
| 23:43 | Edited shared/src/session.ts | modified NOVO() | ~87 |
| 23:44 | Edited shared/src/session.ts | 13→15 lines | ~186 |
| 23:44 | Edited shared/src/session.ts | modified sendGroup() | ~277 |
| 23:44 | Edited shared/src/session.ts | added 1 condition(s) | ~243 |
| 23:44 | Edited shared/src/session.ts | modified for() | ~80 |
| 23:44 | Edited shared/src/session.ts | 5→6 lines | ~76 |
| 23:44 | Edited shared/src/session.ts | 5→6 lines | ~78 |
| 23:44 | Edited shared/src/session.ts | added 5 condition(s) | ~484 |
| 23:44 | Edited shared/src/session.ts | 5→5 lines | ~68 |
| 23:45 | Edited server/src/worker.ts | 7→9 lines | ~44 |
| 23:45 | Edited server/src/worker.ts | modified startSession() | ~175 |
| 23:45 | Edited server/src/worker.ts | modified if() | ~151 |
| 23:45 | Edited server/src/index.ts | 7→8 lines | ~38 |
| 23:45 | Edited server/src/index.ts | modified NOVO() | ~101 |
| 23:45 | Edited client/src/connection.ts | modified init() | ~103 |
| 23:45 | Edited client/src/settings.ts | 2→3 lines | ~34 |
| 23:45 | Edited client/src/settings.ts | 5→6 lines | ~24 |
| 23:45 | Edited client/src/settings.ts | 4→5 lines | ~45 |
| 23:45 | Created client/src/blocksUi.ts | — | ~315 |
| 23:50 | Created client/src/panels.ts | — | ~5674 |
| 23:50 | Edited client/index.html | modified not() | ~722 |
| 23:50 | Edited client/index.html | plano() → colinas() | ~92 |
| 23:50 | Edited client/index.html | 4→4 lines | ~57 |
| 23:50 | Edited client/index.html | 2→3 lines | ~31 |
| 23:50 | Edited client/index.html | expanded (+13 lines) | ~108 |
| 23:50 | Edited client/src/menu.ts | added 1 import(s) | ~33 |
| 23:50 | Edited client/src/menu.ts | PLANO() → NOVO() | ~82 |
| 23:50 | Edited client/src/menu.ts | modified if() | ~162 |
| 23:51 | Edited client/src/objectivesUi.ts | 5→7 lines | ~67 |
| 23:51 | Edited client/src/objectivesUi.ts | "⚠ entre num grupo pra par" → "⚠ entre num grupo pra par" | ~32 |
| 23:51 | Edited client/src/main.ts | added 2 import(s) | ~328 |
| 23:51 | Edited client/src/main.ts | added nullish coalescing | ~142 |
| 23:51 | Edited client/src/main.ts | added optional chaining | ~228 |
| 23:51 | Edited client/src/main.ts | 7→8 lines | ~77 |
| 23:51 | Edited client/src/main.ts | added 1 condition(s) | ~194 |
| 23:52 | Edited client/src/main.ts | 4→4 lines | ~66 |
| 23:52 | Edited client/src/main.ts | removed 22 lines | ~42 |
| 23:52 | Edited client/src/main.ts | modified for() | ~59 |
| 23:52 | Edited client/src/main.ts | added optional chaining | ~333 |
| 23:52 | Edited client/src/main.ts | 2→2 lines | ~16 |
| 23:52 | Edited client/src/main.ts | added optional chaining | ~64 |
| 23:53 | Created shared/src/cp14.test.ts | — | ~1998 |
| 23:54 | Edited shared/src/cp14.test.ts | inline fix | ~20 |
| 23:55 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/3c79478b-bfb0-42c1-b3ad-9f5b5f6ef74e/scratchpad/cp14-smoke.mts | — | ~1071 |
| 23:57 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/3c79478b-bfb0-42c1-b3ad-9f5b5f6ef74e/scratchpad/cp14-smoke.mts | 3→3 lines | ~36 |
| 23:58 | Edited client/src/main.ts | 2→6 lines | ~80 |
| 23:59 | Edited client/src/main.ts | 5→3 lines | ~46 |
| 07:18 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/3c79478b-bfb0-42c1-b3ad-9f5b5f6ef74e/scratchpad/cp14-restore-check.mts | — | ~667 |
| 07:18 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/3c79478b-bfb0-42c1-b3ad-9f5b5f6ef74e/scratchpad/cp14-restore-check.mts | "../../../../../home/meket" → "/home/meketreve/logica-em" | ~27 |

## Sessão 2026-07-13 — cp14: painéis HTML + mundo cabines

| 10:00 | cp14 shared: msg groups, /objetivo texto+mover, WorldPreset+generateCabinsWorld, SessionOptions.preset | shared/src/{protocol,session,worldgen}.ts | ok | ~9k |
| 10:15 | hosts: worker init preset; Node LJ_PRESET | server/src/{worker,index}.ts | ok | ~2k |
| 10:30 | cliente: panels.ts (AuthorPanel+GroupPanel), blocksUi.ts, tecla P, select tipo de mundo, ?painel | client/src/{panels,blocksUi,main,menu,settings,connection,objectivesUi}.ts, index.html | ok | ~14k |
| 10:45 | pedido do usuário mid-sessão: botão de tipo de mundo na criação → select colinas/plano/cabines | client/index.html, menu.ts | ok | ~1k |
| 11:00 | testes cp14.test.ts (9) — 129 passando, typecheck 3/3, build ok | shared/src/cp14.test.ts | ok | ~4k |
| 11:20 | bug-151: TDZ activePanel (updateOverlay no boot) — tela cinza; declaração movida pro topo | client/src/main.ts | corrigido+logado | ~2k |
| 11:30 | smoke real 10/10 (porta 8091, preset cabines): groups broadcast, trocar grupo, texto/mover, spawn deslocado | scratchpad/cp14-smoke.mts | ok | ~3k |
| 11:40 | screenshots headless: painel autoria (professor) e painel grupo (aluno), cabines no fundo | scratchpad/cp14-{prof,aluno}.png | ok | ~5k |
| 11:50 | critério 4 MVP v2: save do host A reaberto no host B (8092) — 8/8 intacto (papel/regiões/ordem/texto/grupos/cabines) | scratchpad/cp14-restore-check.mts | ok | ~2k |
| 12:00 | STATUS/cerebrum/buglog atualizados; próxima quest = playtest do cp14 | .wolf/* | ok | ~3k |
| 08:58 | Session end: 57 writes across 16 files (worldgen.ts, protocol.ts, session.ts, worker.ts, index.ts) | 20 reads | ~62440 tok |
| 12:30 | playtest do usuário ✅ "testado" — cp14 FECHADO, MVP v2 COMPLETO (4 critérios jogados); STATUS aponta entrevista da próxima fase | .wolf/STATUS.md | ok | ~1k |
| 11:03 | Session end: 57 writes across 16 files (worldgen.ts, protocol.ts, session.ts, worker.ts, index.ts) | 20 reads | ~62440 tok |

## Session: 2026-07-12 19:43

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 20:01 | Entrevista de escopo MVP v2 (cenários/autoria) — 7 respostas do usuário, decisões travadas em STATUS+cerebrum; faltam 3 perguntas de grupos | .wolf/STATUS.md, .wolf/cerebrum.md | ok | ~1k |
| 20:10 | 2ª rodada da entrevista MVP v2: grupos auto-distribuídos, carimbo de áreas, mundo cabines, mundos predefinidos aprovados; plano cp11-cp14 proposto | .wolf/STATUS.md, .wolf/cerebrum.md | ok | ~1k |
| 20:35 | Created shared/src/regions.ts | — | ~702 |
| 20:35 | Edited shared/src/protocol.ts | added 2 import(s) | ~61 |
| 20:35 | Edited shared/src/protocol.ts | modified professor() | ~159 |
| 20:35 | Edited shared/src/protocol.ts | modified jogador() | ~157 |
| 20:35 | Edited shared/src/protocol.ts | added 2 condition(s) | ~161 |
| 20:36 | Edited shared/src/protocol.ts | added 2 condition(s) | ~238 |
| 20:36 | Edited shared/src/save.ts | added 1 import(s) | ~57 |
| 20:36 | Edited shared/src/save.ts | 4→6 lines | ~72 |
| 20:36 | Edited shared/src/save.ts | added 2 condition(s) | ~193 |
| 20:36 | Edited shared/src/session.ts | expanded (+8 lines) | ~74 |
| 20:36 | Edited shared/src/session.ts | 2→6 lines | ~125 |
| 20:36 | Edited shared/src/session.ts | modified if() | ~68 |
| 20:36 | Edited shared/src/session.ts | 3→4 lines | ~41 |
| 20:36 | Edited shared/src/session.ts | 6→7 lines | ~105 |
| 20:36 | Edited shared/src/session.ts | added 1 condition(s) | ~123 |
| 20:36 | Edited shared/src/session.ts | added nullish coalescing | ~253 |
| 20:37 | Edited shared/src/session.ts | added 10 condition(s) | ~947 |
| 20:37 | Edited shared/src/session.ts | modified handleDisconnect() | ~53 |
| 20:37 | Edited shared/src/index.ts | 2→3 lines | ~23 |
| 20:38 | Created shared/src/regions.test.ts | — | ~2316 |
| 20:38 | Edited shared/src/session.test.ts | 3→4 lines | ~61 |
| 20:39 | Created client/src/regions.ts | — | ~625 |
| 20:39 | Created client/src/audio.ts | — | ~890 |
| 20:39 | Edited client/src/settings.ts | existe() → INTERFACE() | ~55 |
| 20:39 | Edited client/src/settings.ts | 2→2 lines | ~26 |
| 20:39 | Edited client/src/settings.ts | 5→6 lines | ~24 |
| 20:39 | Edited client/src/settings.ts | 4→5 lines | ~34 |
| 20:39 | Edited client/src/menu.ts | added 1 import(s) | ~51 |
| 20:39 | Edited client/src/menu.ts | added 1 condition(s) | ~98 |
| 20:39 | Edited client/src/menu.ts | modified slider() | ~61 |
| 20:39 | Edited client/src/menu.ts | 3→4 lines | ~24 |
| 20:39 | Edited client/src/menu.ts | 13→13 lines | ~121 |
| 20:40 | Edited client/src/main.ts | added 2 import(s) | ~250 |
| 20:40 | Edited client/src/main.ts | modified applySettings() | ~103 |
| 20:40 | Edited client/src/main.ts | 4→9 lines | ~138 |
| 20:40 | Edited client/src/main.ts | added nullish coalescing | ~188 |
| 20:40 | Edited client/src/main.ts | modified nomeadas() | ~121 |
| 20:40 | Edited client/src/main.ts | added 2 condition(s) | ~252 |
| 20:40 | Edited client/src/main.ts | added 2 condition(s) | ~293 |
| 20:40 | Edited client/src/main.ts | 2→2 lines | ~16 |
| 20:41 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/c40a8d44-8352-4fa5-b8e1-1e1eddf552e9/scratchpad/make-region-save.mts | — | ~332 |
| 20:50 | cp11 implementado (varinha+regiões: shared/regions.ts, protocolo wand_mark/regions/spawn.papel, /regiao, persistência) + áudio de UI (client/audio.ts); 95 testes, typecheck 3/3, build ok, screenshot e2e ✅; servidor 8091 + vite 5173 DEIXADOS rodando pro playtest | shared/*, client/*, .wolf/* | ok | ~30k |
| 20:51 | Session end: 41 writes across 12 files (regions.ts, protocol.ts, save.ts, session.ts, index.ts) | 11 reads | ~39357 tok |
| 21:29 | Edited client/index.html | 8→9 lines | ~86 |
| 21:30 | Edited shared/src/session.ts | 6→7 lines | ~98 |
| 21:30 | Edited shared/src/regions.test.ts | added optional chaining | ~184 |
| 21:30 | /regiao lista 1 região/linha (join \n + white-space:pre-line no .msg); todos os servidores fechados a pedido (8080 era dev:server de sessão antiga, ~6h) | session.ts, index.html, regions.test.ts | ok | ~3k |
| 21:30 | Session end: 44 writes across 13 files (regions.ts, protocol.ts, save.ts, session.ts, index.ts) | 13 reads | ~43052 tok |
| 21:38 | Session end: 44 writes across 13 files (regions.ts, protocol.ts, save.ts, session.ts, index.ts) | 13 reads | ~43052 tok |
| 21:49 | Created shared/src/scenario.ts | — | ~2227 |
| 21:49 | Edited shared/src/regions.ts | modified parseVec3i() | ~304 |
| 21:49 | Edited shared/src/worldgen.ts | modified generateWorld() | ~334 |
| 21:49 | Edited shared/src/protocol.ts | added 1 import(s) | ~87 |
| 21:49 | Edited shared/src/protocol.ts | modified recebem() | ~104 |
| 21:49 | Edited shared/src/protocol.ts | added 3 condition(s) | ~212 |
| 21:49 | Edited shared/src/save.ts | added 1 import(s) | ~76 |
| 21:49 | Edited shared/src/save.ts | 3→5 lines | ~57 |
| 21:49 | Edited shared/src/save.ts | added optional chaining | ~51 |
| 21:49 | Edited shared/src/save.ts | 2→4 lines | ~75 |
| 21:49 | Edited shared/src/index.ts | 2→3 lines | ~23 |
| 21:50 | Edited shared/src/session.ts | expanded (+13 lines) | ~138 |
| 21:50 | Edited shared/src/regions.ts | modified regionContains() | ~56 |
| 21:50 | Edited shared/src/session.ts | 8→9 lines | ~43 |
| 21:50 | Edited shared/src/session.ts | 6→5 lines | ~23 |
| 21:50 | Edited shared/src/session.ts | modified generateFlatWorld() | ~60 |
| 21:50 | Edited shared/src/session.ts | modified rio() | ~258 |
| 21:50 | Edited shared/src/session.ts | 2→4 lines | ~37 |
| 21:50 | Edited shared/src/session.ts | added 2 condition(s) | ~135 |
| 21:50 | Edited shared/src/session.ts | expanded (+9 lines) | ~116 |
| 21:51 | Edited shared/src/session.ts | added 1 condition(s) | ~163 |
| 21:51 | Edited shared/src/session.ts | 10→12 lines | ~135 |
| 21:51 | Edited shared/src/session.ts | added 2 condition(s) | ~182 |
| 21:51 | Edited shared/src/session.ts | added 3 condition(s) | ~289 |
| 21:51 | Edited shared/src/session.ts | added 1 condition(s) | ~118 |
| 21:51 | Edited shared/src/session.ts | added 6 condition(s) | ~505 |
| 21:52 | Edited shared/src/session.ts | added nullish coalescing | ~2562 |
| 21:52 | Edited shared/src/session.ts | modified completeObjetivo() | ~131 |
| 21:52 | Edited shared/src/session.ts | modified broadcastObjectives() | ~164 |
| 21:53 | Edited server/src/worker.ts | modified startSession() | ~349 |
| 21:53 | Edited server/src/index.ts | expanded (+7 lines) | ~59 |
| 21:54 | Created shared/src/scenario.test.ts | — | ~3639 |
| 21:54 | Edited shared/src/scenario.test.ts | 3→3 lines | ~45 |
| 21:54 | Edited shared/src/scenario.test.ts | 10→7 lines | ~104 |
| 21:55 | Edited shared/src/scenario.test.ts | 7→8 lines | ~138 |
| 21:56 | Edited client/src/connection.ts | modified init() | ~104 |
| 21:56 | Edited client/src/menu.ts | 7→9 lines | ~79 |
| 21:56 | Edited client/src/menu.ts | 5→9 lines | ~126 |
| 21:56 | Edited client/src/events.ts | 4→5 lines | ~47 |
| 21:56 | Edited client/src/audio.ts | added 2 condition(s) | ~204 |
| 21:56 | Edited client/src/regions.ts | 2→7 lines | ~74 |
| 21:56 | Edited client/src/regions.ts | added nullish coalescing | ~44 |
| 21:56 | Created client/src/objectivesUi.ts | — | ~561 |
| 21:57 | Edited client/index.html | expanded (+30 lines) | ~226 |
| 21:57 | Edited client/index.html | 1→2 lines | ~19 |
| 21:57 | Edited client/src/main.ts | 16→18 lines | ~86 |
| 21:57 | Edited client/src/main.ts | added 1 import(s) | ~51 |
| 21:57 | Edited client/src/main.ts | modified rio() | ~203 |
| 21:57 | Edited client/src/main.ts | added 4 condition(s) | ~204 |
| 21:57 | Edited client/src/main.ts | 9→9 lines | ~105 |
| 21:57 | Edited client/src/main.ts | added 1 condition(s) | ~235 |
| 21:58 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/c40a8d44-8352-4fa5-b8e1-1e1eddf552e9/scratchpad/make-scenario-save.mts | — | ~453 |
| 22:04 | cp12 implementado: scenario.ts (objetivos construir/chegar/limpar, gabarito modelo≠alvo, detecção via dirty no tick), /objetivo + /regiao encher, msg objectives, painel HUD + caixas verdes, mundo plano (worker ?flat, LJ_PLANO); 110 testes, typecheck 3/3, build ok, screenshot aluno e2e ✅; processos meus fechados | shared/scenario.ts, session.ts, protocol.ts, save.ts, worldgen.ts, client/objectivesUi.ts, main.ts, menu.ts, index.html, server/* | ok | ~35k |
| 22:04 | Session end: 96 writes across 21 files (regions.ts, protocol.ts, save.ts, session.ts, index.ts) | 19 reads | ~62818 tok |
| 22:53 | Edited client/index.html | canvas() → pausa() | ~250 |
| 22:53 | Edited client/index.html | expanded (+7 lines) | ~125 |
| 22:53 | Edited client/index.html | expanded (+10 lines) | ~212 |
| 22:53 | Edited client/index.html | 3→4 lines | ~65 |
| 22:53 | Edited client/index.html | expanded (+8 lines) | ~155 |
| 22:53 | Edited client/index.html | 3→4 lines | ~57 |
| 22:53 | Edited client/src/menu.ts | added optional chaining | ~156 |
| 22:54 | Edited client/src/menu.ts | added 1 condition(s) | ~166 |
| 22:54 | Edited client/src/menu.ts | modified if() | ~203 |
| 22:54 | Edited client/src/menu.ts | modified if() | ~157 |
| 22:54 | Edited client/src/menu.ts | 9→13 lines | ~102 |
| 22:54 | Edited client/src/menu.ts | 19→20 lines | ~222 |
| 22:54 | Edited client/src/menu.ts | added optional chaining | ~127 |
| 22:54 | Edited client/src/menu.ts | added optional chaining | ~88 |
| 22:54 | Edited client/src/input.ts | added 2 condition(s) | ~133 |
| 22:54 | Edited client/src/main.ts | expanded (+6 lines) | ~34 |
| 22:54 | Edited client/src/main.ts | added 3 condition(s) | ~555 |
| 22:55 | Edited client/src/main.ts | modified if() | ~131 |
| 22:55 | Edited client/src/main.ts | 7→8 lines | ~81 |
| 23:03 | Polimento UI pós-cp12: zero popups nativos (UI inline + sessionStorage p/ join_denied), mira some sem pointer lock, menu Esc real com config compartilhada aplicando ao vivo (Input.rebind) | index.html, menu.ts, main.ts, input.ts | ok | ~12k |
| 23:03 | Session end: 115 writes across 22 files (regions.ts, protocol.ts, save.ts, session.ts, index.ts) | 20 reads | ~66115 tok |
| 23:10 | Edited client/src/menu.ts | added nullish coalescing | ~1591 |
| 23:12 | Created shared/src/groups.ts | — | ~280 |
| 23:13 | Edited shared/src/scenario.ts | expanded (+24 lines) | ~448 |
| 23:13 | Edited shared/src/scenario.ts | 3→5 lines | ~60 |
| 23:13 | Edited shared/src/scenario.ts | added 2 condition(s) | ~121 |
| 23:13 | Edited shared/src/scenario.ts | added 3 condition(s) | ~427 |
| 23:13 | Edited shared/src/scenario.ts | added 3 condition(s) | ~273 |
| 23:13 | Edited shared/src/scenario.ts | added 4 condition(s) | ~439 |
| 23:13 | Edited shared/src/protocol.ts | modified jogador() | ~104 |
| 23:13 | Edited shared/src/protocol.ts | added 1 condition(s) | ~72 |
| 23:13 | Edited shared/src/save.ts | added 1 import(s) | ~92 |
| 23:13 | Edited shared/src/save.ts | 3→5 lines | ~56 |
| 23:13 | Edited shared/src/save.ts | 2→3 lines | ~49 |
| 23:14 | Edited shared/src/save.ts | 4→5 lines | ~42 |
| 23:14 | Edited shared/src/index.ts | 2→3 lines | ~23 |
| 23:14 | Edited shared/src/session.ts | 12→15 lines | ~84 |
| 23:14 | Edited shared/src/session.ts | modified Grupos() | ~192 |
| 23:14 | Edited shared/src/session.ts | added nullish coalescing | ~191 |
| 23:14 | Edited shared/src/session.ts | added nullish coalescing | ~305 |
| 23:14 | Edited shared/src/session.ts | added 3 condition(s) | ~332 |
| 23:14 | Edited shared/src/session.ts | 4→4 lines | ~37 |
| 23:14 | Edited shared/src/session.ts | added 2 condition(s) | ~198 |
| 23:15 | Edited shared/src/session.ts | added 1 condition(s) | ~236 |
| 23:15 | Edited shared/src/session.ts | added optional chaining | ~2646 |
| 23:16 | Edited shared/src/session.ts | modified broadcastObjectives() | ~63 |
| 23:16 | Edited shared/src/session.ts | 8→10 lines | ~98 |
| 23:17 | Edited shared/src/session.ts | added optional chaining | ~1765 |
| 23:17 | Edited shared/src/session.ts | modified if() | ~245 |
| 23:17 | Edited shared/src/session.ts | added 2 condition(s) | ~210 |
| 23:17 | Edited shared/src/session.ts | 8→9 lines | ~124 |
| 23:17 | Edited shared/src/session.ts | added nullish coalescing | ~943 |
| 23:18 | Edited shared/src/session.ts | 2→2 lines | ~50 |
| 23:19 | Created shared/src/groups.test.ts | — | ~2752 |
| 23:19 | Edited shared/src/groups.test.ts | 4→4 lines | ~56 |
| 23:20 | Created client/src/objectivesUi.ts | — | ~1218 |
| 23:20 | Edited client/src/objectivesUi.ts | 5→4 lines | ~39 |
| 23:21 | Edited client/src/main.ts | added optional chaining | ~436 |
| 23:21 | Edited client/src/main.ts | modified if() | ~115 |
| 23:21 | Edited client/src/main.ts | added 4 condition(s) | ~356 |
| 23:22 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/c40a8d44-8352-4fa5-b8e1-1e1eddf552e9/scratchpad/make-groups-save.mts | — | ~537 |
| 23:25 | cp13 implementado: groups.ts, /grupo (2 sintaxes, round-robin, menor grupo), progresso por grupo (completosGrupo, sequencial por grupo), /regiao carimbar, /objetivo per-grupo via prefixo, chegar todos/um, HUD porGrupo (aluno=seu grupo, prof=resumo), config em categorias; 120 testes, screenshots prof+aluno ✅ | shared/groups.ts, scenario.ts, session.ts, protocol.ts, save.ts, client/* | ok | ~45k |
| 23:26 | Session end: 155 writes across 25 files (regions.ts, protocol.ts, save.ts, session.ts, index.ts) | 22 reads | ~83458 tok |
| 23:36 | WRAP-UP da sessão: cp11 (varinha+regiões+áudio UI), cp12 (objetivos+detecção+HUD+mundo plano), cp13 (grupos+carimbo+per-grupo) TODOS fechados com playtest; polimento UI (sem popups, mira, menu Esc, config em categorias); rename cancelado; próxima quest cp14 (painéis HTML) | .wolf/STATUS.md | ok | sessão ~140k |
| 23:37 | Session end: 155 writes across 25 files (regions.ts, protocol.ts, save.ts, session.ts, index.ts) | 22 reads | ~83458 tok |

## Session: 2026-07-12 15:21

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Sessão 2026-07-12 (tarde) — playtest cp9 → MVP v1 FECHADO
| 17:50 | Subi servidores p/ playtest cp9; npm via background morreu (exit 143, log vazio) → tsx direto ok; Vite pulou p/ 5174 | server.log, cerebrum | ok | ~15k |
| 18:00 | Playtest do usuário ✅ "tudo rodou" — critério 4 atendido, MVP v1 FECHADO; cp10 adiado (sem gatilho) | .wolf/STATUS.md | ok | ~5k |
| 18:05 | Wrap-up: STATUS (quest → MVP v2 cenários/autoria), cerebrum Do-Not-Repeat (npm background), buglog-099 | .wolf/* | ok | ~5k |

## Session: 2026-07-12 11:06

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 11:14 | Created shared/src/auth.ts | — | ~504 |
| 11:14 | Edited shared/src/protocol.ts | expanded (+12 lines) | ~143 |
| 11:14 | Edited shared/src/protocol.ts | expanded (+9 lines) | ~129 |
| 11:14 | Edited shared/src/protocol.ts | added 2 condition(s) | ~151 |
| 11:14 | Edited shared/src/protocol.ts | added 1 condition(s) | ~90 |
| 11:15 | Edited shared/src/save.ts | added 1 import(s) | ~39 |
| 11:15 | Edited shared/src/save.ts | expanded (+7 lines) | ~226 |
| 11:15 | Edited shared/src/save.ts | 10→13 lines | ~199 |
| 11:15 | Edited shared/src/save.ts | 9→10 lines | ~104 |
| 11:15 | Edited shared/src/session.ts | expanded (+7 lines) | ~51 |
| 11:15 | Edited shared/src/session.ts | modified singleplayer() | ~289 |
| 11:16 | Edited shared/src/session.ts | expanded (+9 lines) | ~258 |
| 11:16 | Edited shared/src/session.ts | added optional chaining | ~262 |
| 11:16 | Edited shared/src/session.ts | added optional chaining | ~839 |
| 11:16 | Edited shared/src/session.ts | added 2 condition(s) | ~308 |
| 11:17 | Edited shared/src/session.ts | 4→5 lines | ~61 |
| 11:17 | Edited shared/src/session.ts | 5→5 lines | ~58 |
| 11:17 | Edited shared/src/session.ts | added optional chaining | ~583 |
| 11:17 | Edited shared/src/index.ts | 1→2 lines | ~14 |
| 11:17 | Edited server/src/worker.ts | modified tico() | ~40 |
| 11:17 | Edited server/src/index.ts | added 1 import(s) | ~86 |
| 11:18 | Edited server/src/index.ts | added optional chaining | ~361 |
| 11:18 | Edited client/index.html | 1→2 lines | ~22 |
| 11:18 | Edited client/index.html | expanded (+8 lines) | ~243 |
| 11:18 | Edited client/index.html | inline fix | ~23 |
| 11:18 | Edited client/src/menu.ts | modified onPlayWorld() | ~110 |
| 11:18 | Edited client/src/menu.ts | added 1 condition(s) | ~264 |
| 11:18 | Edited client/src/main.ts | inline fix | ~25 |
| 11:18 | Edited client/src/main.ts | added 1 condition(s) | ~112 |
| 11:19 | Edited client/src/main.ts | added optional chaining | ~262 |
| 11:19 | Edited client/src/main.ts | added nullish coalescing | ~102 |
| 11:19 | Edited client/src/main.ts | 2→2 lines | ~15 |
| 11:19 | Edited shared/src/session.test.ts | inline fix | ~19 |
| 11:19 | Edited shared/src/session.test.ts | inline fix | ~17 |
| 11:19 | Edited shared/src/session.test.ts | inline fix | ~20 |
| 11:19 | Edited shared/src/session.test.ts | inline fix | ~23 |
| 11:19 | Edited shared/src/session.test.ts | inline fix | ~21 |
| 11:20 | Edited shared/src/session.test.ts | added 1 import(s) | ~34 |
| 11:20 | Edited shared/src/session.test.ts | 1→3 lines | ~51 |
| 12:04 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/4f89a4f0-8ef8-406e-8a21-9868f1120f83/scratchpad/pin-smoke.mts | — | ~1971 |
| 12:24 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/4f89a4f0-8ef8-406e-8a21-9868f1120f83/scratchpad/pin-smoke.mts | modified direto() | ~59 |
| 12:24 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/4f89a4f0-8ef8-406e-8a21-9868f1120f83/scratchpad/pin-smoke.mts | modified stopServer() | ~83 |
| 12:25 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/4f89a4f0-8ef8-406e-8a21-9868f1120f83/scratchpad/pin-smoke.mts | 11→7 lines | ~103 |
| 12:00 | cp9: auth.ts novo (hash síncrono FNV-1a, isValidPin), protocolo join+pin/codigo e join_denied, save com pinHash/papel/codigoHash | shared/src/{auth,protocol,save}.ts | ok | ~9k |
| 12:05 | cp9: GameSession — identity separada do roster, join estrito default, rate-limit por nome + global de código, /bloco e /resetpin gated, singleplayer=professor sem persistir papel | shared/src/session.ts | ok | ~6k |
| 12:10 | cp9: LJ_CODIGO no host Node (gera+imprime se ausente), worker singleplayer:true, menu com campos PIN/código, main com auth no join e handler de join_denied | server/src/{index,worker}.ts client/{index.html,src/{menu,main}.ts} | ok | ~5k |
| 12:15 | 15 testes novos (auth, protocolo, save, sessão cp9); mecânica antiga movida pra singleplayer:true; typecheck 3/3, 83 testes, build ok | shared/src/*.test.ts | ok | ~7k |
| 12:30 | smoke real 2 fases: PIN/nome-em-uso/gating/código/resetpin + persistência pós-reboot — 12/12 ✅; screenshot headless do join com PIN ok | scratchpad/pin-smoke.mts | ok | ~8k |
| 12:35 | bug-092 enriquecido (npx engole SIGTERM no smoke) + bug-093 (alert trava screenshot headless); cerebrum atualizado (learnings + 3 decisões cp9) | .wolf/{buglog.json,cerebrum.md} | ok | ~2k |
| 13:52 | Session end: 43 writes across 11 files (auth.ts, protocol.ts, save.ts, session.ts, index.ts) | 15 reads | ~34725 tok |
| 14:36 | Created shared/src/auth.ts | — | ~255 |
| 14:36 | Edited shared/src/save.ts | 4→4 lines | ~45 |
| 14:36 | Edited shared/src/save.ts | 3→3 lines | ~66 |
| 14:36 | Edited shared/src/save.ts | "codigoHash" → "codigo" | ~21 |
| 14:37 | Edited shared/src/save.ts | 3→3 lines | ~39 |
| 14:37 | Edited shared/src/session.ts | reduced (-6 lines) | ~24 |
| 14:37 | Edited shared/src/session.ts | professor() → puro() | ~46 |
| 14:37 | Edited shared/src/session.ts | 5→5 lines | ~39 |
| 14:37 | Edited shared/src/session.ts | 5→5 lines | ~54 |
| 14:37 | Edited shared/src/session.ts | 2→2 lines | ~31 |
| 14:37 | Edited shared/src/session.ts | modified if() | ~85 |
| 14:37 | Edited shared/src/session.ts | 13→13 lines | ~120 |
| 14:37 | Edited shared/src/session.ts | modified if() | ~126 |
| 14:37 | Edited shared/src/session.ts | inline fix | ~15 |
| 14:37 | Edited shared/src/session.ts | 4→4 lines | ~45 |
| 14:37 | Edited shared/src/session.ts | 3→3 lines | ~43 |
| 14:37 | Edited server/src/index.ts | 11→10 lines | ~82 |
| 14:38 | Edited server/src/index.ts | added nullish coalescing | ~166 |
| 14:38 | Edited server/src/index.ts | inline fix | ~20 |
| 14:38 | Edited shared/src/session.test.ts | 3→2 lines | ~24 |
| 14:38 | Edited shared/src/session.test.ts | 4→3 lines | ~61 |
| 14:38 | Edited shared/src/session.test.ts | hashSecret() → save() | ~84 |
| 14:38 | Edited shared/src/session.test.ts | 4→3 lines | ~55 |
| 14:38 | Edited shared/src/session.test.ts | 7→7 lines | ~89 |
| 14:38 | Edited shared/src/session.test.ts | 4→3 lines | ~57 |
| 15:18 | Edited shared/src/save.test.ts | 37→36 lines | ~400 |
| 12:45 | CORREÇÃO do usuário: PIN/código sem hash — texto puro no save (sem dado sensível). auth.ts vira só isValidPin; host imprime código em TODO boot; 82 testes, smoke 12/12 de novo | shared/src/{auth,save,session}.ts server/src/index.ts | ok | ~4k |
| 12:50 | Sessão cp9 encerrada: STATUS/cerebrum/buglog atualizados, commits feat+refactor+wolf. Próxima quest: playtest cp9 → MVP v2 (cenários) | .wolf/* | ok | ~2k |

## Sessão 2026-07-12 (tarde) — cp9 completo
cp9 (PIN + papel de professor) implementado, testado (82 unit + smoke real 2 fases 12/12), commitado.
Correção do usuário no fim: hash removido, PIN/código em texto puro (simplicidade > segurança sem dado sensível).
MVP v1 código completo — falta só playtest do usuário no cp9. Depois: MVP v2 (cenários/autoria).
| 15:21 | Session end: 69 writes across 12 files (auth.ts, protocol.ts, save.ts, session.ts, index.ts) | 16 reads | ~37749 tok |

## Session: 2026-07-11 18:52

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 18:56 | Edited shared/src/constants.ts | expanded (+6 lines) | ~96 |
| 18:56 | Edited shared/src/protocol.ts | 5→6 lines | ~92 |
| 18:56 | Edited shared/src/protocol.ts | expanded (+6 lines) | ~133 |
| 18:56 | Edited shared/src/protocol.ts | added 1 condition(s) | ~132 |
| 18:56 | Edited shared/src/protocol.ts | added 1 condition(s) | ~145 |
| 18:57 | Edited shared/src/session.ts | expanded (+6 lines) | ~51 |
| 18:57 | Edited shared/src/session.ts | 18→22 lines | ~224 |
| 18:57 | Edited shared/src/session.ts | added optional chaining | ~728 |
| 18:57 | Edited shared/src/session.test.ts | added 1 condition(s) | ~174 |
| 18:58 | Edited shared/src/session.test.ts | added optional chaining | ~1087 |
| 18:58 | Edited shared/src/session.test.ts | inline fix | ~19 |
| 18:58 | Edited shared/src/protocol.test.ts | expanded (+13 lines) | ~210 |
| 18:58 | Created client/src/events.ts | — | ~172 |
| 18:58 | Created client/src/chat.ts | — | ~644 |
| 18:59 | Edited client/src/input.ts | added 1 condition(s) | ~93 |
| 18:59 | Edited client/src/input.ts | removed 8 lines | ~16 |
| 18:59 | Edited client/src/input.ts | added optional chaining | ~158 |
| 18:59 | Edited client/src/main.ts | added 2 import(s) | ~173 |
| 18:59 | Edited client/src/main.ts | modified updateOverlay() | ~85 |
| 18:59 | Edited client/src/main.ts | added 2 condition(s) | ~144 |
| 18:59 | Edited client/src/main.ts | added 1 condition(s) | ~91 |
| 19:00 | Edited client/src/main.ts | expanded (+6 lines) | ~109 |
| 19:00 | Edited client/src/main.ts | 2→2 lines | ~15 |
| 19:00 | Edited client/index.html | expanded (+38 lines) | ~303 |
| 19:00 | Edited client/index.html | expanded (+11 lines) | ~130 |
| 19:02 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/a0d99221-e98e-49ca-885e-fb3fd914cb11/scratchpad/chat-smoke.mts | — | ~1235 |
| 19:05 | Checkpoint 6: chat + /bloco (parser no servidor) — protocolo chat 2 vias, session broadcast nome#id / comando só-autor, welcome no join, MAX_CHAT_LENGTH/MAX_NAME_LENGTH | shared/src/{protocol,session,constants}.ts + testes | 57 testes ✅ | ~9k |
| 19:05 | Cliente cp6: chat.ts (UI HTML, Enter/Esc, anti-XSS), events.ts (gatilhos de som), input.ts (ignora campo de texto, lock() público), main.ts wiring, index.html CSS/DOM | client/src/{chat,events,input,main}.ts client/index.html | typecheck 3/3, build ✅ | ~6k |
| 19:05 | Smoke real cp6: 2 clientes ws no dev:server do usuário (tsx watch recarregou /shared sozinho) — welcome, broadcast autor, /bloco muda mundo, resposta só-autor, inválido não vaza | scratchpad/chat-smoke.mts | PASSOU ✅ | ~2k |
| 19:10 | Screenshot headless: welcome chat renderizado + overlay com ajuda nova; STATUS/cerebrum atualizados (cp6 código completo, playtest pendente) | .wolf/STATUS.md .wolf/cerebrum.md | ok | ~2k |
| 19:06 | Session end: 26 writes across 11 files (constants.ts, protocol.ts, session.ts, session.test.ts, protocol.test.ts) | 12 reads | ~21676 tok |
| 19:20 | Playtest cp6 do usuário ✅ ("tudo funciona") — MVP v0 FECHADO; STATUS atualizado; usuário pediu: login nome+senha por mundo (desafiado: conflita com decisão sem-senha; proposto PIN) + lista de blocos/texturas (entregue em 3 grupos por custo) | .wolf/STATUS.md | ok | ~3k |
| 21:19 | Session end: 26 writes across 11 files (constants.ts, protocol.ts, session.ts, session.test.ts, protocol.test.ts) | 12 reads | ~21676 tok |
| 22:13 | Created shared/src/blocks.ts | — | ~388 |
| 22:14 | Edited shared/src/rules.ts | 13→17 lines | ~220 |
| 22:14 | Edited shared/src/mesher.ts | expanded (+27 lines) | ~500 |
| 22:14 | Edited shared/src/session.ts | added 1 condition(s) | ~140 |
| 22:14 | Edited shared/src/session.ts | inline fix | ~18 |
| 22:14 | Edited shared/src/session.ts | "uso: /bloco x y z id (int" → "uso: /bloco x y z id (int" | ~24 |
| 22:15 | Edited client/src/atlasTexture.ts | added 3 condition(s) | ~793 |
| 22:15 | Edited client/src/atlasTexture.ts | expanded (+21 lines) | ~340 |
| 22:15 | Edited client/src/input.ts | added 1 condition(s) | ~131 |
| 22:15 | Edited client/src/input.ts | 3→4 lines | ~60 |
| 22:16 | Edited client/src/input.ts | 4→9 lines | ~98 |
| 22:16 | Edited client/src/main.ts | modified bloco() | ~497 |
| 22:16 | Edited client/index.html | expanded (+10 lines) | ~165 |
| 22:16 | Edited client/index.html | inline fix | ~26 |
| 22:17 | Edited shared/src/rules.test.ts | expanded (+7 lines) | ~504 |
| 22:17 | Edited shared/src/mesher.test.ts | 2→2 lines | ~37 |
| 22:17 | Edited shared/src/mesher.test.ts | expanded (+9 lines) | ~128 |
| 22:17 | Edited shared/src/session.test.ts | modified quebrar() | ~575 |
| 22:18 | Edited client/src/main.ts | added optional chaining | ~139 |
| 22:20 | Grupo A: 14 blocos novos (terra/tronco/tábuas/tijolo/cascalho/bedrock/8 lãs), fallingRule genérica, isBreakable, atlas 8/linha + 14 tiles pintados, hotbar 1-9+scroll, ?atlas debug | shared/{blocks,rules,mesher,session}.ts client/{atlasTexture,input,main}.ts index.html + testes | 60 testes ✅ typecheck ✅ build ✅ screenshot atlas ✅ | ~12k |
| 22:25 | Decisões do usuário: PIN 4 dígitos (não senha) + reset professor; grupos B/C adiados; proposta MVP v1 "Aula persistente" (save+PIN+papel professor) escrita no STATUS | .wolf/STATUS.md .wolf/cerebrum.md | aguarda aprovação | ~3k |
| 22:20 | Session end: 45 writes across 17 files (constants.ts, protocol.ts, session.ts, session.test.ts, protocol.test.ts) | 18 reads | ~30153 tok |
| 22:28 | Created shared/src/save.ts | — | ~230 |
| 22:28 | Created shared/src/save.ts | — | ~1134 |
| 22:29 | Edited shared/src/protocol.ts | expanded (+10 lines) | ~121 |
| 22:29 | Edited shared/src/protocol.ts | added 1 condition(s) | ~146 |
| 22:29 | Edited shared/src/session.ts | added 1 import(s) | ~66 |
| 22:29 | Edited shared/src/session.ts | 6→8 lines | ~79 |
| 22:29 | Edited shared/src/session.ts | modified lembra() | ~93 |
| 22:29 | Edited shared/src/session.ts | added 1 condition(s) | ~409 |
| 22:30 | Edited shared/src/session.ts | added nullish coalescing | ~350 |
| 22:30 | Edited shared/src/session.ts | modified handleDisconnect() | ~119 |
| 22:30 | Created server/src/index.ts | — | ~945 |
| 22:30 | Edited server/src/index.ts | 2→6 lines | ~71 |
| 22:31 | Edited shared/src/index.ts | 2→3 lines | ~23 |
| 22:31 | Edited client/src/main.ts | 2→3 lines | ~61 |
| 22:31 | Edited client/src/main.ts | added optional chaining | ~58 |
| 22:31 | Edited client/src/main.ts | modified respawn() | ~117 |
| 22:31 | Created shared/src/save.test.ts | — | ~736 |
| 22:31 | Edited shared/src/session.test.ts | added optional chaining | ~722 |
| 22:32 | Edited shared/src/protocol.test.ts | expanded (+8 lines) | ~135 |
| 22:32 | Edited shared/src/save.ts | modified encode() | ~125 |
| 22:36 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/a0d99221-e98e-49ca-885e-fb3fd914cb11/scratchpad/save-smoke.mts | — | ~1135 |
| 22:36 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/a0d99221-e98e-49ca-885e-fb3fd914cb11/scratchpad/save-smoke.mts | inline fix | ~16 |
| 22:47 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/a0d99221-e98e-49ca-885e-fb3fd914cb11/scratchpad/save-smoke.mts | modified direto() | ~41 |
| 23:00 | MVP v1 aprovado + decisões: host salva no LAN, singleplayer salva no navegador, código professor na criação, menu principal no escopo (single/multi/config) | .wolf/STATUS.md .wolf/cerebrum.md | plano travado | ~2k |
| 23:30 | cp7 save/load: save.ts (.ljw = LJS1+JSON meta+snapshot), session restore/toSave/roster, msg teleport, host com LJ_PORT/LJ_SAVE/autosave/SIGINT atômico, gitignore *.ljw | shared/{save,session,protocol}.ts server/index.ts client/main.ts + testes | 67 testes ✅ smoke 2 fases ✅ | ~14k |
| 23:35 | bug-060: kill(SIGINT) em spawn(npx) não propaga árvore npx→tsx→node — usar spawn(node,[--import,tsx,...]) direto | buglog | logado | ~1k |
| 22:49 | Session end: 68 writes across 21 files (constants.ts, protocol.ts, session.ts, session.test.ts, protocol.test.ts) | 19 reads | ~37170 tok |
| 23:02 | Edited client/src/main.ts | added 2 condition(s) | ~177 |
| 23:02 | Edited client/src/main.ts | modified if() | ~388 |
| 23:02 | Edited client/src/main.ts | expanded (+9 lines) | ~160 |
| 23:55 | Playtest cp7 ✅ com 2 achados corrigidos: bug-061 (nome fixo "jogador" fundia jogadores no roster → nome único por navegador via localStorage) e bug-062 (serrilhado → lerp exponencial no render, gatilho da política disparou) | client/src/main.ts .wolf/buglog.json | typecheck+build+screenshot ✅ | ~5k |
| 23:04 | Session end: 71 writes across 21 files (constants.ts, protocol.ts, session.ts, session.test.ts, protocol.test.ts) | 20 reads | ~37895 tok |
| 23:13 | Created server/src/worker.ts | — | ~576 |
| 23:14 | Edited client/src/connection.ts | added 2 condition(s) | ~534 |
| 23:14 | Created client/src/worldStore.ts | — | ~780 |
| 23:14 | Created client/src/settings.ts | — | ~867 |
| 23:14 | Edited client/src/input.ts | 3→5 lines | ~40 |
| 23:15 | Edited client/src/input.ts | 2→2 lines | ~41 |
| 23:15 | Edited client/index.html | expanded (+127 lines) | ~866 |
| 23:15 | Edited client/index.html | expanded (+31 lines) | ~570 |
| 23:16 | Created client/src/menu.ts | — | ~2668 |
| 23:16 | Edited client/src/menu.ts | 7→8 lines | ~37 |
| 23:16 | Edited client/src/menu.ts | 9→8 lines | ~73 |
| 23:17 | Edited client/src/main.ts | added 3 import(s) | ~228 |
| 23:17 | Edited client/src/main.ts | modified applySettings() | ~154 |
| 23:18 | Edited client/src/main.ts | added optional chaining | ~223 |
| 23:18 | Edited client/src/main.ts | onMessage() → handleServerData() | ~28 |
| 23:18 | Edited client/src/main.ts | added optional chaining | ~559 |
| 23:18 | Edited client/src/main.ts | added 1 condition(s) | ~48 |
| 23:19 | Edited client/src/main.ts | added 1 condition(s) | ~118 |
| 23:23 | Edited client/src/main.ts | 2→2 lines | ~15 |
| 23:23 | Edited client/src/main.ts | added 1 condition(s) | ~77 |
| 00:20 | cp8 menu principal: menu.ts (4 telas), worldStore.ts (IndexedDB+export/import .ljw), settings.ts (config defensiva+rebind), worker com canal hostType init/save, main.ts boot via menu, autosave single 30s, botão sair | client/src/{menu,worldStore,settings,main,connection,input}.ts server/worker.ts index.html | typecheck+build+67 testes+screenshots ✅ playtest pendente | ~18k |
| 23:24 | Session end: 91 writes across 26 files (constants.ts, protocol.ts, session.ts, session.test.ts, protocol.test.ts) | 24 reads | ~47598 tok |
| 10:48 | Edited client/src/menu.ts | added 1 condition(s) | ~378 |
| 10:48 | Edited client/src/main.ts | 4→9 lines | ~97 |
| 10:49 | Edited client/src/main.ts | servidor() → now() | ~261 |
| 10:49 | Edited shared/src/session.ts | added 1 condition(s) | ~302 |
| 10:49 | Edited shared/src/session.test.ts | added optional chaining | ~459 |
| 10:50 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/a0d99221-e98e-49ca-885e-fb3fd914cb11/scratchpad/presence-smoke.mts | — | ~437 |
| 10:55 | Playtest cp8 "top" + 4 pedidos feitos: rebind 1-captura (bug-075), coords no F3, move reativo (heartbeat 2s parado), presença no join (bug-076) | client/{menu,main}.ts shared/session.ts + teste | 68 testes ✅ smoke presença ✅ | ~7k |
| 10:51 | Session end: 97 writes across 27 files (constants.ts, protocol.ts, session.ts, session.test.ts, protocol.test.ts) | 24 reads | ~49563 tok |
| 10:55 | Edited shared/src/save.ts | 7→10 lines | ~66 |
| 10:55 | Edited shared/src/save.ts | modified for() | ~217 |
| 10:56 | Edited shared/src/protocol.ts | 10→13 lines | ~97 |
| 10:56 | Edited shared/src/protocol.ts | 10→12 lines | ~112 |
| 10:56 | Edited shared/src/session.ts | added optional chaining | ~70 |
| 10:56 | Edited client/src/main.ts | 1→3 lines | ~35 |
| 10:56 | Edited client/src/main.ts | 7→9 lines | ~83 |
| 10:57 | Edited shared/src/protocol.test.ts | 7→7 lines | ~138 |
| 11:05 | Orientação no save (pedido do usuário): roster+SavedPlayer com yaw/pitch, teleport orientado, cliente aponta câmera; compat com save antigo (default 0) testada | shared/{save,session,protocol}.ts client/main.ts + testes | 68 testes ✅ | ~5k |
| 10:58 | Session end: 105 writes across 27 files (constants.ts, protocol.ts, session.ts, session.test.ts, protocol.test.ts) | 24 reads | ~50381 tok |

## Sessão 2026-07-11/12 — resumo (wrap-up pré /clear)
- Cp6 (chat+/bloco) → MVP v0 FECHADO com playtest. Cp7 (save/load .ljw no host,
  roster volta-onde-parou) e cp8 (menu principal, IndexedDB, export/import,
  configurações) FECHADOS com playtest. Grupo A: 14 blocos novos.
- Fixes pós-playtest: lerp remoto (bug-062), nome único por navegador (bug-061),
  rebind 1-captura (bug-075), presença no join (bug-076), move reativo
  (heartbeat 2 s), coords no F3, orientação yaw/pitch no save.
- Decisões: PIN 4 dígitos (não senha), host salva no LAN + navegador salva no
  single, código de professor na criação, MVP v1 "Aula persistente" aprovado.
- PRÓXIMO: cp9 (PIN + papel de professor) — detalhes no STATUS.md.
| 11:06 | Session end: 105 writes across 27 files (constants.ts, protocol.ts, session.ts, session.test.ts, protocol.test.ts) | 24 reads | ~50381 tok |

## Session: 2026-07-11 17:48

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 17:50 | Edited shared/src/protocol.ts | expanded (+15 lines) | ~168 |
| 17:51 | Edited shared/src/protocol.ts | added 3 condition(s) | ~306 |
| 17:51 | Edited shared/src/session.ts | expanded (+7 lines) | ~155 |
| 17:51 | Edited shared/src/session.ts | added 1 condition(s) | ~112 |
| 17:51 | Edited shared/src/session.ts | added 1 condition(s) | ~66 |
| 17:51 | Created server/src/index.ts | — | ~504 |
| 17:52 | Edited client/src/connection.ts | added optional chaining | ~486 |
| 17:52 | Edited client/src/main.ts | 12→12 lines | ~156 |
| 17:52 | Edited client/src/main.ts | added 2 condition(s) | ~390 |
| 17:52 | Edited client/src/main.ts | added 2 condition(s) | ~350 |
| 17:52 | Edited client/src/main.ts | added nullish coalescing | ~45 |
| 17:53 | Edited shared/src/protocol.test.ts | expanded (+15 lines) | ~300 |
| 17:53 | Edited shared/src/session.test.ts | added optional chaining | ~534 |
| 17:54 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/f3234578-5a68-4273-9e45-1b7d17f2b3db/scratchpad/ws-smoke.ts | — | ~1083 |
| 17:54 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/f3234578-5a68-4273-9e45-1b7d17f2b3db/scratchpad/ws-smoke.ts | added 1 import(s) | ~47 |
| 17:54 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/f3234578-5a68-4273-9e45-1b7d17f2b3db/scratchpad/ws-smoke.ts | 2→3 lines | ~68 |
| 17:54 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/f3234578-5a68-4273-9e45-1b7d17f2b3db/scratchpad/ws-smoke.ts | 4→4 lines | ~68 |
| 17:55 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/f3234578-5a68-4273-9e45-1b7d17f2b3db/scratchpad/ws-smoke.ts | 2→2 lines | ~42 |
| 18:05 | cp5: protocolo +player_moved/player_left (parse defensivo) | shared/src/protocol.ts | ok | ~600 |
| 18:08 | cp5: session relay move→outros (sem eco) + player_left no disconnect | shared/src/session.ts | ok | ~500 |
| 18:10 | cp5: hospedeiro Node+ws real (id/socket, close→disconnect, error handler) | server/src/index.ts | ok | ~500 |
| 18:12 | cp5: WsConnection (fila até open, binaryType arraybuffer) + ?server= + caixas coloridas de jogadores remotos | client/src/connection.ts, client/src/main.ts | ok | ~900 |
| 18:15 | cp5: 3 testes novos (relay/left/parse) → 51 passando, typecheck 3/3, build ok | shared/src/*.test.ts | ok | ~400 |
| 18:17 | cp5: smoke real — servidor Node + 2 clientes ws: snapshot/relay/block_changed/left todos ✅ | scratchpad/ws-smoke.mts | ok | ~800 |
| 18:19 | cp5: screenshots headless — cliente via ws E via worker renderizam | scratchpad/cp5-*.png | ok | ~300 |
| 18:21 | Session end: 18 writes across 8 files (protocol.ts, session.ts, index.ts, connection.ts, main.ts) | 11 reads | ~15677 tok |
| 18:33 | Edited shared/src/protocol.ts | expanded (+11 lines) | ~122 |
| 18:33 | Edited shared/src/protocol.ts | added 1 condition(s) | ~142 |
| 18:33 | Edited shared/src/session.ts | 4→7 lines | ~86 |
| 18:33 | Edited shared/src/session.ts | expanded (+7 lines) | ~104 |
| 18:34 | Edited shared/src/session.ts | 16→18 lines | ~169 |
| 18:34 | Edited client/src/main.ts | 1→2 lines | ~36 |
| 18:34 | Edited client/src/main.ts | added 1 condition(s) | ~51 |
| 18:34 | Edited client/src/main.ts | added nullish coalescing | ~182 |
| 18:34 | Edited shared/src/session.test.ts | 8→11 lines | ~149 |
| 18:34 | Edited shared/src/session.test.ts | added optional chaining | ~356 |
| 18:35 | Edited shared/src/session.test.ts | inline fix | ~17 |
| 18:35 | Edited shared/src/protocol.test.ts | expanded (+8 lines) | ~153 |
| 18:35 | Edited ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/f3234578-5a68-4273-9e45-1b7d17f2b3db/scratchpad/ws-smoke.mts | expanded (+6 lines) | ~162 |
| 18:30 | bug-010 (playtest cp5): rejoin nascia no fundo do buraco — spawn recalculado no join | shared/src/session.ts, protocol.ts, client/src/main.ts | fixado: spawn fixo na criação + msg spawn no protocolo | ~1200 |
| 18:36 | smoke contra servidor REAL escavado (findSpawnY=12, spawn=26) — fix provado; 53 testes, typecheck 3/3, build ok | scratchpad/ws-smoke.mts | ok | ~500 |
| 18:38 | ⚠️ derrubei o dev:server do usuário (fuser -k 8080) — avisado pra reiniciar | — | sem dano (mundo é volátil) | ~50 |
| 18:39 | Session end: 31 writes across 9 files (protocol.ts, session.ts, index.ts, connection.ts, main.ts) | 12 reads | ~17417 tok |
| 18:55 | bug-011: dev servers presos (tsx watch órfão do fuser -k anterior) — kill -TERM árvore + kill -9 no watcher | processos | portas 5173/8080 livres | ~300 |
| 18:46 | Session end: 31 writes across 9 files (protocol.ts, session.ts, index.ts, connection.ts, main.ts) | 12 reads | ~17417 tok |

## Sessão 2026-07-11 (checkpoint 5)
Checkpoint 5 FECHADO: LAN via Node+ws real. Protocolo +player_moved (relay sem eco,
cliente não sabe o próprio id) +player_left +spawn (ponto fixo do terreno pristino).
Session: broadcastExcept, disconnect idempotente, spawn readonly no construtor.
server/index.ts = host real (mesma GameSession do worker). Cliente: WsConnection
(fila até open), ?server= escolhe hospedeiro, caixas coloridas p/ jogadores remotos.
Bug-010 achado na playtest (rejoin no fundo do buraco) e corrigido; bug-011 (tsx watch
órfão) limpo. 53 testes, smoke real 2 clientes, playtest ✅ "top". Próximo: checkpoint 6
(chat + 1 comando) — fecha MVP v0. Lerp: gatilho não disparou.
| 18:50 | Session end: 31 writes across 9 files (protocol.ts, session.ts, index.ts, connection.ts, main.ts) | 12 reads | ~17417 tok |
| 18:51 | Session end: 31 writes across 9 files (protocol.ts, session.ts, index.ts, connection.ts, main.ts) | 12 reads | ~17417 tok |

## Session: 2026-07-11 16:55

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 17:10 | Created shared/src/protocol.ts | — | ~1386 |
| 17:10 | Created shared/src/session.ts | — | ~919 |
| 17:10 | Created shared/src/protocol.test.ts | — | ~935 |
| 17:11 | Created shared/src/session.test.ts | — | ~900 |
| 17:11 | Created shared/src/index.ts | — | ~62 |
| 17:11 | Created server/src/worker.ts | — | ~252 |
| 17:11 | Edited server/tsconfig.json | 3→4 lines | ~25 |
| 17:11 | Created client/src/connection.ts | — | ~385 |
| 17:12 | Created client/src/main.ts | — | ~1520 |
| 17:12 | Edited client/src/hud.ts | modified netcode() | ~46 |
| 17:12 | Edited client/src/hud.ts | "rede ${s.net.msgsPerSec} " → "rede ${s.net.msgsPerSec} " | ~36 |
| 17:06 | push main pro GitHub (repo privado meketreve/logica-em-jogo já existia; commit chore(wolf) antes) | — | ok, main=origin/main | ~2k |
| 17:14 | checkpoint 2: protocol.ts+session.ts em /shared (+13 testes), worker.ts em /server (lib WebWorker no tsconfig), connection.ts + main.ts refeito no /client, HUD tick méd/máx | shared/src/{protocol,session}{,.test}.ts server/src/worker.ts client/src/{connection,main,hud}.ts | 33 testes, typecheck 3/3, build ok, screenshot = checkpoint 1 | ~35k |
| 17:17 | Session end: 11 writes across 10 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 10 reads | ~10559 tok |
| 17:18 | Session end: 11 writes across 10 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 10 reads | ~10559 tok |
| 17:40 | playtest do checkpoint 2 pelo usuário: "tudo certo" | — | aprovado, próximo = checkpoint 3 | ~1k |
| 17:20 | Session end: 11 writes across 10 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 10 reads | ~10559 tok |
| 17:23 | Edited shared/src/constants.ts | 2→5 lines | ~62 |
| 17:23 | Edited shared/src/blocks.ts | modified isPlaceable() | ~81 |
| 17:23 | Created shared/src/raycast.ts | — | ~649 |
| 17:23 | Created shared/src/raycast.test.ts | — | ~604 |
| 17:23 | Edited shared/src/protocol.ts | expanded (+11 lines) | ~237 |
| 17:23 | Edited shared/src/protocol.ts | added 2 condition(s) | ~311 |
| 17:24 | Edited shared/src/protocol.ts | modified switch() | ~254 |
| 17:24 | Edited shared/src/session.ts | added 2 import(s) | ~115 |
| 17:24 | Edited shared/src/session.ts | added 11 condition(s) | ~912 |
| 17:24 | Edited shared/src/session.ts | modified if() | ~95 |
| 17:24 | Edited shared/src/index.ts | 2→3 lines | ~23 |
| 17:24 | Edited shared/src/session.test.ts | added 1 import(s) | ~82 |
| 17:25 | Edited shared/src/session.test.ts | added optional chaining | ~800 |
| 17:25 | Edited shared/src/protocol.test.ts | expanded (+12 lines) | ~218 |
| 17:25 | Edited shared/src/protocol.test.ts | 6→10 lines | ~175 |
| 17:26 | Edited shared/src/session.test.ts | toBeNull() → Error() | ~102 |
| 17:26 | Edited client/src/input.ts | 2→3 lines | ~42 |
| 17:26 | Edited client/src/input.ts | added optional chaining | ~91 |
| 17:26 | Edited client/src/input.ts | 4→9 lines | ~95 |
| 17:26 | Edited client/src/chunks.ts | added 6 condition(s) | ~295 |
| 17:26 | Edited client/index.html | expanded (+30 lines) | ~222 |
| 17:26 | Edited client/index.html | 2→5 lines | ~61 |
| 17:27 | Edited client/src/main.ts | 24→28 lines | ~222 |
| 17:27 | Edited client/src/main.ts | added optional chaining | ~150 |
| 17:27 | Edited client/src/main.ts | added 4 condition(s) | ~555 |
| 17:27 | Edited client/src/main.ts | added 1 condition(s) | ~231 |
| 17:30 | checkpoint 3: raycast DDA em /shared, place/break+block_changed no protocolo, validação completa na session (bounds/reach/AABB), highlight+crosshair+hotbar no cliente, remeshBlock com vizinhos | shared/src/{raycast,raycast.test,protocol,protocol.test,session,session.test,constants,blocks,index}.ts client/src/{main,input,chunks}.ts client/index.html | 42 testes, typecheck 3/3, build ok, screenshot com crosshair+hotbar | ~30k |
| 17:31 | Session end: 37 writes across 17 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 15 reads | ~19578 tok |
| 17:36 | Created ../../../tmp/claude-1000/-home-meketreve-logica-em-jogo/a33579f2-d151-4a57-9677-89e57efca3e1/scratchpad/repro-border.ts | — | ~825 |
| 17:45 | playtest cp3: quebrar/colocar ok, remesh na borda ok; "não coloca na outra chunk" investigado = borda do MUNDO (by design, bug-004); repro script confirma place interno entre chunks funciona | .wolf/buglog.json | não-bug documentado; polish futuro: feedback de rejeição | ~8k |
| 17:37 | Session end: 38 writes across 18 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 15 reads | ~20403 tok |
| 17:40 | Created shared/src/rules.ts | — | ~481 |
| 17:40 | Edited shared/src/session.ts | added 1 import(s) | ~36 |
| 17:41 | Edited shared/src/session.ts | 5→9 lines | ~122 |
| 17:41 | Edited shared/src/session.ts | added 1 condition(s) | ~336 |
| 17:41 | Edited shared/src/session.ts | added 4 condition(s) | ~337 |
| 17:41 | Edited shared/src/index.ts | 1→2 lines | ~15 |
| 17:41 | Created shared/src/rules.test.ts | — | ~392 |
| 17:41 | Edited shared/src/session.test.ts | added optional chaining | ~909 |
| 17:42 | Edited shared/src/session.test.ts | 3→3 lines | ~28 |
| 17:42 | Edited client/src/main.ts | 2→2 lines | ~15 |
| 17:43 | checkpoint 4: rules.ts (sistema genérico de vizinhança + sandRule), fila dirty/changedThisTick na session, tick drena e aplica; cliente ZERO mudanças (só rótulo HUD) | shared/src/{rules,rules.test,session,session.test,index}.ts client/src/main.ts | 48 testes, typecheck 3/3, build ok | ~20k |
| 17:43 | Session end: 48 writes across 20 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 15 reads | ~23074 tok |
| 17:50 | playtest cp4 aprovado ("tudo certo"); sessão encerrada | — | STATUS.md pronto pra próxima sessão: começar no checkpoint 5 (Node+ws) | ~2k |

## Resumo da sessão 2026-07-11 (tarde)
Push inicial pro GitHub + checkpoints 2, 3 e 4 completos e playtestados no mesmo dia:
- CP2: GameSession autoritativa em /shared + host Web Worker + protocolo (JSON defensivo + snapshot binário LJW0) + Connection no cliente. 33 testes.
- CP3: raycast DDA puro, place/break validados no servidor (bounds/reach/AABB), block_changed genérico, crosshair/highlight/hotbar. 42 testes. bug-004 investigado = borda do mundo, by design.
- CP4: rules.ts — sistema genérico de vizinhança (REGRA DE OURO); areia = 1 regra; fila dirty + changedThisTick; cliente zero mudanças. 48 testes.
Próxima sessão: checkpoint 5 (segundo cliente via Node+ws) — detalhes no STATUS.md.
| 17:48 | Session end: 48 writes across 20 files (protocol.ts, session.ts, protocol.test.ts, session.test.ts, index.ts) | 15 reads | ~23074 tok |

## Session: 2026-07-11 22:52

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 00:02 | Created shared/src/world.ts | — | ~848 |
| 00:02 | Created shared/src/worldgen.ts | — | ~575 |
| 00:02 | Created shared/src/mesher.ts | — | ~1443 |
| 00:02 | Created shared/src/physics.ts | — | ~1079 |
| 00:03 | Created shared/src/index.ts | — | ~46 |
| 00:03 | Created shared/src/world.test.ts | — | ~761 |
| 00:03 | Created shared/src/mesher.test.ts | — | ~561 |
| 00:03 | Created shared/src/physics.test.ts | — | ~856 |
| 10:35 | Created client/src/atlasTexture.ts | — | ~799 |
| 10:35 | Created client/src/chunks.ts | — | ~527 |
| 10:35 | Created client/src/input.ts | — | ~450 |
| 10:35 | Created client/src/hud.ts | — | ~1019 |
| 10:36 | Created client/src/main.ts | — | ~980 |
| 10:36 | Created client/index.html | — | ~527 |
| 10:36 | Edited client/src/atlasTexture.ts | 2→2 lines | ~15 |
| 10:49 | designqc: captured 0 screenshots (0KB, ~0 tok) | / | ready for eval | ~0 |
| 10:30 | npm install (node_modules ausente pós-migração pro WSL) | package-lock.json | ok, vitest voltou | ~200 |
| 10:35 | Checkpoint 1 /shared: world.ts, worldgen.ts, mesher.ts, physics.ts + 3 arquivos de teste (16 testes novos) | shared/src/* | 20/20 testes, typecheck ok | ~8000 |
| 10:45 | Checkpoint 1 /client: atlasTexture, chunks, input, hud, main reescrito, index.html (overlay+HUD) | client/src/*, client/index.html | typecheck 3/3, build ok | ~6000 |
| 10:50 | Fix TS2345 literal-type em default param (bug-001) | client/src/atlasTexture.ts | corrigido | ~300 |
| 10:55 | Chrome p/ screenshot: unzip ausente quebrava puppeteer install; extraído manual c/ python3, chrome_path setado (bug-002) | .wolf/config.json | chrome headless funcional | ~1500 |
| 10:58 | Screenshot headless valida checkpoint 1: terreno grama/areia renderizando + overlay | scratchpad/checkpoint1.png | ✅ visual ok | ~1500 |
| 11:00 | STATUS/anatomy/cerebrum/buglog atualizados; próxima: playtest do usuário + commit + checkpoint 2 | .wolf/* | ok | ~1000 |
| 10:54 | Session end: 15 writes across 14 files (world.ts, worldgen.ts, mesher.ts, physics.ts, index.ts) | 9 reads | ~10523 tok |
| 11:15 | Edited client/src/input.ts | 2→4 lines | ~72 |
| 11:16 | Edited client/src/input.ts | added optional chaining | ~188 |
| 11:20 | Fix câmera teleportando (spikes de movementX/Y do Chrome no pointer lock): MAX_DELTA=350 + unadjustedMovement (bug-003) | client/src/input.ts | typecheck ok, aguarda re-teste | ~800 |
| 11:16 | Session end: 17 writes across 14 files (world.ts, worldgen.ts, mesher.ts, physics.ts, index.ts) | 9 reads | ~10783 tok |
| 11:19 | Edited client/src/input.ts | 2→5 lines | ~79 |
| 11:19 | Edited client/src/input.ts | added 1 condition(s) | ~161 |
| 11:19 | Edited client/src/hud.ts | 2→5 lines | ~69 |
| 11:19 | Edited client/src/hud.ts | added 1 condition(s) | ~128 |
| 11:19 | Edited client/src/main.ts | 1→5 lines | ~53 |
| 11:19 | Session end: 22 writes across 14 files (world.ts, worldgen.ts, mesher.ts, physics.ts, index.ts) | 9 reads | ~11273 tok |
| 11:45 | Playtest usuário: checkpoint 1 ok; pulos de câmera melhoraram (fix parcial bug-003), restam raros | client/src/input.ts | parcial — dados no HUD p/ próxima rodada | ~500 |
| 11:50 | STATUS/buglog atualizados (bug-004 auto-falso-positivo removido); commit do checkpoint 1 | .wolf/*, git | ok | ~800 |
| 11:37 | Created .gitattributes | — | ~31 |
| 12:10 | Saneamento git: CRLF→LF (sed corrompeu PDF, restaurado), .gitattributes, identidade local refeita, renormalize (bug-004) | .gitattributes, git config | árvore limpa | ~3000 |
| 12:15 | Commits: 1d0c0a7 feat checkpoint 1 (+1140), e4e43f7 chore(wolf) (+860); push GitHub PENDENTE | git | ✅ | ~500 |
| 16:51 | Session end: 23 writes across 15 files (world.ts, worldgen.ts, mesher.ts, physics.ts, index.ts) | 9 reads | ~11306 tok |

## Session: 2026-07-11 22:51

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-10 18:08

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-10 17:46

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 17:49 | resumo de sessão: git init, commit docs (aae8a06), scaffold monorepo (3fbca1c), STATUS.md atualizado p/ checkpoint 1 | .wolf/ | ok | ~sessão |

## Session: 2026-07-10 15:11

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 15:35 | git init (branch main) na raiz do projeto | .git/ | ok | ~50 |
| 16:39 | Created .gitignore | — | ~17 |
| 16:40 | Created package.json | — | ~120 |
| 16:40 | Created tsconfig.base.json | — | ~121 |
| 16:40 | Created shared/package.json | — | ~56 |
| 16:40 | Created shared/tsconfig.json | — | ~18 |
| 16:40 | Created shared/src/index.ts | — | ~16 |
| 16:40 | Created shared/src/blocks.ts | — | ~93 |
| 16:41 | Created shared/src/constants.ts | — | ~156 |
| 16:41 | Created shared/src/blocks.test.ts | — | ~165 |
| 16:41 | Created server/package.json | — | ~70 |
| 16:41 | Created server/tsconfig.json | — | ~33 |
| 16:41 | Created server/src/index.ts | — | ~173 |
| 16:41 | Created client/package.json | — | ~72 |
| 16:41 | Created client/tsconfig.json | — | ~39 |
| 16:41 | Created client/vite.config.ts | — | ~30 |
| 16:41 | Created client/index.html | — | ~120 |
| 16:41 | Created client/src/main.ts | — | ~370 |
| 16:43 | commit docs + scaffold monorepo (shared/server/client, TS estrito, Vite, three.js, ws, vitest); typecheck+test+build+smoke ok | package.json, tsconfig.base.json, shared/, server/, client/ | ok | ~4000 |
| 16:44 | Session end: 17 writes across 11 files (.gitignore, package.json, tsconfig.base.json, tsconfig.json, index.ts) | 0 reads | ~1679 tok |

## Session: 2026-07-10 14:11

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| 14:30 | Revisão do projeto: render fechado em three.js (vs Babylon); código irá pra ~/projetos/logica-em-jogo (WSL, fora do OneDrive) | .wolf/STATUS.md, .wolf/cerebrum.md | decisões registradas | ~400 |
| 15:00 | Pesquisa de otimização voxel + política fechada (baseline/adiada/proibida); WebGLRenderer confirmado | .wolf/STATUS.md, .wolf/cerebrum.md | política registrada | ~600 |
| 15:20 | Decidido: tamanho de mundo = parâmetro de criação (header save/snapshot, teto no servidor); HUD F3 de perfilação desde checkpoint 1 + debug_stats + export JSON | .wolf/STATUS.md, .wolf/cerebrum.md | decisões registradas | ~350 |
| 15:35 | FIM DE SESSÃO. Resumo: revisão do projeto; render fechado three.js (WebGLRenderer); política de otimização (baseline/adiada/proibida); tamanho de mundo = parâmetro de criação; HUD F3 de perfilação; projeto inteiro migra pra ~/projetos/logica-em-jogo (WSL), OneDrive vira backup. Próxima sessão: git init + scaffold + checkpoint 1 | .wolf/* | sessão encerrada | — |

## Session: 2026-07-10 09:16

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|
| —    | Entrevista de requisitos completa; travou escopo MVP v0 e arquitetura cliente=servidor | STATUS.md, cerebrum.md | Decisões gravadas; próximo passo = walking skeleton | ~15k |

## Session: 2026-07-10 09:13

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-10 09:09

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-10 09:09

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-10 09:09

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Session: 2026-07-10 09:08

| Time | Action | File(s) | Outcome | ~Tokens |
|------|--------|---------|---------|--------|

## Cerebrum — Key Learnings (dated)

### Cenários pedagógicos = conteúdo, não motor (2026-07-14)
- Cenário nasce de COMANDOS rodando numa GameSession real — não existe editor
  offline nem caminho de autoria privado. O gerador (`server/src/cenarios/gerar.ts`)
  digita os mesmos `/grupo criar`, `/regiao criar`, `/bloco`, `/objetivo add` que o
  professor digitaria. Se um cenário não sai daí, ele também não sai da mão do
  professor — isso é atrito do MOTOR, não bug do script.
- ~~`.ljw` NÃO vai pro git~~ **REVOGADO 2026-07-16 (decisão do usuário):** git é
  o canal de SYNC casa↔escola — `.ljw` (cenarios/ e aulas/) e `client/dist/`
  agora SÃO versionados; `.gitignore` só guarda temporários de teste
  (*.ljw.tmp, *.ljw.corrompido-*, chrome/, designqc-captures/, *.log) +
  node_modules/.env. O gerador continua sendo a fonte da verdade dos modelos.
- O .ljw de distribuição sai com `roster: []` (sobrescrito no `toSave()`): senão o
  mundo viaja com o PIN e o papel do autor de mentira, e qualquer um entraria como
  professor usando aquele nome. Quem sabe o CÓDIGO vira professor; aluno registra
  o PIN na 1ª entrada.
- `/objetivo add construir modelo alvo` RECUSA alvo que já bate com o gabarito.
  Por isso a área do grupo tem que nascer incompleta: pista parcial (aula 1), vazia
  (aula 2) ou com erros plantados (aula 3).
- Um comando do servidor pode gerar VÁRIAS falas de chat (`/grupo criar` avisa e
  depois lista). Quem afirma em cima da resposta tem que olhar TODAS, não a última.
- `npm run <script> -w server` roda com cwd em `server/` — caminho relativo de saída
  não cai na raiz do repo. Ancorar em `fileURLToPath(import.meta.url)`.

### Trocar de aula ao vivo + integridade dos modelos (cp19, 2026-07-15)
- **Filesystem é do HOST, nunca da GameSession.** `/mundo` (trocar de aula = ler
  arquivo) é interceptado em `server/src/index.ts` ANTES de chegar na sessão; a
  GameSession não tem (nem deve ter) sistema de arquivos, senão o Web Worker do
  singleplayer não roda. Mesmo princípio do save no cp7.
- **Trocar de mundo sem derrubar ninguém** = salvar atual → decodificar o novo
  (corrompido ABORTA, nada muda) → `session.jogadoresConectados()` → nova
  GameSession → `session.adotar(id,name,papel)` por cliente. `adotar` reusa o
  `admitir()` que o join usa (2ª metade do join extraída). Teleport é OBRIGATÓRIO
  ao migrar: as coords do mundo velho podem cair dentro da rocha do mundo novo.
- **Comando que chega pela rede aceita só NOME de arquivo, nunca caminho.** O
  servidor é alcançável pela escola inteira; um caminho livre daria leitura do
  disco do host. `acharMundo` faz `basename()` e casa contra a lista de mundos.
- **Modelo ≠ save.** Um `.ljw` em `cenarios/` é MODELO distribuível; o servidor
  NUNCA escreve nele. `mundoDeTrabalho()` (paths.ts) manda o autosave pra uma
  cópia de trabalho em `aulas/` (mesmo nome). Sem isso, hospedar um cenário direto
  gravaria roster/PINs/progresso da turma dentro do arquivo que se distribui, e a
  próxima turma começaria com a aula anterior resolvida. Cópia viva vence o modelo
  (turma continua); apagar em `aulas/` recomeça. Modelo corrompido NÃO se renomeia
  (é distribuído — regenerar). Prova: swap real → 3 modelos byte-idênticos (md5).
- **Mundos "aula" são REUTILIZÁVEIS (read-only), 2026-07-17.** Estende o "modelo ≠
  save": um mundo cujo ARQUIVO começa com "aula" (`ehMundoDeAula()` em paths.ts,
  regex `^aula/i`) roda em modo só-leitura — `saveNow` vira no-op e o boot carrega
  SEMPRE do modelo em `cenarios/`, ignorando qualquer cópia viva da turma anterior.
  Motivo (pedido do usuário): as 3 lições são reaplicadas em várias turmas; sem
  isso o professor teria que apagar `aulas/aulaN.ljw` entre turmas. O flag
  `somenteLeitura` viaja em `mundoDeTrabalho()` e em `TrocaDeMundo` (`/mundo
  carregar` propaga). Um mundo de construção livre (nome sem "aula") salva normal.

### Blocos só-de-professor: servidor é a barreira, cliente só esconde (2026-07-17)
- **`isProfessorOnly(id)` em blocks.ts** (por ora só rocha-matriz/bedrock). Regra
  de ouro de segurança: o CLIENTE esconde (UX), o SERVIDOR recusa (verdade). Aluno
  com fio adulterado ainda é barrado no `place_block` (`isProfessorOnly && papel!=
  professor → return`). Nunca confiar só no esconde-no-cliente.
- **Esconder no cliente = `placeableFor(papel)` em blocksUi.ts**, usado pelo
  inventário (provider `blocks()`) E pela hotbar (default + `valid` set do
  localStorage, senão um slot salvo antigo com o bloco sobrevive). `papel` já
  chegou no `spawn` antes do snapshot que dispara `startGame`, então dá pra
  filtrar na montagem da hotbar. Botão-do-meio (copiar) também checa isProfessorOnly
  — o comentário antigo "bedrock não vai pra mão" era mentira (isPlaceable passava).

### Confinamento por área de grupo = INVERSO do claim (cp25, 2026-07-17)
- **`confinaBloqueia(clientId,x,y,z)` espelha `claimBloqueia`**: mesmo formato
  (retorna motivo `string` ou `null`), plugado nos MESMOS gates de place_block
  (porta ⇒ checa as 2 células com `??`) e break_block, encadeado com `??` DEPOIS
  do claim. Claim PROTEGE (barra quem NÃO é dono/amigo); confinamento CONFINA
  (barra fora da área do grupo). Professor isento nos dois. use_block ficou LIVRE
  (decisão de escopo: só colocar+quebrar).
- **Área = `areasDoGrupo(g)`** (nova, plural): para CADA objetivo, `alvos[g-1]`
  (per-grupo, cp13) ou o próprio objetivo (área compartilhada = liberada a todo
  grupo). Coleta de TODOS os objetivos, não só o ativo (`areaDoGrupo` singular usa
  `activeIdsFor`; confinamento quer todas). Guardar `o.alvos[g-1]` com
  noUncheckedIndexedAccess ⇒ `Box|undefined`, checar antes de `push`.
- **Aluno SEM grupo = travado em tudo** (decisão do usuário). Mas o join AUTO-põe
  aluno no menor grupo quando `grupos.size>0` — então "sem grupo" só acontece antes
  de o professor criar grupos, ou após `/grupo sair`. Se `/confinar ligar` com 0
  grupos ou 0 objetivos, TODOS os alunos ficam travados: o comando AVISA o professor.
- **Auto em mundo-aula** via `SessionOptions.somenteLeitura` novo (o host já sabe
  isso do cp19). Setado no FIM do construtor (`if (opts.somenteLeitura)
  this.confinamentoAtivo = true`), VENCE o valor do save (aula distribui o modelo).
  Propagação no host: index.ts boot passa `somenteLeitura`; `novaSessao` do ctx
  (mundos.ts) ganhou 2º param `somenteLeitura` pra troca de aula (/mundo carregar).
- **Persiste só em mundo LIVRE** (`SaveMeta.confinamento?`, grava só se ligado;
  em aula read-only não salva ⇒ reseta por turma, coerente com claims). SEM
  protocolo/UI novo no cliente: o aluno já enxerga a caixa VERDE do objetivo (cp12),
  então a barreira dá só feedback de chat — mesmo desenho da rocha-matriz/claim
  (servidor barra, cliente não precisa saber). `/confinar` NÃO entrou em claim/amigos
  no autocomplete porque esses 2 do cp24 nunca foram adicionados (gap pré-existente).

### Backlog 2026-07-19 sessão 2 (atalhos, dia/noite, tapetes, janela, móveis, quadro)
- **Ctrl+W NÃO é interceptável por JS** em janela comum (atalho reservado).
  Defesas reais (client/shortcutGuard.ts): (1) beforeunload = diálogo "sair do
  site?" (universal); (2) preventDefault só nos combos que o navegador deixa
  (Ctrl/Alt/Meta+tecla, Tab, F1/F5/F6/F7/F10/F12 — F5 sim, Ctrl+R não); (3)
  Keyboard Lock API `navigator.keyboard.lock(["KeyW","KeyT","KeyN","KeyR","F4"])`
  Chrome/Edge, SÓ age em tela cheia — aí Ctrl+W chega como keydown e a camada 2
  segura. Esc fica FORA do lock (menu de pausa depende do exit do pointer lock).
  preventDefault não esconde a tecla do Input (listeners separados) — jogo segue.
  DESARMAR antes de navegação legítima (btn-sair, kicked/join_denied) senão o
  diálogo trava a saída pedida.
- **Família DIRECIONAL de bloco (4 ids XP/ZP/XN/ZN)**: forma escrita UMA vez
  "de frente pra +x" e girada por `rotXZ(xa,za,xb,zb,k)` (mesher.ts, k×90° no
  centro da célula). No place o cliente escolhe: quadrante do olhar `(olhar+2)%4`
  = frente encara o jogador (convenção Minecraft). Hotbar = entrada única
  (âncora XP); botão-do-meio copia de volta pra âncora. Usada por cadeira/sofá/
  cama/quadro — móvel novo direcional segue este molde.
- **Estado FORA do id (quadros) — molde pra metadata futura (placas, baús):**
  shared/quadros.ts (tipo + parse defensivo + tetos), Map<posKey,conteudo> na
  GameSession, msgs set/changed/lista-no-join (lista SÓ se não-vazia — asserts
  de contagem do join intactos), persiste no SaveMeta (entrada quebrada pulada;
  restore descarta conteúdo cuja célula não é mais o bloco), limpeza central no
  applyBlockQuieto (célula deixou de ser o bloco → metadata morre; cliente limpa
  pelo próprio block_changed, sem msg extra). Cliente: renderer de planes com
  canvas-texture + editor overlay HTML (sem popup nativo); imagem SEMPRE
  comprimida no cliente (canvas 192px, JPEG qualidade decrescente até caber no
  teto) — servidor só valida prefixo data:image/ e tamanho.
- **Astros do céu (daynight.ts):** sol/lua/estrelas num Group que COPIA a
  posição da câmera por frame (nunca se aproximam); materiais transparent +
  depthWrite:false = passe transparente depois do terreno → montanha oclui de
  graça. Estrelas determinísticas (LCG seed fixa). Fade por altura do sol
  (clamp01 perto do horizonte) evita pop. `?hora=` e `?yaw=` na URL congelam
  céu/câmera pra screenshot headless (par do ?atlas).
- **Tile de UI de móvel** pode REUSAR tile existente (tapete→lã, cadeira→tábuas);
  só pinta tile novo quando a cara é nova (estofado, colchão, janela, quadro).

### Fases nos cenários (2026-07-20)
- **`Cenario.fases: Fase[]`** no gerar.ts: cada fase = objetivo construir com
  modelo próprio. 1 fase → `/objetivo modo livre` (compat); 2+ → `sequencial`
  (o grupo só vê a próxima ao fechar a atual — motor do cp13, zero mudança).
  Layout: fases lado a lado em x com 1 coluna de vão (Σ larguras ≤ 8).
  Nomes: fase 1 sem sufixo ("modelo"/"area-g" — receitas antigas valem);
  fase 2+ = "modelo2"/"area2-g". `faixa1d(gab, partida, texto)` = helper do
  caso 1D; `primeiros(gab, n)` = partida com os n primeiros dados.
- verificar.ts joga TODAS as fases em ordem (monta gabarito no alvo do grupo 1,
  tick, exige completo por fase + grupo 2 isolado) e exige modo sequencial em
  multi-fase. Aula 1 é o showcase: período 3 → período 4 → regra crescente.

### Cenários 4-6 (2026-07-20): gerador com área em CAIXA
- **Cenario do gerar.ts é FUNÇÃO agora:** `gabarito(i,j,k)`/`partida(i,j,k)` +
  `area {dx,dy,dz}` — faixa 1D das aulas 1-3 = caso particular (`linha()`).
  `extras(a, origem)` roda 1× por grupo pra decoração FORA do alvo (dica
  cifrada da aula4, parede de quadros da aula6); `conferirExtra(buf, grupos)`
  pra invariantes específicas (aula6 exige grupos×3 quadros no save).
  verificar.ts aceita área com ALTURA (base rente ao chão; era 1 célula).
- **Autoria.quadro(x,y,z,id,texto):** /bloco coloca o quadro e o autor se
  APROXIMA antes do quadro_set (a msg exige alcance). Única saída do princípio
  "só comandos de professor" — quadro_set é a mesma msg do clique direito.
- **Aula com dica visível**: blocos FORA da região-alvo não são fotografados
  nem apagados — dica cifrada fica em pé mesmo com o modelo apagado. Em
  mundo-aula o confinamento (cp25) impede aluno de vandalizar a dica/quadros
  (fora da área do grupo).
- Erros de simetria (aula5): trocar célula SEM trocar a espelhada — toda
  troca vira detectável pela regra; consertar "pelo espelho errado" deixa
  simétrico mas ≠ gabarito (contador não fecha) = discussão pedagógica, não bug.

### Mundo G + medição de desempenho (2026-07-19 sessão 3)
- **Bench do mundo G (16×16×8 = 256×256×128, Node local):** worldgen 80 ms ·
  mesh dos 2048 chunks ~970 ms (pior chunk 10 ms; 512 com geometria, 740k
  vértices) · encode/decode snapshot 7/18 ms · encodeSave 24 ms · tick com 500
  areias ≈ 0 ms. Script: scratchpad bench.mts (regenerável).
- **O que FOI otimizado (dor real):** (a) fast path de chunk 100% ar no
  meshChunk (75% dos chunks do G são céu; checar 4096 bytes custa ~µs);
  (b) `perMessageDeflate {threshold:1024}` no WebSocketServer — snapshot de
  8 MB vira **41,6 KB no fio** (terreno repetitivo; join da turma 160 MB→<1 MB).
  Smoke com cliente `ws` confirma negociação (undici/WebSocket global NÃO
  negocia deflate — testar compressão exige o pacote ws como cliente).
- **O que NÃO foi otimizado (decisão, 2026-07-19):** gzip do save em disco
  (24 ms/8 MB a cada 30 s não dói; mudaria o formato .ljw e o navegador não
  gunzipa síncrono — import quebraria); mesh de chunk maciço (greedy/worker
  seguem ADIADOS — gatilho = hitch/FPS reclamado no lab; ~1 s de mesh no join
  do mundo G, uma vez, é aceitável); time-slicing do buildAll (mesmo gatilho).
- Tamanho P/M/G: SÓ criação (menu select, worker init `tamanho`, LJ_TAMANHO,
  launchers perguntam). Save/snapshot sempre carregaram dims — zero migração.

### Launchers do servidor (raiz do repo, 2026-07-18)
- **`iniciar-servidor.bat` (Windows/escola) + `iniciar-servidor.sh` (casa/WSL)**
  facilitam o professor subir o host: menu de mundo (1=livre→`world.ljw`, 2-4=
  `cenarios/aulaN.ljw`), pergunta o código do professor (opcional → LJ_CODIGO),
  seta `LJ_NOVO=1` (cria o mundo livre na 1ª vez) e roda `npm run start -w server`.
- **O `.bat` roda por cmd.exe (duplo-clique)** — de propósito: cmd.exe usa
  `npm.cmd`, então NÃO cai no bloqueio de PowerShell (npm.ps1 + ExecutionPolicy,
  bug-232). Auto-`npm install` se `node_modules` não existe. `chcp 65001` pros acentos.
- Caminhos usam `/` (barra normal) e são relativos à RAIZ do repo — `daRaiz()`
  (paths.ts) resolve de REPO_ROOT independente do cwd, então `cenarios/aula1.ljw`
  funciona mesmo com o cwd em server/ (efeito do `-w server`). O banner cita 8080
  (default do LJ_PORT); trocar de aula ao vivo continua via `/mundo carregar` no jogo.

### Versão do jogo = fonte única em shared/ (2026-07-20)
- **`shared/src/version.ts` exporta `VERSION`** (constante TS pura). É a ÚNICA fonte
  de verdade da versão. Nenhum `package.json` tem campo `version` — não usar como fonte
  (o bundle do cliente não lê package.json sem config de Vite; duas fontes = drift).
- Importada pelos DOIS hospedeiros: boot do server (`index.ts` loga `Lógica em Jogo vX`)
  e menu do cliente (`menu.ts` → badge `#menu-version`, canto inferior direito do `#menu`,
  visível em toda tela do menu porque é filho absoluto do overlay `position:fixed`).
- Bump é MANUAL a cada marco. Ao subir a versão, mexer só em version.ts.

### Saves vivos em mundos/ + carregar no launcher (2026-07-20)
- **`aulas/` foi renomeada pra `mundos/`** (`PASTA_MUNDOS` em paths.ts). É onde
  moram TODOS os saves vivos: mundo livre (`mundos/mundo-livre.ljw`) + cópias de
  trabalho das aulas. Os MODELOS distribuídos seguem em `cenarios/` (tracked); os
  saves vivos viraram gitignored (`/mundos/`, `/world.ljw`) — turma não gera
  conflito no `git pull`.
- Mundo livre PADRÃO (sem LJ_SAVE) agora é `mundos/mundo-livre.ljw` (era `world.ljw`
  na raiz). Launcher migra o world.ljw antigo pra lá na 1ª execução (não perde a turma).
- Launcher (.sh/.bat) tem opção [8] "Carregar mundo salvo" e `/mundo lista` no jogo
  listam os saves de `mundos/`.

### Mundo = pasta própria + log de chat (2026-07-20)
- **Cada mundo virou uma PASTA: `mundos/<nome>/`** contendo `<nome>.ljw` (save) +
  `chat.log` (transcrição). Helpers em paths.ts: `nomeDoMundo`, `pastaDoMundo`,
  `savePathDoMundo`, `chatLogDoMundo`. `mundoDeTrabalho` devolve `{vivo, modelo?,
  somenteLeitura, chatLog}` — deriva o nome do basename, então LJ_SAVE pode ser o
  caminho antigo achatado OU o novo (normaliza pros dois).
- **Listagem** (mundos.ts `mundosDisponiveis`): escaneia as SUBPASTAS de `mundos/`
  (cada `<nome>/<nome>.ljw`) + `cenarios/*.ljw` (modelos); save vivo vence modelo de
  mesmo nome. Launcher [8] lista `for /d`/`for d in mundos/*/`.
- **Log de chat**: `registrarChat` no host (index.ts) engancha em `entregar` (ponto
  ÚNICO server→cliente). Um broadcast chama `entregar` 1×/destinatário com o MESMO
  payload → dedup por payload consecutivo (`ultimoChatLogado`) evita N linhas iguais.
  Grava `mundos/<nome>/chat.log` (append, `[ISO] autor: texto`). Reaponta na troca de
  aula (`chatLogPath` = `troca.chatLog`). Read-only (aula) TAMBÉM loga chat (útil pro
  professor), só não grava o .ljw.
- Migração nos launchers: `world.ljw` (raiz) e `mundos/*.ljw` achatados → `mundos/<nome>/<nome>.ljw`.
- Singleplayer (Web Worker/IndexedDB) NÃO tem fs → sem chat.log, sem pasta; export
  segue blob .ljw único (worldStore.ts). Fora de escopo, como o profiler-pro-servidor.

### Claim = COLUNA cheia, limite 64(X)×32(Z), professor cria (2026-07-20 → FINAL 2026-07-21)
- **ATUAL (2026-07-21, decisão FINAL do usuário):** claim é sempre COLUNA de altura
  total (força `min.y=0/max.y=teto` no runClaim E no restore) — NÃO é caixa. Isso impede
  ilha flutuante por cima / escavar por baixo. `claims.ts` exporta `MAX_CLAIM_X=64` e
  `MAX_CLAIM_Z=32` (SÓ dois — altura livre); `claimDentroDoLimite` checa só X e Z.
- **PROFESSOR cria claim** (2026-07-21): removido o `if (professor) return "..."` do
  `case "criar"` — professor reserva plot como o aluno (mesmo acesso, mesma 1-por-dono).
- **⚠️ Zigue-zague do usuário nesta sessão**: 1º pediu caixa 64×63×32 (implementei),
  2º mandou MANTER a coluna cheia (revertido). LIÇÃO: quando o pedido reverte um design
  deliberado (coluna anti-griefing da sessão 9), confirmar antes de escrever muito código.
- Teste do "claim gigante" (claims.test.ts): `mundoComTurma` é parametrizável por `dims`;
  pra estourar X=64 usa mundo de 5 chunks (80). Tamanho é checado ANTES da sobreposição.

### Cama = par horizontal de 2 células (2026-07-20)
- **Cama ocupa 2 células**, estilo Minecraft (pé + cabeceira), sem novos block ids:
  as MESMAS 4 direções (CamaXP..ZN, 96-99) são colocadas em DUAS células com o
  mesmo id. Espelha a PORTA (par vertical), mas horizontal.
- `camaHeadDir(id)` (blocks.ts) = vetor pé→cabeceira (oposto da frente, que encara
  o jogador). Placement (session.ts, igual à porta): valida a 2ª célula (bounds/ar/
  jogador/claim/confina) ANTES de materializar as duas.
- Metade cabeceira vs pé é INFERIDA pelo vizinho no eixo: no mesher (`isCama`),
  `ehPe = vizinho na direção da cabeceira é a mesma cama` → sem travesseiro; senão
  cabeceira (com travesseiro). Na regra de órfão (`camaRule`, rules.ts), a célula
  sem par no eixo (de um lado OU do outro) evapora — quebrar uma derruba a outra.
- Cliente NÃO muda: já manda 1 place com CamaXP+frente; o SERVIDOR coloca o par.
- Padrão reutilizável pra qualquer bloco multi-célula: par de mesmo id + vizinho
  infere a metade + regra de órfão. Não precisa de id novo por metade.

### Flores = sprite em cruz de 2 lâminas + tile cutout (2026-07-20)
- Flores (ids 104-107, 4 cores) são plantas ATRAVESSÁVEIS que precisam de apoio.
  Reusam padrões existentes: `precisaApoio` (place checa cubo cheio embaixo) +
  `torchRule` (some no tick sem apoio) + `isFlor` fora de isFullCube/isSolidBlock.
- Render SEM primitiva nova: 2 lâminas verticais finas cruzadas (+) via emitBox,
  com o tile de fundo TRANSPARENTE (`clearRect` = cutout, igual folhas/janela) →
  parece plantinha. Um tile por cor (74-77); no mesher `TILE.florVermelha + (id −
  FlorVermelha)`. blocksUi dá a entrada da hotbar; place usa o caminho genérico.

### Perfilador é ANÔNIMO + carrega a versão (2026-07-23)
- Saída do perfilador (HUD F3 → JSON/enviar): corpo carrega `versao: VERSION`
  (hud.ts `stats()`, import de @logica/shared) — todo perfil identifica a versão do
  jogo que rodou. NOME de jogador NÃO é coletado: o corpo nunca teve; o filename do
  host virou `perf-<timestamp>-<sufixoAleatório>.json` (index.ts `interceptarProfile`),
  sem `quem.name`. Identifica-se por versão + dispositivo (userAgent/GPU), nunca por aluno.
- JSONs crus são gitignored (`/profiles/`, `/profiles-escola/`). O que vale como
  registro histórico é o resumo AGREGADO e anônimo em `registros/perfilador-*.md`
  (uma linha por dispositivo, sem nome). Ver [[registros-folder]] conceito no README.

### registros/ = memória de evolução do projeto (2026-07-23)
- Pasta na raiz pra registro de longo prazo FORA do `.wolf/` (que é log técnico do
  OpenWolf): resumos de perfilador por versão + `prints/` de marcos. Capturas headless
  de dev saem em pasta temporária/scratchpad — as que valem registro são copiadas
  manualmente pra `registros/prints/`. NÃO há galeria automática de prints ainda.

### Colisão PARCIAL + step-up + `collisionBoxes` como forma única (2026-07-25)
- Lajes (149-154) e escadas (155-178) trouxeram o 1º bloco de colisão de ALTURA
  PARCIAL. Fonte única = `collisionBoxes(id)` em blocks.ts (frações da célula):
  laje = 1 meia-caixa; escada = base meia-altura (pegada CHEIA) + degrau meia-pegada.
  **A MESMA função alimenta o mesher (a forma emitida) E a física (colisão)** — não
  há duas verdades. Blocos comuns caem no fallback cubo cheio `[[0,0,0,1,1,1]]`.
- Física (physics.ts) mudou em 3 pontos, TODOS retrocompatíveis com cubo cheio
  (313 testes, os 304 antigos intactos): (1) `collides` — cubo/cerca/porta/móvel
  ainda ocupam a célula toda (`!temColisaoParcial → return true`); só laje/escada
  testam AABB vs sub-caixas. (2) `resolveVertical(dir)` — pousa/bate no TOPO/BASE
  REAL da sub-caixa (laje = 0.5), não na fronteira da célula; para cubo cheio dá o
  mesmo valor de antes (`floor+1`). (3) `moveHoriz` = step-up: parede parou o passo
  + pés no chão → sobe `STEP_HEIGHT=0.55`, avança, pousa; cubo cheio (altura 1) NÃO
  sobe (colide após subir 0.55). X/Z ainda encostam na fronteira de célula — exato
  porque a base da laje/escada tem pegada CHEIA em X/Z.
- `hasSupport` (edge-guard do agachar) também virou parcial: apoio pode ser um topo
  0.5 na PRÓPRIA célula dos pés (antes só olhava a célula de baixo → bug em laje).
- Direcional no cliente igual aos móveis: 1 entrada na hotbar (âncora), direção do
  olhar + metade da FACE clicada (mira por baixo `target.ny<0` = laje/escada de
  cima). `escadaId(mat,facing,top)` monta o id. Server NÃO muda (1 célula, `applyBlock`
  genérico; `isPlaceable` valida pela faixa). Ver [[nao-cubos-mesher-emitshape]].
- Vidro colorido (137-148): cubo CHEIO transparente. Reusa o material cutout/alphaTest
  do vidro comum (SEM material novo) — a "translucidez" é DITHER (~40% dos pixels
  pintados no atlas, `paintVidroCor`). Funde com vidro do MESMO id, mostra face contra
  cor diferente. `isTransparentBlock` cobre; `isFullCube` continua true.

## Cerebrum — Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

- [2026-07-22] **Água FLUIDA (autômato celular) — escopo travado por AskUserQuestion (2 rodadas).**
  Decisões do usuário: (1) v1 CUBO CHEIO, não altura-visual-por-nível (destrava o fluxo antes; altura =
  refino); (2) água INFINITA sim (2 fontes+chão→fonte, estilo Minecraft); (3) fonte via ITEM BALDE (não
  bloco na hotbar); (4) fluxo SEMPRE LIGADO (o usuário abriu mão do gate anti-grief `/agua` que eu havia
  recomendado); (5) balde RECOLHE (cheio↔vazio, exige raycast acertar a água com balde vazio); (6) o id
  de água 129 SAIU da hotbar (água só via balde/fluxo). Modelo: `Agua`=129 vira a FONTE (nível 8);
  `AguaFluida1..7`=130-136 codam o nível NO id (1 byte, sem metadata). `waterRule` entra na REGRA DE OURO
  (rules.ts) — NADA de engenharia nova no tick; o autômato "empurra vizinho + recomputa o próprio nível"
  reusa `dirty`+`applyBlock`+`markDirtyAround`. **INSIGHT-CHAVE que matou o "disco flutuante":** espalhar
  lateral SÓ com APOIO SÓLIDO embaixo (`isFullCube(below) && !isAgua(below)`); AR embaixo → só CAI (coluna
  cheia 7), nunca lateral. Assim fonte no ar despenca em coluna única; água fluida embaixo NÃO é apoio
  (senão a coluna que enche vira "chão" e o disco cresce a cada tick). Alcance 7 (nível decrementa por
  distância) = bounded → não trava tablet, sem teto de células/tick explícito. Ver [[bug-disco-flutuante-agua]].
- [2026-07-22] **Água = SEMPRE pulada no raycast de mira (opção B) + LÍQUIDO SUBSTITUÍVEL.**
  Pedido: colocar bloco olhando ATRAVÉS da água. Escolha do usuário entre (a) pular só ao colocar
  (mantém mira pra quebrar) e (b) SEMPRE pular = usuário escolheu **(b)**. Consequência aceita: a
  mira é a mesma pra place e break (main.ts `target`), então água nunca é alvo — não dá pra QUEBRAR
  água, só SUBSTITUIR pondo outro bloco no lugar. Pra isso o gate de colocação (session.ts:594,
  +porta:620/cama:645, hoje `getBlock !== Air`) passa a aceitar "vazio OU substituível" via
  `isReplaceable(id)` novo em blocks.ts (água já; lava/capim/neve futuros herdam). `applyBlock` já
  sobrescreve. A colocação atinge a água COLADA no sólido atrás (`target+normal`), então poça funda
  enche de trás pra frente — OK no estático; reavaliar na fase de água FLUIDA. Refino no todo.md
  (seção Água) + Key Learning do raycast cubo-cheio. ✅ CODADO (2026-07-22): `isReplaceable` em
  blocks.ts, raycast pula `isAgua`, 3 gates de place_block em session.ts; 290 testes, typecheck 0,
  build ok. NÃO commitado, playtest no browser pendente. O caso GERAL (porta/cerca por forma no
  raycast) segue backlog no todo.md.
- [2026-07-20] **Versão do jogo sai do package.json da raiz; bump com `npm version`.**
  Antes `shared/src/version.ts` tinha a string hardcoded (bump manual). Pedido do usuário:
  usar o fluxo padrão do npm. Agora version.ts faz `import { version } from "../../package.json"`
  (named import → o bundler faz tree-shake, o resto do package.json não entra no bundle do
  cliente). Precisou de `resolveJsonModule:true` no tsconfig.base (sem `rootDir` + `noEmit`, o
  import fora de `src/` não gera erro de escopo). Funciona nos 3 hosts: Vite inlina o JSON,
  tsx resolve em runtime (server loga a versão), vitest idem. Bump daqui pra frente:
  `npm version patch|minor|major` na RAIZ com árvore limpa (bumpa + commit + tag `vX.Y.Z`);
  push com `git push --follow-tags`. NÃO rodar `npm version` com working tree suja (ele exige
  limpo, salvo `--no-git-tag-version`). Os packages dos workspaces seguem sem campo `version`.
- [2026-07-20] **Claim (cp24) = COLUNA de altura total, não caixa 3D.** Decisão do
  usuário: o claim deve pegar da camada 0 (bedrock) ao teto do mundo. Motivo: com claim
  de altura parcial, um estranho podia construir uma ILHA FLUTUANTE por cima da área
  reivindicada (ou escavar por baixo). Implementação: aluno ainda marca 2 cantos com a
  varinha, mas o servidor IGNORA o Y marcado e força `min.y=0` / `max.y=world.sizeY-1`
  no `/claim criar`. `MAX_CLAIM_Y` removido; `claimDentroDoLimite` só valida XZ (≤32).
  Guardar a caixa full-height (em vez de tornar `claimEm`/`caixasSeCruzam` XZ-only)
  mantém TODA a lógica 3D existente intacta (regionContains, overlap, wireframe do
  cliente, dims do /claim lista) — zero mudança no cliente. Efeito colateral desejado:
  2 claims não podem mais dividir a mesma pegada XZ em alturas diferentes (colunas não
  se empilham). Saves antigos sobem pra coluna cheia no restore.

- [2026-07-16] **Git = canal de sync casa↔escola (decisão do usuário).** O PC
  de casa (onde o dev roda) é acessado do notebook da escola via Tailscale +
  Moonlight; pra levar o jogo pro notebook, TUDO que não é temporário vai pro
  repo: cenários .ljw, cópias de trabalho em aulas/, client/dist (notebook não
  precisa buildar). `.gitignore` mínimo. Sempre COMMITAR + PUSH ao fechar
  trabalho — o push é a sincronização.
- [2026-07-16] **Detecção de tablet: `pointer: coarse`, NÃO
  `ontouchstart`/maxTouchPoints.** O plano original detectava "tem
  touchscreen", mas notebook com tela de toque tem touchscreen E mouse — o
  modo toque desligaria o pointer lock e QUEBRARIA o mouse de quem joga com
  ele. `pointer: coarse` pergunta qual é o ponteiro PRIMÁRIO: tablet/celular =
  dedo (liga a UI), notebook touch = mouse (desktop normal). `?touch` na URL
  força pra teste/demonstração no desktop (e auto-entra no jogo — screenshot
  headless depende disso).
- [2026-07-16] **Trilha sequencial: auto-limpa + carrega a próxima sequência na
  MESMA faixa.** No modo `sequencial`, ao um escopo (grupo/mundo) concluir a
  sequência ativa, o tick chama `carregarProximaSequencia(g)` → repõe o
  `baseline` do PRÓXIMO objetivo ativo NA MESMA área (a semente, em geral vazia).
  Assim o professor só cria os modelos (N objetivos `construir` na mesma faixa,
  sequencial) e o aluno passa por cada um sem ninguém limpar à mão. Reusa o
  baseline que já existia (bug-207). `restaurarAreasBaseline` passou a depender
  do MODO: sequencial restaura só a faixa ATIVA de cada escopo (trilha começa na
  1ª); livre restaura todas (objetivos simultâneos, cada faixa é sua). Sempre-
  ligado em sequencial (sem flag): com faixas separadas por objetivo vira quase
  no-op. Autoria: cada objetivo captura baseline no `/objetivo add` = estado da
  faixa naquele instante — não semeou = começa vazio; semeou = pista por etapa.
- [2026-07-16] **Cabines viraram PLOT demarcado (paredes removidas, pedido do
  usuário).** `generateCabinsWorld` não faz mais paredes de tábua 2-alto: agora
  desenha uma BORDA de pedra-lavrada (`PLOT_MARKER`=StoneBricks) rente ao chão
  (substitui a grama do perímetro do footprint 5×5). Delimita a área do grupo
  SEM obstruir movimento nem tapar visão. Preset key continua `"cabines"` (menos
  churn em gerar.ts/hosts/menu/testes); só o comportamento e os comentários
  mudaram. Spawn ainda desloca +8 pro meio do chunk. `verificar.ts` passou a
  conferir o marcador em `FLAT_SURFACE_Y` no canto (antes checava Planks em y+1).
- [2026-07-16] **`/regiao sortear nome id…`** — preenche a região sorteando
  célula a célula entre os ids dados (Math.random; autoria = gabarito ALEATÓRIO
  na hora: professor sorteia → refotografa com `/objetivo add construir` →
  reinicia). Passa por `applyBlock` (regras + detecção acordam igual a `/regiao
  encher`). Sortear é ação de autoria, não simulação → RNG não-semeado é ok;
  teste valida só o invariante (toda célula ∈ ids), independente do sorteio.
- [2026-07-10] **Voxel web, engine própria** (não Minecraft Edu): custo/licença zero p/ rede
  pública; e permite autoria de cenários pelo professor, que é o diferencial vs Minecraft Edu.
- [2026-07-10] **Cliente=servidor (servidor integrado)**, igual Minecraft: um módulo de lógica
  autoritativo roda em Web Worker (single), .exe portátil (Tauri/Node SEA) e servidor Node
  (dedicado) sem reescrita. Escolhido vs P2P WebRTC (signaling = servidor de qualquer forma).
- [2026-07-10] **Contas:** nome + código de turma, SEM senha → sem dado sensível de menor,
  sem LGPD, sem senha esquecida. Rejeitado login completo (backend + LGPD) por ora.
- [2026-07-10] **Save no PC do host** (professor). Rejeitado save-no-Drive automático de início
  (dependeria de o professor lembrar de exportar).
- [2026-07-10] **MVP v0 enxuto:** blocos + movimentação + netcode + chat/1 comando. FORA:
  crafting, comandos complexos, circuitos, contas com senha, mundos online.
- [2026-07-10] **Render 3D FECHADO: three.js** (vs Babylon.js). Razões: (a) arquitetura já
  põe física/colisão/estado em `/shared` — os extras do Babylon rodariam no cliente e
  violariam "cliente só desenha"; (b) exemplos voxel em three.js abundam (manual oficial tem
  capítulo voxel) → vibecode acerta mais; (c) chunk meshing custom = BufferGeometry puro,
  forte do three.js; (d) UI/chat em HTML/CSS sobre o canvas, GUI de engine desnecessária.
- [2026-07-10] **Política de otimização fechada** (ver STATUS.md): baseline = mesh por chunk +
  culled meshing + Uint8Array + atlas + snapshot binário + mundo fixo pequeno (isso é
  viabilidade, não otimização prematura — retrofit seria reescrita). Adiadas com gatilho:
  greedy meshing, worker de meshing, lerp, gzip. Proibidas: prediction/rollback, ECS, octree,
  WebGPU, protobuf, LOD/streaming, WASM. Racional: 8–20 alunos em LAN, mundo pequeno, PCs
  fracos — escopo fixo elimina a necessidade das técnicas pesadas.
- [2026-07-10] **Tamanho do mundo: parâmetro de CRIAÇÃO do mundo** (chunks X×Z×Y no header
  de save/snapshot), não constante nem resize ao vivo. Default 8×8×4, teto 16×16×8 validado
  no servidor. UI de escolha fica pra fase de autoria. Pedido do usuário.
- [2026-07-10] **Perfilação nasce com o código** (pedido do usuário): HUD F3 (FPS, frametime
  méd+p95, remesh, renderer.info, rede) + `debug_stats` do servidor 1×/s + export JSON pros
  testes de lab/relatório. Racional: gatilhos da política de otimização exigem medição, e
  dev vibecode decide por métrica visível, não lendo código. FORA: flame graph/telemetria.
- [2026-07-10] **Render: WebGLRenderer, não WebGPURenderer.** WebGPU do three.js ainda
  experimental (casos de perf PIOR que WebGL) e labs de escola têm GPU fraca/driver velho.
  Reavaliar só depois do piloto.
- [2026-07-11] **Identidade por mundo: nome + PIN de 4 dígitos, NÃO senha.** Usuário pediu
  senha; desafiei com as razões de 2026-07-10 (LGPD, senha esquecida aos 7 anos) e
  perguntei o que protege. Resposta: "aluno entra com nome do outro e grava/destrói em
  nome dele" → PIN resolve com fricção mínima. Aceito: auto-registro na 1ª entrada,
  `/resetpin nome` pro professor. Guardar só hash, no save do mundo, no PC do host.
- [2026-07-11] **Blocos grupo A aprovado e feito** (14 cubos opacos, IDs 5–18); grupos B
  (transparentes — mexem no mesher) e C (não-cubos) explicitamente adiados pelo usuário.
- [2026-07-11] **MVP v1 "Aula persistente" APROVADO** com escopo: save/load (cp7),
  menu principal (cp8 — pedido do usuário: singleplayer, multiplayer, configurações
  de teclas/som/gráficos), PIN+professor (cp9), física do move se sobrar (cp10).
- [2026-07-11] **Save: no servidor SÓ o host grava; singleplayer salva no navegador
  do próprio jogador** (IndexedDB) — decisão do usuário. Mesmo formato .ljw nos dois
  + exportar/importar arquivo (= distribuição via Drive).
- [2026-07-11] **Código de professor definido na CRIAÇÃO do mundo** (aprovado);
  no singleplayer o jogador é professor automático.
- [2026-07-12] **PIN e código de professor em TEXTO PURO no save — SEM hash** (decisão
  do usuário, revogando o hash FNV-1a implementado horas antes): "uso muito básico, não
  tem informações importantes". Ganhos: auth.ts vira só isValidPin, host imprime o código
  em TODO boot (recuperação grátis), professor lê PIN esquecido no save. O que segura a
  ameaça real (colega na LAN) é o rate-limit do join, não criptografia.
- [2026-07-12] **Código de professor no host Node: env LJ_CODIGO define/troca; sem env
  usa o do save; mundo novo gera 6 chars.** Impresso no console em TODO boot (texto puro
  permite). Errar o código NEGA o join em vez de entrar como aluno silenciosamente.
- [2026-07-12] **join_denied no cliente = alert(motivo) + voltar pro menu limpo**
  (location sem query — cobre o boot via ?server=). PIN nunca vai pro localStorage:
  PC de laboratório é compartilhado.
- [2026-07-12] **MVP v2 (cenários) — escopo travado na entrevista:** cenário = mundo +
  objetivos + textos no MESMO .ljw; progressão sequencial OU livre, por cenário; 3 tipos
  de objetivo (construir padrão / chegar em local / limpar região) na MESMA engrenagem
  das rules; autoria por comandos de chat ANTES do painel (painel HTML vem depois);
  gabarito FOTOGRAFADO do mundo (WYSIWYG), com escolha por objetivo de manter o modelo
  visível ou apagar; progresso por mundo E por grupo — sistema de grupos: professor cria
  com tamanho, aluno entra por comando/painel, painel de aluno só abre após grupos
  criados; singleplayer = grupo de 1.
- [2026-07-12] **Grupos MVP v2 (2ª rodada da entrevista):** `/grupo criar` auto-distribui
  todos os online (round-robin) e notifica; aluno sem grupo NÃO participa; grupos são
  opcionais por mundo (sem grupos = turma toda junta); grupo persiste no save; construir
  por grupo = 1 gabarito + 1 área POR GRUPO, com carimbo de áreas (tamanho + espaçamento);
  "chegar" com regra todos/um POR OBJETIVO (idade da turma); mundos predefinidos entram
  no v2 (preset "plano" + mundo-modelo de cabines no canto do chunk, lado aberto pro
  centro; cabine do professor = gabarito). Parâmetro do criar (decidido 2026-07-12):
  as DUAS sintaxes — `/grupo criar 5` = 5 grupos; `/grupo criar 5 alunos` = grupos de 5.
- [2026-07-13] **Fase pós-MVP v2 escolhida pelo usuário: POLIMENTO "blocos +
  mecânica" (cp15–cp18) antes dos cenários pedagógicos.** Pedidos: corrida
  (Ctrl OU duplo-toque, os dois), agachar Shift SEM cair da borda (mecânica
  Minecraft explícita), painel estilo inventário + hotbar. Blocos: usuário
  escolheu "opacos + vidro/folhas" (recomendação aceita); água adiada
  (fluido = fase própria). Cenários reais + piloto ficam pra fase seguinte.
- [2026-07-13] **Transparentes por CUTOUT (alphaTest), não por blending.**
  Razões: material/draw call únicos preservados (política de otimização),
  zero problema de ordenação de faces, e o visual "vidro de moldura" é o
  suficiente pro público. Água NÃO entra nesse esquema (precisa de blend de
  verdade) — por isso ficou fora do cp18.
- [2026-07-13] **Hotbar de 9 slots + inventário click-assign (sem drag).**
  Clique no bloco põe no slot SELECIONADO; clique no slot seleciona. Drag &
  drop rejeitado: complexidade sem ganho pra alunos de 7–14 anos em PC de
  lab (mouse ruim). Hotbar persiste POR NAVEGADOR (localStorage), não no
  save — é preferência de UI, não estado de mundo.
- [2026-07-10] **Código mora em `~/projetos/logica-em-jogo` (WSL ext4), NÃO no OneDrive.**
  OneDrive sincroniza node_modules (milhares de arquivos) e watcher do Vite via /mnt/c é
  lento no WSL. Docs + `.wolf/` ficam no OneDrive; backup do código via git/GitHub privado.

### 2026-07-14 — Cenários gerados por script, e auto-conferidos
- **Produção via script gerador** (escolha do usuário) em vez de autorar à mão no jogo:
  reprodutível, versionado, fácil de ajustar (mudar nº de grupos = uma flag).
  Custo aceito: o fluxo do painel do professor NÃO é exercitado pelo gerador — quem
  exercita é o playtest do usuário.
- **A conferência roda DENTRO da geração** (`verificar.ts` chamado por `gerar.ts`):
  abre o .ljw num servidor novo, entra prof + 2 alunos, completa a área do grupo 1 e
  exige o "concluído". Cenário que não fecha não vira arquivo (exit 1). Motivo: um
  .ljw quebrado só apareceria na frente de 20 alunos.
- **Guarda de geometria** confere que a faixa está no chão, fora da cabine e dentro do
  chunk do grupo — o roteiro promete isso ao professor, e nenhum teste lógico pegaria
  uma faixa flutuando ou enfiada na parede.
- **Turma do piloto: 6º–9º.** Por isso o gabarito é APAGADO depois de fotografado
  (aluno infere a regra) — a flag `--revelar` deixa o modelo à vista e vira tarefa de
  cópia, para turmas mais novas.

### 2026-07-15 — Servidor serve o cliente na MESMA porta (não Vite separado no piloto)
- Decisão: o host Node serve `client/dist` na MESMA porta do WebSocket
  (`createServer(servirCliente)` + `WebSocketServer({ server: http })`), em vez de
  o aluno abrir o Vite numa porta e o WS noutra.
- **Porquê:** (1) HTTPS bloqueia `ws://` por mixed-content, e o servidor da escola
  não tem certificado pra `wss://` — mesma origem (mesma porta) elimina o problema;
  (2) o aluno digita UM endereço (`http://ip-do-prof:8080`) e joga, sem saber o que
  é WebSocket; (3) um binário só (quando empacotar) já carrega o cliente junto.
- Vite dev (`npm run dev`, 5173) segue vivo pra desenvolver com hot-reload — a
  decisão é só sobre COMO o piloto roda, não substitui o fluxo de dev.
- Empacotar (.exe Tauri/Node SEA) segue ADIADO por decisão do usuário ("ainda quero
  alterar mais coisas"): por ora o professor precisa de Node instalado.


### 2026-07-17 — Anti-griefing (cp24): escopo travado por entrevista
Sistema de CLAIMS + GRUPOS DE AMIGOS pra aluno proteger sua área. Decisões
fixadas com o usuário (2 rodadas de AskUserQuestion):
- **Unidade = REGIÃO (varinha).** Reusa regions.ts + a varinha do cp11; aluno marca
  2 cantos. NÃO por bloco (caro) nem raio (formato fixo).
- **Quem edita = dono + grupo de amigos.** Fora disso, bloqueado (menos professor).
- **Grupo de amigos = sistema NOVO do aluno** (não os grupos pedagógicos do cp13).
  Aluno cria, convida; entrada por CONVITE + ACEITE (os dois consentem).
- **Ativação = professor liga/desliga** (`/claim ligar|desligar`, tipo /voo). NÃO é
  automático nem sempre-ligado — mundo-aula normalmente fica desligado.
- **Limite = 1 claim por aluno, tamanho máx fixo** (anti-abuso escolar).
- **Persiste no .ljw** (meta JSON, cresce sem re-versionar — cp7). Em mundo-aula
  (read-only) não salva → claim reseta por turma, coerente com aula efêmera.
- **Aluno ganha a varinha** só pra claims: as marcas dele alimentam `/claim criar`,
  não `/regiao` (que segue só-professor no servidor).
Assumido (não perguntado, confirmar se mudar): professor ignora todo claim;
bloqueio manda chat de aviso + som `denied`; servidor é a barreira real (regra da
rocha-matriz); claim não sobrepõe outro claim nem região do professor; aluno em 1
grupo de amigos por vez; claim bloqueia AÇÃO DE JOGADOR (place/break/use), não
regra automática (areia caindo não é grief). NÚMEROS a confirmar: MAX_CLAIM_DIM
(proposto 16/eixo), MAX_AMIGOS (proposto 6 incl. dono).
- [2026-07-20] **Operações "escrever arquivo no host" viram mensagem de protocolo
  interceptada no server/src/index.ts, NUNCA um case na GameSession.** Padrão
  fixado por /mundo (cp19) e /kicar (cp22), reusado pro `profile_report` do
  profiler: `session.handleMessage` roda DEPOIS de `interceptarX()` checar o
  `type` e devolver `true` se engoliu a mensagem. Racional: GameSession é pura/
  host-agnóstica (roda igual em Web Worker e Node+ws) — filesystem só existe no
  host Node. Consequência: em singleplayer (Web Worker) essas mensagens caem no
  vácuo em silêncio (sem case no switch da session) — comportamento aceito, não
  bug, pois não há pasta de servidor pra gravar. Payload "diagnóstico" (não
  estado de jogo) fica **opaco** no protocolo (`Record<string, unknown>` +
  teto de tamanho, ex. `MAX_PROFILE_REPORT_CHARS`) em vez de tipado campo a
  campo — mesmo espírito do meta JSON de save/quadros: cresce sem re-versionar
  o protocolo toda vez que hud.ts ganha uma métrica nova.

### 2026-07-20 — Terreno procedural v1 (plano aprovado em discussão, pré-implementação)
- **Biomas via campos de clima, NÃO truth table**: 2 value-noise de baixa freq (temp+umid, x/80) → lookup Whittaker. Coerência de vizinhança emerge da continuidade do noise (deserto nunca encosta em neve). Truth table foi considerada pelo usuário e descartada: N² entradas + vira WFC + pouca diversidade.
- **Heightmap global único; bioma = pintura + decoração** (v1). Sem penhasco de fronteira por construção. Blend de altura por parâmetro fica pra v2.
- **Variante de grama = ID de bloco próprio** (GramaSeca/GramaFria), não tint: mesher é puro (bytes→geometria, sem seed), save carrega aparência. Thresholds da grama independentes dos do bioma → faixas de transição = blend visual (pedido do usuário).
- **Minérios = cubos placeholder** (textura pedra+pontos+sigla), sem drop/craft — porta de entrada do survival sem mecânica nova.
- **Árvores por espécie restritas ao bioma dono** (registro em biomas.ts): carvalho=planície/floresta, bétula=floresta, pinheiro=tundra, cacto=deserto.
- **Cacto = cubo cheio v1** (forma custom adiada).
- **Seed por mundo novo vira aleatória** (header LJW0 já grava seed; hoje WORLD_SEED fixo 20260710 = todo mundo normal idêntico).

### 2026-07-20 — Key Learnings (sessão gen procedural)
- **LJ_SAVE SEMPRE mapeia pra `mundos/<nome>/` do repo** (layout sessão 6c): path absoluto externo em LJ_SAVE é renomeado pra dentro de PASTA_MUNDOS pelo paths.ts. Server de teste/screenshot POLUI `mundos/` — apagar a pasta do mundo de teste depois. (`flor-world/`, `jstage/`, `stage/` em mundos/ são resíduos de sessões antigas.)
- **Screenshot headless do jogo**: chrome do puppeteer (`~/.cache/puppeteer/chrome/*/chrome-linux64/chrome`) `--headless --no-sandbox --screenshot=X --window-size=1280,720 --virtual-time-budget=25000` + URL `?server=ws://127.0.0.1:PORT&nome=cam&pin=1234&hora=10&yaw=N` (auto-join sem menu). Server: `LJ_PORT=… LJ_SEED=… LJ_NOVO=1 npx tsx src/index.ts` em bg; esperar ~10s antes do chrome.
- **Matar o server de teste: `fuser -k PORT/tcp`**, NUNCA `kill $!` (npm/npx deixam filho órfão segurando a porta → screenshots seguintes batem no server errado) e NUNCA `pkill -f "padrão"` de dentro do mesmo Bash (o padrão casa com a cmdline do próprio shell → suicídio, exit 144; truque `[s]rc` não salva se a string aparece noutro trecho do script).

### 2026-07-20 — Do-Not-Repeat
- NÃO usar `kill $PID_DO_NPM` pra derrubar server de teste (órfão) nem `pkill -f` dentro do próprio script Bash que contém o padrão. Usar `fuser -k porta/tcp`.

### 2026-07-20 — User Preferences (playtest do gen v1)
- **Neve NÃO combina com bioma quente**: pico da caatinga fica areia; neve exige altura E temp<0.6 (worldgen). Estética > regra puramente de altura.
- **Copa de árvore deve ENGLOBAR ≥1 bloco de tronco** — copa "flutuando" acima do tronco (ipê v1) ficou estranho. Teste de contrato em arvores.test.ts cobre as 4 espécies.
- Inventário com 100+ blocos: usuário quer ABAS por categoria (mobília/blocos/vegetação/minérios) — registrado no todo.md, não é próxima fase travada.

### 2026-07-20 — Decision Log (montanhas)
- **Altura 128 pra TODOS os tamanhos de mundo novo** (P 2MB, M 4,5MB, G 8MB) — pedido do usuário ("montanhas de verdade"). DEFAULT_WORLD_CHUNKS (64) fica: mundo plano/aula/testes não precisa de céu e o save é metade.
- **Serra do heightAt é GATED por sizeY>=128** (param novo, default 128): em mundo baixo a serra clampada viraria mesa cortada E quebraria 15 testes de session/claims que assumem o relevo antigo no mundo default. heightAt(x,z,seed,sizeY) — quem compara heightAt com mundo gerado DEVE passar world.sizeY.
- Neve 58+ (só frio temp<0.6), pedra nua 85+ (chapada quente), carvão até 72 / ferro até 40 — montanha minerável.

### 2026-07-20 — Decision Log (STREAMING DE CHUNKS — obra em fases)
- **Usuário quer mundo procedural MUITO maior com chunks gerados em runtime** + configs de desempenho (raio de render, chunks/tick). Decisão travada (AskUserQuestion): **GIGANTE FINITO** (ex. 4096², limite no header como sempre), não infinito — bounds/claims/confinamento seguem simples.
- A política antiga "streaming = proibido/overengineering" cai — produto evoluiu (direção survival/exploração). Anotar: escola NÃO deve dar git pull até estabilizar.
- **Fases**: F1 núcleo esparso+gen por chunk ordem-independente (esta sessão); F2 protocolo de streaming por raio de interesse + cliente carrega/descarta + configs; F3 save esparso LJW1 (só chunks EDITADOS — gerado limpo regenera); F4 bordas (física em chunk ausente, rules, /tp, spawn); F5 eviction/perf.
- **Design F1**: `World.chunks` vira `(Uint8Array | undefined)[]` — array DENSO DE REFERÊNCIAS (não Map): indexação O(1) intacta nos hot paths (mesher/física), 4096²=524k slots=4MB de ponteiros. Chunk ausente: getBlock=ar, setBlock=ignora (comportamento que já existia pra OOB).
- **Invariante-chave do gen lazy: ORDEM-INDEPENDÊNCIA** — gerar colunas de chunks em qualquer ordem = mesmos bytes. Como: (a) decisão de feature NUNCA lê o mundo — `topoPrevisto(x,z,seed,sizeY)` puro (fórmula, igual ao F3/HUD); (b) árvore vira lista PURA de células (`celulasDaArvore`) e cada chunk-coluna re-deriva árvores das colunas vizinhas (margem 2) escrevendo SÓ a própria fatia; (c) veias de minério por chunk-coluna (seed derivado de cx,cz) re-derivadas pelas 8 vizinhas com filtro de escrita.
- Unidade de geração/streaming = COLUNA de chunks (cx,cz) — os 8 chunks Y nascem juntos (terreno é por coluna de blocos).

### 2026-07-21 — Key Learnings (streaming F3 + tooling)
- **Save esparso do mundo lazy (LJS2)**: só chunks EDITADOS (editedChunks marcado em applyBlockQuieto, pega jogador+gravidade). Restore regenera cada coluna editada do seed e SOBREPÕE os bytes salvos — determinismo do gen garante que o resto do mundo é idêntico. Save de mundo E gigante = KB (4341 bytes com 1 edição), não GB.
- **SIGINT não propaga por `npx tsx ... &`** (npx engole o sinal, filho vira órfão, porta fica aberta). Pra smoke que precisa do saveNow no SIGINT (process.on("SIGINT")), rodar `node --import tsx server/src/index.ts` — aí `kill -INT $!` atinge o processo certo e o server sai limpo gravando o save.
- **LJ_SAVE com path absoluto/relativo é SEMPRE remapeado pra mundos/<nome>/<nome>.ljw** (paths.ts). O save do smoke não aparece no path que você passou — procurar em mundos/.

### 2026-07-21 — Decision Log + Key Learnings (água + /claim professor/caixa + varinha mobile)
- **Bloco de água (id 129, append)**: cubo cheio pro MESHER (`isFullCube`=true → funde
  com água vizinha: `neighbor===id` no mesher culla a face interna, mostra só a casca do
  volume) mas NÃO-sólido pra física (`isSolidBlock`=false → o jogador entra). Translúcida
  SEM tocar no material: o chunk é 1 draw call cutout (`alphaTest:0.5`, sem blending) — o
  tile de água é azul com furos em XADREZ (`(x+y)%3===0`), os furos deixam ver o fundo =
  translucidez barata. `isTransparentBlock`+=Agua. Truque reusável pra qualquer "vidro/água".
- **Nado (physics.ts)**: `inWater(pos)` amostra o TORSO (`y+height*0.5`). Submerso →
  velocidade horizontal × `waterFactor`(0.5), empuxo (`waterGravity`=8 < 25, afunda até
  `waterSinkMax`=3), pular = subir / agachar = descer a `swimSpeed`(4). SEM fluxo de fluido
  (fase própria). stepPlayer NÃO mudou de assinatura — testes de física antigos (mundo sem
  água) seguem idênticos.
- **/claim: professor cria + claim vira CAIXA + limite 64×63×32** (pedido do usuário,
  reverte a coluna cheia da sessão 9). Motivo do usuário: professor reserva "terreno"/plot
  como o aluno; caixa (não coluna) porque plot não precisa travar do bedrock ao céu.
- **GOTCHA de teste (bug-434)**: no `place_block` a guarda "não emparedar jogador" roda
  ANTES do gate de claim. Testar claim mirando a célula do PRÓPRIO spawn do aluno barra pela
  guarda (bloco fica Air) mas SEM a chat de claim → mirar longe do spawn (sx±1, sz±1).
- **Varinha no mobile (sem tecla R)**: os botões de toque ⛏/▣ chamam `input.press(0/2)`
  = MESMO handler do clique esq/dir, que já checa `varinhaAtiva`. Então basta um botão
  toggle 🪄 (chama o `toggleVarinha` extraído) — zero caminho novo de marcação de canto.
- **Adicionar bloco = bumpar o sentinel de blocks.test.ts** (bug-370, recorreu de novo):
  `expect(BlockId.Novo).toBe(N)`, `isPlaceable(N)=true`, `isPlaceable(N+1)=false`, e
  `MAX_BLOCK_ID` em blocks.ts. Checklist de bloco novo: BlockId + MAX_BLOCK_ID + helper +
  isTransparentBlock/isSolidBlock (se for o caso) + TILE + BLOCK_TILES + paint no atlas +
  chamada do paint + PLACEABLE (blocksUi) + sentinel do teste.

### 2026-07-21 — Banimento + painel de jogadores + profiler 10s
- **Kick é do HOST, ban é DIVIDIDO**: `/kicar` fecha socket (transporte) → mora no host
  (index.ts). Ban precisa de ESTADO (lista + gate de join + persistência) → na GameSession,
  MAS banir alguém online também fecha o socket → então `/banir`·`/desbanir` moram no HOST
  (interceptarBanimento), que chama `session.banir/desbanir` e fecha o socket como o /kicar.
  Gate de join: `estaBanido` no topo de `authenticate` (antes do PIN). Persiste em
  `SaveMeta.banidos[]` (só mundo livre; some em aula read-only). Case-insensitive.
- **`broadcastPlayers` PULA singleplayer** (`if (this.singleplayer) return`): a Web Worker
  não gere turma e /kicar·/banir são do host (nem intercepta). Sem esse guard, o join/saída
  emite 1 msg `players` a mais e QUEBRA os testes de contrato que contam mensagens
  (`toHaveLength(4)` em session.test.ts) — bug-435.
- **PlayersPanel copiou a moldura do InventoryPanel** (altura fixa `#painel/#inventario/
  #jogadores` compartilham CSS; rolagem só na `.jog-lista` com `flex:1;overflow-y:auto`).
  Abas reusam `.inv-abas/.inv-aba`. Botão perigoso = armado (2 cliques), padrão dos painéis.
  Aberto por um botão no topo do AuthorPanel (callback `onOpenPlayers` opcional no construtor).
- **Escala da UI de toque = var CSS `--ts` + calc(), NÃO transform:scale()**: o joystick lê
  `getBoundingClientRect` e o polegar se posiciona por px reais — transform:scale distorce a
  matemática do polegar. `settings.uiScale` (persistido) aplicado por `TouchControls.setScale`
  (seta `--ts` inline no root) em `applySettings()` e ao criar o TouchControls.
- **Memória no browser**: RAM = JS heap `performance.memory.usedJSHeapSize/jsHeapSizeLimit`
  (SÓ Chrome/Chromium; undefined em FF/Safari → mostrar "n/d"). VRAM real NÃO existe no WebGL:
  o proxy é `renderer.info.memory` (CONTAGENS de geometrias/texturas, não bytes). GPU pelo
  `WEBGL_debug_renderer_info` (`UNMASKED_RENDERER_WEBGL`), cacheável. `navigator.deviceMemory`
  = RAM aproximada DO APARELHO (não uso). Profiler grava 10s e agrega (só o resumo vai no fio,
  respeita `MAX_PROFILE_REPORT_CHARS=8192` — nunca o array de frames cru).

### 2026-07-23 — Decision Log (privacidade do perfilador + prints)
- **Nome do aluno NÃO é dado de perfil.** Perfilador é anônimo: identifica versão
  (`versao:VERSION`) + dispositivo (userAgent/GPU), nunca aluno. Filename do host sem nome.
  JSONs crus gitignored; só resumo agregado anônimo em `registros/` é versionado. Ver Do-Not-Repeat.
- **Histórico do git NÃO será purgado.** profiles-escola tinha nomes tracked (sessão 12, repo
  PÚBLICO github.com/meketreve/logica-em-jogo). Decisão do usuário: purga (filter-repo/BFG =
  force-push) é prejudicial — quebraria os clones da escola — e o risco é baixo (só primeiros
  nomes/apelidos). Remoção do tracking + gitignore resolve o vazamento futuro; o passado fica.
- **Prints de apresentação = parkado.** Fazer SÓ alguns prints de pontos-chave (não capturar tudo)
  em `registros/prints/` na próxima sessão. Lista de cenas no STATUS/todo. Repo é PÚBLICO — ao
  render headless usar `fuser -k` p/ liberar a porta, NUNCA `kill $!` (mata o processo errado).
  **FEITO na sessão 18** (6 prints — ver README de registros/prints).

### 2026-07-23 (sessão 18) — Do-Not-Repeat (TDZ recorreu 3ª vez + gap de playtest)
- **TDZ de `let` usado no boot recorreu PELA 3ª VEZ** (bug-093/activePanel, ?yaw-input, agora
  bug-495/touchControls). PADRÃO: qualquer `function` chamada no TOP-LEVEL de main.ts que leia um
  `let` (mesmo com `?.` — optional chaining NÃO salva de TDZ) exige o `let` declarado ACIMA da
  chamada. `applySettings()` (chamado em `let settings = applySettings()`) lê `input/camera/renderer/
  touchControls` — TODOS têm que estar declarados antes. Ao adicionar um novo `?.setX()` em
  applySettings, conferir a ordem de declaração.
- **bug-495 só quebrava o vite DEV server, NÃO o build de produção.** O usuário rodou o build com a
  turma (2026-07-23) sem problema — o bundle de produção não disparava o TDZ; o vite dev (ESM nativo,
  ordem de topo estrita) sim. Ficou latente 5 sessões (13–18) porque ninguém abriu o vite DEV desde a
  sessão 12. NÃO alarmar "escola com client quebrado" sem confirmar em qual build. LIÇÃO: mudança em
  client (UI) que não tem teste automatizado (só shared tem testes) DEVE ser bootada headless (dev)
  pelo menos 1× antes de commitar — `capture.mjs`/`console.mjs` pega TDZ/crash de boot do DEV em
  segundos. "typecheck 0 + 304 testes" NÃO cobre runtime do client nem a diferença dev↔prod.

### 2026-07-23 (sessão 18) — Key Learnings (receita dos prints headless)
- **Render headless do jogo agora é dirigido por CDP** (scratchpad/capture.mjs), não `chrome
  --screenshot` puro — assim dá pra: esperar o game-ready, mandar tecla (F3 → HUD), esconder UI e
  screenshot num fluxo só. Chrome via `--remote-debugging-port` + Target.attachToTarget(flatten) +
  Page.navigate/Input.dispatchKeyEvent/Page.captureScreenshot. `ws` resolvido por
  `createRequire("/home/meketreve/logica-em-jogo/")` (script mora no scratchpad, fora do node_modules).
- **O `#overlay` de pausa aparece no headless** porque sem pointer-lock `input.active` é false
  (main.ts updateOverlay linha ~188). Esconder injetando `<style>#overlay{display:none!important}</style>`
  via Runtime.evaluate ANTES do screenshot (o `.hidden` do updateOverlay não vence `!important`).
  Também escondo `#hotbar`/`#crosshair` pra cena limpa de paisagem.
- **`?yaw`/`?pitch` (URL) agora VENCEM o spawn** (fix sessão 18): antes o `applyTeleport` do join
  sobrescrevia (`input.yaw = pos.yaw`) e a mira forçada se perdia → todo screenshot saía no mesmo
  ângulo. yaw em RADIANOS; `yaw=π` (3.14) olha +Z (forward = -sin/-cos). `pitch` positivo = pra CIMA.
- **Água/móveis/quadro headless = CONSTRUIR via websocket** (scratchpad/build.mjs): join → lê a msg
  `spawn{x,y,z}` → manda `place_block`/`balde{encher:false=fonte}`/`quadro_set`. `PLAYER_REACH=7`
  (REACH 5 + 2), medido do olho ao centro da célula → construir a ≤6 blocos do spawn. O tick do
  servidor escorre a água mesmo DEPOIS do builder desconectar (edições ficam no world em memória).
  **Cascata precisa de CAIXA de contenção** (lip 1-alto na frente do spawn + paredes laterais + muro
  do fundo com fontes no topo) — mundo plano sem contenção INUNDA e afoga a câmera. Água v1 = cubo
  cheio por nível (não altura visual), então "cascata" = coluna de células caindo pela face do muro.
- **Screenshot de AULA**: `LJ_SAVE=cenarios/aulaN.ljw` — paths.ts trata `cenarios/` como MODELO
  read-only (semeia cópia viva em `mundos/<nome>/`, nunca escreve no tracked). O painel de objetivos
  + a região-alvo (wireframe) já renderizam sozinhos (broadcast do servidor).
- **`fuser -k <porta>/tcp` explícito por porta funciona; `rm -rf` de mundos de teste também** —
  mas o classifier BLOQUEIA se vierem juntos num compound com outras ações. Rodar kill e rm em
  comandos SEPARADOS. E nunca `fuser -k 8080` (playtest do usuário) nem 5199 (meu vite).

## Key Learnings arquivados (2026-07-25) — detalhe por checkpoint

> Movidos do cerebrum.md na consolidação de 2026-07-25 (o arquivo estava em ~27k tokens
> e é lido antes de cada geração de código). O cerebrum ficou com a REGRA compacta; aqui
> mora a narrativa completa (motivação, antes/depois, números de bug). Consulte quando
> precisar do porquê histórico de um padrão.

- **Água FLUIDA prioriza o DESNÍVEL mais próximo (fluxo estilo Minecraft) — ✅ 2026-07-22 (sessão 16).**
  Antes `waterRule` (rules.ts) espalhava pros 4 lados IGUALMENTE em chão sólido = flood-fill em
  DISCO. Numa pirâmide escalonada com água de um lado, cada degrau enchia toda a superfície e
  cascateava pelas 4 faces → centenas de células ativas = tick + REMESH do cliente afogados = FPS
  morre (relato do usuário, Xeon/RTX2060). Fix: cada célula de água em chão sólido faz uma busca
  em profundidade (`passosAteQueda`, limite `DROP_SEARCH=4`) pela QUEDA mais próxima e só escorre
  naquela direção; sem queda no alcance → espalha nos 4 lados (poça). Resultado = água em FIO
  (pirâmide: 12 células vs. centenas). 2 armadilhas que quebram o fluxo se esquecidas: (1) o custo
  até a queda tem de ser medido sobre TODA célula que a água ATRAVESSA (ar OU fluida, `aguaAtravessa`),
  NÃO só as preenchíveis — senão, quando a direção do desnível já está cheia/saturada, ela sai da
  comparação e a água floodava perpendicular; array `empurra[]` separado diz quais dá pra encher.
  (2) `temQueda` conta como descida AR **e ÁGUA FLUIDA** embaixo — ao encher o buraco a coluna
  vira água, e se só ar contasse o alvo "sumia" e a água voltava a espalhar em disco. Padrão
  reusável se um dia a lava fluir. TROCA de comportamento em piso de 1 bloco de largura: a água
  agora escorre pelas beiras (correto) → testes de canal 1-wide viraram plano cheio (sem beira).
- **Teto de água por tick (proteção de FPS) — session.ts, 2026-07-22.** Trava dura além da
  priorização: `AGUA_POR_TICK_PADRAO=256` (constants.ts), opt `aguaPorTick`, env host `LJ_AGUA_TICK`
  (espelha o `LJ_COLUNAS_TICK`). No tick, conta só células de água que REALMENTE mudam; ao esgotar,
  as demais voltam pra `this.dirty` (escorrem no tick seguinte). Água PARADA (nível assentado)
  devolve null → não gasta orçamento → o teto só morde durante fluxo pesado. Areia/portas/etc não
  contam. Mesmo padrão de config de desempenho por-tick do streaming.
- **Mira por FORMA dos não-cubos + água invisível — ✅ IMPLEMENTADO (2026-07-22).**
  Antes `raycastBlock` (raycast.ts) parava em qualquer bloco ≠ Ar, tratando cada célula como
  AABB 1×1×1 — inclusive água/cerca/porta/tocha/flor/tapete; só o CONTORNO (main.ts:1391) seguia
  a forma via `blockSelectionBox` (mesher.ts:250) → divergiam. Agora o DDA: (1) pula `isAgua`
  (água invisível pra mira); (2) em célula `!isFullCube` faz ray-vs-AABB (`subBoxNormal`, slab
  test) contra `blockSelectionBox(id)` — acerta a forma real, erra o vão e segue; (3) cubo cheio
  = fast path com a normal do DDA. `raycast.ts` importa `blockSelectionBox` do mesher (SEM ciclo:
  mesher só importa blocks/constants/world). A MESMA caixa-por-id deve servir pra colisão quando
  vier slab (physics.ts ainda trata tudo como cubo cheio) → unificar então. Mira é 100% cliente;
  servidor valida regra de bloco à parte. Consequência: usar/copiar não-cubo exige mirar na forma.
- **Restrição de assets = LICENCIAMENTO, não "zero arquivo de imagem" (leitura de projeto.txt §9, 2026-07-22).**
  A §9 fala de custo/legalidade: Minecraft Education exige licença cara; "versões NÃO
  LICENCIADAS de softwares comerciais" são ilegais pra rede pública → solução = plataforma
  PRÓPRIA. O que ela PROÍBE: código/textura/asset RIPADO de terceiro (Minecraft/Eaglercraft),
  software pirata. O que ela NÃO proíbe: assets PRÓPRIOS (desenhados pelo usuário/pela IA) nem
  assets de licença livre (CC0). ⇒ "tudo pintado no canvas procedural, zero PNG" é ESCOLHA DE
  IMPLEMENTAÇÃO nossa (repo 100% texto, sem pipeline de asset, sem loader assíncrono, deploy =
  1 bundle, testável headless, "próprio" garantido), NÃO exigência do documento. Assets
  PRÓPRIOS/CC0 seriam permitidos se um dia valer a pena (textura rica, sprite sheet de animação).
  Não tratar "sem assets externos" como regra absoluta — é convenção defensável, revisável.
- **Água = 2º material transparente via GRUPOS de geometria (2026-07-22, RESOLVIDO).**
  Antes a água fingia translucidez com furos xadrez (cutout no material único do chunk).
  Decisão do usuário (AskUserQuestion) = transparência DE VERDADE. Padrão implementado, reusável
  pra qualquer bloco transparente futuro (vidro colorido, gelo): o mesher (`mesher.ts`) mantém
  UM vertex buffer mas separa os ÍNDICES em 2 grupos — opaco primeiro, água depois — expostos
  por `ChunkGeometry.opaqueIndexCount`; faces de água vão pra `waterIndices` no caminho de cubo.
  O `ChunkRenderer` (chunks.ts) monta `geometry.addGroup(0,opaque,0)` + `addGroup(opaque,resto,1)`
  e passa material ARRAY `[opaco, agua]` — three roteia o grupo transparente pro passe de
  transparência AUTOMATICAMENTE (sort por z), e grupo com count 0 não gera draw call (chunk sem
  água não paga nada). `materialAgua` (main.ts) = MeshLambert transparent, opacity 0.72,
  depthWrite:false, MESMA textura do atlas (as UVs do tile batem). `paintAgua` = azul cheio, sem
  furos. Testado: mesher.test prova o split (só-pedra opaque==total; só-água opaque==0; misto 36/36).
  Se um dia quiser animar SÓ a água: clonar a textura pro materialAgua antes de mexer em map.offset.
- **PILOTO FEITO (2026-07-21) — o entregável pedagógico está cumprido.** O usuário
  aplicou o jogo com alunos de TODAS as turmas da escola (cobertura incremental, não um
  evento único). **Inclui AEE (Atendimento Educacional Especializado / educação
  especial): bom desempenho em SEQUÊNCIA DE CORES e CONSTRUÇÃO LIVRE** — resultado de
  inclusão/acessibilidade, ponto forte pro relatório. Implicação: o projeto saiu da fase
  "codar motor" pra fase "ESCREVER O RELATÓRIO de aplicação". Não propor mais features de
  motor como próximo passo, salvo pedido explícito — o entregável final é o documento.
  As atividades que funcionaram na prática: sequência de cores (pensamento lógico) e
  construção livre (autonomia/criatividade), incl. com público AEE.
- **Streaming validado EM CAMPO (2026-07-21, escola): mundo procedural gigante
  (240×240×8 chunks = 3840²×128) rodou com 10 alunos + 2 professores simultâneos,
  ZERO problema de sincronismo.** Perf reports em `profiles-escola/` (25 JSON,
  `checkpoint:14`, meta.worldChunks/worldSeed/serverHost). Tablets Android da escola
  (Kindle Fire Silk, Chrome Android) = **60-90 FPS no mundo gigante** (frametime
  ~11-17ms). Servidor FOLGADO com a turma inteira: **tickAvgMs < 1ms, tickMax < 1.7ms**
  em todos os clientes → o gargalo NÃO é o server tick nem a rede (22-101 msg/s, 3-16
  KB/s por cliente). O host (notebook do usuário rodando server+cliente) é sempre o
  mais pesado (37 FPS). `remeshCount` é ACUMULADO da sessão (22k-496k); o que importa é
  `remeshLastMs` (≤ 2.1ms = sem hitch por frame), não o total. O relatório do piloto
  pode citar esses números como prova de escalabilidade.
- **"Chunk não carrega" ≠ bug do streaming se o usuário mexeu no raio de render ao
  vivo.** Ajustar a QUANTIDADE de chunks exibidos (raio de interesse) em runtime pode
  deixar colunas sem carregar no cliente que mexeu — sintoma local, não dessincronia.
  Antes de investigar "chunk sumiu", perguntar se o raio de render foi alterado na
  sessão. Aconteceu SÓ no notebook do usuário no playtest da escola; os 12 clientes
  reais não tiveram o problema.
- **anatomy.md acumula entradas duplicadas em rename:** renomear arquivo 2x na
  mesma sessão (ideias para fazer.txt → .md → ideias.md) deixou 2 linhas
  fantasma no anatomy.md apontando pros nomes intermediários. Auto-update só
  ADICIONA, não remove — ao renomear/apagar arquivo, checar `grep` no
  anatomy.md pelo nome velho e limpar manualmente.
- **Reiniciar atividade = zerar flags + restaurar MUNDO:** reset (`/objetivo
  resetar`, `/iniciar`) precisa repor os blocos das áreas, não só limpar
  completos. Estado inicial autoral mora em `Objective.baseline: number[][]`
  (fotografia por área, capturada no `/objetivo add`, PERSISTIDA no .ljw). Mora
  no OBJETIVO, não no mundo → aluno muda mundo, não objetivo → sobrevive ao
  autosave da cópia de trabalho (aulas/). Snapshot/restore usam a MESMA ordem
  canônica (y→z→x) do snapshotRegion/matchRegion. Mudou o baseline ou o gerador?
  **regenerar os .ljw** (`npm run cenarios`) — save antigo sem baseline degrada.
- **Teleporte de jogador (session):** helper `teleportar(clientId,x,y,z)` move o
  jogador no servidor e avisa a rede REUSANDO msgs existentes — `teleport` pro
  próprio (cliente já reposiciona a câmera desde cp8) + `player_moved` pros
  outros. NÃO precisa de protocolo novo. `/tp grupos` e `/iniciar` (2026-07-15)
  são construídos sobre isso; base pronta pro `/tp nome x y z` futuro. Área do
  grupo = `areaDoGrupo(g)` → `objetivo.alvos[g-1]`; destino seguro = centro no
  plano + `findSpawnY` (nunca dentro de bloco).
- **Autocomplete do chat (Tab):** árvore de comandos vive em `client/commands.ts` e
  DEVE espelhar `runCommand` (shared/session.ts) + `/mundo` (server/mundos.ts).
  Comando novo no servidor = atualizar a árvore aqui, senão o Tab não o oferece.
  Nomes de mundo entram ao vivo (`learnWorlds`) parseando a resposta de `/mundo lista`
  — cliente não tem filesystem. Parse best-effort: casa "disponíveis: …. Para trocar".
- **Project:** jogo voxel educacional "Lógica em Jogo" (ver `.wolf/STATUS.md`).
- Público: 2º–9º ano fundamental, turmas homogêneas (máx 3 anos de diferença), 8–20 simultâneos.
- Pedagogia mora nos **cenários autorais**, não no motor. Jogo = plataforma de autoria.
- Ordem de entrega: motor → cenários → piloto com turma → **relatório de aplicação** (entregável
  principal p/ coordenadoria regional). Documento técnico é anexo, não o começo.
- Areia/gravidade, circuitos lógicos e detecção de objetivo = MESMO subsistema (atualização
  de bloco por vizinhança no tick do servidor). Implementar genérico desde o início.
- Painel de circuito que colapsa em 1 bloco reutilizável = abstração (pilar Wing/ISTE/CSTA).
- Verificação visual de checkpoint sem navegador interativo: `npm run dev` em background +
  `~/.cache/puppeteer/chrome/linux-150.0.7871.115/chrome-linux64/chrome --headless=new
  --no-sandbox --disable-gpu --enable-unsafe-swiftshader --window-size=1280,800
  --virtual-time-budget=8000 --screenshot=out.png http://localhost:5173/` (WebGL renderiza
  via SwiftShader). `openwolf designqc` dá navigation timeout nesse app — usar o comando cru.
- Convenção de índices (contrato binário): chunk em world.chunks = `(cy*dims.z+cz)*dims.x+cx`;
  bloco no Uint8Array = `(ly*CHUNK_SIZE+lz)*CHUNK_SIZE+lx`. getBlock fora dos limites = Air
  (borda do mundo renderiza face; jogador cai da borda → respawn no cliente).
- Worker de OUTRO workspace no Vite: `new Worker(new URL("../../server/src/worker.ts",
  import.meta.url), { type: "module" })` funciona em dev e build (vira chunk separado).
  Caminho relativo cruzando workspaces, sem `?worker` nem export no package.json.
- `server/tsconfig.json` combina `lib: ["ES2022","WebWorker"]` + `types: ["node"]` sem
  conflito (skipLibCheck) — index.ts (Node) e worker.ts (WebWorker) no mesmo programa.
- `/shared` NÃO enxerga `performance` (lib ES2022 pura). GameSession recebe relógio
  injetável (`opts.now`, default Date.now); hosts passam `() => performance.now()`.
  Bônus: testes de tick usam clock fake determinístico.
- Formato do world_snapshot (contrato binário, LE): u32 magic "LJW0" (0x304a574c) |
  u8 dims.x | u8 dims.z | u8 dims.y | u8 reservado | u32 seed | chunks na ordem de
  chunkIndex(), CHUNK_VOLUME bytes cada. decode SEMPRE valida magic/dims/tamanho.
- anatomy.md é rescaneado por hook do OpenWolf ao criar arquivos — não precisa (e não
  adianta) editar entradas de arquivos novos manualmente; o hook sobrescreve.
- `block_changed` é GENÉRICO por contrato: mesmo formato pra ação de jogador, ação de
  outro jogador e regra do tick (areia/circuitos). Cliente aplica sem distinguir origem —
  o checkpoint 4 (gravidade) não muda NADA no cliente.
- Validação de ação no servidor (session.ts): join obrigatório → bounds → célula
  compatível (ar p/ place, sólida p/ break) → alcance (PLAYER_REACH+2 de folga, pos do
  move chega a 10 Hz) → AABB de jogadores (place não pode emparedar). Rejeição = silêncio
  (sem NACK); cliente só muda mundo via block_changed.
- Remesh na borda de chunk: mudar bloco com coord local 0 ou 15 exige remesh do chunk
  vizinho também (culled mesher lê o vizinho). `ChunkRenderer.remeshBlock()` cuida disso.
- input.ts: mousedown só dispara handler com pointer lock ativo — primeiro clique trava
  o mouse e NÃO conta como ação (evita quebrar bloco ao entrar no jogo).
- Fila de vizinhança (rules.ts + session): sujeiras novas vão pro PRÓXIMO tick (lote é
  snapshot) → areia cai 1 célula/tick; `changedThisTick` impede 2ª mudança da mesma
  célula no mesmo tick (senão areia teleporta se a célula-destino também estava suja).
- Ordem das mudanças da regra da areia: materializar embaixo ANTES de limpar a origem —
  transiente duplicado é invisível no cliente; ordem inversa pisca buraco por 1 frame.
- Regra de bloco NUNCA escreve no mundo — devolve BlockChange[] e a session aplica
  (broadcast + marca vizinhos). Escrever direto pularia a propagação e o netcode.
- Presença de jogadores (cp5, REVISTO 2026-07-12/bug-076): cliente NUNCA sabe o
  próprio id — servidor relay `player_moved` só pros OUTROS (broadcastExcept).
  "Presença emerge do move" FALHOU pra jogador parado: agora o JOIN envia
  player_moved com o estado de cada online pro novo (APÓS o snapshot — antes
  dele o cliente descarta) e anuncia o novo pros demais. Continua sem mensagem
  "player_joined" dedicada. `player_left` no disconnect remove a caixa.
- Move do cliente é REATIVO (2026-07-12): compara com o último enviado; igual =
  só heartbeat 1×/2 s (presença/keepalive), mudou = até 10 Hz. Corta ~95% do
  tráfego de subida com turma parada. Qualquer estado periódico novo deve seguir
  o padrão "manda quando muda + heartbeat", não "manda sempre".
- WsConnection: WebSocket.send antes do open LANÇA — fila interna segura mensagens
  em CONNECTING e despeja no onopen (o join é enviado logo após o construtor).
- Host ws (Node): socket sem handler de "error" derruba o processo inteiro;
  sempre registrar. Mensagem client→servidor: ignorar frames binários
  (protocolo de subida é 100% JSON) e usar `data.toString()` no Buffer.
- Node 22+ tem WebSocket GLOBAL (cliente) — smoke de netcode roda com zero deps,
  importando /shared por caminho absoluto via tsx.
- Smoke script em scratchpad (fora do repo): usar extensão `.mts` — sem
  package.json type:module, tsx compila `.ts` como CJS e top-level await quebra.
- Spawn é propriedade da CRIAÇÃO do mundo (terreno pristino), não cálculo de
  join: GameSession guarda `readonly spawn` do construtor e manda mensagem
  `spawn` antes do snapshot. Cliente NUNCA deriva spawn do snapshot — snapshot
  reflete o mundo já escavado/construído (bug-010). Vale pra qualquer valor
  "do terreno original": derivar na criação, transmitir, nunca recalcular.
- Chat (cp6): broadcast ECOA pro autor (eco = confirmação do round-trip pelo
  servidor) — DIFERENTE de player_moved, que nunca ecoa. Comando (`/` prefixo)
  responde SÓ pro autor com author "servidor"; a mudança de mundo do comando sai
  como block_changed normal (acorda gravidade/regras — mesma engrenagem).
- Chat UI vs pointer lock (cp6): Enter keydown dá transient activation no Chrome
  → `requestPointerLock()` ao FECHAR o chat funciona sem clique. Teclas do campo:
  `stopPropagation` no keydown do input + guard em input.ts (`e.target instanceof
  HTMLInputElement` → return) — senão Digit1–4 troca hotbar (e o preventDefault
  do handler engoliria o caractere digitado).
- `tsx watch` do `npm run dev:server` observa também os imports de /shared —
  editar session/protocol reinicia o servidor sozinho (smoke do cp6 rodou contra
  o dev:server do usuário sem restart manual).
- `?atlas` na URL do cliente pendura o canvas do texture atlas no canto
  (inspeção visual de texturas novas em screenshot headless, sem playtest).
- Regra de queda é `fallingRule` GENÉRICA (lê o id da célula e move o que
  estiver lá): registrar bloco novo que cai = 1 linha no Map RULES. Não criar
  regra por-bloco duplicada.
- Hotbar: 1–9 escolhe direto, scroll do mouse cicla TODOS os colocáveis
  (`input.onWheel`, só com pointer lock). Ordem do array PLACEABLE = ordem
  dos ids — o texto de uso do /bloco aponta pra hotbar.
- Lerp de jogador remoto (bug-062): fator exponencial `1-exp(-dt*12)` por frame
  (independe do FPS), yaw pelo caminho curto via `atan2(sin Δ, cos Δ)`. Caixa
  NASCE já na primeira posição recebida (senão desliza desde a origem).
- Identidade provisória do cliente (até cp9): nome único por navegador em
  localStorage `lj-nome` (`jogador-<4 chars>`), `?nome=x` na URL sobrescreve.
  Roster do save é POR NOME — nomes iguais são a mesma pessoa pro mundo (bug-061).
- Canal de HOST do worker (cp8): mensagens `{hostType: ...}` no MESMO postMessage,
  filtradas pelo WorkerConnection ANTES do protocolo de jogo. init (save/seed)
  obrigatório antes do join; save_request→save devolve bytes .ljw. Quem grava no
  IndexedDB é o CLIENTE (armazenamento do navegador = domínio dele); worker só
  serializa. Divisão vale pra qualquer host browser-side futuro.
- Config do jogador: localStorage "lj-config" com merge DEFENSIVO por campo
  (update do jogo nunca quebra config velha). Teclas por e.code; captura de
  rebind usa keydown {once, capture} + stopPropagation pra não vazar pro Input.
- Menu (cp8): telas em index.html, controles de config gerados em JS
  (menu.ts buildConfigScreen). Menu SÓ escolhe; main.ts inicia o jogo.
  `?server=` pula o menu (screenshots headless e links de LAN dependem disso);
  cp9: `?pin=` e `?codigo=` fazem as vezes dos campos do menu nesse caminho.
- Identidade (cp9): GameSession separa POSIÇÃO (roster) de IDENTIDADE
  (identity: pin/papel por nome, TEXTO PURO — ver Decision Log 2026-07-12).
  Join em modo estrito (default) valida: nome-já-online (ANTES do PIN — não
  vaza se o PIN estava certo) → lockout → PIN 4 dígitos → código de professor.
  Recusa = msg `join_denied` com motivo; NADA mais é enviado. 1ª entrada com
  nome novo registra o PIN. `singleplayer: true` (worker) pula tudo e todo
  join é professor.
- Rate-limit do join (cp9): PIN errado conta por NOME (5 erros → 30 s de trava,
  mesmo com PIN certo); código de professor errado tem contador GLOBAL próprio
  (quem chuta código troca de nome a cada tentativa — gate por nome não pega).
- toSave/identidade: em singleplayer o papel professor é do MODO, não da
  pessoa — identity fica vazia e o save sai sem pin/papel (mundo single
  exportado pra LAN não dá professor de graça). Identity restaurada do save
  é preservada mesmo em singleplayer (mundo de LAN importado não perde PINs).
- Testes de sessão: bateria de MECÂNICA roda com `singleplayer: true` (join
  sem PIN); auth do cp9 tem describe próprio. Sessão nova em teste multiplayer
  exige `pin` no join, senão tudo é join_denied.
- Smoke com servidor filho: spawn `node --import tsx arquivo.ts` DIRETO —
  npx cria árvore de processos e o SIGTERM morre no wrapper (bug-092; servidor
  neto órfão segura a porta e a fase 2 leva EADDRINUSE).
- alert() TRAVA screenshot headless: dialogo modal pausa o --virtual-time-budget
  no headless=new e o screenshot nunca dispara (bug-093). Fluxo com alert se
  verifica por smoke de protocolo, não por screenshot.
- Regiões (cp11): canal `regions` é SÓ pra professores (join + após criar/
  apagar; lista sempre COMPLETA — cliente substitui, não mescla). Aluno não
  recebe nada — o que ele vê de região é decisão do OBJETIVO (cp12), não do
  canal. Papel do próprio jogador viaja no `spawn` (campo opcional — host
  antigo compatível); cliente usa pra habilitar UI de professor (varinha).
- Cantos da varinha são rascunho POR CLIENTE no servidor (wandMarks):
  somem no /regiao criar e no disconnect, NÃO persistem no save. Varinha
  marca a célula MIRADA (bloco existente), não o ar vizinho do place.
- parseNamedRegion (regions.ts) é o validador ÚNICO de região vinda de fora
  — protocolo E decodeSave reusam; entrada quebrada é PULADA (lista/save
  continuam válidos). Padrão pra qualquer estrutura futura no meta do save.
- Grupos (cp13): membros por NOME (grupo sobrevive a rejoin/reboot, igual
  roster); professor FORA da auto-distribuição; recém-chegado cai no MENOR
  grupo; RE-criar grupos zera composição e progresso por grupo. Progresso:
  chaves "obj:grupo" em completosGrupo; objetivo compartilhado concluído
  vale pra todos os grupos; chegar em modo grupos é SEMPRE por grupo (sem
  grupo não pontua); sequencial anda POR GRUPO. Msg `objectives` é a MESMA
  pra todos (porGrupo[]) — o cliente escolhe a própria linha via msg `group`
  pessoal. Não fazer mensagem de objetivo por-destinatário: quebra o dedup.
- /regiao carimbar (cp13): replica região modelo com BLOCOS (cabines) 1× por
  grupo e nomeia prefixo-1…N; valida bounds de TODAS as cópias antes de
  mudar o primeiro bloco (carimbo pela metade = lixo). /objetivo add resolve
  nome exato = área compartilhada, prefixo-1…N = área por grupo (exige as N).
- Config em CATEGORIAS (menu.ts): renderConfigRoot (controles/som/gráficos/
  restaurar) + renderConfigPanel por categoria; mesma tela no menu principal
  e no Esc (buildConfigScreen é só a raiz). Categoria nova = 1 entrada em
  CONFIG_CATEGORIES + 1 ramo no panel.
- SEM popups nativos (pedido do usuário 2026-07-12): prompt/confirm/alert são
  proibidos no cliente — usar UI inline (.menu-erro, apagar em 2 cliques com
  desarme, formulário na própria tela). Erro que precisa sobreviver a reload
  (join_denied) vai via sessionStorage "lj-erro" → banner no menu. Bônus:
  alert travava screenshot headless (bug-093) — problema morreu junto.
- Menu de pausa (Esc) = #overlay reestilizado como .menu-screen: voltar ao
  jogo (input.lock), configurações e sair. buildConfigScreen(body, onChanged)
  é COMPARTILHADO menu principal/pausa — onChanged aplica ao vivo
  (applySettings + Input.rebind pros atalhos por handler: chat/hud/varinha;
  teclas de movimento já leem settings.keys a cada frame). Mira (#crosshair)
  só aparece com pointer lock ativo — updateOverlay controla.
- Objetivo construir (cp12): região MODELO (fotografada no /objetivo add) é
  SEPARADA da região ALVO (onde detecta) — fotografar e detectar na mesma
  região nasceria completo. Mesma região é permitida (fluxo "apagar o modelo
  depois"), mas o add RECUSA alvo que já bate com o gabarito. Modelo/alvo
  exigem dimensões iguais. Isto é a base do carimbo de áreas do cp13 (mesmo
  gabarito, N alvos).
- Detecção de objetivo (cp12) segue a regra de ouro: applyBlock marca
  objetivosDirty → tick recheca SÓ os tocados (nunca varredura periódica);
  chegar conclui no handler do move (pisar na região; heartbeat de 2 s cobre
  jogador parado). Sequencial: pisar em objetivo FUTURO não conclui.
  Conclusão nunca desfaz; /objetivo resetar exige ação nova pra re-concluir
  construir (não re-checa o mundo atual de propósito — senão reset é no-op).
- Broadcast de cenário: mensagem `objectives` completa pra TODOS, dedup por
  JSON (lastObjectivesJson); anúncio "objetivo concluído" no chat sai SEMPRE
  DEPOIS do estado novo — o cliente toca o som de conquista e suprime o ping
  de notificação (janela 800 ms em audio.ts).
- Coords de região DENTRO do objetivo são CÓPIA (min/max) — /regiao apagar
  não quebra objetivo existente; região nomeada é só ferramenta de autoria.
- Resposta de comando multi-linha: servidor junta com "\n" e o `.msg` do chat
  tem `white-space: pre-line` (index.html) — vale pra /regiao lista e pra
  qualquer listagem futura (/objetivo lista no cp12). Não mandar N mensagens.
- Áudio de UI (client/audio.ts): sintetizado com WebAudio (blip = oscilador
  + envelope), zero assets. AudioContext SÓ nasce em gesto do usuário
  (autoplay policy) — som disparado por mensagem de REDE usa playUiPassive
  (só toca se o contexto já existe). Botões do menu = delegação de clique
  no container. settings.volume agora controla o master gain (slider ativo).
- Painéis do cp14 (client/src/panels.ts) = AÇÚCAR sobre comandos de chat:
  cada botão COMPÕE um /objetivo|/regiao|/grupo e manda como msg `chat` —
  validação 100% no servidor, ZERO protocolo novo pra ações. Estado volta
  pelos broadcasts (regions/objectives/groups) que re-renderizam o painel
  aberto; resposta de comando aparece no chat. Painel NUNCA decide estado.
  Qualquer UI de autoria futura segue este desenho.
- Painel adia re-render enquanto um input/select DELE tem foco (marca dirty,
  re-renderiza no focusout) e guarda rascunho dos formulários em campos da
  classe — broadcast de objectives não apaga o que o professor digita.
- Msg `groups` (cp14): composição COMPLETA broadcast pra TODOS (painel de
  grupo do aluno vive disto e só abre com grupos criados). Join manda DIRETO
  pro recém-chegado (dedup não cobriria cliente novo); mudanças = broadcast.
  Mesmo padrão sendX(client)/broadcastX() de regions/objectives.
- Preset de mundo (cp14): `WorldPreset` = normal|plano|cabines em worldgen
  (generateWorldForPreset; parseWorldPreset valida string de fora).
  SessionOptions.preset VENCE o flat (alias legado dos testes/LJ_PLANO).
  Host Node: LJ_PRESET=plano|cabines. Menu: select #menu-new-tipo. Preset
  só vale pra mundo NOVO — restore ignora.
- Cabines (worldgen): 1 por chunk no canto (0,0) local, footprint 5×5
  (CABIN_SIZE), paredes de tábuas 2 de altura (CABIN_WALL_HEIGHT), lado +x
  ABERTO (olha pro centro do chunk), sem teto. Spawn do preset desloca
  +CHUNK_SIZE/2: o centro exato do mundo é canto de chunk = dentro de cabine.
- `/objetivo texto id novo…` e `/objetivo mover id pos` (pos 1-based, com
  clamp) — edição de autoria usada pelo painel; mover re-ativa o sequencial
  na ordem nova via broadcastObjectives.
- Tecla `painel` (default P, rebindável): professor abre AuthorPanel, aluno
  abre GroupPanel (só com grupos criados; senão aviso local no chat, autor
  "jogo"). Esc fecha (listener capture próprio do painel). `?painel` na URL
  abre no boot — screenshot headless do cp14. updateOverlay esconde o menu
  de pausa enquanto painel aberto.
- PLACEABLE (hotbar) extraído pra client/src/blocksUi.ts — main.ts e os
  selects de bloco do painel usam a MESMA lista.
- Edge-guard do agachar (cp15): implementado POR EIXO no sub-passo
  (moveAxisGuarded desfaz o eixo se hasSupport falhar) — diagonal desliza
  pelo eixo seguro de graça, igual Minecraft. Guard SÓ com sneak && onGround
  (recalculado após o move de y de cada sub-passo). Jogador debruça até o
  footprint (largura 0.6) quase sair do bloco: drift máx |0.8| do centro —
  é o comportamento certo, não bug (teste calibrado pra isso).
- Sprint (cp15): detecção de duplo-toque por POLLING no render loop (borda
  de subida da tecla forward + janela 300 ms + latch até soltar) — sem mexer
  no Input. Ctrl segurado é lido direto por input.down. Agachar VENCE
  sprint; sprint exige forward>0. FOV kick/altura do olho: lerp exponencial
  no loop com camera.updateProjectionMatrix() só quando |Δfov|>0.01.
- Teclas de SEGURAR novas (correr/agachar) = só entrada em KeyAction +
  defaults + label; menu de rebind itera KEY_ACTION_LABEL e o loop lê
  settings.keys a cada frame — zero fiação extra. Tecla de ATALHO nova
  (inventario) exige também: input.onKey no startGame + entrada na lista do
  onSettingsChanged (rebind ao vivo).
- Hotbar (cp16) = 9 slots de BlockId em localStorage "lj-hotbar", parse
  defensivo POR SLOT (id inválido cai no default daquele slot). Digit1-9 =
  slot, scroll cicla os 9. Inventário (client/inventory.ts) segue o padrão
  Panel do cp14 (Esc capture, exclusão mútua com painel P via hide()) mas é
  100% local — nenhum comando pro servidor.
- Ícones de bloco (cp16): blockIconTile(id) no mesher devolve o tile
  LATERAL; client/blockIcons.ts recorta do canvas do atlas (material.map
  .image) pra data URLs de 16px — CSS amplia com image-rendering:pixelated.
  Vale pra qualquer UI futura que precise mostrar bloco.
- Transparentes (cp18) são CUTOUT, não blend: alphaTest 0.5 no material
  único — sem sorting, sem segundo draw call, sem passe extra. Regra de
  visibilidade no mesher: face emitida se vizinho==Air OU (eu opaco &&
  vizinho transparente); entre DOIS transparentes nunca (faces coplanares =
  z-fight). isTransparentBlock() vive em blocks.ts (/shared) — física e
  raycast continuam tratando como sólido.
- Tiles com alpha no atlas: canvas 2d nasce transparente; clearRect apaga
  pra alpha 0 (furos das folhas, centro do vidro). paintNoise pinta opaco.
  Tile não pintado = invisível com alphaTest — todo bloco novo PRECISA de
  pintura no createAtlasTexture (o teste "todo colocável tem tile" pega o
  lado do mesher, não o do atlas).
- RECEITA "adicionar bloco cúbico" (checklist — 4 pontos, tudo append):
  (1) `shared/blocks.ts`: novo id no FIM do BlockId + bumpar MAX_BLOCK_ID
  (isPlaceable segue sozinho; nunca renumerar id antigo — save é byte cru);
  (2) `shared/mesher.ts` BLOCK_TILES: mapear id→tile (`uniform(t)` ou
  top/bottom/side); (3) `client/atlasTexture.ts`: pintar o tile em
  createAtlasTexture; (4) `client/blocksUi.ts` PLACEABLE: nome PT (hotbar,
  inventário e selects derivam daí). Hotbar/ícones/inventário/`/bloco`/
  `/regiao encher` são TODOS automáticos. Rede de segurança: o teste do
  mesher "todo colocável tem tile" quebra se faltar o passo 2.
- ATLAS.tilesPerRow é dinâmico: mesher (UV) e atlasTexture/blockIcons leem
  ATLAS.tilesPerRow, então dá pra CRESCER a grade (8→16 no cp20, 64→256
  tiles) sem tocar em UV, save ou snapshot — só o índice do tile importa,
  não a posição no canvas.
- Blocos-glifo (cp20, letras A–Z / dígitos 0–9): família regular derivada de
  UMA const `GLYPH {base,letters,digits}` em mesher.ts (re-exportada) — o loop
  em BLOCK_TILES, o `paintGlyph` (ctx.fillText bold, NearestFilter deixa o
  traço crocante) e os nomes em blocksUi TODOS iteram GLYPH. Família regular =
  loop numa fonte única, não 36 linhas explícitas (só as âncoras LetterA/Digit0
  precisam de nome no BlockId).
- RECEITA "nova mensagem servidor→cliente": (1) union + comentário em
  protocol.ts ServerMessage; (2) `case` no parseServerMessage (defensivo — tipos
  conferidos, senão null); (3) dispatch no cliente (main.ts handleServerData);
  (4) o servidor emite via `this.send`/`this.broadcast`. Mensagem cliente→
  servidor tem o caminho espelhado (ClientMessage + parseClientMessage +
  session.handleMessage) — mas prefira REUSAR chat/comando quando é ação de
  professor (cp14: painel = açúcar sobre /comando, zero protocolo novo).
- Comando SÓ do host (fecha socket / lê arquivo): intercepta em server/index.ts
  ANTES de session.handleMessage, como /mundo (cp19) e /kicar (cp22). A
  GameSession é pura (sem sockets nem filesystem) — resolve nome→id por
  `session.jogadoresConectados()`. No worker (singleplayer) esses comandos caem
  em "comando desconhecido" (não há host de arquivo/rede) — aceitável, mesmo
  padrão do /mundo. Adicione-os no autocomplete (client/commands.ts) à mão.
- Ciclo dia/noite (cp21) = tempo SERVER-AUTORITATIVO e VISUAL. Avança
  determinístico por TICK (`horaDoDia += 24/(DIA_SEGUNDOS*TICK_RATE)`), NUNCA
  pelo relógio de parede — assim Web Worker, .exe e Node dedicado andam iguais.
  Broadcast `time` 1×/s (na mesma janela do debug_stats) + no join; o cliente
  interpola localmente entre syncs (SkyCycle) pra não pular. Nunca escurece
  100% (piso de luz ambiente).
- CONFIG do ciclo (decisão do usuário 2026-07-16): mundo de ATIVIDADE = DIA
  PERMANENTE, ciclo PARADO (default `HORA_PADRAO=12`, `cicloAtivo=false`) — o céu
  não muda durante a aula. **hora + ciclo PERSISTEM no save** (SaveMeta): mundo de
  atividade grava ciclo OFF; SOBREVIVÊNCIA (futuro) grava a hora corrente pra
  CONTINUIDADE (reload volta na hora salva). Restore sobrescreve o default;
  ausente no save antigo = default. O gerador de cenários trava o dia
  EXPLÍCITO (`/hora meio-dia` + `/ciclo desligar`), não confia no default —
  sobrevivência pode, no futuro, nascer com o ciclo ligado. Mexeu em hora/ciclo
  default ou no formato → REGERAR cenários (`npm run cenarios`).

- Deploy no notebook: dá pra DATAR a versão que está rodando pelas frases do
  boot (bug-233): "escutando em ws://" = código pré-2026-07-15 (sem servidor
  estático, sem daRaiz/aulas/); atual imprime "mundo carregado de modelo …" e
  "os alunos abrem no navegador: http://…". Erro estranho vindo do notebook →
  PRIMEIRO conferir se a cópia é o main atual (pasta de ZIP `-main` = baixada
  à mão, não sincroniza).
- Notebook da escola (Windows 11, host do piloto): PowerShell padrão bloqueia
  `npm` (shim npm.ps1 + ExecutionPolicy Restricted — bug-232). Fix aplicável
  sem admin: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`; saída
  rápida: `npm.cmd`. Instruções de Windows pro usuário: sempre PowerShell com
  `$env:VAR="x";` em linha única, e prever esse bloqueio.
- Terminal do host (`server/index.ts`): readline no stdin = console de
  comandos do professor SEM estar no jogo (`/say` fala com a turma). Comando
  novo de terminal entra no mesmo `terminal.on("line")`; candidato natural a
  migrar: /mundo e /kicar (já são interceptados no host — o responder vira
  console.log). Em nohup/background o stdin fecha na hora e nada quebra.
- Plaquinha de nome (2026-07-17): o nome viaja OPCIONAL em `player_moved`
  (parse defensivo descarta não-string; ausente = host antigo, caixa sem nome)
  — servidor inclui `name` nos 4 pontos de emissão (move relay, presença ×2 no
  admitir, teleportar). Cliente: THREE.Sprite FILHO da mesh do boneco (sprite
  sempre encara a câmera e ignora o yaw do pai; offset só em Y não gira),
  textura = canvas 2d procedural (texto branco, fundo rgba(0,0,0,0.4)),
  `LinearFilter` (canvas não-potência-de-2 sem mipmap), `depthTest: false` =
  nome visível através de parede (convenção Minecraft; professor acha aluno).
  PEGADINHA: redimensionar o canvas RESETA ctx.font — setar de novo após
  width/height. Dispose no player_left: map + material + remove do pai.
  Mudança de nome (rejoin com id novo é o normal) recria o sprite via
  labelName. Testes que dão toEqual em player_moved GANHARAM o campo name —
  emissão nova sem name quebra esses asserts.
- **Não-cubos (cp23, 2026-07-17) — cerca/porta/tocha, ids 65–70:** forma vive
  no mesher (`emitShape` + `emitBox` com UV PROPORCIONAL — face amostra do tile
  a região que ocuparia no cubo cheio). Culling do emitBox: face RENTE à borda
  da célula some se o vizinho é cubo opaco (sem z-fight com o topo da grama) ou
  tem o MESMO id (metades da porta fundem). `isFullCube()` em blocks.ts: não-
  cubo NUNCA oclui vizinho no mesher nem segura tocha. FÍSICA usa
  `isSolidBlock()` (não mais `!== Air`): porta aberta e tocha atravessam.
  RECEITA bloco não-cubo novo: id em blocks.ts + isFullCube/isSolidBlock +
  case no emitShape + tile pintado + entrada BLOCK_TILES (ícone) + PLACEABLE.
- **Sprite em CRUZ (flores, 2026-07-20 sessão 8):** NÃO usar emitBox (caixa fina)
  pra sprite plano — a caixa emite 6 faces com UV proporcional, o tile estica nas
  laterais e 2 lajes sobrepostas z-fightam (era o "bug" da flor). Certo =
  `emitCrossPlane` (mesher): 2 lâminas PLANAS na diagonal da célula ((0,0)→(1,1) e
  (0,1)→(1,0), a 90°), altura 0..1, UV do tile INTEIRO (0..1). Material é FrontSide
  (1 draw call/chunk), então cada lâmina emite os 2 LADOS (verso = winding invertido
  + normal negada) pra aparecer de qualquer ângulo. Cutout (alphaTest) some o fundo.
  Padrão reusável pra qualquer sprite-billboard futuro (grama alta, mudas).
- **Hitbox VISUAL segue a forma (2026-07-20 sessão 8):** `blockSelectionBox(id)` no
  mesher devolve a caixa [x0,y0,z0,x1,y1,z1] (frações da célula) que ENVOLVE a forma
  do não-cubo; cubo cheio = célula inteira. PURA (só o id — estado/direção já moram
  no id: porta/janela aberta, quadro/móvel direcional; usa rotXZ pro quadro). O
  contorno preto da mira (client/main.ts) virou um cubo unitário REESCALADO/
  reposicionado por frame a partir dessa caixa (getBlock no target → box → scale+pos,
  +0.004 de folga do antigo 1.002). Antes era sempre 1.002³ (flor fininha com contorno
  de bloco cheio flutuando = feio). Mesa/cadeira/sofá/cama usam caixa quase-cheia.
- **Porta (cp23): estado mora no ID** (PortaX/Z × Fechada/Aberta) — abrir =
  trocar byte via block_changed, zero metadata. Par vertical = MESMO id nas 2
  células; metade de cima se reconhece pelo vizinho de baixo. `use_block`
  (clique direito em interativo) alterna as duas; fechar recusa com jogador no
  vão (senão trava preso). `doorRule` limpa metade órfã no tick (quebrar uma
  derruba a outra — sem código especial no break). Porta REJEITADA em /bloco,
  /regiao encher e sortear (comando de célula única criaria metade órfã).
  Eixo escolhido no CLIENTE pelo yaw na hora do place; hotbar tem UMA entrada.
- **Porta com DOBRADIÇA (2026-07-19, backlog):** painel na BORDA da célula, não
  centrado — fechada e aberta compartilham a aresta vertical do canto (0,·,0)
  da célula (= dobradiça), então abrir pivota 90° na ponta como porta real.
  Fechada PortaX: x∈[0,2P]; aberta: z∈[0,2P] (PortaZ espelha). Sem id novo de
  lado-da-dobradiça (8 ids a mais = fora do escopo rápido); dobradiça é sempre
  o canto de coord baixa. Testes de contagem de face do cp23 NÃO mudaram
  (painel na borda em vão de ar emite as mesmas faces do centrado).
- **Escolher o LADO da dobradiça (2026-07-20, sessão 7):** o "fora do escopo" acima
  foi revogado — o usuário pediu. Encoding = 4 ids R (`PortaXFechadaR`..`PortaZAbertaR`,
  108-111, APPEND depois das flores; NÃO dá pra numerar junto das base sem quebrar bytes
  de save). R = dobradiça na aresta ALTA do "flanco" (eixo que o painel varre: PortaX
  flanca em Z, PortaZ em X). FECHADA idêntica nas 2 dobradiças (varre o vão todo) — só a
  ABERTA muda de lado; por isso a variante é PURO VISUAL (mesher), física é por célula
  (sólida/vazia). A ESCOLHA mora no SERVIDOR, não no cliente (`escolherDobradica` em
  session.ts, no place_block da porta): (1) porta vizinha do MESMO eixo em qualquer lado do
  flanco → dobradiça OPOSTA à dela (porta dupla, abre pro meio); (2) senão, cubo cheio num
  lado do flanco e não no outro → dobradiça do lado da parede (checa y E y+1, porta é 2 alta);
  (3) empate → base. Cliente NÃO mudou (segue mandando só o eixo — PortaXFechada/PortaZFechada;
  copy mapeia qualquer porta → PortaXFechada). Helpers: `isPortaAberta`/`portaEixoX`/
  `portaHingeAlta`/`portaComHinge` (este NORMALIZA a entrada, aceita base ou R). PEGADINHA:
  `isFullCube` dependia da faixa `Cerca..Tocha` pra excluir portas; os ids R saíram da faixa
  → precisou `!isPorta(id)` explícito (senão porta R viraria cubo cheio e ocluiria vizinho).
  `isSolidBlock`/`isPlaceable` trocaram os literais PortaXAberta/PortaZAberta por `isPortaAberta`
  (cobre R). Padrão reusável pra JANELA (mesmo desenho) se um dia pedir dobradiça escolhida.
- **JANELA ganhou a mesma dobradiça (2026-07-20, sessão 7b):** 4 ids R (112-115) + helpers
  espelho (`isJanelaAberta`/`janelaEixoX`/`janelaHingeAlta`/`janelaComHinge`). `escolherDobradica`
  (session.ts) foi GENERALIZADO em vez de duplicado: recebe `alturas` (porta=2 → checa parede em
  y E y+1; janela=1 → só y) + os predicados da família (`mesmoTipo/ehEixoX/hingeAlta/comHinge`).
  Porta e janela chamam o MESMO método com seus helpers. Janela = 1 célula, sem par vertical nem
  regra de órfão (não entra em RULES) → branch próprio no place_block (só 1 applyBlock). Cliente
  ZERO mudança nas duas (copy `isPorta`/`isJanela`→base cobre R; place manda só o eixo). LIÇÃO:
  ao adicionar a 2ª família com a mesma mecânica, generalizar o método (params) rende mais que
  copiar — mas os IDs/helpers ficam por família (id é byte de save, não dá pra unificar).
- **Autocomplete de NOMES (2026-07-19):** `learnPlayers` em client/commands.ts
  espelha learnWorlds; main.ts alimenta com Map id→nome do `player_moved`
  (guard: só quando nome novo/diferente — senão roda a 10 Hz×N jogadores) e
  poda no `player_left`. Slots com nome: /kicar /resetpin /tpr /tpa nível 2,
  /tp = ["grupos", ...nomes], /amigos convidar|aceitar|recusar|expulsar nível 3.
- **Encher em lote (cp23b):** /regiao encher usa `applyBlockQuieto` (tudo do
  applyBlock MENOS o broadcast — regras e objetivos acordam célula a célula) e
  UMA msg `blocks_filled` (caixa+id); células puladas (jogador dentro) são
  corrigidas com block_changed DEPOIS do lote. Cliente: setBlock em loop +
  `remeshBox` (1 remesh por chunk tocado, não por bloco) + 1 gatilho de som.
  Teto: MAX_ENCHER_CELLS=65536 (16× o antigo); MAX_OBJETIVO_CELLS segue 4096
  porque detecção recheca a região a CADA mudança (custo recorrente).
- **/tpr + /tpa + /tp nome (2026-07-17):** aluno NUNCA teleporta ninguém sem
  consentimento — /tpr nome registra pedido (Map por DESTINATÁRIO em
  `tpPedidos`, expira TP_PEDIDO_MS=30 s pelo clock injetado `this.now()`),
  /tpa [nome] aceita (poda expirados e desconectados via players.has no
  aceite; disconnect do destinatário apaga a fila dele). Professor: /tp nome
  vai direto; /tp nome x y z ENVIA o jogador (~ relativo ao TELEPORTADO,
  convenção Minecraft; +0.5 no centro da célula). Tudo sobre o helper
  `teleportar()` — zero protocolo novo. /tp grupos intacto.
- Coordenada digitada em comando (2026-07-17): `parseCoordArg(token, base)`
  (module-level em session.ts) entende inteiro, `~` e `~n` — relativos à CÉLULA
  do autor (Math.floor da posição). Usado por `/regiao criar nome x1 y1 z1 x2
  y2 z2` (forma com varinha continua valendo; 3 OU 9 parts) E por `/bloco x y
  z id`. REUSAR no futuro `/tp nome x y z` em vez de duplicar o parse. Bounds:
  os DOIS cantos passam por inBounds antes de criar.
- Chat no toque: Enter do teclado VIRTUAL precisa do fallback `e.key ===
  "Enter"` (Android nem sempre preenche e.code); fechar sem enviar = tocar no
  canvas (chat.close() público) — não existe Esc no celular.
- Tela cheia mobile: requestFullscreen SÓ funciona em gesto do usuário — por
  isso vive no startPlay (tap do "voltar ao jogo") e num botão; encadeia
  `screen.orientation.lock("landscape")` DEPOIS da promise da tela cheia
  (lock exige fullscreen); tudo com catch vazio (iPhone não suporta).
- Controles de toque (2026-07-16, `client/src/touch.ts`): a UI de toque SÓ
  sintetiza o input que teclado+mouse já geram — `input.setKey` (joystick liga
  as MESMAS teclas de settings.keys → rebind vale de graça), `input.applyLook`
  (mesma conta/clamp do mousemove) e `input.press(botão)` (dispara o handler
  de onMouseButton existente). O loop lê `input.active` (= locked OU touch);
  a linha do `pointerlockchange`/showOverlayMain segue `locked` (é específica
  de pointer lock). `input.lock()` é no-op com touch ligado — os lock()
  espalhados (fechar chat/painel/inventário) ficam inofensivos sem tocar
  neles. `setShown(false)` SOLTA as teclas seguradas (heldKeys) — esconder a
  UI no meio de um toque não deixa o jogador andando sozinho. Botão novo de
  ação = compor sobre input.press/setKey, nunca handler paralelo.
- **Voo criativo (2026-07-17):** voo é 100% CLIENTE (física em /shared, cp10
  server-validation adiado) — `MoveInput.fly` desliga a gravidade em stepPlayer,
  `jump` sobe e `sneak` desce, mas AINDA colide (moveAxis, não atravessa parede;
  convenção Minecraft criativo). Cliente: duplo-toque no pular alterna `flying`
  (espelha o latch do sprint), só se `podeVoar()` = papel professor OU voo
  liberado pra turma. Descer voando NÃO agacha a câmera (`sneak && !fly`).
- **`/voo` (2026-07-17):** professor libera/tranca voo pra TURMA; ele voa sempre
  (independe do flag). Estado `vooLiberado` na session, NÃO persiste (nasce
  desligado a cada sessão). Msg `voo {liberado}` server→cliente: broadcast no
  toggle + enviada no join SÓ quando `liberado` (default false = zero churn nos
  asserts de contagem do join — ver Do-Not-Repeat de 2026-07-16). Aluno que perde
  a liberação no meio do voo cai (handler do cliente zera `flying`). Padrão de
  "flag de turma com toggle do professor" reusável (ex.: futuro modo construir).
- **Rocha-matriz na camada 0 (2026-07-17):** `generateWorld` (preset normal)
  põe Bedrock em y=0 e Stone de y=1..h — igual ao plano/cabines (que derivam de
  generateFlatWorld e já tinham). Aluno não fura o fundo do mundo em nenhum preset.
- `touch-action: none` no body NÃO trava scroll de container interno com
  overflow próprio (menu, painéis): o gesto consulta touch-action só do alvo
  até o elemento que ROLA — body fica fora da cadeia. Mata pull-to-refresh e
  scroll da página sem quebrar os menus.
