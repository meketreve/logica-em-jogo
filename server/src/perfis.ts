import { mkdirSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { resolve } from "node:path";
import { PASTA_PROFILES } from "./paths";

/**
 * Onde os perfis de desempenho param: sempre `profiles/`, na máquina do host.
 *
 * Duas portas de entrada, MESMA pasta e MESMA regra de nome:
 * 1. `profile_report` por WebSocket — o botão "enviar pro servidor" do F3, de
 *    quem está jogando EM REDE (o host já tem o socket aberto).
 * 2. `POST /perfil` — o modo `?bench`, que roda em SINGLEPLAYER (Web Worker) e
 *    por isso não tem socket com o host nenhum. A página vem de
 *    `http://<host>:8080/?bench`, então o POST é de mesma origem e cai aqui.
 *    Sem isto, cada PC do laboratório deixava o JSON na própria pasta de
 *    downloads e alguém teria que recolher máquina por máquina.
 *
 * O NOME do jogador não entra em lugar nenhum (nem no conteúdo, nem no
 * arquivo): perfil é anônimo de propósito, identifica-se por versão do jogo +
 * dispositivo. O nome do arquivo é timestamp + sufixo aleatório (dois aparelhos
 * no mesmo milissegundo não colidem) e NUNCA vem de dado do usuário — sem
 * chance de path traversal.
 */

/** Teto do corpo do POST (bytes). Um perfil real tem ~5 KB; acima disso é
 *  lixo/abuso, não perfilação — a porta fica aberta pra escola inteira. */
const MAX_CORPO = 64 * 1024;
/** Freio simples contra encher o disco: no máximo N gravações por minuto. */
const MAX_POR_MINUTO = 20;
const gravacoes: number[] = [];

function permitido(): boolean {
  const agora = Date.now();
  while (gravacoes.length > 0 && agora - (gravacoes[0] as number) > 60_000) gravacoes.shift();
  if (gravacoes.length >= MAX_POR_MINUTO) return false;
  gravacoes.push(agora);
  return true;
}

/**
 * Grava o perfil e devolve o nome do arquivo. Perfil de benchmark ganha o
 * prefixo `perf-bench-`: os dois convivem na mesma pasta e a origem se lê no
 * `ls` (foi trajeto fixo comparável, ou foi alguém jogando à mão?).
 */
export function salvarPerfil(stats: Record<string, unknown>): string {
  const meta = stats["meta"];
  const ehBench =
    typeof meta === "object" && meta !== null && "bench" in (meta as Record<string, unknown>);
  const sufixo = Math.random().toString(36).slice(2, 6);
  const nome = `perf-${ehBench ? "bench-" : ""}${Date.now()}-${sufixo}.json`;
  mkdirSync(PASTA_PROFILES, { recursive: true });
  writeFileSync(resolve(PASTA_PROFILES, nome), JSON.stringify(stats, null, 2));
  return nome;
}

/**
 * Trata `POST /perfil`. Devolve true quando engoliu a requisição (o servidor de
 * arquivos não deve nem ver — ele só responde GET/HEAD).
 */
export function receberPerfilHttp(req: IncomingMessage, res: ServerResponse): boolean {
  const rota = (req.url ?? "/").split("?")[0];
  if (req.method !== "POST" || rota !== "/perfil") return false;

  if (!permitido()) {
    res.writeHead(429, { "content-type": "application/json" });
    res.end(JSON.stringify({ erro: "muitos perfis por minuto" }));
    return true;
  }

  const partes: Buffer[] = [];
  let tamanho = 0;
  req.on("data", (pedaco: Buffer) => {
    tamanho += pedaco.byteLength;
    if (tamanho > MAX_CORPO) {
      res.writeHead(413, { "content-type": "application/json" });
      res.end(JSON.stringify({ erro: "perfil grande demais" }));
      req.destroy();
      return;
    }
    partes.push(pedaco);
  });
  req.on("end", () => {
    if (res.writableEnded) return; // já respondi 413 lá em cima
    let stats: unknown;
    try {
      stats = JSON.parse(Buffer.concat(partes).toString("utf8"));
    } catch {
      stats = null;
    }
    if (typeof stats !== "object" || stats === null || Array.isArray(stats)) {
      res.writeHead(400, { "content-type": "application/json" });
      res.end(JSON.stringify({ erro: "corpo não é um objeto JSON" }));
      return;
    }
    const nome = salvarPerfil(stats as Record<string, unknown>);
    console.log(`[server] perfil recebido por HTTP → profiles/${nome}`);
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ arquivo: nome }));
  });
  return true;
}
