# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.

> ## 🧭 HANDOFF — SESSÃO 95 (2026-09-03) · Corpo do jogador, 3ª pessoa, menu de emojis

> **Bateria verde:** typecheck 3/3 · **979/979** · build · `checar-launchers`/`checar-dist` OK.
> **NADA desta sessão foi commitado ainda** (regra do sistema: só commito se o usuário pedir) —
> tudo abaixo é mudança em working tree, esperando o próximo passo do usuário (commitar? seguir
> pro uniforme/skin de verdade? testar em aula?).

> ### ✅ bug-660 fechado — Ctrl+C no `.bat` pulava input e continuava a lógica
> Causa é do PRÓPRIO cmd.exe (bat não tem trap de SIGINT), não do código — não dá pra
> "consertar" Ctrl+C de dentro do `.bat`. Mitigado: `"sair"`/`"0"` viram saída GARANTIDA no
> prompt de update e no menu principal (`exit /b 0`), com REM documentando a causa raiz.

> ### ✅ bug-661 fechado sem patch — singleplayer via launcher
> Relato de um professor (versão provavelmente desatualizada); usuário testou Linux+Windows
> atualizados e funcionou nos dois. Sem reprodução, sem causa confirmada — fechado como
> ambiente/versão específica, não bug de código. Plano de repro documentado no buglog se voltar.

> ### ✅ Corpo do jogador — de box liso pra 5 partes articuladas, com andar/correr/gestos
> `client/src/playerBody.ts` (NOVO — geometria + animação extraídas de `remotePlayers.ts` pra
> serem compartilhadas com o jogador LOCAL). Pivôs de verdade no quadril/ombro (gira na JUNTA).
> Andar/correr: fase avança por DISTÂNCIA (não tempo), amplitude suavizada, marcha
> contralateral. `ferramentas/editor-skin.html` (NOVO) — preview zero-build de cor/textura por
> peça, formas em espelho manual das mesmas constantes.

> ### ✅ Gestos visuais — bater/interagir E o menu de emojis, mesmo mecanismo
> Protocolo novo `gesto`/`emote` (`shared/src/protocol.ts`) — nem `atacar()` nem `use_block`
> avisavam os OUTROS jogadores da ação (só o autor recebia resposta). Agora broadcasta pra
> turma inteira, mesmo quando o efeito de jogo é recusado (pvp desligado ainda balança o braço).
> **Menu radial (tecla V, `client/src/emojiWheel.ts`, NOVO):** 3 emojis (aceno/comemorar/dança),
> regra nova `emogis` (padrão DESLIGADA, `/regra emogis ligar` — mesmo padrão genérico de
> fome/pvp). Decisão: mundo de AULA não bloqueia (sem efeito de jogo, ao contrário do pvp).

> ### ✅ Câmera em 3ª pessoa — persistente (tecla C) E temporária (durante o emoji)
> `client/src/main.ts`. Corpo do PRÓPRIO jogador só existe/aparece fora da 1ª pessoa (custo
> zero no caminho normal). **Mira/quebrar/colocar/atacar sempre do OLHO**, nunca da câmera —
> garantido reposicionando a câmera de 3ª pessoa por ÚLTIMO no loop de frame, depois de toda
> lógica que já lia `camera.position`. Clique de ação em 3ª pessoa PERSISTENTE não age, só
> volta pra 1ª pessoa sozinho (igual F5 do Minecraft); durante o gesto do emoji o clique nem
> conta. Colisão de câmera reusa `raycastBlock` (mesmo da mira). Verificado ponta a ponta com
> Chrome headless real: C, V, clique no emoji, lockout de ação — tudo confirmado, 0 exceção.

> ### ✅ Correções de direção + cabeça olha pro alvo (achado jogando de verdade, 2 rodadas)
> Comemorar ia pras COSTAS e aceno levava a "mão" até a boca — sinais errados nos gestos, agora
> apontam pra FRENTE de verdade. Cabeça ganhou pivô próprio no pescoço e olha pro pitch de quem
> mira, com limite de ~49° (imita o pescoço) — **sem inversão de sinal** (`rotation.x =
> pitchAtual` direto). Um teste isolado (HTML solto, corpo recriado à mão) tinha indicado sinal
> invertido; o jogo de verdade mostrou o contrário, e foi o usuário jogando quem pegou o erro.
> Lição registrada no Key Learning: teste isolado que recria a cena à mão vale menos que rodar
> o código real — prefira bot+Chrome headless DENTRO do jogo quando der.

> ### 🚀 PRÓXIMA QUEST
> **Decisão imediata do usuário:** commitar esta sessão (nada foi commitado ainda), ou seguir
> direto pro próximo pedaço?
>
> **Pendências desta sessão, nenhuma bloqueante:**
> - 3ª pessoa é v1 funcional, não polida — distância/ângulo fixos, sem teste em aula real ainda.
> - Uniforme/skin por escola de verdade (cor/textura VISÍVEL na partida) — ainda não começado;
>   a ferramenta de preview existe, mas nada liga ela ao jogo. Falta decidir onde mora a
>   associação aluno↔escola.
> - Ideias de animação anotadas, não pedidas: nadar, agachado/sneak, idle sutil, tomar dano.
> - Cross-school networking e mini-campeonato (a ideia ORIGINAL que trouxe tudo isso) seguem
>   adiados — usuário só confirmou "esse PC pode virar servidor", nada desenhado ainda.
>
> **Pendências herdadas, nenhuma bloqueante:**
> - Aviso de Dimas nova ao professor fica barulhento em troca de turma cheia — `todo.md` § Loja.
> - Mintar Dimas de graça criando nome novo — hoje só avisa, não impede.
> - Votação da turma: só falta decidir QUANTO de Dimas cada aluno recebe ao entrar.
> - bug-651 (não sair da cama) e bug-652 (pular+colocar bloco teleporta pro lado) — abertos,
>   só lidos, não investigados a fundo.
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
