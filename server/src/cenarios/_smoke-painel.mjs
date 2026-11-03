/**
 * Smoke do PAINEL do professor (§🖥️, 2026-11-03).
 *
 * Sobe o painel DO MESMO JEITO que os launchers (`node --import tsx
 * server/src/painel.ts`) e confere o que o professor não vê e a escola sofreria:
 *
 *  1. o painel é SÓ deste PC: pelo IP da rede ele nem conecta (e o JOGO, pelo
 *     mesmo IP, conecta — é o controle negativo: o IP alcança, quem recusa é o
 *     painel); `Host` de fora e ação sem o cabeçalho da página = 403;
 *  2. as regras que vieram do menu de texto: nome "aula…" e "_…" recusados no
 *     criar, plano gigante recusado, publicar FORÇA o prefixo e não sobrescreve
 *     sem pedir;
 *  3. o ciclo da aula: abrir → no ar → aluno entra e APARECE na lista → recado
 *     chega no chat dele → "atualizar" recusado com aula rodando → parar GRAVA
 *     o mundo → Ctrl+C no painel com aula no ar grava e não deixa o jogo órfão.
 *
 *   node server/src/cenarios/_smoke-painel.mjs 8114     (o jogo usa a porta+1)
 */
import { spawn } from "node:child_process";
import { existsSync, rmSync, statSync } from "node:fs";
import { request } from "node:http";
import { connect } from "node:net";
import { networkInterfaces } from "node:os";

const PORTA = Number(process.argv[2] ?? 8114);
const PORTA_JOGO = PORTA + 1;
const BASE = `http://127.0.0.1:${PORTA}`;
// sem "_": o painel recusa (é o prefixo dos mundos de teste, escondidos dele);
// por isso o smoke limpa o próprio rastro no começo e no fim
const NOME = "smoke-painel-tmp";
const PASTA = `mundos/${NOME}`;
const SAVE = `${PASTA}/${NOME}.ljw`;
const PUBLICADA = "cenarios/aula-smoke-painel-pub.ljw";
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const limpar = () => {
  rmSync(PASTA, { recursive: true, force: true });
  rmSync(PUBLICADA, { force: true });
};
limpar();

const tcp = (host, porta) =>
  new Promise((r) => {
    const s = connect({ port: porta, host });
    s.setTimeout(2000, () => (s.destroy(), r(false)));
    s.once("connect", () => (s.destroy(), r(true)));
    s.once("error", () => (s.destroy(), r(false)));
  });
async function ate(ler, satisfeito, ms) {
  const fim = Date.now() + ms;
  let v = await ler();
  while (!satisfeito(v) && Date.now() < fim) {
    await espera(200);
    v = await ler();
  }
  return v;
}

function sobePainel() {
  const proc = spawn(process.execPath, ["--import", "tsx", "server/src/painel.ts"], {
    env: { ...process.env, LJ_PAINEL_PORTA: String(PORTA), LJ_PORT: String(PORTA_JOGO), LJ_SEM_NAVEGADOR: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let saida = "";
  proc.stdout.on("data", (d) => (saida += d));
  proc.stderr.on("data", (d) => (saida += d));
  const morreu = new Promise((r) => proc.once("exit", (c) => r(c)));
  return { proc, log: () => saida, morreu };
}
const estado = async () => (await fetch(`${BASE}/api/estado`)).json();
const acao = async (rota, corpo = {}, cabecalho = true) => {
  const r = await fetch(`${BASE}/api/${rota}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(cabecalho ? { "x-lj-painel": "1" } : {}) },
    body: JSON.stringify(corpo),
  });
  return { status: r.status, ...(await r.json().catch(() => ({}))) };
};

let painel = sobePainel();
if (!(await ate(() => tcp("127.0.0.1", PORTA), Boolean, 20000))) {
  console.log(painel.log());
  ok(false, "o painel subiu");
  process.exit(1);
}

console.log("== 1. só este PC ==");
const ipRede = Object.values(networkInterfaces()).flat().find((p) => p && p.family === "IPv4" && !p.internal)?.address;
if (ipRede) ok(!(await tcp(ipRede, PORTA)), `pelo IP da rede (${ipRede}) o painel NÃO conecta`);
else console.log("  (sem IP de rede nesta máquina — o teste do IP fica pro passo do jogo)");
// `fetch` ignora o cabeçalho Host (proibido) — o pedido cru é que prova
const comHost = (host) =>
  new Promise((r) => {
    const q = request({ host: "127.0.0.1", port: PORTA, path: "/", headers: { host } }, (res) => (res.resume(), r(res.statusCode)));
    q.on("error", () => r(null));
    q.end();
  });
ok((await comHost(`evil.example:${PORTA}`)) === 403, "Host de outro nome (DNS rebinding) = 403");
ok((await comHost(`localhost:${PORTA}`)) === 200, "e o mesmo pedido com Host localhost = 200 (controle)");
const semCab = await acao("parar", {}, false);
ok(semCab.status === 403, "ação sem o cabeçalho da página = 403");
const pagina = await (await fetch(`${BASE}/`)).text();
ok(pagina.includes("Dúvidas?") && pagina.includes("/docs/manual.html"), 'a página tem o "Dúvidas? Clique aqui!" apontando o manual');
const manual = await fetch(`${BASE}/docs/manual.html`);
ok(manual.status === 200, "o manual é servido pelo painel (abre sem internet)");
const fuga = await fetch(`${BASE}/docs/..%2f..%2fpackage.json`);
ok(fuga.status === 403 || fuga.status === 404, `caminho que foge de docs/ é recusado (${fuga.status})`);

console.log("== 2. as regras do menu de texto ==");
let e = await estado();
ok(e.aulas.filter((a) => a.numero).length === 8, `as 8 aulas do pacote viram cartão (${e.aulas.length})`);
ok(e.aulas.find((a) => a.numero === 8)?.titulo === "Acenda só as lâmpadas certas", "com o título do manual");
ok(!e.mundos.some((m) => m.nome.startsWith("_")), "mundo de teste (_…) não aparece");
ok(e.jogo === null, "nada no ar antes de o professor escolher");
let r = await acao("criar", { tipo: "plano", nome: "aula-minha", tamanho: "P" });
ok(r.status === 400 && /aula/.test(r.erro), 'criar com nome "aula…" é recusado (não salvaria nada)');
r = await acao("criar", { tipo: "plano", nome: "_escondido", tamanho: "P" });
ok(r.status === 400, 'criar com nome "_…" é recusado');
r = await acao("criar", { tipo: "plano", nome: "plano-gigante", tamanho: "E" });
ok(r.status === 400, "plano GIGANTE é recusado (o E ignora o preset e devolveria morro)");
r = await acao("abrir", { caminho: "../../etc/passwd" });
ok(r.status === 400, "abrir caminho que não está nas listas é recusado");

console.log("== 3. o ciclo da aula ==");
r = await acao("criar", { tipo: "normal", nome: NOME, tamanho: "P" });
ok(r.status === 200, "criar mundo normal P");
e = await ate(estado, (v) => v.jogo?.estado === "no-ar", 60000);
ok(e.jogo?.estado === "no-ar", `o jogo ficou no ar (${e.jogo?.rotulo})`);
ok(typeof e.jogo?.codigo === "string" && e.jogo.codigo.length > 0, "o painel sabe o código do professor");
ok(e.endereco.endsWith(`:${PORTA_JOGO}`), `o endereço pros alunos aponta pro jogo (${e.endereco})`);
if (ipRede) ok(await tcp(ipRede, PORTA_JOGO), "pelo IP da rede o JOGO conecta (controle: o IP alcança, quem recusa é o painel)");

const recados = [];
const ana = new WebSocket(`ws://127.0.0.1:${PORTA_JOGO}`);
let anaFechou = false;
ana.onopen = () => ana.send(JSON.stringify({ type: "join", name: "ana", pin: "1111" }));
ana.onmessage = (ev) => {
  if (typeof ev.data !== "string") return;
  const m = JSON.parse(ev.data);
  if (m.type === "ping") ana.send(JSON.stringify({ type: "pong", t: m.t }));
  if (m.type === "chat") recados.push(m.text);
};
ana.onclose = () => (anaFechou = true);
e = await ate(estado, (v) => v.jogo?.jogadores?.some((j) => j.nome === "ana"), 5000);
ok(e.jogo?.jogadores?.some((j) => j.nome === "ana" && j.papel === "aluno"), "a aluna aparece na lista de conectados");

r = await acao("falar", { texto: "guardem os tablets em 5 minutos" });
const chegou = await ate(async () => recados.some((t) => t.includes("guardem os tablets")), Boolean, 3000);
ok(r.status === 200 && chegou, "o recado do painel chega no chat da aluna");

r = await acao("atualizar");
ok(r.status === 409, "atualizar com aula rodando é recusado (reiniciaria o servidor)");

r = await acao("parar");
e = await estado();
ok(r.status === 200 && e.jogo === null, "parar tira o jogo do ar");
ok(existsSync(SAVE), "parar GRAVOU o mundo");
ok(await ate(async () => anaFechou, Boolean, 3000), "a conexão da aluna caiu junto");
ok(!(await tcp("127.0.0.1", PORTA_JOGO)), "a porta do jogo ficou livre");

r = await acao("publicar", { origem: SAVE, nome: "smoke-painel-pub" });
ok(r.status === 200 && r.caminho === PUBLICADA && r.prefixoForcado === true, `publicar FORÇA o prefixo "aula" (${r.caminho})`);
r = await acao("publicar", { origem: SAVE, nome: "aula-smoke-painel-pub" });
ok(r.status === 400 && r.existe === true, "publicar por cima de uma aula existente pede confirmação");
e = await estado();
ok(e.aulas.some((a) => a.caminho === PUBLICADA && !a.doPacote), "a aula publicada vira cartão");

console.log("== 4. Ctrl+C com aula no ar ==");
r = await acao("abrir", { caminho: SAVE });
e = await ate(estado, (v) => v.jogo?.estado === "no-ar", 60000);
ok(e.jogo?.estado === "no-ar", "reabriu o mundo salvo");
const antes = statSync(SAVE).mtimeMs;
await espera(50);
painel.proc.kill("SIGINT");
const cod = await Promise.race([painel.morreu, espera(15000).then(() => "prazo")]);
ok(cod === 0, `o painel saiu limpo (código ${cod})`);
ok(statSync(SAVE).mtimeMs > antes, "o mundo foi gravado no Ctrl+C");
ok(!(await tcp("127.0.0.1", PORTA_JOGO)), "e o jogo não ficou órfão segurando a porta");

limpar();
console.log(falhas === 0 ? "✓ painel OK" : `✗ painel: ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
