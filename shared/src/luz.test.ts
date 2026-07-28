import { describe, expect, it } from "vitest";
import {
  BlockId,
  CHUNK_SIZE,
  LUZ_MAX,
  acenderColuna,
  atualizarBloco,
  createWorld,
  criarLuz,
  luzBloco,
  luzCeu,
  luzChunkCoords,
  luzChunkIndex,
  luzEmitida,
  opacidadeLuz,
  setBlock,
} from "./index";

/** 3×3 colunas de chunk, 2 chunks de altura (32 blocos) — dá pra enterrar uma
 *  sala e ainda sobrar céu por cima. */
const DIMS = { x: 3, z: 3, y: 2 } as const;

/** Mundo com chão maciço em y=0..h-1 e ar acima, em TODAS as colunas. */
function mundoComChao(h: number) {
  const world = createWorld(DIMS);
  for (let x = 0; x < world.sizeX; x++)
    for (let z = 0; z < world.sizeZ; z++)
      for (let y = 0; y < h; y++) setBlock(world, x, y, z, BlockId.Stone);
  return world;
}

/** Acende as 9 colunas (mundo denso: todas já existem). */
function acenderTudo(world: ReturnType<typeof mundoComChao>) {
  const luz = criarLuz(world.dims);
  for (let cx = 0; cx < world.dims.x; cx++)
    for (let cz = 0; cz < world.dims.z; cz++) acenderColuna(world, luz, cx, cz);
  return luz;
}

describe("opacidade e emissão por bloco", () => {
  it("cubo opaco veda, ar passa, água e folha atenuam 1", () => {
    expect(opacidadeLuz(BlockId.Air)).toBe(0);
    expect(opacidadeLuz(BlockId.Stone)).toBe(LUZ_MAX);
    expect(opacidadeLuz(BlockId.Agua)).toBe(1);
    expect(opacidadeLuz(BlockId.Leaves)).toBe(1);
  });

  it("vidro e janela deixam passar; porta FECHADA veda e ABERTA não", () => {
    expect(opacidadeLuz(BlockId.Glass)).toBe(0);
    expect(opacidadeLuz(BlockId.VidroAzul)).toBe(0);
    expect(opacidadeLuz(BlockId.JanelaXFechada)).toBe(0);
    expect(opacidadeLuz(BlockId.PortaXFechada)).toBe(LUZ_MAX);
    expect(opacidadeLuz(BlockId.PortaXAberta)).toBe(0);
  });

  it("planta/tocha/laje não vedam (não são cubo cheio)", () => {
    for (const id of [BlockId.Tocha, BlockId.FlorAzul, BlockId.GramaAlta, BlockId.Cerca, BlockId.LajePedraBaixo]) {
      expect(opacidadeLuz(id)).toBe(0);
    }
  });

  it("só a tocha emite (por ora)", () => {
    expect(luzEmitida(BlockId.Tocha)).toBe(14);
    expect(luzEmitida(BlockId.Stone)).toBe(0);
    expect(luzEmitida(BlockId.Air)).toBe(0);
  });
});

describe("índice de chunk (ida e volta)", () => {
  it("luzChunkCoords inverte luzChunkIndex em todo slot", () => {
    for (let cy = 0; cy < DIMS.y; cy++)
      for (let cz = 0; cz < DIMS.z; cz++)
        for (let cx = 0; cx < DIMS.x; cx++) {
          const i = luzChunkIndex(DIMS, cx, cy, cz);
          expect(luzChunkCoords(DIMS, i)).toEqual({ cx, cy, cz });
        }
  });
});

describe("luz do céu", () => {
  it("céu aberto é 15 até a superfície; dentro da pedra é 0", () => {
    const world = mundoComChao(8);
    const luz = acenderTudo(world);
    expect(luzCeu(luz, 5, 20, 5)).toBe(LUZ_MAX); // ar bem acima
    expect(luzCeu(luz, 5, 8, 5)).toBe(LUZ_MAX); // primeira célula de ar
    expect(luzCeu(luz, 5, 7, 5)).toBe(0); // topo do chão (opaco)
    expect(luzCeu(luz, 5, 0, 5)).toBe(0); // fundo
  });

  it("a descida reta NÃO perde nível (é o que faz existir sombra sob teto)", () => {
    const world = mundoComChao(2);
    const luz = acenderTudo(world);
    for (let y = 2; y < world.sizeY; y++) expect(luzCeu(luz, 20, y, 20)).toBe(LUZ_MAX);
  });

  it("sala fechada fica ESCURA e a luz só entra decaindo pela porta", () => {
    const world = mundoComChao(8);
    // sala oca de 5×3×5 em (20..24, 8..10, 20..24) com teto em y=11
    for (let x = 19; x <= 25; x++)
      for (let z = 19; z <= 25; z++)
        for (let y = 8; y <= 11; y++) setBlock(world, x, y, z, BlockId.Stone);
    for (let x = 20; x <= 24; x++)
      for (let z = 20; z <= 24; z++)
        for (let y = 8; y <= 10; y++) setBlock(world, x, y, z, BlockId.Air);
    const luz = acenderTudo(world);
    expect(luzCeu(luz, 22, 9, 22)).toBe(0); // miolo da sala: breu

    // abre um vão de 1 célula na parede: a luz entra e DECAI
    setBlock(world, 19, 9, 22, BlockId.Air);
    const sujos = atualizarBloco(world, luz, 19, 9, 22);
    expect(sujos.size).toBeGreaterThan(0);
    expect(luzCeu(luz, 20, 9, 22)).toBeGreaterThan(0);
    expect(luzCeu(luz, 20, 9, 22)).toBeLessThan(LUZ_MAX);
    expect(luzCeu(luz, 24, 9, 22)).toBeLessThan(luzCeu(luz, 20, 9, 22));
  });

  it("furar o TETO devolve o dia inteiro embaixo (descida reta)", () => {
    const world = mundoComChao(8);
    for (let x = 19; x <= 25; x++)
      for (let z = 19; z <= 25; z++)
        for (let y = 8; y <= 11; y++) setBlock(world, x, y, z, BlockId.Stone);
    for (let x = 20; x <= 24; x++)
      for (let z = 20; z <= 24; z++)
        for (let y = 8; y <= 10; y++) setBlock(world, x, y, z, BlockId.Air);
    const luz = acenderTudo(world);
    expect(luzCeu(luz, 22, 10, 22)).toBe(0);

    setBlock(world, 22, 11, 22, BlockId.Air);
    atualizarBloco(world, luz, 22, 11, 22);
    expect(luzCeu(luz, 22, 10, 22)).toBe(LUZ_MAX);
    expect(luzCeu(luz, 22, 8, 22)).toBe(LUZ_MAX);
  });

  it("colocar bloco em céu aberto apaga a coluna inteira embaixo dele", () => {
    const world = mundoComChao(4);
    const luz = acenderTudo(world);
    expect(luzCeu(luz, 22, 10, 22)).toBe(LUZ_MAX);
    setBlock(world, 22, 20, 22, BlockId.Stone);
    atualizarBloco(world, luz, 22, 20, 22);
    expect(luzCeu(luz, 22, 20, 22)).toBe(0);
    // embaixo do bloco a luz não é mais 15 — só o que escorre de lado
    expect(luzCeu(luz, 22, 19, 22)).toBeLessThan(LUZ_MAX);
    expect(luzCeu(luz, 22, 21, 22)).toBe(LUZ_MAX); // acima segue céu aberto
  });

  it("desfazer devolve o estado exato (colocar e quebrar no mesmo lugar)", () => {
    const world = mundoComChao(4);
    const luz = acenderTudo(world);
    const antes: number[] = [];
    for (let y = 0; y < world.sizeY; y++) antes.push(luzCeu(luz, 22, y, 22));

    setBlock(world, 22, 20, 22, BlockId.Stone);
    atualizarBloco(world, luz, 22, 20, 22);
    setBlock(world, 22, 20, 22, BlockId.Air);
    atualizarBloco(world, luz, 22, 20, 22);

    for (let y = 0; y < world.sizeY; y++) expect(luzCeu(luz, 22, y, 22)).toBe(antes[y]);
  });
});

describe("luz de bloco (tocha)", () => {
  it("tocha em caverna acende 14 e decai 1 por bloco", () => {
    const world = mundoComChao(20); // maciço: 20 de pedra
    // galeria horizontal em y=10, de x=10 a x=34
    for (let x = 10; x <= 34; x++) setBlock(world, x, 10, 22, BlockId.Air);
    setBlock(world, 22, 10, 22, BlockId.Tocha);
    const luz = acenderTudo(world);

    expect(luzCeu(luz, 22, 10, 22)).toBe(0); // caverna: nada de céu
    expect(luzBloco(luz, 22, 10, 22)).toBe(14);
    expect(luzBloco(luz, 23, 10, 22)).toBe(13);
    expect(luzBloco(luz, 26, 10, 22)).toBe(10);
    expect(luzBloco(luz, 22 + 14, 10, 22)).toBe(0); // alcance acabou
  });

  it("quebrar a tocha apaga TUDO (sem rastro de luz órfã)", () => {
    const world = mundoComChao(20);
    for (let x = 10; x <= 34; x++) setBlock(world, x, 10, 22, BlockId.Air);
    setBlock(world, 22, 10, 22, BlockId.Tocha);
    const luz = acenderTudo(world);

    setBlock(world, 22, 10, 22, BlockId.Air);
    atualizarBloco(world, luz, 22, 10, 22);
    for (let x = 10; x <= 34; x++) expect(luzBloco(luz, x, 10, 22)).toBe(0);
  });

  it("duas tochas: apagar uma mantém a luz da outra", () => {
    const world = mundoComChao(20);
    for (let x = 10; x <= 34; x++) setBlock(world, x, 10, 22, BlockId.Air);
    setBlock(world, 14, 10, 22, BlockId.Tocha);
    setBlock(world, 22, 10, 22, BlockId.Tocha);
    const luz = acenderTudo(world);

    setBlock(world, 22, 10, 22, BlockId.Air);
    atualizarBloco(world, luz, 22, 10, 22);
    expect(luzBloco(luz, 14, 10, 22)).toBe(14);
    expect(luzBloco(luz, 18, 10, 22)).toBe(10); // 4 blocos da que ficou
    expect(luzBloco(luz, 22, 10, 22)).toBe(6); // 8 blocos da que ficou
  });

  it("tocha acesa depois do mundo pronto acende igual à que veio na geração", () => {
    const base = mundoComChao(20);
    for (let x = 10; x <= 34; x++) setBlock(base, x, 10, 22, BlockId.Air);
    setBlock(base, 22, 10, 22, BlockId.Tocha);
    const luzGerada = acenderTudo(base);

    const world = mundoComChao(20);
    for (let x = 10; x <= 34; x++) setBlock(world, x, 10, 22, BlockId.Air);
    const luz = acenderTudo(world);
    setBlock(world, 22, 10, 22, BlockId.Tocha);
    atualizarBloco(world, luz, 22, 10, 22);

    for (let x = 10; x <= 34; x++) {
      expect(luzBloco(luz, x, 10, 22)).toBe(luzBloco(luzGerada, x, 10, 22));
    }
  });
});

describe("fronteira de coluna (mundo LAZY do streaming)", () => {
  it("a galeria não ganha parede de luz na fronteira, qualquer que seja a ordem", () => {
    const world = mundoComChao(20);
    for (let x = 0; x < world.sizeX; x++) setBlock(world, x, 10, 22, BlockId.Air);
    setBlock(world, 4, 10, 22, BlockId.Tocha); // coluna cx=0

    // ordem A: coluna da tocha primeiro
    const a = criarLuz(world.dims);
    acenderColuna(world, a, 0, 1);
    acenderColuna(world, a, 1, 1);
    // ordem B: a vizinha primeiro (a luz tem de ENTRAR quando a fonte chega)
    const b = criarLuz(world.dims);
    acenderColuna(world, b, 1, 1);
    acenderColuna(world, b, 0, 1);

    for (let x = 0; x < 2 * CHUNK_SIZE; x++) {
      expect(luzBloco(b, x, 10, 22)).toBe(luzBloco(a, x, 10, 22));
    }
    // e a luz de fato atravessou a fronteira (x=16 é a 1ª célula da 2ª coluna)
    expect(luzBloco(a, 16, 10, 22)).toBe(2);
  });

  it("acender coluna suja também os chunks da coluna vizinha alcançada", () => {
    const world = mundoComChao(20);
    for (let x = 0; x < world.sizeX; x++) setBlock(world, x, 10, 22, BlockId.Air);
    setBlock(world, 14, 10, 22, BlockId.Tocha); // 2 blocos da fronteira x=16
    const luz = criarLuz(world.dims);
    acenderColuna(world, luz, 1, 1); // vizinha primeiro, pra existir
    const sujos = acenderColuna(world, luz, 0, 1);
    expect(sujos.has(luzChunkIndex(world.dims, 1, 0, 1))).toBe(true);
  });

  it("coluna não materializada não recebe luz (nem vaza pra fora do mundo)", () => {
    const world = createWorld(DIMS, false);
    const luz = criarLuz(world.dims);
    // nada alocado: acender uma coluna inexistente é no-op (não inventa céu 15
    // num vazio que ainda vai virar montanha quando a coluna chegar)
    const sujos = acenderColuna(world, luz, 0, 0);
    expect(sujos.size).toBe(0);
    expect(luz.chunks[luzChunkIndex(world.dims, 0, 0, 0)]).toBeUndefined();
    expect(luzCeu(luz, 4, 10, 4)).toBe(0);
    expect(luzCeu(luz, 40, 10, 40)).toBe(0);
  });
});

describe("água", () => {
  it("a luz do céu escurece com a profundidade do lago", () => {
    const world = mundoComChao(4);
    for (let y = 4; y <= 12; y++) setBlock(world, 22, y, 22, BlockId.Agua);
    // paredes pra a luz não entrar de lado e mascarar a atenuação
    for (let y = 4; y <= 12; y++)
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const)
        setBlock(world, 22 + dx, y, 22 + dz, BlockId.Stone);
    const luz = acenderTudo(world);
    expect(luzCeu(luz, 22, 12, 22)).toBe(LUZ_MAX);
    expect(luzCeu(luz, 22, 11, 22)).toBe(LUZ_MAX - 1);
    expect(luzCeu(luz, 22, 8, 22)).toBe(LUZ_MAX - 4);
  });
});

describe("determinismo", () => {
  it("mesmo mundo = mesmos bytes de luz, em qualquer ordem de coluna", () => {
    const world = mundoComChao(9);
    for (let x = 10; x <= 30; x++) setBlock(world, x, 5, 22, BlockId.Air);
    setBlock(world, 20, 5, 22, BlockId.Tocha);

    const a = criarLuz(world.dims);
    for (let cx = 0; cx < DIMS.x; cx++)
      for (let cz = 0; cz < DIMS.z; cz++) acenderColuna(world, a, cx, cz);
    const b = criarLuz(world.dims);
    for (let cx = DIMS.x - 1; cx >= 0; cx--)
      for (let cz = DIMS.z - 1; cz >= 0; cz--) acenderColuna(world, b, cx, cz);

    for (let i = 0; i < a.chunks.length; i++) {
      expect(Array.from(b.chunks[i] ?? [])).toEqual(Array.from(a.chunks[i] ?? []));
    }
  });

  it("reacender a MESMA coluna não muda nada (idempotente)", () => {
    const world = mundoComChao(9);
    for (let x = 10; x <= 30; x++) setBlock(world, x, 5, 22, BlockId.Air);
    setBlock(world, 20, 5, 22, BlockId.Tocha);
    const luz = acenderTudo(world);
    const antes = luz.chunks.map((c) => Array.from(c ?? []));

    for (let cx = 0; cx < DIMS.x; cx++)
      for (let cz = 0; cz < DIMS.z; cz++) acenderColuna(world, luz, cx, cz);

    for (let i = 0; i < luz.chunks.length; i++) {
      expect(Array.from(luz.chunks[i] ?? [])).toEqual(antes[i]);
    }
  });

  it("poço vertical no meio da coluna leva o dia até o fundo da galeria", () => {
    // guarda da otimização de BANDA: a luz que desce por um furo interno não
    // pode depender de a coluna vizinha ter piso mais alto.
    const world = mundoComChao(30);
    for (let x = 18; x <= 26; x++) setBlock(world, x, 10, 22, BlockId.Air); // galeria
    for (let y = 10; y < 30; y++) setBlock(world, 22, y, 22, BlockId.Air); // poço
    const luz = acenderTudo(world);
    expect(luzCeu(luz, 22, 10, 22)).toBe(LUZ_MAX); // fundo do poço: dia cheio
    expect(luzCeu(luz, 23, 10, 22)).toBe(LUZ_MAX - 1); // decai entrando na galeria
    expect(luzCeu(luz, 26, 10, 22)).toBe(LUZ_MAX - 4);
  });
});
