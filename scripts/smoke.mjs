#!/usr/bin/env node
/**
 * Runner dos smokes de rede — sobe o servidor REAL, roda o cenário, mata tudo.
 *
 * O que isso resolve: cada `_smoke-*.mjs` precisa de um mundo e de uma env
 * própria, e isso vivia só no comentário do cabeçalho. Quem quisesse rodar
 * tinha que ler o arquivo, montar a linha de comando à mão e lembrar de matar
 * o servidor depois. Agora o manifesto abaixo é a fonte da verdade.
 *
 *   npm run smoke                 # roda todos
 *   npm run smoke -- troca-raio   # roda um
 *   npm run smoke -- --rapido     # pula os lentos (mundos E)
 *   npm run smoke -- --lista      # só diz o que cada um prova
 *
 * Regras que valem a pena não reaprender:
 *  - Porta própria por cenário (809x). A 8080 fica livre pro dev server —
 *    matar processo na 8080 já derrubou o servidor do usuário antes.
 *  - LJ_SAVE SEMPRE apontado pra mundos/ (gitignored). Sem LJ_SAVE o host
 *    grava em world.ljw, que é versionado.
 *  - LJ_SEED fixa: terreno igual em toda rodada, senão o smoke vira sorteio.
 *  - **LJ_NOVO=1 NÃO recria mundo que já existe** — ele só AUTORIZA criar onde
 *    não há arquivo. Smoke que muda estado PERSISTENTE (modo, regras, blocos)
 *    tem de pedir `limpar` abaixo, senão a 2ª rodada começa com o estado da 1ª
 *    e falha sozinha. Mundos E ficam de FORA disso de propósito: regenerar cada
 *    um custa dezenas de segundos e eles não guardam estado que o smoke leia.
 *  - Modelo em cenarios/ é seguro como LJ_SAVE: paths.ts faz cópia de trabalho
 *    em mundos/ e nunca escreve no arquivo distribuído.
 */
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { connect } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = "server/src/cenarios";
const SEED = "20260726";

/**
 * Um cenário por entrada. `servidores` sobe na ordem; `efemero` significa
 * "sobe só pra materializar o .ljw no disco e morre antes do smoke rodar".
 * `limpar` = pastas de mundo apagadas ANTES de subir (mundo do zero em toda
 * rodada — obrigatório pra smoke que lê estado persistente; ver o cabeçalho).
 */
const SMOKES = [
  {
    nome: "mundo",
    arquivo: `${DIR}/_smoke-mundo.mjs`,
    prova:
      "cp19 — professor troca a aula com /mundo carregar, ninguém cai nem perde o papel; aluno não pode trocar; mundo inexistente é recusado.",
    lento: false,
    servidores: [
      {
        // Precisa NASCER na aula1: o smoke confere o objetivo inicial e que
        // `/mundo lista` marca a aula em curso. Mundo novo vazio reprova.
        porta: 8091,
        env: { LJ_SAVE: "cenarios/aula1-sequencia.ljw", LJ_CODIGO: "prof2026" },
      },
    ],
  },
  {
    nome: "kicar",
    arquivo: `${DIR}/_smoke-kicar.mjs`,
    prova:
      "cp22 — /kicar remove o aluno de verdade pelo fio (msg `kicked` + socket cai), avisa os demais; aluno não kica, nome inexistente e o próprio professor não removem ninguém.",
    lento: false,
    servidores: [
      {
        porta: 8092,
        env: { LJ_SAVE: "mundos/_smoke-kicar.ljw", LJ_NOVO: "1", LJ_CODIGO: "prof2026", LJ_SEED: SEED },
      },
    ],
  },
  {
    nome: "atividade",
    arquivo: `${DIR}/_smoke-atividade.mjs`,
    prova:
      "/tp grupos + /iniciar de ponta a ponta na aula1 — professor forma grupos com quem está online, zera o progresso e cada grupo recebe a msg `teleport` pela rede.",
    lento: false,
    servidores: [
      {
        porta: 8093,
        env: { LJ_SAVE: "cenarios/aula1-sequencia.ljw", LJ_CODIGO: "prof2026" },
      },
    ],
  },
  {
    nome: "pedir-coluna",
    arquivo: `${DIR}/_smoke-pedir-coluna.mjs`,
    prova:
      "§🔁 rede de segurança do streaming — o cliente pede coluna que faltou e o host entrega; pedido fora do raio+FOLGA_DESCARTE é recusado.",
    lento: true,
    servidores: [
      {
        porta: 8094,
        env: {
          LJ_SAVE: "mundos/_smoke-coluna.ljw",
          LJ_NOVO: "1",
          LJ_TAMANHO: "E",
          LJ_SEED: SEED,
        },
      },
    ],
  },
  {
    nome: "perfil-http",
    arquivo: `${DIR}/_smoke-perfil-http.mjs`,
    prova:
      "POST /perfil — o perfil do ?bench (que roda em singleplayer, sem socket com o host) cai em profiles/ com prefixo perf-bench-; perfil manual vai sem prefixo; lixo, array e corpo gigante são recusados sem gravar.",
    lento: false,
    servidores: [
      {
        porta: 8097,
        env: { LJ_SAVE: "mundos/_smoke-perfil.ljw", LJ_NOVO: "1", LJ_SEED: SEED },
      },
    ],
  },
  {
    nome: "modo",
    arquivo: `${DIR}/_smoke-modo.mjs`,
    args: ["_smoke-modob"],
    prova:
      "§🍖 F1 — /modo chega resolvido em cada cliente (ajuste pessoal × padrão do mundo), `all` pega quem está dentro E quem entra depois, aluno não muda nada, e modo + /regra atravessam o DISCO na ida e volta de /mundo carregar.",
    lento: false,
    // o smoke ESCREVE modo e regra no .ljw: sem apagar, a 2ª rodada nasceria em
    // sobrevivência com pvp ligada e falharia na primeira asserção
    limpar: ["mundos/_smoke-modoa", "mundos/_smoke-modob"],
    servidores: [
      {
        // só existe pra ser o destino da ida e volta; morre antes do smoke
        efemero: true,
        porta: 8099,
        env: {
          LJ_SAVE: "mundos/_smoke-modob.ljw",
          LJ_NOVO: "1",
          LJ_TAMANHO: "P",
          LJ_SEED: SEED,
        },
      },
      {
        porta: 8098,
        env: {
          LJ_SAVE: "mundos/_smoke-modoa.ljw",
          LJ_NOVO: "1",
          LJ_TAMANHO: "P",
          LJ_CODIGO: "prof2026",
          LJ_SEED: SEED,
        },
      },
    ],
  },
  {
    nome: "vida",
    arquivo: `${DIR}/_smoke-vida.mjs`,
    prova:
      "§🍖 F2 — o SERVIDOR fecha a queda pelo fluxo de `move` (o cliente nunca reporta dano), criativo é imune no mesmo mundo, a morte devolve ao spawn avisando a turma e a regeneração anda no tick de 10 Hz.",
    lento: false,
    // o smoke deixa a ana machucada no .ljw (§🍖 F2 grava vida no roster)
    limpar: ["mundos/_smoke-vida"],
    servidores: [
      {
        porta: 8100,
        env: {
          LJ_SAVE: "mundos/_smoke-vida.ljw",
          LJ_NOVO: "1",
          LJ_TAMANHO: "P",
          LJ_CODIGO: "prof2026",
          LJ_SEED: SEED,
        },
      },
    ],
  },
  {
    nome: "fome",
    arquivo: `${DIR}/_smoke-fome.mjs`,
    prova:
      "§🍖 F3 — a fome desce pelo fluxo de `move` que o servidor já recebe (o cliente nunca reporta esforço), criativo não tem barra no mesmo mundo, /regra fome liga e desliga a barra na hora, e o zero cobra dano no tick sem matar.",
    lento: false,
    // o smoke deixa a ana faminta e machucada no .ljw (§🍖 F3 grava fome no roster)
    limpar: ["mundos/_smoke-fome"],
    servidores: [
      {
        porta: 8101,
        env: {
          LJ_SAVE: "mundos/_smoke-fome.ljw",
          LJ_NOVO: "1",
          LJ_TAMANHO: "P",
          LJ_CODIGO: "prof2026",
          LJ_SEED: SEED,
        },
      },
    ],
  },
  {
    nome: "inventario",
    arquivo: `${DIR}/_smoke-inventario.mjs`,
    prova:
      "§🍖 F4 — a mochila é estado do SERVIDOR (criativo nem recebe a mensagem), colocar gasta e quebrar dá pela tabela de drops, mochila cheia RECUSA a quebra (não existe item no chão), manter-inventario decide a morte e tudo atravessa o .ljw.",
    lento: false,
    // o smoke deixa mochila, modo pessoal e regra gravados no .ljw
    limpar: ["mundos/_smoke-inv"],
    servidores: [
      {
        porta: 8102,
        env: {
          LJ_SAVE: "mundos/_smoke-inv.ljw",
          LJ_NOVO: "1",
          LJ_TAMANHO: "P",
          LJ_CODIGO: "prof2026",
          LJ_SEED: SEED,
        },
      },
    ],
  },
  {
    nome: "troca-raio",
    arquivo: `${DIR}/_smoke-troca-raio.mjs`,
    args: ["_smoke-trocab"],
    prova:
      "bug-518 — /mundo carregar cria sessão nova e o admitir zera o raio pra RAIO_PADRAO (6); prova que o cliente reanunciar `radius` traz o anel de volta.",
    lento: true,
    servidores: [
      {
        // Só existe pra gerar o mundo ALVO da troca; morre antes do smoke.
        efemero: true,
        porta: 8096,
        env: {
          LJ_SAVE: "mundos/_smoke-trocab.ljw",
          LJ_NOVO: "1",
          LJ_TAMANHO: "E",
          LJ_SEED: SEED,
        },
      },
      {
        porta: 8095,
        env: {
          LJ_SAVE: "mundos/_smoke-trocaa.ljw",
          LJ_NOVO: "1",
          LJ_TAMANHO: "E",
          LJ_CODIGO: "prof2026",
          LJ_SEED: SEED,
        },
      },
    ],
  },
];

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/** Resolve quando a porta aceita TCP. O host só escuta DEPOIS de gerar o mundo. */
async function esperaPorta(porta, timeoutMs) {
  const limite = Date.now() + timeoutMs;
  while (Date.now() < limite) {
    const abriu = await new Promise((r) => {
      const s = connect({ port: porta, host: "127.0.0.1" });
      s.once("connect", () => (s.destroy(), r(true)));
      s.once("error", () => (s.destroy(), r(false)));
    });
    if (abriu) return true;
    await espera(250);
  }
  return false;
}

/** Sobe o host num grupo de processos próprio, pra `kill(-pid)` pegar o tsx filho. */
function sobeServidor(env, porta) {
  const proc = spawn("npx", ["tsx", "server/src/index.ts"], {
    cwd: RAIZ,
    env: { ...process.env, ...env, LJ_PORT: String(porta) },
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let saida = "";
  proc.stdout.on("data", (d) => (saida += d));
  proc.stderr.on("data", (d) => (saida += d));
  return { proc, log: () => saida };
}

function mata(servidor) {
  if (!servidor || servidor.proc.exitCode !== null) return;
  try {
    process.kill(-servidor.proc.pid, "SIGTERM");
  } catch {
    /* já morreu */
  }
}

async function rodaSmoke(smoke) {
  const vivos = [];
  const t0 = Date.now();
  try {
    for (const alvo of smoke.limpar ?? []) {
      rmSync(resolve(RAIZ, alvo), { recursive: true, force: true });
    }
    for (const cfg of smoke.servidores) {
      const s = sobeServidor(cfg.env, cfg.porta);
      vivos.push(s);
      // Mundo E pode levar dezenas de segundos pra gerar antes de escutar.
      const pronto = await esperaPorta(cfg.porta, smoke.lento ? 120_000 : 30_000);
      if (!pronto) {
        return { ok: false, motivo: `servidor não subiu na porta ${cfg.porta}`, saida: s.log() };
      }
      if (cfg.efemero) {
        mata(s);
        vivos.pop();
        await espera(1000); // dá tempo do autosave fechar o arquivo
      }
    }

    const porta = smoke.servidores.filter((s) => !s.efemero).at(-1).porta;
    const args = [smoke.arquivo, String(porta), ...(smoke.args ?? [])];
    const res = await new Promise((r) => {
      const p = spawn("node", args, { cwd: RAIZ, stdio: ["ignore", "pipe", "pipe"] });
      let saida = "";
      p.stdout.on("data", (d) => (saida += d));
      p.stderr.on("data", (d) => (saida += d));
      p.on("close", (code) => r({ code, saida }));
    });
    return {
      ok: res.code === 0,
      motivo: res.code === 0 ? "" : `saiu com código ${res.code}`,
      saida: res.saida,
      segundos: ((Date.now() - t0) / 1000).toFixed(0),
    };
  } finally {
    vivos.forEach(mata);
    await espera(500);
  }
}

const argv = process.argv.slice(2);
const lista = argv.includes("--lista");
const rapido = argv.includes("--rapido");
const filtros = argv.filter((a) => !a.startsWith("--"));

let alvos = SMOKES;
if (filtros.length) alvos = alvos.filter((s) => filtros.some((f) => s.nome.includes(f)));
if (rapido) alvos = alvos.filter((s) => !s.lento);

if (lista) {
  for (const s of SMOKES) {
    console.log(`\n${s.nome}${s.lento ? "  (lento — mundo E)" : ""}`);
    console.log(`  ${s.prova}`);
  }
  console.log("");
  process.exit(0);
}

if (alvos.length === 0) {
  console.error(`Nenhum smoke bate com ${filtros.join(", ")}. Use --lista pra ver os nomes.`);
  process.exit(1);
}

const falhas = [];
for (const smoke of alvos) {
  process.stdout.write(`▸ ${smoke.nome} … `);
  const r = await rodaSmoke(smoke);
  if (r.ok) {
    console.log(`OK (${r.segundos}s)`);
  } else {
    console.log(`FALHOU — ${r.motivo}`);
    falhas.push({ smoke, ...r });
  }
}

for (const f of falhas) {
  console.log(`\n${"─".repeat(60)}\n${f.smoke.nome} — saída completa:\n${f.saida}`);
}

console.log(
  falhas.length === 0
    ? `\n${alvos.length}/${alvos.length} smokes OK`
    : `\n${alvos.length - falhas.length}/${alvos.length} smokes OK — ${falhas.map((f) => f.smoke.nome).join(", ")} falhou`,
);
process.exit(falhas.length === 0 ? 0 : 1);
