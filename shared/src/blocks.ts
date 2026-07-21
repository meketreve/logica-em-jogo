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
} as const;

export type BlockId = (typeof BlockId)[keyof typeof BlockId];

/** Maior ID válido (mantém isPlaceable sem número mágico ao crescer a lista). */
const MAX_BLOCK_ID = BlockId.Agua;

/** Água? Bloco de fluido estático — atravessável e translúcido. */
export function isAgua(id: number): boolean {
  return id === BlockId.Agua;
}

/** Flor decorativa (qualquer cor)? */
export function isFlor(id: number): boolean {
  return id >= BlockId.FlorVermelha && id <= BlockId.FlorBranca;
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

/** Precisa de cubo CHEIO embaixo pra ser colocado E pra continuar existindo
 *  (regra no tick). Tocha e tapetes. */
export function precisaApoio(id: number): boolean {
  return id === BlockId.Tocha || isTapete(id) || isFlor(id);
}

/** Bloco transparente (vidro/folhas): NÃO oculta a face do vizinho no mesher.
 *  Continua sólido pra física/raycast — transparência é só visual. */
export function isTransparentBlock(id: number): boolean {
  return (
    id === BlockId.Glass || id === BlockId.Leaves ||
    id === BlockId.FolhasIpe || id === BlockId.FolhasAraucaria ||
    id === BlockId.FolhasPauBrasil || id === BlockId.Agua
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
    !isFlor(id)
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
    !isAgua(id) // água atravessa — o jogador entra e nada (physics.ts)
  );
}

/** O jogador pode colocar este ID? (valida bytes do fio). Porta/janela ABERTA
 *  não se coloca na mão — só existe alternando uma fechada no clique direito. */
export function isPlaceable(id: number): boolean {
  if (isPortaAberta(id)) return false; // porta aberta (base OU R) só nasce alternando uma fechada
  if (isJanelaAberta(id)) return false; // idem janela aberta
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
