import * as THREE from "three";
import {
  BlockId,
  PLAYER,
  PLAYER_REACH,
  type RayHit,
  SERVER_TICK_RATE,
  type Snapshot,
  createPlayer,
  decodeSnapshot,
  findSpawnY,
  parseServerMessage,
  raycastBlock,
  setBlock,
  stepPlayer,
} from "@logica/shared";
import { createAtlasTexture } from "./atlasTexture";
import { ChunkRenderer } from "./chunks";
import { type Connection, WorkerConnection, WsConnection } from "./connection";
import { Hud } from "./hud";
import { Input } from "./input";

/**
 * Checkpoint 5: segundo cliente (LAN). `?server=ws://host:8080` na URL conecta
 * no hospedeiro Node+ws; sem parâmetro = Web Worker local (singleplayer).
 * Mesma interface Connection, mesmas mensagens — o jogo não sabe qual é.
 * Outros jogadores chegam como player_moved e viram caixa colorida.
 */

// --- Render (independente do mundo) ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  512,
);
camera.rotation.order = "YXZ"; // yaw depois pitch (câmera FPS)

const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(60, 100, 40);
scene.add(sun, new THREE.AmbientLight(0xffffff, 0.55));

const input = new Input(renderer.domElement);

const overlay = document.getElementById("overlay");
document.addEventListener("pointerlockchange", () => {
  overlay?.classList.toggle("hidden", input.locked);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Conexão com o servidor ---
// ?server=ws://host:8080 → hospedeiro Node+ws (LAN); sem parâmetro → Web Worker.
const serverUrl = new URLSearchParams(location.search).get("server");
const conn: Connection = serverUrl
  ? new WsConnection(serverUrl)
  : new WorkerConnection(
      new Worker(new URL("../../server/src/worker.ts", import.meta.url), {
        type: "module",
      }),
    );

let debugStats = { tickAvgMs: 0, tickMaxMs: 0 };
let started = false;
let applyBlockChanged:
  | ((msg: { x: number; y: number; z: number; blockId: number }) => void)
  | null = null;
let applyPlayerMoved:
  | ((msg: { id: number; x: number; y: number; z: number; yaw: number }) => void)
  | null = null;
let applyPlayerLeft: ((id: number) => void) | null = null;

conn.onMessage((data) => {
  if (typeof data === "string") {
    const msg = parseServerMessage(data);
    if (!msg) return;
    if (msg.type === "debug_stats") {
      debugStats = { tickAvgMs: msg.tickAvgMs, tickMaxMs: msg.tickMaxMs };
    } else if (msg.type === "block_changed") {
      applyBlockChanged?.(msg);
    } else if (msg.type === "player_moved") {
      applyPlayerMoved?.(msg);
    } else if (msg.type === "player_left") {
      applyPlayerLeft?.(msg.id);
    }
    return;
  }
  if (started) return; // snapshot é único por sessão
  started = true;
  startGame(decodeSnapshot(data));
});

conn.send(JSON.stringify({ type: "join", name: "jogador" }));

// --- Jogo (só começa quando o snapshot chega do servidor) ---
function startGame(snap: Snapshot): void {
  const world = snap.world;
  const material = new THREE.MeshLambertMaterial({ map: createAtlasTexture() });
  const chunkRenderer = new ChunkRenderer(world, material, scene);
  chunkRenderer.buildAll();

  const spawnX = world.sizeX / 2 + 0.5;
  const spawnZ = world.sizeZ / 2 + 0.5;
  const spawnY = findSpawnY(world, Math.floor(spawnX), Math.floor(spawnZ));
  const player = createPlayer(spawnX, spawnY, spawnZ);

  function respawn(): void {
    player.pos.x = spawnX;
    player.pos.y = spawnY;
    player.pos.z = spawnZ;
    player.vel.x = player.vel.y = player.vel.z = 0;
  }

  // servidor mandou block_changed (nossa ação OU de outro jogador OU gravidade
  // — cliente não distingue): aplica na cópia local e remesh
  applyBlockChanged = (msg) => {
    setBlock(world, msg.x, msg.y, msg.z, msg.blockId);
    chunkRenderer.remeshBlock(msg.x, msg.y, msg.z);
  };

  // --- Outros jogadores: caixa colorida por id (lerp SÓ se serrilhar — gatilho) ---
  const remotePlayers = new Map<number, THREE.Mesh>();
  applyPlayerMoved = (msg) => {
    let mesh = remotePlayers.get(msg.id);
    if (!mesh) {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(PLAYER.width, PLAYER.height, PLAYER.width),
        new THREE.MeshLambertMaterial({
          color: new THREE.Color().setHSL((msg.id * 0.618034) % 1, 0.7, 0.5),
        }),
      );
      scene.add(mesh);
      remotePlayers.set(msg.id, mesh);
    }
    // pos do servidor = pés do jogador; BoxGeometry é centrada
    mesh.position.set(msg.x, msg.y + PLAYER.height / 2, msg.z);
    mesh.rotation.y = msg.yaw;
  };
  applyPlayerLeft = (id) => {
    const mesh = remotePlayers.get(id);
    if (!mesh) return;
    scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
    remotePlayers.delete(id);
  };

  // --- Mira + colocar/quebrar ---
  const highlight = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1.002, 1.002, 1.002)),
    new THREE.LineBasicMaterial({ color: 0x000000 }),
  );
  highlight.visible = false;
  scene.add(highlight);
  let target: RayHit | null = null;
  const lookDir = new THREE.Vector3();

  const PLACEABLE = [
    { id: BlockId.Grass, name: "grama" },
    { id: BlockId.Stone, name: "pedra" },
    { id: BlockId.Cobblestone, name: "pedregulho" },
    { id: BlockId.Sand, name: "areia" },
  ] as const;
  let selected = 0;
  const hotbarEl = document.getElementById("hotbar");
  const refreshHotbar = (): void => {
    if (!hotbarEl) return;
    hotbarEl.innerHTML = PLACEABLE.map((b, i) =>
      i === selected ? `<b>[${i + 1} ${b.name}]</b>` : ` ${i + 1} ${b.name} `,
    ).join(" ");
  };
  refreshHotbar();
  PLACEABLE.forEach((_, i) => {
    input.onKey(`Digit${i + 1}`, () => {
      selected = i;
      refreshHotbar();
    });
  });

  input.onMouseButton(0, () => {
    if (!target) return;
    conn.send(
      JSON.stringify({ type: "break_block", x: target.x, y: target.y, z: target.z }),
    );
  });
  input.onMouseButton(2, () => {
    if (!target) return;
    const block = PLACEABLE[selected];
    if (!block) return;
    conn.send(
      JSON.stringify({
        type: "place_block",
        x: target.x + target.nx,
        y: target.y + target.ny,
        z: target.z + target.nz,
        blockId: block.id,
      }),
    );
  });

  const hud = new Hud(renderer, {
    checkpoint: 5,
    worldChunks: world.dims,
    worldSeed: snap.seed,
    serverHost: serverUrl ?? "web-worker",
  });
  hud.setRemesh({
    count: chunkRenderer.remeshCount,
    totalMs: chunkRenderer.remeshMsTotal,
    lastMs: chunkRenderer.lastRemeshMs,
  });
  input.onKey("F3", () => hud.toggle());
  hud.extra = () => {
    const m = input.mouseStats;
    return `mouse Δmáx ${m.maxDelta}px  descartados ${m.dropped} (último ${m.lastDropped}px)`;
  };

  // move 10×/s pro servidor (mesmo ritmo do tick) — prova o canal de subida
  setInterval(() => {
    conn.send(
      JSON.stringify({
        type: "move",
        x: player.pos.x,
        y: player.pos.y,
        z: player.pos.z,
        yaw: input.yaw,
        pitch: input.pitch,
      }),
    );
  }, 1000 / SERVER_TICK_RATE);

  // HUD de rede: taxa por segundo (entrada+saída) + duração do tick do servidor
  let lastNet = { ...conn.stats };
  setInterval(() => {
    const s = conn.stats;
    hud.net = {
      msgsPerSec: s.msgsIn + s.msgsOut - (lastNet.msgsIn + lastNet.msgsOut),
      bytesPerSec: s.bytesIn + s.bytesOut - (lastNet.bytesIn + lastNet.bytesOut),
      tickAvgMs: debugStats.tickAvgMs,
      tickMaxMs: debugStats.tickMaxMs,
    };
    lastNet = { ...s };
  }, 1000);

  let last = performance.now();
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const dtMs = now - last;
    last = now;
    const dt = Math.min(dtMs / 1000, 0.05);

    const forward = input.locked
      ? (input.down("KeyW") ? 1 : 0) - (input.down("KeyS") ? 1 : 0)
      : 0;
    const strafe = input.locked
      ? (input.down("KeyD") ? 1 : 0) - (input.down("KeyA") ? 1 : 0)
      : 0;
    const jump = input.locked && input.down("Space");

    stepPlayer(world, player, { forward, strafe, jump, yaw: input.yaw }, dt);
    if (player.pos.y < -16) respawn(); // caiu da borda do mundo

    camera.position.set(player.pos.x, player.pos.y + PLAYER.eyeHeight, player.pos.z);
    camera.rotation.set(input.pitch, input.yaw, 0);

    // mira: raycast local (visual) — decisão continua no servidor
    camera.getWorldDirection(lookDir);
    target = input.locked
      ? raycastBlock(
          world,
          camera.position.x, camera.position.y, camera.position.z,
          lookDir.x, lookDir.y, lookDir.z,
          PLAYER_REACH,
        )
      : null;
    highlight.visible = target !== null;
    if (target) highlight.position.set(target.x + 0.5, target.y + 0.5, target.z + 0.5);

    hud.setRemesh({
      count: chunkRenderer.remeshCount,
      totalMs: chunkRenderer.remeshMsTotal,
      lastMs: chunkRenderer.lastRemeshMs,
    });
    hud.frame(dtMs);
    renderer.render(scene, camera);
  });
}
