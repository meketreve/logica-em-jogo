/**
 * Smoke do §🍖 F7 (pvp) contra o servidor REAL. Prova pelo fio o que o teste
 * puro não alcança: que o soco é uma mensagem `atacar {alvo}` que só o SERVIDOR
 * resolve (o cliente nunca reporta dano), que o `id` do alvo é o mesmo que
 * chega no `player_moved` — o cliente não tem outra fonte pra ele —, que o pvp
 * desligado recusa com aviso, que o cooldown segura o clique repetido, que
 * criativo é imune no MESMO mundo e que a morte por soco NOMEIA quem bateu no
 * chat da turma.
 *
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-pvp.ljw LJ_CODIGO=prof2026 \
 *     LJ_PORT=8107 npm run start -w server
 *   node server/src/cenarios/_smoke-pvp.mjs 8107
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
const DANO_PVP = 2; // 1 coração por soco (shared/src/sobrevivencia.ts)

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, spawn: null, vidas: [], chats: [], modos: [], vistos: new Map() };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "spawn") rec.spawn = { x: m.x, y: m.y, z: m.z };
    if (m.type === "vida") rec.vidas.push(m);
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "modo") rec.modos.push(m);
    // é DAQUI que o cliente conhece o id de quem ele vê — o alvo do soco sai
    // desta tabela, não de um id inventado pelo smoke
    if (m.type === "player_moved") rec.vistos.set(m.name ?? "?", m.id);
  };
  return rec;
}
const enviar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));
const mover = (rec, x, y, z) =>
  rec.ws.send(JSON.stringify({ type: "move", x, y, z, yaw: 0, pitch: 0 }));
const socar = (rec, alvo) => rec.ws.send(JSON.stringify({ type: "atacar", alvo }));
const ultimaVida = (rec) => rec.vidas.at(-1) ?? null;
const ultimoModo = (rec) => rec.modos.at(-1) ?? null;

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
const bia = cliente({ name: "bia", pin: "2222" });
await espera(1200);

// todo mundo se vê e fica ao alcance (o mesmo ponto do spawn)
for (const c of [prof, ana, bia]) mover(c, c.spawn.x, c.spawn.y, c.spawn.z);
await espera(400);

console.log("== o id do alvo vem do player_moved, como no cliente de verdade ==");
const idBia = ana.vistos.get("bia");
const idAna = bia.vistos.get("ana");
ok(typeof idBia === "number", `a ana enxerga a bia com o id ${idBia}`);
ok(typeof idAna === "number", `a bia enxerga a ana com o id ${idAna}`);

console.log("== a turma entra em sobrevivência ==");
enviar(prof, "/modo sobrevivencia all");
await espera(500);
ok(ultimaVida(ana)?.vida === VIDA_MAX, "ana com a vida cheia");
ok(ultimaVida(bia)?.vida === VIDA_MAX, "bia com a vida cheia");
ok(ultimoModo(ana)?.pvp === false, "o modo diz que o pvp está desligado (a mira sabe)");

console.log("== pvp DESLIGADO: o soco não tira nada, e quem bateu é avisado ==");
const vidaAntes = ultimaVida(bia).vida;
socar(ana, idBia);
await espera(300);
ok(ultimaVida(bia).vida === vidaAntes, "a bia não perdeu vida nenhuma");
ok(
  ana.chats.some((t) => t.includes("desligado neste mundo")),
  "a ana ouviu por que não aconteceu nada",
);

console.log("== /pvp ligar: a turma inteira é avisada e o modo é reenviado ==");
enviar(prof, "/pvp ligar");
await espera(400);
ok(
  bia.chats.some((t) => t.includes("LIGOU o ataque")),
  "a bia foi avisada no chat (quem apanha sem saber acha que é bug)",
);
ok(ultimoModo(ana)?.pvp === true, "o modo novo chegou com o pvp ligado");

console.log("== o soco tira um coração, etiquetado como pvp ==");
socar(ana, idBia);
await espera(300);
ok(ultimaVida(bia).vida === VIDA_MAX - DANO_PVP, `a bia caiu pra ${ultimaVida(bia).vida}`);
ok(ultimaVida(bia).causa === "pvp", "o dano veio etiquetado como pvp");

console.log("== o cooldown segura o clique repetido ==");
await espera(600); // deixa o cooldown do soco anterior VENCER, senão a rajada
// inteira seria recusada e o teste passaria pelo motivo errado
const antesRajada = ultimaVida(bia).vida;
for (let i = 0; i < 5; i++) socar(ana, idBia); // 5 cliques no mesmo instante
await espera(300);
ok(
  ultimaVida(bia).vida === antesRajada - DANO_PVP,
  `5 socos no mesmo instante tiraram 1 coração só (vida ${ultimaVida(bia).vida})`,
);

console.log("== de longe não alcança ==");
mover(bia, bia.spawn.x + 30, bia.spawn.y, bia.spawn.z);
await espera(300);
const antesLonge = ultimaVida(bia).vida;
socar(ana, idBia);
await espera(400);
ok(ultimaVida(bia).vida === antesLonge, "a bia longe não apanhou");
mover(bia, bia.spawn.x, bia.spawn.y, bia.spawn.z);
await espera(300);

console.log("== quem está em criativo não bate nem apanha ==");
enviar(prof, "/modo criativo ana");
await espera(400);
const antesCriativo = ultimaVida(bia).vida;
socar(ana, idBia);
await espera(400);
ok(ultimaVida(bia).vida === antesCriativo, "a ana em criativo socou e não tirou nada");
socar(bia, ana.vistos.size ? bia.vistos.get("ana") : idAna);
await espera(400);
ok(
  ultimaVida(ana).vida === VIDA_MAX || ultimaVida(ana).causa !== "pvp",
  "e a ana em criativo não apanhou",
);
enviar(prof, "/modo sobrevivencia ana");
await espera(400);

console.log("== derrubar alguém NOMEIA quem bateu no chat da turma ==");
for (let i = 0; i < 12; i++) {
  socar(ana, idBia);
  await espera(600); // acima do cooldown (0,5 s)
  // PARA na morte: quem renasce está no spawn, ao alcance da ana, e os socos
  // sobrando derrubariam de novo a vida que o respawn acabou de encher
  if (bia.vidas.some((v) => v.morreu === true)) break;
}
await espera(500);
ok(
  bia.vidas.some((v) => v.morreu === true && v.causa === "pvp"),
  "a bia recebeu a mensagem da própria morte, etiquetada pvp",
);
ok(
  prof.chats.some((t) => t.includes("bia") && t.includes("ana")),
  "o professor viu no chat QUEM derrubou quem",
);
ok(ultimaVida(bia).vida === VIDA_MAX, "e a bia voltou com a vida cheia");

console.log("== /pvp desligar volta ao padrão e o save fica limpo ==");
enviar(prof, "/pvp desligar");
await espera(400);
ok(ultimoModo(bia)?.pvp === false, "o modo voltou a dizer que o pvp está desligado");

for (const c of [prof, ana, bia]) c.ws.close();
console.log(falhas === 0 ? "\nSMOKE /pvp OK" : `\nSMOKE /pvp FALHOU (${falhas})`);
process.exit(falhas === 0 ? 0 : 1);
