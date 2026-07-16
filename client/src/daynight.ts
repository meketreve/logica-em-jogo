import * as THREE from "three";
import { DIA_SEGUNDOS } from "@logica/shared";

/**
 * Ciclo dia/noite (cp21) — SÓ visual. A hora é autoritativa do SERVIDOR (msg
 * `time`, 1×/s): o cliente guarda a última hora recebida e, se o ciclo está
 * ativo, avança localmente entre as sincronizações para o céu não andar aos
 * trancos. A cada `time` do servidor, corrige (o drift de 1 s num ciclo de 10
 * min é imperceptível). Nunca escurece 100%: de noite o aluno ainda constrói.
 */

interface Keyframe {
  hora: number;
  ceu: THREE.Color;
  sol: THREE.Color;
  solInt: number;
  ambInt: number;
}

/** Cores em hex sRGB (THREE.Color já converte pro espaço de trabalho). */
const kf = (hora: number, ceu: number, sol: number, solInt: number, ambInt: number): Keyframe => ({
  hora,
  ceu: new THREE.Color(ceu),
  sol: new THREE.Color(sol),
  solInt,
  ambInt,
});

// Quadros ao longo do dia. A lista fecha o laço: 24h == 0h (mesmo estado noturno).
const KEYFRAMES: readonly Keyframe[] = [
  kf(0, 0x05060f, 0x37427a, 0.15, 0.28), // meia-noite — azul quase preto, "luar"
  kf(5, 0x0b1330, 0x45589a, 0.2, 0.3), // fim da madrugada
  kf(6.5, 0xdf8a4c, 0xffca8c, 1.1, 0.44), // amanhecer alaranjado
  kf(8, 0x86bce8, 0xfff1d6, 2.0, 0.5), // manhã clara
  kf(12, 0x87ceeb, 0xffffff, 2.4, 0.55), // meio-dia (céu original do jogo)
  kf(16, 0x86bce8, 0xfff1d6, 2.1, 0.5), // tarde
  kf(18, 0xe0794a, 0xff9a5c, 1.1, 0.43), // entardecer alaranjado
  kf(20, 0x141a3c, 0x37427a, 0.2, 0.3), // anoitecer
  kf(24, 0x05060f, 0x37427a, 0.15, 0.28), // volta à meia-noite
];

const scratchCeu = new THREE.Color();
const scratchSol = new THREE.Color();

export class SkyCycle {
  private hora = 12;
  private ciclo = false;

  constructor(
    private readonly sun: THREE.DirectionalLight,
    private readonly ambient: THREE.AmbientLight,
    private readonly scene: THREE.Scene,
  ) {}

  /** Sincroniza com a hora autoritativa do servidor. */
  sync(hora: number, ciclo: boolean): void {
    if (Number.isFinite(hora)) this.hora = ((hora % 24) + 24) % 24;
    this.ciclo = ciclo;
  }

  /** Um frame: avança o relógio local (se o ciclo roda) e pinta o céu. */
  update(dt: number): void {
    if (this.ciclo) this.hora = (this.hora + (dt * 24) / DIA_SEGUNDOS) % 24;
    this.apply();
  }

  private apply(): void {
    const h = this.hora;
    // acha o par de keyframes que cerca a hora atual
    let a = KEYFRAMES[0]!;
    let b = KEYFRAMES[KEYFRAMES.length - 1]!;
    for (let i = 0; i < KEYFRAMES.length - 1; i++) {
      if (h >= KEYFRAMES[i]!.hora && h <= KEYFRAMES[i + 1]!.hora) {
        a = KEYFRAMES[i]!;
        b = KEYFRAMES[i + 1]!;
        break;
      }
    }
    const span = b.hora - a.hora || 1;
    const t = Math.min(Math.max((h - a.hora) / span, 0), 1);

    scratchCeu.copy(a.ceu).lerp(b.ceu, t);
    (this.scene.background as THREE.Color).copy(scratchCeu);

    scratchSol.copy(a.sol).lerp(b.sol, t);
    this.sun.color.copy(scratchSol);
    this.sun.intensity = a.solInt + (b.solInt - a.solInt) * t;
    this.ambient.intensity = a.ambInt + (b.ambInt - a.ambInt) * t;

    // arco do sol: 6h nasce no leste, 12h no zênite, 18h se põe no oeste.
    // De noite fica abaixo do horizonte (luz fraca vinda de baixo/lado = "luar").
    const ang = ((h - 6) / 12) * Math.PI;
    this.sun.position.set(
      Math.cos(ang) * 100,
      Math.max(Math.sin(ang) * 100, -40),
      40,
    );
  }
}
