/**
 * Smoke do §🍖 F4 (inventário autoritativo) contra o servidor REAL. Prova pelo
 * fio o que o teste puro não alcança: que a mochila é ESTADO DO SERVIDOR (o
 * cliente só recebe), que colocar gasta e quebrar dá pela tabela de drops, que
 * criativo segue infinito no MESMO mundo, que a mochila cheia RECUSA a quebra
 * (não existe item no chão), que a regra `manter-inventario` decide o que
 * acontece na morte, e que tudo isso sobrevive ao DISCO (.ljw).
 *
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-inv.ljw LJ_CODIGO=prof2026 \
 *     LJ_PORT=8102 npm run start -w server
 *   node server/src/cenarios/_smoke-inventario.mjs 8102
 */
const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// espelhos das constantes de /shared (o smoke fala JSON, não importa TS)
const AR = 0;
const GRAMA = 1;
const PEDRA = 2;
const PICARETA_MADEIRA = 912; // §🍖 F10d: pedra e pedregulho exigem picareta
const PEDREGULHO = 3;
const AREIA = 4;
const TERRA = 5;
const INV_SLOTS = 27;
const STACK_MAX = 64;

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, spawn: null, invs: [], chats: [], blocos: new Map() };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "spawn") rec.spawn = { x: m.x, y: m.y, z: m.z };
    if (m.type === "inventario") rec.invs.push(m.slots);
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "block_changed") rec.blocos.set(`${m.x},${m.y},${m.z}`, m.blockId);
  };
  return rec;
}
const enviar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));
const ultimoInv = (rec) => rec.invs.at(-1) ?? null;
const contar = (rec, id) =>
  (ultimoInv(rec) ?? []).reduce((n, s) => (s.id === id ? n + s.qtd : n), 0);
const blocoEm = (rec, p) => rec.blocos.get(`${p.x},${p.y},${p.z}`);

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
await espera(1200);

/** Célula 3 acima do spawre de ana: livre e ao alcance. */
const alvo = {
  x: Math.floor(ana.spawn.x),
  y: Math.floor(ana.spawn.y) + 2,
  z: Math.floor(ana.spawn.z),
};
// a ana precisa estar perto do alvo pro gate de alcance passar
const mover = (rec, p) =>
  rec.ws.send(JSON.stringify({ type: "move", x: p.x, y: p.y, z: p.z, yaw: 0, pitch: 0 }));
mover(ana, ana.spawn);
mover(prof, ana.spawn); // o professor fica ao lado pra usar /bloco com ~

console.log("== criativo NÃO recebe mochila (a ausência é que diz 'paleta infinita') ==");
ok(ana.invs.length === 0, "ninguém recebeu inventário enquanto o mundo era criativo");

console.log("== entrar em sobrevivência mostra a mochila (vazia) ==");
enviar(prof, "/modo sobrevivencia all");
await espera(500);
ok(ultimoInv(ana) !== null, "a ana recebeu a mensagem `inventario`");
ok((ultimoInv(ana) ?? []).length === 0, "e ela começou de mãos vazias");
ok(prof.invs.length === 0, "o professor seguiu em criativo, sem mochila");

console.log("== sem o bloco na mão, colocar não muda o mundo ==");
enviar(prof, `/bloco ${alvo.x} ${alvo.y} ${alvo.z} ${AR}`);
await espera(300);
ana.ws.send(JSON.stringify({ type: "place_block", ...alvo, blockId: PEDRA }));
await espera(300);
ok(blocoEm(ana, alvo) === AR || blocoEm(ana, alvo) === undefined, "a célula continuou vazia");

console.log("== /dar enche a mochila, e colocar GASTA ==");
enviar(prof, `/dar ana ${PEDREGULHO} 3`);
await espera(400);
ok(contar(ana, PEDREGULHO) === 3, `a ana recebeu 3 pedregulhos (${contar(ana, PEDREGULHO)})`);
ana.ws.send(JSON.stringify({ type: "place_block", ...alvo, blockId: PEDREGULHO }));
await espera(400);
ok(blocoEm(ana, alvo) === PEDREGULHO, "o bloco entrou no mundo");
ok(contar(ana, PEDREGULHO) === 2, `e saiu um da mochila (${contar(ana, PEDREGULHO)})`);

console.log("== quebrar DÁ o que a tabela diz (pedra → pedregulho) ==");
// §🍖 F10d: sem picareta a pedra nem quebra — e o teste do DROP mediria a recusa
enviar(prof, `/dar ana ${PICARETA_MADEIRA} 1`);
await espera(400);
enviar(prof, `/bloco ${alvo.x} ${alvo.y} ${alvo.z} ${PEDRA}`);
await espera(300);
ana.ws.send(JSON.stringify({ type: "break_block", ...alvo }));
await espera(400);
ok(blocoEm(ana, alvo) === AR, "a célula ficou vazia");
ok(contar(ana, PEDREGULHO) === 3, `e a pedra virou pedregulho na mochila (${contar(ana, PEDREGULHO)})`);

console.log("== grama cai como TERRA (a exceção da tabela) ==");
enviar(prof, `/bloco ${alvo.x} ${alvo.y} ${alvo.z} ${GRAMA}`);
await espera(300);
ana.ws.send(JSON.stringify({ type: "break_block", ...alvo }));
await espera(400);
ok(contar(ana, TERRA) === 1, `1 terra na mochila (${contar(ana, TERRA)})`);
ok(contar(ana, GRAMA) === 0, "e nenhuma grama");

console.log("== criativo no MESMO mundo continua infinito ==");
const alvoProf = { x: alvo.x + 2, y: alvo.y, z: alvo.z };
prof.ws.send(JSON.stringify({ type: "place_block", ...alvoProf, blockId: PEDRA }));
await espera(400);
ok(blocoEm(prof, alvoProf) === PEDRA, "o professor colocou sem ter nada na mochila");
ok(prof.invs.length === 0, "e segue sem mensagem de inventário");

console.log("== MOCHILA CHEIA recusa a quebra (não existe item no chão) ==");
// encher de verdade: os slots vazios de areia MAIS as duas pilhas parciais
// (pedregulho 3 e terra 1) até o teto — senão o pedregulho da pedra ainda
// caberia. §🍖 F10d: a PICARETA ocupa 1 slot sozinha (1 por pilha), então são
// 24 slots de areia, não 25.
enviar(prof, `/dar ana ${AREIA} ${(INV_SLOTS - 3) * STACK_MAX}`);
enviar(prof, `/dar ana ${PEDREGULHO} ${STACK_MAX - 3}`);
enviar(prof, `/dar ana ${TERRA} ${STACK_MAX - 1}`);
await espera(700);
const cheia = (ultimoInv(ana) ?? []).reduce((n, s) => n + s.qtd, 0);
const teto = (INV_SLOTS - 1) * STACK_MAX + 1; // 26 pilhas cheias + a picareta
ok(cheia === teto, `a mochila da ana ficou cheia (${cheia}/${teto})`);
enviar(prof, `/bloco ${alvo.x} ${alvo.y} ${alvo.z} ${PEDRA}`);
await espera(300);
const antesDoAviso = ana.chats.length;
ana.ws.send(JSON.stringify({ type: "break_block", ...alvo }));
await espera(400);
ok(blocoEm(ana, alvo) === PEDRA, "o bloco FICOU no mundo (a quebra foi recusada)");
ok(
  ana.chats.slice(antesDoAviso).some((t) => t.includes("Mochila cheia")),
  "e a ana foi avisada no chat",
);

console.log("== manter-inventario DESLIGADA: morrer custa a mochila ==");
enviar(prof, "/regra manter-inventario desligar");
await espera(400);
ok(
  !ana.chats.at(-1)?.includes("mecânica"),
  "o /regra não avisa mais que falta mecânica pra manter-inventario",
);
// morte por queda: sobe 100 e pousa (o servidor fecha a queda pelo fluxo de move)
mover(ana, { x: ana.spawn.x, y: ana.spawn.y + 100, z: ana.spawn.z });
await espera(150);
mover(ana, ana.spawn);
await espera(600);
ok((ultimoInv(ana) ?? []).length === 0, "a mochila da ana esvaziou na morte");

console.log("== e a mochila do professor atravessa o DISCO ==");
enviar(prof, "/modo sobrevivencia eu");
await espera(300);
enviar(prof, `/dar eu ${PEDREGULHO} 9`);
await espera(400);
ok(contar(prof, PEDREGULHO) === 9, `o professor tem 9 pedregulhos (${contar(prof, PEDREGULHO)})`);
enviar(prof, "/mundo salvar");
await espera(800);
prof.ws.close();
await espera(300);
const prof2 = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
await espera(900);
ok(
  contar(prof2, PEDREGULHO) === 9,
  `e reencontrou os 9 ao reentrar (${contar(prof2, PEDREGULHO)})`,
);

for (const c of [prof2, ana]) c.ws.close();
console.log(falhas === 0 ? "\nSMOKE /inventario OK" : `\nSMOKE /inventario FALHOU (${falhas})`);
process.exit(falhas === 0 ? 0 : 1);
