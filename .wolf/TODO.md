# TODO — logica-em-jogo

> Working checklist. **STATUS.md** = handoff ("why & where we are"); **TODO.md** = "what's left to do".
> Keep items actionable and short. Check off with `[x]`; sweep done items into STATUS.md ✅ when a phase closes.
> Last updated: 2026-07-27 (sessão 29 — A/B do §🌬️ ferramentado, deck da CRE pronto,
> auto-update do servidor em escopo)

---

## 🔥 Now (this session)

- [ ] **Auto-update do servidor** (1º da ordem que o usuário fixou: auto-update → mobile →
      v2 da geração → sobrevivência). Só a máquina do PROFESSOR precisa atualizar — o aluno
      só abre o navegador. **Aguardando 3 decisões:** fonte (git pull × ZIP de release ×
      Drive), repo público ou seguir privado (privado exige credencial na máquina da
      escola), e se atualiza sozinho ou pergunta. Base: launcher `iniciar-servidor.bat/.sh`
      + `client/dist` JÁ versionado (não precisa buildar na escola).

## ⏭️ Next (queued, ready to pick up)

- [ ] **Rodar o A/B do §🌬️ no notebook do lab** — a ferramenta ficou pronta na sessão 29:
      `?bench` e depois `?bench&semvida`, duas URLs seguidas na mesma máquina. O perfil se
      etiqueta sozinho e o lado B nasce `perf-bench-semvida-*.json`. Só vale se o relatório
      quiser o custo de nuvens/balanço — não é gatilho de desempenho.
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
- [ ] Layouts mobile (2º da ordem do usuário)
- [ ] v2 da geração de mundo (3º da ordem do usuário)
- [ ] Sobrevivência (fome/vida/craft) (4º da ordem do usuário)
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
