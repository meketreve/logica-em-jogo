import {
  BlockId,
  ITEM_MACHADO_DIAMANTE,
  ITEM_MACHADO_FERRO,
  ITEM_MACHADO_MADEIRA,
  ITEM_MACHADO_PEDRA,
  ITEM_PA_DIAMANTE,
  ITEM_PA_FERRO,
  ITEM_PA_MADEIRA,
  ITEM_PA_PEDRA,
  ITEM_PICARETA_DIAMANTE,
  ITEM_PICARETA_FERRO,
  ITEM_PICARETA_MADEIRA,
  ITEM_PICARETA_PEDRA,
  isFornalha,
  isMovel,
  isPorta,
  isQuadro,
  isSlab,
  isStairs,
  slabMaterial,
  stairsMaterial,
} from "./blocks";
import { type Inventario, type Slot, type Stack, contar } from "./inventario";
import { SERVER_TICK_RATE } from "./constants";

/**
 * §🍖 F10d (2026-08-05) — FERRAMENTAS. As duas decisões vieram do usuário:
 * **sem durabilidade** e **obrigatória pra minerar**.
 *
 * **Sem durabilidade** é o que mantém o save simples: a pilha continua sendo
 * `{id, qtd}` e nenhum campo novo entra em lugar nenhum. Durabilidade
 * contaminaria TODO o código de pilha (empilhar, mover, salvar, comparar), e é
 * exatamente por isso que ela ficou fora enquanto ninguém pediu. `tamanhoStack`
 * já dá 1 por slot pra ferramenta, como o balde.
 *
 * **Obrigatória pra minerar** muda a progressão da aula de propósito: quem
 * entra em sobrevivência **não pega pedra até fabricar a picareta de madeira**,
 * e é isso que dá sentido à cadeia inteira — madeira → picareta → pedra →
 * picareta de pedra → minério → fornalha → lingote → picareta de ferro →
 * diamante. ⚠️ Consequência a contar pro professor: a primeira coisa que a
 * turma faz numa aula de sobrevivência passa a ser derrubar árvore.
 *
 * **Só a PICARETA existe, e isso é uma decisão, não um esquecimento.** O
 * escopo anotado falava também em machado (madeira) e pá (terra/areia). Os dois
 * ficaram de fora por duas razões que se somam:
 *
 * 1. **Travariam a aula.** Madeira é o começo de tudo; exigir machado pra tirar
 *    madeira, quando o machado é feito DE madeira, é um mundo onde ninguém
 *    começa.
 * 2. **Não fariam nada.** Neste jogo a quebra é um clique instantâneo (não há
 *    tempo de quebra), então uma ferramenta que só ACELERA não tem onde
 *    aparecer. Machado e pá seriam 8 ids, 8 ícones e 8 receitas sem efeito
 *    nenhum na mesa do aluno.
 *
 * A tabela abaixo já é por (tipo × família), então o dia em que houver tempo de
 * quebra os dois entram sem redesenho.
 *
 * ⏩ **2026-09-23 (§🪓): esse dia chegou.** O §🔨 v2 trouxe tempo de quebra, o
 * que derruba a razão (2) — agora existe um número pra dividir. A razão (1)
 * continua de pé e virou a forma do conserto: machado e pá entram SÓ na tabela
 * do IDEAL (quem acelera), nunca na do EXIGE (quem barra). Ver `IDEAL_DIRETO`
 * e `ferramentaIdealDe` no fim do arquivo.
 */

export type TipoFerramenta = "picareta" | "machado" | "pá";

/** Nível do material: cada um alcança tudo que os anteriores alcançam. */
export const NIVEL_MADEIRA = 1;
export const NIVEL_PEDRA = 2;
export const NIVEL_FERRO = 3;
export const NIVEL_DIAMANTE = 4;

export interface Ferramenta {
  readonly tipo: TipoFerramenta;
  readonly nivel: number;
  /** Nome em português, pro aviso do chat ("precisa de picareta de pedra"). */
  readonly nome: string;
}

/** O material de cada nível escrito UMA vez — é ele que nomeia as 12
 *  ferramentas, e é por isso que "de pedra" nunca sai diferente em duas. */
const MATERIAL: ReadonlyMap<number, string> = new Map([
  [NIVEL_MADEIRA, "madeira"],
  [NIVEL_PEDRA, "pedra"],
  [NIVEL_FERRO, "ferro"],
  [NIVEL_DIAMANTE, "diamante"],
]);

/** Os 4 ids de um tipo, do mais barato ao mais caro — a ordem É a progressão. */
const familia = (
  tipo: TipoFerramenta,
  ids: readonly [number, number, number, number],
): readonly (readonly [number, Ferramenta])[] =>
  ids.map((id, i) => {
    const nivel = NIVEL_MADEIRA + i;
    return [id, { tipo, nivel, nome: `${tipo} de ${MATERIAL.get(nivel)}` }] as const;
  });

/**
 * Item → o que ele é. Set explícito: a banda ≥900 não é intervalo aberto.
 *
 * As três famílias são GERADAS (e não escritas linha a linha) desde o §🪓: 12
 * linhas à mão são 12 chances de trocar um nível ou escrever "picareta de
 * pedra" num machado — e o nome é o que a criança lê no aviso do chat.
 */
export const FERRAMENTAS: ReadonlyMap<number, Ferramenta> = new Map([
  ...familia("picareta", [
    ITEM_PICARETA_MADEIRA, ITEM_PICARETA_PEDRA, ITEM_PICARETA_FERRO, ITEM_PICARETA_DIAMANTE,
  ]),
  ...familia("machado", [
    ITEM_MACHADO_MADEIRA, ITEM_MACHADO_PEDRA, ITEM_MACHADO_FERRO, ITEM_MACHADO_DIAMANTE,
  ]),
  ...familia("pá", [ITEM_PA_MADEIRA, ITEM_PA_PEDRA, ITEM_PA_FERRO, ITEM_PA_DIAMANTE]),
]);

/** O que este bloco EXIGE pra ser quebrado (`null` = a mão nua dá conta). */
export interface Exigencia {
  readonly tipo: TipoFerramenta;
  readonly nivel: number;
}

const PICARETA = (nivel: number): Exigencia => ({ tipo: "picareta", nivel });

/**
 * Blocos que exigem picareta, e de que nível.
 *
 * A régua é a do Minecraft, e ela é a própria cadeia: pedra e carvão saem com a
 * picareta mais barata (senão ninguém sai do lugar), ferro exige a de pedra,
 * ouro e diamante exigem a de ferro, e a obsidiana — que aqui é fabricada, não
 * achada — exige a de diamante, que é o que a mantém sendo o bloco difícil.
 *
 * **Terra, areia, madeira, folha, bloco de algodão e vidro ficam de fora**: são o que o aluno
 * usa pra construir, e cobrar ferramenta neles transformaria uma aula de
 * construção numa aula de inventário.
 */
const EXIGE = new Map<number, Exigencia>([
  [BlockId.Stone, PICARETA(NIVEL_MADEIRA)],
  [BlockId.Cobblestone, PICARETA(NIVEL_MADEIRA)],
  [BlockId.Sandstone, PICARETA(NIVEL_MADEIRA)],
  [BlockId.StoneBricks, PICARETA(NIVEL_MADEIRA)],
  [BlockId.Brick, PICARETA(NIVEL_MADEIRA)],
  [BlockId.MinerioCarvao, PICARETA(NIVEL_MADEIRA)],
  [BlockId.MinerioFerro, PICARETA(NIVEL_PEDRA)],
  [BlockId.MinerioOuro, PICARETA(NIVEL_FERRO)],
  [BlockId.MinerioDiamante, PICARETA(NIVEL_FERRO)],
  [BlockId.Obsidian, PICARETA(NIVEL_DIAMANTE)],
]);

/** Materiais de laje/escada que são PEDRA (0 pedra, 2 tijolo; 1 é tábua). */
const MATERIAL_DE_PEDRA: ReadonlySet<number> = new Set([0, 2]);

/**
 * O que quebrar esta célula exige. Deriva das FAMÍLIAS onde elas existem —
 * escrever os 24 ids de escada à mão seria a garantia de esquecer um.
 */
export function exigenciaDe(blockId: number): Exigencia | null {
  const direto = EXIGE.get(blockId);
  if (direto) return direto;
  // laje e escada herdam do material (as de tábua saem com a mão)
  if (isSlab(blockId)) {
    return MATERIAL_DE_PEDRA.has(slabMaterial(blockId)) ? PICARETA(NIVEL_MADEIRA) : null;
  }
  if (isStairs(blockId)) {
    return MATERIAL_DE_PEDRA.has(stairsMaterial(blockId)) ? PICARETA(NIVEL_MADEIRA) : null;
  }
  // os 36 glifos são pedregulho escrito, e a fornalha é 8 pedregulhos
  if (blockId >= BlockId.LetterA && blockId <= BlockId.Digit9) return PICARETA(NIVEL_MADEIRA);
  if (isFornalha(blockId)) return PICARETA(NIVEL_MADEIRA);
  return null;
}

/**
 * A melhor ferramenta DESTE tipo que o jogador tem (nível 0 = nenhuma).
 *
 * **Olha a MOCHILA inteira, não a mão.** É uma escolha de sala de aula: "você
 * precisa de uma picareta" é uma frase que a criança resolve; "você precisa
 * dela na MÃO, e não na mochila" é um segundo enigma em cima do primeiro, e o
 * clique não tem como explicar qual dos dois falhou. Como consequência, o
 * servidor também não precisa saber qual slot está selecionado — e o
 * `break_block` continua sendo três coordenadas.
 */
export function melhorNivel(inv: Inventario, tipo: TipoFerramenta): number {
  let nivel = 0;
  for (const [id, f] of FERRAMENTAS) {
    if (f.tipo !== tipo) continue;
    if (f.nivel <= nivel) continue;
    if (contar(inv, id) > 0) nivel = f.nivel;
  }
  return nivel;
}

/** O nome PT da ferramenta de um (tipo × nível), ou `null` se não existe uma. */
export function nomeDaFerramenta(tipo: TipoFerramenta, nivel: number): string | null {
  return (
    [...FERRAMENTAS.values()].find((f) => f.tipo === tipo && f.nivel === nivel)?.nome ?? null
  );
}

/**
 * §💬 (tooltip) — os blocos que passam a sair com esta ferramenta, e SÓ eles:
 * os de nível menor já saíam com a anterior, então listá-los de novo faria toda
 * picareta dizer a mesma coisa. É o "serve pra quê" da picareta escrito com a
 * tabela que já decide a quebra — sem uma segunda lista pra sair de sincronia.
 *
 * Só o que está no `EXIGE` direto: laje, escada e glifo herdam do material e
 * apareceriam como dezenas de ids repetindo "pedra", que é ruído num tooltip.
 */
export function liberadosPor(tipo: TipoFerramenta, nivel: number): readonly number[] {
  const ids: number[] = [];
  for (const [id, ex] of EXIGE) {
    if (ex.tipo === tipo && ex.nivel === nivel) ids.push(id);
  }
  return ids;
}

/**
 * O jogador consegue quebrar esta célula? `null` = sim; string = o AVISO que
 * ele vai ler no chat.
 *
 * A decisão do usuário: sem a ferramenta certa o bloco **NÃO QUEBRA**, com
 * aviso — e não "quebra e não cai nada", que é o que o Minecraft faz. Lá existe
 * tempo de quebra pra avisar antes; aqui é um clique instantâneo, e "sumiu e eu
 * não ganhei nada" é frustração de aula, não desafio.
 */
export function faltaFerramenta(inv: Inventario, blockId: number): string | null {
  const exige = exigenciaDe(blockId);
  if (!exige) return null;
  if (melhorNivel(inv, exige.tipo) >= exige.nivel) return null;
  const nome = nomeDaFerramenta(exige.tipo, exige.nivel);
  return `Você precisa de uma ${nome ?? exige.tipo} para quebrar isso.`;
}

// ---------------------------------------------------------------------------
// §🔨 Ferramentas v2 (2026-09-17) — DURABILIDADE e TEMPO DE QUEBRA
//
// As duas peças novas moram aqui em cima da tabela (tipo × família) que o F10d
// já tinha deixado pronta justamente pra este dia. Continua tudo PURO: nenhuma
// função abaixo conhece rede, relógio de parede ou render — o servidor conta
// TICKS e o cliente prevê o mesmo número com as mesmas entradas.
// ---------------------------------------------------------------------------

/**
 * Quantas quebras cada ferramenta aguenta — a régua do Minecraft, e ela é
 * pedagógica: a picareta de madeira (59) acaba dentro de uma aula, o que é o
 * ponto; a de diamante (1561) na prática não acaba, o que é a recompensa.
 *
 * É o MATERIAL que decide, não o tipo (§🪓): machado, pá e picareta de pedra
 * aguentam os mesmos 131. Uma tabela por tipo seria três listas pra manter em
 * sincronia sem nenhuma pergunta que elas respondessem diferente.
 */
const POR_MATERIAL: ReadonlyMap<number, number> = new Map([
  [NIVEL_MADEIRA, 59],
  [NIVEL_PEDRA, 131],
  [NIVEL_FERRO, 250],
  [NIVEL_DIAMANTE, 1561],
]);

export const DURABILIDADE: ReadonlyMap<number, number> = new Map(
  [...FERRAMENTAS].map(([id, f]) => [id, POR_MATERIAL.get(f.nivel) ?? 59]),
);

/** Quantas quebras este item aguenta, ou `null` se ele não é ferramenta. */
export function durabilidadeDe(id: number): number | null {
  return DURABILIDADE.get(id) ?? null;
}

/**
 * Vida da pilha: `atual` de `max`, ou `null` se não for ferramenta.
 *
 * É AQUI que o `dano` vindo do save é clampado contra a durabilidade real — o
 * `parseInventario` só confere a forma (inteiro ≥ 1), porque importar esta
 * tabela de lá faria ciclo entre os dois módulos. `atual` nunca é negativo.
 */
export function vidaDe(pilha: Stack): { atual: number; max: number } | null {
  const max = durabilidadeDe(pilha.id);
  if (max === null) return null;
  const usado = Math.min(pilha.dano ?? 0, max);
  return { atual: max - usado, max };
}

/**
 * Gasta `n` de durabilidade. Devolve a pilha nova, ou **`null` quando a
 * ferramenta acabou** — decisão do usuário: ela SOME (com aviso e som), não
 * fica no inventário esperando conserto.
 *
 * Quem não é ferramenta volta intacto: assim quem chama pode gastar sem
 * perguntar antes o que tem na mão.
 */
export function gastar(pilha: Stack, n = 1): Stack | null {
  const max = durabilidadeDe(pilha.id);
  if (max === null) return pilha;
  const dano = Math.min(pilha.dano ?? 0, max) + Math.max(1, Math.trunc(n));
  if (dano >= max) return null; // acabou
  return { ...pilha, dano };
}

/** A ferramenta que esta pilha É (ou `null` — mão vazia, bloco, comida…). */
export function ferramentaDe(pilha: Slot): Ferramenta | null {
  if (!pilha) return null;
  return FERRAMENTAS.get(pilha.id) ?? null;
}

/**
 * DUREZA do bloco: quanto tempo (ms) ele leva na MÃO NUA.
 *
 * Números escolhidos pra caber numa aula, não pra copiar o Minecraft bloco a
 * bloco: terra/areia saem num toque (500 ms), madeira pede um segundo e meio,
 * pedra é o "difícil" que a picareta resolve, e a obsidiana continua sendo o
 * bloco que só o diamante faz num tempo humano. Blocos que exigem picareta
 * nunca são quebrados com a mão (o gate recusa antes), então a dureza deles
 * vale como BASE da divisão — não como espera real.
 */
const DUREZA_PADRAO = 750;
const DUREZA = new Map<number, number>([
  [BlockId.Dirt, 500],
  [BlockId.Grass, 600],
  [BlockId.GramaSeca, 600],
  [BlockId.GramaFria, 600],
  [BlockId.Snow, 400],
  [BlockId.Sand, 500],
  [BlockId.Gravel, 600],
  // §🪓 (2026-09-23): a MADEIRA ganhou linha. Ela caía no padrão de 750 ms
  // desde sempre — o comentário acima já prometia "um segundo e meio", e a
  // linha nunca existiu. Sem ela o machado não tinha o que acelerar: 750/4,
  // 750/6 e 750/8 batem todos no piso de 150 ms e os quatro níveis empatam.
  // **Preço, decidido pelo usuário:** derrubar árvore de mão nua passa de
  // 0,75 s pra 1,5 s por bloco, e é a primeira coisa que a turma faz na aula —
  // o machado de madeira devolve exatamente o tempo de antes.
  [BlockId.Log, 1500],
  [BlockId.LogIpe, 1500],
  [BlockId.LogAraucaria, 1500],
  [BlockId.LogPauBrasil, 1500],
  [BlockId.Planks, 1000],
  [BlockId.Stone, 2250],
  [BlockId.Cobblestone, 2000],
  [BlockId.Sandstone, 1200],
  [BlockId.StoneBricks, 2250],
  [BlockId.Brick, 2000],
  [BlockId.MinerioCarvao, 3000],
  [BlockId.MinerioFerro, 3000],
  [BlockId.MinerioOuro, 3000],
  [BlockId.MinerioDiamante, 3000],
  [BlockId.Obsidian, 12000],
]);

/**
 * O quanto cada nível ACELERA. É a régua do Minecraft (2/4/6/8) e ela é o que
 * dá sentido a subir de picareta: a pedra que levava 2,25 s na madeira leva
 * meio segundo no diamante, e o aluno SENTE a diferença sem ler tabela.
 */
const FATOR_POR_NIVEL: ReadonlyMap<number, number> = new Map([
  [NIVEL_MADEIRA, 2],
  [NIVEL_PEDRA, 4],
  [NIVEL_FERRO, 6],
  [NIVEL_DIAMANTE, 8],
]);

/** Piso de tempo: nada quebra em 0 ms, senão o segurar-pra-quebrar some. */
export const QUEBRA_MINIMA_MS = 150;

/**
 * Quanto tempo (ms) quebrar esta célula leva com ISTO na mão.
 *
 * A ferramenta só acelera se for do TIPO que o bloco pede (picareta em pedra);
 * picareta em terra é mão nua, como no Minecraft. Ferramenta gasta corta o
 * mesmo tanto — desgaste aqui é vida, não velocidade, e "minha picareta ficou
 * lenta" seria mais um enigma invisível pra criança.
 */
export function tempoDeQuebraMs(blockId: number, mao: Slot): number {
  const ideal = ferramentaIdealDe(blockId);
  const base = durezaDe(blockId, ideal);
  const f = ferramentaDe(mao);
  const acelera = f !== null && ideal !== null && f.tipo === ideal;
  const fator = acelera ? (FATOR_POR_NIVEL.get(f.nivel) ?? 1) : 1;
  return Math.max(QUEBRA_MINIMA_MS, Math.round(base / fator));
}

/**
 * Dureza da célula. Quem não está na tabela cai no padrão — MENOS a família do
 * machado, que tem um padrão próprio (§🪓): cerca, baú, porta, móvel, laje e
 * escada de tábua são dezenas de ids de madeira trabalhada, e escrevê-los um a
 * um na `DUREZA` seria a lista que esquece o móvel seguinte. O tronco e a
 * tábua continuam com linha própria porque são os dois que a aula sente.
 */
const DUREZA_MADEIRA_TRABALHADA = 1000;

function durezaDe(blockId: number, ideal: TipoFerramenta | null): number {
  const direto = DUREZA.get(blockId);
  if (direto !== undefined) return direto;
  return ideal === "machado" ? DUREZA_MADEIRA_TRABALHADA : DUREZA_PADRAO;
}

/**
 * Blocos que o MACHADO e a PÁ aceleram, e **só aceleram**: nenhum deles entra
 * no `EXIGE`, então continuam saindo com a mão nua. Essa é a linha inteira do
 * §🪓 — exigência (que barra a quebra) e ideal (que acelera) são coisas
 * diferentes, e foi confundi-las que fez a terra ficar rápida com picareta.
 *
 * A **pá** pega o que se CAVA (terra, grama de todo clima, areia, cascalho,
 * neve); o **machado**, o que é madeira — tronco, tábua e tudo que sai da
 * tábua. Folha fica de fora: ela já sai num toque e um machado que derruba a
 * copa inteira mais rápido tira da árvore o que ela tem de aula (subir, olhar,
 * escolher). Vidro e janela também: são vidro, não madeira.
 */
const IDEAL_DIRETO: ReadonlyMap<number, TipoFerramenta> = new Map([
  [BlockId.Dirt, "pá"],
  [BlockId.Grass, "pá"],
  [BlockId.GramaSeca, "pá"],
  [BlockId.GramaFria, "pá"],
  [BlockId.Sand, "pá"],
  [BlockId.Gravel, "pá"],
  [BlockId.Snow, "pá"],
  [BlockId.Log, "machado"],
  [BlockId.LogIpe, "machado"],
  [BlockId.LogAraucaria, "machado"],
  [BlockId.LogPauBrasil, "machado"],
  [BlockId.Planks, "machado"],
  [BlockId.Cerca, "machado"],
  [BlockId.Bau, "machado"],
  [BlockId.BauLoja, "machado"],
]);

/** Material 1 de laje/escada é TÁBUA (0 pedra, 2 tijolo) — ver `MATERIAL_DE_PEDRA`. */
const MATERIAL_DE_TABUA = 1;

/**
 * Qual ferramenta ACELERA este bloco (mesmo quando ela não é obrigatória).
 *
 * A ordem importa: quem EXIGE picareta já respondeu (e nenhum bloco de pedra
 * cai nas famílias abaixo). O resto deriva de FAMÍLIA pela mesma razão do
 * `exigenciaDe` — escrever os 24 ids de escada à mão é a garantia de esquecer
 * um.
 */
export function ferramentaIdealDe(blockId: number): TipoFerramenta | null {
  const exige = exigenciaDe(blockId);
  if (exige) return exige.tipo;
  const direto = IDEAL_DIRETO.get(blockId);
  if (direto) return direto;
  if (isSlab(blockId)) return slabMaterial(blockId) === MATERIAL_DE_TABUA ? "machado" : null;
  if (isStairs(blockId)) return stairsMaterial(blockId) === MATERIAL_DE_TABUA ? "machado" : null;
  if (isPorta(blockId) || isMovel(blockId) || isQuadro(blockId)) return "machado";
  return null;
}

/**
 * §💬 (tooltip) — os blocos que esta ferramenta ACELERA sem exigir. É o "serve
 * pra quê" do machado e da pá, que não destravam nada e portanto teriam um
 * `liberadosPor` vazio: sem esta lista o tooltip deles diria só "ferramenta".
 *
 * Só o `IDEAL_DIRETO`, e pela mesma razão do `liberadosPor`: as famílias
 * derivadas apareceriam como dezenas de ids repetindo "escada de tábua".
 */
export function aceleradosPor(tipo: TipoFerramenta): readonly number[] {
  const ids: number[] = [];
  for (const [id, t] of IDEAL_DIRETO) if (t === tipo) ids.push(id);
  return ids;
}

/** O mesmo tempo, contado em TICKS de servidor (é o relógio do autoritativo). */
export function ticksDeQuebra(blockId: number, mao: Slot): number {
  return Math.max(1, Math.ceil((tempoDeQuebraMs(blockId, mao) * SERVER_TICK_RATE) / 1000));
}

/**
 * §🔨 v2: o gate agora olha a MÃO, não a mochila (decisão do usuário, que
 * reabre a do F10d de propósito). O que paga por isso é o aviso: a frase diz
 * PEGUE, não "fabrique", porque o caso comum da sala vai ser a picareta estar
 * na mochila enquanto a criança segura terra.
 */
export function faltaFerramentaNaMao(mao: Slot, blockId: number): string | null {
  const exige = exigenciaDe(blockId);
  if (!exige) return null;
  const f = ferramentaDe(mao);
  if (f && f.tipo === exige.tipo && f.nivel >= exige.nivel) return null;
  const nome = nomeDaFerramenta(exige.tipo, exige.nivel);
  return `Pegue uma ${nome ?? exige.tipo} na mão para quebrar isso.`;
}
