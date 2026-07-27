/**
 * Configurações do jogador, persistidas em localStorage (por navegador).
 * Carregamento DEFENSIVO: campo faltando/inválido cai no default — atualizar
 * o jogo nunca quebra a config antiga de ninguém.
 * Som: volume vale pros sons de INTERFACE (audio.ts) — som de mundo vem depois.
 */

export type KeyAction =
  | "forward" | "back" | "left" | "right" | "jump" | "correr" | "agachar"
  | "chat" | "hud" | "varinha" | "painel" | "inventario";

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
};

const STORAGE_KEY = "lj-config";

function num(v: unknown, def: number, min: number, max: number): number {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def;
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
