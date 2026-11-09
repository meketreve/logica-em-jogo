#!/usr/bin/env node
/**
 * Sonda da §🎣 PESCA (2026-11-09) contra o host REAL + Chrome real (CDP).
 * Esqueleto copiado do `bichos-shot.mjs` (modo TOQUE, régua 1024×600).
 *
 * O que ela prova, com asserção (não só print):
 * A. o ITEM NA MÃO: a vara aparece na 1ª pessoa (`__mao().primeira`), some em
 *    3ª pessoa e passa pro braço do próprio corpo; o colega (um robô no fio,
 *    `mao`) aparece segurando o que ele segura — e CONTROLE NEGATIVO: mão
 *    vazia nos dois lados zera o desenho.
 * B. a PESCA no CRIATIVO (decisão dele: dá peixe): o balde faz a água, a vara
 *    mira a água (o ▣ vira 🎣 "lançar"), a boia cai e a LINHA aparece, a
 *    boia AFUNDA na mordida (o ▣ vira "puxar"), puxar tira o que veio e ele
 *    entra na HOTBAR local.
 * C. a PESCA na SOBREVIVÊNCIA: o que veio entra na MOCHILA e a vara gasta;
 *    CONTROLE NEGATIVO: puxar antes da mordida não traz nada.
 * D. o SOM (contadores do `__som`, como a `shots:som`): lançar soa 1 (zunido +
 *    plop numa voz), a mordida 1, puxar 1; CONTROLE NEGATIVO: a linha recolhida
 *    sozinha (trocou de item) fica calada.
 *
 * ⚠️ Serve o cliente COMPILADO: `npm run build` antes.
 * Uso: npm run build && npm run shots:pesca
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8147;
const PORTA_CDP = 9397;
const BASE = `http://localhost:${PORTA_WS}`;
const SAIDA = process.env["SAIDA"] ?? join(process.cwd(), ".wolf/designqc-captures", "pesca");
const MUNDO = "mundos/_shot-pesca";
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
  matarChrome();
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
// Perfil temporário do Chrome (2026-10-10): são ~57 MB por rodada em /tmp e
// ninguém os apagava — o `exit` cobre tanto o fim normal quanto o
// `process.exit()` do encerrar(). E Ctrl+C passa pelo encerrar() também: matar
// só ESTE processo deixava o Chrome órfão segurando memória por horas.
const PERFIL = mkdtempSync(join(tmpdir(), "lj-pesca-"));
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
    detached: true, stdio: ["ignore", "ignore", "pipe"],
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
/**
 * Centro de um botão de ação da direita, pela IDENTIDADE (`data-acao`).
 *
 * NÃO pelo rótulo: o ▣ é `colocar` no DOM mas se chama "interagir" mirando um
 * baú/fornalha, "comer" com pão na mão e "canto 2" com a varinha — procurar
 * pelo texto achava `null` justamente nas cenas que estes prints montam.
 */
const seletorDaAcao = (acao) => `#touch-acoes button[data-acao=${JSON.stringify(acao)}]`;
const botaoDeAcao = (acao) =>
  avaliar(`(() => {
    const b = document.querySelector(${JSON.stringify(seletorDaAcao(acao))});
    if (!b) return null;
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) };
  })()`);
/** O rótulo VISÍVEL do botão — é o que o aluno lê, e ele muda por estado. */
const rotuloDaAcao = (acao) =>
  avaliar(`document.querySelector(${JSON.stringify(seletorDaAcao(acao))})?.querySelector('small')?.textContent ?? null`);
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

const naMochila = (id) =>
  avaliar(`(() => {
    const s = [...document.querySelectorAll('#hotbar .slot')]
      .filter(e => e.dataset.tipId === String(${id}));
    if (!s.length) return 0;
    return s.reduce((n, e) => n + Number(e.querySelector('.qtd')?.textContent ?? 1), 0);
  })()`);
const slotDoItem = (id) =>
  avaliar(`[...document.querySelectorAll('#hotbar .slot')]
    .findIndex(e => e.dataset.tipId === String(${id}))`);
/** Centro de um slot da hotbar (é assim que o tablet troca o que está na mão). */
const slotEm = (i) =>
  avaliar(`(() => {
    const s = document.querySelectorAll('#hotbar .slot')[${i}];
    if (!s) return null;
    const r = s.getBoundingClientRect();
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) };
  })()`);
/** Põe este ITEM na mão. Devolve o índice do slot (−1 = não está na hotbar). */
async function porNaMao(id) {
  const i = await slotDoItem(id);
  if (i < 0) return -1;
  const r = await slotEm(i);
  if (!r) return -1;
  await tocar(r.x, r.y);
  return i;
}


diga(`▶ ${BASE} em ${L}×${A}\n`);
// a hotbar do CRIATIVO é do navegador (localStorage): vara no 1, balde de água no 2
await cdp("Page.navigate", { url: `${BASE}/` });
await espera(1500);
await avaliar(`localStorage.setItem('lj-hotbar', JSON.stringify([944, 901, 1, 2, 3, 4, 5, 6, 7])), 1`);
if (!(await entrar("nome=profa&pin=1234&codigo=prof2026"))) {
  console.error("✗ o mundo não ficou pronto");
  encerrar(1);
}

const VARA = 944;
const PICARETA_PEDRA = 913;
const mao = () => avaliar(`window.__mao ? window.__mao() : null`);

/** Um colega de verdade no fio (sem navegador): entra e segura o que mandarem. */
async function robo(nome, pin) {
  const s = new WebSocket(`ws://localhost:${PORTA_WS}`);
  s.binaryType = "arraybuffer";
  await new Promise((r, j) => (s.addEventListener("open", r, { once: true }), s.addEventListener("error", j, { once: true })));
  s.send(JSON.stringify({ type: "join", name: nome, pin }));
  return {
    mandar: (m) => s.send(JSON.stringify(m)),
    fechar: () => s.close(),
  };
}

diga("== A1. a vara na mão, em 1ª pessoa ==");
await dizer("/modo sobrevivencia eu");
await dizer(`/dar eu ${VARA} 1`);
await espera(500);
const slotV = await porNaMao(VARA);
ok(slotV >= 0, `a vara está na hotbar e foi escolhida (slot ${slotV})`);
const m1 = await ateQue(mao, (m) => m?.primeira === VARA, 3000);
ok(m1?.primeira === VARA, `a 1ª pessoa desenha a vara (${m1?.primeira})`);
ok(m1?.primeiraVisivel === true, "e ela está visível");
await avaliar(`window.__mirar && window.__mirar(0, 0, 0)`); // olha pro chão longe: o céu atrás da mão
await limparChat();
await foto("A1-vara-na-mao.png");

diga("== A2. 3ª pessoa: a mão da câmera some e o braço segura ==");
await tecla("KeyC");
const m2 = await ateQue(mao, (m) => m?.corpo === VARA, 3000);
ok(m2?.corpo === VARA, `o braço do próprio corpo segura a vara (${m2?.corpo})`);
ok(m2?.primeiraVisivel === false, "a mão da 1ª pessoa sumiu");
await foto("A2-terceira-pessoa.png");
await tecla("KeyC");
await espera(400);

diga("== A3. o colega: o que ele segura aparece no braço dele ==");
const bot = await robo("bot", "5555");
await espera(800);
await dizer("/tp bot profa"); // perto, pra pose dele chegar
bot.mandar({ type: "mao", id: PICARETA_PEDRA });
const m3 = await ateQue(mao, (m) => Object.values(m?.colegas ?? {}).includes(PICARETA_PEDRA), 4000);
ok(Object.values(m3?.colegas ?? {}).includes(PICARETA_PEDRA), `o colega aparece com a picareta (${JSON.stringify(m3?.colegas)})`);

diga("== A4. CONTROLE NEGATIVO: mão vazia nos dois lados ==");
bot.mandar({ type: "mao", id: null });
const livre = await avaliar(`[...document.querySelectorAll('#hotbar .slot')].findIndex(e => !e.dataset.tipId)`);
if (livre >= 0) {
  const r = await slotEm(livre);
  if (r) await tocar(r.x, r.y);
}
const m4 = await ateQue(
  mao,
  (m) => m?.primeira === null && Object.values(m?.colegas ?? {}).every((v) => v === null),
  4000,
);
ok(livre >= 0, `achei um slot vazio na hotbar (${livre})`);
ok(m4?.primeira === null, `a 1ª pessoa não desenha nada (${m4?.primeira})`);
ok(Object.values(m4?.colegas ?? {}).every((v) => v === null), `o colega ficou de mão vazia (${JSON.stringify(m4?.colegas)})`);
bot.fechar();


const AGUA = 129;
const SAI = [938, 28, 943, 942]; // peixe cru, folhas, pena, couro (SAI_DA_PESCA)
const pesca = () => avaliar(`window.__pesca ? window.__pesca() : null`);
const sonsPesca = async () => (await avaliar(`window.__som ? window.__som().porTipo.pesca ?? 0 : -1`)) ?? 0;
const bloco = (x, y, z) => avaliar(`window.__blocoEm(${x}, ${y}, ${z})`);
const tocarSlot = async (i) => {
  const r = await slotEm(i);
  if (r) await tocar(r.x, r.y);
};
const tocarAcao = async () => {
  const b = await botaoDeAcao("colocar");
  if (b) await tocar(b.x, b.y);
};
const idsNaHotbar = () =>
  avaliar(`[...document.querySelectorAll('#hotbar .slot')].map(e => Number(e.dataset.tipId ?? 0))`);

/** Faz uma poça a 3 blocos (o balde é o único jeito de pôr água — `/bloco`
 *  recusa o 129) e devolve a célula da água. */
async function fazerPoca(slotBalde) {
  const cam = await avaliar(`window.__mirar(0, 0, 0)`);
  // a 3 blocos, num lado cujo chão NÃO é água (a poça de antes escorre morro abaixo)
  for (const [dx, dz] of [[3, 0], [0, 3], [0, -3], [-3, 0], [3, 3], [-3, -3]]) {
    const x = Math.floor(cam.x) + dx;
    const z = Math.floor(cam.z) + dz;
    let g = Math.floor(cam.y) + 1;
    for (let i = 0; i < 12 && (await bloco(x, g, z)) === 0; i++) g--;
    if ((await bloco(x, g, z)) === AGUA) continue;
    // o chão da coluna é `g`; a água nasce em cima dele
    await tocarSlot(slotBalde);
    await avaliar(`window.__mirar(${x + 0.5}, ${g + 1.0}, ${z + 0.5})`);
    await espera(250);
    await tocarAcao();
    const virou = await ateQue(() => bloco(x, g + 1, z), (id) => id === AGUA, 3000);
    if (virou === AGUA) return { x, y: g + 1, z };
  }
  return null;
}

/** Lança, espera a mordida (5–20 s no servidor) e puxa. */
async function pescarUmaVez(poca, nomeFoto) {
  await avaliar(`window.__mirar(${poca.x + 0.5}, ${poca.y + 0.5}, ${poca.z + 0.5})`);
  await espera(300);
  const mira = await pesca();
  ok(mira?.alvo !== null, `a vara mira a água (${JSON.stringify(mira?.alvo)})`);
  const rot = await rotuloDaAcao("colocar");
  ok(/lançar/.test(rot ?? ""), `o ▣ diz "${rot}"`);
  const som0 = await sonsPesca();
  await tocarAcao();
  const lancou = await ateQue(pesca, (p) => p?.minha !== null && p?.minha !== undefined, 3000);
  const som1 = await ateQue(sonsPesca, (n) => n >= som0 + 1, 1500);
  ok(som1 - som0 === 1, `🔊 lançar soou (zunido + plop, uma voz): ${som1 - som0}`);
  const minha = lancou?.minha;
  const b = minha != null ? lancou.boias[minha] : null;
  ok(b !== null && b?.x === poca.x && b?.z === poca.z, `a boia caiu na poça (${JSON.stringify(b)})`);
  ok(b?.linha === true, "e a LINHA vai da vara até ela");
  const rotP = await rotuloDaAcao("colocar");
  ok(/puxar/.test(rotP ?? ""), `com a boia na água o ▣ diz "${rotP}"`);
  await limparChat();
  if (nomeFoto) await foto(`${nomeFoto}-boia.png`);
  const mordeu = await ateQue(pesca, (p) => p?.boias?.[minha]?.afundada === true, 26000);
  ok(mordeu?.boias?.[minha]?.afundada === true, "o peixe MORDEU: a boia afundou");
  const som2 = await sonsPesca();
  ok(som2 - som1 === 1, `🔊 a mordida soou o alerta: ${som2 - som1}`);
  if (nomeFoto) await foto(`${nomeFoto}-mordida.png`);
  await tocarAcao();
  const saiu = await ateQue(pesca, (p) => p?.minha === null, 3000);
  ok(saiu?.minha === null && !saiu?.boias?.[minha], "puxou: a boia saiu da água");
  const som3 = await ateQue(sonsPesca, (n) => n >= som2 + 1, 1500);
  ok(som3 - som2 === 1, `🔊 puxar soou a carretilha: ${som3 - som2}`);
}

diga("== B. a pesca no CRIATIVO: o que veio entra na hotbar ==");
await dizer("/modo criativo eu"); // a seção A deixou em sobrevivência
await ateQue(idsNaHotbar, (ids) => ids[0] === 944 && ids[1] === 901, 3000);
const pocaB = await fazerPoca(1);
ok(pocaB !== null, `o balde fez a poça (${JSON.stringify(pocaB)})`);
if (pocaB) {
  await tocarSlot(0);
  const antes = await idsNaHotbar();
  await pescarUmaVez(pocaB, "B");
  const depois = await ateQue(idsNaHotbar, (ids) => ids.some((id, i) => id !== antes[i]), 3000);
  const novo = depois.find((id, i) => id !== antes[i]);
  ok(SAI.includes(novo), `entrou na hotbar o que a pesca dá (${novo})`);
  ok(depois[0] === 944, "e a vara continua na mão (slot 1)");
  await foto("B-depois.png");
}

diga("== C. a pesca na SOBREVIVÊNCIA: mochila, vara gasta, e o controle ==");
await dizer("/modo sobrevivencia eu");
await dizer(`/dar eu ${VARA} 1`);
await espera(600);
// a mesma poça do B (a água é do mundo, não do modo)
const pocaC = pocaB && (await bloco(pocaB.x, pocaB.y, pocaB.z)) === AGUA ? pocaB : null;
ok(pocaC !== null, `a poça continua lá (${JSON.stringify(pocaC)})`);
if (pocaC) {
  await porNaMao(VARA);
  // CONTROLE NEGATIVO: lança e puxa na hora → nada vem
  await avaliar(`window.__mirar(${pocaC.x + 0.5}, ${pocaC.y + 0.5}, ${pocaC.z + 0.5})`);
  await espera(300);
  const antes = await idsNaHotbar();
  await tocarAcao();
  const fora = await ateQue(pesca, (p) => p?.minha != null, 3000);
  ok(fora?.minha != null, "pré-condição do controle: a boia ESTAVA na água");
  await tocarAcao();
  await ateQue(pesca, (p) => p?.minha === null, 3000);
  await espera(600);
  const igual = await idsNaHotbar();
  ok(JSON.stringify(igual) === JSON.stringify(antes), "puxar ANTES da mordida não trouxe nada");
  await pescarUmaVez(pocaC, null);
  const depois = await ateQue(idsNaHotbar, (ids) => ids.some((id) => SAI.includes(id)), 3000);
  ok(depois.some((id) => SAI.includes(id)), `entrou na MOCHILA o que a pesca dá (${depois})`);
  const vida = await avaliar(`!!document.querySelector('#hotbar .slot[data-tip-id="944"] .vida, #hotbar .slot[data-tip-id="944"] [class*=vida]')`);
  ok(vida === true, "a vara ganhou a barra de vida (gastou 1)");
}

diga("== D. CONTROLE NEGATIVO do som: a linha recolhida sozinha fica calada ==");
if (pocaC) {
  await porNaMao(VARA);
  await avaliar(`window.__mirar(${pocaC.x + 0.5}, ${pocaC.y + 0.5}, ${pocaC.z + 0.5})`);
  await espera(300);
  await tocarAcao();
  const fora = await ateQue(pesca, (p) => p?.minha != null, 3000);
  ok(fora?.minha != null, "pré-condição: a boia está na água");
  await espera(400);
  const antes = await sonsPesca();
  const livre = await avaliar(`[...document.querySelectorAll('#hotbar .slot')].findIndex(e => !e.dataset.tipId)`);
  await tocarSlot(livre); // largou a vara: o servidor recolhe a linha
  const sumiu = await ateQue(pesca, (p) => p?.minha === null, 4000);
  ok(sumiu?.minha === null, "trocar de item recolheu a linha");
  await espera(500);
  ok((await sonsPesca()) === antes, "e ela voltou CALADA (nada de carretilha)");
}

ok(excecoes.length === 0, `sem exceção no console (${excecoes.slice(0, 2).join(" | ")})`);
diga(`\n${falhas === 0 ? "✓ tudo certo" : `✗ ${falhas} falha(s)`}`);
encerrar(falhas === 0 ? 0 : 1);
