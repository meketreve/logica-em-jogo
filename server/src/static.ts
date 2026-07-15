import { existsSync, readFileSync, statSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { daRaiz } from "./paths";

/**
 * Serve o cliente já buildado (client/dist) NA MESMA PORTA do WebSocket.
 *
 * Por que na mesma porta: o aluno abre `http://ip-do-professor:8080` e o campo
 * de endereço do menu já nasce com `ws://<mesmo host>:8080` — sem digitar URL de
 * WebSocket à mão. E, principalmente, página e socket na MESMA ORIGEM: página
 * servida por HTTPS não pode abrir `ws://` (o navegador bloqueia conteúdo
 * misto), e um servidor de LAN não tem certificado pra oferecer `wss://`. Servir
 * o cliente do próprio host é o que torna a aula possível sem certificado.
 *
 * Sem dependências: `ws` continua sendo a única do servidor.
 */

const DIST = daRaiz("client/dist");

const TIPOS: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

export const clienteFoiBuildado = (): boolean => existsSync(join(DIST, "index.html"));

/** Página de socorro quando o cliente não foi buildado — melhor que um 404 seco. */
function semBuild(res: ServerResponse): void {
  res.writeHead(503, { "content-type": TIPOS[".html"] as string });
  res.end(
    `<!doctype html><meta charset="utf-8"><title>Lógica em Jogo</title>` +
      `<style>body{font-family:system-ui,sans-serif;max-width:36rem;margin:15vh auto;padding:0 1.5rem;line-height:1.6}` +
      `code{background:#eee;padding:.15em .4em;border-radius:.25em}</style>` +
      `<h1>O jogo ainda não foi preparado neste computador</h1>` +
      `<p>O servidor está no ar, mas o cliente não foi compilado — não há nada para entregar ao navegador.</p>` +
      `<p>No computador que hospeda a aula, execute uma vez:</p><p><code>npm run build</code></p>` +
      `<p>Depois recarregue esta página.</p>`,
  );
}

/**
 * Resolve a URL para um arquivo DENTRO de client/dist. Devolve null se a URL
 * tentar escapar da pasta (../ etc.) — o servidor roda na máquina do professor,
 * com a rede da escola inteira alcançando esta porta.
 */
function arquivoDe(url: string): string | null {
  const caminho = decodeURIComponent((url.split("?")[0] ?? "/").split("#")[0] ?? "/");
  const alvo = resolve(join(DIST, normalize(caminho)));
  if (alvo !== DIST && !alvo.startsWith(DIST + sep)) return null; // path traversal
  return alvo;
}

export function servirCliente(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { allow: "GET, HEAD" });
    res.end("Este servidor só responde a GET.");
    return;
  }
  if (!clienteFoiBuildado()) {
    semBuild(res);
    return;
  }

  const alvo = arquivoDe(req.url ?? "/");
  if (!alvo) {
    res.writeHead(403);
    res.end("Caminho fora da pasta do jogo.");
    return;
  }

  // rota desconhecida cai no index.html (o jogo é uma página só)
  const arquivo =
    existsSync(alvo) && statSync(alvo).isFile() ? alvo : join(DIST, "index.html");

  const body = readFileSync(arquivo);
  res.writeHead(200, {
    "content-type": TIPOS[extname(arquivo)] ?? "application/octet-stream",
    "content-length": body.byteLength,
    // o mundo da aula muda a cada boot; não deixar o navegador guardar o jogo
    "cache-control": arquivo.endsWith("index.html") ? "no-store" : "public, max-age=3600",
  });
  res.end(req.method === "HEAD" ? undefined : body);
}
