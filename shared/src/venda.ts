import {
  BlockId,
  ITEM_BATATA_COZIDA,
  ITEM_CARVAO,
  ITEM_DIAMANTE,
  ITEM_FRUTA,
  ITEM_GRAVETO,
  ITEM_LINGOTE_FERRO,
  ITEM_LINGOTE_OURO,
  ITEM_PAO,
  PLANTAS,
  podeEstarNaMochila,
} from "./blocks";
import type { Slot } from "./inventario";

/**
 * §💰 VENDA AO SISTEMA (2026-10-20) — o módulo PURO do balcão de venda.
 *
 * **Por que ele existe:** até aqui o Dimas era estoque FIXO. Nascia
 * `DIMAS_INICIAL_PADRAO` na primeira entrada de cada aluno e só circulava entre
 * eles pelo baú-loja — quem gastasse ficava sem nenhum jeito de ganhar mais, e
 * a loja do colega morria no meio da aula. A venda ao sistema é a FONTE: o jogo
 * compra o que o aluno colheu e CRIA o Dimas que paga. Decisão do usuário
 * (2026-10-20), junto com a escala de preço e o "sem teto".
 *
 * **Só venda, nunca compra.** O sistema não vende nada de volta — quem vende
 * item é a loja do colega. Sem isso o baú-loja perderia a razão de existir, que
 * é o aluno precisar do aluno.
 *
 * ⚠️ A tabela é uma **LISTA DE PERMISSÃO**, e ela é curta de propósito. São 233
 * ids que podem estar numa mochila; precificar todos seria (a) impossível de
 * manter e (b) um cano de lavagem — `1 tronco → 4 tábuas` com os dois a 1 Dimas
 * multiplica dinheiro por 4. Então **só o que se COLHE, cria ou derrete tem
 * preço**; fabricado (mobília, laje, escada, porta, peça de circuito, letra,
 * ferramenta) não se vende.
 *
 * ⚠️ **Quem garante que a tabela não é máquina de Dimas é o PORTÃO**, não o
 * cuidado de quem escreve: `venda.test.ts` varre toda `RECEITAS` e toda
 * `COZIMENTO` e reprova se a saída valer mais que a entrada. Receita nova (ou
 * preço novo) que abra o cano reprova no mesmo commit — é a diferença entre uma
 * tabela que está certa hoje e uma que continua certa.
 */

/**
 * Preço de 1 unidade, em Dimas. Escala aprovada pelo usuário em 2026-10-20:
 * chão/pedra/madeira 1 · plantação 2 · pão e carvão 3 · lingote de ferro 6 ·
 * ouro 10 · diamante 20. **É baixa de propósito**: comprar na loja do colega
 * tem de continuar custando trabalho, senão a venda esvazia a loja.
 */
const PRECOS = new Map<number, number>([
  // ── 1 Dimas: o que se tira do chão com a mão ────────────────────────────
  [BlockId.Grass, 1],
  [BlockId.GramaSeca, 1],
  [BlockId.GramaFria, 1],
  [BlockId.Dirt, 1],
  [BlockId.Sand, 1],
  [BlockId.Stone, 1],
  [BlockId.Cobblestone, 1],
  [BlockId.Snow, 1],
  // ── 1 Dimas: a árvore. Só o TRONCO das 4 espécies, e o graveto ─────────
  // Nem a TÁBUA nem a FOLHA entram, e as duas foram pegas pelo portão, não
  // pelo meu olho: 1 tronco dá 4 tábuas E 1 tronco dá 4 folhas. Com saída e
  // entrada a 1 Dimas, cada uma dessas receitas multiplica dinheiro por 4.
  [BlockId.Log, 1],
  [BlockId.LogIpe, 1],
  [BlockId.LogAraucaria, 1],
  [BlockId.LogPauBrasil, 1],
  [ITEM_GRAVETO, 1],
  // ── 2 Dimas: o que sai da terra plantada ───────────────────────────────
  // As 8 colheitas (trigo, algodão e as 6 culturas do §🍖 F10h) vêm da tabela
  // `PLANTAS`, não escritas à mão: planta nova já nasce vendível, e não há
  // segunda lista pra esquecer de atualizar.
  ...PLANTAS.map((p) => [p.colheita, 2] as const),
  [ITEM_FRUTA, 2],
  // ── 3 Dimas: o que precisou de fogo ou de bancada pra existir ──────────
  // O PÃO custa 3 trigo (6 Dimas) e vale 3: cozinhar é pra comer, não pra
  // enriquecer. A batata ASSADA vale o mesmo que a crua pelo mesmo motivo —
  // valer mais que a crua faria a fornalha imprimir Dimas (o portão pega).
  [ITEM_PAO, 3],
  [ITEM_CARVAO, 3],
  [ITEM_BATATA_COZIDA, 2],
  // O CARVÃO VEGETAL não tem preço, e não é esquecimento: ele sai de 1 tronco
  // (1 Dimas) na fornalha, então qualquer preço acima de 1 imprime Dimas. Ele é
  // COMBUSTÍVEL — serve pra queimar, não pra vender.
  // ── o fundo da mina ────────────────────────────────────────────────────
  // O minério em BLOCO não tem preço: o aluno nunca o segura (ferro e ouro
  // caem como bloco mas vão pra fornalha; carvão e diamante caem como item).
  [ITEM_LINGOTE_FERRO, 6],
  [ITEM_LINGOTE_OURO, 10],
  [ITEM_DIAMANTE, 20],
  // Obsidiana: não tem receita nenhuma, só nasce de lava encontrando água — é
  // trabalho de achar, não de fabricar, e por isso pode ter preço.
  [BlockId.Obsidian, 5],
]);

/**
 * Quanto o sistema paga por 1 unidade deste id, ou `null` se ele **não se
 * vende**. É a pergunta ÚNICA — o balcão, o total e o portão consultam esta
 * função, nunca a tabela direto.
 *
 * `null` (e não 0) porque "não tem preço" e "vale zero" são coisas diferentes
 * na tela: o balcão devolve o que não tem preço e diz por quê, em vez de
 * aceitar e pagar nada.
 */
export function precoDeVenda(id: number): number | null {
  const p = PRECOS.get(id);
  if (p === undefined) return null;
  // Cinto e suspensório: um id que deixasse de poder estar numa mochila (ou um
  // preço zerado por engano) não se vende, mesmo estando na tabela.
  if (p <= 0 || !podeEstarNaMochila(id)) return null;
  return p;
}

/** Este id pode entrar no balcão? Mesma pergunta, dita do jeito que o gate lê. */
export function podeSerVendido(id: number): boolean {
  return precoDeVenda(id) !== null;
}

/** Todos os ids com preço — pro portão varrer e pra teste de cobertura. */
export function idsVendiveis(): readonly number[] {
  return [...PRECOS.keys()].filter(podeSerVendido);
}

/**
 * O total, em Dimas, do que está no balcão. Slot sem preço conta ZERO em vez de
 * derrubar a soma: o gate do `mover` é que impede ele de entrar, e um total que
 * lança exceção deixaria o painel sem número pra mostrar se um dia escapasse.
 */
export function totalDoBalcao(slots: readonly Slot[]): number {
  let total = 0;
  for (const s of slots) {
    if (!s) continue;
    total += (precoDeVenda(s.id) ?? 0) * s.qtd;
  }
  return total;
}
