#!/usr/bin/env node
/**
 * Roda o modo `?bench` do cliente num Chrome HEADLESS e imprime o resumo do
 * perfil — sem abrir navegador, sem clicar em nada.
 *
 * Por que existe: o `?bench` foi feito pra ser aberto no PC do laboratório, mas
 * quem MEXE nele (o dev) precisa saber se continua funcionando depois de cada
 * mudança no cliente. Screenshot não serve: o que interessa é o JSON. Este
 * script sobe o Chrome com porta de depuração (CDP puro, sem puppeteer como
 * dependência), navega, espera `window.__benchPerfil` e imprime.
 *
 * ⚠️ Os NÚMEROS daqui não valem como medida de desempenho: headless em WSL cai
 * no SwiftShader (render por software, ~15 FPS) e a extensão de tempo de GPU
 * nem existe. Isto é teste de ENCANAMENTO — o perfil saiu, com os campos certos.
 * Medida de verdade é o arquivo que o `?bench` baixa numa máquina real.
 *
 * Uso:
 *   npm run dev                       # em outro terminal (vite, porta 5173)
 *   node scripts/bench-headless.mjs   # ou: ... "http://localhost:5173/?bench=15&tamanho=P"
 *   CHROME=/caminho/do/chrome node scripts/bench-headless.mjs
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const URL_ALVO = process.argv[2] ?? "http://localhost:5173/?bench=15";
const PORTA = 9333;
const TETO_S = 240; // carga + trajeto no SwiftShader passa fácil de 1 min

/** Acha um Chrome: $CHROME, o do puppeteer (cache do usuário) ou o do sistema. */
function acharChrome() {
  if (process.env["CHROME"]) return process.env["CHROME"];
  const cache = join(homedir(), ".cache/puppeteer/chrome");
  if (existsSync(cache)) {
    // versão mais nova primeiro (nomes tipo linux-150.0.7871.115)
    for (const v of readdirSync(cache).sort().reverse()) {
      const bin = join(cache, v, "chrome-linux64/chrome");
      if (existsSync(bin)) return bin;
    }
  }
  for (const p of ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]) {
    if (existsSync(p)) return p;
  }
  throw new Error("Chrome não encontrado — passe o caminho em CHROME=…");
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const chrome = spawn(
  acharChrome(),
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--enable-unsafe-swiftshader",
    // 800×450: a 1280×720 o SwiftShader devolve tela cinza em ~40% das rodadas
    "--window-size=800,450",
    `--remote-debugging-port=${PORTA}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-bench-"))}`,
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
      /* chrome ainda subindo */
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
    console.log(`✗ exceção na página: ${m.params.exceptionDetails.exception?.description ?? "?"}`);
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
await cdp("Page.navigate", { url: URL_ALVO });
console.log(`▶ ${URL_ALVO}`);

let perfil = null;
for (let i = 0; i < TETO_S && !perfil; i++) {
  await espera(1000);
  const bruto = await avaliar("JSON.stringify(window.__benchPerfil ?? null)");
  if (bruto && bruto !== "null") perfil = JSON.parse(bruto);
  else if (i % 10 === 0) {
    console.log(`  t=${i}s ${await avaliar("document.getElementById('load-fase')?.textContent ?? 'em jogo'")}`);
  }
}

if (perfil) {
  const g = perfil.gravacao ?? {};
  const linha = (k, v) => console.log(`  ${k.padEnd(14)} ${v}`);
  console.log("\n=== perfil do bench ===");
  linha("trajeto", JSON.stringify(perfil.meta?.bench?.trajeto));
  linha("config", JSON.stringify(perfil.config));
  linha("gravação", `${g.duracaoS}s · ${g.frames} frames · ${g.fpsMedio} fps`);
  linha("movimento", JSON.stringify(g.movimento));
  linha("frametime", JSON.stringify(g.frametimeMs));
  linha("histograma", (g.histogramaMs ?? []).map((f) => `${f.faixa} ${f.pct}%`).join(" · "));
  linha("gpu", JSON.stringify(g.gpu));
  linha("carga", JSON.stringify(perfil.carga));
  // geometria REALMENTE montada: sem isto o teste passa com o mundo vazio
  // (foi o risco de mover o mesher pro Worker — a tela de carga sai quando a
  // fila zera, e uma fila que zera sem produzir mesh não aparece no frametime)
  linha("geometria", `${perfil.drawCalls} draw calls · ${perfil.triangles} triângulos · ${perfil.video?.geometrias} geometrias`);
  linha("remesh", `${perfil.remeshCount}× · main ${perfil.remeshTotalMs}ms · worker ${perfil.remeshWorkerMs ?? 0}ms · fila no fim ${perfil.stream?.fila}`);
  // etiqueta do experimento: sem ela um A/B de ?meshdepth sai sem dizer qual é qual
  linha("mesher", perfil.mesher ? `${perfil.mesher.workers} workers · profundidade ${perfil.mesher.profundidadeJogo} (jogo) / ${perfil.mesher.profundidadeCarga} (carga)` : "síncrono (sem worker)");
  linha("regras", JSON.stringify(perfil.regrasServidor));
  linha("marcadores", (perfil.marcadores ?? []).map((m) => `${m.emS}s ${m.evento}`).join(" · "));
  linha("dispositivo", JSON.stringify(perfil.dispositivo));
} else {
  console.log(`✗ o bench não exportou perfil em ${TETO_S}s`);
}

ws.close();
chrome.kill("SIGKILL");
process.exit(perfil ? 0 : 1);
