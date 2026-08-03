import { type Papel } from "./auth";
import { type Claim, type GrupoAmigos, parseClaim, parseGrupoAmigos } from "./claims";
import { CHUNK_VOLUME } from "./constants";
import { type QuadroConteudo, parseQuadroConteudo } from "./quadros";
import { type GroupDef, parseGroups } from "./groups";
import { type Modo, parseModo } from "./modo";
import { MAX_LAZY_CHUNKS, decodeSnapshot, encodeSnapshot } from "./protocol";
import { regrasParaSave, parseRegras } from "./regras";
import { FOME_MAX, VIDA_MAX } from "./sobrevivencia";
import { type NamedRegion, parseNamedRegion } from "./regions";
import { type ScenarioMeta, parseScenarioMeta } from "./scenario";
import { type World, type WorldDims, createWorld } from "./world";

/**
 * Formato de save (.ljw) — MESMO arquivo em todos os hospedeiros: disco do
 * host Node (professor), IndexedDB do navegador (singleplayer) e o arquivo
 * exportado/importado pra distribuir mundos via Drive.
 *
 * Layout (little-endian):
 *   u32  magic "LJS1"
 *   u32  tamanho do JSON de metadados (bytes UTF-8)
 *   ...  JSON de metadados (seed, spawn, roster — cresce sem quebrar formato)
 *   ...  world_snapshot binário (formato LJW0 existente, auto-validado)
 *
 * Metadados em JSON de propósito: campos futuros (hash de PIN, papel de
 * professor, objetivos de cenário) entram no JSON sem re-versionar o binário.
 */

// TextEncoder/TextDecoder existem em TODOS os hospedeiros (Node 11+, navegador,
// Web Worker), mas a lib ES2022 pura do /shared não os declara — declaração
// ambiente mínima, só do que usamos aqui.
declare class TextEncoder {
  encode(input: string): Uint8Array;
}
declare class TextDecoder {
  decode(input: Uint8Array): string;
}

export const SAVE_MAGIC = 0x31534a4c; // bytes "LJS1" em little-endian
/** F3: save ESPARSO do mundo lazy (tamanho E) — só os chunks EDITADOS, o
 *  terreno regenera do seed. Layout: header + JSON meta (com `dims`) + u32
 *  count + por chunk [chunkIndex u32, CHUNK_VOLUME bytes]. */
export const LAZY_SAVE_MAGIC = 0x32534a4c; // bytes "LJS2" em little-endian
const SAVE_HEADER_BYTES = 8;

/** Jogador lembrado pelo mundo (volta onde parou, olhando pra onde olhava). */
export interface SavedPlayer {
  name: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  /** PIN em texto puro (ver auth.ts). Ausente = ainda sem PIN — a próxima
   *  entrada com esse nome registra um. */
  pin?: string;
  /** Ausente = "aluno" (só "professor" é gravado). */
  papel?: Papel;
  /** Vida em pontos (§🍖 F2). Ausente = cheia — só machucado é gravado, então
   *  mundo antigo (e mundo criativo) sai enxuto e todo mundo nasce inteiro. */
  vida?: number;
  /** Fome em pontos (§🍖 F3). Ausente = cheia, mesma disciplina da vida. A
   *  exaustão fracionária NÃO é gravada (ver `EstadoVital.exaustao`). */
  fome?: number;
}

/** Metadados do save (a parte JSON — o mundo vai como snapshot binário). */
export interface SaveMeta {
  seed: number;
  spawn: { x: number; y: number; z: number };
  roster: SavedPlayer[];
  /** Código de professor em texto puro (ver auth.ts). Ausente em mundo
   *  singleplayer/save antigo — o host Node define no boot. */
  codigo?: string;
  /** Regiões nomeadas (cp11). Ausente em save antigo = nenhuma. */
  regioes?: NamedRegion[];
  /** Cenário: objetivos + progresso (cp12). Ausente = mundo sem cenário. */
  cenario?: ScenarioMeta;
  /** Grupos de alunos (cp13). Ausente = modo turma-toda-junta. */
  grupos?: GroupDef[];
  /** Anti-griefing (cp24): proteção de áreas ligada? Ausente = desligada. */
  claimsAtivo?: boolean;
  /** Áreas reivindicadas pelos alunos (cp24). Ausente = nenhuma. */
  claims?: Claim[];
  /** Grupos de amigos criados pelos alunos (cp24). Ausente = nenhum. */
  amigos?: GrupoAmigos[];
  /** Nicks banidos pelo professor (2026-07-21). Ausente = ninguém banido.
   *  O join recusa quem está aqui; persiste no mundo livre (some em mundo-aula). */
  banidos?: string[];
  /** Confinamento (cp25): aluno só edita na área do seu grupo? Ausente =
   *  desligado. Em mundo-aula o host força ligado no boot (não vem do save). */
  confinamento?: boolean;
  /** Quadros (2026-07-19): conteúdo (texto/imagem) por posição. Ausente =
   *  nenhum quadro com conteúdo. */
  quadros?: QuadroConteudo[];
  /** Ciclo dia/noite (cp21). `hora` em [0,24); `ciclo` = o tempo passa.
   *  Ausente em save antigo = padrão do mundo novo (meio-dia, ciclo parado).
   *  Mundo de atividade grava ciclo OFF; sobrevivência (futuro) grava a hora
   *  corrente pra continuar de onde parou. */
  hora?: number;
  ciclo?: boolean;
  /** Vento (§🌬️, 2026-07-27). Ausente = LIGADO (padrão do mundo novo) — só o
   *  desligado é gravado, então save antigo continua com cenário vivo. */
  vento?: boolean;
  /** Modo de jogo do MUNDO (§🍖 F1). Ausente = MODO_PADRAO (criativo) — só o
   *  que difere é gravado, então save antigo abre criativo como sempre foi. */
  modo?: Modo;
  /** Override pessoal de modo, por NOME de jogador (§🍖 F1). Ausente = ninguém
   *  com override. Por nome, não por id de cliente: o modo sobrevive ao rejoin. */
  modosPorJogador?: Record<string, Modo>;
  /** Regras de mundo (§🍖 F1, `/regra`) — MAPA, não campos soltos: regra nova
   *  no registro não mexe no formato nem re-versiona nada. Ausente (e nome
   *  ausente dentro dele) = padrão do registro. */
  regras?: Record<string, boolean>;
  /** Dimensões do mundo em chunks — GRAVADO só no save esparso (lazy), onde
   *  não há snapshot binário pra carregar as dims. Denso as tira do LJW0. */
  dims?: WorldDims;
}

export interface SaveData extends SaveMeta {
  world: World;
  /** F3 (save esparso): chunks editados a sobrepor DEPOIS de regenerar as
   *  colunas do seed. Presente só em save lazy — a session aplica no restore. */
  editedChunks?: { index: number; bytes: Uint8Array }[];
}

export function encodeSave(world: World, meta: SaveMeta): ArrayBuffer {
  const json = new TextEncoder().encode(JSON.stringify(meta));
  const snapshot = encodeSnapshot(world, meta.seed);
  const buf = new ArrayBuffer(SAVE_HEADER_BYTES + json.byteLength + snapshot.byteLength);
  const view = new DataView(buf);
  view.setUint32(0, SAVE_MAGIC, true);
  view.setUint32(4, json.byteLength, true);
  new Uint8Array(buf, SAVE_HEADER_BYTES).set(json);
  new Uint8Array(buf, SAVE_HEADER_BYTES + json.byteLength).set(new Uint8Array(snapshot));
  return buf;
}

/** F3: save ESPARSO do mundo lazy — grava só os chunks editados (índices em
 *  editedIndices). As dims vão no JSON (não há snapshot). */
export function encodeLazySave(
  world: World,
  meta: SaveMeta,
  editedIndices: readonly number[],
): ArrayBuffer {
  const json = new TextEncoder().encode(JSON.stringify({ ...meta, dims: world.dims }));
  const n = editedIndices.length;
  const buf = new ArrayBuffer(SAVE_HEADER_BYTES + json.byteLength + 4 + n * (4 + CHUNK_VOLUME));
  const view = new DataView(buf);
  view.setUint32(0, LAZY_SAVE_MAGIC, true);
  view.setUint32(4, json.byteLength, true);
  new Uint8Array(buf, SAVE_HEADER_BYTES).set(json);
  let off = SAVE_HEADER_BYTES + json.byteLength;
  view.setUint32(off, n, true);
  off += 4;
  const body = new Uint8Array(buf);
  for (const index of editedIndices) {
    view.setUint32(off, index, true);
    off += 4;
    const chunk = world.chunks[index];
    if (chunk) body.set(chunk, off); // ausente (não deveria) = zeros = ar
    off += CHUNK_VOLUME;
  }
  return buf;
}

function isFinitePos(p: unknown): p is { x: number; y: number; z: number } {
  if (typeof p !== "object" || p === null) return false;
  const o = p as Record<string, unknown>;
  return ["x", "y", "z"].every(
    (k) => typeof o[k] === "number" && Number.isFinite(o[k]),
  );
}

/** Decodifica e VALIDA um save (arquivo vem de fora — Drive, disco). Lança Error. */
export function decodeSave(buf: ArrayBuffer): SaveData {
  if (buf.byteLength < SAVE_HEADER_BYTES) {
    throw new Error(`save menor que o header (${buf.byteLength} bytes)`);
  }
  const view = new DataView(buf);
  const magic = view.getUint32(0, true);
  if (magic === LAZY_SAVE_MAGIC) return decodeLazySave(buf, view);
  if (magic !== SAVE_MAGIC) {
    throw new Error("save com magic inválido — não é um arquivo .ljw");
  }
  const { jsonLen, meta } = readSaveMeta(buf, view);
  // snapshot valida a si mesmo (magic LJW0, dims, tamanho)
  const snapshot = decodeSnapshot(buf.slice(SAVE_HEADER_BYTES + jsonLen));
  return { ...meta, world: snapshot.world };
}

/** F3: decodifica um save ESPARSO (lazy). Devolve o mundo VAZIO + os chunks
 *  editados — a session regenera as colunas do seed e sobrepõe estes bytes. */
function decodeLazySave(buf: ArrayBuffer, view: DataView): SaveData {
  const { jsonLen, m, meta } = readSaveMeta(buf, view);
  const d = m["dims"];
  const dims =
    typeof d === "object" && d !== null &&
    typeof (d as Record<string, unknown>)["x"] === "number" &&
    typeof (d as Record<string, unknown>)["z"] === "number" &&
    typeof (d as Record<string, unknown>)["y"] === "number"
      ? (d as WorldDims)
      : null;
  if (
    !dims || dims.x < 1 || dims.z < 1 || dims.y < 1 ||
    dims.x > MAX_LAZY_CHUNKS.x || dims.z > MAX_LAZY_CHUNKS.z || dims.y > MAX_LAZY_CHUNKS.y
  ) {
    throw new Error("save esparso sem dims válidas");
  }
  let off = SAVE_HEADER_BYTES + jsonLen;
  if (off + 4 > buf.byteLength) throw new Error("save esparso truncado (sem contagem)");
  const n = view.getUint32(off, true);
  off += 4;
  if (off + n * (4 + CHUNK_VOLUME) > buf.byteLength) {
    throw new Error(`save esparso truncado (${n} chunks não cabem)`);
  }
  const total = dims.x * dims.y * dims.z;
  const editedChunks: { index: number; bytes: Uint8Array }[] = [];
  for (let i = 0; i < n; i++) {
    const index = view.getUint32(off, true);
    off += 4;
    if (index < total) {
      editedChunks.push({ index, bytes: new Uint8Array(buf.slice(off, off + CHUNK_VOLUME)) });
    }
    off += CHUNK_VOLUME;
  }
  return { ...meta, dims, world: createWorld(dims, false), editedChunks };
}

/** Lê o header + JSON de metadados (comum aos dois formatos de save). Devolve
 *  o tamanho do JSON, o objeto cru `m` (pra campos específicos do formato) e
 *  o `meta` já validado/montado. */
function readSaveMeta(
  buf: ArrayBuffer,
  view: DataView,
): { jsonLen: number; m: Record<string, unknown>; meta: SaveMeta } {
  const jsonLen = view.getUint32(4, true);
  if (SAVE_HEADER_BYTES + jsonLen > buf.byteLength) {
    throw new Error("save truncado: JSON de metadados maior que o arquivo");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(
      new TextDecoder().decode(new Uint8Array(buf, SAVE_HEADER_BYTES, jsonLen)),
    );
  } catch {
    throw new Error("save com JSON de metadados quebrado");
  }
  if (typeof parsed !== "object" || parsed === null) throw new Error("metadados não são objeto");
  const m = parsed as Record<string, unknown>;
  if (typeof m["seed"] !== "number" || !Number.isFinite(m["seed"])) {
    throw new Error("save sem seed válida");
  }
  if (!isFinitePos(m["spawn"])) throw new Error("save sem spawn válido");
  const roster: SavedPlayer[] = [];
  if (Array.isArray(m["roster"])) {
    for (const entry of m["roster"]) {
      if (
        typeof entry === "object" && entry !== null &&
        typeof (entry as Record<string, unknown>)["name"] === "string" &&
        isFinitePos(entry)
      ) {
        const e = entry as Record<string, unknown> & { name: string; x: number; y: number; z: number };
        // yaw/pitch entraram depois — save antigo sem eles continua válido (0)
        const angle = (v: unknown): number =>
          typeof v === "number" && Number.isFinite(v) ? v : 0;
        roster.push({
          name: e.name,
          x: e.x, y: e.y, z: e.z,
          yaw: angle(e["yaw"]),
          pitch: angle(e["pitch"]),
          // cp9: campos ausentes/errados = sem PIN, aluno (save antigo válido)
          ...(typeof e["pin"] === "string" ? { pin: e["pin"] } : {}),
          ...(e["papel"] === "professor" ? { papel: "professor" as const } : {}),
          // §🍖 F2: vida só entra se for número são e MENOR que a vida cheia
          // (fora disso o jogador nasce inteiro, que é o padrão)
          ...(typeof e["vida"] === "number" &&
          Number.isFinite(e["vida"]) &&
          e["vida"] > 0 &&
          e["vida"] < VIDA_MAX
            ? { vida: Math.floor(e["vida"]) }
            : {}),
          // §🍖 F3: fome idem, mas ZERO é válido (barra vazia é estado de jogo;
          // vida zero seria um morto, que não existe no roster)
          ...(typeof e["fome"] === "number" &&
          Number.isFinite(e["fome"]) &&
          e["fome"] >= 0 &&
          e["fome"] < FOME_MAX
            ? { fome: Math.floor(e["fome"]) }
            : {}),
        });
      }
    }
  }
  // cp11: entrada de região quebrada é PULADA (save antigo/editado continua válido)
  const regioes: NamedRegion[] = [];
  if (Array.isArray(m["regioes"])) {
    for (const entry of m["regioes"]) {
      const r = parseNamedRegion(entry);
      if (r) regioes.push(r);
    }
  }
  // cp12: cenário inválido/ausente = mundo sem cenário (save antigo válido)
  const cenario = parseScenarioMeta(m["cenario"]);
  const grupos = parseGroups(m["grupos"]);
  // cp24: claims + grupos de amigos — entrada quebrada é PULADA (save antigo válido)
  const claims: Claim[] = [];
  if (Array.isArray(m["claims"])) {
    for (const entry of m["claims"]) {
      const c = parseClaim(entry);
      if (c) claims.push(c);
    }
  }
  const amigos: GrupoAmigos[] = [];
  if (Array.isArray(m["amigos"])) {
    for (const entry of m["amigos"]) {
      const g = parseGrupoAmigos(entry);
      if (g) amigos.push(g);
    }
  }
  // nicks banidos (2026-07-21): só strings, sem duplicata (save antigo = vazio)
  const banidos: string[] = [];
  if (Array.isArray(m["banidos"])) {
    for (const entry of m["banidos"]) {
      if (typeof entry === "string" && entry && !banidos.includes(entry)) banidos.push(entry);
    }
  }
  // quadros (2026-07-19): entrada quebrada é PULADA (mesma tolerância)
  const quadros: QuadroConteudo[] = [];
  if (Array.isArray(m["quadros"])) {
    for (const entry of m["quadros"]) {
      const q = parseQuadroConteudo(entry);
      if (q) quadros.push(q);
    }
  }
  // §🍖 F1: override de modo por nome — entrada com nome vazio ou modo
  // desconhecido é PULADA (mesma tolerância dos claims/quadros)
  let modosPorJogador: Record<string, Modo> | undefined;
  const mpj = m["modosPorJogador"];
  if (typeof mpj === "object" && mpj !== null && !Array.isArray(mpj)) {
    for (const [nome, valor] of Object.entries(mpj as Record<string, unknown>)) {
      const modo = parseModo(valor);
      if (!nome || !modo) continue;
      modosPorJogador ??= {};
      modosPorJogador[nome] = modo;
    }
  }
  // regras de mundo: o registro é quem valida (nome desconhecido é pulado) e
  // só o que difere do padrão sobrevive ao round-trip
  const regras = regrasParaSave(parseRegras(m["regras"]));
  const meta: SaveMeta = {
    seed: m["seed"],
    spawn: { x: m["spawn"].x, y: m["spawn"].y, z: m["spawn"].z },
    roster,
    ...(typeof m["codigo"] === "string" ? { codigo: m["codigo"] } : {}),
    ...(regioes.length ? { regioes } : {}),
    ...(cenario?.objetivos.length ? { cenario } : {}),
    ...(grupos.length ? { grupos } : {}),
    // cp24: proteção de áreas (só grava o que existe — save antigo enxuto)
    ...(m["claimsAtivo"] === true ? { claimsAtivo: true } : {}),
    ...(claims.length ? { claims } : {}),
    ...(amigos.length ? { amigos } : {}),
    ...(banidos.length ? { banidos } : {}),
    // cp25: confinamento por área de grupo (ausente = desligado)
    ...(m["confinamento"] === true ? { confinamento: true } : {}),
    ...(quadros.length ? { quadros } : {}),
    // cp21: hora/ciclo ausentes ou inválidos = padrão do mundo novo (na sessão)
    ...(typeof m["hora"] === "number" && Number.isFinite(m["hora"]) ? { hora: m["hora"] } : {}),
    ...(typeof m["ciclo"] === "boolean" ? { ciclo: m["ciclo"] } : {}),
    // §🌬️: ausente = ligado; só o `false` viaja (ver SaveMeta.vento)
    ...(m["vento"] === false ? { vento: false } : {}),
    // §🍖 F1: modo do mundo + overrides por nome. Token inválido = ausente =
    // criativo (mesma tolerância do resto: save editado não derruba o mundo).
    ...(parseModo(m["modo"]) ? { modo: parseModo(m["modo"]) as Modo } : {}),
    ...(modosPorJogador ? { modosPorJogador } : {}),
    ...(regras ? { regras } : {}),
  };
  return { jsonLen, m, meta };
}
