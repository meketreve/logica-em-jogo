import {
  BlockId,
  ITEM_CARNE_CRUA,
  ITEM_COURO,
  ITEM_FRANGO_CRU,
  ITEM_FRUTA,
  ITEM_PEIXE_CRU,
  ITEM_PENA,
  ITEM_TRIGO,
} from "./blocks";

/**
 * §🐄 MOBS PASSIVOS (2026-11-02) — a TABELA dos bichos. Módulo PURO, no molde
 * do `receitas.ts`/`comida.ts`: o que cada bicho É (vida, tamanho, velocidade,
 * onde nasce, o que dá, o que o atrai) mora aqui, e a IA, o caminho e a
 * sessão só LEEM esta tabela. Bicho novo = uma linha; variante nova (cor +
 * área de spawn, pedido dele) = uma entrada em `variantes`, sem código.
 *
 * ⚠️ A ORDEM de `TIPOS_BICHO` e de cada `variantes` é IDENTIDADE: o índice
 * viaja no fio e no save. Tipo ou variante nova entra no FIM, nunca no meio
 * (a mesma regra do índice das receitas).
 *
 * Decisões dele (questionário de 2026-11-02, o `todo.md` §🐄 tem o resto):
 * - só PASSIVOS: nenhum bicho daqui bate em ninguém;
 * - tatu, cão e gato NÃO dão carne (o tatu-bola é ameaçado de extinção);
 * - o leite tem prazo por vaca (senão a fome some do jogo);
 * - a lã sai em BLOCO, da cor da ovelha.
 */

export type TipoBicho = "vaca" | "galinha" | "ovelha" | "cao" | "gato" | "tatu" | "peixe" | "arara";

/** Ordem = índice no fio e no save. APPEND. */
export const TIPOS_BICHO: readonly TipoBicho[] = [
  "vaca",
  "galinha",
  "ovelha",
  "cao",
  "gato",
  "tatu",
  "peixe",
  "arara",
];

/** Onde o bicho se move: terra (A*), água (nada) ou ar (voa de copa em copa). */
export type MeioBicho = "terra" | "agua" | "ar";

/** Nome do bioma como `biomaPorClima(...).nome` devolve. */
export type NomeBioma = "caatinga" | "cerrado" | "mata" | "araucárias";

export interface VarianteBicho {
  /** Como o aluno lê na mira ("vira-lata caramelo"). */
  readonly nome: string;
  /**
   * Paleta da variante pro modelo do cliente: `corpo` (a cor dominante),
   * `detalhe` (manchas, crista, barbatana, asa…) e `acento` (bico, focinho,
   * casco, olho). Hex "#rrggbb". O SERVIDOR não lê isto — mora aqui pra
   * variante nova ser UMA linha, não uma linha aqui e outra no cliente.
   */
  readonly cores: { readonly corpo: string; readonly detalhe: string; readonly acento: string };
  /** Onde ESTA variante nasce. Ausente = os biomas do tipo. */
  readonly biomas?: readonly NomeBioma[];
  /** Peso no sorteio entre as variantes do mesmo bioma (padrão 1). */
  readonly peso?: number;
  /** Ovelha: o bloco de lã que a tesoura tira desta variante. */
  readonly la?: number;
}

export interface DropBicho {
  readonly id: number;
  readonly min: number;
  readonly max: number;
}

export interface DefBicho {
  readonly tipo: TipoBicho;
  /** Nome genérico, com artigo pro chat ("a vaca"). */
  readonly nome: string;
  readonly artigo: "o" | "a";
  readonly vidaMax: number;
  /** Caixa de colisão/mira: largura (x = z) e altura, em blocos. */
  readonly largura: number;
  readonly altura: number;
  /** Velocidade passeando e fugindo, em blocos/s. */
  readonly velocidade: number;
  readonly velocidadeFuga: number;
  readonly meio: MeioBicho;
  /** Itens que, na MÃO de alguém por perto, fazem o bicho SEGUIR — e que
   *  alimentam (reprodução) quando dados com o clique direito. */
  readonly isca: readonly number[];
  /** Biomas onde nasce sozinho (mundo procedural). */
  readonly biomas: readonly NomeBioma[];
  /** Peso do tipo no sorteio do spawn natural (0 = nunca nasce sozinho). */
  readonly pesoSpawn: number;
  /** Tamanho do bando na geração. */
  readonly bando: readonly [number, number];
  /** O que cai na mochila de quem mata um ADULTO. Filhote não dá nada. */
  readonly drops: readonly DropBicho[];
  /** Reproduz quando dois adultos comem a isca? */
  readonly reproduz: boolean;
  /** Pode ser domado: com que item e com que chance por tentativa. */
  readonly domar?: { readonly itens: readonly number[]; readonly chance: number };
  /** Cai sem dano de queda (a galinha bate asa). */
  readonly semDanoDeQueda?: boolean;
  readonly variantes: readonly VarianteBicho[];
}

/** Prazos em TICKS (10/s). 5 min = 3000. */
export const TICKS_LEITE = 3000;
export const TICKS_LA = 3000;
export const TICKS_OVO_MIN = 3000;
export const TICKS_OVO_MAX = 6000;
/** Quanto tempo o bicho fica "apaixonado" depois de comer a isca. */
export const TICKS_AMOR = 300;
/** Descanso entre duas crias do mesmo adulto. */
export const TICKS_DESCANSO_CRIA = 3000;
/** Quanto o filhote leva pra virar adulto (10 min). */
export const TICKS_CRESCER = 6000;
/** Fuga depois de apanhar. */
export const TICKS_FUGA = 50;
/** A bola do tatu dura isto depois da ÚLTIMA ameaça. */
export const TICKS_BOLA = 40;
/** A arara alimentada segue por isto. */
export const TICKS_ARARA_SEGUE = 300;

/**
 * Teto de bichos da mesma espécie num raio de 16 blocos pra aceitar CRIA nova
 * (o curral cheio recusa a isca). Sem ele a reprodução é exponencial e o tick
 * do notebook do professor vira o gargalo da aula.
 */
export const TETO_CURRAL = 12;
export const RAIO_CURRAL = 16;

export const BICHOS: Readonly<Record<TipoBicho, DefBicho>> = {
  vaca: {
    tipo: "vaca",
    nome: "vaca",
    artigo: "a",
    vidaMax: 10,
    largura: 0.9,
    altura: 1.4,
    velocidade: 1.2,
    velocidadeFuga: 3,
    meio: "terra",
    isca: [ITEM_TRIGO],
    biomas: ["cerrado", "mata", "araucárias"],
    pesoSpawn: 8,
    bando: [2, 4],
    drops: [
      { id: ITEM_CARNE_CRUA, min: 1, max: 3 },
      { id: ITEM_COURO, min: 0, max: 2 },
    ],
    reproduz: true,
    variantes: [
      { nome: "vaca malhada", cores: { corpo: "#f2efe6", detalhe: "#2b2622", acento: "#e8a8a0" } },
      { nome: "vaca caracu", cores: { corpo: "#b5733a", detalhe: "#8a5226", acento: "#e3b09a" }, biomas: ["cerrado", "araucárias"] },
      { nome: "vaca nelore", cores: { corpo: "#e9e6df", detalhe: "#b9b3a8", acento: "#3a3430" }, biomas: ["cerrado", "mata"] },
    ],
  },
  galinha: {
    tipo: "galinha",
    nome: "galinha",
    artigo: "a",
    vidaMax: 4,
    largura: 0.45,
    altura: 0.7,
    velocidade: 1.1,
    velocidadeFuga: 3.2,
    meio: "terra",
    // a semente do jogo é a plantação estágio 0 (`Plantacao0`): é ela que o
    // capim larga e que o aluno já carrega pra plantar
    isca: [BlockId.Plantacao0],
    biomas: ["cerrado", "mata", "araucárias", "caatinga"],
    pesoSpawn: 7,
    bando: [2, 4],
    drops: [
      { id: ITEM_FRANGO_CRU, min: 1, max: 1 },
      { id: ITEM_PENA, min: 0, max: 2 },
    ],
    reproduz: true,
    semDanoDeQueda: true,
    variantes: [
      { nome: "galinha branca", cores: { corpo: "#f4f2ec", detalhe: "#d8302c", acento: "#f0b030" } },
      { nome: "galinha carijó", cores: { corpo: "#7a7670", detalhe: "#d8302c", acento: "#f0b030" }, biomas: ["mata", "araucárias"] },
      { nome: "galinha caipira", cores: { corpo: "#a8552a", detalhe: "#d8302c", acento: "#e8b040" }, biomas: ["cerrado", "caatinga"] },
    ],
  },
  ovelha: {
    tipo: "ovelha",
    nome: "ovelha",
    artigo: "a",
    vidaMax: 8,
    largura: 0.9,
    altura: 1.3,
    velocidade: 1.1,
    velocidadeFuga: 3,
    meio: "terra",
    isca: [ITEM_TRIGO],
    biomas: ["cerrado", "araucárias"],
    pesoSpawn: 6,
    bando: [2, 4],
    // a lã cai à parte (só de ovelha NÃO tosquiada — ver `dropsDe`)
    drops: [{ id: ITEM_CARNE_CRUA, min: 1, max: 2 }],
    reproduz: true,
    variantes: [
      { nome: "ovelha branca", cores: { corpo: "#ecebe4", detalhe: "#d9c7b0", acento: "#3a302a" }, peso: 8, la: BlockId.LaBranca },
      { nome: "ovelha preta", cores: { corpo: "#2a2628", detalhe: "#1a1718", acento: "#3a302a" }, peso: 1, la: BlockId.LaPreta },
      { nome: "ovelha marrom", cores: { corpo: "#7a5636", detalhe: "#5c3f26", acento: "#3a302a" }, peso: 1, la: BlockId.LaMarrom },
      { nome: "ovelha cinza", cores: { corpo: "#8e8c8a", detalhe: "#6f6d6b", acento: "#3a302a" }, peso: 1, la: BlockId.LaCinza },
    ],
  },
  cao: {
    tipo: "cao",
    nome: "cão",
    artigo: "o",
    vidaMax: 8,
    largura: 0.6,
    altura: 0.85,
    velocidade: 1.6,
    velocidadeFuga: 4,
    meio: "terra",
    isca: [],
    biomas: ["cerrado", "mata", "araucárias", "caatinga"],
    pesoSpawn: 1,
    bando: [1, 2],
    drops: [],
    reproduz: false,
    domar: { itens: [ITEM_CARNE_CRUA, ITEM_FRANGO_CRU], chance: 1 / 3 },
    variantes: [
      { nome: "vira-lata caramelo", cores: { corpo: "#c98a3e", detalhe: "#e9c48a", acento: "#2a2220" }, peso: 3 },
      { nome: "vira-lata preto", cores: { corpo: "#262224", detalhe: "#4a4446", acento: "#121012" } },
      { nome: "vira-lata malhado", cores: { corpo: "#efe8dc", detalhe: "#5a4030", acento: "#2a2220" } },
    ],
  },
  gato: {
    tipo: "gato",
    nome: "gato",
    artigo: "o",
    vidaMax: 10,
    largura: 0.5,
    altura: 0.6,
    velocidade: 1.5,
    velocidadeFuga: 4.2,
    meio: "terra",
    isca: [ITEM_PEIXE_CRU],
    biomas: ["mata", "cerrado"],
    pesoSpawn: 1,
    bando: [1, 1],
    drops: [],
    reproduz: false,
    domar: { itens: [ITEM_PEIXE_CRU], chance: 1 / 3 },
    variantes: [
      { nome: "gato laranja", cores: { corpo: "#e08a3a", detalhe: "#b8642a", acento: "#f4d0a8" } },
      { nome: "gato preto", cores: { corpo: "#1e1c20", detalhe: "#2e2b30", acento: "#e8d84a" } },
      { nome: "gato rajado", cores: { corpo: "#8a8478", detalhe: "#4e4a44", acento: "#e8e2d4" } },
      { nome: "gato frajola", cores: { corpo: "#f2efe8", detalhe: "#222024", acento: "#f0a8b0" } },
    ],
  },
  tatu: {
    tipo: "tatu",
    nome: "tatu",
    artigo: "o",
    vidaMax: 12,
    largura: 0.6,
    altura: 0.55,
    velocidade: 1.0,
    velocidadeFuga: 2.5,
    meio: "terra",
    isca: [],
    biomas: ["caatinga", "cerrado"],
    pesoSpawn: 3,
    bando: [1, 2],
    drops: [],
    reproduz: false,
    variantes: [
      { nome: "tatu-bola", cores: { corpo: "#b89a6a", detalhe: "#8a7048", acento: "#e0c8a0" }, biomas: ["caatinga", "cerrado"] },
      { nome: "tatu-galinha", cores: { corpo: "#7c7468", detalhe: "#5a544a", acento: "#c8b8a0" }, biomas: ["cerrado"] },
    ],
  },
  peixe: {
    tipo: "peixe",
    nome: "peixe",
    artigo: "o",
    vidaMax: 3,
    largura: 0.5,
    altura: 0.35,
    velocidade: 1.4,
    velocidadeFuga: 3.5,
    meio: "agua",
    isca: [],
    // peixe nasce em ÁGUA de qualquer bioma; a lista decide a VARIANTE
    biomas: ["caatinga", "cerrado", "mata", "araucárias"],
    pesoSpawn: 0, // o sorteio do peixe é separado: depende de ter água, não de grama
    bando: [2, 4],
    drops: [{ id: ITEM_PEIXE_CRU, min: 1, max: 1 }],
    reproduz: false,
    variantes: [
      { nome: "lambari", cores: { corpo: "#c8d0d4", detalhe: "#e8b030", acento: "#3a4248" }, peso: 3 },
      { nome: "tambaqui", cores: { corpo: "#4a4a40", detalhe: "#c87838", acento: "#1e1e1a" }, biomas: ["mata"] },
      { nome: "tilápia", cores: { corpo: "#8a9290", detalhe: "#5a6462", acento: "#d0b8a8" }, biomas: ["cerrado", "caatinga"] },
      { nome: "pacu", cores: { corpo: "#a0a8a8", detalhe: "#d87840", acento: "#2a2e30" }, biomas: ["cerrado", "mata"] },
      { nome: "traíra", cores: { corpo: "#6a6248", detalhe: "#3e3a2a", acento: "#c8c0a0" }, biomas: ["araucárias", "mata"] },
    ],
  },
  arara: {
    tipo: "arara",
    nome: "arara",
    artigo: "a",
    vidaMax: 6,
    largura: 0.5,
    altura: 0.9,
    velocidade: 5,
    velocidadeFuga: 7,
    meio: "ar",
    isca: [ITEM_FRUTA],
    biomas: ["cerrado", "mata"],
    pesoSpawn: 2,
    bando: [1, 3],
    drops: [{ id: ITEM_PENA, min: 1, max: 2 }],
    reproduz: false,
    variantes: [
      { nome: "arara-azul", cores: { corpo: "#2848b8", detalhe: "#1a2c78", acento: "#f0d030" }, biomas: ["cerrado", "mata"], peso: 3 },
      { nome: "arara-vermelha", cores: { corpo: "#d02828", detalhe: "#2858c8", acento: "#f0d030" }, biomas: ["mata"] },
      { nome: "tucano", cores: { corpo: "#1a1a1e", detalhe: "#f4f0e0", acento: "#f08a20" }, biomas: ["mata"] },
      { nome: "papagaio", cores: { corpo: "#38a838", detalhe: "#f0d030", acento: "#e8e0c8" }, biomas: ["cerrado", "caatinga"] },
      { nome: "periquito", cores: { corpo: "#78c838", detalhe: "#4a9828", acento: "#f0a838" }, biomas: ["caatinga", "cerrado", "araucárias"] },
    ],
  },
};

/** Índice do tipo no fio/save (−1 = desconhecido). */
export function indiceDoTipo(tipo: TipoBicho): number {
  return TIPOS_BICHO.indexOf(tipo);
}

/** Tipo pelo índice do fio/save (null = byte inventado). */
export function tipoPorIndice(i: unknown): TipoBicho | null {
  return typeof i === "number" && Number.isInteger(i) ? (TIPOS_BICHO[i] ?? null) : null;
}

/** Variante válida pra este tipo? */
export function varianteExiste(tipo: TipoBicho, v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v < BICHOS[tipo].variantes.length;
}

/** Nome que o aluno lê: o da variante ("vira-lata caramelo"). */
export function nomeDoBicho(tipo: TipoBicho, variante: number): string {
  return BICHOS[tipo].variantes[variante]?.nome ?? BICHOS[tipo].nome;
}

/** Tipo pelo que o professor digita (`/bicho vaca`, `cão`, `cachorro`…). */
export function tipoPorNome(digitado: string): TipoBicho | null {
  const t = digitado
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  const APELIDOS: Record<string, TipoBicho> = {
    vaca: "vaca", boi: "vaca", galinha: "galinha", frango: "galinha", ovelha: "ovelha",
    carneiro: "ovelha", cao: "cao", cachorro: "cao", cadela: "cao", gato: "gato", gata: "gato",
    tatu: "tatu", peixe: "peixe", arara: "arara", passaro: "arara", ave: "arara",
  };
  if (APELIDOS[t]) return APELIDOS[t]!;
  // nome de variante também serve ("tucano", "lambari", "tatu-bola")
  for (const tipo of TIPOS_BICHO) {
    for (const v of BICHOS[tipo].variantes) {
      const n = v.nome.normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (n === t) return tipo;
    }
  }
  return null;
}

/** Variante pelo nome digitado (-1 = nenhuma casa). */
export function variantePorNome(tipo: TipoBicho, digitado: string): number {
  const t = digitado.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return BICHOS[tipo].variantes.findIndex(
    (v) => v.nome.normalize("NFD").replace(/[̀-ͯ]/g, "") === t,
  );
}

/** Variantes que nascem NESTE bioma (índices), com o peso de cada uma. */
export function variantesDoBioma(tipo: TipoBicho, bioma: string): { i: number; peso: number }[] {
  const def = BICHOS[tipo];
  const out: { i: number; peso: number }[] = [];
  def.variantes.forEach((v, i) => {
    const biomas = v.biomas ?? def.biomas;
    if ((biomas as readonly string[]).includes(bioma)) out.push({ i, peso: v.peso ?? 1 });
  });
  return out;
}

/** Sorteio ponderado — `r` em [0,1). Devolve o índice escolhido em `itens`. */
export function sortearPonderado(itens: readonly { peso: number }[], r: number): number {
  const total = itens.reduce((s, x) => s + x.peso, 0);
  if (total <= 0) return -1;
  let alvo = r * total;
  for (let i = 0; i < itens.length; i++) {
    alvo -= itens[i]!.peso;
    if (alvo < 0) return i;
  }
  return itens.length - 1;
}

/**
 * O que cai na mochila de quem matou. Filhote não dá nada (MC), e a ovelha
 * NÃO tosquiada dá também 1 bloco da lã dela — a tesoura é o jeito de pegar a
 * lã sem matar, e é isso que se quer que a criança descubra.
 */
export function dropsDoBicho(
  tipo: TipoBicho,
  variante: number,
  filhote: boolean,
  tosquiada: boolean,
  rand: () => number,
): { id: number; qtd: number }[] {
  if (filhote) return [];
  const def = BICHOS[tipo];
  const out: { id: number; qtd: number }[] = [];
  for (const d of def.drops) {
    const qtd = d.min + Math.floor(rand() * (d.max - d.min + 1));
    if (qtd > 0) out.push({ id: d.id, qtd });
  }
  const la = def.variantes[variante]?.la;
  if (la !== undefined && !tosquiada) out.push({ id: la, qtd: 1 });
  return out;
}

/** Quantos blocos de lã a tesoura tira (1 a 3, o número do Minecraft). */
export function laDaTosquia(rand: () => number): number {
  return 1 + Math.floor(rand() * 3);
}

/** Esta isca atrai/alimenta este tipo? */
export function ehIsca(tipo: TipoBicho, item: number): boolean {
  return BICHOS[tipo].isca.includes(item);
}

/**
 * FLAGS do bicho — o que o cliente precisa pra desenhar o ESTADO (silhueta,
 * não cor: a regra do projetor). Um inteiro só no fio.
 */
export const FLAG_BICHO = {
  filhote: 1,
  tosquiada: 2,
  sentado: 4,
  bola: 8,
  voando: 16,
  ovo: 32,
  domado: 64,
  ferido: 128,
  amor: 256,
  foraDagua: 512,
  /** Andando/nadando AGORA (o cliente balança as pernas/barbatana). */
  movendo: 1024,
} as const;

// ---------------------------------------------------------------------------
// Save (puro: o `save.ts` lê sem importar a sessão)
// ---------------------------------------------------------------------------

/** Um bicho no `.ljw`: campos curtos, prazos como TICKS RESTANTES (o relógio
 *  do tick recomeça a cada vez que o mundo abre). */
export interface BichoSalvo {
  t: number;
  v: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  vida: number;
  filhote?: number;
  tosquia?: number;
  leite?: number;
  /** Prazo do próximo ovo; −1 = o ovo já está pronto. */
  ovo?: number;
  descanso?: number;
  dono?: string;
  sentado?: boolean;
}

export interface BichosSalvos {
  natural: boolean;
  proximoId: number;
  lista: BichoSalvo[];
  povoadas?: number[];
}

/** Parse defensivo do save (entrada doente é PULADA, como o resto do `.ljw`). */
export function parseBichosSalvos(raw: unknown): BichosSalvos | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const fin = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
  const lista: BichoSalvo[] = [];
  if (Array.isArray(r["lista"])) {
    for (const e of r["lista"] as unknown[]) {
      if (typeof e !== "object" || e === null) continue;
      const o = e as Record<string, unknown>;
      const tipo = tipoPorIndice(o["t"]);
      if (!tipo || !varianteExiste(tipo, o["v"])) continue;
      if (![o["x"], o["y"], o["z"], o["vida"]].every(fin)) continue;
      const vida = Math.floor(o["vida"] as number);
      if (vida <= 0) continue;
      const s: BichoSalvo = {
        t: o["t"] as number,
        v: o["v"] as number,
        x: o["x"] as number,
        y: o["y"] as number,
        z: o["z"] as number,
        yaw: fin(o["yaw"]) ? (o["yaw"] as number) : 0,
        vida: Math.min(vida, BICHOS[tipo].vidaMax),
      };
      for (const k of ["filhote", "tosquia", "leite", "descanso"] as const) {
        if (fin(o[k]) && (o[k] as number) > 0) s[k] = Math.floor(o[k] as number);
      }
      if (fin(o["ovo"])) s.ovo = Math.floor(o["ovo"] as number);
      if (typeof o["dono"] === "string" && o["dono"]) s.dono = o["dono"];
      if (o["sentado"] === true) s.sentado = true;
      lista.push(s);
    }
  }
  const povoadas = Array.isArray(r["povoadas"])
    ? (r["povoadas"] as unknown[]).filter((n): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0)
    : [];
  return {
    natural: r["natural"] === true,
    proximoId: fin(r["proximoId"]) && (r["proximoId"] as number) >= 1 ? Math.floor(r["proximoId"] as number) : 1,
    lista,
    ...(povoadas.length ? { povoadas } : {}),
  };
}
