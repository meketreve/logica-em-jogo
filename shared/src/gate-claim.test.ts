import { describe, expect, it } from "vitest";
// o FONTE do protocolo como string (ver `raw.d.ts`): é dele que o portão
// descobre sozinho toda mensagem nova que aponta pra uma célula
import protocolSrc from "./protocol.ts?raw";
import { BlockId } from "./blocks";
import { INV_SLOTS } from "./inventario";
import { parseServerMessage } from "./protocol";
import { GameSession } from "./session";
import { findSpawnY, setBlock } from "./world";

/**
 * §🍖 F10f — O PORTÃO DO CLAIM (pedido do usuário, 2026-08-05):
 * *"área com claim não permite qualquer interação de não autorizados, seja
 * abrir porta ou inventário"*.
 *
 * Metade disso já era verdade — porta, janela, quadro, balde e colocar/quebrar
 * passavam por `claimBloqueia` desde o cp24. O que este arquivo acrescenta é o
 * que impede a regra de FURAR DE NOVO: um portão que lê a união `ClientMessage`
 * do **próprio `protocol.ts`**, acha toda mensagem que aponta pra uma CÉLULA do
 * mundo e exige que ela esteja coberta — ou por um teste de bloqueio aqui, ou
 * por uma isenção escrita.
 *
 * Ler o fonte é feio, e é de propósito: uma lista à mão envelheceria em
 * silêncio na primeira mensagem nova, que é exatamente o buraco que o pedido do
 * usuário mandou fechar. Assim, quem inventar um `abrir_cofre` com `x/y/z`
 * derruba a suíte no mesmo commit em que o escrever.
 */

/** As mensagens que APONTAM PRA UMA CÉLULA e TÊM de passar pelo gate. */
const COM_GATE = [
  "place_block",
  "break_block",
  "use_block",
  "balde",
  "quadro_set",
  "mover_container",
] as const;

/**
 * As que têm `x` e NÃO passam pelo gate, com a razão de cada uma. É a lista que
 * o portão aceita como resposta — quem isentar uma mensagem nova tem de
 * escrever aqui POR QUE ela não precisa do claim.
 */
const SEM_GATE: ReadonlyMap<string, string> = new Map([
  [
    "move",
    "não é uma célula do mundo: é a posição do PRÓPRIO jogador. Claim protege o que a pessoa constrói, não por onde ela anda — barrar aqui seria uma cerca invisível.",
  ],
  [
    "wand_mark",
    "marca um canto na tela de quem marcou. Não lê nem escreve nada do mundo; quem cria a área de verdade é o /claim criar, que confere sobreposição.",
  ],
]);

/** Os `type` da união `ClientMessage` que carregam uma coordenada `x`. */
function tiposComCelula(): string[] {
  const src = protocolSrc;
  const inicio = src.indexOf("export type ClientMessage =");
  expect(inicio).toBeGreaterThanOrEqual(0);
  // a união vai até o PRÓXIMO `export` de primeiro nível
  const rel = src.slice(inicio + 1).search(/\nexport /);
  const uniao = src.slice(inicio, rel < 0 ? undefined : inicio + 1 + rel);
  const out: string[] = [];
  // cada variante da união começa com `  | ` — o 1º pedaço é o cabeçalho
  for (const bloco of uniao.split(/\n\s*\|\s/).slice(1)) {
    const tipo = /type:\s*"([a-z_]+)"/.exec(bloco)?.[1];
    if (!tipo) continue;
    if (!/\bx:\s*number/.test(bloco)) continue;
    out.push(tipo);
  }
  return out;
}

type Sent = { clientId: number; data: string | ArrayBuffer }[];
function collect(): { sent: Sent; send: (c: number, d: string | ArrayBuffer) => void } {
  const sent: Sent = [];
  return { sent, send: (clientId, data) => sent.push({ clientId, data }) };
}
const join = (name: string, pin?: string, codigo?: string) =>
  JSON.stringify({ type: "join", name, pin, codigo });
const cmd = (text: string) => JSON.stringify({ type: "chat", text });
const mark = (corner: 1 | 2, x: number, y: number, z: number) =>
  JSON.stringify({ type: "wand_mark", corner, x, y, z });
const move = (c: { x: number; y: number; z: number }) =>
  JSON.stringify({ type: "move", ...c, yaw: 0, pitch: 0 });

/** Cópia dos bytes do mundo inteiro — o invariante de "nada mudou". */
function retrato(session: GameSession): string {
  return session.world.chunks.map((c) => (c ? c.join(",") : "-")).join("|");
}

/**
 * Mundo com professor (1), ana (2) e bia (3); proteção LIGADA e uma área da
 * ana ao redor do spawn. A bia é a estranha — o não-autorizado do pedido.
 */
function turmaComClaimDaAna(confinar = false) {
  const { sent, send } = collect();
  const session = new GameSession(send, { dims: { x: 2, z: 2, y: 2 }, seed: 5, codigo: "sala" });
  session.handleMessage(1, join("prof", "4321", "sala"));
  session.handleMessage(2, join("ana", "1111"));
  session.handleMessage(3, join("bia", "2222"));
  const w = session.world;
  const sx = Math.floor(w.sizeX / 2);
  const sz = Math.floor(w.sizeZ / 2);
  const h = findSpawnY(w, sx, sz);
  session.handleMessage(1, cmd("/claim ligar"));
  session.handleMessage(2, mark(1, sx - 3, h - 1, sz - 3));
  session.handleMessage(2, mark(2, sx + 3, h + 3, sz + 3));
  session.handleMessage(2, cmd("/claim criar casa"));
  if (confinar) session.handleMessage(1, cmd("/confinar ligar"));
  // a bia está no spawn, com a área da ana ao alcance da mão
  session.handleMessage(3, move({ x: sx + 0.5, y: h, z: sz + 0.5 }));
  return { sent, session, sx, sz, h };
}

/** Uma mensagem de cada tipo apontando pra `cel`, no formato que o parse aceita. */
function mensagemPara(tipo: string, cel: { x: number; y: number; z: number }): string {
  switch (tipo) {
    case "place_block":
      return JSON.stringify({ type: "place_block", ...cel, blockId: BlockId.Cobblestone });
    case "break_block":
      return JSON.stringify({ type: "break_block", ...cel });
    case "use_block":
      return JSON.stringify({ type: "use_block", ...cel });
    case "balde":
      return JSON.stringify({ type: "balde", ...cel, encher: false });
    case "quadro_set":
      return JSON.stringify({ type: "quadro_set", ...cel, texto: "invadi" });
    case "mover_container":
      return JSON.stringify({ type: "mover_container", ...cel, de: 0, para: INV_SLOTS });
    default:
      throw new Error(`sem mensagem de teste pra ${tipo}`);
  }
}

describe("§🍖 F10f — o PORTÃO do claim (o pedido do usuário virou teste)", () => {
  it("toda mensagem de cliente com célula está coberta: ou tem gate, ou tem razão escrita", () => {
    const tipos = tiposComCelula();
    // sanidade: se o parse do fonte quebrar, o portão viraria um teste vazio
    expect(tipos.length).toBeGreaterThanOrEqual(COM_GATE.length + SEM_GATE.size);
    const descobertos = tipos.filter(
      (t) => !COM_GATE.includes(t as (typeof COM_GATE)[number]) && !SEM_GATE.has(t),
    );
    expect(descobertos).toEqual([]);
    // e a isenção não mente: toda razão está de fato escrita
    for (const [, razao] of SEM_GATE) expect(razao.length).toBeGreaterThan(20);
  });

  it("NENHUMA delas muda o mundo da ana na mão de uma estranha", () => {
    for (const tipo of COM_GATE) {
      const { session, sx, sz, h } = turmaComClaimDaAna();
      // uma célula da área da ana com cada coisa que as mensagens querem tocar
      const cel = { x: sx + 1, y: h, z: sz + 1 };
      setBlock(session.world, cel.x, cel.y, cel.z, BlockId.PortaXFechada);
      setBlock(session.world, cel.x + 1, cel.y, cel.z, BlockId.QuadroXP);
      setBlock(session.world, cel.x, cel.y + 1, cel.z, BlockId.Bau);
      const antes = retrato(session);
      session.handleMessage(3, mensagemPara(tipo, cel));
      session.handleMessage(3, mensagemPara(tipo, { ...cel, x: cel.x + 1 }));
      session.handleMessage(3, mensagemPara(tipo, { ...cel, y: cel.y + 1 }));
      session.tick();
      expect(retrato(session), `${tipo} mexeu no mundo da ana`).toBe(antes);
    }
  });

  it("§🍖 F10: abrir CONTAINER alheio nem responde — ler o baú é pior que mexer nele", () => {
    const { session, sent, sx, sz, h } = turmaComClaimDaAna();
    const bau = { x: sx + 1, y: h + 1, z: sz + 1 };
    setBlock(session.world, bau.x, bau.y, bau.z, BlockId.Bau);
    // a dona guarda uma coisa lá dentro
    session.handleMessage(1, cmd("/modo sobrevivencia all"));
    session.handleMessage(1, cmd(`/dar ana ${BlockId.Cobblestone} 5`));
    session.handleMessage(2, JSON.stringify({ type: "use_block", ...bau }));
    session.handleMessage(
      2,
      JSON.stringify({ type: "mover_container", ...bau, de: 0, para: INV_SLOTS }),
    );
    // a estranha tenta abrir: recebe AVISO, e nenhum conteúdo
    const marca = sent.length;
    session.handleMessage(3, JSON.stringify({ type: "use_block", ...bau }));
    const daBia = sent
      .slice(marca)
      .filter((s) => s.clientId === 3)
      .map((s) => parseServerMessage(s.data as string));
    expect(daBia.some((m) => m?.type === "container")).toBe(false);
    const aviso = daBia.find((m) => m?.type === "chat");
    expect(aviso).toBeDefined();
    expect((aviso as { text: string }).text.toLowerCase()).toContain("ana");
  });

  it("a DONA abre o próprio baú normalmente (o portão barra estranho, não todo mundo)", () => {
    // controle POSITIVO: sem ele, um gate que barrasse TODO MUNDO passaria
    const { session, sent, sx, sz, h } = turmaComClaimDaAna();
    const bau = { x: sx + 1, y: h + 1, z: sz + 1 };
    setBlock(session.world, bau.x, bau.y, bau.z, BlockId.Bau);
    const marca = sent.length;
    session.handleMessage(2, JSON.stringify({ type: "use_block", ...bau }));
    const daAna = sent
      .slice(marca)
      .filter((s) => s.clientId === 2)
      .map((s) => parseServerMessage(s.data as string));
    expect(daAna.some((m) => m?.type === "container")).toBe(true);
  });

  it("CONFINAMENTO barra interação também (decisão do usuário, 2026-08-05)", () => {
    // o confinamento é o INVERSO do claim: prende o aluno na área do grupo
    // dele. Sem grupo, tudo é "fora da minha área" — nem a porta ele abre.
    const { session, sent, sx, sz, h } = turmaComClaimDaAna(true);
    const porta = { x: sx - 1, y: h, z: sz - 1 };
    setBlock(session.world, porta.x, porta.y, porta.z, BlockId.PortaXFechada);
    const antes = retrato(session);
    const marca = sent.length;
    session.handleMessage(3, JSON.stringify({ type: "use_block", ...porta }));
    expect(retrato(session)).toBe(antes); // a porta não abriu
    const aviso = sent
      .slice(marca)
      .filter((s) => s.clientId === 3)
      .map((s) => parseServerMessage(s.data as string))
      .find((m) => m?.type === "chat");
    expect(aviso).toBeDefined();
  });
});
