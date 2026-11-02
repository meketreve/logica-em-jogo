#!/usr/bin/env node
/**
 * §🐄 A VITRINE dos bichos (2026-11-02, pedido dele: "usa isso pra montar um
 * print com os mobs todos enfileirados"). Sobe um host PLANO, entra como
 * professor, roda `/bichos fila` (toda espécie numa fileira, cada variante lado
 * a lado, + um filhote na ponta, com a IA PARADA — a mesma do
 * `?bench&bichosparados`) e fotografa de cima.
 *
 * Assevera o mínimo pra a foto valer: o cliente conhece TODOS os bichos da
 * fila e eles não saem do lugar entre a 1ª e a última foto.
 *
 * ⚠️ Serve o cliente COMPILADO: `npm run build` antes.
 * Uso: npm run build && npm run shots:vitrine [-- L A]
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8135;
const PORTA_CDP = 9385;
const BASE = `http://localhost:${PORTA_WS}`;
const SAIDA = process.env["SAIDA"] ?? join(process.cwd(), ".wolf/designqc-captures", "bichos-vitrine");
const MUNDO = "mundos/_shot-vitrine";
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
    LJ_PRESET: "plano",
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
const PERFIL = mkdtempSync(join(tmpdir(), "lj-vitrine-"));
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


diga(`▶ ${BASE} em ${L}×${A}\n`);
if (!(await entrar("nome=profa&pin=1234&codigo=prof2026"))) {
  console.error("✗ o mundo não ficou pronto");
  encerrar(1);
}
const estado = () => avaliar(`window.__bichosEstado ? window.__bichosEstado() : null`);
/** Esconde a interface pra foto ser só do mundo (o canvas fica). */
const semInterface = () =>
  avaliar(`(() => {
    let s = document.getElementById('vitrine-css');
    if (!s) { s = document.createElement('style'); s.id = 'vitrine-css'; document.head.appendChild(s); }
    s.textContent = 'body > *:not(canvas) { visibility: hidden !important; } #crosshair { display: none !important; }';
    return document.querySelector('canvas') ? 'ok' : 'sem canvas';
  })()`);

await dizer("/hora meio-dia");
await dizer("/ciclo desligar");
await dizer("/bichos desligar");
await dizer("/bichos limpar todos");
await dizer("/bichos fila");
const fila = await ateQue(estado, (e) => (e?.n ?? 0) >= 37, 6000);
ok((fila?.n ?? 0) >= 37, `o cliente conhece os ${fila?.n} bichos da fila (8 espécies, todas as variantes + 1 filhote cada)`);
const alvos = fila?.alvos ?? [];
const pos0 = alvos.map((a) => `${a.x.toFixed(2)},${a.z.toFixed(2)}`).join(" ");
// o meio da vitrine e o professor (o olho)
const cx = alvos.reduce((s, a) => s + a.x, 0) / Math.max(1, alvos.length);
const cz = alvos.reduce((s, a) => s + a.z, 0) / Math.max(1, alvos.length);
const cy = alvos.reduce((s, a) => s + a.y, 0) / Math.max(1, alvos.length);
const minZ = Math.min(...alvos.map((a) => a.z));
const maxZ = Math.max(...alvos.map((a) => a.z));
diga(`  · vitrine centrada em ${cx.toFixed(1)}, ${cy.toFixed(1)}, ${cz.toFixed(1)} (z ${minZ.toFixed(0)}…${maxZ.toFixed(0)})`);
await semInterface();

/** Põe o olho em (x, y, z) — um bloco de pedra sob os pés, porque o
 *  professor não voa no headless — e mira no ponto (mx, my, mz). */
async function olhar(x, y, z, mx, my, mz) {
  const bx = Math.floor(x), by = Math.floor(y), bz = Math.floor(z);
  await dizer(`/bloco ${bx} ${by - 1} ${bz} 2`);
  // inteiros: o `/tp` recusa fração ("Não entendi as coordenadas") e centra sozinho
  await dizer(`/tp profa ${bx} ${by} ${bz}`);
  // ESPERAR a câmera chegar (o `__mirar` devolve de onde mirou): mirar da
  // posição velha aponta pro lugar errado — a 1ª versão tirou a "vitrine do
  // alto" rente ao chão porque o pé ainda estava no ponto anterior
  const cam = await ateQue(
    () => avaliar(`window.__mirar(${mx}, ${my}, ${mz})`),
    (c) => c && Math.hypot(c.x - (bx + 0.5), c.z - (bz + 0.5)) < 1 && Math.abs(c.y - by) < 3,
    5000,
  );
  const chegou = !!cam && Math.hypot(cam.x - (bx + 0.5), cam.z - (bz + 0.5)) < 1 && Math.abs(cam.y - by) < 3;
  ok(chegou, `a câmera chegou em ${bx} ${by} ${bz} (está em ${cam ? `${cam.x.toFixed(1)} ${cam.y.toFixed(1)} ${cam.z.toFixed(1)}` : "?"})`);
  await espera(1500);
  await avaliar(`window.__mirar(${mx}, ${my}, ${mz})`);
  await semInterface();
}
// as fileiras, da 1ª (vaca, mais perto do professor) à última (arara)
const fileiras = [...new Set(alvos.map((a) => Math.round(a.z)))].sort((p, q) => q - p);
ok(fileiras.length === 8, `8 fileiras (${fileiras.join(", ")})`);
const NOMES = ["vaca", "galinha", "ovelha", "cao", "gato", "tatu", "peixe", "arara"];

// 1) a vitrine inteira, do alto, um pouco à frente da 1ª fileira
await olhar(cx, cy + 10, maxZ + 4, cx, cy, cz - 2);
await foto("1-vitrine-inteira.png");

// 2..5) de duas em duas fileiras, de perto e um pouco de cima
for (let k = 0; k < 4; k++) {
  const za = fileiras[2 * k], zb = fileiras[2 * k + 1];
  const zm = (za + zb) / 2;
  await olhar(cx, cy + 3.5, za + 6, cx, cy + 0.4, zm);
  await foto(`${k + 2}-${NOMES[2 * k]}-e-${NOMES[2 * k + 1]}.png`);
}

// 6) a aba "comida" do inventário (pedido dele, 02/11): no CRIATIVO é ela que
// põe trigo/carne/ovo na MÃO — e a mão é o que doma, cria e atrai os bichos.
// Prova pelo fio: o item escolhido na aba chega ao servidor como `mao`.
diga("== a aba comida ==");
await avaliar(`document.getElementById('vitrine-css')?.remove(), 1`);
await dizer("/modo criativo eu");
await tecla("KeyE");
const abaComida = await ateQue(
  () => avaliar(`(() => {
    const b = [...document.querySelectorAll('#inventario .inv-aba')].find(e => (e.textContent || '').trim() === 'comida');
    if (!b) return 'sem aba';
    b.click();
    return 'ok';
  })()`),
  (v) => v === "ok",
  3000,
);
ok(abaComida === "ok", `a aba "comida" existe no inventário (${abaComida})`);
await espera(400);
const grade = await avaliar(`[...document.querySelectorAll('#inventario .inv-grid .inv-bloco')].map(b => ({
  nome: (b.querySelector('small')?.textContent || '').trim(),
  icone: (b.querySelector('img')?.getAttribute('src') || '').length,
}))`) ?? [];
const nomesComida = grade.map((g) => g.nome);
for (const n of ["trigo", "pão", "ovo", "balde de leite", "bolo", "carne crua", "carne assada", "frango assado", "peixe assado"]) {
  ok(nomesComida.includes(n), `a aba mostra "${n}"`);
}
ok(!nomesComida.includes("grama") && !nomesComida.includes("tesoura"), `só comida na aba (${nomesComida.length} itens)`);
const semIcone = grade.filter((g) => g.icone < 30).map((g) => g.nome);
ok(grade.length > 0 && semIcone.length === 0, `todo item tem ícone (${semIcone.join(", ") || "nenhum sem"})`);
await foto("6-aba-comida.png");
const pegou = await avaliar(`(() => {
  const b = [...document.querySelectorAll('#inventario .inv-grid .inv-bloco')].find(e => (e.querySelector('small')?.textContent || '').trim() === 'trigo');
  if (!b) return 'sem trigo';
  b.click();
  return 'ok';
})()`);
ok(pegou === "ok", `clicou no trigo (${pegou})`);
await tecla("KeyE");
const ITEM_TRIGO = 903;
const mao = await ateQue(estado, (e) => e?.maoEnviada === ITEM_TRIGO, 3000);
ok(mao?.maoEnviada === ITEM_TRIGO, `o trigo da aba chegou ao servidor como a MÃO (mao = ${mao?.maoEnviada})`);

const fim = await estado();
const pos1 = (fim?.alvos ?? []).map((a) => `${a.x.toFixed(2)},${a.z.toFixed(2)}`).join(" ");
ok(pos1 === pos0, "ninguém saiu do lugar entre a 1ª e a última foto (IA parada)");
ok(excecoes.length === 0, `sem exceção no console (${excecoes.slice(0, 2).join(" | ")})`);
diga(`\n${falhas === 0 ? "✓ tudo certo" : `✗ ${falhas} falha(s)`}`);
encerrar(falhas === 0 ? 0 : 1);
