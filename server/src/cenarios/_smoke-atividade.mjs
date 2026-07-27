/**
 * Smoke de /tp grupos e /iniciar contra o servidor REAL (aula1 na 8080).
 * Prova o caminho de ponta a ponta: professor forma os grupos com os alunos
 * online, zera o progresso e teleporta cada grupo para a sua área — os alunos
 * recebem a msg `teleport` de verdade pelo fio.
 *
 * Rode com o servidor no ar:
 *   LJ_SAVE=cenarios/aula1-sequencia.ljw LJ_CODIGO=prof2026 npm run start -w server
 *   node server/src/cenarios/_smoke-atividade.mjs
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
  const rec = { ws, chats: [], grupos: [], teleports: [] };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "group") rec.grupos.push(m.grupo);
    if (m.type === "teleport") rec.teleports.push({ x: m.x, y: m.y, z: m.z });
  };
  return rec;
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const enviar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
const bia = cliente({ name: "bia", pin: "2222" });
await espera(700);

console.log("== /iniciar 2 forma grupos, zera e teleporta ==");
enviar(prof, "/iniciar 2");
await espera(500);
ok(ana.grupos.at(-1) === 1 && bia.grupos.at(-1) === 2, "ana→g1, bia→g2");
ok(ana.teleports.length >= 1, "ana recebeu teleport para a área do grupo 1");
ok(bia.teleports.length >= 1, "bia recebeu teleport para a área do grupo 2");
const ta = ana.teleports.at(-1);
const tb = bia.teleports.at(-1);
ok(ta && tb && (ta.x !== tb.x || ta.z !== tb.z), "grupos foram para áreas DIFERENTES");
ok(
  [ana, bia].every((a) => a.chats.some((c) => c.includes("A atividade começou"))),
  "a turma foi avisada do início",
);
ok(prof.teleports.length === 0, "o professor NÃO foi teleportado");

console.log("== /tp grupos leva de novo ==");
const antes = ana.teleports.length;
enviar(prof, "/tp grupos");
await espera(400);
ok(ana.teleports.length > antes, "ana foi teleportada de novo");
ok(
  prof.chats.some((c) => c.includes("aluno(s) levado(s)")),
  "professor recebe o resumo do teleporte",
);

console.log("== aluno não pode /iniciar nem /tp ==");
enviar(ana, "/iniciar");
enviar(ana, "/tp grupos");
await espera(300);
ok(
  ana.chats.some((c) => c.includes("Somente o professor pode iniciar")),
  "/iniciar negado ao aluno",
);
ok(
  ana.chats.some((c) => c.includes("Somente o professor pode usar /tp")),
  "/tp negado ao aluno",
);

prof.ws.close();
ana.ws.close();
bia.ws.close();
console.log(falhas === 0 ? "\nTUDO OK" : `\n${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);
