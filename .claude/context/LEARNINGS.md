---
updated: 2026-10-23
tier: 3
---

# Aprendizados

> Só o que muda o que eu faço em TODA sessão (este arquivo carrega sempre). O registro completo
> — Decision Log inteiro, ~2900 linhas — está em **`LEARNINGS-completo.md`**: **ler antes de
> decidir arquitetura.** Busca: `~/.claude/skills/contexto/scripts/index.sh`.

## Preferências do usuário

- **Comandos no chat com PAPEL e painel do dedo: APROVADO em aula** (2026-10-20, ele:
  "ficaram bons, muito bons"). O padrão "lista ganha de digitação" se repete sem perguntar.
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

- [2026-10-23] [ui] [✓] Tecla de UI que mora SÓ no `keydown` do campo morre no primeiro clique fora (relato dele: chat do PC preso aberto com Enter e Esc). O par é um listener de janela em CAPTURA, ativo só com a UI aberta, ignorando alvo que seja campo de texto. ⚠️ E keydown cujo alvo é a **própria janela** (o que toda sonda dispara) **não tem captura nem bolha**: os listeners de `window` viram "no alvo" e correm na ordem de REGISTRO — o `Input` registra primeiro e ABRE, o meu fechava no mesmo evento. Guarda: comparar `e.timeStamp` com o instante da abertura, nunca confiar na fase.
- [2026-10-23] [contexto] [✗] Cortar linha de DENTRO do bloco `<!-- auto -->` pra caber no teto — levei o `auto:end` junto e o `--check` acusou "unbalanced auto markers": a partir daí o `init.sh` **não toca mais no arquivo**. O teto conta só o que está FORA do bloco, então é de lá que se corta. E rewrap não corta: o teto é LINHA, não caractere — tem de fundir ou apagar linha inteira.
- [2026-10-20] [portão] [✗] Portão de SCRIPT por menção passa com a feature desligada, e eu caí nisso DUAS vezes no mesmo dia: `includes("LJ_PRESET") && /plano/i` casava com os comentários que explicam a opção, e `/aula-/` casava com o TEXTO do prompt. Confere a ATRIBUIÇÃO exata (`set "X=..."`, `X="aula-$X"`), e a janela de busca começa na DEFINIÇÃO da sub-rotina (no .bat a 1ª menção é a `call`, e a janela seguinte pega o menu GERAL). **Controle negativo em portão de texto não é opcional** — foi ele que pegou as duas.
- [2026-10-20] [launcher] [✓] Menu com lista de opções ESCRITA À MÃO apodrece calada: as aulas [2]–[7] param na 6 e `cenarios/aula7-corrida.ljw` vinha no pacote **invisível no menu inteiro** (só `mundos/` era varrida). Opção de abrir varre as DUAS pastas; mundo `_*` (fixture de smoke/sonda) sai da lista.
- [2026-10-20] [mundo] [✓] Duas regras invisíveis do mundo NOVO: (a) preset é IGNORADO no tamanho E — lazy nasce vazio e gera andando, então "plano gigante" entrega morro (menu do plano pergunta só P/M/G, com portão); (b) nome começado em "aula" = REUTILIZÁVEL (`ehMundoDeAula`, pelo NOME do arquivo): nunca salva a turma, sempre carrega do modelo — pra base que o professor ainda vai CONSTRUIR isso é perder o trabalho dele, e o launcher recusa o nome.
- [2026-10-20] [mobile] [✓] Tablet caindo do jogo **só nas turmas pequenas** = palma da mão na BARRA DE NAVEGAÇÃO do Android, não rede nem o botão de sair. A tela cheia já era pedida ao entrar, mas **ninguém a restaurava quando caía** — e no Chrome do Android o 1º "voltar" SAI DA TELA CHEIA em vez de sair da página: a criança não nota, a barra reapareceu, e daí toda palma alcança Home. `requestFullscreen` exige GESTO, então restaurar é em dois tempos (anota que caiu, pede no próximo toque).
- [2026-10-20] [sonda] [✗] Evento de navegador SINTÉTICO pra simular estado que o headless JÁ tem: o `fullscreenchange` falso deu falso negativo (o headless estava em tela cheia de verdade). Provocar o estado DE VERDADE e deixar o evento nascer do navegador.
- [2026-10-20] [log] [✓] Pergunta de aula sem resposta no log é bug de observabilidade: só `author: "servidor"` virava linha, saída não era anunciada, e o motivo vivia em `console.log` do stdout (a janela do launcher que ninguém lê). Motivo que não se DISTINGUE não responde nada — o smoke exige frases diferentes por porta.
- [2026-10-20] [economia] [✓] Venda ao sistema com preço escolhido no olho é máquina de Dimas: o PORTÃO (`venda.test.ts`) varre toda `RECEITAS` e toda `COZIMENTO` e reprova saída que vale mais que a entrada. Ele pegou 3 canos — `1 tronco → 4 tábuas`, `1 pedregulho → 2 cascalhos` e `1 tronco → 4 FOLHAS` (este eu não tinha visto). Preço é LISTA DE PERMISSÃO do que se COLHE: 233 ids podem estar numa mochila, precificar todos é insustentável e abre o cano.
- [2026-10-20] [ui] [✓] Tipo novo no `ContainerPanel` se procura em TODO o `desenhar`: o balcão nasceu com a faixa dizendo "▲ BAÚ" e quem viu foi o PRINT, não a asserção. E slot só tinha `data-slot` (ONDE) — `data-item`/`data-qtd` entraram pra sonda não deduzir item pelo `src` do ícone.
- [2026-10-20] [sonda] [✗] Seção nova numa sonda de MUNDO COMPARTILHADO sem coluna própria e sem limpar o que criou — a da placa pôs a lâmpada em cima do fio da porta E e derrubou uma seção TRÊS telas adiante. O sintoma foi o A/B dar o MESMO número duas vezes, que nesta sonda é a assinatura de medir outra coisa.
- [2026-10-20] [sonda] [✓] A/B de pixel exige CÂMERA PARADA (andar um bloco muda o tamanho da peça e contamina a medida). E [circuito] peça que se PISA sai do `isSolidBlock`: sólida, o portão do bug-605 RESGATA quem pisar e ela nunca liga; `/bloco` e `place_block` recusam criar em célula com jogador, então ela não nasce sob os próprios pés.
- [2026-10-19] [luz] [✓] Luz suavizada por vértice = média de até 4 células POR CANTO, e as células que VEDAM são puladas (não contadas como zero): contá-las dá oclusão de canto, que é outra decisão de aparência e empasta em projetor. O atributo teve de virar Uint16 (dois canais em 1/16 de nível) — arredondar a média pro nível inteiro devolve o degrau que a suavização veio tirar.
- [2026-10-19] [desenho] [✓] Estado que mora só na COR não existe em aula (projetor, 1024×600, daltonismo): tem de ser SILHUETA ou LUZ, e isso se prova no mesher (geometria), não na sonda de pixel. E "conecta?" é UMA função (`ligacaoDoCondutor`) usada pelo motor E pelo mesher — desenho fora da topologia mostra fio ligado onde o sinal não passa.
- [2026-10-19] [circuito] [✓] Porta lógica se descreve por TABELA (`PORTAS` + `LIGA`), nunca por `isPortaX`: a OU entrou sem um `if` novo, e `base + 4 + direção` deixou estado e frente saírem da aritmética. E o objetivo que checa circuito confere contra a FOTO da área, não contra o mundo (senão quebrar a lâmpada fecha o objetivo em 0/0); `comEstado(id, false)` canoniza — ligado/desligado o aluno PODE mudar, peça trocada é que é "fora do lugar".
- [2026-10-19] [teste] [✗] `toContain` em frase que o SERVIDOR monta — deixou passar "objetivo concluído: objetivo concluído: X" e quem viu foi o PRINT. Frase inteira se afirma com `toEqual`.
- [2026-10-19] [protocolo] [✓] CARACTERE não é byte: todo teto de texto contava caractere (`MAX_CHAT_LENGTH`, `MAX_QUADRO_TEXTO`) e emoji custa 4 — teto novo de texto vem em PAR (caracteres + bytes, o menor ganha, `cortarEmBytes` corta em fronteira de code point). E teto por CAMPO só vale depois do parse: o do frame cru mora no funil da `GameSession` **e** no `maxPayload` do `ws` (os interceptadores do host parseiam antes dela).
- [2026-10-16] [receitas] [✗] Acrescentar receita no MEIO da composição de `receitas.ts` — o ÍNDICE é a identidade no protocolo, e as 4 do circuito no fim do `MATERIAIS` empurraram todas as seguintes (o smoke: "nasceu 1 fornalha (0)"). Lista nova entra por ÚLTIMO.
- [2026-10-16] [circuito] [✓] Bloco novo com FORMA própria precisa sair do `isFullCube` — sem isso o `emitShape` nem é chamado e ele sai CUBO CHEIO (o fio virou parede). E forma baixa demais passa por baixo da MIRA (olho = pé+1,6): a alavanca tem 12/16 porque com 8/16 o ▣ oferecia "colocar" em cima dela.
- [2026-10-16] [sonda] [✗] Janela de pixel que pega mais de uma peça (a "tabela-verdade" da porta E media a ALAVANCA ao lado): janela no que MUDA, arranjo que isola. E [ids] `1..MAX_BLOCK_ID` deixou de ser o conjunto dos blocos — quem varre ids usa `blocoExiste`.
- [2026-10-15] [ui] [✓] Painel com ABAS: a porta da aba que está À VISTA fecha, a de OUTRA aba troca — uma regra pras três portas (tecla, botão do dedo, comando). `toggle()` cego fechava a tela que o aluno tinha acabado de pedir; e comparar com a aba PEDIDA (não com a resolvida) deixa a porta só abrindo quando a aba não existe.
- [2026-10-15] [protocolo] [✓] Estado que a UI precisa não se lê do CHAT: o pedido de `/tpp` só existia como texto, então o painel oferecia a turma toda no `/tpa`. Mensagem própria (`tp_pedidos`), com o que FALTA do prazo (`emMs`) e não um horário — relógio de tablet não bate com o do host.
- [2026-10-15] [comandos] [✓] No painel do dedo, LISTA ganha de digitação: nó com candidatos vira NÍVEL (a turma em `/tpp`, `/amigos convidar`, `/expulsar`), e `preencher` só sobra onde ninguém pode listar (id e quantidade do `/dar`, sala vazia). Mandar o aluno pro teclado é o que o painel existe pra evitar.
- [2026-10-15] [comandos] [✓] A árvore de comandos mora no SHARED (`comandos.ts`), ao lado do gate de `runCommand`: é o único lugar onde `npm test` roda, e o portão de paridade lê a lista do "Comando desconhecido".
- [2026-10-15] [mobile] [✓] "Botão escondido atrás do teclado" era LISTA, não geometria: a caixa sempre terminou acima do teclado — o que sumia eram os comandos do aluno no meio dos 26 do professor.
- [2026-10-13] [presenca] [✓] Queda por silêncio se cobra por PERGUNTAS, nunca por relógio (3 carimbadas + janela da última); e nome em jogo + PIN certo = TOMADA DE POSSE — quem volta entra na hora, o fantasma cai, e o gate do bug-061 vira o ÚLTIMO passo.
- [2026-10-13] [teste] [✓] Portão que lê artefato de RUNTIME não versionado derruba clone limpo — `it.skipIf(!existsSync(...))`. E [2026-10-15] [sonda] [✗] bateria sem olhar `git status` depois: `shots:fundo` é GERADORA (~5 MB versionados).
- [2026-10-10] [sonda] [✓] Matar o Chrome pelo GRUPO (`detached` + SIGKILL — um filho regrava o perfil depois do `rmSync`); rótulo de botão é ESTADO, não identidade (quem muda de nome leva `data-acao`). E [bench] [✗] esperar FPS do `bench:headless` (SwiftShader varia 4,3–6,4 s no MESMO commit) — custo de FORMATO se mede no codec, em Node.
- [2026-10-03] [build] [✗] Rótulo auto-referente (sha do HEAD) em artefato VERSIONADO — o dist virava função do HEAD e calava o portão (bug-673). Carimbar data, não sha.
- [2026-10-05] [smoke] Dois jeitos de o smoke mentir: [✗] HOST ÓRFÃO na porta (dois hosts de 5 h atrás faziam o `inventario` "falhar" com números CRESCENTES — `ps` antes, matar por PID); [✓] cenário que afirma "UM arquivo" tem de LIMPAR a própria pasta no começo (ela sobrevive ao `LJ_NOVO=1` e a 2ª rodada reprova por defeito que não existe).
- [2026-10-05] [contexto] [✗] Carimbar data de cabeça em LEARNINGS/BUGS — escrevi 06 num dia 05
  e desalinhei o `index.sh`, que ordena por data. Conferir com `date +%F`.
- [2026-10-05] [voo] [✓] Estado do voo vale POR SAVE: nasce desligada, abre voando só se o modelo foi salvo com `/voo ligar` (o confinamento tem override pra `somenteLeitura`; o voo não pode ganhar um igual).
- [2026-10-05] [log] [✓] Antes de "resolver arquivo grande", MEDIR o que o enche (o chat.log de 344 KB era 2434 linhas de `servidor:` e zero de aluno).
- [2026-10-05] [shell] [✗] `pkill -f "tsx server/src/index.ts"` casa com o PRÓPRIO shell — matar por porta ou PID. E [2026-10-03] [teste] [✗] provar portão do dist com mudança que a minificação engole: mexer em string VISÍVEL.
- **Não aceitar "passou" sem CONTROLE NEGATIVO** — teste que passa com a feature desligada não testa nada; e não confiar em "typecheck 0" escrito no STATUS sem rodar.
- **Duas listas do mesmo conjunto é um bug esperando a próxima feature** (derivar de UMA tabela). **Asserção de smoke não pode correr contra o TICK** (esperar a condição, nunca `sleep` seco); e **nada de detector automático de bug** — `BUGS.md` é escrito à mão ou não é escrito.

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
