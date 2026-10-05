---
updated: 2026-10-06
tier: 3
---

# Aprendizados

> Só o que muda o que eu faço em TODA sessão — este arquivo é importado e carrega sempre.
> O registro completo (User Preferences, Key Learnings, Do-Not-Repeat e o Decision Log inteiro,
> ~2900 linhas) está em **`.claude/context/LEARNINGS-completo.md`** — era o `.wolf/cerebrum.md`.
> **Ler o completo antes de decidir arquitetura ou gerar código de um assunto novo.**

## Preferências do usuário

- **Ele é o TI da escola e testa NA ESCOLA logo depois de cada push**, reportando na hora. O
  ciclo real é: eu empurro → ele joga com a turma → volta com bug e pedido misturados num
  parágrafo só. Separar o parágrafo em itens é comigo.
- **Commit vai DIRETO na `main`, sem branch e sem PR** ("é push na main e já"). Fim de lote =
  commit + push **com entrada nova no changelog**.
- **`npm version` não existe mais neste projeto** (2026-08-27). O launcher da escola compara
  COMMIT, nunca semver. Ordem de push: bloco novo no `client/src/changelog.ts` → `npm run build`
  → `npm run verify` → commit com o `client/dist` junto (a escola roda o dist, não o src).
- **"Anotar ideia" significa ESCREVER no `todo.md`, não implementar.**
- **Feature grande ou "talvez" → ENTREVISTA de escopo antes de codar.** Quando marco algo como
  decisão dele, ele decide rápido e sem discussão — então marcar é barato e vale a pena.
- **Quando vai ficar AFK, quer as perguntas TODAS de uma vez.** Perguntar cedo, em bloco.
- **Não tem medo de churn** ("o projeto está em desenvolvimento"), mas antes de renomear coisa
  VISÍVEL ao aluno quer o levantamento **com recomendação e custo medido** junto.
- **Exige polimento de SENSAÇÃO, não só "funciona".** Convenções de Minecraft são o padrão
  esperado em dúvida de UX. Uma tela = um botão "voltar".
- **Dev é 100% vibecode: ele orquestra e não revisa código.** A arquitetura e os portões é que
  carregam o peso — por isso os comentários explicam o PORQUÊ, não o quê.
- Fala português; responde bem a blocos numerados.
- **Mobile: a régua é 1024×600 (Kindle Fire).** Tablet maior herda.

## Pegadinhas

- **Nunca medir cor lendo o canvas WebGL pela página** — `drawImage` fora do frame devolve preto
  e o A/B "passa" com 0/0 (bug-540). As sondas decodificam o PNG do CDP por causa disso.
- **Gesto de TOQUE só se testa com `Input.dispatchTouchEvent` do CDP**, nunca com clique
  sintético.
- **`LJ_NOVO=1` NÃO recria mundo que já existe** — apagar a pasta antes.
- **Headless a 1280×720 dá tela cinza intermitente**; `--virtual-time-budget` acelera os timers e
  falseia qualquer medição de tempo.
- **Resumo de bateria tem de sobreviver ao `| tail`** — o veredito vai no fim, não no meio.

## Erros a não repetir

- [2026-10-03] [build] [✗] Rótulo auto-referente (sha do HEAD) dentro de artefato VERSIONADO —
  o `client/dist` virava função de "qual commit é o HEAD agora", sujava a árvore a cada push e
  calava o portão do dist (bug-673). Ou o rótulo mente por um commit, ou o artefato nunca
  estabiliza: carimbar data, não sha.
- [2026-10-06] [voo] [✓] Estado do voo vale POR SAVE, aula incluída — nasce desligada, abre
  voando só se o modelo foi salvo com `/voo ligar`. Nada a codar: o conserto do bug-674 já
  produzia isso. Virou teste-portão porque o `confinamento` tem override pra `somenteLeitura` e
  o voo não pode ganhar um igual.
- [2026-10-05] [log] [✓] Antes de "resolver arquivo grande", MEDIR o que o enche — o chat.log de
  344 KB era 2434/2434 linhas de `servidor:`, zero de aluno. Só segmentar por data teria
  entregado dezenas de arquivinhos igualmente inúteis; o conserto foi separar fala de gente de
  evento de sistema.
- [2026-10-05] [shell] [✗] `pkill -f "tsx server/src/index.ts"` para encerrar um host de teste —
  o padrão casa com a linha de comando do PRÓPRIO shell que o roda, que morre antes das linhas
  seguintes (um restore de arquivo ficou pra trás assim). Matar por porta ou por PID guardado.
- [2026-10-03] [teste] [✗] Provar que um portão PEGA algo usando mudança que a minificação
  engole — acrescentei um comentário no `client/src` e o bundle saiu idêntico, então o "teste"
  passou sem testar nada. Para exercitar o portão do dist, mexer em algo que chega no bundle
  (uma string visível).

- **Não aceitar "passou" de um teste sem rodar o CONTROLE NEGATIVO.** Um teste que passa com a
  feature desligada não está testando nada.
- **Não confiar em "typecheck 0" escrito no STATUS sem rodar.**
- **Duas listas do mesmo conjunto é um bug esperando a próxima feature** — derivar de uma tabela
  só (foi o que o §🪓 fez com EXIGIR × ACELERAR, e o que o bug-671 pagou por não ter feito).
- **Asserção de smoke não pode correr contra o TICK** — esperar a condição, nunca um `sleep` seco.
- **Nada de detector automático de bug.** Já encheu o registro de 148 entradas falsas uma vez;
  elas foram podadas à mão. `BUGS.md` é escrito à mão ou não é escrito.

## Decisões e o porquê

O Decision Log completo (todas as decisões ativas, com data e razão) está na seção
`## Decision Log` de **`LEARNINGS-completo.md`**. As três mais quentes:

- [2026-10-03] [jogo] [✓] Dureza própria pra madeira (tronco 1500 ms, trabalhada 1000) — sem ela
  os 4 níveis de machado empatavam no piso de 150 ms. Decisão do usuário entre 3 réguas, e é **o
  número mais provável de precisar afrouxar** depois da 1ª aula: derrubar árvore de mão nua
  dobrou, e é a primeira coisa que a turma faz.
- **[2026-09-23] [✓] EXIGIR e ACELERAR são tabelas diferentes** (`EXIGE` × `IDEAL_DIRETO` em
  `shared/src/ferramentas.ts`). Machado e pá aceleram sem barrar; há portão de teste varrendo
  todo id pra garantir que nada passe a exigir os dois.
- **[2026-09-22] O andaime de contexto foi desmontado até o osso** — de 33 arquivos pra 3. Índice
  de arquivos (`anatomy.md`) saiu junto: achar código é com `grep`, que nunca desatualiza.
- **[2026-09-17] A ferramenta vale na MÃO, não na mochila**, e ao zerar a durabilidade ela SOME
  (com aviso e som) em vez de virar "quebrada".
