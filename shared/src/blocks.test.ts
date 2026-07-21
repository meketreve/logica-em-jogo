import { describe, expect, it } from "vitest";
import { BlockId, CHUNK_SIZE, CHUNK_VOLUME, isPlaceable } from "./index";

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
    expect(isPlaceable(BlockId.MinerioDiamante)).toBe(true);
    expect(isPlaceable(BlockId.Mandacaru)).toBe(true);
    expect(isPlaceable(129)).toBe(false);
  });

  it("volume do chunk cabe em 1 byte por bloco", () => {
    expect(CHUNK_VOLUME).toBe(CHUNK_SIZE ** 3);
    expect(CHUNK_VOLUME).toBe(4096);
  });
});
