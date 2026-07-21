import { type Papel } from "./auth";
import { type Claim, parseClaim } from "./claims";
import { type QuadroConteudo, parseQuadroConteudo } from "./quadros";
import { CHUNK_VOLUME, MAX_WORLD_CHUNKS } from "./constants";
import { type GroupDef, parseGroups } from "./groups";
import { type NamedRegion, parseNamedRegion } from "./regions";
import { type ObjectiveState, type ScenarioModo, parseObjectiveState } from "./scenario";
import { type World, type WorldDims, alocarColuna, chunkIndex, createWorld } from "./world";

/**
 * Protocolo v0 (checkpoint 2). Mensagens JSON dos dois lados + world_snapshot
 * BINÁRIO (único frame binário do protocolo). O cliente fala isto com QUALQUER
 * hospedeiro (Web Worker agora, Node+ws no checkpoint 5) — mesmas mensagens.
 */

// --- Mensagens JSON cliente→servidor ---

export type ClientMessage =
  | {
      /**
       * Entrada no mundo. pin: 4 dígitos — 1ª entrada com um nome registra o
       * PIN, as seguintes exigem o mesmo (cp9). codigo: código de professor
       * (opcional) — certo eleva o papel; errado NEGA o join (professor que
       * digitou errado precisa saber, não entrar como aluno em silêncio).
       * Hospedeiro singleplayer dispensa os dois.
       */
      type: "join";
      name: string;
      pin?: string;
      codigo?: string;
    }
  | { type: "move"; x: number; y: number; z: number; yaw: number; pitch: number }
  | { type: "place_block"; x: number; y: number; z: number; blockId: number }
  | { type: "break_block"; x: number; y: number; z: number }
  /** Clique direito num bloco INTERATIVO (cp23: porta) — o servidor decide o
   *  efeito (alternar aberta/fechada) e responde com block_changed normais. */
  | { type: "use_block"; x: number; y: number; z: number }
  /** Quadro (2026-07-19): define o CONTEÚDO do quadro naquela célula (texto
   *  e/ou imagem data URL pequena). Servidor valida célula/alcance/gates e
   *  responde com quadro_changed broadcast. Texto vazio sem imagem = limpa. */
  | { type: "quadro_set"; x: number; y: number; z: number; texto: string; imagem?: string }
  | { type: "chat"; text: string }
  | {
      /**
       * Varinha do professor (cp11): marca um canto de região na célula
       * mirada. Dois cantos marcados + /regiao criar nome = região nomeada.
       * Servidor valida papel e bounds — aluno mandando isto é ignorado
       * com aviso no chat.
       */
      type: "wand_mark";
      corner: 1 | 2;
      x: number;
      y: number;
      z: number;
    }
  | {
      /**
       * Profiler (backlog "ferramentas de dev"): cliente manda o snapshot do
       * HUD F3 (botão "enviar pro servidor") pro host persistir em disco —
       * roda o profile em vários dispositivos (notebook, tablet…) e centraliza
       * as medidas na MESMA pasta, sem precisar catar arquivo exportado de
       * cada máquina. Opaco: o servidor só grava, não interpreta — o shape
       * acompanha o que hud.ts exporta e pode crescer sem re-versionar o
       * protocolo. Tratado no HOST (como /mundo, /kicar): gravar arquivo é
       * transporte, a GameSession não tem sistema de arquivos.
       */
      type: "profile_report";
      stats: Record<string, unknown>;
    }
  /** Streaming (F2): raio de interesse do cliente em COLUNAS de chunks —
   *  config de desempenho do menu. Servidor clampa em [RAIO_MIN, RAIO_MAX]. */
  | { type: "radius"; chunks: number };

/** Teto do texto bruto de um profile_report (chars) — payload é só números e
 *  strings curtas (sem imagem); acima disso é lixo/abuso, não perfilação real. */
export const MAX_PROFILE_REPORT_CHARS = 8192;

// --- Mensagens JSON servidor→cliente ---

export type ServerMessage =
  | {
      type: "debug_stats";
      /** Duração média/máxima do tick (ms) na última janela de 1 s. */
      tickAvgMs: number;
      tickMaxMs: number;
      /** Ticks executados na janela (alvo = SERVER_TICK_RATE). */
      tps: number;
    }
  | {
      /** Bloco mudou no mundo autoritativo (ação de jogador OU regra do tick — o cliente não distingue). */
      type: "block_changed";
      x: number;
      y: number;
      z: number;
      blockId: number;
    }
  | {
      /**
       * Caixa INTEIRA virou um só bloco (/regiao encher em lote — cp23b).
       * UMA mensagem no lugar de milhares de block_changed; o cliente aplica
       * a caixa e remesha os chunks tocados uma vez. Células que o servidor
       * PULOU (jogador dentro) chegam logo atrás como block_changed normais.
       */
      type: "blocks_filled";
      x0: number; y0: number; z0: number;
      x1: number; y1: number; z1: number;
      blockId: number;
    }
  | {
      /** OUTRO jogador se moveu (o servidor nunca ecoa o move do próprio autor). */
      type: "player_moved";
      id: number;
      x: number;
      y: number;
      z: number;
      yaw: number;
      pitch: number;
      /** Nome do jogador — o cliente desenha a plaquinha sobre o boneco.
       *  Ausente = host antigo (compatível: caixa sem nome). */
      name?: string;
    }
  | {
      /** Jogador desconectou — cliente remove a representação dele. */
      type: "player_left";
      id: number;
    }
  | {
      /**
       * Ponto de spawn do mundo (fixo, calculado na CRIAÇÃO sobre o terreno
       * pristino). Cliente NUNCA deriva spawn do snapshot — o snapshot pode
       * já estar escavado/construído.
       */
      type: "spawn";
      x: number;
      y: number;
      z: number;
      /** Papel do PRÓPRIO jogador (cp11): o cliente habilita UI de professor
       *  (varinha, painel futuro). Ausente = aluno (compat com host antigo). */
      papel?: Papel;
    }
  | {
      /**
       * Lista COMPLETA de regiões nomeadas (cp11). Só professores recebem
       * (no join e após criar/apagar) — o que o aluno vê de cada região é
       * decisão do objetivo (cp12+), não deste canal.
       */
      type: "regions";
      regions: NamedRegion[];
    }
  | {
      /**
       * Estado COMPLETO do cenário (cp12) — TODOS recebem (o HUD do aluno
       * vive disto): no join e sempre que progresso/objetivos mudarem.
       * Cliente substitui, não mescla.
       */
      type: "objectives";
      modo: ScenarioModo;
      objetivos: ObjectiveState[];
    }
  | {
      /**
       * Grupo do PRÓPRIO jogador (cp13): no join e quando muda (/grupo
       * criar|entrar|sair). null = sem grupo. HUD usa pra destacar a
       * linha certa do porGrupo dos objetivos.
       */
      type: "group";
      grupo: number | null;
    }
  | {
      /**
       * Composição COMPLETA dos grupos (cp14) — TODOS recebem (o painel de
       * grupo do aluno vive disto; ele só abre depois de grupos criados):
       * no join e sempre que a composição mudar. Cliente substitui, não mescla.
       */
      type: "groups";
      grupos: GroupDef[];
    }
  | {
      /**
       * Anti-griefing (cp24) — lista COMPLETA de claims + se a proteção está
       * ligada. TODOS recebem (todo mundo vê as áreas protegidas como wireframe;
       * o servidor é quem barra a edição). No join e a cada mudança/toggle.
       */
      type: "claims";
      ativo: boolean;
      claims: Claim[];
    }
  | {
      /**
       * Grupo de amigos do PRÓPRIO jogador (cp24) + convites pendentes. `equipe`
       * null = sem grupo. Pessoal: no join (se houver algo) e quando muda.
       */
      type: "friends";
      equipe: { dono: string; membros: string[] } | null;
      convites: string[];
    }
  | {
      /**
       * Quadro (2026-07-19): conteúdo de UM quadro mudou. Broadcast a cada
       * quadro_set aceito. Texto vazio sem imagem = quadro limpo (o cliente
       * remove o painel de conteúdo).
       */
      type: "quadro_changed";
      x: number;
      y: number;
      z: number;
      texto: string;
      imagem?: string;
    }
  | {
      /**
       * Quadro (2026-07-19): lista COMPLETA de conteúdos — só no join, e só
       * se houver algum (senão nada é enviado; contagens do join não mudam).
       * Cliente substitui, não mescla.
       */
      type: "quadros";
      lista: QuadroConteudo[];
    }
  | {
      /** Chat: mensagem de jogador (autor "nome#id") ou do servidor (autor "servidor"). */
      type: "chat";
      author: string;
      text: string;
    }
  | {
      /**
       * Join RECUSADO (PIN errado, nome já em uso, código de professor
       * errado, tentativas demais…). Cliente mostra o motivo e volta pro
       * menu — nenhuma outra mensagem chega depois desta.
       */
      type: "join_denied";
      reason: string;
    }
  | {
      /**
       * Servidor manda o jogador pra uma posição E orientação (volta-onde-
       * parou de mundo salvo; futuro /tp). Cliente aplica, zera velocidade
       * e aponta a câmera (yaw/pitch).
       */
      type: "teleport";
      x: number;
      y: number;
      z: number;
      yaw: number;
      pitch: number;
    }
  | {
      /**
       * Hora do dia (cp21) — ciclo dia/noite SÓ visual e server-autoritativo.
       * `hora` em [0,24); `ciclo` = o tempo está passando. No join e 1×/s;
       * o cliente interpola o céu localmente entre as sincronizações.
       */
      type: "time";
      hora: number;
      ciclo: boolean;
    }
  | {
      /**
       * Voo liberado pra TURMA (modo criativo). O professor voa sempre; este
       * flag diz se os alunos também podem (professor alterna com /voo). No
       * join só é enviado quando `liberado` (default false = sem churn no join).
       */
      type: "voo";
      liberado: boolean;
    }
  | {
      /**
       * Aluno REMOVIDO da aula pelo professor (cp22, /kicar). Cliente mostra o
       * motivo e volta pro menu — mesmo caminho do join_denied. O socket cai
       * logo depois; ele pode entrar de novo com o PIN.
       */
      type: "kicked";
      reason: string;
    };

/** Parse defensivo: servidor autoritativo nunca confia no que chega do fio. */
export function parseClientMessage(raw: string): ClientMessage | null {
  let msg: unknown;
  try {
    msg = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof msg !== "object" || msg === null) return null;
  const m = msg as Record<string, unknown>;
  switch (m["type"]) {
    case "join": {
      if (typeof m["name"] !== "string") return null;
      // pin/codigo são opcionais, mas se vierem TÊM que ser string
      if (m["pin"] !== undefined && typeof m["pin"] !== "string") return null;
      if (m["codigo"] !== undefined && typeof m["codigo"] !== "string") return null;
      return {
        type: "join",
        name: m["name"],
        ...(typeof m["pin"] === "string" ? { pin: m["pin"] } : {}),
        ...(typeof m["codigo"] === "string" ? { codigo: m["codigo"] } : {}),
      };
    }
    case "move": {
      const nums = [m["x"], m["y"], m["z"], m["yaw"], m["pitch"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "move",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        yaw: m["yaw"] as number,
        pitch: m["pitch"] as number,
      };
    }
    case "place_block": {
      const ints = [m["x"], m["y"], m["z"], m["blockId"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "place_block",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        blockId: m["blockId"] as number,
      };
    }
    case "break_block": {
      const ints = [m["x"], m["y"], m["z"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "break_block",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
      };
    }
    case "use_block": {
      const ints = [m["x"], m["y"], m["z"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "use_block",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
      };
    }
    case "quadro_set": {
      const c = parseQuadroConteudo(m);
      if (!c) return null;
      return { type: "quadro_set", ...c };
    }
    case "chat":
      if (typeof m["text"] !== "string") return null;
      return { type: "chat", text: m["text"] };
    case "wand_mark": {
      const corner = m["corner"];
      if (corner !== 1 && corner !== 2) return null;
      const ints = [m["x"], m["y"], m["z"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "wand_mark",
        corner,
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
      };
    }
    case "profile_report": {
      if (raw.length > MAX_PROFILE_REPORT_CHARS) return null;
      const stats = m["stats"];
      if (typeof stats !== "object" || stats === null || Array.isArray(stats)) return null;
      return { type: "profile_report", stats: stats as Record<string, unknown> };
    }
    case "radius": {
      if (typeof m["chunks"] !== "number" || !Number.isInteger(m["chunks"])) return null;
      return { type: "radius", chunks: m["chunks"] };
    }
    default:
      return null;
  }
}

export function parseServerMessage(raw: string): ServerMessage | null {
  let msg: unknown;
  try {
    msg = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof msg !== "object" || msg === null) return null;
  const m = msg as Record<string, unknown>;
  switch (m["type"]) {
    case "debug_stats": {
      const nums = [m["tickAvgMs"], m["tickMaxMs"], m["tps"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "debug_stats",
        tickAvgMs: m["tickAvgMs"] as number,
        tickMaxMs: m["tickMaxMs"] as number,
        tps: m["tps"] as number,
      };
    }
    case "block_changed": {
      const ints = [m["x"], m["y"], m["z"], m["blockId"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "block_changed",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        blockId: m["blockId"] as number,
      };
    }
    case "blocks_filled": {
      const ints = [m["x0"], m["y0"], m["z0"], m["x1"], m["y1"], m["z1"], m["blockId"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "blocks_filled",
        x0: m["x0"] as number, y0: m["y0"] as number, z0: m["z0"] as number,
        x1: m["x1"] as number, y1: m["y1"] as number, z1: m["z1"] as number,
        blockId: m["blockId"] as number,
      };
    }
    case "player_moved": {
      if (typeof m["id"] !== "number" || !Number.isInteger(m["id"])) return null;
      const nums = [m["x"], m["y"], m["z"], m["yaw"], m["pitch"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "player_moved",
        id: m["id"],
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        yaw: m["yaw"] as number,
        pitch: m["pitch"] as number,
        // nome inválido/ausente = sem plaquinha (host antigo compatível)
        ...(typeof m["name"] === "string" ? { name: m["name"] } : {}),
      };
    }
    case "player_left": {
      if (typeof m["id"] !== "number" || !Number.isInteger(m["id"])) return null;
      return { type: "player_left", id: m["id"] };
    }
    case "spawn": {
      const nums = [m["x"], m["y"], m["z"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "spawn",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        // papel inválido/ausente = aluno (host antigo continua compatível)
        ...(m["papel"] === "professor" || m["papel"] === "aluno"
          ? { papel: m["papel"] as Papel }
          : {}),
      };
    }
    case "regions": {
      if (!Array.isArray(m["regions"])) return null;
      const regions: NamedRegion[] = [];
      for (const entry of m["regions"]) {
        const r = parseNamedRegion(entry);
        if (r) regions.push(r); // entrada quebrada não derruba a lista inteira
      }
      return { type: "regions", regions };
    }
    case "objectives": {
      if (m["modo"] !== "sequencial" && m["modo"] !== "livre") return null;
      if (!Array.isArray(m["objetivos"])) return null;
      const objetivos: ObjectiveState[] = [];
      for (const entry of m["objetivos"]) {
        const s = parseObjectiveState(entry);
        if (s) objetivos.push(s);
      }
      return { type: "objectives", modo: m["modo"], objetivos };
    }
    case "group": {
      const g = m["grupo"];
      if (g !== null && (typeof g !== "number" || !Number.isInteger(g))) return null;
      return { type: "group", grupo: g };
    }
    case "groups":
      // parseGroups pula entrada quebrada — mesma tolerância do save
      return { type: "groups", grupos: parseGroups(m["grupos"]) };
    case "claims": {
      if (typeof m["ativo"] !== "boolean" || !Array.isArray(m["claims"])) return null;
      const claims: Claim[] = [];
      for (const entry of m["claims"]) {
        const c = parseClaim(entry);
        if (c) claims.push(c); // entrada quebrada não derruba a lista
      }
      return { type: "claims", ativo: m["ativo"], claims };
    }
    case "friends": {
      const onlyStrings = (v: unknown): string[] =>
        Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
      let equipe: { dono: string; membros: string[] } | null = null;
      const eq = m["equipe"];
      if (eq && typeof eq === "object") {
        const o = eq as Record<string, unknown>;
        if (typeof o["dono"] === "string") {
          equipe = { dono: o["dono"], membros: onlyStrings(o["membros"]) };
        }
      }
      return { type: "friends", equipe, convites: onlyStrings(m["convites"]) };
    }
    case "quadro_changed": {
      const c = parseQuadroConteudo(m);
      if (!c) return null;
      return { type: "quadro_changed", ...c };
    }
    case "quadros": {
      if (!Array.isArray(m["lista"])) return null;
      const lista: QuadroConteudo[] = [];
      for (const entry of m["lista"]) {
        const c = parseQuadroConteudo(entry);
        if (c) lista.push(c); // entrada quebrada não derruba a lista
      }
      return { type: "quadros", lista };
    }
    case "chat":
      if (typeof m["author"] !== "string" || typeof m["text"] !== "string") return null;
      return { type: "chat", author: m["author"], text: m["text"] };
    case "join_denied":
      if (typeof m["reason"] !== "string") return null;
      return { type: "join_denied", reason: m["reason"] };
    case "teleport": {
      const nums = [m["x"], m["y"], m["z"], m["yaw"], m["pitch"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "teleport",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        yaw: m["yaw"] as number,
        pitch: m["pitch"] as number,
      };
    }
    case "time": {
      if (typeof m["hora"] !== "number" || !Number.isFinite(m["hora"])) return null;
      if (typeof m["ciclo"] !== "boolean") return null;
      return { type: "time", hora: m["hora"], ciclo: m["ciclo"] };
    }
    case "voo":
      if (typeof m["liberado"] !== "boolean") return null;
      return { type: "voo", liberado: m["liberado"] };
    case "kicked":
      if (typeof m["reason"] !== "string") return null;
      return { type: "kicked", reason: m["reason"] };
    default:
      return null;
  }
}

// --- world_snapshot binário ---
//
// Layout (little-endian):
//   u32  magic "LJW0" (0x304a574c lido como LE dos bytes L J W 0)
//   u8   dims.x   u8 dims.z   u8 dims.y   u8 reservado(0)
//   u32  seed (worldgen determinístico: mesma seed = mesmos bytes)
//   depois: chunks concatenados na ordem de chunkIndex(), CHUNK_VOLUME bytes cada.
// O header carrega as dimensões — o cliente NUNCA assume tamanho de mundo.

export const SNAPSHOT_MAGIC = 0x304a574c; // bytes "LJW0" em little-endian
export const SNAPSHOT_HEADER_BYTES = 12;

export interface Snapshot {
  world: World;
  seed: number;
}

export function encodeSnapshot(world: World, seed: number): ArrayBuffer {
  const buf = new ArrayBuffer(
    SNAPSHOT_HEADER_BYTES + world.chunks.length * CHUNK_VOLUME,
  );
  const view = new DataView(buf);
  view.setUint32(0, SNAPSHOT_MAGIC, true);
  view.setUint8(4, world.dims.x);
  view.setUint8(5, world.dims.z);
  view.setUint8(6, world.dims.y);
  view.setUint8(7, 0);
  view.setUint32(8, seed >>> 0, true);
  const body = new Uint8Array(buf, SNAPSHOT_HEADER_BYTES);
  for (let i = 0; i < world.chunks.length; i++) {
    const chunk = world.chunks[i];
    if (chunk) body.set(chunk, i * CHUNK_VOLUME);
  }
  return buf;
}

/** Decodifica e VALIDA um snapshot. Lança Error em dados inválidos. */
export function decodeSnapshot(buf: ArrayBuffer): Snapshot {
  if (buf.byteLength < SNAPSHOT_HEADER_BYTES) {
    throw new Error(`snapshot menor que o header (${buf.byteLength} bytes)`);
  }
  const view = new DataView(buf);
  if (view.getUint32(0, true) !== SNAPSHOT_MAGIC) {
    throw new Error("snapshot com magic inválido — não é um world_snapshot");
  }
  const dims = { x: view.getUint8(4), z: view.getUint8(5), y: view.getUint8(6) };
  if (
    dims.x < 1 || dims.z < 1 || dims.y < 1 ||
    dims.x > MAX_WORLD_CHUNKS.x || dims.z > MAX_WORLD_CHUNKS.z || dims.y > MAX_WORLD_CHUNKS.y
  ) {
    throw new Error(`snapshot com dims fora do limite: ${dims.x}×${dims.z}×${dims.y}`);
  }
  const seed = view.getUint32(8, true);
  const world = createWorld(dims);
  const expected = SNAPSHOT_HEADER_BYTES + world.chunks.length * CHUNK_VOLUME;
  if (buf.byteLength !== expected) {
    throw new Error(
      `snapshot com tamanho errado: ${buf.byteLength} bytes (esperado ${expected})`,
    );
  }
  for (let i = 0; i < world.chunks.length; i++) {
    world.chunks[i]?.set(
      new Uint8Array(buf, SNAPSHOT_HEADER_BYTES + i * CHUNK_VOLUME, CHUNK_VOLUME),
    );
  }
  return { world, seed };
}

// --- Mundo LAZY / streaming de colunas (F2, 2026-07-20) ---
// Mundo gigante NÃO viaja inteiro: o join manda só um header "LJE0" (dims em
// u16 + seed) e as colunas de chunks chegam depois em lotes binários "LJC0"
// conforme o raio de interesse. O cliente distingue os 3 formatos binários
// pelo magic (peekMagic).

export const LAZY_MAGIC = 0x30454a4c; // "LJE0" em little-endian
export const LAZY_HEADER_BYTES = 16;

/** Teto do mundo LAZY (dims em chunks, u16 no header — 240×240 = 3840²
 *  blocos, ~900× a área do P). Denso continua no teto antigo. */
export const MAX_LAZY_CHUNKS = { x: 240, z: 240, y: 8 } as const;

/** Raio de interesse (em colunas de chunks) — clamp do servidor. */
export const RAIO_MIN = 2;
export const RAIO_MAX = 12;
export const RAIO_PADRAO = 6;
/** Histerese de descarte: além de raio+FOLGA_DESCARTE, cliente E servidor
 *  esquecem a coluna (mesma regra dos dois lados = sem mensagem extra). */
export const FOLGA_DESCARTE = 2;
/** Colunas enviadas por tick por jogador (config de desempenho do host). */
export const COLUNAS_POR_TICK_PADRAO = 8;

/** Magic dos primeiros 4 bytes de um frame binário (roteamento no cliente). */
export function peekMagic(buf: ArrayBuffer): number {
  if (buf.byteLength < 4) return 0;
  return new DataView(buf).getUint32(0, true);
}

export function encodeLazyInfo(dims: WorldDims, seed: number): ArrayBuffer {
  const buf = new ArrayBuffer(LAZY_HEADER_BYTES);
  const view = new DataView(buf);
  view.setUint32(0, LAZY_MAGIC, true);
  view.setUint16(4, dims.x, true);
  view.setUint16(6, dims.z, true);
  view.setUint16(8, dims.y, true);
  view.setUint16(10, 0, true);
  view.setUint32(12, seed >>> 0, true);
  return buf;
}

/** Decodifica e VALIDA um header LJE0 — devolve o mundo VAZIO (esparso). */
export function decodeLazyInfo(buf: ArrayBuffer): Snapshot {
  if (buf.byteLength !== LAZY_HEADER_BYTES) {
    throw new Error(`LJE0 com tamanho errado (${buf.byteLength} bytes)`);
  }
  const view = new DataView(buf);
  if (view.getUint32(0, true) !== LAZY_MAGIC) {
    throw new Error("LJE0 com magic inválido");
  }
  const dims = {
    x: view.getUint16(4, true),
    z: view.getUint16(6, true),
    y: view.getUint16(8, true),
  };
  if (
    dims.x < 1 || dims.z < 1 || dims.y < 1 ||
    dims.x > MAX_LAZY_CHUNKS.x || dims.z > MAX_LAZY_CHUNKS.z || dims.y > MAX_LAZY_CHUNKS.y
  ) {
    throw new Error(`LJE0 com dims fora do limite: ${dims.x}×${dims.z}×${dims.y}`);
  }
  return { world: createWorld(dims, false), seed: view.getUint32(12, true) };
}

export const COLUNAS_MAGIC = 0x30434a4c; // "LJC0" em little-endian
const COLUNAS_HEADER_BYTES = 8;

export interface ColunaRef {
  readonly cx: number;
  readonly cz: number;
}

/** Lote binário de colunas de chunks: header (magic + count) + por coluna
 *  [cx u16, cz u16, dims.y × CHUNK_VOLUME bytes]. Servidor SEMPRE manda
 *  coluna materializada (gera antes de enviar). */
export function encodeColunas(world: World, colunas: readonly ColunaRef[]): ArrayBuffer {
  const porColuna = 4 + world.dims.y * CHUNK_VOLUME;
  const buf = new ArrayBuffer(COLUNAS_HEADER_BYTES + colunas.length * porColuna);
  const view = new DataView(buf);
  view.setUint32(0, COLUNAS_MAGIC, true);
  view.setUint16(4, colunas.length, true);
  view.setUint16(6, 0, true);
  const body = new Uint8Array(buf);
  let off = COLUNAS_HEADER_BYTES;
  for (const { cx, cz } of colunas) {
    view.setUint16(off, cx, true);
    view.setUint16(off + 2, cz, true);
    off += 4;
    for (let cy = 0; cy < world.dims.y; cy++) {
      const chunk = world.chunks[chunkIndex(world, cx, cy, cz)];
      if (chunk) body.set(chunk, off);
      off += CHUNK_VOLUME;
    }
  }
  return buf;
}

/** Decodifica e APLICA um lote LJC0 no mundo (aloca as colunas e copia os
 *  bytes). Devolve as colunas aplicadas (o cliente remesha essas + bordas).
 *  Lança Error em dados inválidos. */
export function decodeColunas(buf: ArrayBuffer, world: World): ColunaRef[] {
  if (buf.byteLength < COLUNAS_HEADER_BYTES) {
    throw new Error(`LJC0 menor que o header (${buf.byteLength} bytes)`);
  }
  const view = new DataView(buf);
  if (view.getUint32(0, true) !== COLUNAS_MAGIC) {
    throw new Error("LJC0 com magic inválido");
  }
  const n = view.getUint16(4, true);
  const porColuna = 4 + world.dims.y * CHUNK_VOLUME;
  if (buf.byteLength !== COLUNAS_HEADER_BYTES + n * porColuna) {
    throw new Error(`LJC0 com tamanho errado (${buf.byteLength} bytes p/ ${n} colunas)`);
  }
  const out: ColunaRef[] = [];
  let off = COLUNAS_HEADER_BYTES;
  for (let i = 0; i < n; i++) {
    const cx = view.getUint16(off, true);
    const cz = view.getUint16(off + 2, true);
    off += 4;
    if (cx >= world.dims.x || cz >= world.dims.z) {
      throw new Error(`LJC0 com coluna fora do mundo: ${cx},${cz}`);
    }
    alocarColuna(world, cx, cz);
    for (let cy = 0; cy < world.dims.y; cy++) {
      world.chunks[chunkIndex(world, cx, cy, cz)]?.set(
        new Uint8Array(buf, off, CHUNK_VOLUME),
      );
      off += CHUNK_VOLUME;
    }
    out.push({ cx, cz });
  }
  return out;
}
