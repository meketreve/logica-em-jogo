/**
 * Gatilhos de som (checkpoint 6): pontos de evento do jogo onde o áudio vai
 * plugar DEPOIS (som está fora do MVP v0). Hoje ninguém escuta — o valor é
 * os emits já estarem nos lugares certos quando o som chegar.
 */
export type GameEvent =
  | { kind: "block_placed"; blockId: number }
  | { kind: "block_broken" }
  | { kind: "chat_message" }
  | { kind: "objective_complete" }
  /** §🍖 F2: levou dano / morreu. O som pluga aqui junto com os outros. */
  | { kind: "dano" }
  | { kind: "morte" };

type Listener = (e: GameEvent) => void;

const listeners = new Set<Listener>();

export function onGameEvent(fn: Listener): void {
  listeners.add(fn);
}

export function emitGameEvent(e: GameEvent): void {
  for (const fn of listeners) fn(e);
}
