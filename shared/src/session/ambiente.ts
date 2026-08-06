import { type ServerMessage } from "../protocol";
import { VENTO_PARADO, type Vento, ventoIntensidade, ventoNoTick, ventoRumo } from "../vento";
import type { GameSession } from "../session";

/**
 * AMBIENTE do mundo: hora do dia, ciclo dia/noite, vento e voo criativo.
 *
 * Os quatro são a mesma coisa do ponto de vista do servidor — um estado
 * pequeno que o professor alterna por comando e que TODO cliente precisa
 * receber (no join e a cada mudança). Nenhum deles afeta física ou regra: o
 * vento é ambiência, o ciclo é céu, e o voo é permissão.
 */

export function runHora(ses: GameSession, parts: string[], professor: boolean): string {
  if (parts.length === 1) {
    return (
      `Agora são ${horaFormatada(ses)} (${ses.cicloAtivo ? "o tempo está passando" : "ciclo parado"}).` +
      (professor
        ? " Ajuste com /hora dia, /hora noite, /hora amanhecer, /hora entardecer, /hora meio-dia, /hora meia-noite ou /hora 0..23."
        : "")
    );
  }
  const alvo = (parts[1] ?? "").toLowerCase();
  const presets: Record<string, number> = {
    "meia-noite": 0,
    madrugada: 3,
    amanhecer: 6,
    manha: 8,
    manhã: 8,
    dia: 8,
    "meio-dia": 12,
    tarde: 15,
    entardecer: 18,
    noite: 21,
  };
  let h: number;
  if (alvo in presets) {
    h = presets[alvo]!;
  } else {
    const n = Number(alvo);
    if (!Number.isInteger(n) || n < 0 || n > 23) {
      return "Uso: /hora dia|noite|amanhecer|entardecer|meio-dia|meia-noite ou um número inteiro de 0 a 23.";
    }
    h = n;
  }
  ses.horaDoDia = h;
  broadcastTime(ses);
  return `Hora ajustada para ${horaFormatada(ses)}.`;
}

/** `/ciclo` (cp21): liga/desliga o avanço do tempo. Sem argumento, alterna. */
export function runCiclo(ses: GameSession, parts: string[]): string {
  const arg = parts[1]?.toLowerCase();
  if (arg === "ligar" || arg === "on") ses.cicloAtivo = true;
  else if (arg === "desligar" || arg === "off") ses.cicloAtivo = false;
  else if (arg === undefined) ses.cicloAtivo = !ses.cicloAtivo;
  else return "Uso: /ciclo ligar ou /ciclo desligar (sem argumento, alterna).";
  broadcastTime(ses);
  return ses.cicloAtivo
    ? "Ciclo de dia e noite ativado — o tempo passa."
    : `Ciclo de dia e noite parado em ${horaFormatada(ses)}.`;
}

/** Hora do dia como "08h30" (leitura do professor no chat). */
export function horaFormatada(ses: GameSession): string {
  const h = Math.floor(ses.horaDoDia) % 24;
  const m = Math.floor((ses.horaDoDia - Math.floor(ses.horaDoDia)) * 60);
  return `${String(h).padStart(2, "0")}h${String(m).padStart(2, "0")}`;
}

export function sendTime(ses: GameSession, clientId: number): void {
  ses.send(
    clientId,
    JSON.stringify({
      type: "time",
      hora: +ses.horaDoDia.toFixed(3),
      ciclo: ses.cicloAtivo,
    } satisfies ServerMessage),
  );
}

export function broadcastTime(ses: GameSession): void {
  ses.broadcast({ type: "time", hora: +ses.horaDoDia.toFixed(3), ciclo: ses.cicloAtivo });
}

/** `/vento` (§🌬️): liga/desliga o vento. Sem argumento, alterna (molde do
 *  /ciclo). NÃO há ajuste manual de direção/força — o vento é procedural
 *  (decisão do usuário, 2026-07-27): o professor só escolhe entre cenário
 *  vivo e cenário parado. */
export function runVento(ses: GameSession, parts: string[]): string {
  const arg = parts[1]?.toLowerCase();
  if (arg === "ligar" || arg === "on") ses.ventoAtivo = true;
  else if (arg === "desligar" || arg === "off") ses.ventoAtivo = false;
  else if (arg === undefined) ses.ventoAtivo = !ses.ventoAtivo;
  else return "Uso: /vento ligar ou /vento desligar (sem argumento, alterna).";
  broadcastVento(ses);
  if (!ses.ventoAtivo) return "Vento desligado — água, nuvens e folhas param.";
  const v = ventoAgora(ses);
  return `Vento ligado: ${ventoIntensidade(v.forca)} soprando para ${ventoRumo(v.dir)}.`;
}

/** Vento AGORA: função pura do tick + seed quando ligado, calmaria quando não.
 *  Fonte única — o comando, o join e o broadcast leem daqui. */
export function ventoAgora(ses: GameSession): Vento {
  return ses.ventoAtivo ? ventoNoTick(ses.tickCount, ses.seed) : VENTO_PARADO;
}

export function ventoMsg(ses: GameSession): ServerMessage {
  const v = ventoAgora(ses);
  return {
    type: "vento",
    dir: +v.dir.toFixed(3),
    forca: +v.forca.toFixed(3),
    ativo: ses.ventoAtivo,
  };
}

export function sendVento(ses: GameSession, clientId: number): void {
  ses.send(clientId, JSON.stringify(ventoMsg(ses)));
}

export function broadcastVento(ses: GameSession): void {
  ses.broadcast(ventoMsg(ses));
}

/** `/voo`: libera/tranca o voo criativo pra TURMA. Sem argumento, alterna.
 *  O professor voa sempre (independe disto). */
export function runVoo(ses: GameSession, parts: string[]): string {
  const arg = parts[1]?.toLowerCase();
  if (arg === "ligar" || arg === "on") ses.vooLiberado = true;
  else if (arg === "desligar" || arg === "off") ses.vooLiberado = false;
  else if (arg === undefined) ses.vooLiberado = !ses.vooLiberado;
  else return "Uso: /voo ligar ou /voo desligar (sem argumento, alterna).";
  broadcastVoo(ses);
  return ses.vooLiberado
    ? "Voo liberado para a turma — dê dois toques no espaço para voar; espaço sobe e agachar desce."
    : "Voo trancado para a turma (você continua podendo voar).";
}

export function sendVoo(ses: GameSession, clientId: number): void {
  ses.send(clientId, JSON.stringify({ type: "voo", liberado: ses.vooLiberado } satisfies ServerMessage));
}

export function broadcastVoo(ses: GameSession): void {
  ses.broadcast({ type: "voo", liberado: ses.vooLiberado });
}

