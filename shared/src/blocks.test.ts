import { describe, expect, it } from "vitest";
import {
  BlockId,
  CHUNK_SIZE,
  CHUNK_VOLUME,
  aguaComNivel,
  aguaNivel,
  collisionBoxes,
  escadaId,
  isAgua,
  isAguaFonte,
  isFullCube,
  isPlaceable,
  isSlab,
  isSolidBlock,
  isStairs,
  isTransparentBlock,
  isVidroColorido,
  slabMaterial,
  slabTop,
  stairsFacing,
  stairsMaterial,
  stairsTop,
} from "./index";

describe("formato de bloco/chunk (contrato de save e snapshot)", () => {
  it("IDs de bloco batem com o formato binário", () => {
    expect(BlockId.Air).toBe(0);
    expect(BlockId.Grass).toBe(1);
    expect(BlockId.Stone).toBe(2);
    expect(BlockId.Cobblestone).toBe(3);
    expect(BlockId.Sand).toBe(4);
  });

  it("blocos-glifo cp20: append A–Z, 0–9 (nunca renumerar ids antigos)", () => {
    expect(BlockId.LetterA).toBe(29);
    expect(BlockId.LetterZ).toBe(54);
    expect(BlockId.Digit0).toBe(55);
    expect(BlockId.Digit9).toBe(64);
    // cp23: não-cubos em append depois dos glifos
    expect(BlockId.Cerca).toBe(65);
    expect(BlockId.Tocha).toBe(70);
    // tapetes (2026-07-19): 12 cores em append depois da tocha
    expect(BlockId.TapeteBranco).toBe(71);
    expect(BlockId.TapeteMarrom).toBe(82);
    // janela (2026-07-19): 4 estados em append depois dos tapetes
    expect(BlockId.JanelaXFechada).toBe(83);
    expect(BlockId.JanelaZAberta).toBe(86);
    // móveis (2026-07-19): mesa + 4 direções de cadeira/sofá/cama + quadro
    expect(BlockId.Mesa).toBe(87);
    expect(BlockId.CamaZN).toBe(99);
    expect(BlockId.QuadroXP).toBe(100);
    expect(BlockId.QuadroZN).toBe(103);
    // flores (2026-07-20): 4 cores em append depois do quadro
    expect(BlockId.FlorVermelha).toBe(104);
    expect(BlockId.FlorBranca).toBe(107);
    // portas R (2026-07-20): dobradiça alta, append depois das flores (108-111)
    expect(BlockId.PortaXFechadaR).toBe(108);
    expect(BlockId.PortaZAbertaR).toBe(111);
    // janelas R (2026-07-20): dobradiça alta, append depois das portas R (112-115)
    expect(BlockId.JanelaXFechadaR).toBe(112);
    expect(BlockId.JanelaZAbertaR).toBe(115);
    // isPlaceable acompanha o último id; o próximo byte NÃO é bloco
    expect(isPlaceable(BlockId.JanelaXFechada)).toBe(true);
    expect(isPlaceable(BlockId.JanelaXAberta)).toBe(false); // aberta só via clique
    expect(isPlaceable(BlockId.FlorBranca)).toBe(true);
    expect(isPlaceable(BlockId.PortaXFechadaR)).toBe(true); // R fechada = colocável
    expect(isPlaceable(BlockId.PortaZAbertaR)).toBe(false); // R aberta só via clique
    expect(isPlaceable(BlockId.JanelaXFechadaR)).toBe(true);
    expect(isPlaceable(BlockId.JanelaZAbertaR)).toBe(false); // R aberta só via clique
    // minérios + gramas climáticas + árvores brasileiras + mandacaru (2026-07-20)
    expect(BlockId.MinerioCarvao).toBe(116);
    expect(BlockId.GramaSeca).toBe(120);
    expect(BlockId.LogIpe).toBe(122);
    expect(BlockId.Mandacaru).toBe(128);
    // água (2026-07-21): fonte 129; fluida 130-136 em append (2026-07-22)
    expect(BlockId.Agua).toBe(129);
    expect(BlockId.AguaFluida7).toBe(136);
    expect(isPlaceable(BlockId.MinerioDiamante)).toBe(true);
    expect(isPlaceable(BlockId.Mandacaru)).toBe(true);
    // água NÃO é colocável por place_block cru — só o balde/fluxo cria
    expect(isPlaceable(BlockId.Agua)).toBe(false);
    expect(isPlaceable(BlockId.AguaFluida7)).toBe(false);
    // vidro colorido + laje + escada (2026-07-25): append 137-178, colocáveis
    expect(BlockId.VidroBranco).toBe(137);
    expect(BlockId.LajePedraBaixo).toBe(149);
    expect(BlockId.EscadaPedraXP).toBe(155);
    expect(BlockId.EscadaTijoloZNC).toBe(178);
    expect(isPlaceable(BlockId.VidroBranco)).toBe(true);
    expect(isPlaceable(BlockId.LajeTijoloCima)).toBe(true);
    expect(isPlaceable(BlockId.EscadaTijoloZNC)).toBe(true);
    expect(isPlaceable(179)).toBe(false); // próximo byte NÃO é bloco
  });

  it("água: fonte + fluida atravessável (não-sólida) e translúcida no mesher", () => {
    for (const id of [BlockId.Agua, BlockId.AguaFluida1, BlockId.AguaFluida7]) {
      expect(isAgua(id)).toBe(true);
      expect(isSolidBlock(id)).toBe(false); // o jogador entra e nada
      expect(isTransparentBlock(id)).toBe(true); // funde com água vizinha
    }
  });

  it("água: nível ↔ id (fonte=8, fluida 7..1, 0=ar)", () => {
    expect(aguaNivel(BlockId.Agua)).toBe(8);
    expect(aguaNivel(BlockId.AguaFluida7)).toBe(7);
    expect(aguaNivel(BlockId.AguaFluida1)).toBe(1);
    expect(aguaNivel(BlockId.Air)).toBe(0);
    expect(aguaNivel(BlockId.Stone)).toBe(0);
    expect(aguaComNivel(8)).toBe(BlockId.Agua);
    expect(aguaComNivel(9)).toBe(BlockId.Agua); // clampa em fonte
    expect(aguaComNivel(7)).toBe(BlockId.AguaFluida7);
    expect(aguaComNivel(1)).toBe(BlockId.AguaFluida1);
    expect(aguaComNivel(0)).toBe(BlockId.Air); // secou
    expect(isAguaFonte(BlockId.Agua)).toBe(true);
    expect(isAguaFonte(BlockId.AguaFluida7)).toBe(false);
  });

  it("vidro colorido (2026-07-25): cubo cheio transparente, colocável", () => {
    for (const id of [BlockId.VidroBranco, BlockId.VidroAzul, BlockId.VidroMarrom]) {
      expect(isVidroColorido(id)).toBe(true);
      expect(isTransparentBlock(id)).toBe(true); // funde com vidro do mesmo id
      expect(isFullCube(id)).toBe(true); // ocupa a célula inteira (colisão de cubo)
      expect(isSolidBlock(id)).toBe(true);
    }
    expect(isVidroColorido(BlockId.Glass)).toBe(false); // vidro comum não é "colorido"
  });

  it("laje: meia altura, NÃO-cubo, colisão da metade certa", () => {
    expect(isSlab(BlockId.LajePedraBaixo)).toBe(true);
    expect(isFullCube(BlockId.LajePedraBaixo)).toBe(false);
    expect(isSolidBlock(BlockId.LajePedraBaixo)).toBe(true);
    expect(slabTop(BlockId.LajePedraBaixo)).toBe(false);
    expect(slabTop(BlockId.LajePedraCima)).toBe(true);
    expect(slabMaterial(BlockId.LajeTijoloBaixo)).toBe(2);
    // baixo = piso (0..0.5); cima = teto (0.5..1)
    expect(collisionBoxes(BlockId.LajePedraBaixo)).toEqual([[0, 0, 0, 1, 0.5, 1]]);
    expect(collisionBoxes(BlockId.LajePedraCima)).toEqual([[0, 0.5, 0, 1, 1, 1]]);
  });

  it("escada: L de base + degrau, direção/metade no id", () => {
    expect(isStairs(BlockId.EscadaPedraXP)).toBe(true);
    expect(isFullCube(BlockId.EscadaPedraXP)).toBe(false);
    expect(stairsFacing(BlockId.EscadaPedraXP)).toBe(0); // +x
    expect(stairsFacing(BlockId.EscadaPedraZN)).toBe(3); // -z
    expect(stairsTop(BlockId.EscadaPedraXP)).toBe(false);
    expect(stairsTop(BlockId.EscadaPedraXPC)).toBe(true); // variante de cima
    expect(stairsMaterial(BlockId.EscadaTijoloXP)).toBe(2);
    expect(escadaId(2, 3, true)).toBe(BlockId.EscadaTijoloZNC); // round-trip
    // base de baixo (0..0.5, pegada cheia) + degrau na metade +x (0.5..1)
    const boxes = collisionBoxes(BlockId.EscadaPedraXP);
    expect(boxes[0]).toEqual([0, 0, 0, 1, 0.5, 1]);
    expect(boxes[1]).toEqual([0.5, 0.5, 0, 1, 1, 1]);
  });

  it("volume do chunk cabe em 1 byte por bloco", () => {
    expect(CHUNK_VOLUME).toBe(CHUNK_SIZE ** 3);
    expect(CHUNK_VOLUME).toBe(4096);
  });
});
