import * as THREE from "three";
import { AGUA_FRAMES, animarAguaAtlas, createAtlasTexture } from "./atlasTexture";
import { type LuzUniforms, aplicarLuz, criarLuzUniforms } from "./luzShader";
import { type BalancoUniforms, type VentoCliente, aplicarBalanco, criarBalancoUniforms } from "./vento";

/**
 * §🎨 Os TRÊS materiais do chunk — e o relógio que os anima.
 *
 * O que estava solto no `startGame`: o atlas, os três materiais, os uniforms do
 * balanço (§🌬️) e da luz voxel (§💡), e os quatro `let` da animação da água.
 * Estavam separados por 200 linhas, mas são uma coisa só: o loop de render
 * mexia em SEIS pontos que só existem porque estes materiais existem.
 *
 * A regra que dá sentido ao conjunto — e que se quebra em silêncio se alguém
 * reordenar o construtor: **`aplicarBalanco` vem ANTES de `aplicarLuz`**. Os
 * dois enxertam `onBeforeCompile`, o three guarda UM só, e `aplicarLuz`
 * encadeia o que já estiver lá. Na ordem trocada o vento some sem erro nenhum.
 *
 * Este é o único ponto do cliente que mistura RELÓGIO com MATERIAL, e é por
 * isso que ele é uma classe: os quatro campos de animação da água não são
 * config, são estado de um frame pro outro.
 */
export class MateriaisMundo {
  /** Textura do atlas — o canvas é repintado pela animação da água. */
  readonly atlas: THREE.Texture;
  /** alphaTest = cutout dos transparentes (vidro/folhas): pixel opaco ou
   *  descartado — sem blending, sem sorting, mesmo draw call por chunk (cp18) */
  readonly opaco: THREE.MeshLambertMaterial;
  /** água (2026-07-22): material SEPARADO, transparente DE VERDADE (blend) — sem
   *  os furos xadrez. Mesma textura do atlas (as UVs do tile da água batem).
   *  depthWrite:false = várias faces de água blendam sem brigar pelo z-buffer;
   *  renderiza no passe de transparência do three (grupo próprio do mesh do chunk). */
  readonly agua: THREE.MeshLambertMaterial;
  /** vidro colorido (2026-07-25): material PRÓPRIO, blend de verdade — o tile do
   *  atlas é a cor CHEIA (ícone da hotbar sai sólido) e a translucidez vem daqui.
   *  (Antes era dither cutout no atlas — ficou "tela de mosquiteiro", rejeitado
   *  no playtest.) 0.4 = cor bem legível, ainda dá pra ver através; calibrado no
   *  playtest de 2026-07-25 (0.2 ficou fraco). depthWrite:false igual à água. */
  readonly vidro: THREE.MeshLambertMaterial;

  /** §🌬️ balanço no vento: folhas, flores e grama alta vergam no vertex shader
   *  do material OPACO (só ele — água e vidro não têm vegetação). */
  private readonly balanco: BalancoUniforms = criarBalancoUniforms();
  /** §💡 luz voxel nos TRÊS materiais do chunk. */
  private readonly luz: LuzUniforms = criarLuzUniforms();

  private aguaQuadroParada = -1;
  /** Relógio da água CORRENTE — independente do vento (8 fps fixos). Serve
   *  também de relógio do TETO de repintura (ver `atualizar`). */
  private aguaFluxoRelogio = 0;
  private aguaQuadroFluxo = -1;
  private aguaUltimaPintura = -1;

  constructor() {
    this.atlas = createAtlasTexture();
    this.opaco = new THREE.MeshLambertMaterial({ map: this.atlas, alphaTest: 0.5 });
    this.agua = new THREE.MeshLambertMaterial({
      map: this.atlas,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    this.vidro = new THREE.MeshLambertMaterial({
      map: this.atlas,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    // ORDEM: balanço primeiro, luz depois — ver o bloco no topo da classe.
    // Trocar as duas linhas NÃO dá erro de shader: o `shots:luz` é quem pega
    // (A/B da sessão 52 — a razão noite/dia salta de 0,35 pra 0,74).
    aplicarBalanco(this.opaco, this.balanco);
    aplicarLuz(this.opaco, this.luz);
    aplicarLuz(this.agua, this.luz);
    aplicarLuz(this.vidro, this.luz);
  }

  /** Os três materiais na ORDEM que o `ChunkRenderer` espera (opaco, água, vidro)
   *  — é a mesma ordem dos grupos que o mesher emite. */
  get paraChunks(): [THREE.Material, THREE.Material, THREE.Material] {
    return [this.opaco, this.agua, this.vidro];
  }

  /** O canvas do atlas — a hotbar recorta os ícones dele, e o `?atlas` o pendura
   *  na tela pra inspeção visual. */
  get canvas(): HTMLCanvasElement {
    return this.atlas.image as HTMLCanvasElement;
  }

  /**
   * Um frame. `nivelCeu` vem do ciclo dia/noite e `vento` do §🌬️.
   *
   * Três coisas, e nenhuma delas custa geometria: o vento nos uniforms do
   * balanço, a hora no canal CÉU da luz voxel (a tocha não obedece a ela) e os
   * dois relógios da água.
   *
   * `balanco` desligado = força 0 — o `if` do shader sai fora sem recompilar
   * nada (é config de DESEMPENHO, e recompilar shader no meio da aula seria pior
   * que o efeito).
   */
  atualizar(dt: number, vento: VentoCliente, nivelCeu: number, balanco: boolean): void {
    // a fase vira radianos aqui, uma vez por frame
    this.balanco.ventoTempo.value = vento.fase * Math.PI * 2;
    this.balanco.ventoDir.value.set(vento.x, vento.z);
    this.balanco.ventoForca.value = balanco ? vento.forca : 0;
    // Um uniform por frame — nada de remesh: escurecer o mundo à noite não pode
    // custar geometria nova.
    this.luz.nivelCeu.value = nivelCeu;
    // DOIS relógios (playtest 2026-07-27): a água PARADA anda no ritmo e no rumo
    // do vento; a CORRENTE anda no ritmo dela (8 fps fixos), no rumo do próprio
    // fluxo — vento não manda em correnteza. Quem decide qual tile cada bloco usa
    // é o mesher; aqui só se toca os dois relógios.
    const quadroParada = Math.floor(vento.fase * AGUA_FRAMES) % AGUA_FRAMES;
    this.aguaFluxoRelogio += dt;
    const quadroFluxo = Math.floor(this.aguaFluxoRelogio * 8) % AGUA_FRAMES;
    // TETO de 12 repinturas/s: cada uma reenvia o atlas INTEIRO (256², 262 KB) à
    // GPU, e com dois relógios independentes a UNIÃO dos dois passaria de 20/s
    // sem o teto. 12/s já não se distingue a olho e devolve metade do upload na
    // GPU do laboratório. Sem repintura nenhuma quando os dois quadros param.
    if (
      (quadroParada !== this.aguaQuadroParada || quadroFluxo !== this.aguaQuadroFluxo) &&
      this.aguaFluxoRelogio - this.aguaUltimaPintura >= 1 / 12
    ) {
      this.aguaUltimaPintura = this.aguaFluxoRelogio;
      this.aguaQuadroParada = quadroParada;
      this.aguaQuadroFluxo = quadroFluxo;
      animarAguaAtlas(this.atlas, quadroParada, vento.ondaAgua, quadroFluxo);
    }
  }
}
