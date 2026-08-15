import * as THREE from "three";

/**
 * Fundo animado do menu principal (peça 1 do fundo animado, 2026-08-15):
 * "câmera DENTRO de um cubo". Um cubo gigante com as 6 FACES INTERNAS pintadas
 * de paisagens estilo Minecraft (geradas por procedimento em canvas 2D — zero
 * arquivo externo) e a câmera paradinha no centro, girando o olhar devagar.
 * Custo mínimo: um cubo só, sem luz, texturas 256² — cap 1 de pixelRatio.
 * Renderer próprio (o principal só nasce no jogo); dispose() limpa tudo.
 */

const CUBO = 48; // aresta do cubo (câmera em y=0, centro)

export interface MenuFundo {
  encerrar(): void;
}

/** Pinta UMA face: céu + nuvens + chão de blocos + árvore quadrada + sol. */
function pintarPaisagem(seed: number): HTMLCanvasElement {
  const T = 256;
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = T;
  const ctx = cvs.getContext("2d")!;

  // céu (gradiente sutil, variando a cor por face)
  const tom = 0.5 + 0.5 * Math.sin(seed * 7.13);
  const topo = `hsl(${200 + 12 * tom}, 55%, ${62 + 8 * tom}%)`;
  const base = `hsl(${210 + 10 * tom}, 45%, ${82 + 6 * tom}%)`;
  const ceu = ctx.createLinearGradient(0, 0, 0, T);
  ceu.addColorStop(0, topo);
  ceu.addColorStop(1, base);
  ctx.fillStyle = ceu;
  ctx.fillRect(0, 0, T, T);

  // sol quadrado (espírito Minecraft) — posição varia com a face
  const sx = 0.15 + 0.7 * (0.5 + 0.5 * Math.sin(seed * 3.7));
  const sy = 0.12 + 0.25 * (0.5 + 0.5 * Math.cos(seed * 5.1));
  ctx.fillStyle = "#fff3b0";
  ctx.fillRect(sx * T - 14, sy * T - 14, 28, 28);
  ctx.fillStyle = "#ffe27a";
  ctx.fillRect(sx * T - 9, sy * T - 9, 18, 18);
  // raios
  ctx.strokeStyle = "rgba(255, 226, 122, 0.7)";
  ctx.lineWidth = 2;
  for (let a = 0; a < 8; a++) {
    const ang = seed + (a * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(sx * T, sy * T);
    ctx.lineTo(sx * T + Math.cos(ang) * 46, sy * T + Math.sin(ang) * 46);
    ctx.stroke();
  }

  // nuvens pixeladas
  const nuvem = (cx: number, cy: number, s: number, alpha: number): void => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(cx + i * s - s, cy, s * 2.4, s);
      ctx.fillRect(cx + i * s - s / 2, cy - s * 0.7, s * 1.4, s);
    }
    ctx.globalAlpha = 1;
  };
  for (let i = 0; i < 3; i++) {
    const cx = (0.1 + 0.38 * i + 0.08 * Math.sin(seed + i * 9)) * T;
    const cy = (0.18 + 0.06 * i) * T;
    const s = T * 0.05;
    nuvem(cx, cy, s, 0.55 - 0.15 * i);
  }

  // chão de blocos (camada de grama por cima, terra embaixo)
  const G = 8; // blocos na base
  const baseY = T - (T * 0.28);
  for (let j = 0; j < G; j++) {
    const y = baseY + (j * (T - baseY)) / G;
    for (let i = 0; i < 16; i++) {
      const x = (i / 16) * T;
      const w = T / 16 + 1;
      if (j === 0) {
        ctx.fillStyle = i % 3 === 0 ? "#6cc04a" : "#7dd956";
      } else if (j < 3) {
        ctx.fillStyle = (i * 7 + j * 13 + seed * 17) % 5 === 0 ? "#8a5a2c" : "#9c6b38";
      } else {
        ctx.fillStyle = (i * 11 + j * 7 + seed * 13) % 7 === 0 ? "#7a4f2a" : "#7d5230";
      }
      ctx.fillRect(x, y, w, (T - baseY) / G + 1);
    }
    // risquinho de grama pendurada
    if (j === 0) {
      const base = y;
      for (let i = 0; i < 26; i++) {
        const x = (i / 26) * T + Math.sin(seed + i) * 3;
        if ((i + Math.floor(seed * 20)) % 4 !== 0) continue;
        ctx.fillStyle = "#5aa83f";
        ctx.fillRect(x, base, 2, 5 + (i % 3) * 3);
      }
    }
  }

  // árvore quadrada (um tronco + copa de folhas)
  const ax = (0.18 + 0.64 * (0.5 + 0.5 * Math.sin(seed * 11.7))) * T;
  const copaY = baseY - T * 0.24;
  ctx.fillStyle = "#8a5a2c";
  ctx.fillRect(ax - 8, copaY + 22, 16, baseY - (copaY + 22));
  ctx.fillStyle = "#2e8b33";
  ctx.fillRect(ax - 26, copaY - 14, 52, 38);
  ctx.fillStyle = "#3aa33f";
  ctx.fillRect(ax - 22, copaY - 20, 44, 30);
  ctx.fillStyle = "#47b84c";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(ax - 26 + (i % 3) * 18, copaY - 14 + Math.floor(i / 3) * 14, 11, 11);
  }

  // colina de blocos à esquerda (profundidade)
  ctx.fillStyle = "#6fb95a";
  ctx.fillRect(0, baseY - 40, 46, 40);
  ctx.fillStyle = "#5aa049";
  ctx.fillRect(46, baseY - 26, 30, 26);

  // vinheta suave (as pontas do cubo não "cortam" duro)
  const vin = ctx.createRadialGradient(T / 2, T / 2, T * 0.36, T / 2, T / 2, T * 0.78);
  vin.addColorStop(0, "rgba(0,0,0,0)");
  vin.addColorStop(1, "rgba(0,0,26,0.28)");
  ctx.fillStyle = vin;
  ctx.fillRect(0, 0, T, T);

  return cvs;
}

export function iniciarFundoMenu(): MenuFundo {
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); // fundo de fundo: nitidez nem é notada
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.id = "menu-fundo";
  Object.assign(renderer.domElement.style, {
    position: "fixed",
    inset: "0",
    zIndex: "29",
    pointerEvents: "none",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.1,
    CUBO * 2,
  );
  camera.position.set(0, -1.5, 0); // olho um pouquinho acima do centro

  // 6 faces internas, cada uma com uma paisagem diferente
  const mats: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < 6; i++) {
    const tex = new THREE.CanvasTexture(pintarPaisagem(i));
    tex.colorSpace = THREE.SRGBColorSpace;
    mats.push(new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide }));
  }
  const cubo = new THREE.Mesh(new THREE.BoxGeometry(CUBO, CUBO, CUBO), mats);
  scene.add(cubo);

  let parado = false;
  let raf = 0;
  const girar = (bola: number): void => {
    if (parado) return;
    raf = requestAnimationFrame(girar);
    // giro LENTO — o menu é lugar de sossego, não de câmara de passeio
    const t = bola * 0.002;
    camera.position.x = Math.sin(t) * 0.6;
    camera.position.z = Math.cos(t) * 0.6;
    camera.lookAt(0, 0.5, 0);
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(girar);

  const redimensionar = (): void => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", redimensionar);

  return {
    encerrar(): void {
      parado = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", redimensionar);
      cubo.geometry.dispose();
      for (const m of mats) {
        m.map?.dispose();
        m.dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}