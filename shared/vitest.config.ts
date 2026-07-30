import { defineConfig } from "vitest/config";

/**
 * Config do vitest do /shared (2026-07-30).
 *
 * Existe por UM motivo medido: sem ela o portão `npm test` era um sorteio.
 * O default do vitest abre um fork por núcleo (24 aqui) e boa parte dos testes
 * deste pacote GERA MUNDO (128³ = 2 a 4,5 MB de Uint8Array por mundo, mais o
 * worldgen inteiro por coluna). Com 24 forks fazendo isso ao mesmo tempo numa
 * VM de WSL, testes que não têm nada a ver com terreno — roundtrip de protocolo,
 * save, mesher, água — estouravam o `testTimeout` de 5 s: uma rodada deu 5
 * falhas, a seguinte 18, e a MESMA varredura medida duas vezes no mesmo processo
 * levou 591 ms e depois 1512 ms. Nenhum desses vermelhos era defeito de código.
 *
 * Os dois números:
 * - `maxWorkers: 8` — deixa CPU sobrando pra cada fork terminar seu mundo.
 * - `testTimeout: 20000` — folga pros testes que varrem o mundo M inteiro
 *   (192×192×128 = 4,7 M células, e alguns varrem uma vez por bloco-alvo).
 *
 * Isto NÃO é gate de desempenho: quem mede tempo aqui é o `?bench` e os
 * scripts de medição, não o vitest.
 */
export default defineConfig({
  test: {
    testTimeout: 20000,
    maxWorkers: 8,
  },
});
