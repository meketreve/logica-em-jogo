# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.

> ## 🧭 HANDOFF — SESSÃO 98 (2026-09-12) · Loja consertada (bug-663 + bug-664), sonda nova

> **Rodou no clone `/mnt/SSD/git-projeto/logica-em-jogo` (Linux nativo, `node_modules` do
> Windows).** Sincronizado com `pull --ff-only` em `6322ea3` no começo. Pra rodar
> tsc/build/vitest aqui foi preciso COPIAR os 3 binários nativos linux pro `node_modules`
> (receita no cerebrum, Key Learnings 2026-09-12) — **não rodar `npm install` nesse clone.**

> **✅ Concluído nesta sessão (commitado + pushado na main):**
> - **bug-663 (preço não salvava)** — `client/src/container.ts`: flush dos preços pendentes em
>   `fechar()` ANTES do `fechar_container`; `render()` virou casca de `desenhar()` que preserva
>   foco/valor/cursor do campo em edição + rolagem das listas, com trava `redesenhando` (o Chrome
>   DISPARA `change` no campo que sai do DOM — a nota antiga dizia o contrário); campo de preço
>   `type=text inputmode=numeric`; lista de preços = estoque ∪ `loja.precos` ("sem estoque").
> - **bug-664 (loja não rolava)** — `client/index.html`: `.loja-compra` e `.loja-precos` rolam;
>   `.loja-precos` racha a sobra com a mochila (`flex: 1 1 0`, piso 124px);
>   `#container .inv-mochila` com piso de 2 fileiras; linhas viraram cartão.
> - **`scripts/loja-shot.mjs` + `npm run shots:loja`** — host real + Chrome/CDP, 7 cenas com
>   asserção (criador, re-render no meio da digitação, ESC no último campo, sem estoque,
>   comprador de outro aluno, baú/fornalha comuns). A/B contra o código velho: 9 falhas → 0.
>   Verde em 1024×600 e 1366×768. `npm run verify` verde (979 testes).
> - Changelog: bloco novo no topo ("Loja arrumada…"); o do corpo ganhou `data: "03–06/09/2026"`.

> ### 🚀 PRÓXIMA QUEST
> **bug-662 — cama encostada em cama duplica** (causa por leitura, repro não rodada).
> `camaRule` (`shared/src/rules.ts:74`) acha o par só por "vizinho no eixo tem o MESMO id?", e as
> duas metades gravam o mesmo id (`CamaXP..CamaZN`, `blocks.ts:96`) → duas camas em fila viram
> corrente; `drops.ts:53` dropa cama inteira por METADE. **Decisão a tomar antes de codar:** ids
> distintos de PÉ e CABECEIRA (como a porta) vs bit de paridade — só então `drops` pode dropar
> por PAR. `place_block` (`session.ts:1137`) também não barra vizinho que já é metade de outra
> cama. **bug-651 (não sair da cama) pode ser da mesma família** — olhar junto.

> **⚠️ Não verificado em tela pelo usuário:** o conserto da loja só foi visto no headless. Testar
> na escola: digitar preço no último item e fechar com Esc; loja com muitos itens no tablet.

> **Pendências herdadas, nenhuma bloqueante:**
> - `scripts/f10-shot.mjs` quebrado ("botão ▣ não encontrado" no passo 3) — causa provável:
>   rótulo do botão muda com o item na mão ("colocar"/"interagir"). Não investigado.
> - Scripts de puppeteer no Windows precisam baixar Chrome (`~/.cache/puppeteer` vazio lá).
> - **Decisão do usuário, não tomada:** por quanto tempo manter a cópia WSL como backup antes de
>   apagar. **Não apagar sem perguntar de novo.**
> - 3ª pessoa é v1 funcional, não polida — distância/ângulo fixos, sem teste em aula real.
> - Uniforme/skin por escola de verdade — não começado; falta decidir onde mora a associação
>   aluno↔escola.
> - Cross-school networking e mini-campeonato seguem adiados.
> - Aviso de Dimas nova ao professor fica barulhento em turma cheia — `todo.md` § Loja.
> - Mintar Dimas de graça criando nome novo — hoje só avisa, não impede.
> - Votação da turma: falta decidir QUANTO de Dimas cada aluno recebe ao entrar.
> - bug-652 (pular+colocar bloco teleporta pro lado) — aberto, só lido.
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
