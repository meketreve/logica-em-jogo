import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { type GameSession, decodeSave } from "@logica/shared";
import { daRaiz, mundoDeTrabalho } from "./paths";

/**
 * `/mundo` (cp19) — trocar a aula SEM derrubar a turma.
 *
 * Mora no host, não em /shared, por um motivo simples: carregar outro .ljw é
 * ler um arquivo, e a GameSession não tem (nem deve ter) sistema de arquivos.
 * O host intercepta o comando ANTES de entregá-lo à sessão.
 *
 * A troca é: salvar o mundo atual → decodificar o novo (se estiver corrompido,
 * aborta e nada muda) → construir uma sessão nova → re-admitir cada cliente
 * conectado com `session.adotar()`. Ninguém reconecta, ninguém digita PIN de
 * novo, e o professor continua professor.
 */

/** Nome de exibição: sem a extensão .ljw (o professor não precisa digitá-la). */
const semExt = (caminho: string): string => basename(caminho).replace(/\.ljw$/i, "");

/** Pastas onde um mundo pode estar: a do save em uso e a dos cenários gerados. */
const pastasDeMundos = (savePath: string): string[] => [
  dirname(savePath),
  daRaiz("cenarios"),
];

function mundosDisponiveis(savePath: string): string[] {
  // Uma aula por NOME de arquivo: a cópia viva em mundos/ e o modelo em cenarios/
  // têm o mesmo nome e não devem aparecer duas vezes. O 1º achado (pasta do save
  // em uso) vence — se a turma já mexeu na aula, é essa cópia que se carrega.
  const porNome = new Map<string, string>();
  for (const pasta of pastasDeMundos(savePath)) {
    if (!existsSync(pasta)) continue;
    for (const f of readdirSync(pasta)) {
      if (f.endsWith(".ljw") && !porNome.has(f)) porNome.set(f, join(pasta, f));
    }
  }
  return [...porNome.values()].sort();
}

/**
 * Resolve o que o professor digitou para um arquivo existente. Aceita só o NOME
 * do arquivo, nunca um caminho: o comando chega pela rede da escola, e um
 * caminho livre daria a qualquer professor a leitura do disco do host.
 */
function acharMundo(pedido: string, savePath: string): string | undefined {
  const alvo = basename(pedido).toLowerCase();
  const comExtensao = alvo.endsWith(".ljw") ? alvo : `${alvo}.ljw`;
  return mundosDisponiveis(savePath).find(
    (caminho) => basename(caminho).toLowerCase() === comExtensao,
  );
}

export interface TrocaDeMundo {
  /** Sessão em vigor (o host substitui a dele pela devolvida aqui). */
  session: GameSession;
  savePath: string;
  /** Mundo de aula (reutilizável): não salva alterações. */
  somenteLeitura: boolean;
}

export interface ContextoMundo {
  session: GameSession;
  savePath: string;
  codigo: string;
  /** Constrói a sessão do mundo novo (o host sabe montar; este módulo não).
   *  `somenteLeitura` = mundo de aula → a sessão nasce confinada (cp25). */
  novaSessao: (
    restore: ReturnType<typeof decodeSave>,
    somenteLeitura: boolean,
  ) => GameSession;
  salvarAgora: (motivo: string) => void;
  /** Fala do servidor só para quem digitou o comando. */
  responder: (texto: string) => void;
  /** Fala do servidor para a turma inteira. */
  anunciar: (texto: string) => void;
}

/**
 * Trata `/mundo …`. Devolve a nova sessão quando houve troca, ou `undefined`
 * quando o comando só respondeu texto (lista, atual, erro de uso).
 */
export function comandoMundo(
  partes: string[],
  ctx: ContextoMundo,
): TrocaDeMundo | undefined {
  const sub = partes[1] ?? "lista";

  if (sub === "atual") {
    ctx.responder(`A aula em curso é "${semExt(ctx.savePath)}".`);
    return undefined;
  }

  if (sub === "lista") {
    const mundos = mundosDisponiveis(ctx.savePath);
    if (mundos.length === 0) {
      ctx.responder(
        "Nenhum mundo encontrado. Gere os cenários com `npm run cenarios` na máquina que hospeda a aula.",
      );
      return undefined;
    }
    const atual = basename(ctx.savePath);
    ctx.responder(
      "Aulas disponíveis: " +
        mundos
          .map((m) => (basename(m) === atual ? `${semExt(m)} (em curso)` : semExt(m)))
          .join(" · ") +
        ". Para trocar, digite: /mundo carregar nome (a extensão .ljw não é necessária).",
    );
    return undefined;
  }

  if (sub !== "carregar") {
    ctx.responder("Uso: /mundo lista · /mundo atual · /mundo carregar nome-do-arquivo");
    return undefined;
  }

  const pedido = partes[2];
  if (!pedido) {
    ctx.responder("Uso: /mundo carregar nome-do-arquivo (veja os nomes em /mundo lista).");
    return undefined;
  }

  const encontrado = acharMundo(pedido, ctx.savePath);
  if (!encontrado) {
    ctx.responder(
      `Não encontrei o mundo "${pedido}". Veja os nomes disponíveis com /mundo lista.`,
    );
    return undefined;
  }

  // Modelo em cenarios/ nunca é aberto para escrita: vira uma cópia de trabalho
  // em mundos/. Se a cópia já existe (turma continuando), carrega dela; senão, do
  // modelo. O autosave grava sempre em `vivo`.
  const { vivo, modelo, somenteLeitura } = mundoDeTrabalho(encontrado);
  if (vivo === ctx.savePath) {
    ctx.responder(`"${semExt(vivo)}" já é a aula em curso.`);
    return undefined;
  }
  // Aula (só leitura) começa sempre do modelo; mundo normal continua da cópia
  // viva se existir. Fallback final = o próprio arquivo achado.
  const fonte = somenteLeitura
    ? (modelo ?? (existsSync(vivo) ? vivo : encontrado))
    : existsSync(vivo)
      ? vivo
      : (modelo ?? encontrado);

  // decodifica ANTES de mexer em qualquer coisa: arquivo corrompido não pode
  // deixar a turma sem mundo nenhum
  let novo: ReturnType<typeof decodeSave>;
  try {
    const raw = readFileSync(fonte);
    novo = decodeSave(
      raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer,
    );
  } catch (err) {
    ctx.responder(
      `O arquivo "${basename(fonte)}" está corrompido e não foi carregado ` +
        `(${(err as Error).message}). A aula em curso continua no ar.`,
    );
    return undefined;
  }

  ctx.salvarAgora("troca de aula");
  const jogadores = ctx.session.jogadoresConectados();
  const sessionNova = ctx.novaSessao(novo, somenteLeitura);
  // cada cliente já conectado entra no mundo novo sem reconectar nem digitar PIN
  for (const j of jogadores) sessionNova.adotar(j.id, j.name, j.papel);

  console.log(
    `[server] aula trocada para ${vivo} (de ${basename(fonte)}, ${jogadores.length} jogador(es) migrado(s))`,
  );
  return { session: sessionNova, savePath: vivo, somenteLeitura };
}

/** Anúncio da troca — a sessão nova já falou com cada um; isto é para o log/turma. */
export const anuncioDeTroca = (caminho: string, quantos: number): string =>
  `A aula agora é "${semExt(caminho)}". ${quantos} jogador(es) foram levados para o mundo novo.`;
