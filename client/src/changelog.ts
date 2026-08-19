import { VERSION } from "@logica/shared";

/**
 * Tela "📜 novidades" do menu principal — o que mudou em cada versão.
 * Fonte de verdade ÚNICA do texto: uma versão só por linha nova, sempre a
 * atual por último (a lista mostra da mais nova pra mais antiga). A pergunta
 * "o que mudou?" mora AQUI, não espalhada por commit.
 */

interface Mudanca {
  versao: string;
  titulo: string;
  itens: string[];
}

const MUDANCAS: readonly Mudanca[] = [
  {
    versao: "recém-chegado",
    titulo: "Árvores de verdade",
    itens: [
      "muda de árvore: quebre a FOLHA de uma árvore e ela pode largar a muda da própria espécie (1 em 10)",
      "plante a muda na terra/grama: ela cresce e vira a árvore completa do bioma (carvalho, ipê, araucária, pau-brasil)",
      "grama espalha pra terra exposta ao lado",
      "sol quadrado, estilo Minecraft",
      "botão “📜 novidades” aqui no menu",
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
    h.textContent = `${m.versao} — ${m.titulo}`;
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