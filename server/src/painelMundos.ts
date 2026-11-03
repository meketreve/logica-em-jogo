import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";
import { PASTA_CENARIOS, PASTA_MUNDOS, daRaiz, ehMundoDeAula, savePathDoMundo } from "./paths";

/**
 * §🖥️ O que o PAINEL do professor sabe sobre mundos (2026-11-03).
 *
 * É a lógica que vivia DUPLICADA no `.sh` e no `.bat` (opções [1]–[11]) — o
 * menu de texto continua lá como reserva, mas quem manda agora é este
 * arquivo. Três regras que vêm de lá e NÃO podem se perder:
 *
 *  1. **`_*` é mundo de teste** (smokes e sondas criam `_smoke-…`/`_shot-…`)
 *     e não aparece pro professor.
 *  2. **Nome começado em "aula" = REUTILIZÁVEL** (`ehMundoDeAula`, pelo NOME):
 *     nunca salva a turma. Pra mundo que o professor vai CONSTRUIR isso é
 *     perder o trabalho — criar com esse nome é recusado.
 *  3. **Publicar FORÇA o prefixo "aula"** e copia pra `cenarios/` — sem o
 *     prefixo a cópia seria um mundo comum e a 2ª turma herdaria a 1ª.
 *
 * E uma do mundo novo: **o plano não aceita o tamanho E** (o mundo gigante é
 * lazy e ignora o preset — "plano gigante" devolveria morro).
 */

export type Tamanho = "P" | "M" | "G" | "E";

/** O cartão de uma aula: título que o professor reconhece + a frase do README. */
export interface Aula {
  /** Caminho relativo à raiz, do jeito que o `LJ_SAVE` recebe. */
  caminho: string;
  nome: string;
  numero: number | null;
  titulo: string;
  resumo: string;
  /** Arquivo em `server/painel/miniaturas/`, se existir. */
  miniatura: string | null;
  /** Veio no pacote (as 8) × publicada pelo professor. */
  doPacote: boolean;
}

export interface MundoSalvo {
  caminho: string;
  nome: string;
  /** ms desde 1970 da última gravação — o professor procura "o de ontem". */
  alteradoEm: number;
  bytes: number;
}

/**
 * As aulas que vêm no pacote. Título = o do `cenarios/README.md` (é o que o
 * manual e o menu antigo chamam), resumo = uma linha do que a criança faz.
 * Aula que NÃO está aqui (publicada pelo professor) ganha título do nome.
 */
const CATALOGO: Record<string, { numero: number; titulo: string; resumo: string }> = {
  "aula1-sequencia": { numero: 1, titulo: "Continue a regra", resumo: "Descobrir o padrão da fileira e continuar — 3 fases." },
  "aula2-binario": { numero: 2, titulo: "Escreva 45 em binário", resumo: "Lâmpadas acesas e apagadas viram número." },
  "aula3-depurar": { numero: 3, titulo: "Ache os 2 erros", resumo: "Comparar com o modelo e consertar o que está errado." },
  "aula4-decifrar": { numero: 4, titulo: "Decifre a mensagem", resumo: "Usar a chave pra ler o código escondido." },
  "aula5-simetria": { numero: 5, titulo: "Conserte o desenho", resumo: "Completar a outra metade no espelho." },
  "aula6-manual": { numero: 6, titulo: "Siga o manual", resumo: "Montar exatamente o que as instruções dizem." },
  "aula7-corrida": { numero: 7, titulo: "A corrida dos 4 postos", resumo: "Os grupos correm entre postos resolvendo desafios." },
  "aula8-circuitos": { numero: 8, titulo: "Acenda só as lâmpadas certas", resumo: "Circuitos com E e OU — 4 fases." },
};

const PASTA_MINIATURAS = daRaiz("server/painel/miniaturas");
const rel = (abs: string): string => abs.slice(daRaiz(".").length + 1).replaceAll("\\", "/");

/** Título legível de um nome de arquivo: "aula-fracoes-2" → "Fracoes 2". */
function tituloDoNome(nome: string): string {
  const limpo = nome.replace(/^aula[-_ ]?/i, "").replace(/[-_]+/g, " ").trim();
  return limpo ? limpo[0]!.toUpperCase() + limpo.slice(1) : nome;
}

export function listarAulas(): Aula[] {
  if (!existsSync(PASTA_CENARIOS)) return [];
  const aulas: Aula[] = [];
  for (const arq of readdirSync(PASTA_CENARIOS)) {
    if (!arq.toLowerCase().endsWith(".ljw")) continue;
    const nome = arq.slice(0, -4);
    const cat = CATALOGO[nome];
    const mini = [".jpg", ".png"].map((e) => `${nome}${e}`).find((f) => existsSync(resolve(PASTA_MINIATURAS, f)));
    aulas.push({
      caminho: `cenarios/${arq}`,
      nome,
      numero: cat?.numero ?? null,
      titulo: cat?.titulo ?? tituloDoNome(nome),
      resumo: cat?.resumo ?? "Aula publicada por você.",
      miniatura: mini ?? null,
      doPacote: cat !== undefined,
    });
  }
  // as do pacote na ordem do número; as publicadas depois, por nome
  return aulas.sort((a, b) => (a.numero ?? 99) - (b.numero ?? 99) || a.nome.localeCompare(b.nome));
}

export function listarMundos(): MundoSalvo[] {
  if (!existsSync(PASTA_MUNDOS)) return [];
  const mundos: MundoSalvo[] = [];
  for (const nome of readdirSync(PASTA_MUNDOS)) {
    if (nome.startsWith("_")) continue; // regra 1: mundo de teste
    // a cópia de trabalho de uma AULA também mora em mundos/ — mas ela é
    // descartada a cada boot (regra 2), então listar seria oferecer um
    // "mundo salvo" que não guarda nada
    if (ehMundoDeAula(nome)) continue;
    const save = savePathDoMundo(nome);
    if (!existsSync(save)) continue;
    const st = statSync(save);
    mundos.push({ caminho: rel(save), nome, alteradoEm: st.mtimeMs, bytes: st.size });
  }
  return mundos.sort((a, b) => b.alteradoEm - a.alteradoEm);
}

/**
 * Nome digitado → nome de pasta. Espaço vira hífen (como nos launchers);
 * acento fica (é nome de pasta, o Windows aceita), mas nada que ande pela
 * árvore de arquivos: barra, ponto no começo, ".." e os proibidos do Windows.
 */
export function limparNome(bruto: string): string {
  return bruto.trim().replace(/\s+/g, "-").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").replace(/^\.+/, "").slice(0, 60);
}

export type Recusa = { ok: false; erro: string };

export interface PedidoCriar {
  tipo: "procedural" | "plano" | "normal";
  nome: string;
  tamanho?: Tamanho;
}

/** O que o host precisa receber pra criar o mundo pedido. */
export interface Abertura {
  ok: true;
  /** `LJ_SAVE`. */
  caminho: string;
  env: Record<string, string>;
  rotulo: string;
}

export function validarCriacao(p: PedidoCriar): Abertura | Recusa {
  const nome = limparNome(p.nome ?? "");
  if (!nome) return { ok: false, erro: "Dê um nome ao mundo." };
  if (nome.startsWith("_")) return { ok: false, erro: "Nome não pode começar com _ (é reservado pros mundos de teste)." };
  // regra 2
  if (ehMundoDeAula(nome)) {
    return {
      ok: false,
      erro:
        'Nome começado com "aula" faz o mundo voltar ao original a cada turma e NÃO guardar o que for construído. ' +
        "Escolha outro nome — quando terminar, use Publicar como aula.",
    };
  }
  if (existsSync(savePathDoMundo(nome))) {
    return { ok: false, erro: `Já existe um mundo "${nome}". Abra ele em "Meus mundos" ou escolha outro nome.` };
  }
  const caminho = rel(savePathDoMundo(nome));
  if (p.tipo === "procedural") {
    return { ok: true, caminho, env: { LJ_TAMANHO: "E", LJ_NOVO: "1" }, rotulo: `mundo procedural "${nome}"` };
  }
  const tam = p.tamanho ?? "P";
  if (tam !== "P" && tam !== "M" && tam !== "G") {
    // o E ignora o preset: "plano gigante" devolveria morro
    return { ok: false, erro: "Esse tipo de mundo só tem os tamanhos pequeno, médio e grande." };
  }
  if (p.tipo === "plano") {
    return { ok: true, caminho, env: { LJ_TAMANHO: tam, LJ_PRESET: "plano", LJ_NOVO: "1" }, rotulo: `mundo plano "${nome}"` };
  }
  return { ok: true, caminho, env: { LJ_TAMANHO: tam, LJ_NOVO: "1" }, rotulo: `mundo "${nome}"` };
}

/**
 * Abrir um mundo/aula que JÁ existe. Só aceita caminho que as listas acima
 * oferecem — o painel não abre arquivo qualquer do disco.
 */
export function validarAbertura(caminho: string, tamanhoSeNovo: Tamanho = "P"): Abertura | Recusa {
  if (caminho === MUNDO_LIVRE) {
    // o "mundo livre" é o único que nasce sozinho na 1ª vez (o [1] do menu)
    const tam = ["P", "M", "G", "E"].includes(tamanhoSeNovo) ? tamanhoSeNovo : "P";
    return { ok: true, caminho, env: { LJ_NOVO: "1", LJ_TAMANHO: tam }, rotulo: "Mundo livre" };
  }
  const aula = listarAulas().find((a) => a.caminho === caminho);
  if (aula) return { ok: true, caminho, env: {}, rotulo: aula.numero ? `Aula ${aula.numero} — ${aula.titulo}` : aula.titulo };
  const mundo = listarMundos().find((m) => m.caminho === caminho);
  if (mundo) return { ok: true, caminho, env: {}, rotulo: `mundo "${mundo.nome}"` };
  return { ok: false, erro: "Esse mundo não existe mais (foi apagado ou renomeado?)." };
}

export const MUNDO_LIVRE = "mundos/mundo-livre/mundo-livre.ljw";

export interface PedidoPublicar {
  origem: string;
  nome?: string;
  sobrescrever?: boolean;
}

export type Publicacao =
  | { ok: true; caminho: string; nome: string; prefixoForcado: boolean }
  | Recusa
  | { ok: false; existe: true; nome: string; erro: string };

/** Regra 3: copia `mundos/<x>/<x>.ljw` → `cenarios/aula….ljw`. O original fica. */
export function publicarAula(p: PedidoPublicar): Publicacao {
  const origem = listarMundos().find((m) => m.caminho === p.origem);
  if (!origem) return { ok: false, erro: "Escolha um dos seus mundos salvos para publicar." };
  let nome = limparNome(p.nome?.trim() ? p.nome : `aula-${origem.nome}`);
  if (!nome) nome = `aula-${origem.nome}`;
  let prefixoForcado = false;
  if (!ehMundoDeAula(nome)) {
    nome = `aula-${nome}`;
    prefixoForcado = true;
  }
  const destino = resolve(PASTA_CENARIOS, `${nome}.ljw`);
  if (existsSync(destino) && !p.sobrescrever) {
    return { ok: false, existe: true, nome, erro: `Já existe uma aula chamada "${nome}".` };
  }
  mkdirSync(PASTA_CENARIOS, { recursive: true });
  copyFileSync(daRaiz(origem.caminho), destino);
  return { ok: true, caminho: `cenarios/${basename(destino)}`, nome, prefixoForcado };
}
