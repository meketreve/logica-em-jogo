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
import { WorkerConnection } from "./connection";
import { Hud } from "./hud";
import { Input } from "./input";

/**
 * Checkpoint 3: colocar e quebrar bloco. Raycast local SÓ pra mirar (visual);
 * o clique vira place_block/break_block pro servidor, que valida, aplica e
 * responde block_changed — só então o cliente altera a cópia local e faz
 * remesh. Cliente continua sem decidir estado de mundo nenhum.
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

// --- Conexão com o servidor (hospedeiro atual: Web Worker) ---
const worker = new Worker(new URL("../../server/src/worker.ts", import.meta.url), {
  type: "module",
});
const conn = new WorkerConnection(worker);

let debugStats = { tickAvgMs: 0, tickMaxMs: 0 };
let started = false;
let applyBlockChanged:
  | ((msg: { x: number; y: number; z: number; blockId: number }) => void)
  | null = null;

conn.onMessage((data) => {
  if (typeof data === "string") {
    const msg = parseServerMessage(data);
    if (!msg) return;
    if (msg.type === "debug_stats") {
      debugStats = { tickAvgMs: msg.tickAvgMs, tickMaxMs: msg.tickMaxMs };
    } else if (msg.type === "block_changed") {
      applyBlockChanged?.(msg);
    }
    return;
  }
  if (started) return; // snapshot é único no checkpoint 2
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
  // futura — cliente não distingue): aplica na cópia local e remesh
  applyBlockChanged = (msg) => {
    setBlock(world, msg.x, msg.y, msg.z, msg.blockId);
    chunkRenderer.remeshBlock(msg.x, msg.y, msg.z);
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
    checkpoint: 4,
    worldChunks: world.dims,
    worldSeed: snap.seed,
    serverHost: "web-worker",
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
