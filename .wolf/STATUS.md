# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.

> ## 🧭 HANDOFF — SESSÃO 98 (2026-09-12) · Loja (663/664), cama (662) e porta empilhada (665) consertadas

> **Rodou no clone `/mnt/SSD/git-projeto/logica-em-jogo` (Linux nativo, `node_modules` do
> Windows).** Pra rodar tsc/build/vitest aqui foram COPIADOS os 3 binários nativos linux pro
> `node_modules` (receita no cerebrum) — **não rodar `npm install` nesse clone.** Push daqui
> funciona via `~/.local/bin/gh` (login feito, `gh auth setup-git`). No Windows: `git pull`.

> **✅ Concluído nesta sessão (tudo pushado na main):**
> - **bug-663 (preço da loja não salvava)** e **bug-664 (loja não rolava)** — `db44ed9`.
>   `client/src/container.ts` + `client/index.html`; sonda `npm run shots:loja` (A/B 9 → 0).
> - **bug-662 (cama em fila duplicava / cama do meio sem travesseiro)** — ids próprios de
>   CABECEIRA `CamaCabecaXP..ZN` = **247-250** (escolha do usuário); `CamaXP..ZN` = só o pé.
>   `camaRule` exige par de papel oposto; mesher decide pelo id; `/bloco` e `/regiao
>   encher|sortear` recusam cama. **Migração** `shared/src/camas.ts` (`migrarCamasLegado`) roda
>   em todo restore, idempotente sem marcador. Testes: repro (volta 2 camas), 6 de migração,
>   recusa por comando — 989 verdes. Visto no cliente real: save ANTIGO com par + corrente de 4
>   + corrente de 3 abre com 1+2+1 camas, todas com travesseiro.
> - **bug-665 (porta empilhada duplicava e o toggle desmanchava as duas)** — SEM id novo: par por
>   POSIÇÃO a partir da base da pilha (`parDaPorta`/`doorRule` em `rules.ts`, toggle do
>   `use_block` usa a mesma função). 2 repros de sessão + 5 testes puros; 996 verdes.
> - **Plano dos ids em 16 bits anotado:** `docs/superpowers/plans/2026-09-12-ids-16-bits.md`
>   (+ entrada no `todo.md` § Geração de mundo / performance).

> ### 🚀 PRÓXIMA QUEST
> **Ids de bloco em 16 bits — o plano está pronto, falta o SIM do usuário.** Ler
> `docs/superpowers/plans/2026-09-12-ids-16-bits.md` e abrir a sessão perguntando se ele topa a
> Opção A (chunk `Uint16Array` na memória, gravado/enviado estreito quando dá; bloco < 900 porque
> os itens começam em 900). Sobram só **5 ids livres (251-255)** — os circuitos lógicos esbarram
> nisso. Se ele preferir outra coisa: **bug-651 (não sai da cama)** — pedido dele é PULAR deitado
> levantar; hoje só acorda saindo da célula por `move` (`dormir.ts:acordarSeSaiu`).

> **⚠️ Não verificado em tela pelo usuário:** loja e cama só foram vistas no headless. Testar na
> escola: preço no último item + Esc; loja cheia no tablet; 2 camas em fila, e um mundo antigo
> que já tinha cama (tem de abrir com as camas inteiras); porta em cima de porta (abrir a de baixo).

> **Pendências herdadas, nenhuma bloqueante:**
> - `scripts/f10-shot.mjs` quebrado ("botão ▣ não encontrado") — causa provável: rótulo do
>   botão muda com o item na mão ("colocar"/"interagir"). Não investigado.
> - Scripts de puppeteer no Windows precisam baixar Chrome (`~/.cache/puppeteer` vazio lá).
> - **Decisão do usuário, não tomada:** por quanto tempo manter a cópia WSL como backup antes de
>   apagar. **Não apagar sem perguntar de novo.**
> - 3ª pessoa é v1 funcional, não polida — distância/ângulo fixos, sem teste em aula real.
> - Uniforme/skin por escola de verdade — não começado.
> - Cross-school networking e mini-campeonato seguem adiados.
> - Aviso de Dimas nova ao professor fica barulhento em turma cheia — `todo.md` § Loja.
> - Mintar Dimas de graça criando nome novo — hoje só avisa, não impede.
> - Votação da turma: falta decidir QUANTO de Dimas cada aluno recebe ao entrar.
> - bug-652 (pular+colocar bloco teleporta pro lado) — aberto, só lido.
> - bug-650: confirmar em aula real com turma cheia (só localhost até agora).
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
