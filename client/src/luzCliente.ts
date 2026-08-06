import type { LuzWorld, World, WorldDims } from "@logica/shared";
import { acenderColuna, atualizarBloco, criarLuz, descartarColunaLuz } from "@logica/shared";

/**
 * §💡 A luz voxel do CLIENTE, e por que ela é um objeto.
 *
 * A grade de luz é paralela ao mundo, do MESMO tamanho, e 100% do cliente: é
 * função pura dos bytes, então o servidor não gasta banda nem tick pra mandar
 * o que os dois lados derivam igual.
 *
 * O que estava espalhado por seis pontos do `startGame` e agora mora aqui: a
 * grade, a FILA de colunas esperando luz, o orçamento de tempo por frame e a
 * contagem de custo que vai pro perfil. A regra que a fila existe pra manter é
 * de ordem, e é fácil de quebrar sem querer: **a coluna só vai pra fila de mesh
 * DEPOIS de acesa** — geometria montada sem luz nasce clara e escurece num
 * segundo remesh, piscando na cara da turma.
 *
 * `desligada` é o lado B do A/B (`?semluz`): o mesher volta a pintar tudo
 * aceso, que é como o jogo era antes do §💡. Sem um par medido na MESMA
 * máquina, "a luz custa X" é anedota. Com ela desligada este objeto continua
 * gerindo a fila (quem chama não muda de caminho) e só pula o acendimento.
 */
export class LuzCliente {
  /** A grade. `undefined` quando desligada — é o que o ChunkRenderer espera. */
  private grade: LuzWorld;
  /** Colunas esperando luz. Mesma disciplina da fila de mesh: o handler da rede
   *  só ENFILEIRA, o loop de render drena sob orçamento de tempo. */
  private readonly fila: { cx: number; cz: number }[] = [];
  private readonly naFila = new Set<number>();
  /** Custo acumulado, pro F3/perfil (main thread — é onde a luz roda). */
  private msTotal = 0;
  private colunas = 0;

  constructor(
    dims: WorldDims,
    /** `?semluz`: não acende nada, mas segue gerindo a fila. */
    readonly desligada: boolean,
  ) {
    this.grade = criarLuz(dims);
  }

  /** A grade pro ChunkRenderer — `undefined` com a luz desligada. */
  get paraMesher(): LuzWorld | undefined {
    return this.desligada ? undefined : this.grade;
  }

  /** O que o HUD do perfil mostra (§💡). */
  get medidas(): { colunas: number; totalMs: number; fila: number } {
    return { colunas: this.colunas, totalMs: this.msTotal, fila: this.fila.length };
  }

  /** A fila está vazia? O portão da tela de carga soma isto: coluna esperando
   *  luz ainda NÃO virou mesh, então "acabou" não pode ignorá-la. */
  get filaVazia(): boolean {
    return this.fila.length === 0;
  }

  enfileirar(cx: number, cz: number, dimsX: number): void {
    const key = cz * dimsX + cx;
    if (this.naFila.has(key)) return;
    this.naFila.add(key);
    this.fila.push({ cx, cz });
  }

  /** A coluna saiu do raio: a luz vai junto com os bytes. */
  descartar(cx: number, cz: number): void {
    descartarColunaLuz(this.grade, cx, cz);
  }

  /** Troca de aula (cp19): o mundo mudou debaixo dos closures. Coluna do mundo
   *  VELHO não se acende no novo, então a fila zera junto com a grade. */
  trocarMundo(dims: WorldDims): void {
    this.grade = criarLuz(dims);
    this.fila.length = 0;
    this.naFila.clear();
  }

  /** Acende TODAS as colunas — o mundo denso, que chegou inteiro no snapshot.
   *  Mundo lazy não passa por aqui: cada coluna acende quando chega. */
  acenderTudo(world: World): void {
    if (this.desligada) return;
    for (let cx = 0; cx < world.dims.x; cx++)
      for (let cz = 0; cz < world.dims.z; cz++) acenderColuna(world, this.grade, cx, cz);
  }

  /** Um bloco mudou: devolve os chunks a remeshar (vazio com a luz desligada). */
  aoMudarBloco(world: World, x: number, y: number, z: number): Set<number> {
    if (this.desligada) return new Set();
    return atualizarBloco(world, this.grade, x, y, z);
  }

  /** Uma coluna chegou inteira: recalcula do zero e devolve o que remeshar. */
  aoChegarColuna(world: World, cx: number, cz: number): Set<number> {
    if (this.desligada) return new Set();
    return acenderColuna(world, this.grade, cx, cz);
  }

  /**
   * Drena a fila sob orçamento de tempo e devolve as colunas prontas pra
   * MESHAR, na ordem. **Acende pelo menos uma sempre**: orçamento apertado não
   * pode significar fila parada — a coluna nunca chegaria a virar mesh.
   *
   * `aindaQuerida` responde se a coluna continua no raio; a que saiu enquanto
   * esperava é descartada sem acender, porque acender (e meshar) o que já foi
   * jogado fora desperdiça o frame inteiro.
   */
  drenar(
    world: World,
    orcamentoMs: number,
    aindaQuerida: (key: number) => boolean,
  ): { cx: number; cz: number }[] {
    const fim = performance.now() + orcamentoMs;
    const prontas: { cx: number; cz: number }[] = [];
    while (this.fila.length > 0) {
      const c = this.fila.shift()!;
      this.naFila.delete(c.cz * world.dims.x + c.cx);
      if (!aindaQuerida(c.cz * world.dims.x + c.cx)) continue;
      if (!this.desligada) {
        const t0 = performance.now();
        acenderColuna(world, this.grade, c.cx, c.cz);
        this.msTotal += performance.now() - t0;
        this.colunas++;
      }
      prontas.push(c);
      if (prontas.length >= 1 && performance.now() >= fim) break;
    }
    return prontas;
  }
}
