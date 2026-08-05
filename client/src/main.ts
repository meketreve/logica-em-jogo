import * as THREE from "three";
import {
  BlockId,
  type Claim,
  type GroupDef,
  type NamedRegion,
  type Modo,
  type ObjectiveState,
  PLAYER,
  PLAYER_REACH,
  STEP_HEIGHT,
  type RayHit,
  SERVER_TICK_RATE,
  type ScenarioModo,
  type Snapshot,
  ITEM_BALDE_AGUA,
  ITEM_BALDE_VAZIO,
  ITEM_CARVAO,
  ITEM_DIAMANTE,
  ITEM_FRUTA,
  ITEM_GRAVETO,
  ITEM_PAO,
  ITEM_TRIGO,
  acenderColuna,
  atualizarBloco,
  blockSelectionBox,
  createPlayer,
  criarLuz,
  decodeSnapshot,
  descartarColunaLuz,
  findSpawnY,
  getBlock,
  isBalde,
  isCadeira,
  isComida,
  isCama,
  isInterativo,
  isJanela,
  isPlaceable,
  isPorta,
  isProfessorOnly,
  isQuadro,
  isSlab,
  isSofa,
  isStairs,
  escadaId,
  slabMaterial,
  slabTop,
  stairsMaterial,
  type QuadroConteudo,
  type ColunaRef,
  COLUNAS_MAGIC,
  LAZY_MAGIC,
  ROCHA_HEIGHT,
  SAND_HEIGHT,
  SNOW_HEIGHT,
  biomaPorClima,
  climaAt,
  decodeColunas,
  decodeLazyInfo,
  gramaPorClima,
  heightAt,
  parseServerMessage,
  parseWorldTamanho,
  peekMagic,
  podeVoarNoModo,
  raycastBlock,
  raycastJogador,
  relevoPorClima,
  setBlock,
  stepPlayer,
} from "@logica/shared";
import { AGUA_FRAMES, animarAguaAtlas, createAtlasTexture } from "./atlasTexture";
import { AguaFx } from "./aguaFx";
import { initUiAudio, playUi, setUiVolume } from "./audio";
import { BENCH_SEED, Bench, benchDaUrl, benchSettings } from "./bench";
import { makeBlockIcons } from "./blockIcons";
import { PLACEABLE, placeableFor } from "./blocksUi";
import { InventoryPanel } from "./inventory";
import { ChatUi } from "./chat";
import { ChunkRenderer } from "./chunks";
import { learnPlayers, learnWorlds } from "./commands";
import { SkyCycle } from "./daynight";
import { VentoCliente, aplicarBalanco, criarBalancoUniforms } from "./vento";
import { aplicarLuz, criarLuzUniforms } from "./luzShader";
import { type Connection, WorkerConnection, WsConnection } from "./connection";
import { emitGameEvent } from "./events";
import { Hud } from "./hud";
import { Input } from "./input";
import { LoadingScreen } from "./loading";
import {
  type MultiAuth,
  type PlayWorldChoice,
  buildConfigScreen,
  getPlayerName,
  showMenu,
} from "./menu";
import { ObjectivesUi } from "./objectivesUi";
import { Mochila } from "./mochila";
import { type VidaInfo, VitalsUi } from "./vitals";
import { FriendsPanel } from "./friends";
import { PlayersPanel } from "./players";
import { AuthorPanel, type GamePanel, GroupPanel, type PanelData } from "./panels";
import { RegionRenderer } from "./regions";
import { keyLabel, loadSettings } from "./settings";
import { QuadroEditor, QuadroRenderer } from "./quadros";
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
// Vento (§🌬️): `dir`/`forca` vêm do servidor 1×/s (msg `vento`); o VentoCliente
// suaviza por frame. Alimenta a correnteza da água, o scroll das nuvens e o
// balanço de folhas/grama. SÓ visual — não entra na física.
const vento = new VentoCliente();
// ?vento=1.57,0.8 na URL: força direção,força (par do ?hora — screenshot
// headless com o vento num rumo conhecido). Ignora o sync de rede enquanto ativo.
const ventoForcado = ((): { dir: number; forca: number } | null => {
  const raw = new URLSearchParams(location.search).get("vento");
  if (raw === null) return null;
  const [d, f] = raw.split(",").map(Number);
  if (d === undefined || !Number.isFinite(d)) return null;
  return { dir: d, forca: Number.isFinite(f) ? f! : 0.6 };
})();
if (ventoForcado) vento.sync(ventoForcado.dir, ventoForcado.forca, true);
/** Uniforms do balanço de folhas/grama — compartilhados com o material do
 *  terreno (criado lá embaixo, no startGame) e escritos 1×/frame. */
const balancoUniforms = criarBalancoUniforms();

const input = new Input(renderer.domElement);
// APARELHO de dedo, decidido uma vez no boot (o `input.touch` é o MODO e vai
// ligar/desligar durante a partida). É o que impede o clique no canvas de pedir
// pointer lock no tablet — ver a nota do `touchDevice` no input.ts (bug-572).
input.touchDevice = isTouchDevice();
// ?yaw=-1.57 e ?pitch=-0.4 na URL: apontam a câmera (screenshot headless — par do
// ?hora). Guardados em const pra VENCER o applyTeleport do spawn: o join reorienta
// pelo pos do servidor e, sem isso, a mira forçada se perdia (yaw não aplicava).
const numParam = (k: string): number | null => {
  const raw = new URLSearchParams(location.search).get(k);
  if (raw === null) return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
};
const yawForcado = numParam("yaw");
const pitchForcado = numParam("pitch");
if (yawForcado !== null) input.yaw = yawForcado;
if (pitchForcado !== null) input.pitch = pitchForcado;

/** Modo benchmark (`?bench`): trajeto fixo, config canônica, exporta sozinho.
 *  Lido aqui em cima porque o `applySettings` do boot já precisa dele. */
const benchOpts = benchDaUrl(new URLSearchParams(location.search));

/** (Re)aplica as configurações do jogador — chamada no boot e ao iniciar jogo
 *  (o menu pode ter mudado tudo antes do play). */
function applySettings(): ReturnType<typeof loadSettings> {
  // bench: a config do localStorage do PC do lab é desconhecida — sobrescreve
  // com a canônica (em memória, sem salvar) pra dois perfis serem comparáveis
  const s = benchOpts ? { ...loadSettings(), ...benchSettings(benchOpts) } : loadSettings();
  input.sensitivity = s.sensitivity;
  camera.fov = s.fov;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, s.pixelRatioCap));
  setUiVolume(s.volume);
  touchControls?.setScale(s.uiScale); // escala da UI de toque (2026-07-21)
  skyCycle.setNuvens(s.nuvens); // §🌬️ nuvens: config de DESEMPENHO (fill rate)
  return s;
}
/** Controles de toque (tablet) — criados no startGame só em dispositivo touch.
 *  Declarado AQUI, acima da chamada de applySettings(): ela lê `touchControls`
 *  pra escala da UI de toque; declarar depois = TDZ (tela cinza no boot, bug-495). */
let touchControls: TouchControls | null = null;
let settings = applySettings();
initUiAudio(settings.volume);

/** Painel do cp14 — criado no startGame conforme o papel (autoria OU grupo).
 *  Declarado ANTES do updateOverlay do boot (TDZ). */
let activePanel: GamePanel | null = null;
/** Inventário de blocos (cp16) — criado no startGame (precisa do atlas). */
let inventoryPanel: InventoryPanel | null = null;
/** Painel de jogadores (2026-07-21) — só professor (expulsar/banir/desbanir). */
let playersPanel: PlayersPanel | null = null;
/** Painel de amigos (2026-08-04) — de todo jogador; a interface do /amigos. */
let friendsPanel: FriendsPanel | null = null;
/** Último `friends` que o servidor mandou (o painel é puro consumo dele). */
let latestFriends: { equipe: { dono: string; membros: string[] } | null; convites: string[]; enviados: string[] } = {
  equipe: null,
  convites: [],
  enviados: [],
};
// touchControls: declarado lá em cima (acima de applySettings, TDZ — bug-495).

/** Tela de carregamento (§🕐) — cobre tudo do "jogar" até o mundo pronto.
 *  Declarada ANTES do updateOverlay (a condição dele lê `loading.ativo`) e
 *  fechada de dentro dela mesma, avisando aqui pra reavaliar o overlay. */
const loading = new LoadingScreen(() => {
  updateOverlay();
  hudAtual?.setFase("jogando"); // perfil: daqui pra frente a travada é SENTIDA
  hudAtual?.marcar("carga concluída"); // §📊 fim da espera do aluno na linha do tempo
  iniciarBench?.(); // ?bench: o trajeto só começa com o mundo na tela
});
/** ?bench: começa o trajeto (definido no startGame, disparado ao fim da carga). */
let iniciarBench: (() => void) | null = null;
/** ?bench em andamento — o menu de pausa não pode aparecer por cima do trajeto
 *  (sem pointer lock, `updateOverlay` mostraria o menu assim que a carga sai). */
let benchRodando = false;
/** Ponteiro pro HUD do jogo em andamento (o Hud nasce dentro do startGame, mas
 *  o callback da tela de carregamento é criado antes). */
let hudAtual: {
  setFase: (f: "carregando" | "jogando") => void;
  marcar: (evento: string, detalhe?: string) => void;
  toggle: () => void;
} | null = null;

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
  const panelOpen =
    (activePanel?.open ?? false) ||
    (inventoryPanel?.open ?? false) ||
    (playersPanel?.open ?? false) ||
    (friendsPanel?.open ?? false);
  // §🕐 `loading.ativo`: durante o carregamento o ponteiro NÃO está travado —
  // sem esta condição o menu de pausa aparecia junto com a tela de carga.
  overlay?.classList.toggle(
    "hidden",
    benchRodando || loading.ativo || input.active || chat.open || panelOpen,
  );
  // mira só existe COM o jogo no controle (pedido do usuário: invisível no Esc)
  crosshairEl?.classList.toggle("hidden", !input.active);
  if (input.locked) showOverlayMain(); // próximo Esc abre no painel principal
  // UI de toque acompanha: some sob menu de pausa, chat, painel ou carregamento
  touchControls?.setShown(input.touch && !chat.open && !panelOpen && !loading.ativo);
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
  for (const a of ["chat", "hud", "varinha", "painel", "inventario", "amigos"] as const) {
    input.rebind(oldKeys[a], settings.keys[a]);
  }
  enviarRaio(); // bug-211: mudar o raio na config precisa chegar no servidor
}

/** Raio de interesse já anunciado ao servidor (evita mandar msg repetida a cada
 *  mexida na config — `onChanged` roda a cada tecla/arrasto de slider). */
let raioEnviado = -1;

/**
 * Manda o raio de interesse (F2) pro servidor. **bug-211:** antes isso saía UMA
 * vez, logo após o join — aumentar o raio na config ao vivo só mudava a regra de
 * DESCARTE do cliente, o servidor seguia com o raio velho e o anel novo nunca
 * entrava no lote de `streamColunas` ("aumentar a distância não carrega chunk
 * novo, só mantém mais chunk renderizado"). Agora todo caminho que muda a config
 * reanuncia.
 */
function enviarRaio(): void {
  if (!conn || settings.raioRender === raioEnviado) return;
  const anterior = raioEnviado;
  raioEnviado = settings.raioRender;
  conn.send(JSON.stringify({ type: "radius", chunks: raioEnviado }));
  // §📊 marcador: mexer no raio muda o custo de tudo — um pico logo depois disto
  // tem causa, e o perfil precisa mostrar isso
  hudAtual?.marcar("raio", `${anterior < 0 ? "join" : anterior} → ${raioEnviado}`);
}

document.getElementById("overlay-voltar")?.addEventListener("click", () => startPlay());
document.getElementById("overlay-config-btn")?.addEventListener("click", () => {
  const body = document.getElementById("overlay-config-body");
  // reconstrói = estado atual; o "voltar" é da própria tela de config (um só)
  if (body) buildConfigScreen(body, onSettingsChanged, showOverlayMain);
  overlayMain?.classList.add("hidden");
  overlayConfig?.classList.remove("hidden");
});
// 2026-08-04: os dois desceram da barra de toque (que ficou só com o que é de
// jogo). Tela cheia exige gesto do usuário — o clique no botão É o gesto.
document.getElementById("overlay-telacheia")?.addEventListener("click", () => {
  solicitarTelaCheia();
});
document.getElementById("overlay-hud")?.addEventListener("click", () => {
  hudAtual?.toggle();
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

/** `/amigos` SEM subcomando abre o painel, no PC e no tablet (pedido do usuário
 *  em 2026-08-04). É a única porta que serve nos dois: a tecla G não existe no
 *  tablet e o botão 👥 só aparece com a proteção de áreas ligada — quem estava
 *  em mundo livre não tinha como chegar no painel. Digitar o comando é o gesto
 *  que o aluno já conhece, e ele passa a valer como "abrir".
 *  Com subcomando (`/amigos convidar bia`) segue pro servidor como sempre; sem
 *  painel ainda (antes do join) também, e aí o servidor responde no chat. */
function abrirAmigosPorComando(text: string): boolean {
  if (text.trim().toLowerCase() !== "/amigos") return false;
  if (!friendsPanel) return false;
  activePanel?.hide(); // um painel por vez na tela (mesma regra da tecla e do 👥)
  inventoryPanel?.hide();
  playersPanel?.hide();
  friendsPanel.toggle();
  return true;
}

// --- Chat (checkpoint 6): UI em HTML por cima do canvas; comando roda no servidor ---
const chat = new ChatUi(
  (text) => {
    if (abrirAmigosPorComando(text)) return;
    conn?.send(JSON.stringify({ type: "chat", text }));
  },
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
/** §📊 custo das REGRAS no servidor (última janela de 1 s) — só existe se o host
 *  for desta versão; host antigo não manda os campos e isto fica null. */
let regrasServidor: {
  celulasPorTick: number;
  celulasMaxTick: number;
  mudancasPorTick: number;
  aguaPorTick: number;
} | null = null;
// jitter de rede (2026-07-21): desvio-padrão do intervalo entre mensagens do
// servidor (janela deslizante) — mede a evenness da entrega/sincronia.
let ultimaMsgTs = 0;
const msgGaps: number[] = [];
function registrarChegadaDeRede(): void {
  const now = performance.now();
  if (ultimaMsgTs > 0) {
    msgGaps.push(now - ultimaMsgTs);
    if (msgGaps.length > 300) msgGaps.shift();
  }
  ultimaMsgTs = now;
}
function jitterDeRede(): number {
  const n = msgGaps.length;
  if (n < 2) return 0;
  const med = msgGaps.reduce((a, b) => a + b, 0) / n;
  const varc = msgGaps.reduce((a, b) => a + (b - med) ** 2, 0) / n;
  return Math.round(Math.sqrt(varc));
}
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
/** §🕐 troca de aula ANUNCIADA (antes do snapshot): sobe a tela de carregamento
 *  na hora, com o anel indeterminado — o host ainda vai salvar e gerar. */
let iniciarTroca: ((nome: string) => void) | null = null;
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
/** Modo de jogo EFETIVO deste jogador (§🍖 F1) — quem decide é o servidor
 *  (msg `modo`, mandada em todo join e a cada troca). Criativo até ele falar. */
let modoAtual: Modo = "criativo";
/** §🍖 F7: o ataque entre jogadores vale neste mundo? Chega junto do `modo`
 *  (campo opcional — host antigo não manda e fica false). Só decide se a mira
 *  fica vermelha e se o clique vira soco: a recusa continua sendo do servidor. */
let pvpLigado = false;
/** Posso voar? Sobrevivência NÃO voa (nem professor); em criativo, o professor
 *  sempre e o aluno só com o voo liberado pra turma. */
function podeVoar(): boolean {
  return podeVoarNoModo(modoAtual) && (papel === "professor" || vooLiberado);
}
/** §🍖 F2: corações e bolhas. Criado sob demanda (a 1ª mensagem `vida` chega
 *  só em sobrevivência) — mundo criativo não paga DOM nem CSS por isto. */
/** §🍖 F4: espelho do inventário autoritativo. Fica FORA do startGame porque
 *  a mensagem `inventario` chega pelo mesmo despacho da `vida`, que é de módulo;
 *  o `aoMudarMochila` é o gancho que o jogo pendura pra redesenhar a hotbar. */
const mochila = new Mochila();
let aoMudarMochila: (() => void) | null = null;
let vitalsUi: VitalsUi | null = null;
function vitals(): VitalsUi {
  vitalsUi ??= new VitalsUi();
  return vitalsUi;
}
/** Última mensagem `vida` do servidor — o HUD F3 lê daqui (§🍖 F3). */
let ultimaVida: VidaInfo | null = null;
// ?vida=7 (ou ?vida=7,45 com fôlego, ou ?vida=7,45,12 com fome) na URL: mostra o
// HUD de vida com valores FIXOS, sem servidor — é o par do ?hora/?vento/?atlas,
// pra inspeção visual e screenshot headless dos corações, bolhas e coxas. NÃO
// manda nada pro servidor e NÃO muda o modo: é só desenho local.
// CUIDADO: Number(null) === 0 — sem o param tem que dar null (bug-302).
const vidaForcada = ((): VidaInfo | null => {
  const raw = new URLSearchParams(location.search).get("vida");
  if (raw === null) return null;
  const [v, f, fome] = raw.split(",").map(Number);
  if (v === undefined || !Number.isFinite(v)) return null;
  return {
    vida: v,
    ...(Number.isFinite(f) ? { folego: f! } : {}),
    ...(Number.isFinite(fome) ? { fome: fome! } : {}),
  };
})();
if (vidaForcada) {
  vitals().setVisivel(true);
  vitals().aplicar(vidaForcada);
}
// §🍖 F4: `?mochila=3x64,4x12,1x5` enche a mochila LOCAL pra inspeção visual da
// hotbar de sobrevivência e da grade do inventário — o par do `?vida=`. Não
// manda nada pro servidor e não muda o modo: preenche a partir do slot 0, e um
// `-` pula o slot (`?mochila=3x64,-,1x5` deixa o segundo vazio).
{
  const raw = new URLSearchParams(location.search).get("mochila");
  if (raw !== null) {
    const slots: { slot: number; id: number; qtd: number }[] = [];
    raw.split(",").forEach((parte, i) => {
      const [id, qtd] = parte.split("x").map(Number);
      if (id === undefined || !Number.isInteger(id) || id <= 0) return;
      slots.push({ slot: i, id, qtd: Number.isInteger(qtd) && qtd! > 0 ? qtd! : 1 });
    });
    mochila.travar(slots);
  }
}
/** Última lista de regiões do servidor (chega só pra professor). */
let latestRegions: NamedRegion[] = [];
let applyRegions: ((regions: NamedRegion[]) => void) | null = null;
/** Anti-griefing (cp24): proteção de áreas ligada? + claims (TODOS recebem).
 *  Com a proteção ligada o aluno também usa a varinha (pra /claim criar). */
let claimsAtivo = false;
/** A dica da tecla do painel de amigos já saiu nesta sessão? (uma vez só) */
let dicaAmigosDada = false;
let latestClaims: Claim[] = [];
let applyClaims: ((claims: Claim[]) => void) | null = null;
/** Quadros (2026-07-19): conteúdo por posição — closures setados no startGame. */
let applyQuadros: ((lista: QuadroConteudo[]) => void) | null = null;
let applyQuadroChanged: ((c: QuadroConteudo) => void) | null = null;
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
/** Streaming (F2): lote binário de colunas chegou — aplicado pelo startGame. */
let aplicarColunas: ((buf: ArrayBuffer) => void) | null = null;
/** O snapshot/header decodificado por último era LAZY (LJE0)? O startGame e o
 *  reloadWorld leem isto pra ligar o modo streaming. */
let proximoLazy = false;

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

/** Painel de amigos: o `friends` do servidor + quem está online agora (que o
 *  main aprende do relay). Chamado dos DOIS lados — o feed muda quando o grupo
 *  muda, e a lista de online muda quando alguém entra ou sai da aula. */
function pushFriendsData(): void {
  friendsPanel?.update({
    eu: playerName(),
    equipe: latestFriends.equipe,
    convites: latestFriends.convites,
    enviados: latestFriends.enviados,
    online: [...new Set(nomesOnline.values())].sort(),
  });
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

/**
 * §🕐 Fila curta durante a troca de aula. O `mundo_trocando` e o snapshot novo
 * podem chegar no MESMO frame (medido: 1 ms de diferença quando o host tem
 * pouco o que salvar). Se processarmos o snapshot na hora, o navegador nunca
 * chega a PINTAR a tela de carregamento antes de travar no decode + troca de
 * malha — e o aluno vê exatamente o que ele reclamou: nada, nada, e de repente
 * "quase pronto". Segurando as mensagens por dois frames, a tela aparece
 * primeiro. `null` = fila desligada (o caso normal).
 */
let filaTroca: (string | ArrayBuffer)[] | null = null;

function drenarFilaTroca(): void {
  const fila = filaTroca;
  if (!fila) return;
  filaTroca = null; // ANTES de reprocessar: senão cada mensagem voltaria pra fila
  for (const d of fila) handleServerData(d);
}

/** Segura o que vier até a tela de troca ter sido pintada. */
function segurarAteATelaPintar(): void {
  if (filaTroca) return;
  filaTroca = [];
  // 2× rAF = o frame COM a tela já foi pintado. O setTimeout é rede de
  // segurança: aba em segundo plano não roda rAF, e a turma não pode ficar
  // presa numa fila que nunca drena.
  requestAnimationFrame(() => requestAnimationFrame(drenarFilaTroca));
  setTimeout(drenarFilaTroca, 500);
}

function handleServerData(data: string | ArrayBuffer): void {
  if (filaTroca) {
    filaTroca.push(data);
    return;
  }
  registrarChegadaDeRede(); // jitter: gap entre mensagens do servidor
  // §🕐 primeira resposta do servidor = conectado e aceito no jogo; o que falta
  // daqui pra frente é o MUNDO (o snapshot denso vem num blob só e demora)
  if (!started) loading.setFase("mundo");
  if (typeof data === "string") {
    const msg = parseServerMessage(data);
    if (!msg) return;
    if (msg.type === "debug_stats") {
      debugStats = { tickAvgMs: msg.tickAvgMs, tickMaxMs: msg.tickMaxMs };
      // §📊 regras (água/areia) do outro lado: liga o remesh caro daqui à causa
      // de lá. Campos opcionais — host de versão antiga simplesmente não manda.
      regrasServidor =
        msg.regrasCelulasAvg === undefined
          ? null
          : {
              celulasPorTick: msg.regrasCelulasAvg,
              celulasMaxTick: msg.regrasCelulasMax ?? 0,
              mudancasPorTick: msg.regrasMudancasAvg ?? 0,
              aguaPorTick: msg.regrasAguaAvg ?? 0,
            };
    } else if (msg.type === "block_changed") {
      applyBlockChanged?.(msg);
    } else if (msg.type === "blocks_filled") {
      applyBlocksFilled?.(msg);
    } else if (msg.type === "player_moved") {
      // autocomplete de nomes (Tab): quem está online, aprendido do relay
      if (msg.name && nomesOnline.get(msg.id) !== msg.name) {
        nomesOnline.set(msg.id, msg.name);
        learnPlayers([...new Set(nomesOnline.values())]);
        pushFriendsData(); // quem entrou vira candidato a convite
      }
      applyPlayerMoved?.(msg);
    } else if (msg.type === "player_left") {
      nomesOnline.delete(msg.id);
      learnPlayers([...new Set(nomesOnline.values())]);
      pushFriendsData(); // quem saiu some da lista de convidar
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
    } else if (msg.type === "quadros") {
      applyQuadros?.(msg.lista);
    } else if (msg.type === "quadro_changed") {
      applyQuadroChanged?.(msg);
    } else if (msg.type === "claims") {
      // cp24: proteção de áreas — wireframes pra todo mundo + habilita a varinha
      // do aluno quando ligada. O servidor é quem barra a edição de fato.
      claimsAtivo = msg.ativo;
      // a proteção acabou de ligar: é a única hora em que "quem pode construir
      // na minha área" vira pergunta — e é aqui que o painel de amigos existe
      // pra responder. Uma vez por sessão (a lista de claims re-emite a cada
      // área criada, e repetir a dica viraria ruído no meio da aula).
      if (msg.ativo && !dicaAmigosDada) {
        dicaAmigosDada = true;
        chat.addMessage(
          "jogo",
          `tecla ${keyLabel(settings.keys.amigos)} abre o painel de amigos — quem está no seu grupo constrói na sua área`,
        );
      }
      latestClaims = msg.claims;
      applyClaims?.(msg.claims); // o closure lê claimsAtivo (já atualizado acima)
    } else if (msg.type === "friends") {
      // cp24: grupo de amigos + convites. O feedback textual segue chegando por
      // chat do servidor; o PAINEL (2026-08-04) é puro consumo deste estado.
      latestFriends = { equipe: msg.equipe, convites: msg.convites, enviados: msg.enviados };
      pushFriendsData();
    } else if (msg.type === "players") {
      // 2026-07-21: painel de jogadores do professor (conectados + banidos)
      playersPanel?.update({ conectados: msg.conectados, banidos: msg.banidos });
    } else if (msg.type === "mundo_trocando") {
      // chega ANTES do snapshot: o host ainda vai salvar a aula atual e montar
      // a nova (segundos). Sem isto a tela só aparecia no fim, "quase pronta".
      iniciarTroca?.(msg.nome);
      segurarAteATelaPintar(); // e o snapshot espera a tela pintar
    } else if (msg.type === "teleport") {
      applyTeleport?.(msg);
    } else if (msg.type === "time") {
      // ?hora= na URL congela o céu local (inspeção visual — ver ?atlas)
      if (horaForcada === null) skyCycle.sync(msg.hora, msg.ciclo);
    } else if (msg.type === "vento") {
      // ?vento= na URL congela o vento local (mesma lógica do ?hora)
      if (ventoForcado === null) vento.sync(msg.dir, msg.forca, msg.ativo);
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
    } else if (msg.type === "modo") {
      // §🍖 F1: por enquanto o modo só decide rótulo e VOO — vida/fome/craft
      // entram nas frentes seguintes lendo daqui.
      const mudou = modoAtual !== msg.efetivo;
      modoAtual = msg.efetivo;
      pvpLigado = msg.pvp === true; // §🍖 F7: ausente (host antigo) = desligado
      if (!podeVoar()) flying = false; // entrou em sobrevivência voando: cai
      // §🍖 F2: corações só existem em sobrevivência (o ?vida força e vence,
      // como o ?hora vence o sync do céu)
      if (vidaForcada === null) {
        if (msg.efetivo === "sobrevivencia") vitals().setVisivel(true);
        else vitalsUi?.setVisivel(false);
      }
      // §🍖 F4: voltar pra criativo devolve a paleta infinita na hora. O
      // caminho de ida NÃO é aqui — é a mensagem `inventario`, que o servidor
      // manda logo em seguida (ele é quem sabe o que tem na mochila).
      if (msg.efetivo === "criativo" && mochila.ativa) {
        mochila.desligar();
        aoMudarMochila?.();
      }
      if (mudou) {
        chat.addMessage(
          "jogo",
          msg.efetivo === "sobrevivencia"
            ? "modo sobrevivência — não dá para voar"
            : "modo criativo",
        );
      }
    } else if (msg.type === "inventario") {
      // §🍖 F4: o servidor é dono da mochila; o cliente só espelha e redesenha.
      mochila.aplicar(msg.slots);
      aoMudarMochila?.();
    } else if (msg.type === "vida") {
      // §🍖 F2: a UI nunca decide — quem machuca, cura e mata é o servidor
      if (vidaForcada !== null) return; // ?vida= congela o HUD (inspeção)
      ultimaVida = msg; // §🍖 F3: o F3 (tecla) mostra vida/fome do servidor
      vitals().aplicar(msg);
      if (msg.causa) emitGameEvent({ kind: "dano" });
      if (msg.morreu) {
        emitGameEvent({ kind: "morte" });
        chat.addMessage(
          "jogo",
          msg.causa === "queda"
            ? "você caiu de muito alto — voltou ao ponto de partida"
            : msg.causa === "afogamento"
              ? "você ficou sem ar — voltou ao ponto de partida"
              : msg.causa === "fome"
                ? "você passou fome demais — voltou ao ponto de partida"
                : msg.causa === "pvp"
                  ? "você foi derrubado por outro jogador — voltou ao ponto de partida"
                  : "você não sobreviveu — voltou ao ponto de partida",
        );
      }
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
  // roteamento binário (F2): LJW0 = mundo inteiro; LJE0 = header de mundo
  // ENORME (colunas viajam depois); LJC0 = lote de colunas do streaming
  const magic = peekMagic(data);
  if (magic === COLUNAS_MAGIC) {
    aplicarColunas?.(data);
    return;
  }
  const decodificar = (): Snapshot => {
    proximoLazy = magic === LAZY_MAGIC;
    return proximoLazy ? decodeLazyInfo(data) : decodeSnapshot(data);
  };
  if (started) {
    // segundo snapshot EM JOGO = o professor trocou a aula (cp19). O que vem
    // depois (regiões, grupos, objetivos, teleporte) repovoa a tela.
    reloadWorld?.(decodificar());
    return;
  }
  started = true;
  startGame(decodificar());
}

// --- Iniciar jogo (menu ou URL escolhem o hospedeiro) ---

function connect(c: Connection, auth?: MultiAuth): void {
  settings = applySettings(); // menu pode ter mudado config antes do play
  conn = c;
  // §🕐 tela de carregamento entra ANTES do join: daqui até o snapshot só havia
  // canvas preto. Já mostra taxa/recebido (os contadores da conexão existem
  // desde o primeiro byte); colunas só depois que o mundo chega (startGame).
  loading.abrir({ host: serverHostLabel, rede: !(c instanceof WorkerConnection) });
  loading.observar(() => ({
    bytes: c.stats.bytesIn + c.stats.bytesOut,
    prontas: 0,
    total: 0,
    faltando: 0,
    fila: 0,
  }));
  updateOverlay(); // esconde o menu de pausa por baixo da tela de carga
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
  // F2 streaming: raio de interesse (config de desempenho) — depois do join
  // (transporte preserva ordem); em mundo denso o servidor só ignora
  raioEnviado = -1; // conexão nova = servidor novo, reanuncia mesmo se igual
  enviarRaio();
}

function startMultiplayer(url: string, auth: MultiAuth): void {
  serverHostLabel = url;
  // em rede quem salva é o host — o botão só volta pro menu
  const sair = document.getElementById("btn-sair");
  if (sair) sair.textContent = "voltar ao menu";
  // §🕐 servidor fora do ar / IP errado: sem isto o aluno fica olhando o
  // spinner pra sempre. Queda EM JOGO segue como era (o mundo já está na tela).
  const aoFalhar = (motivo: string): void => {
    if (started || !loading.ativo) return;
    loading.erro(motivo, () => {
      // mesmo caminho do join_denied: o motivo vira banner no menu depois do reload
      sessionStorage.setItem("lj-erro", `${motivo} (${url})`);
      location.href = location.pathname;
    });
  };
  connect(new WsConnection(url, aoFalhar), auth);
}

function startSingleplayer(choice: PlayWorldChoice, seedFixa?: number): void {
  currentWorld = { id: choice.id, name: choice.name, createdAt: choice.createdAt };
  serverHostLabel = `web-worker (${choice.name})`;
  const wc = new WorkerConnection(
    new Worker(new URL("../../server/src/worker.ts", import.meta.url), {
      type: "module",
    }),
  );
  // mundo novo = seed aleatória; mundo existente = bytes do IndexedDB.
  // `seedFixa` só vem do `?bench` (mundo idêntico em toda máquina do lab).
  const seed = seedFixa ?? crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;
  wc.init({
    save: choice.data ?? undefined,
    seed,
    preset: choice.preset,
    tamanho: choice.tamanho,
    // §🍖 F9: só o mundo NOVO usa; save carregado traz o modo do próprio .ljw
    sobrevivencia: choice.sobrevivencia,
  });
  connect(wc);
}

/** Grava o mundo singleplayer no IndexedDB (autosave e botão sair). O mundo
 *  ENORME (lazy) grava um save ESPARSO (F3) — só os chunks editados. */
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
} else if (benchOpts) {
  // ?bench sem ?server: mundo NOVO de seed fixa, sem passar pelo menu — o PC do
  // lab abre o link e pronto. O mundo não vai pro IndexedDB (id fora do padrão
  // do menu e sem `putWorld` até o autosave, que o bench não deixa chegar).
  startSingleplayer(
    {
      id: `bench-${BENCH_SEED}`,
      name: "benchmark",
      createdAt: 0,
      data: null,
      preset: "normal",
      // E (ENORME, lazy) por padrão: é o mundo que exercita o caminho inteiro —
      // streaming + mesher + render. Num mundo denso o mesher já terminou antes
      // do trajeto começar, e a medida sairia sem a parte que mais varia entre
      // máquinas. `?tamanho=P|M|G` mede só render.
      tamanho: parseWorldTamanho(bootParams.get("tamanho") ?? "E"),
    },
    BENCH_SEED,
  );
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
  let worldSeed = snap.seed; // clima/bioma do F3 derivam da seed (funções puras)
  /**
   * §💡 Grade de luz voxel — paralela ao mundo, do MESMO tamanho, e 100% do
   * cliente: é função pura dos bytes, então o servidor não gasta banda nem tick
   * pra mandar o que os dois lados derivam igual. Acende por COLUNA, no mesmo
   * ritmo do streaming (`acenderColuna` logo abaixo de `enfileirarColuna`).
   */
  /** `?semluz` desliga a luz voxel INTEIRA (o mesher volta a pintar tudo aceso,
   *  que é como o jogo era antes do §💡). É o lado B do A/B — mesmo papel do
   *  `?semvida` e do `?semworker`: sem um par medido na MESMA máquina, "a luz
   *  custa X" ou "a luz causa Y" é anedota. */
  const semLuz = new URLSearchParams(location.search).has("semluz");
  let luzWorld = criarLuz(world.dims);
  /**
   * §💡 Colunas esperando a luz. Mesma disciplina da fila de mesh: o handler da
   * rede só ENFILEIRA, o loop de render drena sob orçamento de tempo. A ordem
   * importa — a coluna só vai pra fila de mesh DEPOIS de acesa, senão a
   * geometria nasce clara e escurece num segundo remesh (pisca).
   */
  const filaLuz: { cx: number; cz: number }[] = [];
  const filaLuzSet = new Set<number>();
  /** Custo acumulado da luz, pro F3/perfil (main thread — é onde ela roda). */
  let luzMsTotal = 0;
  let luzColunas = 0;
  // F2 streaming: mundo ENORME chega vazio (LJE0) e as colunas viajam depois
  let mundoLazy = proximoLazy;
  /** Colunas carregadas (chave cz*dims.x+cx) — espelha a regra do servidor:
   *  além de raio+folga, descarta (bytes + geometria) e o servidor re-envia
   *  quando voltar. */
  let colunasCarregadas = new Set<number>();
  let frameCount = 0; // varredura de descarte roda 1×/s (a cada 60 frames)
  /** §🔁 rede de segurança: coluna DENTRO do raio que não chegou (lote perdido,
   *  decode falhou, mesh falhou). `proximo` = quando pedir de novo (backoff). */
  const colunasFaltando = new Map<number, { tentativas: number; proximo: number }>();
  let repedidas = 0; // total de `pedir_coluna` mandados (F3)
  /** Colunas APLICADAS desde o boot e distância andada — só o perfil usa: viram
   *  delta na janela de 10 s e dizem se a gravação foi voando ou parado. */
  let colunasRecebidas = 0;
  let distanciaPercorrida = 0;
  // alphaTest = cutout dos transparentes (vidro/folhas): pixel opaco ou
  // descartado — sem blending, sem sorting, mesmo draw call por chunk (cp18)
  const atlas = createAtlasTexture();
  const material = new THREE.MeshLambertMaterial({
    map: atlas,
    alphaTest: 0.5,
  });
  // §🌬️ balanço no vento: folhas, flores e grama alta vergam no vertex shader
  // deste material (só ele — água e vidro não têm vegetação). Os uniforms são
  // atualizados 1×/frame no loop; `settings.balanco` zera a força pra desligar
  // sem recompilar shader.
  aplicarBalanco(material, balancoUniforms);
  // §💡 luz voxel nos TRÊS materiais do chunk. Precisa vir DEPOIS do balanço:
  // `aplicarLuz` encadeia o `onBeforeCompile` que já estiver lá (three guarda
  // um só, e sobrescrever mataria o vento em silêncio).
  const luzUniforms = criarLuzUniforms();
  aplicarLuz(material, luzUniforms);
  // água (2026-07-22): material SEPARADO, transparente DE VERDADE (blend) — sem
  // os furos xadrez. Mesma textura do atlas (as UVs do tile da água batem).
  // depthWrite:false = várias faces de água blendam sem brigar pelo z-buffer;
  // renderiza no passe de transparência do three (grupo próprio do mesh do chunk).
  const materialAgua = new THREE.MeshLambertMaterial({
    map: atlas,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });
  // vidro colorido (2026-07-25): material PRÓPRIO, blend de verdade — o tile do
  // atlas é a cor CHEIA (ícone da hotbar sai sólido) e a translucidez vem daqui.
  // (Antes era dither cutout no atlas — ficou "tela de mosquiteiro", rejeitado
  // no playtest.) 0.4 = cor bem legível, ainda dá pra ver através; calibrado no
  // playtest de 2026-07-25 (0.2 ficou fraco). depthWrite:false igual à água.
  const materialVidro = new THREE.MeshLambertMaterial({
    map: atlas,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  aplicarLuz(materialAgua, luzUniforms);
  aplicarLuz(materialVidro, luzUniforms);

  // ?atlas na URL: pendura o canvas do texture atlas no canto (inspeção visual)
  if (new URLSearchParams(location.search).has("atlas")) {
    const img = material.map?.image as HTMLCanvasElement;
    img.style.cssText =
      "position:fixed;right:8px;top:8px;width:256px;image-rendering:pixelated;z-index:20;border:1px solid #000";
    document.body.appendChild(img);
  }
  // `?semworker` volta o meshing pra main thread — é o A/B do mesher em Worker
  // (2026-07-26): a MESMA máquina roda `?bench` com e sem, e a diferença sai em
  // `carga.fasesMs.malha` e no p95. Sem esse par não dá pra provar o ganho num
  // PC de laboratório, e "medir na máquina que dói" é a régua deste projeto.
  const urlMesh = new URLSearchParams(location.search);
  const semWorker = urlMesh.has("semworker");
  // `?meshdepth=N`: jobs em voo POR WORKER durante o JOGO (a carga corre solta
  // de qualquer jeito). O 2 padrão saiu de conta de ocupação de núcleo, não de
  // medida no lab — este knob existe pra uma sessão lá decidir entre 1, 2 e 4.
  const meshDepth = Number(urlMesh.get("meshdepth"));
  const chunkRenderer = new ChunkRenderer(
    world,
    [material, materialAgua, materialVidro],
    scene,
    !semWorker,
    Number.isFinite(meshDepth) && meshDepth > 0 ? meshDepth : undefined,
    semLuz ? undefined : luzWorld,
  );
  // efeitos de água (2026-07-26): névoa+tint ao submergir, animação da textura
  const aguaFx = new AguaFx(scene);
  let aguaQuadroParada = -1;
  /** Relógio da água CORRENTE — independente do vento (8 fps fixos). Serve
   *  também de relógio do TETO de repintura (ver o loop de render). */
  let aguaFluxoRelogio = 0;
  let aguaQuadroFluxo = -1;
  let aguaUltimaPintura = -1;
  /** §💡 Acende TODAS as colunas de um mundo denso (o que chegou inteiro no
   *  snapshot). Mundo lazy não passa por aqui: cada coluna acende quando chega. */
  const acenderMundoTodo = (w: typeof world, l: typeof luzWorld): void => {
    for (let cx = 0; cx < w.dims.x; cx++)
      for (let cz = 0; cz < w.dims.z; cz++) acenderColuna(w, l, cx, cz);
  };

  // lazy: nada a meshar ainda — as colunas entram na fila conforme chegam.
  // A luz vem ANTES do mesh: geometria montada sem luz nasceria clara e
  // escureceria num segundo remesh, piscando na cara da turma.
  if (!mundoLazy) {
    if (!semLuz) acenderMundoTodo(world, luzWorld);
    chunkRenderer.buildAll();
  }

  aplicarColunas = (buf) => {
    // §🔁 lote CORROMPIDO (tamanho/magic errado) joga exceção no meio da
    // aplicação: as colunas que já entraram valem, as demais simplesmente não
    // entram em `colunasCarregadas` — a varredura 1×/s vê o buraco e repede.
    // Sem o catch, a exceção subiria pelo handler de mensagem e derrubaria o
    // resto do frame.
    let cols: ColunaRef[] = [];
    try {
      cols = decodeColunas(buf, world);
    } catch (e) {
      console.warn("[streaming] lote de colunas inválido, será repedido:", e);
      return;
    }
    for (const { cx, cz } of cols) {
      const key = cz * world.dims.x + cx;
      colunasCarregadas.add(key);
      colunasFaltando.delete(key);
      // §💡 a coluna entra na FILA DE LUZ; quem acende (e só então enfileira pro
      // mesh) é o loop de render, sob orçamento de tempo. Acender aqui, no
      // handler da rede, colocaria as 8 colunas de um lote no MESMO frame — o
      // erro que o mesher já cometeu e custou a sessão 27 (9,7-13,4 s de trava
      // no PC do laboratório). Cada coluna custa ~2,5 ms no PC de dev.
      if (!filaLuzSet.has(key)) {
        filaLuzSet.add(key);
        filaLuz.push({ cx, cz });
      }
      torchGlow.varrerColuna(world, cx, cz); // tocha de coluna nova também brilha
    }
    colunasRecebidas += cols.length; // acumulado do perfil (≠ do Set, que descarta)
  };

  // §🔁 rede de segurança do streaming (ver ROADMAP). O streaming F2 é
  // fire-and-forget: lote perdido, decode falho ou mesh falho deixava buraco
  // PERMANENTE (só sair do raio e voltar consertava).
  /** Carência antes do 1º pedido: o lote pode estar a caminho (o servidor manda
   *  `colunasPorTick` por vez, o mundo inteiro não chega num tick). */
  /** §💡 Orçamento de luz por frame DURANTE O JOGO. Uma coluna é atômica (não dá
   *  pra parar a propagação no meio), então isto não limita o custo de UMA — ele
   *  limita quantas cabem no mesmo frame, que é o caso que trava: o lote do
   *  streaming traz várias de uma vez. */
  const ORCAMENTO_LUZ_MS = 3;
  const ESPERA_INICIAL_MS = 4000;
  const BACKOFF_BASE_MS = 2000; // dobra a cada tentativa…
  const BACKOFF_MAX_MS = 30_000; // …até este teto (servidor lento ≠ flood)
  /** Teto de pedidos por varredura (o servidor tem o SEU teto — este evita
   *  gastar upload à toa quando o mundo inteiro está faltando). */
  const PEDIDOS_POR_VARREDURA = 4;

  /**
   * Percorre o quadrado até `raioRender` e pede de volta a coluna que deveria
   * estar carregada e não está. Roda na MESMA passada 1×/s do descarte.
   */
  const varrerFaltando = (pcx: number, pcz: number, agora: number): void => {
    const dims = world.dims;
    const r = settings.raioRender;
    let pedidos = 0;
    for (let cx = pcx - r; cx <= pcx + r; cx++) {
      for (let cz = pcz - r; cz <= pcz + r; cz++) {
        if (cx < 0 || cz < 0 || cx >= dims.x || cz >= dims.z) continue;
        const key = cz * dims.x + cx;
        if (colunasCarregadas.has(key)) continue;
        const f = colunasFaltando.get(key);
        if (!f) {
          colunasFaltando.set(key, { tentativas: 0, proximo: agora + ESPERA_INICIAL_MS });
          continue;
        }
        if (agora < f.proximo || pedidos >= PEDIDOS_POR_VARREDURA) continue;
        // descarta bytes + geometria ANTES de repedir: um decode que morreu no
        // meio pode ter deixado meia coluna, e remeshar por cima do lixo
        // esconderia o buraco em vez de consertar
        chunkRenderer.descartarColuna(cx, cz);
        torchGlow.descartarColuna(cx, cz);
        descartarColunaLuz(luzWorld, cx, cz); // §💡 a luz vai junto com os bytes
        for (let cy = 0; cy < dims.y; cy++) {
          world.chunks[(cy * dims.z + cz) * dims.x + cx] = undefined;
        }
        activeConn.send(JSON.stringify({ type: "pedir_coluna", cx, cz }));
        f.tentativas++;
        f.proximo = agora + Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** (f.tentativas - 1));
        pedidos++;
        repedidas++;
      }
    }
    // saiu do raio (ou finalmente chegou): esquece — o mapa não pode crescer
    // enquanto o jogador anda pelo mundo
    for (const key of colunasFaltando.keys()) {
      const cx = key % dims.x;
      const cz = (key - cx) / dims.x;
      if (colunasCarregadas.has(key) || Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz)) > r) {
        colunasFaltando.delete(key);
      }
    }
  };

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
    if (!claimsAtivo && papel !== "professor" && varinhaAtiva) {
      varinhaAtiva = false;
      touchControls?.setVarinha(false);
    }
    // barra de toque: varinha e amigos só aparecem quando servem
    touchControls?.setVarinhaDisponivel(papel === "professor" || claimsAtivo);
    touchControls?.setAmigosDisponivel(claimsAtivo);
    refreshHotbar(); // a dica da varinha muda conforme a proteção liga/desliga
  };

  // quadros (2026-07-19): planes de conteúdo (texto/imagem) + editor
  const quadroRenderer = new QuadroRenderer(scene);
  const quadroEditor = new QuadroEditor();
  applyQuadros = (lista) => quadroRenderer.setAll(lista, world);
  applyQuadroChanged = (c) => quadroRenderer.aplicar(c, world);

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
  // painel de jogadores (2026-07-21): só professor; aberto por um botão no topo
  // do painel de autoria (some quando não é professor).
  if (papel === "professor") playersPanel = new PlayersPanel(sendCmd, onPanelToggle);
  const openPlayers = (): void => {
    activePanel?.hide(); // troca do painel de autoria pro de jogadores
    inventoryPanel?.hide();
    friendsPanel?.hide();
    playersPanel?.show();
  };
  // painel de amigos (2026-08-04): de TODO jogador — é o dono de área quem
  // convide quem pode construir junto. Sem gate de grupos (o de aluno tem),
  // porque amigos existe justamente em mundo livre, sem grupos de aula.
  friendsPanel = new FriendsPanel(sendCmd, onPanelToggle);
  pushFriendsData();
  activePanel =
    papel === "professor"
      ? new AuthorPanel(sendCmd, onPanelToggle, openPlayers)
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
    playersPanel?.hide();
    friendsPanel?.hide();
    activePanel?.toggle();
  });
  input.onKey(settings.keys.amigos, () => {
    if (chat.open) return;
    activePanel?.hide(); // um painel por vez na tela
    inventoryPanel?.hide();
    playersPanel?.hide();
    friendsPanel?.toggle();
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

  // §🕐 total esperado do raio inicial: o quadrado de `raioRender` em volta do
  // chunk do spawn, recortado pelas bordas do mundo — é a MESMA conta que o
  // servidor faz em `streamColunas` (anel por anel até `st.raio`). O jogador
  // não anda enquanto carrega (sem pointer lock), então o centro não muda.
  // Mundo denso (não-lazy) chega inteiro no snapshot: nada a contar, o custo é
  // o `buildAll` que já rodou lá em cima.
  const calcularTotalCarga = (): number => {
    if (!mundoLazy) return 0;
    const r = settings.raioRender;
    const pcx = Math.max(0, Math.min(world.dims.x - 1, Math.floor(player.pos.x / 16)));
    const pcz = Math.max(0, Math.min(world.dims.z - 1, Math.floor(player.pos.z / 16)));
    const nx = Math.min(world.dims.x - 1, pcx + r) - Math.max(0, pcx - r) + 1;
    const nz = Math.min(world.dims.z - 1, pcz + r) - Math.max(0, pcz - r) + 1;
    return Math.max(1, nx * nz);
  };
  // `let`: a troca de aula (cp19) recalcula — mundo novo, spawn novo, e o mundo
  // pode até deixar de ser lazy
  let totalCarga = calcularTotalCarga();
  // contadores REAIS do jogo — a tela só amostra (§🔁 já mede `faltando` na
  // varredura 1×/s; antes do 1º tick dela o total-prontas dá a mesma resposta).
  // Reassinado a cada reabertura: `fechar()` solta a fonte de propósito.
  const observarCarga = (): void => {
    loading.observar(() => ({
      bytes: activeConn.stats.bytesIn + activeConn.stats.bytesOut,
      prontas: colunasCarregadas.size,
      total: totalCarga,
      faltando:
        colunasFaltando.size > 0
          ? colunasFaltando.size
          : Math.max(0, totalCarga - colunasCarregadas.size),
      fila: chunkRenderer.filaPendente,
    }));
  };
  observarCarga();
  loading.setFase(mundoLazy ? "mundo" : "malha");

  /**
   * §🕐 O host avisou que a troca COMEÇOU (`mundo_trocando`), antes de salvar a
   * aula atual e montar a nova. Sobe a tela já: `totalCarga = 0` deixa o anel
   * indeterminado (não há o que medir enquanto o trabalho é todo do servidor) e
   * o `reloadWorld` assume quando o snapshot chegar.
   */
  iniciarTroca = (nome) => {
    totalCarga = 0;
    loading.abrir({
      host: serverHostLabel,
      rede: !(activeConn instanceof WorkerConnection),
      titulo: "trocando de aula",
      alvo: nome,
    });
    observarCarga();
    loading.setFase("preparando");
    hud.setFase("carregando"); // perfil: o que travar daqui pra frente é carga
    hud.marcar("troca de aula", nome); // §📊 causa registrada pro pico que vem
    updateOverlay();
  };

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
    worldSeed = novo.seed; // F3 mostra clima/bioma — a seed muda com a aula
    mundoLazy = proximoLazy; // aula nova pode ser mundo ENORME (ou deixar de ser)
    colunasCarregadas = new Set();
    colunasFaltando.clear(); // §🔁 buracos do mundo VELHO não valem no novo
    // mundo ENORME não tem o que montar aqui (as colunas chegam por streaming);
    // `buildAll` num mundo E varria 460 800 slots vazios = ~19 s de trava
    // §💡 grade de luz NOVA: o mundo pode ter até outro tamanho, e luz do mundo
    // velho num mundo novo seria sombra de parede que não existe mais.
    luzWorld = criarLuz(world.dims);
    filaLuz.length = 0; // coluna do mundo VELHO não se acende no novo
    filaLuzSet.clear();
    if (!mundoLazy && !semLuz) acenderMundoTodo(world, luzWorld);
    chunkRenderer.trocarMundo(world, !mundoLazy, semLuz ? undefined : luzWorld);
    torchGlow.setFromWorld(world);

    latestRegions = [];
    regionRenderer.setRegions([]);
    regionRenderer.clearCorners();
    quadroRenderer.setAll([], world); // mundo sem quadro não reenvia — sem isso fica fantasma (bug relatado)
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

    // O servidor criou uma SESSÃO NOVA e o `admitir` zera o raio de interesse
    // pra RAIO_PADRAO — sem reanunciar, tudo além de RAIO_PADRAO+FOLGA nunca
    // chega (o `pedir_coluna` do §🔁 também é recusado lá fora). Mesmo motivo
    // do bug-211, outro caminho.
    raioEnviado = -1;
    enviarRaio();
    hud.setMeta({ worldChunks: world.dims, worldSeed: novo.seed }); // F3/perfil seguem a aula

    // §🕐 a mesma tela cobre a troca de aula. O pointer lock CONTINUA travado
    // (o aluno estava jogando), então quando ela fechar ele volta ao jogo sem
    // clique nenhum. `respawn()` já rodou: o total sai do spawn NOVO.
    totalCarga = calcularTotalCarga();
    loading.abrir({
      host: serverHostLabel,
      rede: !(activeConn instanceof WorkerConnection),
      titulo: "trocando de aula",
    });
    observarCarga();
    loading.setFase(mundoLazy ? "mundo" : "malha");
    hud.setFase("carregando");
    updateOverlay(); // esconde o menu de pausa se ele estava aberto na troca
    if (!mundoLazy) loading.concluir(); // denso: `trocarMundo` já montou tudo
  };

  // servidor manda posição E orientação (volta-onde-parou; futuro /tp)
  applyTeleport = (pos) => {
    player.pos.x = pos.x;
    player.pos.y = pos.y;
    player.pos.z = pos.z;
    player.vel.x = player.vel.y = player.vel.z = 0;
    // ?yaw/?pitch (screenshot) vencem a orientação do servidor; senão volta-onde-parou
    input.yaw = yawForcado ?? pos.yaw;
    input.pitch = pitchForcado ?? pos.pitch;
  };

  // servidor mandou block_changed (nossa ação OU de outro jogador OU gravidade
  // — cliente não distingue): aplica na cópia local e remesh
  applyBlockChanged = (msg) => {
    setBlock(world, msg.x, msg.y, msg.z, msg.blockId);
    chunkRenderer.remeshBlock(msg.x, msg.y, msg.z);
    // §💡 a luz mudou onde ela ALCANÇA (até 15 blocos), não só no ±1 do bloco:
    // por isso o remesh extra sai do conjunto que o motor devolve. Quebrar o
    // teto de uma sala acende o cômodo inteiro — e são vários chunks.
    if (!semLuz) chunkRenderer.remeshSujos(atualizarBloco(world, luzWorld, msg.x, msg.y, msg.z));
    torchGlow.onBlockChanged(msg.x, msg.y, msg.z, msg.blockId);
    quadroRenderer.onBlockChanged(msg.x, msg.y, msg.z, msg.blockId, world);
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
    // §💡 lote é grande demais pra `atualizarBloco` célula a célula (uma caixa de
    // 32³ seriam 32 768 repropagações). Reacender as COLUNAS tocadas dá o mesmo
    // resultado — `acenderColuna` zera e recalcula, e o que vem de fora volta
    // pela casca. Custa ~2,5 ms por coluna, e encher em lote é ação de professor.
    for (let cx = Math.max(0, (msg.x0 / 16) | 0); cx <= Math.min(world.dims.x - 1, (msg.x1 / 16) | 0); cx++)
      for (let cz = Math.max(0, (msg.z0 / 16) | 0); cz <= Math.min(world.dims.z - 1, (msg.z1 / 16) | 0); cz++)
        if (!semLuz) chunkRenderer.remeshSujos(acenderColuna(world, luzWorld, cx, cz));
    chunkRenderer.remeshBox(min, max);
    torchGlow.onRegionFilled(min, max, msg.blockId);
    quadroRenderer.validarTodos(world); // encher pode ter engolido quadros
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
  // Cubo unitário centrado na origem: o loop o REESCALA/reposiciona pela
  // blockSelectionBox do bloco mirado (contorno segue a forma dos não-cubos).
  const highlight = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
    new THREE.LineBasicMaterial({ color: 0x000000 }),
  );
  highlight.visible = false;
  scene.add(highlight);
  let target: RayHit | null = null;
  /** §🍖 F7: jogador mirado neste frame (id + distância), ou null. Calculado no
   *  mesmo lugar que o `target` do bloco, e é ele que decide se o clique
   *  esquerdo vira soco em vez de quebra. */
  let alvoJogador: { id: number; dist: number } | null = null;
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
    valid.add(ITEM_BALDE_VAZIO); // balde esvaziado guardado no slot sobrevive ao reload
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
    // balde VAZIO não está em PLACEABLE (só o cheio); precisa do ícone dele
    // §🍖 F6: a comida também é item (não está em PLACEABLE) e precisa de ícone
    // — o painel de craft mostra "falta 3 trigo" com ele.
    // §🍖 F10: os itens da fundição entram pela mesma porta — a lista de craft
    // mostra "1/1 carvão" com o ícone deles.
    [
      ...PLACEABLE.map((b) => b.id),
      ITEM_BALDE_VAZIO, ITEM_FRUTA, ITEM_TRIGO, ITEM_PAO,
      ITEM_CARVAO, ITEM_DIAMANTE, ITEM_GRAVETO,
    ],
  );
  const blockName = (id: number): string => {
    if (id === ITEM_BALDE_VAZIO) return "balde vazio";
    if (id === ITEM_BALDE_AGUA) return "balde de água";
    if (id === ITEM_FRUTA) return "fruta";
    if (id === ITEM_TRIGO) return "trigo";
    if (id === ITEM_PAO) return "pão";
    if (id === ITEM_CARVAO) return "carvão";
    if (id === ITEM_DIAMANTE) return "diamante";
    if (id === ITEM_GRAVETO) return "graveto";
    return PLACEABLE.find((b) => b.id === id)?.name ?? "?";
  };
  const refreshHotbar = (): void => {
    if (!hotbarEl) return;
    // nomes/ícones são constantes do código (sem input externo) — innerHTML ok aqui
    if (varinhaAtiva) {
      const criar = papel === "professor" ? "/regiao criar nome" : "/claim criar";
      hotbarEl.innerHTML =
        `<b>[varinha]</b> esq = canto 1 · dir = canto 2 · ${criar} · R/🪄 volta`;
      return;
    }
    // §🍖 F4: em sobrevivência os 9 slots são os do SERVIDOR (com quantidade);
    // em criativo, a paleta escolhida no inventário, como sempre.
    const ids = mochila.ativa ? mochila.hotbar() : hotbar;
    const slots = ids
      .map((id, i) => {
        const sel = i === selected ? " sel" : "";
        if (id === null || id === undefined) return `<span class="slot${sel} vazio"><small>${i + 1}</small></span>`;
        const qtd = mochila.ativa ? mochila.qtdDoSlot(i) : 0;
        const conta = qtd > 1 ? `<b class="qtd">${qtd}</b>` : "";
        return `<span class="slot${sel}"><small>${i + 1}</small><img src="${icons.get(id) ?? ""}" alt="">${conta}</span>`;
      })
      .join("");
    const naMao = ids[selected];
    hotbarEl.innerHTML =
      `<span class="bar-nome">${naMao === null || naMao === undefined ? "mão vazia" : blockName(naMao)}</span>` +
      `<span class="slots">${slots}</span>`;
    inventoryPanel?.refresh();
  };
  /** Id na mão AGORA (null = mão vazia em sobrevivência). Fonte única pra quem
   *  precisa saber o que o jogador segura: colocar, quebrar com balde, hotbar. */
  const idNaMao = (): number | null =>
    mochila.ativa ? mochila.idDoSlot(selected) : (hotbar[selected] ?? null);
  aoMudarMochila = () => refreshHotbar();
  refreshHotbar();
  // professor: varinha p/ regiões (sempre). aluno: só com a proteção de áreas
  // ligada (cp24), pra marcar o próprio claim. Extraído pra ser chamado tanto
  // pela tecla R quanto pelo botão 🪄 do toque (celular não tem R).
  const toggleVarinha = (): void => {
    if (papel !== "professor" && !claimsAtivo) return;
    varinhaAtiva = !varinhaAtiva;
    touchControls?.setVarinha(varinhaAtiva); // ⛏/▣ viram canto 1 / canto 2
    refreshHotbar();
  };
  input.onKey(settings.keys.varinha, toggleVarinha);
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
  // Toque (2026-07-27, layouts mobile): tocar num slot escolhe o bloco. No
  // tablet não existe 1–9 nem scroll do mouse, então sem isto trocar de bloco
  // exigia abrir o inventário TODA vez. Delegação no #hotbar porque o
  // refreshHotbar troca o innerHTML inteiro. O CSS só dá pointer-events à
  // faixa .slots — no resto da barra o arrasto tem que chegar no #touch-look.
  hotbarEl?.addEventListener("pointerdown", (e) => {
    const slot = (e.target as HTMLElement | null)?.closest?.(".slot");
    if (!slot) return;
    const i = [...hotbarEl.querySelectorAll(".slot")].indexOf(slot);
    if (i < 0) return;
    e.preventDefault(); // sem clique sintetizado depois (mesmo motivo do touch.ts)
    selected = i;
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
        playersPanel?.hide();
        friendsPanel?.hide();
        document.exitPointerLock();
      } else input.lock();
      updateOverlay();
    },
    mochila,
    (de, para) => activeConn.send(JSON.stringify({ type: "mover_item", de, para })),
    blockName,
    (receita) => activeConn.send(JSON.stringify({ type: "fabricar", receita })),
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
    // §🍖 F7: soco vem ANTES do bloco — quem está mirado é gente, e o bloco
    // atrás dela não pode quebrar no mesmo clique. O cliente só manda a
    // intenção: regra, modo, alcance e cooldown são conferidos no servidor.
    if (alvoJogador && !varinhaAtiva) {
      activeConn.send(JSON.stringify({ type: "atacar", alvo: alvoJogador.id }));
      return;
    }
    if (!target) return;
    if (varinhaAtiva) {
      wandMark(1, target);
      return;
    }
    // balde não quebra bloco em sobrevivência; em criativo o professor pode
    // quebrar com o balde na mão (clique direito segue despejando/recolhendo água).
    if (isBalde(idNaMao() ?? -1) && modoAtual !== "criativo") return;
    activeConn.send(
      JSON.stringify({ type: "break_block", x: target.x, y: target.y, z: target.z }),
    );
  });
  input.onMouseButton(2, () => {
    // §🍖 F6: comer vem ANTES do `if (!target)` — comer não precisa de bloco
    // mirado (olhar pro céu e morder tem de funcionar), e é o único uso do
    // clique direito que não tem célula. O servidor decide se a mordida vale
    // (barriga cheia recusa); o cliente só pede, como em todo o resto.
    if (mochila.ativa && isComida(idNaMao() ?? -1)) {
      activeConn.send(JSON.stringify({ type: "comer", slot: selected }));
      return;
    }
    if (!target) return;
    if (varinhaAtiva) {
      wandMark(2, target);
      return;
    }
    // balde (2026-07-22): clique direito com balde na mão sempre faz água
    // (prioridade sobre porta/quadro). Cheio → DESPEJA fonte na célula da face
    // mirada (target+normal). Vazio → RECOLHE a fonte mirada (o raycast parou
    // na água). Estado cheio/vazio troca no slot da hotbar.
    {
      // §🍖 F5: o balde virou item de mochila. Em sobrevivência o item vem do
      // slot do SERVIDOR e o slot vai no `slot:` da mensagem — quem troca
      // vazio↔cheio (e responde com a mochila) é o servidor. Em criativo segue
      // escrevendo o slot local da hotbar, como sempre.
      const held = idNaMao();
      if (isBalde(held ?? -1)) {
        const slot = mochila.ativa ? { slot: selected } : {};
        if (held === ITEM_BALDE_AGUA) {
          activeConn.send(
            JSON.stringify({
              type: "balde",
              x: target.x + target.nx,
              y: target.y + target.ny,
              z: target.z + target.nz,
              encher: false,
              ...slot,
            }),
          );
          if (!mochila.ativa) hotbar[selected] = ITEM_BALDE_VAZIO; // esvaziou (local)
        } else {
          // só recolhe se mirou numa FONTE (id Agua); fluxo derivado não coleta
          if (getBlock(world, target.x, target.y, target.z) !== BlockId.Agua) return;
          activeConn.send(
            JSON.stringify({
              type: "balde",
              x: target.x,
              y: target.y,
              z: target.z,
              encher: true,
              ...slot,
            }),
          );
          if (!mochila.ativa) hotbar[selected] = ITEM_BALDE_AGUA; // encheu (local)
        }
        if (!mochila.ativa) {
          localStorage.setItem(HOTBAR_KEY, JSON.stringify(hotbar));
          refreshHotbar();
        }
        return;
      }
    }
    // quadro (2026-07-19): clique direito abre o EDITOR (texto/imagem); o
    // conteúdo vai por quadro_set e volta pra todos por quadro_changed
    {
      const alvoId = getBlock(world, target.x, target.y, target.z);
      if (isQuadro(alvoId)) {
        const { x, y, z } = target;
        quadroEditor.open(quadroRenderer.get(x, y, z), (r) => {
          input.lock();
          if (!r) return; // cancelou
          activeConn.send(
            JSON.stringify({
              type: "quadro_set", x, y, z, texto: r.texto,
              ...(r.imagem ? { imagem: r.imagem } : {}),
            }),
          );
        });
        return;
      }
    }
    // cp23: clique direito em bloco INTERATIVO (porta/janela) interage, não
    // coloca — convenção Minecraft; o servidor alterna (porta: as 2 metades)
    if (isInterativo(getBlock(world, target.x, target.y, target.z))) {
      activeConn.send(
        JSON.stringify({ type: "use_block", x: target.x, y: target.y, z: target.z }),
      );
      return;
    }
    // §🍖 F4: em sobrevivência o bloco vem do slot do SERVIDOR — mão vazia não
    // manda pedido nenhum (o servidor recusaria calado de qualquer jeito).
    let blockId = idNaMao();
    if (blockId === null) return;
    // porta/janela na mão: o EIXO sai da direção do olhar (a lâmina fecha a
    // passagem que o jogador está encarando)
    if (blockId === BlockId.PortaXFechada || blockId === BlockId.PortaZFechada) {
      blockId =
        Math.abs(Math.sin(input.yaw)) > Math.abs(Math.cos(input.yaw))
          ? BlockId.PortaXFechada
          : BlockId.PortaZFechada;
    }
    if (blockId === BlockId.JanelaXFechada || blockId === BlockId.JanelaZFechada) {
      blockId =
        Math.abs(Math.sin(input.yaw)) > Math.abs(Math.cos(input.yaw))
          ? BlockId.JanelaXFechada
          : BlockId.JanelaZFechada;
    }
    // móveis/quadro direcionais: a FRENTE encara o jogador (encosto/cabeceira/
    // parede pro lado de lá — convenção Minecraft). Quadrante do olhar → k×90°.
    if (isCadeira(blockId) || isSofa(blockId) || isCama(blockId) || isQuadro(blockId)) {
      const dx = -Math.sin(input.yaw);
      const dz = -Math.cos(input.yaw);
      const olhar = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 0 : 2) : (dz > 0 ? 1 : 3);
      const frente = (olhar + 2) % 4; // oposto do olhar = de frente pro jogador
      const anchor = isCadeira(blockId)
        ? BlockId.CadeiraXP
        : isSofa(blockId)
          ? BlockId.SofaXP
          : isCama(blockId)
            ? BlockId.CamaXP
            : BlockId.QuadroXP;
      blockId = anchor + frente;
    }
    // laje (2026-07-25): mirou por BAIXO (face de baixo do bloco) → laje de
    // CIMA; senão laje de baixo (piso). A hotbar guarda a âncora "baixo".
    if (isSlab(blockId)) {
      const baixo = blockId - (slabTop(blockId) ? 1 : 0);
      blockId = target.ny < 0 ? baixo + 1 : baixo;
    }
    // escada (2026-07-25): direção SOBE pra onde o jogador olha; metade
    // (base/cabeça-pra-baixo) pela face clicada (por baixo = de cabeça pra baixo).
    if (isStairs(blockId)) {
      const dx = -Math.sin(input.yaw);
      const dz = -Math.cos(input.yaw);
      const olhar = Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 0 : 2) : (dz > 0 ? 1 : 3);
      blockId = escadaId(stairsMaterial(blockId), olhar, target.ny < 0);
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
    // §🍖 F4: em sobrevivência o slot é do servidor — copiar o bloco mirado pra
    // mão daria bloco de graça. O gesto simplesmente não existe lá.
    if (mochila.ativa) return;
    let id = getBlock(world, target.x, target.y, target.z);
    // qualquer porta/janela/móvel copiado vira a entrada única da hotbar
    // (o eixo/direção é re-escolhido pelo olhar na hora de colocar)
    if (isPorta(id)) id = BlockId.PortaXFechada;
    if (isJanela(id)) id = BlockId.JanelaXFechada;
    if (isCadeira(id)) id = BlockId.CadeiraXP;
    if (isSofa(id)) id = BlockId.SofaXP;
    if (isCama(id)) id = BlockId.CamaXP;
    if (isQuadro(id)) id = BlockId.QuadroXP;
    // laje/escada: copia pra âncora do material (metade/direção re-escolhidas no place)
    if (isSlab(id)) id = BlockId.LajePedraBaixo + slabMaterial(id) * 2;
    if (isStairs(id)) id = BlockId.EscadaPedraXP + stairsMaterial(id) * 8;
    if (!isPlaceable(id)) return; // ar/porta-aberta e afins não vão pra mão
    if (isProfessorOnly(id) && papel !== "professor") return; // aluno não copia rocha-matriz
    hotbar[selected] = id;
    localStorage.setItem(HOTBAR_KEY, JSON.stringify(hotbar));
    refreshHotbar();
  });

  const hud = new Hud(renderer, {
    checkpoint: 14,
    worldChunks: world.dims,
    worldSeed: snap.seed,
    serverHost: serverHostLabel,
  });
  hudAtual = hud; // a tela de carregamento avisa a troca de fase por aqui
  // contexto do perfil: onde/como o jogador estava + a config que muda o custo
  hud.contexto = () => ({
    x: player.pos.x,
    y: player.pos.y,
    z: player.pos.z,
    yaw: input.yaw,
    pitch: input.pitch,
    voando: flying && podeVoar(),
    noChao: player.onGround,
    raioRender: settings.raioRender,
    meshMsPorFrame: settings.meshMsPorFrame,
    pixelRatioCap: settings.pixelRatioCap,
    fov: settings.fov,
    nuvens: settings.nuvens,
    balanco: settings.balanco,
    distanciaTotal: distanciaPercorrida,
    colunasRecebidas,
    bytesRecebidos: activeConn.stats.bytesIn,
  });
  hud.setRemesh({
    count: chunkRenderer.remeshCount,
    totalMs: chunkRenderer.remeshMsTotal,
    workerMs: chunkRenderer.remeshWorkerMsTotal,
    config: chunkRenderer.meshConfig,
    lastMs: chunkRenderer.lastRemeshMs,
    porCaminho: chunkRenderer.porCaminho,
  });
  // §📊 tempo de carga por fase (a tela §🕐 já mede; aqui só entra no JSON)
  hud.carga = () => loading.relatorio();
  hud.marcar("join", `${world.dims.x}×${world.dims.z}×${world.dims.y} chunks · seed ${snap.seed}`);

  // --- ?bench: trajeto fixo, gravação do trajeto inteiro, export automático ---
  let bench: Bench | null = null;
  if (benchOpts) {
    /**
     * Onde o perfil do bench vai parar. O `?bench` roda em SINGLEPLAYER (Web
     * Worker), então não existe socket com host nenhum — o botão "enviar pro
     * servidor" do F3 não serve aqui. Mas a página costuma vir DO host
     * (`http://<host>:8080/?bench`), e aí um POST de mesma origem cai no
     * `perfis.ts` e o arquivo nasce em `profiles/`, ao lado dos perfis manuais.
     * Assim o professor recolhe tudo numa pasta só, em vez de ir de PC em PC
     * catando download. Se a página não veio do host (vite em dev, `file://`),
     * cai no download de sempre.
     */
    const entregarPerfilDoBench = async (report: object): Promise<void> => {
      try {
        const r = await fetch("/perfil", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(report),
        });
        const corpo = (await r.json()) as { arquivo?: string };
        if (!r.ok || !corpo.arquivo) throw new Error(`resposta inesperada (${r.status})`);
        chat.addMessage("jogo", `benchmark concluído — perfil salvo no servidor: ${corpo.arquivo}`);
      } catch {
        // mesmo motivo do nome no servidor: o par A/B não pode virar dois
        // `perf-bench-*.json` indistinguíveis na pasta de downloads
        const prefixo = benchOpts.semVida ? "bench-semvida" : "bench";
        hud.baixar(report, prefixo);
        chat.addMessage("jogo", `benchmark concluído — o perfil foi baixado (perf-${prefixo}-*.json)`);
      }
    };

    iniciarBench = () => {
      if (bench) return; // uma corrida por sessão (troca de aula não reinicia)
      bench = Bench.paraMundo(benchOpts, spawn, world.dims);
      hud.setMeta({ bench: bench.meta() });
      hud.marcar(
        "bench: início",
        `${benchOpts.duracaoS}s · raio ${bench.trajeto.raio}${benchOpts.semVida ? " · sem vida ambiental" : ""}`,
      );
      benchRodando = true;
      // mesma razão do `__benchPerfil` abaixo: automação headless precisa saber
      // que o trajeto COMEÇOU (a verificação da luz fotografa em pleno voo, não
      // no fim, então não pode esperar o perfil).
      (window as unknown as Record<string, unknown>)["__benchRodando"] = true;
      flying = true; // o observador não cai: a posição vem do tempo, não da física
      updateOverlay(); // sem pointer lock o menu de pausa apareceria por cima
      bench.iniciar(performance.now());
      // teleporta pro início do trajeto AQUI, não no primeiro frame: assim o
      // salto (spawn → borda do círculo) não entra na distância percorrida da
      // gravação, que deve medir só o voo
      const inicio = bench.amostra(performance.now());
      player.pos.x = posAntX = inicio.x;
      player.pos.y = posAntY = inicio.y;
      player.pos.z = posAntZ = inicio.z;
      // grava o trajeto INTEIRO (o botão do F3 grava 10 s; aqui são os 30)
      hud.record((report) => {
        benchRodando = false;
        (window as unknown as Record<string, unknown>)["__benchRodando"] = false;
        updateOverlay();
        // headless/automação leem daqui sem depender de download
        (window as unknown as Record<string, unknown>)["__benchPerfil"] = report;
        void entregarPerfilDoBench(report);
      }, benchOpts.duracaoS * 1000);
    };
  }

  input.onKey(settings.keys.hud, () => hud.toggle());
  // profiler (backlog "ferramentas de dev"): singleplayer roda em Web Worker
  // sem filesystem — o host ignora a mensagem em silêncio, sem erro no cliente.
  document.getElementById("hud-report")?.addEventListener("click", () => {
    // grava 10 s e SÓ ENTÃO envia o relatório agregado (perf.ts do host grava)
    hud.record((report) => {
      activeConn.send(JSON.stringify({ type: "profile_report", stats: report }));
    });
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
      hud: () => hud.toggle(),
      varinha: () => toggleVarinha(),
      amigos: () => {
        activePanel?.hide(); // um painel por vez na tela
        inventoryPanel?.hide();
        playersPanel?.hide();
        friendsPanel?.toggle();
      },
    });
    // os dois botões condicionais nascem escondidos: aqui é o 1º estado real
    touchControls.setVarinhaDisponivel(papel === "professor" || claimsAtivo);
    touchControls.setAmigosDisponivel(claimsAtivo);
    touchControls.setScale(settings.uiScale); // aplica a escala salva de cara
    updateOverlay();
  }

  hud.extra = () => {
    const m = input.mouseStats;
    const p = player.pos;
    // clima/bioma da COLUNA atual (2026-07-20): mesmas funções puras do gen —
    // vale pro terreno GERADO (preset normal); em mundo plano/aula é só o que
    // o gen FARIA ali. Serve pra afinar thresholds (neve/chapada/gramas).
    const bx = Math.floor(p.x);
    const bz = Math.floor(p.z);
    const clima = climaAt(bx, bz, worldSeed);
    const bioma = biomaPorClima(clima);
    const grama = gramaPorClima(clima);
    const h = Math.min(heightAt(bx, bz, worldSeed, world.sizeY), world.sizeY - 2);
    const topo =
      h <= SAND_HEIGHT ? "areia (praia)"
      : h >= SNOW_HEIGHT && bioma.neve ? "neve"
      : h >= ROCHA_HEIGHT ? "pedra (chapada)"
      : bioma.topo !== "grama" ? "areia (caatinga)"
      : grama === BlockId.GramaSeca ? "grama seca"
      : grama === BlockId.GramaFria ? "grama fria"
      : "grama";
    return (
      `pos ${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.z.toFixed(1)}  ` +
      `bloco ${Math.floor(p.x)} ${Math.floor(p.y)} ${Math.floor(p.z)}\n` +
      `bioma ${bioma.nome}  temp ${clima.temp.toFixed(2)}  umid ${clima.umid.toFixed(2)}  seed ${worldSeed}\n` +
      `terreno h ${h}  topo ${topo}  ` +
      `[praia ≤${SAND_HEIGHT} · neve ≥${SNOW_HEIGHT} se o bioma neva · chapada ≥${ROCHA_HEIGHT}]\n` +
      `relevo ${relevoPorClima(clima).toFixed(2)} (teto do bioma ${bioma.relevo})\n` +
      `modo ${modoAtual === "sobrevivencia" ? "sobrevivência" : "criativo"}  ` +
      `voo ${podeVoar() ? (flying ? "voando" : "liberado") : "trancado"}` +
      // §🍖 F2/F3: os números que o servidor mandou por último (o HUD desenha
      // ícone; aqui o professor lê o valor exato pra calibrar dano e fome)
      (ultimaVida
        ? `  vida ${ultimaVida.vida}/20` +
          (ultimaVida.fome !== undefined ? `  fome ${ultimaVida.fome}/20` : "  sem fome")
        : "") +
      "\n" +
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
  // (o mundo do ?bench é descartável: gravar encheria a lista de mundos do
  //  professor de "benchmark" a cada medição)
  if (activeConn instanceof WorkerConnection && currentWorld && !benchOpts) {
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
      jitterMs: jitterDeRede(),
    };
    hud.regras = regrasServidor; // §📊 custo das regras no servidor (F3 + perfil)
    // streaming (mundo procedural): colunas carregadas + fila de remesh
    hud.stream = {
      colunas: colunasCarregadas.size,
      fila: chunkRenderer.filaPendente,
      faltando: colunasFaltando.size,
      repedidas,
      ultimoLote: chunkRenderer.ultimoLote,
    };
    hud.luz = { colunas: luzColunas, totalMs: luzMsTotal, fila: filaLuz.length }; // §💡
    lastNet = { ...s };
  }, 1000);

  let last = performance.now();
  let posAntX = player.pos.x;
  let posAntY = player.pos.y;
  let posAntZ = player.pos.z;
  // corrida por duplo-toque no andar: latch fica armado até soltar a tecla
  let sprintLatch = false;
  let forwardWasDown = false;
  let lastForwardTap = 0;
  // voo por duplo-toque no pular (só quem pode voar)
  let jumpWasDown = false;
  let lastJumpTap = 0;
  // altura do olho com transição suave (agachar abaixa a câmera)
  let eyeHeight = PLAYER.eyeHeight;
  // step-up suave (2026-07-25): a FÍSICA sobe o degrau (laje/escada) de uma vez
  // — tem que ser assim, o servidor valida a mesma simulação. Quem suaviza é o
  // OLHO: guarda aqui quanto da subida ainda falta "alcançar" e desconta da
  // câmera, decaindo em ~0,15 s. Visual puro, não muda colisão nem rede.
  let stepSuave = 0;
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

    // F2 streaming: processa a fila de mesh (N chunks/frame — config) e SÓ
    // simula física com o chão debaixo dos pés carregado (coluna ausente =
    // ar → cairia no vazio; congela até a coluna chegar)
    let chaoCarregado = true;
    if (mundoLazy) {
      // mesh que falhou = coluna suspeita: sai de `colunasCarregadas` e a
      // varredura abaixo a repede (§🔁)
      // pool de mesh solto só enquanto a tela de carga cobre a tela; depois
      // freia (senão os workers roubam núcleo do render — lab 2026-07-27)
      chunkRenderer.modoCarga = loading.ativo;
      // §💡 luz ANTES do mesh, sob orçamento próprio. Na tela de carga não há
      // frame a proteger (mesma regra do `modoCarga` do pool), no jogo há.
      // SEMPRE acende pelo menos uma: orçamento apertado não pode significar
      // fila parada — a coluna nunca chegaria a virar mesh.
      {
        const orcamento = loading.ativo ? 16 : ORCAMENTO_LUZ_MS;
        const fim = performance.now() + orcamento;
        let acesas = 0;
        while (filaLuz.length > 0) {
          const c = filaLuz.shift()!;
          const key = c.cz * world.dims.x + c.cx;
          filaLuzSet.delete(key);
          // a coluna pode ter saído do raio enquanto esperava: acender (e
          // meshar) o que já foi descartado desperdiça o frame inteiro
          if (!colunasCarregadas.has(key)) continue;
          if (!semLuz) {
            const t0 = performance.now();
            acenderColuna(world, luzWorld, c.cx, c.cz);
            luzMsTotal += performance.now() - t0;
            luzColunas++;
          }
          // o conjunto sujo é ignorado: `enfileirarColuna` já cobre esta coluna
          // e as 4 vizinhas, que é o mesmo alcance.
          chunkRenderer.enfileirarColuna(c.cx, c.cz);
          if (++acesas >= 1 && performance.now() >= fim) break;
        }
      }
      chunkRenderer.processarFila(settings.meshMsPorFrame, (fx, fz) => {
        colunasCarregadas.delete(fz * world.dims.x + fx);
      });
      const pcx = Math.max(0, Math.min(world.dims.x - 1, Math.floor(player.pos.x / 16)));
      const pcz = Math.max(0, Math.min(world.dims.z - 1, Math.floor(player.pos.z / 16)));
      chaoCarregado = colunasCarregadas.has(pcz * world.dims.x + pcx);
      // varredura de descarte 1×/s (mesma regra do servidor: raio + folga)
      if ((frameCount = (frameCount + 1) % 60) === 0) {
        for (const key of colunasCarregadas) {
          const cx = key % world.dims.x;
          const cz = (key - cx) / world.dims.x;
          if (Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz)) > settings.raioRender + 2) {
            colunasCarregadas.delete(key);
            chunkRenderer.descartarColuna(cx, cz);
            torchGlow.descartarColuna(cx, cz); // sprites da coluna somem junto
            descartarColunaLuz(luzWorld, cx, cz); // §💡 e a luz também
            for (let cy = 0; cy < world.dims.y; cy++) {
              world.chunks[(cy * world.dims.z + cz) * world.dims.x + cx] = undefined;
            }
          }
        }
        // §🔁 MESMA passada: coluna que DEVERIA estar aqui e não está
        varrerFaltando(pcx, pcz, now);
        // 2026-08-04: wireframe de área reservada além do raio não é desenhado
        // (ele ficaria sobre coluna descarregada). Custo O(nº de áreas), na
        // MESMA varredura de 1×/s — a área só entra/sai no limite do render, e
        // um segundo de atraso lá na ponta ninguém vê.
        // Fica DENTRO do `if (mundoLazy)` de propósito: só o mundo procedural
        // descarta coluna. Em mundo denso (P/M/G) o `trocarMundo` monta tudo e
        // não existe "além do raio" — cular lá esconderia a borda de uma área
        // cujo terreno está na tela. O que sai do campo de visão em qualquer
        // mundo já é cortado pelo frustum do three.js, de graça.
        const raioBlocos = settings.raioRender * 16;
        claimRenderer.cularPorDistancia(player.pos.x, player.pos.z, raioBlocos);
        regionRenderer.cularPorDistancia(player.pos.x, player.pos.z, raioBlocos);
      }
      // §🕐 a tela de carga só sai com o raio inicial INTEIRO aplicado E a fila
      // do mesher vazia — entrar antes é cair num mundo cheio de buracos
      // §💡 `filaLuz` entra no portão: coluna esperando luz ainda NÃO virou mesh,
      // então `filaPendente` estaria em 0 com o mundo cheio de buraco.
      if (
        loading.ativo &&
        colunasCarregadas.size >= totalCarga &&
        filaLuz.length === 0 &&
        chunkRenderer.filaPendente === 0
      ) {
        loading.concluir();
      }
    }
    // ?bench: a posição é FUNÇÃO DO TEMPO (não integração por frame) — PC lento
    // e PC rápido percorrem o mesmo trajeto, que é o ponto do modo. A física
    // fica de fora: o observador atravessa o mundo sem colidir nem cair.
    if (bench?.ativo) {
      const a = bench.amostra(now);
      player.pos.x = a.x;
      player.pos.y = a.y;
      player.pos.z = a.z;
      player.vel.x = player.vel.y = player.vel.z = 0;
      input.yaw = a.yaw;
      input.pitch = a.pitch;
      if (bench.terminou(now)) {
        bench.parar();
        hud.marcar("bench: fim");
      }
    }
    const yAntesDoPasso = player.pos.y;
    if (chaoCarregado && !bench?.ativo) {
      stepPlayer(world, player, { forward, strafe, jump, yaw: input.yaw, sprint, sneak, fly }, dt);
    }
    // subiu um degrau andando (só step-up: no chão, sem pular/voar) → a câmera
    // fica pra trás e recupera suave; decaimento exponencial = independe do FPS
    const subiu = player.pos.y - yAntesDoPasso;
    if (player.onGround && !fly && subiu > 0.01 && subiu <= STEP_HEIGHT + 0.01) {
      stepSuave = Math.min(stepSuave + subiu, STEP_HEIGHT);
    }
    stepSuave *= Math.exp(-dt * 14);
    if (stepSuave < 0.002) stepSuave = 0;
    // distância do frame (escalares, sem alocar): o perfil precisa saber se a
    // gravação foi voando ou parado — a taxa de rede sozinha engana
    distanciaPercorrida += Math.hypot(
      player.pos.x - posAntX,
      player.pos.y - posAntY,
      player.pos.z - posAntZ,
    );
    posAntX = player.pos.x;
    posAntY = player.pos.y;
    posAntZ = player.pos.z;
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
    camera.position.set(player.pos.x, player.pos.y + eyeHeight - stepSuave, player.pos.z);
    camera.rotation.set(input.pitch, input.yaw, 0);

    // mira: raycast local (visual) — decisão continua no servidor
    camera.getWorldDirection(lookDir);
    target = input.active
      ? raycastBlock(
          world,
          camera.position.x, camera.position.y, camera.position.z,
          lookDir.x, lookDir.y, lookDir.z,
          PLAYER_REACH,
          hotbar[selected] === ITEM_BALDE_VAZIO, // balde vazio mira a água (recolher)
        )
      : null;
    // §🍖 F7: jogador na frente? Só onde o soco valeria (sobrevivência + pvp
    // ligado), e só se ele estiver MAIS PERTO que o bloco mirado — senão dava
    // pra bater em quem está atrás da parede. Quem está mirado ganha o clique
    // esquerdo inteiro: o bloco atrás não quebra.
    alvoJogador =
      input.active && modoAtual === "sobrevivencia" && pvpLigado
        ? raycastJogador(
            camera.position.x, camera.position.y, camera.position.z,
            lookDir.x, lookDir.y, lookDir.z,
            // a posição do LERP é a que o aluno vê; o `target` do servidor
            // pularia 10×/s e a mira ficaria intermitente
            [...remotePlayers].map(([id, rp]) => ({
              id,
              x: rp.mesh.position.x,
              y: rp.mesh.position.y - PLAYER.height / 2, // mesh é centrada; a caixa quer os PÉS
              z: rp.mesh.position.z,
            })),
            PLAYER_REACH,
          )
        : null;
    if (alvoJogador && target) {
      const dBloco = Math.hypot(
        target.x + 0.5 - camera.position.x,
        target.y + 0.5 - camera.position.y,
        target.z + 0.5 - camera.position.z,
      );
      if (alvoJogador.dist > dBloco) alvoJogador = null; // o bloco está na frente
    }
    crosshairEl?.classList.toggle("alvo", alvoJogador !== null);

    highlight.visible = target !== null && alvoJogador === null;
    if (target) {
      const [bx0, by0, bz0, bx1, by1, bz1] = blockSelectionBox(
        getBlock(world, target.x, target.y, target.z),
      );
      highlight.position.set(
        target.x + (bx0 + bx1) / 2,
        target.y + (by0 + by1) / 2,
        target.z + (bz0 + bz1) / 2,
      );
      // +0.004 = folga do antigo 1.002 (contorno não some dentro da face)
      highlight.scale.set(bx1 - bx0 + 0.004, by1 - by0 + 0.004, bz1 - bz0 + 0.004);
    }

    hud.setRemesh({
      count: chunkRenderer.remeshCount,
      totalMs: chunkRenderer.remeshMsTotal,
      workerMs: chunkRenderer.remeshWorkerMsTotal,
      config: chunkRenderer.meshConfig,
      lastMs: chunkRenderer.lastRemeshMs,
      porCaminho: chunkRenderer.porCaminho, // este é 1×/frame: sem isto some
    });
    vento.update(dt); // §🌬️: suaviza dir/forca e avança o relógio de animação
    // balanço: `settings.balanco` desligado = força 0 (o `if` do shader sai fora
    // sem recompilar nada). A fase vira radianos aqui, uma vez por frame.
    balancoUniforms.ventoTempo.value = vento.fase * Math.PI * 2;
    balancoUniforms.ventoDir.value.set(vento.x, vento.z);
    balancoUniforms.ventoForca.value = settings.balanco ? vento.forca : 0;
    skyCycle.update(dt, vento); // ciclo dia/noite (cp21) + nuvens andando no vento
    // §💡 a hora manda no canal CÉU da luz voxel (a tocha não obedece a ela).
    // Um uniform por frame — nada de remesh: escurecer o mundo à noite não pode
    // custar geometria nova.
    luzUniforms.nivelCeu.value = skyCycle.nivelCeu;
    // água (2026-07-26): névoa/tint quando o OLHO está submerso + correnteza no
    // tile do atlas. O quadro vem da fase do VENTO (§🌬️), não de um relógio fixo:
    // vento forte = correnteza mais rápida, calmaria = água só respirando.
    aguaFx.update(world, camera.position.x, camera.position.y, camera.position.z);
    // DOIS relógios (playtest 2026-07-27): a água PARADA anda no ritmo e no rumo
    // do vento; a CORRENTE anda no ritmo dela (8 fps fixos), no rumo do próprio
    // fluxo — vento não manda em correnteza. Quem decide qual tile cada bloco usa
    // é o mesher; aqui só se toca os dois relógios.
    const quadroParada = Math.floor(vento.fase * AGUA_FRAMES) % AGUA_FRAMES;
    aguaFluxoRelogio += dt;
    const quadroFluxo = Math.floor(aguaFluxoRelogio * 8) % AGUA_FRAMES;
    // TETO de 12 repinturas/s: cada uma reenvia o atlas INTEIRO (256², 262 KB) à
    // GPU, e com dois relógios independentes a UNIÃO dos dois passaria de 20/s
    // sem o teto. 12/s já não se distingue a olho e devolve metade do upload na
    // GPU do laboratório. Sem repintura nenhuma quando os dois quadros param.
    if (
      (quadroParada !== aguaQuadroParada || quadroFluxo !== aguaQuadroFluxo) &&
      aguaFluxoRelogio - aguaUltimaPintura >= 1 / 12
    ) {
      aguaUltimaPintura = aguaFluxoRelogio;
      aguaQuadroParada = quadroParada;
      aguaQuadroFluxo = quadroFluxo;
      animarAguaAtlas(atlas, quadroParada, vento.ondaAgua, quadroFluxo);
    }
    // mede só o render: o resto do frame é lógica nossa (mesh, física, streaming).
    // `renderer.render` é síncrono do lado da CPU — o que a GPU faz depois não
    // entra aqui, mas é exatamente a fatia que nós controlamos.
    // §📊 tempo de GPU: a consulta abraça o render (só amostra com o F3 aberto
    // ou gravando; o resultado chega alguns frames depois, colhido em `frame`)
    const tRender = performance.now();
    hud.gpuInicio();
    renderer.render(scene, camera);
    hud.gpuFim();
    hud.frame(dtMs, performance.now() - tRender);
  });

  // §🕐 mundo denso: veio inteiro no snapshot e o `buildAll` já rodou — não há
  // streaming a esperar, a tela sai assim que o loop desenha o primeiro frame.
  if (!mundoLazy) loading.concluir();

  // ?hud na URL: abre o F3 no boot (verificação headless do painel de perfil)
  if (bootParams.has("hud")) hud.toggle();
  // ?painel na URL: abre o painel já no boot (verificação headless do cp14)
  if (new URLSearchParams(location.search).has("painel")) activePanel?.toggle();
  if (new URLSearchParams(location.search).has("inv")) inventoryPanel?.toggle();
  // ?amigos na URL: abre o painel de amigos no boot (verificação headless)
  if (new URLSearchParams(location.search).has("amigos")) friendsPanel?.toggle();
  // ?touch (teste no desktop/headless): entra direto no modo toque, sem tap
  if (bootParams.has("touch")) startPlay();
}
