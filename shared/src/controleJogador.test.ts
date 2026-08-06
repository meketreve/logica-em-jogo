import { describe, expect, it } from "vitest";
import {
  ControleDoJogador,
  DuploToque,
  JANELA_DUPLO_TOQUE_MS,
  type EstadoDoOlho,
} from "./controleJogador";
import { PLAYER, STEP_HEIGHT } from "./physics";

const parado: EstadoDoOlho = { agachado: false, voando: false, noChao: true, subiu: 0 };
const olho = (e: Partial<EstadoDoOlho> = {}): EstadoDoOlho => ({ ...parado, ...e });

/** Um segundo de frames a 60 fps. */
const UM_FRAME = 1 / 60;

describe("§🎮 duplo-toque", () => {
  it("o PRIMEIRO toque nunca bate — nem no início do relógio", () => {
    // com `ultimoEm = 0` (o que o laço fazia), um jogo aberto nos primeiros
    // 300 ms de `performance.now()` engataria a corrida sozinho
    expect(new DuploToque().bateu(true, 10)).toBe(false);
    expect(new DuploToque().bateu(true, 0)).toBe(false);
  });

  it("conta a BORDA de subida: segurar a tecla não repete", () => {
    const d = new DuploToque();
    d.bateu(true, 0);
    for (let t = 10; t < 5000; t += 10) expect(d.bateu(true, t)).toBe(false);
  });

  it("dois toques DENTRO da janela batem; fora, não", () => {
    const dentro = new DuploToque();
    dentro.bateu(true, 0);
    dentro.bateu(false, 10);
    expect(dentro.bateu(true, JANELA_DUPLO_TOQUE_MS - 1)).toBe(true);

    const fora = new DuploToque();
    fora.bateu(true, 0);
    fora.bateu(false, 10);
    // a janela é estrita: NO limite ainda não vale
    expect(fora.bateu(true, JANELA_DUPLO_TOQUE_MS)).toBe(false);
  });

  it("três toques seguidos batem DUAS vezes (o relógio anota toda borda)", () => {
    const d = new DuploToque();
    d.bateu(true, 0);
    d.bateu(false, 10);
    expect(d.bateu(true, 100)).toBe(true);
    d.bateu(false, 110);
    expect(d.bateu(true, 200)).toBe(true);
  });

  it("toque lento depois de um duplo NÃO herda o toque velho", () => {
    const d = new DuploToque();
    d.bateu(true, 0);
    d.bateu(false, 10);
    expect(d.bateu(true, 100)).toBe(true);
    d.bateu(false, 110);
    expect(d.bateu(true, 100 + JANELA_DUPLO_TOQUE_MS)).toBe(false);
  });
});

describe("§🎮 corrida engatada", () => {
  it("um toque só não corre", () => {
    const c = new ControleDoJogador();
    expect(c.correndo(true, 0)).toBe(false);
    expect(c.correndo(true, 100)).toBe(false);
  });

  it("duplo-toque engata e FICA engatada enquanto o W estiver apertado", () => {
    const c = new ControleDoJogador();
    c.correndo(true, 0);
    c.correndo(false, 50);
    expect(c.correndo(true, 100)).toBe(true);
    // e continua correndo por segundos, sem novo toque
    for (let t = 200; t < 10_000; t += 100) expect(c.correndo(true, t)).toBe(true);
  });

  it("soltar o W desengata NO MESMO frame", () => {
    const c = new ControleDoJogador();
    c.correndo(true, 0);
    c.correndo(false, 50);
    expect(c.correndo(true, 100)).toBe(true);
    // é o desengate que faz a corrida ser TRAVA e não modo: sem ele, um
    // duplo-toque deixaria o aluno correndo pro resto da aula
    expect(c.correndo(false, 200)).toBe(false);
    // e não volta sozinha ao apertar de novo depois da janela
    expect(c.correndo(true, 1000)).toBe(false);
  });

  it("o frame do engate JÁ corre (o engate não custa um frame de atraso)", () => {
    const c = new ControleDoJogador();
    c.correndo(true, 0);
    c.correndo(false, 50);
    expect(c.correndo(true, 100)).toBe(true);
  });
});

describe("§🎮 alternar voo", () => {
  it("só o duplo-toque no pular alterna", () => {
    const c = new ControleDoJogador();
    expect(c.alternarVoo(true, 0)).toBe(false);
    expect(c.alternarVoo(true, 10)).toBe(false); // segurando: sem borda
    expect(c.alternarVoo(false, 20)).toBe(false);
    expect(c.alternarVoo(true, 100)).toBe(true);
  });

  it("segurar o espaço em voo (subir) não alterna de volta", () => {
    const c = new ControleDoJogador();
    c.alternarVoo(true, 0);
    c.alternarVoo(false, 20);
    expect(c.alternarVoo(true, 100)).toBe(true); // ligou o voo
    for (let t = 110; t < 5000; t += 10) expect(c.alternarVoo(true, t)).toBe(false);
  });

  it("andar e pular são detectores SEPARADOS", () => {
    const c = new ControleDoJogador();
    c.correndo(true, 0);
    c.correndo(false, 20);
    c.correndo(true, 100); // duplo-toque no W
    expect(c.alternarVoo(true, 110)).toBe(false); // não contamina o pular
  });
});

describe("§🎮 altura do olho", () => {
  it("parado em pé, fica na altura do olho", () => {
    const c = new ControleDoJogador();
    expect(c.alturaOlho).toBeCloseTo(PLAYER.eyeHeight, 6);
    for (let i = 0; i < 60; i++) c.avancarOlho(UM_FRAME, olho());
    expect(c.alturaOlho).toBeCloseTo(PLAYER.eyeHeight, 6);
  });

  it("agachar abaixa a câmera, e ela VOLTA ao levantar", () => {
    const c = new ControleDoJogador();
    for (let i = 0; i < 60; i++) c.avancarOlho(UM_FRAME, olho({ agachado: true }));
    expect(c.alturaOlho).toBeCloseTo(PLAYER.sneakEyeHeight, 3);
    for (let i = 0; i < 60; i++) c.avancarOlho(UM_FRAME, olho());
    expect(c.alturaOlho).toBeCloseTo(PLAYER.eyeHeight, 3);
  });

  it("agachar VOANDO não abaixa (agachar em voo é descer)", () => {
    const c = new ControleDoJogador();
    for (let i = 0; i < 60; i++) {
      c.avancarOlho(UM_FRAME, olho({ agachado: true, voando: true, noChao: false }));
    }
    expect(c.alturaOlho).toBeCloseTo(PLAYER.eyeHeight, 6);
  });

  it("a transição do agachar INDEPENDE do FPS — é o Kindle Fire que cobra isto", () => {
    // 0,1 s de agachamento — NO MEIO da transição, de propósito: medir o fim
    // não prova nada (qualquer suavização converge se der tempo), e um `k =
    // dt*20` linear chega no mesmo lugar depois de meio segundo. O que separa
    // os dois é o CAMINHO, e a 20 fps o linear salta de uma vez (`k = 1`).
    const faltando = (fps: number): number => {
      const c = new ControleDoJogador();
      for (let i = 0; i < fps / 10; i++) c.avancarOlho(1 / fps, olho({ agachado: true }));
      return (c.alturaOlho - PLAYER.sneakEyeHeight) / (PLAYER.eyeHeight - PLAYER.sneakEyeHeight);
    };
    expect(faltando(60)).toBeCloseTo(Math.exp(-2), 6); // 0,1 s × k=20
    expect(faltando(20)).toBeCloseTo(faltando(60), 6);
    expect(faltando(120)).toBeCloseTo(faltando(60), 6);
  });

  it("subir um degrau atrasa a câmera e ela recupera em ~0,4 s", () => {
    const c = new ControleDoJogador();
    const antes = c.avancarOlho(UM_FRAME, olho({ subiu: 0.5 }));
    expect(antes).toBeLessThan(PLAYER.eyeHeight - 0.35); // ficou pra trás
    for (let i = 0; i < 24; i++) c.avancarOlho(UM_FRAME, olho());
    expect(c.alturaOlho).toBe(PLAYER.eyeHeight); // alcançou (e o corte zerou)
  });

  it("o degrau NUNCA passa de STEP_HEIGHT, mesmo subindo vários seguidos", () => {
    const c = new ControleDoJogador();
    for (let i = 0; i < 10; i++) {
      const h = c.avancarOlho(UM_FRAME, olho({ subiu: 0.5 }));
      expect(PLAYER.eyeHeight - h).toBeLessThanOrEqual(STEP_HEIGHT + 1e-9);
    }
  });

  it("CAIR não é degrau — o teto do gate é o que separa passo de queda", () => {
    // sem o `subiu <= STEP_HEIGHT + 0.01`, um teleporte ou uma queda amortecida
    // viraria uma câmera subindo sozinha por meio segundo
    const c = new ControleDoJogador();
    expect(c.avancarOlho(UM_FRAME, olho({ subiu: 12 }))).toBeCloseTo(PLAYER.eyeHeight, 6);
    expect(c.avancarOlho(UM_FRAME, olho({ subiu: -3, noChao: false }))).toBeCloseTo(
      PLAYER.eyeHeight,
      6,
    );
  });

  it("PULAR e VOAR não são degrau", () => {
    const noAr = new ControleDoJogador();
    expect(noAr.avancarOlho(UM_FRAME, olho({ subiu: 0.4, noChao: false }))).toBeCloseTo(
      PLAYER.eyeHeight,
      6,
    );
    const voando = new ControleDoJogador();
    expect(voando.avancarOlho(UM_FRAME, olho({ subiu: 0.4, voando: true }))).toBeCloseTo(
      PLAYER.eyeHeight,
      6,
    );
  });

  it("a recuperação do degrau INDEPENDE do FPS", () => {
    // a FRAÇÃO que sobra depois de 0,2 s, e não o valor absoluto: o frame em
    // que o degrau entra já decai junto, e esse primeiro passo é do tamanho do
    // `dt` por definição. O que tem de ser igual nas três taxas é o RITMO.
    const fracaoApos200ms = (fps: number): number => {
      const c = new ControleDoJogador();
      c.avancarOlho(1 / fps, olho({ subiu: STEP_HEIGHT }));
      const inicio = PLAYER.eyeHeight - c.alturaOlho;
      for (let i = 0; i < fps / 5; i++) c.avancarOlho(1 / fps, olho()); // 0,2 s
      return (PLAYER.eyeHeight - c.alturaOlho) / inicio;
    };
    expect(fracaoApos200ms(20)).toBeCloseTo(fracaoApos200ms(60), 6);
    expect(fracaoApos200ms(120)).toBeCloseTo(fracaoApos200ms(60), 6);
  });
});
