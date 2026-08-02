# TODO — logica-em-jogo

> Working checklist. **STATUS.md** = handoff ("why & where we are"); **TODO.md** = "what's left to do".
> Keep items actionable and short. Check off with `[x]`; sweep done items into STATUS.md ✅ when a phase closes.
> Last updated: 2026-08-02 (sessão 34 — §🍖 F1 e F2: o interruptor e a primeira mecânica;
> próxima frente é o F3, fome)

---

## 🔥 Now (this session)

- [x] **§🍖 F2 — vida, dano, morte, respawn** (sessão 34): `shared/src/sobrevivencia.ts` puro
      com **uma porta só pro dano** (`aplicarDano`), queda fechada pelo SERVIDOR a partir do
      fluxo de `move` (`apoiadoNoChao` novo em `physics.ts`), afogamento e regeneração no tick
      de 10 Hz, morte → respawn no spawn autoritativo avisando a turma. Msg `vida` nova (só a
      vida é obrigatória), `SavedPlayer.vida?` no save, HUD `client/src/vitals.ts` (corações,
      bolhas, vinheta de dano) e `?vida=N[,folego]` pra inspeção. VERDE: typecheck 3/3,
      **445 testes**, build, **8/8 smokes**, print do HUD conferido.

- [x] **§🍖 F1 — `/modo` e `/regra`** (sessão 34): `shared/src/modo.ts` (padrão do mundo +
      override pessoal por NOME) e `shared/src/regras.ts` (registro `manter-inventario`/`pvp`/
      `fome` no molde do `/gamerule`). Msg `modo {efetivo}` nova, mandada em TODO join (troca
      de aula é sessão nova). Save cresce só com campos opcionais e só com o DIFF do padrão.
      **Sobrevivência ainda joga igual a criativo — muda o rótulo e o VOO** (não voa, nem com
      `/voo` liberado). Mundo-aula fica criativo à força. VERDE: typecheck 3/3, **425 testes**
      (33 novos), build, **7/7 smokes** (o `modo` é novo), bench headless boota e renderiza.
- [x] **`limpar` no manifesto do `scripts/smoke.mjs`** (bug-547): `LJ_NOVO=1` não recria mundo
      existente, então smoke que escreve estado persistente passava na 1ª rodada e falhava na
      2ª. Rodado 2× seguidas pra provar idempotência.

## ⏭️ Next

- [ ] **§🍖 F3 — fome** (~0,5 sessão). Metade já existe: `EstadoVital.fome`, `tickRegen(e,
      fome)` e a regra de mundo `fome` (ligada) vieram no F2. Falta o DRENO por atividade real
      (a session já vê distância andada, blocos quebrados e colocados), o dano por fome zerada
      (`aplicarDano(…, "fome")` — a causa e o texto de morte já existem), as coxas no
      `vitals.ts` (o molde `.casa`/`.icone` das bolhas serve), `SavedPlayer.fome?` no save e o
      campo `fome?` OPCIONAL na msg `vida` que já existe (não criar mensagem nova).
      Gate: `valorRegra(this.regras, "fome")`.

## 🏫 Na escola (o usuário faz lá)

- [ ] **PLAYTEST DA SOBREVIVÊNCIA (F1+F2)** — entrar com `/modo sobrevivencia all` (ou `eu`).
      Morrer de queda é justo (dói a partir de 4 blocos, mata em 23)? 15 s de ar é pouco?
      **Os corações/bolhas no TABLET** — estão 96px acima do rodapé e podem brigar com a hotbar
      de toque, que ninguém olhou. A vinheta vermelha de dano incomoda? Voltar ao spawn ao
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
- [ ] Sobrevivência (fome/vida/craft) (4º da ordem do usuário) — **EM CURSO desde a sessão
      34**: F1 (`/modo` + `/regra` + save) FEITO; faltam F2..F9. Decisões travadas e colisões
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
      summary" repetir a cada stop. ⚠️ O patch local em
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
