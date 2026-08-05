# TODO — logica-em-jogo

> Working checklist. **STATUS.md** = handoff ("why & where we are"); **TODO.md** = "what's left to do".
> Keep items actionable and short. Check off with `[x]`; sweep done items into STATUS.md ✅ when a phase closes.
> Last updated: 2026-08-05 (sessão 47 — os **PRINTS do F10** (`shots:f10`, novo), os dois
> **REFINOS de forma** (caixa do baú, frente da fornalha), o **bug-580** e o **push dos 11
> commits**. Ver 🔥 abaixo e STATUS 🚀)

---

## 🔥 Now (this session)

<!-- Sessão 47 (2026-08-05). "roda os prints, faz os refinos e depois o push". Abriu com
     `git fetch`: o local estava 9 commits À FRENTE (a 46 inteira nunca foi empurrada). -->

- [x] **§🔬 `npm run shots:f10` (`scripts/f10-shot.mjs`, NOVO).** 8 prints do F10 contra o host
      REAL, com 22 asserções medidas no DOM. O painel abre pelo gesto do aluno (toque no ▣) e
      os 4 estágios do algodão saem de 4 plantios em tempos diferentes com `LJ_CRESCIMENTO`
      acelerado — nenhum byte forjado.
- [x] **bug-580 (achado pelo próprio print):** trocar fornalha por baú na mesma célula abria o
      painel como fornalha em cima de um baú. `applyBlockQuieto` passou a comparar o TIPO do
      byte VELHO com o novo.
- [x] **§🍖 Refino — o BAÚ virou CAIXA de 14/16.** Saiu do `isFullCube`, ganhou `case` no
      `emitShape` e um tile de Y no `emitBox` (a tampa). Mira segue a forma; colisão continua
      célula cheia (regra do móvel).
- [x] **§🍖 Refino — a FORNALHA ganhou FRENTE.** Boca numa face só, direção no id.
      **186/187 viraram o −Z e as outras três entram em 194-199** (não contíguos de propósito:
      renumerar quebraria mundo salvo). Tradução por TABELA (`FORNALHA_POR_FRENTE`); acender
      preserva a direção. Tile novo `fornalhaCostas`.
- [x] **PUSH:** os 9 commits da sessão 46 + os 2 desta.
- [ ] **⚠️ PRO OLHO DO USUÁRIO (não consertado, é escolha de arte):** o tile do algodão maduro
      lê como um **martelo cinza** num cabo verde. Evidência:
      `.wolf/designqc-captures/f10/08-canteiro-algodao.png`. Fix seria em `paintAlgodao`
      (`client/src/atlasTexture.ts`): capulho mais BRANCO e mais redondo/irregular.

<!-- Sessão 45 (2026-08-05). O usuário abriu com o PLAYTEST FEITO (17 alunos, 2026-08-04) e
     três pedidos: (1) todas as receitas que faltam, (2) o bug da lista de craft — que ele
     confirmou ser o bug-573 já corrigido na 44, (3) o §🍖 F7 /pvp que ele havia pulado na 41.
     A sessão começou com `git fetch`: o local estava 14 commits atrás (41..44 vieram de outra
     máquina). -->

- [x] **🏫 PLAYTEST DA SOBREVIVÊNCIA — FEITO (2026-08-04, turma de 17 alunos).** O usuário:
      *"conseguiram fazer craft, plantar e comer"*. **Nenhum ajuste de número foi pedido** —
      `TICKS_POR_CRESCIMENTO`, as chances de fruta/semente, a saciedade e o dreno de fome ficam
      como estão até alguém reclamar. O que o playtest gerou de trabalho está nos dois itens
      abaixo (receitas que faltam + o bug da lista de craft).

- [x] **bug-573 — a lista de craft voltava ao topo a cada peça fabricada.** É ESTE o "bug da
      lista de craft" do pedido (confirmado pelo usuário nesta sessão), e ele **já está
      corrigido no código da sessão 44** (`scrollCraft` sobrevive ao `replaceChildren`, restaurado
      DEPOIS do append; filtrar zera de propósito). Coberto por `npm run shots:toque`
      (rolagem 324 → 324; com o fix fora, 324 → 0). **Nada a fazer além de conferir no próximo
      playtest.**

- [x] **🧱 RECEITA PRA TODO COLOCÁVEL** (sessão 45, escopo GRANDE escolhido pelo usuário:
      *"cobrir tudo, inventando as pontes"*). **12 → 110 receitas.** Os elos que o lite não tem
      (forno, ovelha, corante de mob) viraram pontes com material do próprio mundo: **vidro ←
      areia · tijolo ← terra + areia · lã ← trigo · pedra ← 2 pedregulho · tocha ← tábua +
      carvão · folhagem ← tronco da MESMA espécie · grama ← terra + (semente | areia | neve)**.
      As 12 cores saem de FLOR, e as quatro sem flor própria saem de **mistura** (laranja =
      amarelo + vermelho, roxo = vermelho + azul, rosa = vermelho + branco, ciano = azul +
      verde/mandacaru) — misturar cor é conteúdo de sala. Cobre lã, vidro colorido, tapete,
      porta, janela, cadeira, sofá, cama, quadro, laje/escada de tijolo, arenito, tijolo de
      pedra, obsidiana, capim e os **36 blocos-glifo** (pedregulho escrito com carvão).
      Os 12 índices antigos **não se mexeram** (o índice é contrato do protocolo).
      **Portão novo em `receitas.test.ts`:** varre TODOS os ids e reprova bloco colocável sem
      receita — quem criar bloco novo decide na hora entre escrever a receita ou entrar em
      `SEM_RECEITA` com a razão (terreno, minério, tronco, flor, muda, bedrock).
      **Extra de UI:** a lista ganhou o interruptor **"só o que dá pra fazer agora"** (padrão
      desmarcado) — com 110 linhas e mochila vazia, o painel era uma parede cinza.

- [x] **§🍖 F7 — `/pvp`** (sessão 45; pulado na 41, retomado a pedido do usuário).
      `/pvp ligar|desligar` professor-only (molde do `/hora`, escreve na MESMA regra do
      `/regra pvp`), ataque = clique esquerdo em jogador com a mensagem nova `atacar {alvo}`,
      **2 pontos por soco e 0,5 s de cooldown**, e quem confere regra/modo/alcance/cooldown é a
      session. Mundo de aula força OFF. A regra `pvp` perdeu o `RegraDef.pendente` — **nenhuma
      regra do registro é pendente hoje**. O `modo` passou a carregar `pvp?` (opcional), que é o
      que deixa a mira ficar vermelha em cima de quem se pode socar. Smoke `pvp` novo.

- [x] **§🍖 F9 — PRESET DE MUNDO DE SOBREVIVÊNCIA** (sessão 43). `SessionOptions.sobrevivencia`
      (eixo à PARTE do `WorldPreset`, que segue sendo só terreno): mundo NOVO nasce com
      `modo sobrevivencia` e o ciclo dia/noite andando; pvp e confinamento ficam no padrão
      de propósito (o save guarda só o diff). Três hospedeiros: `LJ_PRESET=sobrevivencia`
      (atalho) ou `LJ_SOBREVIVENCIA=1` (compõe com terreno plano), `sobrevivencia` no init
      do worker, e o select **"como jogar"** no formulário de mundo novo do menu.
      Smoke `preset` novo (13/13).

- [x] **§🏁 MAPA DE CORRIDA** (sessão 40, pedido do usuário) — `aula7-corrida.ljw`: 4 postos
      `chegar` em modo sequencial, pista em U com escada, vão com ponte, ziguezague e
      serpentina. `um` nos 3 primeiros, **`todos` na chegada**. Verificador próprio (BFS +
      aluna que corre) é o portão. Detalhe no STATUS ✅.

## ✅ §🍖 F10 — FUNDIÇÃO, FERRAMENTAS E ALGODÃO — **FEITO INTEIRO (sessão 46, 2026-08-05)**

<!-- O usuário respondeu as 5 perguntas em aberto e mandou: "pode fazer tudo da f10 na ordem
     que achar melhor". Ordem executada: F10a → F10b → F10e → F10f → F10c → F10d, cada uma no
     seu commit. As decisões dele: fornalha SUBSTITUI a receita de vidro · graveto é ITEM e a
     tocha é 1 graveto + 1 carvão (mineral OU vegetal) · sem picareta o bloco NÃO QUEBRA e
     mostra aviso · baú com item não quebra · confinamento barra interação.
     Detalhe de cada frente no STATUS ✅. Os ❓ que sobraram viraram decisão e estão no
     cerebrum (Decision Log). -->

## 🔜 §🍖 F10 — o escopo, pra referência (tudo abaixo está FEITO)

<!-- ANOTADO, não implementado (é o padrão dele: "joga tudo isso no todo.md").
     1º pedido: bloco de ALGODÃO no lugar da lã-de-trigo (planta selvagem dropa
     semente por sorte, cultivada dropa 1–2 por colheita), FORNALHA, FERRAMENTAS,
     LINGOTES, item CARVÃO (do minério) e CARVÃO VEGETAL (de cozinhar tronco), com
     TEMPO DE QUEIMA por combustível.
     2º pedido (mesma sessão, respondendo às perguntas): ferramentas SEM durabilidade
     e OBRIGATÓRIAS pra minerar · claim protege QUALQUER interação de não autorizado
     (porta e inventário) · BAÚ com receita e painel de transferência (mochila de um
     lado, baú do outro). Viraram F10d (decidido), F10e e F10f.
     A ordem no fim da seção é por custo e por dependência. -->

**A ideia que amarra tudo:** o lite não tem mob, e foi por isso que a sessão 45 inventou
"lã ← trigo". **Algodão é a ponte HONESTA** — vira planta de verdade, com a mesma cadeia que o
trigo já ensina (achar → plantar → esperar → colher), e devolve o trigo ao papel de comida. E a
fornalha é o que transforma "minério é bloco decorativo" em cadeia de produção de verdade.

### F10a — o item CARVÃO e os drops de minério (~0,5 sessão, NÃO depende da fornalha)

- [x] **`ITEM_CARVAO` na banda ≥900** e `drops.ts`: **minério de carvão → 1 item carvão**
      (hoje o bloco cai ele mesmo). Idem **minério de diamante → 1 item diamante**: no
      Minecraft esses dois não fundem, o minério já entrega o item.
      **Ferro e ouro continuam caindo como BLOCO de minério** — é ele que vai pra fornalha.
- [x] **As receitas que hoje usam `MinerioCarvao` passam a usar o item**: tocha, corante preto
      (lã/vidro/tapete pretos), obsidiana e os **36 glifos**. ⚠️ Mudar o CUSTO de uma receita
      existente é permitido (a identidade é o ÍNDICE, e ele não se mexe) — o que não pode é
      reordenar. O portão de `receitas.test.ts` segue valendo sem mudança.
- [x] **Ícone de item vem do ATLAS** (`makeBlockIcons` recorta dele), então **todo item novo
      precisa de tile pintado** em `atlasTexture.ts` — é o custo escondido de cada id novo.

### F10b — a FORNALHA (a frente cara, ~1,5–2 sessões — é ela que destrava o resto)

- [x] **É o primeiro bloco com INVENTÁRIO do jogo, e o molde já existe: o QUADRO.**
      `quadros.ts` é o precedente exato — conteúdo por POSIÇÃO num mapa da GameSession
      (servidor = verdade), mensagens próprias e persistência no **meta do save**, sem tocar
      nos bytes do chunk. A fornalha segue esse desenho: `fornalha.ts` puro + mapa por posição.
- [x] **`shared/src/fornalha.ts` (puro):** 3 slots (entrada · combustível · saída),
      `COZIMENTO` (id de entrada → id de saída) e **`COMBUSTIVEIS` (id → ticks de queima)**,
      que é o pedido explícito do usuário. Régua sugerida, com o tick de 10 Hz:
      **1 cozimento = 100 ticks (10 s)** · tábua/tronco/cerca/laje de madeira = 1 cozimento ·
      **carvão e carvão vegetal = 8 cozimentos** (os números do Minecraft, que é a convenção
      que a turma já tem). Tudo em TICKS, nunca em relógio de parede.
- [x] **O que ela cozinha na v1:** minério de ferro → **lingote de ferro** · minério de ouro →
      **lingote de ouro** · **tronco (as 4 espécies) → carvão vegetal** · areia → vidro
      (❓ **decidir: manter também a receita direta da 45, ou tirá-la quando a fornalha
      existir?**). Comida assada é escopo à parte e não entra.
- [x] **Dois ids de bloco** (apagada/acesa), estado no ID como a porta — e **acesa EMITE LUZ
      de graça**, porque a luz (§💡) é função pura dos bytes e mora 100% no cliente.
      Sem direção de frente na v1 (4 ids a mais só pela textura).
- [x] **Tick:** índice de fornalhas ACESAS varrido no tick, no molde do pulso da plantação
      (§🍖 F6) — fornalha apagada custa zero. Receita da própria: **8 pedregulho**.
- [x] **Protocolo:** `use_block` já existe e vira "abrir" (responde com o estado da fornalha);
      falta a mensagem de mover item mochila↔fornalha e o `fornalha_changed` pra quem está com
      ela aberta. **A UI nunca decide** — mesma disciplina do craft.
- [x] ⚠️ **Colisões:** o balde vira **3 lingotes de ferro** (o comentário em `receitas.ts` já
      previa) · `SEM_RECEITA` perde os minérios de ferro/ouro como "sem uso" · claim e
      confinamento têm de valer pra abrir fornalha alheia (é acesso a INVENTÁRIO, não a bloco).

### F10c — ALGODÃO (~1 sessão)

- [x] **`Algodao0..3` no molde EXATO da plantação do F6** (4 estágios em ids consecutivos, só
      o 0 colocável, cruz de sprite, exige `isSolo`). O `crescerPlantacao` deixa de ser
      específico do trigo — **uma planta = (id base, nº de estágios)** —, e o índice
      `plantacoes` da session passa a guardar as duas.
- [x] **Algodão SELVAGEM no worldgen** (bioma a escolher — caatinga/cerrado combina), com
      **chance de dropar 1 semente**, no molde exato do `CHANCE_SEMENTE_DO_CAPIM` (1/4).
      É assim que o aluno ACHA a cadeia sem o professor entregar.
- [x] **Cultivado maduro dropa 1–2 algodão + a semente de volta.** É o **primeiro drop com
      QUANTIDADE sorteada** — `dropsDe` já recebe o `sorteio` injetável de propósito, então
      cabe sem motor novo (e o teste não vira sorteio: ele injeta o sorteio).
- [x] **`3 algodão → 1 lã branca`** substitui o CUSTO da receita de lã branca (o índice fica).
      O trigo volta a ser SÓ comida — some a competição pão × lã que a 45 criou, e a cadeia da
      cor fica: algodão → lã branca → tingir com flor. As 11 lãs coloridas não mudam.

### F10d — FERRAMENTAS (~1–1,5 sessão) — **as duas decisões estão TOMADAS (2026-08-05)**

> **O usuário decidiu: SEM durabilidade, e OBRIGATÓRIA pra minerar.**

- [x] **SEM durabilidade na v1** — ferramenta não quebra. `Stack` continua `{id, qtd}` e
      **nenhum campo novo entra no save**; `tamanhoStack(id) = 1` (o mesmo do balde) basta.
      Se um dia a durabilidade entrar, ela contamina todo código de pilha (empilhar, mover,
      salvar, comparar) — é justamente por isso que ficou fora enquanto ninguém pediu.
- [x] **OBRIGATÓRIA pra minerar — e isso muda a progressão da aula, de propósito.** Quem entra
      em sobrevivência **não pega pedra até fabricar a picareta de madeira**, e é isso que dá
      sentido à cadeia inteira (madeira → picareta → pedra → picareta de pedra → minério →
      fornalha → lingote). ⚠️ Consequência a explicar pro professor no dia do playtest: a
      primeira coisa que a turma faz numa aula de sobrevivência passa a ser derrubar árvore.
- [x] **Onde mora o gate: no `break_block`, ANTES do `applyBlock`** — mesma disciplina da
      recusa por mochila cheia (recusa não pode deixar rastro no mundo), com o mesmo **freio de
      5 s** no aviso ao chat, porque quebrar é clique repetido. Criativo e mundo de aula ficam
      de fora pelo portão que já existe (`inventarioVale`).
- [x] ❓ **Sem a ferramenta certa: o bloco NÃO QUEBRA, ou quebra e não cai nada?** O Minecraft
      faz o segundo, mas lá existe tempo de quebra pra avisar antes; aqui é 1 clique
      instantâneo, e "sumiu e não ganhei nada" é frustração de aula. **Recomendação: NÃO
      QUEBRA, com aviso** ("precisa de uma picareta") — reversível numa linha.
- [x] **`shared/src/ferramentas.ts` (puro):** tipo de ferramenta × família de bloco (picareta =
      pedra/minério/tijolo/laje-escada de pedra · machado = madeira · pá = terra/areia/cascalho/
      neve) e o NÍVEL (madeira < pedra < ferro < diamante) pra minério exigir picareta melhor.
      Tabela pura, testável, no molde de `drops.ts`.
- [x] **Receitas** no molde do Minecraft (a convenção que a turma já tem), com um detalhe: não
      há GRAVETO no jogo — ou ele entra como item novo, ou a receita usa tábua direto.
      ❓ Decidir na hora de implementar (graveto é mais fiel; tábua direto é uma cadeia a menos).
- [x] **Enxada só faz sentido se houver terra ARADA** — hoje se planta direto na terra/grama
      (decisão do F6). Ou a enxada fica fora, ou o farmland nasce junto.

### F10e — BAÚ e o painel de transferência (~1 sessão, **pedido do usuário 2026-08-05**)

- [x] **Baú = bloco com inventário próprio, mesmo desenho da fornalha (F10b).** Se as duas
      frentes andarem juntas, o mapa "posição → inventário" no meta do save nasce UMA vez e
      serve pras duas — fazer o baú DEPOIS da fornalha é o barato; fazer antes obrigaria a
      escrever o mesmo encanamento duas vezes.
- [x] **Painel de transferência: mochila de um lado, baú do outro** (pedido literal), com o
      **gesto de tocar-na-origem-tocar-no-destino** que o F4 já usa na mochila — arrastar dói
      no tablet, e essa decisão já foi tomada duas vezes (mochila e craft).
- [x] **Receita:** 8 tábuas (o número do Minecraft). Tamanho: **27 slots** (uma mochila
      inteira) é o mais simples de desenhar com a grade de 9 que já existe.
- [x] **O servidor é dono do conteúdo**, como em tudo desde o F4: o cliente manda "mover do
      slot X da mochila pro slot Y do baú" e recebe os dois inventários de volta. Nada de o
      cliente escrever baú.
- [x] ⚠️ **Dois alunos no mesmo baú ao mesmo tempo** é o caso que não existe na mochila: ou o
      servidor manda o conteúdo novo pra todo mundo que está com ele ABERTO (como o
      `quadro_changed` faz), ou some item na cara do colega.
- [x] **Quebrar baú cheio:** ou devolve tudo pra mochila (e recusa se não couber, no molde do
      "mochila cheia recusa a quebra" do F4), ou é proibido quebrar com conteúdo. ❓ Decidir.

### F10f — CLAIM protege INTERAÇÃO, não só edição (barato, e metade já está pronto)

> **Pedido do usuário (2026-08-05):** *"área com claim não permite qualquer interação de não
> autorizados, seja abrir porta ou inventário"*.

- [x] ✅ **A porta JÁ está protegida hoje** — conferido no código: `use_block` (porta e janela)
      passa por `claimBloqueia`, e o mesmo vale pro `quadro_set`, pro balde e pro
      colocar/quebrar. Autorizado = **dono, amigos do grupo dele e o professor** (que ignora
      todo claim). Ou seja: o pedido já é o comportamento atual pra tudo que EXISTE.
- [x] **O que falta é garantir que os containers NOVOS nasçam dentro dessa regra:** abrir
      fornalha (F10b) e abrir baú (F10e) são **acesso a INVENTÁRIO**, e têm de passar por
      `claimBloqueia` **antes de responder o conteúdo** — senão dá pra LER o baú alheio, que é
      pior que mexer nele.
- [x] **Portão de teste (o que impede a regra de furar de novo):** um teste que varre TODA
      mensagem de cliente que aponta pra uma célula e exige que ela passe pelo gate de claim/
      confinamento. Hoje seriam `place_block`, `break_block`, `use_block`, `balde`,
      `quadro_set` — e amanhã as duas de container, sem ninguém precisar lembrar.
- [x] ❓ **Confinamento (mundo de aula) segue a mesma regra?** Ele é o INVERSO do claim (prende
      o aluno na área do grupo dele). Hoje ele barra edição; provavelmente deve barrar
      interação também, mas isso é decisão de aula — perguntar antes de mexer.

**Ordem sugerida:** F10a (barato e independente) → F10b (a cara: fornalha, e é ela que cria o
encanamento de bloco-com-inventário) → **F10e (baú, que reusa esse encanamento)** → F10f (o
gate de claim nos containers, junto de cada um) → F10c (algodão) → F10d (ferramentas).
**Tudo feito na sessão 46.**

## ⏭️ Next

- [x] **Vegetação precisa de bloco de apoio** (sessão 40, bug-558) — `GramaAlta`/`Seca`/`Fria`
      (179–181) entraram no `rulesMap` apontando pro `torchRule`, e a plantação do F6 junto.
      A varredura pedida foi feita: **`precisaApoio()` e o `rulesMap` batem** agora. De quebra,
      o `torchRule` deixou de chamar `isFullCube` direto e passou por `apoioValido(id, abaixo)`
      — a MESMA função do gate do `place_block`, pra não existir colocação que evapora no tick.

- [x] **§🍖 F5 — craft por LISTA** (sessão 39) — `shared/src/receitas.ts` puro, `fabricar`
      tudo-ou-nada, painel do E com abas mochila/criar e "falta N" em vermelho. 11 receitas
      (madeira + pedra + balde). Servidor valida/aplica; cliente pede por índice. Detalhe no
      STATUS ✅. **Print do painel pendente (chrome ausente na máquina), playtest pendente.**

- [x] **O balde virou item de mochila** (sessão 39, escopo escolhido pelo usuário) — receita
      `3 ferro → balde vazio`, o `case balde` da session integrou survival (confere o item no
      slot ANTES de mexer na água, troca vazio↔cheio in-place por `definirSlot`), e o ramo do
      `main.ts` saiu do guarda `mochila.ativa`. Fechou o pendente do F4.

- [x] **🖼️ HANDOFF do Chrome — RESOLVIDO na máquina de casa** (sessão 40). O usuário
      confirmou: *"não tem o chrome no not, aqui tem"* — o cache
      `~/.cache/puppeteer/chrome` tem duas versões nesta máquina, e `shots:craft` rodou
      (`linhas=12 · habilitadas=3 · marcas 'falta'=9`). **O print do painel de craft, pendente
      do F5, está tirado e conferido.** ⚠️ **No NOTEBOOK o cache continua vazio** — lá os
      scripts de print seguem saindo com "Chrome não encontrado", e a receita de instalação é
      a de sempre: `npx -y @puppeteer/browsers install chrome@stable`, ou `CHROME=/caminho`
      apontando pra um Chrome do sistema.

- [x] **§🍖 F6 — comida** (sessão 40, escopo GRANDE escolhido pelo usuário). `comida.ts` puro,
      plantação de 4 estágios que cresce por PULSO (fora do `rulesMap` de propósito), fruta
      caindo da folha, `comer {slot}` no clique direito, pão (receita 11) e
      **`VIDA_MINIMA_POR_FOME` 6 → 0: a fome voltou a matar.** Detalhe no STATUS ✅.
      **Playtest pendente** — ver 🏫.

## 🏫 Na escola (o usuário faz lá)

- [ ] **PLAYTEST DAS 110 RECEITAS E DO PVP (sessão 45)** — é o que sobrou de mais valioso.
      **Das receitas:** 110 linhas na aba "criar" cabem numa aula, ou a turma se perde? O
      interruptor **"só o que dá pra fazer agora"** (novo, padrão desmarcado) é achado sozinho —
      e devia nascer MARCADO? O filtro de texto virou essencial (com 12 receitas era opcional)?
      **As pontes inventadas se explicam sem o professor?** ("vidro de areia", "lã de trigo",
      "tijolo de terra + areia", "pedra de 2 pedregulhos"). A **mistura de cor** (laranja =
      amarelo + vermelho, roxo = vermelho + azul) é descoberta divertida ou truque escondido —
      alguém acha sem ser avisado? Os **36 blocos-glifo** no fim da lista atrapalham quem
      procura material de construção? Alguma quantidade parece cara/barata demais? (mudar é uma
      linha em `RECEITAS`, **mas só APPEND**: o índice é contrato do protocolo.)
      **Do pvp:** `/pvp ligar`, depois clique esquerdo em cima de alguém. **2 pontos por soco
      (1 coração) e 0,5 s de cooldown** dão perseguição divertida ou execução? A **mira fica
      VERMELHA** em cima de quem se pode socar — é notada ANTES de o aluno bater sem querer? O
      aviso no chat ("o professor LIGOU o ataque entre jogadores") chega a tempo? A morte
      nomeia quem bateu no chat da turma — isso ajuda a mediar ou vira competição de placar?
      Faz falta o atacante SENTIR que acertou (hoje só a vítima tem retorno)? **Quem está em
      criativo não bate nem apanha** — o professor supervisiona em paz, ou isso confunde?
      ⚠️ Claim/confinamento **não** barram o soco (a área protege bloco, não pessoa): se a turma
      esperar o contrário, é um gate a mais no `atacar`.

- [ ] **PLAYTEST DA SOBREVIVÊNCIA (F1+F2+F3+F4+F5)** — ⚠️ **A PARTE DE CRAFT/PLANTAR/COMER JÁ
      FOI FEITA** (2026-08-04, 17 alunos, sem ajuste pedido). O que segue aberto aqui é o resto:
      queda, ar, fome, mochila e os layouts de tablet. Entrar com `/modo sobrevivencia all`.
      **Do F5 (craft), o que só o dedo responde:** o painel do E tem abas **mochila/criar** — a
      troca de aba é óbvia? Na aba "criar", **tocar na linha da receita fabrica** (a linha inteira
      é o botão) — o alvo dá pro dedo no tablet? O "falta N" em vermelho comunica o que falta sem
      texto? A receita desabilitada (cinza) lê como "não dá agora"? O filtro de texto vale a pena
      numa lista de 11, ou atrapalha? **O balde agora funciona em survival** (craftar `3 ferro →
      balde`, encher numa fonte, despejar) — a troca vazio↔cheio no MESMO slot parece natural?
      **Do F4:** o painel "mochila" com o gesto **tocar no item, tocar no destino** (não arrastar)
      — funciona no tablet? A contagem no canto do slot é legível? Os 9 slots por linha cabem em
      RETRATO? Começar de mãos vazias frustra, ou o `/dar all <id> <qtd>` resolve a aula?
      **Mochila cheia RECUSA a quebra** — isso lê como cuidado ou como bug? (aviso no chat, no
      máximo 1 a cada 5 s).
      Morrer de queda é justo (dói a partir de 4 blocos, mata em 23)? 15 s de ar é pouco?
      **A fome desce rápido demais?** (400 blocos andados OU 200 construídos = 1 ponto; a mira é
      a barra inteira em ~50 min de aula ativa — é o número mais provável de mudar). A fome
      parar em 3 corações parece cuidado ou parece bug (`VIDA_MINIMA_POR_FOME`, deliberado até
      o F6)? **Corações/coxas/bolhas no TABLET** — 96px acima do rodapé, agora com uma barra a
      mais, e podem brigar com a hotbar de toque, que ninguém olhou. A vinheta vermelha de dano
      incomoda? Voltar ao spawn ao
      morrer atrapalha em mundo grande (aí "cama = ponto de renascer" é feature nova)?
      ⚠️ A altura da queda vem de amostras a 10 Hz e erra PRA MENOS — "caí de 10 e não doeu" é
      a tolerância documentada, não bug.

- [x] **PLAYTEST do RELEVO POR BIOMA** (sessão 33) e **PLAYTEST da LUZ e das CAVERNAS**
      (sessão 32) — o usuário declarou os dois FEITOS em 2026-08-02 e **não pediu ajuste
      nenhum**. Os botões seguem documentados caso mude de ideia: `BIOMAS.*.relevo`,
      `SNOW_HEIGHT`, `Bioma.neve`, `luzMin`, `PISO_LUAR`, `LIMIAR_CAVERNA`.
- [ ] **FPS do lab com cavernas + relevo** — cavernas somaram **+66% de triângulos**
      (153 852 → 255 234) e o relevo por bioma devolveu **−7,5%** (700 230 → 647 858 na medição
      pelo mesher). A GPU de lá já fecha o p95 em 16,8–19,6 ms contra 16,7 de orçamento. Rodar
      `?bench` no notebook e comparar com a régua (`…-l9xf.json`). Se doer, o botão é
      `LIMIAR_CAVERNA`. ⚠️ A seed do `?bench` é das mais vazias — o +66% é o melhor caso.
- [ ] **PLAYTEST mobile no tablet** — headless não tem dedo, teclado do Android nem DPI real.
      Conferir nessa ordem: tapa no slot da hotbar troca de bloco · chat com teclado aberto ·
      "Meus mundos" com vários mundos (chegar no "voltar") · abas do inventário numa linha ·
      F3/objetivos sem colidir com a barra de botões do topo. **Não bloqueia a v2** (arquivos
      disjuntos: CSS/UI × `shared/src/worldgen`).
- [ ] **A/B do §🌬️ no notebook do lab:** `?bench` e depois `?bench&semvida`, duas URLs
      seguidas na MESMA máquina. Só o lado do PC de dev foi feito (sessão 30).
- [ ] **Rodar o `.bat` no Windows uma vez.** O bloco de auto-update do `.sh` foi exercitado
      nos 8 caminhos aqui; o `.bat` NÃO — não há cmd.exe no WSL. Único jeito é duplo clique.

## ⏭️ Next (queued, ready to pick up)

- [ ] **Mobile, 2ª rodada — painéis de AUTORIA** (`#painel`: quadros, objetivos, regiões) e o
      de grupo/jogadores. O usuário deixou de fora da 1ª rodada. Seguem em
      `width: min(580px, 94vw)` / `height: min(560px, 84vh)`; os botões internos já têm alvo
      de 40px, mas o layout não foi revisto. O caminho que funcionou no inventário foi
      ALARGAR em paisagem baixa, não quebrar linha.
- [x] **👥 PAINEL DE AMIGOS — a interface do `/amigos`** (sessão 43). `client/src/friends.ts`
      (`FriendsPanel`, molde do `players.ts`, root `#amigos`), aberto pela tecla **G**
      (`KeyAction` nova `amigos`) e por dica no chat quando a proteção de áreas LIGA.
      Convites recebidos com aceitar/recusar · grupo com N/6, expulsar (só dono) e
      "sair e DESFAZER o grupo" armado · lista de quem convidar, montada de quem está
      online. **Sem função nova**, como pedido — mas apareceu o bug-568: quem CONVIDA não
      recebia o feed `friends` de volta (e é nesse instante que o time nasce), então o
      botão parecia não funcionar. Campo `enviados` novo na mensagem, pro "aguardando".
      Verificado por `npm run shots:amigos` (2 prints + alvo de toque de 40px).
      ⚠️ **O que ficou aberto:** no TOQUE não há como abrir (não há tecla) — entra junto
      com a revisão da barra de 6 botões, logo abaixo.
- [x] **📱 A BARRA DE CIMA DO TOQUE** (sessão 43, pedido do usuário). Eram 6 botões fixos
      (☰ 🧱 💬 🪄 ⛶ 📊) em 1024×600. Ficou: **☰ 🧱 💬 sempre** · **🪄 varinha** só pra quem
      pode usá-la (professor, ou aluno com a proteção de áreas ligada) · **👥 amigos** só com
      a proteção ligada — que é quando "quem constrói na minha área" vira pergunta, e é o que
      **destrava o painel de amigos no tablet** (o pendente que a sessão deixou). **⛶ tela
      cheia e 📊 desempenho desceram pro menu de pausa** (o clique de botão É o gesto que o
      navegador exige pra tela cheia). Varinha ligada agora **destaca o botão** e troca
      **⛏/▣ por ① canto 1 / ② canto 2** — o toggle deixou de ser invisível.
      De quebra, **bug-570**: os botões da barra tinham **30px** de alvo (piso do projeto é
      40) e nunca tinham sido medidos; a barra ENTROU no `tablet-shots.mjs` (rótulos visíveis,
      alvo mínimo, largura contra a janela e o relabel da varinha). A/B: 30 → 40px, barra com
      433px de 1024. Print `11-jogo-barra-varinha.png`.
      **Não feito de propósito:** os comandos locais (`/hud`, `/varinha`, `/telacheia`) da
      3ª sugestão — pro tablet o menu resolve com menos peça nova. Se o usuário quiser o
      caminho digitado no desktop, `/hud` é o candidato natural.
- [ ] **Nome do mundo truncado no DESKTOP** ("seque…", "labirin…") — a coluna do nome fica com
      ~84px depois dos 3 botões. Em paisagem baixa já resolveu (painel de 680px). No desktop
      resolve com UMA linha (`.menu-screen { width: min(680px, 92vw) }` sem media query), mas
      é mudança visual não pedida numa tela de uso diário: **só com o aval do usuário.**
- [ ] Som de água (splash/borbulha/balde, WebAudio em `audio.ts`) — 4ª opção do refino de
      água, nunca escolhida. **Casa bem com o §🌬️ recém-fechado** (som de vento junto).
- [ ] **Não renderizar as bordas de área reservada (claim/região) além da distância de render**
      (pedido do usuário, 2026-08-03). Hoje o `regionRenderer` desenha os wireframes das áreas
      reservadas dos jogadores independentemente da distância; cular por `raioRender` (a área
      cujo centro/caixa está além do raio não gera vértice) alivia GPU/overdraw em mundo com
      muitos claims. Barato: filtro por distância antes de montar as linhas.
- [ ] **Cauda de GPU no lab — SÓ SE VOLTAR A INCOMODAR** (nenhum gatilho aceso hoje): GPU p95
      16,8–19,6 ms contra 16,7 ms de orçamento de 60 FPS. Candidatos: teto de `raioRender` em
      GPU fraca, overdraw da água, custo de fragment.
      ⚠️ **Greedy meshing NÃO ajuda aqui** — draw calls (633) e triângulos (188 048) do lab são
      IDÊNTICOS aos do PC de dev, então não é em geometria que a máquina fraca perde.

## 💡 Later / backlog (not scheduled)

- [ ] **Ferramentas que ficaram de fora do §🧪** (avaliadas em 2026-07-26, gatilho anotado):
      `ast-grep`/`sg` para busca ESTRUTURAL (achar call site por forma, não por texto) —
      vale instalar quando grep começar a devolver 30+ hits por consulta;
      LSP/Serena só se o projeto passar de ~300 arquivos (hoje 223, grep ganha).
- [x] Layouts mobile (2º da ordem do usuário) — 1ª rodada feita na sessão 31; falta playtest
      no tablet e os painéis de autoria (ver ⏭️ Next)
- [ ] v2 da geração de mundo (3º da ordem do usuário) — **escopo ABERTO em 2026-07-28**
      (sessão 31): cavernas primeiro em todo mundo procedural, depois relevo "montanha de
      verdade" por bioma. Decisões, colisões e portões em `.wolf/ROADMAP.md §🏔️`. Ver 🔥 Now.
- [ ] **Vegetação precisa de bloco de apoio** — ver o item completo em ⏭️ Next (o buraco é o
      `rulesMap` sem `GramaAlta`/`Seca`/`Fria`). Agora que o F4 existe, o que some pode virar
      DROP: é uma entrada em `drops.ts`, não engrenagem nova.
- [ ] Sobrevivência (fome/vida/craft) (4º da ordem do usuário) — **EM CURSO desde a sessão
      34**: F1 (`/modo` + `/regra` + save), F2 (vida/dano/morte), F3 (fome), F4 (inventário
      autoritativo) e F5 (craft por lista + balde-item) FEITOS; faltam F6..F9. Decisões travadas e colisões
      em `.wolf/ROADMAP.md §🍖` — quem pegar a frente NÃO reabre decisão: lite agora com porta
      pro completo · mobs só em mundo de exploração · craft por lista · `/pvp` no lite (F7,
      atalho da regra `pvp` que já existe). Ordem: **F2 vida/dano/morte** → F3 fome →
      F4 inventário autoritativo (a frente cara) → F5 craft → F6 comida → F7 pvp →
      F8 mobs (fora do lite) → F9 preset.
- [x] **Deck da CRE** (sessão 29): `relatorio/apresentacao-cre.html` — 20 slides, um arquivo
      autocontido, offline, notas do apresentador em N (ou `?notas`), handout no Ctrl+P.
      **Sem data** de propósito: a apresentação informal vem antes da formal.
- [ ] Relatório: embutir 2–4 screenshots no §3, refs em ABNT, diagrama no Anexo A (opcional,
      não bloqueia entrega). O §desempenho ganhou material forte na sessão 27 (A/B com o
      caminho síncrono + régua dev × lab).
- [ ] Gerar PDF/HTML de `relatorio/relatorio-aplicacao.md` quando o usuário pedir a entrega

## 🧭 Fora deste repo (aberto)

- [x] **PR upstream do OpenWolf: [cytostack/openwolf#64](https://github.com/cytostack/openwolf/pull/64)**
      — **JÁ ENTROU e está na 2.0.1 instalada**, mas **só no `dist/hooks/`**, e não é essa a
      cópia que chega no projeto (ver o item dos hooks abaixo). Fechar/arquivar o PR se ainda
      estiver aberto.

- [x] 🔥 **OS TRÊS AVISOS DE HOOK FALSO-POSITIVOS — CONSERTADOS (sessão 37, 2026-08-03).**
      bug-554/555/556. Os três consertos estão em `.wolf/hooks/shared.js` e `.wolf/hooks/stop.js`
      (rastreados no git), com regressão em `.wolf/hooks/_test-hooks.mjs` (10/10 —
      `node .wolf/hooks/_test-hooks.mjs`, roda o `stop.js` de verdade numa fixture de `/tmp`).

      **A causa raiz de o fix upstream não ter chegado: o pacote 2.0.1 traz DUAS cópias dos
      hooks** — `dist/hooks/` (build do `tsconfig.hooks.json`, tem o PR #64) e `dist/src/hooks/`
      (build principal do tsc, NÃO tem). O `copyHookScripts` do `dist/src/cli/init.js` procura
      nessa ordem e **`dist/src/hooks` vence**, então `openwolf init/update` sempre instalou a
      versão velha. Foi o que aconteceu no commit `192acff` ("sincroniza com o 2.0.1").

      1. **"no semantic summary written to memory.md"** — `countSemanticEntries` comparava data:
         ou o prefixo `| YYYY-MM-DD` (que NENHUMA linha tem — o formato pedido é `| HH:MM |`),
         ou, na versão do PR #64, o header `## Session: <hoje>` — que é gravado no INÍCIO da
         sessão e carrega data UTC com hora LOCAL, então sessão que atravessa a meia-noite fica
         com a data de ontem. Contagem 0 ⇒ aviso eterno. **Agora conta as linhas abaixo do
         ÚLTIMO `## Session:`, sem olhar data nenhuma.**
      2. **"buglog.json was not updated"** — `checkForMissingBugLogs` só olhava
         `session.files_written`, que registra apenas Write/Edit/MultiEdit; append por
         `python3`/`cat` no Bash era invisível. **Agora também aceita o mtime do `buglog.json`
         posterior ao início da sessão** (`buglogTouchedSince`), qualquer que seja a ferramenta.
      3. **`| HH:MM | Session end: … |` repetida a cada `stop`** — os contadores são CUMULATIVOS
         e o hook dava append em todo turno. **Agora só grava quando o resumo muda, e sobrescreve
         a linha de encerramento que estiver no fim do arquivo** em vez de empilhar outra. Se o
         modelo escreveu algo depois dela, a linha nova é acrescentada (histórico preservado).
         As 41 cópias que já estavam no `memory.md` foram colapsadas.

      ⚠️ **O conserto foi copiado à mão para as DUAS cópias do pacote global**
      (`~/.local/share/pnpm/global/v11/.../openwolf/dist/hooks/` e `.../dist/src/hooks/`, com
      `.bak-pre-fix` ao lado), para que um `openwolf init/update` não reverta. **`pnpm update -g
      openwolf` apaga esse patch** — depois de atualizar, recopiar de `.wolf/hooks/` (que é a
      fonte rastreada) ou mandar o PR upstream.

## ✅ Recently done

<!-- Checked items land here. Sweep them into STATUS.md "✅ Done" when a phase closes, then clear this list. -->

- (limpo em 2026-07-27 — a sessão 27 inteira foi pro STATUS ✅ e pro git:
  `51bc5c8` mesher em Worker · `b3669ff` wolf · `0a3dd3f` PR do openwolf ·
  `efaf6df` profundidade 1 + etiqueta `mesher` no perfil)
- [x] **§🌬️ vento + vida ambiental — 6 frentes (sessão 28)**: textura da água polida ·
      vento autoritativo (`shared/src/vento.ts`, função pura do tick) · água seguindo o
      vento · nuvens · folhas balançando (atributo `sway` + `onBeforeCompile`) · grama alta
      (`GramaAlta/Seca/Fria` 179-181) + flores balançando. Config `nuvens`/`balanco` no menu.
- [x] **Regra da correnteza (sessão 28b, ressalva do playtest)**: água que CORRE segue o
      próprio fluxo (gradiente de nível na vizinhança → 8 tiles de atlas escolhidos pelo
      mesher); água PARADA segue o vento. Pintura da água em `putImageData` + teto de 12
      repinturas/s.
- [x] **Sentido da correnteza por FACE (sessão 28c)**: `tileAguaDaFace` projeta o fluxo nos
      eixos de cada face (`FACE_BASES`). Rotação fixa por face não resolvia — verificado
      numericamente que erra em outra direção de fluxo.
