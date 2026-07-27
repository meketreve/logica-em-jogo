/**
 * Tela de carregamento (§🕐) — o que o jogador vê entre "apertei jogar" e "o
 * mundo aparece". Antes disso era canvas preto com o menu de pausa por baixo:
 * em mundo ENORME (streaming F2) o aluno não sabia se estava carregando ou
 * travado.
 *
 * DOM e CSS próprios, injetados aqui (self-contained, padrão do `touch.ts`) —
 * o `index.html` não sabe que esta tela existe.
 *
 * **Duas animações de propósito desacopladas:**
 * 1. giro no canto = decorativo PURO (CSS `@keyframes`). Não depende de
 *    progresso: se ele gira e o número não anda, o problema é o hospedeiro,
 *    não o navegador travado. É o sinal de vida.
 * 2. anel no centro = progresso REAL (colunas prontas ÷ total do raio). Nunca
 *    volta atrás nem passa de 100% — só clampa (o total pode ser reestimado).
 *
 * Zero protocolo novo: tudo sai de contadores que o cliente já tem
 * (`conn.stats` do HUD F3 + `colunasCarregadas`/`colunasFaltando` da varredura
 * 1×/s do §🔁). Esta tela só AMOSTRA e mostra.
 */

/**
 * Fase corrente — rótulo honesto, muda conforme o gargalo real.
 * `preparando` só existe na troca de aula: o host avisou que vai trocar e
 * ainda está salvando/gerando, então não há NADA a medir do lado do cliente.
 */
export type FaseCarga = "conectando" | "preparando" | "mundo" | "malha" | "pronto";

export interface CargaInfo {
  /** Rótulo do hospedeiro (`ws://ip:porta` ou `web-worker (nome)`). */
  host: string;
  /** true = servidor remoto; false = worker na própria aba (singleplayer). */
  rede: boolean;
  /** Título da caixa. Padrão "carregando o mundo"; a troca de aula (cp19) usa
   *  outro, porque o aluno estava JOGANDO um segundo atrás. */
  titulo?: string;
  /** Nome da aula que está entrando (troca de aula) — aparece na fase. */
  alvo?: string;
}

/** Leitura instantânea dos contadores que o jogo já mantém. */
export interface CargaStats {
  /** Bytes acumulados na conexão (entrada + saída) — vira bits/s aqui. */
  bytes: number;
  /** Colunas aplicadas (chegaram e entraram no mundo). */
  prontas: number;
  /** Total esperado do raio inicial (0 = ainda não dá pra saber). */
  total: number;
  /** Colunas do raio que ainda não chegaram (§🔁 — "em transferência"). */
  faltando: number;
  /** Fila do mesher, em CHUNKS (cada coluna vira `dims.y` chunks). */
  fila: number;
}

/**
 * Quanto o jogador ESPEROU, quebrado por fase (§📊 item 3 do backlog do
 * perfilador). A tela já mede tudo isso pra pintar; aqui vira número exportável:
 * "quanto o aluno espera" em cada máquina do laboratório. Uma entrada por carga
 * — o join e cada troca de aula geram a sua.
 */
export interface CargaRelatorio {
  titulo: string;
  /** Do `abrir()` ao `fechar()`. */
  totalMs: number;
  /** Tempo em cada fase (só as que aconteceram). "malha" entra quando as
   *  colunas acabaram e o mesher ainda tinha fila. */
  fasesMs: Partial<Record<FaseCarga, number>>;
  /** Estado no fim: colunas aplicadas e bytes da conexão (0 = sem streaming). */
  colunas: number;
  bytes: number;
  /** true = a carga terminou sozinha; false = erro ou "entrar mesmo assim". */
  concluida: boolean;
}

/** Segundos sem terminar até oferecer a saída manual (nunca prender o aluno). */
const ESPERA_BOTAO_MS = 20_000;
/** Raio do anel de progresso (o `viewBox` do SVG acompanha). */
const R_ANEL = 54;
const CIRC = 2 * Math.PI * R_ANEL;

const CSS = `
#load-tela {
  position: fixed; inset: 0; z-index: 35;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(180deg, #24344d 0%, #101826 100%);
  color: #fff; font-family: system-ui, sans-serif;
}
#load-caixa {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  width: min(420px, 92vw); padding: 24px 28px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 10px;
}
#load-caixa h1 { margin: 0; font-size: 1.4rem; font-weight: 600; }
#load-fase { color: #9fe8bc; font-size: 0.95rem; min-height: 1.2em; }
#load-anel { position: relative; width: 132px; height: 132px; }
/* -90° = o arco começa no topo, como todo mundo espera */
#load-anel svg { transform: rotate(-90deg); }
#load-arco { transition: stroke-dashoffset 0.25s linear; }
/* sem total conhecido (esperando o snapshot denso, que vem num blob só) não há
   fração a mostrar: o anel VIRA indeterminado em vez de mentir 0% parado */
#load-anel.indef svg { animation: load-anel 1.4s linear infinite; }
#load-anel.indef #load-arco { transition: none; }
@keyframes load-anel { from { transform: rotate(-90deg); } to { transform: rotate(270deg); } }
#load-pct {
  position: absolute; inset: 0; display: flex;
  align-items: center; justify-content: center;
  font-size: 1.7rem; font-variant-numeric: tabular-nums;
}
#load-linhas {
  width: 100%; margin: 0; display: grid;
  grid-template-columns: auto 1fr; gap: 2px 12px; font-size: 0.8rem;
}
#load-linhas dt { color: rgba(255, 255, 255, 0.6); }
#load-linhas dd { margin: 0; text-align: right; font-variant-numeric: tabular-nums; }
#load-forcar {
  margin-top: 4px; padding: 7px 14px; border: 0; border-radius: 8px;
  background: #ffd75e; color: #182338; font: inherit; font-size: 0.85rem; cursor: pointer;
}
/* decorativo: gira SEMPRE, independente de progresso (sinal de vida) */
#load-giro {
  position: fixed; right: 20px; bottom: 20px;
  width: 26px; height: 26px; border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.18); border-top-color: #ffd75e;
  animation: load-giro 0.9s linear infinite;
}
@keyframes load-giro { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { #load-giro { animation-duration: 3.5s; } }
`;

/** bits/s legível: o pedido é em BITS (rede se mede assim), não em bytes. */
function fmtBits(bps: number): string {
  if (!Number.isFinite(bps) || bps <= 0) return "—";
  if (bps >= 1e6) return `${(bps / 1e6).toFixed(1)} Mbps`;
  if (bps >= 1e3) return `${(bps / 1e3).toFixed(0)} kbps`;
  return `${bps.toFixed(0)} bps`;
}

function fmtBytes(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)} kB`;
  return `${n} B`;
}

function fmtSeg(ms: number): string {
  return `${(ms / 1000).toFixed(1)} s`;
}

export class LoadingScreen {
  private raiz: HTMLDivElement | null = null;
  private estilo: HTMLStyleElement | null = null;
  private timer = 0;
  private fimTimer = 0;
  private t0 = 0;
  private fase: FaseCarga = "conectando";
  private rede = true;
  private alvo: string | undefined;
  /** Fonte dos contadores — trocada quando o jogo passa a ter mundo. */
  private ler: (() => CargaStats) | null = null;
  // amostragem 1×/s (mesma cadência do HUD F3)
  private amostraT = 0;
  private amostraBytes = 0;
  private amostraProntas = 0;
  private bps = 0;
  private colsPorSeg = 0;
  private primeiraAmostra = true;
  /** Progresso já mostrado: o anel NUNCA anda pra trás. */
  private pctMax = 0;
  /** O que o botão da caixa faz — "entrar mesmo assim" por padrão, "voltar ao
   *  menu" depois de `erro()`. */
  private acaoBotao: () => void = () => this.fechar();
  // --- medição de tempo por fase (vai pro perfil; ver CargaRelatorio) ---
  private tempos: Partial<Record<FaseCarga, number>> = {};
  private faseMedida: FaseCarga = "conectando";
  private faseT0 = 0;
  private titulo = "carregando o mundo";
  private concluiu = false;
  /** Uma entrada por carga (join + cada troca de aula) desta sessão. */
  private cargas: CargaRelatorio[] = [];
  private els: {
    fase: HTMLElement;
    anel: HTMLElement;
    arco: SVGCircleElement;
    pct: HTMLElement;
    valores: Record<string, HTMLElement>;
    forcar: HTMLButtonElement;
  } | null = null;

  /** @param aoFechar chamado no fim de `fechar()` (main.ts reavalia o overlay). */
  constructor(private readonly aoFechar: () => void) {}

  get ativo(): boolean {
    return this.raiz !== null;
  }

  abrir(info: CargaInfo): void {
    if (this.raiz) return;
    this.rede = info.rede;
    this.alvo = info.alvo;
    this.fase = "conectando";
    this.pctMax = 0;
    this.bps = 0;
    this.colsPorSeg = 0;
    this.t0 = this.amostraT = this.faseT0 = performance.now();
    this.amostraBytes = 0;
    this.amostraProntas = 0;
    this.tempos = {};
    this.faseMedida = "conectando";
    this.concluiu = false;
    this.titulo = info.titulo ?? "carregando o mundo";
    // reabertura (troca de aula): `bytes` já vem grande da sessão inteira — a
    // 1ª amostra só CALIBRA, senão a taxa sairia como se tudo tivesse chegado
    // naquele segundo
    this.primeiraAmostra = true;

    this.estilo = document.createElement("style");
    this.estilo.textContent = CSS;
    document.head.appendChild(this.estilo);

    this.raiz = document.createElement("div");
    this.raiz.id = "load-tela";
    this.raiz.innerHTML = `
      <div id="load-caixa">
        <h1></h1>
        <div id="load-anel">
          <svg width="132" height="132" viewBox="0 0 132 132" aria-hidden="true">
            <circle cx="66" cy="66" r="${R_ANEL}" fill="none"
              stroke="rgba(255,255,255,0.12)" stroke-width="9" />
            <circle id="load-arco" cx="66" cy="66" r="${R_ANEL}" fill="none"
              stroke="#ffd75e" stroke-width="9" stroke-linecap="round"
              stroke-dasharray="${CIRC.toFixed(1)}" stroke-dashoffset="${CIRC.toFixed(1)}" />
          </svg>
          <div id="load-pct">0%</div>
        </div>
        <div id="load-fase"></div>
        <dl id="load-linhas"></dl>
        <button id="load-forcar" type="button" class="hidden">entrar mesmo assim</button>
      </div>
      <div id="load-giro"></div>`;
    document.body.appendChild(this.raiz);
    // textContent (nunca innerHTML) — o título pode vir de nome de mundo
    (this.raiz.querySelector("h1") as HTMLElement).textContent =
      info.titulo ?? "carregando o mundo";

    const linhas = this.raiz.querySelector("#load-linhas") as HTMLElement;
    const valores: Record<string, HTMLElement> = {};
    const rotulos: [string, string][] = [
      ["colunas", "colunas prontas"],
      ["transf", "em transferência"],
      ["fila", "chunks na fila de malha"],
      ["taxa", info.rede ? "taxa de rede" : "taxa do worker"],
      ["recebido", "recebido"],
      ["tempo", "tempo"],
      ["host", "hospedeiro"],
    ];
    for (const [chave, rotulo] of rotulos) {
      const dt = document.createElement("dt");
      dt.textContent = rotulo;
      const dd = document.createElement("dd");
      dd.textContent = "—";
      linhas.append(dt, dd);
      valores[chave] = dd;
    }
    valores["host"]!.textContent = info.host;

    const forcar = this.raiz.querySelector("#load-forcar") as HTMLButtonElement;
    this.acaoBotao = () => this.fechar();
    forcar.addEventListener("click", () => this.acaoBotao());
    this.els = {
      fase: this.raiz.querySelector("#load-fase") as HTMLElement,
      anel: this.raiz.querySelector("#load-anel") as HTMLElement,
      arco: this.raiz.querySelector("#load-arco") as unknown as SVGCircleElement,
      pct: this.raiz.querySelector("#load-pct") as HTMLElement,
      valores,
      forcar,
    };
    this.pintar();
    // 4×/s: o tempo/anel andam suave, mas a TAXA só é reamostrada a cada 1 s
    this.timer = window.setInterval(() => this.pintar(), 250);
  }

  /** Fonte dos contadores; só existe depois que o mundo chegou (startGame). */
  observar(ler: () => CargaStats): void {
    this.ler = ler;
  }

  setFase(f: FaseCarga): void {
    if (!this.raiz || this.fase === f) return; // chamada por MENSAGEM: barata
    this.fase = f;
    this.pintar(); // o `pintar` é quem contabiliza (a fase efetiva pode ser outra)
  }

  /** Fecha o tempo da fase medida e começa a contar a próxima. A fase MEDIDA é
   *  a efetiva (a que o rótulo mostra), não o campo cru: quando as colunas
   *  acabam e o mesher tem fila, quem está segurando é a malha. */
  private medir(f: FaseCarga, agora: number): void {
    this.tempos[this.faseMedida] = (this.tempos[this.faseMedida] ?? 0) + (agora - this.faseT0);
    this.faseT0 = agora;
    this.faseMedida = f;
  }

  /** Relatório das cargas desta sessão (o perfil do F3 exporta isto). */
  relatorio(): CargaRelatorio[] {
    return this.cargas;
  }

  /** Mundo pronto: crava 100% e fecha depois de um respiro (o anel fechando é
   *  o feedback de que terminou — sumir em 99% parece falha). */
  concluir(): void {
    if (!this.raiz || this.fimTimer) return;
    this.concluiu = true;
    this.setFase("pronto");
    this.fimTimer = window.setTimeout(() => this.fechar(), 400);
  }

  /**
   * Deu ruim ANTES do mundo chegar (servidor fora do ar, IP errado, rede da
   * escola caiu). A tela para de fingir vida — giro decorativo some, anel
   * congela — e oferece a volta pro menu. Sem isso o aluno fica olhando um
   * spinner eterno, que é exatamente o que esta tela existe pra evitar.
   */
  erro(msg: string, aoVoltar: () => void): void {
    const els = this.els;
    if (!els) return;
    this.pintar(); // última leitura real ANTES de congelar (tempo, bytes já lidos)
    clearInterval(this.timer);
    clearTimeout(this.fimTimer);
    this.timer = this.fimTimer = 0;
    els.fase.textContent = msg;
    els.fase.style.color = "#ff9c9c";
    els.anel.classList.remove("indef");
    this.raiz?.querySelector("#load-giro")?.classList.add("hidden");
    els.forcar.textContent = "voltar ao menu";
    els.forcar.classList.remove("hidden");
    this.acaoBotao = aoVoltar;
  }

  fechar(): void {
    if (!this.raiz) return;
    // fecha a medição ANTES de perder a fonte dos contadores (`this.ler`)
    const agora = performance.now();
    this.medir(this.faseMedida, agora); // só descarrega o tempo pendente
    const s = this.ler?.() ?? null;
    this.cargas.push({
      titulo: this.titulo,
      totalMs: +(agora - this.t0).toFixed(0),
      fasesMs: Object.fromEntries(
        Object.entries(this.tempos)
          .filter(([, ms]) => ms >= 1)
          .map(([f, ms]) => [f, +ms.toFixed(0)]),
      ),
      colunas: s?.prontas ?? 0,
      bytes: s?.bytes ?? 0,
      concluida: this.concluiu,
    });
    clearInterval(this.timer);
    clearTimeout(this.fimTimer);
    this.timer = this.fimTimer = 0;
    this.raiz.remove();
    this.estilo?.remove();
    this.raiz = null;
    this.estilo = null;
    this.els = null;
    this.ler = null;
    this.aoFechar();
  }

  /** Rótulo honesto do gargalo do MOMENTO: chegaram todas as colunas mas o
   *  mesher ainda tem fila = o que segura agora é a malha, não a rede. */
  private faseEfetiva(s: CargaStats | null): FaseCarga {
    return this.fase === "mundo" && s && s.total > 0 && s.prontas >= s.total ? "malha" : this.fase;
  }

  private rotuloFase(fase: FaseCarga): string {
    if (fase === "preparando") {
      return this.alvo ? `o servidor está preparando "${this.alvo}"…` : "preparando a aula nova…";
    }
    if (fase === "conectando") return this.rede ? "conectando ao servidor…" : "abrindo o mundo…";
    if (fase === "mundo") return this.rede ? "recebendo o mundo…" : "gerando o mundo…";
    if (fase === "malha") return "montando a malha…";
    return "pronto!";
  }

  private pintar(): void {
    const els = this.els;
    if (!els) return;
    const agora = performance.now();
    const s = this.ler?.() ?? null;

    // amostragem 1×/s: taxa em bits/s e ritmo de colunas (pro ETA)
    if (s && (this.primeiraAmostra || agora - this.amostraT >= 1000)) {
      if (!this.primeiraAmostra) {
        const dt = (agora - this.amostraT) / 1000;
        this.bps = ((s.bytes - this.amostraBytes) * 8) / dt;
        const cps = Math.max(0, (s.prontas - this.amostraProntas) / dt);
        // EMA: o streaming chega em lotes por tick, a média crua pula demais
        this.colsPorSeg = this.colsPorSeg === 0 ? cps : this.colsPorSeg * 0.6 + cps * 0.4;
      }
      this.primeiraAmostra = false;
      this.amostraT = agora;
      this.amostraBytes = s.bytes;
      this.amostraProntas = s.prontas;
    }

    let pct = this.pctMax;
    if (this.fase === "pronto") pct = 1;
    else if (s && s.total > 0) pct = Math.min(1, Math.max(0, s.prontas / s.total));
    this.pctMax = pct = Math.max(this.pctMax, pct);

    // indeterminado enquanto não há total (conectando, ou mundo denso que chega
    // num blob só): arco de 1/4 girando, sem número — 0% travado parece defeito
    const indef = this.fase !== "pronto" && (!s || s.total === 0);
    els.anel.classList.toggle("indef", indef);
    if (indef) {
      els.arco.setAttribute("stroke-dasharray", `${(CIRC * 0.25).toFixed(1)} ${CIRC.toFixed(1)}`);
      els.arco.setAttribute("stroke-dashoffset", "0");
      els.pct.textContent = "…";
    } else {
      els.arco.setAttribute("stroke-dasharray", CIRC.toFixed(1));
      els.arco.setAttribute("stroke-dashoffset", (CIRC * (1 - pct)).toFixed(1));
      els.pct.textContent = `${Math.round(pct * 100)}%`;
    }
    const efetiva = this.faseEfetiva(s);
    if (efetiva !== this.faseMedida) this.medir(efetiva, agora);
    els.fase.textContent = this.rotuloFase(efetiva);

    const decorrido = agora - this.t0;
    let tempo = fmtSeg(decorrido);
    if (s && s.total > 0 && this.colsPorSeg > 0.5 && pct < 1) {
      const eta = ((s.total - s.prontas) / this.colsPorSeg) * 1000;
      if (Number.isFinite(eta) && eta < 600_000) tempo += ` · falta ~${fmtSeg(eta)}`;
    }
    els.valores["tempo"]!.textContent = tempo;
    els.valores["taxa"]!.textContent = fmtBits(this.bps);
    if (s) {
      // sem total = não há streaming a contar (conectando, ou mundo denso que
      // vem inteiro no snapshot): "—" é honesto, "0" pareceria travado
      const conta = s.total > 0;
      els.valores["colunas"]!.textContent = conta ? `${s.prontas} / ${s.total}` : "—";
      els.valores["transf"]!.textContent = conta ? `${s.faltando}` : "—";
      els.valores["fila"]!.textContent = conta ? `${s.fila}` : "—";
      els.valores["recebido"]!.textContent = fmtBytes(s.bytes);
    }
    // demorou demais (servidor lento, lote perdido): oferece a saída manual em
    // vez de deixar o aluno olhando pro anel parado
    els.forcar.classList.toggle("hidden", decorrido < ESPERA_BOTAO_MS || this.fase === "pronto");
  }
}
