/**
 * §🎮 O que o CONTROLE do jogador lembra de um frame pro outro.
 *
 * São quatro regras que o laço de render aplicava com oito `let` soltos, e as
 * quatro têm o mesmo defeito de nascença: **erram calado**. Trocar a ordem de
 * uma leitura com a escrita, ou um `<` por um `<=`, muda a SENSAÇÃO do controle
 * e não quebra nada que compila — nenhum print pega, só jogando.
 *
 * As regras:
 *
 * 1. **Corrida por duplo-toque no andar.** Dois toques no W dentro da janela
 *    ENGATAM a corrida, e ela fica engatada até soltar a tecla — soltar o Ctrl
 *    segurando o W não desengata (é por isso que o FOV segue `player.sprinting`
 *    e não a tecla).
 * 2. **Voo por duplo-toque no pular.** O mesmo detector, mas o consumo é EVENTO
 *    e não trava: alterna uma vez e pronto.
 * 3. **Olho abaixa agachado**, com transição exponencial.
 * 4. **Degrau suave.** A FÍSICA sobe a laje/escada de uma vez — tem de ser
 *    assim, o servidor valida a mesma simulação. Quem suaviza é o OLHO: guarda
 *    quanto da subida ainda falta "alcançar" e desconta da câmera.
 *
 * Mora no `shared/` pela mesma razão que o `FreioDePose` (§📡): **aqui há onde
 * rodar teste.** Os dois decaimentos são `exp(-dt·k)` justamente pra não
 * depender do FPS — e essa é a propriedade que mais importa neste projeto, onde
 * o alvo de campo é um Kindle Fire: um `1 - dt·k` no lugar compila, parece igual
 * a 60 fps e fica pesado a 20.
 */

import { PLAYER, STEP_HEIGHT } from "./physics";

/** Silêncio máximo entre os dois toques do duplo-toque (ms). */
export const JANELA_DUPLO_TOQUE_MS = 300;

/**
 * Detector de duplo-toque numa tecla, por BORDA de subida.
 *
 * `bateu` devolve `true` só no frame do segundo toque dentro da janela.
 * Segurar a tecla não repete: o que conta é a transição solta→apertada.
 *
 * O relógio do último toque é anotado em TODA borda de subida, inclusive na que
 * já contou como duplo — três toques seguidos batem DUAS vezes, e é o que o
 * código do laço fazia. Mantido de propósito: mudar isso é mudar o controle.
 */
export class DuploToque {
  private apertadaAntes = false;
  /** `-Infinity` e não `0`: com `0`, um jogo aberto nos primeiros 300 ms de
   *  `performance.now()` contaria o PRIMEIRO toque como duplo. */
  private ultimoEm = Number.NEGATIVE_INFINITY;

  /** @param agora Relógio monotônico em ms (`performance.now()` no cliente). */
  bateu(apertada: boolean, agora: number): boolean {
    const subiu = apertada && !this.apertadaAntes;
    this.apertadaAntes = apertada;
    if (!subiu) return false;
    const duplo = agora - this.ultimoEm < JANELA_DUPLO_TOQUE_MS;
    this.ultimoEm = agora;
    return duplo;
  }
}

/** O que o olho precisa saber do frame que acabou de ser simulado. */
export interface EstadoDoOlho {
  /** Tecla de agachar apertada. */
  agachado: boolean;
  /** Voando de verdade (voo ligado E permitido). */
  voando: boolean;
  /** `player.onGround` DEPOIS do passo. */
  noChao: boolean;
  /** Quanto o passo subiu neste frame, em blocos (`pos.y` depois − antes). */
  subiu: number;
}

/**
 * O estado de controle do jogador entre frames: as duas travas de duplo-toque
 * e a altura da câmera.
 *
 * Não guarda nada do MUNDO — quem simula é o `stepPlayer`. Aqui só mora o que
 * um frame precisa lembrar do anterior.
 */
export class ControleDoJogador {
  private readonly andar = new DuploToque();
  private readonly pular = new DuploToque();
  private corridaEngatada = false;
  private olho = PLAYER.eyeHeight;
  private degrau = 0;

  /**
   * Corrida ENGATADA neste frame.
   *
   * A ordem importa e é a do laço antigo: o duplo-toque engata, e soltar a
   * tecla desengata **no mesmo frame em que soltou**. Inverter as duas linhas
   * faria o toque de engate morrer no frame seguinte.
   */
  correndo(andando: boolean, agora: number): boolean {
    if (this.andar.bateu(andando, agora)) this.corridaEngatada = true;
    if (!andando) this.corridaEngatada = false;
    return this.corridaEngatada;
  }

  /**
   * `true` só no frame em que o voo deve ALTERNAR.
   *
   * Quem decide se pode voar é o chamador — de propósito: o relógio do toque é
   * anotado mesmo para quem não pode voar (era o que o laço fazia), então
   * liberar o voo no meio de um duplo-toque não herda um toque velho.
   */
  alternarVoo(pulando: boolean, agora: number): boolean {
    return this.pular.bateu(pulando, agora);
  }

  /**
   * Avança olho e degrau um frame e devolve a altura da câmera acima de
   * `player.pos.y`.
   *
   * Os dois decaimentos são exponenciais no `dt` — independem do FPS.
   */
  avancarOlho(dt: number, e: EstadoDoOlho): number {
    // só step-up conta: no chão, sem voar, e dentro da altura de um degrau.
    // A folga de 0,01 nas duas pontas é o que separa "subiu a laje" de "pulou"
    // e de "teleportou" — sem o teto, um respawn viraria uma câmera que sobe
    // sozinha por meio segundo.
    if (e.noChao && !e.voando && e.subiu > 0.01 && e.subiu <= STEP_HEIGHT + 0.01) {
      this.degrau = Math.min(this.degrau + e.subiu, STEP_HEIGHT);
    }
    this.degrau *= Math.exp(-dt * 14);
    if (this.degrau < 0.002) this.degrau = 0;
    const k = 1 - Math.exp(-dt * 20);
    const alvo = e.agachado && !e.voando ? PLAYER.sneakEyeHeight : PLAYER.eyeHeight;
    this.olho += (alvo - this.olho) * k;
    return this.alturaOlho;
  }

  /** Altura da câmera acima de `player.pos.y`, já com o desconto do degrau. */
  get alturaOlho(): number {
    return this.olho - this.degrau;
  }
}
