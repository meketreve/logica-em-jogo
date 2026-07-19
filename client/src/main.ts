import * as THREE from "three";
import {
  BlockId,
  type Claim,
  type GroupDef,
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
  getBlock,
  isPlaceable,
  isPorta,
  isProfessorOnly,
  parseServerMessage,
  raycastBlock,
  setBlock,
  stepPlayer,
} from "@logica/shared";
import { createAtlasTexture } from "./atlasTexture";
import { initUiAudio, playUi, setUiVolume } from "./audio";
import { makeBlockIcons } from "./blockIcons";
import { PLACEABLE, placeableFor } from "./blocksUi";
import { InventoryPanel } from "./inventory";
import { ChatUi } from "./chat";
import { ChunkRenderer } from "./chunks";
import { learnPlayers, learnWorlds } from "./commands";
import { SkyCycle } from "./daynight";
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
import { AuthorPanel, type GamePanel, GroupPanel, type PanelData } from "./panels";
import { RegionRenderer } from "./regions";
import { keyLabel, loadSettings } from "./settings";
import { armarGuardaDeAtalhos, desarmarGuardaDeAtalhos } from "./shortcutGuard";
import { TorchGlow } from "./torchGlow";
import { TouchControls, isTouchDevice, solicitarTelaCheia } from "./touch";
import { putWorld } from "./worldStore";

/**
 * O cliente não tem filesystem: aprende os nomes das aulas pela resposta de
 * "/mundo lista" do servidor (autor "servidor") pra oferecer no Tab do
 * "/mundo carregar". Best-effort — se a frase mudar, só perde o autocompletar.
 */
function cachearMundos(text: string): void {
  const m = /dispon[ií]veis:\s*(.+?)\.\s*(?:para trocar|para continuar)/i.exec(text);
  const lista = m?.[1];
  if (!lista) return;
  const nomes = lista
    .split("·")
    .map((s) => s.replace(/\(em curso\)/i, "").trim())
    .filter(Boolean);
  if (nomes.length) learnWorlds(nomes);
}

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
const ambient = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(sun, ambient);
// Ciclo dia/noite (cp21): a hora vem do servidor (msg `time`); o SkyCycle
// interpola céu/sol/luz. update(dt) roda no loop de render.
const skyCycle = new SkyCycle(sun, ambient, scene, camera);
// ?hora=21.5 na URL: força a hora do céu (screenshot headless de noite/entardecer
// sem depender do servidor — o sync de rede é ignorado enquanto forçada).
// CUIDADO: Number(null) === 0 — sem o param tem que dar null, não meia-noite.
const horaForcada = ((): number | null => {
  const raw = new URLSearchParams(location.search).get("hora");
  if (raw === null) return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
})();
if (horaForcada !== null) skyCycle.sync(horaForcada, false);

const input = new Input(renderer.domElement);
// ?yaw=-1.57 na URL: aponta a câmera no boot (par do ?hora — mirar o sol/lua)
const yawRaw = new URLSearchParams(location.search).get("yaw");
if (yawRaw !== null && Number.isFinite(Number(yawRaw))) input.yaw = Number(yawRaw);

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

/** Painel do cp14 — criado no startGame conforme o papel (autoria OU grupo).
 *  Declarado ANTES do updateOverlay do boot (TDZ). */
let activePanel: GamePanel | null = null;
/** Inventário de blocos (cp16) — criado no startGame (precisa do atlas). */
let inventoryPanel: InventoryPanel | null = null;
/** Controles de toque (tablet) — criados no startGame só em dispositivo touch. */
let touchControls: TouchControls | null = null;

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
  // some quando o jogo tem o controle (mouse travado OU modo toque), o chat
  // está aberto OU um painel do cp14 está na tela (senão cobre o painel)
  const panelOpen = (activePanel?.open ?? false) || (inventoryPanel?.open ?? false);
  overlay?.classList.toggle("hidden", input.active || chat.open || panelOpen);
  // mira só existe COM o jogo no controle (pedido do usuário: invisível no Esc)
  crosshairEl?.classList.toggle("hidden", !input.active);
  if (input.locked) showOverlayMain(); // próximo Esc abre no painel principal
  // UI de toque acompanha: some sob menu de pausa, chat ou painel aberto
  touchControls?.setShown(input.touch && !chat.open && !panelOpen);
}
document.addEventListener("pointerlockchange", updateOverlay);

/** Entrar no jogo: desktop trava o mouse; tablet liga o modo toque. */
function startPlay(): void {
  if (isTouchDevice()) {
    input.touch = true;
    solicitarTelaCheia(); // gesto do tap ainda vale — celular vira tela cheia
    updateOverlay();
  } else {
    input.lock();
  }
}

/** Config mudou no menu de pausa: aplica AO VIVO no jogo em andamento. */
function onSettingsChanged(): void {
  const oldKeys = settings.keys;
  settings = applySettings();
  // atalhos registrados por handler (chat/HUD/varinha/painel/inventário) seguem o rebind na hora
  for (const a of ["chat", "hud", "varinha", "painel", "inventario"] as const) {
    input.rebind(oldKeys[a], settings.keys[a]);
  }
}

document.getElementById("overlay-voltar")?.addEventListener("click", () => startPlay());
document.getElementById("overlay-config-btn")?.addEventListener("click", () => {
  const body = document.getElementById("overlay-config-body");
  // reconstrói = estado atual; o "voltar" é da própria tela de config (um só)
  if (body) buildConfigScreen(body, onSettingsChanged, showOverlayMain);
  overlayMain?.classList.add("hidden");
  overlayConfig?.classList.remove("hidden");
});
overlay?.addEventListener("click", (e) => {
  const btn = e.target instanceof HTMLElement ? e.target.closest("button") : null;
  if (btn) playUi(btn.classList.contains("menu-back") ? "back" : "click");
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

// toque: não existe Esc — tocar fora do campo (no canvas) fecha o chat
renderer.domElement.addEventListener("pointerdown", () => {
  if (input.touch && chat.open) chat.close();
});

let debugStats = { tickAvgMs: 0, tickMaxMs: 0 };
let started = false;
let applyBlockChanged:
  | ((msg: { x: number; y: number; z: number; blockId: number }) => void)
  | null = null;
let applyBlocksFilled:
  | ((msg: {
      x0: number; y0: number; z0: number;
      x1: number; y1: number; z1: number;
      blockId: number;
    }) => void)
  | null = null;
let applyPlayerMoved:
  | ((msg: { id: number; x: number; y: number; z: number; yaw: number; name?: string }) => void)
  | null = null;
let applyPlayerLeft: ((id: number) => void) | null = null;
let applyTeleport:
  | ((pos: { x: number; y: number; z: number; yaw: number; pitch: number }) => void)
  | null = null;
let serverSpawn: { x: number; y: number; z: number } | null = null;
/** Papel do próprio jogador — vem no spawn (cp11); habilita a varinha. */
let papel: "professor" | "aluno" = "aluno";
/** Voo criativo liberado pra TURMA (msg `voo`). Professor voa independente disto. */
let vooLiberado = false;
/** Estou voando agora? Alterna com duplo-toque no espaço (se podeVoar). */
let flying = false;
/** Posso voar? Professor sempre; aluno só com o voo liberado pra turma. */
function podeVoar(): boolean {
  return papel === "professor" || vooLiberado;
}
/** Última lista de regiões do servidor (chega só pra professor). */
let latestRegions: NamedRegion[] = [];
let applyRegions: ((regions: NamedRegion[]) => void) | null = null;
/** Anti-griefing (cp24): proteção de áreas ligada? + claims (TODOS recebem).
 *  Com a proteção ligada o aluno também usa a varinha (pra /claim criar). */
let claimsAtivo = false;
let latestClaims: Claim[] = [];
let applyClaims: ((claims: Claim[]) => void) | null = null;
// cenário (cp12/13): painel HTML vive fora do jogo 3D; caixas verdes no startGame
const objectivesUi = new ObjectivesUi();
let latestObjectives: { modo: ScenarioModo; objetivos: ObjectiveState[] } | null = null;
let applyObjectiveBoxes: ((list: ObjectiveState[]) => void) | null = null;
/** Grupo do PRÓPRIO jogador (cp13) — vem na mensagem `group`. */
let myGrupo: number | null = null;
/** Composição dos grupos (cp14) — vem na mensagem `groups`; painéis vivem disto. */
let latestGroups: GroupDef[] = [];
const knownComplete = new Set<number>();
let objectivesSeeded = false; // 1ª lista do join não toca som de conquista antiga
/** cp19: o professor trocou a aula — o mundo inteiro chega de novo, em jogo. */
let reloadWorld: ((snap: Snapshot) => void) | null = null;

/** Nomes online (id→nome) pro autocomplete de comandos com nome de jogador. */
const nomesOnline = new Map<number, string>();

/** Estado consolidado pros painéis — chamada sempre que algo deles muda. */
function pushPanelData(): void {
  activePanel?.update({
    regions: latestRegions,
    modo: latestObjectives?.modo ?? "sequencial",
    objetivos: latestObjectives?.objetivos ?? [],
    grupos: latestGroups,
    myGrupo,
  } satisfies PanelData);
}

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
    painelKey: keyLabel(settings.keys.painel),
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
    } else if (msg.type === "blocks_filled") {
      applyBlocksFilled?.(msg);
    } else if (msg.type === "player_moved") {
      // autocomplete de nomes (Tab): quem está online, aprendido do relay
      if (msg.name && nomesOnline.get(msg.id) !== msg.name) {
        nomesOnline.set(msg.id, msg.name);
        learnPlayers([...new Set(nomesOnline.values())]);
      }
      applyPlayerMoved?.(msg);
    } else if (msg.type === "player_left") {
      nomesOnline.delete(msg.id);
      learnPlayers([...new Set(nomesOnline.values())]);
      applyPlayerLeft?.(msg.id);
    } else if (msg.type === "spawn") {
      serverSpawn = { x: msg.x, y: msg.y, z: msg.z };
      papel = msg.papel ?? "aluno";
    } else if (msg.type === "regions") {
      latestRegions = msg.regions;
      applyRegions?.(msg.regions);
      pushPanelData();
    } else if (msg.type === "objectives") {
      latestObjectives = { modo: msg.modo, objetivos: msg.objetivos };
      refreshObjectivesView(true);
      pushPanelData();
    } else if (msg.type === "group") {
      // trocar de grupo NÃO toca som: re-sincroniza o "já visto" em silêncio
      myGrupo = msg.grupo;
      knownComplete.clear();
      refreshObjectivesView(false);
      pushPanelData();
    } else if (msg.type === "groups") {
      latestGroups = msg.grupos;
      pushPanelData();
    } else if (msg.type === "claims") {
      // cp24: proteção de áreas — wireframes pra todo mundo + habilita a varinha
      // do aluno quando ligada. O servidor é quem barra a edição de fato.
      claimsAtivo = msg.ativo;
      latestClaims = msg.claims;
      applyClaims?.(msg.claims); // o closure lê claimsAtivo (já atualizado acima)
    } else if (msg.type === "friends") {
      // cp24: grupo de amigos + convites. O feedback textual já chega por chat
      // do servidor; o painel de amigos é fase 2 (comandos primeiro, cp14).
    } else if (msg.type === "teleport") {
      applyTeleport?.(msg);
    } else if (msg.type === "time") {
      // ?hora= na URL congela o céu local (inspeção visual — ver ?atlas)
      if (horaForcada === null) skyCycle.sync(msg.hora, msg.ciclo);
    } else if (msg.type === "voo") {
      vooLiberado = msg.liberado;
      // aluno perdeu a liberação no meio do voo: cai (professor voa sempre)
      if (!podeVoar()) flying = false;
      chat.addMessage(
        "jogo",
        msg.liberado
          ? "voo liberado — dois toques no espaço para voar (espaço sobe, agachar desce)"
          : "voo trancado pela turma",
      );
    } else if (msg.type === "kicked") {
      // professor removeu (cp22): mesmo caminho do join_denied — motivo vira
      // banner no menu (sem alert nativo), o socket cai logo depois.
      playUi("denied");
      sessionStorage.setItem("lj-erro", msg.reason);
      desarmarGuardaDeAtalhos(); // saída pedida pelo servidor, não acidente
      location.href = location.pathname;
    } else if (msg.type === "join_denied") {
      // servidor recusou (PIN errado, nome em uso…): volta pro menu limpo
      // (location sem query — cobre o boot via ?server=); o motivo atravessa
      // o reload via sessionStorage e vira banner no menu (sem alert nativo)
      playUi("denied");
      sessionStorage.setItem("lj-erro", `não deu pra entrar: ${msg.reason}`);
      desarmarGuardaDeAtalhos();
      location.href = location.pathname;
    } else if (msg.type === "chat") {
      chat.addMessage(msg.author, msg.text);
      if (msg.author === "servidor") cachearMundos(msg.text);
      emitGameEvent({ kind: "chat_message" });
    }
    return;
  }
  if (started) {
    // segundo snapshot EM JOGO = o professor trocou a aula (cp19). O que vem
    // depois (regiões, grupos, objetivos, teleporte) repovoa a tela.
    reloadWorld?.(decodeSnapshot(data));
    return;
  }
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
  wc.init({ save: choice.data ?? undefined, seed, preset: choice.preset });
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
  desarmarGuardaDeAtalhos(); // saída legítima — sem diálogo "sair do site?"
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
  // atalhos do navegador (Ctrl+W ao correr!) — guarda ativa enquanto joga
  armarGuardaDeAtalhos(() => input.active);
  // `let`: a troca de aula (cp19) substitui o mundo debaixo dos closures abaixo
  let world = snap.world;
  // alphaTest = cutout dos transparentes (vidro/folhas): pixel opaco ou
  // descartado — sem blending, sem sorting, mesmo draw call por chunk (cp18)
  const material = new THREE.MeshLambertMaterial({
    map: createAtlasTexture(),
    alphaTest: 0.5,
  });

  // ?atlas na URL: pendura o canvas do texture atlas no canto (inspeção visual)
  if (new URLSearchParams(location.search).has("atlas")) {
    const img = material.map?.image as HTMLCanvasElement;
    img.style.cssText =
      "position:fixed;right:8px;top:8px;width:256px;image-rendering:pixelated;z-index:20;border:1px solid #000";
    document.body.appendChild(img);
  }
  const chunkRenderer = new ChunkRenderer(world, material, scene);
  chunkRenderer.buildAll();
  // halo das tochas (cp23): visual puro, segue o mundo autoritativo
  const torchGlow = new TorchGlow(scene);
  torchGlow.setFromWorld(world);

  // regiões nomeadas (cp11): wireframes — o servidor só manda pra professor
  const regionRenderer = new RegionRenderer(scene);
  regionRenderer.setRegions(latestRegions);
  applyRegions = (regions) => {
    regionRenderer.setRegions(regions);
    regionRenderer.clearCorners(); // região criada/apagada: rascunho já era
  };

  // claims (cp24): áreas protegidas — wireframe laranja pra TODOS (todo mundo vê
  // onde não pode mexer). A varinha do aluno usa o mesmo regionRenderer (cantos).
  const claimRenderer = new RegionRenderer(scene, 0xff8c1a);
  const drawClaims = (claims: Claim[]): void => {
    claimRenderer.setRegions(claims.map((c) => ({ nome: c.dono, min: c.min, max: c.max })));
  };
  drawClaims(latestClaims);
  applyClaims = (claims) => {
    drawClaims(claims);
    regionRenderer.clearCorners(); // claim criado: os cantos-rascunho da varinha já eram
    // proteção desligada no meio do jogo: tira o aluno do modo varinha (senão a
    // tecla R fica travada — o guard não deixa reentrar sem proteção ligada)
    if (!claimsAtivo && papel !== "professor" && varinhaAtiva) varinhaAtiva = false;
    refreshHotbar(); // a dica da varinha muda conforme a proteção liga/desliga
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

  // painéis do cp14: professor = autoria; aluno = grupos. O painel só COMPÕE
  // comandos de chat — decisão continua 100% no servidor.
  const sendCmd = (text: string): void =>
    activeConn.send(JSON.stringify({ type: "chat", text }));
  const onPanelToggle = (open: boolean): void => {
    if (open) document.exitPointerLock();
    else input.lock();
    updateOverlay();
  };
  activePanel =
    papel === "professor"
      ? new AuthorPanel(sendCmd, onPanelToggle)
      : new GroupPanel(sendCmd, onPanelToggle);
  pushPanelData();
  input.onKey(settings.keys.painel, () => {
    if (chat.open) return;
    // painel do aluno só abre DEPOIS do professor criar grupos (decisão do MVP v2)
    if (papel !== "professor" && latestGroups.length === 0) {
      chat.addMessage("jogo", "o professor ainda não criou grupos — o painel abre quando existirem");
      return;
    }
    inventoryPanel?.hide(); // um painel por vez na tela
    activePanel?.toggle();
  });
  if (papel === "professor") {
    chat.addMessage("jogo", `tecla ${keyLabel(settings.keys.painel)} abre o painel de autoria`);
  }

  // Spawn vem do SERVIDOR (fixo, do terreno pristino) — o snapshot pode já
  // estar escavado, então findSpawnY local daria outro lugar (bug-010).
  // Fallback local só se a mensagem spawn não chegou (não deve acontecer).
  let spawn = serverSpawn ?? {
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

  /**
   * cp19 — o professor trocou a aula: o mundo inteiro chega de novo, com o jogo
   * rodando. Cuidado com o que o servidor NÃO reenvia: um mundo sem regiões (ou
   * sem objetivos) não manda mensagem alguma sobre elas, então o que sobrou do
   * mundo anterior ficaria de fantasma na tela. Por isso zeramos aqui e deixamos
   * as mensagens seguintes (regiões, grupo, objetivos, teleporte) repovoarem.
   */
  reloadWorld = (novo) => {
    world = novo.world;
    chunkRenderer.trocarMundo(world);
    torchGlow.setFromWorld(world);

    latestRegions = [];
    regionRenderer.setRegions([]);
    regionRenderer.clearCorners();
    latestObjectives = null;
    applyObjectiveBoxes?.([]);
    // lista vazia = o painel de objetivos se esconde sozinho
    objectivesUi.update("livre", [], {
      grupo: null,
      professor: papel === "professor",
      painelKey: keyLabel(settings.keys.painel),
    });
    knownComplete.clear();
    objectivesSeeded = false; // o 1º objetivo do mundo novo não é "conquista"
    latestGroups = [];
    myGrupo = null;
    pushPanelData();

    // o teleporte chega logo atrás e põe o jogador no lugar certo; isto é a rede
    // de segurança caso ele se perca (mundo novo pode ser menor que o antigo)
    spawn = serverSpawn ?? spawn;
    respawn();
    chat.addMessage("jogo", "a aula mudou — mundo novo carregado");
  };

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
    torchGlow.onBlockChanged(msg.x, msg.y, msg.z, msg.blockId);
    // gatilho de som (áudio pluga depois); areia caindo dispara os dois por tick
    emitGameEvent(
      msg.blockId === BlockId.Air
        ? { kind: "block_broken" }
        : { kind: "block_placed", blockId: msg.blockId },
    );
  };

  // /regiao encher em lote (cp23b): a caixa inteira chega numa mensagem só —
  // aplica os bytes e remesha cada chunk tocado UMA vez (não uma por bloco)
  applyBlocksFilled = (msg) => {
    for (let y = msg.y0; y <= msg.y1; y++)
      for (let z = msg.z0; z <= msg.z1; z++)
        for (let x = msg.x0; x <= msg.x1; x++) setBlock(world, x, y, z, msg.blockId);
    const min = { x: msg.x0, y: msg.y0, z: msg.z0 };
    const max = { x: msg.x1, y: msg.y1, z: msg.z1 };
    chunkRenderer.remeshBox(min, max);
    torchGlow.onRegionFilled(min, max, msg.blockId);
    // UM gatilho de som pro lote inteiro (não milhares)
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
    /** Plaquinha de nome sobre a cabeça (filha da mesh; Sprite sempre encara a câmera). */
    label?: THREE.Sprite;
    labelName?: string;
  }
  const remotePlayers = new Map<number, RemotePlayer>();
  // Plaquinha desenhada num canvas (zero assets, mesma regra do atlas):
  // texto branco sobre fundo escuro translúcido, visível através de parede
  // (convenção Minecraft — e o professor acha o aluno atrás do bloco).
  const makeNameSprite = (name: string): THREE.Sprite => {
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
  };
  const disposeLabel = (rp: RemotePlayer): void => {
    if (!rp.label) return;
    rp.label.material.map?.dispose();
    rp.label.material.dispose();
    rp.mesh.remove(rp.label);
    rp.label = undefined;
  };
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
    // nome viaja no player_moved (ausente = host antigo, caixa fica sem nome)
    if (msg.name && msg.name !== rp.labelName) {
      disposeLabel(rp);
      rp.label = makeNameSprite(msg.name);
      rp.labelName = msg.name;
      rp.mesh.add(rp.label);
    }
    // pos do servidor = pés do jogador; BoxGeometry é centrada
    rp.target.set(msg.x, msg.y + PLAYER.height / 2, msg.z);
    rp.targetYaw = msg.yaw;
  };
  applyPlayerLeft = (id) => {
    const rp = remotePlayers.get(id);
    if (!rp) return;
    disposeLabel(rp);
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

  // cp16: hotbar virou 9 SLOTS configuráveis (persistem no navegador via
  // localStorage); o inventário (tecla E) escolhe o bloco de cada slot.
  // A lista de colocáveis segue em blocksUi.ts (painel de autoria usa a mesma).
  // papel já chegou no spawn (antes do snapshot que dispara startGame): a
  // hotbar do aluno nunca oferece rocha-matriz, nem por slot salvo antigo.
  const HOTBAR_KEY = "lj-hotbar";
  const meusBlocos = placeableFor(papel);
  const defaultHotbar = (): number[] => meusBlocos.slice(0, 9).map((b) => b.id);
  const loadHotbar = (): number[] => {
    // defensivo por slot: id fora da lista (ou config velha) cai no default
    const valid = new Set<number>(meusBlocos.map((b) => b.id));
    const def = defaultHotbar();
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(HOTBAR_KEY) ?? "null");
      if (!Array.isArray(raw)) return def;
      return def.map((d, i) => {
        const v: unknown = raw[i];
        return typeof v === "number" && valid.has(v) ? v : d;
      });
    } catch {
      return def;
    }
  };
  const hotbar = loadHotbar();
  let selected = 0;
  // varinha (cp11, só professor): cliques viram marcas de canto de região
  let varinhaAtiva = false;
  const hotbarEl = document.getElementById("hotbar");
  // ícones recortados do próprio texture atlas (blockIcons.ts)
  const icons = makeBlockIcons(
    material.map?.image as HTMLCanvasElement,
    PLACEABLE.map((b) => b.id),
  );
  const blockName = (id: number): string => PLACEABLE.find((b) => b.id === id)?.name ?? "?";
  const refreshHotbar = (): void => {
    if (!hotbarEl) return;
    // nomes/ícones são constantes do código (sem input externo) — innerHTML ok aqui
    if (varinhaAtiva) {
      const criar = papel === "professor" ? "/regiao criar nome" : "/claim criar";
      hotbarEl.innerHTML =
        `<b>[varinha]</b> esq = canto 1 · dir = canto 2 · ${criar} · R volta`;
      return;
    }
    const slots = hotbar
      .map((id, i) => {
        const sel = i === selected ? " sel" : "";
        return `<span class="slot${sel}"><small>${i + 1}</small><img src="${icons.get(id) ?? ""}" alt=""></span>`;
      })
      .join("");
    hotbarEl.innerHTML =
      `<span class="bar-nome">${blockName(hotbar[selected] ?? BlockId.Grass)}</span>` +
      `<span class="slots">${slots}</span>`;
    inventoryPanel?.refresh();
  };
  refreshHotbar();
  input.onKey(settings.keys.varinha, () => {
    // professor: varinha p/ regiões (sempre). aluno: só com a proteção de áreas
    // ligada (cp24), pra marcar o próprio claim.
    if (papel !== "professor" && !claimsAtivo) return;
    varinhaAtiva = !varinhaAtiva;
    refreshHotbar();
  });
  // 1–9 escolhe o slot; scroll cicla os 9 slots
  for (let i = 0; i < 9; i++) {
    input.onKey(`Digit${i + 1}`, () => {
      selected = i;
      refreshHotbar();
    });
  }
  input.onWheel((dir) => {
    selected = (selected + dir + hotbar.length) % hotbar.length;
    refreshHotbar();
  });

  // inventário (cp16): grade de todos os colocáveis → slot selecionado
  inventoryPanel = new InventoryPanel(
    icons,
    () => meusBlocos,
    () => ({ hotbar, selected }),
    (blockId) => {
      hotbar[selected] = blockId;
      localStorage.setItem(HOTBAR_KEY, JSON.stringify(hotbar));
      refreshHotbar();
    },
    (slot) => {
      selected = slot;
      refreshHotbar();
    },
    (open) => {
      if (open) {
        activePanel?.hide(); // um painel por vez na tela
        document.exitPointerLock();
      } else input.lock();
      updateOverlay();
    },
  );
  input.onKey(settings.keys.inventario, () => {
    if (chat.open) return;
    inventoryPanel?.toggle();
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
    // cp23: clique direito em bloco INTERATIVO (porta) interage, não coloca —
    // convenção Minecraft; o servidor alterna as duas metades
    if (isPorta(getBlock(world, target.x, target.y, target.z))) {
      activeConn.send(
        JSON.stringify({ type: "use_block", x: target.x, y: target.y, z: target.z }),
      );
      return;
    }
    let blockId = hotbar[selected];
    if (blockId === undefined) return;
    // porta na mão: o EIXO sai da direção do olhar (a lâmina fecha a passagem
    // que o jogador está encarando)
    if (blockId === BlockId.PortaXFechada || blockId === BlockId.PortaZFechada) {
      blockId =
        Math.abs(Math.sin(input.yaw)) > Math.abs(Math.cos(input.yaw))
          ? BlockId.PortaXFechada
          : BlockId.PortaZFechada;
    }
    activeConn.send(
      JSON.stringify({
        type: "place_block",
        x: target.x + target.nx,
        y: target.y + target.ny,
        z: target.z + target.nz,
        blockId,
      }),
    );
  });

  // botão do meio = copiar o bloco mirado pro slot atual (pedido do usuário)
  input.onMouseButton(1, () => {
    if (!target || varinhaAtiva) return;
    let id = getBlock(world, target.x, target.y, target.z);
    // qualquer porta copiada vira a entrada única "porta" da hotbar (o eixo
    // é re-escolhido pelo olhar na hora de colocar)
    if (isPorta(id)) id = BlockId.PortaXFechada;
    if (!isPlaceable(id)) return; // ar/porta-aberta e afins não vão pra mão
    if (isProfessorOnly(id) && papel !== "professor") return; // aluno não copia rocha-matriz
    hotbar[selected] = id;
    localStorage.setItem(HOTBAR_KEY, JSON.stringify(hotbar));
    refreshHotbar();
  });

  // controles de toque (tablet): joystick/arrasto/botões sintetizam o MESMO
  // input do teclado+mouse — o loop e os handlers acima não mudam
  if (isTouchDevice()) {
    if (hotbarEl) {
      hotbarEl.style.pointerEvents = "auto"; // hotbar tocável escolhe o slot
      hotbarEl.addEventListener("click", (e) => {
        const slot = e.target instanceof HTMLElement ? e.target.closest(".slot") : null;
        const idx = slot?.parentElement
          ? Array.from(slot.parentElement.children).indexOf(slot)
          : -1;
        if (idx < 0) return;
        selected = idx;
        refreshHotbar();
      });
    }
    touchControls = new TouchControls(input, {
      keys: () => settings.keys,
      quebrar: () => input.press(0),
      colocar: () => input.press(2),
      copiar: () => input.press(1),
      inventario: () => inventoryPanel?.toggle(),
      chat: () => {
        if (chat.open) return;
        document.exitPointerLock();
        chat.openInput(); // foco no campo → teclado virtual sobe sozinho
      },
      menu: () => {
        // pausa no toque: sai do modo toque → o overlay (menu Esc) aparece
        input.touch = false;
        showOverlayMain();
        updateOverlay();
      },
    });
    updateOverlay();
  }

  const hud = new Hud(renderer, {
    checkpoint: 14,
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
  // corrida por duplo-toque no andar: latch fica armado até soltar a tecla
  let sprintLatch = false;
  let forwardWasDown = false;
  let lastForwardTap = 0;
  // voo por duplo-toque no pular (só quem pode voar)
  let jumpWasDown = false;
  let lastJumpTap = 0;
  // altura do olho com transição suave (agachar abaixa a câmera)
  let eyeHeight = PLAYER.eyeHeight;
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const dtMs = now - last;
    last = now;
    const dt = Math.min(dtMs / 1000, 0.05);

    const forward = input.active
      ? (input.down(settings.keys.forward) ? 1 : 0) - (input.down(settings.keys.back) ? 1 : 0)
      : 0;
    const strafe = input.active
      ? (input.down(settings.keys.right) ? 1 : 0) - (input.down(settings.keys.left) ? 1 : 0)
      : 0;
    const jump = input.active && input.down(settings.keys.jump);

    const forwardDown = input.active && input.down(settings.keys.forward);
    if (forwardDown && !forwardWasDown) {
      if (now - lastForwardTap < 300) sprintLatch = true;
      lastForwardTap = now;
    }
    if (!forwardDown) sprintLatch = false;
    forwardWasDown = forwardDown;

    const sneak = input.active && input.down(settings.keys.agachar);
    const sprint =
      forward > 0 && !sneak && (sprintLatch || (input.active && input.down(settings.keys.correr)));

    // duplo-toque no pular alterna o voo (só quem pode voar); em voo, pular sobe
    if (jump && !jumpWasDown) {
      if (podeVoar() && now - lastJumpTap < 300) flying = !flying;
      lastJumpTap = now;
    }
    jumpWasDown = jump;
    const fly = flying && podeVoar();

    stepPlayer(world, player, { forward, strafe, jump, yaw: input.yaw, sprint, sneak, fly }, dt);
    if (player.pos.y < -16) respawn(); // caiu da borda do mundo

    // jogadores remotos deslizam até o último update (suave mesmo a 10 Hz);
    // fator exponencial = independente do FPS (~90% do caminho em ~190 ms)
    const k = 1 - Math.exp(-dt * 12);
    for (const rp of remotePlayers.values()) {
      rp.mesh.position.lerp(rp.target, k);
      const dyaw = rp.targetYaw - rp.mesh.rotation.y;
      rp.mesh.rotation.y += Math.atan2(Math.sin(dyaw), Math.cos(dyaw)) * k;
    }

    // olho abaixa agachado; FOV abre correndo — transições suaves (independem do FPS)
    const kCam = 1 - Math.exp(-dt * 20);
    eyeHeight += ((sneak && !fly ? PLAYER.sneakEyeHeight : PLAYER.eyeHeight) - eyeHeight) * kCam;
    // FOV segue a corrida ENGATADA (player.sprinting), não a tecla: soltar o
    // Ctrl segurando o W continua correndo — o FOV tem que continuar aberto
    const fovAlvo = settings.fov * (player.sprinting ? 1.1 : 1);
    if (Math.abs(camera.fov - fovAlvo) > 0.01) {
      camera.fov += (fovAlvo - camera.fov) * kCam;
      camera.updateProjectionMatrix();
    }
    camera.position.set(player.pos.x, player.pos.y + eyeHeight, player.pos.z);
    camera.rotation.set(input.pitch, input.yaw, 0);

    // mira: raycast local (visual) — decisão continua no servidor
    camera.getWorldDirection(lookDir);
    target = input.active
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
    skyCycle.update(dt); // ciclo dia/noite (cp21): avança o céu e pinta a cena
    hud.frame(dtMs);
    renderer.render(scene, camera);
  });

  // ?painel na URL: abre o painel já no boot (verificação headless do cp14)
  if (new URLSearchParams(location.search).has("painel")) activePanel?.toggle();
  if (new URLSearchParams(location.search).has("inv")) inventoryPanel?.toggle();
  // ?touch (teste no desktop/headless): entra direto no modo toque, sem tap
  if (bootParams.has("touch")) startPlay();
}
