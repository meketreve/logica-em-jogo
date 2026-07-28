# ROADMAP — Projeto "Lógica em Jogo"

> Backlog / referência de escopo movido do STATUS.md. STATUS.md = quest ATIVA; ROADMAP.md = planejado-mas-não-ativo.
> Quando pegar um item, move pra STATUS.md "🚀 Próxima fase".

---

## 🚀 Próxima fase — pós-MVP (v0 FECHADO 2026-07-11; seções abaixo = referência viva de escopo/stack/política)

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
1. ✅ Abrir no navegador, andar num mundo de blocos, colocar e quebrar bloco.
2. ✅ Areia cai quando o bloco de baixo é removido — via TICK DO SERVIDOR, não hack no cliente.
3. ✅ Dois clientes veem o mesmo mundo e as mudanças um do outro (host + 1 cliente).
4. ✅ Chat funciona e 1 comando de teste executa no servidor e reflete no mundo
   (playtest do usuário 2026-07-11 ✅).

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

> **MEDIÇÃO DE 2026-07-26** (perfil real; `profiles/` é GITIGNORADO — o arquivo
> `perf-1785086834711-wmi5.json` só existe na máquina de dev, por isso os números estão
> transcritos aqui).
> Pior caso proposital: mundo E (240×240×8 chunks), **raio de render no MÁXIMO (12)**,
> **voando pra frente** 234 s, numa **RTX 2060 / 24 núcleos / 32 GB**.
> | | mundo P (24/07) | mundo E, raio 12, voando |
> |---|---|---|
> | FPS | 60 | **47** |
> | frametime p95 | 16,8 ms | **39,3 ms** |
> | draw calls | 172 | **2895** |
> | triângulos | 68 k | **755 k** |
> | long tasks | 2 (1 s) | **157 (37,5 s)** |
> - **11%** do tempo de sessão em mesh (19 504 remesh / 26,5 s): voando a raio 12 a fila
>   do mesher nunca esvazia (`meshPorFrame` 8 × 47 fps ≈ 380 chunks/s de teto contra
>   83 chunks/s consumidos de forma constante).
> - **16%** do tempo em long task — MAS a gravação de 10 s teve **0 long tasks e 0 frames
>   >50 ms**. Os travões são episódicos (chegada de terreno novo, mudança de raio), não o
>   regime permanente.
> - Rede 820 kB/s (6,5 Mbps) sustentados = o streaming voando. RAM estável 166–228 MB,
>   zero context lost.
> - **Leitura honesta:** o gatilho ESCRITO é "FPS baixo em PC do lab" — isto é PC de dev
>   no pior caso, com o raio 2× o padrão (6). **Não é a medição do lab.** O que a medição
>   diz é ONDE está o custo: draw calls + mesh, não a rede nem a GPU. Se o piloto pedir
>   otimização, atacar nessa ordem: (1) mesher em Web Worker (mata o hitch episódico, que
>   é o que o aluno SENTE), (2) greedy meshing (ataca draw calls e triângulos juntos),
>   (3) baixar o teto de `raioRender` em máquina fraca. Falta o número do PC do lab.
>
> **MEDIÇÃO 2 — 2026-07-26 18:14** (`perf-1785089686334-7pm7.json`, mesma máquina), sessão
> com **`/mundo carregar`** no meio (mundo de aula pequeno → mundo E). Não é o mesmo
> cenário da medição 1 — e foi ela que expôs DOIS bugs, não um custo de render:
> | | medição 1 (voo, raio 12) | medição 2 (com troca de aula) |
> |---|---|---|
> | FPS | 47 | **36** |
> | frametime p95 | 39,3 ms | **79,7 ms** |
> | draw calls | 2895 | 2043 |
> | triângulos | 755 k | 498 k |
> | remesh (contagem) | 19 504 | **475 136** |
> | long tasks NA GRAVAÇÃO de 10 s | 0 | **36 (2,4 s = 24% da janela)** |
> | `stream.repedidas` | 16 / 719 | **252 / 700** |
> - **Menos geometria e MAIS lentidão** = o custo não era desenhar. `remeshCount` 24× maior
>   com 34% MENOS triângulos denuncia trabalho desperdiçado: `trocarMundo` fazia `buildAll()`
>   em mundo lazy = **460 800 remesh de slot vazio** (240×240×8), ~19 s de trava (**bug-517**).
> - As 252 repedidas eram o §🔁 tentando tapar um buraco que o servidor se recusava a
>   preencher: sessão nova volta pro `RAIO_PADRAO` e o cliente não reanunciava o raio
>   (**bug-518**). O `meta` do perfil ainda era do mundo do join (**bug-519**).
> - **Lição de método:** perfil com número ESTRANHO (menos triângulo, mais lag) é bug antes
>   de ser gargalo. Só depois de fechar os três é que a comparação de RENDER volta a valer —
>   a medição 2 NÃO deve ser usada como argumento pró/contra greedy meshing.
>
> **MEDIÇÃO 3 — 2026-07-26 18:40** (`perf-1785091204014-l9iv.json`), MESMO cenário da 2
> (troca de aula + mundo E) **com os três bugs corrigidos**. É a primeira medição limpa
> desse caminho:
> | | medição 2 (com os bugs) | medição 3 (corrigida) |
> |---|---|---|
> | remesh | 475 136 | **10 984** (−98%) |
> | repedidas | 252 | **4** |
> | `meta` do perfil | mundo do join (errado) | mundo em vigor ✅ |
> | FPS | 36 | 41 |
> | p95 | 79,7 ms | 69,3 ms |
> - **O que sobrou é o mesher, e agora dá pra ver limpo:** 10 984 remesh custaram 15,0 s em
>   96 s de sessão = **15,6% do tempo de parede**, a **1,37 ms por chunk** (na medição 2 o
>   custo médio era 0,04 ms porque quase tudo era slot VAZIO). Com `meshPorFrame` 8, um frame
>   que mesha até o teto gasta ~11 ms só nisso — é a explicação direta dos 46 frames >50 ms.
> - long tasks 158 (38,9 s) em 96 s de sessão; na gravação de 10 s, 45 long tasks (2,8 s).
>   Ou seja: com mundo E chegando, o hitch é REGIME, não episódio.
> - **Conclusão pra política:** o item (1) "mesher em Web Worker" agora tem número próprio —
>   15,6% do tempo de parede na main thread. Continua valendo medir no PC do lab antes de
>   investir, mas a ordem (worker → greedy → teto de raio) está confirmada pelos dados.
>
> **MEDIÇÃO 4 — 2026-07-26 23:18–23:19**, quatro snapshots da MESMA sessão (35 s → 98 s),
> mundo E, DEPOIS da varredura de tocha corrigida. Como os contadores são acumulados, o que
> vale são os deltas:
> | Δ | remesh | tempo em mesh | long task | custo/chunk |
> |---|---|---|---|---|
> | 24 s | +3 688 | +4,6 s (**19%**) | +3,3 s (14%) | 1,25 ms |
> | 12 s | +2 048 | +3,5 s (**29%**) | +3,8 s (31%) | 1,71 ms |
> | 27 s | +3 304 | +4,7 s (**18%**) | +4,0 s (15%) | 1,43 ms |
> - **A trava fixa sumiu:** `longTasksMsTotal` agora ESCALA com a sessão (8,4 s @35 s →
>   19,5 s @98 s) em vez de dar ~38 s sempre. `jitterMs` caiu de ~1 750 pra ~320 (a varredura
>   também entupia a medição de rede, que roda na main thread). `repedidas 0` nos quatro.
> - **O que sobrou é 100% mesh de terreno chegando.** Correlação limpa entre taxa de streaming
>   e frame ruim, na mesma sessão:
> | streaming | frames >50 ms em 10 s | p95 da gravação |
> |---|---|---|
> | 106 B/s (parado) | 7 | **16,8 ms** |
> | 263 kB/s | 9 | 43 ms |
> | 558 kB/s | 33–50 | 56–82 ms |
> | 820 kB/s | 47 | 73 ms |
> - **Parado, o jogo é 60 FPS travado** (p95 16,8 ms, 1 800 draw calls, 500 k triângulos).
>   Ou seja: **não há problema de RENDER** — GPU e draw calls dão conta. O custo é montar
>   malha na main thread enquanto o terreno chega.
> - **Ordem revisada pelos dados:** (1) **mesher em Web Worker** — tira 18–29% do tempo de
>   parede da main thread, é o item que existe; (1b) barato antes disso: trocar o orçamento do
>   `processarFila` de CONTAGEM (`meshPorFrame` 8) pra TEMPO (~6 ms/frame) — o custo por chunk
>   varia 0,1–3 ms, então 8 chunks tanto pode custar 1 ms quanto 24 ms, e é isso que produz os
>   frames de 50–100 ms; (2) greedy meshing desceu de prioridade (o steady state já é 60 FPS);
>   (3) teto de `raioRender` em máquina fraca. **Continua faltando o número do PC do lab.**
> - ✅ **(1b) FEITO E MEDIDO em 2026-07-26**: `meshMsPorFrame` (1–16 ms, padrão 6) no lugar de
>   `meshPorFrame`; teto duro de 64 chunks; garante ≥1 chunk por frame.
>
> **MEDIÇÃO 5 — 2026-07-26 23:51**, dois perfis, mundo E, **voando, raio 12** (agora o perfil
> DIZ isso: `config.raioRender 12`, `movimento.estado "voando"`, 8–9,6 blocos/s, **125
> colunas novas na janela de 10 s nos dois** = mesma carga de antes, agora comprovada e não
> inferida):
> | | contagem (8 chunks) | **orçamento (6 ms)** |
> |---|---|---|
> | p95 da gravação | 43–82 ms | **18,7 / 20,4 ms** |
> | p99 | 55–96 ms | **20,1 / 21,8 ms** |
> | pior frame | 63–107 ms | **22,3 / 33,8 ms** |
> | frames >50 ms em 10 s | 9–50 | **0 / 0** |
> | long tasks na gravação | 9–50 | **0 / 0** |
> | FPS na gravação | 41–53 | **57 / 60** |
> | long tasks na SESSÃO | 128–299 | **2 (896 ms)** |
> | `fila` (preço combinado) | 0 | **84 / 189** |
> - **O trabalho é o mesmo, a distribuição é que mudou:** remesh seguiu em 16–19% do tempo de
>   parede (9,1 s/56 s e 13,5 s/69 s). O que sumiu foi o PICO. `ultimoLote` 2–3 chunks por
>   frame mostra que, nessa região (montanha, y≈100–130), 6 ms compram 2–3 chunks — a
>   contagem fixa de 8 pedia ~20 ms num frame de 16,7 ms.
> - Efeito colateral bom: o FPS MÉDIO subiu (43–47 → 55–60). Estourar o deadline do vsync
>   custava um frame inteiro a mais; espalhar o trabalho devolve isso.
> - **Sobrou 2 long tasks (896 ms) na sessão** — provavelmente o burst do join. Vale olhar
>   quando o `remeshCount` for separado por caminho.
> - **Consequência pra fila do worker:** com p95 ~19 ms voando no pior mundo, o mesher em
>   Worker deixa de ser urgente em PC de dev. O que ele ainda compraria: os 16–19% de main
>   thread (FPS travado em 60 em vez de 55) e uma fila que esvazia mais rápido. **Decisão:
>   medir no PC do LAB primeiro** — e lá o knob `meshMsPorFrame` já existe pra baixar.
>
> **PLANO DO MESHER EM WORKER (escopado 2026-07-26, NÃO iniciado).** O mesher é função pura
> (bytes → geometria), então cabe direto: pool de `navigator.hardwareConcurrency` (teto ~4);
> main thread manda CÓPIA do chunk + bordas dos 6 vizinhos (~10 kB contra ~1,4 ms de mesh) e
> recebe os typed arrays por transfer (zero-copy); na main sobra só criar `BufferGeometry` e
> subir pra GPU. O mundo CONTINUA na main thread (física e raycast leem `world`) —
> `SharedArrayBuffer` evitaria a cópia mas exige COOP/COEP, e a cópia é barata demais pra
> justificar isso na v1. **Fora de escopo:** render em `OffscreenCanvas` (reescrita grande e
> a GPU não é o gargalo), WASM e servidor multithread (lista de proibidas).
>
> **ACHADO QUE VALE MAIS QUE OS TRÊS (2026-07-26, playtest "página não está respondendo"):**
> os ~38 s de `longTasksMsTotal` que apareciam IGUAIS nos três perfis — sessões de 234 s,
> 168 s e 96 s — não eram regime de render: eram **uma só** varredura de tocha bloco a bloco
> (`TorchGlow.setFromWorld`, 1,887 bilhão de células num mundo E). **41,4 s → 2,9 ms** ao
> varrer por chunk (bug-523). Lição pra próxima leitura de perfil: número de long task que
> não escala com a duração da sessão é UMA trava fixa, não carga contínua — procure a
> varredura, não o gargalo.
- ✅ Lerp de jogadores remotos — GATILHO DISPAROU (2026-07-11, usuário reportou
  serrilhado): interpolação exponencial no render loop (bug-062). Taxa segue 10 Hz.
- gzip no save ← save > alguns MB.

**Proibidas (overengineering p/ 20 alunos LAN, mundo pequeno):**
- Client-side prediction/rollback (LAN ~1ms). ECS. Octree/SVO. InstancedMesh/BatchedMesh
  por bloco. WebGPURenderer. protobuf/msgpack. LOD/streaming/occlusion culling.
  Servidor multithread. WASM.
- Frustum culling: three.js já faz por objeto — nada a construir.

> ⚠️ **LEITURA DA LISTA (anotado em 2026-07-26, depois de uma confusão).** Esta lista é de
> 2026-07-10, escrita para o mundo P e 20 alunos em LAN. Duas ressalvas:
> 1. **"Servidor multithread" é o SERVIDOR (Node), não o cliente.** Motivo medido: o tick
>    com a turma toda custa `tickAvgMs` **0,08–3,3 ms** de um orçamento de 100 ms (10 tps).
>    Paralelizar isso é complexidade e corrida de dados por zero ganho.
>    **Web Worker no CLIENTE não está proibido** — está em "Adiadas" ("Meshing em Web
>    Worker ← hitch de frame"), e a BASELINE já foi desenhada pra isso ("mesher = função
>    pura → mover pra Worker depois fica barato"). O gatilho DISPAROU e depois recuou: com
>    o orçamento por tempo (MEDIÇÃO 5) o hitch sumiu em PC de dev.
> 2. **"streaming" na lista foi SUPERADO pela realidade:** o F2 (mundo E por colunas) foi
>    construído em 2026-07-2x porque o mundo ENORME entrou no escopo. A proibição valia pro
>    mundo P, onde o snapshot inteiro cabe numa mensagem. Item morto, mantido como registro.

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
5. ✅ Segundo cliente (Web Worker → Node+ws; 2 navegadores, mesmo mundo).
6. ✅ Chat + 1 comando (parser no servidor).

Rede de segurança (dev sem revisão): TS estrito; `/shared` sem deps; testes automáticos
em `/shared` desde o checkpoint 2 (gravidade testável sem abrir navegador); cada checkpoint jogável.

**MVP v1 "Aula persistente" — APROVADO pelo usuário (2026-07-11). Decisões travadas:**
- Servidor LAN: SÓ o host salva. Singleplayer: cada jogador salva no PRÓPRIO
  navegador (IndexedDB) + exportar/importar arquivo .ljw (= distribuição Drive).
- Identidade: nome + PIN 4 dígitos por mundo; `/resetpin` do professor.
- Código de professor definido na CRIAÇÃO do mundo; singleplayer = professor automático.
- Menu principal pedido pelo usuário: singleplayer, multiplayer, configurações
  (teclas, som, gráficos). Config v1 = sensibilidade do mouse + teclas + gráficos
  básicos; SOM é placeholder até áudio existir (avisar na tela).

**Checkpoints do MVP v1:**
1. ✅ **cp7 — save/load no host Node (2026-07-11).** `/shared/save.ts`: formato
   .ljw = u32 magic "LJS1" | u32 len | JSON meta (seed, spawn, roster) |
   snapshot LJW0 (auto-validado). JSON de meta cresce sem re-versionar (PIN/papel
   entram aí no cp9). Session: `opts.restore` (NADA recalculado — princípio
   bug-010), `toSave()` (online = pos atual; offline = roster), roster por nome →
   volta-onde-parou via msg `teleport` nova (enviada após snapshot; serve o /tp
   futuro). Host index.ts: LJ_PORT/LJ_SAVE por env, carrega no boot (corrompido →
   renomeia .corrompido-*, NUNCA sobrescreve evidência), autosave 30 s, SIGINT/
   SIGTERM gravam (escrita atômica tmp+rename). Cliente: handler de teleport
   (5 linhas). 67 testes (7 novos), typecheck 3/3, build ok. Smoke real 2 fases
   (sobe→edita→SIGINT→reabre): tijolo persiste, ana volta onde parou ✅.
   `.gitignore`: *.ljw. Worker (singleplayer) NÃO salva ainda — é o cp8.
   Playtest ✅ (2026-07-11: "editei, fechei, voltei e salvou") com 2 achados,
   ambos corrigidos: bug-061 (todos os clientes entravam como "jogador" → roster
   por nome fundia os dois; ponte = nome único por navegador via localStorage
   `lj-nome`, `?nome=` força; fix DEFINITIVO = PIN no cp9) e bug-062 (movimento
   remoto serrilhado → lerp exponencial, ver política de otimização).
2. ✅ **cp8 — menu principal (2026-07-11, playtest pendente).** Novos no cliente:
   `menu.ts` (telas início/mundos/rede/config; só ESCOLHE — main inicia),
   `worldStore.ts` (IndexedDB "logica-em-jogo"/"worlds": list/put/delete +
   exportar = download .ljw + importar valida com decodeSave), `settings.ts`
   (localStorage "lj-config", merge defensivo: sensibilidade, FOV, nitidez/
   pixelRatioCap, volume guardado-mas-inerte, rebind de 7 ações). Worker ganhou
   canal de HOST fora do protocolo de jogo: `{hostType:"init", save?, seed?}`
   antes do join e `save_request`→`save` (quem grava IndexedDB é o CLIENTE;
   worker só serializa). main.ts: boot → menu (ou `?server=` pula), conn virou
   let, `connect()` reaplica config, singleplayer autossalva 30 s + grava logo
   após snapshot (mundo nasce salvo), botão "salvar e voltar ao menu" no overlay
   (rede: só "voltar" — host salva). Nome do jogador editável no menu (lj-nome).
   Teclas do loop vêm de settings.keys. Typecheck 3/3, build ok, 67 testes,
   screenshots: menu renderiza; jogo via ?server intacto.
   **Playtest ✅ (2026-07-12, "top") com 4 pedidos, todos feitos:** rebind trava
   1 captura por vez (bug-075); F3 mostra pos + bloco; move REATIVO no cliente
   (parado = heartbeat 1×/2 s, mudou = 10 Hz — 20 alunos parados: ~200 msg/s →
   ~10); presença no join (bug-076: servidor manda player_moved do estado de
   cada online pro novo, pós-snapshot, e anuncia o novo — sem isto jogador
   parado era invisível pro recém-chegado, e o heartbeat agravaria). 68 testes,
   smoke de presença contra servidor real ✅.
   **+ Orientação persistida (2026-07-12, pedido do usuário):** roster/SavedPlayer
   ganharam yaw/pitch; `teleport` carrega orientação e o cliente aponta a câmera
   (input.yaw/pitch) — volta olhando pra onde olhava. Saves ANTIGOS continuam
   válidos (campo faltando → 0; testado). Playtest do usuário ✅ ("funcionou").
   **cp8 FECHADO.**
3. ✅ **cp9 — PIN + papel de professor (2026-07-12, FECHADO — playtest do
   usuário ✅ "tudo rodou").** PIN e código de professor em **TEXTO PURO** no
   save (decisão do usuário: sem dado sensível, sem hash — a pendência de
   crypto.subtle/pré-hash morreu junto; `/shared/auth.ts` = isValidPin +
   constantes de rate-limit). Protocolo: join ganha `pin`/`codigo`
   opcionais; msg `join_denied` (motivo) — recusa não manda MAIS NADA.
   Session: mapa `identity` (pin/papel por nome) SEPARADO do roster
   (posição); ordem do join estrito: nome-já-online (antes do PIN — fecha
   bug-061 de vez e não vaza acerto) → lockout (5 erros no nome → 30 s;
   código errado tem contador GLOBAL próprio) → PIN 4 dígitos → código de
   professor (errado NEGA — professor precisa saber que errou); 1ª entrada
   registra o PIN; papel persiste. `/bloco` e `/resetpin nome` só professor
   (resposta explica); welcome anuncia comandos só pra professor.
   `singleplayer: true` (worker) = sem PIN, professor automático, e papel/PIN
   NÃO persistem (mundo single exportado pra LAN não dá professor de graça);
   identity restaurada do save sobrevive mesmo em singleplayer (LAN→single→LAN
   não perde PINs da turma). Save: pin/papel/codigo no JSON de meta (save
   antigo segue válido). Host Node: LJ_CODIGO define/troca o código; sem env
   usa o do save; mundo novo gera 6 chars — e IMPRIME no console em TODO
   boot (recuperação grátis, texto puro permite). Cliente: campos PIN
   (numeric, nunca salvo — PC de lab é compartilhado) e código na tela rede;
   `?pin=`/`?codigo=` no boot via `?server=`; join_denied → alert + menu
   limpo. 82 testes (14 novos), typecheck 3/3, build ok. Smoke real 2 fases
   (registro/recusas/gating/resetpin → reboot: PIN e papel persistem)
   12/12 ✅. Screenshot headless: join com PIN renderiza mundo + welcome
   de aluno.
4. **cp10 — ADIADO (2026-07-12):** validação de física do move no servidor.
   Playtest do MVP v1 não apontou necessidade; retomar só com gatilho (trapaça
   real em aula ou física divergindo entre cliente e servidor).

**Critérios de aceitação do MVP v1:**
1. Fechar o host (Ctrl+C ou autosave), reabrir → mundo E posições intactos. ✅ (cp7)
2. Menu: criar mundo single, jogar, fechar aba, voltar → continua do save local. ✅ (cp8)
3. Exportar mundo single pra arquivo e importá-lo em outro navegador/host. ✅ (cp8; smoke)
4. Aluno não entra com nome alheio sem o PIN; professor reseta PIN; aluno não roda /bloco.
   ✅ (cp9; playtest do usuário 2026-07-12 ✅).

**→ MVP v1 FECHADO (2026-07-12): os 4 critérios atendidos e jogados.**

**MVP v2 "Cenários/Autoria" — entrevista de escopo (2026-07-12). Decisões travadas:**
- Cenário = mundo + objetivos + texto por objetivo, TUDO no MESMO .ljw
  (meta JSON cresce sem re-versionar — desenho do cp7).
- Modo de progressão POR CENÁRIO, autor escolhe: sequencial (fase a fase)
  OU lista livre (qualquer ordem).
- Tipos de objetivo v2 (TODOS aprovados; mesma engrenagem das rules — checar
  estado do mundo contra padrão): (a) construir padrão em região (gabarito),
  (b) chegar em local (região-alvo), (c) limpar região (= (a) com padrão ar).
- Autoria: comandos de chat PRIMEIRO (usáveis antes do painel existir),
  painel HTML depois; marcar região com cliques (varinha do professor) +
  painel pra texto/ordem.
- Gabarito WYSIWYG: professor constrói o exemplo no mundo, marca a região,
  jogo "fotografa" os blocos. Escolha POR OBJETIVO: manter modelo visível
  pro aluno copiar OU apagar.
- Progresso por MUNDO e por GRUPO (ambos). Sistema de grupos NOVO:
  professor cria grupos por comando `{quantidade por grupo}`; aluno entra
  por comando OU painel; painel do aluno só abre DEPOIS do professor criar
  grupos com sucesso. Singleplayer = grupo de 1 implícito.
- HUD do aluno: objetivo ativo + texto + contador ao vivo (ex. 12/20
  corretos); completou → mensagem de chat do servidor + próximo objetivo.
  Gatilho de som via events.ts (já existe).
- Grupos (2ª rodada, 2026-07-12): `/grupo criar` AUTO-DISTRIBUI todos os
  online (round-robin) e NOTIFICA cada aluno; entrar/trocar por comando ou
  painel; aluno sem grupo NÃO participa (HUD/chat avisa — professor vê quem
  ficou de fora); mundo SEM grupos criados = modo turma-toda-junta (grupos
  são opcionais); grupo PERSISTE no save (projetos de várias aulas);
  `/grupo criar` de novo = reseta. Parâmetro (decidido 2026-07-12): as DUAS
  sintaxes — `/grupo criar 5` = 5 grupos; `/grupo criar 5 alunos` = grupos
  de 5 alunos.
- Construir por grupo: 1 gabarito + 1 área de trabalho POR GRUPO (grupo
  completa quando a SUA área bate com o gabarito). Marcação manual (varinha)
  + comando/painel de CARIMBO: dita tamanho da área e espaçamento em blocos
  entre áreas, replica N vezes.
- Mundo modelo "cabines": plano; cabines no canto do chunk com o lado aberto
  voltado pro centro do chunk; cabine do professor guarda a sequência-gabarito,
  alunos replicam nas cabines dos grupos.
- "Chegar em local": conclusão CONFIGURÁVEL POR OBJETIVO — todos os membros
  do grupo na região OU basta um (depende da idade da turma).
- Mundos predefinidos: SIM no v2 (pedido do usuário) — preset "plano" na
  criação de mundo + mundo-modelo de cabines gerado com a ferramenta de
  carimbo.

**Checkpoints do MVP v2 (plano APROVADO 2026-07-12):**
1. ✅ **cp11 — varinha + regiões nomeadas (2026-07-12, playtest do usuário ✅
   "testei tudo" — inclui áudio de UI). cp11 FECHADO.**
   Novo em `/shared`: `regions.ts` (NamedRegion min/max inclusivo,
   regionFromCorners normaliza cantos, regionContains/regionDims,
   parseNamedRegion defensivo — reusado por protocolo E save; MAX_REGIONS=64).
   Protocolo: `wand_mark {corner:1|2,x,y,z}` client→server; `regions` (lista
   COMPLETA) server→SÓ professores (join + após criar/apagar — o que o aluno
   vê é decisão do objetivo no cp12); `spawn` ganhou `papel?` opcional
   (cliente habilita UI de professor; host antigo compatível). Session:
   cantos pendentes por cliente (rascunho, morre no disconnect/criar),
   `/regiao criar nome · apagar nome · lista` (só professor), regiões no
   meta do save via toSave/restore. Cliente: `regions.ts` (wireframes HSL +
   2 marcas de canto amarelo/ciano), tecla R (rebindável, "varinha") alterna
   modo varinha — clique esq/dir marca canto 1/2 na célula MIRADA, hotbar
   vira hint; welcome do professor anuncia /regiao. 95 testes (8 novos em
   regions.test.ts: puras + protocolo + sessão + persistência), typecheck
   3/3, build ok. Screenshot headless: professor via ?server vê wireframe
   da região do save ✅.
   **+ Áudio de UI (pedido do usuário, mesmo dia):** `client/audio.ts` —
   WebAudio sintetizado (zero assets, regra do projeto): click/back/confirm
   nos botões do menu (delegação), notify no chat recebido, denied no
   join_denied; volume das configurações agora FUNCIONA (slider ativo,
   amostra ao soltar); AudioContext só nasce em gesto (autoplay policy) —
   mensagens de rede só tocam se o contexto já existe. Playtest PENDENTE.
2. ✅ **cp12 — objetivos + detecção + HUD (2026-07-12, playtest do usuário ✅
   "tudo testado e funcionando"). cp12 FECHADO.**
   **+ Polimento de UI pós-playtest (2026-07-12, pedidos do usuário, playtest
   PENDENTE):** (a) ZERO popups nativos — prompt/confirm/alert viraram UI
   inline (criar mundo = input+checkbox plano na tela de mundos; apagar = 2
   cliques com desarme em 3 s; erros de import/endereço/PIN = `.menu-erro`
   inline; join_denied atravessa o reload via sessionStorage "lj-erro" e vira
   banner no menu — bônus: alert não trava mais screenshot headless/bug-093);
   (b) mira invisível sem pointer lock (updateOverlay também controla
   #crosshair); (c) menu Esc DE VERDADE: overlay virou painel .menu-screen
   com "voltar ao jogo" (re-lock), "configurações" (MESMO buildConfigScreen
   do menu principal, exportado com parâmetro body+onChanged — aplica AO
   VIVO: sensibilidade/FOV/nitidez/volume/teclas; Input.rebind() move
   atalhos chat/HUD/varinha na hora) e "salvar e voltar ao menu". Screenshot
   headless do menu Esc ✅ (sem mira no centro).
   Novo em `/shared`: `scenario.ts` — Objective (id/kind/texto/min-max CÓPIA
   da região + gabarito), snapshotRegion/matchRegion (ordem canônica y→z→x;
   corretos/alvo/extras separados), countSolid, parsers defensivos
   (parseScenarioMeta pro save, parseObjectiveState pro fio). DECISÃO DE
   DESIGN: construir tem região MODELO (fotografada no add) ≠ região ALVO
   (detectada) — mesma região = fluxo "apagar depois" (senão nasce completo;
   o comando RECUSA alvo que já bate). Sessão: `/objetivo add construir
   modelo alvo texto…` / `add chegar|limpar regiao texto…` / lista / remover
   / `modo sequencial|livre` / resetar (conclusão NUNCA desfaz; reset exige
   ação nova); detecção pela REGRA DE OURO: applyBlock marca objetivosDirty
   → tick recheca (areia caindo no alvo conta); chegar = move pisou na
   região; sequencial só ativa o primeiro incompleto (pisar no futuro não
   vale). Broadcast `objectives` pra TODOS (dedup por JSON; anúncio de
   conclusão no chat SEMPRE depois do estado — som certo no cliente).
   `/regiao encher nome id` (autoria: id 0 limpa; não empareda jogador;
   teto 4096). Preset "plano" (`generateFlatWorld`: bedrock/terra/grama):
   confirm() na criação de mundo, `?flat` no init do worker, LJ_PLANO=1 no
   host Node. Cenário persiste no meta .ljw (save antigo válido). Cliente:
   `objectivesUi.ts` (painel canto sup. direito: ativos + contador ao vivo
   + "cenário completo"), caixas VERDES nos alvos ativos (aluno vê o alvo;
   RegionRenderer ganhou cor fixa), som de conquista (confirm) suprime o
   ping de chat por 800 ms. 110 testes (14 novos), typecheck 3/3, build ok,
   screenshot e2e visão do aluno ✅ (mundo plano + painel 0/4 + caixa verde
   + modelo de lãs).
3. ✅ **cp13 — grupos + progresso por grupo (2026-07-12, playtest do usuário
   ✅ "testei tudo, funciona"). cp13 FECHADO.**
   Novo em `/shared`: `groups.ts` (GroupDef, parseGroups, MAX_GRUPOS=20).
   `/grupo criar 5` = 5 grupos; `/grupo criar 5 alunos` = grupos de 5
   (só professor; RE-CRIAR zera composição E progresso por grupo);
   auto-distribui alunos online em round-robin (professor FORA) + notifica
   cada um; `/grupo entrar n · sair · lista` (todos); aluno que chega depois
   cai no MENOR grupo; grupo persiste no save (meta `grupos`); msg `group`
   (pessoal: join + mudanças). Progresso: `completosGrupo` (chaves
   `obj:grupo`, persiste em cenario.completosGrupos); objetivo COMPARTILHADO
   concluído vale pra todos os grupos; chegar em modo grupos é SEMPRE por
   grupo (sem grupo NÃO pontua); sequencial anda POR GRUPO (ritmos
   diferentes — pisar em objetivo futuro não vale). Objetivo per-grupo:
   `alvos: Box[]` (área por grupo) — `/objetivo add` resolve nome exato =
   compartilhado, `nome-1…N` = per-grupo; construir valida dims/instant-
   complete POR área; min/max do construir per-grupo = caixa do MODELO
   (referência visual). `/regiao carimbar modelo prefixo espacamento [z]`:
   replica a região modelo (BLOCOS inclusos — cabines!) 1× por grupo ao
   longo do eixo e nomeia prefixo-1…N (valida bounds ANTES de mudar
   qualquer bloco). `/objetivo add chegar regiao [todos|um] texto` — todos =
   grupo inteiro online dentro ao mesmo tempo. `objectives` ganhou
   `porGrupo[]` (mesma msg pra todos; cliente escolhe a própria linha).
   Cliente: HUD do aluno = progresso DO SEU grupo + "seu grupo: n"; aluno
   sem grupo = aviso; professor = resumo por grupo (`g1 2/4 · g2 ✓`);
   caixas verdes = alvo do MEU grupo (+ modelo no construir; professor vê
   todas); trocar de grupo re-sincroniza sem tocar som. 120 testes (10
   novos), typecheck 3/3, build ok, screenshots professor+aluno ✅.
   **+ Config em CATEGORIAS (pedido do usuário): controles (sensibilidade +
   teclas) · som (volume) · gráficos (FOV + nitidez), mesma tela no menu
   principal e no Esc.**
4. ✅ **cp14 — painéis HTML + mundo modelo (2026-07-13, playtest do usuário
   ✅ "testado". cp14 FECHADO — MVP v2 COMPLETO).** Desenho central:
   painel = AÇÚCAR sobre comandos de chat —
   cada botão compõe /objetivo|/regiao|/grupo e manda como msg `chat`;
   validação segue 100% no servidor, ZERO protocolo novo pra ações; estado
   volta pelos broadcasts. Novo em `/shared`: msg `groups` (composição
   completa pra TODOS — join manda direto pro novo, mudanças broadcast);
   `/objetivo texto id novo…` e `/objetivo mover id pos` (ordem re-ativa o
   sequencial); `WorldPreset` normal|plano|cabines + `generateCabinsWorld`
   (1 cabine de tábuas POR CHUNK no canto, 5×5, paredes 2 alto, lado +x
   aberto pro centro do chunk, sem teto; spawn desloca +8 pro meio do
   chunk); SessionOptions.preset (vence flat, que virou alias). Hosts:
   worker init aceita `preset`; Node LJ_PRESET=plano|cabines (LJ_PLANO=1
   ainda vale). Cliente: `panels.ts` (AuthorPanel professor: modo, lista de
   objetivos com ↑↓/editar texto/remover armado, criar objetivo com selects
   de região — inclui opção per-grupo prefixo-1…N, regiões com criar/apagar/
   encher/carimbar, grupos criar N/de N; GroupPanel aluno: lista com
   membros, entrar/sair; rascunho sobrevive re-render, re-render adia com
   input focado, Esc fecha); tecla P rebindável ("painel"); `blocksUi.ts`
   (PLACEABLE compartilhado hotbar+painel); menu de criação com SELECT de
   tipo de mundo (pedido do usuário no meio da sessão); aviso de aluno sem
   grupo aponta a tecla do painel; `?painel` abre no boot (headless).
   129 testes (9 novos em cp14.test.ts), typecheck 3/3, build ok. Smoke
   real 10/10 (cabines+spawn, groups broadcast, trocar grupo, texto/mover).
   Restore noutro host 8/8 = critério 4 verificado (papel/regiões/ordem/
   texto/grupos/cabines intactos). Screenshots ✅ (painel autoria + painel
   grupo, cabines no fundo). bug-151 (TDZ activePanel) corrigido e logado.

**Critérios de aceitação do MVP v2:**
1. Professor cria cenário inteiro DENTRO do jogo e ele persiste no .ljw.
   ✅ (cp12/cp13, playtests do usuário; cp14 soma o painel)
2. Aluno vê objetivo/progresso no HUD, completa, sequência avança. ✅ (cp12)
3. Turma em grupos: auto-distribuição funciona, cada grupo progride na própria área. ✅ (cp13)
4. Mundo-modelo cabines exportado abre em outro host com cenário intacto.
   ✅ (restore-check 8/8 + playtest do usuário 2026-07-13).

**→ MVP v2 FECHADO (2026-07-13): os 4 critérios atendidos e jogados.**

**Checkpoints do polimento "blocos + mecânica" (2026-07-13, TODOS codados —
playtest do usuário pendente):**
1. **cp15 — corrida + agachar.** `/shared/physics.ts`: MoveInput ganhou
   `sprint?`/`sneak?`; PLAYER: sprintFactor 1.6, sneakFactor 0.3,
   sneakEyeHeight 1.32. Edge-guard estilo Minecraft: agachado NO CHÃO,
   passo horizontal que tiraria o suporte é desfeito POR EIXO (hasSupport
   checa bloco sob o footprint; na diagonal o eixo seguro desliza; pode se
   debruçar até |0.8| do centro — footprint ainda toca). Guard só com
   onGround (no ar não trava). Cliente: Ctrl segurado OU duplo-toque no
   andar (<300 ms, latch até soltar); Shift agacha; agachar VENCE sprint;
   sprint exige forward>0. Teclas `correr`/`agachar` rebindáveis (entram
   sozinhas no menu — itera KEY_ACTION_LABEL). FOV +10% correndo e olho
   desce agachado, transições exponenciais (kCam = 1-exp(-dt·20)).
   5 testes novos de física.
2. **cp16 — inventário + hotbar de slots.** Hotbar virou 9 SLOTS
   configuráveis (persistem em localStorage `lj-hotbar`, parse defensivo
   por slot); 1–9 escolhe slot, scroll cicla os 9; HUD mostra slots com
   ÍCONES + nome do bloco selecionado. Tecla E (rebindável `inventario`)
   abre `client/inventory.ts`: grade de TODOS os colocáveis (ícone+nome) +
   faixa da hotbar; clique no bloco → slot selecionado; clique no slot →
   seleciona; Esc/E fecha e re-trava o mouse; exclusão mútua com painel P;
   `?inv` abre no boot (headless). Ícones: `client/blockIcons.ts` recorta o
   tile LATERAL do próprio atlas (blockIconTile novo no mesher) → data URL.
3. **cp17 — 8 opacos novos (IDs 19–26, append):** arenito (estratos),
   pedra-lavrada (fiadas 8×4), neve, obsidiana (pontinhos roxos) + lãs
   rosa/ciano/cinza/marrom (12 lãs no total — sequências mais ricas).
   Atlas tiles 20–27; cobertura automática pelo teste "todo colocável".
4. **cp18 — vidro + folhas (grupo B, IDs 27–28, tiles 28–29).** Abordagem
   CUTOUT: alphaTest 0.5 no material único — pixel opaco ou descartado,
   SEM blending/sorting/draw call extra. `isTransparentBlock()` em blocks;
   regra do mesher: face aparece se vizinho=ar OU opaco→transparente;
   entre transparentes NUNCA (coplanar = z-fight). Transparência é só
   visual (física/raycast tratam como sólido). Vidro = moldura+brilhos
   (resto alpha 0); folhas = verde com 22% de furos. 2 testes de mesher.
   Smoke real 21/21 via /bloco (servidor aceita ids novos) + screenshot:
   lã vermelha visível ATRAVÉS da parede de vidro.

**Critérios de aceitação do polimento — TODOS ✅ (playtest do usuário 2026-07-13):**
1. ✅ Correr com Ctrl E com duplo-W; agachado na beirada não cai; FOV/câmera
   respondem. 2. ✅ E abre inventário, monta hotbar própria, persiste ao
   reabrir o navegador. 3. ✅ Blocos novos aparecem no inventário e no mundo
   com textura certa ("todos top" — cobre o playtest pendente do grupo A).
   4. ✅ Vidro/folhas: vê-se através, sem faces piscando.

**→ POLIMENTO FECHADO (2026-07-13).** Achados do playtest, todos corrigidos e
re-playtestados ✅:
- **bug-168 (cp15):** correr dava velocidade total no ar. `PlayerState.sprinting`
  novo = corrida ENGATADA: só liga com os pés no chão + tecla de correr.
  **2ª rodada de playtest:** a tecla NÃO precisa ficar segurada — engatada, a
  corrida vale enquanto o "frente" estiver apertado (semântica do Minecraft) e
  atravessa pulo/queda; desengata ao soltar o "frente" ou agachar. FOV do
  cliente segue `player.sprinting`, não a tecla. 2 testes.
- **bug-167 (cp18):** face da folha colada no vidro sumia. Regra do mesher agora
  olha SÓ o vizinho: aparece se vizinho é ar OU transparente de OUTRO id; mesmo
  id funde (vidraça contínua); vizinho opaco esconde. Coplanares opostas não
  brigam (material FrontSide → a de trás é backface). Teste atualizado.
- **bug-169 (UI):** config tinha DOIS "voltar". `buildConfigScreen(body, onChanged?,
  onBack?)` virou dona do único botão (raiz → menu anterior; categoria → raiz);
  backs estáticos saíram de #menu-config e #overlay-config. Demais menus revisados
  (mundos/rede/pausa: um voltar cada).
- **Pedido novo (feito):** botão do MEIO do mouse copia o bloco mirado pro slot
  selecionado (só colocáveis — bedrock não vai pra mão); hint do Esc atualizado.
136 testes ✅, typecheck 3/3 ✅, build ✅.

- **CENÁRIOS PEDAGÓGICOS — 3 aulas (2026-07-14, PLAYTEST DO USUÁRIO PENDENTE).**
  Decisões da abertura: piloto no **6º–9º**; 1º cenário = sequência de lãs nas
  cabines (confirmado); produção por **script gerador**, não à mão no jogo.
  Novo em `/server`: `src/cenarios/gerar.ts` — digita os MESMOS comandos de chat
  do professor (`/grupo criar`, `/regiao criar`, `/bloco`, `/objetivo add
  construir`) contra a GameSession real e grava o .ljw. Não existe caminho de
  autoria privado: cenário que não sai daí também não sai da mão do professor.
  `src/cenarios/verificar.ts` — conferência EMBUTIDA na geração: abre o .ljw num
  servidor NOVO, professor entra com o código, 2 alunos entram e são
  auto-distribuídos, o grupo 1 monta o gabarito e o objetivo TEM que fechar
  (+ guarda de geometria: faixa no chão, fora da cabine, dentro do chunk).
  Cenário que não fecha NÃO vira arquivo (exit 1) — testado negativamente.
  Mundo de cada aula: cabines, dims 6×6×4; cabine do professor no chunk central
  (spawn), 1 cabine por grupo na fileira à frente; faixa de blocos no chão a 4
  passos da porta. As 3 aulas (6º–9º, 5 grupos por padrão):
  1. `aula1-sequencia.ljw` — "Continue a regra" (padrão/generalização): faixa de
     12, os 4 primeiros dados (vermelho-azul-azul-vermelho) → contador nasce 4/12.
  2. `aula2-binario.ljw` — "Escreva 45 em binário" (abstração/representação):
     8 blocos, branco=0/preto=1, faixa vazia → 0/8.
  3. `aula3-depurar.ljw` — "Ache os 2 erros" (depuração): faixa já montada com 2
     células erradas → 10/12; o contador diz QUANTOS, não QUAIS.
  Gabarito é fotografado e APAGADO (aluno infere a regra); flag `--revelar` deixa
  o modelo à vista (vira cópia — turmas mais novas). `.ljw` NÃO vai pro git
  (577 kB, regenerável): versiona-se o gerador + `cenarios/README.md` (roteiro de
  aula: gerar, hospedar, distribuir, gabarito e condução de cada aula, o que
  observar). O .ljw sai com `roster: []` — não viaja com PIN/papel do autor.
  **bug-172 (bloqueava o piloto, corrigido):** Vite dev só escutava em localhost
  → aluno da LAN não abria o cliente; `host: true` em `client/vite.config.ts`.
  bug-173 (cwd do workspace) e bug-174 (comando gera VÁRIAS falas do servidor)
  também logados. 137 testes ✅, typecheck 3/3 ✅.

- **INFRA DO PILOTO — servidor serve cliente + mensagens + cp19 (2026-07-15,
  PLAYTEST DO USUÁRIO PENDENTE).** Três frentes pedidas pelo usuário, nesta ordem:
  1. **Servidor serve o cliente (mesma porta).** Novo `server/src/static.ts`:
     `servirCliente(req,res)` entrega `client/dist` na MESMA porta do WebSocket —
     o aluno abre `http://ip-do-professor:8080` no navegador e joga, sem servidor
     de página à parte e sem digitar endereço de WebSocket. HTTP+WS convivem via
     `createServer(servirCliente)` + `new WebSocketServer({ server: http })`.
     Guarda de path traversal (caminho resolvido tem que ser DIST ou começar com
     DIST+sep; rota desconhecida → index.html; no-store no index). Página 503 de
     aviso se o cliente não foi buildado. Boot imprime o IP da LAN
     (`enderecoDaRede`) e avisa se falta `npm run build`. Motivo de subir tudo na
     mesma porta: HTTPS bloqueia `ws://` (mixed content) e o servidor da escola
     não tem certificado pra `wss://` — mesma origem resolve.
  2. **Varredura das mensagens de erro (bug-176).** 66+ mensagens de
     `shared/src/session.ts` reescritas de log-de-dev (minúsculo, telegráfico)
     pra frase culta e clara: diz O QUE aconteceu + O QUE fazer. Ex.: "PIN errado"
     → "PIN incorreto para este nome."; "só o professor pode usar /bloco" →
     "Somente o professor pode usar /bloco." ~16 asserts de teste seguiram os
     textos novos (só string, zero mudança de comportamento).
  3. **cp19 — trocar de aula SEM derrubar a turma.** Novo `server/src/mundos.ts`:
     `/mundo lista · atual · carregar nome` (SÓ professor; intercepta no HOST, não
     na sessão — trocar de aula é ler arquivo, e a GameSession não tem filesystem).
     Aceita só NOME de arquivo, nunca caminho (comando chega pela rede da escola).
     A troca: salva o mundo atual → decodifica o novo (corrompido → aborta, nada
     muda) → `session.jogadoresConectados()` → nova GameSession → `adotar()` cada
     cliente (sem PIN/reconexão; professor segue professor; teleport obrigatório —
     coords do mundo velho podem cair na rocha). `session.ts`: join refatorado —
     2ª metade virou `admitir(id,name,papel,migrado)` (reusada por join e adotar);
     `jogadoresConectados()` e `adotar()` novos. Cliente: `chunks.ts` `trocarMundo`
     (descarta TODA a geometria — mundo novo pode ter outro tamanho); `main.ts`
     `reloadWorld` (snapshot pós-jogo recarrega mundo, zera regiões/objetivos/
     grupos, respawn). Smoke real `server/src/cenarios/_smoke-mundo.mjs` 13/13 ✅.
  4. **cenarios/ = MODELO, aulas/ = cópia viva (integridade de dado).** Achado
     durante o cp19: hospedar `cenarios/aula1.ljw` direto fazia o autosave gravar
     roster/PINs/progresso DENTRO do arquivo distribuído — a próxima turma
     começaria com a aula da anterior resolvida. Novo em `server/src/paths.ts`:
     `mundoDeTrabalho(escolhido)` — se o mundo está em `cenarios/`, a cópia de
     trabalho vai pra `aulas/` (mesmo nome); a cópia viva vence o modelo (turma
     continua de onde parou); apagar em `aulas/` recomeça do zero. index.ts
     (boot) e mundos.ts (`/mundo carregar`) carregam do modelo só na 1ª vez e
     autossalvam SEMPRE em `aulas/`; modelo corrompido NÃO é renomeado (é
     distribuído — regenerar). Verificado: swap real deixou os 3 modelos
     byte-idênticos (md5 OK) e criou as cópias em `aulas/`. Gerador regerado com
     `roster: []` confirmado (boot: "0 jogador(es) no roster"). `_smoke-mundo.mjs`
     é smoke MANUAL (precisa do servidor no ar na 8080), não entra no `npm test`.

- **cp20 — BLOCOS LETRA/NÚMERO (2026-07-16, do backlog `ideias para fazer.txt`;
  legibilidade a confirmar no playtest).** 36 blocos-glifo: letras A–Z (ids
  29–54) + dígitos 0–9 (ids 55–64), cubos opacos pelo MESMO caminho das lãs
  (append de id + tile no atlas procedural, zero mesher/protocolo novo).
  `ATLAS.tilesPerRow` 8→16 (64→256 tiles — coube o glifo + folga). FONTE ÚNICA
  `GLYPH` em `shared/mesher.ts` (base=30, letras, dígitos) alimenta BLOCK_TILES,
  o atlas (`paintGlyph`: base creme p/ letra, azul-claro p/ número + a letra via
  `ctx.fillText` bold) e os nomes PT em `blocksUi.ts` — tudo por loop, sempre em
  sincronia. Pedagogia: soletrar palavras / escrever números (enriquece
  sequência e binário). typecheck 3/3, 143 testes (rede "todo colocável" do
  mesher cobre cada glifo como cubo cheio + guard de append), build ok, layout
  do atlas conferido em node (sem overflow, ícones certos, isPlaceable fecha em
  64). **Falta só olho humano na legibilidade do glifo 16px (playtest).**

- **cp21 — CICLO DIA/NOITE (2026-07-16, do backlog; render a confirmar no
  playtest).** SÓ visual, server-autoritativo (a hora não decide nada de jogo).
  Sessão guarda `horaDoDia` (0..24) + `cicloAtivo`; avança determinístico por
  tick (`DIA_SEGUNDOS=600` → dia de 10 min; NÃO usa relógio de parede, hosts
  andam iguais). Broadcast msg nova `time {hora,ciclo}` no join + 1×/s (junto do
  debug_stats). Comandos de professor `/hora dia|noite|amanhecer|entardecer|
  meio-dia|meia-noite|0-23` e `/ciclo ligar|desligar` (sem arg alterna). Cliente
  `daynight.ts`: `SkyCycle` interpola céu (`scene.background`), cor/intensidade
  do sol (arco leste→zênite→oeste) e luz ambiente entre keyframes por hora;
  guarda a última hora do servidor e avança localmente entre syncs (céu sem
  trancos). **NUNCA escurece 100%** (piso de ambiente — aluno constrói de noite).
  **CONFIG (2026-07-16, decisão do usuário):** mundo NOVO nasce em **DIA
  PERMANENTE, ciclo PARADO** (default `HORA_PADRAO=12` + `cicloAtivo=false` —
  o céu não muda durante a aula). **hora + ciclo PERSISTEM no save** (SaveMeta,
  cresce sem re-versionar): mundo de atividade grava ciclo OFF; **sobrevivência
  (futuro) grava a hora corrente → continua de onde parou** no reload. Os 3
  cenários foram REGENERADOS (`npm run cenarios`) com `/hora meio-dia` +
  `/ciclo desligar` explícitos no gerador (day-lock não depende do default —
  sobrevivência pode nascer com ciclo ON no futuro); .ljw conferido: hora=12
  ciclo=false. typecheck 3/3, 150 testes (+time no protocolo; +/hora //ciclo,
  default off e persistência na sessão; +hora/ciclo no save), build; smoke ws
  real: cenário abre em dia permanente travado, /hora exato, /ciclo congela e
  religa, hora avança só com ciclo ON ✅.

- **cp22 — /kicar (2026-07-16, do backlog).** Professor remove aluno por mau
  comportamento. Mora no HOST (`server/index.ts interceptarKicar`, padrão do
  /mundo) porque FECHAR socket é transporte, não estado do mundo. Resolve
  nome→id via `session.jogadoresConectados()` (case-insensitive; remove TODOS os
  homônimos, menos o próprio professor → não se auto-remove), manda msg nova
  `kicked {reason}` pro alvo e fecha o socket 150 ms depois (aviso sai antes),
  avisa a turma no chat. É EXPULSÃO, não banimento — o aluno pode reentrar com o
  PIN (ban list = trabalho futuro se o piloto pedir). Cliente trata `kicked` como
  join_denied (banner no menu, sem alert). smoke ws real 9/9
  (`_smoke-kicar.mjs`): kick, aviso, aluno barrado, nome inexistente, não
  auto-remove ✅.

- **CABINES → PLOT DEMARCADO + /regiao sortear (2026-07-16, pedido do usuário).**
  (1) Tirar as tábuas das cabines: `generateCabinsWorld` não faz mais paredes —
  desenha uma BORDA de pedra-lavrada (StoneBricks) rente ao chão no perímetro do
  footprint 5×5 de cada chunk. Delimita a área do grupo sem parede/teto. Preset
  key segue `"cabines"`; spawn ainda vai pro meio do chunk. `verificar.ts` agora
  confere o marcador. Label do menu virou "áreas demarcadas". As 3 aulas foram
  REGENERADAS (`npm run cenarios`) e passaram no `conferir` embutido.
  (2) `/regiao sortear nome id…` (novo, só professor): preenche a região
  sorteando entre os ids dados — o professor gera um gabarito ALEATÓRIO na hora,
  refotografa com `/objetivo add construir` e reinicia. typecheck 3/3, 152
  testes (+2 sortear), build ✓. **Gerar sequência nova ao vivo já era possível
  só com os comandos existentes** (remover objetivo → limpar area-N → montar na
  faixa modelo → `/objetivo add construir modelo area`); "sequência de
  sequências" = `/objetivo modo sequencial` + N objetivos (uma faixa por
  objetivo por grupo).

- **CONTROLES DE TOQUE (2026-07-16, TESTE EM TABLET REAL PENDENTE).** Tablet
  joga sem teclado/mouse. Novo `client/src/touch.ts`: `isTouchDevice()` =
  media query **`pointer: coarse`** (ponteiro PRIMÁRIO é o dedo; notebook com
  touchscreen fica FORA de propósito — o mouse continua mandando e o pointer
  lock não quebra; `?touch` na URL força, pra testar no desktop) e
  `TouchControls` (DOM+CSS injetados, self-contained): joystick esquerdo
  (8 direções + deadzone, sintetiza as MESMAS teclas de `settings.keys` via
  `input.setKey` — rebind vale), arrasto em área livre = olhar
  (`input.applyLook`, mesma conta e clamp do mousemove), botões quebrar/
  colocar/copiar (disparam os handlers de mouse existentes via
  `input.press(0|2|1)`), pular (segurar), menu (pausa) e blocos (inventário —
  fecha no "✕ fechar" que já existia). `input.ts`: flag `touch` +
  `get active()` (= locked OU touch); `lock()` vira no-op no toque — todos os
  `input.lock()` espalhados (fechar chat/painéis) ficam inofensivos. main.ts:
  loop de movimento/raycast/overlay/mira leem `input.active` (linha do
  pointerlockchange segue `locked`); `startPlay()` no "▶ voltar ao jogo"
  decide lock vs toque; botão menu do touch desliga o modo e mostra o overlay
  de pausa; hotbar TOCÁVEL (pointer-events auto + tap escolhe slot); UI de
  toque some sob chat/painéis/pausa (updateOverlay → `setShown`, que SOLTA
  teclas seguradas — sem andar fantasma). index.html: viewport sem zoom
  (maximum-scale=1, user-scalable=no, viewport-fit=cover) +
  `overscroll-behavior:none; touch-action:none` no body (mata pull-to-refresh;
  menus com overflow próprio seguem roláveis — touch-action não herda pra
  scroller interno). Desktop INTACTO (sem touch, `active === locked`).
  typecheck 3/3, 153 testes, build ✓; screenshots headless contra servidor
  real: com `?touch` = joystick/botões/mira/hotbar no mundo; sem = overlay
  normal, zero UI de toque.
  **PLAYTEST MOBILE ✅ (2026-07-16, celular na rede de casa via notebook
  Windows hospedando o main atual).** Rodada 2 (pedidos do playtest, FEITOS):
  (a) **tela cheia** — `solicitarTelaCheia()` em touch.ts: auto no startPlay
  (gesto do tap vale) + botão "⛶ tela cheia" no topo; tenta travar paisagem
  (`screen.orientation.lock`), falha em silêncio (iPhone); (b) **botão 💬
  chat** no topo — abre o campo (teclado virtual sobe no focus); Enter do
  teclado VIRTUAL agora envia (`e.key === "Enter"` fallback — Android nem
  sempre manda e.code) e tocar FORA do campo (canvas) fecha sem enviar
  (chat.close() virou público — no toque não existe Esc); (c) **hotbar fixa
  no pé do inventário** — `.inv-hotbar` position:sticky bottom, a grade rola
  e os 9 slots ficam visíveis (screenshot confere); (d) **`/say` no TERMINAL
  do host** — readline no stdin do server/index.ts: `/say mensagem` fala com
  a turma como "servidor" sem o professor estar dentro do jogo (modelo
  Minecraft); comando desconhecido lista os disponíveis; nohup/background =
  stdin fecha, inofensivo. Smoke ws real 3/3 (2 clientes recebem, lixo não
  vaza). typecheck 3/3, 153 testes, build ✓. **Resta validar no TABLET da
  escola (rede da escola — AP isolation).**

- **TRILHA SEQUENCIAL — auto-limpa + próxima sequência na MESMA faixa
  (2026-07-16, pedido do usuário).** No modo `sequencial`, quando um grupo
  conclui a sequência ativa, o servidor LIMPA a faixa dele e carrega
  automaticamente a próxima na MESMA área (`carregarProximaSequencia` repõe o
  baseline/semente do próximo objetivo ativo). Professor só cria os modelos; o
  aluno percorre as sequências em ordem sem ninguém limpar à mão. **Autoria:**
  `/objetivo modo sequencial` → (para cada etapa) construir o modelo numa região
  `modelo` e `/objetivo add construir modelo <alvo> <texto>`, reusando o MESMO
  `<alvo>` (`area` per-grupo ou uma região compartilhada) em todos → `/iniciar`.
  Cada etapa começa VAZIA por padrão (baseline = estado da faixa no `add`; semeie
  antes do `add` se quiser pista por etapa). `restaurarAreasBaseline` agora
  depende do modo (sequencial = só a faixa ativa; livre = todas). 100% servidor
  (cliente já trata block_changed + objectives). typecheck 3/3, 153 testes (+1).

---

## 📊 BACKLOG — PERFILADOR: O QUE AINDA FALTA (escopado 2026-07-26)

> Entregue nesta sessão: **fases** (carregando × jogando: frames, fps, % de render, travadas),
> **top 5 piores travadas** (ms + fase + segundo da sessão), **remesh por caminho**
> (fila/bloco/área com n e ms), **render × lógica** (`renderMsMedio`/`renderPct`), **contexto**
> (`jogador`, `config`, `gravacao.movimento`). O que ficou de fora, por valor/custo:
>
> 1. **Modo BENCHMARK (`?bench`)** — o mais valioso pro piloto. Teleporta pra coordenada fixa,
>    voa um trajeto fixo por 30 s com seed fixa e exporta sozinho. Sem isso, comparar o PC do
>    lab com o de dev depende de a pessoa voar igual — e não voa. **É o que falta pra ter o
>    número do lab que a política exige.**
> 2. **Histograma de frametime** (faixas 8/16/33/50/100+ ms) além dos percentis: mostra a FORMA
>    (bimodal = dois regimes; cauda longa = hitch raro). Percentil esconde isso.
> 3. **Tempo de carga por fase da tela** (conectando → mundo → malha → pronto): a §🕐 já mede
>    tudo isso na tela; falta só exportar no JSON. Vira "quanto o aluno espera" por máquina.
> 4. **Marcadores de evento na linha do tempo** (join, troca de aula, mudança de raio, morte):
>    hoje um pico não tem causa registrada — com marcador, o perfil vira narrativa.
> 5. **Células tocadas por tick pela regra** (água/areia) vindas do servidor no `debug_stats`:
>    liga o custo de `remesh(bloco)` à causa real.
> 6. **Tempo de GPU** via `EXT_disjoint_timer_query_webgl2` quando disponível — hoje todo o
>    perfil é CPU-side. Chrome limita, mas quando existe é o único jeito de separar "GPU cara"
>    de "CPU cara".
> 7. **Caracterização da máquina**: `hardwareConcurrency` e `deviceMemory` (uma linha cada) —
>    o perfil já traz GPU e RAM do JS heap, falta o resto pra comparar PCs do lab.

## 🕐 ~~BACKLOG~~ **FEITO** — TELA DE CARREGAMENTO (single + multiplayer)

> ✅ **IMPLEMENTADO na sessão 25 (2026-07-26)** em `client/src/loading.ts` — o que ficou de
> fora do esboço abaixo: bytes recebidos ÷ total estimado (não há total conhecido antes do
> mundo chegar), RTT/ping e nome do mundo/seed nas linhas (o hospedeiro já identifica), e a
> tela na TROCA DE AULA (`reloadWorld`) — esta virou backlog no STATUS. O texto abaixo segue
> como registro do escopo pedido; o que foi entregue está no ✅ do STATUS.
>
> Pedido do usuário em 2026-07-26. Vale pros DOIS caminhos de
> entrada: singleplayer (worker) e rede (Node+ws) — mesma tela, mesmo componente.

**Objetivo:** entre "apertei jogar" e "o mundo aparece", o jogador vê uma tela de
carregamento com números reais em vez de tela preta. Hoje o cliente só espera o
`world_snapshot` e cai direto no jogo; se o mundo for grande (streaming F2), o
aluno olha pra um canvas vazio sem saber se travou.

**Dados a mostrar (pedido explícito):**
- **Taxa de transferência em BITS/s** (bps → kbps → Mbps, converter de bytes×8).
  Fonte: `connection.ts` já contabiliza `bytesIn/bytesOut` (o HUD F3 usa em
  `main.ts:1369`) — expor uma amostragem por segundo pra tela de loading.
- **Chunks/colunas CARREGADAS** (aplicadas + meshadas) e **ainda em transferência**
  (pendentes do raio inicial). Fonte: `colunasCarregadas` + o raio de streaming em
  `startGame`; total esperado sai das dims do header do `world_snapshot`
  (`protocol.ts:591`) cruzadas com o raio.
- **Outros úteis:** fase corrente (conectando → autenticando → recebendo mundo →
  montando malha → pronto), bytes recebidos / total estimado, tempo decorrido,
  ETA grosseiro pela taxa, RTT/ping, nome do mundo + seed, tipo de host
  (worker local × servidor `ip:porta`).
- **Singleplayer:** transferência é instantânea (worker na mesma aba) — a fase que
  domina é geração + meshing. Mesmos widgets, rótulos honestos ("gerando mundo",
  "montando malha"); não fingir taxa de rede alta como se fosse mérito.

**Duas animações (desacopladas de propósito):**
1. **Canto da tela** — spinner/loop puramente decorativo (CSS `@keyframes`, sem
   depender de progresso). Serve de sinal de vida: se ele gira e o número não
   anda, o problema é a rede, não o navegador travado.
2. **Centro da tela** — progresso REAL (barra ou anel) = colunas prontas ÷ total
   do raio inicial. Nunca voltar atrás nem passar de 100%: se o total for
   reestimado, só clampa.

**Implementação (esboço):**
- Novo `client/src/loading.ts` — overlay próprio em cima do canvas, self-contained
  (DOM+CSS injetados, padrão do `touch.ts`), com API `abrir(fase) / atualizar(stats)
  / fechar()`.
- ⚠️ **Bloqueio conhecido (o usuário já apontou):** hoje `updateOverlay()`
  (`main.ts:206`) mostra o menu Esc SEMPRE que `!input.active` — e durante o
  carregamento o ponteiro não está travado, então o menu de pausa aparece por
  baixo/por cima da tela de loading. Suprimir o overlay enquanto `loading.ativo`
  (uma condição a mais em `updateOverlay`), e só liberar Esc quando o jogo começar.
- Fechar a tela quando o snapshot chegou **E** a primeira leva de chunks foi
  meshada (evita entrar num mundo com buracos), aí sim `startPlay()`/lock.
- Toque: a tela cobre a UI de toque; `setShown(false)` enquanto carrega (mesma
  regra de chat/painéis) pra não deixar joystick fantasma por baixo.
- ZERO protocolo novo se der: tudo sai de contadores que o cliente já tem. Só
  medir e mostrar.

---

## 🔁 BACKLOG — RECARREGAR COLUNA FALTANDO/CORROMPIDA (rede de segurança do streaming)

> Pedido do usuário em 2026-07-26. NÃO iniciado. Resolve de tabela o **bug-211**
> (aumentar o raio de render não traz chunk novo).

**Objetivo:** o cliente detecta sozinho coluna que DEVERIA estar carregada e não
está (ou chegou corrompida) e pede de volta. Hoje o streaming F2 é fire-and-forget:
se um lote se perder, decodificar falhar ou o servidor achar que já mandou, o
buraco fica lá pra sempre — só sair do raio e voltar conserta.

**Causa raiz do bug-211 (já rastreada, vale anotar antes de esquecer):**
`main.ts:542` manda `{type:"radius"}` UMA vez, logo depois do join. Mexer no
"raio de render" na config ao vivo (Esc → gráficos) só afeta a regra de DESCARTE
do cliente (`main.ts:1442`) — o servidor nunca sabe, `st.raio` continua o antigo
(`session.ts:603`) e o anel novo nunca entra no lote de `streamColunas`. Efeito
exato que o usuário descreveu: aumentar a distância **segura mais chunks
renderizados**, não carrega novos. (Diminuir funciona por acidente: os dois lados
descartam pela mesma regra.)

**Duas frentes, nesta ordem:**
1. **Fix direto (barato):** re-enviar `radius` sempre que `settings.raioRender`
   mudar — gancho no `onChanged` do `buildConfigScreen` (já aplica ao vivo) e no
   `connect()` (que já reaplica config). ~5 linhas.
2. **Rede de segurança (o pedido de verdade):** varredura periódica no cliente +
   pedido de re-envio.
   - **Detecção "não carregada":** a varredura de descarte já roda 1×/s
     (`main.ts:1439`, a cada 60 frames). Na mesma passada, percorrer o anel até
     `raioRender` e listar coluna que NÃO está em `colunasCarregadas`. Faltando
     há mais de N s (não no 1º tick — streaming é gradual, `colunasPorTick`) →
     pedir.
   - **Detecção "corrompida":** `decodeColunas` que joga exceção (tamanho/magic
     errado — `protocol.ts:731+`) marca a(s) coluna(s) do lote como suspeitas em
     vez de só logar; idem coluna aplicada cuja malha falhou no mesher.
   - **Protocolo:** msg nova cliente→servidor `pedir_coluna {cx,cz}` (ou lista).
     Servidor só faz `st.enviadas.delete(key)` (+ `gerarColuna` se preciso) — o
     `streamColunas` do tick seguinte reenvia sozinho, sem caminho de envio
     paralelo. Cliente descarta bytes+geometria da coluna antes de repedir
     (senão remesha por cima do lixo).
   - **Guardas obrigatórias:** dedup por coluna (1 pedido em voo), backoff
     exponencial (servidor lento ≠ convite pra flood), teto de pedidos/s por
     cliente NO SERVIDOR (comando chega pela rede da escola), e ignorar coluna
     fora de raio+folga.
   - **F3:** expor "colunas faltando / repedidas" junto de `colunasCarregadas`
     e da fila do mesher (já mostrados em `main.ts:1375`) — sem número, o
     playtest não distingue "buraco" de "ainda chegando".
- Vale igual pro singleplayer (worker É o servidor — mesmo caminho de código) e
  pro fluxo de troca de aula (`trocarMundo` zera `colunasCarregadas`).
- Casa com a **tela de carregamento** (§🕐): o contador de "em transferência"
  sai da MESMA varredura; fazer as duas juntas evita medir duas vezes.

---

## 🌬️ BACKLOG — VENTO + VIDA AMBIENTAL (pedido do usuário 2026-07-26, pós-playtest da água)

> Nasceu do playtest do refino de água: o usuário aprovou tudo ("worldgen novo com água,
> animação de textura e o render por nível com conexão de textura — ficou muito bom") e
> pediu para ANOTAR as evoluções a seguir. NÃO iniciado, nenhuma linha codada.

**Semente da ideia:** a correnteza da água hoje anda numa direção FIXA
(`animarAguaAtlas`, `client/src/atlasTexture.ts` — fase por quadro, `AGUA_FRAMES=16`,
~8 fps). O pedido: **a direção da animação seguir o VENTO**. Isso puxa um sistema de
vento — e, com vento existindo, todo o resto do ambiente pode responder a ele.

**Frentes, da mais barata pra mais cara:**
1. **Textura da água (polimento).** Melhorar o tile em si — hoje é ruído fixo + onda que
   anda. Olhar: contraste da onda, brilho especular fake, borda de espuma na praia.
   Isolado, não depende de vento.
2. **Vento como estado do mundo.** Vetor (direção + força) determinístico, autoritativo
   no servidor (mesmo padrão de `horaDoDia`/`cicloAtivo` do cp21: avança por TICK, não
   por relógio de parede, broadcast 1×/s junto do `time`). Comandos de professor
   `/vento` no mesmo molde de `/hora`. Vento é SÓ VISUAL (não empurra jogador) até
   alguém decidir o contrário.
3. **Animação da água pelo vento.** `animarAguaAtlas` ganha direção: a fase anda no
   eixo do vento (4 ou 8 direções bastam pro tile 16px), velocidade pela força.
4. **Nuvens.** Camada no céu (plano/skybox em `daynight.ts`) andando na direção do
   vento; densidade/velocidade pelo estado. Cuidado com custo em PC de lab.
5. **Folhas balançando.** Vértices da folha (bloco id 28) com deslocamento senoidal no
   shader/material — GRUPO C de esforço: mexe em material, não só em atlas.
6. **Grama (bloco novo, não-cubo)** e **flores** — geometria cruzada (2 quads em X),
   mesma família dos não-cubos (tocha/laje/escada, já resolvida no mesher). Balanço
   pelo vento junto com as folhas.

**Ordem sugerida:** 1 → 2 → 3 (entrega visível cedo, tudo procedural) e só depois 4/5/6,
que são geometria e material novos. Nada disso bloqueia o piloto.

---

## 🍖 BACKLOG — MODO SOBREVIVÊNCIA (escopo ABERTO 2026-07-27, sessão 30)

> Entrevista de escopo feita com o usuário nesta data. **Nenhuma linha codada.** Segue 4º na
> ordem travada: auto-update ✅ → layouts mobile → v2 da geração → **sobrevivência**.
> Este bloco existe pra que a sessão que pegar a frente não precise reabrir nenhuma decisão.

### Decisões travadas pelo usuário (2026-07-27)

1. **Lite agora, arquitetura pronta pra completa.** Vida + fome + dano + recursos finitos +
   craft. Ferramentas com durabilidade, minérios por profundidade e mobs ficam pra depois —
   mas cada peça do lite nasce com a porta aberta pra eles (ver "como o lite não fecha portas").
2. **Mobs hostis: SIM no plano, e FORA da aula.** A aplicação que o usuário quer é um **mundo
   de sobrevivência pra turma explorar**, não uma aula de matéria específica. Isso amplia o uso
   do jogo (pedagogia por exploração/colaboração em vez de objetivo dirigido). Mundo-aula e
   mundo de atividade seguem criativos e sem bicho.
3. **Craft por LISTA de receitas.** Grade 3×3 DESCARTADA: arrastar dói no tablet/Kindle Fire da
   escola e trava aluno de 2º ano. A lista mostra o que dá pra fazer, o que falta e quanto.
4. **`/modo` = padrão do mundo (salvo no `.ljw`) + override por aluno + `all`.**
5. **`/pvp ligar|desligar` já entra no lite** (padrão DESLIGADO).
6. **Inventário na morte vira REGRA DE MUNDO, não constante de código** (decisão de
   2026-07-27, no molde do `/gamerule keepInventory` do Minecraft): `manter-inventario`
   **nasce LIGADO** (não perde nada ao morrer — é o padrão de escola), e o professor
   desliga se quiser a partida com peso. Ver "regras de mundo" abaixo.

### Semântica exata do `/modo` (fixada com o usuário)

| comando | efeito |
|---|---|
| `/modo` | mostra o modo do mundo e o teu (qualquer um pode consultar) |
| `/modo criativo\|sobrevivencia` | muda o **padrão do mundo**, gravado no `.ljw`. Vale pra quem entrar e pra quem está dentro **sem** override pessoal |
| `/modo <modo> @aluno` | **override pessoal** de um jogador. Vence o padrão do mundo |
| `/modo <modo> all` | padrão do mundo **+ apaga todos os overrides**: pega todos que estão dentro e todos que entrarem |
| `/modo <modo> eu` | muda só quem digitou (o professor demonstrar sobrevivência sem mexer na turma) |

`all` **não pega o professor** — ele fica como está e se muda com `eu`. Todos os quatro são
professor-only, no molde de `/voo`, `/ciclo`, `/vento` (`if (!professor) return "..."`).

### Regras de mundo (`/regra`) — o registro, decidido em 2026-07-27

O usuário pediu o modelo do `/gamerule` do Minecraft: **o que a sobrevivência decide fica como
regra ajustável por mundo, não como constante no código.** Então nasce um registro em
`/shared` (nome, tipo, padrão, texto de ajuda) e UM comando genérico:

| comando | efeito |
|---|---|
| `/regra` | lista todas as regras com o valor atual do mundo |
| `/regra <nome>` | mostra uma (valor + o que ela faz, em português de professor) |
| `/regra <nome> ligar\|desligar` | muda e **grava no `.ljw`** |

**Regras do lite:** `manter-inventario` (padrão **LIGADO**) · `pvp` (padrão desligado) ·
`fome` (padrão ligado — permite sobrevivência sem fome pro fundamental 1) · e, quando o F8
existir, `mobs`.

**`/pvp ligar|desligar` continua existindo como ATALHO da regra `pvp`** — um estado só, duas
portas. Verbo curto pro professor que já decorou `/voo` e `/ciclo`; `/regra` pra quem quer ver
tudo num lugar.

**Não retrofitar** `/ciclo`, `/voo`, `/vento`, `/confinar`, `/claim` pra dentro do `/regra`:
são comandos que o professor já usou em piloto, e reescrever a UX deles não é escopo da
sobrevivência. O registro nasce só com o que é novo; unificar depois é possível e barato
(cada um vira mais um alias), reaprender comando no meio da aula não é.

**Save:** as regras entram como UM campo opcional `regras?: Record<string, boolean>` no
`SaveMeta` — ausente = todos os padrões. Uma regra nova depois não mexe no formato nem
re-versiona nada, que é a razão de ser um mapa e não cinco campos soltos.

### O que existe hoje — o ponto de partida real

| peça | estado |
|---|---|
| vida / fome / dano / morte | **nada.** Zero em `physics.ts`, `protocol.ts`, `session.ts` |
| inventário | `client/src/inventory.ts` = paleta INFINITA. UI pura, "nunca decide estado de jogo" |
| drop ao quebrar | não existe — bloco quebrado vira ar |
| craft | não existe |
| itens (não-blocos) | **existe a banda de ids ≥ 900** (`ITEM_BALDE_VAZIO=900`, `ITEM_BALDE_AGUA=901` em `blocks.ts`) — acima do último bloco, então `isPlaceable` os recusa. **É a costura pronta pra comida/ferramenta.** |
| voo criativo | `/voo` do professor libera pra turma; `physics.ts` já tem o ramo sem gravidade |
| ciclo dia/noite | `/hora`, `/ciclo` — **só visual, a hora não decide nada de jogo**. `SaveMeta` já persiste hora+ciclo e o cp21 anotou: "sobrevivência (futuro) grava a hora corrente pra continuar de onde parou" |
| árvores | `shared/src/arvores.ts` — fonte de comida do lite sai daqui (fruta da folha) |
| regra de vizinhança | `shared/src/rules.ts` — `BlockRule` genérica (areia, cascalho, água). **Plantação cresce por aqui, sem engrenagem nova** |
| criação de mundo | por env no boot do host: `LJ_PRESET=plano\|cabines`, `LJ_TAMANHO`, `LJ_NOVO` |

### Onde cada peça mora (regra de ouro — vibecode vai errar isto)

`shared/src/session.ts` já tem **137 KB**. Nada de sobrevivência mora dentro dele como lógica:
a session **orquestra**, os módulos novos de `/shared` **decidem**, e todos são funções puras
testáveis sem rede — o mesmo desenho de `rules.ts`, `claims.ts`, `physics.ts`.

- `shared/src/sobrevivencia.ts` — vida/fome puras: `aplicarDano(estado, n, causa)`,
  `drenarFome(estado, atividade)`, `regenerar(estado)`. Sem I/O, sem `Date.now()`.
- `shared/src/inventario.ts` — stacks puros: `adicionar`, `remover`, `contar`, `cabe`.
- `shared/src/drops.ts` — tabela `id do bloco → item(ns) que caem`.
- `shared/src/receitas.ts` — `Receita { saida, custo[] }` + `podeFabricar(inv, receita)`.
- `client/src/` — só HUD (corações/coxas), painel de craft e o botão de comer. **A UI nunca
  decide**: mesma disciplina do `inventory.ts` de hoje.

**Uma porta só pro dano.** Toda perda de vida passa por `aplicarDano(alvo, n, causa)`. Queda,
afogamento, fome, PvP e (depois) mob entram pela MESMA função. É o que faz o F8 ser plugue e
não cirurgia — é a lição do `fallingRule` genérico (areia e cascalho dividem uma regra).

### Frentes, na ordem de entrega (cada uma fecha sozinha)

**F1 — `/modo` (o interruptor, sem nenhuma mecânica).** ~1 sessão.
Estado do modo por mundo + mapa de overrides, `SaveMeta.modo?`/`modosPorJogador?`, msg nova
`modo {efetivo}` no join e a cada troca. Sobrevivência ainda joga IGUAL a criativo — o que muda
é só o rótulo e o voo (sobrevivência não voa, nem com `/voo` liberado). Entrega testável e
reversível: se parar aqui, nada quebrou.

**F2 — Vida, dano, morte, respawn.** ~1 sessão.
Vida 0–20 (10 corações). Causas do lite: **queda** e **afogamento**. Regeneração passiva com
fome alta. Morte → respawn no spawn autoritativo do mundo (a msg `spawn` já existe desde o
bug-010). **Inventário na morte = regra `manter-inventario`, LIGADA por padrão** (decidido
2026-07-27): perder tudo é frustração de aula e vira vetor de griefing assim que o PvP ligar,
mas o professor pode desligar num mundo de exploração onde a morte deva pesar.

> **O ramo "desligado" da regra é BARATO de propósito: os itens SOMEM.** Não existe baú nem
> item no chão no jogo (conferido em 2026-07-27 — nenhum bloco contêiner em `blocks.ts`), e
> ambos custam entidade/UI nova, que é orçamento do F8. Perda total já é penalidade suficiente
> pra quem escolheu desligar a regra. **Túmulo** (baú no lugar da morte, guardando o
> inventário) fica anotado como o upgrade natural do dia em que existir um bloco contêiner —
> a regra não precisa mudar de nome nem de assinatura pra ganhar esse comportamento.

> **Quem calcula a queda:** o SERVIDOR, derivando do fluxo de `move` (10 Hz) que já recebe —
> ele tem o mundo e sabe o que há embaixo do jogador. O cliente NÃO reporta dano (seria
> autoridade no lugar errado). Custo conhecido: a 10 Hz, com a velocidade de queda já limitada
> em `physics.ts`, a resolução da altura é de alguns blocos — o dano nasce com tolerância em
> vez de fingir precisão.

**F3 — Fome.** ~0,5 sessão.
Barra 0–20, dreno por atividade real (a session já vê distância andada, blocos quebrados e
colocados). Fome no zero → dano lento por `aplicarDano`. Tick de 10 Hz que já existe; nenhum
relógio de parede (mesma regra do ciclo dia/noite).

**F4 — Recursos finitos (inventário AUTORITATIVO).** ~2–3 sessões. **A frente cara.**
O inventário vira estado do servidor (9 hotbar + 18 mochila, stack 64). `place_block` em
sobrevivência **gasta**; `break_block` **dá** o que a tabela `drops.ts` disser. Criativo segue
com a paleta infinita de hoje, intocado.
**Simplificação deliberada: NÃO existe item no chão.** Quebrar com a mochila cheia é RECUSADO
("mochila cheia") em vez de largar item no mundo — item no chão é entidade nova na rede, e
entidade é o orçamento do F8. Assim o lite não paga o preço do completo.

**F5 — Craft por lista.** ~1 sessão.
`receitas.ts` puro + painel-lista com filtro e "falta 3 tábua". Servidor valida e aplica
(cliente só pede). **Sem bancada no lite** — fabrica em qualquer lugar; a bancada entra depois,
se e quando servir pra *escalonar* receitas avançadas.

**F6 — Comida.** ~1 sessão.
Duas fontes: **fruta caindo da folha** (`arvores.ts` já planta as folhas) e **uma plantação**,
que cresce como `BlockRule` em `rules.ts` — mesma engrenagem da areia e da água, zero motor
novo. Colher → comer, ou colher → 1 receita simples (pão).

**F7 — `/pvp ligar|desligar`.** ~0,5 sessão.
Atalho da regra `pvp` do registro (o F1 já trouxe o `/regra` e o campo no save), **padrão
desligado**. Ataque = clique esquerdo em jogador dentro
de `PLAYER_REACH`, dano fixo, cooldown; sem arma no lite. Reusa `aplicarDano` do F2 inteirinho.
Professor-only pra alternar, como todo o resto.

**F8 — MOBS (fora do lite; o que o usuário quer no mundo de exploração).** ~3+ sessões.
Entidades na rede (o relay de `player_moved` é o molde), IA de andar/perseguir, spawn por luz e
por noite, `/mobs ligar|desligar`. **Aviso de desempenho registrado:** no notebook do lab a GPU
p95 já bate em 16,8–19,6 ms contra o orçamento de 16,7 ms de 60 FPS — mob tem de nascer
instanciado e com teto de população, senão come exatamente a margem que não existe.

**F9 — Preset de mundo de sobrevivência.** ~0,5 sessão.
`LJ_PRESET=sobrevivencia` ao lado de `plano|cabines`: nasce com ciclo LIGADO, modo sobrevivência
`all`, pvp off, confinamento off, mobs on (quando o F8 existir). É o que materializa "mundo pra
turma explorar" como coisa de um clique, não de seis comandos.

### Como o lite NÃO fecha portas pro completo

| porta do completo | o que o lite já deixa pronto |
|---|---|
| mobs, item no chão | `aplicarDano` genérico + o relay de posição do `player_moved` |
| ferramenta com durabilidade | banda de itens ≥ 900 (`blocks.ts`) e o inventário por stack |
| minério por profundidade | `drops.ts` é tabela; profundidade é filtro na geração, não no inventário |
| bancada gatilhando receita | `receitas.ts` puro — a bancada vira só um campo `exige` na receita |
| noite perigosa | ciclo dia/noite já é autoritativo e já persiste no save |

### Colisões com o que já existe (checar ANTES de codar)

- **Mundo-aula / atividade (cp19, cp25):** read-only + confinamento por grupo. **Sobrevivência
  fica forçada OFF ali** — não é escolha do modo, é o host que impõe, como já faz com o
  confinamento no boot.
- **Claims e confinamento (cp24/cp25):** quebrar bloco pra colher em área alheia já é barrado.
  Sobrevivência não pode virar rota de contorno do anti-griefing.
- **Autoria do professor:** `/bloco`, varinha, `/regiao`, `/objetivo` são teleoperação e
  seguem valendo em qualquer modo — o professor não fica sem ferramenta porque a turma está
  sobrevivendo.
- **`?bench`:** o mundo do bench é criativo, ponto. Nenhuma mecânica de sobrevivência pode
  entrar no trajeto medido, senão a régua dev × lab perde a comparabilidade com tudo que já
  foi medido.
- **Save:** `SaveMeta` cresce só com campos **opcionais** (`modo?`, `modosPorJogador?`,
  `regras?` como MAPA, vida/fome/inventário no roster). Ausente = padrão. **Não re-versionar**
  — é o padrão que hora/ciclo/vento/claims já seguem.
- **Protocolo:** campos novos **opcionais**, dos dois lados com parse defensivo. Host antigo
  não manda e o cliente **não pode descartar a mensagem inteira** por isso (lição do
  `debug_stats` das regras do servidor, sessão 26).

### O que prova cada frente (o portão antes de commitar)

Testes puros em `/shared` para vida/fome/inventário/receitas/drops (nenhum precisa de rede) +
um smoke real por frente em `scripts/smoke.mjs`, no molde do `_smoke-troca-raio.mjs`: dois
clientes ws, um em cada modo, provando que criativo continua infinito enquanto sobrevivência
gasta; que `all` pega quem está dentro E quem entra depois; que o modo sobrevive ao
salvar/recarregar o `.ljw`. `npm run verify` fecha os três (typecheck + testes + build).

---

## 🗒️ Referência — playtest dos cenários (quando o touch estiver pronto)

**Estado:** motor + autoria + 3 cenários prontos. Falta a única coisa que o
código não prova: **um humano jogando as aulas**.

**Como rodar (1 terminal — servidor já serve o cliente):**
```bash
npm run cenarios                                                    # gera os 3 .ljw
npm run build                                                       # compila o cliente
LJ_SAVE=cenarios/aula1-sequencia.ljw LJ_CODIGO=prof2026 npm run start -w server
```
Todos (professor E alunos) abrem `http://ip-do-professor:8080` no navegador — o
IP sai impresso no boot do servidor. Professor entra com nome + PIN + código
`prof2026`; aluno, sem o código. Trocar de aula ao vivo: `/mundo carregar
aula2-binario` (só professor, ninguém cai). Para desenvolver o cliente com
hot-reload, `npm run dev` (Vite na 5173) segue funcionando. Roteiro e gabaritos
em `cenarios/README.md`.

**Comandos de organização da aula (2026-07-15):** dois comandos de professor
que facilitam abrir a atividade. (1) **`/tp grupos`** — teleporta os alunos
conectados de cada grupo para a área do seu objetivo ATIVO (`areaDoGrupo` →
`alvos[g-1]`; destino = centro da caixa no plano + `findSpawnY` na coluna, nunca
dentro de bloco; professor NÃO se move). (2) **`/iniciar [n [alunos]]`** — macro
num comando: (opcional) recria os grupos com os alunos online, zera o progresso
(mesma semântica de `/objetivo resetar` — exige ação nova) e leva cada grupo à
sua área; avisa a turma "A atividade começou". Botões no painel do professor:
"▶ iniciar atividade" (armado, 2 cliques — zera progresso) e "↦ levar grupos às
áreas". ZERO protocolo novo (reusa `teleport`/`player_moved` — cliente já
trata). Autocomplete conhece ambos. smoke ws real 11/11
(`server/src/cenarios/_smoke-atividade.mjs`).
**+ RESET DE VERDADE (bug-207, 2026-07-15):** reiniciar (`/iniciar` e `/objetivo
resetar`) agora restaura os BLOCOS das áreas ao estado autoral, não só os flags.
`Objective.baseline: number[][]` = fotografia autoral de cada área, capturada no
`/objetivo add` e PERSISTIDA no .ljw; `restaurarAreasBaseline()` repõe via
applyBlock. A faixa da aula1 volta a 4/12 (sementes), não fica vazia nem com o
que os alunos colocaram. Baseline mora no OBJETIVO (não no mundo) → sobrevive ao
autosave da cópia de trabalho. **CENÁRIOS REGENERADOS** (`npm run cenarios`) pra
capturar o baseline — save antigo sem baseline degrada (reset não mexe nos
blocos). 142 testes, smoke ws 11/11, aula1 confere 4/12 no servidor real.

**QoL adicionado no playtest (2026-07-15):** (1) **Tab autocompleta comandos**
no chat — completa a palavra e, com várias opções, cicla a cada Tab (dica acima
do campo); árvore em `client/commands.ts` espelha runCommand (shared) + /mundo
(server). (2) **/mundo sem `.ljw`** — o comando já aceitava extensão opcional;
agora os nomes SÃO EXIBIDOS sem `.ljw` (`semExt` em mundos.ts) e o cliente
cacheia os nomes vistos em `/mundo lista` pra oferecê-los no Tab de `/mundo
carregar` (precisa digitar `/mundo lista` uma vez pra popular). typecheck 3/3,
build, 137 testes, lógica do autocomplete validada em node.

**O que olhar no playtest:**
- O aluno ENTENDE o que fazer só com o enunciado + a caixa verde? (o enunciado
  tem teto de 120 chars — se não couber, isso é atrito de motor)
- A faixa está num lugar bom? (4 passos à frente da porta da cabine)
- A caixa verde VAZIA na cabine do professor (gabarito apagado) confunde?
- ✅ (RESOLVIDO cp19) Trocar de aula ao vivo com `/mundo carregar nome` — validar
  no playtest que o fluxo é natural pro professor (achar o nome, avisar a turma).
- **Fluxo de abertura (2026-07-15):** alunos entram → auto-distribuem nos 5 grupos
  → professor aperta **▶ iniciar atividade** no painel (ou `/iniciar 5` pra
  rebalancear pelos presentes). Valida: teleporte cai num lugar bom pra começar?
  **▶ iniciar** de novo restaura a faixa ao estado inicial (aula1→4/12)? O aluno
  entende que foi reiniciado?
- Tab autocompleta os comandos — o professor acha isso útil / descobre sozinho?
- Falta algum comando que o professor gostaria de ter na hora?
- (menor, opcional) Welcome diz "Pressione Enter para abrir o chat" — no
  celular/tablet o certo é o botão 💬. Adaptar o texto se confundir os alunos.
- **Features novas (cp20–cp22, 2026-07-16) a olhar:** (a) blocos LETRA/NÚMERO
  (tecla E, fim da grade) — o glifo 16px é LEGÍVEL no mundo? servem pra soletrar/
  numerar? (b) DIA/NOITE — cenário abre em dia permanente (confirmado no fio); o
  professor consegue demonstrar com `/hora noite` + `/ciclo ligar`? o céu de
  noite deixa ver o suficiente pra construir? (c) `/kicar nome` — o fluxo de
  remover um aluno bagunceiro é natural? (d) PLOT demarcado (sem cabines de
  tábua) — a borda de pedra-lavrada no chão delimita bem a área do grupo? o mapa
  ficou melhor sem paredes? (e) `/regiao sortear modelo <ids>` seguido de
  refotografar + reiniciar — o professor consegue gerar uma sequência nova/
  aleatória na hora?

**Depois:** piloto com a turma no lab → relatório de aplicação (entregável final).

⚠️ **Pendência real do piloto:** o servidor já serve o cliente na mesma porta
(basta `npm run build` uma vez + `npm run start -w server`; o aluno abre o IP no
navegador). Falta só empacotar (Tauri/Node SEA) — ADIADO por decisão do usuário
(ainda vai mexer em coisas); por ora o professor precisa de Node instalado.

**Depois (anotado, não esquecer):**
- **MVP v2 = CENÁRIOS/AUTORIA** (coração pedagógico): objetivos, detecção de
  padrão no mundo = mesma engrenagem das rules.
- **Água** (resto do grupo B: fluido via regra de vizinhança + nado — fase
  própria; vidro/folhas saíram no cp18). **Grupo C** (não-cubos: tocha,
  laje, escada — geometria nova no mesher).
- Playtest das texturas do grupo A pelo usuário (o playtest do cp17/18 cobre).
- **Backlog do usuário `ideias para fazer.txt`** (12 itens). FEITO: letra/número
  (cp20), `/kicar` aluno (cp22), dia/noite (cp21). PENDENTE, por frente: móveis
  (tapete/cadeira/mesa/sofá/cama = GRUPO C, geometria não-cubo — mesher novo);
  porta + janela abre-fecha (bloco COM ESTADO + interação, base de mecanismos
  lógicos); quadro com texto/imagem (feature grande de UI); vidro (já existe
  cp18 — talvez o usuário queira vidraça/painel); cerca de madeira, meio bloco
  vertical (novo 2026-07-17 — grupo C, não-cubo). Escolha da próxima frente é
  do usuário.

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

## Checklist de dia de aula (do piloto de 2026-07-17)

> Movido do STATUS.md em 2026-07-25: o piloto já aconteceu, mas o checklist
> operacional (host, rede, fallback) vale pra qualquer aula futura.

**Contexto:** aula HOJE. Código pronto e pushado; celular já jogou em casa
(2026-07-16). **No notebook da escola: `git pull` antes de rodar** (clone em
`C:\projeto\logica-em-jogo`; git é o canal de sync — nunca ZIP). Se mexer no
cliente, `npm run build` + commit do dist.

### A. TESTE NO TABLET DA ESCOLA (antes da aula — único cheque que falta)
Tablet abre `http://<ip-do-professor>:8080` — a UI de toque liga sozinha
(`pointer: coarse`); no desktop, `?touch` na URL força pra demonstrar. Olhar:
joystick anda, arrasto gira a câmera, quebrar/colocar acertam o bloco mirado,
pular segura, hotbar/inventário escolhem a lã, botões 💬 chat e ⛶ tela cheia,
menu pausa e "▶ voltar ao jogo" retoma. Notebook com touchscreen NÃO liga a UI
(mouse é o ponteiro primário — de propósito). Risco real: AP isolation do
Wi-Fi da escola (item 3 do checklist).

### B. CHECKLIST DE DIA DE AULA (não-código)
0. **Levar o jogo pro notebook da escola (sync via git, decisão 2026-07-16):**
   o repo agora carrega cenários .ljw, aulas/ e client/dist — clone = pronto
   pra rodar, sem build. No notebook: instalar **Node no Windows nativo**
   (evita o problema do IP do WSL do item 3), `git clone
   https://github.com/meketreve/logica-em-jogo` (repo privado — logar com
   `gh auth login` ou token), `npm install`.
1. Host: `client/dist` já vem no repo (rebuildar só se mexer no cliente).
   Linux/WSL:
   `LJ_SAVE=cenarios/aula1-sequencia.ljw LJ_CODIGO=<código> npm run start -w server`
   **Windows (PowerShell — env é em linha separada):**
   `$env:LJ_SAVE="cenarios/aula1-sequencia.ljw"; $env:LJ_CODIGO="<código>"; npm run start -w server`
   O boot imprime o IP da LAN.
2. Notebook do professor = host (precisa de Node). Alunos (tablet/notebook) abrem
   `http://<ip>:8080`. TODOS na MESMA rede/Wi-Fi.
3. Rede: Wi-Fi da escola pode ter **isolamento de clientes** (AP isolation) → os
   dispositivos não se enxergam. **Testar UM tablet ANTES da aula.** Firewall do
   host pode bloquear a 8080 → liberar.
   **⚠️ Se o servidor rodar dentro do WSL** (como no PC de dev): o IP que o boot
   imprime é o INTERNO do WSL (172.x.x.x, NAT) — aluno da LAN NÃO alcança. Usar
   o IP do WINDOWS (`ipconfig`) e encaminhar a porta (PowerShell admin):
   `netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=<ip-do-wsl>`
   (+ liberar 8080 no firewall do Windows). Alternativas: Node instalado no
   Windows (roda o servidor fora do WSL, zero proxy) ou WSL2 `networkingMode=mirrored`.
4. Fluxo: aluno digita nome + PIN (registra na 1ª vez); professor também põe o
   código. Auto-distribui em grupos → professor aperta **▶ iniciar** (ou
   `/iniciar 5`). Trocar de aula ao vivo: `/mundo carregar aula2-binario`.
5. **Fallback:** se o tablet falhar (isolamento/WebGL), roda só nos notebooks
   (já funciona hoje).

### C. RELATÓRIO DE USO
Ainda NÃO existe log de conclusão por aluno. Amanhã = **manual**: o HUD do
professor mostra progresso por grupo (`g1 2/4 · g2 ✓`) → screenshots + anotações;
F3 exporta JSON de perf. Relatório de verdade (quem/o quê/quando concluiu,
export) = tarefa à parte, NÃO hoje.

### Deferido / não precisa amanhã
Empacotar em binário único (tem admin, Node roda); trocar stack (decidido: manter
web + empacotar host depois — ver Decision Log); água/outros blocos.

## 🏔️ BACKLOG — V2 DA GERAÇÃO (escopo ABERTO 2026-07-28, sessão 31)

> 3º da ordem travada: auto-update ✅ → layouts mobile ✅ (1ª rodada) → **v2 da geração** →
> sobrevivência (§🍖).
>
> ⚠️ **ARMADILHA DE NOME:** a sessão 10 (2026-07-20) chamou de "worldgen v2" o que entregou
> (biomas por clima + minério em veia + árvores brasileiras). **Não é essa a v2 da fila.**
> A v2 da FILA é o que ficou de fora naquele dia e nunca foi feito.

### Decisões travadas pelo usuário (2026-07-28)

1. **Entrega = os DOIS, cavernas antes.** Cavernas e relevo por bioma são independentes;
   cavernas abrem primeiro porque casam com o minério que já existe em veia e são a porta
   de entrada do §🍖.
2. **Cavernas em TODO mundo procedural** — P/M/G/E, tudo que nasce de ruído. `plano` e
   `cabines` seguem **intocados** (são presets de autoria, não de exploração).
3. **Relevo = "montanha de verdade":** araucária vira serra alta com neve, não só um
   multiplicador de amplitude. Isso **reabre de propósito** o problema que o heightmap global
   único evitou em 2026-07-20 (penhasco de fronteira entre biomas) — a suavização de
   fronteira passa a ser trabalho desta fase, não um detalhe.
4. **"Madeira por espécie" saiu do escopo: JÁ ESTÁ FEITA.** `LogIpe`/`LogAraucaria`/
   `LogPauBrasil` existem como blocos e cada espécie só nasce no bioma dono. O item no
   backlog antigo estava obsoleto.

### O que existe hoje — o ponto de partida real (conferido 2026-07-28)

- **`shared/src/worldgen.ts`** — `heightAt` (value noise, heightmap **ÚNICO e GLOBAL**),
  `climaAt` (2 campos de ruído temp+umid), `veiasDaColuna` (minério por banda de
  profundidade, `mulberry32` seedado), `arvoreDaColuna`, `gerarColunaDeChunks` (L252-361, o
  construtor de coluna — **é aqui que a caverna escava**), `generateWorldForPreset`.
- **`shared/src/biomas.ts`** — a interface `Bioma` tem topo/subsolo/árvores/flores/gramaAlta/
  mandacaru. **Nenhum campo de relevo.** Bioma hoje só PINTA e DECORA.
- **Constantes globais por ALTITUDE**, não por bioma: `SAND_HEIGHT`, `SNOW_HEIGHT = 58`,
  `ROCHA_HEIGHT`, `NIVEL_MAR`. Serra alta com neve mexe nessa família.
- **`topoPrevisto`** é chamado em 3 pontos do próprio `worldgen.ts` — é a fonte única do
  bloco de topo. Relevo novo tem de passar por ela, não por cópia.
- **Cavernas: ZERO ocorrências** no worldgen. Nada a migrar, tudo a escrever.

### Colisões a checar ANTES de codar (é onde o vibecode vai errar)

| Colisão | Por quê |
|---|---|
| **Não existe luz voxel** | Tocha é halo decorativo (`client/src/torchGlow.ts`, decisão de 2026-07-17). Caverna nasceria **clara como a superfície** — chata e sem leitura. Ou a fase entrega escuridão/luz, ou entrega buraco iluminado. **Decidir com o usuário antes de escavar.** |
| **Mundo E é LAZY** | Coluna é materializada sob demanda. A caverna precisa ser função PURA de `(x, y, z, seed)` — nada de estado global nem de passo de pós-processamento sobre o mundo inteiro, senão a borda da coluna não fecha com a vizinha. |
| **Orçamento de GPU** | Cavidade = faces internas novas. O lab já está com **GPU p95 16,8–19,6 ms contra 16,7 ms** de orçamento (STATUS §⚠️). Medir triângulos/draw calls com `npm run bench:headless` e um `?bench` no lab ANTES de aumentar densidade. |
| **Água** | Caverna que abre abaixo do `NIVEL_MAR` alaga? `rules.ts` só roda na vizinhança SUJA, então a geração não dispara fluxo sozinha — mas o primeiro bloco quebrado ali sim. Decidir se a geração sela ou se inunda de propósito. |
| **Spawn** | `findSpawnY` desce do teto até achar sólido → pode pousar no TETO de uma caverna. `findSpawnSeco` só resolve água. Regressão a testar: nascer nunca dentro de caverna. |
| **Save** | `.ljw` guarda os chunks CRUS: a caverna fica assada no arquivo, sem mudança de formato. **Mundo salvo antes da v2 NÃO ganha caverna** — e isso está certo (mundo de aula não muda debaixo do professor). |
| **Fronteira de bioma** | Com relevo por bioma, `heightAt` deixa de ser um campo só. A suavização tem de valer nos DOIS sentidos e ser determinística — teste de determinismo (mesma seed = mesmos bytes) já existe em `worldgen.test.ts` e precisa continuar passando. |

### O que prova cada frente (o portão antes de commitar)

- **Caverna:** teste de determinismo (mesma seed = mesmos bytes) · teste de que coluna vizinha
  fecha (sem parede no meio da galeria) · screenshot headless com corte vertical ·
  `plano`/`cabines` inalterados (teste de regressão) · spawn nunca dentro de caverna.
- **Relevo:** teste de fronteira sem degrau maior que N blocos entre colunas adjacentes ·
  `topoPrevisto` continua a fonte única · perfil do lab comparado com a régua
  (`…-l9xf.json`) — relevo mais alto = mais coluna materializada = mais malha.
