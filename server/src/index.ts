import { randomInt } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import { dirname } from "node:path";
import { createInterface } from "node:readline";
import { WebSocketServer, type WebSocket } from "ws";
import {
  GameSession,
  SERVER_TICK_RATE,
  type SaveData,
  TAMANHO_CHUNKS,
  decodeSave,
  encodeSave,
  parseWorldPreset,
  parseWorldTamanho,
} from "@logica/shared";
import { comandoMundo } from "./mundos";
import { daRaiz, mundoDeTrabalho } from "./paths";
import { clienteFoiBuildado, servirCliente } from "./static";

/**
 * Hospedeiro Node+ws do servidor (LAN): embrulha a MESMA GameSession do Web
 * Worker. Este arquivo é SÓ transporte + agendamento do tick + PERSISTÊNCIA
 * (cp7): carrega o .ljw no boot, autossalva e grava ao encerrar (Ctrl+C).
 * Nenhuma decisão de estado do mundo acontece aqui.
 */

const PORT = Number(process.env["LJ_PORT"] ?? 8080);
const SAVE_ENV = process.env["LJ_SAVE"];
// Um cenário em cenarios/ é MODELO: o autosave grava numa CÓPIA DE TRABALHO em
// aulas/ para não poluir o arquivo distribuído com roster, PINs e progresso da
// turma. `vivo` é onde salvamos; `modelo` é a semente da primeira vez.
const {
  vivo: SAVE_PATH,
  modelo: MODELO,
  somenteLeitura: LEITURA_INICIAL,
} = mundoDeTrabalho(SAVE_ENV ?? "world.ljw");
// De onde carregar no boot. Mundo de AULA (só leitura) começa SEMPRE do modelo,
// ignorando qualquer cópia viva da turma anterior — é reutilizável de graça.
// Mundo normal: a cópia viva vence (a turma continua de onde parou); na falta
// dela, o modelo; na falta dos dois, mundo novo.
const CARREGAR_DE = LEITURA_INICIAL
  ? MODELO && existsSync(MODELO)
    ? MODELO
    : existsSync(SAVE_PATH)
      ? SAVE_PATH
      : undefined
  : existsSync(SAVE_PATH)
    ? SAVE_PATH
    : MODELO && existsSync(MODELO)
      ? MODELO
      : undefined;
const AUTOSAVE_MS = 30_000;
const WORLD_SEED = 20260710; // usada só na PRIMEIRA vez (sem save no disco)

// Pedir um mundo que não existe é quase sempre erro de digitação no caminho.
// Subir um mundo VAZIO em silêncio é o pior desfecho possível: o professor só
// descobre com a turma na frente, na hora em que o cenário não aparece. Para
// criar um mundo novo neste caminho de propósito, use LJ_NOVO=1.
if (SAVE_ENV && !CARREGAR_DE && process.env["LJ_NOVO"] !== "1") {
  console.error(
    `[server] LJ_SAVE aponta para um arquivo que não existe:\n` +
      `           ${SAVE_ENV}\n` +
      `         Nenhum mundo foi carregado e o servidor não vai subir.\n` +
      `         · Se o caminho está errado, corrija (caminho relativo conta a partir da raiz do repositório).\n` +
      `         · Se os cenários ainda não foram gerados, rode: npm run cenarios\n` +
      `         · Se a intenção é criar um mundo novo neste caminho, rode de novo com LJ_NOVO=1`,
  );
  process.exit(1);
}

// --- Carregar mundo salvo (se houver) ---
let restore: SaveData | undefined;
if (CARREGAR_DE) {
  try {
    // Buffer.buffer é o POOL compartilhado do Node — recortar pelo byteOffset
    const raw = readFileSync(CARREGAR_DE);
    restore = decodeSave(
      raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer,
    );
    const origem = CARREGAR_DE === MODELO ? `modelo ${CARREGAR_DE} (cópia viva em ${SAVE_PATH})` : CARREGAR_DE;
    console.log(`[server] mundo carregado de ${origem} (${restore.roster.length} jogador(es) no roster)`);
  } catch (err) {
    if (CARREGAR_DE === SAVE_PATH) {
      // cópia de trabalho corrompida: NUNCA sobrescrever a evidência
      const backup = `${SAVE_PATH}.corrompido-${Date.now()}`;
      renameSync(SAVE_PATH, backup);
      console.error(
        `[server] save inválido (${(err as Error).message}) — movido para ${backup}; gerando mundo novo`,
      );
    } else {
      // modelo corrompido: é arquivo DISTRIBUÍDO, não se renomeia — regenere-o.
      console.error(
        `[server] modelo inválido (${(err as Error).message}) em ${CARREGAR_DE}; ` +
          `gere de novo com npm run cenarios. Subindo mundo novo por ora.`,
      );
    }
  }
}

// --- Código de professor (cp9): definido na CRIAÇÃO do mundo ---
// LJ_CODIGO na env define/ATUALIZA; mundo novo sem env gera um. Texto puro
// no save (ver auth.ts) — dá pra imprimir em TODO boot: quem lê o console
// do host é o professor.
function gerarCodigo(): string {
  const alfabeto = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // sem 0/O/1/I/L
  let s = "";
  for (let i = 0; i < 6; i++) s += alfabeto[randomInt(alfabeto.length)];
  return s;
}
// const: o código do professor atravessa a troca de aula (cp19) — a turma não
// vai receber um código novo no meio da aula
const codigo: string = process.env["LJ_CODIGO"] ?? restore?.codigo ?? gerarCodigo();
console.log(`[server] código de professor deste mundo: ${codigo}`);

const sockets = new Map<number, WebSocket>();

const entregar = (clientId: number, data: string | ArrayBuffer): void => {
  const socket = sockets.get(clientId);
  if (socket && socket.readyState === socket.OPEN) socket.send(data);
};

// `let`: a troca de aula (/mundo carregar) substitui a sessão E o caminho do
// save sem derrubar ninguém. Tudo que usa `session`/`savePath` lê a variável na
// hora da chamada, então continua apontando para o mundo em vigor.
let savePath = SAVE_PATH;
// Mundo de aula (reutilizável) não salva. `let`: a troca de aula (/mundo
// carregar) atualiza junto com savePath — a aula nova decide se persiste.
let somenteLeitura = LEITURA_INICIAL;
if (somenteLeitura) {
  console.log(
    `[server] mundo de AULA (reutilizável): alterações NÃO são salvas — a próxima ` +
      `turma reaproveita esta aula sem mover arquivos.`,
  );
}
let session = new GameSession(
  entregar,
  {
    seed: WORLD_SEED,
    now: () => performance.now(),
    restore,
    codigo,
    // mundo de aula (read-only) nasce confinado — cada aluno na área do grupo (cp25)
    somenteLeitura,
    // preset do mundo NOVO (cp14): LJ_PRESET=plano|cabines; LJ_PLANO=1 é o
    // alias antigo de plano. Mundo restaurado do save ignora.
    preset:
      process.env["LJ_PLANO"] === "1"
        ? "plano"
        : parseWorldPreset(process.env["LJ_PRESET"]),
    // tamanho do mundo NOVO (2026-07-19): LJ_TAMANHO=P|M|G (restaurado ignora)
    dims: TAMANHO_CHUNKS[parseWorldTamanho(process.env["LJ_TAMANHO"])],
  },
);

// --- Persistência: escrita atômica (tmp + rename) pra nunca truncar o save ---
function saveNow(reason: string): void {
  if (somenteLeitura) return; // mundo de aula: reutilizável, nunca persiste
  const buf = Buffer.from(encodeSave(session.world, session.toSave()));
  const tmp = `${savePath}.tmp`;
  mkdirSync(dirname(savePath), { recursive: true }); // pasta do save pode não existir ainda
  writeFileSync(tmp, buf);
  renameSync(tmp, savePath);
  console.log(`[server] mundo salvo em ${savePath} (${buf.byteLength} bytes, ${reason})`);
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

const falarCom = (clientId: number, texto: string): void =>
  entregar(clientId, JSON.stringify({ type: "chat", author: "servidor", text: texto }));

// --- Terminal do host: o professor digita comandos no PRÓPRIO console do
// servidor, sem precisar estar dentro do jogo (modelo do Minecraft).
// Em background (nohup) o stdin fecha na hora — o readline só não recebe nada.
const terminal = createInterface({ input: process.stdin });
terminal.on("line", (linha) => {
  const texto = linha.trim();
  if (!texto) return;
  const partes = texto.split(/\s+/);
  if (partes[0] === "/say") {
    const msg = partes.slice(1).join(" ");
    if (!msg) {
      console.log("[server] uso: /say mensagem — fala com a turma pelo chat");
      return;
    }
    for (const id of sockets.keys()) falarCom(id, msg);
    console.log(`[server] <servidor> ${msg} (enviado a ${sockets.size} jogador(es))`);
  } else {
    console.log(`[server] comando desconhecido: ${partes[0]}. Comandos do terminal: /say mensagem`);
  }
});

/**
 * `/mundo` é o único comando que o HOST trata em vez da sessão: trocar de aula é
 * ler um arquivo do disco, e a GameSession não tem sistema de arquivos.
 * Devolve true quando engoliu a mensagem.
 */
function interceptarMundo(clientId: number, texto: string): boolean {
  let msg: { type?: unknown; text?: unknown };
  try {
    msg = JSON.parse(texto) as { type?: unknown; text?: unknown };
  } catch {
    return false; // lixo no fio: deixa a sessão recusar, como sempre fez
  }
  if (msg.type !== "chat" || typeof msg.text !== "string") return false;
  const partes = msg.text.trim().split(/\s+/);
  if (partes[0] !== "/mundo") return false;

  const quem = session.jogadoresConectados().find((j) => j.id === clientId);
  if (!quem) {
    falarCom(clientId, "Entre no mundo primeiro.");
    return true;
  }
  if (quem.papel !== "professor") {
    falarCom(clientId, "Somente o professor pode trocar a aula.");
    return true;
  }

  const troca = comandoMundo(partes, {
    session,
    savePath,
    codigo,
    novaSessao: (restore, somenteLeitura) =>
      new GameSession(entregar, {
        now: () => performance.now(),
        restore,
        codigo,
        somenteLeitura,
      }),
    salvarAgora: saveNow,
    responder: (t) => falarCom(clientId, t),
    anunciar: (t) => {
      for (const outroId of sockets.keys()) falarCom(outroId, t);
    },
  });
  if (troca) {
    session = troca.session;
    savePath = troca.savePath;
    somenteLeitura = troca.somenteLeitura;
  }
  return true;
}

/**
 * `/kicar nome` (cp22) — o professor remove um aluno por mau comportamento.
 * Mora no HOST (como /mundo) porque FECHAR um socket é transporte, não estado
 * do mundo — a GameSession não tem sockets. O aluno pode entrar de novo com o
 * PIN (é expulsão, não banimento). Devolve true quando engoliu a mensagem.
 */
function interceptarKicar(clientId: number, texto: string): boolean {
  let msg: { type?: unknown; text?: unknown };
  try {
    msg = JSON.parse(texto) as { type?: unknown; text?: unknown };
  } catch {
    return false;
  }
  if (msg.type !== "chat" || typeof msg.text !== "string") return false;
  const partes = msg.text.trim().split(/\s+/);
  if (partes[0] !== "/kicar") return false;

  const quem = session.jogadoresConectados().find((j) => j.id === clientId);
  if (!quem) {
    falarCom(clientId, "Entre no mundo primeiro.");
    return true;
  }
  if (quem.papel !== "professor") {
    falarCom(clientId, "Somente o professor pode remover um aluno.");
    return true;
  }

  const alvoNome = partes.slice(1).join(" ").trim();
  if (!alvoNome) {
    falarCom(
      clientId,
      "Uso: /kicar nome — remove o aluno da aula. Ele pode entrar de novo com o PIN.",
    );
    return true;
  }

  // nomes podem repetir (nome#id): remove TODOS os conectados com esse nome,
  // menos o próprio professor que digitou o comando.
  const alvos = session
    .jogadoresConectados()
    .filter((j) => j.name.toLowerCase() === alvoNome.toLowerCase() && j.id !== clientId);
  if (alvos.length === 0) {
    falarCom(clientId, `Ninguém chamado "${alvoNome}" está conectado agora.`);
    return true;
  }

  for (const alvo of alvos) {
    const sock = sockets.get(alvo.id);
    entregar(
      alvo.id,
      JSON.stringify({ type: "kicked", reason: "Você foi removido da aula pelo professor." }),
    );
    // fecha DEPOIS de um instante: o aviso precisa sair antes do socket cair.
    if (sock) {
      setTimeout(() => {
        try {
          sock.close();
        } catch {
          /* socket já pode ter caído sozinho */
        }
      }, 150);
    }
  }
  for (const outroId of sockets.keys()) {
    falarCom(outroId, `${alvoNome} foi removido da aula pelo professor.`);
  }
  return true;
}

// HTTP e WebSocket na MESMA porta: o aluno abre http://ip-do-professor:8080 e
// joga — sem servidor de página separado e sem digitar endereço de WebSocket.
const http = createServer(servirCliente);
// perMessageDeflate (2026-07-19): o snapshot do mundo G tem 8 MB e comprime
// pra ~40 KB (terreno é MUITO repetitivo) — turma inteira entrando junto na
// LAN caía de 160 MB pra <1 MB. threshold poupa as mensagens pequenas (move/
// chat) do custo de CPU; o navegador negocia sozinho.
const wss = new WebSocketServer({
  server: http,
  perMessageDeflate: { threshold: 1024 },
});

wss.on("connection", (socket, req) => {
  const id = nextClientId++;
  sockets.set(id, socket);
  console.log(`[server] cliente ${id} conectou (${req.socket.remoteAddress ?? "?"})`);

  socket.on("message", (data, isBinary) => {
    // Protocolo cliente→servidor é 100% JSON; frame binário é lixo/ataque.
    if (isBinary) return;
    const texto = data.toString();
    if (interceptarMundo(id, texto)) return; // /mundo é do HOST (mexe em arquivo)
    if (interceptarKicar(id, texto)) return; // /kicar é do HOST (fecha socket)
    session.handleMessage(id, texto);
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

/** IP da máquina na rede da escola — é o endereço que o professor dita à turma. */
function enderecoDaRede(): string {
  for (const placas of Object.values(networkInterfaces())) {
    for (const p of placas ?? []) {
      if (p.family === "IPv4" && !p.internal) return p.address;
    }
  }
  return "localhost";
}

http.listen(PORT, () => {
  const onde = restore ? `mundo de ${CARREGAR_DE}` : `mundo novo, seed ${WORLD_SEED}`;
  console.log(`[server] no ar — ${onde}, tick alvo ${SERVER_TICK_RATE} tps`);
  console.log(`[server] os alunos abrem no navegador:  http://${enderecoDaRede()}:${PORT}`);
  if (!clienteFoiBuildado()) {
    console.warn(
      `[server] ATENÇÃO: o cliente não foi compilado — quem abrir esse endereço vê uma\n` +
        `         página de aviso, não o jogo. Rode uma vez:  npm run build`,
    );
  }
});
