/**
 * Smoke do §🍖 F5 (craft por lista + balde-item) contra o servidor REAL. Prova
 * pelo fio o que o teste puro não alcança: que fabricar é ESTADO DO SERVIDOR (o
 * cliente pede por índice e recebe a mochila inteira), que a receita consome os
 * ingredientes e credita a saída, que faltar ingrediente é recusado calado, que
 * criativo não fabrica (paleta infinita), e que o balde virou item de mochila —
 * a receita 3 lingotes → balde, e usar o balde em sobrevivência troca vazio↔cheio
 * NO MESMO slot pelo servidor.
 *
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-craft.ljw LJ_CODIGO=prof2026 \
 *     LJ_PORT=8103 npm run start -w server
 *   node server/src/cenarios/_smoke-craft.mjs 8103
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
const LOG = 6;
const PLANKS = 7;
const LINGOTE_FERRO = 909; // §🍖 F10b: o balde passou a cobrar LINGOTE, não minério cru
const ESCADA_TABUA = 163;
const AGUA = 129;
const BALDE_VAZIO = 900;
const BALDE_AGUA = 901;
// índices na lista RECEITAS (APPEND-only — ver receitas.ts)
const REC_TABUAS = 0; // 1 tronco → 4 tábuas
const REC_ESCADA = 5; // 6 tábuas → 4 escada de tábuas
const REC_BALDE = 10; // 3 lingotes de ferro → 1 balde vazio

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
const slotDe = (rec, id) => (ultimoInv(rec) ?? []).find((s) => s.id === id)?.slot ?? -1;
const blocoEm = (rec, p) => rec.blocos.get(`${p.x},${p.y},${p.z}`);
const fabricar = (rec, receita) => rec.ws.send(JSON.stringify({ type: "fabricar", receita }));
const mover = (rec, p) =>
  rec.ws.send(JSON.stringify({ type: "move", x: p.x, y: p.y, z: p.z, yaw: 0, pitch: 0 }));

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
await espera(1200);
mover(ana, ana.spawn);
mover(prof, ana.spawn);

console.log("== criativo NÃO fabrica (fabricar é no-op sem mochila) ==");
fabricar(prof, REC_TABUAS);
await espera(300);
ok(prof.invs.length === 0, "o professor em criativo não recebeu inventário nenhum");

console.log("== entra em sobrevivência e fabrica tábuas ==");
enviar(prof, "/modo sobrevivencia all");
await espera(400);
enviar(prof, `/dar ana ${LOG} 2`);
await espera(400);
ok(contar(ana, LOG) === 2, `a ana tem 2 troncos (${contar(ana, LOG)})`);
fabricar(ana, REC_TABUAS);
await espera(400);
ok(contar(ana, LOG) === 1, `gastou 1 tronco (${contar(ana, LOG)})`);
ok(contar(ana, PLANKS) === 4, `e ganhou 4 tábuas (${contar(ana, PLANKS)})`);

console.log("== faltando ingrediente, a receita é RECUSADA sem mexer na mochila ==");
// a ana tem 4 tábuas; a escada quer 6 → recusa
const antesEscada = contar(ana, PLANKS);
fabricar(ana, REC_ESCADA);
await espera(300);
ok(contar(ana, PLANKS) === antesEscada, "as tábuas continuam lá (nada foi consumido)");
ok(contar(ana, ESCADA_TABUA) === 0, "e nenhuma escada apareceu");

console.log("== cadeia: mais tábuas destravam a escada ==");
enviar(prof, `/dar ana ${LOG} 1`);
await espera(300);
fabricar(ana, REC_TABUAS); // +4 tábuas → 8
await espera(300);
ok(contar(ana, PLANKS) === 8, `8 tábuas acumuladas (${contar(ana, PLANKS)})`);
fabricar(ana, REC_ESCADA); // 6 tábuas → 4 escadas
await espera(300);
ok(contar(ana, PLANKS) === 2, `sobraram 2 tábuas (${contar(ana, PLANKS)})`);
ok(contar(ana, ESCADA_TABUA) === 4, `e 4 escadas de tábuas (${contar(ana, ESCADA_TABUA)})`);

console.log("== índice de receita inválido é ignorado ==");
const invAntes = ultimoInv(ana).length;
fabricar(ana, 999);
await espera(250);
ok((ultimoInv(ana) ?? []).length === invAntes, "mochila intacta com índice fora da lista");

console.log("== o balde: 3 lingotes de ferro → 1 balde vazio ==");
enviar(prof, `/dar ana ${LINGOTE_FERRO} 3`);
await espera(400);
ok(contar(ana, LINGOTE_FERRO) === 3, `a ana tem 3 lingotes de ferro (${contar(ana, LINGOTE_FERRO)})`);
fabricar(ana, REC_BALDE);
await espera(400);
ok(contar(ana, LINGOTE_FERRO) === 0, "os 3 lingotes foram consumidos");
ok(contar(ana, BALDE_VAZIO) === 1, `e nasceu 1 balde vazio (${contar(ana, BALDE_VAZIO)})`);

console.log("== usar o balde em sobrevivência: despeja e troca vazio→cheio no MESMO slot ==");
const slotBalde = slotDe(ana, BALDE_VAZIO);
const cel = { x: Math.floor(ana.spawn.x), y: Math.floor(ana.spawn.y) + 2, z: Math.floor(ana.spawn.z) };
// balde CHEIO despeja; mas a ana tem o VAZIO — precisa encher primeiro numa fonte.
// Estratégia: professor (criativo, balde infinito) despeja uma fonte perto — a
// água só entra no mundo por balde (`/bloco` recusa o id da água), e o servidor
// não exige item na mão em criativo. Depois a ana RECOLHE (encher:true) → cheio.
prof.ws.send(JSON.stringify({ type: "balde", ...cel, encher: false }));
await espera(400);
ok(blocoEm(ana, cel) === AGUA, "o professor despejou uma fonte de água");
ana.ws.send(JSON.stringify({ type: "balde", ...cel, encher: true, slot: slotBalde }));
await espera(400);
ok(contar(ana, BALDE_AGUA) === 1, `o balde encheu (${contar(ana, BALDE_AGUA)} cheio)`);
ok(contar(ana, BALDE_VAZIO) === 0, "e não sobrou balde vazio");
ok(slotDe(ana, BALDE_AGUA) === slotBalde, "o balde ficou no MESMO slot");
ok(blocoEm(ana, cel) === AR, "a fonte foi recolhida (célula vazia)");

console.log("== despejar de volta: cheio→vazio, e a água volta ==");
ana.ws.send(JSON.stringify({ type: "balde", ...cel, encher: false, slot: slotBalde }));
await espera(400);
ok(blocoEm(ana, cel) === AGUA, "a água voltou pra célula");
ok(contar(ana, BALDE_VAZIO) === 1, "e o balde esvaziou de novo");

console.log("== balde recusado quando o slot NÃO segura o balde do estado certo ==");
// o balde está vazio agora; pedir DESPEJAR (encher:false, precisa do CHEIO) recusa
const celB = { x: cel.x + 1, y: cel.y, z: cel.z };
ana.ws.send(JSON.stringify({ type: "balde", ...celB, encher: false, slot: slotBalde }));
await espera(350);
ok(blocoEm(ana, celB) === undefined, "nada foi despejado (o slot tinha balde vazio)");

for (const c of [prof, ana]) c.ws.close();
console.log(falhas === 0 ? "\nSMOKE /craft OK" : `\nSMOKE /craft FALHOU (${falhas})`);
process.exit(falhas === 0 ? 0 : 1);
