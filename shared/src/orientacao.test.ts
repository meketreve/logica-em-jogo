import { describe, expect, it } from "vitest";
import {
  BlockId,
  fornalhaFrente,
  isPlaceable,
  slabMaterial,
  slabTop,
  stairsFacing,
  stairsMaterial,
  stairsTop,
} from "./blocks";
import { ancoraDeCopia, orientarParaColocar, quadranteDoOlhar } from "./orientacao";

/** yaw que faz o jogador olhar para cada quadrante. A câmera do three olha pra
 *  −Z com yaw 0 e o yaw CRESCE anti-horário visto de cima (`dx = -sin(yaw)`),
 *  então: 0 = −Z (quadrante 3), +π/2 = −X (2), π = +Z (1), −π/2 = +X (0). */
const OLHANDO = { menosZ: 0, menosX: Math.PI / 2, maisZ: Math.PI, maisX: -Math.PI / 2 };

describe("quadranteDoOlhar", () => {
  it("dá os quatro quadrantes na ordem dos ids (+x, +z, −x, −z)", () => {
    expect(quadranteDoOlhar(OLHANDO.maisX)).toBe(0);
    expect(quadranteDoOlhar(OLHANDO.maisZ)).toBe(1);
    expect(quadranteDoOlhar(OLHANDO.menosX)).toBe(2);
    expect(quadranteDoOlhar(OLHANDO.menosZ)).toBe(3);
  });
});

describe("orientarParaColocar — porta e janela seguem o EIXO do olhar", () => {
  it("olhando pro eixo Z, a lâmina fecha a passagem em Z", () => {
    expect(orientarParaColocar(BlockId.PortaXFechada, OLHANDO.menosZ, false)).toBe(
      BlockId.PortaZFechada,
    );
    expect(orientarParaColocar(BlockId.JanelaXFechada, OLHANDO.maisZ, false)).toBe(
      BlockId.JanelaZFechada,
    );
  });

  it("olhando pro eixo X, a lâmina fecha a passagem em X", () => {
    expect(orientarParaColocar(BlockId.PortaZFechada, OLHANDO.maisX, false)).toBe(
      BlockId.PortaXFechada,
    );
    expect(orientarParaColocar(BlockId.JanelaZFechada, OLHANDO.menosX, false)).toBe(
      BlockId.JanelaXFechada,
    );
  });

  it("porta e janela ignoram a face clicada (não têm metade)", () => {
    const cima = orientarParaColocar(BlockId.PortaXFechada, OLHANDO.maisX, false);
    const baixo = orientarParaColocar(BlockId.PortaXFechada, OLHANDO.maisX, true);
    expect(baixo).toBe(cima);
  });
});

describe("orientarParaColocar — móvel e quadro encaram QUEM COLOCOU", () => {
  // a frente é o OPOSTO do olhar: quem senta na cadeira olha de volta pro
  // jogador que a colocou (convenção Minecraft)
  const casos: [string, number][] = [
    ["cadeira", BlockId.CadeiraXP],
    ["sofá", BlockId.SofaXP],
    ["cama", BlockId.CamaXP],
    ["quadro", BlockId.QuadroXP],
  ];
  for (const [nome, ancora] of casos) {
    it(`${nome}: olhar pra +x põe a frente em −x`, () => {
      expect(orientarParaColocar(ancora, OLHANDO.maisX, false)).toBe(ancora + 2);
    });
    it(`${nome}: os quatro olhares dão os quatro ids, sem repetir`, () => {
      const ids = Object.values(OLHANDO).map((yaw) => orientarParaColocar(ancora, yaw, false));
      expect(new Set(ids).size).toBe(4);
      expect(ids.every((id) => id >= ancora && id < ancora + 4)).toBe(true);
    });
  }
});

describe("orientarParaColocar — a fornalha usa a TABELA, não aritmética de id", () => {
  it("a boca encara quem colocou, nos quatro olhares", () => {
    for (const [dir, yaw] of Object.entries(OLHANDO)) {
      const id = orientarParaColocar(BlockId.Fornalha, yaw, false);
      const esperado = (quadranteDoOlhar(yaw) + 2) % 4;
      expect(fornalhaFrente(id), `olhando pra ${dir}`).toBe(esperado);
    }
  });

  it("os quatro ids são distintos e nenhum nasce aceso", () => {
    const ids = Object.values(OLHANDO).map((yaw) =>
      orientarParaColocar(BlockId.Fornalha, yaw, false),
    );
    expect(new Set(ids).size).toBe(4);
    // fornalha acesa não é colocável — se algum saísse aceso, o place seria
    // recusado pelo servidor e o aluno ficaria sem entender
    expect(ids.every((id) => isPlaceable(id))).toBe(true);
  });
});

describe("orientarParaColocar — laje e escada leem a FACE clicada", () => {
  it("laje: mirar por baixo dá a metade de CIMA; por cima, o piso", () => {
    const piso = orientarParaColocar(BlockId.LajePedraBaixo, OLHANDO.menosZ, false);
    const teto = orientarParaColocar(BlockId.LajePedraBaixo, OLHANDO.menosZ, true);
    expect(slabTop(piso)).toBe(false);
    expect(slabTop(teto)).toBe(true);
    expect(slabMaterial(piso)).toBe(slabMaterial(teto));
  });

  it("laje: a âncora da mão pode ser a de CIMA e o resultado ainda obedece à face", () => {
    // a hotbar guarda a âncora "baixo", mas o botão do meio pode ter copiado
    // uma laje de cima antes do `ancoraDeCopia` — o resultado não pode mudar
    const teto = BlockId.LajePedraBaixo + 1;
    expect(slabTop(orientarParaColocar(teto, OLHANDO.menosZ, false))).toBe(false);
    expect(slabTop(orientarParaColocar(teto, OLHANDO.menosZ, true))).toBe(true);
  });

  it("escada: sobe pra onde o jogador olha, e a face escolhe a metade", () => {
    for (const [dir, yaw] of Object.entries(OLHANDO)) {
      const base = orientarParaColocar(BlockId.EscadaPedraXP, yaw, false);
      expect(stairsFacing(base), `olhando pra ${dir}`).toBe(quadranteDoOlhar(yaw));
      expect(stairsTop(base)).toBe(false);
      expect(stairsTop(orientarParaColocar(BlockId.EscadaPedraXP, yaw, true))).toBe(true);
    }
  });

  it("escada: o MATERIAL da mão sobrevive à orientação", () => {
    const tijolo = BlockId.EscadaPedraXP + 2 * 8;
    const posto = orientarParaColocar(tijolo, OLHANDO.maisX, false);
    expect(stairsMaterial(posto)).toBe(2);
  });
});

describe("orientarParaColocar — bloco sem família direcional passa igual", () => {
  it("terra, pedra e tábua saem como entraram", () => {
    for (const id of [BlockId.Dirt, BlockId.Stone, BlockId.Planks]) {
      for (const yaw of Object.values(OLHANDO)) {
        expect(orientarParaColocar(id, yaw, false)).toBe(id);
        expect(orientarParaColocar(id, yaw, true)).toBe(id);
      }
    }
  });
});

describe("ancoraDeCopia é o caminho de VOLTA de orientarParaColocar", () => {
  const ancoras = [
    BlockId.PortaXFechada,
    BlockId.JanelaXFechada,
    BlockId.CadeiraXP,
    BlockId.SofaXP,
    BlockId.CamaXP,
    BlockId.QuadroXP,
    BlockId.Fornalha,
    BlockId.LajePedraBaixo,
    BlockId.EscadaPedraXP,
    BlockId.Dirt,
  ];

  it("colocar e copiar de volta dá SEMPRE a mesma entrada da hotbar", () => {
    for (const ancora of ancoras) {
      for (const yaw of Object.values(OLHANDO)) {
        for (const porBaixo of [false, true]) {
          const posto = orientarParaColocar(ancora, yaw, porBaixo);
          expect(ancoraDeCopia(posto), `${ancora} @ ${yaw} ${porBaixo}`).toBe(ancora);
        }
      }
    }
  });

  it("tudo que volta pra mão é COLOCÁVEL (senão o slot vira um bloco morto)", () => {
    for (const ancora of ancoras) {
      expect(isPlaceable(ancoraDeCopia(ancora))).toBe(true);
    }
  });

  it("a fornalha ACESA copia pra apagada — o fogo não vai junto pra mochila", () => {
    expect(ancoraDeCopia(BlockId.FornalhaAcesa)).toBe(BlockId.Fornalha);
  });

  it("a porta ABERTA copia pra fechada (a metade aberta nem é colocável)", () => {
    expect(ancoraDeCopia(BlockId.PortaXAberta)).toBe(BlockId.PortaXFechada);
    expect(ancoraDeCopia(BlockId.JanelaXAberta)).toBe(BlockId.JanelaXFechada);
  });

  it("cada material de laje e de escada volta pra PRÓPRIA âncora", () => {
    for (let mat = 0; mat < 3; mat++) {
      const laje = BlockId.LajePedraBaixo + mat * 2;
      expect(slabMaterial(ancoraDeCopia(laje + 1))).toBe(mat);
      expect(slabTop(ancoraDeCopia(laje + 1))).toBe(false);
      const escada = BlockId.EscadaPedraXP + mat * 8;
      expect(stairsMaterial(ancoraDeCopia(escada + 5))).toBe(mat);
      expect(stairsTop(ancoraDeCopia(escada + 5))).toBe(false);
      expect(stairsFacing(ancoraDeCopia(escada + 5))).toBe(0);
    }
  });
});
