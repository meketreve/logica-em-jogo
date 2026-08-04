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
 * Desde 2026-07-19 a área do grupo é uma CAIXA (dx×dy×dz); desde 2026-07-20
 * um cenário pode ter VÁRIAS FASES (objetivos em modo sequencial — cada grupo
 * avança no próprio ritmo, cp13). As fases ficam lado a lado no chunk do
 * grupo, com 1 coluna de vão; 1 fase = modo livre, como sempre foi.
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
import { Autoria, type Vec } from "./autoria";
import {
  ARQUIVO_CORRIDA,
  TITULO_CORRIDA,
  conferirCorrida,
  gerarCorrida,
  resumoCorrida,
} from "./corrida";
import { conferir } from "./verificar";

const SEED = 20260714;

/** Canto da área do grupo: à frente da cabine (lado aberto = +x). */
const FAIXA_Y = FLAT_SURFACE_Y + 1; // em cima da grama
const FAIXA_DX = 8; // a cabine acaba em ox+4; 8 deixa a área na parte aberta
const FAIXA_DZ = 2; // recuo dentro do chunk (cabine ocupa z 0..4)
/** Profundidade máxima (z) sem vazar pro chunk vizinho. */
const FAIXA_MAX = CHUNK_SIZE - FAIXA_DZ - 1;
/** Largura máxima (x) somada das fases — extras (parede de quadros) podem ir além. */
const LARGURA_MAX = CHUNK_SIZE - FAIXA_DX;


/** Uma FASE = um objetivo "construir" com modelo próprio. */
interface Fase {
  /** Enunciado do objetivo (o servidor corta em 120 chars). */
  texto: string;
  /** Tamanho da área-alvo: colunas (x), altura (y), profundidade (z). */
  area: { dx: number; dy: number; dz: number };
  /** Sequência CERTA na célula relativa (i,j,k) — é o que o objetivo fotografa. */
  gabarito: (i: number, j: number, k: number) => number;
  /**
   * O que já nasce na área de CADA grupo. 0 = ar. É a pista, o vazio ou o
   * estado com erros. NUNCA pode ser igual ao gabarito — objetivo que já
   * nasce completo é recusado.
   */
  partida: (i: number, j: number, k: number) => number;
  /** Decoração FORA da área-alvo (dica cifrada, quadros-manual) — 1× por
   *  grupo, com a origem (canto min) da área daquele grupo NESSA fase.
   *  CUIDADO em cenário multi-fase: extras à direita (+x) podem colidir com
   *  a fase seguinte. */
  extras?: (a: Autoria, origem: Vec) => void;
}

interface Cenario {
  arquivo: string;
  titulo: string;
  /** Pilar do pensamento computacional que a tarefa exercita (vai pro roteiro). */
  pilar: string;
  /** 1 fase = modo livre (como sempre). 2+ = modo SEQUENCIAL: o grupo só vê a
   *  fase seguinte quando fecha a atual, cada grupo no próprio ritmo. */
  fases: Fase[];
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

/** Fase de faixa 1D ao longo de z (o caso clássico das aulas 1-3). */
const faixa1d = (
  gabarito: number[],
  partida: number[],
  texto: string,
  extras?: Fase["extras"],
): Fase => ({
  texto,
  area: { dx: 1, dy: 1, dz: gabarito.length },
  gabarito: (_i, _j, k) => gabarito[k] ?? AR,
  partida: (_i, _j, k) => partida[k] ?? AR,
  ...(extras ? { extras } : {}),
});

/** Os `dado` primeiros blocos do gabarito já montados, o resto ar. */
const primeiros = (gabarito: number[], dado: number): number[] =>
  gabarito.map((id, i) => (i < dado ? id : AR));

/** Bloco-letra do caractere (A..Z). */
const letra = (ch: string): number => BlockId.LetterA + (ch.charCodeAt(0) - 65);

// --- aula 4: decifrar (glifos) ---
const PALAVRA = "LOGICA";
/** A mesma palavra com cada letra ADIANTADA em 1 (cifra de César +1). */
const CIFRADA = [...PALAVRA]
  .map((c) => String.fromCharCode(65 + (c.charCodeAt(0) - 65 + 1) % 26))
  .join("");

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

// --- aula 1 (3 FASES, 2026-07-20): sequências em dificuldade crescente ---
const A1F1 = repetir([R, B, B], 12);
const A1F2 = repetir([Y, R, R, B], 12);
/** Fase 3: o número de azuis cresce a cada vermelho — R B R BB R BBB R B(B). */
const A1F3 = [R, B, R, B, B, R, B, B, B, R, B, B];

const CENARIOS: Cenario[] = [
  {
    arquivo: "aula1-sequencia.ljw",
    titulo: "Continue a regra",
    pilar: "reconhecimento de padrão + generalização (3 fases)",
    fases: [
      // pista: só os 4 primeiros. 4 termos (R B B R) já obrigam a ver o
      // período 3 — quem chuta "alterna" erra na 3ª célula e o contador denuncia.
      faixa1d(
        A1F1,
        primeiros(A1F1, 4),
        "Fase 1: continue a regra ate completar os 12 blocos. Os 4 primeiros ja estao la.",
      ),
      faixa1d(
        A1F2,
        primeiros(A1F2, 5),
        "Fase 2: regra nova, com periodo MAIOR. Os 5 primeiros ja estao la.",
      ),
      faixa1d(
        A1F3,
        primeiros(A1F3, 6),
        "Fase 3: dessa vez a regra CRESCE. Olhe os azuis com atencao e complete os 12.",
      ),
    ],
  },
  {
    arquivo: "aula2-binario.ljw",
    titulo: "Escreva 45 em binário",
    pilar: "abstração + representação",
    fases: [
      faixa1d(
        bits(45, 8),
        [],
        "Escreva 45 em binario com 8 blocos: branco=0, preto=1. Comece pelo bit de maior valor (128).",
      ),
    ],
  },
  {
    arquivo: "aula3-depurar.ljw",
    titulo: "Ache os 2 erros",
    pilar: "depuração (testar hipótese contra a regra)",
    fases: [
      // mesma sequência com 2 células trocadas — o aluno não constrói, ele CORRIGE
      faixa1d(
        repetir([R, Y, B, B], 12),
        repetir([R, Y, B, B], 12).map((b, i) => (i === 5 ? B : i === 9 ? R : b)),
        "Ha 2 erros nesta sequencia. Ache e corrija — a regra se repete a cada 4 blocos.",
      ),
    ],
  },
  {
    arquivo: "aula4-decifrar.ljw",
    titulo: "Decifre a mensagem",
    pilar: "representação + decodificação (cifra de César)",
    fases: [
      // a mensagem CIFRADA fica à vista, colada na área (coluna x-1) — é dica, não alvo
      faixa1d(
        [...PALAVRA].map(letra),
        [],
        "Decifre: cada letra da mensagem ao lado vale a letra ANTERIOR do alfabeto. Escreva a palavra decifrada aqui.",
        (a, o) => {
          [...CIFRADA].forEach((ch, k) => a.bloco(o.x - 1, o.y, o.z + k, letra(ch)));
        },
      ),
    ],
  },
  {
    arquivo: "aula5-simetria.ljw",
    titulo: "Conserte o desenho",
    pilar: "decomposição + depuração com invariante (simetria)",
    fases: [
      {
        area: { dx: 1, dy: CORACAO.length, dz: (CORACAO[0] ?? "").length },
        gabarito: (_i, j, k) => coracaoEm(j, k),
        // o coração com 4 células trocadas — nenhuma com a espelhada trocada
        // junto, então TODA troca quebra a simetria e a regra denuncia
        partida: (_i, j, k) => {
          if (ERROS.some(([ej, ek]) => ej === j && ek === k)) {
            return coracaoEm(j, k) === R ? W : R;
          }
          return coracaoEm(j, k);
        },
        texto:
          "A parede devia ser um coracao SIMETRICO (esquerda = espelho da direita). Ha 4 celulas erradas — conserte.",
      },
    ],
  },
  {
    arquivo: "aula6-manual.ljw",
    titulo: "Siga o manual",
    pilar: "seguir algoritmo (instruções em passos, ordem e precisão)",
    fases: [
      {
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
      },
    ],
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
  // offset x de cada fase: lado a lado com 1 coluna de vão
  const offsets: number[] = [];
  let offX = 0;
  for (const f of c.fases) {
    if (f.area.dz > FAIXA_MAX) {
      throw new Error(`${c.arquivo}: profundidade ${f.area.dz} não cabe no chunk (máx. ${FAIXA_MAX})`);
    }
    offsets.push(offX);
    offX += f.area.dx + 1;
  }
  if (offX - 1 > LARGURA_MAX) {
    throw new Error(`${c.arquivo}: fases somam largura ${offX - 1} (máx. ${LARGURA_MAX})`);
  }

  // mundo par (o spawn cai no CANTO do chunk central) e largo o bastante pra
  // uma cabine por grupo lado a lado
  const dims = { x: Math.max(6, n % 2 ? n + 1 : n), z: 6, y: 4 };
  const a = new Autoria({ dims, preset: "cabines", seed: SEED, codigo: o.codigo });
  a.entrar(o.codigo);
  a.afastar(1.5, 20, 1.5); // longe de qualquer área: bloco não é colocado em cima de jogador

  // cabine do professor = chunk central (é onde todo mundo nasce)
  const profOx = a.session.world.sizeX / 2;
  const profOz = a.session.world.sizeZ / 2;
  const canto = (ox: number, oz: number, f: number): Vec => ({
    x: ox + FAIXA_DX + (offsets[f] ?? 0),
    y: FAIXA_Y,
    z: oz + FAIXA_DZ,
  });
  const fim = (org: Vec, f: Fase): Vec => ({
    x: org.x + f.area.dx - 1,
    y: org.y + f.area.dy - 1,
    z: org.z + f.area.dz - 1,
  });
  const plantar = (org: Vec, f: Fase, fn: Fase["gabarito"]): void => {
    for (let j = 0; j < f.area.dy; j++)
      for (let k = 0; k < f.area.dz; k++)
        for (let i = 0; i < f.area.dx; i++) {
          const id = fn(i, j, k);
          if (id !== AR) a.bloco(org.x + i, org.y + j, org.z + k, id);
        }
  };
  /** Sufixo dos nomes de região: fase 1 fica sem ("modelo"/"area" — compat). */
  const suf = (f: number): string => (f === 0 ? "" : String(f + 1));

  // grupos PRIMEIRO: o carimbo e o objetivo per-grupo só existem se houver grupos
  a.cmd(`/grupo criar ${n}`, `${n} grupo(s) criados`);

  // uma cabine por grupo, na fileira de chunks logo à frente (+z), centrada no professor
  const profCx = profOx / CHUNK_SIZE;
  const cz = profOz / CHUNK_SIZE + 1;
  const cx0 = Math.min(Math.max(profCx - Math.floor((n - 1) / 2), 0), dims.x - n);

  // modelo de CADA fase na cabine do professor — o estado certo, fotografado
  c.fases.forEach((fase, f) => {
    const org = canto(profOx, profOz, f);
    a.regiao(`modelo${suf(f)}`, org, fim(org, fase));
    plantar(org, fase, fase.gabarito);
  });

  // áreas de cada grupo (todas as fases), com partida + extras (dica/quadros)
  for (let g = 1; g <= n; g++) {
    const ox = (cx0 + g - 1) * CHUNK_SIZE;
    const oz = cz * CHUNK_SIZE;
    c.fases.forEach((fase, f) => {
      const org = canto(ox, oz, f);
      a.regiao(`area${suf(f)}-${g}`, org, fim(org, fase));
      plantar(org, fase, fase.partida);
      fase.extras?.(a, org);
    });
    a.afastar(1.5, 20, 1.5); // extras podem ter chegado perto — volta pro alto
  }

  // modo: 1 fase = livre (como sempre); 2+ = sequencial (fase a fase, por grupo)
  const modo = c.fases.length > 1 ? "sequencial" : "livre";
  a.cmd(`/objetivo modo ${modo}`, `Modo do cenário: ${modo}`);
  c.fases.forEach((fase, f) => {
    a.cmd(`/objetivo add construir modelo${suf(f)} area${suf(f)} ${fase.texto}`, "criado: construir em");
  });

  // gabaritos já estão FOTOGRAFADOS: apagar as áreas-modelo não desfaz os
  // objetivos, só tira a resposta da vista. Com --revelar, a tarefa vira copiar.
  if (!o.revelar) {
    c.fases.forEach((_fase, f) => {
      a.cmd(`/regiao encher modelo${suf(f)} 0`, "bloco(s) alterado(s)");
    });
  }

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
  `gerando ${CENARIOS.length + 1} cenário(s) — ${o.grupos} grupos, código de professor "${o.codigo}"` +
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
  const fases = c.fases.length > 1 ? `, ${c.fases.length} fases` : "";
  console.log(`  ✓ ${caminho} — "${c.titulo}" (${(buf.byteLength / 1024).toFixed(0)} kB${fases})`);
}

// §🏁 a CORRIDA (2026-08-04): não é aula de construir, então tem gerador e
// conferência próprios (`corrida.ts`) — mas sai do MESMO comando, porque pro
// professor "gerar as aulas" é uma coisa só.
{
  const buf = gerarCorrida({ grupos: o.grupos, codigo: o.codigo });
  const problemas = conferirCorrida(buf, { grupos: o.grupos, codigo: o.codigo });
  if (problemas.length) {
    falhou = true;
    console.error(`  ✗ ${ARQUIVO_CORRIDA} — pista NÃO é jogável, arquivo não foi gravado:`);
    for (const p of problemas) console.error(`      · ${p}`);
  } else {
    const caminho = join(o.saida, ARQUIVO_CORRIDA);
    writeFileSync(caminho, new Uint8Array(buf));
    console.log(
      `  ✓ ${caminho} — "${TITULO_CORRIDA}" (${(buf.byteLength / 1024).toFixed(0)} kB, ${resumoCorrida(buf)})`,
    );
  }
}
if (falhou) process.exit(1);
console.log(`pronto. hospede com: LJ_SAVE=${join(o.saida, CENARIOS[0]!.arquivo)} npm run start -w server`);
