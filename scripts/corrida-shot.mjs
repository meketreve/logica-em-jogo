#!/usr/bin/env node
/**
 * Print da PISTA (§🏁 `aula7-corrida.ljw`) — a única conferência que o
 * verificador não faz: se a pista é LEGÍVEL. O verificador prova que dá pra
 * completar; só o olho diz se o aluno entende pra onde correr.
 *
 * Entra no servidor como professora (que voa), sobe com `/tp` e fotografa a
 * pista de cima, depois desce pra largada e fotografa na altura do olho.
 *
 * ⚠️ PRECISA do Chrome do puppeteer (ver shots:craft).
 *
 * Uso:
 *   LJ_SAVE=cenarios/aula7-corrida.ljw LJ_PORT=8090 npm run start -w server
 *   npm run shots:corrida
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const L = Number(process.argv[2] ?? 1280);
const A = Number(process.argv[3] ?? 720);
const PORTA_JOGO = process.env["LJ_PORT"] ?? "8090";
const BASE = process.env["BASE"] ?? `http://localhost:${PORTA_JOGO}`;
const CODIGO = process.env["LJ_CODIGO"] ?? "prof2026";
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "corrida");
const PORTA = 9357;
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
  throw new Error("Chrome não encontrado — `npx -y @puppeteer/browsers install chrome@stable` ou CHROME=…");
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const chrome = spawn(acharChrome(), [
  "--headless=new", "--no-sandbox", "--disable-gpu", "--enable-unsafe-swiftshader",
  `--window-size=${L},${A}`, `--remote-debugging-port=${PORTA}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-corrida-"))}`, "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });

async function abrirAba() {
  for (let i = 0; i < 40; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json();
      const aba = lista.find((t) => t.type === "page");
      if (aba) return aba;
    } catch { /* subindo */ }
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
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  else if (m.method === "Runtime.exceptionThrown")
    excecoes.push(m.params.exceptionDetails.exception?.description ?? "?");
});
const cdp = (method, params = {}) =>
  new Promise((r) => { const meu = ++id; pend.set(meu, r); ws.send(JSON.stringify({ id: meu, method, params })); });
const avaliar = async (expr) =>
  (await cdp("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;
async function fotografar(nome) {
  const r = await cdp("Page.captureScreenshot", { format: "png" });
  if (!r.result?.data) return;
  const buf = Buffer.from(r.result.data, "base64");
  writeFileSync(join(SAIDA, nome), buf);
  console.log(`  ✓ ${nome} (${(buf.length / 1024).toFixed(0)} KB) em ${SAIDA}`);
}
/** Manda uma linha de chat como se o professor tivesse digitado. */
const dizer = (texto) => avaliar(`(() => {
  const i = document.getElementById('chat-input');
  if (!i) return false;
  i.style.display = '';
  i.value = ${JSON.stringify(texto)};
  i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  return true;
})()`);

await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Emulation.setDeviceMetricsOverride", { width: L, height: A, deviceScaleFactor: 1, mobile: false });

// sem `?hud`: o F3 cobre metade do quadro, e o que se quer ver aqui é a PISTA
await cdp("Page.navigate", { url: `${BASE}/` });
await espera(2500);
// entra como PROFESSORA (o código libera o voo, e é de cima que a pista se lê)
await avaliar(`
  document.getElementById('menu-nome').value = 'profa';
  document.getElementById('menu-pin').value = '1234';
  document.getElementById('menu-codigo').value = ${JSON.stringify(CODIGO)};
  document.getElementById('menu-btn-multi')?.click();
`);
await espera(600);
await avaliar(`
  const e = document.getElementById('menu-endereco');
  if (e) e.value = ${JSON.stringify(`ws://localhost:${PORTA_JOGO}`)};
  document.getElementById('menu-btn-conectar')?.click();
`);
for (let i = 0; i < 120; i++) {
  await espera(1000);
  if (await avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`)) break;
}
// clique DE VERDADE (o `.click()` sintético não conta como gesto do usuário e
// o menu de pausa fica por cima da cena inteira)
async function clicarNoBotao(idBotao) {
  const r = await avaliar(`(() => {
    const b = document.getElementById(${JSON.stringify(idBotao)});
    if (!b) return null;
    const c = b.getBoundingClientRect();
    return JSON.stringify({ x: c.x + c.width / 2, y: c.y + c.height / 2 });
  })()`);
  if (!r) return false;
  const { x, y } = JSON.parse(r);
  for (const type of ["mousePressed", "mouseReleased"]) {
    await cdp("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 });
  }
  return true;
}
await clicarNoBotao("overlay-voltar");
await espera(1500);

const objetivo = await avaliar(`document.querySelector('#objetivos')?.textContent?.trim()`);
console.log(`objetivo no HUD: ${objetivo ? objetivo.slice(0, 110) : "(nada)"}`);

// ⚠️ o chat mostra `nome#id` (a etiqueta de autor); o `/tp` quer só o NOME.
const eu = await avaliar(`document.body.textContent?.match(/Bem-vindo, ([^!#]+)/)?.[1]`);
console.log(`entrei como: ${eu ?? "(?)"}`);

/**
 * ⚠️ **Não há como apontar a câmera daqui.** O pitch/yaw vêm do mouse, e o
 * headless não tem um — o jogador olha pro -x desde que nasce. Então as fotos
 * são tiradas SEMPRE de um ponto à FRENTE (+x) do trecho que interessa, olhando
 * pra trás: é a vista de quem já correu aquele pedaço. Foto de cima ficou de
 * fora por isso (sem pitch, olhar pra baixo não acontece).
 */
const VISTAS = [
  ["corrida-largada.png", 80, 48, "trecho 1: a escada, e a largada ao fundo"],
  ["corrida-vao.png", 100, 48, "trecho 2: o vão com a ponte de 1 bloco"],
  ["corrida-ziguezague.png", 116, 48, "trecho 3: os muros vermelhos alternados"],
  ["corrida-serpentina.png", 105, 66, "trecho 4: as paredes da serpentina"],
  ["corrida-chegada.png", 72, 66, "chegada: faixa listada e pódio"],
];
for (const [nome, x, z, o] of VISTAS) {
  await dizer(`/tp ${eu} ${x} 4 ${z}`);
  await espera(1400);
  await clicarNoBotao("overlay-voltar");
  await espera(900);
  console.log(`  ${o} — (${x}, ${z})`);
  await fotografar(nome);
}

console.log(excecoes.length ? `✗ exceções: ${excecoes.join(" | ")}` : "✓ sem exceção no console");
ws.close();
chrome.kill("SIGKILL");
process.exit(0);
