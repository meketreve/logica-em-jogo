# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.

> ## 🧭 HANDOFF — SESSÃO 97 (2026-09-11) · Clone WSL ressincronizado + 3 bugs anotados (nenhum patch)

> **SESSÃO DE ANOTAÇÃO, NÃO DE CÓDIGO.** Nenhum arquivo de `client/`, `server/` ou `shared/`
> foi tocado. Nenhum teste rodado. As únicas mudanças são `.wolf/buglog.json`,
> `.wolf/memory.md`, `.wolf/cerebrum.md` e este STATUS.
>
> **⚠️ ESTA SESSÃO RODOU NO CLONE WSL (`/home/meketreve/projetos/logica-em-jogo`), QUE É A
> CÓPIA DE RESERVA.** A cópia VIVA continua sendo `D:\git-projeto\logica-em-jogo` (Windows
> nativo). O clone WSL estava **236 commits atrás** (`package.json` em `0.8.0`, HEAD em
> `553e49f` de 05/08) e foi ressincronizado com `git pull --ff-only` → **`c920f62`, v0.12.1**,
> fast-forward limpo, 0 commits locais perdidos. Descartado antes do pull: um cabeçalho de
> sessão VAZIO em `.wolf/memory.md` (única sujeira da árvore).
> - **`npm install` NÃO foi rodado neste clone** e o `package-lock.json` mudou no pull
>   (esbuild `0.28.1` + gate `allowScripts`). Rodar antes de qualquer `npm run dev`/`test` AQUI.
> - Se o trabalho voltar pro Windows (o normal), **os 3 bugs abaixo precisam chegar lá por
>   `git pull`** — eles só existem no buglog deste clone até serem commitados e pushados.

> **🛏️ bug-662 — CAMA ENCOSTADA EM CAMA DUPLICA (causa raiz por leitura, repro não rodada).**
> `camaRule` (`shared/src/rules.ts:74`) acha o par perguntando só *"a célula vizinha no eixo tem
> o MESMO id?"*, nos dois sentidos. Mas as DUAS metades da mesma cama gravam o **mesmo id**
> (`CamaXP..CamaZN`, `blocks.ts:96`) — a regra **não distingue "meu par" de "metade de OUTRA
> cama"**. Com `dx=+1`: cama A em x=0,1 e cama B em x=2,3, quatro células com id igual viram uma
> CORRENTE. A cabeceira de A (x=1) olha x=2, vê id igual e se declara "pé com par" — quem a
> sustenta é o **pé da cama B**. Quebrar o pé de A deixa x=1 órfão de verdade, mas ele não
> evapora. E `drops.ts:53` faz `if (isCama(id)) return BlockId.CamaXP` — **toda metade dropa
> cama inteira**. 2 camas em fila → até 4 de volta, quebrando célula a célula.
> `place_block` (`session.ts:1137`) não barra: só checa se a célula da cabeceira é
> Air/replaceable, nunca se o vizinho já é metade de outra cama.
> **Fix exige tirar a ambiguidade do par ANTES de mexer em drops:** ids distintos de PÉ e
> CABECEIRA (como a porta faz com as metades) ou bit de paridade, pra `camaRule` só aceitar par
> de papel OPOSTO. Só então `drops` pode dropar uma cama por PAR e não por metade.

> **🏪 bug-663 — BAÚ-LOJA: O ÚLTIMO PREÇO EDITADO NÃO SALVA (causa raiz CONFIRMADA no código).**
> Não é persistência — é **ordem de teardown**. O disco está OK nos dois sentidos
> (`containers.ts:276` serializa `precos`, `:371` lê de volta). O listener do campo
> (`client/src/container.ts:358`) é `change` — só dispara no **blur/Enter** — e abre com
> `if (!this.pos) return`. `fecharSemAvisar()` (`container.ts:232`) faz `this.pos = null` na
> linha 236 e só DEPOIS `classList.add("hidden")` na 243; como `.hidden` é
> `display: none !important` (`client/index.html:25`), esconder o painel **tira o foco** → o
> browser dispara o `change` pendente NESSE instante → o handler entra com `pos` já null e
> **retorna em silêncio**. Os campos anteriores salvaram porque o foco indo pro próximo input
> deu blur enquanto `pos` existia — **por isso só o ÚLTIMO some**.
> - **Previsão testável que confirma em 30s:** fechar pelo botão `fechar` (`container.ts:470`)
>   **SALVA** (o mousedown move o foco e dispara o `change` antes do click handler); fechar com
>   **ESC PERDE**. Rodar isso ANTES de aplicar qualquer patch.
> - **Segundo caminho de perda:** `render()` (`container.ts:455`) faz `root.replaceChildren()`.
>   Tirar do DOM um input focado **não dispara `change`** no Chrome — o digitado some sem chegar
>   no handler. Qualquer `container` do servidor ou `inventario` novo (`refresh()`,
>   `main.ts:1451`) durante a digitação derruba o edit. Mesma classe do **bug-573** (rolagem do
>   craft). **Atenção: capturar `pos` no closure conserta o caminho do ESC mas NÃO este** — aqui
>   o `change` nunca chega a existir; precisa de flush explícito nos dois.
> - **Agravante de leitura:** `lojaPrecos()` (`container.ts:322`) monta as linhas a partir dos ids
>   nos SLOTS DE ESTOQUE, não da lista `precos` do servidor — item cujo estoque acabou perde a
>   linha e o preço **some da tela** mesmo vivo no servidor. Também se lê como "não salvou".
> - Checar ainda o teto `precos.size >= CONTAINER_SLOTS.loja` (`session/loja.ts:60`), que recusa
>   preço NOVO **em silêncio** quando cheio.

> **🏪 bug-664 — BAÚ-LOJA NÃO ROLA COM MUITOS ITENS (causa raiz CONFIRMADA no CSS).**
> Ausência de regra, não bug de lógica. `#container` (`client/index.html:198`) tem altura FIXA
> (`height: min(560px, 84vh)`), `flex-direction: column` e **`overflow: hidden`** — escolha
> deliberada de 2026-07-20, cujo comentário diz que "a GRADE rola por dentro". E rola:
> `.cont-bau` tem `max-height: 42%; overflow-y: auto`. Só que **`.loja-compra` e `.loja-precos`
> não têm regra CSS NENHUMA** — os únicos seletores de loja são `.loja-item`, `.loja-item img` e
> `.loja-qtd, .loja-preco-input` (`index.html:698-700`). Sem teto e sem `overflow-y`, as listas
> estouram a altura fixa e o `overflow: hidden` do pai **corta sem gerar barra**.
> - **Comprador** (`container.ts:509`): `root.append(head, fechar, this.lojaCompra()); return;` —
>   a lista é o ÚNICO corpo do painel, então item além do corte fica **impossível de comprar**.
> - **Criador:** `.loja-precos` entra no MEIO da pilha de irmãos (`container.ts:531-578`) sem teto
>   de altura → empurra divisor, **MOCHILA** e hotbar pra fora do painel.
> - **Fix:** `.loja-precos { max-height: 30%; overflow-y: auto; }` (copia o padrão do `.cont-bau`,
>   que usa `max-height` justamente pra escapar da armadilha do `min-height: auto` do flex item) e
>   `.loja-compra { flex: 1 1 auto; min-height: 0; overflow-y: auto; }` — o **`min-height: 0` é
>   OBRIGATÓRIO**, sem ele o flex item não encolhe abaixo do conteúdo e o `overflow-y` nunca vira
>   barra. Verificar no tablet (84vh corta mais cedo).
> - Isto também resolve metade da queixa de "layout aglomerado" do bug-663.

> ### 🚀 PRÓXIMA QUEST
> **Consertar bug-663 + bug-664 juntos** — mesmo arquivo (`client/src/container.ts` +
> `client/index.html`), mesmo painel, e o 664 já derruba metade do "aglomerado" do 663.
> Ordem sugerida:
> 1. Rodar a repro ESC-vs-botão do bug-663 (confirma a causa antes de tocar em código).
> 2. Flush do edit pendente como PRIMEIRA linha de `fecharSemAvisar()`
>    (`.loja-preco-input:focus`→`blur()`), antes de `this.pos = null`; e o mesmo flush antes do
>    `replaceChildren()` em `render()`.
> 3. Listar as linhas de preço de `this.loja.precos` UNIDO com os ids do estoque.
> 4. CSS do bug-664 (`.loja-precos` e `.loja-compra`) + respiro entre estoque e preços.
> 5. `npm run verify` (agora encadeia `check:launchers → typecheck → test → build → check:dist`).
>
> bug-662 (cama) é trabalho SEPARADO — mexe em `blocks.ts`/`rules.ts`/`drops.ts` e exige decidir
> a identidade das metades; não misturar com a sessão de UI.
>
> **Pendências desta sessão:**
> - `npm install` não rodado no clone WSL após o pull (lock mudou).
> - Nada commitado ainda: `.wolf/buglog.json`, `.wolf/memory.md`, `.wolf/cerebrum.md`, `.wolf/STATUS.md`.
> - Os 3 bugs foram achados por LEITURA de código, sem repro executada em nenhum deles.
>
> **Pendências herdadas, nenhuma bloqueante:**
> - Scripts de puppeteer (`bench:headless`, `shots:*`, `openwolf designqc`) precisam baixar Chrome
>   de novo no Windows — `~/.cache/puppeteer` confirmado VAZIO lá, download não testado ainda.
> - **Decisão do usuário, não tomada:** por quanto tempo manter a cópia WSL como backup antes de
>   apagar. **Não apagar sem perguntar de novo.**
> - 3ª pessoa é v1 funcional, não polida — distância/ângulo fixos, sem teste em aula real.
> - Uniforme/skin por escola de verdade (cor/textura VISÍVEL na partida) — não começado; a
>   ferramenta de preview existe, mas nada liga ela ao jogo. Falta decidir onde mora a associação
>   aluno↔escola.
> - Cross-school networking e mini-campeonato seguem adiados.
> - Aviso de Dimas nova ao professor fica barulhento em turma cheia — `todo.md` § Loja.
> - Mintar Dimas de graça criando nome novo — hoje só avisa, não impede.
> - Votação da turma: falta decidir QUANTO de Dimas cada aluno recebe ao entrar.
> - bug-651 (não sair da cama) e bug-652 (pular+colocar bloco teleporta pro lado) — abertos, só
>   lidos, não investigados. **bug-651 pode ter parentesco com o bug-662** (mesma família de
>   cama/par); olhar os dois juntos quando chegar a vez.
> - bug-650: confirmar em aula real com turma cheia (só localhost até agora).
> - bug-661: fechado sem repro (singleplayer pelo launcher) — reabrir só se voltar.
>
> Fila do `todo.md`: ovelha+lã de verdade (§🍖 F8), sentar na cadeira, Ferramentas v2
> (durabilidade+slot+tempo de quebra).

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

## 🌐 Rede: WSL invisível na LAN (OBSOLETO — dev saiu do WSL em 2026-09-06, ver HANDOFF)

> Todo o problema abaixo (WSL atrás de NAT, invisível pro resto da LAN) só existe quando o
> HOST roda dentro do WSL. Com o dev migrado pra Windows nativo, hospedar a partir de lá não
> tem NAT nenhum no meio — o `.wslconfig`/regras de firewall documentados aqui não são mais
> necessários pro caso comum. Fica só como referência histórica / caminho B se algum dia
> voltar a hospedar de dentro do WSL.

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

- `docs/projeto.txt` — proposta pedagógica completa (BNCC, fundamentação, indicadores seção 14).
- `.wolf/cerebrum.md` — Decision Log com o PORQUÊ de cada escolha.
- `.wolf/anatomy.md` — índice de arquivos.
