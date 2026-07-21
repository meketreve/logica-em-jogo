import * as THREE from "three";
import { ATLAS, GLYPH, TILE } from "@logica/shared";

/**
 * Texture atlas procedural pintado num canvas (sem assets externos — restrição
 * de licença do projeto). Segue o layout ATLAS/TILE definido em /shared: o
 * mesher gera UVs para ESTE grid.
 */

/** Hash determinístico por pixel — textura idêntica a cada load (sem Math.random). */
function pixelHash(x: number, y: number, salt: number): number {
  let h = salt ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

type Rgb = readonly [number, number, number];

function paintNoise(
  ctx: CanvasRenderingContext2D,
  tile: number,
  base: Rgb,
  vary: number,
  yStart: number = 0,
  yEnd: number = ATLAS.tilePx,
): void {
  const px = ATLAS.tilePx;
  const ox = (tile % ATLAS.tilesPerRow) * px;
  const oy = ((tile / ATLAS.tilesPerRow) | 0) * px;
  for (let y = yStart; y < yEnd; y++) {
    for (let x = 0; x < px; x++) {
      const v = (pixelHash(x, y, tile * 7919 + 1) - 0.5) * 2 * vary;
      const r = Math.round(base[0] + v);
      const g = Math.round(base[1] + v);
      const b = Math.round(base[2] + v);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

/** Linhas de "argamassa" escuras por cima do ruído de pedra. */
function paintCobbleCracks(ctx: CanvasRenderingContext2D, tile: number): void {
  const px = ATLAS.tilePx;
  const ox = (tile % ATLAS.tilesPerRow) * px;
  const oy = ((tile / ATLAS.tilesPerRow) | 0) * px;
  ctx.fillStyle = "rgb(72,72,72)";
  for (let i = 0; i < px; i++) {
    ctx.fillRect(ox + i, oy + (i % 2 === 0 ? 4 : 5), 1, 1);
    ctx.fillRect(ox + i, oy + (i % 3 === 0 ? 11 : 10), 1, 1);
    ctx.fillRect(ox + (i % 2 === 0 ? 7 : 8), oy + i, 1, 1);
  }
}

/** Canto superior-esquerdo do tile no canvas. */
function tileOrigin(tile: number): [number, number] {
  const px = ATLAS.tilePx;
  return [(tile % ATLAS.tilesPerRow) * px, ((tile / ATLAS.tilesPerRow) | 0) * px];
}

/** Tronco (lado): estrias verticais de casca por cima do ruído marrom. */
function paintLogStripes(ctx: CanvasRenderingContext2D, tile: number): void {
  const [ox, oy] = tileOrigin(tile);
  ctx.fillStyle = "rgb(74,54,34)";
  for (let x = 1; x < ATLAS.tilePx; x += 4) {
    for (let y = 0; y < ATLAS.tilePx; y++) {
      if (pixelHash(x, y, tile * 31 + 3) < 0.8) ctx.fillRect(ox + x, oy + y, 1, y === 0 ? 2 : 1);
    }
  }
}

/** Tronco (topo): anéis concêntricos sobre a madeira clara. */
function paintLogRings(ctx: CanvasRenderingContext2D, tile: number): void {
  const [ox, oy] = tileOrigin(tile);
  const c = ATLAS.tilePx / 2 - 0.5;
  ctx.fillStyle = "rgb(120,90,52)";
  for (let y = 0; y < ATLAS.tilePx; y++) {
    for (let x = 0; x < ATLAS.tilePx; x++) {
      const d = Math.hypot(x - c, y - c);
      if (Math.round(d) % 3 === 0 && d < 7.5) ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

/** Tábuas: sulcos horizontais a cada 4px + emendas verticais alternadas. */
function paintPlankLines(ctx: CanvasRenderingContext2D, tile: number): void {
  const [ox, oy] = tileOrigin(tile);
  ctx.fillStyle = "rgb(122,92,56)";
  for (let y = 3; y < ATLAS.tilePx; y += 4) ctx.fillRect(ox, oy + y, ATLAS.tilePx, 1);
  for (let row = 0; row < 4; row++) {
    ctx.fillRect(ox + (row % 2 === 0 ? 4 : 11), oy + row * 4, 1, 3);
  }
}

/** Arenito: estratos horizontais sutis sobre a base clara. */
function paintSandstoneStrata(ctx: CanvasRenderingContext2D, tile: number): void {
  const [ox, oy] = tileOrigin(tile);
  ctx.fillStyle = "rgb(196,178,124)";
  for (let y = 3; y < ATLAS.tilePx; y += 5) {
    for (let x = 0; x < ATLAS.tilePx; x++) {
      if (pixelHash(x, y, tile * 41 + 5) < 0.7) ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

/** Pedra-lavrada: fiadas de 8×4 com juntas escuras desencontradas. */
function paintStoneBrickJoints(ctx: CanvasRenderingContext2D, tile: number): void {
  const [ox, oy] = tileOrigin(tile);
  ctx.fillStyle = "rgb(96,96,96)";
  for (let y = 3; y < ATLAS.tilePx; y += 4) ctx.fillRect(ox, oy + y, ATLAS.tilePx, 1);
  for (let row = 0; row < 4; row++) {
    const joint = row % 2 === 0 ? 7 : 3;
    ctx.fillRect(ox + joint, oy + row * 4, 1, 3);
    ctx.fillRect(ox + ((joint + 8) % ATLAS.tilePx), oy + row * 4, 1, 3);
  }
}

/** Obsidiana: pontinhos roxos esparsos sobre o quase-preto. */
function paintObsidianSpecks(ctx: CanvasRenderingContext2D, tile: number): void {
  const [ox, oy] = tileOrigin(tile);
  ctx.fillStyle = "rgb(92,58,128)";
  for (let y = 0; y < ATLAS.tilePx; y++) {
    for (let x = 0; x < ATLAS.tilePx; x++) {
      if (pixelHash(x, y, tile * 67 + 11) < 0.06) ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

/** Tijolos: fiadas de 4px com juntas verticais desencontradas sobre argamassa. */
function paintBricks(ctx: CanvasRenderingContext2D, tile: number): void {
  const [ox, oy] = tileOrigin(tile);
  for (let row = 0; row < 4; row++) {
    for (let x = 0; x < ATLAS.tilePx; x++) {
      const shifted = (x + (row % 2 === 0 ? 0 : 4)) % 8;
      for (let y = 0; y < 3; y++) {
        if (shifted === 7) continue; // junta vertical fica com a argamassa de fundo
        const v = (pixelHash(x, row * 4 + y, tile * 53 + 9) - 0.5) * 20;
        ctx.fillStyle = `rgb(${Math.round(158 + v)},${Math.round(64 + v)},${Math.round(52 + v)})`;
        ctx.fillRect(ox + x, oy + row * 4 + y, 1, 1);
      }
    }
  }
}

/** Vidro (cp18): moldura + brilhos diagonais opacos; o RESTO do tile fica
 *  transparente — o material usa alphaTest (cutout), sem blending/sorting. */
function paintGlass(ctx: CanvasRenderingContext2D, tile: number): void {
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.clearRect(ox, oy, px, px); // fundo 100% transparente
  ctx.fillStyle = "rgb(214,232,240)";
  ctx.fillRect(ox, oy, px, 1);
  ctx.fillRect(ox, oy + px - 1, px, 1);
  ctx.fillRect(ox, oy, 1, px);
  ctx.fillRect(ox + px - 1, oy, 1, px);
  // brilhos diagonais no canto
  for (let i = 2; i < 6; i++) ctx.fillRect(ox + i, oy + 8 - i, 1, 1);
  for (let i = 4; i < 10; i++) ctx.fillRect(ox + i, oy + 14 - i, 1, 1);
}

/** Bloco-glifo (cp20): base clara com ruído sutil + a letra/dígito no centro.
 *  Fonte bold no tamanho do tile, NearestFilter deixa o traço em pixels
 *  crocantes (legível à distância — soletrar palavras / escrever números). */
function paintGlyph(
  ctx: CanvasRenderingContext2D,
  tile: number,
  ch: string,
  base: Rgb,
): void {
  paintNoise(ctx, tile, base, 6);
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.fillStyle = "rgb(28,28,32)";
  ctx.font = `bold ${px - 3}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(ch, ox + px / 2, oy + px / 2 + 1);
}

/** Cerca (cp23): madeira mais escura que as tábuas, veios verticais — as
 *  caixas do mesher usam UV proporcional, então QUALQUER sub-região do tile
 *  precisa parecer madeira. */
function paintCerca(ctx: CanvasRenderingContext2D, tile: number): void {
  paintNoise(ctx, tile, [146, 112, 66], 10);
  const [ox, oy] = tileOrigin(tile);
  ctx.fillStyle = "rgb(116,86,48)";
  for (let x = 2; x < ATLAS.tilePx; x += 3) {
    for (let y = 0; y < ATLAS.tilePx; y++) {
      if (pixelHash(x, y, tile * 29 + 7) < 0.6) ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

/** Porta (cp23): folha de madeira com moldura; a metade de CIMA tem janela
 *  transparente (cutout — mesmo truque do vidro). */
function paintPorta(ctx: CanvasRenderingContext2D, tile: number, janela: boolean): void {
  paintNoise(ctx, tile, [164, 126, 76], 8);
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.fillStyle = "rgb(112,82,46)";
  ctx.fillRect(ox, oy, px, 1);
  ctx.fillRect(ox, oy + px - 1, px, 1);
  ctx.fillRect(ox, oy, 1, px);
  ctx.fillRect(ox + px - 1, oy, 1, px);
  // sulco central (folha dupla)
  ctx.fillRect(ox + 8, oy, 1, px);
  if (janela) {
    ctx.fillRect(ox + 3, oy + 3, 10, 1);
    ctx.fillRect(ox + 3, oy + 9, 10, 1);
    ctx.fillRect(ox + 3, oy + 3, 1, 7);
    ctx.fillRect(ox + 12, oy + 3, 1, 7);
    ctx.clearRect(ox + 4, oy + 4, 8, 5); // o vidro da janela é ausência
  }
}

/** Tocha (cp23): chama clara em cima, cabo de madeira embaixo. A caixa do
 *  mesher (2×10×2 "pixels") amostra as colunas centrais — o tile inteiro é
 *  pintado pra qualquer amostra cair certo. */
function paintTocha(ctx: CanvasRenderingContext2D, tile: number): void {
  paintNoise(ctx, tile, [255, 232, 122], 14, 0, 10); // chama (sempre clara)
  paintNoise(ctx, tile, [122, 92, 56], 10, 10, ATLAS.tilePx); // cabo
}

/** Janela (2026-07-19): moldura de madeira + cruz central; o vidro é
 *  AUSÊNCIA (cutout, mesmo truque do vidro/porta) com brilhos diagonais. */
function paintJanela(ctx: CanvasRenderingContext2D, tile: number): void {
  paintNoise(ctx, tile, [164, 126, 76], 8); // moldura = madeira da porta
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.clearRect(ox + 2, oy + 2, px - 4, px - 4); // vidro = ausência
  // cruz central de madeira escura (4 vidraças)
  ctx.fillStyle = "rgb(112,82,46)";
  ctx.fillRect(ox + 7, oy + 2, 2, px - 4);
  ctx.fillRect(ox + 2, oy + 7, px - 4, 2);
  // brilhos diagonais nas vidraças
  ctx.fillStyle = "rgb(214,232,240)";
  for (let i = 0; i < 3; i++) ctx.fillRect(ox + 3 + i, oy + 6 - i, 1, 1);
  for (let i = 0; i < 3; i++) ctx.fillRect(ox + 10 + i, oy + 13 - i, 1, 1);
}

/** Estofado (2026-07-19, sofá): azul acolchoado com costuras em grade. */
function paintEstofado(ctx: CanvasRenderingContext2D, tile: number): void {
  paintNoise(ctx, tile, [72, 104, 168], 8);
  const [ox, oy] = tileOrigin(tile);
  ctx.fillStyle = "rgb(54,80,132)";
  for (let i = 5; i < ATLAS.tilePx; i += 6) {
    ctx.fillRect(ox, oy + i, ATLAS.tilePx, 1);
    ctx.fillRect(ox + i, oy, 1, ATLAS.tilePx);
  }
}

/** Colchão (2026-07-19, cama): vermelho com costuras — o travesseiro é uma
 *  caixa separada de lã branca no mesher. */
function paintColchao(ctx: CanvasRenderingContext2D, tile: number): void {
  paintNoise(ctx, tile, [178, 54, 48], 8);
  const [ox, oy] = tileOrigin(tile);
  ctx.fillStyle = "rgb(140,40,36)";
  for (let i = 4; i < ATLAS.tilePx; i += 5) ctx.fillRect(ox, oy + i, ATLAS.tilePx, 1);
}

/** Quadro (2026-07-19): tela branca com moldura de madeira. O conteúdo
 *  (texto/imagem) é desenhado num plane por cima, no cliente. */
function paintQuadro(ctx: CanvasRenderingContext2D, tile: number): void {
  paintNoise(ctx, tile, [242, 238, 228], 4); // tela
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.fillStyle = "rgb(122,86,50)"; // moldura 2px
  ctx.fillRect(ox, oy, px, 2);
  ctx.fillRect(ox, oy + px - 2, px, 2);
  ctx.fillRect(ox, oy, 2, px);
  ctx.fillRect(ox + px - 2, oy, 2, px);
}

/** Folhas (cp18): folhagem densa com furos transparentes (cutout). A cor
 *  varia por espécie (2026-07-20): ipê floresce AMARELO, araucária é escura. */
function paintLeaves(
  ctx: CanvasRenderingContext2D,
  tile: number,
  base: Rgb = [52, 118, 44],
): void {
  paintNoise(ctx, tile, base, 16);
  const [ox, oy] = tileOrigin(tile);
  for (let y = 0; y < ATLAS.tilePx; y++) {
    for (let x = 0; x < ATLAS.tilePx; x++) {
      if (pixelHash(x, y, tile * 97 + 13) < 0.22) ctx.clearRect(ox + x, oy + y, 1, 1);
    }
  }
}

/** Minério (2026-07-20): pedra + pepitas 2×2 da cor do minério + SIGLA no
 *  centro — textura placeholder assumida ("ferro aqui") até a arte final. */
function paintMinerio(
  ctx: CanvasRenderingContext2D,
  tile: number,
  cor: Rgb,
  sigla: string,
): void {
  paintNoise(ctx, tile, [136, 136, 136], 12); // mesma pedra do TILE.stone
  const [ox, oy] = tileOrigin(tile);
  ctx.fillStyle = `rgb(${cor[0]},${cor[1]},${cor[2]})`;
  for (let y = 1; y < ATLAS.tilePx - 2; y++) {
    for (let x = 1; x < ATLAS.tilePx - 2; x++) {
      if (pixelHash(x, y, tile * 131 + 17) < 0.07) ctx.fillRect(ox + x, oy + y, 2, 2);
    }
  }
  const cx = ox + ATLAS.tilePx / 2;
  const cy = oy + ATLAS.tilePx / 2;
  ctx.font = "bold 8px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgb(20,20,24)"; // sombra: legível sobre pedra clara
  ctx.fillText(sigla, cx + 1, cy + 2);
  ctx.fillStyle = "rgb(244,244,248)";
  ctx.fillText(sigla, cx, cy + 1);
}

/** Mandacaru (2026-07-20): verde do cacto com costelas verticais + espinhos. */
function paintMandacaru(ctx: CanvasRenderingContext2D, tile: number): void {
  paintNoise(ctx, tile, [66, 138, 74], 10);
  const [ox, oy] = tileOrigin(tile);
  ctx.fillStyle = "rgb(48,104,56)"; // costelas
  for (let x = 2; x < ATLAS.tilePx; x += 4) ctx.fillRect(ox + x, oy, 1, ATLAS.tilePx);
  ctx.fillStyle = "rgb(230,238,214)"; // espinhos
  for (let y = 1; y < ATLAS.tilePx; y += 3) {
    for (let x = 3; x < ATLAS.tilePx; x += 4) {
      if (pixelHash(x, y, tile * 61 + 19) < 0.5) ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

/** Topo do mandacaru: miolo claro com borda escura (corte do cacto). */
function paintMandacaruTopo(ctx: CanvasRenderingContext2D, tile: number): void {
  paintNoise(ctx, tile, [96, 168, 100], 8);
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.fillStyle = "rgb(48,104,56)";
  ctx.fillRect(ox, oy, px, 1);
  ctx.fillRect(ox, oy + px - 1, px, 1);
  ctx.fillRect(ox, oy, 1, px);
  ctx.fillRect(ox + px - 1, oy, 1, px);
}

/** Flor (2026-07-20): sprite de plantinha em fundo TRANSPARENTE (cutout, como
 *  folhas/janela) — caule verde + folhas + pétalas coloridas. As duas lâminas
 *  cruzadas do mesher amostram este tile. */
function paintFlor(
  ctx: CanvasRenderingContext2D,
  tile: number,
  bloom: [number, number, number],
): void {
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.clearRect(ox, oy, px, px); // fundo transparente (cutout)
  const cx = ox + (px >> 1);
  // caule verde (metade de baixo, centro) + duas folhinhas
  ctx.fillStyle = "rgb(56,132,52)";
  ctx.fillRect(cx - 1, oy + (px >> 1), 2, px >> 1);
  ctx.fillRect(cx - 3, oy + px - 5, 2, 2);
  ctx.fillRect(cx + 1, oy + px - 7, 2, 2);
  // pétalas coloridas (topo)
  ctx.fillStyle = `rgb(${bloom[0]},${bloom[1]},${bloom[2]})`;
  ctx.fillRect(cx - 3, oy + 2, 6, 6);
  ctx.fillRect(cx - 4, oy + 4, 8, 2);
  ctx.fillRect(cx - 2, oy + 1, 4, 8);
  // miolo
  ctx.fillStyle = "rgb(250,214,74)";
  ctx.fillRect(cx - 1, oy + 4, 2, 2);
}

export function createAtlasTexture(): THREE.Texture {
  const size = ATLAS.tilesPerRow * ATLAS.tilePx;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d indisponível");

  paintNoise(ctx, TILE.grassTop, [92, 158, 60], 14);
  // grassSide: terra com faixa de grama nos 4px de cima
  paintNoise(ctx, TILE.grassSide, [121, 88, 58], 12);
  paintNoise(ctx, TILE.grassSide, [92, 158, 60], 14, 0, 4);
  paintNoise(ctx, TILE.dirt, [121, 88, 58], 12);
  paintNoise(ctx, TILE.stone, [136, 136, 136], 12);
  paintNoise(ctx, TILE.cobblestone, [120, 120, 120], 20);
  paintCobbleCracks(ctx, TILE.cobblestone);
  paintNoise(ctx, TILE.sand, [219, 207, 142], 10);

  // Grupo A (2026-07-11)
  paintNoise(ctx, TILE.logSide, [104, 78, 48], 10);
  paintLogStripes(ctx, TILE.logSide);
  paintNoise(ctx, TILE.logTop, [168, 132, 82], 8);
  paintLogRings(ctx, TILE.logTop);
  paintNoise(ctx, TILE.planks, [172, 136, 86], 8);
  paintPlankLines(ctx, TILE.planks);
  paintNoise(ctx, TILE.brick, [186, 180, 172], 8); // argamassa de fundo…
  paintBricks(ctx, TILE.brick); // …tijolos por cima
  paintNoise(ctx, TILE.gravel, [112, 106, 100], 30);
  paintNoise(ctx, TILE.bedrock, [42, 42, 46], 24);
  // lãs: cor forte + ruído sutil (leitura clara à distância — pedagogia de sequência)
  paintNoise(ctx, TILE.woolWhite, [232, 232, 230], 6);
  paintNoise(ctx, TILE.woolBlack, [38, 38, 42], 6);
  paintNoise(ctx, TILE.woolRed, [196, 52, 46], 8);
  paintNoise(ctx, TILE.woolOrange, [226, 132, 38], 8);
  paintNoise(ctx, TILE.woolYellow, [232, 206, 58], 8);
  paintNoise(ctx, TILE.woolGreen, [74, 164, 62], 8);
  paintNoise(ctx, TILE.woolBlue, [58, 94, 194], 8);
  paintNoise(ctx, TILE.woolPurple, [142, 72, 182], 8);

  // cp17 (2026-07-13): 2º lote de opacos
  paintNoise(ctx, TILE.sandstone, [214, 198, 146], 8);
  paintSandstoneStrata(ctx, TILE.sandstone);
  paintNoise(ctx, TILE.stoneBricks, [128, 128, 128], 10);
  paintStoneBrickJoints(ctx, TILE.stoneBricks);
  paintNoise(ctx, TILE.snow, [240, 244, 248], 5);
  paintNoise(ctx, TILE.obsidian, [30, 24, 42], 8);
  paintObsidianSpecks(ctx, TILE.obsidian);
  paintNoise(ctx, TILE.woolPink, [226, 140, 170], 8);
  paintNoise(ctx, TILE.woolCyan, [70, 178, 190], 8);
  paintNoise(ctx, TILE.woolGray, [130, 130, 134], 6);
  paintNoise(ctx, TILE.woolBrown, [110, 80, 54], 8);

  // cp18: transparentes (cutout — alphaTest no material do cliente)
  paintGlass(ctx, TILE.glass);
  paintLeaves(ctx, TILE.leaves);

  // cp23: não-cubos (cerca, porta, tocha)
  paintCerca(ctx, TILE.cerca);
  paintPorta(ctx, TILE.portaBaixo, false);
  paintPorta(ctx, TILE.portaCima, true);
  paintTocha(ctx, TILE.tocha);
  // 2026-07-19: janela + móveis + quadro
  paintJanela(ctx, TILE.janela);
  paintEstofado(ctx, TILE.estofado);
  paintColchao(ctx, TILE.colchao);
  paintQuadro(ctx, TILE.quadro);

  // flores (2026-07-20): 4 cores, sprite em cutout
  paintFlor(ctx, TILE.florVermelha, [214, 58, 54]);
  paintFlor(ctx, TILE.florAmarela, [242, 206, 62]);
  paintFlor(ctx, TILE.florAzul, [86, 122, 220]);
  paintFlor(ctx, TILE.florBranca, [238, 240, 246]);

  // minérios (2026-07-20): pepita colorida + sigla placeholder
  paintMinerio(ctx, TILE.minerioCarvao, [40, 40, 44], "C");
  paintMinerio(ctx, TILE.minerioFerro, [216, 162, 122], "Fe");
  paintMinerio(ctx, TILE.minerioOuro, [244, 208, 64], "Au");
  paintMinerio(ctx, TILE.minerioDiamante, [108, 226, 222], "D");

  // gramas climáticas (2026-07-20): mesmo desenho da grama, paleta por clima
  paintNoise(ctx, TILE.gramaSecaTop, [178, 162, 66], 14); // amarelada (cerrado)
  paintNoise(ctx, TILE.gramaSecaSide, [121, 88, 58], 12);
  paintNoise(ctx, TILE.gramaSecaSide, [178, 162, 66], 14, 0, 4);
  paintNoise(ctx, TILE.gramaFriaTop, [96, 138, 116], 12); // verde-azulada (frio)
  paintNoise(ctx, TILE.gramaFriaSide, [121, 88, 58], 12);
  paintNoise(ctx, TILE.gramaFriaSide, [96, 138, 116], 12, 0, 4);

  // árvores brasileiras (2026-07-20): casca por espécie + copa por espécie
  paintNoise(ctx, TILE.logIpe, [128, 110, 86], 10); // casca acinzentada
  paintLogStripes(ctx, TILE.logIpe);
  paintNoise(ctx, TILE.logAraucaria, [86, 60, 42], 10); // casca escura do Sul
  paintLogStripes(ctx, TILE.logAraucaria);
  paintNoise(ctx, TILE.logPauBrasil, [124, 66, 46], 10); // cerne avermelhado
  paintLogStripes(ctx, TILE.logPauBrasil);
  paintLeaves(ctx, TILE.folhasIpe, [222, 186, 48]); // ipê-amarelo florido
  paintLeaves(ctx, TILE.folhasAraucaria, [34, 88, 46]); // verde-escuro
  paintLeaves(ctx, TILE.folhasPauBrasil, [42, 130, 54]); // verde vivo da mata

  // mandacaru (2026-07-20)
  paintMandacaru(ctx, TILE.mandacaruSide);
  paintMandacaruTopo(ctx, TILE.mandacaruTop);

  // cp20: blocos-glifo — letras em creme, dígitos em azul-claro (distinção
  // rápida à distância entre "letra" e "número").
  for (let i = 0; i < GLYPH.letters.length; i++) {
    paintGlyph(ctx, GLYPH.base + i, GLYPH.letters[i]!, [236, 228, 206]);
  }
  for (let i = 0; i < GLYPH.digits.length; i++) {
    paintGlyph(ctx, GLYPH.base + GLYPH.letters.length + i, GLYPH.digits[i]!, [206, 222, 240]);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
