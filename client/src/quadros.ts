import * as THREE from "three";
import {
  BlockId,
  MAX_QUADRO_IMAGEM_CHARS,
  MAX_QUADRO_TEXTO,
  type QuadroConteudo,
  type World,
  getBlock,
  isQuadro,
  quadroKey,
} from "@logica/shared";

/**
 * Quadros (2026-07-19) — lado cliente. Duas peças:
 *  - QuadroRenderer: um plane com canvas-texture POR quadro com conteúdo,
 *    posicionado na face do painel (a moldura 3D vem do mesher). O servidor é
 *    a verdade; aqui só se desenha o que chega por quadros/quadro_changed.
 *  - QuadroEditor: overlay HTML (SEM popup nativo — regra do projeto) com
 *    textarea + escolher imagem; comprime a imagem pra data URL pequena ANTES
 *    de enviar (o servidor recusa acima do teto).
 */

const P = 1 / 16;

/** Deslocamento do plane de conteúdo + rotação Y por direção (k do id). */
const FACE: readonly { dx: number; dz: number; ry: number }[] = [
  { dx: 2 * P + 0.004, dz: 0.5, ry: Math.PI / 2 }, // frente +x (painel no lado −x)
  { dx: 0.5, dz: 2 * P + 0.004, ry: 0 }, // frente +z
  { dx: 1 - 2 * P - 0.004, dz: 0.5, ry: -Math.PI / 2 }, // frente −x
  { dx: 0.5, dz: 1 - 2 * P - 0.004, ry: Math.PI }, // frente −z
];

function desenharConteudo(
  canvas: HTMLCanvasElement,
  c: QuadroConteudo,
  img: HTMLImageElement | null,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.fillStyle = "#f2eee4";
  ctx.fillRect(0, 0, W, H);
  let yTexto = 0;
  let hTexto = H;
  if (img) {
    // imagem em cima (contain — sem distorcer), texto embaixo se houver
    const areaH = c.texto ? Math.floor(H * 0.68) : H;
    const s = Math.min(W / img.width, areaH / img.height);
    const w = img.width * s;
    const h = img.height * s;
    ctx.drawImage(img, (W - w) / 2, (areaH - h) / 2, w, h);
    yTexto = areaH;
    hTexto = H - areaH;
  }
  if (c.texto) {
    ctx.fillStyle = "#22201c";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // quebra por palavra na largura útil
    const maxW = W - 20;
    const linhas: string[] = [];
    let linha = "";
    for (const palavra of c.texto.split(/\s+/)) {
      const teste = linha ? `${linha} ${palavra}` : palavra;
      if (ctx.measureText(teste).width > maxW && linha) {
        linhas.push(linha);
        linha = palavra;
      } else {
        linha = teste;
      }
    }
    if (linha) linhas.push(linha);
    const lh = 26;
    const maxLinhas = Math.max(1, Math.floor((hTexto - 8) / lh));
    const mostradas = linhas.slice(0, maxLinhas);
    const y0 = yTexto + hTexto / 2 - ((mostradas.length - 1) * lh) / 2;
    mostradas.forEach((l, i) => ctx.fillText(l, W / 2, y0 + i * lh, maxW));
  }
}

export class QuadroRenderer {
  private readonly planes = new Map<string, { mesh: THREE.Mesh; tex: THREE.CanvasTexture }>();
  private readonly conteudos = new Map<string, QuadroConteudo>();

  constructor(private readonly scene: THREE.Scene) {}

  /** Conteúdo atual de uma célula (pré-preenche o editor). */
  get(x: number, y: number, z: number): QuadroConteudo | null {
    return this.conteudos.get(quadroKey(x, y, z)) ?? null;
  }

  /** Lista completa (join / troca de aula): substitui tudo. */
  setAll(lista: QuadroConteudo[], world: World): void {
    for (const key of [...this.planes.keys()]) this.remover(key);
    this.conteudos.clear();
    for (const c of lista) this.aplicar(c, world);
  }

  /** Um quadro mudou (quadro_changed). Texto vazio sem imagem = limpou. */
  aplicar(c: QuadroConteudo, world: World): void {
    const key = quadroKey(c.x, c.y, c.z);
    this.remover(key);
    if (!c.texto && !c.imagem) {
      this.conteudos.delete(key);
      return;
    }
    this.conteudos.set(key, c);
    const id = getBlock(world, c.x, c.y, c.z);
    if (!isQuadro(id)) return; // conteúdo órfão (bloco já trocou): não desenha
    const face = FACE[id - BlockId.QuadroXP];
    if (!face) return;

    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    desenharConteudo(canvas, c, null);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12 * P, 12 * P),
      new THREE.MeshBasicMaterial({ map: tex }),
    );
    mesh.position.set(c.x + face.dx, c.y + 0.5, c.z + face.dz);
    mesh.rotation.y = face.ry;
    this.scene.add(mesh);
    this.planes.set(key, { mesh, tex });

    if (c.imagem) {
      // data URL local: decodifica e redesenha quando carregar
      const img = new Image();
      img.onload = () => {
        desenharConteudo(canvas, c, img);
        tex.needsUpdate = true;
      };
      img.src = c.imagem;
    }
  }

  /** A célula deixou de ser quadro (block_changed/encher): derruba o plane. */
  onBlockChanged(x: number, y: number, z: number, id: number, world: World): void {
    const key = quadroKey(x, y, z);
    if (!this.conteudos.has(key)) return;
    if (!isQuadro(id)) {
      this.remover(key);
      this.conteudos.delete(key);
    } else {
      // quadro trocou de direção no mesmo lugar: redesenha na face nova
      const c = this.conteudos.get(key);
      if (c) this.aplicar(c, world);
    }
  }

  /** Revalida tudo contra o mundo (blocks_filled / troca de aula). */
  validarTodos(world: World): void {
    for (const [key, c] of [...this.conteudos.entries()]) {
      if (!isQuadro(getBlock(world, c.x, c.y, c.z))) {
        this.remover(key);
        this.conteudos.delete(key);
      }
    }
  }

  private remover(key: string): void {
    const p = this.planes.get(key);
    if (!p) return;
    this.scene.remove(p.mesh);
    p.mesh.geometry.dispose();
    (p.mesh.material as THREE.Material).dispose();
    p.tex.dispose();
    this.planes.delete(key);
  }
}

/** Comprime a imagem escolhida pra data URL JPEG dentro do teto do servidor.
 *  null = não coube nem na qualidade mínima (imagem grande demais). */
async function comprimirImagem(file: File): Promise<string | null> {
  const url = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("falha ao ler o arquivo"));
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("arquivo não é uma imagem"));
    i.src = url;
  });
  const canvas = document.createElement("canvas");
  const escala = Math.min(1, 192 / Math.max(img.width, img.height));
  canvas.width = Math.max(1, Math.round(img.width * escala));
  canvas.height = Math.max(1, Math.round(img.height * escala));
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  for (const q of [0.75, 0.55, 0.35]) {
    const data = canvas.toDataURL("image/jpeg", q);
    if (data.length <= MAX_QUADRO_IMAGEM_CHARS) return data;
  }
  return null;
}

export class QuadroEditor {
  private root: HTMLDivElement | null = null;

  get aberto(): boolean {
    return this.root !== null;
  }

  /** Abre o editor pré-preenchido. onSave(null) = cancelou. */
  open(
    atual: QuadroConteudo | null,
    onSave: (r: { texto: string; imagem?: string } | null) => void,
  ): void {
    if (this.root) return;
    document.exitPointerLock();
    let imagemAtual = atual?.imagem;

    const root = document.createElement("div");
    root.style.cssText =
      "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;" +
      "background:rgba(0,0,0,.55);z-index:40";
    const card = document.createElement("div");
    card.style.cssText =
      "background:#1d222b;color:#e8e8e8;border-radius:10px;padding:16px;width:min(420px,92vw);" +
      "display:flex;flex-direction:column;gap:10px;font:14px sans-serif";
    card.innerHTML = `<b style="font-size:16px">✏️ Editar quadro</b>`;

    const ta = document.createElement("textarea");
    ta.maxLength = MAX_QUADRO_TEXTO;
    ta.value = atual?.texto ?? "";
    ta.placeholder = "texto do quadro…";
    ta.style.cssText =
      "width:100%;height:84px;resize:vertical;background:#12151b;color:#e8e8e8;" +
      "border:1px solid #3a4150;border-radius:6px;padding:8px;font:14px sans-serif";
    ta.addEventListener("keydown", (e) => e.stopPropagation()); // teclas são do campo

    const file = document.createElement("input");
    file.type = "file";
    file.accept = "image/*";
    file.style.cssText = "color:#aab";

    const status = document.createElement("div");
    status.style.cssText = "min-height:18px;color:#8fa;font-size:12px";
    if (imagemAtual) status.textContent = "quadro tem uma imagem (escolher outra substitui)";

    const linha = document.createElement("div");
    linha.style.cssText = "display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap";
    const botao = (rotulo: string): HTMLButtonElement => {
      const b = document.createElement("button");
      b.textContent = rotulo;
      b.style.cssText =
        "padding:8px 14px;border-radius:6px;border:1px solid #3a4150;background:#2a3140;" +
        "color:#e8e8e8;cursor:pointer;font:14px sans-serif";
      linha.appendChild(b);
      return b;
    };
    const bRemover = botao("tirar imagem");
    bRemover.style.display = imagemAtual ? "" : "none";
    const bCancelar = botao("cancelar");
    const bSalvar = botao("salvar");
    bSalvar.style.background = "#3d6b3f";

    bRemover.addEventListener("click", () => {
      imagemAtual = undefined;
      file.value = "";
      bRemover.style.display = "none";
      status.textContent = "imagem removida (salve para confirmar)";
    });

    const fechar = (r: { texto: string; imagem?: string } | null): void => {
      root.remove();
      this.root = null;
      window.removeEventListener("keydown", esc, true);
      onSave(r);
    };
    const esc = (e: KeyboardEvent): void => {
      if (e.code === "Escape") {
        e.stopPropagation();
        fechar(null);
      }
    };
    window.addEventListener("keydown", esc, true);
    bCancelar.addEventListener("click", () => fechar(null));
    bSalvar.addEventListener("click", () => {
      const arquivo = file.files?.[0];
      if (!arquivo) {
        fechar({ texto: ta.value, ...(imagemAtual ? { imagem: imagemAtual } : {}) });
        return;
      }
      status.textContent = "comprimindo imagem…";
      void comprimirImagem(arquivo)
        .then((data) => {
          if (data === null) {
            status.textContent = "essa imagem não coube nem comprimida — tente outra";
            status.style.color = "#f88";
            return;
          }
          fechar({ texto: ta.value, imagem: data });
        })
        .catch(() => {
          status.textContent = "não deu pra ler esse arquivo como imagem";
          status.style.color = "#f88";
        });
    });

    card.append(ta, file, status, linha);
    root.appendChild(card);
    document.body.appendChild(root);
    this.root = root;
    ta.focus();
  }
}
