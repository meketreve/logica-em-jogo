import { BlockId, GLYPH, ITEM_BALDE_AGUA, isProfessorOnly } from "@logica/shared";

/**
 * Blocos colocáveis com nome em português — fonte única pra hotbar (main.ts)
 * e pros selects do painel de autoria (/regiao encher). A ORDEM segue os ids:
 * o texto de uso do /bloco aponta pra hotbar.
 *
 * `cat` (2026-07-20): categoria da ABA do inventário — com 100+ blocos a
 * grade única ficou longa (pedido do playtest). Só afeta a exibição do
 * painel; a ordem/scroll da hotbar não muda.
 */

export type Categoria =
  | "blocos"
  | "vegetacao"
  | "mobilia"
  | "minerios"
  | "ferramentas"
  | "glifos";

/** Categorias CURADAS, na ordem de exibição. */
export const CATEGORIAS: readonly { id: Categoria; label: string }[] = [
  { id: "blocos", label: "blocos" },
  { id: "vegetacao", label: "vegetação" },
  { id: "mobilia", label: "mobília" },
  { id: "minerios", label: "minérios" },
  { id: "ferramentas", label: "ferramentas" },
  { id: "glifos", label: "letras e números" },
];

/**
 * Aba do inventário: uma categoria curada, ou **"todos"** — a lista COMPLETA.
 *
 * "todos" NÃO é uma `Categoria`, de propósito: se fosse, cada entrada de
 * `PLACEABLE` precisaria declarar DOIS `cat`. É um MODO de exibição, e a grade
 * resolve com `aba === "todos" || b.cat === aba`.
 */
export type AbaInventario = Categoria | "todos";

/**
 * Abas do inventário na ordem de exibição: as categorias curadas e, por último,
 * **"todos"**.
 *
 * A categoria ajuda a navegar mas ESCONDE — foi exatamente assim que a cerca
 * "sumiu" (bug-625: estava em mobília, e quem procurava material de construção
 * ia em blocos). Com a lista inteira ordenada por id, nenhum colocável fica
 * inalcançável. Fica por ÚLTIMO porque é a rede de segurança, não o caminho
 * normal: a curadoria continua sendo a primeira coisa que o aluno vê.
 */
export const ABAS: readonly { id: AbaInventario; label: string }[] = [
  ...CATEGORIAS,
  { id: "todos", label: "todos" },
];

export interface PlaceableEntry {
  readonly id: number;
  readonly name: string;
  readonly cat: Categoria;
}

// cp20: blocos-glifo derivam de GLYPH (mesmo layout do atlas/mesher).
const GLYPH_BLOCKS: PlaceableEntry[] = [
  ...Array.from(GLYPH.letters, (ch, i) => ({
    id: BlockId.LetterA + i,
    name: `letra ${ch}`,
    cat: "glifos" as const,
  })),
  ...Array.from(GLYPH.digits, (ch, i) => ({
    id: BlockId.Digit0 + i,
    name: `número ${ch}`,
    cat: "glifos" as const,
  })),
];

export const PLACEABLE: readonly PlaceableEntry[] = [
  { id: BlockId.Grass, name: "grama", cat: "blocos" },
  { id: BlockId.Stone, name: "pedra", cat: "blocos" },
  { id: BlockId.Cobblestone, name: "pedregulho", cat: "blocos" },
  { id: BlockId.Sand, name: "areia", cat: "blocos" },
  { id: BlockId.Dirt, name: "terra", cat: "blocos" },
  { id: BlockId.Log, name: "tronco", cat: "vegetacao" },
  { id: BlockId.Planks, name: "tábuas", cat: "blocos" },
  { id: BlockId.Brick, name: "tijolo", cat: "blocos" },
  { id: BlockId.Gravel, name: "cascalho", cat: "blocos" },
  { id: BlockId.Bedrock, name: "rocha-matriz", cat: "blocos" },
  { id: BlockId.BlocoAlgodaoBranco, name: "bloco de algodão branco", cat: "blocos" },
  { id: BlockId.BlocoAlgodaoPreto, name: "bloco de algodão preto", cat: "blocos" },
  { id: BlockId.BlocoAlgodaoVermelho, name: "bloco de algodão vermelho", cat: "blocos" },
  { id: BlockId.BlocoAlgodaoLaranja, name: "bloco de algodão laranja", cat: "blocos" },
  { id: BlockId.BlocoAlgodaoAmarelo, name: "bloco de algodão amarelo", cat: "blocos" },
  { id: BlockId.BlocoAlgodaoVerde, name: "bloco de algodão verde", cat: "blocos" },
  { id: BlockId.BlocoAlgodaoAzul, name: "bloco de algodão azul", cat: "blocos" },
  { id: BlockId.BlocoAlgodaoRoxo, name: "bloco de algodão roxo", cat: "blocos" },
  { id: BlockId.Sandstone, name: "arenito", cat: "blocos" },
  { id: BlockId.StoneBricks, name: "pedra-lavrada", cat: "blocos" },
  { id: BlockId.Snow, name: "neve", cat: "blocos" },
  { id: BlockId.Obsidian, name: "obsidiana", cat: "blocos" },
  { id: BlockId.BlocoAlgodaoRosa, name: "bloco de algodão rosa", cat: "blocos" },
  { id: BlockId.BlocoAlgodaoCiano, name: "bloco de algodão ciano", cat: "blocos" },
  { id: BlockId.BlocoAlgodaoCinza, name: "bloco de algodão cinza", cat: "blocos" },
  { id: BlockId.BlocoAlgodaoMarrom, name: "bloco de algodão marrom", cat: "blocos" },
  { id: BlockId.Glass, name: "vidro", cat: "blocos" },
  { id: BlockId.Leaves, name: "folhas", cat: "vegetacao" },
  ...GLYPH_BLOCKS,
  // cp23 — não-cubos. A porta tem UMA entrada: na hora de colocar, o cliente
  // escolhe o eixo (X ou Z) pela direção do olhar; aberta só existe no mundo.
  // cerca fica em "blocos" (2026-08-17, pedido do usuário): ela é material de
  // construção — cercar terreno, fazer parapeito — e quem procura por ela vai
  // na aba de blocos, não na de mobília, mesmo ela sendo não-cubo como a porta.
  { id: BlockId.Cerca, name: "cerca", cat: "blocos" },
  { id: BlockId.PortaXFechada, name: "porta", cat: "mobilia" },
  { id: BlockId.Tocha, name: "tocha", cat: "mobilia" },
  // janela: entrada única, eixo escolhido pelo olhar (igual porta)
  { id: BlockId.JanelaXFechada, name: "janela", cat: "mobilia" },
  // móveis (2026-07-19): entrada única; direção escolhida pelo olhar no place
  { id: BlockId.Mesa, name: "mesa", cat: "mobilia" },
  { id: BlockId.CadeiraXP, name: "cadeira", cat: "mobilia" },
  { id: BlockId.SofaXP, name: "sofá", cat: "mobilia" },
  { id: BlockId.CamaXP, name: "cama", cat: "mobilia" },
  { id: BlockId.QuadroXP, name: "quadro", cat: "mobilia" },
  // Fornalha (§🍖 F10b 2026-08-05): UMA entrada — a acesa não se coloca (o fogo
  // é que troca o byte). Na "mobília" porque é ali que o aluno procura o que se
  // usa com o clique direito, junto de porta, janela e quadro.
  { id: BlockId.Fornalha, name: "fornalha", cat: "mobilia" },
  // Baú (§🍖 F10e 2026-08-05): ao lado da fornalha, porque é o mesmo gesto —
  // clique direito abre um painel de conteúdo.
  { id: BlockId.Bau, name: "baú", cat: "mobilia" },
  // Baú-Loja (2026-09-01): ao lado do baú comum — mesmo gesto (clique
  // direito abre um painel), a diferença é o que o painel mostra.
  { id: BlockId.BauLoja, name: "baú-loja", cat: "mobilia" },
  // Tapetes (2026-07-19): ordem = TapeteBranco..TapeteMarrom (âncora + offset)
  ...["branco", "preto", "vermelho", "laranja", "amarelo", "verde", "azul", "roxo",
      "rosa", "ciano", "cinza", "marrom"].map((cor, i) => ({
    id: BlockId.TapeteBranco + i,
    name: `tapete ${cor}`,
    cat: "mobilia" as const,
  })),
  // Flores (2026-07-20): plantinhas decorativas, atravessáveis, precisam de apoio
  ...["vermelha", "amarela", "azul", "branca"].map((cor, i) => ({
    id: BlockId.FlorVermelha + i,
    name: `flor ${cor}`,
    cat: "vegetacao" as const,
  })),
  // Grama alta (§🌬️ 2026-07-27): tufo em cruz, 3 climas. Ordem = âncora
  // GramaAlta + offset, igual às gramas do chão.
  ...["", " seca", " fria"].map((clima, i) => ({
    id: BlockId.GramaAlta + i,
    name: `grama alta${clima}`,
    cat: "vegetacao" as const,
  })),
  // Semente (§🍖 F6 2026-08-04): UMA entrada — os outros 3 estágios não se
  // colocam (crescem sozinhos). Em sobrevivência ela vem do capim; em criativo
  // está na paleta porque o professor precisa desenhar uma horta pronta na aula.
  // O nome é "semente" e não "muda" porque é o que se CARREGA; o que aparece no
  // mundo ao plantar é um broto, e o ícone da bolsa mostra grãos (blockIcons).
  // 2026-08-05: virou "semente DE TRIGO" a pedido do usuário. Enquanto era a
  // única, "semente" bastava; com a de algodão ao lado na mesma aba, duas
  // bolsas quase iguais e um nome genérico faziam o aluno plantar a errada — e
  // só descobrir um minuto depois, quando o broto crescesse.
  { id: BlockId.Plantacao0, name: "semente de trigo", cat: "vegetacao" },
  // Algodão (§🍖 F10c 2026-08-05): a semente cultivável + o pé SELVAGEM que o
  // gen espalha pelo cerrado. O selvagem está na paleta pro professor poder
  // semear a descoberta num mundo de aula; em sobrevivência ele não se obtém
  // (quebrar dá semente, nunca o pé).
  { id: BlockId.Algodao0, name: "semente de algodão", cat: "vegetacao" },
  { id: BlockId.AlgodaoSelvagem, name: "algodão selvagem", cat: "vegetacao" },
  // §🍖 F10h (2026-08-06): as seis culturas — a semente + o pé SELVAGEM do gen,
  // no molde exato do algodão. Cada selvagem está na paleta pro professor poder
  // semear a descoberta num mundo de aula; em sobrevivência quebrar dá a
  // semente, nunca o pé.
  { id: BlockId.Cenoura0, name: "semente de cenoura", cat: "vegetacao" },
  { id: BlockId.CenouraSelvagem, name: "cenoura selvagem", cat: "vegetacao" },
  { id: BlockId.Batata0, name: "batata-semente", cat: "vegetacao" },
  { id: BlockId.BatataSelvagem, name: "batata selvagem", cat: "vegetacao" },
  { id: BlockId.Beterraba0, name: "semente de beterraba", cat: "vegetacao" },
  { id: BlockId.BeterrabaSelvagem, name: "beterraba selvagem", cat: "vegetacao" },
  { id: BlockId.Melancia0, name: "semente de melancia", cat: "vegetacao" },
  { id: BlockId.MelanciaSelvagem, name: "melancia selvagem", cat: "vegetacao" },
  { id: BlockId.Banana0, name: "muda de bananeira", cat: "vegetacao" },
  { id: BlockId.BananaSelvagem, name: "bananeira selvagem", cat: "vegetacao" },
  { id: BlockId.Aipim0, name: "rama de aipim", cat: "vegetacao" },
  { id: BlockId.AipimSelvagem, name: "aipim selvagem", cat: "vegetacao" },
  // §🪵 (2026-08-15): as MUDAS de árvore — UMA entrada por espécie (o estágio
  // 0, único que se coloca; os outros crescem sozinhos no tick). Na sobrevivên-
  // cia cada uma vem das FOLHAS da própria espécie (drops.ts); em criativo
  // estão na paleta pro professor poder plantar uma árvore na aula.
  { id: BlockId.MudaComum0, name: "muda de carvalho", cat: "vegetacao" },
  { id: BlockId.MudaIpe0, name: "muda de ipê", cat: "vegetacao" },
  { id: BlockId.MudaAraucaria0, name: "muda de araucária", cat: "vegetacao" },
  { id: BlockId.MudaPauBrasil0, name: "muda de pau-brasil", cat: "vegetacao" },
  // Minérios (2026-07-20): porta de entrada do survival — por ora só blocos
  { id: BlockId.MinerioCarvao, name: "minério de carvão", cat: "minerios" },
  { id: BlockId.MinerioFerro, name: "minério de ferro", cat: "minerios" },
  { id: BlockId.MinerioOuro, name: "minério de ouro", cat: "minerios" },
  { id: BlockId.MinerioDiamante, name: "minério de diamante", cat: "minerios" },
  // Gramas climáticas (2026-07-20): o gen escolhe pelo clima; colocáveis também
  { id: BlockId.GramaSeca, name: "grama seca", cat: "blocos" },
  { id: BlockId.GramaFria, name: "grama fria", cat: "blocos" },
  // Árvores brasileiras (2026-07-20): ipê/araucária/pau-brasil + mandacaru
  { id: BlockId.LogIpe, name: "tronco de ipê", cat: "vegetacao" },
  { id: BlockId.FolhasIpe, name: "folhas de ipê", cat: "vegetacao" },
  { id: BlockId.LogAraucaria, name: "tronco de araucária", cat: "vegetacao" },
  { id: BlockId.FolhasAraucaria, name: "folhas de araucária", cat: "vegetacao" },
  { id: BlockId.LogPauBrasil, name: "tronco de pau-brasil", cat: "vegetacao" },
  { id: BlockId.FolhasPauBrasil, name: "folhas de pau-brasil", cat: "vegetacao" },
  { id: BlockId.Mandacaru, name: "mandacaru", cat: "vegetacao" },
  // Vidro colorido (2026-07-25): 12 cores (mesma paleta dos blocos de algodão). Cubo cheio
  // transparente tingido. Ordem = VidroBranco + offset.
  ...["branco", "preto", "vermelho", "laranja", "amarelo", "verde", "azul", "roxo",
      "rosa", "ciano", "cinza", "marrom"].map((cor, i) => ({
    id: BlockId.VidroBranco + i,
    name: `vidro ${cor}`,
    cat: "blocos" as const,
  })),
  // Lajes / meio-blocos (2026-07-25): UMA entrada por material (a metade
  // baixo/cima é escolhida pela face clicada no place). O id na hotbar é a
  // âncora "baixo"; o cliente troca pra "cima" (âncora+1) ao mirar por baixo.
  { id: BlockId.LajePedraBaixo, name: "laje de pedra", cat: "blocos" },
  { id: BlockId.LajeTabuaBaixo, name: "laje de tábuas", cat: "blocos" },
  { id: BlockId.LajeTijoloBaixo, name: "laje de tijolo", cat: "blocos" },
  // Escadas (2026-07-25): UMA entrada por material; a direção sai do olhar e a
  // metade (base/cabeça-pra-baixo) da face clicada. Âncora = ...XP.
  { id: BlockId.EscadaPedraXP, name: "escada de pedra", cat: "blocos" },
  { id: BlockId.EscadaTabuaXP, name: "escada de tábuas", cat: "blocos" },
  { id: BlockId.EscadaTijoloXP, name: "escada de tijolo", cat: "blocos" },
  // Balde de água (2026-07-22): ITEM (não-bloco). Clique direito DESPEJA fonte;
  // esvazia na mão → clique direito numa fonte RECOLHE. A água só entra no
  // mundo por aqui (o id de bloco saiu da hotbar). Ver ITEM_BALDE_* em blocks.ts.
  { id: ITEM_BALDE_AGUA, name: "balde de água", cat: "ferramentas" },
];

/** Colocáveis visíveis PARA ESTE PAPEL: o aluno não vê rocha-matriz (autoria
 *  do professor). Usado pelo inventário e pela hotbar; o servidor recusa o
 *  place de qualquer jeito. */
export function placeableFor(papel: "professor" | "aluno"): readonly PlaceableEntry[] {
  if (papel === "professor") return PLACEABLE;
  return PLACEABLE.filter((b) => !isProfessorOnly(b.id));
}
