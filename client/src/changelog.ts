import { VERSION, rotuloDeVersao } from "@logica/shared";

/**
 * Tela "📜 novidades" do menu principal — o que mudou em cada versão.
 * Fonte de verdade ÚNICA do texto: uma versão só por linha nova, sempre a
 * atual por último (a lista mostra da mais nova pra mais antiga). A pergunta
 * "o que mudou?" mora AQUI, não espalhada por commit.
 *
 * ⚠️ **A entrada do topo NÃO leva `versao`** — ela É a release atual, e o
 * número vem do `package.json` via `rotuloDeVersao()`. Antes ela era rotulada
 * "recém-chegado" à mão, e a string ficou lá por 12 versões de trabalho: nada
 * obrigava ninguém a trocá-la, e com o launcher se atualizando sozinho na
 * escola o professor via "recém-chegado" pra sempre. Ao subir a versão:
 * `npm version` relabela o topo sozinho, e o bloco novo entra ACIMA dele com o
 * número que o topo acabou de deixar de ser.
 */

interface Mudanca {
  /** Ausente = é a release ATUAL; o número sai do package.json. */
  versao?: string;
  titulo: string;
  itens: string[];
}

const MUDANCAS: readonly Mudanca[] = [
  {
    // sem `versao`: esta é a release atual (ver rotuloDeVersao)
    titulo: "Dormir, plantar e sumir",
    itens: [
      "/invisivel: o professor some para os alunos e atravessa paredes, para observar a turma trabalhando sem virar atração (outros professores continuam vendo)",
      "durma na cama para passar a noite — e ela vira o seu ponto de renascimento",
      "muda de árvore: quebre a FOLHA de uma árvore e ela pode largar a muda da própria espécie (1 em 10); plante na terra e ela cresce virando a árvore do bioma (carvalho, ipê, araucária, pau-brasil)",
      "aba “todos” no inventário: procure qualquer bloco por nome ou por número",
      "“lã <cor>” virou “bloco de algodão <cor>” — o nome agora bate com o que é",
      "painel do professor rola: a seção de grupos deixou de ficar inalcançável em tela baixa",
      "/painel no chat e botão 📋 na barra do tablet — o painel de autoria deixou de depender da tecla P, que não existe no dedo",
      "/aula grupos X cria a área de cada grupo copiando a célula-molde, e o painel P ganhou a aba de grupos",
      "grama espalha devagar (1 célula a cada 3s) em vez de tomar conta do mundo",
      "conserto do soterramento: quem é enterrado no subsolo agora sufoca de verdade em vez de ser cuspido lá na superfície",
      "menu principal com fundo 3D feito de prints reais do mundo, splash e a tela “📜 novidades”",
      "sol quadrado, estilo Minecraft",
    ],
  },
  {
    versao: "v0.10.1",
    titulo: "Auto-update aprovado na escola",
    itens: [
      "a atualização do jogo rodou e fechou na escola: o servidor avisa quantos commits ficou pra trás e se atualiza sozinho",
      "consertos finais no launcher (os erros de “não é reconhecido como um comando” sumiram)",
    ],
  },
  {
    versao: "v0.10.0",
    titulo: "Tooltip de item",
    itens: [
      "passe o mouse (ou segure o dedo) num item e ele explica o que é e para que serve",
      "o céu e o profiler continuam — e as ferramentas novas (picareta, machado e pá) mostraram onde aparecem",
    ],
  },
  {
    versao: "v0.9.0",
    titulo: "Sobrevivência completa",
    itens: [
      "minerar exige picareta; carvão e diamante saem do minério, ferro e ouro fundem na fornalha",
      "baú com painel de transferência (tocar origem → tocar destino)",
      "algodão no lugar da lã-de-trigo: cultive e transforme em bloco de algodão",
      "6 cultivos novos: cenoura, batata, beterraba, melancia, banana e aipim",
      "picareta obrigatória, /pvp, e o mundo pesado carrega nos workers (trava de 9,5s → 99ms)",
    ],
  },
  {
    versao: "v0.8.0",
    titulo: "Água, claim e turma",
    itens: [
      "água fluida com balde (caia, espalhe, encha baldes)",
      "claim do professor + painel de jogadores com banimento",
      "tudo funciona no celular e com a turma em rede",
      "profiler com relatório de 10s (min/méd/p95) salvo no servidor",
    ],
  },
];

/** Monta a tela de novidades num corpo (mesmo jeito da tela de configurações). */
export function buildChangelogScreen(body: HTMLElement, onBack: () => void): void {
  body.textContent = "";

  const atual = document.createElement("p");
  atual.className = "menu-hint";
  atual.textContent = `versão atual: v${VERSION}`;
  body.appendChild(atual);

  for (const m of MUDANCAS) {
    const bloco = document.createElement("section");
    bloco.className = "changelog-bloco";

    const h = document.createElement("h3");
    h.textContent = `${rotuloDeVersao(m.versao)} — ${m.titulo}`;
    bloco.appendChild(h);

    const lista = document.createElement("ul");
    for (const item of m.itens) {
      const li = document.createElement("li");
      li.textContent = item;
      lista.appendChild(li);
    }
    bloco.appendChild(lista);

    body.appendChild(bloco);
  }

  const back = document.createElement("button");
  back.type = "button";
  back.className = "menu-back";
  back.textContent = "← voltar";
  back.addEventListener("click", onBack);
  body.appendChild(back);
}