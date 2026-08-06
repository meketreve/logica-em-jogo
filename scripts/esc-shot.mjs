#!/usr/bin/env node
/**
 * §🎮 O Esc, num Chrome headless de DESKTOP (2026-08-06).
 *
 * A regra "um menu por vez" (§48) e o "Esc fecha qualquer menu" (2026-08-05)
 * tinham asserção só no `shots:toque` — e o toque é justamente o aparelho onde
 * pointer lock NÃO existe. O caminho de teclado ficava sem ninguém, e foi por
 * ali que o bug-597 passou: fechar um painel com Esc PISCAVA o menu de pausa
 * por mais de um segundo.
 *
 * A causa não está no Esc, está no ponteiro. O Esc do painel É o Esc do
 * usuário, e o Chrome recusa `requestPointerLock` por ~1,25 s depois dele
 * (bug-585). O `input.lock()` que vem logo atrás falha, e "sem ponteiro
 * travado" era indistinguível de "o aluno pediu pausa" pra quem só olhava o
 * `locked`. No headless a carência é curta e o menu só pisca; no Chrome do
 * aluno ele FICA, e a leitura é "o Esc fechou o menu e abriu o de pausa".
 *
 * As três perguntas, e a terceira existe porque a correção podia esconder o
 * menu pra sempre:
 *   1. Esc com painel aberto FECHA o painel e não abre o menu de pausa.
 *   2. Esc com a tela livre ABRE o menu de pausa (o comportamento que fica).
 *   3. Com o pointer lock recusado DE VEZ, o menu de pausa volta — senão o
 *      aluno ficaria sem nenhum jeito de sair do jogo.
 *
 * ⚠️ Serve `client/dist`: rodar `npm run build` ANTES.
 * ⚠️ PRECISA do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`).
 *
 * Uso: npm run shots:esc
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8141;
const PORTA_CDP = 9389;
const BASE = process.env["BASE"] ?? `http://localhost:${PORTA_WS}`;
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "esc");
const MUNDO = "mundos/_shot-esc";
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
  try {
    chrome?.kill();
  } catch {
    /* já morreu */
  }
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
chrome = spawn(
  acharChrome(),
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--enable-unsafe-swiftshader",
    `--window-size=${L},${A}`,
    `--remote-debugging-port=${PORTA_CDP}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-escbug-"))}`,
    "about:blank",
  ],
  {
    stdio: ["ignore", "ignore", "pipe"],
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


diga(`▶ ${BASE} — o Esc no teclado (desktop, com pointer lock)\n`);
await cdp("Page.navigate", {
  url: `${BASE}/?server=ws://localhost:${PORTA_WS}&nome=profa&pin=1234&codigo=prof2026`,
});
let pronto = false;
for (let i = 0; i < 90; i++) {
  await espera(1000);
  if (await avaliar(`!!document.querySelector('#hotbar .slot')`)) { pronto = true; break; }
}
if (!pronto) { console.error("✗ o mundo não ficou pronto"); encerrar(1); }

const aberto = (id) =>
  `(() => { const e = document.getElementById(${JSON.stringify(id)}); return !!e && !e.classList.contains('hidden'); })()`;
/** Menu de pausa na tela? Painel na tela? Jogo com o ponteiro? */
const estado = () => avaliar(`(() => ({
  pausa: ${aberto("overlay")},
  painel: ['inventario','container','amigos','painel','jogadores'].some(
    id => { const e = document.getElementById(id); return !!e && !e.classList.contains('hidden'); }),
  travado: document.pointerLockElement !== null,
}))()`);

await cdp("Page.bringToFront");
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(1200);
// clique no canvas: é o gesto que trava o ponteiro de verdade
const centro = await avaliar(`(() => { const r = document.querySelector('canvas').getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
for (const type of ["mousePressed", "mouseReleased"]) {
  await cdp("Input.dispatchMouseEvent", { type, x: centro.x, y: centro.y, button: "left", clickCount: 1 });
}
const jogando = await ateQue(estado, (a) => a.travado === true, 5000);
if (!jogando.travado) {
  diga("  ⚠️ este Chrome não trava o ponteiro em headless — o teste não vale aqui");
  encerrar(2);
}
diga(`  jogando: ${JSON.stringify(jogando)}`);

diga("== A: Esc com a MOCHILA aberta fecha só ela (bug-597) ==");
await tecla("KeyE");
const comPainel = await ateQue(estado, (a) => a.painel === true, 3000);
ok(comPainel.painel, "a mochila abriu");
ok(!comPainel.pausa, "e o menu de pausa não veio junto");

await tecla("Escape");
// 3 s de amostras: o piscar do menu de pausa dura o tempo da carência do
// Chrome (~1,25 s), então uma leitura só depois de 2 s NÃO pegaria o defeito
const amostras = [];
for (let i = 0; i < 12; i++) { amostras.push(await estado()); await espera(250); }
ok(!amostras[0].painel, "o Esc fechou a mochila");
const piscou = amostras.filter((a) => a.pausa).length;
ok(piscou === 0, `o menu de pausa NÃO apareceu em nenhuma das 12 amostras (${piscou})`);
ok(amostras.at(-1).travado, "e o jogo recuperou o ponteiro sozinho");
await foto("01-depois-do-esc-no-painel.png");

diga("== B: Esc com a TELA LIVRE abre o menu de pausa ==");
const antes = await estado();
ok(antes.travado && !antes.pausa, "estava jogando antes do Esc");
await avaliar(`document.exitPointerLock()`); // é o que a tecla Esc faz no navegador
const pausado = await ateQue(estado, (a) => a.pausa === true, 4000);
ok(pausado.pausa, "o menu de pausa abriu");
await foto("02-menu-de-pausa.png");

diga("== C: pointer lock recusado DE VEZ ainda devolve o menu de pausa ==");
// sem isto a correção do A poderia esconder o menu pra sempre, e o aluno
// ficaria sem nenhum jeito de sair do jogo
await avaliar(`(() => {
  document.querySelector('canvas').requestPointerLock = () => {
    document.dispatchEvent(new Event('pointerlockerror'));
  };
  return 1;
})()`);
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
const teimoso = await ateQue(estado, (a) => a.pausa === true, 6000);
ok(teimoso.pausa, "duas recusas depois, o menu de pausa está de volta");

ok(excecoes.length === 0, `sem exceção no console (${excecoes.length})`);
for (const e of excecoes.slice(0, 5)) diga(`    ! ${e.split("\n")[0]}`);
diga(falhas ? `\nSHOTS /esc com ${falhas} falha(s)` : `\nSHOTS /esc OK — ${SAIDA}`);
encerrar(falhas ? 1 : 0);
