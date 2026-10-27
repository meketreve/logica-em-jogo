import { describe, expect, it } from "vitest";
import {
  type Celula,
  type MudancaDeCircuito,
  type MundoDeCircuito,
  comEstado,
  entradasDaPorta,
  estaLigado,
  isAlavanca,
  isCircuito,
  isLampada,
  isPlaca,
  ligacaoDoCondutor,
  passoDe,
  propagarSinal,
  recalcularCircuitos,
  tipoDaPorta,
} from "./circuitos";
import { BlockId } from "./blocks";

/**
 * §🔌 O motor que ANDA a partir das fontes (2026-10-26) tem de dar o MESMO
 * resultado que o ponto fixo que ele substituiu — só mais rápido. O antigo
 * mora aqui, inteiro, como RÉGUA: a comparação em circuitos sorteados é o que
 * pega uma ordem de fila que esquece de reperguntar uma porta E.
 */

const VIZINHOS = [
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
];
const chave = (x: number, y: number, z: number): string => `${x},${y},${z}`;

/** O motor de 2026-10-16 a 2026-10-25, sem mudar uma regra: ponto fixo por varredura. */
function pontoFixoDeReferencia(mundo: MundoDeCircuito, celulas: Celula[]): MudancaDeCircuito[] {
  const pecas = new Map<string, { c: Celula; id: number }>();
  for (const c of celulas) {
    const id = mundo.bloco(c.x, c.y, c.z);
    if (isCircuito(id)) pecas.set(chave(c.x, c.y, c.z), { c, id });
  }
  const energizado = new Set<string>();
  for (const [k, p] of pecas) {
    if ((isAlavanca(p.id) || isPlaca(p.id)) && estaLigado(p.id)) energizado.add(k);
  }
  const entrega = (k: string): boolean => {
    const p = pecas.get(k);
    return !!p && !isLampada(p.id) && energizado.has(k);
  };
  for (let volta = 0; volta <= pecas.size; volta++) {
    let acendeu = false;
    for (const [k, p] of pecas) {
      if (energizado.has(k) || isAlavanca(p.id) || isPlaca(p.id)) continue;
      const tipo = tipoDaPorta(p.id);
      if (tipo) {
        const entradas = entradasDaPorta(p.id).map((lado) =>
          entrega(chave(p.c.x + passoDe(lado).dx, p.c.y, p.c.z + passoDe(lado).dz)),
        );
        if (tipo === "E" ? entradas.every(Boolean) : entradas.some(Boolean)) {
          energizado.add(k);
          acendeu = true;
        }
        continue;
      }
      for (const d of VIZINHOS) {
        const v = chave(p.c.x + d.x, p.c.y + d.y, p.c.z + d.z);
        const viz = pecas.get(v);
        if (!viz || !entrega(v) || !ligacaoDoCondutor(viz.id, d.x, d.y, d.z).recebe) continue;
        energizado.add(k);
        acendeu = true;
        break;
      }
    }
    if (!acendeu) break;
  }
  const mudancas: MudancaDeCircuito[] = [];
  for (const [k, p] of pecas) {
    const alvo = comEstado(p.id, energizado.has(k));
    if (alvo !== p.id) mudancas.push({ x: p.c.x, y: p.c.y, z: p.c.z, blockId: alvo });
  }
  return mudancas;
}

/** Sorteio reprodutível (mulberry32) — falha que aparece tem de reaparecer. */
function sorteio(semente: number): () => number {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Todos os ids de peça de circuito (com os dois estados e todas as faces). */
const PECAS = Array.from({ length: 512 }, (_, i) => i).filter(isCircuito);

const ordenar = (ms: MudancaDeCircuito[]): string[] =>
  ms.map((m) => `${m.x},${m.y},${m.z}=${m.blockId}`).sort();

function mundoDe(mapa: Map<string, number>): MundoDeCircuito {
  return { bloco: (x, y, z) => mapa.get(chave(x, y, z)) ?? 0 };
}

describe("§🔌 a propagação a partir das fontes", () => {
  it("dá o MESMO resultado que o ponto fixo em 2000 circuitos sorteados", () => {
    expect(PECAS.length).toBeGreaterThan(30); // a régua cobre as faces e as portas
    let comAlgumaLuz = 0;
    for (let s = 1; s <= 2000; s++) {
      const r = sorteio(s);
      const mapa = new Map<string, number>();
      const lista: Celula[] = [];
      // 6×2×6 bem cheio: dá fio em pé, porta encostada em porta, lâmpada no meio
      for (let x = 0; x < 6; x++)
        for (let y = 0; y < 2; y++)
          for (let z = 0; z < 6; z++) {
            if (r() < 0.3) continue;
            mapa.set(chave(x, y, z), PECAS[Math.floor(r() * PECAS.length)]!);
            lista.push({ x, y, z });
          }
      // a ordem do índice do servidor é qualquer uma — embaralha
      for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [lista[i], lista[j]] = [lista[j]!, lista[i]!];
      }
      const novo = ordenar(recalcularCircuitos(mundoDe(mapa), lista));
      expect(novo, `semente ${s}`).toEqual(ordenar(pontoFixoDeReferencia(mundoDe(mapa), lista)));
      if (novo.some((m) => estaLigado(Number(m.split("=")[1])))) comAlgumaLuz++;
    }
    // CONTROLE: o sorteio não pode ser só mundo apagado (aí os dois "concordam" de graça)
    expect(comAlgumaLuz).toBeGreaterThan(1000);
  });

  it("a porta E acende quando a SEGUNDA entrada chega, venha ela por onde vier", () => {
    // as duas entradas por fios de comprimento diferente: a fila vê uma antes da outra
    const mapa = new Map<string, number>([
      [chave(0, 0, -1), BlockId.FioDesligado],
      [chave(0, 0, -2), BlockId.AlavancaLigada],
      [chave(0, 0, 1), BlockId.FioDesligado],
      [chave(0, 0, 2), BlockId.FioDesligado],
      [chave(0, 0, 3), BlockId.FioDesligado],
      [chave(0, 0, 4), BlockId.AlavancaLigada],
      [chave(0, 0, 0), BlockId.PortaEXPDesligada],
      [chave(1, 0, 0), BlockId.LampadaApagada],
    ]);
    const lista = [...mapa.keys()].map((k) => {
      const [x, y, z] = k.split(",").map(Number);
      return { x: x!, y: y!, z: z! };
    });
    const ms = recalcularCircuitos(mundoDe(mapa), lista);
    expect(ms.find((m) => m.x === 1)?.blockId).toBe(BlockId.LampadaAcesa);
    // CONTROLE NEGATIVO: uma alavanca desligada, a E fica apagada
    mapa.set(chave(0, 0, 4), BlockId.AlavancaDesligada);
    expect(recalcularCircuitos(mundoDe(mapa), lista).find((m) => m.x === 1)).toBeUndefined();
  });

  it("fio de 5000 pedaços na PIOR ordem cabe folgado num tick (era quadrático)", () => {
    // a alavanca na ponta e o índice de trás pra frente: o ponto fixo antigo
    // precisava de uma varredura inteira por pedaço — 5000 × 5000
    const mapa = new Map<string, number>([[chave(0, 0, 0), BlockId.AlavancaLigada]]);
    const lista: Celula[] = [];
    for (let x = 5000; x >= 1; x--) {
      mapa.set(chave(x, 0, 0), x === 5000 ? BlockId.LampadaApagada : BlockId.FioDesligado);
      lista.push({ x, y: 0, z: 0 });
    }
    lista.push({ x: 0, y: 0, z: 0 });
    const t0 = Date.now();
    const ms = recalcularCircuitos(mundoDe(mapa), lista);
    const gasto = Date.now() - t0;
    expect(ms).toHaveLength(5000);
    expect(ms.find((m) => m.x === 5000)?.blockId).toBe(BlockId.LampadaAcesa);
    // um tick tem 100 ms (`SERVER_TICK_RATE` 10); o ponto fixo levava 20 s aqui
    expect(gasto).toBeLessThan(50);
  });

  it("a PORTA de passagem é saída: a frente de uma porta E alimenta, a lateral não", () => {
    // porta E em (0,0,0) virada pra +x, as duas entradas ligadas por alavanca
    const base = new Map<string, number>([
      [chave(0, 0, 0), BlockId.PortaEXPDesligada],
      [chave(0, 0, -1), BlockId.AlavancaLigada],
      [chave(0, 0, 1), BlockId.AlavancaLigada],
    ]);
    const lista = [...base.keys()].map((k) => {
      const [x, y, z] = k.split(",").map(Number);
      return { x: x!, y: y!, z: z! };
    });
    const comPortaEm = (x: number, z: number) => {
      const mapa = new Map(base);
      mapa.set(chave(x, 0, z), BlockId.PortaXFechada);
      return propagarSinal(mundoDe(mapa), lista).portasComSinal;
    };
    expect(comPortaEm(1, 0)).toEqual([{ x: 1, y: 0, z: 0 }]); // na FRENTE
    expect(comPortaEm(-1, 0)).toEqual([]); // nas COSTAS
    // a porta não entra no índice e nem por isso some: a ALAVANCA encostada também conta
    expect(comPortaEm(0, -2)).toEqual([{ x: 0, y: 0, z: -2 }]);
  });
});
