/**
 * Smoke da PRESENÇA (bug-672) contra o servidor REAL. É o único jeito de provar
 * este conserto: o bug é sobre SOCKET — um cliente que parou de responder mas
 * cujo TCP continua de pé. Teste puro não tem socket, e foi exatamente esse o
 * caso que a escola viu (tablet minimizado/fechado prendendo o nome do aluno).
 *
 * O que ele prova:
 * 1. o servidor manda `ping` de tempos em tempos;
 * 2. quem RESPONDE `pong` fica em jogo além do tempo limite;
 * 3. quem CALA (o tablet congelado — socket vivo, ninguém respondendo) é
 *    desconectado: o host FECHA o socket dele;
 * 4. e aí o mesmo nome entra de novo — a queixa original, resolvida;
 * 5. quem responde não é derrubado junto.
 *
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-presenca.ljw LJ_CODIGO=prof2026 \
 *     LJ_PORT=8110 npm run start -w server
 *   node server/src/cenarios/_smoke-presenca.mjs 8110
 */
const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// espelho de shared/src/constants.ts (o smoke fala JSON, não importa TS)
const HEARTBEAT_TIMEOUT_MS = 15000;

/**
 * @param join dados do join
 * @param responder false = o TABLET CONGELADO: o socket segue aberto, mas
 *   ninguém responde ao ping. É o coração deste smoke.
 */
function cliente(join, responder = true) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, pings: 0, negado: null, fechou: false, codigoFecho: null, entrou: false };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "ping") {
      rec.pings++;
      if (responder) ws.send(JSON.stringify({ type: "pong", t: m.t }));
    }
    if (m.type === "spawn") rec.entrou = true;
    if (m.type === "join_denied") rec.negado = m.reason;
  };
  ws.onclose = (e) => {
    rec.fechou = true;
    rec.codigoFecho = e.code;
  };
  return rec;
}

console.log("== a ana entra e o servidor começa a perguntar ==");
const ana = cliente({ name: "ana", pin: "1111" });
await espera(1500);
ok(ana.entrou, "a ana entrou no mundo");

console.log("== 1. o servidor manda `ping` ==");
await espera(5000);
ok(ana.pings >= 1, `a ana recebeu ping (${ana.pings})`);

console.log("== 2. o nome fica PRESO enquanto ela está mesmo em jogo ==");
const intrusa = cliente({ name: "ana", pin: "1111" });
await espera(1200);
ok(
  typeof intrusa.negado === "string" && intrusa.negado.includes("Já existe"),
  `entrar com o nome de quem está jogando é recusado (${intrusa.negado})`,
);
intrusa.ws.close();

console.log("== 3. o tablet CONGELA: socket de pé, ninguém responde ==");
// a bia é a aba congelada; a ana continua respondendo (prova que não cai junto)
const bia = cliente({ name: "bia", pin: "2222" }, false);
await espera(1500);
ok(bia.entrou, "a bia entrou antes de congelar");
await espera(HEARTBEAT_TIMEOUT_MS + 3000);
ok(bia.fechou, `o host FECHOU o socket da bia (código ${bia.codigoFecho})`);
ok(!ana.fechou, "e a ana, que responde, continua conectada");
ok(ana.pings >= 3, `a ana seguiu recebendo ping o tempo todo (${ana.pings})`);

console.log("== 4. a QUEIXA: a criança volta com o mesmo nome ==");
const biaDeVolta = cliente({ name: "bia", pin: "2222" });
await espera(1500);
ok(biaDeVolta.entrou, "a bia entrou de novo com o MESMO nome");
ok(biaDeVolta.negado === null, `e sem recusa (${biaDeVolta.negado})`);

ana.ws.close();
biaDeVolta.ws.close();
await espera(300);
console.log(falhas === 0 ? "\nSMOKE /presenca OK" : `\nSMOKE /presenca FALHOU (${falhas})`);
process.exit(falhas === 0 ? 0 : 1);
