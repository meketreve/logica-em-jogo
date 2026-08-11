/**
 * Smoke de /tp grupos e /iniciar contra o servidor REAL (aula1 na 8080).
 * Prova o caminho de ponta a ponta: professor forma os grupos com os alunos
 * online, zera o progresso e teleporta cada grupo para a sua área — os alunos
 * recebem a msg `teleport` de verdade pelo fio.
 *
 * Rode com o servidor no ar:
 *   LJ_SAVE=cenarios/aula1-sequencia.ljw LJ_CODIGO=prof2026 npm run start -w server
 *   node server/src/cenarios/_smoke-atividade.mjs
 */
const PORTA = process.argv[2] ?? "8080";
const URL = `ws://localhost:${PORTA}`;
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};

function cliente(join) {
  const ws = new WebSocket(URL);
  ws.binaryType = "arraybuffer";
  const rec = { ws, chats: [], grupos: [], teleports: [], entrou: false };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", ...join }));
  ws.onmessage = (e) => {
    rec.entrou = true; // qualquer resposta do host prova que o join foi aceito
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "chat") rec.chats.push(m.text);
    if (m.type === "group") rec.grupos.push(m.grupo);
    if (m.type === "teleport") rec.teleports.push({ x: m.x, y: m.y, z: m.z });
  };
  return rec;
}
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
/**
 * Espera o FATO, não o relógio (bug-595).
 *
 * Este smoke dormia 700 ms pelo join dos 3 clientes e 500/400/300 ms por
 * comando. Sozinho ele fecha em 3 s e passava sempre; dentro da suíte inteira
 * falhava 1 rodada em 3, porque o join de três WebSocket num host que acabou de
 * carregar o mundo da aula1 não cabe em 700 ms com a máquina ocupada — e sem os
 * três online o `/iniciar 2` forma grupo sem eles, derrubando tudo o que vem
 * depois. Cada teto abaixo é folgado de propósito: quem falha é a asserção, não
 * o cronômetro.
 */
const ateQue = async (cond, limiteMs = 8000) => {
  const fim = Date.now() + limiteMs;
  while (!cond() && Date.now() < fim) await espera(50);
  return cond();
};
const enviar = (rec, text) => rec.ws.send(JSON.stringify({ type: "chat", text }));

/**
 * Entram UM DE CADA VEZ, e a ordem é a asserção seguinte (bug-595).
 *
 * O `/grupo criar` distribui em round-robin sobre `ses.players.values()`, que é
 * a ordem de INSERÇÃO do Map — ou seja, a ordem em que cada join foi aceito.
 * Abrir os três WebSocket em paralelo (o que este smoke fazia) deixa a ordem
 * entre ana e bia no ar: numa rodada em três a bia chegava primeiro e virava o
 * grupo 1, derrubando "ana→g1, bia→g2". Não era bug do servidor — era o smoke
 * afirmando algo que ele mesmo não garantia. Serializando o join, o round-robin
 * passa a ser conferível, que é justamente o que a asserção quer provar.
 */
const entrar = async (rec, quem) => {
  ok(await ateQue(() => rec.entrou, 15000), `${quem} entrou`);
  return rec;
};
const prof = await entrar(cliente({ name: "profa", pin: "1234", codigo: "prof2026" }), "a profa");
const ana = await entrar(cliente({ name: "ana", pin: "1111" }), "a ana (1ª aluna → grupo 1)");
const bia = await entrar(cliente({ name: "bia", pin: "2222" }), "a bia (2ª aluna → grupo 2)");

console.log("== /iniciar 2 forma grupos, zera e teleporta ==");
enviar(prof, "/iniciar 2");
await ateQue(
  () => ana.grupos.length > 0 && bia.grupos.length > 0 && ana.teleports.length > 0 && bia.teleports.length > 0,
);
ok(ana.grupos.at(-1) === 1 && bia.grupos.at(-1) === 2, "ana→g1, bia→g2");
ok(ana.teleports.length >= 1, "ana recebeu teleport para a área do grupo 1");
ok(bia.teleports.length >= 1, "bia recebeu teleport para a área do grupo 2");
const ta = ana.teleports.at(-1);
const tb = bia.teleports.at(-1);
ok(ta && tb && (ta.x !== tb.x || ta.z !== tb.z), "grupos foram para áreas DIFERENTES");
ok(
  [ana, bia].every((a) => a.chats.some((c) => c.includes("A atividade começou"))),
  "a turma foi avisada do início",
);
ok(prof.teleports.length === 0, "o professor NÃO foi teleportado");

console.log("== /tp grupos leva de novo ==");
const antes = ana.teleports.length;
enviar(prof, "/tp grupos");
await ateQue(() => ana.teleports.length > antes && prof.chats.some((c) => c.includes("aluno(s) levado(s)")));
ok(ana.teleports.length > antes, "ana foi teleportada de novo");
ok(
  prof.chats.some((c) => c.includes("aluno(s) levado(s)")),
  "professor recebe o resumo do teleporte",
);

console.log("== aluno não pode /iniciar nem /tp ==");
enviar(ana, "/iniciar");
enviar(ana, "/tp grupos");
await ateQue(
  () =>
    ana.chats.some((c) => c.includes("Somente o professor pode iniciar")) &&
    ana.chats.some((c) => c.includes("Somente o professor pode usar /tp")),
);
ok(
  ana.chats.some((c) => c.includes("Somente o professor pode iniciar")),
  "/iniciar negado ao aluno",
);
ok(
  ana.chats.some((c) => c.includes("Somente o professor pode usar /tp")),
  "/tp negado ao aluno",
);

prof.ws.close();
ana.ws.close();
bia.ws.close();
console.log(falhas === 0 ? "\nTUDO OK" : `\n${falhas} FALHA(S)`);
process.exit(falhas === 0 ? 0 : 1);
