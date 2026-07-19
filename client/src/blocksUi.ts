import { BlockId, GLYPH, isProfessorOnly } from "@logica/shared";

/**
 * Blocos colocáveis com nome em português — fonte única pra hotbar (main.ts)
 * e pros selects do painel de autoria (/regiao encher). A ORDEM segue os ids:
 * o texto de uso do /bloco aponta pra hotbar.
 */

// cp20: blocos-glifo derivam de GLYPH (mesmo layout do atlas/mesher).
const GLYPH_BLOCKS: { id: number; name: string }[] = [
  ...Array.from(GLYPH.letters, (ch, i) => ({ id: BlockId.LetterA + i, name: `letra ${ch}` })),
  ...Array.from(GLYPH.digits, (ch, i) => ({ id: BlockId.Digit0 + i, name: `número ${ch}` })),
];

export const PLACEABLE: readonly { id: number; name: string }[] = [
  { id: BlockId.Grass, name: "grama" },
  { id: BlockId.Stone, name: "pedra" },
  { id: BlockId.Cobblestone, name: "pedregulho" },
  { id: BlockId.Sand, name: "areia" },
  { id: BlockId.Dirt, name: "terra" },
  { id: BlockId.Log, name: "tronco" },
  { id: BlockId.Planks, name: "tábuas" },
  { id: BlockId.Brick, name: "tijolo" },
  { id: BlockId.Gravel, name: "cascalho" },
  { id: BlockId.Bedrock, name: "rocha-matriz" },
  { id: BlockId.WoolWhite, name: "lã branca" },
  { id: BlockId.WoolBlack, name: "lã preta" },
  { id: BlockId.WoolRed, name: "lã vermelha" },
  { id: BlockId.WoolOrange, name: "lã laranja" },
  { id: BlockId.WoolYellow, name: "lã amarela" },
  { id: BlockId.WoolGreen, name: "lã verde" },
  { id: BlockId.WoolBlue, name: "lã azul" },
  { id: BlockId.WoolPurple, name: "lã roxa" },
  { id: BlockId.Sandstone, name: "arenito" },
  { id: BlockId.StoneBricks, name: "pedra-lavrada" },
  { id: BlockId.Snow, name: "neve" },
  { id: BlockId.Obsidian, name: "obsidiana" },
  { id: BlockId.WoolPink, name: "lã rosa" },
  { id: BlockId.WoolCyan, name: "lã ciano" },
  { id: BlockId.WoolGray, name: "lã cinza" },
  { id: BlockId.WoolBrown, name: "lã marrom" },
  { id: BlockId.Glass, name: "vidro" },
  { id: BlockId.Leaves, name: "folhas" },
  ...GLYPH_BLOCKS,
  // cp23 — não-cubos. A porta tem UMA entrada: na hora de colocar, o cliente
  // escolhe o eixo (X ou Z) pela direção do olhar; aberta só existe no mundo.
  { id: BlockId.Cerca, name: "cerca" },
  { id: BlockId.PortaXFechada, name: "porta" },
  { id: BlockId.Tocha, name: "tocha" },
  // janela: entrada única, eixo escolhido pelo olhar (igual porta)
  { id: BlockId.JanelaXFechada, name: "janela" },
  // móveis (2026-07-19): entrada única; direção escolhida pelo olhar no place
  { id: BlockId.Mesa, name: "mesa" },
  { id: BlockId.CadeiraXP, name: "cadeira" },
  { id: BlockId.SofaXP, name: "sofá" },
  { id: BlockId.CamaXP, name: "cama" },
  // Tapetes (2026-07-19): ordem = TapeteBranco..TapeteMarrom (âncora + offset)
  ...["branco", "preto", "vermelho", "laranja", "amarelo", "verde", "azul", "roxo",
      "rosa", "ciano", "cinza", "marrom"].map((cor, i) => ({
    id: BlockId.TapeteBranco + i,
    name: `tapete ${cor}`,
  })),
];

/** Colocáveis visíveis PARA ESTE PAPEL: o aluno não vê rocha-matriz (autoria
 *  do professor). Usado pelo inventário e pela hotbar; o servidor recusa o
 *  place de qualquer jeito. */
export function placeableFor(
  papel: "professor" | "aluno",
): readonly { id: number; name: string }[] {
  if (papel === "professor") return PLACEABLE;
  return PLACEABLE.filter((b) => !isProfessorOnly(b.id));
}
