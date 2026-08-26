/**
 * Smoke do DESLIGAMENTO do host (bug-645, 2026-08-25).
 *
 * O relato era "liguei o ciclo de dia e noite, carreguei o mundo e ele voltou
 * desligado". O ciclo não tinha nada de errado: o host só grava em SIGINT
 * (Ctrl+C) e SIGTERM, e FECHAR A JANELA do terminal manda SIGHUP — no Windows
 * também, que é onde a escola roda o `.bat`. Sem handler, o processo morre sem
 * `saveNow` e some tudo desde o último autosave (até 30 s de mundo). O ciclo é
 * só o que mais salta aos olhos.
 *
 * Este smoke sobe o PRÓPRIO host (por isso `servidores: []` no runner): a prova
 * exige matar o servidor no meio, com um sinal escolhido, e subir de novo.
 *
 *   node server/src/cenarios/_smoke-sighup.mjs 8106
 */
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { connect } from "node:net";

const PORTA = Number(process.argv[2] ?? 8106);
const MUNDO = "mundos/_smoke-sighup";
const SAVE = `${MUNDO}/_smoke-sighup.ljw`;
const CODIGO = "prof2026";
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function sobe(novo) {
  const proc = spawn("npx", ["tsx", "server/src/index.ts"], {
    env: {
      ...process.env,
      LJ_PORT: String(PORTA),
      LJ_SAVE: SAVE,
      LJ_TAMANHO: "P",
      LJ_CODIGO: CODIGO,
      ...(novo ? { LJ_NOVO: "1" } : {}),
    },
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let saida = "";
  proc.stdout.on("data", (d) => (saida += d));
  proc.stderr.on("data", (d) => (saida += d));
  return { proc, log: () => saida };
}

async function esperaPorta(ms) {
  const limite = Date.now() + ms;
  while (Date.now() < limite) {
    const abriu = await new Promise((r) => {
      const s = connect({ port: PORTA, host: "127.0.0.1" });
      s.once("connect", () => (s.destroy(), r(true)));
      s.once("error", () => (s.destroy(), r(false)));
    });
    if (abriu) return true;
    await espera(250);
  }
  return false;
}

/** Cliente professor que guarda o `time` e as respostas de chat. */
function cliente() {
  const ws = new WebSocket(`ws://localhost:${PORTA}`);
  ws.binaryType = "arraybuffer";
  const rec = { ws, ciclo: null, chats: [] };
  ws.onopen = () => ws.send(JSON.stringify({ type: "join", name: "profa", pin: "1234", codigo: CODIGO }));
  ws.onmessage = (e) => {
    if (e.data instanceof ArrayBuffer) return;
    const m = JSON.parse(e.data);
    if (m.type === "time") rec.ciclo = m.ciclo;
    if (m.type === "chat") rec.chats.push(m.text);
  };
  return rec;
}
const dizer = (rec, texto) => rec.ws.send(JSON.stringify({ type: "chat", text: texto }));
const ultimo = (rec) => rec.chats.at(-1) ?? "";

/**
 * Liga o ciclo num mundo novo, mata o host com `sinal` e sobe de novo: o
 * mundo que volta tem de ter o ciclo LIGADO. Sem o handler do sinal, o host
 * morre sem gravar e o segundo boot nem acha o arquivo.
 */
async function rodada(sinal) {
  console.log(`== fechando o host com ${sinal} ==`);
  rmSync(MUNDO, { recursive: true, force: true });
  let host = sobe(true);
  if (!(await esperaPorta(60_000))) {
    console.error(host.log());
    return ok(false, `o host não subiu na porta ${PORTA}`);
  }
  const prof = cliente();
  await espera(1200);
  dizer(prof, "/ciclo ligar");
  await espera(1000);
  ok(prof.ciclo === true, `o ciclo ligou no runtime — "${ultimo(prof)}"`);
  prof.ws.close();

  // o mundo é NOVO e a rodada leva menos que os 30 s do autosave: o único
  // caminho pro disco é o desligamento. É exatamente isso que se mede.
  process.kill(-host.proc.pid, sinal);
  await espera(2500);
  ok(/mundo salvo/.test(host.log()), `o host gravou o mundo ao receber ${sinal}`);

  host = sobe(false); // sem LJ_NOVO: se nada foi salvo, o host recusa subir
  const subiu = await esperaPorta(60_000);
  if (!subiu) {
    console.error(host.log());
    return ok(false, `o mundo não voltou depois do ${sinal} (nada foi gravado)`);
  }
  const prof2 = cliente();
  await espera(1500);
  dizer(prof2, "/hora");
  await espera(800);
  ok(prof2.ciclo === true, `o ciclo voltou LIGADO depois do ${sinal}`);
  ok(
    ultimo(prof2).includes("o tempo está passando"),
    `e o /hora confirma pro professor — "${ultimo(prof2)}"`,
  );
  prof2.ws.close();
  process.kill(-host.proc.pid, "SIGTERM");
  await espera(1500);
}

await rodada("SIGHUP"); // fechar a janela do terminal (o caso do bug-645)
await rodada("SIGINT"); // Ctrl+C — o controle, que sempre funcionou
rmSync(MUNDO, { recursive: true, force: true });

console.log(falhas === 0 ? "\nSMOKE sighup OK" : `\nSMOKE sighup FALHOU (${falhas})`);
process.exit(falhas === 0 ? 0 : 1);
