/**
 * Guarda contra atalhos do navegador com o jogo no controle (backlog
 * 2026-07-19): correr é Ctrl (sprint) + W (frente) — no navegador esse combo
 * FECHA A ABA. Três camadas, da mais universal pra mais específica:
 *
 *  1. beforeunload enquanto o jogo roda — fechar/recarregar a aba abre o
 *     diálogo "sair do site?" do navegador. Única defesa possível em janela
 *     comum: Ctrl+W/T/N/R são atalhos RESERVADOS (preventDefault não alcança).
 *  2. preventDefault nos combos que o navegador DEIXA interceptar, enquanto o
 *     jogo tem o controle: qualquer Ctrl/Meta/Alt+tecla (Ctrl+S salvar,
 *     Ctrl+P imprimir, Ctrl+F buscar, Ctrl+D favorito…), Tab (foco vaza pra
 *     UI do navegador) e F1/F5/F6/F7/F10/F12. As teclas do JOGO não sofrem:
 *     preventDefault não esconde o keydown do Input (listeners separados).
 *  3. Keyboard Lock API (Chrome/Edge, SÓ age em tela cheia): com o lock
 *     armado, Ctrl+W/T/N/R e Ctrl+F4 chegam como keydown comuns e a camada 2
 *     segura. Esc fica FORA do lock de propósito — continua saindo do pointer
 *     lock (menu de pausa). Em tela cheia (F11) o aluno fica 100% protegido.
 */

/** Keyboard Lock API — fora do lib.dom (não padronizada; Chrome/Edge). */
interface KeyboardLockApi {
  lock?: (codes?: string[]) => Promise<void>;
  unlock?: () => void;
}

/** Predicado "o jogo tem o controle" (pointer lock ou toque); null = desarmada. */
let emJogo: (() => boolean) | null = null;

function onBeforeUnload(e: BeforeUnloadEvent): void {
  e.preventDefault();
  // Chrome antigo só mostra o diálogo com returnValue setado
  e.returnValue = "";
}

/** F-teclas do NAVEGADOR (ajuda/reload/foco/caret/menu/devtools). F3 é do jogo (HUD). */
const FKEYS_DO_NAVEGADOR = new Set(["F1", "F5", "F6", "F7", "F10", "F12"]);

function onKeydownCapture(e: KeyboardEvent): void {
  if (!emJogo?.()) return;
  // digitando (chat no toque): tecla é do campo, não intercepta
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
  if (e.ctrlKey || e.metaKey || e.altKey || e.code === "Tab" || FKEYS_DO_NAVEGADOR.has(e.code)) {
    e.preventDefault();
  }
}

function onKeyupCapture(e: KeyboardEvent): void {
  // Firefox/Windows: Alt SOLTO foca a barra de menu no keyup
  if (emJogo?.() && e.code.startsWith("Alt")) e.preventDefault();
}

/** Arma as 3 camadas no início do jogo. `ativo` = "o jogo tem o controle". */
export function armarGuardaDeAtalhos(ativo: () => boolean): void {
  if (emJogo) return; // já armada (troca de aula re-chama startGame? não — idempotente por via das dúvidas)
  emJogo = ativo;
  window.addEventListener("beforeunload", onBeforeUnload);
  window.addEventListener("keydown", onKeydownCapture, true);
  window.addEventListener("keyup", onKeyupCapture, true);
  const kb = (navigator as { keyboard?: KeyboardLockApi }).keyboard;
  void kb?.lock?.(["KeyW", "KeyT", "KeyN", "KeyR", "F4"])?.catch(() => {
    // sem suporte/sem permissão: as camadas 1 e 2 continuam valendo
  });
}

/** Desarma antes de navegação LEGÍTIMA (sair pro menu, kick) — senão o
 *  beforeunload pergunta "sair do site?" pra uma saída que o jogo pediu. */
export function desarmarGuardaDeAtalhos(): void {
  emJogo = null;
  window.removeEventListener("beforeunload", onBeforeUnload);
  window.removeEventListener("keydown", onKeydownCapture, true);
  window.removeEventListener("keyup", onKeyupCapture, true);
  (navigator as { keyboard?: KeyboardLockApi }).keyboard?.unlock?.();
}
