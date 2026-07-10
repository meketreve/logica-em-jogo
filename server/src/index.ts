import { WebSocketServer } from "ws";
import { SERVER_TICK_RATE } from "@logica/shared";

/**
 * Servidor LAN (hospedeiro Node+ws). Placeholder até o checkpoint 5 —
 * o singleplayer usa o mesmo código de /shared dentro de um Web Worker no cliente.
 */
const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (socket) => {
  socket.send(
    JSON.stringify({
      type: "chat",
      text: "servidor de teste — netcode LAN chega no checkpoint 5",
    }),
  );
});

console.log(
  `[server] escutando em ws://localhost:${PORT} (tick alvo: ${SERVER_TICK_RATE} tps)`,
);
