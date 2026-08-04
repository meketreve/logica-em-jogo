#!/usr/bin/env node
/**
 * MEDE e fotografa as telas de UI num viewport de TABLET — 1024×600 paisagem
 * é a régua (o Kindle Fire da escola), com `pointer: coarse` emulado.
 *
 * Por que existe: layout de tela pequena não tem teste unitário. O que dá pra
 * automatizar é a pergunta binária "o painel CABE na janela e o alvo dá pro
 * dedo?" — cada linha do relatório é uma medição de getBoundingClientRect
 * contra a altura da janela, e o print fica do lado pra conferir o resto a
 * olho. Passou a existir na sessão 31 (layouts mobile).
 *
 * ⚠️ `pointer: coarse` NÃO vem de `mobile: true` no CDP — quem liga é o
 * `Emulation.setEmulatedMedia` abaixo. Sem ele as media queries de toque
 * ficam desligadas e o relatório inteiro mente.
 *
 * Uso:
 *   npm run dev                        # vite 5173, em outro terminal
 *   npm run shots:tablet               # 1024×600 (Kindle Fire), coarse
 *   npm run shots:tablet 1280 800      # tablet Android comum
 *   COARSE=0 npm run shots:tablet 1920 1080   # regressão do desktop
 *   BASE=http://localhost:8080 npm run shots:tablet   # contra o build servido
 *
 * As linhas "✗" numa rodada COARSE=0 são esperadas: as asserções de joystick
 * e de alvo de dedo só valem em aparelho de toque.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const BASE = process.env["BASE"] ?? "http://localhost:5173";
// mesma pasta do designqc (já ignorada pelo git): print é temporário de
// conferência, não entregável
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", `tablet-${L}x${A}`);
const PORTA = 9344;
mkdirSync(SAIDA, { recursive: true });

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
  throw new Error("Chrome não encontrado — passe CHROME=…");
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  acharChrome(),
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--enable-unsafe-swiftshader",
    `--window-size=${L},${A}`,
    `--remote-debugging-port=${PORTA}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-tablet-"))}`,
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);
chrome.stderr.on("data", (d) => {
  if (/FATAL/.test(String(d))) process.stderr.write(`[chrome] ${d}`);
});

async function abrirAba() {
  for (let i = 0; i < 40; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json();
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
const pendentes = new Map();
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pendentes.has(m.id)) {
    pendentes.get(m.id)(m);
    pendentes.delete(m.id);
  } else if (m.method === "Runtime.exceptionThrown") {
    console.log(`✗ exceção: ${m.params.exceptionDetails.exception?.description ?? "?"}`);
  }
});
const cdp = (method, params = {}) =>
  new Promise((r) => {
    const meu = ++id;
    pendentes.set(meu, r);
    ws.send(JSON.stringify({ id: meu, method, params }));
  });
const avaliar = async (expr) =>
  (await cdp("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;

await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Emulation.setDeviceMetricsOverride", {
  width: L,
  height: A,
  deviceScaleFactor: 1,
  mobile: true,
});
const COARSE = process.env["COARSE"] !== "0";
await cdp("Emulation.setTouchEmulationEnabled", { enabled: COARSE, maxTouchPoints: 5 });
// ISTO é o que liga as media queries novas — mobile:true sozinho não faz pointer:coarse
await cdp("Emulation.setEmulatedMedia", {
  features: [
    { name: "pointer", value: COARSE ? "coarse" : "fine" },
    { name: "any-pointer", value: COARSE ? "coarse" : "fine" },
  ],
});

async function tirar(nome) {
  const r = await cdp("Page.captureScreenshot", { format: "png" });
  const b64 = r.result?.data;
  if (!b64) return console.log(`✗ ${nome}: sem imagem`);
  const buf = Buffer.from(b64, "base64");
  writeFileSync(join(SAIDA, `${nome}.png`), buf);
  console.log(`  ✓ ${nome}.png (${(buf.length / 1024).toFixed(0)} KB)`);
}

/** Estoura? Compara a altura do conteúdo com a da janela pro seletor dado. */
async function medir(nome, sel) {
  const m = await avaliar(`(() => {
    const e = document.querySelector(${JSON.stringify(sel)});
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom),
             alt: Math.round(r.height), rola: e.scrollHeight > e.clientHeight + 1,
             conteudo: e.scrollHeight, janela: window.innerHeight };
  })()`);
  const veredito = !m
    ? "AUSENTE"
    : m.top < 0 || m.bottom > m.janela
      ? `✗ ESTOURA (top ${m.top}, bottom ${m.bottom}, janela ${m.janela})`
      : `✓ cabe (${m.top}..${m.bottom} de ${m.janela})${m.rola ? " · rola por dentro" : ""}`;
  console.log(`  ${nome.padEnd(22)} ${veredito}`);
}

/** Menor alvo tocável entre os que casam com o seletor. */
async function alvos(nome, sel) {
  const m = await avaliar(`(() => {
    const els = [...document.querySelectorAll(${JSON.stringify(sel)})]
      .filter(e => e.offsetParent !== null);
    if (!els.length) return null;
    const hs = els.map(e => Math.round(e.getBoundingClientRect().height));
    return { n: els.length, min: Math.min(...hs) };
  })()`);
  if (!m) return console.log(`  ${nome.padEnd(22)} (nenhum visível)`);
  const ok = m.min >= 40 ? "✓" : "✗";
  console.log(`  ${nome.padEnd(22)} ${ok} menor alvo ${m.min}px (${m.n} elementos)`);
}

console.log(`▶ ${BASE} em ${L}×${A}, pointer:coarse\n`);
await cdp("Page.navigate", { url: `${BASE}/` });
await espera(2500);

// Semeia a lista de mundos DIRETO no IndexedDB: criar pelo botão entra no jogo
// na hora, e o que interessa aqui é a tela cheia de linhas em 600px de altura.
await avaliar(`(async () => {
  const db = await new Promise((res, rej) => {
    const o = indexedDB.open('logica-em-jogo', 1);
    o.onupgradeneeded = () => o.result.createObjectStore('worlds', { keyPath: 'id' });
    o.onsuccess = () => res(o.result); o.onerror = () => rej(o.error);
  });
  const tx = db.transaction('worlds', 'readwrite').objectStore('worlds');
  ['sequencias 6A','labirinto 7B','cidade medieval 8A','fracoes 5C','circuito logico 9A','rascunho da professora']
    .forEach((name, i) => tx.put({ id: 'w'+i, name, createdAt: Date.now(), updatedAt: Date.now()-i*8.64e7, data: new ArrayBuffer(8) }));
  return 'ok';
})()`);
await cdp("Page.navigate", { url: `${BASE}/` });
await espera(2500);

console.log("— menu: início —");
await medir("menu-home", "#menu-home");
await tirar("01-menu-home");

console.log("— menu: meus mundos —");
await avaliar(`document.getElementById('menu-nome').value='profa';
  document.getElementById('menu-btn-single').click()`);
await espera(1200);
await medir("menu-worlds", "#menu-worlds");
await alvos("botoes da lista", "#menu-world-list button");
await tirar("02-menu-mundos");

console.log("— menu: rede —");
await avaliar(`[...document.querySelectorAll('.menu-back')].find(b=>b.offsetParent)?.click()`);
await espera(400);
await avaliar(`document.getElementById('menu-btn-multi').click()`);
await espera(500);
await medir("menu-multi", "#menu-multi");
await alvos("campos de rede", "#menu-multi input");
await tirar("03-menu-rede");

console.log("— menu: configurações —");
await avaliar(`[...document.querySelectorAll('.menu-back')].find(b=>b.offsetParent)?.click()`);
await espera(400);
await avaliar(`document.getElementById('menu-btn-config').click()`);
await espera(600);
await medir("menu-config", "#menu-config");
await tirar("04-menu-config");

// ─── em jogo: hotbar, chat, inventário ───────────────────────────────────
// caminho REAL (menu → criar mundo → jogar): o ?bench pula o menu e não liga
// os controles de toque, que é justamente o que precisa aparecer aqui.
console.log("\n— em jogo (mundo P criado pelo menu) —");
await cdp("Page.navigate", { url: `${BASE}/` });
await espera(2500);
await avaliar(`document.getElementById('menu-nome').value='profa';
  document.getElementById('menu-btn-single').click()`);
await espera(1000);
await avaliar(`document.getElementById('menu-new-nome').value='aula de hoje';
  document.getElementById('menu-new-tamanho').value='P';
  document.getElementById('menu-btn-new').click()`);
for (let i = 0; i < 150; i++) {
  await espera(1000);
  if (await avaliar(`!!document.querySelector('#hotbar .slot')`)) break;
  if (i % 20 === 0) {
    console.log(
      `  t=${i}s ${await avaliar("document.getElementById('load-fase')?.textContent ?? '…'")}`,
    );
  }
}
// fecha o menu de pausa (o jogo devolve o overlay ao fim da carga)
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(1500);
await medir("hotbar", "#hotbar");
await alvos("slots da hotbar", "#hotbar .slot");
console.log(
  `  ${"slots recebem dedo".padEnd(22)} ${
    (await avaliar(
      `getComputedStyle(document.querySelector('#hotbar .slots')).pointerEvents === 'auto'`,
    ))
      ? "✓ pointer-events:auto"
      : "✗ NÃO tocável"
  }`,
);
await tirar("05-jogo-hotbar");

// trocar de bloco pelo TOQUE (o caminho novo): tapa no 5º slot
const antes = await avaliar(
  `[...document.querySelectorAll('#hotbar .slot')].findIndex(s => s.classList.contains('sel'))`,
);
await avaliar(`(() => {
  const s = document.querySelectorAll('#hotbar .slot')[4];
  const r = s.getBoundingClientRect();
  s.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.left+r.width/2, clientY: r.top+r.height/2 }));
})()`);
await espera(400);
const depois = await avaliar(
  `[...document.querySelectorAll('#hotbar .slot')].findIndex(s => s.classList.contains('sel'))`,
);
console.log(
  `  ${"tap troca de slot".padEnd(22)} ${depois === 4 ? `✓ ${antes} → ${depois}` : `✗ ${antes} → ${depois} (esperado 4)`}`,
);
await tirar("06-jogo-hotbar-tap");

const tecla = (code) =>
  avaliar(
    `window.dispatchEvent(new KeyboardEvent('keydown', { code: ${JSON.stringify(code)}, bubbles: true })), 1`,
  );

console.log("— chat aberto (histórico cheio) —");
for (let i = 0; i < 12; i++) {
  await tecla("Enter"); // abre o campo
  await espera(120);
  await avaliar(`(() => {
    const f = document.getElementById('chat-input');
    f.value = 'mensagem ${i} do aluno pra encher o historico do chat';
    f.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true }));
  })()`);
  await espera(180);
}
await tecla("Enter");
await espera(700);
await medir("chat", "#chat");
await medir("chat-log", "#chat-log");
console.log(
  `  ${"chat desvia do joy".padEnd(22)} ${
    (await avaliar(`Math.round(document.getElementById('chat').getBoundingClientRect().left)`)) >=
    148
      ? "✓ começa depois do joystick"
      : "✗ por cima do joystick"
  }`,
);
const colisao = await avaliar(`(() => {
  const c = document.getElementById('chat').getBoundingClientRect();
  const h = document.getElementById('hotbar').getBoundingClientRect();
  const y = Math.min(c.bottom, h.bottom) - Math.max(c.top, h.top);
  const x = Math.min(c.right, h.right) - Math.max(c.left, h.left);
  return (y > 0 && x > 0) ? Math.round(y) : 0;
})()`);
console.log(
  `  ${"chat × hotbar".padEnd(22)} ${colisao ? `✗ sobrepõe ${colisao}px` : "✓ sem sobreposição"}`,
);
await tirar("07-jogo-chat");

console.log("— inventário —");
await avaliar(`document.getElementById('chat-input')
  .dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }))`);
await espera(400);
await tecla("KeyE");
await espera(800);
await medir("inventario", "#inventario");
await alvos("abas do inventário", ".inv-aba");
await alvos("slots do inventário", ".inv-slot");
await tirar("08-jogo-inventario");

// ─── 2ª rodada mobile (2026-08-04): os painéis de AUTORIA ────────────────
// A 1ª rodada (sessão 31) mediu menu, hotbar, chat e inventário e deixou o
// `#painel` de fora — é o painel mais denso do jogo (selects de região, de
// modelo, de bloco, formulários de objetivo) e o que o professor usa DURANTE
// a aula, de pé, no tablet. Sem medida não há conserto.
console.log("— painel de autoria (professor) —");
await tecla("KeyE"); // fecha o inventário (um painel por vez)
await espera(400);

// O painel de mundo NOVO é quase vazio — sem região não há select de área, sem
// objetivo não há linha de ↑/↓/✎/✕, e a medição diria "cabe" sobre nada. Semeia
// pelo CHAT (mesmo caminho do professor de verdade) antes de abrir.
const cmdChat = async (texto) => {
  await tecla("Enter");
  await espera(120);
  await avaliar(`(() => {
    const f = document.getElementById('chat-input');
    f.value = ${JSON.stringify(texto)};
    f.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', bubbles: true }));
  })()`);
  await espera(250);
};
for (const c of [
  "/regiao criar modelo ~ ~ ~ 40 40 40",
  "/regiao criar area-da-turma ~ ~ ~ 48 48 48",
  "/grupo criar 4",
  "/objetivo add chegar area-da-turma Va ate a area marcada com a sua equipe",
  "/objetivo add limpar modelo Deixe a area do modelo vazia",
]) {
  await cmdChat(c);
}
await avaliar(`document.getElementById('chat-input')
  .dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }))`);
await espera(500);
await tecla("KeyP");
await espera(800);
await medir("painel", "#painel");
await alvos("botões do painel", "#painel button");
await alvos("selects do painel", "#painel select");
await alvos("campos do painel", "#painel input");
// linha que ESTOURA a largura é o sintoma que a 1ª rodada corrigiu alargando:
// `.painel-row` tem flex-wrap, então falta de largura vira altura — e altura
// é o que falta em 600px.
// ⚠️ NÃO comparar o `top` dos filhos: `.painel-row` centraliza verticalmente,
// então um select de 40px ao lado de um rótulo de 24px já nasce com topos
// diferentes SEM ter quebrado. A medida honesta é a ALTURA: linha que coube
// numa faixa só tem a altura do seu filho mais alto.
const linhasQuebradas = await avaliar(`(() => {
  const rows = [...document.querySelectorAll('#painel .painel-row')].filter(e => e.offsetParent);
  let quebradas = 0;
  for (const r of rows) {
    const filhos = [...r.children].filter(c => c.offsetParent);
    if (filhos.length < 2) continue;
    const maior = Math.max(...filhos.map(c => c.getBoundingClientRect().height));
    if (r.getBoundingClientRect().height > maior + 6) quebradas++;
  }
  return { total: rows.length, quebradas };
})()`);
console.log(
  `  ${"linhas que quebram".padEnd(22)} ${
    linhasQuebradas.quebradas === 0
      ? `✓ nenhuma de ${linhasQuebradas.total}`
      : `${linhasQuebradas.quebradas} de ${linhasQuebradas.total} (cada uma come altura)`
  }`,
);
await tirar("09-jogo-painel-autoria");

console.log("— painel de jogadores (professor) —");
const abriuJogadores = await avaliar(
  `(() => {
    const b = [...document.querySelectorAll('#painel button')]
      .find(e => /jogador/i.test(e.textContent ?? ''));
    if (!b) return false;
    b.click();
    return true;
  })()`,
);
await espera(700);
if (!abriuJogadores) {
  console.log(`  ${"abrir".padEnd(22)} ✗ botão de jogadores não encontrado no painel`);
} else {
  await medir("jogadores", "#jogadores");
  await alvos("botões de jogadores", "#jogadores button");
  await tirar("10-jogo-painel-jogadores");
}

console.log("\n=== fim ===");
console.log(`imagens em ${SAIDA}`);
ws.close();
chrome.kill("SIGKILL");
process.exit(0);
