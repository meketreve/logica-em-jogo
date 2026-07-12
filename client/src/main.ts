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
import { ChatUi } from "./chat";
import { ChunkRenderer } from "./chunks";
import { type Connection, WorkerConnection, WsConnection } from "./connection";
import { emitGameEvent } from "./events";
import { Hud } from "./hud";
import { Input } from "./input";

/**
 * Checkpoint 6: chat + 1 comando (/bloco, parser no SERVIDOR — fecha o MVP v0).
 * `?server=ws://host:8080` na URL conecta no hospedeiro Node+ws; sem parâmetro
 * = Web Worker local (singleplayer). Mesma interface Connection, mesmas
 * mensagens — o jogo não sabe qual hospedeiro é.
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
function updateOverlay(): void {
  // some quando o jogo tem o mouse OU o chat está aberto (senão cobre o input)
  overlay?.classList.toggle("hidden", input.locked || chat.open);
}
document.addEventListener("pointerlockchange", updateOverlay);

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

// --- Chat (checkpoint 6): UI em HTML por cima do canvas; comando roda no servidor ---
const chat = new ChatUi(
  (text) => conn.send(JSON.stringify({ type: "chat", text })),
  (open) => {
    updateOverlay();
    if (!open) input.lock(); // fechou o chat → devolve o mouse pro jogo
  },
);
input.onKey("Enter", () => {
  if (chat.open) return; // Enter DENTRO do chat é do campo (envia), não daqui
  document.exitPointerLock();
  chat.openInput();
});

let debugStats = { tickAvgMs: 0, tickMaxMs: 0 };
let started = false;
let applyBlockChanged:
  | ((msg: { x: number; y: number; z: number; blockId: number }) => void)
  | null = null;
let applyPlayerMoved:
  | ((msg: { id: number; x: number; y: number; z: number; yaw: number }) => void)
  | null = null;
let applyPlayerLeft: ((id: number) => void) | null = null;
let serverSpawn: { x: number; y: number; z: number } | null = null;

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
    } else if (msg.type === "spawn") {
      serverSpawn = { x: msg.x, y: msg.y, z: msg.z };
    } else if (msg.type === "chat") {
      chat.addMessage(msg.author, msg.text);
      emitGameEvent({ kind: "chat_message" });
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

  // ?atlas na URL: pendura o canvas do texture atlas no canto (inspeção visual)
  if (new URLSearchParams(location.search).has("atlas")) {
    const img = material.map?.image as HTMLCanvasElement;
    img.style.cssText =
      "position:fixed;right:8px;top:8px;width:256px;image-rendering:pixelated;z-index:20;border:1px solid #000";
    document.body.appendChild(img);
  }
  const chunkRenderer = new ChunkRenderer(world, material, scene);
  chunkRenderer.buildAll();

  // Spawn vem do SERVIDOR (fixo, do terreno pristino) — o snapshot pode já
  // estar escavado, então findSpawnY local daria outro lugar (bug-010).
  // Fallback local só se a mensagem spawn não chegou (não deve acontecer).
  const spawn = serverSpawn ?? {
    x: world.sizeX / 2 + 0.5,
    y: findSpawnY(world, Math.floor(world.sizeX / 2), Math.floor(world.sizeZ / 2)),
    z: world.sizeZ / 2 + 0.5,
  };
  const player = createPlayer(spawn.x, spawn.y, spawn.z);

  function respawn(): void {
    player.pos.x = spawn.x;
    player.pos.y = spawn.y;
    player.pos.z = spawn.z;
    player.vel.x = player.vel.y = player.vel.z = 0;
  }

  // servidor mandou block_changed (nossa ação OU de outro jogador OU gravidade
  // — cliente não distingue): aplica na cópia local e remesh
  applyBlockChanged = (msg) => {
    setBlock(world, msg.x, msg.y, msg.z, msg.blockId);
    chunkRenderer.remeshBlock(msg.x, msg.y, msg.z);
    // gatilho de som (áudio pluga depois); areia caindo dispara os dois por tick
    emitGameEvent(
      msg.blockId === BlockId.Air
        ? { kind: "block_broken" }
        : { kind: "block_placed", blockId: msg.blockId },
    );
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

  // Ordem = id do bloco (1..18): o texto de uso do /bloco aponta pra hotbar.
  const PLACEABLE = [
    { id: BlockId.Grass, name: "grama" },
    { id: BlockId.Stone, name: "pedra" },
    { id: BlockId.Cobblestone, name: "pedregulho" },
    { id: BlockId.Sand, name: "areia" },
    { id: BlockId.Dirt, name: "terra" },
    { id: BlockId.Log, name: "tronco" },
    { id: BlockId.Planks, name: "tábuas" },
    { id: BlockId.Brick, name: "tijolo" },
    { id: BlockId.Gravel, name: "cascalho" },
    { id: BlockId.Bedrock, name: "rocha-matriz" },
    { id: BlockId.WoolWhite, name: "lã branca" },
    { id: BlockId.WoolBlack, name: "lã preta" },
    { id: BlockId.WoolRed, name: "lã vermelha" },
    { id: BlockId.WoolOrange, name: "lã laranja" },
    { id: BlockId.WoolYellow, name: "lã amarela" },
    { id: BlockId.WoolGreen, name: "lã verde" },
    { id: BlockId.WoolBlue, name: "lã azul" },
    { id: BlockId.WoolPurple, name: "lã roxa" },
  ] as const;
  let selected = 0;
  const hotbarEl = document.getElementById("hotbar");
  const refreshHotbar = (): void => {
    if (!hotbarEl) return;
    // nomes são constantes do código (sem input externo) — innerHTML ok aqui
    hotbarEl.innerHTML = PLACEABLE.map((b, i) => {
      const label = i < 9 ? `${i + 1} ${b.name}` : b.name;
      return i === selected ? `<b>[${label}]</b>` : `<span>${label}</span>`;
    }).join(" · ");
  };
  refreshHotbar();
  // 1–9 escolhe direto os primeiros; scroll cicla TODOS os blocos
  PLACEABLE.slice(0, 9).forEach((_, i) => {
    input.onKey(`Digit${i + 1}`, () => {
      selected = i;
      refreshHotbar();
    });
  });
  input.onWheel((dir) => {
    selected = (selected + dir + PLACEABLE.length) % PLACEABLE.length;
    refreshHotbar();
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
    checkpoint: 6,
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
