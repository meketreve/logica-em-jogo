#!/usr/bin/env node
/**
 * Sonda do "restaurar" do menu do SINGLEPLAYER — o backup de antes dos ids de
 * 16 bits (2026-09-12).
 *
 * Por que existe: o host já guardava `<nome>.antes-ids16.ljw` ao lado do save,
 * mas o navegador guardava o original em `WorldRecord.dataAntesIds16` e NÃO
 * tinha porta nenhuma pra ele — o aluno que abriu um mundo antigo convertia e
 * pronto. O botão é a porta, e botão só é "feito" quando uma sonda o ENXERGA.
 *
 * O que prova, em cima de um .ljw DE VERDADE (o mundo é criado e jogado aqui,
 * e o save sai do próprio jogo):
 *   1. o botão aparece SÓ no mundo que tem backup (o controle negativo é um
 *      segundo registro sem `dataAntesIds16`, na mesma lista);
 *   2. clicar NÃO mexe no mundo atual — nasce um registro NOVO ao lado, com os
 *      bytes do backup (confere tamanho e soma de verificação);
 *   3. a cópia restaurada ABRE: dá pra jogar nela, então o que foi copiado é
 *      save válido e não um punhado de bytes;
 *   4. a linha com o botão a mais ainda CABE na régua de 1024×600.
 *
 * ⚠️ Serve o cliente COMPILADO (o host Node serve `client/dist`): rode
 * `npm run build` antes.
 * ⚠️ PRECISA do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`).
 *
 * Uso:
 *   npm run build && npm run shots:restaurar
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8113;
const PORTA_CDP = 9361;
const BASE = process.env["BASE"] ?? `http://localhost:${PORTA_WS}`;
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "restaurar");
const MUNDO = "mundos/_shot-restaurar";
mkdirSync(SAIDA, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
// stdout SEM buffer: fora de TTY o node segura as linhas até o fim, e um
// script morto no meio não deixa rastro do que já mediu.
const diga = (t) => process.stdout.write(`${t}\n`);
let falhas = 0;
const ok = (cond, msg) => {
  diga(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};

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
  throw new Error("Chrome não encontrado — `npx -y @puppeteer/browsers install chrome@stable` ou passe CHROME=…");
}

// O host aqui é só QUEM SERVE A PÁGINA: o mundo deste teste vive no
// IndexedDB e roda no Worker do singleplayer, sem passar pelo servidor.
// Sobe com `node` direto, como os launchers (bug-666).
const servidor = spawn(process.execPath, ["--import", "tsx", "server/src/index.ts"], {
  env: { ...process.env, LJ_PORT: String(PORTA_WS), LJ_SAVE: `${MUNDO}.ljw`, LJ_NOVO: "1", LJ_TAMANHO: "P" },
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
  // o host GRAVA ao receber o SIGTERM: apagar na hora deixa a pasta renascer
  // atrás do rm (bug do amigos-shot na sessão 43).
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

const LIBS = join(homedir(), ".local/chrome-libs/usr/lib/x86_64-linux-gnu");
chrome = spawn(
  acharChrome(),
  [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--enable-unsafe-swiftshader",
    `--window-size=${L},${A}`, `--remote-debugging-port=${PORTA_CDP}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-restaurar-"))}`, "about:blank",
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
      /* chrome ainda subindo */
    }
    await espera(250);
  }
  console.error("chrome não abriu a porta de depuração");
  encerrar(1);
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
/** `await` dentro da página — ler/gravar IndexedDB é tudo assíncrono. */
const avaliarAsync = async (expr) =>
  (await cdp("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
/**
 * Espera uma condição do DOM, sondando a cada 100 ms. Abrir o menu, gravar no
 * IndexedDB e re-renderizar a lista são todos assíncronos: `espera()` seca
 * passa na máquina rápida e falha na carregada.
 */
async function ateQue(fn, condicao, limiteMs = 8000) {
  const limite = Date.now() + limiteMs;
  let ultimo = await fn();
  while (Date.now() < limite && !condicao(ultimo)) {
    await espera(100);
    ultimo = await fn();
  }
  return ultimo;
}
const foto = async (nome) => {
  const r = await cdp("Page.captureScreenshot", { format: "png" });
  if (!r.result?.data) return;
  const buf = Buffer.from(r.result.data, "base64");
  writeFileSync(join(SAIDA, nome), buf);
  diga(`  ✓ ${nome} (${(buf.length / 1024).toFixed(0)} KB) em ${SAIDA}`);
};

/** Tudo que está no IndexedDB, com tamanho e soma de verificação dos bytes. */
const registros = () =>
  avaliarAsync(`(async () => {
    const db = await new Promise((res, rej) => {
      const o = indexedDB.open('logica-em-jogo', 1);
      o.onsuccess = () => res(o.result); o.onerror = () => rej(o.error);
    });
    const all = await new Promise((res, rej) => {
      const r = db.transaction('worlds').objectStore('worlds').getAll();
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    const marca = (b) => {
      if (!b) return null;
      const u = new Uint8Array(b);
      let s = 0;
      for (let i = 0; i < u.length; i++) s = (s + u[i] * (i % 31 + 1)) % 4294967296;
      return { bytes: u.length, soma: s };
    };
    return all.map(w => ({ id: w.id, nome: w.name, data: marca(w.data), backup: marca(w.dataAntesIds16) }));
  })()`);

/** As linhas da lista de mundos, com os rótulos dos botões de cada uma. */
const linhas = () =>
  avaliar(`[...document.querySelectorAll('#menu-world-list .world-row')].map(r => ({
    nome: r.querySelector('.world-name')?.textContent ?? '',
    botoes: [...r.querySelectorAll('button')].map(b => b.textContent),
    direita: Math.round(r.getBoundingClientRect().right),
    rolaDemais: r.scrollWidth > r.clientWidth + 1,
  }))`);

const abrirMeusMundos = async () => {
  await avaliar(`document.getElementById('menu-nome').value='aluno';
    document.getElementById('menu-btn-single').click()`);
  await ateQue(() => avaliar(`!document.getElementById('menu-worlds')?.classList.contains('hidden')`), (v) => v === true);
};

diga(`▶ ${BASE} em ${L}×${A}`);
await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Emulation.setDeviceMetricsOverride", { width: L, height: A, deviceScaleFactor: 1, mobile: true });
await cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await cdp("Emulation.setEmulatedMedia", {
  features: [{ name: "pointer", value: "coarse" }, { name: "any-pointer", value: "coarse" }],
});
await cdp("Page.navigate", { url: `${BASE}/` });
await ateQue(() => avaliar(`!!document.getElementById('menu-btn-single')`), (v) => v === true, 30_000);

diga("== 1. um mundo de verdade, jogado e salvo no navegador ==");
await abrirMeusMundos();
await avaliar(`document.getElementById('menu-new-nome').value='convertido';
  document.getElementById('menu-new-tamanho').value='P';
  document.getElementById('menu-btn-new').click()`);
const entrou = await ateQue(
  () => avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`),
  (v) => v === true,
  180_000,
);
ok(entrou === true, "o mundo novo abriu em jogo");
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(1200);
// o botão sair GRAVA no IndexedDB e recarrega a página — é o caminho normal
await avaliar(`document.getElementById('btn-sair')?.click()`);
await ateQue(() => avaliar(`!!document.getElementById('menu-btn-single')`), (v) => v === true, 60_000);
let regs = await ateQue(registros, (r) => Array.isArray(r) && r.length === 1, 20_000);
ok(regs?.length === 1 && regs[0].data?.bytes > 0, `o save foi pro IndexedDB (${regs?.[0]?.data?.bytes} bytes)`);

diga("== 2. finge a conversão: o original vai pro dataAntesIds16 ==");
// É o que o `persistWorld` faz na 1ª gravação por cima de um save antigo. Aqui
// o backup são OS MESMOS bytes do save — o que a tela precisa é um registro
// COM backup e outro SEM, e os bytes serem um .ljw que abre.
const semBackup = await avaliarAsync(`(async () => {
  const db = await new Promise((res, rej) => {
    const o = indexedDB.open('logica-em-jogo', 1);
    o.onsuccess = () => res(o.result); o.onerror = () => rej(o.error);
  });
  const atual = await new Promise((res, rej) => {
    const r = db.transaction('worlds').objectStore('worlds').getAll();
    r.onsuccess = () => res(r.result[0]); r.onerror = () => rej(r.error);
  });
  const grava = (rec) => new Promise((res, rej) => {
    const r = db.transaction('worlds', 'readwrite').objectStore('worlds').put(rec);
    r.onsuccess = () => res(1); r.onerror = () => rej(r.error);
  });
  await grava({ ...atual, dataAntesIds16: atual.data });
  // CONTROLE NEGATIVO na mesma lista: mundo sem backup nenhum
  await grava({ id: crypto.randomUUID(), name: 'nunca convertido', createdAt: Date.now(),
               updatedAt: Date.now() - 1, data: atual.data });
  return 1;
})()`);
ok(semBackup === 1, "um registro com backup e um sem, na mesma lista");

diga("== 3. o botão aparece SÓ no mundo que tem backup ==");
await avaliar(`[...document.querySelectorAll('.menu-back')].find(b=>b.offsetParent)?.click()`);
await espera(300);
await abrirMeusMundos();
let ls = await ateQue(linhas, (l) => Array.isArray(l) && l.length === 2, 15_000);
const comBotao = (ls ?? []).filter((l) => l.botoes.includes("restaurar"));
ok(ls?.length === 2, `a lista mostra os 2 mundos (${ls?.length})`);
ok(comBotao.length === 1, `e o "restaurar" aparece em UM só (${comBotao.length})`);
ok(comBotao[0]?.nome === "convertido", `justamente no convertido ("${comBotao[0]?.nome}")`);
ok(
  (ls ?? []).find((l) => l.nome === "nunca convertido")?.botoes.join("/") === "jogar/exportar/apagar",
  `e o sem backup segue com 3 botões (${(ls ?? []).find((l) => l.nome === "nunca convertido")?.botoes.join("/")})`,
);
// a régua: a linha mais cheia é a de 4 botões, e ela tem de caber em 1024
ok(
  comBotao[0] && comBotao[0].direita <= L && !comBotao[0].rolaDemais,
  `a linha de 4 botões cabe em ${L}px (direita ${comBotao[0]?.direita}, sem rolagem lateral)`,
);
await foto("01-lista-com-restaurar.png");

diga("== 4. restaurar NÃO mexe no mundo atual — nasce uma cópia ao lado ==");
const antes = (await registros()).find((r) => r.nome === "convertido");
await avaliar(`[...document.querySelectorAll('#menu-world-list .world-row')]
  .find(r => r.querySelector('.world-name')?.textContent === 'convertido')
  ?.querySelector('button[title^="cria uma CÓPIA"]')?.click()`);
ls = await ateQue(linhas, (l) => Array.isArray(l) && l.length === 3, 15_000);
ok(ls?.length === 3, `a lista passou a 3 linhas (${ls?.length})`);
const copia = (ls ?? []).find((l) => l.nome === "convertido (antes dos ids 16)");
ok(!!copia, `a cópia apareceu com nome próprio ("${copia?.nome ?? "não achei"}")`);
regs = await registros();
const depois = regs.find((r) => r.nome === "convertido");
const rCopia = regs.find((r) => r.nome === "convertido (antes dos ids 16)");
ok(
  depois?.data?.soma === antes?.data?.soma && depois?.backup?.soma === antes?.backup?.soma,
  "o mundo convertido ficou INTACTO (mesmos bytes, mesmo backup)",
);
ok(
  rCopia?.data?.bytes === antes?.backup?.bytes && rCopia?.data?.soma === antes?.backup?.soma,
  `a cópia tem os bytes do BACKUP (${rCopia?.data?.bytes} bytes, soma ${rCopia?.data?.soma})`,
);
ok(rCopia?.backup === null, "e ela nasce sem backup próprio (ainda não foi convertida)");
await foto("02-copia-restaurada.png");

diga("== 5. a cópia ABRE: o que foi copiado é save, não bytes soltos ==");
await avaliar(`[...document.querySelectorAll('#menu-world-list .world-row')]
  .find(r => r.querySelector('.world-name')?.textContent === 'convertido (antes dos ids 16)')
  ?.querySelector('button')?.click()`);
const abriu = await ateQue(
  () => avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`),
  (v) => v === true,
  180_000,
);
ok(abriu === true, "a cópia restaurada entrou em jogo");
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(1200);
await foto("03-copia-em-jogo.png");

diga(excecoes.length ? `✗ exceções: ${excecoes.join(" | ")}` : "✓ sem exceção no console");
if (excecoes.length) falhas++;
diga(falhas === 0 ? `\nSONDA RESTAURAR OK — ${SAIDA}` : `\nSONDA RESTAURAR FALHOU (${falhas})`);
encerrar(falhas === 0 ? 0 : 1);
