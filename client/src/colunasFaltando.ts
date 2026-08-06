import type { WorldDims } from "@logica/shared";

/**
 * §🔁 A rede de segurança do streaming, e por que ela é um objeto.
 *
 * O streaming F2 é fire-and-forget: lote perdido, decode falho ou mesh falho
 * deixava buraco PERMANENTE no mundo (só sair do raio e voltar consertava).
 * Esta classe guarda quem está faltando, quando pedir de novo, e o teto que
 * impede a repedida de virar flood.
 *
 * O que mora aqui: o mapa dos buracos, os quatro números do backoff e o
 * contador de pedidos que o F3 mostra. O que NÃO mora: quem sabe se a coluna
 * chegou (`colunasCarregadas` é do `startGame` e é REASSINADO na troca de aula,
 * por isso ele entra por parâmetro a cada varredura, não pelo construtor) e o
 * que descartar/pedir significa — os dois entram como callback, porque
 * descartar mexe em quatro donos (mesh, tochas, luz e os bytes) e pedir depende
 * da conexão viva.
 */
export class ColunasFaltando {
  /** Coluna DENTRO do raio que não chegou. `proximo` = quando pedir de novo. */
  private readonly faltando = new Map<number, { tentativas: number; proximo: number }>();
  private pedidos = 0;

  /** Carência antes do 1º pedido: o lote pode estar a caminho (o servidor manda
   *  `colunasPorTick` por vez, o mundo inteiro não chega num tick). */
  private static readonly ESPERA_INICIAL_MS = 4000;
  private static readonly BACKOFF_BASE_MS = 2000; // dobra a cada tentativa…
  private static readonly BACKOFF_MAX_MS = 30_000; // …até este teto (servidor lento ≠ flood)
  /** Teto de pedidos por varredura (o servidor tem o SEU teto — este evita
   *  gastar upload à toa quando o mundo inteiro está faltando). */
  private static readonly PEDIDOS_POR_VARREDURA = 4;

  constructor(
    /** Joga fora bytes + geometria + luz + sprites da coluna. */
    private readonly descartarColuna: (cx: number, cz: number) => void,
    /** Manda o `pedir_coluna` pelo fio. */
    private readonly pedirColuna: (cx: number, cz: number) => void,
  ) {}

  /** Quantas colunas estão em falta (F3 e a tela de carga). */
  get tamanho(): number {
    return this.faltando.size;
  }

  /** Total de `pedir_coluna` mandados desde o boot (F3). */
  get repedidas(): number {
    return this.pedidos;
  }

  /** A coluna chegou: sai da lista de buracos. */
  chegou(key: number): void {
    this.faltando.delete(key);
  }

  /** Troca de aula (cp19): buracos do mundo VELHO não valem no novo. */
  limpar(): void {
    this.faltando.clear();
  }

  /**
   * Percorre o quadrado até `raio` e pede de volta a coluna que deveria estar
   * carregada e não está. Roda na MESMA passada 1×/s do descarte.
   */
  varrer(
    pcx: number,
    pcz: number,
    agora: number,
    dims: WorldDims,
    raio: number,
    carregadas: ReadonlySet<number>,
  ): void {
    let pedidosNaVarredura = 0;
    for (let cx = pcx - raio; cx <= pcx + raio; cx++) {
      for (let cz = pcz - raio; cz <= pcz + raio; cz++) {
        if (cx < 0 || cz < 0 || cx >= dims.x || cz >= dims.z) continue;
        const key = cz * dims.x + cx;
        if (carregadas.has(key)) continue;
        const f = this.faltando.get(key);
        if (!f) {
          this.faltando.set(key, {
            tentativas: 0,
            proximo: agora + ColunasFaltando.ESPERA_INICIAL_MS,
          });
          continue;
        }
        if (agora < f.proximo || pedidosNaVarredura >= ColunasFaltando.PEDIDOS_POR_VARREDURA)
          continue;
        // descarta bytes + geometria ANTES de repedir: um decode que morreu no
        // meio pode ter deixado meia coluna, e remeshar por cima do lixo
        // esconderia o buraco em vez de consertar
        this.descartarColuna(cx, cz);
        this.pedirColuna(cx, cz);
        f.tentativas++;
        f.proximo =
          agora +
          Math.min(
            ColunasFaltando.BACKOFF_MAX_MS,
            ColunasFaltando.BACKOFF_BASE_MS * 2 ** (f.tentativas - 1),
          );
        pedidosNaVarredura++;
        this.pedidos++;
      }
    }
    // saiu do raio (ou finalmente chegou): esquece — o mapa não pode crescer
    // enquanto o jogador anda pelo mundo
    for (const key of this.faltando.keys()) {
      const cx = key % dims.x;
      const cz = (key - cx) / dims.x;
      if (carregadas.has(key) || Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz)) > raio) {
        this.faltando.delete(key);
      }
    }
  }
}
