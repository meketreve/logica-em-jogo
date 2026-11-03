#!/usr/bin/env node
/**
 * §🖥️ O PAINEL do professor num Chrome DE VERDADE (2026-11-03).
 *
 * O smoke `painel` prova o servidor do painel pela API. O que só a página
 * prova é o que o professor VÊ e clica:
 *
 *   1. o "Dúvidas? Clique aqui!" está À VISTA no canto (dentro da tela, sem
 *      rolar) e leva ao manual;
 *   2. os cartões das aulas existem, com miniatura carregada de verdade;
 *   3. clicar no cartão põe a aula NO AR: endereço grande + QR desenhado;
 *      ANTES do clique não há QR nem endereço (controle negativo);
 *   4. o código do professor nasce ESCONDIDO (o painel vai pro projetor) e só
 *      aparece no "mostrar";
 *   5. um aluno entra e o nome aparece na lista;
 *   6. "Parar" pergunta NA PÁGINA (nunca `confirm()`, que trava a aba) e,
 *      confirmado, tira do ar.
 *
 * ⚠️ PRECISA do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`).
 * Uso: npm run shots:painel
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const PORTA = 8143;
const PORTA_JOGO = 8144;
const PORTA_CDP = 9393;
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "painel");
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
  for (const p of ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]) if (existsSync(p)) return p;
  throw new Error("Chrome não encontrado — `npx -y @puppeteer/browsers install chrome@stable` ou passe CHROME=…");
}
const tcp = (porta) =>
  new Promise((r) => {
    const s = connect({ port: porta, host: "127.0.0.1" });
    s.once("connect", () => (s.destroy(), r(true)));
    s.once("error", () => (s.destroy(), r(false)));
  });

// --- o painel, do jeito que os launchers sobem ---
const painel = spawn(process.execPath, ["--import", "tsx", "server/src/painel.ts"], {
  env: { ...process.env, LJ_PAINEL_PORTA: String(PORTA), LJ_PORT: String(PORTA_JOGO), LJ_SEM_NAVEGADOR: "1" },
  detached: true,
  stdio: ["ignore", "ignore", "pipe"],
});
painel.stderr?.on("data", (d) => /Error/.test(String(d)) && process.stderr.write(`[painel] ${d}`));
let chrome = null;
const PERFIL = mkdtempSync(join(tmpdir(), "lj-painel-"));
function encerrar(codigo) {
  try { process.kill(-chrome.pid, "SIGKILL"); } catch { /* não subiu */ }
  // SIGINT no GRUPO: o painel espera o jogo (filho) gravar e sair
  try { process.kill(-painel.pid, "SIGINT"); } catch { /* já foi */ }
  setTimeout(() => {
    rmSync(PERFIL, { recursive: true, force: true });
    process.exit(codigo);
  }, 1500);
}
process.on("uncaughtException", (e) => (console.error(e), encerrar(1)));
process.on("unhandledRejection", (e) => (console.error(e), encerrar(1)));
for (const s of ["SIGINT", "SIGTERM"]) process.on(s, () => encerrar(130));
let subiu = false;
for (let i = 0; i < 80 && !subiu; i++) (subiu = await tcp(PORTA)) || (await espera(250));
if (!subiu) { console.error("o painel não subiu"); encerrar(1); }

chrome = spawn(
  acharChrome(),
  ["--headless=new", "--no-sandbox", "--disable-gpu", "--window-size=1280,800", `--remote-debugging-port=${PORTA_CDP}`, `--user-data-dir=${PERFIL}`, "about:blank"],
  { detached: true, stdio: "ignore" },
);
let aba = null;
for (let i = 0; i < 60 && !aba; i++) {
  try { aba = (await (await fetch(`http://127.0.0.1:${PORTA_CDP}/json/list`)).json()).find((t) => t.type === "page"); } catch { /* subindo */ }
  if (!aba) await espera(250);
}
const ws = new WebSocket(aba.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pend = new Map();
const excecoes = [];
let dialogos = 0;
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pend.has(m.id)) (pend.get(m.id)(m), pend.delete(m.id));
  else if (m.method === "Runtime.exceptionThrown") excecoes.push(m.params.exceptionDetails.exception?.description ?? "?");
  else if (m.method === "Page.javascriptDialogOpening") dialogos++;
});
const cdp = (method, params = {}) =>
  new Promise((ok, falha) => {
    const meu = ++id;
    const t = setTimeout(() => (pend.delete(meu), falha(new Error(`CDP travou em ${method}`))), 30000);
    pend.set(meu, (m) => (clearTimeout(t), ok(m)));
    ws.send(JSON.stringify({ id: meu, method, params }));
  });
const avaliar = async (e) => (await cdp("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true })).result?.result?.value;
const clicar = (sel) => avaliar(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false; el.click(); return true; })()`);
async function ateQue(ler, ok, ms = 5000) {
  const fim = Date.now() + ms;
  let v = await ler();
  while (!ok(v) && Date.now() < fim) {
    await espera(150);
    v = await ler();
  }
  return v;
}
const foto = async (nome) => {
  const r = await cdp("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
  writeFileSync(join(SAIDA, nome), Buffer.from(r.result.data, "base64"));
  diga(`  ✓ ${nome} em ${SAIDA}`);
};
let falhas = 0;
const ok = (c, msg) => {
  diga(`  ${c ? "✓" : "✗"} ${msg}`);
  if (!c) falhas++;
};
await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Page.navigate", { url: `http://localhost:${PORTA}/` });
await ateQue(() => avaliar(`document.querySelectorAll('.cartao').length`), (n) => n > 0, 8000);

diga("▶ painel do professor no Chrome\n");
// 1
const duvida = await avaliar(`(() => { const a = document.querySelector('[data-acao="duvidas"]'); if (!a) return null;
  const r = a.getBoundingClientRect(); return { href: a.getAttribute('href'), texto: a.textContent.replace(/\\s+/g, ' ').trim(),
  dentro: r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight && r.width > 0, canto: r.right > innerWidth * 0.7 && r.top < 80 }; })()`);
ok(duvida?.texto.includes("Dúvidas?") && duvida.texto.includes("Clique aqui"), `o botão diz "${duvida?.texto}"`);
ok(duvida?.dentro && duvida?.canto, "e está à vista no canto de cima, sem rolar");
ok((await (await fetch(`http://localhost:${PORTA}${duvida?.href}`)).text()).includes("Manual"), `e leva ao manual (${duvida?.href})`);
// 2
const cartoes = await avaliar(`[...document.querySelectorAll('.cartao')].map((c) => ({ t: c.querySelector('.cartao-titulo').textContent, img: c.querySelector('img')?.naturalWidth ?? 0 }))`);
ok(cartoes.length >= 9, `${cartoes.length} cartões (mundo livre + 8 aulas)`);
ok(cartoes.filter((c) => c.img > 0).length >= 9, `com miniatura carregada (${cartoes.filter((c) => c.img > 0).length})`);
const faixa = await ateQue(() => avaliar(`document.getElementById('faixa').dataset.estado`), (v) => v !== "verificando", 12000);
ok(["em-dia", "nova", "sem-internet", "desconhecido", "atualizou"].includes(faixa), `a faixa da versão saiu do "procurando" (${faixa})`);
// 3 — controle negativo ANTES do clique
ok((await avaliar(`document.getElementById('no-ar').hidden && !document.querySelector('#qr svg')`)) === true, "antes de escolher: nada no ar, nenhum QR");
await foto("01-escolher.png");
await clicar('.cartao[data-caminho="cenarios/aula1-sequencia.ljw"]');
const noAr = await ateQue(() => avaliar(`!document.getElementById('no-ar').hidden`), Boolean, 60000);
ok(noAr, "clicar no cartão da Aula 1 põe no ar");
const end = await avaliar(`document.getElementById('endereco').textContent`);
ok(new RegExp(`^http://[\\d.]+:${PORTA_JOGO}$`).test(end) || end === `http://localhost:${PORTA_JOGO}`, `endereço grande: ${end}`);
const qr = await avaliar(`(() => { const s = document.querySelector('#qr svg'); if (!s) return null; const r = s.getBoundingClientRect(); return { w: r.width, path: !!s.querySelector('path, rect') }; })()`);
ok(qr?.path && qr.w >= 150, `QR desenhado (${qr?.w?.toFixed(0)} px)`);
const entrar = await avaliar(`(() => { const a = document.getElementById('entrar-jogo'); const r = a.getBoundingClientRect(); return { href: a.href, alvo: a.target, visivel: r.width > 0 && r.top >= 0 && r.bottom <= innerHeight }; })()`);
ok(entrar.href === `http://localhost:${PORTA_JOGO}/` && entrar.alvo === "_blank" && entrar.visivel, `"Entrar no jogo" à vista, abre ${entrar.href} em outra aba`);
ok((await (await fetch(entrar.href)).status) === 200, "e o jogo responde nesse endereço");
ok((await avaliar(`document.querySelector('.cartao.atual')?.dataset.caminho`)) === "cenarios/aula1-sequencia.ljw", "o cartão da aula no ar fica marcado");
// 4
const cod = await avaliar(`document.getElementById('codigo').textContent`);
ok(cod === "••••" && !(await avaliar(`document.body.innerText.includes('prof2026')`)), "o código do professor nasce escondido");
await clicar('[data-acao="mostrar-codigo"]');
ok((await avaliar(`document.getElementById('codigo').textContent`)) === "prof2026", "e aparece no \"mostrar\"");
await clicar('[data-acao="mostrar-codigo"]');
// 5
const aluno = new WebSocket(`ws://127.0.0.1:${PORTA_JOGO}`);
aluno.onopen = () => aluno.send(JSON.stringify({ type: "join", name: "bia", pin: "2222" }));
aluno.onmessage = (e) => {
  if (typeof e.data !== "string") return;
  const m = JSON.parse(e.data);
  if (m.type === "ping") aluno.send(JSON.stringify({ type: "pong", t: m.t }));
};
const lista = await ateQue(() => avaliar(`[...document.querySelectorAll('#conectados li')].map((l) => l.dataset.jogador)`), (v) => v.includes("bia"), 6000);
ok(lista.includes("bia"), "a aluna aparece na lista de conectados");
ok((await avaliar(`document.getElementById('conectados-titulo').textContent`)) === "1 conectado", "com a contagem certa no singular");
await foto("02-no-ar.png");
await clicar('[data-acao="projetar"]');
ok((await avaliar(`!document.getElementById('projetar').hidden && !document.getElementById('projetar').innerText.includes('prof2026')`)) === true, "\"Mostrar pra turma\" abre endereço + QR, sem o código");
await foto("03-projetor.png");
await clicar('[data-acao="fechar-projetar"]');
// 6
await clicar('[data-acao="parar"]');
ok((await avaliar(`!document.getElementById('modal').hidden && document.getElementById('modal-texto').innerText.includes('A 1 pessoa conectada vai sair')`)) === true, "\"Parar\" pergunta na própria página, avisando quem sai");
ok(dialogos === 0, "sem diálogo do navegador (confirm/alert)");
ok(!(await avaliar(`document.getElementById('no-ar').hidden`)), "e nada para antes da resposta");
await clicar('#modal-sim');
const parou = await ateQue(() => avaliar(`document.getElementById('no-ar').hidden && document.getElementById('subindo').hidden`), Boolean, 15000);
ok(parou, "confirmado, a aula sai do ar");
ok(!(await tcp(PORTA_JOGO)), "e a porta do jogo fecha");
ok(excecoes.length === 0, `sem exceção na página (${excecoes.length}) ${excecoes.slice(0, 2).join(" | ")}`);
aluno.close();

diga(falhas === 0 ? "\n✓ SONDA painel OK" : `\n✗ SONDA painel: ${falhas} falha(s)`);
encerrar(falhas === 0 ? 0 : 1);
