/**
 * §💡 LUZ VOXEL (2026-07-28) — o pré-requisito das cavernas.
 *
 * Até aqui o projeto NÃO tinha luz: a tocha era halo decorativo (decisão de
 * 2026-07-17) e todo bloco era desenhado com o mesmo brilho. Caverna escavada
 * nesse mundo nasceria clara como a superfície — o usuário pediu luz COMPLETA
 * (céu + tocha, com repropagação ao quebrar/colocar) antes de escavar.
 *
 * ONDE ISTO RODA — e por que não no servidor: luz é FUNÇÃO PURA dos bytes do
 * mundo, e o cliente já tem os bytes (snapshot + block_changed). Calcular no
 * servidor custaria banda e CPU de tick pra reproduzir algo que os dois lados
 * derivam igual sozinhos. Logo: **nada de protocolo novo, nada de session.ts**.
 * Dois clientes com os mesmos bytes chegam na mesma luz.
 *
 * FORMATO — 1 byte por célula, dois canais de 4 bits:
 *   bits 4-7 = CÉU   (0..15) — escala com a hora do dia no shader
 *   bits 0-3 = BLOCO (0..15) — tocha; não muda com a hora
 * O shader usa o MAIOR dos dois depois de aplicar a hora (ver F3), então uma
 * caverna com tocha continua acesa às 3 da manhã.
 *
 * ESPARSO, IGUAL AO MUNDO: o array de chunks é denso de referências e cada slot
 * pode ser undefined. Mundo E é lazy e chega por COLUNA — a luz acende por
 * coluna também (`acenderColuna`), no mesmo ritmo do streaming, em vez de um
 * passo global que precisaria do mundo inteiro materializado.
 */
import {
  BlockId,
  isAgua,
  isFolhas,
  isFullCube,
  isPorta,
  isPortaAberta,
  isTransparentBlock,
} from "./blocks";
import { CHUNK_SIZE, CHUNK_VOLUME } from "./constants";
import { type World, type WorldDims, blockIndex, colunaGerada, getBlock } from "./world";

/** Nível máximo de luz. 15 = céu aberto ao meio-dia. */
export const LUZ_MAX = 15;

/** Opacidade que BLOQUEIA de vez (não é atenuação: é parede). */
const OPACO = LUZ_MAX;

/** Canal de luz. Os dois propagam pela mesma engrenagem; só a regra da descida
 *  reta (abaixo) é exclusiva do céu. */
export const CANAL_CEU = 0;
export const CANAL_BLOCO = 1;
export type Canal = typeof CANAL_CEU | typeof CANAL_BLOCO;

/**
 * Quanto o bloco ATRAPALHA a luz que o atravessa.
 * - `OPACO` (15) = parede: a luz para.
 * - 1 = atravessa perdendo 1 nível a mais (fundo de lago escurece com a
 *   profundidade; copa de árvore fecha aos poucos em vez de virar breu).
 * - 0 = passa livre.
 *
 * A régua segue a do mesher: o que NÃO é cubo cheio opaco deixa passar. Duas
 * exceções deliberadas, porque a intuição do jogador manda mais que a regra:
 * **porta fechada veda** (senão a casa fica acesa pelo vão da porta) e
 * **janela/vidro NÃO vedam** — é o serviço da janela.
 */
export function opacidadeLuz(id: number): number {
  if (id === BlockId.Air) return 0;
  if (isAgua(id) || isFolhas(id)) return 1;
  if (isPorta(id) && !isPortaAberta(id)) return OPACO;
  if (isFullCube(id) && !isTransparentBlock(id)) return OPACO;
  return 0;
}

/** Luz que o bloco EMITE (canal bloco). Tocha = 14: acende o quarto inteiro mas
 *  não empata com o céu aberto, então dá pra ver a diferença entre sair da
 *  caverna e ficar. Lava/minério luminoso entram aqui quando existirem.
 *
 *  §🍖 F10b: a fornalha ACESA emite 13 — um degrau abaixo da tocha, porque a
 *  boca do fogo ilumina menos que uma chama pendurada, e porque a fornalha não
 *  deve virar a tocha barata de quem não quer fabricar tocha. Sai de graça: a
 *  luz é função PURA dos bytes, e o tick já troca o byte quando o fogo pega. */
export function luzEmitida(id: number): number {
  if (id === BlockId.Tocha) return 14;
  return id === BlockId.FornalhaAcesa ? 13 : 0;
}

/** Grade de luz paralela à do mundo — mesmas dimensões, mesmos índices. */
export interface LuzWorld {
  readonly dims: WorldDims;
  readonly sizeX: number;
  readonly sizeY: number;
  readonly sizeZ: number;
  /** 1 byte por célula, `(ceu << 4) | bloco`. undefined = coluna não acesa. */
  readonly chunks: (Uint8Array | undefined)[];
}

export function criarLuz(dims: WorldDims): LuzWorld {
  return {
    dims,
    sizeX: dims.x * CHUNK_SIZE,
    sizeY: dims.y * CHUNK_SIZE,
    sizeZ: dims.z * CHUNK_SIZE,
    chunks: new Array<Uint8Array | undefined>(dims.x * dims.y * dims.z),
  };
}

/** Índice do chunk dentro de `chunks` — MESMA fórmula do `chunkIndex` do mundo
 *  (as duas grades são intercambiáveis de propósito: o conjunto de chunks sujos
 *  que sai daqui é lido direto pelo renderer). */
export function luzChunkIndex(dims: WorldDims, cx: number, cy: number, cz: number): number {
  return (cy * dims.z + cz) * dims.x + cx;
}

/** Volta de índice de chunk pra (cx,cy,cz) — o renderer precisa das coordenadas
 *  pra remeshar o conjunto sujo. */
export function luzChunkCoords(dims: WorldDims, i: number): { cx: number; cy: number; cz: number } {
  const cx = i % dims.x;
  const resto = (i - cx) / dims.x;
  const cz = resto % dims.z;
  return { cx, cy: (resto - cz) / dims.z, cz };
}

/** Aloca (zerada) a coluna inteira de chunks de luz. */
export function alocarColunaLuz(luz: LuzWorld, cx: number, cz: number): void {
  for (let cy = 0; cy < luz.dims.y; cy++) {
    const i = luzChunkIndex(luz.dims, cx, cy, cz);
    if (!luz.chunks[i]) luz.chunks[i] = new Uint8Array(CHUNK_VOLUME);
  }
}

/** Descarta a luz da coluna (streaming: saiu do raio de render). */
export function descartarColunaLuz(luz: LuzWorld, cx: number, cz: number): void {
  for (let cy = 0; cy < luz.dims.y; cy++) {
    luz.chunks[luzChunkIndex(luz.dims, cx, cy, cz)] = undefined;
  }
}

function dentro(luz: LuzWorld, x: number, y: number, z: number): boolean {
  return x >= 0 && y >= 0 && z >= 0 && x < luz.sizeX && y < luz.sizeY && z < luz.sizeZ;
}

/** Byte cru `(ceu << 4) | bloco`. Fora dos limites ou coluna não acesa = 0
 *  (escuro), NUNCA claro: o mundo que ainda não chegou não pode vazar luz. */
export function luzByte(luz: LuzWorld, x: number, y: number, z: number): number {
  if (!dentro(luz, x, y, z)) return 0;
  const cx = (x / CHUNK_SIZE) | 0;
  const cy = (y / CHUNK_SIZE) | 0;
  const cz = (z / CHUNK_SIZE) | 0;
  const chunk = luz.chunks[luzChunkIndex(luz.dims, cx, cy, cz)];
  if (!chunk) return 0;
  return chunk[blockIndex(x - cx * CHUNK_SIZE, y - cy * CHUNK_SIZE, z - cz * CHUNK_SIZE)] ?? 0;
}

export function luzCeu(luz: LuzWorld, x: number, y: number, z: number): number {
  return luzByte(luz, x, y, z) >> 4;
}

export function luzBloco(luz: LuzWorld, x: number, y: number, z: number): number {
  return luzByte(luz, x, y, z) & 0xf;
}

/** A célula existe na grade de luz? (coluna ainda não acesa = não escrever) */
function temCelula(luz: LuzWorld, x: number, y: number, z: number): boolean {
  if (!dentro(luz, x, y, z)) return false;
  const cx = (x / CHUNK_SIZE) | 0;
  const cy = (y / CHUNK_SIZE) | 0;
  const cz = (z / CHUNK_SIZE) | 0;
  return luz.chunks[luzChunkIndex(luz.dims, cx, cy, cz)] !== undefined;
}

function getCanal(luz: LuzWorld, x: number, y: number, z: number, canal: Canal): number {
  const b = luzByte(luz, x, y, z);
  return canal === CANAL_CEU ? b >> 4 : b & 0xf;
}

/** Escreve o canal e marca o chunk como sujo. Célula inexistente: ignora. */
function setCanal(
  luz: LuzWorld,
  x: number,
  y: number,
  z: number,
  canal: Canal,
  nivel: number,
  sujos: Set<number>,
): void {
  if (!dentro(luz, x, y, z)) return;
  const cx = (x / CHUNK_SIZE) | 0;
  const cy = (y / CHUNK_SIZE) | 0;
  const cz = (z / CHUNK_SIZE) | 0;
  const ic = luzChunkIndex(luz.dims, cx, cy, cz);
  const chunk = luz.chunks[ic];
  if (!chunk) return;
  const i = blockIndex(x - cx * CHUNK_SIZE, y - cy * CHUNK_SIZE, z - cz * CHUNK_SIZE);
  const antes = chunk[i] ?? 0;
  const depois =
    canal === CANAL_CEU ? ((nivel & 0xf) << 4) | (antes & 0xf) : (antes & 0xf0) | (nivel & 0xf);
  if (antes === depois) return;
  chunk[i] = depois;
  sujos.add(ic);
  // borda do chunk: a face culled do vizinho amostra ESTA célula, então a mesh
  // dele também envelhece. Mesma regra do `remeshBlock` — aqui aplicada à luz.
  const lx = x - cx * CHUNK_SIZE;
  const ly = y - cy * CHUNK_SIZE;
  const lz = z - cz * CHUNK_SIZE;
  if (lx === 0 && cx > 0) sujos.add(luzChunkIndex(luz.dims, cx - 1, cy, cz));
  if (lx === CHUNK_SIZE - 1 && cx < luz.dims.x - 1) sujos.add(luzChunkIndex(luz.dims, cx + 1, cy, cz));
  if (ly === 0 && cy > 0) sujos.add(luzChunkIndex(luz.dims, cx, cy - 1, cz));
  if (ly === CHUNK_SIZE - 1 && cy < luz.dims.y - 1) sujos.add(luzChunkIndex(luz.dims, cx, cy + 1, cz));
  if (lz === 0 && cz > 0) sujos.add(luzChunkIndex(luz.dims, cx, cy, cz - 1));
  if (lz === CHUNK_SIZE - 1 && cz < luz.dims.z - 1) sujos.add(luzChunkIndex(luz.dims, cx, cy, cz + 1));
}

/** Coordenada empacotada num inteiro (fila de BFS sem alocar objeto por célula:
 *  o mundo máximo é 256×256×128 = 8,4 M células, cabe folgado em 2^53). */
function empacotar(luz: LuzWorld, x: number, y: number, z: number): number {
  return (x * luz.sizeZ + z) * luz.sizeY + y;
}

const DIRS: readonly (readonly [number, number, number])[] = [
  [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
];

/**
 * BFS de propagação. A fila chega com as células SEMENTE já gravadas; daqui só
 * sai luz descendo de nível.
 *
 * A regra do céu que faz caverna existir: luz de céu no MÁXIMO descendo reto
 * (dir −Y) por bloco transparente **não perde nível**. É isso que deixa a
 * superfície toda em 15 e mantém escuro tudo que está sob teto — sem essa
 * exceção o mundo ficaria com um gradiente vertical e nada seria caverna.
 */
function propagar(
  world: World,
  luz: LuzWorld,
  fila: number[],
  canal: Canal,
  sujos: Set<number>,
): void {
  for (let head = 0; head < fila.length; head++) {
    const p = fila[head]!;
    const y = p % luz.sizeY;
    const r = (p - y) / luz.sizeY;
    const z = r % luz.sizeZ;
    const x = (r - z) / luz.sizeZ;
    const nivel = getCanal(luz, x, y, z, canal);
    if (nivel <= 0) continue;

    for (let d = 0; d < DIRS.length; d++) {
      const [dx, dy, dz] = DIRS[d]!;
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      if (!temCelula(luz, nx, ny, nz)) continue;
      const op = opacidadeLuz(getBlock(world, nx, ny, nz));
      if (op >= OPACO) continue;
      const descidaReta = canal === CANAL_CEU && dy === -1 && nivel === LUZ_MAX && op === 0;
      const alvo = descidaReta ? LUZ_MAX : nivel - 1 - op;
      if (alvo <= 0 || alvo <= getCanal(luz, nx, ny, nz, canal)) continue;
      setCanal(luz, nx, ny, nz, canal, alvo, sujos);
      fila.push(empacotar(luz, nx, ny, nz));
    }
  }
}

/**
 * Apaga a partir de uma célula e devolve as sementes pra reacender.
 *
 * O algoritmo clássico dos dois passes: vizinho MENOS aceso que a célula que
 * apagou só podia estar aceso por ela → apaga também (cascata). Vizinho igual
 * ou mais aceso tem fonte própria → vira semente do reacender. Sem isso, apagar
 * uma tocha deixaria um rastro de luz órfã que nada reduz.
 */
function apagar(
  world: World,
  luz: LuzWorld,
  x0: number,
  y0: number,
  z0: number,
  canal: Canal,
  sujos: Set<number>,
  reacender: number[],
): void {
  const nivel0 = getCanal(luz, x0, y0, z0, canal);
  if (nivel0 <= 0) return;
  const fila: number[] = [empacotar(luz, x0, y0, z0)];
  const niveis: number[] = [nivel0];
  setCanal(luz, x0, y0, z0, canal, 0, sujos);

  for (let head = 0; head < fila.length; head++) {
    const p = fila[head]!;
    const nivel = niveis[head]!;
    const y = p % luz.sizeY;
    const r = (p - y) / luz.sizeY;
    const z = r % luz.sizeZ;
    const x = (r - z) / luz.sizeZ;

    for (let d = 0; d < DIRS.length; d++) {
      const [dx, dy, dz] = DIRS[d]!;
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      if (!temCelula(luz, nx, ny, nz)) continue;
      const viz = getCanal(luz, nx, ny, nz, canal);
      if (viz === 0) continue;
      // coluna de céu no máximo descendo: a de baixo NÃO é filha da de cima por
      // nível (as duas são 15), mas é filha por caminho — some junto.
      const filhaPorDescida = canal === CANAL_CEU && dy === -1 && nivel === LUZ_MAX && viz === LUZ_MAX;
      if (viz < nivel || filhaPorDescida) {
        setCanal(luz, nx, ny, nz, canal, 0, sujos);
        fila.push(empacotar(luz, nx, ny, nz));
        niveis.push(viz);
      } else {
        reacender.push(empacotar(luz, nx, ny, nz));
      }
    }
  }
}

/**
 * Escreve o canal CÉU direto no byte do chunk, sem marcar sujeira nem checar
 * borda. Só o caminho de ACENDER COLUNA usa: lá a coluna inteira (e a dos 4
 * vizinhos) já entra suja de qualquer jeito, e o `setCanal` completo custaria
 * 6 comparações de borda em cada uma das ~32 mil células.
 */
function escreverCeu(chunk: Uint8Array, i: number, nivel: number): void {
  chunk[i] = ((nivel & 0xf) << 4) | (chunk[i]! & 0xf);
}

/** Byte "céu 15, bloco 0" — o preenchimento de um chunk 100% ar sob céu aberto. */
const CEU_CHEIO = LUZ_MAX << 4;

/** O chunk é 100% ar? (mesmo fast path do `extrairVizinhanca`: no mundo G, 75%
 *  dos chunks são céu.) Ausente também conta — chunk que não existe é ar. */
function chunkVazio(bytes: Uint8Array | undefined): boolean {
  if (!bytes) return true;
  for (let i = 0; i < bytes.length; i++) if (bytes[i] !== 0) return false;
  return true;
}

/** Onde a luz do céu PARA na coluna (x,z): y do primeiro bloco opaco visto de
 *  cima, ou −1 se o céu desce até o fundo. Célula acesa = y > piso. */
function pisoDoCeu(world: World, dims: WorldDims, x: number, z: number): number {
  const cx = (x / CHUNK_SIZE) | 0;
  const cz = (z / CHUNK_SIZE) | 0;
  const lx = x - cx * CHUNK_SIZE;
  const lz = z - cz * CHUNK_SIZE;
  if (x < 0 || z < 0 || cx >= dims.x || cz >= dims.z) return -1;
  for (let cy = dims.y - 1; cy >= 0; cy--) {
    const bytes = world.chunks[luzChunkIndex(dims, cx, cy, cz)];
    if (!bytes) continue; // chunk ausente = ar
    for (let ly = CHUNK_SIZE - 1; ly >= 0; ly--) {
      if (opacidadeLuz(bytes[blockIndex(lx, ly, lz)]!) >= OPACO) return cy * CHUNK_SIZE + ly;
    }
  }
  return -1;
}

/**
 * Céu da coluna de chunks: escreve os 16×16 perfis verticais e enfileira SÓ o
 * que tem trabalho a fazer.
 *
 * O corte que torna isto viável (medido em 2026-07-28, mundo E): enfileirar
 * todas as células de céu custava **18 ms por coluna** — mais que o mesh da
 * coluna inteira, e na main thread. Só que célula em céu aberto cercada de céu
 * aberto está em 15 com todos os vizinhos em 15: a BFS a visita, olha 6 vizinhos
 * e não muda nada. O trabalho real mora numa BANDA fina rente ao relevo, e a
 * altura dessa banda é o `piso` mais alto entre os 4 vizinhos laterais (é dali
 * que sai a sombra do penhasco e a luz que entra pela boca da caverna).
 */
function semearCeuDaColuna(
  world: World,
  luz: LuzWorld,
  cx: number,
  cz: number,
  fila: number[],
  piso: Int32Array,
): void {
  const x0 = cx * CHUNK_SIZE;
  const z0 = cz * CHUNK_SIZE;
  const dy = luz.dims.y;
  const L = CHUNK_SIZE + 2;
  const AREA = CHUNK_SIZE * CHUNK_SIZE;

  // passe 1: os 256 perfis verticais DE UMA VEZ, descendo chunk por chunk.
  // Chunk 100% ar sob céu cheio sai num `fill` só — é o caso da esmagadora
  // maioria (mundo E tem 128 de altura e o relevo mora nos 40 de baixo), e era
  // ele que fazia a conta custar 4 096 `getBlock` por chunk de nada.
  const nivelCol = new Uint8Array(AREA).fill(LUZ_MAX);
  /** −2 = ainda descendo; ≥ −1 = já parou (y do piso). */
  const parou = new Int32Array(AREA).fill(-2);
  /** A coluna passou por água/folha? Só essas precisam da varredura de célula
   *  atenuada no passe 2. */
  const atenuou = new Uint8Array(AREA);
  let descendo = AREA;
  let todosCheios = true;

  for (let cy = dy - 1; cy >= 0 && descendo > 0; cy--) {
    const chunk = luz.chunks[luzChunkIndex(luz.dims, cx, cy, cz)];
    if (!chunk) continue;
    const bytes = world.chunks[luzChunkIndex(luz.dims, cx, cy, cz)];
    const vazio = chunkVazio(bytes);

    if (vazio && todosCheios) {
      chunk.fill(CEU_CHEIO); // 16³ de céu aberto: um memset
      continue;
    }
    if (vazio) {
      // ar, mas alguma coluna já vem atenuada (água/folha acima)
      for (let lx = 0; lx < CHUNK_SIZE; lx++)
        for (let lz = 0; lz < CHUNK_SIZE; lz++) {
          const i = lx * CHUNK_SIZE + lz;
          if (parou[i] !== -2) continue;
          const nivel = nivelCol[i]!;
          for (let ly = 0; ly < CHUNK_SIZE; ly++) escreverCeu(chunk, blockIndex(lx, ly, lz), nivel);
        }
      continue;
    }

    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      for (let lz = 0; lz < CHUNK_SIZE; lz++) {
        const i = lx * CHUNK_SIZE + lz;
        if (parou[i] !== -2) continue;
        let nivel = nivelCol[i]!;
        for (let ly = CHUNK_SIZE - 1; ly >= 0; ly--) {
          const bi = blockIndex(lx, ly, lz);
          const op = opacidadeLuz(bytes![bi]!);
          const y = cy * CHUNK_SIZE + ly;
          if (op >= OPACO) {
            parou[i] = y;
            descendo--;
            break;
          }
          escreverCeu(chunk, bi, nivel);
          if (op > 0) {
            nivel -= op; // água/folha: escurece descendo
            todosCheios = false;
            atenuou[i] = 1;
            if (nivel <= 0) {
              parou[i] = y - 1;
              descendo--;
              break;
            }
          }
        }
        nivelCol[i] = nivel;
      }
    }
  }
  for (let lx = 0; lx < CHUNK_SIZE; lx++)
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const p = parou[lx * CHUNK_SIZE + lz]!;
      piso[(lx + 1) * L + (lz + 1)] = p === -2 ? -1 : p;
    }

  // piso das 4 paredes da casca (colunas vizinhas — podem nem existir: chunk
  // ausente é ar e o piso vira −1, o que só faz a banda encolher)
  for (let k = 0; k < CHUNK_SIZE; k++) {
    piso[(k + 1) * L + 0] = pisoDoCeu(world, luz.dims, x0 + k, z0 - 1);
    piso[(k + 1) * L + (L - 1)] = pisoDoCeu(world, luz.dims, x0 + k, z0 + CHUNK_SIZE);
    piso[0 * L + (k + 1)] = pisoDoCeu(world, luz.dims, x0 - 1, z0 + k);
    piso[(L - 1) * L + (k + 1)] = pisoDoCeu(world, luz.dims, x0 + CHUNK_SIZE, z0 + k);
  }

  // passe 2: enfileira a banda útil de cada (x,z)
  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const meu = piso[(lx + 1) * L + (lz + 1)]!;
      const topo = Math.max(
        piso[lx * L + (lz + 1)]!,
        piso[(lx + 2) * L + (lz + 1)]!,
        piso[(lx + 1) * L + lz]!,
        piso[(lx + 1) * L + (lz + 2)]!,
      );
      const x = x0 + lx;
      const z = z0 + lz;
      const yTopo = Math.min(luz.sizeY - 1, topo + 1);
      for (let y = meu + 1; y <= yTopo; y++) fila.push(empacotar(luz, x, y, z));
      // célula ATENUADA (água/folha) nunca está em 15: os vizinhos podem estar
      // mais claros que ela, então ela entra na fila mesmo fora da banda. Só as
      // colunas que de fato atenuaram pagam esta varredura.
      if (atenuou[lx * CHUNK_SIZE + lz]) {
        for (let y = yTopo + 1; y < luz.sizeY; y++) {
          const n = luzCeu(luz, x, y, z);
          if (n > 0 && n < LUZ_MAX) fila.push(empacotar(luz, x, y, z));
        }
      }
    }
  }
}

/** Tochas (e futuros emissores) da coluna. Varre os BYTES do chunk direto — é
 *  32 768 células por coluna e `getBlock` faria 3 divisões em cada uma. */
function semearEmissoresDaColuna(
  world: World,
  luz: LuzWorld,
  cx: number,
  cz: number,
  fila: number[],
  sujos: Set<number>,
): void {
  for (let cy = 0; cy < luz.dims.y; cy++) {
    const bytes = world.chunks[luzChunkIndex(luz.dims, cx, cy, cz)];
    if (!bytes) continue;
    for (let i = 0; i < bytes.length; i++) {
      const emite = luzEmitida(bytes[i]!);
      if (emite <= 0) continue;
      const lx = i % CHUNK_SIZE;
      const resto = (i - lx) / CHUNK_SIZE;
      const lz = resto % CHUNK_SIZE;
      const ly = (resto - lz) / CHUNK_SIZE;
      const x = cx * CHUNK_SIZE + lx;
      const y = cy * CHUNK_SIZE + ly;
      const z = cz * CHUNK_SIZE + lz;
      setCanal(luz, x, y, z, CANAL_BLOCO, emite, sujos);
      fila.push(empacotar(luz, x, y, z));
    }
  }
}

/**
 * Casca de 1 bloco em volta da coluna: célula JÁ acesa do vizinho é semente,
 * senão a luz da coluna velha nunca entraria na nova (ficaria uma parede de luz
 * exatamente na fronteira, no meio da galeria).
 *
 * O céu obedece à mesma banda do `semearCeuDaColuna`: célula da casca em 15 com
 * o miolo também em 15 na mesma altura não tem nada a doar. Luz de BLOCO não
 * tem banda — tocha é rara, e o `piso` não diz nada sobre ela.
 */
function semearVizinhanca(
  luz: LuzWorld,
  cx: number,
  cz: number,
  piso: Int32Array,
  filaCeu: number[],
  filaBloco: number[],
): void {
  const L = CHUNK_SIZE + 2;
  const x0 = cx * CHUNK_SIZE;
  const z0 = cz * CHUNK_SIZE;
  /** `pi` = índice, na grade de piso, da célula do MIOLO vizinha desta da casca. */
  const empurrar = (x: number, z: number, pi: number): void => {
    if (!temCelula(luz, x, 0, z)) return;
    const yBanda = Math.min(luz.sizeY - 1, piso[pi]! + 1);
    for (let y = 0; y < luz.sizeY; y++) {
      const b = luzByte(luz, x, y, z);
      if (b === 0) continue;
      const ceu = b >> 4;
      if (ceu > 0 && (y <= yBanda || ceu < LUZ_MAX)) filaCeu.push(empacotar(luz, x, y, z));
      if (b & 0xf) filaBloco.push(empacotar(luz, x, y, z));
    }
  };
  for (let k = 0; k < CHUNK_SIZE; k++) {
    empurrar(x0 + k, z0 - 1, (k + 1) * L + 1);
    empurrar(x0 + k, z0 + CHUNK_SIZE, (k + 1) * L + CHUNK_SIZE);
    empurrar(x0 - 1, z0 + k, 1 * L + (k + 1));
    empurrar(x0 + CHUNK_SIZE, z0 + k, CHUNK_SIZE * L + (k + 1));
  }
}

/**
 * Acende a coluna de chunks (cx,cz) recém-materializada e devolve os índices de
 * chunk que precisam de remesh — INCLUSIVE os das colunas vizinhas, porque a
 * luz atravessa a fronteira nos dois sentidos.
 *
 * Chamada no mesmo ponto em que a coluna entra na fila de mesh (streaming), pra
 * a mesh já nascer com a luz certa em vez de aparecer clara e escurecer depois.
 */
export function acenderColuna(world: World, luz: LuzWorld, cx: number, cz: number): Set<number> {
  const sujos = new Set<number>();
  // coluna que o mundo ainda não materializou não tem luz nenhuma a ter: acender
  // aqui gravaria céu 15 num vazio que depois vira montanha (`getBlock` devolve
  // ar pra chunk ausente, e o ar mente nesse caso).
  if (!colunaGerada(world, cx, cz)) return sujos;
  alocarColunaLuz(luz, cx, cz);
  // acender é do ZERO: reacender a mesma coluna (troca de aula, coluna que
  // voltou ao raio) tem de dar o mesmo resultado da primeira vez. O que vinha
  // de fora volta pela casca em `semearVizinhanca`.
  for (let cy = 0; cy < luz.dims.y; cy++) {
    luz.chunks[luzChunkIndex(luz.dims, cx, cy, cz)]!.fill(0);
  }
  // a coluna inteira nasce suja (todo chunk dela mudou de escuro pra iluminado)
  // e com ela os chunks das 4 colunas vizinhas JÁ carregadas: a face culled
  // delas amostra a luz da borda desta. É a mesma vizinhança que o
  // `enfileirarColuna` do renderer já remesha por causa da geometria.
  for (let cy = 0; cy < luz.dims.y; cy++) {
    sujos.add(luzChunkIndex(luz.dims, cx, cy, cz));
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = cx + dx;
      const nz = cz + dz;
      if (nx < 0 || nz < 0 || nx >= luz.dims.x || nz >= luz.dims.z) continue;
      if (luz.chunks[luzChunkIndex(luz.dims, nx, 0, nz)]) {
        sujos.add(luzChunkIndex(luz.dims, nx, cy, nz));
      }
    }
  }
  const filaCeu: number[] = [];
  const filaBloco: number[] = [];
  const piso = new Int32Array((CHUNK_SIZE + 2) * (CHUNK_SIZE + 2)).fill(-1);
  semearCeuDaColuna(world, luz, cx, cz, filaCeu, piso);
  semearEmissoresDaColuna(world, luz, cx, cz, filaBloco, sujos);
  semearVizinhanca(luz, cx, cz, piso, filaCeu, filaBloco);
  propagar(world, luz, filaCeu, CANAL_CEU, sujos);
  propagar(world, luz, filaBloco, CANAL_BLOCO, sujos);
  return sujos;
}

/**
 * O bloco em (x,y,z) MUDOU (o byte novo já está no `world`). Recalcula os dois
 * canais em volta e devolve os chunks sujos.
 *
 * ⚠️ O conjunto sujo é MAIOR que o do `remeshBlock`: luz alcança até 15 blocos,
 * então uma tocha quebrada perto da borda suja chunks a 1 chunk de distância em
 * qualquer eixo. Quem remesha tem de usar ESTE conjunto, não o ±1 do bloco.
 */
export function atualizarBloco(
  world: World,
  luz: LuzWorld,
  x: number,
  y: number,
  z: number,
): Set<number> {
  const sujos = new Set<number>();
  if (!temCelula(luz, x, y, z)) return sujos;
  const id = getBlock(world, x, y, z);
  const op = opacidadeLuz(id);

  // --- canal BLOCO: apaga o que havia e reacende (emissor novo + vizinhos) ---
  const reacenderBloco: number[] = [];
  apagar(world, luz, x, y, z, CANAL_BLOCO, sujos, reacenderBloco);
  const emite = luzEmitida(id);
  if (emite > 0 && op < OPACO) {
    setCanal(luz, x, y, z, CANAL_BLOCO, emite, sujos);
    reacenderBloco.push(empacotar(luz, x, y, z));
  }
  propagar(world, luz, reacenderBloco, CANAL_BLOCO, sujos);

  // --- canal CÉU: idem, mas a célula pode reabrir uma coluna inteira ---
  const reacenderCeu: number[] = [];
  apagar(world, luz, x, y, z, CANAL_CEU, sujos, reacenderCeu);
  if (op < OPACO) {
    // vizinhos acesos são as sementes; o de CIMA em 15 desce reto e reabre a
    // coluna toda (quebrar o teto de uma sala devolve o dia lá dentro).
    for (const [dx, dy, dz] of DIRS) {
      if (temCelula(luz, x + dx, y + dy, z + dz)) {
        reacenderCeu.push(empacotar(luz, x + dx, y + dy, z + dz));
      }
    }
  }
  propagar(world, luz, reacenderCeu, CANAL_CEU, sujos);
  return sujos;
}
