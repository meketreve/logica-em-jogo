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

    // ⚠️ O desempacotamento dos dois nibbles roda no VERTEX shader, e isso NÃO é
    // otimização — é correção (bug-544). Fazer `floor(vLuz / 16.0)` no FRAGMENT
    // significa aplicar `floor` a um valor INTERPOLADO: os 4 vértices da face
    // carregam o mesmo byte, mas a interpolação perspectiva devolve 239,9999 em
    // parte dos pixels, o `floor` derruba um nível inteiro de luz e a superfície
    // fica chuviscada entre dois brilhos — o que na tela lê como z-fighting.
    // Medido: 1,69% dos pixels em padrão ABAB contra 0,09% com `?semluz`.
    // Aqui em cima `luz` é o byte exato do atributo, então o `floor` é exato; o
    // que atravessa pro fragmento já é o brilho final, e interpolar um valor
    // constante entre 4 vértices iguais só pode errar na 7ª casa.
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
attribute float luz;
varying float vBrilho;
uniform float nivelCeu;
uniform float luzMin;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
{
  // byte cru 0..255 (atributo NÃO normalizado): céu no nibble alto, bloco no baixo
  float nCeu = floor(luz / 16.0);
  float nBloco = luz - nCeu * 16.0;
  float efetivo = max(nCeu * nivelCeu, nBloco);
  // curva geométrica (0,86 por nível), não linear: é ela que faz os 3 ou 4
  // últimos blocos antes do breu caírem depressa e a boca da caverna ler como
  // boca de caverna. Linear dava um cinza chapado sem profundidade.
  vBrilho = mix(luzMin, 1.0, pow(0.86, 15.0 - efetivo));
}`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying float vBrilho;`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
diffuseColor.rgb *= vBrilho;`,
      );
  };
  material.needsUpdate = true;
}
