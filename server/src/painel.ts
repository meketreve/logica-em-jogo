import { execFile, fork, spawn, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { networkInterfaces } from "node:os";
import { extname, join, normalize, resolve, sep } from "node:path";
import {
  MUNDO_LIVRE,
  listarAulas,
  listarMundos,
  publicarAula,
  validarAbertura,
  validarCriacao,
  type Abertura,
  type PedidoCriar,
  type Tamanho,
} from "./painelMundos";
import { daRaiz } from "./paths";

/**
 * §🖥️ PAINEL DO PROFESSOR no navegador (2026-11-03, pedido dele: "um launcher
 * mais gráfico e menos texto").
 *
 * É o processo que o `.bat`/`.sh` sobe depois de atualizar. Ele NÃO é o jogo:
 * é um supervisor que serve uma página em `localhost` e sobe o host de
 * verdade (`index.ts`) como FILHO, com o `LJ_SAVE` do cartão clicado. Trocar
 * de aula = parar o filho (que grava) e subir outro.
 *
 * Por que filho e não "o painel dentro do host":
 *  - o host lê a env UMA vez no boot (mundo, tamanho, preset, código); trocar
 *    de mundo novo/plano exigiria reescrever o boot inteiro;
 *  - o painel tem de estar no ar SEM jogo nenhum (a escolha é a 1ª tela).
 *
 * O host continua sendo o PRÓPRIO processo node que recebe o Ctrl+C e o
 * fechar-janela (bug-666 e bug-645): o painel não embrulha nada — usa `fork`
 * com `--import tsx`, e no Ctrl+C só ESPERA o filho gravar e sair.
 *
 * Quem acessa: SÓ este PC (decisão dele). O servidor escuta em 127.0.0.1 —
 * o aluno na mesma rede nem conecta —, e as ações exigem um cabeçalho que um
 * site de fora não consegue mandar sem o navegador perguntar antes (CORS),
 * e o `Host` tem de ser localhost (contra DNS rebinding).
 *
 * Códigos de saída (o launcher lê): 0 = o professor encerrou · 42 = atualizar
 * agora (o launcher atualiza e me sobe de novo) · outro = defeito (o launcher
 * cai no menu de texto antigo, que é a reserva).
 */

const PORTA = Number(process.env["LJ_PAINEL_PORTA"] ?? 8070);
const PORTA_JOGO = Number(process.env["LJ_PORT"] ?? 8080);
export const SAIDA_ATUALIZAR = 42;
const PASTA_PAGINA = daRaiz("server/painel");
const PASTA_DOCS = daRaiz("docs");
const DONO = "meketreve";
const REPO = "logica-em-jogo";
const RAMO = "main";

// ---------------------------------------------------------------- versão ---

interface Versao {
  titulo: string;
  data: string;
  novidades: string[];
  /** O launcher acabou de atualizar antes de me subir (`LJ_ATUALIZOU=1`). */
  atualizou: boolean;
  checagem: "verificando" | "em-dia" | "nova" | "sem-internet" | "desconhecido";
}

/** O bloco do TOPO do changelog (o build que está rodando): o mesmo texto que
 *  o aluno lê em "📜 novidades". Regex e não import: `changelog.ts` é do
 *  cliente e importa o `shared` — aqui só interessam as strings. */
function lerNovidades(): string[] {
  try {
    const src = readFileSync(daRaiz("client/src/changelog.ts"), "utf8");
    const i = src.indexOf("itens: [");
    if (i < 0) return [];
    const fim = src.indexOf("\n    ],", i);
    const bloco = src.slice(i, fim < 0 ? undefined : fim);
    const itens: string[] = [];
    for (const m of bloco.matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
      itens.push(JSON.parse(`"${m[1]}"`) as string);
    }
    return itens;
  } catch {
    return [];
  }
}

function lerBuildInfo(): { titulo: string; data: string } {
  try {
    const j = JSON.parse(readFileSync(daRaiz("shared/src/build-info.json"), "utf8")) as { titulo?: string; data?: string };
    return { titulo: j.titulo ?? "", data: j.data ?? "" };
  } catch {
    return { titulo: "", data: "" };
  }
}

const versao: Versao = {
  ...lerBuildInfo(),
  novidades: lerNovidades(),
  atualizou: process.env["LJ_ATUALIZOU"] === "1",
  checagem: "verificando",
};

/** O commit instalado: `.lj-versao` (pacote, gravado pelo launcher) ou o HEAD (clone). */
function commitLocal(): Promise<string | null> {
  const arq = daRaiz(".lj-versao");
  if (existsSync(arq)) return Promise.resolve(readFileSync(arq, "utf8").trim() || null);
  return new Promise((ok) => {
    execFile("git", ["rev-parse", "HEAD"], { cwd: daRaiz("."), timeout: 5000 }, (err, out) =>
      ok(err ? null : out.trim() || null),
    );
  });
}

/** Mesma pergunta do launcher ("estou na última?"), com teto curto: sem
 *  internet a faixa diz isso em segundos, nunca fica "procurando" pra sempre. */
async function checarAtualizacao(): Promise<void> {
  try {
    const r = await fetch(`https://api.github.com/repos/${DONO}/${REPO}/commits/${RAMO}`, {
      headers: { accept: "application/vnd.github.sha", "user-agent": "logica-em-jogo-painel" },
      signal: AbortSignal.timeout(8000),
    });
    const remoto = (await r.text()).trim();
    if (!r.ok || !/^[0-9a-f]{40}$/.test(remoto)) {
      versao.checagem = "sem-internet";
      return;
    }
    const local = await commitLocal();
    versao.checagem = local === null ? "desconhecido" : local === remoto ? "em-dia" : "nova";
  } catch {
    versao.checagem = "sem-internet";
  }
}

// ------------------------------------------------------------------ host ---

interface Jogador {
  nome: string;
  papel: string;
}

interface Jogo {
  proc: ChildProcess;
  caminho: string;
  rotulo: string;
  estado: "subindo" | "no-ar" | "parando";
  iniciadoEm: number;
  /** Último relatório do host (IPC, 1×/s). */
  mundo: string;
  aula: boolean;
  codigo: string | null;
  jogadores: Jogador[];
  morreu: Promise<void>;
}

let jogo: Jogo | null = null;
/** Última coisa que deu errado (o host não subiu, porta ocupada…), pra faixa vermelha. */
let erro: string | null = null;
/** O registro do host (stdout/stderr), as últimas linhas — "o que o servidor disse". */
const registro: string[] = [];
const MAX_REGISTRO = 200;
let encerrando = false;

function anotar(linha: string): void {
  registro.push(linha);
  if (registro.length > MAX_REGISTRO) registro.splice(0, registro.length - MAX_REGISTRO);
}

function subirJogo(ab: Abertura, codigo?: string): void {
  erro = null;
  const env: NodeJS.ProcessEnv = { ...process.env, ...ab.env, LJ_SAVE: ab.caminho, LJ_PORT: String(PORTA_JOGO) };
  // as do painel não vazam pro jogo
  delete env["LJ_ATUALIZOU"];
  delete env["LJ_PAINEL_PORTA"];
  if (codigo) env["LJ_CODIGO"] = codigo;
  else delete env["LJ_CODIGO"];
  // `fork` = node DIRETO com o loader do tsx no MESMO processo (bug-666), e
  // um canal IPC pro estado (jogadores) e pro "pare e grave" que funciona
  // igual no Windows, onde não existe sinal de verdade entre processos.
  const proc = fork(daRaiz("server/src/index.ts"), [], {
    cwd: daRaiz("."),
    env,
    execArgv: ["--import", "tsx"],
    stdio: ["pipe", "pipe", "pipe", "ipc"],
  });
  const novo: Jogo = {
    proc,
    caminho: ab.caminho,
    rotulo: ab.rotulo,
    estado: "subindo",
    iniciadoEm: Date.now(),
    mundo: "",
    aula: false,
    codigo: null,
    jogadores: [],
    morreu: new Promise((ok) => proc.once("exit", () => ok())),
  };
  jogo = novo;
  anotar(`── abrindo ${ab.rotulo} ──`);
  let saida = "";
  const linhas = (d: Buffer): void => {
    const t = String(d);
    saida = (saida + t).slice(-4000);
    process.stdout.write(t); // a janela preta continua mostrando o servidor
    for (const l of t.split(/\r?\n/)) if (l.trim()) anotar(l);
  };
  proc.stdout?.on("data", linhas);
  proc.stderr?.on("data", linhas);
  proc.on("message", (m: unknown) => {
    const msg = m as { tipo?: string; mundo?: string; aula?: boolean; codigo?: string; jogadores?: Jogador[] };
    if (jogo !== novo) return;
    if (msg.tipo === "no-ar") novo.estado = novo.estado === "parando" ? "parando" : "no-ar";
    if (msg.tipo === "estado" || msg.tipo === "no-ar") {
      novo.mundo = msg.mundo ?? novo.mundo;
      novo.aula = msg.aula ?? novo.aula;
      novo.codigo = msg.codigo ?? novo.codigo;
      novo.jogadores = Array.isArray(msg.jogadores) ? msg.jogadores : novo.jogadores;
    }
  });
  proc.once("exit", (cod) => {
    if (jogo !== novo) return;
    jogo = null;
    if (novo.estado === "parando" || encerrando) return;
    // morreu sozinho: diz POR QUÊ em português, não o stack
    if (/EADDRINUSE/.test(saida)) {
      erro = `A porta ${PORTA_JOGO} já está em uso — tem outro servidor do jogo aberto neste PC? Feche a outra janela e tente de novo.`;
    } else if (/LJ_SAVE aponta para um arquivo que não existe/.test(saida)) {
      erro = "O arquivo desse mundo não foi encontrado.";
    } else {
      erro = `O servidor do jogo parou sozinho (código ${cod ?? "?"}). Veja o registro do servidor abaixo.`;
    }
  });
}

/** Pede pro host gravar e sair; se não sair em 10 s, derruba. */
async function pararJogo(): Promise<void> {
  const j = jogo;
  if (!j) return;
  j.estado = "parando";
  anotar(`── parando ${j.rotulo} ──`);
  try {
    j.proc.send({ tipo: "parar" });
  } catch {
    /* canal já fechou: o exit vem em seguida */
  }
  const prazo = new Promise<"prazo">((ok) => setTimeout(() => ok("prazo"), 10_000));
  if ((await Promise.race([j.morreu, prazo])) === "prazo") {
    j.proc.kill();
    await j.morreu;
  }
  if (jogo === j) jogo = null;
}

// --------------------------------------------------------------- endereço ---

/** Os IPv4 desta máquina na rede. O 1º é o que o host também imprime; os
 *  outros aparecem pequenos (VirtualBox, cabo + Wi-Fi…) — o professor que vê
 *  "não conecta" tem as alternativas à mão. */
function enderecos(): string[] {
  const lista: string[] = [];
  for (const placas of Object.values(networkInterfaces())) {
    for (const p of placas ?? []) if (p.family === "IPv4" && !p.internal) lista.push(p.address);
  }
  return lista;
}

// ------------------------------------------------------------------ HTTP ---

const TIPOS: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function servirArquivo(raiz: string, caminho: string, res: ServerResponse): void {
  const alvo = resolve(join(raiz, normalize(decodeURIComponent(caminho))));
  if (alvo !== raiz && !alvo.startsWith(raiz + sep)) {
    res.writeHead(403).end();
    return;
  }
  const arquivo = existsSync(alvo) && statSync(alvo).isDirectory() ? join(alvo, "index.html") : alvo;
  if (!existsSync(arquivo) || !statSync(arquivo).isFile()) {
    res.writeHead(404, { "content-type": TIPOS[".txt"] as string }).end("Não encontrado.");
    return;
  }
  res.writeHead(200, {
    "content-type": TIPOS[extname(arquivo)] ?? "application/octet-stream",
    "cache-control": "no-store", // o painel muda a cada atualização
  });
  res.end(readFileSync(arquivo));
}

function json(res: ServerResponse, status: number, corpo: unknown): void {
  res.writeHead(status, { "content-type": TIPOS[".json"] as string, "cache-control": "no-store" });
  res.end(JSON.stringify(corpo));
}

async function lerCorpo(req: IncomingMessage): Promise<Record<string, unknown>> {
  let t = "";
  for await (const pedaco of req) {
    t += String(pedaco);
    if (t.length > 10_000) throw new Error("grande demais");
  }
  const v = t ? (JSON.parse(t) as unknown) : {};
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

/** Página que perguntou por último — o relançamento depois de atualizar só
 *  abre aba nova se ninguém estiver olhando. */
let ultimaVisita = 0;

function estado(): unknown {
  const ips = enderecos();
  return {
    versao,
    erro,
    portaJogo: PORTA_JOGO,
    enderecos: ips,
    endereco: `http://${ips[0] ?? "localhost"}:${PORTA_JOGO}`,
    jogo: jogo && {
      caminho: jogo.caminho,
      rotulo: jogo.rotulo,
      estado: jogo.estado,
      iniciadoEm: jogo.iniciadoEm,
      mundo: jogo.mundo,
      aula: jogo.aula,
      codigo: jogo.codigo,
      jogadores: jogo.jogadores,
    },
    aulas: listarAulas(),
    mundos: listarMundos(),
    mundoLivre: { caminho: MUNDO_LIVRE, existe: existsSync(daRaiz(MUNDO_LIVRE)) },
    registro: registro.slice(-60),
  };
}

const HOSTS_OK = new Set([`localhost:${PORTA}`, `127.0.0.1:${PORTA}`, `[::1]:${PORTA}`]);

async function api(req: IncomingMessage, res: ServerResponse, rota: string): Promise<void> {
  if (req.method === "GET" && rota === "/api/estado") {
    ultimaVisita = Date.now();
    json(res, 200, estado());
    return;
  }
  if (req.method !== "POST") {
    json(res, 405, { erro: "método" });
    return;
  }
  // Ação só da própria página: `fetch` de outro site com cabeçalho próprio
  // vira "preflight" (OPTIONS), que este servidor nunca aprova.
  if (req.headers["x-lj-painel"] !== "1") {
    json(res, 403, { erro: "Ação recusada: só a página do painel pode pedir isto." });
    return;
  }
  let corpo: Record<string, unknown>;
  try {
    corpo = await lerCorpo(req);
  } catch {
    json(res, 400, { erro: "Pedido ilegível." });
    return;
  }
  const texto = (k: string): string => (typeof corpo[k] === "string" ? (corpo[k] as string) : "");
  const codigo = texto("codigo").trim() || undefined;

  switch (rota) {
    case "/api/abrir": {
      const ab = validarAbertura(texto("caminho"), (texto("tamanho") || "P") as Tamanho);
      if (!ab.ok) return json(res, 400, ab);
      await pararJogo();
      subirJogo(ab, codigo);
      return json(res, 200, { ok: true });
    }
    case "/api/criar": {
      if (!["procedural", "plano", "normal"].includes(texto("tipo"))) return json(res, 400, { ok: false, erro: "Tipo de mundo desconhecido." });
      const ab = validarCriacao({
        tipo: texto("tipo") as PedidoCriar["tipo"],
        nome: texto("nome"),
        tamanho: (texto("tamanho") || undefined) as Tamanho | undefined,
      });
      if (!ab.ok) return json(res, 400, ab);
      await pararJogo();
      subirJogo(ab, codigo);
      return json(res, 200, { ok: true });
    }
    case "/api/codigo": {
      // trocar o código = reabrir o MESMO mundo com LJ_CODIGO (o host grava no save)
      if (!jogo) return json(res, 400, { ok: false, erro: "Abra um mundo primeiro." });
      if (!codigo) return json(res, 400, { ok: false, erro: "Digite o código novo." });
      const ab = validarAbertura(jogo.caminho);
      if (!ab.ok) return json(res, 400, ab);
      const rotulo = jogo.rotulo;
      await pararJogo();
      subirJogo({ ...ab, rotulo }, codigo);
      return json(res, 200, { ok: true });
    }
    case "/api/publicar": {
      const r = publicarAula({ origem: texto("origem"), nome: texto("nome"), sobrescrever: corpo["sobrescrever"] === true });
      return json(res, r.ok ? 200 : 400, r);
    }
    case "/api/parar":
      await pararJogo();
      return json(res, 200, { ok: true });
    case "/api/falar": {
      const msg = texto("texto").replace(/[\r\n]+/g, " ").trim().slice(0, 200);
      if (!jogo || !msg) return json(res, 400, { ok: false, erro: "Nada para enviar." });
      jogo.proc.stdin?.write(`/say ${msg}\n`);
      return json(res, 200, { ok: true });
    }
    case "/api/atualizar":
      // atualizar REINICIA o servidor e troca o código do próprio painel: só
      // sem aula rodando (decisão dele), e quem atualiza é o launcher
      if (jogo) return json(res, 409, { ok: false, erro: "Pare a aula antes de atualizar." });
      json(res, 200, { ok: true });
      setTimeout(() => sair(SAIDA_ATUALIZAR), 300);
      return;
    case "/api/encerrar":
      json(res, 200, { ok: true });
      setTimeout(() => void encerrar(), 100);
      return;
    case "/api/verificar":
      versao.checagem = "verificando";
      void checarAtualizacao();
      return json(res, 200, { ok: true });
  }
  json(res, 404, { erro: "rota" });
}

const http = createServer((req, res) => {
  // DNS rebinding: um site de fora pode apontar um nome dele pra 127.0.0.1,
  // mas o cabeçalho Host continua sendo o nome dele
  if (!HOSTS_OK.has(String(req.headers.host ?? ""))) {
    res.writeHead(403, { "content-type": TIPOS[".txt"] as string }).end("Painel do professor: abra por http://localhost:" + PORTA);
    return;
  }
  const rota = (req.url ?? "/").split("?")[0] ?? "/";
  if (rota.startsWith("/api/")) {
    api(req, res, rota).catch((e: unknown) => json(res, 500, { erro: String(e) }));
    return;
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405).end();
    return;
  }
  // o manual (botão "Dúvidas?") sai da pasta docs/ do próprio pacote: abre sem internet
  if (rota.startsWith("/docs/")) return servirArquivo(PASTA_DOCS, rota.slice("/docs/".length), res);
  servirArquivo(PASTA_PAGINA, rota === "/" ? "index.html" : rota.slice(1), res);
});

// ------------------------------------------------------------ navegador ---

function abrirNavegador(url: string): void {
  if (process.env["LJ_SEM_NAVEGADOR"] === "1") return;
  const [cmd, args] =
    process.platform === "win32"
      ? ["cmd.exe", ["/c", "start", "", url]]
      : process.platform === "darwin"
        ? ["open", [url]]
        : ["xdg-open", [url]];
  try {
    const p = spawn(cmd, args, { detached: true, stdio: "ignore", windowsHide: true });
    p.on("error", () => console.log(`(não consegui abrir o navegador sozinho — abra ${url})`));
    p.unref();
  } catch {
    console.log(`(não consegui abrir o navegador sozinho — abra ${url})`);
  }
}

// ---------------------------------------------------------------- saída ---

function sair(codigo: number): void {
  encerrando = true;
  void pararJogo().then(() => {
    http.close();
    process.exit(codigo);
  });
}

async function encerrar(): Promise<void> {
  if (encerrando) return;
  sair(0);
}

// Ctrl+C / fechar a janela: o host (filho) recebe o MESMO sinal e grava sozinho
// (bug-645). Aqui só se espera ele terminar — matar antes perderia o save.
for (const sinal of ["SIGINT", "SIGTERM", "SIGHUP", "SIGQUIT"] as const) {
  process.on(sinal, () => {
    if (encerrando) return;
    encerrando = true;
    const j = jogo;
    if (!j) return process.exit(0);
    // no Linux o filho já ganhou o sinal pelo grupo; o "parar" pelo IPC cobre
    // quem não ganhou (Windows fechando a janela)
    try {
      j.proc.send({ tipo: "parar" });
    } catch {
      /* já foi */
    }
    const prazo = setTimeout(() => process.exit(0), 10_000);
    void j.morreu.then(() => {
      clearTimeout(prazo);
      process.exit(0);
    });
  });
}

// ---------------------------------------------------------------- subir ---

const url = `http://localhost:${PORTA}`;
http.on("error", (e: NodeJS.ErrnoException) => {
  if (e.code === "EADDRINUSE") {
    // já tem um painel aberto (o professor clicou duas vezes no .bat): mostra ele
    console.log(`O painel do professor já está aberto em ${url} — abrindo no navegador.`);
    abrirNavegador(url);
    process.exit(0);
  }
  console.error("[painel] erro:", e.message);
  process.exit(1);
});
// 127.0.0.1 e não 0.0.0.0: o aluno na rede da escola NEM CONECTA (decisão dele)
http.listen(PORTA, "127.0.0.1", () => {
  console.log("============================================");
  console.log("  PAINEL DO PROFESSOR");
  console.log(`  ${url}`);
  console.log("  (abre sozinho no navegador; deixe ESTA janela aberta)");
  console.log("============================================");
  void checarAtualizacao();
  setInterval(() => void checarAtualizacao(), 30 * 60_000).unref();
  // Relançado depois de "atualizar agora": a aba antiga continua aberta e se
  // reconecta sozinha. Só abre outra se ninguém aparecer em 4 s.
  if (process.env["LJ_REABERTO"] === "1") {
    const desde = Date.now();
    setTimeout(() => {
      if (ultimaVisita < desde) abrirNavegador(url);
    }, 4000);
  } else {
    abrirNavegador(url);
  }
});
