#!/usr/bin/env node
/**
 * `/perfil` (2026-10-27) num Chrome DE VERDADE, do lado de quem NÃO apertou nada.
 *
 * O smoke `perfil-turma` prova o host com alunos de mentira, que respondem o
 * pedido à mão. O que só o navegador prova é o resto: o jogo do aluno recebe
 * `pedir_perfil`, grava sozinho, DEVOLVE, e faz isso sem abrir o F3 na tela
 * dele (o painel aberto atrapalha a criança e pesa no próprio número medido).
 *
 *   1. o arquivo `perf-turma-<lote>-` nasce em `profiles/` com um perfil REAL
 *      (frames gravados), carimbado com o lote do pedido;
 *   2. o F3 ficou fechado a gravação inteira (amostrado, não lido uma vez);
 *   3. o aluno foi avisado no chat — o jogo não mede escondido.
 *
 * ⚠️ Serve `client/dist`: rodar `npm run build` ANTES.
 * ⚠️ PRECISA do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`).
 *
 * Uso: npm run shots:perfil
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8142;
const PORTA_CDP = 9390;
const BASE = process.env["BASE"] ?? `http://localhost:${PORTA_WS}`;
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "perfil");
const MUNDO = "mundos/_shot-perfil";
mkdirSync(SAIDA, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
// stdout SEM buffer (bug do toque-shot): fora de TTY o node segura as linhas
// até o fim, e um script morto no meio não deixa rastro do que já mediu.
const diga = (t) => process.stdout.write(`${t}\n`);



function acharChrome() {
  if (process.env["CHROME"]) return process.env["CHROME"];
  const cache = join(homedir(), ".cache/puppeteer/chrome");
  if (existsSync(cache)) {
    for (const v of readdirSync(cache).sort().reverse()) {
      const bin = join(cache, v, "chrome-linux64/chrome");
      if (existsSync(bin)) return bin;
    }
  }
  for (const p of ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]) {
    if (existsSync(p)) return p;
  }
  throw new Error(
    "Chrome não encontrado — `npx -y @puppeteer/browsers install chrome@stable` ou passe CHROME=…",
  );
}

// --- host Node de verdade (mundo P novo, descartado no fim) ---
rmSync(join(process.cwd(), MUNDO), { recursive: true, force: true });
const servidor = spawn("npx", ["tsx", "server/src/index.ts"], {
  env: {
    ...process.env,
    LJ_PORT: String(PORTA_WS),
    LJ_SAVE: `${MUNDO}.ljw`,
    LJ_NOVO: "1",
    LJ_TAMANHO: "P",
    LJ_SEED: "20260805",
    LJ_CODIGO: "prof2026",
      },
  detached: true,
  stdio: ["ignore", "ignore", "pipe"],
});
servidor.stderr?.on("data", (d) => {
  if (/Error|error/.test(String(d))) process.stderr.write(`[host] ${d}`);
});
async function esperaPorta(porta) {
  for (let i = 0; i < 120; i++) {
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
let chrome = null;
function encerrar(codigo) {
  matarChrome();
  try {
    process.kill(-servidor.pid, "SIGTERM");
  } catch {
    /* já morreu */
  }
  // o host GRAVA o mundo ao receber o SIGTERM: apagar na hora deixa a pasta
  // renascer atrás do rm (bug do amigos-shot na sessão 43).
  setTimeout(() => {
    rmSync(join(process.cwd(), MUNDO), { recursive: true, force: true });
    process.exit(codigo);
  }, 1000);
}
process.on("uncaughtException", (e) => (console.error(e), encerrar(1)));
process.on("unhandledRejection", (e) => (console.error(e), encerrar(1)));
if (!(await esperaPorta(PORTA_WS))) {
  console.error("o host não subiu na porta", PORTA_WS);
  encerrar(1);
}

// --- navegador como "profa", em tablet ---
// libs do chrome extraídas sem sudo (bug-564): se o prefixo local existir, ele
// entra no LD_LIBRARY_PATH — é o que faz o print rodar no notebook da escola.
const LIBS = join(homedir(), ".local/chrome-libs/usr/lib/x86_64-linux-gnu");
// Perfil temporário do Chrome (2026-10-10): são ~57 MB por rodada em /tmp e
// ninguém os apagava — o `exit` cobre tanto o fim normal quanto o
// `process.exit()` do encerrar(). E Ctrl+C passa pelo encerrar() também: matar
// só ESTE processo deixava o Chrome órfão segurando memória por horas.
const PERFIL = mkdtempSync(join(tmpdir(), "lj-perfil-"));
process.on("exit", () => rmSync(PERFIL, { recursive: true, force: true }));
/** Mata o Chrome INTEIRO. Ele tem filhos (gpu, rede, renderer) e matar só o
 *  PAI deixava um deles regravando o perfil DEPOIS do rmSync — sobrava um
 *  esqueleto de 28 KB por rodada em /tmp. Daí o spawn ser `detached`: grupo
 *  próprio, e o SIGKILL no grupo não dá a ninguém a chance de gravar de volta.
 *  É `function` (içada) e o try/catch abraça TUDO de propósito: o encerrar()
 *  pode ser chamado antes de o Chrome subir — o host que não abre a porta é um
 *  caminho desses — e aí o próprio `chrome` ainda não existe. */
function matarChrome() {
  try {
    process.kill(-chrome.pid, "SIGKILL");
  } catch {
    /* ainda não subiu, ou já morreu */
  }
}
for (const sinal of ["SIGINT", "SIGTERM"]) process.on(sinal, () => encerrar(130));

chrome = spawn(
  acharChrome(),
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--enable-unsafe-swiftshader",
    `--window-size=${L},${A}`,
    `--remote-debugging-port=${PORTA_CDP}`,
    `--user-data-dir=${PERFIL}`,
    "about:blank",
  ],
  {
    detached: true, stdio: ["ignore", "ignore", "pipe"],
    env: existsSync(LIBS)
      ? { ...process.env, LD_LIBRARY_PATH: `${LIBS}:${process.env["LD_LIBRARY_PATH"] ?? ""}` }
      : process.env,
  },
);
async function abrirAba() {
  for (let i = 0; i < 60; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PORTA_CDP}/json/list`)).json();
      const aba = lista.find((t) => t.type === "page");
      if (aba) return aba;
    } catch {
      /* subindo */
    }
    await espera(250);
  }
  throw new Error("chrome não abriu a porta de depuração");
}
const aba = await abrirAba();
const ws = new WebSocket(aba.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pend = new Map();
const excecoes = [];
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) {
    pend.get(m.id)(m);
    pend.delete(m.id);
  } else if (m.method === "Runtime.exceptionThrown") {
    excecoes.push(m.params.exceptionDetails.exception?.description ?? "?");
  }
});
/** Toda chamada tem TETO (bug do toque-shot): resposta que não volta deixaria
 *  o script mudo, que é o pior jeito de um verificador falhar. */
const cdp = (method, params = {}, tetoMs = 30000) =>
  new Promise((resolve, reject) => {
    const meu = ++id;
    const alarme = setTimeout(() => {
      pend.delete(meu);
      reject(new Error(`CDP travou em ${method} (${tetoMs} ms sem resposta)`));
    }, tetoMs);
    pend.set(meu, (m) => (clearTimeout(alarme), resolve(m)));
    ws.send(JSON.stringify({ id: meu, method, params }));
  });
const avaliar = async (expr) =>
  (await cdp("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;
const tecla = (code) =>
  avaliar(
    `window.dispatchEvent(new KeyboardEvent('keydown', { code: ${JSON.stringify(code)}, key: ${JSON.stringify(code === "Enter" ? "Enter" : "")}, bubbles: true })), 1`,
  );
/** Digita no chat e manda (mesmo caminho do PC: Enter abre, Enter envia). */
async function dizer(texto) {
  await tecla("Enter");
  await espera(200);
  await avaliar(`(() => {
    const f = document.getElementById('chat-input');
    if (!f) return 'sem campo';
    f.value = ${JSON.stringify(texto)};
    f.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true }));
    return 'ok';
  })()`);
  await espera(320);
}
const foto = async (nome) => {
  const r = await cdp("Page.captureScreenshot", { format: "png" });
  if (!r.result?.data) return;
  const buf = Buffer.from(r.result.data, "base64");
  writeFileSync(join(SAIDA, nome), buf);
  diga(`  ✓ ${nome} (${(buf.length / 1024).toFixed(0)} KB) em ${SAIDA}`);
};
let falhas = 0;
const ok = (cond, msg) => {
  diga(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
/** Espera uma condição do DOM, sondando a cada 100 ms. Devolve o último valor
 *  lido, satisfeito ou não — a asserção é de quem chamou. */
async function ateQue(ler, satisfeito, limiteMs = 4000) {
  const fim = Date.now() + limiteMs;
  let v = await ler();
  while (!satisfeito(v) && Date.now() < fim) {
    await espera(100);
    v = await ler();
  }
  return v;
}
await cdp("Runtime.enable");
await cdp("Page.enable");

const PASTA_PERFIS = join(process.cwd(), "profiles");
const perfisAntes = new Set(existsSync(PASTA_PERFIS) ? readdirSync(PASTA_PERFIS) : []);
const perfisNovos = () =>
  existsSync(PASTA_PERFIS) ? readdirSync(PASTA_PERFIS).filter((f) => !perfisAntes.has(f)) : [];

diga(`▶ ${BASE} — /perfil pedido pela professora, gravado pelo jogo da aluna\n`);
await cdp("Page.navigate", { url: `${BASE}/?server=ws://localhost:${PORTA_WS}&nome=ana&pin=1111` });
let pronto = false;
for (let i = 0; i < 90; i++) {
  await espera(1000);
  if (await avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`)) { pronto = true; break; }
}
if (!pronto) { console.error("✗ o mundo não ficou pronto"); encerrar(1); }
await cdp("Page.bringToFront"); // aba em 2º plano não pinta quadro — e sem quadro a gravação não anda

// a professora é um socket cru: o que se testa aqui é o navegador da ALUNA
const prof = new WebSocket(`ws://localhost:${PORTA_WS}`);
const respostasProf = [];
prof.onopen = () => prof.send(JSON.stringify({ type: "join", name: "profa", pin: "1234", codigo: "prof2026" }));
prof.onmessage = (e) => {
  if (typeof e.data !== "string") return;
  const m = JSON.parse(e.data);
  if (m.type === "ping") prof.send(JSON.stringify({ type: "pong", t: m.t })); // bug-672
  if (m.type === "chat") respostasProf.push(m.text);
};
await espera(800);

const f3Aberto = () => avaliar(`!document.getElementById('hud')?.classList.contains('hidden')`);
ok((await f3Aberto()) === false, "o F3 da aluna começa FECHADO");

prof.send(JSON.stringify({ type: "chat", text: "/perfil 5" }));
const lote = await ateQue(
  async () => respostasProf.map((t) => /perf-turma-([a-z0-9]+)-/.exec(t)?.[1]).find(Boolean),
  (v) => v !== undefined,
  3000,
);
ok(lote !== undefined, `o host aceitou e disse o lote (${lote})`);

const aviso = await ateQue(
  () => avaliar(`document.getElementById('chat-log')?.textContent ?? ''`),
  (t) => t.includes("o professor pediu uma medição de desempenho"),
  3000,
);
ok(aviso.includes("por 5 s"), "a aluna foi avisada no chat, com a duração");
await foto("01-aviso-no-chat.png");

// 5 s de gravação + folga; o F3 é AMOSTRADO o tempo todo — abrir e fechar no
// meio também seria defeito, e uma leitura só no fim não pegaria
let f3Abriu = false;
const arquivo = await ateQue(
  async () => {
    if (await f3Aberto()) f3Abriu = true;
    return perfisNovos().find((f) => f.startsWith(`perf-turma-${lote}-`));
  },
  (v) => v !== undefined,
  15000,
);
ok(arquivo !== undefined, `o perfil chegou em profiles/: ${arquivo}`);
ok(!f3Abriu, "o F3 NÃO abriu na tela da aluna durante a gravação");
if (arquivo) {
  const perfil = JSON.parse(readFileSync(join(PASTA_PERFIS, arquivo), "utf8"));
  ok(perfil.pedido?.lote === lote, "o conteúdo traz o lote do pedido");
  const frames = JSON.stringify(perfil).match(/"frames":\s*(\d+)/)?.[1];
  ok(Number(frames) > 0, `é um perfil de verdade, com quadros gravados (frames: ${frames})`);
}
const fim = await ateQue(
  () => avaliar(`document.getElementById('chat-log')?.textContent ?? ''`),
  (t) => t.includes("o professor recebeu a medição"),
  3000,
);
ok(fim.includes("o professor recebeu a medição"), "e foi avisada que acabou");
await foto("02-fim.png");

ok(excecoes.length === 0, `sem exceção na página (${excecoes.length}) ${excecoes.slice(0, 2).join(" | ")}`);

// profiles/ é pasta de DADO do usuário — a sonda leva o próprio lixo embora
for (const f of perfisNovos()) rmSync(join(PASTA_PERFIS, f), { force: true });
prof.close();

diga(falhas === 0 ? "\n✓ SONDA /perfil OK" : `\n✗ SONDA /perfil: ${falhas} falha(s)`);
encerrar(falhas === 0 ? 0 : 1);
