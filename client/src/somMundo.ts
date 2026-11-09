/**
 * §🔊 Som de MUNDO — blocos, passos, água, corpo, peças, ambiente e bichos.
 *
 * A v1 (02/11) era toda SINTETIZADA com WebAudio. A **v2** (03/11, pedido
 * dele: "a versão 2 dos sons") toca AMOSTRA GRAVADA (CC0: Kenney, rubberduck,
 * TinyWorlds, BigSoundBank — origem de cada uma em `client/public/sons/
 * CREDITOS.md`) em blocos, passos, porta, baú, Dimas, grilo e 5 bichos. QUAL
 * amostra é tabela pura em `shared/src/sonsAmostras.ts`; a síntese ficou no
 * resto e é a RESERVA: amostra que não carregou (rede, 404, navegador sem
 * Vorbis) cai na receita da v1, então o jogo nunca fica mudo por arquivo.
 *
 * A regra de QUANDO soa (que troca de bloco faz barulho, qual o material,
 * quando é passo) é pura e mora em `shared/src/sons.ts`, testada; aqui só o
 * timbre (amostra ou síntese) e o orçamento.
 *
 * ## As amostras
 *
 * - **Baixam DEPOIS do 1º gesto**, quando o `audio.ts` arma o contexto: sem
 *   contexto não há som, e baixar antes só disputaria banda com a carga do
 *   mundo. ~350 KB, 58 arquivos, em paralelo e sem esperar ninguém — o que
 *   ainda não chegou toca sintetizado.
 * - **Variação**: take sorteado (nunca o mesmo da vez anterior) e velocidade
 *   ±6% — 10 passos seguidos não podem soar como metralhadora.
 * - Mesmo orçamento da v1: a amostra também é UMA voz (`voz()`), com teto,
 *   alcance e "junta repetido".
 *
 * ## Orçamento (o notebook do lab é o teto)
 *
 * - **Teto de vozes** (`MAX_VOZES`): som novo acima dele é DESCARTADO, não
 *   enfileirado — som atrasado é pior que som nenhum. Conta no perfil.
 * - **Alcance** (`ALCANCE`): som além dele nem cria nó. Numa aula com 30
 *   alunos construindo, é este corte que segura o custo — cada tablet só
 *   sintetiza a vizinhança dele.
 * - **Junta repetido**: o mesmo som no mesmo lugar dentro de `JUNTAR_MS` vira
 *   um só (porta = 2 células, areia caindo, árvore crescendo de uma vez).
 * - **Espacial barato**: ganho por distância + `StereoPannerNode`, calculados
 *   UMA vez no disparo. O `PannerNode` com HRTF custa uma convolução por voz;
 *   som de 150 ms não anda o bastante pra precisar seguir a fonte.
 * - **Ambiente** é uma máquina de estado de 1 Hz (`ambiente()`), não um laço:
 *   1 nó de ruído em loop pro vento e pro riacho, e chilreio/grilo/gota como
 *   disparos raros. Sem ambiente ligado (volume 0) nada disso existe.
 * - **Um ruído só**: 1 s de ruído branco gerado UMA vez; toda voz de ruído lê
 *   dele com deslocamento aleatório. Gerar buffer por som custaria alocação.
 *
 * O perfil do F3 recebe `medidas` (vozes, descartes, ms de main thread) — é o
 * "o som consome quanto" que o usuário pediu pros campos novos do perfilador.
 */

import {
  type ConjuntoDeAmostra,
  type EventoDeBicho,
  type MaterialSonoro,
  type SomDeBloco,
  type VozDeBicho,
  amostraDoBicho,
  amostraDoMaterial,
  arquivosDoConjunto,
  CONJUNTOS_DE_AMOSTRA,
  PASTA_SONS,
  vozDoBicho,
} from "@logica/shared";
import { contextoDeAudio } from "./audio";
import { onGameEvent } from "./events";

/** Vozes simultâneas (sons, não nós). Acima disto, descarta. */
const MAX_VOZES = 14;
/** Distância (blocos) além da qual o som nem é criado. */
const ALCANCE = 24;
/** Mesmo som, mesmo lugar (±1,5 bloco), dentro disto = um só. */
const JUNTAR_MS = 60;
/** Distância de "meio volume" — perto disto o som é cheio. */
const DIST_MEIA = 5;

/** Receita de cada material: a "cor" do ruído e um tom opcional por baixo. */
interface Receita {
  /** Filtro do ruído: tipo, frequência inicial→final, Q. */
  filtro: BiquadFilterType;
  f0: number;
  f1: number;
  q: number;
  /** Duração-base do QUEBRAR (ms); os outros eventos escalam a partir dela. */
  ms: number;
  /** Ganho relativo (areia e tecido são naturalmente mais baixos). */
  ganho: number;
  /** Tom curto por baixo (o "toc" da madeira, o "tlim" do vidro). */
  tom?: { f: number; tipo: OscillatorType; ms: number; ganho: number };
}

const RECEITAS: Record<MaterialSonoro, Receita> = {
  pedra: { filtro: "bandpass", f0: 1900, f1: 800, q: 1.1, ms: 150, ganho: 1, tom: { f: 150, tipo: "square", ms: 40, ganho: 0.25 } },
  madeira: { filtro: "bandpass", f0: 700, f1: 380, q: 2.6, ms: 140, ganho: 1, tom: { f: 230, tipo: "triangle", ms: 70, ganho: 0.55 } },
  terra: { filtro: "lowpass", f0: 1100, f1: 300, q: 0.8, ms: 170, ganho: 0.95 },
  areia: { filtro: "bandpass", f0: 3600, f1: 2200, q: 0.7, ms: 190, ganho: 0.7 },
  vidro: { filtro: "highpass", f0: 4200, f1: 2600, q: 0.9, ms: 180, ganho: 0.6, tom: { f: 2900, tipo: "triangle", ms: 160, ganho: 0.35 } },
  planta: { filtro: "bandpass", f0: 2600, f1: 1500, q: 0.8, ms: 130, ganho: 0.7 },
  tecido: { filtro: "lowpass", f0: 700, f1: 350, q: 0.7, ms: 130, ganho: 0.6 },
  metal: { filtro: "bandpass", f0: 2400, f1: 1800, q: 4, ms: 110, ganho: 0.6, tom: { f: 1250, tipo: "triangle", ms: 180, ganho: 0.4 } },
};

/** Como cada evento de bloco usa a receita: duração × e pico. */
const USO = {
  quebrar: { dur: 1.25, pico: 0.55 },
  colocar: { dur: 0.7, pico: 0.42 },
  golpe: { dur: 0.45, pico: 0.26 },
  passo: { dur: 0.5, pico: 0.15 },
} as const;
type UsoDeBloco = keyof typeof USO;

/** Os nomes que o perfil conta (um por tipo de disparo). */
type Rotulo =
  | UsoDeBloco | "porta" | "alavanca" | "placa" | "fogo" | "aterrissar" | "agua"
  | "nadar" | "balde" | "dano" | "morte" | "comer" | "container" | "fabricar"
  | "moeda" | "teleporte" | "dormir" | "golpePvp" | "ambiente" | "bicho"
  | "pesca";

interface Medidas {
  /** Sons tocados desde o boot. */
  tocados: number;
  /** Descartados pelo teto de vozes (se crescer em aula = teto baixo). */
  descartadosTeto: number;
  /** Descartados por distância (o corte que segura a aula cheia). */
  descartadosLonge: number;
  /** Juntados com um igual no mesmo lugar. */
  juntados: number;
  /** Vozes soando agora e o pico desde o boot. */
  vozes: number;
  vozesPico: number;
  /** Tempo de MAIN THREAD gasto montando nós (ms acumulados). */
  ms: number;
  /** Quantos de cada tipo — diz QUEM está enchendo o orçamento. */
  porTipo: Partial<Record<Rotulo, number>>;
  /** Estado do AudioContext ("sem" = ainda não armado / sem WebAudio). */
  contexto: string;
  /** Laços contínuos do ambiente ligados agora (vento, riacho). */
  lacos: number;
  /** Trocas de bloco recebidas: as que soaram × as que o `somDaTroca` calou.
   *  "Caladas" alto e "soaram" baixo é o motor trabalhando (água, circuito). */
  trocasSoaram: number;
  trocasCaladas: number;
  /** §🔊 v2: as amostras gravadas — quantas chegaram, quantas falharam (aí
   *  toca a síntese), o PCM decodificado na RAM (KB) e quantas vozes saíram de
   *  cada ORIGEM. "sintetizadas" subindo com `falhas` > 0 = a reserva agindo. */
  amostras: {
    total: number;
    carregadas: number;
    falhas: number;
    kb: number;
    gravadas: number;
    sintetizadas: number;
  };
  /** De onde saiu a ÚLTIMA voz de cada tipo — a sonda pergunta "o colocar
   *  tocou gravado?" sem o ambiente (que toca sozinho) sujar a conta. */
  origemPorTipo: Partial<Record<Rotulo, Origem>>;
}

type Origem = "amostra" | "sintese";

/** Contexto do jogador que o ambiente lê 1×/s (o main monta, sem alocar muito). */
export interface ContextoAmbiente {
  /** 0..1: o dia (peso do canal céu, `skyCycle.nivelCeu`). */
  dia: number;
  /** 0..15: luz de céu na cabeça (≥ 12 = a céu aberto, 0 = caverna). */
  ceu: number;
  /** 0..1: força do vento autoritativo. */
  vento: number;
  /** Água corrente perto (células fluidas na vizinhança). */
  aguaPerto: number;
  /** Cabeça submersa (abafa o mundo). */
  submerso: boolean;
}

const rnd = (a: number, b: number): number => a + Math.random() * (b - a);

class SomMundo {
  private ctx: AudioContext | null = null;
  private mundo: GainNode | null = null;
  private ambienteBus: GainNode | null = null;
  private abafar: BiquadFilterNode | null = null;
  private ruido: AudioBuffer | null = null;
  private volMundo = 0.8;
  private volAmbiente = 0.5;

  // ouvinte (câmera), atualizado 1×/frame — escalares, sem objeto novo
  private ox = 0;
  private oy = 0;
  private oz = 0;
  private dirX = 1; // vetor "direita" da câmera no plano XZ
  private dirZ = 0;

  /** Fim (s do ctx) de cada voz soando — poda no disparo. */
  private readonly fins: number[] = [];
  /** Últimos disparos, pra juntar repetido: chave → [t, x, y, z]. */
  private readonly recentes = new Map<string, [number, number, number, number]>();

  // ambiente
  private vento: { fonte: AudioBufferSourceNode; filtro: BiquadFilterNode; ganho: GainNode } | null = null;
  private riacho: { fonte: AudioBufferSourceNode; filtro: BiquadFilterNode; ganho: GainNode } | null = null;
  private proxPassaro = 0;
  private proxGrilo = 0;
  private proxGota = 0;
  private ultimoBicho = new Map<string, number>();

  readonly medidas: Medidas = {
    tocados: 0, descartadosTeto: 0, descartadosLonge: 0, juntados: 0,
    vozes: 0, vozesPico: 0, ms: 0, porTipo: {}, contexto: "sem", lacos: 0,
    trocasSoaram: 0, trocasCaladas: 0,
    amostras: { total: 0, carregadas: 0, falhas: 0, kb: 0, gravadas: 0, sintetizadas: 0 },
    origemPorTipo: {},
  };

  /** Takes decodificados por conjunto (só os que CHEGARAM). */
  private readonly takes = new Map<ConjuntoDeAmostra, AudioBuffer[]>();
  /** Último take tocado por conjunto — o próximo sorteio o evita. */
  private readonly ultimoTake = new Map<ConjuntoDeAmostra, AudioBuffer>();
  private baixando = false;

  /** Pega o contexto do `audio.ts` (nunca cria) e monta os barramentos 1×. */
  private pronto(): AudioContext | null {
    const ctx = contextoDeAudio();
    if (!ctx) return null;
    if (this.ctx !== ctx) {
      this.ctx = ctx;
      this.abafar = ctx.createBiquadFilter();
      this.abafar.type = "lowpass";
      this.abafar.frequency.value = 20000;
      this.abafar.connect(ctx.destination);
      this.mundo = ctx.createGain();
      this.mundo.gain.value = this.volMundo;
      this.mundo.connect(this.abafar);
      this.ambienteBus = ctx.createGain();
      this.ambienteBus.gain.value = this.volAmbiente;
      this.ambienteBus.connect(this.abafar);
      const n = ctx.sampleRate; // 1 s
      this.ruido = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = this.ruido.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this.carregarAmostras(ctx);
    }
    this.medidas.contexto = ctx.state;
    return ctx;
  }

  /**
   * Baixa e decodifica TODAS as amostras, 1× por página. Cada uma entra no
   * conjunto quando chega — não há "pronto" global: o que falta toca
   * sintetizado. Falha (404, rede, codec) só conta; nunca joga erro.
   */
  private carregarAmostras(ctx: AudioContext): void {
    if (this.baixando || typeof fetch !== "function") return;
    this.baixando = true;
    const m = this.medidas.amostras;
    for (const c of Object.keys(CONJUNTOS_DE_AMOSTRA) as ConjuntoDeAmostra[]) {
      for (const arq of arquivosDoConjunto(c)) {
        m.total++;
        fetch(`/${PASTA_SONS}/${arq}`)
          .then((r) => {
            if (!r.ok) throw new Error(`${r.status}`);
            return r.arrayBuffer();
          })
          // a forma de callback: Safari/WebView antigo não devolve promessa
          .then((ab) => new Promise<AudioBuffer>((ok, erro) => void ctx.decodeAudioData(ab, ok, erro)))
          .then((buf) => {
            const lista = this.takes.get(c) ?? [];
            lista.push(buf);
            this.takes.set(c, lista);
            m.carregadas++;
            m.kb = Math.round(m.kb + (buf.length * buf.numberOfChannels * 4) / 1024);
          })
          .catch(() => {
            m.falhas++;
          });
      }
    }
  }

  /** Um take do conjunto (≠ do anterior quando há 2+), ou `null` se nenhum chegou. */
  private take(c: ConjuntoDeAmostra): AudioBuffer | null {
    const lista = this.takes.get(c);
    if (!lista || lista.length === 0) return null;
    const antes = this.ultimoTake.get(c);
    let b = lista[Math.floor(Math.random() * lista.length)]!;
    if (b === antes && lista.length > 1) b = lista[(lista.indexOf(b) + 1) % lista.length]!;
    this.ultimoTake.set(c, b);
    return b;
  }

  /**
   * Toca um take como UMA voz (mesmo teto/alcance/junta da síntese).
   * Devolve false se não havia take — quem chamou cai na receita sintetizada.
   * `tom` é a velocidade de leitura; ±6% de sorteio vai por cima.
   */
  private gravado(
    c: ConjuntoDeAmostra | null,
    rotulo: Rotulo,
    ganho: number,
    tom: number,
    x: number | null,
    y = 0,
    z = 0,
    bus: "mundo" | "ambiente" = "mundo",
  ): boolean {
    const buf = c ? this.take(c) : null;
    if (!buf) return false;
    this.medir(() => {
      const rate = tom * rnd(0.94, 1.06);
      const v = this.voz(rotulo, buf.duration / rate, x, y, z, bus, "amostra");
      if (!v) return;
      const src = v.ctx.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = rate;
      const g = v.ctx.createGain();
      g.gain.value = ganho;
      src.connect(g).connect(v.saida);
      src.start(v.t0);
    });
    return true;
  }

  setVolumes(mundo: number, ambiente: number): void {
    this.volMundo = mundo;
    this.volAmbiente = ambiente;
    if (this.mundo) this.mundo.gain.value = mundo;
    if (this.ambienteBus) this.ambienteBus.gain.value = ambiente;
    if (ambiente <= 0) this.pararLacos();
  }

  /** Câmera: posição e yaw (three: yaw 0 olha −Z, a direita é +X). */
  ouvinte(x: number, y: number, z: number, yaw: number): void {
    this.ox = x;
    this.oy = y;
    this.oz = z;
    this.dirX = Math.cos(yaw);
    this.dirZ = -Math.sin(yaw);
  }

  // ------------------------------------------------------------ o disparo

  /**
   * Abre uma VOZ: confere orçamento, distância e repetição, e devolve o nó
   * onde as primitivas se ligam (já com ganho de distância e pan) — ou `null`
   * (descartado). `x` null = som "na cabeça" (do próprio jogador).
   */
  private voz(
    rotulo: Rotulo,
    durS: number,
    x: number | null,
    y = 0,
    z = 0,
    bus: "mundo" | "ambiente" = "mundo",
    origem: Origem = "sintese",
  ): { ctx: AudioContext; t0: number; saida: AudioNode } | null {
    const ctx = this.pronto();
    const destino = bus === "mundo" ? this.mundo : this.ambienteBus;
    if (!ctx || !destino || (bus === "mundo" ? this.volMundo : this.volAmbiente) <= 0) return null;
    const t0 = ctx.currentTime;
    // poda as vozes que já acabaram (array pequeno: ≤ MAX_VOZES)
    for (let i = this.fins.length - 1; i >= 0; i--) if (this.fins[i]! <= t0) this.fins.splice(i, 1);
    if (this.fins.length >= MAX_VOZES) {
      this.medidas.descartadosTeto++;
      return null;
    }
    let ganho = 1;
    let pan = 0;
    if (x !== null) {
      const dx = x - this.ox;
      const dy = y - this.oy;
      const dz = z - this.oz;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d > ALCANCE) {
        this.medidas.descartadosLonge++;
        return null;
      }
      const r = this.recentes.get(rotulo);
      if (r && (t0 - r[0]) * 1000 < JUNTAR_MS && Math.abs(r[1] - x) + Math.abs(r[2] - y) + Math.abs(r[3] - z) < 3) {
        this.medidas.juntados++;
        return null;
      }
      this.recentes.set(rotulo, [t0, x, y, z]);
      ganho = 1 / (1 + (d / DIST_MEIA) * (d / DIST_MEIA));
      if (d > 0.5) pan = Math.max(-1, Math.min(1, ((dx * this.dirX + dz * this.dirZ) / d) * 0.8));
    }
    this.fins.push(t0 + durS + 0.05);
    this.medidas.vozes = this.fins.length;
    if (this.fins.length > this.medidas.vozesPico) this.medidas.vozesPico = this.fins.length;
    this.medidas.tocados++;
    this.medidas.porTipo[rotulo] = (this.medidas.porTipo[rotulo] ?? 0) + 1;
    if (origem === "amostra") this.medidas.amostras.gravadas++;
    else this.medidas.amostras.sintetizadas++;
    this.medidas.origemPorTipo[rotulo] = origem;

    // a voz desmonta sozinha: nó sem fonte tocando é coletado pelo navegador
    const g = ctx.createGain();
    g.gain.value = ganho;
    if (pan !== 0 && typeof ctx.createStereoPanner === "function") {
      const p = ctx.createStereoPanner();
      p.pan.value = pan;
      g.connect(p).connect(destino);
    } else {
      g.connect(destino);
    }
    return { ctx, t0, saida: g };
  }

  /** Ruído filtrado com envelope curto. */
  private ruidoF(
    v: { ctx: AudioContext; t0: number; saida: AudioNode },
    atrasoS: number,
    durS: number,
    filtro: BiquadFilterType,
    f0: number,
    f1: number,
    q: number,
    pico: number,
  ): void {
    if (!this.ruido) return;
    const { ctx, saida } = v;
    const t0 = v.t0 + atrasoS;
    const t1 = t0 + durS;
    const src = ctx.createBufferSource();
    src.buffer = this.ruido;
    const f = ctx.createBiquadFilter();
    f.type = filtro;
    f.Q.value = q;
    f.frequency.setValueAtTime(f0, t0);
    f.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(pico, t0 + Math.min(0.006, durS / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, t1);
    src.connect(f).connect(g).connect(saida);
    src.start(t0, Math.random() * 0.8);
    src.stop(t1 + 0.02);
  }

  /** Oscilador com rampa de frequência e envelope. */
  private tom(
    v: { ctx: AudioContext; t0: number; saida: AudioNode },
    atrasoS: number,
    durS: number,
    tipo: OscillatorType,
    f0: number,
    f1: number,
    pico: number,
    ataqueS = 0.005,
  ): void {
    const { ctx, saida } = v;
    const t0 = v.t0 + atrasoS;
    const t1 = t0 + durS;
    const o = ctx.createOscillator();
    o.type = tipo;
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 20), t1);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(pico, t0 + ataqueS);
    g.gain.exponentialRampToValueAtTime(0.0001, t1);
    o.connect(g).connect(saida);
    o.start(t0);
    o.stop(t1 + 0.02);
  }

  /** Mede o custo de main thread do disparo (vai pro perfil). */
  private medir(fn: () => void): void {
    const a = performance.now();
    fn();
    this.medidas.ms += performance.now() - a;
  }

  // ------------------------------------------------------------ blocos

  /** Som de material (quebrar, colocar, golpe da picareta, passo). */
  material(uso: UsoDeBloco, mat: MaterialSonoro, x: number | null, y = 0, z = 0): void {
    const a = amostraDoMaterial(uso, mat);
    if (a && this.gravado(a.conjunto, uso, a.ganho, a.tom, x, y, z)) return;
    this.medir(() => {
      const r = RECEITAS[mat];
      const u = USO[uso];
      const dur = (r.ms * u.dur) / 1000;
      const v = this.voz(uso, dur, x, y, z);
      if (!v) return;
      // ±8% em tudo: sem isto 10 passos seguidos soam como metralhadora
      const k = rnd(0.92, 1.08);
      this.ruidoF(v, 0, dur, r.filtro, r.f0 * k, r.f1 * k, r.q, u.pico * r.ganho);
      if (r.tom && uso !== "passo") {
        this.tom(v, 0, (r.tom.ms * u.dur) / 1000, r.tom.tipo, r.tom.f * k, r.tom.f * k * 0.8, u.pico * r.tom.ganho);
      }
      // vidro QUEBRANDO tem os cacos: 3 tlins agudos espalhados
      if (mat === "vidro" && uso === "quebrar") {
        for (let i = 0; i < 3; i++) {
          const f = rnd(2600, 4800);
          this.tom(v, rnd(0.02, 0.14), rnd(0.08, 0.16), "triangle", f, f * 0.9, 0.12);
        }
      }
    });
  }

  /** Uma troca de bloco chegou da rede: conta e, se `somDaTroca` deu som, toca. */
  trocaRecebida(s: SomDeBloco | null, x: number, y: number, z: number): void {
    if (!s) {
      this.medidas.trocasCaladas++;
      return;
    }
    this.medidas.trocasSoaram++;
    this.troca(s, x, y, z);
  }

  /** O som de uma troca de bloco já classificada por `somDaTroca`. */
  troca(s: SomDeBloco, x: number, y: number, z: number): void {
    const cx = x + 0.5;
    const cy = y + 0.5;
    const cz = z + 0.5;
    switch (s.tipo) {
      case "colocar":
      case "quebrar":
        this.material(s.tipo, s.material, cx, cy, cz);
        return;
      case "porta":
        if (this.gravado(s.abriu ? "porta-abrir" : "porta-fechar", "porta", 0.45, 1, cx, cy, cz)) return;
        return this.medir(() => {
          const v = this.voz("porta", 0.32, cx, cy, cz);
          if (!v) return;
          // rangido (dente de serra num passa-faixa estreito) + batida ao fechar
          this.tom(v, 0, 0.2, "sawtooth", s.abriu ? 150 : 230, s.abriu ? 240 : 130, 0.08, 0.03);
          this.ruidoF(v, 0, 0.18, "bandpass", 900, 600, 4, 0.16);
          if (!s.abriu) this.ruidoF(v, 0.14, 0.16, "lowpass", 500, 140, 1, 0.5);
        });
      case "alavanca":
        return this.medir(() => {
          const v = this.voz("alavanca", 0.08, cx, cy, cz);
          if (!v) return;
          const f = s.ligou ? 1700 : 1250;
          this.tom(v, 0, 0.018, "square", f, f * 0.7, 0.18, 0.001);
          this.tom(v, 0.03, 0.03, "square", f * 0.55, f * 0.4, 0.14, 0.001);
        });
      case "placa":
        return this.medir(() => {
          const v = this.voz("placa", 0.06, cx, cy, cz);
          if (!v) return;
          this.tom(v, 0, 0.04, "triangle", s.ligou ? 800 : 560, s.ligou ? 600 : 420, 0.22, 0.002);
        });
      case "fogo":
        return this.medir(() => {
          const v = this.voz("fogo", 0.4, cx, cy, cz);
          if (!v) return;
          this.ruidoF(v, 0, 0.38, "lowpass", 300, 1600, 0.9, 0.32);
        });
    }
  }

  // ------------------------------------------------------------ o jogador

  /** Baque da aterrissagem (mais forte quanto mais alto) + a passada. */
  aterrissar(altura: number, mat: MaterialSonoro, x: number, y: number, z: number): void {
    this.medir(() => {
      const v = this.voz("aterrissar", 0.25, null);
      if (!v) return;
      const forca = Math.min(1, 0.35 + altura / 8);
      this.ruidoF(v, 0, 0.22, "lowpass", 420, 120, 1, 0.55 * forca);
      this.tom(v, 0, 0.12, "sine", 110, 55, 0.35 * forca);
    });
    this.material("passo", mat, x, y, z);
  }

  /** Entrou na água (pés): o splash. Forte = caiu de cima. */
  splash(forte: boolean): void {
    this.medir(() => {
      const v = this.voz("agua", 0.5, null);
      if (!v) return;
      this.ruidoF(v, 0, forte ? 0.45 : 0.3, "lowpass", 3200, 380, 0.8, forte ? 0.5 : 0.3);
      for (let i = 0; i < 3; i++) {
        const f = rnd(380, 600);
        this.tom(v, rnd(0.06, 0.3), 0.07, "sine", f, f * 2.1, 0.09);
      }
    });
  }

  /** Braçada nadando (o main chama pela cadência da passada, na água). */
  nadar(): void {
    this.medir(() => {
      const v = this.voz("nadar", 0.3, null);
      if (!v) return;
      this.ruidoF(v, 0, 0.28, "lowpass", 1200, 400, 0.7, 0.14);
    });
  }

  /**
   * §🎣 A PESCA (2026-11-09), na síntese — 4 momentos, todos com POSIÇÃO
   * (o lago da turma toda soa onde está). O som AJUDA mas não pode ser
   * necessário: 30 tablets e volume baixo — a mordida se VÊ (a boia afunda).
   * - `lancar`: o zunido da linha cortando o ar (ruído passa-banda subindo) e
   *   o plop da boia no fim — UMA voz: duas no mesmo lugar seriam juntadas;
   * - `boiaCaiu`: o plop curto da boia (o "agua" encolhido);
   * - `fisgou`: o ALERTA — respingo forte + dois blips descendo;
   * - `puxar`: a carretilha (cliques secos rápidos) e, se veio algo, o splash.
   */
  pesca(momento: "lancar" | "boiaCaiu" | "fisgou" | "puxar", x: number, y: number, z: number, veio = false): void {
    this.medir(() => {
      const dur = momento === "puxar" || momento === "lancar" ? 0.6 : momento === "fisgou" ? 0.5 : 0.35;
      const v = this.voz("pesca", dur, x, y, z);
      if (!v) return;
      if (momento === "lancar") {
        this.ruidoF(v, 0, 0.3, "bandpass", 900, 3200, 2.5, 0.22);
        this.ruidoF(v, 0.34, 0.16, "lowpass", 2400, 400, 0.8, 0.22);
        this.tom(v, 0.35, 0.08, "sine", 520, 1100, 0.1);
      } else if (momento === "boiaCaiu") {
        this.ruidoF(v, 0, 0.16, "lowpass", 2400, 400, 0.8, 0.22);
        this.tom(v, 0.01, 0.08, "sine", 520, 1100, 0.1);
      } else if (momento === "fisgou") {
        this.ruidoF(v, 0, 0.4, "lowpass", 3600, 500, 0.9, 0.5);
        this.tom(v, 0.02, 0.09, "square", 880, 620, 0.08);
        this.tom(v, 0.14, 0.12, "square", 660, 440, 0.08);
      } else {
        for (let i = 0; i < 6; i++) this.ruidoF(v, i * 0.045, 0.02, "highpass", 3000, 2500, 1, 0.14);
        if (veio) this.ruidoF(v, 0.28, 0.3, "lowpass", 3000, 350, 0.8, 0.35);
      }
    });
  }

  balde(encher: boolean): void {
    this.medir(() => {
      const v = this.voz("balde", 0.45, null);
      if (!v) return;
      if (encher) {
        // bolhas SUBINDO: o balde engolindo água
        for (let i = 0; i < 4; i++) {
          const f = 260 + i * 90;
          this.tom(v, i * 0.07, 0.08, "sine", f, f * 2.4, 0.16);
        }
      } else {
        this.ruidoF(v, 0, 0.35, "lowpass", 2600, 300, 0.8, 0.35);
        this.tom(v, 0.02, 0.1, "sine", 700, 300, 0.12);
      }
    });
  }

  private dano(): void {
    this.medir(() => {
      const v = this.voz("dano", 0.25, null);
      if (!v) return;
      // "uf": dente de serra caindo, abafado, e o baque por baixo
      const f = rnd(240, 280);
      this.tom(v, 0, 0.17, "sawtooth", f, f * 0.6, 0.16, 0.01);
      this.ruidoF(v, 0, 0.1, "lowpass", 600, 150, 1, 0.4);
    });
  }

  private morte(): void {
    this.medir(() => {
      const v = this.voz("morte", 0.8, null);
      if (!v) return;
      this.tom(v, 0, 0.7, "triangle", 420, 80, 0.22, 0.01);
      this.tom(v, 0.08, 0.6, "sine", 300, 60, 0.15, 0.01);
      this.ruidoF(v, 0, 0.3, "lowpass", 500, 100, 1, 0.3);
    });
  }

  /** Mordida: três "crecs" e o engolir. */
  comer(): void {
    this.medir(() => {
      const v = this.voz("comer", 0.7, null);
      if (!v) return;
      for (let i = 0; i < 3; i++) {
        this.ruidoF(v, i * 0.16 + rnd(0, 0.03), 0.07, "bandpass", rnd(1500, 2400), 900, 2, 0.3);
      }
      this.tom(v, 0.52, 0.12, "sine", 320, 160, 0.14, 0.01);
    });
  }

  /** Baú/fornalha/loja abrindo ou fechando (o painel é quem sabe). */
  container(tipo: string, abriu: boolean, x: number, y: number, z: number): void {
    // a fornalha é pedra arrastando: fica na síntese (nenhum pacote tinha)
    if (tipo !== "fornalha" && this.gravado(abriu ? "bau-abrir" : "bau-fechar", "container", 0.42, 1, x + 0.5, y + 0.5, z + 0.5)) return;
    this.medir(() => {
      const v = this.voz("container", 0.35, x + 0.5, y + 0.5, z + 0.5);
      if (!v) return;
      if (tipo === "fornalha") {
        // pedra arrastando
        this.ruidoF(v, 0, 0.22, "bandpass", abriu ? 900 : 1300, abriu ? 1400 : 700, 2.5, 0.3);
        return;
      }
      // tampa de madeira: rangido curto e, fechando, a batida
      this.tom(v, 0, 0.16, "sawtooth", abriu ? 170 : 220, abriu ? 230 : 150, 0.06, 0.02);
      this.ruidoF(v, abriu ? 0 : 0.1, 0.16, "lowpass", 600, 160, 1, abriu ? 0.25 : 0.45);
    });
  }

  /** Fabricou: madeira batendo + um tlim de ferramenta. */
  fabricar(): void {
    this.medir(() => {
      const v = this.voz("fabricar", 0.4, null);
      if (!v) return;
      this.ruidoF(v, 0, 0.09, "bandpass", 700, 400, 2.5, 0.35);
      this.tom(v, 0, 0.06, "triangle", 260, 200, 0.25);
      this.tom(v, 0.09, 0.28, "triangle", 1320, 1250, 0.12);
      this.tom(v, 0.09, 0.22, "sine", 2640, 2500, 0.05);
    });
  }

  /** Dimas: ganhou (2 notas subindo) × gastou (2 descendo). */
  moeda(ganhou: boolean): void {
    if (this.gravado(ganhou ? "moeda-ganhou" : "moeda-gastou", "moeda", 0.4, 1, null)) return;
    this.medir(() => {
      const v = this.voz("moeda", 0.45, null);
      if (!v) return;
      const [a, b] = ganhou ? [1320, 1760] : [990, 740];
      this.tom(v, 0, 0.12, "triangle", a, a, 0.16, 0.002);
      this.tom(v, 0.09, 0.3, "triangle", b, b, 0.16, 0.002);
    });
  }

  teleporte(): void {
    this.medir(() => {
      const v = this.voz("teleporte", 0.5, null);
      if (!v) return;
      this.ruidoF(v, 0, 0.45, "bandpass", 300, 3200, 4, 0.3);
      this.tom(v, 0, 0.4, "sine", 400, 1600, 0.1, 0.05);
    });
  }

  dormir(deitou: boolean): void {
    this.medir(() => {
      const v = this.voz("dormir", 1.1, null);
      if (!v) return;
      const [a, b] = deitou ? [660, 495] : [495, 660];
      this.tom(v, 0, 0.55, "sine", a, a, 0.12, 0.04);
      this.tom(v, 0.35, 0.7, "sine", b, b, 0.12, 0.04);
    });
  }

  /** Soco em outro jogador (§🍖 F7) — o pedido; o dano de quem leva é dele. */
  golpePvp(): void {
    this.medir(() => {
      const v = this.voz("golpePvp", 0.15, null);
      if (!v) return;
      this.ruidoF(v, 0, 0.06, "lowpass", 1100, 300, 1, 0.4);
      this.tom(v, 0, 0.09, "sine", 130, 60, 0.3);
    });
  }

  // ------------------------------------------------------------ bichos

  /**
   * §🐄 O GANCHO dos bichos. O código de mob (outra frente) chama isto no
   * cliente quando o bicho soa; a voz já está aqui. Tipo desconhecido usa a
   * voz genérica — nunca quebra.
   *
   * Cada TIPO tem um piso de 150 ms entre disparos: 20 vacas mugindo no mesmo
   * frame (o servidor manda todas no mesmo tick) viram uma, que é o que se ouve.
   */
  somDeBicho(tipo: string, evento: EventoDeBicho, x: number, y: number, z: number): void {
    const agora = performance.now();
    const chave = `${tipo}:${evento}`;
    if (evento !== "passo" && agora - (this.ultimoBicho.get(chave) ?? -1e9) < 150) return;
    this.ultimoBicho.set(chave, agora);
    if (evento === "passo") {
      this.material("passo", vozDoBicho(tipo) === "vaca" ? "terra" : "planta", x, y, z);
      return;
    }
    const voz: VozDeBicho | null = vozDoBicho(tipo);
    // gravado: dano = mais agudo e curto; morte = mais grave e longo
    const tomGravado = evento === "dano" ? 1.25 : evento === "morte" ? 0.8 : 1;
    if (this.gravado(amostraDoBicho(voz), "bicho", 0.5, tomGravado, x, y, z)) return;
    this.medir(() => {
      const v = this.voz("bicho", 1, x, y, z);
      if (!v) return;
      // dano = curto e mais agudo; morte = longo e caindo
      const tom = evento === "dano" ? 1.3 : evento === "morte" ? 0.85 : 1;
      const dur = evento === "dano" ? 0.35 : evento === "morte" ? 1.1 : 1;
      const k = rnd(0.94, 1.06) * tom;
      switch (voz) {
        case "vaca": // muuu: grave, ataque lento, caindo
          this.tom(v, 0, 0.9 * dur, "sawtooth", 150 * k, (evento === "morte" ? 70 : 100) * k, 0.12, 0.12);
          this.tom(v, 0, 0.9 * dur, "sine", 75 * k, 50 * k, 0.12, 0.12);
          break;
        case "porco": // óinc óinc: nasal, duas vezes
          for (let i = 0; i < (evento === "ambiente" ? 2 : 1); i++) {
            this.tom(v, i * 0.17, 0.12 * dur * 1.4, "sawtooth", 320 * k, 210 * k, 0.1, 0.01);
            this.ruidoF(v, i * 0.17, 0.1, "bandpass", 700 * k, 500 * k, 4, 0.12);
          }
          break;
        case "galinha": // có-có-có… e o cocoricó curto
          for (let i = 0; i < 3; i++) this.tom(v, i * 0.09, 0.05, "triangle", 950 * k, 720 * k, 0.12, 0.003);
          this.tom(v, 0.3, 0.14 * dur, "triangle", 1150 * k, 620 * k, 0.12, 0.005);
          break;
        case "ovelha": { // béé: tremido (um LFO modulando o ganho)
          const o = v.ctx.createOscillator();
          o.type = "sawtooth";
          const t0 = v.t0;
          const t1 = t0 + 0.6 * dur;
          o.frequency.setValueAtTime(420 * k, t0);
          o.frequency.exponentialRampToValueAtTime(360 * k, t1);
          const f = v.ctx.createBiquadFilter();
          f.type = "bandpass";
          f.frequency.value = 1200;
          f.Q.value = 1.5;
          const g = v.ctx.createGain();
          g.gain.setValueAtTime(0, t0);
          g.gain.linearRampToValueAtTime(0.16, t0 + 0.05);
          g.gain.exponentialRampToValueAtTime(0.0001, t1);
          const lfo = v.ctx.createOscillator();
          lfo.frequency.value = 28;
          const prof = v.ctx.createGain();
          prof.gain.value = 0.07;
          lfo.connect(prof).connect(g.gain);
          o.connect(f).connect(g).connect(v.saida);
          o.start(t0);
          lfo.start(t0);
          o.stop(t1 + 0.02);
          lfo.stop(t1 + 0.02);
          break;
        }
        case "cachorro": // au-au: dois latidos curtos (um só no dano)
          for (let i = 0; i < (evento === "ambiente" ? 2 : 1); i++) {
            this.tom(v, i * 0.22, 0.11 * dur * 1.3, "sawtooth", 520 * k, 300 * k, 0.12, 0.004);
            this.ruidoF(v, i * 0.22, 0.08, "bandpass", 900 * k, 600 * k, 2, 0.14);
          }
          break;
        case "gato": // miau: sobe e desce, nasal
          this.tom(v, 0, 0.18 * dur, "sawtooth", 600 * k, 900 * k, 0.07, 0.03);
          this.tom(v, 0.18 * dur, 0.3 * dur, "sawtooth", 900 * k, 520 * k, 0.07, 0.01);
          break;
        case "tatu": // fungada curta: o tatu não "fala"
          this.ruidoF(v, 0, 0.12, "bandpass", 1800 * k, 1100 * k, 3, 0.1);
          this.ruidoF(v, 0.16, 0.1, "bandpass", 1600 * k, 1000 * k, 3, 0.08);
          break;
        case "peixe": // só o splash pequeno (dano/morte); peixe não tem voz
          this.ruidoF(v, 0, 0.15, "lowpass", 1800, 400, 0.8, 0.12);
          this.tom(v, 0.04, 0.06, "sine", 500 * k, 1100 * k, 0.07);
          break;
        case "arara": // grito rouco e agudo
          this.tom(v, 0, 0.22 * dur, "sawtooth", 1300 * k, 900 * k, 0.09, 0.01);
          this.ruidoF(v, 0, 0.2 * dur, "bandpass", 2200 * k, 1500 * k, 2, 0.1);
          break;
        case "passarinho": // trinado curto
          for (let i = 0; i < 3; i++) this.tom(v, i * 0.07, 0.05, "sine", 3000 * k, 3800 * k, 0.07, 0.003);
          break;
        default: // bicho sem voz conhecida: um resmungo neutro
          this.tom(v, 0, 0.3 * dur, "triangle", 300 * k, 200 * k, 0.12, 0.02);
      }
    });
  }

  // ------------------------------------------------------------ ambiente

  /** Laço contínuo de ruído filtrado (vento, riacho) — criado 1× e reusado. */
  private laco(filtro: BiquadFilterType, f: number, q: number): { fonte: AudioBufferSourceNode; filtro: BiquadFilterNode; ganho: GainNode } | null {
    const ctx = this.pronto();
    if (!ctx || !this.ruido || !this.ambienteBus) return null;
    const fonte = ctx.createBufferSource();
    fonte.buffer = this.ruido;
    fonte.loop = true;
    const fl = ctx.createBiquadFilter();
    fl.type = filtro;
    fl.frequency.value = f;
    fl.Q.value = q;
    const g = ctx.createGain();
    g.gain.value = 0;
    fonte.connect(fl).connect(g).connect(this.ambienteBus);
    fonte.start(0, Math.random());
    this.medidas.lacos++;
    return { fonte, filtro: fl, ganho: g };
  }

  private pararLacos(): void {
    for (const l of [this.vento, this.riacho]) {
      if (!l) continue;
      try {
        l.fonte.stop();
      } catch {
        /* já parou */
      }
      l.ganho.disconnect();
    }
    this.vento = null;
    this.riacho = null;
    this.medidas.lacos = 0;
  }

  /**
   * Um passo da máquina de estado do ambiente — o main chama ~1×/s. Ajusta os
   * laços pelo alvo (rampa de 1 s, sem degrau audível) e sorteia os disparos
   * raros. Nada aqui roda por frame.
   */
  ambiente(c: ContextoAmbiente): void {
    const a = performance.now();
    const ctx = this.pronto();
    if (!ctx || this.volAmbiente <= 0) {
      this.medidas.ms += performance.now() - a;
      return;
    }
    const t = ctx.currentTime;
    // a céu aberto pesa 1; em caverna, 0 (o vento é de FORA)
    const fora = Math.max(0, Math.min(1, (c.ceu - 4) / 10));
    // vento: sempre um sopro baixo a céu aberto, mais forte com a ventania
    const alvoVento = fora * (0.025 + c.vento * 0.11);
    if (alvoVento > 0.002 && !this.vento) this.vento = this.laco("lowpass", 500, 0.6);
    if (this.vento) {
      this.vento.ganho.gain.setTargetAtTime(alvoVento, t, 1);
      this.vento.filtro.frequency.setTargetAtTime(380 + c.vento * 900 + rnd(-80, 80), t, 1.5);
    }
    // riacho: água corrente perto (passa-faixa médio, "chiado molhado")
    const alvoRiacho = Math.min(1, c.aguaPerto / 12) * 0.08;
    if (alvoRiacho > 0.002 && !this.riacho) this.riacho = this.laco("bandpass", 1400, 0.9);
    if (this.riacho) {
      this.riacho.ganho.gain.setTargetAtTime(alvoRiacho, t, 0.8);
      this.riacho.filtro.frequency.setTargetAtTime(1200 + rnd(-200, 300), t, 0.5);
    }
    // abafado debaixo d'água (todo o mundo, não só o ambiente)
    this.abafar?.frequency.setTargetAtTime(c.submerso ? 550 : 20000, t, 0.08);

    // disparos raros, em direção sorteada (pássaro não tem posição no mundo)
    const ang = rnd(0, Math.PI * 2);
    const px = this.ox + Math.cos(ang) * 6;
    const pz = this.oz + Math.sin(ang) * 6;
    if (fora > 0.6 && c.dia > 0.55 && !c.submerso && t >= this.proxPassaro) {
      this.proxPassaro = t + rnd(5, 14);
      const v = this.voz("ambiente", 0.6, px, this.oy + 3, pz, "ambiente");
      if (v) {
        const n = 2 + Math.floor(rnd(0, 3));
        const base = rnd(2400, 3400);
        for (let i = 0; i < n; i++) this.tom(v, i * 0.11, 0.07, "sine", base, base * rnd(1.2, 1.5), 0.08, 0.004);
      }
    }
    if (fora > 0.6 && c.dia < 0.3 && !c.submerso && t >= this.proxGrilo) {
      this.proxGrilo = t + rnd(1.5, 4.5);
      const gravou = this.gravado("grilo", "ambiente", 0.22, 1, px, this.oy, pz, "ambiente");
      const v = gravou ? null : this.voz("ambiente", 0.4, px, this.oy, pz, "ambiente");
      if (v) {
        const f = rnd(4200, 4800);
        for (let i = 0; i < 6; i++) this.tom(v, i * 0.035, 0.018, "sine", f, f, 0.045, 0.002);
      }
    }
    if (fora < 0.15 && !c.submerso && t >= this.proxGota) {
      this.proxGota = t + rnd(6, 16);
      const v = this.voz("ambiente", 0.1, px, this.oy + 2, pz, "ambiente");
      if (v) this.tom(v, 0, 0.05, "sine", rnd(1600, 2100), 800, 0.08, 0.002);
    }
    this.medidas.ms += performance.now() - a;
  }

  /** O contexto foi (re)armado: liga os eventos de corpo do jogo. */
  ligarEventos(): void {
    onGameEvent((e) => {
      if (e.kind === "dano") this.dano();
      else if (e.kind === "morte") this.morte();
    });
  }
}

/** O som de mundo da página (um por aba, como o AudioContext). */
export const somMundo = new SomMundo();
somMundo.ligarEventos();

/**
 * §🐄 A ponte com os mobs (branch claude/project-thread-kqj92e): o main.ts de
 * lá reemite o `bicho_evento` do servidor como o CustomEvent "lj-bicho" com
 * `{ nome, evento, x, y, z }`. Escutar aqui deixa o som sem tocar no main de
 * ninguém. Dano e morte têm voz própria; o resto (ordenha, ovo, tosquia,
 * comeu, cria, domou, bola, "voz" periódica) é o bicho "falando".
 */
window.addEventListener("lj-bicho", (e) => {
  const d = (e as CustomEvent<{ nome?: unknown; evento?: unknown; x?: unknown; y?: unknown; z?: unknown }>).detail;
  if (!d || typeof d.nome !== "string" || typeof d.x !== "number" || typeof d.y !== "number" || typeof d.z !== "number") return;
  const ev = d.evento === "dano" || d.evento === "morte" ? d.evento : "ambiente";
  somMundo.somDeBicho(d.nome, ev, d.x, d.y, d.z);
});

/** Volumes do menu (0..1). Valem já; antes do 1º gesto ficam guardados e os
 *  barramentos nascem com eles. */
export function setVolumesMundo(mundo: number, ambiente: number): void {
  somMundo.setVolumes(mundo, ambiente);
}

/**
 * §🐄 O gancho, exportado solto pra quem faz os mobs não precisar conhecer a
 * classe: `somDeBicho("vaca", "ambiente", x, y, z)`.
 */
export function somDeBicho(tipo: string, evento: EventoDeBicho, x: number, y: number, z: number): void {
  somMundo.somDeBicho(tipo, evento, x, y, z);
}
