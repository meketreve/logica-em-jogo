#!/usr/bin/env node
/**
 * §🎮 O Esc, num Chrome headless de DESKTOP (2026-08-06).
 *
 * A regra "um menu por vez" (§48) e o "Esc fecha qualquer menu" (2026-08-05)
 * tinham asserção só no `shots:toque` — e o toque é justamente o aparelho onde
 * pointer lock NÃO existe. O caminho de teclado ficava sem ninguém, e foi por
 * ali que o bug-597 passou: fechar um painel com Esc PISCAVA o menu de pausa
 * por mais de um segundo.
 *
 * A causa não está no Esc, está no ponteiro. O Esc do painel É o Esc do
 * usuário, e o Chrome recusa `requestPointerLock` por ~1,25 s depois dele
 * (bug-585). O `input.lock()` que vem logo atrás falha, e "sem ponteiro
 * travado" era indistinguível de "o aluno pediu pausa" pra quem só olhava o
 * `locked`. No headless a carência é curta e o menu só pisca; no Chrome do
 * aluno ele FICA, e a leitura é "o Esc fechou o menu e abriu o de pausa".
 *
 * As três perguntas, e a terceira existe porque a correção podia esconder o
 * menu pra sempre:
 *   1. Esc com painel aberto FECHA o painel e não abre o menu de pausa.
 *   2. Esc com a tela livre ABRE o menu de pausa (o comportamento que fica).
 *   3. Com o pointer lock recusado DE VEZ, o menu de pausa volta — senão o
 *      aluno ficaria sem nenhum jeito de sair do jogo.
 *
 * ⚠️ Serve `client/dist`: rodar `npm run build` ANTES.
 * ⚠️ PRECISA do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`).
 *
 * Uso: npm run shots:esc
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8141;
const PORTA_CDP = 9389;
const BASE = process.env["BASE"] ?? `http://localhost:${PORTA_WS}`;
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "esc");
const MUNDO = "mundos/_shot-esc";
mkdirSync(SAIDA, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
// stdout SEM buffer (bug do toque-shot): fora de TTY o node segura as linhas
// até o fim, e um script morto no meio não deixa rastro do que já mediu.
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
    LJ_SEED: "20260805",
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

// --- navegador como "profa", em tablet ---
// libs do chrome extraídas sem sudo (bug-564): se o prefixo local existir, ele
// entra no LD_LIBRARY_PATH — é o que faz o print rodar no notebook da escola.
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
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-escbug-"))}`,
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
/** Toda chamada tem TETO (bug do toque-shot): resposta que não volta deixaria
 *  o script mudo, que é o pior jeito de um verificador falhar. */
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
/** Espera uma condição do DOM, sondando a cada 100 ms. Devolve o último valor
 *  lido, satisfeito ou não — a asserção é de quem chamou. */
async function ateQue(ler, satisfeito, limiteMs = 4000) {
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


diga(`▶ ${BASE} — o Esc no teclado (desktop, com pointer lock)\n`);
await cdp("Page.navigate", {
  url: `${BASE}/?server=ws://localhost:${PORTA_WS}&nome=profa&pin=1234&codigo=prof2026`,
});
let pronto = false;
for (let i = 0; i < 90; i++) {
  await espera(1000);
  if (await avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`)) { pronto = true; break; }
}
if (!pronto) { console.error("✗ o mundo não ficou pronto"); encerrar(1); }

const aberto = (id) =>
  `(() => { const e = document.getElementById(${JSON.stringify(id)}); return !!e && !e.classList.contains('hidden'); })()`;
/** Menu de pausa na tela? Painel na tela? Jogo com o ponteiro? */
const estado = () => avaliar(`(() => ({
  pausa: ${aberto("overlay")},
  painel: ['inventario','container','amigos','painel','jogadores'].some(
    id => { const e = document.getElementById(id); return !!e && !e.classList.contains('hidden'); }),
  travado: document.pointerLockElement !== null,
}))()`);

/** A hotbar do PC está na tela? (§💬 todo L437 — ela tem de sumir com QUALQUER
 *  menu aberto.) A `altura` guarda contra deriva do `.hidden` no CSS: a classe
 *  pode estar lá e não esconder nada.
 *  ⚠️ Não há seção própria pra ela DE PROPÓSITO: em headless cada transição de
 *  painel gasta a carência de pointer lock do Chrome, e uma seção nova caía no
 *  menu de pausa — com o chat fechado, "a hotbar sumiu com o chat aberto"
 *  passava VAZIA. Medir DENTRO das seções que já seguram o ponteiro (A e B2)
 *  custa zero transição e não pode passar por ausência. */
const hotbar = () => avaliar(`(() => {
  const e = document.getElementById('hotbar');
  if (!e) return { existe: false, escondida: false, altura: -1 };
  return { existe: true, escondida: e.classList.contains('hidden'),
           altura: Math.round(e.getBoundingClientRect().height) };
})()`);

await cdp("Page.bringToFront");
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(1200);
// clique no canvas: é o gesto que trava o ponteiro de verdade
const centro = await avaliar(`(() => { const r = document.querySelector('canvas').getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; })()`);
for (const type of ["mousePressed", "mouseReleased"]) {
  await cdp("Input.dispatchMouseEvent", { type, x: centro.x, y: centro.y, button: "left", clickCount: 1 });
}
const jogando = await ateQue(estado, (a) => a.travado === true, 5000);
if (!jogando.travado) {
  diga("  ⚠️ este Chrome não trava o ponteiro em headless — o teste não vale aqui");
  encerrar(2);
}
diga(`  jogando: ${JSON.stringify(jogando)}`);

diga("== A: Esc com a MOCHILA aberta fecha só ela (bug-597) ==");
const naJogatina = await hotbar(); // linha de base: jogando, sem menu nenhum
await tecla("KeyE");
const comPainel = await ateQue(estado, (a) => a.painel === true, 3000);
ok(comPainel.painel, "a mochila abriu");
ok(!comPainel.pausa, "e o menu de pausa não veio junto");
// §💬 a hotbar do PC some com o painel (todo L437). A 58 escreveu "a MESMA
// condição do overlay" e implementou o ESPELHO dela — e espelhar dá o oposto,
// porque o overlay some justamente quando o painel abre. Resultado: a faixa de
// 9 ficava na tela, duplicada com a que a própria mochila desenha.
const sobPainel = await ateQue(hotbar, (h) => h.escondida === true, 2000);
ok(comPainel.painel && sobPainel.escondida, "e a hotbar SUMIU junto");
ok(sobPainel.altura === 0, `ela não ocupa mais espaço (altura ${sobPainel.altura}px)`);
ok(!naJogatina.escondida, `— e estava na tela antes de abrir (altura ${naJogatina.altura}px)`);
await foto("05-hotbar-sob-painel.png");

await tecla("Escape");
// 3 s de amostras: o piscar do menu de pausa dura o tempo da carência do
// Chrome (~1,25 s), então uma leitura só depois de 2 s NÃO pegaria o defeito
const amostras = [];
for (let i = 0; i < 12; i++) { amostras.push(await estado()); await espera(250); }
ok(!amostras[0].painel, "o Esc fechou a mochila");
const piscou = amostras.filter((a) => a.pausa).length;
ok(piscou === 0, `o menu de pausa NÃO apareceu em nenhuma das 12 amostras (${piscou})`);
ok(amostras.at(-1).travado, "e o jogo recuperou o ponteiro sozinho");
// a barra volta junto com o jogo — e só é cobrada aqui porque a linha de cima
// acabou de provar que o ponteiro voltou (sem lock ela fica escondida COM razão)
const depoisDoEsc = await ateQue(hotbar, (h) => h.escondida === false, 3000);
ok(amostras.at(-1).travado && !depoisDoEsc.escondida, "e a hotbar VOLTOU com ele");
await foto("01-depois-do-esc-no-painel.png");

diga("== B: Esc com a TELA LIVRE abre o menu de pausa ==");
const antes = await estado();
ok(antes.travado && !antes.pausa, "estava jogando antes do Esc");
await avaliar(`document.exitPointerLock()`); // é o que a tecla Esc faz no navegador
const pausado = await ateQue(estado, (a) => a.pausa === true, 4000);
ok(pausado.pausa, "o menu de pausa abriu");
await foto("02-menu-de-pausa.png");

diga("== B2: `/amigos` no chat abre o painel SEM retomar o ponteiro (bug-610) ==");
// o playtest achou assim: o aluno digitava /amigos, via a interface na tela e
// não conseguia clicar em nada. O comando abre o painel e o chat fecha logo
// atrás — e era o fechar do chat que mandava `input.lock()` por cima do painel.
// a pré-condição é o menu de PAUSA fechado (é ele que o `podeAbrir` do chat
// checa), NÃO o ponteiro travado: em headless a concessão do pointer lock é
// flaky (o cabeçalho deste arquivo já avisa), e exigi-la deixava a seção
// intermitente. A sonda abaixo conta o PEDIDO, que acontece travado ou não.
let dejogo = await estado();
for (let i = 0; i < 4 && dejogo.pausa; i++) {
  await avaliar(`document.getElementById('overlay-voltar')?.click()`);
  dejogo = await ateQue(estado, (a) => a.pausa === false, 3000);
}
ok(!dejogo.pausa, `voltou pro jogo (ponteiro travado: ${dejogo.travado})`);
// ⚠️ a medida aqui é o PEDIDO, não a concessão (o mesmo caminho do
// `shots:toque`): o Enter que este script dispara é sintético, e sem gesto de
// usuário o Chrome recusa `requestPointerLock` de qualquer jeito. Contar
// `pointerLockElement` daria ✓ mesmo com o bug de volta — foi o que aconteceu
// na primeira versão desta seção. Quem tem de somar zero é a CHAMADA.
await avaliar(`(() => {
  window.__lockPedidos = 0;
  window.__lockQuando = [];
  const orig = HTMLCanvasElement.prototype.requestPointerLock;
  HTMLCanvasElement.prototype.requestPointerLock = function (...a) {
    window.__lockPedidos++;
    window.__lockQuando.push(Math.round(performance.now() - (window.__t0 ?? 0)));
    return orig.apply(this, a);
  };
  return 1;
})()`);
await tecla("Enter"); // a tecla do chat (settings.keys.chat)
await espera(400);
const chatAberto = await avaliar(
  `!document.getElementById('chat-input').classList.contains('hidden')`,
);
ok(chatAberto, "o chat abriu");
// §💬 o chat é "menu aberto" pro mesmo fim (todo L437): a barra some com ele.
// A asserção exige o chat NA TELA — senão passaria por ausência.
// ⚠️ leitura CURTA de propósito (400 ms, não 2 s): o `updateOverlay` roda no
// mesmo tick que abre o chat, e uma espera longa aqui deixa o `reagendarLock`
// (1 tentativa, 1,4 s) cair DEPOIS do `__lockPedidos = 0` logo abaixo e sujar a
// contagem do bug-610 com um pedido que não veio do comando.
const sobChat = await ateQue(hotbar, (h) => h.escondida === true, 400);
ok(chatAberto && sobChat.escondida, "e a hotbar SUMIU com ele na tela");
// zera e marca o instante do comando: o que interessa é o pedido que sai do
// caminho do /amigos, e o carimbo separa ele de uma tentativa atrasada
await avaliar(`(window.__lockPedidos = 0, window.__lockQuando = [], window.__t0 = performance.now(), 1)`);
await avaliar(`(() => {
  const f = document.getElementById('chat-input');
  f.value = '/amigos';
  f.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true }));
  return 1;
})()`);
await espera(2000);
ok((await estado()).painel, "o painel de amigos ficou aberto");
const pedidos = await avaliar(`window.__lockPedidos`);
const quando = (await avaliar(`window.__lockQuando`)) ?? [];
ok(
  pedidos === 0,
  `o comando não pediu o ponteiro de volta (pedidos=${pedidos}${quando.length ? `, em ${quando.join(" e ")} ms do comando` : ""}) — dá pra clicar no painel`,
);
await foto("03-amigos-por-comando.png");
await tecla("Escape"); // fecha o painel e devolve o jogo pro estado de sempre
await espera(1500);

diga("== B3: dividir pilha no clique DIREITO — o fantasma no cursor, e ele SOME (bug-609) ==");
// o playtest achou assim: "dividir pilha no inventário deixa o ícone do item
// dividido flutuando no meio da tela". Dividir é o único caminho que faz nascer
// um fantasma SEM arrasto, e era o `pointermove` do arrasto quem o posicionava
// e quem o apagava — sem arrasto ele nascia no fluxo do <body> e nunca saía.
await dizer("/modo sobrevivencia eu");
await dizer("/dar eu 2 32"); // 32 de pedra no primeiro slot da mochila
await espera(600);
await tecla("KeyE");
const comMochila = await ateQue(estado, (a) => a.painel === true, 4000);
ok(comMochila.painel, "a mochila abriu em sobrevivência");
const slot = await avaliar(`(() => {
  const b = [...document.querySelectorAll('#inventario button.inv-slot')].find(x => x.querySelector('img'));
  if (!b) return null;
  const r = b.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), txt: b.textContent };
})()`);
ok(slot !== null, `achou o slot com a pilha ("${slot?.txt ?? ""}")`);
for (const type of ["mousePressed", "mouseReleased"]) {
  await cdp("Input.dispatchMouseEvent", { type, x: slot.x, y: slot.y, button: "right", clickCount: 1 });
}
await espera(400);
const ler = () => avaliar(`(() => {
  const el = [...document.querySelectorAll('.arrasto-fantasma')].find(e => e.childElementCount > 0);
  if (!el) return { existe: false };
  const r = el.getBoundingClientRect();
  return { existe: true, txt: el.textContent, x: Math.round(r.left), y: Math.round(r.top) };
})()`);
const nasceu = await ler();
ok(nasceu.existe, "o fantasma da metade apareceu");
ok(nasceu.txt === "16", `mostra a METADE da pilha de 32 ("${nasceu.txt}")`);
ok(
  Math.abs(nasceu.x - slot.x) < 60 && Math.abs(nasceu.y - slot.y) < 60,
  `nasceu NO CURSOR (${nasceu.x},${nasceu.y}) e não solto na página (o clique foi em ${slot.x},${slot.y})`,
);
// e ele SEGUE o ponteiro mesmo sem arrasto (a metade fica na mão)
// ⚠️ a asserção é contra o ÚLTIMO `pointermove` QUE O NAVEGADOR ENTREGOU, e não
// contra a última coordenada que o script dispara: neste headless o CDP para de
// entregar `mouseMoved` depois de dois ou três de uma sequência (medido: o
// evento congela em (378,437) enquanto o script segue mandando). Ancorar no
// evento entregue mede o que interessa — o fantasma fica no ponteiro — sem
// depender de quantos o Chrome resolveu passar adiante.
await avaliar(
  `(() => { window.__pm = ''; document.addEventListener('pointermove', e => { window.__pm = e.clientX + ',' + e.clientY; }); return 1; })()`,
);
for (const passo of [35, 70, 105, 140]) {
  await cdp("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: slot.x + passo,
    y: Math.round(slot.y + (passo * 9) / 14),
    button: "none",
    buttons: 0,
    pointerType: "mouse",
  });
  await espera(150);
}
const visto = (await avaliar(`window.__pm`)) || "";
const [pmx, pmy] = visto.split(",").map(Number);
const seguiu = await ler();
ok(visto !== "" && pmx > slot.x, `o ponteiro andou para (${visto})`);
// o fantasma fica 8 px à frente do cursor (o `+ 8` do `posicionarFantasma`)
ok(
  Math.abs(seguiu.x - (pmx + 8)) <= 2 && Math.abs(seguiu.y - (pmy + 8)) <= 2,
  `o fantasma seguiu junto: está em (${seguiu.x},${seguiu.y}), 8 px à frente de (${visto})`,
);
ok(seguiu.x !== nasceu.x, `e saiu de onde nasceu (${nasceu.x} → ${seguiu.x})`);
await foto("04-metade-no-cursor.png");
// fechar o painel esvazia a mão: sem isto o ícone ficava na tela pra sempre
await tecla("Escape");
await espera(900);
const limpo = await avaliar(
  `[...document.querySelectorAll('.arrasto-fantasma')].every(e => e.childElementCount === 0)`,
);
ok(limpo === true, "fechar o painel apagou o fantasma (nada sobra flutuando)");
// devolve o estado que o C espera receber: pausado, sem ponteiro (é o que o B
// deixava antes desta seção existir)
await espera(1500);
await avaliar(`document.exitPointerLock()`);
await ateQue(estado, (a) => a.pausa === true, 4000);

diga("== C: pointer lock recusado DE VEZ ainda devolve o menu de pausa ==");
// sem isto a correção do A poderia esconder o menu pra sempre, e o aluno
// ficaria sem nenhum jeito de sair do jogo
await avaliar(`(() => {
  document.querySelector('canvas').requestPointerLock = () => {
    document.dispatchEvent(new Event('pointerlockerror'));
  };
  return 1;
})()`);
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
const teimoso = await ateQue(estado, (a) => a.pausa === true, 6000);
ok(teimoso.pausa, "duas recusas depois, o menu de pausa está de volta");

ok(excecoes.length === 0, `sem exceção no console (${excecoes.length})`);
for (const e of excecoes.slice(0, 5)) diga(`    ! ${e.split("\n")[0]}`);
diga(falhas ? `\nSHOTS /esc com ${falhas} falha(s)` : `\nSHOTS /esc OK — ${SAIDA}`);
encerrar(falhas ? 1 : 0);
