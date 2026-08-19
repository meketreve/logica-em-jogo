/**
 * §🏁 MAPA DE CORRIDA (`aula7-corrida.ljw`) — 2026-08-04.
 *
 * Uma pista fechada com 4 POSTOS em ordem. Não é aula de construir: é aula de
 * **sequência** — o objetivo do HUD mostra UM posto por vez (modo sequencial),
 * e o posto seguinte só aparece quando a equipe fecha o atual. O aluno não
 * escolhe a ordem; ele descobre que existe uma.
 *
 * **Por que "aula7-" no nome:** arquivo que começa com "aula" é MUNDO DE AULA
 * (`ehMundoDeAula` em server/src/paths.ts) — read-only e reutilizável: cada
 * turma recebe a pista intacta, nada da turma anterior é salvo, e o
 * confinamento nasce ligado, o que aqui é exatamente o que se quer (ninguém
 * cava atalho na pista; o professor, sim, continua podendo consertar).
 *
 * **Os 3 primeiros postos são `um`** (basta um da equipe chegar: alguém corre
 * na frente e destrava) **e a CHEGADA é `todos`** — a equipe só vence com todo
 * mundo dentro. É a decisão de aula da frente: quem chegou primeiro volta a
 * buscar quem ficou, e a corrida deixa de premiar só o mais rápido.
 *
 * A pista é construída com os MESMOS comandos do professor (`/regiao criar` +
 * `/regiao encher`, `/bloco`, `quadro_set`) — ver `autoria.ts`.
 */
import {
  BlockId,
  CHUNK_SIZE,
  FLAT_SURFACE_Y,
  GameSession,
  type World,
  decodeSave,
  encodeSave,
  getBlock,
} from "@logica/shared";
import { Autoria, type Vec } from "./autoria";

export const ARQUIVO_CORRIDA = "aula7-corrida.ljw";
export const TITULO_CORRIDA = "A corrida dos 4 postos";
const SEED = 20260804;

/** Chão do mundo plano; o corredor pisa em `PISO + 1`. */
const PISO = FLAT_SURFACE_Y;
const PE = PISO + 1;
/**
 * Altura das paredes acima do piso. **5, e não 3, por causa da ESCADA:** o
 * patamar dela deixa o corredor de pé em PE+3, e com parede de 3 o aluno
 * saltaria do patamar pro alto do muro e sairia andando por cima da pista.
 * (O verificador pegaria de qualquer jeito — a BFS anda por onde o jogador
 * anda —, mas o número certo é este.)
 */
const PAREDE_H = 5;

/** Meia-largura do corredor reto: 7 células de piso (centro ± 3). */
const RAIO_A = 3;
/** Meia-largura do trecho largo (serpentina e chegada): 13 células. */
const RAIO_B = 6;
/** Deslocamento em z do corredor de VOLTA em relação ao de ida. */
const VOLTA_DZ = 18;

const {
  Sandstone: PISTA,
  StoneBricks: PAREDE,
  BlocoAlgodaoBranco: BRANCO,
  BlocoAlgodaoPreto: PRETO,
  BlocoAlgodaoVerde: POSTO,
  BlocoAlgodaoVermelho: OBSTACULO,
  BlocoAlgodaoAzul: MURO,
  BlocoAlgodaoAmarelo: PODIO,
  Planks: PONTE,
  Dirt: FUNDO,
} = BlockId;
const AR = BlockId.Air;

/**
 * A SERPENTINA (trecho 4): 6 paredes atravessadas com uma passagem alternando
 * de lado. Sem bifurcação de propósito — não é labirinto de adivinhar, é
 * caminho de percorrer, e para o 2º ano a diferença entre "não tem atalho" e
 * "escolhi errado" é o que separa insistir de desistir. Cada entrada é o
 * deslocamento em z da PASSAGEM (a partir do centro do corredor largo).
 */
const SERPENTINA: readonly number[] = [5, -5, 5, -5, 5, -5];

/** Enunciado de cada posto, na ordem. O servidor corta em 120 chars. */
const POSTOS = [
  "POSTO 1: suba a escada e desca do outro lado. Chegue na faixa VERDE.",
  "POSTO 2: atravesse a ponte estreita sobre o vao. Caiu? Suba pela rampa e volte.",
  "POSTO 3: desvie dos muros vermelhos em ziguezague ate a faixa VERDE da curva.",
  "CHEGADA: passe a serpentina. A equipe so vence com TODO MUNDO no podio.",
] as const;

const PLACAS = [
  "CORRIDA — 4 postos, nesta ordem. O quadro do canto da tela mostra so o POSTO ATUAL: o proximo aparece quando este fechar.",
  "ESCADA — suba os 3 degraus e desca do outro lado. Nao da pra contornar.",
  "O VAO — a ponte tem 1 bloco de largura. Quem cai nao perde nada alem de tempo: a rampa do fim devolve pra pista.",
  "ZIGUEZAGUE — os muros vermelhos alternam de lado. Nao ha atalho: o caminho e o desvio.",
  "SERPENTINA — 6 paredes, uma passagem em cada. Quem chegar primeiro, volte a buscar a equipe: a chegada so conta com TODOS dentro.",
] as const;

export interface OpcoesCorrida {
  grupos: number;
  codigo: string;
}

/** Caixa fechada [a,b] em qualquer ordem de cantos. */
interface Caixa {
  a: Vec;
  b: Vec;
}

/**
 * Preenche uma caixa com um id. Usa `/regiao criar` + `/regiao encher` + apagar
 * — o caminho do professor, e o único barato: `/bloco` célula a célula numa
 * pista deste tamanho seriam dezenas de milhares de comandos. O nome da região
 * é reciclado (`obra`) pra não estourar o teto de 64 regiões do mundo.
 */
function encher(a: Autoria, { a: p, b: q }: Caixa, id: number): void {
  a.regiao("obra", p, q);
  a.cmd(`/regiao encher obra ${id}`, "alterado(s)");
  a.cmd("/regiao apagar obra", "apagada");
}

/** Piso da pista + paredes dos dois lados, de x0 a x1, centrado em zc. */
function corredor(a: Autoria, x0: number, x1: number, zc: number, raio: number): void {
  encher(a, { a: { x: x0, y: PISO, z: zc - raio }, b: { x: x1, y: PISO, z: zc + raio } }, PISTA);
  // ar acima do piso: mundo plano não tem nada aí, mas a curva reaproveita
  // faixas já ocupadas por parede — limpar deixa a junção sem tampão
  encher(
    a,
    { a: { x: x0, y: PE, z: zc - raio }, b: { x: x1, y: PE + PAREDE_H - 1, z: zc + raio } },
    AR,
  );
  for (const dz of [-raio - 1, raio + 1]) {
    encher(
      a,
      { a: { x: x0, y: PE, z: zc + dz }, b: { x: x1, y: PE + PAREDE_H - 1, z: zc + dz } },
      PAREDE,
    );
  }
}

/** Faixa listada (largada/chegada) atravessando o corredor. */
function faixa(a: Autoria, x: number, zc: number, raio: number): void {
  for (let z = zc - raio; z <= zc + raio; z++) {
    a.bloco(x, PISO, z, (z - zc) % 2 === 0 ? BRANCO : PRETO);
  }
}

/**
 * Placa de instrução: dois blocos de pedra e um quadro na frente deles, virado
 * pra quem vem correndo. Mesmo truque da aula 6 — `quadro_set` exige ALCANCE,
 * então o autor chega perto antes (o `a.quadro` cuida disso).
 */
function placa(a: Autoria, x: number, z: number, texto: string, olhandoPara: "-x" | "+x"): void {
  const atras = olhandoPara === "-x" ? x + 1 : x - 1;
  a.bloco(atras, PE, z, PAREDE);
  a.bloco(atras, PE + 1, z, PAREDE);
  a.quadro(x, PE + 1, z, olhandoPara === "-x" ? BlockId.QuadroXN : BlockId.QuadroXP, texto);
}

/**
 * Faixa VERDE de um posto + a região homônima (a caixa que o `chegar` observa).
 * A caixa é dada em PISO (o piso que se pinta de verde) e a região sobe daí:
 * o jogador é detectado pelo bloco dos PÉS, e quem passa correndo pode estar no
 * ar — a altura da parede não deixa o posto escapar por baixo de um pulo.
 *
 * ⚠️ **Um posto tem de atravessar a pista de parede a parede.** Se sobrar
 * passagem ao lado, existe rota que fecha a corrida sem passar por ele — foi
 * assim que o posto 3 nasceu errado, na diagonal da curva.
 */
function posto(a: Autoria, nome: string, c: Caixa): void {
  encher(a, { a: { ...c.a, y: PISO }, b: { ...c.b, y: PISO } }, POSTO);
  a.regiao(
    nome,
    { ...c.a, y: PE },
    { ...c.b, y: PE + PAREDE_H - 1 },
  );
}

/** Constrói a pista inteira e devolve o save. */
export function gerarCorrida(o: OpcoesCorrida): ArrayBuffer {
  // mundo PLANO: a pista tem de ser legível de longe, e serra atrapalha corrida
  const dims = { x: 8, z: 6, y: 4 };
  const a = new Autoria({ dims, preset: "plano", seed: SEED, codigo: o.codigo });
  a.entrar(o.codigo);
  a.afastar(1.5, 30, 1.5); // fora da obra: célula com jogador dentro é pulada

  const sp = a.session.spawn;
  const x0 = Math.floor(sp.x);
  const zc = Math.floor(sp.z); // centro do corredor de IDA (a largada é no spawn)
  const zv = zc + VOLTA_DZ; // centro do corredor de VOLTA (largo)
  const xFim = x0 + 58; // ponta da curva
  const world = a.session.world;
  if (xFim + 2 >= world.sizeX || zv + RAIO_B + 2 >= world.sizeZ || zc - RAIO_A - 2 < 0) {
    throw new Error(
      `a pista não cabe no mundo ${world.sizeX}×${world.sizeZ} a partir do spawn (${x0}, ${zc})`,
    );
  }

  // --- corredor de IDA (largada → curva) e de VOLTA (serpentina → chegada) ---
  corredor(a, x0 - 4, xFim, zc, RAIO_A);
  corredor(a, x0 - 4, xFim, zv, RAIO_B);
  // curva: abre a ligação entre os dois corredores na ponta +x (o trecho vira
  // uma peça só, então as paredes internas daquele pedaço têm de sair)
  encher(
    a,
    { a: { x: xFim - 6, y: PISO, z: zc - RAIO_A }, b: { x: xFim, y: PISO, z: zv + RAIO_B } },
    PISTA,
  );
  encher(
    a,
    {
      a: { x: xFim - 6, y: PE, z: zc - RAIO_A },
      b: { x: xFim, y: PE + PAREDE_H - 1, z: zv + RAIO_B },
    },
    AR,
  );
  // e a parede externa da curva (+x) fecha a volta
  encher(
    a,
    {
      a: { x: xFim + 1, y: PE, z: zc - RAIO_A - 1 },
      b: { x: xFim + 1, y: PE + PAREDE_H - 1, z: zv + RAIO_B + 1 },
    },
    PAREDE,
  );

  // FUNDO DA PISTA: as duas pontas -x são FECHADAS. Sem esta parede o corredor
  // desemboca na grama do mundo plano e existe rota da largada até a chegada
  // por fora, sem passar por posto nenhum — o verificador achou exatamente isso
  // na primeira geração.
  for (const [z, raio] of [[zc, RAIO_A], [zv, RAIO_B]] as const) {
    encher(
      a,
      {
        a: { x: x0 - 5, y: PE, z: z - raio - 1 },
        b: { x: x0 - 5, y: PE + PAREDE_H - 1, z: z + raio + 1 },
      },
      PAREDE,
    );
  }

  // --- LARGADA (no spawn) ---
  faixa(a, x0, zc, RAIO_A);
  placa(a, x0 + 2, zc - RAIO_A, PLACAS[0], "-x");

  // --- trecho 1: ESCADA (3 degraus pra cima, 3 pra baixo) ---
  placa(a, x0 + 5, zc - RAIO_A, PLACAS[1], "-x");
  for (let d = 1; d <= 3; d++) {
    // degrau: sobe 1 por coluna de x, atravessando o corredor inteiro
    encher(
      a,
      { a: { x: x0 + 7 + d, y: PE, z: zc - RAIO_A }, b: { x: x0 + 7 + d, y: PE + d - 1, z: zc + RAIO_A } },
      PISTA,
    );
  }
  encher(
    a,
    { a: { x: x0 + 11, y: PE, z: zc - RAIO_A }, b: { x: x0 + 12, y: PE + 2, z: zc + RAIO_A } },
    PISTA,
  ); // patamar do topo
  for (let d = 3; d >= 1; d--) {
    encher(
      a,
      { a: { x: x0 + 16 - d, y: PE, z: zc - RAIO_A }, b: { x: x0 + 16 - d, y: PE + d - 1, z: zc + RAIO_A } },
      PISTA,
    );
  }

  // --- POSTO 1 ---
  posto(a, "posto1", {
    a: { x: x0 + 18, y: PISO, z: zc - RAIO_A },
    b: { x: x0 + 19, y: PISO, z: zc + RAIO_A },
  });

  // --- trecho 2: O VÃO com ponte de 1 bloco ---
  placa(a, x0 + 21, zc - RAIO_A, PLACAS[2], "-x");
  const vaoA = x0 + 23;
  const vaoB = x0 + 33;
  // ⚠️ CAVAR DUAS camadas (PISO e PISO−1). Tirar só o piso deixaria um degrau de
  // 1 bloco — o mundo plano é maciço logo abaixo —, e degrau de 1 se sobe
  // andando: o "vão" não custaria nada e a rampa não teria pra que existir.
  // Com 2 de fundura a saída passa a depender MESMO da rampa, e é isso que a
  // conferência exige (ela reprova a pista se o buraco virar armadilha).
  encher(
    a,
    { a: { x: vaoA, y: PISO - 1, z: zc - RAIO_A }, b: { x: vaoB, y: PISO, z: zc + RAIO_A } },
    AR,
  );
  encher(
    a,
    { a: { x: vaoA, y: PISO - 2, z: zc - RAIO_A }, b: { x: vaoB, y: PISO - 2, z: zc + RAIO_A } },
    FUNDO,
  ); // fundo do vão, 2 abaixo da pista
  encher(a, { a: { x: vaoA, y: PISO, z: zc }, b: { x: vaoB, y: PISO, z: zc } }, PONTE); // a ponte
  // RAMPA de volta pra quem caiu: dois degraus de 1 no fim do vão, DOS DOIS
  // LADOS. Uma rampa só não serve: a ponte passa por cima do meio do buraco, e
  // uma célula do fundo debaixo dela não tem 2 de ar — o fundo fica partido em
  // duas metades que não se falam, e quem cai do lado errado fica preso. Foi a
  // conferência que achou isso; a rampa espelhada é o conserto.
  for (const lado of [1, -1]) {
    a.bloco(vaoB, PISO - 1, zc + 2 * lado, PISTA);
    a.bloco(vaoB, PISO, zc + 3 * lado, PISTA);
  }

  // --- POSTO 2 ---
  posto(a, "posto2", {
    a: { x: x0 + 35, y: PISO, z: zc - RAIO_A },
    b: { x: x0 + 36, y: PISO, z: zc + RAIO_A },
  });

  // --- trecho 3: ZIGUEZAGUE (muros alternando de lado) ---
  placa(a, x0 + 38, zc - RAIO_A, PLACAS[3], "-x");
  for (let m = 0; m < 4; m++) {
    const x = x0 + 40 + m * 3;
    // muro cobre 5 das 7 faixas, deixando 2 livres — alternando o lado aberto
    const de = m % 2 === 0 ? zc - RAIO_A : zc - RAIO_A + 2;
    encher(
      a,
      { a: { x, y: PE, z: de }, b: { x, y: PE + PAREDE_H - 1, z: de + 4 } },
      OBSTACULO,
    );
  }

  // --- POSTO 3: BANDA ATRAVESSADA na curva ---
  // A curva é o único lugar por onde se passa do corredor estreito pro largo,
  // e ali o corredor vira em +z — então o posto é uma faixa de z constante
  // cobrindo a curva inteira em x. Uma faixa vertical (como a dos postos 1 e 2)
  // deixaria passar por fora, e a corrida fecharia sem ele.
  posto(a, "posto3", {
    a: { x: xFim - 6, y: PISO, z: zc + Math.floor(VOLTA_DZ / 2) },
    b: { x: xFim, y: PISO, z: zc + Math.floor(VOLTA_DZ / 2) + 1 },
  });

  // --- trecho 4: SERPENTINA (no corredor largo, correndo de volta em -x) ---
  placa(a, xFim - 10, zv - RAIO_B + 1, PLACAS[4], "+x");
  SERPENTINA.forEach((passagem, i) => {
    const x = xFim - 14 - i * 6;
    // parede inteira, menos 3 faixas de passagem no deslocamento pedido
    encher(
      a,
      { a: { x, y: PE, z: zv - RAIO_B }, b: { x, y: PE + PAREDE_H - 1, z: zv + RAIO_B } },
      MURO,
    );
    encher(
      a,
      {
        a: { x, y: PE, z: zv + passagem - 1 },
        b: { x, y: PE + PAREDE_H - 1, z: zv + passagem + 1 },
      },
      AR,
    );
  });

  // --- CHEGADA: faixa listada + pódio de 3 degraus ---
  faixa(a, x0 + 2, zv, RAIO_B);
  posto(a, "chegada", {
    a: { x: x0 - 2, y: PISO, z: zv - RAIO_B },
    b: { x: x0 - 1, y: PISO, z: zv + RAIO_B },
  });
  for (let d = 0; d < 3; d++) {
    encher(
      a,
      {
        a: { x: x0 - 4, y: PE, z: zv - 1 + d },
        b: { x: x0 - 4, y: PE + (2 - d), z: zv - 1 + d },
      },
      PODIO,
    );
  }

  // --- equipes, objetivos e o céu parado ---
  a.afastar(1.5, 30, 1.5);
  a.cmd(`/grupo criar ${o.grupos}`, `${o.grupos} grupo(s) criados`);
  a.cmd("/objetivo modo sequencial", "Modo do cenário: sequencial");
  a.cmd(`/objetivo add chegar posto1 um ${POSTOS[0]}`, "criado: chegar em");
  a.cmd(`/objetivo add chegar posto2 um ${POSTOS[1]}`, "criado: chegar em");
  a.cmd(`/objetivo add chegar posto3 um ${POSTOS[2]}`, "criado: chegar em");
  a.cmd(`/objetivo add chegar chegada todos ${POSTOS[3]}`, "criado: chegar em");
  // dia parado: a pista tem de estar legível do começo ao fim da aula
  a.cmd("/hora meio-dia", "Hora ajustada");
  a.cmd("/ciclo desligar", "Ciclo de dia e noite parado");

  // roster VAZIO: o `.ljw` não viaja com o PIN nem o papel do autor de mentira.
  // Quem entrar com o código vira professor; alunos registram PIN na 1ª entrada.
  return encodeSave(a.session.world, { ...a.session.toSave(), roster: [] });
}

// ---------------------------------------------------------------------------
// Conferência: a pista é COMPLETÁVEL?
// ---------------------------------------------------------------------------

/** Uma célula onde um jogador cabe de pé: chão sólido embaixo e 2 de ar. */
function podePisar(w: World, x: number, y: number, z: number): boolean {
  return (
    getBlock(w, x, y - 1, z) !== AR &&
    getBlock(w, x, y, z) === AR &&
    getBlock(w, x, y + 1, z) === AR
  );
}

/**
 * Caminho andável da largada até a chegada, por busca em largura sobre as
 * células do mundo — subindo ou descendo NO MÁXIMO 1 por passo, que é o que a
 * física do jogo faz (step-up automático; pulo maior não é exigido em lugar
 * nenhum da pista de propósito).
 *
 * É esta função que prova que a pista é jogável: se ela devolver `null`, o
 * arquivo NÃO é gravado. Uma parede fechada por engano, um vão sem ponte ou uma
 * passagem esquecida na serpentina param aqui, e não na frente da turma.
 */
function chaveDe(w: World, v: Vec): number {
  return (v.y * w.sizeZ + v.z) * w.sizeX + v.x;
}

/** Tudo que se alcança a pé a partir de `de`, com o passo de quem vem. */
function alcancaveis(w: World, de: Vec): Map<number, Vec | null> {
  const anterior = new Map<number, Vec | null>([[chaveDe(w, de), null]]);
  const fila: Vec[] = [de];
  const VIZINHOS = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
  ] as const;
  while (fila.length) {
    const atual = fila.shift() as Vec;
    for (const [dx, dz] of VIZINHOS) {
      for (const dy of [0, 1, -1]) {
        const v = { x: atual.x + dx, y: atual.y + dy, z: atual.z + dz };
        if (v.x < 0 || v.z < 0 || v.y < 1 || v.x >= w.sizeX || v.z >= w.sizeZ) continue;
        if (!podePisar(w, v.x, v.y, v.z)) continue;
        const k = chaveDe(w, v);
        if (anterior.has(k)) continue;
        anterior.set(k, atual);
        fila.push(v);
      }
    }
  }
  return anterior;
}

function caminho(w: World, de: Vec, para: Vec): Vec[] | null {
  const anterior = alcancaveis(w, de);
  if (!anterior.has(chaveDe(w, para))) return null;
  const rota: Vec[] = [];
  for (let p: Vec | null = para; p; p = anterior.get(chaveDe(w, p)) ?? null) rota.push(p);
  return rota.reverse();
}

/** Centro do piso de um posto — o ponto que a BFS tem de alcançar. */
function alvoDe(o: { min: Vec; max: Vec }): Vec {
  return { x: o.min.x, y: o.min.y, z: Math.floor((o.min.z + o.max.z) / 2) };
}

/**
 * TODAS as células do fundo do vão em que um jogador para de pé — varridas pela
 * forma do mundo (qualquer lugar ABAIXO do nível da pista, nas colunas logo
 * atrás do posto 2), não por coordenada escrita à mão. Assim, mexer no vão no
 * gerador não deixa esta conferência mentindo.
 */
function fundoDoVao(w: World, posto2: { min: Vec; max: Vec }): Vec[] {
  const fundo: Vec[] = [];
  for (let x = posto2.min.x - 1; x > posto2.min.x - 20; x--) {
    for (let z = posto2.min.z; z <= posto2.max.z; z++) {
      for (let y = posto2.min.y - 1; y >= 2; y--) {
        if (podePisar(w, x, y, z)) fundo.push({ x, y, z });
      }
    }
  }
  return fundo;
}

interface EstadoObjetivo {
  id: number;
  texto: string;
  completo: boolean;
  porGrupo?: { grupo: number; completo: boolean }[];
}

/**
 * Abre o `.ljw` num servidor NOVO, entra como professora e como uma aluna, e
 * CORRE a pista inteira mandando `move` ao longo do caminho que a BFS achou —
 * exigindo que os 4 postos fechem NA ORDEM. É o análogo do `verificar.ts` das
 * aulas de construir: cenário que não é jogável não vira arquivo.
 */
export function conferirCorrida(buf: ArrayBuffer, o: OpcoesCorrida): string[] {
  const problemas: string[] = [];
  const exigir = (cond: boolean, msg: string): void => {
    if (!cond) problemas.push(msg);
  };

  const save = decodeSave(buf);
  exigir(save.roster.length === 0, "o save carrega identidade do autor (roster devia estar vazio)");
  exigir(save.grupos?.length === o.grupos, `esperava ${o.grupos} equipes no save`);
  exigir(save.cenario?.modo === "sequencial", "a corrida devia estar em modo sequencial");
  const objetivos = save.cenario?.objetivos ?? [];
  exigir(objetivos.length === 4, `esperava 4 postos, save tem ${objetivos.length}`);
  exigir(
    objetivos.every((ob) => ob.kind === "chegar"),
    "todo posto da corrida tem de ser objetivo do tipo chegar",
  );
  exigir(
    objetivos.at(-1)?.regra === "todos",
    "a CHEGADA devia exigir a equipe inteira (regra todos)",
  );
  exigir(
    objetivos.slice(0, 3).every((ob) => ob.regra === "um"),
    "os 3 primeiros postos deviam bastar UM integrante (regra um)",
  );
  if (problemas.length) return problemas;

  // a pista tem de ser andável da largada até dentro da caixa da chegada
  const largada = {
    x: Math.floor(save.spawn.x),
    y: Math.floor(save.spawn.y),
    z: Math.floor(save.spawn.z),
  };
  const alvo = alvoDe(objetivos.at(-1)!);
  exigir(podePisar(save.world, largada.x, largada.y, largada.z), "não dá pra ficar de pé na largada");
  const rota = caminho(save.world, largada, alvo);
  if (!rota) {
    problemas.push("a pista NÃO é completável: não há caminho andável da largada até a chegada");
    return problemas;
  }

  // A PLACA DO VÃO PROMETE que quem cai volta pela rampa. Promessa de aula é
  // contrato: se a rampa não devolver pra pista, o aluno fica preso num buraco
  // no meio da corrida e só sai com o professor teleportando. Então a mesma BFS
  // sai do FUNDO do vão e tem de alcançar o posto 2.
  const fundo = fundoDoVao(save.world, objetivos[1]!);
  if (!fundo.length) {
    problemas.push("não achei o fundo do vão (a pista mudou de forma?)");
  } else {
    // uma BFS só, a partir do posto: o passo é simétrico (sobe 1, desce 1),
    // então "o posto alcança a célula" é o mesmo que "a célula alcança o posto"
    const daPista = alcancaveis(save.world, alvoDe(objetivos[1]!));
    const presos = fundo.filter((c) => !daPista.has(chaveDe(save.world, c)));
    if (presos.length) {
      const p = presos[0]!;
      problemas.push(
        `quem cai no vão fica PRESO em ${presos.length} célula(s) — a primeira é (${p.x}, ${p.y}, ${p.z})`,
      );
    }
  }

  const msgs = new Map<number, Record<string, unknown>[]>();
  const s = new GameSession(
    (id, data) => {
      if (typeof data !== "string") return;
      const lista = msgs.get(id) ?? [];
      lista.push(JSON.parse(data) as Record<string, unknown>);
      msgs.set(id, lista);
    },
    { restore: save, codigo: o.codigo },
  );
  const send = (id: number, m: unknown): void => s.handleMessage(id, JSON.stringify(m));
  const ultima = <T>(id: number, tipo: string): T | undefined =>
    msgs.get(id)?.filter((m) => m["type"] === tipo).at(-1) as T | undefined;

  send(1, { type: "join", name: "profa", pin: "1234", codigo: o.codigo });
  send(2, { type: "join", name: "ana", pin: "1111" });
  exigir(
    ultima<{ papel?: string }>(1, "spawn")?.papel === "professor",
    "quem entra com o código não virou professor",
  );

  const estados = (): EstadoObjetivo[] =>
    ultima<{ objetivos: EstadoObjetivo[] }>(2, "objectives")?.objetivos ?? [];
  const fechados = (): number =>
    estados().filter((ob) => ob.porGrupo?.find((g) => g.grupo === 1)?.completo).length;
  exigir(fechados() === 0, "a corrida já nasce com posto fechado");
  const visiveis = estados().filter((ob) => ob.texto).length;
  exigir(visiveis > 0, "a aluna não recebeu o enunciado do posto");

  // a ana CORRE: uma mensagem de move por célula do caminho, como o cliente a 10 Hz
  let ordem = 0;
  for (const p of rota) {
    send(2, { type: "move", x: p.x + 0.5, y: p.y, z: p.z + 0.5, yaw: 0, pitch: 0 });
    const n = fechados();
    if (n > ordem) {
      exigir(n === ordem + 1, `dois postos fecharam no mesmo passo (${ordem} → ${n})`);
      ordem = n;
    }
  }
  exigir(
    ordem === 4,
    `a aluna correu a pista inteira e fechou ${ordem} de 4 postos (a ordem trava o resto)`,
  );
  const fala = msgs.get(2)?.filter((m) => m["type"] === "chat").at(-1)?.["text"];
  exigir(/conclu/i.test(String(fala ?? "")), "o chat não anunciou a conclusão pra aluna");
  return problemas;
}

/** Passos da pista, pro log do gerador (e pro roteiro do professor). */
export function resumoCorrida(buf: ArrayBuffer): string {
  const save = decodeSave(buf);
  const chunks = save.world.sizeX / CHUNK_SIZE;
  return `${save.cenario?.objetivos.length ?? 0} postos · mundo plano ${chunks}×${
    save.world.sizeZ / CHUNK_SIZE
  } chunks`;
}
