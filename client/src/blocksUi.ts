import { BlockId, GLYPH, ITEM_BALDE_AGUA, isProfessorOnly } from "@logica/shared";

/**
 * Blocos colocáveis com nome em português — fonte única pra hotbar (main.ts)
 * e pros selects do painel de autoria (/regiao encher). A ORDEM segue os ids:
 * o texto de uso do /bloco aponta pra hotbar.
 *
 * `cat` (2026-07-20): categoria da ABA do inventário — com 100+ blocos a
 * grade única ficou longa (pedido do playtest). Só afeta a exibição do
 * painel; a ordem/scroll da hotbar não muda.
 */

export type Categoria =
  | "blocos"
  | "vegetacao"
  | "mobilia"
  | "minerios"
  | "ferramentas"
  | "glifos";

/** Abas do inventário, na ordem de exibição. */
export const CATEGORIAS: readonly { id: Categoria; label: string }[] = [
  { id: "blocos", label: "blocos" },
  { id: "vegetacao", label: "vegetação" },
  { id: "mobilia", label: "mobília" },
  { id: "minerios", label: "minérios" },
  { id: "ferramentas", label: "ferramentas" },
  { id: "glifos", label: "letras e números" },
];

export interface PlaceableEntry {
  readonly id: number;
  readonly name: string;
  readonly cat: Categoria;
}

// cp20: blocos-glifo derivam de GLYPH (mesmo layout do atlas/mesher).
const GLYPH_BLOCKS: PlaceableEntry[] = [
  ...Array.from(GLYPH.letters, (ch, i) => ({
    id: BlockId.LetterA + i,
    name: `letra ${ch}`,
    cat: "glifos" as const,
  })),
  ...Array.from(GLYPH.digits, (ch, i) => ({
    id: BlockId.Digit0 + i,
    name: `número ${ch}`,
    cat: "glifos" as const,
  })),
];

export const PLACEABLE: readonly PlaceableEntry[] = [
  { id: BlockId.Grass, name: "grama", cat: "blocos" },
  { id: BlockId.Stone, name: "pedra", cat: "blocos" },
  { id: BlockId.Cobblestone, name: "pedregulho", cat: "blocos" },
  { id: BlockId.Sand, name: "areia", cat: "blocos" },
  { id: BlockId.Dirt, name: "terra", cat: "blocos" },
  { id: BlockId.Log, name: "tronco", cat: "vegetacao" },
  { id: BlockId.Planks, name: "tábuas", cat: "blocos" },
  { id: BlockId.Brick, name: "tijolo", cat: "blocos" },
  { id: BlockId.Gravel, name: "cascalho", cat: "blocos" },
  { id: BlockId.Bedrock, name: "rocha-matriz", cat: "blocos" },
  { id: BlockId.WoolWhite, name: "lã branca", cat: "blocos" },
  { id: BlockId.WoolBlack, name: "lã preta", cat: "blocos" },
  { id: BlockId.WoolRed, name: "lã vermelha", cat: "blocos" },
  { id: BlockId.WoolOrange, name: "lã laranja", cat: "blocos" },
  { id: BlockId.WoolYellow, name: "lã amarela", cat: "blocos" },
  { id: BlockId.WoolGreen, name: "lã verde", cat: "blocos" },
  { id: BlockId.WoolBlue, name: "lã azul", cat: "blocos" },
  { id: BlockId.WoolPurple, name: "lã roxa", cat: "blocos" },
  { id: BlockId.Sandstone, name: "arenito", cat: "blocos" },
  { id: BlockId.StoneBricks, name: "pedra-lavrada", cat: "blocos" },
  { id: BlockId.Snow, name: "neve", cat: "blocos" },
  { id: BlockId.Obsidian, name: "obsidiana", cat: "blocos" },
  { id: BlockId.WoolPink, name: "lã rosa", cat: "blocos" },
  { id: BlockId.WoolCyan, name: "lã ciano", cat: "blocos" },
  { id: BlockId.WoolGray, name: "lã cinza", cat: "blocos" },
  { id: BlockId.WoolBrown, name: "lã marrom", cat: "blocos" },
  { id: BlockId.Glass, name: "vidro", cat: "blocos" },
  { id: BlockId.Leaves, name: "folhas", cat: "vegetacao" },
  ...GLYPH_BLOCKS,
  // cp23 — não-cubos. A porta tem UMA entrada: na hora de colocar, o cliente
  // escolhe o eixo (X ou Z) pela direção do olhar; aberta só existe no mundo.
  { id: BlockId.Cerca, name: "cerca", cat: "mobilia" },
  { id: BlockId.PortaXFechada, name: "porta", cat: "mobilia" },
  { id: BlockId.Tocha, name: "tocha", cat: "mobilia" },
  // janela: entrada única, eixo escolhido pelo olhar (igual porta)
  { id: BlockId.JanelaXFechada, name: "janela", cat: "mobilia" },
  // móveis (2026-07-19): entrada única; direção escolhida pelo olhar no place
  { id: BlockId.Mesa, name: "mesa", cat: "mobilia" },
  { id: BlockId.CadeiraXP, name: "cadeira", cat: "mobilia" },
  { id: BlockId.SofaXP, name: "sofá", cat: "mobilia" },
  { id: BlockId.CamaXP, name: "cama", cat: "mobilia" },
  { id: BlockId.QuadroXP, name: "quadro", cat: "mobilia" },
  // Tapetes (2026-07-19): ordem = TapeteBranco..TapeteMarrom (âncora + offset)
  ...["branco", "preto", "vermelho", "laranja", "amarelo", "verde", "azul", "roxo",
      "rosa", "ciano", "cinza", "marrom"].map((cor, i) => ({
    id: BlockId.TapeteBranco + i,
    name: `tapete ${cor}`,
    cat: "mobilia" as const,
  })),
  // Flores (2026-07-20): plantinhas decorativas, atravessáveis, precisam de apoio
  ...["vermelha", "amarela", "azul", "branca"].map((cor, i) => ({
    id: BlockId.FlorVermelha + i,
    name: `flor ${cor}`,
    cat: "vegetacao" as const,
  })),
  // Minérios (2026-07-20): porta de entrada do survival — por ora só blocos
  { id: BlockId.MinerioCarvao, name: "minério de carvão", cat: "minerios" },
  { id: BlockId.MinerioFerro, name: "minério de ferro", cat: "minerios" },
  { id: BlockId.MinerioOuro, name: "minério de ouro", cat: "minerios" },
  { id: BlockId.MinerioDiamante, name: "minério de diamante", cat: "minerios" },
  // Gramas climáticas (2026-07-20): o gen escolhe pelo clima; colocáveis também
  { id: BlockId.GramaSeca, name: "grama seca", cat: "blocos" },
  { id: BlockId.GramaFria, name: "grama fria", cat: "blocos" },
  // Árvores brasileiras (2026-07-20): ipê/araucária/pau-brasil + mandacaru
  { id: BlockId.LogIpe, name: "tronco de ipê", cat: "vegetacao" },
  { id: BlockId.FolhasIpe, name: "folhas de ipê", cat: "vegetacao" },
  { id: BlockId.LogAraucaria, name: "tronco de araucária", cat: "vegetacao" },
  { id: BlockId.FolhasAraucaria, name: "folhas de araucária", cat: "vegetacao" },
  { id: BlockId.LogPauBrasil, name: "tronco de pau-brasil", cat: "vegetacao" },
  { id: BlockId.FolhasPauBrasil, name: "folhas de pau-brasil", cat: "vegetacao" },
  { id: BlockId.Mandacaru, name: "mandacaru", cat: "vegetacao" },
  // Vidro colorido (2026-07-25): 12 cores (mesma paleta das lãs). Cubo cheio
  // transparente tingido. Ordem = VidroBranco + offset.
  ...["branco", "preto", "vermelho", "laranja", "amarelo", "verde", "azul", "roxo",
      "rosa", "ciano", "cinza", "marrom"].map((cor, i) => ({
    id: BlockId.VidroBranco + i,
    name: `vidro ${cor}`,
    cat: "blocos" as const,
  })),
  // Lajes / meio-blocos (2026-07-25): UMA entrada por material (a metade
  // baixo/cima é escolhida pela face clicada no place). O id na hotbar é a
  // âncora "baixo"; o cliente troca pra "cima" (âncora+1) ao mirar por baixo.
  { id: BlockId.LajePedraBaixo, name: "laje de pedra", cat: "blocos" },
  { id: BlockId.LajeTabuaBaixo, name: "laje de tábuas", cat: "blocos" },
  { id: BlockId.LajeTijoloBaixo, name: "laje de tijolo", cat: "blocos" },
  // Escadas (2026-07-25): UMA entrada por material; a direção sai do olhar e a
  // metade (base/cabeça-pra-baixo) da face clicada. Âncora = ...XP.
  { id: BlockId.EscadaPedraXP, name: "escada de pedra", cat: "blocos" },
  { id: BlockId.EscadaTabuaXP, name: "escada de tábuas", cat: "blocos" },
  { id: BlockId.EscadaTijoloXP, name: "escada de tijolo", cat: "blocos" },
  // Balde de água (2026-07-22): ITEM (não-bloco). Clique direito DESPEJA fonte;
  // esvazia na mão → clique direito numa fonte RECOLHE. A água só entra no
  // mundo por aqui (o id de bloco saiu da hotbar). Ver ITEM_BALDE_* em blocks.ts.
  { id: ITEM_BALDE_AGUA, name: "balde de água", cat: "ferramentas" },
];

/** Colocáveis visíveis PARA ESTE PAPEL: o aluno não vê rocha-matriz (autoria
 *  do professor). Usado pelo inventário e pela hotbar; o servidor recusa o
 *  place de qualquer jeito. */
export function placeableFor(papel: "professor" | "aluno"): readonly PlaceableEntry[] {
  if (papel === "professor") return PLACEABLE;
  return PLACEABLE.filter((b) => !isProfessorOnly(b.id));
}
