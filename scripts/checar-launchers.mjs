#!/usr/bin/env node
/**
 * PORTÃO DOS LAUNCHERS (bug-621).
 *
 * Existe porque o erro que ele pega **não aparece em nenhuma outra bateria**:
 * typecheck, testes, build e smoke passam todos verdes com o launcher
 * quebrado, e quem descobre é a escola no meio da aula.
 *
 * O que aconteceu: um `⚠️` num comentário `REM` do `iniciar-servidor.bat`
 * transformou a rodada inteira em dezenas de *"'d' não é reconhecido como um
 * comando interno ou externo"*. **O `cmd.exe` lê arquivo `.bat` por
 * DESLOCAMENTO DE BYTE.** Com `chcp 65001` ligado (linha 7 do arquivo), um
 * caractere multibyte faz o número de bytes divergir do de caracteres; sem
 * `\r` para reancorar, o parser retoma no MEIO da linha seguinte e executa
 * pedaços de comentário como se fossem comandos.
 *
 * Medido no `cmd.exe` de verdade, quatro variantes do MESMO cabeçalho:
 *   LF + emoji   -> QUEBRA (o erro do relato)   ·  LF + só ASCII -> ok
 *   CRLF + emoji -> ok                           ·  CRLF + ASCII -> ok
 *
 * Por isso a regra é **ASCII puro no `.bat`**, e não "use CRLF": o
 * `.gitattributes` do projeto força `eol=lf` em tudo (ele vive no WSL), e uma
 * exceção por extensão seria mais uma coisa para lembrar. ASCII puro é a regra
 * que o arquivo já seguia sozinho — "atualizacao", "voce", "nao" — e ninguém
 * tinha escrito por quê.
 *
 * ⚠️ Mora em `scripts/` e não em `shared/src/*.test.ts` de propósito: o
 * workspace `shared` não tem `@types/node`, e é isso que impede o código de
 * produção dele de alcançar API de Node. Um teste que lê arquivo furaria essa
 * garantia para todo o pacote.
 *
 * Roda em `npm run verify` e antes de `npm run smoke`. Custa milissegundos.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (nome) => readFileSync(join(RAIZ, nome));

let falhas = 0;
const ok = (cond, texto, detalhe = "") => {
  if (!cond) falhas++;
  console.log(`  ${cond ? "✓" : "✗"} ${texto}${detalhe ? `\n      ${detalhe}` : ""}`);
};

console.log("portão dos launchers (bug-621):");

// --- 1. o .bat é ASCII puro ---------------------------------------------
{
  const bytes = ler("iniciar-servidor.bat");
  const linhas = new Set();
  let linha = 1;
  for (const b of bytes) {
    if (b === 0x0a) linha++;
    else if (b > 127) linhas.add(linha);
  }
  ok(
    linhas.size === 0,
    "iniciar-servidor.bat é ASCII puro",
    linhas.size === 0
      ? ""
      : `byte não-ASCII na(s) linha(s) ${[...linhas].join(", ")}. O cmd.exe lê o .bat por ` +
        "deslocamento de byte e o chcp 65001 desalinha o parser: troque acento/emoji por " +
        "ASCII (ATENCAO, voce, nao).",
  );
}

// --- 2. o .bat não mistura terminadores ---------------------------------
{
  const t = ler("iniciar-servidor.bat").toString("latin1");
  const lf = (t.match(/\n/g) ?? []).length;
  const crlf = (t.match(/\r\n/g) ?? []).length;
  ok(crlf === 0 || crlf === lf, "iniciar-servidor.bat não mistura LF e CRLF", crlf === 0 || crlf === lf ? "" : `${crlf} CRLF para ${lf} LF`);
}

// --- 3. o .sh não tem \r ------------------------------------------------
{
  const temCR = ler("iniciar-servidor.sh").includes(0x0d);
  ok(!temCR, "iniciar-servidor.sh não tem \\r", temCR ? "o bash trata o \\r como parte do comando e nada roda" : "");
}

// --- 4. a decisão de update continua sendo por CAPACIDADE (bug-620) -----
{
  const bat = ler("iniciar-servidor.bat").toString("utf8");
  const sh = ler("iniciar-servidor.sh").toString("utf8");
  const exigidos = ["git rev-parse --is-inside-work-tree", "git config --get remote.origin.url", "LJ_UPDATE"];
  for (const [nome, txt] of [["bat", bat], ["sh", sh]]) {
    const falta = exigidos.filter((e) => !txt.includes(e));
    ok(
      falta.length === 0,
      `iniciar-servidor.${nome} decide o update por capacidade, não por presença de .git`,
      falta.length === 0 ? "" : `falta: ${falta.join(" · ")} — o teste \`if exist ".git"\` sozinho desligava a atualização de quem tinha um .git sobrando (bug-620)`,
    );
  }
}

console.log(falhas === 0 ? "  launchers OK" : `  ✗ ${falhas} falha(s) no portão dos launchers`);
process.exit(falhas === 0 ? 0 : 1);
