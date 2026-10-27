/**
 * §🔌 AULA DE CIRCUITOS (`aula8-circuitos.ljw`) — 2026-10-27.
 *
 * Quatro fases em modo sequencial, uma por peça nova: o FIO, a porta E, a
 * porta OU e as duas portas juntas. Em cada uma o circuito já vem MONTADO, com
 * as alavancas desligadas, e a tarefa é deixar as lâmpadas exatamente como as
 * marcas pedem: bloco VERDE em cima = tem de acender, VERMELHO = tem de ficar
 * apagada. Um quadro ao lado de cada fase explica a peça e o desafio.
 *
 * **Por que verde E vermelho, e não só "acenda a lâmpada":** sem porta NÃO,
 * todo circuito deste jogo é MONÓTONO — ligar mais alavancas nunca apaga nada.
 * Um objetivo "acenda tudo" se resolve sempre com "liga todas", e a aula vira
 * sair clicando. A lâmpada VERMELHA é o que obriga a pensar: ela acende junto
 * com a alavanca errada. Por isso o objetivo é `construir` (o estado EXATO:
 * alavancas, fios e lâmpadas) contra um gabarito montado pelo próprio motor —
 * e por isso o gerador exige, por força bruta, que cada fase tenha UMA só
 * combinação de alavancas que dá o padrão pedido. Se houvesse duas, o aluno
 * acharia a outra, veria as lâmpadas certas e o contador não fecharia.
 *
 * **Padrão novo de aula** (o mesmo do `gerar.ts`): o estado de PARTIDA + os
 * quadros moram na célula-molde (`REGIAO_PARTIDA`) e cada grupo recebe uma
 * CÓPIA dela pelo `copiarCelula` — o mesmo primitivo do `/aula grupos`, que o
 * professor usa ao vivo para criar mais áreas. Nenhum caminho privado: o
 * gabarito sai de cliques de verdade (`use_block`) e do motor rodando no tick.
 */
import {
  BlockId,
  CELULA_Y0,
  CHUNK_SIZE,
  type Celula,
  REGIAO_PARTIDA,
  caixaDaCelula,
  chunkDoGrupo,
  chunkDoMolde,
  chunkDoProfessor,
  comEstado,
  copiarCelula,
  decodeSave,
  dimsDaAula,
  encodeSave,
  estaLigado,
  GameSession,
  getBlock,
  recalcularCircuitos,
} from "@logica/shared";
import { Autoria, type Vec } from "./autoria";
import { conferirGeometria } from "./verificar";

export const ARQUIVO_CIRCUITOS = "aula8-circuitos.ljw";
export const TITULO_CIRCUITOS = "Acenda só as lâmpadas certas";
const SEED = 20261027;

/**
 * Uma fase, desenhada em ASCII — linha = z, coluna = x, a partir do canto da
 * área. Legenda:
 *   A B C …  alavanca (nasce desligada)      -  fio
 *   E        porta E virada pra +x           O  porta OU virada pra +x
 *   g        lâmpada que tem de ACENDER (bloco verde em cima)
 *   r        lâmpada que tem de ficar APAGADA (bloco vermelho em cima)
 *   .        nada
 * A porta virada pra +x recebe pelas laterais (a linha de cima e a de baixo)
 * e entrega na coluna seguinte. Fio conduz pros 6 vizinhos — por isso duas
 * linhas de fio nunca podem ficar encostadas.
 */
interface FaseCircuito {
  /** Enunciado do objetivo (ASCII, como os das outras aulas; o servidor corta em 120). */
  texto: string;
  /** O quadro da fase: a explicação da peça e do desafio (até 300 caracteres). */
  quadro: string;
  /** Canto da área DENTRO da célula (0..15). */
  canto: { x: number; z: number };
  desenho: string[];
  /** As alavancas que o gabarito liga — a resposta. */
  resposta: string;
  /** Onde fica o quadro (dentro da célula) e pra onde ele olha; a parede de
   *  pedra vai atrás dele. */
  placa: { x: number; z: number; olha: "-x" | "+z" };
}

const FASES: FaseCircuito[] = [
  {
    texto: "Fase 1 (o fio): acenda a lampada do bloco VERDE e deixe APAGADA a do bloco VERMELHO.",
    quadro:
      "PASSO 1 — O FIO. A alavanca é a ENTRADA: ligada, ela manda sinal. O fio LEVA o sinal até " +
      "a lâmpada, que é a SAÍDA. Lâmpada com bloco VERDE em cima tem de ACENDER; com bloco " +
      "VERMELHO tem de ficar APAGADA. Botão direito na alavanca (no tablet: interagir) liga e desliga.",
    canto: { x: 5, z: 1 },
    desenho: [
      "A-----g",
      ".......",
      "B-----r",
    ],
    resposta: "A",
    placa: { x: 12, z: 2, olha: "-x" },
  },
  {
    texto: "Fase 2 (porta E): acenda a lampada. A porta E so manda sinal com as DUAS entradas ligadas.",
    quadro:
      "PASSO 2 — A PORTA E. O bloco do meio é uma porta lógica E: ela só manda sinal para a frente " +
      "quando as DUAS entradas (uma de cada lado) recebem sinal AO MESMO TEMPO. Uma entrada sozinha " +
      "não basta. Teste: ligue uma alavanca e olhe a lâmpada. Depois ligue a outra.",
    canto: { x: 5, z: 5 },
    desenho: [
      "A---...",
      "...E--g",
      "B---...",
    ],
    resposta: "AB",
    placa: { x: 12, z: 6, olha: "-x" },
  },
  {
    texto: "Fase 3 (porta OU): acenda a VERDE sem acender a VERMELHA. Basta uma entrada - mas qual?",
    quadro:
      "PASSO 3 — A PORTA OU. A porta OU manda sinal quando PELO MENOS UMA entrada recebe sinal. " +
      "As duas alavancas acendem a lâmpada verde... mas uma delas também acende a vermelha. " +
      "Descubra qual alavanca usar. Siga o fio de cada uma com o dedo antes de clicar!",
    canto: { x: 1, z: 9 },
    desenho: [
      "A---...",
      "...O--g",
      "B---...",
      "-......",
      "r......",
    ],
    resposta: "A",
    placa: { x: 8, z: 11, olha: "-x" },
  },
  {
    texto: "Fase 4 (E e OU juntos): acenda as 2 lampadas VERDES e deixe a VERMELHA apagada.",
    quadro:
      "PASSO 4 — E e OU JUNTOS. A alavanca do meio alimenta as DUAS portas ao mesmo tempo. Acenda " +
      "as duas verdes e deixe a vermelha apagada. Dica: comece pela vermelha — que alavanca NÃO " +
      "pode ser ligada? Depois pergunte a cada porta: do que você precisa?",
    canto: { x: 10, z: 9 },
    desenho: [
      "A---..",
      "...E-g",
      "...B..",
      "...-..",
      "...O-g",
      "C---..",
      "r.....",
    ],
    resposta: "AB",
    placa: { x: 12, z: 8, olha: "+z" },
  },
];

/** Altura da área: o circuito no chão + as marcas verde/vermelha em cima das lâmpadas. */
const AREA_DY = 2;

interface Peca {
  i: number;
  k: number;
  id: number;
  /** Letra da alavanca, ou a marca da lâmpada ("g"/"r"). */
  rotulo?: string;
}

/** O desenho virado em peças (estado de PARTIDA: tudo desligado). */
function pecasDe(f: FaseCircuito): Peca[] {
  const out: Peca[] = [];
  f.desenho.forEach((linha, k) => {
    [...linha].forEach((ch, i) => {
      if (ch === ".") return;
      if (ch === "-") out.push({ i, k, id: BlockId.FioDesligado });
      else if (ch === "E") out.push({ i, k, id: BlockId.PortaEXPDesligada });
      else if (ch === "O") out.push({ i, k, id: BlockId.PortaOUXPDesligada });
      else if (ch === "g" || ch === "r") out.push({ i, k, id: BlockId.LampadaApagada, rotulo: ch });
      else if (/[A-Z]/.test(ch)) out.push({ i, k, id: BlockId.AlavancaDesligada, rotulo: ch });
      else throw new Error(`desenho da fase com caractere desconhecido: "${ch}"`);
    });
  });
  return out;
}

const area = (f: FaseCircuito): { dx: number; dy: number; dz: number } => ({
  dx: Math.max(...f.desenho.map((l) => l.length)),
  dy: AREA_DY,
  dz: f.desenho.length,
});

/**
 * O padrão de lâmpadas (true = acesa, na ordem das peças) com as alavancas
 * `ligadas` — pelo MESMO motor do jogo, numa grade de mentira.
 */
function simular(f: FaseCircuito, ligadas: Set<string>): boolean[] {
  const pecas = pecasDe(f);
  const mapa = new Map<string, number>();
  for (const p of pecas) {
    const ligada = p.id === BlockId.AlavancaDesligada && ligadas.has(p.rotulo ?? "");
    mapa.set(`${p.i},0,${p.k}`, ligada ? comEstado(p.id, true) : p.id);
  }
  const celulas: Celula[] = pecas.map((p) => ({ x: p.i, y: 0, z: p.k }));
  for (const m of recalcularCircuitos({ bloco: (x, y, z) => mapa.get(`${x},${y},${z}`) ?? 0 }, celulas)) {
    mapa.set(`${m.x},${m.y},${m.z}`, m.blockId);
  }
  return pecas.filter((p) => p.rotulo === "g" || p.rotulo === "r").map((p) => estaLigado(mapa.get(`${p.i},0,${p.k}`)!));
}

/** O padrão PEDIDO: verde acesa, vermelha apagada. */
const alvoDe = (f: FaseCircuito): boolean[] =>
  pecasDe(f).filter((p) => p.rotulo === "g" || p.rotulo === "r").map((p) => p.rotulo === "g");

const alavancasDe = (f: FaseCircuito): string[] =>
  pecasDe(f).filter((p) => p.id === BlockId.AlavancaDesligada).map((p) => p.rotulo!);

/**
 * O portão da aula: cada fase tem EXATAMENTE uma combinação de alavancas que
 * dá o padrão pedido, e ela é a `resposta`. Força bruta (2^n, n ≤ 4).
 */
export function conferirDesenhos(): string[] {
  const problemas: string[] = [];
  FASES.forEach((f, n) => {
    const letras = alavancasDe(f);
    const alvo = JSON.stringify(alvoDe(f));
    const certas: string[] = [];
    for (let m = 0; m < 1 << letras.length; m++) {
      const ligadas = new Set(letras.filter((_, b) => m & (1 << b)));
      if (JSON.stringify(simular(f, ligadas)) === alvo) certas.push([...ligadas].sort().join(""));
    }
    if (certas.length !== 1) {
      problemas.push(`fase ${n + 1}: ${certas.length} combinações dão o padrão pedido (${certas.join(", ") || "nenhuma"}) — tem de ser UMA`);
    } else if (certas[0] !== [...f.resposta].sort().join("")) {
      problemas.push(`fase ${n + 1}: a única combinação certa é "${certas[0]}", não a resposta "${f.resposta}"`);
    }
    if (f.quadro.length > 300) problemas.push(`fase ${n + 1}: quadro com ${f.quadro.length} caracteres (máx. 300)`);
  });
  return problemas;
}

/** "Ligar tudo" resolve a fase? (só a porta E deve deixar — é a lição dela) */
export function ligarTudoResolve(n: number): boolean {
  const f = FASES[n]!;
  return JSON.stringify(simular(f, new Set(alavancasDe(f)))) === JSON.stringify(alvoDe(f));
}

export interface OpcoesCircuitos {
  grupos: number;
  codigo: string;
  revelar: boolean;
}

/** Canto da área da fase `f` numa célula cujo canto (chunk) é `ox, oz`. */
const cantoNa = (ox: number, oz: number, f: FaseCircuito): Vec => ({
  x: ox + f.canto.x,
  y: CELULA_Y0,
  z: oz + f.canto.z,
});
const fimDe = (org: Vec, f: FaseCircuito): Vec => {
  const a = area(f);
  return { x: org.x + a.dx - 1, y: org.y + a.dy - 1, z: org.z + a.dz - 1 };
};
const sufixo = (n: number): string => (n === 0 ? "" : String(n + 1));

function plantar(a: Autoria, org: Vec, f: FaseCircuito): void {
  for (const p of pecasDe(f)) {
    a.bloco(org.x + p.i, org.y, org.z + p.k, p.id);
    if (p.rotulo === "g") a.bloco(org.x + p.i, org.y + 1, org.z + p.k, BlockId.BlocoAlgodaoVerde);
    if (p.rotulo === "r") a.bloco(org.x + p.i, org.y + 1, org.z + p.k, BlockId.BlocoAlgodaoVermelho);
  }
}

/** O quadro da fase, com a parede de pedra atrás (molde: copiado pra cada grupo). */
function placa(a: Autoria, ox: number, oz: number, f: FaseCircuito): void {
  const { x, z, olha } = f.placa;
  const px = ox + x;
  const pz = oz + z;
  const y = CELULA_Y0;
  const atras = olha === "-x" ? { x: px + 1, z: pz } : { x: px, z: pz - 1 };
  a.bloco(atras.x, y, atras.z, BlockId.Stone);
  a.bloco(atras.x, y + 1, atras.z, BlockId.Stone);
  a.quadro(px, y + 1, pz, olha === "-x" ? BlockId.QuadroXN : BlockId.QuadroZP, f.quadro);
}

export function gerarCircuitos(o: OpcoesCircuitos): ArrayBuffer {
  const problemas = conferirDesenhos();
  if (problemas.length) throw new Error(problemas.join("\n"));
  const n = o.grupos;
  const a = new Autoria({ dims: dimsDaAula(), preset: "cabines", seed: SEED, codigo: o.codigo });
  a.entrar(o.codigo);
  a.afastar(1.5, 20, 1.5);
  a.cmd(`/grupo criar ${n}`, `${n} grupo(s) criados`);

  // GABARITO de cada fase na célula do professor: o circuito montado e as
  // alavancas da resposta LIGADAS pelo clique de verdade — quem acende o resto
  // é o motor, no tick. É esse estado (fios e lâmpadas inclusos) que se fotografa.
  const prof = chunkDoProfessor();
  const pox = prof.cx * CHUNK_SIZE;
  const poz = prof.cz * CHUNK_SIZE;
  FASES.forEach((f, idx) => {
    const org = cantoNa(pox, poz, f);
    plantar(a, org, f);
    a.regiao(`modelo${sufixo(idx)}`, org, fimDe(org, f));
  });
  FASES.forEach((f) => {
    const org = cantoNa(pox, poz, f);
    for (const p of pecasDe(f)) {
      if (p.rotulo && f.resposta.includes(p.rotulo) && p.id === BlockId.AlavancaDesligada) {
        a.usar(org.x + p.i, org.y, org.z + p.k);
      }
    }
  });
  a.afastar(1.5, 20, 1.5);
  for (let t = 0; t < 3; t++) a.session.tick();
  FASES.forEach((f, idx) => {
    const org = cantoNa(pox, poz, f);
    const lampadas = pecasDe(f).filter((p) => p.rotulo === "g" || p.rotulo === "r");
    const visto = lampadas.map((p) => estaLigado(getBlock(a.session.world, org.x + p.i, org.y, org.z + p.k)));
    if (JSON.stringify(visto) !== JSON.stringify(alvoDe(f))) {
      throw new Error(`fase ${idx + 1}: o gabarito montado no mundo não acendeu o padrão pedido`);
    }
  });

  // CÉLULA-MOLDE: a partida (tudo desligado) + os quadros
  const molde = chunkDoMolde();
  const mox = molde.cx * CHUNK_SIZE;
  const moz = molde.cz * CHUNK_SIZE;
  for (const f of FASES) {
    plantar(a, cantoNa(mox, moz, f), f);
    placa(a, mox, moz, f);
  }
  a.afastar(1.5, 20, 1.5);
  const caixaMolde = caixaDaCelula(molde);
  a.regiao(REGIAO_PARTIDA, caixaMolde.min, caixaMolde.max);

  // uma CÓPIA da célula-molde por grupo — o primitivo do /aula grupos
  for (let g = 1; g <= n; g++) {
    const chunkG = chunkDoGrupo(g);
    const r = copiarCelula(a.session, caixaMolde, caixaDaCelula(chunkG));
    if (r.pulados > 0) throw new Error(`grupo ${g} teve ${r.pulados} bloco(s) pulados na geração`);
    const ox = chunkG.cx * CHUNK_SIZE;
    const oz = chunkG.cz * CHUNK_SIZE;
    FASES.forEach((f, idx) => {
      const org = cantoNa(ox, oz, f);
      a.regiao(`area${sufixo(idx)}-${g}`, org, fimDe(org, f));
    });
  }
  // o molde também passa pelo motor (nada deve acender: está tudo desligado)
  for (let t = 0; t < 3; t++) a.session.tick();

  a.cmd("/objetivo modo sequencial", "Modo do cenário: sequencial");
  FASES.forEach((f, idx) => {
    a.cmd(`/objetivo add construir modelo${sufixo(idx)} area${sufixo(idx)} ${f.texto}`, "criado: construir em");
  });
  if (!o.revelar) {
    FASES.forEach((_f, idx) => a.cmd(`/regiao encher modelo${sufixo(idx)} 0`, "bloco(s) alterado(s)"));
  }
  a.cmd("/hora meio-dia", "Hora ajustada");
  a.cmd("/ciclo desligar", "Ciclo de dia e noite parado");
  return encodeSave(a.session.world, { ...a.session.toSave(), roster: [] });
}

/**
 * Conferência do arquivo gerado: abre num servidor NOVO, uma aluna do grupo 1
 * resolve as 4 fases NA ORDEM só clicando alavancas (o que a turma vai fazer),
 * e o professor aumenta a turma com `/aula grupos` — a área nova tem de nascer
 * igual à original e também ser resolvível.
 */
export function conferirCircuitos(buf: ArrayBuffer, o: OpcoesCircuitos): string[] {
  const problemas: string[] = [];
  const exigir = (cond: boolean, msg: string): void => {
    if (!cond) problemas.push(msg);
  };
  const save = decodeSave(buf);
  exigir(save.roster.length === 0, "o save carrega identidade do autor");
  exigir(save.grupos?.length === o.grupos, `esperava ${o.grupos} grupos no save`);
  exigir(save.cenario?.modo === "sequencial", "a aula devia estar em modo sequencial");
  const objetivos = save.cenario?.objetivos ?? [];
  exigir(objetivos.length === FASES.length, `esperava ${FASES.length} objetivos, veio ${objetivos.length}`);
  for (const obj of objetivos) conferirGeometria(save.world, obj.alvos ?? [], problemas);
  // um quadro por fase em CADA célula: a molde + os grupos (o /aula grupos copia da molde)
  const quadros = save.quadros ?? [];
  const esperados = (o.grupos + 1) * FASES.length;
  exigir(
    quadros.length === esperados && FASES.every((f) => quadros.filter((q) => q.texto === f.quadro).length === o.grupos + 1),
    `esperava ${esperados} quadros com o texto de cada fase, o save tem ${quadros.length}`,
  );
  if (problemas.length) return problemas;

  const msgs = new Map<number, Record<string, unknown>[]>();
  const s = new GameSession(
    (id, data) => {
      if (typeof data !== "string") return;
      const l = msgs.get(id) ?? [];
      l.push(JSON.parse(data) as Record<string, unknown>);
      msgs.set(id, l);
    },
    { restore: save, codigo: o.codigo },
  );
  const send = (id: number, m: unknown): void => s.handleMessage(id, JSON.stringify(m));
  type Est = { grupo: number; completo: boolean };
  const estado = (f: number, g: number): Est | undefined =>
    ((msgs.get(2)?.filter((m) => m["type"] === "objectives").at(-1)?.["objetivos"] as
      { porGrupo?: Est[] }[] | undefined)?.[f]?.porGrupo ?? []).find((e) => e.grupo === g);

  send(1, { type: "join", name: "profa", pin: "1234", codigo: o.codigo });
  send(2, { type: "join", name: "ana", pin: "1111" }); // grupo 1
  send(3, { type: "join", name: "bia", pin: "2222" }); // grupo 2

  /** A aluna `id` deixa as alavancas da fase `f` (na área `k` do objetivo) como `ligar` manda. */
  const resolver = (id: number, f: number, k: number, ligar: Set<string>): void => {
    const alvo = objetivos[f]!.alvos![k]!;
    for (const p of pecasDe(FASES[f]!)) {
      if (p.id !== BlockId.AlavancaDesligada) continue;
      const x = alvo.min.x + p.i;
      const z = alvo.min.z + p.k;
      const quer = ligar.has(p.rotulo!);
      if (estaLigado(getBlock(s.world, x, alvo.min.y, z)) === quer) continue;
      send(id, { type: "move", x: x - 1.5, y: alvo.min.y, z: z + 0.5, yaw: 0, pitch: 0 });
      send(id, { type: "use_block", x, y: alvo.min.y, z });
    }
    s.tick();
    s.tick();
  };

  FASES.forEach((f, n) => {
    // "liga tudo" NÃO pode resolver (menos na porta E, onde é a própria lição)
    resolver(2, n, 0, new Set(alavancasDe(f)));
    exigir(
      !!estado(n, 1)?.completo === ligarTudoResolve(n),
      `fase ${n + 1}: ligar TODAS as alavancas ${ligarTudoResolve(n) ? "devia" : "não devia"} fechar a fase`,
    );
    resolver(2, n, 0, new Set(f.resposta));
    exigir(!!estado(n, 1)?.completo, `fase ${n + 1}: o grupo 1 ligou "${f.resposta}" e a fase NÃO fechou`);
    exigir(!estado(n, 2)?.completo, `fase ${n + 1}: o grupo 2 fechou junto — progresso não isolado`);
  });

  // o professor aumenta a turma AO VIVO: a área nova é cópia da original e fecha igual
  const novo = o.grupos + 1;
  send(1, { type: "chat", text: `/aula grupos ${novo}` });
  const fala = msgs.get(1)?.filter((m) => m["type"] === "chat").at(-1)?.["text"];
  exigir(/Mundo ajustado/.test(String(fala ?? "")), `/aula grupos ${novo} falhou: "${fala}"`);
  const g1 = caixaDaCelula(chunkDoGrupo(1));
  const gN = caixaDaCelula(chunkDoGrupo(novo));
  const molde = save.regioes?.find((r) => r.nome === REGIAO_PARTIDA);
  let diferentes = 0;
  if (molde) {
    for (let y = molde.min.y; y <= molde.max.y; y++)
      for (let z = molde.min.z; z <= molde.max.z; z++)
        for (let x = molde.min.x; x <= molde.max.x; x++) {
          const m = getBlock(s.world, x, y, z);
          if (getBlock(s.world, gN.min.x + x - molde.min.x, y, gN.min.z + z - molde.min.z) !== m) diferentes++;
        }
  }
  exigir(!!molde && diferentes === 0, `a área do grupo ${novo} não é cópia da original (${diferentes} bloco(s) diferentes)`);
  // e o grupo 1, que mexeu nas alavancas, NÃO é mais igual ao molde (prova que a comparação enxerga)
  let mexido = 0;
  if (molde) {
    for (let z = molde.min.z; z <= molde.max.z; z++)
      for (let x = molde.min.x; x <= molde.max.x; x++)
        if (getBlock(s.world, g1.min.x + x - molde.min.x, CELULA_Y0, g1.min.z + z - molde.min.z) !== getBlock(s.world, x, CELULA_Y0, z)) mexido++;
  }
  exigir(mexido > 0, "controle: a área do grupo 1 (resolvida) devia diferir do molde");
  return problemas;
}

/** Uma linha pro log do gerador. */
export function resumoCircuitos(): string {
  return `${FASES.length} fases, resposta única em todas`;
}
