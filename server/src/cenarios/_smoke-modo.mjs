/**
 * Smoke do §🍖 F1 (/modo e /regra) contra o servidor REAL. Prova pelo fio o que
 * o teste puro não alcança: que o modo chega em cada cliente já RESOLVIDO
 * (ajuste pessoal × padrão do mundo), que o `all` pega quem está dentro E quem
 * entra depois, e que modo e regras atravessam o DISCO — a ida e volta de
 * `/mundo carregar` salva o mundo atual e o recarrega do .ljw.
 *
 * Precisa de DOIS mundos: o que está no ar e um alvo pra ir e voltar.
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-modob.ljw npm run start -w server  (mata depois)
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-modoa.ljw LJ_CODIGO=prof2026 LJ_PORT=8098 \
 *     npm run start -w server
 *   node server/src/cenarios/_smoke-modo.mjs 8098 _smoke-modob
 */
const PORTA = process.argv[2] ?? "8080";
const ALVO = process.argv[3] ?? "_smoke-modob";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

/** Cliente que guarda o ÚLTIMO modo que o servidor mandou e os chats recebidos. */
function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, modo: null, modos: [], chats: [] };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "modo") {
      rec.modo = m.efetivo;
      rec.modos.push(m.efetivo);
    }
    if (m.type === "chat") rec.chats.push(m.text);
  };
  return rec;
}
const enviar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));
const ultimo = (rec) => rec.chats.at(-1) ?? "";

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
const bia = cliente({ name: "bia", pin: "2222" });
await espera(1200);

console.log("== todo join recebe o modo, mesmo criativo ==");
ok(ana.modo === "criativo", `ana entrou em criativo (recebeu ${ana.modos.length} msg de modo)`);
ok(bia.modo === "criativo", "bia entrou em criativo");

console.log("== /modo sobrevivencia all: pega a turma, não o professor ==");
enviar(prof, "/modo sobrevivencia all");
await espera(500);
ok(ana.modo === "sobrevivencia", "ana foi pra sobrevivência");
ok(bia.modo === "sobrevivencia", "bia foi pra sobrevivência");
ok(prof.modo === "criativo", "o professor que digitou continua em criativo");
ok(ultimo(prof).includes("TODA a turma"), "o professor recebeu a confirmação do all");

console.log("== quem entra DEPOIS já entra no modo do mundo ==");
const caio = cliente({ name: "caio", pin: "3333" });
await espera(800);
ok(caio.modo === "sobrevivencia", "caio entrou direto em sobrevivência");

console.log("== aluno não muda o modo de ninguém ==");
enviar(ana, "/modo criativo");
await espera(300);
ok(ultimo(ana).includes("Somente o professor"), "ana é barrada ao tentar mudar o modo");
ok(ana.modo === "sobrevivencia", "ana continua em sobrevivência");
enviar(ana, "/modo");
await espera(300);
ok(ultimo(ana).includes("sobrevivência"), "mas ana CONSULTA o próprio modo");

console.log("== ajuste pessoal vence o padrão do mundo ==");
enviar(prof, "/modo criativo ana");
await espera(400);
ok(ana.modo === "criativo", "ana ganhou ajuste pessoal de criativo");
ok(bia.modo === "sobrevivencia", "bia segue o padrão do mundo");

console.log("== /regra grava no mundo; aluno só consulta ==");
enviar(ana, "/regra pvp ligar");
await espera(300);
ok(ultimo(ana).includes("Somente o professor"), "ana é barrada ao tentar mudar regra");
enviar(prof, "/regra pvp ligar");
await espera(300);
ok(ultimo(prof).includes("Regra pvp ligada"), "professor liga a regra pvp");
enviar(prof, "/regra");
await espera(300);
ok(ultimo(prof).includes("pvp: ligada"), "a lista de regras mostra pvp ligada");

console.log(`== ida e volta pelo DISCO (/mundo carregar ${ALVO} e de volta) ==`);
enviar(prof, `/mundo carregar ${ALVO}`);
await espera(6000);
ok(ana.modo === "criativo" && bia.modo === "criativo", "o mundo B é criativo pra todo mundo");
enviar(prof, "/mundo carregar _smoke-modoa");
await espera(6000);
ok(bia.modo === "sobrevivencia", "voltando ao mundo A, o padrão sobrevivência veio do .ljw");
ok(ana.modo === "criativo", "e o ajuste pessoal da ana também sobreviveu ao disco");
enviar(prof, "/regra");
await espera(400);
ok(ultimo(prof).includes("pvp: ligada"), "a regra pvp também atravessou o save");

for (const c of [prof, ana, bia, caio]) c.ws.close();
console.log(falhas === 0 ? "\nSMOKE /modo OK" : `\nSMOKE /modo FALHOU (${falhas})`);
process.exit(falhas === 0 ? 0 : 1);
