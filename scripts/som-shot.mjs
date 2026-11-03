#!/usr/bin/env node
/**
 * Sonda do SOM DE MUNDO (§🔊, 2026-11-02) contra o host REAL + Chrome real.
 * Esqueleto copiado do `quebra-shot.mjs`.
 *
 * Som não se vê no DOM nem no pixel: a sonda lê os CONTADORES do motor
 * (`window.__som`, os mesmos que vão pro perfil do F3) antes e depois de cada
 * cena e assevera no DELTA — por tipo, não no total (o ambiente toca sozinho
 * no meio e sujaria a conta).
 *
 * O que ela prova:
 * 0. a tela 🔊 som das configurações tem os TRÊS controles (interface, mundo,
 *    ambiente) e o contexto de áudio RODA depois do 1º toque;
 * 1. colocar e tirar pedra soa "colocar" e "quebrar";
 * 2. (a água NÃO entra aqui: o `/bloco` não coloca água, e o silêncio dela
 *    já é provado no `sons.test.ts`);
 * 3. a alavanca dá clique pelo ▣ de verdade (use_block) e o fio e a lâmpada
 *    que ela acende ficam CALADOS — controle negativo do motor, com prova de
 *    que eles chegaram ao cliente (`trocasCaladas` sobe); e a janela range;
 * 4. bloco a 40 blocos nem cria voz (descartado por distância);
 * 5. segurando a picareta, sai o "toc" da ferramenta (golpe) enquanto racha;
 * 6. o F3 mostra a linha "som …".
 * 7. §🔊 v2: as amostras GRAVADAS chegam todas (zero falha) e o colocar, o
 *    golpe tocaram GRAVADO; a alavanca segue sintetizada;
 * 8. controle negativo da v2: com `/sons/*` respondendo 404 (interceptado no
 *    CDP), todas falham e o MESMO colocar cai na síntese — o jogo não emudece.
 *
 * ⚠️ Serve o cliente COMPILADO: `npm run build` antes.
 * ⚠️ Mundo descartável em `mundos/_shot-som` (LJ_SAVE — nunca o world.ljw).
 *
 * Uso:
 *   npm run build && npm run shots:som
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8133;
const PORTA_CDP = 9383;
const BASE = `http://localhost:${PORTA_WS}`;
const SAIDA = process.env["SAIDA"] ?? join(process.cwd(), ".wolf/designqc-captures", "som");
const MUNDO = "mundos/_shot-som";
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
const PERFIL = mkdtempSync(join(tmpdir(), "lj-som-"));
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
    // o AudioContext nasce no 1º pointerdown, que aqui é SINTÉTICO: sem esta
    // chave ele ficaria "suspended" e todo som seria "descartado" calado
    "--autoplay-policy=no-user-gesture-required",
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



const ultimosChats = () =>
  avaliar(`[...document.querySelectorAll('#chat-log *')].map(e => e.textContent).slice(-8)`);
/** Aperta o ⛏ e SEGURA (sem soltar) — o dedo fica no botão. */
async function apertarQuebrar(x, y) {
  await cdp("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
}
async function soltarQuebrar() {
  await cdp("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await espera(150);
}


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

// ================= cenas do som =================
const AR = 0;
const PEDRA = 2;
const PICARETA_MADEIRA = 912;
const FIO = 258; // FioDesligado
const ALAVANCA = 256;
const LAMPADA = 260; // LampadaApagada
// a PORTA não sai por `/bloco` (é par de 2 células); a janela é a mesma
// família no `somDaTroca` e é uma célula só
const JANELA_FECHADA = 85; // JanelaZFechada (o vidro de FRENTE pra mira em −Z)

const som = () => avaliar(`window.__som ? window.__som() : null`);
/** Delta de UM tipo entre dois retratos. */
const delta = (a, b, tipo) => (b?.porTipo?.[tipo] ?? 0) - (a?.porTipo?.[tipo] ?? 0);
/** Soma dos deltas de todos os tipos MENOS o ambiente (que toca sozinho). */
const deltaSemAmbiente = (a, b) => {
  let n = 0;
  for (const [k, v] of Object.entries(b?.porTipo ?? {})) {
    if (k === "ambiente") continue;
    n += v - (a?.porTipo?.[k] ?? 0);
  }
  return n;
};

diga(`▶ ${BASE} em ${L}×${A}\n`);

diga("== 0. a tela 🔊 som tem os três controles ==");
await cdp("Page.navigate", { url: `${BASE}/` });
await ateQue(() => avaliar(`!!document.querySelector('#menu-config-body button')`), (v) => v, 15000);
const rotulos = await avaliar(`(() => {
  const b = [...document.querySelectorAll('#menu-config-body button')].find(e => e.textContent.includes('som'));
  if (!b) return null;
  b.click();
  return [...document.querySelectorAll('#menu-config-body .config-row')]
    .filter(r => r.querySelector('input[type=range]'))
    .map(r => r.querySelector('span')?.textContent ?? '');
})()`);
ok(Array.isArray(rotulos) && rotulos.length === 3, `três controles de volume (${JSON.stringify(rotulos)})`);
ok((rotulos ?? []).some((t) => t.includes("mundo")), "um deles é o dos sons do MUNDO");
ok((rotulos ?? []).some((t) => t.includes("ambiente")), "e um é o do AMBIENTE");

if (!(await entrar("nome=profa&pin=1234&codigo=prof2026"))) {
  console.error("✗ o mundo não ficou pronto");
  encerrar(1);
}
// arma o áudio pelo MESMO caminho do jogo (o listener de pointerdown do audio.ts)
await avaliar(`(window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })), 1)`);
const s0 = await ateQue(som, (m) => m?.contexto === "running", 4000);
ok(s0?.contexto === "running", `o AudioContext roda depois do 1º toque (${s0?.contexto})`);

// sala limpa à frente: ar em 3×3, chão de pedra
for (const dz of [-1, -2, -3]) for (const dy of [0, 1, 2]) await dizer(`/bloco ~ ~${dy} ~${dz} ${AR}`);
await espera(600);

diga("== 1. colocar e tirar pedra ==");
let a = await som();
await dizer(`/bloco ~ ~ ~-2 ${PEDRA}`);
let b = await ateQue(som, (m) => delta(a, m, "colocar") >= 1, 3000);
ok(delta(a, b, "colocar") === 1, `colocar pedra soou "colocar" 1× (${delta(a, b, "colocar")})`);
a = b;
await dizer(`/bloco ~ ~ ~-2 ${AR}`);
b = await ateQue(som, (m) => delta(a, m, "quebrar") >= 1, 3000);
ok(delta(a, b, "quebrar") === 1, `tirar a pedra soou "quebrar" 1× (${delta(a, b, "quebrar")})`);

diga("== 3. alavanca e porta, pelo ▣ de verdade (use_block) ==");
// o `/bloco` não cria peça LIGADA nem porta ABERTA (são resultado, não escolha):
// a troca tem de nascer do clique, como na aula. A mira está parada na
// horizontal, então a peça fica na altura do olho (~1), a 2 blocos.
const btnUsar = await botaoDeAcao("colocar");
ok(!!btnUsar, "achou o botão ▣");
// alavanca → fio → lâmpada, numa bancada de pedra: o clique liga o fio e a
// lâmpada pelo MOTOR, e só a alavanca pode soar (controle negativo do circuito)
for (const dx of [0, 1, 2]) await dizer(`/bloco ~${dx} ~ ~-2 ${PEDRA}`);
await dizer(`/bloco ~ ~1 ~-2 ${ALAVANCA}`);
await dizer(`/bloco ~1 ~1 ~-2 ${FIO}`);
await dizer(`/bloco ~2 ~1 ~-2 ${LAMPADA}`);
await espera(800);
a = await som();
if (btnUsar) await tocar(btnUsar.x, btnUsar.y);
b = await ateQue(som, (m) => delta(a, m, "alavanca") >= 1 && m.trocasCaladas - a.trocasCaladas >= 2, 3000);
ok(delta(a, b, "alavanca") === 1, `a alavanca deu o clique (${delta(a, b, "alavanca")})`);
ok(b.trocasCaladas - a.trocasCaladas >= 2, `o fio e a lâmpada acenderam no cliente (${b.trocasCaladas - a.trocasCaladas} trocas caladas)`);
ok(deltaSemAmbiente(a, b) === 1, `e SÓ a alavanca soou — fio e lâmpada são motor (${JSON.stringify(b?.porTipo)})`);
for (const dx of [0, 1, 2]) await dizer(`/bloco ~${dx} ~1 ~-2 ${AR}`);
await dizer(`/bloco ~1 ~ ~-2 ${AR}`);
await dizer(`/bloco ~2 ~ ~-2 ${AR}`);
await dizer(`/bloco ~ ~1 ~-2 ${JANELA_FECHADA}`);
await espera(800);
a = await som();
if (btnUsar) await tocar(btnUsar.x, btnUsar.y);
b = await ateQue(som, (m) => delta(a, m, "porta") >= 1, 3000);
ok(delta(a, b, "porta") === 1, `a janela rangeu abrindo (${delta(a, b, "porta")})`);
await dizer(`/bloco ~ ~1 ~-2 ${AR}`);
await dizer(`/bloco ~ ~ ~-2 ${AR}`);

diga("== 4. longe demais nem cria voz ==");
await espera(600);
a = await som();
await dizer(`/bloco ~40 ~ ~ ${PEDRA}`);
b = await ateQue(som, (m) => (m?.descartadosLonge ?? 0) > (a?.descartadosLonge ?? 0), 3000);
ok((b?.descartadosLonge ?? 0) > (a?.descartadosLonge ?? 0), `a pedra a 40 blocos foi descartada por distância (${a?.descartadosLonge} → ${b?.descartadosLonge})`);
ok(delta(a, b, "colocar") === 0, `e não tocou "colocar" (${delta(a, b, "colocar")})`);

diga("== 5. a picareta faz toc-toc enquanto racha ==");
await dizer("/modo sobrevivencia eu");
for (const dy of [0, 1, 2]) await dizer(`/bloco ~ ~${dy} ~-3 ${PEDRA}`);
await dizer(`/dar eu ${PICARETA_MADEIRA} 1`);
await espera(800);
const btnQuebrar = await botaoDeAcao("quebrar");
ok(!!btnQuebrar, "achou o botão ⛏");
if (btnQuebrar) {
  a = await som();
  await apertarQuebrar(btnQuebrar.x, btnQuebrar.y);
  b = await ateQue(som, (m) => delta(a, m, "quebrar") >= 1, 6000);
  await soltarQuebrar();
  ok(delta(a, b, "golpe") >= 2, `saíram ${delta(a, b, "golpe")} golpes enquanto rachava (≥ 2)`);
  ok(delta(a, b, "quebrar") >= 1, `e o "quebrar" quando a pedra caiu (${delta(a, b, "quebrar")})`);
}

diga("== 6. o F3 mostra o custo do som ==");
await tecla("F3");
const linha = await ateQue(
  () => avaliar(`(document.getElementById('hud-text')?.textContent ?? '').split('\\n').find(l => l.startsWith('som ')) ?? null`),
  (v) => !!v,
  3000,
);
ok(!!linha && /vozes/.test(linha), `a linha do som no F3: ${JSON.stringify(linha)}`);
await foto("6-f3.png");

diga("== 7. sons v2: as amostras gravadas chegaram e tocam ==");
const carregou = (m) => m?.amostras && m.amostras.total > 0 && m.amostras.carregadas + m.amostras.falhas >= m.amostras.total;
let am = await ateQue(som, carregou, 20000);
ok((am?.amostras?.total ?? 0) >= 50, `o jogo pediu as amostras (${am?.amostras?.total})`);
ok(am?.amostras?.falhas === 0 && am?.amostras?.carregadas === am?.amostras?.total, `todas chegaram e decodificaram (${am?.amostras?.carregadas}/${am?.amostras?.total}, ${am?.amostras?.falhas} falhas, ${am?.amostras?.kb} KB de PCM)`);
ok(am?.origemPorTipo?.golpe === "amostra", `o toc-toc da picareta (seção 5) saiu GRAVADO (${am?.origemPorTipo?.golpe})`);
await dizer(`/modo criativo eu`);
await dizer(`/bloco ~ ~ ~-2 ${AR}`);
await espera(400);
a = await som();
await dizer(`/bloco ~ ~ ~-2 ${PEDRA}`);
b = await ateQue(som, (m) => delta(a, m, "colocar") >= 1, 3000);
ok(delta(a, b, "colocar") === 1 && b?.origemPorTipo?.colocar === "amostra", `colocar pedra tocou GRAVADO (${b?.origemPorTipo?.colocar})`);
ok(b.amostras.gravadas > a.amostras.gravadas, `o contador de gravadas subiu (${a.amostras.gravadas} → ${b.amostras.gravadas})`);
ok(b?.origemPorTipo?.alavanca === "sintese", `a alavanca segue SINTETIZADA, como no plano (${b?.origemPorTipo?.alavanca})`);
await dizer(`/bloco ~ ~ ~-2 ${AR}`);

diga("== 8. controle negativo: sem os arquivos, a síntese assume ==");
// toda requisição de /sons/ responde 404 — o "arquivo ausente" de verdade
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data);
  if (m.method === "Fetch.requestPaused") {
    ws.send(JSON.stringify({ id: ++id, method: "Fetch.fulfillRequest", params: { requestId: m.params.requestId, responseCode: 404, body: "" } }));
  }
});
await cdp("Fetch.enable", { patterns: [{ urlPattern: "*/sons/*" }] });
if (!(await entrar("nome=profa&pin=1234&codigo=prof2026"))) {
  ok(false, "o mundo não voltou pra o controle negativo");
} else {
  await avaliar(`(window.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })), 1)`);
  am = await ateQue(som, carregou, 20000);
  ok(am?.amostras?.carregadas === 0 && am?.amostras?.falhas === am?.amostras?.total && am?.amostras?.total > 0,
    `todas falharam com 404 (${am?.amostras?.carregadas} carregadas, ${am?.amostras?.falhas}/${am?.amostras?.total} falhas)`);
  await dizer(`/bloco ~ ~ ~-2 ${AR}`);
  await espera(400);
  a = await som();
  await dizer(`/bloco ~ ~ ~-2 ${PEDRA}`);
  b = await ateQue(som, (m) => delta(a, m, "colocar") >= 1, 3000);
  ok(delta(a, b, "colocar") === 1, `o colocar AINDA soou (${delta(a, b, "colocar")})`);
  ok(b?.origemPorTipo?.colocar === "sintese", `e saiu da SÍNTESE (${b?.origemPorTipo?.colocar})`);
  ok((b?.amostras?.gravadas ?? 0) === 0, `zero vozes gravadas sem os arquivos (${b?.amostras?.gravadas})`);
}

if (excecoes.length) diga(`  ⚠ exceções na página: ${excecoes.slice(0, 3).join(" | ")}`);
ok(excecoes.length === 0, "nenhuma exceção na página");
diga(falhas === 0 ? "\n✅ shots:som — tudo verde" : `\n❌ shots:som — ${falhas} falha(s)`);
encerrar(falhas === 0 ? 0 : 1);
