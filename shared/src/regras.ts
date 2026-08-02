/**
 * Regras de mundo (§🍖 F1, 2026-08-02) — o registro do `/regra`.
 *
 * Decisão do usuário (2026-07-27), no molde do `/gamerule` do Minecraft: **o
 * que a sobrevivência decide fica como regra ajustável por mundo, não como
 * constante de código.** Então existe UM registro (nome, padrão, texto de ajuda
 * em português de professor) e UM comando genérico; regra nova é uma entrada
 * nesta lista, sem comando novo, sem campo novo no save e sem protocolo novo.
 *
 * O que NÃO entra aqui: `/ciclo`, `/voo`, `/vento`, `/confinar`, `/claim`. São
 * comandos que o professor já usou em piloto — reescrever a UX deles não é
 * escopo da sobrevivência. Unificar depois é barato (cada um vira um alias);
 * reaprender comando no meio da aula, não.
 *
 * As regras do lite ainda não têm MECÂNICA: `manter-inventario` e `fome` só
 * começam a decidir alguma coisa no F2/F3, e `pvp` no F7. O registro nasce
 * antes de propósito — é o que faz cada frente seguinte ser uma leitura de
 * `valorRegra(...)` em vez de mais um campo no save.
 */

export interface RegraDef {
  /** Chave estável — vai no .ljw. Kebab-case SEM acento (é digitada no chat). */
  nome: string;
  padrao: boolean;
  /** O que ela faz, como o professor lê no chat. */
  ajuda: string;
}

export const REGRAS: readonly RegraDef[] = [
  {
    nome: "manter-inventario",
    padrao: true,
    ajuda:
      "Ao morrer, o jogador MANTÉM o que estava carregando. Ligada é o padrão de escola; desligue se quiser que a morte pese (aí os itens somem).",
  },
  {
    nome: "pvp",
    padrao: false,
    ajuda: "Alunos podem se atacar. Desligada por padrão.",
  },
  {
    nome: "fome",
    padrao: true,
    ajuda:
      "A barra de fome baixa com o esforço e obriga a comer. Desligue para uma sobrevivência sem fome (turmas menores).",
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
