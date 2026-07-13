/**
 * Conexão do cliente com O SERVIDOR — interface única, hospedeiro invisível.
 * Checkpoint 2: Web Worker. Checkpoint 5: WebSocket (mesma interface, o
 * resto do cliente não muda). Conta msgs/bytes nos dois sentidos pro HUD F3.
 */

export interface NetStats {
  msgsIn: number;
  msgsOut: number;
  bytesIn: number;
  bytesOut: number;
}

export interface Connection {
  send(data: string): void;
  onMessage(cb: (data: string | ArrayBuffer) => void): void;
  readonly stats: NetStats;
}

export class WorkerConnection implements Connection {
  readonly stats: NetStats = { msgsIn: 0, msgsOut: 0, bytesIn: 0, bytesOut: 0 };
  private cb: ((data: string | ArrayBuffer) => void) | null = null;
  /** Resolve do save_request pendente (1 por vez basta — autosave é serial). */
  private savePending: ((data: ArrayBuffer) => void) | null = null;

  constructor(private worker: Worker) {
    worker.onmessage = (e: MessageEvent) => {
      const data: unknown = e.data;
      if (typeof data === "string") {
        this.stats.msgsIn++;
        this.stats.bytesIn += data.length;
        this.cb?.(data);
      } else if (data instanceof ArrayBuffer) {
        this.stats.msgsIn++;
        this.stats.bytesIn += data.byteLength;
        this.cb?.(data);
      } else if (typeof data === "object" && data !== null) {
        // canal de HOST (cp8): controle do hospedeiro, fora do protocolo de jogo
        const msg = data as { hostType?: unknown; data?: unknown };
        if (msg.hostType === "save" && msg.data instanceof ArrayBuffer) {
          this.savePending?.(msg.data);
          this.savePending = null;
        }
      }
    };
  }

  /** Inicializa o hospedeiro: mundo do save (IndexedDB) OU novo com a seed
   *  (flat = preset "plano" do cp12, só vale pra mundo novo). */
  init(opts: { save?: ArrayBuffer; seed?: number; flat?: boolean }): void {
    this.worker.postMessage({
      hostType: "init",
      save: opts.save,
      seed: opts.seed,
      flat: opts.flat === true,
    });
  }

  /** Pede os bytes .ljw do mundo atual (quem grava no IndexedDB é o cliente). */
  requestSave(): Promise<ArrayBuffer> {
    return new Promise((resolve) => {
      this.savePending = resolve;
      this.worker.postMessage({ hostType: "save_request" });
    });
  }

  send(data: string): void {
    this.stats.msgsOut++;
    this.stats.bytesOut += data.length;
    this.worker.postMessage(data);
  }

  onMessage(cb: (data: string | ArrayBuffer) => void): void {
    this.cb = cb;
  }
}

/** Hospedeiro remoto (Node+ws, LAN). Mesma interface — o resto do cliente não sabe. */
export class WsConnection implements Connection {
  readonly stats: NetStats = { msgsIn: 0, msgsOut: 0, bytesIn: 0, bytesOut: 0 };
  private cb: ((data: string | ArrayBuffer) => void) | null = null;
  private readonly socket: WebSocket;
  /** send() antes do open lançaria — fila segura o join até conectar. */
  private queue: string[] = [];

  constructor(url: string) {
    this.socket = new WebSocket(url);
    this.socket.binaryType = "arraybuffer"; // world_snapshot chega como ArrayBuffer
    this.socket.onopen = () => {
      for (const msg of this.queue) this.socket.send(msg);
      this.queue = [];
    };
    this.socket.onmessage = (e: MessageEvent) => {
      const data: unknown = e.data;
      if (typeof data === "string") {
        this.stats.msgsIn++;
        this.stats.bytesIn += data.length;
        this.cb?.(data);
      } else if (data instanceof ArrayBuffer) {
        this.stats.msgsIn++;
        this.stats.bytesIn += data.byteLength;
        this.cb?.(data);
      }
    };
    this.socket.onclose = () => {
      console.warn(`[conn] conexão com ${url} fechou`);
    };
  }

  send(data: string): void {
    this.stats.msgsOut++;
    this.stats.bytesOut += data.length;
    if (this.socket.readyState === WebSocket.OPEN) this.socket.send(data);
    else if (this.socket.readyState === WebSocket.CONNECTING) this.queue.push(data);
    // CLOSING/CLOSED: descarta — servidor caiu, não há pra quem mandar.
  }

  onMessage(cb: (data: string | ArrayBuffer) => void): void {
    this.cb = cb;
  }
}
