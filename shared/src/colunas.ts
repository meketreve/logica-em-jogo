import { CHUNK_SIZE } from "./constants";
import { FOLGA_DESCARTE } from "./protocol";
import type { WorldDims } from "./world";

/**
 * §🔁 A GEOMETRIA DO RAIO DE COLUNAS — a conta que cliente e servidor têm de
 * fazer IGUAL, num lugar só.
 *
 * O streaming F2 dispensa mensagem de unload porque os dois lados descartam
 * pela MESMA regra (raio + folga). "A mesma regra" estava escrita seis vezes:
 * duas no `session/streaming.ts` (enviar e evictar), duas no `main.ts` (o total
 * da tela de carga e a varredura de descarte 1×/s) e uma no `colunasFaltando.ts`
 * — e as do cliente com `16` e `+ 2` DIGITADOS, sem passar por `CHUNK_SIZE` nem
 * por `FOLGA_DESCARTE`. Enquanto os números não mudassem, ninguém veria; no dia
 * em que mudassem, o cliente guardaria coluna que o servidor já esqueceu e o
 * sintoma seria buraco no mundo, longe daqui.
 *
 * Nada aqui toca bytes: é aritmética de (dims, posição, raio). Por isso é
 * testável, e por isso o teste pode cobrar o que importa de verdade —
 * `contarColunasNoRaio` tem de dar EXATAMENTE o número de colunas que o
 * `streamColunas` acaba mandando, senão a tela de carga nunca chega a 100%
 * (ou some com o mundo cheio de buraco).
 */

/** Coluna de chunks que contém a posição de MUNDO (x,z), clampada às bordas.
 *  Fora do mundo cai na coluna da borda — é o que o servidor já fazia, e é o
 *  que mantém o centro do raio sempre dentro do mundo. */
export function colunaDaPosicao(dims: WorldDims, x: number, z: number): { cx: number; cz: number } {
  return {
    cx: Math.max(0, Math.min(dims.x - 1, Math.floor(x / CHUNK_SIZE))),
    cz: Math.max(0, Math.min(dims.z - 1, Math.floor(z / CHUNK_SIZE))),
  };
}

/** Distância de Chebyshev (o raio é um QUADRADO, não um círculo — é assim que
 *  os anéis do `streamColunas` andam). */
export function distanciaColunas(cx: number, cz: number, pcx: number, pcz: number): number {
  return Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz));
}

/** A coluna ainda interessa a quem está em (pcx,pcz) com este raio?
 *  A FOLGA existe pra o jogador poder andar de um lado pro outro da borda sem
 *  a coluna ser descartada e repedida a cada passo. */
export function colunaInteressa(
  cx: number,
  cz: number,
  pcx: number,
  pcz: number,
  raio: number,
): boolean {
  return distanciaColunas(cx, cz, pcx, pcz) <= raio + FOLGA_DESCARTE;
}

/** Chave de coluna no mundo: `cz * dims.x + cx`. É a chave dos Sets/Maps dos
 *  dois lados (`colunasCarregadas`, `enviadas`, `residentCols`, `faltando`). */
export function colunaKey(dims: WorldDims, cx: number, cz: number): number {
  return cz * dims.x + cx;
}

/** O caminho de volta do `colunaKey`. */
export function colunaDeKey(dims: WorldDims, key: number): { cx: number; cz: number } {
  const cx = key % dims.x;
  return { cx, cz: (key - cx) / dims.x };
}

/**
 * Quantas colunas o quadrado de raio `raio` em volta de (pcx,pcz) tem, depois
 * de recortado pelas bordas do mundo. É o DENOMINADOR da tela de carga: o
 * número de colunas que o jogador parado ali vai receber, nem uma a mais.
 *
 * Com o centro dentro do mundo o resultado é sempre ≥ 1 (a própria coluna do
 * jogador), e é isso que autoriza usá-lo como divisor.
 */
export function contarColunasNoRaio(
  dims: WorldDims,
  pcx: number,
  pcz: number,
  raio: number,
): number {
  const nx = Math.min(dims.x - 1, pcx + raio) - Math.max(0, pcx - raio) + 1;
  const nz = Math.min(dims.z - 1, pcz + raio) - Math.max(0, pcz - raio) + 1;
  return Math.max(0, nx) * Math.max(0, nz);
}
