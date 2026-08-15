import * as THREE from "three";
import { ATLAS, GLYPH, ONDA_AGUA_POR_SETOR, TILE } from "@logica/shared";

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

/** Vidro colorido (2026-07-25, refeito no playtest): tile CHEIO na cor, 100%
 *  opaco. A translucidez NÃO mora mais aqui — vem do material próprio do vidro
 *  no cliente (blend com ~20% de opacidade). Assim a cor fica limpa (nada de
 *  dither/"mosquiteiro") e o ícone 2D da hotbar, que copia o tile do atlas,
 *  sai sólido. Moldura da cor clareada + brilho diagonal dão a leitura de vidro. */
function paintVidroCor(ctx: CanvasRenderingContext2D, tile: number, cor: Rgb): void {
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  // corpo: cor cheia (o material dilui pra ~20% na cena)
  ctx.fillStyle = `rgb(${cor[0]},${cor[1]},${cor[2]})`;
  ctx.fillRect(ox, oy, px, px);
  // moldura na cor clareada (mistura com branco)
  const lr = Math.round((cor[0] + 255) / 2);
  const lg = Math.round((cor[1] + 255) / 2);
  const lb = Math.round((cor[2] + 255) / 2);
  ctx.fillStyle = `rgb(${lr},${lg},${lb})`;
  ctx.fillRect(ox, oy, px, 1);
  ctx.fillRect(ox, oy + px - 1, px, 1);
  ctx.fillRect(ox, oy, 1, px);
  ctx.fillRect(ox + px - 1, oy, 1, px);
  // brilho diagonal (reflexo)
  ctx.fillStyle = "rgb(240,246,250)";
  for (let i = 3; i < 8; i++) ctx.fillRect(ox + i, oy + 11 - i, 1, 1);
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

/** Grama alta (§🌬️, 2026-07-27): tufo de lâminas subindo do PÉ do tile, fundo
 *  transparente (cutout, mesma família da flor). As lâminas nascem embaixo e
 *  afinam pra cima com uma curvatura leve — é o desenho que combina com o
 *  balanço do shader, que verga só o topo. Paleta por clima (verde/seca/fria)
 *  pra o capim não destoar da grama do chão. */
function paintGramaAlta(ctx: CanvasRenderingContext2D, tile: number, base: Rgb): void {
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.clearRect(ox, oy, px, px);
  const LAMINAS = 7;
  for (let i = 0; i < LAMINAS; i++) {
    const x0 = 1 + Math.floor(pixelHash(i, 0, tile * 17 + 3) * (px - 2));
    const alt = 7 + Math.floor(pixelHash(i, 1, tile * 17 + 5) * 7); // 7..13 px
    const lado = pixelHash(i, 2, tile * 17 + 7) < 0.5 ? -1 : 1;
    // tom por lâmina: dá profundidade ao tufo sem precisar de sombra
    const t = 0.72 + pixelHash(i, 3, tile * 17 + 9) * 0.5;
    ctx.fillStyle = `rgb(${Math.round(base[0] * t)},${Math.round(base[1] * t)},${Math.round(base[2] * t)})`;
    for (let k = 0; k < alt; k++) {
      const y = px - 1 - k;
      const f = k / alt;
      const x = x0 + Math.round(f * f * 3) * lado; // curva: reta no pé, tomba no topo
      if (x < 0 || x >= px) continue;
      ctx.fillRect(ox + x, oy + y, 1, 1);
      // o pé é mais grosso (2px) — sem isso o tufo some de longe
      if (f < 0.45 && x + 1 < px) ctx.fillRect(ox + x + 1, oy + y, 1, 1);
    }
  }
}

/**
 * Plantação (§🍖 F6, 2026-08-04): 4 tiles em cutout, um por estágio. O estágio
 * é lido pela ALTURA e pela COR — verde e rasteiro na muda, alto e dourado com
 * espigas na madura. É a única informação que o aluno precisa ler de longe pra
 * saber se já dá pra colher, e ela não custa mensagem nenhuma: está no byte.
 *
 * Mesmo desenho de lâminas do capim (`paintGramaAlta`), com a semente fixa por
 * tile — assim a horta não fica com todos os pés idênticos, mas o mesmo pé
 * desenha igual em todo cliente.
 */
function paintPlantacao(ctx: CanvasRenderingContext2D, tile: number, estagio: number): void {
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.clearRect(ox, oy, px, px);
  // verde-novo → verde-maduro → dourado (o amarelo só chega no fim)
  const CORES: readonly Rgb[] = [
    [96, 176, 74],
    [104, 172, 62],
    [156, 176, 56],
    [206, 176, 60],
  ];
  const base = CORES[estagio] ?? CORES[0]!;
  const alturaMax = 4 + estagio * 4; // 4 → 16 px: a planta SOBE com a idade
  const HASTES = 5;
  for (let i = 0; i < HASTES; i++) {
    const x0 = 2 + Math.floor(pixelHash(i, 0, 91) * (px - 4));
    const alt = Math.max(2, alturaMax - Math.floor(pixelHash(i, 1, 93) * 3));
    const t = 0.78 + pixelHash(i, 2, 95) * 0.42;
    ctx.fillStyle = `rgb(${Math.round(base[0] * t)},${Math.round(base[1] * t)},${Math.round(base[2] * t)})`;
    for (let k = 0; k < alt; k++) ctx.fillRect(ox + x0, oy + px - 1 - k, 1, 1);
    // espiga: só na MADURA, e é ela que diz "pode colher" à distância
    if (estagio === 3) {
      ctx.fillStyle = "rgb(226,196,88)";
      ctx.fillRect(ox + x0 - 1, oy + px - alt, 3, 3);
    }
  }
}

/**
 * §🪵 (2026-08-15): a MUDA de árvore — 4 estágios por espécie, mini-árvore
 * em cruz de sprite. O estágio é a ALTURA (o tronco cresce e a copa engorda);
 * a COR da copa é a da SENHORA árvore (ipê já brota amarelo, araucária verde
 * escuro) e a casca é a do tronco dela — a muda é a prologa do que nasce.
 * Mesmo corte da plantação: verde/rasteira no 0, alta e encorpada no 3.
 */
interface MudaVisual {
  readonly folha: Rgb;
  readonly casca: Rgb;
}

function paintMuda(
  ctx: CanvasRenderingContext2D,
  tile: number,
  estagio: number,
  v: MudaVisual,
): void {
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.clearRect(ox, oy, px, px);
  // tronco: 2 px de largura, cresce 2 px por estágio (4 → 10)
  const troncoAlt = 4 + estagio * 2;
  const tx = ox + (px / 2 | 0) - 1;
  ctx.fillStyle = `rgb(${v.casca[0]},${v.casca[1]},${v.casca[2]})`;
  for (let k = 0; k < troncoAlt; k++) ctx.fillRect(tx, oy + px - 1 - k, 2, 1);
  // copa: bolha da cor da folhagem no topo do tronco; engorda com a idade
  const base = oy + px - 1 - troncoAlt;
  const raio = 1 + estagio; // 1 → 4 px
  const tom = (dx: number, dy: number): number =>
    0.8 + pixelHash(tile * 7 + dx + dy * 37, 0, 41) * 0.5;
  for (let cy = 0; cy < raio * 2 - 1; cy++) {
    const dy = cy - raio + 1;
    const largura = 2 * raio - Math.abs(dy) * 2 - 1; // losango ≈ bolha
    const cx0 = tx + 1 - (largura >> 1);
    for (let dx = 0; dx < largura; dx++) {
      const t = tom(dx, dy);
      ctx.fillStyle = `rgb(${Math.round(v.folha[0] * t)},${Math.round(v.folha[1] * t)},${Math.round(v.folha[2] * t)})`;
      ctx.fillRect(cx0 + dx, base - raio + 1 + cy, 1, 1);
    }
  }
}

/**
 * §🍖 F10b: a fornalha. Pedregulho com uma BOCA quadrada escura no meio da
 * face — e é a boca que faz o bloco ser reconhecível de longe num tablet: sem
 * ela seria mais um cubo cinza no meio da parede de pedregulho que o aluno
 * acabou de construir. Acesa, a boca vira brasa com duas línguas de fogo.
 */
function paintFornalhaLado(
  ctx: CanvasRenderingContext2D,
  tile: number,
  acesa: boolean,
): void {
  paintNoise(ctx, tile, [128, 128, 130], 16);
  paintCobbleCracks(ctx, tile);
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  const bx = ox + 3;
  const by = oy + 6;
  const bw = px - 6;
  const bh = px - 9;
  // moldura clara: separa a boca da pedra, senão ela some no ruído
  ctx.fillStyle = "rgb(168,168,170)";
  ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
  ctx.fillStyle = acesa ? "rgb(58,20,8)" : "rgb(38,36,38)";
  ctx.fillRect(bx, by, bw, bh);
  if (!acesa) return;
  // brasa: base laranja + duas línguas amarelas (o amarelo é o que "acende")
  ctx.fillStyle = "rgb(220,96,26)";
  ctx.fillRect(bx, by + bh - 3, bw, 3);
  ctx.fillStyle = "rgb(248,190,60)";
  ctx.fillRect(bx + 2, by + bh - 5, 2, 3);
  ctx.fillRect(bx + bw - 4, by + bh - 6, 2, 4);
}

/**
 * §🍖 F10 (refino): as COSTAS da fornalha — o mesmo pedregulho da boca, sem
 * boca. É o tile dos três lados que não são a frente, e é ele que faz duas
 * fornalhas encostadas pararem de ler como uma parede de bocas. Um degrau mais
 * ESCURO que o pedregulho comum de propósito: sem isso a fornalha vista de trás
 * desaparece dentro da parede de pedregulho que o aluno acabou de levantar, e
 * "onde foi parar a minha fornalha" é uma pergunta cara no meio da aula.
 */
function paintFornalhaCostas(ctx: CanvasRenderingContext2D, tile: number): void {
  paintNoise(ctx, tile, [112, 112, 116], 14);
  paintCobbleCracks(ctx, tile);
}

/** Chapa de cima/baixo da fornalha: pedra lisa com um anel de fuligem. */
function paintFornalhaTopo(ctx: CanvasRenderingContext2D, tile: number): void {
  paintNoise(ctx, tile, [140, 140, 142], 12);
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.strokeStyle = "rgb(74,70,68)";
  ctx.lineWidth = 1;
  ctx.strokeRect(ox + 2.5, oy + 2.5, px - 5, px - 5);
}

/**
 * §🍖 F10e: o baú. Madeira escura com ripas, uma faixa clara na horizontal (a
 * tampa) e o ferrolho de metal no meio — a fechadura é o que faz o aluno
 * reconhecer "isso guarda coisa" antes de qualquer texto. O topo mostra a tampa
 * fechada com a mesma dobradiça.
 */
function paintBau(ctx: CanvasRenderingContext2D, tile: number, topo: boolean): void {
  paintNoise(ctx, tile, [116, 78, 40], 14);
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  // ripas verticais: 3 linhas escuras, senão a madeira vira uma mancha
  ctx.fillStyle = "rgb(84, 54, 26)";
  for (const dx of [4, 8, 12]) ctx.fillRect(ox + dx, oy, 1, px);
  if (topo) {
    // tampa: moldura + dobradiça atravessando
    ctx.strokeStyle = "rgb(70, 46, 22)";
    ctx.lineWidth = 1;
    ctx.strokeRect(ox + 1.5, oy + 1.5, px - 3, px - 3);
    ctx.fillStyle = "rgb(150, 150, 158)";
    ctx.fillRect(ox + 2, oy + 7, px - 4, 2);
    return;
  }
  // lado: a linha da tampa em cima + o ferrolho no meio
  ctx.fillStyle = "rgb(146, 100, 52)";
  ctx.fillRect(ox, oy + 4, px, 1);
  ctx.fillStyle = "rgb(64, 40, 18)";
  ctx.fillRect(ox, oy + 5, px, 1);
  ctx.fillStyle = "rgb(158, 158, 166)";
  ctx.fillRect(ox + 6, oy + 3, 4, 5);
  ctx.fillStyle = "rgb(52, 52, 58)";
  ctx.fillRect(ox + 7, oy + 5, 2, 2); // o buraco da chave
}

/**
 * §🍖 F10c: o algodão. Hastes verdes que SOBEM com a idade (a mesma régua da
 * plantação de trigo, pra os dois canteiros se lerem do mesmo jeito à
 * distância) e, no fim, os CAPULHOS brancos — a bolinha branca é o sinal de
 * "pode colher", e ela só aparece no último estágio.
 *
 * O pé SELVAGEM é desenhado com os capulhos já abertos e a haste mais seca: no
 * meio do capim do cerrado, é o branco que o olho acha.
 */
function paintAlgodao(
  ctx: CanvasRenderingContext2D,
  tile: number,
  estagio: number,
  selvagem = false,
): void {
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.clearRect(ox, oy, px, px);
  const base: Rgb = selvagem ? [126, 140, 74] : [88, 152, 78];
  const alturaMax = selvagem ? 11 : 4 + estagio * 3;
  const HASTES = 4;
  for (let i = 0; i < HASTES; i++) {
    const x0 = 3 + Math.floor(pixelHash(i, 0, 61) * (px - 6));
    const alt = Math.max(2, alturaMax - Math.floor(pixelHash(i, 1, 67) * 3));
    const t = 0.8 + pixelHash(i, 2, 71) * 0.4;
    ctx.fillStyle = `rgb(${Math.round(base[0] * t)},${Math.round(base[1] * t)},${Math.round(base[2] * t)})`;
    for (let k = 0; k < alt; k++) ctx.fillRect(ox + x0, oy + px - 1 - k, 1, 1);
    // capulho: só no ESTÁGIO FINAL (e no selvagem, que já nasce aberto)
    if (estagio === 3 || selvagem) {
      ctx.fillStyle = "rgb(244,244,238)";
      ctx.fillRect(ox + x0 - 1, oy + px - alt - 2, 3, 3);
      ctx.fillStyle = "rgb(206,206,198)"; // sombra: sem ela o capulho some no céu
      ctx.fillRect(ox + x0 + 1, oy + px - alt, 1, 1);
    }
  }
}

/**
 * §🍖 F10h (2026-08-06): as SEIS CULTURAS — UM pintor, parametrizado. Cada
 * cultura tem a cor da folhagem, a cor do COLHÍVEL e onde ele aparece:
 * - **raiz na BASE** (cenoura, batata, beterraba, aipim): o colhível mora
 *   debaixo da terra e só ESPIA — como o aluno quebra pra ver.
 * - **fruta NO TOPO** (melancia na rama, cacho de banana): pendurada no alto.
 * A distinção entre as seis nasce do colhível — é ele que a aula precisa achar
 * de longe, e é ele que casa com o item que cai no drops. O pé SELVAGEM tem a
 * haste mais seca (folha desbotada) e o colhível já aberto, como o algodão.
 */
interface CulturaVisual {
  readonly folha: Rgb;
  readonly fruta: Rgb;
  /** `true` = fruta NO TOPO (melancia, banana); `false` = raiz na BASE. */
  readonly frutaNoTopo: boolean;
  /** 1..4 — melancia é larga, aipim é estreito. */
  readonly largura: number;
}

function paintCultura(
  ctx: CanvasRenderingContext2D,
  tile: number,
  estagio: number,
  v: CulturaVisual,
  salt: number,
  selvagem = false,
): void {
  const [ox, oy] = tileOrigin(tile);
  const px = ATLAS.tilePx;
  ctx.clearRect(ox, oy, px, px);
  const folha: Rgb = selvagem
    ? [Math.round(v.folha[0] * 0.9), Math.round(v.folha[1] * 0.85), Math.round(v.folha[2] * 0.6)]
    : v.folha;
  const alturaMax = selvagem ? 12 : 4 + estagio * 3;
  const HASTES = 4;
  // hastes que sobem com a idade — a mesma régua do algodão, pra os canteiros
  // da turma se lerem do mesmo jeito à distância
  for (let i = 0; i < HASTES; i++) {
    const x0 = 3 + Math.floor(pixelHash(i, 0, salt + 11) * (px - 6));
    const alt = Math.max(2, alturaMax - Math.floor(pixelHash(i, 1, salt + 17) * 3));
    const t = 0.78 + pixelHash(i, 2, salt + 23) * 0.42;
    ctx.fillStyle = `rgb(${Math.round(folha[0] * t)},${Math.round(folha[1] * t)},${Math.round(folha[2] * t)})`;
    for (let k = 0; k < alt; k++) ctx.fillRect(ox + x0, oy + px - 1 - k, 1, 1);
  }
  // colhível: só no último estágio (e no selvagem, que já nasce com ele)
  if (estagio === 3 || selvagem) {
    ctx.fillStyle = `rgb(${v.fruta[0]},${v.fruta[1]},${v.fruta[2]})`;
    if (v.frutaNoTopo) {
      const cx = ox + px / 2 - v.largura;
      const cy = oy + px - alturaMax - 3;
      ctx.fillRect(cx, cy, v.largura * 2, Math.max(2, v.largura));
    } else {
      const cx = ox + px / 2 - v.largura;
      ctx.fillRect(cx, oy + px - 3, v.largura * 2, 3);
      ctx.fillRect(cx + 1, oy + px - 4, v.largura * 2 - 2, 1);
    }
  }
}

/** Vetor de onda da água: dois setores inteiros + a mistura entre eles (ver
 *  `ondaAguaDoVento` em shared/vento.ts, que explica por que é um PAR). */
export interface OndaAgua {
  readonly a: readonly [number, number];
  readonly b: readonly [number, number];
  readonly mistura: number;
}

/** Onda de quando ainda não chegou vento do servidor (correnteza pra leste). */
const ONDA_PADRAO: OndaAgua = { a: [-3, 0], b: [-3, 0], mistura: 0 };

/** Quantos quadros tem o ciclo da correnteza (fase 0..2π). Loop perfeito. */
export const AGUA_FRAMES = 16;

/** Salt do ruído de TODOS os tiles de água. Único de propósito: os 9 tiles
 *  (parada + 8 setores de fluxo) precisam do MESMO grão, senão a água "pisca" de
 *  padrão ao trocar de direção de correnteza. Deriva de TILE.agua pra a água
 *  parada continuar com exatamente o mesmo grão de antes. */
const AGUA_SALT = TILE.agua * 7919 + 1;

/**
 * Escreve um tile de água (16×16) dentro de um ImageData.
 *
 * `ImageData` e não `fillRect` por pixel (2026-07-27): a versão anterior montava
 * uma string `rgb(r,g,b)` e trocava o `fillStyle` a cada pixel — 256 strings
 * alocadas e reparseadas por repintura. Com os 9 tiles de água da regra de
 * correnteza isso viraria 2 304 por repintura, ~10×/s, num PC de laboratório que
 * já está no teto. Aqui é escrita direta no buffer.
 *
 * A água em si: azul CHEIO (a translucidez vem do material, não de furos) com a
 * soma de DUAS senoides cruzadas. Duas exigências desenharam a conta:
 * - **kx/ky INTEIROS**: o período de cada seno divide os 16 px do tile, então o
 *   padrão fecha na borda e a lâmina d'água não mostra costura de bloco pra
 *   bloco. Era o defeito do `sin((x+y)*0.9)` antigo (0,9 não fecha em 16).
 * - **duas ondas, não uma**: uma senoide só lê como "listra andando". A segunda,
 *   perpendicular, com o dobro da frequência e mais lenta, quebra a listra.
 * A crista ganha brilho claro (especular fake) — é o que faz a superfície
 * parecer molhada em vez de um azul liso.
 */
function escreverAgua(
  data: Uint8ClampedArray,
  larguraPx: number,
  colunaPx: number,
  fase: number,
  onda: OndaAgua,
): void {
  const lado = ATLAS.tilePx;
  const w = (Math.PI * 2) / lado; // 1 ciclo por `lado` px → k inteiro fecha o tile
  const m = onda.mistura;

  /** Onda combinada (primária + cruzada) pro vetor `k`. Devolve [altura, crista]. */
  const ondular = (k: readonly [number, number], x: number, y: number): [number, number] => {
    // primária ANDA no sentido do vento/fluxo (fase negativa) …
    const a = Math.sin((k[0] * x + k[1] * y) * w - fase);
    // … secundária cruza a 90°, dobro da frequência e mais devagar
    const b = Math.sin((-k[1] * x + k[0] * y) * w * 2 - fase * 0.55);
    // crista das duas: o corte duplo deixa o brilho em manchas curtas (parece
    // luz batendo), não numa faixa contínua
    return [a * 6 + b * 3, a > 0.82 && b > 0.1 ? 1 : 0];
  };

  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const [ha, ca] = ondular(onda.a, x, y);
      const [hb, cb] = ondular(onda.b, x, y);
      const ripple = ha + (hb - ha) * m;
      const crista = ca + (cb - ca) * m;
      // ruído FIXO por pixel (hash da posição): não pisca, só o ripple se move
      const ruido = (pixelHash(x, y, AGUA_SALT) - 0.5) * 2 * 6;
      const i = (y * larguraPx + colunaPx + x) * 4;
      data[i] = 46 + ripple + ruido + crista * 52;
      data[i + 1] = 108 + ripple + ruido + crista * 44;
      data[i + 2] = 182 + ripple * 0.6 + ruido + crista * 28;
      data[i + 3] = 255;
    }
  }
}

/** ImageData reaproveitados entre repinturas (uma alocação por sessão, não ~10/s). */
let bufParada: ImageData | null = null;
let bufFluxo: ImageData | null = null;

/**
 * Pinta os 9 tiles de água: o da água PARADA (segue o vento) e os 8 da água
 * CORRENTE, um por setor de fluxo.
 *
 * **A regra dos dois relógios** (playtest de 2026-07-27): o usuário apontou que
 * amarrar a água que escorre ao vento era contraditório — "a correnteza da água
 * fluindo deve ditar o movimento e direção da textura". Então a água parada anda
 * no ritmo E no rumo do vento, e a corrente anda no ritmo dela, no rumo do
 * próprio fluxo. Quem escolhe qual tile cada bloco usa é o MESHER (`tileDaAgua`,
 * pelo gradiente de nível da vizinhança); aqui só se pinta os dois conjuntos.
 *
 * Os 8 tiles de fluxo saem num `putImageData` só porque são contíguos numa linha
 * do atlas (ver TILE.aguaFluxo).
 */
function pintarAguas(
  ctx: CanvasRenderingContext2D,
  quadroParada: number,
  ondaVento: OndaAgua,
  quadroFluxo: number,
): void {
  const lado = ATLAS.tilePx;
  const passo = (Math.PI * 2) / AGUA_FRAMES;

  bufParada ??= ctx.createImageData(lado, lado);
  escreverAgua(bufParada.data, lado, 0, (quadroParada % AGUA_FRAMES) * passo, ondaVento);
  const [px, py] = tileOrigin(TILE.agua);
  ctx.putImageData(bufParada, px, py);

  const n = ONDA_AGUA_POR_SETOR.length;
  bufFluxo ??= ctx.createImageData(lado * n, lado);
  const faseFluxo = (quadroFluxo % AGUA_FRAMES) * passo;
  for (let s = 0; s < n; s++) {
    const k = ONDA_AGUA_POR_SETOR[s]!;
    // setor único (sem mistura): a direção do fluxo é discreta por célula, e o
    // mesher troca o TILE quando ela muda — não há virada gradual a suavizar
    escreverAgua(bufFluxo.data, lado * n, s * lado, faseFluxo, { a: k, b: k, mistura: 0 });
  }
  const [fx, fy] = tileOrigin(TILE.aguaFluxo);
  ctx.putImageData(bufFluxo, fx, fy);
}

/** Repinta os tiles da água no canvas do atlas e reenvia a textura à GPU.
 *  Custo: 9×16×16 px + 1 upload do atlas (256²) — chamado ~10×/s pelo render
 *  loop, não por frame. Não mexe em UV, geometria nem material: a correnteza é a
 *  mesma textura mudando de conteúdo.
 *
 *  `quadroParada` anda com o VENTO e `quadroFluxo` no ritmo próprio da água
 *  corrente (ver `pintarAguas`). */
export function animarAguaAtlas(
  texture: THREE.Texture,
  quadroParada: number,
  ondaVento: OndaAgua | undefined,
  quadroFluxo: number,
): void {
  const canvas = texture.image as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  pintarAguas(ctx, quadroParada, ondaVento ?? ONDA_PADRAO, quadroFluxo);
  texture.needsUpdate = true;
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

  // água: tile da PARADA (animado pelo vento) + os 8 da CORRENTE (um por setor
  // de fluxo). Estado inicial; o render loop repinta em animarAguaAtlas.
  pintarAguas(ctx, 0, ONDA_PADRAO, 0);

  // grama alta (§🌬️ 2026-07-27): 3 climas, mesma paleta das gramas do chão
  paintGramaAlta(ctx, TILE.gramaAlta, [92, 158, 60]);
  paintGramaAlta(ctx, TILE.gramaAltaSeca, [178, 162, 66]);
  paintGramaAlta(ctx, TILE.gramaAltaFria, [96, 138, 116]);

  // plantação (§🍖 F6 2026-08-04): 4 estágios, do broto ao trigo maduro
  for (let i = 0; i < 4; i++) paintPlantacao(ctx, TILE.plantacao0 + i, i);

  // fornalha (§🍖 F10b 2026-08-05): chapa + boca apagada + boca em brasa, e as
  // COSTAS lisas do refino (a boca virou uma face só)
  paintFornalhaTopo(ctx, TILE.fornalhaTopo);
  paintFornalhaLado(ctx, TILE.fornalhaLado, false);
  paintFornalhaLado(ctx, TILE.fornalhaLadoAcesa, true);
  paintFornalhaCostas(ctx, TILE.fornalhaCostas);

  // baú (§🍖 F10e 2026-08-05): tampa em cima, ripas + ferrolho nos lados
  paintBau(ctx, TILE.bauTopo, true);
  paintBau(ctx, TILE.bauLado, false);

  // algodão (§🍖 F10c 2026-08-05): 4 estágios cultivados + o pé selvagem
  for (let i = 0; i < 4; i++) paintAlgodao(ctx, TILE.algodao0 + i, i);
  paintAlgodao(ctx, TILE.algodaoSelvagem, 3, true);

  // §🍖 F10h (2026-08-06): as seis culturas — 4 estágios + o pé selvagem, no
  // molde do algodão. O salt é fixo por CULTURA (não por tile) pra os 5 tiles
  // de cada uma dividirem o MESMO desenho de hastes e só mudar altura/fruta.
  const CULTURAS: readonly (readonly [number, number, number, CulturaVisual])[] = [
    [TILE.cenoura0, TILE.cenouraSelvagem, 101, { folha: [82, 148, 70], fruta: [238, 138, 40], frutaNoTopo: false, largura: 2 }],
    [TILE.batata0, TILE.batataSelvagem, 107, { folha: [86, 140, 76], fruta: [196, 162, 96], frutaNoTopo: false, largura: 2 }],
    [TILE.beterraba0, TILE.beterrabaSelvagem, 113, { folha: [104, 64, 108], fruta: [170, 42, 66], frutaNoTopo: false, largura: 2 }],
    [TILE.melancia0, TILE.melanciaSelvagem, 127, { folha: [72, 150, 66], fruta: [40, 120, 56], frutaNoTopo: true, largura: 3 }],
    [TILE.banana0, TILE.bananaSelvagem, 131, { folha: [70, 140, 84], fruta: [240, 206, 60], frutaNoTopo: true, largura: 2 }],
    [TILE.aipim0, TILE.aipimSelvagem, 137, { folha: [84, 152, 78], fruta: [178, 138, 88], frutaNoTopo: false, largura: 1 }],
  ];
  for (const [base, selv, salt, v] of CULTURAS) {
    for (let i = 0; i < 4; i++) paintCultura(ctx, base + i, i, v, salt);
    paintCultura(ctx, selv, 3, v, salt, true);
  }

  // §🪵 (2026-08-15): as 16 mudas de árvore — 4 estágios × 4 espécies, na
  // ordem dos ids. Cores da copa = as das folhas da árvore adulta; casca = a
  // do tronco dela (ver as paletas do logIpe/logAraucaria/logPauBrasil).
  const MUDA_VISUAL: readonly MudaVisual[] = [
    { folha: [52, 118, 44], casca: [104, 78, 48] }, // comum (carvalho)
    { folha: [222, 186, 48], casca: [128, 110, 86] }, // ipê-amarelo
    { folha: [34, 88, 46], casca: [86, 60, 42] }, // araucária (verde-escuro)
    { folha: [42, 130, 54], casca: [124, 66, 46] }, // pau-brasil (mata)
  ];
  for (let esp = 0; esp < MUDA_VISUAL.length; esp++) {
    for (let i = 0; i < 4; i++) {
      paintMuda(ctx, TILE.mudaComum0 + esp * 4 + i, i, MUDA_VISUAL[esp]!);
    }
  }

  // vidro colorido (2026-07-25): mesma paleta das lãs, na ordem VidroBranco..Marrom
  const CORES_VIDRO: readonly Rgb[] = [
    [232, 232, 230], [38, 38, 42], [196, 52, 46], [226, 132, 38],
    [232, 206, 58], [74, 164, 62], [58, 94, 194], [142, 72, 182],
    [226, 140, 170], [70, 178, 190], [130, 130, 134], [110, 80, 54],
  ];
  for (let i = 0; i < CORES_VIDRO.length; i++) {
    paintVidroCor(ctx, TILE.vidroBranco + i, CORES_VIDRO[i]!);
  }

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
