import { SERVER_TICK_RATE } from "./constants";

/**
 * Vento como ESTADO DO MUNDO (§🌬️, 2026-07-27) — server-autoritativo e SÓ
 * visual: não empurra o jogador, não move bloco, não entra na física. Nasceu do
 * pedido de "a correnteza da água seguir o vento" no playtest da água; com o
 * vento existindo, o resto do ambiente (nuvens, folhas, grama) responde a ele.
 *
 * Mesmo molde do `horaDoDia` (cp21): função PURA do `tickCount`, não do relógio
 * de parede. Dois hosts no mesmo tick veem o mesmo vento, e um save que guarda o
 * tick guarda o clima junto. Nada de `Math.random` — reload não muda o vento.
 *
 * O modelo é "rotação lenta + rajadas" (decisão do usuário, 2026-07-27):
 * a direção dá uma volta completa devagar (VENTO_GIRO_SEGUNDOS) com um bamboleio
 * por cima, e a força soma uma maré longa com uma rajada curta. Períodos PRIMOS
 * entre si de propósito: a soma nunca fecha um ciclo curto, então o padrão não
 * fica óbvio pra quem joga 20 minutos.
 */

/** Estado do vento num instante. `dir` em radianos [0, 2π); `forca` em [0,1]. */
export interface Vento {
  /** Ângulo no plano XZ: 0 = sopra pra +x, π/2 = sopra pra +z. */
  readonly dir: number;
  /** 0 = calmaria, 1 = ventania. Escala amplitude/velocidade de tudo. */
  readonly forca: number;
}

/** Volta completa da direção do vento (segundos). 5 min = ~1,2°/s: perceptível
 *  numa sessão de aula, sem virar cata-vento. */
export const VENTO_GIRO_SEGUNDOS = 300;

/** Vento de mundo com o vento DESLIGADO — calmaria absoluta. */
export const VENTO_PARADO: Vento = { dir: 0, forca: 0 };

const TAU = Math.PI * 2;

/** Fase inicial derivada da seed: mundos diferentes não nascem com o mesmo
 *  vento. Hash inteiro (mesma família do `pixelHash` do atlas) → [0, 2π). */
function faseDaSeed(seed: number, salt: number): number {
  let h = (seed | 0) ^ Math.imul(salt, 374761393);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (((h ^ (h >>> 16)) >>> 0) / 4294967296) * TAU;
}

/**
 * Vento no tick dado. Puro e determinístico — mesma entrada, mesma saída, em
 * qualquer máquina. O cliente NÃO chama isto (recebe `dir`/`forca` prontos pelo
 * fio e suaviza localmente); quem chama é a sessão, 1×/s.
 */
export function ventoNoTick(tick: number, seed: number): Vento {
  const t = tick / SERVER_TICK_RATE; // segundos de mundo

  // direção: giro lento + bamboleio (o vento "procura" um rumo em vez de girar
  // como um relógio). O bamboleio é largo (0,6 rad ≈ 34°) e lento.
  const dir =
    (faseDaSeed(seed, 0x5eed) +
      (TAU * t) / VENTO_GIRO_SEGUNDOS +
      0.6 * Math.sin((TAU * t) / 71 + faseDaSeed(seed, 0x71a1))) %
    TAU;

  // força: maré longa (97 s) + rajada curta (13,7 s). A rajada é o que dá vida —
  // sem ela a água anda numa velocidade chapada e o olho percebe o loop.
  const mare = Math.sin((TAU * t) / 97 + faseDaSeed(seed, 0x9711));
  const rajada = Math.sin((TAU * t) / 13.7 + faseDaSeed(seed, 0x13a7));
  const forca = Math.min(1, Math.max(0.05, 0.42 + 0.3 * mare + 0.2 * rajada));

  return { dir: dir < 0 ? dir + TAU : dir, forca };
}

/** Rumo do vento em palavras, pra resposta de chat do professor (`/vento`).
 *  8 setores; `dir` é PRA ONDE sopra (não de onde vem). */
export function ventoRumo(dir: number): string {
  const nomes = ["leste", "sudeste", "sul", "sudoeste", "oeste", "noroeste", "norte", "nordeste"];
  const setor = Math.round((((dir % TAU) + TAU) % TAU) / (TAU / 8)) % 8;
  return nomes[setor]!;
}

/** Força em palavras (mesma leitura de professor). */
export function ventoIntensidade(forca: number): string {
  if (forca < 0.2) return "quase parado";
  if (forca < 0.45) return "brisa";
  if (forca < 0.75) return "vento moderado";
  return "vento forte";
}

/**
 * 8 setores de direção → vetor de onda INTEIRO do tile da água, em coordenadas
 * do CANVAS do atlas. Mora aqui (e não no cliente) porque os dois cuidados que
 * ditam a tabela são fatos do MESHER, não de desenho:
 *
 * 1. **Inteiro.** O seno da onda tem de fechar nos 16 px do tile, senão a lâmina
 *    d'água mostra costura de bloco pra bloco. Só componente inteira fecha —
 *    daí existirem 8 setores e não um ângulo contínuo.
 * 2. **Negado nos dois eixos.** No topo do bloco o mesher mapeia `u = 1 − x` e
 *    `v = z` (ver FACES/FACE_UVS), e o canvas 2D tem o y pra baixo. Somando as
 *    duas inversões, andar pra +x no mundo é andar pra −x no canvas, e pra +z no
 *    mundo é −y no canvas. Sem isto a água corre CONTRA o vento.
 *
 * Magnitude ~3 em todos os setores: comprimento de onda parecido no eixo e na
 * diagonal (senão a água mudaria de "textura" ao girar o vento).
 */
export const ONDA_AGUA_POR_SETOR: readonly (readonly [number, number])[] = [
  [-3, 0], // vento pra leste (+x)
  [-2, -2],
  [0, -3], // vento pro sul (+z)
  [2, -2],
  [3, 0], // vento pro oeste (−x)
  [2, 2],
  [0, 3], // vento pro norte (−z)
  [-2, 2],
];

/** Onda da água pra uma direção de vento: o par de setores vizinhos + a mistura
 *  entre eles. O PAR existe pra virada de setor não dar "pop" na correnteza —
 *  quem pinta interpola os dois (ver paintAgua no cliente). */
export function ondaAguaDoVento(dir: number): {
  a: readonly [number, number];
  b: readonly [number, number];
  mistura: number;
} {
  const frac = ((((dir % TAU) + TAU) % TAU) / (TAU / 8)) % 8;
  const s = Math.floor(frac) % 8;
  return {
    a: ONDA_AGUA_POR_SETOR[s]!,
    b: ONDA_AGUA_POR_SETOR[(s + 1) % 8]!,
    mistura: frac - Math.floor(frac),
  };
}
