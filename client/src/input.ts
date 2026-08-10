/**
 * Teclado + mouse (pointer lock). SÓ coleta input — nenhuma decisão de
 * estado do mundo aqui (regra de arquitetura: cliente só desenha e envia input).
 */
export class Input {
  yaw = 0;
  pitch = 0;
  /** Multiplicador da sensibilidade do mouse (configurações do jogador). */
  sensitivity = 1;
  /** Modo toque (tablet): controles de toque sintetizam teclas/olhar/cliques. */
  touch = false;
  /**
   * APARELHO de toque — diferente do `touch` acima, que é o MODO e liga/desliga
   * durante a partida (o ☰ da barra o desliga pra fazer o menu de pausa
   * aparecer). Aqui não existe pointer lock NUNCA, e é isso que o `lock()` lê.
   *
   * Sem esta distinção, o ☰ virava uma armadilha: ele zera `touch`, o menu
   * aparece, e o `click` do mesmo toque atravessa o `#overlay`
   * (`pointer-events: none`) até o canvas, cujo handler chama `lock()` — que
   * sem o modo toque no caminho travava o ponteiro de verdade, escondia o menu
   * recém-aberto e deixava a barra de toque escondida (bug-572).
   * Setado uma vez no boot pelo main.ts.
   */
  touchDevice = false;

  private keys = new Set<string>();
  private keyHandlers = new Map<string, () => void>();
  private mouseHandlers = new Map<number, () => void>();
  private wheelHandler: ((dir: 1 | -1) => void) | null = null;

  private static readonly SENSITIVITY = 0.0025;
  /** Sensibilidade do arrasto de olhar no toque (px de dedo → radianos). */
  private static readonly TOUCH_LOOK = 0.004;
  private static readonly PITCH_LIMIT = Math.PI / 2 - 0.01;
  /** Chrome com pointer lock solta deltas absurdos esporádicos (câmera "teleporta") — descarta. */
  private static readonly MAX_DELTA = 200;

  /** Diagnóstico dos eventos de mouse (mostrado no HUD F3). */
  readonly mouseStats = { maxDelta: 0, dropped: 0, lastDropped: 0 };

  constructor(private canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", (e) => {
      // digitando num campo de texto (chat): tecla é do campo, não do jogo
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const handler = this.keyHandlers.get(e.code);
      if (handler) {
        e.preventDefault();
        handler();
        return;
      }
      this.keys.add(e.code);
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    window.addEventListener("blur", () => this.keys.clear());

    // bug-582: o menu do NAVEGADOR no botão direito. Era prevenido só no
    // canvas, e isso cobria exatamente o caso em que ele não incomodava (com o
    // ponteiro travado o navegador nem o abre). O caso real é o oposto: abrir
    // um baú SOLTA o ponteiro, o cursor reaparece no meio da tela — em cima do
    // painel — e o `contextmenu` daquele mesmo clique direito cai no `#container`,
    // não no canvas. O aluno vê "voltar / recarregar / salvar como" por cima do
    // baú. Vale pra qualquer painel: no jogo, botão direito é COLOCAR bloco.
    // Campo de texto fica de fora (o chat precisa de copiar/colar do sistema).
    document.addEventListener("contextmenu", (e) => {
      const alvo = e.target;
      if (alvo instanceof HTMLInputElement || alvo instanceof HTMLTextAreaElement) return;
      e.preventDefault();
    });
    canvas.addEventListener("mousedown", (e) => {
      if (!this.locked) return; // primeiro clique só trava o mouse
      if (e.button === 1) e.preventDefault(); // botão do meio: sem autoscroll
      this.mouseHandlers.get(e.button)?.();
    });

    canvas.addEventListener(
      "wheel",
      (e) => {
        if (!this.locked) return;
        e.preventDefault();
        this.wheelHandler?.(e.deltaY > 0 ? 1 : -1);
      },
      { passive: false },
    );

    canvas.addEventListener("click", () => this.lock());

    // bug-585: o pedido recusado era SILENCIOSO — sem este listener, o clique
    // do aluno dentro da carência do Esc não deixava rastro nenhum.
    document.addEventListener("pointerlockerror", () => {
      this.reagendarLock();
      // sem tentativa no ar, o pedido ACABOU: quem desenha o overlay precisa
      // saber, senão o menu de pausa nunca mais apareceria (bug-597)
      this.pedindo = this.reagendado !== null;
    });
    // o lock chegou por outro caminho: cancela a tentativa atrasada
    document.addEventListener("pointerlockchange", () => {
      if (!this.locked) return;
      this.pedindo = false;
      this.retryGasto = false; // o ciclo fechou: a próxima recusa merece retry
      if (this.reagendado !== null) {
        clearTimeout(this.reagendado);
        this.reagendado = null;
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (!this.locked) return;
      const mag = Math.max(Math.abs(e.movementX), Math.abs(e.movementY));
      if (mag > this.mouseStats.maxDelta) this.mouseStats.maxDelta = mag;
      if (mag > Input.MAX_DELTA) {
        this.mouseStats.dropped++;
        this.mouseStats.lastDropped = mag;
        console.warn(`[input] spike de mouse descartado: ${e.movementX},${e.movementY}`);
        return;
      }
      this.yaw -= e.movementX * Input.SENSITIVITY * this.sensitivity;
      this.pitch -= e.movementY * Input.SENSITIVITY * this.sensitivity;
      const lim = Input.PITCH_LIMIT;
      if (this.pitch > lim) this.pitch = lim;
      if (this.pitch < -lim) this.pitch = -lim;
    });
  }

  get locked(): boolean {
    return document.pointerLockElement === this.canvas;
  }

  /** Jogo "tem o controle": mouse travado (desktop) OU modo toque (tablet). */
  get active(): boolean {
    return this.locked || this.touch;
  }

  /**
   * Pede pointer lock (clique no canvas ou ao fechar o chat). Pode falhar sem
   * gesto do usuário — aí o overlay "clique para jogar" cobre.
   *
   * ⚠️ **A carência do Esc (bug-585).** Quando o próprio usuário sai do lock
   * com Esc, o Chrome RECUSA um novo `requestPointerLock` por ~1,25 s — é uma
   * defesa do navegador contra a página que reprende o ponteiro na hora. O
   * retry que existia aqui era IMEDIATO, então caía dentro da mesma carência e
   * falhava junto: o aluno clicava em "voltar ao jogo", não acontecia nada,
   * clicava de novo, nada — e concluía que o jogo travou.
   *
   * Agora a segunda tentativa espera a carência passar. `pendente` impede que
   * cinco cliques nervosos virem cinco pedidos empilhados, e qualquer um deles
   * é cancelado se o lock chegar por outro caminho.
   */
  lock(): void {
    // `touchDevice` antes de `touch`: no tablet o modo desliga (menu de pausa),
    // mas o aparelho continua sendo de dedo — pointer lock ali nunca serve.
    if (this.touchDevice || this.touch || this.locked) return;
    // pedido NOVO (clique, fechar painel, fechar chat): a tentativa atrasada
    // volta a valer — é o "o próximo clique do aluno tenta outra vez".
    this.retryGasto = false;
    this.pedirLock();
  }

  /**
   * O jogo está RETOMANDO o controle? (pedido de pointer lock em andamento, ou
   * tentativa atrasada no ar.)
   *
   * Quem desenha o menu de pausa lê isto. Sem ele, fechar um painel com Esc
   * pisca o menu de pausa pelo tempo inteiro da carência do Chrome: o Esc do
   * painel É o Esc do usuário, o `lock()` que vem logo atrás cai dentro da
   * carência e falha, e "sem ponteiro travado" é indistinguível de "o aluno
   * pediu pausa" pra quem só olha o `locked` (bug-597).
   */
  get retomando(): boolean {
    return this.pedindo;
  }

  /** Carência do Chrome depois de um Esc do usuário (~1,25 s) + folga. */
  private static readonly CARENCIA_ESC_MS = 1400;
  private reagendado: ReturnType<typeof setTimeout> | null = null;
  /** A tentativa atrasada já foi gasta neste ciclo? Sem isto o `reagendarLock`
   *  se reagenda pra sempre a cada recusa — o comentário abaixo prometia "só
   *  uma" e o código não cumpria. */
  private retryGasto = false;
  private pedindo = false;

  /**
   * Dá pra travar o ponteiro AGORA? (bug-613, 2026-08-10.)
   *
   * O `Input` não conhece painel nem chat, então quem sabe disso injeta a
   * pergunta — o `main.ts` responde `!paineis.algumAberto`. Sem ela, a tentativa
   * ATRASADA do `reagendarLock` (1,4 s depois de uma recusa) dispara sem olhar a
   * tela e prende o ponteiro POR CIMA de um painel que o aluno abriu no meio do
   * caminho: Esc → "voltar ao jogo" recusado dentro da carência → o aluno abre a
   * mochila → 1,4 s depois o ponteiro trava e ele não clica em mais nada. É o
   * mesmo sintoma do bug-610 por outra porta, e o guarda daquele conserto está
   * no callback do chat (`main.ts`), que este caminho não passa.
   */
  podeTravar: () => boolean = () => true;

  private pedirLock(): void {
    if (!this.podeTravar()) {
      this.pedindo = false; // desistiu: não há tentativa no ar pra desenhar
      return;
    }
    this.pedindo = true;
    // unadjustedMovement: movimento cru, sem aceleração do SO (menos spikes no Chrome/Windows)
    const req = this.canvas.requestPointerLock({ unadjustedMovement: true }) as
      | Promise<void>
      | undefined;
    // navegador sem a opção: tenta a forma antiga NA HORA (não é carência, é
    // assinatura recusada — esperar aqui só atrasaria o jogo)
    req?.catch(() => {
      try {
        // a forma antiga TAMBÉM devolve Promise no Chrome atual: sem este
        // `catch` a recusa vira "unhandled rejection" e o console do aluno (e o
        // dos scripts de print, que exigem console limpo) ganha um
        // `NotAllowedError` que não é bug nenhum — o `pointerlockerror` abaixo
        // já é quem trata o caso.
        const antigo = this.canvas.requestPointerLock() as Promise<void> | undefined;
        antigo?.catch(() => {
          /* tratado pelo `pointerlockerror` */
        });
      } catch {
        /* o `pointerlockerror` abaixo cuida do reagendamento */
      }
    });
  }

  /** Uma tentativa atrasada, e só uma: se falhar de novo o overlay continua na
   *  tela e o próximo clique do aluno tenta outra vez. */
  private reagendarLock(): void {
    if (this.reagendado !== null || this.retryGasto) return;
    if (this.locked || this.touchDevice || this.touch) return;
    this.retryGasto = true;
    this.reagendado = setTimeout(() => {
      this.reagendado = null;
      if (!this.locked && !this.touchDevice && !this.touch) this.pedirLock();
    }, Input.CARENCIA_ESC_MS);
  }

  down(code: string): boolean {
    return this.keys.has(code);
  }

  /** Toque: joystick liga/desliga a MESMA tecla que o teclado ligaria. */
  setKey(code: string, down: boolean): void {
    if (down) this.keys.add(code);
    else this.keys.delete(code);
  }

  /** Toque: arrasto de olhar — mesma conta (e mesmo clamp) do mousemove. */
  applyLook(dx: number, dy: number): void {
    this.yaw -= dx * Input.TOUCH_LOOK * this.sensitivity;
    this.pitch -= dy * Input.TOUCH_LOOK * this.sensitivity;
    const lim = Input.PITCH_LIMIT;
    if (this.pitch > lim) this.pitch = lim;
    if (this.pitch < -lim) this.pitch = -lim;
  }

  /** Toque: botão da tela dispara o MESMO handler do botão do mouse. */
  press(button: number): void {
    this.mouseHandlers.get(button)?.();
  }

  /** Registra atalho (ex.: F3 → HUD). preventDefault automático. */
  onKey(code: string, fn: () => void): void {
    this.keyHandlers.set(code, fn);
  }

  /** Move um atalho pra tecla nova (rebind AO VIVO no menu de pausa). */
  rebind(oldCode: string, newCode: string): void {
    if (oldCode === newCode) return;
    const fn = this.keyHandlers.get(oldCode);
    if (!fn) return;
    this.keyHandlers.delete(oldCode);
    this.keyHandlers.set(newCode, fn);
  }

  /** Botão do mouse com pointer lock ativo (0 = esquerdo, 2 = direito). */
  onMouseButton(button: number, fn: () => void): void {
    this.mouseHandlers.set(button, fn);
  }

  /** Roda do mouse com pointer lock ativo (1 = baixo/próximo, -1 = cima/anterior). */
  onWheel(fn: (dir: 1 | -1) => void): void {
    this.wheelHandler = fn;
  }
}
