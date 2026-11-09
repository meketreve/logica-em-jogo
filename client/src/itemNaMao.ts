import * as THREE from "three";
import { blocoExiste, isItem } from "@logica/shared";
import type { Corpo } from "./playerBody";

/**
 * §🎣 O ITEM NA MÃO (2026-11-09, decisão dele: "antes" da pesca).
 *
 * Até aqui ninguém via o que segurava: nem a própria picareta na 1ª pessoa,
 * nem a do colega. A vara de pescar precisa de um ponto de onde a linha sai,
 * e esse ponto é a PONTA do item na mão — por isso este lote veio primeiro.
 *
 * A forma é a do Minecraft, feita com o que já existe e sem asset novo:
 * - **item** (ferramenta, comida, balde…) = o PRÓPRIO ícone da hotbar num
 *   plano, com recorte (`alphaTest`) — a picareta que o aluno vê na mão é o
 *   mesmo desenho que ele escolheu na barra;
 * - **bloco** = um cubinho com o ícone do bloco nas faces.
 *
 * Os ícones já são desenhados no `blockIcons.ts` pra hotbar (data URLs); aqui
 * só viram textura, com cache por id. Nada passa pelo servidor além do id que
 * o cliente já manda (`mao`) e que o servidor agora repassa (`mao_de`).
 */

const cacheTextura = new Map<number, THREE.Texture>();

function texturaDe(id: number, icons: ReadonlyMap<number, string>): THREE.Texture | null {
  const pronta = cacheTextura.get(id);
  if (pronta) return pronta;
  const url = icons.get(id);
  if (!url) return null;
  const img = new Image();
  const tex = new THREE.Texture(img);
  img.onload = () => {
    tex.needsUpdate = true;
  };
  img.src = url;
  tex.magFilter = THREE.NearestFilter; // pixel do ícone, não borrão
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  cacheTextura.set(id, tex);
  return tex;
}

/** Onde, no plano do ícone (0..1, y pra BAIXO como no canvas), fica o CABO —
 *  o ponto que a mão segura. Os ícones de ferramenta são desenhados em
 *  diagonal, cabo embaixo à esquerda. */
const CABO = { x: 0.2, y: 0.82 } as const;

/** Onde fica a PONTA (de onde a linha da vara sai), mesmo referencial. */
export const PONTA_DO_ICONE = { x: 0.8, y: 0.14 } as const;

export interface ModeloNaMao {
  readonly id: number;
  readonly objeto: THREE.Object3D;
  /** O ponto da ponta do item, em coordenadas LOCAIS do `objeto`. */
  readonly ponta: THREE.Vector3;
  descartar(): void;
}

/**
 * O modelo de um id: plano (item) ou cubinho (bloco), com lado 1 — quem
 * prende decide a escala. A origem do objeto é o CABO (item) ou o centro
 * (bloco), pra quem prende só posicionar a mão.
 */
export function criarModeloNaMao(
  id: number,
  icons: ReadonlyMap<number, string>,
  opcoes: { sobreTudo?: boolean } = {},
): ModeloNaMao | null {
  if (!isItem(id) && !blocoExiste(id)) return null;
  const tex = texturaDe(id, icons);
  if (!tex) return null;
  const sobreTudo = opcoes.sobreTudo === true;
  const ehBloco = !isItem(id);
  const material = new THREE.MeshLambertMaterial({
    map: tex,
    alphaTest: 0.5,
    side: ehBloco ? THREE.FrontSide : THREE.DoubleSide,
    // 1ª pessoa: desenhado por cima do mundo (não entra na parede encostada).
    // Cubo convexo com face de trás descartada dispensa o teste de fundo.
    depthTest: !sobreTudo,
    depthWrite: !sobreTudo,
  });
  const geo = ehBloco ? new THREE.BoxGeometry(1, 1, 1) : new THREE.PlaneGeometry(1, 1);
  const mesh = new THREE.Mesh(geo, material);
  if (sobreTudo) mesh.renderOrder = 1000;
  const objeto = new THREE.Group();
  objeto.add(mesh);
  const ponta = new THREE.Vector3();
  if (!ehBloco) {
    // o plano centrado em (0,0); o cabo vai pra origem do grupo
    mesh.position.set(0.5 - CABO.x, CABO.y - 0.5, 0);
    ponta.set(PONTA_DO_ICONE.x - CABO.x, CABO.y - PONTA_DO_ICONE.y, 0);
  } else {
    ponta.set(0, 0.5, 0);
  }
  objeto.name = `mao:${id}`;
  return {
    id,
    objeto,
    ponta,
    descartar() {
      objeto.removeFromParent();
      geo.dispose();
      material.dispose(); // a textura é do cache — fica
    },
  };
}

/**
 * Um "encaixe" de mão: guarda o modelo atual e troca quando o id muda. É o
 * mesmo objeto pra 1ª pessoa, pro próprio corpo em 3ª e pra cada colega.
 */
export class EncaixeDaMao {
  private atual: ModeloNaMao | null = null;

  constructor(
    readonly pai: THREE.Object3D,
    private readonly icons: ReadonlyMap<number, string>,
    private readonly ajustar: (m: ModeloNaMao, ehBloco: boolean) => void,
    private readonly sobreTudo = false,
  ) {}

  get id(): number | null {
    return this.atual?.id ?? null;
  }

  get modelo(): ModeloNaMao | null {
    return this.atual;
  }

  definir(id: number | null): void {
    if ((this.atual?.id ?? null) === id) return;
    this.atual?.descartar();
    this.atual = null;
    if (id === null) return;
    const m = criarModeloNaMao(id, this.icons, { sobreTudo: this.sobreTudo });
    if (!m) return;
    this.ajustar(m, !isItem(id));
    this.pai.add(m.objeto);
    this.atual = m;
  }

  /** A ponta do item em coordenadas do MUNDO (null = mão vazia). */
  pontaNoMundo(alvo = new THREE.Vector3()): THREE.Vector3 | null {
    if (!this.atual) return null;
    this.atual.objeto.updateWorldMatrix(true, false);
    return alvo.copy(this.atual.ponta).applyMatrix4(this.atual.objeto.matrixWorld);
  }

  descartar(): void {
    this.atual?.descartar();
    this.atual = null;
  }
}

/** Altura do braço (do ombro à mão) — espelho do `TRONCO_ALTURA` do corpo. */
const BRACO = 0.7;

/**
 * Prende o encaixe no braço DIREITO (`bracoB`) de um corpo. O plano do ícone
 * fica de lado (normal em +x), com o "pra direita" do ícone apontando pra
 * FRENTE (−z, pra onde o corpo olha) — então a ponta da picareta vai à frente,
 * como no Minecraft.
 */
export function encaixeNoBraco(corpo: Corpo, icons: ReadonlyMap<number, string>): EncaixeDaMao {
  return new EncaixeDaMao(corpo.bracoB, icons, (m, ehBloco) => {
    if (ehBloco) {
      m.objeto.scale.setScalar(0.24);
      m.objeto.position.set(0, -BRACO + 0.02, -0.16);
      return;
    }
    m.objeto.scale.setScalar(0.7);
    m.objeto.position.set(0.02, -BRACO + 0.06, -0.04);
    // ícone em XY (normal +z) → gira pra normal ~+x: o +x do ícone vira −z
    // (a ponta pra frente). Os 0,6 rad a menos viram o plano um pouco pra
    // TRÁS: de lado puro ele fica de fio pra câmera da 3ª pessoa (atrás).
    m.objeto.rotation.set(0, Math.PI / 2 - 0.6, 0);
  });
}

/**
 * O encaixe da 1ª PESSOA: preso na câmera, no canto de baixo à direita, por
 * cima do mundo. O ícone é ESPELHADO (a ponta vai pro meio da tela), que é o
 * jeito que o Minecraft mostra a ferramenta na mão direita.
 */
export function encaixeNaCamera(camera: THREE.Camera, icons: ReadonlyMap<number, string>): EncaixeDaMao {
  // jogo novo (volta ao menu e entra de novo) não empilha uma 2ª mão
  camera.getObjectByName("mao-1a-pessoa")?.removeFromParent();
  const base = new THREE.Group();
  base.name = "mao-1a-pessoa";
  base.position.set(0.34, -0.3, -0.62);
  camera.add(base);
  return new EncaixeDaMao(
    base,
    icons,
    (m, ehBloco) => {
      if (ehBloco) {
        m.objeto.scale.setScalar(0.18);
        m.objeto.position.set(0.02, 0.02, 0);
        m.objeto.rotation.set(0.35, -0.6, 0);
        return;
      }
      m.objeto.scale.set(-0.3, 0.3, 0.3); // espelhado: a ponta pro centro
      m.objeto.rotation.set(-0.15, -0.35, 0.1);
    },
    true,
  );
}

/**
 * O balanço da mão na 1ª pessoa (bater/colocar/usar): meia senoide curta. É
 * só tela — o que vale é o clique que já foi pro servidor.
 */
export class BalancoDaMao {
  private t = -1;
  private static readonly DURACAO = 0.25;

  disparar(): void {
    this.t = 0;
  }

  get ativo(): boolean {
    return this.t >= 0;
  }

  /** Avança e devolve o ângulo (rad) a somar no pitch da mão. */
  passo(dt: number): number {
    if (this.t < 0) return 0;
    this.t += dt;
    if (this.t >= BalancoDaMao.DURACAO) {
      this.t = -1;
      return 0;
    }
    return -0.9 * Math.sin((Math.PI * this.t) / BalancoDaMao.DURACAO);
  }
}
