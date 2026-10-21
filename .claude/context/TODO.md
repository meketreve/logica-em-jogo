---
updated: 2026-10-20
tier: 3
active: true
---

# TODO

> O backlog DETALHADO (1300+ linhas, com spec de cada ideia) continua em **`todo.md`** na raiz.
> Aqui fica só a fila de trabalho. Ideia nova do usuário vai pro `todo.md`, não para cá.

## Agora

> ⚠️ **A fila de código está PARADA de propósito.** São seis lotes do §🔌 sem aula nenhuma; a
> próxima aula vale mais que o próximo lote. O que está abaixo só começa depois dela.

- [x] **§💰 `/vender` — o balcão de venda** (2026-10-20): a primeira FONTE de Dimas. Painel
      (4º tipo do `ContainerPanel`), preço unitário sob cada slot, total no rodapé, vender
      CRIA o Dimas. Portão varre toda receita/cozimento contra máquina de Dimas.
      ✓ verify + `npm run shots:venda` (25 asserções).
- [ ] **§🔌 fase 1** (spec na seção §🔌 do `todo.md` da raiz): **botão** (pulso — precisa de
      prazo por célula, que o motor não tem) e **porta automática** (1ª saída que não é luz;
      mexe no gate de claim) → **verify:** seção nova na `shots:circuito`, no molde da C3.
- [ ] **Decisões dele, pendentes:** luz COLORIDA (3 canais na grade, no save e na propagação —
      lote grande) e a curva de brilho no projetor (só se afina vendo).


## Testar na escola — **AULA DE 21/10, ele traz os logs**

- [ ] **§🔌 — a AULA que decide tudo (6 lotes sem teste).** Roteiro, do mais novo pro mais velho:
      **placa** (fabricar com 2 pedregulhos, pisar; dá pra ver que afundou? duas placas numa
      porta E com DOIS alunos vira desafio ou correria? atrapalha quem só anda?) · **desenho**
      (a alavanca em pé × deitada se lê de longe no projetor? os pinos de entrada acesos são
      notados antes da lâmpada? a lâmpada de 14 "lava" a sala de noite? a luz suave melhorou ou
      só clareou tudo?) · **objetivo `acender`** (criar pelo painel → tipo "acender"; "peça(s)
      fora do lugar" é entendido por criança de 10 anos? "zerar progresso" deixa pronto pro
      grupo seguinte?) · **peças** (E só com as DUAS, OU com UMA; dá pra diferenciar E de OU
      olhando a mesa? aluno sem terreno é barrado com a frase do chat?).

- [ ] **Launcher — o ciclo da AULA:** [10] criar o plano → construir a aula em cima → [11]
      publicar → abrir a publicada com DUAS turmas seguidas e conferir que a 2ª entra do jeito
      que ele montou (o que a 1ª mexeu não pode aparecer). O ciclo foi provado aqui com arquivo;
      o que falta é com turma. E se a aula 7 (corrida), agora visível na [8], abre certo.
- [ ] **§💰 o balcão, na aula:** `/vender` com trigo na mão — a criança entende que pôr no
      balcão **não** é vender? O total em amarelo é lido antes de ela apertar? O "2 cada" sob o
      slot responde "por que diamante vale mais"? E a frase da tábua recusada ("só compra o que
      você COLHE") faz sentido pra ela, ou ela acha que o jogo travou?
- [ ] **Lote de 15/10:** no tablet, a lista de comandos do ALUNO — agora **11**, o `/vender`
      entrou — cabe **sem rolar e sem sumir atrás do teclado**? Se sumir, anotar **se o CAMPO de digitar some junto** (aí é o
      `--kb` do aparelho, em `chat.ts`). E G / 👥 / `/amigos` abrem o MESMO painel.

- [ ] **Lote de 10/10:** Ctrl+C num mundo cheio e reabrir; e o botão **restaurar** no mundo convertido do singleplayer.
- [ ] **§🪓 machado e pá:** fabricar os dois; sentir se árvore de MÃO NUA ficou chata (1,5 s, `DUREZA`); ícones distinguíveis a 1024×600.
- [ ] **Heartbeat (bug-675) — a AULA que confirma a causa.** 20/10 atacou o que a pista dele
      aponta (palma na barra de navegação, só nas turmas pequenas): tela cheia que se SEGURA e
      "voltar" virando menu de pausa. Agora o `-eventos.log` diz **por qual porta** cada um
      saiu — **ler esse arquivo é o item**: quantas linhas "fechou a página" × "ficou sem
      responder". Se sobrar "sem responder", aí sim é rede/15 s. E perguntar à turma se alguém
      viu o menu de pausa abrir sozinho (é o "voltar" fazendo efeito).
- [ ] **Logs (não lidos ainda):** `mundos/<nome>/logs/` — o par com data/hora, o `-chat.log` só
      com fala de gente, e agora as linhas `<nome> saiu: <motivo>` no `-eventos.log`.
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
