import { onGameEvent } from "./events";

/**
 * Som de INTERFACE (menus, botões, notificações) — sintetizado com WebAudio,
 * zero assets externos (restrição do projeto: engine e assets próprios).
 * Som de MUNDO (blocos, passos) fica pra depois; os gatilhos já existem em
 * events.ts — aqui só a notificação de chat escuta.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let volume = 0.8;

/** AudioContext só funciona após gesto do usuário (política de autoplay). */
function ensureCtx(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new AudioContext();
      master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
    } catch {
      return null; // navegador sem WebAudio: jogo segue mudo
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setUiVolume(v: number): void {
  volume = v;
  if (master) master.gain.value = v;
}

/** Um "blip": oscilador com rampa de frequência e envelope curto. */
function blip(
  freqA: number,
  freqB: number,
  ms: number,
  type: OscillatorType,
  peak: number,
  delayMs = 0,
): void {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + delayMs / 1000;
  const t1 = t0 + ms / 1000;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freqA, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(freqB, 1), t1);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t1);
  osc.connect(gain).connect(master);
  osc.start(t0);
  osc.stop(t1 + 0.01);
}

export type UiSound = "click" | "back" | "confirm" | "notify" | "denied";

export function playUi(kind: UiSound): void {
  if (!ensureCtx()) return;
  switch (kind) {
    case "click": // botão comum: tique curto subindo
      blip(700, 980, 70, "triangle", 0.22);
      break;
    case "back": // voltar: descendo
      blip(520, 340, 90, "triangle", 0.2);
      break;
    case "confirm": // ação positiva (jogar/conectar): 2 notas subindo
      blip(660, 660, 80, "sine", 0.22);
      blip(990, 990, 110, "sine", 0.2, 85);
      break;
    case "notify": // notificação (chat): ping de 2 notas suave
      blip(880, 880, 90, "sine", 0.18);
      blip(1175, 1175, 130, "sine", 0.16, 100);
      break;
    case "denied": // recusa/erro: zumbido grave
      blip(220, 160, 180, "sawtooth", 0.15);
      break;
  }
}

/** Sem gesto do usuário (mensagem chegando da rede): só toca se o contexto
 *  JÁ existe — criar aqui violaria a política de autoplay do navegador. */
export function playUiPassive(kind: UiSound): void {
  if (!ctx) return;
  playUi(kind);
}

export function initUiAudio(initialVolume: number): void {
  setUiVolume(initialVolume);
  // qualquer primeiro clique "arma" o áudio (cobre o boot via ?server=, que pula o menu)
  window.addEventListener("pointerdown", () => void ensureCtx(), { capture: true });
  let lastConfirmAt = -Infinity;
  onGameEvent((e) => {
    if (e.kind === "objective_complete") {
      lastConfirmAt = performance.now();
      playUiPassive("confirm");
    } else if (e.kind === "chat_message") {
      // o anúncio "objetivo concluído" chega logo após o som de conquista —
      // não empilhar o ping de notificação por cima
      if (performance.now() - lastConfirmAt < 800) return;
      playUiPassive("notify");
    }
  });
}
