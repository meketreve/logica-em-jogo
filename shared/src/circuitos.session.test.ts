import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { estaLigado } from "./circuitos";
import { GameSession } from "./session";
import { decodeSave, encodeSave } from "./save";
import { getBlock, setBlock } from "./world";

/**
 * §🔌 O CIRCUITO PELO FIO. O `circuitos.test.ts` prova a conta pura; aqui é o
 * que só a session responde: que o clique direito na alavanca troca o byte,
 * que o motor roda NO TICK (e não no clique), que a rede recebe cada mudança,
 * que circuito parado custa zero, que a peça só entra no terreno do próprio
 * aluno e que o índice volta inteiro depois do save.
 */

const DIMS = { x: 2, z: 2, y: 2 };

function sala(opts: { claims?: boolean } = {}) {
  const sent: { id: number; data: string }[] = [];
  const session = new GameSession(
    (id, data) => {
      if (typeof data === "string") sent.push({ id, data });
    },
    { dims: DIMS, seed: 5, flat: true, codigo: "prof42" },
  );
  const send = (id: number, msg: unknown): void => session.handleMessage(id, JSON.stringify(msg));
  send(1, { type: "join", name: "prof", pin: "1111", codigo: "prof42" });
  send(2, { type: "join", name: "ana", pin: "2222" });
  // os dois pertinho do circuito, senão o `withinReach` recusa o clique
  send(1, { type: "move", x: 4.5, y: 5, z: 4.5, yaw: 0, pitch: 0 });
  send(2, { type: "move", x: 4.5, y: 5, z: 4.5, yaw: 0, pitch: 0 });
  if (opts.claims) session.handleMessage(1, JSON.stringify({ type: "chat", text: "/terreno ligar" }));
  const bloco = (x: number, y: number, z: number): number => getBlock(session.world, x, y, z);
  const por = (x: number, y: number, z: number, id: number): void => {
    setBlock(session.world, x, y, z, id);
    session.applyBlockQuieto(x, y, z, id); // entra pelo mesmo caminho do jogo (índice!)
  };
  /** As mensagens `block_changed` que saíram desde a última chamada. */
  let lidas = 0;
  const trocasNaRede = (): { x: number; y: number; z: number; blockId: number }[] => {
    const novas = sent.slice(lidas);
    lidas = sent.length;
    return novas
      .map((s) => JSON.parse(s.data) as Record<string, unknown>)
      .filter((m) => m["type"] === "block_changed")
      .map((m) => ({
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        blockId: m["blockId"] as number,
      }));
  };
  const ultimaFala = (id: number): string => {
    const falas = sent
      .filter((s) => s.id === id)
      .map((s) => JSON.parse(s.data) as Record<string, unknown>)
      .filter((m) => m["type"] === "chat");
    return (falas.at(-1)?.["text"] as string) ?? "";
  };
  return { session, send, bloco, por, trocasNaRede, ultimaFala };
}

describe("a alavanca acende a lâmpada pelo fio", () => {
  it("o clique troca o byte, e é o TICK que acende o resto", () => {
    const s = sala();
    s.por(4, 4, 4, BlockId.AlavancaDesligada);
    s.por(5, 4, 4, BlockId.FioDesligado);
    s.por(6, 4, 4, BlockId.LampadaApagada);
    s.send(2, { type: "use_block", x: 4, y: 4, z: 4 });
    // o clique só muda a ALAVANCA: o motor é do tick, senão colocar um fio
    // custaria uma varredura por bloco colocado
    expect(s.bloco(4, 4, 4)).toBe(BlockId.AlavancaLigada);
    expect(s.bloco(6, 4, 4)).toBe(BlockId.LampadaApagada);
    s.session.tick();
    expect(s.bloco(5, 4, 4)).toBe(BlockId.FioLigado);
    expect(s.bloco(6, 4, 4)).toBe(BlockId.LampadaAcesa);
  });

  it("e a rede recebe cada peça que mudou (o cliente não adivinha nada)", () => {
    const s = sala();
    s.por(4, 4, 4, BlockId.AlavancaDesligada);
    s.por(5, 4, 4, BlockId.LampadaApagada);
    s.send(2, { type: "use_block", x: 4, y: 4, z: 4 });
    s.trocasNaRede();
    s.session.tick();
    expect(s.trocasNaRede()).toContainEqual({
      x: 5,
      y: 4,
      z: 4,
      blockId: BlockId.LampadaAcesa,
    });
  });

  it("CONTROLE NEGATIVO: circuito parado não gera mudança nenhuma por tick", () => {
    // é o que mantém o custo em zero na aula inteira — o motor só roda quando
    // alguma peça mudou
    const s = sala();
    s.por(4, 4, 4, BlockId.AlavancaDesligada);
    s.por(5, 4, 4, BlockId.LampadaApagada);
    s.session.tick(); // estabiliza
    s.trocasNaRede();
    for (let i = 0; i < 5; i++) s.session.tick();
    expect(s.trocasNaRede()).toEqual([]);
  });

  it("quebrar o fio no meio APAGA a ponta", () => {
    const s = sala();
    s.por(4, 4, 4, BlockId.AlavancaLigada);
    s.por(5, 4, 4, BlockId.FioDesligado);
    s.por(6, 4, 4, BlockId.LampadaApagada);
    s.session.tick();
    expect(s.bloco(6, 4, 4)).toBe(BlockId.LampadaAcesa);
    s.por(5, 4, 4, BlockId.Air); // o fio foi embora
    s.session.tick();
    expect(s.bloco(6, 4, 4)).toBe(BlockId.LampadaApagada);
  });

  it("clicar na alavanca do COLEGA é barrado como mexer na porta dele", () => {
    const s = sala({ claims: true });
    // bia (aluna) reserva a área com a varinha e vira dona; pra ana é terreno
    // alheio. ⚠️ o professor NÃO serve de dono aqui: ele passa em todo gate, e
    // o teste "passaria" sem gate nenhum (o controle negativo logo abaixo).
    s.send(3, { type: "join", name: "bia", pin: "3333" });
    s.send(3, { type: "move", x: 4.5, y: 5, z: 4.5, yaw: 0, pitch: 0 });
    s.send(3, { type: "wand_mark", corner: 1, x: 3, y: 3, z: 3 });
    s.send(3, { type: "wand_mark", corner: 2, x: 7, y: 6, z: 7 });
    s.send(3, { type: "chat", text: "/terreno criar casa" });
    s.por(4, 4, 4, BlockId.AlavancaDesligada);
    s.send(2, { type: "use_block", x: 4, y: 4, z: 4 });
    expect(estaLigado(s.bloco(4, 4, 4))).toBe(false);
    expect(s.ultimaFala(2)).toContain("protegida por bia");
    // CONTROLE NEGATIVO: a DONA aciona a dela sem problema
    s.send(3, { type: "use_block", x: 4, y: 4, z: 4 });
    expect(estaLigado(s.bloco(4, 4, 4))).toBe(true);
  });
});

describe("onde o aluno pode colocar circuito (decisão do usuário)", () => {
  it("com a proteção LIGADA e sem terreno seu, o servidor recusa e EXPLICA", () => {
    const s = sala({ claims: true });
    s.send(2, { type: "place_block", x: 4, y: 4, z: 4, blockId: BlockId.FioDesligado });
    expect(s.bloco(4, 4, 4)).not.toBe(BlockId.FioDesligado);
    expect(s.ultimaFala(2)).toContain("SEU terreno");
  });

  it("com a proteção DESLIGADA é livre — não existe terreno pra exigir", () => {
    const s = sala();
    s.send(2, { type: "place_block", x: 4, y: 4, z: 4, blockId: BlockId.FioDesligado });
    expect(s.bloco(4, 4, 4)).toBe(BlockId.FioDesligado);
  });

  it("o professor monta onde quiser (é ele que prepara a aula)", () => {
    const s = sala({ claims: true });
    s.send(1, { type: "place_block", x: 4, y: 4, z: 4, blockId: BlockId.FioDesligado });
    expect(s.bloco(4, 4, 4)).toBe(BlockId.FioDesligado);
  });

  it("CONTROLE NEGATIVO: bloco comum segue livre com a proteção ligada", () => {
    // a regra é só do circuito; se ela vazasse pros outros blocos, o aluno
    // ficaria sem construir nada em mundo aberto
    const s = sala({ claims: true });
    s.send(2, { type: "place_block", x: 4, y: 4, z: 4, blockId: BlockId.Planks });
    expect(s.bloco(4, 4, 4)).toBe(BlockId.Planks);
  });
});

describe("o circuito sobrevive ao save", () => {
  it("mundo que volta do arquivo reindexa as peças e volta a calcular", () => {
    const s = sala();
    s.por(4, 4, 4, BlockId.AlavancaLigada);
    s.por(5, 4, 4, BlockId.FioDesligado);
    s.por(6, 4, 4, BlockId.LampadaApagada);
    s.session.tick();
    expect(s.bloco(6, 4, 4)).toBe(BlockId.LampadaAcesa);

    const buf = encodeSave(s.session.world, s.session.toSave());
    const d = decodeSave(buf);
    const nova = new GameSession(() => {}, { restore: d, codigo: "prof42" });
    // a lâmpada volta acesa do arquivo…
    expect(getBlock(nova.world, 6, 4, 4)).toBe(BlockId.LampadaAcesa);
    // …e o índice voltou junto: desligar a alavanca no mundo novo apaga tudo
    nova.applyBlock(4, 4, 4, BlockId.AlavancaDesligada);
    nova.tick();
    expect(getBlock(nova.world, 6, 4, 4)).toBe(BlockId.LampadaApagada);
    expect(getBlock(nova.world, 5, 4, 4)).toBe(BlockId.FioDesligado);
  });
});
