/**
 * Smoke de /expulsar (cp22) contra o servidor REAL. Prova o caminho de host de
 * ponta a ponta: o professor remove um aluno, o aluno recebe `kicked` e o
 * socket cai; os demais são avisados no chat; aluno não pode kicar; nome
 * inexistente e o próprio professor não removem ninguém.
 *
 * Rode com o servidor no ar (mundo qualquer serve):
 *   LJ_SAVE=mundos/_smoke-kicar.ljw LJ_CODIGO=prof2026 LJ_NOVO=1 npm run start -w server
 *   node server/src/cenarios/_smoke-kicar.mjs
 */
const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, chats: [], kicked: null, fechou: false };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "kicked") rec.kicked = m.reason;
  };
  ws.onclose = () => {
    rec.fechou = true;
  };
  return rec;
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const enviar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
const bia = cliente({ name: "bia", pin: "2222" });
await espera(700);

console.log("== professor remove a ana ==");
enviar(prof, "/expulsar ana");
await espera(500);
ok(ana.kicked && ana.kicked.includes("removido"), "ana recebeu `kicked` com motivo");
ok(ana.fechou, "o socket da ana caiu");
ok(
  bia.chats.some((c) => c.includes("ana foi removido")),
  "a turma foi avisada (bia viu no chat)",
);
ok(!bia.fechou, "bia continua conectada");

console.log("== aluno NÃO pode kicar ==");
enviar(bia, "/expulsar profa");
await espera(300);
ok(
  bia.chats.some((c) => c.includes("Somente o professor pode remover")),
  "bia é barrada ao tentar /expulsar",
);
ok(!prof.fechou, "o professor não foi removido por um aluno");

console.log("== nome inexistente e o próprio professor ==");
enviar(prof, "/expulsar ninguem");
enviar(prof, "/expulsar profa"); // não pode remover a si mesmo
await espera(300);
ok(
  prof.chats.some((c) => c.includes('Ninguém chamado "ninguem"')),
  "nome inexistente responde sem remover ninguém",
);
ok(
  prof.chats.some((c) => c.includes('Ninguém chamado "profa"')),
  "professor não remove a si mesmo (só é encontrado o próprio, e ele é excluído)",
);
ok(!prof.fechou, "o professor continua no ar");

console.log(falhas === 0 ? "\nSMOKE /expulsar OK" : `\nSMOKE /expulsar FALHOU (${falhas})`);
for (const c of [prof, bia]) c.ws.close();
process.exit(falhas === 0 ? 0 : 1);
