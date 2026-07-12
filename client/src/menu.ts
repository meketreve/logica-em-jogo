import {
  DEFAULT_SETTINGS,
  type GameSettings,
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
}

export interface MenuHandlers {
  onPlayWorld(choice: PlayWorldChoice): void;
  onPlayMulti(url: string): void;
}

const NAME_KEY = "lj-nome";

export function getPlayerName(): string {
  let stored = localStorage.getItem(NAME_KEY);
  if (!stored) {
    stored = `jogador-${Math.random().toString(36).slice(2, 6)}`;
    localStorage.setItem(NAME_KEY, stored);
  }
  return stored;
}

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`menu: #${id} não existe no HTML`);
  return node as T;
}

export function showMenu(handlers: MenuHandlers): void {
  const menu = el<HTMLDivElement>("menu");
  const screens = {
    home: el<HTMLElement>("menu-home"),
    worlds: el<HTMLElement>("menu-worlds"),
    multi: el<HTMLElement>("menu-multi"),
    config: el<HTMLElement>("menu-config"),
  };
  function show(which: keyof typeof screens): void {
    for (const [k, s] of Object.entries(screens)) {
      s.classList.toggle("hidden", k !== which);
    }
  }
  menu.classList.remove("hidden");
  show("home");

  // --- nome do jogador (identidade provisória até o PIN do cp9) ---
  const nameInput = el<HTMLInputElement>("menu-nome");
  nameInput.value = getPlayerName();
  nameInput.addEventListener("change", () => {
    const v = nameInput.value.trim().slice(0, 24);
    if (v) localStorage.setItem(NAME_KEY, v);
    nameInput.value = getPlayerName();
  });

  // --- navegação ---
  el("menu-btn-single").addEventListener("click", () => {
    void refreshWorlds();
    show("worlds");
  });
  el("menu-btn-multi").addEventListener("click", () => show("multi"));
  el("menu-btn-config").addEventListener("click", () => show("config"));
  for (const btn of menu.querySelectorAll(".menu-back")) {
    btn.addEventListener("click", () => show("home"));
  }

  function startWorld(choice: PlayWorldChoice): void {
    menu.classList.add("hidden");
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

      const del = document.createElement("button");
      del.type = "button";
      del.textContent = "apagar";
      del.addEventListener("click", () => {
        if (!confirm(`Apagar o mundo "${w.name}"? Não dá pra desfazer.`)) return;
        void deleteWorld(w.id).then(refreshWorlds);
      });

      row.append(name, when, play, exp, del);
      listEl.appendChild(row);
    }
  }

  el("menu-btn-new").addEventListener("click", () => {
    const name = prompt("Nome do mundo novo:", "meu mundo")?.trim();
    if (!name) return;
    startWorld({ id: crypto.randomUUID(), name, createdAt: Date.now(), data: null });
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
      })
      .catch((err: unknown) => {
        alert(`arquivo inválido: ${err instanceof Error ? err.message : String(err)}`);
      });
  });

  // --- jogar em rede ---
  const addr = el<HTMLInputElement>("menu-endereco");
  addr.value = localStorage.getItem("lj-endereco") ?? `ws://${location.hostname}:8080`;
  el("menu-btn-conectar").addEventListener("click", () => {
    const url = addr.value.trim();
    if (!/^wss?:\/\//.test(url)) {
      alert("endereço precisa começar com ws:// (ex.: ws://192.168.0.10:8080)");
      return;
    }
    localStorage.setItem("lj-endereco", url);
    menu.classList.add("hidden");
    handlers.onPlayMulti(url);
  });

  buildConfigScreen();
}

/** Tela de configurações — controles gerados aqui (HTML ficaria gigante). */
function buildConfigScreen(): void {
  const body = el<HTMLDivElement>("menu-config-body");
  body.textContent = "";
  const s = loadSettings();
  const apply = (): void => saveSettings(s);

  function slider(
    label: string,
    min: number,
    max: number,
    step: number,
    value: number,
    onChange: (v: number) => void,
    format: (v: number) => string = String,
  ): void {
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
  }

  slider("sensibilidade do mouse", 0.2, 3, 0.1, s.sensitivity, (v) => (s.sensitivity = v), (v) => `${v.toFixed(1)}×`);
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

  // som: valor guardado, áudio ainda não existe — controle desabilitado avisa
  const soundRow = document.createElement("label");
  soundRow.className = "config-row";
  soundRow.textContent = "volume (som em breve) ";
  const vol = document.createElement("input");
  vol.type = "range";
  vol.min = "0";
  vol.max = "1";
  vol.step = "0.05";
  vol.value = String(s.volume);
  vol.disabled = true;
  soundRow.appendChild(vol);
  body.appendChild(soundRow);

  // teclas
  const title = document.createElement("p");
  title.className = "menu-hint";
  title.textContent = "teclas — clique num botão e aperte a tecla nova (Esc cancela):";
  body.appendChild(title);
  for (const action of Object.keys(KEY_ACTION_LABEL) as KeyAction[]) {
    const row = document.createElement("div");
    row.className = "config-row";
    const span = document.createElement("span");
    span.textContent = KEY_ACTION_LABEL[action];
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = keyLabel(s.keys[action]);
    btn.addEventListener("click", () => {
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
        },
        { once: true, capture: true },
      );
    });
    row.append(span, btn);
    body.appendChild(row);
  }

  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "restaurar padrões";
  reset.addEventListener("click", () => {
    saveSettings(structuredClone(DEFAULT_SETTINGS));
    buildConfigScreen();
  });
  body.appendChild(reset);
}
