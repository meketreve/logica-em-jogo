import { MAX_AMIGOS } from "@logica/shared";

/**
 * A ABA DE AMIGOS — a interface do `/amigos`, para TODO jogador.
 *
 * Nasceu em 2026-08-04 como painel SEPARADO (`#amigos`, tecla G, botão 👥 do
 * dedo, cópia da fábrica de controles e mais um nome na cascata de `hide()` do
 * `painelHost`). Em 2026-10-15 virou **aba do painel** (pedido do usuário:
 * *"quero unificar o painel de amigos com o painel painel"*), e o que a
 * unificação de fato resolve:
 *   - o aluno tinha DOIS caminhos diferentes pra duas metades da mesma coisa —
 *     "meu grupo da aula" num painel, "meus amigos" noutro;
 *   - "um menu por vez" tinha mais um menu pra lembrar (o bug do baú+mochila da
 *     §48 nasceu de uma cópia esquecida dessa regra);
 *   - a moldura, a rolagem e os controles agora são UMA implementação
 *     (`panels.ts`), não duas parecidas.
 *
 * **Nenhuma função nova** desde então — os seis subcomandos, apresentados
 * melhor: convidar · aceitar · recusar · sair · expulsar (só dono) · lista.
 * `lista` é o CORPO da aba (nunca um botão).
 *
 * Disciplina de sempre: o botão COMPÕE um `/amigos ...` e espera o `friends`
 * novo voltar — nada de mexer na lista local no clique. E nome é digitado por
 * gente: sempre `textContent`, nunca `innerHTML`.
 */
export interface FriendsData {
  /** Nome do PRÓPRIO jogador — é o que diz se eu sou o dono do grupo. */
  eu: string;
  /** Grupo de amigos (null = não estou em nenhum). Vem do servidor. */
  equipe: { dono: string; membros: string[] } | null;
  /** Quem me convidou e ainda espera resposta. */
  convites: string[];
  /** Quem EU convidei e ainda não respondeu. */
  enviados: string[];
  /** Quem está online agora (o main aprende pelo player_moved/player_left).
   *  Não inclui quem já está em outro grupo — isso só o servidor sabe, e é ele
   *  quem recusa. */
  online: string[];
}

export const AMIGOS_VAZIO: FriendsData = {
  eu: "",
  equipe: null,
  convites: [],
  enviados: [],
  online: [],
};

/**
 * Os controles que a aba pede ao painel. Existe pra a aba NÃO ter uma segunda
 * fábrica de botões: quem desenha botão, seção e dica é o `panels.ts`, e assim
 * o alvo de toque, o `data-acao` do botão armado e o visual saem iguais ao
 * resto do painel sem ninguém manter duas cópias.
 */
export interface ControlesDoPainel {
  send(cmd: string): void;
  sec(titulo: string): HTMLElement;
  btn(label: string, onClick: () => void): HTMLButtonElement;
  /** Botão perigoso em 2 cliques (1º arma, 2º executa). */
  armedBtn(label: string, onConfirm: () => void): HTMLButtonElement;
  hint(texto: string): HTMLElement;
  linha(nome: string, ...botoes: HTMLElement[]): HTMLElement;
}

/** Uma linha de NOME + botões, no visual das listas de jogador (`.jog-row`). */
export function linhaDeNome(nome: string, ...botoes: HTMLElement[]): HTMLElement {
  const row = document.createElement("div");
  row.className = "jog-row";
  const span = document.createElement("span");
  span.className = "jog-nome";
  span.textContent = nome;
  row.append(span, ...botoes);
  return row;
}

/** Pinta a aba inteira no corpo rolável que o painel entrega. */
export function renderAmigos(corpo: HTMLElement, data: FriendsData, ui: ControlesDoPainel): void {
  renderConvites(corpo, data, ui);
  renderGrupo(corpo, data, ui);
  renderConvidar(corpo, data, ui);
  corpo.append(
    ui.hint(
      "pelo chat também dá: /amigos convidar nome · /amigos aceitar · /amigos recusar · " +
        "/amigos sair · /amigos expulsar nome · /amigos lista",
    ),
  );
}

function renderConvites(corpo: HTMLElement, data: FriendsData, ui: ControlesDoPainel): void {
  if (data.convites.length === 0) return; // sem convite, sem seção
  corpo.append(ui.sec(`✉ convites para você (${data.convites.length})`));
  for (const dono of data.convites) {
    corpo.append(
      ui.linha(
        `${dono} convidou você`,
        ui.btn("aceitar", () => ui.send(`/amigos aceitar ${dono}`)),
        ui.btn("recusar", () => ui.send(`/amigos recusar ${dono}`)),
      ),
    );
  }
  corpo.append(ui.hint("aceitar um convite descarta os outros — você fica em UM grupo só."));
}

function renderGrupo(corpo: HTMLElement, data: FriendsData, ui: ControlesDoPainel): void {
  const { eu, equipe } = data;
  if (!equipe) {
    corpo.append(ui.sec("👥 seu grupo"));
    corpo.append(
      ui.hint(
        `Você não está em nenhum grupo. Quem está no seu grupo pode construir na sua ÁREA ` +
          `PROTEGIDA (e você na dele). Cabem ${MAX_AMIGOS} pessoas, contando você.`,
      ),
    );
    return;
  }
  const souDono = equipe.dono === eu;
  corpo.append(ui.sec(`👥 grupo de ${equipe.dono} — ${equipe.membros.length}/${MAX_AMIGOS}`));
  for (const nome of equipe.membros) {
    const rotulos = [nome === equipe.dono ? "dono" : "", nome === eu ? "você" : ""].filter((t) => t);
    const texto = rotulos.length ? `${nome} (${rotulos.join(", ")})` : nome;
    corpo.append(
      souDono && nome !== eu
        ? ui.linha(texto, ui.armedBtn("expulsar", () => ui.send(`/amigos expulsar ${nome}`)))
        : ui.linha(texto),
    );
  }
  // dono saindo DISSOLVE o grupo: o comando já faz isso, mas em texto ninguém lê
  corpo.append(
    souDono
      ? ui.linha("", ui.armedBtn("sair e DESFAZER o grupo", () => ui.send("/amigos sair")))
      : ui.linha("", ui.armedBtn("sair do grupo", () => ui.send("/amigos sair"))),
  );
  if (souDono) {
    corpo.append(ui.hint("você é o dono: se sair, o grupo acaba para todo mundo."));
  }
}

function renderConvidar(corpo: HTMLElement, data: FriendsData, ui: ControlesDoPainel): void {
  const { eu, equipe, enviados, online } = data;
  corpo.append(ui.sec("＋ convidar"));
  if (equipe && equipe.dono !== eu) {
    corpo.append(ui.hint(`Só ${equipe.dono} convida para este grupo. Saia dele para montar o seu.`));
    return;
  }
  if (equipe && equipe.membros.length >= MAX_AMIGOS) {
    corpo.append(ui.hint(`Grupo cheio (${MAX_AMIGOS}/${MAX_AMIGOS}).`));
    return;
  }
  for (const nome of enviados) {
    corpo.append(ui.linha(`${nome} — convite enviado, aguardando`));
  }
  const naEquipe = new Set(equipe?.membros ?? []);
  const candidatos = online.filter((n) => n !== eu && !naEquipe.has(n) && !enviados.includes(n));
  for (const nome of candidatos) {
    corpo.append(ui.linha(nome, ui.btn("convidar", () => ui.send(`/amigos convidar ${nome}`))));
  }
  if (candidatos.length === 0 && enviados.length === 0) {
    corpo.append(ui.hint("ninguém mais está na aula agora."));
  }
}
