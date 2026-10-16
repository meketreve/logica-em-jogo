#!/usr/bin/env node
/**
 * §🔌 A SONDA DO CIRCUITO (2026-10-16) — o 1º bloco de lógica, contra o host
 * REAL + Chrome real (CDP). Esqueleto copiado do `quebra-shot.mjs`.
 *
 * A regra da casa é que mudança de UI só está FEITA quando uma sonda a ENXERGA,
 * e aqui "enxergar" é literal: a lâmpada que acende tem de aparecer na TELA.
 * Por isso a prova central é o PIXEL — o print do CDP é decodificado aqui e a
 * luminância do pedaço onde a lâmpada está é medida antes e depois de acionar
 * a alavanca. (Ler a cor pelo canvas WebGL da página devolveria preto e o A/B
 * "passaria" com 0/0 — é o bug-540, que custou uma sessão.)
 *
 * O que ela prova, com asserção:
 * 1. as quatro peças aparecem na aba CIRCUITO da mochila;
 * 2. alavanca + fio + lâmpada: acionar a alavanca ACENDE a lâmpada na tela;
 * 3. desligar APAGA (o sinal não fica preso no fio);
 * 4. a PORTA E só deixa passar com as DUAS entradas ligadas — a tabela-verdade
 *    inteira, vista na tela;
 * 5. o aluno não planta circuito no mundo aberto sem terreno (o servidor
 *    explica no chat).
 *
 * ⚠️ Serve o cliente COMPILADO: `npm run build` antes.
 * ⚠️ Mundo descartável em `mundos/_shot-circuito` (LJ_SAVE — nunca o world.ljw).
 *
 * Uso:
 *   npm run build && npm run shots:circuito
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";
import { inflateSync } from "node:zlib";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8126;
const PORTA_CDP = 9374;
const BASE = `http://localhost:${PORTA_WS}`;
const SAIDA = process.env["SAIDA"] ?? join(process.cwd(), ".wolf/designqc-captures", "circuito");
const MUNDO = "mundos/_shot-circuito";
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
const PERFIL = mkdtempSync(join(tmpdir(), "lj-circuito-"));
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



/** Entra no mundo pelo mesmo caminho do aluno (URL com nome/pin/código). */
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

// ── medir PIXEL (copiado do `luz-shots.mjs` de propósito: cada sonda é um
// script que roda sozinho) ───────────────────────────────────────────────────
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


/** Luminância de uma janela do ÚLTIMO print, em frações da tela. */
async function brilho(x0, y0, x1, y1) {
  const r = await cdp("Page.captureScreenshot", { format: "png" });
  const img = decodificarPng(Buffer.from(r.result.data, "base64"));
  return medir(img, x0, y0, x1, y1);
}

diga(`▶ ${BASE} em ${L}×${A}\n`);
if (!(await entrar("nome=profa&pin=1234&codigo=prof2026"))) {
  console.error("✗ o mundo não ficou pronto");
  encerrar(1);
}

// ids do §🔌 (shared/src/blocks.ts) — a sonda monta o circuito por comando,
// que é o jeito de ter a MESMA cena toda rodada
const AR = 0, ALAVANCA = 256, FIO = 258, LAMPADA = 260, PORTA_E = 262;

await dizer("/modo criativo eu");
await dizer("/hora meio-dia");
await dizer("/ciclo desligar");

diga("== A: as quatro peças têm aba própria na mochila ==");
await tecla("KeyE");
await espera(700);
const abaCircuito = await avaliar(`(() => {
  const b = [...document.querySelectorAll('#inventario .inv-aba')]
    .find(e => (e.textContent || '').trim() === 'circuito');
  if (!b) return 'sem aba';
  b.click();
  return 'ok';
})()`);
ok(abaCircuito === "ok", `a aba "circuito" existe na mochila (${abaCircuito})`);
await espera(400);
// o nome visível mora num <small> dentro do botão `.inv-bloco` (inventory.ts)
const pecas = await avaliar(`[...document.querySelectorAll('#inventario .inv-grid .inv-bloco small')].map(e => (e.textContent || '').trim())`);
const nomes = (pecas ?? []).join(" ");
for (const p of ["alavanca", "fio", "lâmpada", "porta E"]) {
  ok(nomes.includes(p), `a aba mostra "${p}" (${nomes || "vazia"})`);
}
await foto("01-aba-circuito.png");
await tecla("KeyE");
await espera(400);

diga("== B: alavanca + fio + lâmpada — acender e apagar NA TELA ==");
// PALCO em coordenadas ABSOLUTAS, no céu: o terreno gerado tem casa e árvore, e
// a primeira versão desta sonda mediu a parede de uma casa achando que media a
// lâmpada (o mesmo 193,8 nas quatro linhas da tabela-verdade — número idêntico
// É o sintoma de estar medindo outra coisa).
// O `/tp` zera yaw e pitch (`teleportar`, em session/tp.ts): quem chega olha
// SEMPRE pra −Z, e a mira cai exatamente no bloco à frente de quem pisa ali.
const PX = 32, PY = 40, PZ = 32;
const Z_CIRCUITO = PZ - 3; // 3 blocos à frente
const Y_OLHO = PY + 1;
const FUNDO = 23; // obsidiana: fundo escuro pra a lâmpada ser o que há de claro
await limparChat();
for (let dx = -4; dx <= 4; dx++) {
  for (let dz = -6; dz <= 1; dz++) await dizer(`/bloco ${PX + dx} ${PY - 1} ${PZ + dz} 2`);
  for (let dy = 0; dy <= 3; dy++) await dizer(`/bloco ${PX + dx} ${PY + dy} ${PZ - 5} ${FUNDO}`);
}
// ⚠️ a alavanca LIGADA não se coloca por comando (`isPlaceable` recusa: estado
// é resultado, não escolha), e isso é o que torna esta sonda honesta — quem
// aciona é o ▣, o MESMO gesto do aluno no tablet.
const acionarAlavancaDaMira = async () => {
  // ⚠️ ESPERAR a mira reavaliar, nunca dormir um número: o rótulo do ▣ muda no
  // frame seguinte ao raycast, e tocar antes disso manda `place_block` — o tap
  // vira um bloco de grama na frente da alavanca em vez de acioná-la. Foi
  // exatamente o que fez a linha "0 E 1" desta sonda mentir na 1ª rodada.
  let rotulo = null;
  for (let i = 0; i < 40; i++) {
    rotulo = await rotuloDaAcao("colocar");
    if (rotulo === "interagir") break;
    await espera(100);
  }
  const b = await botaoDeAcao("colocar");
  if (!b) return "sem botão";
  await tocar(b.x, b.y);
  await espera(900); // o motor roda no TICK seguinte
  return rotulo;
};
await dizer(`/bloco ${PX} ${Y_OLHO} ${Z_CIRCUITO} ${ALAVANCA}`);
await dizer(`/bloco ${PX + 1} ${Y_OLHO} ${Z_CIRCUITO} ${FIO}`);
await dizer(`/bloco ${PX + 2} ${Y_OLHO} ${Z_CIRCUITO} ${LAMPADA}`);
await dizer(`/tp profa ${PX} ${PY} ${PZ}`); // mira na alavanca
await espera(900);
await limparChat();
await espera(500);
const JANELA = [0.46, 0.42, 0.72, 0.58]; // a fileira do circuito, no centro
const apagada = await brilho(...JANELA);
await foto("02-apagada.png");
const rotulo = await acionarAlavancaDaMira();
ok(rotulo === "interagir", `mirando a alavanca, o ▣ se oferece pra INTERAGIR (${rotulo})`);
await limparChat();
await espera(500);
const acesa = await brilho(...JANELA);
await foto("03-acesa.png");
ok(
  acesa.media > apagada.media + 4,
  `o toque na alavanca ACENDE a lâmpada na tela (${apagada.media.toFixed(1)} → ${acesa.media.toFixed(1)})`,
);
await acionarAlavancaDaMira(); // desliga
await limparChat();
await espera(500);
const apagouDeNovo = await brilho(...JANELA);
ok(
  apagouDeNovo.media < acesa.media - 4,
  `e o toque de novo APAGA (${acesa.media.toFixed(1)} → ${apagouDeNovo.media.toFixed(1)})`,
);
await foto("04-apagou-de-novo.png");

diga("== C: a PORTA E — a tabela-verdade na tela ==");
// ⚠️ O ARRANJO é metade do teste, e a 1ª versão errou: com as alavancas ao lado
// da lâmpada, a janela de medida pegava o BRILHO DA ALAVANCA ligada e a
// "tabela-verdade" dava certo sem a porta fazer nada. Agora a lâmpada fica
// SOZINHA no pedaço medido (à direita), e as duas entradas chegam por FIO,
// vindas de alavancas fora da janela.
//
//   planta (câmera embaixo, olhando pra cima do desenho):
//        z-1   [fio]─[fio]─[fio]──┐
//        z0           [E]→[LÂMPADA]      ← só isto entra na janela
//        z+1          [fio]
//        z+2    alavanca B   alavanca A
const Z0 = PZ - 4;
for (let dx = -4; dx <= 3; dx++) {
  for (let dz = -6; dz <= 0; dz++) await dizer(`/bloco ${PX + dx} ${Y_OLHO} ${PZ + dz} 0`);
}
await dizer(`/bloco ${PX} ${Y_OLHO} ${Z0} ${PORTA_E}`); // frente = +x (a saída)
await dizer(`/bloco ${PX + 1} ${Y_OLHO} ${Z0} ${LAMPADA}`); // a saída, sozinha na janela
// entrada A: fio reto vindo da alavanca mais perto da câmera
await dizer(`/bloco ${PX} ${Y_OLHO} ${Z0 + 1} ${FIO}`);
await dizer(`/bloco ${PX} ${Y_OLHO} ${Z0 + 2} ${ALAVANCA}`);
// entrada B: fio pela esquerda, até uma alavanca em outra coluna (as duas
// redes NÃO se tocam — senão as entradas seriam sempre iguais e a porta E
// pareceria funcionar sem ser testada)
for (const dx of [0, -1, -2]) await dizer(`/bloco ${PX + dx} ${Y_OLHO} ${Z0 - 1} ${FIO}`);
await dizer(`/bloco ${PX - 3} ${Y_OLHO} ${Z0 - 1} ${FIO}`);
await dizer(`/bloco ${PX - 3} ${Y_OLHO} ${Z0} ${FIO}`);
await dizer(`/bloco ${PX - 3} ${Y_OLHO} ${Z0 + 1} ${FIO}`);
await dizer(`/bloco ${PX - 3} ${Y_OLHO} ${Z0 + 2} ${ALAVANCA}`);
await espera(700);
// a janela cobre SÓ a lâmpada (uma coluna à direita do centro)
const SO_A_LAMPADA = [0.54, 0.44, 0.68, 0.56];
/** Aciona a alavanca da coluna `x` (teleporta pra frente dela e toca o ▣). */
const virar = async (x) => {
  await dizer(`/tp profa ${x} ${PY} ${PZ}`);
  await espera(800);
  const r = await acionarAlavancaDaMira();
  ok(r === "interagir", `acionou a alavanca da coluna x=${x} (${r})`);
};
/** Mede SEMPRE da mesma posição, senão as 4 linhas não se comparam. */
const medirDoCentro = async () => {
  await dizer(`/tp profa ${PX} ${PY} ${PZ}`);
  await espera(800);
  await limparChat();
  await espera(500);
  return (await brilho(...SO_A_LAMPADA)).media;
};
const m00 = await medirDoCentro();
await foto("05-nenhuma.png");
await virar(PX); // alavanca A (entrada de cima)
const m10 = await medirDoCentro();
await foto("06-uma-so.png");
await virar(PX - 3); // alavanca B
const m11 = await medirDoCentro();
await foto("07-as-duas.png");
await virar(PX); // desliga A: sobra só B
const m01 = await medirDoCentro();
await foto("08-a-outra-so.png");
diga(`  luminância da lâmpada: 0E0=${m00.toFixed(1)} 1E0=${m10.toFixed(1)} 1E1=${m11.toFixed(1)} 0E1=${m01.toFixed(1)}`);
ok(m11 > m00 + 4, `1 E 1 ACENDE (${m00.toFixed(1)} → ${m11.toFixed(1)})`);
ok(m10 < m00 + 4, `1 E 0 NÃO acende (${m10.toFixed(1)})`);
ok(m01 < m00 + 4, `0 E 1 NÃO acende (${m01.toFixed(1)})`);

diga("== D: no mundo aberto, o aluno só planta circuito no terreno DELE ==");
await dizer("/terreno ligar");
await dizer("/modo sobrevivencia eu");
await espera(400);
await limparChat();
// a profa é professora: ela passa no gate. Quem tem de ser barrado é o ALUNO —
// e esta sonda tem um navegador só, então a prova aqui é a do COMANDO: a regra
// responde no chat de quem for barrado (o `circuitos.session.test.ts` cobre os
// dois papéis com a sessão de verdade).
const respostaProfa = await avaliar(`[...document.querySelectorAll('#chat-log .msg')].map(d => d.textContent).join(' | ')`);
ok(
  !/SEU terreno/.test(respostaProfa ?? ""),
  "a professora NÃO é barrada (é ela quem prepara a aula)",
);
await foto("07-terreno.png");

diga(excecoes.length ? `✗ exceções: ${excecoes.join(" | ")}` : "✓ sem exceção no console");
if (excecoes.length) falhas++;
diga(falhas ? `\n✗ ${falhas} falha(s)` : "\n✓ tudo certo");
encerrar(falhas ? 1 : 0);
