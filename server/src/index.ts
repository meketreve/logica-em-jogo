import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { WebSocketServer, type WebSocket } from "ws";
import {
  GameSession,
  SERVER_TICK_RATE,
  type SaveData,
  decodeSave,
  encodeSave,
} from "@logica/shared";

/**
 * Hospedeiro Node+ws do servidor (LAN): embrulha a MESMA GameSession do Web
 * Worker. Este arquivo é SÓ transporte + agendamento do tick + PERSISTÊNCIA
 * (cp7): carrega o .ljw no boot, autossalva e grava ao encerrar (Ctrl+C).
 * Nenhuma decisão de estado do mundo acontece aqui.
 */

const PORT = Number(process.env["LJ_PORT"] ?? 8080);
const SAVE_PATH = process.env["LJ_SAVE"] ?? "world.ljw";
const AUTOSAVE_MS = 30_000;
const WORLD_SEED = 20260710; // usada só na PRIMEIRA vez (sem save no disco)

// --- Carregar mundo salvo (se houver) ---
let restore: SaveData | undefined;
if (existsSync(SAVE_PATH)) {
  try {
    // Buffer.buffer é o POOL compartilhado do Node — recortar pelo byteOffset
    const raw = readFileSync(SAVE_PATH);
    restore = decodeSave(
      raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer,
    );
    console.log(`[server] mundo carregado de ${SAVE_PATH} (${restore.roster.length} jogador(es) no roster)`);
  } catch (err) {
    // save corrompido: NUNCA sobrescrever a evidência — renomeia e recomeça
    const backup = `${SAVE_PATH}.corrompido-${Date.now()}`;
    renameSync(SAVE_PATH, backup);
    console.error(
      `[server] save inválido (${(err as Error).message}) — movido para ${backup}; gerando mundo novo`,
    );
  }
}

const sockets = new Map<number, WebSocket>();

const session = new GameSession(
  (clientId, data) => {
    const socket = sockets.get(clientId);
    if (socket && socket.readyState === socket.OPEN) socket.send(data);
  },
  { seed: WORLD_SEED, now: () => performance.now(), restore },
);

// --- Persistência: escrita atômica (tmp + rename) pra nunca truncar o save ---
function saveNow(reason: string): void {
  const buf = Buffer.from(encodeSave(session.world, session.toSave()));
  const tmp = `${SAVE_PATH}.tmp`;
  writeFileSync(tmp, buf);
  renameSync(tmp, SAVE_PATH);
  console.log(`[server] mundo salvo em ${SAVE_PATH} (${buf.byteLength} bytes, ${reason})`);
}

setInterval(() => saveNow("autosave"), AUTOSAVE_MS);
process.on("SIGINT", () => {
  saveNow("encerrando");
  process.exit(0);
});
process.on("SIGTERM", () => {
  saveNow("encerrando");
  process.exit(0);
});

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
  `[server] escutando em ws://0.0.0.0:${PORT} (tick alvo: ${SERVER_TICK_RATE} tps, ` +
    `${restore ? `mundo do save ${SAVE_PATH}` : `mundo novo, seed ${WORLD_SEED}`})`,
);
