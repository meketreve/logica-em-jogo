/**
 * Smoke do `POST /perfil` — a rota que faz o perfil do `?bench` cair na pasta
 * `profiles/` do HOST em vez da pasta de downloads de cada PC do laboratório.
 *
 * Por que existe: o `?bench` roda em SINGLEPLAYER (Web Worker), então não há
 * socket com o host e o caminho `profile_report` do F3 não vale. A entrega é
 * por HTTP de mesma origem — e é a única parte do bench que o navegador não
 * exercita sozinho num teste de cliente.
 *
 *   LJ_SAVE=mundos/_smoke-perfil.ljw LJ_NOVO=1 LJ_PORT=8098 npm run start -w server
 *   node server/src/cenarios/_smoke-perfil-http.mjs 8098
 */
import { existsSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PORTA = process.argv[2] ?? "8080";
const BASE = `http://localhost:${PORTA}`;
const PASTA = resolve(dirname(fileURLToPath(import.meta.url)), "../../../profiles");
let falhas = 0;
const ok = (cond, msg) => {
  console.log(`  ${cond ? "✓" : "✗"} ${msg}`);
  if (!cond) falhas++;
};

/** Arquivos que já existiam — o smoke só olha o que NASCEU nesta rodada. */
const antes = new Set(existsSync(PASTA) ? readdirSync(PASTA) : []);
const novos = () => (existsSync(PASTA) ? readdirSync(PASTA).filter((f) => !antes.has(f)) : []);

const postar = async (corpo, tipo = "application/json") =>
  fetch(`${BASE}/perfil`, { method: "POST", headers: { "content-type": tipo }, body: corpo });

console.log(`\n[smoke] POST /perfil em ${BASE}`);

// 1. perfil de BENCH: nasce com prefixo próprio (dá pra separar no `ls`)
const perfilBench = { versao: "0.0.0-smoke", meta: { bench: { versaoTrajeto: 1 } }, fps: 60 };
const r1 = await postar(JSON.stringify(perfilBench));
const c1 = await r1.json();
ok(r1.status === 200, `bench aceito (HTTP ${r1.status})`);
ok(typeof c1.arquivo === "string" && c1.arquivo.startsWith("perf-bench-"), `nome com prefixo de bench: ${c1.arquivo}`);
ok(existsSync(resolve(PASTA, c1.arquivo ?? "")), "arquivo existe em profiles/");
const gravado = JSON.parse(readFileSync(resolve(PASTA, c1.arquivo), "utf8"));
ok(gravado.fps === 60 && gravado.meta?.bench?.versaoTrajeto === 1, "conteúdo gravado é o que foi enviado");

// 2. perfil COMUM (sem meta.bench): mesma pasta, sem o prefixo — é assim que o
//    professor separa "trajeto fixo comparável" de "alguém jogando à mão"
const r2 = await postar(JSON.stringify({ versao: "0.0.0-smoke", fps: 30 }));
const c2 = await r2.json();
ok(r2.status === 200 && !c2.arquivo.startsWith("perf-bench-"), `perfil manual sem prefixo: ${c2.arquivo}`);

// 3. lixo é recusado SEM gravar nada
const r3 = await postar("isto não é json");
ok(r3.status === 400, `corpo inválido recusado (HTTP ${r3.status})`);
const r4 = await postar(JSON.stringify([1, 2, 3]));
ok(r4.status === 400, `array recusado (HTTP ${r4.status})`);

// 4. corpo gigante não passa (a porta fica exposta pra escola inteira)
const r5 = await postar(JSON.stringify({ lixo: "x".repeat(70_000) }));
ok(r5.status === 413, `corpo acima do teto recusado (HTTP ${r5.status})`);

// 5. GET na mesma rota continua sendo o jogo (a rota não sequestra o cliente)
const r6 = await fetch(`${BASE}/perfil`);
ok(r6.ok, `GET /perfil segue servindo a página (HTTP ${r6.status})`);

ok(novos().length === 2, `só os 2 perfis válidos foram gravados (nasceram ${novos().length})`);

// profiles/ é pasta de DADO do usuário (os perfis do laboratório moram lá) —
// o smoke leva o próprio lixo embora
for (const f of novos()) unlinkSync(resolve(PASTA, f));

console.log(falhas === 0 ? "\n[smoke] OK\n" : `\n[smoke] ${falhas} FALHA(S)\n`);
process.exit(falhas === 0 ? 0 : 1);
