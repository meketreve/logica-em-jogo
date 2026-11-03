#!/usr/bin/env node
/**
 * §🖥️ Miniaturas dos cartões do PAINEL do professor (2026-11-03).
 *
 * Cada aula de `cenarios/` (e o mundo livre) sobe num host de verdade, um
 * Chrome entra como aluno e tira UMA foto do que a criança vê ao nascer. Sai em
 * `server/painel/miniaturas/<nome>.jpg` (versionado: o painel não gera nada na
 * escola). Rodar de novo só quando uma aula mudar de cara.
 *
 * ⚠️ Serve `client/dist`: `npm run build` antes. ⚠️ Chrome: `CHROME=…` ou o do
 * puppeteer/sistema (mesma busca das sondas).
 *
 * Uso: npm run miniaturas            (todas)
 *      npm run miniaturas -- aula8   (filtra por nome)
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { connect } from "node:net";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const PORTA = 8145;
const PORTA_CDP = 9392;
const RAIZ = process.cwd();
const SAIDA = join(RAIZ, "server/painel/miniaturas");
const filtro = process.argv.slice(2);
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
  for (const p of ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]) if (existsSync(p)) return p;
  throw new Error("Chrome não encontrado — passe CHROME=…");
}

async function portaAberta(porta) {
  return new Promise((r) => {
    const s = connect({ port: porta, host: "127.0.0.1" });
    s.once("connect", () => (s.destroy(), r(true)));
    s.once("error", () => (s.destroy(), r(false)));
  });
}

const alvos = [
  ...readdirSync(join(RAIZ, "cenarios"))
    .filter((f) => f.endsWith(".ljw"))
    .map((f) => ({ nome: f.slice(0, -4), env: { LJ_SAVE: `cenarios/${f}` } })),
  // o mundo livre nasce na hora: um mundo P de semente fixa, descartado no fim
  { nome: "mundo-livre", env: { LJ_SAVE: "mundos/_mini-livre.ljw", LJ_NOVO: "1", LJ_TAMANHO: "P", LJ_SEED: "20260726" }, lixo: "mundos/_mini-livre" },
].filter((a) => filtro.length === 0 || filtro.some((f) => a.nome.includes(f)));

const PERFIL = mkdtempSync(join(tmpdir(), "lj-mini-"));
const chrome = spawn(
  acharChrome(),
  ["--headless=new", "--no-sandbox", "--disable-gpu", "--enable-unsafe-swiftshader", "--window-size=960,540", `--remote-debugging-port=${PORTA_CDP}`, `--user-data-dir=${PERFIL}`, "about:blank"],
  { detached: true, stdio: "ignore" },
);
let host = null;
function encerrar(cod) {
  try { process.kill(-chrome.pid, "SIGKILL"); } catch { /* já foi */ }
  try { if (host) process.kill(-host.pid, "SIGTERM"); } catch { /* já foi */ }
  setTimeout(() => {
    rmSync(PERFIL, { recursive: true, force: true });
    rmSync(join(RAIZ, "mundos/_mini-livre"), { recursive: true, force: true });
    process.exit(cod);
  }, 800);
}
for (const s of ["SIGINT", "SIGTERM"]) process.on(s, () => encerrar(130));

let aba = null;
for (let i = 0; i < 60 && !aba; i++) {
  try {
    aba = (await (await fetch(`http://127.0.0.1:${PORTA_CDP}/json/list`)).json()).find((t) => t.type === "page");
  } catch { /* subindo */ }
  if (!aba) await espera(250);
}
if (!aba) { console.error("o Chrome não abriu"); encerrar(1); }
const ws = new WebSocket(aba.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pend = new Map();
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) (pend.get(m.id)(m), pend.delete(m.id));
});
const cdp = (method, params = {}) =>
  new Promise((ok, falha) => {
    const meu = ++id;
    const t = setTimeout(() => (pend.delete(meu), falha(new Error(`CDP travou em ${method}`))), 30000);
    pend.set(meu, (m) => (clearTimeout(t), ok(m)));
    ws.send(JSON.stringify({ id: meu, method, params }));
  });
const avaliar = async (e) => (await cdp("Runtime.evaluate", { expression: e, returnByValue: true })).result?.result?.value;
await cdp("Page.enable");

let falhas = 0;
for (const alvo of alvos) {
  host = spawn(process.execPath, ["--import", "tsx", "server/src/index.ts"], {
    env: { ...process.env, LJ_PORT: String(PORTA), LJ_CODIGO: "prof2026", ...alvo.env },
    detached: true,
    stdio: "ignore",
  });
  let subiu = false;
  for (let i = 0; i < 120 && !subiu; i++) (subiu = await portaAberta(PORTA)) || (await espera(250));
  if (!subiu) { diga(`  ✗ ${alvo.nome}: o host não subiu`); falhas++; continue; }
  // meio-dia forçado: a foto não pode sair de noite por causa da hora do mundo
  await cdp("Page.navigate", { url: `http://localhost:${PORTA}/?server=ws://localhost:${PORTA}&nome=foto&pin=1111&hora=11&pitch=-0.3` });
  let pronto = false;
  for (let i = 0; i < 90 && !pronto; i++) {
    await espera(1000);
    pronto = await avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`);
  }
  await espera(2500); // o terreno em volta termina de montar
  // só o MUNDO na foto: menu de pausa (headless não trava o mouse), chat,
  // objetivos e hotbar somem — esconde tudo que não é o canvas nem caminho até ele
  await avaliar(`(() => {
    const cv = document.querySelector('canvas');
    for (const el of document.body.querySelectorAll('*')) {
      if (el === cv || el.contains(cv) || el.tagName === 'SCRIPT') continue;
      if (cv && cv.contains(el)) continue;
      el.style.setProperty('visibility', 'hidden', 'important');
    }
    return 1;
  })()`);
  await espera(400);
  if (!pronto) { diga(`  ✗ ${alvo.nome}: o mundo não ficou pronto`); falhas++; }
  else {
    const r = await cdp("Page.captureScreenshot", { format: "jpeg", quality: 72 });
    const buf = Buffer.from(r.result.data, "base64");
    writeFileSync(join(SAIDA, `${alvo.nome}.jpg`), buf);
    diga(`  ✓ ${alvo.nome}.jpg (${(buf.length / 1024).toFixed(0)} KB)`);
  }
  await cdp("Page.navigate", { url: "about:blank" });
  try { process.kill(-host.pid, "SIGTERM"); } catch { /* já foi */ }
  for (let i = 0; i < 40 && (await portaAberta(PORTA)); i++) await espera(250);
  if (alvo.lixo) rmSync(join(RAIZ, alvo.lixo), { recursive: true, force: true });
}
diga(falhas === 0 ? `\n✓ ${alvos.length} miniatura(s) em server/painel/miniaturas/` : `\n✗ ${falhas} falha(s)`);
host = null;
encerrar(falhas === 0 ? 0 : 1);
