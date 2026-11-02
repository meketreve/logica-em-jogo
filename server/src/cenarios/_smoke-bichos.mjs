/**
 * Smoke dos §🐄 BICHOS contra o servidor REAL (2026-11-02). Prova pelo fio o
 * que o teste puro não alcança: que o mundo procedural chega com bichos JÁ no
 * join, que o cliente só conhece um bicho pelo `bichos {add}` (o id do clique
 * sai DAQUI, não de um número inventado), que o movimento chega em lote, e que
 * cada clique é uma intenção que só o SERVIDOR resolve: tesoura na ovelha preta
 * dá lã PRETA sem tirar vida, balde vazio na vaca vira balde de leite, cinco
 * golpes derrubam a vaca e põem carne na mochila, e o `debug_stats` traz o
 * custo do sistema dos bichos no perfil.
 *
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-bichos.ljw LJ_CODIGO=prof2026 \
 *     LJ_PORT=8113 npm run start -w server
 *   node server/src/cenarios/_smoke-bichos.mjs 8113
 */
const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// ids do protocolo (shared/src/blocks.ts e shared/src/bichos.ts) — append-only
const ITEM_BALDE_VAZIO = 900;
const ITEM_TESOURA = 931;
const ITEM_BALDE_LEITE = 932;
const ITEM_CARNE_CRUA = 934;
const LA_PRETA = 301;
const TIPO = { vaca: 0, ovelha: 2 };

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = {
    ws,
    spawn: null,
    invs: [],
    chats: [],
    stats: [],
    eventos: [],
    /** id → [tipo, variante, x, y, z] — o que o cliente SABE que existe */
    bichos: new Map(),
    sumidos: new Set(),
    movidosLotes: 0,
  };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "ping") ws.send(JSON.stringify({ type: "pong", t: m.t }));
    if (m.type === "spawn") rec.spawn = { x: m.x, y: m.y, z: m.z };
    if (m.type === "inventario") rec.invs.push(m.slots);
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "debug_stats") rec.stats.push(m);
    if (m.type === "bicho_evento") rec.eventos.push(m);
    if (m.type === "bichos") {
      for (const [id, tipo, variante, x, y, z] of m.add) rec.bichos.set(id, [tipo, variante, x, y, z]);
    }
    if (m.type === "bichos_movidos") {
      rec.movidosLotes++;
      for (let i = 0; i + 5 < m.m.length; i += 6) {
        const b = rec.bichos.get(m.m[i]);
        if (b) rec.bichos.set(m.m[i], [b[0], b[1], m.m[i + 1], m.m[i + 2], m.m[i + 3]]);
      }
    }
    if (m.type === "bichos_sumiram") {
      for (const id of m.ids) {
        rec.bichos.delete(id);
        rec.sumidos.add(id);
      }
    }
  };
  return rec;
}
const enviar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));
const mover = (rec, x, y, z) => rec.ws.send(JSON.stringify({ type: "move", x, y, z, yaw: 0, pitch: 0 }));
const ultimoInv = (rec) => rec.invs.at(-1) ?? [];
const slotDe = (rec, id) => ultimoInv(rec).find((s) => s.id === id)?.slot;
const contar = (rec, id) => ultimoInv(rec).reduce((n, s) => (s.id === id ? n + s.qtd : n), 0);
const doTipo = (rec, tipo) => [...rec.bichos.entries()].filter(([, b]) => b[0] === tipo).map(([id]) => id);
/** Vai até o bicho (o bicho passeia: o clique é com ele ao alcance). */
const irAte = async (rec, id) => {
  const b = rec.bichos.get(id);
  if (b) mover(rec, b[2], b[3], b[4] + 1.2);
  await espera(250);
};

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
await espera(2500); // a passada de 1 s povoa o entorno e manda a vista

console.log("== mundo procedural: os bichos chegam sozinhos ==");
const naturais = ana.bichos.size;
ok(naturais > 0, `a ana já conhece ${naturais} bicho(s) sem ninguém pedir`);
ok(ana.movidosLotes > 0, `o movimento chega em lote (${ana.movidosLotes} lotes \`bichos_movidos\`)`);

console.log("== /bichos limpar: some tudo, e o cliente fica sabendo ==");
enviar(prof, "/bichos desligar"); // senão as colunas novas repovoam no meio do teste
enviar(prof, "/bichos limpar todos");
await espera(500);
ok(ana.bichos.size === 0, `nenhum bicho sobrou na vista da ana (${ana.bichos.size})`);
ok(ana.sumidos.size >= naturais, "cada um chegou como `bichos_sumiram`");

console.log("== o aluno não traz bicho; o professor traz ==");
enviar(ana, "/bicho vaca");
await espera(300);
ok(ana.chats.some((t) => t.includes("Somente o professor")), "a ana foi recusada");
for (const c of [prof, ana]) mover(c, prof.spawn.x, prof.spawn.y, prof.spawn.z);
await espera(300);
enviar(prof, "/modo sobrevivencia all");
enviar(prof, "/bicho ovelha 1 ovelha_preta");
enviar(prof, "/bicho vaca 1");
await espera(600);
const ovelha = doTipo(ana, TIPO.ovelha)[0];
const vaca = doTipo(ana, TIPO.vaca)[0];
ok(ovelha !== undefined, "a ovelha preta chegou pela vista da ana");
ok(vaca !== undefined, "a vaca também");

console.log("== tesoura na ovelha preta: lã PRETA, sem machucar ==");
enviar(prof, `/dar ana ${ITEM_TESOURA} 1`);
await espera(400);
await irAte(ana, ovelha);
ana.ws.send(JSON.stringify({ type: "usar_bicho", id: ovelha, slot: slotDe(ana, ITEM_TESOURA) }));
await espera(500);
ok(contar(ana, LA_PRETA) >= 1, `a ana ganhou ${contar(ana, LA_PRETA)} lã preta`);
ok(ana.eventos.some((e) => e.id === ovelha && e.evento === "tosquia"), "o evento `tosquia` saiu (o gancho do som)");
ok(!ana.eventos.some((e) => e.id === ovelha && e.evento === "dano"), "e a ovelha NÃO se machucou");
const durTesoura = ultimoInv(ana).find((s) => s.id === ITEM_TESOURA);
ok((durTesoura?.dano ?? 0) === 1, "a tesoura gastou 1 de durabilidade");

console.log("== balde vazio na vaca: leite ==");
enviar(prof, `/dar ana ${ITEM_BALDE_VAZIO} 1`);
await espera(400);
await irAte(ana, vaca);
ana.ws.send(JSON.stringify({ type: "usar_bicho", id: vaca, slot: slotDe(ana, ITEM_BALDE_VAZIO) }));
await espera(500);
ok(contar(ana, ITEM_BALDE_LEITE) === 1, "o balde virou balde de leite");

console.log("== cinco golpes derrubam a vaca, e ela vira carne na mochila ==");
for (let i = 0; i < 8 && !ana.sumidos.has(vaca); i++) {
  await irAte(ana, vaca);
  ana.ws.send(JSON.stringify({ type: "bater_bicho", id: vaca }));
  await espera(600); // acima do cooldown do golpe (0,5 s)
}
ok(ana.sumidos.has(vaca), "a vaca sumiu da vista");
ok(ana.eventos.some((e) => e.id === vaca && e.evento === "morte"), "o evento `morte` saiu");
ok(contar(ana, ITEM_CARNE_CRUA) >= 1, `a ana ganhou ${contar(ana, ITEM_CARNE_CRUA)} carne crua`);

console.log("== o perfil diz quanto os bichos custam ==");
await espera(1200);
const st = ana.stats.at(-1);
ok(typeof st?.sistemas?.bichos === "number", `\`sistemas.bichos\` = ${st?.sistemas?.bichos} ms/tick`);
ok(typeof st?.bichos?.total === "number", `o resumo dos bichos chegou (total ${st?.bichos?.total})`);
ok(
  Object.keys(st?.sistemas ?? {}).length >= 8,
  `o tick vem repartido em ${Object.keys(st?.sistemas ?? {}).length} sistemas`,
);

for (const c of [prof, ana]) c.ws.close();
console.log(falhas ? `\n✗ ${falhas} falha(s)` : "\n✓ bichos: tudo certo");
process.exit(falhas ? 1 : 0);
