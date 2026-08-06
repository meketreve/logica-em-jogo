import type { WorldDims } from "@logica/shared";
import { colunaDaPosicao, contarColunasNoRaio } from "@logica/shared";
import type { LoadingScreen } from "./loading";

/** As contagens VIVAS que a tela amostra. Chegam por callback, e não por
 *  referência guardada, pela mesma razão do `ColunasFaltando`: o `Set` de
 *  colunas carregadas é REASSINADO na troca de aula (cp19), então guardá-lo
 *  daria um espelho do mundo velho. */
export interface FontesDeCarga {
  /** Bytes que já passaram pela conexão (in + out) — só informativo. */
  bytes: number;
  /** Colunas já aplicadas no mundo. */
  prontas: number;
  /** Buracos que a varredura 1×/s viu (`ColunasFaltando.tamanho`). */
  buracos: number;
  /** Chunks esperando malha (`ChunkRenderer.filaPendente`). */
  fila: number;
}

/**
 * §🕐 O progresso da tela de carga — o TOTAL esperado e quando ele foi atingido.
 *
 * O estado próprio é um número só (`total`), e é justamente por ser um número
 * só que ele merecia dono: era escrito em TRÊS pontos separados por 1.000
 * linhas do `startGame` (boot, `mundo_trocando` e `reloadWorld`) e lido 60×/s
 * pelo portão do laço de render. A conta que o produz não mora aqui — subiu pro
 * `shared/colunas.ts` na sessão 51, e é a MESMA que o servidor usa pra decidir
 * o que enviar (`streamColunas`). Se as duas discordarem por uma coluna, a tela
 * nunca fecha, ou fecha com o mundo furado.
 *
 * Quem NÃO mora aqui, de propósito: `loading.abrir`, `setFase` e o `hud` das
 * trocas de aula. Abrir a tela é decisão de quem trocou de mundo; esta classe
 * só responde "quanto falta" e "já chegou".
 */
export class ProgressoCarga {
  /** Colunas esperadas no raio inicial. 0 = INDETERMINADO (anel sem fim): é o
   *  estado enquanto o trabalho é todo do servidor e não há o que medir. */
  private total = 0;

  constructor(
    private readonly loading: LoadingScreen,
    private readonly fontes: () => FontesDeCarga,
  ) {}

  /**
   * O total esperado do raio em volta do jogador: o quadrado de `raio`
   * recortado pelas bordas do mundo — a MESMA conta que o servidor faz anel por
   * anel em `streamColunas`. O jogador não anda enquanto carrega (sem pointer
   * lock), então o centro não muda depois desta chamada.
   *
   * Mundo DENSO (não-lazy) chega inteiro no snapshot: nada a contar, e o total
   * fica em 0 — o custo dele foi o `buildAll` que já rodou.
   */
  recalcular(dims: WorldDims, x: number, z: number, raio: number, lazy: boolean): void {
    if (!lazy) {
      this.total = 0;
      return;
    }
    const { cx, cz } = colunaDaPosicao(dims, x, z);
    // `max(1, …)` é guarda de divisor: a conta já é ≥ 1 com o centro dentro do
    // mundo (é o teorema que o `colunas.test.ts` cobra), e o anel de progresso
    // divide por ele.
    this.total = Math.max(1, contarColunasNoRaio(dims, cx, cz, raio));
  }

  /** O host avisou que a troca COMEÇOU, antes de salvar a aula e montar a nova:
   *  não há o que medir enquanto o trabalho é todo dele. O `reloadWorld` assume
   *  com um `recalcular` quando o snapshot chegar. */
  indeterminar(): void {
    this.total = 0;
  }

  /** (Re)liga a tela às fontes. Precisa ser chamado a cada `loading.abrir`:
   *  `fechar()` solta a fonte de propósito. */
  observar(): void {
    this.loading.observar(() => {
      const f = this.fontes();
      return {
        bytes: f.bytes,
        prontas: f.prontas,
        total: this.total,
        // §🔁 a varredura 1×/s já mede os buracos; antes do 1º tick dela o
        // total-prontas dá a mesma resposta.
        faltando: f.buracos > 0 ? f.buracos : Math.max(0, this.total - f.prontas),
        fila: f.fila,
      };
    });
  }

  /** O raio inicial INTEIRO já foi aplicado? Só metade do portão — o resto
   *  (fila de luz e fila de malha) é de quem monta a geometria. */
  get raioCompleto(): boolean {
    return this.fontes().prontas >= this.total;
  }
}
