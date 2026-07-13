import { BlockId } from "@logica/shared";

/**
 * Blocos colocáveis com nome em português — fonte única pra hotbar (main.ts)
 * e pros selects do painel de autoria (/regiao encher). A ORDEM segue os ids:
 * o texto de uso do /bloco aponta pra hotbar.
 */
export const PLACEABLE = [
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
] as const;
