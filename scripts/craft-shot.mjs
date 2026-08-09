#!/usr/bin/env node
/**
 * Print do painel de CRAFT (§🍖 F5) — inspeção visual do gesto tocar-pra-fabricar
 * e do "falta N" em vermelho. Congela a mochila por `?mochila=` (2 troncos,
 * 3 tábuas, 3 ferro → mistura de fabricável e faltando), cria um mundo P pelo
 * menu, abre o E e a aba "criar", e fotografa `#inventario`.
 *
 * ⚠️ PRECISA do binário do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`).
 * Instalar com `npx -y @puppeteer/browsers install chrome@stable` — ver o
 * handoff no `.wolf/TODO.md` (§ puppeteer). Sem chrome, sai com "Chrome não
 * encontrado".
 *
 * Uso:
 *   npm run dev                 # vite 5173, em outro terminal
 *   npm run shots:craft         # 1024×600 (Kindle Fire), coarse
 *   BASE=http://localhost:8080 npm run shots:craft   # contra o build servido
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const BASE = process.env["BASE"] ?? "http://localhost:5173";
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "craft");
const PORTA = 9355;
mkdirSync(SAIDA, { recursive: true });

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
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(acharChrome(), [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--enable-unsafe-swiftshader",
  `--window-size=${L},${A}`, `--remote-debugging-port=${PORTA}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-craft-"))}`, "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });

async function abrirAba() {
  for (let i = 0; i < 40; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json();
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
const excecoes = [];
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  else if (m.method === "Runtime.exceptionThrown")
    excecoes.push(m.params.exceptionDetails.exception?.description ?? "?");
});
const cdp = (method, params = {}) =>
  new Promise((r) => { const meu = ++id; pend.set(meu, r); ws.send(JSON.stringify({ id: meu, method, params })); });
const avaliar = async (expr) =>
  (await cdp("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;
const tecla = (code) =>
  avaliar(`window.dispatchEvent(new KeyboardEvent('keydown', { code: ${JSON.stringify(code)}, bubbles: true })), 1`);

await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Emulation.setDeviceMetricsOverride", { width: L, height: A, deviceScaleFactor: 1, mobile: true });
await cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await cdp("Emulation.setEmulatedMedia", {
  features: [{ name: "pointer", value: "coarse" }, { name: "any-pointer", value: "coarse" }],
});

// 2 troncos (id 6), 3 tábuas (7), 3 ferro (117): tábuas/laje/balde fabricáveis; escada/mesa/cerca faltando
await cdp("Page.navigate", { url: `${BASE}/?mochila=6x2,7x3,117x3` });
await espera(2500);
await avaliar(`document.getElementById('menu-nome').value='profa'; document.getElementById('menu-btn-single').click()`);
await espera(1000);
await avaliar(`document.getElementById('menu-new-nome').value='craft'; document.getElementById('menu-new-tamanho').value='P'; document.getElementById('menu-btn-new').click()`);
for (let i = 0; i < 150; i++) {
  await espera(1000);
  if (await avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`)) break;
}
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(1200);
await tecla("KeyE");
await espera(700);
const abriu = await avaliar(`(() => {
  const t = [...document.querySelectorAll('.inv-aba')].find(b => b.textContent === 'criar');
  if (!t) return false; t.click(); return true;
})()`);
await espera(500);
const linhas = await avaliar(`document.querySelectorAll('.craft-row').length`);
const habil = await avaliar(`[...document.querySelectorAll('.craft-row')].filter(b => !b.disabled).length`);
const faltas = await avaliar(`document.querySelectorAll('.craft-custo .falta').length`);
console.log(`aba criar: ${abriu ? "abriu" : "NÃO"} · linhas=${linhas} · habilitadas=${habil} · marcas 'falta'=${faltas}`);

const r = await cdp("Page.captureScreenshot", { format: "png" });
if (r.result?.data) {
  const buf = Buffer.from(r.result.data, "base64");
  writeFileSync(join(SAIDA, "craft-panel.png"), buf);
  console.log(`  ✓ craft-panel.png (${(buf.length / 1024).toFixed(0)} KB) em ${SAIDA}`);
}

// 2026-08-05: com a cobertura total de receitas a lista passou de 12 pra 110
// linhas, e o interruptor "só o que dá pra fazer agora" é o que a torna
// utilizável de mochila vazia. A conferência é A/B no MESMO estado: marcar tem
// de deixar só as habilitadas, e desmarcar tem de devolver a lista inteira.
await avaliar(`document.querySelector('.craft-so input').click(), 1`);
await espera(400);
const soLinhas = await avaliar(`document.querySelectorAll('.craft-row').length`);
const soDesab = await avaliar(`[...document.querySelectorAll('.craft-row')].filter(b => b.disabled).length`);
console.log(
  `  ${soLinhas === habil && soDesab === 0 ? "✓" : "✗"} "só o que dá agora": ${linhas} → ${soLinhas} linhas (habilitadas=${habil}, cinzas na lista=${soDesab})`,
);
const r2 = await cdp("Page.captureScreenshot", { format: "png" });
if (r2.result?.data) {
  const buf = Buffer.from(r2.result.data, "base64");
  writeFileSync(join(SAIDA, "craft-so-possiveis.png"), buf);
  console.log(`  ✓ craft-so-possiveis.png (${(buf.length / 1024).toFixed(0)} KB)`);
}
await avaliar(`document.querySelector('.craft-so input').click(), 1`);
await espera(400);
const voltou = await avaliar(`document.querySelectorAll('.craft-row').length`);
console.log(`  ${voltou === linhas ? "✓" : "✗"} desmarcar devolve a lista inteira (${voltou})`);
console.log(excecoes.length ? `✗ exceções: ${excecoes.join(" | ")}` : "✓ sem exceção no console");
ws.close();
chrome.kill("SIGKILL");
process.exit(0);
