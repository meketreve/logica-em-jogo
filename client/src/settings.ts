/**
 * Configurações do jogador, persistidas em localStorage (por navegador).
 * Carregamento DEFENSIVO: campo faltando/inválido cai no default — atualizar
 * o jogo nunca quebra a config antiga de ninguém.
 * Som: só o valor é guardado; áudio ainda não existe (gatilhos em events.ts).
 */

export type KeyAction = "forward" | "back" | "left" | "right" | "jump" | "chat" | "hud";

export interface GameSettings {
  /** Multiplicador da sensibilidade do mouse (1 = padrão). */
  sensitivity: number;
  /** Campo de visão da câmera (graus). */
  fov: number;
  /** Teto do devicePixelRatio (1 = econômico p/ PC fraco; 2 = nítido). */
  pixelRatioCap: number;
  /** Volume 0..1 — guardado, mas SEM efeito até o áudio existir. */
  volume: number;
  keys: Record<KeyAction, string>;
}

export const DEFAULT_SETTINGS: GameSettings = {
  sensitivity: 1,
  fov: 75,
  pixelRatioCap: 2,
  volume: 0.8,
  keys: {
    forward: "KeyW",
    back: "KeyS",
    left: "KeyA",
    right: "KeyD",
    jump: "Space",
    chat: "Enter",
    hud: "F3",
  },
};

export const KEY_ACTION_LABEL: Record<KeyAction, string> = {
  forward: "andar pra frente",
  back: "andar pra trás",
  left: "andar pra esquerda",
  right: "andar pra direita",
  jump: "pular",
  chat: "abrir chat",
  hud: "painel de desempenho",
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
