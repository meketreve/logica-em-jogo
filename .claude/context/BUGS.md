# Bugs resolvidos

<!-- Um bloco por bug, do mais novo pro mais antigo. A MENSAGEM DE ERRO é literal,
     de propósito: é por ela que o grep acha antes de alguém caçar de novo.

     Convertido de `.wolf/buglog.json` em 2026-09-25 (mesmo conteúdo, formato do
     modelo). São bugs ESCRITOS À MÃO: nada de detector automático — ele já encheu
     o arquivo de 148 entradas falsas uma vez, e elas foram podadas junto. -->

## 2026-09-22 — bug-672: usuário: 'no tablet, se o jogador sair sem querer (minimizar ou fechar) não é feito o logo
- **Sintoma:** usuário: 'no tablet, se o jogador sair sem querer (minimizar ou fechar) não é feito o logout e o jogador continua conectado, impossibilitando reconectar'
- **Onde:** `shared/src/session/presenca.ts`
- **Causa:** o servidor só tirava alguém de `players` no evento `close` do socket. No tablet, minimizar/fechar o navegador congela a aba SEM fechar o TCP — o socket fica meio aberto por minutos. Como o `authenticate` recusa nome já em jogo ('Já existe alguém em jogo com o nome X'), a própria criança ficava trancada do lado de fora. Nada no servidor perguntava se o cliente ainda estava vivo.
- **Correção:** heartbeat de APLICAÇÃO: a cada HEARTBEAT_PING_MS (4 s) o servidor manda `ping` a quem está em jogo; QUALQUER mensagem de volta conta como sinal de vida; HEARTBEAT_TIMEOUT_MS (15 s) de silêncio = `handleDisconnect` (libera o nome na hora) + `aoDerrubar` (o hospedeiro fecha e, 1 s depois, `terminate` o socket meio-aberto). NÃO é o ping do protocolo WebSocket — aquele é respondido pela pilha de rede do aparelho mesmo com a aba congelada, que é justamente o caso a pegar. Singleplayer fica de fora (o 'servidor' é um worker na mesma página; trocar de aba não pode derrubar o dono do mundo). Cliente: responde no TRANSPORTE (connection.ts), fecha na hora no `pagehide`, e explica o código 4000 ('você ficou fora do jogo tempo demais'). Os 16 cenários/sondas com socket cru passaram a responder ping — um cliente de verdade responde.
- **Tags:** rede, tablet, socket, heartbeat, presenca, relatado-pelo-usuario

## 2026-09-18 — bug-671: usuário: 'a loja ainda continua com erro de não salvar o preço do item, agora no chat tem 
- **Sintoma:** usuário: 'a loja ainda continua com erro de não salvar o preço do item, agora no chat tem a mensagem de item inválido'
- **Onde:** `shared/src/session/loja.ts`
- **Causa:** a trava do `definir_preco` era `item > MAX_BLOCK_ID` e o parse do save era `porItem > MAX_BLOCK_ID`. `MAX_BLOCK_ID` é 250 (CamaCabecaZN) e todo ITEM começa em 900 — então pão, trigo, picareta, carvão, diamante, algodão e as seis culturas (o que uma loja de aluno mais vende) eram recusados com 'Item inválido.'. A trava nasceu em 2026-09-01 pra barrar id inventado, mas confundiu 'é bloco?' com 'existe?'. A METADE ESCONDIDA era o `parsePrecoEntry`: mesmo aceitando no comando, o preço de item seria jogado fora na releitura do .ljw — o preço sumiria entre uma aula e outra. O bug-663 (sessão 98) consertou outra causa da mesma queixa (o Esc no último campo), então o usuário voltou dizendo 'ainda'.
- **Correção:** `podeEstarNaMochila(id)` em blocks.ts (`isPlaceable(id) || isItem(id)`) — a pergunta certa é 'isto pode estar numa mochila?'. Usado nas DUAS pontas (`definir_preco` e `parsePrecoEntry`), que era onde a régua tinha divergido. De quebra barra o que a régua velha deixava passar: fornalha ACESA, porta ABERTA e cabeceira de cama são ids ≤250 que nunca estão numa mochila e tinham preço aceito. 3 testes novos + passo 7b na sonda `npm run shots:loja` (pão no cliente real: vira linha de preço, salva 12, sem 'Item inválido.', e campo vazio remove).
- **Tags:** loja, preco, item, save, parse, relatado-pelo-usuario
- **Relacionados:** bug-663, bug-664

## 2026-09-17 — bug-667: a rachadura da quebra saiu um BORRÃO preto já no estágio 1 (sonda quebra-shot, print 2-rac
- **Sintoma:** a rachadura da quebra saiu um BORRÃO preto já no estágio 1 (sonda quebra-shot, print 2-rachando.png)
- **Onde:** `client/src/quebraFx.ts`
- **Causa:** os 10 estágios da trinca eram desenhados no MESMO elemento canvas, e THREE.CanvasTexture guarda a REFERÊNCIA do canvas — como as 10 texturas nascem antes do 1º frame, todas subiram pra GPU com o desenho FINAL. O estágio 1 já mostrava a trinca completa.
- **Correção:** um canvas NOVO por estágio dentro do laço. Junto, o desenho foi refeito: riscos de 1px partindo do centro até a borda (fendas), em vez de 2 riscos grossos por estágio nascendo todos no meio — o print mostrava uma aranha preta cobrindo a face.
- **Tags:** ferramentas-v2, three, canvastexture, render, sonda, design

## 2026-09-17 — bug-670: smokes inventario/comida/fornalha falharam depois da quebra por tempo ('a célula ficou vaz
- **Sintoma:** smokes inventario/comida/fornalha falharam depois da quebra por tempo ('a célula ficou vazia' ✗)
- **Onde:** `server/src/cenarios/_smoke-inventario.mjs`
- **Causa:** três coisas: (1) os cenários mandavam `break_block` e conferiam o mundo 400 ms depois — agora quebrar leva o tempo do bloco; (2) o `slot` (a MÃO) passou a decidir, e a picareta do `/dar` não cai no slot 0 quando a mochila já tem coisa; (3) no comida, a espera maior mudou a FASE do crescimento global e 'replantou' pegou o estágio 1.
- **Correção:** helper `quebrar(cli, cel, slot)` que manda `break_start`, espera `QUEBRA_MS`, e `slotDe(cli, id)` pra achar a mão certa; a asserção do replantio aceita qualquer estágio, como a irmã dela 60 linhas abaixo já aceitava.
- **Tags:** ferramentas-v2, smoke, rede

## 2026-09-17 — bug-668: teste 'editar bloco também cansa' falhou — quebrar deixou de dar fome
- **Sintoma:** teste 'editar bloco também cansa' falhou — quebrar deixou de dar fome
- **Onde:** `shared/src/session.ts`
- **Causa:** o esforço (§🍖 F3) era cobrado no FIM do handleMessage, comparando `edicoesAplicadas` antes/depois da mensagem. Com a quebra por tempo (§🔨 v2) o bloco cai dentro do `tick`, muito depois da mensagem que armou — então `mundoMudou` era sempre falso pro break_block.
- **Correção:** `break_block` saiu da lista do handleMessage e o esforço passou a ser cobrado dentro de `quebrarCelula` (session/quebra.ts), onde a quebra realmente acontece. `place_block` e `balde` seguem no caminho antigo, que continua certo pra eles.
- **Tags:** ferramentas-v2, sobrevivencia, fome, tick

## 2026-09-17 — bug-669: teste 'picareta NÃO acelera terra' falhou: 150 ms em vez de 500
- **Sintoma:** teste 'picareta NÃO acelera terra' falhou: 150 ms em vez de 500
- **Onde:** `shared/src/ferramentas.ts`
- **Causa:** o `tempoDeQuebraMs` acelerava sempre que o bloco NÃO exigia ferramenta (`exige === null || tipo bate`), então a picareta cavava terra 8× mais rápido — confundir 'o que é EXIGIDO' com 'o que ACELERA'.
- **Correção:** `ferramentaIdealDe(blockId)` separa as duas coisas: só acelera quem é o ideal daquele bloco. É também o gancho por onde machado e pá entram sem virar obrigatórios.
- **Tags:** ferramentas-v2, tempo-de-quebra, teste-pegou

## 2026-09-12 — bug-666: achado na sessao 98 (antes do commit dos ids de 16 bits): smoke sighup FALHOU — '✗ o host 
- **Sintoma:** achado na sessao 98 (antes do commit dos ids de 16 bits): smoke sighup FALHOU — '✗ o host gravou o mundo ao receber SIGINT' / 'o mundo nao voltou depois do SIGINT'; instavel (2 de 6 no codigo novo, 8 de 8 OK no antigo)
- **Onde:** `shared/src/chunkCodec.ts (ehEstreito)`
- **Causa:** O `ehEstreito` (todo id do chunk <= 255?) varria celula a celula com `c[i] > 0xff`: o encodeSave do mundo P (512 chunks, 2 M celulas) foi de ~4,5 ms pra ~35 ms (1a chamada, JIT frio, ainda pior). O save do Ctrl+C/fechar janela (bug-645) roda com o host EMBRULHADO em `npx tsx` — o sinal vai pro grupo inteiro e o wrapper morre junto; com 4 ms o save sempre ganhava a corrida, com 35 ms as vezes o processo caia antes de gravar (log sem 'mundo salvo', e numa das vezes nada no disco). Diagnostico: A/B do smoke (5x novo vs 5x antigo), depois latencia SIGINT->salvo medida (antigo ~30 ms sempre; novo 55 ms ou NUNCA), stderr/exit capturados, e cronometro in-process das fases (join, ticks, encodeSave) — so o encodeSave mudou.
- **Correção:** `ehEstreito` olha 2 celulas por vez: `new Uint32Array(c.buffer, c.byteOffset, c.length >>> 1)` e testa `& 0xff00ff00` (os bytes altos das duas), com fallback celula a celula se o offset nao for multiplo de 4. encodeSave P: ~6 ms em regime (antigo 4); smoke sighup 5 de 5 OK. A CORRIDA em si (save no sinal x wrapper npx/tsx) continua existindo, so com folga — pendencia anotada no STATUS.
- **Tags:** desempenho, save, sigint, sighup, smoke, ids16, chunk, corrida, npx, tsx, corrigido
- **Relacionados:** bug-645

## 2026-09-12 — bug-665: achado na sessao 98 ao consertar o bug-662 (nao reportado pelo usuario): porta empilhada e
- **Sintoma:** achado na sessao 98 ao consertar o bug-662 (nao reportado pelo usuario): porta empilhada em porta — quebrar as pontas devolve 3 portas de 2, e abrir a de baixo pelo TOPO dela desmancha as duas
- **Onde:** `shared/src/rules.ts (doorRule), shared/src/session.ts (use_block, yPar)`
- **Causa:** Mesma familia do bug-662: as 2 metades da porta gravam o MESMO id e o par era 'vizinho igual acima OU abaixo'. Numa pilha de 2 portas (4 celulas iguais): (1) quebrar a base da de baixo deixava o topo dela vivo encostado na base da de cima (e simetrico no topo) — cada metade dropa uma porta, 3 de 2; (2) o toggle do use_block procurava o par ACIMA primeiro, entao clicar no topo da porta de baixo alternava o MIOLO (topo de baixo + base de cima), as pontas viravam orfas de id diferente e evaporavam: 2 portas viravam 1 aberta no meio, sem drop. Repro rodada (inventario.test) confirmou os dois.
- **Correção:** Sem id novo (a porta precisaria de 8, o byte tem 5 livres): numa coluna de portas IGUAIS as portas sao sempre inteiras, entao o par sai da POSICAO — pares a partir da BASE da pilha, (0,1),(2,3)... `pilhaDePorta`/`parDaPorta` em rules.ts. doorRule: trecho par = fica; trecho impar = so a PONTA evapora (a ponta vizinha do buraco e quem acorda suja; o miolo nao se mexe). use_block usa parDaPorta. Mesher nao muda (as 2 metades sao desenhadas iguais). Testes: 2 repros de sessao (drop 2, toggle nao desmancha) + 5 puros da regra; A/B contra o codigo velho falha as 2 repros. Janela conhecida: entre a quebra e o tick seguinte, um trecho impar ainda nao resolvido pode dar par errado no toggle — mesma janela de 1 tick que a regra de orfa sempre teve.
- **Tags:** porta, par, pilha, duplicacao, drop, toggle, rules, corrigido
- **Relacionados:** bug-662

## 2026-09-11 — bug-662: usuario: 'colocar uma cama seguida da outra acaba nao formando corretamente a cama e permi
- **Sintoma:** usuario: 'colocar uma cama seguida da outra acaba nao formando corretamente a cama e permite duplicar quebrando bloco a bloco'
- **Onde:** `shared/src/rules.ts:74 (camaRule), shared/src/session.ts:1137 (place_block da cama), shared/src/drops.ts:53`
- **Causa:** CONFIRMADO E CORRIGIDO 2026-09-12 (repro em teste: 2 camas em fila, quebrando cabeca de B e pe de A, sobravam 3 camas). `camaRule` descobre o PAR perguntando so 'a celula vizinha no eixo tem o MESMO id?', nos dois sentidos (+dx/+dz = sou o pe, -dx/-dz = sou a cabeceira). As 4 direcoes da cama sao UM id cada (CamaXP..CamaZN, blocks.ts:96) e as DUAS metades da mesma cama gravam o MESMO id — entao a regra NAO consegue distinguir 'meu par' de 'metade de OUTRA cama'. Duas camas encostadas na mesma orientacao viram uma CORRENTE: com dx=+1, cama A ocupa x=0 (pe) e x=1 (cabeceira), cama B ocupa x=2 e x=3, e todas as 4 celulas tem id igual. A cabeceira de A (x=1) olha x=2, ve o mesmo id e se declara 'pe com par' — quem a sustenta e o PE DA CAMA B, nao a propria cama. Quebrar o pe de A (x=0) deixa x=1 orfao de verdade, mas ele NAO evapora porque continua encostado em B. Cada metade sobrevivente vira uma cama inteira ao quebrar, porque `drops.ts:53` faz `if (isCama(id)) return BlockId.CamaXP` — TODA metade dropa uma cama completa. Resultado: 2 camas colocadas em fila = ate 4 camas de volta, quebrando celula a celula. O `place_block` (session.ts:1137) tambem nao barra o encadeamento: so checa se a celula da cabeceira e Air/replaceable, nunca se o vizinho ja e metade de outra cama. Consertar exige o par deixar de ser ambiguo — ids distintos de PE e CABECEIRA (como a porta faz com as metades) ou um bit de paridade, para `camaRule` so aceitar par de papel OPOSTO; so entao `drops` pode dropar uma cama por PAR e nao por metade.
- **Correção:** APLICADO 2026-09-12 (decisao do usuario: ids novos de cabeceira, gastando 4 dos 9 ids livres do byte). shared/src/blocks.ts: CamaCabecaXP..ZN = 247-250 (MAX_BLOCK_ID sobe); CamaXP..ZN passa a ser SEMPRE o pe; helpers isCamaPe/isCamaCabeca/camaDirecao/camaPe/camaCabeca; isCama e isMovel cobrem os dois trechos; isPlaceable recusa a cabeceira. rules.ts camaRule: par de PAPEL OPOSTO (pe exige cabeceira a frente, cabeceira exige pe atras). session place_block grava pe+cabeceira. mesher: pe/cabeceira pelo ID (a cama do meio de uma fila saia sem travesseiro). /bloco, /regiao encher e /regiao sortear recusam cama como ja recusavam porta (encher com cama criava a corrente). MIGRACAO shared/src/camas.ts migrarCamasLegado(world), chamada no restore da sessao antes do indexarPlantacoes: idempotente SEM marcador (no formato novo um pe nunca tem outro pe igual a frente) — fileira de 2+ pes iguais e emparelhada a partir da ponta do pe, sobra impar vira ar. Testes: repro no inventario.test (volta 2 camas), camas.test (6 casos incl. restore), cp23 (recusa por comando); A/B contra o codigo velho falha. Visto no cliente real: save ANTIGO com par, corrente de 4 e de 3 abre com 1+2+1 camas, todas com travesseiro.
- **Tags:** cama, duplicacao, rules, drops, place_block, par-horizontal, nao-confirmado, corrigido, migracao, ids

## 2026-09-11 — bug-663: usuario: 'o bau-loja esta com problema na hora de salvar os precos dos itens a venda, tamb
- **Sintoma:** usuario: 'o bau-loja esta com problema na hora de salvar os precos dos itens a venda, tambem o layout dos paineis ficou muito aglomerado' / detalhe (2026-09-11): 'o ULTIMO item que tem o valor editado nao salva'
- **Onde:** `client/src/container.ts:358 (change do .loja-preco-input), client/src/container.ts:232 (fecharSemAvisar), client/src/container.ts:455 (render/replaceChildren), client/index.html:698 (CSS .loja-item)`
- **Causa:** CAUSA RAIZ CONFIRMADA NA LEITURA DO CODIGO (falta so rodar a repro). O detalhe do usuario — 'o ULTIMO item editado nao salva' — e a assinatura de um edit que morre no TEARDOWN, nao de persistencia. O disco esta OK nos dois sentidos (containers.ts:276 serializa `precos`, :371 le de volta; `containerTemConteudo` conta `precos.size`, entao loja com preco nao e descartada do save). O que se perde e a ULTIMA edicao, e por DOIS caminhos: (A) FECHAR COM ESC — `input.addEventListener('change', ...)` (container.ts:358) so dispara no BLUR/Enter, e abre com o guarda `if (!this.pos) return`. `fecharSemAvisar()` (container.ts:232) faz `this.pos = null` na linha 236 e so DEPOIS `this.root?.classList.add('hidden')` na linha 243. Como `.hidden` e `display: none !important` (client/index.html:25), esconder o painel tira o foco do input — o browser dispara o `change` pendente NESSE instante, ou seja DEPOIS de `pos` ja ter virado null: o handler entra, bate no guarda e RETORNA EM SILENCIO. O `definirPreco` nunca e enviado. Cada campo anterior salvou porque mover o foco pro proximo input deu blur enquanto `pos` ainda existia — por isso so o ULTIMO some. Previsao testavel que separa as duas coisas: fechar pelo BOTAO 'fechar' (container.ts:470) SALVA, porque o mousedown no botao move o foco e dispara o `change` ANTES do click handler; fechar com ESC PERDE. (B) RE-RENDER NO MEIO DA EDICAO — `render()` (container.ts:455) faz `root.replaceChildren()` (:460) e remonta as linhas. [CORRIGIDO 2026-09-12, medido na sonda: o Chrome DISPARA `change` no input focado que o `replaceChildren` tira do DOM — o meio-numero ia pro servidor, o campo novo nascia com o valor velho, o foco ia pro body e o que se digitava depois sumia.] Qualquer `container` do servidor (`atualizar`, ex.: mexer no estoque) ou `inventario` novo (`refresh()`, main.ts:1451) durante a digitacao derruba o edit. Mesma classe do bug-573 (rolagem do craft morrendo no `replaceChildren`). AGRAVANTE de leitura: `lojaPrecos()` (container.ts:322) monta as linhas a partir dos ids presentes nos SLOTS DE ESTOQUE, nao da lista `precos` do servidor — item cujo estoque acabou perde a linha e o preco SOME DA TELA mesmo vivo no servidor, o que tambem se le como 'nao salvou'. Checar ainda o teto `precos.size >= CONTAINER_SLOTS.loja` (session/loja.ts:60), que recusa preco NOVO em silencio quando cheio. (C) LAYOUT AGLOMERADO: o painel empilha cabecalho + grade do container + mochila + editor de precos (container.ts:531-538) na mesma coluna; `.loja-item` e so um flex de `padding: 4px 0` com `gap: 8px` (client/index.html:698), sem separacao visual entre estoque e precos.
- **Correção:** APLICADO 2026-09-12 (client/src/container.ts): (A) `fechar()` chama `enviarPrecosPendentes()` ANTES do `avisarFechado()` — o servidor so aceita `definir_preco` com a loja aberta (session.ts:1552), entao o flush tem de ir antes do `fechar_container`. (B) `render()` virou casca de `desenhar()`: guarda scrollTop de .cont-bau/.loja-precos/.loja-compra e o input focado (achado por `data-item`) + selecao ANTES do replaceChildren; liga `redesenhando=true` durante o desenhar (o `enviarPreco` ignora o `change` de remocao); depois devolve rolagem, valor digitado (se sujo vs `dataset.enviado`), foco e cursor. Se a linha sumiu, faz flush do edit. `dataset.enviado` evita envio duplo (Enter + blur). Campo de preco virou `type=text inputmode=numeric` (number nao tem setSelectionRange). (3) `lojaPrecos()` lista estoque UNIDO com `loja.precos` — item sem estoque fica com aviso 'sem estoque'. A/B pela sonda (host real + Chrome/CDP, 1024x600): codigo velho — ESC no ultimo campo volta '' , foco perdido, rolagem 0, linha sem estoque some; novo — tudo verde. Pegadinha de 1a tentativa: ler selectionStart DEPOIS do replaceChildren da 0 (campo fora do DOM).
- **Tags:** loja, bau-loja, precos, container, ui, layout, change-event, blur, teardown, replaceChildren, causa-confirmada, corrigido
- **Relacionados:** bug-573, bug-593

## 2026-09-11 — bug-664: usuario: 'no bau-loja, se tiver muitos itens a venda nao da para rolar a pagina'
- **Sintoma:** usuario: 'no bau-loja, se tiver muitos itens a venda nao da para rolar a pagina'
- **Onde:** `client/index.html:198 (#container), client/index.html:698 (.loja-item; NAO existe regra pra .loja-compra/.loja-precos), client/src/container.ts:267 (lojaCompra), client/src/container.ts:322 (lojaPrecos)`
- **Causa:** CAUSA RAIZ CONFIRMADA NA LEITURA DO CSS. `#container` (client/index.html:198) tem altura FIXA (`height: min(560px, 84vh)`), `display: flex; flex-direction: column` e **`overflow: hidden`** — escolha deliberada de 2026-07-20 ('trocar de aba nao muda o tamanho do painel'), com o comentario dizendo que 'a GRADE rola por dentro quando nao cabe'. E rola: `.cont-bau` tem `max-height: 42%; overflow-y: auto` (client/index.html, bloco da grade). O problema e que **`.loja-compra` e `.loja-precos` nao tem regra CSS NENHUMA** — o unico seletor de loja no arquivo e `.loja-item`, `.loja-item img` e `.loja-qtd, .loja-preco-input` (index.html:698-700). Sem `max-height` e sem `overflow-y`, as duas listas crescem com o numero de itens, estouram a altura fixa do painel e o `overflow: hidden` do pai **corta o excedente sem gerar barra de rolagem**: o que passou do fim do painel fica inalcancavel, no mouse e no dedo. DOIS caminhos, com gravidade diferente: (A) COMPRADOR (`souOCriador === false`, container.ts:509): o render faz `root.append(head, fechar, this.lojaCompra()); return;` — a lista de compra e o unico corpo do painel, entao item alem do corte fica **impossivel de comprar**. E o caso que o usuario descreve ('muitos itens a venda'). (B) CRIADOR: `.loja-precos` entra no MEIO da pilha de irmaos (`head, fechar, dica, [acoes], cima(.cont-bau), precoEditor, divisor, grade(.inv-mochila), bar(.inv-hotbar)` — container.ts:531-578). Como `.loja-precos` nao tem teto de altura, com muitos tipos de item ela empurra o divisor, a MOCHILA e a hotbar pra fora do painel — o criador perde o acesso a propria mochila dentro da loja, nao so aos precos. Isso tambem alimenta a queixa de 'layout aglomerado' do bug-663: tudo disputa a mesma coluna de 560px sem ninguem ceder.
- **Correção:** APLICADO 2026-09-12 (client/index.html): `.loja-compra { flex:1 1 auto; min-height:0; overflow-y:auto }`; `.loja-precos { flex:1 1 0; min-height:124px; overflow-y:auto }` (racha a sobra com a .inv-mochila — com base=conteudo ela comia a sobra e a GRADE DA MOCHILA SUMIA no 1024x600, pego so no PRINT, nao nos numeros); `#container .inv-mochila { min-height: calc(2*44px+5px) }` (2 fileiras de piso). Linhas viraram cartao (fundo + raio), h3 da lista sem margem default. Medido: criador 1024x600 = estoque 2 fileiras, precos 2 linhas, mochila 2 fileiras, hotbar dentro; comprador rola ate a ultima linha (1024x600 e 1366x768); bau/fornalha comuns sem regressao.
- **Tags:** loja, bau-loja, scroll, overflow, css, ui, layout, container, flexbox, causa-confirmada, corrigido
- **Relacionados:** bug-663, bug-573

## 2026-09-03 — bug-660: usuario: Ctrl+C no iniciar-servidor.bat durante uma pergunta [S/N] ou de menu nao fecha - 
- **Sintoma:** usuario: Ctrl+C no iniciar-servidor.bat durante uma pergunta [S/N] ou de menu nao fecha - pula o input e continua a logica (ex: cai no menu e SOBE o servidor mesmo assim)
- **Onde:** `iniciar-servidor.bat`
- **Causa:** Limitacao do PROPRIO cmd.exe, nao bug no codigo: Ctrl+C durante qualquer comando de um .bat em execucao (inclusive set /p) dispara o prompt nativo do console "Terminate batch job (Y/N)?". Batch nao tem trap de sinal (SIGINT) como bash/Node - o script nao pode interceptar isso. Se a resposta nao for Y, o cmd.exe RETOMA a execucao na linha seguinte com a variavel do set /p NAO PREENCHIDA (indefinida) - e como quase todo prompt do launcher trata variavel indefinida como "Enter = usar o padrao", o script segue em frente como se o usuario tivesse aceitado o default. O pior caso e o menu principal (ESCOLHA): default indefinido cai na opcao [1] Mundo livre e o SERVIDOR SOBE, exatamente o oposto do que o Ctrl+C pretendia.
- **Correção:** Nao da para fazer o cmd.exe honrar Ctrl+C durante set /p (limitacao do shell, sem solucao de dentro do .bat). Mitigacao real: os dois prompts de maior risco ("Atualizar agora?" logo no inicio, e o menu principal ESCOLHA) passaram a aceitar a palavra "sair" digitada (e "0" no menu) como saida GARANTIDA via exit /b 0 - uma forma de fechar que nao depende do Ctrl+C do console. Menu ganhou a linha "[0] Sair sem iniciar o servidor" e um REM documentando a causa raiz pra nenhuma sessao futura tentar "consertar" Ctrl+C em batch puro (nao existe trap). Prompts downstream (CODIGO/TAMANHO/N/PNOME) ficaram como estavam: o default deles e sempre inofensivo (so ajusta configuracao, nao inicia nem sobrescreve nada sozinho).
- **Tags:** launcher, bat, ctrl-c, sigint, cmd.exe, set-p, terminate-batch-job, ux
- **Relacionados:** bug-571

## 2026-09-03 — bug-661: usuario: usando o launcher (servidor no ar), o jogo NAO deixa jogar no modo singleplayer
- **Sintoma:** usuario: usando o launcher (servidor no ar), o jogo NAO deixa jogar no modo singleplayer
- **Onde:** `client/src/main.ts (menu-btn-single), server/src/static.ts`
- **Causa:** NAO CONFIRMADO ainda - reproducao com dist RECEM-BUILDADO (npm run build) servido pelo host real (npx tsx server/src/index.ts, igual ao launcher) NAO reproduziu: menu carrega, "Jogar sozinho" abre a tela de mundos, criar mundo novo carrega sem excecao JS nem erro de rede (Chrome headless, script em scratchpad). Teoria de trabalho MAIS provavel, ainda por confirmar: client/dist fica DESSINCRONIZADO de client/src quando o usuario responde 'n' (nao atualizar) no launcher - esse caminho PULA o "npm run build" de rede de seguranca (iniciar-servidor.bat:252, so roda dentro do bloco de update). Um dist velho pode referenciar um asset (ex.: o worker do singleplayer, client/src/main.ts:1092) que nao bate com o que esta em dist/assets/, e o fallback de SPA do static.ts (servirCliente: rota desconhecida cai em index.html) devolveria HTML no lugar do .js esperado - erro classico de "Failed to load module script" so no NAVEGADOR REAL, que headless deste ambiente pode nao expor da mesma forma. NAO CONFIRMADO: falta o texto exato do erro/tela travada que o usuario viu. SEGUNDA RODADA (2026-09-03, pedido "corrige o bug661"): revisitei varias teorias arquiteturais antes de tentar qualquer fix (systematic-debugging, Fase 1) - dist desalinhado dos assets (SPA fallback do static.ts mascarando 404 como HTML), estado de WS/Worker deixado para tras ao trocar de singleplayer pra multiplayer no MESMO tab (descartada: "voltar ao menu" faz location.reload(), zera tudo), cache de asset por hash (descartada: hash muda, URL muda, sem colisao possivel). NENHUMA se sustentou o bastante pra virar fix sem confirmar. Sem acesso a Windows/cmd.exe neste ambiente (WSL/Linux) pra rodar o .bat de verdade - so consigo aproximar com tsx+Chrome headless, que roda limpo nos dois testes feitos. NAO EH SEGURO aplicar um fix as cegas (violaria a Lei de Ferro do debugging sistematico: sem causa raiz confirmada, sem fix). FECHADO (2026-09-03): usuario testou em Linux E Windows atualizados e funcionou nos dois. O relato original era de um PROFESSOR testando na maquina dele, possivelmente com versao desatualizada (nao confirmado qual). Sem reproducao em ambiente atualizado, e sem detalhe adicional do professor, fecha como PROVAVEL versao antiga/ambiente especifico, nao bug de codigo.
- **Correção:** FECHADO sem patch — nao reproduziu em Linux nem Windows atualizados. Se voltar a acontecer, plano de repro ja documentado acima (Console F12 na hora da falha).
- **Tags:** singleplayer, launcher, nao-confirmado, dist, static, worker, aberto, fechado-sem-repro

## 2026-09-01 — bug-652: usuário: pula e coloca bloco embaixo dele, acaba sendo teleportado pro lado
- **Sintoma:** usuário: pula e coloca bloco embaixo dele, acaba sendo teleportado pro lado
- **Onde:** `shared/src/session.ts`
- **Causa:** CONFIRMADO 2026-09-12 — a hipotese do buglog estava certa. Corrida de rede: o servidor aplica o bloco na hora; o cliente so sabe dele depois do RTT e, nesse meio tempo, continua caindo e manda `move` com os pes DENTRO do bloco novo. O `move` ve `sobrepoeSolidos` e chama o resgate `acharEspacoVago`, que pesa |dy|*100 (bug-632: ficar na mesma profundidade) — a celula do LADO (peso 1) ganha da de CIMA do bloco (peso 100). A fisica do cliente, sozinha, pousaria em cima (moveAxis usa o maior topo sob os pes). Repro: teste de sessao (teleport pra x 3.5) e sonda no cliente real com as mensagens servidor->cliente atrasadas 200 ms: codigo velho 4 de 4 pulos jogados pro lado (z 32.5 -> 31.5), torre nao sobe.
- **Correção:** APLICADO 2026-09-12. physics.ts `pousoAcima(world, pos, subidaMax=1)`: se os pes afundaram num bloco cujo topo esta a <= 1 acima e subir ate esse topo resolve a colisao, devolve a posicao pousada (mesmo x/z). Usa `resolveVertical(dir<0)`, que so considera caixas com a base no/abaixo dos pes — bloco na altura da CABECA nunca vira subida. session.ts `move`: antes do teste de soterramento, aplica o pouso e segue o fluxo normal com a posicao corrigida (sem teleporte); o resgate so roda se ainda sobrepoe. 4 testes em pilar.test.ts (2 falham no velho; os 2 de soterramento de verdade seguem no resgate). Sonda real com atraso de 200 ms: novo 4 de 4 torre (25->28), mesma coluna. 1024 verdes, smoke 16/16. Achado de aparato: a emulacao de rede do Chrome (Network.emulateNetworkConditions) NAO atrasa frame de WebSocket aberto — o A/B so discriminou com o WebSocket embrulhado via Page.addScriptToEvaluateOnNewDocument.
- **Tags:** fisica, sufocamento, move, teleporte, bug-605, corrigido, pilar, torre, corrida, latencia
- **Relacionados:** bug-605

## 2026-09-01 — bug-653: usuário: erro no changelog, a última atualização ficou com data zerada
- **Sintoma:** usuário: erro no changelog, a última atualização ficou com data zerada
- **Onde:** `scripts/gerar-build-info.mjs`
- **Causa:** gerar-build-info.mjs (roda ANTES de npm run build/dev) tinha placeholder fixo '0000-00-00'/'sem-git' pra quando o git falha ou não existe, e SEMPRE sobrescrevia shared/src/build-info.json com ele no catch, mesmo quando o arquivo JA TINHA um valor bom de um build anterior. O topo do changelog (client/src/changelog.ts) usa esse arquivo via rotuloDoBloco()/version.ts pra rotular a entrada mais nova; dataBr('0000-00-00') vira '00/00/0000' na tela = 'data zerada'. Cenario real: o launcher da escola (iniciar-servidor.bat) reconstroi client/dist depois de atualizar, rodando numa maquina que pode nao ter git no PATH (o launcher usa Node portatil justamente pra nao depender de nada pre-instalado) — cada rebuild sem git apagava a data boa e gravava o placeholder por cima.
- **Correção:** gerar-build-info.mjs agora LÊ o build-info.json que já existe como ponto de partida (valorAtual()) antes de tentar o git — só cai no placeholder zerado se o arquivo nunca existiu (1ª vez de todas, sem git nenhuma vez). Falha de git preserva o valor stale anterior em vez de zerar. Verificado em dir isolado (scratchpad): sem .git com arquivo prévio -> mantém; sem .git sem arquivo prévio -> cai no placeholder (esperado); com git de verdade -> pega data/commit reais.
- **Tags:** changelog, build-info, launcher, git, fixed

## 2026-09-01 — bug-654: Toda Baú-Loja fica permanentemente impossível de quebrar, mesmo pelo próprio criador, mesm
- **Sintoma:** Toda Baú-Loja fica permanentemente impossível de quebrar, mesmo pelo próprio criador, mesmo vazia — 'Tem coisa aí dentro' num baú sem estoque nenhum.
- **Onde:** `shared/src/containers.ts, shared/src/session.ts`
- **Causa:** containerTemConteudo() foi estendida (Task 2) pra contar criador/precos (pro save não perder o dono de uma loja vazia), mas essa MESMA função também era o predicado do gate de break_block em session.ts — como toda BauLoja tem criador setado desde que é colocada, containerTemConteudo() nunca mais voltava false pra uma loja.
- **Correção:** Nova containerTemEstoque() em containers.ts, respondendo só 'slot ocupado ou fogo aceso?' (sem olhar criador/precos) — vira o predicado do break_block. containerTemConteudo() (com criador/precos) continua intacta pro save-persistence em session/containers.ts.
- **Tags:** loja, containers, break_block, final-review, regression

## 2026-09-01 — bug-655: Editor de preço do criador só cria preço novo como 'pague N do mesmo item que vende' (ex: 
- **Sintoma:** Editor de preço do criador só cria preço novo como 'pague N do mesmo item que vende' (ex: 3 tábuas por 1 tábua) — sem UI pra escolher outro item ou Dimas.
- **Onde:** `client/src/container.ts, client/src/main.ts, client/index.html`
- **Causa:** lojaPrecos() nunca tinha um controle pra ESCOLHER o item de pagamento — o código default do preço novo sempre reusava o próprio item à venda como pagamento (`item: id`), então todo preço novo nascia economicamente sem sentido.
- **Correção:** Select .loja-pagamento por linha: um <option> por tipo distinto no estoque da loja (exceto o item da própria linha) + Dimas sempre disponível. Default = pagamento existente (editar preserva), ou 'dimas' pra preço novo. change no input de qtd OU no select manda definir_preco. ContainerPanel ganhou nomeDe injetado (hotbarUi.nome) pros rótulos.
- **Tags:** loja, client, ui, final-review

## 2026-09-01 — bug-656: Dimas minta saldo ilimitado por nome falso, sem vínculo de conta — 4 nomes inventados = 20
- **Sintoma:** Dimas minta saldo ilimitado por nome falso, sem vínculo de conta — 4 nomes inventados = 200 Dimas de graça, transferível via loja.
- **Onde:** `shared/src/session.ts`
- **Causa:** admitir() seeda DIMAS_INICIAL_PADRAO pra qualquer nome inédito com PIN de formato válido; join/auth nunca recusa nome novo (só força o MESMO pin pra nome que já existe).
- **Correção:** Rework de autenticação é escopo grande demais pro fix; mitigação: admitir() avisa em chat TODOS os professores online (exceto quem está entrando agora, se for o próprio professor) toda vez que um saldo NOVO é cunhado — mesmo padrão de broadcastRegions ('avisa todos os professores online').
- **Tags:** loja, dimas, auth, final-review, exploit

## 2026-09-01 — bug-657: definir_preco aceita item id sem teto (ex: 999999) e precos.size cresce sem limite.
- **Sintoma:** definir_preco aceita item id sem teto (ex: 999999) e precos.size cresce sem limite.
- **Onde:** `shared/src/session/loja.ts`
- **Causa:** aplicarDefinirPreco só validava item>0 (integer), sem comparar contra MAX_BLOCK_ID; nenhuma trava no tamanho do Map cont.precos.
- **Correção:** item (e preco.item na trilha de pagamento em item) agora rejeitados acima de MAX_BLOCK_ID; uma entrada NOVA (item ainda sem preço) é rejeitada quando cont.precos.size >= CONTAINER_SLOTS.loja (27) — atualizar/remover uma entrada já existente continua liberado mesmo no teto.
- **Tags:** loja, validation, final-review

## 2026-09-01 — bug-658: 2 cenários que o próprio spec (§Testes) exige nunca foram cobertos: membro do MESMO grupo 
- **Sintoma:** 2 cenários que o próprio spec (§Testes) exige nunca foram cobertos: membro do MESMO grupo tentando definir_preco, e confinaBloqueia ainda valendo pro use_block da loja.
- **Onde:** `shared/src/loja.test.ts, shared/src/gate-claim.test.ts`
- **Causa:** Cobertura de teste ficou implícita — todo teste de rejeição de definir_preco usava um ESTRANHO ao grupo, nunca um membro de verdade com edição no terreno; e nenhum teste combinava confinamento LIGADO com use_block numa loja (só com porta).
- **Correção:** Novo teste em loja.test.ts: ana entra no grupo de amigos de prof via /amigos convidar+aceitar, ganha edição real do terreno (controle positivo: place_block funciona), mas definir_preco continua recusado — prova que a trava é o NOME do criador, não claim/grupo. Novo teste em gate-claim.test.ts reusando turmaComClaimDaAna(true): loja fora da área confinada de bia é bloqueada mesmo sem claimBloqueia entrar. RED confirmado manualmente nos dois (bypass temporário da checagem correspondente fez os testes falharem).
- **Tags:** loja, test-coverage, final-review, confinamento, claims

## 2026-09-01 — bug-659: achado na revisao final de branch da loja (nao reportado por usuario ainda): escolher a mo
- **Sintoma:** achado na revisao final de branch da loja (nao reportado por usuario ainda): escolher a moeda de pagamento ANTES de digitar a quantidade no editor de preco descarta a escolha em silencio
- **Onde:** `client/src/container.ts`
- **Causa:** lojaPrecos() liga enviar() no change do <select> de pagamento E no change do input de quantidade. Se o select muda primeiro, o input de qtd ainda esta vazio -> Math.floor(Number("")) = 0 -> cai no ramo qtd<1 -> manda definirPreco(...,null) -> aplicarDefinirPreco aceita e broadcast avisarContainer -> render() reconstroi o select do zero -> volta pro default (Dimas), perdendo a escolha do jogador. Digitar a quantidade PRIMEIRO funciona certo (nao aciona esse caminho).
- **Correção:** FECHADO por remoção da causa (2026-09-02), não por patch: a moeda da loja virou SEMPRE Dimas (decisao do usuario, fora da votacao da turma) e o <select> de escolha de item de pagamento que causava o bug foi REMOVIDO da UI inteira (client/src/container.ts, lojaPrecos() volta a ter so o campo de quantidade). Sem segundo controle disparando change() fora de ordem, o bug nao tem mais como acontecer. Ver Decision Log de 2026-09-02 no cerebrum.md.
- **Tags:** aberto, loja, ui, fechado, removido, preco, client

## 2026-08-31 — bug-650: usuário: atraso nos comandos, como se o servidor não ficasse mais em tempo real (turma de 
- **Sintoma:** usuário: atraso nos comandos, como se o servidor não ficasse mais em tempo real (turma de 35 na escola)
- **Onde:** `shared/src/session.ts`
- **Causa:** broadcastPose relayava CADA move recebido na hora, individualmente, pra todo mundo (shared/src/session.ts, antigo case "move"). Turma de 35 andando a 10Hz gera O(N^2) sends/s (ate ~12 mil/s) na thread unica do Node — a fila do event loop enche e TODO comando atrasa, nao so a posicao de quem anda. Coincide com a sessao 89 (2026-08-26, b7e4d71) que subiu o teto de grupos de 20 para 35 — so ai o volume cruzou o teto da maquina. Medido com carga real (carga-movimento.mjs no scratchpad, nao versionado): 5 clientes=3.7ms, 20=37ms, 35=2555ms com 9/10 comandos em timeout.
- **Correção:** Move deixou de broadcastar na hora: session.ts guarda a pose em posesDirty (Map por autor, so a ultima do tick sobrevive) e flushPoses() no fim do tick() manda UM players_moved por DESTINATARIO (novo tipo em protocol.ts), com o mesmo gate do /invisivel que o broadcastPose ja tinha (por autor). Sends caem de O(N^2) pra O(N). Client (main.ts) ganhou aplicarPoseRemota() compartilhado entre player_moved (raro: join/dormir/toggle invisivel, ficou como estava) e cada entrada do lote players_moved. Reteste com a MESMA carga real: 35 clientes 2555ms -> 12.9ms, 20 clientes 37ms -> 8.2ms, 0 timeouts.
- **Tags:** performance, rede, broadcast, move, session, tick, O(N^2), players_moved, protocol

## 2026-08-31 — bug-651: usuário: bug que impede sair da cama
- **Sintoma:** usuário: bug que impede sair da cama
- **Onde:** `shared/src/session/dormir.ts`
- **Causa:** CONFIRMADO 2026-09-12 (sonda no cliente real + leitura): a unica saida era `acordarSeSaiu` no `move`, exigindo os pes a 2+ celulas da cama (tolerancia +-1). Deitado, a camera olha pro teto/ceu e o aluno anda as cegas; em quarto apertado (cama encostada em parede) nao ha 2 celulas pra onde ir — preso ate amanhecer. O cliente NAO travava o movimento (a hipotese antiga de 'input travado' estava errada). Achado junto, a mesma regua do avesso: como a distancia era medida a partir da CAMA e o clique alcanca ~5 blocos, quem deitava de longe LEVANTAVA no primeiro `move` (bastava mexer o mouse) — a sonda viu deitar aos 4053 ms e levantar sozinha aos 5773 ms.
- **Correção:** APLICADO 2026-09-12. (1) Mensagem nova `levantar` (protocol.ts); session.ts chama `acordar()` (em pe: nada). (2) Cliente (main.ts): deitado + `cmd.jump` (teclado e o ⤒ do tablet caem no mesmo jump) manda `levantar` UMA vez por deitada (`levantarPedido`, zera no `aoDormir`). (3) Ao deitar, o jogador ouve 'Aperte pular para levantar.' (tentarDormir devolve a frase, que o use_block ja concatena). (4) Nova regua: `ses.deitouDe` guarda onde os PES estavam ao deitar; `acordarSeSaiu` acorda se andar > FOLGA_DEITADO (1 bloco) na horizontal ou > 2 na vertical DAQUELE ponto. Testes: 6 novos no dormir.test (pular levanta, quarto apertado, dica no chat, levantar em pe inofensivo, levantar para a noite, deitar de longe + mexer o olhar nao levanta) — A/B: 4 falham no codigo velho. Sonda no cliente real: deita (camera no ceu), continua deitada, segurar pular levanta em ~100 ms (vigia ve pelo player_moved).
- **Tags:** sobrevivencia, dormir, cama, playtest, corrigido, cama, dormir, pular

## 2026-08-27 — bug-649: TS2307: Cannot find module './terrenos' or its corresponding type declarations. (shared/sr
- **Sintoma:** TS2307: Cannot find module './terrenos' or its corresponding type declarations. (shared/src/claims.test.ts)
- **Onde:** `shared/src/claims.test.ts`
- **Causa:** Durante a tradução de comandos (/claim → /terreno), um `sed -i 's#/claim#/terreno#g'` rodado em lote nos arquivos de teste bateu também no import `} from "./claims";` — a substring "/claim" existe dentro de "./claims" (caminho relativo), então o sed reescreveu pra "./terrenos", um módulo que não existe.
- **Correção:** Corrigido o import de volta pra "./claims" à mão. Confirmado com `npm run typecheck` (3/3 verde) depois.
- **Tags:** sed, find-replace, import-path, typecheck, comandos

## 2026-08-27 — bug-648: Stop hook reinjetava 'ACTION REQUIRED: Files edited 3+ times this session ... buglog.json 
- **Sintoma:** Stop hook reinjetava 'ACTION REQUIRED: Files edited 3+ times this session ... buglog.json was not updated' em TODO fim de turno da sessão, sem nenhum arquivo novo — o mesmo aviso, turno após turno, mesmo com openwolf.buglog.auto_detect: false no config.json
- **Onde:** `.wolf/hooks/stop.js`
- **Causa:** checkForMissingBugLogs() nunca lia config.json — a flag buglog.auto_detect: false (desligada em 2026-07-26, cerebrum, por causa de falso-positivo igual a este: multi-edit != bug, feature limpa de vários passos edita o mesmo arquivo 3+ vezes também) só silenciava a autodetecção de ENTRADA no buglog em outro lugar, não este lembrete de fim de turno. bug-555 (2026-08-03) já tinha mexido nesta mesma função pra aceitar buglog escrito via Bash, mas não tratou o caso de o usuário ter desligado a checagem inteira.
- **Correção:** checkForMissingBugLogs() lê config.json (openwolf.buglog.auto_detect) e sai cedo (return null) quando é false, antes de olhar session.edit_counts.
- **Tags:** openwolf, hooks, stop, buglog, config, falso-positivo
- **Relacionados:** bug-555

## 2026-08-26 — bug-647: sonda scripts/grupos-shot.mjs a 1024x600: 'a fileira NAO transborda na horizontal (sobra 9
- **Sintoma:** sonda scripts/grupos-shot.mjs a 1024x600: 'a fileira NAO transborda na horizontal (sobra 941px de conteudo)' e 'o centro do botao 35 e o proprio botao (achei "nada")' — o botao do ultimo grupo nascia em x=1790, 800px fora de uma tela de 1024
- **Onde:** `client/index.html (.jog-grade) + client/src/players.ts (renderGrupos)`
- **Causa:** A grade de grupos do painel P usava a classe `.jog-row`, que e `display: flex` SEM `flex-wrap` — ela foi desenhada para a LINHA de um jogador (nome + 2 botoes), nao para uma grade de N botoes. Com um botao por grupo o conteudo passa da caixa e o `overflow: hidden` de altura FIXA do `#jogadores` come o excedente, sem barra de rolagem nenhuma (a rolagem da `.jog-lista` e so VERTICAL). O A/B com a constante em 20 provou que JA transbordava 181px desde 2026-08-17, quando a aba grupos nasceu: ninguem tinha medido, e a aba estava no todo.md como feita. Subir o teto para 35 nao criou o defeito, so o levou de 181px para 941px.
- **Correção:** Classe propria `.jog-grade`: `display: grid` com `grid-template-columns: repeat(auto-fill, minmax(44px, 1fr))` e `gap: 6px`. Quebra sozinha em 3 fileiras (146px de altura, dentro dos 405px da `.jog-lista`) e alinha em colunas os numeros de 1 e 2 digitos, que com `flex-wrap` ficariam de larguras diferentes. Provado pela sonda nova `scripts/grupos-shot.mjs` (`npm run shots:grupos`): transbordo 0, botao 35 dentro do painel E da viewport, e `elementFromPoint` no centro dele devolve o proprio botao — a 1024x600 e a 600x1024.
- **Tags:** css, flex, flex-wrap, overflow, painel-p, grupos, aula, ui, invisivel, sonda, teto-35
- **Relacionados:** bug-646

## 2026-08-25 — bug-646: sonda headless da lixeira: 'arrasto começou e a lixeira nasceu: null' — e o CONTROLE mostr
- **Sintoma:** sonda headless da lixeira: 'arrasto começou e a lixeira nasceu: null' — e o CONTROLE mostrou que o botão ✂ 'dividir ao meio' (de 2026-08-08) também não existia no DOM
- **Onde:** `client/src/inventory.ts + client/src/container.ts`
- **Causa:** Os dois painéis chamavam `dica.after(botao)` no meio do render — mas ali o `<p class=inv-dica>` ainda está SOLTO (só entra no documento no `root.append(head, abas, dica, grade, bar)` do fim da função). `after()` num nó SEM PAI é no-op SILENCIOSO: não lança, não avisa, não insere. Resultado: o botão ✂ nasceu invisível no commit c7e7689 (2026-08-08) e ficou 17 dias assim — o todo.md o dava como FEITO, e ninguém no playtest tinha como usá-lo.
- **Correção:** Os botões de ação viram um array `acoes` e entram no `root.append(...)` do fim, dentro de `linhaDeAcoes()` (novo helper em client/src/slotDrag.ts) — uma `<div class=inv-acoes>` flex, porque o painel tem altura FIXA e dois botões empilhados comiam a fileira de slots que a media query de 460px luta pra manter. Provado pela sonda: ✂ e 🗑️ aparecem no dedo e no mouse, nos dois painéis.
- **Tags:** dom, after, no-op, inventario, container, ui, invisivel, playtest
- **Relacionados:** bug-609

## 2026-08-25 — bug-645: usuário: 'mundo com ciclo de dia e noite ativado, quando é carregado fica desativado — est
- **Sintoma:** usuário: 'mundo com ciclo de dia e noite ativado, quando é carregado fica desativado — estado do ciclo não é salvo mas a hora é'
- **Onde:** `server/src/index.ts (desligamento do host) — NÃO era shared/src/session.ts`
- **Causa:** RESOLVIDO (2026-08-25, sessão 88). O ciclo NUNCA teve defeito de persistência — o DESLIGAMENTO tinha. `server/src/index.ts` só tinha handler de SIGINT e SIGTERM; FECHAR A JANELA do terminal manda SIGHUP (e o Node no Windows emite SIGHUP quando o console fecha — é assim que a escola encerra o .bat), o processo morre sem `saveNow` e some TUDO desde o último autosave (até 30 s de mundo). Medido: mesmo mundo, mesmo comando — SIGINT grava ciclo=true hora=12.03; SIGHUP não grava nada (arquivo nem existe num mundo novo). Quatro sondas contra o host/cliente REAIS antes de achar: (1) host, mundo livre, Ctrl+C — VERDE (grava e restaura); (2) singleplayer no navegador (Chrome headless, worker + IndexedDB, autosave e botão sair) — VERDE; (3) mundo de AULA (cenarios/aula*.ljw) — não grava NADA por projeto (`ehMundoDeAula` em server/src/paths.ts + `saveNow` retorna cedo), decisão mantida pelo usuário: 'aula não precisa salvar, apenas mundos de construção livre'; (4) SIGHUP × SIGINT no mesmo mundo — REPRODUZIDO. A metade estranha do relato ('a hora é salva') é o último autosave: hora quase parada em 12h parece 'a hora certa', e só o ciclo salta aos olhos. Confere com o disco: os 4 mundos da máquina têm hora=12 exata e ciclo=false.
- **Correção:** server/src/index.ts: um laço registra `saveNow('encerrando') + exit(0)` para SIGINT, SIGTERM, SIGHUP e SIGQUIT (antes eram dois handlers soltos, só os dois primeiros). Prova permanente: `server/src/cenarios/_smoke-sighup.mjs` (smoke novo, 16º) — liga o ciclo num mundo novo, mata o host com o sinal, sobe de novo SEM LJ_NOVO e exige o ciclo ligado; roda a mesma rodada com SIGINT como CONTROLE. O smoke sobe o próprio host (precisa escolher o sinal), por isso `scripts/smoke.mjs` passou a aceitar entrada com `servidores: []` + `porta`.
- **Tags:** aula, ciclo, corrigido, cp21, desligamento, dia-noite, ljw, persistencia, reproduzido, save, sem-aviso, sighup, smoke, somente-leitura
- **Relacionados:** bug-626

## 2026-08-25 — bug-644: sonda toque-shot secao E2 a 600x1024 e 420x900 com --kb=280: 'o bloco do chat nao sai pelo
- **Sintoma:** sonda toque-shot secao E2 a 600x1024 e 420x900 com --kb=280: 'o bloco do chat nao sai pelo topo da tela (topo -396 >= 0)' e '(topo -698 >= 0)'
- **Onde:** `client/index.html`
- **Causa:** O teto do log com o chat aberto (#chat.open #chat-log { max-height: 30vh }) morava dentro de @media (max-height: 700px) — feito para a janela BAIXA do tablet deitado. Em RETRATO (altura 900/1024) a media query nao casa e o log ficava SEM teto nenhum. Como o #chat e ancorado no rodape (bottom: 112px + --kb) e cresce PRA CIMA, com o teclado virtual aberto o bloco log+painel+campo saia inteiro pelo topo da tela: o aluno digitava sem ver o campo nem o que tinha mandado. Nunca apareceu antes porque a sonda roda em headless, onde nao existe teclado virtual e --kb fica sempre 0 — o aperto real do tablet nunca era medido.
- **Correção:** (1) O teto do log foi para o bloco @media (pointer: coarse), que e onde o teclado virtual existe, e passou a descontar a var: max-height: min(30dvh, calc(100dvh - var(--kb, 0px) - 176px)). (2) Abaixo de 700px o #chat-painel continua EMPILHADO e come mais 26vh, entao um @media (pointer: coarse) and (max-width: 699px) desconta essa fatia tambem. (3) A sonda ganhou a secao E2, que ESCREVE --kb a mao (document.documentElement.style.setProperty) para emular o teclado — sem isso o caso mais apertado do aparelho da escola nao era testavel em headless. (4) De quebra, os 112px do `bottom` do #chat (desvio da hotbar, bug-539) viraram 8px em `#chat.open`: a hotbar (main.ts:357) e a UI de toque (main.ts:363) somem as duas com `!chat.open`, entao eram 104px de espaco morto justo com a tela no aperto. Vao entre o campo e o teclado: 126px -> 8px.
- **Tags:** css, mobile, chat, teclado-virtual, --kb, media-query, retrato, sonda, toque, headless, espaco-morto
- **Relacionados:** bug-539, bug-635

## 2026-08-23 — bug-643: usuário: 'se a frase [splash] for grande é cortada pelo painel e fica por cima do titulo'
- **Sintoma:** usuário: 'se a frase [splash] for grande é cortada pelo painel e fica por cima do titulo'
- **Onde:** `client/index.html, client/src/menu.ts`
- **Causa:** O <p id=menu-splash> era FILHO do #menu-home, que é .menu-screen com overflow-y: auto — a frase longa era recortada pela borda do painel, e como era item de fluxo (align-self: flex-end) empurrava/encostava no <h1>. Filho absoluto não resolveria: com overflow-y: auto o overflow-x visible computa pra auto, então o painel recorta de todo jeito.
- **Correção:** O <p> virou IRMÃO do painel dentro de #menu, position: absolute + z-index 1 + pointer-events: none, com max-width: min(90vw, 34rem). Como o painel é centrado e a altura dele muda com a tela, a âncora só existe medida: posicionaSplash() no menu.ts lê o getBoundingClientRect() do #menu-home e põe o MEIO DE BAIXO da frase (transform: translate(-50%,-100%)) em (right-96, top+10), com clamp lateral e de topo. Chamado no sorteio, no show(), num rAF e num listener de resize de MÓDULO (showMenu roda a cada volta ao menu e empilharia listeners). Na mesma passada a rotação foi de -15° (anti-horário) pra +15° (horário), a pedido.
- **Tags:** css, menu, splash, overflow, rotate, layout, clipping
- **Relacionados:** bug-641

## 2026-08-23 — bug-642: Error: listen EADDRINUSE: address already in use :::8080 ao rodar npm run dev:server
- **Sintoma:** Error: listen EADDRINUSE: address already in use :::8080 ao rodar npm run dev:server
- **Onde:** `server/src/index.ts:580 (sintoma; a causa era externa ao repo)`
- **Causa:** Um `python3 -m http.server 8080` com cwd em client/dist tinha ficado de pé desde a sessão anterior (21h de uptime), servindo o BUILD estático pra conferência. Ele mora na MESMA porta 8080 que o servidor do jogo — o servidor do jogo já serve o cliente, então o http.server era redundante e só roubava a porta. Não tinha relação com o build recém-feito.
- **Correção:** Achar o dono com `ss -ltnp | grep :8080` (confirmar com `tr '\0' ' ' < /proc/<pid>/cmdline` e `ls -l /proc/<pid>/cwd`) e `kill <pid>`. Pra servir o build estático sem colidir, usar OUTRA porta: `cd client/dist && python3 -m http.server 8099` + `BASE=http://localhost:8099`.
- **Tags:** EADDRINUSE, porta, 8080, http.server, servidor, ambiente

## 2026-08-23 — bug-641: tela '📜 novidades' do menu imprimia texto POR BAIXO da nova tira de bandeiras do rodapé (p
- **Sintoma:** tela '📜 novidades' do menu imprimia texto POR BAIXO da nova tira de bandeiras do rodapé (painel media 10..590 numa janela de 600)
- **Onde:** `client/index.html`
- **Causa:** #menu é flex centrado com inset:0 e .menu-screen tem max-height: calc(100dvh - 20px) — o painel ocupa quase a altura inteira, então qualquer elemento absoluto colado no bottom da TELA cai em cima dele. Reservar espaço exige DUAS mudanças: padding-bottom no #menu (encolhe a caixa de centragem) E um max-height menor no painel (senão ele estoura a caixa encurtada). Só uma das duas não resolve.
- **Correção:** #menu { padding-bottom: 44px } + #menu .menu-screen { max-height: calc(100dvh - 64px) }, escopado em #menu para não encolher o .menu-screen do #overlay em jogo. Conferido com npm run shots:tablet em 1024x600, 600x1024 e 420x900.
- **Tags:** css, menu, layout, rodape, bandeiras, flexbox, max-height

## 2026-08-22 — bug-640: tela 'novidades' do menu mostrava o bloco do topo rotulado 'recem-chegado' na v0.10.1 — e 
- **Sintoma:** tela 'novidades' do menu mostrava o bloco do topo rotulado 'recem-chegado' na v0.10.1 — e continuaria mostrando pra sempre
- **Onde:** `client/src/changelog.ts`
- **Causa:** O rotulo da entrada mais nova era uma string escrita a mao. Nada no processo obrigava a troca-la no bump, e ela sobreviveu a 12 versoes de trabalho (dormir, menu 3D, aula/grupos, inventario, algodao, grama, painel, soterramento, /painel). Com o launcher se atualizando sozinho na escola, o professor via 'recem-chegado' indefinidamente.
- **Correção:** 'Mudanca.versao' virou opcional: ausente = release ATUAL, e o numero sai do package.json via rotuloDeVersao() (shared/src/version.ts, com teste). Um 'npm version' relabela a tela sozinho. Conteudo das 12 versoes perdidas foi escrito no bloco do topo.
- **Tags:** changelog, versao, ui, menu, staleness

## 2026-08-22 — bug-639: sonda toque-shot secao B6 a 420x900: 'X e nao cobre a barra de botoes do topo' — a faixa d
- **Sintoma:** sonda toque-shot secao B6 a 420x900: 'X e nao cobre a barra de botoes do topo' — a faixa do /invisivel caia em cima da 2a linha de botoes
- **Onde:** `client/src/invisivelUi.ts`
- **Causa:** 'top: 64px' fixo no CSS pra quem tem barra de toque. A fileira de botoes quebra em DUAS linhas a <=420px (o wrap defensivo do bug-634), e qualquer numero escrito a mao cobre a segunda.
- **Correção:** Medir: 'getBoundingClientRect().bottom' da #touch-topo + 8px de folga, refeito no mostrar() e num listener de resize (girar o tablet reflui a fileira). Barra ausente/escondida mede 0 e a faixa sobe pro topo. A asserção da sonda tambem foi trocada — media a CLASSE CSS (o mecanismo) e passava verde com a faixa por cima; agora mede a sobreposicao real.
- **Tags:** css, layout, tablet, wrap, sonda, falso-verde, invisivel
- **Relacionados:** bug-634

## 2026-08-22 — bug-638: place_block do aluno na celula do professor invisivel: 'expected +0 to be 2' — o bloco nao
- **Sintoma:** place_block do aluno na celula do professor invisivel: 'expected +0 to be 2' — o bloco nao era colocado nem com a invisibilidade ligada
- **Onde:** `shared/src/invisivel.test.ts`
- **Causa:** O fixture movia a ALUNA pro lado (sx+2.5) pra sair de cima da celula-alvo, mas ali o terreno vizinho e solido: o 'move' foi recusado em silencio e ela ficou no spawn. A recusa do place vinha do corpo DELA ocupando a celula, nao do professor — e a primeira metade do teste (recusa com professor visivel) passava pelo motivo errado.
- **Correção:** Inverter quem se move: a aluna FICA no spawn e o professor sobe 2 blocos (ar garantido acima da cabeca). Mais um 'expect(teleportesRecebidos(sent,1)).toBe(0)' logo apos o move, provando que o passo valeu antes de medir qualquer outra coisa.
- **Tags:** teste, fixture, falso-verde, place_block, overlapsAnyPlayer, invisivel
- **Relacionados:** bug-637, bug-605

## 2026-08-22 — bug-637: teste CONTROLE do sufocamento: 'expected 20 to be less than 20' — o professor emparedado n
- **Sintoma:** teste CONTROLE do sufocamento: 'expected 20 to be less than 20' — o professor emparedado no fixture NAO sofria dano nenhum
- **Onde:** `shared/src/invisivel.test.ts`
- **Causa:** Duas armadilhas de FIXTURE empilhadas, as duas do bug-605. (1) O handler de 'move' do servidor REJEITA o passo pra dentro de solido: emparedar antes de mover deixava o professor de fora do macico. (2) Depois de corrigir a ordem, uma parede de raio 1 ainda nao bastava — o resgate do soterramento procura vao ate o raio 2 e teleportava o jogador pra fora no 1o tick, antes de qualquer dano.
- **Correção:** No fixture: mover PRIMEIRO, emparedar DEPOIS, e com cubo de raio 3 (nao 1). E o teste de CONTROLE (professor visivel sofre) e o que expos os dois — sem ele o teste do invisivel passava por motivo errado.
- **Tags:** teste, fixture, falso-verde, soterramento, invisivel, tdd
- **Relacionados:** bug-605

## 2026-08-22 — bug-636: git push origin main: 'fatal: unable to access https://github.com/meketreve/logica-em-jogo
- **Sintoma:** git push origin main: 'fatal: unable to access https://github.com/meketreve/logica-em-jogo.git/: Failed to connect to github.com port 443 after 135305 ms: Could not connect to server' — com EXIT=0
- **Onde:** `(nenhum — ferramenta, nao codigo do projeto)`
- **Causa:** Saida CACHEADA do wrapper rtk, nao uma tentativa de push. Dois tells: (1) o texto e o tempo '135305 ms' eram IDENTICOS ao milissegundo aos de um comando anterior; (2) 'fatal:' com codigo de saida 0. Antes disso o mesmo cache ja tinha produzido 'fatal: Needed a single revision' pro `git rev-parse origin/main` e '1 commit pendente' pro `git log origin/main..main`, os dois falsos — o que me levou a diagnosticar em voz alta um 'ref de rastreio inexistente' e depois uma 'queda de rede', ambos inventados.
- **Correção:** `rtk proxy git push origin main` — saiu na hora (d5a9111..6ed37b1). Regra registrada no cerebrum: comando de git que MUDA estado (push, fetch) vai por `rtk proxy` sempre, e a prova de que um push chegou e `rtk proxy git ls-remote origin <branch>` (pergunta ao servidor, nao le ref local).
- **Tags:** rtk, git, push, cache, falso-diagnostico, ferramenta

## 2026-08-21 — bug-635: sonda toque-shot secao F: 'X o tap em /painel ENVIA o comando inteiro e abre o painel' — o
- **Sintoma:** sonda toque-shot secao F: 'X o tap em /painel ENVIA o comando inteiro e abre o painel' — o chat FECHOU e o painel nao abriu, sem erro nenhum no log
- **Onde:** `client/src/commands.ts (ordem de COMANDOS) + scripts/toque-shot.mjs (painelBotao)`
- **Causa:** O painel de comandos rapidos do dedo (`#chat-painel`) e uma caixa `max-height: 26vh; overflow-y: auto` com flex-wrap. Com ~24 comandos, os ULTIMOS da lista ficam fora da vista. Eu tinha acrescentado 'painel' no FIM de COMANDOS. O `painelBotao` da sonda achava o botao pelo textContent e media o `getBoundingClientRect` sem rolar — coordenadas de um botao invisivel. O dedo caia no vazio, e tocar fora do campo FECHA o chat: a falha se apresentou como 'o comando nao abriu o painel', diagnostico errado.
- **Correção:** Dois lados. (1) Produto: 'painel' passou a ser o PRIMEIRO item de COMANDOS — e a ordem da lista e a ordem dos botoes; `/painel` e justamente o comando de quem esta no tablet, o resto e quase todo do professor no teclado. 'pvp' entrou junto de 'regra' (mesmo assunto). (2) Sonda: `painelBotao` faz `scrollIntoView({block:'nearest'})` antes de medir, e a secao F ganhou asserção de que o `/painel` esta a vista SEM rolar (compara o rect do botao com o do container).
- **Tags:** chat, comandos, mobile, overflow, sonda, toque-shot, falso-diagnostico
- **Relacionados:** bug-634

## 2026-08-21 — bug-634: sonda toque-shot: 'barra CHEIA: 6 botoes · 512x88px em 1024px' — a fileira do topo quebrou
- **Sintoma:** sonda toque-shot: 'barra CHEIA: 6 botoes · 512x88px em 1024px' — a fileira do topo quebrou em DUAS linhas com meia tela sobrando, logo depois de ganhar `flex-wrap: wrap`
- **Onde:** `client/src/touch.ts (CSS #touch-topo)`
- **Causa:** `#touch-topo` era `position: fixed; left: 50%; transform: translateX(-50%)`. Com `left:50%` e sem `right`, a largura DISPONIVEL do shrink-to-fit vai do meio da tela ate a borda direita — 512px numa janela de 1024px. Sem `flex-wrap` isso passava batido por 2 anos: o conteudo simplesmente TRANSBORDAVA a caixa de 512px e o `translateX(-50%)` recentrava o resultado. No instante em que o wrap entrou, o flex passou a OBEDECER os 512px e quebrou a linha.
- **Correção:** Troquei por `left: 8px; right: 8px` + `justify-content: center` (a faixa mede o que a janela tem de verdade; o centro vem do justify). O container passou a cobrir o topo inteiro, entao `pointer-events: none` nele e `pointer-events: auto` nos `.touch-btn` — senao o toque AO LADO dos botoes morreria no container em vez de chegar ao jogo. Medido depois: 1024px = 1 linha (519px de conteudo), 600px = 1 linha, 420px = 2 linhas (defesa funcionando).
- **Tags:** touch, css, flexbox, shrink-to-fit, layout, mobile, retrato
- **Relacionados:** bug-633

## 2026-08-21 — bug-633: npm run build: '[builtin:vite-transform] Expected a semicolon or an implicit semicolon aft
- **Sintoma:** npm run build: '[builtin:vite-transform] Expected a semicolon or an implicit semicolon after a statement, but found none — src/touch.ts:91'
- **Onde:** `client/src/touch.ts`
- **Causa:** O CSS da UI de toque mora num TEMPLATE LITERAL de TS (`const CSS = \u0060...\u0060`). Escrevi um comentario /* */ dentro dele citando um seletor entre CRASES (o habito de markdown). A crase FECHOU o template literal no meio, e o resto do CSS virou codigo TS invalido. O typecheck (tsc --noEmit) rodou ANTES do comentario e passou; quem pegou foi o build, e a mensagem aponta a linha do comentario, nao a crase.
- **Correção:** Tirei as crases do comentario (texto puro) e deixei a nota '(Sem crase de template aqui dentro: este bloco e um template literal de TS.)' no proprio bloco pra proxima sessao. Verificacao barata: `grep -n '\u0060' client/src/touch.ts` — so as linhas 68 e 122 (abre/fecha) podem ter crase.
- **Tags:** touch, css, template-literal, build, vite, comentario

## 2026-08-21 — bug-632: usuario (escola): 'tem um bug com a mecanica de soterramento, jogadores estao sendo telepo
- **Sintoma:** usuario (escola): 'tem um bug com a mecanica de soterramento, jogadores estao sendo teleportados para camadas superiores; um aluno estava em uma caverna e foi soterrado por areia, foi teleportado para a superficie ao inves de morrer por soterramento'
- **Onde:** `shared/src/physics.ts (acharEspacoVago) + shared/src/sobrevivencia.test.ts (3 fixtures)`
- **Causa:** `acharEspacoVago` IGNORAVA o `pos.y`. A busca era por COLUNA: `caber(x,z)` fazia `const y = findSpawnY(world, x, z)`, e `findSpawnY` varre do TETO do mundo pra baixo devolvendo o primeiro ar acima de solido — ou seja, a SUPERFICIE a ceu aberto. O modelo mental do autor (bug-605, sessao 57) era 'soterrado pela areia, pula em cima dela', e o proprio comentario dizia 'a coluna propria (r=0 — sobe pro topo do que o soterrou)'. A ceu aberto parecia certo; no subsolo virava teletransporte pela rocha inteira ate a luz do dia. Efeito colateral grave: quem estava soterrado embaixo da terra NUNCA morria — sempre havia 'vao' (a superficie), entao o teleporte acontecia no 1o tick e o dano de sufocamento zerava. Os testes de bug-605 so passavam porque a fixture `enterrar()` constroi a coluna cheia ATE O TETO DO MUNDO, a unica forma de o findSpawnY nao achar superficie — o tell de que a semantica estava errada.
- **Correção:** `acharEspacoVago` passou a buscar AO REDOR do jogador (pedido explicito do usuario: 'a mecanica deveria procurar blocos ao redor e nao a cima do player'): cascas de Chebyshev 3D do raio 0 pra fora a partir de (floor(pos.x), floor(pos.y), floor(pos.z)). Desempate dentro da casca por peso = |dy|*100 + dx²+dz², entao a PROFUNDIDADE do jogador sempre ganha da distancia horizontal (com raio<=2 o termo horizontal e no maximo 8). Deterministico, sem sorteio. O vao nao precisa de chao embaixo: se for no ar a gravidade resolve. `findSpawnY` saiu do import de physics.ts. ⚠️ Efeito: 3 testes de FOME (sobrevivencia.test.ts) quebraram porque as fixtures punham a ana em y=20, DENTRO da rocha do mundo 32³ (medido: bloco=5, sobrepoeSolidos=true, findSpawnY(1,1)=23) — elas passavam GRACAS ao bug, que a resgatava pra superficie no 1o tick; sem o resgate ela sufocava, morria e respawnava com vida cheia. Corrigidas pra y=23 (a superficie da coluna), que e exatamente o que o bug-605 ja fizera no session.test.ts e passou batido aqui.
- **Tags:** soterramento, sufocamento, teleporte, caverna, physics, findSpawnY, escola, playtest, fixture-mascarando-bug
- **Relacionados:** bug-605

## 2026-08-21 — bug-630: usuario: 'verificar a possibilidade de rolar o painel do professor do botao P'
- **Sintoma:** usuario: 'verificar a possibilidade de rolar o painel do professor do botao P'
- **Onde:** `client/src/panels.ts, client/index.html`
- **Causa:** O #painel divide com #inventario/#jogadores/#amigos a moldura de altura FIXA (min(560px,84vh) + overflow:hidden, index.html:167-190), mas era o UNICO sem um filho rolavel — os irmaos tem .inv-grid e .jog-lista (flex:1; overflow-y:auto). O AuthorPanel.render() despejava as 5 secoes DIRETO no root. Medido: 701px de conteudo em 536px de painel = 165px cortados JA no notebook de 600px (417px com o teclado do tablet aberto), e a secao '👥 grupos' inteira mais a dica final ficavam invisiveis e inalcancaveis. ⚠️ `overflow:hidden` ainda aceita scrollTop por SCRIPT (a sonda media podeRolar=true e enganava), mas roda do mouse, dedo e barra nao fazem nada — pro professor era inalcancavel.
- **Correção:** Panel base ganhou `abrir(titulo)`: limpa o root, prega o .painel-head no topo e devolve um `.painel-corpo` (flex:1; min-height:0; overflow-y:auto) onde os render() enchem as secoes. Os dois subtipos (AuthorPanel, GroupPanel) trocaram `const root = this.root` por `const root = this.abrir(...)`. ⚠️ min-height:0 e obrigatorio: sem ele o item flex nao encolhe abaixo do conteudo e o overflow-y nunca age. Somado: `scrollCorpo` guarda a rolagem entre renders, porque a update() de broadcast redesenha o painel INTEIRO e o professor rolado voltava pro topo a cada aluno que entrasse (A/B com broadcast real de /grupo criar 3: com a restauracao 155->155; sem ela 155->0). Sonda de aceitacao: a secao 'grupos' passa de invisivel a visivel ao rolar, o head fica no topo e o botao fechar segue alcancavel.
- **Tags:** painel, professor, rolagem, overflow, css, flex, min-height, ui, scroll

## 2026-08-21 — bug-631: sonda headless media o codigo ANTIGO depois do rebuild: 'temCorpoRolavel: false' e 'css .p
- **Sintoma:** sonda headless media o codigo ANTIGO depois do rebuild: 'temCorpoRolavel: false' e 'css .painel-corpo presente: false', mesmo com fonte, bundle e dist todos corretos (curl confirmava o bundle novo)
- **Onde:** `scripts de sonda no scratchpad (derivados de scripts/craft-shot.mjs)`
- **Causa:** DUAS causas somadas, as duas de PROCESSO ORFAO. (1) O `python3 -m http.server` deixado rodando em client/dist ficou preso ao INODE da pasta antiga, porque `npm run build` recria o diretorio — ele seguia servindo o bundle velho enquanto o curl do shell via o novo. (2) Pior e mais enganosa: um Chrome de uma rodada anterior continuava vivo segurando a porta 9355; o chrome NOVO falhava em bindar, e `abrirAba()` (que so faz fetch em 127.0.0.1:9355/json/list) conversava com o browser ANTIGO, que ja tinha a pagina velha carregada. A URL batia, o BASE batia, e mesmo assim a medida era de outra sessao.
- **Correção:** Depois de todo rebuild: matar e resubir o http.server, e `pkill -f 'remote-debugging-port=9355'` antes de cada sonda. Diagnostico barato que aponta direto pra isso: avaliar `[...document.querySelectorAll('script[src]')].map(s=>s.src)` DENTRO da pagina e comparar com `curl BASE | grep -o 'assets/index-[^"]*\.js'` — se divergirem, e processo orfao, nao bug de codigo.
- **Tags:** sonda, headless, chrome, porta-9355, http.server, inode, rebuild, falso-negativo, processo-orfao

## 2026-08-21 — bug-629: npm run verify:all: '14/15 smokes OK — comida falhou' · '[comida] X o mundo foi salvo (o p
- **Sintoma:** npm run verify:all: '14/15 smokes OK — comida falhou' · '[comida] X o mundo foi salvo (o professor viu a confirmacao)'
- **Onde:** `server/src/cenarios/_smoke-comida.mjs`
- **Causa:** DOIS defeitos na mesma assercao, ambos desde o commit 84c3146 que a criou. (1) MENTIRA: ela mandava '/salvar', um comando que NUNCA existiu — `git log --all -S 'case "salvar"'` nao acha nada, e a lista de comandos de session.ts:1602 nao o inclui. Passava por ACIDENTE, porque a resposta e 'Comando desconhecido: /salvar…' e o `includes("salv")` casava com o eco do proprio comando. Nunca provou save nenhum. (2) FRAGILIDADE: logo acima o aluno despeja 3000 `mover` num for sem await; com a fila do servidor cheia, os 800ms fixos de `espera` nao bastavam pra resposta chegar, e o smoke passava ou falhava conforme a CARGA da maquina. Medido: com espera(6000) passava; o eco do /bloco anterior tambem estava faltando no prof.chats, o que denunciou a fila e nao o comando.
- **Correção:** Assercao reescrita pro que de fato vale ali: 'o professor continua sendo atendido depois da enxurrada de movimento'. Usa o /bloco que JA existia no fluxo (comando real, efeito real) em vez de inventar /salvar, e espera por CONDICAO com um helper `ate(cond, teto)` no lugar de `espera` fixa (teto 10s, passo 100ms). A ida-e-volta do save pelo disco continua provada em comida.test.ts, como o proprio comentario ja dizia. A/B conferido: trocando o prefixo esperado por um impossivel, o smoke falha. Efeito colateral bom: o smoke ficou mais rapido (21s -> 14s), porque agora sai assim que a resposta chega.
- **Tags:** smoke, comida, flake, timing, assercao-falsa, salvar, fila, backpressure
- **Relacionados:** bug-547, bug-560

## 2026-08-19 — bug-628: usuario: 'varrer toda receita de craft atras de LA que devia ser ALGODAO, incluindo os cas
- **Sintoma:** usuario: 'varrer toda receita de craft atras de LA que devia ser ALGODAO, incluindo os casos em que a palavra aparece so no NOME'
- **Onde:** `client/src/blocksUi.ts, shared/src/blocks.ts, shared/src/receitas.ts, shared/src/mesher.ts, client/src/atlasTexture.ts (+12 arquivos)`
- **Causa:** NAO era defeito de receita: o bug-611 (2026-08-10) ja migrara as 26 receitas pra ITEM_ALGODAO, e o teste-portao de algodao.test.ts provava isso. O residuo era VOCABULARIO — os 12 blocos seguiam chamados 'la <cor>' num jogo que nunca teve ovelha, e algodao nao vira la. O F10c trocou a CADEIA (la<-trigo virou algodao) mas ninguem revisou o nome exposto ao aluno.
- **Correção:** Renomeado rotulo E identificador: 'la <cor>' -> 'bloco de algodao <cor>'; BlockId.WoolXxx -> BlocoAlgodaoXxx; TILE.woolXxx -> blocoAlgodaoXxx; Cor.la -> Cor.blocoAlgodao; FIBRA_POR_LA -> FIBRA_POR_BLOCO; LAS -> BLOCOS_ALGODAO. Os NUMEROS dos ids nao mudaram (11-18, 23-26), entao save/fio/.ljw ficaram intactos — provado regerando os 7 cenarios e conferindo md5 (byte-identicos). Nome 'la' fica RESERVADO pra ovelha, que entra depois como item separado com ids novos.
- **Tags:** vocabulario, algodao, la, blockid, rename, receitas, pedagogia, ui
- **Relacionados:** bug-611

## 2026-08-17 — bug-626: usuario (escola): 'usei o comando /hora noite e nao consegui dormir'
- **Sintoma:** usuario (escola): 'usei o comando /hora noite e nao consegui dormir'
- **Onde:** `shared/src/session/dormir.ts, shared/src/session.ts`
- **Causa:** DOIS defeitos. (1) tentarDormir tinha `if (!ses.cicloAtivo) return null` — retorno SILENCIOSO. `/hora` nunca liga o ciclo (so `/ciclo` faz isso) e o .ljw de aula nasce com `/ciclo desligar`, entao o clique na cama respondia so 'Ponto de nascimento definido nesta cama.' e mais nada. Reproduzido contra cenarios/aula1-sequencia.ljw: cicloAtivo=false, /hora noite -> hora=21 ciclo=false, clique -> dormindo=false sem explicacao. (2) O gate estava conceitualmente errado: cicloAtivo diz se o tempo anda SOZINHO; dormir e acao explicita. Com o ciclo parado o mundo fica travado no meio-dia, entao dormir so pode disparar se alguem ja escolheu a noite de proposito. (3) Descoberto no conserto: a regra era maioria ESTRITA (dormem*2 > online), o que numa DUPLA exigiria os dois — a regra 'todos' disfarcada.
- **Correção:** Removido o gate do cicloAtivo. O tick passou a avancar a hora quando `cicloAtivo || pulandoNoite`, entao a noite passa mesmo com o ciclo parado e a hora volta a congelar depois de amanhecer. Regra virou METADE OU MAIS (dormem*2 >= online). E o motivo de nao ter dormido passou a ir na MESMA frase do spawn ('Ponto de nascimento definido nesta cama. So da para dormir a noite.') — em mensagem separada, todo clique de DIA terminava numa reclamacao, e os 2 testes antigos de cama-spawn caiam porque olham a ultima fala. ✅ CONFIRMADO EM CAMPO (2026-08-17, escola): usuario relatou 'testei e a animacao funcionou'.
- **Tags:** dormir, cama, ciclo, silencio, escola, playtest, maioria, confirmado-em-campo
- **Relacionados:** bug-627

## 2026-08-17 — bug-627: usuario (escola): 'o player deita (fora da cama, precisa subir o modelo um bloco pra cima)
- **Sintoma:** usuario (escola): 'o player deita (fora da cama, precisa subir o modelo um bloco pra cima) mas a tela fica flicando, a animacao nao esta funcionando corretamente'
- **Onde:** `client/src/main.ts, client/src/remotePlayers.ts, shared/src/protocol.ts`
- **Causa:** DOIS defeitos de cliente. (1) FLICKER: o laco de render faz `camera.position.set(pose do jogador)` e `camera.rotation.set(...)` TODO FRAME, e eu interpolava a camera DEPOIS disso. O lerp nunca converge — cada frame recomeca na pose em pe e anda so uma fracao fixa. Simulado: o valor estaciona em 4.7623 para sempre (13% do caminho) em vez de chegar a 5.9, deixando a camera encravada na geometria da cama e tremendo junto com a posicao do jogador. (2) CORPO FORA DA CAMA: o `player_moved` leva `x/y/z` = os PES do jogador, e o servidor NAO move quem dorme (so o cliente leva a camera) — entao o boneco deitava no chao ao lado da cama.
- **Correção:** (1) Interpolar o PROGRESSO (`dormirT`, campo que persiste entre frames) em vez da camera; a pose vira lerp(pose em pe, cama, t), que converge e e estavel. `ultimaCama` guarda o destino durante a animacao de levantar, senao o alvo sumiria no frame do acordar e a camera saltaria. (2) `player_moved` ganhou `cama?: {x,y,z}` (enviado so quando dormindo) e o corpo remoto passou a ser posicionado em `cama.x+0.5, cama.y+1+PLAYER.width/2, cama.z+0.5`. ✅ CONFIRMADO EM CAMPO (2026-08-17, escola): usuario relatou 'testei e a animacao funcionou'.
- **Tags:** dormir, cliente, camera, animacao, flicker, protocolo, playtest, escola, confirmado-em-campo
- **Relacionados:** bug-626

## 2026-08-17 — bug-625: usuario: 'reparei que os blocos de cerca nao estao no menu blocos do creativo'
- **Sintoma:** usuario: 'reparei que os blocos de cerca nao estao no menu blocos do creativo'
- **Onde:** `client/src/blocksUi.ts`
- **Causa:** NAO era ausencia. Existe UM bloco de cerca (BlockId.Cerca = 65), ele esta no menu do criativo e isPlaceable o aceita. O que houve foi CATEGORIA: blocksUi.ts:83 traz { id: BlockId.Cerca, name: 'cerca', cat: 'mobilia' }, junto de porta, tocha e tapete — nao em cat: 'blocos', que e onde o usuario procurou.
- **Correção:** Movida para cat: 'blocos' (client/src/blocksUi.ts) por decisao do usuario em 2026-08-17: a cerca e material de CONSTRUCAO (cercar terreno, parapeito) e quem procura por ela vai na aba de blocos, mesmo ela sendo nao-cubo como a porta. Conferido no bundle: {id:G.Cerca,name:`cerca`,cat:`blocos`}.
- **Tags:** inventario, criativo, cerca, categoria, ux

## 2026-08-17 — bug-624: usuario: 'agora o sol esta quadrado mas o halo esta redondo, deixe tudo quadrado'
- **Sintoma:** usuario: 'agora o sol esta quadrado mas o halo esta redondo, deixe tudo quadrado'
- **Onde:** `client/src/daynight.ts`
- **Causa:** Quando o disco do sol virou QUADRADO (PlaneGeometry(56,56), estilo Minecraft) o halo aditivo ficou para tras: seguia CircleGeometry(52,24). Os dois planos ficam na MESMA posicao e usam o mesmo lookAt(camera), entao o circulo aparecia concentrico com o quadrado e a borda de brilho tinha espessura DESIGUAL: 52-28 = 24 nos eixos, mas so 52-39,6 = 12 nas quinas (a quina do quadrado avanca 28*raiz(2) = 39,6). Resultado visivel: sol quadrado dentro de um halo redondo.
- **Correção:** sunGlow passou a ser PlaneGeometry(104,104) (= 56 do sol + 24 de anel em VOLTA INTEIRA), mantendo o alcance nos eixos que o circulo r=52 ja tinha e deixando a borda uniforme. Nao mexeu no material (AdditiveBlending, opacity 0.28, depthWrite:false) nem no apply(): sunDisc e sunGlow continuam na mesma posicao e com o mesmo lookAt, logo saem com a MESMA orientacao e concentricos. A lua (CircleGeometry(20,24)) ficou REDONDA de proposito, fora do pedido.
- **Tags:** daynight, sol, halo, geometria, three, visual, menu-nao

## 2026-08-15 — bug-623: usuario: 'as fotos nao ficaram com enquadramento bom' (fundo 3D do menu principal)
- **Sintoma:** usuario: 'as fotos nao ficaram com enquadramento bom' (fundo 3D do menu principal)
- **Onde:** `client/src/main.ts, client/src/menuFundo.ts, scripts/fundo-shots.mjs`
- **Causa:** As 6 prints viram faces INTERNAS de um cubo; do centro cada face ocupa 90x90 graus. As fotos eram tiradas com o FOV do JOGO (settings.fov=75) e aspect 1, cobrindo so 75x75 graus -> esticadas ~1,4x na face e faltando um vao de 15 graus em cada aresta (horizonte 'pulava' na quina). O commit b1a7949 mexeu no lado errado: baixou o FOV da camera de VISUALIZACAO do menu de 80 para 75 em vez de subir o FOV de CAPTURA para 90.
- **Correção:** main.ts: ramo `?foto` do applySettings forca fov:90 (o laco converge camera.fov para settings.fov). fundo-shots.mjs: guarda que le window.__fotoCam() e aborta se fov!=90 ou aspect!=1; pitch de teto/chao virou +-PI/2 EXATO (o clamp PI/2-0.01 do input.ts so roda nos handlers de mouse/toque, e __fotoApontar escreve direto). menuFundo.ts: faces +y/-y estavam sem espelho nenhum, mas o UV do BoxGeometry quer v+ -> -z (face +y) e v+ -> +z (face -y) enquanto a foto poe o oposto no topo -> repeat.y=-1; espelho agora usa repeat=-1 COM offset=1 e wrap ClampToEdge (RepeatWrapping interpolava com a borda oposta e desenhava linha de 1px na quina); camera do menu parou de ORBITAR em raio 0.6 e passou a so girar rotation.y no centro exato (fora do centro o cubemap ganha paralaxe e torce a emenda).
- **Tags:** menu, fundo-3d, cubemap, fov, three.js, screenshot, enquadramento, uv

## 2026-08-12 — bug-622: queixa do usuário: "melhorar o contraste da tooltip no tablet" — o texto do tooltip de ite
- **Sintoma:** queixa do usuário: "melhorar o contraste da tooltip no tablet" — o texto do tooltip de item saía PRETO sobre a caixa quase preta, ilegível no tablet da escola.
- **Onde:** `client/index.html`
- **Causa:** `.tooltip-item` nunca declarou `color`, e `html,body` também não declara nenhuma — o elemento pendura direto no `body` (`document.body.appendChild` em `client/src/tooltip.ts:65`), então caía no padrão do navegador sobre o fundo fixo `#0c0e14`. E o padrão é PRETO nos dois esquemas: medido com `prefers-color-scheme` emulado via CDP, `rgb(0,0,0)` em light E em dark, porque o documento não declara `color-scheme` em lugar nenhum. Logo não era bug 'de tablet' — era de toda tela; o tablet foi só onde alguém leu de perto. Todo o resto da UI escapava por herdar de um painel que já traz `color: #fff`; o tooltip é o único filho direto do body com fundo escuro próprio.
- **Correção:** Em `client/index.html`: `color: #ffffff` explícita no `.tooltip-item` (com comentário explicando por que não pode depender do padrão do UA), fundo de `#0c0e14` para `#05070b` e borda de `rgba(255,255,255,.22)` para `.28` (a caixa mais escura perdia a beirada). `npm run build` obrigatório — o `client/dist/index.html` é tracked e carrega o CSS inline. Prova: `npm run shots:tooltip -- 1024 600` contra o dist servido, 18/18, e o print `tooltip-toque.png`.
- **Tags:** tooltip, css, contraste, acessibilidade, tablet, color-scheme, ui
- **Relacionados:** bug-618, bug-619

## 2026-08-11 — bug-621: depois de o auto-update aplicar e relançar a janela, o launcher cuspiu dezenas de "'d' nao
- **Sintoma:** depois de o auto-update aplicar e relançar a janela, o launcher cuspiu dezenas de "'d' nao e reconhecido como um comando interno ou externo" — 'd', 'o', 'LOGICA', '.', 'Atualizacao', 'client\dist', 'copia', '11', 'que', 'primeira', 'clone', 'copiar', 'ou'. A rodada continuou e chegou no menu, mas a tela ficou aterrorizante.
- **Onde:** `iniciar-servidor.bat`
- **Causa:** Eu introduzi um `⚠️` (6 bytes, E2 9A A0 EF B8 8F) num comentário REM do cabeçalho, num arquivo que era ASCII PURO de propósito — o autor original escrevia "atualizacao", "voce", "nao" sem acento e nunca escreveu por quê. O cmd.exe lê arquivo .bat por DESLOCAMENTO DE BYTE; com `chcp 65001` (linha 7) o número de bytes diverge do de caracteres, e sem `\r` para reancorar o parser retoma no MEIO da linha seguinte e executa pedaços de comentário como comandos. As palavras do erro são justamente fragmentos das linhas do cabeçalho.
- **Correção:** Emoji removido (`ATENCAO:` no lugar), .bat de volta a 0 bytes não-ASCII. E um PORTÃO novo, `scripts/checar-launchers.mjs`, ligado em `npm run verify` e antes de `npm run smoke`: recusa byte não-ASCII no .bat (apontando a LINHA e dizendo o conserto), recusa mistura de LF/CRLF, recusa `\r` no .sh, e confere que os dois launchers ainda decidem o update por capacidade (bug-620). Mora em scripts/ e não em shared/src/*.test.ts porque o workspace shared não tem @types/node de propósito — é isso que impede o código de produção dele de alcançar API de Node, e um teste que lê arquivo furaria a garantia para o pacote inteiro. ✅ CONFIRMADO NO CAMPO (2026-08-12): relato do usuário na 3ª rodada da escola — "a nova versão já não teve os erros de texto no início; fechou a versão antiga e abriu a versão nova corretamente". Zero linhas de "não é reconhecido" no cmd.exe real, e a troca-e-relançamento do próprio launcher rodou limpa.
- **Tags:** launcher, bat, cmd, encoding, chcp, utf-8, escola, portao, regressao
- **Relacionados:** bug-620, bug-616, bug-615

## 2026-08-11 — bug-620: relato do usuário no piloto da escola: "testei e fica dizendo que é um clone e desabilita 
- **Sintoma:** relato do usuário no piloto da escola: "testei e fica dizendo que é um clone e desabilita o autoupdate... mas toda vez que eu atualizo na escola é baixando o zip lá do git". O launcher imprimia "(esta pasta e um clone do git: atualize com \"git pull\" - update automatico desligado)" e pulava a atualização inteira.
- **Onde:** `iniciar-servidor.bat`
- **Causa:** Os dois launchers decidiam o caminho por PRESENÇA de pasta, não por CAPACIDADE: `if exist ".git"` no .bat e `[ -d .git ]` no .sh. A pasta da escola tem um `.git` sobrando (clone antigo, ou ZIP extraído por cima de um) e nenhum git instalado — então o teste dava verdadeiro, o launcher a declarava clone e mandava rodar `git pull` justamente para quem atualiza baixando o ZIP. Pior: no .bat NÃO EXISTE caminho de git nenhum, então esse ramo só desligava a atualização. Todos os becos seguintes do .sh (git ausente, branch != main) também terminavam em `return` sem cair pro pacote. ⚠️ NÃO era nome curto 8.3: uma pasta só com .gitignore/.gitattributes foi testada no cmd.exe real e o `if exist ".git"` deu falso.
- **Correção:** A decisão passou a ser por capacidade, nos dois launchers (`decidir_caminho_de_update` no .sh, o bloco `:via_decidida` no .bat). Usa git SÓ se: `.git` existe E o git está no PATH E `git rev-parse --is-inside-work-tree` responde true E há `remote.origin.url`. Falhando qualquer um, vai pelo PACOTE e imprime o motivo. A distinção que decide: git que NÃO PODE operar (não instalado, .git quebrado, sem origin) cai pro pacote, que é seguro porque copia por cima e nunca apaga; git que PODE operar e recusa (branch != main) PARA, porque copiar por cima pisaria no trabalho de quem desenvolve. Override novo `LJ_UPDATE=pacote|zip|git`, documentado no README. No .sh o `-e` substituiu o `-d` (em worktree/submódulo o `.git` é um ARQUIVO). ✅ CONFIRMADO NO CAMPO (2026-08-12): 3ª rodada na escola atualizou sozinha, sem passo manual e sem apagar `.git` nenhum — a decisão por capacidade manda a pasta da escola pro caminho do pacote, que é o certo.
- **Tags:** launcher, auto-update, bat, sh, git, escola, piloto, deteccao
- **Relacionados:** bug-606, bug-615, bug-616, bug-233

## 2026-08-11 — bug-616: os launchers anunciavam a atualização só pelo sha do commit ("Atualizado para a a1b2c3d.")
- **Sintoma:** os launchers anunciavam a atualização só pelo sha do commit ("Atualizado para a a1b2c3d.") — o professor não tem como saber que versão do jogo está rodando.
- **Onde:** `iniciar-servidor.sh`
- **Causa:** O update se identifica pelo sha de 40 hex da API do GitHub (é ele que responde "estou na última?" e é o que fica no `.lj-versao`), e a mensagem foi escrita reusando esse mesmo valor. Mas sha não é legível nem repetível por telefone; a versão que a pessoa lê mora no campo `version` do `package.json` da raiz — a MESMA que o jogo mostra e que o perfilador anônimo carimba por versão (hud.ts:529).
- **Correção:** `versao_do_pacote` + `anunciar_versao` no .sh e a sub-rotina `:ler_versao` no .bat leem o campo `version` do package.json da raiz. DUAS frases, porque os casos são diferentes pro professor: "Atualizado da versão 0.9.0 para a 1.0.0 (commit abc1234)" quando o número muda, e "Atualizado — continua na versão 0.9.0, com as correções mais novas" quando o conserto veio dentro da mesma versão (o caso comum). Vale nos TRÊS caminhos: pacote, `merge --ff-only` e o ff depois do `git stash`. Os dois números são lidos ANTES da cópia — depois dela o package.json de casa já é o novo, e a frase viraria "da 1.0.0 para a 1.0.0". Sem o campo (ou sem o arquivo) cai na frase antiga com o sha: piora, não quebra.
- **Tags:** launcher, auto-update, bat, sh, versao, ux
- **Relacionados:** bug-606, bug-615

## 2026-08-11 — bug-615: README.md:29 dizia "Git (opcional) | só para o launcher se atualizar sozinho" e a seção At
- **Sintoma:** README.md:29 dizia "Git (opcional) | só para o launcher se atualizar sozinho" e a seção Atualizar descrevia SÓ o caminho do git clone + fast-forward. Quem baixou o ZIP — que é o caso real da escola — lia que não tinha auto-update, e tinha desde 8bfb086/3a43954.
- **Onde:** `README.md`
- **Causa:** O README foi escrito quando o único caminho de update era `git pull`. Os commits 8bfb086 (.bat, 2026-08-07) e 3a43954 (.sh, bug-606, 2026-08-08) acrescentaram o caminho do PACOTE (zip/tar.gz, sem git) e nenhum dos dois tocou na documentação. Defeito por OMISSÃO: nada do que estava escrito era falso, mas a conclusão que o leitor tirava era.
- **Correção:** Linha da tabela virou "Git — **não** precisa | o launcher se atualiza sozinho sem ele". Seção "Baixar" nova (Code → Download ZIP). Seção "Atualizar" reescrita com os DOIS caminhos, escolhidos pela pasta: sem `.git` = pacote (curl+tar, sem PowerShell, `.lj-versao`, cópia por cima sem apagar, aviso do `mundos/`, `client/dist` já pronto); com `.git` = ff-only + `git stash`. Mais o que vale nos dois: `LJ_SEM_UPDATE=1`, sem rede não trava a aula, `mundos/` intocado.
- **Tags:** readme, documentacao, auto-update, launcher, escola
- **Relacionados:** bug-606, bug-233

## 2026-08-11 — bug-617: o tooltip novo não aparecia nas linhas de receita DESABILITADAS da lista de craft — justam
- **Sintoma:** o tooltip novo não aparecia nas linhas de receita DESABILITADAS da lista de craft — justamente as que o aluno ainda não consegue fabricar, que é onde a pergunta "o que é isso?" nasce.
- **Onde:** `client/src/tooltip.ts`
- **Causa:** Botão com o atributo `disabled` NÃO despacha evento de ponteiro (nem nos filhos dele). O tooltip funciona por delegação no `document` e acha o dono com `e.target.closest('[data-tip-id]')`; com a linha desabilitada o `target` que chega é a `.craft-lista`, não a receita, então o `closest` volta null.
- **Correção:** Sem tocar no `disabled` (3 scripts de shot dependem dele: craft-shot.mjs:111/129 e toque-shot.mjs:390): quando o `closest` falha, cair para `document.elementFromPoint(x, y)`, que ENXERGA o botão desabilitado porque ele continua desenhado. O teste caro fica ATRÁS de um `closest('.craft-lista')` — senão rodaria a cada `pointermove` do jogo, com o ponteiro travado no canvas.
- **Tags:** tooltip, dom, disabled, pointer-events, craft, delegacao

## 2026-08-11 — bug-618: a caixa do tooltip saía em DOIS tons e o texto menor ficava ilegível — no print da sonda d
- **Sintoma:** a caixa do tooltip saía em DOIS tons e o texto menor ficava ilegível — no print da sonda dava para ver o painel por baixo de metade dela.
- **Onde:** `client/index.html`
- **Causa:** `background: rgba(12,14,20,0.94)`. A caixa nasce na beirada do painel de inventário: metade dela cai sobre o painel escuro e metade sobre o céu do jogo. Com QUALQUER alfa os dois fundos atravessam com luminâncias diferentes, e a linha de uso (0,78 rem, opacidade 0,85) morre justamente na metade que está sobre o céu claro.
- **Correção:** Cor sólida (`background: #0c0e14`) com a borda de sempre. Regra geral: UI flutuante que pode nascer na beirada de um painel é opaca.
- **Tags:** tooltip, css, legibilidade, contraste, ui
- **Relacionados:** bug-617

## 2026-08-11 — bug-619: o `tooltip-shot.mjs` afirmava medir o slot 0 (tronco) na seção de toque e a caixa dizia "p
- **Sintoma:** o `tooltip-shot.mjs` afirmava medir o slot 0 (tronco) na seção de toque e a caixa dizia "picareta de pedra" — o log estava mentindo sobre o que tinha sido tocado.
- **Onde:** `scripts/tooltip-shot.mjs`
- **Causa:** A coordenada do slot foi medida na seção A (mouse) e reusada na seção B, mas entre as duas o script chama `Emulation.setEmulatedMedia` com `pointer: coarse`. Isso muda o CSS (os alvos de dedo crescem) e portanto o LAYOUT: o mesmo par x,y passou a cair noutro slot.
- **Correção:** Remedir o centro do slot DEPOIS de trocar a emulação (`q0`), e usar `q0` em todas as asserções de toque. A asserção B1/B1b (tap curto pega e solta) confirma que a coordenada nova é um slot com item.
- **Tags:** sonda, cdp, emulation, layout, tooltip, shots
- **Relacionados:** bug-617

## 2026-08-10 — bug-609: playtest: "dividir pilha de itens no inventario deixa icone do item dividido flutuando no 
- **Sintoma:** playtest: "dividir pilha de itens no inventario deixa icone do item dividido flutuando no meio da tela quando feito em notebook/pc"
- **Onde:** `client/src/slotDrag.ts`
- **Causa:** O fantasma (o icone que segue o cursor) foi escrito para o ARRASTO, e a divisao por clique DIREITO nasceu depois reusando `mostrarFantasma` sem reusar o resto do caminho. Tres buracos, todos com a mesma raiz: `pressionar` (button === 2) NAO seta `this.cand`. (1) POSICAO: quem posicionava o fantasma eram as duas linhas `style.setProperty('left'/'top')` no FIM de `mover(e)`, e `mover` comeca com `if (!this.cand) return` — sem arrasto elas nunca rodavam, entao o div `position:fixed` ficava SEM `left`/`top` e caia na posicao estatica do fluxo do <body> (medido no headless: (0,457) numa tela de 1024x600 — colado na borda esquerda, no meio da altura, exatamente o "flutuando no meio da tela"). (2) NAO SEGUIA o cursor, pelo mesmo `if (!this.cand) return`. (3) NUNCA SUMIA: `esconderFantasma()` so era chamado de `soltar()`, que tambem exige `cand` — largar a metade com o clique ESQUERDO (que passa por `aoClicar` do painel) ou fechar o painel deixava o icone na tela para sempre, e `hide()` do inventario nem limpava o `pegando`.
- **Correção:** FEITO em 2026-08-10. slotDrag.ts: (a) memoria `px/py` da ultima posicao do ponteiro, gravada em `pressionar` e no topo de `mover` ANTES do `return`; (b) `posicionarFantasma()` extraido e chamado tambem no fim de `mostrarFantasma` — o fantasma ja nasce no cursor; (c) `mover` posiciona antes do `if (!this.cand) return`, entao a metade na mao segue o ponteiro sem arrasto; (d) metodo publico `sincronizar()` que apaga o fantasma quando `hooks.pegando()` e null; (e) o div ganhou `className = 'arrasto-fantasma'` (classe, nao id: mochila e container tem um ArrastoDeSlot CADA) para o shot poder medi-lo. inventory.ts e container.ts chamam `sincronizar()` no topo de `render()` e limpam `pegando`/`metadePegando` no fechar. PROVA: `shots:esc` secao B3 (Chrome headless de desktop, clique direito REAL por CDP numa pilha de 32) — com o fix o fantasma nasce em (316,400) para um clique em (308,392), mostra 16, segue o ponteiro 8 px a frente e some ao fechar o painel; com o codigo velho a mesma sonda le (0,457), nao segue e sobrevive ao fechar.
- **Tags:** inventario, drag, divisao-de-pilha, clique-direito, pc, playtest-2026-08-10, ui, FIXED, fix-2026-08-10

## 2026-08-10 — bug-610: playtest: "o comando amigos nao libera o mouse para poder clicar, a interface continua cap
- **Sintoma:** playtest: "o comando amigos nao libera o mouse para poder clicar, a interface continua capiturando o mouse"
- **Onde:** `client/src/main.ts`
- **Causa:** `/amigos` sem subcomando abre o painel pelo cliente (`abrirAmigosPorComando` -> `paineis.trocarParaAmigos()`), e o ChatUi fecha o campo NA LINHA SEGUINTE ao `onSend` (chat.ts:69-70). O callback de fechamento do chat era `if (!open) input.lock()` (main.ts) — escrito quando o unico destino de fechar o chat era voltar pro jogo. Com o painel na frente, o `requestPointerLock` vinha por cima dele: o aluno via a interface e nao conseguia clicar em nada. Vale para QUALQUER comando que abra painel pelo lado do cliente, nao so o /amigos.
- **Correção:** FEITO em 2026-08-10. main.ts: `if (!open && !paineis.algumAberto) input.lock()`. PROVA: `shots:esc` secao B2 conta as CHAMADAS de `requestPointerLock` (nao o `pointerLockElement`): 4 pedidos com o codigo velho, 0 com o fix. A contagem de pedidos e obrigatoria aqui — o Enter que o script dispara e sintetico, e sem gesto de usuario o Chrome recusa o lock de qualquer jeito, entao medir a CONCESSAO dava verde nos dois lados (a primeira versao da sonda passou com o bug de volta).
- **Tags:** pointer-lock, chat, painel, amigos, playtest-2026-08-10, ui, FIXED, fix-2026-08-10
- **Relacionados:** bug-585, bug-597

## 2026-08-10 — bug-611: playtest: "revisa todos os crafts, alguns ainda usam la ao invez de algodao"
- **Sintoma:** playtest: "revisa todos os crafts, alguns ainda usam la ao invez de algodao"
- **Onde:** `shared/src/receitas.ts`
- **Causa:** O F10c (sessao 46) trocou a FONTE da la (era 2 trigo, virou 3 algodao) mas nao mexeu em quem CONSOME la. Sobraram 26 receitas cobrando la como materia-prima: as 11 coloridas (1 la branca + corante), os 12 tapetes (2 las da mesma cor) e 3 moveis (sofa 2, cama 3, quadro 1 la branca). Na lista do painel isso obriga o aluno a fabricar la branca so pra desfazer no passo seguinte — uma etapa que nao ensina nada e que some do filtro "so o que da pra fazer agora".
- **Correção:** FEITO em 2026-08-10, com a regra unica 1 la = 3 algodao (`FIBRA_POR_LA`), a conta preservada e a tintura contando 1 por LOTE. Las coloridas: 3 algodao + corante. Tapetes: 6 algodao (+ corante nos 11 coloridos; o branco e o liso, sem tintura, como na la). Moveis: sofa 3 tabua + 6 algodao, cama 3 tabua + 9 algodao, quadro 2 tabua + 3 algodao. Os INDICES de `RECEITAS` nao se mexeram (so `custo` mudou no lugar) — o indice e a identidade no protocolo `fabricar {receita}`, e o precedente e o proprio F10c. A la segue existindo como bloco de construcao, so nao e mais materia-prima de ninguem. Teste-portao novo em algodao.test.ts: "nenhuma receita ativa cobra LA" (com os 12 ids explicitos — eles NAO sao contiguos: 11-18 e 23-26).
- **Tags:** receitas, craft, algodao, la, playtest-2026-08-10, balanceamento, FIXED, fix-2026-08-10

## 2026-08-10 — bug-612: 3 testes de worldgen falham SO na suite completa e passam isolados: "arvores — cada especi
- **Sintoma:** 3 testes de worldgen falham SO na suite completa e passam isolados: "arvores — cada especie usa o proprio tronco e a propria copa", "F10h — o algodao nao sumiu (7 especies selvagens)", "gen procedural — minerios respeitam a banda de profundidade". A falha vem como `Error: STACK_TRACE_ERROR` sem mensagem.
- **Onde:** `shared/src/worldgen.test.ts`
- **Causa:** O COMANDO, nao a config: `npx vitest run` rodado da RAIZ do repo nao acha config nenhuma e cai nos DEFAULTS do vitest (`testTimeout` 5000 ms, um fork por nucleo = 24 nesta maquina). A `shared/vitest.config.ts` (que manda `testTimeout: 20000, maxWorkers: 8`, calibrada no bug-545) so era lida por `npm test`, que e `npm run test -w shared` e portanto roda com CWD = `shared/`. A coleta e IDENTICA nos dois caminhos (45 arquivos, 814 testes — nao ha teste fora de `shared/`), entao a diferenca passa despercebida ate a maquina ficar ocupada: com carga, os testes que GERAM MUNDO (128³, 2 a 4,5 MB por fork) estouram os 5 s e a suite vira sorteio. A mensagem estava la o tempo todo — `Test timed out in 5000ms` — mas `5000` e o numero que denuncia a config ausente, e ninguem tinha lido ate 2026-08-11. O `STACK_TRACE_ERROR` sem mensagem que a sessao 65 viu e a outra face do mesmo aperto (fork morto).
- **Correção:** FEITO em 2026-08-11 (sessao 67): `vitest.config.ts` NOVO na raiz reexportando a config do shared (`import compartilhada from "./shared/vitest.config"`), pra os dois limites terem UMA fonte so — o comentario que os justifica continua no shared. Rodar da raiz passa a valer os mesmos 20 s / 8 workers.
A/B sob pressao real (3 suites completas CONCORRENTES, mesma maquina, mesmo commit): `npx vitest run` da raiz SEM a config = 9 rodadas vermelhas em 9 (2 a 5 falhas cada, sempre `Test timed out in 5000ms`); `npm test` = 6 verdes em 6; `npx vitest run --config shared/vitest.config.ts` da raiz = 3 verdes em 3 (prova que quem decide e a CONFIG, nao o diretorio). PORTAO depois do conserto: `npx vitest run` da raiz, 3 concorrentes x 3 rodadas = 9 verdes em 9, 814/814 nas nove. Sem pressao a suite ja era 6 verdes em 6 (3 na sessao 66 + 3 nesta), que e por que ela nunca reproduzia sozinha.
A leitura antiga "3 falhas de worldgen = baseline" esta MORTA: qualquer vermelho agora e vermelho de verdade.
- **Tags:** testes, vitest, worldgen, flaky, suite-completa, config, timeout, FIXED
- **Relacionados:** bug-545

## 2026-08-10 — bug-613: (achado pela sonda nova do shots:esc, sessão 66) o /amigos abria o painel e AINDA assim sa
- **Sintoma:** (achado pela sonda nova do shots:esc, sessão 66) o /amigos abria o painel e AINDA assim saíam 2 pedidos de requestPointerLock 588-747 ms depois do comando — o mouse voltava a ser capturado por cima do painel, o mesmo sintoma do bug-610 por outra porta
- **Onde:** `client/src/input.ts`
- **Causa:** O guarda do bug-610 (`if (!open && !paineis.algumAberto) input.lock()`) está no callback de FECHAR O CHAT, em main.ts. A tentativa ATRASADA do `reagendarLock` (setTimeout de CARENCIA_ESC_MS = 1400 ms, armada quando o Chrome recusa um lock dentro da carência do Esc) chama `pedirLock()` DIRETO e não passa por esse guarda — ela só checa `locked`/`touchDevice`/`touch`, nunca a tela. Sequência real: Esc → clique em 'voltar ao jogo' recusado dentro da carência → retry armado → o aluno abre a mochila (ou um comando abre painel) → 1,4 s depois o ponteiro trava POR CIMA do painel. Os 2 pedidos por tentativa são o `pedirLock` chamando `requestPointerLock({unadjustedMovement:true})` e, no catch, a forma antiga — 1 tentativa = 2 chamadas na contagem da sonda.
- **Correção:** `Input.podeTravar: () => boolean` (default `() => true`), checada na PRIMEIRA linha de `pedirLock()` — o ponto por onde passam o clique no canvas, o `lock()` e o retry atrasado. `main.ts` injeta `input.podeTravar = () => !paineis.algumAberto` logo depois de criar o `PainelHost`. Quando recusa, zera `pedindo` (não há tentativa no ar pra o menu de pausa desenhar). A/B no `shots:esc`: com o guarda 0 pedidos; trocando por `() => true` e reconstruindo o dist, voltam os 2 (588 e 651 ms do comando).
- **Tags:** pointer-lock, input, paineis, ui, cliente, FIXED, bug-610, shots-esc
- **Relacionados:** bug-610, bug-597, bug-585

## 2026-08-10 — bug-614: a hotbar do PC NÃO sumia com painel, chat ou tela de carga na tela — ela sumia só no menu 
- **Sintoma:** a hotbar do PC NÃO sumia com painel, chat ou tela de carga na tela — ela sumia só no menu de pausa, que é o oposto do pedido do usuário registrado na sessão 58 (todo.md L437). No tablet nunca sumia.
- **Onde:** `client/src/main.ts`
- **Causa:** `classList.toggle(tok, force)` ADICIONA a classe quando `force` é true. A 58 escreveu 'a MESMA condição do overlay' e implementou o espelho literal: overlay esconde com `A`, hotbar escondia com `!A`, sendo `A = benchRodando || loading.ativo || input.active || input.retomando || chat.open || panelOpen`. Espelhar dá o OPOSTO do pedido, porque o overlay some justamente quando o painel abre (pra não cobrir o painel) — logo a hotbar aparecia COM painel, COM chat e durante a CARGA, e só sumia no menu de pausa. No toque era pior: `input.active = locked || touch` é sempre true no tablet, então lá a barra nunca sumia. O comentário acima da linha descrevia o comportamento pedido, não o implementado.
- **Correção:** `const noControle = benchRodando || input.active || input.retomando` e `toggle('hidden', !(noControle && !chat.open && !panelOpen && !loading.ativo))` — os dois conjuntos NÃO são espelho e o comentário passou a dizer por quê. `retomando` e `benchRodando` ficam do lado visível (carência de 1,25 s do Chrome no bug-597 senão a barra pisca; e as baterias de bench das sessões 63/64 foram medidas com a barra na tela). Prova: 4 asserções novas no `shots:esc` (dentro das seções A e B2, que já seguram o pointer lock) — com o dist do código velho as 3 que importam CAEM (altura 81px com a mochila aberta).
- **Tags:** ui, hotbar, cliente, classList, FIXED, todo, playtest, sessao-58
- **Relacionados:** bug-597, bug-610

## 2026-08-09 — bug-608: mundo DENSO (P/M/G) carrega 2x a 4x mais devagar que o mundo E ENORME: `?bench&tamanho=G` 
- **Sintoma:** mundo DENSO (P/M/G) carrega 2x a 4x mais devagar que o mundo E ENORME: `?bench&tamanho=G` gasta 6.019 e 11.338 ms de carga contra 2.735-2.788 ms do E, com `remeshWorkerMs = 0` nos dois perfis
- **Onde:** `client/src/chunks.ts`
- **Causa:** `buildAll()` (chunks.ts:222) monta o mundo denso inteiro chamando o `remesh()` SINCRONO num triplo laco, entao o pool de 4 workers nunca recebe job — no perfil de mundo G os 2048 chunks saem 100% na main thread (2,06 e 4,03 ms/chunk; worker 0 ms), contra 0,74-0,81 ms/chunk no worker do mundo E. A justificativa escrita em chunks.ts:85-91 ("no perfil do lab foram 0% do custo — 5267 remesh, TODOS pelo caminho fila") esta medida no mundo ERRADO: aquele perfil e de mundo E, onde `mundoLazy` e true e o `buildAll` nunca e chamado (main.ts:1126 so o chama com `!this.mundoLazy`), entao medir aquele caminho ali da 0% por construcao. Em mundo denso ele e 100% do custo de mesh. SEGUNDO defeito, de medicao: `buildAll` marca `this.caminho = "fila"` (chunks.ts:223), o mesmo rotulo do streaming, entao `remeshPorCaminho.fila` mistura os dois e o perfil do mundo G le como custo de streaming num mundo que nem tem streaming (`stream.colunas = 0`).
- **Correção:** FEITO em 2026-08-09. (1) `buildAll` (chunks.ts) ENFILEIRA em vez de chamar o `remesh` sincrono, com a etiqueta `carga: true` viajando na fila e no `JobMesh` — o custo e cobrado na VOLTA do worker, frames depois, entao a etiqueta tem que viajar com o job. (2) Caminho novo `carga` no `porCaminho` (e no tipo do hud), separado do `fila`. (3) main.ts: o mundo denso ganhou um ramo `else` que chama `processarFila` no laco, o `modoCarga` subiu pra fora do `if (mundoLazy)`, e os DOIS `loading.concluir()` imediatos do denso (boot e troca de aula) sairam — quem fecha a tela agora e o portao `filaPendente === 0`, o mesmo do mundo E. (4) `TETO_CHUNKS_POR_FRAME_CARGA = 1024` enquanto `modoCarga`: o teto de 64/frame virava um PISO de frames (2048 chunks nao saem em menos de 32 frames). (5) Orcamento de 50 ms/frame no ramo denso enquanto a tela de carga esta na frente. MEDIDO (headless SwiftShader, dist compilado dos dois lados, `?bench=15&tamanho=G`): main thread 2096,4 -> 443,6 ms (-79%), worker 0 -> 3325 ms; a trava unica virou fila drenada com a tela de carga animando. ATENCAO — o relogio de parede da carga em SwiftShader PIOROU: 5377 -> 10902 ms, porque a fila anda 1x/frame e a 3 fps isso e ruinoso; a 60 fps os ~64 round-trips do pool (32 jobs em voo) custam ~1 s. O A/B que vale e o da maquina real, e ele AINDA NAO FOI FEITO. Efeito colateral consertado no mesmo commit: os 8 scripts de shot sondavam prontidao so por `#hotbar .slot`, que existe ANTES da tela de carga sair — no denso isso passou a medir por baixo da tela (`shots:toque` secao A, 3 falhas). A sonda agora exige tambem `!document.getElementById('load-tela')`. A/B DA MAQUINA REAL (RTX 2060, `?bench&tamanho=G`, dists servidos lado a lado, 1 rodada por lado): mesh na main thread 8.086 -> 596 ms (-93%), worker 0 -> 4.913 ms, **pior travada 9.489 -> 99 ms**, longTasks da carga 10.227 -> 357 ms, carga total 11.190 -> 6.820 ms. As fases passaram a dizer a verdade (`mundo` 9.089 -> 3.208 e `malha` 404 -> 2.250: o buildAll estava sendo contado como worldgen). O rotulo novo confere no JSON: antes `fila:(2048, 8086)`, depois `carga:(2048, 596)` com `fila:(0,0)`. A PIORA DE RELOGIO DE PAREDE DO SWIFTSHADER NAO REPRODUZ na maquina real — 6.820 ms cai DENTRO da faixa do codigo velho (6.019 / 11.190 / 11.338 em tres rodadas), cuja variancia de ~2x segue sem causa identificada. Com 1 amostra por lado o delta de carga total nao esta fixado; o que esta fora de duvida e a main thread e a travada, consistentes em todas as amostras (main velha: 4.227, 4.993, 7.101, 8.086, 8.255 ms; nova: 596).
- **Tags:** performance, mesher, worker, mundo-denso, carga, bench, medicao, FIXED, fix-2026-08-09
- **Relacionados:** bug-607

## 2026-08-08 — bug-607: "estou com pouco fps rodando na maquina de casa" — o mesher ficou 63% mais lento desde 06/
- **Sintoma:** "estou com pouco fps rodando na maquina de casa" — o mesher ficou 63% mais lento desde 06/08 (remesh no worker 2,7 s → 4,4 s numa rodada de ?bench de 15 s)
- **Onde:** `shared/src/blocks.ts`
- **Causa:** `plantaDe` e `plantaPorSelvagem` são VARREDURA LINEAR do array PLANTAS, e o §🍖 F10h (9d4c485) levou PLANTAS de 2 linhas (trigo, algodão) para 8. O preço não é onde a plantação aparece: `swayDoBloco` (mesher.ts:1281) roda para TODO bloco não-ar do chunk — até 4096 por chunk — e chama `ehCruzDeSprite`, que pergunta `isPlantacao(id)` (→ plantaDe, 2→8 iterações) E `isSelvagem(id)` (→ plantaPorSelvagem, 8 iterações, chamada NOVA que substituiu o `id === BlockId.AlgodaoSelvagem` de UMA comparação). De ~3 iterações por bloco de pedra para ~16, vezes ~2650 chunks por rodada.
- **Correção:** FEITO em 2026-08-08. Duas tabelas indexadas por id (PLANTA_POR_ID e PLANTA_POR_SELVAGEM) montadas UMA vez no import a partir de PLANTAS — mesmo molde do BLOCK_TILES do mesher; as duas funções viram `tabela[id] ?? null`. Corrige na RAIZ (todo chamador ganha: mesher, drops, rules, session) e o custo deixa de crescer com planta nova. A/B no dist COMPILADO, 3 rodadas por lado: worker remesh 4356–4573 ms (HEAD antes) → 2491–2579 ms (com o fix), ~6% ABAIXO do baseline 44c6656 pré-06/08 (2658–2748 ms), porque o plantaDe já era varredura de 2. Triângulos +576 (+0,4%, os pés selvagens novos do gen) — esperado, não é regressão.
- **Tags:** performance, mesher, worker, plantas, F10h, regressao, bench, FIXED, fix-2026-08-08

## 2026-08-08 — bug-606: iniciar-servidor.sh ficou pra trás do .bat: numa pasta que NÃO é clone do git ele imprimia
- **Sintoma:** iniciar-servidor.sh ficou pra trás do .bat: numa pasta que NÃO é clone do git ele imprimia "(esta pasta não veio de um clone do git: atualização automática desligada)" e nunca atualizava, e o menu não tinha a opção [9] mundo PROCEDURAL nem o [E] no tamanho
- **Onde:** `iniciar-servidor.sh`
- **Causa:** Os dois launchers são PAR mas evoluíram separados: c2c09c6 (mundo procedural [9] + tamanho P/M/G/E) declarou na própria mensagem ".sh não tocado (pedido: só o .bat)", e 8bfb086 (update por ZIP do GitHub, porque a escola bloqueia git e PowerShell) reescreveu o motor de update SÓ no .bat. Resultado: instalação Linux/macOS sem .git (pacote baixado à mão) ficava SEM caminho nenhum de atualização, e o mundo procedural só existia no Windows.
- **Correção:** FEITO em 2026-08-08. (1) atualizar_pacote(): espelho do caminho do .bat — sha de 40 hex pela API do GitHub (Accept: application/vnd.github.sha), compara com .lj-versao (o MESMO arquivo do .bat), baixa .tar.gz (o tar do GNU não lê zip, o tar.exe do Windows lê — daí a diferença de formato), confere package.json, avisa se o pacote traz mundos/ (padrão NÃO sobrescrever → rm -rf no src antes de copiar), copia com 'cp -R src/. .' (equivale ao robocopy sem /PURGE: nunca apaga mundos/, node_modules/, .env, .ljw solto), grava .lj-versao e roda npm install. (2) Bifurcação por pasta: com .git segue o caminho git/--ff-only de sempre (intacto); sem .git chama atualizar_pacote. (3) Troca do próprio launcher por RENAME: grava .lj-launcher-novo.sh na MESMA pasta e mv por cima — rename só troca o nome e o bash em execução segue lendo o inode velho (escrever por cima do mesmo inode corromperia a rodada; vindo de /tmp o mv viraria cópia por cima). Sem o relançamento de janela do .bat: a rodada atual termina no launcher velho. (4) criar_procedural() + opção [9] no menu; menu de tamanho rotulado com [P/M/G/E] e pulado quando o procedural já fixou LJ_TAMANHO=E. A/B em sandbox isolada: update real aplicado (.lj-versao = origin/main), mundos/turma-a intacto por md5, arquivo solto preservado, 2ª rodada 'Já está na versão mais nova', API de repo inexistente recusada sem sobrescrever .lj-versao, pasta com .git caindo no caminho do git, nenhum temporário deixado.
- **Tags:** launcher, iniciar-servidor, update, paridade-bat-sh, procedural, shell, FIXED, fix-2026-08-08
- **Relacionados:** bug-567

## 2026-08-07 — bug-599: balde de água não funciona no modo sobrevivência — não cria/recolhe água (relatado no play
- **Sintoma:** balde de água não funciona no modo sobrevivência — não cria/recolhe água (relatado no playtest da escola)
- **Onde:** `client/src/main.ts / shared/src/session.ts (gate do item balde no sobrevivência)`
- **Causa:** Bug do CLIENTE: a mira do balde vazio usava `hotbarUi.slotLocal` (paleta criativa local), que em survival não enxerga o balde da mochila do servidor — o raio atravessava a água e o 'recolher' nunca acionava. O handler do servidor (case 'balde') já suportava survival.
- **Correção:** FEITO em 2026-08-07 (SESSÃO 58): o parâmetro do raycast virou `hotbarUi.idNaMao() === ITEM_BALDE_VAZIO` (lê a mochila do servidor quando `mochila.ativa`); o getter `slotLocal` morreu junto. O ciclo encher→despejar voltou a funcionar em survival.
- **Tags:** sobrevivencia, balde, agua, playtest-escola-2026-08-07, FIXED, fix-2026-08-07

## 2026-08-07 — bug-600: remover o botão 'copiar' dos controles do tablet no modo sobrevivência (pedido do playtest
- **Sintoma:** remover o botão 'copiar' dos controles do tablet no modo sobrevivência (pedido do playtest na escola)
- **Onde:** `client/src/touch.ts (botão de copiar/pegar bloco no touch UI)`
- **Causa:** O botão ✋ 'copiar' nascia fixo no touch UI (`touch.ts:211`) mesmo em survival, onde o gesto já é no-op (`main.ts` `if (mochila.ativa) return;`) — botão morto na barra do tablet.
- **Correção:** FEITO em 2026-08-07 (SESSÃO 58): `touch.ts` ganhou `setCopiarDisponivel(disponivel)` que liga/desliga a classe `hidden` do botão; fiado no handler da mensagem `modo` e no boot do GameRuntime (`modoAtual !== 'sobrevivencia'`). Some ao entrar em survival, volta ao sair.
- **Tags:** sobrevivencia, touch, tablet, ui, playtest-escola-2026-08-07, FIXED, fix-2026-08-07

## 2026-08-07 — bug-601: não é possível abrir baú se não estiver com a mão vazia (relatado no playtest da escola)
- **Sintoma:** não é possível abrir baú se não estiver com a mão vazia (relatado no playtest da escola)
- **Onde:** `shared/src/session.ts (use_block / gate de interação com container)`
- **Causa:** Do CLIENTE: no clique direito, os ramos 'comer' e 'balde' retornavam ANTES dos checks de container/interativo — com qualquer item na mão o clique nunca virava `use_block`, e o baú não abria. O servidor nunca teve gate de 'mão ocupada'.
- **Correção:** FEITO em 2026-08-07 (SESSÃO 58): o ramo de comer só dispara se o alvo NÃO for container nem interativo; novo check prioritário (container/interativo → `use_block`) ANTES de balde/quadro/colocar — regra Minecraft (comida na mão + baú = abre o baú). Painel continua abrindo só pela resposta do servidor.
- **Tags:** bau, container, sobrevivencia, playtest-escola-2026-08-07, FIXED, fix-2026-08-07

## 2026-08-07 — bug-602: laje (meio bloco) só coloca na metade de BAIXO do bloco — a metade de cima não sai (relata
- **Sintoma:** laje (meio bloco) só coloca na metade de BAIXO do bloco — a metade de cima não sai (relatado no playtest da escola)
- **Onde:** `shared/src/session.ts (place_block — escolha da metade pela face clicada)`
- **Causa:** NÃO era a colocação (a regra metade-pela-face sempre funcionou, `orientacao.ts`): era RENDER — o mesher cullava a face vertical entre duas lajes do MESMO id empilhadas (`nb === id` no `emitBox`), e a pilha mostrava um buraco por baixo, parecendo que a metade de cima não saía.
- **Correção:** FEITO em 2026-08-07 (SESSÃO 58): `emitBox` ganhou `fundeVertical` (padrão true); lajes/escadas chamam com `false` (duas lajes de mesma metade não encostam — vão de 0,5 — cullar a face do meio deixaria buraco). Teste novo em `cp23.test.ts` (lajes empilhadas do mesmo id não fundem a face vertical).
RE-CONFERIDO em 2026-08-11 (sessão 67) — e ele fechou DOIS itens, não um: o `todo.md` tinha uma linha separada, do MESMO playtest, escrita como "BUG slab: topo do bloco não renderiza a face de baixo — vê-se o buraco por baixo", que é este defeito descrito pelo lado do render em vez do lado da colocação. A linha ficou `[ ]` por 4 dias sem nada a fazer; marcada agora. A/B refeito: trocando `mesher.ts:918` de volta pro `if (nb === id) continue` cru, o teste do cp23 cai com `expected +0 to be 4` (zero faces −Y = o buraco); restaurado, passa.
De quebra a sonda de 2026-08-11 corrigiu uma teoria: a metade de CIMA (`slabTop`, caixa 0.5..1) tem `y0 = 0.5`, logo a face de baixo dela NUNCA é `flush` e nunca passou pelo culling — `LajePedraCima` solta, sobre `Stone` e empilhada emitem os 4 cantos de normal −Y em `y+0.5` mesmo com o fix revertido. Quem aparecia furada era a pilha de metades de BAIXO.
- **Tags:** slab, laje, colocacao, render, culling, playtest-escola-2026-08-07, FIXED, fix-2026-08-07

## 2026-08-07 — bug-603: o comando /confinar está privando TODO o mundo de construir e colocar blocos em todos os l
- **Sintoma:** o comando /confinar está privando TODO o mundo de construir e colocar blocos em todos os lugares; o esperado é que ele apenas ative/desative o sistema de claim. Esse comando substituiu o /claim e a varinha?
- **Onde:** `server/src/commands (confinar/claim) + shared/src/claims.ts`
- **Causa:** `confinamentoAtivo=true` sem grupos/áreas bloqueia TUDO por design (`confinaBloqueia` 'sem grupo, nada'); o professor não entendia que confinamento e claim são DOIS sistemas — o `/confinar` NÃO substitui o `/claim` nem a varinha (sistemas independentes).
- **Correção:** FEITO em 2026-08-07 (SESSÃO 58) — só TEXTO, gate inalterado: `/confinar status` agora explica que é OUTRO sistema do /claim (o claim guarda só as áreas marcadas com a varinha; o confinamento restringe todo o mundo à área do grupo); broadcast do `/claim ligar` avisa a diferença. ⚠️ 'ligar confinamento sem grupos bloqueia tudo' continua INTENCIONAL — decidir na aula se deve exigir área antes de ligar.
- **Tags:** claim, confinar, sobrevivencia, comando, playtest-escola-2026-08-07, FIXED, fix-2026-08-07

## 2026-08-07 — bug-604: barra de oxigênio RESETA ao sair da água; o correto seria regenerar até 100% (relatado no 
- **Sintoma:** barra de oxigênio RESETA ao sair da água; o correto seria regenerar até 100% (relatado no playtest da escola)
- **Onde:** `client/src/physics.ts (handler do nado/sufocamento)`
- **Causa:** `tickFolego` (`sobrevivencia.ts`) fazia RESET INSTANTÂNEO fora d'água (`folego: FOLEGO_TICKS`) — a barra sumia de uma vez em vez de encher. O handler correto é no SERVIDOR, não em `physics.ts` como o buglog supunha.
- **Correção:** FEITO em 2026-08-07 (SESSÃO 58): fora d'água regenera GRADUAL — `FOLEGO_POR_TICK = 8`, cheio em ~1,9 s a 10 Hz; `vitais.ts` só emite quando o nº de bolhas muda (cada bolha volta em ~2 ticks); teste atualizado em `sobrevivencia.test.ts` (regen gradual, topo não transborda).
- **Tags:** agua, oxigenio, nado, sobrevivencia, playtest-escola-2026-08-07, FIXED, fix-2026-08-07

## 2026-08-07 — bug-605: jogador pode ficar SOTERRADO por blocos sólidos e andar livremente por dentro deles (sem s
- **Sintoma:** jogador pode ficar SOTERRADO por blocos sólidos e andar livremente por dentro deles (sem ser empurrado p/ o espaço vago, sem dano, sem morrer) — relatado por análise p/ implementar mecânica de sufocamento
- **Onde:** `shared/src/session/vitais.ts (tickVitais — dano + teleporte) + shared/src/physics.ts (sobrepoeSolidos, acharEspacoVago) + shared/src/session.ts (handler move — rejeita posição soterrada) + shared/src/sobrevivencia.ts (CausaDano sufocamento, tickSufocamento, textoDaMorte) + client/src/main.ts (aviso de morte)`
- **Causa:** Física era client-side e o servidor confiava no move do cliente SEM validação: quando um bloco aparece em cima do jogador (ex.: areia caindo, construíram em cima, tp), ele fica dentro do sólido e continua andando — a colisão é por célula-alvo e o passo não verifica o AABB. O servidor não tinha NENHUM conceito de 'soterrado' nem porta de dano pra sufocamento.
- **Correção:** FEITO em 2026-08-07 (SESSÃO 57). (1) sobrepoeSolidos(world, pos) = collides — define 'soterrado'. (2) acharEspacoVago(world, pos, raio=2): busca por coluna (findSpawnY) da própria → anéis Chebyshev até o raio, coluna cheia até o teto não é vão (inBounds), veto de outros jogadores. (3) tickVitais: soterrado → tickSufocamento (1 coração/s, TICKS_POR_DANO_SUFOCAMENTO=10, DANO_SUFOCAMENTO=2, só sobrevivência) via machucar(…,'sufocamento'); acha vão → teleportar() na hora (o dano para). (4) handler move: posição nova soterrada → tenta vão (raio 2) → teleporta; sem vão → REJEITA o passo (não atualiza pos, sem relay, manda teleport de volta à posição válida atual). (5) morte → textoDaMorte 'X ficou soterrado.' + respawn normal. Testes: 4 puros (tickSufocamento, textoDaMorte) + 3 de sessão (sem vão/dano+morte, com vão/teleporte, criativo sem dano). Testes antigos de session.test.ts atualizados p/ posições válidas (findSpawnY) — y=20 ficava dentro de sólido.
- **Tags:** sufocamento, soterrado, colisao, fisica, sobrevivencia, FIXED, fix-2026-08-07
- **Relacionados:** bug-604

## 2026-08-06 — bug-598: (achado pelo fuzz do bug-596, NÃO relatado e NÃO consertado) o céu na própria célula de fo
- **Sintoma:** (achado pelo fuzz do bug-596, NÃO relatado e NÃO consertado) o céu na própria célula de folha/água vale 15 quando vem do worldgen e 13 quando vem de uma edição
- **Onde:** `shared/src/luz.ts — semearCeuDaColuna vs propagar (canal CÉU)`
- **Causa:** Os dois motores de céu têm modelos diferentes pra bloco que ATENUA (folha e água, opacidade 1). O de coluna (`semearCeuDaColuna`) escreve na célula o nível que CHEGA nela e só desconta a opacidade pra quem está ABAIXO — a folha sob céu aberto fica 15 e o chão embaixo 14. O BFS (`propagar`) cobra `nivel - 1 - op` e a exceção da descida reta exige `op === 0`, então a mesma folha vira 13. As células abaixo coincidem em 14 neste caso porque as colunas vizinhas as acendem de lado; com uma copa larga a divergência se espalha.
- **Correção:** NENHUM, E NÃO VAI TER — FECHADO em 2026-08-11 (sessão 67) por DECISÃO DO USUÁRIO, aceito como comportamento conhecido e tolerado. As razões, escritas pra ninguém reabrir isto por engano: (a) nenhum aluno relatou — quem achou foi o fuzz do bug-596; (b) o efeito é 2 níveis de luz na PRÓPRIA célula de folha/água, e as células abaixo coincidem em 14; (c) as cavernas dependem da regra atual (`descidaReta` só no nível máximo), então mexer no `propagar` mudaria a aparência de TODO mundo já gerado, inclusive os saves da escola.
RE-CONFERIDO antes de fechar, porque o usuário suspeitava que já estivesse consertado: NÃO estava, e a divergência é exatamente a registrada. Sonda com `criarLuz`/`acenderColuna`/`atualizarBloco`, folha em céu aberto: posta ANTES de acender (caminho do worldgen) = 15 com 14 embaixo; a MESMA folha posta DEPOIS por edição (caminho do BFS) = 13 com 14 embaixo. O código também não mudou: `luz.ts:254` segue `const descidaReta = canal === CANAL_CEU && dy === -1 && nivel === LUZ_MAX && op === 0` e `luz.ts:255` segue `nivel - 1 - op`.
SE um dia um aluno relatar copa larga com sombra errada, a investigação começa AQUI e o trabalho é: fazer o `propagar` carregar 'esta luz veio reta do céu' pra ela sobreviver à atenuação, unificando os dois motores — mudança de desenho, com A/B visual em mundo gerado e conferência de caverna antes de soltar. O fuzz do bug-596 continua tirando folha/água da paleta, com a razão escrita no próprio teste.
- **Tags:** luz, canal-ceu, folhas, agua, divergencia-de-motor, FECHADO, wontfix, aceito-pelo-usuario
- **Relacionados:** bug-596

## 2026-08-06 — bug-597: usuário: 'esc fecha todos os menus e vai direto para o menu esc? deveria apenas fechar qua
- **Sintoma:** usuário: 'esc fecha todos os menus e vai direto para o menu esc? deveria apenas fechar qualquer menu aberto e parar por ai'
- **Onde:** `client/src/input.ts + client/src/main.ts (updateOverlay)`
- **Causa:** A causa não está no Esc, está no ponteiro. Fechar um painel chama `input.lock()`, mas o Esc do painel É o Esc do usuário — e o Chrome recusa `requestPointerLock` por ~1,25 s depois dele (a mesma carência do bug-585). O pedido falha, e o `updateOverlay` só olhava `input.active`: 'sem ponteiro travado' era indistinguível de 'o aluno pediu pausa', então o menu de pausa subia. Ele some sozinho quando o retry (1,4 s) pega o lock — o que o aluno vê é o Esc fechando o painel E abrindo o menu de pausa.
- **Correção:** `Input` ganhou `retomando`: verdadeiro enquanto há pedido de lock em andamento ou tentativa atrasada no ar. O `updateOverlay` esconde o menu de pausa nesse vão, e o `pointerlockerror` passou a redesenhar o overlay (senão uma recusa definitiva esconderia o menu pra sempre). De brinde, o `reagendarLock` passou a cumprir o 'uma tentativa e só uma' que o comentário já prometia — sem isso ele se reagendava a cada recusa e `retomando` nunca voltaria a false. Script novo `npm run shots:esc` (desktop, com pointer lock de verdade) com as 3 asserções: Esc no painel fecha só ele · Esc na tela livre abre a pausa · lock recusado de vez devolve a pausa.
- **Tags:** esc, pointer-lock, menu-de-pausa, overlay, relatado-pelo-usuario, shots-esc
- **Relacionados:** bug-585, bug-582

## 2026-08-06 — bug-596: usuário: 'bug de iluminação, depois de colocar a tocha no chão, qualquer bloco quebrado co
- **Sintoma:** usuário: 'bug de iluminação, depois de colocar a tocha no chão, qualquer bloco quebrado continua fazendo sombra, a luz não atualiza'
- **Onde:** `shared/src/luz.ts (atualizarBloco, canal BLOCO)`
- **Causa:** Quebrar um bloco OPACO nunca re-semeava o canal de luz de bloco. A célula era parede, logo tinha nível 0, logo o `apagar` saía na primeira linha (`if (nivel0 <= 0) return`) sem coletar vizinho nenhum; `luzEmitida(Air)` é 0, então nada mais entrava na fila; e `propagar` recebia uma fila VAZIA. A célula ficava em 0 pra sempre e tudo atrás dela seguia escuro. O canal do CÉU já tinha a semeadura dos 6 vizinhos logo abaixo (`if (op < OPACO) for (const [dx,dy,dz] of DIRS) ...`); o canal do bloco não. Só aparece com alguma tocha/fornalha acesa no mundo — sem emissor não há luz de bloco pra faltar, e é por isso que o relato começa em 'depois de colocar a tocha'.
- **Correção:** Espelhado o que o canal do céu já fazia: quando a célula fica transparente (`op < OPACO`), os 6 vizinhos entram como sementes do `propagar` do canal BLOCO. 3 testes novos em luz.test.ts (um caso escrito à mão + dois fuzz de 200 edições que cruzam `atualizarBloco` contra `acenderColuna` célula por célula); A/B: sem a semeadura os 3 caem. Verificado também no cliente real — a parede tapa a tocha (65.7 → 51.4 de luminância) e quebrá-la devolve o valor EXATO de antes (65.7); antes devolvia +0.05.
- **Tags:** luz, tocha, canal-bloco, atualizarBloco, propagacao, relatado-pelo-usuario
- **Relacionados:** bug-598

## 2026-08-06 — bug-595: npm run smoke: '14/15 smokes OK — atividade falhou' (1 em 3 rodadas). Rodado sozinho (`nod
- **Sintoma:** npm run smoke: '14/15 smokes OK — atividade falhou' (1 em 3 rodadas). Rodado sozinho (`node scripts/smoke.mjs atividade`) passa em 3s; a suíte inteira rodada de novo dá 15/15.
- **Onde:** `server/src/cenarios/_smoke-atividade.mjs`
- **Causa:** RESOLVIDO na sessão 66, e a causa não era carga nem tick: era o PRÓPRIO smoke afirmando algo que não garantia. O `/grupo criar` (shared/src/session/equipes.ts:580) monta `alunosOnline` a partir de `[...ses.players.values()]` — ordem de INSERÇÃO do Map, isto é, a ordem em que cada join foi aceito — e distribui em round-robin. O smoke abria os TRÊS WebSocket em paralelo, então a ordem entre ana e bia ficava no ar: quando a bia era aceita primeiro ela virava o grupo 1 e a asserção `ana→g1, bia→g2` caía, levando junto tudo o que vinha depois. Sozinho o smoke fecha em 1-2 s e a corrida quase nunca aparece; dentro da suíte a máquina ocupada embaralha o handshake. O servidor está CERTO — round-robin sobre ordem de chegada é determinístico dada a ordem.
- **Correção:** Duas coisas, e a segunda é a que pagou a conta. (1) `_smoke-atividade.mjs`: os clientes entram UM DE CADA VEZ (`entrar()` espera a 1ª mensagem do host, que só vem depois do registro), e a ordem virou asserção explícita ('a ana (1ª aluna → grupo 1)'); os `espera(ms)` fixos de 700/500/400/300 ms viraram `ateQue(cond, teto)` — espera o FATO, não o relógio. (2) `scripts/smoke.mjs`: o resumo final passou a REPETIR as linhas ✗ de cada smoke que falhou. A saída completa já era impressa antes do resumo, mas a bateria é lida com `| tail`, e o que sobrava na tela era só 'atividade falhou' — foi por isso que este bug ficou desde a sessão 53 sem causa. Com o resumo novo a rodada que falhou disse `[atividade] ✗ ana→g1, bia→g2` e a causa saiu em minutos. Verificação: 4 suítes completas seguidas depois do conserto (a corrida aparecia 1 em 3 antes).
- **Tags:** flaky, smoke, atividade, intermitente, nao-reproduzido, sem-conserto, corrida, ordem-de-join, FIXED, observabilidade
- **Relacionados:** bug-593

## 2026-08-06 — bug-594: (latente, achado no refactor da §🎮 — nenhum sintoma relatado) o relógio do duplo-toque nas
- **Sintoma:** (latente, achado no refactor da §🎮 — nenhum sintoma relatado) o relógio do duplo-toque nascia em 0, e `performance.now()` também começa em 0
- **Onde:** `shared/src/controleJogador.ts (era client/src/main.ts, os `let lastForwardTap`/`lastJumpTap`)`
- **Causa:** `lastForwardTap = 0` e `lastJumpTap = 0` guardavam 'nunca houve toque' com o MESMO valor que o relógio tem no instante da navegação. `performance.now()` conta ms desde o carregamento da página, então `now - 0 < 300` é VERDADE nos primeiros 300 ms: o PRIMEIRO toque no W contaria como duplo-toque e a corrida engataria sozinha (idem o voo no espaço). Na prática nunca disparou porque o jogo só começa depois do menu e da carga do mundo — mas é uma janela real, e ela vira alcançável no dia em que o boot ficar mais rápido ou o `startGame` for chamado direto por automação.
- **Correção:** O sentinela virou `Number.NEGATIVE_INFINITY` no `DuploToque`: `agora - (-Infinity)` é `Infinity`, que nunca cabe na janela. Coberto por 'o PRIMEIRO toque nunca bate — nem no início do relógio'; o A/B com o sentinela de volta em 0 derruba 4 asserções.
- **Tags:** latente, duplo-toque, performance.now, sentinela, refactor, controle
- **Relacionados:** bug-590

## 2026-08-06 — bug-593: npm run shots:f10 (intermitente, 2 em ~8 rodadas): '✗ o painel fechou' · '✗ o título virou
- **Sintoma:** npm run shots:f10 (intermitente, 2 em ~8 rodadas): '✗ o painel fechou' · '✗ o título virou "baú" (fornalha)' · '✗ e ele tem 27 slots (3)' · '✗ sem barrinha nenhuma'
- **Onde:** `client/src/container.ts + shared/src/session.ts (case fechar_container)`
- **Causa:** `ContainerPanel.atualizar` REABRE o painel (`if (!this.isOpen) { isOpen = true; … }`) e a fornalha COZINHANDO manda `container` 10×/s. Entre o clique em 'fechar' e o servidor processar o `fechar_container` cabem mensagens que já estavam no fio — e o `fechar_container` não respondia NADA, então nada as desfazia. O painel voltava ZUMBI: na tela, mas o servidor já o havia esquecido, logo nunca mais atualizava e todo clique nele pedia `mover_container` de um container fechado. Na cena do f10 o efeito é pior do que parece: com a fornalha de volta, a regra 'um menu por vez' (§48) impede o baú de abrir e as três asserções seguintes medem o painel ERRADO — 4 falhas que leem como defeito de container.
- **Correção:** Dois lados. SERVIDOR: `case fechar_container` passou a chamar `fecharContainer(this, clientId)` em vez de só `delete` — ele já mandava `container_fechado`, então nenhuma mensagem nova entrou no protocolo. CLIENTE: `esperandoFechar` liga no `fechar()` e desliga no `fecharSemAvisar()`; enquanto ligado, `atualizar` DESCARTA `container` da MESMA célula. A ordem do TCP faz o resto — tudo que o servidor mandou antes de ver o pedido chega antes da confirmação. Mensagem de OUTRA célula reabre (só pode ter nascido de clique novo) e serve de rede caso o host seja velho e não confirme.
- **Tags:** container, fornalha, corrida, protocolo, zumbi, f10, flaky, tcp
- **Relacionados:** bug-580, bug-591

## 2026-08-06 — bug-591: npm run shots:f10: 'SHOTS /f10 com 4 falha(s)' — ✗ o painel fechou · ✗ o título virou "baú
- **Sintoma:** npm run shots:f10: 'SHOTS /f10 com 4 falha(s)' — ✗ o painel fechou · ✗ o título virou "baú" (fornalha) · ✗ e ele tem 27 slots (3) · ✗ sem barrinha nenhuma (baú não tem fogo)
- **Onde:** `scripts/f10-shot.mjs`
- **Causa:** O script esperava `espera(900)` SECA por um round-trip de servidor: `cont-fechar` manda `fechar_container` e quem fecha o painel é a RESPOSTA do host. Numa máquina carregada (rodei logo depois da suíte de smoke) 900 ms não bastam. O sintoma não parece lentidão nenhuma: o painel da FORNALHA continua aberto, a regra 'um menu por vez' da sessão 48 impede o baú de abrir por cima, e as três asserções da seção 6 medem o painel ERRADO — 4 falhas que leem como defeito de container. Custou uma bissecção com `git stash`, e a primeira tentativa dela deu FALSO NEGATIVO porque o `shots:f10` serve `client/dist` (cliente COMPILADO): stashar o fonte sem rodar `npm run build` mede o binário velho.
- **Correção:** Helper `ateQue(ler, satisfeito, limiteMs = 4000)` sondando a cada 100 ms, nos três round-trips: abrir o painel da fornalha, fechar, e abrir o do baú. Os prints e as asserções não mudaram — só a espera deixou de ser um prazo fixo.
- **Tags:** shots, f10, flaky, teste, timing, servidor, dist, bissec
- **Relacionados:** bug-582

## 2026-08-06 — bug-592: (latente, achado no A/B do refactor — nenhum sintoma relatado) o `shots:luz` cobrava `noit
- **Sintoma:** (latente, achado no A/B do refactor — nenhum sintoma relatado) o `shots:luz` cobrava `noite/dia < 0,75` e o defeito que ele existe pra pegar produz 0,69 — passava
- **Onde:** `scripts/luz-shots.mjs`
- **Causa:** `aplicarBalanco` e `aplicarLuz` enxertam os dois o `onBeforeCompile` do material do terreno; o three guarda UM só e `aplicarLuz` encadeia o que já estiver lá. Na ordem TROCADA (luz antes do balanço) o balanço sobrescreve a luz e o TERRENO deixa de escurecer à noite — sem erro de shader, sem exceção no console. Céu, água e vidro mantêm a luz e continuam escurecendo, então a razão noite/dia não explode: vai de 0,37 pra 0,69, raspando por baixo do 0,75.
- **Correção:** Portão apertado pra `< 0,55` (medidas com a ordem certa nesta máquina: 0,40 · 0,40 · 0,37 · 0,35 · 0,33 · 0,38), com a razão do número escrita no script. Verificado nos DOIS sentidos: ordem trocada agora falha com 0,74; ordem certa passa com 0,33. A regra de ordem ficou escrita no topo do `MateriaisMundo`, com o ponteiro pra qual script a pega.
- **Tags:** shots, luz, shader, onBeforeCompile, three, balanco, limiar, latente, refactor

## 2026-08-06 — bug-590: (latente, achado em refactor — nenhum sintoma relatado) o cliente decidia descartar coluna
- **Sintoma:** (latente, achado em refactor — nenhum sintoma relatado) o cliente decidia descartar coluna com `settings.raioRender + 2`, com a folga DIGITADA, enquanto o servidor usava a constante exportada `FOLGA_DESCARTE`
- **Onde:** `client/src/main.ts (varredura de descarte 1×/s) + shared/src/colunas.ts (novo)`
- **Causa:** O streaming F2 dispensa mensagem de unload justamente porque cliente e servidor descartam pela MESMA regra (raio + folga). A regra estava escrita SEIS vezes — 2× em `shared/src/session/streaming.ts` (enviar e evictar), 2× em `client/src/main.ts` (total da tela de carga e varredura de descarte), 1× em `client/src/colunasFaltando.ts`, e as do cliente com `16` e `+ 2` no lugar de `CHUNK_SIZE` e `FOLGA_DESCARTE`. Enquanto os dois números não mudassem, ninguém veria nada; no dia em que mudassem, o cliente guardaria coluna que o servidor já esqueceu (ou descartaria a que ele ainda tem) e o sintoma seria buraco no mundo, longe do arquivo que se editou.
- **Correção:** Criado `shared/src/colunas.ts` com a geometria do raio num lugar só (`colunaDaPosicao`, `distanciaColunas`, `colunaInteressa`, `colunaKey`/`colunaDeKey`, `contarColunasNoRaio`) e os SEIS pontos religados nele — cliente e servidor. `colunaInteressa` lê o `FOLGA_DESCARTE` do protocolo; `colunaDaPosicao` lê o `CHUNK_SIZE`. 11 testes novos em `colunas.test.ts`, dos quais 4 cruzam o total do cliente com o que o `streamColunas` do servidor realmente manda (centro, dois cantos e uma borda). A/B: com o recorte de borda removido do `contarColunasNoRaio`, 4 asserções caem (canto manda 49 colunas, a fórmula sem recorte diz 169) e o caso do centro segue passando — é a BORDA que o teste mede.
- **Tags:** streaming, colunas, constante-duplicada, cliente-servidor, refactor, shared, latente
- **Relacionados:** bug-211

## 2026-08-06 — bug-585: usuário: 'comandos não serem aceitos e acabam saindo do jogo' — clique em 'voltar ao jogo'
- **Sintoma:** usuário: 'comandos não serem aceitos e acabam saindo do jogo' — clique em 'voltar ao jogo' não devolvia o pointer lock
- **Onde:** `client/src/input.ts`
- **Causa:** O Chrome recusa requestPointerLock por ~1,25 s depois de o USUÁRIO sair do lock com Esc. O retry em `req?.catch(...)` era IMEDIATO, então caía dentro da mesma carência e falhava junto. Sem listener de `pointerlockerror`, as duas falhas eram silenciosas: o overlay ficava na tela e o clique não fazia nada.
- **Correção:** Listener de `pointerlockerror` que reagenda UMA tentativa depois de CARENCIA_ESC_MS (1400 ms). Campo `reagendado` impede pedidos empilhados por cliques repetidos; `pointerlockchange` cancela o reagendamento quando o lock chega por outro caminho. Guarda `touchDevice` continua na frente (aparelho de dedo nunca trava ponteiro).
- **Tags:** pointer-lock, input, chrome, esc, carencia, silencioso, ux
- **Relacionados:** bug-572

## 2026-08-06 — bug-589: `npm run shots:luz` morreu duas vezes no timeout (exit 143 e 124) travado em 't=15s …' / '
- **Sintoma:** `npm run shots:luz` morreu duas vezes no timeout (exit 143 e 124) travado em 't=15s …' / 't=30s …', e com pipe pra `tail` não imprimiu NADA
- **Onde:** `(nenhum — pré-requisito de harness)`
- **Causa:** O `scripts/luz-shots.mjs` sobe só o CHROME e navega pra `http://localhost:5173/?bench=…`: ele NÃO sobe o dev server, ao contrário do `f10-shot.mjs`, do `toque-shot.mjs` e do `amigos-shot.mjs`, que sobem host próprio. Sem o vite no ar ele espera `window.__benchRodando` por 180 s e morre. O silêncio total é o do-not-repeat do stdout bufferizado do node fora de TTY — `| tail` engole tudo quando o processo é morto no meio.
- **Correção:** Subir antes com `nohup npx vite --port 5173 --strictPort client > log 2>&1 &`, conferir a porta com `ss -tln`, rodar o script REDIRECIONANDO pra arquivo (não pra pipe) e matar o vite depois. Registrado no do-not-repeat do cerebrum.
- **Tags:** ferramenta, shots, luz, vite, stdout-buffer, harness
- **Relacionados:** bug-586

## 2026-08-06 — bug-588: orientacao.test.ts, 'tudo que volta pra mão é COLOCÁVEL': "expected false to be true" — se
- **Sintoma:** orientacao.test.ts, 'tudo que volta pra mão é COLOCÁVEL': "expected false to be true" — sem dizer QUAL id falhou
- **Onde:** `shared/src/orientacao.test.ts`
- **Causa:** Usei `BlockId.Terra`, `BlockId.Pedra` e `BlockId.Tabua` — nomes que NÃO existem: o enum é em inglês (`Dirt`, `Stone`, `Planks`). Em TS, `BlockId.Terra` num objeto tipado com `as const` não gera erro de compilação quando o acesso passa por um array de números, então virou `undefined` em runtime e `isPlaceable(undefined)` deu false. O teste falhou pelo motivo errado.
- **Correção:** `BlockId.Dirt` / `BlockId.Stone` / `BlockId.Planks`. Lição: o enum de blocos é MISTO — os ids antigos são em inglês (Stone, Dirt, Planks, Log, Brick) e os novos em português (Fornalha, CadeiraXP, LajePedraBaixo). Conferir o nome no `blocks.ts` antes de escrever, não deduzir pelo idioma dos vizinhos.
- **Tags:** autoria-de-teste, BlockId, nomenclatura, undefined
- **Relacionados:** bug-587

## 2026-08-06 — bug-587: orientacao.test.ts, 5 asserções: "expected 2 to be +0", "expected 88 to be 90", "expected 
- **Sintoma:** orientacao.test.ts, 5 asserções: "expected 2 to be +0", "expected 88 to be 90", "expected 92 to be 94", "expected 96 to be 98", "expected 100 to be 102"
- **Onde:** `shared/src/orientacao.test.ts`
- **Causa:** AUTORIA DE TESTE (família do bug-560/574/575/576): escrevi a tabela `OLHANDO` com o sinal do yaw invertido. A câmera do three olha pra −Z com yaw 0 e o quadrante sai de `dx = -sin(yaw)`, então o yaw CRESCE anti-horário visto de cima: +π/2 olha pra −X, não pra +X. O código sob teste estava certo; a expectativa é que estava errada.
- **Correção:** `OLHANDO = { menosZ: 0, menosX: +π/2, maisZ: π, maisX: -π/2 }`, com a convenção (`dx = -sin(yaw)`) escrita no comentário em vez de deduzida. E o A/B contra o código velho verbatim (30.800 casos, 0 diferenças) é o que prova que o alvo do teste nunca esteve errado — sem ele, a tentação seria 'consertar' a função pra fazer a asserção passar.
- **Tags:** autoria-de-teste, orientacao, yaw, three, quadrante, refactor
- **Relacionados:** bug-576, bug-575, bug-574, bug-560

## 2026-08-06 — bug-586: npx tsc --noEmit em client/: "src/vitals.ts(277,5): error TS2322: Type 'Timeout' is not as
- **Sintoma:** npx tsc --noEmit em client/: "src/vitals.ts(277,5): error TS2322: Type 'Timeout' is not assignable to type 'number'" — erro que NÃO existe
- **Onde:** `(nenhum — falso positivo de ferramenta)`
- **Causa:** O hook do Claude Code reescreve `npx tsc` para `rtk npx tsc`, e o rtk devolveu um resultado CACHEADO de outra rodada. O binário cru (`node_modules/.bin/tsc --noEmit -p client`) sai com exit 0 e nenhuma saída. Perdi tempo investigando um erro inexistente e cheguei a rodar `git stash` pra bissectar.
- **Correção:** Conferir typecheck com `./node_modules/.bin/tsc --noEmit -p <workspace>` (binário direto) ou `npm run typecheck`, nunca com `npx tsc` cru. É a mesma família do do-not-repeat de 2026-07-11 sobre `git status` via rtk.
- **Tags:** rtk, cache, falso-positivo, typecheck, ferramenta

## 2026-08-06 — bug-581: usuário: 'adicionar qualquer planta (selvagem ou cultivada) a regra de precisar bloco de s
- **Sintoma:** usuário: 'adicionar qualquer planta (selvagem ou cultivada) a regra de precisar bloco de suporte' — o algodão ficava flutuando quando cavavam a terra debaixo dele
- **Onde:** `shared/src/rules.ts`
- **Causa:** `precisaApoio` (blocks.ts) e o `rulesMap` (rules.ts) eram DUAS listas do mesmo conjunto. O §🍖 F10c pôs os 5 ids do algodão (Algodao0..3 + AlgodaoSelvagem) no `precisaApoio` e NENHUM no `rulesMap` — e quem derruba o que perdeu apoio é a regra do TICK, não o gate do place. Sem registro, o bloco simplesmente flutua: nada quebra, nada avisa. É o bug-558 (capim, sessão 36) outra vez, na segunda planta. O mandacaru nunca esteve em nenhuma das duas.
- **Correção:** O registro passou a ser DERIVADO: `for (let id=0; id<256; id++) if (precisaApoio(id) && !rulesMap.has(id)) rulesMap.set(id, torchRule)`, substituindo as 4 faixas escritas à mão (tapete, flor, capim, plantação). O mandacaru entrou no `precisaApoio`. Teste-portão novo em rules.test.ts varre 0..MAX_BLOCK_ID e exige `ruleFor(id) === torchRule` pra todo id que responde `precisaApoio`.
- **Tags:** apoio, plantas, algodao, mandacaru, rules, duas-listas, regressao-do-558
- **Relacionados:** bug-558

## 2026-08-06 — bug-582: usuário: 'ao clicar com o botão direito do mouse no baú o submenu abre por conta do mouse 
- **Sintoma:** usuário: 'ao clicar com o botão direito do mouse no baú o submenu abre por conta do mouse não ser mais capturado'
- **Onde:** `client/src/input.ts`
- **Causa:** O `preventDefault` do `contextmenu` estava só no CANVAS — que é exatamente o caso em que ele não é preciso (com pointer lock o navegador nem abre o menu). Abrir um baú SOLTA o ponteiro e o cursor reaparece no meio da tela, em cima do `#container`: o `contextmenu` daquele mesmo clique direito cai no painel, não no canvas, e o menu do navegador abre por cima do baú.
- **Correção:** O listener subiu pro `document`, com isenção para `HTMLInputElement`/`HTMLTextAreaElement` (o chat precisa de copiar/colar do sistema). Vale pra qualquer painel: no jogo, botão direito é COLOCAR bloco.
- **Tags:** contextmenu, pointer-lock, container, bau, ui
- **Relacionados:** bug-572

## 2026-08-06 — bug-583: npm test: 'expected [ { id: 903, qtd: 1 }, …(1) ] to deeply equal …' (4 asserções) e smoke
- **Sintoma:** npm test: 'expected [ { id: 903, qtd: 1 }, …(1) ] to deeply equal …' (4 asserções) e smoke /comida: '✗ e a muda voltou (4)'
- **Onde:** `shared/src/algodao.test.ts`
- **Causa:** Autoria de teste, a família do 560/574/575/577: 4 testes e 1 smoke fixavam `qtd: 1` na semente da colheita, que virou sorteio de 1–3. O smoke é pior: ele roda com o `Math.random` REAL do servidor, então um número fixo reprovaria por sorte numa rodada em cinco.
- **Correção:** Os testes puros injetam as duas PONTAS do sorteio (`() => 0` e `() => 0.99`) e comparam com `SEMENTES_MIN`/`SEMENTES_MAX`, que são exportados; o smoke e o teste de sessão passaram a exigir a FAIXA (3–5 e 4–10), com a conta escrita no comentário.
- **Tags:** teste, sorteio, drops, sementes, faixa-em-vez-de-numero
- **Relacionados:** bug-560, bug-577

## 2026-08-06 — bug-584: receitas.test.ts: 'TypeError: inv is not iterable' em `contar` — `fabricar` devolveu null 
- **Sintoma:** receitas.test.ts: 'TypeError: inv is not iterable' em `contar` — `fabricar` devolveu null com 1 carvão + 1 vegetal pra um custo de 2
- **Onde:** `shared/src/receitas.ts`
- **Causa:** `remover` é TUDO OU NADA: pedir mais do que existe devolve `removido: 0` e o inventário INTACTO. O laço novo do `Ingrediente.ou` pedia `falta` inteiro de cada alternativa, então quando a principal tinha MENOS que o total ela devolvia zero e a soma nunca fechava — a receita parecia impossível com os ingredientes na mão.
- **Correção:** Pedir `Math.min(falta, contar(atual, id))` de cada alternativa. Teste novo cobre exatamente o caso da soma (1 de cada pra um custo de 2).
- **Tags:** receitas, ingrediente-ou, remover, tudo-ou-nada, tocha

## 2026-08-05 — bug-580: shots:f10: '✗ o título virou "baú" (fornalha)' e '✗ e ele tem 27 slots (3)' — o painel abr
- **Sintoma:** shots:f10: '✗ o título virou "baú" (fornalha)' e '✗ e ele tem 27 slots (3)' — o painel abria como FORNALHA em cima de um baú
- **Onde:** `shared/src/session.ts`
- **Causa:** O `applyBlockQuieto` limpava o container da célula só quando o bloco NOVO deixava de ser container (`containerTipoDe(blockId) === null`). Trocar fornalha por baú na MESMA célula (`/bloco` do professor) mantém `containerTipoDe` não-nulo, então o conteúdo da fornalha ficava no mapa por posição — e o `use_block` seguinte respondia com o container guardado (`tipo: "fornalha"`, 3 slots, barra de fogo) por cima de um baú.
- **Correção:** A pergunta passou a ser pelo TIPO, comparando o byte VELHO (`containerTipoDe(getBlock(...))`, lido antes do `setBlock`) com o novo: tipo diferente → apaga o container e fecha o painel de quem o tinha aberto. Fornalha apagada↔acesa continua fora do ramo (mesmo tipo) e container novo nasce sempre limpo.
- **Tags:** fornalha, bau, container, session, f10, meta-por-posicao

## 2026-08-05 — bug-579: _smoke-fornalha: '✗ a célula ficou vazia' — a fornalha esvaziada continuava sem quebrar
- **Sintoma:** _smoke-fornalha: '✗ a célula ficou vazia' — a fornalha esvaziada continuava sem quebrar
- **Onde:** `server/src/cenarios/_smoke-fornalha.mjs`
- **Causa:** O smoke tirava o conteúdo da fornalha mandando pro slot 1 da mochila, que estava OCUPADO. `moverEmArray` com ids diferentes TROCA as duas pilhas — então o pedregulho saía e a picareta entrava na fornalha. Ela continuava com conteúdo e o gate do §🍖 F10 recusava a quebra, com razão.
- **Correção:** Transferir pro slot 26 (o último da mochila, com certeza vazio) e ASSERTAR que a fornalha ficou vazia antes de tentar quebrar. Regra pra smokes futuros: destino de transferência tem de ser slot comprovadamente livre, porque mover pra slot ocupado é troca, não empurrão.
- **Tags:** smoke, containers, inventario, troca-de-slot
- **Relacionados:** bug-577

## 2026-08-05 — bug-578: algodao.test.ts: 'expected null not to be null' — crescerPlantacao devolvia null num cante
- **Sintoma:** algodao.test.ts: 'expected null not to be null' — crescerPlantacao devolvia null num canteiro montado à mão
- **Onde:** `shared/src/algodao.test.ts`
- **Causa:** `createWorld(dims, false)` no teste. O 2º parâmetro NÃO é 'lazy': é `alocar`, e com `false` os chunks não existem — o `setBlock` não grava nada e o `getBlock` devolve 0. O teste montava um canteiro que nunca existiu.
- **Correção:** `createWorld({x:1,z:1,y:1})` (alocar = true, o padrão), com comentário no lugar dizendo que o 2º argumento não é lazy. Vale pra qualquer teste futuro que monte mundo à mão.
- **Tags:** teste, world, createWorld, api-confusa

## 2026-08-05 — bug-577: _smoke-fornalha: '✗ a tábua está no slot de queimar' — o slot de combustível vinha VAZIO l
- **Sintoma:** _smoke-fornalha: '✗ a tábua está no slot de queimar' — o slot de combustível vinha VAZIO logo depois da transferência
- **Onde:** `server/src/cenarios/_smoke-fornalha.mjs`
- **Causa:** Autoria de smoke, a mesma família do bug-560/574/575: a asserção corria contra o TICK. A fornalha acende no primeiro tick em que há entrada E combustível, e a tábua é 1 cozimento exato — 350 ms depois (3 ticks) a única unidade já tinha sido consumida pelo fogo. O comportamento estava certo; a asserção é que media o instante errado.
- **Correção:** A asserção passou a conferir que a tábua SAIU DA MOCHILA (fato estável) em vez de estar no slot; que o fogo pegou é o bloco seguinte que prova. Comentário no lugar explicando por que o slot não é conferido.
- **Tags:** smoke, fornalha, tick, corrida, autoria-de-teste
- **Relacionados:** bug-560, bug-574, bug-575

## 2026-08-05 — bug-576: comida.test.ts: 'expected 3 to be +0' em 3 asserções depois de a cobertura total de receit
- **Sintoma:** comida.test.ts: 'expected 3 to be +0' em 3 asserções depois de a cobertura total de receitas entrar
- **Onde:** `shared/src/comida.test.ts`
- **Causa:** Os testes do pão pegavam a receita por `RECEITAS[RECEITAS.length - 1]` ('o pão é o último, append-only'). Isso confundiu duas coisas: o índice do pão é ESTÁVEL (11), mas ser o ÚLTIMO era acidente da lista de 12. As 97 receitas novas empurraram o pão pro meio e o teste passou a mandar `fabricar` de um GLIFO.
- **Correção:** `RECEITA_PAO = RECEITAS.findIndex(r => r.saida.id === ITEM_PAO)` no topo do arquivo, com uma asserção nova de que ele vale 11 — o contrato do protocolo é o índice fixo, não a posição relativa. Regra: teste NUNCA acha receita por `length - 1`.
- **Tags:** receitas, append-only, indice-de-protocolo, teste, f5, f6

## 2026-08-05 — bug-575: _smoke-pvp: '✗ e a bia voltou com a vida cheia' depois da morte por soco
- **Sintoma:** _smoke-pvp: '✗ e a bia voltou com a vida cheia' depois da morte por soco
- **Onde:** `server/src/cenarios/_smoke-pvp.mjs`
- **Causa:** O laço dava 12 socos com folga de cooldown, mas a morte acontece no 10º. O respawn devolve a vítima AO SPAWN — que no smoke é onde a atacante está —, então os socos 11 e 12 acertavam de novo e a vida medida no fim era 16, não 20.
- **Correção:** O laço PARA assim que aparece uma mensagem de vida com `morreu: true`. Ficou anotado no próprio smoke por que ele para (quem renasce nasce ao alcance).
- **Tags:** smoke, pvp, respawn, autoria-de-teste, f7
- **Relacionados:** bug-574

## 2026-08-05 — bug-574: _smoke-pvp: '✗ 5 socos no mesmo instante tiraram 1 coração só (vida 18)' — a vida NÃO caiu
- **Sintoma:** _smoke-pvp: '✗ 5 socos no mesmo instante tiraram 1 coração só (vida 18)' — a vida NÃO caiu nada, e a asserção passaria pelo motivo errado se o número batesse
- **Onde:** `server/src/cenarios/_smoke-pvp.mjs`
- **Causa:** A asserção do cooldown vinha logo depois do bloco anterior, que já tinha dado um soco há menos de 0,5 s. A rajada inteira caiu DENTRO do cooldown daquele primeiro soco, então zero dano — e o teste mediria 'recusa tudo' em vez de 'aceita um e recusa o resto'.
- **Correção:** `await espera(600)` antes de amostrar `antesRajada`, deixando o cooldown anterior vencer. A asserção passou a exigir exatamente 1 DANO_PVP na rajada de 5.
- **Tags:** smoke, pvp, cooldown, autoria-de-teste, f7
- **Relacionados:** bug-560

## 2026-08-04 — bug-561: _smoke/conferirCorrida: 'a aluna correu a pista inteira e fechou 0 de 4 postos'
- **Sintoma:** _smoke/conferirCorrida: 'a aluna correu a pista inteira e fechou 0 de 4 postos'
- **Onde:** `server/src/cenarios/corrida.ts`
- **Causa:** Os dois corredores da pista eram ABERTOS na ponta -x: o piso começava em x0-4 e não havia parede atrás da largada nem atrás da chegada. Como o mundo é PLANO, dava pra sair do corredor pela ponta, andar pela grama por fora e entrar na chegada — a corrida fechava sem passar por posto nenhum. A BFS do verificador achou exatamente essa rota (por ser a mais curta) e nenhum posto fechou.
- **Correção:** Parede fechando as duas pontas -x (x0-5), altura cheia. Lição do desenho: pista em mundo plano tem de ser um CIRCUITO FECHADO — o mundo em volta é caminho.
- **Tags:** corrida, cenario, verificador, bfs, mundo-plano

## 2026-08-04 — bug-562: posto 3 dava pra driblar: a corrida fechava sem passar por ele
- **Sintoma:** posto 3 dava pra driblar: a corrida fechava sem passar por ele
- **Onde:** `server/src/cenarios/corrida.ts`
- **Causa:** O posto 3 fica na CURVA, onde o corredor vira de +x pra +z. Ele foi desenhado como faixa vertical (x fixo, z variando), igual aos postos 1 e 2 do trecho reto — mas na curva o movimento é em z, então dava pra passar por fora do x dele. Posto que não atravessa a pista de parede a parede não é posto: é decoração.
- **Correção:** Posto 3 virou BANDA de z constante cobrindo a curva inteira em x (xFim-6..xFim). A regra ficou escrita no comentário do `posto()`: um posto tem de atravessar a pista de parede a parede.
- **Tags:** corrida, cenario, objetivo-chegar, curva
- **Relacionados:** bug-561

## 2026-08-04 — bug-563: conferirCorrida: 'quem cai no vão fica PRESO em 33 célula(s) — a primeira é (97, 2, 45)'
- **Sintoma:** conferirCorrida: 'quem cai no vão fica PRESO em 33 célula(s) — a primeira é (97, 2, 45)'
- **Onde:** `server/src/cenarios/corrida.ts`
- **Causa:** Dois erros somados. (1) O vão foi 'cavado' tirando só a camada do PISO, mas o mundo plano é maciço logo abaixo — o buraco tinha 1 de fundura e se subia andando, então a rampa não tinha função e o teste negativo (tirar a rampa) NÃO reprovava: a conferência não provava nada. (2) Cavado de verdade (2 de fundura), apareceu o problema real: a PONTE passa por cima do meio do buraco, e a célula do fundo debaixo dela não tem 2 de ar — o fundo fica partido em duas metades incomunicáveis, e quem caísse do lado sem rampa ficava preso até o professor teleportar.
- **Correção:** Cavar as DUAS camadas (PISO e PISO-1) + rampa espelhada nos dois lados. E a conferência deixou de testar UMA célula do fundo: agora faz uma BFS a partir do posto e exige que TODA célula do fundo esteja no alcance (o passo é simétrico, então uma busca resolve).
- **Tags:** corrida, cenario, verificador, teste-negativo, armadilha
- **Relacionados:** bug-561, bug-562

## 2026-08-04 — bug-558: o capim alto FLUTUA quando o chão some debaixo dele (anotado na sessão 36 sem correção; ac
- **Sintoma:** o capim alto FLUTUA quando o chão some debaixo dele (anotado na sessão 36 sem correção; achado lendo rules.ts pro §🍖 F6)
- **Onde:** `shared/src/rules.ts`
- **Causa:** `precisaApoio()` já listava GramaAlta/Seca/Fria (179-181) desde o §🌬️, e o gate do place_block obedecia — mas os 3 ids NUNCA foram registrados no `rulesMap`. Quem derruba o que perdeu apoio é a regra de vizinhança do tick, não o place: sem entrada no mapa, `ruleFor()` devolve undefined e a célula suja é simplesmente ignorada. Colocar era barrado, continuar existindo não.
- **Correção:** Um `for` de GramaAlta a GramaAltaFria apontando pro `torchRule` no rulesMap (e o mesmo padrão pros 4 ids de plantação do F6). De quebra, o `torchRule` deixou de perguntar `isFullCube` direto e passou a chamar `apoioValido(id, idAbaixo)` — a MESMA função que o place_block usa, pra não existir colocação que evapora no tick seguinte.
- **Tags:** regras, apoio, grama-alta, F6, rulesMap, tick

## 2026-08-04 — bug-559: `/dar ana 904 2` respondia "Não existe item com o id 904" — o professor não conseguia dar 
- **Sintoma:** `/dar ana 904 2` respondia "Não existe item com o id 904" — o professor não conseguia dar comida nenhuma
- **Onde:** `shared/src/session.ts`
- **Causa:** O `runDar` validava `isPlaceable(id) && !isBalde(id)`: a lista de exceções era o BALDE, escrito à mão quando ele era o único item do jogo. Comida entrou na mesma banda ≥900 e caiu fora da exceção — e sem /dar o professor não prepara aula nenhuma de sobrevivência, que era justamente a razão de o comando existir (F4).
- **Correção:** `isItem(id)` novo em blocks.ts: um Set com TODOS os itens que existem (baldes + fruta + trigo + pão), porque a banda ≥900 não é intervalo aberto — id fora da lista é byte inventado. O /dar passou a aceitar `isPlaceable(id) || isItem(id)`, e o portão da tabela de drops usa a mesma função.
- **Tags:** /dar, itens, comida, F6, validacao

## 2026-08-04 — bug-560: _smoke-comida.mjs: '✗ plantou de novo antes de salvar' — a asserção esperava o byte 182 e 
- **Sintoma:** _smoke-comida.mjs: '✗ plantou de novo antes de salvar' — a asserção esperava o byte 182 e a célula tinha 183
- **Onde:** `server/src/cenarios/_smoke-comida.mjs`
- **Causa:** O smoke roda com LJ_CRESCIMENTO=5 (0,5 s por estágio, pra não esperar um minuto pela horta). Entre o `place_block` e a conferência 300 ms depois a muda JÁ tinha crescido pro estágio 1. Bug de autoria do smoke: a asserção era estreita demais pro relógio que o próprio smoke acelerou.
- **Correção:** Conferir a FAIXA (`>= PLANTACAO0 && <= PLANTACAO3`) em vez do byte exato — o que se prova ali é que há horta na célula, não qual a idade dela.
- **Tags:** smoke, F6, plantacao, timing, autoria-de-teste
- **Relacionados:** bug-557

## 2026-08-04 — bug-572: usuário: 'o botão de menu no tablet abre o menu mas fecha sozinho e os comandos do tablet 
- **Sintoma:** usuário: 'o botão de menu no tablet abre o menu mas fecha sozinho e os comandos do tablet somem'
- **Onde:** `client/src/input.ts`
- **Causa:** O ☰ da barra faz `input.touch = false` pra o menu de pausa aparecer (o `updateOverlay` decide por `input.active = locked || touch`). Só que o CLICK do mesmo toque ainda está a caminho: quando ele chega, o `#touch-ui` já está escondido, o hit-test cai no `#overlay` — que é `pointer-events: none` de propósito — e o evento ATRAVESSA até o canvas, cujo handler `canvas.addEventListener('click', () => this.lock())` pede pointer lock. Com `touch` recém-zerado, o guarda `if (this.touch || this.locked) return` não barra mais: o lock é concedido, `input.active` volta a ser true e o `updateOverlay` esconde o menu recém-aberto — deixando a barra escondida junto (`touch` continua false). Resultado: nem menu, nem barra. O `e.preventDefault()` do `tapButton` não salva porque o alvo original saiu do hit-test antes do click.
- **Correção:** Campo `Input.touchDevice` (APARELHO, decidido uma vez no boot com `isTouchDevice()`) separado do `Input.touch` (MODO, que liga e desliga na partida). O `lock()` retorna cedo em `touchDevice`: em tablet não existe pointer lock, nunca. Coberto pelo `scripts/toque-shot.mjs` novo, que CONTA os pedidos de `requestPointerLock` (a concessão é flaky em headless) — A/B: antes pedidos=2 e menu fechado, depois pedidos=0 e menu aberto.
- **Tags:** tablet, toque, menu-de-pausa, pointer-lock, click-through, pointer-events
- **Relacionados:** bug-570

## 2026-08-04 — bug-573: usuário: 'a tela de crafting no tablet reseta a rolagem depois de clicar em um item para c
- **Sintoma:** usuário: 'a tela de crafting no tablet reseta a rolagem depois de clicar em um item para craftar'
- **Onde:** `client/src/inventory.ts`
- **Causa:** Fabricar muda a mochila; a mochila nova dispara `refresh()` → `render()` → `renderMochila()`, que faz `root.replaceChildren()` e chama `renderCraft()`. A `.craft-lista` (quem tem `overflow-y: auto`) é um elemento NOVO a cada vez, então o `scrollTop` morre com o antigo e a lista volta ao topo. Doía por clique, porque quem fabrica costuma repetir a mesma receita.
- **Correção:** `scrollCraft` guarda a rolagem (como `filtroCraft` e `subaba` já sobreviviam aos re-renders), alimentado por um listener de `scroll` na lista; `listaCraft` guarda a lista da vez e a restauração acontece DEPOIS do `root.append` — `scrollTop` em elemento fora do DOM não tem efeito. Filtrar zera de propósito (lista nova se lê do começo). A/B no `shots:toque`: antes 324 → 0, depois 324 → 324.
- **Tags:** tablet, craft, rolagem, re-render, scrolltop, inventario

## 2026-08-04 — bug-571: teste do iniciar-servidor.bat: o cenário 'sobrescrever os mundos? -> s' passou CANCELANDO 
- **Sintoma:** teste do iniciar-servidor.bat: o cenário 'sobrescrever os mundos? -> s' passou CANCELANDO a atualização — a resposta 's' nunca chegou no `set /p`
- **Onde:** `scratchpad/testar-update-bat.sh (harness de teste, não o produto)`
- **Causa:** `chcp 65001` (1ª linha do .bat) quebra o `set /p` do cmd.exe quando o stdin é ARQUIVO REDIRECIONADO (`bat < resp.txt`): a variável fica VAZIA. Como vazio é o padrão de toda pergunta do script, os 4 cenários pareciam verdes — mas só exercitavam os padrões, e o único cenário com resposta não-vazia falhou em silêncio. Depois, `(echo s&echo.)` por pipe entregou "s " COM ESPAÇO e nenhum `if /i "%VAR%"=="s"` casou.
- **Correção:** Respostas por PIPE de um .cmd (`call resp.cmd | iniciar-servidor.bat`), com um `echo` por linha — lê certo mesmo com chcp 65001 e sem espaço parasita. Provado com mini-repro A/B/C isolando o chcp.
- **Tags:** windows, cmd, chcp, set-p, teste, falso-positivo, iniciar-servidor
- **Relacionados:** bug-567, bug-569

## 2026-08-04 — bug-570: tablet-shots: 'botões da barra ✗ menor alvo 30px (5 elementos)' — a barra do topo do toque
- **Sintoma:** tablet-shots: 'botões da barra ✗ menor alvo 30px (5 elementos)' — a barra do topo do toque está abaixo do piso de 40px
- **Onde:** `client/src/touch.ts`
- **Causa:** `#touch-topo .touch-btn` sobrescreve o quadrado de 64px do `.touch-btn` por `width: auto; height: auto; padding: 6px 12px`, e o resultado em 1024×600 são 30px de altura. Ninguém tinha medido: a barra do topo nunca entrou no `tablet-shots.mjs` (as medições cobriam hotbar, chat, inventário e painéis), então o alvo pequeno atravessou a 1ª e a 2ª rodada mobile inteiras.
- **Correção:** `min-height: 40px` na regra do `#touch-topo .touch-btn` (a barra segue sendo linha de ícone + texto, só não desce do piso), e a barra ENTROU no tablet-shots: rótulos visíveis, alvo mínimo, largura contra a janela e o relabel de ⛏/▣ quando a varinha liga.
- **Tags:** mobile, toque, alvo-de-dedo, css, 1024x600
- **Relacionados:** bug-565

## 2026-08-04 — bug-568: clicar em 'convidar' no painel de amigos não mudava nada na tela (o grupo nasce nesse inst
- **Sintoma:** clicar em 'convidar' no painel de amigos não mudava nada na tela (o grupo nasce nesse instante, mas o feed `friends` não voltava pra quem convidou)
- **Onde:** `shared/src/session.ts`
- **Causa:** `runAmigos case convidar` só chamava `sendFriends(idAlvo)` — o CONVIDADO recebia o feed novo, quem convidou não. Só que é ali que `this.amigos.set(me, membros)` CRIA o time (com o autor dentro), então o estado de quem convidou muda e ele nunca ficava sabendo. Mesma lacuna em `recusar` (o autor do convite continuava esperando) e em `aceitar` (os OUTROS que tinham convidado a mesma pessoa não eram avisados do descarte). Com o comando de chat ninguém notava, porque a resposta textual bastava; com PAINEL, o botão parecia não funcionar.
- **Correção:** `sendFriends(clientId)` no fim do `convidar`; em `recusar`, chat + `sendFriends` pro dono do convite; em `aceitar`, `sendFriends` pra cada convite descartado. E campo novo `enviados: string[]` na mensagem `friends` (convites que EU mandei, varrendo `convitesAmigo`), parseado com tolerância — host antigo não manda e vira lista vazia.
- **Tags:** amigos, protocolo, painel, cp24, friends, ui

## 2026-08-04 — bug-569: amigos-shot: '✓ a dona pode expulsar quem entrou' passou com o grupo VAZIO (1/6) — asserçã
- **Sintoma:** amigos-shot: '✓ a dona pode expulsar quem entrou' passou com o grupo VAZIO (1/6) — asserção verde sobre estado errado
- **Onde:** `scripts/amigos-shot.mjs`
- **Causa:** Duas medições mentiram ao mesmo tempo. (1) `innerText.includes('expulsar')` casava com a DICA do rodapé do painel ('pelo chat também dá: … /amigos expulsar nome'), que cita todos os subcomandos — a asserção passaria com o painel inteiro vazio. (2) o clique era por RÓTULO ('convidar'), e como a lista é ordenada por nome o primeiro botão era o da bia, não o do caio: o script convidou a pessoa errada e depois o `aceitar` do caio foi recusado.
- **Correção:** Asserção sobre os RÓTULOS DOS BOTÕES (`[...querySelectorAll('#amigos button')].map(b => b.textContent)`), nunca sobre o texto do painel, que contém a dica; e clique por LINHA (`.jog-row` cujo `.jog-nome` começa com o nome) em vez de por rótulo. De quebra: a bia convidava a ana ANTES de a ana entrar, e o servidor recusa convite a quem nunca esteve na aula (`nomeConhecido`) — o convite tem de sair depois do join.
- **Tags:** verificacao, headless, falso-positivo, amigos, cdp
- **Relacionados:** bug-565, bug-566

## 2026-08-04 — bug-564: npx -y @puppeteer/browsers install chrome@stable: 'DefaultProvider: Extraction failed: no 
- **Sintoma:** npx -y @puppeteer/browsers install chrome@stable: 'DefaultProvider: Extraction failed: no zip archiver is available. Install `unzip`' — e o npx ainda SAI COM CÓDIGO 0
- **Onde:** `scripts/tablet-shots.mjs (acharChrome)`
- **Causa:** O notebook não tem `unzip`. O instalador BAIXA os ~190 MB e falha só na extração, então o cache `~/.cache/puppeteer/chrome` fica vazio e o erro some atrás do exit 0 do npx. Foi por isso que as sessões 39 e 40 concluíram 'o chrome não instala nesta máquina' — a receita do TODO estava certa e mesmo assim não funcionava.
- **Correção:** Sem sudo: baixar o zip do chrome-for-testing pela URL do last-known-good-versions-with-downloads.json e extrair com `python3 -m zipfile -e`. Duas pegadinhas: (1) o zipfile do python NÃO preserva o bit de execução — precisa `chmod +x` em TODOS os binários da pasta, não só no `chrome` (sem o `chrome_crashpad_handler` executável o processo aborta com 'posix_spawn ... Permission denied'); (2) as libs de sistema (libnss3, libnspr4, libasound2t64) saem com `apt-get download` (não exige root) + `dpkg-deb -x` num prefixo local + LD_LIBRARY_PATH.
- **Tags:** chrome, puppeteer, headless, wsl, tooling, shots

## 2026-08-04 — bug-565: tablet-shots: 'linhas que quebram 4 de 19' APÓS o fix que deveria reduzir a quebra (era 2 
- **Sintoma:** tablet-shots: 'linhas que quebram 4 de 19' APÓS o fix que deveria reduzir a quebra (era 2 de 20)
- **Onde:** `scripts/tablet-shots.mjs`
- **Causa:** O detector comparava o `top` dos filhos da `.painel-row` com tolerância de 4px. A `.painel-row` tem `align-items: center`: assim que o fix subiu os selects de 28px para 40px ao lado de rótulos de 24px, os topos passaram a divergir SEM ter havido quebra de linha. O número piorou por causa da medida, não do layout.
- **Correção:** Medir ALTURA, não topo: linha que coube numa faixa só tem a altura do seu filho mais alto (`row.height > maiorFilho + 6` = quebrou). Com o detector correto o A/B honesto deu 4 → 3.
- **Tags:** mobile, css, medicao, falso-positivo, tablet-shots

## 2026-08-04 — bug-566: Verificação da culagem de wireframe passava IGUAL com e sem o patch (controle negativo vaz
- **Sintoma:** Verificação da culagem de wireframe passava IGUAL com e sem o patch (controle negativo vazio) — duas vezes, por duas causas diferentes
- **Onde:** `client/src/regions.ts`
- **Causa:** (1) A região 'longe' foi criada em (200,40,200) num mundo P, que é 128×128 — o comando falhou e a região nunca existiu. (2) Corrigido para dentro dos limites, ainda empatava: mundo P é DENSO, e a chamada de culagem mora dentro do `if (mundoLazy)` do loop (de propósito — só o procedural descarta coluna). De quebra: o three.js já corta por frustum, então área longe fora do campo de visão nunca custou draw call, e o teste precisa de área nas 4 direções pra garantir uma na tela.
- **Correção:** Testar em mundo E (lazy) com `raioRender` baixado pra 2 no localStorage `lj-config` ANTES de entrar, e 4 áreas a 60 blocos nas 4 direções. A/B então mostrou o que devia: sem o patch as 4 somam +1 draw call, com o patch somam 0, e a área perto continua desenhando.
- **Tags:** render, culling, verificacao, controle-negativo, three.js

## 2026-08-04 — bug-567: usuário: 'está aparecendo uma mensagem que a atualização não está sendo buscada' ao inicia
- **Sintoma:** usuário: 'está aparecendo uma mensagem que a atualização não está sendo buscada' ao iniciar o servidor — (há mudanças locais no código desta pasta — atualização pulada para não perder nada)
- **Onde:** `iniciar-servidor.sh, iniciar-servidor.bat`
- **Causa:** O guarda de sujeira (git status --porcelain --untracked-files=no) roda ANTES do git fetch e pula a atualização inteira quando qualquer arquivo RASTREADO está modificado. Nesta máquina o diário do OpenWolf (.wolf/memory.md) é rastreado e o hook escreve nele em toda sessão, então o guarda dispara sempre. O guarda está correto (protege o código); o defeito era a mensagem não dizer QUAIS arquivos sujaram, o que tornava o skip indiagnosticável.
- **Correção:** A mensagem passou a listar os arquivos sujos (até 10, depois '... e mais (são N no total)') + linha dizendo como voltar a atualizar. Nos dois scripts. NÃO excluí .wolf/ do teste: commits docs(wolf) tocam memory.md quase toda sessão, então o merge --ff-only recusaria depois e o aviso sairia com a razão errada. Verificado: bash -n + execução real com stub de npm (5 arquivos listados); bloco do .bat rodado no cmd.exe de verdade nos dois ramos (3 e 13 arquivos).
- **Tags:** iniciar-servidor, git, update, ux, openwolf, bat, bash

## 2026-08-03 — bug-557: _smoke-craft.mjs: '✗ o balde encheu (0 cheio)' — a ana não conseguia RECOLHER água numa fo
- **Sintoma:** _smoke-craft.mjs: '✗ o balde encheu (0 cheio)' — a ana não conseguia RECOLHER água numa fonte que o smoke tentou criar com /bloco
- **Onde:** `server/src/cenarios/_smoke-craft.mjs`
- **Causa:** O smoke criava a fonte com `/bloco x y z 129` (id da água), mas a água NÃO é isPlaceable (saiu da hotbar de propósito — só entra por balde), então o /bloco foi recusado calado e não havia fonte pra recolher; as asserções do balde caíram em cascata. Bug de AUTORIA do smoke, não do código de produção do F5.
- **Correção:** Criar a fonte com o balde do PROFESSOR em criativo: `{type:'balde', ...cel, encher:false}` — o servidor não exige item na mão em criativo. Asserção nova conferindo a fonte antes de recolher.
- **Tags:** smoke, balde, agua, craft, F5, autoria-de-teste

## 2026-08-03 — bug-554: ⚠️ OpenWolf end-of-turn reminders: • ACTION REQUIRED: N files were modified this session b
- **Sintoma:** ⚠️ OpenWolf end-of-turn reminders: • ACTION REQUIRED: N files were modified this session but no semantic summary was written to memory.md
- **Onde:** `.wolf/hooks/shared.js`
- **Causa:** countSemanticEntries comparava DATA. A versao instalada exigia o prefixo '| YYYY-MM-DD' em linhas do memory.md, mas o formato que o proprio aviso pede e '| HH:MM |' — nenhuma linha casava, contagem sempre 0. A versao do PR #64 (que existe em dist/hooks/ do pacote mas nao chega ao projeto) troca isso por 'linha dentro do bloco ## Session: <hoje>', e fura na virada da meia-noite UTC: o header e gravado no INICIO da sessao e mistura data UTC com hora LOCAL, entao sessao que atravessa o dia fica com a data de ontem e a contagem volta a 0.
- **Correção:** Contar as linhas semanticas abaixo do ULTIMO header '## Session:', sem comparar data nenhuma (session-start.js grava exatamente um header por sessao nova, e nenhum em compact/resume). Linhas mecanicas (Created/Edited/Session end:/designqc:) continuam nao contando. Fallback para o prefixo de data so quando o diario nao tem header algum.
- **Tags:** openwolf, hooks, stop, memory.md, falso-positivo, timezone, meia-noite
- **Relacionados:** bug-555, bug-556

## 2026-08-03 — bug-555: ACTION REQUIRED: Files edited 3+ times this session (x.ts) but buglog.json was not updated
- **Sintoma:** ACTION REQUIRED: Files edited 3+ times this session (x.ts) but buglog.json was not updated — com os bugs JA logados
- **Onde:** `.wolf/hooks/stop.js`
- **Causa:** checkForMissingBugLogs procurava 'buglog.json' em session.files_written, lista alimentada so pelo hook PostToolUse de Write/Edit/MultiEdit. Os 5 bugs da sessao 36 (549-553) foram gravados por python3 via Bash — invisivel para o hook, entao o aviso repetia a cada stop.
- **Correção:** Nova buglogTouchedSince(wolfDir, session.started): aceita tambem o mtime de .wolf/buglog.json posterior ao inicio da sessao, qualquer que seja a ferramenta que escreveu. A lista de files_written continua valendo como primeiro teste.
- **Tags:** openwolf, hooks, stop, buglog, falso-positivo, mtime
- **Relacionados:** bug-554, bug-556

## 2026-08-03 — bug-556: 9 copias identicas de '| 00:35 | Session end: 73 writes across 18 files (...) | 12 reads |
- **Sintoma:** 9 copias identicas de '| 00:35 | Session end: 73 writes across 18 files (...) | 12 reads | ~128521 tok |' no .wolf/memory.md
- **Onde:** `.wolf/hooks/stop.js`
- **Causa:** O hook de stop roda a cada fim de turno e da appendMarkdown da linha de encerramento com contadores CUMULATIVOS da sessao. Turno que termina sem trabalho novo (o que os bugs 554/555 provocavam, ao fazer o turno acabar em conserto de aviso) grava a MESMA linha outra vez.
- **Correção:** Guardar o resumo na _session.json (session_end_summary) e so gravar quando ele muda; e upsertSessionEndLine() sobrescreve a linha de encerramento quando ela e a ultima linha nao-vazia do arquivo, em vez de empilhar outra. Se o modelo escreveu algo depois dela, a nova e acrescentada — historico preservado. As 41 copias ja gravadas foram colapsadas.
- **Tags:** openwolf, hooks, stop, memory.md, ruido, idempotencia
- **Relacionados:** bug-554, bug-555

## 2026-08-03 — bug-551: AssertionError: expected +0 to be 2 — o teste do §🍖 F3 'editar bloco tambem cansa' quebrou
- **Sintoma:** AssertionError: expected +0 to be 2 — o teste do §🍖 F3 'editar bloco tambem cansa' quebrou sem ninguem tocar no F3: ele COLOCAVA uma pedra em sobrevivencia pra provar o esforco, e o F4 passou a exigir a pedra na mochila.
- **Onde:** `shared/src/sobrevivencia.test.ts`
- **Causa:** Nao e defeito de codigo: e o teste do F3 encostado numa regra que so nasceu no F4 (colocar GASTA). Um teste de esforco nao deveria depender de ter item — qualquer edicao serve.
- **Correção:** O teste passou a QUEBRAR em vez de colocar (a cobranca de esforco e a mesma pros dois), com o alvo materializado antes pelo `/bloco` do professor, que e teleoperacao e nao cansa ninguem. ⚠️ 1a tentativa ainda falhou: o `/bloco` e a quebra caiam no MESMO tick e na MESMA celula, o que expos o bug-549.
- **Tags:** teste, fome, inventario, F3, F4, acoplamento, sobrevivencia
- **Relacionados:** bug-549

## 2026-08-03 — bug-552: (no proprio smoke novo) '✗ a mochila da ana encheu de areia' e '✗ o bloco FICOU no mundo (
- **Sintoma:** (no proprio smoke novo) '✗ a mochila da ana encheu de areia' e '✗ o bloco FICOU no mundo (a quebra foi recusada)' — o cenario de mochila cheia nao enchia a mochila.
- **Onde:** `server/src/cenarios/_smoke-inventario.mjs`
- **Causa:** O smoke dava 27x64 de AREIA numa mochila que ja tinha duas pilhas PARCIAIS (pedregulho 3, terra 1). Areia so entra em slot vazio ou em pilha de areia, entao coube 25x64 e as duas parciais seguiram com espaco — e o drop da pedra era justamente PEDREGULHO, que ainda cabia. A quebra foi aceita, corretamente.
- **Correção:** Encher os 25 slots vazios de areia MAIS completar as duas pilhas parciais ate o teto, e conferir a soma total == INV_SLOTS*STACK_MAX antes de tentar quebrar. Licao: 'mochila cheia' e por PILHA e por ID, nao por slot.
- **Tags:** smoke, inventario, teste, mochila-cheia, F4, stack

## 2026-08-03 — bug-553: `?mochila=3x64,...` nao aparecia: o print headless saiu com a hotbar de CRIATIVO ('grama12
- **Sintoma:** `?mochila=3x64,...` nao aparecia: o print headless saiu com a hotbar de CRIATIVO ('grama123456789') em vez da mochila forcada.
- **Onde:** `client/src/mochila.ts`
- **Causa:** O `?mochila=` enchia a mochila no boot, mas TODO join recebe uma mensagem `modo` (o envio incondicional do F1, familia do bug-518) e, sendo o mundo do ?bench criativo, o handler chamava `mochila.desligar()` e apagava tudo antes do print.
- **Correção:** Metodo `travar(slots)` novo: o `?mochila=` tranca o conteudo e `aplicar`/`desligar` viram no-op — mesma disciplina do `?vida=` (que vence o sync da vida) e do `?hora=` (que vence o do ceu). Parametro de inspecao tem de VENCER a rede, senao ele so funciona no mundo em que ja funcionaria.
- **Tags:** cliente, inspecao, url, mochila, F4, headless, print

## 2026-08-03 — bug-549: (pego escrevendo o teste do §🍖 F4) o detector 'o mundo mudou por causa desta mensagem?' er
- **Sintoma:** (pego escrevendo o teste do §🍖 F4) o detector 'o mundo mudou por causa desta mensagem?' era `changedThisTick.size > antes` — um CONJUNTO de coordenadas. Quebrar e recolocar a MESMA célula no mesmo tick de 100 ms não aumentava o tamanho, então a colocação saía DE GRAÇA: bloco infinito por clique rápido, e o esforço do F3 também deixava de ser cobrado.
- **Onde:** `shared/src/session.ts`
- **Causa:** O F3 reusou `changedThisTick` (que existe pra impedir a célula mudar 2x no mesmo tick) como se fosse contador de edições. Set dedupe por coordenada: 2 escritas na mesma célula = 1 elemento. O F4 herdou o mesmo detector pro DÉBITO do inventário, e aí virou duplicação de item.
- **Correção:** Contador monotônico novo `edicoesAplicadas`, incrementado dentro do `applyBlockQuieto` (o ponto único onde o mundo é escrito). `mudancasAntes`/`mundoMudou` no `handleMessage` passaram a comparar o contador, não o tamanho do Set. Teste de regressão: 'quebrar e recolocar a MESMA célula no mesmo tick não duplica bloco'.
- **Tags:** inventario, duplicacao, session, tick, changedThisTick, F4, F3, exploit

## 2026-08-03 — bug-550: (no print headless) a grade de 18 slots da mochila virou tiras verticais de ~5 px em vez d
- **Sintoma:** (no print headless) a grade de 18 slots da mochila virou tiras verticais de ~5 px em vez de 9 colunas de ~48 px.
- **Onde:** `client/index.html`
- **Causa:** `grid-template-columns: repeat(9, minmax(0, 1fr))` com `max-width` + `margin: 0 auto` dentro do painel flex-column: sem largura explícita o contêiner foi dimensionado pelo CONTEÚDO, e faixa `1fr` de conteúdo vazio mede zero. A versão anterior escapava por acaso porque usava `minmax(48px, 1fr)`, que tem piso.
- **Correção:** `width: 100%` junto do `max-width: 470px`. Comentário no CSS explicando por que a largura explícita é obrigatória aqui.
- **Tags:** css, grid, mochila, inventario, layout, F4, headless

## 2026-08-02 — bug-548: AssertionError: expected undefined to be 19 — teste do §🍖 F3 'a fome FAMINTA vai pro save'
- **Sintoma:** AssertionError: expected undefined to be 19 — teste do §🍖 F3 'a fome FAMINTA vai pro save' apos andar EXATAMENTE 400 blocos (a regua diz 400 blocos = 1 ponto de fome)
- **Onde:** `shared/src/sobrevivencia.test.ts`
- **Causa:** acumulacao de ponto flutuante: o dreno soma EXAUSTAO_POR_BLOCO_ANDADO (0.01) uma vez por amostra de `move`, e 400 somas de 0.01 dao 3.9999999999999587 — um fio ABAIXO do limiar de 4.0, entao nenhum ponto de fome era gasto. A regua '400 blocos = 1 ponto' e exata na aritmetica real e inexata em double. O teste vizinho passava por acidente: ele chamava andar() duas vezes, e a 1a amostra da 2a chamada e um passo a mais.
- **Correção:** teste passou a andar 410 blocos (com folga, comentando o porque). O CODIGO nao mudou: errar pra menos no limiar e inofensivo (o proximo passo fecha a conta) e consertar com epsilon ou inteiros custaria mais que vale. Licao: teste de limiar acumulado por soma de fracao NAO deve sentar na fronteira exata.
- **Tags:** float, teste, fome, sobrevivencia, limiar, F3

## 2026-08-02 — bug-547: smoke `modo` passou na 1a rodada e FALHOU na 2a, sem nenhuma mudanca de codigo entre as du
- **Sintoma:** smoke `modo` passou na 1a rodada e FALHOU na 2a, sem nenhuma mudanca de codigo entre as duas: '✗ bia entrou em criativo' e '✗ professor liga a regra pvp'
- **Onde:** `scripts/smoke.mjs`
- **Causa:** LJ_NOVO=1 nao RECRIA mundo existente — ele so AUTORIZA criar onde nao ha arquivo (server/src/index.ts so consulta a env quando o LJ_SAVE aponta pra caminho inexistente). O smoke do §🍖 F1 ESCREVE estado persistente no .ljw (modo sobrevivencia + ajuste pessoal da ana + regra pvp ligada), entao a 2a rodada nascia com o mundo da 1a: bia ja entrava em sobrevivencia e o /regra pvp ligar respondia 'ja estava ligada'. Diagnostico pela ASSIMETRIA: ana passava e bia falhava, que e exatamente o estado final da rodada anterior.
- **Correção:** campo `limpar: [pastas]` novo no manifesto do scripts/smoke.mjs — apaga as pastas de mundo (rmSync recursive) ANTES de subir os servidores. Aplicado so ao smoke `modo` (mundos P, barato); mundos E ficam de fora de proposito, porque regenerar cada um custa dezenas de segundos e eles nao guardam estado que o smoke leia. Rodado 2x seguidas pra provar a idempotencia.
- **Tags:** smoke, flaky, estado-persistente, LJ_NOVO, save, sobrevivencia, §🍖
- **Relacionados:** bug-545

## 2026-07-30 — bug-546: (falso NEGATIVO na minha propria instrumentacao) script de medicao acusou worldgen a 0,02 
- **Sintoma:** (falso NEGATIVO na minha propria instrumentacao) script de medicao acusou worldgen a 0,02 ms/coluna e a cena do ?bench com 0 triangulos — os dois impossiveis
- **Onde:** `scratchpad/relevo-medir.mts (receita, ver cerebrum)`
- **Causa:** `createWorld(dims)` ALOCA todos os chunks por default (`alocar = true`). Com tudo alocado, `colunaGerada` responde true e `gerarColunaDeChunks` sai na primeira linha — o mundo fica vazio e o cronometro mede o early return. Mundo lazy de verdade exige `createWorld(dims, false)`.
- **Correção:** `createWorld(DIMS_E, false)` nos scripts de medicao. Depois disso a medicao ficou coerente: 549 chunks com malha e 647 858 triangulos na cena do ?bench. Regra geral: numero de medicao 100x melhor que o esperado e defeito de medicao, nao vitoria.
- **Tags:** medicao, falso-negativo, mundo-lazy, createWorld, instrumentacao, worldgen
- **Relacionados:** bug-540

## 2026-07-30 — bug-545: `npm test` virou sorteio: uma rodada 5 falhas, a seguinte 18, todas 'Test timed out in 500
- **Sintoma:** `npm test` virou sorteio: uma rodada 5 falhas, a seguinte 18, todas 'Test timed out in 5000ms' e espalhadas por arquivos que nao tocam terreno (protocol.test, save.test, mesher.test, water.test, scenario.test)
- **Onde:** `shared/vitest.config.ts`
- **Causa:** o /shared nunca teve vitest.config. No default o vitest abre um fork por nucleo (24 nesta maquina) e a maioria destes testes GERA MUNDO (128^3 = 2 a 4,5 MB de Uint8Array + worldgen por coluna). 24 forks fazendo isso ao mesmo tempo numa VM de WSL estouram o testTimeout de 5 s sem nenhum defeito de codigo. Provado com controle: a MESMA varredura do MESMO codigo HEAD, medida duas vezes no mesmo processo, levou 591 ms e depois 1512 ms (2,6x).
- **Correção:** criado `shared/vitest.config.ts` com `maxWorkers: 8` e `testTimeout: 20000`, com o porque no comentario. 392/392 verde E a rodada caiu de 92 s para 37 s de parede — menos forks e mais rapido. Gate de desempenho continua sendo o ?bench, nao o vitest.
- **Tags:** vitest, flaky, timeout, testes, wsl, paralelismo, gate

## 2026-07-30 — bug-544: (pego na medicao, antes de ir pro cliente) o relevo por bioma reabriu o penhasco de fronte
- **Sintoma:** (pego na medicao, antes de ir pro cliente) o relevo por bioma reabriu o penhasco de fronteira que o heightmap global evitava: degrau de 14 a 23 blocos entre colunas VIZINHAS, contra 4 a 6 do heightmap global nas mesmas seeds
- **Onde:** `shared/src/biomas.ts`
- **Causa:** o fator de NUCLEO (`rampa(dominante, 0.55, 0.92)`) multiplica o gradiente do campo de clima pela amplitude da serra (ate 88 blocos). A rampa de 0,37 de largura em unidades de dominancia, sobre um clima cuja celula e ~80 blocos, da d(relevo)/dx ~0,57 por bloco — vezes 88 = penhasco. A rampa de pertinencia (RAMPA=0,1) somava mais gradiente pelo mesmo mecanismo. Nenhum teste pegava porque o portao de fronteira nao existia ainda.
- **Correção:** RAMPA 0,1 -> 0,25 e NUCLEO (0,55;0,92) -> (0,4;1,0), os dois escolhidos por SWEEP medido (10 formulacoes x 5 seeds x 400x400 colunas), nao a olho. Resultado: degrau maximo 4-6 = paridade exata com o heightmap global, ZERO pares acima de 6, cauda >3 mais leve que a do global (0,10% contra 0,01-0,62%) e os tetos por bioma de pe (araucarias 106 / mata 68 / cerrado 53 / caatinga 36; era 106 na caatinga). Variantes rejeitadas com o numero do lado: sem nucleo suaviza (degrau 5) mas vaza o teto (cerrado 73, caatinga 43); clima 3x mais largo da degrau 3 mas mata a montanha (araucarias 66). Portao virou teste: `O PORTAO: nenhum degrau maior que 6 blocos entre colunas vizinhas`.
- **Tags:** worldgen, relevo, bioma, fronteira, penhasco, heightmap, medicao, sweep, §🏔️

## 2026-07-28 — bug-544: usuario no playtest: 'luz ta dando z fight nos blocos' — superficie chapada aparecia chuvi
- **Sintoma:** usuario no playtest: 'luz ta dando z fight nos blocos' — superficie chapada aparecia chuviscada entre dois brilhos, e o padrao acompanhava a camera como z-fighting de verdade
- **Onde:** `client/src/luzShader.ts`
- **Causa:** o desempacotamento dos dois nibbles (`floor(vLuz / 16.0)`) rodava no FRAGMENT shader, ou seja, aplicava `floor` a um valor INTERPOLADO. Os 4 vertices da face carregam o MESMO byte, mas a interpolacao perspectiva devolve 239,9999 em parte dos pixels — e o `floor` derruba um NIVEL INTEIRO de luz (~14% de brilho). O resultado e um xadrez de dois brilhos na mesma face, que na tela e indistinguivel de z-fighting. Nao era profundidade nenhuma: nao havia face coplanar envolvida.
- **Correção:** desempacotar no VERTEX shader, onde `luz` e o byte exato do atributo, e mandar pro fragmento o BRILHO ja calculado (`vBrilho`). Interpolar um valor constante entre 4 vertices iguais so pode errar na 7a casa decimal, o que e invisivel. De quebra ficou mais barato (por vertice em vez de por fragmento). Medido com detector de padrao ABAB num quadro do ?bench: 1,69% dos pixels antes, 0,09% no controle `?semluz`, 0,02% depois do fix.
- **Tags:** shader, luz, glsl, interpolacao, varying, z-fighting, playtest, precisao
- **Relacionados:** bug-540

## 2026-07-28 — bug-540: a verificacao da luz (scripts/luz-shots.mjs) mediu luminancia 0.0 ao meio-dia E a meia-noi
- **Sintoma:** a verificacao da luz (scripts/luz-shots.mjs) mediu luminancia 0.0 ao meio-dia E a meia-noite, e ainda assim marcou verde o teste 'a noite escurece' — enquanto o print salvo ao lado mostrava o mundo iluminado
- **Onde:** `scripts/luz-shots.mjs`
- **Causa:** a medicao lia o canvas pela pagina com `drawImage(canvasWebGL, ...)` num canvas 2D. O three usa `preserveDrawingBuffer: false`, entao o buffer de desenho e invalidado depois de compor: qualquer leitura fora do frame devolve PRETO. Pior que o falso negativo foi o falso POSITIVO — 0/0 satisfez a razao noite/dia < 0.75 e a verificacao 'passou' num numero sem sentido.
- **Correção:** medir o print do proprio CDP (`Page.captureScreenshot` em PNG, que e composto pelo navegador) e decodificar o PNG em Node com `zlib.inflateSync` + desfiltragem (decodificador minimo de 8 bits RGB/RGBA no proprio script). De quebra, a razao passou a ser calculada sobre uma JANELA de terreno, fora das linhas do F3, que sao identicas nas duas horas e so diluiam a diferenca.
- **Tags:** verificacao, headless, cdp, webgl, preservedrawingbuffer, screenshot, luz, falso-positivo
- **Relacionados:** bug-534

## 2026-07-28 — bug-541: smoke `pedir-coluna` falhou: 'streaming passou do RAIO_PADRAO: anel 4 (esperado > 6)' e `t
- **Sintoma:** smoke `pedir-coluna` falhou: 'streaming passou do RAIO_PADRAO: anel 4 (esperado > 6)' e `troca-raio` junto — 4/6 smokes OK, logo depois de as cavernas entrarem
- **Onde:** `shared/src/worldgen.ts`
- **Causa:** `cavernaEm` avaliava DOIS value noises 3D por celula, 8 hashes cada = 16 hashes por celula de subsolo. Isso levou `gerarColunaDeChunks` de 2,63 para 28,61 ms por coluna (10,9x). O servidor gera coluna sob demanda no mundo E, entao a vazao do streaming caiu e o smoke, que mede ate onde o anel chegou no tempo dado, parou no anel 4.
- **Correção:** amortizar o ruido por FATIA horizontal (`cavFatia`): descendo uma coluna os indices/pesos de x e z nao mudam nunca e `iy` so vira a cada 13 blocos, entao sao 4 hashes a cada 13 celulas em vez de 8 por celula. Mais early-out: o segundo campo so e avaliado se o primeiro passou (~88% das celulas morrem no primeiro). 28,61 -> 3,49 ms/coluna. Ha teste comparando `cavernasDaColuna` com `cavernaEm` celula a celula — o mundo gerado sai byte a byte identico.
- **Tags:** desempenho, worldgen, cavernas, ruido, streaming, smoke, mundo-lazy

## 2026-07-28 — bug-542: (pego na medicao, antes de ir pro cliente) acender uma coluna de luz custava 18,36 ms — ma
- **Sintoma:** (pego na medicao, antes de ir pro cliente) acender uma coluna de luz custava 18,36 ms — mais que o mesh da coluna inteira, e na main thread
- **Onde:** `shared/src/luz.ts`
- **Causa:** a BFS de luz do ceu enfileirava TODA celula iluminada da coluna (~32 mil num mundo de 128 de altura). A esmagadora maioria esta em ceu aberto cercada de ceu aberto: a BFS visita, olha 6 vizinhos e nao muda nada. Alem disso escrevia celula a celula (com checagem de borda de chunk) os ~100 blocos de ceu vazio acima do relevo, em chunks que o mesher nem visita.
- **Correção:** enfileirar so a BANDA util — altura do `piso` mais alto entre os 4 vizinhos laterais + 1, que e de onde sai a sombra do penhasco e a luz da boca de caverna; `fill` de um byte so no chunk 100% ar sob ceu cheio; leitura direta dos bytes do chunk em vez de `getBlock`. 18,36 -> 2,48 ms/coluna (1,87 medido no navegador). A fila de luz ainda entra num orcamento por frame, antes do mesher.
- **Tags:** desempenho, luz, bfs, main-thread, streaming, orcamento-por-frame
- **Relacionados:** bug-541

## 2026-07-28 — bug-543: (latente, introduzido pelas cavernas e corrigido na mesma sessao) uma boca de caverna no c
- **Sintoma:** (latente, introduzido pelas cavernas e corrigido na mesma sessao) uma boca de caverna no centro do mundo faria o jogador nascer no fundo de um poco — em TODO join daquele mundo
- **Onde:** `shared/src/world.ts`
- **Causa:** `findSpawnY` desce do topo do mundo e para no primeiro bloco nao-ar. Com uma boca de caverna na coluna do spawn, ele atravessa o buraco e para no CHAO DA CAVERNA. Como a geracao e deterministica por seed, nao seria intermitente: aquele mundo nasceria assim sempre.
- **Correção:** `findSpawnSeco` ganhou um parametro `rejeitar(x,z)` — veto extra de quem chama. A `session.ts` passa, so no preset 'normal', um veto que testa `cavernaEm(x,h,z,h,seed)`; o teste e a funcao PURA, nao `getBlock`, porque o que importa e o que a GERACAO fez ali (a coluna pode ter sido editada depois). Presets plano/cabines nao passam veto: `cavernaEm` e ruido puro e nao sabe de preset.
- **Tags:** spawn, cavernas, worldgen, determinismo, preset
- **Relacionados:** bug-010

## 2026-07-27 — bug-538: painel do menu 'Meus mundos' media 614px numa janela de 600px mesmo com `max-height: calc(
- **Sintoma:** painel do menu 'Meus mundos' media 614px numa janela de 600px mesmo com `max-height: calc(100dvh - 20px)` — a verificacao headless acusou 'ESTOURA (top -7, bottom 607, janela 600)'
- **Onde:** `client/index.html`
- **Causa:** o projeto nao tem `box-sizing: border-box` global — o padrao content-box faz `max-height` valer so pra CAIXA DE CONTEUDO, e o padding de 16px+16px e a borda de 1px+1px do `.menu-screen` sao SOMADOS depois. 580 + 32 + 2 = 614, batendo exato com o estouro medido.
- **Correção:** `box-sizing: border-box` no `.menu-screen` e no `#hud` — as duas regras onde entrou `max-height` nesta sessao. Os paineis de altura FIXA (#painel/#inventario/#jogadores) ficaram em content-box de proposito: la o valor 560px foi ajustado a olho em playtest (2026-07-20) e mudar o box-sizing encolheria o painel em 34px sem ninguem ter pedido.
- **Tags:** css, box-sizing, max-height, mobile, menu, layout, tablet

## 2026-07-27 — bug-539: no tablet o log do chat caia por cima da hotbar (chat 339..552, hotbar 495..588 numa janel
- **Sintoma:** no tablet o log do chat caia por cima da hotbar (chat 339..552, hotbar 495..588 numa janela de 600) — mensagem ilegivel sobre os slots
- **Onde:** `client/index.html`
- **Causa:** `#chat { bottom: 48px }` foi calculado pra hotbar antiga, de ~75px de altura. Os slots de alvo de dedo (52px de largura, padding maior) levaram a barra pra ~93px, e a folga de 48px virou sobreposicao de 57px. Pre-existia menor no desktop; os slots grandes so escancararam.
- **Correção:** em `(pointer: coarse)`, `#chat { bottom: calc(112px + var(--kb, 0px)) }` — acima da barra inteira. O `--kb` (teclado virtual) continua somando por cima. Verificacao nova no `scripts/tablet-shots.mjs` mede a interseccao dos dois retangulos e falha se houver.
- **Tags:** css, mobile, chat, hotbar, sobreposicao, toque, tablet
- **Relacionados:** bug-538

## 2026-07-27 — bug-534: screenshots de conversão PNG→JPEG saíram todos com 11 KB idênticos (imagem preta) em vez d
- **Sintoma:** screenshots de conversão PNG→JPEG saíram todos com 11 KB idênticos (imagem preta) em vez do print
- **Onde:** `scratchpad/png2jpg.mjs (receita, ver cerebrum)`
- **Causa:** a página de conversão era um `data:text/html` — origem OPACA, que o Chrome não deixa carregar `file://`. O <img> nunca carregava e o captureScreenshot fotografava o fundo preto. Tamanho idêntico em todos os arquivos era o sintoma (conteúdo diferente jamais comprime igual).
- **Correção:** escrever a página HTML num ARQUIVO ao lado dos PNG e navegar por `file://…html` (com --allow-file-access-from-files). Segundo achado da mesma rodada: `overflow:hidden` no html/body, senão as barras de rolagem entram na captura.
- **Tags:** cdp, chrome-headless, conversao-de-imagem, data-url, file-url, deck, apresentacao

## 2026-07-27 — bug-535: no deck da CRE a etiqueta do slide de capa esticava de ponta a ponta da tela em vez de env
- **Sintoma:** no deck da CRE a etiqueta do slide de capa esticava de ponta a ponta da tela em vez de envolver o texto
- **Onde:** `relatorio/apresentacao-cre.html`
- **Causa:** `.tag` é filho DIRETO de `.slide`, que é `display:flex; flex-direction:column` — e o `align-items` padrão é `stretch`. `display:inline-block` no filho não vence o stretch do container.
- **Correção:** `.slide > .tag { align-self: flex-start; }` (só o filho direto; a mesma classe dentro de `.selo`, que é flex-row, já se comportava).
- **Tags:** css, flexbox, align-self, deck, apresentacao

## 2026-07-27 — bug-536: slide 'Funcionou nos aparelhos da escola' trazia o print 06-hud-f3.png, que mostra `FPS 8`
- **Sintoma:** slide 'Funcionou nos aparelhos da escola' trazia o print 06-hud-f3.png, que mostra `FPS 8` na tela — a imagem desmentia o texto no projetor
- **Onde:** `relatorio/apresentacao-cre.html`
- **Causa:** o print foi capturado em render de SOFTWARE (SwiftShader), onde 8 FPS é esperado; `registros/prints/README.md` já avisava disso, mas o aviso foi lido depois de montar o slide.
- **Correção:** print removido do deck; o slide passou a abrir com uma frase explicando que os números vêm dos 52 relatórios colhidos na escola. Regra nova no cerebrum: 06-hud-f3.png não vai em material de divulgação.
- **Tags:** apresentacao, deck, prints, swiftshader, credibilidade

## 2026-07-27 — bug-537: (pego antes de rodar) o perfil de `?bench&semvida` ia gravar `config.nuvens: true` — a eti
- **Sintoma:** (pego antes de rodar) o perfil de `?bench&semvida` ia gravar `config.nuvens: true` — a etiqueta mentiria e o A/B viraria dois JSON indistinguíveis
- **Onde:** `client/src/bench.ts`
- **Causa:** `meta()` serializava `{ ...BENCH_SETTINGS }`, a constante CRUA, enquanto quem aplicava a config já era o caminho novo com a flag. Duas fontes pra mesma verdade.
- **Correção:** `benchSettings(opts)` virou fonte ÚNICA da config efetiva, chamada tanto pelo `applySettings` quanto pelo `meta()`; `Bench` passou a carregar `semVida` e `paraMundo` recebe o `BenchOpts` inteiro. Etiqueta redundante de propósito em 3 lugares (meta.bench.semVida, config.nuvens/balanco e o nome do arquivo `perf-bench-semvida-*`).
- **Tags:** instrumentacao, perfil, bench, ab-test, semvida, §🌬️, fonte-unica
- **Relacionados:** bug-529

## 2026-07-27 — bug-533: usuario (playtest): 'as texturas estao rotacionadas para cada face'. Com correnteza sul->n
- **Sintoma:** usuario (playtest): 'as texturas estao rotacionadas para cada face'. Com correnteza sul->norte: topo certo, face de baixo 180, face sul 90 horario, leste 180, oeste certa, norte 90 horario.
- **Onde:** `shared/src/mesher.ts`
- **Causa:** A regra da correnteza (bug-532) escolhia UM tile por CELULA e usava nas 6 faces. Mas o tile e uma imagem de 2 eixos e cada face amarra esses 2 eixos a direcoes de mundo DIFERENTES: no topo u/v seguem x/z, na face de baixo seguem x/z INVERTIDOS, e nas laterais um dos eixos e o VERTICAL. Resultado medido: com fluxo pro norte o topo saia certo, a face de baixo corria pro sul e as 4 laterais mostravam a onda DESCENDO.
- **Correção:** Tile escolhido por FACE (`tileAguaDaFace`), projetando o vetor de fluxo nos eixos daquela face (`FACE_BASES`, derivado de FACES, nao escrito a mao). Lateral perpendicular ao fluxo — e agua CAINDO — mostra a onda descendo (leitura de cachoeira). ATENCAO: rotacao fixa por face NAO resolve, apesar de parecer; foi verificado numericamente que com fluxo pro norte as laterais mostram BAIXO e com fluxo pro leste elas ja mostram horizontal, entao nenhuma rotacao constante acerta os dois. O usuario pediu a rotacao fixa; a projecao foi entregue no lugar, com a evidencia.
- **Tags:** playtest, agua, correnteza, uv, face, atlas, mesher, §🌬️
- **Relacionados:** bug-532

## 2026-07-27 — bug-532: usuario (playtest do §🌬️, bench no PC e no notebook): 'so a animacao do vento na agua flui
- **Sintoma:** usuario (playtest do §🌬️, bench no PC e no notebook): 'so a animacao do vento na agua fluindo que achei contraditorio, pois a correnteza da agua fluindo deve ditar o movimento e direcao da textura'
- **Onde:** `shared/src/mesher.ts`
- **Causa:** A frente 3 do §🌬️ amarrou a animacao de TODA a agua ao vento, porque a correnteza era UM tile do atlas repintado globalmente — direcao unica pro mundo inteiro. Funciona pra mar/lago (agua parada, onde o vento realmente e a unica forca) e e contraditorio pra agua que escorre, que tem forca propria e mais local.
- **Correção:** Regra nova em `tileDaAgua` (mesher): o fluxo sai do GRADIENTE DE NIVEL da vizinhanca (so vizinho de agua conta; contar ar faria a borda de todo lago escorrer pra fora). Gradiente zero = parada = segue o vento; gradiente = corre pra jusante, com ritmo proprio (8 fps). 8 tiles de atlas (TILE.aguaFluxo 112-119, contiguos numa linha), um por setor de `setorDaDirecao`, escolhidos POR CELULA pelo mesher — mantem o mesher funcao pura de bytes, sem material nem atributo novo. Licao: antes de amarrar animacao ambiental a uma forca GLOBAL, checar se existe forca mais LOCAL que deveria ganhar dela.
- **Tags:** playtest, vento, agua, correnteza, atlas, mesher, regra-de-mundo, §🌬️

## 2026-07-27 — bug-530: AssertionError: expected true to be false — blocks.test.ts 'isPlaceable(179) === false' qu
- **Sintoma:** AssertionError: expected true to be false — blocks.test.ts 'isPlaceable(179) === false' quebrou ao adicionar GramaAlta (179)
- **Onde:** `shared/src/blocks.ts`
- **Causa:** IDs novos foram anexados ao BlockId (GramaAlta 179..181) mas MAX_BLOCK_ID continuou apontando pra EscadaTijoloZNC (178). isPlaceable() usa esse teto, entao a grama alta era recusada no place_block — o bloco existia no enum, aparecia no inventario e o servidor rejeitava. O comentario do proprio MAX_BLOCK_ID ja avisava ('mantem isPlaceable sem numero magico ao crescer a lista') e mesmo assim passou batido.
- **Correção:** MAX_BLOCK_ID = BlockId.GramaAltaFria. Checklist ao anexar bloco novo: (1) BlockId, (2) MAX_BLOCK_ID, (3) TILE, (4) paint no atlas, (5) BLOCK_TILES (icone 2D), (6) forma no mesher, (7) blocks.ts helpers (isFullCube/isSolidBlock/precisaApoio/isReplaceable), (8) blocksUi, (9) worldgen.
- **Tags:** blockid, max-block-id, isplaceable, append, bloco-novo, grama-alta, vento

## 2026-07-27 — bug-531: AssertionError: expected 180 to be +0 — claims.test.ts esperava BlockId.Air numa celula qu
- **Sintoma:** AssertionError: expected 180 to be +0 — claims.test.ts esperava BlockId.Air numa celula que passou a nascer com capim (GramaAltaSeca=180)
- **Onde:** `shared/src/claims.test.ts`
- **Causa:** O teste do claim afirmava 'a celula continua AR' pra provar que o place foi barrado. Assim que o worldgen passou a espalhar grama alta, a celula do teste nasceu com capim e a asserção caiu — sem que houvesse bug nenhum no claim. Teste acoplado ao CONTEUDO do mundo gerado, nao ao comportamento medido.
- **Correção:** Snapshot antes/depois: `const antes = getBlock(...)` e `expect(depois).toBe(antes)`. Licao: teste de 'nao mudou' deve comparar com o valor ANTERIOR, nunca com uma constante que so por acaso valia naquele worldgen.
- **Tags:** teste, claims, worldgen, acoplamento, falso-positivo, grama-alta
- **Relacionados:** bug-530

## 2026-07-27 — bug-529: 6 perfis de A/B de `?meshdepth` voltaram do lab sem dizer qual profundidade cada um usou —
- **Sintoma:** 6 perfis de A/B de `?meshdepth` voltaram do lab sem dizer qual profundidade cada um usou — a variavel do experimento nao estava no JSON
- **Onde:** `client/src/hud.ts`
- **Causa:** Adicionei o knob `?meshdepth=N` e pedi ao usuario um A/B de 3 valores, mas o perfil so gravava `config` (raioRender/meshMsPorFrame/pixelRatioCap/fov) — settings do jogo, nao a config do pool. Sem etiqueta, atribuir rodada a profundidade dependeu do usuario lembrar a ordem em que rodou.
- **Correção:** `MeshPool.config` (workers + profundidadeJogo + profundidadeCarga) -> `ChunkRenderer.meshConfig` -> `HudRemeshStats.config` -> campo `mesher` no JSON, e uma linha `mesher` no bench-headless. Regra geral: quando pedir um A/B, a VARIAVEL do experimento tem que sair no resultado, nao so a metrica.
- **Tags:** instrumentacao, perfil, bench, ab-test, meshdepth, worker
- **Relacionados:** bug-528

## 2026-07-27 — bug-528: usuario (bench no notebook do lab): mesher em Worker fez a carga cair 55% mas o FPS de jog
- **Sintoma:** usuario (bench no notebook do lab): mesher em Worker fez a carga cair 55% mas o FPS de jogo caiu de 50 para 36, p95 28,1 -> 44 ms, frames >50ms 2 -> 23
- **Onde:** `client/src/meshPool.ts`
- **Causa:** Duas causas, a mesma raiz: mover o mesher pro Worker tirou junto o FREIO que o caminho sincrono tinha de graca. (1) `enfileirarColuna` enfileira a coluna nova + as 4 vizinhas; com a fila lenta o `filaSet` fundia essas re-entradas, com o pool esvaziando rapido cada uma virou job proprio e o anterior foi descartado por versao vencida (2 448 jobs desperdicados de 7 904, +45% de trabalho). (2) `meshMsPorFrame: 6` prendia o meshing a ~30% de UM nucleo; o pool rodava 4 workers a plena carga e num i5 de 4 nucleos fisicos isso disputa nucleo com a main thread e com a thread do driver D3D11 — ate a GPU subiu (13,6 -> 15,1 ms), o que meshing sozinho nao explicaria.
- **Correção:** (a) `chavesEmVoo` + `sujosEmVoo` no ChunkRenderer: chunk com job no ar nao abre job duplicado, fica sujo e re-enfileira UMA vez quando o resultado chega. (b) `MeshPool.modoCarga` ligado a `loading.ativo`: profundidade 8 jobs/worker na CARGA (nao ha frame pra proteger) e 2 na JOGATINA. (c) knob `?meshdepth=N` porque o 2 saiu de conta de ocupacao de nucleo, nao de medida no lab.
- **Tags:** perf, worker, mesher, throttle, coalescencia, lab, fps, contencao-de-nucleo

## 2026-07-27 — bug-525: ?bench: gravacao.movimento.distanciaBlocos = 301 num trajeto de 202 blocos (velocidade 30,
- **Sintoma:** ?bench: gravacao.movimento.distanciaBlocos = 301 num trajeto de 202 blocos (velocidade 30,7 b/s onde o trajeto anda a 18)
- **Onde:** `client/src/bench.ts`
- **Causa:** Dois TELEPORTES entravam na distância acumulada do perfil: (1) o salto spawn → início do círculo, contado no primeiro frame do trajeto porque `posAnt*` do loop ainda era do spawn; (2) a virada voo→giro voltava pro ponto de PARTIDA do círculo (~150 blocos de salto), o que ainda por cima disparava uma rajada de streaming bem na troca de fase, sujando as duas medidas.
- **Correção:** A fase `giro` passou a girar ONDE O VOO PAROU (`pontoDoVoo(tVoo)`), sem volta ao início; e o `iniciarBench` teleporta o jogador e sincroniza `posAntX/Y/Z` ANTES de `hud.record()`, então o salto inicial não entra no delta. Verificado headless: distância = 202,5 = 18 b/s × 11,25 s de voo, exato.
- **Tags:** bench, perfilador, trajeto, telemetria, cliente

## 2026-07-27 — bug-524: F3 mostrava 'remesh por caminho: n/d' apesar dos contadores existirem
- **Sintoma:** F3 mostrava 'remesh por caminho: n/d' apesar dos contadores existirem
- **Onde:** `client/src/main.ts`
- **Causa:** `hud.setRemesh` é chamado em DOIS lugares: uma vez no startGame e uma vez POR FRAME no loop. Só o do startGame recebeu o novo campo `porCaminho`; o do loop sobrescrevia o objeto (setRemesh faz `this.remesh = {...stats}`) e o campo virava undefined no frame seguinte.
- **Correção:** Passar `porCaminho: chunkRenderer.porCaminho` também na chamada do loop. Pego pela verificação headless com `?hud` — typecheck não vê (campo opcional).
- **Tags:** hud, perfil, telemetria, client

## 2026-07-26 — bug-526: Test timed out in 5000ms — teste novo de equivalência do mesher (meshVizinhanca × meshChun
- **Sintoma:** Test timed out in 5000ms — teste novo de equivalência do mesher (meshVizinhanca × meshChunk) estourou o timeout do vitest
- **Onde:** `shared/src/mesher.test.ts`
- **Causa:** expect(typedArray).toEqual(typedArray) faz deep-equal item a item com formatação de diff; em geometria de mundo denso são centenas de milhares de floats por chunk × 8 chunks. Não era divergência — era custo do matcher.
- **Correção:** Comparação manual num helper `difere()` que devolve a primeira divergência como string, e UM expect(erro).toBeNull() no fim. Roda em ms e a mensagem de erro fica melhor (diz o índice).
- **Tags:** teste, vitest, timeout, mesher, typed-array, performance-de-teste

## 2026-07-26 — bug-527: TS2339: Property 'Vidro' does not exist on type BlockId — mas `npm test` passou VERDE ante
- **Sintoma:** TS2339: Property 'Vidro' does not exist on type BlockId — mas `npm test` passou VERDE antes do typecheck pegar
- **Onde:** `shared/src/mesher.test.ts`
- **Causa:** O bloco de vidro comum chama-se BlockId.Glass (só os coloridos são VidroX). vitest usa esbuild, que APAGA os tipos sem checá-los: `BlockId.Vidro` virou `undefined`, `setBlock(w,x,y,z,undefined)` não escreveu nada e o teste passou — cobrindo 3 tipos de bloco em vez de 4.
- **Correção:** BlockId.Glass. Lição: teste verde NÃO prova que os identificadores existem — rodar `npm run typecheck` junto com `npm test` sempre que um teste novo usa enum/constante.
- **Tags:** teste, vitest, typecheck, blockid, falso-positivo, esbuild
- **Relacionados:** bug-526

## 2026-07-26 — bug-523: usuário (playtest): 'só tem a questão da pagina dizer que não está respondendo' ao usar /m
- **Sintoma:** usuário (playtest): 'só tem a questão da pagina dizer que não está respondendo' ao usar /mundo carregar
- **Onde:** `client/src/torchGlow.ts`
- **Causa:** `TorchGlow.setFromWorld` varria o mundo BLOCO A BLOCO (`sizeX*sizeY*sizeZ` chamadas de getBlock). Mundo E = 3840×3840×128 = 1,887 BILHÃO de células: 41,4 s de main thread travada (medido em Node, mesmo V8). Rodava no join E no reloadWorld. Explica os ~38 s de longTasksMsTotal presentes nos TRÊS perfis de 2026-07-26 independentemente da duração da sessão — era sempre esta varredura. Antes da §🕐 a trava ficava escondida no 'carregando'; com a tela na frente virou o diálogo 'página não está respondendo' do Chrome.
- **Correção:** Varredura por CHUNK: chunk ausente (mundo lazy nasce com todos ausentes) sai em O(1), presente é lido direto do Uint8Array com a fórmula de índice canônica. Medido: E 41 361 ms → 2,9 ms; P 77 → 11,5 ms; aula 43 → 16,6 ms. Equivalência verificada contra a varredura antiga com tochas em bordas de chunk (9/9 idênticas). De quebra: `varrerColuna` no `aplicarColunas` (tocha de coluna que chega por streaming nunca ganhava halo) e `descartarColuna` nos dois caminhos de descarte (senão os sprites vazariam).
- **Tags:** perf, long-task, streaming, troca-de-aula, tocha, client
- **Relacionados:** bug-517, bug-520

## 2026-07-26 — bug-521: smoke _smoke-mundo: '✗ aluno vê o objetivo da aula 1' (1 FALHA(S), exit 1) ao rodar pelo r
- **Sintoma:** smoke _smoke-mundo: '✗ aluno vê o objetivo da aula 1' (1 FALHA(S), exit 1) ao rodar pelo runner novo
- **Onde:** `server/src/cenarios/_smoke-mundo.mjs`
- **Causa:** Asserção velha e case-sensitive: /Continue a regra/ casa com o TÍTULO da aula1 (gerar.ts:223), mas a msg objectives entrega o TEXTO do objetivo — "Fase 1: continue a regra ate completar os 12 blocos." (gerar.ts:231), com c minúsculo. Nunca pegou antes porque o smoke era rodado à mão contra um servidor já no ar e a falha se perdia no meio da saída; ninguém checava o exit code.
- **Correção:** Regex para /continue a regra/i e a mensagem passou a imprimir o texto recebido, no mesmo estilo da checagem da aula 2 — falha futura mostra o que chegou em vez de só dizer que não bateu. Não é bug de produto: o aluno vê o objetivo certo.
- **Tags:** smoke, teste, asserção, cp19, regex, falso-negativo

## 2026-07-26 — bug-522: scripts/smoke.mjs: 'mundo' falhava em 2 checagens (objetivo da aula 1 + /mundo lista marca
- **Sintoma:** scripts/smoke.mjs: 'mundo' falhava em 2 checagens (objetivo da aula 1 + /mundo lista marca a em curso) na primeira versão do manifesto
- **Onde:** `scripts/smoke.mjs`
- **Causa:** O manifesto subia o cenário mundo com LJ_SAVE=mundos/_smoke-mundo.ljw LJ_NOVO=1, ou seja, mundo novo VAZIO. O _smoke-mundo.mjs pressupõe que a sessão NASCE na aula1 — confere o objetivo inicial e que /mundo lista marca a aula em curso.
- **Correção:** Manifesto do cenário mundo passou a usar LJ_SAVE=cenarios/aula1-sequencia.ljw (modelo). paths.ts trata cenarios/ como modelo somente-leitura e grava a cópia de trabalho em mundos/, então não polui arquivo versionado. Comentário no manifesto explica o porquê pra ninguém "limpar" de volta pra mundo novo.
- **Tags:** smoke, runner, manifesto, mundo-inicial, cenarios
- **Relacionados:** bug-521

## 2026-07-26 — bug-520: usuário (playtest): 'a tela de carregamento com os status do load demora para aparecer com
- **Sintoma:** usuário (playtest): 'a tela de carregamento com os status do load demora para aparecer com o /mundo carregar e quando aparece já está quase pronto'
- **Onde:** `client/src/main.ts`
- **Causa:** A tela só abria no `reloadWorld`, que roda quando o SNAPSHOT do mundo novo chega — o fim da fila. Antes disso o host ainda salva a aula atual, decodifica o .ljw e monta a sessão nova (segundos), e o cliente não tinha como saber. Pior: medido no smoke, o snapshot chega ~1-2 ms depois do início da troca em mundo lazy, ou seja, mesmo abrindo no reloadWorld o navegador não chegava a PINTAR a tela antes de travar no decode + troca de malha.
- **Correção:** (1) msg nova server→cliente `mundo_trocando {nome}` emitida em mundos.ts logo APÓS o decode do arquivo (ponto de não-retorno) e ANTES de `salvarAgora`/`novaSessao`; host faz broadcast. (2) Cliente abre a tela na hora (fase nova `preparando` → 'o servidor está preparando "X"…', anel indeterminado, total 0). (3) `filaTroca`: as mensagens seguintes (inclusive o snapshot) ficam numa fila por 2 rAF — garante que o frame COM a tela pintou antes do trabalho pesado; setTimeout(500) é a rede de segurança pra aba em segundo plano (rAF não roda).
- **Tags:** ui, carregamento, troca-de-aula, cp19, protocolo, paint
- **Relacionados:** bug-515, bug-517

## 2026-07-26 — bug-517: perfil de 2026-07-26 18:14: remeshCount 475136 (24× o perfil anterior), remeshTotalMs 1898
- **Sintoma:** perfil de 2026-07-26 18:14: remeshCount 475136 (24× o perfil anterior), remeshTotalMs 18987, p95 39→80 ms, 36 long tasks dentro da gravação de 10 s (antes 0)
- **Onde:** `client/src/chunks.ts`
- **Causa:** `trocarMundo()` chamava `buildAll()` SEMPRE. Em mundo lazy (E) não há chunk montado — os bytes chegam por streaming — mas o buildAll varre dims.x*dims.y*dims.z = 240*240*8 = 460 800 slots, chamando `remesh()` (com meshChunk + 2 performance.now) em cada um. ~19 s de trava síncrona na main thread na hora do `/mundo carregar`. O `startGame` sempre teve o guarda `if (!mundoLazy) buildAll()`; o trocarMundo não.
- **Correção:** `trocarMundo(novo, construir = true)`; main.ts passa `!mundoLazy` no reloadWorld. Mundo denso segue montando tudo.
- **Tags:** perf, mesher, troca-de-aula, cp19, streaming, long-task

## 2026-07-26 — bug-518: perfil de 2026-07-26 18:14: stream.repedidas 252 em 700 colunas (16 no perfil anterior) — 
- **Sintoma:** perfil de 2026-07-26 18:14: stream.repedidas 252 em 700 colunas (16 no perfil anterior) — mundo com buraco depois do /mundo carregar
- **Onde:** `client/src/main.ts`
- **Causa:** `/mundo carregar` cria uma GameSession NOVA no host e chama `adotar` → `admitir`, que registra o stream do jogador com `raio: RAIO_PADRAO` (6). O cliente não reanunciava o raio (`enviarRaio()` sai cedo porque `raioEnviado === settings.raioRender`), então quem jogava com raio 12 passava a receber só o miolo; o `pedir_coluna` do §🔁 tentava tapar o buraco e era RECUSADO pelo servidor (guarda `> st.raio + FOLGA_DESCARTE`), gerando pedido em backoff pra sempre. Mesma classe do bug-211, outro caminho.
- **Correção:** No `reloadWorld` (main.ts): `raioEnviado = -1; enviarRaio();` logo depois da troca. Smoke novo `server/src/cenarios/_smoke-troca-raio.mjs` prova pelo fio: anel 10 antes → 6 depois da troca → 12 ao reanunciar.
- **Tags:** streaming, troca-de-aula, cp19, raio, protocolo
- **Relacionados:** bug-211, bug-215

## 2026-07-26 — bug-519: perfil de 2026-07-26 18:14 sai contraditório: meta.worldChunks 8×8×4 (64 colunas possíveis
- **Sintoma:** perfil de 2026-07-26 18:14 sai contraditório: meta.worldChunks 8×8×4 (64 colunas possíveis) com stream.colunas 700
- **Onde:** `client/src/hud.ts`
- **Causa:** O meta do HUD (worldChunks/worldSeed) era capturado UMA vez no `new Hud(...)` dentro do startGame. A troca de aula (cp19) muda mundo e seed, mas o meta continuava o do join — o perfil exportado misturava mundo antigo com contadores do atual.
- **Correção:** `Hud.setMeta(parcial)` novo, chamado no `reloadWorld` com `world.dims` e `novo.seed`.
- **Tags:** hud, perfil, troca-de-aula, telemetria
- **Relacionados:** bug-517, bug-518

## 2026-07-26 — bug-516: usuário: 'rodei npm run dev:server na raiz mas não vi a tela de loading nem no single nem 
- **Sintoma:** usuário: 'rodei npm run dev:server na raiz mas não vi a tela de loading nem no single nem no multiplayer'
- **Onde:** `client/dist/assets/index-*.js`
- **Causa:** `npm run dev:server` sobe SÓ o host Node (8080). O host serve o cliente COMPILADO (server/src/static.ts → client/dist, readFileSync por request). Nada nesse script reconstrói o bundle, então o navegador em :8080 rodava o JS de 13:53 — anterior ao loading.ts (14:58). O código estava certo; o entrypoint é que servia build velho.
- **Correção:** `npm run build` (regenera client/dist; o host não precisa reiniciar, lê o arquivo a cada request). Loop rápido de dev do CLIENTE é `npm run dev` (vite 5173) — single funciona sozinho lá, multiplayer aponta o menu pra ws://localhost:8080.
- **Tags:** build, dev-loop, static, host, stale-bundle

## 2026-07-26 — bug-515: usuário (sessão 23): o menu de pausa (Esc) aparece durante o carregamento, por baixo/por c
- **Sintoma:** usuário (sessão 23): o menu de pausa (Esc) aparece durante o carregamento, por baixo/por cima do que deveria ser a tela de carga
- **Onde:** `client/src/main.ts`
- **Causa:** updateOverlay() escondia o overlay só quando input.active || chat.open || panelOpen. Entre o 'jogar' e o mundo pronto o ponteiro NÃO está travado (input.active=false), então o menu de pausa ficava visível o carregamento inteiro — junto com canvas preto, sem número nenhum.
- **Correção:** Tela de carregamento própria (client/src/loading.ts, §🕐) + condição loading.ativo em updateOverlay (esconde o overlay) e em touchControls.setShown (some com a UI de toque). connect() abre a tela e chama updateOverlay; loading.fechar() reavalia o overlay pelo callback do construtor, devolvendo o menu de pausa como porta de entrada (clique = pointer lock).
- **Tags:** ui, overlay, carregamento, streaming, pointer-lock, client
- **Relacionados:** bug-151

## 2026-07-26 — bug-210: worldgen.test.ts > "mandacaru só na caatinga e fora da praia": AssertionError: expected 0 
- **Sintoma:** worldgen.test.ts > "mandacaru só na caatinga e fora da praia": AssertionError: expected 0 to be greater than 0
- **Onde:** `shared/src/worldgen.ts + shared/src/biomas.ts + shared/src/worldgen.test.ts`
- **Causa:** Ao criar o nível do mar (NIVEL_MAR) amarrei SAND_HEIGHT nele (mar+1: praia contorna a água). SAND_HEIGHT saltou 18→23, e o gate do mandacaru era h > SAND_HEIGHT — a caatinga daquela seed é baixa, então as colunas elegíveis caíram de 244 pra 84 e, com densidade 1/96, o mundo M inteiro ficou com ZERO cactos. Constante fazendo dois trabalhos: linha de praia E gate de vegetação.
- **Correção:** Gate do mandacaru passou a ser a linha d’ÁGUA (h > NIVEL_MAR), que é a intenção real (cacto não nasce molhado), e a densidade da caatinga subiu 1/96 → 1/16 (com 1/96 o mundo M tinha ~2 cactos: caatinga sem cacto). Teste atualizado pra assertar y > NIVEL_MAR + 1. 58 colunas elegíveis × 1/16 ≈ 5 cactos — teste deixou de ser knife-edge.
- **Tags:** worldgen, agua, nivel-do-mar, biomas, mandacaru, teste-fragil

## 2026-07-26 — bug-211: aumentar a distância de render não carrega chunks novos — só mantém mais chunks renderizad
- **Sintoma:** aumentar a distância de render não carrega chunks novos — só mantém mais chunks renderizados (relato do usuário, 2026-07-26)
- **Onde:** `client/src/main.ts (+ shared/src/session.ts streamColunas)`
- **Causa:** O cliente manda {type:"radius"} UMA única vez, logo depois do join (main.ts:542). Mudar o "raio de render" na config ao vivo (Esc → gráficos) só altera a regra de DESCARTE do cliente (main.ts:1442); o servidor nunca é avisado, st.raio segue o valor antigo (session.ts:603) e o anel novo jamais entra no lote de streamColunas. Diminuir o raio parece funcionar porque os dois lados descartam pela mesma regra.
- **Correção:** CORRIGIDO (2026-07-26, §🔁 frente 1). Cliente: `enviarRaio()` novo em main.ts guarda o último raio anunciado (`raioEnviado`) e reenvia `{type:"radius"}` sempre que a config muda — chamado no `connect()` (reset pra -1: conexão nova = servidor novo) e no `onSettingsChanged()`, que é o `onChanged` do buildConfigScreen tanto no menu principal quanto no Esc. Servidor não mudou (o case "radius" já atualizava st.raio). Regressão travada em shared/src/streaming.test.ts ("bug-211: AUMENTAR o raio depois do join traz o anel novo") + smoke ws real server/src/cenarios/_smoke-pedir-coluna.mjs (raio 4→8 = 200 colunas do anel novo).
- **Tags:** streaming, f2, raio-de-render, chunks, protocolo, corrigido

## 2026-07-26 — bug-215: streaming F2 é fire-and-forget: lote perdido / decode LJC0 inválido / mesh que joga exceçã
- **Sintoma:** streaming F2 é fire-and-forget: lote perdido / decode LJC0 inválido / mesh que joga exceção deixavam BURACO PERMANENTE no mundo (só sair do raio e voltar consertava)
- **Onde:** `client/src/main.ts, client/src/chunks.ts, shared/src/session.ts, shared/src/protocol.ts`
- **Causa:** Não existia caminho de re-pedido. `st.enviadas` do servidor marca a coluna como enviada no momento do send; se o cliente não aplicasse (lote perdido, `decodeColunas` jogando exceção pelo handler de mensagem, ou `remesh` falhando na fila), ninguém percebia. `colunasCarregadas` do cliente ficava sem a chave e nada re-sincronizava.
- **Correção:** §🔁: (1) msg nova cliente→servidor `pedir_coluna {cx,cz}` — o servidor só faz `st.enviadas.delete(key)` e o `streamColunas` do tick seguinte reenvia pelo caminho NORMAL (zero envio paralelo); guardas no servidor: exige join+stream, bounds, dentro de raio+FOLGA_DESCARTE e teto `PEDIDOS_COLUNA_POR_S=8` por cliente por segundo (o comando chega pela rede da escola). (2) Cliente: `varrerFaltando()` roda na MESMA passada 1×/s do descarte, percorre o quadrado até raioRender, registra coluna ausente com carência de 4 s e repede com backoff exponencial (2 s → 30 s), teto de 4 pedidos por varredura, descartando bytes+geometria antes de repedir. (3) `decodeColunas` embrulhado em try/catch (antes a exceção subia pelo handler de mensagem) e `processarFila(budget, onFalha)` reporta chunk que falhou no mesh → a coluna sai de `colunasCarregadas` e é repedida. (4) F3 mostra `faltando` e `repedidas`.
- **Tags:** streaming, f2, colunas, protocolo, rede-de-seguranca, corrigido
- **Relacionados:** bug-211

## 2026-07-25 — bug-512: playtest: 'a escada, o primeiro degrau funciona mas quando caminha pra o topo da escada bu
- **Sintoma:** playtest: 'a escada, o primeiro degrau funciona mas quando caminha pra o topo da escada buga e sou movido para traz antes de subir na escada'
- **Onde:** `shared/src/physics.ts`
- **Causa:** moveAxis resolvia a colisao horizontal encostando o jogador na FRONTEIRA DA CELULA (Math.floor(pos+half)-half), premissa de que todo colisor varre a celula inteira em XZ. O degrau superior da escada ocupa so MEIA celula em XZ (stepFootprint), entao ao esbarrar nele o snap teleportava o jogador ~0,65 bloco PARA TRAS, para dentro da celula anterior; o step-up seguinte partia dessa posicao errada.
- **Correção:** Novo resolveHoriz() em physics.ts: varre as celulas do AABB, considera so as sub-caixas de collisionBoxes realmente penetradas nos 3 eixos e devolve a face REAL mais restritiva (menor x0 indo pro +, maior x1 indo pro -). moveAxis encosta nessa face; fronteira de celula virou so fallback. 2 testes novos (nunca recua no eixo do movimento; escadaria de 2 lances sobe andando).
- **Tags:** fisica, colisao, escada, step-up, hitbox, playtest

## 2026-07-25 — bug-513: playtest: 'nao gostei de como ficou os vidros, precisa de material novo pra o vidro ter co
- **Sintoma:** playtest: 'nao gostei de como ficou os vidros, precisa de material novo pra o vidro ter cor com opacidade de uns 20% (quase transparente) da cor correta do vidro'
- **Onde:** `client/src/atlasTexture.ts`
- **Causa:** O vidro colorido foi feito com DITHER cutout (40% dos pixels pintados, alphaTest) pra evitar criar material novo. Visualmente vira 'tela de mosquiteiro' furada, nao vidro tingido.
- **Correção:** Tile do atlas virou cor CHEIA opaca (icone da hotbar sai solido) e a translucidez passou pro material: materialVidro (MeshLambertMaterial transparent, opacity 0.2, depthWrite false) em main.ts. Mesher ganhou 3o grupo de indices (opaco | agua | vidro) via aguaIndexCount; ChunkRenderer agora recebe 3 materiais e cria 3 grupos.
- **Tags:** vidro, material, three, mesher, atlas, playtest

## 2026-07-25 — bug-514: playtest: 'adiciona um smooth no movimento quando sobe na laje ou escada, o movimento esta
- **Sintoma:** playtest: 'adiciona um smooth no movimento quando sobe na laje ou escada, o movimento esta muito brusco'
- **Onde:** `client/src/main.ts`
- **Causa:** O step-up da fisica sobe 0,5 bloco num unico passo (tem que ser assim: o servidor valida a MESMA simulacao), entao a camera pulava 0,5 de um frame pro outro.
- **Correção:** Suavizacao SO no olho: stepSuave acumula a subida do frame (quando onGround, sem voo, <= STEP_HEIGHT) e e descontado de camera.position.y, decaindo exponencialmente (exp(-dt*14), ~0,15 s). Fisica/rede intactas. STEP_HEIGHT virou export do physics.ts.
- **Tags:** camera, step-up, polimento, cliente, playtest
- **Relacionados:** bug-512

## 2026-07-23 — bug-495: ReferenceError: Cannot access 'touchControls' before initialization (applySettings no boot
- **Sintoma:** ReferenceError: Cannot access 'touchControls' before initialization (applySettings no boot) — tela cinza no VITE DEV SERVER (headless). Build de PRODUÇÃO NÃO afetado (usuário rodou com a turma em 2026-07-23 sem problema).
- **Onde:** `client/src/main.ts`
- **Causa:** applySettings() é chamado no top-level (let settings = applySettings()) e lê touchControls?.setScale(uiScale), mas `let touchControls` era declarado ~11 linhas ABAIXO da chamada → TDZ. Linha touchControls?.setScale entrou na sessão 13 (commit d8ca720, escala da UI de toque). Manifesta no vite DEV (ESM nativo sem bundle, ordem de topo estrita); o BUNDLE de produção (vite build) não disparava o TDZ — por isso o playtest com alunos funcionou. Descoberto na sessão 18 ao rodar o client headless (dev) pra tirar prints. Mesmo PADRÃO de bug-093/activePanel-TDZ e do ?yaw-TDZ: null-let declarado depois de um uso no boot (optional chaining `?.` NÃO salva de TDZ).
- **Correção:** Movido `let touchControls: TouchControls | null = null;` pra ANTES de `let settings = applySettings();`; deixado comentário-pointer no lugar antigo. Boot do dev volta a chamar showMenu (verificado headless: sem exception, badge v0.8.0 e 3 botões renderizam). Tira o TDZ latente independente do bundler.
- **Tags:** tdz, reference-error, boot, main.ts, touchControls, applySettings, regression, client-crash
- **Relacionados:** bug-093

## 2026-07-23 — bug-490: rules.ts(214,232,233): TS2488/TS2532 - 'readonly [number,number] | undefined' e 'Object is
- **Sintoma:** rules.ts(214,232,233): TS2488/TS2532 - 'readonly [number,number] | undefined' e 'Object is possibly undefined' no waterRule. STATUS sessao 16 alegava 'typecheck 0' mas a arvore nunca passou.
- **Onde:** `shared/src/rules.ts`
- **Causa:** noUncheckedIndexedAccess:true no tsconfig.base. O fluxo priorizado da agua (sessao 16) iterou com 'for (let i...)' + LADOS[i]/custo[i] (index access -> T|undefined); os outros loops do arquivo usam for...of (elemento nao-undefined) e por isso nao acusavam.
- **Correção:** Trocar os dois 'for (let i...)' por 'for (const [i, [dx,dz]] of LADOS.entries())' (elemento tipado readonly [number,number]) e narrow no compare 'custo[i] ?? Infinity'. typecheck 0, 304 testes, build ok.
- **Tags:** typecheck, noUncheckedIndexedAccess, rules, agua, waterRule, LADOS, regressao-status
- **Relacionados:** bug-487, bug-488

## 2026-07-23 — bug-489: Após ~5 ticks a água voltava a espalhar em disco: assim que enchia o buraco, o alvo do flu
- **Sintoma:** Após ~5 ticks a água voltava a espalhar em disco: assim que enchia o buraco, o alvo do fluxo 'sumia'
- **Onde:** `shared/src/rules.ts`
- **Causa:** temQueda só considerava desnível quando a célula de baixo era AR. Ao cair no buraco, a água enchia a coluna abaixo → a de baixo virava ÁGUA, não ar → temQueda=false → as células a montante perdiam o alvo e voltavam a espalhar (melhor=Infinity → poça).
- **Correção:** temQueda passa a contar como descida tanto AR quanto ÁGUA FLUIDA embaixo (uma coluna já caindo ainda é descida). Fonte/sólido embaixo e o fundo do mundo NÃO contam. Steady-state vira um fio estável da fonte até a beira + coluna cheia descendo.
- **Tags:** agua, fluxo, waterRule, temQueda, coluna, queda
- **Relacionados:** bug-487

## 2026-07-23 — bug-488: Fluxo priorizado ainda dava a volta: assim que a água descia a 1ª célula, o fluxo espalhav
- **Sintoma:** Fluxo priorizado ainda dava a volta: assim que a água descia a 1ª célula, o fluxo espalhava perpendicular (disco) em vez de seguir a beira
- **Onde:** `shared/src/rules.ts`
- **Causa:** O custo até o desnível era medido só sobre células PREENCHÍVEIS (ar/fluida de nível menor). Quando o vizinho da direção do desnível já estava CHEIO (nível máx = saturado), essa direção saía da comparação de custo, `melhor` passava a ser o das direções perpendiculares (custo maior) e a água floodava pros lados.
- **Correção:** Medir o custo sobre TODA célula que a água ATRAVESSA (ar OU fluida, via aguaAtravessa), não só as preenchíveis. Array `empurra[]` separado marca quais dá pra de fato encher. Assim a rota do desnível continua vencendo mesmo já cheia de água (a água só escorre por ela, não redireciona).
- **Tags:** agua, fluxo, waterRule, custo, saturado
- **Relacionados:** bug-487

## 2026-07-23 — bug-487: usuário: FPS morre (Xeon/RTX2060) numa cascata em forma de pirâmide com água de um lado — 
- **Sintoma:** usuário: FPS morre (Xeon/RTX2060) numa cascata em forma de pirâmide com água de um lado — 'a água dá a volta na pirâmide, tá muito lateralizado'
- **Onde:** `shared/src/rules.ts`
- **Causa:** waterRule espalhava pros 4 vizinhos laterais IGUALMENTE (flood-fill em disco). Numa pirâmide escalonada, cada degrau enchia toda a superfície e cascateava pelas 4 faces → centenas de células de água ativas = tick + remesh do cliente afogados = FPS morre.
- **Correção:** Fluxo priorizado estilo Minecraft: cada célula de água em chão sólido busca o DESNÍVEL mais próximo (busca em profundidade ≤ DROP_SEARCH=4 sobre células que a água atravessa) e só escorre naquela direção; sem queda no alcance → espalha nos 4 lados (poça). Água em FIO, não disco (pirâmide: 12 células em vez de centenas). + teto configurável de água/tick (AGUA_POR_TICK_PADRAO=256, LJ_AGUA_TICK) na session como trava dura de FPS.
- **Tags:** agua, fluxo, waterRule, performance, fps, remesh, minecraft, piramide
- **Relacionados:** bug-488, bug-489

## 2026-07-23 — bug-489: Usuario: toda vez que uso a opcao 8 (carregar mundo salvo) o launcher pede qual tamanho de
- **Sintoma:** Usuario: toda vez que uso a opcao 8 (carregar mundo salvo) o launcher pede qual tamanho de mundo criar.
- **Onde:** `iniciar-servidor.bat, iniciar-servidor.sh`
- **Causa:** O menu de tamanho de mundo (P/M/G/E) so era pulado quando LJ_TAMANHO==E (procedural). A opcao [8] carrega um .ljw existente (dims ja no save), mas nao setava nada -> caia no menu de tamanho a toa. Tamanho so vale para mundo NOVO; save existente ignora LJ_TAMANHO.
- **Correção:** Ao escolher um save valido em [8] marca PULAR_TAMANHO=1; o menu de tamanho passa a ser pulado quando PULAR_TAMANHO definido (goto :depois_tamanho no .bat; guard 'if [ -z ]' no .sh).
- **Tags:** launcher, bat, sh, menu, tamanho, carregar-mundo, opcao-8

## 2026-07-22 — bug-481: agua fluida virava DISCO flutuante no ar (fonte suspensa espalhava r7 no proprio nivel em 
- **Sintoma:** agua fluida virava DISCO flutuante no ar (fonte suspensa espalhava r7 no proprio nivel em vez de so cair)
- **Onde:** `shared/src/rules.ts`
- **Causa:** waterRule espalhava lateral sempre que below != AR. Ao cair, a celula-de-baixo enchia (vira agua) em 1 tick -> below deixa de ser AR -> o topo passa a espalhar lateral; cada anel repetia -> disco r7 flutuante. Testei 3 variantes do gate (below===air; below-below===air) antes de acertar.
- **Correção:** Espalhar lateral SO com apoio SOLIDO: isFullCube(below) && !isAgua(below). AR embaixo => so cai (coluna cheia 7), nunca lateral. Agua fluida embaixo NAO conta como apoio. Fonte no ar vira coluna unica; sem disco. Teste water.test.ts pina a propriedade.
- **Tags:** agua, fluido, automato-celular, rules, regra-de-ouro, disco-flutuante

## 2026-07-22 — bug-455: nadar pra cima não escalava bloco cheio na borda — jogador bobava na superfície sem sair d
- **Sintoma:** nadar pra cima não escalava bloco cheio na borda — jogador bobava na superfície sem sair da água
- **Onde:** `shared/src/physics.ts`
- **Causa:** ramo submerso do stepPlayer dava só swimSpeed(4) ao pular; ao sair d'água o resíduo (v²/2g≈0.32) não alcança o topo de um bloco na borda, então o jogador afunda de volta.
- **Correção:** constante waterJumpSpeed(7.5) + helper paredeAdjacente (checa sólido nos 4 lados, níveis pés+torso); submerso+pular perto de parede usa o pulo forte (limpa o topo), água aberta mantém swimSpeed. +3 testes em physics.test.ts.
- **Tags:** fisica, agua, nado, physics, water, jump

## 2026-07-21 — bug-447: session.test.ts: expected sent toHaveLength(4), got 5 (join/restore/disconnect)
- **Sintoma:** session.test.ts: expected sent toHaveLength(4), got 5 (join/restore/disconnect)
- **Onde:** `shared/src/session.ts`
- **Causa:** broadcastPlayers() (novo, painel de jogadores) emitia 1 msg 'players' a mais no join/saida - inclusive em singleplayer, quebrando 3 testes de contrato que contam mensagens exatas.
- **Correção:** broadcastPlayers() retorna cedo se this.singleplayer (Web Worker nao gere turma; /kicar e /banir sao do host). Multiplayer segue emitindo aos professores.
- **Tags:** ban, players-panel, singleplayer, test-contract, message-count

## 2026-07-21 — bug-434: Teste 'professor reserva área': esperava chat 'protegida por prof', recebeu broadcast 'Pro
- **Sintoma:** Teste 'professor reserva área': esperava chat 'protegida por prof', recebeu broadcast 'Proteção LIGADA'
- **Onde:** `shared/src/claims.test.ts`
- **Causa:** O place_block do aluno mirava a célula do PRÓPRIO spawn dele (sx,h,sz). A guarda de 'não emparedar jogador' barra o place ANTES do gate de claim — sem chat de claim, o bloco fica Air mas a última chat é a do /claim ligar.
- **Correção:** Mirar célula dentro do claim mas longe do spawn do aluno (sx+1,h,sz+1). Ordem no place_block: reach/overlap-de-jogador ANTES de claimBloqueia.
- **Tags:** claims, test, place-order, player-overlap-guard

## 2026-07-21 — bug-433: blocks.test.ts sentinel: isPlaceable(129) toBe(false) quebrou ao adicionar Agua=129
- **Sintoma:** blocks.test.ts sentinel: isPlaceable(129) toBe(false) quebrou ao adicionar Agua=129
- **Onde:** `shared/src/blocks.test.ts`
- **Causa:** Sentinel de bug-370: o teste fixa o PRÓXIMO byte após o último id como não-colocável. Adicionar bloco (Agua=129) faz o sentinel recorrer, como aconteceu 108→112→116.
- **Correção:** Bumpou o sentinel: expect(BlockId.Agua).toBe(129), isPlaceable(129)=true, isPlaceable(130)=false. MAX_BLOCK_ID=BlockId.Agua em blocks.ts.
- **Tags:** block-add, sentinel, bug-370-recorrencia, agua
- **Relacionados:** bug-370
