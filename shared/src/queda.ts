/**
 * §📱 bug-675 — COMO a conexão anterior caiu, contado pelo próprio cliente
 * quando ele volta.
 *
 * Por que o cliente e não o host: no Android, mandar o tablet pra tela inicial
 * (a palma na barra de navegação) ou bloquear a tela MATA o socket na hora, e
 * o host vê exatamente o que veria numa queda de Wi-Fi — código 1006, sem
 * aviso. As aulas de 23 e 26/10 mostraram isso: zero "ficou sem responder" e
 * 39 "a conexão caiu (código 1006)", inclusive quatro no mesmo segundo no
 * sinal do recreio. Só a
 * página sabe se estava À VISTA quando o socket morreu — então ela anota, e
 * conta no `join` da volta.
 *
 * Relato inválido NÃO recusa o join: é observabilidade, e um campo torto não
 * pode deixar a criança do lado de fora. O parse devolve `null` e o join segue.
 */

export interface RelatoQueda {
  /** Código do `close` que a PÁGINA viu (1006 = sem aviso, 4000 = heartbeat). */
  codigo: number;
  /** Quanto tempo a tela ficou escondida antes da queda; `null` = estava à vista. */
  escondidaMs: number | null;
  /** Quanto tempo sem mensagem nenhuma do servidor até o `close`. */
  semNoticiaMs: number;
  /** `navigator.onLine` no instante da queda (falso = o tablet sabia que estava sem rede). */
  online: boolean;
  /** Voltou SOZINHO (reconexão automática) ou pelo MENU (a criança entrou de novo). */
  como: "sozinho" | "menu";
}

/** Um dia — acima disso o número é lixo (relógio que pulou), não medida. */
const TETO_MS = 24 * 60 * 60 * 1000;

function ms(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return Math.min(TETO_MS, Math.max(0, Math.round(v)));
}

/** Valida o relato vindo da rede. Qualquer campo torto = `null` (o join segue sem ele). */
export function lerRelatoQueda(v: unknown): RelatoQueda | null {
  if (typeof v !== "object" || v === null) return null;
  const r = v as Record<string, unknown>;
  const codigo = r["codigo"];
  if (typeof codigo !== "number" || !Number.isInteger(codigo) || codigo < 0 || codigo > 9999) {
    return null;
  }
  const semNoticiaMs = ms(r["semNoticiaMs"]);
  if (semNoticiaMs === null) return null;
  const escondidaMs = r["escondidaMs"] === null ? null : ms(r["escondidaMs"]);
  if (escondidaMs === null && r["escondidaMs"] !== null) return null;
  if (typeof r["online"] !== "boolean") return null;
  if (r["como"] !== "sozinho" && r["como"] !== "menu") return null;
  return { codigo, escondidaMs, semNoticiaMs, online: r["online"], como: r["como"] };
}

function segundos(msTotal: number): string {
  return msTotal < 1000 ? "menos de 1 s" : `${Math.round(msTotal / 1000)} s`;
}

/**
 * A linha do `-eventos.log`. As três causas têm FRASES diferentes de propósito
 * (mesma regra do motivo da saída, 2026-10-20): motivo que não se distingue
 * lendo o log não responde a pergunta que a aula fez.
 */
export function descreverVolta(nome: string, r: RelatoQueda): string {
  const como = r.como === "sozinho" ? "voltou sozinho" : "voltou pelo menu";
  const causa =
    r.escondidaMs !== null
      ? `com a tela ESCONDIDA havia ${segundos(r.escondidaMs)} (botão Home, tela bloqueada ou outro app)`
      : !r.online
        ? "com a tela à vista e o tablet SEM Wi-Fi"
        : "com a tela à vista (rede ou servidor)";
  return `${nome} ${como}: tinha caído ${causa} — ${segundos(r.semNoticiaMs)} sem notícia do servidor, código ${r.codigo}`;
}
