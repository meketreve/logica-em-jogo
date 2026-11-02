/**
 * Gatilhos de som (checkpoint 6). Quem escuta: `audio.ts` (objetivo, chat) e
 * `somMundo.ts` (dano, morte). O som de BLOCO não passa mais por aqui — ele
 * precisa do id de ANTES da troca (`somDaTroca`), que este evento não carrega;
 * `block_placed`/`block_broken` seguem emitidos pra quem quiser só o fato.
 */
export type GameEvent =
  | { kind: "block_placed"; blockId: number }
  | { kind: "block_broken" }
  | { kind: "chat_message" }
  | { kind: "objective_complete" }
  /** §🍖 F2: levou dano / morreu — o `somMundo` toca o "uf" e a queda. */
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
