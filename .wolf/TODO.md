# TODO — logica-em-jogo

> Working checklist. **STATUS.md** = handoff ("why & where we are"); **TODO.md** = "what's left to do".
> Keep items actionable and short. Check off with `[x]`; sweep done items into STATUS.md ✅ when a phase closes.
> Last updated: 2026-07-27 (sessão 28b — regra da correnteza do playtest, commitada sem push)

---

## 🔥 Now (this session)

- [ ] **Medir o preço do §🌬️ no notebook do lab**: `?bench` com nuvens+balanço ON, comparar
      com a régua `…-l9xf.json` (50 FPS · p95 26,7 · GPU méd 13,0 / p95 16,8 · carga 4 508 ms).
      Se piorar acima do ruído de 1–2%, gravar o par com `nuvens` OFF em Configurações.
- [ ] **Playtest da REGRA DA CORRENTEZA (28b), de balde na mão**: despejar água num declive e
      conferir que a textura desce COM a água. O mar segue o vento de propósito (é tudo fonte,
      gradiente zero) — não é bug. Headless não resolve: o mar gerado não tem fluxo.

## ⏭️ Next (queued, ready to pick up)

- [ ] Som de água (splash/borbulha/balde, WebAudio em `audio.ts`) — 4ª opção do refino de
      água, nunca escolhida.
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
- [ ] Layouts mobile
- [ ] Auto-update do servidor
- [ ] Sobrevivência (fome/vida/craft)
- [ ] v2 da geração de mundo
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
