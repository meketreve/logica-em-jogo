import { BICHOS, type TipoBicho, type VarianteBicho } from "@logica/shared";
import {
  type Caixa,
  FACE,
  MASCARA,
  PAPEL,
  type Paleta,
  type Pintor,
  type Rgb,
  type Texel,
  type V3,
  escala,
  granulado,
  hash3,
  hexRgb,
  luminancia,
  mistura,
  ruido3,
} from "./geometria";

/**
 * §🐄 Os MODELOS dos bichos: caixas, pintura e o GLSL que anima cada um.
 *
 * Cada tipo mora numa função só — geometria, textura e animação lado a lado —
 * porque é assim que se mexe num bicho: a orelha nova muda a caixa E a
 * pintura E às vezes o giro. Separar por "tudo que é geometria" num arquivo e
 * "tudo que é animação" noutro obrigaria a abrir três lugares pra uma orelha.
 *
 * Regras que valem pra todos (decisões do projeto, não gosto):
 * - **estado é SILHUETA, não cor** (projetor, daltonismo): tosquiada fica
 *   MAGRA, o tatu vira BOLA, sentado DOBRA, o peixe fora d'água DEITA, o
 *   ferido dá um PULO de lado além do vermelho, o domado ganha COLEIRA;
 * - **brasileiro e reconhecível de longe**: nelore com cupim e orelha caída,
 *   caracu de chifre grande, vira-lata caramelo, frajola de smoking, tatu-bola
 *   de três cintas, tucano de bico laranja, pintinho amarelinho;
 * - **cabe na caixa da tabela** (`largura × altura` de `BICHOS`) em altura e
 *   largura. O COMPRIMENTO passa, como no Minecraft (a vaca do MC tem caixa de
 *   0,9 e corpo de 1,5): vaca de 0,9 de comprimento é um cubo com chifre.
 *
 * Unidade: px = 1/16 de bloco (ver `geometria.ts`). Frente = −Z. Esquerda do
 * BICHO = −X (ele olha pra −Z, então a direita dele é +X).
 */

const P = PAPEL;
const M = MASCARA;

export interface DefModelo {
  readonly caixas: readonly Caixa[];
  /** centro do bicho (px): pra onde encolhe/de onde cresce a bola, e o pivô da raiz */
  readonly centro: V3;
  /** onde os corações nascem (px, já na pose final — acima da cabeça) */
  readonly coracoes: V3;
  /** sentar: o corpo inclina em torno de `pivo` (o quadril de trás) e desce `dy` */
  readonly sentar?: { readonly pivo: V3; readonly ang: number; readonly dy: number };
  /** escala do modelo inteiro (padrão 1) — a arara é desenhada em px "de
   *  passarinho" e cresce aqui pra encher a caixa da tabela */
  readonly escala?: number;
  /** cabeça do filhote, em relação ao corpo encolhido (o "fofo" é cabeção) */
  readonly cabecaFilhote: number;
  /** radianos de passada por bloco andado — perna curta pisa mais vezes */
  readonly passoPorBloco: number;
  /** paleta EXTRA pro filhote (o pintinho é amarelo, não uma galinha miniatura) */
  readonly paletaFilhote?: { readonly corpo: string; readonly detalhe: string; readonly acento: string };
  /**
   * GLSL do tipo, colado dentro do shader único (`render.ts`). Entradas:
   * `papel` (int), `t` (s, já defasado por bicho), `fase` (rad), `amp`
   * (0 parado, 1 andando, até ~1,7 fugindo), `parado` (1−amp, 0..1),
   * `sentaW bolaW voaW foraW feridoT amorW` (0..1, suavizados), `domado`,
   * `movendo`, `filhote` (bool), `semente` (0..1). Saídas: `ang` (giro X,Y,Z
   * da parte no pivô dela), `desl` (px→bloco: multiplicar por PX), `esc`,
   * `corpoDesl` (o que é `preso` ao corpo), `raizAng`/`raizDesl` (o bicho
   * inteiro, em torno do `centro`).
   */
  readonly glsl: string;
}

// ── utilidades de pintura ────────────────────────────────────────────────────

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
const suave = (a: number, b: number, v: number): number => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const BRANCO: Rgb = [250, 248, 242];
const PRETO_OLHO: Rgb = [18, 14, 14];
const VERMELHO_COLEIRA = hexRgb("#c8262a");
const OURO = hexRgb("#f2c440");

/**
 * Sombra PINTADA de baixo pra cima: a Lambert dá um tom por face, então uma
 * caixa grande sai chapada. Escurecer a parte de baixo dá o volume que a
 * caixa não tem — e encosta o bicho no chão (as pernas saem mais escuras).
 */
function sombra(c: Rgb, t: Texel, alturaPx: number, forca = 0.2): Rgb {
  const f = 1 - forca * (1 - suave(0, alturaPx * 0.8, t.y));
  return escala(c, t.face === FACE.baixo ? f * 0.88 : f);
}

/** Índices das variantes cujo nome casa com `re`. */
function onde(vs: readonly VarianteBicho[], re: RegExp): number[] {
  const out: number[] = [];
  vs.forEach((v, i) => {
    if (re.test(v.nome)) out.push(i);
  });
  return out;
}
/** As que NÃO casam — é a família PADRÃO: variante nova (que entra no fim da
 *  tabela, sem código) cai aqui e nasce com a forma comum, nunca invisível. */
function exceto(vs: readonly VarianteBicho[], re: RegExp): number[] {
  const out: number[] = [];
  vs.forEach((v, i) => {
    if (!re.test(v.nome)) out.push(i);
  });
  return out;
}

function cx(de: V3, ate: V3, papel: number, pinta: Pintor, o: Partial<Caixa> = {}): Caixa {
  return { de, ate, papel, pinta, ...o };
}

/** Espelho em x (lado esquerdo ↔ direito). O giro em Y e Z troca de sinal. */
function espelho(c: Caixa, papel = c.papel): Caixa {
  const mx = (v: V3): V3 => [-v[0], v[1], v[2]];
  return {
    ...c,
    papel,
    de: [-c.ate[0], c.de[1], c.de[2]],
    ate: [-c.de[0], c.ate[1], c.ate[2]],
    pivo: c.pivo ? mx(c.pivo) : undefined,
    giroEm: c.giroEm ? mx(c.giroEm) : undefined,
    giro: c.giro ? [c.giro[0], -c.giro[1], -c.giro[2]] : undefined,
  };
}

/** Os três corações do `amor`: pixel art 7×6 em quads de FRENTE só (o shader
 *  os vira pra câmera). 0,55 px por pixel do coração ≈ 0,24 bloco de largura. */
function coracoes(): Caixa[] {
  const s = 0.55;
  const linhas: [number, number, number][] = [
    [5, -3, -1], [5, 1, 3], // os dois lóbulos
    [3, -4, 4], [4, -4, 4], // o miolo (duas linhas inteiras)
    [2, -3, 3],
    [1, -2, 2],
    [0, -1, 1],
  ];
  const pinta: Pintor = (t) => {
    // brilho no lóbulo esquerdo, fundo mais escuro: lê como coração mesmo pequeno
    const px = Math.floor(t.x / s + 3.5);
    const py = Math.floor(t.y / s + 3);
    if (py >= 4 && px === 1) return [255, 210, 220];
    return py <= 1 ? [196, 30, 58] : [236, 58, 90];
  };
  const out: Caixa[] = [];
  for (let k = 0; k < 3; k++) {
    for (const [y, x0, x1] of linhas) {
      out.push(
        cx([(x0 - 0.5) * s, (y - 3) * s, 0], [(x1 + 0.5) * s, (y - 2) * s, 0], P.coracao, pinta, {
          pivo: [0, 0, 0],
          faces: [FACE.frente],
          mascara: M.soAmor | M.emissivo,
          aux: k,
        }),
      );
    }
  }
  return out;
}

/** Coleira do domado (convenção do Minecraft: lobo e gato domados usam coleira
 *  vermelha) — silhueta (um anel que engrossa o pescoço) e cor juntas. */
function coleira(de: V3, ate: V3): Caixa {
  const pinta: Pintor = (t) => {
    // plaquinha dourada embaixo, na frente
    if (t.face === FACE.frente && t.y < de[1] + 1.2 && Math.abs(t.x) < 0.8) return OURO;
    return granulado(VERMELHO_COLEIRA, t, 8);
  };
  return cx(de, ate, P.corpo, pinta, { mascara: M.soDomado | M.preso });
}

// ── GLSL comum às pernas ─────────────────────────────────────────────────────

/** Quadrúpede: pares DIAGONAIS juntos (o trote — é o que cavalo, vaca e cão
 *  fazem; as quatro pernas em fase dariam um coelho). */
const PERNAS_4 = (amplitude: number): string => `
  {
    float passo = sin(fase) * amp * ${amplitude.toFixed(3)};
    if (papel == P_PERNA_FE || papel == P_PERNA_TD) ang.x = passo;
    else if (papel == P_PERNA_FD || papel == P_PERNA_TE) ang.x = -passo;
  }`;

// ═════════════════════════════════════════════════════════════════════════════
// VACA — malhada (holandesa), caracu (chifre grande), nelore (cupim, orelha caída)
// caixa 0,9 × 1,4 = 14,4 × 22,4 px
// ═════════════════════════════════════════════════════════════════════════════
function vaca(vs: readonly VarianteBicho[]): DefModelo {
  const nelore = onde(vs, /nelore/);
  const caracu = onde(vs, /caracu/);
  const comum = exceto(vs, /nelore|caracu/);
  const orelhaDeitada = exceto(vs, /nelore/);

  const pelo = (t: Texel, p: Paleta): Rgb => {
    let c: Rgb = p.corpo;
    if (/malhad/.test(p.nome)) {
      // manchas grandes e irregulares, em 3D: atravessam a quina sem emenda
      const n = ruido3(t.x * 0.14 + 3.1, t.y * 0.16, t.z * 0.14, 11) + ruido3(t.x * 0.45, t.y * 0.45, t.z * 0.45, 12) * 0.16;
      if (n > 0.6) c = p.detalhe;
    } else if (/nelore/.test(p.nome)) {
      // nelore: branco-gelo, cinza mais fechado na cernelha, cupim e pescoço
      const frente = suave(2, -8, t.z) * suave(8, 18, t.y);
      c = mistura(p.corpo, escala(p.detalhe, 0.86), Math.min(1, frente * 1.3));
    } else {
      // caracu: baio-avermelhado liso, mais fechado nas pernas
      c = mistura(p.corpo, p.detalhe, (1 - suave(3, 13, t.y)) * 0.7);
    }
    return sombra(granulado(c, t, 6), t, 22);
  };
  const casco: Pintor = (t, p) => (t.y < 1.6 ? granulado(hexRgb("#3a2e28"), t, 5) : pelo(t, p));
  const cabeca: Pintor = (t, p) => {
    // olho na quina: aparece de frente E de lado (o bicho é visto dos dois jeitos)
    const lado = (t.face === FACE.dir || t.face === FACE.esq) && t.z < -12.6;
    const frente = t.face === FACE.frente && Math.abs(t.x) > 2.2;
    if (t.y >= 16 && t.y < 17 && (lado || frente)) return PRETO_OLHO;
    if (/nelore/.test(p.nome) && t.y >= 15.5 && t.y < 17.5 && (lado || frente)) return mistura(p.acento, p.detalhe, 0.3);
    if (/malhad/.test(p.nome) && t.face === FACE.frente && Math.abs(t.x) < 1.2 && t.y > 14) return granulado(p.corpo, t, 5); // a "estrela" branca na testa
    return pelo(t, p);
  };
  const focinho: Pintor = (t, p) => {
    const base = luminancia(p.acento) > 0.45 ? p.acento : mistura(p.acento, [90, 80, 76], 0.2);
    if (t.face === FACE.frente) {
      if (t.y > 13.6 && t.y < 14.6 && Math.abs(t.x) > 0.6 && Math.abs(t.x) < 1.8) return escala(base, 0.45); // narinas
      if (t.y < 12.7) return escala(base, 0.7); // a boca
    }
    return sombra(granulado(base, t, 5), t, 22, 0.1);
  };
  const chifre: Pintor = (t, p) => {
    const ponta = /caracu/.test(p.nome) ? 20 : /nelore/.test(p.nome) ? 19.8 : 18.4;
    return granulado(t.y > ponta ? hexRgb("#4a4038") : hexRgb("#e8dcc0"), t, 6);
  };
  const ubere: Pintor = (t, p) => {
    const rosa = luminancia(p.acento) > 0.5 ? p.acento : hexRgb("#c9a092");
    return granulado(t.face === FACE.baixo ? escala(rosa, 0.85) : rosa, t, 5);
  };
  const orelha: Pintor = (t, p) => {
    const dentro = luminancia(p.acento) > 0.5 ? p.acento : mistura(p.corpo, p.acento, 0.5);
    if (t.face === FACE.frente) return granulado(dentro, t, 5);
    return /nelore/.test(p.nome) ? granulado(mistura(p.corpo, p.detalhe, 0.6), t, 5) : pelo(t, p);
  };
  const vassoura: Pintor = (t, p) =>
    granulado(/nelore/.test(p.nome) ? p.acento : /malhad/.test(p.nome) ? p.detalhe : escala(p.detalhe, 0.75), t, 6);

  const caixas: Caixa[] = [];
  // pernas 4×10×4, pivô no ombro/quadril
  const pernas: [number, number, number][] = [
    [P.pernaFE, -3.8, -5],
    [P.pernaFD, 3.8, -5],
    [P.pernaTE, -3.8, 5.5],
    [P.pernaTD, 3.8, 5.5],
  ];
  for (const [papel, x, z] of pernas) {
    caixas.push(cx([x - 2, 0, z - 2], [x + 2, 10, z + 2], papel, casco, { pivo: [x, 10, z] }));
  }
  // corpo
  caixas.push(cx([-6, 9.5, -8], [6, 19, 9], P.corpo, pelo, { mascara: M.preso, pivo: [0, 14, 0] }));
  caixas.push(cx([-2, 8, 2.5], [2, 9.6, 7], P.corpo, ubere, { mascara: M.preso | M.soAdulto, pivo: [0, 14, 0] }));
  // nelore: cupim e barbela — é o que faz a criança dizer "boi" de longe
  caixas.push(cx([-3, 18.5, -7.4], [3, 22.2, -2.4], P.corpo, pelo, { mascara: M.preso | M.soAdulto, variantes: nelore, pivo: [0, 14, 0] }));
  caixas.push(cx([-1, 8.2, -9.6], [1, 12.6, -5], P.corpo, pelo, { mascara: M.preso, variantes: nelore, pivo: [0, 14, 0] }));
  // cabeça (pivô no pescoço) + focinho
  const pc: V3 = [0, 15, -8];
  const cab = { pivo: pc, mascara: M.preso };
  caixas.push(cx([-3.5, 12, -14], [3.5, 19, -7.5], P.cabeca, cabeca, cab));
  caixas.push(cx([-2.5, 12, -15.4], [2.5, 15.4, -13.6], P.cabeca, focinho, cab));
  // orelhas: deitadas (malhada/caracu) ou CAÍDAS (nelore, zebuíno)
  const orelhaD = cx([3.5, 15.6, -10.6], [5.6, 16.8, -9.2], P.cabeca, orelha, { ...cab, variantes: orelhaDeitada });
  caixas.push(orelhaD, espelho(orelhaD));
  const orelhaN = cx([3.4, 12.6, -10.9], [4.4, 16.9, -9.3], P.cabeca, orelha, {
    ...cab,
    variantes: nelore,
    giro: [0, 0, 0.22],
    giroEm: [3.4, 16.9, -10],
  });
  caixas.push(orelhaN, espelho(orelhaN));
  // chifres: tocos (malhada), LIRA (caracu), curtos pra cima (nelore). Filhote não tem.
  const chif = { pivo: pc, mascara: M.preso | M.soAdulto };
  const tocoD = cx([3.2, 17.4, -11.4], [4.4, 18.8, -10.1], P.cabeca, chifre, { ...chif, variantes: comum });
  const liraBase = cx([3.2, 17.4, -11.5], [6.2, 18.8, -10.2], P.cabeca, chifre, { ...chif, variantes: caracu });
  const liraPonta = cx([5, 18.8, -11.5], [6.2, 21.6, -10.2], P.cabeca, chifre, { ...chif, variantes: caracu });
  const curto = cx([1.8, 18.8, -11], [3, 20.4, -9.9], P.cabeca, chifre, { ...chif, variantes: nelore });
  for (const c of [tocoD, liraBase, liraPonta, curto]) caixas.push(c, espelho(c));
  // rabo pendurado + a vassourinha
  const rabo = { pivo: [0, 18.4, 9.5] as V3, mascara: M.preso };
  caixas.push(cx([-0.5, 10.6, 9.05], [0.5, 18.4, 10.05], P.rabo, pelo, rabo));
  caixas.push(cx([-1, 8.4, 8.8], [1, 11, 10.3], P.rabo, vassoura, rabo));
  caixas.push(...coracoes());

  return {
    caixas,
    centro: [0, 13, 0],
    coracoes: [0, 23, -11],
    cabecaFilhote: 1.35,
    passoPorBloco: (Math.PI * 2) / 1.25,
    glsl: `
      ${PERNAS_4(0.5)}
      if (papel == P_CABECA) {
        // pasta: num ciclo de ~14 s, PARADA, baixa a cabeça ao capim e mastiga
        float c = fract(t / 14.0 + semente);
        float pasta = smoothstep(0.64, 0.7, c) * (1.0 - smoothstep(0.9, 0.96, c)) * parado;
        ang.x = -0.95 * pasta + 0.05 * sin(t * 9.0) * pasta
              + 0.05 * sin(t * 1.1) * parado * (1.0 - pasta) + 0.06 * sin(fase * 2.0) * amp;
        ang.y = 0.35 * sin(t * 0.31 + semente * 6.0) * parado * (1.0 - pasta);
      } else if (papel == P_RABO) {
        // espanta mosca: balanço lento + uma chicotada de vez em quando
        ang.z = 0.2 * sin(t * 1.5) + 0.25 * sin(t * 7.0) * smoothstep(0.82, 0.9, fract(t / 6.0 + semente));
        ang.x = -0.35 * amp;
      } else if (papel == P_CORPO) {
        esc = 1.0 + 0.015 * sin(t * 1.8);
      }
    `,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// GALINHA — branca, carijó (barrada), caipira (pescoço dourado, ovo vermelho)
// caixa 0,45 × 0,7 = 7,2 × 11,2 px
// ═════════════════════════════════════════════════════════════════════════════
function galinha(_vs: readonly VarianteBicho[]): DefModelo {
  const plumagem = (t: Texel, p: Paleta): Rgb => {
    let c: Rgb = p.corpo;
    if (/carij/.test(p.nome)) {
      // barrado do carijó: faixas claras e escuras finas e meio tortas
      const b = t.y * 0.95 + t.z * 0.22 + ruido3(t.x * 0.7, t.y * 0.7, t.z * 0.7, 3) * 0.9;
      c = ((b % 1.5) + 1.5) % 1.5 < 0.62 ? hexRgb("#dcd8ce") : p.corpo;
    } else if (/caipira/.test(p.nome)) {
      // pescoço e peito dourados (o "frango caipira" dos desenhos)
      const gola = suave(-0.5, -3.5, t.z) * suave(5.5, 8, t.y);
      c = mistura(p.corpo, hexRgb("#e4a040"), gola * 0.75);
    } else if (/pintinho/.test(p.nome)) {
      c = mistura(p.corpo, [255, 240, 150], suave(4, 9, t.y) * 0.35);
    }
    return sombra(granulado(c, t, /branca/.test(p.nome) ? 4 : 7), t, 11, 0.16);
  };
  const cabeca: Pintor = (t, p) => {
    const lado = t.face === FACE.dir || t.face === FACE.esq;
    if (lado && t.y >= 8.6 && t.y < 9.6 && t.z >= -4.4 && t.z < -3.4) return PRETO_OLHO;
    return plumagem(t, p);
  };
  const crista: Pintor = (t, p) => sombra(granulado(p.detalhe, t, 10), t, 11, 0.1);
  const bico: Pintor = (t, p) => granulado(t.face === FACE.baixo ? escala(p.acento, 0.8) : p.acento, t, 6);
  const pata: Pintor = (t, p) => granulado(escala(p.acento, 0.92), t, 6);
  const asa: Pintor = (t, p) => {
    let c = plumagem(t, p);
    if (/caipira/.test(p.nome)) c = escala(mistura(p.corpo, [60, 30, 18], 0.3), 1);
    // ponta das penas mais escura: a asa se separa do corpo
    if (t.y < 4.8) c = escala(c, 0.8);
    return sombra(granulado(c, t, 6), t, 11, 0.1);
  };
  const cauda: Pintor = (t, p) => {
    if (/caipira/.test(p.nome)) return granulado(hexRgb("#26302a"), t, 8); // verde-preto do rabo do galo
    return escala(plumagem(t, p), 0.92);
  };
  const ovo: Pintor = (t, p) => {
    const c = /caipira/.test(p.nome) ? hexRgb("#d4a070") : hexRgb("#f6f0e2");
    return hash3(t.x * 3, t.y * 3, t.z * 3, 9) > 0.9 ? escala(c, 0.88) : granulado(c, t, 3);
  };

  const caixas: Caixa[] = [];
  for (const [papel, x] of [[P.pernaFE, -1.2], [P.pernaFD, 1.2]] as const) {
    const o = { pivo: [x, 3.6, 0] as V3 };
    caixas.push(cx([x - 0.5, 0.4, -0.5], [x + 0.5, 3.6, 0.5], papel, pata, o));
    caixas.push(cx([x - 1, 0, -1.8], [x + 1, 0.5, 0.6], papel, pata, o)); // os dedos
  }
  const corpo = { mascara: M.preso, pivo: [0, 5.5, 0.5] as V3 };
  caixas.push(cx([-2.5, 3, -2.5], [2.5, 8, 3.5], P.corpo, plumagem, corpo));
  caixas.push(cx([-2.1, 3.5, -3.2], [2.1, 7.3, -2.4], P.corpo, plumagem, corpo)); // o peito estufado
  // cauda erguida pra trás (o galo/galinha de desenho)
  caixas.push(cx([-1.5, 6.2, 2.8], [1.5, 10, 4.8], P.rabo, cauda, { mascara: M.preso | M.soAdulto, pivo: [0, 6.5, 3.4], giro: [0.4, 0, 0] }));
  // cabeça + crista serrilhada + bico + barbela
  const cab = { pivo: [0, 7.6, -2.6] as V3, mascara: M.preso };
  caixas.push(cx([-1.5, 7, -5], [1.5, 10, -2], P.cabeca, cabeca, cab));
  const cris = { ...cab, mascara: M.preso | M.soAdulto };
  caixas.push(cx([-0.5, 10, -4.7], [0.5, 10.6, -2.2], P.cabeca, crista, cris));
  caixas.push(cx([-0.5, 10.6, -4.5], [0.5, 11.2, -3.8], P.cabeca, crista, cris));
  caixas.push(cx([-0.5, 10.6, -3.2], [0.5, 11.2, -2.5], P.cabeca, crista, cris));
  caixas.push(cx([-0.75, 8, -6.3], [0.75, 9, -4.9], P.cabeca, bico, cab));
  caixas.push(cx([-0.5, 6.3, -5.5], [0.5, 8, -4.8], P.cabeca, crista, cris));
  // asas: penduradas no ombro, abrem em Z (o bater de asa do Minecraft)
  const asaD = cx([2.5, 4, -1.6], [3.5, 7.6, 3], P.asaD, asa, { mascara: M.preso, pivo: [2.5, 7.6, 0.5] });
  caixas.push(asaD, espelho(asaD, P.asaE));
  // o ovo no chão, nos pés dela, à frente e de lado (de frente e de lado se vê)
  caixas.push(cx([0.9, 0, -5.4], [3.1, 1.9, -3.2], P.ovo, ovo, { mascara: M.soOvo, pivo: [2, 0, -4.3] }));
  caixas.push(cx([1.3, 1.9, -5], [2.7, 2.8, -3.6], P.ovo, ovo, { mascara: M.soOvo, pivo: [2, 0, -4.3] }));
  caixas.push(...coracoes());

  return {
    caixas,
    centro: [0, 5, 0],
    coracoes: [0, 12.4, -3],
    cabecaFilhote: 1.45,
    passoPorBloco: (Math.PI * 2) / 0.42,
    paletaFilhote: { corpo: "#f6d84a", detalhe: "#f6d84a", acento: "#ee8a22" },
    glsl: `
      {
        float passo = sin(fase) * amp * 0.85;
        if (papel == P_PERNA_FE) ang.x = passo;
        else if (papel == P_PERNA_FD) ang.x = -passo;
      }
      if (papel == P_CABECA) {
        // bica o chão em rajadas de duas bicadas, só de vez em quando
        float c = fract(t / 3.2 + semente);
        float bica = (smoothstep(0.0, 0.04, c) - smoothstep(0.07, 0.12, c))
                   + (smoothstep(0.16, 0.2, c) - smoothstep(0.23, 0.28, c));
        bica *= step(0.45, fract(t / 9.0 + semente * 3.0)) * parado;
        ang.x = -1.1 * bica;
        // olha aos TRANCOS: galinha não gira a cabeça, ela salta de um ângulo pro outro
        float k = floor(t * 1.3 + semente * 7.0);
        ang.y = (hash1(k) - 0.5) * 1.2 * parado * (1.0 - bica);
        // e anda com a cabeça indo e voltando (o "pescoço de galinha")
        desl.z = -abs(sin(fase)) * amp * 0.9 * PX;
      }
      {
        // bate asa caindo (voando) ou fugindo depressa
        float bate = max(voaW, clamp((amp - 1.15) * 3.0, 0.0, 1.0));
        float abre = bate * (0.3 + 0.9 * (0.5 + 0.5 * sin(t * 30.0)));
        if (papel == P_ASA_D) ang.z = abre;
        else if (papel == P_ASA_E) ang.z = -abre;
      }
      if (papel == P_RABO) ang.x = 0.06 * sin(t * 2.0) - 0.2 * amp;
      if (papel == P_CORPO) esc = 1.0 + 0.02 * sin(t * 3.0);
      corpoDesl.y = abs(sin(fase)) * amp * 0.5 * PX;
    `,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// OVELHA — lã volumosa; TOSQUIADA fica visivelmente mais magra (silhueta)
// caixa 0,9 × 1,3 = 14,4 × 20,8 px
// ═════════════════════════════════════════════════════════════════════════════
function ovelha(_vs: readonly VarianteBicho[]): DefModelo {
  const la = (t: Texel, p: Paleta): Rgb => {
    // cachos: bolotas de ~2 px, claras no meio e com a sombra da cor de detalhe
    const k = ruido3(t.x * 0.62, t.y * 0.62, t.z * 0.62, 21);
    let c = mistura(p.corpo, p.detalhe, suave(0.45, 0.85, k) * 0.6);
    if (hash3(t.x / 1.6, t.y / 1.6, t.z / 1.6, 22) > 0.7) c = mistura(c, [255, 255, 255], luminancia(p.corpo) > 0.5 ? 0.35 : 0.1);
    return sombra(granulado(c, t, 5), t, 20, 0.16);
  };
  const pele = (t: Texel, p: Paleta): Rgb => {
    // tosquiada: pelo curtinho cor de pele — clara na branca, escura nas outras
    const base = luminancia(p.corpo) > 0.6 ? mistura(p.detalhe, hexRgb("#e8c4b0"), 0.35) : mistura(p.corpo, hexRgb("#8a6a58"), 0.3);
    return sombra(granulado(base, t, 7), t, 20, 0.14);
  };
  const cara: Pintor = (t, p) => {
    const lado = (t.face === FACE.dir || t.face === FACE.esq) && t.z < -12.2;
    const frente = t.face === FACE.frente && Math.abs(t.x) > 1.4;
    if (t.y >= 16 && t.y < 17 && (lado || frente)) return hexRgb("#e8c460"); // olho âmbar no rosto escuro
    if (t.face === FACE.frente && t.y < 14 && Math.abs(t.x) < 1.2) return granulado(mistura(p.acento, hexRgb("#b08878"), 0.35), t, 4);
    return sombra(granulado(p.acento, t, 6), t, 20, 0.1);
  };
  const perna: Pintor = (t, p) => granulado(t.y < 1.4 ? escala(p.acento, 0.6) : p.acento, t, 6);
  const orelhaPinta: Pintor = (t, p) =>
    granulado(t.face === FACE.frente ? mistura(p.acento, hexRgb("#c89088"), 0.35) : escala(p.acento, 0.9), t, 5);

  const caixas: Caixa[] = [];
  const pernas: [number, number, number][] = [
    [P.pernaFE, -3.5, -5],
    [P.pernaFD, 3.5, -5],
    [P.pernaTE, -3.5, 5],
    [P.pernaTD, 3.5, 5],
  ];
  for (const [papel, x, z] of pernas) {
    const o = { pivo: [x, 10, z] as V3 };
    caixas.push(cx([x - 1.5, 0, z - 1.5], [x + 1.5, 10, z + 1.5], papel, perna, o));
    caixas.push(cx([x - 2.2, 6.4, z - 2.2], [x + 2.2, 10.4, z + 2.2], papel, la, { ...o, mascara: M.semTosquia }));
  }
  const corpo = { pivo: [0, 14, 0] as V3 };
  caixas.push(cx([-6, 9.5, -7.5], [6, 19, 8], P.corpo, la, { ...corpo, mascara: M.preso | M.semTosquia }));
  // o topo arredondado: um degrau de lã por cima tira a cara de caixote
  caixas.push(cx([-5, 18.6, -6.5], [5, 19.9, 7], P.corpo, la, { ...corpo, mascara: M.preso | M.semTosquia }));
  caixas.push(cx([-4.4, 10, -6.5], [4.4, 16.4, 7], P.corpo, pele, { ...corpo, mascara: M.preso | M.soTosquia }));
  const cab = { pivo: [0, 15.5, -7.5] as V3, mascara: M.preso };
  caixas.push(cx([-2.5, 12.4, -13.2], [2.5, 18, -7], P.cabeca, cara, cab));
  caixas.push(cx([-3, 16.5, -11.2], [3, 19.6, -6.2], P.cabeca, la, { ...cab, mascara: M.preso | M.semTosquia })); // o topete
  const orelha = cx([2.5, 15.5, -10.4], [4.6, 16.5, -9.1], P.cabeca, orelhaPinta, { ...cab, giro: [0, 0, -0.25], giroEm: [2.5, 16, -9.8] });
  caixas.push(orelha, espelho(orelha));
  const rabo = { pivo: [0, 17, 8.5] as V3 };
  caixas.push(cx([-1.5, 13.5, 7.8], [1.5, 17, 9.8], P.rabo, la, { ...rabo, mascara: M.preso | M.semTosquia }));
  caixas.push(cx([-0.8, 13.4, 6.8], [0.8, 16.4, 8.3], P.rabo, pele, { pivo: [0, 16.4, 7.2], mascara: M.preso | M.soTosquia }));
  caixas.push(...coracoes());

  return {
    caixas,
    centro: [0, 12, 0],
    coracoes: [0, 21.5, -9],
    cabecaFilhote: 1.35,
    passoPorBloco: (Math.PI * 2) / 1.15,
    glsl: `
      ${PERNAS_4(0.5)}
      if (papel == P_CABECA) {
        float c = fract(t / 10.0 + semente);
        float pasta = smoothstep(0.6, 0.67, c) * (1.0 - smoothstep(0.88, 0.95, c)) * parado;
        ang.x = -0.85 * pasta + 0.06 * sin(t * 11.0) * pasta
              + 0.05 * sin(t * 1.3) * parado * (1.0 - pasta) + 0.05 * sin(fase * 2.0) * amp;
        ang.y = 0.3 * sin(t * 0.37 + semente * 6.0) * parado * (1.0 - pasta);
      } else if (papel == P_RABO) {
        ang.y = 0.25 * sin(t * 2.3) * (0.4 + amp);
      } else if (papel == P_CORPO) {
        esc = 1.0 + 0.015 * sin(t * 2.0);
      }
    `,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// CÃO — vira-lata caramelo, preto (de sobrancelha), malhado (orelha caída)
// caixa 0,6 × 0,85 = 9,6 × 13,6 px
// ═════════════════════════════════════════════════════════════════════════════
function cao(vs: readonly VarianteBicho[]): DefModelo {
  const caida = onde(vs, /malhad/);
  const empinada = exceto(vs, /malhad/);
  const pelo = (t: Texel, p: Paleta): Rgb => {
    let c: Rgb = p.corpo;
    if (/malhad/.test(p.nome)) {
      const n = ruido3(t.x * 0.24 + 1.7, t.y * 0.24, t.z * 0.24, 31);
      if (n > 0.57) c = p.detalhe;
    } else {
      // peito, barriga e patas mais claros (o caramelo "de meia")
      const peito = (t.z < -3.6 && t.y < 9.6 && Math.abs(t.x) < 2.2 && t.face !== FACE.topo) || (t.y < 6.4 && t.face === FACE.baixo);
      const pata = t.y < 1.2;
      if (peito || pata) c = mistura(p.corpo, p.detalhe, /preto/.test(p.nome) ? 0.55 : 0.85);
    }
    return sombra(granulado(c, t, 7), t, 13.6, 0.2);
  };
  const cabeca: Pintor = (t, p) => {
    const olho = t.face === FACE.frente && t.y >= 10.4 && t.y < 11.4 && Math.abs(t.x) > 0.6 && Math.abs(t.x) < 1.7;
    if (olho) return /preto/.test(p.nome) ? hexRgb("#5a3a1c") : PRETO_OLHO;
    // as sobrancelhas cor de canela do vira-lata preto (as "pintinhas")
    if (/preto/.test(p.nome) && t.face === FACE.frente && t.y >= 11.4 && t.y < 12.3 && Math.abs(t.x) > 0.6 && Math.abs(t.x) < 1.7) return hexRgb("#c0803e");
    return pelo(t, p);
  };
  const focinho: Pintor = (t, p) => {
    // a trufa: o canto de cima-frente, visto de frente E de cima
    if (t.z < -10.4 && t.y > 9.4 && Math.abs(t.x) < 1.1) return granulado(p.acento, t, 4);
    const claro = /malhad/.test(p.nome) ? p.corpo : mistura(p.corpo, p.detalhe, /preto/.test(p.nome) ? 0.6 : 0.85);
    return sombra(granulado(claro, t, 5), t, 13.6, 0.1);
  };
  const orelha: Pintor = (t, p) => {
    const c = /malhad/.test(p.nome) ? p.detalhe : escala(p.corpo, 0.82);
    return granulado(c, t, 6);
  };
  const rabo: Pintor = (t, p) => (t.z > 10 && !/preto/.test(p.nome) ? granulado(mistura(p.corpo, p.detalhe, 0.9), t, 5) : pelo(t, p));

  const caixas: Caixa[] = [];
  // pernas + a pose de SENTADO: as de trás deitam pra frente, as da frente sobem com o peito
  const pernas: [number, number, number, V3][] = [
    [P.pernaFE, -1.7, -3, [0, 0, 0]],
    [P.pernaFD, 1.7, -3, [0, 0, 0]],
    [P.pernaTE, -1.7, 4, [1.5708, -4.6, 1.6]],
    [P.pernaTD, 1.7, 4, [1.5708, -4.6, 1.6]],
  ];
  for (const [papel, x, z, sentado] of pernas) {
    caixas.push(cx([x - 1, 0, z - 1], [x + 1, 5.6, z + 1], papel, pelo, { pivo: [x, 5.6, z], sentado }));
  }
  const corpo = { mascara: M.preso, pivo: [0, 8, 1] as V3 };
  caixas.push(cx([-2.5, 5.5, -4], [2.5, 9.6, 6], P.corpo, pelo, corpo));
  caixas.push(cx([-2.8, 5.2, -5], [2.8, 10, -1.2], P.corpo, pelo, corpo)); // peito
  const cab = { pivo: [0, 9.5, -5] as V3, mascara: M.preso };
  caixas.push(cx([-2.5, 8, -8.5], [2.5, 12.3, -4.5], P.cabeca, cabeca, cab));
  caixas.push(cx([-1.5, 8, -11], [1.5, 10.3, -8.3], P.cabeca, focinho, cab));
  // orelhas: em pé, meio dobradas (caramelo/preto) ou caídas (malhado)
  const emPe = cx([0.9, 12.2, -6.9], [2.4, 13.15, -5.8], P.cabeca, orelha, { ...cab, variantes: empinada, giro: [0.35, 0, -0.18], giroEm: [1.6, 12.2, -6.3] });
  const caidaD = cx([2.5, 9.2, -7.4], [3.1, 12.4, -5.4], P.cabeca, orelha, { ...cab, variantes: caida, giro: [0, 0, 0.15], giroEm: [2.5, 12.4, -6.4] });
  caixas.push(emPe, espelho(emPe), caidaD, espelho(caidaD));
  // rabo pra cima e pra trás; abana no shader
  caixas.push(cx([-0.75, 8.5, 5.8], [0.75, 10, 11], P.rabo, rabo, { mascara: M.preso, pivo: [0, 9.25, 6], giro: [-0.7, 0, 0] }));
  caixas.push(coleira([-3.1, 7.8, -5.7], [3.1, 11, -4.6]));
  caixas.push(...coracoes());

  return {
    caixas,
    centro: [0, 7, 0],
    coracoes: [0, 15, -6.5],
    // gira na quina de BAIXO-TRÁS do corpo e desce até ela pousar nas coxas (2 px)
    sentar: { pivo: [0, 5.5, 6], ang: 0.75, dy: -4.2 },
    cabecaFilhote: 1.4,
    passoPorBloco: (Math.PI * 2) / 0.85,
    glsl: `
      ${PERNAS_4(0.65)}
      if (papel == P_CABECA) {
        ang.x = 0.06 * sin(t * 1.2) * parado + 0.05 * sin(fase * 2.0) * amp;
        ang.y = 0.45 * sin(t * 0.43 + semente * 5.0) * parado;
        // sentado: a cabeça desconta o tronco empinado e inclina de lado (o "hein?")
        ang.x -= sentaW * 0.55;
        ang.z = 0.3 * sentaW * sin(t * 0.7 + semente * 4.0);
      } else if (papel == P_RABO) {
        // domado abana RÁPIDO e largo; solto, só balança
        float f = domado ? 16.0 : (movendo ? 7.0 : 3.0);
        float a = domado ? 0.6 : (movendo ? 0.3 : 0.16);
        ang.y = sin(t * f) * a;
        ang.x = sentaW * 1.1;
      }
      corpoDesl.y = abs(sin(fase)) * amp * 0.35 * PX;
    `,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// GATO — laranja, preto, rajado (de "M" na testa), frajola (smoking)
// caixa 0,5 × 0,6 = 8 × 9,6 px
// ═════════════════════════════════════════════════════════════════════════════
function gato(_vs: readonly VarianteBicho[]): DefModelo {
  const branco = (t: Texel): boolean =>
    t.face === FACE.baixo ||
    (t.z < -1.8 && t.y < 4.8 && Math.abs(t.x) < 1.6) || // o peitilho da camisa
    t.y < 1.1; // as luvas
  const pelo = (t: Texel, p: Paleta): Rgb => {
    let c: Rgb = p.corpo;
    if (/frajola/.test(p.nome)) {
      c = branco(t) ? p.corpo : p.detalhe;
    } else if (/preto/.test(p.nome)) {
      c = mistura(p.corpo, p.detalhe, ruido3(t.x * 0.5, t.y * 0.5, t.z * 0.5, 51));
    } else {
      // listras do rajado/laranja: atravessam o dorso; a barriga é lisa e clara
      const s = t.z * 0.44 + Math.abs(t.x) * 0.1 + ruido3(t.x * 0.4, t.y * 0.4, t.z * 0.4, 52) * 0.55;
      const barriga = t.y < 3.6 || t.face === FACE.baixo;
      if (barriga) c = mistura(p.corpo, p.acento, 0.7);
      else if (((s % 1) + 1) % 1 < 0.34) c = p.detalhe;
    }
    return sombra(granulado(c, t, 6), t, 9.6, 0.18);
  };
  const corOlho = (p: Paleta): Rgb =>
    /preto/.test(p.nome) ? p.acento : /frajola/.test(p.nome) ? hexRgb("#c8d850") : hexRgb("#86c040");
  const cabeca: Pintor = (t, p) => {
    if (t.face === FACE.frente && t.y >= 6 && t.y < 7 && Math.abs(t.x) > 0.5 && Math.abs(t.x) < 1.7) return corOlho(p);
    // o "M" na testa do rajado/laranja: três traços verticais
    if (!/preto|frajola/.test(p.nome) && t.face === FACE.frente && t.y >= 7 && (Math.abs(t.x) < 0.5 || (Math.abs(t.x) > 1 && Math.abs(t.x) < 1.6)))
      return p.detalhe;
    if (/frajola/.test(p.nome) && t.face === FACE.frente && t.y < 5.6 && Math.abs(t.x) < 1.2) return granulado(p.corpo, t, 4);
    return pelo(t, p);
  };
  const focinho: Pintor = (t, p) => {
    const claro = /preto/.test(p.nome) ? p.corpo : /frajola/.test(p.nome) ? p.corpo : mistura(p.corpo, p.acento, 0.8);
    if (t.face === FACE.frente && t.y > 5.1 && Math.abs(t.x) < 0.5) return /frajola/.test(p.nome) ? p.acento : hexRgb("#d88a8a");
    return granulado(claro, t, 4);
  };
  const orelha: Pintor = (t, p) => {
    if (t.face === FACE.frente && Math.abs(t.x) > 1 && Math.abs(t.x) < 1.8 && t.y < 9) return hexRgb("#e8a0a4");
    return pelo(t, p);
  };
  const rabo: Pintor = (t, p) => {
    if (/frajola/.test(p.nome)) return granulado(p.detalhe, t, 5);
    if (/preto/.test(p.nome)) return pelo(t, p);
    // anéis no rabo do rajado/laranja
    const anel = Math.floor((t.z + t.y) * 0.75) % 2 === 0;
    return sombra(granulado(anel ? p.detalhe : p.corpo, t, 5), t, 9.6, 0.1);
  };

  const caixas: Caixa[] = [];
  const pernas: [number, number, number, V3][] = [
    [P.pernaFE, -1.1, -2.8, [0, 0, 0]],
    [P.pernaFD, 1.1, -2.8, [0, 0, 0]],
    [P.pernaTE, -1.1, 3.3, [1.5708, -2.45, 1.1]],
    [P.pernaTD, 1.1, 3.3, [1.5708, -2.45, 1.1]],
  ];
  for (const [papel, x, z, sentado] of pernas) {
    caixas.push(cx([x - 0.75, 0, z - 0.75], [x + 0.75, 3.2, z + 0.75], papel, pelo, { pivo: [x, 3.2, z], sentado }));
  }
  const corpo = { mascara: M.preso, pivo: [0, 4.8, 0.4] as V3 };
  caixas.push(cx([-2, 3, -3.8], [2, 6.5, 4.5], P.corpo, pelo, corpo));
  const cab = { pivo: [0, 5.6, -3.8] as V3, mascara: M.preso };
  caixas.push(cx([-2.25, 4.3, -7], [2.25, 7.8, -3.4], P.cabeca, cabeca, cab));
  caixas.push(cx([-1.25, 4.3, -7.8], [1.25, 5.7, -6.8], P.cabeca, focinho, cab));
  // orelhas pontudas em dois degraus (o triângulo possível com caixas)
  const orelhaA = cx([0.6, 7.8, -5.5], [2.1, 8.9, -4.6], P.cabeca, orelha, cab);
  const orelhaB = cx([1.0, 8.9, -5.3], [1.8, 9.5, -4.8], P.cabeca, orelha, cab);
  caixas.push(orelhaA, espelho(orelhaA), orelhaB, espelho(orelhaB));
  // o rabo ERGUIDO (o gato feliz), em dois gomos: o de cima curva pra frente
  caixas.push(cx([-0.5, 5.5, 4.2], [0.5, 6.5, 8.4], P.rabo, rabo, { mascara: M.preso, pivo: [0, 6, 4.4], giro: [-0.95, 0, 0] }));
  caixas.push(coleira([-2.4, 4.6, -4.3], [2.4, 7, -3.5]));
  caixas.push(...coracoes());

  return {
    caixas,
    centro: [0, 4.5, 0],
    coracoes: [0, 10.8, -5],
    sentar: { pivo: [0, 3, 4.5], ang: 0.6, dy: -1.5 },
    cabecaFilhote: 1.4,
    passoPorBloco: (Math.PI * 2) / 0.6,
    glsl: `
      ${PERNAS_4(0.6)}
      if (papel == P_CABECA) {
        ang.y = 0.5 * sin(t * 0.27 + semente * 4.0) * parado;
        ang.x = 0.05 * sin(t * 0.9) * parado + 0.04 * sin(fase * 2.0) * amp - sentaW * 0.45;
      } else if (papel == P_RABO) {
        // o rabo de gato nunca para: sobe e desce devagar, e a ponta varre de lado
        ang.z = 0.25 * sin(t * 1.1 + semente * 3.0);
        ang.x = 0.12 * sin(t * 0.6) + sentaW * 1.4 - 0.15 * amp;
      }
    `,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// TATU — tatu-bola (3 cintas, vira BOLA) e tatu-galinha (muitas cintas, rabo longo)
// caixa 0,6 × 0,55 = 9,6 × 8,8 px
// ═════════════════════════════════════════════════════════════════════════════
function tatu(vs: readonly VarianteBicho[]): DefModelo {
  const galinha = onde(vs, /galinha/);
  const bola = exceto(vs, /galinha/);
  const escamas = (t: Texel, p: Paleta): Rgb => {
    // a carapaça de "botões": grade de 1,5 px com borda escura
    const gx = ((t.x + 20) / 1.5) % 1;
    const gz = ((t.z + 20) / 1.5) % 1;
    const gy = ((t.y + 20) / 1.5) % 1;
    const borda = t.face === FACE.topo ? gx < 0.25 || gz < 0.25 : t.face === FACE.frente || t.face === FACE.tras ? gx < 0.25 || gy < 0.25 : gz < 0.25 || gy < 0.25;
    let c = mistura(p.corpo, p.acento, hash3(t.x / 1.5, t.y / 1.5, t.z / 1.5, 41) * 0.35);
    if (borda) c = mistura(c, p.detalhe, 0.7);
    return sombra(granulado(c, t, 5), t, 8.8, 0.22);
  };
  const cinta = (k: number): Pintor => (t, p) => {
    // cintas alternadas, mais escuras na borda — lidas de longe como FAIXAS
    const c = k % 2 === 0 ? p.corpo : mistura(p.corpo, p.detalhe, 0.45);
    const ponto = hash3(t.x, t.y, k, 42) > 0.7 ? mistura(c, p.acento, 0.35) : c;
    return sombra(granulado(ponto, t, 5), t, 8.8, 0.22);
  };
  const pele: Pintor = (t, p) => {
    const c = /galinha/.test(p.nome) ? mistura(p.acento, hexRgb("#c8a0a0"), 0.3) : p.acento;
    if (t.z < -8.4 && t.face === FACE.frente) return escala(c, 0.6); // o focinho
    if (t.y < 0.6) return escala(c, 0.55); // unhas
    return sombra(granulado(c, t, 6), t, 8.8, 0.15);
  };
  const cabeca: Pintor = (t, p) => {
    const lado = t.face === FACE.dir || t.face === FACE.esq;
    if (lado && t.y >= 2.8 && t.y < 3.8 && t.z >= -7.3 && t.z < -6.3) return PRETO_OLHO;
    return pele(t, p);
  };
  const bolaPinta: Pintor = (t, p) => {
    // a bola fechada: as cintas dão a volta, e as placas da cabeça e do rabo se
    // encaixam nas pontas (é assim que o tatu-bola tranca a bola)
    if ((t.face === FACE.frente || t.face === FACE.tras) && Math.abs(t.x) < 1.6 && Math.abs(t.y - 3.5) < 1.6)
      return mistura(escamas(t, p), p.acento, 0.35);
    const k = Math.floor((t.z + 20) / 1.6);
    const c = k % 2 === 0 ? p.corpo : mistura(p.corpo, p.detalhe, 0.45);
    return sombra(granulado(hash3(t.x, t.y, k, 43) > 0.72 ? mistura(c, p.acento, 0.35) : c, t, 5), t, 7, 0.25);
  };

  const caixas: Caixa[] = [];
  const pernas: [number, number, number][] = [
    [P.pernaFE, -2.4, -2.8],
    [P.pernaFD, 2.4, -2.8],
    [P.pernaTE, -2.4, 3],
    [P.pernaTD, 2.4, 3],
  ];
  for (const [papel, x, z] of pernas) {
    caixas.push(cx([x - 0.8, 0, z - 0.8], [x + 0.8, 2.6, z + 0.8], papel, pele, { pivo: [x, 2.6, z], mascara: M.escondeBola }));
  }
  const casco = { mascara: M.preso | M.escondeBola, pivo: [0, 4, 0] as V3 };
  // tatu-bola: escudo, 3 CINTAS mais altas (as cristas na silhueta), escudo
  caixas.push(cx([-3.5, 1.8, -5], [3.5, 6.4, -1.8], P.corpo, escamas, { ...casco, variantes: bola }));
  for (let k = 0; k < 3; k++) {
    const z0 = -1.8 + k * 1.3;
    caixas.push(cx([-3.8, 1.6, z0], [3.8, 6.9, z0 + 1.3], P.corpo, cinta(k), { ...casco, variantes: bola }));
  }
  caixas.push(cx([-3.5, 1.8, 2.1], [3.5, 6.2, 5.2], P.corpo, escamas, { ...casco, variantes: bola }));
  // tatu-galinha: escudos curtos e 7 cintas finas
  caixas.push(cx([-3.4, 1.8, -5], [3.4, 6.2, -2.8], P.corpo, escamas, { ...casco, variantes: galinha }));
  for (let k = 0; k < 7; k++) {
    const z0 = -2.8 + k * 0.85;
    caixas.push(cx([-3.6, 1.7, z0], [3.6, 6.6, z0 + 0.85], P.corpo, cinta(k), { ...casco, variantes: galinha }));
  }
  caixas.push(cx([-3.4, 1.8, 3.15], [3.4, 6, 5.2], P.corpo, escamas, { ...casco, variantes: galinha }));
  // a cúpula: arredonda o casco por cima
  caixas.push(cx([-2.6, 6.3, -4.4], [2.6, 7.3, 4.6], P.corpo, escamas, casco));
  // cabeça comprida e baixa, com o casquete e as orelhinhas
  const cab = { pivo: [0, 3.4, -4.8] as V3, mascara: M.preso | M.escondeBola, giro: [-0.22, 0, 0] as V3 };
  caixas.push(cx([-1.2, 1.5, -9], [1.2, 3.9, -4.6], P.cabeca, cabeca, cab));
  caixas.push(cx([-1.3, 3.7, -8.2], [1.3, 4.4, -4.8], P.cabeca, escamas, cab));
  const orelha = cx([0.6, 3.9, -5.7], [1.5, 5.3, -5.1], P.cabeca, pele, { ...cab, variantes: bola });
  const orelhaG = cx([0.6, 3.9, -5.8], [1.5, 6.1, -5.1], P.cabeca, pele, { ...cab, variantes: galinha });
  caixas.push(orelha, espelho(orelha), orelhaG, espelho(orelhaG));
  // rabo: toco blindado (bola) × rabo comprido anelado (galinha)
  const rabo = { mascara: M.preso | M.escondeBola, pivo: [0, 3, 5] as V3 };
  caixas.push(cx([-0.8, 2.2, 5], [0.8, 3.7, 7.2], P.rabo, escamas, { ...rabo, variantes: bola }));
  caixas.push(cx([-0.55, 2.4, 5], [0.55, 3.5, 11], P.rabo, (t, p) => cinta(Math.floor(t.z * 0.8))(t, p), { ...rabo, variantes: galinha, giro: [0.18, 0, 0] }));
  // A BOLA: três caixas cruzadas = o "redondo" de voxel (36 triângulos)
  const c: V3 = [0, 3.5, 0];
  const b = { pivo: c, mascara: M.soBola };
  caixas.push(cx([-3.5, 1.1, -2.4], [3.5, 5.9, 2.4], P.bola, bolaPinta, b));
  caixas.push(cx([-2.4, 0, -2.4], [2.4, 7, 2.4], P.bola, bolaPinta, b));
  caixas.push(cx([-2.4, 1.1, -3.5], [2.4, 5.9, 3.5], P.bola, bolaPinta, b));
  caixas.push(...coracoes());

  return {
    caixas,
    centro: [0, 3.5, 0],
    coracoes: [0, 9, -5],
    cabecaFilhote: 1.3,
    passoPorBloco: (Math.PI * 2) / 0.4,
    glsl: `
      ${PERNAS_4(0.75)}
      if (papel == P_CABECA) {
        // fuça o chão: tremidinha rápida do focinho de tempos em tempos
        float fuca = step(0.55, fract(t / 4.0 + semente)) * parado;
        ang.x = -0.14 * (0.5 + 0.5 * sin(t * 12.0)) * fuca + 0.04 * sin(t * 1.3);
        ang.y = 0.3 * sin(t * 0.5 + semente * 5.0) * parado;
      } else if (papel == P_RABO) {
        ang.y = 0.15 * sin(t * 1.4) + 0.2 * sin(fase) * amp;
      } else if (papel == P_BOLA) {
        // rola pra frente quando anda; parada, balança de leve
        ang.x = -fase * 0.42 + 0.06 * sin(t * 1.7) * parado;
      }
    `,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// PEIXE — lambari (fino, rabo amarelo), tambaqui/pacu (ALTOS), tilápia
// (listrada), traíra (comprida, cabeçuda). caixa 0,5 × 0,35 = 8 × 5,6 px
// ═════════════════════════════════════════════════════════════════════════════
function peixe(vs: readonly VarianteBicho[]): DefModelo {
  const alto = onde(vs, /tambaqui|pacu/);
  const comprido = onde(vs, /tra[ií]ra/);
  const fino = exceto(vs, /tambaqui|pacu|tra[ií]ra/);
  const tilapia = onde(vs, /til[aá]pia/);
  const bifurcado = exceto(vs, /til[aá]pia|tra[ií]ra/);
  const redondo = onde(vs, /til[aá]pia|tra[ií]ra/);
  const dorsalComum = exceto(vs, /til[aá]pia|tambaqui|pacu|tra[ií]ra/);

  const corpo = (t: Texel, p: Paleta): Rgb => {
    const h = suave(0.6, 5, t.y); // 0 ventre → 1 dorso
    let c: Rgb = p.corpo;
    if (/tambaqui/.test(p.nome)) c = mistura(mistura(p.detalhe, p.corpo, 0.25), escala(p.acento, 1.3), suave(0.35, 0.75, h));
    else if (/pacu/.test(p.nome)) c = h < 0.38 ? mistura(p.corpo, p.detalhe, 0.75) : mistura(p.corpo, p.acento, suave(0.6, 1, h) * 0.5);
    else if (/tra[ií]ra/.test(p.nome)) {
      c = ruido3(t.x * 0.6, t.y * 0.6, t.z * 0.6, 61) > 0.55 ? p.detalhe : p.corpo;
      if (h < 0.3) c = mistura(c, p.acento, 0.7);
    } else if (/til[aá]pia/.test(p.nome)) {
      const barra = ((t.z * 0.55 + 10) % 1) < 0.35 && h > 0.25;
      c = barra ? p.detalhe : h < 0.3 ? mistura(p.corpo, p.acento, 0.6) : p.corpo;
    } else {
      // lambari: prata, dorso esverdeado, ventre branco e a mancha preta do "ombro"
      c = mistura(p.corpo, escala(p.acento, 1.6), suave(0.65, 1, h) * 0.55);
      if (h < 0.3) c = mistura(c, BRANCO, 0.45);
      const lado = t.face === FACE.dir || t.face === FACE.esq;
      if (lado && t.z > -2.4 && t.z < -1.3 && t.y > 2.9 && t.y < 3.9) c = p.acento;
      if (lado && t.y > 2.6 && t.y < 3.1) c = mistura(c, BRANCO, 0.35); // a linha lateral que brilha
    }
    // escamas: meia-lua clara a cada px, deslocada linha sim linha não
    const esc = hash3(Math.floor(t.z + (Math.floor(t.y) % 2) * 0.5), Math.floor(t.y), t.x > 0 ? 1 : 0, 62);
    return sombra(granulado(escala(c, 0.94 + esc * 0.12), t, 4), t, 5.6, 0.12);
  };
  const cabeca: Pintor = (t, p) => {
    const lado = t.face === FACE.dir || t.face === FACE.esq;
    const ex = /tra[ií]ra/.test(p.nome) ? -4.6 : /tambaqui|pacu/.test(p.nome) ? -3.6 : -3.9;
    const ey = /tra[ií]ra/.test(p.nome) ? 3.0 : 3.4;
    if (lado && Math.abs(t.z - ex) < 0.5 && Math.abs(t.y - ey) < 0.5) return PRETO_OLHO;
    if (lado && Math.abs(t.z - ex) < 1 && Math.abs(t.y - ey) < 1) return hexRgb("#e8dca0"); // o aro do olho
    return corpo(t, p);
  };
  const boca: Pintor = (t, p) => granulado(escala(mistura(p.corpo, p.acento, 0.5), 0.85), t, 4);
  const nadadeira = (t: Texel, p: Paleta): Rgb => {
    let c: Rgb = p.detalhe;
    if (/lambari/.test(p.nome)) c = t.z > 5 ? hexRgb("#e05a30") : p.detalhe; // ponta do rabo avermelhada
    else if (/tambaqui/.test(p.nome)) c = escala(p.acento, 1.4);
    else if (/pacu/.test(p.nome)) c = t.y < 2 ? p.detalhe : escala(p.acento, 1.4);
    else if (/til[aá]pia/.test(p.nome)) c = ((t.z * 1.2 + t.y) % 1.4) < 0.5 ? escala(p.detalhe, 0.85) : mistura(p.corpo, hexRgb("#c06050"), 0.25);
    else if (/tra[ií]ra/.test(p.nome)) c = ruido3(t.y, t.z, 0, 63) > 0.5 ? p.detalhe : p.corpo;
    return granulado(c, t, 6);
  };
  const manchaRabo: Pintor = (t, p) => {
    const lado = t.face === FACE.dir || t.face === FACE.esq;
    if (/lambari/.test(p.nome) && lado && t.z > 2.9 && t.z < 3.8) return p.acento;
    return corpo(t, p);
  };

  const caixas: Caixa[] = [];
  const raboPivo = (z: number): V3 => [0, 2.8, z];
  // FINO (lambari, tilápia)
  caixas.push(cx([-1.1, 1.2, -2.8], [1.1, 4.4, 2.6], P.corpo, corpo, { variantes: fino }));
  caixas.push(cx([-0.9, 1.6, -4.7], [0.9, 4.1, -2.6], P.corpo, cabeca, { variantes: fino }));
  caixas.push(cx([-0.6, 2.2, -5.3], [0.6, 3.2, -4.6], P.corpo, boca, { variantes: fino }));
  caixas.push(cx([-0.6, 2, 2.5], [0.6, 3.6, 4], P.rabo, manchaRabo, { variantes: fino, pivo: raboPivo(2.4) }));
  // ALTO (tambaqui, pacu): o peixe "redondo" de perfil
  caixas.push(cx([-1.3, 0.6, -2.6], [1.3, 5, 2.4], P.corpo, corpo, { variantes: alto }));
  caixas.push(cx([-1.1, 1.1, -4.3], [1.1, 4.5, -2.5], P.corpo, cabeca, { variantes: alto }));
  caixas.push(cx([-0.7, 1.9, -4.9], [0.7, 3.1, -4.2], P.corpo, boca, { variantes: alto }));
  caixas.push(cx([-0.7, 2, 2.3], [0.7, 3.6, 3.7], P.rabo, corpo, { variantes: alto, pivo: raboPivo(2.2) }));
  // COMPRIDO (traíra): cabeçorra e bocarra
  caixas.push(cx([-1.2, 1.3, -3.4], [1.2, 3.9, 3.2], P.corpo, corpo, { variantes: comprido }));
  caixas.push(cx([-1.1, 1.3, -5.6], [1.1, 3.8, -3.3], P.corpo, cabeca, { variantes: comprido }));
  caixas.push(cx([-0.9, 1.3, -6.4], [0.9, 2.4, -5.5], P.corpo, boca, { variantes: comprido }));
  caixas.push(cx([-0.7, 1.8, 3.1], [0.7, 3.4, 4.6], P.rabo, corpo, { variantes: comprido, pivo: raboPivo(3) }));
  // nadadeira do rabo: em V (bifurcada) ou leque (tilápia, traíra)
  const bif = { variantes: bifurcado, pivo: raboPivo(2.4) };
  caixas.push(cx([-0.2, 2.8, 3.5], [0.2, 5.3, 5.6], P.rabo, nadadeira, { ...bif, giro: [0.55, 0, 0], giroEm: [0, 2.8, 3.7] }));
  caixas.push(cx([-0.2, 0.3, 3.5], [0.2, 2.8, 5.6], P.rabo, nadadeira, { ...bif, giro: [-0.55, 0, 0], giroEm: [0, 2.8, 3.7] }));
  caixas.push(cx([-0.2, 1.1, 3.8], [0.2, 4.5, 6.2], P.rabo, nadadeira, { variantes: onde(vs, /til[aá]pia/), pivo: raboPivo(2.4) }));
  caixas.push(cx([-0.2, 1.0, 4.4], [0.2, 4.2, 6.8], P.rabo, nadadeira, { variantes: comprido, pivo: raboPivo(3) }));
  void redondo;
  // dorsais: comum, LONGA espinhosa (tilápia), alta (redondos), baixa (traíra)
  caixas.push(cx([-0.2, 4.3, -1.2], [0.2, 5.4, 1.4], P.corpo, nadadeira, { variantes: dorsalComum }));
  caixas.push(cx([-0.2, 4.3, -2.5], [0.2, 5.6, 2.5], P.corpo, nadadeira, { variantes: tilapia }));
  caixas.push(cx([-0.2, 4.9, -0.9], [0.2, 5.6, 1.6], P.corpo, nadadeira, { variantes: alto }));
  caixas.push(cx([-0.2, 3.8, -0.4], [0.2, 4.8, 2.6], P.corpo, nadadeira, { variantes: comprido }));
  // anal (embaixo, atrás)
  caixas.push(cx([-0.2, 0.3, 0.6], [0.2, 1.3, 2.4], P.corpo, nadadeira, { variantes: [...fino, ...comprido] }));
  caixas.push(cx([-0.2, 0, 0.4], [0.2, 0.7, 2.2], P.corpo, nadadeira, { variantes: alto }));
  // peitorais: abanam de lado
  const peit = cx([1, 1.8, -2.4], [2.4, 2.2, -1.1], P.barbatana, nadadeira, { pivo: [1, 2, -1.8] });
  caixas.push(peit, espelho(peit, P.barbatanaE));
  caixas.push(...coracoes());

  return {
    caixas,
    centro: [0, 2.8, 0],
    coracoes: [0, 7, -1],
    cabecaFilhote: 1.25,
    passoPorBloco: (Math.PI * 2) / 0.5,
    glsl: `
      {
        float vel = clamp(amp, 0.0, 1.6);
        float onda = sin(t * (4.0 + 9.0 * vel));
        float forca = 0.25 + 0.6 * vel;
        if (papel == P_RABO) ang.y = onda * 0.5 * forca + foraW * sin(t * 26.0) * 0.7;
        else if (papel == P_BARBATANA) ang.z = 0.35 + 0.3 * sin(t * 6.0 + 1.0);
        else if (papel == P_BARBATANA_E) ang.z = -(0.35 + 0.3 * sin(t * 6.0 + 1.0));
        // o corpo inteiro serpenteia contra o rabo — sem isso o peixe nada "duro"
        raizAng.y = -onda * 0.12 * forca * (1.0 - foraW);
        raizDesl.y = sin(t * 1.4 + semente * 6.0) * 0.4 * PX * (1.0 - foraW);
        // FORA D'ÁGUA: deita de lado e se debate (silhueta, não cor)
        raizAng.z = foraW * (1.5708 + 0.22 * sin(t * 14.0));
        raizAng.y += foraW * 0.3 * sin(t * 7.0);
        raizDesl.y += foraW * (-1.6 * PX + abs(sin(t * 7.0)) * 2.2 * PX);
      }
    `,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// ARARA — arara-azul, arara-vermelha, TUCANO (bico laranja), papagaio, periquito.
// Modelada em pose de VOO (corpo deitado); pousada = a raiz EMPINA o corpo.
// caixa 0,5 × 0,9 = 8 × 14,4 px
// ═════════════════════════════════════════════════════════════════════════════
function arara(vs: readonly VarianteBicho[]): DefModelo {
  const tucano = onde(vs, /tucano/);
  const curvo = exceto(vs, /tucano/);
  const raboLongo = onde(vs, /arara|periquito/);
  const raboCurto = exceto(vs, /arara|periquito/);

  const pena = (t: Texel, p: Paleta): Rgb => {
    let c: Rgb = p.corpo;
    if (/tucano/.test(p.nome)) {
      // peito/papo branco e o "calção" vermelho embaixo do rabo
      if (t.z < -1.2 && t.y < 6.4 && t.face !== FACE.topo) c = p.detalhe;
      if (t.z > 2.4 && t.y < 4.2) c = hexRgb("#d02828");
    } else if (/papagaio/.test(p.nome)) {
      if (t.z > 1.5 && t.y < 4.4) c = mistura(p.corpo, p.detalhe, 0.5);
    }
    // escamado das penas: meia-lua escura a cada 1,5 px
    const k = ((t.z + 20) / 1.5) % 1;
    if (k < 0.3 && t.face !== FACE.baixo) c = escala(c, 0.86);
    return sombra(granulado(c, t, 6), t, 9, 0.12);
  };
  const cabeca: Pintor = (t, p) => {
    const lado = t.face === FACE.dir || t.face === FACE.esq;
    const olho = lado && t.y >= 7.4 && t.y < 8.4 && t.z >= -6.4 && t.z < -5.4;
    if (olho) return PRETO_OLHO;
    const aro = lado && t.y >= 6.6 && t.y < 9.2 && t.z >= -7.2 && t.z < -4.6;
    if (/arara-azul/.test(p.nome) && aro) return p.acento; // o anel amarelo da arara-azul
    if (/vermelha/.test(p.nome) && lado && t.z < -4.6 && t.y < 8) return hexRgb("#f0ece4"); // a cara pelada branca
    if (/tucano/.test(p.nome) && aro) return hexRgb("#4aa8e0"); // a pele azul em volta do olho
    if (/tucano/.test(p.nome) && t.y < 7) return p.detalhe; // o papo branco
    if (/papagaio/.test(p.nome)) {
      if (t.face === FACE.frente || (lado && t.z < -5)) return t.y > 8.2 ? hexRgb("#3a78d8") : p.detalhe; // testa azul, cara amarela
    }
    if (/periquito/.test(p.nome) && t.y > 8 && t.z < -5) return p.acento;
    return pena(t, p);
  };
  const bicoCima: Pintor = (t, p) => {
    if (/vermelha/.test(p.nome)) return granulado(hexRgb("#ece4d4"), t, 4);
    if (/papagaio/.test(p.nome)) return granulado(hexRgb("#3a3836"), t, 4);
    if (/periquito/.test(p.nome)) return granulado(hexRgb("#e8d4bc"), t, 4);
    return granulado(hexRgb("#2a2a2e"), t, 4); // arara-azul: bico preto
  };
  const bicoBaixo: Pintor = (t, p) => {
    if (/arara-azul/.test(p.nome)) return t.z > -7.7 ? p.acento : granulado(hexRgb("#2a2a2e"), t, 4); // a faixa amarela da base
    return granulado(/periquito/.test(p.nome) ? hexRgb("#d8c4ac") : hexRgb("#2a2a2e"), t, 4);
  };
  const bicoTucano: Pintor = (t, p) => {
    if (t.z < -12.2) return granulado(hexRgb("#1a1a1a"), t, 4); // a ponta preta
    if (t.y > 8 && t.z < -8) return granulado(mistura(p.acento, hexRgb("#f8c040"), 0.5), t, 4); // a quilha mais amarela
    return granulado(p.acento, t, 5);
  };
  const asa = (t: Texel, p: Paleta): Rgb => {
    // de dentro pra fora: a cor do corpo, uma faixa de acento e as rêmiges (detalhe)
    const fora = Math.abs(t.x);
    let c: Rgb;
    if (/vermelha/.test(p.nome)) c = fora < 4 ? p.corpo : fora < 5.6 ? p.acento : p.detalhe;
    else if (/tucano/.test(p.nome)) c = p.corpo;
    else c = fora < 4.6 ? p.corpo : p.detalhe;
    const pena = ((t.z + 20) / 1.4) % 1 < 0.28;
    if (pena) c = escala(c, 0.82);
    return granulado(c, t, 6);
  };
  const asaFechada: Pintor = (t, p) => {
    // fechada, só se vê o lado de fora: a faixa e as rêmiges correm pra trás
    let c: Rgb;
    if (/vermelha/.test(p.nome)) c = t.z < 0 ? p.corpo : t.z < 1.6 ? p.acento : p.detalhe;
    else if (/tucano/.test(p.nome)) c = p.corpo;
    else c = t.z < 1.2 ? p.corpo : p.detalhe;
    if (((t.y + 20) / 1.2) % 1 < 0.25) c = escala(c, 0.84);
    return sombra(granulado(c, t, 6), t, 9, 0.1);
  };
  const cauda: Pintor = (t, p) => {
    let c: Rgb = /vermelha/.test(p.nome) ? (t.z > 8.5 ? p.detalhe : p.corpo) : /tucano/.test(p.nome) ? p.corpo : mistura(p.corpo, p.detalhe, suave(4, 10, t.z));
    if (Math.abs(t.x) < 0.25) c = escala(c, 0.8); // o eixo das penas
    return granulado(c, t, 6);
  };
  const pata: Pintor = (t) => granulado(hexRgb("#5a5452"), t, 6);

  const caixas: Caixa[] = [];
  // pernas no quadril (= pivô da raiz): pousada ficam em pé, voando recolhem
  for (const [papel, x] of [[P.pernaFE, -0.9], [P.pernaFD, 0.9]] as const) {
    const o = { pivo: [x, 3, 1.5] as V3 };
    caixas.push(cx([x - 0.5, 0.2, 1], [x + 0.5, 3.2, 2], papel, pata, o));
    caixas.push(cx([x - 0.8, 0, 0.3], [x + 0.8, 0.6, 2.5], papel, pata, o));
  }
  caixas.push(cx([-2, 3, -3.6], [2, 7.3, 3.6], P.corpo, pena));
  const cab = { pivo: [0, 6.2, -3.4] as V3 };
  caixas.push(cx([-1.9, 5.4, -7.4], [1.9, 9.3, -3.2], P.cabeca, cabeca, cab));
  // bico curvo (araras, papagaio, periquito): de cima com gancho + mandíbula
  caixas.push(cx([-0.9, 6.5, -9.1], [0.9, 8.5, -7.3], P.cabeca, bicoCima, { ...cab, variantes: curvo }));
  caixas.push(cx([-0.7, 5.6, -9.5], [0.7, 6.6, -8.4], P.cabeca, bicoCima, { ...cab, variantes: curvo }));
  caixas.push(cx([-0.8, 5.5, -8.4], [0.8, 6.5, -7.3], P.cabeca, bicoBaixo, { ...cab, variantes: curvo }));
  // o BICÃO do tucano: comprido, alto, laranja de ponta preta
  caixas.push(cx([-1.1, 6.6, -13.4], [1.1, 9.0, -7.3], P.cabeca, bicoTucano, { ...cab, variantes: tucano }));
  caixas.push(cx([-0.9, 5.8, -12.6], [0.9, 6.6, -7.3], P.cabeca, bicoTucano, { ...cab, variantes: tucano }));
  // asas FECHADAS (pousada) × ABERTAS (voando, batem no shader)
  const fechada = cx([2, 3.6, -2.6], [2.8, 7.1, 5.2], P.corpo, asaFechada, { mascara: M.escondeVoo });
  caixas.push(fechada, espelho(fechada));
  const aberta = cx([1.8, 5.7, -2.7], [9.6, 6.4, 2.2], P.asaD, asa, { mascara: M.soVoo, pivo: [1.8, 6, -0.3] });
  caixas.push(aberta, espelho(aberta, P.asaE));
  // cauda: longa (araras, periquito) ou curta (papagaio, tucano)
  const rab = { pivo: [0, 4.4, 3.4] as V3 };
  caixas.push(cx([-1.1, 4, 3.2], [1.1, 4.7, 12], P.rabo, cauda, { ...rab, variantes: raboLongo }));
  caixas.push(cx([-1.4, 4, 3.2], [1.4, 4.8, 7.6], P.rabo, cauda, { ...rab, variantes: raboCurto }));
  caixas.push(...coracoes());

  return {
    caixas,
    // o pivô da raiz é o QUADRIL: empinar o corpo não tira os pés do lugar
    centro: [0, 3, 1.5],
    escala: 1.18,
    coracoes: [0, 14.5, -1],
    cabecaFilhote: 1.35,
    passoPorBloco: (Math.PI * 2) / 0.35,
    glsl: `
      {
        float voo = voaW;
        float pousada = 1.0 - voo;
        float bat = t * 8.5 + semente * 6.0;
        // pousada: corpo EMPINADO; voando: deitado, subindo e descendo com a batida
        raizAng.x = 0.95 * pousada + voo * 0.12 * sin(bat + 1.2);
        raizDesl.y = voo * sin(bat - 0.6) * 0.8 * PX;
        float bate = 0.1 + 0.85 * sin(bat);
        if (papel == P_ASA_D) ang.z = bate;
        else if (papel == P_ASA_E) ang.z = -bate;
        else if (papel == P_CABECA) {
          // a cabeça fica de pé quando o corpo empina, e inclina de lado (o papagaio curioso)
          ang.x = -raizAng.x * 0.85 + 0.06 * sin(t * 1.3) * pousada;
          ang.y = 0.5 * pousada * sin(t * 0.33 + semente * 3.0);
          ang.z = 0.35 * pousada * smoothstep(0.6, 0.7, fract(t / 5.0 + semente)) * (1.0 - smoothstep(0.9, 1.0, fract(t / 5.0 + semente)));
        } else if (papel == P_PERNA_FE || papel == P_PERNA_FD) {
          float lado = papel == P_PERNA_FE ? 1.0 : -1.0;
          ang.x = -raizAng.x + voo * 1.3 + lado * sin(fase) * amp * 0.6 * pousada;
        } else if (papel == P_RABO) {
          ang.x = -0.45 * pousada + voo * 0.1 * sin(bat - 1.5);
        }
      }
    `,
  };
}

const FABRICAS: Record<TipoBicho, (vs: readonly VarianteBicho[]) => DefModelo> = {
  vaca,
  galinha,
  ovelha,
  cao,
  gato,
  tatu,
  peixe,
  arara,
};

/** O modelo do tipo, lido da tabela do shared (variante nova = linha nova lá). */
export function modeloDe(tipo: TipoBicho): DefModelo {
  return FABRICAS[tipo](BICHOS[tipo].variantes);
}

/** As paletas do tipo em RGB, na ordem do fio — e a do filhote no fim, se houver. */
export function paletasDe(tipo: TipoBicho, def: DefModelo): Paleta[] {
  const out: Paleta[] = BICHOS[tipo].variantes.map((v, i) => ({
    indice: i,
    nome: v.nome,
    corpo: hexRgb(v.cores.corpo),
    detalhe: hexRgb(v.cores.detalhe),
    acento: hexRgb(v.cores.acento),
  }));
  if (def.paletaFilhote) {
    out.push({
      indice: out.length,
      nome: "pintinho",
      corpo: hexRgb(def.paletaFilhote.corpo),
      detalhe: hexRgb(def.paletaFilhote.detalhe),
      acento: hexRgb(def.paletaFilhote.acento),
    });
  }
  return out;
}
