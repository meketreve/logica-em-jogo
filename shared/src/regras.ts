/**
 * Regras de mundo (§🍖 F1, 2026-08-02) — o registro do `/regra`.
 *
 * Decisão do usuário (2026-07-27), no molde do `/gamerule` do Minecraft: **o
 * que a sobrevivência decide fica como regra ajustável por mundo, não como
 * constante de código.** Então existe UM registro (nome, padrão, texto de ajuda
 * em português de professor) e UM comando genérico; regra nova é uma entrada
 * nesta lista, sem comando novo, sem campo novo no save e sem protocolo novo.
 *
 * O que NÃO entra aqui: `/ciclo`, `/voo`, `/vento`, `/confinar`, `/terreno`. São
 * comandos que o professor já usou em piloto — reescrever a UX deles não é
 * escopo da sobrevivência. Unificar depois é barato (cada um vira um alias);
 * reaprender comando no meio da aula, não.
 *
 * O registro nasceu ANTES das mecânicas de propósito — é o que faz cada frente
 * seguinte ser uma leitura de `valorRegra(...)` em vez de mais um campo no
 * save. `fome` ganhou mecânica no F3, `manter-inventario` no F4 e `pvp` no F7
 * (2026-08-05): **hoje NENHUMA regra é `pendente`**. O campo fica no tipo de
 * propósito — a próxima regra que nascer antes da frente dela vai precisar
 * dele, e é ele que evita o professor ligar, testar, não ver nada e concluir
 * que o jogo quebrou.
 */

export interface RegraDef {
  /** Chave estável — vai no .ljw. Kebab-case SEM acento (é digitada no chat). */
  nome: string;
  padrao: boolean;
  /** O que ela faz, como o professor lê no chat. */
  ajuda: string;
  /** Ainda SEM mecânica (a frente que a lê não existe). O `/regra` avisa isso ao
   *  professor — senão ele liga, testa, não vê nada e conclui que quebrou. */
  pendente?: boolean;
}

export const REGRAS: readonly RegraDef[] = [
  {
    nome: "manter-inventario",
    padrao: true,
    ajuda:
      "Ao morrer, o jogador MANTÉM o que estava carregando. Ligada é o padrão de escola; desligue se quiser que a morte pese (aí os itens somem).",
    // F4 (2026-08-02) deu MECÂNICA a ela: `matar()` lê esta regra. Desligada,
    // a mochila some inteira — não há baú nem item no chão pra virar túmulo.
  },
  {
    nome: "pvp",
    padrao: false,
    ajuda:
      "Alunos podem se atacar: clique esquerdo em outro jogador, ao alcance, tira um coração. Só vale entre quem está em sobrevivência, e mundo de aula ignora a regra. Desligada por padrão — ligue com /pvp ligar.",
    // F7 (2026-08-05) deu MECÂNICA a ela: o `case atacar` da session lê esta
    // regra. Era a última entrada do registro sem frente correspondente.
  },
  {
    nome: "fome",
    padrao: true,
    ajuda:
      "A barra de fome (as coxas) baixa com o esforço: andar, construir e se curar gastam. No zero, o jogador para de se regenerar e perde vida devagar — mas a fome NÃO mata enquanto não houver comida no jogo. Desligue para uma sobrevivência sem fome (fundamental 1).",
  },
];

export function regraDef(nome: string): RegraDef | undefined {
  return REGRAS.find((r) => r.nome === nome);
}

export function nomesDeRegra(): string[] {
  return REGRAS.map((r) => r.nome);
}

/** Valor que VALE: o que o mundo guardou, ou o padrão do registro. */
export function valorRegra(mapa: ReadonlyMap<string, boolean>, nome: string): boolean {
  return mapa.get(nome) ?? regraDef(nome)?.padrao ?? false;
}

/**
 * Regras vindas de FORA (save .ljw). Parse defensivo, mesma tolerância do
 * resto do save: nome desconhecido e valor não-booleano são PULADOS (arquivo
 * antigo/editado continua válido).
 *
 * Guarda só o que DIFERE do padrão — ver `regrasParaSave`.
 */
export function parseRegras(raw: unknown): Map<string, boolean> {
  const mapa = new Map<string, boolean>();
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return mapa;
  for (const [nome, valor] of Object.entries(raw as Record<string, unknown>)) {
    const def = regraDef(nome);
    if (!def || typeof valor !== "boolean") continue;
    if (valor !== def.padrao) mapa.set(nome, valor);
  }
  return mapa;
}

/**
 * Regras pro save: só o que DIFERE do padrão (ausente = padrão). Mundo que
 * nunca mexeu em regra nenhuma não ganha campo no .ljw, e regra NOVA no
 * registro passa a valer nos mundos antigos sem migração.
 */
export function regrasParaSave(
  mapa: ReadonlyMap<string, boolean>,
): Record<string, boolean> | undefined {
  const out: Record<string, boolean> = {};
  let n = 0;
  for (const def of REGRAS) {
    const v = mapa.get(def.nome);
    if (v !== undefined && v !== def.padrao) {
      out[def.nome] = v;
      n++;
    }
  }
  return n ? out : undefined;
}
