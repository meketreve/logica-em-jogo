# TODO — logica-em-jogo

> Working checklist. **STATUS.md** = handoff ("why & where we are"); **TODO.md** = "what's left to do".
> Keep items actionable and short. Check off with `[x]`; sweep done items into STATUS.md ✅ when a phase closes.
> Last updated: 2026-07-30 (sessão 33 — §🏔️ relevo por bioma: a v2 da geração FECHOU;
> próxima fase é sobrevivência §🍖)

---

## 🔥 Now (this session)

- [x] **§🏔️ RELEVO POR BIOMA** (sessão 33): `Bioma.relevo`/`Bioma.neve` + `relevoPorClima`
      ligados no `heightAt` e no `topoPrevisto`. **Portão de fronteira em paridade com o
      heightmap global** (degrau máx 4–6, zero pares > 6) depois do sweep que consertou o
      penhasco de 14–23 blocos (bug-544). Tetos: araucárias 106 · mata 68 · cerrado 53 ·
      caatinga 36. Custo NEGATIVO: −7,5% de triângulos, geração 4,53 → 4,00 ms/coluna.
      VERDE: typecheck 3/3, 392 testes, build, 6/6 smokes, 5/5 luz.
- [x] **`shared/vitest.config.ts`** (bug-545): `maxWorkers: 8` + `testTimeout: 20000` — o gate
      `npm test` era sorteio (5 falhas numa rodada, 18 na outra, por contenção de CPU).
      392/392 e a suíte caiu de 92 s pra 37 s.

## ⏭️ Next

- [ ] **§🍖 SOBREVIVÊNCIA — F1 primeiro** (`/modo`, o interruptor sem mecânica). Escopo travado
      na sessão 30, 9 frentes e as colisões escritas em `.wolf/ROADMAP.md §🍖`. Ler de lá.

## 🏫 Na escola (o usuário faz lá)

- [ ] **PLAYTEST do RELEVO POR BIOMA** (sessão 33) — precisa de **mundo NOVO**. A serra das
      araucárias (teto 106) ainda impressiona? A caatinga (36) virou duna? Cerrado (53) e mata
      (68) ficaram parecidos demais entre si? Alguma divisa lê como parede (o portão garante ≤ 6
      blocos entre vizinhas, mas 6 ao longo de uma encosta pode virar barranco)? Neve só nas
      araucárias ficou escassa (área nevada caiu 5×)? Cada resposta = 1 linha em
      `BIOMAS.*.relevo` / `SNOW_HEIGHT` / `Bioma.neve`.
- [ ] **PLAYTEST da LUZ e das CAVERNAS** (sessão 32) — headless não diz se é *jogável*.
      Dá pra andar em caverna sem tocha (piso `luzMin` = 0,05)? A tocha ilumina o bastante
      (emite 14, com o halo decorativo por cima)? A noite ficou escura demais pra construir
      (`PISO_LUAR` = 0,22)? Achar caverna é fácil demais ou raro demais (`LIMIAR_CAVERNA`)?
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
- [ ] Sobrevivência (fome/vida/craft) (4º da ordem do usuário) — **escopo ABERTO em
      2026-07-27** (sessão 30): decisões travadas, 9 frentes (F1 `/modo` → F9 preset) e as
      colisões mapeadas em `.wolf/ROADMAP.md §🍖`. Quem pegar a frente NÃO reabre decisão:
      lite agora com porta pro completo · mobs só em mundo de exploração · craft por lista ·
      `/modo` mundo+aluno+`all`+`eu` · `/pvp` no lite · **regras de mundo por `/regra`**
      (molde do `/gamerule`), com `manter-inventario` LIGADO por padrão. Começar pelo **F1**
      (`/modo` + registro de regras + campo `regras?` no save — o interruptor sem mecânica).
      **Nenhuma decisão pendente.**
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
