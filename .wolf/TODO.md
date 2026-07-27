# TODO — logica-em-jogo

> Working checklist. **STATUS.md** = handoff ("why & where we are"); **TODO.md** = "what's left to do".
> Keep items actionable and short. Check off with `[x]`; sweep done items into STATUS.md ✅ when a phase closes.
> Last updated: 2026-07-26 (sessão 25 fechada e commitada)

---

## 🔥 Now (this session)

- [x] **MESHER EM WEB WORKER** — CODADO. Núcleo puro `meshVizinhanca(viz 18³)` + pool de
      até 4 workers (8 jobs em voo cada) + versão por chunk contra resultado vencido.
      Typecheck 3/3, 334 testes, build ok. A/B headless: main thread 0,933 → 0,158 ms/chunk.
- [x] **Par A/B no lab** (`jkso` worker × `t3xn` semworker) — FEITO. Carga −55%, mas FPS
      50 → 36 por trabalho duplicado (+45%) e falta de freio. Diagnóstico na STATUS.
- [x] **Coalescência (`chavesEmVoo`/`sujosEmVoo`) + freio por fase (`modoCarga`, 8 na carga
      / 2 no jogo) + knob `?meshdepth=N`** — codado, 334 testes verdes, headless fecha fila 0.
- [x] **KNOB FECHADO NO LAB** (6 rodadas, bateria+tomada): `PROFUNDIDADE_JOGO = 1`. Empata o
      FPS do síncrono (50) e bate a cauda dele (p95 26,7 × 28,1), com carga 4,5 s × 11,5 s.
- [x] **Instrumentação: o perfil agora grava `mesher` (workers + profundidades)** — o A/B de
      2026-07-27 saiu sem etiqueta e só deu pra atribuir porque o usuário lembrava a ordem.

## ⏭️ Next — o mesher ACABOU; o que sobra é GPU

- [ ] **Cauda de GPU no lab, SE ainda incomodar** (nada disparou gatilho ainda): GPU p95
      16,8–19,6 ms contra 16,7 ms de orçamento de 60 FPS. Candidatos: teto de `raioRender`
      em GPU fraca, overdraw da água, custo de fragment. ⚠️ Greedy meshing NÃO ajuda aqui —
      draw calls e triângulos do lab são idênticos aos do PC de dev.
- [ ] ⚠️ **Fato de implantação:** notebook em modo economia de bateria trava em **30 FPS**
      (p50 33,3 ms cravado nas 3 rodadas). Nenhuma otimização atravessa política de energia.

## ⏭️ Next (queued, ready to pick up) — NESTA ORDEM

- [x] **1º — RODAR O `?bench` NUM PC DO LAB** — FEITO (2026-07-26, duas rodadas no notebook
      de professor): `perf-bench-…-v1w4.json` e `…-nfhx.json`. Veredito na STATUS §sessão 27.
- [ ] **2º — cauda de GPU no lab** (só DEPOIS do Worker, e só se ainda incomodar): GPU p95
      19,6 ms num orçamento de 16,7. Candidatos: teto de `raioRender` em GPU fraca, overdraw
      da água, custo do fragment. (b) greedy meshing segue DESCIDO (ataca triângulos/draw
      calls, e ambos são idênticos aos do dev — não é aí que a máquina fraca perde).
- [ ] Som de água (splash/borbulha/balde) — 4ª opção do refino, NÃO escolhida ainda
- [ ] **§🌬️ vento + vida ambiental** (`ROADMAP.md`, pedido do usuário 2026-07-26): textura da
      água → vento autoritativo → animação da água seguindo o vento → nuvens → folhas → grama
      e flores. Nada codado.

## 💡 Later / backlog (not scheduled)

- [ ] **Ferramentas que ficaram de fora do §🧪** (avaliadas em 2026-07-26, gatilho anotado):
      `ast-grep`/`sg` para busca ESTRUTURAL (achar call site por forma, não por texto) —
      vale instalar quando grep começar a devolver 30+ hits por consulta;
      LSP/Serena só se o projeto passar de ~300 arquivos (hoje 190, grep ganha).
- [ ] Layouts mobile
- [ ] Auto-update do servidor
- [ ] Sobrevivência (fome/vida/craft)
- [ ] v2 da geração de mundo
- [ ] Relatório: embutir 2–4 screenshots no §3, refs em ABNT, diagrama no Anexo A (opcional, não bloqueia entrega)
- [ ] Gerar PDF/HTML de `relatorio/relatorio-aplicacao.md` quando o usuário pedir a entrega

## ✅ Recently done

<!-- Checked items land here. Sweep them into STATUS.md "✅ Done" when a phase closes, then clear this list. -->

- (limpo em 2026-07-26 — a sessão 25 inteira foi pro STATUS ✅ e pro git)
- [x] **As 7 do perfilador** (sessão 26): `?bench` · histograma · carga por fase · marcadores
      · regras do servidor no `debug_stats` · tempo de GPU · `nucleos`/`ramGB` (este já
      existia). Mais `npm run bench:headless`. Verde em typecheck/331 testes/build + bench
      headless de ponta a ponta. **Playtest aprovado** nos dois modos (perfil manual pelo host
      Node e `?bench`); régua do PC de dev guardada em `profiles/`.
