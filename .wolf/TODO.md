# TODO — logica-em-jogo

> Working checklist. **STATUS.md** = handoff ("why & where we are"); **TODO.md** = "what's left to do".
> Keep items actionable and short. Check off with `[x]`; sweep done items into STATUS.md ✅ when a phase closes.
> Last updated: 2026-08-04 (sessão 40 — §🍖 F6 comida + §🏁 mapa de corrida FEITOS: fruta da folha, plantação de 4
> estágios, pão, e a fome voltou a MATAR. Próxima frente: F7 /pvp. Ver STATUS 🚀)

---

## 🔥 Now (this session)

<!-- Vazio: a sessão 40 fechou o §🍖 F6 (comida), o §🏁 mapa de corrida (aula7) e, de
     tabela, os dois pendentes que sobravam — o capim flutuante (bug-558) e o print do
     painel de craft do F5. Tudo varrido pro STATUS ✅ e commitado.
     Próxima sessão: §🍖 F7 /pvp (~0,5 sessão) ou o PLAYTEST (que já acumula F1..F6 + a
     corrida — ver 🏫). -->

- [x] **§🏁 MAPA DE CORRIDA** (sessão 40, pedido do usuário) — `aula7-corrida.ljw`: 4 postos
      `chegar` em modo sequencial, pista em U com escada, vão com ponte, ziguezague e
      serpentina. `um` nos 3 primeiros, **`todos` na chegada**. Verificador próprio (BFS +
      aluna que corre) é o portão. Detalhe no STATUS ✅.

## ⏭️ Next

- [x] **Vegetação precisa de bloco de apoio** (sessão 40, bug-558) — `GramaAlta`/`Seca`/`Fria`
      (179–181) entraram no `rulesMap` apontando pro `torchRule`, e a plantação do F6 junto.
      A varredura pedida foi feita: **`precisaApoio()` e o `rulesMap` batem** agora. De quebra,
      o `torchRule` deixou de chamar `isFullCube` direto e passou por `apoioValido(id, abaixo)`
      — a MESMA função do gate do `place_block`, pra não existir colocação que evapora no tick.

- [x] **§🍖 F5 — craft por LISTA** (sessão 39) — `shared/src/receitas.ts` puro, `fabricar`
      tudo-ou-nada, painel do E com abas mochila/criar e "falta N" em vermelho. 11 receitas
      (madeira + pedra + balde). Servidor valida/aplica; cliente pede por índice. Detalhe no
      STATUS ✅. **Print do painel pendente (chrome ausente na máquina), playtest pendente.**

- [x] **O balde virou item de mochila** (sessão 39, escopo escolhido pelo usuário) — receita
      `3 ferro → balde vazio`, o `case balde` da session integrou survival (confere o item no
      slot ANTES de mexer na água, troca vazio↔cheio in-place por `definirSlot`), e o ramo do
      `main.ts` saiu do guarda `mochila.ativa`. Fechou o pendente do F4.

- [x] **🖼️ HANDOFF do Chrome — RESOLVIDO na máquina de casa** (sessão 40). O usuário
      confirmou: *"não tem o chrome no not, aqui tem"* — o cache
      `~/.cache/puppeteer/chrome` tem duas versões nesta máquina, e `shots:craft` rodou
      (`linhas=12 · habilitadas=3 · marcas 'falta'=9`). **O print do painel de craft, pendente
      do F5, está tirado e conferido.** ⚠️ **No NOTEBOOK o cache continua vazio** — lá os
      scripts de print seguem saindo com "Chrome não encontrado", e a receita de instalação é
      a de sempre: `npx -y @puppeteer/browsers install chrome@stable`, ou `CHROME=/caminho`
      apontando pra um Chrome do sistema.

- [x] **§🍖 F6 — comida** (sessão 40, escopo GRANDE escolhido pelo usuário). `comida.ts` puro,
      plantação de 4 estágios que cresce por PULSO (fora do `rulesMap` de propósito), fruta
      caindo da folha, `comer {slot}` no clique direito, pão (receita 11) e
      **`VIDA_MINIMA_POR_FOME` 6 → 0: a fome voltou a matar.** Detalhe no STATUS ✅.
      **Playtest pendente** — ver 🏫.

## 🏫 Na escola (o usuário faz lá)

- [ ] **PLAYTEST DA SOBREVIVÊNCIA (F1+F2+F3+F4+F5)** — entrar com `/modo sobrevivencia all` (ou `eu`).
      **Do F5 (craft), o que só o dedo responde:** o painel do E tem abas **mochila/criar** — a
      troca de aba é óbvia? Na aba "criar", **tocar na linha da receita fabrica** (a linha inteira
      é o botão) — o alvo dá pro dedo no tablet? O "falta N" em vermelho comunica o que falta sem
      texto? A receita desabilitada (cinza) lê como "não dá agora"? O filtro de texto vale a pena
      numa lista de 11, ou atrapalha? **O balde agora funciona em survival** (craftar `3 ferro →
      balde`, encher numa fonte, despejar) — a troca vazio↔cheio no MESMO slot parece natural?
      **Do F4:** o painel "mochila" com o gesto **tocar no item, tocar no destino** (não arrastar)
      — funciona no tablet? A contagem no canto do slot é legível? Os 9 slots por linha cabem em
      RETRATO? Começar de mãos vazias frustra, ou o `/dar all <id> <qtd>` resolve a aula?
      **Mochila cheia RECUSA a quebra** — isso lê como cuidado ou como bug? (aviso no chat, no
      máximo 1 a cada 5 s).
      Morrer de queda é justo (dói a partir de 4 blocos, mata em 23)? 15 s de ar é pouco?
      **A fome desce rápido demais?** (400 blocos andados OU 200 construídos = 1 ponto; a mira é
      a barra inteira em ~50 min de aula ativa — é o número mais provável de mudar). A fome
      parar em 3 corações parece cuidado ou parece bug (`VIDA_MINIMA_POR_FOME`, deliberado até
      o F6)? **Corações/coxas/bolhas no TABLET** — 96px acima do rodapé, agora com uma barra a
      mais, e podem brigar com a hotbar de toque, que ninguém olhou. A vinheta vermelha de dano
      incomoda? Voltar ao spawn ao
      morrer atrapalha em mundo grande (aí "cama = ponto de renascer" é feature nova)?
      ⚠️ A altura da queda vem de amostras a 10 Hz e erra PRA MENOS — "caí de 10 e não doeu" é
      a tolerância documentada, não bug.

- [x] **PLAYTEST do RELEVO POR BIOMA** (sessão 33) e **PLAYTEST da LUZ e das CAVERNAS**
      (sessão 32) — o usuário declarou os dois FEITOS em 2026-08-02 e **não pediu ajuste
      nenhum**. Os botões seguem documentados caso mude de ideia: `BIOMAS.*.relevo`,
      `SNOW_HEIGHT`, `Bioma.neve`, `luzMin`, `PISO_LUAR`, `LIMIAR_CAVERNA`.
- [ ] **FPS do lab com cavernas + relevo** — cavernas somaram **+66% de triângulos**
      (153 852 → 255 234) e o relevo por bioma devolveu **−7,5%** (700 230 → 647 858 na medição
      pelo mesher). A GPU de lá já fecha o p95 em 16,8–19,6 ms contra 16,7 de orçamento. Rodar
      `?bench` no notebook e comparar com a régua (`…-l9xf.json`). Se doer, o botão é
      `LIMIAR_CAVERNA`. ⚠️ A seed do `?bench` é das mais vazias — o +66% é o melhor caso.
- [ ] **PLAYTEST mobile no tablet** — headless não tem dedo, teclado do Android nem DPI real.
      Conferir nessa ordem: tapa no slot da hotbar troca de bloco · chat com teclado aberto ·
      "Meus mundos" com vários mundos (chegar no "voltar") · abas do inventário numa linha ·
      F3/objetivos sem colidir com a barra de botões do topo. **Não bloqueia a v2** (arquivos
      disjuntos: CSS/UI × `shared/src/worldgen`).
- [ ] **A/B do §🌬️ no notebook do lab:** `?bench` e depois `?bench&semvida`, duas URLs
      seguidas na MESMA máquina. Só o lado do PC de dev foi feito (sessão 30).
- [ ] **Rodar o `.bat` no Windows uma vez.** O bloco de auto-update do `.sh` foi exercitado
      nos 8 caminhos aqui; o `.bat` NÃO — não há cmd.exe no WSL. Único jeito é duplo clique.

## ⏭️ Next (queued, ready to pick up)

- [ ] **Mobile, 2ª rodada — painéis de AUTORIA** (`#painel`: quadros, objetivos, regiões) e o
      de grupo/jogadores. O usuário deixou de fora da 1ª rodada. Seguem em
      `width: min(580px, 94vw)` / `height: min(560px, 84vh)`; os botões internos já têm alvo
      de 40px, mas o layout não foi revisto. O caminho que funcionou no inventário foi
      ALARGAR em paisagem baixa, não quebrar linha.
- [ ] **Nome do mundo truncado no DESKTOP** ("seque…", "labirin…") — a coluna do nome fica com
      ~84px depois dos 3 botões. Em paisagem baixa já resolveu (painel de 680px). No desktop
      resolve com UMA linha (`.menu-screen { width: min(680px, 92vw) }` sem media query), mas
      é mudança visual não pedida numa tela de uso diário: **só com o aval do usuário.**
- [ ] Som de água (splash/borbulha/balde, WebAudio em `audio.ts`) — 4ª opção do refino de
      água, nunca escolhida. **Casa bem com o §🌬️ recém-fechado** (som de vento junto).
- [ ] **Não renderizar as bordas de área reservada (claim/região) além da distância de render**
      (pedido do usuário, 2026-08-03). Hoje o `regionRenderer` desenha os wireframes das áreas
      reservadas dos jogadores independentemente da distância; cular por `raioRender` (a área
      cujo centro/caixa está além do raio não gera vértice) alivia GPU/overdraw em mundo com
      muitos claims. Barato: filtro por distância antes de montar as linhas.
- [ ] **Cauda de GPU no lab — SÓ SE VOLTAR A INCOMODAR** (nenhum gatilho aceso hoje): GPU p95
      16,8–19,6 ms contra 16,7 ms de orçamento de 60 FPS. Candidatos: teto de `raioRender` em
      GPU fraca, overdraw da água, custo de fragment.
      ⚠️ **Greedy meshing NÃO ajuda aqui** — draw calls (633) e triângulos (188 048) do lab são
      IDÊNTICOS aos do PC de dev, então não é em geometria que a máquina fraca perde.

## 💡 Later / backlog (not scheduled)

- [ ] **Ferramentas que ficaram de fora do §🧪** (avaliadas em 2026-07-26, gatilho anotado):
      `ast-grep`/`sg` para busca ESTRUTURAL (achar call site por forma, não por texto) —
      vale instalar quando grep começar a devolver 30+ hits por consulta;
      LSP/Serena só se o projeto passar de ~300 arquivos (hoje 223, grep ganha).
- [x] Layouts mobile (2º da ordem do usuário) — 1ª rodada feita na sessão 31; falta playtest
      no tablet e os painéis de autoria (ver ⏭️ Next)
- [ ] v2 da geração de mundo (3º da ordem do usuário) — **escopo ABERTO em 2026-07-28**
      (sessão 31): cavernas primeiro em todo mundo procedural, depois relevo "montanha de
      verdade" por bioma. Decisões, colisões e portões em `.wolf/ROADMAP.md §🏔️`. Ver 🔥 Now.
- [ ] **Vegetação precisa de bloco de apoio** — ver o item completo em ⏭️ Next (o buraco é o
      `rulesMap` sem `GramaAlta`/`Seca`/`Fria`). Agora que o F4 existe, o que some pode virar
      DROP: é uma entrada em `drops.ts`, não engrenagem nova.
- [ ] Sobrevivência (fome/vida/craft) (4º da ordem do usuário) — **EM CURSO desde a sessão
      34**: F1 (`/modo` + `/regra` + save), F2 (vida/dano/morte), F3 (fome), F4 (inventário
      autoritativo) e F5 (craft por lista + balde-item) FEITOS; faltam F6..F9. Decisões travadas e colisões
      em `.wolf/ROADMAP.md §🍖` — quem pegar a frente NÃO reabre decisão: lite agora com porta
      pro completo · mobs só em mundo de exploração · craft por lista · `/pvp` no lite (F7,
      atalho da regra `pvp` que já existe). Ordem: **F2 vida/dano/morte** → F3 fome →
      F4 inventário autoritativo (a frente cara) → F5 craft → F6 comida → F7 pvp →
      F8 mobs (fora do lite) → F9 preset.
- [x] **Deck da CRE** (sessão 29): `relatorio/apresentacao-cre.html` — 20 slides, um arquivo
      autocontido, offline, notas do apresentador em N (ou `?notas`), handout no Ctrl+P.
      **Sem data** de propósito: a apresentação informal vem antes da formal.
- [ ] Relatório: embutir 2–4 screenshots no §3, refs em ABNT, diagrama no Anexo A (opcional,
      não bloqueia entrega). O §desempenho ganhou material forte na sessão 27 (A/B com o
      caminho síncrono + régua dev × lab).
- [ ] Gerar PDF/HTML de `relatorio/relatorio-aplicacao.md` quando o usuário pedir a entrega

## 🧭 Fora deste repo (aberto)

- [x] **PR upstream do OpenWolf: [cytostack/openwolf#64](https://github.com/cytostack/openwolf/pull/64)**
      — **JÁ ENTROU e está na 2.0.1 instalada**, mas **só no `dist/hooks/`**, e não é essa a
      cópia que chega no projeto (ver o item dos hooks abaixo). Fechar/arquivar o PR se ainda
      estiver aberto.

- [x] 🔥 **OS TRÊS AVISOS DE HOOK FALSO-POSITIVOS — CONSERTADOS (sessão 37, 2026-08-03).**
      bug-554/555/556. Os três consertos estão em `.wolf/hooks/shared.js` e `.wolf/hooks/stop.js`
      (rastreados no git), com regressão em `.wolf/hooks/_test-hooks.mjs` (10/10 —
      `node .wolf/hooks/_test-hooks.mjs`, roda o `stop.js` de verdade numa fixture de `/tmp`).

      **A causa raiz de o fix upstream não ter chegado: o pacote 2.0.1 traz DUAS cópias dos
      hooks** — `dist/hooks/` (build do `tsconfig.hooks.json`, tem o PR #64) e `dist/src/hooks/`
      (build principal do tsc, NÃO tem). O `copyHookScripts` do `dist/src/cli/init.js` procura
      nessa ordem e **`dist/src/hooks` vence**, então `openwolf init/update` sempre instalou a
      versão velha. Foi o que aconteceu no commit `192acff` ("sincroniza com o 2.0.1").

      1. **"no semantic summary written to memory.md"** — `countSemanticEntries` comparava data:
         ou o prefixo `| YYYY-MM-DD` (que NENHUMA linha tem — o formato pedido é `| HH:MM |`),
         ou, na versão do PR #64, o header `## Session: <hoje>` — que é gravado no INÍCIO da
         sessão e carrega data UTC com hora LOCAL, então sessão que atravessa a meia-noite fica
         com a data de ontem. Contagem 0 ⇒ aviso eterno. **Agora conta as linhas abaixo do
         ÚLTIMO `## Session:`, sem olhar data nenhuma.**
      2. **"buglog.json was not updated"** — `checkForMissingBugLogs` só olhava
         `session.files_written`, que registra apenas Write/Edit/MultiEdit; append por
         `python3`/`cat` no Bash era invisível. **Agora também aceita o mtime do `buglog.json`
         posterior ao início da sessão** (`buglogTouchedSince`), qualquer que seja a ferramenta.
      3. **`| HH:MM | Session end: … |` repetida a cada `stop`** — os contadores são CUMULATIVOS
         e o hook dava append em todo turno. **Agora só grava quando o resumo muda, e sobrescreve
         a linha de encerramento que estiver no fim do arquivo** em vez de empilhar outra. Se o
         modelo escreveu algo depois dela, a linha nova é acrescentada (histórico preservado).
         As 41 cópias que já estavam no `memory.md` foram colapsadas.

      ⚠️ **O conserto foi copiado à mão para as DUAS cópias do pacote global**
      (`~/.local/share/pnpm/global/v11/.../openwolf/dist/hooks/` e `.../dist/src/hooks/`, com
      `.bak-pre-fix` ao lado), para que um `openwolf init/update` não reverta. **`pnpm update -g
      openwolf` apaga esse patch** — depois de atualizar, recopiar de `.wolf/hooks/` (que é a
      fonte rastreada) ou mandar o PR upstream.

## ✅ Recently done

<!-- Checked items land here. Sweep them into STATUS.md "✅ Done" when a phase closes, then clear this list. -->

- (limpo em 2026-07-27 — a sessão 27 inteira foi pro STATUS ✅ e pro git:
  `51bc5c8` mesher em Worker · `b3669ff` wolf · `0a3dd3f` PR do openwolf ·
  `efaf6df` profundidade 1 + etiqueta `mesher` no perfil)
- [x] **§🌬️ vento + vida ambiental — 6 frentes (sessão 28)**: textura da água polida ·
      vento autoritativo (`shared/src/vento.ts`, função pura do tick) · água seguindo o
      vento · nuvens · folhas balançando (atributo `sway` + `onBeforeCompile`) · grama alta
      (`GramaAlta/Seca/Fria` 179-181) + flores balançando. Config `nuvens`/`balanco` no menu.
- [x] **Regra da correnteza (sessão 28b, ressalva do playtest)**: água que CORRE segue o
      próprio fluxo (gradiente de nível na vizinhança → 8 tiles de atlas escolhidos pelo
      mesher); água PARADA segue o vento. Pintura da água em `putImageData` + teto de 12
      repinturas/s.
- [x] **Sentido da correnteza por FACE (sessão 28c)**: `tileAguaDaFace` projeta o fluxo nos
      eixos de cada face (`FACE_BASES`). Rotação fixa por face não resolvia — verificado
      numericamente que erra em outra direção de fluxo.
