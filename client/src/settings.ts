/**
 * Configurações do jogador, persistidas em localStorage (por navegador).
 * Carregamento DEFENSIVO: campo faltando/inválido cai no default — atualizar
 * o jogo nunca quebra a config antiga de ninguém.
 * Som: volume vale pros sons de INTERFACE (audio.ts) — som de mundo vem depois.
 */

export type KeyAction =
  | "forward" | "back" | "left" | "right" | "jump" | "correr" | "agachar"
  | "chat" | "hud" | "varinha" | "painel" | "inventario" | "amigos"
  | "terceiraPessoa" | "emogis";

/** Modo de câmera (2026-09-03) — persiste como opção, não como estado de sessão. */
export type CameraMode = "primeira" | "terceira";

/** Layouts dos controles de toque (2026-08-28, pedido do usuário). "destro" é
 *  o padrão de sempre; "direcional" troca o joystick por um D-pad de 4
 *  botões (sem diagonais). */
export type TouchLayout = "destro" | "canhoto" | "compacto" | "espalhado" | "direcional";

export const TOUCH_LAYOUT_LABEL: Record<TouchLayout, string> = {
  destro: "Destro (padrão)",
  canhoto: "Canhoto (espelhado)",
  compacto: "Compacto (mais perto)",
  espalhado: "Espalhado (mais afastado)",
  direcional: "Direcional (sem joystick, botões)",
};

export interface GameSettings {
  /** Multiplicador da sensibilidade do mouse (1 = padrão). */
  sensitivity: number;
  /** Campo de visão da câmera (graus). */
  fov: number;
  /** Teto do devicePixelRatio (1 = econômico p/ PC fraco; 2 = nítido). */
  pixelRatioCap: number;
  /** Volume 0..1 dos sons de interface (menus, botões, notificações). */
  volume: number;
  /** Streaming (mundo ENORME): raio de render em COLUNAS de chunks — quanto
   *  do mundo fica carregado em volta do jogador. Config de desempenho. */
  raioRender: number;
  /**
   * Streaming: quanto TEMPO do frame pode ser gasto montando malha (ms).
   * Era uma CONTAGEM de chunks (`meshPorFrame`), trocada em 2026-07-26: o custo
   * por chunk varia de 0,1 a 3 ms, então "8 chunks" tanto custava 1 ms quanto
   * 24 ms — era a origem direta dos frames de 50-100 ms nos perfis. Orçamento em
   * tempo dá teto previsível; a fila só demora mais a esvaziar.
   */
  meshMsPorFrame: number;
  /** Escala da UI de toque (2026-07-21): joystick e botões maiores/menores
   *  conforme o tamanho da tela do celular/tablet. 1 = padrão. Só afeta o toque. */
  uiScale: number;
  /** Disposição dos controles de toque (2026-08-28). Só afeta o toque. */
  touchLayout: TouchLayout;
  /** Nuvens no céu (§🌬️, 2026-07-27). Config de DESEMPENHO, não de gosto: é um
   *  plano transparente grande, e o custo dele é fill rate — justo o que já
   *  está no teto no notebook do laboratório. Desligar devolve esse fill. */
  nuvens: boolean;
  /** Balanço de folhas, grama e flores no vento (§🌬️). Também desempenho: mexe
   *  no vertex shader do material do terreno (o custo é por VÉRTICE, não por
   *  pixel — bem mais barato que as nuvens, mas dá pra desligar junto). */
  balanco: boolean;
  /** 3ª pessoa PERSISTENTE (2026-09-03, tecla F5 por padrão) — separado do
   *  override temporário do menu de emojis, que força 3ª pessoa por alguns
   *  segundos e depois volta pro que está aqui. */
  cameraMode: CameraMode;
  keys: Record<KeyAction, string>;
}

export const DEFAULT_SETTINGS: GameSettings = {
  sensitivity: 1,
  fov: 75,
  pixelRatioCap: 2,
  volume: 0.8,
  raioRender: 6,
  meshMsPorFrame: 6,
  uiScale: 1,
  touchLayout: "destro",
  nuvens: true,
  balanco: true,
  cameraMode: "primeira",
  keys: {
    forward: "KeyW",
    back: "KeyS",
    left: "KeyA",
    right: "KeyD",
    jump: "Space",
    correr: "ControlLeft",
    agachar: "ShiftLeft",
    chat: "Enter",
    hud: "F3",
    varinha: "KeyR",
    painel: "KeyP",
    inventario: "KeyE",
    amigos: "KeyG",
    terceiraPessoa: "KeyC",
    emogis: "KeyV",
  },
};

export const KEY_ACTION_LABEL: Record<KeyAction, string> = {
  forward: "andar pra frente",
  back: "andar pra trás",
  left: "andar pra esquerda",
  right: "andar pra direita",
  jump: "pular",
  correr: "correr (segurar; ou 2× andar pra frente)",
  agachar: "agachar (não cai da borda)",
  chat: "abrir chat",
  hud: "painel de desempenho",
  varinha: "varinha de região (professor)",
  painel: "painel (professor: autoria · aluno: grupo)",
  inventario: "inventário de blocos",
  amigos: "painel de amigos (áreas compartilhadas)",
  terceiraPessoa: "câmera em 3ª pessoa (alternar)",
  emogis: "menu de emojis",
};

const STORAGE_KEY = "lj-config";

function num(v: unknown, def: number, min: number, max: number): number {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def;
}

function bool(v: unknown, def: boolean): boolean {
  return typeof v === "boolean" ? v : def;
}

function oneOf<T extends string>(v: unknown, def: T, valid: readonly T[]): T {
  return typeof v === "string" && (valid as readonly string[]).includes(v) ? (v as T) : def;
}

export function loadSettings(): GameSettings {
  let raw: unknown = null;
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
  } catch {
    /* config corrompida = defaults */
  }
  const s = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const k = (typeof s["keys"] === "object" && s["keys"] !== null ? s["keys"] : {}) as Record<
    string,
    unknown
  >;
  const keys = { ...DEFAULT_SETTINGS.keys };
  for (const action of Object.keys(keys) as KeyAction[]) {
    if (typeof k[action] === "string" && k[action]) keys[action] = k[action];
  }
  return {
    sensitivity: num(s["sensitivity"], DEFAULT_SETTINGS.sensitivity, 0.2, 3),
    fov: num(s["fov"], DEFAULT_SETTINGS.fov, 60, 100),
    pixelRatioCap: num(s["pixelRatioCap"], DEFAULT_SETTINGS.pixelRatioCap, 1, 2),
    volume: num(s["volume"], DEFAULT_SETTINGS.volume, 0, 1),
    raioRender: num(s["raioRender"], DEFAULT_SETTINGS.raioRender, 2, 12),
    meshMsPorFrame: num(s["meshMsPorFrame"], DEFAULT_SETTINGS.meshMsPorFrame, 1, 16),
    uiScale: num(s["uiScale"], DEFAULT_SETTINGS.uiScale, 0.6, 1.8),
    touchLayout: oneOf<TouchLayout>(s["touchLayout"], DEFAULT_SETTINGS.touchLayout, [
      "destro", "canhoto", "compacto", "espalhado", "direcional",
    ]),
    nuvens: bool(s["nuvens"], DEFAULT_SETTINGS.nuvens),
    balanco: bool(s["balanco"], DEFAULT_SETTINGS.balanco),
    cameraMode: oneOf<CameraMode>(s["cameraMode"], DEFAULT_SETTINGS.cameraMode, ["primeira", "terceira"]),
    keys,
  };
}

export function saveSettings(s: GameSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

/** Nome amigável de um e.code pro botão de rebind ("KeyW" → "W"). */
export function keyLabel(code: string): string {
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  const nice: Record<string, string> = {
    Space: "Espaço",
    Enter: "Enter",
    ShiftLeft: "Shift esq.",
    ShiftRight: "Shift dir.",
    ControlLeft: "Ctrl esq.",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
  };
  return nice[code] ?? code;
}
