import type { Input } from "./input";
import type { TouchLayout } from "./settings";

/**
 * Controles de toque (tablet) — joystick, arrasto de olhar e botões. SÓ
 * sintetiza o input que o teclado+mouse já geram (input.setKey/applyLook/
 * press): zero caminho novo de decisão, o loop do main.ts não muda.
 * DOM e CSS próprios, injetados aqui (self-contained).
 */

/**
 * Tablet/celular = ponteiro PRIMÁRIO grosso (pointer: coarse). Notebook com
 * touchscreen fica FORA de propósito: o mouse é o ponteiro primário e o modo
 * toque desligaria o pointer lock dele. `?touch` força (testar no desktop).
 */
export function isTouchDevice(): boolean {
  if (new URLSearchParams(location.search).has("touch")) return true;
  return window.matchMedia("(pointer: coarse)").matches;
}

/** O que os botões fazem — fiação vem do main.ts (handlers já existentes). */
export interface TouchActions {
  /** Teclas configuradas AGORA (rebind ao vivo muda o retorno). */
  keys(): { forward: string; back: string; left: string; right: string; jump: string; agachar: string };
  quebrar(): void;
  colocar(): void;
  /** §🍖 F6 (playtest): o botão ▣ vira "comer" quando há comida na mão e fome
   *  pra gastar — manda `{type: comer}` pro servidor, que decide (barriga
   *  cheia devolve o item intacto). */
  comer(): void;
  copiar(): void;
  inventario(): void;
  chat(): void;
  menu(): void;
  hud(): void;
  /** Liga/desliga a varinha (marcar cantos de região/claim sem a tecla R). */
  varinha(): void;
  /** Abre/fecha o painel de amigos (sem a tecla G no tablet). */
  amigos(): void;
  /** Abre/fecha o painel do cp14 — autoria pro professor, grupos pro aluno
   *  (sem a tecla P no tablet). O aluno sem grupos ainda leva o aviso do chat:
   *  o gate é do `main.ts`, não daqui. */
  painel(): void;
}

/**
 * Tela cheia no celular/tablet (pedido do playtest mobile): precisa de gesto
 * do usuário — chamada no startPlay (tap no "voltar ao jogo") e no botão ⛶.
 * Falha em silêncio (iPhone não tem requestFullscreen). Com a tela cheia
 * concedida, tenta travar paisagem — o jogo é horizontal por natureza.
 */
export function solicitarTelaCheia(): void {
  const el = document.documentElement;
  void el
    .requestFullscreen?.()
    .then(() => {
      const o = screen.orientation as { lock?: (or: string) => Promise<void> };
      return o.lock?.("landscape");
    })
    .catch(() => {});
}

// --ts = escala da UI de toque (settings.uiScale, aplicada por setScale). Os
// TAMANHOS escalam por calc() — evito transform:scale() porque o joystick lê
// getBoundingClientRect e o polegar se posiciona por px reais.
// Mora no :root (2026-07-27, layouts mobile) e não mais em #touch-ui: o #chat
// do index.html precisa da MESMA escala pra desviar do joystick, e uma var
// declarada em #touch-ui não é visível fora daquela subárvore.
const CSS = `
:root { --ts: 1; }
#touch-ui, #touch-ui * { touch-action: none; user-select: none; -webkit-user-select: none; }
#touch-look { position: fixed; inset: 0; z-index: 4; }
/* Ancoras em vw/vh, nao px: 2vw/1.6vw/14.7vh no tablet-regua (1024x600, o
   mesmo do shots:tablet) caem quase exatas nos 20px/16px/88px de antes -
   zero mudanca visual nesse aparelho, mas agora acompanha a resolucao real
   em vez de um numero fixo (2026-08-28, pedido do usuario). */
#touch-joy {
  position: fixed; left: 2vw; bottom: 14.7vh;
  width: calc(128px * var(--ts)); height: calc(128px * var(--ts));
  border-radius: 50%; background: rgba(255,255,255,0.08);
  border: 2px solid rgba(255,255,255,0.3); z-index: 8;
}
#touch-joy-thumb {
  position: absolute; left: 50%; top: 50%;
  width: calc(52px * var(--ts)); height: calc(52px * var(--ts));
  margin: calc(-26px * var(--ts)) 0 0 calc(-26px * var(--ts)); border-radius: 50%;
  background: rgba(255,255,255,0.4); pointer-events: none;
}
/* Direcional (2026-08-28): D-pad em cruz no lugar do joystick, mesma ancora.
   Botao vazio de rotulo (holdButton com label "") nao usa o <small> - o
   seletor abaixo evita o vao vazio dele. */
#touch-dpad {
  position: fixed; left: 2vw; bottom: 14.7vh; display: none;
  grid-template-columns: repeat(3, calc(64px * var(--ts)));
  grid-template-rows: repeat(3, calc(64px * var(--ts)));
  grid-template-areas: ". up ." "left . right" ". down .";
  gap: calc(6px * var(--ts)); z-index: 8;
}
#touch-dpad small:empty { display: none; }
#touch-dpad button[data-dir="up"] { grid-area: up; }
#touch-dpad button[data-dir="down"] { grid-area: down; }
#touch-dpad button[data-dir="left"] { grid-area: left; }
#touch-dpad button[data-dir="right"] { grid-area: right; }
#touch-acoes {
  position: fixed; right: 1.6vw; bottom: 14.7vh; display: grid;
  grid-template-columns: repeat(2, calc(64px * var(--ts))); gap: calc(10px * var(--ts)); z-index: 8;
}
/* Presets de layout (2026-08-28): atributo no #touch-ui, cada regra so
   sobrescreve a ancora que muda. Destro = as regras base acima (sem
   atributo), entao nao precisa de bloco proprio aqui. */
#touch-ui[data-layout="canhoto"] #touch-joy { left: auto; right: 2vw; }
#touch-ui[data-layout="canhoto"] #touch-dpad { left: auto; right: 2vw; }
#touch-ui[data-layout="canhoto"] #touch-acoes { right: auto; left: 1.6vw; }
#touch-ui[data-layout="compacto"] #touch-joy { left: 12vw; }
#touch-ui[data-layout="compacto"] #touch-dpad { left: 12vw; }
#touch-ui[data-layout="compacto"] #touch-acoes { right: 9vw; }
#touch-ui[data-layout="espalhado"] #touch-joy { left: 0.5vw; }
#touch-ui[data-layout="espalhado"] #touch-dpad { left: 0.5vw; }
#touch-ui[data-layout="espalhado"] #touch-acoes { right: 0.3vw; }
#touch-ui[data-layout="direcional"] #touch-joy { display: none; }
#touch-ui[data-layout="direcional"] #touch-dpad { display: grid; }
/* Com o 6º botão (📋, 2026-08-21) a fileira CHEIA mede 512px — em retrato de
   600px sobram só 41px de cada lado, folga curta demais pra apostar num
   aparelho mais estreito. O flex-wrap faz a fileira cair pra 2ª linha em vez de
   sair da tela.
   ⚠️ E o wrap OBRIGOU a trocar o left:50% + translateX(-50%): com ele a
   largura DISPONÍVEL do shrink-to-fit é só do meio da tela pra direita (512px
   em 1024px), então a fileira quebrava em duas linhas com meia tela sobrando.
   Sem wrap isso passava batido — o conteúdo transbordava a caixa de 512px e o
   translate recentrava. A faixa inteira (left+right) mede o que a janela tem de
   verdade, e o justify-content faz o centro.
   O pointer-events vai junto: a faixa cobre o topo inteiro, e sem ele o toque
   AO LADO dos botões morreria no container em vez de chegar ao jogo.
   (Sem crase de template aqui dentro: este bloco é um template literal de TS.) */
#touch-topo {
  position: fixed; top: 8px; left: 8px; right: 8px;
  display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; z-index: 8;
  pointer-events: none;
}
.touch-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; width: calc(64px * var(--ts)); height: calc(64px * var(--ts)); border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.35); background: rgba(0,0,0,0.4);
  color: #fff; font: inherit; font-size: calc(22px * var(--ts)); line-height: 1; cursor: pointer;
}
.touch-btn small { font-size: calc(10px * var(--ts)); opacity: 0.85; }
.touch-btn:active { background: rgba(255,255,255,0.25); }
/* botão LIGADO (a varinha): o estado tem de ser visível na barra, porque com
   ela ligada o ⛏/▣ marcam CANTO 1/CANTO 2 em vez de quebrar e colocar */
.touch-btn.ativo { background: rgba(255,215,94,0.35); border-color: #ffd75e; }
/* alvo de dedo: a barra do topo abre mão do quadrado de 64px (ela é uma linha
   de ícone + texto), mas NÃO do piso de 40px — medido em 1024×600, ela estava
   em 30px, abaixo do mínimo que o resto da UI já respeita (2026-08-04) */
#touch-topo .touch-btn { width: auto; height: auto; min-height: 40px; padding: 6px 12px; font-size: 16px; flex-direction: row; gap: 6px; pointer-events: auto; }
#touch-topo .touch-btn small { font-size: 12px; }
`;

/** Troca ícone e legenda de um botão já criado (mesma estrutura do makeButton:
 *  um `<span>` com o ícone e um `<small>` com o nome). */
function rotular(btn: HTMLButtonElement, icone: string, nome: string): void {
  const ico = btn.querySelector("span");
  const label = btn.querySelector("small");
  if (ico) ico.textContent = icone;
  if (label) label.textContent = nome;
}

export class TouchControls {
  private readonly root: HTMLDivElement;
  /** Teclas que o joystick/pular ligaram — pra soltar TODAS ao esconder. */
  private readonly heldKeys = new Set<string>();
  /** Botões que mudam de estado depois de criados (varinha ligada, proteção de
   *  áreas ligada) — guardados pra não varrer o DOM a cada mudança. */
  private btnVarinha: HTMLButtonElement | null = null;
  private btnAmigos: HTMLButtonElement | null = null;
  private btnQuebrar: HTMLButtonElement | null = null;
  private btnColocar: HTMLButtonElement | null = null;
  private btnCopiar: HTMLButtonElement | null = null;
  private btnBlocos: HTMLButtonElement | null = null;
  /** §🍖 F6 (playtest): o ▣ está no modo "comer"? (comida na mão + fome pra
   *  gastar — quem decide o rótulo é o main.ts via setModoComer). */
  private modoComer = false;
  /** §💬 (2026-08-14): o ▣ está no modo "interagir"? (mira apontando pra algo
   *  que o clique direito USA em vez de colocar — quem decide é o main.ts via
   *  setModoInteragir, realimentado pelo id mirado). */
  private modoInteragir = false;
  /** Espelha o `ativo` da varinha pra decidir o que o ▣ faz (canto 2 manda na
   *  frente do comer). */
  private varinhaAtiva = false;
  /** Multiplicador manual do slider (settings.uiScale) — o `--ts` final é
   *  este × o fator automático da tela (recomputarEscala). */
  private userScale = 1;
  private joyPointer: number | null = null;
  private lookPointer: number | null = null;
  private lookX = 0;
  private lookY = 0;

  constructor(
    private readonly input: Input,
    private readonly actions: TouchActions,
  ) {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    this.root = document.createElement("div");
    this.root.id = "touch-ui";
    this.root.className = "hidden";

    // zona de olhar: tela inteira POR BAIXO dos demais controles (z-index) —
    // arrastar em qualquer lugar livre gira a câmera
    const look = document.createElement("div");
    look.id = "touch-look";
    look.addEventListener("pointerdown", (e) => {
      if (this.lookPointer !== null) return; // um dedo de olhar por vez
      this.lookPointer = e.pointerId;
      this.lookX = e.clientX;
      this.lookY = e.clientY;
      look.setPointerCapture(e.pointerId);
    });
    look.addEventListener("pointermove", (e) => {
      if (e.pointerId !== this.lookPointer) return;
      this.input.applyLook(e.clientX - this.lookX, e.clientY - this.lookY);
      this.lookX = e.clientX;
      this.lookY = e.clientY;
    });
    const lookEnd = (e: PointerEvent): void => {
      if (e.pointerId === this.lookPointer) this.lookPointer = null;
    };
    look.addEventListener("pointerup", lookEnd);
    look.addEventListener("pointercancel", lookEnd);

    // joystick: 8 direções via as MESMAS teclas de movimento (settings.keys)
    const joy = document.createElement("div");
    joy.id = "touch-joy";
    const thumb = document.createElement("div");
    thumb.id = "touch-joy-thumb";
    joy.appendChild(thumb);
    const moveStick = (e: PointerEvent): void => {
      const r = joy.getBoundingClientRect();
      const radius = r.width / 2;
      let dx = e.clientX - (r.left + radius);
      let dy = e.clientY - (r.top + radius);
      const dist = Math.hypot(dx, dy);
      if (dist > radius) {
        dx *= radius / dist;
        dy *= radius / dist;
      }
      thumb.style.transform = `translate(${dx}px, ${dy}px)`;
      const k = this.actions.keys();
      const nx = dx / radius;
      const ny = dy / radius;
      // limiar 0.35 por eixo = deadzone no centro + diagonais naturais
      this.syncKey(k.forward, ny < -0.35);
      this.syncKey(k.back, ny > 0.35);
      this.syncKey(k.left, nx < -0.35);
      this.syncKey(k.right, nx > 0.35);
    };
    const dropStick = (e: PointerEvent): void => {
      if (e.pointerId !== this.joyPointer) return;
      this.joyPointer = null;
      thumb.style.transform = "";
      const k = this.actions.keys();
      for (const code of [k.forward, k.back, k.left, k.right]) this.syncKey(code, false);
    };
    joy.addEventListener("pointerdown", (e) => {
      if (this.joyPointer !== null) return;
      this.joyPointer = e.pointerId;
      joy.setPointerCapture(e.pointerId);
      moveStick(e);
    });
    joy.addEventListener("pointermove", (e) => {
      if (e.pointerId === this.joyPointer) moveStick(e);
    });
    joy.addEventListener("pointerup", dropStick);
    joy.addEventListener("pointercancel", dropStick);

    // D-pad (layout "direcional", 2026-08-28): 4 botões cardeais, SEM
    // diagonal, reusando o holdButton (mesmo pressiona/solta do pular).
    // Fica escondido por CSS até o preset "direcional" ligar.
    const dpad = document.createElement("div");
    dpad.id = "touch-dpad";
    const dirBtn = (dir: "up" | "down" | "left" | "right", icon: string, keyOf: () => string) => {
      const btn = this.holdButton(icon, "", keyOf);
      btn.dataset.dir = dir;
      return btn;
    };
    dpad.append(
      dirBtn("up", "↑", () => this.actions.keys().forward),
      dirBtn("left", "←", () => this.actions.keys().left),
      dirBtn("right", "→", () => this.actions.keys().right),
      dirBtn("down", "↓", () => this.actions.keys().back),
    );

    // botões de ação (direita): quebrar/colocar = tap; pular = segurar
    const acoes = document.createElement("div");
    acoes.id = "touch-acoes";
    acoes.append(
      (this.btnCopiar = this.tapButton("✋", "copiar", () => this.actions.copiar())),
      this.holdButton("⤒", "pular", () => this.actions.keys().jump),
      // agachar (2026-07-21): segura = mesma tecla do Shift (andando não cai da
      // borda; voando DESCE). Segurar, como o pular.
      this.holdButton("⤓", "agachar", () => this.actions.keys().agachar),
      (this.btnQuebrar = this.tapButton("⛏", "quebrar", () => this.actions.quebrar())),
    );
    // §🍖 F6 (playtest): o ▣ vira 🍎 "comer" com comida na mão e fome — o rótulo
    // muda por estado (mesmo mecanismo do setVarinha), e o TAP também: manda
    // `comer` em vez de `colocar`. O servidor decide se a mordida vale.
    const btnColocar = this.makeButton("▣", "colocar");
    btnColocar.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      if (this.varinhaAtiva || !this.modoComer) this.actions.colocar();
      else this.actions.comer();
    });
    this.btnColocar = btnColocar;
    acoes.appendChild(btnColocar);

    // Topo: SÓ o que é de jogo (2026-08-04, revisão pedida pelo usuário). Eram
    // 6 botões fixos em 1024×600, e 3 deles não são de jogo: tela cheia é 1× por
    // sessão e HUD é diagnóstico — os dois desceram pro menu de pausa (☰), que
    // já é a porta do "resto". Sobraram os 4 fixos + 2 que só aparecem QUANDO
    // SERVEM: a varinha e os amigos, ambos da proteção de áreas.
    // O 4º fixo é o 📋 (2026-08-21): sem ele o painel do cp14 não tinha porta
    // nenhuma no dedo — a tecla P não existe, e é o painel que o professor usa
    // pra tocar a aula inteira.
    const topo = document.createElement("div");
    topo.id = "touch-topo";
    topo.append(
      this.tapButton("☰", "menu", () => this.actions.menu()),
      // §🍖 F4 (playtest): em sobrevivência o 🧱 abre a MOCHILA — e o rótulo
      // troca junto (setMochilaRotulo), que é o nome que o aluno usa.
      (this.btnBlocos = this.tapButton("🧱", "blocos", () => this.actions.inventario())),
      this.tapButton("💬", "chat", () => this.actions.chat()),
      // varinha: sem tecla R no celular — o toggle liga o modo; aí os botões
      // ⛏/▣ marcam canto 1/canto 2 (mesmo caminho do clique esq/dir)
      (this.btnVarinha = this.tapButton("🪄", "varinha", () => this.actions.varinha())),
      // amigos: sem tecla G no tablet. Só existe com a proteção ligada, que é
      // quando "quem constrói na minha área" vira pergunta.
      (this.btnAmigos = this.tapButton("👥", "amigos", () => this.actions.amigos())),
      // painel do cp14: fixo pros dois papéis. O do aluno é o de GRUPOS e só
      // abre com grupos criados — quem barra (e explica no chat) é o main, não
      // um botão escondido: sumir com ele deixaria o aluno sem saber que existe.
      this.tapButton("📋", "painel", () => this.actions.painel()),
    );
    // os dois nascem escondidos: quem os mostra é o main, pelo papel e pelo
    // estado da proteção de áreas
    this.btnVarinha.classList.add("hidden");
    this.btnAmigos.classList.add("hidden");

    this.root.dataset.layout = "destro" satisfies TouchLayout;
    this.root.append(look, joy, dpad, acoes, topo);
    document.body.appendChild(this.root);

    // recomputa o fator automático quando a tela muda de tamanho/orientação
    // (mesmo padrão de invisivelUi.ts/menuFundo.ts: listener local ao módulo)
    window.addEventListener("resize", () => this.recomputarEscala());
  }

  /** Escala MANUAL da UI de toque (settings.uiScale, slider do menu) — vira o
   *  multiplicador de cima do fator automático da tela (recomputarEscala).
   *  Aplicada no boot e quando a config muda. */
  setScale(scale: number): void {
    this.userScale = scale;
    this.recomputarEscala();
  }

  /** Fator automático pela RESOLUÇÃO da tela (2026-08-28, pedido do usuário):
   *  vmin da tela ÷ vmin do tablet-régua (1024×600, o mesmo do
   *  `shots:tablet`) — nesse aparelho dá exatamente 1, zero mudança no que já
   *  foi calibrado. Clampado pra não sumir num celular minúsculo nem virar
   *  gigante num monitor. O `--ts` final = auto × manual, clampado de novo no
   *  mesmo piso/teto que o slider já respeitava sozinho (0.6..2.7 > 0.6..1.8
   *  porque agora o auto pode empurrar pra cima de tela grande). Recalculado
   *  no `resize` — chamada pelo listener do construtor. */
  private recomputarEscala(): void {
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    const REF_VMIN = 600;
    const autoFator = Math.min(1.5, Math.max(0.75, vmin / REF_VMIN));
    const ts = Math.min(2.7, Math.max(0.6, autoFator * this.userScale));
    // no :root, não no #touch-ui — ver a nota do CSS acima (o #chat lê daqui)
    document.documentElement.style.setProperty("--ts", String(ts));
  }

  /** Disposição dos controles de toque (settings.touchLayout). Solta tudo que
   *  estava pressionado antes de trocar — evita tecla presa se o preset mudar
   *  com o dedo em cima de um botão. */
  setLayout(layout: TouchLayout): void {
    this.releaseAll();
    this.root.dataset.layout = layout;
  }

  /** A varinha serve a este jogador? (professor sempre; aluno só com a
   *  proteção de áreas ligada — a mesma regra do `toggleVarinha`). */
  setVarinhaDisponivel(disponivel: boolean): void {
    this.btnVarinha?.classList.toggle("hidden", !disponivel);
  }

  /** Amigos só existe com a proteção de áreas ligada (é ela que dá sentido a
   *  "quem está no meu grupo constrói na minha área"). */
  setAmigosDisponivel(disponivel: boolean): void {
    this.btnAmigos?.classList.toggle("hidden", !disponivel);
  }

  /** Copiar (botão do meio do mouse) não existe em sobrevivência — o slot é do
   *  servidor e copiar daria bloco de graça. O botão ✋ some nesse modo
   *  (bug-600), junto do `if (mochila.ativa) return` do handler no main.ts. */
  setCopiarDisponivel(disponivel: boolean): void {
    this.btnCopiar?.classList.toggle("hidden", !disponivel);
  }

  /** A varinha ligou/desligou: destaca o botão E TROCA o rótulo de ⛏/▣, que
   *  passam a marcar os cantos. Sem isto o aluno fica com dois botões fazendo
   *  outra coisa e nenhum sinal na barra (a linha da hotbar já avisa, mas ela
   *  fica do outro lado da tela). */
  setVarinha(ativa: boolean): void {
    this.varinhaAtiva = ativa;
    this.btnVarinha?.classList.toggle("ativo", ativa);
    if (this.btnQuebrar) rotular(this.btnQuebrar, ativa ? "①" : "⛏", ativa ? "canto 1" : "quebrar");
    this.atualizarBtnColocar();
  }

  /** §🍖 F6 (playtest): o ▣ vira 🍎 "comer" quando dá pra morder (comida na mão
   *  e fome pra gastar). Quem decide é o main.ts; aqui só se rotula e se muda o
   *  que o tap faz. */
  setModoComer(comendo: boolean): void {
    this.modoComer = comendo;
    this.atualizarBtnColocar();
  }

  /** §💬 (2026-08-14): o ▣ vira "interagir" quando a mira aponta pra algo que
   *  o clique direito USA em vez de colocar (baú/fornalha/porta/janela/cama).
   *  Quem alimenta é o main.ts, no frame em que o id mirado muda. Guarda por
   *  igualdade: o main pode chamar de novo com o mesmo valor sem re-render. */
  setModoInteragir(interagir: boolean): void {
    if (this.modoInteragir === interagir) return;
    this.modoInteragir = interagir;
    this.atualizarBtnColocar();
  }

  /** §🍖 F4 (playtest): em sobrevivência o 🧱 é a MOCHILA do servidor, não a
   *  paleta de blocos — o rótulo acompanha o modo (o nome que o aluno usa). */
  setMochilaRotulo(survival: boolean): void {
    if (this.btnBlocos) rotular(this.btnBlocos, survival ? "🎒" : "🧱", survival ? "mochila" : "blocos");
  }

  /** Um rótulo só pro ▣, decido pelos estados que competem nele: a varinha
   *  (canto 2) manda na frente de tudo; o interagir (2026-08-14) vence o comer
   *  porque o clique direito abre/USA o bloco mirado ANTES de morder
   *  (main.ts:1362-1383) — o rótulo espelha a ordem real do gesto. */
  private atualizarBtnColocar(): void {
    if (!this.btnColocar) return;
    if (this.varinhaAtiva) rotular(this.btnColocar, "②", "canto 2");
    else if (this.modoInteragir) rotular(this.btnColocar, "👆", "interagir");
    else if (this.modoComer) rotular(this.btnColocar, "🍎", "comer");
    else rotular(this.btnColocar, "▣", "colocar");
  }

  /** Mostra/esconde a UI de toque (main.ts decide junto com o overlay). */
  setShown(shown: boolean): void {
    this.root.classList.toggle("hidden", !shown);
    if (!shown) this.releaseAll();
  }

  /** Solta tudo que estava pressionado (esconder no meio de um toque). */
  private releaseAll(): void {
    for (const code of this.heldKeys) this.input.setKey(code, false);
    this.heldKeys.clear();
    this.joyPointer = null;
    this.lookPointer = null;
  }

  /** setKey com memória — releaseAll sabe o que soltar mesmo após rebind. */
  private syncKey(code: string, down: boolean): void {
    this.input.setKey(code, down);
    if (down) this.heldKeys.add(code);
    else this.heldKeys.delete(code);
  }

  private tapButton(icon: string, label: string, fn: () => void): HTMLButtonElement {
    const btn = this.makeButton(icon, label);
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault(); // sem clique sintetizado depois
      fn();
    });
    return btn;
  }

  /** Botão de SEGURAR: mantém a tecla `keyOf()` pressionada enquanto o dedo
   *  está no botão (pular, agachar). Lê a tecla na hora (rebind ao vivo). */
  private holdButton(icon: string, label: string, keyOf: () => string): HTMLButtonElement {
    const btn = this.makeButton(icon, label);
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      btn.setPointerCapture(e.pointerId);
      this.syncKey(keyOf(), true);
    });
    const solta = (): void => this.syncKey(keyOf(), false);
    btn.addEventListener("pointerup", solta);
    btn.addEventListener("pointercancel", solta);
    return btn;
  }

  private makeButton(icon: string, label: string): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "touch-btn";
    const ico = document.createElement("span");
    ico.textContent = icon;
    const nome = document.createElement("small");
    nome.textContent = label;
    btn.append(ico, nome);
    return btn;
  }
}
