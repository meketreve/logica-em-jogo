import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { parseServerMessage } from "./protocol";
import { type SaveData, decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { TICKS_POR_DANO_SUFOCAMENTO, VIDA_MAX } from "./sobrevivencia";
import { findSpawnY, getBlock, setBlock } from "./world";

/**
 * `/invisivel` (2026-08-22) — o professor some do corpo dos ALUNOS para
 * observar a turma trabalhando sem virar atração.
 *
 * O que estes testes protegem, e por quê: a decisão que define a feature é que
 * a filtragem é do SERVIDOR, por cliente. Se o cliente é que escondesse, a
 * posição do professor continuaria viajando no fio e um aluno curioso a leria
 * no devtools. Então o que se prova aqui é a AUSÊNCIA da mensagem no destino
 * errado — nunca "o cliente não desenhou".
 */

const DIMS = { x: 2, z: 2, y: 2 };

type Sent = { clientId: number; data: string | ArrayBuffer }[];
function collect(): { sent: Sent; send: (c: number, d: string | ArrayBuffer) => void } {
  const sent: Sent = [];
  return { sent, send: (clientId, data) => sent.push({ clientId, data }) };
}
const join = (name: string, pin?: string, codigo?: string) =>
  JSON.stringify({ type: "join", name, pin, codigo });
const cmd = (text: string) => JSON.stringify({ type: "chat", text });

function baseSave(): SaveData {
  const { send } = collect();
  const s0 = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
  return decodeSave(encodeSave(s0.world, s0.toSave()));
}

/** prof(1) professor + ana(2) e bia(3) alunas. `bia` é o par de controle. */
function turma(save: SaveData = baseSave()) {
  const { sent, send } = collect();
  const session = new GameSession(send, { restore: save, codigo: "sala" });
  session.handleMessage(1, join("prof", "4321", "sala"));
  session.handleMessage(2, join("ana", "1111"));
  session.handleMessage(3, join("bia", "2222"));
  return { session, sent };
}

// bug-650: `move` só vira `players_moved` no FLUSH do tick — o `tick()` aqui
// fecha o lote, senão `posesRecebidas` nunca veria nada (ainda em `posesDirty`).
function mover(session: GameSession, clientId: number, x: number, y: number, z: number): void {
  session.handleMessage(clientId, JSON.stringify({ type: "move", x, y, z, yaw: 0, pitch: 0 }));
  session.tick();
}

/** Todas as poses do jogador `de` que chegaram no cliente `para` — do
 *  `player_moved` (raro: join/dormir/toggle) e de dentro de QUALQUER
 *  `players_moved` (lote do `move` no tick, bug-650). */
function posesRecebidas(sent: Sent, para: number, de: number) {
  const out: { x: number; y: number; z: number }[] = [];
  for (const s of sent) {
    if (s.clientId !== para) continue;
    const m = parseServerMessage(s.data as string);
    if (m?.type === "player_moved" && m.id === de) out.push({ x: m.x, y: m.y, z: m.z });
    if (m?.type === "players_moved") {
      for (const mv of m.moves) if (mv.id === de) out.push({ x: mv.x, y: mv.y, z: mv.z });
    }
  }
  return out;
}

/** Os `player_left` do jogador `de` que chegaram no cliente `para`. */
function saidasRecebidas(sent: Sent, para: number, de: number): number {
  let n = 0;
  for (const s of sent) {
    if (s.clientId !== para) continue;
    const m = parseServerMessage(s.data as string);
    if (m?.type === "player_left" && m.id === de) n++;
  }
  return n;
}

function ultimaChat(sent: Sent, clientId: number): string | null {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "chat") return m.text;
  }
  return null;
}

function ultimoInvisivel(sent: Sent, clientId: number) {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "invisivel") return m;
  }
  return null;
}

/** Quantos `teleport` chegaram no cliente (o resgate do soterramento manda um). */
function teleportesRecebidos(sent: Sent, clientId: number): number {
  let n = 0;
  for (const s of sent) {
    if (s.clientId !== clientId) continue;
    const m = parseServerMessage(s.data as string);
    if (m?.type === "teleport") n++;
  }
  return n;
}

function ultimaVida(sent: Sent, clientId: number) {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "vida") return m;
  }
  return null;
}

describe("/invisivel — protocolo", () => {
  it("`invisivel` só passa com o flag booleano (parse defensivo)", () => {
    expect(parseServerMessage('{"type":"invisivel","ativo":true}')).toEqual({
      type: "invisivel",
      ativo: true,
    });
    expect(parseServerMessage('{"type":"invisivel","ativo":false}')).toEqual({
      type: "invisivel",
      ativo: false,
    });
    for (const lixo of ['{"type":"invisivel"}', '{"type":"invisivel","ativo":"sim"}']) {
      expect(parseServerMessage(lixo)).toBeNull();
    }
  });
});

describe("/invisivel — quem pode", () => {
  it("aluno é recusado com a frase própria, não com 'Comando desconhecido'", () => {
    const { session, sent } = turma();
    session.handleMessage(2, cmd("/invisivel"));
    const resposta = ultimaChat(sent, 2) ?? "";
    expect(resposta).toContain("Somente o professor");
    expect(resposta).not.toContain("Comando desconhecido");
    // e o aluno NÃO ficou invisível: a pose dele continua chegando na colega
    sent.length = 0;
    mover(session, 2, 1, 40, 1);
    expect(posesRecebidas(sent, 3, 2)).toHaveLength(1);
  });

  it("o professor alterna, e o próprio cliente é avisado nos dois sentidos", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/invisivel"));
    expect(ultimoInvisivel(sent, 1)).toEqual({ type: "invisivel", ativo: true });
    expect(ultimaChat(sent, 1) ?? "").toContain("invisível");
    session.handleMessage(1, cmd("/invisivel"));
    expect(ultimoInvisivel(sent, 1)).toEqual({ type: "invisivel", ativo: false });
    expect(ultimaChat(sent, 1) ?? "").toContain("visível");
  });
});

describe("/invisivel — a pose some no SERVIDOR", () => {
  it("o move do invisível não chega no aluno, e chega no outro professor", () => {
    const { session, sent } = turma();
    session.handleMessage(4, join("prof2", "9999", "sala")); // 2º professor
    session.handleMessage(1, cmd("/invisivel"));
    sent.length = 0;

    mover(session, 1, 3, 40, 3);

    expect(posesRecebidas(sent, 2, 1)).toHaveLength(0); // ana (aluna)
    expect(posesRecebidas(sent, 3, 1)).toHaveLength(0); // bia (aluna)
    expect(posesRecebidas(sent, 4, 1)).toHaveLength(1); // prof2 vê
  });

  it("o invisível continua VENDO todo mundo (a filtragem é de mão única)", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/invisivel"));
    sent.length = 0;
    mover(session, 2, 5, 40, 5);
    expect(posesRecebidas(sent, 1, 2)).toHaveLength(1);
  });

  it("ligar manda `player_left` SÓ pros alunos (senão a caixa congela na tela)", () => {
    const { session, sent } = turma();
    session.handleMessage(4, join("prof2", "9999", "sala"));
    sent.length = 0;

    session.handleMessage(1, cmd("/invisivel"));

    expect(saidasRecebidas(sent, 2, 1)).toBe(1);
    expect(saidasRecebidas(sent, 3, 1)).toBe(1);
    expect(saidasRecebidas(sent, 4, 1)).toBe(0); // professor não perde ninguém
    expect(saidasRecebidas(sent, 1, 1)).toBe(0); // nem ele mesmo
  });

  it("desligar manda a pose de volta pros alunos (parado, nunca haveria move)", () => {
    const { session, sent } = turma();
    mover(session, 1, 7, 41, 8);
    session.handleMessage(1, cmd("/invisivel"));
    sent.length = 0;

    session.handleMessage(1, cmd("/invisivel"));

    expect(posesRecebidas(sent, 2, 1)).toEqual([{ x: 7, y: 41, z: 8 }]);
    expect(posesRecebidas(sent, 3, 1)).toEqual([{ x: 7, y: 41, z: 8 }]);
  });

  it("quem ENTRA depois: aluno não recebe a pose do invisível; professor recebe", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/invisivel"));
    sent.length = 0;

    session.handleMessage(5, join("caio", "5555")); // aluno novo
    expect(posesRecebidas(sent, 5, 1)).toHaveLength(0);
    expect(posesRecebidas(sent, 5, 2)).toHaveLength(1); // mas vê a ana

    sent.length = 0;
    session.handleMessage(6, join("prof3", "6666", "sala")); // professor novo
    expect(posesRecebidas(sent, 6, 1)).toHaveLength(1);
  });

  it("a invisibilidade é de SESSÃO: quem cai e volta volta visível", () => {
    const { session, sent } = turma();
    session.handleMessage(1, cmd("/invisivel"));
    session.handleDisconnect(1);
    session.handleMessage(7, join("prof", "4321", "sala"));
    sent.length = 0;

    mover(session, 7, 2, 40, 2);
    expect(posesRecebidas(sent, 2, 7)).toHaveLength(1);
  });
});

describe("/invisivel — fantasma", () => {
  it("o aluno coloca bloco na célula do invisível (visível, é recusado em silêncio)", () => {
    const { session, sent } = turma();
    const world = session.world;
    const sx = Math.floor(world.sizeX / 2);
    const sz = Math.floor(world.sizeZ / 2);
    const spawnY = findSpawnY(world, sx, sz);
    // ⚠️ o professor sobe 2 blocos (ar garantido, acima da cabeça de quem está
    // no spawn) e a aluna FICA no spawn. Mover a aluna pro lado a jogaria
    // dentro da rocha vizinha, o servidor recusaria o passo em silêncio, e o
    // teste mediria o corpo DELA ocupando a célula — falso verde.
    const alvo = { x: sx, y: spawnY + 2, z: sz };
    mover(session, 1, sx + 0.5, spawnY + 2, sz + 0.5);
    expect(teleportesRecebidos(sent, 1)).toBe(0); // o passo do professor valeu

    // com o professor VISÍVEL a célula está ocupada: recusa silenciosa
    session.handleMessage(2, JSON.stringify({ type: "place_block", ...alvo, blockId: BlockId.Stone }));
    expect(getBlock(world, alvo.x, alvo.y, alvo.z)).toBe(BlockId.Air);

    // invisível = fantasma: a célula vaga
    session.handleMessage(1, cmd("/invisivel"));
    session.handleMessage(2, JSON.stringify({ type: "place_block", ...alvo, blockId: BlockId.Stone }));
    expect(getBlock(world, alvo.x, alvo.y, alvo.z)).toBe(BlockId.Stone);
  });

  /** Empareda o professor no meio do mundo e devolve a turma pronta pra tickar. */
  function professorEmparedado() {
    const save = baseSave();
    save.modo = "sobrevivencia";
    const { session, sent } = turma(save);
    const world = session.world;
    const sx = Math.floor(world.sizeX / 2);
    const sz = Math.floor(world.sizeZ / 2);
    const spawnY = findSpawnY(world, sx, sz);
    // ⚠️ pedra maciça num cubo de RAIO 3, não 1: o resgate do soterramento
    // (bug-605) procura vão até o raio 2, então uma parede fina o teleporta pra
    // fora no 1º tick e o dano nunca chega a acontecer.
    // ⚠️ ORDEM: move PRIMEIRO, empareda DEPOIS. O `move` do servidor rejeita o
    // passo pra dentro de sólido (bug-605) — emparedar antes deixaria o
    // professor de fora e o teste mediria nada.
    mover(session, 1, sx + 0.5, spawnY, sz + 0.5);
    for (let dx = -3; dx <= 3; dx++)
      for (let dy = -3; dy <= 3; dy++)
        for (let dz = -3; dz <= 3; dz++)
          setBlock(world, sx + dx, spawnY + dy, sz + dz, BlockId.Stone);
    return { session, sent, sx, sz, spawnY };
  }

  it("CONTROLE: o professor VISÍVEL emparedado sufoca (é o que a invisibilidade desliga)", () => {
    const { session, sent } = professorEmparedado();
    sent.length = 0;
    for (let i = 0; i < TICKS_POR_DANO_SUFOCAMENTO * 3; i++) session.tick();
    expect(ultimaVida(sent, 1)?.vida ?? VIDA_MAX).toBeLessThan(VIDA_MAX);
  });

  it("o invisível ANDA por dentro da pedra: o servidor aceita o passo e não o quica", () => {
    const { session, sent, sx, sz, spawnY } = professorEmparedado();
    session.handleMessage(1, cmd("/invisivel"));
    sent.length = 0;

    // um passo pra dentro do maciço vizinho (fora do 3×3 emparedado, rocha pura)
    mover(session, 1, sx + 0.5, spawnY - 4, sz + 0.5);

    expect(teleportesRecebidos(sent, 1)).toBe(0);
    session.handleDisconnect(1);
    expect(session.toSave().roster?.find((r) => r.name === "prof")?.y).toBe(spawnY - 4);
  });

  it("o invisível atravessa parede sem sufocar nem ser cuspido pro vão livre", () => {
    const { session, sent } = professorEmparedado();
    session.handleMessage(1, cmd("/invisivel"));
    sent.length = 0;

    for (let i = 0; i < TICKS_POR_DANO_SUFOCAMENTO * 3; i++) session.tick();

    expect(ultimaVida(sent, 1)?.vida ?? VIDA_MAX).toBe(VIDA_MAX);
    // nem o resgate do soterramento (bug-605) o cuspiu pra fora da pedra
    expect(teleportesRecebidos(sent, 1)).toBe(0);
  });
});
