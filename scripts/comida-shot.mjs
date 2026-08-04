#!/usr/bin/env node
/**
 * Prints do §🍖 F6 (comida) — inspeção visual do que só o olho responde:
 *
 * 1. `comida-hotbar.png` — os ícones NOVOS na hotbar (muda, fruta, trigo, pão).
 *    São desenhados à mão em `blockIcons.ts` (item não tem tile no atlas), e a
 *    pergunta é se dão pra distinguir no tamanho de um slot.
 * 2. `comida-craft.png` — a receita do pão no painel "criar", filtrada.
 * 3. `comida-atlas.png` — o atlas com `?atlas`, que mostra os 4 tiles da
 *    plantação: é assim que se vê se o estágio maduro se destaca dos verdes
 *    sem precisar plantar e esperar um minuto.
 *
 * ⚠️ PRECISA do binário do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`),
 * igual ao `shots:craft`.
 *
 * Uso:
 *   npm run dev                 # vite 5173, em outro terminal
 *   npm run shots:comida        # 1024×600 (Kindle Fire), coarse
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const BASE = process.env["BASE"] ?? "http://localhost:5173";
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "comida");
const PORTA = 9356;
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
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-comida-"))}`, "about:blank",
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
async function fotografar(nome) {
  const r = await cdp("Page.captureScreenshot", { format: "png" });
  if (!r.result?.data) return;
  const buf = Buffer.from(r.result.data, "base64");
  writeFileSync(join(SAIDA, nome), buf);
  console.log(`  ✓ ${nome} (${(buf.length / 1024).toFixed(0)} KB) em ${SAIDA}`);
}

await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Emulation.setDeviceMetricsOverride", { width: L, height: A, deviceScaleFactor: 1, mobile: true });
await cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await cdp("Emulation.setEmulatedMedia", {
  features: [{ name: "pointer", value: "coarse" }, { name: "any-pointer", value: "coarse" }],
});

// muda (182), fruta (902), trigo (903), pão (904) + 3 troncos pra a lista de
// craft não ficar toda vermelha. `?atlas` desenha o atlas no canto.
await cdp("Page.navigate", { url: `${BASE}/?atlas&mochila=182x8,902x3,903x5,904x2,6x3` });
await espera(2500);
await avaliar(`document.getElementById('menu-nome').value='profa'; document.getElementById('menu-btn-single').click()`);
await espera(1000);
await avaliar(`document.getElementById('menu-new-nome').value='comida'; document.getElementById('menu-new-tamanho').value='P'; document.getElementById('menu-btn-new').click()`);
for (let i = 0; i < 150; i++) {
  await espera(1000);
  if (await avaliar(`!!document.querySelector('#hotbar .slot')`)) break;
}
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(1200);

const naMao = await avaliar(`document.querySelector('#hotbar .bar-nome')?.textContent`);
const slots = await avaliar(`document.querySelectorAll('#hotbar .slot img').length`);
console.log(`hotbar: ${slots} slots com ícone · na mão: "${naMao}"`);
await fotografar("comida-hotbar.png");
await fotografar("comida-atlas.png"); // o `?atlas` está no mesmo frame

await tecla("KeyE");
await espera(700);
await avaliar(`(() => {
  const t = [...document.querySelectorAll('.inv-aba')].find(b => b.textContent === 'criar');
  t?.click(); return !!t;
})()`);
await espera(400);
await avaliar(`(() => {
  const f = document.querySelector('#inventario input[type=text], .craft-filtro');
  if (!f) return false;
  f.value = 'pão'; f.dispatchEvent(new Event('input', { bubbles: true })); return true;
})()`);
await espera(500);
const linhas = await avaliar(`[...document.querySelectorAll('.craft-row')].map(b => b.textContent).join(' | ')`);
console.log(`filtro "pão": ${linhas || "(nada)"}`);
await fotografar("comida-craft.png");

console.log(excecoes.length ? `✗ exceções: ${excecoes.join(" | ")}` : "✓ sem exceção no console");
ws.close();
chrome.kill("SIGKILL");
process.exit(0);
