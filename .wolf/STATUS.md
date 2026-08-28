# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.

> **Nota lateral (2026-08-27, fora da fila de código):** `relatorio/apresentacao-cre.html`
> (deck de 20 slides pra CRE) foi revisado — mesclou os 2 slides de resultado/engajamento
> que repetiam o mesmo achado, corrigiu números velhos (358→936 testes, 6→7 aulas — a
> corrida entrou na tabela) e ganhou um slide novo (14): uso real **fora do piloto**, outra
> professora (Geografia, 2º ano) usando cultivo/fabricação já existentes pra ensinar cadeia
> produtiva do algodão e da madeira — prova de campo da tese "a pedagogia mora nos
> cenários" do slide 5. Slide 13 (AEE) ganhou o relato do aluno que passou a digitar pra
> buscar item no craft. Zero código tocado — não mexe na fila de quest abaixo.

> ## 🧭 HANDOFF — SESSÃO 91 (2026-08-27) · comandos anglicismo viram português

> **Bateria verde:** typecheck 3/3 · **936/936** · build · **16/16 smokes** (inclui o de
> `/expulsar`) · `npm run cenarios` 7/7 byte-idênticos · `shots:tablet` verde (exercitou
> `/terreno ligar` de verdade no navegador — proteção liga, botão "amigos" aparece).

> ⚠️ Confira o sha do topo com `rtk proxy git rev-parse --short origin/main`, nunca com um sha
> escrito aqui. **3 commits, EMPURRADOS** (conferido por `ls-remote`, não só ref local):
> `1b87f67` docs(relatorio): revisa o deck da CRE · `a76468d` refactor(comandos): traduz /claim,
> /resetpin, /tpr e /kicar pro português · `b436a83` docs(wolf): registra a sessão 91. Árvore
> limpa. (`origin/main` estava em `9dca2e5` no início da sessão.)
> ⚠️ Pós-push o hook `verify` reconstrói `client/dist`/`build-info.json` com o sha do commit que
> acabou de subir (churn "off-by-one" já conhecido) — descartado com `git checkout -- client/
> dist/ shared/src/build-info.json && git clean -fd client/dist/`, não commitado.

> ### ✅ Entregue — tradução dos comandos de chat (item do `todo.md`, pedido de 2026-08-27)
> Passada a régua em TODOS os comandos existentes (brainstorm com o usuário definiu o mapa
> antes de codar). Maioria já era português e ficou igual; só 4 eram anglicismo:
> `/claim`→**`/terreno`** · `/resetpin`→**`/redefinirpin`** · `/tpr`→**`/tpp`** (`/tpa` ficou,
> já lê como "teleporte aceitar") · `/kicar`→**`/expulsar`**. **Corte na hora, sem alias** —
> decisão do usuário: nome velho vira "comando desconhecido".
> - Tocado: `shared/src/session.ts` (switch + lista de comandos + dicas), `session/equipes.ts` +
>   `session/tp.ts` (textos de uso/erro), `client/src/commands.ts` (autocomplete +
>   painel do dedo, mesma árvore), `players.ts` (botão expulsar), `server/src/index.ts`
>   (`/expulsar` é comando de HOST, fora do `session.ts`), testes que MANDAM o comando de
>   verdade (`claims.test.ts`, `gate-claim.test.ts`, `session.test.ts`, `tp.test.ts`),
>   `scripts/tablet-shots.mjs` e `_smoke-kicar.mjs`.
> - **Decisão de escopo (técnica, não estética):** nomes internos ficaram — `claims.ts`, tipo
>   `Claim`, campo `ses.claims`/`claimsAtivo`. `claims` é chave **persistida no `.ljw`**;
>   trocar quebraria save antigo sem migração, e ninguém pediu isso. Comentário-jargão
>   ("rocha-matriz/claim") também ficou — não é referência a comando.
> - **Registro histórico intocado de propósito:** `.wolf/STATUS.md` (sessões antigas),
>   `cerebrum.md` (Decision Log) e `client/src/changelog.ts` citam os nomes VELHOS porque
>   descrevem o que aconteceu QUANDO o comando ainda se chamava assim — reescrever apagaria
>   o registro do que de fato houve.
> - `todo.md` fechado com o mapa completo e a lista do que mudou/não mudou.

> ### 🚀 PRÓXIMA QUEST
> Nada em aberto da tradução. A fila do `todo.md` manda: **ovelha + lã de verdade** (§🍖 F8 —
> mob, tosa, lã como recurso, destrava cama/noite) · sentar na cadeira · layouts diferentes
> pros controles do mobile · trocar modelo do player pra estilo Minecraft · Ferramentas v2
> (durabilidade + slot selecionado + tempo de quebra — decidir `dano?` no Stack ANTES de codar).
> Se o usuário não escolher, comece pela ovelha — é a que destrava mais coisa.
>
> **Herdado, não urgente:** `mundo-livre.ljw.corrompido-1785704408442` em `mundos/mundo-livre/`
> — sobra de um boot que achou o save inválido e o renomeou; ninguém investigou por quê.

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
