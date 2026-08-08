import { describe, expect, it } from "vitest";
import {
  BlockId,
  CHUNK_SIZE,
  CHUNK_VOLUME,
  FORNALHA_POR_FRENTE,
  MAX_BLOCK_ID,
  aguaComNivel,
  aguaNivel,
  collisionBoxes,
  escadaId,
  formaCanonica,
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
    // grama alta (§🌬️ 2026-07-27): append 179-181, colocável
    expect(BlockId.GramaAlta).toBe(179);
    expect(BlockId.GramaAltaFria).toBe(181);
    expect(isPlaceable(BlockId.GramaAlta)).toBe(true);
    expect(isPlaceable(BlockId.GramaAltaFria)).toBe(true);
    // plantação (§🍖 F6 2026-08-04): append 182-185. Só a MUDA se coloca — os
    // estágios crescidos nascem do tick, e aceitá-los pelo fio daria trigo
    // maduro de graça a quem forjasse a mensagem.
    expect(BlockId.Plantacao0).toBe(182);
    expect(BlockId.Plantacao3).toBe(185);
    expect(isPlaceable(BlockId.Plantacao0)).toBe(true);
    expect(isPlaceable(BlockId.Plantacao1)).toBe(false);
    expect(isPlaceable(BlockId.Plantacao3)).toBe(false);
    // fornalha (§🍖 F10b 2026-08-05): append 186-187. Só a APAGADA se coloca —
    // a acesa é estado que o tick liga, e aceitá-la pelo fio daria luminária
    // eterna de graça a quem forjasse a mensagem (a mesma regra da porta).
    expect(BlockId.Fornalha).toBe(186);
    expect(BlockId.FornalhaAcesa).toBe(187);
    expect(isPlaceable(BlockId.Fornalha)).toBe(true);
    expect(isPlaceable(BlockId.FornalhaAcesa)).toBe(false);
    // §🍖 F10 (refino 2026-08-05): as outras 3 direções entraram em 194-199, e
    // NÃO no lugar destes dois — 186/187 já estão gravados em mundo salvo, e
    // renumerar trocaria a fornalha de quem já jogou por outro bloco. Os dois
    // originais viraram a direção −Z.
    expect(BlockId.FornalhaXP).toBe(194);
    expect(BlockId.FornalhaAcesaXN).toBe(199);
    expect(FORNALHA_POR_FRENTE[3]).toEqual({
      apagada: BlockId.Fornalha,
      acesa: BlockId.FornalhaAcesa,
    });
    for (const { apagada, acesa } of FORNALHA_POR_FRENTE) {
      expect(isPlaceable(apagada)).toBe(true);
      expect(isPlaceable(acesa)).toBe(false); // acesa é ESTADO, nunca item
      expect(formaCanonica(apagada)).toBe(BlockId.Fornalha);
      expect(formaCanonica(acesa)).toBe(BlockId.Fornalha);
    }
    // baú (§🍖 F10e 2026-08-05): append 188, e UM id só — ao contrário da
    // fornalha, não há estado nenhum pra guardar no byte.
    expect(BlockId.Bau).toBe(188);
    expect(isPlaceable(BlockId.Bau)).toBe(true);
    // algodão (§🍖 F10c 2026-08-05): append 189-193. Mesma regra da plantação
    // do F6 — só a MUDA se coloca; os estágios crescidos nascem do tick.
    expect(BlockId.Algodao0).toBe(189);
    expect(BlockId.AlgodaoSelvagem).toBe(193);
    expect(isPlaceable(BlockId.Algodao0)).toBe(true);
    expect(isPlaceable(BlockId.Algodao1)).toBe(false);
    expect(isPlaceable(BlockId.Algodao3)).toBe(false);
    expect(isPlaceable(BlockId.AlgodaoSelvagem)).toBe(true);
    // §🍖 F10h (2026-08-06): as seis culturas — 4 estágios + 1 pé selvagem
    // cada, append 200-229, no MOLDE exato do algodão. Só a MUDA se coloca e
    // só o pé selvagem também (ambos são o que o gen/aluno põe no mundo).
    expect(BlockId.Cenoura0).toBe(200);
    expect(BlockId.CenouraSelvagem).toBe(204);
    expect(BlockId.Batata0).toBe(205);
    expect(BlockId.BatataSelvagem).toBe(209);
    expect(BlockId.Beterraba0).toBe(210);
    expect(BlockId.BeterrabaSelvagem).toBe(214);
    expect(BlockId.Melancia0).toBe(215);
    expect(BlockId.MelanciaSelvagem).toBe(219);
    expect(BlockId.Banana0).toBe(220);
    expect(BlockId.BananaSelvagem).toBe(224);
    expect(BlockId.Aipim0).toBe(225);
    expect(BlockId.AipimSelvagem).toBe(229);
    const culturas: readonly (readonly [number, number])[] = [
      [BlockId.Cenoura0, BlockId.CenouraSelvagem],
      [BlockId.Batata0, BlockId.BatataSelvagem],
      [BlockId.Beterraba0, BlockId.BeterrabaSelvagem],
      [BlockId.Melancia0, BlockId.MelanciaSelvagem],
      [BlockId.Banana0, BlockId.BananaSelvagem],
      [BlockId.Aipim0, BlockId.AipimSelvagem],
    ];
    for (const [base, selvagem] of culturas) {
      expect(isPlaceable(base)).toBe(true);
      expect(isPlaceable(base + 1)).toBe(false);
      expect(isPlaceable(base + 3)).toBe(false);
      expect(isPlaceable(selvagem)).toBe(true);
    }
    expect(isPlaceable(MAX_BLOCK_ID + 1)).toBe(false); // próximo byte NÃO é bloco
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
