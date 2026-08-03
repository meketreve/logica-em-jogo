// Exercita os 3 bugs dos hooks numa fixture isolada, rodando o stop.js REAL.
import * as fs from "node:fs";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import * as os from "node:os";

const HOOKS = "/home/meketreve/logica-em-jogo/.wolf/hooks";
let falhas = 0;
const ok = (c, m) => { console.log(`${c ? "✓" : "✗"} ${m}`); if (!c) falhas++; };

function fixture({ memoria, sessao, buglogMtimeOffsetMs = -60000 }) {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), "wolf-"));
  const wolf = path.join(raiz, ".wolf");
  fs.mkdirSync(path.join(wolf, "hooks"), { recursive: true });
  for (const f of fs.readdirSync(HOOKS)) {
    if (f.endsWith(".js") || f === "package.json") fs.copyFileSync(path.join(HOOKS, f), path.join(wolf, "hooks", f));
  }
  fs.writeFileSync(path.join(wolf, "memory.md"), memoria);
  fs.writeFileSync(path.join(wolf, "buglog.json"), '{"bugs":[]}');
  fs.writeFileSync(path.join(wolf, "cerebrum.md"), "- x\n- y\n- z\n");
  fs.writeFileSync(path.join(wolf, "STATUS.md"), "status");
  const t = Date.now() + buglogMtimeOffsetMs;
  fs.utimesSync(path.join(wolf, "buglog.json"), t / 1000, t / 1000);
  fs.writeFileSync(path.join(wolf, "hooks", "_session.json"), JSON.stringify(sessao));
  return { raiz, wolf };
}

function rodarStop(raiz) {
  const r = spawnSync("node", [path.join(raiz, ".wolf", "hooks", "stop.js")], {
    input: "{}", encoding: "utf-8", env: { ...process.env, CLAUDE_PROJECT_DIR: raiz },
  });
  let lembretes = [];
  try { lembretes = (JSON.parse(r.stdout || "{}").hookSpecificOutput?.additionalContext ?? "").split("\n").filter(l => l.startsWith("•")); } catch {}
  return { lembretes, stdout: r.stdout, stderr: r.stderr };
}

const sessaoBase = (over = {}) => ({
  session_id: "s1", started: new Date(Date.now() - 3600_000).toISOString(),
  files_read: { "a.ts": { tokens: 10, count: 1 } },
  files_written: [
    { file: "/p/shared/src/a.ts", tokens: 100, action: "write" },
    { file: "/p/shared/src/b.ts", tokens: 100, action: "edit" },
  ],
  edit_counts: {}, anatomy_hits: 0, anatomy_misses: 0, repeated_reads_warned: 0, cerebrum_warnings: 0, stop_count: 0,
  ...over,
});

const CAB = "\n## Session: 2026-08-02 23:34\n\n| Time | Action | File(s) | Outcome | ~Tokens |\n|------|--------|---------|---------|--------|\n";

// ── BUG 1: "no semantic summary" com a sessão virando a meia-noite ────────────
{
  // Header com a data de ONTEM (sessão que atravessou a meia-noite) + entrada semântica escrita HOJE.
  const { raiz, wolf } = fixture({ memoria: "# diário\n" + CAB + "| 00:12 | fecha o §F4, inventário autoritativo | inventario.ts | verde | ~2k |\n", sessao: sessaoBase() });
  const { lembretes } = rodarStop(raiz);
  ok(!lembretes.some(l => l.includes("no semantic summary")), "BUG1: entrada semântica na sessão de ontem→hoje CONTA (aviso silenciado)");
  const memoria = fs.readFileSync(path.join(wolf, "memory.md"), "utf-8");
  ok(memoria.includes("| Session end: 2 writes"), "BUG1: linha de encerramento gravada mesmo assim");
}
{
  // Sessão sem nenhuma entrada semântica → o aviso TEM de aparecer.
  const { raiz } = fixture({ memoria: "# diário\n| 09:00 | entrada de sessão ANTIGA | x.ts | ok | ~1k |\n" + CAB, sessao: sessaoBase() });
  const { lembretes } = rodarStop(raiz);
  ok(lembretes.some(l => l.includes("no semantic summary")), "BUG1: sessão sem entrada AINDA avisa (não silenciou geral)");
}
{
  // Só linhas mecânicas no bloco → ainda avisa.
  const { raiz } = fixture({ memoria: "# diário" + CAB + "| 00:10 | Created x.ts | x.ts | ok | ~1k |\n| 00:11 | Session end: 3 writes | 1 reads | ~9 tok |\n", sessao: sessaoBase() });
  const { lembretes } = rodarStop(raiz);
  ok(lembretes.some(l => l.includes("no semantic summary")), "BUG1: linha mecânica NÃO passa por resumo semântico");
}

// ── BUG 2: buglog escrito por Bash (mtime), não por Write/Edit ────────────────
{
  const sessao = sessaoBase({ edit_counts: { "/p/shared/src/a.ts": 4 } });
  // buglog tocado DEPOIS do início da sessão (o python3/heredoc do Bash)
  const { raiz } = fixture({ memoria: "# d" + CAB + "| 00:12 | resumo | a.ts | ok | ~1k |\n", sessao, buglogMtimeOffsetMs: -1000 });
  const { lembretes } = rodarStop(raiz);
  ok(!lembretes.some(l => l.includes("buglog.json was not updated")), "BUG2: buglog escrito por Bash (mtime novo) silencia o aviso");
}
{
  const sessao = sessaoBase({ edit_counts: { "/p/shared/src/a.ts": 4 } });
  // buglog NÃO tocado nesta sessão (mtime de 2h atrás, sessão começou há 1h)
  const { raiz } = fixture({ memoria: "# d" + CAB + "| 00:12 | resumo | a.ts | ok | ~1k |\n", sessao, buglogMtimeOffsetMs: -7200_000 });
  const { lembretes } = rodarStop(raiz);
  ok(lembretes.some(l => l.includes("buglog.json was not updated")), "BUG2: buglog intocado AINDA avisa");
}

// ── BUG 3: "Session end" repetida a cada stop ─────────────────────────────────
{
  const { raiz, wolf } = fixture({ memoria: "# d" + CAB + "| 00:12 | resumo | a.ts | ok | ~1k |\n", sessao: sessaoBase() });
  for (let i = 0; i < 5; i++) rodarStop(raiz);
  const linhas = fs.readFileSync(path.join(wolf, "memory.md"), "utf-8").split("\n").filter(l => l.includes("Session end:"));
  ok(linhas.length === 1, `BUG3: 5 stops sem trabalho novo → 1 linha de encerramento (deu ${linhas.length})`);

  // Trabalho novo → a linha é ATUALIZADA no lugar, não duplicada.
  const s = JSON.parse(fs.readFileSync(path.join(wolf, "hooks", "_session.json"), "utf-8"));
  s.files_written.push({ file: "/p/shared/src/c.ts", tokens: 50, action: "write" });
  fs.writeFileSync(path.join(wolf, "hooks", "_session.json"), JSON.stringify(s));
  rodarStop(raiz);
  const depois = fs.readFileSync(path.join(wolf, "memory.md"), "utf-8").split("\n").filter(l => l.includes("Session end:"));
  ok(depois.length === 1 && depois[0].includes("3 writes"), `BUG3: trabalho novo reescreve a linha (${depois.length} linha(s): ${depois[0]?.slice(0, 60)})`);

  // Entrada semântica DEPOIS da linha de encerramento → não pode ser sobrescrita.
  fs.appendFileSync(path.join(wolf, "memory.md"), "| 00:20 | entrada nova do modelo | c.ts | ok | ~1k |\n");
  const s2 = JSON.parse(fs.readFileSync(path.join(wolf, "hooks", "_session.json"), "utf-8"));
  s2.files_written.push({ file: "/p/shared/src/d.ts", tokens: 50, action: "write" });
  fs.writeFileSync(path.join(wolf, "hooks", "_session.json"), JSON.stringify(s2));
  rodarStop(raiz);
  const fim = fs.readFileSync(path.join(wolf, "memory.md"), "utf-8");
  ok(fim.includes("entrada nova do modelo"), "BUG3: entrada do modelo NÃO é clobberada pela linha de encerramento");
  ok(fim.split("\n").filter(l => l.includes("Session end:")).length === 2, "BUG3: com entrada no meio, a nova linha é ACRESCENTADA (histórico preservado)");
}

console.log(falhas === 0 ? "\nTODOS OS TESTES PASSARAM" : `\n${falhas} FALHA(S)`);
process.exit(falhas ? 1 : 0);
