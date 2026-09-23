# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.

> ## 🧭 HANDOFF — SESSÃO 101 (2026-09-22/23)

> **Árvore:** limpa, `HEAD` = `origin/main` (este handoff é o commit do topo). Único arquivo solto:
> `relatorio/…docx:Zone.Identifier`, do usuário — **NÃO commitar**.
>
> **Ambiente:** só LINUX (o dev formatou o PC; a cópia do WSL não existe mais). O
> `node_modules` deste clone é o híbrido da sessão 98 (esbuild `win32-x64` + nativos linux
> copiados por cima) e **funciona**. Um `npm install` limpo seria legítimo; ninguém pediu.

> **✅ Nesta sessão (tudo pushado):**
> - **[[bug-672]] — tablet minimizado prendia o nome do aluno** (`3a1e9d0`). Minimizar/fechar o
>   navegador no tablet congela a aba SEM fechar o TCP; o servidor só tirava alguém de `players`
>   no `close` do socket, e o `join` recusa nome repetido — a criança ficava trancada do lado de
>   fora. **Heartbeat de aplicação** em `shared/src/session/presenca.ts`: `ping` a cada 4 s,
>   qualquer mensagem de volta conta como vida, 15 s de silêncio derruba (libera o nome) e o
>   hospedeiro fecha/`terminate` o socket pelo `aoDerrubar`. **Não é o ping do WebSocket** —
>   aquele é respondido pela pilha de rede com a aba congelada, que é o caso a pegar.
>   Singleplayer fica de fora. Cliente responde no TRANSPORTE (`connection.ts`), fecha no
>   `pagehide` e explica o código 4000. Smoke novo `presenca` (lento: espera os 15 s de verdade);
>   os 16 cenários/sondas de socket cru passaram a responder ping.
> - **[[bug-671]] — a loja recusava preço de ITEM** (`1ccda8c`). `definir_preco` e
>   `parsePrecoEntry` validavam com `id <= MAX_BLOCK_ID` (250), e todo item começa em 900: pão,
>   trigo, picareta, carvão e as culturas voltavam "Item inválido.". A metade escondida era o
>   PARSE DO SAVE — o preço sumiria ao reabrir o mundo. Predicado único `podeEstarNaMochila`
>   (blocks.ts) nas DUAS pontas. Passo 7b novo na sonda `npm run shots:loja`.
> - **OpenWolf desmontado** (`887c24a`, `8cef404`): de 2,1 MB em 33 arquivos pra 508 KB em 3.
>   Ficaram STATUS + cerebrum + buglog (podado de 324 pra 176: o resto era detector automático).
>   Saíram os 12 hooks, o `anatomy.md`, o `memory.md` e os docs de skill. **Não existe mais
>   hook nenhum** — quem manda ler estes arquivos é o `CLAUDE.md` da raiz, reescrito.
>   Achar código é com `grep`. Ver Decision Log 2026-09-22.
> - **Changelog:** o bloco do topo (build atual, ainda NÃO publicado pra escola) fechou com os
>   três assuntos: quebra com tempo/rachadura/durabilidade, o heartbeat e o preço de item.
>   Título = "Quebrar bloco agora leva tempo — e a ferramenta gasta".

> **Sessão 100 (2026-09-17), resumida:** §🔨 **Ferramentas v2** inteira — segurar pra quebrar com
> rachadura no bloco, tempo por (bloco × ferramenta), ferramenta exigida na MÃO, durabilidade com
> barra de vida no slot, e a ferramenta some quando acaba. Servidor conta o tempo
> (`session/quebra.ts`), cliente só prevê pra desenhar. Bugs 667-670 no caminho. Detalhe completo:
> `git log a7757ae..485d035` e o Decision Log de 2026-09-17.

> ### 🚀 PRÓXIMA QUEST
> **Machado e pá** — é o que o tempo de quebra destravou, e o `ferramentaIdealDe` já é o gancho:
> madeira ganha `"machado"` e terra/areia ganham `"pá"` **sem virarem obrigatórios** (exigir
> machado pra tirar madeira seria um mundo onde ninguém começa — a razão está escrita no
> cabeçalho do `ferramentas.ts`). São ids, ícones e receitas novos + `TipoFerramenta` deixando
> de ser só `"picareta"`.
>
> Atrás dela: o **1º bloco de circuito lógico** (ainda falta o usuário dizer QUAL bloco e como
> ele funciona na aula) e o `npm run bench:headless` antes/depois dos 16 bits.

> **⚠️ NADA disto foi visto em tela pelo usuário — testar na escola:**
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
>
> Fila do `todo.md` depois da quest atual: machado e pá (destravados pelo tempo de quebra),
> ovelha+lã de verdade (§🍖 F8), sentar na cadeira.

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
