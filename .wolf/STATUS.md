# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.
> Last updated: 2026-07-11

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
  typecheck 3/3, build ok.

---

## 🚀 Próxima fase — Walking skeleton (MVP v0)

**Objetivo:** mundo voxel jogável no navegador com netcode cliente=servidor, blocos
colocáveis/quebráveis, areia com gravidade, e chat com 1 comando de teste.

### Escopo do MVP v0 (ENXUTO — travado)
- Blocos: **grama, pedra, pedregulho, areia** (areia afetada por gravidade).
- Movimentação 1ª pessoa (WASD + mouse look / pointer lock).
- Colocar e quebrar bloco.
- **Netcode cliente=servidor** (igual Minecraft): singleplayer roda servidor local
  embutido no cliente; LAN = host serve os outros. Servidor é autoritativo.
- Chat + **1 comando simples** só pra provar o pipeline de comando (parser no servidor).
- Sem som (mas prever **gatilhos de som** — hooks de evento pra plugar áudio depois).
- Texturas simples.

### FORA do MVP v0 (adiar, explicitamente)
- Crafting / inventário / "produzir item".
- Comandos complexos (`/tp` etc.), níveis de permissão elaborados.
- Salvar mundo no Drive (fica só no host; exportar Drive é manual/futuro).
- Circuitos lógicos, truth tables, sequência de blocos coloridos (vêm depois; ver arquitetura).
- Contas com senha; painel completo de professor.
- Mundos publicados online (por ora compartilhamento manual via Drive).

### Critérios de aceitação
1. Abrir no navegador, andar num mundo de blocos, colocar e quebrar bloco.
2. Areia cai quando o bloco de baixo é removido — via TICK DO SERVIDOR, não hack no cliente.
3. Dois clientes veem o mesmo mundo e as mudanças um do outro (host + 1 cliente).
4. Chat funciona e 1 comando de teste executa no servidor e reflete no mundo.

### ⚠️ Regra de ouro de arquitetura (vibecode vai errar isso)
Areia, circuitos e detecção de objetivo são **o MESMO subsistema**: "bloco muda de estado,
avisa vizinhos, propaga no tick do servidor". NÃO implementar areia como `if (bloco===AREIA)`
especial — implementar como regra genérica de atualização de bloco por vizinhança, senão
circuitos do 9º ano exigem reescrita. Areia = 1 vizinho/1 regra. Circuito = N vizinhos/N regras.

Idem: validação de objetivo (coletar N, chegar em coord) e sequência de blocos coloridos
= mesmo sistema de "checar estado do mundo contra um padrão". Um sistema, várias idades.

### Stack (TRAVADA — completa)
TypeScript em tudo + módulo de lógica compartilhado; build **Vite**; servidor **Node + ws**;
empacotar depois com Tauri/Node SEA. Render 3D: **three.js** (FECHADO 2026-07-10 — ver
cerebrum Decision Log). UI/chat em HTML/CSS por cima do canvas, não GUI de engine.

**Local do projeto (ATUALIZADO 2026-07-10):** projeto INTEIRO (docs + `.wolf/` + código
futuro) movido para `~/projetos/logica-em-jogo` (filesystem do WSL). Motivo: node_modules
no OneDrive trava sync e watcher do Vite via /mnt/c é lento. Cópia no OneDrive fica como
arquivo morto/backup dos docs. Backup do código: git (repo privado no GitHub) — criar no scaffold.

### Política de otimização (FECHADA 2026-07-10 — "não otimizar o desnecessário")

**Baseline (checkpoint 1 — viabilidade/estrutura, não otimização):**
- 1 mesh por chunk (BufferGeometry única). NUNCA 1 mesh/objeto por bloco.
- Culled meshing: só gerar faces vizinhas de ar (corta >90% das faces).
- Chunk = `Uint8Array` plano (4096 bytes por 16³). Estrutural: afeta /shared, snapshot, save.
- Texture atlas → 1 material, 1 draw call por chunk.
- Mesher = função pura (bytes → geometria) → mover pra Worker depois fica barato.
- Tick fixo do servidor (~10 tps) desacoplado do render.
- Updates por fila de vizinhança sujos (regra de ouro), sem scan do mundo todo.
- Mundo pequeno de tamanho **definido na criação** (em chunks X×Z×Y), gravado no header
  do save e do `world_snapshot` — cliente nunca assume tamanho. Sem resize ao vivo.
  Default v0: 8×8×4 chunks (128×128×64 blocos, 1 MB). Teto validado pelo servidor:
  16×16×8 (revisar com métricas do lab). UI de escolha = fase de autoria, não MVP.
- `world_snapshot` binário (bytes de chunk); resto do protocolo JSON.
- Render: **WebGLRenderer** (WebGPU experimental + PCs fracos de escola).
- **HUD de perfilação (F3)** desde o checkpoint 1: FPS, frametime (méd+p95), tempo de
  remesh, draw calls/triângulos (`renderer.info`), msgs/s + bytes/s. Servidor manda
  `debug_stats` 1×/s com duração do tick (a partir do checkpoint 2). Botão exporta JSON
  (dados p/ testes no lab e p/ relatório final). FORA: flame graph, telemetria persistente,
  dashboard — DevTools já cobre análise profunda.

**Adiadas (só com gatilho medido):**
- Greedy meshing ← FPS baixo em PC do lab (32³: ~73k→4k vértices, mas remesh + UV complicam).
- Meshing em Web Worker ← hitch de frame ao editar/carregar chunk.
- Lerp de jogadores remotos ← movimento serrilhado no checkpoint 5.
- gzip no save ← save > alguns MB.

**Proibidas (overengineering p/ 20 alunos LAN, mundo pequeno):**
- Client-side prediction/rollback (LAN ~1ms). ECS. Octree/SVO. InstancedMesh/BatchedMesh
  por bloco. WebGPURenderer. protobuf/msgpack. LOD/streaming/occlusion culling.
  Servidor multithread. WASM.
- Frustum culling: three.js já faz por objeto — nada a construir.

### Plano de arquitetura (APROVADO 2026-07-10 — construir a partir daqui)

Monorepo:
- `/shared` — lógica AUTORITATIVA (mundo, blocos, física da areia, tick, aplicar ações).
  TS puro, ZERO dependência de navegador ou Node. Roda igual nos 3 hospedeiros.
- `/server` — embrulha `/shared`. Web Worker (single) OU Node+ws (host). Única "verdade".
- `/client` — three.js. SÓ desenha e manda input. Nunca decide estado.
  REGRA: se uma linha decide estado do mundo e está em `/client`, está no lugar errado.

Cliente=servidor: o cliente SEMPRE fala com um servidor por WebSocket, mesmo sozinho
(single = Web Worker na aba; LAN = .exe do professor). Mesmo código de cliente, mesma
conexão, mesmas mensagens — cliente não sabe qual hospedeiro é.

Protocolo v0 (só isso):
- cliente→servidor: `join`, `move`, `place_block`, `break_block`, `chat`
- servidor→cliente: `world_snapshot`, `block_changed`, `player_moved`, `chat`, `debug_stats` (1×/s, duração do tick)
- Areia caindo chega como `block_changed` normais (cliente não sabe que foi gravidade).
- Header do `world_snapshot` carrega dimensões do mundo em chunks.

Mundo: chunks pequenos (~16³). IDs: 0=ar, 1=grama, 2=pedra, 3=pedregulho, 4=areia.
Areia = regra de atualização por vizinhança no tick do servidor (MESMA engrenagem dos
circuitos futuros — NÃO código especial de areia).

Ordem dos checkpoints (cada um jogável antes do próximo):
1. ✅ Mundo estático + andar (só cliente three.js, WASD+mouse, sem rede).
2. ✅ Servidor autoritativo (mundo vem de `/shared` via Web Worker; tela igual).
3. ✅ Colocar/quebrar (clique→ação→`block_changed`).
4. ✅ Areia cai (tick de gravidade no servidor).
5. Segundo cliente (Web Worker → Node+ws; 2 navegadores, mesmo mundo).
6. Chat + 1 comando (parser no servidor).

Rede de segurança (dev sem revisão): TS estrito; `/shared` sem deps; testes automáticos
em `/shared` desde o checkpoint 2 (gravidade testável sem abrir navegador); cada checkpoint jogável.

**Próximo passo concreto:**
1. **Playtest do checkpoint 4 pelo usuário:** colocar areia no ar → cai 1 célula/tick
   (~10/s); quebrar bloco embaixo de areia → cai em cadeia; pedra/pedregulho no ar
   ficam parados; F3 → tick ms deve continuar ~0.
2. **Checkpoint 5: segundo cliente (LAN).** Trocar o hospedeiro Web Worker pelo Node+ws
   (`/server/src/index.ts` embrulha a MESMA GameSession; `WsConnection` no cliente com a
   MESMA interface `Connection`). Precisa de: id de cliente por socket, `player_moved`
   broadcast (outros jogadores visíveis — mesh simples), disconnect → handleDisconnect.
   2 navegadores, mesmo mundo, mudanças de um aparecem no outro (critério de aceitação 3).
3. Depois: checkpoint 6 (chat + 1 comando com parser no servidor).

⚠️ Issue conhecida (bug-003, fix PARCIAL, NÃO bloqueante): pulos ocasionais de câmera
por spikes de movementX/Y do Chrome no pointer lock. Filtro MAX_DELTA=200 +
unadjustedMovement melhorou bastante; restam pulos raros. HUD F3 mostra
`mouse Δmáx/descartados` — pedir esses números ao usuário antes de mexer de novo.

### Decisões pendentes (só quando chegar na fase)
- Circuitos: blocos-no-mundo (estilo redstone) vs painel que colapsa em 1 bloco.
  Inclinação atual: **painel que vira bloco reutilizável** (= abstração, pilar da Wing).
  Decidir só quando chegar nessa fase.
- Assinatura de código do .exe (SmartScreen bloqueia .exe não assinado → professor de outra
  escola desiste). Problema de ADOÇÃO, não de código. Resolver antes de distribuir amplo.

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
