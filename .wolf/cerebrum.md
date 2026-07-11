# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-07-10

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->

- Dev é **100% vibecode**: o usuário orquestra, NÃO revisa código. Arquitetura precisa
  carregar o peso sozinha (TS estrito, módulos pequenos, testes, checkpoints jogáveis).
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
- [2026-07-10] **Código mora em `~/projetos/logica-em-jogo` (WSL ext4), NÃO no OneDrive.**
  OneDrive sincroniza node_modules (milhares de arquivos) e watcher do Vite via /mnt/c é
  lento no WSL. Docs + `.wolf/` ficam no OneDrive; backup do código via git/GitHub privado.
