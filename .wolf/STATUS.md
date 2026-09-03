# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.

> ## 🧭 HANDOFF — SESSÃO 94 (2026-09-03) · Baú-Loja completo, moeda decidida (só Dimas), launcher sem semver

> **Bateria verde:** typecheck 3/3 · **969/969** · build · `checar-launchers` OK. bug-650, a
> loja (14 tarefas + revisão final), a simplificação pra moeda-única e a troca do rótulo de
> versão do launcher estão COMMITADOS e PUSHADOS na main (`87d9193`).

> ### ✅ Launcher não mostra mais semver ("0.9.0") — mostra data+novidade+commit
> `iniciar-servidor.bat`/`.sh` liam `package.json`'s `"version"` (ritual morto desde
> 2026-08-27, ver `shared/src/version.ts`). Agora leem `shared/src/build-info.json`
> (`data`+`titulo`), com `titulo` sendo o topo do `changelog.ts` — mas extraído em **Node**
> por `scripts/gerar-build-info.mjs` (novo `tituloDoChangelog()`), NUNCA em batch/shell puro,
> porque título é texto livre com dois-pontos/vírgula dentro ("Loja: monte seu comércio") e
> parsear isso em `.bat` é a mesma armadilha de aspa-escapada que o `:ler_versao` original já
> documentava. O `.bat` ganhou `:ler_campo_json` (genérico, corta só no PRIMEIRO ":" da linha
> via `tokens=1*` — sobrevive a dois-pontos dentro do valor). O `.sh` ganhou `rotulo_build()`
> via `sed` (não tem esse problema, regex captura por aspas). Commit continua vindo do SHA do
> GitHub (`.lj-versao`), não mudou — só o rótulo humano trocou. Testado com simulação Python
> do parser batch contra o `build-info.json` real, bateu byte-a-byte. `npm run verify` 5/5.

> ### ✅ bug-650 fechado — atraso de comandos com turma cheia
> Ver commits `bb56749`/`fix(rede)`. Retestado com carga real: 35 clientes 2555ms→12.9ms.
> Continua **não verificado em aula real** (só localhost) — próximo teste de campo.

> ### ✅ Baú-Loja implementado + moeda decidida = só Dimas (`docs/superpowers/specs/2026-08-31-loja-baus-design.md`)
> 14 tarefas via **subagent-driven-development** (implementador + revisor por tarefa), commitadas
> direto na main. Bloco craftável, terreno próprio, criador gerencia estoque/preço, QUALQUER UM
> compra — mesmo fora do grupo de amigos.
>
> **A revisão final de branch inteira achou 2 bugs Critical + 3 Important** que nenhuma revisão
> de tarefa isolada enxergaria — todos corrigidos numa rodada de fix + re-revisão escopada:
> loja nascia inquebrável pra sempre (predicado de save reusado como gate de quebra, split em
> dois); editor de preço só criava preço sem sentido (fix original: seletor de item de
> pagamento); Dimas mintava sem limite trocando de nome (mitigado com aviso ao professor);
> `definir_preco` sem teto de id/tamanho (agora tem); 2 testes que o spec pedia e faltavam.
>
> **Depois disso, o usuário decidiu (fora da votação): a moeda é SEMPRE Dimas.** Item-por-item e
> recurso-como-moeda foram REMOVIDOS do código (não guardados como caminho morto) —
> `Preco` virou `number` puro em toda a pilha, o seletor de pagamento da UI (o fix acima) SAIU —
> volta a ser só o campo de quantidade. Isso fechou o bug-659 (escolher moeda antes da
> quantidade perdia a escolha em silêncio) por REMOÇÃO da causa, não por patch. `docs/loja-
> perguntas-alunos.md` atualizado: só falta a turma votar QUANTO de Dimas cada um recebe.

> ### 🚀 PRÓXIMA QUEST
> **Pendências herdadas, nenhuma bloqueante:**
> - Aviso de Dimas nova ao professor fica barulhento em troca de turma cheia — `todo.md` § Loja.
> - Mintar Dimas de graça criando nome novo — hoje só avisa, não impede (baixo risco numa sala
>   supervisionada) — `todo.md` § Loja.
> - Votação da turma: só falta decidir QUANTO de Dimas cada aluno recebe ao entrar.
> - bug-651 (não sair da cama) e bug-652 (pular+colocar bloco teleporta pro lado) — abertos,
>   só lidos, não investigados a fundo.
> - bug-650: confirmar em aula real com turma cheia (só localhost até agora).
>
> Fila do `todo.md`: ovelha+lã de verdade (§🍖 F8), sentar na cadeira, modelo do player estilo
> Minecraft, Ferramentas v2 (durabilidade+slot+tempo de quebra).

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
- **§🍖 F10: BLOCO COM INVENTÁRIO (`shared/src/containers.ts`).** Conteúdo por POSIÇÃO num mapa
  da `GameSession` + no meta do save — o desenho do QUADRO, que foi o primeiro estado a não
  caber no byte do chunk. Serve fornalha e baú, e serve o próximo. Transferência num array
  CONCATENADO mochila+container (reusa `moverEmArray` do `inventario.ts`), índice UNIFICADO no
  fio (`0..26` mochila, `27+i` container), e o `use_block` é quem ABRE — a resposta do servidor
  é que abre o painel, porque quem decide se o aluno pode LER aquele baú é o gate de claim.
- **§🍖 F10: os módulos PUROS novos** — `fornalha.ts` (cozimento em TICKS, nunca relógio de
  parede) e `ferramentas.ts` (tipo × família × nível). Mesma disciplina de `inventario.ts`,
  `drops.ts`, `receitas.ts` e `sobrevivencia.ts`: sem I/O, sem rede, testáveis sozinhos.

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
