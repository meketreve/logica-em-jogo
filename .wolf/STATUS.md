# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.
> **SESSÃO 24 (2026-07-26) — ÁGUA APROVADA NO PLAYTEST + §🔁 CODADO E VERDE (playtest do
> browser pendente).** Abertura: o usuário respondeu o ponto de decisão da sessão 23 —
> **playtestou o refino de água e APROVOU** ("worldgen novo com água, animação de textura e o
> render por nível com conexão de textura, ficou muito bom"). Pediu pra ANOTAR (não fazer) uma
> frente nova: **melhorar a textura da água + a direção da animação seguir o VENTO** — e o que
> o vento puxa junto (nuvens, folhas balançando, grama, flores). Virou `ROADMAP.md §🌬️` com 6
> frentes ordenadas por custo. **§🔁 IMPLEMENTADO (as duas frentes):**
> **(1) bug-211 FECHADO** — `enviarRaio()` novo (main.ts) guarda o último raio anunciado
> (`raioEnviado`) e reenvia `{type:"radius"}` quando a config muda; chamado no `connect()`
> (reset pra −1: conexão nova = servidor novo) e no `onSettingsChanged()` (que é o `onChanged`
> do `buildConfigScreen` no menu principal E no Esc). O servidor não mudou.
> **(2) Rede de segurança** — msg nova `pedir_coluna {cx,cz}`: o servidor só faz
> `st.enviadas.delete(key)` e o `streamColunas` do tick seguinte reenvia pelo caminho normal
> (ZERO envio paralelo, decisão de desenho). Guardas no SERVIDOR: exige join+stream, bounds,
> dentro de raio+`FOLGA_DESCARTE`, e teto `PEDIDOS_COLUNA_POR_S=8` por cliente por segundo
> (janela de 1 s no `this.now()`) — o comando chega pela rede da escola. No CLIENTE:
> `varrerFaltando()` roda na MESMA passada 1×/s do descarte (o contador que a §🕐 vai
> precisar já nasce aqui), com carência de 4 s antes do 1º pedido (streaming é gradual),
> backoff exponencial 2 s→30 s, teto de 4 pedidos/varredura e descarte de bytes+geometria
> ANTES de repedir (decode que morreu no meio deixa meia coluna). Detecção de CORROMPIDO caiu
> de graça: `decodeColunas` agora em try/catch (antes a exceção subia pelo handler de
> mensagem) e `processarFila(budget, onFalha)` reporta chunk cujo mesh jogou exceção → a
> coluna sai de `colunasCarregadas` e a varredura repede. F3 ganhou `faltando` e `repedidas`.
> **VERDE: typecheck 3/3, 329 testes (+5), build ok. Smoke ws REAL 10/10**
> (`server/src/cenarios/_smoke-pedir-coluna.mjs`, mundo LJ_TAMANHO=E: raio 4→8 trouxe 200
> colunas do anel novo ✅, `pedir_coluna` reenviou a coluna do spawn ✅, flood de 24 pedidos
> virou 7 colunas ✅, pedidos inválidos não derrubam o host ✅). **bug-215 logado** (a rede de
> segurança) e **bug-211 marcado corrigido**; de quebra, o `bug-211` DUPLICADO que um hook
> criou (auto-detected, hud.ts) virou `bug-214`.
> **PLAYTEST DO USUÁRIO ✅ (mesma sessão):** "mudar distância de render carrega corretamente,
> F3 mostra informações corretamente". Perfilou o pior caso (mundo E, raio 12, VOANDO, 234 s,
> RTX 2060) e enviou pelo botão do F3 → `profiles/perf-1785086834711-wmi5.json`. **§🔁 passou:
> `faltando 0`, `repedidas 16` em 719 colunas (2%)** — carência de 4 s + backoff calibrados.
> O mesmo perfil expôs o CUSTO DE RENDER (47 FPS, p95 39 ms, 2895 draw calls, 157 long
> tasks) — tabela e leitura na política de otimização do ROADMAP. **TUDO COMMITADO em
> `e3eaac4`** (água + §🔁, a pedido do usuário; árvore limpa). Sessão 23 abaixo ↓
> **SESSÃO 23 (2026-07-26) — SESSÃO DE PLANEJAMENTO (zero código). Duas frentes novas no
> ROADMAP + causa raiz de um bug achada de graça.** Usuário pediu pra anotar (não implementar):
> **(A) §🕐 TELA DE CARREGAMENTO** (single + rede) — taxa em BITS/s (converter de `bytesIn/
> bytesOut`, que `connection.ts` já conta), colunas carregadas × em transferência, fase/ETA/
> ping/host; DUAS animações desacopladas de propósito: spinner decorativo no canto (sinal de
> vida — gira mesmo se a rede parar) + progresso REAL no centro (colunas prontas ÷ total do
> raio). Bloqueio que o próprio usuário apontou: `updateOverlay()` (`main.ts:206`) mostra o
> menu Esc sempre que `!input.active` → suprimir enquanto `loading.ativo`.
> **(B) §🔁 RECARREGAR COLUNA FALTANDO/CORROMPIDA** — varredura 1×/s (mesma passada que já faz
> o descarte, `main.ts:1439`) lista coluna dentro do raio ausente de `colunasCarregadas` ou com
> decode/mesh falho → msg nova `pedir_coluna {cx,cz}`; servidor só faz `st.enviadas.delete(key)`
> e o `streamColunas` do tick seguinte reenvia sozinho (sem caminho de envio paralelo).
> **CAUSA RAIZ DO bug-211 achada ao escrever a nota** (o usuário só sabia do sintoma "aumentar
> a distância de render não traz chunk novo, só mantém mais renderizado"): `main.ts:542` manda
> `{type:"radius"}` UMA vez, logo após o join. Mexer no raio na config ao vivo só muda a regra de
> DESCARTE do cliente (`main.ts:1442`); o servidor nunca sabe, `st.raio` fica no valor velho
> (`session.ts:603`) e o anel novo jamais entra no lote. Diminuir "funciona" por acidente (os dois
> lados descartam pela mesma regra). bug-211 LOGADO como ABERTO. **ORDEM DECIDIDA: §🔁 antes de
> §🕐** — motivo abaixo na Próxima fase. Sessão 22 abaixo ↓

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

---

## 🚀 Próxima fase — §🕐 TELA DE CARREGAMENTO, depois CUSTO DE RENDER

> Backlog e referência de escopo vivem em `.wolf/ROADMAP.md` (inclui o checklist de dia de
> aula do piloto). Mantenha aqui só a quest ATIVA. §🕐 está detalhada lá — **ler a seção §🕐
> do ROADMAP antes de codar.**

**ORDEM (decidida pelo usuário no fim da sessão 24): §🕐 primeiro, custo de render depois.**
As duas quests da sessão 24 estão COMMITADAS (ver abaixo) — árvore limpa, nada empilhado.

### 1ª — §🕐 tela de carregamento (single + rede)

Reusa os contadores que a sessão 24 acabou de validar em playtest:
- `colunasFaltando.size` (main.ts, dentro de `startGame`) já é o "em transferência";
  `colunasCarregadas.size` é o "pronto". A varredura 1×/s (`varrerFaltando`) é o lugar
  natural pra amostrar — **não escrever uma segunda medição.**
- Taxa em **BITS/s**: converter de `bytesIn/bytesOut` do `connection.ts` (×8), amostrando
  1×/s como o HUD F3 já faz.
- Total esperado do raio sai das dims do header do snapshot cruzadas com `settings.raioRender`.
- **DUAS animações desacopladas de propósito:** spinner decorativo no canto (CSS puro, gira
  mesmo se a rede parar = sinal de vida) + progresso REAL no centro (prontas ÷ total; nunca
  volta atrás nem passa de 100%, só clampa).
- ⚠️ **Bloqueio conhecido (o usuário apontou na sessão 23):** `updateOverlay()` em `main.ts`
  mostra o menu Esc SEMPRE que `!input.active` — durante o load o ponteiro não está travado,
  então o menu de pausa apareceria junto. Suprimir enquanto `loading.ativo`.
- Novo `client/src/loading.ts`, self-contained (DOM+CSS injetados, padrão do `touch.ts`).
  Fechar só quando o snapshot chegou **E** a primeira leva de chunks foi meshada.
- Toque: `touchControls.setShown(false)` enquanto carrega (mesma regra de chat/painéis).

### 2ª — custo de render (perfil de 2026-07-26 já está na mão)

O usuário perfilou o pior caso (mundo E, raio 12, voando, RTX 2060): **47 FPS, p95 39 ms,
2895 draw calls, 755 k triângulos, 157 long tasks**. Tabela completa e leitura honesta na
**política de otimização do `ROADMAP.md`** (bloco "MEDIÇÃO DE 2026-07-26"). Resumo do que
fazer: o custo está em **draw calls + mesh**, não na rede nem na GPU. Ordem sugerida:
1. **Mesher em Web Worker** — mata o hitch episódico, que é o que o aluno SENTE
   (a gravação de 10 s teve 0 long task; os 157 são picos de chegada de terreno).
2. **Greedy meshing** — ataca draw calls e triângulos juntos (o caro de verdade).
3. Baixar o teto de `raioRender` em máquina fraca.
⚠️ **Ressalva registrada:** o gatilho ESCRITO na política é "FPS baixo em PC do lab", e
esta medição é de PC de dev com o raio 2× o padrão. **Falta o número do PC do lab** —
vale medir lá antes de investir muito.

### Backlog que nasceu nesta sessão

- **`ROADMAP.md §🌬️` — vento + vida ambiental** (pedido do usuário no playtest da água):
  textura da água → vento autoritativo (molde do `horaDoDia`) → animação da água seguindo o
  vento → nuvens → folhas balançando → grama e flores. Nada codado.
- **Som de água** (splash/borbulha/balde, WebAudio em `audio.ts`) — 4ª opção do refino de
  água, nunca escolhida.

Sessões 20+21 commitadas e pushadas (`26151f9` blocos + `41211ff` wolf + `5d18899` handoff).
Sessão 24 commitada: `e3eaac4` (água + streaming §🔁).

**Hitbox da laje: ENCERRADA (2026-07-26).** O usuário testou e confirmou — "hitbox já está
correta", NADA a mudar. Ou seja: laje segue com mira na METADE (`blockSelectionBox`) e
colisão de MEIA ALTURA (`temColisaoParcial`); NÃO copiar o modelo de célula cheia da
cerca/porta. Se uma sessão futura achar isso "inconsistente", é decisão validada em
playtest — deixar como está.

**Candidatos de backlog** (ver ROADMAP.md pro resto): layouts mobile · auto-update do
servidor · sobrevivência (fome/vida/craft) · v2 da geração.

**Entregável final (relatório) está essencialmente PRONTO** — pendências só opcionais:
embutir 2–4 prints no §3, refs em ABNT, diagrama no Anexo A. Se o usuário pedir entrega,
o passo é gerar PDF/HTML de `relatorio/relatorio-aplicacao.md`.

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
```

---

## 📚 Referências (leia SE precisar)

- `projeto.txt` — proposta pedagógica completa (BNCC, fundamentação, indicadores seção 14).
- `.wolf/cerebrum.md` — Decision Log com o PORQUÊ de cada escolha.
- `.wolf/anatomy.md` — índice de arquivos.
