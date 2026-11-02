import * as THREE from "three";
import { BICHOS, FLAG_BICHO, type TipoBicho } from "@logica/shared";
import { SkyCycle } from "../daynight";
import { criarCorpo } from "../playerBody";
import { MASCARA, PAPEL, type V3 } from "./geometria";
import { modeloDe } from "./modelos";
import { BichosView, brilhoDaLuzVoxel } from "./render";

/**
 * §🐄 PRÉVIA: todos os tipos × variantes × estados lado a lado, com o MESMO
 * céu e as MESMAS luzes do jogo (`SkyCycle`, sol 2,2 + ambiente 0,55) e um
 * jogador de referência na ponta — bicho que destoa do jogador no dia ou na
 * noite aparece aqui antes de aparecer na aula. Só desenvolvimento (ver o
 * comentário do `bichos.html`).
 */

const q = new URLSearchParams(location.search);
const hora = Number(q.get("hora") ?? 12);
const vista = q.get("vista") ?? "geral";
const manual = q.has("manual");
const comCaixas = q.has("caixas");

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(1);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 512);
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(60, 100, 40);
const ambient = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(sun, ambient);
const sky = new SkyCycle(sun, ambient, scene, camera, false);
sky.sync(hora, false);
sky.update(0);

// luz voxel de céu aberto (15) na hora pedida: a mesma conta do terreno
const brilho = (): number => brilhoDaLuzVoxel(15 << 4, sky.nivelCeu);
const view = new BichosView(scene, { luzEm: () => brilho() });

// ── chão de grama (16 texels por bloco, como o atlas) ──
function texturaRuido(base: [number, number, number], vary: number, semente: number): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 16;
  const ctx = c.getContext("2d")!;
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      let h = Math.imul(x + semente, 374761393) ^ Math.imul(y, 668265263);
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      const v = ((((h ^ (h >>> 16)) >>> 0) / 4294967296) - 0.5) * 2 * vary;
      ctx.fillStyle = `rgb(${base[0] + v},${base[1] + v},${base[2] + v})`;
      ctx.fillRect(x, y, 1, 1);
    }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
const gramaTex = texturaRuido([92, 158, 60], 14, 1);
gramaTex.repeat.set(60, 60);
const chaoMat = new THREE.MeshLambertMaterial({ map: gramaTex });
const chao = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), chaoMat);
chao.rotation.x = -Math.PI / 2;
chao.position.set(8, 0, 10);
scene.add(chao);
const folhaMat = new THREE.MeshLambertMaterial({ map: texturaRuido([58, 120, 40], 22, 7) });
const aguaMat = new THREE.MeshLambertMaterial({ color: 0x3a78d0, transparent: true, opacity: 0.45, depthWrite: false });
const materiaisDoMundo = [chaoMat, folhaMat];

// ── o elenco ──
interface Item {
  tipo: TipoBicho;
  variante: number;
  flags: number;
  rotulo: string;
  y?: number;
  /** liga `ferido` por 0,3 s a cada 2 s (o clarão nasce na borda) */
  pisca?: boolean;
}
const F = FLAG_BICHO;
const v = (tipo: TipoBicho, variante: number, flags = 0, extra: Partial<Item> = {}): Item => ({
  tipo,
  variante,
  flags,
  rotulo: extra.rotulo ?? BICHOS[tipo].variantes[variante]!.nome,
  ...extra,
});
// do fundo (z pequeno) pra frente: os grandes atrás, os pequenos perto da câmera
const LINHAS: { tipo: TipoBicho; itens: Item[] }[] = [
  {
    tipo: "vaca",
    itens: [
      v("vaca", 0), v("vaca", 1), v("vaca", 2),
      v("vaca", 0, F.filhote, { rotulo: "bezerro" }), v("vaca", 2, F.filhote, { rotulo: "bezerro nelore" }),
      v("vaca", 1, F.movendo, { rotulo: "andando" }), v("vaca", 0, F.amor, { rotulo: "amor" }),
      v("vaca", 2, 0, { rotulo: "ferido", pisca: true }),
    ],
  },
  {
    tipo: "ovelha",
    itens: [
      v("ovelha", 0), v("ovelha", 1), v("ovelha", 2), v("ovelha", 3),
      v("ovelha", 0, F.tosquiada, { rotulo: "tosquiada" }), v("ovelha", 2, F.tosquiada, { rotulo: "marrom tosq." }),
      v("ovelha", 0, F.filhote, { rotulo: "cordeiro" }), v("ovelha", 3, F.movendo, { rotulo: "andando" }),
    ],
  },
  {
    tipo: "cao",
    itens: [
      v("cao", 0), v("cao", 1), v("cao", 2),
      v("cao", 0, F.sentado, { rotulo: "sentado" }), v("cao", 0, F.domado, { rotulo: "domado" }),
      v("cao", 2, F.domado | F.sentado, { rotulo: "domado sentado" }), v("cao", 1, F.filhote, { rotulo: "filhote" }),
      v("cao", 0, F.movendo, { rotulo: "andando" }),
    ],
  },
  {
    tipo: "arara",
    itens: [
      v("arara", 0, 0, { y: 1 }), v("arara", 1, 0, { y: 1 }), v("arara", 2, 0, { y: 1 }), v("arara", 3, 0, { y: 1 }),
      v("arara", 4, 0, { y: 1 }),
      v("arara", 0, F.voando, { y: 1.9, rotulo: "voando" }), v("arara", 1, F.voando, { y: 1.9, rotulo: "voando" }),
      v("arara", 2, F.voando, { y: 1.9, rotulo: "tucano voando" }),
    ],
  },
  {
    tipo: "gato",
    itens: [
      v("gato", 0), v("gato", 1), v("gato", 2), v("gato", 3),
      v("gato", 3, F.sentado, { rotulo: "sentado" }), v("gato", 0, F.domado, { rotulo: "domado" }),
      v("gato", 2, F.filhote, { rotulo: "filhote" }), v("gato", 1, F.domado | F.sentado, { rotulo: "domado sentado" }),
    ],
  },
  {
    tipo: "tatu",
    itens: [
      v("tatu", 0), v("tatu", 1), v("tatu", 0, F.bola, { rotulo: "bola" }), v("tatu", 1, F.bola, { rotulo: "galinha bola" }),
      v("tatu", 1, F.movendo, { rotulo: "andando" }), v("tatu", 0, F.filhote, { rotulo: "filhote" }),
      v("tatu", 0, F.amor, { rotulo: "amor" }),
    ],
  },
  {
    tipo: "galinha",
    itens: [
      v("galinha", 0), v("galinha", 1), v("galinha", 2),
      v("galinha", 0, F.filhote, { rotulo: "pintinho" }), v("galinha", 2, F.ovo, { rotulo: "ovo caipira" }),
      v("galinha", 0, F.ovo, { rotulo: "ovo" }), v("galinha", 1, F.voando, { rotulo: "voando", y: 0.5 }),
      v("galinha", 2, F.movendo, { rotulo: "andando" }),
    ],
  },
  {
    tipo: "peixe",
    itens: [
      v("peixe", 0, 0, { y: 0.3 }), v("peixe", 1, 0, { y: 0.3 }), v("peixe", 2, 0, { y: 0.3 }), v("peixe", 3, 0, { y: 0.3 }),
      v("peixe", 4, 0, { y: 0.3 }), v("peixe", 0, F.movendo, { y: 0.3, rotulo: "nadando" }),
      v("peixe", 0, F.foraDagua, { rotulo: "fora d'água" }), v("peixe", 3, F.foraDagua, { rotulo: "pacu fora" }),
    ],
  },
];
const PASSO_X = 1.8;
const [COL_A, COL_B] = ((): [number, number] => {
  const c = q.get("col");
  if (c === null) return [0, 99];
  const [a, b] = c.split("-").map(Number);
  return [a ?? 0, b ?? a ?? 0];
})();
const PASSO_Z = 2.3;
const YAW = Math.PI - 0.55; // de frente pra câmera, em 3/4 (mostra cara E flanco)

function placa(texto: string): THREE.Sprite {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  ctx.font = "bold 22px sans-serif";
  c.width = Math.ceil(ctx.measureText(texto).width) + 12;
  c.height = 30;
  ctx.font = "bold 22px sans-serif";
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texto, c.width / 2, c.height / 2);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearFilter;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false }));
  s.renderOrder = 999;
  const h = 0.2;
  s.scale.set((h * c.width) / c.height, h, 1);
  return s;
}

interface Vivo {
  id: number;
  item: Item;
  x: number;
  y: number;
  z: number;
}
const vivos: Vivo[] = [];
let proximoId = 1;
LINHAS.forEach((linha, li) => {
  // close-up: só a linha pedida (as outras tapariam a vista)
  if (vista !== "geral" && linha.tipo !== vista) return;
  const z = li * PASSO_Z;
  linha.itens.forEach((item, ci) => {
    // ?col=n ou ?col=a-b: só essas colunas (as vizinhas entravam na foto)
    if (vista !== "geral" && (ci < COL_A || ci > COL_B)) return;
    const x = ci * PASSO_X;
    const y = item.y ?? 0;
    const id = proximoId++;
    view.adicionar({ id, tipo: item.tipo, variante: item.variante, x, y, z, yaw: YAW, flags: item.flags });
    vivos.push({ id, item, x, y, z });
    const p = placa(item.rotulo);
    p.position.set(x, -0.12 + 0.01, z + 0.7);
    p.position.y = 0.06;
    scene.add(p);
    // poleiro de folhas pra arara pousada; aquário pro peixe que nada
    if (item.tipo === "arara" && !(item.flags & F.voando)) {
      const f = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), folhaMat);
      f.position.set(x, 0.5, z);
      scene.add(f);
    }
    if (item.tipo === "peixe" && !(item.flags & F.foraDagua) && !q.has("semagua")) {
      const a = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1, 1.4), aguaMat);
      a.position.set(x, 0.5, z);
      a.renderOrder = 1;
      scene.add(a);
    }
    if (comCaixas) {
      const def = BICHOS[item.tipo];
      const s = item.flags & F.filhote ? 0.55 : 1;
      const g = new THREE.BoxGeometry(def.largura * s, def.altura * s, def.largura * s);
      const caixa = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: 0xff00ff }));
      caixa.position.set(x, y + (def.altura * s) / 2, z);
      caixa.rotation.y = YAW;
      scene.add(caixa);
    }
  });
});
// o jogador de referência: mesma luz, mesma escala
const gente = criarCorpo(new THREE.Color().setHSL(0.6, 0.7, 0.5));
gente.grupo.position.set(-1.8, 0.9, 0);
gente.grupo.rotation.y = YAW;
scene.add(gente.grupo);

// ── câmera ──
function olhar(alvo: THREE.Vector3, dist: number, yaw: number, pitch: number): void {
  camera.position.set(
    alvo.x + Math.sin(yaw) * Math.cos(pitch) * dist,
    alvo.y + Math.sin(pitch) * dist,
    alvo.z + Math.cos(yaw) * Math.cos(pitch) * dist,
  );
  camera.lookAt(alvo);
}
function enquadrar(): void {
  if (vista === "geral") {
    olhar(new THREE.Vector3(5.5, 0.2, 8.5), 22, 0.12, 0.62);
    return;
  }
  const li = LINHAS.findIndex((l) => l.tipo === vista);
  if (li >= 0) {
    const n = LINHAS[li]!.itens.length;
    const meio = ((n - 1) * PASSO_X) / 2;
    const alto = BICHOS[vista as TipoBicho].altura;
    const extra = vista === "arara" ? 1 : 0;
    const yaw = Number(q.get("yaw") ?? 0.08);
    const pitch = Number(q.get("pitch") ?? 0.3);
    if (q.get("col") !== null) {
      // de perto: ?col=a-b&yaw=&pitch=&dist=
      const b = Math.min(COL_B, n - 1);
      const k = b - COL_A + 1;
      const y = (LINHAS[li]!.itens[COL_A]?.y ?? 0) + alto * 0.5;
      const dist = Number(q.get("dist") ?? Math.max(1.4, alto * 2.2 + (k - 1) * PASSO_X * 0.75));
      olhar(new THREE.Vector3(((COL_A + b) / 2) * PASSO_X, y, li * PASSO_Z), dist, yaw, pitch);
    } else {
      olhar(new THREE.Vector3(meio, alto * 0.5 + extra, li * PASSO_Z), Math.max(4.5, n * 0.82 + alto), yaw, pitch);
    }
  }
}
enquadrar();

// ── relógio: rAF ao vivo ou passo a passo (as fotos) ──
const hud = document.getElementById("hud")!;
let tempo = 0;
function passo(dt: number): void {
  tempo += dt;
  for (const viv of vivos) {
    if (!viv.item.pisca) continue;
    const fase = tempo % 2;
    const flags = fase > 1 && fase < 1.3 ? viv.item.flags | F.ferido : viv.item.flags;
    view.mover(viv.id, viv.x, viv.y, viv.z, YAW, flags);
  }
  sky.update(0);
  const b = brilho();
  for (const m of materiaisDoMundo) m.color.setScalar(b);
  view.quadro(dt, camera);
}
function desenhar(): void {
  renderer.render(scene, camera);
  const c = view.custo();
  const tris = BichosView.triangulosPorTipo();
  hud.textContent =
    `hora ${hora}  bichos ${vivos.length}  draw calls ${c.drawCalls}  instâncias ${c.instancias}  ` +
    `triângulos ${c.triangulos}  cpu ${c.cpuMs.toFixed(3)} ms\n` +
    Object.entries(tris).map(([t, n]) => `${t} ${n}`).join(" · ") + "  (triângulos por modelo)";
}

/**
 * ?medidas=1: a pose de PÉ de cada tipo × variante contra a caixa da tabela
 * (largura × altura). Conta as caixas como estão no modelo (giro de descanso
 * incluso), sem as silhuetas de estado (voo, bola, ovo, tosquia, coração). A
 * arara é medida na pose de VOO (a pousada sai do shader): olhar a foto.
 */
function medidas(): string {
  const linhas: string[] = [];
  const pula = MASCARA.soVoo | MASCARA.soOvo | MASCARA.soBola | MASCARA.soTosquia | MASCARA.soAmor;
  for (const linha of LINHAS) {
    const tipo = linha.tipo;
    const def = modeloDe(tipo);
    const tab = BICHOS[tipo];
    const esc = def.escala ?? 1;
    tab.variantes.forEach((vv, vi) => {
      let mx = 0;
      let mz = 0;
      let topo = 0;
      let baixo = Infinity;
      for (const c of def.caixas) {
        if (c.papel === PAPEL.coracao || (c.mascara ?? 0) & pula) continue;
        if (c.variantes && !c.variantes.includes(vi)) continue;
        for (const x of [c.de[0], c.ate[0]])
          for (const y of [c.de[1], c.ate[1]])
            for (const z of [c.de[2], c.ate[2]]) {
              let p: V3 = [x, y, z];
              if (c.giro) {
                const em = c.giroEm ?? c.pivo ?? [0, 0, 0];
                let [px, py, pz] = [p[0] - em[0], p[1] - em[1], p[2] - em[2]];
                const [gx, gy, gz] = c.giro;
                [py, pz] = [py * Math.cos(gx) - pz * Math.sin(gx), py * Math.sin(gx) + pz * Math.cos(gx)];
                [px, pz] = [px * Math.cos(gy) + pz * Math.sin(gy), -px * Math.sin(gy) + pz * Math.cos(gy)];
                [px, py] = [px * Math.cos(gz) - py * Math.sin(gz), px * Math.sin(gz) + py * Math.cos(gz)];
                p = [px + em[0], py + em[1], pz + em[2]];
              }
              mx = Math.max(mx, Math.abs(p[0]));
              mz = Math.max(mz, Math.abs(p[2]));
              topo = Math.max(topo, p[1]);
              baixo = Math.min(baixo, p[1]);
            }
      }
      const larg = (2 * mx * esc) / 16;
      const alt = (topo * esc) / 16;
      const ok = larg <= tab.largura + 1e-6 && alt <= tab.altura + 1e-6 && baixo >= -1e-6 ? "ok" : "PASSA";
      linhas.push(
        `${vv.nome.padEnd(20)} larg ${larg.toFixed(2)}/${tab.largura}  alt ${alt.toFixed(2)}/${tab.altura}  ` +
          `compr ${((2 * mz * esc) / 16).toFixed(2)}  ${ok}`,
      );
    });
  }
  return linhas.join("\n");
}

declare global {
  interface Window {
    __previa?: { ate: (t: number) => void; olhar: typeof olhar; tempo: () => number; medidas: () => string };
    __pronto?: boolean;
  }
}
window.__previa = {
  ate(t: number) {
    while (tempo < t - 1e-6) passo(Math.min(1 / 30, t - tempo));
    desenhar();
  },
  olhar,
  tempo: () => tempo,
  medidas,
};
if (manual) {
  window.__previa.ate(0.5);
  window.__pronto = true;
} else {
  let antes = performance.now();
  const laco = (): void => {
    const agora = performance.now();
    passo(Math.min(0.1, (agora - antes) / 1000));
    antes = agora;
    desenhar();
    requestAnimationFrame(laco);
  };
  requestAnimationFrame(laco);
  window.__pronto = true;
}
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
