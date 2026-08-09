#!/usr/bin/env node
/**
 * Os GESTOS da barra de toque, contra o servidor REAL (2026-08-04).
 *
 * Por que existe, e por que não virou mais uma seção do `tablet-shots.mjs`: o
 * tablet-shots MEDE geometria (cabe na janela? o alvo dá pro dedo?) e sintetiza
 * o toque com `dispatchEvent(new PointerEvent(...))`, que NÃO gera o `click` de
 * compatibilidade. E era exatamente o click que faltava ver: o ☰ abria o menu
 * de pausa e o menu "fechava sozinho" levando a barra junto (bug-572), porque o
 * click do mesmo toque atravessava o `#overlay` (`pointer-events: none`) até o
 * canvas, cujo handler pede pointer lock. Aqui o toque vai por
 * `Input.dispatchTouchEvent` do CDP: quem gera a sequência inteira é o Chrome.
 *
 * O pedido de pointer lock é CONTADO (monkey-patch no protótipo), não observado
 * pelo `document.pointerLockElement`: em headless a CONCESSÃO é flaky — o mesmo
 * build passou numa rodada e falhou na outra — e o que o fix promete é que o
 * aparelho de dedo nem PEÇA.
 *
 * ⚠️ Serve o cliente COMPILADO (o host Node serve `client/dist`): rode
 * `npm run build` antes.
 * ⚠️ PRECISA do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`).
 *
 * Uso:
 *   npm run build && npm run shots:toque      # 1024×600 (Kindle Fire), coarse
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8108;
const PORTA_CDP = 9358;
const BASE = process.env["BASE"] ?? `http://localhost:${PORTA_WS}`;
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "toque");
const MUNDO = "mundos/_shot-toque";
mkdirSync(SAIDA, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
// stdout SEM buffer: fora de um TTY o node segura as linhas até o fim, e um
// script morto no meio não deixa rastro nenhum do que já tinha medido.
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
    LJ_SEED: "20260710",
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

// --- navegador como "ana", em tablet ---
// libs do chrome extraídas sem sudo (bug-564): se o prefixo local existir, ele
// entra no LD_LIBRARY_PATH — é o que faz o print rodar no notebook.
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
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-toque-"))}`,
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
/** Toda chamada tem TETO. Sem isto, uma resposta que não volta (a página trava
 *  sob swiftshader de vez em quando) deixa a Promise pendente pra sempre e o
 *  script fica mudo — que é o pior jeito de um verificador falhar: parece que
 *  está trabalhando. Melhor morrer dizendo qual chamada não voltou. */
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
  await espera(250);
  await avaliar(`(() => {
    const f = document.getElementById('chat-input');
    if (!f) return 'sem campo';
    f.value = ${JSON.stringify(texto)};
    f.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true }));
    return 'ok';
  })()`);
  await espera(500);
}
/** Toque REAL — o Chrome gera pointerdown + pointerup + click sozinho. */
async function tocar(x, y) {
  await cdp("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await espera(120);
  await cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await espera(600);
}
/** Centro de um botão da barra do topo, pelo rótulo do `<small>`. */
const botaoDaBarra = (nome) =>
  avaliar(`(() => {
    const b = [...document.querySelectorAll('#touch-topo .touch-btn')]
      .find(e => e.querySelector('small')?.textContent === ${JSON.stringify(nome)});
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) };
  })()`);
// `checkVisibility()` e não `display === 'none'`: a barra é `position: fixed` e
// quem a esconde é o PAI (`#touch-ui.hidden`) — o computed style do filho segue
// dizendo `flex`, e a medida ingênua diz "visível" com a barra fora da tela.
const estado = () =>
  avaliar(`(() => {
    const vis = (sel) => {
      const e = document.querySelector(sel);
      if (!e) return 'AUSENTE';
      return e.checkVisibility() ? 'VISIVEL' : 'escondido';
    };
    return {
      menu: vis('#overlay'), barra: vis('#touch-topo'), amigos: vis('#amigos'),
      mochila: vis('#inventario'), chat: vis('#chat-input'),
    };
  })()`);
const foto = async (nome) => {
  const r = await cdp("Page.captureScreenshot", { format: "png" });
  if (!r.result?.data) return;
  const buf = Buffer.from(r.result.data, "base64");
  writeFileSync(join(SAIDA, nome), buf);
  diga(`  ✓ ${nome} (${(buf.length / 1024).toFixed(0)} KB) em ${SAIDA}`);
};

await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Emulation.setDeviceMetricsOverride", {
  width: L,
  height: A,
  deviceScaleFactor: 1,
  mobile: true,
});
await cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
// ISTO é o que liga as media queries de toque — mobile:true sozinho não faz
await cdp("Emulation.setEmulatedMedia", {
  features: [
    { name: "pointer", value: "coarse" },
    { name: "any-pointer", value: "coarse" },
  ],
});

diga(`▶ ${BASE} em ${L}×${A}, pointer:coarse, toque REAL\n`);
// `?codigo=` entra como PROFESSORA: é o que destrava o `/dar`, e sem ele não há
// como encher a mochila pra lista de craft ter o que fabricar.
await cdp("Page.navigate", {
  url: `${BASE}/?server=ws://localhost:${PORTA_WS}&nome=ana&pin=1111&codigo=prof2026`,
});
let pronto = false;
// A sonda pede as DUAS coisas: a hotbar montada E a tela de carga já fora do
// DOM (`#load-tela`). Só a hotbar não basta — ela nasce no `startGame`, e desde
// o bug-608 o mundo DENSO (este, `LJ_TAMANHO: "P"`) segue com a tela de carga
// na frente até a malha ficar pronta. Sondar só a hotbar fazia o script clicar
// e medir POR BAIXO da tela de carga, com a barra de toque escondida.
for (let i = 0; i < 90; i++) {
  await espera(1000);
  if (await avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`)) {
    pronto = true;
    break;
  }
}
if (!pronto) {
  console.error("✗ o mundo não ficou pronto");
  encerrar(1);
}
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(1500);

let falhas = 0;
const ok = (cond, msg) => {
  diga(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};

diga("== A: o ☰ abre o menu de pausa e ELE FICA (bug-572) ==");
let s = await estado();
ok(s.barra === "VISIVEL", "a barra de toque está na tela antes do ☰");
const btnMenu = await botaoDaBarra("menu");
if (!btnMenu) {
  console.error("✗ botão ☰ não encontrado na barra");
  encerrar(1);
}
// contar o PEDIDO de lock, não a concessão (ver o cabeçalho)
await avaliar(`(() => {
  window.__lockPedidos = 0;
  const orig = HTMLCanvasElement.prototype.requestPointerLock;
  HTMLCanvasElement.prototype.requestPointerLock = function (...a) {
    window.__lockPedidos++;
    return orig.apply(this, a);
  };
})()`);
await tocar(btnMenu.x, btnMenu.y);
s = await estado();
const pedidos = await avaliar(`window.__lockPedidos`);
ok(s.menu === "VISIVEL", "o menu continua aberto depois de soltar o dedo");
ok(
  pedidos === 0,
  `o toque no ☰ não pede pointer lock (pedidos=${pedidos}) — aparelho de dedo não trava ponteiro`,
);
ok(s.barra === "escondido", "a barra sai de cena sob o menu (é o desenho: um de cada vez)");
await foto("01-menu-de-pausa.png");

diga("== A2: 'voltar ao jogo' devolve a barra ==");
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(900);
s = await estado();
ok(s.barra === "VISIVEL", "a barra de toque voltou");
ok(s.menu === "escondido", "o menu saiu");

diga("== B: /amigos abre o painel (mesmo caminho no PC e no tablet) ==");
await dizer("/amigos");
s = await estado();
ok(s.amigos === "VISIVEL", "o painel de amigos abriu pelo comando de chat");
// `includes`, não `startsWith`: o chat escreve `<autor> Uso: …`, então o
// `startsWith('Uso:')` NUNCA casava e a asserção passava com e sem o fix — o
// falso-verde do bug-569 de novo, pego no A/B.
const semUso = await avaliar(
  `![...document.querySelectorAll('#chat-log .msg')].some(d => (d.textContent||'').includes('Uso: /amigos'))`,
);
ok(semUso, "o chat NÃO recebeu o texto de uso (o comando virou gesto, não resposta)");
await foto("02-amigos-por-comando.png");

diga("== B2: /amigos de novo fecha (mesmo toggle da tecla e do 👥) ==");
await dizer("/amigos");
s = await estado();
ok(s.amigos === "escondido", "o painel fechou");

diga("== B3: /amigos COM subcomando continua indo pro servidor ==");
await dizer("/amigos lista");
const temResposta = await avaliar(
  `[...document.querySelectorAll('#chat-log div')].some(d => /amigos|grupo/i.test(d.textContent||''))`,
);
ok(temResposta, "o servidor respondeu no chat ao /amigos lista");
s = await estado();
ok(s.amigos === "escondido", "subcomando NÃO abre o painel");

diga("== C: fabricar NÃO joga a lista de craft de volta pro topo (bug-573) ==");
// craft só existe em sobrevivência, e a lista só rola se houver receita
// bastante — os 4 troncos destravam as tábuas e o que vem delas.
await dizer("/modo sobrevivencia eu");
await dizer("/dar eu 6 64"); // troncos das 4 espécies (Log, Ipe, Araucaria, PauBrasil)
await dizer("/dar eu 122 64");
await dizer("/dar eu 124 64");
await dizer("/dar eu 126 64");
await dizer("/dar eu 7 64"); // tábua: destrava laje/escada/mesa/cerca de uma vez
await espera(600);
await tecla("KeyE"); // abre a mochila
await espera(800);
await avaliar(`[...document.querySelectorAll('.inv-aba')]
  .find(b => b.textContent === 'criar')?.click()`);
await espera(800);

const rolagem = await avaliar(`(() => {
  const l = document.querySelector('.craft-lista');
  if (!l) return null;
  return { rola: l.scrollHeight > l.clientHeight + 1,
           alt: Math.round(l.clientHeight), conteudo: Math.round(l.scrollHeight) };
})()`);
if (!rolagem) {
  diga("  ✗ a lista de craft não está na tela");
  falhas++;
} else if (!rolagem.rola) {
  // sem rolagem não há o que provar — dizer isso vale mais que um ✓ vazio
  diga(
    `  ⚠ a lista não rola nesta janela (${rolagem.conteudo}px em ${rolagem.alt}px) — o teste da rolagem não vale`,
  );
  falhas++;
} else {
  await avaliar(`(() => { const l = document.querySelector('.craft-lista');
    l.scrollTop = l.scrollHeight; l.dispatchEvent(new Event('scroll')); })()`);
  await espera(400);
  const antes = await avaliar(`Math.round(document.querySelector('.craft-lista').scrollTop)`);
  const clicou = await avaliar(`(() => {
    const l = document.querySelector('.craft-lista');
    const b = [...l.querySelectorAll('.craft-row')].find(x => !x.disabled);
    if (!b) return 'nenhuma habilitada';
    b.click();
    return 'ok';
  })()`);
  await espera(1000);
  const depois = await avaliar(
    `Math.round(document.querySelector('.craft-lista')?.scrollTop ?? -1)`,
  );
  diga(`  rolagem antes=${antes}px · depois de fabricar=${depois}px (clique: ${clicou})`);
  ok(clicou === "ok", "havia receita habilitada pra fabricar");
  ok(antes > 0, `a lista estava rolada antes de fabricar (${antes}px)`);
  ok(depois === antes, `a rolagem ficou onde estava (${antes} → ${depois})`);
  await foto("03-craft-rolagem.png");
}

// A regra de UM MENU POR VEZ (§48) não tinha asserção nenhuma até a sessão 52 —
// e ela é justamente a que se quebra em silêncio: o segundo menu abre por cima,
// o servidor continua achando que o primeiro está aberto (foi o bug do baú com
// a mochila), e nada na tela grita. A mochila está aberta desde a seção C.
diga("== D: com a mochila aberta, nenhum outro menu abre (um menu por vez, §48) ==");
let d = await estado();
ok(d.mochila === "VISIVEL", "a mochila continua aberta (o palco da regra)");
await tecla("KeyG"); // painel de amigos
await espera(500);
d = await estado();
ok(d.amigos === "escondido", "G NÃO abriu o painel de amigos por cima");
ok(d.mochila === "VISIVEL", "e a mochila ficou onde estava");
await tecla("Enter"); // chat — é menu como os outros desde a §48
await espera(500);
d = await estado();
ok(d.chat !== "VISIVEL", `Enter NÃO abriu o chat por baixo do painel (${d.chat})`);
// e o portão é só pra ABRIR: o próprio painel continua fechando na 2ª tecla
await tecla("KeyE");
await espera(500);
d = await estado();
ok(d.mochila === "escondido", "E fechou a mochila (o portão não tranca quem já está aberto)");
await tecla("KeyG");
await espera(500);
d = await estado();
ok(d.amigos === "VISIVEL", "e com a tela livre o G abre o de amigos");
await tecla("KeyG");
await espera(400);

if (excecoes.length) {
  diga(`\n✗ exceções no console: ${excecoes.join(" | ")}`);
  falhas++;
}
diga(falhas ? `\n✗ ${falhas} falha(s)` : "\n✓ tudo certo");
encerrar(falhas ? 1 : 0);
