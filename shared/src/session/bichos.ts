import {
  BICHOS,
  type DefBicho,
  FLAG_BICHO,
  RAIO_CURRAL,
  TETO_CURRAL,
  TICKS_AMOR,
  TICKS_ARARA_SEGUE,
  TICKS_BOLA,
  TICKS_CRESCER,
  TICKS_DESCANSO_CRIA,
  TICKS_FUGA,
  TICKS_LA,
  TICKS_LEITE,
  TICKS_OVO_MAX,
  TICKS_OVO_MIN,
  TIPOS_BICHO,
  type TipoBicho,
  type BichoSalvo,
  type BichosSalvos,
  dropsDoBicho,
  ehIsca,
  indiceDoTipo,
  laDaTosquia,
  nomeDoBicho,
  sortearPonderado,
  tipoPorIndice,
  tipoPorNome,
  variantePorNome,
  varianteExiste,
  variantesDoBioma,
} from "../bichos";
import { type CorpoNoCaminho, acharCaminho, celulaDePe, livre, pisoEm } from "../bichos-caminho";
import { biomaPorClima } from "../biomas";
import {
  BlockId,
  ITEM_BALDE_AGUA,
  ITEM_BALDE_LEITE,
  ITEM_BALDE_PEIXE,
  ITEM_BALDE_VAZIO,
  ITEM_OVO,
  ITEM_TESOURA,
  isAgua,
  isFolhas,
  isSolidBlock,
} from "../blocks";
import { CHUNK_SIZE, PLAYER_REACH, SERVER_TICK_RATE } from "../constants";
import { gastar } from "../ferramentas";
import { type Slot, adicionar, cabe, definirSlot, remover } from "../inventario";
import { type BichoNoFio, type EventoBicho, type ServerMessage } from "../protocol";
import { valorRegra } from "../regras";
import { TICKS_ENTRE_ATAQUES } from "../sobrevivencia";
import { colunaGerada, getBlock } from "../world";
import { climaAt } from "../worldgen";
import type { GameSession } from "../session";
import { avisarComFreio } from "./avisos";
import { cabemTodos, guardarDrops, inventarioDe, inventarioVale, sendInventario } from "./inventario";
import { temPvp, vidaVale } from "./vitais";

/**
 * §🐄 MOBS PASSIVOS no servidor (2026-11-02) — o estado, a IA, o spawn, as
 * interações, o fio e o save dos bichos. A tabela (o que cada bicho É) mora em
 * `../bichos.ts`; o caminho (A*) em `../bichos-caminho.ts`.
 *
 * **A régua é o processador do notebook do professor** (pedido dele: "pensando
 * em otimização, state machine ou algo parecido"). Por isso:
 *
 * 1. **Máquina de estados por TABELA**, não árvore de comportamento: cada
 *    bicho tem UM estado (`Estado`) com prazo em ticks. O laço de um bicho
 *    parado é uma comparação de inteiros; só quem anda lê blocos.
 * 2. **Movimento cinemático na grade** (ver o cabeçalho de `bichos-caminho.ts`):
 *    o bicho anda por células que o A* já provou; física é só a gravidade.
 * 3. **Orçamento de A***: no máximo `BUSCAS_POR_TICK` buscas por tick, cada uma
 *    com teto de nós. Quem não coube espera na fila o tick seguinte — o tick
 *    nunca estoura por causa de um bando inteiro querendo andar ao mesmo tempo.
 * 4. **LOD de simulação**: só simula quem está perto de alguém
 *    (`RAIO_SIMULA`), e quem está longe (`RAIO_PERTO`..) pensa 1 tick a cada 4.
 *    Bicho em coluna não carregada CONGELA (nem gravidade: o chão dele não está
 *    na memória).
 * 5. **Fio enxuto**: cada cliente só recebe os bichos ao redor (`RAIO_VISTA`),
 *    e o movimento vai em UMA mensagem por tick com 6 números por bicho que
 *    mudou — bicho parado não custa byte.
 */

// ---------------------------------------------------------------------------
// Números
// ---------------------------------------------------------------------------

/** Quem está a até isto de algum jogador é simulado; o resto dorme. */
const RAIO_SIMULA = 64;
/** Até isto, pensa todo tick; além (até `RAIO_SIMULA`), 1 tick a cada 4. */
const RAIO_PERTO = 32;
/** O cliente só fica sabendo dos bichos a até isto dele (blocos, horizontal). */
const RAIO_VISTA = 56;
/** Teto de buscas de caminho por tick (o resto espera na fila). */
const BUSCAS_POR_TICK = 8;
const NOS_PASSEIO = 160;
const NOS_SEGUIR = 260;
/** Spawn natural: raio (em colunas de chunk) povoado ao redor de cada jogador. */
const RAIO_POVOAR = 4;
/** Chance de uma coluna nova ganhar um bando de terra / um cardume / araras. */
const CHANCE_BANDO = 0.22;
const CHANCE_CARDUME = 0.3;
const CHANCE_ARARA = 0.08;
/** Teto de bichos no MUNDO pro spawn natural (o `/bicho` do professor passa). */
const TETO_NATURAL = 600;
/** Teto do `/bicho` por comando. */
const MAX_POR_COMANDO = 20;
const GRAVIDADE = 25;
/** Alcance do clique num bicho (folga da posição a 10 Hz, como o `withinReach`). */
const ALCANCE = PLAYER_REACH + 2;
/** Dano de um golpe (o mesmo do pvp: um coração). */
const DANO_GOLPE = 2;
/** A voz (mugido…): até isto de alguém, e a chance por tick simulado (~1 a cada 30 s). */
const RAIO_VOZ = 20;
const CHANCE_VOZ = 1 / (30 * SERVER_TICK_RATE);
/** Fora d'água, o peixe perde 1 de vida a cada isto. */
const TICKS_SUFOCO_PEIXE = 20;

// ---------------------------------------------------------------------------
// Estado
// ---------------------------------------------------------------------------

/** O estado da máquina de cada bicho. */
const enum Estado {
  Parado = 0,
  Passeando = 1,
  Fugindo = 2,
  Seguindo = 3,
  Sentado = 4,
  Bola = 5,
  Voando = 6,
}

export interface Bicho {
  readonly id: number;
  readonly tipo: TipoBicho;
  readonly def: DefBicho;
  readonly variante: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  vida: number;
  estado: Estado;
  /** Tick em que o estado atual vence. */
  ate: number;
  /** Rota do A* (trincas x,y,z) e o passo atual nela. */
  rota: Int32Array | null;
  passo: number;
  /** Esperando vez na fila de caminho. */
  naFila: boolean;
  /** Pra onde a fila deve buscar (célula). */
  alvoX: number;
  alvoY: number;
  alvoZ: number;
  nosAlvo: number;
  /** Voo/nado: ponto de partida e chegada do trecho reto (ar/água). */
  vooDe: { x: number; y: number; z: number } | null;
  vooPara: { x: number; y: number; z: number } | null;
  vooT: number;
  /** Queda livre. */
  vy: number;
  caindoDe: number | null;
  // --- estado de JOGO (vai pro save, como prazo restante) ---
  filhoteAte: number;
  tosquiadaAte: number;
  leiteEm: number;
  ovoEm: number;
  ovoPronto: boolean;
  amorAte: number;
  descansoAte: number;
  dono: string | null;
  sentado: boolean;
  // --- transitório ---
  feridoAte: number;
  bolaAte: number;
  segueAte: number;
  fugaDeX: number;
  fugaDeZ: number;
  sufocoEm: number;
  /** O último estado MANDADO pelo fio (pra só mandar o que mudou). */
  fio: { x: number; y: number; z: number; yaw: number; flags: number };
  coluna: number;
}

export interface EstadoBichos {
  readonly lista: Map<number, Bicho>;
  proximoId: number;
  /** Spawn natural ligado (mundo procedural). Mundo de aula: sempre falso. */
  natural: boolean;
  /** IA DESLIGADA (`/bichos parar`, ou `?bench&bichosparados`): ninguém pensa,
   *  anda, cai nem fala — o bicho fica onde está. É pro bench (custo de
   *  DESENHO sem o de simular, e a foto sem ninguém saindo do lugar) e pro
   *  professor montar uma vitrine. Da sessão, fora do save. */
  parados: boolean;
  /** Colunas que já passaram pelo spawn natural (chave cz*dims.x+cx). */
  readonly povoadas: Set<number>;
  /** Índice espacial: coluna → ids. */
  readonly porColuna: Map<number, Set<number>>;
  /** O que cada cliente sabe que existe (o que já recebeu em `bichos`). */
  readonly vistos: Map<number, Set<number>>;
  /** O que cada jogador segura (`mao`), por cliente. */
  readonly mao: Map<number, number | null>;
  /** Velocidade horizontal estimada de cada jogador (blocos/s, suavizada). */
  readonly velocidade: Map<number, { x: number; z: number; v: number }>;
  readonly filaCaminho: number[];
  /** RNG do mundo dos bichos (xorshift32), determinístico pelo seed. */
  rng: number;
  // --- contadores pro perfilador (zerados a cada janela de 1 s) ---
  buscasJanela: number;
  nosJanela: number;
  simuladosJanela: number;
  ticksJanela: number;
  resumo: { total: number; simulados: number; buscasPorS: number; nosPorS: number };
}

export function novoEstadoBichos(seed: number, natural: boolean): EstadoBichos {
  return {
    lista: new Map(),
    proximoId: 1,
    natural,
    parados: false,
    povoadas: new Set(),
    porColuna: new Map(),
    vistos: new Map(),
    mao: new Map(),
    velocidade: new Map(),
    filaCaminho: [],
    rng: (seed ^ 0x9e3779b9) >>> 0 || 1,
    buscasJanela: 0,
    nosJanela: 0,
    simuladosJanela: 0,
    ticksJanela: 0,
    resumo: { total: 0, simulados: 0, buscasPorS: 0, nosPorS: 0 },
  };
}

function rand(st: EstadoBichos): number {
  let x = st.rng;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  st.rng = x >>> 0;
  return st.rng / 4294967296;
}

/** RNG POR COLUNA (spawn natural): a mesma coluna, no mesmo seed, dá o mesmo bando. */
function rngColuna(seed: number, cx: number, cz: number): () => number {
  let x = (Math.imul(cx, 73856093) ^ Math.imul(cz, 19349663) ^ Math.imul(seed, 83492791)) >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x / 4294967296;
  };
}

function corpoDe(def: DefBicho): CorpoNoCaminho {
  return { altura: def.altura, maxQueda: def.semDanoDeQueda ? 6 : 3, nada: def.meio === "terra" };
}

const CORPOS = new Map<TipoBicho, CorpoNoCaminho>(TIPOS_BICHO.map((t) => [t, corpoDe(BICHOS[t])]));

function colunaDe(ses: GameSession, x: number, z: number): number {
  const cx = Math.floor(x / CHUNK_SIZE);
  const cz = Math.floor(z / CHUNK_SIZE);
  return cz * ses.world.dims.x + cx;
}

function indexar(ses: GameSession, b: Bicho): void {
  const c = colunaDe(ses, b.x, b.z);
  if (c === b.coluna) return;
  ses.bichos.porColuna.get(b.coluna)?.delete(b.id);
  let s = ses.bichos.porColuna.get(c);
  if (!s) {
    s = new Set();
    ses.bichos.porColuna.set(c, s);
  }
  s.add(b.id);
  b.coluna = c;
}

function filhote(b: Bicho, tick: number): boolean {
  return b.filhoteAte > tick;
}

function flagsDe(b: Bicho, tick: number): number {
  let f = 0;
  if (filhote(b, tick)) f |= FLAG_BICHO.filhote;
  if (b.tosquiadaAte > tick) f |= FLAG_BICHO.tosquiada;
  if (b.sentado) f |= FLAG_BICHO.sentado;
  if (b.estado === Estado.Bola) f |= FLAG_BICHO.bola;
  if (b.estado === Estado.Voando) f |= FLAG_BICHO.voando;
  if (b.ovoPronto) f |= FLAG_BICHO.ovo;
  if (b.dono !== null) f |= FLAG_BICHO.domado;
  if (b.feridoAte > tick) f |= FLAG_BICHO.ferido;
  if (b.amorAte > tick) f |= FLAG_BICHO.amor;
  if (b.def.meio === "agua" && b.sufocoEm > 0) f |= FLAG_BICHO.foraDagua;
  if (b.rota !== null || b.vooPara !== null) f |= FLAG_BICHO.movendo;
  return f;
}

function noFio(b: Bicho, tick: number): BichoNoFio {
  return [b.id, indiceDoTipo(b.tipo), b.variante, r2(b.x), r2(b.y), r2(b.z), r2(b.yaw), flagsDe(b, tick)];
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ---------------------------------------------------------------------------
// Nascer e sumir
// ---------------------------------------------------------------------------

export interface OpcoesNascer {
  filhote?: boolean;
  dono?: string | null;
}

/** Cria o bicho no mundo (sem conferir chão — quem chama já achou o lugar). */
export function nascerBicho(
  ses: GameSession,
  tipo: TipoBicho,
  variante: number,
  x: number,
  y: number,
  z: number,
  opts: OpcoesNascer = {},
): Bicho {
  const st = ses.bichos;
  const def = BICHOS[tipo];
  const t = ses.tickCount;
  const b: Bicho = {
    id: st.proximoId++,
    tipo,
    def,
    variante: varianteExiste(tipo, variante) ? variante : 0,
    x,
    y,
    z,
    yaw: rand(st) * Math.PI * 2,
    vida: def.vidaMax,
    estado: def.meio === "ar" ? Estado.Parado : Estado.Parado,
    ate: t + 10 + Math.floor(rand(st) * 40),
    rota: null,
    passo: 0,
    naFila: false,
    alvoX: 0,
    alvoY: 0,
    alvoZ: 0,
    nosAlvo: NOS_PASSEIO,
    vooDe: null,
    vooPara: null,
    vooT: 0,
    vy: 0,
    caindoDe: null,
    filhoteAte: opts.filhote ? t + TICKS_CRESCER : 0,
    tosquiadaAte: 0,
    leiteEm: 0,
    ovoEm: tipo === "galinha" ? t + TICKS_OVO_MIN + Math.floor(rand(st) * (TICKS_OVO_MAX - TICKS_OVO_MIN)) : 0,
    ovoPronto: false,
    amorAte: 0,
    descansoAte: 0,
    dono: opts.dono ?? null,
    sentado: false,
    feridoAte: 0,
    bolaAte: 0,
    segueAte: 0,
    fugaDeX: 0,
    fugaDeZ: 0,
    sufocoEm: 0,
    fio: { x, y, z, yaw: 0, flags: 0 },
    coluna: -1,
  };
  st.lista.set(b.id, b);
  indexar(ses, b);
  // quem já está perto fica sabendo NA HORA (não espera a passada de 1 s)
  const add = [noFio(b, t)];
  b.fio = { x: add[0]![3], y: add[0]![4], z: add[0]![5], yaw: add[0]![6], flags: add[0]![7] };
  for (const [clientId, p] of ses.players) {
    if (Math.hypot(p.x - x, p.z - z) > RAIO_VISTA) continue;
    let v = st.vistos.get(clientId);
    if (!v) continue; // ainda sem passada de vista: a próxima o inclui
    v.add(b.id);
    ses.send(clientId, JSON.stringify({ type: "bichos", add } satisfies ServerMessage));
  }
  return b;
}

/** Tira o bicho do mundo e avisa quem o conhecia. */
export function removerBicho(ses: GameSession, b: Bicho): void {
  const st = ses.bichos;
  st.lista.delete(b.id);
  st.porColuna.get(b.coluna)?.delete(b.id);
  const raw = JSON.stringify({ type: "bichos_sumiram", ids: [b.id] } satisfies ServerMessage);
  for (const [clientId, v] of st.vistos) {
    if (v.delete(b.id)) ses.send(clientId, raw);
  }
}

function evento(ses: GameSession, b: Bicho, ev: EventoBicho): void {
  const raw = JSON.stringify({ type: "bicho_evento", id: b.id, evento: ev } satisfies ServerMessage);
  for (const [clientId, v] of ses.bichos.vistos) if (v.has(b.id)) ses.send(clientId, raw);
}

// ---------------------------------------------------------------------------
// Spawn natural
// ---------------------------------------------------------------------------

/** Topo da coluna (x,z): o primeiro bloco não-ar de cima pra baixo. */
function topo(ses: GameSession, x: number, z: number): { y: number; id: number } | null {
  for (let y = ses.world.sizeY - 1; y >= 1; y--) {
    const id = getBlock(ses.world, x, y, z);
    if (id !== BlockId.Air) return { y, id };
  }
  return null;
}

/**
 * Povoa UMA coluna de chunk pela primeira vez. Determinístico pelo seed e pela
 * coluna (a mesma coluna dá o mesmo bando), e só em coluna já gerada.
 */
function povoarColuna(ses: GameSession, cx: number, cz: number): void {
  const st = ses.bichos;
  const r = rngColuna(ses.seed, cx, cz);
  if (st.lista.size >= TETO_NATURAL) return;
  const x0 = cx * CHUNK_SIZE;
  const z0 = cz * CHUNK_SIZE;
  const sorteio = r();
  // 1) bando de terra
  if (sorteio < CHANCE_BANDO) {
    const x = x0 + 2 + Math.floor(r() * (CHUNK_SIZE - 4));
    const z = z0 + 2 + Math.floor(r() * (CHUNK_SIZE - 4));
    const t = topo(ses, x, z);
    if (t && isSolidBlock(t.id) && !isFolhas(t.id)) {
      const bioma = biomaPorClima(climaAt(x, z, ses.seed)).nome;
      const candidatos = TIPOS_BICHO.filter(
        (tp) => BICHOS[tp].meio === "terra" && BICHOS[tp].pesoSpawn > 0 && (BICHOS[tp].biomas as readonly string[]).includes(bioma),
      ).map((tp) => ({ tp, peso: BICHOS[tp].pesoSpawn }));
      const i = sortearPonderado(candidatos, r());
      if (i >= 0) {
        const tipo = candidatos[i]!.tp;
        bando(ses, tipo, bioma, x, t.y + 1, z, r);
      }
    }
  }
  // 2) cardume: a coluna tem água de superfície com fundo
  if (r() < CHANCE_CARDUME) {
    const x = x0 + 2 + Math.floor(r() * (CHUNK_SIZE - 4));
    const z = z0 + 2 + Math.floor(r() * (CHUNK_SIZE - 4));
    const t = topo(ses, x, z);
    if (t && isAgua(t.id) && isAgua(getBlock(ses.world, x, t.y - 1, z))) {
      const bioma = biomaPorClima(climaAt(x, z, ses.seed)).nome;
      bando(ses, "peixe", bioma, x, t.y - 1, z, r);
    }
  }
  // 3) araras na copa
  if (r() < CHANCE_ARARA) {
    const x = x0 + 1 + Math.floor(r() * (CHUNK_SIZE - 2));
    const z = z0 + 1 + Math.floor(r() * (CHUNK_SIZE - 2));
    const t = topo(ses, x, z);
    if (t && isFolhas(t.id)) {
      const bioma = biomaPorClima(climaAt(x, z, ses.seed)).nome;
      if ((BICHOS.arara.biomas as readonly string[]).includes(bioma)) bando(ses, "arara", bioma, x, t.y + 1, z, r);
    }
  }
}

function bando(ses: GameSession, tipo: TipoBicho, bioma: string, x: number, y: number, z: number, r: () => number): void {
  const def = BICHOS[tipo];
  const vars = variantesDoBioma(tipo, bioma);
  if (vars.length === 0) return;
  const [mn, mx] = def.bando;
  const n = mn + Math.floor(r() * (mx - mn + 1));
  const corpo = CORPOS.get(tipo)!;
  for (let k = 0; k < n; k++) {
    const vx = x + Math.floor(r() * 5) - 2;
    const vz = z + Math.floor(r() * 5) - 2;
    const v = vars[sortearPonderado(vars, r())]!.i;
    if (def.meio === "agua") {
      if (!isAgua(getBlock(ses.world, vx, y, vz))) continue;
      nascerBicho(ses, tipo, v, vx + 0.5, y + 0.2, vz + 0.5);
    } else if (def.meio === "ar") {
      if (!livre(getBlock(ses.world, vx, y, vz)) || !isSolidBlock(getBlock(ses.world, vx, y - 1, vz))) continue;
      nascerBicho(ses, tipo, v, vx + 0.5, y, vz + 0.5);
    } else {
      const c = celulaDePe(ses.world, vx, y, vz, corpo, 2, 3);
      if (!c || isAgua(getBlock(ses.world, vx, c.y, vz))) continue;
      nascerBicho(ses, tipo, v, vx + 0.5, c.piso, vz + 0.5);
    }
  }
}

/** Passada de 1 s: povoa as colunas novas perto de quem está jogando. */
function povoarPerto(ses: GameSession): void {
  const st = ses.bichos;
  if (!st.natural || ses.somenteLeitura) return;
  const dims = ses.world.dims;
  for (const p of ses.players.values()) {
    const pcx = Math.floor(p.x / CHUNK_SIZE);
    const pcz = Math.floor(p.z / CHUNK_SIZE);
    for (let dx = -RAIO_POVOAR; dx <= RAIO_POVOAR; dx++) {
      for (let dz = -RAIO_POVOAR; dz <= RAIO_POVOAR; dz++) {
        const cx = pcx + dx;
        const cz = pcz + dz;
        if (cx < 0 || cz < 0 || cx >= dims.x || cz >= dims.z) continue;
        const k = cz * dims.x + cx;
        if (st.povoadas.has(k)) continue;
        if (!colunaGerada(ses.world, cx, cz)) continue;
        st.povoadas.add(k);
        povoarColuna(ses, cx, cz);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Vista (o que cada cliente recebe)
// ---------------------------------------------------------------------------

function passarVista(ses: GameSession, clientId: number): void {
  const st = ses.bichos;
  const p = ses.players.get(clientId);
  if (!p) return;
  let v = st.vistos.get(clientId);
  if (!v) {
    v = new Set();
    st.vistos.set(clientId, v);
  }
  const t = ses.tickCount;
  const agora = new Set<number>();
  const add: BichoNoFio[] = [];
  const raio = Math.ceil(RAIO_VISTA / CHUNK_SIZE);
  const pcx = Math.floor(p.x / CHUNK_SIZE);
  const pcz = Math.floor(p.z / CHUNK_SIZE);
  const dims = ses.world.dims;
  for (let dx = -raio; dx <= raio; dx++) {
    for (let dz = -raio; dz <= raio; dz++) {
      const cx = pcx + dx;
      const cz = pcz + dz;
      if (cx < 0 || cz < 0 || cx >= dims.x || cz >= dims.z) continue;
      const ids = st.porColuna.get(cz * dims.x + cx);
      if (!ids) continue;
      for (const id of ids) {
        const b = st.lista.get(id);
        if (!b || Math.hypot(b.x - p.x, b.z - p.z) > RAIO_VISTA) continue;
        agora.add(id);
        if (!v.has(id)) add.push(noFio(b, t));
      }
    }
  }
  const sumiram: number[] = [];
  for (const id of v) if (!agora.has(id)) sumiram.push(id);
  st.vistos.set(clientId, agora);
  if (add.length) ses.send(clientId, JSON.stringify({ type: "bichos", add } satisfies ServerMessage));
  if (sumiram.length) ses.send(clientId, JSON.stringify({ type: "bichos_sumiram", ids: sumiram } satisfies ServerMessage));
}

/** Quem saiu esquece o que via (e a mão). */
export function esquecerBichosDoCliente(ses: GameSession, clientId: number): void {
  ses.bichos.vistos.delete(clientId);
  ses.bichos.mao.delete(clientId);
  ses.bichos.velocidade.delete(clientId);
}

/** Depois de uma troca de mundo/reconexão o cliente limpou os bichos: refaz a vista. */
export function reenviarVista(ses: GameSession, clientId: number): void {
  ses.bichos.vistos.delete(clientId);
  passarVista(ses, clientId);
}

// ---------------------------------------------------------------------------
// O tick
// ---------------------------------------------------------------------------

/** Jogador mais perto (distância horizontal) e a distância. */
function maisPerto(ses: GameSession, x: number, z: number): { id: number; d: number } | null {
  let melhor: { id: number; d: number } | null = null;
  for (const [id, p] of ses.players) {
    if (ses.invisiveis.has(id)) continue;
    const d = Math.hypot(p.x - x, p.z - z);
    if (!melhor || d < melhor.d) melhor = { id, d };
  }
  return melhor;
}

export function tickBichos(ses: GameSession): void {
  const st = ses.bichos;
  const t = ses.tickCount;
  // velocidade dos jogadores (a criança CORRENDO assusta o gato e enrola o tatu)
  for (const [id, p] of ses.players) {
    const ant = st.velocidade.get(id);
    if (!ant) {
      st.velocidade.set(id, { x: p.x, z: p.z, v: 0 });
      continue;
    }
    const inst = Math.hypot(p.x - ant.x, p.z - ant.z) * SERVER_TICK_RATE;
    ant.v = ant.v * 0.6 + Math.min(inst, 20) * 0.4;
    ant.x = p.x;
    ant.z = p.z;
  }
  const segundo = t % SERVER_TICK_RATE === 0;
  if (segundo) {
    povoarPerto(ses);
    for (const clientId of ses.players.keys()) passarVista(ses, clientId);
  } else {
    // cliente novo não espera o segundo cheio pra ver os bichos
    for (const clientId of ses.players.keys()) if (!st.vistos.has(clientId)) passarVista(ses, clientId);
  }
  if (st.parados) {
    // parados: ninguém pensa nem anda, mas o que MUDOU por fora (o giro da
    // vitrine, a tosquia, o domado) ainda tem de chegar ao cliente
    enviarMovidos(ses);
    fecharJanela(st, segundo);
    return;
  }
  if (st.lista.size === 0) {
    fecharJanela(st, segundo);
    return;
  }
  // a fila de caminho: no máximo BUSCAS_POR_TICK por tick
  let orcamento = BUSCAS_POR_TICK;
  while (orcamento > 0 && st.filaCaminho.length > 0) {
    const id = st.filaCaminho.shift()!;
    const b = st.lista.get(id);
    if (!b || !b.naFila) continue;
    b.naFila = false;
    buscar(ses, b);
    orcamento--;
  }
  let simulados = 0;
  const dims = ses.world.dims;
  for (const b of st.lista.values()) {
    // coluna fora da memória: o bicho congela (o chão dele não existe agora)
    const cx = Math.floor(b.x / CHUNK_SIZE);
    const cz = Math.floor(b.z / CHUNK_SIZE);
    if (cx < 0 || cz < 0 || cx >= dims.x || cz >= dims.z || !colunaGerada(ses.world, cx, cz)) continue;
    const perto = maisPerto(ses, b.x, b.z);
    if (!perto || perto.d > RAIO_SIMULA) continue;
    if (perto.d > RAIO_PERTO && (b.id + t) % 4 !== 0) continue;
    const dt = perto.d > RAIO_PERTO ? 0.4 : 1 / SERVER_TICK_RATE;
    simulados++;
    pensar(ses, b, perto, dt);
    if (!st.lista.has(b.id)) continue; // morreu (peixe sem água, queda)
    // a VOZ (o mugido, o cacarejo): ~1 vez a cada 30 s, só perto de alguém (o
    // som da outra thread atenua pela distância; longe seria byte à toa). Peixe
    // não fala.
    if (perto.d <= RAIO_VOZ && b.def.meio !== "agua" && rand(st) < CHANCE_VOZ) evento(ses, b, "voz");
    mover(ses, b, dt);
    indexar(ses, b);
  }
  st.simuladosJanela += simulados;
  enviarMovidos(ses);
  fecharJanela(st, segundo);
}

function fecharJanela(st: EstadoBichos, segundo: boolean): void {
  st.ticksJanela++;
  if (!segundo) return;
  const n = Math.max(1, st.ticksJanela);
  st.resumo = {
    total: st.lista.size,
    simulados: Math.round(st.simuladosJanela / n),
    buscasPorS: st.buscasJanela,
    nosPorS: st.nosJanela,
  };
  st.buscasJanela = st.nosJanela = st.simuladosJanela = st.ticksJanela = 0;
}

/** Manda, a cada cliente, os bichos que ele vê e que MUDARAM desde o último envio. */
function enviarMovidos(ses: GameSession): void {
  const st = ses.bichos;
  const t = ses.tickCount;
  const mudados: Bicho[] = [];
  for (const b of st.lista.values()) {
    const f = flagsDe(b, t);
    const x = r2(b.x), y = r2(b.y), z = r2(b.z), yaw = r2(b.yaw);
    if (x === b.fio.x && y === b.fio.y && z === b.fio.z && yaw === b.fio.yaw && f === b.fio.flags) continue;
    b.fio = { x, y, z, yaw, flags: f };
    mudados.push(b);
  }
  if (mudados.length === 0) return;
  for (const [clientId, v] of st.vistos) {
    const m: number[] = [];
    for (const b of mudados) {
      if (!v.has(b.id)) continue;
      m.push(b.id, b.fio.x, b.fio.y, b.fio.z, b.fio.yaw, b.fio.flags);
    }
    if (m.length) ses.send(clientId, JSON.stringify({ type: "bichos_movidos", m } satisfies ServerMessage));
  }
}

// ---------------------------------------------------------------------------
// A IA (a máquina de estados)
// ---------------------------------------------------------------------------

/** O jogador segura a isca deste bicho? */
function seguraIsca(ses: GameSession, clientId: number, b: Bicho): boolean {
  const id = ses.bichos.mao.get(clientId);
  if (id === undefined || id === null) return false;
  if (ehIsca(b.tipo, id)) return true;
  // o selvagem domável também segue quem tem o item de domar (o cão e a carne)
  return b.dono === null && (b.def.domar?.itens.includes(id) ?? false);
}

function pedirCaminho(ses: GameSession, b: Bicho, x: number, y: number, z: number, nos: number): void {
  b.alvoX = x;
  b.alvoY = y;
  b.alvoZ = z;
  b.nosAlvo = nos;
  if (!b.naFila) {
    b.naFila = true;
    ses.bichos.filaCaminho.push(b.id);
  }
}

function buscar(ses: GameSession, b: Bicho): void {
  const st = ses.bichos;
  const corpo = CORPOS.get(b.tipo)!;
  const fx = Math.floor(b.x);
  const fz = Math.floor(b.z);
  const ini = celulaDePe(ses.world, fx, Math.floor(b.y + 0.01), fz, corpo, 1, 1);
  st.buscasJanela++;
  if (!ini) {
    b.rota = null;
    return;
  }
  const c = acharCaminho(ses.world, fx, ini.y, fz, b.alvoX, b.alvoY, b.alvoZ, corpo, b.nosAlvo);
  if (!c) {
    b.rota = null;
    return;
  }
  st.nosJanela += c.nos;
  b.rota = c.celulas.length > 0 ? c.celulas : null;
  b.passo = 0;
}

function pararDeAndar(b: Bicho): void {
  b.rota = null;
  b.naFila = false;
}

/** Um ponto de passeio a 4..10 blocos, numa célula de pé. */
function pontoDePasseio(ses: GameSession, b: Bicho, raioMin = 4, raioMax = 10): { x: number; y: number; z: number } | null {
  const st = ses.bichos;
  const corpo = CORPOS.get(b.tipo)!;
  for (let k = 0; k < 4; k++) {
    const ang = rand(st) * Math.PI * 2;
    const d = raioMin + rand(st) * (raioMax - raioMin);
    const x = Math.floor(b.x + Math.cos(ang) * d);
    const z = Math.floor(b.z + Math.sin(ang) * d);
    const c = celulaDePe(ses.world, x, Math.floor(b.y), z, corpo, 3, 4);
    if (!c) continue;
    if (isAgua(getBlock(ses.world, x, c.y, z))) continue; // passeio não é nado
    return { x, y: c.y, z };
  }
  return null;
}

/** Ponto de FUGA: longe de quem bateu, na direção oposta. */
function pontoDeFuga(ses: GameSession, b: Bicho): { x: number; y: number; z: number } | null {
  const corpo = CORPOS.get(b.tipo)!;
  const dx = b.x - b.fugaDeX;
  const dz = b.z - b.fugaDeZ;
  const len = Math.hypot(dx, dz) || 1;
  for (let k = 0; k < 4; k++) {
    const ang = Math.atan2(dz, dx) + (rand(ses.bichos) - 0.5) * (k + 1) * 0.6;
    const d = 7 + rand(ses.bichos) * 4;
    const x = Math.floor(b.x + Math.cos(ang) * d);
    const z = Math.floor(b.z + Math.sin(ang) * d);
    const c = celulaDePe(ses.world, x, Math.floor(b.y), z, corpo, 3, 4);
    if (c) return { x, y: c.y, z };
  }
  void len;
  return null;
}

function pensar(ses: GameSession, b: Bicho, perto: { id: number; d: number }, dt: number): void {
  const t = ses.tickCount;
  // relógios de jogo (independem do estado)
  if (b.filhoteAte !== 0 && b.filhoteAte <= t) b.filhoteAte = 0;
  if (b.tosquiadaAte !== 0 && b.tosquiadaAte <= t) b.tosquiadaAte = 0;
  if (b.tipo === "galinha" && !b.ovoPronto && b.filhoteAte === 0 && b.ovoEm !== 0 && b.ovoEm <= t) b.ovoPronto = true;
  if (b.def.meio === "agua") return pensarPeixe(ses, b, dt);
  if (b.def.meio === "ar") return pensarArara(ses, b, perto);
  pensarTerra(ses, b, perto);
}

function pensarTerra(ses: GameSession, b: Bicho, perto: { id: number; d: number }): void {
  const st = ses.bichos;
  const t = ses.tickCount;
  // 1) a bola do tatu: dura enquanto houver ameaça; sem ela, desenrola
  if (b.tipo === "tatu") {
    const ameaca = [...ses.players].some(([id, p]) => {
      if (Math.hypot(p.x - b.x, p.z - b.z) > 3) return false;
      return (st.velocidade.get(id)?.v ?? 0) > 4.5;
    });
    if (ameaca) {
      if (b.estado !== Estado.Bola) evento(ses, b, "bola");
      b.bolaAte = t + TICKS_BOLA;
    }
    if (b.bolaAte > t) {
      b.estado = Estado.Bola;
      pararDeAndar(b);
      return;
    }
    if (b.estado === Estado.Bola) {
      b.estado = Estado.Parado;
      b.ate = t + 20;
    }
  }
  // 2) sentado (domado): fica
  if (b.sentado) {
    b.estado = Estado.Sentado;
    pararDeAndar(b);
    return;
  }
  // 3) fugindo
  if (b.estado === Estado.Fugindo) {
    if (b.ate > t) {
      if (!b.rota && !b.naFila) {
        const f = pontoDeFuga(ses, b);
        if (f) pedirCaminho(ses, b, f.x, f.y, f.z, NOS_PASSEIO);
      }
      return;
    }
    b.estado = Estado.Parado;
    b.ate = t + 20;
  }
  // 4) o gato arisco: foge de quem chega correndo
  if (b.tipo === "gato" && b.dono === null) {
    for (const [id, p] of ses.players) {
      if (Math.hypot(p.x - b.x, p.z - b.z) > 5) continue;
      if ((st.velocidade.get(id)?.v ?? 0) < 3) continue;
      if (seguraIsca(ses, id, b)) continue;
      assustar(ses, b, p.x, p.z);
      return;
    }
  }
  // 5) amor: procura o par
  if (b.amorAte > t) {
    const par = acharPar(ses, b);
    if (par) {
      const d = Math.hypot(par.x - b.x, par.z - b.z);
      if (d < 1.6) {
        criar(ses, b, par);
        return;
      }
      if (!b.naFila && (!b.rota || (t + b.id) % 10 === 0)) {
        pedirCaminho(ses, b, Math.floor(par.x), Math.floor(par.y + 0.01), Math.floor(par.z), NOS_SEGUIR);
      }
      b.estado = Estado.Seguindo;
      return;
    }
  }
  // 6) domado: segue o dono
  if (b.dono !== null) {
    const dono = [...ses.players].find(([, p]) => p.name === b.dono);
    if (dono) {
      const [, p] = dono;
      const d = Math.hypot(p.x - b.x, p.z - b.z);
      if (d > 14 || Math.abs(p.y - b.y) > 8) {
        teleportarPerto(ses, b, p.x, p.y, p.z);
        return;
      }
      if (d > 4) {
        if (!b.naFila && (!b.rota || (t + b.id) % 10 === 0)) {
          pedirCaminho(ses, b, Math.floor(p.x), Math.floor(p.y + 0.01), Math.floor(p.z), NOS_SEGUIR);
        }
        b.estado = Estado.Seguindo;
        return;
      }
      if (b.estado === Estado.Seguindo) {
        pararDeAndar(b);
        b.estado = Estado.Parado;
        b.ate = t + 20;
      }
    }
  }
  // 7) isca na mão de alguém por perto: segue
  if (perto.d <= 8) {
    for (const [id, p] of ses.players) {
      const d = Math.hypot(p.x - b.x, p.z - b.z);
      if (d > 8 || !seguraIsca(ses, id, b)) continue;
      // o gato só chega perto de quem está CALMO (parado ou agachado)
      if (b.tipo === "gato" && (st.velocidade.get(id)?.v ?? 0) > 1.5) continue;
      b.estado = Estado.Seguindo;
      if (d > 2.2) {
        if (!b.naFila && (!b.rota || (t + b.id) % 10 === 0)) {
          pedirCaminho(ses, b, Math.floor(p.x), Math.floor(p.y + 0.01), Math.floor(p.z), NOS_SEGUIR);
        }
      } else {
        pararDeAndar(b);
        b.yaw = Math.atan2(-(p.x - b.x), -(p.z - b.z));
      }
      return;
    }
    if (b.estado === Estado.Seguindo) {
      pararDeAndar(b);
      b.estado = Estado.Parado;
      b.ate = t + 20;
    }
  }
  // 8) o ciclo de sempre: parado ↔ passeando
  if (b.estado === Estado.Seguindo) b.estado = Estado.Parado;
  if (b.estado === Estado.Passeando) {
    if (!b.rota && !b.naFila) {
      b.estado = Estado.Parado;
      b.ate = t + 20 + Math.floor(rand(st) * 60);
    }
    return;
  }
  if (b.ate > t) {
    // olha em volta de vez em quando (a cabeça viva vem do cliente)
    if (rand(st) < 0.02) b.yaw += (rand(st) - 0.5) * 1.2;
    return;
  }
  const alvo = pontoDePasseio(ses, b);
  if (!alvo) {
    b.ate = t + 30;
    return;
  }
  b.estado = Estado.Passeando;
  pedirCaminho(ses, b, alvo.x, alvo.y, alvo.z, NOS_PASSEIO);
}

function assustar(ses: GameSession, b: Bicho, deX: number, deZ: number): void {
  b.estado = Estado.Fugindo;
  b.ate = ses.tickCount + TICKS_FUGA;
  b.fugaDeX = deX;
  b.fugaDeZ = deZ;
  b.sentado = false;
  pararDeAndar(b);
}

function teleportarPerto(ses: GameSession, b: Bicho, x: number, y: number, z: number): void {
  const corpo = CORPOS.get(b.tipo)!;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [2, 0], [0, 2]] as const) {
    const c = celulaDePe(ses.world, Math.floor(x) + dx, Math.floor(y), Math.floor(z) + dz, corpo, 1, 2);
    if (!c) continue;
    pararDeAndar(b);
    b.x = Math.floor(x) + dx + 0.5;
    b.y = c.piso;
    b.z = Math.floor(z) + dz + 0.5;
    b.vy = 0;
    b.caindoDe = null;
    return;
  }
}

function acharPar(ses: GameSession, b: Bicho): Bicho | null {
  const t = ses.tickCount;
  let melhor: Bicho | null = null;
  let md = 8;
  for (const o of ses.bichos.lista.values()) {
    if (o === b || o.tipo !== b.tipo || o.amorAte <= t || filhote(o, t)) continue;
    const d = Math.hypot(o.x - b.x, o.z - b.z);
    if (d < md) {
      md = d;
      melhor = o;
    }
  }
  return melhor;
}

function criar(ses: GameSession, a: Bicho, b: Bicho): void {
  const t = ses.tickCount;
  a.amorAte = b.amorAte = 0;
  a.descansoAte = b.descansoAte = t + TICKS_DESCANSO_CRIA;
  pararDeAndar(a);
  pararDeAndar(b);
  a.estado = b.estado = Estado.Parado;
  const pai = rand(ses.bichos) < 0.5 ? a : b;
  const cria = nascerBicho(ses, a.tipo, pai.variante, (a.x + b.x) / 2, Math.max(a.y, b.y), (a.z + b.z) / 2, {
    filhote: true,
  });
  evento(ses, cria, "cria");
}

// --- água ---------------------------------------------------------------

function pensarPeixe(ses: GameSession, b: Bicho, dt: number): void {
  const st = ses.bichos;
  const t = ses.tickCount;
  const fx = Math.floor(b.x), fy = Math.floor(b.y), fz = Math.floor(b.z);
  const naAgua = isAgua(getBlock(ses.world, fx, fy, fz));
  if (!naAgua) {
    // fora d'água: se debate e perde vida devagar (até cair de volta)
    b.vooPara = null;
    if (b.sufocoEm === 0) b.sufocoEm = t + TICKS_SUFOCO_PEIXE;
    if (b.sufocoEm <= t) {
      b.sufocoEm = t + TICKS_SUFOCO_PEIXE;
      ferir(ses, b, 1, null);
    }
    void dt;
    return;
  }
  b.sufocoEm = 0;
  if (b.vooPara && b.vooT < 1) return;
  if (b.ate > t && b.estado !== Estado.Fugindo) return;
  // um ponto de água a até 5 blocos
  for (let k = 0; k < 6; k++) {
    let ang = rand(st) * Math.PI * 2;
    if (b.estado === Estado.Fugindo) ang = Math.atan2(b.z - b.fugaDeZ, b.x - b.fugaDeX) + (rand(st) - 0.5);
    const d = 2 + rand(st) * 4;
    const x = Math.floor(b.x + Math.cos(ang) * d);
    const z = Math.floor(b.z + Math.sin(ang) * d);
    const y = fy + Math.floor(rand(st) * 3) - 1;
    if (!isAgua(getBlock(ses.world, x, y, z))) continue;
    if (!retaNaAgua(ses, b.x, b.y, b.z, x + 0.5, y + 0.4, z + 0.5)) continue;
    b.vooDe = { x: b.x, y: b.y, z: b.z };
    b.vooPara = { x: x + 0.5, y: y + 0.4, z: z + 0.5 };
    b.vooT = 0;
    b.estado = b.estado === Estado.Fugindo && b.ate > t ? Estado.Fugindo : Estado.Passeando;
    return;
  }
  b.estado = Estado.Parado;
  b.ate = t + 20 + Math.floor(rand(st) * 40);
}

function retaNaAgua(ses: GameSession, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): boolean {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0, z1 - z0) * 2);
  for (let i = 1; i <= n; i++) {
    const k = i / n;
    const id = getBlock(ses.world, Math.floor(x0 + (x1 - x0) * k), Math.floor(y0 + (y1 - y0) * k), Math.floor(z0 + (z1 - z0) * k));
    if (!isAgua(id)) return false;
  }
  return true;
}

// --- ar -----------------------------------------------------------------

function pensarArara(ses: GameSession, b: Bicho, perto: { id: number; d: number }): void {
  const st = ses.bichos;
  const t = ses.tickCount;
  if (b.estado === Estado.Voando && b.vooPara && b.vooT < 1) return;
  // alimentada: segue quem tem a fruta (paira por cima do ombro)
  if (b.segueAte > t || perto.d <= 8) {
    for (const [id, p] of ses.players) {
      const d = Math.hypot(p.x - b.x, p.z - b.z);
      if (d > 10) continue;
      if (b.segueAte <= t && !seguraIsca(ses, id, b)) continue;
      if (d > 2.5 || Math.abs(p.y + 2.2 - b.y) > 1.5) voarPara(b, p.x + 0.8, p.y + 2.2, p.z + 0.8);
      else b.yaw = Math.atan2(-(p.x - b.x), -(p.z - b.z));
      return;
    }
  }
  // pousada: o chão de baixo sumiu, alguém chegou perto, ou deu vontade
  const apoio = isSolidBlock(getBlock(ses.world, Math.floor(b.x), Math.floor(b.y - 0.05), Math.floor(b.z)));
  const assustada = perto.d < 5;
  if (apoio && !assustada && b.ate > t) {
    b.estado = Estado.Parado;
    return;
  }
  const poleiro = acharPoleiro(ses, b);
  if (poleiro) voarPara(b, poleiro.x, poleiro.y, poleiro.z);
  else if (!apoio) voarPara(b, b.x + (rand(st) - 0.5) * 8, b.y - 1, b.z + (rand(st) - 0.5) * 8);
  else b.ate = t + 60;
}

function voarPara(b: Bicho, x: number, y: number, z: number): void {
  b.estado = Estado.Voando;
  b.vooDe = { x: b.x, y: b.y, z: b.z };
  b.vooPara = { x, y, z };
  b.vooT = 0;
}

/** Uma copa (ou topo qualquer) a 6..16 blocos com ar em cima. */
function acharPoleiro(ses: GameSession, b: Bicho): { x: number; y: number; z: number } | null {
  const st = ses.bichos;
  for (let k = 0; k < 10; k++) {
    const ang = rand(st) * Math.PI * 2;
    const d = 6 + rand(st) * 10;
    const x = Math.floor(b.x + Math.cos(ang) * d);
    const z = Math.floor(b.z + Math.sin(ang) * d);
    const tp = topo(ses, x, z);
    if (!tp || isAgua(tp.id) || !isSolidBlock(tp.id)) continue;
    if (k < 6 && !isFolhas(tp.id)) continue; // primeiro tenta COPA; depois qualquer topo
    if (!livre(getBlock(ses.world, x, tp.y + 1, z)) || !livre(getBlock(ses.world, x, tp.y + 2, z))) continue;
    return { x: x + 0.5, y: tp.y + 1, z: z + 0.5 };
  }
  return null;
}

// ---------------------------------------------------------------------------
// O movimento
// ---------------------------------------------------------------------------

function mover(ses: GameSession, b: Bicho, dt: number): void {
  if (b.def.meio === "ar" || (b.def.meio === "agua" && b.sufocoEm === 0)) {
    moverReto(ses, b, dt);
    return;
  }
  const corpo = CORPOS.get(b.tipo)!;
  const vel = b.estado === Estado.Fugindo ? b.def.velocidadeFuga : b.def.velocidade * (filhote(b, ses.tickCount) ? 1.2 : 1);
  if (b.rota && b.vy === 0) {
    const i = b.passo * 3;
    const cx = b.rota[i]!, cy = b.rota[i + 1]!, cz = b.rota[i + 2]!;
    const piso = pisoEm(ses.world, cx, cy, cz, corpo);
    if (piso === null) {
      // o mundo mudou no caminho: recalcula de onde está
      pararDeAndar(b);
    } else {
      const tx = cx + 0.5, tz = cz + 0.5;
      const dx = tx - b.x, dz = tz - b.z;
      const d = Math.hypot(dx, dz);
      const passo = vel * dt;
      if (d > 1e-3) b.yaw = Math.atan2(-dx, -dz);
      if (d <= passo) {
        b.x = tx;
        b.z = tz;
        b.y = piso;
        b.passo++;
        if (b.passo * 3 >= b.rota.length) b.rota = null;
      } else {
        b.x += (dx / d) * passo;
        b.z += (dz / d) * passo;
        // sobe/desce acompanhando o piso do próximo passo: degrau sobe na
        // metade final do passo (o "pulinho"), descida acompanha a distância
        if (piso > b.y) {
          if (d < 0.7) b.y = Math.min(piso, b.y + 6 * dt);
        } else if (piso < b.y) {
          b.y = Math.max(piso, b.y - Math.max(4 * dt, (b.y - piso) * (passo / Math.max(d, passo))));
        }
      }
      return;
    }
  }
  assentar(ses, b, corpo, dt);
}

/** Gravidade e "não ficar dentro de bloco", pra quem não está andando. */
function assentar(ses: GameSession, b: Bicho, corpo: CorpoNoCaminho, dt: number): void {
  const fx = Math.floor(b.x), fz = Math.floor(b.z);
  const fy = Math.floor(b.y + 0.01);
  const aqui = pisoEm(ses.world, fx, fy, fz, corpo);
  if (aqui !== null && Math.abs(aqui - b.y) < 0.6) {
    // apoiado (ou quase): encosta no piso
    pousar(ses, b, aqui);
    return;
  }
  // dentro de bloco (alguém construiu em cima): sobe pro vão mais perto
  if (!livre(getBlock(ses.world, fx, fy, fz)) && aqui === null) {
    const c = celulaDePe(ses.world, fx, fy, fz, corpo, 3, 0);
    if (c) {
      b.y = c.piso;
      b.vy = 0;
      b.caindoDe = null;
      return;
    }
  }
  // no ar: cai
  if (b.caindoDe === null) b.caindoDe = b.y;
  b.vy = Math.max(-40, b.vy - GRAVIDADE * dt);
  const novoY = b.y + b.vy * dt;
  // pousa no primeiro piso que cruzar
  for (let y = fy; y >= Math.floor(novoY) - 1 && y >= 0; y--) {
    const p = pisoEm(ses.world, fx, y, fz, corpo);
    if (p !== null && p <= b.y + 1e-3 && p >= novoY) {
      pousar(ses, b, p);
      return;
    }
  }
  b.y = novoY;
  if (b.y < -16) removerBicho(ses, b); // caiu do mundo
}

function pousar(ses: GameSession, b: Bicho, piso: number): void {
  if (b.caindoDe !== null) {
    const queda = b.caindoDe - piso;
    b.caindoDe = null;
    if (queda > 3.5 && !b.def.semDanoDeQueda && !isAgua(getBlock(ses.world, Math.floor(b.x), Math.floor(piso), Math.floor(b.z)))) {
      ferir(ses, b, Math.floor(queda - 3), null);
    }
  }
  b.vy = 0;
  b.y = piso;
}

/** Ar e água: trecho reto (a arara em arco) entre `vooDe` e `vooPara`. */
function moverReto(ses: GameSession, b: Bicho, dt: number): void {
  if (!b.vooPara || !b.vooDe) {
    // parado: a arara pousada não cai (está apoiada); sem apoio, a IA já pediu voo
    return;
  }
  const de = b.vooDe, para = b.vooPara;
  const dist = Math.hypot(para.x - de.x, para.y - de.y, para.z - de.z);
  const vel = b.estado === Estado.Fugindo ? b.def.velocidadeFuga : b.def.velocidade;
  b.vooT = Math.min(1, b.vooT + (dist > 1e-3 ? (vel * dt) / dist : 1));
  const k = b.vooT;
  const arco = b.def.meio === "ar" ? Math.max(1.5, dist * 0.25) * 4 * k * (1 - k) : 0;
  b.x = de.x + (para.x - de.x) * k;
  b.y = de.y + (para.y - de.y) * k + arco;
  b.z = de.z + (para.z - de.z) * k;
  const dx = para.x - de.x, dz = para.z - de.z;
  if (Math.hypot(dx, dz) > 1e-3) b.yaw = Math.atan2(-dx, -dz);
  if (b.vooT >= 1) {
    b.vooPara = null;
    b.vooDe = null;
    if (b.def.meio === "ar") {
      b.estado = Estado.Parado;
      b.ate = ses.tickCount + 200 + Math.floor(rand(ses.bichos) * 400);
    } else {
      b.estado = Estado.Parado;
      b.ate = ses.tickCount + 10 + Math.floor(rand(ses.bichos) * 30);
    }
  }
}

// ---------------------------------------------------------------------------
// Dano e morte
// ---------------------------------------------------------------------------

/** Tira vida; `quem` = cliente que bateu (null = queda, sufoco). */
function ferir(ses: GameSession, b: Bicho, pontos: number, quem: number | null): void {
  const t = ses.tickCount;
  b.vida -= pontos;
  b.feridoAte = t + 4;
  evento(ses, b, b.vida > 0 ? "dano" : "morte");
  if (b.vida > 0) return;
  // morreu
  if (quem !== null) {
    const p = ses.players.get(quem);
    if (p && inventarioVale(ses, quem)) {
      const drops = dropsDoBicho(b.tipo, b.variante, filhote(b, t), b.tosquiadaAte > t, () => rand(ses.bichos));
      if (drops.length) {
        if (cabemTodos(inventarioDe(ses, p.name), drops)) guardarDrops(ses, quem, drops);
        else avisarComFreio(ses, quem, "A mochila está cheia — o que o bicho deu se perdeu.");
      }
    }
  }
  if (b.dono !== null) {
    for (const [id, p] of ses.players) {
      if (p.name === b.dono) ses.sendServerChat(id, `${b.def.artigo === "a" ? "A sua" : "O seu"} ${nomeDoBicho(b.tipo, b.variante)} morreu.`);
    }
  }
  removerBicho(ses, b);
}

/** O nome com artigo ("o vira-lata caramelo", "a vaca malhada"). */
function comArtigo(b: Bicho): string {
  return `${b.def.artigo} ${nomeDoBicho(b.tipo, b.variante)}`;
}

/** Clique esquerdo num bicho (`bater_bicho`). */
export function baterBicho(ses: GameSession, clientId: number, id: number): void {
  const p = ses.players.get(clientId);
  const b = ses.bichos.lista.get(id);
  if (!p || !b) return;
  ses.broadcast({ type: "gesto", id: clientId, gesto: "bater" });
  if (ses.somenteLeitura) return; // aula: bicho não apanha
  if (!vidaVale(ses, clientId)) return; // criativo não machuca (não tem o que perder)
  if (!valorRegra(ses.regras, "machucar-bichos")) {
    avisarComFreio(ses, clientId, "Neste mundo os bichos não se machucam (o professor liga com /regra machucar-bichos ligar).");
    return;
  }
  if (b.dono !== null && b.dono !== p.name && !temPvp(ses)) {
    avisarComFreio(ses, clientId, `${capitalizar(comArtigo(b))} é de ${b.dono} — só dá pra machucar bicho dos outros com o pvp ligado.`);
    return;
  }
  if (Math.hypot(b.x - p.x, b.y + b.def.altura / 2 - (p.y + 1), b.z - p.z) > ALCANCE) return;
  const ultimo = ses.ultimoAtaque.get(clientId) ?? -Infinity;
  if (ses.tickCount - ultimo < TICKS_ENTRE_ATAQUES) return;
  ses.ultimoAtaque.set(clientId, ses.tickCount);
  if (b.estado === Estado.Bola) {
    evento(ses, b, "bola"); // o casco segura: nada de dano
    b.bolaAte = ses.tickCount + TICKS_BOLA;
    return;
  }
  // empurrão: meio bloco pra longe de quem bateu, se couber
  const dx = b.x - p.x, dz = b.z - p.z;
  const len = Math.hypot(dx, dz) || 1;
  const nx = b.x + (dx / len) * 0.5, nz = b.z + (dz / len) * 0.5;
  if (pisoEm(ses.world, Math.floor(nx), Math.floor(b.y + 0.01), Math.floor(nz), CORPOS.get(b.tipo)!) !== null) {
    b.x = nx;
    b.z = nz;
  }
  if (b.tipo === "tatu") {
    b.bolaAte = ses.tickCount + TICKS_BOLA; // apanhou: enrola (o próximo golpe bate no casco)
  } else if (b.def.meio === "terra") {
    assustar(ses, b, p.x, p.z);
  } else {
    b.estado = Estado.Fugindo;
    b.ate = ses.tickCount + TICKS_FUGA;
    b.fugaDeX = p.x;
    b.fugaDeZ = p.z;
    b.vooPara = null;
  }
  b.sentado = false;
  ferir(ses, b, DANO_GOLPE, clientId);
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Interações (clique direito)
// ---------------------------------------------------------------------------

/** Gasta 1 do item do slot (sobrevivência). Devolve false se não deu. */
function gastarUm(ses: GameSession, clientId: number, nome: string, id: number): boolean {
  if (!inventarioVale(ses, clientId)) return true; // criativo: a paleta é infinita
  const { inv, removido } = remover(inventarioDe(ses, nome), id, 1);
  if (!removido) return false;
  ses.inventarios.set(nome, inv);
  sendInventario(ses, clientId);
  return true;
}

/** Troca o conteúdo de um slot (balde vazio → leite). Só sobrevivência. */
function trocarSlot(ses: GameSession, clientId: number, nome: string, slot: number, novo: Slot): void {
  if (!inventarioVale(ses, clientId)) return;
  ses.inventarios.set(nome, definirSlot(inventarioDe(ses, nome), slot, novo));
  sendInventario(ses, clientId);
}

/** Dá itens (sobrevivência). Mochila cheia: avisa e devolve false. */
function dar(ses: GameSession, clientId: number, nome: string, id: number, qtd: number): boolean {
  if (!inventarioVale(ses, clientId)) return true;
  const inv = inventarioDe(ses, nome);
  if (!cabe(inv, id, qtd)) {
    avisarComFreio(ses, clientId, "A mochila está cheia.");
    return false;
  }
  ses.inventarios.set(nome, adicionar(inv, id, qtd).inv);
  sendInventario(ses, clientId);
  return true;
}

function minutos(ticks: number): string {
  const s = Math.max(1, Math.ceil(ticks / SERVER_TICK_RATE));
  return s < 60 ? `${s} s` : `${Math.ceil(s / 60)} min`;
}

/**
 * Clique direito num bicho (`usar_bicho`). Quem decide é o ITEM na mão: em
 * sobrevivência, o do slot informado (é ele que se gasta); em criativo, o que
 * o cliente disse segurar (`mao`) — lá nada se gasta e nada se ganha, só o
 * bicho muda (o professor demonstrando a tosquia pra turma).
 */
export function usarBicho(ses: GameSession, clientId: number, id: number, slot: number | undefined): void {
  const p = ses.players.get(clientId);
  const b = ses.bichos.lista.get(id);
  if (!p || !b) return;
  if (Math.hypot(b.x - p.x, b.y + b.def.altura / 2 - (p.y + 1), b.z - p.z) > ALCANCE) return;
  const t = ses.tickCount;
  const sobrev = inventarioVale(ses, clientId);
  let pilha: Slot = null;
  if (sobrev) {
    if (slot === undefined || slot < 0 || slot > 8) return;
    pilha = inventarioDe(ses, p.name)[slot] ?? null;
  } else {
    const m = ses.bichos.mao.get(clientId);
    pilha = m === undefined || m === null ? null : { id: m, qtd: 1 };
  }
  const item = pilha?.id ?? null;
  const adulto = !filhote(b, t);
  ses.broadcast({ type: "gesto", id: clientId, gesto: "interagir" });

  // 1) o dono, sem comida na mão: senta/levanta
  const comidaDele = item !== null && (ehIsca(b.tipo, item) || (b.def.domar?.itens.includes(item) ?? false));
  if (b.dono === p.name && !comidaDele) {
    b.sentado = !b.sentado;
    pararDeAndar(b);
    b.estado = b.sentado ? Estado.Sentado : Estado.Parado;
    return;
  }
  // 2) o ovo da galinha
  if (b.tipo === "galinha" && b.ovoPronto && !(item !== null && ehIsca(b.tipo, item))) {
    if (!dar(ses, clientId, p.name, ITEM_OVO, 1)) return;
    b.ovoPronto = false;
    b.ovoEm = t + TICKS_OVO_MIN + Math.floor(rand(ses.bichos) * (TICKS_OVO_MAX - TICKS_OVO_MIN));
    evento(ses, b, "ovo");
    return;
  }
  if (item === null) return;
  // 3) a tesoura na ovelha
  if (item === ITEM_TESOURA && b.tipo === "ovelha") {
    if (!adulto) return avisarComFreio(ses, clientId, "O filhote ainda não tem lã pra tosquiar.");
    if (b.tosquiadaAte > t) {
      return avisarComFreio(ses, clientId, `A lã ainda está crescendo — volta em ${minutos(b.tosquiadaAte - t)}.`);
    }
    const la = b.def.variantes[b.variante]?.la ?? BlockId.LaBranca;
    if (!dar(ses, clientId, p.name, la, laDaTosquia(() => rand(ses.bichos)))) return;
    b.tosquiadaAte = t + TICKS_LA;
    if (sobrev && pilha && slot !== undefined) {
      const gasta = gastar(pilha, 1);
      trocarSlot(ses, clientId, p.name, slot, gasta);
      if (!gasta) ses.send(clientId, JSON.stringify({ type: "ferramenta_quebrou", item: ITEM_TESOURA } satisfies ServerMessage));
    }
    evento(ses, b, "tosquia");
    return;
  }
  // 4) o balde vazio na vaca
  if (item === ITEM_BALDE_VAZIO && b.tipo === "vaca") {
    if (!adulto) return avisarComFreio(ses, clientId, "O bezerro ainda não dá leite.");
    if (b.leiteEm > t) {
      return avisarComFreio(ses, clientId, `${capitalizar(comArtigo(b))} ainda não tem leite — volta em ${minutos(b.leiteEm - t)}.`);
    }
    b.leiteEm = t + TICKS_LEITE;
    if (sobrev && slot !== undefined) trocarSlot(ses, clientId, p.name, slot, { id: ITEM_BALDE_LEITE, qtd: 1 });
    evento(ses, b, "ordenha");
    return;
  }
  // 5) o balde de água no peixe: leva o peixe junto
  if (item === ITEM_BALDE_AGUA && b.tipo === "peixe") {
    if (sobrev && slot !== undefined) trocarSlot(ses, clientId, p.name, slot, { id: ITEM_BALDE_PEIXE, qtd: 1 });
    removerBicho(ses, b);
    return;
  }
  // 6) domar
  if (b.def.domar && b.dono === null && b.def.domar.itens.includes(item)) {
    if (!gastarUm(ses, clientId, p.name, item)) return;
    if (rand(ses.bichos) < b.def.domar.chance) {
      b.dono = p.name;
      b.sentado = true;
      pararDeAndar(b);
      b.estado = Estado.Sentado;
      evento(ses, b, "domou");
      ses.sendServerChat(
        clientId,
        `Agora ${comArtigo(b)} é seu! Clique nele com a mão vazia pra ele sentar ou levantar.`,
      );
    } else {
      evento(ses, b, "nao_domou");
    }
    return;
  }
  // 7) comida pro domado: cura
  if (b.dono !== null && b.def.domar?.itens.includes(item)) {
    if (b.vida >= b.def.vidaMax) return;
    if (!gastarUm(ses, clientId, p.name, item)) return;
    b.vida = Math.min(b.def.vidaMax, b.vida + 4);
    evento(ses, b, "comeu");
    return;
  }
  // 8) a isca
  if (ehIsca(b.tipo, item)) {
    if (b.tipo === "arara") {
      if (!gastarUm(ses, clientId, p.name, item)) return;
      b.segueAte = t + TICKS_ARARA_SEGUE;
      evento(ses, b, "comeu");
      return;
    }
    if (!adulto) {
      if (!gastarUm(ses, clientId, p.name, item)) return;
      b.filhoteAte = Math.max(t + 1, b.filhoteAte - Math.floor(TICKS_CRESCER / 10));
      evento(ses, b, "comeu");
      return;
    }
    if (!b.def.reproduz || b.amorAte > t) return;
    if (b.descansoAte > t) {
      return avisarComFreio(ses, clientId, `${capitalizar(comArtigo(b))} ainda está descansando da última cria.`);
    }
    let vizinhos = 0;
    for (const o of ses.bichos.lista.values()) {
      if (o.tipo === b.tipo && Math.hypot(o.x - b.x, o.z - b.z) <= RAIO_CURRAL) vizinhos++;
    }
    if (vizinhos >= TETO_CURRAL) {
      return avisarComFreio(ses, clientId, `Já tem ${vizinhos} por aqui — o curral está cheio, não nasce mais nenhum.`);
    }
    if (!gastarUm(ses, clientId, p.name, item)) return;
    b.amorAte = t + TICKS_AMOR;
    evento(ses, b, "comeu");
  }
}

/** §🐄 O balde com peixe despejado: a água já foi posta; o peixe nasce nela. */
export function soltarPeixe(ses: GameSession, x: number, y: number, z: number): void {
  const bioma = biomaPorClima(climaAt(x, z, ses.seed)).nome;
  const vars = variantesDoBioma("peixe", bioma);
  const v = vars.length ? vars[sortearPonderado(vars, rand(ses.bichos))]!.i : 0;
  nascerBicho(ses, "peixe", v, x + 0.5, y + 0.2, z + 0.5);
}

/** Algum bicho de pé nesta célula? (a PLACA DE PRESSÃO conta bicho — o curral
 *  com circuito: a vaca pisa na placa e a porta abre). */
export function bichoNaCelula(ses: GameSession, x: number, y: number, z: number): boolean {
  const ids = ses.bichos.porColuna.get(colunaDe(ses, x + 0.5, z + 0.5));
  if (!ids) return false;
  for (const id of ids) {
    const b = ses.bichos.lista.get(id);
    if (!b || b.def.meio === "ar") continue;
    const meia = b.def.largura / 2;
    if (x < b.x + meia && x + 1 > b.x - meia && z < b.z + meia && z + 1 > b.z - meia && y < b.y + b.def.altura && y + 1 > b.y) {
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Comandos do professor
// ---------------------------------------------------------------------------

/**
 * `/bichos` — consulta; `/bichos ligar|desligar` — o spawn natural;
 * `/bichos limpar [tipo|todos] [raio]` — remove. Tudo do professor.
 */
export function runBichos(ses: GameSession, clientId: number, parts: string[], professor: boolean): string {
  // tudo do professor, até a consulta: o painel do aluno não tem espaço pra
  // ele no tablet, e o teste de paridade exige o mesmo gate dos dois lados
  if (!professor) return "Somente o professor pode usar /bichos.";
  const st = ses.bichos;
  const sub = parts[1]?.toLowerCase();
  if (!sub) {
    const contagem = new Map<TipoBicho, number>();
    for (const b of st.lista.values()) contagem.set(b.tipo, (contagem.get(b.tipo) ?? 0) + 1);
    const lista = [...contagem].map(([tp, n]) => `${n} ${BICHOS[tp].nome}`).join(", ") || "nenhum";
    const nat = ses.somenteLeitura
      ? "mundo de aula: nenhum nasce sozinho (o professor usa /bicho)"
      : st.natural
        ? "nascem sozinhos no mundo"
        : "NÃO nascem sozinhos (o professor liga com /bichos ligar)";
    return `Bichos: ${lista}. ${nat[0]!.toUpperCase()}${nat.slice(1)}.`;
  }
  if (sub === "parar" || sub === "soltar") {
    st.parados = sub === "parar";
    if (st.parados) for (const b of st.lista.values()) pararDeAndar(b);
    return st.parados
      ? "Os bichos PARARAM: ninguém anda, foge nem cai até /bichos soltar (os cliques continuam valendo)."
      : "Os bichos voltaram a andar.";
  }
  if (sub === "fila") return enfileirar(ses, clientId);
  if (sub === "ligar" || sub === "desligar") {
    if (ses.somenteLeitura && sub === "ligar") {
      return "Mundo de aula não tem bicho nascendo sozinho — use /bicho <tipo> pra trazer um.";
    }
    st.natural = sub === "ligar";
    return st.natural
      ? "Os bichos voltam a nascer sozinhos nas partes do mundo que ainda não foram visitadas."
      : "Os bichos não nascem mais sozinhos (os que existem continuam).";
  }
  if (sub === "limpar") {
    const p = ses.players.get(clientId);
    const filtro = parts[2]?.toLowerCase();
    const tipo = filtro && filtro !== "todos" ? tipoPorNome(filtro) : null;
    if (filtro && filtro !== "todos" && !tipo) return `Não conheço o bicho "${parts[2]}".`;
    const raio = parts[3] ? Number(parts[3]) : Infinity;
    if (!(raio > 0)) return "Uso: /bichos limpar [tipo|todos] [raio]";
    let n = 0;
    for (const b of [...st.lista.values()]) {
      if (tipo && b.tipo !== tipo) continue;
      if (p && Math.hypot(b.x - p.x, b.z - p.z) > raio) continue;
      removerBicho(ses, b);
      n++;
    }
    return `${n} bicho(s) removido(s).`;
  }
  return "Uso: /bichos [ligar|desligar|parar|soltar|fila|limpar [tipo|todos] [raio]]";
}

/**
 * `/bichos fila` — a VITRINE: toda espécie numa fileira, cada variante lado a
 * lado, à frente do professor (pra onde ele olha, no eixo mais próximo), e a
 * IA para junto (senão a fila se desfaz em segundos). Os peixes ganham um
 * rego de água cavado no chão — fonte num buraco não escorre. A última coluna
 * de cada fileira é um FILHOTE da 1ª variante, pra comparar o tamanho.
 */
function enfileirar(ses: GameSession, clientId: number): string {
  const p = ses.players.get(clientId);
  if (!p) return "Entre no mundo antes de usar /bichos fila.";
  const st = ses.bichos;
  st.parados = true;
  for (const b of st.lista.values()) pararDeAndar(b);
  // o eixo pra onde o professor olha (yaw 0 = −Z): fileiras se afastam nele,
  // as variantes correm no eixo de lado
  const fx = -Math.sin(p.yaw);
  const fz = -Math.cos(p.yaw);
  const [ax, az] = Math.abs(fx) > Math.abs(fz) ? [Math.sign(fx), 0] : [0, Math.sign(fz)];
  const [lx, lz] = [-az, ax]; // a lateral (90° do eixo)
  const ox = Math.floor(p.x);
  const oz = Math.floor(p.z);
  let n = 0;
  TIPOS_BICHO.forEach((tipo, fila) => {
    const def = BICHOS[tipo];
    const dist = 4 + fila * 3; // 3 blocos entre fileiras: a vaca tem 1,5 de comprimento
    const colunas = [...def.variantes.keys(), -1]; // −1 = o filhote
    colunas.forEach((v, k) => {
      const lado = (k - (colunas.length - 1) / 2) * 2;
      const x = ox + ax * dist + Math.round(lx * lado);
      const z = oz + az * dist + Math.round(lz * lado);
      const c = celulaDePe(ses.world, x, Math.floor(p.y), z, { ...CORPOS.get(tipo)!, nada: false }, 4, 6);
      if (!c) return;
      let y = c.piso;
      if (def.meio === "agua") {
        const fundo = Math.floor(c.piso) - 1;
        if (!ses.somenteLeitura) ses.applyBlock(x, fundo, z, BlockId.Agua);
        if (!isAgua(getBlock(ses.world, x, fundo, z))) return;
        y = fundo + 0.2;
      }
      const b = nascerBicho(ses, tipo, v < 0 ? 0 : v, x + 0.5, y, z + 0.5, { filhote: v < 0 });
      // todos olhando pro professor
      b.yaw = Math.atan2(ax, az);
      n++;
    });
  });
  return `Vitrine: ${n} bichos em ${TIPOS_BICHO.length} fileiras, parados (/bichos soltar pra andarem).`;
}

/** `/bicho <tipo> [quantidade] [variante] [filhote]` — traz bichos pra perto do professor. */
export function runBicho(ses: GameSession, clientId: number, parts: string[]): string {
  const p = ses.players.get(clientId);
  if (!p) return "Entre no mundo antes de usar /bicho.";
  const tiposTxt = TIPOS_BICHO.map((t) => BICHOS[t].nome).join(", ");
  if (!parts[1]) return `Uso: /bicho <tipo> [quantidade] [variante] [filhote]. Tipos: ${tiposTxt}.`;
  const tipo = tipoPorNome(parts[1]);
  if (!tipo) return `Não conheço o bicho "${parts[1]}". Tipos: ${tiposTxt}.`;
  let qtd = 1;
  let variante = -1;
  let ehFilhote = false;
  for (const a of parts.slice(2)) {
    const n = Number(a);
    if (Number.isInteger(n) && n > 0) qtd = Math.min(MAX_POR_COMANDO, n);
    else if (a.toLowerCase() === "filhote") ehFilhote = true;
    else {
      const v = variantePorNome(tipo, a.replace(/_/g, " "));
      if (v < 0) {
        const nomes = BICHOS[tipo].variantes.map((x) => x.nome.replace(/ /g, "_")).join(", ");
        return `Variante desconhecida "${a}". Para ${BICHOS[tipo].nome}: ${nomes}.`;
      }
      variante = v;
    }
  }
  // o nome da variante também vale como o próprio tipo ("/bicho tucano")
  if (variante < 0) variante = variantePorNome(tipo, parts[1].replace(/_/g, " "));
  const def = BICHOS[tipo];
  const corpo = CORPOS.get(tipo)!;
  let n = 0;
  for (let k = 0; k < qtd * 6 && n < qtd; k++) {
    const ang = rand(ses.bichos) * Math.PI * 2;
    const d = 2 + rand(ses.bichos) * 3;
    const x = Math.floor(p.x + Math.cos(ang) * d);
    const z = Math.floor(p.z + Math.sin(ang) * d);
    const v = variante >= 0 ? variante : Math.floor(rand(ses.bichos) * def.variantes.length);
    if (def.meio === "agua") {
      // o peixe precisa de água: procura na coluna, perto da altura do professor
      let achou = false;
      for (let dy = 2; dy >= -6 && !achou; dy--) {
        const y = Math.floor(p.y) + dy;
        if (isAgua(getBlock(ses.world, x, y, z))) {
          nascerBicho(ses, tipo, v, x + 0.5, y + 0.2, z + 0.5, { filhote: ehFilhote });
          achou = true;
        }
      }
      if (achou) n++;
      continue;
    }
    const c = celulaDePe(ses.world, x, Math.floor(p.y), z, { ...corpo, nada: false }, 3, 4);
    if (!c) continue;
    nascerBicho(ses, tipo, v, x + 0.5, c.piso, z + 0.5, { filhote: ehFilhote });
    n++;
  }
  if (n === 0) {
    return def.meio === "agua"
      ? "Não achei água aqui perto pra soltar o peixe."
      : "Não achei chão livre aqui perto pra soltar o bicho.";
  }
  return n === 1
    ? `Pronto: ${def.artigo === "a" ? "uma" : "um"} ${def.nome} por perto.`
    : `Pronto: ${n} × ${def.nome} por perto.`;
}

// ---------------------------------------------------------------------------
// Save
// ---------------------------------------------------------------------------

export function bichosParaSave(ses: GameSession): BichosSalvos {
  const st = ses.bichos;
  const t = ses.tickCount;
  const resta = (abs: number): number | undefined => (abs > t ? abs - t : undefined);
  const lista: BichoSalvo[] = [];
  for (const b of st.lista.values()) {
    const s: BichoSalvo = {
      t: indiceDoTipo(b.tipo),
      v: b.variante,
      x: r2(b.x),
      y: r2(b.y),
      z: r2(b.z),
      yaw: r2(b.yaw),
      vida: b.vida,
    };
    const f = resta(b.filhoteAte);
    if (f !== undefined) s.filhote = f;
    const tq = resta(b.tosquiadaAte);
    if (tq !== undefined) s.tosquia = tq;
    const l = resta(b.leiteEm);
    if (l !== undefined) s.leite = l;
    if (b.tipo === "galinha") s.ovo = b.ovoPronto ? -1 : Math.max(0, b.ovoEm - t);
    const d = resta(b.descansoAte);
    if (d !== undefined) s.descanso = d;
    if (b.dono !== null) s.dono = b.dono;
    if (b.sentado) s.sentado = true;
    lista.push(s);
  }
  return {
    natural: st.natural,
    proximoId: st.proximoId,
    lista,
    ...(st.povoadas.size ? { povoadas: [...st.povoadas] } : {}),
  };
}

/** Restaura o que o save trouxe. */
export function restaurarBichos(ses: GameSession, salvo: BichosSalvos): void {
  const st = ses.bichos;
  // `natural` quem decide é o construtor (save, opção do host, aula)
  for (const k of salvo.povoadas ?? []) st.povoadas.add(k);
  const t = ses.tickCount;
  for (const s of salvo.lista) {
    const tipo = tipoPorIndice(s.t);
    if (!tipo) continue;
    const b = nascerBicho(ses, tipo, s.v, s.x, s.y, s.z, { dono: s.dono ?? null });
    b.yaw = s.yaw;
    b.vida = s.vida;
    if (s.filhote) b.filhoteAte = t + s.filhote;
    if (s.tosquia) b.tosquiadaAte = t + s.tosquia;
    if (s.leite) b.leiteEm = t + s.leite;
    if (s.ovo !== undefined) {
      if (s.ovo < 0) b.ovoPronto = true;
      else b.ovoEm = t + s.ovo;
    }
    if (s.descanso) b.descansoAte = t + s.descanso;
    if (s.sentado) b.sentado = true;
  }
  // ids continuam de onde pararam (nunca reaproveita o id de um bicho salvo)
  st.proximoId = Math.max(st.proximoId, salvo.proximoId);
}

/** O resumo do `debug_stats`. */
export function resumoBichos(ses: GameSession): EstadoBichos["resumo"] {
  return ses.bichos.resumo;
}
