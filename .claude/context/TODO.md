---
updated: 2026-10-19
tier: 3
active: true
---

# TODO

> O backlog DETALHADO (1300+ linhas, com spec de cada ideia) continua em **`todo.md`** na raiz.
> Aqui fica só a fila de trabalho. Ideia nova do usuário vai pro `todo.md`, não para cá.

## Agora

- [ ] **§🔌 modelos melhores das peças** (doc `Circuitos modelos melhores.md`, 19/10): lâmpada que
      ilumina, fio conectado (molde da cerca), porta como CHIP com pinos, alavanca em pé/deitada.
      ANTES da NÃO, senão o redesenho (e a sonda) se paga duas vezes → **verify:** a
      `shots:circuito` re-calibrada enxergando cada mudança.

- [x] ~~**§🔌 o OBJETIVO que CHECA o circuito**~~ — feito em 19/10 (tipo `acender`: foto do
      circuito no add, só alavanca pode mudar, progresso por grupo). Falta ver em AULA (abaixo).

## Testar na escola (o usuário faz; aula de 10/10 cobriu parte)

- [ ] **§🔌 o OBJETIVO acender (19/10), o mais novo:** montar o circuito numa região e criar o
      objetivo (painel do professor → tipo "acender", ou `/objetivo add acender <regiao> <texto>`).
      Ver o jogo fechar sozinho. Conferir se a frase "peça(s) fora do lugar" é entendida por
      criança de 10 anos, e se "zerar progresso" deixa o desafio pronto pro grupo seguinte.

- [ ] **§🔌 CIRCUITO (16/10) + porta OU (19/10):** fabricar as peças na bancada; montar
      alavanca→fio→lâmpada; a porta E só com as DUAS, a OU com UMA. No tablet: a alavanca é fácil
      de acertar com o dedo e dá pra distinguir ligada de desligada **de longe**? Dá pra
      diferenciar E de OU olhando a mesa? E o aluno sem terreno é barrado com a frase do chat.

- [ ] **Lote de 15/10:** no tablet, a lista de comandos do ALUNO (10) tem de caber **sem rolar e
      sem sumir atrás do teclado**. Se ainda sumir, anotar **se o CAMPO de digitar some junto**
      (aí é o `--kb` do aparelho, em `chat.ts`) e a orientação. E o painel unificado: G / 👥 /
      `/amigos` abrem o MESMO painel na aba "amigos".

- [ ] **Lote de 10/10:** Ctrl+C num mundo cheio e reabrir; e o botão **restaurar** no mundo convertido do singleplayer.
- [ ] **§🪓 machado e pá:** fabricar os dois; sentir se árvore de MÃO NUA ficou chata (1,5 s, `DUREZA`); ícones distinguíveis a 1024×600.
- [ ] **Heartbeat (bug-675) — AINDA ABERTO, o mais importante:** em 10/10 as quedas diminuíram
      mas não zeraram. Falta saber: quantos caíram, se viram o MOTIVO na tela, e se cai sempre o
      mesmo aparelho — a sobra pode ser outra causa. *(13/10: queda por silêncio agora exige 3
      perguntas de verdade.)*
- [ ] **Logs (não lidos ainda):** `mundos/<nome>/logs/` — o par com data/hora, e o `-chat.log` só com fala de gente.
- [ ] **Presença (bug-672):** reentrar com o mesmo nome (a volta tem de ser NA HORA); e se os 15 s não derrubam ninguém no Wi-Fi da escola (`constants.ts`).
- [ ] **Loja:** preço de ITEM e reabrir o mundo (sumia na releitura do save).
- [ ] **Ids 16 bits:** abrir o mundo da turma no host (nasce `<nome>.antes-ids16.ljw`).
- [ ] **Cama/torre:** deitar perto e longe, levantar pulando; torre de pular+colocar no Wi-Fi da escola (latência do bug-652). E o **bug-650** com turma cheia.

## Depois

- [ ] Ovelha + lã de verdade (§🍖 F8).
- [ ] Sentar na cadeira.

## Ideias / talvez

- [ ] Uniforme/skin por escola — não começado.
- [ ] Cross-school networking e mini-campeonato — adiados.
- [ ] Impedir mintar Dimas de graça criando nome novo (hoje só avisa).
