/// <reference lib="webworker" />
import {
  GameSession,
  SERVER_TICK_RATE,
  type SaveData,
  TAMANHO_CHUNKS,
  type WorldPreset,
  type WorldTamanho,
  decodeSave,
  encodeLazySave,
  encodeSave,
  parseWorldPreset,
  parseWorldTamanho,
} from "@logica/shared";

/**
 * Hospedeiro Web Worker do servidor (singleplayer): embrulha a GameSession
 * de /shared e fala com o cliente por postMessage — mesmas mensagens do
 * WebSocket. Este arquivo é SÓ transporte + agendamento do tick.
 *
 * Controle de HOST (cp8, fora do protocolo de jogo): o cliente manda
 * `{hostType:"init", save?, seed?}` UMA vez antes do join (mundo novo ou
 * carregado do IndexedDB) e `{hostType:"save_request"}` quando quer os bytes
 * .ljw de volta (`{hostType:"save", data}`) — quem GRAVA no IndexedDB é o
 * cliente (armazenamento do navegador é domínio dele; o worker só serializa).
 */

const CLIENT_ID = 0; // worker dedicado = exatamente 1 cliente

let session: GameSession | null = null;

function startSession(
  save: ArrayBuffer | undefined,
  seed: number,
  preset: WorldPreset,
  tamanho: WorldTamanho,
  sobrevivencia: boolean,
): void {
  let restore: SaveData | undefined;
  if (save) restore = decodeSave(save); // inválido = lança; cliente validou antes
  session = new GameSession(
    (_clientId, data) => {
      if (typeof data === "string") postMessage(data);
      else postMessage(data, { transfer: [data] });
    },
    // singleplayer: sem PIN, jogador é professor automático (cp9).
    // dims (tamanho P/M/G) só valem pra mundo NOVO — restore traz as próprias.
    {
      seed,
      restore,
      preset,
      // §🍖 F9: só vale pra mundo NOVO, como o preset e as dims
      sobrevivencia,
      dims: TAMANHO_CHUNKS[tamanho],
      singleplayer: true,
      now: () => performance.now(),
    },
  );
  setInterval(() => session?.tick(), 1000 / SERVER_TICK_RATE);
}

self.onmessage = (e: MessageEvent) => {
  const d: unknown = e.data;
  if (typeof d === "string") {
    session?.handleMessage(CLIENT_ID, d);
    return;
  }
  if (typeof d !== "object" || d === null) return;
  const msg = d as {
    hostType?: unknown;
    save?: unknown;
    seed?: unknown;
    flat?: unknown;
    preset?: unknown;
    tamanho?: unknown;
    sobrevivencia?: unknown;
  };
  if (msg.hostType === "init" && !session) {
    startSession(
      msg.save instanceof ArrayBuffer ? msg.save : undefined,
      typeof msg.seed === "number" ? msg.seed : 20260710,
      // preset (cp14) só vale pra mundo NOVO; flat=true = alias antigo de plano
      msg.flat === true ? "plano" : parseWorldPreset(msg.preset),
      parseWorldTamanho(msg.tamanho),
      // §🍖 F9: o menu manda o flag à parte do terreno
      msg.sobrevivencia === true,
    );
  } else if (msg.hostType === "save_request" && session) {
    // mundo ENORME (lazy): save ESPARSO (F3) — só os chunks editados (o mundo
    // inteiro seria GB). Denso vai inteiro como sempre.
    const data = session.isLazy
      ? encodeLazySave(session.world, session.toSave(), session.editedChunkIndices())
      : encodeSave(session.world, session.toSave());
    postMessage({ hostType: "save", data }, { transfer: [data] });
  }
};
