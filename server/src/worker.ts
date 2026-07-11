/// <reference lib="webworker" />
import { GameSession, SERVER_TICK_RATE } from "@logica/shared";

/**
 * Hospedeiro Web Worker do servidor (singleplayer): embrulha a GameSession
 * de /shared e fala com o cliente por postMessage — mesmas mensagens do
 * WebSocket futuro. Este arquivo é SÓ transporte + agendamento do tick;
 * nenhuma decisão de estado do mundo acontece aqui.
 */

const WORLD_SEED = 20260710;
const CLIENT_ID = 0; // worker dedicado = exatamente 1 cliente

const session = new GameSession(
  (_clientId, data) => {
    if (typeof data === "string") postMessage(data);
    else postMessage(data, { transfer: [data] });
  },
  { seed: WORLD_SEED, now: () => performance.now() },
);

self.onmessage = (e: MessageEvent) => {
  if (typeof e.data === "string") session.handleMessage(CLIENT_ID, e.data);
};

setInterval(() => session.tick(), 1000 / SERVER_TICK_RATE);
