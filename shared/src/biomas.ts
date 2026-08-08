import { BlockId } from "./blocks";

/**
 * Biomas do gen procedural (2026-07-20) — a REGRA DE OURO aplicada ao terreno:
 * engrenagem genérica (clima → bioma → receita de coluna) + entradas
 * registradas. Bioma novo = registrar um objeto aqui; o motor não muda.
 *
 * Biomas BRASILEIROS de verdade (geografia na pedagogia): caatinga, cerrado,
 * mata e araucárias. A coerência de vizinhança NÃO usa tabela de adjacência —
 * emerge da continuidade dos campos de clima (temperatura/umidade são value
 * noise de baixa frequência): colunas vizinhas têm clima quase igual, então
 * caatinga nunca encosta em araucárias (sempre passa por cerrado/mata no meio).
 */

/** Clima da coluna (x,z), ambos em [0,1) — calculado em worldgen.climaAt. */
export interface Clima {
  readonly temp: number;
  readonly umid: number;
}

export type ArvoreTipo = "comum" | "ipe" | "araucaria" | "paubrasil";

export interface Bioma {
  readonly nome: string;
  /** Bloco do topo da coluna; "grama" = variante escolhida por gramaPorClima. */
  readonly topo: number | "grama";
  /** Camadas logo abaixo do topo (entre a pedra e a superfície). */
  readonly subsolo: number;
  readonly profundidadeSubsolo: number;
  /** Espécies que nascem AQUI e só aqui: [tipo, chance por coluna]. */
  readonly arvores: readonly (readonly [ArvoreTipo, number])[];
  /** Chance de flor por coluna (0 = sem flor). */
  readonly flores: number;
  /** Chance de GRAMA ALTA por coluna (§🌬️ 2026-07-27; 0 = campo pelado).
   *  Bem maior que a de flor: capim é o preenchimento do campo, flor é o
   *  detalhe. A variante (verde/seca/fria) sai do clima, como a grama do chão. */
  readonly gramaAlta: number;
  /** Chance de mandacaru por coluna (só caatinga). */
  readonly mandacaru: number;
  /**
   * §🍖 F10c + F10h: plantas SELVAGENS do gen — mapa `{ bloco selvagem →
   * chance por coluna }` (0/vazio = não nasce). É a porta de entrada de CADA
   * cadeia de cultivo: o aluno ACHA o pé no mundo, quebrar larga a semente
   * (drops.ts) e a semente é que planta de verdade. Nasceu como `algodao: 1`
   * e virou mapa quando o pedido do usuário trouxe as seis culturas do F10h —
   * o algodão não podia mais ser uma linha à parte.
   *
   * Cada cultura mora no bioma onde ela faz sentido geográfico (a pedagogia
   * da aula): melancia e aipim no cerrado quente e seco, banana na mata
   * úmida, batata/cenoura/beterraba nas araucárias frias, e a caatinga de
   * fora — lá o topo é areia e planta não pega (`isSolo`).
   *
   * Bem mais raros que o capim de propósito: achar um pé tem de ser uma
   * descoberta da aula, não o chão inteiro.
   */
  readonly selvagem: Readonly<Partial<Record<number, number>>>;
  /**
   * §🏔️ Teto de RELEVO deste bioma, em [0,1] — multiplica a amplitude da serra.
   * 0 = tabuleiro; 1 = serra alta. É o que impede duna de areia de 100 blocos
   * (playtest 2026-07-28: a caatinga chegava a 106).
   */
  readonly relevo: number;
  /** O topo ALTO deste bioma vira neve? Só o frio. Antes a neve era global por
   *  altitude + `temp < 0.6`, e por isso aparecia em cima de morro de cerrado —
   *  o "areia, pedra, terra e neve junto" do playtest. */
  readonly neve: boolean;
}

export const BIOMAS = {
  caatinga: {
    nome: "caatinga",
    topo: BlockId.Sand,
    subsolo: BlockId.Sandstone,
    profundidadeSubsolo: 3,
    arvores: [],
    flores: 0,
    gramaAlta: 0, // caatinga é areia: nem grama nem capim
    // 1/16 (2026-07-26): com 1/96 o mundo M inteiro tinha ~2 cactos — caatinga
    // sem cacto nenhum. A densidade só vale nas colunas SECAS (h > NIVEL_MAR).
    mandacaru: 1 / 16,
    selvagem: {}, // topo é areia: nenhuma planta pega (isSolo recusa)
    // duna, não montanha: o teto da caatinga é ~9 blocos acima da base
    relevo: 0.1,
    neve: false,
  },
  cerrado: {
    nome: "cerrado",
    topo: "grama",
    subsolo: BlockId.Dirt,
    profundidadeSubsolo: 3,
    arvores: [["ipe", 1 / 160]],
    flores: 1 / 64,
    gramaAlta: 1 / 6, // cerrado é campo aberto: capim é a cara dele
    mandacaru: 0,
    // §🍖 F10c + F10h: campo quente e seco — o algodão (a porta da lã) e as
    // duas culturas que aguentam a seca: melancia e aipim. O algodão continua
    // o mais comum (1/40): é ele que a turma precisa achar logo pra abrir a
    // cadeia da lã; as outras duas são descoberta.
    selvagem: {
      [BlockId.AlgodaoSelvagem]: 1 / 40,
      [BlockId.MelanciaSelvagem]: 1 / 90,
      [BlockId.AipimSelvagem]: 1 / 70,
    },
    relevo: 0.35, // chapada: mesa larga e baixa, não pico
    neve: false,
  },
  mata: {
    nome: "mata",
    topo: "grama",
    subsolo: BlockId.Dirt,
    profundidadeSubsolo: 3,
    arvores: [
      ["comum", 1 / 28],
      ["paubrasil", 1 / 80],
    ],
    flores: 1 / 48,
    gramaAlta: 1 / 10, // mata: o chão é mais sombreado, capim mais ralo
    mandacaru: 0,
    // banana: fruta da floresta úmida — é a descoberta da mata
    selvagem: {
      [BlockId.BananaSelvagem]: 1 / 60,
    },
    relevo: 0.5, // morros da mata atlântica
    neve: false,
  },
  araucarias: {
    nome: "araucárias",
    topo: "grama",
    subsolo: BlockId.Dirt,
    profundidadeSubsolo: 3,
    arvores: [["araucaria", 1 / 48]],
    flores: 1 / 128,
    gramaAlta: 1 / 12,
    mandacaru: 0,
    // raízes e folhas do frio: as três hortaliças que a horta brasileira de
    // verdade planta no Sul — batata (a mais comum, pra abrir a cadeia),
    // cenoura e beterraba.
    selvagem: {
      [BlockId.BatataSelvagem]: 1 / 50,
      [BlockId.CenouraSelvagem]: 1 / 110,
      [BlockId.BeterrabaSelvagem]: 1 / 130,
    },
    relevo: 1, // a serra alta é DAQUI — e é o único bioma que ganha neve
    neve: true,
  },
} as const satisfies Record<string, Bioma>;

/** Lookup Whittaker (clima → bioma). Thresholds sobre campos CONTÍNUOS. */
export function biomaPorClima(clima: Clima): Bioma {
  if (clima.temp < 0.35) return BIOMAS.araucarias;
  if (clima.temp > 0.65 && clima.umid < 0.4) return BIOMAS.caatinga;
  if (clima.umid > 0.55) return BIOMAS.mata;
  return BIOMAS.cerrado;
}

/** Variante de grama pelo CLIMA — thresholds PRÓPRIOS, de propósito diferentes
 *  dos de biomaPorClima: a grama vira seca/fria ANTES de o bioma trocar, então
 *  a fronteira ganha faixas de transição = blend visual de bioma. */
export function gramaPorClima(clima: Clima): number {
  if (clima.temp < 0.42) return BlockId.GramaFria;
  if (clima.temp > 0.58 && clima.umid < 0.5) return BlockId.GramaSeca;
  return BlockId.Grass;
}

/** Rampa suave (smoothstep): 0 até `a`, 1 a partir de `b`. */
function rampa(v: number, a: number, b: number): number {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Meia-largura da rampa de pertinência, em unidades de clima. Quanto MAIOR,
 *  mais macia a descida do relevo na divisa entre biomas — e é essa maciez que
 *  decide o degrau máximo entre colunas vizinhas.
 *
 *  0,25 é MEDIDO, não escolhido a olho (2026-07-30, 5 seeds × 400×400 colunas):
 *  com 0,1 o degrau máximo entre vizinhos era 14–23 blocos (o penhasco de
 *  fronteira que o heightmap global evitava); com 0,25 cai a **6 — o mesmo pior
 *  caso do heightmap global**, com ZERO pares acima de 6 e a cauda >3 mais leve
 *  que a dele (0,10% contra 0,01–0,62%). E os tetos por bioma continuam de pé:
 *  araucárias 106 · mata 68 · cerrado 53 · caatinga 36 (era 106 na caatinga). */
const RAMPA = 0.25;

/** Rampa do NÚCLEO: onde a pertinência do bioma dominante passa de `a`, o
 *  relevo começa a subir; só em `b` sobe inteiro. Esta é a peça CARA — ela
 *  multiplica o gradiente do clima pela amplitude da serra (até 88 blocos), e
 *  foi ela que produziu o penhasco de 23 blocos quando era (0,55 → 0,92).
 *  (0,4 → 1,0) espalha a mesma transição por uma faixa ~2,5× mais larga. */
const NUCLEO: readonly [number, number] = [0.4, 1];

/**
 * §🏔️ Quanto o CLIMA autoriza o relevo a subir, em [0,1] — o multiplicador da
 * amplitude da serra (2026-07-28).
 *
 * Faz DUAS coisas, as duas pedidas no playtest:
 *
 * 1. **Cada bioma tem o seu teto** (`Bioma.relevo`), então duna de caatinga não
 *    vira montanha de 100 blocos.
 * 2. **O valor cai a ZERO na fronteira entre biomas.** É isto que mantém a
 *    montanha inteira dentro de um bioma só: ela só consegue subir no MIOLO de
 *    um, nunca montada em cima da divisa. Antes, 91% dos picos atravessavam 2 ou
 *    3 biomas — a montanha (célula de ~90 blocos) era maior que o bioma (~80).
 *
 * Contínua de propósito: usa as MESMAS fronteiras do `biomaPorClima`, mas com
 * rampa em vez de degrau. Um lookup discreto aqui devolveria um penhasco de
 * dezenas de blocos exatamente na divisa — o problema que o heightmap global
 * único evitava em 2026-07-20, e que esta fase reabriu de propósito.
 */
export function relevoPorClima(clima: Clima): number {
  const frio = 1 - rampa(clima.temp, 0.35 - RAMPA, 0.35 + RAMPA);
  const quente = rampa(clima.temp, 0.65 - RAMPA, 0.65 + RAMPA);
  const seco = 1 - rampa(clima.umid, 0.4 - RAMPA, 0.4 + RAMPA);
  const umido = rampa(clima.umid, 0.55 - RAMPA, 0.55 + RAMPA);

  // pertinência de cada bioma; somam exatamente 1 por construção
  const pArauc = frio;
  const caat = quente * seco;
  const pCaat = (1 - frio) * caat;
  const pMata = (1 - frio) * (1 - caat) * umido;
  const pCerr = (1 - frio) * (1 - caat) * (1 - umido);

  const media =
    pArauc * BIOMAS.araucarias.relevo +
    pCaat * BIOMAS.caatinga.relevo +
    pMata * BIOMAS.mata.relevo +
    pCerr * BIOMAS.cerrado.relevo;

  // NÚCLEO: 1 onde um bioma domina, 0 onde dois empatam (a divisa). Sem este
  // fator o teto por bioma sozinho não resolveria nada — a montanha continuaria
  // podendo nascer em cima da fronteira, só que com a altura média dos dois
  // (medido: sem núcleo o cerrado chegava a 73 e a caatinga a 43, contra os
  // 56/36 de agora). Quem paga o preço é a suavidade — ver NUCLEO.
  const dominante = Math.max(pArauc, pCaat, pMata, pCerr);
  return media * rampa(dominante, NUCLEO[0], NUCLEO[1]);
}
