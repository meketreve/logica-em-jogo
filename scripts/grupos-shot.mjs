#!/usr/bin/env node
/**
 * Print + medição da ABA "grupos" DO PAINEL P (2026-08-26) — a grade de botões
 * numerados do `/aula grupos X`.
 *
 * Por que existe: o teto de grupos subiu de 20 para 35 nesta data, e o painel
 * desenha UM BOTÃO POR GRUPO (`players.ts:renderGrupos`, laço até
 * `MAX_GRUPOS_AULA`). Subir a constante muda a tela sem passar por nenhum
 * arquivo do cliente — nenhum teste de unidade enxerga isso. A `.jog-row` que
 * segura os botões é `display: flex` **sem `flex-wrap`** e o `#jogadores` é
 * `overflow: hidden` de altura FIXA: se os 35 não couberem na largura, os
 * últimos são recortados e o professor não tem como escolher a turma inteira.
 *
 * A pergunta que só o olho responde: **o botão do último grupo está na tela e
 * dá pra tocar nele?** Esta sonda mede exatamente isso — quantidade, a caixa da
 * grade contra a caixa do painel, e `elementFromPoint` no centro do último
 * botão (que denuncia tanto o recorte quanto o botão coberto por outra coisa).
 *
 * ⚠️ `elementFromPoint` é o gate que não dá pra fraudar: um botão dentro da
 * caixa do painel mas fora da parte VISÍVEL da lista rolável ainda devolve
 * outra coisa. Por isso ele vale mais que comparar retângulos.
 *
 * ⚠️ Ela serve o cliente COMPILADO (o host Node serve `client/dist`): rode
 * `npm run build` antes, senão a página não existe.
 * ⚠️ PRECISA do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`).
 *
 * Uso:
 *   npm run build && npm run shots:grupos          # 1024×600 (Kindle Fire)
 *   node scripts/grupos-shot.mjs 600 1024          # retrato do tablet
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8109;
const BASE = process.env["BASE"] ?? `http://localhost:${PORTA_WS}`;
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "grupos");
const PORTA_CDP = 9359;
const MUNDO = "mundos/_shot-grupos";
const CODIGO = "prof2026";
mkdirSync(SAIDA, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

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
    LJ_SEED: "20260826",
    LJ_CODIGO: CODIGO,
  },
  detached: true,
  stdio: ["ignore", "ignore", "pipe"],
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
function encerrar(codigo) {
  try {
    process.kill(-servidor.pid, "SIGTERM");
  } catch {
    /* já morreu */
  }
  // o host GRAVA o mundo ao receber o sinal: apagar na hora deixa a pasta
  // renascer atrás do rm. Dá 1 s pro save fechar e só então limpa.
  setTimeout(() => {
    rmSync(join(process.cwd(), MUNDO), { recursive: true, force: true });
    process.exit(codigo);
  }, 1000);
}
process.on("uncaughtException", (e) => {
  console.error(e);
  encerrar(1);
});
process.on("unhandledRejection", (e) => {
  console.error(e);
  encerrar(1);
});
if (!(await esperaPorta(PORTA_WS))) {
  console.error("o host não subiu na porta", PORTA_WS);
  encerrar(1);
}

// --- navegador como PROFESSOR (é o código, não o PIN, que dá o papel) ---
const LIBS = join(homedir(), ".local/chrome-libs/usr/lib/x86_64-linux-gnu");
const chrome = spawn(
  acharChrome(),
  [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--enable-unsafe-swiftshader",
    `--window-size=${L},${A}`, `--remote-debugging-port=${PORTA_CDP}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-grupos-"))}`, "about:blank",
  ],
  {
    stdio: ["ignore", "ignore", "pipe"],
    env: existsSync(LIBS)
      ? { ...process.env, LD_LIBRARY_PATH: `${LIBS}:${process.env["LD_LIBRARY_PATH"] ?? ""}` }
      : process.env,
  },
);
async function abrirAba() {
  for (let i = 0; i < 40; i++) {
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
const cdp = (method, params = {}) =>
  new Promise((r) => {
    const meu = ++id;
    pend.set(meu, r);
    ws.send(JSON.stringify({ id: meu, method, params }));
  });
const avaliar = async (expr) =>
  (await cdp("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;
const tecla = (code) =>
  avaliar(
    `window.dispatchEvent(new KeyboardEvent('keydown', { code: ${JSON.stringify(code)}, bubbles: true })), 1`,
  );
/** Clica o botão cujo texto COMEÇA com `rotulo`, dentro de `escopo`. */
const clicar = (escopo, rotulo) =>
  avaliar(`(() => {
  const b = [...document.querySelectorAll(${JSON.stringify(escopo)} + ' button')]
    .find(x => (x.textContent ?? '').startsWith(${JSON.stringify(rotulo)}));
  if (!b) return 'sem botão ' + ${JSON.stringify(rotulo)};
  b.click(); return 'ok';
})()`);
const foto = async (nome) => {
  const r = await cdp("Page.captureScreenshot", { format: "png" });
  if (!r.result?.data) return;
  const buf = Buffer.from(r.result.data, "base64");
  writeFileSync(join(SAIDA, nome), buf);
  console.log(`  ✓ ${nome} (${(buf.length / 1024).toFixed(0)} KB) em ${SAIDA}`);
};

await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Emulation.setDeviceMetricsOverride", { width: L, height: A, deviceScaleFactor: 1, mobile: true });
await cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await cdp("Emulation.setEmulatedMedia", {
  features: [
    { name: "pointer", value: "coarse" },
    { name: "any-pointer", value: "coarse" },
  ],
});

await cdp("Page.navigate", {
  url: `${BASE}/?server=ws://localhost:${PORTA_WS}&nome=prof&pin=0000&codigo=${CODIGO}`,
});
for (let i = 0; i < 90; i++) {
  await espera(1000);
  if (await avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`)) break;
}
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(1500);

let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};

console.log(`== painel P → aba grupos, a ${L}×${A} ==`);
// o painel de jogadores NÃO tem tecla própria: abre por um botão no topo do
// painel de autoria, que é quem responde à tecla (`main.ts:1316`)
await tecla("KeyP");
await espera(600);
ok(
  (await avaliar(`!document.getElementById('painel')?.classList.contains('hidden')`)) === true,
  "a tecla P abriu o painel de autoria (o papel de professor pegou)",
);
ok((await clicar("#painel", "👥 jogadores")) === "ok", "o botão 👥 jogadores abriu o painel P");
await espera(600);
ok((await clicar("#jogadores", "grupos")) === "ok", "a aba grupos foi selecionada");
await espera(400);

// --- a medida ---
const m = await avaliar(`(() => {
  const painel = document.getElementById('jogadores');
  const lista = painel?.querySelector('.jog-lista');
  const fileira = lista?.querySelector('.jog-grade');
  if (!painel || !lista || !fileira) return null;
  const bs = [...fileira.querySelectorAll('button')];
  const r = (el) => { const b = el.getBoundingClientRect();
    return { e: Math.round(b.left), d: Math.round(b.right), t: Math.round(b.top),
             b: Math.round(b.bottom), l: Math.round(b.width), a: Math.round(b.height) }; };
  const ultimo = bs.at(-1);
  const cu = ultimo?.getBoundingClientRect();
  const cx = cu ? cu.left + cu.width / 2 : -1, cy = cu ? cu.top + cu.height / 2 : -1;
  const pego = cu ? document.elementFromPoint(cx, cy) : null;
  return {
    n: bs.length,
    rotulos: { primeiro: bs[0]?.textContent, ultimo: ultimo?.textContent },
    painel: r(painel), lista: r(lista), fileira: r(fileira),
    ultimoBtn: cu ? r(ultimo) : null,
    // a fileira é flex SEM wrap: se o conteúdo é mais largo que a caixa, os
    // últimos botões saem pela direita e o overflow:hidden do painel os come
    transbordo: Math.round(fileira.scrollWidth - fileira.clientWidth),
    menorAlvo: bs.length ? Math.min(...bs.map(b => Math.round(b.getBoundingClientRect().height))) : 0,
    menorLargura: bs.length ? Math.min(...bs.map(b => Math.round(b.getBoundingClientRect().width))) : 0,
    // quem REALMENTE está no centro do último botão: ele mesmo = tocável
    noCentroDoUltimo: pego ? (pego.tagName + '.' + (pego.className || '-') + ':' + (pego.textContent ?? '').slice(0, 6)) : 'nada',
    ultimoEhOProprio: pego === ultimo || (ultimo?.contains(pego) ?? false),
    viewport: { l: window.innerWidth, a: window.innerHeight },
  };
})()`);

if (!m) {
  ok(false, "não achei #jogadores / .jog-lista / .jog-grade — a aba grupos não desenhou");
} else {
  console.log("  medida:", JSON.stringify(m, null, 2).replace(/\n/g, "\n  "));
  ok(m.n === 35, `a grade tem ${m.n} botões (esperado 35 = MAX_GRUPOS_AULA)`);
  ok(m.rotulos.ultimo === "35", `o último botão é "${m.rotulos.ultimo}" (esperado "35")`);
  ok(m.transbordo <= 0, `a fileira NÃO transborda na horizontal (sobra ${m.transbordo}px de conteúdo)`);
  ok(
    m.ultimoBtn !== null && m.ultimoBtn.d <= m.painel.d && m.ultimoBtn.b <= m.painel.b,
    `o botão 35 cabe DENTRO do painel (dir ${m.ultimoBtn?.d} ≤ ${m.painel.d}, base ${m.ultimoBtn?.b} ≤ ${m.painel.b})`,
  );
  ok(
    m.ultimoBtn !== null && m.ultimoBtn.d <= m.viewport.l && m.ultimoBtn.b <= m.viewport.a,
    `e dentro da viewport de ${m.viewport.l}×${m.viewport.a}`,
  );
  ok(m.ultimoEhOProprio === true, `o centro do botão 35 é o próprio botão (achei "${m.noCentroDoUltimo}")`);
  ok(m.menorAlvo >= 40, `menor alvo de toque = ${m.menorAlvo}px (piso de 40 em pointer:coarse)`);
}
await foto(`grupos-${L}x${A}.png`);

console.log(excecoes.length ? `✗ exceções: ${excecoes.join(" | ")}` : "✓ sem exceção no console");
if (excecoes.length) falhas++;
ws.close();
chrome.kill("SIGKILL");
console.log(falhas === 0 ? `\nABA GRUPOS OK a ${L}×${A}` : `\nFALHOU (${falhas}) a ${L}×${A}`);
encerrar(falhas === 0 ? 0 : 1);
