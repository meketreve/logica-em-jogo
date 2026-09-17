import * as THREE from "three";

/**
 * §🔨 Ferramentas v2 — a RACHADURA no bloco que está sendo quebrado.
 *
 * Escolha do usuário entre "anel na mira" e "rachadura no bloco": rachadura. O
 * desenho é o do Minecraft — a trinca cresce por ESTÁGIOS sobre a face do bloco
 * mirado — e ela mora numa caixa própria por cima do contorno da mira, não no
 * mesher: a malha do chunk é remontada por WORKER, e sujá-la a cada frame de
 * quebra custaria muito mais do que um cubo transparente.
 *
 * A textura é PROCEDURAL, como o atlas do mundo: o projeto não usa asset de
 * fora, e uma trinca é ruído dirigido — nada que precise de arquivo.
 */

/** Quantos estágios a trinca tem (a régua do Minecraft; 10 é o bastante). */
const ESTAGIOS = 10;
const LADO = 32; // px da textura de cada estágio

/** PRNG fixo: a MESMA trinca todo dia, em toda máquina. */
function prng(semente: number): () => number {
  let s = semente >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/**
 * Desenha os `ESTÁGIOS` de trinca, cada um ACUMULANDO o anterior: quem olha vê
 * a rachadura crescer, não trocar de desenho a cada passo.
 *
 * ⚠️ A 1ª versão (sonda de 2026-09-17) saiu um BORRÃO: riscos grossos e todos
 * nascendo no meio da face viraram uma aranha preta no estágio 4 de 10. O
 * desenho certo é o do Minecraft — fendas FINAS que partem do centro e correm
 * até a borda, ganhando galhos: a face continua legível embaixo, e o que cresce
 * é a quantidade de fenda, não o tamanho da mancha.
 */
function texturas(): THREE.Texture[] {
  const out: THREE.Texture[] = [];
  const r = prng(20260917);
  /** Uma fenda: linha quebrada do centro até a borda, com tortas no caminho. */
  const fenda = (angulo: number): { x: number; y: number }[] => {
    const pts = [{ x: LADO / 2, y: LADO / 2 }];
    let a = angulo;
    let { x, y } = pts[0] as { x: number; y: number };
    for (let i = 0; i < 5; i++) {
      a += (r() - 0.5) * 0.9; // a fenda torce, não é reta
      x += Math.cos(a) * (LADO / 9);
      y += Math.sin(a) * (LADO / 9);
      pts.push({ x, y });
    }
    return pts;
  };
  // uma fenda nova por estágio, em direções espalhadas (o passo de ~2,4 rad
  // evita duas vizinhas caindo juntas e virando mancha)
  const fendas: { x: number; y: number }[][] = [];
  for (let e = 0; e < ESTAGIOS; e++) {
    fendas.push(fenda(e * 2.4 + r() * 0.6));
    const cv = document.createElement("canvas");
    cv.width = LADO;
    cv.height = LADO;
    const g = cv.getContext("2d");
    if (g) {
      g.clearRect(0, 0, LADO, LADO);
      g.strokeStyle = "rgba(0,0,0,0.7)";
      g.lineWidth = 1;
      g.lineJoin = "round";
      g.lineCap = "round";
      for (const pts of fendas) {
        g.beginPath();
        const p0 = pts[0] as { x: number; y: number };
        g.moveTo(p0.x, p0.y);
        for (const p of pts.slice(1)) g.lineTo(p.x, p.y);
        g.stroke();
      }
    }
    // ⚠️ um canvas POR estágio: a `CanvasTexture` guarda a referência, então
    // reusar o mesmo canvas faria os 10 estágios mostrarem o último desenho.
    const t = new THREE.CanvasTexture(cv);
    // NEAREST: a trinca é pixel art, como o resto do mundo — suavizar borraria
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.needsUpdate = true;
    out.push(t);
  }
  return out;
}

/**
 * A caixa da trinca. Uma só, reposicionada — quem quebra, quebra um bloco por
 * vez, e criar geometria por frame seria lixo pro coletor a 60 fps.
 */
export class QuebraFx {
  private readonly mesh: THREE.Mesh;
  private readonly mats: THREE.MeshBasicMaterial[];

  constructor(scene: THREE.Scene) {
    this.mats = texturas().map(
      (map) =>
        new THREE.MeshBasicMaterial({
          map,
          transparent: true,
          // não escreve profundidade e desenha por último: a trinca fica por
          // cima da face sem brigar com ela (z-fighting)
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -4,
        }),
    );
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), this.mats[0]);
    this.mesh.renderOrder = 3;
    this.mesh.visible = false;
    scene.add(this.mesh);
  }

  /** A trinca está na tela AGORA, e em que estágio? (sonda do headless) */
  get estado(): { visivel: boolean; estagio: number } {
    return {
      visivel: this.mesh.visible,
      estagio: this.mats.indexOf(this.mesh.material as THREE.MeshBasicMaterial),
    };
  }

  /**
   * Mostra a trinca na célula, no estágio de `progresso` (0..1). `null` (ou
   * progresso ≤ 0) esconde — é o que o soltar do botão chama.
   */
  atualizar(
    cel: { x: number; y: number; z: number } | null,
    progresso: number,
    caixa: readonly [number, number, number, number, number, number] = [0, 0, 0, 1, 1, 1],
  ): void {
    if (!cel || progresso <= 0) {
      this.mesh.visible = false;
      return;
    }
    const [x0, y0, z0, x1, y1, z1] = caixa;
    const passo = Math.min(ESTAGIOS - 1, Math.floor(progresso * ESTAGIOS));
    this.mesh.material = this.mats[passo] as THREE.Material;
    this.mesh.position.set(
      cel.x + (x0 + x1) / 2,
      cel.y + (y0 + y1) / 2,
      cel.z + (z0 + z1) / 2,
    );
    // 1,5% maior que o bloco: a trinca tem de aparecer INTEIRA sobre a face
    this.mesh.scale.set((x1 - x0) * 1.015, (y1 - y0) * 1.015, (z1 - z0) * 1.015);
    this.mesh.visible = true;
  }
}
