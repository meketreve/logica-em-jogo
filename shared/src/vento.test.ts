import { describe, expect, it } from "vitest";
import { SERVER_TICK_RATE } from "./constants";
import {
  ONDA_AGUA_POR_SETOR,
  VENTO_GIRO_SEGUNDOS,
  VENTO_PARADO,
  ondaAguaDoVento,
  ventoIntensidade,
  ventoNoTick,
  ventoRumo,
} from "./vento";

/** §🌬️ (2026-07-27): o vento é a MESMA engrenagem do horaDoDia — função pura do
 *  tick. O que estes testes protegem é justamente isso: nada de relógio de
 *  parede, nada de Math.random, dois hosts no mesmo tick veem o mesmo vento. */
describe("vento", () => {
  it("é determinístico: mesmo tick + mesma seed = mesmo vento", () => {
    for (const tick of [0, 1, 137, 9999, 123456]) {
      const a = ventoNoTick(tick, 42);
      const b = ventoNoTick(tick, 42);
      expect(a).toEqual(b);
    }
  });

  it("seeds diferentes nascem com ventos diferentes", () => {
    const a = ventoNoTick(0, 1);
    const b = ventoNoTick(0, 2);
    expect(a.dir).not.toBeCloseTo(b.dir, 3);
  });

  it("dir fica em [0, 2π) e forca em [0,1] em toda uma volta", () => {
    const ticks = VENTO_GIRO_SEGUNDOS * SERVER_TICK_RATE;
    for (let t = 0; t <= ticks; t += 7) {
      const v = ventoNoTick(t, 20260727);
      expect(v.dir).toBeGreaterThanOrEqual(0);
      expect(v.dir).toBeLessThan(Math.PI * 2);
      expect(v.forca).toBeGreaterThanOrEqual(0);
      expect(v.forca).toBeLessThanOrEqual(1);
    }
  });

  it("a direção dá a volta completa no período do giro", () => {
    // amostra a volta inteira e confere que os 8 setores foram todos visitados —
    // é o que garante que a água não fica presa num rumo só numa aula longa
    const setores = new Set<string>();
    const ticks = VENTO_GIRO_SEGUNDOS * SERVER_TICK_RATE;
    for (let t = 0; t <= ticks; t += SERVER_TICK_RATE) {
      setores.add(ventoRumo(ventoNoTick(t, 7).dir));
    }
    expect(setores.size).toBe(8);
  });

  it("a força varia (maré + rajada), não fica cravada", () => {
    const amostras: number[] = [];
    for (let t = 0; t < 100 * SERVER_TICK_RATE; t += SERVER_TICK_RATE) {
      amostras.push(ventoNoTick(t, 7).forca);
    }
    const min = Math.min(...amostras);
    const max = Math.max(...amostras);
    expect(max - min).toBeGreaterThan(0.2);
  });

  it("muda devagar: 1 s de vento não vira o rumo de cabeça pra baixo", () => {
    // o cliente só recebe 1×/s — se o passo de 1 s fosse grande, o vento andaria
    // aos trancos entre as sincronizações
    for (let t = 0; t < 600 * SERVER_TICK_RATE; t += SERVER_TICK_RATE) {
      const a = ventoNoTick(t, 3);
      const b = ventoNoTick(t + SERVER_TICK_RATE, 3);
      let d = Math.abs(b.dir - a.dir);
      if (d > Math.PI) d = Math.PI * 2 - d; // arco curto
      expect(d).toBeLessThan(0.15); // < ~8,6° por segundo
    }
  });

  it("VENTO_PARADO é calmaria de verdade", () => {
    expect(VENTO_PARADO.forca).toBe(0);
  });

  it("onda da água anda A FAVOR do vento (a inversão de eixo do topo)", () => {
    // No topo do bloco o mesher mapeia u = 1 − x e v = z, e o canvas tem y pra
    // baixo: o canvas anda ao CONTRÁRIO do mundo nos dois eixos. Este teste é a
    // trava desse sinal — trocá-lo faz a água correr contra o vento, que é o
    // tipo de bug que ninguém nota olhando o código.
    const casos: readonly (readonly [number, number, number])[] = [
      [0, -1, 0], // vento pra leste (+x) → onda pra −x no canvas
      [Math.PI / 2, 0, -1], // vento pro sul (+z) → onda pra −y no canvas
      [Math.PI, 1, 0], // vento pro oeste (−x) → +x no canvas
      [(3 * Math.PI) / 2, 0, 1], // vento pro norte (−z) → +y no canvas
    ];
    for (const [dir, sinalX, sinalY] of casos) {
      const [kx, ky] = ondaAguaDoVento(dir).a;
      expect(Math.sign(kx)).toBe(sinalX);
      expect(Math.sign(ky)).toBe(sinalY);
    }
  });

  it("onda da água: 8 setores inteiros, magnitude uniforme, sem pop na virada", () => {
    for (const k of ONDA_AGUA_POR_SETOR) {
      expect(Number.isInteger(k[0])).toBe(true); // inteiro = tile sem costura
      expect(Number.isInteger(k[1])).toBe(true);
      expect(Math.hypot(k[0], k[1])).toBeGreaterThan(2.7);
      expect(Math.hypot(k[0], k[1])).toBeLessThan(3.1);
    }
    // a mistura varre 0→1 dentro do setor e os vizinhos são consecutivos: é o
    // que apaga o "pop" quando o vento cruza a fronteira de setor
    const meio = ondaAguaDoVento(Math.PI / 8);
    expect(meio.mistura).toBeCloseTo(0.5, 3);
    expect(meio.a).toEqual(ONDA_AGUA_POR_SETOR[0]);
    expect(meio.b).toEqual(ONDA_AGUA_POR_SETOR[1]);
    // volta inteira sem estourar índice
    for (let d = -10; d < 10; d += 0.1) expect(ondaAguaDoVento(d).a).toBeDefined();
  });

  it("rumo e intensidade traduzem pro professor", () => {
    expect(ventoRumo(0)).toBe("leste");
    expect(ventoRumo(Math.PI / 4)).toBe("sudeste");
    expect(ventoRumo(Math.PI / 2)).toBe("sul"); // +z
    expect(ventoRumo(Math.PI)).toBe("oeste");
    expect(ventoRumo(Math.PI * 2)).toBe("leste"); // fecha o laço
    expect(ventoIntensidade(0)).toBe("quase parado");
    expect(ventoIntensidade(1)).toBe("vento forte");
  });
});
