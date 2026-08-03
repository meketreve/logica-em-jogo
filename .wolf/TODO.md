# TODO — logica-em-jogo

> Working checklist. **STATUS.md** = handoff ("why & where we are"); **TODO.md** = "what's left to do".
> Keep items actionable and short. Check off with `[x]`; sweep done items into STATUS.md ✅ when a phase closes.
> Last updated: 2026-08-03 (sessão 36 — §🍖 F4, o inventário autoritativo, fechou inteiro numa
> sessão. Próxima frente é o F5 craft — mas ver a ressalva do F6 abaixo)

---

## 🔥 Now (this session)

<!-- Vazio: a sessão 36 fechou o §🍖 F4 e tudo foi varrido pro STATUS ✅ e pro git
     (cf9e9ae código · 192acff scaffolding · f23c3d3 wolf, empurrados). Próxima
     sessão: puxar o primeiro item de ⏭️ Next pra cá. -->

## ⏭️ Next

- [ ] **Vegetação precisa de bloco de apoio** — sem cubo cheio embaixo, a planta SOME (quebra).
      Já existe a engrenagem: `torchRule` em `shared/src/rules.ts` (tocha, tapetes e flores
      104–107 já registrados) e `precisaApoio()` em `blocks.ts` já lista grama alta. **O buraco
      é o registro: `GramaAlta`/`GramaAltaSeca`/`GramaAltaFria` (179–181) NÃO estão no
      `rulesMap`** — hoje o capim fica flutuando quando se quebra o chão embaixo. Fix = um `for`
      de 3 ids apontando pro `torchRule` + teste. ⚠️ Conferir também se falta algum outro id
      com `precisaApoio(id) === true` fora do `rulesMap` (varredura, não olho).
      **Quando o F4 existir, o que some vira DROP** (entrada em `drops.ts`), em vez de evaporar.

- [ ] **§🍖 F5 — craft por LISTA** (~1 sessão). `shared/src/receitas.ts` puro
      (`Receita { saida, custo[] }` + `podeFabricar`) e painel-lista com filtro e "falta 3
      tábua". **Grade 3×3 está DESCARTADA** (arrastar dói no tablet) — o gesto do painel da
      mochila do F4 (tocar origem, tocar destino) é o molde. Servidor valida e aplica; o
      cliente só pede. **Sem bancada no lite.**
      ⚠️ **Considerar o F6 (comida, ~1 sessão) ANTES ou JUNTO**: o F3 nasceu com a fome
      limitada a 3 corações (`VIDA_MINIMA_POR_FOME`) por não haver o que comer, e agora que
      existe inventário o laço da fome dá pra fechar. F5 e F6 se cruzam (pão = 1 receita).
      Decidir com o usuário — a ordem travada é F5 → F6.

- [ ] **O balde ainda NÃO é item de mochila** (anotado no F4). Em sobrevivência ninguém tem
      um, porque não há craft até o F5; o ramo do balde no `main.ts` está explicitamente
      guardado por `mochila.ativa` e só roda em criativo. Quando o F5 existir: receita do
      balde + `ITEM_BALDE_VAZIO`/`ITEM_BALDE_AGUA` viram pilhas de 1 (o `tamanhoStack` já
      trata) e o `case "balde"` da session passa a trocar o item no slot.

## 🏫 Na escola (o usuário faz lá)

- [ ] **PLAYTEST DA SOBREVIVÊNCIA (F1+F2+F3+F4)** — entrar com `/modo sobrevivencia all` (ou `eu`).
      **Do F4, o que só o dedo responde:** o painel "mochila" abre no E e o gesto é **tocar no
      item, tocar no destino** (não arrastar) — funciona no tablet? A contagem no canto do slot
      é legível no DPI do aparelho? Os 9 slots da mochila por linha cabem na tela do tablet em
      RETRATO? Começar de mãos vazias frustra, ou o `/dar all <id> <qtd>` resolve a aula?
      **Mochila cheia RECUSA a quebra** — isso lê como cuidado ou como bug? (o aviso vai no
      chat, no máximo 1 a cada 5 s).
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
      34**: F1 (`/modo` + `/regra` + save), F2 (vida/dano/morte), F3 (fome) e F4 (inventário
      autoritativo) FEITOS; faltam F5..F9. Decisões travadas e colisões
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

- [ ] **PR upstream do OpenWolf: [cytostack/openwolf#64](https://github.com/cytostack/openwolf/pull/64)**
      — aguardando review. Corrige `countSemanticEntries`, que fazia o aviso "no semantic
      summary" repetir a cada stop. **Mecanismo exato (diagnosticado em 2026-08-03,
      `.wolf/hooks/shared.js:614`):** a função conta linhas de `memory.md` que começam com
      `| YYYY-MM-DD`, mas o formato que o próprio aviso pede é `| HH:MM | … |`. Nenhuma linha
      tem data ⇒ contagem sempre 0 ⇒ aviso sempre. **Enquanto não entrar, ignore o aviso** —
      escrever mais entradas não o silencia, só polui o diário. ⚠️ O patch local em
      `~/.local/share/pnpm/global/.../openwolf/dist/hooks/shared.js` **é sobrescrito por
      `pnpm update -g openwolf`**; se o PR entrar, o update passa a trazer o fix.

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
