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
- **Convenções de Minecraft são o padrão esperado** (playtest 2026-07-13): pediu
  botão-do-meio = copiar bloco mirado; sprint que só engata com os pés no chão.
  Quando houver dúvida de UX de jogo, seguir o que o Minecraft faz — o público
  (alunos e professor) já tem esse modelo mental.
- **Uma tela = UM botão "voltar"** (playtest 2026-07-13): a config mostrava dois
  (o do HTML e o da categoria). Quem renderiza a tela é dono da navegação dela.
- **Feature grande / "talvez" → ENTREVISTA de escopo antes de codar** (2026-07-17):
  no cp24 (anti-griefing) o usuário pediu "faz a entrevista de escopo" e respondeu
  2 rodadas de AskUserQuestion (4 perguntas cada) — gostou de travar decisões com
  perguntas objetivas antes de escrever código. Pedidos BEM DEFINIDOS (rocha-matriz,
  mundos-aula) ele quer feitos inline na hora; ideias vagas/"talvez" ele quer
  scopadas primeiro. Costuma empilhar vários pedidos no mesmo turno — separar
  concreto (fazer já) de exploratório (backlog + entrevista).
- **Painel HTML é sempre FASE 2** (reforço cp24): a convenção do cp14 vale — codar
  os comandos de chat primeiro (usáveis no playtest), painel depois. O usuário
  aprova features só com comandos e pede o painel numa rodada seguinte.

## Key Learnings

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

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->

- [2026-07-19] `Number(null) === 0` — param numérico OPCIONAL de URL exige
  checar `raw === null` ANTES de `Number(raw)`, senão a ausência vira 0 válido
  (bug-302: cliente sem ?hora travou o céu na meia-noite ignorando o servidor).
- [2026-07-19] Teste que quer "id de bloco inválido" usa 200, NUNCA `MAX+1`
  literal — cada append de bloco quebrava o assert (aconteceu 2× na mesma
  sessão: 71 virou tapete, 99 virou cama, 100 virou quadro).
- [2026-07-19] Bloco de código module-level em main.ts: declarar DEPOIS das
  consts que usa — `?yaw` referenciou `input` antes do `const input` e o módulo
  inteiro morreu em TDZ (tela cinza; bug-301). Screenshot headless pega.
- [2026-07-19] `pkill -f` no ambiente com hook rtk mata o próprio wrapper (exit
  144) e o servidor de stage SOBREVIVE segurando a porta — o restage seguinte
  fala com o servidor VELHO e o screenshot sai da cena antiga (idêntico byte a
  byte foi a pista). Matar por `fuser -k PORT/tcp` e conferir `ss -tln | grep
  PORT` ANTES de subir o novo. E `node --import tsx` resolve o tsx a partir do
  CWD — rodar da RAIZ do repo, nunca do scratchpad (ERR_MODULE_NOT_FOUND).
- [2026-07-19] `/bloco` RECUSA porta (criaria metade órfã) — script de stage
  que precisa de porta usa `place_block` de verdade (materializa as 2 células
  e exige alcance: mandar um `move` pro spawn antes).

- [2026-07-16] Adicionar uma mensagem à sequência de `admitir()` (join) QUEBRA os
  testes que contam/indexam mensagens do join. O `sendTime` do cp21 entrou depois
  do snapshot e derrubou 3 asserts em session.test.ts (join `toHaveLength(3)→4`;
  welcome saiu de sent[2]→sent[3]; sequência `["spawn","snapshot","teleport",
  "chat"]` ganhou "time"). Ao mexer no join, rode `npm test` e ajuste esses
  asserts — prefira FILTRAR por tipo (`.find(m=>m.type===...)`) a indexar posição.
- [2026-07-16] Smoke de valor que MUDA sozinho não usa igualdade exata. O
  primeiro `_smoke` de `time` assertou `hora===21` com o ciclo LIGADO — a hora já
  tinha avançado pra 21.00x quando o check rodou. Congele primeiro (`/ciclo
  desligar`) e então confira valor exato, ou use faixa. (Não era bug do produto.)

- [2026-07-13] Oclusão de face NÃO se decide pela transparência do bloco DONO da
  face — só pela do VIZINHO. A regra do cp18 ("pula se id é transparente ou
  vizinho é opaco") sumia com a face da folha colada no vidro (bug-167). Regra
  certa: `face aparece se vizinho == ar || (transparente(vizinho) && vizinho != id)`.
  Mesmo id encostado funde (vidraça contínua); ids transparentes diferentes
  emitem as DUAS faces coplanares — sem z-fight, porque o material é FrontSide e
  a face oposta vira backface.
- [2026-07-13] Modificador de movimento (sprint) NÃO pode sair direto do input:
  precisa de estado ENGATADO no PlayerState (bug-168). Ler `input.sprint` no
  passo dava turbo no ar. Padrão: engata com `onGround`, desengata ao soltar.

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
- [2026-07-17] Smoke do HOST Node sem `LJ_SAVE` grava/sobrescreve o
  `server/world.ljw` RASTREADO (save-default do host, versionado no commit de
  sync casa↔escola) — poluiu o arquivo e depois `rm` deu `D` no git. Ao subir o
  host pra teste/screenshot, SEMPRE passar `LJ_SAVE=<scratchpad>/teste.ljw` (e
  LJ_PORT próprio). Se já poluiu: `git checkout -- server/world.ljw`.
- [2026-07-13] Smoke `.mts` no scratchpad: rodar `node --import tsx script.mts`
  com CWD no repo (tsx resolve de node_modules do projeto); do scratchpad dá
  ERR_MODULE_NOT_FOUND. Import de /shared por caminho absoluto continua valendo.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->

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
