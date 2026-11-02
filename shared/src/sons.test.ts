import { describe, expect, it } from "vitest";
import { BlockId, aguaComNivel, blocoExiste, MAX_BLOCK_ID, portaToggled } from "./blocks";
import { comEstado } from "./circuitos";
import {
  Passadas,
  PASSO_BLOCOS,
  materialSonoro,
  somDaTroca,
  vozDoBicho,
} from "./sons";

describe("§🔊 materialSonoro", () => {
  it("todo bloco que existe tem voz — menos ar e água", () => {
    const semVoz: number[] = [];
    for (let id = 0; id <= MAX_BLOCK_ID; id++) {
      if (!blocoExiste(id)) continue;
      if (materialSonoro(id) === null) semVoz.push(id);
    }
    const agua = [BlockId.Agua, ...[1, 2, 3, 4, 5, 6, 7].map(aguaComNivel)];
    expect(semVoz.sort((a, b) => a - b)).toEqual([BlockId.Air, ...agua].sort((a, b) => a - b));
  });

  it("deriva da família e da ferramenta (controle: cada família cai na voz certa)", () => {
    expect(materialSonoro(BlockId.Stone)).toBe("pedra");
    expect(materialSonoro(BlockId.MinerioDiamante)).toBe("pedra");
    expect(materialSonoro(BlockId.Log)).toBe("madeira");
    expect(materialSonoro(BlockId.Planks)).toBe("madeira");
    expect(materialSonoro(BlockId.EscadaTabuaXP)).toBe("madeira");
    expect(materialSonoro(BlockId.EscadaPedraXP)).toBe("pedra");
    expect(materialSonoro(BlockId.Dirt)).toBe("terra");
    expect(materialSonoro(BlockId.Grass)).toBe("terra");
    expect(materialSonoro(BlockId.Sand)).toBe("areia");
    expect(materialSonoro(BlockId.Glass)).toBe("vidro");
    expect(materialSonoro(BlockId.VidroRosa)).toBe("vidro");
    expect(materialSonoro(BlockId.Leaves)).toBe("planta");
    expect(materialSonoro(BlockId.GramaAlta)).toBe("planta");
    expect(materialSonoro(BlockId.Plantacao2)).toBe("planta");
    expect(materialSonoro(BlockId.BlocoAlgodaoMarrom)).toBe("tecido");
    expect(materialSonoro(BlockId.CamaXP)).toBe("tecido");
    expect(materialSonoro(BlockId.PortaXFechada)).toBe("madeira");
    expect(materialSonoro(BlockId.PlacaDesligada)).toBe("metal");
  });

  it("id que não existe não tem voz (buraco 251-255)", () => {
    expect(materialSonoro(253)).toBeNull();
  });
});

describe("§🔊 somDaTroca", () => {
  it("colocar e quebrar levam o material do bloco que tem corpo", () => {
    expect(somDaTroca(BlockId.Air, BlockId.Stone)).toEqual({ tipo: "colocar", material: "pedra" });
    expect(somDaTroca(BlockId.Log, BlockId.Air)).toEqual({ tipo: "quebrar", material: "madeira" });
    // colocar POR CIMA da grama alta e dentro da água também é colocar
    expect(somDaTroca(BlockId.GramaAlta, BlockId.Planks)).toEqual({ tipo: "colocar", material: "madeira" });
    expect(somDaTroca(BlockId.Agua, BlockId.Sand)).toEqual({ tipo: "colocar", material: "areia" });
    // arrancar mato
    expect(somDaTroca(BlockId.GramaAlta, BlockId.Air)).toEqual({ tipo: "quebrar", material: "planta" });
  });

  it("porta e janela soam abrindo/fechando; só trocar dobradiça não soa", () => {
    expect(somDaTroca(BlockId.PortaXFechada, BlockId.PortaXAberta)).toEqual({
      tipo: "porta", abriu: true, material: "madeira",
    });
    expect(somDaTroca(BlockId.PortaXAberta, BlockId.PortaXFechada)).toMatchObject({ abriu: false });
    expect(somDaTroca(BlockId.JanelaZFechada, BlockId.JanelaZAberta)).toMatchObject({ tipo: "porta", abriu: true });
    expect(somDaTroca(BlockId.PortaXFechada, BlockId.PortaXFechadaR)).toBeNull();
    expect(portaToggled(BlockId.PortaXFechada)).toBe(BlockId.PortaXAberta);
  });

  it("alavanca e placa soam; o resto do CIRCUITO não (motor não faz barulho)", () => {
    expect(somDaTroca(BlockId.AlavancaDesligada, BlockId.AlavancaLigada)).toEqual({ tipo: "alavanca", ligou: true });
    expect(somDaTroca(BlockId.AlavancaTetoLigada, BlockId.AlavancaTetoDesligada)).toEqual({ tipo: "alavanca", ligou: false });
    expect(somDaTroca(BlockId.PlacaDesligada, BlockId.PlacaLigada)).toEqual({ tipo: "placa", ligou: true });
    // controle negativo: as peças que o MOTOR acende, todas caladas
    for (const id of [BlockId.FioDesligado, BlockId.FioXPDesligado, BlockId.LampadaApagada, BlockId.PortaEXPDesligada]) {
      expect(somDaTroca(id, comEstado(id, true)), `id ${id}`).toBeNull();
    }
    // duas alavancas de faces diferentes não são "a mesma alavanca"
    expect(somDaTroca(BlockId.AlavancaXPDesligada, BlockId.AlavancaZPLigada)).toBeNull();
  });

  it("a água nivelando, a plantação crescendo e a grama espalhando são silêncio", () => {
    expect(somDaTroca(BlockId.Air, aguaComNivel(5))).toBeNull();
    expect(somDaTroca(aguaComNivel(5), aguaComNivel(4))).toBeNull();
    expect(somDaTroca(aguaComNivel(1), BlockId.Air)).toBeNull();
    expect(somDaTroca(BlockId.Plantacao0, BlockId.Plantacao1)).toBeNull();
    expect(somDaTroca(BlockId.Dirt, BlockId.Grass)).toBeNull();
    expect(somDaTroca(BlockId.Stone, BlockId.Stone)).toBeNull();
  });

  it("fornalha soa só ao ACENDER", () => {
    expect(somDaTroca(BlockId.Fornalha, BlockId.FornalhaAcesa)).toEqual({ tipo: "fogo" });
    expect(somDaTroca(BlockId.FornalhaAcesa, BlockId.Fornalha)).toBeNull();
  });
});

describe("§🔊 Passadas", () => {
  const chao = { noChao: true, voando: false, naAgua: false, correndo: false };

  it("um passo a cada PASSO_BLOCOS andados, não por relógio", () => {
    const p = new Passadas();
    let passos = 0;
    // 10 blocos em frames de 0,1
    for (let i = 0; i < 100; i++) if (p.passo(0.1, 0, 64, chao)) passos++;
    expect(passos).toBe(Math.floor(10 / PASSO_BLOCOS));
    // controle: parado contra a parede (dx=0) não anda passo nenhum
    let parado = 0;
    for (let i = 0; i < 100; i++) if (p.passo(0, 0, 64, chao)) parado++;
    expect(parado).toBe(0);
  });

  it("voando e na água não tem passada", () => {
    const p = new Passadas();
    let passos = 0;
    for (let i = 0; i < 100; i++) if (p.passo(0.1, 0, 64, { ...chao, voando: true })) passos++;
    for (let i = 0; i < 100; i++) if (p.passo(0.1, 0, 64, { ...chao, naAgua: true })) passos++;
    expect(passos).toBe(0);
  });

  it("queda alta dá baque; pulo comum dá só a passada do pouso", () => {
    const p = new Passadas();
    p.passo(0, 0, 64, chao);
    // pulo de 1,2 bloco
    p.passo(0, 0, 65.2, { ...chao, noChao: false });
    expect(p.passo(0, 0, 64, chao)).toEqual({ tipo: "passo" });
    // queda de 4 blocos (sobe 0,5 no pulo, cai até 60,5)
    p.passo(0, 0, 64.5, { ...chao, noChao: false });
    p.passo(0, 0, 62, { ...chao, noChao: false });
    const s = p.passo(0, 0, 60.5, chao);
    expect(s?.tipo).toBe("aterrissar");
    expect(s && s.tipo === "aterrissar" ? s.altura : 0).toBeCloseTo(4, 5);
  });

  it("teleporte (salto de 40 blocos num frame) não vira rajada de passos", () => {
    const p = new Passadas();
    const sons = [p.passo(40, 0, 64, chao), p.passo(0.1, 0, 64, chao)];
    expect(sons.filter(Boolean).length).toBe(1);
  });
});

describe("§🐄 vozDoBicho — o gancho dos mobs", () => {
  it("variante herda a voz pelo prefixo", () => {
    expect(vozDoBicho("vaca")).toBe("vaca");
    expect(vozDoBicho("vaca-malhada")).toBe("vaca");
    expect(vozDoBicho("galinha_caipira")).toBe("galinha");
    // o nome que o servidor dos mobs manda: com ESPAÇO, e o vira-lata é cachorro
    expect(vozDoBicho("vaca malhada")).toBe("vaca");
    expect(vozDoBicho("vira-lata caramelo")).toBe("cachorro");
    // controle: prefixo SEM separador não é variante (vacaria ≠ vaca)
    expect(vozDoBicho("vacaria")).toBeNull();
    expect(vozDoBicho("dragao")).toBeNull();
  });
});
