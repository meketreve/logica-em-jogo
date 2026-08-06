#!/usr/bin/env node
/**
 * Prints do §🍖 F10 (fundição, fornalha, baú, algodão, picaretas) contra o
 * servidor REAL — as telas que a sessão 46 construiu e ninguém fotografou.
 *
 * Por que existe: o F10 inteiro nasceu com teste puro, teste de sessão e smoke
 * pelo fio, e nenhum deles tem olho. Três coisas do F10 só o olho responde:
 *
 * 1. **Os ícones novos na hotbar** (graveto, carvão, diamante, lingote,
 *    algodão, as 3 picaretas). São desenhados à mão em `blockIcons.ts` — item
 *    não tem tile no atlas — e a pergunta é se dão pra distinguir no tamanho
 *    de um slot, num tablet, a um braço de distância.
 * 2. **O painel de transferência** (`container.ts`), que é a UI mais nova do
 *    jogo: 3 slots rotulados + 2 barrinhas na fornalha, 27 slots no baú, e a
 *    mochila inteira embaixo. Ninguém nunca o viu desenhado.
 * 3. **A forma dos blocos no mundo** — e é esta que vira A/B dos dois refinos
 *    de mesher (a CAIXA do baú e a FRENTE da fornalha): a mesma cena, o mesmo
 *    ângulo, antes e depois.
 *
 * O canteiro de algodão sai de brinde no mesmo mundo: quatro pés plantados em
 * TEMPOS diferentes (com `LJ_CRESCIMENTO` acelerado) dão os 4 estágios lado a
 * lado sem esperar os 20 s por estágio da aula.
 *
 * Tudo é dirigido pelo cliente de verdade: o mundo se monta por `/bloco` do
 * professor (coordenadas `~` relativas — o script nunca precisa saber onde o
 * spawn caiu) e o painel abre pelo MESMO gesto do aluno (tocar no ▣, que
 * chama `input.press(2)` → `use_block` → o servidor responde e é a resposta
 * que abre).
 *
 * ⚠️ Serve o cliente COMPILADO (o host Node serve `client/dist`): rode
 * `npm run build` antes.
 * ⚠️ PRECISA do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`).
 *
 * Uso:
 *   npm run build && npm run shots:f10       # 1024×600 (Kindle Fire), coarse
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8111;
const PORTA_CDP = 9359;
const BASE = process.env["BASE"] ?? `http://localhost:${PORTA_WS}`;
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "f10");
const MUNDO = "mundos/_shot-f10";
/** Ticks por estágio da plantação. O padrão é 200 (20 s); aqui 30 (3 s) faz os
 *  4 estágios caberem num print sem falsear nada — quem acelera é o HOST, pela
 *  mesma variável que o smoke da comida usa. */
const CRESCIMENTO = 30;
mkdirSync(SAIDA, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
// stdout SEM buffer (bug do toque-shot): fora de TTY o node segura as linhas
// até o fim, e um script morto no meio não deixa rastro do que já mediu.
const diga = (t) => process.stdout.write(`${t}\n`);

// --- ids (espelho de shared/src/blocks.ts — o script fala JSON, não TS) ---
const AR = 0;
const DIRT = 5;
const MINERIO_FERRO = 117;
const FORNALHA = 186; // apagada, virada pro −Z (os ids originais do F10b)
// §🍖 F10 refino: as outras 3 direções (ver FORNALHA_POR_FRENTE no shared)
const BlockId_FornalhaXP = 194;
const BlockId_FornalhaZP = 195;
const BlockId_FornalhaXN = 196;
const BAU = 188;
const ALGODAO0 = 189;
const ALGODAO_SELVAGEM = 193;
const ITEM_CARVAO = 905;
const ITEM_DIAMANTE = 906;
const ITEM_GRAVETO = 907;
const ITEM_LINGOTE_FERRO = 909;
const ITEM_ALGODAO = 911;
const ITEM_PICARETA_MADEIRA = 912;
const ITEM_PICARETA_FERRO = 914;
const ITEM_PICARETA_DIAMANTE = 915;

/**
 * A vitrine do print de forma: `[dx, id]` na prateleira, da esquerda pra
 * direita. É ela que mostra os dois REFINOS de mesher de 2026-08-05:
 *
 * - as QUATRO direções da fornalha lado a lado — antes do refino as quatro
 *   liam idênticas (boca nas 4 faces), e o print era uma parede de bocas;
 * - dois baús ENCOSTADOS, porque o vão de 2/16 entre eles só existe na foto
 *   quando há um vizinho. Um baú sozinho parece um cubo de qualquer jeito.
 *
 * Fica a ±3 do centro porque é o que cabe no quadro a 4 blocos de distância.
 */
const VITRINE = [
  [-3, BlockId_FornalhaXP],
  [-2, BlockId_FornalhaZP],
  [-1, BlockId_FornalhaXN],
  [0, FORNALHA],
  [1, BAU],
  [2, BAU],
];

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
    `--user-data-dir=${mkdtempSync(join(tmpdir(), "lj-f10-"))}`,
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
const painel = () =>
  avaliar(`(() => {
    const r = document.getElementById('container');
    if (!r || r.classList.contains('hidden')) return null;
    const cont = r.querySelector('.cont-fornalha, .cont-bau');
    return {
      titulo: r.querySelector('h2')?.textContent ?? '',
      slotsContainer: cont ? cont.querySelectorAll('button.inv-slot').length : 0,
      rotulos: [...r.querySelectorAll('.cont-cel small')].map(e => e.textContent).join('/'),
      barras: r.querySelectorAll('.cont-barra').length,
      fogoPct: (() => {
        const i = r.querySelector('.cont-trilho i.fogo');
        return i ? Math.round(parseFloat(i.style.width) || 0) : -1;
      })(),
      comIcone: r.querySelectorAll('button.inv-slot img').length,
    };
  })()`);
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

diga(`▶ ${BASE} em ${L}×${A}, pointer:coarse, toque REAL\n`);
// `?codigo=` entra como PROFESSORA (destrava /bloco e /dar); `?atlas` pendura o
// canvas do texture atlas no canto — o print dele sai primeiro e o canvas é
// REMOVIDO em seguida, pra não sujar as outras telas.
await cdp("Page.navigate", {
  url: `${BASE}/?server=ws://localhost:${PORTA_WS}&nome=profa&pin=1234&codigo=prof2026&atlas`,
});
let pronto = false;
for (let i = 0; i < 90; i++) {
  await espera(1000);
  if (await avaliar(`!!document.querySelector('#hotbar .slot')`)) {
    pronto = true;
    break;
  }
}
if (!pronto) {
  console.error("✗ o mundo não ficou pronto");
  encerrar(1);
}
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(1500);

diga("== 1. o ATLAS, com os tiles novos do F10 (fornalha, baú, algodão) ==");
await foto("01-atlas.png");
await avaliar(`(() => {
  const c = [...document.querySelectorAll('canvas')].find(e => e.style.zIndex === '20');
  c?.remove();
  return !!c;
})()`);
await espera(400);

diga("== 2. a HOTBAR com os ícones novos (7 dos 9 nasceram no F10) ==");
await dizer("/modo sobrevivencia eu");
// a ordem aqui É a ordem dos slots 0..8: /dar preenche do começo da mochila
for (const [item, qtd] of [
  [MINERIO_FERRO, 8],
  [ITEM_CARVAO, 16],
  [ITEM_GRAVETO, 12],
  [ITEM_DIAMANTE, 3],
  [ITEM_LINGOTE_FERRO, 5],
  [ITEM_ALGODAO, 9],
  [ITEM_PICARETA_MADEIRA, 1],
  [ITEM_PICARETA_FERRO, 1],
  [ITEM_PICARETA_DIAMANTE, 1],
]) {
  await dizer(`/dar eu ${item} ${qtd}`);
}
await espera(800);
const hot = await avaliar(`(() => {
  const s = [...document.querySelectorAll('#hotbar .slot')];
  return { slots: s.length, comIcone: s.filter(e => e.querySelector('img')).length,
           naMao: document.querySelector('#hotbar .bar-nome')?.textContent ?? '' };
})()`);
ok(hot?.comIcone === 9, `os 9 slots da hotbar têm ícone (${hot?.comIcone})`);
diga(`  · na mão: "${hot?.naMao}"`);
await foto("02-hotbar.png");

diga("== 3. o mundo de estúdio: corredor limpo + parede de fornalha a 3 blocos ==");
// coordenadas `~` = as do professor. O corredor é limpo em 2 alturas e 2
// distâncias porque o olhar nasce em yaw 0 (−z) e pitch 0: a mira sai na
// altura do OLHO, que é ⌊y⌋+1 ou +2 conforme onde o pé parou no terreno.
for (const dz of [-1, -2]) {
  for (const dy of [0, 1, 2]) await dizer(`/bloco ~ ~${dy} ~${dz} ${AR}`);
}
for (const dy of [1, 2]) await dizer(`/bloco ~ ~${dy} ~-3 ${FORNALHA}`);
await espera(600);
const btnColocar = await botaoDeAcao("colocar");
if (!btnColocar) {
  console.error("✗ botão ▣ não encontrado na barra de ações");
  encerrar(1);
}
await tocar(btnColocar.x, btnColocar.y);
let p = await ateQue(painel, (p) => p !== null);
ok(p !== null, "o toque no ▣ abriu o painel (o servidor respondeu ao use_block)");
ok(p?.titulo === "fornalha", `e o título é "fornalha" (${p?.titulo})`);
ok(p?.slotsContainer === 3, `a fornalha mostra 3 slots (${p?.slotsContainer})`);
ok(p?.rotulos === "cozinhar/queimar/pronto", `rotulados: ${p?.rotulos}`);
ok(p?.barras === 2, `e as 2 barrinhas (fogo e cozimento) estão lá (${p?.barras})`);

diga("== 4. minério na ENTRADA, carvão no QUEIMAR — e o fogo pega ==");
// os slots são botões com listener de `click`: `.click()` percorre o MESMO
// caminho do dedo (o painel manda `mover_container` e quem aplica é o servidor)
const clicar = (sel, i) =>
  avaliar(`(() => {
    const g = document.querySelector(${JSON.stringify(sel)});
    const b = g?.querySelectorAll('button.inv-slot')[${i}];
    if (!b) return false;
    b.click();
    return true;
  })()`);
ok(await clicar("#container .inv-hotbar", 0), "pega o minério de ferro (slot 1 da hotbar)");
await espera(300);
ok(await clicar("#container .cont-fornalha", 0), "e solta no slot de COZINHAR");
await espera(500);
ok(await clicar("#container .inv-hotbar", 1), "pega o carvão (slot 2)");
await espera(300);
ok(await clicar("#container .cont-fornalha", 1), "e solta no slot de QUEIMAR");
await espera(1500);
p = await painel();
ok((p?.fogoPct ?? 0) > 0, `o fogo está andando (barra em ${p?.fogoPct}%)`);
await foto("03-fornalha-painel.png");

diga("== 5. a fornalha ACESA no mundo (o byte trocou, e com ele a luz) ==");
await avaliar(`document.querySelector('#container .cont-fechar')?.click()`);
ok((await ateQue(painel, (p) => p === null)) === null, "o painel fechou");
await limparChat();
await foto("05-fornalha-acesa-no-mundo.png");

diga("== 6. o BAÚ: 27 slots, o mesmo encanamento ==");
for (const dy of [1, 2]) await dizer(`/bloco ~ ~${dy} ~-3 ${BAU}`);
await espera(600);
await tocar(btnColocar.x, btnColocar.y);
p = await ateQue(painel, (p) => p?.titulo === "baú");
ok(p?.titulo === "baú", `o título virou "baú" (${p?.titulo})`);
ok(p?.slotsContainer === 27, `e ele tem 27 slots (${p?.slotsContainer})`);
ok(p?.barras === 0, "sem barrinha nenhuma (baú não tem fogo)");
// guarda três coisas, pra o print não ser uma grade de quadrados vazios
for (const [origem, destino] of [
  [2, 0],
  [3, 9],
  [5, 13],
]) {
  await clicar("#container .inv-hotbar", origem);
  await espera(250);
  await clicar("#container .cont-bau", destino);
  await espera(400);
}
p = await painel();
ok((p?.comIcone ?? 0) > 0, `há ${p?.comIcone} slots com item na tela`);
await foto("06-bau-painel.png");
await avaliar(`document.querySelector('#container .cont-fechar')?.click()`);
await espera(700);

diga("== 7. o PALCO: um terraço limpo com a vitrine do F10 na altura do olho ==");
// `/regiao encher` em vez de dezenas de `/bloco`: o terreno do gen não serve
// de fundo (a fornalha é cinza e o pedregulho atrás dela também), e a
// prateleira na altura do olho é o que faz o bloco aparecer de LADO no print —
// um bloco bem à frente mostra só a face de trás, e as duas coisas que os
// refinos mexem (a caixa do baú, a frente da fornalha) só existem de lado.
await dizer("/regiao criar palco ~-5 ~ ~-6 ~5 ~3 ~-1");
await dizer("/regiao encher palco 0");
await dizer(`/regiao criar terraco ~-5 ~-1 ~-6 ~5 ~ ~-1`);
await dizer(`/regiao encher terraco ${DIRT}`);
await espera(600);
// a régua da borda vermelha some junto com a região: ela é andaime de autoria,
// não parte da cena
for (const [dx, bloco] of VITRINE) await dizer(`/bloco ~${dx} ~1 ~-4 ${bloco}`);
await dizer("/regiao apagar palco");
await dizer("/regiao apagar terraco");
await espera(600);
await limparChat();
await foto("07-vitrine-formas.png");

diga("== 8. o CANTEIRO de algodão: 4 estágios + o pé selvagem do gen ==");
for (const [dx] of VITRINE) await dizer(`/bloco ~${dx} ~1 ~-4 ${AR}`);
await dizer(`/bloco ~-2 ~1 ~-4 ${ALGODAO_SELVAGEM}`);
// plantados em TEMPOS diferentes: cada pulso de crescimento sobe um estágio,
// então quem entrou antes está mais maduro. É o jeito honesto de ter os 4
// estágios num print — nenhum byte é forjado.
for (const dx of [-1, 0, 1, 2]) {
  await dizer(`/bloco ~${dx} ~1 ~-4 ${ALGODAO0}`);
  await espera(CRESCIMENTO * 100 + 500);
}
await espera(600);
await limparChat();
await foto("08-canteiro-algodao.png");

diga(
  excecoes.length ? `\n✗ exceções no console: ${excecoes.join(" | ")}` : "\n✓ sem exceção no console",
);
if (excecoes.length) falhas++;
diga(falhas === 0 ? `\nSHOTS /f10 OK — ${SAIDA}` : `\nSHOTS /f10 com ${falhas} falha(s)`);
encerrar(falhas === 0 ? 0 : 1);
