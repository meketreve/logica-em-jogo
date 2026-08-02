/**
 * Smoke do §🍖 F2 (vida, dano, morte, respawn) contra o servidor REAL. Prova
 * pelo fio o que o teste puro não alcança: que o SERVIDOR fecha a queda a partir
 * do fluxo de `move` (o cliente nunca reporta dano), que criativo é imune no
 * MESMO mundo, que a morte devolve ao spawn avisando a turma, e que a
 * regeneração anda no tick de 10 Hz.
 *
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-vida.ljw LJ_CODIGO=prof2026 \
 *     LJ_PORT=8100 npm run start -w server
 *   node server/src/cenarios/_smoke-vida.mjs 8100
 */
const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const VIDA_MAX = 20;
/** Mesma conta do módulo puro: 3 blocos de graça, meio coração por bloco. */
const danoDeQueda = (blocos) => Math.max(0, Math.floor(blocos) - 3);

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, spawn: null, vidas: [], chats: [], teleports: [] };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "spawn") rec.spawn = { x: m.x, y: m.y, z: m.z };
    if (m.type === "vida") rec.vidas.push(m);
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "teleport") rec.teleports.push(m);
  };
  return rec;
}
const enviar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));
const mover = (rec, x, y, z) =>
  rec.ws.send(JSON.stringify({ type: "move", x, y, z, yaw: 0, pitch: 0 }));
const ultimaVida = (rec) => rec.vidas.at(-1) ?? null;

/** Sobe `altura` blocos acima do spawn e pousa nele — a 10 Hz, como o cliente. */
async function cair(rec, altura) {
  const s = rec.spawn;
  mover(rec, s.x, s.y, s.z);
  await espera(150);
  mover(rec, s.x, s.y + altura, s.z);
  await espera(150);
  mover(rec, s.x, s.y, s.z);
  await espera(300);
}

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
await espera(1200);

console.log("== o mundo começa criativo: ninguém tem vida ==");
ok(ana.spawn !== null, "ana recebeu o spawn autoritativo");
ok(ana.vidas.length === 0, "sem mensagem de vida em criativo");

console.log("== /modo sobrevivencia all: a turma ganha vida, o professor não ==");
enviar(prof, "/modo sobrevivencia all");
await espera(500);
ok(ultimaVida(ana)?.vida === VIDA_MAX, "ana entrou em sobrevivência com a vida cheia");
ok(prof.vidas.length === 0, "o professor seguiu em criativo, sem vida");

console.log("== o SERVIDOR fecha a queda a partir do fluxo de move ==");
await cair(ana, 20);
const ferida = ultimaVida(ana);
ok(ferida?.causa === "queda", `o dano veio etiquetado como queda (${ferida?.causa})`);
ok(
  ferida?.vida === VIDA_MAX - danoDeQueda(20),
  `queda de 20 blocos tirou ${danoDeQueda(20)} pontos (vida ${ferida?.vida})`,
);

console.log("== a MESMA queda em criativo não tira nada ==");
await cair(prof, 20);
ok(prof.vidas.length === 0, "o professor caiu 20 blocos e continua sem vida nenhuma");

console.log("== queda curta é de graça ==");
const antesCurta = ultimaVida(ana).vida;
await cair(ana, 3);
ok(ultimaVida(ana).vida === antesCurta, "queda de 3 blocos não machucou");

console.log("== regeneração anda no tick de 10 Hz ==");
const antesRegen = ultimaVida(ana).vida;
await espera(4600); // 1 ponto a cada 4 s
ok(
  ultimaVida(ana).vida > antesRegen,
  `a vida subiu sozinha: ${antesRegen} → ${ultimaVida(ana).vida}`,
);

console.log("== morrer devolve ao spawn, cheio, e avisa a turma ==");
const tpAntes = ana.teleports.length;
await cair(ana, 40);
await espera(400);
ok(
  ana.vidas.some((v) => v.morreu === true && v.vida === 0),
  "a ana recebeu a mensagem da morte (vida 0)",
);
ok(ultimaVida(ana).vida === VIDA_MAX, "e voltou com a vida cheia");
ok(ana.teleports.length > tpAntes, "o servidor teleportou a ana de volta ao spawn");
ok(
  prof.chats.some((t) => t.includes("ana") && t.includes("caiu")),
  "a turma foi avisada no chat (o professor viu)",
);

console.log("== o respawn NÃO conta como queda ==");
await espera(600);
ok(ultimaVida(ana).vida === VIDA_MAX, "continua cheia depois do respawn");

for (const c of [prof, ana]) c.ws.close();
console.log(falhas === 0 ? "\nSMOKE /vida OK" : `\nSMOKE /vida FALHOU (${falhas})`);
process.exit(falhas === 0 ? 0 : 1);
