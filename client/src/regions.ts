import * as THREE from "three";
import { type NamedRegion } from "@logica/shared";

/**
 * Wireframes das regiões nomeadas (cp11) — visão do PROFESSOR (o servidor só
 * manda a lista pra ele). Também desenha as 2 marcas de canto da varinha
 * (feedback local imediato; a verdade continua no servidor, que confirma
 * cada canto via chat).
 */
export class RegionRenderer {
  private readonly group = new THREE.Group();
  private readonly cornerMarks: THREE.LineSegments[] = [];
  private boxes: THREE.LineSegments[] = [];
  /** Caixas na MESMA ordem de `boxes` — a culagem por distância precisa dos
   *  limites, e a `LineSegments` só guarda o centro. */
  private bounds: NamedRegion[] = [];
  /** Último pedido de culagem, reaplicado quando a lista troca (senão uma área
   *  criada longe nasceria visível e só sumiria na próxima varredura). */
  private culling: { px: number; pz: number; raio: number } | null = null;

  constructor(
    scene: THREE.Scene,
    /** Cor única pra TODAS as caixas (ex.: verde dos objetivos ativos).
     *  Sem ela, cada caixa ganha uma cor própria (HSL golden ratio). */
    private readonly fixedColor?: number,
  ) {
    scene.add(this.group);
    // canto 1 amarelo, canto 2 ciano — invisíveis até o primeiro clique
    for (const color of [0xffd400, 0x00e5ff]) {
      const mark = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(1.01, 1.01, 1.01)),
        new THREE.LineBasicMaterial({ color }),
      );
      mark.visible = false;
      this.group.add(mark);
      this.cornerMarks.push(mark);
    }
  }

  setCorner(corner: 1 | 2, x: number, y: number, z: number): void {
    const mark = this.cornerMarks[corner - 1];
    if (!mark) return;
    mark.position.set(x + 0.5, y + 0.5, z + 0.5);
    mark.visible = true;
  }

  clearCorners(): void {
    for (const m of this.cornerMarks) m.visible = false;
  }

  /** Substitui TODAS as caixas (o servidor sempre manda a lista completa). */
  setRegions(regions: NamedRegion[]): void {
    for (const b of this.boxes) {
      this.group.remove(b);
      b.geometry.dispose();
      (b.material as THREE.Material).dispose();
    }
    this.boxes = regions.map((r, i) => {
      const w = r.max.x - r.min.x + 1;
      const h = r.max.y - r.min.y + 1;
      const d = r.max.z - r.min.z + 1;
      const box = new THREE.LineSegments(
        // levemente maior que os blocos pra linha não "brigar" com as faces
        new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.04, h + 0.04, d + 0.04)),
        new THREE.LineBasicMaterial({
          color:
            this.fixedColor ?? new THREE.Color().setHSL((i * 0.618034) % 1, 0.9, 0.55),
        }),
      );
      box.position.set(r.min.x + w / 2, r.min.y + h / 2, r.min.z + d / 2);
      this.group.add(box);
      return box;
    });
    this.bounds = regions;
    if (this.culling) {
      const { px, pz, raio } = this.culling;
      this.cularPorDistancia(px, pz, raio);
    }
  }

  /**
   * Esconde as caixas cujo bloco mais próximo está a mais de `raio` blocos do
   * jogador em x/z. Mundo com muitos claims desenhava TODOS os wireframes,
   * inclusive os que ficam sobre coluna descarregada — linha flutuando no vazio
   * e overdraw de graça. A régua é a MESMA do descarte de coluna: chebyshev em
   * x/z (o raio de render é um QUADRADO de chunks, não um círculo), e a altura
   * fica de fora porque o streaming também não corta por y.
   *
   * Quem NÃO chama isto continua desenhando tudo — é o caso das caixas de
   * objetivo, que são alvo de navegação e precisam ser vistas de longe.
   */
  cularPorDistancia(px: number, pz: number, raio: number): void {
    this.culling = { px, pz, raio };
    for (let i = 0; i < this.boxes.length; i++) {
      const box = this.boxes[i];
      const r = this.bounds[i];
      if (!box || !r) continue;
      // `max` é bloco INCLUSIVO: a caixa vai até max+1 em coordenada de mundo
      const dx = Math.max(r.min.x - px, 0, px - (r.max.x + 1));
      const dz = Math.max(r.min.z - pz, 0, pz - (r.max.z + 1));
      box.visible = Math.max(dx, dz) <= raio;
    }
  }
}
