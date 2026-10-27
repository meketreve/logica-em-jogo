import { BlockId, isPorta } from "./blocks";

/**
 * §🔌 CIRCUITOS LÓGICOS (2026-10-16) — o motor de sinal.
 *
 * É a razão de ser do projeto ("Lógica em jogo") e o primeiro uso dos ids
 * ≥ 256 que os 16 bits de 2026-09-12 abriram. O 1º lote tem quatro peças, que
 * é o mínimo que já ENSINA em vez de só acender uma luz:
 *
 *   alavanca (entrada) → fio (condutor) → porta E (regra) → lâmpada (saída)
 *
 * Módulo PURO, no molde do `fornalha.ts`: entra o mundo e a lista de células
 * de circuito, sai a lista de blocos a trocar. Sem rede, sem relógio de parede
 * e sem I/O — o mesmo motor roda no Worker do singleplayer, no .exe do
 * professor e no Node dedicado, e o teste fixa tudo sem esperar.
 *
 * **COMO O SINAL ANDA** (decisão do usuário, 2026-10-16: "1 e 2" — fio E
 * blocos encostados):
 *  - quem ENERGIZA é a alavanca ligada e a SAÍDA de uma porta E ligada;
 *  - o fio conduz pra qualquer vizinho de face (6 direções, inclusive em pé);
 *  - **encostar funciona sem fio nenhum**: alavanca colada na lâmpada acende.
 *    O fio existe pra ESPALHAR o circuito pela mesa, que é o que deixa a
 *    lógica visível — não pra ser obrigatório;
 *  - a conta roda uma vez por TICK, então a mudança aparece no tick seguinte.
 *    Fio comprido não atrasa mais que fio curto: travessia por célula fica pra
 *    quando houver o que ela resolva (um atraso que o aluno queira usar).
 *
 * **POR QUE DÁ PRA RODAR ATÉ ESTABILIZAR, sem medo de travar:** com alavanca,
 * fio e porta E não existe NEGAÇÃO. Tudo que o passo faz é LIGAR o que estava
 * desligado — nunca o contrário —, então a conta só cresce, cada peça acende
 * no máximo uma vez e a fila que leva o sinal (`recalcularCircuitos`) esvazia
 * sozinha. ⚠️ **No dia em que entrar a porta NÃO, isto
 * deixa de valer** (um NÃO ligado em si mesmo oscila pra sempre) e o motor vai
 * precisar de estado por tick de verdade, não de ponto fixo. Está escrito aqui
 * porque é o tipo de coisa que se descobre com o servidor travado numa aula.
 */

/** A FRENTE de uma porta E (pra onde sai o resultado). */
export type Direcao = "XP" | "ZP" | "XN" | "ZN";

/** Deslocamento de cada direção. */
const PASSO: Record<Direcao, { dx: number; dz: number }> = {
  XP: { dx: 1, dz: 0 },
  ZP: { dx: 0, dz: 1 },
  XN: { dx: -1, dz: 0 },
  ZN: { dx: 0, dz: -1 },
};

/** As duas ENTRADAS de uma porta E: as laterais perpendiculares à frente. */
const LADOS: Record<Direcao, Direcao[]> = {
  XP: ["ZP", "ZN"],
  XN: ["ZP", "ZN"],
  ZP: ["XP", "XN"],
  ZN: ["XP", "XN"],
};

/** As quatro direções, na ORDEM dos ids (frente XP, ZP, XN, ZN). */
const DIRECOES = ["XP", "ZP", "XN", "ZN"] as const;

/** Que porta lógica é esta? A regra de cada uma está em `LIGA`, abaixo. */
export type TipoDePorta = "E" | "OU";

/**
 * As portas, por TABELA — e é a tabela que define tudo.
 *
 * Cada porta ocupa 8 ids consecutivos a partir de `base`: as 4 direções
 * DESLIGADAS, depois as 4 LIGADAS (`base + 4 + direção`). Porta nova entra
 * aqui e em `LIGA`, e nada mais no motor muda: foi assim que a OU entrou em
 * 2026-10-19 sem um `if` novo em lugar nenhum. (A alternativa — um `isPortaX`
 * por tipo — vira duas listas do mesmo conjunto, que é o bug esperando a
 * próxima peça.)
 */
const PORTAS: Record<TipoDePorta, { base: number }> = {
  E: { base: BlockId.PortaEXPDesligada },
  OU: { base: BlockId.PortaOUXPDesligada },
};

/**
 * A REGRA de cada porta, e a única diferença entre a E e a OU: `every` × `some`
 * sobre as DUAS entradas laterais. É esta linha que a aula inteira ensina.
 */
const LIGA: Record<TipoDePorta, (entradas: boolean[]) => boolean> = {
  E: (entradas) => entradas.every(Boolean),
  OU: (entradas) => entradas.some(Boolean),
};

/**
 * §🔌 A FACE em que uma peça rasteira se cola (2026-10-23).
 *
 * "piso" é a de sempre (a lâmina no chão da célula, o pino em pé); as outras
 * cinco são o pedido dele de parede e teto. O nome é o lado da CÉLULA onde
 * está o apoio: `XP` está grudada na parede do lado +x e aponta pra −x.
 */
export type FaceDaPeca = "piso" | "XP" | "ZP" | "XN" | "ZN" | "teto";

/** As 5 faces novas, NA ORDEM DOS IDS (`FioXPDesligado` em diante). O piso fica
 *  fora porque o par dele é mais antigo e mora em outro trecho da numeração. */
export const FACES_DE_PECA = ["XP", "ZP", "XN", "ZN", "teto"] as const;

/**
 * As duas famílias de peça rasteira, por TABELA — e é a tabela que define tudo,
 * como `PORTAS` fez pelas portas lógicas.
 *
 * `piso` é o par antigo (desligado, ligado = +1) e `faces` é o começo do bloco
 * de 10 ids novos: para a i-ésima face de `FACES_DE_PECA`, desligado =
 * `faces + 2*i` e ligado = esse +1. Peça rasteira nova (um botão de parede, um
 * repetidor) entra aqui e em `blocks.ts`, e nem o motor nem o mesher mudam.
 */
const RASTEIRAS = {
  fio: { piso: BlockId.FioDesligado, faces: BlockId.FioXPDesligado },
  alavanca: { piso: BlockId.AlavancaDesligada, faces: BlockId.AlavancaXPDesligada },
} as const;

type FamiliaRasteira = keyof typeof RASTEIRAS;

/** A família deste id (ou null): a pergunta que `isFio`/`isAlavanca` fazem. */
function familiaRasteira(id: number): FamiliaRasteira | null {
  for (const nome of Object.keys(RASTEIRAS) as FamiliaRasteira[]) {
    const f = RASTEIRAS[nome];
    if (id === f.piso || id === f.piso + 1) return nome;
    if (id >= f.faces && id < f.faces + FACES_DE_PECA.length * 2) return nome;
  }
  return null;
}

export function isAlavanca(id: number): boolean {
  return familiaRasteira(id) === "alavanca";
}

export function isFio(id: number): boolean {
  return familiaRasteira(id) === "fio";
}

/** Peça rasteira (fio ou alavanca), de qualquer face. */
export function ehRasteira(id: number): boolean {
  return familiaRasteira(id) !== null;
}

/** A face em que esta peça está colada — null se o id não é peça rasteira. */
export function faceDaPeca(id: number): FaceDaPeca | null {
  const nome = familiaRasteira(id);
  if (!nome) return null;
  const f = RASTEIRAS[nome];
  if (id === f.piso || id === f.piso + 1) return "piso";
  return FACES_DE_PECA[(id - f.faces) >> 1] ?? null;
}

/**
 * A MESMA peça colada em outra face, mantendo o estado.
 *
 * É o que a orientação chama na hora de colocar (a mochila guarda a peça do
 * piso, e a face sai do GESTO — a cara do clique), e é o caminho de ida do
 * `formaCanonica`, que traz tudo de volta pro piso.
 */
export function comFace(id: number, face: FaceDaPeca): number {
  const nome = familiaRasteira(id);
  if (!nome) return id;
  const f = RASTEIRAS[nome];
  const ligado = estaLigado(id) ? 1 : 0;
  if (face === "piso") return f.piso + ligado;
  const i = FACES_DE_PECA.indexOf(face);
  return i < 0 ? id : f.faces + i * 2 + ligado;
}

/**
 * A face em que a peça vai se colar, dada a NORMAL da face clicada (o
 * `target.n*` do cliente, que aponta do bloco mirado pra célula nova).
 *
 * A peça cola no lado por onde está o bloco clicado, que é o OPOSTO da normal:
 * clicar no TOPO de um bloco põe a peça no piso da célula de cima (o gesto de
 * sempre), e clicar na parede põe na parede. Função pura aqui porque é a mesma
 * pergunta no clique do mouse e no dedo.
 */
export function faceDoClique(nx: number, ny: number, nz: number): FaceDaPeca {
  if (ny > 0) return "piso";
  if (ny < 0) return "teto";
  if (nx > 0) return "XN"; // nasceu a +x do bloco → o apoio está a −x dela
  if (nx < 0) return "XP";
  if (nz > 0) return "ZN";
  if (nz < 0) return "ZP";
  return "piso"; // normal zerada (não acontece pelo clique): o chão é o padrão
}

/** Pra onde a peça rasteira APONTA (o oposto da face em que ela se cola): é por
 *  aqui que sai o punho da alavanca e o poste do fio. */
export function normalDaFace(face: FaceDaPeca): { dx: number; dy: number; dz: number } {
  switch (face) {
    case "piso": return { dx: 0, dy: 1, dz: 0 };
    case "teto": return { dx: 0, dy: -1, dz: 0 };
    case "XP": return { dx: -1, dy: 0, dz: 0 };
    case "XN": return { dx: 1, dy: 0, dz: 0 };
    case "ZP": return { dx: 0, dy: 0, dz: -1 };
    case "ZN": return { dx: 0, dy: 0, dz: 1 };
  }
}

export function isLampada(id: number): boolean {
  return id === BlockId.LampadaApagada || id === BlockId.LampadaAcesa;
}

/** O tipo da porta neste id, ou null se o id não é porta lógica. */
export function tipoDaPorta(id: number): TipoDePorta | null {
  for (const tipo of Object.keys(PORTAS) as TipoDePorta[]) {
    const base = PORTAS[tipo].base;
    if (id >= base && id < base + 8) return tipo;
  }
  return null;
}

/** Qualquer porta lógica (E, OU, …). */
export function isPortaLogica(id: number): boolean {
  return tipoDaPorta(id) !== null;
}

/**
 * §🔌 PLACA DE PRESSÃO: entrada acionada pelo CORPO (2026-10-19).
 *
 * Do ponto de vista do motor ela é uma alavanca — fonte, entrega e não recebe.
 * A diferença mora fora daqui: quem troca o byte dela é o tick da sessão,
 * comparando a posição dos jogadores com a célula, e não o clique do aluno. O
 * motor continua PURO: ele lê o byte e não sabe de onde veio.
 */
export function isPlaca(id: number): boolean {
  return id === BlockId.PlacaDesligada || id === BlockId.PlacaLigada;
}

export function isPortaE(id: number): boolean {
  return tipoDaPorta(id) === "E";
}

export function isPortaOU(id: number): boolean {
  return tipoDaPorta(id) === "OU";
}

/** Qualquer peça de circuito? (é o que o índice do servidor guarda). */
export function isCircuito(id: number): boolean {
  return isAlavanca(id) || isFio(id) || isLampada(id) || isPortaLogica(id) || isPlaca(id);
}

/** A direção da FRENTE de uma porta lógica (por onde sai o resultado). */
export function frenteDaPorta(id: number): Direcao | null {
  const tipo = tipoDaPorta(id);
  if (!tipo) return null;
  return DIRECOES[(id - PORTAS[tipo].base) % 4] ?? null;
}

/** O id BASE (desligado, frente XP) da porta deste id — o que o drop devolve e
 *  o que a mochila guarda: direção e estado são escolha do mundo, não do item. */
export function baseDaPorta(id: number): number | null {
  const tipo = tipoDaPorta(id);
  return tipo ? PORTAS[tipo].base : null;
}

/** A peça está LIGADA/ACESA agora? (o estado mora no id) */
export function estaLigado(id: number): boolean {
  // peça rasteira: o ligado é sempre o id ÍMPAR do par, em toda face (é a
  // regularidade que a numeração de 2026-10-23 existe pra garantir)
  if (ehRasteira(id)) return id % 2 === 1;
  if (isPlaca(id)) return id === BlockId.PlacaLigada;
  if (isLampada(id)) return id === BlockId.LampadaAcesa;
  const tipo = tipoDaPorta(id);
  if (tipo) return id - PORTAS[tipo].base >= 4; // as 4 ligadas vêm depois das 4 desligadas
  return false;
}

/** O MESMO bloco no outro estado — é o que a alavanca faz no clique e o que o
 *  motor escreve no tick. Devolve o próprio id se ele não tem dois estados. */
export function comEstado(id: number, ligado: boolean): number {
  // peça rasteira: troca o bit baixo do par e a FACE fica onde está
  if (ehRasteira(id)) return (id - (id % 2)) + (ligado ? 1 : 0);
  if (isPlaca(id)) return ligado ? BlockId.PlacaLigada : BlockId.PlacaDesligada;
  if (isLampada(id)) return ligado ? BlockId.LampadaAcesa : BlockId.LampadaApagada;
  const tipo = tipoDaPorta(id);
  if (tipo) {
    const direcao = (id - PORTAS[tipo].base) % 4;
    return PORTAS[tipo].base + direcao + (ligado ? 4 : 0);
  }
  return id;
}

/**
 * A LIGAÇÃO entre um condutor (fio ou lâmpada) e a peça vizinha, vista da
 * célula do condutor. `d` é o deslocamento até o vizinho.
 *
 * ⚠️ **Esta é a ÚNICA definição de "conecta" do projeto**, e é de propósito: o
 * motor decide por ela quem energiza quem, e o mesher desenha o braço do fio
 * por ela. Fossem duas funções, o desenho divergiria da topologia na primeira
 * peça nova — e o aluno veria um fio ligado onde o sinal não passa, que é o
 * pior defeito possível num jogo cujo produto é ENXERGAR a lógica.
 *
 * - alavanca: entrega, não recebe (é fonte);
 * - fio: os dois lados;
 * - lâmpada: recebe e não repassa (senão viraria fio e não daria pra fechar o
 *   circuito num ponto só) — e a PORTA de passagem, idem;
 * - porta lógica: entrega SÓ pela frente e recebe SÓ pelas duas laterais. Pelas
 *   costas não há ligação nenhuma — e é essa a casa que a porta NÃO vai ocupar
 *   quando existir (entrada na traseira, oposta à frente).
 */
export function ligacaoDoCondutor(
  idVizinho: number,
  dx: number,
  dy: number,
  dz: number,
): { recebe: boolean; entrega: boolean } {
  const nada = { recebe: false, entrega: false };
  // fontes: entregam e não recebem. A placa é uma alavanca que o PÉ aciona.
  if (isAlavanca(idVizinho) || isPlaca(idVizinho)) return { recebe: true, entrega: false };
  if (isFio(idVizinho)) return { recebe: true, entrega: true };
  if (isLampada(idVizinho)) return { recebe: false, entrega: true };
  // §🔌 a PORTA de passagem (2026-10-27) é saída como a lâmpada: recebe de
  // qualquer lado e não repassa. Não é peça de circuito (não mora no índice),
  // mas o braço do fio até ela TEM de aparecer — é o aluno vendo que o fio
  // chega na porta.
  if (isPorta(idVizinho)) return { recebe: false, entrega: true };
  const frente = frenteDaPorta(idVizinho);
  if (!frente) return nada;
  if (dy !== 0) return nada; // porta só fala com o plano dela
  // o condutor está, visto DA PORTA, no deslocamento oposto
  const deDentro = { dx: -dx, dz: -dz };
  const saida = PASSO[frente];
  if (saida.dx === deDentro.dx && saida.dz === deDentro.dz) {
    return { recebe: true, entrega: false }; // o condutor está NA FRENTE dela
  }
  for (const lado of LADOS[frente]) {
    const p = PASSO[lado];
    if (p.dx === deDentro.dx && p.dz === deDentro.dz) {
      return { recebe: false, entrega: true }; // o condutor é ENTRADA dela
    }
  }
  return nada; // as costas
}

/**
 * A peça vizinha ENTREGA sinal a esta célula AGORA? (estado + topologia)
 *
 * É o que o mesher pergunta pra acender cada PINO DE ENTRADA da porta: o aluno
 * vê, na própria peça, qual das duas entradas já chegou — a linha da
 * tabela-verdade desenhada no bloco. Como o estado mora no id, isto é função
 * pura dos bytes e o mesher responde sem falar com o motor.
 */
export function vizinhoEntrega(idVizinho: number, dx: number, dy: number, dz: number): boolean {
  if (!estaLigado(idVizinho)) return false;
  return ligacaoDoCondutor(idVizinho, dx, dy, dz).recebe;
}

/** As duas direções de ENTRADA de uma porta (as laterais da frente dela). */
export function entradasDaPorta(id: number): Direcao[] {
  const frente = frenteDaPorta(id);
  return frente ? [...LADOS[frente]] : [];
}

/** O deslocamento de uma direção — o mesher precisa dele pra desenhar o pino. */
export function passoDe(d: Direcao): { dx: number; dz: number } {
  return PASSO[d];
}

/** O condutor e o vizinho trocam sinal? (é o que o mesher desenha) */
export function conectaCondutor(idVizinho: number, dx: number, dy: number, dz: number): boolean {
  const l = ligacaoDoCondutor(idVizinho, dx, dy, dz);
  return l.recebe || l.entrega;
}

/** O mundo, como o motor precisa dele: só ler uma célula. */
export interface MundoDeCircuito {
  bloco(x: number, y: number, z: number): number;
}

export interface Celula {
  x: number;
  y: number;
  z: number;
}

export interface MudancaDeCircuito extends Celula {
  blockId: number;
}

const VIZINHOS: readonly Celula[] = [
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: -1, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
];

const chave = (x: number, y: number, z: number): string => `${x},${y},${z}`;

/**
 * Recalcula o circuito inteiro a partir das células que o servidor indexou e
 * devolve SÓ o que mudou de estado (o chamador troca os blocos e avisa a rede).
 *
 * A conta começa do TUDO DESLIGADO, e não do estado atual: sem isso, desligar
 * a alavanca deixaria o fio aceso pra sempre, porque cada pedaço continuaria
 * achando que o vizinho o alimenta — o laço que a gente chamaria de "sinal
 * preso" na aula. Recomeçar do zero resolve isso sem precisar rastrear quem
 * alimenta quem.
 *
 * **O sinal ANDA a partir das fontes** (2026-10-26), por uma fila: só quem
 * acabou de acender faz os vizinhos se perguntarem se acendem também. Cada
 * peça acende uma vez só e olha seus 6 vizinhos, então a conta é LINEAR no
 * tamanho do circuito. Antes era um ponto fixo que varria TODAS as peças a
 * cada volta, e um fio na ordem ruim levava uma volta por pedaço — quadrático:
 * ~28 ms por tick num fio de 400. O resultado é o mesmo (é o MENOR conjunto
 * aceso que se sustenta, e com só-acender a ordem não muda o fim), e um teste
 * confere os dois motores em circuitos sorteados.
 */
export function recalcularCircuitos(
  mundo: MundoDeCircuito,
  celulas: Iterable<Celula>,
): MudancaDeCircuito[] {
  return propagarSinal(mundo, celulas).mudancas;
}

/**
 * O motor inteiro: as peças que mudam E as células de PORTA de passagem que o
 * sinal alcança (2026-10-27, pedido dele: "permitir que o sinal controle o
 * estado de aberto ou fechado da porta").
 *
 * A porta não é peça de circuito e não mora no índice — ela é achada aqui como
 * VIZINHA de quem entrega sinal, pela mesma `ligacaoDoCondutor` que acende a
 * lâmpada. Por isso vale tudo que acende lâmpada: alavanca ou placa encostada,
 * fio, a frente de uma porta E/OU. O motor só diz QUEM TEM SINAL; abrir,
 * fechar, o par de células e o vão ocupado são da sessão, que tem o mundo e
 * os jogadores.
 */
export function propagarSinal(
  mundo: MundoDeCircuito,
  celulas: Iterable<Celula>,
): { mudancas: MudancaDeCircuito[]; portasComSinal: Celula[] } {
  const pecas = new Map<string, { c: Celula; id: number }>();
  for (const c of celulas) {
    const id = mundo.bloco(c.x, c.y, c.z);
    if (isCircuito(id)) pecas.set(chave(c.x, c.y, c.z), { c, id });
  }
  if (pecas.size === 0) return { mudancas: [], portasComSinal: [] };
  /** Células de porta alcançadas (chave → célula), sem repetir. */
  const portas = new Map<string, Celula>();

  /** Quem está energizado AGORA, na conta (não no mundo). */
  const energizado = new Set<string>();
  /** Quem acendeu e ainda não avisou os vizinhos. */
  const fila: string[] = [];
  const acender = (k: string): void => {
    energizado.add(k);
    fila.push(k);
  };
  /** As FONTES (alavanca e placa) entram já ligadas, se estiverem. */
  for (const [k, p] of pecas) {
    if ((isAlavanca(p.id) || isPlaca(p.id)) && estaLigado(p.id)) acender(k);
  }

  /** Uma célula ENTREGA sinal aos vizinhos? */
  const entrega = (k: string): boolean => {
    const p = pecas.get(k);
    if (!p) return false;
    // a lâmpada CONSOME: ela acende e não repassa, senão ela viraria fio e o
    // aluno não teria como fechar um circuito num ponto só
    if (isLampada(p.id)) return false;
    return energizado.has(k);
  };

  // `fila` cresce enquanto é lida; o índice evita o `shift`, que é O(n).
  for (let i = 0; i < fila.length; i++) {
    const origem = fila[i]!;
    if (!entrega(origem)) continue; // lâmpada acesa: não acorda ninguém
    const o = pecas.get(origem)!;
    for (const d of VIZINHOS) {
      const k = chave(o.c.x + d.x, o.c.y + d.y, o.c.z + d.z);
      const p = pecas.get(k);
      if (!p) {
        // fora do índice: só interessa se for PORTA que esta origem alimenta
        // (vista da porta, a origem está no deslocamento oposto a `d`)
        const v = { x: o.c.x + d.x, y: o.c.y + d.y, z: o.c.z + d.z };
        if (
          !portas.has(k) &&
          isPorta(mundo.bloco(v.x, v.y, v.z)) &&
          ligacaoDoCondutor(o.id, -d.x, -d.y, -d.z).recebe
        ) {
          portas.set(k, v);
        }
        continue;
      }
      if (energizado.has(k)) continue;
      if (isAlavanca(p.id) || isPlaca(p.id)) continue; // fontes: quem liga é o aluno
      const tipo = tipoDaPorta(p.id);
      if (tipo) {
        const frente = frenteDaPorta(p.id);
        if (!frente) continue;
        // As DUAS entradas são as laterais; o que muda de uma porta pra outra é
        // só a REGRA (`LIGA`): "as duas entregam" na E, "alguma entrega" na OU.
        // A tabela-verdade de cada uma sai inteira daqui. A porta é perguntada
        // de novo a cada vizinho que acende, então a E acende quando chega a
        // SEGUNDA entrada, venha ela na ordem que vier.
        const entradas = LADOS[frente].map((lado) =>
          entrega(chave(p.c.x + PASSO[lado].dx, p.c.y, p.c.z + PASSO[lado].dz)),
        );
        if (LIGA[tipo](entradas)) acender(k);
        continue;
      }
      // fio e lâmpada: acendem se a ORIGEM entrega pra eles — e quem decide se
      // há ligação é a `ligacaoDoCondutor`, a MESMA que o mesher usa pra
      // desenhar o braço. Desenho e topologia não podem divergir. Vista da
      // peça `k`, a origem está no deslocamento OPOSTO a `d`.
      if (ligacaoDoCondutor(o.id, -d.x, -d.y, -d.z).recebe) acender(k);
    }
  }

  const mudancas: MudancaDeCircuito[] = [];
  for (const [k, p] of pecas) {
    const alvo = comEstado(p.id, energizado.has(k));
    if (alvo !== p.id) mudancas.push({ x: p.c.x, y: p.c.y, z: p.c.z, blockId: alvo });
  }
  return { mudancas, portasComSinal: [...portas.values()] };
}
