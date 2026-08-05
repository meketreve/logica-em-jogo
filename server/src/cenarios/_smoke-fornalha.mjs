/**
 * Smoke do §🍖 F10b (a FORNALHA) contra o servidor REAL. Prova pelo fio o que o
 * teste puro não alcança: que o clique direito ABRE (o servidor responde com o
 * conteúdo, e é a resposta que abre o painel), que a transferência é do
 * SERVIDOR, que o tick cozinha e troca o BYTE do bloco pra fornalha acesa (é o
 * byte que acende a luz pra turma inteira), que dois jogadores no mesmo bloco
 * veem o mesmo conteúdo, e que quebrar com coisa dentro é RECUSADO com aviso.
 *
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-fornalha.ljw LJ_CODIGO=prof2026 \
 *     LJ_PORT=8109 npm run start -w server
 *   node server/src/cenarios/_smoke-fornalha.mjs 8109
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
const COBBLE = 3;
const MINERIO_FERRO = 117;
const FORNALHA = 186;
const FORNALHA_ACESA = 187;
const PLANKS = 7;
const LINGOTE_FERRO = 909;
// slots: 0..26 = mochila, 27+i = container (o índice UNIFICADO do protocolo)
const INV_SLOTS = 27;
const C_ENTRADA = INV_SLOTS + 0;
const C_COMBUSTIVEL = INV_SLOTS + 1;
const C_SAIDA = INV_SLOTS + 2;
// 100 ticks a 10 Hz = 10 s por peça (TICKS_POR_COZIMENTO). O combustível do
// smoke é TÁBUA (1 cozimento exato): com carvão o fogo duraria 80 s, e o teste
// da quebra teria de esperar ele apagar. O 8× do carvão é do teste puro.
const COZIMENTO_MS = 10_000;
// índice na lista RECEITAS (APPEND-only — ver receitas.ts): grupo FUNDICAO
const REC_FORNALHA = 111; // 8 pedregulho → 1 fornalha

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, spawn: null, invs: [], chats: [], blocos: new Map(), conts: [], fechados: 0 };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "spawn") rec.spawn = { x: m.x, y: m.y, z: m.z };
    if (m.type === "inventario") rec.invs.push(m.slots);
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "block_changed") rec.blocos.set(`${m.x},${m.y},${m.z}`, m.blockId);
    if (m.type === "container") rec.conts.push(m);
    if (m.type === "container_fechado") rec.fechados++;
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
const abrir = (rec, p) => rec.ws.send(JSON.stringify({ type: "use_block", ...p }));
const transferir = (rec, p, de, para) =>
  rec.ws.send(JSON.stringify({ type: "mover_container", ...p, de, para }));
/** O último `container` daquela célula que chegou pra este cliente. */
const cont = (rec, p) =>
  [...rec.conts].reverse().find((c) => c.x === p.x && c.y === p.y && c.z === p.z) ?? null;
const noSlot = (c, slot) => (c?.slots ?? []).find((s) => s.slot === slot) ?? null;

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
await espera(1200);
mover(ana, ana.spawn);
mover(prof, ana.spawn);

console.log("== sobrevivência, e a ana fabrica a própria fornalha (8 pedregulho) ==");
enviar(prof, "/modo sobrevivencia all");
await espera(400);
enviar(prof, `/dar ana ${COBBLE} 8`);
await espera(400);
ok(contar(ana, COBBLE) === 8, `a ana tem 8 pedregulhos (${contar(ana, COBBLE)})`);
ana.ws.send(JSON.stringify({ type: "fabricar", receita: REC_FORNALHA }));
await espera(400);
ok(contar(ana, FORNALHA) === 1, `nasceu 1 fornalha (${contar(ana, FORNALHA)})`);
ok(contar(ana, COBBLE) === 0, `e custou os 8 pedregulhos (${contar(ana, COBBLE)})`);

console.log("== coloca a fornalha ao lado e abre com o clique direito ==");
// 2 blocos ao lado (na célula do próprio jogador o servidor recusa a
// colocação) e a célula é LIMPA antes: o terreno do gen pode estar ali
const cel = {
  x: Math.floor(ana.spawn.x) + 2,
  y: Math.floor(ana.spawn.y),
  z: Math.floor(ana.spawn.z),
};
enviar(prof, `/bloco ${cel.x} ${cel.y} ${cel.z} ${AR}`);
await espera(400);
ana.ws.send(JSON.stringify({ type: "place_block", ...cel, blockId: FORNALHA }));
await espera(400);
ok(blocoEm(ana, cel) === FORNALHA, `a fornalha está no mundo (${blocoEm(ana, cel)})`);
abrir(ana, cel);
await espera(400);
ok(cont(ana, cel)?.tipo === "fornalha", "o servidor respondeu com o conteúdo (painel abre)");
ok((cont(ana, cel)?.slots ?? []).length === 0, "e ela está vazia");

console.log("== a transferência é do SERVIDOR: minério e tábua entram ==");
enviar(prof, `/dar ana ${MINERIO_FERRO} 1`);
enviar(prof, `/dar ana ${PLANKS} 1`);
await espera(500);
transferir(ana, cel, slotDe(ana, MINERIO_FERRO), C_ENTRADA);
await espera(350);
transferir(ana, cel, slotDe(ana, PLANKS), C_COMBUSTIVEL);
await espera(350);
ok(contar(ana, MINERIO_FERRO) === 0, "o minério saiu da mochila");
ok(noSlot(cont(ana, cel), 0)?.qtd === 1, "e está na ENTRADA da fornalha");
// a tábua NÃO é conferida no slot de combustível: o tick seguinte já a
// ACENDE e consome a única unidade (é o comportamento certo). O que se
// confere é que ela saiu da mochila — e que o fogo pegou, logo abaixo.
ok(contar(ana, PLANKS) === 0, "a tábua saiu da mochila pro slot de queimar");

console.log("== o tick acende a fornalha: o BYTE do bloco muda (e com ele a luz) ==");
await espera(600);
ok(blocoEm(ana, cel) === FORNALHA_ACESA, `a fornalha acendeu (byte ${blocoEm(ana, cel)})`);
ok((cont(ana, cel)?.queimando ?? 0) > 0, "e o fogo está andando");

console.log("== 10 s depois sai o lingote, a tábua acaba e a fornalha APAGA sozinha ==");
await espera(COZIMENTO_MS + 1200);
ok(noSlot(cont(ana, cel), 2)?.id === LINGOTE_FERRO, "há lingote de ferro na SAÍDA");
ok(blocoEm(ana, cel) === FORNALHA, `e o byte voltou a apagada (${blocoEm(ana, cel)})`);
transferir(ana, cel, C_SAIDA, 0);
await espera(400);
ok(contar(ana, LINGOTE_FERRO) >= 1, `o lingote foi pra mochila (${contar(ana, LINGOTE_FERRO)})`);

console.log("== a SAÍDA é de mão única: empurrar item pra dentro dela é recusado ==");
enviar(prof, `/dar ana ${COBBLE} 2`);
await espera(400);
transferir(ana, cel, slotDe(ana, COBBLE), C_SAIDA);
await espera(350);
ok(contar(ana, COBBLE) === 2, "o pedregulho continua na mochila");
ok(noSlot(cont(ana, cel), 2) === null, "e a saída continua vazia");

console.log("== dois no MESMO bloco veem a mesma coisa ==");
abrir(prof, cel);
await espera(400);
ok(cont(prof, cel) !== null, "o professor também abriu a fornalha");
// a ana põe o pedregulho na ENTRADA (pedra não funde: fica lá parada) e o
// professor, que não tocou em nada, recebe o conteúdo NOVO
transferir(ana, cel, slotDe(ana, COBBLE), C_ENTRADA);
await espera(450);
ok(noSlot(cont(prof, cel), 0)?.id === COBBLE, "o professor viu o pedregulho entrar");

console.log("== fornalha COM COISA DENTRO não quebra, e o aviso sai no chat ==");
const chatsAntes = ana.chats.length;
ana.ws.send(JSON.stringify({ type: "break_block", ...cel }));
await espera(450);
ok(blocoEm(ana, cel) !== AR, "a fornalha continua de pé");
ok(
  ana.chats.slice(chatsAntes).some((t) => t.includes("esvazie")),
  "e a ana foi avisada pra esvaziar antes",
);

console.log("== esvaziada, ela quebra e volta pra mochila ==");
transferir(ana, cel, C_ENTRADA, 1);
await espera(400);
const antesQuebra = contar(ana, FORNALHA);
ana.ws.send(JSON.stringify({ type: "break_block", ...cel }));
await espera(500);
ok(blocoEm(ana, cel) === AR, "a célula ficou vazia");
ok(contar(ana, FORNALHA) === antesQuebra + 1, "e a fornalha voltou pra mochila");
ok(ana.fechados > 0, "o painel de quem estava com ela aberta foi FECHADO pelo servidor");

for (const c of [prof, ana]) c.ws.close();
console.log(falhas === 0 ? "\nSMOKE /fornalha OK" : `\nSMOKE /fornalha FALHOU (${falhas})`);
process.exit(falhas === 0 ? 0 : 1);
