---
updated: 2026-10-20
tier: 3
---

# Aprendizados

> Só o que muda o que eu faço em TODA sessão (este arquivo carrega sempre). O registro completo
> — Decision Log inteiro, ~2900 linhas — está em **`LEARNINGS-completo.md`**: **ler antes de
> decidir arquitetura.** Busca: `~/.claude/skills/contexto/scripts/index.sh`.

## Preferências do usuário

- **Ele é o TI da escola e testa NA ESCOLA logo depois de cada push**, reportando na hora: eu
  empurro → ele joga com a turma → volta com bug e pedido misturados num parágrafo só. Separar
  o parágrafo em itens é comigo.
- **Commit vai DIRETO na `main`, sem branch e sem PR.** Fim de lote = commit + push **com
  entrada nova no changelog**.
- **`npm version` não existe mais** (2026-08-27): o launcher compara COMMIT, nunca semver. Ordem
  de push: bloco novo no `client/src/changelog.ts` → `npm run build` → `npm run verify` →
  commit com o `client/dist` junto (a escola roda o dist, não o src).
- **"Anotar ideia" significa ESCREVER no `todo.md`, não implementar.**
- **Feature grande ou "talvez" → ENTREVISTA de escopo antes de codar** — e marcar como decisão
  dele é barato: ele decide rápido e sem discussão.
- **Quando vai ficar AFK, quer as perguntas TODAS de uma vez.** Perguntar cedo, em bloco.
- **Não tem medo de churn**, mas renomear coisa VISÍVEL ao aluno pede levantamento **com
  recomendação e custo medido** junto.
- **Exige polimento de SENSAÇÃO, não só "funciona"**; convenção de Minecraft é o padrão em
  dúvida de UX; uma tela = um botão "voltar".
- **Dev é 100% vibecode: ele orquestra e não revisa código** — a arquitetura e os portões
  carregam o peso, e os comentários explicam o PORQUÊ.
- Fala português. **Mobile: a régua é 1024×600 (Kindle Fire)**, tablet maior herda.

## Pegadinhas

- **Nunca medir cor lendo o canvas WebGL pela página** — `drawImage` fora do frame devolve preto
  e o A/B "passa" com 0/0 (bug-540). As sondas decodificam o PNG do CDP por causa disso.
- **Gesto de TOQUE só se testa com `Input.dispatchTouchEvent` do CDP**, nunca com clique sintético.
- **`LJ_NOVO=1` NÃO recria mundo que já existe** — apagar a pasta antes.
- **Headless a 1280×720 dá tela cinza intermitente**; `--virtual-time-budget` falseia tempo.
- **Resumo de bateria tem de sobreviver ao `| tail`** — veredito no fim, nunca no meio.

## Erros a não repetir

- [2026-10-20] [sonda] [✗] Seção nova numa sonda de MUNDO COMPARTILHADO sem coluna própria e sem limpar o que criou — a da placa pôs a lâmpada em cima do fio da porta E e derrubou uma seção TRÊS telas adiante. O sintoma foi o A/B dar o MESMO número duas vezes, que nesta sonda é a assinatura de medir outra coisa.
- [2026-10-20] [sonda] [✓] A/B de pixel exige CÂMERA PARADA: andar um bloco muda o tamanho da peça na tela e contamina a medida. Na placa, o controle virou TIRAR a peça de sob os pés (apagar célula com jogador dentro é permitido; criar não é).
- [2026-10-19] [circuito] [✓] Peça que se PISA tem de sair do `isSolidBlock`: sólida, o portão do bug-605 ("jogador dentro de bloco sólido") RESGATA quem pisar e a peça nunca liga. E o `/bloco` (como o `place_block`) recusa criar bloco em célula com jogador — não dá pra nascer sob os próprios pés, o que muda o arranjo de qualquer sonda que a teste.
- [2026-10-19] [luz] [✓] Luz suavizada por vértice = média de até 4 células POR CANTO, e as células que VEDAM são puladas (não contadas como zero): contá-las dá oclusão de canto, que é outra decisão de aparência e empasta em projetor. O atributo teve de virar Uint16 (dois canais em 1/16 de nível) — arredondar a média pro nível inteiro devolve o degrau que a suavização veio tirar.
- [2026-10-19] [desenho] [✓] Diferença de estado que mora só na COR não existe em aula: projetor ruim, 1024×600 e daltonismo comem as três (alavanca ligada×desligada, fio, pino). A diferença tem de ser SILHUETA ou LUZ — e isso se prova no mesher (geometria, exata), não na sonda de pixel, que não separa cor de forma.
- [2026-10-19] [desenho] [✓] "Conecta?" é UMA função (`ligacaoDoCondutor`), usada pelo motor E pelo mesher: desenho que não é a topologia do motor mostra fio ligado onde o sinal não passa — o pior defeito possível num jogo cujo produto é ENXERGAR a lógica.
- [2026-10-19] [circuito] [✓] Porta lógica se descreve por TABELA (`PORTAS` com o id base + `LIGA` com a regra), nunca por `isPortaX` por tipo: a OU entrou sem um `if` novo no motor, e `base + 4 + direção` deixou estado e frente saírem da aritmética. Porta nova = duas entradas na tabela.
- [2026-10-19] [objetivo] [✓] Objetivo que checa CIRCUITO confere contra a FOTO da área, não contra o mundo: o alvo ("1 lâmpada") vem da foto, senão quebrar a lâmpada fechava o objetivo em 0/0. `comEstado(id, false)` canoniza o estado — ligado/desligado é o que o aluno TEM o direito de mudar; peça trocada é que é "fora do lugar".
- [2026-10-19] [teste] [✗] `toContain` em frase que o SERVIDOR monta — deixou passar "objetivo concluído: objetivo concluído: X" (prefixo dos dois lados) e quem viu foi o PRINT da sonda. Frase inteira se afirma com `toEqual`.
- [2026-10-19] [protocolo] [✓] CARACTERE não é byte: todo teto de texto contava caractere (`MAX_CHAT_LENGTH`, `MAX_QUADRO_TEXTO`) e emoji custa 4 — teto novo de texto vem em PAR (caracteres + bytes, o menor ganha, `cortarEmBytes` corta em fronteira de code point). E teto por CAMPO só vale depois do parse: o do frame cru mora no funil da `GameSession` **e** no `maxPayload` do `ws` (os interceptadores do host parseiam antes dela).
- [2026-10-16] [receitas] [✗] Acrescentar receita no MEIO da composição de `receitas.ts` — o ÍNDICE é a identidade no protocolo, e as 4 do circuito no fim do `MATERIAIS` empurraram todas as seguintes (o smoke: "nasceu 1 fornalha (0)"). Lista nova entra por ÚLTIMO.
- [2026-10-16] [circuito] [✓] Bloco novo com FORMA própria precisa sair do `isFullCube` — sem isso o `emitShape` nem é chamado e ele sai CUBO CHEIO (o fio virou parede). E forma baixa demais passa por baixo da MIRA (olho = pé+1,6): a alavanca tem 12/16 porque com 8/16 o ▣ oferecia "colocar" em cima dela.
- [2026-10-16] [sonda] [✗] Janela de pixel que pega mais de uma peça — a "tabela-verdade" da porta E passava medindo a ALAVANCA ao lado. Janela no que MUDA, arranjo que isola.
- [2026-10-16] [ids] [✓] O intervalo `1..MAX_BLOCK_ID` deixou de ser o conjunto dos blocos (os circuitos começam em 256 e 251-255 ficaram vazios): quem varre ids usa `blocoExiste`, derivado da tabela.
- [2026-10-15] [ui] [✓] Painel com ABAS: a porta da aba que está À VISTA fecha, a de OUTRA aba troca — uma regra pras três portas (tecla, botão do dedo, comando). `toggle()` cego fechava a tela que o aluno tinha acabado de pedir; e comparar com a aba PEDIDA (não com a resolvida) deixa a porta só abrindo quando a aba não existe.
- [2026-10-15] [protocolo] [✓] Estado que a UI precisa não se lê do CHAT: o pedido de `/tpp` só existia como texto, então o painel oferecia a turma toda no `/tpa`. Mensagem própria (`tp_pedidos`), com o que FALTA do prazo (`emMs`) e não um horário — relógio de tablet não bate com o do host.
- [2026-10-15] [comandos] [✓] No painel do dedo, LISTA ganha de digitação: nó com candidatos vira NÍVEL (a turma em `/tpp`, `/amigos convidar`, `/expulsar`), e `preencher` só sobra onde ninguém pode listar (id e quantidade do `/dar`, sala vazia). Mandar o aluno pro teclado é o que o painel existe pra evitar.
- [2026-10-15] [comandos] [✓] A árvore de comandos mora no SHARED (`comandos.ts`), ao lado do gate de `runCommand`: é o único lugar onde `npm test` roda, e o portão de paridade lê a lista do "Comando desconhecido" — comando novo no servidor sem entrada na tabela reprova no mesmo commit.
- [2026-10-15] [mobile] [✓] "Botão escondido atrás do teclado" era LISTA, não geometria: a caixa sempre terminou acima do teclado — o que sumia eram os comandos do aluno no meio dos 26 do professor.
- [2026-10-13] [presenca] [✓] Queda por silêncio se cobra por PERGUNTAS, nunca por relógio: host travado não conta contra o aluno — 3 perguntas carimbadas + janela da última (sobra do bug-675).
- [2026-10-13] [presenca] [✓] Nome em jogo + PIN certo = TOMADA DE POSSE (quem volta entra na hora, o fantasma cai); o gate do bug-061 vira o ÚLTIMO passo — recusa clássica só pra nome online SEM identidade.
- [2026-10-13] [teste] [✓] Portão que lê artefato de RUNTIME não versionado derruba clone limpo — `it.skipIf(!existsSync(...))`; a cobertura incondicional fica com o que está no git.
- [2026-10-15] [sonda] [✗] Bateria inteira sem olhar `git status` depois — `shots:fundo` é GERADORA (reescreve `menu-fundo/*.png`, ~5 MB versionados).
- [2026-10-10] [sonda] [✓] Matar o Chrome pelo GRUPO (`detached` + SIGKILL — um filho regrava o perfil depois do `rmSync`); e rótulo de botão é ESTADO, não identidade: quem muda de nome leva `data-acao`.
- [2026-10-10] [bench] [✗] Esperar FPS do `bench:headless` (SwiftShader varia 4,3–6,4 s no MESMO commit) — custo de FORMATO se mede no codec, em Node.
- [2026-10-03] [build] [✗] Rótulo auto-referente (sha do HEAD) em artefato VERSIONADO — o dist virava função do HEAD e calava o portão (bug-673). Carimbar data, não sha.
- [2026-10-05] [smoke] [✗] Confiar em smoke sem conferir HOST ÓRFÃO na porta — dois hosts de 5 h
  atrás faziam o `inventario` "falhar" com números CRESCENTES. `ps` antes; matar por PID.
- [2026-10-05] [smoke] [✓] Cenário que afirma "UM arquivo" tem de LIMPAR a própria pasta no
  começo — ela sobrevive mesmo com `LJ_NOVO=1` e a 2ª rodada reprova por defeito que não existe.
- [2026-10-05] [contexto] [✗] Carimbar data de cabeça em LEARNINGS/BUGS — escrevi 06 num dia 05
  e desalinhei o `index.sh`, que ordena por data. Conferir com `date +%F`.
- [2026-10-05] [voo] [✓] Estado do voo vale POR SAVE: nasce desligada, abre voando só se o modelo foi salvo com `/voo ligar` (o confinamento tem override pra `somenteLeitura`; o voo não pode ganhar um igual).
- [2026-10-05] [log] [✓] Antes de "resolver arquivo grande", MEDIR o que o enche (o chat.log de 344 KB era 2434 linhas de `servidor:` e zero de aluno).
- [2026-10-05] [shell] [✗] `pkill -f "tsx server/src/index.ts"` casa com o PRÓPRIO shell que o roda — matar por porta ou PID.
- [2026-10-03] [teste] [✗] Provar portão do dist com mudança que a minificação engole — mexer em string VISÍVEL.
- **Não aceitar "passou" sem CONTROLE NEGATIVO** — teste que passa com a feature desligada não testa nada.
- **Não confiar em "typecheck 0" escrito no STATUS sem rodar.**
- **Duas listas do mesmo conjunto é um bug esperando a próxima feature** — derivar de uma tabela só (§🪓 EXIGIR × ACELERAR).
- **Asserção de smoke não pode correr contra o TICK** — esperar a condição, nunca um `sleep` seco.
- **Nada de detector automático de bug** — `BUGS.md` é escrito à mão ou não é escrito.

## Decisões e o porquê

O Decision Log completo (todas as decisões ativas, com data e razão) está na seção
`## Decision Log` de **`LEARNINGS-completo.md`**. As mais quentes:

- [2026-10-03] [jogo] [✓] Dureza própria pra madeira (tronco 1500 ms, trabalhada 1000) — sem
  ela os 4 níveis de machado empatavam no piso de 150 ms. Decisão do usuário; é **o número
  mais provável de precisar afrouxar** depois da 1ª aula.
- **[2026-09-23] [✓] EXIGIR e ACELERAR são tabelas diferentes** (`EXIGE` × `IDEAL_DIRETO` em
  `shared/src/ferramentas.ts`); portão varre todo id pra nada passar a exigir os dois.
- **[2026-09-22] O andaime de contexto foi desmontado até o osso** — de 33 arquivos pra 3; o
  índice (`anatomy.md`) saiu: achar código é com `grep`, que nunca desatualiza.
- **[2026-09-17] A ferramenta vale na MÃO, não na mochila**; zerada a durabilidade, ela SOME
  (com aviso e som) em vez de virar "quebrada".
