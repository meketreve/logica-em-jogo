import type { ContainerPanel } from "./container";
import type { EmojiWheelPanel } from "./emojiWheel";
import type { FriendsPanel } from "./friends";
import type { InventoryPanel } from "./inventory";
import type { GamePanel } from "./panels";
import type { PlayersPanel } from "./players";

/** O mínimo que a regra de um menu por vez precisa de um painel. */
interface MenuDeTela {
  readonly open: boolean;
  toggle(): void;
}

/**
 * Os painéis de tela cheia e a regra que os governa (§48, pedido do usuário:
 * *"adicione uma regra para não poder abrir um menu (esc e mochila por exemplo)
 * se já tem outro aberto"*).
 *
 * Antes de existirem cinco `let` de módulo, a regra vivia repetida: **cinco
 * cópias** do mesmo `if (!(x?.open ?? false) && !podeAbrirMenu()) return;` (a
 * tecla do cp14, a de amigos, a do inventário, e as duas do dedo) mais três
 * cascatas de `hide()` escritas à mão em ordens diferentes. Uma cópia esquecida
 * não quebra nada visível: o segundo menu simplesmente abre por cima, e o
 * servidor continua achando que o primeiro está aberto — foi exatamente o
 * bug do baú+mochila da sessão 48.
 *
 * **A distinção que o `alternar` guarda, e que é fácil de perder:** o portão é
 * só pra ABRIR. Fechar sempre pode — senão o menu aberto se trancaria a si
 * mesmo, e o aluno ficaria preso nele.
 *
 * **O container é a exceção declarada** (§🍖 F10): quem o abre é o SERVIDOR
 * respondendo ao `use_block`, não uma tecla. A verdade dele ganha da tela, então
 * `aoAbrirContainer` fecha os outros em vez de recusar.
 *
 * O editor de quadro fica de fora de propósito: é modal por cima de tudo, tem o
 * Esc dele, e só abre com o ponteiro travado — ou seja, nunca com outro menu na
 * tela.
 */
export class PainelHost {
  /** cp14: autoria (professor) ou grupos (aluno). */
  cp14: GamePanel | null = null;
  /** Só professor (expulsar/banir/desbanir), aberto pelo 👥 do painel de autoria. */
  jogadores: PlayersPanel | null = null;
  /** De todo jogador — a interface do `/amigos`. */
  amigos: FriendsPanel | null = null;
  /** Inventário de blocos (cp16). */
  mochila: InventoryPanel | null = null;
  /** §🍖 F10: fornalha e baú. Sem tecla própria. */
  container: ContainerPanel | null = null;
  /** Menu radial de emojis (2026-09-03, tecla V). */
  emojis: EmojiWheelPanel | null = null;

  /**
   * @param bloqueado O que NÃO é painel mas também é menu: o menu de pausa e o
   * chat. Chega por callback porque os dois são do `main.ts` (o overlay é DOM
   * cru, e o chat nasce antes destes painéis).
   */
  constructor(private readonly bloqueado: () => boolean) {}

  /** Algum painel de tela cheia está aberto? É o que decide se o menu de pausa
   *  e a UI de toque somem (senão cobrem o painel). */
  get algumAberto(): boolean {
    return (
      (this.cp14?.open ?? false) ||
      (this.mochila?.open ?? false) ||
      (this.jogadores?.open ?? false) ||
      (this.amigos?.open ?? false) ||
      (this.container?.open ?? false) ||
      (this.emojis?.open ?? false)
    );
  }

  /** UM MENU POR VEZ: nada aberto, nem painel, nem pausa, nem chat. */
  get podeAbrir(): boolean {
    return !this.algumAberto && !this.bloqueado();
  }

  /**
   * O gesto de tecla/dedo sobre um painel. Com OUTRO menu na tela não faz nada
   * (antes fechava o outro por baixo do pano); o próprio painel continua
   * fechando na segunda tecla, porque o portão é só pra abrir.
   */
  alternar(p: MenuDeTela | null): void {
    if (this.podeAlternar(p)) p?.toggle();
  }

  /** O portão SEM o toggle — pra quem tem um gate próprio no meio. Só o cp14
   *  tem: o painel do aluno só abre depois de o professor criar grupos, e o
   *  aviso disso precisa sair ENTRE uma coisa e outra. */
  podeAlternar(p: MenuDeTela | null): boolean {
    return (p?.open ?? false) || this.podeAbrir;
  }

  /** O 👥 do topo do painel de autoria: TROCA o de autoria pelo de jogadores
   *  (não é "abrir por cima" — é o mesmo menu mudando de página). */
  trocarParaJogadores(): void {
    this.cp14?.hide();
    this.mochila?.hide();
    this.amigos?.hide();
    this.jogadores?.show();
  }

  /**
   * `/amigos` sem subcomando (§48): a única porta que serve no PC e no tablet —
   * a tecla G não existe no dedo e o botão 👥 só aparece com a proteção ligada.
   * É TROCA, como o 👥, e não passa pelo portão: quem digitou o comando já está
   * com o chat aberto, e o chat bloqueia tudo.
   *
   * Devolve `false` se não há painel ainda (antes do join) — aí o comando segue
   * pro servidor, que responde no chat.
   */
  trocarParaAmigos(): boolean {
    if (!this.amigos) return false;
    this.cp14?.hide();
    this.mochila?.hide();
    this.jogadores?.hide();
    this.amigos.toggle();
    return true;
  }

  /**
   * `/painel` sem subcomando (2026-08-21): a mesma porta que o `/amigos` abriu —
   * a tecla P não existe no dedo, e digitar o comando é o gesto que o aluno já
   * conhece. É TROCA, como o 👥, e **não passa pelo portão de propósito**: quem
   * digitou o comando está com o chat aberto, o chat conta como menu no
   * `bloqueado()`, e o `podeAbrir` diria não — o comando morreria em silêncio.
   *
   * Devolve `false` se não há painel ainda (antes do join) — aí o comando segue
   * pro servidor. ⚠️ E lá `/painel` NÃO existe (`session.ts`): o aluno vê
   * "Comando desconhecido". É o preço de não ter painel pra abrir, não um bug.
   */
  trocarParaPainel(): boolean {
    if (!this.cp14) return false;
    this.mochila?.hide();
    this.jogadores?.hide();
    this.amigos?.hide();
    this.cp14.toggle();
    return true;
  }

  /**
   * O servidor mandou abrir um container. Na prática nunca há o que fechar
   * (abrir baú é clique direito, que exige ponteiro travado, que exige nenhum
   * menu aberto) — os `hide` são o cinto além do suspensório.
   */
  aoAbrirContainer(): void {
    this.cp14?.hide();
    this.jogadores?.hide();
    this.amigos?.hide();
    this.mochila?.hide();
  }
}
