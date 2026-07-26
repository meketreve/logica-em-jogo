/**
 * Smoke do §🔁 (rede de segurança do streaming) contra o servidor REAL, num
 * mundo LAZY. Prova de ponta a ponta, pelo fio: (a) bug-211 — reanunciar o
 * `radius` depois do join traz o anel novo; (b) `pedir_coluna` faz o servidor
 * reenviar uma coluna que o cliente "perdeu"; (c) o teto de pedidos/s corta o
 * flood; (d) pedido fora do raio / fora do mundo não derruba o servidor.
 *
 * Rode com o servidor no ar (mundo ENORME = streaming ligado):
 *   LJ_SAVE=<scratch>/smoke-coluna.ljw LJ_NOVO=1 LJ_TAMANHO=E LJ_PORT=8099 \
 *     npm run start -w server
 *   node server/src/cenarios/_smoke-pedir-coluna.mjs 8099
 */
const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const COLUNAS_MAGIC = 0x30434a4c; // "LJC0"
const LAZY_MAGIC = 0x30454a4c; // "LJE0"

/** Lê só o cabeçalho do lote LJC0: [cx,cz] de cada coluna (sem copiar bytes). */
function colunasDoLote(buf, dimsY) {
  const view = new DataView(buf);
  const n = view.getUint16(4, true);
  const porColuna = 4 + dimsY * 4096;
  const out = [];
  let off = 8;
  for (let i = 0; i < n; i++) {
    out.push([view.getUint16(off, true), view.getUint16(off + 2, true)]);
    off += porColuna;
  }
  return out;
}

const ws = new WebSocket(URL);
ws.binaryType = "arraybuffer";
/** Todas as colunas recebidas, em ordem de chegada. */
const recebidas = [];
let dims = null;
let spawn = null;
ws.onmessage = (e) => {
  if (!(e.data instanceof ArrayBuffer)) {
    const m = JSON.parse(e.data);
    if (m.type === "spawn") spawn = m;
    return;
  }
  const magic = new DataView(e.data).getUint32(0, true);
  if (magic === LAZY_MAGIC) {
    const v = new DataView(e.data);
    dims = { x: v.getUint16(4, true), z: v.getUint16(6, true), y: v.getUint16(8, true) };
    return;
  }
  if (magic === COLUNAS_MAGIC && dims) {
    for (const c of colunasDoLote(e.data, dims.y)) recebidas.push(c);
  }
};
ws.onopen = () => ws.send(JSON.stringify({ type: "join", name: "smoke", pin: "1234" }));
await espera(600);

console.log("§🔁 smoke — streaming");
ok(dims !== null, `mundo LAZY (header LJE0: ${dims ? `${dims.x}×${dims.z}×${dims.y}` : "não veio"})`);
if (!dims) {
  console.log("mundo não é lazy — suba o host com LJ_TAMANHO=E");
  process.exit(1);
}
ok(spawn !== null, "spawn recebido");
const scx = Math.floor(spawn.x / 16);
const scz = Math.floor(spawn.z / 16);

// o cliente precisa se ANUNCIAR onde está (o interesse segue o `move`)
ws.send(JSON.stringify({ type: "move", x: spawn.x, y: spawn.y, z: spawn.z, yaw: 0, pitch: 0 }));
ws.send(JSON.stringify({ type: "radius", chunks: 4 }));
await espera(2500);
const comRaio4 = recebidas.length;
ok(comRaio4 > 0, `raio 4 trouxe ${comRaio4} colunas`);
const antesDeParar = recebidas.length;
await espera(1200);
ok(recebidas.length === antesDeParar, "raio esgotado: para de mandar (fire-and-forget)");

// (a) bug-211 — REANUNCIAR o raio maior traz o anel novo
const marcaRaio = recebidas.length;
ws.send(JSON.stringify({ type: "radius", chunks: 8 }));
await espera(2500);
const anelNovo = recebidas.slice(marcaRaio);
const maisLonge = anelNovo.reduce(
  (m, [cx, cz]) => Math.max(m, Math.max(Math.abs(cx - scx), Math.abs(cz - scz))),
  0,
);
ok(anelNovo.length > 0, `bug-211: raio 4→8 trouxe ${anelNovo.length} colunas novas`);
ok(maisLonge > 4, `e são do ANEL NOVO (mais distante: ${maisLonge} > 4)`);

// (b) pedir_coluna reenvia
const marcaPedido = recebidas.length;
ws.send(JSON.stringify({ type: "pedir_coluna", cx: scx, cz: scz }));
await espera(800);
const voltou = recebidas
  .slice(marcaPedido)
  .some(([cx, cz]) => cx === scx && cz === scz);
ok(voltou, `pedir_coluna ${scx},${scz} reenviou a coluna do spawn`);

// (c) teto de pedidos/s: flood de 24 pedidos distintos numa janela
const marcaFlood = recebidas.length;
for (let i = 0; i < 24; i++) {
  ws.send(JSON.stringify({
    type: "pedir_coluna",
    cx: scx + (i % 5) - 2,
    cz: scz + Math.floor(i / 5) - 2,
  }));
}
await espera(400); // dentro da MESMA janela de 1 s do servidor
const noFlood = recebidas.length - marcaFlood;
ok(noFlood > 0 && noFlood <= 8, `teto por segundo cortou o flood (24 pedidos → ${noFlood} colunas)`);

// (d) pedidos inválidos não derrubam o host
ws.send(JSON.stringify({ type: "pedir_coluna", cx: -1, cz: 0 }));
ws.send(JSON.stringify({ type: "pedir_coluna", cx: 99999, cz: 99999 }));
ws.send(JSON.stringify({ type: "pedir_coluna", cx: scx + 40, cz: scz }));
ws.send(JSON.stringify({ type: "pedir_coluna" }));
await espera(600);
ok(ws.readyState === WebSocket.OPEN, "pedidos inválidos: servidor segue no ar");
const marcaFinal = recebidas.length;
ws.send(JSON.stringify({ type: "chat", text: "oi" }));
await espera(600);
ok(recebidas.length === marcaFinal, "e não reenviou coluna nenhuma por causa deles");

ws.close();
console.log(falhas === 0 ? "\n✅ smoke §🔁 ok" : `\n❌ ${falhas} falha(s)`);
process.exit(falhas === 0 ? 0 : 1);
