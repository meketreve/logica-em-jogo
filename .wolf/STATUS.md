# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.

> ## 🧭 HANDOFF — SESSÃO 102 (2026-09-23)

> **Árvore:** limpa, `HEAD` = `origin/main` (este handoff é o commit do topo). Único arquivo solto:
> `relatorio/…docx:Zone.Identifier`, do usuário — **NÃO commitar**.
>
> **Ambiente:** só LINUX. O `node_modules` deste clone é o híbrido da sessão 98 e **funciona**.

> **✅ Nesta sessão:**
> - **§🪓 MACHADO E PÁ** — a quest que o tempo de quebra tinha destravado. 8 ids novos
>   (923–930), 8 receitas, 8 ícones com silhueta própria, e `TipoFerramenta` deixou de ser só
>   `"picareta"`. **Nenhum dos dois é obrigatório:** a grande mudança de desenho é que EXIGIR
>   (quem barra a quebra) e ACELERAR (quem corta o tempo) viraram DUAS tabelas — o
>   `ferramentaIdealDe` era um apelido do `exigenciaDe` e agora tem o `IDEAL_DIRETO` dele, com as
>   mesmas derivações de família (laje/escada pelo material, porta, móvel, quadro). Portão de
>   teste varre todo id do jogo e falha se algo passar a exigir machado ou pá.
> - **A madeira ganhou dureza própria** (tronco 1500 ms, madeira trabalhada 1000 ms), escolhida
>   pelo usuário entre três réguas — sem ela os 4 níveis de machado empatariam no piso de 150 ms.
>   **Preço:** derrubar árvore de mão nua dobrou de tempo (era 750 ms); o machado de madeira
>   devolve exatamente o tempo de antes. É o número mais provável de precisar de ajuste depois
>   da 1ª aula, e ele mora numa linha só do `DUREZA` em `shared/src/ferramentas.ts`.
> - **Durabilidade é do MATERIAL** (machado, pá e picareta de pedra = 131), e o
>   `gastarDurabilidade` do servidor **não mudou uma linha**: ele já perguntava "esta é a
>   ferramenta IDEAL deste bloco?", então o machado passou a gastar na madeira e a pá na terra de
>   graça.
> - **Prova:** `shared/src/machado-pa.test.ts` (22 testes, 3 deles pelo FIO, com sessão de
>   verdade) + passos **6 e 7 novos** na sonda `npm run shots:quebra`, que medem no Chrome real o
>   nome na barra, o ícone desenhado, o tronco caindo em ~910 ms com machado contra ~1590 ms sem,
>   e a barra de vida nascendo no slot das duas ferramentas novas.
> - **Changelog:** o bloco do topo (build atual, ainda NÃO publicado pra escola) ganhou as quatro
>   linhas do machado e da pá — inclusive a do tronco mais lento de mão nua, que é a única
>   mudança que a turma pode estranhar.
> - **`todo.md`:** o §🔨 v2 foi marcado como feito (ficara com `[ ]` desde a sessão 100) e o §🪓
>   entrou fechado.

> **Sessão 101, resumida:** heartbeat de presença ([[bug-672]] — tablet minimizado prendia o nome
> do aluno), preço de ITEM na loja ([[bug-671]]) e o desmonte do OpenWolf (ficaram STATUS,
> cerebrum e buglog). Detalhe: `git log 1ccda8c..c5aca06`.

> ### 🚀 PRÓXIMA QUEST
> **O 1º bloco de circuito lógico** — e ele ainda está BLOQUEADO numa pergunta ao usuário: QUAL
> bloco e como ele funciona na aula. É a razão de os ids de 16 bits terem sido feitos.
>
> Atrás dela: `npm run bench:headless` antes/depois dos 16 bits, ovelha+lã de verdade (§🍖 F8) e
> sentar na cadeira.

> **⚠️ NADA disto foi visto em tela pelo usuário — testar na escola:**
> - **§🪓 machado e pá (NOVO):** fabricar os dois na mesa (o machado cobra 3 do material, a pá
>   1 — os dois com 2 gravetos); sentir se derrubar árvore **de mão nua** ficou chato demais pra
>   turma (é o número a afrouxar, se for); ver se o ícone do machado e o da pá se distinguem do
>   da picareta no slot de 1024×600; e conferir que terra e madeira continuam saindo de mão
>   vazia pra quem não fabricou nada.
> - **§🔨 quebra (v2):** segurar pra quebrar no PC e no tablet (o ⛏ virou botão de SEGURAR, e
>   dedo que escorrega solta), se o tempo da pedra parece justo pra turma, se a rachadura
>   aparece no projetor da sala, e se a barrinha de vida no slot é enxergável em 1024×600.
> - **Presença (bug-672):** fechar o navegador do tablet e entrar de novo com o mesmo nome; e
>   minimizar por mais de 15 s pra ver o nome liberar. Conferir se 15 s não derruba ninguém no
>   Wi-Fi da escola (é um número só, em `constants.ts`, se precisar afrouxar).
> - **Loja:** preço de ITEM (pão, trigo, picareta), **e reabrir o mundo depois** — era na
>   releitura do save que o preço sumia. Preço no último item + Esc; loja cheia no tablet.
> - **Cama e porta:** 2 camas em fila; um mundo antigo que já tinha cama (tem de abrir com as
>   camas inteiras); porta em cima de porta (abrir a de baixo).
> - **Ids de 16 bits:** abrir o mundo salvo da turma no host (tem de aparecer
>   `<nome>.antes-ids16.ljw` na pasta) e um mundo do singleplayer num navegador que já jogava.
> - **Cama/torre:** deitar (de perto e de longe) e levantar com o pular, no PC e no tablet;
>   torre de pular+colocar no Wi-Fi da escola (é onde a latência do bug-652 aparece de verdade).

> **Pendências herdadas, nenhuma bloqueante:**
> - **Save no Ctrl+C/fechar janela disputa corrida com o `npx`/`tsx` que embrulha o host** (o sinal
>   vai pro grupo). Hoje ganha com folga (~6 ms de encode), mas é frágil — ver [[bug-666]]. Conserto
>   de verdade: o host não depender do wrapper sobreviver (ex.: launcher chamar `node` direto).
> - Singleplayer: o backup `dataAntesIds16` existe mas o menu não oferece restaurar.
> - `scripts/f10-shot.mjs` quebrado ("botão ▣ não encontrado") — causa provável: rótulo do
>   botão muda com o item na mão ("colocar"/"interagir"). Não investigado.
> - Scripts de puppeteer no Windows precisam baixar Chrome (`~/.cache/puppeteer` vazio lá).
> - 3ª pessoa é v1 funcional, não polida — distância/ângulo fixos, sem teste em aula real.
> - Uniforme/skin por escola de verdade — não começado.
> - Cross-school networking e mini-campeonato seguem adiados.
> - Aviso de Dimas nova ao professor fica barulhento em turma cheia — `todo.md` § Loja.
> - Mintar Dimas de graça criando nome novo — hoje só avisa, não impede.
> - Votação da turma: falta decidir QUANTO de Dimas cada aluno recebe ao entrar.
> - bug-650: confirmar em aula real com turma cheia (só localhost até agora).

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
npm run shots:loja       # loja: preços (inclusive de ITEM), rolagem, baú e fornalha
npm run shots:quebra     # §🔨 v2: rachadura cresce, soltar cancela, barra de vida encolhe
```

As sondas `shots:*` sobem um host de verdade e um Chrome de verdade, e **asseveram no DOM** —
não são só print. Rode `npm run build` antes: elas servem o cliente COMPILADO.

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
- `.wolf/buglog.json` — bugs já consertados, com causa raiz (leia antes de caçar um).

> **2026-09-22:** o OpenWolf foi desmontado — sobraram estes três arquivos (STATUS, cerebrum,
> buglog) e nenhum hook. O índice `anatomy.md` saiu junto: achar código é com `grep`. O
> `CLAUDE.md` da raiz é quem manda ler isto agora. Ver Decision Log 2026-09-22.
