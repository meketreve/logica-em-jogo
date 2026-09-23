import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_DIAMANTE,
  ITEM_GRAVETO,
  ITEM_MACHADO_DIAMANTE,
  ITEM_MACHADO_FERRO,
  ITEM_MACHADO_MADEIRA,
  ITEM_MACHADO_PEDRA,
  ITEM_PA_DIAMANTE,
  ITEM_PA_FERRO,
  ITEM_PA_MADEIRA,
  ITEM_PA_PEDRA,
  ITEM_PICARETA_DIAMANTE,
  ITEM_PICARETA_MADEIRA,
  MAX_BLOCK_ID,
  isFerramenta,
  isItem,
} from "./blocks";
import {
  DURABILIDADE,
  FERRAMENTAS,
  NIVEL_DIAMANTE,
  NIVEL_MADEIRA,
  aceleradosPor,
  durabilidadeDe,
  exigenciaDe,
  faltaFerramentaNaMao,
  ferramentaIdealDe,
  tempoDeQuebraMs,
} from "./ferramentas";
import { type Slot, tamanhoStack } from "./inventario";
import { parseServerMessage } from "./protocol";
import { segurarAteQuebrar } from "./quebraTeste";
import { RECEITAS, receitaAtiva } from "./receitas";
import { type SaveData, decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { usosDoItem } from "./usos";
import { setBlock } from "./world";

const mao = (id?: number): Slot => (id === undefined ? null : { id, qtd: 1 });

const MACHADOS = [
  ITEM_MACHADO_MADEIRA, ITEM_MACHADO_PEDRA, ITEM_MACHADO_FERRO, ITEM_MACHADO_DIAMANTE,
];
const PAS = [ITEM_PA_MADEIRA, ITEM_PA_PEDRA, ITEM_PA_FERRO, ITEM_PA_DIAMANTE];

describe("§🪓 — as 8 ferramentas novas existem como ITEM, igual às picaretas", () => {
  it("são item, são ferramenta e ocupam 1 por slot", () => {
    for (const id of [...MACHADOS, ...PAS]) {
      expect(isItem(id), `item ${id}`).toBe(true);
      expect(isFerramenta(id), `ferramenta ${id}`).toBe(true);
      expect(tamanhoStack(id)).toBe(1);
    }
  });

  it("o nome PT sai do material, e os 3 tipos do mesmo nível são irmãos", () => {
    expect(FERRAMENTAS.get(ITEM_MACHADO_PEDRA)?.nome).toBe("machado de pedra");
    expect(FERRAMENTAS.get(ITEM_PA_MADEIRA)?.nome).toBe("pá de madeira");
    expect(FERRAMENTAS.get(ITEM_MACHADO_DIAMANTE)?.nivel).toBe(NIVEL_DIAMANTE);
    expect(FERRAMENTAS.size).toBe(12);
  });

  it("a durabilidade é a do MATERIAL, não a do tipo", () => {
    expect(durabilidadeDe(ITEM_PA_PEDRA)).toBe(durabilidadeDe(ITEM_MACHADO_PEDRA));
    expect(durabilidadeDe(ITEM_PA_PEDRA)).toBe(131);
    expect(durabilidadeDe(ITEM_MACHADO_MADEIRA)).toBe(59);
    expect(durabilidadeDe(ITEM_MACHADO_DIAMANTE)).toBe(1561);
    expect(durabilidadeDe(ITEM_PA_FERRO)).toBe(250);
    expect(DURABILIDADE.size).toBe(FERRAMENTAS.size);
  });
});

describe("§🪓 — PORTÃO: eles ACELERAM, e nunca EXIGEM", () => {
  it("nenhum bloco do jogo exige machado ou pá — a aula não pode travar", () => {
    // é o teste que protege a razão (1) do cabeçalho de `ferramentas.ts`:
    // machado feito de madeira exigindo machado pra tirar madeira seria um
    // mundo onde ninguém começa.
    for (let id = 1; id <= MAX_BLOCK_ID; id++) {
      expect(exigenciaDe(id)?.tipo ?? "picareta", `bloco ${id}`).toBe("picareta");
    }
  });

  it("tronco e terra continuam saindo com a MÃO VAZIA", () => {
    for (const id of [BlockId.Log, BlockId.Planks, BlockId.Dirt, BlockId.Sand, BlockId.Bau]) {
      expect(faltaFerramentaNaMao(null, id), `bloco ${id}`).toBeNull();
    }
  });
});

describe("§🪓 — quem acelera o quê", () => {
  it("madeira é do MACHADO, o que se cava é da PÁ, pedra segue da picareta", () => {
    for (const id of [BlockId.Log, BlockId.LogIpe, BlockId.Planks, BlockId.Cerca, BlockId.Bau]) {
      expect(ferramentaIdealDe(id), `bloco ${id}`).toBe("machado");
    }
    for (const id of [
      BlockId.Dirt, BlockId.Grass, BlockId.GramaSeca, BlockId.GramaFria,
      BlockId.Sand, BlockId.Gravel, BlockId.Snow,
    ]) {
      expect(ferramentaIdealDe(id), `bloco ${id}`).toBe("pá");
    }
    expect(ferramentaIdealDe(BlockId.Stone)).toBe("picareta");
    expect(ferramentaIdealDe(BlockId.MinerioOuro)).toBe("picareta");
  });

  it("laje, escada, porta e móvel herdam do MATERIAL (tábua é machado, pedra não)", () => {
    expect(ferramentaIdealDe(BlockId.LajeTabuaBaixo)).toBe("machado");
    expect(ferramentaIdealDe(BlockId.EscadaTabuaXP)).toBe("machado");
    expect(ferramentaIdealDe(BlockId.LajePedraBaixo)).toBe("picareta");
    expect(ferramentaIdealDe(BlockId.EscadaTijoloXP)).toBe("picareta");
    expect(ferramentaIdealDe(BlockId.PortaXFechada)).toBe("machado");
    expect(ferramentaIdealDe(BlockId.Mesa)).toBe("machado");
    expect(ferramentaIdealDe(BlockId.CamaXP)).toBe("machado");
  });

  it("folha e vidro não são de ninguém — a mão nua é o tempo deles", () => {
    for (const id of [BlockId.Leaves, BlockId.FolhasIpe, BlockId.Glass, BlockId.JanelaXFechada]) {
      expect(ferramentaIdealDe(id), `bloco ${id}`).toBeNull();
    }
  });
});

describe("§🪓 — o tempo de quebra", () => {
  it("o machado acelera o tronco, e os 4 níveis são uma escada de verdade", () => {
    const tempos = MACHADOS.map((id) => tempoDeQuebraMs(BlockId.Log, mao(id)));
    expect(tempos).toEqual([...tempos].sort((a, b) => b - a));
    expect(new Set(tempos).size).toBe(4);
    expect(tempos[0]).toBeLessThan(tempoDeQuebraMs(BlockId.Log, null));
  });

  it("o tronco de mão nua custa 1,5 s — e o machado de madeira devolve o tempo de antes", () => {
    // o número que o usuário escolheu: derrubar árvore de mão nua dobrou (era
    // o padrão de 750 ms), e é o machado mais barato que repõe o que era.
    expect(tempoDeQuebraMs(BlockId.Log, null)).toBe(1500);
    expect(tempoDeQuebraMs(BlockId.Log, mao(ITEM_MACHADO_MADEIRA))).toBe(750);
  });

  it("a pá acelera a terra, e a picareta na terra continua sendo mão nua", () => {
    const naMao = tempoDeQuebraMs(BlockId.Dirt, null);
    expect(tempoDeQuebraMs(BlockId.Dirt, mao(ITEM_PA_MADEIRA))).toBeLessThan(naMao);
    expect(tempoDeQuebraMs(BlockId.Dirt, mao(ITEM_PICARETA_DIAMANTE))).toBe(naMao);
  });

  it("machado na pedra e picareta no tronco não valem nada (tipo errado)", () => {
    expect(tempoDeQuebraMs(BlockId.Stone, mao(ITEM_MACHADO_DIAMANTE))).toBe(
      tempoDeQuebraMs(BlockId.Stone, mao()),
    );
    expect(tempoDeQuebraMs(BlockId.Log, mao(ITEM_PICARETA_DIAMANTE))).toBe(
      tempoDeQuebraMs(BlockId.Log, null),
    );
  });

  it("a madeira TRABALHADA (baú, porta, móvel) tem o padrão dela, e o machado corta", () => {
    for (const id of [BlockId.Bau, BlockId.PortaXFechada, BlockId.Mesa, BlockId.Cerca]) {
      expect(tempoDeQuebraMs(id, null), `bloco ${id}`).toBe(1000);
      expect(tempoDeQuebraMs(id, mao(ITEM_MACHADO_MADEIRA)), `bloco ${id}`).toBe(500);
    }
  });
});

describe("§🪓 — as 8 receitas", () => {
  it("cada ferramenta nova tem UMA receita ativa, e o cabo é sempre 2 gravetos", () => {
    for (const id of [...MACHADOS, ...PAS]) {
      const r = RECEITAS.filter((x) => x.saida.id === id && receitaAtiva(x));
      expect(r, `receita de ${id}`).toHaveLength(1);
      expect(r[0]!.custo.some((c) => c.id === ITEM_GRAVETO && c.qtd === 2)).toBe(true);
    }
  });

  it("o machado é largo (3 do material) e a pá é a mais barata (1)", () => {
    const custo = (id: number, mat: number) =>
      RECEITAS.find((x) => x.saida.id === id && receitaAtiva(x))!.custo.find((c) => c.id === mat)!
        .qtd;
    expect(custo(ITEM_MACHADO_DIAMANTE, ITEM_DIAMANTE)).toBe(3);
    expect(custo(ITEM_PA_DIAMANTE, ITEM_DIAMANTE)).toBe(1);
  });

  it("PORTÃO: as duas de MADEIRA não cobram nada que exija ferramenta", () => {
    // o mesmo portão da picareta de madeira: se um dia alguém puser pedra no
    // custo do machado de madeira, a aula trava antes da 1ª árvore.
    for (const id of [ITEM_MACHADO_MADEIRA, ITEM_PA_MADEIRA]) {
      const r = RECEITAS.find((x) => x.saida.id === id && receitaAtiva(x))!;
      for (const c of r.custo) expect(exigenciaDe(c.id), `custo ${c.id}`).toBeNull();
    }
  });
});

describe("§🪓 — o que o tooltip tem pra dizer", () => {
  it("machado e pá não LIBERAM nada, mas têm o que ACELERAR", () => {
    for (const id of [ITEM_MACHADO_FERRO, ITEM_PA_FERRO]) {
      const uso = usosDoItem(id).find((u) => u.tipo === "ferramenta");
      expect(uso, `uso de ${id}`).toBeDefined();
      if (uso?.tipo !== "ferramenta") throw new Error("impossível");
      expect(uso.libera).toHaveLength(0);
      expect(uso.acelera.length).toBeGreaterThan(0);
    }
  });

  it("a picareta de madeira continua DIZENDO o que destrava", () => {
    const uso = usosDoItem(ITEM_PICARETA_MADEIRA).find((u) => u.tipo === "ferramenta");
    if (uso?.tipo !== "ferramenta") throw new Error("impossível");
    expect(uso.libera).toContain(BlockId.Stone);
    expect(aceleradosPor("picareta")).toHaveLength(0);
  });
});

describe("§🪓 — a exigência da picareta não mudou (regressão do F10d)", () => {
  it("a pedra continua pedindo picareta na mão, e a pá não serve", () => {
    expect(faltaFerramentaNaMao(mao(ITEM_PA_DIAMANTE), BlockId.Stone)).toMatch(
      /Pegue uma picareta de madeira/,
    );
    expect(faltaFerramentaNaMao(mao(ITEM_PICARETA_MADEIRA), BlockId.Stone)).toBeNull();
    expect(exigenciaDe(BlockId.Stone)?.nivel).toBe(NIVEL_MADEIRA);
  });
});

// ---------------------------------------------------------------------------
// Pelo FIO: a durabilidade só anda no bloco que a ferramenta acelera, e é essa
// regra (já escrita no `gastarDurabilidade`) que dá vida ao machado e à pá.
// ---------------------------------------------------------------------------

const DIMS = { x: 2, z: 2, y: 2 };
type Sent = { clientId: number; data: string | ArrayBuffer }[];

function turma() {
  const base = new GameSession(() => {}, { dims: DIMS, seed: 5, codigo: "sala" });
  const save: SaveData = decodeSave(encodeSave(base.world, base.toSave()));
  save.modo = "sobrevivencia";
  const sent: Sent = [];
  const session = new GameSession(
    (clientId, data) => sent.push({ clientId, data }),
    { restore: save, codigo: "sala" },
  );
  session.handleMessage(1, JSON.stringify({ type: "join", name: "prof", pin: "4321", codigo: "sala" }));
  session.handleMessage(2, JSON.stringify({ type: "join", name: "ana", pin: "1111" }));
  return { session, sent };
}

/** Célula ao alcance do spawn, com o bloco que o teste quer quebrar. */
function celula(session: GameSession, id: number) {
  const s = session.spawn;
  const c = { x: Math.floor(s.x) + 2, y: Math.floor(s.y), z: Math.floor(s.z) };
  setBlock(session.world, c.x, c.y, c.z, id);
  return c;
}

/** O `dano` do slot 0 na última mensagem de inventário (0 = ferramenta nova). */
function danoNoSlot0(sent: Sent): number {
  const inv = sent
    .filter((e) => e.clientId === 2)
    .map((e) => parseServerMessage(e.data as string))
    .filter((m) => m?.type === "inventario")
    .at(-1) as { slots: { slot: number; dano?: number }[] } | undefined;
  return inv?.slots.find((s) => s.slot === 0)?.dano ?? 0;
}

describe("§🪓 — a durabilidade segue o IDEAL, pelo fio", () => {
  it("o machado GASTA derrubando árvore (é onde ele serve)", () => {
    const { session, sent } = turma();
    session.handleMessage(1, JSON.stringify({ type: "chat", text: `/dar ana ${ITEM_MACHADO_MADEIRA} 1` }));
    expect(segurarAteQuebrar(session, 2, celula(session, BlockId.Log), 0)).toBe(true);
    expect(danoNoSlot0(sent)).toBe(1);
  });

  it("a pá GASTA cavando terra", () => {
    const { session, sent } = turma();
    session.handleMessage(1, JSON.stringify({ type: "chat", text: `/dar ana ${ITEM_PA_MADEIRA} 1` }));
    expect(segurarAteQuebrar(session, 2, celula(session, BlockId.Dirt), 0)).toBe(true);
    expect(danoNoSlot0(sent)).toBe(1);
  });

  it("a picareta na mão NÃO gasta derrubando árvore — ela não é a ferramenta dali", () => {
    const { session, sent } = turma();
    session.handleMessage(1, JSON.stringify({ type: "chat", text: `/dar ana ${ITEM_PICARETA_MADEIRA} 1` }));
    expect(segurarAteQuebrar(session, 2, celula(session, BlockId.Log), 0)).toBe(true);
    expect(danoNoSlot0(sent)).toBe(0);
  });
});
