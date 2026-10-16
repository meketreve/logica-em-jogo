#!/usr/bin/env node
/**
 * Print + medição do PAINEL DE AMIGOS (2026-08-04) — a interface do `/amigos`.
 *
 * Amigos só existe com gente na aula, então o script sobe um host Node de
 * verdade e põe DUAS alunas de mentira (bia e caio, clientes ws puros) na sala
 * antes de abrir o navegador como "ana". Fotografa os dois estados que o painel
 * tem: (A) convite recebido, sem grupo · (B) dona de um grupo de 2, com
 * expulsar e "sair e DESFAZER".
 *
 * ⚠️ Ele serve o cliente COMPILADO (o host Node serve `client/dist`): rode
 * `npm run build` antes, senão a página não existe.
 * ⚠️ PRECISA do Chrome em `~/.cache/puppeteer/chrome` (ou `CHROME=`).
 *
 * Uso:
 *   npm run build && npm run shots:amigos     # 1024×600 (Kindle Fire), coarse
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { connect } from "node:net";

const L = Number(process.argv[2] ?? 1024);
const A = Number(process.argv[3] ?? 600);
const PORTA_WS = 8106;
const BASE = process.env["BASE"] ?? `http://localhost:${PORTA_WS}`;
const SAIDA = join(process.cwd(), ".wolf/designqc-captures", "amigos");
const PORTA_CDP = 9356;
const MUNDO = "mundos/_shot-amigos";
mkdirSync(SAIDA, { recursive: true });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

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
    LJ_SEED: "20260710",
    LJ_CODIGO: "prof2026",
  },
  detached: true,
  stdio: ["ignore", "ignore", "pipe"],
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
function encerrar(codigo) {
  try {
    process.kill(-servidor.pid, "SIGTERM");
  } catch {
    /* já morreu */
  }
  // o host GRAVA o mundo ao receber o SIGTERM: apagar na hora deixa a pasta
  // renascer atrás do rm. Dá 1 s pro autosave fechar e só então limpa.
  setTimeout(() => {
    rmSync(join(process.cwd(), MUNDO), { recursive: true, force: true });
    process.exit(codigo);
  }, 1000);
}
// qualquer erro daqui pra frente mata o host junto — servidor de teste
// esquecido no ar é o que a sessão 32 aprendeu a não deixar
process.on("uncaughtException", (e) => {
  console.error(e);
  encerrar(1);
});
process.on("unhandledRejection", (e) => {
  console.error(e);
  encerrar(1);
});
if (!(await esperaPorta(PORTA_WS))) {
  console.error("o host não subiu na porta", PORTA_WS);
  encerrar(1);
}

/** Aluna de mentira: entra, se mexe (é o `move` que ensina o nome aos outros)
 *  e obedece comandos de chat que o script mandar. */
function aluna(name, pin, codigo) {
  const ws = new WebSocket(`ws://localhost:${PORTA_WS}`);
  ws.binaryType = "arraybuffer";
  const rec = { ws, chats: [] };
  // `codigo` promove a PROFESSORA (session.ts: authenticate) — é o que permite
  // criar grupos de aula sem um segundo navegador
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", name, pin, ...(codigo ? { codigo } : {}) }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    // bug-672: um cliente de verdade RESPONDE o ping — sem isto o host derruba
    // este cenário em 15 s de espera (cozimento, crescimento, streaming…)
    if (m.type === "ping") ws.send(JSON.stringify({ type: "pong", t: m.t }));
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "spawn") {
      // presença emerge do move: sem isto ana nunca fica sabendo que ela existe
      const mover = () =>
        ws.send(JSON.stringify({ type: "move", x: m.x, y: m.y, z: m.z, yaw: 0, pitch: 0 }));
      mover();
      rec.timer = setInterval(mover, 500);
    }
  };
  rec.cmd = (text) => ws.send(JSON.stringify({ type: "chat", text }));
  return rec;
}
const bia = aluna("bia", "2222");
const caio = aluna("caio", "3333");
const dani = aluna("dani", "4444", "prof2026"); // a professora da seção D
await espera(1500);

// --- navegador como "ana" ---
// libs do chrome extraídas sem sudo (bug-564): se o prefixo local existir, ele
// entra no LD_LIBRARY_PATH — é o que faz o print rodar no notebook da escola.
const LIBS = join(homedir(), ".local/chrome-libs/usr/lib/x86_64-linux-gnu");
// Perfil temporário do Chrome (2026-10-10): são ~57 MB por rodada em /tmp e
// ninguém os apagava — o `exit` cobre tanto o fim normal quanto o
// `process.exit()` do encerrar(). E Ctrl+C passa pelo encerrar() também: matar
// só ESTE processo deixava o Chrome órfão segurando memória por horas.
const PERFIL = mkdtempSync(join(tmpdir(), "lj-amigos-"));
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

const chrome = spawn(
  acharChrome(),
  [
    "--headless=new", "--no-sandbox", "--disable-gpu", "--enable-unsafe-swiftshader",
    `--window-size=${L},${A}`, `--remote-debugging-port=${PORTA_CDP}`,
    `--user-data-dir=${PERFIL}`, "about:blank",
  ],
  {
    detached: true, stdio: ["ignore", "ignore", "pipe"],
    env: existsSync(LIBS)
      ? { ...process.env, LD_LIBRARY_PATH: `${LIBS}:${process.env["LD_LIBRARY_PATH"] ?? ""}` }
      : process.env,
  },
);
async function abrirAba() {
  for (let i = 0; i < 40; i++) {
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
const cdp = (method, params = {}) =>
  new Promise((r) => {
    const meu = ++id;
    pend.set(meu, r);
    ws.send(JSON.stringify({ id: meu, method, params }));
  });
const avaliar = async (expr) =>
  (await cdp("Runtime.evaluate", { expression: expr, returnByValue: true })).result?.result?.value;
const tecla = (code) =>
  avaliar(
    `window.dispatchEvent(new KeyboardEvent('keydown', { code: ${JSON.stringify(code)}, bubbles: true })), 1`,
  );
/** Clica o botão `rotulo` DA LINHA de um jogador (o rótulo sozinho pegaria o
 *  primeiro da lista, que pode ser outra pessoa). `dobro` = botão armado. */
const clicarNaLinha = (nome, rotulo, dobro = false) =>
  avaliar(`(() => {
  const linha = [...document.querySelectorAll('#painel .jog-row')]
    .find(r => (r.querySelector('.jog-nome')?.textContent ?? '').startsWith(${JSON.stringify(nome)}));
  if (!linha) return 'sem linha de ' + ${JSON.stringify(nome)};
  const b = [...linha.querySelectorAll('button')]
    .find(x => x.textContent.startsWith(${JSON.stringify(rotulo)}));
  if (!b) return 'sem botão ' + ${JSON.stringify(rotulo)};
  b.click(); ${dobro ? "b.click();" : ""} return 'ok';
})()`);
/** Rótulos dos botões do painel — o texto inteiro tem a DICA do chat, que cita
 *  todos os subcomandos e faria qualquer `includes("expulsar")` passar sozinho. */
const botoes = () =>
  avaliar(`[...document.querySelectorAll('#painel button')].map(b => b.textContent)`);
const texto = () => avaliar(`document.getElementById('painel')?.innerText ?? ''`);
const foto = async (nome) => {
  const r = await cdp("Page.captureScreenshot", { format: "png" });
  if (!r.result?.data) return;
  const buf = Buffer.from(r.result.data, "base64");
  writeFileSync(join(SAIDA, nome), buf);
  console.log(`  ✓ ${nome} (${(buf.length / 1024).toFixed(0)} KB) em ${SAIDA}`);
};

await cdp("Runtime.enable");
await cdp("Page.enable");
await cdp("Emulation.setDeviceMetricsOverride", { width: L, height: A, deviceScaleFactor: 1, mobile: true });
await cdp("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await cdp("Emulation.setEmulatedMedia", {
  features: [
    { name: "pointer", value: "coarse" },
    { name: "any-pointer", value: "coarse" },
  ],
});

await cdp("Page.navigate", { url: `${BASE}/?server=ws://localhost:${PORTA_WS}&nome=ana&pin=1111` });
for (let i = 0; i < 90; i++) {
  await espera(1000);
  if (await avaliar(`!!document.querySelector('#hotbar .slot') && !document.getElementById('load-tela')`)) break;
}
await avaliar(`document.getElementById('overlay-voltar')?.click()`);
await espera(1500);

let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};

console.log("== A: a tecla abre o painel, com o convite de bia à espera ==");
// bia convida DEPOIS de ana entrar: o servidor recusa convite a quem nunca
// esteve na aula (`nomeConhecido`), e o painel mostraria uma tela vazia
bia.cmd("/amigos convidar ana");
await espera(700);
await tecla("KeyG");
await espera(600);
// AMIGOS virou ABA do #painel (2026-10-15, unificação pedida pelo usuário): a
// tecla G abre o MESMO painel da aula, já na aba certa. ana é ALUNA e esta aula
// não tem grupos, então a aba da aula nem existe (seria um beco que só sabe
// dizer "o professor ainda não criou grupos") e o painel abre sem barra de abas.
const aberto = await avaliar(`(() => {
  const p = document.getElementById('painel');
  if (!p || p.classList.contains('hidden')) return 'fechado';
  const barra = p.querySelector('.painel-abas');
  const ativa = p.querySelector('[data-aba].aba-ativa');
  if (!barra) return 'aba unica';
  return ativa?.dataset.aba === 'amigos' ? 'aba amigos' : 'aba ' + ativa?.dataset.aba;
})()`);
ok(
  aberto === "aba unica" || aberto === "aba amigos",
  `a tecla G abriu o painel na aba de amigos (${aberto})`,
);
const a = (await texto()) ?? "";
ok(a.includes("bia convidou você"), "o convite de bia aparece na tela");
const btnA = (await botoes()) ?? [];
ok(btnA.includes("aceitar") && btnA.includes("recusar"), "com os botões aceitar e recusar");
ok(a.includes("caio"), "caio (online, sem grupo) aparece na lista de convidar");
const alvos = await avaliar(`(() => {
  const bs = [...document.querySelectorAll('#painel button')];
  return bs.length ? Math.min(...bs.map(b => Math.round(b.getBoundingClientRect().height))) : 0;
})()`);
ok(alvos >= 40, `menor alvo de toque do painel = ${alvos}px (piso de 40 em pointer:coarse)`);
await foto("amigos-convite.png");

console.log("== B: recusa o convite, convida caio e vira DONA do grupo ==");
ok((await clicarNaLinha("bia", "recusar")) === "ok", "recusou o convite de bia");
await espera(700);
ok((await clicarNaLinha("caio", "convidar")) === "ok", "convidou caio pela linha dele");
await espera(700);
const b1 = (await texto()) ?? "";
ok(b1.includes("caio — convite enviado"), "o convite enviado aparece como aguardando");
caio.cmd("/amigos aceitar ana");
await espera(1000);
const b = (await texto()) ?? "";
ok(b.includes("grupo de ana — 2/6"), `o painel mostra o grupo e o teto — "${(/grupo de .*/.exec(b) ?? ["?"])[0]}"`);
ok(b.includes("ana (dono, você)"), "a dona do grupo está marcada");
const btnB = (await botoes()) ?? [];
ok(btnB.includes("expulsar"), "a dona tem o BOTÃO de expulsar quem entrou");
ok(
  btnB.some((t) => t.includes("DESFAZER")),
  "e o botão de sair avisa que DESFAZ o grupo",
);
await foto("amigos-grupo.png");

console.log("== D: com grupos de aula, a ALUNA ganha a BARRA DE ABAS (2026-10-15) ==");
// O caminho que nenhuma sonda via: a barra de abas do ALUNO. O `toque-shot`
// mede o painel do PROFESSOR (autoria|amigos) e a seção A acima mede a aluna
// SEM grupos, que tem uma aba só — de propósito, porque uma aba "aula" que só
// sabe dizer "o professor ainda não criou grupos" é um beco. Faltava o meio:
// aluna COM grupos, que é o estado de toda aula de verdade.
dani.cmd("/grupo criar 2");
await espera(1200);
const abas = await avaliar(`(() => {
  const p = document.getElementById('painel');
  if (!p || p.classList.contains('hidden')) return 'painel fechado';
  const bs = [...p.querySelectorAll('.painel-abas [data-aba]')];
  return { ids: bs.map(b => b.dataset.aba), ativa: bs.find(b => b.classList.contains('aba-ativa'))?.dataset.aba ?? null };
})()`);
ok(
  abas && abas.ids && abas.ids.join(",") === "aula,amigos",
  `a barra tem as duas abas, a da aula primeiro (${abas?.ids?.join(",") ?? abas})`,
);
ok(abas?.ativa === "amigos", `e a aba de AMIGOS continua a que está à vista (${abas?.ativa})`);
// trocar de aba NÃO fecha o painel nem perde o grupo de amigos montado em B
const trocou = await avaliar(`(() => {
  document.querySelector('#painel [data-aba="aula"]')?.click();
  const p = document.getElementById('painel');
  return {
    aberto: !p.classList.contains('hidden'),
    ativa: p.querySelector('[data-aba].aba-ativa')?.dataset.aba ?? null,
    texto: p.innerText,
  };
})()`);
ok(trocou?.ativa === "aula", `o toque na aba "aula" trocou de aba (${trocou?.ativa})`);
ok(trocou?.aberto === true, "e o painel continuou aberto (é troca de aba, não fechar e abrir)");
ok(/grupo 1/.test(trocou?.texto ?? ""), "a aba da aula mostra os grupos que a professora criou");
const voltou = await avaliar(`(() => {
  document.querySelector('#painel [data-aba="amigos"]')?.click();
  const p = document.getElementById('painel');
  return p.innerText;
})()`);
ok(/grupo de ana/.test(voltou ?? ""), "e voltar pra aba de amigos reencontra o grupo de ana intacto");
await foto("amigos-abas-aluna.png");
// UMA REGRA PRAS TRÊS PORTAS (2026-10-15): a porta da aba que está à vista
// FECHA, a de outra aba TROCA. Antes da unificação cada porta abria um painel
// diferente, então "a tecla P fecha o painel" era sempre certo; com abas, P
// (e o 📋) com a aba de amigos na tela fechava a tela que o aluno acabara de
// pedir. A aba de amigos está à vista agora (o `voltou` acima).
await tecla("KeyP");
await espera(400);
const pTrocou = await avaliar(`(() => {
  const p = document.getElementById('painel');
  if (!p || p.classList.contains('hidden')) return 'FECHOU';
  return p.querySelector('[data-aba].aba-ativa')?.dataset.aba ?? 'sem aba';
})()`);
ok(pTrocou === "aula", `a tecla P com a aba de amigos à vista TROCA pra aula (${pTrocou})`);
await tecla("KeyP");
await espera(400);
const pFechou = await avaliar(`document.getElementById('painel')?.classList.contains('hidden')`);
ok(pFechou === true, "e a tecla P na aba que já está à vista fecha o painel");
await tecla("Escape");
await espera(400);

console.log("== C: o painel de comandos do chat visto por um ALUNO (2026-10-15) ==");
// Por que AQUI e não no `toque-shot`: a ana desta sonda é a única cliente de
// navegador do projeto que entra SEM o código de professor — ou seja, a única
// que vê a árvore de comandos como a turma vê. O `toque-shot` entra com
// `?codigo=prof2026` (é o que destrava o `/dar`) e mede a lista do PROFESSOR.
//
// A queixa da escola era "os botões de comando ficam escondidos atrás do
// teclado no mobile": a geometria estava certa (o `toque-shot` mede a caixa
// acima da linha do teclado com 280, 460 e 600px de teclado), o que não estava
// era a LISTA — 26 botões para todo mundo, e os 10 que o servidor aceita de um
// aluno espalhados por ela, os últimos atrás de uma rolagem.
await tecla("Escape"); // fecha o painel: o chat não abre com menu na tela
await espera(400);
await avaliar(`document.getElementById('chat-input')?.classList.contains('hidden') === false
  || window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', bubbles: true }))`);
await espera(600);
const KB_ALUNO = 280; // o mesmo teclado medido no tablet da escola, deitado
await avaliar(`document.documentElement.style.setProperty('--kb', '${KB_ALUNO}px')`);
await espera(300);
const cmd = await avaliar(`(() => {
  const p = document.getElementById('chat-painel');
  if (!p) return 'AUSENTE';
  const rp = p.getBoundingClientRect();
  const bs = [...p.querySelectorAll('button')];
  return {
    rotulos: bs.map(b => b.textContent),
    // "a vista" = desenhado DENTRO da caixa (ela rola) e dentro da janela
    aVista: bs.filter(b => {
      const r = b.getBoundingClientRect();
      return r.top >= rp.top - 1 && r.bottom <= rp.bottom + 1 && r.top >= 0;
    }).length,
    caixaFundo: Math.round(rp.bottom),
  };
})()`);
ok(cmd !== "AUSENTE" && typeof cmd === "object", "o painel de comandos do chat apareceu pra aluna");
if (cmd && typeof cmd === "object") {
  const DO_PROFESSOR = ["/confinar", "/silenciar", "/regiao", "/objetivo", "/dar", "/tp", "/bloco",
                        "/aula", "/iniciar", "/invisivel", "/ciclo", "/vento", "/voo", "/mundo",
                        "/expulsar", "/redefinirpin"];
  const vazou = DO_PROFESSOR.filter((c) => cmd.rotulos.includes(c));
  ok(vazou.length === 0, `nenhum comando de professor na lista da aluna (${vazou.join(" ") || "nenhum"})`);
  const DELA = ["/painel", "/amigos", "/grupo", "/terreno", "/tpp", "/tpa", "/hora", "/modo", "/regra", "/pvp"];
  const faltam = DELA.filter((c) => !cmd.rotulos.includes(c));
  ok(faltam.length === 0, `os dez comandos dela estão na lista (faltam: ${faltam.join(" ") || "nenhum"})`);
  // ⚠️ A ASSERÇÃO DA QUEST: todos à vista SEM ROLAR, com o teclado aberto. É o
  // que o filtro por papel compra — com os 26 do professor, 5 ficavam fora.
  ok(
    cmd.aVista === cmd.rotulos.length,
    `todos os comandos da aluna à vista sem rolar com o teclado aberto (${cmd.aVista} de ${cmd.rotulos.length})`,
  );
  ok(
    cmd.caixaFundo <= A - KB_ALUNO,
    `a caixa de comandos termina acima do teclado (fundo ${cmd.caixaFundo} <= ${A - KB_ALUNO})`,
  );
}
await foto("amigos-comandos-aluna.png");
// LISTA GANHA DE DIGITAÇÃO (pedido do usuário): tocar num comando que pede NOME
// tem de trocar os botões pela TURMA, não jogar o aluno de volta no teclado.
const toqueNoPainel = (nome) =>
  avaliar(`(() => {
    const p = document.getElementById('chat-painel');
    const b = [...p.querySelectorAll('button')].find(e => e.textContent === ${JSON.stringify(nome)});
    if (!b) return 'sem botao ' + ${JSON.stringify(nome)};
    b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
    return 'ok';
  })()`);
const rotulos = () =>
  avaliar(`[...document.querySelectorAll('#chat-painel button')].map(b => b.textContent)`);
ok((await toqueNoPainel("/tpp")) === "ok", "tocou em /tpp no painel de comandos");
await espera(400);
const apos = (await rotulos()) ?? [];
ok(
  apos.includes("bia") && apos.includes("caio"),
  `o /tpp trocou os botões pela TURMA (${apos.join(" ")})`,
);
const campo = await avaliar(`document.getElementById('chat-input')?.value ?? ''`);
ok(campo === "", `e não jogou o aluno de volta no teclado (campo: "${campo}")`);
ok(apos.includes("/tpp"), "o caminho navegado fica à mostra pra voltar atrás");
// tocar no NOME manda o comando inteiro
ok((await toqueNoPainel("bia")) === "ok", "tocou no nome da colega");
await espera(700);
const pediu = await avaliar(
  `[...document.querySelectorAll('#chat-log .msg')].some(d => /teleport|pedido|bia/i.test(d.textContent || ''))`,
);
ok(pediu === true, "o toque no nome ENVIOU /tpp bia (o servidor respondeu)");
await foto("amigos-comandos-tpp.png");
// o /tpa segue a MESMA regra desde 2026-10-15 (antes era a exceção que mandava
// sozinho): com gente online ele LISTA, e o toque no nome aceita o pedido
// daquela pessoa — importa quando dois colegas pedem ao mesmo tempo
await tecla("Enter"); // o envio do /tpp fechou o chat
await espera(500);
ok((await toqueNoPainel("/tpa")) === "ok", "tocou em /tpa no painel");
await espera(400);
const aposTpa = (await rotulos()) ?? [];
ok(
  aposTpa.includes("bia") && aposTpa.includes("caio"),
  `o /tpa também trocou os botões pela turma (${aposTpa.join(" ")})`,
);
await foto("amigos-comandos-tpa.png");
await avaliar(`document.documentElement.style.removeProperty('--kb')`);

console.log(excecoes.length ? `✗ exceções: ${excecoes.join(" | ")}` : "✓ sem exceção no console");
if (excecoes.length) falhas++;
for (const c of [bia, caio, dani]) {
  clearInterval(c.timer);
  c.ws.close();
}
ws.close();
matarChrome();
console.log(falhas === 0 ? "\nPAINEL DE AMIGOS OK" : `\nFALHOU (${falhas})`);
encerrar(falhas === 0 ? 0 : 1);
