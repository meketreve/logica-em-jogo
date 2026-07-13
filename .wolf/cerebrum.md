# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-07-10

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- Dev é **100% vibecode**: o usuário orquestra, NÃO revisa código. Arquitetura precisa
  carregar o peso sozinha (TS estrito, módulos pequenos, testes, checkpoints jogáveis).
- **Simplicidade > segurança quando não há dado sensível** (correção 2026-07-12): usuário
  mandou tirar o hash do PIN/código — "uso muito básico, sem informações importantes".
  Não construir criptografia/ofuscação sem ameaça real; rate-limit basta.
- Fala português. Responde em blocos numerados às perguntas.
- Quer ser desafiado no design: aceita bem quando aponto furos pedagógicos/técnicos.

## Key Learnings

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

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

- [2026-07-10] NÃO usar código/assets do Minecraft ou Eaglercraft (Eaglercraft = port não
  licenciado). projeto.txt §9 rejeita software não licenciado. Copiar só o MODELO (voxel no
  navegador), com engine e assets próprios.
- [2026-07-10] Aba de navegador NÃO abre socket de escuta nem executa binário; WebAssembly
  NÃO contorna (roda no sandbox). "Abrir pra LAN" é papel do HOST (.exe/servidor Node),
  não do aluno. Não prometer cliente-web que vira servidor-web.
- [2026-07-10] Não escrever "relatório de aplicação" antes do piloto real acontecer.
- [2026-07-11] Parâmetro de função com default vindo de objeto `as const` infere TIPO LITERAL
  (ex.: `yEnd = ATLAS.tilePx` vira tipo `16` e rejeita outros valores). Sempre anotar:
  `yEnd: number = ATLAS.tilePx`. (bug-001)
- [2026-07-11] Com `noUncheckedIndexedAccess`, indexação de Uint8Array/array devolve
  `T | undefined` — usar `?? fallback` (ex.: `?? BlockId.Air`) em vez de `!` nos acessos a chunk.
- [2026-07-11] NUNCA rodar sed/normalização em `git ls-files` sem excluir binários — corrompeu
  o PDF do projeto (restaurado do index). Filtrar por extensão ou usar `git grep -Il ''` (só texto).
- [2026-07-11] Saída de git via rtk é comprimida/cacheada — `git status` pode mentir. Verdade:
  `git diff --numstat` / `git diff-index HEAD --` / `git hash-object <arq>` vs `git ls-files -s`.
- [2026-07-11] NÃO usar `fuser -k` cego em porta compartilhada (8080/5173): matei o
  `npm run dev:server` do USUÁRIO achando que era o meu processo de fundo. Antes de matar,
  conferir dono: `ps -o pid,cmd -p $(fuser 8080/tcp 2>/dev/null)` ou guardar o PID do
  processo que EU iniciei e matar só ele.
- [2026-07-11] Não recalcular valores do terreno pristino (spawn etc.) no join ou no cliente
  a partir do snapshot — mundo/snapshot podem estar modificados (bug-010). Calcular na
  criação do mundo e transmitir pelo protocolo.
- [2026-07-11] `Buffer.buffer` do Node é o POOL compartilhado (byteOffset ≠ 0 em
  readFileSync) — pra virar ArrayBuffer: `raw.buffer.slice(raw.byteOffset,
  raw.byteOffset + raw.byteLength)`. Passar `.buffer` direto lê lixo de outros buffers.
- [2026-07-11] /shared (lib ES2022 pura) não declara TextEncoder/TextDecoder (existem
  em runtime nos 3 hospedeiros) — usar `declare class` ambiente mínima no arquivo que
  precisa (save.ts), NÃO adicionar lib DOM ao tsconfig (quebraria a pureza).
- [2026-07-12] `npm run dev`/`dev:server` via Bash background do Claude morre com
  exit 143 e log VAZIO (atrito npm+rtk+wrapper de background). Subir direto:
  `cd server && nohup npx tsx src/index.ts > log 2>&1 &` e conferir porta com
  `ss -tln`. Vite pode pular pra 5174 se 5173 estiver ocupada — sempre verificar
  a porta real antes de passar URL ao usuário.
- [2026-07-13] Variável de módulo usada por função chamada NO BOOT precisa ser
  declarada ANTES do primeiro call site, não só do ponto de uso: `let activePanel`
  no meio do main.ts + `updateOverlay()` no boot = TDZ ReferenceError e tela
  cinza (bug-151). Vitest/typecheck NÃO pegam — só rodar a página pega.
- [2026-07-13] Matar servidor de fundo iniciado com `nohup npx tsx &`: o PID do
  `$!` é o wrapper npx — o node filho segue vivo segurando a porta (bug-092).
  Achar o dono REAL com `ss -tlnp | grep PORTA` e matar esse PID (SIGINT no host
  Node = salva antes de sair).
- [2026-07-13] Smoke `.mts` no scratchpad: rodar `node --import tsx script.mts`
  com CWD no repo (tsx resolve de node_modules do projeto); do scratchpad dá
  ERR_MODULE_NOT_FOUND. Import de /shared por caminho absoluto continua valendo.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

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
