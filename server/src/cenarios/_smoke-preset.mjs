/**
 * Smoke do §🍖 F9 (preset de mundo de sobrevivência) contra o servidor REAL.
 *
 * O que ele prova pelo fio, e que teste puro não alcança: que UMA variável de
 * ambiente no host substitui a sequência de comandos que o professor teria de
 * digitar na frente da turma (`/modo sobrevivencia all` + `/ciclo ligar`), que
 * o mundo nasce assim pra quem entra SEM ninguém digitar nada, que é
 * sobrevivência DE VERDADE (a mochila autoritativa chega, e ela só existe em
 * sobrevivência) e que o preset não liga nada além disso — pvp segue desligada.
 *
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-preset.ljw LJ_PRESET=sobrevivencia \
 *     LJ_CODIGO=prof2026 LJ_PORT=8105 npm run start -w server
 *   node server/src/cenarios/_smoke-preset.mjs 8105
 */
const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/** Cliente que guarda o que o servidor manda sobre modo, hora e mochila. */
function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, modo: null, horas: [], ciclo: null, inventarios: 0, chats: [] };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "modo") rec.modo = m.efetivo;
    if (m.type === "time") {
      rec.horas.push(m.hora);
      rec.ciclo = m.ciclo;
    }
    if (m.type === "inventario") rec.inventarios++;
    if (m.type === "chat") rec.chats.push(m.text);
  };
  return rec;
}
const enviar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));
const ultimo = (rec) => rec.chats.at(-1) ?? "";

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
await espera(1200);

console.log("== o mundo NASCE em sobrevivência (ninguém digitou comando) ==");
ok(ana.modo === "sobrevivencia", `ana entrou em sobrevivência (recebeu ${ana.modo})`);
ok(prof.modo === "sobrevivencia", "o professor também — é o padrão do MUNDO, não um ajuste");
ok(ana.inventarios > 0, "a mochila autoritativa chegou (ela só existe em sobrevivência)");

console.log("== o ciclo dia/noite já está andando ==");
const antes = ana.horas.at(-1);
await espera(2500);
const depois = ana.horas.at(-1);
ok(ana.ciclo === true, "o broadcast de hora diz ciclo LIGADO");
ok(
  typeof antes === "number" && typeof depois === "number" && depois !== antes,
  `a hora ANDOU sozinha (${antes} → ${depois})`,
);

console.log("== e o preset não liga mais nada: pvp segue no padrão ==");
enviar(prof, "/regra pvp");
await espera(400);
ok(ultimo(prof).toLowerCase().includes("desligada"), `pvp continua desligada — "${ultimo(prof)}"`);

console.log("== o professor continua mandando: dá pra voltar pra criativo ==");
enviar(prof, "/modo criativo all");
await espera(500);
ok(ana.modo === "criativo", "ana voltou pra criativo pelo comando de sempre");

for (const c of [prof, ana]) c.ws.close();
console.log(falhas === 0 ? "\nSMOKE preset OK" : `\nSMOKE preset FALHOU (${falhas})`);
process.exit(falhas === 0 ? 0 : 1);
