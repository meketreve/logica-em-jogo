import {
  BlockId,
  ITEM_CARVAO,
  ITEM_CARVAO_VEGETAL,
  ITEM_LINGOTE_FERRO,
  ITEM_LINGOTE_OURO,
} from "./blocks";
import {
  FORNALHA_COMBUSTIVEL,
  FORNALHA_ENTRADA,
  FORNALHA_SAIDA,
  type Container,
} from "./containers";
import { type Slot, type Stack, tamanhoStack } from "./inventario";

/**
 * §🍖 F10b (2026-08-05) — A FORNALHA.
 *
 * Módulo PURO: entra o estado do container, sai o estado do próximo tick. Sem
 * I/O, sem rede e — a disciplina do §🍖 inteiro desde o F2 — **sem relógio de
 * parede**: o tempo entra como CONTAGEM DE TICKS, igual ao ciclo dia/noite, ao
 * vento, ao fôlego e ao crescimento da horta. Dois hospedeiros diferentes
 * cozinham no mesmo ritmo, e o teste fixa o tempo sem esperar.
 *
 * **Por que a fornalha destrava o jogo.** Até aqui o minério de ferro era um
 * cubo bonito que virava balde por decreto, e metade das cadeias do Minecraft
 * (vidro, lingote) tinha de ser inventada na sessão 45 porque não havia forno.
 * Com ela, a cadeia fica honesta ponta a ponta: **derrubar árvore → picareta →
 * pedra → fornalha → minério → lingote**, e cada elo é uma pergunta que o aluno
 * responde sozinho.
 */

/** Ticks de um cozimento (10 Hz → 100 ticks = 10 s por peça). O número é o do
 *  Minecraft, que é a convenção que a turma já traz de casa. */
export const TICKS_POR_COZIMENTO = 100;

/**
 * O que a fornalha transforma no quê. Tabela curta e explícita — nada de faixa
 * de id: "todo minério funde" seria verdade hoje e mentira no dia em que
 * alguém acrescentar um minério que não funde.
 *
 * As quatro da v1:
 * - **minério de ferro → lingote de ferro** e **minério de ouro → lingote de
 *   ouro**: são os dois minérios que caem como BLOCO (`drops.ts`), e é aqui que
 *   fica claro por que eles caem assim.
 * - **tronco (as 4 espécies) → carvão vegetal**: a saída de quem não achou
 *   caverna. Sem ela a fornalha só serviria pra quem já tem carvão, o que é o
 *   contrário do que ela deveria ensinar.
 * - **areia → vidro**: a receita de verdade. A ponte "vidro ← areia" da sessão
 *   45 foi inventada porque não havia forno; agora há, e ela foi APOSENTADA
 *   (`receitas.ts`) a pedido do usuário — vidro se faz com fogo.
 */
export const COZIMENTO: ReadonlyMap<number, Stack> = new Map<number, Stack>([
  [BlockId.MinerioFerro, { id: ITEM_LINGOTE_FERRO, qtd: 1 }],
  [BlockId.MinerioOuro, { id: ITEM_LINGOTE_OURO, qtd: 1 }],
  [BlockId.Log, { id: ITEM_CARVAO_VEGETAL, qtd: 1 }],
  [BlockId.LogIpe, { id: ITEM_CARVAO_VEGETAL, qtd: 1 }],
  [BlockId.LogAraucaria, { id: ITEM_CARVAO_VEGETAL, qtd: 1 }],
  [BlockId.LogPauBrasil, { id: ITEM_CARVAO_VEGETAL, qtd: 1 }],
  [BlockId.Sand, { id: BlockId.Glass, qtd: 1 }],
]);

/**
 * O que queima, e por quantos TICKS. Os números são os do Minecraft convertidos
 * em cozimentos: madeira dá 1 peça, carvão dá 8 — e é essa diferença de 8× que
 * transforma "achei carvão" numa descoberta em vez de um detalhe.
 *
 * A madeira em várias formas de propósito: quem está começando queima a tábua
 * que sobrou, não o tronco que ainda vai virar ferramenta.
 */
export const COMBUSTIVEIS: ReadonlyMap<number, number> = new Map<number, number>([
  [ITEM_CARVAO, TICKS_POR_COZIMENTO * 8],
  [ITEM_CARVAO_VEGETAL, TICKS_POR_COZIMENTO * 8],
  [BlockId.Planks, TICKS_POR_COZIMENTO],
  [BlockId.Log, TICKS_POR_COZIMENTO],
  [BlockId.LogIpe, TICKS_POR_COZIMENTO],
  [BlockId.LogAraucaria, TICKS_POR_COZIMENTO],
  [BlockId.LogPauBrasil, TICKS_POR_COZIMENTO],
  [BlockId.Cerca, TICKS_POR_COZIMENTO],
  [BlockId.LajeTabuaBaixo, TICKS_POR_COZIMENTO],
  [BlockId.EscadaTabuaXP, TICKS_POR_COZIMENTO],
]);

/** Este id serve de combustível? */
export function ehCombustivel(id: number): boolean {
  return COMBUSTIVEIS.has(id);
}

/** O fogo está aceso? (é ele que troca o byte do bloco pra `FornalhaAcesa`) */
export function fornalhaAcesa(c: Container): boolean {
  return c.queimando > 0;
}

/** A saída de cozinhar o slot de entrada, ou `null` se ele não cozinha. */
export function saidaDe(entrada: Slot): Stack | null {
  return entrada ? COZIMENTO.get(entrada.id) ?? null : null;
}

/**
 * Dá pra cozinhar AGORA? Precisa de item cozinhável na entrada **e de lugar pra
 * saída** — a checagem do lugar vem antes de o fogo acender, senão a fornalha
 * queimaria combustível a troco de nada com a saída cheia (e o aluno perderia
 * carvão sem entender por quê). É a mesma disciplina do `podeFabricar`.
 */
export function podeCozinhar(c: Container): boolean {
  const out = saidaDe(c.slots[FORNALHA_ENTRADA] ?? null);
  if (!out) return false;
  const saida = c.slots[FORNALHA_SAIDA] ?? null;
  if (saida === null) return true;
  if (saida.id !== out.id) return false;
  return saida.qtd + out.qtd <= tamanhoStack(out.id);
}

/**
 * UM tick da fornalha. Devolve o MESMO objeto quando nada mudou — é essa
 * identidade que deixa a session varrer o índice de fornalhas sem inundar a
 * rede: só quem mudou vira mensagem.
 *
 * A ordem importa, e é esta:
 * 1. **acender** — só se há o que cozinhar. Fornalha com carvão e nada dentro
 *    não gasta o carvão, que é o que qualquer criança espera.
 * 2. **queimar um tick** — o fogo anda mesmo que o item saia da entrada no
 *    meio; combustível gasto não volta.
 * 3. **cozinhar um tick** — só com fogo aceso E com o que cozinhar. Se o fogo
 *    apagou ou a entrada esvaziou, o progresso volta a ZERO: a peça esfria. É
 *    mais simples de explicar do que o esfriamento gradual do Minecraft, e mais
 *    fácil de ver na barra.
 */
export function tickFornalha(c: Container): Container {
  const cozinhavel = podeCozinhar(c);
  let queimando = c.queimando;
  let queimaTotal = c.queimaTotal;
  let progresso = c.progresso;
  let slots: Slot[] | null = null;
  /** Cópia dos slots só quando algum vai mudar (o resto do tick é aritmética). */
  const editar = (): Slot[] => (slots ??= c.slots.slice());

  // (1) acender
  if (queimando <= 0 && cozinhavel) {
    const fuel = c.slots[FORNALHA_COMBUSTIVEL] ?? null;
    const ticks = fuel ? COMBUSTIVEIS.get(fuel.id) : undefined;
    if (fuel && ticks) {
      editar()[FORNALHA_COMBUSTIVEL] =
        fuel.qtd > 1 ? { id: fuel.id, qtd: fuel.qtd - 1 } : null;
      queimando = ticks;
      queimaTotal = ticks;
    }
  }

  if (queimando > 0) {
    // (2) o fogo consome um tick
    queimando--;
    if (queimando === 0) queimaTotal = 0;
    // (3) e cozinha, se houver o que
    if (cozinhavel) {
      progresso++;
      if (progresso >= TICKS_POR_COZIMENTO) {
        progresso = 0;
        const entrada = c.slots[FORNALHA_ENTRADA]!;
        const out = COZIMENTO.get(entrada.id)!;
        const s = editar();
        s[FORNALHA_ENTRADA] =
          entrada.qtd > 1 ? { id: entrada.id, qtd: entrada.qtd - 1 } : null;
        const saida = s[FORNALHA_SAIDA] ?? null;
        s[FORNALHA_SAIDA] = saida
          ? { id: saida.id, qtd: saida.qtd + out.qtd }
          : { id: out.id, qtd: out.qtd };
      }
    } else {
      progresso = 0;
    }
  } else if (progresso !== 0) {
    progresso = 0; // fogo apagado: a peça no meio esfria
  }

  if (
    slots === null &&
    queimando === c.queimando &&
    queimaTotal === c.queimaTotal &&
    progresso === c.progresso
  ) {
    return c; // nada mudou: nem cópia, nem mensagem
  }
  return { ...c, slots: slots ?? c.slots, queimando, queimaTotal, progresso };
}
