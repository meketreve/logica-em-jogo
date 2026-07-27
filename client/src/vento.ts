import * as THREE from "three";
import { ondaAguaDoVento } from "@logica/shared";

/**
 * Vento do lado do CLIENTE (§🌬️, 2026-07-27). O servidor manda `dir`/`forca`
 * 1×/s (msg `vento`); aqui o valor é SUAVIZADO por frame — mesma ideia do
 * SkyCycle interpolando o céu entre as sincronizações de hora. Sem isso o vento
 * andaria em degraus de 1 s e a água/nuvem daria um pulinho por segundo.
 *
 * Quem consome: a correnteza do tile da água (atlasTexture), o scroll das nuvens
 * (daynight) e o balanço de folhas/grama (`aplicarBalanco`, no fim do arquivo).
 * É SÓ visual — nada aqui toca física, colisão ou rede.
 */

const TAU = Math.PI * 2;

/** Constante de tempo da suavização (1/s). 2 = alcança o alvo em ~0,5 s: o giro
 *  do vento é lento (1,2°/s), então isto some visualmente e só mata o degrau. */
const SUAVIZACAO = 2;

export class VentoCliente {
  /** Direção suavizada, em radianos [0, 2π). */
  dir = 0;
  /** Força suavizada em [0,1]. */
  forca = 0;
  /** O vento está ligado no servidor? (só leitura de F3/HUD) */
  ativo = false;
  /**
   * Fase acumulada da animação, em "voltas". Anda MAIS RÁPIDO com vento forte e
   * NUNCA volta atrás — quem anima (água, nuvem, folha) lê daqui em vez de somar
   * dt por conta própria, senão cada sistema andaria numa velocidade diferente.
   */
  fase = 0;

  private alvoDir = 0;
  private alvoForca = 0;

  /** Sincroniza com o vento autoritativo do servidor (msg `vento`, 1×/s). */
  sync(dir: number, forca: number, ativo: boolean): void {
    if (Number.isFinite(dir)) this.alvoDir = ((dir % TAU) + TAU) % TAU;
    if (Number.isFinite(forca)) this.alvoForca = Math.min(1, Math.max(0, forca));
    this.ativo = ativo;
  }

  /** Um frame. `dt` em segundos. */
  update(dt: number): void {
    const k = 1 - Math.exp(-dt * SUAVIZACAO);
    // ângulo pelo arco CURTO: sem isto, ir de 350° a 10° daria uma volta inteira
    let d = this.alvoDir - this.dir;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    this.dir = (this.dir + d * k + TAU) % TAU;
    this.forca += (this.alvoForca - this.forca) * k;
    // piso na calmaria: a água ainda respira com o vento desligado (tile parado
    // lê como "gelo", não como água). 0,35..0,75 voltas/s × AGUA_FRAMES = 5,6 a
    // 12 repinturas/s — na vizinhança dos 8 fps fixos de antes, e a diferença
    // entre calmaria e ventania (2,1×) dá pra ver.
    this.fase += dt * (0.35 + this.forca * 0.4);
  }

  /** Componente x do vetor unitário do vento (mundo). */
  get x(): number {
    return Math.cos(this.dir);
  }

  /** Componente z do vetor unitário do vento (mundo). */
  get z(): number {
    return Math.sin(this.dir);
  }

  /** Setor de 0..7 da direção atual (leste, sudeste, sul, …). */
  get setor(): number {
    return Math.floor(this.dir / (TAU / 8)) % 8;
  }

  /** Par de vetores de onda da água + a mistura entre eles (a tabela e o PORQUÊ
   *  dos sinais moram em shared/vento.ts — é convenção de UV do mesher). */
  get ondaAgua(): { a: readonly [number, number]; b: readonly [number, number]; mistura: number } {
    return ondaAguaDoVento(this.dir);
  }
}

/** Uniforms do balanço, compartilhados pelo material do terreno. */
export interface BalancoUniforms {
  ventoTempo: { value: number };
  ventoDir: { value: THREE.Vector2 };
  ventoForca: { value: number };
}

/**
 * Enxerta o balanço de vento no material do terreno (§🌬️, frentes 5 e 6).
 *
 * `onBeforeCompile` em vez de ShaderMaterial próprio: o material continua sendo
 * um MeshLambertMaterial de verdade — luz, névoa, cutout e sombra do three
 * seguem funcionando, e o enxerto é só um deslocamento em `begin_vertex`.
 *
 * O que desloca: o atributo `sway` do mesher (0 = rígido, folha ~0,34, planta 1).
 * Custo: alguns senos POR VÉRTICE, e só os chunks com folhagem têm sway > 0 —
 * mas o `if` roda em todo vértice do terreno, então a conta é deliberadamente
 * curta. (A GPU do notebook do lab está no teto; ver settings.balanco.)
 *
 * A frequência ESPACIAL é baixa de propósito (0,16/bloco): dois blocos de folha
 * vizinhos precisam se deslocar quase igual, senão a copa abre fresta entre os
 * cubos. A 0,16 rad de diferença o desencontro fica em ~0,2 px na tela.
 */
export function aplicarBalanco(
  material: THREE.Material,
  uniforms: BalancoUniforms,
): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms["ventoTempo"] = uniforms.ventoTempo;
    shader.uniforms["ventoDir"] = uniforms.ventoDir;
    shader.uniforms["ventoForca"] = uniforms.ventoForca;
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute float sway;
uniform float ventoTempo;
uniform vec2 ventoDir;
uniform float ventoForca;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
if (sway > 0.0 && ventoForca > 0.0) {
  vec3 mundoPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
  float p = mundoPos.x * 0.16 + mundoPos.z * 0.13;
  float onda = sin(ventoTempo * 0.34 + p) * 0.65
             + sin(ventoTempo * 0.55 + p * 1.7) * 0.35;
  transformed.xz += ventoDir * (onda * sway * ventoForca * 0.22);
}`,
      );
  };
  material.needsUpdate = true;
}

/** Uniforms zerados (chamar antes de `aplicarBalanco`). */
export function criarBalancoUniforms(): BalancoUniforms {
  return {
    ventoTempo: { value: 0 },
    ventoDir: { value: new THREE.Vector2(1, 0) },
    ventoForca: { value: 0 },
  };
}
