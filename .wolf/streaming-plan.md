# Streaming de chunks — plano de fases

Mundo GIGANTE FINITO (tamanho E = 3840×3840×128) com chunks gerados em runtime.
Decisão de escopo: finito, não infinito (bounds/claims simples).

## ✅ F1 — núcleo esparso + gen por coluna (commit e7dc4f7)
World.chunks vira `(Uint8Array|undefined)[]`. `gerarColunaDeChunks` ordem-independente.

## ✅ F2 — streaming por raio de interesse (commit 0da59be)
Protocolo LJE0 (header)/LJC0 (lote de colunas)/msg radius. Servidor: motor de
interesse em anéis. Cliente: fila de mesh, descarte, física congela sem chão.
Configs: raioRender + meshPorFrame (menu), LJ_COLUNAS_TICK (host). Tamanho E no menu.
**Save BLOQUEADO em E (isto é a F3).**

## ✅ F3 — SAVE ESPARSO (feito, 274 testes)
Mundo E persiste só os chunks EDITADOS; terreno regenera do seed.
1. ✅ Session `editedChunks: Set<number>` marcado em `applyBlockQuieto` (lazy).
2. ✅ save.ts LJS2: header + JSON meta (com `dims`) + count + [chunkIndex u32,
   CHUNK_VOLUME bytes]. decodeSave detecta LJS2 → world vazio + editedChunks[].
   readSaveMeta compartilhado entre denso/lazy. LJS1 (denso) intocado.
3. ✅ Session restore lazy: regenera cada coluna editada + sobrepõe bytes salvos.
4. ✅ Host/worker: encodeLazySave se isLazy. Cliente persistWorld sem skip.
5. ✅ Testes (save-lazy.test.ts) + SMOKE REAL: obsidiana em 1920,70,1920 no
   mundo E → save 4341 bytes → restart restaurando → obsidiana de volta. ✓

## ⏳ F4 — bordas / robustez
- /tp em coord distante do E materializa (garantirColunas no destino).
- rules (areia) na borda de coluna não carregada — verificar (edição já
  materializa 3×3; provar areia caindo na borda).
- borda do mundo (x=0/3839): jogador não cai no vazio — nota/parede.
- packCoord no E (3840²×128 = 1,88 bi < 2³¹) — verificar limite.

## ⏳ F5 — eviction de memória no servidor
Coluna sem interesse de NENHUM jogador E sem edição (editedChunks) é liberada
do world.chunks do servidor. Espelha o descarte do cliente. Sem isso, sessão
longa explorando cresce a RAM do host sem parar.

## Regras invariantes (não quebrar)
- Determinismo: mesma seed = mesmos bytes, qualquer ordem de geração.
- Mundo denso (P/M/G/aula/plano) segue idêntico — lazy só liga acima do teto G.
- Escola fica no commit estável; não dar git pull durante a obra.
