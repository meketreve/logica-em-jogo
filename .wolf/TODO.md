# TODO — logica-em-jogo

> Working checklist. **STATUS.md** = handoff ("why & where we are"); **TODO.md** = "what's left to do".
> Keep items actionable and short. Check off with `[x]`; sweep done items into STATUS.md ✅ when a phase closes.
> Last updated: 2026-07-26

---

## 🔥 Now (this session)

- (nada em andamento — sessão 24 fechada e commitada em `e3eaac4`; árvore limpa)

## ⏭️ Next (queued, ready to pick up) — NESTA ORDEM

- [ ] **1º — §🕐 tela de carregamento** (`ROADMAP.md` §🕐 + STATUS "Próxima fase"):
      `client/src/loading.ts` novo (self-contained, padrão do `touch.ts`); reusa
      `colunasCarregadas.size` / `colunasFaltando.size` da varredura 1×/s do §🔁 (NÃO medir
      duas vezes); bits/s de `bytesIn/bytesOut` ×8; spinner decorativo no canto + progresso
      real no centro; **suprimir `updateOverlay()` enquanto `loading.ativo`** (senão o menu
      Esc aparece por baixo); fechar só com snapshot aplicado E 1ª leva meshada.
- [ ] **2º — custo de render** (perfil de 2026-07-26 na mão, ver ROADMAP "MEDIÇÃO"):
      (a) mesher em Web Worker (mata o hitch episódico — 157 long tasks);
      (b) greedy meshing (2895 draw calls / 755 k triângulos);
      (c) teto de `raioRender` menor em máquina fraca.
      ⚠️ medir num PC do LAB antes de investir pesado — o perfil é de PC de dev.
- [ ] Som de água (splash/borbulha/balde) — 4ª opção do refino, NÃO escolhida ainda
- [ ] **§🌬️ vento + vida ambiental** (`ROADMAP.md`, pedido do usuário 2026-07-26): textura da
      água → vento autoritativo → animação da água seguindo o vento → nuvens → folhas → grama
      e flores. Nada codado.

## 💡 Later / backlog (not scheduled)

- [ ] Layouts mobile
- [ ] Auto-update do servidor
- [ ] Sobrevivência (fome/vida/craft)
- [ ] v2 da geração de mundo
- [ ] Relatório: embutir 2–4 screenshots no §3, refs em ABNT, diagrama no Anexo A (opcional, não bloqueia entrega)
- [ ] Gerar PDF/HTML de `relatorio/relatorio-aplicacao.md` quando o usuário pedir a entrega

## ✅ Recently done

<!-- Checked items land here. Sweep them into STATUS.md "✅ Done" when a phase closes, then clear this list. -->

- (limpo em 2026-07-25 — sessões 20+21 foram pro STATUS ✅ e pro git)
- [x] Hitbox da laje: usuário confirmou que já está correta — nada a mudar (2026-07-26)
- [x] Superfície de água por NÍVEL, cantos casados procedurais (mesher, 2026-07-26)
- [x] Tint + névoa ao submergir (`client/aguaFx.ts`, 2026-07-26)
- [x] Textura de água ANIMADA (correnteza, `animarAguaAtlas`, 2026-07-26)
- [x] Mar/lagos no worldgen (`NIVEL_MAR`, praia acompanha, spawn seco, 2026-07-26)
- [x] PLAYTEST do refino de água — usuário APROVOU ("ficou muito bom"), 2026-07-26
- [x] §🔁 (a) bug-211: reenviar `radius` quando a config muda (`enviarRaio`, 2026-07-26)
- [x] §🔁 (b) `pedir_coluna` + varredura 1×/s + guardas + F3 `faltando`/`repedidas` (2026-07-26)
- [x] Backlog §🌬️ vento/vida ambiental anotado no ROADMAP (pedido do usuário, 2026-07-26)
- [x] PLAYTEST do §🔁 — usuário aprovou (raio de render + F3); perfil confirma faltando 0 /
      repedidas 16 em 719 colunas (2026-07-26)
- [x] Perfil do pior caso analisado e registrado na política de otimização do ROADMAP (2026-07-26)
- [x] Commitado: água + §🔁 em `e3eaac4` (2026-07-26)
