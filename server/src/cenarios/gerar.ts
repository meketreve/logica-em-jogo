/**
 * Gerador dos cenários pedagógicos (.ljw) — MVP v2 em uso real.
 *
 * Roda os MESMOS comandos de chat que o professor digitaria DENTRO do jogo
 * contra uma GameSession real, e grava o save. Não existe caminho de autoria
 * privado aqui: se um cenário não sai destes comandos, ele também não sai da
 * mão do professor — e isso é atrito pra corrigir no motor, não bug do script.
 * (Única exceção: o CONTEÚDO dos quadros da aula 6 entra por `quadro_set`,
 * a mesma mensagem que o clique direito do professor manda no jogo.)
 *
 * Desde 2026-07-19 a área do grupo é uma CAIXA (dx×dy×dz): a faixa 1D das
 * aulas 1-3 virou caso particular; a aula 5 usa parede 2D e a aula 6 um plano
 * 3×3 com móveis direcionais.
 *
 * uso: npm run cenarios -- [--grupos 5] [--codigo prof2026] [--revelar] [--saida cenarios]
 *   --revelar  deixa o gabarito à vista na cabine do professor (vira tarefa de
 *              CÓPIA — anos iniciais). Sem a flag, o gabarito é fotografado e
 *              apagado: o aluno tem que inferir a regra (6º–9º).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BlockId,
  CHUNK_SIZE,
  FLAT_SURFACE_Y,
  GameSession,
  type SessionOptions,
  decodeSave,
  encodeSave,
} from "@logica/shared";
import { conferir } from "./verificar";

const AUTOR_ID = 1;
const AUTOR_NOME = "autor";
const SEED = 20260714;

/** Canto da área do grupo: à frente da cabine (lado aberto = +x). */
const FAIXA_Y = FLAT_SURFACE_Y + 1; // em cima da grama
const FAIXA_DX = 8; // a cabine acaba em ox+4; 8 deixa a área na parte aberta
const FAIXA_DZ = 2; // recuo dentro do chunk (cabine ocupa z 0..4)
/** Profundidade máxima (z) sem vazar pro chunk vizinho. */
const FAIXA_MAX = CHUNK_SIZE - FAIXA_DZ - 1;
/** Largura máxima (x) da área — extras (parede de quadros) podem ir além. */
const LARGURA_MAX = CHUNK_SIZE - FAIXA_DX;

/** Um "professor" de mentira: digita comando e EXIGE a resposta certa do servidor. */
class Autoria {
  readonly session: GameSession;
  /** Um comando pode gerar VÁRIAS falas do servidor (ex.: /grupo criar avisa e depois lista). */
  private respostas: string[] = [];

  constructor(opts: SessionOptions) {
    this.session = new GameSession((id, data) => {
      if (id !== AUTOR_ID || typeof data !== "string") return;
      const m = JSON.parse(data) as { type?: string; author?: string; text?: string };
      if (m.type === "chat" && m.author === "servidor" && typeof m.text === "string") {
        this.respostas.push(m.text);
      }
    }, opts);
  }

  private send(msg: unknown): void {
    this.session.handleMessage(AUTOR_ID, JSON.stringify(msg));
  }

  entrar(codigo: string): void {
    this.send({ type: "join", name: AUTOR_NOME, pin: "0000", codigo });
  }

  /** Tira o autor do caminho: célula com jogador dentro é PULADA ao colocar bloco. */
  afastar(x: number, y: number, z: number): void {
    this.send({ type: "move", x, y, z, yaw: 0, pitch: 0 });
  }

  cmd(texto: string, esperado: string): void {
    this.respostas = [];
    this.send({ type: "chat", text: texto });
    if (!this.respostas.some((r) => r.includes(esperado))) {
      throw new Error(
        `comando "${texto}" não fez o esperado\n` +
          `  esperava conter: "${esperado}"\n` +
          `  servidor disse:  ${this.respostas.map((r) => `"${r}"`).join(" | ") || "(nada)"}`,
      );
    }
  }

  bloco(x: number, y: number, z: number, id: number): void {
    this.cmd(`/bloco ${x} ${y} ${z} ${id}`, `definido como ${id}.`);
  }

  regiao(nome: string, a: Vec, b: Vec): void {
    this.send({ type: "wand_mark", corner: 1, ...a });
    this.send({ type: "wand_mark", corner: 2, ...b });
    this.cmd(`/regiao criar ${nome}`, `Região "${nome}" criada`);
  }

  /** Quadro com conteúdo (aula 6): coloca o bloco e escreve o texto —
   *  `quadro_set` exige ALCANCE, então o autor chega perto antes. */
  quadro(x: number, y: number, z: number, id: number, texto: string): void {
    this.bloco(x, y, z, id);
    this.afastar(x - 2, y, z + 0.5);
    this.send({ type: "quadro_set", x, y, z, texto });
  }
}

interface Vec {
  x: number;
  y: number;
  z: number;
}

interface Cenario {
  arquivo: string;
  titulo: string;
  /** Pilar do pensamento computacional que a tarefa exercita (vai pro roteiro). */
  pilar: string;
  /** Enunciado do objetivo (o servidor corta em 120 chars). */
  texto: string;
  /** Tamanho da área-alvo: colunas (x), altura (y), profundidade (z). */
  area: { dx: number; dy: number; dz: number };
  /** Sequência CERTA na célula relativa (i,j,k) — é o que o objetivo fotografa. */
  gabarito: (i: number, j: number, k: number) => number;
  /**
   * O que já nasce na área de CADA grupo. 0 = ar. É a pista (aula 1), o vazio
   * (aulas 2/4/6) ou o estado com erros (aulas 3/5). NUNCA pode ser igual ao
   * gabarito — objetivo que já nasce completo é recusado.
   */
  partida: (i: number, j: number, k: number) => number;
  /** Decoração FORA da área-alvo (dica cifrada, quadros-manual) — 1× por
   *  grupo, com a origem (canto min) da área daquele grupo. */
  extras?: (a: Autoria, origem: Vec) => void;
  /** Conferência extra do save gerado (ex.: aula 6 exige os quadros). */
  conferirExtra?: (buf: ArrayBuffer, grupos: number) => string[];
}

const { WoolRed: R, WoolBlue: B, WoolYellow: Y, WoolWhite: W, WoolBlack: K } = BlockId;
const AR = BlockId.Air;

/** Repete um trecho até dar `n` células — a "regra" da sequência, escrita uma vez só. */
const repetir = (padrao: number[], n: number): number[] =>
  Array.from({ length: n }, (_, i) => padrao[i % padrao.length] as number);

/** 45 em 8 bits (00101101), do bit mais significativo pro menos: branco=0, preto=1. */
const bits = (valor: number, largura: number): number[] =>
  Array.from({ length: largura }, (_, i) => ((valor >> (largura - 1 - i)) & 1 ? K : W));

/** Faixa 1D ao longo de z (as aulas 1-3 são o caso particular da caixa). */
const linha = (arr: number[]) => ({
  area: { dx: 1, dy: 1, dz: arr.length },
  fn: (_i: number, _j: number, k: number): number => arr[k] ?? AR,
});

/** Bloco-letra do caractere (A..Z). */
const letra = (ch: string): number => BlockId.LetterA + (ch.charCodeAt(0) - 65);

// --- aula 4: decifrar (glifos) ---
const PALAVRA = "LOGICA";
/** A mesma palavra com cada letra ADIANTADA em 1 (cifra de César +1). */
const CIFRADA = [...PALAVRA].map((c) => String.fromCharCode(65 + (c.charCodeAt(0) - 65 + 1) % 26)).join("");

// --- aula 5: coração simétrico 7 (z) × 6 (y); linha 0 = TOPO da parede ---
const CORACAO = [
  "0110110",
  "1111111",
  "1111111",
  "0111110",
  "0011100",
  "0001000",
] as const;
const coracaoEm = (j: number, k: number): number =>
  (CORACAO[CORACAO.length - 1 - j] ?? "")[k] === "1" ? R : W;
/** 4 células trocadas SEM as espelhadas — quebra a simetria em 4 pontos. */
const ERROS: readonly (readonly [number, number])[] = [[3, 0], [0, 5], [4, 1], [1, 6]];

// --- aula 6: sala de móveis 3×3 (mesa no centro, cadeiras viradas pra ela) ---
const SALA: Record<string, number> = {
  "0,0": BlockId.TapeteAzul, "2,0": BlockId.TapeteAzul,
  "0,2": BlockId.TapeteAzul, "2,2": BlockId.TapeteAzul,
  "1,1": BlockId.Mesa,
  "0,1": BlockId.CadeiraXP, "2,1": BlockId.CadeiraXN,
  "1,0": BlockId.CadeiraZP, "1,2": BlockId.CadeiraZN,
};
const PASSOS = [
  "PASSO 1 — tapete AZUL nos 4 cantos da área.",
  "PASSO 2 — mesa exatamente no CENTRO.",
  "PASSO 3 — 4 cadeiras, uma em cada lado, todas viradas PRA mesa.",
] as const;

const aula1 = linha(repetir([R, B, B], 12));
const aula1partida = linha([...repetir([R, B, B], 4), ...Array<number>(8).fill(AR)]);
const aula2 = linha(bits(45, 8));
const aula3 = linha(repetir([R, Y, B, B], 12));
const aula3partida = linha(repetir([R, Y, B, B], 12).map((b, i) => (i === 5 ? B : i === 9 ? R : b)));
const aula4 = linha([...PALAVRA].map(letra));

const CENARIOS: Cenario[] = [
  {
    arquivo: "aula1-sequencia.ljw",
    titulo: "Continue a regra",
    pilar: "reconhecimento de padrão + generalização",
    area: aula1.area,
    gabarito: aula1.fn,
    // pista: só os 4 primeiros. 4 termos (R B B R) já obrigam a ver o período 3
    // — quem chuta "alterna uma a uma" erra na 3ª célula e o contador denuncia.
    partida: aula1partida.fn,
    texto:
      "Continue a regra ate completar os 12 blocos da sua faixa. Os 4 primeiros ja estao la.",
  },
  {
    arquivo: "aula2-binario.ljw",
    titulo: "Escreva 45 em binário",
    pilar: "abstração + representação",
    area: aula2.area,
    gabarito: aula2.fn,
    partida: () => AR,
    texto:
      "Escreva 45 em binario com 8 blocos: branco=0, preto=1. Comece pelo bit de maior valor (128).",
  },
  {
    arquivo: "aula3-depurar.ljw",
    titulo: "Ache os 2 erros",
    pilar: "depuração (testar hipótese contra a regra)",
    area: aula3.area,
    gabarito: aula3.fn,
    // mesma sequência com 2 células trocadas — o aluno não constrói, ele CORRIGE
    partida: aula3partida.fn,
    texto: "Ha 2 erros nesta sequencia. Ache e corrija — a regra se repete a cada 4 blocos.",
  },
  {
    arquivo: "aula4-decifrar.ljw",
    titulo: "Decifre a mensagem",
    pilar: "representação + decodificação (cifra de César)",
    area: aula4.area,
    gabarito: aula4.fn,
    partida: () => AR,
    texto:
      "Decifre: cada letra da mensagem ao lado vale a letra ANTERIOR do alfabeto. Escreva a palavra decifrada aqui.",
    // a mensagem CIFRADA fica à vista, colada na área (coluna x-1) — é dica, não alvo
    extras: (a, o) => {
      [...CIFRADA].forEach((ch, k) => a.bloco(o.x - 1, o.y, o.z + k, letra(ch)));
    },
  },
  {
    arquivo: "aula5-simetria.ljw",
    titulo: "Conserte o desenho",
    pilar: "decomposição + depuração com invariante (simetria)",
    area: { dx: 1, dy: CORACAO.length, dz: (CORACAO[0] ?? "").length },
    gabarito: (_i, j, k) => coracaoEm(j, k),
    // o coração com 4 células trocadas — nenhuma com a espelhada trocada junto,
    // então TODA troca quebra a simetria e a regra do enunciado denuncia
    partida: (_i, j, k) => {
      if (ERROS.some(([ej, ek]) => ej === j && ek === k)) {
        return coracaoEm(j, k) === R ? W : R;
      }
      return coracaoEm(j, k);
    },
    texto:
      "A parede devia ser um coracao SIMETRICO (esquerda = espelho da direita). Ha 4 celulas erradas — conserte.",
  },
  {
    arquivo: "aula6-manual.ljw",
    titulo: "Siga o manual",
    pilar: "seguir algoritmo (instruções em passos, ordem e precisão)",
    area: { dx: 3, dy: 1, dz: 3 },
    gabarito: (i, _j, k) => SALA[`${i},${k}`] ?? AR,
    partida: () => AR,
    texto:
      "Monte a sala seguindo os 3 quadros na parede. Capricho: ate a DIRECAO das cadeiras conta.",
    // parede de pedra com os 3 quadros-manual, atrás da área (lado +x),
    // de frente pros alunos (QuadroXN olha pra -x)
    extras: (a, o) => {
      PASSOS.forEach((passo, t) => {
        a.bloco(o.x + 4, o.y, o.z + t, BlockId.Stone);
        a.bloco(o.x + 4, o.y + 1, o.z + t, BlockId.Stone);
        a.quadro(o.x + 3, o.y + 1, o.z + t, BlockId.QuadroXN, passo);
      });
    },
    conferirExtra: (buf, grupos) => {
      const q = decodeSave(buf).quadros ?? [];
      return q.length === grupos * PASSOS.length
        ? []
        : [`esperava ${grupos * PASSOS.length} quadros com conteúdo, save tem ${q.length}`];
    },
  },
];

interface Opcoes {
  grupos: number;
  codigo: string;
  revelar: boolean;
  saida: string;
}

function gerar(c: Cenario, o: Opcoes): ArrayBuffer {
  const n = o.grupos;
  const { dx, dy, dz } = c.area;
  if (dz > FAIXA_MAX) throw new Error(`${c.arquivo}: profundidade ${dz} não cabe no chunk (máx. ${FAIXA_MAX})`);
  if (dx > LARGURA_MAX) throw new Error(`${c.arquivo}: largura ${dx} não cabe no chunk (máx. ${LARGURA_MAX})`);

  // mundo par (o spawn cai no CANTO do chunk central) e largo o bastante pra
  // uma cabine por grupo lado a lado
  const dims = { x: Math.max(6, n % 2 ? n + 1 : n), z: 6, y: 4 };
  const a = new Autoria({ dims, preset: "cabines", seed: SEED, codigo: o.codigo });
  a.entrar(o.codigo);
  a.afastar(1.5, 20, 1.5); // longe de qualquer área: bloco não é colocado em cima de jogador

  // cabine do professor = chunk central (é onde todo mundo nasce)
  const profOx = a.session.world.sizeX / 2;
  const profOz = a.session.world.sizeZ / 2;
  const canto = (ox: number, oz: number): Vec => ({
    x: ox + FAIXA_DX,
    y: FAIXA_Y,
    z: oz + FAIXA_DZ,
  });
  const fim = (org: Vec): Vec => ({ x: org.x + dx - 1, y: org.y + dy - 1, z: org.z + dz - 1 });
  const plantar = (org: Vec, fn: Cenario["gabarito"]): void => {
    for (let j = 0; j < dy; j++)
      for (let k = 0; k < dz; k++)
        for (let i = 0; i < dx; i++) {
          const id = fn(i, j, k);
          if (id !== AR) a.bloco(org.x + i, org.y + j, org.z + k, id);
        }
  };

  // grupos PRIMEIRO: o carimbo e o objetivo per-grupo só existem se houver grupos
  a.cmd(`/grupo criar ${n}`, `${n} grupo(s) criados`);

  // uma cabine por grupo, na fileira de chunks logo à frente (+z), centrada no professor
  const profCx = profOx / CHUNK_SIZE;
  const cz = profOz / CHUNK_SIZE + 1;
  const cx0 = Math.min(Math.max(profCx - Math.floor((n - 1) / 2), 0), dims.x - n);

  // área-modelo (professor) — o estado CERTO, que o objetivo vai fotografar
  const orgProf = canto(profOx, profOz);
  a.regiao("modelo", orgProf, fim(orgProf));
  plantar(orgProf, c.gabarito);

  // área-alvo de cada grupo, já com o ponto de partida montado + extras (dica/quadros)
  for (let g = 1; g <= n; g++) {
    const org = canto((cx0 + g - 1) * CHUNK_SIZE, cz * CHUNK_SIZE);
    a.regiao(`area-${g}`, org, fim(org));
    plantar(org, c.partida);
    c.extras?.(a, org);
    a.afastar(1.5, 20, 1.5); // extras podem ter chegado perto — volta pro alto
  }

  // "area" resolve pra area-1…area-N = uma área POR GRUPO (cada grupo no seu ritmo)
  a.cmd("/objetivo modo livre", "Modo do cenário: livre");
  a.cmd(`/objetivo add construir modelo area ${c.texto}`, "criado: construir em");

  // gabarito já está FOTOGRAFADO: apagar a área-modelo não desfaz o objetivo,
  // só tira a resposta da vista. Com --revelar, a tarefa vira copiar.
  if (!o.revelar) a.cmd("/regiao encher modelo 0", "bloco(s) alterado(s)");

  // mundo de ATIVIDADE = dia permanente, ciclo PARADO (o céu não muda durante a
  // aula — decisão do usuário). Explícito no gerador para não depender do padrão
  // da sessão (sobrevivência pode, no futuro, nascer com o ciclo ligado).
  a.cmd("/hora meio-dia", "Hora ajustada");
  a.cmd("/ciclo desligar", "Ciclo de dia e noite parado");

  // roster VAZIO: o .ljw não viaja com o PIN nem o papel do autor de mentira.
  // Quem entrar com o código de professor vira professor; alunos registram PIN na 1ª entrada.
  return encodeSave(a.session.world, { ...a.session.toSave(), roster: [] });
}

function parseArgs(argv: string[]): Opcoes {
  const flag = (nome: string): string | undefined => {
    const i = argv.indexOf(`--${nome}`);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const grupos = Number(flag("grupos") ?? 5);
  if (!Number.isInteger(grupos) || grupos < 1 || grupos > 8) {
    throw new Error("--grupos precisa ser um inteiro de 1 a 8");
  }
  // saída relativa à RAIZ do repo, não ao cwd: `npm run -w server` roda dentro
  // de server/ e os .ljw iam parar em server/cenarios/
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
  const saida = flag("saida") ?? "cenarios";
  return {
    grupos,
    codigo: flag("codigo") ?? "prof2026",
    revelar: argv.includes("--revelar"),
    saida: isAbsolute(saida) ? saida : join(raiz, saida),
  };
}

const o = parseArgs(process.argv.slice(2));
mkdirSync(o.saida, { recursive: true });
console.log(
  `gerando ${CENARIOS.length} cenário(s) — ${o.grupos} grupos, código de professor "${o.codigo}"` +
    (o.revelar ? ", gabarito À VISTA" : ""),
);
let falhou = false;
for (const c of CENARIOS) {
  const buf = gerar(c, o);
  const problemas = [
    ...conferir(buf, { grupos: o.grupos, codigo: o.codigo }),
    ...(c.conferirExtra?.(buf, o.grupos) ?? []),
  ];
  if (problemas.length) {
    falhou = true;
    console.error(`  ✗ ${c.arquivo} — cenário NÃO é jogável, arquivo não foi gravado:`);
    for (const p of problemas) console.error(`      · ${p}`);
    continue;
  }
  const caminho = join(o.saida, c.arquivo);
  writeFileSync(caminho, new Uint8Array(buf));
  console.log(`  ✓ ${caminho} — "${c.titulo}" (${(buf.byteLength / 1024).toFixed(0)} kB)`);
}
if (falhou) process.exit(1);
console.log(`pronto. hospede com: LJ_SAVE=${join(o.saida, CENARIOS[0]!.arquivo)} npm run start -w server`);
