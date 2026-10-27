/**
 * Smoke do `/perfil` (2026-10-27) — o professor manda a turma gravar o perfil
 * do F3 sem ninguém apertar botão. Prova o caminho de host de ponta a ponta:
 * o pedido chega a QUEM tem de chegar (todos menos quem pediu, ou um nome só),
 * a resposta carimbada com o lote vira `perf-turma-<lote>-` em `profiles/`, e
 * lote forjado pelo cliente NÃO entra no nome do arquivo.
 *
 * Os "alunos" aqui respondem o pedido como o `main.ts` responde
 * (`gravarPerfilPedido`): devolvem `profile_report` com `stats.pedido.lote`.
 *
 *   LJ_SAVE=mundos/_smoke-perfil-turma.ljw LJ_NOVO=1 LJ_CODIGO=prof2026 LJ_PORT=8112 npm run start -w server
 *   node server/src/cenarios/_smoke-perfil-turma.mjs 8112
 */
import { existsSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
const PASTA = resolve(dirname(fileURLToPath(import.meta.url)), "../../../profiles");
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};

const antes = new Set(existsSync(PASTA) ? readdirSync(PASTA) : []);
const novos = () => (existsSync(PASTA) ? readdirSync(PASTA).filter((f) => !antes.has(f)) : []);

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, chats: [], pedidos: [] };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "ping") ws.send(JSON.stringify({ type: "pong", t: m.t })); // bug-672
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "pedir_perfil") rec.pedidos.push(m);
  };
  return rec;
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
/** Espera a CONDIÇÃO, nunca um sleep seco (a asserção não corre contra o tick). */
async function ate(cond, ms = 3000) {
  const fim = Date.now() + ms;
  while (Date.now() < fim) {
    if (cond()) return true;
    await espera(50);
  }
  return cond();
}
const enviar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));
const responder = (rec, lote, fps) =>
  rec.ws.send(JSON.stringify({ type: "profile_report", stats: { fps, pedido: { lote } } }));

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
const bia = cliente({ name: "bia", pin: "2222" });
await espera(700);

console.log("== aluno NÃO pede perfil ==");
enviar(bia, "/perfil");
ok(await ate(() => bia.chats.some((c) => c.includes("Somente o professor"))), "bia é barrada");
ok(ana.pedidos.length === 0, "e ninguém recebeu pedido");

console.log("== /perfil sem nada: a turma toda, menos quem pediu ==");
enviar(prof, "/perfil");
ok(await ate(() => ana.pedidos.length === 1 && bia.pedidos.length === 1), "ana e bia receberam o pedido");
ok(prof.pedidos.length === 0, "a professora NÃO recebeu (ela tem o F3)");
const p1 = ana.pedidos[0];
ok(p1?.duracaoMs === 10_000, `10 s por padrão (veio ${p1?.duracaoMs})`);
ok(bia.pedidos[0]?.lote === p1?.lote, "os dois pedidos são do MESMO lote");
ok(
  await ate(() => prof.chats.some((c) => c.includes("2 jogadores") && c.includes(`perf-turma-${p1?.lote}-`))),
  "a professora sabe a quantos pediu e como os arquivos vão se chamar",
);

responder(ana, p1.lote, 31);
responder(bia, p1.lote, 52);
ok(await ate(() => novos().length === 2), `os 2 perfis chegaram em profiles/ (nasceram ${novos().length})`);
const daRodada = novos().filter((f) => f.startsWith(`perf-turma-${p1.lote}-`));
ok(daRodada.length === 2, `os 2 com o prefixo da rodada: ${daRodada.join(", ")}`);
const fps = daRodada.map((f) => JSON.parse(readFileSync(resolve(PASTA, f), "utf8")).fps).sort();
ok(fps[0] === 31 && fps[1] === 52, "o conteúdo é o que cada um mandou");
ok(
  await ate(() => ana.chats.some((c) => c === "Pronto: o professor recebeu a medição do seu jogo.")),
  "a aluna ouve que acabou (e não um nome de arquivo)",
);

console.log("== um nome só, com segundos ==");
enviar(prof, "/perfil ana 30");
ok(await ate(() => ana.pedidos.length === 2), "ana recebeu o 2º pedido");
ok(ana.pedidos[1]?.duracaoMs === 30_000, "com 30 s");
await espera(300);
ok(bia.pedidos.length === 1, "bia NÃO recebeu");
ok(ana.pedidos[1]?.lote !== p1.lote, "rodada nova = lote novo");

console.log("== limites e nome inexistente ==");
enviar(prof, "/perfil 999");
enviar(prof, "/perfil ninguem");
ok(await ate(() => prof.chats.some((c) => c.startsWith("Uso: /perfil"))), "999 s é recusado com o uso");
ok(await ate(() => prof.chats.some((c) => c.includes('Ninguém chamado "ninguem"'))), "nome inexistente responde");
ok(ana.pedidos.length === 2 && bia.pedidos.length === 1, "e nenhum pedido a mais saiu");

console.log("== lote forjado não entra no nome do arquivo ==");
const antesForjado = novos().length;
responder(bia, "../../x", 1);
ok(await ate(() => novos().length === antesForjado + 1), "o perfil ainda é gravado");
const forjado = novos().find((f) => !f.startsWith("perf-turma-"));
ok(forjado !== undefined && !forjado.includes(".."), `gravado como perfil manual: ${forjado}`);

// profiles/ é pasta de DADO do usuário — o smoke leva o próprio lixo embora
for (const f of novos()) unlinkSync(resolve(PASTA, f));

console.log(falhas === 0 ? "\nSMOKE /perfil OK" : `\nSMOKE /perfil FALHOU (${falhas})`);
for (const c of [prof, ana, bia]) c.ws.close();
process.exit(falhas === 0 ? 0 : 1);
