/**
 * Smoke dos LOGS DE SESSÃO (2026-10-05) contra o servidor REAL.
 *
 * O que ele prova, e que nenhum teste puro alcança (escrever arquivo é do
 * host, não da GameSession):
 * 1. a pasta `mundos/<nome>/logs/` nasce, e NÃO existe mais `chat.log` novo;
 * 2. fala de GENTE vai pro `-chat.log` e NUNCA pro `-eventos.log`;
 * 3. mensagem do SERVIDOR vai pro `-eventos.log` e NUNCA pro `-chat.log` —
 *    é esta separação que faz o arquivo que o professor lê ficar minúsculo
 *    (o `chat.log` antigo era 2434 linhas, 2434 delas do servidor);
 * 4. os dois arquivos carregam o MESMO carimbo de sessão, e o nome começa
 *    pela data (ordena sozinho no explorador);
 * 5. a linha é `[HH:MM:SS] autor: texto` — hora LOCAL, sem a data repetida.
 *
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-logs.ljw LJ_CODIGO=prof2026 \
 *     LJ_PORT=8101 npm run start -w server
 *   node server/src/cenarios/_smoke-logs.mjs 8101
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
const PASTA = resolve(process.cwd(), "mundos/_smoke-logs");
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, chats: [] };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "ping") ws.send(JSON.stringify({ type: "pong", t: m.t }));
    if (m.type === "chat") rec.chats.push(m.text);
  };
  return rec;
}
const falar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
await espera(1200);

const FRASE_ANA = "achei o diamante";
const FRASE_PROF = "muito bem, turma";
falar(ana, FRASE_ANA);
await espera(250);
falar(prof, FRASE_PROF);
// `/hora` faz o servidor responder — garante linha de EVENTO nesta sessão
falar(prof, "/hora");
await espera(700);

console.log("== logs da sessão ==");
const pastaLogs = resolve(PASTA, "logs");
ok(existsSync(pastaLogs), `a pasta ${pastaLogs.replace(process.cwd() + "/", "")} nasceu`);
ok(!existsSync(resolve(PASTA, "chat.log")), "nenhum chat.log novo foi criado na raiz do mundo");

const arquivos = existsSync(pastaLogs) ? readdirSync(pastaLogs).sort() : [];
const doChat = arquivos.filter((f) => f.endsWith("-chat.log"));
const deEventos = arquivos.filter((f) => f.endsWith("-eventos.log"));
ok(doChat.length === 1, `um -chat.log (${JSON.stringify(arquivos)})`);
ok(deEventos.length === 1, `um -eventos.log`);

const NOME = /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-(chat|eventos)\.log$/;
ok(arquivos.every((f) => NOME.test(f)), `nome é AAAA-MM-DD_HH-MM-tipo.log (${arquivos[0] ?? "—"})`);
const carimbo = (f) => f.replace(/-(chat|eventos)\.log$/, "");
ok(
  doChat.length === 1 && deEventos.length === 1 && carimbo(doChat[0]) === carimbo(deEventos[0]),
  "os dois arquivos da sessão têm o MESMO carimbo",
);

const ler = (f) => (f ? readFileSync(resolve(pastaLogs, f), "utf8") : "");
const chat = ler(doChat[0]);
const eventos = ler(deEventos[0]);

console.log("== a separação ==");
ok(chat.includes(FRASE_ANA), "o que a ALUNA falou está no -chat.log");
ok(chat.includes(FRASE_PROF), "o que a PROFESSORA falou está no -chat.log");
ok(!chat.includes("servidor:"), "o -chat.log NÃO tem uma linha sequer de servidor");
ok(eventos.includes("servidor:"), "o -eventos.log tem o que o servidor disse");
ok(!eventos.includes(FRASE_ANA), "o -eventos.log NÃO tem fala de gente");

console.log("== formato da linha ==");
const primeira = chat.split("\n")[0] ?? "";
ok(/^\[\d{2}:\d{2}:\d{2}\] \S+: /.test(primeira), `linha é [HH:MM:SS] autor: texto (${primeira.slice(0, 40)})`);
ok(!/\d{4}-\d{2}-\d{2}T/.test(chat), "nenhuma linha repete a data em ISO/UTC");

console.log(falhas === 0 ? "\n✓ tudo certo" : `\n✗ ${falhas} falha(s)`);
prof.ws.close();
ana.ws.close();
process.exit(falhas === 0 ? 0 : 1);
