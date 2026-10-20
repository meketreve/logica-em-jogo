#!/usr/bin/env node
/**
 * §💰 Sonda do BALCÃO DE VENDA contra o host REAL + Chrome real (CDP),
 * 2026-10-20. Esqueleto copiado do `loja-shot.mjs`.
 *
 * **Por que sonda PRÓPRIA, e não uma seção na `shots:loja`:** a lição de
 * 2026-10-20 (LEARNINGS) é que seção nova numa sonda de mundo compartilhado
 * derruba seção de outra tela quando mexe no que elas dividem. O balcão não põe
 * nada no mundo — mas mexe na MOCHILA e no SALDO, que é exatamente o que as
 * sete seções da loja medem. Mundo e porta próprios custam 40 linhas e não
 * custam uma sessão de caça.
 *
 * O que ela prova, com asserção (não só print):
 * 1. `/vender` ABRE o painel com o título do balcão, total zerado e o botão
 *    DESLIGADO (desligado e não escondido — ver `balcaoRodape`);
 * 2. pôr trigo dentro mostra o preço UNITÁRIO embaixo do slot e o TOTAL no
 *    rodapé, e o saldo **não** muda — pôr no balcão não é vender;
 * 3. CONTROLE NEGATIVO: a TÁBUA não entra (1 tronco dá 4 — máquina de Dimas), o
 *    total continua 0 e o aluno ouve o motivo no chat;
 * 4. apertar vender SOBE o saldo no HUD pelo total e zera o balcão;
 * 5. fechar com item dentro DEVOLVE pra mochila (nada se perde no painel);
 * 6. a régua de 1024×600: o painel inteiro cabe sem rolar.
 *
 * ⚠️ O gesto é TOQUE de verdade (`Input.dispatchTouchEvent`): clique sintético
 * não prova nada no tablet (LEARNINGS).
 * ⚠️ Serve o cliente COMPILADO: `npm run build` antes.
 * ⚠️ Mundo descartável em `mundos/_shot-venda` (LJ_SAVE — nunca o world.ljw).
 *
 * Uso:
 *   npm run build && npm run shots:venda            # 1024×600 (tablet)
 *   npm run build && npm run shots:venda -- 1366 768
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
// portas PRÓPRIAS: a sonda da loja usa 8121/9369, e duas baterias ao mesmo
// tempo numa porta só é o "host órfão" que já fez smoke mentir (LEARNINGS)
const PORTA_WS = 8123;
const PORTA_CDP = 9371;
const BASE = `http://localhost:${PORTA_WS}`;
const SAIDA = process.env["SAIDA"] ?? join(process.cwd(), ".wolf/designqc-captures", "venda");
const MUNDO = "mundos/_shot-venda";
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
    LJ_SEED: "20261020",
    LJ_CODIGO: "prof2026",
    LJ_CRESCIMENTO: "200",
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
function matarChrome() {
  // o GRUPO, não o pai: um filho regrava o perfil depois do rmSync (LEARNINGS)
  try {
    process.kill(-chrome.pid, "SIGKILL");
  } catch {
    /* ainda não subiu, ou já morreu */
  }
}
function encerrar(codigo) {
  matarChrome();
  try {
    process.kill(-servidor.pid, "SIGTERM");
  } catch {
    /* já morreu */
  }
  // o host GRAVA o mundo no SIGTERM: apagar na hora deixa a pasta renascer
  // atrás do rm
  setTimeout(() => {
    rmSync(join(process.cwd(), MUNDO), { recursive: true, force: true });
    process.exit(codigo);
  }, 1000);
}
process.on("uncaughtException", (e) => (console.error(e), encerrar(1)));
process.on("unhandledRejection", (e) => (console.error(e), encerrar(1)));
for (const sinal of ["SIGINT", "SIGTERM"]) process.on(sinal, () => encerrar(130));
if (!(await esperaPorta(PORTA_WS))) {
  console.error("o host não subiu na porta", PORTA_WS);
  encerrar(1);
}

const LIBS = join(homedir(), ".local/chrome-libs/usr/lib/x86_64-linux-gnu");
const PERFIL = mkdtempSync(join(tmpdir(), "lj-venda-"));
process.on("exit", () => rmSync(PERFIL, { recursive: true, force: true }));
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
    detached: true,
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
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) {
    pend.get(m.id)(m);
    pend.delete(m.id);
  } else if (m.method === "Page.javascriptDialogOpening") {
    // o jogo pergunta "sair da página?" (beforeunload) — aceita, senão trava
    ws.send(
      JSON.stringify({ id: ++id, method: "Page.handleJavaScriptDialog", params: { accept: true } }),
    );
  }
});
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
/** Toque REAL — clique sintético não prova gesto de tablet (LEARNINGS). */
async function tocar(x, y) {
  await cdp("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await espera(120);
  await cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await espera(500);
}
/** Centro do slot de índice UNIFICADO `n` (`data-slot`, que é a identidade:
 *  0..26 mochila, 27+i balcão — o mesmo número que vai no fio). */
const centroDoSlot = (n) =>
  avaliar(`(() => {
    const b = document.querySelector('#container .inv-slot[data-slot="${n}"]');
    if (!b) return null;
    const r = b.getBoundingClientRect();
    if (r.width === 0) return null;
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) };
  })()`);
/** Toca na origem e no destino — o gesto do §🍖 F4 (pegar e pôr). */
async function mover(de, para) {
  const a = await centroDoSlot(de);
  const b = await centroDoSlot(para);
  if (!a || !b) return false;
  await tocar(a.x, a.y);
  await tocar(b.x, b.y);
  return true;
}
/** O estado do balcão, medido no DOM — é o que o aluno de fato vê. */
const balcao = () =>
  avaliar(`(() => {
    const r = document.getElementById('container');
    if (!r || r.classList.contains('hidden')) return null;
    const t = r.querySelector('.venda-total');
    const b = r.querySelector('.venda-btn');
    return {
      titulo: r.querySelector('h2')?.textContent ?? '',
      // a faixa que separa os dois lados: ela dizia "BAÚ" sobre o balcão até
      // o print de 2026-10-20 mostrar
      divisor: [...r.querySelectorAll('.cont-divisor span, .cont-divisor small, .cont-divisor b')].map((e) => e.textContent).join('|'),
      total: t ? Number(t.dataset.total) : null,
      textoTotal: t?.textContent ?? '',
      botao: b?.textContent ?? null,
      desligado: b ? b.disabled : null,
      // os rótulos "N cada" embaixo de cada slot ocupado do balcão
      precos: [...r.querySelectorAll('.cont-bau .cont-cel small')].map((s) => s.textContent),
      altura: Math.round(r.getBoundingClientRect().height),
      rolando: r.scrollHeight > r.clientHeight + 1,
    };
  })()`);
/** O saldo que o HUD mostra (nunca o que o script imagina). */
const saldoNoHud = () =>
  avaliar(`Number((document.getElementById('lj-dimas')?.textContent ?? '').replace(/[^0-9]/g, '')) || 0`);
/** Quanto a mochila tem do item `id`, somando todos os slots. */
const naMochila = (idItem) =>
  avaliar(`(() => {
    const r = document.getElementById('container');
    if (!r) return -1;
    let n = 0;
    for (const b of r.querySelectorAll('.inv-mochila .inv-slot, .inv-hotbar .inv-slot')) {
      if (b.dataset.item === String(${idItem})) n += Number(b.dataset.qtd ?? 0);
    }
    return n;
  })()`);
/** A última fala do servidor no chat. */
const ultimaFala = () =>
  avaliar(`(() => {
    const l = document.getElementById('chat-log');
    const linhas = l ? [...l.children] : [];
    return linhas.length ? linhas[linhas.length - 1].textContent : '';
  })()`);
const limparChat = () => avaliar(`(document.getElementById('chat-log')?.replaceChildren(), 1)`);
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
/** Espera o DOM, nunca um `sleep` seco: abrir/mover/vender são round-trip de
 *  servidor, e `espera()` fixa passa na máquina rápida e falha na carregada. */
async function ateQue(ler, satisfeito, limiteMs = 5000) {
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
await cdp("Emulation.setDeviceMetricsOverride", {
  width: L,
  height: A,
  deviceScaleFactor: 1,
  mobile: true,
});
await cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await cdp("Emulation.setEmulatedMedia", {
  features: [
    { name: "pointer", value: "coarse" },
    { name: "any-pointer", value: "coarse" },
  ],
});

const ITEM_TRIGO = 903;
const PLANKS = 7; // tábua: 1 tronco dá 4 — não se vende, e é o controle negativo
const INV_SLOTS = 27;
const noBalcao = (i) => INV_SLOTS + i;

async function entrar(qs) {
  await cdp("Page.navigate", { url: `${BASE}/?server=ws://localhost:${PORTA_WS}&${qs}` });
  for (let i = 0; i < 90; i++) {
    await espera(1000);
    if (await avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`)) {
      await avaliar(`document.getElementById('overlay-voltar')?.click()`);
      await espera(1200);
      return true;
    }
  }
  return false;
}

diga(`▶ ${BASE} em ${L}×${A}\n`);
if (!(await entrar("nome=profa&pin=1234&codigo=prof2026"))) {
  console.error("✗ o mundo não ficou pronto");
  encerrar(1);
}

// o balcão é do modo SOBREVIVÊNCIA (no criativo a paleta é infinita)
await dizer("/modo sobrevivencia eu");
await dizer(`/dar eu ${ITEM_TRIGO} 10`);
await dizer(`/dar eu ${PLANKS} 8`);
await espera(600);
const saldoInicial = await ateQue(saldoNoHud, (n) => n > 0);
ok(saldoInicial > 0, `o HUD mostra o saldo inicial (${saldoInicial} Dimas)`);

diga("\n== 1. /vender ABRE o balcão: total zero, botão DESLIGADO ==");
await dizer("/vender");
let b = await ateQue(balcao, (v) => v !== null);
ok(b?.titulo === "balcão de venda", `o título é do balcão (${JSON.stringify(b?.titulo)})`);
ok(
  /balc/i.test(b?.divisor ?? "") && !/ba[úu]/i.test((b?.divisor ?? "").replace(/balc[aã]o/gi, "")),
  `a faixa divisória diz BALCÃO, não "baú" (${JSON.stringify(b?.divisor)})`,
);
ok(b?.total === 0, `o total nasce em 0 (${b?.total})`);
ok(b?.desligado === true, "o botão vender nasce DESLIGADO (não escondido)");
ok(b?.botao !== null, `e ele ESTÁ na tela pra criança ver (${JSON.stringify(b?.botao)})`);
await foto("1-balcao-vazio.png");

diga("\n== 2. trigo entra: preço por unidade no slot, total no rodapé ==");
await limparChat();
ok(await mover(0, noBalcao(0)), "tocou na origem e no destino (gesto de toque de verdade)");
b = await ateQue(balcao, (v) => (v?.total ?? 0) > 0);
// 10 de trigo × 2 Dimas = 20. O número vem do DOM, não da minha conta.
ok(b?.total === 20, `o total é 20 (10 trigo × 2) — ${b?.total}`);
ok(b?.textoTotal.includes("20"), `e está escrito na tela (${JSON.stringify(b?.textoTotal)})`);
ok(b?.precos.includes("2 cada"), `o preço UNITÁRIO aparece sob o slot (${JSON.stringify(b?.precos)})`);
ok(b?.desligado === false, "o botão vender LIGOU");
// ⚠️ o ponto: pôr no balcão NÃO é vender
ok((await saldoNoHud()) === saldoInicial, `o saldo NÃO mudou ainda (${saldoInicial})`);
await foto("2-balcao-com-trigo.png");

diga("\n== 3. CONTROLE NEGATIVO: a tábua não entra (seria máquina de Dimas) ==");
await limparChat();
const tabuaEm = await avaliar(`(() => {
  const r = document.getElementById('container');
  for (const b of r.querySelectorAll('.inv-mochila .inv-slot, .inv-hotbar .inv-slot')) {
    if (b.dataset.item === String(${PLANKS})) return Number(b.dataset.slot);
  }
  return null;
})()`);
ok(tabuaEm !== null, `achei a tábua na mochila (slot ${tabuaEm})`);
if (tabuaEm !== null) {
  await mover(tabuaEm, noBalcao(1));
  b = await balcao();
  // se este passar, a lista de permissão virou lista de tudo
  ok(b?.total === 20, `o total NÃO mudou — a tábua ficou fora (${b?.total})`);
  const fala = await ateQue(ultimaFala, (t) => (t ?? "").includes("COLHE"));
  ok((fala ?? "").includes("COLHE"), `e o aluno ouviu o motivo (${JSON.stringify(fala)})`);
  ok((await naMochila(PLANKS)) === 8, "a tábua continua inteira na mochila (8)");
}
await foto("3-tabua-recusada.png");

diga("\n== 4. vender SOBE o saldo pelo total e zera o balcão ==");
await limparChat();
const alvo = saldoInicial + 20;
await avaliar(`document.querySelector('#container .venda-btn[data-acao="vender"]').click()`);
const depois = await ateQue(saldoNoHud, (n) => n === alvo);
ok(depois === alvo, `o HUD foi de ${saldoInicial} para ${alvo} Dimas (leu ${depois})`);
b = await ateQue(balcao, (v) => (v?.total ?? -1) === 0);
ok(b?.total === 0, `o balcão zerou (${b?.total})`);
ok(b?.desligado === true, "e o botão voltou a DESLIGADO");
ok((await naMochila(ITEM_TRIGO)) === 0, "o trigo saiu da mochila de verdade");
await foto("4-vendido.png");

diga("\n== 5. fechar com item dentro DEVOLVE pra mochila ==");
await dizer(`/dar eu ${ITEM_TRIGO} 5`);
await espera(500);
const trigoAntes = await ateQue(() => naMochila(ITEM_TRIGO), (n) => n === 5);
ok(trigoAntes === 5, `5 de trigo na mochila (${trigoAntes})`);
const slotDoTrigo = await avaliar(`(() => {
  const r = document.getElementById('container');
  for (const b of r.querySelectorAll('.inv-mochila .inv-slot, .inv-hotbar .inv-slot')) {
    if (b.dataset.item === String(${ITEM_TRIGO})) return Number(b.dataset.slot);
  }
  return null;
})()`);
await mover(slotDoTrigo, noBalcao(0));
b = await ateQue(balcao, (v) => (v?.total ?? 0) === 10);
ok(b?.total === 10, `5 trigo no balcão = 10 Dimas (${b?.total})`);
const saldoAntesDeFechar = await saldoNoHud();
await avaliar(`document.querySelector('#container .cont-fechar').click()`);
await ateQue(balcao, (v) => v === null);
ok((await balcao()) === null, "o painel fechou");
// reabre só pra LER a mochila (é o painel que a desenha)
await dizer("/vender");
await ateQue(balcao, (v) => v !== null);
const voltou = await ateQue(() => naMochila(ITEM_TRIGO), (n) => n === 5);
ok(voltou === 5, `o trigo VOLTOU pra mochila (${voltou}) — nada se perde no painel`);
ok((await saldoNoHud()) === saldoAntesDeFechar, "e fechar não vendeu nada");
await foto("5-devolvido.png");

diga("\n== 6. a régua: 1024×600 sem rolar ==");
b = await balcao();
ok(b?.rolando === false, `o painel inteiro cabe sem rolagem (altura ${b?.altura} de ${A})`);
ok((b?.altura ?? 0) < A, `e a altura é menor que a tela (${b?.altura} < ${A})`);

// ⚠️ veredito no FIM, pra sobreviver ao `| tail` (LEARNINGS)
diga(`\n${falhas === 0 ? "✓ TUDO PASSOU" : `✗ ${falhas} FALHA(S)`} — §💰 balcão de venda em ${L}×${A}`);
encerrar(falhas === 0 ? 0 : 1);
