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
