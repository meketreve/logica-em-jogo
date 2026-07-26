import * as THREE from "three";
import { AGUA_TOPO, type World, aguaNivel, getBlock, isAgua } from "@logica/shared";

/** Densidade da névoa submersa (FogExp2). Alta o bastante pra dar sensação de
 *  água funda, baixa o bastante pro aluno enxergar o bloco que vai quebrar. */
const FOG_DENSIDADE = 0.11;
/** Cor da névoa/tint. Mesma família do tile da água (46,108,182). */
const FOG_COR = 0x2e6cb6;

/** Efeitos de estar DENTRO da água — 100% visual, zero estado de jogo:
 *  (1) névoa exponencial na cena e (2) tint azul por cima da tela (cobre o
 *  céu, que o fog do three não pinta). O que decide "submerso" é o OLHO, não o
 *  torso — a física usa o torso (`inWater`), e é ela que manda no movimento. */
export class AguaFx {
  private readonly fog = new THREE.FogExp2(FOG_COR, FOG_DENSIDADE);
  private readonly tint: HTMLDivElement;
  private submerso = false;

  constructor(private readonly scene: THREE.Scene) {
    this.tint = document.createElement("div");
    // z-index 1 = ACIMA do canvas, ABAIXO de toda a UI (mira 5, hotbar 6,
    // controles de toque 8, chat 10, menus 20+): tingir o mundo, não a
    // interface. Dose leve — quem dá a sensação de fundo é a névoa.
    this.tint.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0;" +
      "transition:opacity .18s linear;background:rgba(38,104,170,.3)";
    document.body.appendChild(this.tint);
  }

  /** Chamar 1×/frame com a posição do OLHO (câmera). */
  update(world: World, eyeX: number, eyeY: number, eyeZ: number): void {
    const dentro = olhoNaAgua(world, eyeX, eyeY, eyeZ);
    if (dentro === this.submerso) return;
    this.submerso = dentro;
    this.scene.fog = dentro ? this.fog : null;
    this.tint.style.opacity = dentro ? "1" : "0";
  }

  /** O olho está submerso agora? (HUD/áudio podem querer saber.) */
  get estaSubmerso(): boolean {
    return this.submerso;
  }
}

/** O ponto está abaixo da SUPERFÍCIE desenhada da água? Respeita o nível: numa
 *  ponta rasa (nível 1) a lâmina é baixa e o olho fica de fora. Aproxima o topo
 *  pelo nível da própria célula (o mesher suaviza os cantos com os vizinhos —
 *  diferença de milímetros, invisível). */
export function olhoNaAgua(world: World, x: number, y: number, z: number): boolean {
  const bx = Math.floor(x);
  const by = Math.floor(y);
  const bz = Math.floor(z);
  const aqui = getBlock(world, bx, by, bz);
  if (!isAgua(aqui)) return false;
  // água em cima = coluna cheia: qualquer altura dentro da célula está submersa
  if (isAgua(getBlock(world, bx, by + 1, bz))) return true;
  return y - by < (aguaNivel(aqui) / 8) * AGUA_TOPO;
}
