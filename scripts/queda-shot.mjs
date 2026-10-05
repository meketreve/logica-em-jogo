#!/usr/bin/env node
/**
 * Sonda da QUEDA EM JOGO (bug-675) contra o host REAL + Chrome real (CDP).
 *
 * O que ela prova, com asserção (não só print):
 * 1. a criança entra e o jogo aparece (hotbar na tela, menu fora);
 * 2. o servidor DERRUBA o cliente pelo heartbeat (bug-675). O cliente para de
 *    responder `pong` — é o que o tablet congelado faz —, mas a PÁGINA segue
 *    viva e o HOST também. Matar o host seria outro teste e um pior: a página
 *    é servida por ele, então o recarregamento não teria de onde vir;
 * 3. o cliente VOLTA SOZINHO pro painel principal — antes ele ficava olhando
 *    um mundo congelado, sem saber que precisava recarregar na mão;
 * 4. e o motivo aparece escrito pra criança, em vez de tela muda.
 *
 * ⚠️ Serve o cliente COMPILADO: `npm run build` antes.
 *
 * Uso: npm run build && npm run shots:queda
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = 1024, A = 600;
const PORTA_WS = 8131, PORTA_CDP = 9381;
const BASE = `http://localhost:${PORTA_WS}`;
const SAIDA = process.env["SAIDA"] ?? join(process.cwd(), ".wolf/designqc-captures", "queda");
const MUNDO = "mundos/_shot-queda";
mkdirSync(SAIDA, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
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
  throw new Error("Chrome não encontrado — CHROME=… ou instale com @puppeteer/browsers");
}

rmSync(join(process.cwd(), MUNDO), { recursive: true, force: true });
const servidor = spawn("npx", ["tsx", "server/src/index.ts"], {
  env: { ...process.env, LJ_PORT: String(PORTA_WS), LJ_SAVE: `${MUNDO}.ljw`, LJ_NOVO: "1",
         LJ_TAMANHO: "P", LJ_SEED: "20260805", LJ_CODIGO: "prof2026" },
  detached: true, stdio: ["ignore", "ignore", "pipe"],
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
let hostVivo = true;
function matarHost() {
  if (!hostVivo) return;
  hostVivo = false;
  try { process.kill(-servidor.pid, "SIGKILL"); } catch { /* já morreu */ }
}
function encerrar(codigo) {
  try { chrome?.kill(); } catch { /* já morreu */ }
  matarHost();
  setTimeout(() => {
    rmSync(join(process.cwd(), MUNDO), { recursive: true, force: true });
    process.exit(codigo);
  }, 500);
}
process.on("uncaughtException", (e) => (console.error(e), encerrar(1)));
process.on("unhandledRejection", (e) => (console.error(e), encerrar(1)));
if (!(await esperaPorta(PORTA_WS))) { console.error("o host não subiu"); encerrar(1); }

const LIBS = join(homedir(), ".local/chrome-libs/usr/lib/x86_64-linux-gnu");
chrome = spawn(acharChrome(), [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--enable-unsafe-swiftshader",
  `--window-size=${L},${A}`, `--remote-debugging-port=${PORTA_CDP}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-queda-"))}`, "about:blank",
], { stdio: ["ignore", "ignore", "pipe"],
     env: existsSync(LIBS) ? { ...process.env, LD_LIBRARY_PATH: `${LIBS}:${process.env["LD_LIBRARY_PATH"] ?? ""}` } : process.env });
async function abrirAba() {
  for (let i = 0; i < 60; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PORTA_CDP}/json/list`)).json();
      const aba = lista.find((t) => t.type === "page");
      if (aba) return aba;
    } catch { /* subindo */ }
    await espera(250);
  }
  throw new Error("chrome não abriu a porta de depuração");
}
const aba = await abrirAba();
const ws = new WebSocket(aba.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pend = new Map();
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  else if (m.method === "Page.javascriptDialogOpening") {
    ws.send(JSON.stringify({ id: ++id, method: "Page.handleJavaScriptDialog", params: { accept: true } }));
  }
});
const cdp = (method, params = {}, tetoMs = 30000) =>
  new Promise((resolve, reject) => {
    const meu = ++id;
    const alarme = setTimeout(() => { pend.delete(meu); reject(new Error(`CDP travou em ${method}`)); }, tetoMs);
    pend.set(meu, (m) => (clearTimeout(alarme), resolve(m)));
    ws.send(JSON.stringify({ id: meu, method, params }));
  });
const avaliar = async (expr) =>
  (await cdp("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;
const foto = async (nome) => {
  const r = await cdp("Page.captureScreenshot", { format: "png" });
  if (!r.result?.data) return;
  const buf = Buffer.from(r.result.data, "base64");
  writeFileSync(join(SAIDA, nome), buf);
  diga(`  ✓ ${nome} (${(buf.length / 1024).toFixed(0)} KB)`);
};
let falhas = 0;
const ok = (cond, msg) => { diga(`  ${cond ? "✓" : "✗"} ${msg}`); if (!cond) falhas++; };
async function ateQue(ler, satisfeito, limiteMs = 15000) {
  const fim = Date.now() + limiteMs;
  let v = await ler();
  while (!satisfeito(v) && Date.now() < fim) { await espera(200); v = await ler(); }
  return v;
}
await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Emulation.setDeviceMetricsOverride", { width: L, height: A, deviceScaleFactor: 1, mobile: false });

diga(`▶ ${BASE}\n`);
await cdp("Page.navigate", { url: `${BASE}/?server=ws://localhost:${PORTA_WS}&nome=ana&pin=1111` });
const emJogo = () => avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`);
diga("== 1. a criança entra e o jogo aparece ==");
ok(await ateQue(emJogo, (v) => v === true, 60000) === true, "hotbar na tela (está em jogo)");
await foto("1-em-jogo.png");

diga("== 2. o cliente para de responder ao ping (tablet congelado) ==");
// Engole TUDO que o cliente mandaria: pro servidor é uma aba congelada; pro
// navegador, uma página viva que continua desenhando. Engolir só o `pong` não
// bastaria — o cliente manda `move` o tempo todo, e QUALQUER mensagem conta
// como sinal de vida (foi o que a 1ª rodada desta sonda mostrou).
const engoliu = await avaliar(`(() => {
  const orig = WebSocket.prototype.send;
  WebSocket.prototype.send = function () { return; };
  window.__origSend = orig;
  return true;
})()`);
ok(engoliu === true, "o cliente parou de falar com o servidor (host segue VIVO)");

diga("== 3. o cliente volta sozinho pro painel principal ==");
// O jogo TEM de ter saído da tela: menu visível com a hotbar ainda lá seria
// o menu que sempre esteve no DOM, não a volta ao painel (1ª rodada desta
// sonda deu esse falso positivo).
const noMenu = () =>
  avaliar(`(() => {
    const home = document.getElementById('menu-home');
    if (!home) return false;
    const visivel = home.offsetParent !== null || getComputedStyle(home).display !== 'none';
    return visivel && !document.querySelector('#hotbar .slot');
  })()`);
ok(await ateQue(noMenu, (v) => v === true, 40000) === true, "o painel principal (#menu-home) está na tela");
ok((await emJogo()) !== true, "e o mundo congelado saiu da frente");

diga("== 4. e a criança lê o motivo ==");
const aviso = await ateQue(
  () => avaliar(`document.getElementById('menu-erro')?.textContent ?? ''`),
  (t) => typeof t === "string" && t.length > 0,
  10000,
);
ok(/conex|tempo demais/i.test(aviso ?? ""), `o motivo aparece escrito (${JSON.stringify((aviso ?? "").slice(0, 60))})`);
await foto("2-voltou-ao-menu.png");

diga(`\n${falhas === 0 ? "✓ tudo certo" : `✗ ${falhas} falha(s)`}`);
encerrar(falhas === 0 ? 0 : 1);
