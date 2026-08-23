import {
  VERSION,
  type WorldPreset,
  type WorldTamanho,
  ehPresetSobrevivencia,
  parseWorldPreset,
  parseWorldTamanho,
  sanitizeName,
} from "@logica/shared";
import { playUi, setUiVolume } from "./audio";
import {
  DEFAULT_SETTINGS,
  KEY_ACTION_LABEL,
  type KeyAction,
  keyLabel,
  loadSettings,
  saveSettings,
} from "./settings";
import {
  type WorldRecord,
  deleteWorld,
  downloadWorld,
  importWorldFile,
  listWorlds,
  putWorld,
} from "./worldStore";
import { isTouchDevice } from "./touch";
import { buildChangelogScreen } from "./changelog";
import { iniciarFundoMenu } from "./menuFundo";

/**
 * Menu principal (cp8) — HTML/CSS por cima do canvas, sem GUI de engine.
 * Telas: início (nome + 3 botões) · meus mundos (IndexedDB: jogar/criar/
 * importar/exportar/apagar) · rede (endereço ws://) · configurações.
 * O menu só ESCOLHE; quem inicia o jogo é o main.ts pelos handlers.
 */

export interface PlayWorldChoice {
  id: string;
  name: string;
  createdAt: number;
  /** null = mundo novo (main gera seed); bytes = save carregado do IndexedDB. */
  data: ArrayBuffer | null;
  /** Tipo do mundo NOVO (cp14): colinas, plano ou cabines. */
  preset?: WorldPreset;
  /** Tamanho do mundo NOVO (2026-07-19): P/M/G — save carrega as próprias dims. */
  tamanho?: WorldTamanho;
  /** §🍖 F9: o mundo NOVO nasce em sobrevivência (o "como jogar" do formulário).
   *  Não vai pro IndexedDB — o modo é estado do MUNDO e passa a viver no .ljw. */
  sobrevivencia?: boolean;
}

/** Credenciais do join em rede (cp9). PIN NUNCA persiste em localStorage —
 *  PC de laboratório é compartilhado; guardar deixaria o próximo aluno entrar
 *  com o nome do anterior. */
export interface MultiAuth {
  pin: string;
  codigo?: string;
}

export interface MenuHandlers {
  onPlayWorld(choice: PlayWorldChoice): void;
  onPlayMulti(url: string, auth: MultiAuth): void;
}

const NAME_KEY = "lj-nome";

/**
 * Splashes do menu principal (peça 2 do fundo animado, 2026-08-15) — frases
 * sortudas no espírito do gênero. Público LIVRE: sala de aula, criança.
 *
 * ⚠️ **Nada de MOB** (2026-08-23): 15 frases com creeper, zumbi, esqueleto,
 * aranha, galinha e porco saíram. O jogo não tem bicho nenhum (F8 é fase
 * futura, e `blocks.ts` registra que "não há ovelha"), então citá-los era
 * emprestar fauna de jogo alheio pra falar de uma coisa que não existe aqui.
 * Ao acrescentar frase nova: só bloco, ferramenta, ideia e obra.
 *
 * ⚠️ **Sem REPETIDA** (2026-08-23): 16 frases apareciam duas vezes na lista, o
 * que dobrava a chance delas no sorteio. Antes de somar uma frase, confira que
 * ela ainda não está aqui.
 */
const SPLASHES: string[] = [
  "esse mundo menos quadrado? impossível",
  "as melhores histórias nascem do barro",
  "planta a semente > espera a folha > comemora",
  "minerar sem cair é apenas um detalhe",
  "o bloco de ouro não aceita fiado",
  "a pedra estava quieta até alguém quebrá-la",
  "se não sabe o que fazer, construa uma casa",
  "se sabe o que fazer, construa duas",
  "a casa ficou torta? é arquitetura moderna",
  "não é bagunça, é inventário criativo",
  "quem precisa de mapa quando existe coragem?",
  "a caverna disse olá. eu disse tchau.",
  "um bloco de cada vez e chegamos lá",
  "cuidado com o buraco que você mesmo cavou",
  "hoje é um ótimo dia para quebrar blocos",
  "a madeira não vai se coletar sozinha",
  "craftar é transformar ideias em coisas quadradas",
  "a noite chegou, e a casinha também",
  "não existe bloco inútil, só bloco esperando uma ideia",
  "o diamante estava escondido por vergonha",
  "a picareta trabalha, o jogador comemora",
  "minha estratégia é apertar botões com confiança",
  "se deu errado, chama de experimento",
  "construir é fácil, decorar é outra história",
  "não cave para baixo. sério.",
  "não cave para cima também. talvez.",
  "a lava não é água quente",
  "um balde resolve quase tudo",
  "menos teoria, mais blocos!",
  "pensar primeiro, quebrar depois",
  "cada bloco conta uma história",
  "a criatividade não precisa de crafting table",
  "se pode construir, pode melhorar",
  "o melhor combustível é a curiosidade",
  "bloco pequeno, ideia gigante",
  "o cérebro também faz crafting",
  "a lógica está carregando...",
  "calculando a rota mais quadrada possível",
  "algoritmo encontrado: andar, pensar, construir",
  "erro 404: bloco perdido",
  "carregando criatividade em 3... 2... 1...",
  "processando uma ideia muito quadrada",
  "o cérebro está minerando conhecimento",
  "craftando uma solução...",
  "atenção: criatividade em nível máximo",
  "não é mágica, é pensamento computacional",
  "primeiro pensamos, depois construímos",
  "resolver problemas dá menos trabalho que quebrar tudo",
  "a lógica também sabe fazer parkour",
  "um bom plano vale muitos blocos",
  "se não funcionar, tente de outro jeito",
  "bug encontrado: o jogador está pensando",
  "sistema operacional: criatividade",
  "memória cheia de ideias",
  "iniciando modo construtor",
  "carregando mundo... não derrube a internet",
  "conectando cérebro ao bloco",
  "quase pronto para mais uma aventura",
  "a aventura começa depois do loading",
  "loading de ideias quadradas",
  "o mundo está carregando, respire",
  "aguarde: estamos procurando diamantes",
  "carregando criatividade...",
  "só mais um bloco...",
  "só mais uma fase...",
  "só mais cinco minutinhos...",
  "eu juro que era para ser uma casa",
  "era para ser uma ponte, confia",
  "ninguém perguntou, mas eu fiz uma torre",
  "essa construção tem conceito",
  "não está torto, está criativo",
  "foi planejado. mais ou menos.",
  "a planta da casa sumiu",
  "o arquiteto pediu mais blocos",
  "engenharia movida a picareta",
  "se cair, chamamos de túnel",
  "se ficar bonito, foi de propósito",
  "se ficar feio, é versão beta",
  "o importante é tentar... e colocar uma tocha",
  "quem deixou esse buraco aqui?",
  "provavelmente fui eu",
  "não entre nessa caverna sozinho... ou entre",
  "a tocha é a melhor amiga do explorador",
  "escuridão detectada: cadê a tocha?",
  "todo herói precisa de um balde",
  "todo construtor precisa de madeira",
  "todo estudante precisa de curiosidade",
  "todo problema precisa de uma solução",
  "todo bloco precisa de um lugar",
  "minerar conhecimento é permitido",
  "a melhor ferramenta é uma boa ideia",
  "curiosidade equipada!",
  "criatividade equipada!",
  "pensamento lógico equipado!",
  "modo inventor ativado",
  "modo explorador ativado",
  "modo construtor ativado",
  "modo cientista quase ativado",
  "missão: aprender brincando",
  "objetivo: descobrir como funciona",
  "desafio aceito!",
  "problema encontrado. hora de pensar!",
  "solução encontrada. hora de comemorar!",
  "cada erro ensina alguma coisa",
  "errar também faz parte do jogo",
  "tentativa número... quem está contando?",
  "se não deu certo, temos mais blocos",
  "pensar é o primeiro passo",
  "imaginar é o segundo",
  "construir é o terceiro",
  "agora só falta não explodir",
  "conhecimento minerado com sucesso!",
  "experiência adquirida!",
  "nível de criatividade aumentado!",
  "nível de curiosidade aumentado!",
  "nível de lógica aumentado!",
  "parabéns, você sobreviveu ao loading!",
  "o combustível da aventura é a curiosidade",
];

export function getPlayerName(): string {
  const stored = localStorage.getItem(NAME_KEY);
  // sanitiza na leitura: nome antigo com espaço/especial (gravado antes desta
  // regra) é migrado sozinho; vazio/ausente ganha um genérico novo.
  const nome = stored ? sanitizeName(stored) : `jogador-${Math.random().toString(36).slice(2, 6)}`;
  if (nome !== stored) localStorage.setItem(NAME_KEY, nome);
  return nome;
}

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`menu: #${id} não existe no HTML`);
  return node as T;
}

/** Erro inline no lugar de alert() (popup nativo trava headless e feia a UI). */
function flashError(id: string, msg: string): void {
  const node = document.getElementById(id);
  if (!node) return;
  node.textContent = msg;
  node.classList.remove("hidden");
}

function clearError(id: string): void {
  document.getElementById(id)?.classList.add("hidden");
}

/**
 * Ancora o splash na borda de CIMA do painel de início (2026-08-23).
 *
 * Existe porque o <p> deixou de ser filho do #menu-home: lá dentro a frase
 * longa era recortada pelo `overflow-y: auto` do painel e sobrava em cima do
 * <h1>. Fora do painel ninguém a corta — e ninguém a posiciona: o painel é
 * centrado e a altura dele muda com a tela, então a âncora só existe medida.
 *
 * O CSS ancora o MEIO DE BAIXO da frase (`translate(-50%, -100%)`), logo ela
 * cresce pra cima e o título fica livre por mais comprida que ela seja.
 */
function posicionaSplash(): void {
  const splash = document.getElementById("menu-splash");
  const painel = document.getElementById("menu-home");
  if (!splash || !painel || splash.classList.contains("hidden")) return;
  const r = painel.getBoundingClientRect();
  const meia = splash.offsetWidth / 2;
  const alt = splash.offsetHeight;
  // recuado do canto direito do painel, com clamp pra frase longa não sair
  // pela lateral nem subir pra fora do topo da tela.
  const x = Math.min(Math.max(r.right - 96, meia + 8), window.innerWidth - meia - 8);
  // +10px: a base pousa DENTRO do painel, então a frase o sobrepõe de verdade
  // em vez de flutuar solta acima dele — e ainda para antes do <h1> (que começa
  // nos 28px de padding do painel).
  const y = Math.max(r.top + 10, alt + 8);
  splash.style.left = `${Math.round(x)}px`;
  splash.style.top = `${Math.round(y)}px`;
}
// listener de MÓDULO: showMenu roda a cada volta ao menu e registrá-lo lá
// dentro empilharia um a cada volta.
window.addEventListener("resize", posicionaSplash);

export function showMenu(handlers: MenuHandlers): void {
  const menu = el<HTMLDivElement>("menu");
  const screens = {
    home: el<HTMLElement>("menu-home"),
    worlds: el<HTMLElement>("menu-worlds"),
    multi: el<HTMLElement>("menu-multi"),
    config: el<HTMLElement>("menu-config"),
    changelog: el<HTMLElement>("menu-changelog"),
  };
  function show(which: keyof typeof screens): void {
    for (const [k, s] of Object.entries(screens)) {
      s.classList.toggle("hidden", k !== which);
    }
    // o splash mora FORA do painel, então não some junto com ele: some aqui.
    const sp = document.getElementById("menu-splash");
    sp?.classList.toggle("hidden", which !== "home");
    posicionaSplash();
  }
  menu.classList.remove("hidden");

  // splash engraçado (peça 2 do fundo animado do menu, 2026-08-15): frase
  // aleatória por vez, nova a cada volta ao menu. Vem ANTES do show("home")
  // porque é ele quem revela e ancora a frase.
  const splash = el<HTMLParagraphElement>("menu-splash");
  const sorteia = (): void => {
    splash.textContent = SPLASHES[Math.floor(Math.random() * SPLASHES.length)] ?? "";
    posicionaSplash();
  };
  sorteia();

  show("home");
  // 2ª medida no quadro seguinte: na 1ª o texto recém-trocado ainda pode não
  // ter passado pelo layout, e a largura errada desloca a âncora.
  requestAnimationFrame(posicionaSplash);
  el<HTMLDivElement>("menu-version").textContent = `v${VERSION}`;

  // peça 1 do fundo animado: cubo 3D girando atrás do menu (2026-08-15).
  // Renderer próprio, só texto procedural — precisa existir ANTES do canvas do
  // jogo nascer (start*), então inicia aqui e encerra ao jogar.
  const fundo = iniciarFundoMenu();

  // som de UI: delegação — QUALQUER botão do menu toca (voltar tem som próprio)
  menu.addEventListener("click", (e) => {
    const btn = e.target instanceof HTMLElement ? e.target.closest("button") : null;
    if (btn) playUi(btn.classList.contains("menu-back") ? "back" : "click");
  });

  // motivo de um join recusado sobrevive ao reload via sessionStorage (main.ts)
  const bootErr = sessionStorage.getItem("lj-erro");
  if (bootErr) {
    sessionStorage.removeItem("lj-erro");
    flashError("menu-erro", bootErr);
  }

  // --- nome do jogador (identidade provisória até o PIN do cp9) ---
  const nameInput = el<HTMLInputElement>("menu-nome");
  nameInput.value = getPlayerName();
  nameInput.addEventListener("change", () => {
    // sem espaço nem caractere especial (quebrariam /kicar, /tp, /grupo…)
    const v = sanitizeName(nameInput.value);
    localStorage.setItem(NAME_KEY, v);
    nameInput.value = v;
  });

  // --- navegação ---
  el("menu-btn-single").addEventListener("click", () => {
    void refreshWorlds();
    show("worlds");
  });
  el("menu-btn-multi").addEventListener("click", () => show("multi"));
  el("menu-btn-config").addEventListener("click", () => show("config"));
  el("menu-btn-novidades").addEventListener("click", () => {
    buildChangelogScreen(el("menu-changelog-body"), () => show("home"));
    show("changelog");
  });
  for (const btn of menu.querySelectorAll(".menu-back")) {
    btn.addEventListener("click", () => show("home"));
  }

  function startWorld(choice: PlayWorldChoice): void {
    menu.classList.add("hidden");
    fundo.encerrar();
    handlers.onPlayWorld(choice);
  }

  // --- meus mundos (IndexedDB) ---
  const listEl = el<HTMLDivElement>("menu-world-list");
  async function refreshWorlds(): Promise<void> {
    let worlds: WorldRecord[] = [];
    try {
      worlds = await listWorlds();
    } catch {
      listEl.textContent = "não consegui abrir o armazenamento do navegador";
      return;
    }
    listEl.textContent = worlds.length ? "" : "nenhum mundo ainda — crie um!";
    for (const w of worlds) {
      const row = document.createElement("div");
      row.className = "world-row";

      const name = document.createElement("span");
      name.className = "world-name";
      name.textContent = w.name;
      const when = document.createElement("small");
      when.textContent = new Date(w.updatedAt).toLocaleDateString("pt-BR");

      const play = document.createElement("button");
      play.type = "button";
      play.textContent = "jogar";
      play.addEventListener("click", () => startWorld({ ...w }));

      const exp = document.createElement("button");
      exp.type = "button";
      exp.textContent = "exportar";
      exp.title = "baixa o arquivo .ljw pra compartilhar";
      exp.addEventListener("click", () => downloadWorld(w));

      // apagar em 2 cliques (sem confirm() nativo): 1º arma, 2º executa;
      // 3 s sem o 2º clique desarma sozinho
      const del = document.createElement("button");
      del.type = "button";
      del.textContent = "apagar";
      del.addEventListener("click", () => {
        if (del.dataset["armado"]) {
          void deleteWorld(w.id).then(refreshWorlds);
          return;
        }
        del.dataset["armado"] = "1";
        del.textContent = "confirma?";
        del.classList.add("world-del-armado");
        window.setTimeout(() => {
          delete del.dataset["armado"];
          del.textContent = "apagar";
          del.classList.remove("world-del-armado");
        }, 3000);
      });

      row.append(name, when, play, exp, del);
      listEl.appendChild(row);
    }
  }

  // criação inline (sem prompt/confirm nativos)
  const newName = el<HTMLInputElement>("menu-new-nome");
  const newTipo = el<HTMLSelectElement>("menu-new-tipo");
  el("menu-btn-new").addEventListener("click", () => {
    const name = newName.value.trim();
    if (!name) {
      flashError("menu-worlds-erro", "Dê um nome ao mundo novo.");
      return;
    }
    clearError("menu-worlds-erro");
    startWorld({
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      data: null,
      preset: parseWorldPreset(newTipo.value),
      tamanho: parseWorldTamanho(el<HTMLSelectElement>("menu-new-tamanho").value),
      sobrevivencia: ehPresetSobrevivencia(el<HTMLSelectElement>("menu-new-jogo").value),
    });
  });

  const fileInput = el<HTMLInputElement>("menu-import-file");
  el("menu-btn-import").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    fileInput.value = "";
    if (!file) return;
    importWorldFile(file)
      .then(async (rec) => {
        await putWorld(rec);
        await refreshWorlds();
        clearError("menu-worlds-erro");
      })
      .catch((err: unknown) => {
        flashError(
          "menu-worlds-erro",
          `arquivo inválido: ${err instanceof Error ? err.message : String(err)}`,
        );
      });
  });

  // --- jogar em rede ---
  const addr = el<HTMLInputElement>("menu-endereco");
  const pinInput = el<HTMLInputElement>("menu-pin");
  const codigoInput = el<HTMLInputElement>("menu-codigo");
  addr.value = localStorage.getItem("lj-endereco") ?? `ws://${location.hostname}:8080`;
  el("menu-btn-conectar").addEventListener("click", () => {
    const url = addr.value.trim();
    if (!/^wss?:\/\//.test(url)) {
      flashError("menu-multi-erro", "O endereço precisa começar com ws:// (exemplo: ws://192.168.0.10:8080).");
      return;
    }
    const pin = pinInput.value.trim();
    if (!/^\d{4}$/.test(pin)) {
      flashError("menu-multi-erro", "O PIN precisa ter 4 números. A primeira entrada com o seu nome é a que registra o PIN.");
      return;
    }
    clearError("menu-multi-erro");
    localStorage.setItem("lj-endereco", url); // só o endereço — PIN nunca
    const codigo = codigoInput.value.trim();
    menu.classList.add("hidden");
    fundo.encerrar();
    handlers.onPlayMulti(url, { pin, ...(codigo ? { codigo } : {}) });
  });

  buildConfigScreen(el("menu-config-body"), undefined, () => show("home"));
}

/**
 * Tela de configurações — controles gerados aqui (HTML ficaria gigante).
 * Reusada pelo menu principal E pelo menu de pausa (Esc): `onChanged` roda a
 * cada mudança pro jogo aplicar AO VIVO (sensibilidade, FOV, teclas…).
 * Organizada em CATEGORIAS (pedido do usuário): controles · som · gráficos.
 * O botão "voltar" é SEMPRE desta tela (nunca dois na mesma tela): na raiz sai
 * pra `onBack`, dentro de uma categoria volta pra raiz.
 */
export function buildConfigScreen(
  body: HTMLElement,
  onChanged?: () => void,
  onBack?: () => void,
): void {
  renderConfigRoot(body, onChanged, onBack);
}

function backButton(body: HTMLElement, onClick: () => void): void {
  const back = document.createElement("button");
  back.type = "button";
  back.className = "menu-back";
  back.textContent = "← voltar";
  back.addEventListener("click", onClick);
  body.appendChild(back);
}

type ConfigCategory = "controles" | "som" | "graficos";

const CONFIG_CATEGORIES: { id: ConfigCategory; label: string }[] = [
  { id: "controles", label: "🖱️ controles" },
  { id: "som", label: "🔊 som" },
  { id: "graficos", label: "🖥️ gráficos" },
];

function renderConfigRoot(body: HTMLElement, onChanged?: () => void, onBack?: () => void): void {
  body.textContent = "";
  for (const cat of CONFIG_CATEGORIES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = cat.label;
    btn.addEventListener("click", () => renderConfigPanel(body, cat.id, onChanged, onBack));
    body.appendChild(btn);
  }
  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "restaurar padrões";
  reset.addEventListener("click", () => {
    saveSettings(structuredClone(DEFAULT_SETTINGS));
    onChanged?.();
    renderConfigRoot(body, onChanged, onBack);
  });
  body.appendChild(reset);
  if (onBack) backButton(body, onBack);
}

function renderConfigPanel(
  body: HTMLElement,
  category: ConfigCategory,
  onChanged?: () => void,
  onBack?: () => void,
): void {
  body.textContent = "";
  const s = loadSettings();
  const apply = (): void => {
    saveSettings(s);
    onChanged?.();
  };

  const title = document.createElement("h2");
  title.textContent = CONFIG_CATEGORIES.find((c) => c.id === category)?.label ?? category;
  body.appendChild(title);

  function slider(
    label: string,
    min: number,
    max: number,
    step: number,
    value: number,
    onChange: (v: number) => void,
    format: (v: number) => string = String,
  ): HTMLInputElement {
    const row = document.createElement("label");
    row.className = "config-row";
    const span = document.createElement("span");
    span.textContent = label;
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    const out = document.createElement("output");
    out.textContent = format(value);
    input.addEventListener("input", () => {
      const v = Number(input.value);
      out.textContent = format(v);
      onChange(v);
      apply();
    });
    row.append(span, input, out);
    body.appendChild(row);
    return input;
  }

  if (category === "controles") {
    slider("sensibilidade do mouse", 0.2, 3, 0.1, s.sensitivity, (v) => (s.sensitivity = v), (v) => `${v.toFixed(1)}×`);
    // escala dos controles de toque (2026-07-21): só faz sentido no celular/tablet
    if (isTouchDevice()) {
      slider(
        "escala dos controles (toque)", 0.6, 1.8, 0.1, s.uiScale,
        (v) => (s.uiScale = v), (v) => `${Math.round(v * 100)}%`,
      );
    }

    const hint = document.createElement("p");
    hint.className = "menu-hint";
    hint.textContent = "teclas — clique num botão e aperte a tecla nova (Esc cancela):";
    body.appendChild(hint);
    // UMA captura por vez: sem isto, clicar em vários botões deixava todos
    // "escutando" e uma tecla só redefinia todos juntos (bug-063)
    let capturing = false;
    for (const action of Object.keys(KEY_ACTION_LABEL) as KeyAction[]) {
      const row = document.createElement("div");
      row.className = "config-row";
      const span = document.createElement("span");
      span.textContent = KEY_ACTION_LABEL[action];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = keyLabel(s.keys[action]);
      btn.addEventListener("click", () => {
        if (capturing) return;
        capturing = true;
        btn.textContent = "aperte a tecla…";
        window.addEventListener(
          "keydown",
          (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.code !== "Escape") {
              s.keys[action] = e.code;
              apply();
            }
            btn.textContent = keyLabel(s.keys[action]);
            capturing = false;
          },
          { once: true, capture: true },
        );
      });
      row.append(span, btn);
      body.appendChild(row);
    }
  } else if (category === "som") {
    // som de interface (menus/botões/notificações) — sintetizado, sem assets
    const vol = slider(
      "volume dos sons de interface",
      0, 1, 0.05,
      s.volume,
      (v) => {
        s.volume = v;
        setUiVolume(v); // vale já, sem reabrir nada
      },
      (v) => `${Math.round(v * 100)}%`,
    );
    // amostra ao SOLTAR o slider (no input tocaria uma metralhadora)
    vol.addEventListener("change", () => playUi("notify"));
  } else {
    slider("campo de visão (FOV)", 60, 100, 1, s.fov, (v) => (s.fov = v), (v) => `${v}°`);

    // nitidez: PCs fracos de escola renderizam menos pixels com cap 1
    const sharp = document.createElement("label");
    sharp.className = "config-row";
    sharp.textContent = "alta nitidez (desligue em PC fraco) ";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = s.pixelRatioCap > 1;
    check.addEventListener("change", () => {
      s.pixelRatioCap = check.checked ? 2 : 1;
      apply();
    });
    sharp.appendChild(check);
    body.appendChild(sharp);

    // §🌬️ (2026-07-27): as duas chaves de vida ambiental. Ficam em DESEMPENHO,
    // não em "gráficos bonitinhos", porque é isso que elas são — nuvem custa
    // fill rate (o gargalo do PC de laboratório) e balanço custa vértice.
    const toggle = (rotulo: string, valor: boolean, set: (v: boolean) => void): void => {
      const row = document.createElement("label");
      row.className = "config-row";
      row.textContent = `${rotulo} `;
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = valor;
      cb.addEventListener("change", () => {
        set(cb.checked);
        apply();
      });
      row.appendChild(cb);
      body.appendChild(row);
    };
    toggle("nuvens no céu", s.nuvens, (v) => (s.nuvens = v));
    toggle("balanço de folhas e grama", s.balanco, (v) => (s.balanco = v));

    // streaming (mundo procedural): quanto mundo carrega em volta + custo por frame
    slider(
      "raio de render (mundo procedural)", 2, 12, 1, s.raioRender,
      (v) => (s.raioRender = v),
      (v) => `${v} chunks`,
    );
    slider(
      "tempo de montagem de malha por frame", 1, 16, 1, s.meshMsPorFrame,
      (v) => (s.meshMsPorFrame = v),
      (v) => `${v} ms`,
    );
  }

  backButton(body, () => renderConfigRoot(body, onChanged, onBack));
}
