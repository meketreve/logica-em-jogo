import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import {
  AREA_CLAIM_POR_MEMBRO,
  MAX_AMIGOS,
  areaMaxDoClaim,
  caixasSeCruzam,
  claimDentroDoLimite,
  parseClaim,
  parseGrupoAmigos,
} from "./claims";
import { parseServerMessage } from "./protocol";
import { decodeSave, encodeSave } from "./save";
import { GameSession } from "./session";
import { findSpawnY, getBlock } from "./world";

const DIMS = { x: 2, z: 2, y: 2 };

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

/** Último texto de chat enviado a um cliente (rejeições/respostas de comando). */
function ultimaChat(sent: Sent, clientId: number): string | null {
  for (let i = sent.length - 1; i >= 0; i--) {
    if (sent[i]?.clientId !== clientId) continue;
    const m = parseServerMessage(sent[i]?.data as string);
    if (m?.type === "chat") return m.text;
  }
  return null;
}

describe("claims — helpers puros", () => {
  // 2026-08-10: o teto virou ORÇAMENTO DE ÁREA por membro do grupo (1.024 cada,
  // até 6), com teto de 128 por eixo. Sozinho = 1.024 (era 64×32 = 2.048).
  it("claimDentroDoLimite: 1.024 blocos por membro, altura livre (coluna cheia)", () => {
    const O = { x: 0, y: 0, z: 0 };
    expect(claimDentroDoLimite(O, { x: 31, y: 0, z: 31 })).toBe(true); // 32×32 = 1.024
    expect(claimDentroDoLimite(O, { x: 32, y: 0, z: 31 })).toBe(false); // 33×32 = 1.056
    expect(claimDentroDoLimite(O, { x: 0, y: 999, z: 0 })).toBe(true); // altura não limita
    // o grupo é que compra área: 6 pessoas chegam a 6.144
    expect(claimDentroDoLimite(O, { x: 63, y: 0, z: 63 }, 4)).toBe(true); // 4.096 com 4
    expect(claimDentroDoLimite(O, { x: 63, y: 0, z: 63 }, 3)).toBe(false); // 4.096 com 3 = não
    expect(claimDentroDoLimite(O, { x: 127, y: 0, z: 47 }, 6)).toBe(true); // 6.144 com 6
    // e nenhum lado passa de 128, por barata que a faixa seja em área
    expect(claimDentroDoLimite(O, { x: 128, y: 0, z: 0 }, 6)).toBe(false);
  });

  it("areaMaxDoClaim: presa entre 1 e MAX_AMIGOS (sem grupo = 1 membro)", () => {
    expect(areaMaxDoClaim(1)).toBe(AREA_CLAIM_POR_MEMBRO);
    expect(areaMaxDoClaim(6)).toBe(6 * AREA_CLAIM_POR_MEMBRO);
    expect(areaMaxDoClaim(0)).toBe(AREA_CLAIM_POR_MEMBRO);
    expect(areaMaxDoClaim(99)).toBe(MAX_AMIGOS * AREA_CLAIM_POR_MEMBRO);
  });

  it("caixasSeCruzam é inclusiva (tocar num canto conta)", () => {
    const a = { min: { x: 0, y: 0, z: 0 }, max: { x: 2, y: 2, z: 2 } };
    expect(caixasSeCruzam(a, { min: { x: 2, y: 2, z: 2 }, max: { x: 4, y: 4, z: 4 } })).toBe(true);
    expect(caixasSeCruzam(a, { min: { x: 3, y: 0, z: 0 }, max: { x: 4, y: 2, z: 2 } })).toBe(false);
  });

  it("parseClaim recusa lixo e aceita válido", () => {
    expect(parseClaim(null)).toBeNull();
    expect(parseClaim({ dono: "", min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } })).toBeNull();
    expect(parseClaim({ dono: "ana", min: { x: 2, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } })).toBeNull();
    const c = parseClaim({ dono: "ana", nome: "casa", min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } });
    expect(c?.dono).toBe("ana");
    expect(c?.nome).toBe("casa");
  });

  it("parseGrupoAmigos remove duplicatas, o próprio dono e corta no limite", () => {
    const g = parseGrupoAmigos({ dono: "ana", membros: ["bia", "bia", "ana", "c", "d", "e", "f", "g"] });
    expect(g?.dono).toBe("ana");
    expect(g?.membros).not.toContain("ana");
    expect(g?.membros.length).toBeLessThanOrEqual(MAX_AMIGOS - 1);
  });
});

describe("claims — proteção de áreas (cp24)", () => {
  function mundoComTurma(dims = DIMS) {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims, seed: 5, codigo: "sala" });
    session.handleMessage(1, join("prof", "4321", "sala")); // professor
    session.handleMessage(2, join("ana", "1111")); // aluno
    session.handleMessage(3, join("bia", "2222")); // aluno
    const world = session.world;
    const sx = Math.floor(world.sizeX / 2);
    const sz = Math.floor(world.sizeZ / 2);
    const h = findSpawnY(world, sx, sz);
    return { sent, session, world, sx, sz, h };
  }

  /** ana reivindica uma caixa ao redor do spawn (contém chão e ar, ao alcance). */
  function anaCriaClaim(session: GameSession, sx: number, sz: number, h: number, nome = ""): void {
    session.handleMessage(2, mark(1, sx - 2, h - 1, sz - 2));
    session.handleMessage(2, mark(2, sx + 2, h + 2, sz + 2));
    session.handleMessage(2, cmd(`/claim criar ${nome}`.trim()));
  }

  it("aluno não liga a proteção; professor liga", () => {
    const { sent, session } = mundoComTurma();
    session.handleMessage(2, cmd("/claim ligar"));
    expect(ultimaChat(sent, 2)).toContain("Somente o professor");
    session.handleMessage(1, cmd("/claim ligar"));
    expect(ultimaChat(sent, 1)).toContain("ligada");
  });

  it("dono edita, amigo aceito edita, estranho é barrado, professor ignora", () => {
    const { sent, session, world, sx, sz, h } = mundoComTurma();
    session.handleMessage(1, cmd("/claim ligar"));
    anaCriaClaim(session, sx, sz, h, "casa");

    const alvo = { x: sx, y: h - 1, z: sz };
    const antes = getBlock(world, alvo.x, alvo.y, alvo.z);
    expect(antes).not.toBe(BlockId.Air);

    // bia (estranho): quebra barrada, bloco intacto, aviso no chat
    session.handleMessage(3, JSON.stringify({ type: "break_block", ...alvo }));
    expect(getBlock(world, alvo.x, alvo.y, alvo.z)).toBe(antes);
    expect(ultimaChat(sent, 3)).toContain("protegida por ana");

    // ana (dona): quebra funciona
    session.handleMessage(2, JSON.stringify({ type: "break_block", ...alvo }));
    expect(getBlock(world, alvo.x, alvo.y, alvo.z)).toBe(BlockId.Air);

    // bia entra no grupo da ana e passa a colocar dentro do claim
    session.handleMessage(2, cmd("/amigos convidar bia"));
    session.handleMessage(3, cmd("/amigos aceitar ana"));
    const alto = { x: sx, y: h + 2, z: sz };
    session.handleMessage(3, JSON.stringify({ type: "place_block", ...alto, blockId: BlockId.BlocoAlgodaoVermelho }));
    expect(getBlock(world, alto.x, alto.y, alto.z)).toBe(BlockId.BlocoAlgodaoVermelho);

    // professor ignora a proteção
    session.handleMessage(1, JSON.stringify({ type: "place_block", ...alvo, blockId: BlockId.Stone }));
    expect(getBlock(world, alvo.x, alvo.y, alvo.z)).toBe(BlockId.Stone);
  });

  it("claim protege a COLUNA inteira (0..teto) — sem escavar por baixo nem ilha flutuante", () => {
    const { sent, session, world, sx, sz, h } = mundoComTurma();
    session.handleMessage(1, cmd("/claim ligar"));
    anaCriaClaim(session, sx, sz, h, "casa"); // marca só h-1..h+2

    // a caixa guardada cobre a coluna toda: da base (0) ao teto do mundo
    const claim = session.toSave().claims?.[0];
    expect(claim?.min.y).toBe(0);
    expect(claim?.max.y).toBe(world.sizeY - 1);

    // bia (estranha) não escava por BAIXO da área (fora do trecho marcado, mas
    // dentro da coluna e ao alcance): quebra barrada, chão intacto, aviso.
    const baixo = { x: sx, y: h - 2, z: sz };
    const antes = getBlock(world, baixo.x, baixo.y, baixo.z);
    expect(antes).not.toBe(BlockId.Air); // chão sólido sob o claim
    session.handleMessage(3, JSON.stringify({ type: "break_block", ...baixo }));
    expect(getBlock(world, baixo.x, baixo.y, baixo.z)).toBe(antes);
    expect(ultimaChat(sent, 3)).toContain("protegida por ana");
  });

  it("professor também reserva área com /claim (mesmo acesso do aluno)", () => {
    const { sent, session, world, sx, sz, h } = mundoComTurma();
    session.handleMessage(1, cmd("/claim ligar"));
    // professor marca com a varinha e cria — antes era barrado
    session.handleMessage(1, mark(1, sx - 1, h, sz - 1));
    session.handleMessage(1, mark(2, sx + 1, h + 1, sz + 1));
    session.handleMessage(1, cmd("/claim criar palco"));
    const claim = session.toSave().claims?.find((c) => c.dono === "prof");
    expect(claim).toBeDefined();
    expect(claim?.min.y).toBe(0); // coluna cheia, como a do aluno

    // aluno estranho é barrado dentro da área do professor (célula longe do
    // spawn da ana pra não bater na guarda de "não emparedar jogador")
    const alvo = { x: sx + 1, y: h, z: sz + 1 };
    // o que importa é NÃO TER MUDADO — a célula pode nascer com ar ou com capim
    // (§🌬️ 2026-07-27: grama alta é substituível, então o place chegaria a valer
    // aqui se o claim não barrasse)
    const antes = getBlock(world, alvo.x, alvo.y, alvo.z);
    session.handleMessage(2, JSON.stringify({ type: "place_block", ...alvo, blockId: BlockId.Stone }));
    expect(getBlock(world, alvo.x, alvo.y, alvo.z)).toBe(antes);
    expect(ultimaChat(sent, 2)).toContain("protegida por prof");
  });

  it("claim novo não sobrepõe outro nem passa do tamanho máximo", () => {
    // mundo largo (5 chunks = 80) pra caber um claim maior que o limite X de 64
    const { sent, session, sx, sz, h } = mundoComTurma({ x: 5, z: 2, y: 2 });
    session.handleMessage(1, cmd("/claim ligar"));
    anaCriaClaim(session, sx, sz, h);

    // bia tenta um claim encostando no da ana
    session.handleMessage(3, mark(1, sx, h - 1, sz));
    session.handleMessage(3, mark(2, sx + 1, h, sz + 1));
    session.handleMessage(3, cmd("/claim criar"));
    expect(ultimaChat(sent, 3)).toContain("encosta na área de ana");

    // bia tenta um claim gigante: 40×31 = 1.240, e sozinha ela só tem 1.024
    session.handleMessage(3, mark(1, 0, 0, 0));
    session.handleMessage(3, mark(2, 39, 0, 30));
    session.handleMessage(3, cmd("/claim criar"));
    expect(ultimaChat(sent, 3)).toContain("grande demais");
    expect(ultimaChat(sent, 3)).toContain("1024"); // o limite dela, escrito
  });

  /**
   * 2026-08-10 (pedido do playtest): a área máxima cresce com o GRUPO, e editar
   * o claim é remarcar com a varinha e rodar `/claim modificar` — sem passar por
   * remover+criar, que deixa a construção desprotegida no meio do caminho.
   */
  it("o limite de área cresce com o grupo, e /claim modificar remarca no lugar", () => {
    const { sent, session, sx, sz, h } = mundoComTurma({ x: 5, z: 2, y: 2 });
    session.handleMessage(1, cmd("/claim ligar"));

    // sozinha, ana não passa de 1.024 (40×31 = 1.240 é recusado)
    session.handleMessage(2, mark(1, 0, 0, 0));
    session.handleMessage(2, mark(2, 39, 0, 30));
    session.handleMessage(2, cmd("/claim criar"));
    expect(ultimaChat(sent, 2)).toContain("grande demais");
    expect(session.toSave().claims ?? []).toHaveLength(0);

    // com a bia no grupo são 2 pessoas = 2.048, e a MESMA marcação passa
    session.handleMessage(2, cmd("/amigos convidar bia"));
    session.handleMessage(3, cmd("/amigos aceitar ana"));
    session.handleMessage(2, mark(1, 0, 0, 0));
    session.handleMessage(2, mark(2, 39, 0, 30));
    session.handleMessage(2, cmd("/claim criar casa"));
    const criado = session.toSave().claims?.find((c) => c.dono === "ana");
    expect(criado?.max.x).toBe(39);
    expect(criado?.nome).toBe("casa");

    // criar de novo não vale: o comando de editar é o modificar
    session.handleMessage(2, mark(1, 50, 0, 0));
    session.handleMessage(2, mark(2, 60, 0, 10));
    session.handleMessage(2, cmd("/claim criar"));
    expect(ultimaChat(sent, 2)).toContain("/claim modificar");

    // modificar remarca no lugar, HERDA o rótulo e continua sendo coluna cheia
    session.handleMessage(2, mark(1, 50, h, 0));
    session.handleMessage(2, mark(2, 60, h + 3, 10));
    session.handleMessage(2, cmd("/claim modificar"));
    const novo = session.toSave().claims?.find((c) => c.dono === "ana");
    expect(novo?.min.x).toBe(50);
    expect(novo?.max.x).toBe(60);
    expect(novo?.nome).toBe("casa"); // não digitou nome: herda o que tinha
    expect(novo?.min.y).toBe(0);
    expect(novo?.max.y).toBe(session.world.sizeY - 1);
    expect(session.toSave().claims).toHaveLength(1); // remarcou, não criou outro

    // e a bia saindo do grupo NÃO apaga a área — só avisa que ficou apertada
    const grande = { min: { x: 0, y: 0, z: 0 }, max: { x: 39, y: 0, z: 30 } };
    session.handleMessage(2, mark(1, grande.min.x, h, grande.min.z));
    session.handleMessage(2, mark(2, grande.max.x, h, grande.max.z));
    session.handleMessage(2, cmd("/claim modificar"));
    session.handleMessage(3, cmd("/amigos sair"));
    expect(ultimaChat(sent, 2)).toContain("continua protegida");
    expect(session.toSave().claims?.find((c) => c.dono === "ana")?.max.x).toBe(39);

    // ...e agora o modificar recusa remarcar do mesmo tamanho (1 pessoa = 1.024)
    session.handleMessage(2, mark(1, 0, h, 0));
    session.handleMessage(2, mark(2, 39, h, 30));
    session.handleMessage(2, cmd("/claim modificar"));
    expect(ultimaChat(sent, 2)).toContain("grande demais");
    // encolher para dentro do limite continua valendo
    session.handleMessage(2, mark(1, 0, h, 0));
    session.handleMessage(2, mark(2, 31, h, 31));
    session.handleMessage(2, cmd("/claim modificar"));
    expect(session.toSave().claims?.find((c) => c.dono === "ana")?.max.x).toBe(31);
  });

  it("claimsAtivo + claim + grupo de amigos sobrevivem ao save/restore", () => {
    const { session, sx, sz, h } = mundoComTurma();
    session.handleMessage(1, cmd("/claim ligar"));
    anaCriaClaim(session, sx, sz, h, "casa");
    session.handleMessage(2, cmd("/amigos convidar bia"));
    session.handleMessage(3, cmd("/amigos aceitar ana"));

    const restore = decodeSave(encodeSave(session.world, session.toSave()));
    expect(restore.claimsAtivo).toBe(true);
    expect(restore.claims?.[0]?.dono).toBe("ana");
    expect(restore.amigos?.[0]?.membros).toContain("bia");

    // nova sessão do save: a proteção continua barrando o estranho e liberando o amigo
    const { send: send2 } = collect();
    const s2 = new GameSession(send2, { restore, codigo: "sala" });
    const alvo = { x: sx, y: h - 1, z: sz };
    const antes = getBlock(s2.world, alvo.x, alvo.y, alvo.z);

    s2.handleMessage(5, join("carla", "3333")); // estranho
    s2.handleMessage(5, JSON.stringify({ type: "break_block", ...alvo }));
    expect(getBlock(s2.world, alvo.x, alvo.y, alvo.z)).toBe(antes);

    s2.handleMessage(6, join("bia", "2222")); // amigo do save
    s2.handleMessage(6, JSON.stringify({ type: "break_block", ...alvo }));
    expect(getBlock(s2.world, alvo.x, alvo.y, alvo.z)).toBe(BlockId.Air);
  });
});

describe("banimento (2026-07-21)", () => {
  function mk() {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
    session.handleMessage(1, join("prof", "4321", "sala")); // professor
    return { sent, session };
  }
  const recebeu = (sent: Sent, clientId: number, tipo: string): boolean =>
    sent.some((s) => s.clientId === clientId && parseServerMessage(s.data as string)?.type === tipo);

  it("banir é idempotente e case-insensitive; join de banido é recusado", () => {
    const { sent, session } = mk();
    expect(session.banir("Zezinho")).toBe(true);
    expect(session.banir("zezinho")).toBe(false); // já banido (case-insensitive)
    expect(session.estaBanido("ZEZINHO")).toBe(true);

    session.handleMessage(2, join("zezinho", "1111")); // tenta entrar banido
    expect(recebeu(sent, 2, "join_denied")).toBe(true);
    expect(recebeu(sent, 2, "spawn")).toBe(false);
  });

  it("desbanir libera o nick a entrar de novo", () => {
    const { sent, session } = mk();
    session.banir("zezinho");
    expect(session.desbanir("ZEZINHO")).toBe(true); // case-insensitive
    expect(session.desbanir("zezinho")).toBe(false); // já não estava
    session.handleMessage(3, join("zezinho", "1111"));
    expect(recebeu(sent, 3, "spawn")).toBe(true);
  });

  it("a lista de banidos sobrevive ao save/restore", () => {
    const { session } = mk();
    session.banir("grifador");
    const restore = decodeSave(encodeSave(session.world, session.toSave()));
    expect(restore.banidos).toContain("grifador");
    const { send: send2 } = collect();
    const s2 = new GameSession(send2, { restore, codigo: "sala" });
    expect(s2.estaBanido("Grifador")).toBe(true);
  });
});

describe("feed `friends` — o que o painel de amigos consome (2026-08-04)", () => {
  /** Último `friends` que o servidor mandou pra este cliente. */
  function ultimoFriends(sent: Sent, clientId: number) {
    for (let i = sent.length - 1; i >= 0; i--) {
      if (sent[i]?.clientId !== clientId) continue;
      const m = parseServerMessage(sent[i]?.data as string);
      if (m?.type === "friends") return m;
    }
    return null;
  }

  function turma() {
    const { sent, send } = collect();
    const session = new GameSession(send, { dims: DIMS, seed: 5, codigo: "sala" });
    session.handleMessage(1, join("prof", "4321", "sala"));
    session.handleMessage(2, join("ana", "1111"));
    session.handleMessage(3, join("bia", "2222"));
    session.handleMessage(4, join("caio", "3333"));
    return { sent, session };
  }

  it("parse tolera host ANTIGO, que não manda `enviados`", () => {
    const m = parseServerMessage(
      JSON.stringify({ type: "friends", equipe: null, convites: ["ana"] }),
    );
    expect(m).toEqual({ type: "friends", equipe: null, convites: ["ana"], enviados: [] });
  });

  it("convidar já atualiza QUEM CONVIDOU: o grupo nasce e o convite fica pendente", () => {
    const { sent, session } = turma();
    session.handleMessage(2, cmd("/amigos convidar bia"));
    const anaVe = ultimoFriends(sent, 2);
    // sem isto, clicar em "convidar" no painel não mudaria nada na tela
    expect(anaVe?.equipe).toEqual({ dono: "ana", membros: ["ana"] });
    expect(anaVe?.enviados).toEqual(["bia"]);
    expect(ultimoFriends(sent, 3)?.convites).toEqual(["ana"]);
  });

  it("aceitar fecha o convite dos DOIS lados", () => {
    const { sent, session } = turma();
    session.handleMessage(2, cmd("/amigos convidar bia"));
    session.handleMessage(3, cmd("/amigos aceitar ana"));
    expect(ultimoFriends(sent, 2)?.enviados).toEqual([]);
    expect(ultimoFriends(sent, 2)?.equipe?.membros).toEqual(["ana", "bia"]);
    expect(ultimoFriends(sent, 3)?.equipe?.membros).toEqual(["ana", "bia"]);
    expect(ultimoFriends(sent, 3)?.convites).toEqual([]);
  });

  it("recusar tira o `aguardando` da tela de quem convidou, e ele fica sabendo", () => {
    const { sent, session } = turma();
    session.handleMessage(2, cmd("/amigos convidar bia"));
    session.handleMessage(3, cmd("/amigos recusar ana"));
    expect(ultimoFriends(sent, 2)?.enviados).toEqual([]);
    expect(ultimaChat(sent, 2)).toContain("recusou");
  });

  it("aceitar um convite descarta os outros — e avisa quem tinha convidado", () => {
    const { sent, session } = turma();
    session.handleMessage(2, cmd("/amigos convidar caio")); // ana convida caio
    session.handleMessage(3, cmd("/amigos convidar caio")); // bia também
    expect(ultimoFriends(sent, 4)?.convites).toEqual(["ana", "bia"]);
    session.handleMessage(4, cmd("/amigos aceitar ana"));
    expect(ultimoFriends(sent, 2)?.equipe?.membros).toEqual(["ana", "caio"]);
    expect(ultimoFriends(sent, 3)?.enviados).toEqual([]); // bia parou de esperar
  });

  it("expulsar e sair chegam nos dois painéis", () => {
    const { sent, session } = turma();
    session.handleMessage(2, cmd("/amigos convidar bia"));
    session.handleMessage(3, cmd("/amigos aceitar ana"));
    session.handleMessage(2, cmd("/amigos expulsar bia"));
    expect(ultimoFriends(sent, 3)?.equipe).toBeNull();
    expect(ultimoFriends(sent, 2)?.equipe?.membros).toEqual(["ana"]);

    session.handleMessage(2, cmd("/amigos convidar bia"));
    session.handleMessage(3, cmd("/amigos aceitar ana"));
    session.handleMessage(2, cmd("/amigos sair")); // o DONO saindo dissolve
    expect(ultimoFriends(sent, 2)?.equipe).toBeNull();
    expect(ultimoFriends(sent, 3)?.equipe).toBeNull();
  });
});
