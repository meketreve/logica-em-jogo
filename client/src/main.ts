import * as THREE from "three";
import { BlockId } from "@logica/shared";

/**
 * Cena mínima: prova o pipeline Vite + three.js + import de /shared.
 * O checkpoint 1 (mundo estático + andar + HUD F3) substitui este arquivo.
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
camera.position.set(2, 2, 4);
camera.lookAt(0, 0, 0);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x55aa55 }),
);
scene.add(cube);

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(3, 5, 2);
scene.add(sun, new THREE.AmbientLight(0xffffff, 0.4));

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(() => {
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
});

console.log("[client] /shared importado ok — BlockId.Sand =", BlockId.Sand);
