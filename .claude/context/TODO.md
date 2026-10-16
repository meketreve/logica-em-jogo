---
updated: 2026-10-16
tier: 3
active: true
---

# TODO

> O backlog DETALHADO (1300+ linhas, com spec de cada ideia) continua em **`todo.md`** na raiz.
> Aqui fica só a fila de trabalho. Ideia nova do usuário vai pro `todo.md`, não para cá.

## Agora

- [ ] **§🔌 o OBJETIVO que CHECA o circuito** — a 2ª metade do pedido ("acender com a combinação
      certa" + objetivo verificável). Tipo novo em `shared/src/session/cenario.ts`, no molde de
      construir/chegar, com progresso por grupo → **verify:** teste de sessão que fecha o
      objetivo ao acender a lâmpada e NÃO fecha com uma alavanca só.

## Testar na escola (o usuário faz; aula de 10/10 cobriu parte)

- [ ] **§🔌 CIRCUITO (16/10), o mais novo:** fabricar as quatro peças na bancada; montar
      alavanca→fio→lâmpada e ver acender; montar a porta E com duas alavancas e conferir que só
      acende com as DUAS. No tablet: a alavanca é fácil de acertar com o dedo (ela tem 12/16 de
      altura) e dá pra distinguir ligada de desligada **de longe**? E em mundo com proteção
      ligada, o aluno sem terreno tem de ser barrado com a frase do chat.

- [ ] **Lote de 15/10:** no tablet, a lista de comandos do ALUNO (10) tem de caber **sem rolar e
      sem sumir atrás do teclado**. Se ainda sumir, anotar **se o CAMPO de digitar some junto**
      (aí é o `--kb` do aparelho, em `chat.ts`) e a orientação. E o painel unificado: G / 👥 /
      `/amigos` abrem o MESMO painel na aba "amigos".

- [ ] **Lote de 10/10:** Ctrl+C num mundo cheio e reabrir (tem de voltar inteiro); e o botão
      **restaurar** no mundo convertido do singleplayer.
- [ ] **§🪓 machado e pá:** fabricar os dois; sentir se derrubar árvore de MÃO NUA ficou chato
      (1,5 s — uma linha do `DUREZA` em `ferramentas.ts`); ícones distinguíveis a 1024×600.
- [ ] **Heartbeat (bug-675) — AINDA ABERTO, o mais importante:** aula de 10/10 com turma cheia:
      as quedas **diminuíram mas não zeraram**. Falta saber da próxima vez: quantos caíram, se
      viram o MOTIVO na tela, e se cai sempre o mesmo aparelho (tablet no Wi-Fi) — a sobra pode
      ser outra causa, não o heartbeat. *(13/10: a sobra do host abaixo do limiar de 8 s foi
      endurecida — queda por silêncio agora exige 3 perguntas de verdade; a observação em aula
      continua valendo.)*
- [ ] **Logs (não lidos ainda):** `mundos/<nome>/logs/` — o par com data/hora, e o `-chat.log` só
      com fala de gente.
- [ ] **Presença (bug-672):** fechar o navegador e reentrar com o mesmo nome (a volta tem de ser
      NA HORA); e conferir se os 15 s não derrubam ninguém no Wi-Fi da escola (`constants.ts`).
- [ ] **Loja:** preço de ITEM **e reabrir o mundo** (era na releitura do save que sumia).
- [ ] **Ids de 16 bits:** abrir o mundo da turma no host (tem de nascer `<nome>.antes-ids16.ljw`).
- [ ] **Cama/torre:** deitar perto e longe, levantar pulando; torre de pular+colocar no Wi-Fi da
      escola (onde a latência do bug-652 aparece). E o **bug-650** com turma cheia.

## Depois

- [ ] Ovelha + lã de verdade (§🍖 F8).
- [ ] Sentar na cadeira.

## Ideias / talvez

- [ ] Uniforme/skin por escola — não começado.
- [ ] Cross-school networking e mini-campeonato — adiados.
- [ ] Impedir mintar Dimas de graça criando nome novo (hoje só avisa).
