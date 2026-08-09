#!/usr/bin/env node
/**
 * Print + medição do PAINEL DE AMIGOS (2026-08-04) — a interface do `/amigos`.
 *
 * Amigos só existe com gente na aula, então o script sobe um host Node de
 * verdade e põe DUAS alunas de mentira (bia e caio, clientes ws puros) na sala
 * antes de abrir o navegador como "ana". Fotografa os dois estados que o painel
 * tem: (A) convite recebido, sem grupo · (B) dona de um grupo de 2, com
 * expulsar e "sair e DESFAZER".
 *
 * ⚠️ Ele serve o cliente COMPILADO (o host Node serve `client/dist`): rode
 * `npm run build` antes, senão a página não existe.
 * ⚠️ PRECISA do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`).
 *
 * Uso:
 *   npm run build && npm run shots:amigos     # 1024×600 (Kindle Fire), coarse
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8106;
const BASE = process.env["BASE"] ?? `http://localhost:${PORTA_WS}`;
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "amigos");
const PORTA_CDP = 9356;
const MUNDO = "mundos/_shot-amigos";
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
    LJ_SEED: "20260710",
    LJ_CODIGO: "prof2026",
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
  // o host GRAVA o mundo ao receber o SIGTERM: apagar na hora deixa a pasta
  // renascer atrás do rm. Dá 1 s pro autosave fechar e só então limpa.
  setTimeout(() => {
    rmSync(join(process.cwd(), MUNDO), { recursive: true, force: true });
    process.exit(codigo);
  }, 1000);
}
// qualquer erro daqui pra frente mata o host junto — servidor de teste
// esquecido no ar é o que a sessão 32 aprendeu a não deixar
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

/** Aluna de mentira: entra, se mexe (é o `move` que ensina o nome aos outros)
 *  e obedece comandos de chat que o script mandar. */
function aluna(name, pin) {
  const ws = new WebSocket(`ws://localhost:${PORTA_WS}`);
  ws.binaryType = "arraybuffer";
  const rec = { ws, chats: [] };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", name, pin }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "spawn") {
      // presença emerge do move: sem isto ana nunca fica sabendo que ela existe
      const mover = () =>
        ws.send(JSON.stringify({ type: "move", x: m.x, y: m.y, z: m.z, yaw: 0, pitch: 0 }));
      mover();
      rec.timer = setInterval(mover, 500);
    }
  };
  rec.cmd = (text) => ws.send(JSON.stringify({ type: "chat", text }));
  return rec;
}
const bia = aluna("bia", "2222");
const caio = aluna("caio", "3333");
await espera(1500);

// --- navegador como "ana" ---
// libs do chrome extraídas sem sudo (bug-564): se o prefixo local existir, ele
// entra no LD_LIBRARY_PATH — é o que faz o print rodar no notebook da escola.
const LIBS = join(homedir(), ".local/chrome-libs/usr/lib/x86_64-linux-gnu");
const chrome = spawn(
  acharChrome(),
  [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--enable-unsafe-swiftshader",
    `--window-size=${L},${A}`, `--remote-debugging-port=${PORTA_CDP}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-amigos-"))}`, "about:blank",
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
/** Clica o botão `rotulo` DA LINHA de um jogador (o rótulo sozinho pegaria o
 *  primeiro da lista, que pode ser outra pessoa). `dobro` = botão armado. */
const clicarNaLinha = (nome, rotulo, dobro = false) =>
  avaliar(`(() => {
  const linha = [...document.querySelectorAll('#amigos .jog-row')]
    .find(r => (r.querySelector('.jog-nome')?.textContent ?? '').startsWith(${JSON.stringify(nome)}));
  if (!linha) return 'sem linha de ' + ${JSON.stringify(nome)};
  const b = [...linha.querySelectorAll('button')]
    .find(x => x.textContent.startsWith(${JSON.stringify(rotulo)}));
  if (!b) return 'sem botão ' + ${JSON.stringify(rotulo)};
  b.click(); ${dobro ? "b.click();" : ""} return 'ok';
})()`);
/** Rótulos dos botões do painel — o texto inteiro tem a DICA do chat, que cita
 *  todos os subcomandos e faria qualquer `includes("expulsar")` passar sozinho. */
const botoes = () =>
  avaliar(`[...document.querySelectorAll('#amigos button')].map(b => b.textContent)`);
const texto = () => avaliar(`document.getElementById('amigos')?.innerText ?? ''`);
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

await cdp("Page.navigate", { url: `${BASE}/?server=ws://localhost:${PORTA_WS}&nome=ana&pin=1111` });
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

console.log("== A: a tecla abre o painel, com o convite de bia à espera ==");
// bia convida DEPOIS de ana entrar: o servidor recusa convite a quem nunca
// esteve na aula (`nomeConhecido`), e o painel mostraria uma tela vazia
bia.cmd("/amigos convidar ana");
await espera(700);
await tecla("KeyG");
await espera(600);
const aberto = await avaliar(`!document.getElementById('amigos').classList.contains('hidden')`);
ok(aberto === true, "a tecla G abriu o #amigos");
const a = (await texto()) ?? "";
ok(a.includes("bia convidou você"), "o convite de bia aparece na tela");
const btnA = (await botoes()) ?? [];
ok(btnA.includes("aceitar") && btnA.includes("recusar"), "com os botões aceitar e recusar");
ok(a.includes("caio"), "caio (online, sem grupo) aparece na lista de convidar");
const alvos = await avaliar(`(() => {
  const bs = [...document.querySelectorAll('#amigos button')];
  return bs.length ? Math.min(...bs.map(b => Math.round(b.getBoundingClientRect().height))) : 0;
})()`);
ok(alvos >= 40, `menor alvo de toque do painel = ${alvos}px (piso de 40 em pointer:coarse)`);
await foto("amigos-convite.png");

console.log("== B: recusa o convite, convida caio e vira DONA do grupo ==");
ok((await clicarNaLinha("bia", "recusar")) === "ok", "recusou o convite de bia");
await espera(700);
ok((await clicarNaLinha("caio", "convidar")) === "ok", "convidou caio pela linha dele");
await espera(700);
const b1 = (await texto()) ?? "";
ok(b1.includes("caio — convite enviado"), "o convite enviado aparece como aguardando");
caio.cmd("/amigos aceitar ana");
await espera(1000);
const b = (await texto()) ?? "";
ok(b.includes("grupo de ana — 2/6"), `o painel mostra o grupo e o teto — "${(/grupo de .*/.exec(b) ?? ["?"])[0]}"`);
ok(b.includes("ana (dono, você)"), "a dona do grupo está marcada");
const btnB = (await botoes()) ?? [];
ok(btnB.includes("expulsar"), "a dona tem o BOTÃO de expulsar quem entrou");
ok(
  btnB.some((t) => t.includes("DESFAZER")),
  "e o botão de sair avisa que DESFAZ o grupo",
);
await foto("amigos-grupo.png");

console.log(excecoes.length ? `✗ exceções: ${excecoes.join(" | ")}` : "✓ sem exceção no console");
if (excecoes.length) falhas++;
for (const c of [bia, caio]) {
  clearInterval(c.timer);
  c.ws.close();
}
ws.close();
chrome.kill("SIGKILL");
console.log(falhas === 0 ? "\nPAINEL DE AMIGOS OK" : `\nFALHOU (${falhas})`);
encerrar(falhas === 0 ? 0 : 1);
