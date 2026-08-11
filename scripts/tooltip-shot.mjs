#!/usr/bin/env node
/**
 * §💬 SONDA DO TOOLTIP DE ITEM (`client/src/tooltip.ts`).
 *
 * O que ela prova, e por que cada asserção existe:
 *  - **A (PC, mouse):** passar o ponteiro num slot ABRE a caixa própria, com o
 *    nome E as linhas de "serve pra quê" (as seis vêm das tabelas do jogo);
 *    sair do slot FECHA; e a caixa nunca sai da tela.
 *  - **B (tablet, toque):** **toque e segure** abre — e o toque que abriu NÃO
 *    pega a pilha, que é o gesto de mover item do §🍖 F4. A asserção B1 (tap
 *    curto continua pegando) é o par dela: sem as duas juntas, "não pegou" seria
 *    igualmente satisfeito por um tooltip que quebrou o inventário inteiro.
 *
 * ⚠️ Sonda que passa com o conserto revertido é sonda vazia (lição do bug-610).
 * Aqui reverter apaga o `.tooltip-item` do DOM: A1..A6 e B2 caem juntas.
 *
 * ⚠️ PRECISA do binário do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`).
 *
 * Uso:
 *   npm run dev                 # vite 5173, em outro terminal
 *   npm run shots:tooltip
 *   BASE=http://localhost:8080 npm run shots:tooltip   # contra o build servido
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const L = Number(process.argv[2] ?? 1280);
const A = Number(process.argv[3] ?? 800);
const BASE = process.env["BASE"] ?? "http://localhost:5173";
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "tooltip");
const PORTA = 9361;
mkdirSync(SAIDA, { recursive: true });

// A mochila da sonda cobre os SEIS usos de uma vez (`shared/src/usos.ts`):
// 6 tronco (funde + queima) · 913 picareta de pedra (ferramenta) · 905 carvão
// (queima 8) · 917 batata crua (comida + funde) · 117 minério de ferro (funde +
// EXIGE picareta) · 182 plantação estágio 0 (colheita).
const MOCHILA = "6x2,913x1,905x8,917x3,117x4,182x1";

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
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-tip-"))}`, "about:blank",
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

let falhas = 0;
const ok = (cond, texto) => {
  if (!cond) falhas++;
  console.log(`  ${cond ? "✓" : "✗"} ${texto}`);
};

/** Centro do slot `i` da MOCHILA (a grade + a hotbar do painel, na ordem do DOM). */
const centroDoSlot = (i) => avaliar(`(() => {
  const b = document.querySelectorAll('#inventario .inv-hotbar .inv-slot')[${i}];
  if (!b) return null;
  const r = b.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
})()`);

/** O que a caixa está dizendo agora (`null` = escondida ou inexistente). */
const tooltip = () => avaliar(`(() => {
  const t = document.querySelector('.tooltip-item');
  if (!t || t.classList.contains('hidden')) return null;
  const r = t.getBoundingClientRect();
  return {
    nome: t.querySelector('.tip-nome')?.textContent ?? '',
    usos: [...t.querySelectorAll('.tip-uso')].map(u => u.textContent),
    caixa: { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) },
  };
})()`);

const mouseEm = (p) =>
  cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: p.x, y: p.y, buttons: 0 });
const toqueEm = (tipo, p) =>
  cdp("Input.dispatchTouchEvent", {
    type: tipo,
    touchPoints: tipo === "touchEnd" ? [] : [{ x: p.x, y: p.y, id: 1 }],
  });
/** Quantos slots estão marcados como "pego" (o gesto de mover do §🍖 F4). */
const pegos = () => avaliar(`document.querySelectorAll('#inventario .inv-slot.pego').length`);

await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Emulation.setDeviceMetricsOverride", { width: L, height: A, deviceScaleFactor: 1, mobile: false });

await cdp("Page.navigate", { url: `${BASE}/?mochila=${MOCHILA}` });
await espera(2500);
await avaliar(`document.getElementById('menu-nome').value='profa'; document.getElementById('menu-btn-single').click()`);
await espera(1000);
await avaliar(`document.getElementById('menu-new-nome').value='tip'; document.getElementById('menu-new-tamanho').value='P'; document.getElementById('menu-btn-new').click()`);
for (let i = 0; i < 150; i++) {
  await espera(1000);
  if (await avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`)) break;
}
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(1200);
await tecla("KeyE");
await espera(700);

// ---------------------------------------------------------------- seção A --
console.log("A — PC (mouse): a caixa abre no hover, diz o que o item faz, e fecha");
const p0 = await centroDoSlot(0);
ok(p0 !== null, `a mochila desenhou os slots (slot 0 em ${p0 ? `${p0.x},${p0.y}` : "—"})`);
if (!p0) { console.log("sem slots: o resto da sonda não tem o que medir"); process.exit(1); }

await mouseEm(p0);
await espera(250);
const tTronco = await tooltip();
ok(tTronco !== null, "A1 hover no tronco ABRE a caixa própria (`.tooltip-item`)");
ok(!!tTronco?.nome, `A2 a caixa traz o NOME do item ("${tTronco?.nome ?? ""}")`);
ok(
  (tTronco?.usos ?? []).some((u) => u.includes("fornalha")),
  `A3 e o "serve pra quê" das tabelas do jogo: ${JSON.stringify(tTronco?.usos ?? [])}`,
);

const p1 = await centroDoSlot(1);
await mouseEm(p1);
await espera(250);
const tPicareta = await tooltip();
ok(
  (tPicareta?.usos ?? []).some((u) => u.startsWith("⛏ quebra")),
  `A4 a picareta lista o que ELA destrava: ${JSON.stringify(tPicareta?.usos ?? [])}`,
);

const p4 = await centroDoSlot(4);
await mouseEm(p4);
await espera(250);
const tMinerio = await tooltip();
ok(
  (tMinerio?.usos ?? []).some((u) => u.includes("para quebrar: picareta de pedra")),
  `A5 o minério avisa a ferramenta que ele exige: ${JSON.stringify(tMinerio?.usos ?? [])}`,
);
ok(
  !!tMinerio &&
    tMinerio.caixa.l >= 0 && tMinerio.caixa.t >= 0 &&
    tMinerio.caixa.r <= L && tMinerio.caixa.b <= A,
  `A6 a caixa fica DENTRO da tela ${L}×${A} (${JSON.stringify(tMinerio?.caixa ?? {})})`,
);

const r1 = await cdp("Page.captureScreenshot", { format: "png" });
if (r1.result?.data) {
  const buf = Buffer.from(r1.result.data, "base64");
  writeFileSync(join(SAIDA, "tooltip-pc.png"), buf);
  console.log(`  · tooltip-pc.png (${(buf.length / 1024).toFixed(0)} KB) em ${SAIDA}`);
}

// sair do slot: a caixa some (era o buraco do `title`, que some sozinho)
await mouseEm({ x: 5, y: 5 });
await espera(250);
ok((await tooltip()) === null, "A7 tirar o ponteiro do slot FECHA a caixa");

// ---------------------------------------------------------------- seção B --
console.log("B — tablet (toque): segurar LÊ, e ler não pega a pilha (§🍖 F4)");
await cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await cdp("Emulation.setEmulatedMedia", {
  features: [{ name: "pointer", value: "coarse" }, { name: "any-pointer", value: "coarse" }],
});
await espera(400);
// ⚠️ `pointer: coarse` muda o CSS (alvo de dedo) e portanto o LAYOUT: as
// coordenadas medidas na seção A não apontam mais pro mesmo slot. Remedir.
const q0 = await centroDoSlot(0);
ok(q0 !== null, `os slots continuam na tela com pointer coarse (slot 0 em ${q0 ? `${q0.x},${q0.y}` : "—"})`);

// B1 — o tap CURTO continua sendo o gesto de pegar. Sem esta asserção, "o
// toque longo não pegou" também passaria num inventário completamente quebrado.
await toqueEm("touchStart", q0);
await espera(80);
await toqueEm("touchEnd", q0);
await espera(300);
ok((await pegos()) === 1, "B1 tap curto PEGA a pilha (o gesto do §🍖 F4 segue vivo)");
await toqueEm("touchStart", q0); // toca de novo pra soltar
await espera(80);
await toqueEm("touchEnd", q0);
await espera(300);
ok((await pegos()) === 0, "B1b tocar de novo SOLTA");

// B2 — toque e segure: abre a caixa e o toque não conta como tap
await toqueEm("touchStart", q0);
await espera(700);
const tToque = await tooltip();
ok(tToque !== null, `B2 toque-e-segure ABRE a caixa ("${tToque?.nome ?? ""}")`);
// no toque a caixa sobe: o dedo é uma mão inteira em cima do slot, e 16px
// ABAIXO dele a criança leria a própria unha
ok(
  !!tToque && tToque.caixa.b <= q0.y && tToque.caixa.t >= 0 && tToque.caixa.r <= L,
  `B2b a caixa nasce ACIMA do dedo e dentro da tela (${JSON.stringify(tToque?.caixa ?? {})}, dedo em y=${q0.y})`,
);
const r2 = await cdp("Page.captureScreenshot", { format: "png" });
if (r2.result?.data) {
  const buf = Buffer.from(r2.result.data, "base64");
  writeFileSync(join(SAIDA, "tooltip-toque.png"), buf);
  console.log(`  · tooltip-toque.png (${(buf.length / 1024).toFixed(0)} KB)`);
}
await toqueEm("touchEnd", q0);
await espera(400);
ok((await pegos()) === 0, "B3 o toque que ABRIU a caixa NÃO pegou a pilha");
ok((await tooltip()) !== null, "B4 a caixa fica na tela depois de o dedo sair (tempo de leitura)");
await espera(2800);
ok((await tooltip()) === null, "B5 ...e some sozinha depois");

console.log(excecoes.length ? `✗ exceções: ${excecoes.join(" | ")}` : "✓ sem exceção no console");
if (excecoes.length) falhas++;
console.log(falhas === 0 ? "\n✓ tooltip: todas as asserções passaram" : `\n✗ tooltip: ${falhas} falha(s)`);
ws.close();
chrome.kill("SIGKILL");
process.exit(falhas === 0 ? 0 : 1);
