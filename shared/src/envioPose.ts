/**
 * §📡 Quando a posição do jogador vai pro servidor.
 *
 * A regra é uma frase — **manda quando muda; parado, vira heartbeat 1×/2 s** —
 * e o número que ela existe pra proteger é da LAN da escola: o cliente acorda a
 * `SERVER_TICK_RATE` (10×/s), então **20 alunos parados custariam ~200 msg/s de
 * subida** só repetindo a mesma pose. Com o freio, ~10.
 *
 * O heartbeat não é enfeite: sem ele o servidor não distingue "parado" de
 * "sumiu", e a presença do aluno na lista dependeria de ele se mexer.
 *
 * Mora no `shared/` e não no cliente por uma razão só: aqui há onde rodar
 * teste. É a política inteira em duas comparações, e as duas erram calado — um
 * `>=` no lugar do `>` no relógio dobraria o tráfego de uma turma parada sem
 * mudar nada na tela.
 */

/** Posição + olhar, como vão no `move` do protocolo. */
export interface Pose {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

/** Silêncio máximo entre dois `move` do mesmo jogador (ms). */
export const IDLE_HEARTBEAT_MS = 2000;

/**
 * O freio, com a última pose enviada e o relógio dela.
 *
 * `aEnviar` REGISTRA o envio quando devolve `true` — quem chama tem de mandar
 * de fato. Foi feito assim de propósito: separar "decidir" de "anotar" daria
 * duas chamadas que precisam andar em par, e esquecer a segunda é um cliente
 * que manda 10×/s parado (o defeito que esta classe existe pra impedir).
 */
export class FreioDePose {
  /** `NaN` em tudo: a primeira pose SEMPRE difere, então o primeiro `move` sai
   *  na hora — o servidor não pode esperar 2 s pra saber onde o aluno nasceu. */
  private ultima: Pose = { x: NaN, y: NaN, z: NaN, yaw: NaN, pitch: NaN };
  private ultimaEm = Number.NEGATIVE_INFINITY;

  /** @param agora Relógio monotônico em ms (`performance.now()` no cliente). */
  aEnviar(cur: Pose, agora: number): boolean {
    const mudou =
      cur.x !== this.ultima.x ||
      cur.y !== this.ultima.y ||
      cur.z !== this.ultima.z ||
      cur.yaw !== this.ultima.yaw ||
      cur.pitch !== this.ultima.pitch;
    if (!mudou && agora - this.ultimaEm < IDLE_HEARTBEAT_MS) return false;
    this.ultima = { ...cur };
    this.ultimaEm = agora;
    return true;
  }
}
