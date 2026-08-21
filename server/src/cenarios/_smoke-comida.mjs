/**
 * Smoke do §🍖 F6 (comida) contra o servidor REAL. Prova pelo fio o que o teste
 * puro não alcança: que a plantação CRESCE sozinha no tick do servidor (e chega
 * ao cliente como `block_changed` normal, sem mensagem nova), que ela só pega em
 * SOLO, que colher a madura dá trigo + a muda de volta, que 3 trigo viram pão
 * pela receita nova, que comer enche a barra e gasta UMA unidade, que de barriga
 * cheia a mordida é recusada — e que a horta ATRAVESSA o `.ljw`: mundo salvo com
 * plantação continua crescendo depois de recarregado (o índice se reconstrói dos
 * bytes, não há campo novo no save).
 *
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-comida.ljw LJ_CODIGO=prof2026 \
 *     LJ_CRESCIMENTO=5 LJ_PORT=8104 npm run start -w server
 *   node server/src/cenarios/_smoke-comida.mjs 8104
 */
const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
/** Espera uma CONDIÇÃO, não um relógio. Devolve true se ela ficou verdadeira
 *  dentro do teto. Onde o servidor pode estar com a fila cheia, `espera(n)`
 *  fixa vira um teste que depende da velocidade da máquina (bug-629). */
const ate = async (cond, tetoMs, passoMs = 100) => {
  for (let t = 0; t < tetoMs; t += passoMs) {
    if (cond()) return true;
    await espera(passoMs);
  }
  return cond();
};

// espelhos das constantes de /shared (o smoke fala JSON, não importa TS)
const AR = 0;
const TERRA = 5;
const PEDRA = 2;
const PLANTACAO0 = 182;
const PLANTACAO3 = 185;
const ITEM_FRUTA = 902;
const ITEM_TRIGO = 903;
const ITEM_PAO = 904;
const REC_PAO = 11; // último índice de RECEITAS (APPEND-only — ver receitas.ts)
// LJ_CRESCIMENTO=5 → 0,5 s por estágio; 3 estágios + folga
const ESPERA_MADURAR = 2600;

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, spawn: null, invs: [], vidas: [], chats: [], blocos: new Map() };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "spawn") rec.spawn = { x: m.x, y: m.y, z: m.z };
    if (m.type === "inventario") rec.invs.push(m.slots);
    if (m.type === "vida") rec.vidas.push(m);
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
const mover = (rec, p) =>
  rec.ws.send(JSON.stringify({ type: "move", x: p.x, y: p.y, z: p.z, yaw: 0, pitch: 0 }));
const plantar = (rec, p) =>
  rec.ws.send(JSON.stringify({ type: "place_block", ...p, blockId: PLANTACAO0 }));
const quebrar = (rec, p) => rec.ws.send(JSON.stringify({ type: "break_block", ...p }));
const comer = (rec, slot) => rec.ws.send(JSON.stringify({ type: "comer", slot }));
const fomeDe = (rec) => rec.vidas.at(-1)?.fome;

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
await espera(1200);
mover(ana, ana.spawn);
mover(prof, ana.spawn);
enviar(prof, "/modo sobrevivencia all");
await espera(400);

// canteiro 2 blocos ao lado do spawn (na célula do jogador o servidor recusa)
const base = {
  x: Math.floor(ana.spawn.x) + 2,
  y: Math.floor(ana.spawn.y) - 1,
  z: Math.floor(ana.spawn.z),
};
const cel = { x: base.x, y: base.y + 1, z: base.z };
enviar(prof, `/bloco ${base.x} ${base.y} ${base.z} ${TERRA}`);
enviar(prof, `/bloco ${cel.x} ${cel.y} ${cel.z} ${AR}`);
await espera(400);

console.log("== a muda só se planta com muda na mochila ==");
plantar(ana, cel);
await espera(350);
ok(blocoEm(ana, cel) !== PLANTACAO0, "de mãos vazias a ana não plantou nada");
enviar(prof, `/dar ana ${PLANTACAO0} 3`);
await espera(400);
ok(contar(ana, PLANTACAO0) === 3, `a ana tem 3 mudas (${contar(ana, PLANTACAO0)})`);

console.log("== plantar em TERRA vale; em PEDRA o servidor recusa ==");
plantar(ana, cel);
await espera(350);
ok(blocoEm(ana, cel) === PLANTACAO0, "a muda pegou na terra");
ok(contar(ana, PLANTACAO0) === 2, `e gastou UMA muda (${contar(ana, PLANTACAO0)} sobrando)`);
const celPedra = { x: cel.x + 1, y: cel.y, z: cel.z };
enviar(prof, `/bloco ${celPedra.x} ${celPedra.y - 1} ${celPedra.z} ${PEDRA}`);
await espera(300);
plantar(ana, celPedra);
await espera(350);
ok(blocoEm(ana, celPedra) !== PLANTACAO0, "em cima de pedra a muda foi recusada");

console.log("== a horta AMADURECE sozinha, e chega como block_changed normal ==");
await espera(ESPERA_MADURAR);
ok(blocoEm(ana, cel) === PLANTACAO3, `a plantação está madura (${blocoEm(ana, cel)})`);

console.log("== colher a madura dá trigo E devolve a muda ==");
quebrar(ana, cel);
await espera(400);
ok(contar(ana, ITEM_TRIGO) === 1, `colheu 1 trigo (${contar(ana, ITEM_TRIGO)})`);
// 2026-08-05: a colheita devolve 1–3 sementes (antes era 1 fixo), e o sorteio
// aqui é o `Math.random` de verdade do servidor — então o que o fio prova é a
// FAIXA: sobraram 2, voltou de 1 a 3, logo 3 a 5. Fixar o número aqui seria
// reprovar por sorte numa rodada em cinco.
{
  const n = contar(ana, PLANTACAO0);
  ok(n >= 3 && n <= 5, `e a semente voltou de 1 a 3 (${n}, esperado 3–5)`);
}
ok(blocoEm(ana, cel) === AR, "a célula ficou vazia");

console.log("== cavar a terra debaixo derruba a horta (regra de apoio) ==");
plantar(ana, cel);
await espera(300);
ok(blocoEm(ana, cel) === PLANTACAO0, "replantou");
quebrar(ana, base);
await espera(600);
ok(blocoEm(ana, cel) === AR, "sem terra embaixo, a planta sumiu no tick");

console.log("== 3 trigo viram pão pela receita nova ==");
enviar(prof, `/dar ana ${ITEM_TRIGO} 2`); // + o que ela colheu = 3
await espera(400);
ok(contar(ana, ITEM_TRIGO) === 3, `a ana tem 3 trigos (${contar(ana, ITEM_TRIGO)})`);
ana.ws.send(JSON.stringify({ type: "fabricar", receita: REC_PAO }));
await espera(400);
ok(contar(ana, ITEM_PAO) === 1, `saiu 1 pão (${contar(ana, ITEM_PAO)})`);
ok(contar(ana, ITEM_TRIGO) === 0, "e os 3 trigos foram consumidos");

console.log("== de barriga CHEIA a mordida é recusada (comida não se joga fora) ==");
ok(fomeDe(ana) === 20, `a barra está cheia (${fomeDe(ana)})`);
comer(ana, slotDe(ana, ITEM_PAO));
await espera(350);
ok(contar(ana, ITEM_PAO) === 1, "o pão continua na mochila");

console.log("== com fome, comer enche a barra e gasta UMA unidade ==");
enviar(prof, `/dar ana ${ITEM_FRUTA} 2`);
await espera(400);
// esvazia a barra pelo caminho normal: andar custa esforço (0,01/bloco)
const passo = { ...ana.spawn };
for (let i = 0; i < 3000; i++) {
  passo.x = ana.spawn.x + (i % 2);
  mover(ana, passo);
}
await espera(700);
const fomeAntes = fomeDe(ana);
ok(fomeAntes < 20, `a barra desceu com o esforço (${fomeAntes})`);
comer(ana, slotDe(ana, ITEM_FRUTA));
await espera(400);
ok(fomeDe(ana) > fomeAntes, `comer encheu a barra (${fomeAntes} → ${fomeDe(ana)})`);
ok(contar(ana, ITEM_FRUTA) === 1, `gastou UMA fruta (${contar(ana, ITEM_FRUTA)} sobrando)`);

// 2026-08-21 (bug-629): esta seção dizia "a horta ATRAVESSA o save" e mandava
// `/salvar`, **um comando que nunca existiu** — `git log -S 'case "salvar"'` não
// acha nada. Ela passava por ACIDENTE: a resposta é "Comando desconhecido:
// /salvar…", e o `includes("salv")` casava com o eco do próprio comando. Nunca
// provou save nenhum. A ida-e-volta pelo disco é do teste puro (`comida.test.ts`).
// O que sobra aqui, e vale de verdade, é o que o `mover` de 3000 iterações logo
// acima põe em risco: o professor continua sendo ATENDIDO depois de o aluno
// inundar o servidor.
console.log("== depois da enxurrada de movimento o professor ainda é atendido ==");
enviar(prof, `/bloco ${base.x} ${base.y} ${base.z} ${TERRA}`);
// ⚠️ condição, NÃO relógio: com a fila cheia a resposta pode levar segundos. Os
// 800 ms fixos de antes faziam o smoke passar ou falhar conforme a CARGA da
// máquina — foi assim que ele começou a cair sem ninguém mexer em código.
const atendeu = await ate(
  () => prof.chats.some((t) => t.startsWith(`Bloco (${base.x}, ${base.y}, ${base.z})`)),
  10000,
);
ok(atendeu, "o professor continua sendo atendido depois da enxurrada de movimento");
plantar(ana, cel);
await espera(300);
// qualquer estágio serve: com LJ_CRESCIMENTO=5 a muda já pode ter crescido
// entre o place e esta linha — o que se prova aqui é que há horta na célula
const naCelula = blocoEm(ana, cel);
ok(
  naCelula >= PLANTACAO0 && naCelula <= PLANTACAO3,
  `a horta replantada está de pé (${naCelula})`,
);

for (const c of [prof, ana]) c.ws.close();
console.log(falhas === 0 ? "\nSMOKE /comida OK" : `\nSMOKE /comida FALHOU (${falhas})`);
process.exit(falhas === 0 ? 0 : 1);
