#!/usr/bin/env node
/**
 * Sonda das FERRAMENTAS v2 (§🔨, 2026-09-17) contra o host REAL + Chrome real
 * (CDP). Esqueleto copiado do `loja-shot.mjs`.
 *
 * O que ela prova, com asserção (não só print):
 * 1. SEGURAR o ⛏ não quebra na hora — a pedra fica no mundo enquanto a barra
 *    enche, e a RACHADURA aparece na tela (o estágio sobe com o tempo);
 * 2. SOLTAR antes do fim cancela: a pedra continua lá e a trinca some;
 * 3. segurar até o fim quebra, e o pedregulho entra na mochila;
 * 4. a BARRA DE VIDA da ferramenta aparece no slot (medida no DOM) e ENCOLHE a
 *    cada pedra;
 * 5. sem a picareta NA MÃO a pedra não quebra, por mais que se segure (a
 *    decisão nova: a mochila não basta);
 * 6. a picareta ACABA: some da mão e o chat avisa.
 *
 * Roda no modo TOQUE de propósito: o ⛏ do tablet chama o mesmo `input.press(0)`
 * / `release(0)` do botão do mouse, e no headless não há pointer lock pra
 * emular o mouse de verdade.
 *
 * ⚠️ Serve o cliente COMPILADO: `npm run build` antes.
 * ⚠️ Mundo descartável em `mundos/_shot-quebra` (LJ_SAVE — nunca o world.ljw).
 *
 * Uso:
 *   npm run build && npm run shots:quebra
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8123;
const PORTA_CDP = 9371;
const BASE = `http://localhost:${PORTA_WS}`;
const SAIDA = process.env["SAIDA"] ?? join(process.cwd(), ".wolf/designqc-captures", "quebra");
const MUNDO = "mundos/_shot-quebra";
const CRESCIMENTO = 200;
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
    LJ_SEED: "20260805",
    LJ_CODIGO: "prof2026",
    LJ_CRESCIMENTO: String(CRESCIMENTO),
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
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-quebra-"))}`,
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
/** Toque REAL — o Chrome gera pointerdown + pointerup + click sozinho, e o
 *  ▣ escuta `pointerdown` (tapButton), não click. */
async function tocar(x, y) {
  await cdp("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await espera(120);
  await cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await espera(600);
}
/** Centro de um botão de ação da direita, pelo rótulo do `<small>`. */
const botaoDeAcao = (nome) =>
  avaliar(`(() => {
    const b = [...document.querySelectorAll('#touch-acoes button')]
      .find(e => e.querySelector('small')?.textContent === ${JSON.stringify(nome)});
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) };
  })()`);
/** Esvazia o log do chat antes de um print de MUNDO: o `/bloco` e o `/regiao`
 *  do estúdio deixam uma dúzia de linhas de "Bloco (…) definido como …" no meio
 *  da tela, e elas não são a foto — são o andaime que a montou. */
const limparChat = () =>
  avaliar(`(document.getElementById('chat-log')?.replaceChildren(), 1)`);
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
/**
 * Espera uma condição do DOM, sondando a cada 100 ms até `limiteMs`.
 *
 * Abrir e FECHAR container são round-trip de servidor (`use_block` /
 * `fechar_container`): quem aplica é ele, e o DOM só muda quando a resposta
 * volta. Uma `espera(900)` seca passa na máquina rápida e falha na carregada —
 * foi o que aconteceu na sessão 52, e o sintoma não parece "lento": o painel da
 * fornalha fica aberto, a regra "um menu por vez" (§48) impede o baú de abrir
 * por cima, e o script acusa QUATRO falhas que parecem defeito de container.
 * Devolve o último valor lido, satisfeito ou não — a asserção é de quem chamou.
 */
async function ateQue(ler, satisfeito, limiteMs = 4000) {
  const fim = Date.now() + limiteMs;
  let v = await ler();
  while (!satisfeito(v) && Date.now() < fim) {
    await espera(100);
    v = await ler();
  }
  return v;
}
/** Estado do painel de container, medido no DOM. */
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



// ================= cena da quebra =================
const AR = 0;
const PEDRA = 2;
const PEDREGULHO = 3;
const PICARETA_MADEIRA = 912;

/** O que a sonda do cliente vê da rachadura (gancho `__quebraEstado`). */
const trinca = () => avaliar(`window.__quebraEstado ? window.__quebraEstado() : null`);
/** A barra de vida do slot `i` da hotbar, medida no DOM (null = sem barra). */
const vidaDoSlot = (i) =>
  avaliar(`(() => {
    const s = document.querySelectorAll('#hotbar .slot')[${i}];
    const b = s?.querySelector('.vida i');
    if (!b) return null;
    return { largura: b.style.width, cor: b.style.getPropertyValue('--vida-cor') };
  })()`);
/** Quantos pedregulhos a mochila mostra (o `<b class=qtd>` do slot). */
const naMochila = (id) =>
  avaliar(`(() => {
    const s = [...document.querySelectorAll('#hotbar .slot')]
      .filter(e => e.dataset.tipId === String(${id}));
    if (!s.length) return 0;
    return s.reduce((n, e) => n + Number(e.querySelector('.qtd')?.textContent ?? 1), 0);
  })()`);
const ultimosChats = () =>
  avaliar(`[...document.querySelectorAll('#chat-log *')].map(e => e.textContent).slice(-8)`);
/** Aperta o ⛏ e SEGURA (sem soltar) — o dedo fica no botão. */
async function apertarQuebrar(x, y) {
  await cdp("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
}
async function soltarQuebrar() {
  await cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await espera(150);
}

// o jogo pergunta "sair da página?" (beforeunload) — aceita, senão o navigate trava
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.method === "Page.javascriptDialogOpening") {
    ws.send(JSON.stringify({ id: ++id, method: "Page.handleJavaScriptDialog", params: { accept: true } }));
  }
});
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

// parede de PEDRA a 3 blocos, na altura dos olhos: é o alvo da mira parada
await dizer("/modo sobrevivencia eu");
for (const dz of [-1, -2]) for (const dy of [0, 1, 2]) await dizer(`/bloco ~ ~${dy} ~${dz} ${AR}`);
for (const dy of [0, 1, 2]) await dizer(`/bloco ~ ~${dy} ~-3 ${PEDRA}`);
await espera(600);
const btnQuebrar = await botaoDeAcao("quebrar");
if (!btnQuebrar) {
  console.error("✗ botão ⛏ não encontrado");
  encerrar(1);
}

diga("== 1. sem a picareta NA MÃO a pedra não quebra (a decisão nova) ==");
await limparChat();
await apertarQuebrar(btnQuebrar.x, btnQuebrar.y);
await espera(2500);
await soltarQuebrar();
const avisoMao = await ultimosChats();
ok(
  (avisoMao ?? []).some((t) => (t ?? "").includes("Pegue uma picareta")),
  `o chat mandou PEGAR a picareta (${JSON.stringify(avisoMao?.slice(-2))})`,
);
await foto("1-sem-ferramenta.png");

diga("== 2. com a picareta na mão: segurar RACHA, e a pedra só cai no fim ==");
await dizer(`/dar eu ${PICARETA_MADEIRA} 1`);
await espera(500);
await limparChat();
// ⚠️ pedra com picareta de MADEIRA leva ~1,1 s: as duas leituras têm de caber
// DENTRO disso, senão o bloco cai no meio da medição (foi o que aconteceu na
// 1ª rodada desta sonda) e o teste do cancelamento mede a mochila errada.
await apertarQuebrar(btnQuebrar.x, btnQuebrar.y);
await espera(200);
const meio = await trinca();
ok(meio?.visivel === true, `a RACHADURA apareceu no bloco (${JSON.stringify(meio)})`);
ok((meio?.estagio ?? -1) >= 0, `e num estágio do começo (${meio?.estagio})`);
await foto("2-rachando.png");
const depois = await ateQue(trinca, (t) => (t?.estagio ?? 0) > (meio?.estagio ?? 0), 500);
ok((depois?.estagio ?? 0) > (meio?.estagio ?? 0), `a trinca CRESCE com o tempo (${meio?.estagio} → ${depois?.estagio})`);

diga("== 3. SOLTAR antes do fim cancela ==");
await soltarQuebrar();
const cancelada = await trinca();
ok(cancelada?.visivel === false, "a trinca some quando o dedo sai");
ok(await naMochila(PEDREGULHO) === 0, "e nenhum pedregulho entrou na mochila");
await foto("3-cancelou.png");

diga("== 4. segurar até o fim QUEBRA, e a ferramenta gasta ==");
await apertarQuebrar(btnQuebrar.x, btnQuebrar.y);
const pegou = await ateQue(() => naMochila(PEDREGULHO), (n) => n > 0, 6000);
await soltarQuebrar();
ok(pegou > 0, `o pedregulho entrou na mochila (${pegou})`);
const vida1 = await ateQue(() => vidaDoSlot(0), (v) => v !== null, 3000);
ok(vida1 !== null, `a BARRA DE VIDA apareceu no slot da picareta (${JSON.stringify(vida1)})`);
await foto("4-quebrou-com-barra.png");

diga("== 5. a barra ENCOLHE a cada pedra ==");
for (let i = 0; i < 3; i++) {
  await dizer(`/bloco ~ ~1 ~-3 ${PEDRA}`);
  await espera(300);
  await apertarQuebrar(btnQuebrar.x, btnQuebrar.y);
  await espera(2000);
  await soltarQuebrar();
}
const vida2 = await vidaDoSlot(0);
const pct = (v) => Number(String(v?.largura ?? "100%").replace("%", ""));
ok(pct(vida2) < pct(vida1), `a vida caiu (${vida1?.largura} → ${vida2?.largura})`);
await foto("5-barra-menor.png");

diga(`\n${falhas === 0 ? "✓ tudo certo" : `✗ ${falhas} falha(s)`}`);
encerrar(falhas === 0 ? 0 : 1);
