import {
  BlockId,
  FORNALHA_POR_FRENTE,
  aguaNivel,
  camaHeadDir,
  collisionBoxes,
  fornalhaFrente,
  isAgua,
  isCadeira,
  isCama,
  isFlor,
  isFolhas,
  isGramaAlta,
  isFullCube,
  isJanela,
  isJanelaAberta,
  isMovel,
  isMuda,
  isPlantacao,
  isPorta,
  isPortaAberta,
  isQuadro,
  isSelvagem,
  isSlab,
  isSofa,
  isStairs,
  isTapete,
  isTransparentBlock,
  isVidroColorido,
  janelaEixoX,
  janelaHingeAlta,
  portaEixoX,
  portaHingeAlta,
  slabMaterial,
  stairsMaterial,
} from "./blocks";
import { CHUNK_SIZE } from "./constants";
import { type LuzWorld, luzByte } from "./luz";
import { setorDaDirecao } from "./vento";
import { type World, chunkIndex, getBlock } from "./world";

/**
 * Culled mesher: função PURA (bytes do mundo → geometria). Só emite faces que
 * encostam em ar (corta >90% das faces). Posições locais ao chunk — o cliente
 * posiciona o mesh na origem do chunk. Sem dependência de three.js/navegador,
 * então dá pra mover pra Worker depois sem mexer aqui.
 */

/** Layout do texture atlas. O cliente pinta a textura seguindo ESTE layout.
 *  cp20: 16×16 = 256 tiles (era 8×8 = 64) — coube os blocos-glifo + folga. */
export const ATLAS = { tilesPerRow: 16, tilePx: 16 } as const;

/** Índice de cada tile no atlas (coluna = i % tilesPerRow, linha = ⌊i / tilesPerRow⌋). */
export const TILE = {
  grassTop: 0,
  grassSide: 1,
  dirt: 2,
  stone: 3,
  cobblestone: 4,
  sand: 5,
  logTop: 6,
  logSide: 7,
  planks: 8,
  brick: 9,
  gravel: 10,
  bedrock: 11,
  woolWhite: 12,
  woolBlack: 13,
  woolRed: 14,
  woolOrange: 15,
  woolYellow: 16,
  woolGreen: 17,
  woolBlue: 18,
  woolPurple: 19,
  // cp17
  sandstone: 20,
  stoneBricks: 21,
  snow: 22,
  obsidian: 23,
  woolPink: 24,
  woolCyan: 25,
  woolGray: 26,
  woolBrown: 27,
  // cp18 (transparentes)
  glass: 28,
  leaves: 29,
  // cp23 (não-cubos) — glifos ocupam 30..65 (ver GLYPH)
  cerca: 66,
  portaBaixo: 67,
  portaCima: 68,
  tocha: 69,
  // 2026-07-19: janela (moldura + cruz de madeira, vidro = ausência/cutout)
  janela: 70,
  // 2026-07-19: móveis — estofado (sofá) e colchão (cama); mesa/cadeira
  // reusam o tile das tábuas
  estofado: 71,
  colchao: 72,
  // 2026-07-19: quadro (moldura de madeira + tela branca; o CONTEÚDO é um
  // plane com canvas por cima, no cliente)
  quadro: 73,
  // 2026-07-20: flores (sprite em cruz, fundo transparente/cutout). Ordem =
  // âncora florVermelha + (id − FlorVermelha).
  florVermelha: 74,
  florAmarela: 75,
  florAzul: 76,
  florBranca: 77,
  // 2026-07-20: minérios (pedra + pepitas + sigla — placeholder do survival)
  minerioCarvao: 78,
  minerioFerro: 79,
  minerioOuro: 80,
  minerioDiamante: 81,
  // 2026-07-20: gramas climáticas (topo + lado; bottom reusa dirt)
  gramaSecaTop: 82,
  gramaSecaSide: 83,
  gramaFriaTop: 84,
  gramaFriaSide: 85,
  // 2026-07-20: árvores brasileiras — casca (lado; topo reusa logTop) + copa
  logIpe: 86,
  folhasIpe: 87,
  logAraucaria: 88,
  folhasAraucaria: 89,
  logPauBrasil: 90,
  folhasPauBrasil: 91,
  // 2026-07-20: mandacaru (cacto da caatinga; topo próprio)
  mandacaruSide: 92,
  mandacaruTop: 93,
  // 2026-07-21: água (azul furado em xadrez → translucidez via alphaTest)
  agua: 94,
  // 2026-07-25: vidro colorido (12 cores — cutout tingido/dither). Lajes e
  // escadas NÃO ganham tile: reusam pedra/tábua/tijolo (SLAB_STAIR_TILES).
  vidroBranco: 95, vidroPreto: 96, vidroVermelho: 97, vidroLaranja: 98,
  vidroAmarelo: 99, vidroVerde: 100, vidroAzul: 101, vidroRoxo: 102,
  vidroRosa: 103, vidroCiano: 104, vidroCinza: 105, vidroMarrom: 106,
  // §🌬️ 2026-07-27: grama alta (sprite em cruz). Ordem = âncora gramaAlta +
  // (id − GramaAlta), casando com as 3 gramas climáticas.
  gramaAlta: 107,
  gramaAltaSeca: 108,
  gramaAltaFria: 109,
  /**
   * Correnteza da água (2026-07-27, playtest do §🌬️): 8 tiles, um por SETOR de
   * direção de fluxo (`setorDaDirecao`). `agua` (94) continua sendo a água
   * PARADA, que segue o vento; estes 8 são a água que CORRE, e aí quem manda é o
   * fluxo, não o vento — o usuário apontou que o contrário era contraditório.
   *
   * ⚠️ Os 8 têm de ficar CONTÍGUOS e alinhados no começo de uma linha do atlas
   * (112 = coluna 0 da linha 7, com 16 tiles por linha): o cliente repinta os 8
   * de uma vez com UM `putImageData` de 128×16, e isso exige retângulo.
   */
  aguaFluxo: 112,
  /** §🍖 F6 (2026-08-04): os 4 estágios da plantação, contíguos e na ordem dos
   *  ids (`TILE.plantacao0 + estagio`). Começam em 120 porque `aguaFluxo` ocupa
   *  8 tiles (112..119). Cruz de sprite como a flor: fundo transparente. */
  plantacao0: 120,
  plantacao1: 121,
  plantacao2: 122,
  plantacao3: 123,
  /** §🍖 F10b (2026-08-05): fornalha. `fornalhaTopo` é a chapa de pedra de cima
   *  e de baixo; `fornalhaLado` é a face da BOCA (apagada) e
   *  `fornalhaLadoAcesa` a mesma boca em brasa.
   *
   *  **Refino do mesmo dia: `fornalhaCostas`.** A boca aparecia nas QUATRO
   *  faces — quatro fornalhas encostadas liam como uma parede de bocas, e não
   *  havia como dizer pra onde ela estava virada. Agora a boca sai na FRENTE
   *  (que o id carrega, ver `FORNALHA_POR_FRENTE`) e os outros três lados usam
   *  este tijolo liso. */
  fornalhaTopo: 124,
  fornalhaLado: 125,
  fornalhaLadoAcesa: 126,
  /** §🍖 F10e: baú — tampa com ferrolho em cima, ripas com a fechadura nos
   *  lados. Forma de CAIXA (14/16) desde o refino de 2026-08-05. */
  bauTopo: 127,
  bauLado: 128,
  /** §🍖 F10c: os 4 estágios do algodão CULTIVADO, contíguos e na ordem dos
   *  ids (`TILE.algodao0 + estagio`), + o pé SELVAGEM do gen. Cruz de sprite
   *  como a plantação: fundo transparente. */
  algodao0: 129,
  algodao1: 130,
  algodao2: 131,
  algodao3: 132,
  algodaoSelvagem: 133,
  /** §🍖 F10 (refino): os três lados SEM boca da fornalha. Ver `fornalhaLado`. */
  fornalhaCostas: 134,
  /** §🍖 F10h (2026-08-06): as SEIS culturas — 4 estágios cada, contíguos e na
   *  ordem dos ids (`TILE.cenoura0 + estagio`, e assim por diante), no MESMO
   *  molde da plantação (120) e do algodão (129), seguidos dos SEIS pés
   *  SELVAGENS do gen. Cruz de sprite como todos os outros: fundo transparente.
   *  Cada bloco vai à mochila só no estágio 0 — é ele que o ícone da hotbar
   *  mostra (blockIconTile → side = uniform de `cenoura0`). */
  cenoura0: 135, cenoura1: 136, cenoura2: 137, cenoura3: 138,
  batata0: 139, batata1: 140, batata2: 141, batata3: 142,
  beterraba0: 143, beterraba1: 144, beterraba2: 145, beterraba3: 146,
  melancia0: 147, melancia1: 148, melancia2: 149, melancia3: 150,
  banana0: 151, banana1: 152, banana2: 153, banana3: 154,
  aipim0: 155, aipim1: 156, aipim2: 157, aipim3: 158,
  cenouraSelvagem: 159,
  batataSelvagem: 160,
  beterrabaSelvagem: 161,
  melanciaSelvagem: 162,
  bananaSelvagem: 163,
  aipimSelvagem: 164,
  /** §🪵 (2026-08-15): as 16 mudas de árvore — 4 estágios × 4 espécies,
   *  contíguas e na ordem dos ids (`TILE.mudaComum0 + espécie*4 + estágio`).
   *  Cruz de sprite como plantação/cultura: fundo transparente, o ESTÁGIO é a
   *  altura desenhada e a COR já diz a espécie (a muda é a prologa da árvore
   *  que será). 165 em diante: a última linha do atlas (aipimSelvagem = 164). */
  mudaComum0: 165, mudaComum1: 166, mudaComum2: 167, mudaComum3: 168,
  mudaIpe0: 169, mudaIpe1: 170, mudaIpe2: 171, mudaIpe3: 172,
  mudaAraucaria0: 173, mudaAraucaria1: 174, mudaAraucaria2: 175, mudaAraucaria3: 176,
  mudaPauBrasil0: 177, mudaPauBrasil1: 178, mudaPauBrasil2: 179, mudaPauBrasil3: 180,
} as const;

/** cp20: blocos-glifo. Letras A–Z e dígitos 0–9 ocupam tiles consecutivos a
 *  partir de `base` (A=30 … Z=55, 0=56 … 9=65). O cliente pinta o glifo; o
 *  mesher só precisa do índice do tile. FONTE ÚNICA de layout: atlas, tiles e
 *  nomes (blocksUi) derivam daqui — mantém letras/dígitos sempre em sincronia. */
export const GLYPH = {
  base: 30,
  letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
} as const;

interface FaceTiles {
  readonly top: number;
  readonly bottom: number;
  readonly side: number;
  /** Tile da face da FRENTE, quando o bloco tem uma (§🍖 F10 refino: a boca da
   *  fornalha). Quem responde PARA ONDE é a frente é `frenteDoBloco`, no
   *  próprio id — este campo só diz que o bloco tem uma face diferente das
   *  outras três, e é a presença dele que liga a pergunta no laço de faces. */
  readonly frente?: number;
}

/** Bloco com o mesmo tile nas 6 faces. */
const uniform = (tile: number): FaceTiles => ({ top: tile, bottom: tile, side: tile });

/** Vetor XZ de cada direção `k` da convenção dos móveis: 0 +x, 1 +z, 2 −x, 3 −z. */
const DIR_XZ: readonly (readonly [number, number])[] = [[1, 0], [0, 1], [-1, 0], [0, -1]];

/** Pra onde a face da FRENTE deste bloco aponta, ou `null` se ele não tem uma.
 *  Hoje só a fornalha responde — mas a pergunta é do MESHER (que face recebe o
 *  tile diferente?) e não da fornalha, então quem entrar depois entra aqui. */
function frenteDoBloco(id: number): readonly [number, number] | null {
  const k = fornalhaFrente(id);
  return k < 0 ? null : (DIR_XZ[k] ?? null);
}

const BLOCK_TILES: Record<number, FaceTiles> = {
  [BlockId.Grass]: { top: TILE.grassTop, bottom: TILE.dirt, side: TILE.grassSide },
  [BlockId.Stone]: uniform(TILE.stone),
  [BlockId.Cobblestone]: uniform(TILE.cobblestone),
  [BlockId.Sand]: uniform(TILE.sand),
  [BlockId.Dirt]: uniform(TILE.dirt),
  [BlockId.Log]: { top: TILE.logTop, bottom: TILE.logTop, side: TILE.logSide },
  [BlockId.Planks]: uniform(TILE.planks),
  [BlockId.Brick]: uniform(TILE.brick),
  [BlockId.Gravel]: uniform(TILE.gravel),
  [BlockId.Bedrock]: uniform(TILE.bedrock),
  [BlockId.WoolWhite]: uniform(TILE.woolWhite),
  [BlockId.WoolBlack]: uniform(TILE.woolBlack),
  [BlockId.WoolRed]: uniform(TILE.woolRed),
  [BlockId.WoolOrange]: uniform(TILE.woolOrange),
  [BlockId.WoolYellow]: uniform(TILE.woolYellow),
  [BlockId.WoolGreen]: uniform(TILE.woolGreen),
  [BlockId.WoolBlue]: uniform(TILE.woolBlue),
  [BlockId.WoolPurple]: uniform(TILE.woolPurple),
  [BlockId.Sandstone]: uniform(TILE.sandstone),
  [BlockId.StoneBricks]: uniform(TILE.stoneBricks),
  [BlockId.Snow]: uniform(TILE.snow),
  [BlockId.Obsidian]: uniform(TILE.obsidian),
  [BlockId.WoolPink]: uniform(TILE.woolPink),
  [BlockId.WoolCyan]: uniform(TILE.woolCyan),
  [BlockId.WoolGray]: uniform(TILE.woolGray),
  [BlockId.WoolBrown]: uniform(TILE.woolBrown),
  [BlockId.Glass]: uniform(TILE.glass),
  [BlockId.Leaves]: uniform(TILE.leaves),
  // cp23: não-cubos NÃO passam pelo caminho de cubo do mesher (têm forma
  // própria) — estas entradas alimentam só o ícone 2D (blockIconTile).
  [BlockId.Cerca]: uniform(TILE.cerca),
  [BlockId.PortaXFechada]: uniform(TILE.portaCima),
  [BlockId.PortaXAberta]: uniform(TILE.portaCima),
  [BlockId.PortaZFechada]: uniform(TILE.portaCima),
  [BlockId.PortaZAberta]: uniform(TILE.portaCima),
  // portas R (dobradiça alta) — mesmo ícone; nunca vão à hotbar (o servidor as
  // grava, o cliente sempre copia porta → PortaXFechada), mas blockIconTile não
  // pode faltar caso algo peça o ícone de uma porta R.
  [BlockId.PortaXFechadaR]: uniform(TILE.portaCima),
  [BlockId.PortaXAbertaR]: uniform(TILE.portaCima),
  [BlockId.PortaZFechadaR]: uniform(TILE.portaCima),
  [BlockId.PortaZAbertaR]: uniform(TILE.portaCima),
  [BlockId.Tocha]: uniform(TILE.tocha),
  [BlockId.JanelaXFechada]: uniform(TILE.janela),
  [BlockId.JanelaXAberta]: uniform(TILE.janela),
  [BlockId.JanelaZFechada]: uniform(TILE.janela),
  [BlockId.JanelaZAberta]: uniform(TILE.janela),
  // janelas R (dobradiça alta) — mesmo ícone; nunca vão à hotbar (copy → base)
  [BlockId.JanelaXFechadaR]: uniform(TILE.janela),
  [BlockId.JanelaXAbertaR]: uniform(TILE.janela),
  [BlockId.JanelaZFechadaR]: uniform(TILE.janela),
  [BlockId.JanelaZAbertaR]: uniform(TILE.janela),
  // móveis (2026-07-19): estas entradas alimentam SÓ o ícone 2D — a forma
  // (e o tile por caixa) vive no emitShape
  [BlockId.Mesa]: uniform(TILE.planks),
  // 2026-07-20: minérios + gramas climáticas + árvores brasileiras + mandacaru
  [BlockId.MinerioCarvao]: uniform(TILE.minerioCarvao),
  [BlockId.MinerioFerro]: uniform(TILE.minerioFerro),
  [BlockId.MinerioOuro]: uniform(TILE.minerioOuro),
  [BlockId.MinerioDiamante]: uniform(TILE.minerioDiamante),
  [BlockId.GramaSeca]: { top: TILE.gramaSecaTop, bottom: TILE.dirt, side: TILE.gramaSecaSide },
  [BlockId.GramaFria]: { top: TILE.gramaFriaTop, bottom: TILE.dirt, side: TILE.gramaFriaSide },
  [BlockId.LogIpe]: { top: TILE.logTop, bottom: TILE.logTop, side: TILE.logIpe },
  [BlockId.FolhasIpe]: uniform(TILE.folhasIpe),
  [BlockId.LogAraucaria]: { top: TILE.logTop, bottom: TILE.logTop, side: TILE.logAraucaria },
  [BlockId.FolhasAraucaria]: uniform(TILE.folhasAraucaria),
  [BlockId.LogPauBrasil]: { top: TILE.logTop, bottom: TILE.logTop, side: TILE.logPauBrasil },
  [BlockId.FolhasPauBrasil]: uniform(TILE.folhasPauBrasil),
  [BlockId.Mandacaru]: { top: TILE.mandacaruTop, bottom: TILE.mandacaruTop, side: TILE.mandacaruSide },
  // água (2026-07-21): cubo cheio p/ o mesher (transparente → funde com água
  // vizinha, mostra só a casca); não-sólido só pra física (blocks.ts).
  [BlockId.Agua]: uniform(TILE.agua),
  // §🍖 F10e: o baú NÃO é cubo cheio desde o refino — esta entrada alimenta só o
  // ícone 2D da hotbar; a forma de caixa (e o tile por face) vive no emitShape.
  [BlockId.Bau]: { top: TILE.bauTopo, bottom: TILE.bauTopo, side: TILE.bauLado },
};
// §🍖 F10b + refino: fornalha — cubo cheio (o inventário dela mora fora do
// byte). Chapa de pedra em cima e embaixo, tijolo liso nos três lados de trás e
// a BOCA só na frente, que o próprio id carrega. As quatro direções × dois
// estados saem de uma tabela: escrever oito entradas à mão seria oito chances
// de trocar um tile e ninguém perceber até a aula.
for (const { apagada, acesa } of FORNALHA_POR_FRENTE) {
  BLOCK_TILES[apagada] = {
    top: TILE.fornalhaTopo, bottom: TILE.fornalhaTopo,
    side: TILE.fornalhaCostas, frente: TILE.fornalhaLado,
  };
  BLOCK_TILES[acesa] = {
    top: TILE.fornalhaTopo, bottom: TILE.fornalhaTopo,
    side: TILE.fornalhaCostas, frente: TILE.fornalhaLadoAcesa,
  };
}
// água fluida (2026-07-22): os 7 níveis usam o MESMO tile da fonte (v1 cubo
// cheio; a altura-por-nível é refino futuro).
for (let id = BlockId.AguaFluida1; id <= BlockId.AguaFluida7; id++) {
  BLOCK_TILES[id] = uniform(TILE.agua);
}

// vidro colorido (2026-07-25): 12 cores, tiles consecutivos a partir de vidroBranco.
for (let i = 0; i < 12; i++) {
  BLOCK_TILES[BlockId.VidroBranco + i] = uniform(TILE.vidroBranco + i);
}

/** Tile por material de laje/escada (0 pedra, 1 tábua, 2 tijolo) — reusa os
 *  tiles dos blocos cheios (sem pintura nova). */
const SLAB_STAIR_TILES: readonly number[] = [TILE.stone, TILE.planks, TILE.brick];
// lajes (2026-07-25): ícone 2D = tile do material (a forma vive no emitShape).
for (let id = BlockId.LajePedraBaixo; id <= BlockId.LajeTijoloCima; id++) {
  BLOCK_TILES[id] = uniform(SLAB_STAIR_TILES[slabMaterial(id)]!);
}
// escadas (2026-07-25): idem, ícone = tile do material.
for (let id = BlockId.EscadaPedraXP; id <= BlockId.EscadaTijoloZNC; id++) {
  BLOCK_TILES[id] = uniform(SLAB_STAIR_TILES[stairsMaterial(id)]!);
}

// móveis direcionais: mesmo ícone pras 4 direções
for (let k = 0; k < 4; k++) {
  BLOCK_TILES[BlockId.CadeiraXP + k] = uniform(TILE.planks);
  BLOCK_TILES[BlockId.SofaXP + k] = uniform(TILE.estofado);
  BLOCK_TILES[BlockId.CamaXP + k] = uniform(TILE.colchao);
  BLOCK_TILES[BlockId.QuadroXP + k] = uniform(TILE.quadro);
}

// flores (2026-07-20): um tile por cor; alimenta o ícone 2D e a forma-cruz.
for (let i = 0; i < 4; i++) {
  BLOCK_TILES[BlockId.FlorVermelha + i] = uniform(TILE.florVermelha + i);
}

// grama alta (§🌬️ 2026-07-27): mesma ideia — a entrada aqui serve o ícone 2D da
// hotbar. Não passa pelo caminho de cubo (isFullCube é false), então nunca vira
// face de cubo por engano.
for (let i = 0; i < 3; i++) {
  BLOCK_TILES[BlockId.GramaAlta + i] = uniform(TILE.gramaAlta + i);
}

// plantação (§🍖 F6 2026-08-04): um tile por estágio, na ordem dos ids. O ícone
// 2D da hotbar sai daqui — e é o do estágio 0, que é o único que vai à mochila.
for (let i = 0; i < 4; i++) {
  BLOCK_TILES[BlockId.Plantacao0 + i] = uniform(TILE.plantacao0 + i);
}

// algodão (§🍖 F10c 2026-08-05): mesma ideia — 4 estágios + o pé selvagem.
for (let i = 0; i < 4; i++) {
  BLOCK_TILES[BlockId.Algodao0 + i] = uniform(TILE.algodao0 + i);
}
BLOCK_TILES[BlockId.AlgodaoSelvagem] = uniform(TILE.algodaoSelvagem);

// §🍖 F10h (2026-08-06): as seis culturas, no MOLDE exato do algodão — um tile
// por estágio (a altura desenhada conta a idade), e cada pé selvagem com o
// próprio tile. Ordem das âncoras = a ordem dos ids, então um único laço por
// cultura faz tudo; o `uniform` é só o ícone 2D + tile da cruz.
const CULTURAS_SELVAGENS: readonly (readonly [number, number, number])[] = [
  // [id do estágio 0, tile estágio 0, tile selvagem]
  [BlockId.Cenoura0, TILE.cenoura0, TILE.cenouraSelvagem],
  [BlockId.Batata0, TILE.batata0, TILE.batataSelvagem],
  [BlockId.Beterraba0, TILE.beterraba0, TILE.beterrabaSelvagem],
  [BlockId.Melancia0, TILE.melancia0, TILE.melanciaSelvagem],
  [BlockId.Banana0, TILE.banana0, TILE.bananaSelvagem],
  [BlockId.Aipim0, TILE.aipim0, TILE.aipimSelvagem],
];
for (const [base, tile, tileSelvagem] of CULTURAS_SELVAGENS) {
  for (let i = 0; i < 4; i++) BLOCK_TILES[base + i] = uniform(tile + i);
  BLOCK_TILES[base + 4] = uniform(tileSelvagem);
}

// §🪵 (2026-08-15): as 16 mudas — um tile por espécie/estágio, na ordem dos
// ids. Alimenta o ícone 2D (o estágio 0, único que vai à mochila) e o tile da
// cruz; nunca passa pelo caminho de cubo (isFullCube é false).
for (let i = 0; i < 16; i++) {
  BLOCK_TILES[BlockId.MudaComum0 + i] = uniform(TILE.mudaComum0 + i);
}

// cp20: letras/dígitos = cubos uniformes com o tile do glifo (append A→Z, 0→9).
for (let i = 0; i < GLYPH.letters.length; i++) {
  BLOCK_TILES[BlockId.LetterA + i] = uniform(GLYPH.base + i);
}
for (let i = 0; i < GLYPH.digits.length; i++) {
  BLOCK_TILES[BlockId.Digit0 + i] = uniform(GLYPH.base + GLYPH.letters.length + i);
}

/** Tapetes (2026-07-19): tile da PRÓPRIA lã, na ordem TapeteBranco..TapeteMarrom
 *  (a forma fina vive no emitShape; estas entradas dão o ícone 2D + o tile). */
const TAPETE_TILES: readonly number[] = [
  TILE.woolWhite, TILE.woolBlack, TILE.woolRed, TILE.woolOrange,
  TILE.woolYellow, TILE.woolGreen, TILE.woolBlue, TILE.woolPurple,
  TILE.woolPink, TILE.woolCyan, TILE.woolGray, TILE.woolBrown,
];
for (let i = 0; i < TAPETE_TILES.length; i++) {
  BLOCK_TILES[BlockId.TapeteBranco + i] = uniform(TAPETE_TILES[i]!);
}

/** Tile usado como ÍCONE 2D do bloco (hotbar/inventário do cliente) — a face lateral. */
export function blockIconTile(id: number): number {
  // a FRENTE ganha do lado quando existe: o ícone da fornalha na hotbar tem de
  // ser o que mostra a boca, e não o tijolo liso das costas.
  const t = BLOCK_TILES[id];
  return t?.frente ?? t?.side ?? TILE.stone;
}

/** Bloco desenhado como CRUZ DE SPRITE (duas lâminas a 90°): flor, capim,
 *  plantação e os pés SELVAGENS (algodão e as seis culturas). Uma pergunta só,
 *  porque as três respostas que dependem dela — a caixa de seleção, o balanço
 *  no vento e a forma no mesher — têm de concordar sempre. */
function ehCruzDeSprite(id: number): boolean {
  return (
    isFlor(id) || isGramaAlta(id) || isPlantacao(id) || isSelvagem(id) ||
    isMuda(id)
  );
}

/** Caixa de SELEÇÃO (o contorno preto da mira / "hitbox" visual) de um bloco,
 *  em frações da célula: [x0,y0,z0,x1,y1,z1]. Cubo cheio = célula inteira;
 *  cada não-cubo devolve a caixa que ENVOLVE a forma do mesher, então o
 *  contorno segue a textura (estilo Minecraft). PURA — estado/direção moram no
 *  próprio id (porta/janela aberta, quadro/móvel direcional). */
export function blockSelectionBox(
  id: number,
): readonly [number, number, number, number, number, number] {
  if (ehCruzDeSprite(id)) {
    return [4 * P, 0, 4 * P, 12 * P, 1, 12 * P];
  }
  if (isTapete(id)) return [0, 0, 0, 1, P, 1];
  if (id === BlockId.Tocha) return [7 * P, 0, 7 * P, 9 * P, 10 * P, 9 * P];
  if (id === BlockId.Cerca) return [6 * P, 0, 6 * P, 10 * P, 1, 10 * P];
  if (isPorta(id)) {
    if (!isPortaAberta(id))
      return portaEixoX(id) ? [0, 0, 0, 2 * P, 1, 1] : [0, 0, 0, 1, 1, 2 * P];
    const c = portaHingeAlta(id) ? 1 - 2 * P : 0;
    return portaEixoX(id) ? [0, 0, c, 1, 1, c + 2 * P] : [c, 0, 0, c + 2 * P, 1, 1];
  }
  if (isJanela(id)) {
    if (!isJanelaAberta(id))
      return janelaEixoX(id) ? [0, 0, 0, 2 * P, 1, 1] : [0, 0, 0, 1, 1, 2 * P];
    const c = janelaHingeAlta(id) ? 1 - 2 * P : 0;
    return janelaEixoX(id) ? [0, 0, c, 1, 1, c + 2 * P] : [c, 0, 0, c + 2 * P, 1, 1];
  }
  if (isQuadro(id)) {
    const [rxa, rza, rxb, rzb] = rotXZ(0, 1 * P, 2 * P, 15 * P, id - BlockId.QuadroXP);
    return [
      Math.min(rxa, rxb), 1 * P, Math.min(rza, rzb),
      Math.max(rxa, rxb), 15 * P, Math.max(rza, rzb),
    ];
  }
  if (id === BlockId.Mesa) return [0, 0, 0, 1, 14 * P, 1];
  // §🍖 F10e (refino): a mira segue a CAIXA — o contorno preto rente à madeira
  // é o que diz ao aluno qual dos dois baús encostados ele vai abrir.
  if (id === BlockId.Bau) return [P, 0, P, 15 * P, 14 * P, 15 * P];
  if (isCadeira(id)) return [3 * P, 0, 3 * P, 13 * P, 1, 13 * P];
  if (isSofa(id)) return [0, 0, 0, 1, 15 * P, 1];
  if (isCama(id)) return [0, 0, 0, 1, 9 * P, 1];
  // laje = a própria metade (a mira atravessa a metade vazia, estilo Minecraft);
  // escada = envelope de cubo cheio (simples de mirar; degrau real fica no mesher).
  if (isSlab(id)) return collisionBoxes(id)[0]!;
  if (isStairs(id)) return [0, 0, 0, 1, 1, 1];
  return [0, 0, 0, 1, 1, 1]; // cubo cheio (e fallback)
}

interface FaceCorner {
  readonly pos: readonly [number, number, number];
  readonly uv: readonly [0 | 1, 0 | 1];
}

interface Face {
  readonly dir: readonly [number, number, number];
  readonly corners: readonly [FaceCorner, FaceCorner, FaceCorner, FaceCorner];
}

/** 6 faces do cubo unitário, winding CCW visto de fora (front face do three.js). */
const FACES: readonly Face[] = [
  {
    dir: [-1, 0, 0],
    corners: [
      { pos: [0, 1, 0], uv: [0, 1] },
      { pos: [0, 0, 0], uv: [0, 0] },
      { pos: [0, 1, 1], uv: [1, 1] },
      { pos: [0, 0, 1], uv: [1, 0] },
    ],
  },
  {
    dir: [1, 0, 0],
    corners: [
      { pos: [1, 1, 1], uv: [0, 1] },
      { pos: [1, 0, 1], uv: [0, 0] },
      { pos: [1, 1, 0], uv: [1, 1] },
      { pos: [1, 0, 0], uv: [1, 0] },
    ],
  },
  {
    dir: [0, -1, 0],
    corners: [
      { pos: [1, 0, 1], uv: [1, 0] },
      { pos: [0, 0, 1], uv: [0, 0] },
      { pos: [1, 0, 0], uv: [1, 1] },
      { pos: [0, 0, 0], uv: [0, 1] },
    ],
  },
  {
    dir: [0, 1, 0],
    corners: [
      { pos: [0, 1, 1], uv: [1, 1] },
      { pos: [1, 1, 1], uv: [0, 1] },
      { pos: [0, 1, 0], uv: [1, 0] },
      { pos: [1, 1, 0], uv: [0, 0] },
    ],
  },
  {
    dir: [0, 0, -1],
    corners: [
      { pos: [1, 0, 0], uv: [0, 0] },
      { pos: [0, 0, 0], uv: [1, 0] },
      { pos: [1, 1, 0], uv: [0, 1] },
      { pos: [0, 1, 0], uv: [1, 1] },
    ],
  },
  {
    dir: [0, 0, 1],
    corners: [
      { pos: [0, 0, 1], uv: [0, 0] },
      { pos: [1, 0, 1], uv: [1, 0] },
      { pos: [0, 1, 1], uv: [0, 1] },
      { pos: [1, 1, 1], uv: [1, 1] },
    ],
  },
];

/** Eixo do mundo que uma coordenada UV da face percorre (pré-computado das
 *  FACES): u=0→1 anda neste eixo; flip = anda no sentido decrescente. */
interface UvAxis {
  axis: 0 | 1 | 2;
  flip: boolean;
}

function uvAxisOf(a: FaceCorner, b: FaceCorner): UvAxis {
  for (const axis of [0, 1, 2] as const) {
    if (a.pos[axis] !== b.pos[axis]) return { axis, flip: a.pos[axis] === 1 };
  }
  return { axis: 0, flip: false };
}

/** Eixos de MUNDO que o u e o v de cada face seguem (índice = ordem de FACES).
 *
 *  Serve pra saber, numa face qualquer, em que direção do mundo a textura anda —
 *  e é a peça que faltava pra corrigir o SENTIDO da correnteza face por face
 *  (playtest de 2026-07-27). Derivado de FACES, não escrito à mão: se um canto
 *  mudar lá, isto acompanha. */
export interface FaceBase {
  readonly dir: readonly [number, number, number];
  /** Direção de mundo que o u da face segue (vetor unitário de eixo). */
  readonly du: readonly [number, number, number];
  /** Direção de mundo que o v da face segue. Nas faces LATERAIS é sempre +y. */
  readonly dv: readonly [number, number, number];
}

export const FACE_BASES: readonly FaceBase[] = FACES.map((f) => {
  const at = (u: 0 | 1, v: 0 | 1): FaceCorner =>
    f.corners.find((c) => c.uv[0] === u && c.uv[1] === v) ?? f.corners[0];
  const p00 = at(0, 0).pos;
  const p10 = at(1, 0).pos;
  const p01 = at(0, 1).pos;
  const sub = (
    a: readonly [number, number, number],
    b: readonly [number, number, number],
  ): readonly [number, number, number] => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  return { dir: f.dir as readonly [number, number, number], du: sub(p10, p00), dv: sub(p01, p00) };
});

const FACE_UVS: readonly { u: UvAxis; v: UvAxis }[] = FACES.map((f) => {
  const at = (u: 0 | 1, v: 0 | 1): FaceCorner =>
    f.corners.find((c) => c.uv[0] === u && c.uv[1] === v) ?? f.corners[0];
  return { u: uvAxisOf(at(0, 0), at(1, 0)), v: uvAxisOf(at(0, 0), at(0, 1)) };
});

/** 1/16 da célula — o "pixel" das formas não-cubo (16 texels por face). */
const P = 1 / 16;

/** Os 4 vizinhos no plano XZ (gradiente da correnteza da água). */
const VIZINHOS_XZ: readonly (readonly [number, number])[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * Tile da correnteza pra UMA face de água, dado o fluxo da célula (§🌬️,
 * correção de sentido do playtest de 2026-07-27).
 *
 * O problema que isto resolve: o tile é uma imagem de 2 eixos, e cada face do
 * cubo amarra esses 2 eixos a direções de mundo DIFERENTES. Escolher um tile só
 * pra célula inteira fazia a onda sair certa no topo e torta em todo o resto —
 * a face de baixo corria ao contrário, e as laterais mostravam a onda DESCENDO
 * em vez de correr na horizontal.
 *
 * ⚠️ Rotação fixa por face NÃO resolve isso, por mais que pareça: nas faces
 * laterais um dos eixos do tile é o VERTICAL, então a mesma rotação que acerta
 * um fluxo pro norte erra um fluxo pro leste (com fluxo leste as laterais já
 * mostram a onda na horizontal). O que vale pra qualquer direção é PROJETAR o
 * fluxo nos eixos daquela face, que é o que esta função faz.
 *
 * Faces laterais perpendiculares ao fluxo não têm componente horizontal pra
 * mostrar (a água entra na parede); essas — e as de água CAINDO — mostram a onda
 * descendo, que é a leitura de cachoeira.
 */
export function tileAguaDaFace(face: number, fx: number, fz: number, caindo: boolean): number {
  const base = FACE_BASES[face];
  if (!base) return TILE.agua;
  // sem correnteza (mar/lago: tudo fonte) o vento é quem manda, em TODA face —
  // tem de sair antes do ramo de "cachoeira" abaixo, senão o mar desceria
  if (fx === 0 && fz === 0) return TILE.agua;
  const lateral = base.dv[1] !== 0; // nas laterais o v segue o eixo Y
  // direção desejada NO MUNDO, já projetada nos eixos da face
  let u = fx * base.du[0] + fz * base.du[2];
  let v = fx * base.dv[0] + fz * base.dv[2];
  if (lateral && (caindo || u === 0)) {
    // água caindo (ou face de costas pro fluxo): a onda desce
    u = 0;
    v = -1;
  }
  if (u === 0 && v === 0) return TILE.agua;
  // ONDA_AGUA_POR_SETOR[s] é o vetor de CANVAS do setor s, e vale −dir(s); o
  // canvas tem o y pra baixo (cy = −v). Juntando os dois sinais: s = setor(−u, v).
  return TILE.aguaFluxo + setorDaDirecao(-u, v);
}

/** Altura do topo da água de nível MÁXIMO (fonte, 8/8). Fica abaixo do teto da
 *  célula pra a superfície ler como "lâmina d'água" e não como bloco cheio —
 *  convenção do Minecraft. Água com água EM CIMA ignora isto e vai a 1 (coluna
 *  submersa não pode ter fresta). */
export const AGUA_TOPO = 0.875;

/** Gira o retângulo XZ de uma caixa k×90° em torno do centro da célula
 *  (0.5, 0.5). Usado pelos móveis direcionais: forma escrita uma vez de
 *  frente pra +x, as outras 3 direções saem daqui. */
function rotXZ(
  xa: number, za: number, xb: number, zb: number, k: number,
): [number, number, number, number] {
  for (let i = 0; i < k; i++) {
    const nxa = 1 - zb;
    const nzb = xb;
    const nxb = 1 - za;
    const nza = xa;
    xa = nxa; za = nza; xb = nxb; zb = nzb;
  }
  return [xa, za, xb, zb];
}

/** Quanto cada família balança no vento (§🌬️, 2026-07-27), em [0,1]. Vira o
 *  atributo `sway` por vértice; o shader do cliente multiplica o deslocamento
 *  por ele. Folha balança POUCO (o galho segura); planta rasteira vai inteira. */
export const SWAY_FOLHAS = 0.34;
export const SWAY_PLANTA = 1;

/** Balanço do bloco. 0 = rígido (a esmagadora maioria — pedra não venta). */
function swayDoBloco(id: number): number {
  if (isFolhas(id)) return SWAY_FOLHAS;
  if (ehCruzDeSprite(id)) return SWAY_PLANTA;
  return 0;
}

export interface ChunkGeometry {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  /**
   * §🌬️ Balanço por VÉRTICE, 0..255 (byte normalizado no atributo da GPU).
   *
   * Por que atributo e não "o shader descobre pela UV": o cutout de folha e o de
   * flor moram em tiles diferentes, mas o teste teria de rodar por FRAGMENTO e
   * ainda assim não separaria o topo do pé do capim. Aqui a informação nasce no
   * mesher, que já sabe qual bloco está emitindo, custa 1 byte por vértice e o
   * vertex shader só multiplica. Na cruz da planta o PÉ vai 0 e o TOPO vai o
   * valor cheio — é o que faz a grama vergar em vez de escorregar de lado.
   */
  sway: Uint8Array;
  /**
   * §💡 Luz por VÉRTICE, byte cru `(ceu << 4) | bloco` (ver `luz.ts`). NÃO é
   * normalizado: o shader separa os dois canais e aplica a hora do dia só no
   * canal do céu — 1 byte normalizado não daria pra desempacotar.
   *
   * O valor é o da célula que a face ENCARA (o vizinho na direção da normal),
   * não o da célula que emite a face: o bloco opaco tem luz 0 por definição, e
   * a face dele mostra a luz do ar que ela vê. Faces internas de forma (a
   * lateral de uma laje, a cruz da flor) usam a luz da PRÓPRIA célula, que
   * nesses casos é transparente e portanto iluminada.
   */
  luz: Uint8Array;
  /** Índices OPACOS primeiro, ÁGUA depois, VIDRO COLORIDO por último
   *  (concatenados). O cliente fatia em 3 grupos: [0, opaqueIndexCount) =
   *  material opaco (cutout); os `aguaIndexCount` seguintes = material da água;
   *  o resto = material do vidro colorido. Ambos transparentes DE VERDADE
   *  (blend) — e cada um só vira draw call no chunk que o contém. */
  indices: Uint32Array;
  /** Quantos índices são opacos (o restante é água + vidro colorido). */
  opaqueIndexCount: number;
  /** Quantos índices são de água (logo depois dos opacos). 2026-07-25. */
  aguaIndexCount: number;
}

/** Lado da VIZINHANÇA que o mesher lê: o chunk (16) + 1 bloco de casca em cada
 *  direção. Todo acesso a bloco daqui pra baixo cai em `[-1 .. CHUNK_SIZE]` nos
 *  três eixos — face culled, conexão de cerca, pé/cabeceira da cama e os cantos
 *  inclinados da água olham no máximo ±1. É por isso que o mesher NÃO precisa do
 *  `World`: dado esse cubo de bytes, ele é uma função pura, e função pura roda
 *  em Web Worker (2026-07-26, perfil do lab: `malha` custava 9,7–13,4 s na main
 *  thread num PC de sala de aula). */
export const VIZ_LADO = CHUNK_SIZE + 2;
export const VIZ_VOLUME = VIZ_LADO * VIZ_LADO * VIZ_LADO;

/** Índice dentro da vizinhança, em coordenadas LOCAIS do chunk (−1 e
 *  CHUNK_SIZE caem na casca). Mesma ordem do `blockIndex`: x contíguo. */
function vizIndex(lx: number, ly: number, lz: number): number {
  return ((ly + 1) * VIZ_LADO + (lz + 1)) * VIZ_LADO + (lx + 1);
}

const GEOMETRIA_VAZIA = (): ChunkGeometry => ({
  positions: new Float32Array(0),
  normals: new Float32Array(0),
  uvs: new Float32Array(0),
  sway: new Uint8Array(0),
  luz: new Uint8Array(0),
  indices: new Uint32Array(0),
  opaqueIndexCount: 0,
  aguaIndexCount: 0,
});

/**
 * Copia o chunk (cx,cy,cz) + a casca de 1 bloco pra um buffer plano 18³.
 * `null` = nada a montar — é o fast path de 2026-07-19 (chunk 100% ar não emite
 * face nenhuma; no mundo G 75% dos chunks são céu, e varrer 4096 células × 6
 * faces à toa dominava o mesh do join: 1,1 s → ~0,3 s). Chunk AUSENTE (mundo
 * esparso, 2026-07-20) = ar puro → mesmo caminho.
 *
 * O interior sai por `set()` de linhas de 16 bytes (x é contíguo nos dois
 * layouts); só a casca passa por `getBlock`. Custa ~30 µs contra os 1,6–3,6 ms
 * do mesh — é essa razão que torna barato mandar o cubo pro Worker.
 */
export function extrairVizinhanca(
  world: World,
  cx: number,
  cy: number,
  cz: number,
): Uint8Array | null {
  const bytes = world.chunks[chunkIndex(world, cx, cy, cz)];
  if (!bytes || bytes.every((b) => b === 0)) return null;

  const viz = new Uint8Array(VIZ_VOLUME);
  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const src = (ly * CHUNK_SIZE + lz) * CHUNK_SIZE;
      viz.set(bytes.subarray(src, src + CHUNK_SIZE), vizIndex(0, ly, lz));
    }
  }

  const ox = cx * CHUNK_SIZE;
  const oy = cy * CHUNK_SIZE;
  const oz = cz * CHUNK_SIZE;
  for (let ly = -1; ly <= CHUNK_SIZE; ly++) {
    const yDentro = ly >= 0 && ly < CHUNK_SIZE;
    for (let lz = -1; lz <= CHUNK_SIZE; lz++) {
      const linhaDentro = yDentro && lz >= 0 && lz < CHUNK_SIZE;
      for (let lx = -1; lx <= CHUNK_SIZE; lx++) {
        // linha interior já veio inteira pelo set() acima: só as duas pontas
        // faltam, então pula de lx=0 direto pra lx=CHUNK_SIZE.
        if (linhaDentro && lx === 0) lx = CHUNK_SIZE;
        viz[vizIndex(lx, ly, lz)] = getBlock(world, ox + lx, oy + ly, oz + lz);
      }
    }
  }
  return viz;
}

/**
 * §💡 O mesmo cubo 18³, mas dos BYTES DE LUZ (`luz.ts`). Vai junto pro Worker
 * pra ele continuar função pura: a face precisa da luz da célula VIZINHA, e
 * essa célula pode estar na casca, isto é, no chunk do lado.
 *
 * Coluna de luz ainda não acesa devolve 0 (escuro) em vez de mentir claro —
 * mesma escolha do `luzByte`. Sem grade de luz (`undefined`), devolve `null` e
 * o mesher cai no caminho "tudo aceso", que é como o jogo era antes desta fase.
 */
export function extrairVizinhancaLuz(
  luz: LuzWorld | undefined,
  cx: number,
  cy: number,
  cz: number,
): Uint8Array | null {
  if (!luz) return null;
  const out = new Uint8Array(VIZ_VOLUME);
  const ox = cx * CHUNK_SIZE;
  const oy = cy * CHUNK_SIZE;
  const oz = cz * CHUNK_SIZE;
  for (let ly = -1; ly <= CHUNK_SIZE; ly++)
    for (let lz = -1; lz <= CHUNK_SIZE; lz++)
      for (let lx = -1; lx <= CHUNK_SIZE; lx++)
        out[vizIndex(lx, ly, lz)] = luzByte(luz, ox + lx, oy + ly, oz + lz);
  return out;
}

/** Conveniência síncrona (main thread, servidor, testes). O caminho do Worker
 *  chama `extrairVizinhanca`/`extrairVizinhancaLuz` aqui e `meshVizinhanca` lá. */
export function meshChunk(
  world: World,
  cx: number,
  cy: number,
  cz: number,
  luz?: LuzWorld,
): ChunkGeometry {
  const viz = extrairVizinhanca(world, cx, cy, cz);
  if (!viz) return GEOMETRIA_VAZIA();
  return meshVizinhanca(viz, extrairVizinhancaLuz(luz, cx, cy, cz));
}

/**
 * Núcleo do mesher: bytes → geometria, sem `World` e sem I/O. Roda igual na
 * main thread e no Worker. `viz` é o cubo de `extrairVizinhanca`.
 *
 * `luzViz` ausente = **tudo aceso** (0xff = céu 15 + bloco 15). É o que mantém
 * verdes os testes e os caminhos que não têm grade de luz, e é exatamente a
 * aparência que o jogo tinha antes do §💡.
 */
export function meshVizinhanca(viz: Uint8Array, luzViz?: Uint8Array | null): ChunkGeometry {
  /** Luz da célula em coordenadas LOCAIS (−1 e CHUNK_SIZE leem a casca). */
  const luzDe = (lx: number, ly: number, lz: number): number =>
    luzViz ? (luzViz[vizIndex(lx, ly, lz)] ?? 0) : 0xff;
  /** Bloco em coordenadas LOCAIS do chunk; −1 e CHUNK_SIZE leem a casca. */
  const bloco = (lx: number, ly: number, lz: number): number =>
    viz[vizIndex(lx, ly, lz)] ?? BlockId.Air;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  // §🌬️ balanço por vértice (0..255). Escrito em PARALELO a `positions`: todo
  // caminho que empurra um vértice tem de empurrar um sway junto, senão os
  // arrays desalinham e a folha errada balança.
  const sway: number[] = [];
  /** Balanço do bloco que está sendo emitido AGORA (o laço principal fixa). */
  let swayAtual = 0;
  const pushSway = (n: number): void => {
    for (let i = 0; i < n; i++) sway.push(swayAtual);
  };
  // §💡 luz por vértice (byte cru). Também escrita em PARALELO a `positions`:
  // é sempre a MESMA para os 4 vértices de uma face (iluminação por face, não
  // interpolada — suavizar por vértice é refino futuro, não muda o pipeline).
  const luzVert: number[] = [];
  const pushLuz = (n: number, valor: number): void => {
    for (let i = 0; i < n; i++) luzVert.push(valor);
  };
  // Água (2026-07-22): faces vão pra ESTE array separado → 2º grupo/material
  // (transparente de verdade, blend). Concatenado depois de `indices`.
  const waterIndices: number[] = [];
  // Vidro colorido (2026-07-25): 3º grupo/material — blend de verdade (~20% de
  // opacidade tingida), não mais o dither cutout do vidro comum.
  const vidroIndices: number[] = [];

  const n = ATLAS.tilesPerRow;
  // Meia-texel de recuo nas UVs contra bleeding entre tiles vizinhos.
  const inset = 0.5 / (n * ATLAS.tilePx);

  /** Caixa parcial da célula (frações [0..1]), UV PROPORCIONAL: cada face
   *  amostra do tile a mesma região que ocuparia no cubo cheio — textura de
   *  caixa fina não estica. Face RENTE à borda da célula é coplanar com a face
   *  do vizinho: some se o vizinho é cubo opaco (oclusão) OU tem o MESMO id
   *  (metades da porta fundem — sem z-fight). Base das formas do cp23. */
  const emitBox = (
    lx: number, ly: number, lz: number, id: number, tile: number,
    x0: number, y0: number, z0: number, x1: number, y1: number, z1: number,
    /** Tile das faces de CIMA e de BAIXO, quando ele difere do dos lados (a
     *  tampa do baú). Uma caixa com dois tiles é mais barata — e mais fácil de
     *  ler — que duas caixas coladas com z-fight na junta. */
    tileY: number = tile,
    /** Fusão vertical por MESMO id (bug-602). Laje/escada passam `false`: duas
     *  lajes de mesma metade empilhadas NÃO encostam (vão de 0,5 entre elas) —
     *  cullar a face do meio deixaria um "buraco" visível por baixo. A face
     *  lateral (X/Z) entre vizinhos no mesmo Y continua fundindo, como sempre. */
    fundeVertical = true,
  ): void => {
    const lo = [x0, y0, z0] as const;
    const hi = [x1, y1, z1] as const;
    for (let i = 0; i < FACES.length; i++) {
      const face = FACES[i];
      const axes = FACE_UVS[i];
      if (!face || !axes) continue;
      const flush =
        face.dir[0] === -1 ? x0 === 0 : face.dir[0] === 1 ? x1 === 1 :
        face.dir[1] === -1 ? y0 === 0 : face.dir[1] === 1 ? y1 === 1 :
        face.dir[2] === -1 ? z0 === 0 : z1 === 1;
      if (flush) {
        const nb = bloco(lx + face.dir[0], ly + face.dir[1], lz + face.dir[2]);
        if (nb === id && (fundeVertical || face.dir[1] === 0)) continue;
        if (isFullCube(nb) && !isTransparentBlock(nb)) continue;
      }
      // §💡 face rente à borda vê o VIZINHO; face interna (topo de laje, tampo
      // de mesa) vê a própria célula, que nesses casos não é opaca.
      const luzFace = flush
        ? luzDe(lx + face.dir[0], ly + face.dir[1], lz + face.dir[2])
        : luzDe(lx, ly, lz);
      const tileDaFace = face.dir[1] !== 0 ? tileY : tile;
      const col = tileDaFace % n;
      const row = (tileDaFace / n) | 0;
      const base = positions.length / 3;
      for (const corner of face.corners) {
        const px = corner.pos[0] === 0 ? x0 : x1;
        const py = corner.pos[1] === 0 ? y0 : y1;
        const pz = corner.pos[2] === 0 ? z0 : z1;
        positions.push(lx + px, ly + py, lz + pz);
        normals.push(face.dir[0], face.dir[1], face.dir[2]);
        const fracOf = (a: UvAxis, flag: 0 | 1): number => {
          const world01 = flag === 0 ? (a.flip ? hi[a.axis] : lo[a.axis])
                                     : (a.flip ? lo[a.axis] : hi[a.axis]);
          return a.flip ? 1 - world01 : world01;
        };
        const uf = fracOf(axes.u, corner.uv[0]);
        const vf = fracOf(axes.v, corner.uv[1]);
        uvs.push(
          col / n + inset + uf * (1 / n - 2 * inset),
          1 - (row + 1) / n + inset + vf * (1 / n - 2 * inset),
        );
      }
      pushSway(4);
      pushLuz(4, luzFace);
      indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
    }
  };

  /** Plano vertical fino (2 triângulos) com o tile INTEIRO (UV 0..1), varrendo
   *  a célula em Y (0..1) e a diagonal XZ de (x0,z0) a (x1,z1). Emitido dos DOIS
   *  lados (verso com winding invertido + normal negada) pra aparecer de
   *  qualquer ângulo com material FrontSide. Base do sprite em cruz das flores
   *  (duas lâminas a 90° na diagonal, estilo Minecraft). */
  const emitCrossPlane = (
    lx: number, ly: number, lz: number, tile: number,
    x0: number, z0: number, x1: number, z1: number,
  ): void => {
    const col = tile % n;
    const row = (tile / n) | 0;
    const u0 = col / n + inset;
    const u1 = (col + 1) / n - inset;
    const v0 = 1 - (row + 1) / n + inset;
    const v1 = 1 - row / n - inset;
    // cantos: base-esq, base-dir, topo-dir, topo-esq
    const corners: readonly (readonly [number, number, number])[] = [
      [lx + x0, ly, lz + z0],
      [lx + x1, ly, lz + z1],
      [lx + x1, ly + 1, lz + z1],
      [lx + x0, ly + 1, lz + z0],
    ];
    const cu = [u0, u1, u1, u0] as const;
    const cv = [v0, v0, v1, v1] as const;
    // normal horizontal perpendicular à diagonal (o Lambert precisa iluminar)
    let nx = z1 - z0;
    let nz = -(x1 - x0);
    const len = Math.hypot(nx, nz) || 1;
    nx /= len;
    nz /= len;
    for (const sign of [1, -1] as const) {
      const base = positions.length / 3;
      for (let i = 0; i < 4; i++) {
        const c = corners[i]!;
        positions.push(c[0], c[1], c[2]);
        normals.push(nx * sign, 0, nz * sign);
        uvs.push(cu[i]!, cv[i]!);
        // §🌬️ cantos 0 e 1 são o PÉ da lâmina (y = ly), 2 e 3 o TOPO. Só o topo
        // balança → a planta VERGA, presa no chão, em vez de deslizar inteira.
        sway.push(i >= 2 ? swayAtual : 0);
      }
      // §💡 a cruz vive DENTRO da célula (flor, capim): a luz é a de casa.
      pushLuz(4, luzDe(lx, ly, lz));
      if (sign > 0) indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
      else indices.push(base, base + 2, base + 1, base, base + 3, base + 2);
    }
  };

  /** Cerca conecta neste vizinho? Outra cerca ou qualquer cubo cheio. */
  const cercaConecta = (lx: number, ly: number, lz: number): boolean => {
    const nb = bloco(lx, ly, lz);
    return nb === BlockId.Cerca || isFullCube(nb);
  };

  /** Geometria das formas não-cubo (cp23). true = era forma, célula emitida. */
  const emitShape = (id: number, lx: number, ly: number, lz: number): boolean => {
    switch (id) {
      case BlockId.Cerca: {
        // poste central + travessas (2 alturas) até cada vizinho conectável
        emitBox(lx, ly, lz, id, TILE.cerca, 6 * P, 0, 6 * P, 10 * P, 1, 10 * P);
        const rails = (
          xa: number, za: number, xb: number, zb: number,
        ): void => {
          emitBox(lx, ly, lz, id, TILE.cerca, xa, 12 * P, za, xb, 15 * P, zb);
          emitBox(lx, ly, lz, id, TILE.cerca, xa, 6 * P, za, xb, 9 * P, zb);
        };
        if (cercaConecta(lx - 1, ly, lz)) rails(0, 7 * P, 6 * P, 9 * P);
        if (cercaConecta(lx + 1, ly, lz)) rails(10 * P, 7 * P, 1, 9 * P);
        if (cercaConecta(lx, ly, lz - 1)) rails(7 * P, 0, 9 * P, 6 * P);
        if (cercaConecta(lx, ly, lz + 1)) rails(7 * P, 10 * P, 9 * P, 1);
        return true;
      }
      case BlockId.PortaXFechada:
      case BlockId.PortaXAberta:
      case BlockId.PortaZFechada:
      case BlockId.PortaZAberta:
      case BlockId.PortaXFechadaR:
      case BlockId.PortaXAbertaR:
      case BlockId.PortaZFechadaR:
      case BlockId.PortaZAbertaR: {
        // metade de cima se reconhece pelo vizinho de baixo com o MESMO id
        const tile = bloco(lx, ly - 1, lz) === id ? TILE.portaCima : TILE.portaBaixo;
        // Lâmina fina na BORDA da célula (não centrada), pivota 90° na aresta
        // vertical do canto = DOBRADIÇA (backlog 2026-07-17). FECHADA: varre o
        // vão todo, encostada na face do eixo que BLOQUEIA (idêntica nas 2
        // dobradiças). ABERTA: dobrada contra a parede do flanco — na aresta
        // BAIXA (base) ou ALTA (variante R, dobradiça oposta) do flanco. Assim
        // 2 portas lado a lado abrem pra lados opostos (porta dupla, 2026-07-20).
        const eixoX = portaEixoX(id); // bloqueia X ⇒ flanco varre Z
        if (!isPortaAberta(id)) {
          if (eixoX) emitBox(lx, ly, lz, id, tile, 0, 0, 0, 2 * P, 1, 1);
          else emitBox(lx, ly, lz, id, tile, 0, 0, 0, 1, 1, 2 * P);
        } else {
          const c = portaHingeAlta(id) ? 1 - 2 * P : 0; // borda do flanco: alta ou baixa
          if (eixoX) emitBox(lx, ly, lz, id, tile, 0, 0, c, 1, 1, c + 2 * P);
          else emitBox(lx, ly, lz, id, tile, c, 0, 0, c + 2 * P, 1, 1);
        }
        return true;
      }
      case BlockId.Tocha: {
        emitBox(lx, ly, lz, id, TILE.tocha, 7 * P, 0, 7 * P, 9 * P, 10 * P, 9 * P);
        return true;
      }
      case BlockId.JanelaXFechada:
      case BlockId.JanelaXAberta:
      case BlockId.JanelaZFechada:
      case BlockId.JanelaZAberta:
      case BlockId.JanelaXFechadaR:
      case BlockId.JanelaXAbertaR:
      case BlockId.JanelaZFechadaR:
      case BlockId.JanelaZAbertaR: {
        // mesma dobradiça da porta (aresta do canto), 1 célula só. FECHADA varre
        // o vão; ABERTA dobra no flanco BAIXO (base) ou ALTO (variante R) — o
        // servidor escolhe a dobradiça pelos vizinhos (igual à porta).
        const eixoX = janelaEixoX(id);
        if (!isJanelaAberta(id)) {
          if (eixoX) emitBox(lx, ly, lz, id, TILE.janela, 0, 0, 0, 2 * P, 1, 1);
          else emitBox(lx, ly, lz, id, TILE.janela, 0, 0, 0, 1, 1, 2 * P);
        } else {
          const c = janelaHingeAlta(id) ? 1 - 2 * P : 0;
          if (eixoX) emitBox(lx, ly, lz, id, TILE.janela, 0, 0, c, 1, 1, c + 2 * P);
          else emitBox(lx, ly, lz, id, TILE.janela, c, 0, 0, c + 2 * P, 1, 1);
        }
        return true;
      }
      case BlockId.Bau: {
        // §🍖 F10e (refino): CAIXA de 14/16 de lado e 14/16 de altura, apoiada
        // no chão da célula — o número do Minecraft, e o que faz dois baús
        // vizinhos terem um VÃO entre eles em vez de virarem uma parede de
        // madeira contínua. A tampa (`bauTopo`) entra pelo tile de Y do
        // emitBox; os quatro lados mostram a fechadura.
        emitBox(
          lx, ly, lz, id, TILE.bauLado,
          P, 0, P, 15 * P, 14 * P, 15 * P,
          TILE.bauTopo,
        );
        return true;
      }
      case BlockId.Mesa: {
        // tampo + 4 pernas nos cantos (tábuas)
        emitBox(lx, ly, lz, id, TILE.planks, 0, 12 * P, 0, 1, 14 * P, 1);
        for (const [xa, za] of [[1, 1], [13, 1], [1, 13], [13, 13]] as const) {
          emitBox(lx, ly, lz, id, TILE.planks, xa * P, 0, za * P, (xa + 2) * P, 12 * P, (za + 2) * P);
        }
        return true;
      }
      default: {
        // laje/escada (2026-07-25): a FORMA é exatamente a caixa de colisão
        // (collisionBoxes) — meia altura (laje) ou base+degrau em L (escada).
        // emitBox já culla a face rente ao vizinho cheio e funde com id igual.
        if (isSlab(id) || isStairs(id)) {
          const tile = SLAB_STAIR_TILES[isSlab(id) ? slabMaterial(id) : stairsMaterial(id)]!;
          for (const [bx0, by0, bz0, bx1, by1, bz1] of collisionBoxes(id)) {
            // fundeVertical=false (bug-602): lajes/escadas têm altura parcial —
            // vizinho de mesmo id empilhado deixa vão; a face vertical do meio
            // tem de aparecer (senão "buraco" por baixo na pilha).
            emitBox(lx, ly, lz, id, tile, bx0, by0, bz0, bx1, by1, bz1, tile, false);
          }
          return true;
        }
        // quadro (2026-07-19): painel fino encostado na parede de trás (lado
        // oposto da frente), mesma rotação dos móveis
        if (isQuadro(id)) {
          const [rxa, rza, rxb, rzb] = rotXZ(0, 1 * P, 2 * P, 15 * P, id - BlockId.QuadroXP);
          emitBox(lx, ly, lz, id, TILE.quadro, rxa, 1 * P, rza, rxb, 15 * P, rzb);
          return true;
        }
        // flores (2026-07-20, refeitas): duas lâminas PLANAS na diagonal da
        // célula, a 90° uma da outra (X estilo Minecraft), tile de fundo
        // TRANSPARENTE (cutout). Cada lâmina aparece dos 2 lados (emitCrossPlane
        // emite o verso). Atravessável.
        if (isFlor(id)) {
          const tile = TILE.florVermelha + (id - BlockId.FlorVermelha);
          emitCrossPlane(lx, ly, lz, tile, 0, 0, 1, 1); // diagonal ↘
          emitCrossPlane(lx, ly, lz, tile, 0, 1, 1, 0); // anti-diagonal ↗
          return true;
        }
        // grama alta (§🌬️ 2026-07-27): mesma cruz da flor, tile por clima
        if (isGramaAlta(id)) {
          const tile = TILE.gramaAlta + (id - BlockId.GramaAlta);
          emitCrossPlane(lx, ly, lz, tile, 0, 0, 1, 1);
          emitCrossPlane(lx, ly, lz, tile, 0, 1, 1, 0);
          return true;
        }
        // plantação (§🍖 F6 2026-08-04): mesma cruz, tile por ESTÁGIO — é a
        // altura desenhada no tile que conta a idade da planta pro aluno, sem
        // forma nova no mesher nem mensagem extra na rede.
        // §🍖 F10c: o tile vem da TABELA, e não de `plantacao0 + estagio` —
        // com duas plantas a aritmética de âncora daria o tile do trigo pro
        // algodão. §🍖 F10h: o pé SELVAGEM de cada cultura entra pela mesma
        // porta (`isSelvagem` abraça os seis novos, no molde do algodão).
        if (isPlantacao(id) || isSelvagem(id) || isMuda(id)) {
          const tile = blockIconTile(id);
          emitCrossPlane(lx, ly, lz, tile, 0, 0, 1, 1);
          emitCrossPlane(lx, ly, lz, tile, 0, 1, 1, 0);
          return true;
        }
        // móveis direcionais (2026-07-19): forma definida DE FRENTE PRA +x,
        // girada k×90° pro sufixo do id (XP=0, ZP=1, XN=2, ZN=3)
        // cama (2026-07-20): 2 células horizontais. Cabeceira (com travesseiro)
        // ou pé, decidido pelo vizinho no eixo. Forma DE FRENTE PRA +x, girada k.
        if (isCama(id)) {
          const k = id - BlockId.CamaXP;
          const { dx, dz } = camaHeadDir(id);
          // é o PÉ se a cabeceira (mesma cama) está no vizinho da direção dela
          const ehPe = bloco(lx + dx, ly, lz + dz) === id;
          const boxes: readonly (readonly [number, number, number, number, number, number, number])[] =
            ehPe
              ? [
                  // pé: estrado + colchão, sem travesseiro
                  [TILE.planks, 0, 0, 0, 1, 3 * P, 1],
                  [TILE.colchao, 0, 3 * P, 1 * P, 1, 7 * P, 15 * P],
                ]
              : [
                  // cabeceira: estrado + colchão + travesseiro no fundo (−x)
                  [TILE.planks, 0, 0, 0, 1, 3 * P, 1],
                  [TILE.colchao, 0, 3 * P, 1 * P, 1, 7 * P, 15 * P],
                  [TILE.woolWhite, 1 * P, 7 * P, 3 * P, 6 * P, 9 * P, 13 * P],
                ];
          for (const [tile, xa, ya, za, xb, yb, zb] of boxes) {
            const [rxa, rza, rxb, rzb] = rotXZ(xa, za, xb, zb, k);
            emitBox(lx, ly, lz, id, tile, rxa, ya, rza, rxb, yb, rzb);
          }
          return true;
        }
        // móveis direcionais (2026-07-19): forma definida DE FRENTE PRA +x,
        // girada k×90° pro sufixo do id (XP=0, ZP=1, XN=2, ZN=3)
        if (isCadeira(id) || isSofa(id)) {
          const k = isCadeira(id) ? id - BlockId.CadeiraXP : id - BlockId.SofaXP;
          const boxes: readonly (readonly [number, number, number, number, number, number, number])[] =
            isCadeira(id)
              ? [
                  // assento, 4 pernas, encosto no lado −x (costas)
                  [TILE.planks, 3 * P, 6 * P, 3 * P, 13 * P, 8 * P, 13 * P],
                  [TILE.planks, 3 * P, 0, 3 * P, 5 * P, 6 * P, 5 * P],
                  [TILE.planks, 11 * P, 0, 3 * P, 13 * P, 6 * P, 5 * P],
                  [TILE.planks, 3 * P, 0, 11 * P, 5 * P, 6 * P, 13 * P],
                  [TILE.planks, 11 * P, 0, 11 * P, 13 * P, 6 * P, 13 * P],
                  [TILE.planks, 3 * P, 8 * P, 3 * P, 5 * P, 1, 13 * P],
                ]
              : [
                  // assento cheio, encosto no −x, braços nas laterais z
                  [TILE.estofado, 0, 0, 0, 1, 8 * P, 1],
                  [TILE.estofado, 0, 8 * P, 0, 4 * P, 15 * P, 1],
                  [TILE.estofado, 4 * P, 8 * P, 0, 1, 12 * P, 2 * P],
                  [TILE.estofado, 4 * P, 8 * P, 14 * P, 1, 12 * P, 1],
                ];
          for (const [tile, xa, ya, za, xb, yb, zb] of boxes) {
            const [rxa, rza, rxb, rzb] = rotXZ(xa, za, xb, zb, k);
            emitBox(lx, ly, lz, id, tile, rxa, ya, rza, rxb, yb, rzb);
          }
          return true;
        }
        // tapete: lâmina de 1/16 cobrindo o chão da célula, tile da própria lã
        if (isTapete(id)) {
          emitBox(lx, ly, lz, id, TAPETE_TILES[id - BlockId.TapeteBranco]!, 0, 0, 0, 1, P, 1);
          return true;
        }
        return false;
      }
    }
  };

  /** Altura (0..1) do canto `(cx,cz)` da superfície de água da célula (x,y,z).
   *
   *  PROCEDURAL, sem modelo por combinação de vizinho: o canto é a média dos
   *  níveis das **4 células que o compartilham** (a própria + 2 laterais + a
   *  diagonal). A célula vizinha calcula o MESMO canto a partir do MESMO
   *  conjunto de 4 → chega no mesmo número → as pontas encaixam exatas, sem
   *  costura e sem 8⁴ variantes. Água EM CIMA de qualquer uma delas = coluna
   *  cheia (o canto sobe ao teto, como o Minecraft faz na superfície). */
  const alturaCantoAgua = (x: number, y: number, z: number, cx: number, cz: number): number => {
    let soma = 0;
    let n = 0;
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const vx = x + cx - 1 + i;
        const vz = z + cz - 1 + j;
        const b = bloco(vx, y, vz);
        if (!isAgua(b)) continue;
        if (isAgua(bloco(vx, y + 1, vz))) return 1;
        soma += aguaNivel(b);
        n++;
      }
    }
    return n === 0 ? AGUA_TOPO : (soma / n / 8) * AGUA_TOPO;
  };

  /**
   * Tile de uma célula de ÁGUA (2026-07-27, playtest do §🌬️).
   *
   * A regra que o usuário pediu: **quem corre dita a própria direção.** Água que
   * escorre tem correnteza, e a correnteza — não o vento — manda na textura.
   *
   * O fluxo sai do GRADIENTE DE NÍVEL na vizinhança: cada vizinho horizontal com
   * nível MENOR puxa a água pra lá, com peso na diferença. Só água conta como
   * vizinho (ar NÃO): o `waterRule` já espalhou o que dava, e contar ar faria a
   * borda de todo lago "escorrer pra fora".
   *
   * Isso resolve lago/mar e riacho com UMA regra, sem flag nova: mar é tudo
   * FONTE (nível 8), gradiente zero → água parada → segue o vento. Riacho é
   * 8→7→6→… → gradiente aponta pra jusante → segue o fluxo. A fonte no topo de
   * uma queda tem vizinho mais baixo, então ela corre também, como deve.
   *
   * Continua função pura da vizinhança (lê ±1 no plano), então `meshVizinhanca`
   * segue idêntico a `meshChunk` e o Worker não precisa de nada novo.
   */
  const fluxoDaAgua = (lx: number, ly: number, lz: number, id: number): [number, number] => {
    const meu = aguaNivel(id);
    let fx = 0;
    let fz = 0;
    for (const [dx, dz] of VIZINHOS_XZ) {
      const nb = bloco(lx + dx, ly, lz + dz);
      if (!isAgua(nb)) continue;
      const d = meu - aguaNivel(nb);
      if (d <= 0) continue;
      fx += dx * d;
      fz += dz * d;
    }
    return [fx, fz]; // (0,0) = parada: quem manda é o vento
  };

  for (let ly = 0; ly < CHUNK_SIZE; ly++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      for (let lx = 0; lx < CHUNK_SIZE; lx++) {
        const id = bloco(lx, ly, lz);
        if (id === BlockId.Air) continue;
        swayAtual = swayDoBloco(id); // §🌬️ vale pra TODA emissão deste bloco
        // cp23: não-cubo tem forma própria e nunca passa pelo caminho de cubo
        if (!isFullCube(id)) {
          emitShape(id, lx, ly, lz);
          continue;
        }
        const tiles = BLOCK_TILES[id];
        if (!tiles) continue;
        // água e vidro colorido → grupos transparentes separados; resto → opaco
        const idxTarget = isAgua(id)
          ? waterIndices
          : isVidroColorido(id)
            ? vidroIndices
            : indices;
        // Água: os 4 cantos do TETO da célula viram alturas por vértice (topo
        // inclinado que casa com o vizinho). Ordem [cx][cz]. Só o topo muda —
        // o chão da célula continua em y=0. Colisão/mira NÃO usam isto: água
        // não é sólida e o raycast a ignora (blocks.ts / raycast.ts).
        const cantos = isAgua(id)
          ? [
              [alturaCantoAgua(lx, ly, lz, 0, 0), alturaCantoAgua(lx, ly, lz, 0, 1)],
              [alturaCantoAgua(lx, ly, lz, 1, 0), alturaCantoAgua(lx, ly, lz, 1, 1)],
            ]
          : null;
        // §🌬️ (2026-07-27): a correnteza sai do gradiente de nível, UMA vez por
        // célula — mas o TILE é escolhido por FACE (tileAguaDaFace), porque cada
        // face amarra os 2 eixos do tile a direções de mundo diferentes.
        const fluxo = cantos ? fluxoDaAgua(lx, ly, lz, id) : null;
        // caindo = sem chão embaixo: as laterais leem como cachoeira (onda desce)
        const caindo = fluxo !== null && bloco(lx, ly - 1, lz) === BlockId.Air;
        // §🍖 F10 (refino): a face que leva o tile da BOCA. `null` no bloco sem
        // frente, que é a esmagadora maioria — a pergunta se faz UMA vez por
        // célula, não uma por face.
        const frente = tiles.frente === undefined ? null : frenteDoBloco(id);

        for (let fi = 0; fi < FACES.length; fi++) {
          const face = FACES[fi]!;
          const neighbor = bloco(lx + face.dir[0], ly + face.dir[1], lz + face.dir[2]);
          // cp18: face aparece se o vizinho é ar OU transparente de OUTRO tipo
          // (vidro encostado em folha: cada um mostra a sua face — a face oposta
          // do outro é backface e some por culling, sem z-fight). Vizinho opaco
          // esconde; MESMO transparente encostado funde (vidro contínuo).
          // cp23: não-cubo (cerca/porta/tocha) NUNCA oclui o vizinho.
          if (neighbor !== BlockId.Air) {
            if (!isFullCube(neighbor)) {
              // vizinho é forma: minha face aparece
            } else if (isAgua(id) && isAgua(neighbor)) {
              continue; // água funde com água (fonte/fluida, QUALQUER nível)
            } else if (!isTransparentBlock(neighbor) || neighbor === id) {
              continue;
            }
          }

          const tile = fluxo
            ? tileAguaDaFace(fi, fluxo[0], fluxo[1], caindo)
            : face.dir[1] === 1
              ? tiles.top
              : face.dir[1] === -1
                ? tiles.bottom
                : frente && face.dir[0] === frente[0] && face.dir[2] === frente[1]
                  ? (tiles.frente ?? tiles.side)
                  : tiles.side;
          const col = tile % n;
          const row = (tile / n) | 0;
          const u0 = col / n + inset;
          const u1 = (col + 1) / n - inset;
          const v0 = 1 - (row + 1) / n + inset;
          const v1 = 1 - row / n - inset;

          const base = positions.length / 3;
          for (const corner of face.corners) {
            // topo da água: y=1 vira a altura do canto (mesma conta nos 2 lados
            // da fronteira → superfície contínua). Vale pro quad de topo E pro
            // topo das faces laterais (viram trapézios).
            const cy =
              cantos && corner.pos[1] === 1
                ? (cantos[corner.pos[0]]?.[corner.pos[2]] ?? 1)
                : corner.pos[1];
            positions.push(lx + corner.pos[0], ly + cy, lz + corner.pos[2]);
            normals.push(face.dir[0], face.dir[1], face.dir[2]);
            uvs.push(corner.uv[0] === 1 ? u1 : u0, corner.uv[1] === 1 ? v1 : v0);
          }
          pushSway(4); // §🌬️ cubo balança inteiro (folhas) ou nada (o resto)
          // §💡 cubo cheio: a face mostra a luz do que ela ENCARA (a própria
          // célula é opaca e está em 0).
          pushLuz(4, luzDe(lx + face.dir[0], ly + face.dir[1], lz + face.dir[2]));
          idxTarget.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
        }
      }
    }
  }

  // opaco, água, vidro — o cliente fatia em 3 grupos pelos dois contadores
  const allIndices =
    waterIndices.length || vidroIndices.length
      ? indices.concat(waterIndices, vidroIndices)
      : indices;
  return {
    sway: new Uint8Array(sway.map((v) => Math.round(v * 255))),
    luz: new Uint8Array(luzVert),
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint32Array(allIndices),
    opaqueIndexCount: indices.length,
    aguaIndexCount: waterIndices.length,
  };
}
