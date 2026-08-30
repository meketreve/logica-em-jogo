# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.

> ## 🧭 HANDOFF — SESSÃO 93 (2026-08-30) · README + changelog in-game postos em dia

> **Bateria verde:** typecheck 3/3 · **936/936** · build · portão `checar-launchers` OK.
> ⚠️ Ainda **NÃO commitado nem empurrado** — confira `rtk proxy git rev-parse --short
> origin/main` antes de assumir que subiu (era `0f5a040` no início desta sessão).

> ### ✅ Entregue — README.md documenta o que a sessão 92 tinha deixado sem doc
> Tabela "O que precisa": Node.js só é pré-requisito pra host Linux/macOS/WSL agora — Windows
> baixa sozinho (nota nova na seção Rodar explicando `.node-portatil\`, sem admin, sem instalar
> no sistema). Seção do aluno ganhou os 5 layouts de toque (destro/canhoto/compacto/espalhado/
> direcional) + escala automática.

> ### ✅ Entregue — tela "📜 novidades" (`client/src/changelog.ts`) atualizada
> Estava **2 sessões atrasada**: faltavam os 5 layouts de toque, o Node portátil no launcher E a
> tradução de comandos (`/claim`→`/terreno`, `/resetpin`→`/redefinirpin`, `/tpr`→`/tpp`,
> `/kicar`→`/expulsar`, sessão 91) — nenhuma tinha entrado no registro que aluno/professor vê
> dentro do jogo. 3 blocos novos + `data` fixa no que antes era "atual" (`Silêncio, por favor`,
> agora 27/08/2026). Datas conferidas por `git show -s --format=%ai <sha>`, não chutadas.

> ### ⚠️ Aprendido — `npx openwolf scan` ≠ `openwolf scan`
> `npx` baixou `openwolf@2.5.1` (registro) em vez de usar o `2.0.1` já instalado (pnpm global,
> no PATH) — a versão baixada excluía `.claude/` inteiro, anatomy.md caiu de 365 pra 238
> arquivos. Revertido e re-rodado com o binário certo (`openwolf scan`, sem `npx`) → 365, diff
> mínimo (só os 2 arquivos tocados nesta sessão). Registrado no `cerebrum.md` Do-Not-Repeat:
> **nunca `npx openwolf`.**

> ### 🚀 PRÓXIMA QUEST
> **Passo imediato desta sessão:** commit + push do que está pendente (README.md, changelog.ts,
> anatomy.md/anatomy-index.json, client/dist, shared/src/build-info.json, cerebrum.md,
> memory.md) — o usuário já pediu, só falta executar.

> **Depois — prioridade fora do código:** testar o `iniciar-servidor.bat` num PC real da
> escola — baixa/extrai o Node, sobe o servidor sem instalar nada à mão. É o motivo do launcher
> novo existir; ainda não foi provado em máquina real.
>
> Fila do `todo.md` (6 itens abertos): **ovelha + lã de verdade** (§🍖 F8 — mob, tosa, lã como
> recurso, destrava cama/noite, a que destrava mais coisa) · sentar na cadeira · trocar modelo do
> player pra estilo Minecraft · Ferramentas v2 (durabilidade + slot selecionado + tempo de
> quebra — decidir `dano?` no Stack ANTES de codar).
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
