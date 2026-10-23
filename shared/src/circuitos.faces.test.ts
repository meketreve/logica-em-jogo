import { describe, expect, it } from "vitest";
import {
  BlockId,
  MAX_BLOCK_ID,
  blockSelectionBox,
  createWorld,
  ehAlavanca,
  ehFio,
  isFullCube,
  isPlaceable,
  isSolidBlock,
  meshChunk,
  setBlock,
} from "./index";
import { formaCanonica } from "./drops";
import { ancoraDeCopia, orientarParaColocar } from "./orientacao";
import {
  FACES_DE_PECA,
  type Celula,
  type FaceDaPeca,
  comEstado,
  comFace,
  ehRasteira,
  estaLigado,
  faceDaPeca,
  faceDoClique,
  isAlavanca,
  isCircuito,
  isFio,
  normalDaFace,
  recalcularCircuitos,
} from "./circuitos";

/**
 * §🔌 O CIRCUITO SAI DO CHÃO (2026-10-23) — fio e alavanca em parede e teto.
 *
 * Pedido dele: "permitir que os circuitos sejam postos em paredes e tetos". A
 * lâmpada e as portas lógicas já iam (são cubos); o que estava preso ao chão
 * era o fio e a alavanca, porque a face em que eles se colam era IMPLÍCITA.
 *
 * As três perguntas deste arquivo, na ordem em que um defeito apareceria em
 * aula:
 *   1. a FACE entra e sai do id sem perder o estado, e volta pra mochila como
 *      UMA peça (senão o aluno acumula seis fios diferentes);
 *   2. o MOTOR não olha a face — fio de parede conduz igual (é o que faz o
 *      circuito subir);
 *   3. o DESENHO e a MIRA giram JUNTOS com a face (contorno no chão e peça na
 *      parede é o que o aluno lê como "não dá pra clicar").
 */

/** Todas as faces, incluindo o piso — é por aqui que todo teste varre. */
const TODAS: readonly FaceDaPeca[] = ["piso", ...FACES_DE_PECA];

/** As duas famílias rasteiras pela entrada que a mochila guarda. */
const FAMILIAS = [
  { nome: "fio", ancora: BlockId.FioDesligado, ehNaRaiz: ehFio, ehNoMotor: isFio },
  { nome: "alavanca", ancora: BlockId.AlavancaDesligada, ehNaRaiz: ehAlavanca, ehNoMotor: isAlavanca },
] as const;

describe("PORTÃO: a faixa do `blocks.ts` e a tabela do `circuitos.ts` concordam", () => {
  // as duas existem por um motivo (o `blocks.ts` é a raiz e não pode importar o
  // `circuitos.ts`), então o que as mantém honestas é esta varredura — a mesma
  // que guarda `ehPortaLogica` desde 19/10
  it("em TODO id, inclusive os buracos da numeração e o que vem depois do teto", () => {
    for (let id = 0; id <= MAX_BLOCK_ID + 8; id++) {
      expect(ehFio(id)).toBe(isFio(id));
      expect(ehAlavanca(id)).toBe(isAlavanca(id));
    }
  });
});

describe("a FACE mora no id, e o estado continua separado dela", () => {
  it("cada face tem seu par, e `comFace`/`faceDaPeca` são o ida-e-volta", () => {
    for (const f of FAMILIAS) {
      for (const face of TODAS) {
        const desligada = comFace(f.ancora, face);
        expect(faceDaPeca(desligada)).toBe(face);
        expect(estaLigado(desligada)).toBe(false);
        // ligar NÃO muda a face, e a face não muda o estado — é o que deixa
        // `estaLigado` ser uma conta de paridade em vez de 24 linhas de tabela
        const ligada = comEstado(desligada, true);
        expect(estaLigado(ligada)).toBe(true);
        expect(faceDaPeca(ligada)).toBe(face);
        expect(comFace(ligada, "piso")).toBe(comEstado(f.ancora, true));
        expect(f.ehNoMotor(desligada) && f.ehNoMotor(ligada)).toBe(true);
        expect(isCircuito(desligada)).toBe(true);
      }
    }
  });

  it("as 6 faces de cada família são 6 ids DIFERENTES (nada de alias)", () => {
    for (const f of FAMILIAS) {
      const ids = new Set(TODAS.map((face) => comFace(f.ancora, face)));
      expect(ids.size).toBe(6);
    }
  });

  it("a mochila guarda UMA peça: toda face volta pra âncora do piso", () => {
    for (const f of FAMILIAS) {
      for (const face of TODAS) {
        const desligada = comFace(f.ancora, face);
        expect(formaCanonica(desligada)).toBe(f.ancora);
        expect(formaCanonica(comEstado(desligada, true))).toBe(f.ancora);
        expect(ancoraDeCopia(comEstado(desligada, true))).toBe(f.ancora);
      }
    }
  });

  it("e só a DESLIGADA se coloca — ligado é resultado, em qualquer face", () => {
    for (const f of FAMILIAS) {
      for (const face of TODAS) {
        const desligada = comFace(f.ancora, face);
        expect(isPlaceable(desligada)).toBe(true);
        expect(isPlaceable(comEstado(desligada, true))).toBe(false);
      }
    }
  });

  it("nenhuma face é cubo cheio nem sólida (senão vira parede e resgata quem passa)", () => {
    for (const f of FAMILIAS) {
      for (const face of TODAS) {
        for (const ligado of [false, true]) {
          const id = comEstado(comFace(f.ancora, face), ligado);
          expect(isFullCube(id)).toBe(false);
          expect(isSolidBlock(id)).toBe(false);
        }
      }
    }
  });

  it("a PLACA não ganhou face (decisão dele: o corpo é que a liga)", () => {
    expect(ehRasteira(BlockId.PlacaDesligada)).toBe(false);
    expect(faceDaPeca(BlockId.PlacaDesligada)).toBe(null);
  });
});

describe("a face sai do GESTO: a cara que o aluno clicou", () => {
  it("a peça cola no lado por onde está o bloco clicado (o OPOSTO da normal)", () => {
    expect(faceDoClique(0, 1, 0)).toBe("piso"); // clicou no TOPO → chão da célula de cima
    expect(faceDoClique(0, -1, 0)).toBe("teto"); // clicou por BAIXO → teto da de baixo
    expect(faceDoClique(1, 0, 0)).toBe("XN"); // nasceu a +x do bloco → apoio a −x dela
    expect(faceDoClique(-1, 0, 0)).toBe("XP");
    expect(faceDoClique(0, 0, 1)).toBe("ZN");
    expect(faceDoClique(0, 0, -1)).toBe("ZP");
  });

  it("e a normal da face aponta de volta pro bloco clicado", () => {
    // é o que o punho da alavanca e o poste do fio seguem: a peça aponta pro
    // lado aberto, nunca pra dentro do apoio
    for (const [nx, ny, nz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
      const n = normalDaFace(faceDoClique(nx!, ny!, nz!));
      expect([n.dx, n.dy, n.dz]).toEqual([nx, ny, nz]);
    }
  });

  it("colocar usa a face, e o olhar não mexe nela (fio não tem frente)", () => {
    for (const f of FAMILIAS) {
      for (const face of TODAS) {
        expect(orientarParaColocar(f.ancora, 0, false, false, face)).toBe(comFace(f.ancora, face));
        // yaw e agachado são de quem TEM frente (porta lógica, móvel): aqui não
        expect(orientarParaColocar(f.ancora, 1.3, true, true, face)).toBe(comFace(f.ancora, face));
      }
    }
    // sem face, o padrão é o chão — é o gesto de 2026-10-16, intacto
    expect(orientarParaColocar(BlockId.FioDesligado, 0, false)).toBe(BlockId.FioDesligado);
  });
});

/** Mundo de mentira do motor (o mesmo de `circuitos.test.ts`). */
function mundinho(celulas: { x: number; y: number; z: number; id: number }[]) {
  const mapa = new Map(celulas.map((c) => [`${c.x},${c.y},${c.z}`, c.id]));
  const mundo = { bloco: (x: number, y: number, z: number) => mapa.get(`${x},${y},${z}`) ?? 0 };
  const lista: Celula[] = celulas.map((c) => ({ x: c.x, y: c.y, z: c.z }));
  const tick = (): number => {
    const ms = recalcularCircuitos(mundo, lista);
    for (const m of ms) mapa.set(`${m.x},${m.y},${m.z}`, m.blockId);
    return ms.length;
  };
  const aceso = (x: number, y: number, z: number): boolean =>
    estaLigado(mapa.get(`${x},${y},${z}`) ?? 0);
  return { tick, aceso };
}

describe("o MOTOR não olha a face — é isso que faz o circuito subir a parede", () => {
  it("alavanca no chão → fio pela PAREDE → lâmpada no alto: acende", () => {
    // a coluna de fio está colada na parede do lado +x das células (face XP), o
    // que em aula é "o circuito sobe pelo muro" — e o sinal sobe com ele
    const fio = (y: number) => ({ x: 0, y, z: 0, id: comFace(BlockId.FioDesligado, "XP") });
    const m = mundinho([
      { x: 0, y: 0, z: 0, id: BlockId.AlavancaLigada },
      fio(1), fio(2), fio(3),
      { x: 0, y: 4, z: 0, id: BlockId.LampadaApagada },
    ]);
    m.tick();
    expect(m.aceso(0, 4, 0)).toBe(true);
  });

  it("CONTROLE NEGATIVO: com a alavanca desligada a coluna fica apagada", () => {
    const fio = (y: number) => ({ x: 0, y, z: 0, id: comFace(BlockId.FioDesligado, "XP") });
    const m = mundinho([
      { x: 0, y: 0, z: 0, id: BlockId.AlavancaDesligada },
      fio(1), fio(2), fio(3),
      { x: 0, y: 4, z: 0, id: BlockId.LampadaApagada },
    ]);
    expect(m.tick()).toBe(0);
    expect(m.aceso(0, 4, 0)).toBe(false);
  });

  it("e alavanca de TETO é fonte igual (o dedo aciona de baixo)", () => {
    const m = mundinho([
      { x: 0, y: 0, z: 0, id: comEstado(comFace(BlockId.AlavancaDesligada, "teto"), true) },
      { x: 1, y: 0, z: 0, id: BlockId.LampadaApagada },
    ]);
    m.tick();
    expect(m.aceso(1, 0, 0)).toBe(true);
  });
});

const P = 1 / 16;
const DIMS = { x: 1, z: 1, y: 1 } as const;

/** A caixa (mínimos e máximos) da malha de UMA peça isolada, em coords da célula. */
function caixaDaMalha(id: number): { min: number[]; max: number[] } {
  const w = createWorld(DIMS);
  setBlock(w, 8, 8, 8, id);
  const g = meshChunk(w, 0, 0, 0);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < g.positions.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      const v = g.positions[i + k]! - 8;
      min[k] = Math.min(min[k]!, v);
      max[k] = Math.max(max[k]!, v);
    }
  }
  return { min, max };
}

/** O quanto a malha avança a partir da face, ao longo da normal dela. */
function alturaNaFace(id: number): number {
  const face = faceDaPeca(id)!;
  const n = normalDaFace(face);
  const { min, max } = caixaDaMalha(id);
  const eixo = n.dx !== 0 ? 0 : n.dy !== 0 ? 1 : 2;
  const sinal = n.dx + n.dy + n.dz; // só um é diferente de zero
  return sinal > 0 ? max[eixo]! : 1 - min[eixo]!;
}

describe("o DESENHO gira com a face (silhueta, não cor)", () => {
  it("a alavanca LIGADA sai 12/16 da face, e a desligada 6/16 — nas seis", () => {
    // a regra de 19/10 ("a diferença é a SILHUETA") tinha de sobreviver ao giro:
    // "em pé" na parede quer dizer SAINDO da parede, pro meio do corredor
    for (const face of TODAS) {
      const desligada = comFace(BlockId.AlavancaDesligada, face);
      expect(alturaNaFace(comEstado(desligada, true))).toBeCloseTo(12 / 16, 5);
      expect(alturaNaFace(desligada)).toBeCloseTo(6 / 16, 5);
    }
  });

  it("o fio é uma lâmina de 2/16 RENTE à face, em todas elas", () => {
    for (const face of TODAS) {
      expect(alturaNaFace(comFace(BlockId.FioDesligado, face))).toBeCloseTo(2 / 16, 5);
    }
  });

  it("a peça de PISO saiu exatamente como antes do giro existir", () => {
    // controle de regressão: o A/B de pixel da `shots:circuito` mede a peça de
    // chão, e o giro foi escrito pra ser a IDENTIDADE no piso — se esta caixa
    // andar, a sonda acusa uma diferença que não é da mudança
    expect(caixaDaMalha(BlockId.AlavancaLigada)).toEqual({
      min: [5 * P, 0, 5 * P],
      max: [11 * P, 12 * P, 11 * P],
    });
    expect(caixaDaMalha(BlockId.FioDesligado)).toEqual({
      min: [6 * P, 0, 6 * P],
      max: [10 * P, 2 * P, 10 * P],
    });
  });

  it("e a MIRA acompanha: o contorno fica onde a peça está", () => {
    for (const face of TODAS) {
      const n = normalDaFace(face);
      const eixo = n.dx !== 0 ? 0 : n.dy !== 0 ? 1 : 2;
      const sinal = n.dx + n.dy + n.dz;
      for (const ancora of [BlockId.FioDesligado, BlockId.AlavancaDesligada]) {
        const caixa = blockSelectionBox(comFace(ancora, face));
        // a caixa encosta no apoio: o lado de lá da normal é a face da célula
        expect(sinal > 0 ? caixa[eixo]! : caixa[eixo + 3]!).toBeCloseTo(sinal > 0 ? 0 : 1, 5);
      }
    }
    // a caixa da alavanca segue 12/16 nos DOIS estados (bug-676), e isso vale
    // depois do giro também
    for (const face of TODAS) {
      const desligada = comFace(BlockId.AlavancaDesligada, face);
      expect(blockSelectionBox(desligada)).toEqual(blockSelectionBox(comEstado(desligada, true)));
    }
  });
});
