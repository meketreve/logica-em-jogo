import * as THREE from "three";
import {
  DEFAULT_WORLD_CHUNKS,
  PLAYER,
  createPlayer,
  findSpawnY,
  generateWorld,
  stepPlayer,
} from "@logica/shared";
import { createAtlasTexture } from "./atlasTexture";
import { ChunkRenderer } from "./chunks";
import { Hud } from "./hud";
import { Input } from "./input";

/**
 * Checkpoint 1: mundo estático + andar (WASD + pointer lock) + HUD F3.
 * Sem rede ainda. Mundo e física vêm de /shared — este arquivo SÓ desenha
 * e coleta input. No checkpoint 2 o mundo passa a vir do servidor.
 */

const WORLD_SEED = 20260710;

// --- Render ---
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

// --- Mundo (gerado em /shared; no checkpoint 2 virá do servidor) ---
const world = generateWorld(DEFAULT_WORLD_CHUNKS, WORLD_SEED);
const material = new THREE.MeshLambertMaterial({ map: createAtlasTexture() });
const chunkRenderer = new ChunkRenderer(world, material, scene);
chunkRenderer.buildAll();

// --- Jogador ---
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

// --- Input + HUD + overlay ---
const input = new Input(renderer.domElement);
const hud = new Hud(renderer, {
  checkpoint: 1,
  worldChunks: DEFAULT_WORLD_CHUNKS,
  worldSeed: WORLD_SEED,
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

const overlay = document.getElementById("overlay");
document.addEventListener("pointerlockchange", () => {
  overlay?.classList.toggle("hidden", input.locked);
});

// --- Loop ---
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

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
