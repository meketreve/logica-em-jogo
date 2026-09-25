# TODO

> O backlog DETALHADO (1300+ linhas, com spec de cada ideia) continua em **`todo.md`** na raiz.
> Aqui fica só a fila de trabalho. Ideia nova do usuário vai pro `todo.md`, não para cá.

## Agora

- [ ] **1º bloco de circuito lógico** — BLOQUEADO: perguntar ao usuário QUAL bloco e como ele
      funciona na aula, antes de codar.

## Testar na escola (o usuário faz; nada disto foi visto em tela)

- [ ] **§🪓 machado e pá:** fabricar os dois (machado = 3 do material + 2 gravetos, pá = 1 + 2);
      sentir se derrubar árvore **de mão nua** ficou chato demais pra turma (dobrou pra 1,5 s —
      é uma linha só do `DUREZA` em `shared/src/ferramentas.ts` se precisar afrouxar); ver se os
      ícones se distinguem do da picareta em 1024×600.
- [ ] **§🔨 quebra v2:** segurar pra quebrar no PC e no tablet, se o tempo da pedra parece justo,
      se a rachadura aparece no projetor da sala, e se a barrinha de vida é enxergável.
- [ ] **Presença (bug-672):** fechar o navegador do tablet e reentrar com o mesmo nome; minimizar
      por mais de 15 s pra ver o nome liberar. Conferir se 15 s não derruba ninguém no Wi-Fi da
      escola (é um número só, em `constants.ts`).
- [ ] **Loja:** preço de ITEM (pão, trigo, picareta) **e reabrir o mundo depois** — era na
      releitura do save que o preço sumia. Loja cheia no tablet.
- [ ] **Cama e porta:** 2 camas em fila; mundo antigo que já tinha cama; porta em cima de porta.
- [ ] **Ids de 16 bits:** abrir o mundo salvo da turma no host (tem de nascer
      `<nome>.antes-ids16.ljw`) e um mundo do singleplayer num navegador que já jogava.
- [ ] **Cama/torre:** deitar de perto e de longe e levantar com o pular; torre de pular+colocar
      no Wi-Fi da escola (é onde a latência do bug-652 aparece de verdade).
- [ ] **bug-650:** confirmar em aula com turma cheia (só localhost até agora).

## Depois

- [ ] `npm run bench:headless` antes/depois dos ids de 16 bits.
- [ ] Ovelha + lã de verdade (§🍖 F8).
- [ ] Sentar na cadeira.
- [ ] Menu do singleplayer oferecer restaurar o backup `dataAntesIds16`.
- [ ] Consertar `scripts/f10-shot.mjs` (rótulo do botão muda com o item na mão).
- [ ] Launcher chamar `node` direto, pro save no Ctrl+C não depender do wrapper (bug-666).

## Ideias / talvez

- [ ] Uniforme/skin por escola — não começado.
- [ ] Cross-school networking e mini-campeonato — adiados.
- [ ] Impedir mintar Dimas de graça criando nome novo (hoje só avisa).
