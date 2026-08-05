# STATUS — Projeto "Lógica em Jogo" (jogo voxel educacional)

> Single source of truth for resuming work. Read this FIRST when starting a session.
> **SESSÃO 46 (2026-08-05) — O §🍖 F10 INTEIRO, NUMA SESSÃO.** O usuário respondeu as cinco
> perguntas que travavam a fila e mandou o escopo grande: *"pode fazer tudo da f10 na ordem que
> achar melhor"*. Ordem executada, uma frente por commit: **F10a → F10b → F10e → F10f → F10c →
> F10d**. A abertura foi `git fetch` (a rotina desde a 40): local em dia com o remote.
>
> **As cinco decisões dele, e o que cada uma custou:** a fornalha SUBSTITUI a receita de vidro ·
> o graveto entra como ITEM e a tocha vira 1 graveto + 1 carvão (mineral OU vegetal) · sem
> picareta o bloco **não quebra** e mostra aviso · baú com item não quebra · confinamento barra
> interação.
>
> **🔥 A CADEIA FICOU HONESTA PONTA A PONTA.** Era isto que o F10 existia pra fazer:
> **derrubar árvore → picareta de madeira → pedra → picareta de pedra → minério → fornalha →
> lingote → picareta de ferro → diamante**. Antes, o minério de ferro era um cubo bonito que
> virava balde por decreto, e metade das pontes da sessão 45 (vidro ← areia, lã ← trigo) tinha
> sido INVENTADA porque não havia forno nem ovelha. As duas foram aposentadas: o vidro sai da
> fornalha, a lã sai do algodão.
>
> **§🍖 F10a — o minério larga ITEM, e a tocha ganhou um cabo.** Carvão e diamante são os dois
> minérios que no Minecraft não vão ao forno: a rocha entrega o material. Ferro e ouro
> continuam caindo como BLOCO de propósito — é o bloco que a fornalha funde, e **é essa
> diferença entre os quatro que ensina pra que serve fundir**. O graveto era o elo que faltava:
> a tocha saía de tábua + minério, errado dos dois lados (gastava uma tábua inteira e pedia um
> cubo de minério que agora nem cai). Virou o par do Minecraft, e o mesmo graveto é o cabo de
> toda picareta.
>
> **§🍖 F10b — A FORNALHA, e a decisão que fez o baú custar um dia.** O encanamento
> (`containers.ts`) nasceu UMA vez e serve aos dois blocos com inventário: conteúdo por POSIÇÃO
> no meta do save (o desenho do QUADRO, primeiro estado a não caber no byte), transferência num
> array CONCATENADO mochila+container reusando o núcleo de pilha do `inventario.ts`, e índice
> UNIFICADO no fio (`0..26` mochila, `27+i` container). Fazer o baú antes teria escrito isso
> duas vezes. `fornalha.ts` é simulação pura, sem relógio de parede: 100 ticks por peça, carvão
> rende **8×** a madeira. A ordem do tick está escrita e importa — **acender só se há o que
> cozinhar** (fornalha com carvão e nada dentro não gasta o carvão, que é o que qualquer criança
> espera), queimar, cozinhar. `tickFornalha` devolve o MESMO objeto quando nada muda, e é essa
> identidade que evita mensagem à toa a 10 Hz. Dois ids (apagada/acesa): a acesa não é colocável
> e **emite luz de graça**, porque a luz é função pura dos bytes.
>
> **A receita não se APAGA: ela se APOSENTA.** O índice é a identidade no protocolo, então tirar
> a linha do vidro deslocaria as 97 seguintes e o aluno com o painel aberto clicaria numa receita
> e receberia outra. `Receita.aposentada` guarda a razão; `receitaValida` e `fabricar` recusam.
>
> **§🍖 F10e — o BAÚ, e a prova de que o encanamento valeu.** Um id, uma receita (8 tábuas), dois
> tiles e uma linha no `containerTipoDe`. 27 slots. **Com coisa dentro não quebra** (decisão do
> usuário, que estendi à fornalha: mesma regra, mesma frase, mesmo gate — não existe item no
> chão, e um clique perderia a mochila que o colega guardou).
>
> **§🍖 F10f — o portão que impede a regra de furar de novo.** O teste LÊ a união
> `ClientMessage` do próprio `protocol.ts` (via `import "./protocol.ts?raw"`, e não `node:fs`,
> pra não custar `@types/node` num workspace isomórfico), acha toda mensagem com coordenada e
> exige que ela esteja coberta — por um teste de bloqueio ou por uma isenção com razão escrita
> (hoje `move` e `wand_mark`). **A/B honesto:** com um `abrir_cofre` de mentira na união, o
> portão o denuncia; com o gate do container removido, a estranha lê o baú da colega e o teste
> cai. O confinamento passou a barrar interação junto do claim, como o usuário pediu.
>
> **§🍖 F10c — a lã ganhou planta.** A plantação deixou de ser "o trigo" e virou TABELA
> (`PLANTAS = [{base, estagios}]`): `plantaDe` responde por estágio, muda, madura, forma
> canônica e colocável. Sem isso, a 2ª faixa de ids estaria escrita à mão em cinco funções — e o
> mesher, que derivava o tile de `plantacao0 + estagio`, teria dado o tile do trigo pro algodão.
> **Dois blocos, e a diferença é a pedagogia:** o cultivado (4 estágios, cresce no pulso que já
> existia, maduro dá **1–2 capulhos sorteados** + a semente — o 1º drop com quantidade aleatória
> do jogo) e o SELVAGEM do gen, que larga só semente por sorte e nunca ele mesmo. Cerrado, campo
> aberto; a caatinga fica fora porque lá o topo é areia e algodão não pega em areia.
>
> **A verificação que valeu a frente (a lição da 41, de novo):** um teste GERA um mundo de
> verdade e CONTA os pés — com o worldgen removido ele acusa zero — e confere que nenhum nasceu
> fora de solo. E um controle NEGATIVO prova que o capim continua nascendo: o algodão entrou
> ANTES dele na cadeia de `else if`, e um erro ali teria trocado a vegetação do cerrado inteiro.
>
> **§🍖 F10d — a picareta virou o portão da progressão.** 4 níveis, **sem durabilidade** (a
> pilha continua `{id, qtd}`, nenhum campo novo em lugar nenhum) e **obrigatória**: quem entra
> em sobrevivência não pega pedra até fabricar a de madeira. Sem a ferramenta certa o bloco
> **NÃO QUEBRA**, com aviso — o Minecraft quebra sem drop, mas lá existe tempo de quebra pra
> avisar antes; aqui é 1 clique, e "sumiu e não ganhei nada" é frustração de aula. Gate no
> `break_block` ANTES do `applyBlock`, e o freio de aviso virou UM por jogador.
> ⚠️ **Consequência a contar pro professor no playtest: a primeira coisa que a turma faz numa
> aula de sobrevivência passa a ser derrubar árvore.**
>
> **DESVIO DE ESCOPO, declarado:** machado e pá ficaram de fora. Exigir machado pra tirar
> madeira, quando o machado é feito de madeira, é um mundo onde ninguém começa; e como a quebra
> é instantânea, ferramenta que só ACELERA não tem onde aparecer. A tabela já é (tipo × família)
> e eles entram sem redesenho no dia em que houver tempo de quebra. **A picareta vale onde
> ESTIVER na mochila, não só na mão** — "precisa de picareta" a criança resolve; "precisa dela
> na MÃO" é um 2º enigma, e o clique não diz qual dos dois falhou.
>
> **Três bugs, os três de AUTORIA DE TESTE (a família do 560/574/575):** **bug-577** a asserção
> do smoke corria contra o tick (a tábua já tinha virado fogo quando ela foi conferir o slot);
> **bug-578** `createWorld(dims, false)` — o 2º argumento não é "lazy", é `alocar`, e sem chunks
> o teste montava um canteiro que nunca existiu; **bug-579** transferir pra slot OCUPADO é
> TROCA, não empurrão — a picareta entrava na fornalha no lugar do pedregulho e ela continuava
> cheia. A lição maior está no cerebrum: **o estado que COINCIDE é o teste traiçoeiro** —
> "apagou" e "nunca acendeu" dão o mesmo byte, e os dois testes passavam com o tick comentado.
> O conserto é o controle POSITIVO no meio: prove que aconteceu antes de provar que parou.
>
> **VERDE:** typecheck 3/3 · **697 testes** (+42) · build · **15/15 smokes** (o `fornalha` é
> novo e cobre também o baú, rodado 2× pra idempotência) · **A/B honesto em três frentes**
> (tick da fornalha, gate do claim, worldgen do algodão).
> **PLAYTEST PENDENTE — e desta vez ele tem uma pergunta específica: a turma aguenta ter de
> fazer a picareta antes de cavar?**

## 🚀 Próxima fase

**A fila do §🍖 está VAZIA de pendências decididas.** O que sobra é escolha do usuário:

1. **PLAYTEST do F10** — é o que manda. A cadeia inteira (árvore → picareta → fornalha →
   lingote) nunca passou por uma turma, e a mudança de abertura da aula (derrubar árvore antes
   de qualquer coisa) é a que mais pode surpreender.
2. **§🍖 F8 — MOBS**: a única frente do roadmap de sobrevivência ainda fora. 3+ sessões, e tem
   o aviso de GPU do laboratório pendurado nela.
3. **Prints do F10** — nenhuma tela nova foi fotografada: o painel de transferência (fornalha e
   baú), os ícones novos na hotbar e o canteiro de algodão. `npm run shots:*` roda nesta
   máquina desde a 41.
4. **Refinos que ficaram anotados**: forma de CAIXA pro baú no mesher (hoje é cubo cheio) e
   direção de frente pra fornalha (hoje a boca aparece nos 4 lados).

> **SESSÃO 45 (2026-08-05) — O PLAYTEST COM 17 ALUNOS ACONTECEU, E ELE PEDIU O QUE FALTAVA:
> COBERTURA TOTAL DE RECEITAS + O §🍖 F7 QUE ELE MESMO TINHA PULADO.** A sessão abriu com uma
> lição de processo: respondi "onde paramos?" pelo STATUS local e ele corrigiu — *"faz o fetch
> primeiro, tem coisa que não tá no repo local"*. **O local estava 14 commits atrás** (as
> sessões 41–44 foram na outra máquina). Isso já aconteceu na 40, com 3 commits: **sessão que
> começa com "onde paramos?" faz `git fetch` ANTES de responder.**
>
> **O playtest: 17 alunos, e o veredito é que o laço FECHA.** *"conseguiram fazer craft, plantar
> e comer"*. **Nenhum número foi contestado** — crescimento, chances de fruta/semente, saciedade
> e o dreno de fome ficam como estão. O que ele pediu foi o BURACO que a turma esbarrou: quase
> tudo que dá pra colocar era inalcançável em sobrevivência.
>
> **🧱 12 → 110 RECEITAS, e a decisão do dia é POR QUE inventar os elos.** Metade das cadeias do
> Minecraft passa por FORNO (vidro, tijolo, lingote) ou por MOB (lã de ovelha), e o lite não tem
> nem um nem outro — copiar a receita de lá deixaria o bloco inalcançável do mesmo jeito. Então
> cada ponte usa material que o aluno JÁ tira com a mão e cabe numa frase de professor: **vidro
> ← areia · tijolo ← terra + areia (barro seco ao sol) · lã ← trigo (a horta passa a alimentar a
> construção, e é uma ESCOLHA: o mesmo trigo faz pão) · pedra ← 2 pedregulho · tocha ← tábua +
> carvão · folhagem ← tronco da MESMA espécie · grama ← terra + o que define o clima (semente,
> areia ou neve)**.
>
> **E onde deu, a ponte virou CONTEÚDO: as 12 cores saem de FLOR, e as quatro sem flor própria
> saem de MISTURA** — laranja = amarelo + vermelho, roxo = vermelho + azul, rosa = vermelho +
> branco, ciano = azul + verde (mandacaru, que é o verde da caatinga). Misturar cor é currículo
> de sala de aula, e aqui virou receita de verdade. Uma tabela `CORES` de 12 linhas gera as 36
> receitas de lã, vidro colorido e tapete — as três famílias têm a MESMA ordem no `BlockId`.
>
> **O portão que mantém isso vivo:** um teste varre TODO id `isPlaceable`, pula variante
> (`formaCanonica` responde pela família) e professor-only, e exige que o resto esteja em
> `RECEITAS` **ou** em `SEM_RECEITA` — um mapa id → razão escrita (terreno, minério, tronco,
> flor, muda, bedrock). Bloco novo sem receita e sem razão derruba a suíte. Os **12 índices
> antigos não se mexeram**: o índice é o contrato do protocolo (`fabricar {receita}`).
>
> **§🍖 F7 — PVP, a última regra sem mecânica.** `atacar {alvo}` novo (o id é o mesmo do
> `player_moved`), **2 pontos por soco** (1 coração, 10 socos pra derrubar) e **cooldown de 5
> ticks** — sem ele quem clica mais rápido ganha, e isso não é jogo. O servidor confere regra +
> **modo dos DOIS** (quem está em criativo não bate nem apanha: é o professor supervisionando) +
> alcance + cooldown. **O alcance se mede entre POSIÇÕES, não pela linha do olhar:** a direção
> chega a 10 Hz e a caixa do alvo desliza no cliente (lerp), então validar mira no servidor
> recusaria soco legítimo. Quem mira é o cliente (`raycastJogador`, puro e testado). Mundo de
> aula força OFF, como já força criativo. `/pvp ligar|desligar` escreve na MESMA regra do
> `/regra pvp` (os dois não podem discordar) e avisa a turma inteira — quem apanha sem saber
> que ligou acha que é bug. A mensagem `modo` ganhou `pvp?` (opcional, tolerante a host antigo)
> e é ela que deixa **a mira vermelha** em cima de quem se pode socar.
>
> **Três bugs, e os dois primeiros são autoria de smoke** (a mesma família do bug-560):
> **bug-574** a rajada do cooldown caía dentro do cooldown do soco anterior e media "recusa
> tudo"; **bug-575** o laço da morte continuava socando depois do respawn — e quem renasce
> nasce NO SPAWN, ao alcance de quem bateu. **bug-576** é do meu próprio design de teste: o
> `comida.test.ts` pegava o pão por `RECEITAS[length - 1]`, e as 97 receitas novas o empurraram
> pro meio — o teste passou a fabricar um GLIFO. **Índice de receita se acha pela SAÍDA; o que
> o protocolo promete é que o 11 continua sendo o pão, não que o pão continue sendo o fim.**
>
> **Extra de UI que a lista de 110 linhas exigiu:** o painel ganhou o interruptor **"só o que dá
> pra fazer agora"** (padrão desmarcado, alvo de 40px). Com a mochila vazia, 110 linhas cinzas
> não são uma lista — são uma parede.
>
> **O bug da lista de craft que ele mandou corrigir é o bug-573** (a rolagem voltava ao topo a
> cada peça), **e ele já estava corrigido no código que o fetch trouxe** (sessão 44). Confirmado
> com ele e conferido no fonte.
>
> **SESSÃO 44 (cont.) — TRÊS DEFEITOS DE TABLET QUE SÓ O DEDO ACHARIA.** Depois do launcher, o
> usuário reportou três coisas do jogo, todas de toque: o ☰ abria o menu e ele **fechava
> sozinho levando a barra junto**; `/amigos` devia **abrir o painel** no PC e no tablet; e a
> tela de craft **voltava ao topo** a cada peça fabricada.
>
> **bug-572 — o ☰, e a armadilha mora numa linha de CSS antiga.** O botão faz
> `input.touch = false` pra o menu aparecer (`updateOverlay` decide por
> `input.active = locked || touch`). Só que o CLICK do mesmo toque ainda está a caminho: quando
> chega, o `#touch-ui` já sumiu, o hit-test cai no `#overlay` — que é **`pointer-events: none`
> de propósito** ("só o painel captura clique") — e o evento ATRAVESSA até o canvas, cujo
> handler `canvas.addEventListener("click", () => this.lock())` pede pointer lock. Com `touch`
> recém-zerado, o guarda `if (this.touch || this.locked) return` **não barra mais**: o lock é
> concedido, `input.active` volta a true e o menu recém-aberto some — com a barra escondida
> junto. **Nem menu, nem barra: o aluno fica preso.** O `preventDefault()` do `tapButton` não
> salva porque o alvo original saiu do hit-test antes do click. **Fix: `Input.touchDevice`
> (APARELHO, decidido uma vez no boot) separado do `Input.touch` (MODO, que liga e desliga na
> partida)** — em aparelho de dedo não existe pointer lock, nunca. Qualquer botão futuro que
> zere `input.touch` cairia na mesma armadilha.
>
> **§👥 `/amigos` abre o painel, e é a ÚNICA porta que serve nos dois aparelhos.** A tecla G não
> existe no tablet e o botão 👥 só aparece com a proteção de áreas ligada — em mundo livre não
> havia caminho nenhum. Intercepta no cliente, no callback do `ChatUi`: `/amigos` **sem
> subcomando** vira gesto (e o chat não recebe mais o texto de uso); **com** subcomando
> (`/amigos convidar bia`) segue pro servidor como sempre. Antes do join também segue, e aí o
> servidor responde "Entre no mundo primeiro".
>
> **bug-573 — a rolagem do craft.** Fabricar muda a mochila → `refresh()` → `render()` →
> `replaceChildren()`, e a `.craft-lista` (quem tem o `overflow-y`) nasce de novo: o `scrollTop`
> morre com o elemento velho. Doía **por clique**, porque quem fabrica repete a receita. O
> `filtroCraft` já sobrevivia aos re-renders pelo mesmo motivo; agora o `scrollCraft` também.
> **Restaurar `scrollTop` só funciona DEPOIS do append** — em elemento fora do DOM não tem
> efeito. Filtrar zera de propósito (lista nova se lê do começo).
>
> **§🔬 `scripts/toque-shot.mjs` é NOVO (`npm run shots:toque`), e ele existe porque o
> tablet-shots não conseguia ver este bug.** O tablet-shots MEDE geometria e sintetiza toque com
> `dispatchEvent(new PointerEvent(...))`, que **não gera o `click` de compatibilidade** — e era
> justamente o click que carregava o defeito. Aqui o toque vai por `Input.dispatchTouchEvent` do
> CDP: quem monta a sequência inteira é o Chrome. O pedido de pointer lock é **CONTADO**
> (monkey-patch no protótipo) porque a CONCESSÃO é flaky em headless — o mesmo build passou numa
> rodada e falhou na outra.
>
> **VERDE:** typecheck 3/3 · **578 testes** · build · **13/13 smokes** · **`shots:toque` 15/15**,
> com **A/B honesto**: com os três fixes fora, **5 asserções falham** (menu fechado,
> `pedidos=2`, painel não abre, texto de uso no chat, rolagem **324 → 0**); com eles, 15/15 e
> rolagem **324 → 324**. O print do "antes" mostra o sintoma inteiro: tela de jogo **sem menu e
> sem barra**. **PLAYTEST PENDENTE — os três nasceram de dedo, e é o dedo que confirma.**
>
> ⚠️ **Três armadilhas de harness pagas nesta rodada, todas no cerebrum:** `cdp()` sem teto
> trava MUDO (a página trava sob swiftshader e a Promise fica pendente pra sempre); o stdout do
> node BUFFERIZA fora de TTY (script morto no meio não deixa rastro); e host `detached`
> sobrevive ao `timeout` e segura a porta na rodada seguinte (`EADDRINUSE`). ⚠️ O
> **`tablet-shots.mjs` não roda nesta máquina** — falta o `LD_LIBRARY_PATH` do bug-564, que só o
> `amigos-shot.mjs` tinha (o `toque-shot.mjs` já nasceu com ele).
>
> **SESSÃO 44 (2026-08-04) — O LAUNCHER PAROU DE PULAR A ATUALIZAÇÃO (sessão curta, fora do
> jogo).** A 42 tinha só melhorado a MENSAGEM do skip; o usuário voltou pedindo o
> comportamento: *"permitir o fetch mesmo com mudanças nos arquivos, apenas deixe uma regra
> para o usuário decidir se a pasta dos mundos salvos vai ser sobrescrita"*.
>
> **O guarda de sujeira saiu da frente do `git fetch` e virou tratamento DEPOIS do merge.** A
> ordem antiga (conferir sujeira → pular tudo) trocava um problema por outro: nesta máquina o
> `.wolf/memory.md` é rastreado e muda toda sessão, então a atualização nunca acontecia. Agora
> o fetch é incondicional e o `merge --ff-only` é quem decide — e ele só reclama do arquivo que
> a atualização REALMENTE toca. **O caso que mais aparece já fica resolvido sozinho:** sujeira
> em arquivo que o update não mexe atualiza direto, sem uma pergunta (cenário B do teste).
> Quando o merge recusa, a escolha é do usuário (opção dele entre 3): **`git stash push -m
> "lj-auto"` + merge + como recuperar**. **Sem `stash pop` automático, de propósito** — pop que
> conflita deixa a pasta em conflito no meio da aula; guardado é reversível, conflito não.
>
> **§🗺️ A REGRA DOS MUNDOS, e por que ela quase não existe.** `mundos/` está no
> `.gitignore:19` e **nenhum arquivo dela é rastreado** — os únicos mundos que viajam no repo
> são os MODELOS de aula, em `cenarios/`. Ou seja: o merge nunca alcança a pasta da turma, e a
> pergunta seria um clique a mais toda aula com resposta sempre igual. Então ela é
> **CONDICIONAL**: o script confere `git diff --name-only HEAD...origin/main -- mundos/` e só
> pergunta se der match, com padrão **NÃO sobrescrever** (e aí cancela a atualização inteira).
> Quando não dá match — sempre, hoje — sai a linha *"seus mundos salvos em mundos/ não são
> tocados pela atualização"*, que é informação, não pergunta. A conferência existe pro dia em
> que alguém versionar um `.ljw` de turma por engano: o professor tem de ser avisado ANTES de a
> turma perder o que construiu.
>
> **Os hints do git foram calados** (`2>/dev/null` / `2>nul`): no ramo de divergência ele
> mandava o professor rodar `git rebase` / `git merge --no-ff` em inglês, 10 linhas antes da
> mensagem em português. A mensagem honesta em português basta.
>
> **VERDE:** `bash -n` · **6 cenários rodados no `.sh` com fixture git de verdade** (upstream
> bare + clone "escola" + stub de `npm`): **A** sujeira NO arquivo do update → stash+merge, HEAD
> avança, trabalho no stash · **B** sujeira em OUTRO arquivo → merge direto, mudança local
> intacta (era o caso pulado) · **C** mundos tocados + Enter → cancela, HEAD parado · **D**
> mundos tocados + "s" → sobrescreve · **E** divergência real → mensagem limpa, nada mexido ·
> **F** recusar o stash → nada mexido. **Os 4 primeiros rodados TAMBÉM no `cmd.exe` DE VERDADE**
> (via `/mnt/c`, com `git.exe` do Windows). Controle negativo no repo real: o guarda dos mundos
> não dispara (`git diff -- mundos/` vazio). **Código do jogo não foi tocado.**
>
> **bug-571, e é o bug-569 outra vez:** os 4 cenários do `.bat` deram verde **exercitando só as
> respostas VAZIAS**. `chcp 65001` (1ª linha do `.bat`) faz o `set /p` ler **vazio** de arquivo
> redirecionado, então o único cenário com resposta não-vazia ("s" pra sobrescrever mundos)
> falhou em silêncio. Mini-repro A/B isolou o `chcp`; `(echo s&echo.)` também não serve
> (entrega `"s "` com espaço). O que funciona: `call resp.cmd | iniciar-servidor.bat`.
>
> **SESSÃO 43 (2026-08-04) — AS DUAS FRENTES QUE O USUÁRIO ESCOLHEU: §🍖 F9 (PRESET DE
> SOBREVIVÊNCIA) E O PAINEL DE AMIGOS.** Perguntado onde parávamos, ele respondeu "f9 e
> interface do /amigos" — e as duas fecharam nesta sessão.
>
> **§🍖 F9 — o preset NÃO virou um quarto `WorldPreset`, e essa é a decisão do dia.** O
> ROADMAP dizia `LJ_PRESET=sobrevivencia` ao lado de `plano|cabines`, mas terreno e partida
> são eixos DIFERENTES: se "sobrevivencia" entrasse no union, todo `preset === "normal"`
> espalhado pela geração (a água, o veto de boca de caverna no spawn) passaria a excluir a
> sobrevivência **em silêncio**, e ainda ficaria impossível querer sobrevivência em mundo
> plano. Virou `SessionOptions.sobrevivencia`, ortogonal, com um teste que prova que **os
> bytes do mundo saem idênticos com e sem o flag**. O token de fora é traduzido num lugar só
> (`ehPresetSobrevivencia`, reusando o `parseModo` — aceita "sobrevivência" com acento).
>
> **O que ele faz é o que o professor teria de digitar na frente da turma:** `modo
> sobrevivencia` no mundo + **ciclo dia/noite ligado** (sem noite, sobreviver não significa
> nada). **O que ele deliberadamente NÃO grava: pvp e confinamento** — já nascem no valor
> certo pelos próprios padrões, e o save guarda só o DIFF; escrevê-los prenderia o mundo ao
> padrão de hoje. Mundo de AULA continua vencendo o preset (criativo, ponto), e `restore`
> ignora (o .ljw traz o que gravou). Três hospedeiros: `LJ_PRESET=sobrevivencia` (atalho de
> uma variável) **ou** `LJ_SOBREVIVENCIA=1`, que COMPÕE com terreno plano · `sobrevivencia`
> no init do worker · e um select **"como jogar"** no formulário de mundo novo do menu.
>
> **§👥 PAINEL DE AMIGOS — e o buraco que só o painel revelou.** `client/src/friends.ts`
> (`FriendsPanel`, molde do `players.ts`, root `#amigos`), tecla **G** nova, e uma dica no
> chat quando a proteção de áreas LIGA (a única hora em que "quem pode construir na minha
> área" vira pergunta). Nenhuma função nova, como pedido: convites recebidos com
> aceitar/recusar · o grupo com **N/6**, expulsar (só dono) e "sair e DESFAZER o grupo"
> armado em 2 cliques · a lista de quem convidar, montada de quem está online.
> **bug-568:** `/amigos convidar` mandava o feed `friends` só pro CONVIDADO — e é ali que o
> time NASCE, com quem convidou dentro. Com comando de chat ninguém notava (a resposta
> textual bastava); com painel, o botão parecia morto. Agora o feed volta pros dois, o
> `recusar` avisa quem convidou, o `aceitar` avisa quem teve o convite descartado, e a
> mensagem ganhou **`enviados`** (opcional, tolerante) pro "aguardando" existir na tela.
>
> **A verificação é a lição de sempre, de novo (bug-569):** a 1ª rodada do
> `npm run shots:amigos` deu ✓ em "a dona pode expulsar" **com o grupo vazio** — o
> `innerText` do painel contém a DICA do rodapé, que cita `/amigos expulsar nome`; e o
> clique por rótulo pegou a linha da bia em vez da do caio, porque a lista é ordenada por
> nome. Asserção passou a ler os RÓTULOS DOS BOTÕES e o clique vai por LINHA.
>
> **§📱 A BARRA DE TOQUE — 3ª frente da sessão, e ela FECHOU o pendente das outras duas.**
> Eram 6 botões fixos em 1024×600 e só 3 de jogo. O critério que ficou (vale pro próximo
> botão que alguém quiser pôr lá): **é de jogo? fica. É de sessão ou diagnóstico? menu de
> pausa. Serve só num modo? nasce escondido.** Então: ☰ 🧱 💬 sempre · **🪄 varinha** só pra
> quem pode usá-la (professor, ou aluno com a proteção de áreas ligada) · **👥 amigos** só
> com a proteção ligada — que é exatamente quando "quem constrói na minha área" vira
> pergunta, e é o que **destrava o painel de amigos no tablet**. ⛶ tela cheia e 📊 desempenho
> desceram pro menu de pausa (o clique de botão É o gesto que o navegador exige).
> **A varinha deixou de ser toggle invisível:** ligada, o botão fica destacado e **⛏/▣ viram
> ① canto 1 / ② canto 2**.
>
> **bug-570, que só apareceu porque a barra passou a ser MEDIDA:** os botões dela tinham
> **30px** de alvo — abaixo do piso de 40 que o resto da UI respeita desde a 1ª rodada
> mobile. Atravessou as duas rodadas inteiras porque as medições do `tablet-shots.mjs`
> cobriam hotbar, chat, inventário e painéis, e não a barra. Agora ela tem 5 linhas lá
> (rótulos visíveis, alvo mínimo, largura contra a janela, relabel da varinha).
>
> **VERDE:** typecheck 3/3 · **578 testes** (+13) · build · **13/13 smokes** (o `preset` é
> novo, rodado 2× pra idempotência) · `npm run shots:amigos` com 13 asserções e **2 prints
> conferidos** (convite recebido / dona de grupo 2/6) · `npm run shots:tablet` verde, com o
> A/B do alvo da barra (30 → 40px, 433px de 1024) e o print `11-jogo-barra-varinha`.
> **PLAYTEST PENDENTE — e agora é ele que manda.**
>
> **SESSÃO 42 (2026-08-04) — SESSÃO CURTA, FORA DO JOGO: O LAUNCHER PARAVA DE PROCURAR
> ATUALIZAÇÃO EM SILÊNCIO.** O pedido foi conferir se `iniciar-servidor.sh/.bat` busca versão
> nova antes de subir o servidor — "está aparecendo uma mensagem que a atualização não está
> sendo buscada". **Busca sim; ele nunca chegava no `git fetch`** (bug-567).
>
> **A causa é a mordida da própria cauda:** o guarda de sujeira
> (`git status --porcelain --untracked-files=no`) roda ANTES do fetch e pula a atualização
> inteira se qualquer arquivo RASTREADO estiver modificado — e nesta máquina o hook do OpenWolf
> escreve em `.wolf/memory.md`, que é rastreado, em TODA sessão. Numa máquina de escola (sem
> Claude Code) o `.wolf` nunca suja e o script funciona como projetado; o defeito real era de
> UX: a mensagem não dizia QUAIS arquivos sujaram, então o skip era indiagnosticável.
>
> **Fix aplicado (opção do usuário entre 3): a mensagem passou a LISTAR os arquivos sujos**,
> teto de 10 + "(são N no total)" + a linha dizendo como voltar a atualizar. Nos dois scripts.
> No `.bat`, o `del` do arquivo temporário do `git status` teve de mover pra DEPOIS do uso —
> ele era apagado antes de dar pra ler.
> **O que eu NÃO fiz, de propósito: excluir `.wolf/` do teste de sujeira.** Commits `docs(wolf)`
> tocam `memory.md` quase toda sessão, então o `merge --ff-only` recusaria logo adiante e o
> aviso sairia com a razão ERRADA — a mensagem honesta é melhor que o skip movido de lugar.
>
> **VERDE:** `bash -n` + execução real do `.sh` com stub de `npm` (listou os 5 sujos de
> verdade) · ramo do >10 conferido · **bloco do `.bat` rodado no `cmd.exe` DE VERDADE**
> (via `/mnt/c`), nos dois ramos (3 e 13 arquivos), com o fixture apagado no fim.
> **Código do jogo não foi tocado — a fila do §🍖 continua onde a 41 deixou.**
>
> ⚠️ **Armadilha de diário anotada no cerebrum:** escrevi `| --:-- |` no `memory.md` por não
> saber a hora e o hook do `stop` avisou "no semantic summary" com a linha lá — a regex de
> `countSemanticEntries` (`.wolf/hooks/shared.js:630`) exige dígitos na hora. `date +%H:%M`
> antes de escrever.
>
> **SESSÃO 41 (2026-08-04) — O USUÁRIO PULOU O F7. DÍVIDA DE UI, E O CHROME DO NOTEBOOK
> RESOLVIDO.** Sessão aberta com `git fetch`: o local estava 4 commits atrás (a sessão 40 foi
> na máquina de casa), `pull --ff-only` limpo depois de descartar o cabeçalho de sessão VAZIO
> que o hook escreve no diário — **é a 2ª sessão seguida em que isso acontece; virou rotina de
> abertura.** Perguntado o que vinha depois, o usuário respondeu **"vamos pular o pvp"** e
> escolheu o lote de UI: borda de claim + 2ª rodada mobile.
>
> **A descoberta que destrava tudo nesta máquina: o chrome NÃO "não instala" no notebook.** O
> `npx @puppeteer/browsers install` **baixa os 190 MB, falha na extração por falta de `unzip`
> e mesmo assim sai com código 0** — foi esse exit 0 que fez as sessões 39 e 40 concluírem que
> a máquina não dava. Sem sudo: zip do chrome-for-testing + `python3 -m zipfile -e` +
> **`chmod +x` em TODOS os binários** (o zipfile do python perde o bit de execução, e sem o
> `chrome_crashpad_handler` executável o processo aborta) + libs por `apt-get download` /
> `dpkg-deb -x` / `LD_LIBRARY_PATH`. **Os scripts de print agora rodam nas DUAS máquinas.**
>
> **§🖼️ BORDA DE ÁREA RESERVADA ALÉM DO RAIO (pedido do usuário de 2026-08-03).**
> `RegionRenderer.cularPorDistancia(px, pz, raio)` novo: guarda os limites ao lado das caixas,
> esconde a que está além do raio pela MESMA régua chebyshev em x/z do descarte de coluna, e
> reaplica sozinha quando a lista troca. Chamado na varredura de 1×/s que já existia — **e
> DENTRO do `if (mundoLazy)` de propósito**: só o procedural descarta coluna; em mundo denso o
> mundo inteiro está montado e cular esconderia borda sobre terreno visível. As caixas de
> OBJETIVO ficam de fora (são alvo de navegação, têm de ser vistas de longe) — quem não chama
> o método continua desenhando tudo.
> **A verificação foi mais cara que o patch, e é a lição da sessão:** o teste passou DUAS vezes
> com o patch removido — 1º porque a área de teste caiu fora dos limites do mundo P (128×128) e
> nunca foi criada, 2º porque o three.js já corta por frustum e mundo P é denso. Só em mundo
> **E** (lazy), com `raioRender` baixado pra 2 no `localStorage` antes de entrar e 4 áreas a 60
> blocos nas 4 direções, o A/B falou a verdade: **sem o patch as 4 somam +1 draw call, com o
> patch somam 0, e a área perto continua desenhando** (bug-566).
>
> **§📱 2ª RODADA MOBILE — os painéis de AUTORIA.** O `scripts/tablet-shots.mjs` parava no
> inventário; agora abre o `#painel` e o `#jogadores`, e **semeia o painel pelo chat** (2
> regiões, 4 grupos, 2 objetivos) antes de medir — painel de mundo novo é quase vazio e a
> medição diria "cabe" sobre nada. **O baseline desmentiu a hipótese que estava no TODO:** a
> aposta era que as linhas quebravam por falta de largura; com o painel populado quebram só
> 4 de 19. **O defeito real que apareceu foi outro: 7 selects de 28px e 5 campos de 26px** — o
> bloco `@media (pointer: coarse)` cobria `#painel button` desde a 1ª rodada, mas nunca cobriu
> campo nem select, justamente onde o professor monta o objetivo. Fix: 40px de piso neles, e o
> `#painel`/`#jogadores` entraram no alargamento de paisagem baixa que o inventário já tinha.
> **A/B: selects 28→40, campos 26→54, linhas quebradas 4→3.** No caminho, bug-565: o detector
> de quebra comparava `top` dos filhos e virou falso-positivo assim que os alvos cresceram
> (`.painel-row` centraliza) — passou a medir ALTURA.
>
> **VERDE:** typecheck 3/3 · 565 testes · build · print do painel a 1024×600 conferido.
> **3 anotações novas no TODO a pedido do usuário** (interface do `/amigos`; a barra de toque
> com 6 botões; e o `/pvp` que ele pulou continua na fila). **PLAYTEST PENDENTE.**
>
> **SESSÃO 40 (2026-08-04) — §🍖 F6: A COMIDA, E A FOME QUE VOLTOU A MATAR.** Sessão aberta
> com `git fetch`: o local estava **3 commits atrás** (as sessões 38 e 39 foram feitas em
> outra máquina). Um `checkout` descartou o cabeçalho de sessão VAZIO que o hook tinha
> escrito no diário e o `pull --ff-only` trouxe o F5 inteiro. Depois, duas perguntas de
> escopo — o padrão das sessões 36 e 39 — e **o usuário escolheu GRANDE nas duas.**
>
> **A decisão do dia: `VIDA_MINIMA_POR_FOME` 6 → 0. A fome MATA de novo.** O F3 tinha travado
> a inanição em 3 corações porque não havia o que comer; agora há três coisas. O
> `textoDaMorte("fome")`, escrito na sessão 35 e nunca disparado, passa a acontecer — e o
> teste da session prova a morte pelo chat da turma. Continua reversível numa linha, e a saída
> pro fundamental 1 segue sendo `/regra fome desligar`, que tira a barra da tela.
>
> **O desenho que decidiu a frente inteira: CRESCER NÃO É REGRA DE VIZINHANÇA.** A fila de
> células sujas acorda por "alguém mexeu aqui do lado" — e planta não cresce por vizinho, ela
> cresce por TEMPO. Se `crescerPlantacao` estivesse no `rulesMap`, colocar um bloco ao lado da
> horta a amadureceria na hora. Então ela ficou **fora** do registro (é um `BlockRule` puro,
> testável igual aos outros) e a session a chama num PULSO, a cada `TICKS_POR_CRESCIMENTO`
> (200 ticks = 20 s por estágio, ~1 min da semente ao trigo), varrendo um índice
> `plantacoes` de células plantadas. O índice nasce e morre dentro do `applyBlockQuieto` — a
> mesma porta por onde TODA mudança de mundo passa, então não existe horta fora dele — e no
> `restore` ele **se reconstrói dos BYTES**: nenhum campo novo no `.ljw`, e mundo antigo abre
> sem migração. No `rulesMap` a plantação entra só pelo APOIO: cavar a terra derruba a horta.
>
> **As duas fontes, e por que duas.** A **fruta da folha** (1 em 8) é PASSIVA: quem só explora
> não passa fome, e nenhuma aula trava porque a turma não entendeu a horta. A **plantação** é
> ATIVA e é onde mora a pedagogia — semente do capim (1 em 4) → plantar em SOLO → esperar →
> colher **trigo + a semente de volta** → 3 trigo = 1 pão. **O trigo não se come de
> propósito:** é a dependência que transforma comida em sequência de 4 passos, em vez de um
> botão. As chances são muito mais generosas que as do Minecraft (maçã de folha lá é 1/200)
> porque aqui a unidade de tempo é a AULA, não a temporada.
>
> **`isSolo` e `apoioValido`:** planta não nasce em pedra, e essa é a regra que o aluno
> descobre na primeira tentativa. O detalhe que importa é que a pergunta é UMA — o gate do
> `place_block` e a regra do tick chamam a mesma função, senão dava pra colocar uma muda onde
> ela evaporaria no tick seguinte. **Comer não cura vida** (a vida já volta pela regeneração,
> que exige fome alta) e **de barriga cheia a mordida é RECUSADA**, senão o clique jogaria
> comida fora.
>
> **Três bugs, e um deles estava anotado desde a sessão 36:** **bug-558** o capim FLUTUAVA —
> `precisaApoio()` listava a grama alta, mas os 3 ids nunca entraram no `rulesMap`, e quem
> derruba o que perdeu apoio é a regra do tick, não o place. **bug-559** `/dar` recusava
> comida: a lista de exceções era "o balde", escrita à mão quando ele era o único item do
> jogo → virou `isItem()`, um Set explícito (a banda ≥900 não é intervalo aberto). **bug-560**
> era autoria de smoke: a asserção esperava o byte 182 e achava 183, porque o próprio smoke
> acelera o relógio com `LJ_CRESCIMENTO=5`.
>
> **VERDE:** typecheck 3/3 · **565 testes** (+28) · build · **12/12 smokes** (o `comida` é
> novo: prova pelo fio que a horta cresce no tick e chega como `block_changed` normal, que só
> pega em solo, que colher dá trigo + semente, que 3 trigo viram pão, e que comer gasta uma
> unidade) · **3 prints do F6 conferidos** (hotbar com os 4 ícones novos, atlas com os 4
> estágios, receita do pão filtrada) — **e o print do painel de craft que estava pendente da
> sessão 39, porque o chrome existe NESTA máquina.** **PLAYTEST PENDENTE.**
>
> **SESSÃO 40 (cont.) — §🏁 MAPA DE CORRIDA (`aula7-corrida.ljw`).** O usuário pediu "um mapa
> de corrida para aula". Corrida não é objetivo de CONSTRUIR: é `chegar`, que o motor tinha
> desde o cp12 e nunca tinha sido usado num cenário — a 1ª aula em que ninguém constrói nada.
>
> **Antes de codar, uma extração:** o `Autoria` (o "professor de mentira" que digita os comandos
> do cenário) morava dentro do `gerar.ts`, que roda uma CLI no corpo do módulo — importar dele
> geraria os 6 cenários como efeito colateral. Saiu pra `autoria.ts`, e os 6 `.ljw` regeneraram
> **byte a byte idênticos** antes de eu escrever uma linha da corrida.
>
> **A pista:** largada → escada → posto1 → vão com ponte de 1 bloco → posto2 → ziguezague →
> posto3 (na curva) → serpentina → chegada com pódio. Modo SEQUENCIAL: o HUD mostra um posto por
> vez, e o próximo só aparece quando a equipe fecha o atual — o aluno não escolhe a ordem, ele
> descobre que existe uma. **Os 3 primeiros postos são `um`** (basta um da equipe) **e a CHEGADA
> é `todos`**: quem correu na frente volta a buscar quem ficou. Corrida que premia só o mais
> rápido não deixa o que discutir no fim.
>
> **O verificador é o que fez a frente valer, e ele é o portão:** (1) acha caminho ANDÁVEL por
> BFS com o passo do jogador (sobe/desce no máximo 1), (2) faz uma aluna CORRER esse caminho e
> exige os 4 postos NA ORDEM, (3) exige que TODA célula do fundo do vão volte à pista. Os três
> pegaram erro real, e nenhum deles eu tinha visto lendo o próprio código: **bug-561** os
> corredores eram abertos na ponta -x e, em mundo plano, dava pra sair e contornar a pista pela
> grama (0 postos fechados); **bug-562** o posto 3 era faixa vertical numa curva que vira em z —
> dava pra driblar por fora; **bug-563** o vão tinha 1 de fundura (cavei só a camada do piso, e
> o plano é maciço abaixo), então a conferência da rampa passava **com a rampa removida** — e,
> cavado de verdade, apareceu o problema sério: a PONTE por cima parte o fundo em duas metades
> incomunicáveis e prende quem cai do lado sem rampa. Rampa espelhada + a conferência passou a
> exigir o fundo INTEIRO.
>
> **Mundo de aula de graça:** arquivo que começa com `aula` é read-only e reutilizável
> (`ehMundoDeAula`) — cada turma recebe a pista intacta e o confinamento nasce ligado, que aqui
> é a proteção da pista (ninguém cava atalho; o professor conserta).
>
> **VERDE:** typecheck 3/3 · 565 testes · build · 12/12 smokes · **7 cenários gerados** (a
> corrida passa pelo próprio portão) · 5 prints da pista (`npm run shots:corrida`).
> **PLAYTEST PENDENTE** — headless corre em linha reta; só o dedo diz se a pista é divertida.
>
> **SESSÃO 39 (2026-08-03) — §🍖 F5: CRAFT POR LISTA + O BALDE VIROU ITEM. Fecha numa sessão.**
> O usuário mandou "sigo pro F5" e escolheu o escopo GRANDE nas duas perguntas: **incluir o
> balde** (fecha o pendente do F4) e **receitas de madeira + pedra**. Antes de codar, uma
> interrupção do usuário virou anotação no TODO (não renderizar borda de área reservada além do
> raio de render) — backlog é pra ANOTAR.
>
> **`shared/src/receitas.ts` (puro):** `Receita { saida, custo[] }`, a lista `RECEITAS` é
> **APPEND-only** porque o índice é a identidade da receita no protocolo (`fabricar {receita}`).
> `podeFabricar`/`fabricar` são **tudo-ou-nada numa cópia** (consome os custos e só credita a
> saída se tudo saiu E ela cabe — senão o clique sumiria com os ingredientes), e `ingredientesDe`
> devolve have/need/falta por id pro "falta 3 tábua" do painel. Onze receitas: 4 troncos→tábuas,
> tábuas→laje/escada/mesa/cerca, pedregulho→laje/escada, e **3 minério de ferro → 1 balde vazio**
> (não é o número do Minecraft, mas não há forno no lite pra virar lingote).
>
> **O balde fechou o pendente do F4:** o `case balde` da session agora tem dois mundos. Em
> criativo o servidor NÃO exige item na mão (paleta infinita — e foi assim que o smoke criou uma
> fonte). Em sobrevivência ele **confere o balde no slot ANTES de mexer na água** (recusa não
> deixa rastro no mundo) e troca vazio↔cheio **NO MESMO slot** (`definirSlot` novo — trocar por
> remover+adicionar jogaria o balde pra outro slot e o aluno perderia o que segura). O slot viaja
> no `slot?` novo da mensagem `balde`. O ramo do balde no `main.ts` saiu do guarda `mochila.ativa`
> — em survival ele lê o item do slot do servidor e não escreve o próprio inventário.
>
> **Cliente:** o painel do E ganhou **abas mochila/criar**; a lista de craft é **tocar-pra-
> fabricar** (a linha inteira é o botão, o gesto do tablet), com "falta N" em vermelho, filtro de
> texto que re-renderiza SÓ as linhas (o foco do campo não pisca) e a hotbar do pé só mostra o
> que a mão segura. `fabricar {receita}` é a única mensagem nova client→server.
>
> **VERDE:** typecheck 3/3 · **537 testes** (+15 novos em `receitas.test.ts`) · build · **11/11
> smokes** (`craft` é novo: prova pelo fio que fabricar é do servidor, consome/credita, recusa
> por falta calado, criativo não fabrica, e o balde troca vazio↔cheio no mesmo slot — rodado 2×
> pra idempotência). **bug-557:** o smoke tentou criar a fonte com `/bloco <id da água>`, que é
> RECUSADO (água não é colocável, só entra por balde) — corrigido com o balde do professor.
> **PRINT DO PAINEL PENDENTE:** o chrome do puppeteer não está instalado nesta máquina (cache
> vazio) e não instalou no orçamento; o painel é DOM puro espelhando a mochila do F4, que já
> funciona. **PLAYTEST do usuário pendente** (headless não tem dedo pra tocar a receita).
>
> **SESSÃO 38 (2026-08-03) — SYNC COM O REMOTE + BALDE QUEBRA NO CRIATIVO (sessão curta).**
> O usuário pediu para clonar o repo por cima de uma cópia local desatualizada SEM `.git`:
> `git init` + `remote add` + `fetch` + `reset --hard origin/main` (renomeando `master`→`main`),
> preservando os untracked locais (`.wolf/`, `.claude/`, `node_modules/`). 91 arquivos-lixo
> `:Zone.Identifier` (artefato de download do WSL/Windows) apagados. **A mudança de jogo:** o
> balde (vazio OU cheio) agora QUEBRA bloco no modo criativo — antes `client/src/main.ts` (clique
> esquerdo) travava a quebra sempre que a mão segurava balde (`isBalde(...) → return`); agora só
> trava em sobrevivência (`&& modoAtual !== "criativo"`). O clique DIREITO do balde segue igual
> (despeja/recolhe fonte de água). O SERVIDOR não mudou: `break_block` (session.ts:984) nunca
> olhou o item na mão e em criativo `inventarioVale` é false → sem drop, quebra direto. **VERDE:**
> typecheck 3/3. **PLAYTEST PENDENTE** (headless não clica). A fila do jogo segue no §🍖 F5 (craft).
> **SESSÃO 37 (2026-08-03) — OS HOOKS PARARAM DE MENTIR (sessão curta, fora do jogo).** O
> pedido foi "corrigir erros com os hooks": os três falso-positivos que a sessão 36 documentou
> e não consertou. Os três são bug agora (554/555/556) e estão corrigidos em `.wolf/hooks/`,
> **que é código rastreado deste repo** — a lição de fundo é essa: hook do OpenWolf se
> conserta, não se contorna.
>
> **A descoberta que explica por que o fix upstream nunca chegou:** o pacote 2.0.1 traz DUAS
> cópias dos hooks — `dist/hooks/` (build do `tsconfig.hooks.json`, tem o PR #64) e
> `dist/src/hooks/` (build principal do tsc, não tem). O `copyHookScripts` do `init.js` procura
> nessa ordem e **a segunda vence**. Todo `openwolf init/update` instalou a versão velha,
> inclusive o commit `192acff`, que dizia sincronizar com o 2.0.1.
>
> **(1) "no semantic summary"** comparava DATA, e não havia data nenhuma para casar: o prefixo
> `| YYYY-MM-DD` não existe no diário (o formato que o próprio aviso pede é `| HH:MM |`), e o
> header `## Session:` é gravado no INÍCIO da sessão misturando data UTC com hora local — sessão
> que atravessa a meia-noite fica com a data de ontem. Agora conta abaixo do ÚLTIMO
> `## Session:`, **sem olhar data**. **(2) "buglog.json was not updated"** via só
> `session.files_written`, que só recebe Write/Edit — append por `python3` no Bash era invisível.
> Agora o **mtime** do arquivo também vale. **(3) A linha `Session end:` repetida** era append de
> contador CUMULATIVO a cada `stop`; agora só grava quando o resumo muda e **sobrescreve** a
> linha do fim do arquivo. As 41 cópias já gravadas foram colapsadas (só elas mudaram no diário).
>
> **VERDE:** `node .wolf/hooks/_test-hooks.mjs` **10/10** — roda o `stop.js` DE VERDADE numa
> fixture de `/tmp` e prova também o lado negativo (sessão sem resumo ainda avisa, buglog
> intocado ainda avisa, linha mecânica não passa por resumo semântico). No `memory.md` real o
> contador foi 0 → 1 ao escrever a entrada. ⚠️ O patch foi copiado à mão para as duas cópias do
> pacote global (`.bak-pre-fix` ao lado): **`pnpm update -g openwolf` apaga**, e aí a fonte é
> `.wolf/hooks/`. **O código do jogo não foi tocado** — a fila continua no §🍖 F5.
>
> **SESSÃO 36 (2026-08-03) — §🍖 F4: O INVENTÁRIO AUTORITATIVO. A "frente cara" (2–3 sessões
> no orçamento) fechou INTEIRA numa sessão.** O usuário pediu "continuar" e, antes, registrar
> no TODO a regra de vegetação precisar de apoio. Registrando, achei o buraco de verdade:
> `precisaApoio()` JÁ lista grama alta, mas `GramaAlta/Seca/Fria` (179–181) **não estão no
> `rulesMap`** — o capim flutua hoje. Ficou anotado com o fix (um `for` de 3 ids apontando pro
> `torchRule`), não implementado, porque o pedido foi registrar.
>
> **A mochila é ESTADO DO SERVIDOR, por NOME** (como o modo e os vitais — sobrevive ao rejoin e
> à troca de aula). 27 slots: 9 hotbar + 18 mochila, pilha de 64. `shared/src/inventario.ts` é
> puro e IMUTÁVEL (toda função devolve inventário novo, disciplina do `sobrevivencia.ts`), e
> `tamanhoStack(id)` já nasce com a porta pra ferramenta: hoje só o balde é 1 por slot.
>
> **`shared/src/drops.ts` tem duas regras e uma tabela curta.** (1) **Forma canônica**: porta
> aberta, cama virada pro sul e escada de cabeça pra baixo voltam como a entrada da HOTBAR —
> senão o aluno ganharia item que não sabe recolocar, e a direção sai do olhar dele no
> `place_block`, não do byte guardado. (2) **Por padrão o bloco cai ele mesmo** (desfazer tem de
> ser reversível numa aula); só grama→terra, pedra→pedregulho, folha/água/bedrock→nada fogem
> disso. Um teste-portão varre TODOS os ids e prova que nada cai em algo não-colocável ou
> só-de-professor.
>
> **Onde o débito mora: no MESMO ponto pós-`switch` que o esforço do F3.** "O mundo mudou" =
> "a colocação valeu", então porta e cama (2 células) custam UM item e os 4 ramos de
> materialização cobram sozinhos. **bug-549 saiu daí:** o detector era
> `changedThisTick.size > antes`, e aquilo é um CONJUNTO de coordenadas — quebrar e recolocar a
> MESMA célula no mesmo tick de 100 ms não mexia no tamanho, então a colocação saía DE GRAÇA
> (bloco infinito por clique rápido; o esforço do F3 também escapava). Virou contador
> monotônico `edicoesAplicadas`, incrementado dentro do `applyBlockQuieto`, com teste de
> regressão.
>
> **Mochila cheia RECUSA a quebra** (não existe item no chão — decisão travada no ROADMAP): a
> conferência vem ANTES do `applyBlock`, pra que a recusa não deixe rastro no mundo, e o aviso
> no chat tem freio de 5 s porque quebrar é clique repetido. O crédito vem DEPOIS de o mundo
> mudar, e a segunda metade da porta/cama — que o `doorRule`/`camaRule` apaga no tick seguinte —
> não passa por lá: uma porta não vira duas.
>
> **`manter-inventario` finalmente decide alguma coisa** (`matar()` lê a regra; desligada, a
> mochila some inteira) e saiu do `RegraDef.pendente`. Só o `pvp`/F7 ainda avisa "falta a
> mecânica".
>
> **`/dar <eu|all|nome> <id> [qtd]` é NOVO e está FORA do escopo travado** — decisão minha, e o
> usuário pode reverter. Razão: com inventário autoritativo o mundo de sobrevivência começa com
> todo mundo de mãos vazias e não há craft até o F5, então sem ele o professor não prepara
> atividade nem conserta acidente. É a contraparte do `/bloco` (teleoperação: não custa esforço,
> não exige alcance), professor-only, e foi o que destravou os testes também.
>
> **Cliente:** `mochila.ts` novo (espelho puro, sem DOM — **a UI nunca decide**), hotbar com
> contagem por slot e slot vazio que mantém a altura (senão a barra pula quando o aluno gasta o
> último bloco), e o painel do E vira "mochila" em sobrevivência: 9 colunas alinhadas com a
> hotbar e o gesto de **tocar na origem, tocar no destino** — arrastar dói no tablet, é a mesma
> razão que descartou a grade 3×3 do craft. `?mochila=3x64,-,4x7` pra inspeção (o par do
> `?vida=`), e ele TRANCA contra a rede, senão o `modo criativo` de todo join apagaria o print.
>
> **VERDE:** typecheck 3/3 · **522 testes** (63 novos) · build · **10/10 smokes** (o
> `inventario` é novo e rodou 2× pra provar idempotência) · prints da hotbar e da mochila
> conferidos, sem erro de console. **PLAYTEST PENDENTE** — headless não tem dedo.
>
> **SESSÃO 35 (2026-08-02) — §🍖 F3: A FOME. E a 33/34 finalmente FORAM PRO GIT.** O usuário
> pediu "continue, mas faça commit de tudo antes": a sessão 34 inteira (F1+F2) estava só no
> disco. Ela saiu em 2 commits (`ef29ee8` código, `6b7f63a` wolf) depois de verificar — e só
> então a fila andou.
>
> **A barra NÃO desce por relógio: desce por ESFORÇO.** É a mesma disciplina do ciclo, do vento
> e do fôlego (nada de `Date.now()`), mas com um segundo motivo: o dreno tem de acompanhar o que
> o aluno FEZ, não quanto a aula durou — quem passou vinte minutos lendo o quadro não pode
> chegar faminto. Cada atividade soma exaustão fracionária num acumulador e, a cada **4,0**
> acumulado, um ponto de fome vai embora (número do Minecraft). A régua escolhida: **0,01 por
> bloco andado (400 blocos = 1 ponto), 0,02 por bloco colocado ou quebrado (200 = 1 ponto) e
> 3,0 por ponto de vida regenerado.** A edição vale o DOBRO do passo de propósito — neste jogo
> a atividade principal da aula é construir, não correr, então é a construção que tem de mover
> a barra. Ordem de grandeza: uma turma construindo gasta a barra inteira em ~50 min.
>
> **`VIDA_MINIMA_POR_FOME = 6`: a fome ENFRAQUECE, não mata.** A decisão do dia. O roadmap dizia
> "fome no zero → dano lento", e o dano existe (meio coração a cada 4 s, pela porta única
> `aplicarDano(…, "fome")`), mas ele **para em 3 corações** enquanto a comida (F6) não existir —
> matar de fome num jogo onde não há o que comer é frustração de aula, não desafio. É o análogo
> do nível "fácil" do Minecraft. Baixar a constante pra 0 devolve a inanição letal em UMA linha;
> o `textoDaMorte("fome")` já está escrito e o cliente já sabe pintar a tela.
>
> **O dreno sai do fluxo que o servidor JÁ recebe** — o `move` a 10 Hz que fecha a queda do F2 —
> e a edição é cobrada **num lugar só, depois do `switch` do `handleMessage`**: cada caso já
> devolveu cedo quando recusou, então "o mundo mudou" é o mesmo que "a edição valeu". Porta e
> cama (2 células) custam UMA edição; abrir porta e teleoperação de professor (`/bloco`) não
> custam nada. Passo maior que 4 blocos numa amostra é teleporte, não passo (respawn e `/tp`
> não cobram fome).
>
> **A regra `fome` virou o gate de verdade** (era decorativa desde o F1): desligada, a barra
> some do HUD na hora — o campo `fome` simplesmente não vai na mensagem `vida`, e **ausente
> significa "este mundo não tem fome"**. Quem já estava faminto quando o professor desligou
> volta a se regenerar (senão ficaria travado sem regeneração num mundo sem fome). O `/regra`
> parou de avisar "só passa a valer quando a mecânica existir" para a `fome` — agora só as
> pendentes de verdade (`manter-inventario`/F4 e `pvp`/F7) levam o aviso, por um campo
> `pendente` novo no registro.
>
> **HUD:** coxas ao lado dos corações, mesma escala (20 pontos = 10 ícones, meia coxa no ímpar).
> As duas barras vivem num flex `wrap` — em tela estreita a linha QUEBRA sozinha, sem media
> query. Detalhe que só o print pegou: a carne da coxa teve de ir pro lado ESQUERDO do ícone,
> porque o `clip-path` da metade recorta a esquerda e meia coxa tem de mostrar carne, não osso.
> O `?vida=` virou `?vida=13,45,7` e o F3 (tecla) agora mostra `vida 13/20  fome 7/20`.
>
> **VERDE:** typecheck 3/3 · **459 testes** (14 novos) · build · **9/9 smokes** (o `fome` é novo:
> prova o dreno pelo fio, criativo imune no mesmo mundo, a regra ligando/desligando a barra na
> hora e o piso de 3 corações) · print do HUD conferido (3 bolhas · 6½ corações · 3½ coxas, sem
> erro de console). **PLAYTEST PENDENTE** — headless não diz se a barra desce rápido demais.
>
> **SESSÃO 34 (2026-08-02) — A SOBREVIVÊNCIA COMEÇOU: §🍖 F1 E F2 NUMA SESSÃO.** O usuário
> fechou as pendências da 33 num turno ("deixa o push, playtest de relevo, luz+cavernas feitas,
> pode seguir") — **os dois playtests estão FEITOS e ele não pediu ajuste nenhum**, e o push
> segue adiado por escolha dele. Então a fila andou duas casas: F1 (o interruptor) e F2 (a
> primeira mecânica).
>
> **F2 — VIDA, DANO, MORTE, RESPAWN.** `shared/src/sobrevivencia.ts` puro (sem I/O, sem relógio
> de parede: o tempo entra como CONTAGEM DE TICKS, igual ao ciclo e ao vento) com **uma porta só
> pro dano** — `aplicarDano(estado, n, causa)`. Queda e afogamento são as causas do lite; fome
> (F3), PvP (F7) e mob (F8) entram pela MESMA função, só somando um valor em `CausaDano`.
> Escala do Minecraft: 20 pontos = 10 corações, queda de 3 blocos de graça e meio coração por
> bloco acima disso, 15 s de ar e 1 coração/s afogando, regeneração de 1 ponto a cada 4 s.
>
> **Quem fecha a queda é o SERVIDOR, do fluxo de `move` que ele já recebe** (10 Hz): guarda o
> pico de altura por cliente e cobra quando o jogador pousa, testando o apoio com
> `apoiadoNoChao` (novo em `physics.ts`, reusando a MESMA lógica de laje/escada do `collides` —
> nada de uma segunda definição de "chão"). **O cliente nunca reporta dano.** ⚠️ A tolerância
> está escrita no código: a 10 Hz cada amostra pode pular ~4 blocos, então a altura medida erra
> PRA MENOS — o aluno leva menos dano do que a queda real, nunca mais. Num jogo de sala de aula
> esse é o lado certo do erro. Teleporte (respawn, `/tp`) e troca de modo ZERAM o pico: quem
> voava em criativo não pode pousar machucado ao entrar em sobrevivência.
>
> **HUD novo (`client/src/vitals.ts`)**, self-contained como o `loading.ts`: corações (meio
> coração via `clip-path`), bolhas de ar, vinheta vermelha ao levar dano e aviso de morte —
> ícones em SVG embutido, zero asset externo. Criado SOB DEMANDA: mundo criativo não paga DOM
> nem CSS. **A UI nunca decide** (mesma disciplina do `inventory.ts`).
>
> **`?vida=7,45` na URL** (par do `?hora`/`?vento`/`?atlas`) congela o HUD pra inspeção. Foi
> assim que os corações foram VISTOS: print sobre a cena do `?bench` com 3 bolhas, 3 corações
> cheios e um pela metade, dentro da tela e sem erro de console.
>
> **O que o F1 entrega, e o que ele deliberadamente NÃO entrega:** sobrevivência ainda joga
> IGUAL a criativo. O que muda é o rótulo e o **voo** — quem está em sobrevivência não voa, nem
> com `/voo` liberado, nem sendo professor (é justamente ele que digita `/modo sobrevivencia eu`
> pra demonstrar). Vida, fome, inventário finito e craft são F2..F6 e vão LER daqui.
>
> **Duas camadas, e a de baixo é por NOME:** padrão do MUNDO (gravado no `.ljw`) + override
> pessoal por nome de jogador — não por id de cliente, porque o modo tem de sobreviver ao
> rejoin, igual ao roster e ao PIN. Quem resolve o efetivo é o SERVIDOR; a mensagem nova carrega
> só `modo {efetivo}`, porque o cliente não tem (nem precisa ter) o mapa de overrides.
>
> **`/regra` nasceu junto, e é o que faz as frentes seguintes serem baratas:** registro em
> `shared/src/regras.ts` (nome, padrão, ajuda) + UM comando genérico + UM campo
> `regras?: Record<string, boolean>` no `SaveMeta`. `manter-inventario` (LIGADA), `pvp` e `fome`
> já existem sem mecânica — o F2 vai só ler `valorRegra(...)`. Regra nova = uma entrada na
> lista: sem comando novo, sem campo novo, sem re-versionar save.
>
> **Três decisões que o código carrega e o teste prova:**
> 1. **`all` não arrasta o professor que digitou** — ele fica como está (e volta pra turma com
>    `eu`). É ele que precisa continuar voando pra supervisionar.
> 2. **Mundo-aula é criativo à força**, vencendo o save e recusando o comando: a aula distribui
>    um MODELO, não uma partida (mesma lógica do confinamento forçado do cp25).
> 3. **O save só grava o DIFF do padrão** — mundo que nunca viu sobrevivência sai byte a byte
>    como antes, e padrão novo passa a valer em mundo antigo sem migração.
>
> **A armadilha que só o smoke pegou (bug-547):** o smoke novo passou na 1ª rodada e FALHOU na
> 2ª, sem uma linha de código mudar. `LJ_NOVO=1` **não recria mundo que já existe** — ele só
> AUTORIZA criar onde não há arquivo. Como o smoke ESCREVE estado persistente (modo, ajuste
> pessoal, regra), a 2ª rodada nascia com o estado da 1ª. A pista foi a assimetria: ana passava
> e bia falhava, que era exatamente o estado final da rodada anterior. O manifesto do
> `scripts/smoke.mjs` ganhou `limpar: [pastas]`, e o smoke rodou 2× seguidas pra provar.
>
> **VERDE:** typecheck 3/3 · **445 testes** (53 novos) · build · **8/8 smokes** (dois novos: o
> `modo` prova o `all`, quem entra depois, o aluno barrado e a ida-e-volta pelo DISCO; o `vida`
> prova que o servidor fecha a queda, que criativo é imune no MESMO mundo, que a morte devolve
> ao spawn avisando a turma e que a regeneração anda no tick) · bench headless boota, streama e
> mesha · print do HUD de vida conferido. **NÃO COMMITADA** — a 33 também segue sem push.
>
> **PLAYTEST PENDENTE, e é o que mais importa agora:** headless não diz se morrer de queda é
> justo, se 15 s de ar é pouco, nem se os corações ficam legíveis no tablet. Ver §pendências.
>

---

## 🎯 O que é o projeto

Jogo sandbox voxel 3D, **web**, engine e assets próprios (NÃO usar Minecraft/Eaglercraft
code ou assets — projeto.txt seção 9 proíbe software não licenciado). Objetivo pedagógico:
desenvolver pensamento lógico / raciocínio computacional (BNCC, ISTE/CSTA, Wing).
Alternativa gratuita e própria ao Minecraft Education para a rede estadual (SC).

**A pedagogia mora nos CENÁRIOS, não no motor.** O jogo é uma plataforma de autoria:
professores (e alunos) criam mundos + objetivos dentro do próprio jogo e distribuem.

Público: 2º ao 9º ano do fundamental. Turmas homogêneas (diferença máx. 3 anos por turma).
8–20 alunos simultâneos. Entrega final = **relatório de aplicação com alunos** (piloto),
com parte técnica como anexo. Dev 100% vibecode; o usuário orquestra, não revisa código.

Ordem real de trabalho: **motor → cenários → piloto com uma turma → relatório.**
Documento é o ÚLTIMO entregável, não o primeiro. Construir, não documentar.

---

## ✅ Concluído

- **§⚡ DESEMPENHO — CICLO FECHADO (sessão 27, 2026-07-27).** Perfilado o notebook do
  laboratório (Intel UHD 630), diagnosticado que o custo era CPU de meshing na main thread
  (`malha` 9,7–13,4 s contra 1,9 s no dev, com `mundo` idêntico → não era rede), movido o
  mesher do streaming pra Web Worker (`meshVizinhanca` = função pura sobre um cubo 18³),
  medido o A/B no lab, corrigida a regressão de FPS que o Worker sem freio causou
  (coalescência de job em voo + profundidade por fase) e fechada a profundidade em 1 com 6
  rodadas etiquetadas. **Resultado: FPS do caminho síncrono (50) com a carga em 4,5 s no
  lugar de 11,5 s, e cauda melhor que a do síncrono (p95 26,7 × 28,1).** Nenhum gatilho de
  otimização segue aceso.
- Entrevista de requisitos (2026-07-10). Todas as decisões abaixo.
- Revisão do projeto com Fable 5 (2026-07-10): render fechado em **three.js**;
  código vai morar em `~/projetos/logica-em-jogo` (WSL), fora do OneDrive.
- Git iniciado (branch `main`, identidade local) + commit dos docs (2026-07-10).
- **Scaffold do monorepo (2026-07-10):** npm workspaces `shared/` + `server/` + `client/`.
  TS 7 estrito (base em `tsconfig.base.json`), Vite 8, three.js 0.185, ws 8, tsx, vitest 4.
  `/shared` exporta `BlockId` (0=ar…4=areia), `CHUNK_SIZE=16`, dims de mundo, `SERVER_TICK_RATE=10`
  — com teste de contrato passando. `/client` = cena three.js mínima (prova pipeline).
  `/server` = placeholder ws (checkpoint 5). Verificado: typecheck 3/3, testes, build, smoke do ws.
- **Checkpoint 1 (2026-07-11): mundo estático + andar + HUD F3.** Novo em `/shared`
  (TS puro, zero deps): `world.ts` (chunks Uint8Array, get/setBlock em coords de mundo),
  `worldgen.ts` (value noise determinístico — mesma seed = mesmos bytes), `mesher.ts`
  (culled mesher FUNÇÃO PURA + layout do atlas), `physics.ts` (gravidade/colisão AABB/pulo,
  com sub-passos anti-tunneling; servidor reusa p/ validar depois). Novo em `/client`:
  `atlasTexture.ts` (atlas procedural via canvas, sem assets externos), `chunks.ts`
  (1 mesh/chunk, remesh() pronto pro checkpoint 3), `input.ts` (pointer lock + WASD),
  `hud.ts` (F3: FPS, frametime méd/p95, remesh, draw calls/tris, rede zerada, export JSON),
  `main.ts` reescrito. 20 testes passando (world/mesher/physics/blocks), typecheck 3/3,
  build ok, screenshot headless confirma o mundo renderizando (terreno + areia + overlay).
- **Push pro GitHub (2026-07-11):** repo privado `meketreve/logica-em-jogo` (criado no
  scaffold), remote `origin` já configurado — main sincronizada. Backup do código ok.
- **Checkpoint 2 (2026-07-11): servidor autoritativo via Web Worker.** Novo em `/shared`:
  `protocol.ts` (mensagens JSON com parse DEFENSIVO dos dois lados + `world_snapshot`
  binário — header "LJW0" LE com dims+seed, validado no decode) e `session.ts`
  (GameSession pura, independente de hospedeiro, clock injetável: `join`→snapshot,
  `move` registrado, `debug_stats` 1×/s com tick méd/máx). Novo em `/server`: `worker.ts`
  (host Web Worker — SÓ transporte + agendar tick). Novo em `/client`: `connection.ts`
  (interface `Connection` = mesma do WebSocket do checkpoint 5, com contadores de rede).
  `main.ts`: mundo agora CHEGA do servidor (join → snapshot → decode → render); cliente
  manda `move` 10×/s; HUD F3 mostra rede real (msg/s, B/s, tick méd/máx do servidor).
  Física do próprio jogador segue local (servidor valida depois). 33 testes (13 novos:
  protocol roundtrip/validação + session), typecheck 3/3, build ok (worker = bundle
  separado de 3,3 kB), screenshot idêntico ao checkpoint 1 — como planejado.
  Playtest do usuário ✅ ("tudo certo").
- **Checkpoint 3 (2026-07-11): colocar e quebrar bloco.** Novo em `/shared`: `raycast.ts`
  (DDA Amanatides-Woo, função pura — cliente mira, servidor pode validar depois),
  `PLAYER_REACH=5` em constants, `isPlaceable()` em blocks. Protocolo: `place_block`/
  `break_block` (coords inteiras validadas) e `block_changed` (ServerMessage virou união;
  cliente NÃO distingue origem — jogador, outro jogador ou gravidade futura). Session
  valida TUDO no servidor: join obrigatório, bounds, célula ar/sólida, alcance com folga
  (pos do move a 10 Hz), não emparedar jogador (AABB); spawn agora é autoritativo.
  Cliente: clique esq/dir → mensagem → servidor → `block_changed` → setBlock local +
  `remeshBlock()` (remesh do chunk + vizinhos na borda); highlight de mira (LineSegments),
  crosshair, hotbar 1–4 (grama/pedra/pedregulho/areia). 42 testes (9 novos), typecheck
  3/3, build ok, screenshot com crosshair+hotbar. Areia colocada FLUTUA — esperado,
  gravidade é o checkpoint 4. Playtest ✅; "não coloca na outra chunk" investigado =
  borda do MUNDO, by design (bug-004; repro script confirma place interno ok).
- **Checkpoint 4 (2026-07-11): areia cai — REGRA DE OURO implementada.** Novo em
  `/shared`: `rules.ts` — sistema GENÉRICO de atualização por vizinhança: `BlockRule`
  (lê mundo → devolve `BlockChange[]`), registro `RULES`, `ruleFor()`. Areia = 1 regra
  registrada ("baixo é ar → desce 1"); circuitos futuros = mais regras, MESMA engrenagem.
  Session: fila `dirty` (Set de coords empacotadas); `applyBlock` marca célula+6 vizinhos;
  tick drena o lote do tick anterior, roda regras, aplica mudanças (novas sujeiras ficam
  pro próximo tick → areia cai 1 célula/tick ≈ 10/s); guarda `changedThisTick` impede
  célula mudar 2× no mesmo tick (sem teleporte). Queda chega ao cliente como
  `block_changed` NORMAIS — cliente mudou ZERO linhas (só rótulo do HUD → 4). Ordem da
  regra: materializa embaixo antes de limpar origem (sem buraco piscando). 48 testes
  (6 novos: regra pura + cascata via protocolo + rejeição out-of-bounds do bug-004),
  typecheck 3/3, build ok. Playtest do usuário ✅ (2026-07-11, "tudo certo").
- **Checkpoint 5 (2026-07-11): segundo cliente (LAN) — Node+ws real.** Protocolo:
  `player_moved` (relay SÓ pros outros — servidor nunca ecoa pro autor; cliente não
  precisa saber o próprio id) e `player_left` (disconnect), parse defensivo dos dois.
  Session: move → broadcastExcept; handleDisconnect avisa quem fica (idempotente).
  `/server/src/index.ts` virou host real: embrulha a MESMA GameSession do worker
  (id por socket via contador, close→handleDisconnect, handler de error obrigatório,
  frames binários de subida ignorados), seed 20260710 igual ao worker. Cliente:
  `WsConnection` (mesma interface Connection; fila até open; binaryType arraybuffer),
  `?server=ws://host:8080` na URL escolhe hospedeiro (sem parâmetro = Web Worker
  local como antes); outros jogadores = caixa colorida por id (HSL golden ratio),
  sem lerp (gatilho: só se serrilhar). Sem "player_joined": presença emerge do move
  a 10 Hz. 51 testes (3 novos), typecheck 3/3, build ok. Smoke real (Node 24,
  WebSocket global, zero deps): 2 clientes ws no servidor — snapshot idêntico,
  relay sem eco, block_changed pros dois, player_left ✅. Screenshots headless:
  cliente via ws E via worker renderizam. **Playtest do usuário ✅ (2026-07-11,
  "tudo certo")** — achou o bug-010: rejoin nascia no fundo do buraco (spawn era
  recalculado por findSpawnY a cada join, sobre o mundo já escavado). **Corrigido:**
  spawn FIXO calculado uma vez no construtor da GameSession (terreno pristino) +
  mensagem `spawn` nova no protocolo (enviada antes do snapshot); cliente usa o
  ponto do servidor pra nascer e pra respawn (nunca deriva do snapshot). 53 testes
  (2 novos, incl. regressão: escavar coluna não muda spawn do próximo join),
  smoke real contra mundo escavado ✅. Re-playtest do usuário ✅ (2026-07-11, "top").
  **Checkpoint 5 FECHADO.** (Movimento remoto: usuário não reclamou de serrilhado —
  lerp continua adiado, gatilho não disparou.)
- **Checkpoint 6 (2026-07-11): chat + /bloco — código do MVP v0 COMPLETO.** Protocolo:
  `chat` client→server (texto) e server→client (autor+texto), parse defensivo;
  `MAX_CHAT_LENGTH=200` e `MAX_NAME_LENGTH=24` (servidor corta; nome vazio → "jogador").
  Session: chat exige join; texto vira broadcast pra TODOS com autor `nome#id`
  (eco pro autor = confirmação do round-trip); prefixo `/` = comando com resposta
  SÓ pro autor (autor "servidor"). 1 comando: `/bloco x y z id` — muda o mundo via
  applyBlock (MESMO pipeline: block_changed + fila de vizinhança → areia colocada
  por comando CAI no tick), sem checagem de alcance (comando é teleoperação),
  valida bounds/id/não-emparedar. Boas-vindas no join (chat do servidor) — prova o
  canal sem segundo cliente. Cliente: `chat.ts` (UI HTML/CSS sobre o canvas; Enter
  abre/envia, Esc fecha; mensagem some em 10 s e volta com o chat aberto;
  textContent = sem XSS), `events.ts` (gatilhos de som block_placed/block_broken/
  chat_message — áudio pluga depois, fora do MVP), input.ts ignora teclas vindas
  de campo de texto + `lock()` público (fechar chat re-trava o mouse). 57 testes
  (6 novos), typecheck 3/3, build ok. Smoke real (2 clientes ws): welcome,
  broadcast com autor, /bloco muda o mundo, resposta só pro autor, comando
  inválido não vaza ✅. Screenshot headless: welcome chat renderizado na tela.
  **Playtest do usuário ✅ (2026-07-11, "tudo funciona"). Checkpoint 6 FECHADO —
  MVP v0 COMPLETO: os 4 critérios de aceitação atendidos e jogados.**
- **Grupo A de blocos (2026-07-11, aprovado pelo usuário): 14 blocos novos** —
  terra, tronco (topo com anéis/lado com casca — prova textura por face), tábuas,
  tijolo, cascalho (CAI — regra de queda virou `fallingRule` GENÉRICA, areia e
  cascalho compartilham), rocha-matriz/bedrock (`isBreakable()` — jogador não
  quebra, `/bloco` remove = caminho do professor), 8 lãs coloridas (base da
  pedagogia de sequência). Atlas 4→8 tilesPerRow (20 tiles pintados, procedural).
  IDs 5–18 (APPEND only). Cliente: hotbar 18 blocos (1–9 direto + scroll do mouse
  cicla todos, `input.onWheel`), `?atlas` na URL mostra o atlas no canto
  (inspeção visual de texturas). 60 testes (3 novos: queda genérica, bedrock,
  cobertura mesher de TODO id colocável), typecheck 3/3, build ok, screenshot
  com atlas confere. Playtest do usuário pendente (texturas = gosto).
- **§🕐 TELA DE CARREGAMENTO (2026-07-26, sessão 25)** — `client/src/loading.ts` novo
  (self-contained, DOM+CSS injetados, padrão do `touch.ts`). Cobre do "jogar" até o mundo
  pronto, nos DOIS caminhos (worker e ws). **Progresso real** = `colunasCarregadas.size ÷
  total do raio` (o total é a MESMA conta do `streamColunas`: quadrado de `raioRender` em
  volta do chunk do spawn, recortado pelas bordas), monotônico e clampado; **spinner
  decorativo** no canto em CSS puro (gira mesmo se a rede parar = sinal de vida). Linhas:
  colunas prontas/total, em transferência (`colunasFaltando.size` da varredura §🔁 — sem
  segunda medição), chunks na fila de malha, taxa em **bits/s** (`bytesIn+bytesOut` ×8,
  amostrado 1×/s como o HUD F3), recebido, tempo + ETA pelo ritmo de colunas (EMA),
  hospedeiro. Fase honesta: conectando → recebendo/gerando o mundo → montando a malha →
  pronto (troca pra "malha" sozinha quando as colunas acabaram mas a fila não). Anel fica
  **indeterminado** (arco girando, "…") enquanto não há total — mundo denso vem num blob só
  e 0% parado parecia defeito. **Bloqueio do usuário resolvido (bug-515):** `updateOverlay()`
  ganhou `loading.ativo` (menu Esc não aparece mais durante a carga) e o mesmo na UI de
  toque. Fecha só com o raio inicial INTEIRO aplicado **E** `filaPendente === 0` (entrar
  antes = mundo com buracos), com um respiro de 400 ms em 100%; devolve o menu de pausa como
  porta de entrada (o clique é o gesto do pointer lock). **Extra:** `WsConnection` ganhou
  `aoFalhar` (onerror/onclose, avisa uma vez) → servidor fora do ar/IP errado vira mensagem
  vermelha + "voltar ao menu" (mesmo caminho do `join_denied`), em vez de spinner eterno;
  botão "entrar mesmo assim" aparece após 20 s. VERDE: typecheck 3/3, 329 testes, verificação
  headless em mundo E (33% · 56/169 colunas · 2.1 Mbps · ETA 4,7 s), mundo P (denso → 100% →
  fecha) e servidor inexistente (estado de erro). **Playtest do usuário PENDENTE.**

- **Sessão 25 — o resto (2026-07-26), tudo commitado:**
  - **§🕐 na TROCA DE AULA** (`/mundo carregar`): msg nova `mundo_trocando {nome}` sai do host
    logo APÓS o decode do .ljw e ANTES de salvar/gerar, a tela sobe na hora (fase `preparando`,
    anel indeterminado) e uma **fila de 2× rAF** garante que o frame COM a tela pintou antes do
    trabalho pesado. Pointer lock não é solto → ao fechar, volta a jogar sem clique.
  - **Quatro bugs achados LENDO PERFIL** (não por teste): **bug-517** `trocarMundo` fazia
    `buildAll()` em mundo lazy (460 800 remesh de slot vazio, ~19 s de trava); **bug-518** a
    sessão nova do `/mundo carregar` zerava o raio pra `RAIO_PADRAO` e o cliente não
    reanunciava (mundo cortado no anel 6, 252 repedidas); **bug-519** `meta` do perfil ficava
    no mundo do join; **bug-523** `TorchGlow.setFromWorld` varria BLOCO A BLOCO — 1,887 bilhão
    de células num mundo E = **41 s de aba travada** ("página não está respondendo"), e era a
    explicação dos ~38 s de long task iguais em três perfis de durações diferentes. Varredura
    por chunk: **41 361 ms → 2,9 ms**. Tocha de coluna do streaming agora ganha halo.
  - **Orçamento de mesh por TEMPO** (`meshMsPorFrame`, 1–16 ms, padrão 6) no lugar da contagem
    fixa: p95 da gravação **43–82 ms → 18,7/20,4 ms**, frames >50 ms **9–50 → 0**, FPS 41–53 →
    **57/60**, long tasks da sessão 128–299 → **2**. Preço combinado: `fila` 0 → 84/189.
  - **Perfilador com CONTEXTO e por FASE**: `jogador` (pos/yaw/pitch/voando/chunk), `config`
    (raio, orçamento, pixelRatio, fov), `gravacao.movimento` (estado, distância, velocidade,
    colunas novas), `fases[]` (carregando × jogando: fps, `renderPct`, travadas),
    `pioresTravadas` (top 5 com fase e segundo), `remeshPorCaminho` (fila × bloco × área),
    render × lógica. `?hud` abre o F3 no boot. **bug-524** (o `setRemesh` do loop apagava o
    campo novo) pego na verificação headless.
  - **§🧪 encanamento de verificação**: `npm run verify` e `npm run smoke` (manifesto em
    `scripts/smoke.mjs`, porta por cenário, `--lista`/`--rapido`), + smoke novo
    `_smoke-troca-raio.mjs` (6/6: anel 10 → 6 → 12 e a ordem aviso→snapshot).
  - **bug-516**: `npm run dev:server` serve o cliente COMPILADO — feature de cliente em
    `:8080` exige `npm run build` (loop rápido é `npm run dev`, vite 5173).

- **§📊 AS 7 DO PERFILADOR (2026-07-26, sessão 26) — playtest APROVADO, commitado:**
  - **`?bench` (`client/src/bench.ts` novo)** — mundo de seed fixa sem passar pelo menu,
    trajeto `pos = f(t)` (círculo a 18 b/s + giro 360° no fim), config canônica em memória,
    `hud.record()` do trajeto INTEIRO e download automático (`perf-bench-*.json`). Também
    publica em `window.__benchPerfil` (automação lê sem depender de download). O mundo do
    bench NÃO vai pro IndexedDB (encheria a lista do professor).
  - **Histograma** de frametime (≤8/≤16/≤33/≤50/≤100/>100 ms, n e %) na gravação.
  - **Carga por fase** exportada da §🕐 (`LoadingScreen.relatorio()`): uma entrada por carga,
    com `fasesMs` e `totalMs`. A fase MEDIDA é a efetiva (quando as colunas acabam e o mesher
    tem fila, quem segura é "malha").
  - **Marcadores** (`hud.marcar`): join, carga concluída, troca de aula, raio A→B, bench
    início/fim — cada um com segundo da sessão e fase; teto de 60.
  - **Regras do servidor no `debug_stats`**: células/tick, pior tick, mudanças e água por
    tick, agregadas na janela de 1 s. Campos **opcionais** no protocolo (host antigo não
    manda e o cliente não pode descartar a mensagem inteira).
  - **Tempo de GPU** (`EXT_disjoint_timer_query_webgl2`): pool de 4 consultas, leva inteira
    descartada em `GPU_DISJOINT`, amostra só com F3 aberto ou gravando, tudo em try/catch
    que DESLIGA a medição em vez de derrubar o render.
  - **`npm run bench:headless`** (`scripts/bench-headless.mjs`): roda o `?bench` num Chrome
    headless por CDP puro (sem puppeteer como dependência) e imprime o perfil. Os NÚMEROS
    dele não valem (SwiftShader) — é teste de encanamento.

- **§🏁 MAPA DE CORRIDA — `aula7-corrida.ljw` (sessão 40, 2026-08-04).** A 7ª aula, e a
  primeira que não é de construir: 4 objetivos `chegar` em modo sequencial numa pista fechada.
  - **`server/src/cenarios/autoria.ts` novo** — o `Autoria` saiu do `gerar.ts` (que roda CLI no
    import). Os 6 cenários antigos regeneram byte a byte idênticos.
  - **`server/src/cenarios/corrida.ts` novo** — pista construída com os MESMOS comandos do
    professor (`/regiao criar`+`encher`, `/bloco`, `quadro_set`), 5 placas de instrução, e o
    verificador próprio: BFS com o passo do jogador + uma aluna que CORRE e fecha os 4 postos na
    ordem + o fundo do vão inteiro tem de ter saída. **Reprovar = o arquivo não é gravado.**
  - **`um` nos 3 primeiros postos, `todos` na CHEGADA** — a equipe só vence junta.
  - Sai do MESMO `npm run cenarios` (agora 7 arquivos). `npm run shots:corrida` novo.
  - **bug-561/562/563**, todos achados pelo verificador (rota por fora, posto driblável, fundo
    do vão partido pela ponte).
- **§🍖 F6 — COMIDA (sessão 40, 2026-08-04).** O laço da fome fechou: existe o que comer, e
  por isso a fome voltou a matar (`VIDA_MINIMA_POR_FOME` 6 → **0**).
  - **`shared/src/comida.ts`** (puro): tabela `id → pontos de fome` (fruta 4, pão 5, números
    do Minecraft), `isComida`/`saciedadeDe`. O **trigo NÃO se come** — é ingrediente.
    `saciar(e, pontos)` novo no `sobrevivencia.ts`, par do `curar`; devolve o MESMO objeto de
    barriga cheia, e é assim que a session recusa a mordida sem gastar o item.
  - **Plantação: 4 blocos novos** (`Plantacao0..3`, ids 182-185, append). Só o estágio 0 é
    colocável; os outros nascem crescendo. Cruz de sprite como a flor, atravessável, balança
    no vento, e **exige SOLO** (`isSolo` = terra + as 3 gramas) pelo `apoioValido(id, abaixo)`
    — a mesma função no gate do place e na regra do tick.
  - **`crescerPlantacao` fica FORA do `rulesMap`** e a session a chama num pulso de
    `TICKS_POR_CRESCIMENTO` (200 ticks = 20 s/estágio) sobre o índice `plantacoes`, mantido no
    `applyBlockQuieto` e **reconstruído dos bytes no `restore`** (nenhum campo novo no `.ljw`).
    `LJ_CRESCIMENTO` / `crescimentoPorEstagio` é o botão (o smoke usa 5).
  - **3 itens novos** na banda ≥900: fruta 902, trigo 903, pão 904, mais `isItem()` — a banda
    virou um Set explícito, e `/dar` passou a aceitar bloco OU item.
  - **`drops.ts`:** folha → fruta 1 em 8 · capim → semente 1 em 4 (e nunca o próprio capim) ·
    plantação madura → trigo + a semente de volta (replantar não depende de sorte). `dropsDe`
    ganhou `sorteio` injetável — é a única parte não determinística da tabela.
  - **Receita do pão** (3 trigo → 1 pão), índice 11, APPEND. **`comer {slot}`** novo no
    protocolo: clique direito com comida na mão, ANTES do `if (!target)` (comer olhando pro
    céu tem de funcionar).
  - **Cliente:** 4 tiles de plantação no atlas (a altura e a cor contam a idade), ícones
    procedurais de semente/fruta/trigo/pão em `blockIcons.ts` — o do estágio 0 é um punhado de
    GRÃOS, porque o broto de 4 px sumia no slot. `npm run shots:comida` novo.
  - **bug-558** (o capim flutuava desde o §🌬️), **bug-559** (`/dar` recusava comida),
    **bug-560** (asserção do smoke × relógio acelerado).
  - VERDE: typecheck 3/3 · 565 testes (+28) · build · 12/12 smokes (`comida` é novo) · 3
    prints conferidos + o do craft, pendente da sessão 39. **Playtest PENDENTE.**
- **§🍖 F5 — CRAFT POR LISTA + BALDE-ITEM (sessão 39, 2026-08-03).** Fabricar virou estado do
  SERVIDOR; o balde fechou o pendente do F4 (era só de criativo).
  - **`shared/src/receitas.ts`** (puro): `Receita { saida, custo[] }`, `RECEITAS` **APPEND-only**
    (índice = identidade no protocolo), `podeFabricar`/`fabricar` **tudo-ou-nada numa cópia**,
    `ingredientesDe` (have/need/falta) pro "falta 3 tábua". 11 receitas: madeira
    (tronco→tábuas→laje/escada/mesa/cerca) + pedra (pedregulho→laje/escada) + **3 ferro→balde**.
  - **Protocolo:** `fabricar {receita}` client→server (reusa `inventario` na volta) e `slot?`
    novo na mensagem `balde`. Parse defensivo dos dois.
  - **Session:** `case fabricar` (só survival, índice válido, `fabricar`≠null); `case balde`
    integrou survival — confere o balde no slot ANTES de mexer na água e troca vazio↔cheio
    in-place (`definirSlot` novo em `inventario.ts`). Criativo não exige item na mão.
  - **Cliente:** painel do E com abas mochila/criar, lista tocar-pra-fabricar com "falta N" em
    vermelho e filtro que re-renderiza só as linhas; ramo do balde no `main.ts` funciona em
    survival (lê o slot do servidor). CSS `.craft-*` novo.
  - **bug-557** (smoke: `/bloco` recusa o id da água — água só entra por balde).
  - VERDE: typecheck 3/3 · 537 testes (+15) · build · 11/11 smokes (`craft` novo, 2×). **Print
    do painel PENDENTE (chrome ausente na máquina). Playtest PENDENTE.**
- **🪝 HOOKS DO OPENWOLF — OS 3 FALSO-POSITIVOS CONSERTADOS (sessão 37, 2026-08-03).**
  bug-554 (contador semântico comparava data que não existe / furava na meia-noite) · bug-555
  (buglog só via escrita de Write/Edit, cego ao Bash) · bug-556 (linha `Session end:` empilhada
  a cada `stop`). Fix em `.wolf/hooks/shared.js` e `.wolf/hooks/stop.js`, regressão nova em
  `.wolf/hooks/_test-hooks.mjs` (10/10, roda o `stop.js` real numa fixture de `/tmp`). Causa de
  o PR #64 nunca ter chegado: o pacote tem duas cópias dos hooks e a scaffolding copia a velha.
  Detalhe e a pegadinha do `pnpm update -g` na seção ✅ HOOKS abaixo e no `TODO.md §🧭`.
- **§🍖 F4 — INVENTÁRIO AUTORITATIVO (sessão 36, 2026-08-03).** A mochila virou estado do
  SERVIDOR. Criativo segue com a paleta infinita, intocado, no MESMO mundo.
  - **`shared/src/inventario.ts`** (puro, imutável): 27 slots (`HOTBAR_SLOTS` 9 +
    `MOCHILA_SLOTS` 18), `STACK_MAX` 64, `tamanhoStack(id)` (balde = 1, porta pra ferramenta),
    `adicionar` (completa parcial antes de ocupar vazio, hotbar→mochila), `remover` (tudo ou
    nada, consome a pilha MENOR primeiro pra juntar restos), `espacoPara`/`cabe`, `moverSlot`
    (mesmo id junta, diferente troca) e a forma ESPARSA `SlotSalvo` com `parseInventario`
    defensivo — **uma porta de entrada só** pro save e pro protocolo.
  - **`shared/src/drops.ts`**: `formaCanonica` (a família volta como entrada da hotbar) +
    tabela de exceções (grama→terra, pedra→pedregulho, folha/água/bedrock→nada). Devolve
    LISTA porque o F6 vai querer "folha → fruta às vezes". Teste-portão varre todos os ids.
  - **Session:** `inventarios` por NOME; débito no MESMO ponto pós-`switch` do esforço do F3
    (porta/cama = 1 item); **mochila cheia RECUSA a quebra**, conferida ANTES do `applyBlock`,
    com aviso freado em 5 s; crédito depois, e a metade apagada pela regra não dropa.
    `manter-inventario` ganhou mecânica em `matar()` e saiu do `pendente`.
  - **`/dar <eu|all|nome> <id> [qtd]` NOVO** (fora do escopo travado, ver o diário): contraparte
    do `/bloco` — sem ele o professor não prepara atividade num mundo onde ninguém tem nada.
  - **Protocolo/save:** `inventario { slots }` server→client (só em sobrevivência: a AUSÊNCIA é
    o que diz "paleta infinita") e `mover_item { de, para }` client→server;
    `SavedPlayer.inventario?` esparso, ausente = vazia (mundo criativo não engorda o `.ljw`).
  - **Cliente:** `mochila.ts` novo (espelho puro), hotbar com contagem e slot vazio de altura
    fixa, painel "mochila" com 9 colunas e gesto tocar-origem→tocar-destino, `?mochila=`.
  - **bug-549** (bloco infinito: `changedThisTick` é Set, virou contador `edicoesAplicadas`) e
    **bug-550** (grade de 9 colunas colapsada sem `width: 100%`).
  - VERDE: typecheck 3/3 · 522 testes (63 novos) · build · 10/10 smokes (`inventario` é novo) ·
    prints da hotbar e da mochila conferidos. **Playtest PENDENTE.**
- **§🍖 F3 — FOME (sessão 35, 2026-08-02).** A barra desce por ESFORÇO, não por relógio.
  - **`shared/src/sobrevivencia.ts`:** `gastarEsforco(estado, esforco)` acumula exaustão
    fracionária e converte a cada `EXAUSTAO_POR_PONTO` (4,0, número do Minecraft);
    `tickFome(estado)` cobra o dano da barra zerada. Régua: **0,01 por bloco andado · 0,02 por
    bloco editado · 3,0 por ponto regenerado** (construir cansa o DOBRO de andar, porque a
    atividade da aula é construir).
  - **`VIDA_MINIMA_POR_FOME = 6` — a fome enfraquece, não mata.** Sem regeneração abaixo de 18
    de fome e meio coração a cada 4 s no zero, mas o dano PARA em 3 corações enquanto não houver
    comida (F6). Baixar pra 0 devolve a inanição letal em uma linha.
  - **Session:** passo tirado do fluxo de `move` (o mesmo do F2, com teto de 4 blocos por
    amostra pra teleporte não virar caminhada) e edição cobrada **num ponto só, depois do
    `switch` do `handleMessage`** — porta/cama custam UMA edição, `use_block` e `/bloco` não
    custam. Curar cobra `EXAUSTAO_POR_REGEN` no tick.
  - **A regra `fome` virou gate real:** desligada, o campo `fome` não vai na mensagem e o HUD
    não desenha coxa nenhuma; quem já estava faminto volta a se regenerar. `RegraDef.pendente`
    novo faz o `/regra` avisar só o que ainda não tem mecânica (`manter-inventario`, `pvp`).
  - **Protocolo/save:** `fome?` OPCIONAL na mensagem `vida` que já existia e `SavedPlayer.fome?`
    no molde da vida — mas **fome ZERO é válida no save** (barra vazia é estado de jogo; vida
    zero seria um morto).
  - **Cliente:** coxas ao lado dos corações num flex `wrap` (tela estreita quebra a linha sem
    media query), meia coxa pelo mesmo `clip-path` — com a carne à ESQUERDA, senão a metade
    mostraria só osso. `?vida=13,45,7` e `vida/fome` na linha do F3.
  - VERDE: typecheck 3/3 · 459 testes (14 novos) · build · 9/9 smokes (`fome` é novo) · print
    do HUD conferido. **Playtest PENDENTE.**
- **§🍖 F2 — VIDA, DANO, MORTE, RESPAWN (sessão 34, 2026-08-02).** A primeira MECÂNICA da
  sobrevivência. Só vale em modo sobrevivência: criativo é imune no MESMO mundo.
  - **`shared/src/sobrevivencia.ts`** (puro): `aplicarDano(estado, n, causa)` é a **ÚNICA porta
    de perda de vida** — queda e afogamento hoje, fome (F3), PvP (F7) e mob (F8) entram por ela.
    Mais `curar`, `danoDeQueda`, `tickFolego`, `tickRegen`, `textoDaMorte`, `parseCausaDano`.
    Números do Minecraft: 20 pontos, 3 blocos de queda de graça, 15 s de ar, 1 coração/s
    afogando, 1 ponto de regeneração a cada 4 s (com fome alta — a fome é do F3, e até lá a
    session passa `FOME_MAX`).
  - **`apoiadoNoChao(world, pos)` novo em `physics.ts`** — o servidor fecha a queda pelo fluxo
    de `move` (10 Hz) reusando a lógica de laje/escada do `collides`. **O cliente NÃO reporta
    dano.** A tolerância (~4 blocos por amostra, errando PRA MENOS) está comentada no código.
  - **Session:** `vitais` por NOME (como o modo — sobrevive ao rejoin), `picoQueda` por cliente
    (rascunho, morre no disconnect), `machucar`/`matar`/`acompanharQueda`/`tickVitais`. Morte =
    aviso no chat pra TURMA + respawn no spawn autoritativo, cheio. Teleporte e troca de modo
    zeram o pico. Água amortece a queda.
  - **Protocolo:** `vida { vida, causa?, morreu?, folego? }` — só a vida é obrigatória; causa
    desconhecida NÃO derruba a mensagem. Vai no join (em sobrevivência) e quando muda o que o
    HUD desenha (coração ou bolha), nunca 10×/s.
  - **Save:** `SavedPlayer.vida?` — só o MACHUCADO viaja; valor doente (0, negativo, gigante,
    texto) degrada pra vida cheia.
  - **Cliente:** `client/src/vitals.ts` novo (corações com meio coração por `clip-path`, bolhas,
    vinheta de dano, aviso de morte; SVG embutido, criado sob demanda), eventos `dano`/`morte`
    em `events.ts` (som pluga depois) e `?vida=N[,folego]` pra inspeção visual.
  - VERDE: typecheck 3/3 · 445 testes (20 novos) · build · 8/8 smokes (`vida` é novo) · print
    do HUD conferido no headless. **Playtest PENDENTE.**
- **§🍖 F1 — `/modo` E `/regra`, O INTERRUPTOR (sessão 34, 2026-08-02).** Primeira frente da
  SOBREVIVÊNCIA. Nada de mecânica: o que muda é o rótulo e o voo.
  - **`shared/src/modo.ts`** (puro): `Modo = criativo|sobrevivencia`, `MODO_PADRAO`,
    `parseModo` (tolera acento e caixa), `modoEfetivo(mundo, pessoal)`, `podeVoarNoModo`.
    **Sobrevivência não voa — nem professor**, de propósito.
  - **`shared/src/regras.ts`** (puro): registro `manter-inventario` (LIGADA) · `pvp` · `fome`,
    com `valorRegra`/`parseRegras`/`regrasParaSave`. Comando genérico `/regra [nome [ligar|
    desligar]]`. **Sem mecânica ainda** — a resposta do comando avisa isso ao professor.
  - **Session:** `modoMundo` + `modosPorJogador` (por NOME) + `regras`; `/modo` com as 5
    formas fixadas com o usuário (consulta · mundo · `eu` · `nome`/`@nome` · `all`), consulta
    liberada pra turma e mudança professor-only pelo `parts.length` (molde do `/hora`).
  - **Protocolo:** `modo {efetivo}` novo, resolvido no servidor e mandado em TODO join —
    inclusive criativo, porque troca de aula é sessão NOVA (família do bug-518).
  - **Save:** `modo?`, `modosPorJogador?`, `regras?` (MAPA) — opcionais e gravando só o DIFF
    do padrão; parse defensivo pula nome/valor inválido. Mundo-aula força criativo.
  - **Cliente:** `podeVoar()` passa por `podeVoarNoModo`, F3 mostra `modo`/`voo`, autocomplete
    conhece `/modo` e `/regra` (e o `/vento`, que faltava desde a sessão 28).
  - **bug-547:** `LJ_NOVO=1` não recria mundo existente → smoke com estado persistente virava
    sorteio. `limpar: [pastas]` novo no manifesto do `scripts/smoke.mjs`.
  - VERDE: typecheck 3/3 · 425 testes (33 novos) · build · 7/7 smokes · bench headless ok.
- **§🏔️ RELEVO POR BIOMA — a v2 DA GERAÇÃO FECHADA (sessão 33, 2026-07-30).**
  - **`Bioma` ganhou relevo e neve:** `relevo` (teto de amplitude da serra, [0,1]) e `neve`
    (flag). `relevoPorClima(clima)` mistura os tetos pela pertinência de cada bioma e
    multiplica pelo fator de NÚCLEO — que zera na divisa, e é isso que mantém a montanha
    dentro de um bioma só em vez de montada na fronteira.
  - **`heightAt` multiplica a amplitude da serra por esse fator** (5º parâmetro `clima` opcional,
    só pra quem já calculou não pagar 2 ruídos de novo). Colinas seguem GLOBAIS de propósito:
    é o que dá continuidade onde o relevo é zerado. Mundo baixo (aula, sizeY 64) sai antes da
    serra e **não mudou um byte** — tem teste.
  - **Neve virou `Bioma.neve`** no lugar de `temp < 0.6`: `topoPrevisto` continua a fonte única
    do bloco de topo, e o HUD F3 mostra o relevo da coluna (`relevo 0.42 (teto do bioma 1)`).
  - **O portão de fronteira (bug-544):** a 1ª ligação passou typecheck e testes e abriu penhasco
    de **14–23 blocos**. Sweep medido escolheu `RAMPA 0,25` + `NÚCLEO (0,4→1,0)` → **degrau máx
    4–6, paridade exata com o heightmap global, zero pares acima de 6.** Tetos medidos:
    araucárias 106 · mata 68 · cerrado 53 · caatinga 36 (era 106 — a duna do playtest).
  - **Custo negativo:** geração 4,53 → 4,00 ms/coluna, triângulos da cena do `?bench`
    700 230 → **647 858 (−7,5%)**, chunks com malha 586 → 549. Terreno mais baixo alivia a GPU.
  - **`shared/vitest.config.ts` novo (bug-545):** `maxWorkers: 8` + `testTimeout: 20000` porque
    o default (1 fork por núcleo × mundos de 128³) fazia a suíte falhar por contenção, não por
    código. **392/392 e 92 s → 37 s.**
  - VERDE: typecheck 3/3 · 392 testes (4 novos) · build · 6/6 smokes · 5/5 luz.
    **Playtest PENDENTE.**
- **§💡 LUZ VOXEL + §🏔️ CAVERNAS (sessão 32, 2026-07-28)** — commits `1be4ab0` e `f1dd05f`.
  A fase da fila era a v2 da geração; o portão de produto aberto era a luz, e o usuário
  escolheu **luz COMPLETA antes de escavar** (mais: **caverna seca sob o mar**, com casca).
  - **Luz mora 100% no CLIENTE** — é função pura dos bytes do mundo e o cliente já os tem, então
    não há mensagem nova nem custo de tick, e dois clientes convergem sozinhos. `shared/src/
    luz.ts`: 1 byte/célula com céu e tocha em dois nibbles, BFS com a regra da **descida reta**
    (céu no máximo descendo não perde nível — é o que faz existir sombra sob teto),
    `atualizarBloco` incremental devolvendo o conjunto de chunks sujos.
  - **Mesher** ganhou o atributo `luz` por vértice (a face mostra a luz da célula que ela
    ENCARA); **shader** enxertado ENCADEANDO o `onBeforeCompile` do §🌬️ — o canal do céu escala
    com a hora, o da tocha não. Anoitecer não custa remesh: é uniform.
  - **Cavernas** por interseção de dois ruídos 3D, função pura de `(x,y,z,h,seed)` (mundo E é
    lazy: coluna vizinha só fecha a galeria respondendo igual sem consultar o mundo). Escava
    depois do minério (veia cortada na parede) e `findSpawnSeco` ganhou veto de boca de caverna.
  - **Três medições mudaram decisão:** acender coluna 18,4 → **2,48 ms** (a BFS enfileirava as
    ~32 mil células de céu; só a banda rente ao relevo tem trabalho) · worldgen 2,63 → 28,6 →
    **3,49 ms/coluna** (ruído célula a célula derrubou o smoke `pedir-coluna`; amortizado por
    fatia, mundo byte a byte idêntico) · densidade de caverna **varia 2,9%–7,3% por seed**, e a
    do `?bench` é das mais vazias — calibrar por ela teria dado o dobro.
  - **Verificação nova `npm run shots:luz`**: compara a mesma cena do `?bench` ao meio-dia e à
    meia-noite. Pega os dois modos de a luz falhar calada (shader que não compila; shader que
    compila sem fazer nada). 5/5, noite/dia = 0,48.
  - **Custo:** +66% de triângulos (153 852 → 255 234), +28% de draw calls. **Não medido no lab.**
  - VERDE: typecheck 3/3 · 388 testes (30 novos) · build · 6/6 smokes. **Playtest PENDENTE.**

---

## ✅ §🍖 F10 — FEITO INTEIRO (sessão 46, 2026-08-05)

A sessão 45 anotou o F10 e o usuário respondeu as cinco perguntas em aberto; a 46 executou as
seis frentes, uma por commit. **Com ela, o roadmap de sobrevivência tem F1..F7, F9 e F10 —
só o §🍖 F8 (mobs) segue fora.** Detalhe de cada frente no bloco da sessão 46, no topo.

| frente | o que entrou | commit |
|---|---|---|
| **F10a** | itens carvão/diamante/graveto; minério larga item; tocha = graveto + carvão | `903e72d` |
| **F10b** | FORNALHA: `containers.ts` + `fornalha.ts`, mapa por posição no save, tick, protocolo, painel | `931d974` |
| **F10e** | BAÚ (27 slots, 8 tábuas), reusando o encanamento inteiro | `32927e1` |
| **F10f** | claim/confinamento na INTERAÇÃO + o portão que lê o `protocol.ts` | `08ffd52` |
| **F10c** | ALGODÃO (cultivado + selvagem), plantação virou tabela, lã ← 3 algodão | `0e3a94a` |
| **F10d** | 4 PICARETAS, sem durabilidade, obrigatórias; gate no `break_block` | `a953c32` |

**As decisões do usuário, aplicadas (não perguntar de novo):** fornalha SUBSTITUI a receita de
vidro · graveto é ITEM e a tocha é 1 graveto + 1 carvão (mineral ou vegetal) · sem picareta o
bloco **não quebra** e mostra aviso · baú com item **não quebra** · confinamento barra
interação. **Uma decisão minha, declarada:** machado e pá ficaram fora (travariam a aula e não
fariam nada sem tempo de quebra) — razão escrita em `ferramentas.ts`.

## 📁 Arquitetura ativa

- **Padrão central:** UM módulo de lógica de jogo (servidor autoritativo) que roda em 3
  hospedeiros SEM reescrita: (a) Web Worker no singleplayer, (b) .exe portátil (Tauri/Node
  SEA) que serve HTTP+WebSocket, (c) servidor Node dedicado. Cliente só renderiza + envia input.
- **Transporte:** WebSocket (mensagens iguais em todos os hospedeiros).
- **Save:** mundo salvo no PC do host (professor). Persiste entre aulas.
- **Restrição dura do navegador:** aba NÃO abre socket de escuta e NÃO executa binário.
  Por isso "abrir pra LAN" é papel do HOST (professor roda .exe/servidor), não do aluno.
  WebAssembly NÃO contorna isso (roda dentro do sandbox). Confirmado nesta entrevista.
- **§🍖 F10: BLOCO COM INVENTÁRIO (`shared/src/containers.ts`).** Conteúdo por POSIÇÃO num mapa
  da `GameSession` + no meta do save — o desenho do QUADRO, que foi o primeiro estado a não
  caber no byte do chunk. Serve fornalha e baú, e serve o próximo. Transferência num array
  CONCATENADO mochila+container (reusa `moverEmArray` do `inventario.ts`), índice UNIFICADO no
  fio (`0..26` mochila, `27+i` container), e o `use_block` é quem ABRE — a resposta do servidor
  é que abre o painel, porque quem decide se o aluno pode LER aquele baú é o gate de claim.
- **§🍖 F10: os módulos PUROS novos** — `fornalha.ts` (cozimento em TICKS, nunca relógio de
  parede) e `ferramentas.ts` (tipo × família × nível). Mesma disciplina de `inventario.ts`,
  `drops.ts`, `receitas.ts` e `sobrevivencia.ts`: sem I/O, sem rede, testáveis sozinhos.

---

## 🌐 Rede: WSL invisível na LAN (em curso 2026-07-27)

O host roda no WSL2 → IP próprio (`172.28.17.24`) atrás de NAT. Windows entra por
`localhost` (encaminhamento só vale pra conexão originada no Windows), **outro PC da rede
não** — bate em `192.168.3.100:8080` e não há ninguém escutando.

**Aplicado:** `C:\Users\Meketreve\.wslconfig` criado com `networkingMode=mirrored` +
`hostAddressLoopback=true` (WSL 2.6.3, Windows 11 24H2 — suporta). Falta o usuário rodar
`wsl --shutdown` e, em PowerShell ADMIN, as duas regras de firewall: `New-NetFirewallRule`
(porta 8080, perfis Private/Domain — trocar por `Any` se a escola for rede Pública) e
`New-NetFirewallHyperVRule` (VMCreatorId `{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}`) — no modo
espelhado o tráfego passa pelos DOIS firewalls.

**✅ PEGOU (conferido em 2026-07-27, sessão 29):** `hostname -I` dentro do WSL devolve
`192.168.3.100` — modo espelhado ativo, o `wsl --shutdown` já aconteceu. O que NÃO foi
verificado é o par de regras de firewall (nenhum outro PC da rede foi testado contra a
porta 8080); se o outro PC não abrir, é ali que falta.
**Desfazer:** apagar o `.wslconfig` + `wsl --shutdown`.
**Plano B** (sem mexer em config, mas o IP do WSL muda a cada boot): `netsh interface
portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080
connectaddress=<IP do WSL>`.
**Saída definitiva:** host nativo no Windows (o .exe portátil do professor já está no plano) —
sem camada de WSL no meio.

## ⚠️ Pendências externas (não bloqueia coding)

- Testar cedo num PC REAL do lab (usuário tem admin em todas as máquinas/escolas).
- Distribuição inicial: pasta compartilhada do Drive.
- Certificado de assinatura de código (custo anual) — futuro, pra adoção fora da escola-piloto.

---

## 🔧 Comandos úteis

```bash
npm run dev         # Vite dev server do cliente (http://localhost:5173)
npm run dev:server  # servidor Node+ws em watch (placeholder até checkpoint 5)
npm test            # testes do /shared (vitest)
npm run typecheck   # tsc --noEmit nos 3 workspaces
npm run build       # build de produção do cliente
npm run verify      # typecheck + testes + build (o portão antes de commitar)
npm run smoke       # cenários de rede reais (--lista diz o que cada um prova)
npm run bench:headless   # roda o ?bench num Chrome headless e imprime o perfil
npm run shots:tablet     # mede+fotografa a UI em 1024×600 com pointer:coarse
npm run shots:luz        # §💡 compara o MESMO bench ao meio-dia e à meia-noite
```

**Verificação da luz** (precisa do `npm run dev` rodando em outro terminal): mede a
luminância de uma janela de terreno nas duas horas e falha se o meio-dia estiver escuro, se a
meia-noite estiver em preto absoluto, se a razão noite/dia não cair, ou se o console cuspir
erro de shader. Prints em `.wolf/designqc-captures/luz/`. ⚠️ **Nunca medir cor lendo o canvas
pela página** — `drawImage` de canvas WebGL fora do frame devolve preto e o A/B "passa" com
0/0 (bug-540); o script decodifica o PNG do CDP justamente por isso.

**Verificação de layout mobile** (precisa do `npm run dev` rodando em outro terminal):

```bash
npm run shots:tablet                       # 1024×600, Kindle Fire — a RÉGUA
npm run shots:tablet 1280 800              # tablet Android comum
COARSE=0 npm run shots:tablet 1920 1080    # regressão do desktop
```

Cada linha do relatório é uma medição, não uma impressão: "cabe / ESTOURA" compara
`getBoundingClientRect` com a altura da janela, "menor alvo" tem piso de 40px, e
"chat × hotbar" mede a intersecção dos dois retângulos. Prints em
`.wolf/designqc-captures/tablet-<L>x<A>/` (ignorada pelo git). Numa rodada `COARSE=0` as
linhas ✗ de joystick e alvo de dedo são ESPERADAS — só valem em aparelho de toque.

**Modo benchmark (o que mandar pro PC do lab):**

```
http://<host>:8080/?bench            # 30 s, mundo E (streaming), seed 20260726
http://<host>:8080/?bench=60         # trajeto mais longo
http://<host>:8080/?bench&tamanho=P  # mundo denso: mede só render
http://<host>:8080/?bench&semvida    # lado B do A/B do §🌬️ (nuvens+balanço OFF)
```

**A/B do §🌬️ (custo da vida ambiental), 2 URLs seguidas na MESMA máquina:**
`?bench` depois `?bench&semvida`. O perfil se etiqueta sozinho (`meta.bench.semVida`,
`config.nuvens/balanco`) e o arquivo nasce `perf-bench-semvida-*.json` no lado B, então o par
não se confunde na pasta. Comparar com a régua do lab (`…-l9xf.json`).

---

## 📚 Referências (leia SE precisar)

- `projeto.txt` — proposta pedagógica completa (BNCC, fundamentação, indicadores seção 14).
- `.wolf/cerebrum.md` — Decision Log com o PORQUÊ de cada escolha.
- `.wolf/anatomy.md` — índice de arquivos.
