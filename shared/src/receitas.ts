import { BlockId, ITEM_BALDE_VAZIO, ITEM_PAO, ITEM_TRIGO } from "./blocks";
import {
  type Inventario,
  type Stack,
  adicionar,
  cabe,
  contar,
  remover,
} from "./inventario";

/**
 * §🍖 F5 — CRAFT POR LISTA (receitas puras).
 *
 * Módulo PURO, no molde do `inventario.ts`/`drops.ts`: sem I/O, sem rede. O
 * servidor valida e aplica (`fabricar`), o cliente só PEDE por índice — nunca
 * decide. **Grade 3×3 descartada** (arrastar dói no tablet, ROADMAP §🍖): o
 * jogador escolhe uma receita da lista e o servidor consome os ingredientes e
 * entrega a saída, tudo ou nada.
 *
 * **Sem bancada no lite.** Fabrica em qualquer lugar. O dia em que a bancada
 * servir pra ESCALONAR receitas avançadas, ela vira um campo `exige?` aqui —
 * sem tocar em quem chama.
 *
 * O índice na lista `RECEITAS` é a IDENTIDADE da receita no protocolo (a
 * mensagem `fabricar` manda o índice). Por isso a ordem é APPEND-only, como o
 * `BlockId`: inserir no meio deslocaria o que o cliente já conhece. Receita
 * nova entra no fim.
 */

/** Uma receita: o que sai + a lista de ingredientes (ids DISTINTOS entre si). */
export interface Receita {
  readonly saida: Stack;
  readonly custo: readonly Stack[];
}

/**
 * As receitas do lite. Sem fundição (não há forno no lite), então o universo é
 * madeira e pedra — as duas cadeias que ensinam DEPENDÊNCIA e SEQUÊNCIA
 * (tronco → tábuas → escada), que é a pedagogia. Cada tronco de espécie
 * diferente vira tábuas: são entradas separadas de propósito, pra a lista
 * mostrar ao aluno QUAL madeira ele pode usar.
 *
 * O balde fecha o pendente do F4 (era só item de criativo): 3 minérios de ferro
 * viram 1 balde vazio. Não é o número do Minecraft (lá são 3 lingotes), mas no
 * lite não há fundição pra transformar minério em lingote — o minério cru é o
 * material mais próximo, e o balde é o que destrava a água em sobrevivência.
 *
 * O **pão** (§🍖 F6) é a única receita de COMIDA, e é ela que dá sentido à
 * plantação: o trigo colhido não se come, então plantar → esperar → colher →
 * fabricar é uma cadeia de 4 passos com dependência de tempo no meio. É a mesma
 * pedagogia do tronco → tábua → escada, só que a recompensa é sobreviver.
 */
const BASE: readonly Receita[] = [
  // --- madeira ---
  { saida: { id: BlockId.Planks, qtd: 4 }, custo: [{ id: BlockId.Log, qtd: 1 }] },
  { saida: { id: BlockId.Planks, qtd: 4 }, custo: [{ id: BlockId.LogIpe, qtd: 1 }] },
  { saida: { id: BlockId.Planks, qtd: 4 }, custo: [{ id: BlockId.LogAraucaria, qtd: 1 }] },
  { saida: { id: BlockId.Planks, qtd: 4 }, custo: [{ id: BlockId.LogPauBrasil, qtd: 1 }] },
  { saida: { id: BlockId.LajeTabuaBaixo, qtd: 6 }, custo: [{ id: BlockId.Planks, qtd: 3 }] },
  { saida: { id: BlockId.EscadaTabuaXP, qtd: 4 }, custo: [{ id: BlockId.Planks, qtd: 6 }] },
  { saida: { id: BlockId.Mesa, qtd: 1 }, custo: [{ id: BlockId.Planks, qtd: 4 }] },
  { saida: { id: BlockId.Cerca, qtd: 3 }, custo: [{ id: BlockId.Planks, qtd: 4 }] },
  // --- pedra ---
  { saida: { id: BlockId.LajePedraBaixo, qtd: 6 }, custo: [{ id: BlockId.Cobblestone, qtd: 3 }] },
  { saida: { id: BlockId.EscadaPedraXP, qtd: 4 }, custo: [{ id: BlockId.Cobblestone, qtd: 6 }] },
  // --- ferramenta ---
  { saida: { id: ITEM_BALDE_VAZIO, qtd: 1 }, custo: [{ id: BlockId.MinerioFerro, qtd: 3 }] },
  // --- comida (§🍖 F6) — APPEND no fim, como manda a regra do índice ---
  { saida: { id: ITEM_PAO, qtd: 1 }, custo: [{ id: ITEM_TRIGO, qtd: 3 }] },
];

/**
 * --- COBERTURA TOTAL (2026-08-05, pedido do usuário depois do playtest com 17
 * alunos) ---
 *
 * Até aqui a sobrevivência alcançava madeira, pedra, o balde e o pão: lã,
 * vidro, tijolo, tocha, porta, janela, móvel, tapete e quadro só existiam em
 * criativo ou pela mão do professor (`/dar`). O pedido foi cobrir TUDO, e o
 * escopo escolhido foi o grande: **inventar os elos que faltam**.
 *
 * **Por que inventar.** Metade das cadeias do Minecraft passa por FORNO (vidro,
 * tijolo, lingote) ou por MOB (lã de ovelha, corante de mob), e o lite não tem
 * nem um nem outro. Copiar a receita de lá deixaria o bloco inalcançável; então
 * cada ponte usa material que o aluno JÁ tira do mundo com a mão, e carrega uma
 * explicação que se conta em uma frase pra turma:
 *
 * - **vidro ← areia** (o forno é o que falta, e a areia é o que sobra)
 * - **tijolo ← terra + areia** (barro secado ao sol, sem fornalha)
 * - **lã ← trigo** (fibra da palha: a horta passa a alimentar a construção
 *   também, e é uma ESCOLHA — o mesmo trigo faz pão)
 * - **corante ← FLOR** (e as cores que não têm flor saem de MISTURA: laranja é
 *   amarelo + vermelho, roxo é vermelho + azul). Misturar cor é conteúdo de
 *   sala de aula, e aqui ele é uma receita de verdade.
 * - **pedra ← 2 pedregulho** (quem quebra pedra recebe pedregulho: sem isto a
 *   pedra lisa é o único bloco que o aluno vê e não consegue repor)
 * - **tocha ← tábua + carvão**, **folhagem ← tronco da MESMA espécie**,
 *   **grama ← terra + o que define o clima** (semente = verde, areia = seca,
 *   neve = fria).
 *
 * O que continua SEM receita, de propósito, está na constante `SEM_RECEITA`
 * abaixo — e um teste-portão prova que a lista é essa e não outra.
 */

/** Uma cor do jogo: os três blocos dela e o que a tinge. A ordem das três
 *  famílias (lã, vidro colorido, tapete) é a MESMA no `BlockId`, então uma
 *  tabela só gera as 36 receitas sem repetir a paleta três vezes. */
interface Cor {
  nome: string;
  la: number;
  vidro: number;
  tapete: number;
  /** Ingredientes que dão a cor (ids DISTINTOS, como manda `Receita.custo`). */
  corante: readonly Stack[];
}

const F_VERMELHA = { id: BlockId.FlorVermelha, qtd: 1 } as const;
const F_AMARELA = { id: BlockId.FlorAmarela, qtd: 1 } as const;
const F_AZUL = { id: BlockId.FlorAzul, qtd: 1 } as const;
const F_BRANCA = { id: BlockId.FlorBranca, qtd: 1 } as const;
/** Verde não tem flor: sai do mandacaru, o cacto da caatinga. */
const VERDE = { id: BlockId.Mandacaru, qtd: 1 } as const;

const CORES: readonly Cor[] = [
  { nome: "branco", la: BlockId.WoolWhite, vidro: BlockId.VidroBranco, tapete: BlockId.TapeteBranco, corante: [F_BRANCA] },
  { nome: "preto", la: BlockId.WoolBlack, vidro: BlockId.VidroPreto, tapete: BlockId.TapetePreto, corante: [{ id: BlockId.MinerioCarvao, qtd: 1 }] },
  { nome: "vermelho", la: BlockId.WoolRed, vidro: BlockId.VidroVermelho, tapete: BlockId.TapeteVermelho, corante: [F_VERMELHA] },
  // laranja, roxo, rosa e ciano NÃO têm flor própria: saem de MISTURA
  { nome: "laranja", la: BlockId.WoolOrange, vidro: BlockId.VidroLaranja, tapete: BlockId.TapeteLaranja, corante: [F_AMARELA, F_VERMELHA] },
  { nome: "amarelo", la: BlockId.WoolYellow, vidro: BlockId.VidroAmarelo, tapete: BlockId.TapeteAmarelo, corante: [F_AMARELA] },
  { nome: "verde", la: BlockId.WoolGreen, vidro: BlockId.VidroVerde, tapete: BlockId.TapeteVerde, corante: [VERDE] },
  { nome: "azul", la: BlockId.WoolBlue, vidro: BlockId.VidroAzul, tapete: BlockId.TapeteAzul, corante: [F_AZUL] },
  { nome: "roxo", la: BlockId.WoolPurple, vidro: BlockId.VidroRoxo, tapete: BlockId.TapeteRoxo, corante: [F_VERMELHA, F_AZUL] },
  { nome: "rosa", la: BlockId.WoolPink, vidro: BlockId.VidroRosa, tapete: BlockId.TapeteRosa, corante: [F_VERMELHA, F_BRANCA] },
  { nome: "ciano", la: BlockId.WoolCyan, vidro: BlockId.VidroCiano, tapete: BlockId.TapeteCiano, corante: [F_AZUL, VERDE] },
  { nome: "cinza", la: BlockId.WoolGray, vidro: BlockId.VidroCinza, tapete: BlockId.TapeteCinza, corante: [{ id: BlockId.Cobblestone, qtd: 1 }] },
  { nome: "marrom", la: BlockId.WoolBrown, vidro: BlockId.VidroMarrom, tapete: BlockId.TapeteMarrom, corante: [{ id: BlockId.Dirt, qtd: 1 }] },
];

/** Materiais de construção — as pontes que substituem o forno. */
const MATERIAIS: readonly Receita[] = [
  { saida: { id: BlockId.Glass, qtd: 1 }, custo: [{ id: BlockId.Sand, qtd: 2 }] },
  { saida: { id: BlockId.Stone, qtd: 1 }, custo: [{ id: BlockId.Cobblestone, qtd: 2 }] },
  { saida: { id: BlockId.StoneBricks, qtd: 4 }, custo: [{ id: BlockId.Stone, qtd: 4 }] },
  { saida: { id: BlockId.Sandstone, qtd: 1 }, custo: [{ id: BlockId.Sand, qtd: 4 }] },
  { saida: { id: BlockId.Brick, qtd: 4 }, custo: [{ id: BlockId.Dirt, qtd: 2 }, { id: BlockId.Sand, qtd: 2 }] },
  { saida: { id: BlockId.Gravel, qtd: 2 }, custo: [{ id: BlockId.Cobblestone, qtd: 1 }] },
  // obsidiana não nasce no mundo (nem há lava): é pedra prensada e queimada,
  // e o preço alto é o que a mantém sendo o bloco "difícil" de uma construção
  { saida: { id: BlockId.Obsidian, qtd: 1 }, custo: [{ id: BlockId.Stone, qtd: 4 }, { id: BlockId.MinerioCarvao, qtd: 1 }] },
  // lajes e escadas de tijolo (as de pedra e tábua já existiam na BASE)
  { saida: { id: BlockId.LajeTijoloBaixo, qtd: 6 }, custo: [{ id: BlockId.Brick, qtd: 3 }] },
  { saida: { id: BlockId.EscadaTijoloXP, qtd: 4 }, custo: [{ id: BlockId.Brick, qtd: 6 }] },
  // a tocha é o que faz a caverna (e a noite do F9) ser jogável
  { saida: { id: BlockId.Tocha, qtd: 4 }, custo: [{ id: BlockId.Planks, qtd: 1 }, { id: BlockId.MinerioCarvao, qtd: 1 }] },
];

/** Lã: a BRANCA é a base (fibra de trigo, sem tintura); as outras 11 se tingem
 *  a partir dela. Duas etapas de propósito — é a mesma dependência do tronco →
 *  tábua → escada, e o aluno vê a cor NASCER de uma mistura. */
const LAS: readonly Receita[] = [
  { saida: { id: BlockId.WoolWhite, qtd: 1 }, custo: [{ id: ITEM_TRIGO, qtd: 2 }] },
  ...CORES.filter((c) => c.la !== BlockId.WoolWhite).map((c) => ({
    saida: { id: c.la, qtd: 1 },
    custo: [{ id: BlockId.WoolWhite, qtd: 1 }, ...c.corante],
  })),
];

/** Vidro colorido: o mesmo corante da lã, agora sobre o vidro liso. O branco
 *  também se tinge (o vidro liso é transparente, o branco é leitoso). */
const VIDROS: readonly Receita[] = CORES.map((c) => ({
  saida: { id: c.vidro, qtd: 1 },
  custo: [{ id: BlockId.Glass, qtd: 1 }, ...c.corante],
}));

/** Tapete: 2 lãs da MESMA cor viram 3 tapetes (o número do Minecraft). */
const TAPETES: readonly Receita[] = CORES.map((c) => ({
  saida: { id: c.tapete, qtd: 3 },
  custo: [{ id: c.la, qtd: 2 }],
}));

/** Móveis e aberturas. Direção e metade NÃO entram na receita: o que sai é a
 *  forma canônica (a entrada da mochila), e quem escolhe pra onde a porta abre
 *  ou a cadeira olha é o olhar do aluno no `place_block` (ver `drops.ts`). */
const MOVEIS: readonly Receita[] = [
  { saida: { id: BlockId.PortaXFechada, qtd: 3 }, custo: [{ id: BlockId.Planks, qtd: 6 }] },
  { saida: { id: BlockId.JanelaXFechada, qtd: 2 }, custo: [{ id: BlockId.Glass, qtd: 2 }, { id: BlockId.Planks, qtd: 1 }] },
  { saida: { id: BlockId.CadeiraXP, qtd: 1 }, custo: [{ id: BlockId.Planks, qtd: 4 }] },
  { saida: { id: BlockId.SofaXP, qtd: 1 }, custo: [{ id: BlockId.Planks, qtd: 3 }, { id: BlockId.WoolWhite, qtd: 2 }] },
  { saida: { id: BlockId.CamaXP, qtd: 1 }, custo: [{ id: BlockId.Planks, qtd: 3 }, { id: BlockId.WoolWhite, qtd: 3 }] },
  { saida: { id: BlockId.QuadroXP, qtd: 1 }, custo: [{ id: BlockId.Planks, qtd: 2 }, { id: BlockId.WoolWhite, qtd: 1 }] },
];

/**
 * Natureza: o que o mundo tem mas a mão não devolve. Folha quebrada não vira
 * folha (às vezes vira fruta) e capim quebrado não vira capim (às vezes vira
 * semente) — sem estas receitas, quem derruba uma árvore não consegue plantar
 * outra copa, e a grama vira um recurso que só se gasta.
 */
const NATUREZA: readonly Receita[] = [
  { saida: { id: BlockId.Leaves, qtd: 4 }, custo: [{ id: BlockId.Log, qtd: 1 }] },
  { saida: { id: BlockId.FolhasIpe, qtd: 4 }, custo: [{ id: BlockId.LogIpe, qtd: 1 }] },
  { saida: { id: BlockId.FolhasAraucaria, qtd: 4 }, custo: [{ id: BlockId.LogAraucaria, qtd: 1 }] },
  { saida: { id: BlockId.FolhasPauBrasil, qtd: 4 }, custo: [{ id: BlockId.LogPauBrasil, qtd: 1 }] },
  // grama = terra + o que define o CLIMA dela (a mesma leitura do gen: verde
  // onde brota, seca no calor, fria onde tem neve)
  { saida: { id: BlockId.Grass, qtd: 1 }, custo: [{ id: BlockId.Dirt, qtd: 1 }, { id: BlockId.Plantacao0, qtd: 1 }] },
  { saida: { id: BlockId.GramaSeca, qtd: 1 }, custo: [{ id: BlockId.Dirt, qtd: 1 }, { id: BlockId.Sand, qtd: 1 }] },
  { saida: { id: BlockId.GramaFria, qtd: 1 }, custo: [{ id: BlockId.Dirt, qtd: 1 }, { id: BlockId.Snow, qtd: 1 }] },
  // capim alto: 1 semente vira 2 tufos (decoração; quebrar tufo devolve semente
  // em 1 de cada 4, então o ciclo dá prejuízo e ninguém multiplica semente aqui)
  { saida: { id: BlockId.GramaAlta, qtd: 2 }, custo: [{ id: BlockId.Plantacao0, qtd: 1 }, { id: BlockId.Grass, qtd: 1 }] },
  { saida: { id: BlockId.GramaAltaSeca, qtd: 2 }, custo: [{ id: BlockId.Plantacao0, qtd: 1 }, { id: BlockId.GramaSeca, qtd: 1 }] },
  { saida: { id: BlockId.GramaAltaFria, qtd: 2 }, custo: [{ id: BlockId.Plantacao0, qtd: 1 }, { id: BlockId.GramaFria, qtd: 1 }] },
];

/**
 * Blocos-glifo (letras A–Z e dígitos 0–9): 36 receitas iguais, geradas em
 * ordem — **pedregulho escrito com carvão**. São os blocos da pedagogia de
 * soletrar e contar, e ficam por último de propósito: quem procura material de
 * construção não tropeça em 36 linhas antes de achar a tábua (e o filtro de
 * texto do painel acha "letra a" direto).
 */
const GLIFOS: readonly Receita[] = Array.from({ length: 36 }, (_, i) => ({
  saida: { id: i < 26 ? BlockId.LetterA + i : BlockId.Digit0 + (i - 26), qtd: 1 },
  custo: [
    { id: BlockId.Cobblestone, qtd: 1 },
    { id: BlockId.MinerioCarvao, qtd: 1 },
  ],
}));

export const RECEITAS: readonly Receita[] = [
  ...BASE,
  ...MATERIAIS,
  ...LAS,
  ...VIDROS,
  ...TAPETES,
  ...MOVEIS,
  ...NATUREZA,
  ...GLIFOS,
];

/**
 * Colocáveis que continuam SEM receita, e a razão de cada um. É a lista que o
 * teste-portão usa: qualquer bloco novo que nascer sem receita e sem entrada
 * aqui derruba a suíte — a cobertura total não se mantém sozinha.
 */
export const SEM_RECEITA: ReadonlyMap<number, string> = new Map([
  [BlockId.Dirt, "sai de qualquer bloco de grama quebrado"],
  [BlockId.Cobblestone, "sai da pedra quebrada — é o material de entrada, não de saída"],
  [BlockId.Sand, "bloco de terreno: praia, deserto e leito de rio"],
  [BlockId.Snow, "bloco de terreno: nasce no alto dos biomas frios"],
  [BlockId.Log, "tronco: só a árvore do gen faz — plantar árvore é frente futura"],
  [BlockId.LogIpe, "tronco de ipê: só a árvore do cerrado faz"],
  [BlockId.LogAraucaria, "tronco de araucária: só a árvore do Sul faz"],
  [BlockId.LogPauBrasil, "tronco de pau-brasil: só a árvore da mata úmida faz"],
  [BlockId.Mandacaru, "cacto da caatinga: nasce no gen (e é o corante verde)"],
  [BlockId.FlorVermelha, "flor do gen — é ela que dá a cor, não o contrário"],
  [BlockId.FlorAmarela, "flor do gen — matéria-prima do corante amarelo"],
  [BlockId.FlorAzul, "flor do gen — matéria-prima do corante azul"],
  [BlockId.FlorBranca, "flor do gen — matéria-prima do corante branco"],
  [BlockId.MinerioCarvao, "minério: sai da caverna, e é a matéria-prima do corante preto e da tocha"],
  [BlockId.MinerioFerro, "minério: sai da caverna (e vira balde)"],
  [BlockId.MinerioOuro, "minério: sai da caverna — sem uso no lite ainda"],
  [BlockId.MinerioDiamante, "minério: sai da caverna — sem uso no lite ainda"],
  [BlockId.Plantacao0, "muda: vem do capim quebrado (1 em 4) e da colheita"],
  [BlockId.Bedrock, "só do professor (`isProfessorOnly`) — nunca vai pra mochila"],
]);

/** A receita EXISTE? (o índice veio pelo fio — aqui é onde ele para) */
export function receitaValida(indice: number): boolean {
  return Number.isInteger(indice) && indice >= 0 && indice < RECEITAS.length;
}

/** O jogador tem TODOS os ingredientes? (ainda não olha se a saída cabe) */
export function temIngredientes(inv: Inventario, receita: Receita): boolean {
  return receita.custo.every((c) => contar(inv, c.id) >= c.qtd);
}

/**
 * Dá pra fabricar AGORA? Precisa de todos os ingredientes E de lugar pra saída.
 * A saída quase sempre cabe (consumir liberou slot), mas uma mochila cheia de
 * outros ids com a saída de tipo novo pode não caber — e aí a UI mostra
 * "mochila cheia" em vez de deixar o clique sumir com os ingredientes.
 */
export function podeFabricar(inv: Inventario, receita: Receita): boolean {
  return fabricar(inv, receita) !== null;
}

/**
 * Consome os ingredientes e entrega a saída. **Tudo ou nada:** trabalha numa
 * cópia e só devolve o inventário novo se cada ingrediente saiu E a saída
 * coube; qualquer furo devolve `null` e nada é gasto. É a mesma disciplina do
 * `remover` (gasto parcial não existe).
 */
export function fabricar(inv: Inventario, receita: Receita): Inventario | null {
  let atual = inv;
  for (const c of receita.custo) {
    const { inv: depois, removido } = remover(atual, c.id, c.qtd);
    if (removido < c.qtd) return null;
    atual = depois;
  }
  if (!cabe(atual, receita.saida.id, receita.saida.qtd)) return null;
  return adicionar(atual, receita.saida.id, receita.saida.qtd).inv;
}

/** Quanto FALTA de cada ingrediente (`have`/`need` por id), pra a lista mostrar
 *  "falta 3 tábua". `falta` é 0 quando o jogador já tem o bastante. */
export function ingredientesDe(
  inv: Inventario,
  receita: Receita,
): readonly { id: number; need: number; have: number; falta: number }[] {
  return receita.custo.map((c) => {
    const have = contar(inv, c.id);
    return { id: c.id, need: c.qtd, have, falta: Math.max(0, c.qtd - have) };
  });
}
