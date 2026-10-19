import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { parseObjective } from "./scenario";
import { GameSession } from "./session";
import { getBlock, setBlock } from "./world";

/**
 * §🔌 O OBJETIVO QUE CHECA O CIRCUITO (2026-10-19).
 *
 * A metade que faltava do pedido de 16/10: o professor monta o desafio e o
 * SERVIDOR confere sozinho. O que estes testes fixam é a diferença entre
 * "a lâmpada está acesa" e "a lâmpada está acesa COM A COMBINAÇÃO CERTA" —
 * sem a segunda parte, colar uma alavanca na lâmpada ganharia o desafio.
 */

const DIMS = { x: 2, z: 2, y: 2 };

function aula() {
  const sent: { id: number; data: string }[] = [];
  const session = new GameSession(
    (id, data) => {
      if (typeof data === "string") sent.push({ id, data });
    },
    { dims: DIMS, seed: 7, flat: true, codigo: "prof42" },
  );
  const send = (id: number, msg: unknown): void => session.handleMessage(id, JSON.stringify(msg));
  send(1, { type: "join", name: "prof", pin: "1111", codigo: "prof42" });
  send(2, { type: "join", name: "ana", pin: "2222" });
  send(1, { type: "move", x: 4.5, y: 5, z: 4.5, yaw: 0, pitch: 0 });
  send(2, { type: "move", x: 4.5, y: 5, z: 4.5, yaw: 0, pitch: 0 });
  const por = (x: number, y: number, z: number, id: number): void => {
    setBlock(session.world, x, y, z, id);
    session.applyBlockQuieto(x, y, z, id); // pelo mesmo caminho do jogo (índice!)
  };
  const bloco = (x: number, y: number, z: number): number => getBlock(session.world, x, y, z);
  /** A resposta do servidor ao último comando do professor. */
  const resposta = (): string => {
    const falas = sent
      .filter((s) => s.id === 1)
      .map((s) => JSON.parse(s.data) as Record<string, unknown>)
      .filter((m) => m["type"] === "chat");
    return (falas.at(-1)?.["text"] as string) ?? "";
  };
  const prof = (text: string): string => {
    send(1, { type: "chat", text });
    return resposta();
  };
  const objetivo = () => session.scenario.objetivos[0];
  const estado = () => {
    const raw = sent
      .map((s) => JSON.parse(s.data) as Record<string, unknown>)
      .filter((m) => m["type"] === "objectives")
      .at(-1);
    return (raw?.["objetivos"] as Record<string, unknown>[] | undefined)?.[0];
  };
  const completo = (): boolean => session.scenario.completos.has(objetivo()?.id ?? -1);
  /** Tudo o que o servidor FALOU pra ana (o chat que o aluno lê). */
  const falasDoServidor = (): string[] =>
    sent
      .filter((x) => x.id === 2)
      .map((x) => JSON.parse(x.data) as Record<string, unknown>)
      .filter((m) => m["type"] === "chat")
      .map((m) => m["text"] as string);
  return { session, send, por, bloco, prof, objetivo, estado, completo, falasDoServidor };
}

/** O desafio padrão: duas alavancas → porta E → lâmpada, tudo desligado. */
function montarPortaE(s: ReturnType<typeof aula>): void {
  // a porta E aponta pra XP; as entradas são os lados em Z
  s.por(5, 4, 3, BlockId.AlavancaDesligada);
  s.por(5, 4, 5, BlockId.AlavancaDesligada);
  s.por(5, 4, 4, BlockId.PortaEXPDesligada);
  s.por(6, 4, 4, BlockId.LampadaApagada);
  s.session.tick(); // estabiliza antes de fotografar
}

describe("/objetivo add acender", () => {
  it("recusa área SEM lâmpada (não haveria o que acender)", () => {
    const s = aula();
    s.por(4, 4, 4, BlockId.AlavancaDesligada);
    s.prof("/regiao criar mesa 3 4 3 7 4 5");
    const r = s.prof("/objetivo add acender mesa Acenda a lampada");
    expect(r).toContain("Não há lâmpada");
    expect(s.session.scenario.objetivos).toHaveLength(0);
  });

  it("recusa área com a lâmpada JÁ ACESA (nasceria concluído)", () => {
    const s = aula();
    s.por(4, 4, 4, BlockId.AlavancaLigada);
    s.por(5, 4, 4, BlockId.LampadaApagada);
    s.session.tick(); // o motor acende
    expect(s.bloco(5, 4, 4)).toBe(BlockId.LampadaAcesa);
    s.prof("/regiao criar mesa 3 4 3 7 4 5");
    expect(s.prof("/objetivo add acender mesa Acenda a lampada")).toContain("já estão ACESAS");
    expect(s.session.scenario.objetivos).toHaveLength(0);
  });

  it("cria com a foto do circuito e conta as lâmpadas", () => {
    const s = aula();
    montarPortaE(s);
    s.prof("/regiao criar mesa 3 4 3 7 4 5");
    const r = s.prof("/objetivo add acender mesa Acenda a lampada");
    expect(r).toContain("Objetivo #1 criado: acender");
    expect(r).toContain("1 lâmpada(s)");
    expect(r).toContain("só as ALAVANCAS podem mudar");
    // a foto é o que o objetivo CONFERE, então ela tem de existir e cobrir a área
    expect(s.objetivo()?.baseline?.[0]).toHaveLength(5 * 1 * 3);
  });
});

describe("a conclusão exige a COMBINAÇÃO certa", () => {
  it("UMA alavanca não fecha; as DUAS fecham", () => {
    const s = aula();
    montarPortaE(s);
    s.prof("/regiao criar mesa 3 4 3 7 4 5");
    s.prof("/objetivo add acender mesa Acenda a lampada");

    // uma alavanca só: a porta E não passa sinal, a lâmpada fica apagada
    s.send(2, { type: "use_block", x: 5, y: 4, z: 3 });
    s.session.tick();
    expect(s.bloco(6, 4, 4)).toBe(BlockId.LampadaApagada);
    expect(s.completo()).toBe(false);
    expect(s.estado()?.["atual"]).toBe(0);
    expect(s.estado()?.["total"]).toBe(1);

    // a segunda alavanca: acende e o objetivo FECHA sozinho, no mesmo tick
    s.send(2, { type: "use_block", x: 5, y: 4, z: 5 });
    s.session.tick();
    expect(s.bloco(6, 4, 4)).toBe(BlockId.LampadaAcesa);
    expect(s.completo()).toBe(true);
  });

  it("acender REWIRANDO não vale: alavanca colada na lâmpada é peça fora do lugar", () => {
    const s = aula();
    montarPortaE(s);
    s.prof("/regiao criar mesa 3 4 3 7 4 5");
    s.prof("/objetivo add acender mesa Acenda a lampada");

    // o atalho: uma alavanca LIGADA encostada na lâmpada, sem resolver a porta E
    s.por(7, 4, 4, BlockId.AlavancaLigada);
    s.session.tick();
    expect(s.bloco(6, 4, 4)).toBe(BlockId.LampadaAcesa); // a lâmpada ACENDEU…
    expect(s.completo()).toBe(false); // …e o objetivo NÃO fechou
    expect(s.estado()?.["atual"]).toBe(1); // 1 de 1 acesa
    expect(s.estado()?.["extras"]).toBe(1); // mas 1 peça fora do lugar

    // desfazendo o atalho (e resolvendo de verdade), fecha
    s.por(7, 4, 4, BlockId.Air);
    s.send(2, { type: "use_block", x: 5, y: 4, z: 3 });
    s.send(2, { type: "use_block", x: 5, y: 4, z: 5 });
    s.session.tick();
    expect(s.completo()).toBe(true);
  });

  it("tirar a lâmpada não fecha o objetivo em 0/0", () => {
    const s = aula();
    montarPortaE(s);
    s.prof("/regiao criar mesa 3 4 3 7 4 5");
    s.prof("/objetivo add acender mesa Acenda a lampada");
    s.por(6, 4, 4, BlockId.Air); // sem lâmpada, "todas acesas" seria vacuamente verdade
    s.session.tick();
    expect(s.completo()).toBe(false);
    expect(s.estado()?.["total"]).toBe(1); // o alvo vem da FOTO, não do mundo
    expect(s.estado()?.["extras"]).toBe(1);
  });

  it("CONTROLE NEGATIVO: mexer na alavanca NÃO conta como mexer no circuito", () => {
    const s = aula();
    montarPortaE(s);
    s.prof("/regiao criar mesa 3 4 3 7 4 5");
    s.prof("/objetivo add acender mesa Acenda a lampada");
    s.send(2, { type: "use_block", x: 5, y: 4, z: 3 });
    s.session.tick();
    // estado de peça (ligado/desligado) é o que o aluno TEM o direito de mudar
    expect(s.estado()?.["extras"]).toBe(0);
  });
});

describe("o anúncio no chat", () => {
  it("sai UMA vez, sem o prefixo duplicado (visto no print da sonda)", () => {
    const s = aula();
    montarPortaE(s);
    s.prof("/regiao criar mesa 3 4 3 7 4 5");
    s.prof("/objetivo add acender mesa Acenda a lampada");
    s.send(2, { type: "use_block", x: 5, y: 4, z: 3 });
    s.send(2, { type: "use_block", x: 5, y: 4, z: 5 });
    s.session.tick();
    const anuncio = s.falasDoServidor().filter((t) => t.includes("Acenda a lampada"));
    expect(anuncio).toEqual(["objetivo concluído: Acenda a lampada"]);
  });
});

describe("reiniciar devolve o desafio", () => {
  it("/objetivo resetar desliga as alavancas e apaga a lâmpada", () => {
    const s = aula();
    montarPortaE(s);
    s.prof("/regiao criar mesa 3 4 3 7 4 5");
    s.prof("/objetivo add acender mesa Acenda a lampada");
    s.send(2, { type: "use_block", x: 5, y: 4, z: 3 });
    s.send(2, { type: "use_block", x: 5, y: 4, z: 5 });
    s.session.tick();
    expect(s.completo()).toBe(true);

    s.prof("/objetivo resetar");
    s.session.tick();
    expect(s.bloco(5, 4, 3)).toBe(BlockId.AlavancaDesligada);
    expect(s.bloco(5, 4, 5)).toBe(BlockId.AlavancaDesligada);
    expect(s.bloco(6, 4, 4)).toBe(BlockId.LampadaApagada);
    expect(s.completo()).toBe(false);
  });
});

describe("per-grupo: cada grupo tem o SEU circuito e o seu progresso", () => {
  it("o grupo 1 fecha o dele sem fechar o do grupo 2", () => {
    const s = aula();
    // dois desafios idênticos em áreas diferentes, um por grupo. Cada área tem
    // a SUA foto (é por isso que o acender confere contra `baseline[k]` e não
    // contra um gabarito único como o construir: assim o professor não precisa
    // alinhar as peças célula a célula entre os terrenos).
    for (const [x, z] of [
      [5, 4],
      [20, 20],
    ] as const) {
      s.por(x, 4, z - 1, BlockId.AlavancaDesligada);
      s.por(x, 4, z + 1, BlockId.AlavancaDesligada);
      s.por(x, 4, z, BlockId.PortaEXPDesligada);
      s.por(x + 1, 4, z, BlockId.LampadaApagada);
    }
    s.session.tick();
    s.send(3, { type: "join", name: "bia", pin: "3333" });
    s.prof("/grupo criar 2"); // ana → g1, bia → g2
    s.prof("/regiao criar mesa-1 4 4 3 7 4 5");
    s.prof("/regiao criar mesa-2 19 4 19 22 4 21");
    expect(s.prof("/objetivo add acender mesa Acenda a lampada")).toContain("acender");

    // o grupo 1 resolve o desafio DELE (o professor liga, o gate de terreno
    // está desligado neste mundo — o que se mede aqui é o escopo do objetivo)
    s.por(5, 4, 3, BlockId.AlavancaLigada);
    s.por(5, 4, 5, BlockId.AlavancaLigada);
    s.session.tick();
    const porGrupo = s.estado()?.["porGrupo"] as Record<string, unknown>[];
    expect(porGrupo).toHaveLength(2);
    expect(porGrupo[0]?.["completo"]).toBe(true);
    expect(porGrupo[1]?.["completo"]).toBe(false);
    expect(porGrupo[1]?.["atual"]).toBe(0);
    expect(porGrupo[1]?.["total"]).toBe(1); // a foto da área 2, não a da 1
    expect(s.estado()?.["completo"]).toBe(false); // só com os DOIS
  });
});

describe("o save não aceita acender sem foto", () => {
  const base = {
    id: 1,
    kind: "acender",
    regiao: "mesa",
    texto: "Acenda",
    min: { x: 0, y: 0, z: 0 },
    max: { x: 1, y: 0, z: 0 },
  };
  it("sem baseline o objetivo é descartado (a verificação dependeria dele)", () => {
    expect(parseObjective(base)).toBeNull();
    expect(parseObjective({ ...base, baseline: [[1]] })).toBeNull(); // tamanho errado
  });
  it("com baseline do tamanho da área, passa", () => {
    const o = parseObjective({ ...base, baseline: [[BlockId.LampadaApagada, BlockId.Air]] });
    expect(o?.kind).toBe("acender");
    expect(o?.baseline?.[0]).toHaveLength(2);
  });
});
