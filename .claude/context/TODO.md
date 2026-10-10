---
updated: 2026-10-10
tier: 3
active: true
---

# TODO

> O backlog DETALHADO (1300+ linhas, com spec de cada ideia) continua em **`todo.md`** na raiz.
> Aqui fica só a fila de trabalho. Ideia nova do usuário vai pro `todo.md`, não para cá.

## Agora

- [ ] **1º bloco de circuito lógico** — BLOQUEADO: perguntar ao usuário QUAL bloco e como ele
      funciona na aula, antes de codar.

## Testar na escola (o usuário faz; aula de 10/10 cobriu parte)

- [ ] **Lote de 10/10:** fechar o servidor com Ctrl+C num mundo cheio e reabrir (o mundo tem de
      voltar inteiro); e, no singleplayer de um navegador que já jogava, ver o botão
      **restaurar** no mundo convertido.

- [ ] **§🪓 machado e pá:** fabricar os dois (machado = 3 do material + 2 gravetos, pá = 1 + 2);
      sentir se derrubar árvore **de mão nua** ficou chato demais pra turma (dobrou pra 1,5 s —
      é uma linha só do `DUREZA` em `shared/src/ferramentas.ts` se precisar afrouxar); ver se os
      ícones se distinguem do da picareta em 1024×600.
- [ ] **Heartbeat (bug-675) — AINDA ABERTO, o mais importante:** aula de 10/10 com turma cheia:
      as quedas **diminuíram mas não zeraram**. Falta saber da próxima vez: quantos caíram, se
      viram o MOTIVO na tela, e se cai sempre o mesmo aparelho (tablet no Wi-Fi) — a sobra pode
      ser outra causa, não o heartbeat.
- [ ] **Logs (não lidos ainda):** depois de uma aula, abrir `mundos/<nome>/logs/` — tem de haver o par com data e
      hora, o `-chat.log` só com fala de gente e pequeno o bastante pra ler.
- [ ] **Presença (bug-672):** fechar o navegador do tablet e reentrar com o mesmo nome; minimizar
      por mais de 15 s pra ver o nome liberar. Conferir se 15 s não derruba ninguém no Wi-Fi da
      escola (é um número só, em `constants.ts`).
- [ ] **Loja:** preço de ITEM (pão, trigo, picareta) **e reabrir o mundo depois** — era na
      releitura do save que o preço sumia. Loja cheia no tablet.
- [ ] **Ids de 16 bits:** abrir o mundo salvo da turma no host (tem de nascer
      `<nome>.antes-ids16.ljw`) e um mundo do singleplayer num navegador que já jogava.
- [ ] **Cama/torre:** deitar de perto e de longe e levantar com o pular; torre de pular+colocar
      no Wi-Fi da escola (é onde a latência do bug-652 aparece de verdade).
- [ ] **bug-650:** confirmar em aula com turma cheia (só localhost até agora).

## Depois

- [ ] Ovelha + lã de verdade (§🍖 F8).
- [ ] Sentar na cadeira.

## Ideias / talvez

- [ ] Uniforme/skin por escola — não começado.
- [ ] Cross-school networking e mini-campeonato — adiados.
- [ ] Impedir mintar Dimas de graça criando nome novo (hoje só avisa).
