#!/usr/bin/env node
/**
 * Sonda do BAÚ-LOJA contra o host REAL + Chrome real (CDP) — nasceu do
 * conserto do bug-663 (preço que não salvava) e do bug-664 (loja que não
 * rolava), 2026-09-12. Esqueleto copiado do `f10-shot.mjs`.
 *
 * O que ela prova, com asserção (não só print):
 * 1. a profa COLOCA a loja pelo ▣ (criador = quem colocou; `/bloco` deixa sem
 *    dono) e enche o estoque com 16 tipos;
 * 2. criador: a lista de preços ROLA e estoque, mochila (2 fileiras) e hotbar
 *    continuam no painel — medido em ALTURA, porque o 1º patch passou nos
 *    números e o print mostrou a mochila sumida;
 * 3. re-render do servidor NO MEIO da digitação mantém foco, valor, cursor e
 *    rolagem (o Chrome dispara `change` no campo que sai do DOM);
 * 4. ÚLTIMO campo + ESC salva (o `change` do blur chegava com `pos` já null);
 * 5. preço de item sem estoque continua na lista ("sem estoque");
 * 6. comprador (outro aluno): a vitrine de 16 itens rola até o último;
 * 7. baú e fornalha comuns sem regressão de layout.
 *
 * ⚠️ Serve o cliente COMPILADO: `npm run build` antes.
 * ⚠️ Mundo descartável em `mundos/_shot-loja` (LJ_SAVE — nunca o world.ljw).
 *
 * Uso:
 *   npm run build && npm run shots:loja            # 1024×600 (tablet)
 *   npm run build && npm run shots:loja -- 1366 768
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8121;
const PORTA_CDP = 9369;
const BASE = `http://localhost:${PORTA_WS}`;
const SAIDA = process.env["SAIDA"] ?? join(process.cwd(), ".wolf/designqc-captures", "loja");
const MUNDO = "mundos/_shot-loja";
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
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-loja-"))}`,
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


// ================= cena da loja =================
const AR = 0;
const DIRT = 5;
const BAU_LOJA = 246;
const ITENS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17];

const tecla2 = (key, code, vk, text) =>
  cdp("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode: vk, ...(text ? { text } : {}) })
    .then(() => cdp("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode: vk }));
const digitar = (t) => cdp("Input.insertText", { text: t });

const painelLoja = () =>
  avaliar(`(() => {
    const r = document.getElementById('container');
    if (!r || r.classList.contains('hidden')) return null;
    return { titulo: r.querySelector('h2')?.textContent ?? '',
             criador: !!r.querySelector('.loja-precos'),
             compra: !!r.querySelector('.loja-compra') };
  })()`);
const campo = (i) => `document.querySelectorAll('#container .loja-preco-input')[${i}]`;
const valorDe = (i) => avaliar(`${campo(i)}?.value ?? null`);

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

diga("== 1. profa COLOCA a loja pelo ▣ (criador = quem colocou) ==");
await dizer("/modo sobrevivencia eu");
for (const dz of [-1, -2]) for (const dy of [0, 1, 2]) await dizer(`/bloco ~ ~${dy} ~${dz} ${AR}`);
for (const dy of [0, 1, 2]) await dizer(`/bloco ~ ~${dy} ~-3 ${DIRT}`);
await dizer(`/dar eu ${BAU_LOJA} 1`);
await espera(600);
const btn = await botaoDeAcao("colocar");
if (!btn) {
  console.error("✗ botão ▣ não encontrado");
  encerrar(1);
}
await tocar(btn.x, btn.y); // coloca
await espera(600);
for (const id of ITENS) await dizer(`/dar eu ${id} 5`);
await espera(600);
await tocar(btn.x, btn.y); // abre
let p = await ateQue(painelLoja, (p) => p !== null);
ok(p?.titulo === "loja" && p?.criador, `abriu a loja na visão do CRIADOR (${JSON.stringify(p)})`);
if (!p) encerrar(1);

diga("== 2. 16 tipos no estoque ==");
const clicar = (sel, i) =>
  avaliar(`(() => {
    const b = document.querySelector(${JSON.stringify(sel)})?.querySelectorAll('button.inv-slot')[${i}];
    if (!b) return false; b.click(); return true;
  })()`);
for (let i = 0; i < ITENS.length; i++) {
  const [sel, idx] = i < 9 ? ["#container .inv-hotbar", i] : ["#container .inv-mochila", i - 9];
  await clicar(sel, idx);
  await espera(150);
  await clicar("#container .cont-bau", i);
  await espera(300);
}
const nLinhas = await ateQue(
  () => avaliar(`document.querySelectorAll('#container .loja-preco-input').length`),
  (n) => n === ITENS.length,
);
ok(nLinhas === ITENS.length, `16 linhas de preço (${nLinhas})`);

diga("== 3. bug-664 (criador): lista de preços ROLA e a mochila fica no painel ==");
const layout = () =>
  avaliar(`(() => {
    const r = document.getElementById('container').getBoundingClientRect();
    const pr = document.querySelector('#container .loja-precos');
    const hb = document.querySelector('#container .inv-hotbar').getBoundingClientRect();
    const mo = document.querySelector('#container .inv-mochila').getBoundingClientRect();
    const bau = document.querySelector('#container .cont-bau').getBoundingClientRect();
    const slot = document.querySelector('#container .inv-mochila .inv-slot').getBoundingClientRect();
    return { painelBase: Math.round(r.bottom), hotbarBase: Math.round(hb.bottom), mochilaTopo: Math.round(mo.top),
             mochilaAlt: Math.round(mo.height), slotAlt: Math.round(slot.height), bauAlt: Math.round(bau.height),
             precosSH: pr.scrollHeight, precosCH: pr.clientHeight, overflowY: getComputedStyle(pr).overflowY };
  })()`);
let lay = await layout();
diga(`  · ${JSON.stringify(lay)}`);
ok(lay.precosSH > lay.precosCH + 4 && lay.overflowY === "auto", "a lista de preços tem mais conteúdo que altura e rola");
ok(lay.hotbarBase <= lay.painelBase + 1, "a hotbar da mochila continua DENTRO do painel");
ok(lay.mochilaAlt >= 2 * lay.slotAlt, `a grade da mochila mostra 2 fileiras (${lay.mochilaAlt}px, slot ${lay.slotAlt}px)`);
ok(lay.bauAlt >= lay.slotAlt, `o estoque mostra ao menos 1 fileira inteira (${lay.bauAlt}px)`);
await foto("01-criador.png");

diga("== 4. bug-663 (B): re-render do servidor NO MEIO da digitação ==");
await avaliar(`(${campo(5)}.focus(), 1)`);
await digitar("9");
await avaliar(`(document.querySelector('#container .loja-precos').scrollTop = 120, 1)`);
await avaliar(`(document.querySelector('#container .loja-precos').dataset.velho = '1', 1)`);
// outro campo manda definir_preco → o servidor responde com `container` → render
await avaliar(`(() => { const c = ${campo(0)}; c.value = '3'; c.dispatchEvent(new Event('change')); return 1; })()`);
const renderizou = await ateQue(
  () => avaliar(`!document.querySelector('#container .loja-precos')?.dataset.velho`),
  (v) => v === true,
);
ok(renderizou, "o servidor respondeu e o painel foi redesenhado");
const pos = await avaliar(`(() => { const a = document.activeElement;
  return { idx: [...document.querySelectorAll('#container .loja-preco-input')].indexOf(a), valor: a?.value ?? null,
           cursor: a?.selectionStart ?? null,
           rolagem: document.querySelector('#container .loja-precos').scrollTop }; })()`);
// por POSIÇÃO (e não `data-item`): o mesmo script roda contra o código velho no A/B
ok(pos.idx === 5 && pos.valor === "9", `o campo em edição sobreviveu com foco e "9" (${JSON.stringify(pos)})`);
ok(pos.cursor === 1, `o cursor ficou depois do "9" (${pos.cursor}) — lido antes do replaceChildren`);
ok(pos.rolagem >= 100, `a rolagem da lista sobreviveu (${pos.rolagem})`);
await digitar("1"); // o cursor ficou no fim: "91"
await tecla2("Enter", "Enter", 13, "\r");
await espera(700);
ok((await valorDe(5)) === "91", `Enter mandou "91" e o servidor devolveu (${await valorDe(5)})`);
ok((await valorDe(0)) === "3", `o preço do campo 0 voltou do servidor (${await valorDe(0)})`);

diga("== 5. bug-663 (A): ÚLTIMO campo + ESC ==");
await avaliar(`(${campo(15)}.focus(), 1)`);
await digitar("7");
await tecla2("Escape", "Escape", 27);
ok((await ateQue(painelLoja, (p) => p === null)) === null, "ESC fechou o painel");
await espera(1200);
await tocar(btn.x, btn.y);
p = await ateQue(painelLoja, (p) => p !== null);
ok(!!p?.criador, "reabriu como criador");
await ateQue(() => valorDe(15), (v) => v !== null);
const v15 = await valorDe(15);
ok(v15 === "7", `o preço do ÚLTIMO campo, digitado e fechado com ESC, salvou ("${v15}")`);

diga("== 6. preço de item SEM estoque não some da tela ==");
// tira o item 17 (slot 15 do baú) de volta pra hotbar vazia
await clicar("#container .cont-bau", 15);
await espera(150);
await clicar("#container .inv-hotbar", 0);
await espera(800);
const semEst = await avaliar(`(() => { const c = ${campo(15)}; return c ? { valor: c.value,
  aviso: c.parentElement.querySelector('.loja-sem-estoque')?.textContent ?? null } : null; })()`);
ok(semEst?.valor === "7" && semEst?.aviso === "sem estoque", `a linha ficou com o preço e o aviso (${JSON.stringify(semEst)})`);

diga("== 7. preço pra tudo (pra encher a vitrine do comprador) ==");
for (let i = 1; i < 15; i++) {
  if (i === 5) continue;
  await avaliar(`(() => { const c = ${campo(i)}; c.value = '${i + 2}'; c.dispatchEvent(new Event('change')); return 1; })()`);
  await espera(250);
}
// devolve o 17 pro estoque (senão ele fica "0 em estoque" pro comprador — vale também)
await avaliar(`document.querySelector('#container .cont-fechar')?.click()`);
ok((await ateQue(painelLoja, (p) => p === null)) === null, "fechou pelo botão");
await espera(800);

diga("== 8. bug-664 (comprador): a vitrine inteira alcançável ==");
if (!(await entrar("nome=aluno&pin=4321"))) {
  console.error("✗ aluno não entrou");
  encerrar(1);
}
const btn2 = await ateQue(() => botaoDeAcao("interagir"), (b) => !!b, 6000);
if (!btn2) {
  diga(`  · botões de ação: ${JSON.stringify(await avaliar(`[...document.querySelectorAll('#touch-acoes button small')].map(e => e.textContent)`))}`);
  await foto("99-aluno-sem-botao.png");
  encerrar(1);
}
await tocar(btn2.x, btn2.y);
p = await ateQue(painelLoja, (p) => p !== null, 6000);
ok(p?.compra === true, `o aluno abriu a loja na visão de COMPRA (${JSON.stringify(p)})`);
const comp = await avaliar(`(() => {
  const r = document.getElementById('container').getBoundingClientRect();
  const c = document.querySelector('#container .loja-compra');
  if (!c) return null;
  const antes = { linhas: c.querySelectorAll('.loja-item').length, sh: c.scrollHeight, ch: c.clientHeight,
                  base: Math.round(c.getBoundingClientRect().bottom), painelBase: Math.round(r.bottom) };
  c.scrollTop = c.scrollHeight;
  const ult = [...c.querySelectorAll('.loja-item')].at(-1).getBoundingClientRect();
  return { ...antes, ultimaBase: Math.round(ult.bottom), ultimaTopo: Math.round(ult.top) };
})()`);
diga(`  · ${JSON.stringify(comp)}`);
ok(comp?.linhas === 16, `16 itens à venda (${comp?.linhas})`);
ok(comp && comp.sh > comp.ch + 4, "a lista de compra é maior que a caixa — e rola");
ok(comp && comp.base <= comp.painelBase + 1, "a caixa da lista termina dentro do painel");
ok(comp && comp.ultimaBase <= comp.base + 1 && comp.ultimaTopo >= 0, "rolada até o fim, a ÚLTIMA linha fica visível");
await foto("02-comprador-rolado.png");
await avaliar(`(document.querySelector('#container .loja-compra').scrollTop = 0, 1)`);
await foto("03-comprador-topo.png");

diga("== 9. regressão: baú e fornalha comuns (a mochila do #container ganhou piso) ==");
await avaliar(`document.querySelector('#container .cont-fechar')?.click()`);
await ateQue(painelLoja, (p) => p === null);
if (!(await entrar("nome=profa&pin=1234&codigo=prof2026"))) encerrar(1);
for (const [bloco, nome] of [[188, "baú"], [186, "fornalha"]]) {
  for (const dy of [0, 1, 2]) await dizer(`/bloco ~ ~${dy} ~-2 ${bloco}`);
  await espera(600);
  const b = await ateQue(() => botaoDeAcao("interagir") .then((x) => x ?? botaoDeAcao("colocar")), (x) => !!x, 6000);
  await tocar(b.x, b.y);
  const q = await ateQue(painelLoja, (p) => p?.titulo === nome, 6000);
  ok(q?.titulo === nome, `abriu o painel "${nome}" (${q?.titulo})`);
  const m = await avaliar(`(() => {
    const r = document.getElementById('container').getBoundingClientRect();
    const g = document.querySelector('#container .cont-bau, #container .cont-fornalha').getBoundingClientRect();
    const mo = document.querySelector('#container .inv-mochila').getBoundingClientRect();
    const hb = document.querySelector('#container .inv-hotbar').getBoundingClientRect();
    return { grade: Math.round(g.height), mochila: Math.round(mo.height), hotbarBase: Math.round(hb.bottom), painelBase: Math.round(r.bottom) };
  })()`);
  diga(`  · ${JSON.stringify(m)}`);
  ok(m.mochila >= 93 && m.hotbarBase <= m.painelBase + 1 && m.grade >= 44, `${nome}: grade, mochila (2 fileiras) e hotbar no painel`);
  await foto(`04-${nome === "baú" ? "bau" : nome}.png`);
  await avaliar(`document.querySelector('#container .cont-fechar')?.click()`);
  await ateQue(painelLoja, (p) => p === null);
  await espera(800);
}

diga(excecoes.length ? `\n✗ exceções no console: ${excecoes.join(" | ")}` : "\n✓ sem exceção no console");
if (excecoes.length) falhas++;
diga(falhas === 0 ? `\nSONDA LOJA OK — ${SAIDA}` : `\nSONDA LOJA com ${falhas} falha(s)`);
encerrar(falhas === 0 ? 0 : 1);
