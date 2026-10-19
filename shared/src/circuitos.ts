import { BlockId } from "./blocks";

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
 * desligado — nunca o contrário —, então a conta só cresce e para sozinha em
 * no máximo um passo por célula. ⚠️ **No dia em que entrar a porta NÃO, isto
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

export function isAlavanca(id: number): boolean {
  return id === BlockId.AlavancaDesligada || id === BlockId.AlavancaLigada;
}

export function isFio(id: number): boolean {
  return id === BlockId.FioDesligado || id === BlockId.FioLigado;
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

export function isPortaE(id: number): boolean {
  return tipoDaPorta(id) === "E";
}

export function isPortaOU(id: number): boolean {
  return tipoDaPorta(id) === "OU";
}

/** Qualquer peça de circuito? (é o que o índice do servidor guarda). */
export function isCircuito(id: number): boolean {
  return isAlavanca(id) || isFio(id) || isLampada(id) || isPortaLogica(id);
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
  if (isAlavanca(id)) return id === BlockId.AlavancaLigada;
  if (isFio(id)) return id === BlockId.FioLigado;
  if (isLampada(id)) return id === BlockId.LampadaAcesa;
  const tipo = tipoDaPorta(id);
  if (tipo) return id - PORTAS[tipo].base >= 4; // as 4 ligadas vêm depois das 4 desligadas
  return false;
}

/** O MESMO bloco no outro estado — é o que a alavanca faz no clique e o que o
 *  motor escreve no tick. Devolve o próprio id se ele não tem dois estados. */
export function comEstado(id: number, ligado: boolean): number {
  if (isAlavanca(id)) return ligado ? BlockId.AlavancaLigada : BlockId.AlavancaDesligada;
  if (isFio(id)) return ligado ? BlockId.FioLigado : BlockId.FioDesligado;
  if (isLampada(id)) return ligado ? BlockId.LampadaAcesa : BlockId.LampadaApagada;
  const tipo = tipoDaPorta(id);
  if (tipo) {
    const direcao = (id - PORTAS[tipo].base) % 4;
    return PORTAS[tipo].base + direcao + (ligado ? 4 : 0);
  }
  return id;
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
 * A conta é um ponto fixo começando do TUDO DESLIGADO, e não do estado atual:
 * sem isso, desligar a alavanca deixaria o fio aceso pra sempre, porque cada
 * pedaço continuaria achando que o vizinho o alimenta — o laço que a gente
 * chamaria de "sinal preso" na aula. Recomeçar do zero resolve isso sem
 * precisar rastrear quem alimenta quem.
 */
export function recalcularCircuitos(
  mundo: MundoDeCircuito,
  celulas: Iterable<Celula>,
): MudancaDeCircuito[] {
  const pecas = new Map<string, { c: Celula; id: number }>();
  for (const c of celulas) {
    const id = mundo.bloco(c.x, c.y, c.z);
    if (isCircuito(id)) pecas.set(chave(c.x, c.y, c.z), { c, id });
  }
  if (pecas.size === 0) return [];

  /** Quem está energizado AGORA, na conta (não no mundo). */
  const energizado = new Set<string>();
  /** A alavanca é a única fonte que o aluno controla; ela entra ligada da vez. */
  for (const [k, p] of pecas) {
    if (isAlavanca(p.id) && estaLigado(p.id)) energizado.add(k);
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

  /** A saída de uma porta lógica energiza só a célula da FRENTE. */
  const saidaDaPorta = (c: Celula, frente: Direcao): string =>
    chave(c.x + PASSO[frente].dx, c.y, c.z + PASSO[frente].dz);

  // Ponto fixo monótono: cada passo só ACENDE. Para quando um passo não acende
  // mais nada — e no pior caso isso leva uma volta por peça (ver o cabeçalho:
  // vale enquanto não houver NEGAÇÃO).
  for (let volta = 0; volta <= pecas.size; volta++) {
    let acendeu = false;
    for (const [k, p] of pecas) {
      if (energizado.has(k)) continue;
      if (isAlavanca(p.id)) continue; // fonte: só o aluno liga
      const tipo = tipoDaPorta(p.id);
      if (tipo) {
        const frente = frenteDaPorta(p.id);
        if (!frente) continue;
        // As DUAS entradas são as laterais; o que muda de uma porta pra outra é
        // só a REGRA (`LIGA`): "as duas entregam" na E, "alguma entrega" na OU.
        // A tabela-verdade de cada uma sai inteira daqui.
        const entradas = LADOS[frente].map((lado) =>
          entrega(chave(p.c.x + PASSO[lado].dx, p.c.y, p.c.z + PASSO[lado].dz)),
        );
        if (LIGA[tipo](entradas)) {
          energizado.add(k);
          acendeu = true;
        }
        continue;
      }
      // fio e lâmpada: qualquer vizinho de face que ENTREGUE serve…
      for (const d of VIZINHOS) {
        const v = chave(p.c.x + d.x, p.c.y + d.y, p.c.z + d.z);
        const viz = pecas.get(v);
        if (!viz || !entrega(v)) continue;
        // …com UMA exceção: porta lógica só entrega pela frente. Pela lateral ou
        // por trás ela é entrada, não saída — sem isto o sinal voltaria pela
        // própria entrada e a porta ligaria sozinha.
        const frenteViz = frenteDaPorta(viz.id);
        if (frenteViz && saidaDaPorta(viz.c, frenteViz) !== k) continue;
        energizado.add(k);
        acendeu = true;
        break;
      }
    }
    if (!acendeu) break;
  }

  const mudancas: MudancaDeCircuito[] = [];
  for (const [k, p] of pecas) {
    const alvo = comEstado(p.id, energizado.has(k));
    if (alvo !== p.id) mudancas.push({ x: p.c.x, y: p.c.y, z: p.c.z, blockId: alvo });
  }
  return mudancas;
}
