import * as THREE from "three";

/**
 * §💡 O lado GPU da luz voxel (2026-07-28).
 *
 * O mesher põe 1 byte por vértice no atributo `luz` (`(ceu << 4) | bloco`, ver
 * `shared/src/luz.ts`). Aqui esse byte vira um multiplicador de brilho no
 * fragment shader. Os dois canais são separados de propósito:
 *
 * - **céu** escala com a HORA (`nivelCeu`) — de dia a superfície é 1, de noite
 *   cai pro piso de luar. É o canal que faz a caverna existir: ela está em 0 e
 *   continua em 0 o dia inteiro.
 * - **bloco** (tocha) NÃO escala com a hora. Caverna acesa às 3 da manhã
 *   continua acesa.
 *
 * `onBeforeCompile` em vez de ShaderMaterial próprio, mesma escolha do §🌬️: o
 * material segue sendo um MeshLambertMaterial de verdade, com névoa, cutout e
 * blend do three intactos.
 */

/** Uniforms compartilhados pelos 3 materiais do chunk (terreno, água, vidro). */
export interface LuzUniforms {
  /** 0..1 — quanto do canal CÉU vale agora. Escrito 1×/frame a partir da hora. */
  nivelCeu: { value: number };
  /**
   * Piso de brilho do escuro absoluto. NÃO é 0 de propósito: preto puro numa
   * caverna deixa o aluno sem referência nenhuma pra sair, e a régua deste
   * projeto é sala de aula, não terror. 0,05 dá silhueta sem dar leitura.
   */
  luzMin: { value: number };
}

export function criarLuzUniforms(): LuzUniforms {
  return { nivelCeu: { value: 1 }, luzMin: { value: 0.05 } };
}

/**
 * Enxerta a luz por vértice no material.
 *
 * ENCADEIA com um `onBeforeCompile` que já exista (o balanço do §🌬️ mora no
 * material do terreno): três.js só guarda UM, então sobrescrever aqui apagaria
 * o vento sem nenhum erro visível — a folha simplesmente pararia de balançar.
 */
export function aplicarLuz(material: THREE.Material, uniforms: LuzUniforms): void {
  const anterior = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    anterior?.call(material, shader, renderer);
    shader.uniforms["nivelCeu"] = uniforms.nivelCeu;
    shader.uniforms["luzMin"] = uniforms.luzMin;

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute float luz;
varying float vLuz;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vLuz = luz;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying float vLuz;
uniform float nivelCeu;
uniform float luzMin;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
{
  // o byte chega como float 0..255 (atributo NÃO normalizado)
  float nCeu = floor(vLuz / 16.0);
  float nBloco = vLuz - nCeu * 16.0;
  float efetivo = max(nCeu * nivelCeu, nBloco);
  // curva geométrica (0,86 por nível), não linear: é ela que faz os 3 ou 4
  // últimos blocos antes do breu caírem depressa e a boca da caverna ler como
  // boca de caverna. Linear dava um cinza chapado sem profundidade.
  float f = pow(0.86, 15.0 - efetivo);
  diffuseColor.rgb *= mix(luzMin, 1.0, f);
}`,
      );
  };
  material.needsUpdate = true;
}
