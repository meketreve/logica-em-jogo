/**
 * §🔊 O que SOA quando o mundo muda — a parte PURA do som de mundo.
 *
 * O cliente só sintetiza (`client/src/somMundo.ts`); quem decide se uma troca
 * de bloco faz barulho, e qual, mora aqui, onde o `npm test` roda. A razão é a
 * mesma do `comandos.ts`: a regra tem casos que só um teste enumera.
 *
 * O problema que esta função resolve: o cliente recebe `block_changed` pra
 * TUDO — o aluno colocando, a água escorrendo, a plantação crescendo, o fio
 * acendendo, a areia caindo. Tocar "colocar" em cada um daria uma metralhadora
 * a cada clique de alavanca (30 fios = 30 sons) e um chiado contínuo perto de
 * qualquer rio. Então a regra é por TRANSIÇÃO (antes → depois), não por id:
 *
 *  - ar/água/substituível → bloco      = COLOCAR (material do novo)
 *  - bloco → ar/água                   = QUEBRAR (material do velho)
 *  - porta/janela trocando de estado   = PORTA abrindo/fechando
 *  - alavanca trocando de estado       = ALAVANCA (o clique)
 *  - placa trocando de estado          = PLACA
 *  - fornalha apagada → acesa          = FOGO
 *  - qualquer outra troca              = SILÊNCIO (fio, lâmpada, porta lógica,
 *    plantação crescendo, grama espalhando, água nivelando…)
 *
 * O silêncio é a regra de propósito: é o motor (circuito, água, crescimento)
 * que gera a maioria dos `block_changed`, e motor não faz barulho.
 */

import {
  BlockId,
  blocoExiste,
  ehAlavanca,
  isAgua,
  isCama,
  isFlor,
  isFolhas,
  isFornalha,
  fornalhaEstaAcesa,
  isGramaAlta,
  isJanela,
  isJanelaAberta,
  isMovel,
  isMuda,
  isPlantacao,
  isPorta,
  isPortaAberta,
  isQuadro,
  isReplaceable,
  isSelvagem,
  isSlab,
  isStairs,
  isTapete,
  isVidroColorido,
  slabMaterial,
  stairsMaterial,
} from "./blocks";
import { ferramentaIdealDe } from "./ferramentas";

/**
 * A "voz" de um bloco. Poucas de propósito: cada uma é uma receita de síntese
 * no cliente, e o aluno distingue umas 6 texturas de som — mais que isso vira
 * variação que ninguém ouve e custa receita pra manter.
 */
export type MaterialSonoro =
  | "pedra"
  | "madeira"
  | "terra"
  | "areia"
  | "vidro"
  | "planta"
  | "tecido"
  | "metal";

/** O material das lajes/escadas de tábua (o mesmo do `ferramentas.ts`). */
const MATERIAL_DE_TABUA = 1;

/**
 * Exceções escritas à mão — o RESTO deriva de família e da ferramenta ideal,
 * pela mesma razão do `ferramentaIdealDe`: escrever os 24 ids de escada à mão
 * é a garantia de esquecer um.
 */
const DIRETO: ReadonlyMap<number, MaterialSonoro> = new Map<number, MaterialSonoro>([
  [BlockId.Sand, "areia"],
  [BlockId.Gravel, "areia"],
  [BlockId.Snow, "areia"],
  [BlockId.Glass, "vidro"],
  [BlockId.Mandacaru, "planta"],
  [BlockId.Tocha, "madeira"],
  [BlockId.Cerca, "madeira"],
  [BlockId.Bau, "madeira"],
  [BlockId.BauLoja, "madeira"],
  [BlockId.LampadaApagada, "vidro"],
  [BlockId.LampadaAcesa, "vidro"],
  [BlockId.PlacaDesligada, "metal"],
  [BlockId.PlacaLigada, "metal"],
]);

/** Algodão (bloco de cor): os 16 ids não são contíguos (vieram em 2 lotes). */
function isBlocoAlgodao(id: number): boolean {
  return (
    (id >= BlockId.BlocoAlgodaoBranco && id <= BlockId.BlocoAlgodaoRoxo) ||
    (id >= BlockId.BlocoAlgodaoRosa && id <= BlockId.BlocoAlgodaoMarrom)
  );
}

/**
 * A voz do bloco `id`, ou `null` pro que não tem corpo (ar, água — a água
 * tem som PRÓPRIO, de mergulho, que não sai de troca de bloco).
 *
 * Ordem: exceção direta → família (plantas, tecido, vidro, móveis) → a
 * ferramenta que ACELERA (picareta = pedra, machado = madeira, pá = terra) →
 * pedra. O piso "pedra" é o certo pra id novo sem regra: o circuito (fio,
 * alavanca, porta lógica) é pedregulho + pó, e quase todo bloco sem
 * ferramenta é construção.
 */
export function materialSonoro(id: number): MaterialSonoro | null {
  if (id === BlockId.Air || isAgua(id) || !blocoExiste(id)) return null;
  const direto = DIRETO.get(id);
  if (direto) return direto;
  if (
    isFolhas(id) || isFlor(id) || isGramaAlta(id) || isPlantacao(id) ||
    isMuda(id) || isSelvagem(id)
  ) {
    return "planta";
  }
  if (isBlocoAlgodao(id) || isTapete(id) || isCama(id)) return "tecido";
  if (isVidroColorido(id) || isJanela(id)) return "vidro";
  if (isSlab(id)) return slabMaterial(id) === MATERIAL_DE_TABUA ? "madeira" : "pedra";
  if (isStairs(id)) return stairsMaterial(id) === MATERIAL_DE_TABUA ? "madeira" : "pedra";
  if (isPorta(id) || isMovel(id) || isQuadro(id)) return "madeira";
  switch (ferramentaIdealDe(id)) {
    case "machado":
      return "madeira";
    case "pá":
      return "terra";
    default:
      return "pedra";
  }
}

/** Um som de mundo que nasceu de uma troca de bloco. */
export type SomDeBloco =
  | { tipo: "colocar"; material: MaterialSonoro }
  | { tipo: "quebrar"; material: MaterialSonoro }
  | { tipo: "porta"; abriu: boolean; material: MaterialSonoro }
  | { tipo: "alavanca"; ligou: boolean }
  | { tipo: "placa"; ligou: boolean }
  | { tipo: "fogo" };

/** "Vazio" pra quem coloca: ar, água e o que se coloca POR CIMA (grama alta). */
function vazio(id: number): boolean {
  return id === BlockId.Air || isAgua(id) || isReplaceable(id);
}

/** Mesma família de alavanca? (o par desligada/ligada de UMA face) */
function mesmaAlavanca(a: number, b: number): boolean {
  // o par é (par, ímpar) contíguo em toda face — ver `isCircuitoLigado`
  return ehAlavanca(a) && ehAlavanca(b) && a >> 1 === b >> 1;
}

/**
 * O som da troca `antes → depois` numa célula, ou `null` (silêncio).
 * Ver o cabeçalho pra regra inteira e o porquê do silêncio ser o padrão.
 */
export function somDaTroca(antes: number, depois: number): SomDeBloco | null {
  if (antes === depois) return null;

  // estado de peça que o aluno MEXE (portas, janelas, alavanca, placa)
  if ((isPorta(antes) && isPorta(depois)) || (isJanela(antes) && isJanela(depois))) {
    const abriu = isPorta(depois) ? isPortaAberta(depois) : isJanelaAberta(depois);
    const abriuAntes = isPorta(antes) ? isPortaAberta(antes) : isJanelaAberta(antes);
    if (abriu === abriuAntes) return null; // só trocou a dobradiça/eixo
    return { tipo: "porta", abriu, material: materialSonoro(depois) ?? "madeira" };
  }
  if (mesmaAlavanca(antes, depois)) return { tipo: "alavanca", ligou: depois % 2 === 1 };
  const placas = [BlockId.PlacaDesligada, BlockId.PlacaLigada] as number[];
  if (placas.includes(antes) && placas.includes(depois)) {
    return { tipo: "placa", ligou: depois === BlockId.PlacaLigada };
  }
  if (isFornalha(antes) && isFornalha(depois)) {
    return !fornalhaEstaAcesa(antes) && fornalhaEstaAcesa(depois) ? { tipo: "fogo" } : null;
  }

  // a água só NIVELANDO (fonte ↔ fluida, fluida ↔ ar) é o motor: silêncio.
  // O balde tem som próprio no cliente, tocado no gesto.
  if ((isAgua(antes) || antes === BlockId.Air) && (isAgua(depois) || depois === BlockId.Air)) {
    return null;
  }

  const matDepois = materialSonoro(depois);
  if (vazio(antes) && matDepois && !vazio(depois)) return { tipo: "colocar", material: matDepois };
  const matAntes = materialSonoro(antes);
  if (matAntes && (depois === BlockId.Air || isAgua(depois))) {
    return { tipo: "quebrar", material: matAntes };
  }
  // (a grama alta é `vazio` pra quem COLOCA, mas arrancá-la cai no ramo de
  // cima: tem material — é a criança arrancando mato, soa como planta)
  return null; // crescimento, grama espalhando, peça de circuito acendendo…
}

// ---------------------------------------------------------------- passadas

/** Distância andada entre duas passadas, em blocos (Minecraft: ~1,7 por passo
 *  "duplo"; aqui um passo por pé, que é o que se ouve). */
export const PASSO_BLOCOS = 1.6;
/** Correndo, o passo é mais longo (a cadência sobe menos que a velocidade). */
export const PASSO_CORRENDO_BLOCOS = 2.1;
/** Queda mínima (blocos) pra ouvir o baque da aterrissagem. Abaixo disto é
 *  degrau/pulo comum, que já tem a passada. */
export const QUEDA_COM_BAQUE = 1.4;

/** O que a passada decidiu neste frame. */
export type SomDePassada =
  | { tipo: "passo" }
  | { tipo: "aterrissar"; altura: number }
  | null;

/**
 * Odômetro das passadas do jogador LOCAL. Máquina de estado de 3 campos —
 * roda 1× por frame, sem alocar (o retorno é constante ou literal pequeno,
 * e o caso comum devolve `null`).
 *
 * Por que distância e não relógio: andar devagar (agachado, empurrando parede)
 * tem de espaçar os passos, e o relógio tocaria passo parado contra a parede.
 */
export class Passadas {
  private acumulado = 0;
  private noChaoAntes = true;
  private yMaisAlto = 0;

  /**
   * Um frame. `dx`/`dz` = deslocamento horizontal do frame; `y` = pés.
   * `voando` e `naAgua` calam a passada (a água tem o som dela).
   */
  passo(
    dx: number,
    dz: number,
    y: number,
    ctx: { noChao: boolean; voando: boolean; naAgua: boolean; correndo: boolean },
  ): SomDePassada {
    if (ctx.voando || ctx.naAgua) {
      this.acumulado = 0;
      this.noChaoAntes = ctx.noChao;
      this.yMaisAlto = y;
      return null;
    }
    if (!ctx.noChao) {
      if (this.noChaoAntes || y > this.yMaisAlto) this.yMaisAlto = y;
      this.noChaoAntes = false;
      return null;
    }
    if (!this.noChaoAntes) {
      // acabou de pousar: baque se caiu de verdade, e a passada recomeça do
      // meio (sem isto o 1º passo depois do pulo sairia colado no baque)
      this.noChaoAntes = true;
      const altura = this.yMaisAlto - y;
      this.acumulado = 0;
      this.yMaisAlto = y;
      return altura >= QUEDA_COM_BAQUE ? { tipo: "aterrissar", altura } : { tipo: "passo" };
    }
    this.yMaisAlto = y;
    this.acumulado += Math.sqrt(dx * dx + dz * dz);
    const passo = ctx.correndo ? PASSO_CORRENDO_BLOCOS : PASSO_BLOCOS;
    if (this.acumulado < passo) return null;
    this.acumulado -= passo;
    // teleporte/respawn: o odômetro não vira rajada de passos
    if (this.acumulado > passo) this.acumulado = 0;
    return { tipo: "passo" };
  }

  /** Teleporte, respawn, troca de mundo: esquece o frame anterior. */
  zerar(y: number): void {
    this.acumulado = 0;
    this.noChaoAntes = true;
    this.yMaisAlto = y;
  }
}

// ---------------------------------------------------------------- bichos

/**
 * §🐄 O GANCHO dos bichos. As entidades nascem noutra frente (branch dos mobs);
 * aqui só a VOZ de cada um. Quem cria o bicho chama, no cliente,
 * `somDeBicho(tipo, evento, x, y, z)` — e o som já existe.
 *
 * O `tipo` é string (e não união fechada) de propósito: o usuário pediu
 * VARIANTES (cor e área de spawn diferentes, mesmo comportamento) — a variante
 * "vaca-malhada" herda a voz da "vaca" por PREFIXO, sem linha nova aqui.
 */
export const VOZES_DE_BICHO = ["vaca", "porco", "galinha", "ovelha", "cachorro"] as const;
export type VozDeBicho = (typeof VOZES_DE_BICHO)[number];

/** O que o bicho está fazendo quando soa. */
export type EventoDeBicho = "ambiente" | "dano" | "morte" | "passo";

/**
 * A voz de um tipo de bicho: o próprio nome, ou o nome-base de que ele é
 * variante (`"vaca-malhada"` → `"vaca"`). `null` = bicho sem voz conhecida
 * (o cliente usa a voz genérica e não quebra).
 */
export function vozDoBicho(tipo: string): VozDeBicho | null {
  // o servidor dos mobs manda o NOME da variante com espaço ("vaca malhada")
  const t = tipo.toLowerCase();
  // o vira-lata é cachorro (variante com nome próprio, sem o prefixo)
  if (t === "vira-lata" || t.startsWith("vira-lata ") || t.startsWith("cão") || t.startsWith("cao ")) return "cachorro";
  for (const v of VOZES_DE_BICHO) {
    if (t === v || t.startsWith(`${v}-`) || t.startsWith(`${v}_`) || t.startsWith(`${v} `)) return v;
  }
  return null;
}
