import * as THREE from "three";
import { PLAYER } from "@logica/shared";

interface RemotePlayer {
  mesh: THREE.Mesh;
  target: THREE.Vector3;
  targetYaw: number;
  /** Plaquinha de nome sobre a cabeça (filha da mesh; Sprite sempre encara a câmera). */
  label?: THREE.Sprite;
  labelName?: string;
  /** Deitado na cama (2026-08-17)? A caixa tomba e desce até a altura da cama. */
  dormindo?: boolean;
}

/**
 * Os OUTROS jogadores na tela: caixa colorida por id, plaquinha de nome e o
 * LERP que tira o serrilhado.
 *
 * O lerp existe por reclamação de playtest: as posições chegam a **10 Hz** e,
 * desenhadas cruas, o colega anda aos pulos. O fator é exponencial
 * (`1 - e^(-dt·12)`), então a suavização independe do FPS — a mesma sensação
 * no notebook do laboratório e no tablet.
 *
 * Isso importa além do visual: a **mira do pvp** tem de medir contra a posição
 * do LERP, que é a que o aluno vê. Usar o `target` cru do servidor faria a mira
 * piscar 10×/s em cima de um alvo que na tela está em outro lugar. Por isso
 * `alvosParaMira()` mora aqui e não no chamador.
 */
export class RemotePlayersView {
  private readonly players = new Map<number, RemotePlayer>();

  constructor(private readonly scene: THREE.Scene) {}

  /**
   * Plaquinha desenhada num canvas (zero assets, mesma regra do atlas): texto
   * branco sobre fundo escuro translúcido, visível ATRAVÉS de parede — é a
   * convenção do Minecraft, e é o que faz o professor achar o aluno atrás do
   * bloco.
   */
  private static fazerPlaca(name: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const font = "bold 32px sans-serif";
    ctx.font = font;
    const pad = 10;
    canvas.width = Math.ceil(ctx.measureText(name).width) + pad * 2;
    canvas.height = 44;
    ctx.font = font; // redimensionar o canvas reseta o contexto
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter; // canvas não-potência-de-2: sem mipmap
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }),
    );
    sprite.renderOrder = 999; // depois do mundo — depthTest off não briga com nada
    const h = 0.32; // altura no mundo; largura segue a proporção do texto
    sprite.scale.set((h * canvas.width) / canvas.height, h, 1);
    sprite.position.set(0, PLAYER.height / 2 + 0.35, 0); // acima da caixa
    return sprite;
  }

  private static soltarPlaca(rp: RemotePlayer): void {
    if (!rp.label) return;
    rp.label.material.map?.dispose();
    rp.label.material.dispose();
    rp.mesh.remove(rp.label);
    rp.label = undefined;
  }

  aoMover(msg: {
    id: number;
    x: number;
    y: number;
    z: number;
    yaw: number;
    name?: string;
    dormindo?: boolean;
    cama?: { x: number; y: number; z: number };
  }): void {
    let rp = this.players.get(msg.id);
    if (!rp) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(PLAYER.width, PLAYER.height, PLAYER.width),
        new THREE.MeshLambertMaterial({
          color: new THREE.Color().setHSL((msg.id * 0.618034) % 1, 0.7, 0.5),
        }),
      );
      // primeira vez: aparece JÁ no lugar (sem deslizar desde a origem)
      mesh.position.set(msg.x, msg.y + PLAYER.height / 2, msg.z);
      mesh.rotation.y = msg.yaw;
      this.scene.add(mesh);
      rp = { mesh, target: mesh.position.clone(), targetYaw: msg.yaw };
      this.players.set(msg.id, rp);
    }
    // nome viaja no player_moved (ausente = host antigo, caixa fica sem nome)
    if (msg.name && msg.name !== rp.labelName) {
      RemotePlayersView.soltarPlaca(rp);
      rp.label = RemotePlayersView.fazerPlaca(msg.name);
      rp.labelName = msg.name;
      rp.mesh.add(rp.label);
    }
    // deitado (2026-08-17): a caixa TOMBA e o centro desce, porque o corpo
    // deitado ocupa `width` de altura, não `height`.
    // ⚠️ E vai para a CAMA, não para `msg.x/y/z`: o servidor NÃO move quem
    // dorme, então esses são os pés dele EM PÉ, ao lado da cama. Sem isto o
    // colega deita no chão do lado (relato do playtest, bug-627). O `+1` põe o
    // corpo em cima da célula da cama, não dentro dela.
    rp.dormindo = msg.dormindo === true && msg.cama !== undefined;
    if (rp.dormindo && msg.cama) {
      rp.target.set(msg.cama.x + 0.5, msg.cama.y + 1 + PLAYER.width / 2, msg.cama.z + 0.5);
    } else {
      // pos do servidor = pés do jogador; BoxGeometry é centrada
      rp.target.set(msg.x, msg.y + PLAYER.height / 2, msg.z);
    }
    rp.targetYaw = msg.yaw;
  }

  aoSair(id: number): void {
    const rp = this.players.get(id);
    if (!rp) return;
    RemotePlayersView.soltarPlaca(rp);
    this.scene.remove(rp.mesh);
    rp.mesh.geometry.dispose();
    (rp.mesh.material as THREE.Material).dispose();
    this.players.delete(id);
  }

  /** Desliza todo mundo até o último update. `dt` em segundos. */
  interpolar(dt: number): void {
    // fator exponencial = independente do FPS (~90% do caminho em ~190 ms)
    const k = 1 - Math.exp(-dt * 12);
    for (const rp of this.players.values()) {
      rp.mesh.position.lerp(rp.target, k);
      const dyaw = rp.targetYaw - rp.mesh.rotation.y;
      rp.mesh.rotation.y += Math.atan2(Math.sin(dyaw), Math.cos(dyaw)) * k;
      // tombar/levantar também desliza — deitar de estalo destoaria do resto,
      // que é todo interpolado. `rotation.x` é local, então a caixa tomba PARA
      // ONDE ela olha, seja qual for o yaw.
      const alvoTomba = rp.dormindo ? -Math.PI / 2 : 0;
      rp.mesh.rotation.x += (alvoTomba - rp.mesh.rotation.x) * k;
      // ⚠️ A plaquinha é FILHA da mesh, então a posição dela passa pela rotação
      // do pai. Com a caixa tombada -90° em X, o local +y vira -z no mundo e o
      // nome iria parar NA FRENTE do corpo. O offset que mapeia para o +y do
      // mundo, tombado, é o local +z — daí a troca de eixo.
      if (rp.label) {
        const h = 0.35 + (rp.dormindo ? PLAYER.width : PLAYER.height) / 2;
        if (rp.dormindo) rp.label.position.set(0, 0, h);
        else rp.label.position.set(0, h, 0);
      }
    }
  }

  /** Alvos pro `raycastJogador` — na posição do LERP, que é a que o aluno vê. */
  alvosParaMira(): { id: number; x: number; y: number; z: number }[] {
    return [...this.players].map(([id, rp]) => ({
      id,
      x: rp.mesh.position.x,
      y: rp.mesh.position.y - PLAYER.height / 2, // mesh é centrada; a caixa quer os PÉS
      z: rp.mesh.position.z,
    }));
  }
}
