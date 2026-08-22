/**
 * Aviso permanente do `/invisivel` (2026-08-22) — a faixa que só o professor
 * escondido vê.
 *
 * ⚠️ **Por que ele existe:** a invisibilidade não tem sintoma nenhum na tela de
 * quem a ligou (a filtragem é do SERVIDOR, e o próprio dono nunca se desenhou).
 * Sem esta faixa o professor esquece que sumiu, fala com a turma e não entende
 * por que ninguém olha pra ele. Foi decisão do usuário na 1ª rodada do desenho.
 *
 * Não guarda estado de invisibilidade: quem manda é a mensagem `invisivel` do
 * servidor, e este módulo só a escreve na tela.
 */

/** Folga entre a barra de botões do dedo e a faixa. */
const FOLGA = 8;

export class InvisivelUi {
  private readonly root = document.getElementById("invisivel");
  private ativo = false;

  constructor() {
    // a fileira de botões REFLUI ao girar o tablet (1 linha ↔ 2), então a
    // medida tem de ser refeita — senão a faixa cobre a 2ª linha em retrato
    window.addEventListener("resize", () => this.posicionar());
  }

  mostrar(ativo: boolean): void {
    this.ativo = ativo;
    if (!this.root) return;
    this.root.classList.toggle("hidden", !ativo);
    this.root.textContent = "";
    if (!ativo) return;
    const faixa = document.createElement("span");
    faixa.textContent = "👻 você está invisível para os alunos — /invisivel volta";
    this.root.appendChild(faixa);
    this.posicionar();
  }

  /**
   * ⚠️ O topo é MEDIDO, não fixo. A barra do dedo (`#touch-topo`) quebra em
   * DUAS linhas em tela estreita (≤420px, o celular), e um `top: 64px` escrito
   * à mão cobre a segunda — foi exatamente o que a sonda pegou. Barra ausente
   * ou escondida (computador, ou menu aberto por cima) mede 0 e a faixa sobe.
   */
  private posicionar(): void {
    if (!this.root || !this.ativo) return;
    const barra = document.getElementById("touch-topo");
    const fim = barra?.checkVisibility() ? barra.getBoundingClientRect().bottom : 0;
    this.root.style.top = `${Math.round(fim > 0 ? fim + FOLGA : FOLGA)}px`;
  }
}
