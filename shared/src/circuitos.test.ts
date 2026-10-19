import { describe, expect, it } from "vitest";
import { BlockId, isPlaceable } from "./blocks";
import { formaCanonica } from "./drops";
import { ancoraDeCopia } from "./orientacao";
import {
  type Celula,
  comEstado,
  estaLigado,
  frenteDaPorta,
  isCircuito,
  recalcularCircuitos,
} from "./circuitos";

/**
 * §🔌 O MOTOR DE SINAL. A tabela-verdade do E é a aula inteira, então ela é o
 * primeiro teste — e com CONTROLE NEGATIVO em cada linha: um motor que
 * acendesse sempre passaria num teste que só olha o caso verdadeiro.
 */

/** Mundo de mentira: um mapa de células, que é tudo que o motor lê. */
function mundinho(celulas: { x: number; y: number; z: number; id: number }[]) {
  const mapa = new Map(celulas.map((c) => [`${c.x},${c.y},${c.z}`, c.id]));
  const mundo = { bloco: (x: number, y: number, z: number) => mapa.get(`${x},${y},${z}`) ?? 0 };
  const lista: Celula[] = celulas.map((c) => ({ x: c.x, y: c.y, z: c.z }));
  /** Roda o motor e APLICA — é o que o servidor faz no tick. */
  const tick = (): number => {
    const ms = recalcularCircuitos(mundo, lista);
    for (const m of ms) mapa.set(`${m.x},${m.y},${m.z}`, m.blockId);
    return ms.length;
  };
  const em = (x: number, y: number, z: number): number => mapa.get(`${x},${y},${z}`) ?? 0;
  const aceso = (x: number, y: number, z: number): boolean => estaLigado(em(x, y, z));
  const ligar = (x: number, y: number, z: number, ligado: boolean): void => {
    mapa.set(`${x},${y},${z}`, comEstado(em(x, y, z), ligado));
  };
  return { tick, em, aceso, ligar };
}

describe("o básico: alavanca, fio e lâmpada", () => {
  it("alavanca ENCOSTADA na lâmpada acende, sem fio nenhum", () => {
    // decisão do usuário: encostar funciona; o fio é pra ESPALHAR, não é pedágio
    const m = mundinho([
      { x: 0, y: 0, z: 0, id: BlockId.AlavancaLigada },
      { x: 1, y: 0, z: 0, id: BlockId.LampadaApagada },
    ]);
    m.tick();
    expect(m.aceso(1, 0, 0)).toBe(true);
  });

  it("CONTROLE NEGATIVO: com a alavanca desligada a lâmpada fica apagada", () => {
    const m = mundinho([
      { x: 0, y: 0, z: 0, id: BlockId.AlavancaDesligada },
      { x: 1, y: 0, z: 0, id: BlockId.LampadaApagada },
    ]);
    expect(m.tick()).toBe(0);
    expect(m.aceso(1, 0, 0)).toBe(false);
  });

  it("o fio leva o sinal por um caminho comprido, e em pé também", () => {
    const celulas: { x: number; y: number; z: number; id: number }[] = [
      { x: 0, y: 0, z: 0, id: BlockId.AlavancaLigada },
    ];
    for (let i = 1; i <= 12; i++) celulas.push({ x: i, y: 0, z: 0, id: BlockId.FioDesligado });
    for (let y = 1; y <= 3; y++) celulas.push({ x: 12, y, z: 0, id: BlockId.FioDesligado });
    celulas.push({ x: 12, y: 4, z: 0, id: BlockId.LampadaApagada });
    const m = mundinho(celulas);
    m.tick();
    expect(m.aceso(12, 4, 0)).toBe(true);
    expect(m.aceso(6, 0, 0)).toBe(true);
  });

  it("DESLIGAR apaga tudo (o sinal não fica preso no fio)", () => {
    // o motor recomeça do zero a cada conta justamente por isso: um fio que se
    // alimentasse do vizinho continuaria aceso pra sempre
    const m = mundinho([
      { x: 0, y: 0, z: 0, id: BlockId.AlavancaLigada },
      { x: 1, y: 0, z: 0, id: BlockId.FioDesligado },
      { x: 2, y: 0, z: 0, id: BlockId.FioDesligado },
      { x: 3, y: 0, z: 0, id: BlockId.LampadaApagada },
    ]);
    m.tick();
    expect(m.aceso(3, 0, 0)).toBe(true);
    m.ligar(0, 0, 0, false);
    m.tick();
    expect(m.aceso(1, 0, 0)).toBe(false);
    expect(m.aceso(2, 0, 0)).toBe(false);
    expect(m.aceso(3, 0, 0)).toBe(false);
  });

  it("a lâmpada CONSOME: ela não repassa o sinal pra frente", () => {
    // senão ela seria um fio que brilha, e não dá pra fechar o circuito num ponto
    const m = mundinho([
      { x: 0, y: 0, z: 0, id: BlockId.AlavancaLigada },
      { x: 1, y: 0, z: 0, id: BlockId.LampadaApagada },
      { x: 2, y: 0, z: 0, id: BlockId.LampadaApagada },
    ]);
    m.tick();
    expect(m.aceso(1, 0, 0)).toBe(true);
    expect(m.aceso(2, 0, 0)).toBe(false);
  });
});

describe("a OU é uma peça PRÓPRIA, não um estado da E", () => {
  it("o drop e a âncora da mochila devolvem a OU, não a E", () => {
    // é o erro que uma tabela compartilhada convida: as duas portas têm o
    // mesmo desenho de ids, então "voltar pro id base" podia cair na base ERRADA
    for (const id of [
      BlockId.PortaOUXPDesligada,
      BlockId.PortaOUZNDesligada,
      BlockId.PortaOUXNLigada,
      BlockId.PortaOUZNLigada,
    ]) {
      expect(formaCanonica(id)).toBe(BlockId.PortaOUXPDesligada);
      expect(ancoraDeCopia(id)).toBe(BlockId.PortaOUXPDesligada);
    }
    for (const id of [BlockId.PortaEXPDesligada, BlockId.PortaEZNLigada]) {
      expect(formaCanonica(id)).toBe(BlockId.PortaEXPDesligada);
      expect(ancoraDeCopia(id)).toBe(BlockId.PortaEXPDesligada);
    }
  });

  it("estaLigado e comEstado acertam a direção dentro de cada família", () => {
    for (const [desligada, ligada] of [
      [BlockId.PortaOUXPDesligada, BlockId.PortaOUXPLigada],
      [BlockId.PortaOUZNDesligada, BlockId.PortaOUZNLigada],
      [BlockId.PortaEZPDesligada, BlockId.PortaEZPLigada],
    ] as const) {
      expect(estaLigado(desligada)).toBe(false);
      expect(estaLigado(ligada)).toBe(true);
      expect(comEstado(desligada, true)).toBe(ligada);
      expect(comEstado(ligada, false)).toBe(desligada);
      // a frente é a MESMA nos dois estados (estado não vira a peça)
      expect(frenteDaPorta(desligada)).toBe(frenteDaPorta(ligada));
    }
  });

  it("a OU é colocável e indexada como circuito; a LIGADA não se coloca", () => {
    expect(isCircuito(BlockId.PortaOUXPDesligada)).toBe(true);
    expect(isCircuito(BlockId.PortaOUZNLigada)).toBe(true);
    expect(isPlaceable(BlockId.PortaOUXPDesligada)).toBe(true);
    expect(isPlaceable(BlockId.PortaOUXPLigada)).toBe(false); // estado, não escolha
  });
});

describe("a tabela-verdade da porta OU (2026-10-19)", () => {
  /** A MESMA bancada da porta E, trocando só a peça do meio — é esse o ponto:
   *  mesma forma, mesma frente, mesmas entradas, regra diferente. */
  function bancada(a: boolean, b: boolean) {
    return mundinho([
      { x: 0, y: 0, z: 1, id: a ? BlockId.AlavancaLigada : BlockId.AlavancaDesligada },
      { x: 0, y: 0, z: -1, id: b ? BlockId.AlavancaLigada : BlockId.AlavancaDesligada },
      { x: 0, y: 0, z: 0, id: BlockId.PortaOUXPDesligada },
      { x: 1, y: 0, z: 0, id: BlockId.LampadaApagada },
    ]);
  }

  for (const [a, b, esperado] of [
    [false, false, false], // o controle negativo: OU que acende sempre não é OU
    [true, false, true],
    [false, true, true],
    [true, true, true],
  ] as const) {
    it(`${a ? "1" : "0"} OU ${b ? "1" : "0"} = ${esperado ? "1" : "0"}`, () => {
      const m = bancada(a, b);
      m.tick();
      expect(m.aceso(0, 0, 0)).toBe(esperado);
      expect(m.aceso(1, 0, 0)).toBe(esperado);
    });
  }

  it("as DUAS linhas em que E e OU discordam são as que a aula usa", () => {
    // 1E0=0 mas 1OU0=1 — é a comparação lado a lado que ensina a diferença
    const e = mundinho([
      { x: 0, y: 0, z: 1, id: BlockId.AlavancaLigada },
      { x: 0, y: 0, z: -1, id: BlockId.AlavancaDesligada },
      { x: 0, y: 0, z: 0, id: BlockId.PortaEXPDesligada },
      { x: 1, y: 0, z: 0, id: BlockId.LampadaApagada },
    ]);
    const ou = bancada(true, false);
    e.tick();
    ou.tick();
    expect(e.aceso(1, 0, 0)).toBe(false);
    expect(ou.aceso(1, 0, 0)).toBe(true);
  });

  it("a OU também só ENTREGA pela frente", () => {
    // com UMA alavanca a OU liga de verdade — então, sem esta regra, o sinal
    // sairia pela lateral e acenderia a lâmpada posta na outra ENTRADA
    const m = mundinho([
      { x: 0, y: 0, z: 1, id: BlockId.AlavancaLigada },
      { x: 0, y: 0, z: 0, id: BlockId.PortaOUXPDesligada },
      { x: 0, y: 0, z: -1, id: BlockId.LampadaApagada },
    ]);
    m.tick();
    expect(m.aceso(0, 0, 0)).toBe(true); // a porta LIGA (1 OU 0 = 1)…
    expect(m.aceso(0, 0, -1)).toBe(false); // …e mesmo assim não acende a lateral
  });

  it("as quatro direções da OU: muda pra onde sai, não a regra", () => {
    for (const f of [
      { id: BlockId.PortaOUZPDesligada, saida: { x: 0, z: 1 }, lado: { x: 1, z: 0 } },
      { id: BlockId.PortaOUXNDesligada, saida: { x: -1, z: 0 }, lado: { x: 0, z: 1 } },
      { id: BlockId.PortaOUZNDesligada, saida: { x: 0, z: -1 }, lado: { x: 1, z: 0 } },
    ]) {
      const m = mundinho([
        { x: f.lado.x, y: 0, z: f.lado.z, id: BlockId.AlavancaLigada }, // UMA só
        { x: 0, y: 0, z: 0, id: f.id },
        { x: f.saida.x, y: 0, z: f.saida.z, id: BlockId.LampadaApagada },
      ]);
      m.tick();
      expect(m.aceso(f.saida.x, 0, f.saida.z)).toBe(true);
    }
  });

  it("E alimentando OU: o resultado de uma vira ENTRADA da outra", () => {
    // ⚠️ a saída de uma porta tem de cair num LADO da outra, nunca nas costas:
    // porta lê as duas laterais e mais nada. Aqui a E (virada pro −z) entrega
    // num fio que ESTÁ na lateral da OU — foi a 1ª versão deste teste que
    // esbarrou nisso, encostando a E nas costas da OU e não acendendo nada.
    //
    //   planta:        alavanca              alavanca
    //                      │                     │
    //        z+2      [lev A]──[  E  ↓ ]──[lev B]
    //        z+1                 [fio]
    //        z0       [solta]─[ OU → ]─[LÂMPADA]
    const m = mundinho([
      { x: 1, y: 0, z: 2, id: BlockId.AlavancaDesligada }, // entradas da E
      { x: -1, y: 0, z: 2, id: BlockId.AlavancaDesligada },
      { x: 0, y: 0, z: 2, id: BlockId.PortaEZNDesligada }, // E, saída pro −z
      { x: 0, y: 0, z: 1, id: BlockId.FioDesligado }, // saída da E = lateral da OU
      { x: 0, y: 0, z: 0, id: BlockId.PortaOUXPDesligada }, // OU, saída pro +x
      { x: 0, y: 0, z: -1, id: BlockId.AlavancaDesligada }, // a outra lateral da OU
      { x: 1, y: 0, z: 0, id: BlockId.LampadaApagada },
    ]);
    m.tick();
    expect(m.aceso(1, 0, 0)).toBe(false); // nada ligado: apagada

    // só a alavanca solta: 0 OU 1 = 1, a lâmpada acende sem a E participar
    m.ligar(0, 0, -1, true);
    m.tick();
    expect(m.aceso(1, 0, 0)).toBe(true);

    // desliga a solta e liga as DUAS da E: a E entrega pelo fio e a OU repassa
    m.ligar(0, 0, -1, false);
    m.ligar(1, 0, 2, true);
    m.ligar(-1, 0, 2, true);
    m.tick();
    expect(m.aceso(0, 0, 2)).toBe(true); // a E
    expect(m.aceso(1, 0, 0)).toBe(true); // a lâmpada, pelo caminho todo

    // CONTROLE NEGATIVO: com UMA entrada da E, o caminho inteiro apaga
    m.ligar(-1, 0, 2, false);
    m.tick();
    expect(m.aceso(0, 0, 2)).toBe(false);
    expect(m.aceso(1, 0, 0)).toBe(false);
  });
});

describe("a tabela-verdade da porta E (é a aula)", () => {
  /** Duas alavancas nas laterais de uma porta E virada pro +x, lâmpada à frente. */
  function bancada(a: boolean, b: boolean) {
    return mundinho([
      { x: 0, y: 0, z: 1, id: a ? BlockId.AlavancaLigada : BlockId.AlavancaDesligada },
      { x: 0, y: 0, z: -1, id: b ? BlockId.AlavancaLigada : BlockId.AlavancaDesligada },
      { x: 0, y: 0, z: 0, id: BlockId.PortaEXPDesligada },
      { x: 1, y: 0, z: 0, id: BlockId.LampadaApagada },
    ]);
  }

  for (const [a, b, esperado] of [
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [true, true, true],
  ] as const) {
    it(`${a ? "1" : "0"} E ${b ? "1" : "0"} = ${esperado ? "1" : "0"}`, () => {
      const m = bancada(a, b);
      m.tick();
      expect(m.aceso(0, 0, 0)).toBe(esperado); // a porta
      expect(m.aceso(1, 0, 0)).toBe(esperado); // a lâmpada à frente
    });
  }

  it("a porta só ENTREGA pela frente — pela lateral ela é entrada", () => {
    // sem esta regra o sinal da saída voltaria pela própria entrada e a porta
    // ligaria sozinha com UMA alavanca só
    const m = mundinho([
      { x: 0, y: 0, z: 1, id: BlockId.AlavancaLigada },
      { x: 0, y: 0, z: 0, id: BlockId.PortaEXPDesligada },
      { x: 0, y: 0, z: -1, id: BlockId.LampadaApagada }, // lâmpada na OUTRA entrada
    ]);
    m.tick();
    expect(m.aceso(0, 0, 0)).toBe(false);
    expect(m.aceso(0, 0, -1)).toBe(false);
  });

  it("as quatro direções têm a mesma regra (só muda pra onde sai)", () => {
    const frentes = [
      { id: BlockId.PortaEZPDesligada, saida: { x: 0, z: 1 }, lados: [{ x: 1, z: 0 }, { x: -1, z: 0 }] },
      { id: BlockId.PortaEXNDesligada, saida: { x: -1, z: 0 }, lados: [{ x: 0, z: 1 }, { x: 0, z: -1 }] },
      { id: BlockId.PortaEZNDesligada, saida: { x: 0, z: -1 }, lados: [{ x: 1, z: 0 }, { x: -1, z: 0 }] },
    ];
    for (const f of frentes) {
      const m = mundinho([
        { x: f.lados[0]!.x, y: 0, z: f.lados[0]!.z, id: BlockId.AlavancaLigada },
        { x: f.lados[1]!.x, y: 0, z: f.lados[1]!.z, id: BlockId.AlavancaLigada },
        { x: 0, y: 0, z: 0, id: f.id },
        { x: f.saida.x, y: 0, z: f.saida.z, id: BlockId.LampadaApagada },
      ]);
      m.tick();
      expect(m.aceso(f.saida.x, 0, f.saida.z), `frente ${frenteDaPorta(f.id)}`).toBe(true);
    }
  });

  it("duas portas em série: a lâmpada só acende com as TRÊS alavancas", () => {
    // é o desafio da aula: (A E B) E C
    const base = (c: boolean) => [
      { x: 0, y: 0, z: 1, id: BlockId.AlavancaLigada },
      { x: 0, y: 0, z: -1, id: BlockId.AlavancaLigada },
      { x: 0, y: 0, z: 0, id: BlockId.PortaEXPDesligada },
      { x: 1, y: 0, z: 0, id: BlockId.FioDesligado }, // saída da 1ª → entrada da 2ª
      { x: 2, y: 0, z: 1, id: BlockId.FioDesligado },
      { x: 2, y: 0, z: 0, id: BlockId.FioDesligado },
      { x: 3, y: 0, z: 1, id: BlockId.PortaEXPDesligada },
      { x: 3, y: 0, z: 2, id: c ? BlockId.AlavancaLigada : BlockId.AlavancaDesligada },
      { x: 3, y: 0, z: 0, id: BlockId.FioDesligado },
      { x: 4, y: 0, z: 1, id: BlockId.LampadaApagada },
    ];
    const comC = mundinho(base(true));
    comC.tick();
    expect(comC.aceso(4, 0, 1)).toBe(true);
    const semC = mundinho(base(false));
    semC.tick();
    expect(semC.aceso(4, 0, 1)).toBe(false);
  });
});

describe("a conta termina e não inventa trabalho", () => {
  it("circuito estável não gera mudança nenhuma no tick seguinte", () => {
    // é o que mantém o custo em zero quando ninguém mexe em nada
    const m = mundinho([
      { x: 0, y: 0, z: 0, id: BlockId.AlavancaLigada },
      { x: 1, y: 0, z: 0, id: BlockId.FioDesligado },
      { x: 2, y: 0, z: 0, id: BlockId.LampadaApagada },
    ]);
    expect(m.tick()).toBe(2); // fio + lâmpada acendem
    expect(m.tick()).toBe(0); // e pronto
    expect(m.tick()).toBe(0);
  });

  it("anel de fio fechado não trava (o ponto fixo só cresce)", () => {
    const celulas: { x: number; y: number; z: number; id: number }[] = [
      { x: 0, y: 0, z: 0, id: BlockId.AlavancaLigada },
    ];
    for (const [x, z] of [[1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1]] as const) {
      celulas.push({ x, y: 0, z, id: BlockId.FioDesligado });
    }
    const m = mundinho(celulas);
    m.tick();
    expect(m.aceso(1, 2, 0) || m.aceso(2, 0, 0)).toBe(true);
    expect(m.tick()).toBe(0); // estabilizou de primeira
  });

  it("célula indexada que não é mais circuito é ignorada (bloco quebrado)", () => {
    const m = mundinho([
      { x: 0, y: 0, z: 0, id: BlockId.AlavancaLigada },
      { x: 1, y: 0, z: 0, id: BlockId.Stone }, // alguém quebrou o fio e pôs pedra
      { x: 2, y: 0, z: 0, id: BlockId.LampadaApagada },
    ]);
    m.tick();
    expect(m.aceso(2, 0, 0)).toBe(false);
    expect(isCircuito(BlockId.Stone)).toBe(false);
  });
});
