---
updated: 2026-10-10
tier: 3
---

# Aprendizados

> Só o que muda o que eu faço em TODA sessão (este arquivo carrega sempre). O registro completo
> — Decision Log inteiro, ~2900 linhas — está em **`LEARNINGS-completo.md`**: **ler antes de
> decidir arquitetura.** Busca: `~/.claude/skills/contexto/scripts/index.sh`.

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
- **Não tem medo de churn**, mas renomear coisa VISÍVEL ao aluno pede levantamento **com
  recomendação e custo medido** junto.
- **Exige polimento de SENSAÇÃO, não só "funciona"**; convenção de Minecraft é o padrão em dúvida
  de UX; uma tela = um botão "voltar".
- **Dev é 100% vibecode: ele orquestra e não revisa código** — a arquitetura e os portões carregam
  o peso, e os comentários explicam o PORQUÊ.
- Fala português. **Mobile: a régua é 1024×600 (Kindle Fire)**, tablet maior herda.

## Pegadinhas

- **Nunca medir cor lendo o canvas WebGL pela página** — `drawImage` fora do frame devolve preto
  e o A/B "passa" com 0/0 (bug-540). As sondas decodificam o PNG do CDP por causa disso.
- **Gesto de TOQUE só se testa com `Input.dispatchTouchEvent` do CDP**, nunca com clique
  sintético.
- **`LJ_NOVO=1` NÃO recria mundo que já existe** — apagar a pasta antes.
- **Headless a 1280×720 dá tela cinza intermitente**; `--virtual-time-budget` falseia tempo.
- **Resumo de bateria tem de sobreviver ao `| tail`** — veredito no fim, nunca no meio.

## Erros a não repetir

- [2026-10-10] [sonda] [✓] Rótulo de botão é ESTADO, não identidade — procurar elemento no DOM
  pelo TEXTO quebra no instante em que a cena interessa (o ▣ vira "interagir" mirando uma
  fornalha, e era isso que matava o `f10-shot`). Botão que muda de nome leva `data-acao`, e a
  sonda busca por ele; o texto só serve pra AFIRMAR o que está escrito.
- [2026-10-10] [bench] [✗] Esperar do `bench:headless` resposta sobre FPS — duas rodadas do
  MESMO commit deram 4,3 s e 6,4 s de carga e 9 a 13 fps (SwiftShader). Custo de FORMATO se mede
  em Node, sem GPU: o A/B dos ids de 16 bits só ficou legível no codec (arquivo +0,02%, RAM do
  mundo 2 MB → 4 MB, decode 5,1 → 6,9 ms num mundo P).
- [2026-10-10] [smoke] [✗] Acreditar em falha da bateria COMPLETA rodada junto com sonda/bench
  pesado — `mundo` e `troca-raio` reprovaram com a máquina carregada e passaram sozinhos e na
  rodada limpa (18/18). Repetir a bateria sozinha antes de caçar.

- [2026-10-03] [build] [✗] Rótulo auto-referente (sha do HEAD) dentro de artefato VERSIONADO —
  o `client/dist` virava função de "qual commit é o HEAD agora", sujava a árvore a cada push e
  calava o portão do dist (bug-673). Ou o rótulo mente por um commit, ou o artefato nunca
  estabiliza: carimbar data, não sha.
- [2026-10-05] [smoke] [✗] Confiar em resultado de smoke sem conferir se há HOST ÓRFÃO na porta
  — dois hosts meus de 5 h antes seguravam 8101/8102 e o `inventario` passou a "falhar" com
  números que CRESCIAM a cada rodada (9→18→27→45). Parece bug do jogo e não é.
  `ps -eo pid,cmd | grep server/src/index` antes de acreditar, e matar por PID. Matar a SONDA
  por PID deixa o Chrome dela órfão (ela só o mata no fim): conferir
  `ps -eo pid,cmd | grep "lj-"` e apagar o `--user-data-dir` (são ~57 MB cada em /tmp).
- [2026-10-05] [smoke] [✓] Cenário que afirma "UM arquivo" tem de LIMPAR a pasta dele no começo —
  a pasta sobrevive entre rodadas mesmo com `LJ_NOVO=1`, e a 2ª execução reprova por defeito que
  não existe. Foi o que aconteceu com o `_smoke-logs` que escrevi hoje.
- [2026-10-05] [contexto] [✗] Carimbar data em entrada de LEARNINGS/BUGS de cabeça — escrevi
  2026-10-06 num dia 05 e desalinhei o `index.sh`, que ordena por data. Conferir com `date +%F`
  antes de datar.
- [2026-10-05] [voo] [✓] Estado do voo vale POR SAVE, aula incluída — nasce desligada, abre
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
