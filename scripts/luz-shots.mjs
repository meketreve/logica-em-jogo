#!/usr/bin/env node
/**
 * §💡 Verificação da LUZ VOXEL num Chrome headless (2026-07-28).
 *
 * Luz não tem teste unitário do lado da GPU: o motor (`shared/src/luz.ts`) tem
 * 22 testes, mas o enxerto de shader (`onBeforeCompile`) ou compila ou não, e o
 * jeito de saber é olhar o pixel. Duas maneiras de quebrar, as duas silenciosas:
 *
 * 1. **shader não compila** — o three cai pro programa de erro e o mundo some ou
 *    fica preto. O console cospe "THREE.WebGLProgram: Shader Error", e nada mais.
 * 2. **shader compila e não faz nada** — atributo com nome errado, uniform que
 *    ninguém escreve. A tela fica IDÊNTICA à de antes da fase, e passar o olho
 *    num print não distingue isso de "funcionou".
 *
 * Então a pergunta aqui é binária e comparativa: a MESMA cena, no MESMO trajeto
 * determinístico do `?bench`, ao meio-dia e à meia-noite. Mede-se a luminância
 * média do quadro. Meio-dia tem de ser claro, meia-noite tem de ser
 * mensuravelmente mais escuro, e nenhum dos dois pode ser preto (isso seria o
 * defeito 1 se disfarçando de noite).
 *
 * ⚠️ Headless em WSL cai no SwiftShader. Isso NÃO invalida a medição: cor de
 * fragmento é a mesma no render por software; o que não vale é tempo.
 *
 * Uso:
 *   npm run dev              # em outro terminal (vite, porta 5173)
 *   node scripts/luz-shots.mjs
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Decodificador PNG mínimo (8 bits, RGB ou RGBA, sem entrelace) — que é o que o
 * `Page.captureScreenshot` devolve.
 *
 * Por que não ler o canvas pela página: `drawImage(canvasWebGL, …)` fora do
 * frame devolve PRETO, porque o three usa `preserveDrawingBuffer: false` e o
 * buffer é invalidado depois de compor. A primeira versão desta verificação caiu
 * exatamente nisso — mediu 0,0 nas duas horas e "provou" que a noite escurece,
 * enquanto o print ao lado mostrava o mundo iluminado. O print do CDP é composto
 * pelo navegador e não tem esse problema; o preço é decodificá-lo aqui.
 */
function decodificarPng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("não é PNG");
  let pos = 8;
  let larg = 0, alt = 0, prof = 0, tipo = 0;
  const idat = [];
  while (pos < buf.length) {
    const tam = buf.readUInt32BE(pos);
    const nome = buf.toString("ascii", pos + 4, pos + 8);
    const dados = buf.subarray(pos + 8, pos + 8 + tam);
    if (nome === "IHDR") {
      larg = dados.readUInt32BE(0);
      alt = dados.readUInt32BE(4);
      prof = dados[8];
      tipo = dados[9];
      if (prof !== 8 || (tipo !== 2 && tipo !== 6) || dados[12] !== 0) {
        throw new Error(`PNG inesperado: prof ${prof}, tipo ${tipo}, entrelace ${dados[12]}`);
      }
    } else if (nome === "IDAT") idat.push(dados);
    else if (nome === "IEND") break;
    pos += 12 + tam;
  }
  const canais = tipo === 6 ? 4 : 3;
  const bruto = inflateSync(Buffer.concat(idat));
  const linha = larg * canais;
  const out = Buffer.alloc(alt * linha);
  let src = 0;
  for (let y = 0; y < alt; y++) {
    const filtro = bruto[src++];
    const dst = y * linha;
    const ant = dst - linha;
    for (let i = 0; i < linha; i++) {
      const x = bruto[src + i];
      const a = i >= canais ? out[dst + i - canais] : 0;
      const b = y > 0 ? out[ant + i] : 0;
      const c = i >= canais && y > 0 ? out[ant + i - canais] : 0;
      let v;
      switch (filtro) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + b; break;
        case 3: v = x + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: throw new Error(`filtro PNG ${filtro} desconhecido`);
      }
      out[dst + i] = v & 0xff;
    }
    src += linha;
  }
  return { larg, alt, canais, pixels: out };
}

/**
 * Luminância média e pico numa JANELA do quadro, em frações da tela.
 *
 * A janela existe porque o F3 fica aberto no `?bench`: texto branco e verde é
 * IDÊNTICO nas duas horas e só dilui a diferença que se quer medir. A faixa
 * escolhida (direita, meia altura) é terreno nas duas cenas, e fica fora tanto
 * das linhas do F3 quanto da hotbar.
 */
function medir(img, x0f, y0f, x1f, y1f) {
  const x0 = Math.floor(img.larg * x0f), x1 = Math.floor(img.larg * x1f);
  const y0 = Math.floor(img.alt * y0f), y1 = Math.floor(img.alt * y1f);
  let soma = 0, max = 0, n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * img.larg + x) * img.canais;
      const l = 0.2126 * img.pixels[i] + 0.7152 * img.pixels[i + 1] + 0.0722 * img.pixels[i + 2];
      soma += l;
      if (l > max) max = l;
      n++;
    }
  }
  return { media: soma / (n || 1), max };
}

const BASE = process.argv[2] ?? "http://localhost:5173";
const PORTA = 9334;
const SAIDA = ".wolf/designqc-captures/luz";
/** Horas comparadas. O `?hora` congela o céu (o sync de rede é ignorado). */
const CENAS = [
  { nome: "meio-dia", hora: 12 },
  { nome: "meia-noite", hora: 0 },
];
const TETO_S = 180;

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
    "--window-size=800,450",
    `--remote-debugging-port=${PORTA}`,
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-luz-"))}`,
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
/** Erros de shader e exceções — o defeito 1 aparece AQUI antes de aparecer no pixel. */
const problemas = [];
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pendentes.has(m.id)) {
    pendentes.get(m.id)(m);
    pendentes.delete(m.id);
    return;
  }
  if (m.method === "Runtime.exceptionThrown") {
    problemas.push(`exceção: ${m.params.exceptionDetails.exception?.description ?? "?"}`);
  } else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") {
    const txt = (m.params.args ?? []).map((a) => a.value ?? a.description ?? "").join(" ");
    if (txt) problemas.push(`console.error: ${txt.slice(0, 400)}`);
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
mkdirSync(SAIDA, { recursive: true });

/** Janela de terreno: metade direita, meia altura. Ver `medir()`. */
const JANELA = [0.68, 0.32, 1.0, 0.62];

const medidas = [];
for (const cena of CENAS) {
  // `?bench` = mundo de seed fixa + trajeto em função do tempo: as duas horas
  // veem EXATAMENTE a mesma geometria no mesmo instante. Sem isso a comparação
  // não valeria (mundo diferente = luminância diferente por outro motivo).
  const url = `${BASE}/?bench=60&hora=${cena.hora}`;
  await cdp("Page.navigate", { url });
  console.log(`▶ ${cena.nome} — ${url}`);

  let pronto = false;
  for (let i = 0; i < TETO_S && !pronto; i++) {
    await espera(1000);
    pronto = (await avaliar("!!window.__benchRodando")) === true;
    if (!pronto && i % 15 === 0) {
      console.log(`  t=${i}s ${await avaliar("document.getElementById('load-fase')?.textContent ?? '…'")}`);
    }
  }
  if (!pronto) {
    console.log(`✗ ${cena.nome}: o bench não começou em ${TETO_S}s`);
    continue;
  }
  await espera(4000); // deixa o trajeto sair do ponto inicial e o mesh assentar

  const shot = await cdp("Page.captureScreenshot", { format: "png" });
  const png = Buffer.from(shot.result.data, "base64");
  const arq = join(SAIDA, `luz-${cena.hora}h.png`);
  writeFileSync(arq, png);
  const m = medir(decodificarPng(png), ...JANELA);
  medidas.push({ ...cena, ...m, arq });
  console.log(`  luminância média ${m.media.toFixed(1)} · pico ${m.max.toFixed(0)} → ${arq}`);
}

console.log("\n=== §💡 verificação da luz ===");
let falhas = 0;
const checar = (ok, texto) => {
  console.log(`  ${ok ? "✓" : "✗"} ${texto}`);
  if (!ok) falhas++;
};

const dia = medidas.find((m) => m.hora === 12);
const noite = medidas.find((m) => m.hora === 0);

checar(problemas.length === 0, `sem erro de shader/exceção no console${problemas.length ? ` — ${problemas[0]}` : ""}`);
if (dia && noite) {
  // 12 de 255 = tela praticamente preta. Se o DIA cair aqui, o shader quebrou e
  // "escureceu tudo" — que é o defeito 1 se passando pelo efeito desejado.
  checar(dia.media > 12, `meio-dia tem imagem (média ${dia.media.toFixed(1)} > 12)`);
  checar(dia.max > 60, `meio-dia tem terreno iluminado (pico ${dia.max.toFixed(0)} > 60)`);
  checar(noite.media > 1, `meia-noite não é preto absoluto (média ${noite.media.toFixed(1)} > 1)`);
  const razao = noite.media / (dia.media || 1);
  checar(razao < 0.75, `a noite escurece de verdade (noite/dia = ${razao.toFixed(2)} < 0,75)`);
} else {
  checar(false, "as duas cenas foram capturadas");
}
for (const p of problemas.slice(0, 5)) console.log(`    ⚠ ${p}`);

ws.close();
chrome.kill();
console.log(falhas === 0 ? "\n✓ luz verde" : `\n✗ ${falhas} verificação(ões) falharam`);
process.exit(falhas === 0 ? 0 : 1);
