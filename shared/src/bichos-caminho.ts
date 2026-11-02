import { BlockId, collisionBoxes, isAgua, isPorta, isSlab, isSolidBlock, isStairs } from "./blocks";
import { type World, getBlock } from "./world";

/**
 * §🐄 O CAMINHO dos bichos (2026-11-02) — A* na grade de voxels. Módulo PURO:
 * recebe o mundo, devolve uma lista de células. Quem anda, quando e pra onde
 * é a sessão (`session/bichos.ts`).
 *
 * **Por que grade e não física de caixa.** O jogador tem física AABB completa
 * (`physics.ts`) porque o cliente o move com o teclado a 60 Hz. O bicho é a
 * 1ª coisa que o SERVIDOR move sozinho, no notebook do professor, a 10 Hz e
 * com dezenas ao mesmo tempo — e um bicho passivo não precisa de física: ele
 * anda de célula em célula por um caminho que o A* já provou que existe. Então
 * o movimento é CINEMÁTICO sobre o piso de cada célula (`pisoEm`), e a física
 * se resume à gravidade quando o chão some. Custa algumas leituras de bloco
 * por bicho por tick, contra dezenas de testes de caixa por sub-passo.
 *
 * O NÓ é a célula dos pés. O PISO é a altura exata onde os pés pousam nela:
 * `y` sobre bloco cheio, `y + 0,5` sobre laje/degrau de baixo, e um pouco
 * abaixo da linha d'água pra quem nada.
 */

export interface CorpoNoCaminho {
  /** Altura da caixa (blocos) — decide o vão livre que o caminho exige. */
  readonly altura: number;
  /** Maior queda que o bicho aceita descer de propósito (a galinha plana). */
  readonly maxQueda: number;
  /** Atravessa água nadando (com custo)? Os terrestres sim; o peixe tem regra própria. */
  readonly nada: boolean;
}

/** Bloco que NÃO serve de chão: a cerca (é o que segura o curral — no
 *  Minecraft ela tem 1,5 de altura justamente pra o bicho não pular) e a
 *  porta (de pé num batente o bicho atravessaria a parede por cima). */
function naoEhChao(id: number): boolean {
  return id === BlockId.Cerca || isPorta(id);
}

/** Topo de colisão do bloco dentro da própria célula (0 = não sólido). */
function topoDe(id: number): number {
  if (!isSolidBlock(id)) return 0;
  if (!isSlab(id) && !isStairs(id)) return 1;
  let t = 0;
  for (const b of collisionBoxes(id)) if (b[4] > t) t = b[4];
  return t;
}

/** Laje/escada cuja metade de CIMA é vazia (dá pra pisar nela como meio degrau). */
function meioDegrau(id: number): boolean {
  return (isSlab(id) || isStairs(id)) && topoDe(id) <= 0.5 + 1e-6;
}

/** Célula que o CORPO atravessa (ar, capim, flor, porta aberta, água…). */
export function livre(id: number): boolean {
  return !isSolidBlock(id);
}

/**
 * Altura exata dos pés de quem fica na célula (x,y,z), ou `null` se não dá pra
 * ficar ali. Confere o vão livre da altura inteira do corpo.
 */
export function pisoEm(world: World, x: number, y: number, z: number, corpo: CorpoNoCaminho): number | null {
  const aqui = getBlock(world, x, y, z);
  let piso: number;
  if (meioDegrau(aqui) && !naoEhChao(aqui)) {
    piso = y + topoDe(aqui);
  } else if (livre(aqui)) {
    if (isAgua(aqui)) {
      if (!corpo.nada) return null;
      // boia: os pés ficam um pouco abaixo da linha d'água da célula
      piso = y + 0.2;
    } else {
      const baixo = getBlock(world, x, y - 1, z);
      if (naoEhChao(baixo) || topoDe(baixo) < 1 - 1e-6) return null;
      piso = y;
    }
  } else {
    return null;
  }
  // vão livre: da célula dos pés (a de meio degrau já foi vista) até a cabeça
  const topoCabeca = Math.floor(piso + corpo.altura - 1e-3);
  for (let yy = y + 1; yy <= topoCabeca; yy++) {
    if (!livre(getBlock(world, x, yy, z))) return null;
  }
  return piso;
}

/** Procura, na coluna (x,z), a célula de pé mais perto de `yRef` (subindo até
 *  `sobe` e descendo até `desce`). Devolve a célula, ou `null`. */
export function celulaDePe(
  world: World,
  x: number,
  yRef: number,
  z: number,
  corpo: CorpoNoCaminho,
  sobe = 2,
  desce = 4,
): { y: number; piso: number } | null {
  for (let d = 0; d <= Math.max(sobe, desce); d++) {
    if (d <= sobe) {
      const p = pisoEm(world, x, yRef + d, z, corpo);
      if (p !== null) return { y: yRef + d, piso: p };
    }
    if (d > 0 && d <= desce) {
      const p = pisoEm(world, x, yRef - d, z, corpo);
      if (p !== null) return { y: yRef - d, piso: p };
    }
  }
  return null;
}

/** O espaço vertical [y0, y1] da coluna (x,z) está livre? */
function colunaLivre(world: World, x: number, z: number, y0: number, y1: number): boolean {
  for (let y = y0; y <= y1; y++) if (!livre(getBlock(world, x, y, z))) return false;
  return true;
}

const DIRS: readonly (readonly [number, number])[] = [
  [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1],
];

/** Alturas tentadas numa coluna vizinha: a MESMA primeiro, depois subir 1,
 *  depois descer — a ordem que um bicho de verdade escolhe. */
const ORDENS = new Map<number, readonly number[]>();
function ordemDy(maxQueda: number): readonly number[] {
  let o = ORDENS.get(maxQueda);
  if (!o) {
    const a = [0, 1];
    for (let d = 1; d <= maxQueda; d++) a.push(-d);
    o = a;
    ORDENS.set(maxQueda, o);
  }
  return o;
}

/** Heap mínimo de índices por custo `f` — só o que o A* precisa. */
class Heap {
  private readonly ids: number[] = [];
  constructor(private readonly f: number[]) {}
  get tamanho(): number {
    return this.ids.length;
  }
  push(i: number): void {
    const a = this.ids;
    a.push(i);
    let k = a.length - 1;
    while (k > 0) {
      const p = (k - 1) >> 1;
      if (this.f[a[p]!]! <= this.f[a[k]!]!) break;
      [a[p], a[k]] = [a[k]!, a[p]!];
      k = p;
    }
  }
  pop(): number {
    const a = this.ids;
    const top = a[0]!;
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last;
      let k = 0;
      for (;;) {
        const l = 2 * k + 1;
        const r = l + 1;
        let m = k;
        if (l < a.length && this.f[a[l]!]! < this.f[a[m]!]!) m = l;
        if (r < a.length && this.f[a[r]!]! < this.f[a[m]!]!) m = r;
        if (m === k) break;
        [a[m], a[k]] = [a[k]!, a[m]!];
        k = m;
      }
    }
    return top;
  }
}

/** Resultado do A*: as células (x,y,z em trincas) do passo SEGUINTE ao início
 *  até o fim, e se o fim é o alvo de verdade ou só o nó mais perto dele. */
export interface Caminho {
  readonly celulas: Int32Array;
  readonly completo: boolean;
  /** Nós abertos (o custo REAL da busca, pro perfilador). */
  readonly nos: number;
}

/**
 * A* de (x0,y0,z0) até (x1,y1,z1), nós = células de pé. `maxNos` é o teto da
 * busca: estourou, devolve o caminho até o nó que chegou MAIS PERTO (o bicho
 * anda até lá e tenta de novo depois) — nunca trava o tick numa busca longa.
 *
 * Custos: 1 reto, 1,41 diagonal, +0,5 pra subir, ×5 nadando. Diagonal só
 * passa se as duas vizinhas retas também passam (sem cortar quina de parede).
 */
export function acharCaminho(
  world: World,
  x0: number, y0: number, z0: number,
  x1: number, y1: number, z1: number,
  corpo: CorpoNoCaminho,
  maxNos = 200,
): Caminho | null {
  const pisoIni = pisoEm(world, x0, y0, z0, corpo);
  if (pisoIni === null) return null;
  const SX = world.sizeX;
  const SZ = world.sizeZ;
  const key = (x: number, y: number, z: number): number => (y * SZ + z) * SX + x;
  const h = (x: number, y: number, z: number): number => {
    const dx = Math.abs(x - x1);
    const dz = Math.abs(z - z1);
    return Math.max(dx, dz) + 0.41 * Math.min(dx, dz) + Math.abs(y - y1) * 0.5;
  };
  // nós em arrays paralelos (sem objeto por nó: a busca roda dezenas de vezes por segundo)
  const nx: number[] = [], ny: number[] = [], nz: number[] = [], np: number[] = [];
  const g: number[] = [], f: number[] = [], pai: number[] = [];
  const fechado: boolean[] = [];
  const indice = new Map<number, number>();
  const abrir = (x: number, y: number, z: number, piso: number, gg: number, p: number): number => {
    const i = nx.length;
    nx.push(x); ny.push(y); nz.push(z); np.push(piso);
    g.push(gg); f.push(gg + h(x, y, z)); pai.push(p); fechado.push(false);
    indice.set(key(x, y, z), i);
    return i;
  };
  const heap = new Heap(f);
  heap.push(abrir(x0, y0, z0, pisoIni, 0, -1));
  let melhor = 0;
  let melhorH = h(x0, y0, z0);
  let achou = -1;
  const topoCorpo = (piso: number): number => Math.floor(piso + corpo.altura - 1e-3);
  while (heap.tamanho > 0) {
    const i = heap.pop();
    if (fechado[i]) continue;
    fechado[i] = true;
    const cx = nx[i]!, cy = ny[i]!, cz = nz[i]!, cp = np[i]!;
    if (cx === x1 && cy === y1 && cz === z1) {
      achou = i;
      break;
    }
    const hi = h(cx, cy, cz);
    if (hi < melhorH) {
      melhorH = hi;
      melhor = i;
    }
    if (nx.length >= maxNos) continue; // não abre mais nada; esvazia o que já está aberto
    for (const [dx, dz] of DIRS) {
      const vx = cx + dx;
      const vz = cz + dz;
      // tenta a mesma altura, subir 1 e descer até `maxQueda`
      for (const dy of ordemDy(corpo.maxQueda)) {
        const vy = cy + dy;
        const vp = pisoEm(world, vx, vy, vz, corpo);
        if (vp === null) continue;
        if (vp - cp > 1.05) continue; // degrau alto demais (só pula 1)
        // a passagem: o espaço por onde o corpo passa entre as duas células
        const alto = Math.max(cp, vp);
        const yTopo = topoCorpo(alto);
        if (vp > cp + 1e-3) {
          // subindo: precisa de vão na coluna de ORIGEM até a cabeça no alto
          if (!colunaLivre(world, cx, cz, Math.floor(cp) + 1, yTopo)) continue;
        } else if (vp < cp - 1e-3) {
          // descendo: o vão na coluna de DESTINO, do piso novo até a cabeça de antes
          if (!colunaLivre(world, vx, vz, Math.floor(vp) + 1, topoCorpo(cp))) continue;
        }
        if (dx !== 0 && dz !== 0) {
          // diagonal: as duas retas vizinhas precisam estar livres na faixa do corpo
          const y0f = Math.floor(alto);
          if (!colunaLivre(world, cx + dx, cz, y0f, yTopo)) continue;
          if (!colunaLivre(world, cx, cz + dz, y0f, yTopo)) continue;
        }
        const k = key(vx, vy, vz);
        const j = indice.get(k);
        if (j !== undefined && fechado[j]) break;
        let custo = dx !== 0 && dz !== 0 ? 1.41 : 1;
        if (vp > cp + 1e-3) custo += 0.5;
        if (isAgua(getBlock(world, vx, vy, vz))) custo *= 5;
        const gg = g[i]! + custo;
        if (j === undefined) heap.push(abrir(vx, vy, vz, vp, gg, i));
        else if (gg < g[j]!) {
          g[j] = gg;
          f[j] = gg + h(vx, vy, vz);
          pai[j] = i;
          heap.push(j);
        }
        break; // uma altura por coluna vizinha: a primeira que serve
      }
    }
  }
  const fim = achou >= 0 ? achou : melhor;
  if (fim === 0) return { celulas: new Int32Array(0), completo: achou === 0, nos: nx.length };
  const rota: number[] = [];
  for (let i = fim; i > 0; i = pai[i]!) rota.push(i);
  rota.reverse();
  const celulas = new Int32Array(rota.length * 3);
  rota.forEach((i, k) => {
    celulas[k * 3] = nx[i]!;
    celulas[k * 3 + 1] = ny[i]!;
    celulas[k * 3 + 2] = nz[i]!;
  });
  return { celulas, completo: achou >= 0, nos: nx.length };
}
