# TODO — logica-em-jogo

> Working checklist. **STATUS.md** = handoff ("why & where we are"); **TODO.md** = "what's left to do".
> Keep items actionable and short. Check off with `[x]`; sweep done items into STATUS.md ✅ when a phase closes.
> Last updated: 2026-07-25

---

## 🔥 Now (this session)

- [ ] Commit das sessões 20 + 21 (blocos novos + fixes do playtest) — nada commitado ainda
- [ ] **Aguardando resposta:** "hitbox dos meio blocos igual das cercas/portas" = mira (blockSelectionBox) ou colisão (célula cheia)?

## ⏭️ Next (queued, ready to pick up)
- [ ] Consolidar `.wolf/cerebrum.md` (~14k tokens, orçamento 2k) — mesclar learnings duplicados, mover Decision Log datado pro history.md

## 💡 Later / backlog (not scheduled)

- [ ] Layouts mobile
- [ ] Textura de água animada / refino
- [ ] Auto-update do servidor
- [ ] Sobrevivência (fome/vida/craft)
- [ ] v2 da geração de mundo
- [ ] Relatório: embutir 2–4 screenshots no §3, refs em ABNT, diagrama no Anexo A (opcional, não bloqueia entrega)

## ✅ Recently done

<!-- Checked items land here. Sweep them into STATUS.md "✅ Done" when a phase closes, then clear this list. -->

- [x] Colisão horizontal parcial correta (`resolveHoriz`) — escada não empurra mais pra trás (bug-512)
- [x] Vidro colorido com material próprio (blend ~20%) em vez de dither cutout (bug-513)
- [x] Step-up suave na câmera (bug-514)
- [x] Re-playtest aprovado (movimentação + vidros); opacidade do vidro calibrada em 0.4
