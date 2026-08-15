/**
 * Gera as 6 prints do fundo do menu principal (`?foto` no cliente).
 *
 * O menu 3D é "câmera dentro de um cubo" — a câmera do JOGO é que deve
 * fotografar o MUNDO real nas 6 direções das faces internas do cubo:
 * 4 cardeais (horizonte) + para cima + para baixo. O `?foto=SEED` no cliente
 * (com o hook `window.__fotoApontar(yaw, pitch)` exposto em `iniciarFoto`)
 * deixa isso acontecer: mundo procedural E de seed FIXA, câmera PARADA.
 *
 * Uso: npm run dev (vite 5173) em outro terminal, depois
 *     node scripts/fundo-shots.mjs
 * Salva em client/public/menu-fundo/*.png — que o Vite serve na raiz e o
 * menuFundo.ts carrega como textura das faces.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env["BASE"] ?? "http://localhost:5173";
const SEED = process.env["SEED"] ?? "20260815";
const SAIDA = new URL("../client/public/menu-fundo/", import.meta.url).pathname;
const L = Number(process.env["L"] ?? 800); // quadrado: a face do cubo é quadrada
const A = L;
const PORTA = process.env["CDP_PORT"] ?? "9223";

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
const CHROME = acharChrome();

mkdirSync(SAIDA, { recursive: true });
console.log(`▶ ${BASE}/?foto=${SEED} → ${SAIDA}`);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--enable-unsafe-swiftshader",
    `--window-size=${L},${A}`,
    `--remote-debugging-port=${PORTA}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-fundo-"))}`,
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);
chrome.stderr.on("data", (d) => {
  if (/FATAL/.test(String(d))) process.stderr.write(`[chrome] ${d}`);
});

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

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
  (
    await cdp("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })
  ).result?.result?.value;

await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Emulation.setDeviceMetricsOverride", {
  width: L,
  height: A,
  deviceScaleFactor: 1,
  mobile: false,
});

// sem HUD: o que interessa é o MUNDO, e o F3/crosshair/hotbar sujariam as faces
const limparHud = `(() => {
  for (const sel of ['#hotbar', '#crosshair', '#chat', '#hud', '#objetivos',
                     '#painel', '#inventario', '#jogadores', '#amigos', '#overlay']) {
    const e = document.querySelector(sel);
    if (e) e.remove();
  }
  return 'hud limpo';
})()`;

await cdp("Page.navigate", { url: `${BASE}/?foto=${SEED}` });
// mundo E + raio 12: deixa o streaming/mesh encher os chunks ao redor
let rodando = false;
for (let i = 0; i < 240; i++) {
  await espera(1000);
  rodando = await avaliar(`window.__fotoRodando === true`);
  if (rodando) break;
  if (i % 20 === 0) {
    console.log(
      `  t=${i}s ${await avaliar("document.getElementById('load-fase')?.textContent ?? '…'")}`,
    );
  }
}
if (!rodando) {
  console.log("✗ o cliente não liberou a câmera (__fotoRodando) em 240 s");
  ws.close();
  chrome.kill("SIGKILL");
  process.exit(1);
}
await avaliar(limparHud);

// GUARDA de enquadramento: cada foto vira uma face INTERNA do cubo do menu, e
// do centro do cubo a face ocupa exatamente 90°×90°. Com fov≠90 ou aspect≠1 a
// foto cobre um pedaço errado do mundo e sai esticada na face, com um vão em
// cada aresta (o horizonte "pula" ao cruzar a quina). Falhar aqui é mais barato
// que descobrir depois de 6 prints.
const cam = await avaliar(`(window.__fotoCam ? window.__fotoCam() : null)`);
if (!cam || Math.abs(cam.fov - 90) > 0.01 || Math.abs(cam.aspect - 1) > 0.001) {
  console.log(
    `✗ enquadramento errado: fov=${cam?.fov ?? "?"} aspect=${cam?.aspect ?? "?"} — precisa fov=90 e aspect=1 (janela ${L}×${A})`,
  );
  ws.close();
  chrome.kill("SIGKILL");
  process.exit(1);
}
console.log(`  fov=${cam.fov} aspect=${cam.aspect} ✓ (90°×90° por face)`);

// espera o mesher esvaziar a fila (raio 12 são MUITAS colunas; dá tempo de ver
// o horizonte inteiro, não só o corte ao lado do jogador)
await espera(12_000);
console.log("câmera liberada; mundo estabilizando…");

/**
 * Direções das 6 faces do cubo (BoxGeometry order: +x, -x, +y, -y, +z, -z).
 * A câmera FPS (rotation yxz, main.ts) olha pra:
 *   yaw=0 → -z · yaw=π → +z · yaw=-π/2 → +x · yaw=π/2 → -x
 *   pitch=+90° → +y (cima) · pitch=-90° → -y (baixo)
 * Pitch de teto/chão é π/2 EXATO: o limite de π/2-0.01 do input.ts só é aplicado
 * nos handlers de mouse/toque, e `__fotoApontar` escreve direto em input.pitch —
 * no headless não há mouse pra reclampar. Aproximar (0,01 rad ≈ 0,57°) deixaria
 * a face ±y torta contra as 4 laterais.
 */
const FACES = [
  ["-z", 0, 0, "face frontal (norte)"],
  ["+z", Math.PI, 0, "face oposta (sul)"],
  ["+x", -Math.PI / 2, 0, "face direita (leste)"],
  ["-x", Math.PI / 2, 0, "face esquerda (oeste)"],
  ["+y", 0, Math.PI / 2, "teto (para cima)"],
  ["-y", 0, -Math.PI / 2, "chão (para baixo)"],
];

async function tirar(nome, yaw, pitch, legenda) {
  await avaliar(`window.__fotoApontar && window.__fotoApontar(${yaw}, ${pitch}); true`);
  // deixa o frame novo (streaming + céu/sol) pintar antes do print
  await espera(2500);
  const r = await cdp("Page.captureScreenshot", { format: "png" });
  const b64 = r.result?.data;
  if (!b64) {
    console.log(`  ✗ ${nome}: sem imagem`);
    return;
  }
  writeFileSync(join(SAIDA, `${nome}.png`), Buffer.from(b64, "base64"));
  const kb = (Buffer.byteLength(b64, "base64") / 1024).toFixed(0);
  console.log(`  ✓ ${nome.padEnd(6)} ${legenda.padEnd(20)} (${kb} KB)`);
}

for (const [nome, yaw, pitch, legenda] of FACES) {
  await tirar(nome, yaw, pitch, legenda);
}

ws.close();
chrome.kill("SIGKILL");
console.log("pronto ✓");