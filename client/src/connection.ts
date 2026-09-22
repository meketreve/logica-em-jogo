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

  /** Inicializa o hospedeiro: mundo do save (IndexedDB) OU novo com a seed,
   *  o preset (normal/plano/cabines), o tamanho (P/M/G) e o §🍖 F9
   *  `sobrevivencia` — todos só valem pra mundo novo. */
  init(opts: {
    save?: ArrayBuffer;
    seed?: number;
    preset?: string;
    tamanho?: string;
    sobrevivencia?: boolean;
  }): void {
    this.worker.postMessage({
      hostType: "init",
      save: opts.save,
      seed: opts.seed,
      preset: opts.preset,
      tamanho: opts.tamanho,
      sobrevivencia: opts.sobrevivencia,
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
  /** `onerror` e `onclose` disparam os dois no mesmo tombo — avisa UMA vez. */
  private avisouFalha = false;

  /** @param aoFalhar socket caiu/não abriu — quem chama decide o que fazer
   *  (§🕐: antes do mundo chegar vira mensagem na tela de carregamento). */
  constructor(url: string, private readonly aoFalhar?: (motivo: string) => void) {
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
        // bug-672: o `ping` do servidor é respondido AQUI, no transporte, e não
        // na camada de jogo. Duas razões: ele tem de valer desde o primeiro
        // instante (antes do mundo carregar, com o menu aberto, com um painel
        // na frente), e o que o servidor quer saber é exatamente isto — se
        // ainda há JavaScript rodando nesta página. Uma aba congelada pelo
        // tablet não passa por aqui, e é assim que o host sabe que ela foi
        // embora e libera o nome da criança.
        // o filtro barato vem primeiro (mensagem curta que MENCIONA ping);
        // só aí vale o custo de um JSON.parse, e o `type` é conferido de
        // verdade — depender da ORDEM das chaves do JSON seria um acoplamento
        // que quebraria calado no dia em que o servidor mudasse a mensagem.
        if (data.length < 80 && data.includes('"ping"') && this.responderPing(data)) return;
        this.cb?.(data);
      } else if (data instanceof ArrayBuffer) {
        this.stats.msgsIn++;
        this.stats.bytesIn += data.byteLength;
        this.cb?.(data);
      }
    };
    this.socket.onclose = (e: CloseEvent) => {
      console.warn(`[conn] conexão com ${url} fechou (código ${e.code})`);
      // 4000 é o código que o host usa pra "você não respondeu ao ping"
      // (bug-672): a criança que minimizou o tablet e voltou precisa ler o
      // motivo e saber o que fazer — "a conexão caiu" faria ela achar que o
      // Wi-Fi da escola tinha falhado.
      this.falhou(
        e.code === 4000
          ? "você ficou fora do jogo tempo demais — entre de novo"
          : "a conexão com o servidor caiu",
      );
    };
    // bug-672: FECHAR a página (ou o aparelho descartar a aba) avisa o host na
    // hora, em vez de deixar o socket meio-aberto até o heartbeat estourar —
    // o nome da criança fica livre imediatamente no caso mais comum da sala.
    // `pagehide` e não `beforeunload`: no tablet o `beforeunload` muitas vezes
    // não dispara. MINIMIZAR não entra aqui de propósito (é `visibilitychange`,
    // e quem dá uma olhada noutro app por 5 s não pode perder a aula) — esse
    // caso é justamente o que o heartbeat resolve.
    window.addEventListener("pagehide", () => {
      try {
        this.socket.close(4001, "página fechada");
      } catch {
        /* já estava fechado */
      }
    });
    this.socket.onerror = () => {
      this.falhou("não deu pra falar com o servidor");
    };
  }

  /** Era um `ping`? Então devolve o `pong` com o mesmo carimbo `t` e diz que
   *  sim — a mensagem não segue pra camada de jogo. */
  private responderPing(bruto: string): boolean {
    let m: { type?: unknown; t?: unknown };
    try {
      m = JSON.parse(bruto) as { type?: unknown; t?: unknown };
    } catch {
      return false; // não era JSON: segue o baile
    }
    if (m.type !== "ping") return false;
    this.send(JSON.stringify({ type: "pong", ...(typeof m.t === "number" ? { t: m.t } : {}) }));
    return true;
  }

  private falhou(motivo: string): void {
    if (this.avisouFalha) return;
    this.avisouFalha = true;
    this.aoFalhar?.(motivo);
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
