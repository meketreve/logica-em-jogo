# TODO — logica-em-jogo

> Working checklist. **STATUS.md** = handoff ("why & where we are"); **TODO.md** = "what's left to do".
> Keep items actionable and short. Check off with `[x]`; sweep done items into STATUS.md ✅ when a phase closes.
> Last updated: 2026-07-26 (sessão 25 fechada e commitada)

---

## 🔥 Now (this session)

- (nada em andamento — sessão 25 fechada e COMMITADA; árvore limpa)

## ⏭️ Next (queued, ready to pick up) — NESTA ORDEM

- [ ] **1º — AS 7 DO PERFILADOR** (escolha do usuário ao fechar a sessão 25; escopo escrito
      em `ROADMAP.md` → `📊 BACKLOG — PERFILADOR`). Ordem: (1) modo `?bench` — trajeto e seed
      fixos, exporta sozinho: **destrava o número do PC do lab**; (2) histograma de frametime;
      (3) tempo de carga por fase; (4) marcadores de evento; (5) células/tick da regra no
      `debug_stats`; (6) tempo de GPU; (7) `hardwareConcurrency`/`deviceMemory`.
- [ ] **2º — custo de render: o que SOBROU** (o pico já morreu — MEDIÇÃO 5 do ROADMAP):
      (a) mesher em Web Worker — compra os 16–19% de main thread (FPS 55–60 → travado em 60)
          e fila que esvazia mais rápido; plano escopado no ROADMAP;
      (b) greedy meshing — DESCEU (steady state já é 60 FPS com 500 k triângulos);
      (c) `meshMsPorFrame` menor já é o knob de máquina fraca (existe na config).
      ⚠️ **medir no PC do LAB antes** — em PC de dev o p95 voando a raio 12 já é ~19 ms.
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
