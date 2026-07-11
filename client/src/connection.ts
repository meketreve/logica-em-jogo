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
      }
    };
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
