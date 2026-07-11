import { WebSocketServer, type WebSocket } from "ws";
import { GameSession, SERVER_TICK_RATE } from "@logica/shared";

/**
 * Hospedeiro Node+ws do servidor (LAN, checkpoint 5): embrulha a MESMA
 * GameSession do Web Worker. Este arquivo é SÓ transporte + agendamento do
 * tick — id por socket, entregar mensagens cruas, avisar disconnect.
 * Nenhuma decisão de estado do mundo acontece aqui.
 */

const PORT = 8080;
const WORLD_SEED = 20260710; // mesma seed do worker — mundos idênticos p/ comparar

const sockets = new Map<number, WebSocket>();

const session = new GameSession(
  (clientId, data) => {
    const socket = sockets.get(clientId);
    if (socket && socket.readyState === socket.OPEN) socket.send(data);
  },
  { seed: WORLD_SEED, now: () => performance.now() },
);

let nextClientId = 1;

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (socket, req) => {
  const id = nextClientId++;
  sockets.set(id, socket);
  console.log(`[server] cliente ${id} conectou (${req.socket.remoteAddress ?? "?"})`);

  socket.on("message", (data, isBinary) => {
    // Protocolo cliente→servidor é 100% JSON; frame binário é lixo/ataque.
    if (!isBinary) session.handleMessage(id, data.toString());
  });

  socket.on("close", () => {
    sockets.delete(id);
    session.handleDisconnect(id);
    console.log(`[server] cliente ${id} desconectou`);
  });

  // Sem handler de error o ws derruba o processo inteiro; close vem em seguida.
  socket.on("error", (err) => {
    console.error(`[server] erro no socket do cliente ${id}:`, err.message);
  });
});

setInterval(() => session.tick(), 1000 / SERVER_TICK_RATE);

console.log(
  `[server] escutando em ws://0.0.0.0:${PORT} (tick alvo: ${SERVER_TICK_RATE} tps, seed ${WORLD_SEED})`,
);
