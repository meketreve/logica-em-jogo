/**
 * Smoke da §🎣 PESCA contra o servidor REAL (2026-11-09). Prova pelo fio, com
 * três clientes, o que o teste puro (`pesca.session.test.ts`) não alcança: o
 * relógio de verdade do tick (a mordida chega sozinha em 5–20 s), o `sua` só
 * no fio de quem pesca, o colega VENDO a boia e a mão (`mao_de`), e a linha
 * que se recolhe quando o pescador larga a vara ou SAI do jogo.
 *
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-pesca.ljw LJ_CODIGO=prof2026 \
 *     LJ_PORT=8115 npm run start -w server
 *   node server/src/cenarios/_smoke-pesca.mjs 8115
 */
const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// ids do protocolo (shared/src/blocks.ts) — append-only
const ITEM_BALDE_AGUA = 901;
const ITEM_BALDE_VAZIO = 900;
const ITEM_VARA = 944;
const SAI = [938, 28, 943, 942]; // SAI_DA_PESCA

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, spawn: null, invs: [], chats: [], boias: [], maos: [] };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "ping") ws.send(JSON.stringify({ type: "pong", t: m.t }));
    if (m.type === "spawn") rec.spawn = { x: m.x, y: m.y, z: m.z };
    if (m.type === "inventario") rec.invs.push(m.slots);
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "boia" || m.type === "boia_fisgou" || m.type === "boia_fim") rec.boias.push(m);
    if (m.type === "mao_de") rec.maos.push(m);
  };
  return rec;
}
const enviar = (rec, m) => rec.ws.send(JSON.stringify(m));
const chat = (rec, text) => enviar(rec, { type: "chat", text });
const ultimoInv = (rec) => rec.invs.at(-1) ?? [];
const slotDe = (rec, id) => ultimoInv(rec).find((s) => s.id === id)?.slot;
const ate = async (cond, ms) => {
  const fim = Date.now() + ms;
  while (!cond() && Date.now() < fim) await espera(100);
  return cond();
};

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
const bia = cliente({ name: "bia", pin: "2222" });
await espera(2000);
ok(ana.spawn !== null && bia.spawn !== null, "os três entraram");
const s = prof.spawn;
for (const c of [prof, ana, bia]) enviar(c, { type: "move", x: s.x, y: s.y, z: s.z, yaw: 0, pitch: 0 });
chat(prof, "/bichos desligar");
chat(prof, "/modo sobrevivencia all");
await espera(400);
chat(prof, `/dar ana ${ITEM_BALDE_AGUA} 1`);
chat(prof, `/dar ana ${ITEM_VARA} 1`);
await ate(() => slotDe(ana, ITEM_VARA) !== undefined && slotDe(ana, ITEM_BALDE_AGUA) !== undefined, 2000);

console.log("== o balde faz a poça (o único jeito de pôr água) ==");
let agua = null;
for (const [dx, dy] of [[2, 0], [2, 1], [3, 0], [3, 1], [2, -1]]) {
  const cel = { x: Math.floor(s.x) + dx, y: Math.floor(s.y) + dy, z: Math.floor(s.z) };
  enviar(ana, { type: "balde", ...cel, encher: false, slot: slotDe(ana, ITEM_BALDE_AGUA) });
  if (await ate(() => slotDe(ana, ITEM_BALDE_VAZIO) !== undefined, 800)) {
    agua = cel;
    break;
  }
}
ok(agua !== null, `água despejada em ${JSON.stringify(agua)}`);

console.log("== a mão: a bia vê a ana pegar a vara ==");
enviar(ana, { type: "mao", id: ITEM_VARA });
ok(await ate(() => bia.maos.some((m) => m.item === ITEM_VARA), 1500), "a bia recebeu `mao_de` com a vara");

console.log("== lançar: os dois veem a boia, só a ana com `sua` ==");
const vara = () => slotDe(ana, ITEM_VARA);
enviar(ana, { type: "pescar", ...agua, slot: vara() });
ok(await ate(() => ana.boias.some((b) => b.type === "boia" && b.sua === true), 1500), "a ana recebeu a boia com `sua`");
const boiaBia = bia.boias.find((b) => b.type === "boia");
ok(boiaBia !== undefined && boiaBia.sua === undefined, "a bia viu a boia, sem `sua`");

console.log("== a mordida chega SOZINHA pelo tick (5–20 s) ==");
const t0 = Date.now();
const mordeu = await ate(() => ana.boias.some((b) => b.type === "boia_fisgou"), 22000);
ok(mordeu, `a boia afundou (em ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
ok(bia.boias.some((b) => b.type === "boia_fisgou"), "a bia viu afundar também");
enviar(ana, { type: "pescar", ...agua, slot: vara() });
ok(await ate(() => ana.boias.some((b) => b.type === "boia_fim" && b.motivo === "pegou"), 1500), "puxou na hora: `pegou`");
const veio = ultimoInv(ana).filter((x) => SAI.includes(x.id));
ok(veio.length === 1, `entrou na mochila: ${JSON.stringify(veio)}`);
ok(ultimoInv(ana).find((x) => x.id === ITEM_VARA)?.dano === 1, "a vara gastou 1");
ok(ana.chats.some((t) => /^Você pescou um .+!$|^Só veio lixo/.test(t)), "o chat contou o que veio");

console.log("== CONTROLE NEGATIVO: largar a vara recolhe a linha (e nada entra) ==");
const qtdAntes = veio.length;
enviar(ana, { type: "pescar", ...agua, slot: vara() });
await ate(() => ana.boias.filter((b) => b.type === "boia").length >= 2, 1500);
enviar(ana, { type: "mao", id: null });
ok(
  await ate(() => bia.boias.some((b) => b.type === "boia_fim" && b.motivo === "recolheu"), 1500),
  "a bia viu a linha ser `recolheu`",
);
ok(ultimoInv(ana).filter((x) => SAI.includes(x.id)).length === qtdAntes, "e nada novo entrou na mochila");

console.log("== sair do jogo leva a boia junto ==");
enviar(ana, { type: "mao", id: ITEM_VARA });
await espera(200);
const recolhidasAntes = bia.boias.filter((b) => b.type === "boia_fim").length;
enviar(ana, { type: "pescar", ...agua, slot: vara() });
await ate(() => bia.boias.filter((b) => b.type === "boia").length >= 3, 1500);
ana.ws.close();
ok(
  await ate(() => bia.boias.filter((b) => b.type === "boia_fim").length > recolhidasAntes, 2000),
  "a ana saiu: a bia viu a boia sumir",
);

for (const c of [prof, bia]) c.ws.close();
console.log(falhas ? `\n✗ ${falhas} falha(s)` : "\n✓ pesca: tudo certo");
process.exit(falhas ? 1 : 0);
