/**
 * Smoke do cp19 contra o servidor REAL: professor + aluno conectados, o
 * professor troca a aula, e ninguém pode cair nem perder o papel.
 */
const URL = "ws://localhost:8080";
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};

function cliente(nome, join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { nome, ws, chats: [], spawns: [], snapshots: 0, objetivos: [], fechou: false };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) { rec.snapshots++; return; }
    const m = JSON.parse(e.data);
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "spawn") rec.spawns.push(m.papel);
    if (m.type === "objectives") rec.objetivos.push(m.objetivos[0]?.texto ?? "");
  };
  ws.onclose = () => { rec.fechou = true; };
  return rec;
}

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const prof = cliente("profa", { name: "profa", pin: "1234", codigo: "prof2026" });
const aluno = cliente("ana", { name: "ana", pin: "1111" });
await espera(700);

console.log("== estado inicial (aula1) ==");
ok(prof.spawns[0] === "professor", "professor entrou como professor");
ok(prof.snapshots === 1 && aluno.snapshots === 1, "cada um recebeu 1 mundo");
ok(/Continue a regra/.test(aluno.objetivos.at(-1) ?? ""), `aluno vê o objetivo da aula 1`);

console.log("== aluno tenta trocar a aula ==");
aluno.ws.send(JSON.stringify({ type: "chat", text: "/mundo carregar aula2-binario" }));
await espera(300);
ok(
  aluno.chats.some((c) => c.includes("Somente o professor pode trocar a aula")),
  "aluno é recusado com mensagem clara",
);
ok(aluno.snapshots === 1, "recusa não trocou o mundo de ninguém");

console.log("== professor lista e troca ==");
prof.ws.send(JSON.stringify({ type: "chat", text: "/mundo lista" }));
await espera(300);
ok(
  prof.chats.some((c) => c.includes("aula2-binario.ljw") && c.includes("em curso")),
  "/mundo lista mostra as aulas e marca a em curso",
);

prof.ws.send(JSON.stringify({ type: "chat", text: "/mundo carregar aula2-binario" }));
await espera(900);

console.log("== depois da troca ==");
ok(!prof.fechou && !aluno.fechou, "NINGUÉM foi desconectado");
ok(prof.snapshots === 2 && aluno.snapshots === 2, "os dois receberam o mundo novo");
ok(prof.spawns.at(-1) === "professor", "o professor continua professor no mundo novo");
ok(
  /binario|binário/i.test(aluno.objetivos.at(-1) ?? ""),
  `aluno agora vê o objetivo da aula 2 ("${aluno.objetivos.at(-1)}")`,
);
ok(
  aluno.chats.some((c) => c.includes("A aula mudou")),
  "aluno foi avisado da troca",
);

console.log("== erro: mundo que não existe ==");
prof.ws.send(JSON.stringify({ type: "chat", text: "/mundo carregar aula-fantasma" }));
await espera(300);
ok(
  prof.chats.some((c) => c.includes('Não encontrei o mundo "aula-fantasma"')),
  "mundo inexistente é recusado sem derrubar a aula",
);
ok(prof.snapshots === 2, "a recusa não trocou nada");

prof.ws.close();
aluno.ws.close();
console.log(falhas === 0 ? "\nTUDO OK" : `\n${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);
