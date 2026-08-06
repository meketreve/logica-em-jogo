/**
 * §🎮 O movimento do jogador local, do teclado até a altura da câmera.
 *
 * O laço de render carregava onze `let` só pra isto: `sprintLatch`,
 * `forwardWasDown`, `lastForwardTap`, `jumpWasDown`, `lastJumpTap`, `eyeHeight`,
 * `stepSuave` e `posAnt{X,Y,Z}` — todos estados de um frame pro outro, todos
 * lidos e escritos em pontos diferentes do mesmo laço.
 *
 * A parte que é REGRA (os dois duplo-toques e as duas transições da câmera) não
 * mora aqui: subiu pro `shared/src/controleJogador.ts`, onde há onde rodar
 * teste. O que sobrou aqui é o que só existe no cliente — ler o teclado com o
 * mapa de teclas do jogador — e o **odômetro**, que é do perfil.
 *
 * ⚠️ `settings` é REASSINADO quando o menu muda a configuração (a armadilha que
 * o `ColunasFaltando` documentou): as teclas chegam por callback, nunca por
 * referência guardada no construtor.
 */

import { ControleDoJogador, type PlayerState } from "@logica/shared";
import type { Input } from "./input";
import type { KeyAction } from "./settings";

/** O que o `stepPlayer` precisa saber do frame, mais o voo cru. */
export interface ComandoDeMovimento {
  forward: number;
  strafe: number;
  jump: boolean;
  yaw: number;
  sprint: boolean;
  sneak: boolean;
  /** Voo EFETIVO: ligado E permitido — é este que a física lê. */
  fly: boolean;
  /** Voo LIGADO. Fica ligado mesmo sem permissão; quem zera é o `voo` do servidor. */
  voando: boolean;
}

export class MovimentoDoJogador {
  private readonly controle = new ControleDoJogador();
  private antX = 0;
  private antY = 0;
  private antZ = 0;
  private distancia = 0;

  constructor(
    private readonly input: Input,
    private readonly lerTeclas: () => Record<KeyAction, string>,
  ) {}

  /**
   * Fixa a âncora do odômetro sem contar o salto.
   *
   * Usada no spawn e antes do trajeto do `?bench`: o pulo do spawn até a borda
   * do círculo não é distância percorrida, e sem isto ele entraria no perfil.
   */
  ancorar(pos: { x: number; y: number; z: number }): void {
    this.antX = pos.x;
    this.antY = pos.y;
    this.antZ = pos.z;
  }

  /**
   * Lê o teclado e devolve o comando do frame.
   *
   * `voando` entra e sai porque o voo é estado de MÓDULO no `main.ts` — o
   * servidor o desliga de fora (msg `voo`), então quem o guarda tem de estar
   * onde a mensagem chega.
   */
  comando(agora: number, ctx: { voando: boolean; podeVoar: boolean }): ComandoDeMovimento {
    const { input } = this;
    const k = this.lerTeclas();
    const ativo = input.active;
    const frente = ativo && input.down(k.forward);
    const forward = ativo ? (frente ? 1 : 0) - (input.down(k.back) ? 1 : 0) : 0;
    const strafe = ativo
      ? (input.down(k.right) ? 1 : 0) - (input.down(k.left) ? 1 : 0)
      : 0;
    const jump = ativo && input.down(k.jump);
    const sneak = ativo && input.down(k.agachar);

    // corrida ENGATADA (duplo-toque) ou tecla de correr segurada
    const engatada = this.controle.correndo(frente, agora);
    const sprint = forward > 0 && !sneak && (engatada || (ativo && input.down(k.correr)));

    // duplo-toque no pular alterna o voo. O relógio do toque é anotado mesmo
    // pra quem não pode voar — é o que o laço fazia.
    let voando = ctx.voando;
    if (this.controle.alternarVoo(jump, agora) && ctx.podeVoar) voando = !voando;

    return { forward, strafe, jump, yaw: input.yaw, sprint, sneak, fly: voando && ctx.podeVoar, voando };
  }

  /**
   * Depois do passo: acumula o odômetro e avança o olho.
   *
   * Tem de rodar ANTES de qualquer teleporte do frame (respawn, `/tp`): a
   * subida do degrau é medida contra o `y` de antes do passo, e um teleporte no
   * meio viraria "degrau" de 40 blocos.
   */
  aposOPasso(dt: number, player: PlayerState, yAntesDoPasso: number, cmd: ComandoDeMovimento): void {
    this.controle.avancarOlho(dt, {
      agachado: cmd.sneak,
      voando: cmd.fly,
      noChao: player.onGround,
      subiu: player.pos.y - yAntesDoPasso,
    });
    // distância do frame (escalares, sem alocar): o perfil precisa saber se a
    // gravação foi voando ou parado — a taxa de rede sozinha engana
    this.distancia += Math.hypot(
      player.pos.x - this.antX,
      player.pos.y - this.antY,
      player.pos.z - this.antZ,
    );
    this.ancorar(player.pos);
  }

  /** Altura da câmera acima de `player.pos.y` (olho − degrau pendente). */
  get alturaOlho(): number {
    return this.controle.alturaOlho;
  }

  /** Blocos andados desde o boot — só o perfil usa. */
  get distanciaTotal(): number {
    return this.distancia;
  }
}
