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
  }
}
