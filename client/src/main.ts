import * as THREE from "three";
import {
  PLAYER,
  SERVER_TICK_RATE,
  type Snapshot,
  createPlayer,
  decodeSnapshot,
  findSpawnY,
  parseServerMessage,
  stepPlayer,
} from "@logica/shared";
import { createAtlasTexture } from "./atlasTexture";
import { ChunkRenderer } from "./chunks";
import { WorkerConnection } from "./connection";
import { Hud } from "./hud";
import { Input } from "./input";

/**
 * Checkpoint 2: o mundo VEM DO SERVIDOR (GameSession de /shared rodando num
 * Web Worker). Cliente conecta, manda join, recebe world_snapshot binário
 * (header com dims + seed) e desenha. Física do próprio jogador ainda roda
 * local (servidor valida depois). Tela idêntica ao checkpoint 1 — de
 * propósito: este checkpoint prova a arquitetura, não muda o jogo.
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

conn.onMessage((data) => {
  if (typeof data === "string") {
    const msg = parseServerMessage(data);
    if (msg) debugStats = { tickAvgMs: msg.tickAvgMs, tickMaxMs: msg.tickMaxMs };
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

  const hud = new Hud(renderer, {
    checkpoint: 2,
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

    hud.frame(dtMs);
    renderer.render(scene, camera);
  });
}
