import {
  BlockId,
  ITEM_CARVAO,
  ITEM_DIAMANTE,
  ITEM_FRUTA,
  escadaId,
  isAgua,
  isCadeira,
  isCama,
  isFolhas,
  isFornalha,
  isGramaAlta,
  isJanela,
  isMuda,
  isPlantacaoMadura,
  mudaDaFolhagem,
  plantaDe,
  plantaPorSelvagem,
  isPorta,
  isQuadro,
  isSlab,
  isSofa,
  isStairs,
  slabMaterial,
  stairsMaterial,
} from "./blocks";
import type { Stack } from "./inventario";

/**
 * §🍖 F4 — o que CAI ao quebrar um bloco. Tabela pura: entra o byte que estava
 * na célula, sai a lista de pilhas que vão pra mochila.
 *
 * Duas regras e uma tabela de exceções:
 *
 * 1. **Forma canônica.** Uma família de blocos tem vários bytes (porta aberta,
 *    cama virada pro sul, escada de cabeça pra baixo) mas UMA entrada na
 *    hotbar. Quebrar devolve sempre a entrada da hotbar, senão o aluno ganharia
 *    um item que não sabe recolocar — e a direção/metade sai do olhar dele no
 *    `place_block`, não do byte guardado.
 * 2. **Por padrão, o bloco cai ele mesmo** — é o que faz construir e desfazer
 *    ser reversível numa aula. Só o que está na tabela abaixo foge disso.
 *
 * ⚠️ **O drop é do `break_block` do JOGADOR, não das regras de vizinhança.**
 * Quebrar uma metade da porta faz o `doorRule` apagar a outra no tick seguinte;
 * essa segunda remoção NÃO passa por aqui, senão uma porta viraria duas.
 * Mesma coisa pra cama, tocha sem apoio, areia que cai e água que seca.
 */

/** Bytes cuja família tem várias direções/metades → a entrada da hotbar. */
export function formaCanonica(id: number): number {
  if (isPorta(id)) return BlockId.PortaXFechada;
  if (isJanela(id)) return BlockId.JanelaXFechada;
  if (isCama(id)) return BlockId.CamaXP;
  if (isCadeira(id)) return BlockId.CadeiraXP;
  if (isSofa(id)) return BlockId.SofaXP;
  if (isQuadro(id)) return BlockId.QuadroXP;
  if (isSlab(id)) return BlockId.LajePedraBaixo + slabMaterial(id) * 2;
  if (isStairs(id)) return escadaId(stairsMaterial(id), 0, false);
  // §🍖 F6: os estágios da plantação têm UMA entrada na mochila — a muda. É a
  // mesma razão da porta: o aluno guarda o que sabe replantar. §🍖 F10c: a
  // muda é a da PLANTA dele (trigo ou algodão), não a do trigo sempre.
  {
    const p = plantaDe(id);
    if (p) return p.base;
  }
  // §🪵: as mudas têm UMA entrada na mochila — a inicial. É a MESMA razão da
  // plantação (guarda-se o que sabe replantar); quebrar a muda crescida
  // devolve a muda-base da espécie.
  if (isMuda(id)) return BlockId.MudaComum0 + ((id - BlockId.MudaComum0) & ~3);
  // §🍖 F10b: fornalha acesa volta como fornalha — o fogo é estado, não item.
  if (isFornalha(id)) return BlockId.Fornalha;
  return id;
}

/**
 * Exceções à regra "cai ele mesmo". `null` = não cai nada.
 *
 * - **grama → terra** (as três variantes climáticas): o número do Minecraft, e
 *   o que impede o aluno de fabricar tapete de grama no meio da pedra.
 * - **pedra → pedregulho**: idem. É o par que dá sentido ao craft do F5.
 * - **água → nada**: só o balde recolhe fonte (a mecânica é do `case "balde"`).
 * - **rocha-matriz → nada**: `isBreakable` já barra o jogador; a tabela é o
 *   cinto além do suspensório, porque `/bloco` do professor remove.
 * - **§🍖 F10 — minério de carvão → ITEM carvão, minério de diamante → ITEM
 *   diamante**: os dois minérios que no Minecraft NÃO passam pelo forno. O
 *   minério é a rocha onde o material está preso; quebrá-la devolve o
 *   material, não a rocha. **Ferro e ouro ficam de fora de propósito** —
 *   continuam caindo como bloco de minério, porque é ele que a fornalha funde,
 *   e é essa diferença entre os quatro que ensina pra que serve fundir.
 */
const EXCECOES = new Map<number, number | null>([
  [BlockId.Grass, BlockId.Dirt],
  [BlockId.GramaSeca, BlockId.Dirt],
  [BlockId.GramaFria, BlockId.Dirt],
  [BlockId.Stone, BlockId.Cobblestone],
  [BlockId.Bedrock, null],
  [BlockId.MinerioCarvao, ITEM_CARVAO],
  [BlockId.MinerioDiamante, ITEM_DIAMANTE],
]);

/**
 * §🍖 F6 — as duas exceções SORTEADAS, e as únicas do jogo.
 *
 * A folha é a fonte PASSIVA de comida: quem só explora o mundo não passa fome,
 * e nenhuma aula trava porque a turma não entendeu a horta. A grama alta é a
 * porta de entrada da fonte ATIVA — sem semente não há plantação, e é caçando
 * capim que o aluno começa a cadeia.
 *
 * As chances são MUITO mais generosas que as do Minecraft (maçã de folha lá é
 * 1/200) porque aqui a unidade de tempo é a aula, não a temporada: 1 em 8 dá
 * fruta em meia dúzia de folhas, e 1 em 4 dá a primeira semente no primeiro
 * tufo de capim que o aluno derruba.
 */
export const CHANCE_FRUTA_DA_FOLHA = 1 / 8;
export const CHANCE_SEMENTE_DO_CAPIM = 1 / 4;
/**
 * §🪵 (2026-08-15): a MUDA de árvore que a folha às vezes larga. Mais rara que
 * a fruta (1/8) de propósito: é a descoberta MAIS valiosa da folha — é a ÚNICA
 * porta de entrada da cadeia das árvores (plantar → esperar → a muda vira a
 * árvore), e se fosse comum demais a árvore perdia o valor. 1 em 10 numa copa
 * inteira ainda rende a turma (uma árvore tem dezenas de folhas), mas o aluno
 * nota quando a muda cai.
 */
export const CHANCE_MUDA_DA_FOLHA = 1 / 10;
/**
 * §🍖 F10c: a semente do pé SELVAGEM. Nasceu com a régua do capim (1 em 4) e
 * SUBIU pra 2 em 3 em 2026-08-05, a pedido do usuário.
 *
 * A razão é que os dois não são igualmente comuns: o capim cobre campo inteiro
 * e o aluno derruba dez sem procurar, enquanto o pé selvagem (algodão e as
 * seis culturas do §🍖 F10h) é esparso no bioma — com a mesma chance, "achei
 * um pé" virava quase sempre "e não veio nada". A cadeia da comida não pode
 * depender de achar o SEGUNDO pé. A régua é UMA para todos os selvagens: o que
 * muda de cultura pra cultura é o QUANTO cada pé é raro no bioma (biomas.ts).
 */
export const CHANCE_SEMENTE_DO_ALGODAO = 2 / 3;

/**
 * Quantas sementes a colheita devolve (2026-08-05, pedido do usuário: *"drop de
 * sementes cultivadas deve ser de 1 a 3"*).
 *
 * O F6 devolvia exatamente 1: a horta se replantava, mas nunca CRESCIA — quem
 * quisesse a segunda fileira tinha de voltar a caçar capim. Com 1–3 a média é
 * 2, então cada colheita paga a próxima e sobra — e a turma passa a poder
 * plantar um canteiro de verdade sem que o professor distribua semente.
 * Continua sendo sorteio, então o aluno vê que às vezes a horta não cresce.
 */
export const SEMENTES_MIN = 1;
export const SEMENTES_MAX = 3;

/** 1–3 sementes, uniformes. Fica aqui (e não inline) porque as DUAS plantas
 *  colhem pela mesma régua, e planta nova entra sem escolher um número novo. */
function sementes(sorteio: () => number): number {
  const faixa = SEMENTES_MAX - SEMENTES_MIN + 1;
  return SEMENTES_MIN + Math.min(faixa - 1, Math.floor(sorteio() * faixa));
}

/**
 * O que o jogador ganha ao quebrar esta célula. Lista (e não pilha única)
 * porque a plantação madura devolve DUAS coisas (o trigo e a muda de replantar)
 * e o minério, um dia, vai querer "1 bruto + carvão".
 *
 * `sorteio` é injetável só por causa do teste: é a única parte não determinística
 * da tabela, e um drop aleatório que não dá pra fixar não se prova.
 */
export function dropsDe(
  blockId: number,
  sorteio: () => number = Math.random,
): readonly Stack[] {
  if (blockId === BlockId.Air) return [];
  if (isAgua(blockId)) return [];
  // folha → fruta ÀS VEZES, e muda da PRÓPRIA espécie ÀS VEZES (§🪵). A folha
  // em si continua não sendo material — e os DOIS sorteios são independentes
  // (uma folha pode dar só fruta, só muda, os dois, ou nada).
  if (isFolhas(blockId)) {
    const drops: Stack[] = [];
    if (sorteio() < CHANCE_FRUTA_DA_FOLHA) drops.push({ id: ITEM_FRUTA, qtd: 1 });
    if (sorteio() < CHANCE_MUDA_DA_FOLHA) drops.push({ id: mudaDaFolhagem(blockId), qtd: 1 });
    return drops;
  }
  // capim → semente às vezes (e nunca o próprio capim: é decoração do gen, e
  // devolvê-lo daria ao aluno um tapete de mato infinito)
  if (isGramaAlta(blockId)) {
    return sorteio() < CHANCE_SEMENTE_DO_CAPIM ? [{ id: BlockId.Plantacao0, qtd: 1 }] : [];
  }
  // §🍖 F10c: o pé SELVAGEM do gen larga SEMENTE por sorte, como o capim — e
  // nunca ele mesmo. É a porta de entrada da cadeia (achar → plantar), e
  // devolvê-lo daria ao aluno um pé infinito sem plantar nada. §🍖 F10h: o
  // mesmo vale pros pés das seis novas culturas — `plantaPorSelvagem` diz a
  // semente de quem.
  {
    const selvagem = plantaPorSelvagem(blockId);
    if (selvagem) {
      return sorteio() < CHANCE_SEMENTE_DO_ALGODAO
        ? [{ id: selvagem.base, qtd: 1 }]
        : [];
    }
  }
  if (isPlantacaoMadura(blockId)) {
    // §🍖 F10c: a colheita sai da TABELA (`Planta.colheita`), e o algodão foi
    // o primeiro drop com quantidade sorteada (1 ou 2). §🍖 F10h: as seis
    // novas culturas usam a MESMA régua — `colheitaMax` decide quem é fixo
    // (o trigo, 1) e quem sorteia (1 ou 2) — e cabe sem motor novo porque
    // `sorteio` já entra injetável, e o teste não vira sorteio: injeta ele.
    const p = plantaDe(blockId)!;
    return [
      {
        id: p.colheita,
        qtd: p.colheitaMax > 1 ? (sorteio() < 0.5 ? 1 : p.colheitaMax) : 1,
      },
      { id: p.base, qtd: sementes(sorteio) },
    ];
  }
  if (EXCECOES.has(blockId)) {
    const alvo = EXCECOES.get(blockId) ?? null;
    return alvo === null ? [] : [{ id: alvo, qtd: 1 }];
  }
  return [{ id: formaCanonica(blockId), qtd: 1 }];
}
