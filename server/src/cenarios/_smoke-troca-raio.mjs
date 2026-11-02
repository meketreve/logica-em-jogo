/**
 * Smoke da TROCA DE AULA em mundo LAZY (cp19 + F2), contra o servidor REAL.
 * Prova o que o perfil de 2026-07-26 (18:14) sugeria: `/mundo carregar` cria
 * uma SESSÃO nova e o `admitir` zera o raio de interesse pra RAIO_PADRAO (6) —
 * quem estava com raio 12 passa a receber só o miolo, e nem o `pedir_coluna`
 * do §🔁 resolve (o servidor recusa além de raio+FOLGA_DESCARTE). Reanunciar o
 * `radius` depois da troca (o que o cliente passou a fazer) traz o anel de volta.
 *
 * Precisa de DOIS mundos ENORMES: o que está no ar e o que será carregado.
 *   LJ_TAMANHO=E LJ_NOVO=1 LJ_SAVE=mundos/smokeb.ljw npm run start -w server  (mata depois)
 *   LJ_TAMANHO=E LJ_NOVO=1 LJ_SAVE=mundos/smokea.ljw LJ_CODIGO=prof2026 LJ_PORT=8099 \
 *     npm run start -w server
 *   node server/src/cenarios/_smoke-troca-raio.mjs 8099 smokeb
 */
const PORTA = process.argv[2] ?? "8080";
const ALVO = process.argv[3] ?? "smokeb";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const COLUNAS_MAGIC = 0x31434a4c; // "LJC1" (ids de 16 bits, 2026-09-12)
const LAZY_MAGIC = 0x30454a4c; // "LJE0"

function colunasDoLote(buf, dimsY) {
  const view = new DataView(buf);
  const n = view.getUint16(4, true);
  const out = [];
  let off = 8;
  for (let i = 0; i < n; i++) {
    out.push([view.getUint16(off, true), view.getUint16(off + 2, true)]);
    off += 4;
    for (let cy = 0; cy < dimsY; cy++) off += 1 + (view.getUint8(off) === 1 ? 8192 : 4096);
  }
  return out;
}

/** Cliente que conta colunas e sabe o anel (distância de Chebyshev) de cada uma. */
function aluno(nome) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, colunas: [], dims: null, spawn: null, mundos: 0, avisoTroca: 0, mundo2: 0, seq: 0, avisoSeq: 0, mundo2Seq: 0 };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", name: nome, pin: "1111" }));
  ws.onmessage = (e) => {
    rec.seq++; // ORDEM de chegada: o relógio em ms empata quando as duas chegam no mesmo ms
    if (!(e.data instanceof ArrayBuffer)) {
      const m = JSON.parse(e.data);
    // bug-672: um cliente de verdade RESPONDE o ping — sem isto o host derruba
    // este cenário em 15 s de espera (cozimento, crescimento, streaming…)
    if (m.type === "ping") ws.send(JSON.stringify({ type: "pong", t: m.t }));
      if (m.type === "spawn") rec.spawn = m;
      // §🕐 aviso que a troca começou — tem que chegar ANTES do mundo novo
      if (m.type === "mundo_trocando") {
        rec.avisoTroca = Date.now();
        rec.avisoSeq = rec.seq;
      }
      return;
    }
    const v = new DataView(e.data);
    const magic = v.getUint32(0, true);
    if (magic === LAZY_MAGIC) {
      rec.dims = { x: v.getUint16(4, true), z: v.getUint16(6, true), y: v.getUint16(8, true) };
      rec.mundos++;
      if (rec.mundos === 2) {
        rec.mundo2 = Date.now();
        rec.mundo2Seq = rec.seq;
      }
      rec.colunas = []; // mundo novo: contagem recomeça
      return;
    }
    if (magic === COLUNAS_MAGIC && rec.dims) {
      for (const c of colunasDoLote(e.data, rec.dims.y)) rec.colunas.push(c);
    }
  };
  return rec;
}

/** Maior anel alcançado a partir do chunk do spawn. */
const anelMax = (rec) => {
  if (!rec.spawn) return -1;
  const pcx = Math.floor(rec.spawn.x / 16);
  const pcz = Math.floor(rec.spawn.z / 16);
  let max = 0;
  for (const [cx, cz] of rec.colunas) {
    max = Math.max(max, Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz)));
  }
  return max;
};

const a = aluno("ana");
await espera(600);
a.ws.send(JSON.stringify({ type: "radius", chunks: 12 }));
await espera(4000);

console.log("== antes da troca (raio 12 anunciado) ==");
const anelAntes = anelMax(a);
ok(a.mundos === 1, "aluno recebeu o header do mundo lazy");
ok(anelAntes > 6, `streaming passou do RAIO_PADRAO: anel ${anelAntes} (esperado > 6)`);

const prof = new WebSocket(URL);
prof.onopen = () =>
  prof.send(JSON.stringify({ type: "join", name: "profa", pin: "1234", codigo: "prof2026" }));
await espera(700);
prof.send(JSON.stringify({ type: "chat", text: `/mundo carregar ${ALVO}` }));
await espera(5000);

console.log("== depois da troca, SEM reanunciar o raio ==");
ok(a.mundos === 2, "aluno recebeu o mundo novo sem reconectar");
ok(
  // "antes" é ORDEM de mensagem, não ms: a 0 ms de distância o `<` do relógio
  // reprovava uma ordem certa (intermitente, 1 em 3 rodadas em 02/11)
  a.avisoSeq > 0 && a.mundo2Seq > 0 && a.avisoSeq < a.mundo2Seq,
  `§🕐 aviso "mundo_trocando" chegou ANTES do mundo novo (mensagem ${a.avisoSeq} × ${a.mundo2Seq}, ${a.mundo2 - a.avisoTroca} ms)`,
);
const anelDepois = anelMax(a);
ok(
  anelDepois <= 6,
  `sessão nova voltou pro RAIO_PADRAO: anel ${anelDepois} (o aluno pediu 12 antes da troca)`,
);

console.log("== o cliente reanuncia o raio (o que o main.ts passou a fazer) ==");
a.ws.send(JSON.stringify({ type: "radius", chunks: 12 }));
await espera(5000);
const anelReanunciado = anelMax(a);
ok(
  anelReanunciado > 6,
  `anel volta a crescer: ${anelDepois} → ${anelReanunciado} (esperado > 6)`,
);

a.ws.close();
prof.close();
console.log(falhas === 0 ? "\nTUDO OK" : `\n${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);
