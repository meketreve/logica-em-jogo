#!/usr/bin/env node
/**
 * §📊 A BATERIA DE GPU do laboratório (2026-10-27): `npm run bench:lab`.
 *
 * Mede, NA MÁQUINA QUE DÓI, quanto pesa cada suspeita de custo de GPU que a
 * leitura do código levantou — e só a máquina do lab responde isso: o headless
 * daqui renderiza em CPU (SwiftShader) e nem tem o relógio de GPU.
 *
 * Cada VARIANTE é o mesmo `?bench` (seed, trajeto e config fixos — ver
 * `client/src/bench.ts`) com UMA coisa desligada:
 *   base         o jogo como o aluno joga (antialias DESLIGADO desde 27/10)
 *   comaa        COM antialias (MSAA) — o custo de ligá-lo em Configurações
 *   semdescarte  terreno sem o `alphaTest` das folhas (folha vira quadrado:
 *                é o TETO do que o descarte custa)
 *   aguaparada   a água não reenvia o atlas à GPU
 *   semvida      sem nuvens e sem balanço do vento (o A/B antigo do §🌬️)
 *   tudo         sem descarte e com a água parada (o piso do que dá pra tirar)
 *
 * Como se lê o resultado: o número que importa é o TEMPO DE GPU (média e p95),
 * não o FPS — com VSYNC o FPS gruda em 60 e esconde a folga. As variantes
 * rodam INTERCALADAS em várias rodadas (base, comaa, … de novo) pra que o
 * aquecimento da máquina não caia todo numa variante só, e a 1ª corrida é
 * descartada (shader compilando, cache frio). O RUÍDO é a diferença entre as
 * rodadas da própria `base`: ganho menor que o dobro dele não se distingue.
 *
 * Uso (na pasta do jogo, com o launcher FECHADO — ele disputa a GPU):
 *   npm run bench:lab                     # 3 rodadas de 30 s (~20 min)
 *   npm run bench:lab -- --rodadas 2      # mais rápido, menos confiável
 *   npm run bench:lab -- --so base,comaa  # só algumas variantes
 *   CHROME="C:\\caminho\\chrome.exe" npm run bench:lab
 *
 * Durante a bateria: NÃO mexer no PC (a janela do Chrome tem de ficar na
 * frente e à vista — minimizada, o navegador reduz o ritmo e a medida mente).
 * No fim: o arquivo em `registros/bench-lab/` é o que volta pra análise.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { hostname, platform, tmpdir } from "node:os";
import { connect } from "node:net";
import { join } from "node:path";

const VARIANTES = {
  base: "",
  comaa: "&comaa",
  semdescarte: "&semdescarte",
  aguaparada: "&aguaparada",
  semvida: "&semvida",
  tudo: "&semdescarte&aguaparada",
};

// --- argumentos ---
const args = process.argv.slice(2);
const arg = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : padrao;
};
const RODADAS = Math.max(1, Number(arg("rodadas", "3")) || 3);
const DURACAO_S = Math.max(10, Number(arg("duracao", "30")) || 30);
const ESCOLHIDAS = arg("so", Object.keys(VARIANTES).join(","))
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);
for (const v of ESCOLHIDAS) {
  if (!(v in VARIANTES)) {
    console.error(`variante desconhecida: "${v}" (existem: ${Object.keys(VARIANTES).join(", ")})`);
    process.exit(2);
  }
}
if (!ESCOLHIDAS.includes("base")) ESCOLHIDAS.unshift("base"); // sem base não há comparação

const PORTA_WS = 8139;
const PORTA_CDP = 9389;
const MUNDO = "mundos/_bench-lab";
const WINDOWS = platform() === "win32";
const TETO_POR_CORRIDA_S = DURACAO_S + 240; // carga do mundo E num PC fraco
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const diga = (t) => process.stdout.write(`${t}\n`);

function acharChrome() {
  if (process.env["CHROME"]) return process.env["CHROME"];
  const candidatos = WINDOWS
    ? [
        join(process.env["PROGRAMFILES"] ?? "C:\\Program Files", "Google\\Chrome\\Application\\chrome.exe"),
        join(process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)", "Google\\Chrome\\Application\\chrome.exe"),
        join(process.env["LOCALAPPDATA"] ?? "", "Google\\Chrome\\Application\\chrome.exe"),
        // o Edge é Chromium: serve se o lab não tiver Chrome (o resultado diz qual foi)
        join(process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)", "Microsoft\\Edge\\Application\\msedge.exe"),
        join(process.env["PROGRAMFILES"] ?? "C:\\Program Files", "Microsoft\\Edge\\Application\\msedge.exe"),
      ]
    : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"];
  for (const p of candidatos) if (p && existsSync(p)) return p;
  throw new Error("Chrome não encontrado — passe o caminho em CHROME=…");
}

/** Mata o processo E os filhos (Chrome tem gpu/renderer; o host tem o tsx). */
function matar(proc) {
  if (!proc?.pid) return;
  try {
    if (WINDOWS) spawnSync("taskkill", ["/pid", String(proc.pid), "/T", "/F"], { stdio: "ignore" });
    else process.kill(-proc.pid, "SIGKILL");
  } catch {
    /* já morreu */
  }
}

let servidor = null;
let chrome = null;
const PERFIL_CHROME = mkdtempSync(join(tmpdir(), "lj-bench-lab-"));
function limpar() {
  matar(chrome);
  matar(servidor);
  rmSync(PERFIL_CHROME, { recursive: true, force: true });
  rmSync(join(process.cwd(), MUNDO), { recursive: true, force: true });
  rmSync(join(process.cwd(), `${MUNDO}.ljw`), { force: true });
}
for (const sinal of ["SIGINT", "SIGTERM"]) {
  process.on(sinal, () => {
    diga("\ninterrompido — fechando o Chrome e o servidor da bateria");
    limpar();
    process.exit(130);
  });
}

async function esperaPorta(porta) {
  for (let i = 0; i < 240; i++) {
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

// --- host próprio: só SERVE o cliente (o `?bench` joga em singleplayer) ---
if (!existsSync(join(process.cwd(), "client/dist/index.html"))) {
  console.error("client/dist não existe — rode na pasta do jogo (a do launcher)");
  process.exit(1);
}
rmSync(join(process.cwd(), MUNDO), { recursive: true, force: true });
// `node --import tsx`, igual ao launcher: sem `npx`, que no Windows pede shell
servidor = spawn(process.execPath, ["--import", "tsx", "server/src/index.ts"], {
  env: {
    ...process.env,
    LJ_PORT: String(PORTA_WS),
    LJ_SAVE: `${MUNDO}.ljw`,
    LJ_NOVO: "1",
    LJ_TAMANHO: "P",
    LJ_CODIGO: "bench2026",
  },
  detached: !WINDOWS,
  stdio: ["ignore", "ignore", "pipe"],
});
servidor.stderr?.on("data", (d) => {
  if (/Error|error/.test(String(d))) process.stderr.write(`[servidor] ${d}`);
});
if (!(await esperaPorta(PORTA_WS))) {
  console.error(`o servidor da bateria não subiu na porta ${PORTA_WS}`);
  limpar();
  process.exit(1);
}

// --- Chrome DE VERDADE: com janela e com a GPU (headless mediria a CPU) ---
const CHROME_BIN = acharChrome();
chrome = spawn(
  CHROME_BIN,
  [
    `--remote-debugging-port=${PORTA_CDP}`,
    `--user-data-dir=${PERFIL_CHROME}`,
    "--no-first-run",
    "--no-default-browser-check",
    // `--headless` é só pro DEV testar o encanamento daqui: mede a CPU, não serve de número
    ...(args.includes("--headless")
      ? ["--headless=new", "--enable-unsafe-swiftshader", "--window-size=800,450"]
      : ["--start-maximized"]),
    // o relógio de GPU (EXT_disjoint_timer_query_webgl2): em alguns drivers o
    // Chrome só o expõe com as extensões de rascunho ligadas
    "--enable-webgl-draft-extensions",
    // janela fora de foco não pode ser freada no meio da medida
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "about:blank",
  ],
  { detached: !WINDOWS, stdio: "ignore" },
);

async function abrirAba() {
  for (let i = 0; i < 80; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PORTA_CDP}/json/list`)).json();
      const aba = lista.find((t) => t.type === "page");
      if (aba) return aba;
    } catch {
      /* subindo */
    }
    await espera(250);
  }
  throw new Error("o Chrome não abriu a porta de depuração");
}
const aba = await abrirAba();
const ws = new WebSocket(aba.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let idCdp = 0;
const pendentes = new Map();
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pendentes.has(m.id)) {
    pendentes.get(m.id)(m);
    pendentes.delete(m.id);
  }
});
const cdp = (method, params = {}) =>
  new Promise((r) => {
    const meu = ++idCdp;
    pendentes.set(meu, r);
    ws.send(JSON.stringify({ id: meu, method, params }));
  });
const avaliar = async (expr) =>
  (await cdp("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;
await cdp("Page.enable");

/** Uma corrida: navega, espera o perfil, devolve o essencial (ou null). */
async function correr(variante) {
  const url = `http://localhost:${PORTA_WS}/?bench=${DURACAO_S}${VARIANTES[variante]}`;
  await cdp("Page.navigate", { url });
  await cdp("Page.bringToFront");
  for (let s = 0; s < TETO_POR_CORRIDA_S; s++) {
    await espera(1000);
    const bruto = await avaliar("JSON.stringify(window.__benchPerfil ?? null)");
    if (bruto && bruto !== "null") {
      const p = JSON.parse(bruto);
      const g = p.gravacao ?? {};
      // prova de que a chave PEGOU: o antialias se lê do próprio contexto WebGL
      const antialias = await avaliar(
        "(() => { const c = document.querySelector('canvas'); const gl = c && (c.getContext('webgl2') || c.getContext('webgl')); return gl ? gl.getContextAttributes().antialias : null; })()",
      );
      return {
        variante,
        antialias,
        experimentos: p.meta?.bench?.experimentos ?? [],
        semVida: p.meta?.bench?.semVida ?? false,
        gpuMedioMs: g.gpu?.medioMs ?? null,
        gpuP95Ms: g.gpu?.p95Ms ?? null,
        frameP50Ms: g.frametimeMs?.p50 ?? null,
        frameP95Ms: g.frametimeMs?.p95 ?? null,
        fps: g.fpsMedio ?? null,
        framesLentos50ms: g.framesLentos50ms ?? null,
        drawCalls: p.drawCalls ?? null,
        triangulos: p.triangles ?? null,
        viewport: p.meta?.bench?.viewport ?? null,
        dispositivo: p.dispositivo ?? null,
      };
    }
  }
  return null;
}

// --- a bateria ---
const total = RODADAS * ESCOLHIDAS.length + 1;
diga(`▶ bateria de GPU: ${ESCOLHIDAS.join(", ")} · ${RODADAS} rodada(s) de ${DURACAO_S} s · ${total} corridas`);
diga(`  navegador: ${CHROME_BIN}`);
diga("  NÃO mexa no PC até o fim — a janela do Chrome tem de ficar na frente.\n");
const corridas = [];
let n = 0;
const marcar = (r, v) => {
  n++;
  const gpu = r?.gpuMedioMs == null ? "GPU n/d" : `GPU ${r.gpuMedioMs.toFixed(2)} ms (p95 ${r.gpuP95Ms.toFixed(2)})`;
  diga(`  [${String(n).padStart(2)}/${total}] ${v.padEnd(12)} ${r ? `${gpu} · quadro p95 ${r.frameP95Ms} ms · ${r.fps} fps` : "✗ não exportou perfil"}`);
};
// aquecimento: shader compilando e cache frio — vai pro lixo
const aquece = await correr("base");
marcar(aquece, "(aquecimento)");
for (let r = 0; r < RODADAS; r++) {
  // ordem GIRADA a cada rodada: nenhuma variante fica sempre no fim (máquina quente)
  const ordem = ESCOLHIDAS.map((_, i) => ESCOLHIDAS[(i + r) % ESCOLHIDAS.length]);
  for (const v of ordem) {
    const res = await correr(v);
    marcar(res, v);
    if (res) corridas.push({ rodada: r + 1, ...res });
  }
}
ws.close();

// --- resumo ---
const mediana = (xs) => {
  const s = xs.filter((x) => typeof x === "number").sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const temGpu = corridas.some((c) => c.gpuMedioMs != null);
const chave = temGpu ? "gpuMedioMs" : "frameP95Ms";
const por = (v, k) => mediana(corridas.filter((c) => c.variante === v).map((c) => c[k]));
const base = por("base", chave);
const daBase = corridas.filter((c) => c.variante === "base").map((c) => c[chave]).filter((x) => x != null);
const ruidoPct = base && daBase.length > 1 ? ((Math.max(...daBase) - Math.min(...daBase)) / base) * 100 : null;
const linhas = [];
const L = (t = "") => linhas.push(t);
L(`Bateria de GPU — ${new Date().toLocaleString("pt-BR")} — ${hostname()}`);
L(`navegador: ${CHROME_BIN}`);
L(`${RODADAS} rodada(s) × ${DURACAO_S} s · viewport ${corridas[0]?.viewport ?? "?"}`);
L(`dispositivo: ${JSON.stringify(corridas[0]?.dispositivo ?? null)}`);
L();
L(`variante      GPU média  GPU p95   quadro p95  fps   vs base`);
for (const v of ESCOLHIDAS) {
  const g = por(v, "gpuMedioMs");
  const g95 = por(v, "gpuP95Ms");
  const f95 = por(v, "frameP95Ms");
  const fps = por(v, "fps");
  const x = por(v, chave);
  const delta = v === "base" || x == null || !base ? "" : `${(((x - base) / base) * 100).toFixed(1)}%`;
  const num = (y, d = 2) => (y == null ? "n/d" : y.toFixed(d));
  L(`${v.padEnd(13)} ${num(g).padStart(8)}  ${num(g95).padStart(8)}  ${num(f95).padStart(9)}  ${num(fps, 0).padStart(4)}   ${delta}`);
}
L();
if (!temGpu) {
  L("⚠ SEM relógio de GPU neste navegador: a comparação usou o p95 do QUADRO, que com VSYNC");
  L("  gruda em 16,7 ms e esconde folga. Diferença só aparece se a máquina já perde quadro.");
}
L(`ruído (dispersão da base entre rodadas): ${ruidoPct == null ? "n/d (precisa de 2+ rodadas)" : `${ruidoPct.toFixed(1)}%`}`);
L();
L("VEREDITO (métrica: " + (temGpu ? "tempo médio de GPU" : "p95 do quadro") + "):");
for (const v of ESCOLHIDAS) {
  if (v === "base") continue;
  const x = por(v, chave);
  if (x == null || !base) {
    L(`  ${v.padEnd(12)} sem dado`);
    continue;
  }
  const ganho = ((base - x) / base) * 100;
  const limiar = Math.max(2, (ruidoPct ?? 2) * 2);
  L(
    `  ${v.padEnd(12)} ${ganho >= 0 ? "economiza" : "custa"} ${Math.abs(ganho).toFixed(1)}% — ${
      Math.abs(ganho) >= limiar ? "PESA (acima do ruído)" : "não se distingue do ruído"
    }`,
  );
}
const texto = linhas.join("\n");

const pasta = join(process.cwd(), "registros", "bench-lab");
mkdirSync(pasta, { recursive: true });
// hora LOCAL (a da escola), não UTC: é por ela que se acha o arquivo depois
const agora = new Date();
const dois = (x) => String(x).padStart(2, "0");
const carimbo = `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}-${dois(agora.getHours())}${dois(agora.getMinutes())}`;
const nome = `${carimbo}-${hostname().replace(/[^\w-]/g, "_")}`;
writeFileSync(join(pasta, `${nome}.json`), JSON.stringify({ rodadas: RODADAS, duracaoS: DURACAO_S, navegador: CHROME_BIN, corridas }, null, 2));
writeFileSync(join(pasta, `${nome}.txt`), `${texto}\n`);
limpar();
diga(`\n${texto}`);
diga(`\n✓ resultado em registros/bench-lab/${nome}.txt (e .json) — é esse arquivo que volta pra análise`);
process.exit(corridas.length ? 0 : 1);
