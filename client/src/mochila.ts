import { HOTBAR_SLOTS, type Inventario, type SlotSalvo, inventarioVazio, parseInventario } from "@logica/shared";

/**
 * §🍖 F4 — a mochila do lado do CLIENTE: espelho do inventário autoritativo.
 *
 * Estado puro, sem DOM (o `vitals.ts` desenha, o `inventory.ts` desenha; aqui
 * só se guarda o que o servidor disse). **A UI nunca decide** — mesma
 * disciplina do resto: colocar bloco continua sendo um pedido ao servidor, e o
 * que este módulo faz é apenas evitar pedir o que a gente já sabe que não tem.
 *
 * `ativa` = o servidor mandou uma mensagem `inventario`, ou seja, este jogador
 * está em sobrevivência. Em criativo a mensagem NUNCA chega, e a ausência é o
 * que mantém a paleta infinita de sempre valendo, sem um `if` de modo aqui.
 */
export class Mochila {
  private inv: Inventario = inventarioVazio();
  private ligada = false;
  /** `?mochila=` na URL: congela o conteúdo pra inspeção e IGNORA o servidor,
   *  do mesmo jeito que o `?vida=` vence o sync da vida e o `?hora=` vence o do
   *  céu. Sem isto, o `modo criativo` que todo join manda apagaria o print. */
  private travada = false;

  /** O servidor mandou inventário? (false = criativo, paleta infinita) */
  get ativa(): boolean {
    return this.ligada;
  }

  /** Aplica a mensagem `inventario` (forma esparsa) vinda do servidor. */
  aplicar(slots: SlotSalvo[]): void {
    if (this.travada) return;
    this.inv = parseInventario(slots);
    this.ligada = true;
  }

  /** Enche a mochila pra INSPEÇÃO e tranca: nada da rede muda mais. */
  travar(slots: SlotSalvo[]): void {
    this.inv = parseInventario(slots);
    this.ligada = true;
    this.travada = true;
  }

  /** Voltou pra criativo: a mochila some da tela (mas não do servidor). */
  desligar(): void {
    if (this.travada) return;
    this.ligada = false;
    this.inv = inventarioVazio();
  }

  /** Id do slot (null = vazio). */
  idDoSlot(i: number): number | null {
    return this.inv[i]?.id ?? null;
  }

  /** Quantidade no slot (0 = vazio). */
  qtdDoSlot(i: number): number {
    return this.inv[i]?.qtd ?? 0;
  }

  /** Os 9 slots da hotbar, na ordem (null onde está vazio). */
  hotbar(): (number | null)[] {
    return Array.from({ length: HOTBAR_SLOTS }, (_, i) => this.idDoSlot(i));
  }

  /** Quantas unidades deste id existem na mochila inteira. */
  contar(id: number): number {
    let n = 0;
    for (const s of this.inv) if (s?.id === id) n += s.qtd;
    return n;
  }
}
