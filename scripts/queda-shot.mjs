#!/usr/bin/env node
/**
 * Sonda da QUEDA EM JOGO (bug-675) contra o host REAL + Chrome real (CDP).
 *
 * O que ela prova, com asserção (não só print):
 * 1. a criança entra e o jogo aparece (hotbar na tela, menu fora);
 * 2. §📱 (2026-10-26) o socket MORRE SECO (o host leva SIGKILL e sobe de
 *    novo — é o 1006 que dominou as aulas de 23 e 26/10) e o jogo VOLTA
 *    SOZINHO: a tela "voltando ao jogo" aparece, a página NÃO recarrega (a
 *    marca posta nela sobrevive), o menu nunca aparece, e o log do host conta
 *    que ela caiu com a tela À VISTA;
 * 3. §📱 o mesmo com a aba ESCONDIDA (outra aba na frente — o Home do
 *    tablet): enquanto escondida ela NÃO tenta voltar; ao voltar à frente,
 *    volta, e o log diz "tela ESCONDIDA". Esta é a frase que fecha o bug-675;
 * 4. o servidor DERRUBA o cliente pelo heartbeat (bug-672) e a volta NÃO dá
 *    certo (o cliente segue mudo — a aba congelada): esgotadas as tentativas,
 *    o cliente cai no painel principal com o motivo ORIGINAL escrito e o
 *    relato guardado pro próximo join. É o controle negativo da seção 2: a
 *    volta automática não pode virar spinner eterno.
 *
 * ⚠️ Serve o cliente COMPILADO: `npm run build` antes.
 *
 * Uso: npm run build && npm run shots:queda
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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
// `let` + função: a seção 2 MATA o host e sobe outro na mesma porta
const subirHost = () =>
  spawn("npx", ["tsx", "server/src/index.ts"], {
    env: { ...process.env, LJ_PORT: String(PORTA_WS), LJ_SAVE: `${MUNDO}.ljw`, LJ_NOVO: "1",
           LJ_TAMANHO: "P", LJ_SEED: "20260805", LJ_CODIGO: "prof2026" },
    detached: true, stdio: ["ignore", "ignore", "pipe"],
  });
let servidor = subirHost();
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
  matarChrome();
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
// Perfil temporário do Chrome (2026-10-10): são ~57 MB por rodada em /tmp e
// ninguém os apagava — o `exit` cobre tanto o fim normal quanto o
// `process.exit()` do encerrar(). E Ctrl+C passa pelo encerrar() também: matar
// só ESTE processo deixava o Chrome órfão segurando memória por horas.
const PERFIL = mkdtempSync(join(tmpdir(), "lj-queda-"));
process.on("exit", () => rmSync(PERFIL, { recursive: true, force: true }));
/** Mata o Chrome INTEIRO. Ele tem filhos (gpu, rede, renderer) e matar só o
 *  PAI deixava um deles regravando o perfil DEPOIS do rmSync — sobrava um
 *  esqueleto de 28 KB por rodada em /tmp. Daí o spawn ser `detached`: grupo
 *  próprio, e o SIGKILL no grupo não dá a ninguém a chance de gravar de volta.
 *  É `function` (içada) e o try/catch abraça TUDO de propósito: o encerrar()
 *  pode ser chamado antes de o Chrome subir — o host que não abre a porta é um
 *  caminho desses — e aí o próprio `chrome` ainda não existe. */
function matarChrome() {
  try {
    process.kill(-chrome.pid, "SIGKILL");
  } catch {
    /* ainda não subiu, ou já morreu */
  }
}
for (const sinal of ["SIGINT", "SIGTERM"]) process.on(sinal, () => encerrar(130));

chrome = spawn(acharChrome(), [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--enable-unsafe-swiftshader",
  `--window-size=${L},${A}`, `--remote-debugging-port=${PORTA_CDP}`,
  `--user-data-dir=${PERFIL}`, "about:blank",
], { detached: true, stdio: ["ignore", "ignore", "pipe"],
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

/** Todas as linhas `-eventos.log` do mundo (cada host que sobe abre uma sessão nova). */
const PASTA_LOGS = join(process.cwd(), MUNDO, "logs");
const eventos = () =>
  existsSync(PASTA_LOGS)
    ? readdirSync(PASTA_LOGS).filter((f) => f.endsWith("-eventos.log"))
        .map((f) => readFileSync(join(PASTA_LOGS, f), "utf8")).join("")
    : "";
const titulo = () => avaliar(`document.querySelector('#load-tela h1')?.textContent ?? ''`);
const voltouNoChat = () => avaliar(`document.getElementById('chat-log')?.textContent.includes('você voltou ao jogo') ?? false`);
/** SIGKILL no grupo do host e outro na mesma porta: pro cliente, o socket morre SECO (1006). */
async function derrubarERessuscitarHost() {
  matarHost();
  await espera(1500); // a página tem de ver a queda ANTES do host novo existir
  servidor = subirHost();
  hostVivo = true;
  return esperaPorta(PORTA_WS);
}

diga("== 2. §📱 o socket morre seco e o jogo VOLTA SOZINHO ==");
// marca na página: se ela recarregasse (o caminho antigo, menu), a marca sumiria
await avaliar(`window.__semRecarregar = 1`);
const voltasAntes = (eventos().match(/ voltou /g) ?? []).length;
ok(voltasAntes === 0, "antes da queda, nenhuma linha de volta no log");
matarHost();
const tituloVolta = await ateQue(titulo, (t) => /voltando ao jogo/.test(t ?? ""), 10000);
ok(/voltando ao jogo/.test(tituloVolta ?? ""), `a tela diz o que houve (${JSON.stringify(tituloVolta)})`);
await espera(1500);
// CONTROLE do print de 26/10: o mundo VELHO está inteiro, então o portão da
// tela de carga passava na hora — "100% pronto!" e o mundo congelado de volta
ok((await emJogo()) !== true && /voltando ao jogo/.test((await titulo()) ?? ""),
   "a tela FICA enquanto o servidor não responde (não fecha com o mundo velho)");
await foto("2-voltando.png");
servidor = subirHost();
hostVivo = true;
ok(await esperaPorta(PORTA_WS), "o host subiu de novo na mesma porta");
ok(await ateQue(emJogo, (v) => v === true, 60000) === true, "de volta ao jogo (hotbar, sem tela de carga)");
ok((await avaliar(`window.__semRecarregar === 1`)) === true, "SEM recarregar a página (a marca sobreviveu)");
ok((await avaliar(`location.search.includes('server=')`)) === true, "e sem passar pelo menu (o endereço é o mesmo)");
ok((await ateQue(voltouNoChat, (v) => v === true, 5000)) === true, "o chat avisa \"você voltou ao jogo\"");
const linhaVista = await ateQue(
  () => eventos().split("\n").find((l) => l.includes("ana voltou sozinho")) ?? "",
  (l) => l.length > 0, 5000);
ok(/tinha caído com a tela à vista/.test(linhaVista), `o log: tela À VISTA (${linhaVista.slice(11, 90)})`);
await foto("3-voltou.png");

diga("== 3. §📱 a mesma queda com a aba ESCONDIDA (o Home do tablet) ==");
// outra aba na FRENTE esconde a nossa de verdade — evento sintético de
// visibilidade daria falso negativo (LEARNINGS 2026-10-20: o `fullscreenchange`
// falso mentiu do mesmo jeito)
const outra = await (await fetch(`http://127.0.0.1:${PORTA_CDP}/json/new?about:blank`, { method: "PUT" })).json();
await fetch(`http://127.0.0.1:${PORTA_CDP}/json/activate/${outra.id}`);
const vis = await ateQue(() => avaliar(`document.visibilityState`), (v) => v === "hidden", 5000);
if (vis !== "hidden") {
  ok(false, `o headless não escondeu a aba (visibilityState=${vis}) — seção sem prova`);
} else {
  ok(true, "a aba está escondida de verdade (visibilityState=hidden)");
  await espera(1500); // tempo escondida que o log tem de medir
  ok(await derrubarERessuscitarHost(), "host derrubado e de pé de novo, com a aba ainda escondida");
  await espera(4000);
  const voltasEscondida = eventos().split("\n").filter((l) => l.includes("voltou")).length;
  ok(voltasEscondida === 1, `escondida, ela NÃO tenta voltar (linhas de volta: ${voltasEscondida})`);
  await fetch(`http://127.0.0.1:${PORTA_CDP}/json/activate/${aba.id}`);
  await fetch(`http://127.0.0.1:${PORTA_CDP}/json/close/${outra.id}`);
  ok(await ateQue(emJogo, (v) => v === true, 60000) === true, "de volta à frente, voltou ao jogo sozinha");
  const linhaEscondida = await ateQue(
    () => eventos().split("\n").filter((l) => l.includes("ana voltou sozinho"))[1] ?? "",
    (l) => l.length > 0, 5000);
  ok(/tela ESCONDIDA havia \d+ s/.test(linhaEscondida), `o log: tela ESCONDIDA (${linhaEscondida.slice(11, 100)})`);
}

diga("== 4. o cliente para de responder ao ping (tablet congelado) ==");
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

diga("== 5. a volta não dá certo, e AÍ o painel principal ==");
// heartbeat (~15 s) + 5 tentativas mudas (6 s de prazo cada + 15 s de espera)
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
ok(await ateQue(noMenu, (v) => v === true, 150000) === true, "o painel principal (#menu-home) está na tela");
ok((await emJogo()) !== true, "e o mundo congelado saiu da frente");

diga("== 6. e a criança lê o motivo ==");
const aviso = await ateQue(
  () => avaliar(`document.getElementById('menu-erro')?.textContent ?? ''`),
  (t) => typeof t === "string" && t.length > 0,
  10000,
);
ok(/tempo demais/i.test(aviso ?? ""), `o motivo ORIGINAL (heartbeat), não o da última tentativa (${JSON.stringify((aviso ?? "").slice(0, 60))})`);
const guardado = await avaliar(`sessionStorage.getItem('lj-queda')`);
ok(/"codigo":4000/.test(guardado ?? "") && /"como":"menu"/.test(guardado ?? ""),
   `o relato ficou guardado pro próximo join (${(guardado ?? "—").slice(0, 70)})`);
await foto("4-voltou-ao-menu.png");

diga(`\n${falhas === 0 ? "✓ tudo certo" : `✗ ${falhas} falha(s)`}`);
encerrar(falhas === 0 ? 0 : 1);
