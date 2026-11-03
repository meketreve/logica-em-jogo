/**
 * §🔊 Sons v2 — QUAL amostra gravada toca em cada som (2026-11-03).
 *
 * A v1 era 100% sintetizada (`client/src/somMundo.ts`). A v2 troca o timbre
 * por som GRAVADO onde a síntese soava "de videogame antigo" — blocos,
 * passos, porta, baú, Dimas e os bichos que têm voz conhecida — e deixa a
 * síntese em dois papéis:
 *
 *  1. **o resto** (vento, riacho, gota, água, balde, alavanca, placa, fogo,
 *     fabricar, teleporte, areia, porco, tatu, peixe, arara, passarinho);
 *  2. **a RESERVA**: amostra que não carregou (tablet sem Vorbis, rede, 404)
 *     cai na receita da v1 — o jogo nunca fica mudo por falta de arquivo.
 *
 * Esta tabela é PURA (mora no shared por isso: o `npm test` confere que todo
 * arquivo que ela pede existe em `client/public/sons/` e tem crédito, e que
 * nenhum arquivo da pasta sobra sem uso). Os arquivos em si saem do
 * `scripts/preparar-sons.mjs`, que guarda a ORIGEM de cada um.
 *
 * Os ganhos foram acertados na conta (amostras igualadas a −20 dBFS de média
 * × o pico da receita sintetizada equivalente), NÃO no ouvido — são os
 * primeiros números a mexer depois da aula.
 */

import type { MaterialSonoro, VozDeBicho } from "./sons";

/** Conjunto → quantos takes ele tem (`sons/<conjunto>-<n>.ogg`, n = 1..N). */
export const CONJUNTOS_DE_AMOSTRA = {
  "passo-pedra": 3,
  "passo-madeira": 3,
  "passo-terra": 3,
  "passo-planta": 2,
  "golpe-pedra": 3,
  "golpe-madeira": 3,
  "golpe-vidro": 2,
  "golpe-metal": 3,
  "quebrar-pedra": 3,
  "quebrar-madeira": 3,
  "quebrar-vidro": 3,
  "quebrar-metal": 3,
  "quebrar-tecido": 2,
  "porta-abrir": 2,
  "porta-fechar": 2,
  "bau-abrir": 2,
  "bau-fechar": 2,
  "moeda-ganhou": 1,
  "moeda-gastou": 1,
  "bicho-vaca": 2,
  "bicho-ovelha": 2,
  "bicho-galinha": 2,
  "bicho-cachorro": 2,
  "bicho-gato": 2,
  grilo: 2,
} as const;

export type ConjuntoDeAmostra = keyof typeof CONJUNTOS_DE_AMOSTRA;

/** Pasta das amostras, relativa à raiz servida (Vite `public/` = `client/dist/`). */
export const PASTA_SONS = "sons";

/** Os arquivos de um conjunto, na ordem dos takes. */
export function arquivosDoConjunto(c: ConjuntoDeAmostra): string[] {
  const n = CONJUNTOS_DE_AMOSTRA[c];
  return Array.from({ length: n }, (_, i) => `${c}-${i + 1}.ogg`);
}

/** Todos os arquivos que o jogo pede (o carregador baixa estes; o teste os confere). */
export function todosOsArquivosDeSom(): string[] {
  return (Object.keys(CONJUNTOS_DE_AMOSTRA) as ConjuntoDeAmostra[]).flatMap(arquivosDoConjunto);
}

/**
 * Como tocar: conjunto, ganho (multiplica a amostra igualada) e `tom` — a
 * velocidade de leitura (1 = original; < 1 mais grave e mais longo). O
 * cliente ainda sorteia ±6% por cima, pra 10 passos não soarem iguais.
 */
export interface UsoDeAmostra {
  conjunto: ConjuntoDeAmostra;
  ganho: number;
  tom: number;
}

export type UsoDeMaterial = "quebrar" | "colocar" | "golpe" | "passo";

const DURO = new Set<MaterialSonoro>(["pedra", "madeira", "vidro", "metal"]);

/**
 * O som gravado de um material — ou `null`: aquele par fica SINTETIZADO.
 *
 * A regra (convenção de Minecraft, que é o padrão em dúvida de UX):
 *  - material DURO tem golpe e quebra próprios; COLOCAR é o golpe mais forte;
 *  - terra e planta não "quebram" com estalo — o próprio passo, mais forte e
 *    mais grave, é o som de cavar/arrancar e de colocar;
 *  - vidro e metal se pisam como pedra (piso duro);
 *  - tecido só tem o farfalhar (quebrar/colocar); o passo em lã é a síntese
 *    baixa da v1, que já era quase nada;
 *  - AREIA fica toda sintetizada: nenhum pacote CC0 conferido tinha areia
 *    (o "gravel" do TinyWorlds tem 6 ataques — é uma corrida, não um passo).
 */
export function amostraDoMaterial(uso: UsoDeMaterial, mat: MaterialSonoro): UsoDeAmostra | null {
  if (mat === "areia") return null;
  if (mat === "tecido") {
    if (uso === "quebrar") return { conjunto: "quebrar-tecido", ganho: 0.5, tom: 1 };
    if (uso === "colocar") return { conjunto: "quebrar-tecido", ganho: 0.35, tom: 1.15 };
    return null;
  }
  const passo: ConjuntoDeAmostra =
    mat === "madeira" ? "passo-madeira" : mat === "terra" ? "passo-terra" : mat === "planta" ? "passo-planta" : "passo-pedra";
  if (uso === "passo") return { conjunto: passo, ganho: 0.22, tom: 1 };
  if (DURO.has(mat)) {
    const m = mat as "pedra" | "madeira" | "vidro" | "metal";
    if (uso === "golpe") return { conjunto: `golpe-${m}`, ganho: 0.32, tom: 1 };
    if (uso === "colocar") return { conjunto: `golpe-${m}`, ganho: 0.5, tom: 0.9 };
    return { conjunto: `quebrar-${m}`, ganho: 0.6, tom: 1 };
  }
  // terra e planta: o passo faz tudo, mudando força e tom
  if (uso === "golpe") return { conjunto: passo, ganho: 0.3, tom: 1.1 };
  if (uso === "colocar") return { conjunto: passo, ganho: 0.5, tom: 0.85 };
  return { conjunto: passo, ganho: 0.65, tom: 0.75 };
}

/** A voz gravada de um bicho — `null` = a síntese da v1 (porco, tatu, peixe,
 *  arara, passarinho: sem fonte CC0 conferida que não fosse imitação humana). */
export function amostraDoBicho(voz: VozDeBicho | null): ConjuntoDeAmostra | null {
  switch (voz) {
    case "vaca":
      return "bicho-vaca";
    case "ovelha":
      return "bicho-ovelha";
    case "galinha":
      return "bicho-galinha";
    case "cachorro":
      return "bicho-cachorro";
    case "gato":
      return "bicho-gato";
    default:
      return null;
  }
}
