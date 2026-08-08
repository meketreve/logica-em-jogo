import * as THREE from "three";
import {
  BlockId,
  type Claim,
  colunaDaPosicao,
  colunaDeKey,
  colunaInteressa,
  colunaKey,
  FreioDePose,
  type GroupDef,
  type NamedRegion,
  type Modo,
  type ObjectiveState,
  PLAYER_REACH,
  type PlayerState,
  type RayHit,
  type World,
  SERVER_TICK_RATE,
  type ScenarioModo,
  type Snapshot,
  ITEM_BALDE_AGUA,
  ITEM_BALDE_VAZIO,
  acenderColuna,
  atualizarBloco,
  blockSelectionBox,
  createPlayer,
  criarLuz,
  decodeSnapshot,
  descartarColunaLuz,
  findSpawnY,
  FOME_MAX,
  getBlock,
  isBalde,
  isComida,
  containerTipoDe,
  isInterativo,
  isPlaceable,
  isProfessorOnly,
  isQuadro,
  ancoraDeCopia,
  orientarParaColocar,
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
import { AguaFx } from "./aguaFx";
import { initUiAudio, playUi, setUiVolume } from "./audio";
import { BENCH_SEED, Bench, benchDaUrl, benchSettings } from "./bench";
import { ContainerPanel } from "./container";
import { InventoryPanel } from "./inventory";
import { ChatUi } from "./chat";
import { ChunkRenderer } from "./chunks";
import { ColunasFaltando } from "./colunasFaltando";
import { HotbarUi } from "./hotbarUi";
import { LuzCliente } from "./luzCliente";
import { RemotePlayersView } from "./remotePlayers";
import { learnPlayers, learnWorlds } from "./commands";
import { SkyCycle } from "./daynight";
import { VentoCliente } from "./vento";
import { MateriaisMundo } from "./materiaisMundo";
import { MovimentoDoJogador } from "./movimentoJogador";
import { PainelHost } from "./painelHost";
import { ProgressoCarga } from "./progressoCarga";
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
import { AuthorPanel, GroupPanel, type PanelData } from "./panels";
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

/** Os painéis de tela cheia e a regra de UM MENU POR VEZ (§48). Nasce vazio: os
 *  painéis são criados no startGame (o cp14 depende do papel, o inventário do
 *  atlas), mas o `updateOverlay` do boot já pergunta a ele — daí o objeto vir
 *  antes, e não os cinco `let` que ele substituiu. */
const paineis = new PainelHost(() => menuDePausaAberto() || chat.open);
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
  jogo?.hud.setFase("jogando"); // perfil: daqui pra frente a travada é SENTIDA
  jogo?.hud.marcar("carga concluída"); // §📊 fim da espera do aluno na linha do tempo
  jogo?.iniciarBench(); // ?bench: o trajeto só começa com o mundo na tela
});
/**
 * O jogo em andamento, ou `null` antes do primeiro snapshot.
 *
 * É o ÚNICO ponteiro do módulo pro escopo do jogo — antes eram dezesseis `let
 * … | null`, um por gancho, mais um `started` que dizia a mesma coisa que
 * `jogo !== null` diz agora. O `?.` que sobrou nas chamadas continua sendo
 * necessário pelo mesmo motivo de sempre: mensagem do servidor pode chegar
 * antes do snapshot (o menu ainda está na tela).
 */
let jogo: GameRuntime | null = null;
/** ?bench em andamento — o menu de pausa não pode aparecer por cima do trajeto
 *  (sem pointer lock, `updateOverlay` mostraria o menu assim que a carga sai). */
let benchRodando = false;

// --- Menu de pausa (Esc = pointer lock solto) ---
const overlay = document.getElementById("overlay");
const overlayMain = document.getElementById("overlay-main");
const overlayConfig = document.getElementById("overlay-config");
const crosshairEl = document.getElementById("crosshair");
const hotbarEl = document.getElementById("hotbar");

function showOverlayMain(): void {
  overlayMain?.classList.remove("hidden");
  overlayConfig?.classList.add("hidden");
}

/** O menu de PAUSA está na tela? (ele não tem estado próprio — quem manda é a
 *  classe que o `updateOverlay` acabou de escrever). */
function menuDePausaAberto(): boolean {
  return overlay !== null && !overlay.classList.contains("hidden");
}

function updateOverlay(): void {
  // some quando o jogo tem o controle (mouse travado OU modo toque), o chat
  // está aberto OU um painel do cp14 está na tela (senão cobre o painel)
  const panelOpen = paineis.algumAberto;
  // §🕐 `loading.ativo`: durante o carregamento o ponteiro NÃO está travado —
  // sem esta condição o menu de pausa aparecia junto com a tela de carga.
  // `input.retomando`: o jogo pediu o ponteiro de volta e o navegador ainda não
  // respondeu. Fechar um painel com Esc cai sempre aqui — o Esc do painel É o
  // Esc do usuário, e o Chrome recusa o `requestPointerLock` por ~1,25 s depois
  // dele. Sem esta condição o menu de pausa aparece nesse vão, e o que o aluno
  // vê é "o Esc fechou o menu E abriu o de pausa" (bug-597).
  overlay?.classList.toggle(
    "hidden",
    benchRodando || loading.ativo || input.active || input.retomando || chat.open || panelOpen,
  );
  // §💬 (2026-08-07, pedido do usuário): a hotbar some com QUALQUER menu aberto.
  // A de TOQUE já escondia (setShown ali em cima); a do PC ficava pintada por
  // baixo dos painéis — e duplicada na grade de container/inventário, que
  // mostram a PRÓPRIA faixa de 9. Condição espelhada do overlay: visível só com
  // o jogo no controle (a barra de toque também é o seletor do tablet).
  hotbarEl?.classList.toggle(
    "hidden",
    !(benchRodando || loading.ativo || input.active || input.retomando || chat.open || panelOpen),
  );
  // mira só existe COM o jogo no controle (pedido do usuário: invisível no Esc)
  crosshairEl?.classList.toggle("hidden", !input.active);
  if (input.locked) showOverlayMain(); // próximo Esc abre no painel principal
  // UI de toque acompanha: some sob menu de pausa, chat, painel ou carregamento
  touchControls?.setShown(input.touch && !chat.open && !panelOpen && !loading.ativo);
}
document.addEventListener("pointerlockchange", updateOverlay);
// a recusa também muda o `input.retomando`: sem redesenhar aqui, uma tentativa
// que falha de vez deixaria o menu de pausa escondido pra sempre. Registrado
// DEPOIS do listener do `Input` (construído lá em cima), que é quem atualiza o
// estado — a ordem de registro é a ordem de execução.
document.addEventListener("pointerlockerror", updateOverlay);

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

/**
 * Esc FECHA QUALQUER MENU (2026-08-05, pedido do usuário).
 *
 * Os painéis já tinham o deles (cada um registra o próprio `keydown` em CAPTURE
 * e dá `stopPropagation`, então este handler nem roda quando um deles está na
 * tela). O que faltava era o menu de PAUSA: ele nasce quando o navegador solta
 * o ponteiro, e o único jeito de sair era CLICAR em "voltar ao jogo" — a mesma
 * tecla que o abriu não o fechava. Agora fecha, que é o que a mão espera.
 *
 * A guarda do `#menu`: no menu principal (antes de entrar em mundo nenhum) o
 * overlay está tecnicamente "visível", só que atrás do launcher (z-index 30 vs
 * 20). Sem esta linha, um Esc na tela de escolher mundo travaria o ponteiro
 * sobre o launcher — cursor sumido numa tela de botões.
 */
window.addEventListener("keydown", (e) => {
  if (e.code !== "Escape") return;
  if (!menuDePausaAberto() || chat.open) return;
  if (!(document.getElementById("menu")?.classList.contains("hidden") ?? false)) return;
  e.preventDefault();
  startPlay();
});

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
  jogo?.hud.marcar("raio", `${anterior < 0 ? "join" : anterior} → ${raioEnviado}`);
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
  jogo?.hud.toggle();
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
  return paineis.trocarParaAmigos();
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
/** Anti-griefing (cp24): proteção de áreas ligada? + claims (TODOS recebem).
 *  Com a proteção ligada o aluno também usa a varinha (pra /claim criar). */
let claimsAtivo = false;
/** A dica da tecla do painel de amigos já saiu nesta sessão? (uma vez só) */
let dicaAmigosDada = false;
let latestClaims: Claim[] = [];
// cenário (cp12/13): painel HTML vive fora do jogo 3D; caixas verdes no startGame
const objectivesUi = new ObjectivesUi();
let latestObjectives: { modo: ScenarioModo; objetivos: ObjectiveState[] } | null = null;
/** Grupo do PRÓPRIO jogador (cp13) — vem na mensagem `group`. */
let myGrupo: number | null = null;
/** Composição dos grupos (cp14) — vem na mensagem `groups`; painéis vivem disto. */
let latestGroups: GroupDef[] = [];
const knownComplete = new Set<number>();
let objectivesSeeded = false; // 1ª lista do join não toca som de conquista antiga
/** O snapshot/header decodificado por último era LAZY (LJE0)? O startGame e o
 *  reloadWorld leem isto pra ligar o modo streaming. */
let proximoLazy = false;

/** Nomes online (id→nome) pro autocomplete de comandos com nome de jogador. */
const nomesOnline = new Map<number, string>();

/** Estado consolidado pros painéis — chamada sempre que algo deles muda. */
function pushPanelData(): void {
  paineis.cp14?.update({
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
  paineis.amigos?.update({
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
  jogo?.applyObjectiveBoxes(latestObjectives.objetivos);
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
  if (!jogo) loading.setFase("mundo");
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
      jogo?.applyBlockChanged(msg);
    } else if (msg.type === "blocks_filled") {
      jogo?.applyBlocksFilled(msg);
    } else if (msg.type === "player_moved") {
      // autocomplete de nomes (Tab): quem está online, aprendido do relay
      if (msg.name && nomesOnline.get(msg.id) !== msg.name) {
        nomesOnline.set(msg.id, msg.name);
        learnPlayers([...new Set(nomesOnline.values())]);
        pushFriendsData(); // quem entrou vira candidato a convite
      }
      jogo?.applyPlayerMoved(msg);
    } else if (msg.type === "player_left") {
      nomesOnline.delete(msg.id);
      learnPlayers([...new Set(nomesOnline.values())]);
      pushFriendsData(); // quem saiu some da lista de convidar
      jogo?.applyPlayerLeft(msg.id);
    } else if (msg.type === "spawn") {
      serverSpawn = { x: msg.x, y: msg.y, z: msg.z };
      papel = msg.papel ?? "aluno";
    } else if (msg.type === "regions") {
      latestRegions = msg.regions;
      jogo?.applyRegions(msg.regions);
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
      jogo?.applyQuadros(msg.lista);
    } else if (msg.type === "quadro_changed") {
      jogo?.applyQuadroChanged(msg);
    } else if (msg.type === "container") {
      // §🍖 F10: o conteúdo do bloco que este jogador tem aberto. É ESTA
      // mensagem que abre o painel (o clique direito só pede) — e ela continua
      // chegando enquanto a fornalha cozinha, que é o que faz a barrinha andar.
      paineis.container?.atualizar(msg);
    } else if (msg.type === "container_fechado") {
      paineis.container?.fecharSemAvisar();
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
      jogo?.applyClaims(msg.claims); // o closure lê claimsAtivo (já atualizado acima)
    } else if (msg.type === "friends") {
      // cp24: grupo de amigos + convites. O feedback textual segue chegando por
      // chat do servidor; o PAINEL (2026-08-04) é puro consumo deste estado.
      latestFriends = { equipe: msg.equipe, convites: msg.convites, enviados: msg.enviados };
      pushFriendsData();
    } else if (msg.type === "players") {
      // 2026-07-21: painel de jogadores do professor (conectados + banidos)
      paineis.jogadores?.update({ conectados: msg.conectados, banidos: msg.banidos });
    } else if (msg.type === "mundo_trocando") {
      // chega ANTES do snapshot: o host ainda vai salvar a aula atual e montar
      // a nova (segundos). Sem isto a tela só aparecia no fim, "quase pronta".
      jogo?.iniciarTroca(msg.nome);
      segurarAteATelaPintar(); // e o snapshot espera a tela pintar
    } else if (msg.type === "teleport") {
      jogo?.applyTeleport(msg);
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
      // bug-600: copiar (botão do meio) não existe em sobrevivência — esconde o
      // botão ✋ do tablet junto (o gesto já era no-op lá, o botão só enganava).
      touchControls?.setCopiarDisponivel(msg.efetivo !== "sobrevivencia");
      // playtest: o 🧱 vira "mochila" no rótulo quando o inventário é o do servidor
      touchControls?.setMochilaRotulo(msg.efetivo === "sobrevivencia");
      jogo?.atualizarComerToque(); // §🍖 F6: só dá pra comer em sobrevivência
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
        jogo?.aoMudarMochila();
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
      jogo?.aoMudarMochila();
    } else if (msg.type === "vida") {
      // §🍖 F2: a UI nunca decide — quem machuca, cura e mata é o servidor
      if (vidaForcada !== null) return; // ?vida= congela o HUD (inspeção)
      ultimaVida = msg; // §🍖 F3: o F3 (tecla) mostra vida/fome do servidor
      vitals().aplicar(msg);
      jogo?.atualizarComerToque(); // §🍖 F6: comer some quando a barra enche
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
                : msg.causa === "sufocamento"
                  ? "você ficou soterrado — voltou ao ponto de partida"
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
    jogo?.aplicarColunas(data);
    return;
  }
  const decodificar = (): Snapshot => {
    proximoLazy = magic === LAZY_MAGIC;
    return proximoLazy ? decodeLazyInfo(data) : decodeSnapshot(data);
  };
  if (jogo) {
    // segundo snapshot EM JOGO = o professor trocou a aula (cp19). O que vem
    // depois (regiões, grupos, objetivos, teleporte) repovoa a tela.
    jogo.reloadWorld(decodificar());
    return;
  }
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
    // o chat é menu como os outros (2026-08-05): não abre por cima da mochila.
    // Sem isto, o Enter atravessava o painel aberto e o aluno digitava numa
    // caixa escondida atrás dele.
    if (!paineis.podeAbrir) return;
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
    if (jogo || !loading.ativo) return;
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

/** §💡 Orçamento de luz por frame DURANTE O JOGO. Uma coluna é atômica (não dá
 *  pra parar a propagação no meio), então isto não limita o custo de UMA — ele
 *  limita quantas cabem no mesmo frame, que é o caso que trava: o lote do
 *  streaming traz várias de uma vez. */
const ORCAMENTO_LUZ_MS = 3;

/**
 * O JOGO — tudo o que nasce quando o primeiro snapshot chega e morre quando a
 * aba fecha. Era um `startGame` de 1.100 linhas de closure, e o preço disso
 * estava fora dele: dezesseis `let … | null` de módulo existiam só pra que o
 * despachante de mensagens (`handleServerData`) alcançasse o escopo daquela
 * função. Agora o despachante fala com UM objeto, e `jogo !== null` é o mesmo
 * que o antigo `started`.
 *
 * A regra de corte é a de sempre (§50): o que é PORTA fica de fora. Os métodos
 * públicos aqui são exatamente os pontos que o despachante chama — nenhum
 * deles decide nada, todos aplicam o que o servidor já decidiu.
 */
class GameRuntime {
  private readonly activeConn: Connection;
  /** `let`: a troca de aula (cp19) substitui o mundo debaixo de tudo abaixo. */
  private world: World;
  private worldSeed: number; // clima/bioma do F3 derivam da seed (funções puras)
  /** §💡 Grade de luz voxel — paralela ao mundo, do MESMO tamanho, e 100% do
   *  cliente: é função pura dos bytes, então o servidor não gasta banda nem tick
   *  pra mandar o que os dois lados derivam igual. */
  private readonly luz: LuzCliente;
  /** F2 streaming: mundo ENORME chega vazio (LJE0) e as colunas viajam depois. */
  private mundoLazy: boolean;
  /** Colunas carregadas (chave cz*dims.x+cx) — espelha a regra do servidor:
   *  além de raio+folga, descarta (bytes + geometria) e o servidor re-envia
   *  quando voltar. */
  private colunasCarregadas = new Set<number>();
  private frameCount = 0; // varredura de descarte roda 1×/s (a cada 60 frames)
  /** Colunas APLICADAS desde o boot — só o perfil usa: vira delta na janela de
   *  10 s e, com a distância do `movimento`, diz se a gravação foi voando ou
   *  parado. */
  private colunasRecebidas = 0;
  private readonly materiais: MateriaisMundo;
  private readonly chunkRenderer: ChunkRenderer;
  private readonly aguaFx: AguaFx;
  private readonly torchGlow: TorchGlow;
  private readonly colunasFaltando: ColunasFaltando;
  private readonly regionRenderer: RegionRenderer;
  private readonly claimRenderer: RegionRenderer;
  private readonly quadroRenderer: QuadroRenderer;
  private readonly objectiveBoxes: RegionRenderer;
  private spawn: { x: number; y: number; z: number };
  private readonly player: PlayerState;
  private readonly movimento: MovimentoDoJogador;
  private readonly progresso: ProgressoCarga;
  private readonly outros: RemotePlayersView;
  private readonly highlight: THREE.LineSegments;
  private readonly lookDir = new THREE.Vector3();
  private readonly hotbarUi: HotbarUi;
  /** O F3/perfil. Público: a tela de carga e o `/raio` marcam fases nele. */
  readonly hud: Hud;
  /** Bloco mirado neste frame, ou null — o loop reescreve 1×/frame. */
  private target: RayHit | null = null;
  /** §🍖 F7: jogador mirado neste frame (id + distância), ou null. Calculado no
   *  mesmo lugar que o `target` do bloco, e é ele que decide se o clique
   *  esquerdo vira soco em vez de quebra. */
  private alvoJogador: { id: number; dist: number } | null = null;
  /** ?bench: uma corrida por sessão (a troca de aula não reinicia). */
  private bench: Bench | null = null;

  constructor(snap: Snapshot, activeConn: Connection) {
    this.activeConn = activeConn;
    // atalhos do navegador (Ctrl+W ao correr!) — guarda ativa enquanto joga
    armarGuardaDeAtalhos(() => input.active);
    this.world = snap.world;
    this.worldSeed = snap.seed;
    this.mundoLazy = proximoLazy;
    /** `?semluz` desliga a luz voxel INTEIRA (o mesher volta a pintar tudo aceso,
     *  que é como o jogo era antes do §💡). É o lado B do A/B — mesmo papel do
     *  `?semvida` e do `?semworker`: sem um par medido na MESMA máquina, "a luz
     *  custa X" ou "a luz causa Y" é anedota. */
    this.luz = new LuzCliente(this.world.dims, new URLSearchParams(location.search).has("semluz"));
    // §🎨 atlas + os três materiais do chunk + os uniforms do balanço e da luz +
    // os dois relógios da água. A ordem interna importa (balanço antes da luz) e
    // está escrita lá; aqui só se constrói e se chama `atualizar` 1×/frame.
    this.materiais = new MateriaisMundo();

    // ?atlas na URL: pendura o canvas do texture atlas no canto (inspeção visual)
    if (new URLSearchParams(location.search).has("atlas")) {
      const img = this.materiais.canvas;
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
    this.chunkRenderer = new ChunkRenderer(
      this.world,
      this.materiais.paraChunks,
      scene,
      !semWorker,
      Number.isFinite(meshDepth) && meshDepth > 0 ? meshDepth : undefined,
      this.luz.paraMesher,
    );
    // efeitos de água (2026-07-26): névoa+tint ao submergir, animação da textura
    this.aguaFx = new AguaFx(scene);
    // lazy: nada a meshar ainda — as colunas entram na fila conforme chegam.
    // A luz vem ANTES do mesh: geometria montada sem luz nasceria clara e
    // escureceria num segundo remesh, piscando na cara da turma.
    if (!this.mundoLazy) {
      this.luz.acenderTudo(this.world);
      this.chunkRenderer.buildAll();
    }
    // halo das tochas (cp23): visual puro, segue o mundo autoritativo
    this.torchGlow = new TorchGlow(scene);
    this.torchGlow.setFromWorld(this.world);
    // §🔁 rede de segurança do streaming (ver ROADMAP e `colunasFaltando.ts`)
    this.colunasFaltando = new ColunasFaltando(this.descartarColuna, (cx, cz) => {
      this.activeConn.send(JSON.stringify({ type: "pedir_coluna", cx, cz }));
    });

    // regiões nomeadas (cp11): wireframes — o servidor só manda pra professor
    this.regionRenderer = new RegionRenderer(scene);
    this.regionRenderer.setRegions(latestRegions);
    // claims (cp24): áreas protegidas — wireframe laranja pra TODOS (todo mundo vê
    // onde não pode mexer). A varinha do aluno usa o mesmo regionRenderer (cantos).
    this.claimRenderer = new RegionRenderer(scene, 0xff8c1a);
    this.drawClaims(latestClaims);
    // quadros (2026-07-19): planes de conteúdo (texto/imagem) + editor
    this.quadroRenderer = new QuadroRenderer(scene);
    const quadroEditor = new QuadroEditor();
    // objetivos ATIVOS (cp12/13): caixa verde — aluno vê o alvo DO SEU grupo,
    // professor vê os alvos de todos os grupos
    this.objectiveBoxes = new RegionRenderer(scene, 0x2ecc71);
    if (latestObjectives) this.updateObjectiveBoxes(latestObjectives.objetivos);
    // painéis do cp14: professor = autoria; aluno = grupos. O painel só COMPÕE
    // comandos de chat — decisão continua 100% no servidor.
    const sendCmd = (text: string): void =>
      this.activeConn.send(JSON.stringify({ type: "chat", text }));
    const onPanelToggle = (open: boolean): void => {
      if (open) document.exitPointerLock();
      else input.lock();
      updateOverlay();
    };
    // painel de jogadores (2026-07-21): só professor; aberto por um botão no topo
    // do painel de autoria (some quando não é professor).
    if (papel === "professor") paineis.jogadores = new PlayersPanel(sendCmd, onPanelToggle);
    // troca do painel de autoria pro de jogadores — não é "abrir por cima"
    const openPlayers = (): void => paineis.trocarParaJogadores();
    // painel de amigos (2026-08-04): de TODO jogador — é o dono de área quem
    // convide quem pode construir junto. Sem gate de grupos (o de aluno tem),
    // porque amigos existe justamente em mundo livre, sem grupos de aula.
    paineis.amigos = new FriendsPanel(sendCmd, onPanelToggle);
    pushFriendsData();
    paineis.cp14 =
      papel === "professor"
        ? new AuthorPanel(sendCmd, onPanelToggle, openPlayers)
        : new GroupPanel(sendCmd, onPanelToggle);
    pushPanelData();
    input.onKey(settings.keys.painel, () => {
      // um menu por vez: com outro aberto a tecla não faz NADA (antes fechava o
      // outro por baixo do pano). O próprio painel continua fechando na 2ª tecla.
      if (!paineis.podeAlternar(paineis.cp14)) return;
      // painel do aluno só abre DEPOIS do professor criar grupos (decisão do MVP v2)
      if (papel !== "professor" && latestGroups.length === 0) {
        chat.addMessage("jogo", "o professor ainda não criou grupos — o painel abre quando existirem");
        return;
      }
      paineis.cp14?.toggle();
    });
    input.onKey(settings.keys.amigos, () => paineis.alternar(paineis.amigos));
    if (papel === "professor") {
      chat.addMessage("jogo", `tecla ${keyLabel(settings.keys.painel)} abre o painel de autoria`);
    }

    // Spawn vem do SERVIDOR (fixo, do terreno pristino) — o snapshot pode já
    // estar escavado, então findSpawnY local daria outro lugar (bug-010).
    // Fallback local só se a mensagem spawn não chegou (não deve acontecer).
    this.spawn = serverSpawn ?? {
      x: this.world.sizeX / 2 + 0.5,
      y: findSpawnY(this.world, Math.floor(this.world.sizeX / 2), Math.floor(this.world.sizeZ / 2)),
      z: this.world.sizeZ / 2 + 0.5,
    };
    this.player = createPlayer(this.spawn.x, this.spawn.y, this.spawn.z);
    // §🎮 os duplo-toques (correr/voar), a altura do olho com degrau suave e o
    // odômetro do perfil. A REGRA mora no `shared/controleJogador.ts` (lá há onde
    // rodar teste); aqui fica a leitura do teclado, que só existe no cliente.
    this.movimento = new MovimentoDoJogador(input, () => settings.keys);
    this.movimento.ancorar(this.player.pos);
    // §🕐 o total esperado do raio inicial e o "já chegou" da tela de carga. As
    // contagens chegam por callback (o `Set` é reassinado na troca de aula), e a
    // CONTA mora no shared — é a mesma que o servidor usa pra decidir o que manda.
    this.progresso = new ProgressoCarga(loading, () => ({
      bytes: this.activeConn.stats.bytesIn + this.activeConn.stats.bytesOut,
      prontas: this.colunasCarregadas.size,
      buracos: this.colunasFaltando.tamanho,
      fila: this.chunkRenderer.filaPendente,
    }));
    this.recalcularCarga();
    this.progresso.observar();
    loading.setFase(this.mundoLazy ? "mundo" : "malha");
    // §👥 Os outros jogadores (caixa + plaquinha + LERP) moram em RemotePlayersView.
    this.outros = new RemotePlayersView(scene);

    // --- Mira + colocar/quebrar ---
    // Cubo unitário centrado na origem: o loop o REESCALA/reposiciona pela
    // blockSelectionBox do bloco mirado (contorno segue a forma dos não-cubos).
    this.highlight = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
      new THREE.LineBasicMaterial({ color: 0x000000 }),
    );
    this.highlight.visible = false;
    scene.add(this.highlight);
    // cp16: hotbar virou 9 SLOTS configuráveis (persistem no navegador via
    // localStorage); o inventário (tecla E) escolhe o bloco de cada slot.
    // A lista de colocáveis segue em blocksUi.ts (painel de autoria usa a mesma).
    // Os 9 slots, o selecionado, a varinha, os ícones e os nomes moram em
    // `hotbarUi.ts` — aqui fica só a fiação com o input e com os painéis.
    this.hotbarUi = new HotbarUi(papel, mochila, this.materiais.canvas, {
      claimsAtivo: () => claimsAtivo,
      setVarinhaToque: (ativa) => touchControls?.setVarinha(ativa),
      aoRedesenhar: () => {
        paineis.mochila?.refresh();
        paineis.container?.refresh(); // §🍖 F10: o lado de baixo do painel é a mochila
        this.atualizarComerToque(); // §🍖 F6: trocar de slot na hotbar muda o que o ▣ faz
      },
    });
    this.hotbarUi.refresh();
    // a varinha é a MESMA nos dois caminhos: tecla R e botão 🪄 do toque
    // (celular não tem R)
    input.onKey(settings.keys.varinha, () => this.hotbarUi.toggleVarinha());
    // 1–9 escolhe o slot; scroll cicla os 9 slots
    for (let i = 0; i < 9; i++) {
      input.onKey(`Digit${i + 1}`, () => this.hotbarUi.selecionar(i));
    }
    input.onWheel((dir) => this.hotbarUi.ciclar(dir));
    // inventário (cp16): grade de todos os colocáveis → slot selecionado
    paineis.mochila = new InventoryPanel(
      this.hotbarUi.icons,
      () => this.hotbarUi.meusBlocos,
      () => ({ hotbar: this.hotbarUi.paleta, selected: this.hotbarUi.selected }),
      (blockId) => this.hotbarUi.definirSlotLocal(blockId),
      (slot) => this.hotbarUi.selecionar(slot),
      (open) => {
        if (open) document.exitPointerLock();
        else input.lock();
        updateOverlay();
      },
      mochila,
      (de, para, qtd) =>
        this.activeConn.send(JSON.stringify({ type: "mover_item", de, para, qtd })),
      (id) => this.hotbarUi.nome(id),
      (receita) => this.activeConn.send(JSON.stringify({ type: "fabricar", receita })),
    );
    input.onKey(settings.keys.inventario, () => paineis.alternar(paineis.mochila));

    // §🍖 F10: o painel de container. Ele NÃO tem tecla própria: quem o abre é o
    // clique direito no bloco — ou melhor, é a RESPOSTA do servidor a ele, porque
    // quem decide se o aluno pode ler aquele baú é o gate de claim.
    paineis.container = new ContainerPanel(
      this.hotbarUi.icons,
      mochila,
      (id) => this.hotbarUi.nome(id),
      (x, y, z, de, para, qtd) =>
        this.activeConn.send(JSON.stringify({ type: "mover_container", x, y, z, de, para, qtd })),
      () => this.activeConn.send(JSON.stringify({ type: "fechar_container" })),
      (open) => {
        if (open) {
          // este é o ÚNICO menu que não passa pelo portão: quem o abre é o
          // servidor, e a verdade dele ganha da tela.
          paineis.aoAbrirContainer();
          document.exitPointerLock();
        } else input.lock();
        updateOverlay();
      },
    );

    // varinha: marca o canto na célula MIRADA (o bloco existente, não o ar
    // vizinho) e mostra a marca local — o servidor confirma via chat
    const wandMark = (corner: 1 | 2, t: RayHit): void => {
      this.activeConn.send(
        JSON.stringify({ type: "wand_mark", corner, x: t.x, y: t.y, z: t.z }),
      );
      this.regionRenderer.setCorner(corner, t.x, t.y, t.z);
    };
    input.onMouseButton(0, () => {
      // §🍖 F7: soco vem ANTES do bloco — quem está mirado é gente, e o bloco
      // atrás dela não pode quebrar no mesmo clique. O cliente só manda a
      // intenção: regra, modo, alcance e cooldown são conferidos no servidor.
      if (this.alvoJogador && !this.hotbarUi.varinhaAtiva) {
        this.activeConn.send(JSON.stringify({ type: "atacar", alvo: this.alvoJogador.id }));
        return;
      }
      if (!this.target) return;
      if (this.hotbarUi.varinhaAtiva) {
        wandMark(1, this.target);
        return;
      }
      // balde não quebra bloco em sobrevivência; em criativo o professor pode
      // quebrar com o balde na mão (clique direito segue despejando/recolhendo água).
      if (isBalde(this.hotbarUi.idNaMao() ?? -1) && modoAtual !== "criativo") return;
      this.activeConn.send(
        JSON.stringify({ type: "break_block", x: this.target.x, y: this.target.y, z: this.target.z }),
      );
    });
    input.onMouseButton(2, () => {
      // §🍖 F6: comer vem ANTES do `if (!target)` — comer não precisa de bloco
      // mirado (olhar pro céu e morder tem de funcionar), e é o único uso do
      // clique direito que não tem célula. O servidor decide se a mordida vale
      // (barriga cheia recusa); o cliente só pede, como em todo o resto.
      // bug-601: com um CONTAINER ou bloco INTERATIVO na mira o clique direito
      // ABRE/USA, não come — regra Minecraft (comida na mão + baú = abre o baú).
      // O `target` é consultado aqui de propósito: comer sem bloco mirado segue
      // funcionando (olhar pro céu e morder).
      if (mochila.ativa && isComida(this.hotbarUi.idNaMao() ?? -1)) {
        const alvoId = this.target
          ? getBlock(this.world, this.target.x, this.target.y, this.target.z)
          : null;
        if (alvoId === null || (containerTipoDe(alvoId) === null && !isInterativo(alvoId))) {
          this.activeConn.send(JSON.stringify({ type: "comer", slot: this.hotbarUi.selected }));
          return;
        }
      }
      if (!this.target) return;
      if (this.hotbarUi.varinhaAtiva) {
        wandMark(2, this.target);
        return;
      }
      // bug-601: ABRIR container (baú/fornalha) e USAR bloco interativo
      // (porta/janela) tem prioridade sobre comer/balde/colocar — com QUALQUER
      // item na mão o clique direito abre o baú (regra Minecraft). O servidor
      // decide o efeito e responde `container`/`use_block`; é a resposta que
      // abre o painel — o cliente não abre nada por conta própria, senão o aluno
      // veria a caixa de um baú que o claim do colega nem deixaria ele ler.
      const alvoId = getBlock(this.world, this.target.x, this.target.y, this.target.z);
      if (containerTipoDe(alvoId) !== null || isInterativo(alvoId)) {
        this.activeConn.send(
          JSON.stringify({ type: "use_block", x: this.target.x, y: this.target.y, z: this.target.z }),
        );
        return;
      }
      // balde (2026-07-22): clique direito com balde na mão sempre faz água.
      // Cheio → DESPEJA fonte na célula da face mirada (target+normal). Vazio →
      // RECOLHE a fonte mirada (o raycast parou na água). Estado cheio/vazio
      // troca no slot da hotbar. (Fica ABAIXO do container/interativo: bug-601.)
      {
        // §🍖 F5: o balde virou item de mochila. Em sobrevivência o item vem do
        // slot do SERVIDOR e o slot vai no `slot:` da mensagem — quem troca
        // vazio↔cheio (e responde com a mochila) é o servidor. Em criativo segue
        // escrevendo o slot local da hotbar, como sempre.
        const held = this.hotbarUi.idNaMao();
        if (isBalde(held ?? -1)) {
          const slot = mochila.ativa ? { slot: this.hotbarUi.selected } : {};
          if (held === ITEM_BALDE_AGUA) {
            this.activeConn.send(
              JSON.stringify({
                type: "balde",
                x: this.target.x + this.target.nx,
                y: this.target.y + this.target.ny,
                z: this.target.z + this.target.nz,
                encher: false,
                ...slot,
              }),
            );
            if (!mochila.ativa) this.hotbarUi.definirSlotLocal(ITEM_BALDE_VAZIO); // esvaziou (local)
          } else {
            // só recolhe se mirou numa FONTE (id Agua); fluxo derivado não coleta
            if (getBlock(this.world, this.target.x, this.target.y, this.target.z) !== BlockId.Agua) return;
            this.activeConn.send(
              JSON.stringify({
                type: "balde",
                x: this.target.x,
                y: this.target.y,
                z: this.target.z,
                encher: true,
                ...slot,
              }),
            );
            if (!mochila.ativa) this.hotbarUi.definirSlotLocal(ITEM_BALDE_AGUA); // encheu (local)
          }
          return;
        }
      }
      // quadro (2026-07-19): clique direito abre o EDITOR (texto/imagem); o
      // conteúdo vai por quadro_set e volta pra todos por quadro_changed
      if (isQuadro(alvoId)) {
        const { x, y, z } = this.target;
        quadroEditor.open(this.quadroRenderer.get(x, y, z), (r) => {
          input.lock();
          if (!r) return; // cancelou
          this.activeConn.send(
            JSON.stringify({
              type: "quadro_set", x, y, z, texto: r.texto,
              ...(r.imagem ? { imagem: r.imagem } : {}),
            }),
          );
        });
        return;
      }
      // §🍖 F4: em sobrevivência o bloco vem do slot do SERVIDOR — mão vazia não
      // manda pedido nenhum (o servidor recusaria calado de qualquer jeito).
      const naMao = this.hotbarUi.idNaMao();
      if (naMao === null) return;
      // eixo da porta/janela, frente do móvel e da fornalha, metade da laje,
      // direção da escada: a regra inteira é pura e mora em `shared/orientacao.ts`
      const blockId = orientarParaColocar(naMao, input.yaw, this.target.ny < 0);
      this.activeConn.send(
        JSON.stringify({
          type: "place_block",
          x: this.target.x + this.target.nx,
          y: this.target.y + this.target.ny,
          z: this.target.z + this.target.nz,
          blockId,
        }),
      );
    });

    // botão do meio = copiar o bloco mirado pro slot atual (pedido do usuário)
    input.onMouseButton(1, () => {
      if (!this.target || this.hotbarUi.varinhaAtiva) return;
      // §🍖 F4: em sobrevivência o slot é do servidor — copiar o bloco mirado pra
      // mão daria bloco de graça. O gesto simplesmente não existe lá.
      if (mochila.ativa) return;
      // qualquer porta/janela/móvel/laje/escada copiado vira a entrada única da
      // hotbar (o eixo/direção é re-escolhido pelo olhar na hora de colocar) — é
      // o caminho de volta do `orientarParaColocar`, e mora ao lado dele
      const id = ancoraDeCopia(getBlock(this.world, this.target.x, this.target.y, this.target.z));
      if (!isPlaceable(id)) return; // ar/porta-aberta e afins não vão pra mão
      if (isProfessorOnly(id) && papel !== "professor") return; // aluno não copia rocha-matriz
      this.hotbarUi.definirSlotLocal(id);
    });
    this.hud = new Hud(renderer, {
      checkpoint: 14,
      worldChunks: this.world.dims,
      worldSeed: snap.seed,
      serverHost: serverHostLabel,
    });
    // contexto do perfil: onde/como o jogador estava + a config que muda o custo
    this.hud.contexto = () => ({
      x: this.player.pos.x,
      y: this.player.pos.y,
      z: this.player.pos.z,
      yaw: input.yaw,
      pitch: input.pitch,
      voando: flying && podeVoar(),
      noChao: this.player.onGround,
      raioRender: settings.raioRender,
      meshMsPorFrame: settings.meshMsPorFrame,
      pixelRatioCap: settings.pixelRatioCap,
      fov: settings.fov,
      nuvens: settings.nuvens,
      balanco: settings.balanco,
      distanciaTotal: this.movimento.distanciaTotal,
      colunasRecebidas: this.colunasRecebidas,
      bytesRecebidos: this.activeConn.stats.bytesIn,
    });
    this.hud.setRemesh({
      count: this.chunkRenderer.remeshCount,
      totalMs: this.chunkRenderer.remeshMsTotal,
      workerMs: this.chunkRenderer.remeshWorkerMsTotal,
      config: this.chunkRenderer.meshConfig,
      lastMs: this.chunkRenderer.lastRemeshMs,
      porCaminho: this.chunkRenderer.porCaminho,
    });
    // §📊 tempo de carga por fase (a tela §🕐 já mede; aqui só entra no JSON)
    this.hud.carga = () => loading.relatorio();
    this.hud.marcar(
      "join",
      `${this.world.dims.x}×${this.world.dims.z}×${this.world.dims.y} chunks · seed ${snap.seed}`,
    );
    input.onKey(settings.keys.hud, () => this.hud.toggle());
    // profiler (backlog "ferramentas de dev"): singleplayer roda em Web Worker
    // sem filesystem — o host ignora a mensagem em silêncio, sem erro no cliente.
    document.getElementById("hud-report")?.addEventListener("click", () => {
      // grava 10 s e SÓ ENTÃO envia o relatório agregado (perf.ts do host grava)
      this.hud.record((report) => {
        this.activeConn.send(JSON.stringify({ type: "profile_report", stats: report }));
      });
    });

    // controles de toque (tablet): joystick/arrasto/botões sintetizam o MESMO
    // input do teclado+mouse — o loop e os handlers acima não mudam
    if (isTouchDevice()) {
      this.hotbarUi.habilitarToque(); // hotbar tocável escolhe o slot
      touchControls = new TouchControls(input, {
        keys: () => settings.keys,
        quebrar: () => input.press(0),
        colocar: () => input.press(2),
        // §🍖 F6 (playtest): o ▣ vira "comer" — manda a mordida direto (a
        // regra de "não comer de barriga cheia" é do servidor, como sempre)
        comer: () =>
          this.activeConn.send(JSON.stringify({ type: "comer", slot: this.hotbarUi.selected })),
        copiar: () => input.press(1),
        // mesma regra de um menu por vez do teclado (o dedo não tem Esc)
        inventario: () => paineis.alternar(paineis.mochila),
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
        hud: () => this.hud.toggle(),
        varinha: () => this.hotbarUi.toggleVarinha(),
        amigos: () => paineis.alternar(paineis.amigos),
      });
      // os dois botões condicionais nascem escondidos: aqui é o 1º estado real
      touchControls.setVarinhaDisponivel(papel === "professor" || claimsAtivo);
      touchControls.setAmigosDisponivel(claimsAtivo);
      // bug-600: o ✋ de copiar segue o MODO — some em sobrevivência
      touchControls.setCopiarDisponivel(modoAtual !== "sobrevivencia");
      // playtest: o 🧱 do topo vira a mochila em sobrevivência (rótulo + ícone)
      touchControls.setMochilaRotulo(modoAtual === "sobrevivencia");
      touchControls.setScale(settings.uiScale); // aplica a escala salva de cara
      this.atualizarComerToque(); // §🍖 F6: o ▣ pode já ser o "comer" no boot
      updateOverlay();
    }

    this.hud.extra = () => {
      const m = input.mouseStats;
      const p = this.player.pos;
      // clima/bioma da COLUNA atual (2026-07-20): mesmas funções puras do gen —
      // vale pro terreno GERADO (preset normal); em mundo plano/aula é só o que
      // o gen FARIA ali. Serve pra afinar thresholds (neve/chapada/gramas).
      const bx = Math.floor(p.x);
      const bz = Math.floor(p.z);
      const clima = climaAt(bx, bz, this.worldSeed);
      const bioma = biomaPorClima(clima);
      const grama = gramaPorClima(clima);
      const h = Math.min(heightAt(bx, bz, this.worldSeed, this.world.sizeY), this.world.sizeY - 2);
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
        `bioma ${bioma.nome}  temp ${clima.temp.toFixed(2)}  umid ${clima.umid.toFixed(2)}  seed ${this.worldSeed}\n` +
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

    // move REATIVO: acorda no ritmo do tick, mas quem decide se sai mensagem é o
    // §📡 `FreioDePose` (manda quando muda; parado, heartbeat 1×/2 s). A regra
    // mora no shared porque lá há onde TESTÁ-LA — no cliente não há.
    const freioDePose = new FreioDePose();
    setInterval(() => {
      const cur = {
        x: this.player.pos.x,
        y: this.player.pos.y,
        z: this.player.pos.z,
        yaw: input.yaw,
        pitch: input.pitch,
      };
      if (!freioDePose.aEnviar(cur, performance.now())) return;
      this.activeConn.send(JSON.stringify({ type: "move", ...cur }));
    }, 1000 / SERVER_TICK_RATE);

    // singleplayer: mundo NASCE salvo (fechar a aba logo depois não perde nada)
    // e autossalva no IndexedDB no mesmo ritmo do host Node (30 s)
    // (o mundo do ?bench é descartável: gravar encheria a lista de mundos do
    //  professor de "benchmark" a cada medição)
    if (this.activeConn instanceof WorkerConnection && currentWorld && !benchOpts) {
      void persistWorld();
      setInterval(() => void persistWorld(), 30_000);
    }

    // HUD de rede: taxa por segundo (entrada+saída) + duração do tick do servidor
    let lastNet = { ...activeConn.stats };
    setInterval(() => {
      const s = this.activeConn.stats;
      this.hud.net = {
        msgsPerSec: s.msgsIn + s.msgsOut - (lastNet.msgsIn + lastNet.msgsOut),
        bytesPerSec: s.bytesIn + s.bytesOut - (lastNet.bytesIn + lastNet.bytesOut),
        tickAvgMs: debugStats.tickAvgMs,
        tickMaxMs: debugStats.tickMaxMs,
        jitterMs: jitterDeRede(),
      };
      this.hud.regras = regrasServidor; // §📊 custo das regras no servidor (F3 + perfil)
      // streaming (mundo procedural): colunas carregadas + fila de remesh
      this.hud.stream = {
        colunas: this.colunasCarregadas.size,
        fila: this.chunkRenderer.filaPendente,
        faltando: this.colunasFaltando.tamanho,
        repedidas: this.colunasFaltando.repedidas,
        ultimoLote: this.chunkRenderer.ultimoLote,
      };
      this.hud.luz = this.luz.medidas; // §💡
      lastNet = { ...s };
    }, 1000);
  }

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
  private async entregarPerfilDoBench(report: object, semVida: boolean): Promise<void> {
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
      const prefixo = semVida ? "bench-semvida" : "bench";
      this.hud.baixar(report, prefixo);
      chat.addMessage("jogo", `benchmark concluído — o perfil foi baixado (perf-${prefixo}-*.json)`);
    }
  }

  /** ?bench: trajeto fixo, gravação do trajeto inteiro, export automático. */
  iniciarBench(): void {
    if (!benchOpts || this.bench) return; // uma corrida por sessão (a troca de aula não reinicia)
    const bench = (this.bench = Bench.paraMundo(benchOpts, this.spawn, this.world.dims));
    const opts = benchOpts;
    this.hud.setMeta({ bench: bench.meta() });
    this.hud.marcar(
      "bench: início",
      `${opts.duracaoS}s · raio ${bench.trajeto.raio}${opts.semVida ? " · sem vida ambiental" : ""}`,
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
    this.player.pos.x = inicio.x;
    this.player.pos.y = inicio.y;
    this.player.pos.z = inicio.z;
    this.movimento.ancorar(this.player.pos);
    // grava o trajeto INTEIRO (o botão do F3 grava 10 s; aqui são os 30)
    this.hud.record((report) => {
      benchRodando = false;
      (window as unknown as Record<string, unknown>)["__benchRodando"] = false;
      updateOverlay();
      // headless/automação leem daqui sem depender de download
      (window as unknown as Record<string, unknown>)["__benchPerfil"] = report;
      void this.entregarPerfilDoBench(report, opts.semVida);
    }, opts.duracaoS * 1000);
  }

  /** Liga o laço de render e destrava a tela de carga do mundo denso. */
  iniciar(): void {
    let last = performance.now();
    renderer.setAnimationLoop(() => {
      const now = performance.now();
      const dtMs = now - last;
      last = now;
      const dt = Math.min(dtMs / 1000, 0.05);

      // §🎮 teclado + os dois duplo-toques (correr engatado, alternar voo)
      const cmd = this.movimento.comando(now, { voando: flying, podeVoar: podeVoar() });
      flying = cmd.voando;

      // F2 streaming: processa a fila de mesh (N chunks/frame — config) e SÓ
      // simula física com o chão debaixo dos pés carregado (coluna ausente =
      // ar → cairia no vazio; congela até a coluna chegar)
      let chaoCarregado = true;
      if (this.mundoLazy) {
        // mesh que falhou = coluna suspeita: sai de `colunasCarregadas` e a
        // varredura abaixo a repede (§🔁)
        // pool de mesh solto só enquanto a tela de carga cobre a tela; depois
        // freia (senão os workers roubam núcleo do render — lab 2026-07-27)
        this.chunkRenderer.modoCarga = loading.ativo;
        // §💡 luz ANTES do mesh, sob orçamento próprio. Na tela de carga não há
        // frame a proteger (mesma regra do `modoCarga` do pool), no jogo há.
        // SEMPRE acende pelo menos uma: orçamento apertado não pode significar
        // fila parada — a coluna nunca chegaria a virar mesh.
        {
          const prontas = this.luz.drenar(this.world, loading.ativo ? 16 : ORCAMENTO_LUZ_MS, (key) =>
            this.colunasCarregadas.has(key),
          );
          // o conjunto sujo é ignorado: `enfileirarColuna` já cobre esta coluna
          // e as 4 vizinhas, que é o mesmo alcance.
          for (const c of prontas) this.chunkRenderer.enfileirarColuna(c.cx, c.cz);
        }
        this.chunkRenderer.processarFila(settings.meshMsPorFrame, (fx, fz) => {
          this.colunasCarregadas.delete(fz * this.world.dims.x + fx);
        });
        const { cx: pcx, cz: pcz } = colunaDaPosicao(this.world.dims, this.player.pos.x, this.player.pos.z);
        chaoCarregado = this.colunasCarregadas.has(colunaKey(this.world.dims, pcx, pcz));
        // varredura de descarte 1×/s — a regra é a MESMA função do servidor
        // (`colunaInteressa`), não uma cópia da fórmula: a folga digitada aqui à
        // mão sairia do lugar no dia em que o `FOLGA_DESCARTE` mudasse.
        if ((this.frameCount = (this.frameCount + 1) % 60) === 0) {
          for (const key of this.colunasCarregadas) {
            const { cx, cz } = colunaDeKey(this.world.dims, key);
            if (!colunaInteressa(cx, cz, pcx, pcz, settings.raioRender)) {
              this.colunasCarregadas.delete(key);
              this.descartarColuna(cx, cz);
            }
          }
          // §🔁 MESMA passada: coluna que DEVERIA estar aqui e não está
          this.colunasFaltando.varrer(
            pcx,
            pcz,
            now,
            this.world.dims,
            settings.raioRender,
            this.colunasCarregadas,
          );
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
          this.claimRenderer.cularPorDistancia(this.player.pos.x, this.player.pos.z, raioBlocos);
          this.regionRenderer.cularPorDistancia(this.player.pos.x, this.player.pos.z, raioBlocos);
        }
        // §🕐 a tela de carga só sai com o raio inicial INTEIRO aplicado E a fila
        // do mesher vazia — entrar antes é cair num mundo cheio de buracos
        // §💡 `filaLuz` entra no portão: coluna esperando luz ainda NÃO virou mesh,
        // então `filaPendente` estaria em 0 com o mundo cheio de buraco.
        if (
          loading.ativo &&
          this.progresso.raioCompleto &&
          this.luz.filaVazia &&
          this.chunkRenderer.filaPendente === 0
        ) {
          loading.concluir();
        }
      }
      // ?bench: a posição é FUNÇÃO DO TEMPO (não integração por frame) — PC lento
      // e PC rápido percorrem o mesmo trajeto, que é o ponto do modo. A física
      // fica de fora: o observador atravessa o mundo sem colidir nem cair.
      if (this.bench?.ativo) {
        const a = this.bench.amostra(now);
        this.player.pos.x = a.x;
        this.player.pos.y = a.y;
        this.player.pos.z = a.z;
        this.player.vel.x = this.player.vel.y = this.player.vel.z = 0;
        input.yaw = a.yaw;
        input.pitch = a.pitch;
        if (this.bench.terminou(now)) {
          this.bench.parar();
          this.hud.marcar("bench: fim");
        }
      }
      const yAntesDoPasso = this.player.pos.y;
      if (chaoCarregado && !this.bench?.ativo) {
        stepPlayer(this.world, this.player, cmd, dt);
      }
      // §🎮 olho (agachar) + degrau suave + odômetro — ANTES do respawn: a subida
      // é medida contra o `y` de antes do passo, e um teleporte no meio viraria
      // "degrau" de 40 blocos
      this.movimento.aposOPasso(dt, this.player, yAntesDoPasso, cmd);
      if (this.player.pos.y < -16) this.respawn(); // caiu da borda do mundo

      // jogadores remotos deslizam até o último update (suave mesmo a 10 Hz)
      this.outros.interpolar(dt);

      // FOV abre correndo — mesma transição suave do olho (independe do FPS).
      // Segue a corrida ENGATADA (player.sprinting), não a tecla: soltar o Ctrl
      // segurando o W continua correndo — o FOV tem que continuar aberto
      const fovAlvo = settings.fov * (this.player.sprinting ? 1.1 : 1);
      if (Math.abs(camera.fov - fovAlvo) > 0.01) {
        camera.fov += (fovAlvo - camera.fov) * (1 - Math.exp(-dt * 20));
        camera.updateProjectionMatrix();
      }
      camera.position.set(this.player.pos.x, this.player.pos.y + this.movimento.alturaOlho, this.player.pos.z);
      camera.rotation.set(input.pitch, input.yaw, 0);

      // mira: raycast local (visual) — decisão continua no servidor
      camera.getWorldDirection(this.lookDir);
      this.target = input.active
        ? raycastBlock(
            this.world,
            camera.position.x, camera.position.y, camera.position.z,
            this.lookDir.x, this.lookDir.y, this.lookDir.z,
            PLAYER_REACH,
            // §🍖 F5: o balde vazio é item da MOCHILA em sobrevivência — `idNaMao()`
            // enxerga o slot do servidor (o `slotLocal` é a paleta criativa). Sem
            // isso a mira atravessava a água e o recolher nunca acionava (bug-599).
            this.hotbarUi.idNaMao() === ITEM_BALDE_VAZIO, // balde vazio mira a água (recolher)
          )
        : null;
      // §🍖 F7: jogador na frente? Só onde o soco valeria (sobrevivência + pvp
      // ligado), e só se ele estiver MAIS PERTO que o bloco mirado — senão dava
      // pra bater em quem está atrás da parede. Quem está mirado ganha o clique
      // esquerdo inteiro: o bloco atrás não quebra.
      this.alvoJogador =
        input.active && modoAtual === "sobrevivencia" && pvpLigado
          ? raycastJogador(
              camera.position.x, camera.position.y, camera.position.z,
              this.lookDir.x, this.lookDir.y, this.lookDir.z,
              // a posição do LERP é a que o aluno vê; o `target` do servidor
              // pularia 10×/s e a mira ficaria intermitente
              this.outros.alvosParaMira(),
              PLAYER_REACH,
            )
          : null;
      if (this.alvoJogador && this.target) {
        const dBloco = Math.hypot(
          this.target.x + 0.5 - camera.position.x,
          this.target.y + 0.5 - camera.position.y,
          this.target.z + 0.5 - camera.position.z,
        );
        if (this.alvoJogador.dist > dBloco) this.alvoJogador = null; // o bloco está na frente
      }
      crosshairEl?.classList.toggle("alvo", this.alvoJogador !== null);

      this.highlight.visible = this.target !== null && this.alvoJogador === null;
      if (this.target) {
        const [bx0, by0, bz0, bx1, by1, bz1] = blockSelectionBox(
          getBlock(this.world, this.target.x, this.target.y, this.target.z),
        );
        this.highlight.position.set(
          this.target.x + (bx0 + bx1) / 2,
          this.target.y + (by0 + by1) / 2,
          this.target.z + (bz0 + bz1) / 2,
        );
        // +0.004 = folga do antigo 1.002 (contorno não some dentro da face)
        this.highlight.scale.set(bx1 - bx0 + 0.004, by1 - by0 + 0.004, bz1 - bz0 + 0.004);
      }

      this.hud.setRemesh({
        count: this.chunkRenderer.remeshCount,
        totalMs: this.chunkRenderer.remeshMsTotal,
        workerMs: this.chunkRenderer.remeshWorkerMsTotal,
        config: this.chunkRenderer.meshConfig,
        lastMs: this.chunkRenderer.lastRemeshMs,
        porCaminho: this.chunkRenderer.porCaminho, // este é 1×/frame: sem isto some
      });
      vento.update(dt); // §🌬️: suaviza dir/forca e avança o relógio de animação
      skyCycle.update(dt, vento); // ciclo dia/noite (cp21) + nuvens andando no vento
      // §🎨 tudo que os materiais do chunk precisam por frame: o vento no balanço,
      // a hora no canal céu da luz voxel e os dois relógios da correnteza. Nenhum
      // deles custa geometria — ver `MateriaisMundo.atualizar`.
      this.materiais.atualizar(dt, vento, skyCycle.nivelCeu, settings.balanco);
      // água (2026-07-26): névoa/tint quando o OLHO está submerso.
      this.aguaFx.update(this.world, camera.position.x, camera.position.y, camera.position.z);
      // mede só o render: o resto do frame é lógica nossa (mesh, física, streaming).
      // `renderer.render` é síncrono do lado da CPU — o que a GPU faz depois não
      // entra aqui, mas é exatamente a fatia que nós controlamos.
      // §📊 tempo de GPU: a consulta abraça o render (só amostra com o F3 aberto
      // ou gravando; o resultado chega alguns frames depois, colhido em `frame`)
      const tRender = performance.now();
      this.hud.gpuInicio();
      renderer.render(scene, camera);
      this.hud.gpuFim();
      this.hud.frame(dtMs, performance.now() - tRender);
    });
    // §🕐 mundo denso: veio inteiro no snapshot e o `buildAll` já rodou — não há
    // streaming a esperar, a tela sai assim que o loop desenha o primeiro frame.
    if (!this.mundoLazy) loading.concluir();

    // ?hud na URL: abre o F3 no boot (verificação headless do painel de perfil)
    if (bootParams.has("hud")) this.hud.toggle();
    // ?painel na URL: abre o painel já no boot (verificação headless do cp14)
    if (new URLSearchParams(location.search).has("painel")) paineis.cp14?.toggle();
    if (new URLSearchParams(location.search).has("inv")) paineis.mochila?.toggle();
    // ?amigos na URL: abre o painel de amigos no boot (verificação headless)
    if (new URLSearchParams(location.search).has("amigos")) paineis.amigos?.toggle();
    // ?touch (teste no desktop/headless): entra direto no modo toque, sem tap
    if (bootParams.has("touch")) startPlay();
  }

  /**
   * Joga a coluna fora INTEIRA — os quatro donos de uma vez. Sai do raio (a
   * varredura 1×/s) ou vai ser repedida (§🔁): nos dois casos deixar um dos
   * quatro pra trás esconde o buraco em vez de consertá-lo.
   * `colunasCarregadas` fica de fora de propósito: quem descarta por distância
   * está iterando o próprio Set.
   */
  private readonly descartarColuna = (cx: number, cz: number): void => {
    this.chunkRenderer.descartarColuna(cx, cz);
    this.torchGlow.descartarColuna(cx, cz); // sprites da coluna somem junto
    this.luz.descartar(cx, cz); // §💡 e a luz também
    for (let cy = 0; cy < this.world.dims.y; cy++) {
      this.world.chunks[(cy * this.world.dims.z + cz) * this.world.dims.x + cx] = undefined;
    }
  };

  private readonly drawClaims = (claims: Claim[]): void => {
    this.claimRenderer.setRegions(claims.map((c) => ({ nome: c.dono, min: c.min, max: c.max })));
  };

  private readonly updateObjectiveBoxes = (list: ObjectiveState[]): void => {
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
    this.objectiveBoxes.setRegions(boxes);
  };

  private readonly recalcularCarga = (): void =>
    this.progresso.recalcular(
      this.world.dims,
      this.player.pos.x,
      this.player.pos.z,
      settings.raioRender,
      this.mundoLazy,
    );

  private respawn(): void {
    this.player.pos.x = this.spawn.x;
    this.player.pos.y = this.spawn.y;
    this.player.pos.z = this.spawn.z;
    this.player.vel.x = this.player.vel.y = this.player.vel.z = 0;
  }

  /** Streaming (F2): um lote binário de colunas chegou. */
  aplicarColunas(buf: ArrayBuffer): void {
    // §🔁 lote CORROMPIDO (tamanho/magic errado) joga exceção no meio da
    // aplicação: as colunas que já entraram valem, as demais simplesmente não
    // entram em `colunasCarregadas` — a varredura 1×/s vê o buraco e repede.
    // Sem o catch, a exceção subiria pelo handler de mensagem e derrubaria o
    // resto do frame.
    let cols: ColunaRef[] = [];
    try {
      cols = decodeColunas(buf, this.world);
    } catch (e) {
      console.warn("[streaming] lote de colunas inválido, será repedido:", e);
      return;
    }
    for (const { cx, cz } of cols) {
      const key = cz * this.world.dims.x + cx;
      this.colunasCarregadas.add(key);
      this.colunasFaltando.chegou(key);
      // §💡 a coluna entra na FILA DE LUZ; quem acende (e só então enfileira pro
      // mesh) é o loop de render, sob orçamento de tempo. Acender aqui, no
      // handler da rede, colocaria as 8 colunas de um lote no MESMO frame — o
      // erro que o mesher já cometeu e custou a sessão 27 (9,7-13,4 s de trava
      // no PC do laboratório). Cada coluna custa ~2,5 ms no PC de dev.
      {
        this.luz.enfileirar(cx, cz, this.world.dims.x);
      }
      this.torchGlow.varrerColuna(this.world, cx, cz); // tocha de coluna nova também brilha
    }
    this.colunasRecebidas += cols.length; // acumulado do perfil (≠ do Set, que descarta)
  };

  /** Regiões nomeadas (cp11) — o servidor só manda pra professor. */
  applyRegions(regions: NamedRegion[]): void {
    this.regionRenderer.setRegions(regions);
    this.regionRenderer.clearCorners(); // região criada/apagada: rascunho já era
  };

  /** Áreas protegidas (cp24) — todos recebem. */
  applyClaims(claims: Claim[]): void {
    this.drawClaims(claims);
    this.regionRenderer.clearCorners(); // claim criado: os cantos-rascunho da varinha já eram
    // proteção desligada no meio do jogo: tira o aluno do modo varinha (senão a
    // tecla R fica travada — o guard não deixa reentrar sem proteção ligada)
    this.hotbarUi.revalidarVarinha();
    // barra de toque: varinha e amigos só aparecem quando servem
    touchControls?.setVarinhaDisponivel(papel === "professor" || claimsAtivo);
    touchControls?.setAmigosDisponivel(claimsAtivo);
    this.hotbarUi.refresh(); // a dica da varinha muda conforme a proteção liga/desliga
  };

  applyQuadros(lista: QuadroConteudo[]): void {
    this.quadroRenderer.setAll(lista, this.world);
  }

  applyQuadroChanged(c: QuadroConteudo): void {
    this.quadroRenderer.aplicar(c, this.world);
  }

  /** Caixas verdes dos objetivos ATIVOS (cp12/13). */
  applyObjectiveBoxes(list: ObjectiveState[]): void {
    this.updateObjectiveBoxes(list);
  }

  /**
   * §🕐 O host avisou que a troca COMEÇOU (`mundo_trocando`), antes de salvar a
   * aula atual e montar a nova. Sobe a tela já: `indeterminar()` deixa o anel
   * sem fim (não há o que medir enquanto o trabalho é todo do servidor) e o
   * `reloadWorld` assume quando o snapshot chegar.
   */
  iniciarTroca(nome: string): void {
    this.progresso.indeterminar();
    loading.abrir({
      host: serverHostLabel,
      rede: !(this.activeConn instanceof WorkerConnection),
      titulo: "trocando de aula",
      alvo: nome,
    });
    this.progresso.observar();
    loading.setFase("preparando");
    this.hud.setFase("carregando"); // perfil: o que travar daqui pra frente é carga
    this.hud.marcar("troca de aula", nome); // §📊 causa registrada pro pico que vem
    updateOverlay();
  };

  /**
   * cp19 — o professor trocou a aula: o mundo inteiro chega de novo, com o jogo
   * rodando. Cuidado com o que o servidor NÃO reenvia: um mundo sem regiões (ou
   * sem objetivos) não manda mensagem alguma sobre elas, então o que sobrou do
   * mundo anterior ficaria de fantasma na tela. Por isso zeramos aqui e deixamos
   * as mensagens seguintes (regiões, grupo, objetivos, teleporte) repovoarem.
   */
  reloadWorld(novo: Snapshot): void {
    this.world = novo.world;
    this.worldSeed = novo.seed; // F3 mostra clima/bioma — a seed muda com a aula
    this.mundoLazy = proximoLazy; // aula nova pode ser mundo ENORME (ou deixar de ser)
    this.colunasCarregadas = new Set();
    this.colunasFaltando.limpar(); // §🔁 buracos do mundo VELHO não valem no novo
    // mundo ENORME não tem o que montar aqui (as colunas chegam por streaming);
    // `buildAll` num mundo E varria 460 800 slots vazios = ~19 s de trava
    // §💡 grade de luz NOVA: o mundo pode ter até outro tamanho, e luz do mundo
    // velho num mundo novo seria sombra de parede que não existe mais.
    this.luz.trocarMundo(this.world.dims); // coluna do mundo VELHO não se acende no novo
    if (!this.mundoLazy) this.luz.acenderTudo(this.world);
    this.chunkRenderer.trocarMundo(this.world, !this.mundoLazy, this.luz.paraMesher);
    this.torchGlow.setFromWorld(this.world);

    latestRegions = [];
    this.regionRenderer.setRegions([]);
    this.regionRenderer.clearCorners();
    this.quadroRenderer.setAll([], this.world); // mundo sem quadro não reenvia — sem isso fica fantasma (bug relatado)
    latestObjectives = null;
    this.updateObjectiveBoxes([]);
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
    this.spawn = serverSpawn ?? this.spawn;
    this.respawn();
    chat.addMessage("jogo", "a aula mudou — mundo novo carregado");

    // O servidor criou uma SESSÃO NOVA e o `admitir` zera o raio de interesse
    // pra RAIO_PADRAO — sem reanunciar, tudo além de RAIO_PADRAO+FOLGA nunca
    // chega (o `pedir_coluna` do §🔁 também é recusado lá fora). Mesmo motivo
    // do bug-211, outro caminho.
    raioEnviado = -1;
    enviarRaio();
    this.hud.setMeta({ worldChunks: this.world.dims, worldSeed: novo.seed }); // F3/perfil seguem a aula

    // §🕐 a mesma tela cobre a troca de aula. O pointer lock CONTINUA travado
    // (o aluno estava jogando), então quando ela fechar ele volta ao jogo sem
    // clique nenhum. `respawn()` já rodou: o total sai do spawn NOVO.
    this.recalcularCarga();
    loading.abrir({
      host: serverHostLabel,
      rede: !(this.activeConn instanceof WorkerConnection),
      titulo: "trocando de aula",
    });
    this.progresso.observar();
    loading.setFase(this.mundoLazy ? "mundo" : "malha");
    this.hud.setFase("carregando");
    updateOverlay(); // esconde o menu de pausa se ele estava aberto na troca
    if (!this.mundoLazy) loading.concluir(); // denso: `trocarMundo` já montou tudo
  };

  // servidor manda posição E orientação (volta-onde-parou; futuro /tp)
  applyTeleport(pos: { x: number; y: number; z: number; yaw: number; pitch: number }): void {
    this.player.pos.x = pos.x;
    this.player.pos.y = pos.y;
    this.player.pos.z = pos.z;
    this.player.vel.x = this.player.vel.y = this.player.vel.z = 0;
    // ?yaw/?pitch (screenshot) vencem a orientação do servidor; senão volta-onde-parou
    input.yaw = yawForcado ?? pos.yaw;
    input.pitch = pitchForcado ?? pos.pitch;
  };

  // servidor mandou block_changed (nossa ação OU de outro jogador OU gravidade
  // — cliente não distingue): aplica na cópia local e remesh
  applyBlockChanged(msg: { x: number; y: number; z: number; blockId: number }): void {
    setBlock(this.world, msg.x, msg.y, msg.z, msg.blockId);
    this.chunkRenderer.remeshBlock(msg.x, msg.y, msg.z);
    // §💡 a luz mudou onde ela ALCANÇA (até 15 blocos), não só no ±1 do bloco:
    // por isso o remesh extra sai do conjunto que o motor devolve. Quebrar o
    // teto de uma sala acende o cômodo inteiro — e são vários chunks.
    this.chunkRenderer.remeshSujos(this.luz.aoMudarBloco(this.world, msg.x, msg.y, msg.z));
    this.torchGlow.onBlockChanged(msg.x, msg.y, msg.z, msg.blockId);
    this.quadroRenderer.onBlockChanged(msg.x, msg.y, msg.z, msg.blockId, this.world);
    // gatilho de som (áudio pluga depois); areia caindo dispara os dois por tick
    emitGameEvent(
      msg.blockId === BlockId.Air
        ? { kind: "block_broken" }
        : { kind: "block_placed", blockId: msg.blockId },
    );
  };

  // /regiao encher em lote (cp23b): a caixa inteira chega numa mensagem só —
  // aplica os bytes e remesha cada chunk tocado UMA vez (não uma por bloco)
  applyBlocksFilled(msg: {
  x0: number; y0: number; z0: number;
  x1: number; y1: number; z1: number;
  blockId: number;
  }): void {
      for (let y = msg.y0; y <= msg.y1; y++)
        for (let z = msg.z0; z <= msg.z1; z++)
          for (let x = msg.x0; x <= msg.x1; x++) setBlock(this.world, x, y, z, msg.blockId);
      const min = { x: msg.x0, y: msg.y0, z: msg.z0 };
      const max = { x: msg.x1, y: msg.y1, z: msg.z1 };
      // §💡 lote é grande demais pra `atualizarBloco` célula a célula (uma caixa de
      // 32³ seriam 32 768 repropagações). Reacender as COLUNAS tocadas dá o mesmo
      // resultado — `acenderColuna` zera e recalcula, e o que vem de fora volta
      // pela casca. Custa ~2,5 ms por coluna, e encher em lote é ação de professor.
      for (let cx = Math.max(0, (msg.x0 / 16) | 0); cx <= Math.min(this.world.dims.x - 1, (msg.x1 / 16) | 0); cx++)
        for (let cz = Math.max(0, (msg.z0 / 16) | 0); cz <= Math.min(this.world.dims.z - 1, (msg.z1 / 16) | 0); cz++)
          this.chunkRenderer.remeshSujos(this.luz.aoChegarColuna(this.world, cx, cz));
      this.chunkRenderer.remeshBox(min, max);
      this.torchGlow.onRegionFilled(min, max, msg.blockId);
      this.quadroRenderer.validarTodos(this.world); // encher pode ter engolido quadros
      // UM gatilho de som pro lote inteiro (não milhares)
      emitGameEvent(
        msg.blockId === BlockId.Air
          ? { kind: "block_broken" }
          : { kind: "block_placed", blockId: msg.blockId },
      );
    };

  applyPlayerMoved(msg: { id: number; x: number; y: number; z: number; yaw: number; name?: string }): void {
  this.outros.aoMover(msg);
  }

  applyPlayerLeft(id: number): void {
  this.outros.aoSair(id);
  }


  /** §🍖 F4: a mochila autoritativa mudou — a hotbar se redesenha. */
  aoMudarMochila(): void {
    this.hotbarUi.refresh();
    this.atualizarComerToque(); // §🍖 F6: a comida da mão mudou (pegou/gastou)
  }

  /**
   * §🍖 F6 (playtest): o ▣ do tablet vira "comer" quando DÁ pra morder — mão
   * com comida E fome pra gastar. A recusa final continua no servidor (barriga
   * cheia devolve o item intacto); esta regra é só pra UI não oferecer mordida
   * inútil. Quem decide o rótulo do botão é o touch.ts.
   */
  atualizarComerToque(): void {
    const naMao = this.hotbarUi.idNaMao();
    const fome = ultimaVida?.fome;
    const comendo =
      mochila.ativa && naMao !== null && isComida(naMao) && fome !== undefined && fome < FOME_MAX;
    touchControls?.setModoComer(comendo);
  }
}

/**
 * O primeiro snapshot chegou: constrói o jogo e liga o laço.
 *
 * A saída sem conexão fica AQUI e não dentro do `GameRuntime` de propósito: com
 * `jogo` ainda `null`, o próximo snapshot tenta de novo. O `started` que este
 * ponteiro aposentou era setado FORA desta função — sem conexão ele virava
 * `true` do mesmo jeito, e o cliente ficava preso num estado em que nem
 * `startGame` nem `reloadWorld` rodavam. Nunca aconteceu (o `connect()` vem
 * antes do snapshot), mas era um caminho sem volta.
 */
function startGame(snap: Snapshot): void {
  const activeConn = conn;
  if (!activeConn) return; // snapshot só chega depois do connect()
  jogo = new GameRuntime(snap, activeConn);
  jogo.iniciar();
}
