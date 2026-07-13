import * as THREE from "three";
import {
  BlockId,
  type NamedRegion,
  type ObjectiveState,
  PLAYER,
  PLAYER_REACH,
  type RayHit,
  SERVER_TICK_RATE,
  type ScenarioModo,
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
import { initUiAudio, playUi, setUiVolume } from "./audio";
import { ChatUi } from "./chat";
import { ChunkRenderer } from "./chunks";
import { type Connection, WorkerConnection, WsConnection } from "./connection";
import { emitGameEvent } from "./events";
import { Hud } from "./hud";
import { Input } from "./input";
import {
  type MultiAuth,
  type PlayWorldChoice,
  buildConfigScreen,
  getPlayerName,
  showMenu,
} from "./menu";
import { ObjectivesUi } from "./objectivesUi";
import { RegionRenderer } from "./regions";
import { loadSettings } from "./settings";
import { putWorld } from "./worldStore";

/**
 * Checkpoint 8: menu principal. Sem parâmetro na URL o menu escolhe o rumo:
 * singleplayer (Web Worker + mundo do IndexedDB, com autosave) ou rede
 * (WsConnection). `?server=ws://host:8080` pula o menu (link direto/testes);
 * `?nome=x` força o nome. Mesma interface Connection — o jogo não sabe
 * qual hospedeiro é.
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

/** (Re)aplica as configurações do jogador — chamada no boot e ao iniciar jogo
 *  (o menu pode ter mudado tudo antes do play). */
function applySettings(): ReturnType<typeof loadSettings> {
  const s = loadSettings();
  input.sensitivity = s.sensitivity;
  camera.fov = s.fov;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, s.pixelRatioCap));
  setUiVolume(s.volume);
  return s;
}
let settings = applySettings();
initUiAudio(settings.volume);

// --- Menu de pausa (Esc = pointer lock solto) ---
const overlay = document.getElementById("overlay");
const overlayMain = document.getElementById("overlay-main");
const overlayConfig = document.getElementById("overlay-config");
const crosshairEl = document.getElementById("crosshair");

function showOverlayMain(): void {
  overlayMain?.classList.remove("hidden");
  overlayConfig?.classList.add("hidden");
}

function updateOverlay(): void {
  // some quando o jogo tem o mouse OU o chat está aberto (senão cobre o input)
  overlay?.classList.toggle("hidden", input.locked || chat.open);
  // mira só existe COM o mouse travado (pedido do usuário: invisível no Esc)
  crosshairEl?.classList.toggle("hidden", !input.locked);
  if (input.locked) showOverlayMain(); // próximo Esc abre no painel principal
}
document.addEventListener("pointerlockchange", updateOverlay);

/** Config mudou no menu de pausa: aplica AO VIVO no jogo em andamento. */
function onSettingsChanged(): void {
  const oldKeys = settings.keys;
  settings = applySettings();
  // atalhos registrados por handler (chat/HUD/varinha) seguem o rebind na hora
  for (const a of ["chat", "hud", "varinha"] as const) {
    input.rebind(oldKeys[a], settings.keys[a]);
  }
}

document.getElementById("overlay-voltar")?.addEventListener("click", () => input.lock());
document.getElementById("overlay-config-btn")?.addEventListener("click", () => {
  const body = document.getElementById("overlay-config-body");
  if (body) buildConfigScreen(body, onSettingsChanged); // reconstrói = estado atual
  overlayMain?.classList.add("hidden");
  overlayConfig?.classList.remove("hidden");
});
document.getElementById("overlay-config-back")?.addEventListener("click", showOverlayMain);
overlay?.addEventListener("click", (e) => {
  const btn = e.target instanceof HTMLElement ? e.target.closest("button") : null;
  if (btn) playUi(btn.id === "overlay-config-back" ? "back" : "click");
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Conexão com o servidor: escolhida pelo MENU (ou ?server= na URL) ---
let conn: Connection | null = null;
let serverHostLabel = "?";
/** Mundo singleplayer atual (id/nome/criação — bytes vão pro IndexedDB). */
let currentWorld: { id: string; name: string; createdAt: number } | null = null;

// Nome: ?nome=x força (testes); senão o do menu (localStorage — bug-061).
function playerName(): string {
  return new URLSearchParams(location.search).get("nome") ?? getPlayerName();
}

// --- Chat (checkpoint 6): UI em HTML por cima do canvas; comando roda no servidor ---
const chat = new ChatUi(
  (text) => conn?.send(JSON.stringify({ type: "chat", text })),
  (open) => {
    updateOverlay();
    if (!open) input.lock(); // fechou o chat → devolve o mouse pro jogo
  },
);
updateOverlay(); // estado inicial: sem lock → overlay visível, mira escondida

let debugStats = { tickAvgMs: 0, tickMaxMs: 0 };
let started = false;
let applyBlockChanged:
  | ((msg: { x: number; y: number; z: number; blockId: number }) => void)
  | null = null;
let applyPlayerMoved:
  | ((msg: { id: number; x: number; y: number; z: number; yaw: number }) => void)
  | null = null;
let applyPlayerLeft: ((id: number) => void) | null = null;
let applyTeleport:
  | ((pos: { x: number; y: number; z: number; yaw: number; pitch: number }) => void)
  | null = null;
let serverSpawn: { x: number; y: number; z: number } | null = null;
/** Papel do próprio jogador — vem no spawn (cp11); habilita a varinha. */
let papel: "professor" | "aluno" = "aluno";
/** Última lista de regiões do servidor (chega só pra professor). */
let latestRegions: NamedRegion[] = [];
let applyRegions: ((regions: NamedRegion[]) => void) | null = null;
// cenário (cp12/13): painel HTML vive fora do jogo 3D; caixas verdes no startGame
const objectivesUi = new ObjectivesUi();
let latestObjectives: { modo: ScenarioModo; objetivos: ObjectiveState[] } | null = null;
let applyObjectiveBoxes: ((list: ObjectiveState[]) => void) | null = null;
/** Grupo do PRÓPRIO jogador (cp13) — vem na mensagem `group`. */
let myGrupo: number | null = null;
const knownComplete = new Set<number>();
let objectivesSeeded = false; // 1ª lista do join não toca som de conquista antiga

/** Concluído NO MEU escopo (meu grupo; professor/sem grupos = agregado). */
function ownDone(o: ObjectiveState): boolean {
  if (o.porGrupo && papel !== "professor") {
    if (myGrupo === null) return false;
    return o.porGrupo.find((g) => g.grupo === myGrupo)?.completo ?? false;
  }
  return o.completo;
}

/** Re-renderiza painel + caixas; beep só pra conclusão NOVA do meu escopo. */
function refreshObjectivesView(beep: boolean): void {
  if (!latestObjectives) return;
  for (const o of latestObjectives.objetivos) {
    if (ownDone(o)) {
      if (!knownComplete.has(o.id)) {
        knownComplete.add(o.id);
        if (beep && objectivesSeeded) emitGameEvent({ kind: "objective_complete" });
      }
    } else {
      knownComplete.delete(o.id); // /objetivo resetar
    }
  }
  objectivesSeeded = true;
  objectivesUi.update(latestObjectives.modo, latestObjectives.objetivos, {
    grupo: myGrupo,
    professor: papel === "professor",
  });
  applyObjectiveBoxes?.(latestObjectives.objetivos);
}

function handleServerData(data: string | ArrayBuffer): void {
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
      papel = msg.papel ?? "aluno";
    } else if (msg.type === "regions") {
      latestRegions = msg.regions;
      applyRegions?.(msg.regions);
    } else if (msg.type === "objectives") {
      latestObjectives = { modo: msg.modo, objetivos: msg.objetivos };
      refreshObjectivesView(true);
    } else if (msg.type === "group") {
      // trocar de grupo NÃO toca som: re-sincroniza o "já visto" em silêncio
      myGrupo = msg.grupo;
      knownComplete.clear();
      refreshObjectivesView(false);
    } else if (msg.type === "teleport") {
      applyTeleport?.(msg);
    } else if (msg.type === "join_denied") {
      // servidor recusou (PIN errado, nome em uso…): volta pro menu limpo
      // (location sem query — cobre o boot via ?server=); o motivo atravessa
      // o reload via sessionStorage e vira banner no menu (sem alert nativo)
      playUi("denied");
      sessionStorage.setItem("lj-erro", `não deu pra entrar: ${msg.reason}`);
      location.href = location.pathname;
    } else if (msg.type === "chat") {
      chat.addMessage(msg.author, msg.text);
      emitGameEvent({ kind: "chat_message" });
    }
    return;
  }
  if (started) return; // snapshot é único por sessão
  started = true;
  startGame(decodeSnapshot(data));
}

// --- Iniciar jogo (menu ou URL escolhem o hospedeiro) ---

function connect(c: Connection, auth?: MultiAuth): void {
  settings = applySettings(); // menu pode ter mudado config antes do play
  conn = c;
  c.onMessage(handleServerData);
  input.onKey(settings.keys.chat, () => {
    if (chat.open) return; // dentro do chat a tecla é do campo, não daqui
    document.exitPointerLock();
    chat.openInput();
  });
  // singleplayer (sem auth) entra sem PIN — o worker é professor automático
  c.send(
    JSON.stringify({
      type: "join",
      name: playerName(),
      ...(auth ? { pin: auth.pin } : {}),
      ...(auth?.codigo ? { codigo: auth.codigo } : {}),
    }),
  );
}

function startMultiplayer(url: string, auth: MultiAuth): void {
  serverHostLabel = url;
  // em rede quem salva é o host — o botão só volta pro menu
  const sair = document.getElementById("btn-sair");
  if (sair) sair.textContent = "voltar ao menu";
  connect(new WsConnection(url), auth);
}

function startSingleplayer(choice: PlayWorldChoice): void {
  currentWorld = { id: choice.id, name: choice.name, createdAt: choice.createdAt };
  serverHostLabel = `web-worker (${choice.name})`;
  const wc = new WorkerConnection(
    new Worker(new URL("../../server/src/worker.ts", import.meta.url), {
      type: "module",
    }),
  );
  // mundo novo = seed aleatória; mundo existente = bytes do IndexedDB
  const seed = crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
  wc.init({ save: choice.data ?? undefined, seed, flat: choice.flat });
  connect(wc);
}

/** Grava o mundo singleplayer no IndexedDB (autosave e botão sair). */
async function persistWorld(): Promise<void> {
  if (!(conn instanceof WorkerConnection) || !currentWorld) return;
  const data = await conn.requestSave();
  await putWorld({ ...currentWorld, updatedAt: Date.now(), data });
}

// sair: singleplayer grava antes; rede só recarrega (host é quem salva)
document.getElementById("btn-sair")?.addEventListener("click", () => {
  void persistWorld().finally(() => location.reload());
});

const bootParams = new URLSearchParams(location.search);
const bootServer = bootParams.get("server");
if (bootServer) {
  // link direto/testes: ?pin=1234 (e ?codigo=) fazem as vezes do menu
  const codigo = bootParams.get("codigo");
  startMultiplayer(bootServer, {
    pin: bootParams.get("pin") ?? "",
    ...(codigo ? { codigo } : {}),
  });
} else {
  showMenu({
    onPlayWorld: startSingleplayer,
    onPlayMulti: startMultiplayer,
  });
}

// --- Jogo (só começa quando o snapshot chega do servidor) ---
function startGame(snap: Snapshot): void {
  const activeConn = conn;
  if (!activeConn) return; // snapshot só chega depois do connect()
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

  // regiões nomeadas (cp11): wireframes — o servidor só manda pra professor
  const regionRenderer = new RegionRenderer(scene);
  regionRenderer.setRegions(latestRegions);
  applyRegions = (regions) => {
    regionRenderer.setRegions(regions);
    regionRenderer.clearCorners(); // região criada/apagada: rascunho já era
  };

  // objetivos ATIVOS (cp12/13): caixa verde — aluno vê o alvo DO SEU grupo,
  // professor vê os alvos de todos os grupos
  const objectiveBoxes = new RegionRenderer(scene, 0x2ecc71);
  const updateObjectiveBoxes = (list: ObjectiveState[]): void => {
    const boxes: NamedRegion[] = [];
    for (const o of list) {
      if (o.porGrupo) {
        let mostrouAlvo = false;
        for (const g of o.porGrupo) {
          const meu = myGrupo !== null && g.grupo === myGrupo;
          if ((papel === "professor" || meu) && g.ativo && !g.completo) {
            boxes.push({ nome: `${o.regiao} g${g.grupo}`, min: g.min, max: g.max });
            mostrouAlvo = true;
          }
        }
        // construir per-grupo: min/max do objetivo = caixa do MODELO — mostra
        // junto (o aluno precisa VER o que copiar)
        if (mostrouAlvo && o.kind === "construir") {
          boxes.push({ nome: `modelo ${o.regiao}`, min: o.min, max: o.max });
        }
      } else if (o.ativo && !o.completo) {
        boxes.push({ nome: o.regiao, min: o.min, max: o.max });
      }
    }
    objectiveBoxes.setRegions(boxes);
  };
  applyObjectiveBoxes = updateObjectiveBoxes;
  if (latestObjectives) updateObjectiveBoxes(latestObjectives.objetivos);

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

  // servidor manda posição E orientação (volta-onde-parou; futuro /tp)
  applyTeleport = (pos) => {
    player.pos.x = pos.x;
    player.pos.y = pos.y;
    player.pos.z = pos.z;
    player.vel.x = player.vel.y = player.vel.z = 0;
    input.yaw = pos.yaw;
    input.pitch = pos.pitch;
  };

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

  // --- Outros jogadores: caixa colorida por id, com LERP (gatilho disparou:
  // usuário reportou serrilhado — updates chegam a 10 Hz, o render interpola) ---
  interface RemotePlayer {
    mesh: THREE.Mesh;
    target: THREE.Vector3;
    targetYaw: number;
  }
  const remotePlayers = new Map<number, RemotePlayer>();
  applyPlayerMoved = (msg) => {
    let rp = remotePlayers.get(msg.id);
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
      scene.add(mesh);
      rp = { mesh, target: mesh.position.clone(), targetYaw: msg.yaw };
      remotePlayers.set(msg.id, rp);
    }
    // pos do servidor = pés do jogador; BoxGeometry é centrada
    rp.target.set(msg.x, msg.y + PLAYER.height / 2, msg.z);
    rp.targetYaw = msg.yaw;
  };
  applyPlayerLeft = (id) => {
    const rp = remotePlayers.get(id);
    if (!rp) return;
    scene.remove(rp.mesh);
    rp.mesh.geometry.dispose();
    (rp.mesh.material as THREE.Material).dispose();
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
  // varinha (cp11, só professor): cliques viram marcas de canto de região
  let varinhaAtiva = false;
  const hotbarEl = document.getElementById("hotbar");
  const refreshHotbar = (): void => {
    if (!hotbarEl) return;
    // nomes são constantes do código (sem input externo) — innerHTML ok aqui
    if (varinhaAtiva) {
      hotbarEl.innerHTML =
        "<b>[varinha]</b> esq = canto 1 · dir = canto 2 · /regiao criar nome · R volta";
      return;
    }
    hotbarEl.innerHTML = PLACEABLE.map((b, i) => {
      const label = i < 9 ? `${i + 1} ${b.name}` : b.name;
      return i === selected ? `<b>[${label}]</b>` : `<span>${label}</span>`;
    }).join(" · ");
  };
  refreshHotbar();
  input.onKey(settings.keys.varinha, () => {
    if (papel !== "professor") return; // aluno não tem varinha
    varinhaAtiva = !varinhaAtiva;
    refreshHotbar();
  });
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

  // varinha: marca o canto na célula MIRADA (o bloco existente, não o ar
  // vizinho) e mostra a marca local — o servidor confirma via chat
  const wandMark = (corner: 1 | 2, t: RayHit): void => {
    activeConn.send(
      JSON.stringify({ type: "wand_mark", corner, x: t.x, y: t.y, z: t.z }),
    );
    regionRenderer.setCorner(corner, t.x, t.y, t.z);
  };
  input.onMouseButton(0, () => {
    if (!target) return;
    if (varinhaAtiva) {
      wandMark(1, target);
      return;
    }
    activeConn.send(
      JSON.stringify({ type: "break_block", x: target.x, y: target.y, z: target.z }),
    );
  });
  input.onMouseButton(2, () => {
    if (!target) return;
    if (varinhaAtiva) {
      wandMark(2, target);
      return;
    }
    const block = PLACEABLE[selected];
    if (!block) return;
    activeConn.send(
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
    checkpoint: 11,
    worldChunks: world.dims,
    worldSeed: snap.seed,
    serverHost: serverHostLabel,
  });
  hud.setRemesh({
    count: chunkRenderer.remeshCount,
    totalMs: chunkRenderer.remeshMsTotal,
    lastMs: chunkRenderer.lastRemeshMs,
  });
  input.onKey(settings.keys.hud, () => hud.toggle());
  hud.extra = () => {
    const m = input.mouseStats;
    const p = player.pos;
    return (
      `pos ${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.z.toFixed(1)}  ` +
      `bloco ${Math.floor(p.x)} ${Math.floor(p.y)} ${Math.floor(p.z)}\n` +
      `mouse Δmáx ${m.maxDelta}px  descartados ${m.dropped} (último ${m.lastDropped}px)`
    );
  };

  // move REATIVO: até 10×/s enquanto muda; parado, vira heartbeat 1×/2 s
  // (mantém presença/último estado sem inundar a LAN com posição repetida —
  // 20 alunos parados: ~200 msg/s de subida caem pra ~10)
  const IDLE_HEARTBEAT_MS = 2000;
  let lastSent = { x: NaN, y: NaN, z: NaN, yaw: NaN, pitch: NaN };
  let lastSentAt = 0;
  setInterval(() => {
    const cur = {
      x: player.pos.x,
      y: player.pos.y,
      z: player.pos.z,
      yaw: input.yaw,
      pitch: input.pitch,
    };
    const changed =
      cur.x !== lastSent.x ||
      cur.y !== lastSent.y ||
      cur.z !== lastSent.z ||
      cur.yaw !== lastSent.yaw ||
      cur.pitch !== lastSent.pitch;
    const now = performance.now();
    if (!changed && now - lastSentAt < IDLE_HEARTBEAT_MS) return;
    lastSent = cur;
    lastSentAt = now;
    activeConn.send(JSON.stringify({ type: "move", ...cur }));
  }, 1000 / SERVER_TICK_RATE);

  // singleplayer: mundo NASCE salvo (fechar a aba logo depois não perde nada)
  // e autossalva no IndexedDB no mesmo ritmo do host Node (30 s)
  if (activeConn instanceof WorkerConnection && currentWorld) {
    void persistWorld();
    setInterval(() => void persistWorld(), 30_000);
  }

  // HUD de rede: taxa por segundo (entrada+saída) + duração do tick do servidor
  let lastNet = { ...activeConn.stats };
  setInterval(() => {
    const s = activeConn.stats;
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
      ? (input.down(settings.keys.forward) ? 1 : 0) - (input.down(settings.keys.back) ? 1 : 0)
      : 0;
    const strafe = input.locked
      ? (input.down(settings.keys.right) ? 1 : 0) - (input.down(settings.keys.left) ? 1 : 0)
      : 0;
    const jump = input.locked && input.down(settings.keys.jump);

    stepPlayer(world, player, { forward, strafe, jump, yaw: input.yaw }, dt);
    if (player.pos.y < -16) respawn(); // caiu da borda do mundo

    // jogadores remotos deslizam até o último update (suave mesmo a 10 Hz);
    // fator exponencial = independente do FPS (~90% do caminho em ~190 ms)
    const k = 1 - Math.exp(-dt * 12);
    for (const rp of remotePlayers.values()) {
      rp.mesh.position.lerp(rp.target, k);
      const dyaw = rp.targetYaw - rp.mesh.rotation.y;
      rp.mesh.rotation.y += Math.atan2(Math.sin(dyaw), Math.cos(dyaw)) * k;
    }

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
