/**
 * Smoke do TETO DE BYTES do chat contra o servidor REAL.
 *
 * Prova o que teste de unidade não alcança: o teto cobrado no TRANSPORTE. O
 * `maxPayload` do `ws` recusa o frame gigante antes de montar a string e fecha
 * o socket com 1009 — nenhum `JSON.parse` de megabyte acontece. E a frase
 * normal, com acento, continua chegando inteira (controle negativo: smoke que
 * só vê o teto morder não prova que o chat funciona).
 *
 * Rode com o servidor no ar:
 *   LJ_SAVE=mundos/_smoke-chat.ljw LJ_NOVO=1 npm run start -w server
 *   node server/src/cenarios/_smoke-chat-tamanho.mjs <porta>
 */
const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
const MAX_CHAT_BYTES = 512;
const MAX_FRAME_BYTES = 64 * 1024;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const bytes = (s) => new TextEncoder().encode(s).length;

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, chats: [], entrou: false, fechou: null };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onclose = (e) => (rec.fechou = e.code);
  ws.onmessage = (e) => {
    rec.entrou = true;
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "ping") ws.send(JSON.stringify({ type: "pong", t: m.t }));
    if (m.type === "chat" && m.author !== "servidor") rec.chats.push(m.text);
  };
  return rec;
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const ateQue = async (cond, limiteMs = 8000) => {
  const fim = Date.now() + limiteMs;
  while (!cond() && Date.now() < fim) await espera(50);
  return cond();
};
const enviar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));

const ana = cliente({ name: "ana", pin: "1111" });
ok(await ateQue(() => ana.entrou, 15000), "a ana entrou");

console.log("== frase normal com acento passa INTEIRA (controle negativo) ==");
const frase = "vamos acender a lâmpada com a porta E, combinação certa!";
enviar(ana, frase);
ok(await ateQue(() => ana.chats.includes(frase)), "a frase com acento voltou igual");

console.log("== parede de emoji é CORTADA, e sem emoji partido ==");
ana.chats.length = 0;
enviar(ana, "日".repeat(400));
await ateQue(() => ana.chats.length > 0);
const cortado = ana.chats.at(-1) ?? "";
ok(bytes(cortado) <= MAX_CHAT_BYTES, `chegou com ${bytes(cortado)} bytes (teto ${MAX_CHAT_BYTES})`);
ok(cortado.length > 0, "o começo da mensagem chegou (corta, não descarta)");
ok(!/[\uD800-\uDFFF]/u.test(cortado), "nenhum caractere partido no meio");

console.log("== frame acima do teto: NADA broadcasta e o socket cai (1009) ==");
// cliente separado, porque este socket MORRE na asserção — a ana continua viva
// pra provar que o host não caiu junto.
const bob = cliente({ name: "bob", pin: "2222" });
ok(await ateQue(() => bob.entrou, 15000), "o bob entrou");
ana.chats.length = 0;
bob.ws.send(JSON.stringify({ type: "chat", text: "x".repeat(MAX_FRAME_BYTES) }));
ok(await ateQue(() => bob.fechou !== null), `o socket do bob foi fechado (code ${bob.fechou})`);
// 1009 é o código do "mensagem grande demais", mas o `ws` derruba o TCP sem
// esperar o handshake de fechamento, então o que o cliente vê na prática é
// 1006 (fechamento anormal). O que importa é que NÃO foi 1000: fechamento
// normal significaria que o host aceitou o frame e saiu de fininho.
ok(bob.fechou === 1009 || bob.fechou === 1006, `fechou anormal (${bob.fechou}), não 1000`);
ok(ana.chats.length === 0, "a ana NÃO recebeu nada do frame gigante");

console.log("== e o host segue de pé depois do frame gigante ==");
const depois = "ainda estou aqui";
enviar(ana, depois);
ok(await ateQue(() => ana.chats.includes(depois)), "a ana continua falando com o host");

ana.ws.close();
console.log(falhas === 0 ? "\nTUDO OK" : `\n${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);
