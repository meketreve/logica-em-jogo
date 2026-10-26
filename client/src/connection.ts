/**
 * Conexão do cliente com O SERVIDOR — interface única, hospedeiro invisível.
 * Checkpoint 2: Web Worker. Checkpoint 5: WebSocket (mesma interface, o
 * resto do cliente não muda). Conta msgs/bytes nos dois sentidos pro HUD F3.
 */

import type { RelatoQueda } from "@logica/shared";

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

/** §📱 bug-675: o que a PÁGINA viu quando o socket morreu (o `como` é de quem volta). */
export type QuedaVista = Omit<RelatoQueda, "como">;

/** Hospedeiro remoto (Node+ws, LAN). Mesma interface — o resto do cliente não sabe. */
export class WsConnection implements Connection {
  readonly stats: NetStats = { msgsIn: 0, msgsOut: 0, bytesIn: 0, bytesOut: 0 };
  private cb: ((data: string | ArrayBuffer) => void) | null = null;
  /** Troca a cada `reabrir()` — a conexão (stats, cb, fila) é a mesma pro resto do cliente. */
  private socket!: WebSocket;
  /** send() antes do open lançaria — fila segura o join até conectar. */
  private queue: string[] = [];
  /** `onerror` e `onclose` disparam os dois no mesmo tombo — avisa UMA vez. */
  private avisouFalha = false;
  /** Chegou a abrir? Sem isto, "IP errado" e "caiu no meio" dariam a mesma frase. */
  private abriu = false;
  /** Prazo pra uma REabertura ter RESPOSTA (ver `reabrir`). */
  private prazoResposta: number | undefined;

  // §📱 bug-675 — o relógio da tela. No Android, Home e tela bloqueada matam o
  // socket NA HORA (o host vê 1006, igual a Wi-Fi caindo); só daqui dá pra
  // saber se a página estava à vista quando ele morreu.
  private ultimaMensagemEm = performance.now();
  private escondidaDesde: number | null = document.hidden ? performance.now() : null;
  private voltouAVistaEm = -Infinity;
  private escondidaPor = 0;

  /** @param aoFalhar socket caiu/não abriu — quem chama decide o que fazer
   *  (§🕐: antes do mundo chegar vira mensagem na tela de carregamento; em jogo,
   *  §📱 tenta voltar sozinho). `queda` diz como foi; `reconectavel` = morreu
   *  sem ninguém ter decidido (1006) ou pelo heartbeat (4000) — o servidor que
   *  EXPULSOU ou trocou de dono fecha com outro código, e voltar sozinho ali
   *  seria brigar com o professor (ou com o outro aparelho, pra sempre). */
  constructor(
    private readonly url: string,
    private readonly aoFalhar?: (motivo: string, queda: QuedaVista, reconectavel: boolean) => void,
  ) {
    this.abrir();
    document.addEventListener("visibilitychange", () => {
      const agora = performance.now();
      if (document.hidden) {
        this.escondidaDesde = agora;
      } else if (this.escondidaDesde !== null) {
        this.escondidaPor = agora - this.escondidaDesde;
        this.voltouAVistaEm = agora;
        this.escondidaDesde = null;
      }
    });
    // bug-672: FECHAR a página (ou o aparelho descartar a aba) avisa o host na
    // hora, em vez de deixar o socket meio-aberto até o heartbeat estourar —
    // o nome da criança fica livre imediatamente no caso mais comum da sala.
    // `pagehide` e não `beforeunload`: no tablet o `beforeunload` muitas vezes
    // não dispara. MINIMIZAR não entra aqui de propósito (é `visibilitychange`,
    // e quem dá uma olhada noutro app por 5 s não pode perder a aula) — esse
    // caso é justamente o que o heartbeat resolve. Lê `this.socket` na hora:
    // depois de uma reconexão o socket é outro.
    window.addEventListener("pagehide", () => {
      try {
        this.socket.close(4001, "página fechada");
      } catch {
        /* já estava fechado */
      }
    });
  }

  /**
   * §📱 bug-675 — abre um socket NOVO pro mesmo servidor, depois de uma queda.
   * Quem chama manda o `join` em seguida (fica na fila até abrir). Tem prazo,
   * e ele vale até a 1ª RESPOSTA do jogo, não só até abrir: o Wi-Fi que não
   * volta deixaria o socket em CONNECTING pelo tempo que o navegador quisesse,
   * e um socket que abre mas cujo join se perdeu ficaria aberto e mudo — nos
   * dois casos a criança olhando "voltando ao jogo" sem fim. Fechar aqui faz
   * o `onclose` chegar, e quem chama decide a próxima tentativa.
   */
  reabrir(prazoMs: number): void {
    this.queue = [];
    this.avisouFalha = false;
    this.abriu = false;
    this.abrir();
    const sock = this.socket;
    window.clearTimeout(this.prazoResposta);
    this.prazoResposta = window.setTimeout(() => {
      if (sock === this.socket && sock.readyState !== WebSocket.CLOSED) {
        sock.close(4002, "sem resposta na volta");
      }
    }, prazoMs);
  }

  private abrir(): void {
    const socket = new WebSocket(this.url);
    this.socket = socket;
    socket.binaryType = "arraybuffer"; // world_snapshot chega como ArrayBuffer
    socket.onopen = () => {
      this.abriu = true;
      this.ultimaMensagemEm = performance.now();
      for (const msg of this.queue) socket.send(msg);
      this.queue = [];
    };
    socket.onmessage = (e: MessageEvent) => {
      this.ultimaMensagemEm = performance.now();
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
        window.clearTimeout(this.prazoResposta); // o JOGO respondeu (ping não conta)
        this.cb?.(data);
      } else if (data instanceof ArrayBuffer) {
        window.clearTimeout(this.prazoResposta);
        this.stats.msgsIn++;
        this.stats.bytesIn += data.byteLength;
        this.cb?.(data);
      }
    };
    socket.onclose = (e: CloseEvent) => {
      // socket de uma tentativa ANTERIOR fechando atrasado: não é notícia
      if (socket !== this.socket) return;
      console.warn(`[conn] conexão com ${this.url} fechou (código ${e.code})`);
      // 4001 somos NÓS fechando no `pagehide` (a página já está indo embora).
      // Tratar isso como queda faria o tratador tentar navegar durante o
      // descarregamento — e, na volta do bfcache, mandar a criança pro menu
      // sem nada ter acontecido.
      if (e.code === 4001) return;
      // 4000 é o código que o host usa pra "você não respondeu ao ping"
      // (bug-672): a criança que minimizou o tablet e voltou precisa ler o
      // motivo e saber o que fazer — "a conexão caiu" faria ela achar que o
      // Wi-Fi da escola tinha falhado.
      this.falhou(
        !this.abriu
          ? "não deu pra falar com o servidor"
          : e.code === 4000
            ? "você ficou fora do jogo tempo demais — entre de novo"
            : "a conexão com o servidor caiu",
        this.comoCaiu(e.code),
        e.code === 1006 || e.code === 4000,
      );
    };
    // O `onerror` vem sempre seguido do `onclose` (é a ordem da especificação),
    // e é o `onclose` que sabe o CÓDIGO — avisar daqui gastaria o aviso único
    // com uma queda sem código nenhum.
    socket.onerror = () => {};
  }

  /**
   * A tela estava escondida quando o socket morreu? Duas formas de ser "sim":
   * escondida AGORA, ou acabou de voltar à vista — o Android congela a página
   * em segundo plano, e o `close` de um socket que morreu lá só é ENTREGUE
   * quando ela descongela, no mesmo instante em que a criança volta. 3 s
   * cobrem esse atraso sem confundir com uma queda de verdade logo depois.
   */
  private comoCaiu(codigo: number): QuedaVista {
    const agora = performance.now();
    const escondidaMs =
      this.escondidaDesde !== null
        ? agora - this.escondidaDesde
        : agora - this.voltouAVistaEm < 3000
          ? this.escondidaPor
          : null;
    return {
      codigo,
      escondidaMs: escondidaMs === null ? null : Math.round(escondidaMs),
      semNoticiaMs: Math.round(agora - this.ultimaMensagemEm),
      online: navigator.onLine,
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

  private falhou(motivo: string, queda: QuedaVista, reconectavel: boolean): void {
    if (this.avisouFalha) return;
    this.avisouFalha = true;
    this.aoFalhar?.(motivo, queda, reconectavel);
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
