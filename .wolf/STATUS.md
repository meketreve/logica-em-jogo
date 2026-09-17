# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.

> **Última atualização: 2026-09-17 (sessão 100).**
>
> **O dev formatou o PC e agora é SÓ LINUX** (dito pelo usuário). Some a decisão pendente sobre a
> cópia do WSL: não existe mais. O `node_modules` deste clone segue o híbrido da sessão 98
> (esbuild `win32-x64` + nativos linux copiados por cima) e **funciona** — `vitest` responde
> `linux-x64`. Um `npm install` limpo agora seria legítimo; ninguém pediu.

> ## 🧭 HANDOFF — SESSÃO 100 (2026-09-17) · §🔨 Ferramentas v2

> **Árvore no fim da sessão:** 2 commits novos na `main` local (`a7757ae` etapa 1, `485d035`
> etapas 2+3), **AINDA NÃO PUSHADOS** — o usuário não foi perguntado. Também não pushado o
> handoff da sessão 99 (ele foi absorvido nos commits desta). Único arquivo solto:
> `relatorio/…docx:Zone.Identifier`, do usuário, NÃO commitar.

> **✅ Concluído: §🔨 Ferramentas v2, as 3 peças juntas.** As 4 decisões foram do usuário
> (ver Decision Log 2026-09-17). O laço fechou: segurar → rachar → gastar → quebrar.
> - **Etapa 1, pura** (`a7757ae`): `Stack.dano?`, `podeJuntar` (ferramenta nunca funde; pilha
>   igual que não funde TROCA), `DURABILIDADE` 59/131/250/1561, `vidaDe`, `gastar` (devolve
>   `null` = acabou), `tempoDeQuebraMs`/`ticksDeQuebra` sobre DUREZA × fator 2/4/6/8, e
>   `ferramentaIdealDe` separando "o que ACELERA" de "o que é EXIGIDO" ([[bug-669]]).
> - **Etapa 2, servidor** (`485d035`): `shared/src/session/quebra.ts` — `break_start` arma,
>   o tick desconta, **o servidor quebra sozinho**; `break_cancel` desiste. Não existe mensagem
>   de "terminei", então não há cronômetro de cliente pra mentir. Criativo segue em 1 clique.
>   O gate roda no APERTO e no fim. Durabilidade gasta só em bloco que pede a ferramenta.
>   Esforço/fome mudou de lugar ([[bug-668]]).
> - **Etapa 3, cliente**: segurar no mouse e no ⛏ do tablet (virou botão de segurar),
>   `quebraFx.ts` com a trinca procedural ([[bug-667]]: os 10 estágios dividiam um canvas só),
>   barra de vida no slot (hotbar + mochila), som próprio ao quebrar.
> - **Changelog:** bloco NOVO no topo — "Quebrar bloco agora leva tempo — e a ferramenta gasta".
>   O de 12/09 recebeu `data: "12/09/2026"`.
> - **Provas:** 1060 testes verdes (24 + 11 novos), 16/16 smokes, e a sonda real
>   **`npm run shots:quebra`** (`scripts/quebra-shot.mjs`, Chrome + host de verdade) — trinca
>   aparece e cresce, soltar cancela, segurar dá o pedregulho, a barra encolhe, e sem picareta
>   na mão o chat manda pegar uma. Prints em `.wolf/designqc-captures/quebra/`.
> - Os 3 smokes que quebravam bloco foram reescritos pro gesto novo ([[bug-670]]).
> - Gancho de sonda novo: `window.__quebraEstado()` (mesmo precedente do `__fotoApontar`).

> ### 🚀 PRÓXIMA QUEST
> **Machado e pá** — é o que o tempo de quebra destravou, e o `ferramentaIdealDe` já é o gancho:
> madeira ganha `"machado"` e terra/areia ganham `"pá"` **sem virarem obrigatórios** (exigir
> machado pra tirar madeira seria um mundo onde ninguém começa — a razão está escrita no
> cabeçalho do `ferramentas.ts`). São ids, ícones e receitas novos + `TipoFerramenta` deixando
> de ser só `"picareta"`.
>
> Atrás dela: o **1º bloco de circuito lógico** (ainda falta o usuário dizer QUAL bloco e como
> ele funciona na aula) e o `npm run bench:headless` antes/depois dos 16 bits.

> **⚠️ Não verificado em tela pelo usuário (§🔨 v2):** quebrar segurando no PC e no tablet (o ⛏
> virou botão de SEGURAR — dedo que escorrega solta), se o tempo da pedra parece justo pra turma,
> se a rachadura é visível no projetor da sala, e se a barrinha de vida no slot é enxergável num
> tablet de 1024×600. Tudo isso só foi visto no headless.

> **⚠️ Não verificado em tela pelo usuário:** loja e cama só foram vistas no headless. Testar na
> escola: preço no último item + Esc; loja cheia no tablet; 2 camas em fila, e um mundo antigo
> que já tinha cama (tem de abrir com as camas inteiras); porta em cima de porta (abrir a de baixo);
> **abrir o mundo salvo da turma no host** (tem de aparecer `<nome>.antes-ids16.ljw` na pasta dele e
> o mundo abrir igual) e um mundo do singleplayer num navegador que já jogava antes; deitar
> na cama (de perto e de longe) e levantar com o pular, no PC e no tablet; torre de pular+colocar
> no Wi-Fi da escola (é onde a latência que causava o bug-652 aparece de verdade).

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
