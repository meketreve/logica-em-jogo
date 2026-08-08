/**
 * IDs de bloco. Gravados como bytes crus nos chunks (Uint8Array), no save e no
 * world_snapshot — NUNCA renumerar um ID existente; só adicionar no fim.
 */
export const BlockId = {
  Air: 0,
  Grass: 1,
  Stone: 2,
  Cobblestone: 3,
  Sand: 4,
  // Grupo A (2026-07-11): cubos opacos. Transparentes (vidro/folhas/água) e
  // não-cubos (tocha/laje) ficam pra depois — exigem mudança no mesher.
  Dirt: 5,
  Log: 6,
  Planks: 7,
  Brick: 8,
  Gravel: 9,
  /** Indestrutível pra jogador (professor delimita arena); /bloco passa por cima. */
  Bedrock: 10,
  // 8 lãs coloridas — base da pedagogia de "sequência de blocos coloridos".
  WoolWhite: 11,
  WoolBlack: 12,
  WoolRed: 13,
  WoolOrange: 14,
  WoolYellow: 15,
  WoolGreen: 16,
  WoolBlue: 17,
  WoolPurple: 18,
  // cp17 (2026-07-13): 2º lote de cubos opacos + 4 lãs (sequências mais ricas).
  Sandstone: 19,
  StoneBricks: 20,
  Snow: 21,
  Obsidian: 22,
  WoolPink: 23,
  WoolCyan: 24,
  WoolGray: 25,
  WoolBrown: 26,
  // cp18 (2026-07-13): grupo B — transparentes (cutout/alphaTest no cliente).
  Glass: 27,
  Leaves: 28,
  // cp20 (2026-07-16): blocos-glifo — letras A–Z e dígitos 0–9. Cubos opacos
  // (mesmo caminho das lãs); pedagogia de soletrar palavras / escrever números.
  // APPEND only: A=29 … Z=54, 0=55 … 9=64. LetterA e Digit0 são as âncoras dos
  // loops que derivam tiles/nomes (ver GLYPH em mesher.ts).
  LetterA: 29, LetterB: 30, LetterC: 31, LetterD: 32, LetterE: 33, LetterF: 34,
  LetterG: 35, LetterH: 36, LetterI: 37, LetterJ: 38, LetterK: 39, LetterL: 40,
  LetterM: 41, LetterN: 42, LetterO: 43, LetterP: 44, LetterQ: 45, LetterR: 46,
  LetterS: 47, LetterT: 48, LetterU: 49, LetterV: 50, LetterW: 51, LetterX: 52,
  LetterY: 53, LetterZ: 54,
  Digit0: 55, Digit1: 56, Digit2: 57, Digit3: 58, Digit4: 59,
  Digit5: 60, Digit6: 61, Digit7: 62, Digit8: 63, Digit9: 64,
  // cp23 (2026-07-17): grupo C rodada 1 — primeiros NÃO-CUBOS (forma custom no
  // mesher). O ESTADO da porta (eixo + aberta/fechada) mora no PRÓPRIO id:
  // abrir = trocar o byte via block_changed, mesma engrenagem de tudo.
  Cerca: 65,
  /** Porta fina no eixo X (lâmina fina em x, bloqueia passagem leste-oeste).
   *  Ocupa 2 células verticais com o MESMO id; a metade de cima se reconhece
   *  pelo vizinho de baixo. Clique direito alterna fechada↔aberta. */
  PortaXFechada: 66,
  PortaXAberta: 67,
  PortaZFechada: 68,
  PortaZAberta: 69,
  /** Decorativa (sem luz voxel — decisão 2026-07-17): brilha por textura +
   *  halo no cliente. Precisa de cubo cheio embaixo; sem suporte, some. */
  Tocha: 70,
  // Tapetes (backlog 2026-07-19): lã FINA no chão (1/16 da célula), decorativo.
  // Mesmas 12 cores das lãs (tile reusado — zero pintura nova); atravessável
  // (colisão desprezível, estilo Minecraft) e precisa de cubo cheio embaixo
  // (mesma regra da tocha). Ordem = âncora TapeteBranco + offset (loops).
  TapeteBranco: 71, TapetePreto: 72, TapeteVermelho: 73, TapeteLaranja: 74,
  TapeteAmarelo: 75, TapeteVerde: 76, TapeteAzul: 77, TapeteRoxo: 78,
  TapeteRosa: 79, TapeteCiano: 80, TapeteCinza: 81, TapeteMarrom: 82,
  /** Janela (backlog 2026-07-19): painel de vidro com moldura que abre/fecha
   *  no clique direito — mesmo desenho da porta (estado no ID, dobradiça na
   *  aresta do canto), mas UMA célula só (sem par vertical). */
  JanelaXFechada: 83,
  JanelaXAberta: 84,
  JanelaZFechada: 85,
  JanelaZAberta: 86,
  // Móveis decorativos (backlog 2026-07-19): mesa simétrica; cadeira/sofá/
  // cama têm 4 DIREÇÕES no id (sufixo = pra onde a FRENTE aponta; XP=+x,
  // ZP=+z, XN=−x, ZN=−z — a ordem é a rotação de 90° em 90°). A hotbar tem
  // UMA entrada; o cliente escolhe a direção pelo olhar na hora do place.
  // Sem interação (decisão de escopo) — colisão de célula cheia, forma no mesher.
  Mesa: 87,
  CadeiraXP: 88, CadeiraZP: 89, CadeiraXN: 90, CadeiraZN: 91,
  SofaXP: 92, SofaZP: 93, SofaXN: 94, SofaZN: 95,
  CamaXP: 96, CamaZP: 97, CamaXN: 98, CamaZN: 99,
  /** Quadro (backlog 2026-07-19): painel fino de parede com CONTEÚDO (texto/
   *  imagem — ver quadros.ts). 4 direções como os móveis; clique direito abre
   *  o editor no cliente. Atravessável (painel na parede). */
  QuadroXP: 100, QuadroZP: 101, QuadroXN: 102, QuadroZN: 103,
  /** Flores decorativas (2026-07-20): plantinha fina em cruz, ATRAVESSÁVEL,
   *  precisa de apoio (some sem chão embaixo — regra da tocha). */
  FlorVermelha: 104, FlorAmarela: 105, FlorAzul: 106, FlorBranca: 107,
  /** Porta com DOBRADIÇA na aresta ALTA do flanco (variante "R") — espelho das
   *  portas base (66-69, dobradiça na aresta baixa). O servidor escolhe qual
   *  variante gravar no place_block pelos vizinhos (parede/porta ao lado), não
   *  o cliente: 2 portas lado a lado abrem pro meio (dobradiça oposta). APPEND
   *  (não dá pra numerar junto das base sem quebrar bytes de save antigos) —
   *  isPorta cobre os 2 trechos. Fechada é idêntica à base (varre o vão todo);
   *  só a ABERTA muda de lado (dobra na parede ALTA em vez da baixa). */
  PortaXFechadaR: 108,
  PortaXAbertaR: 109,
  PortaZFechadaR: 110,
  PortaZAbertaR: 111,
  /** Janela com DOBRADIÇA na aresta ALTA do flanco (variante "R") — igual às
   *  portas R, mas 1 célula só. O servidor escolhe a variante no place_block
   *  pelos vizinhos (parede/janela ao lado). APPEND depois das portas R;
   *  isJanela cobre os 2 trechos. Fechada idêntica à base; só a ABERTA muda de
   *  lado (dobra na parede ALTA em vez da baixa). */
  JanelaXFechadaR: 112,
  JanelaXAbertaR: 113,
  JanelaZFechadaR: 114,
  JanelaZAbertaR: 115,
  /** Minérios (2026-07-20): porta de entrada do survival — por ora SÓ cubos
   *  com textura placeholder (pedra + pepitas + sigla). Drop/craft/ferramenta
   *  = fase própria. Nascem em veias no subsolo do gen procedural. */
  MinerioCarvao: 116,
  MinerioFerro: 117,
  MinerioOuro: 118,
  MinerioDiamante: 119,
  /** Gramas climáticas (2026-07-20): o gen escolhe a variante pelo CLIMA
   *  (temperatura/umidade) — faixas de transição nas fronteiras = blend visual
   *  de bioma. ID próprio (não tint no cliente): mesher segue função pura de
   *  bytes e o save carrega a aparência sozinho. */
  GramaSeca: 120,
  GramaFria: 121,
  /** Árvores brasileiras (2026-07-20): cada espécie só nasce no seu bioma
   *  (biomas.ts). Ipê = cerrado, copa AMARELA (florido); araucária = Sul/frio,
   *  copa em disco no alto; pau-brasil = mata úmida. */
  LogIpe: 122,
  FolhasIpe: 123,
  LogAraucaria: 124,
  FolhasAraucaria: 125,
  LogPauBrasil: 126,
  FolhasPauBrasil: 127,
  /** Mandacaru (2026-07-20): cacto da caatinga — cubo cheio na v1. */
  Mandacaru: 128,
  /** Água (2026-07-21): bloco de terreno. ATRAVESSÁVEL (não-sólido: o jogador
   *  entra e NADA — empuxo + velocidade reduzida em physics.ts) e translúcido no
   *  mesher (funde com água vizinha → só a casca do volume aparece). SEM fluxo /
   *  espalhamento — fluido dinâmico é fase própria. */
  Agua: 129,
  /** Água FLUIDA (2026-07-22): 7 níveis de fluxo (7 = quase cheia / queda,
   *  1 = ponta rasa; 0 seca). A FONTE é `Agua` (129, nível 8). O nível vira o
   *  alcance máximo do espalhamento horizontal (fonte alcança 7 células). Cubo
   *  CHEIO no mesher v1 (visual em degrau; altura-por-nível é refino futuro).
   *  NUNCA vão à hotbar — só o balde (fonte) e o `waterRule` (fluxo) criam. */
  AguaFluida1: 130,
  AguaFluida2: 131,
  AguaFluida3: 132,
  AguaFluida4: 133,
  AguaFluida5: 134,
  AguaFluida6: 135,
  AguaFluida7: 136,
  /** Vidro colorido (2026-07-25): 12 cores (mesma paleta das lãs). Cubo CHEIO
   *  transparente (cutout tingido no atlas — dither, sem material novo); funde
   *  com vidro do MESMO id no mesher e mostra a face contra vidro de outra cor. */
  VidroBranco: 137, VidroPreto: 138, VidroVermelho: 139, VidroLaranja: 140,
  VidroAmarelo: 141, VidroVerde: 142, VidroAzul: 143, VidroRoxo: 144,
  VidroRosa: 145, VidroCiano: 146, VidroCinza: 147, VidroMarrom: 148,
  /** Lajes / meio-blocos (2026-07-25): meia altura. Baixo = 0..0.5 (piso),
   *  Cima = 0.5..1 (teto). NÃO-cubo (forma própria no mesher; colisão de altura
   *  PARCIAL + step-up automático na física). 3 materiais (pedra/tábua/tijolo),
   *  cada um Baixo+Cima. A hotbar tem 1 entrada por material; o cliente escolhe
   *  a metade pela face clicada. Tile reusa o do material (sem pintura nova). */
  LajePedraBaixo: 149, LajePedraCima: 150,
  LajeTabuaBaixo: 151, LajeTabuaCima: 152,
  LajeTijoloBaixo: 153, LajeTijoloCima: 154,
  /** Escadas (2026-07-25): degrau em L (base meia-altura + degrau de meia
   *  pegada). 4 DIREÇÕES no sufixo = pra onde o degrau SOBE (XP=+x, ZP=+z,
   *  XN=−x, ZN=−z, ordem de rotação k×90° como os móveis) × 2 metades: base
   *  (embaixo) e "C" = Cima (de cabeça pra baixo). 3 materiais. A hotbar tem 1
   *  entrada por material; direção sai do olhar, metade da face clicada.
   *  Âncora por material = ...XP (base). Layout: 4 base, depois 4 Cima. */
  EscadaPedraXP: 155, EscadaPedraZP: 156, EscadaPedraXN: 157, EscadaPedraZN: 158,
  EscadaPedraXPC: 159, EscadaPedraZPC: 160, EscadaPedraXNC: 161, EscadaPedraZNC: 162,
  EscadaTabuaXP: 163, EscadaTabuaZP: 164, EscadaTabuaXN: 165, EscadaTabuaZN: 166,
  EscadaTabuaXPC: 167, EscadaTabuaZPC: 168, EscadaTabuaXNC: 169, EscadaTabuaZNC: 170,
  EscadaTijoloXP: 171, EscadaTijoloZP: 172, EscadaTijoloXN: 173, EscadaTijoloZN: 174,
  EscadaTijoloXPC: 175, EscadaTijoloZPC: 176, EscadaTijoloXNC: 177, EscadaTijoloZNC: 178,
  /** Grama ALTA (§🌬️, 2026-07-27): tufo de capim em cruz — mesma família das
   *  flores (2 lâminas a 90°, cutout, atravessável, precisa de apoio). 3
   *  variantes pra casar com as gramas climáticas do gen (verde/seca/fria):
   *  capim verde em cima de grama seca ficaria colado. SUBSTITUÍVEL (colocar
   *  bloco por cima sobrescreve, estilo Minecraft) — era o "talvez capim alto"
   *  anotado em isReplaceable. Balança no vento junto com folhas e flores. */
  GramaAlta: 179,
  GramaAltaSeca: 180,
  GramaAltaFria: 181,
  /** Plantação (§🍖 F6, 2026-08-04): a segunda fonte de comida, e a única que o
   *  aluno CONSTRÓI — plantar, esperar, colher é a sequência com dependência
   *  temporal que a pedagogia quer. 4 estágios em ids consecutivos (0 = muda
   *  recém-plantada … 3 = madura); só o ESTÁGIO 0 é colocável (é ele que vem na
   *  mochila, como semente), os outros três só nascem crescendo — mesma
   *  disciplina de `isPlaceable` com a porta aberta. Cruz de sprite como a flor,
   *  atravessável, e precisa de SOLO embaixo (`isSolo`), não de cubo cheio
   *  qualquer: planta não nasce em pedra. */
  Plantacao0: 182,
  Plantacao1: 183,
  Plantacao2: 184,
  Plantacao3: 185,
  /** Fornalha (§🍖 F10b, 2026-08-05): o primeiro bloco com INVENTÁRIO PRÓPRIO.
   *  O conteúdo não cabe no byte — mora num mapa por posição na GameSession e
   *  persiste no meta do save, exatamente como o quadro. O que cabe no byte é o
   *  ESTADO: apagada / acesa, dois ids que trocam sozinhos no tick. **Só a
   *  apagada é colocável** (a acesa nasce do fogo, como a porta aberta nasce
   *  alternando uma fechada), e a acesa EMITE LUZ de graça — a luz é função
   *  pura dos bytes, então acender é uma linha no `luzEmitida`.
   *
   *  **Refino de 2026-08-05: ganhou FRENTE.** Estes dois viraram a direção −Z e
   *  as outras três moram em `FornalhaXP..FornalhaAcesaXN`, lá embaixo — ver a
   *  nota de lá pra saber por que os seis não são contíguos com estes. */
  Fornalha: 186,
  FornalhaAcesa: 187,
  /** Baú (§🍖 F10e, 2026-08-05, pedido do usuário): o segundo bloco com
   *  inventário — e o barato, porque reusa inteiro o encanamento que a fornalha
   *  criou (`containers.ts`). 27 slots, uma mochila inteira. UM id só: ao
   *  contrário da fornalha, não há estado nenhum pra guardar no byte (aberto é
   *  coisa de painel, não de mundo).
   *
   *  **Refino de 2026-08-05: deixou de ser cubo cheio.** Tem forma de CAIXA
   *  (14/16 de lado e de altura, o número do Minecraft) — dois baús lado a lado
   *  liam como uma parede de madeira contínua, e "onde acaba um e começa o
   *  outro" é a primeira pergunta de quem organiza o depósito da turma. A
   *  colisão continua sendo a célula inteira, como a do móvel e a da cerca. */
  Bau: 188,
  /**
   * Algodão (§🍖 F10c, 2026-08-05, pedido do usuário): a **ponte honesta** que
   * aposenta a lã-de-trigo. O lite não tem ovelha, e por isso a sessão 45
   * inventou "lã ← trigo" — o que criou uma competição errada (o mesmo trigo
   * fazia pão e cobertor) e deixou a comida disputando com a construção.
   * Agora a lã tem planta própria, com a MESMA cadeia que o trigo já ensina
   * (achar → plantar → esperar → colher), e o trigo volta a ser só comida.
   *
   * Quatro estágios em ids consecutivos, molde exato da plantação do F6: só o
   * 0 é colocável (é ele que vai à mochila, como semente), os outros nascem
   * crescendo no tick.
   */
  Algodao0: 189,
  Algodao1: 190,
  Algodao2: 191,
  Algodao3: 192,
  /** Algodão SELVAGEM: o pé que o gen espalha pelo cerrado, e a única forma de
   *  o aluno ACHAR a cadeia sem o professor entregar. Bloco SEPARADO do
   *  cultivado de propósito — ele larga SEMENTE por sorte (o molde do capim),
   *  não a colheita cheia; quem quer algodão de verdade tem de plantar. */
  AlgodaoSelvagem: 193,
  /**
   * §🍖 F10 (refino, 2026-08-05): as outras TRÊS direções da fornalha. A boca
   * passou a aparecer numa face só, e direção de bloco neste jogo é ID — a
   * cadeira, a cama, o quadro e a escada fazem igual, porque o byte do chunk é
   * a única coisa que o mesher lê.
   *
   * **Por que não são quatro contíguos, como os móveis:** `Fornalha` (186) e
   * `FornalhaAcesa` (187) nasceram sem direção e já estão gravados nos mundos
   * que a sessão 46 salvou. Renumerar trocaria a fornalha de quem já jogou por
   * outro bloco — o mesmo raciocínio que APOSENTOU a receita de vidro em vez de
   * apagá-la. Então os dois viraram a direção −Z e as outras três entram aqui,
   * com a tradução numa TABELA (`FORNALHA_POR_FRENTE`) em vez de aritmética de
   * id. Mundo antigo abre sem migração: byte 186 é uma fornalha virada pro −Z.
   */
  FornalhaXP: 194,
  FornalhaZP: 195,
  FornalhaXN: 196,
  FornalhaAcesaXP: 197,
  FornalhaAcesaZP: 198,
  FornalhaAcesaXN: 199,
  /**
   * §🍖 F10h (2026-08-06, pedido do usuário): as SEIS CULTURAS. Cada uma tem
   * 4 estágios em ids consecutivos — molde EXATO do algodão: só o 0 é
   * colocável (é ele que vai à mochila, como semente), os outros nascem
   * crescendo no tick — e um pé SELVAGEM (sempre `base + 4`) que o gen
   * espalha por UM bioma: é a porta de entrada da cadeia (achar → plantar →
   * esperar → colher), igual ao AlgodaoSelvagem. Ordem = a da aula:
   * cenoura, batata, beterraba, melancia, banana, aipim.
   */
  Cenoura0: 200, Cenoura1: 201, Cenoura2: 202, Cenoura3: 203, CenouraSelvagem: 204,
  Batata0: 205, Batata1: 206, Batata2: 207, Batata3: 208, BatataSelvagem: 209,
  Beterraba0: 210, Beterraba1: 211, Beterraba2: 212, Beterraba3: 213, BeterrabaSelvagem: 214,
  Melancia0: 215, Melancia1: 216, Melancia2: 217, Melancia3: 218, MelanciaSelvagem: 219,
  Banana0: 220, Banana1: 221, Banana2: 222, Banana3: 223, BananaSelvagem: 224,
  Aipim0: 225, Aipim1: 226, Aipim2: 227, Aipim3: 228, AipimSelvagem: 229,
} as const;

export type BlockId = (typeof BlockId)[keyof typeof BlockId];

/**
 * Maior ID válido (mantém isPlaceable sem número mágico ao crescer a lista).
 *
 * EXPORTADO desde o §🍖 F10 porque os testes-portão varrem "todos os ids" e
 * fixavam o teto à mão: cada bloco novo exigia lembrar de subir o número em
 * dois arquivos, e esquecer significava um portão que deixava de olhar
 * justamente o bloco recém-criado — o oposto do que ele existe pra fazer.
 */
export const MAX_BLOCK_ID = BlockId.AipimSelvagem;

/** Água? Fonte (129) OU fluida (130-136) — atravessável e translúcida. */
export function isAgua(id: number): boolean {
  return id >= BlockId.Agua && id <= BlockId.AguaFluida7;
}

/** Bloco-FONTE de água (nível 8, permanente)? Só o balde cheio e a regra de
 *  água infinita criam. O fluxo (AguaFluida1..7) recua/seca; a fonte não. */
export function isAguaFonte(id: number): boolean {
  return id === BlockId.Agua;
}

/** Nível do fluido: 8 = fonte, 7..1 = fluida (7 mais alta), 0 = não é água.
 *  O `waterRule` decrementa o nível a cada célula de distância (alcance 7). */
export function aguaNivel(id: number): number {
  if (id === BlockId.Agua) return 8;
  if (id >= BlockId.AguaFluida1 && id <= BlockId.AguaFluida7) {
    return id - BlockId.AguaFluida1 + 1;
  }
  return 0;
}

/** Id da água para um nível: 8+ = fonte, 7..1 = fluida, ≤0 = ar (seca). */
export function aguaComNivel(n: number): number {
  if (n >= 8) return BlockId.Agua;
  if (n >= 1) return BlockId.AguaFluida1 + (n - 1);
  return BlockId.Air;
}

/** ITENS (2026-07-22): não são BLOCOS — ficam ACIMA da faixa de ids de bloco,
 *  então `isPlaceable` os recusa (nunca entram no mundo por place_block). O
 *  balde é o único item hoje. Estado cheio/vazio = 2 ids que trocam no uso (o
 *  slot da hotbar guarda qual). Cheio despeja FONTE de água; vazio recolhe uma
 *  fonte de volta. A água só existe no mundo via balde (ou via o fluxo). */
export const ITEM_BALDE_VAZIO = 900;
export const ITEM_BALDE_AGUA = 901;

/**
 * COMIDA (§🍖 F6, 2026-08-04): itens na mesma banda ≥ 900 do balde — não são
 * blocos, então `isPlaceable` os recusa e eles nunca entram no mundo. A escolha
 * (item, e não bloco colhível) é a do ROADMAP: o que se come sai da mochila e
 * some, e nada que some do mundo precisa de byte novo no chunk.
 *
 * `fruta` cai da folha (fonte PASSIVA — quem só explora não passa fome);
 * `trigo` é o que a plantação madura devolve e NÃO se come: é ingrediente do
 * `pao`, e é essa dependência (plantar → esperar → colher → fabricar) que faz a
 * comida ensinar sequência em vez de ser um botão.
 */
export const ITEM_FRUTA = 902;
export const ITEM_TRIGO = 903;
export const ITEM_PAO = 904;

/**
 * §🍖 F10 (2026-08-05): os itens da FUNDIÇÃO. Três deles nascem aqui, no lote
 * que precede a fornalha:
 *
 * `carvao` e `diamante` são o que o MINÉRIO passa a largar. Até agora o minério
 * caía ele mesmo — um cubo de pedra com pepitas que não servia pra nada. No
 * Minecraft esses dois não vão ao forno: o minério já entrega o item, e é o
 * item que vira tocha, corante e (um dia) ferramenta. O ferro e o ouro
 * continuam caindo como BLOCO de propósito: é o bloco que a fornalha funde, e
 * é essa diferença que ensina PRA QUE serve a fornalha.
 *
 * `graveto` é o elo que faltava pra tocha e pra ferramenta. Ele não existia, e
 * a tocha da sessão 45 saía de tábua + minério — o que estava errado nos dois
 * lados: gastava uma tábua inteira e pedia um cubo de minério na mão. Agora é
 * o par honesto **1 graveto + 1 carvão**, e o mesmo graveto é o cabo de toda
 * ferramenta do §🍖 F10d.
 */
export const ITEM_CARVAO = 905;
export const ITEM_DIAMANTE = 906;
export const ITEM_GRAVETO = 907;

/**
 * §🍖 F10b: o que sai da FORNALHA. O `carvao vegetal` é tronco cozido — a
 * saída de quem não achou caverna nenhuma, e é ela que faz a fornalha valer a
 * pena mesmo pra quem só tem árvore. Ele serve de brasa na tocha e de
 * combustível na própria fornalha, igualzinho ao carvão mineral: são a mesma
 * brasa por dois caminhos, e é isso que o aluno tem de descobrir.
 *
 * Os dois lingotes são o topo da cadeia do lite: minério cru não vira mais
 * balde nem ferramenta — quem quer ferro tem de acender fogo.
 */
export const ITEM_CARVAO_VEGETAL = 908;
export const ITEM_LINGOTE_FERRO = 909;
export const ITEM_LINGOTE_OURO = 910;

/** §🍖 F10c: o capulho colhido do algodão maduro. É a fibra — 3 dele viram uma
 *  lã branca, e é ele que devolve o trigo ao papel de comida. */
export const ITEM_ALGODAO = 911;

/**
 * §🍖 F10d: as PICARETAS. Quatro níveis, e a ordem deles É a progressão da
 * aula — cada uma só existe depois que a anterior abriu o material dela.
 * Machado e pá ficaram de fora por decisão escrita em `ferramentas.ts`.
 */
export const ITEM_PICARETA_MADEIRA = 912;
export const ITEM_PICARETA_PEDRA = 913;
export const ITEM_PICARETA_FERRO = 914;
export const ITEM_PICARETA_DIAMANTE = 915;

/**
 * §🍖 F10h (2026-08-06): as COLHEITAS das seis culturas + a batata ASSADA.
 *
 * Cada cultura madura devolve o seu item (`Planta.colheita`) — cenoura,
 * batata, beterraba, melancia (a fatia), banana e aipim. Os seis são COMIDA
 * (`SACIEDADE` em comida.ts); o aipim cru é uma simplificação do jogo (na
 * vida real manioca crua é tóxica — mas a lição da cadeia aqui é a horta, e
 * um veneno no meio da aula seria um detalhe que ensina a coisa errada).
 *
 * A **batata assada** é o caso que destrava o pote: é a PRIMEIRA comida que
 * nasce da FORNALHA (`COZIMENTO`), e cozinhar em vez de comer cru é a
 * descoberta que liga a horta à fundição — a batata crua alimenta pouco
 * (`SACIEDADE` baixa), a assada alimenta como o pão.
 */
export const ITEM_CENOURA = 916;
export const ITEM_BATATA = 917;
export const ITEM_BETERRABA = 918;
export const ITEM_MELANCIA = 919;
export const ITEM_BANANA = 920;
export const ITEM_AIPIM = 921;
export const ITEM_BATATA_COZIDA = 922;

/** Um dos itens de FERRAMENTA (§🍖 F10d)? Mora aqui, junto de `isBalde`, e não
 *  em `ferramentas.ts`, porque quem pergunta primeiro é o `tamanhoStack` do
 *  inventário — e `inventario.ts` importando `ferramentas.ts`, que importa
 *  `inventario.ts` de volta, seria um ciclo por nada. */
const PICARETAS: ReadonlySet<number> = new Set([
  ITEM_PICARETA_MADEIRA,
  ITEM_PICARETA_PEDRA,
  ITEM_PICARETA_FERRO,
  ITEM_PICARETA_DIAMANTE,
]);

/** É ferramenta? (1 por slot, como o balde — ver `tamanhoStack`) */
export function isFerramenta(id: number): boolean {
  return PICARETAS.has(id);
}

/** É brasa (mineral ou vegetal)? As duas acendem tocha e alimentam fornalha —
 *  a pergunta é UMA, senão a receita e o combustível divergiriam. */
export function isCarvao(id: number): boolean {
  return id === ITEM_CARVAO || id === ITEM_CARVAO_VEGETAL;
}

/**
 * As 4 direções da fornalha, na ordem dos móveis (0 = +x, 1 = +z, 2 = −x,
 * 3 = −z), cada uma com o par apagada/acesa. É a fonte ÚNICA da tradução
 * id ↔ direção ↔ estado: quem precisa de qualquer uma das três perguntas
 * chama uma das funções abaixo, e nenhuma delas faz conta com o id.
 *
 * TABELA, e não `Fornalha + k`, porque os ids não são contíguos de propósito —
 * ver a nota do `FornalhaXP` no `BlockId`. A direção −Z é a dos ids originais.
 */
export const FORNALHA_POR_FRENTE: readonly { apagada: number; acesa: number }[] = [
  { apagada: BlockId.FornalhaXP, acesa: BlockId.FornalhaAcesaXP },
  { apagada: BlockId.FornalhaZP, acesa: BlockId.FornalhaAcesaZP },
  { apagada: BlockId.FornalhaXN, acesa: BlockId.FornalhaAcesaXN },
  { apagada: BlockId.Fornalha, acesa: BlockId.FornalhaAcesa },
];

/** Fornalha (apagada ou acesa, em qualquer direção)? O conteúdo mora fora do
 *  byte (containers.ts). */
export function isFornalha(id: number): boolean {
  return FORNALHA_POR_FRENTE.some((f) => f.apagada === id || f.acesa === id);
}

/** Esta fornalha está ACESA? (o byte é o estado — e é ele que emite luz) */
export function fornalhaEstaAcesa(id: number): boolean {
  return FORNALHA_POR_FRENTE.some((f) => f.acesa === id);
}

/** Pra onde a boca desta fornalha aponta: 0 = +x, 1 = +z, 2 = −x, 3 = −z.
 *  `-1` se o id não é fornalha nenhuma. */
export function fornalhaFrente(id: number): number {
  return FORNALHA_POR_FRENTE.findIndex((f) => f.apagada === id || f.acesa === id);
}

/** O id da fornalha apagada virada pra `k` (0 = +x … 3 = −z). Fora da faixa
 *  volta pro −Z, que é a forma canônica da mochila. */
export function fornalhaComFrente(k: number): number {
  return (FORNALHA_POR_FRENTE[k] ?? FORNALHA_POR_FRENTE[3]!).apagada;
}

/** O par deste mesmo bloco no outro estado — é ele que o tick escreve quando o
 *  fogo pega ou acaba. **A direção é PRESERVADA**: acender não pode virar a
 *  fornalha de lado na frente da turma. */
export function fornalhaComEstado(id: number, acesa: boolean): number {
  const f = FORNALHA_POR_FRENTE[fornalhaFrente(id)] ?? FORNALHA_POR_FRENTE[3]!;
  return acesa ? f.acesa : f.apagada;
}

/** É o item balde (cheio ou vazio)? */
export function isBalde(id: number): boolean {
  return id === ITEM_BALDE_VAZIO || id === ITEM_BALDE_AGUA;
}

/** Todo item que EXISTE (a banda ≥ 900 não é um intervalo aberto: id fora desta
 *  lista é byte inventado). Fonte única pra quem precisa aceitar "bloco OU
 *  item" — o `/dar` do professor e o portão da tabela de drops. */
const ITENS: ReadonlySet<number> = new Set([
  ITEM_BALDE_VAZIO,
  ITEM_BALDE_AGUA,
  ITEM_FRUTA,
  ITEM_TRIGO,
  ITEM_PAO,
  ITEM_CARVAO,
  ITEM_DIAMANTE,
  ITEM_GRAVETO,
  ITEM_CARVAO_VEGETAL,
  ITEM_LINGOTE_FERRO,
  ITEM_LINGOTE_OURO,
  ITEM_ALGODAO,
  ITEM_PICARETA_MADEIRA,
  ITEM_PICARETA_PEDRA,
  ITEM_PICARETA_FERRO,
  ITEM_PICARETA_DIAMANTE,
  ITEM_CENOURA,
  ITEM_BATATA,
  ITEM_BETERRABA,
  ITEM_MELANCIA,
  ITEM_BANANA,
  ITEM_AIPIM,
  ITEM_BATATA_COZIDA,
]);

/** É um item conhecido (não-bloco)? */
export function isItem(id: number): boolean {
  return ITENS.has(id);
}

/**
 * §🍖 F10c: uma planta CULTIVÁVEL — o id do estágio 0, quantos estágios ela
 * tem, o ITEM que a madura devolve e o pé SELVAGEM que o gen espalha. A
 * tabela existe porque a plantação deixou de ser "o trigo": o algodão e as
 * seis culturas do §🍖 F10h seguem o mesmo ciclo, e uma faixa de ids escrita
 * à mão em cada função (`isPlantacao`, `estagio`, `madura`, `formaCanonica`,
 * `isPlaceable`, os drops) seria N chances de esquecer uma. Planta nova =
 * uma linha aqui — e ela já entra no mundo, na colheita e na mochila.
 */
export interface Planta {
  readonly base: number;
  readonly estagios: number;
  /** §🍖 F10h: o ITEM que a planta MADURA devolve (trigo, algodão, cenoura…). */
  readonly colheita: number;
  /** §🍖 F10h: teto do sorteio da colheita. 1 = quantidade fixa (o trigo);
   *  2 = 1 ou 2 (o algodão — e as seis novas, pro canteiro render mais que
   *  ele come). */
  readonly colheitaMax: number;
  /** §🍖 F10h: o id do pé SELVAGEM do gen (undefined = a planta não nasce
   *  no gen — hoje só o trigo, que tem porta de entrada no capim). */
  readonly selvagem?: number;
}

export const PLANTAS: readonly Planta[] = [
  { base: BlockId.Plantacao0, estagios: 4, colheita: ITEM_TRIGO, colheitaMax: 1 },
  { base: BlockId.Algodao0, estagios: 4, colheita: ITEM_ALGODAO, colheitaMax: 2, selvagem: BlockId.AlgodaoSelvagem },
  { base: BlockId.Cenoura0, estagios: 4, colheita: ITEM_CENOURA, colheitaMax: 2, selvagem: BlockId.CenouraSelvagem },
  { base: BlockId.Batata0, estagios: 4, colheita: ITEM_BATATA, colheitaMax: 2, selvagem: BlockId.BatataSelvagem },
  { base: BlockId.Beterraba0, estagios: 4, colheita: ITEM_BETERRABA, colheitaMax: 2, selvagem: BlockId.BeterrabaSelvagem },
  { base: BlockId.Melancia0, estagios: 4, colheita: ITEM_MELANCIA, colheitaMax: 2, selvagem: BlockId.MelanciaSelvagem },
  { base: BlockId.Banana0, estagios: 4, colheita: ITEM_BANANA, colheitaMax: 2, selvagem: BlockId.BananaSelvagem },
  { base: BlockId.Aipim0, estagios: 4, colheita: ITEM_AIPIM, colheitaMax: 2, selvagem: BlockId.AipimSelvagem },
];

/** A planta a que este byte pertence (`null` se ele não é plantação). */
export function plantaDe(id: number): Planta | null {
  for (const p of PLANTAS) {
    if (id >= p.base && id < p.base + p.estagios) return p;
  }
  return null;
}

/** Plantação em qualquer estágio (0 = muda … n−1 = madura)? */
export function isPlantacao(id: number): boolean {
  return plantaDe(id) !== null;
}

/** Estágio da plantação, contado do 0 (−1 se não for plantação). */
export function estagioPlantacao(id: number): number {
  const p = plantaDe(id);
  return p ? id - p.base : -1;
}

/** Plantação MADURA (pronta pra colher)? */
export function isPlantacaoMadura(id: number): boolean {
  const p = plantaDe(id);
  return p !== null && id === p.base + p.estagios - 1;
}

/** É a MUDA (o único estágio que vai à mochila e se coloca)? */
export function isMudaDePlantacao(id: number): boolean {
  return plantaDe(id)?.base === id;
}

/** §🍖 F10h: o pé SELVAGEM a que este byte pertence (`null` se não é selvagem
 *  de nada). O selvagem NÃO cresce — ele é a porta de entrada da cadeia:
 *  quebrar larga a semente (drops.ts), e a semente é que planta de verdade. */
export function plantaPorSelvagem(id: number): Planta | null {
  for (const p of PLANTAS) if (p.selvagem === id) return p;
  return null;
}

/** É um pé SELVAGEM do gen (algodão, e as seis culturas do §🍖 F10h)? */
export function isSelvagem(id: number): boolean {
  return plantaPorSelvagem(id) !== null;
}

/** SOLO onde uma plantação pega: terra e as três gramas climáticas. Pedra,
 *  areia e tábua não servem — "planta precisa de terra" é a regra que o aluno
 *  descobre na primeira tentativa, e ela vale no PLACE e no tick (a muda posta
 *  em cima de outra coisa evapora, como a flor sem apoio). */
export function isSolo(id: number): boolean {
  return (
    id === BlockId.Dirt ||
    id === BlockId.Grass ||
    id === BlockId.GramaSeca ||
    id === BlockId.GramaFria
  );
}

/** SUBSTITUÍVEL? Colocar um bloco por cima sobrescreve direto, sem quebrar
 *  antes (líquido é "vazio pra colocação"). Água e capim alto (§🌬️
 *  2026-07-27 — o capim é decorativo e cobre muita superfície; obrigar a
 *  quebrar antes atrapalharia construir no campo). Lava/neve herdam ao serem
 *  adicionados. Usado no gate do place_block (session.ts): célula vazia OU
 *  substituível aceita bloco. */
export function isReplaceable(id: number): boolean {
  return isAgua(id) || isGramaAlta(id);
}

/** Flor decorativa (qualquer cor)? */
export function isFlor(id: number): boolean {
  return id >= BlockId.FlorVermelha && id <= BlockId.FlorBranca;
}

/** Grama alta (verde/seca/fria)? Tufo em cruz, mesma família das flores. */
export function isGramaAlta(id: number): boolean {
  return id >= BlockId.GramaAlta && id <= BlockId.GramaAltaFria;
}

/** Folhagem de copa (qualquer espécie)? Balança no vento (§🌬️). */
export function isFolhas(id: number): boolean {
  return (
    id === BlockId.Leaves ||
    id === BlockId.FolhasIpe ||
    id === BlockId.FolhasAraucaria ||
    id === BlockId.FolhasPauBrasil
  );
}

/** Vidro colorido (qualquer cor)? Cubo cheio transparente (cutout tingido). */
export function isVidroColorido(id: number): boolean {
  return id >= BlockId.VidroBranco && id <= BlockId.VidroMarrom;
}

/** Laje / meio-bloco (qualquer material/metade)? */
export function isSlab(id: number): boolean {
  return id >= BlockId.LajePedraBaixo && id <= BlockId.LajeTijoloCima;
}

/** Laje da metade de CIMA (0.5..1)? false = metade de baixo (0..0.5, piso). */
export function slabTop(id: number): boolean {
  return ((id - BlockId.LajePedraBaixo) & 1) === 1;
}

/** Índice do material da laje: 0 pedra, 1 tábua, 2 tijolo. */
export function slabMaterial(id: number): number {
  return (id - BlockId.LajePedraBaixo) >> 1;
}

/** Escada (qualquer material/direção/metade)? Degrau em L. */
export function isStairs(id: number): boolean {
  return id >= BlockId.EscadaPedraXP && id <= BlockId.EscadaTijoloZNC;
}

/** Direção da escada (pra onde SOBE): 0 +x, 1 +z, 2 −x, 3 −z (rotação k×90°). */
export function stairsFacing(id: number): number {
  return (id - BlockId.EscadaPedraXP) % 4;
}

/** Escada de cabeça pra baixo (variante "C", degrau no teto)? */
export function stairsTop(id: number): boolean {
  return (id - BlockId.EscadaPedraXP) % 8 >= 4;
}

/** Índice do material da escada: 0 pedra, 1 tábua, 2 tijolo. */
export function stairsMaterial(id: number): number {
  return ((id - BlockId.EscadaPedraXP) / 8) | 0;
}

/** Id de escada a partir de (material, direção k, cima?). Âncora por material
 *  = EscadaPedraXP + mat*8; +4 = variante de cima; +k = direção. */
export function escadaId(material: number, facing: number, top: boolean): number {
  return BlockId.EscadaPedraXP + material * 8 + (top ? 4 : 0) + (facing & 3);
}

/** Caixa (frações da célula): [x0,y0,z0,x1,y1,z1]. */
export type Aabb = readonly [number, number, number, number, number, number];

/** Pegada XZ do DEGRAU superior da escada (metade da célula), por direção k.
 *  Padrão (k=0, sobe +x) = metade +x; rotaciona k×90° (mesma rotXZ do mesher). */
function stepFootprint(k: number): readonly [number, number, number, number] {
  switch (k & 3) {
    case 1: return [0, 0.5, 1, 1]; // +z
    case 2: return [0, 0, 0.5, 1]; // −x
    case 3: return [0, 0, 1, 0.5]; // −z
    default: return [0.5, 0, 1, 1]; // +x
  }
}

/** Caixas de COLISÃO de um bloco, em frações da célula. Cubo cheio = a célula
 *  inteira; laje = uma metade; escada = base/teto de meia-altura + degrau de
 *  meia-pegada (L). Fonte única da colisão parcial (physics.ts) — a física trata
 *  cada caixa como AABB. Blocos comuns caem no fallback de cubo cheio.
 *  ⚠️ **Forma no mesher ≠ colisão.** O baú (14/16) e os móveis desenham menores
 *  que a célula e colidem como a célula inteira, de propósito: a barreira é o
 *  papel deles, e um vão de 1/16 onde o jogador "quase" entra é bug de
 *  travamento na aula, não realismo. Quem segue a forma é a MIRA
 *  (`blockSelectionBox`), que é onde o aluno percebe a diferença. */
export function collisionBoxes(id: number): readonly Aabb[] {
  if (isSlab(id)) {
    return slabTop(id) ? [[0, 0.5, 0, 1, 1, 1]] : [[0, 0, 0, 1, 0.5, 1]];
  }
  if (isStairs(id)) {
    const [sx0, sz0, sx1, sz1] = stepFootprint(stairsFacing(id));
    return stairsTop(id)
      ? [[0, 0.5, 0, 1, 1, 1], [sx0, 0, sz0, sx1, 0.5, sz1]] // teto + degrau embaixo
      : [[0, 0, 0, 1, 0.5, 1], [sx0, 0.5, sz0, sx1, 1, sz1]]; // base + degrau em cima
  }
  return [[0, 0, 0, 1, 1, 1]];
}

/** Quadro em qualquer direção? */
export function isQuadro(id: number): boolean {
  return id >= BlockId.QuadroXP && id <= BlockId.QuadroZN;
}

/** Cadeira em qualquer direção? */
export function isCadeira(id: number): boolean {
  return id >= BlockId.CadeiraXP && id <= BlockId.CadeiraZN;
}
/** Sofá em qualquer direção? */
export function isSofa(id: number): boolean {
  return id >= BlockId.SofaXP && id <= BlockId.SofaZN;
}
/** Cama em qualquer direção? */
export function isCama(id: number): boolean {
  return id >= BlockId.CamaXP && id <= BlockId.CamaZN;
}
/** Cama ocupa 2 células no horizontal. Vetor do PÉ para a CABECEIRA
 *  (travesseiro), oposto da frente (que encara o jogador). Só faz sentido
 *  para um id de cama. */
export function camaHeadDir(id: number): { dx: number; dz: number } {
  switch (id - BlockId.CamaXP) {
    case 0: return { dx: -1, dz: 0 }; // frente +x → cabeceira −x
    case 1: return { dx: 0, dz: -1 }; // frente +z → cabeceira −z
    case 2: return { dx: 1, dz: 0 }; // frente −x → cabeceira +x
    default: return { dx: 0, dz: 1 }; // frente −z → cabeceira +z
  }
}
/** Móvel decorativo (mesa/cadeira/sofá/cama)? Forma própria no mesher,
 *  colisão de célula cheia (simplificação, mesmo racional da cerca). */
export function isMovel(id: number): boolean {
  return id >= BlockId.Mesa && id <= BlockId.CamaZN;
}

/** Tapete de qualquer cor? */
export function isTapete(id: number): boolean {
  return id >= BlockId.TapeteBranco && id <= BlockId.TapeteMarrom;
}

/**
 * Precisa de apoio embaixo pra ser colocado E pra continuar existindo (regra no
 * tick). Tocha, tapetes, flores, capim — e a plantação, que é a única a querer
 * um apoio ESPECÍFICO (ver `apoioValido`).
 *
 * **2026-08-05 (pedido do usuário): TODA planta entra aqui, selvagem ou
 * cultivada.** O mandacaru era a última de fora — cavar a areia debaixo dele
 * deixava a coluna de cacto pendurada no ar. Ele se apoia em cubo cheio (a
 * areia da caatinga, ou o próprio mandacaru de baixo), então a coluna inteira
 * cai de baixo pra cima, um tick por célula.
 *
 * ⚠️ Esta função é a fonte ÚNICA da lista: `rules.ts` REGISTRA a regra do tick
 * a partir dela, e não de uma segunda lista de faixas de id. Foi uma segunda
 * lista que deixou o capim flutuando (bug-558) e o algodão inteiro de fora
 * (bug-581).
 */
export function precisaApoio(id: number): boolean {
  return (
    id === BlockId.Tocha || isTapete(id) || isFlor(id) || isGramaAlta(id) ||
    isPlantacao(id) || isSelvagem(id) || id === BlockId.Mandacaru
  );
}

/**
 * O bloco `idAbaixo` serve de apoio pra `id`? Fonte ÚNICA da resposta: o gate
 * do `place_block` e a regra de vizinhança que derruba o que perdeu o apoio
 * consultam esta função, senão dava pra colocar uma muda onde ela evaporaria no
 * tick seguinte. Cubo cheio serve pra todo mundo; a plantação exige SOLO.
 */
export function apoioValido(id: number, idAbaixo: number): boolean {
  // §🍖 F10c: o algodão SELVAGEM é planta igual às outras — exige solo, senão o
  // gen o penduraria em pedra e o tick o derrubaria no instante seguinte.
  // §🍖 F10h: `isSelvagem` cobre os pés das seis novas culturas na MESMA linha.
  if (isPlantacao(id) || isSelvagem(id)) return isSolo(idAbaixo);
  return isFullCube(idAbaixo);
}

/** Bloco transparente (vidro/folhas): NÃO oculta a face do vizinho no mesher.
 *  Continua sólido pra física/raycast — transparência é só visual. */
export function isTransparentBlock(id: number): boolean {
  return (
    id === BlockId.Glass || id === BlockId.Leaves ||
    id === BlockId.FolhasIpe || id === BlockId.FolhasAraucaria ||
    id === BlockId.FolhasPauBrasil || isAgua(id) || isVidroColorido(id)
  );
}

/** Porta em qualquer eixo/estado/dobradiça? (2 trechos de id — ver PortaXFechadaR) */
export function isPorta(id: number): boolean {
  return (
    (id >= BlockId.PortaXFechada && id <= BlockId.PortaZAberta) ||
    (id >= BlockId.PortaXFechadaR && id <= BlockId.PortaZAbertaR)
  );
}

/** Porta ABERTA (qualquer eixo/dobradiça)? */
export function isPortaAberta(id: number): boolean {
  return (
    id === BlockId.PortaXAberta || id === BlockId.PortaZAberta ||
    id === BlockId.PortaXAbertaR || id === BlockId.PortaZAbertaR
  );
}

/** Porta que BLOQUEIA passagem no eixo X (painel varre o flanco Z)? */
export function portaEixoX(id: number): boolean {
  return (
    id === BlockId.PortaXFechada || id === BlockId.PortaXAberta ||
    id === BlockId.PortaXFechadaR || id === BlockId.PortaXAbertaR
  );
}

/** Dobradiça na aresta ALTA do flanco (variante "R")? false = aresta baixa (base). */
export function portaHingeAlta(id: number): boolean {
  return id >= BlockId.PortaXFechadaR && id <= BlockId.PortaZAbertaR;
}

/** Deslocamento base→variante-de-dobradiça (os 4 ids R são os 4 base + isto). */
const PORTA_HINGE_OFFSET = BlockId.PortaXFechadaR - BlockId.PortaXFechada;

/** Mesma porta (eixo+estado) com a dobradiça pedida (alta = R, baixa = base).
 *  Aceita id base OU R na entrada (normaliza antes de aplicar). */
export function portaComHinge(id: number, alta: boolean): number {
  const base = portaHingeAlta(id) ? id - PORTA_HINGE_OFFSET : id;
  return alta ? base + PORTA_HINGE_OFFSET : base;
}

/** Id da mesma porta com o estado alternado (fechada↔aberta; eixo e dobradiça iguais). */
export function portaToggled(id: number): number {
  switch (id) {
    case BlockId.PortaXFechada: return BlockId.PortaXAberta;
    case BlockId.PortaXAberta: return BlockId.PortaXFechada;
    case BlockId.PortaZFechada: return BlockId.PortaZAberta;
    case BlockId.PortaZAberta: return BlockId.PortaZFechada;
    case BlockId.PortaXFechadaR: return BlockId.PortaXAbertaR;
    case BlockId.PortaXAbertaR: return BlockId.PortaXFechadaR;
    case BlockId.PortaZFechadaR: return BlockId.PortaZAbertaR;
    case BlockId.PortaZAbertaR: return BlockId.PortaZFechadaR;
    default: return id;
  }
}

/** Janela em qualquer eixo/estado/dobradiça? (2 trechos de id — ver JanelaXFechadaR) */
export function isJanela(id: number): boolean {
  return (
    (id >= BlockId.JanelaXFechada && id <= BlockId.JanelaZAberta) ||
    (id >= BlockId.JanelaXFechadaR && id <= BlockId.JanelaZAbertaR)
  );
}

/** Janela ABERTA (qualquer eixo/dobradiça)? */
export function isJanelaAberta(id: number): boolean {
  return (
    id === BlockId.JanelaXAberta || id === BlockId.JanelaZAberta ||
    id === BlockId.JanelaXAbertaR || id === BlockId.JanelaZAbertaR
  );
}

/** Janela que BLOQUEIA passagem no eixo X (painel varre o flanco Z)? */
export function janelaEixoX(id: number): boolean {
  return (
    id === BlockId.JanelaXFechada || id === BlockId.JanelaXAberta ||
    id === BlockId.JanelaXFechadaR || id === BlockId.JanelaXAbertaR
  );
}

/** Janela com dobradiça na aresta ALTA do flanco (variante "R")? */
export function janelaHingeAlta(id: number): boolean {
  return id >= BlockId.JanelaXFechadaR && id <= BlockId.JanelaZAbertaR;
}

/** Deslocamento base→variante-de-dobradiça das janelas. */
const JANELA_HINGE_OFFSET = BlockId.JanelaXFechadaR - BlockId.JanelaXFechada;

/** Mesma janela (eixo+estado) com a dobradiça pedida. Aceita id base OU R. */
export function janelaComHinge(id: number, alta: boolean): number {
  const base = janelaHingeAlta(id) ? id - JANELA_HINGE_OFFSET : id;
  return alta ? base + JANELA_HINGE_OFFSET : base;
}

/** Bloco interativo (clique direito alterna em vez de colocar): porta ou janela. */
export function isInterativo(id: number): boolean {
  return isPorta(id) || isJanela(id);
}

/** Id do interativo com o estado alternado (fechada↔aberta; eixo e dobradiça iguais). */
export function interativoToggled(id: number): number {
  switch (id) {
    case BlockId.JanelaXFechada: return BlockId.JanelaXAberta;
    case BlockId.JanelaXAberta: return BlockId.JanelaXFechada;
    case BlockId.JanelaZFechada: return BlockId.JanelaZAberta;
    case BlockId.JanelaZAberta: return BlockId.JanelaZFechada;
    case BlockId.JanelaXFechadaR: return BlockId.JanelaXAbertaR;
    case BlockId.JanelaXAbertaR: return BlockId.JanelaXFechadaR;
    case BlockId.JanelaZFechadaR: return BlockId.JanelaZAbertaR;
    case BlockId.JanelaZAbertaR: return BlockId.JanelaZFechadaR;
    default: return portaToggled(id);
  }
}

/** Cubo CHEIO (ocupa a célula inteira)? Não-cubos nunca ocluem a face do
 *  vizinho no mesher, e não servem de suporte pra tocha. */
export function isFullCube(id: number): boolean {
  return (
    id !== BlockId.Air &&
    !(id >= BlockId.Cerca && id <= BlockId.Tocha) &&
    !isPorta(id) && // portas R (108-111) ficam FORA da faixa Cerca..Tocha
    !isTapete(id) &&
    !isJanela(id) &&
    !isMovel(id) &&
    !isQuadro(id) &&
    !isFlor(id) &&
    !isGramaAlta(id) &&
    !isPlantacao(id) && // cruz de sprite, como a flor
    !isSelvagem(id) && // idem (algodão + as seis culturas do §🍖 F10h)
    // §🍖 F10 (refino): o baú é uma CAIXA de 14/16 dentro da célula. Sair daqui
    // é o que faz o vão entre dois baús existir — e, de brinde, a luz passa por
    // ele (como no Minecraft) e a cerca não se conecta a ele.
    id !== BlockId.Bau &&
    !isSlab(id) && // laje = meia altura (forma própria + colisão parcial)
    !isStairs(id) // escada = L (forma própria + colisão parcial)
  );
}

/** Sólido pra FÍSICA (colisão do jogador). Porta aberta e tocha atravessam;
 *  cerca colide como cubo cheio (simplificação: barreira é o papel dela). */
export function isSolidBlock(id: number): boolean {
  return (
    id !== BlockId.Air &&
    !isPortaAberta(id) && // porta aberta (base OU R) atravessa
    !isJanelaAberta(id) && // janela aberta (base OU R) atravessa
    id !== BlockId.Tocha &&
    !isTapete(id) &&
    !isQuadro(id) &&
    !isFlor(id) &&
    !isGramaAlta(id) && // capim atravessa (decorativo, como a flor)
    !isPlantacao(id) && // a plantação também: pisar na horta não empurra o aluno
    !isSelvagem(id) && // idem (pé selvagem do gen)
    !isAgua(id) // água atravessa — o jogador entra e nada (physics.ts)
  );
}

/** O jogador pode colocar este ID? (valida bytes do fio). Porta/janela ABERTA
 *  não se coloca na mão — só existe alternando uma fechada no clique direito. */
export function isPlaceable(id: number): boolean {
  if (isPortaAberta(id)) return false; // porta aberta (base OU R) só nasce alternando uma fechada
  if (isJanelaAberta(id)) return false; // idem janela aberta
  if (isAgua(id)) return false; // água só via balde/fluxo — nunca por place_block cru
  // §🍖 F6: só a MUDA se planta. Os estágios crescidos nascem do tick e nunca
  // voltam pra mochila (o drop devolve muda), então aceitar o byte pelo fio só
  // daria ao cliente um jeito de plantar trigo maduro de graça.
  if (isPlantacao(id) && !isMudaDePlantacao(id)) return false;
  // §🍖 F10b: a fornalha ACESA é estado, não item — nasce do tick quando o fogo
  // pega e volta a apagada sozinha. Aceitá-la pelo fio daria ao cliente uma
  // fornalha eternamente acesa (e uma luminária de graça). As QUATRO direções
  // acesas caem aqui: o refino que deu frente à fornalha não podia abrir quatro
  // buracos onde havia um.
  if (fornalhaEstaAcesa(id)) return false;
  return Number.isInteger(id) && id >= BlockId.Grass && id <= MAX_BLOCK_ID;
}

/** O jogador pode quebrar este ID? Bedrock não — só o comando /bloco remove. */
export function isBreakable(id: number): boolean {
  return id !== BlockId.Bedrock;
}

/** Bloco SÓ do professor (rocha-matriz = fundo do mundo, ferramenta de autoria).
 *  O aluno não vê no inventário, não copia com o botão do meio e o servidor
 *  recusa o place. Gate autoritativo mora no servidor; o cliente só esconde. */
export function isProfessorOnly(id: number): boolean {
  return id === BlockId.Bedrock;
}
