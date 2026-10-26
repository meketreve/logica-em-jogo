import { ROTULO_BUILD, rotuloDoBloco } from "@logica/shared";

/**
 * Tela "📜 novidades" do menu principal — registro do que já foi feito no
 * projeto, do primeiro commit (10/07/2026) até hoje. Fonte de verdade ÚNICA
 * do texto: um bloco por marco/checkpoint, sempre o mais novo primeiro (a
 * lista mostra da mais nova pra mais antiga). A pergunta "o que já foi
 * feito?" mora AQUI, não espalhada por commit — mesmo sendo lida DENTRO do
 * jogo, por aluno e professor, então o tom continua lúdico mesmo quando o
 * marco é técnico.
 *
 * ⚠️ **A entrada do topo NÃO leva `data` escrita à mão.** Ela é sempre o
 * build em uso agora, e a data + commit saem de `shared/src/build-info.json`
 * via `rotuloDoBloco()`. Antes ela era rotulada "recém-chegado" à mão, e a
 * string ficou lá por 12 versões de trabalho: nada obrigava ninguém a
 * trocá-la, e com o launcher se atualizando sozinho na escola o professor via
 * "recém-chegado" pra sempre. Com isto, `npm run build`/`npm run dev`
 * relabelam a tela sozinhos.
 *
 * ⚠️ **Não é mais versionado por `npm version` (2026-08-27).** Este projeto
 * não tem executável nem artefato de release: o launcher da escola atualiza
 * comparando COMMIT via API do GitHub, nunca número de versão — bump de
 * semver virou ritual sem função técnica nenhuma. O bloco de cada marco
 * carrega a DATA (às vezes um intervalo, quando o marco levou mais de um
 * dia) em vez de um "vX.Y.Z".
 *
 * ⚠️ **Granularidade não é uniforme de propósito.** Marcos recentes (e os que
 * foram resgatados de uma lacuna) têm um bloco por checkpoint, às vezes um
 * por dia. Marcos antigos que JÁ tinham uma entrada boa (ex.: "Dormir,
 * plantar e sumir") não foram refeitos — juntam vários checkpoints sob a
 * data em que aquele lote ficou pronto. As duas coisas são verdade ao mesmo
 * tempo: nenhum marco do projeto ficou de fora, mas nem todo bloco tem o
 * mesmo tamanho de grão.
 */

interface Mudanca {
  /** Ausente = é o build ATUAL; a data+commit saem do build-info. */
  data?: string;
  titulo: string;
  itens: string[];
}

const MUDANCAS: readonly Mudanca[] = [
  {
    // sem `data`: este é o build atual (ver rotuloDoBloco)
    titulo: "A alavanca não trava mais o jogo",
    itens: [
      "clicar várias vezes seguidas numa **alavanca ligada a um circuito comprido** deixava o jogo travando: cada pedaço de fio que acendia ou apagava redesenhava o pedaço do mundo em volta dele, um de cada vez — com 30 fios, um clique custava mais de um terço de segundo",
      "agora o jogo junta tudo o que mudou e redesenha cada pedaço do mundo **uma vez só** antes de mostrar a tela: o mesmo clique ficou umas vinte vezes mais leve, e a lâmpada continua acendendo na mesma hora",
    ],
  },
  {
    data: "26/10/2026",
    titulo: "Caiu a conexão? O jogo volta sozinho",
    itens: [
      "quando a conexão com o servidor cai no meio do jogo, o tablet agora **tenta entrar de novo sozinho**, com o mesmo nome e PIN: aparece “reconectando…” e, em alguns segundos, você está de volta no mesmo lugar — antes ia direto para o menu, com o aviso “a conexão com o servidor caiu”, e era preciso digitar tudo de novo",
      "se o tablet foi para a tela inicial ou teve a tela bloqueada, ele espera você voltar para o jogo e só então reconecta",
      "se depois de algumas tentativas não der (servidor desligado, Wi-Fi fora), aí sim volta para o menu com o aviso, como antes",
      "para o professor: o registro da aula (`-eventos.log`) agora diz **como** a conexão caiu — com a tela escondida (botão Home, tela bloqueada, outro app) ou com a tela à vista (rede) — e quando o aluno voltou",
    ],
  },
  {
    data: "25/10/2026",
    titulo: "A alavanca de verdade",
    itens: [
      "a **alavanca ganhou modelo novo**, no estilo do Minecraft: uma base de **pedregulho** com um **cabo de madeira** que tomba de um lado para o outro — em vez do pino chapado de antes",
      "desligada o cabo fica **caído**; ligada ele sobe **quase em pé** e a madeira fica em brasa: continua dando para ver de longe, e no projetor, qual alavanca está ligada — a diferença é de ALTURA, não só de cor",
      "vale nas seis faces: a alavanca de parede e a de teto tombam para o lado delas, como a do chão",
    ],
  },
  {
    data: "23/10/2026",
    titulo: "O circuito sobe a parede",
    itens: [
      "o **fio** e a **alavanca** agora podem ser postos em **parede e teto**, não só no chão: a peça cola na cara do bloco em que você clicou, então o circuito pode subir pelo muro, atravessar o teto e descer do outro lado",
      "é a mesma peça da mochila nos seis lados — você não precisa fabricar “fio de parede”, e quebrar qualquer um deles devolve um fio comum",
      "a **lâmpada** e as **portas lógicas** já iam pra parede e pro teto desde sempre (são blocos inteiros), então agora o circuito todo sai do chão",
      "a **placa de pressão** continua só no chão, de propósito: quem a liga é o pé de quem pisa nela, e na parede ela nunca ligaria",
      "e as **portas lógicas** ganharam o atalho do agachar: a saída aponta pra onde você olha, e **segurando Shift (ou o botão ⤓ no tablet) ela aponta pro lado contrário** — dá pra montar a bancada de frente pro aluno sem ter de dar a volta por trás dela",
    ],
  },
  {
    data: "23/10/2026",
    titulo: "O chat do computador ganha a lista de comandos",
    itens: [
      "a **lista de comandos** que só existia no chat do tablet agora aparece no computador também: abra o chat e os comandos estão ali, para clicar em vez de decorar — e quem preferir digitar continua tendo o Tab para completar",
      "o chat **fecha com Enter ou Esc mesmo depois de um clique fora da caixa de texto**: antes, se o clique tirasse o foco do campo, nenhuma das duas teclas respondia e o chat ficava preso aberto",
      "as peças de lógica agora se chamam **porta lógica E** e **porta lógica OU** (eram “porta E” e “porta OU”): na mochila, logo acima da porta de madeira, o nome curto não dizia que aquilo era a peça da aula de lógica",
    ],
  },
  {
    data: "20/10/2026",
    titulo: "Um mundo PLANO para montar a sua aula",
    itens: [
      "opção nova no iniciar-servidor (**[10] Criar mundo PLANO**): um terreno todo liso, sem morro, caverna nem árvore — a folha em branco para você montar a aula em cima",
      "você dá um nome e escolhe o tamanho; o mundo nasce em modo criativo, com todos os blocos à mão, e fica salvo em `mundos/` como qualquer outro (reabre pela opção [8])",
      "o plano não tem tamanho “procedural”: um mundo que se gera conforme você anda não pode ser liso, então aqui as opções são pequeno, médio e grande",
      "e o launcher avisa se você der ao mundo um nome começado em “aula”: esses são os mundos REUTILIZÁVEIS, que voltam ao estado original a cada turma — e por isso não guardariam nada do que você construísse",
      "quando a base virar aula, a opção **[11] Publicar um mundo como AULA** fecha o ciclo: ela copia o seu mundo para a pasta das aulas e o deixa REUTILIZÁVEL — cada turma entra nele do jeito que você montou, e o que uma turma mexer não atrapalha a seguinte",
      "e a opção **[8]** agora mostra as AULAS também, não só os mundos salvos: a aula 7 (a corrida) existia desde sempre no pacote e não aparecia em lugar nenhum do menu — quem quisesse abrir tinha de saber o nome do arquivo",
    ],
  },
  {
    data: "20/10/2026",
    titulo: "O tablet para de cair do jogo",
    itens: [
      "**a tela cheia agora se SEGURA**: quando ela caía (e no tablet ela cai só de encostar no “voltar”), a barra de botões do aparelho reaparecia e ninguém a trazia de volta — bastava uma palma da mão na barra pra criança sair do jogo sem querer. Agora o jogo volta pra tela cheia sozinho no toque seguinte",
      "**o “voltar” do tablet abre o menu de pausa** em vez de levar você embora do jogo: se esbarrou, é só tocar em “▶ voltar ao jogo”. Quem quer sair de verdade continua saindo pelo “💾 salvar e voltar ao menu”",
      "pro professor: o registro da aula (`logs/…-eventos.log`) agora anota **por que** cada pessoa saiu — fechou a página, ficou sem responder, ou entrou de novo noutro aparelho. Antes ele não anotava saída nenhuma, e não dava pra saber se um tablet caiu ou se a criança apertou um botão sem querer",
    ],
  },
  {
    data: "20/10/2026",
    titulo: "Vender o que você colheu",
    itens: [
      "comando NOVO pra todo mundo: **`/vender`** — ele abre um balcão de venda, e o que você puser lá o jogo COMPRA de você em Dimas",
      "o preço aparece ANTES: cada coisa que entra no balcão mostra quanto vale a unidade, e embaixo fica o total do que você vai receber. Só depois é que você aperta **vender**",
      "o dinheiro sai do próprio jogo, não do bolso de um colega: até agora os Dimas da turma eram só os 50 da primeira entrada, e quem gastasse ficava sem jeito de ganhar mais. Agora dá pra plantar, colher e vender",
      "os preços são BAIXOS de propósito (terra, pedra e madeira valem 1 Dimas; trigo 2; pão e carvão 3; lingote de ferro 6; ouro 10; diamante 20) — juntar pra comprar na loja do colega continua custando trabalho",
      "tem preço o que você COLHE, cria ou derrete: bloco do chão, madeira, as plantações, algodão, carvão e os lingotes. Coisa FABRICADA (mesa, cama, porta, peça de circuito, picareta) não se vende — o balcão devolve e avisa",
      "e nada se perde: o que ficar no balcão quando você fechar volta sozinho pra sua mochila",
    ],
  },
  {
    data: "20/10/2026",
    titulo: "O circuito sente o seu pé",
    itens: [
      "pe\u00e7a NOVA na aba circuito: a **placa de press\u00e3o**. Voc\u00ea PISA nela e o circuito liga; sai de cima e desliga \u2014 \u00e9 a primeira entrada que n\u00e3o se aciona com a m\u00e3o",
      "com ela d\u00e1 pra montar desafio de grupo: duas placas ligadas numa porta E s\u00f3 acendem a l\u00e2mpada se DUAS pessoas pisarem ao mesmo tempo",
      "ela \u00e9 fininha e fica no ch\u00e3o: d\u00e1 pra andar por cima sem tropeçar, e ela afunda um tiquinho quando algu\u00e9m est\u00e1 em cima",
      "na bancada: 2 pedregulhos (\u00e9 a pe\u00e7a mais barata do circuito, pra dar pra espalhar v\u00e1rias pela sala)",
    ],
  },
  {
    data: "19/10/2026",
    titulo: "Agora dá pra ver o circuito",
    itens: [
      "a L\u00c2MPADA ACESA ILUMINA de verdade, e com a mesma for\u00e7a de uma tocha: o circuito aceso clareia a sala \u2014 d\u00e1 pra usar o circuito pra iluminar o que voc\u00ea construiu",
      "o FIO virou um caminho mesmo: ele se liga ao vizinho e faz curva, T e cruzamento \u2014 e quando sobe, aparece um poste. O desenho mostra EXATAMENTE por onde o sinal passa, nem um tracinho a mais",
      "as portas E e OU viraram CHIPS: corpo recuado, com o pino de SA\u00cdDA na frente e dois pinos de ENTRADA nos lados. Dá pra ver pra onde a porta aponta de qualquer \u00e2ngulo, sem precisar ler a letra",
      "e cada pino de entrada ACENDE sozinho quando aquele lado j\u00e1 recebeu sinal: a linha da tabela-verdade aparece na pr\u00f3pria pe\u00e7a, antes mesmo da l\u00e2mpada",
      "a ALAVANCA agora fica EM P\u00c9 quando est\u00e1 ligada e DEITADA quando est\u00e1 desligada \u2014 a diferen\u00e7a deixou de ser s\u00f3 a cor",
      "de cima, cada porta mostra a letra E (ou o anel da OU) e uma SETA que aponta pra sa\u00edda",
      "e a ILUMINA\u00c7\u00c3O ficou suave: a luz passou a variar DENTRO de cada bloco em vez de mudar de degrau em degrau \u2014 o halo de uma tocha (ou de uma l\u00e2mpada) vira um c\u00edrculo macio no ch\u00e3o, n\u00e3o um quadrado",
    ],
  },
  {
    data: "19/10/2026",
    titulo: "O jogo confere o seu circuito",
    itens: [
      "peça NOVA na aba circuito: a **porta OU** \u2014 ela deixa o sinal passar quando ALGUMA das duas entradas está ligada (a porta E exige as DUAS)",
      "a OU tem a mesma forma e a mesma seta da E, e custa o mesmo: o que muda é só a REGRA \u2014 dá pra trocar uma pela outra na mesa e ver a diferença na hora",
      "de cima, a E tem barras retas e a OU tem um anel redondo: dá pra saber qual é qual olhando a mesa de longe",
      "objetivo NOVO para o professor: \u201cacender\u201d \u2014 ele monta um circuito na \u00e1rea, cria o objetivo, e o jogo confere sozinho quando a l\u00e2mpada acende",
      "e confere DIREITO: o jogo fotografa as pe\u00e7as na hora de criar o desafio, ent\u00e3o vale acender mexendo nas ALAVANCAS \u2014 encostar uma alavanca na l\u00e2mpada, ou puxar um fio por fora da porta E, n\u00e3o ganha",
      "se voc\u00ea mexer no circuito sem querer, o HUD avisa quantas pe\u00e7as est\u00e3o fora do lugar: \u00e9 s\u00f3 devolver como estava",
      "cada grupo tem o SEU desafio e o seu progresso, como nos objetivos de construir e de chegar; e \u201czerar progresso\u201d desliga as alavancas e apaga a l\u00e2mpada, deixando o desafio pronto pra pr\u00f3xima turma",
      "o aviso de objetivo conclu\u00eddo parou de sair com a frase repetida (\u201cobjetivo conclu\u00eddo: objetivo conclu\u00eddo: \u2026\u201d)",
    ],
  },
  {
    data: "16/10/2026",
    titulo: "A luz acende quando você manda",
    itens: [
      "chegaram os PRIMEIROS BLOCOS DE LÓGICA, na aba \u201ccircuito\u201d da mochila: alavanca, fio, lâmpada e a porta E",
      "a alavanca liga e desliga no clique (ou no ▣ do tablet); o fio leva o sinal pela mesa, pelo chão e até subindo a parede; e a lâmpada acende quando o sinal chega",
      "encostar também funciona: alavanca colada na lâmpada já acende — o fio serve pra ESPALHAR o circuito, não é pedágio",
      "a PORTA E é a peça que pensa: ela só deixa o sinal passar quando as DUAS entradas (os lados dela) estão ligadas. A saída é a seta, e ela aponta pra onde você estava olhando quando colocou",
      "dá pra ligar uma porta na outra: com duas, a lâmpada só acende com as três alavancas ligadas",
      "as receitas estão na bancada: alavanca (graveto + pedregulho), fio (8 por lingote de ferro), lâmpada (vidro + ferro) e porta E (2 pedregulhos + 2 ferros)",
      "em mundo com proteção de áreas ligada, as peças de circuito só entram DENTRO do seu terreno (ou do terreno de quem te convidou pro grupo de amigos)",
      "e uma de arrumação: o chat agora tem teto de TAMANHO de verdade — frase com acento cabe inteira como sempre, mas parede de emoji para de crescer no meio do caminho",
    ],
  },
  {
    data: "15/10/2026",
    titulo: "Um painel só, e o chat sem bagunça",
    itens: [
      "o painel de AMIGOS virou uma aba do seu painel: a aula e os amigos moram no mesmo lugar, com a mesma tecla, o mesmo botão e o mesmo \u2715 fechar — nada de dois painéis parecidos pra decorar",
      "no tablet, os botões de comando que aparecem quando você abre o chat passaram a mostrar SÓ os comandos que são seus: eram 26 para todo mundo, e os que a turma pode usar ficavam espalhados no meio (alguns só rolando a lista) — agora são 10, e todos cabem na tela mesmo com o teclado aberto",
      "e os botões ficaram mais espertos: tocar num comando que precisa do nome de alguém (pedir teleporte com /tpp, convidar pro grupo de amigos) agora mostra a LISTA de quem está na aula — é só tocar no nome, sem digitar nada",
      "no /tpa (aceitar teleporte) a lista é melhor ainda: ela mostra só QUEM REALMENTE PEDIU, e só aparece quando há mais de um pedido ao mesmo tempo — com um só, um toque já aceita",
      "ver a hora, o modo de jogo ou as regras virou UM toque: antes o botão abria uma lista de opções que o servidor ia recusar de você",
      "o professor continua com a lista inteira, e os comandos de dar aula vêm primeiro",
    ],
  },
  {
    data: "13/10/2026",
    titulo: "Seu nome volta com você",
    itens: [
      "se o navegador fechar sem sair do jogo, voltar com o mesmo nome agora é NA HORA: você entra direto e a sessão que tinha ficado pendurada se fecha sozinha — antes o jogo respondia \"já existe alguém em jogo com esse nome\" e a criança ficava trancada esperando",
      "quem tentar entrar no seu lugar sem saber o seu PIN continua de fora",
      "e o jogo ficou mais justo para te desconectar: ele só considera \"silêncio\" depois de perguntar três vezes de verdade, e engasgo do computador do professor não conta contra você",
    ],
  },
  {
    data: "10/10/2026",
    titulo: "Dá pra voltar atrás",
    itens: [
      "no menu \"meus mundos\", quem tem um mundo antigo que o jogo converteu sozinho ganhou o botão RESTAURAR: ele traz de volta uma cópia do mundo como ele era antes da conversão",
      "e traz como cópia NOVA, ao lado: o mundo que você vem jogando continua intacto, e aí é só escolher qual dos dois abrir (e apagar o outro, se quiser)",
      "o botão só aparece no mundo que realmente tem essa cópia guardada — nos outros a lista continua igual",
      "quando o professor encerra o servidor (Ctrl+C ou fechando a janela), o mundo agora é gravado com folga de sobra: a gravação disputava corrida com o programa que embrulhava o servidor, e num mundo grande dava pra perder os últimos segundos da aula",
    ],
  },
  {
    data: "05/10/2026",
    titulo: "Cada ferramenta serve pra uma coisa",
    itens: [
      "agora você SEGURA o botão pra quebrar um bloco, e vê a rachadura crescer nele até ele cair (no tablet, segure o ⛏)",
      "a ferramenta certa quebra MUITO mais rápido: a picareta de diamante abre pedra num piscar, a de madeira demora",
      "soltou o botão, a rachadura some e o bloco continua inteiro — nada de quebra pela metade guardada",
      "a picareta precisa estar NA MÃO, não só na mochila: se ela estiver guardada, o jogo avisa pra você pegá-la",
      "toda picareta tem vida: uma barrinha no cantinho do slot mostra quanto falta, verde → amarela → vermelha",
      "quando a vida acaba, a picareta quebra e some da mão, com aviso e som — é hora de fabricar outra",
      "cavar terra e areia com a picareta na mão não gasta a picareta (ela só gasta no que é serviço dela)",
      "o jogo não desconecta mais a turma toda de uma vez quando o computador do professor trava ou dorme por um tempo — antes, quando ele voltava, todo mundo tinha sido posto pra fora sem ter feito nada",
      "e se você for mesmo desconectado, o jogo agora te leva de volta ao painel inicial dizendo o motivo — antes a tela ficava parada num mundo que não respondia mais, e só recarregando a página dava pra voltar",
      "o voo liberado pelo professor agora fica salvo no mundo: antes, toda vez que o servidor era reiniciado o voo voltava desligado e precisava ser liberado de novo",
      "cada aula guarda o próprio voo: as aulas começam com ele desligado, e só nascem voando se a aula tiver sido criada assim",
      "o registro da aula virou uma pasta \"logs\" dentro da pasta do mundo, com um arquivo por aula marcado com a data e a hora — antes era um arquivo único que crescia sem parar (o maior aqui chegou a 344 KB e não abria direito no bloco de notas)",
      "e esse registro vem separado em dois: num arquivo fica só o que as pessoas falaram, no outro só os avisos do servidor — que eram o que enchia tudo, porque se repetem a cada vez que alguém entra no jogo",
      "chegaram o MACHADO e a PÁ, nos mesmos quatro materiais da picareta (madeira, pedra, ferro e diamante) — o machado custa 3 do material + 2 gravetos, e a pá é a ferramenta mais barata do jogo: 1 do material + 2 gravetos",
      "o machado derruba árvore, tábua, cerca, porta, baú e móvel bem mais rápido; a pá cava terra, grama, areia, cascalho e neve",
      "nenhum dos dois é obrigatório: dá pra tirar madeira e cavar terra de mão nua como sempre — eles só deixam o serviço mais rápido (e só gastam no serviço deles)",
      "em compensação, derrubar tronco de mão nua ficou mais devagar que antes: com o machado de madeira você volta ao tempo de sempre, e com os melhores fica num instante",
      "no tablet, se o navegador for fechado ou minimizado sem sair do jogo, o servidor percebe em alguns segundos e libera o seu nome — antes você ficava \"preso em jogo\" e não conseguia entrar de novo",
      "na loja, agora dá pra pôr preço em pão, trigo, picareta, carvão e nos outros itens — antes o jogo respondia \"Item inválido\" e o preço não colava",
    ],
  },
  {
    data: "12/09/2026",
    titulo: "Consertos de cama, porta, loja e torre",
    itens: [
      "deitado na cama, aperte PULAR pra levantar (no tablet, o botão ⤒) — antes só dava pra sair andando pra longe, e num quarto apertado a gente ficava preso",
      "deitar clicando na cama de longe não te levanta mais sozinho assim que você mexe o olhar",
      "camas colocadas uma atrás da outra agora formam camas certinhas, cada uma com seu travesseiro — e quebrar a fila não dá mais cama de graça",
      "as camas dos mundos já salvos são arrumadas sozinhas quando o mundo abre",
      "porta em cima de porta: abrir a de baixo não desmancha mais as duas, e quebrar não dá porta de graça",
      "pular e colocar bloco embaixo de si agora sobe a torre direitinho — antes o jogo te jogava pro lado",
      "o preço digitado no último item da loja não se perde mais ao fechar com Esc — e o que você está digitando não some quando o estoque muda no meio",
      "loja com muitos itens agora rola: o comprador alcança até o último item, e o dono vê estoque, preços e mochila ao mesmo tempo",
      "item com preço que acabou no estoque continua na lista de preços (marcado \"sem estoque\"), em vez de sumir como se o preço tivesse sido apagado",
      "por dentro: o mundo agora tem espaço pra centenas de blocos novos (os circuitos lógicos vêm aí) — os mundos já salvos são convertidos sozinhos ao abrir, e uma cópia do original fica guardada",
    ],
  },
  {
    data: "03–06/09/2026",
    titulo: "Seu personagem ganha corpo",
    itens: [
      "chega de caixinha lisa: agora você tem cabeça, tronco, braços e pernas, com braço e perna balançando de verdade ao andar e correr",
      "tecla C liga a câmera em 3ª pessoa (pra ver o próprio corpo) — mirar, quebrar e colocar bloco continuam sempre pelo olho, não pela câmera",
      "menu de emojis (tecla V, o professor liga com /regra emogis ligar): aceno, comemorar e dança — a câmera vira 3ª pessoa sozinha durante o gesto e a turma toda vê",
      "dar um soco ou abrir baú/porta/cama agora mostra o gesto pros colegas também, não só pra você",
      "sua cabeça acompanha pra onde você está mirando, com um limite de giro que imita o pescoço de verdade",
      "Ctrl+C no iniciar-servidor.bat durante uma pergunta agora fecha de vez — antes pulava a pergunta e continuava rodando",
    ],
  },
  {
    data: "02/09/2026",
    titulo: "Loja: monte seu comércio",
    itens: [
      "crafte um Baú-Loja, coloque no seu terreno, e ele vira uma lojinha de verdade — você escolhe o que vende e por quanto",
      "qualquer colega pode comprar de você, mesmo quem não é do seu grupo de amigos",
      "pagamento é em Dimas, a moeda própria do jogo — todo aluno já começa com um saldo",
    ],
  },
  {
    data: "02/09/2026",
    titulo: "Menos uma pergunta pra ligar o servidor",
    itens: [
      "o launcher não pergunta mais sobre \"água por tick\" — era um ajuste raro que quase ninguém usava",
    ],
  },
  {
    data: "01/09/2026",
    titulo: "Servidor não trava mais com a turma toda",
    itens: [
      "com a turma inteira conectada e todo mundo andando ao mesmo tempo, os comandos ficavam atrasados — corrigido",
    ],
  },
  {
    data: "28/08/2026",
    titulo: "Levar pra escola sem instalar nada",
    itens: [
      "no Windows, o iniciar-servidor.bat agora baixa o Node.js sozinho e guarda numa pastinha dentro do próprio projeto — não precisa mais ter Node instalado no computador do laboratório",
    ],
  },
  {
    data: "28/08/2026",
    titulo: "5 jeitos de segurar o tablet",
    itens: [
      "nas opções: destro (padrão), canhoto (espelhado), compacto, espalhado ou direcional (setas em vez de manche) — e os botões ajustam o tamanho sozinhos conforme a tela do aparelho",
    ],
  },
  {
    data: "27/08/2026",
    titulo: "Comandos em português",
    itens: [
      "/claim virou /terreno, /resetpin virou /redefinirpin, /tpr virou /tpp e /kicar virou /expulsar — os poucos comandos que ainda tinham nome em inglês",
    ],
  },
  {
    data: "27/08/2026",
    titulo: "Silêncio, por favor",
    itens: [
      "/silenciar: o professor liga e desliga o chat da turma inteira com um comando — mensagens de colega somem da tela de todo mundo, comandos continuam passando normal",
    ],
  },
  {
    data: "26/08/2026",
    titulo: "Turma inteira, cada aluno na sua área",
    itens: [
      "o limite de grupos de uma aula subiu de 20 para 35 — dá pra criar uma área individual mesmo em turma grande",
    ],
  },
  {
    data: "25/08/2026",
    titulo: "Um jeito de jogar fora",
    itens: [
      "botão 🗑️ descarta item da mochila ou do baú sem perguntar duas vezes — a mochila para de entupir de terra e pedregulho",
    ],
  },
  {
    data: "25/08/2026",
    titulo: "O painel do dedo sai de cima do teclado",
    itens: [
      "no tablet, com o teclado virtual aberto, o painel de comandos rápidos vira uma coluna ao lado do chat em vez de empilhar em cima do campo de digitar — cabe muito mais comando visível sem rolar",
    ],
  },
  {
    data: "25/08/2026",
    titulo: "O servidor não esquece mais quando a janela fecha",
    itens: [
      "fechar a janela do servidor (não só apertar Ctrl+C) agora salva o mundo antes de desligar — antes, esse jeito de fechar podia perder o que mudou desde o último salvamento automático",
    ],
  },
  {
    data: "23/08/2026",
    titulo: "O voltar fica à mão",
    itens: [
      "nesta tela o “← voltar” subiu para o topo e GRUDA ali enquanto a lista rola — não é mais preciso rolar as novidades inteiras até o fim para sair",
    ],
  },
  {
    data: "23/08/2026",
    titulo: "Orgulho da minha terra!",
    itens: [
      "o rodapé do menu ganhou as bandeiras do Brasil, de Santa Catarina e de Araranguá, com o nome da E.E.B. Prof.ª Otília da Silva Berti",
      "são os símbolos OFICIAIS, conferidos um a um: a de Araranguá segue a Lei municipal 547/1972 — faixa azul do mar que banha a costa, branca e vermelha da integração com o estado, amarela da beleza das praias — e a de Santa Catarina traz o losango verde-claro com as Armas do Estado",
      "por que isso está no jogo: quase todo jogo se passa num lugar que o aluno não conhece e não sabe apontar no mapa. Ver a bandeira do próprio município ao lado da do país, e o nome da própria escola escrito na abertura, troca “alguém fez isso” por “isso é nosso” — e quem está ali não é uma escola qualquer, é a Otília da Silva Berti, com o mesmo peso do Brasil e de Santa Catarina na mesma linha",
      "a frase engraçada do menu gira para o outro lado, passa por cima do painel e não é mais cortada quando é comprida",
      "as frases do menu perderam o bicho emprestado de outro jogo e as repetidas (eram 149, agora são 118)",
      "ao atualizar, o launcher reconstrói a tela do jogo sozinho — o que foi corrigido chega inteiro, sem depender de um passo manual",
    ],
  },
  {
    data: "12–22/08/2026",
    titulo: "Dormir, plantar e sumir",
    itens: [
      "/invisivel: o professor some para os alunos e atravessa paredes, para observar a turma trabalhando sem virar atração (outros professores continuam vendo)",
      "durma na cama para passar a noite — e ela vira o seu ponto de renascimento",
      "muda de árvore: quebre a FOLHA de uma árvore e ela pode largar a muda da própria espécie (1 em 10); plante na terra e ela cresce virando a árvore do bioma (carvalho, ipê, araucária, pau-brasil)",
      "aba “todos” no inventário: procure qualquer bloco por nome ou por número",
      "“lã <cor>” virou “bloco de algodão <cor>” — o nome agora bate com o que é",
      "painel do professor rola: a seção de grupos deixou de ficar inalcançável em tela baixa",
      "/painel no chat e botão 📋 na barra do tablet — o painel de autoria deixou de depender da tecla P, que não existe no dedo",
      "/aula grupos X cria a área de cada grupo copiando a célula-molde, e o painel P ganhou a aba de grupos",
      "grama espalha devagar (1 célula a cada 3s) em vez de tomar conta do mundo",
      "conserto do soterramento: quem é enterrado no subsolo agora sufoca de verdade em vez de ser cuspido lá na superfície",
      "menu principal com fundo 3D feito de prints reais do mundo, splash e a tela “📜 novidades”",
      "sol quadrado, estilo Minecraft",
    ],
  },
  {
    data: "12/08/2026",
    titulo: "Auto-update aprovado na escola",
    itens: [
      "a atualização do jogo rodou e fechou na escola: o servidor avisa quantos commits ficou pra trás e se atualiza sozinho",
      "consertos finais no launcher (os erros de “não é reconhecido como um comando” sumiram)",
    ],
  },
  {
    data: "11/08/2026",
    titulo: "Tooltip de item",
    itens: [
      "passe o mouse (ou segure o dedo) num item e ele explica o que é e para que serve",
      "o céu e o profiler continuam — e as ferramentas novas (picareta, machado e pá) mostraram onde aparecem",
    ],
  },
  {
    data: "08–09/08/2026",
    titulo: "Carregar não trava mais",
    itens: [
      "mundo grande passou a preparar o desenho nos workers, fora da tela principal — a trava de abrir foi de 9,5 segundos pra 99 milissegundos",
    ],
  },
  {
    data: "08/08/2026",
    titulo: "Mochila mais fácil de usar",
    itens: [
      "comer virou possível no tablet; a mochila ganhou ícone próprio (🎒), arrastar-e-soltar e shift-clique no computador",
    ],
  },
  {
    data: "07/08/2026",
    titulo: "6 plantações novas",
    itens: [
      "cenoura, batata, beterraba, melancia, banana e aipim — plante, colha, e a batata também dá pra cozinhar",
    ],
  },
  {
    data: "05/08/2026",
    titulo: "Craft, forja e o primeiro soco",
    itens: [
      "fornalha funde ferro e ouro do minério; baú guarda item com painel de transferência (tocar origem → tocar destino)",
      "4 picaretas, de madeira a diamante — sem elas na mão, o bloco não quebra",
      "algodão troca de lugar com a lã-de-trigo: cultive e transforme em bloco de algodão",
      "/pvp liga o soco entre jogadores (desligado por padrão)",
      "receitas de craft foram de 12 para 110 — quase tudo que dá pra construir tem uma",
    ],
  },
  {
    data: "04/08/2026",
    titulo: "Um clique cria mundo de sobrevivência",
    itens: [
      "preset pronto no menu: fome, vida, craft e o resto ligados de uma vez, sem precisar digitar comando por comando",
      "grupos de amigos: proteja sua construção deixando só quem você convidar mexer nela",
    ],
  },
  {
    data: "03/08/2026",
    titulo: "Mochila, criar e comer",
    itens: [
      "a mochila virou de verdade — item fica guardado, craft é por lista (sem grade 3×3), e comida cura a fome",
    ],
  },
  {
    data: "03/08/2026",
    titulo: "A corrida dos 4 postos",
    itens: [
      "novo mapa pedagógico: corrida em equipe passando por 4 postos, em ordem",
    ],
  },
  {
    data: "02/08/2026",
    titulo: "Sobrevivência: liga o interruptor",
    itens: [
      "fome e vida entram no jogo — o professor decide, por mundo ou por aluno, se a sobrevivência está ligada",
      "cair de uma certa altura machuca; sem comer, a fome desce",
    ],
  },
  {
    data: "28–30/07/2026",
    titulo: "Luz de verdade e cavernas",
    itens: [
      "a luz passa a se espalhar de verdade pelo mundo (céu e tocha), em vez de acender bloco por bloco",
      "cavernas e relevo por bioma brasileiro entram na geração automática do terreno",
    ],
  },
  {
    data: "27/07/2026",
    titulo: "O vento sopra",
    itens: [
      "nuvens e folhagem balançam com o vento — só visual, o professor liga e desliga",
    ],
  },
  {
    data: "27/07/2026",
    titulo: "Controles próprios pro tablet",
    itens: [
      "menu, inventário/hotbar e chat/HUD ganharam layout pensado pra tela de toque, não só esticado do computador",
    ],
  },
  {
    data: "26/07/2026",
    titulo: "Água que corre",
    itens: [
      "a correnteza passou a escolher a própria direção — antes seguia o vento igual a água parada",
    ],
  },
  {
    data: "25/07/2026",
    titulo: "Vidro colorido, lajes e escadas",
    itens: [
      "12 cores de vidro, e blocos de meio bloco (laje e escada) com colisão do tamanho certo",
    ],
  },
  {
    data: "22–23/07/2026",
    titulo: "Água transparente",
    itens: [
      "novo material de água, sem os furinhos do antigo — e a mira/colisão passaram a respeitar a forma real de blocos que não são um cubo inteiro",
    ],
  },
  {
    data: "21/07/2026",
    titulo: "Água, claim e turma",
    itens: [
      "água fluida com balde (caia, espalhe, encha baldes)",
      "claim do professor + painel de jogadores com banimento",
      "tudo funciona no celular e com a turma em rede",
      "profiler com relatório de 10s (min/méd/p95) salvo no servidor",
    ],
  },
  {
    data: "21/07/2026",
    titulo: "Primeiro piloto na escola",
    itens: [
      "mundo grande carrega por perto (só o que o aluno vê existe de verdade), e o save guarda só o que mudou — sem isso um mundo grande não caberia em memória nenhuma",
      "primeiro piloto de verdade: todas as turmas da escola jogaram, incluindo o Atendimento Educacional Especializado",
    ],
  },
  {
    data: "20/07/2026",
    titulo: "O mundo cresce sozinho",
    itens: [
      "geração automática de terreno com biomas brasileiros e serras — antes cada mundo era desenhado bloco a bloco",
      "mais 3 cenários pedagógicos (decifrar, simetria e manual) com fases em sequência",
      "o jogo passa a mostrar a própria versão na tela pela primeira vez",
    ],
  },
  {
    data: "19/07/2026",
    titulo: "Casa, clima e móveis",
    itens: [
      "dia e noite com sol, lua e estrelas de verdade",
      "tapete, janela que abre e fecha, mesa, cadeira, sofá, cama e quadro (com texto e imagem) — a primeira leva de móveis",
      "mundo em 3 tamanhos (P/M/G)",
    ],
  },
  {
    data: "17–18/07/2026",
    titulo: "Ninguém mexe no que não é seu",
    itens: [
      "/voo pro professor, e bedrock protegendo o chão do mundo",
      "confinamento: cada grupo só constrói e quebra na própria área — nasce o sistema anti-griefing",
    ],
  },
  {
    data: "15–16/07/2026",
    titulo: "A aula troca ao vivo",
    itens: [
      "o professor troca de cenário pedagógico sem ninguém precisar sair e entrar de novo",
      "ciclo de dia e noite, /kicar, e o primeiro piloto de controles de toque pro tablet",
    ],
  },
  {
    data: "13/07/2026",
    titulo: "Correr, guardar e construir mais",
    itens: [
      "correr e agachar, inventário de verdade, e blocos novos (inclusive transparentes)",
    ],
  },
  {
    data: "12–13/07/2026",
    titulo: "O núcleo pedagógico nasce",
    itens: [
      "regiões marcadas, cenários com objetivo e grupos de alunos — a base de toda atividade guiada que o jogo tem hoje",
      "painéis em HTML por cima do jogo, e o mundo “cabines” fecha essa fase",
    ],
  },
  {
    data: "11–12/07/2026",
    titulo: "Salvar o mundo e conhecer quem joga",
    itens: [
      "o mundo passa a ser salvo e recarregado pelo servidor",
      "PIN e o papel de professor entram no login — antes, era todo mundo igual",
    ],
  },
  {
    data: "10–11/07/2026",
    titulo: "O primeiro passo",
    itens: [
      "nasce o projeto: um mundo em que dá pra andar, o servidor decide o que é verdade (não o computador do jogador), e dá pra colocar e quebrar bloco",
      "areia cai sozinha, um segundo jogador entra pela rede, e chega o chat — junto com o primeiro comando, /bloco",
    ],
  },
];

/** Monta a tela de novidades num corpo (mesmo jeito da tela de configurações). */
export function buildChangelogScreen(body: HTMLElement, onBack: () => void): void {
  body.textContent = "";

  // O voltar vem PRIMEIRO (2026-08-23): esta é a única tela do menu que rola
  // por dentro, e a lista só cresce a cada release — com o botão no fim, sair
  // dela exigia rolar o changelog inteiro até o rodapé. A faixa em volta existe
  // para ele poder GRUDAR no topo (`position: sticky`): sozinho, o botão não
  // cobre a largura do painel e a lista rolaria visível ao lado dele.
  const topo = document.createElement("div");
  topo.className = "changelog-topo";
  const back = document.createElement("button");
  back.type = "button";
  back.className = "menu-back";
  back.textContent = "← voltar";
  back.addEventListener("click", onBack);
  topo.appendChild(back);
  body.appendChild(topo);

  const atual = document.createElement("p");
  atual.className = "menu-hint";
  atual.textContent = `build atual: ${ROTULO_BUILD}`;
  body.appendChild(atual);

  for (const m of MUDANCAS) {
    const bloco = document.createElement("section");
    bloco.className = "changelog-bloco";

    const h = document.createElement("h3");
    h.textContent = `${rotuloDoBloco(m.data)} — ${m.titulo}`;
    bloco.appendChild(h);

    const lista = document.createElement("ul");
    for (const item of m.itens) {
      const li = document.createElement("li");
      li.textContent = item;
      lista.appendChild(li);
    }
    bloco.appendChild(lista);

    body.appendChild(bloco);
  }

}
