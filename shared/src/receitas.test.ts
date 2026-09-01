import { describe, expect, it } from "vitest";
import {
  BlockId,
  ITEM_BALDE_VAZIO,
  ITEM_CARVAO,
  ITEM_CARVAO_VEGETAL,
  ITEM_GRAVETO,
  ITEM_LINGOTE_FERRO,
  ITEM_TRIGO,
  MAX_BLOCK_ID,
  isItem,
  isPlaceable,
  isProfessorOnly,
} from "./blocks";
import { formaCanonica } from "./drops";
import {
  INV_SLOTS,
  type Inventario,
  STACK_MAX,
  contar,
  inventarioVazio,
} from "./inventario";
import {
  RECEITAS,
  type Receita,
  SEM_RECEITA,
  fabricar,
  idsDoIngrediente,
  ingredientesDe,
  podeFabricar,
  receitaAtiva,
  receitaValida,
  temIngredientes,
} from "./receitas";
import { COZIMENTO } from "./fornalha";

/** Inventário com pilhas em slots escolhidos (o resto vazio). */
function inv(...pares: [slot: number, id: number, qtd: number][]): Inventario {
  const s = inventarioVazio().slice();
  for (const [i, id, qtd] of pares) s[i] = { id, qtd };
  return s;
}

/** Acha a receita cuja saída é `id` (a primeira, no caso das 4 de tábuas). */
function receitaDe(saidaId: number): Receita {
  const r = RECEITAS.find((x) => x.saida.id === saidaId);
  if (!r) throw new Error(`sem receita pra ${saidaId}`);
  return r;
}

describe("receitas — tabela", () => {
  it("todo ingrediente e toda saída são pilhas válidas (id > 0, qtd ≥ 1)", () => {
    for (const r of RECEITAS) {
      expect(r.saida.qtd).toBeGreaterThanOrEqual(1);
      expect(r.saida.id).toBeGreaterThan(0);
      expect(r.custo.length).toBeGreaterThanOrEqual(1);
      for (const c of r.custo) {
        expect(c.qtd).toBeGreaterThanOrEqual(1);
        expect(c.id).toBeGreaterThan(0);
      }
      // ingredientes DISTINTOS entre si (contar assume um id por custo)
      const ids = r.custo.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("a saída nunca passa do teto da própria pilha (senão não caberia num slot)", () => {
    for (const r of RECEITAS) {
      const teto = r.saida.id === ITEM_BALDE_VAZIO ? 1 : STACK_MAX;
      expect(r.saida.qtd).toBeLessThanOrEqual(teto);
    }
  });

  it("toda receita produz a FORMA CANÔNICA (o que a mochila guarda)", () => {
    // porta, cama, escada e afins têm vários bytes e UMA entrada na mochila.
    // Uma receita que saísse na variante errada daria ao aluno um item que ele
    // não sabe recolocar — a mesma razão do `formaCanonica` no drop.
    for (const r of RECEITAS) {
      if (isItem(r.saida.id)) continue;
      expect(formaCanonica(r.saida.id)).toBe(r.saida.id);
    }
  });

  it("nenhum ingrediente é inalcançável (todo custo é bloco colocável ou item)", () => {
    for (const r of RECEITAS) {
      for (const c of r.custo) {
        expect(isPlaceable(c.id) || isItem(c.id)).toBe(true);
        // e nada que só o professor pode ter entra numa receita de aluno
        expect(isProfessorOnly(c.id)).toBe(false);
      }
    }
  });

  it("PORTÃO: todo bloco colocável é alcançável em sobrevivência (ou está na lista de exceções)", () => {
    // Este é o teste que o pedido do usuário criou: "faltam os crafts dos itens
    // já adicionados". Ele varre TODOS os ids e prova que nenhum bloco existe
    // sem caminho — quem inventar um bloco novo sem receita derruba a suíte e
    // decide na hora: cria a receita, ou escreve por que ele não tem uma.
    // §🍖 F10: a receita APOSENTADA não conta como caminho (ela ocupa o índice
    // e não fabrica nada), e a FORNALHA passou a ser um segundo caminho — o
    // vidro sai dela, não mais da mão.
    const fabricaveis = new Set(
      RECEITAS.filter(receitaAtiva).map((r) => r.saida.id),
    );
    for (const saida of COZIMENTO.values()) fabricaveis.add(saida.id);
    const orfaos: number[] = [];
    for (let id = 1; id <= MAX_BLOCK_ID; id++) {
      if (!isPlaceable(id)) continue; // porta aberta, água, estágio crescido…
      if (formaCanonica(id) !== id) continue; // variante: a canônica responde por ela
      if (isProfessorOnly(id)) continue;
      if (fabricaveis.has(id) || SEM_RECEITA.has(id)) continue;
      orfaos.push(id);
    }
    expect(orfaos).toEqual([]);
  });

  it("a lista de exceções não mente: nada nela tem receita, e toda razão está escrita", () => {
    const fabricaveis = new Set(
      RECEITAS.filter(receitaAtiva).map((r) => r.saida.id),
    );
    for (const [id, razao] of SEM_RECEITA) {
      expect(fabricaveis.has(id)).toBe(false);
      expect(razao.length).toBeGreaterThan(10);
    }
  });

  it("§🍖 F10b: a receita do vidro está APOSENTADA — o índice fica, o craft não", () => {
    // apagá-la deslocaria as 97 receitas seguintes, e o aluno com o painel
    // aberto clicaria numa receita e receberia outra.
    const i = RECEITAS.findIndex((r) => r.saida.id === BlockId.Glass && !receitaAtiva(r));
    expect(i).toBeGreaterThanOrEqual(0);
    expect(receitaValida(i)).toBe(false);
    expect(fabricar(inv([0, BlockId.Sand, 64]), RECEITAS[i]!)).toBeNull();
    // e o vidro continua alcançável — pela fornalha
    expect(COZIMENTO.get(BlockId.Sand)?.id).toBe(BlockId.Glass);
  });

  it("as 12 receitas antigas continuam nos MESMOS índices (o protocolo manda o índice)", () => {
    // `fabricar {receita}` viaja como índice, e o `_smoke-craft.mjs` fixa os
    // dele em constantes: inserir no meio trocaria a receita debaixo do dedo do
    // aluno que já está com o painel aberto.
    expect(RECEITAS[0]?.saida.id).toBe(BlockId.Planks);
    expect(RECEITAS[10]?.saida.id).toBe(ITEM_BALDE_VAZIO);
    expect(RECEITAS[11]?.custo[0]?.id).toBe(ITEM_TRIGO); // o pão do F6
    expect(RECEITAS.length).toBeGreaterThan(12);
  });

  it("as cores: 12 blocos de algodão, 12 vidros e 12 tapetes, e cada cor sai de UMA receita só", () => {
    const saidas = RECEITAS.map((r) => r.saida.id);
    const umaSo = (id: number) => saidas.filter((s) => s === id).length === 1;
    for (const id of [BlockId.BlocoAlgodaoBranco, BlockId.BlocoAlgodaoMarrom, BlockId.VidroCiano, BlockId.TapeteRosa]) {
      expect(umaSo(id)).toBe(true);
    }
    // as 12 de cada família estão todas lá
    for (let i = 0; i < 8; i++) expect(saidas).toContain(BlockId.BlocoAlgodaoBranco + i);
    for (let i = 0; i < 4; i++) expect(saidas).toContain(BlockId.BlocoAlgodaoRosa + i);
    for (let i = 0; i < 12; i++) expect(saidas).toContain(BlockId.VidroBranco + i);
    for (let i = 0; i < 12; i++) expect(saidas).toContain(BlockId.TapeteBranco + i);
  });

  it("os 36 blocos-glifo (A–Z, 0–9) têm receita", () => {
    const saidas = new Set(RECEITAS.map((r) => r.saida.id));
    for (let i = 0; i < 26; i++) expect(saidas.has(BlockId.LetterA + i)).toBe(true);
    for (let i = 0; i < 10; i++) expect(saidas.has(BlockId.Digit0 + i)).toBe(true);
  });

  it("baú-loja (2026-09-01): craft a partir de um baú + 2 minério de ouro", () => {
    const r = RECEITAS.find((r) => r.saida.id === BlockId.BauLoja);
    expect(r).toBeDefined();
    expect(r?.saida.qtd).toBe(1);
    expect(r?.custo).toEqual([
      { id: BlockId.Bau, qtd: 1 },
      { id: BlockId.MinerioOuro, qtd: 2 },
    ]);
  });

  it("§🍖 F10: nenhuma receita cobra CUBO de minério de carvão — quem paga é o item", () => {
    // o minério de carvão deixou de cair como bloco (drops.ts), então uma
    // receita que ainda o pedisse ficaria inalcançável em silêncio.
    for (const r of RECEITAS) {
      for (const c of r.custo) expect(c.id).not.toBe(BlockId.MinerioCarvao);
    }
  });

  it("§🍖 F10: a tocha é graveto + carvão, e o graveto sai de 2 tábuas", () => {
    const tocha = receitaDe(BlockId.Tocha);
    expect(tocha.custo.map((c) => c.id).sort()).toEqual([ITEM_CARVAO, ITEM_GRAVETO].sort());
    const graveto = receitaDe(ITEM_GRAVETO);
    expect(graveto.custo).toEqual([{ id: BlockId.Planks, qtd: 2 }]);
    expect(graveto.saida.qtd).toBe(4);
  });

  it("receitaValida barra o índice que veio pelo fio", () => {
    expect(receitaValida(0)).toBe(true);
    expect(receitaValida(RECEITAS.length - 1)).toBe(true);
    expect(receitaValida(RECEITAS.length)).toBe(false);
    expect(receitaValida(-1)).toBe(false);
    expect(receitaValida(1.5)).toBe(false);
    expect(receitaValida(Number.NaN)).toBe(false);
  });
});

describe("receitas — podeFabricar / temIngredientes", () => {
  const tabuas = receitaDe(BlockId.Planks); // 1 tronco → 4 tábuas
  const troncoId = tabuas.custo[0]!.id;

  it("com o ingrediente exato, dá pra fabricar", () => {
    const i = inv([0, troncoId, 1]);
    expect(temIngredientes(i, tabuas)).toBe(true);
    expect(podeFabricar(i, tabuas)).toBe(true);
  });

  it("sem o ingrediente, não dá", () => {
    const i = inv([0, BlockId.Sand, 10]);
    expect(temIngredientes(i, tabuas)).toBe(false);
    expect(podeFabricar(i, tabuas)).toBe(false);
  });

  it("ingrediente espalhado em várias pilhas SOMA (6 tábuas em 4+2 → escada)", () => {
    const escada = receitaDe(BlockId.EscadaTabuaXP); // 6 tábuas → 4 escadas
    const i = inv([0, BlockId.Planks, 4], [5, BlockId.Planks, 2]);
    expect(contar(i, BlockId.Planks)).toBe(6);
    expect(podeFabricar(i, escada)).toBe(true);
  });

  it("mochila cheia de OUTRO id sem parcial da saída: tem ingrediente mas não cabe", () => {
    // todos os 27 slots cheios de areia, e UM tronco não cabe em lugar nenhum…
    // então nem dá pra ter o tronco. Monta o caso real: 26 slots de areia +
    // 1 slot com o tronco. Fabricar tábuas libera o slot do tronco → cabe.
    const s = inventarioVazio().slice();
    for (let k = 0; k < INV_SLOTS - 1; k++) s[k] = { id: BlockId.Sand, qtd: STACK_MAX };
    s[INV_SLOTS - 1] = { id: troncoId, qtd: 1 };
    expect(temIngredientes(s, tabuas)).toBe(true);
    // o tronco vira ar e as tábuas ocupam o mesmo slot liberado
    expect(podeFabricar(s, tabuas)).toBe(true);
  });

  it("saída de TIPO NOVO não cabe numa mochila que o consumo não libera", () => {
    // 3 lingotes de ferro num slot, os outros 26 cheios de areia. Fabricar
    // balde consome os 3 lingotes (libera o slot) e o balde ocupa ele → cabe.
    // Mas se o ferro estivesse dividido em slots que NÃO esvaziam de vez, o
    // balde (id novo, pilha 1) não teria onde entrar. Testa o caso que cabe:
    const balde = receitaDe(ITEM_BALDE_VAZIO);
    const s = inventarioVazio().slice();
    for (let k = 0; k < INV_SLOTS - 1; k++) s[k] = { id: BlockId.Sand, qtd: STACK_MAX };
    s[INV_SLOTS - 1] = { id: ITEM_LINGOTE_FERRO, qtd: 3 };
    expect(podeFabricar(s, balde)).toBe(true);
  });

  it("saída não cabe (todos cheios, ingrediente parcial que não some) → recusa", () => {
    // 26 slots de areia CHEIOS + 1 slot com 2 ferros (a receita quer 3): sem
    // ingrediente suficiente. Já cobre a recusa por falta; agora o caso de
    // caber-não: ferro basta mas some só PARTE de um slot.
    const balde = receitaDe(ITEM_BALDE_VAZIO); // 3 lingotes → 1 balde
    const s = inventarioVazio().slice();
    for (let k = 0; k < INV_SLOTS; k++) s[k] = { id: BlockId.Sand, qtd: STACK_MAX };
    // troca 1 slot por 4 lingotes: consumir 3 deixa 1 no slot (não esvazia)
    s[0] = { id: ITEM_LINGOTE_FERRO, qtd: 4 };
    expect(temIngredientes(s, balde)).toBe(true);
    // o balde (id novo) não tem slot livre → recusa
    expect(podeFabricar(s, balde)).toBe(false);
  });
});

describe("receitas — fabricar (tudo ou nada)", () => {
  const tabuas = receitaDe(BlockId.Planks);
  const troncoId = tabuas.custo[0]!.id;

  it("consome o custo e credita a saída", () => {
    const antes = inv([0, troncoId, 3]);
    const depois = fabricar(antes, tabuas);
    expect(depois).not.toBeNull();
    expect(contar(depois!, troncoId)).toBe(2); // gastou 1 tronco
    expect(contar(depois!, BlockId.Planks)).toBe(4); // ganhou 4 tábuas
  });

  it("não muta o inventário de entrada (função pura)", () => {
    const antes = inv([0, troncoId, 3]);
    fabricar(antes, tabuas);
    expect(contar(antes, troncoId)).toBe(3);
    expect(contar(antes, BlockId.Planks)).toBe(0);
  });

  it("sem ingrediente devolve null e não gasta nada", () => {
    const antes = inv([0, BlockId.Sand, 1]);
    expect(fabricar(antes, tabuas)).toBeNull();
  });

  it("empilha a saída numa pilha parcial já existente", () => {
    // 1 tronco + 62 tábuas: fabricar dá 4 tábuas → 66, que passa de um slot,
    // mas adicionar completa o parcial (64) e abre outro slot com 2.
    const antes = inv([0, troncoId, 1], [1, BlockId.Planks, 62]);
    const depois = fabricar(antes, tabuas);
    expect(depois).not.toBeNull();
    expect(contar(depois!, BlockId.Planks)).toBe(66);
  });
});

describe("receitas — ingredientesDe (o 'falta 3 tábua' do painel)", () => {
  it("reporta have/need/falta por ingrediente", () => {
    const escada = receitaDe(BlockId.EscadaTabuaXP); // 6 tábuas
    const i = inv([0, BlockId.Planks, 3]);
    const [ing] = ingredientesDe(i, escada);
    expect(ing).toEqual({
      id: BlockId.Planks,
      ids: [BlockId.Planks], // sem alternativas: a lista é só o próprio id
      need: 6,
      have: 3,
      falta: 3,
    });
  });

  it("falta 0 quando há de sobra", () => {
    const tabuas = receitaDe(BlockId.Planks);
    const troncoId = tabuas.custo[0]!.id;
    const [ing] = ingredientesDe(inv([0, troncoId, 9]), tabuas);
    expect(ing!.falta).toBe(0);
    expect(ing!.have).toBe(9);
  });
});

/**
 * §🔥 A TOCHA VIROU UMA RECEITA SÓ (2026-08-05, pedido do usuário: *"craft de
 * tocha deve aceitar qualquer tipo de carvão em apenas uma receita"*).
 *
 * O que estes testes protegem não é a tocha: é o `Ingrediente.ou`, que é motor
 * novo no meio do caminho tudo-ou-nada do `fabricar`. Gastar da alternativa
 * quando a principal acaba no MEIO da conta é onde um "ou" mal feito perde
 * ingrediente sem entregar nada.
 */
describe("receitas — ingrediente com alternativa (`ou`)", () => {
  const tochas = (): Receita[] => RECEITAS.filter((r) => r.saida.id === BlockId.Tocha);
  const tocha = (): Receita => {
    const r = tochas().find(receitaAtiva);
    if (!r) throw new Error("nenhuma receita de tocha ativa");
    return r;
  };

  it("existe UMA receita de tocha ativa — a gêmea continua no índice, aposentada", () => {
    expect(tochas().length).toBeGreaterThanOrEqual(2); // o índice não se apaga
    expect(tochas().filter(receitaAtiva)).toHaveLength(1);
    // e a aposentada é justamente a do carvão vegetal sozinho
    const velha = tochas().find((r) => !receitaAtiva(r))!;
    expect(velha.custo.some((c) => c.id === ITEM_CARVAO_VEGETAL)).toBe(true);
    expect(velha.aposentada).toMatch(/carvão vegetal/);
  });

  it("a receita ativa aceita os DOIS carvões, e o painel consegue nomear os dois", () => {
    const brasa = tocha().custo.find((c) => c.id === ITEM_CARVAO)!;
    expect(idsDoIngrediente(brasa)).toEqual([ITEM_CARVAO, ITEM_CARVAO_VEGETAL]);
  });

  it("fabrica só com MINERAL, só com VEGETAL, e gasta o certo em cada caso", () => {
    const r = tocha();
    const soMineral = inv([0, ITEM_GRAVETO, 1], [1, ITEM_CARVAO, 1]);
    const soVegetal = inv([0, ITEM_GRAVETO, 1], [1, ITEM_CARVAO_VEGETAL, 1]);
    for (const i of [soMineral, soVegetal]) {
      expect(temIngredientes(i, r)).toBe(true);
      expect(podeFabricar(i, r)).toBe(true);
    }
    const d1 = fabricar(soMineral, r)!;
    expect(contar(d1, ITEM_CARVAO)).toBe(0);
    expect(contar(d1, BlockId.Tocha)).toBe(4);
    const d2 = fabricar(soVegetal, r)!;
    expect(contar(d2, ITEM_CARVAO_VEGETAL)).toBe(0);
    expect(contar(d2, BlockId.Tocha)).toBe(4);
  });

  it("com os dois na mochila, gasta o PRINCIPAL primeiro (o vegetal é a reserva)", () => {
    const i = inv([0, ITEM_GRAVETO, 1], [1, ITEM_CARVAO, 1], [2, ITEM_CARVAO_VEGETAL, 1]);
    const d = fabricar(i, tocha())!;
    expect(contar(d, ITEM_CARVAO)).toBe(0);
    expect(contar(d, ITEM_CARVAO_VEGETAL)).toBe(1);
  });

  it("sem NENHUM dos dois não fabrica, e o inventário não é tocado", () => {
    const i = inv([0, ITEM_GRAVETO, 1]);
    expect(temIngredientes(i, tocha())).toBe(false);
    expect(fabricar(i, tocha())).toBeNull();
    expect(contar(i, ITEM_GRAVETO)).toBe(1); // o graveto NÃO sumiu no caminho
  });

  it("a soma das duas conta como uma só, e a falta some quando elas se somam", () => {
    // uma receita de laboratório: 2 brasas, e o jogador tem 1 de cada
    const duasBrasas: Receita = {
      saida: { id: BlockId.Tocha, qtd: 1 },
      custo: [{ id: ITEM_CARVAO, qtd: 2, ou: [ITEM_CARVAO_VEGETAL] }],
    };
    const i = inv([0, ITEM_CARVAO, 1], [1, ITEM_CARVAO_VEGETAL, 1]);
    const [ing] = ingredientesDe(i, duasBrasas);
    expect(ing!.have).toBe(2); // 1 + 1 — a UI mostra "2/2", não "1/2"
    expect(ing!.falta).toBe(0);
    const d = fabricar(i, duasBrasas)!;
    // gastou 1 de cada: a principal acabou no MEIO e a alternativa completou
    expect(contar(d, ITEM_CARVAO)).toBe(0);
    expect(contar(d, ITEM_CARVAO_VEGETAL)).toBe(0);
  });
});
