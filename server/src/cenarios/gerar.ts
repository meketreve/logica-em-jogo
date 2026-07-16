/**
 * Gerador dos cenários pedagógicos (.ljw) — MVP v2 em uso real.
 *
 * Roda os MESMOS comandos de chat que o professor digitaria DENTRO do jogo
 * contra uma GameSession real, e grava o save. Não existe caminho de autoria
 * privado aqui: se um cenário não sai destes comandos, ele também não sai da
 * mão do professor — e isso é atrito pra corrigir no motor, não bug do script.
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
  encodeSave,
} from "@logica/shared";
import { conferir } from "./verificar";

const AUTOR_ID = 1;
const AUTOR_NOME = "autor";
const SEED = 20260714;

/** Faixa de blocos onde a sequência mora: à frente da cabine (lado aberto = +x). */
const FAIXA_Y = FLAT_SURFACE_Y + 1; // em cima da grama
const FAIXA_DX = 8; // a cabine acaba em ox+4; 8 deixa a faixa na área aberta
const FAIXA_DZ = 2; // recuo dentro do chunk (cabine ocupa z 0..4)
const FAIXA_MAX = CHUNK_SIZE - FAIXA_DZ - 1; // não pode vazar pro chunk vizinho

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
  /** Sequência CERTA, célula a célula. É ela que o objetivo fotografa. */
  gabarito: number[];
  /**
   * O que já nasce na faixa de CADA grupo (mesmo comprimento do gabarito).
   * 0 = ar. É a pista (aula 1), o vazio (aula 2) ou o código com erro (aula 3).
   * NUNCA pode ser igual ao gabarito — objetivo que já nasce completo é recusado.
   */
  partida: number[];
  /** Enunciado do objetivo (o servidor corta em 120 chars). */
  texto: string;
}

const { WoolRed: R, WoolBlue: B, WoolYellow: Y, WoolWhite: W, WoolBlack: K } = BlockId;
const AR = BlockId.Air;

/** Repete um trecho até dar `n` células — a "regra" da sequência, escrita uma vez só. */
const repetir = (padrao: number[], n: number): number[] =>
  Array.from({ length: n }, (_, i) => padrao[i % padrao.length] as number);

/** 45 em 8 bits (00101101), do bit mais significativo pro menos: branco=0, preto=1. */
const bits = (valor: number, largura: number): number[] =>
  Array.from({ length: largura }, (_, i) => ((valor >> (largura - 1 - i)) & 1 ? K : W));

const CENARIOS: Cenario[] = [
  {
    arquivo: "aula1-sequencia.ljw",
    titulo: "Continue a regra",
    pilar: "reconhecimento de padrão + generalização",
    gabarito: repetir([R, B, B], 12),
    // pista: só os 4 primeiros. 4 termos (R B B R) já obrigam a ver o período 3
    // — quem chuta "alterna uma a uma" erra na 3ª célula e o contador denuncia.
    partida: [...repetir([R, B, B], 4), ...Array<number>(8).fill(AR)],
    texto:
      "Continue a regra ate completar os 12 blocos da sua faixa. Os 4 primeiros ja estao la.",
  },
  {
    arquivo: "aula2-binario.ljw",
    titulo: "Escreva 45 em binário",
    pilar: "abstração + representação",
    gabarito: bits(45, 8),
    partida: Array<number>(8).fill(AR),
    texto:
      "Escreva 45 em binario com 8 blocos: branco=0, preto=1. Comece pelo bit de maior valor (128).",
  },
  {
    arquivo: "aula3-depurar.ljw",
    titulo: "Ache os 2 erros",
    pilar: "depuração (testar hipótese contra a regra)",
    gabarito: repetir([R, Y, B, B], 12),
    // mesma sequência com 2 células trocadas — o aluno não constrói, ele CORRIGE
    partida: repetir([R, Y, B, B], 12).map((b, i) => (i === 5 ? B : i === 9 ? R : b)),
    texto: "Ha 2 erros nesta sequencia. Ache e corrija — a regra se repete a cada 4 blocos.",
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
  const L = c.gabarito.length;
  if (c.partida.length !== L) throw new Error(`${c.arquivo}: partida e gabarito de tamanhos diferentes`);
  if (L > FAIXA_MAX) throw new Error(`${c.arquivo}: faixa de ${L} não cabe no chunk (máx. ${FAIXA_MAX})`);

  // mundo par (o spawn cai no CANTO do chunk central) e largo o bastante pra
  // uma cabine por grupo lado a lado
  const dims = { x: Math.max(6, n % 2 ? n + 1 : n), z: 6, y: 4 };
  const a = new Autoria({ dims, preset: "cabines", seed: SEED, codigo: o.codigo });
  a.entrar(o.codigo);
  a.afastar(1.5, 20, 1.5); // longe de qualquer faixa: bloco não é colocado em cima de jogador

  // cabine do professor = chunk central (é onde todo mundo nasce)
  const profOx = a.session.world.sizeX / 2;
  const profOz = a.session.world.sizeZ / 2;
  const faixa = (ox: number, oz: number, i: number): Vec => ({
    x: ox + FAIXA_DX,
    y: FAIXA_Y,
    z: oz + FAIXA_DZ + i,
  });

  // grupos PRIMEIRO: o carimbo e o objetivo per-grupo só existem se houver grupos
  a.cmd(`/grupo criar ${n}`, `${n} grupo(s) criados`);

  // uma cabine por grupo, na fileira de chunks logo à frente (+z), centrada no professor
  const profCx = profOx / CHUNK_SIZE;
  const cz = profOz / CHUNK_SIZE + 1;
  const cx0 = Math.min(Math.max(profCx - Math.floor((n - 1) / 2), 0), dims.x - n);

  // faixa-modelo (professor) — a sequência CERTA, que o objetivo vai fotografar
  a.regiao("modelo", faixa(profOx, profOz, 0), faixa(profOx, profOz, L - 1));
  c.gabarito.forEach((id, i) => {
    const p = faixa(profOx, profOz, i);
    a.bloco(p.x, p.y, p.z, id);
  });

  // faixa-alvo de cada grupo, já com o ponto de partida montado
  for (let g = 1; g <= n; g++) {
    const ox = (cx0 + g - 1) * CHUNK_SIZE;
    const oz = cz * CHUNK_SIZE;
    a.regiao(`area-${g}`, faixa(ox, oz, 0), faixa(ox, oz, L - 1));
    c.partida.forEach((id, i) => {
      if (id === AR) return; // a faixa já nasce vazia
      const p = faixa(ox, oz, i);
      a.bloco(p.x, p.y, p.z, id);
    });
  }

  // "area" resolve pra area-1…area-N = uma área POR GRUPO (cada grupo no seu ritmo)
  a.cmd("/objetivo modo livre", "Modo do cenário: livre");
  a.cmd(`/objetivo add construir modelo area ${c.texto}`, "criado: construir em");

  // gabarito já está FOTOGRAFADO: apagar a faixa-modelo não desfaz o objetivo,
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
  const problemas = conferir(buf, { grupos: o.grupos, codigo: o.codigo });
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
