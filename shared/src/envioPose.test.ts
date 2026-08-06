import { describe, expect, it } from "vitest";
import { FreioDePose, IDLE_HEARTBEAT_MS, type Pose } from "./envioPose";

const pose = (p: Partial<Pose> = {}): Pose => ({ x: 1, y: 2, z: 3, yaw: 0, pitch: 0, ...p });

describe("§📡 freio do `move`", () => {
  it("a PRIMEIRA pose sai na hora (o servidor não espera 2 s pra saber onde o aluno nasceu)", () => {
    expect(new FreioDePose().aEnviar(pose(), 0)).toBe(true);
  });

  it("mudou = manda, no ritmo do tick", () => {
    const f = new FreioDePose();
    f.aEnviar(pose(), 0);
    expect(f.aEnviar(pose({ x: 1.1 }), 100)).toBe(true);
    expect(f.aEnviar(pose({ x: 1.2 }), 200)).toBe(true);
  });

  it("parado antes do heartbeat = silêncio — é ele que tira ~200 msg/s da LAN", () => {
    const f = new FreioDePose();
    f.aEnviar(pose(), 0);
    for (let t = 100; t < IDLE_HEARTBEAT_MS; t += 100) {
      expect(f.aEnviar(pose(), t)).toBe(false);
    }
  });

  it("parado NO heartbeat = manda, e o relógio reinicia dali", () => {
    const f = new FreioDePose();
    f.aEnviar(pose(), 0);
    expect(f.aEnviar(pose(), IDLE_HEARTBEAT_MS)).toBe(true);
    // a janela seguinte conta do ÚLTIMO envio, não do primeiro
    expect(f.aEnviar(pose(), IDLE_HEARTBEAT_MS + 100)).toBe(false);
    expect(f.aEnviar(pose(), IDLE_HEARTBEAT_MS * 2)).toBe(true);
  });

  it("mexer só o OLHAR conta como mudança (a cabeça do boneco remoto segue o yaw)", () => {
    const f = new FreioDePose();
    f.aEnviar(pose(), 0);
    expect(f.aEnviar(pose({ yaw: 0.01 }), 50)).toBe(true);
    f.aEnviar(pose({ yaw: 0.01 }), 60); // já registrado acima; este é silêncio
    expect(f.aEnviar(pose({ yaw: 0.01, pitch: -0.2 }), 70)).toBe(true);
  });

  it("andar e VOLTAR pro mesmo lugar reinicia o silêncio (o freio é sobre o último ENVIO)", () => {
    const f = new FreioDePose();
    f.aEnviar(pose(), 0);
    expect(f.aEnviar(pose({ x: 9 }), 500)).toBe(true);
    expect(f.aEnviar(pose(), 600)).toBe(true); // voltou: mudou de novo
    // e o heartbeat conta de 600, não de 0
    expect(f.aEnviar(pose(), 600 + IDLE_HEARTBEAT_MS - 1)).toBe(false);
    expect(f.aEnviar(pose(), 600 + IDLE_HEARTBEAT_MS)).toBe(true);
  });

  it("o registro é uma CÓPIA — mutar a pose enviada não engana o freio", () => {
    const f = new FreioDePose();
    const p = pose();
    f.aEnviar(p, 0);
    p.x = 42; // o chamador reusa o objeto do frame
    expect(f.aEnviar(pose(), 10)).toBe(false); // a pose real não mudou
  });
});
