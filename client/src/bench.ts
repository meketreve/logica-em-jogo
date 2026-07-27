/**
 * Modo BENCHMARK (`?bench`) — §📊 item 1 do backlog do perfilador.
 *
 * **O problema que ele resolve:** a política de otimização deste projeto manda
 * medir no PC do LABORATÓRIO antes de otimizar, mas até aqui comparar duas
 * máquinas dependia de a pessoa voar igual nas duas — e não voa. Um perfil
 * tirado parado num vale e outro voando sobre a serra não são comparáveis.
 *
 * **O que este modo faz:** com `?bench` na URL o jogo entra sozinho num mundo de
 * seed FIXA, teleporta pra uma coordenada FIXA, percorre um trajeto FIXO por
 * `duracaoS` segundos e baixa o JSON do perfil no fim. Zero interação: o
 * professor abre o link no PC do lab e manda o arquivo.
 *
 * **Por que a posição vem do TEMPO e não da física:** o trajeto é `pos = f(t)`,
 * não integração por frame. Um PC a 20 FPS e outro a 60 percorrem exatamente o
 * mesmo caminho no mesmo tempo — se fosse `pos += v·dt` com colisão, a máquina
 * lenta veria menos terreno e ganharia um FPS melhor de graça. O jogador do
 * bench é um observador: sem física, sem colisão, sem gravidade.
 *
 * O trajeto tem duas partes, medindo custos diferentes:
 * 1. **voo** (75% do tempo) — uma volta de círculo em altitude fixa: terreno
 *    novo entrando o tempo todo = streaming + mesher + render;
 * 2. **giro** (25%) — parado no ponto inicial girando 360°: só render, sem
 *    coluna nova. A diferença entre as duas fases separa "carregar" de "desenhar".
 */

/** Seed do mundo do bench. Fixa e escrita aqui: mudar isto invalida a
 *  comparação com todo perfil já colhido — trate como número de série. */
export const BENCH_SEED = 20260726;
/** Duração padrão (s). `?bench=60` alonga; abaixo de 10 s a amostra não presta. */
export const BENCH_DURACAO_S = 30;
/** Fração do tempo voando (o resto é o giro parado). */
const FRACAO_VOO = 0.75;
/** Altura do voo acima do spawn — alto o bastante pra ver muito chunk de uma vez. */
const ALTURA_ACIMA_DO_SPAWN = 24;
/** Raio do círculo (blocos), limitado pelas bordas do mundo. */
const RAIO_ALVO = 96;
/**
 * Velocidade do voo (blocos/s). FIXA de propósito, em vez de "uma volta no
 * tempo disponível": é ela que define quanto terreno novo entra por segundo, e
 * portanto quanto o streaming e o mesher têm que trabalhar. Se derivasse da
 * duração, `?bench=60` viraria um teste mais leve que `?bench=30` — dois
 * números que ninguém poderia comparar. ~18 b/s é voo apressado, acima do
 * andar (≈5) e na faixa em que o streaming ainda acompanha.
 */
const VELOCIDADE = 18;
/** Inclinação da câmera (rad): olhando um pouco pra baixo, como quem sobrevoa. */
const PITCH = -0.25;

export interface BenchTrajeto {
  centroX: number;
  centroZ: number;
  y: number;
  raio: number;
}

export interface BenchAmostra {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  fase: "voo" | "giro";
  /** Segundos desde o início do trajeto. */
  t: number;
}

/**
 * Config canônica do bench: comparar dois PCs exige a MESMA config, e config
 * mora no localStorage de cada navegador (o do lab pode ter qualquer coisa).
 * Estes valores sobrescrevem os salvos enquanto o bench roda — sem gravar nada.
 */
export const BENCH_SETTINGS = {
  raioRender: 6,
  meshMsPorFrame: 6,
  pixelRatioCap: 1, // DPR do lab é 1; travar aqui iguala a contagem de pixels
  fov: 75,
  // §🌬️ (2026-07-27): vida ambiental LIGADA no bench. É custo de GPU novo em
  // cima de uma GPU que já fecha o p95 no limite — perfil que a desliga não
  // mede o jogo que o aluno joga. Quem quiser o A/B desliga em Configurações e
  // grava um segundo perfil (o par com/sem, mesma régua do `?semworker`).
  nuvens: true,
  balanco: true,
} as const;

/** Lê `?bench` / `?bench=45`. `null` = modo desligado. */
export function benchDaUrl(params: URLSearchParams): { duracaoS: number } | null {
  if (!params.has("bench")) return null;
  const bruto = Number(params.get("bench"));
  const duracaoS = Number.isFinite(bruto) && bruto >= 10 ? Math.min(bruto, 300) : BENCH_DURACAO_S;
  return { duracaoS };
}

export class Bench {
  private t0 = 0;
  private rodando = false;

  constructor(
    readonly duracaoS: number,
    readonly trajeto: BenchTrajeto,
  ) {}

  /**
   * Monta o trajeto a partir do mundo: círculo centrado no spawn, com raio
   * cortado pelas bordas (mundo P tem 128 blocos de lado — um círculo de 96
   * sairia dele). Determinístico: mesmo mundo = mesmo trajeto.
   */
  static paraMundo(
    duracaoS: number,
    spawn: { x: number; y: number; z: number },
    dims: { x: number; z: number },
  ): Bench {
    const largura = Math.min(dims.x, dims.z) * 16;
    // margem de 16 blocos pra borda: o trajeto nunca encosta no limite do mundo
    const raio = Math.max(16, Math.min(RAIO_ALVO, largura / 2 - 16));
    // centro puxado pra dentro do mundo se o spawn estiver perto da borda
    const dentro = (v: number, max: number): number =>
      Math.min(Math.max(v, raio + 8), Math.max(raio + 8, max * 16 - raio - 8));
    return new Bench(duracaoS, {
      centroX: +dentro(spawn.x, dims.x).toFixed(2),
      centroZ: +dentro(spawn.z, dims.z).toFixed(2),
      y: +(spawn.y + ALTURA_ACIMA_DO_SPAWN).toFixed(2),
      raio: +raio.toFixed(2),
    });
  }

  get ativo(): boolean {
    return this.rodando;
  }

  iniciar(agora: number): void {
    this.t0 = agora;
    this.rodando = true;
  }

  terminou(agora: number): boolean {
    return this.rodando && (agora - this.t0) / 1000 >= this.duracaoS;
  }

  parar(): void {
    this.rodando = false;
  }

  /** Ponto do círculo no instante `t` de voo (arco a VELOCIDADE fixa). */
  private pontoDoVoo(t: number): { x: number; z: number; yaw: number } {
    const { centroX, centroZ, raio } = this.trajeto;
    const ang = (VELOCIDADE * t) / raio;
    // tangente = sentido do movimento: é o que faz terreno NOVO entrar na tela
    const vx = -Math.sin(ang);
    const vz = Math.cos(ang);
    return {
      x: centroX + Math.cos(ang) * raio,
      z: centroZ + Math.sin(ang) * raio,
      yaw: Math.atan2(-vx, -vz),
    };
  }

  /** Onde o observador está no instante `agora` — função pura do tempo. */
  amostra(agora: number): BenchAmostra {
    const t = Math.min((agora - this.t0) / 1000, this.duracaoS);
    const tVoo = this.duracaoS * FRACAO_VOO;
    if (t < tVoo) {
      const p = this.pontoDoVoo(t);
      return { x: p.x, y: this.trajeto.y, z: p.z, yaw: p.yaw, pitch: PITCH, fase: "voo", t: +t.toFixed(2) };
    }
    // giro parado ONDE O VOO PAROU (não no início do círculo): voltar pro ponto
    // de partida seria um teleporte de ~150 blocos bem na virada de fase — uma
    // rajada de streaming que não é nem voo nem giro, e sujaria as duas medidas
    const p = this.pontoDoVoo(tVoo);
    const giro = ((t - tVoo) / (this.duracaoS - tVoo)) * Math.PI * 2;
    return {
      x: p.x,
      y: this.trajeto.y,
      z: p.z,
      yaw: p.yaw + giro,
      pitch: PITCH,
      fase: "giro",
      t: +t.toFixed(2),
    };
  }

  /** O que vai no JSON: sem isto ninguém sabe se dois perfis rodaram o MESMO
   *  trajeto (e comparar trajetos diferentes é o erro que este modo evita). */
  meta(): Record<string, unknown> {
    return {
      versaoTrajeto: 1, // some quando o trajeto mudar — perfis de versões ≠ não comparam
      duracaoS: this.duracaoS,
      seed: BENCH_SEED,
      trajeto: {
        ...this.trajeto,
        fracaoVoo: FRACAO_VOO,
        velocidadeBlocosS: VELOCIDADE,
        pitch: PITCH,
      },
      config: { ...BENCH_SETTINGS },
      viewport: `${window.innerWidth}×${window.innerHeight}`,
      dpr: window.devicePixelRatio,
    };
  }
}
