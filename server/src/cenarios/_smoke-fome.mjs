/**
 * Smoke do §🍖 F3 (fome) contra o servidor REAL. Prova pelo fio o que o teste
 * puro não alcança: que o dreno sai do fluxo de `move` que o servidor já recebe
 * (o cliente nunca reporta esforço), que criativo não tem fome no MESMO mundo,
 * que a regra `fome` liga e desliga a barra na hora, e que a barra no zero
 * cobra dano no tick de 10 Hz — sem matar.
 *
 *   LJ_TAMANHO=P LJ_NOVO=1 LJ_SAVE=mundos/_smoke-fome.ljw LJ_CODIGO=prof2026 \
 *     LJ_PORT=8101 npm run start -w server
 *   node server/src/cenarios/_smoke-fome.mjs 8101
 */
const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

const FOME_MAX = 20;
const VIDA_MAX = 20;
/** Piso do dano por inanição: a fome enfraquece, não mata (ver sobrevivencia.ts). */
const VIDA_MINIMA_POR_FOME = 6;
/** Mesma régua do módulo puro: 4 de esforço por ponto, 0,01 por bloco andado. */
const BLOCOS_POR_PONTO = 401; // 400 exatos ficam a um fio do limiar (float)

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, spawn: null, vidas: [], chats: [] };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "spawn") rec.spawn = { x: m.x, y: m.y, z: m.z };
    if (m.type === "vida") rec.vidas.push(m);
    if (m.type === "chat") rec.chats.push(m.text);
  };
  return rec;
}
const enviar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));
const ultimaVida = (rec) => rec.vidas.at(-1) ?? null;

/** Anda `blocos` no plano, um bloco por amostra — é o que o cliente manda a 10 Hz. */
async function andar(rec, blocos) {
  const s = rec.spawn;
  rec.ws.send(JSON.stringify({ type: "move", x: s.x, y: s.y, z: s.z, yaw: 0, pitch: 0 }));
  for (let i = 1; i <= blocos; i++) {
    rec.ws.send(
      JSON.stringify({ type: "move", x: s.x + (i % 2), y: s.y, z: s.z, yaw: 0, pitch: 0 }),
    );
    // respiro pro servidor drenar o socket (e pro tick rodar), sem virar teste lento
    if (i % 500 === 0) await espera(20);
  }
  await espera(250);
}

const prof = cliente({ name: "profa", pin: "1234", codigo: "prof2026" });
const ana = cliente({ name: "ana", pin: "1111" });
await espera(1200);

console.log("== sobrevivência nasce com a barra cheia ==");
enviar(prof, "/modo sobrevivencia all");
await espera(500);
ok(ultimaVida(ana)?.fome === FOME_MAX, `ana entrou com a fome cheia (${ultimaVida(ana)?.fome})`);
ok(prof.vidas.length === 0, "o professor seguiu em criativo, sem vida e sem fome");

console.log("== andar cansa: o SERVIDOR tira do fluxo de move ==");
await andar(ana, BLOCOS_POR_PONTO);
ok(
  ultimaVida(ana)?.fome === FOME_MAX - 1,
  `${BLOCOS_POR_PONTO} blocos andados custaram 1 ponto (fome ${ultimaVida(ana)?.fome})`,
);

console.log("== a MESMA caminhada em criativo não custa nada ==");
await andar(prof, BLOCOS_POR_PONTO);
ok(prof.vidas.length === 0, "o professor andou o mesmo e continua sem barra nenhuma");

console.log("== /regra fome desligar tira a barra da tela na hora ==");
enviar(prof, "/regra fome desligar");
await espera(400);
ok(ultimaVida(ana)?.fome === undefined, "a mensagem `vida` chegou SEM o campo fome");
await andar(ana, BLOCOS_POR_PONTO);
ok(ultimaVida(ana)?.fome === undefined, "e andar deixou de cansar");
enviar(prof, "/regra fome ligar");
await espera(400);
ok(ultimaVida(ana)?.fome !== undefined, "religar a regra devolve a barra sem reentrar");

console.log("== barra no zero: dói no tick, e PARA em 3 corações ==");
const restante = ultimaVida(ana).fome;
await andar(ana, BLOCOS_POR_PONTO * restante + BLOCOS_POR_PONTO);
ok(ultimaVida(ana)?.fome === 0, `a barra chegou ao zero (fome ${ultimaVida(ana)?.fome})`);
await espera(4600); // 1 dano a cada 4 s
const doeu = ultimaVida(ana);
ok(doeu?.causa === "fome", `o dano veio etiquetado como fome (${doeu?.causa})`);
ok(doeu?.vida < VIDA_MAX, `e a vida caiu (${doeu?.vida})`);
ok(
  !ana.vidas.some((v) => v.morreu === true),
  "e ninguém morreu de fome (não há comida no jogo ainda)",
);
ok(
  doeu?.vida >= VIDA_MINIMA_POR_FOME,
  `a vida não passou do piso de ${VIDA_MINIMA_POR_FOME} (${doeu?.vida})`,
);

for (const c of [prof, ana]) c.ws.close();
console.log(falhas === 0 ? "\nSMOKE /fome OK" : `\nSMOKE /fome FALHOU (${falhas})`);
process.exit(falhas === 0 ? 0 : 1);
