import { plantarArvore, plantarMandacaru } from "./arvores";
import { type Clima, biomaPorClima, gramaPorClima } from "./biomas";
import { BlockId } from "./blocks";
import { CHUNK_SIZE, DEFAULT_WORLD_CHUNKS, MAX_WORLD_CHUNKS } from "./constants";
import { type World, type WorldDims, createWorld, getBlock, setBlock } from "./world";

/** Preset de criação de mundo (cp14): escolhido no menu/host, só vale pra
 *  mundo NOVO. "plano" e "cabines" são determinísticos (ignoram seed). */
export type WorldPreset = "normal" | "plano" | "cabines";

export function parseWorldPreset(v: unknown): WorldPreset {
  return v === "plano" || v === "cabines" ? v : "normal";
}

/** Tamanho de mundo NOVO (2026-07-19): escolhido no menu/host, só vale na
 *  criação — mundo restaurado lê as dims do próprio save (header LJW0).
 *  P = o padrão de sempre; G = teto validado do motor. */
export type WorldTamanho = "P" | "M" | "G";

export const TAMANHO_CHUNKS: Record<WorldTamanho, WorldDims> = {
  // Altura 128 em TODOS os tamanhos (2026-07-20): montanhas de verdade — as
  // serras do heightAt sobem até ~120. Mundo plano/aula segue DEFAULT (64):
  // cenário não precisa de céu, e o save fica na metade.
  P: { x: 8, z: 8, y: 8 }, // 128×128×128 (2 MB)
  M: { x: 12, z: 12, y: 8 }, // 192×192×128 (~4,5 MB)
  G: MAX_WORLD_CHUNKS, // 256×256×128 (8 MB)
};

export function parseWorldTamanho(v: unknown): WorldTamanho {
  return v === "M" || v === "G" ? v : "P";
}

/**
 * Geração de terreno determinística (mesma seed = mesmos bytes em qualquer
 * hospedeiro — requisito para snapshot/save binário e testes).
 * Value noise com hash inteiro; nada de Math.random.
 */

function hash2(ix: number, iz: number, seed: number): number {
  let h = seed ^ Math.imul(ix, 374761393) ^ Math.imul(iz, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/** Value noise 2D em [0,1). */
function valueNoise2(x: number, z: number, seed: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const sx = smooth(x - ix);
  const sz = smooth(z - iz);
  const v00 = hash2(ix, iz, seed);
  const v10 = hash2(ix + 1, iz, seed);
  const v01 = hash2(ix, iz + 1, seed);
  const v11 = hash2(ix + 1, iz + 1, seed);
  const a = v00 + (v10 - v00) * sx;
  const b = v01 + (v11 - v01) * sx;
  return a + (b - a) * sz;
}

/** Altura do terreno (y do bloco de topo) na coluna (x,z).
 *  Colinas [16,32) como sempre + SERRAS (2026-07-20): máscara de cordilheira
 *  de frequência baixa levanta picos até ~120. A máscara é smoothstep — fora
 *  da serra o fator é 0 e o terreno é idêntico ao de antes (praias e vales
 *  preservados). Serra SÓ em mundo alto (sizeY ≥ 128): mundo baixo (64 —
 *  aulas/testes) manteria só uma mesa clampada; nele o relevo segue colinas. */
export function heightAt(x: number, z: number, seed: number, sizeY = 128): number {
  const n1 = valueNoise2(x / 24, z / 24, seed);
  const n2 = valueNoise2(x / 7, z / 7, seed ^ 0x9e3779b9);
  const base = 16 + n1 * 12 + n2 * 4;
  if (sizeY < 128) return Math.floor(base);
  const serra = valueNoise2(x / 90, z / 90, seed ^ 0x5e77a1);
  const fator = smooth(Math.min(1, Math.max(0, (serra - 0.52) / 0.3)));
  const pico = valueNoise2(x / 28, z / 28, seed ^ 0x91377b);
  return Math.floor(base + fator * (28 + pico * 60));
}

/** Abaixo (ou igual) a esta altura o topo vira areia — cria "praias" nas partes baixas. */
export const SAND_HEIGHT = 18;

/** A partir desta altura o topo vira neve — SE o clima for frio (temp<0.6).
 *  58 fica ACIMA das colinas (máx ~31): neve agora é coisa de serra. */
export const SNOW_HEIGHT = 58;

/** Acima disto, montanha SEM neve (quente) expõe pedra nua — chapada. */
export const ROCHA_HEIGHT = 85;

/** Clima da coluna (2026-07-20): 2 campos de value noise de frequência BAIXA
 *  (célula ~80 blocos). A coerência de bioma vem da CONTINUIDADE destes campos
 *  (ver biomas.ts) — sem tabela de adjacência. */
export function climaAt(x: number, z: number, seed: number): Clima {
  return {
    temp: valueNoise2(x / 80, z / 80, seed ^ 0x51f7a3c1),
    umid: valueNoise2(x / 80, z / 80, seed ^ 0x2b9e1d47),
  };
}

/** PRNG determinístico (mulberry32) — SÓ pro gen: o mundo é finito e gerado
 *  inteiro na criação, então a ordem das chamadas é fixa = mesmos bytes. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Minérios por veia (2026-07-20): banda de profundidade + nº de veias por
 *  área + tamanho da veia. Raro fica fundo (convenção Minecraft). */
const MINERIOS: readonly {
  id: number;
  /** Veia só existe em y < teto. */
  teto: number;
  /** Veias por coluna de mundo (escala com a área X×Z). */
  porColuna: number;
  tamMin: number;
  tamMax: number;
}[] = [
  // tetos 72/40 (2026-07-20): o miolo das serras também tem carvão/ferro —
  // minerar montanha vale a pena; ouro/diamante seguem só no fundo
  { id: BlockId.MinerioCarvao, teto: 72, porColuna: 1 / 48, tamMin: 4, tamMax: 8 },
  { id: BlockId.MinerioFerro, teto: 40, porColuna: 1 / 64, tamMin: 3, tamMax: 6 },
  { id: BlockId.MinerioOuro, teto: 16, porColuna: 1 / 128, tamMin: 2, tamMax: 4 },
  { id: BlockId.MinerioDiamante, teto: 8, porColuna: 1 / 256, tamMin: 1, tamMax: 3 },
];

/** Passeio aleatório curto que SÓ substitui pedra — nunca fura superfície,
 *  subsolo ou bedrock. */
function plantarMinerios(world: World, seed: number): void {
  const rng = mulberry32(seed ^ 0x0d1ce5);
  for (const m of MINERIOS) {
    const teto = Math.min(m.teto, world.sizeY - 1);
    const veias = Math.max(1, Math.floor(world.sizeX * world.sizeZ * m.porColuna));
    for (let v = 0; v < veias; v++) {
      let x = Math.floor(rng() * world.sizeX);
      let y = 1 + Math.floor(rng() * (teto - 1));
      let z = Math.floor(rng() * world.sizeZ);
      const tam = m.tamMin + Math.floor(rng() * (m.tamMax - m.tamMin + 1));
      for (let i = 0; i < tam; i++) {
        if (getBlock(world, x, y, z) === BlockId.Stone) setBlock(world, x, y, z, m.id);
        const eixo = rng();
        const passo = rng() < 0.5 ? -1 : 1;
        if (eixo < 1 / 3) x += passo;
        else if (eixo < 2 / 3) z += passo;
        else y = Math.min(teto - 1, Math.max(1, y + passo));
      }
    }
  }
}

/** Árvores (espécie restrita ao bioma dono), flores e mandacaru — decididos
 *  por hash da coluna (determinístico e local). */
function plantarFeatures(world: World, seed: number): void {
  for (let x = 0; x < world.sizeX; x++) {
    for (let z = 0; z < world.sizeZ; z++) {
      const h = Math.min(heightAt(x, z, seed, world.sizeY), world.sizeY - 2);
      const topo = getBlock(world, x, h, z);
      const clima = climaAt(x, z, seed);
      const bioma = biomaPorClima(clima);
      const ehGrama =
        topo === BlockId.Grass || topo === BlockId.GramaSeca || topo === BlockId.GramaFria;
      if (ehGrama) {
        // árvores só em grama — praia/neve/caatinga ficam de fora por construção
        const r = hash2(x, z, seed ^ 0x7ee5);
        let acc = 0;
        let plantou = false;
        for (const [tipo, chance] of bioma.arvores) {
          acc += chance;
          if (r < acc) {
            plantarArvore(world, x, h + 1, z, tipo, hash2(x, z, seed ^ 0xa17a));
            plantou = true;
            break;
          }
        }
        if (!plantou && bioma.flores > 0 && hash2(x, z, seed ^ 0xf10e) < bioma.flores) {
          if (getBlock(world, x, h + 1, z) === BlockId.Air) {
            const cor = Math.floor(hash2(x, z, seed ^ 0xc0e5) * 4);
            setBlock(world, x, h + 1, z, BlockId.FlorVermelha + cor);
          }
        }
      } else if (topo === BlockId.Sand && h > SAND_HEIGHT && bioma.mandacaru > 0) {
        // caatinga (areia FORA da praia): mandacaru esparso
        if (hash2(x, z, seed ^ 0xcac70) < bioma.mandacaru) {
          plantarMandacaru(world, x, h + 1, z, hash2(x, z, seed ^ 0xa17a));
        }
      }
    }
  }
}

export function generateWorld(dims: WorldDims = DEFAULT_WORLD_CHUNKS, seed = 1): World {
  const world = createWorld(dims);
  for (let x = 0; x < world.sizeX; x++) {
    for (let z = 0; z < world.sizeZ; z++) {
      const h = Math.min(heightAt(x, z, seed, world.sizeY), world.sizeY - 2);
      const clima = climaAt(x, z, seed);
      const bioma = biomaPorClima(clima);
      // camada 0 = rocha-matriz (aluno não fura o fundo do mundo); igual ao plano
      setBlock(world, x, 0, z, BlockId.Bedrock);
      const iniSubsolo = Math.max(1, h - bioma.profundidadeSubsolo);
      for (let y = 1; y < iniSubsolo; y++) setBlock(world, x, y, z, BlockId.Stone);
      for (let y = iniSubsolo; y < h; y++) setBlock(world, x, y, z, bioma.subsolo);
      // praia é global por altura; pico nevado exige altura E frio (playtest
      // 2026-07-20: neve em cima da caatinga não combina — deserto quente);
      // serra quente muito alta expõe pedra (chapada)
      const topo =
        h <= SAND_HEIGHT ? BlockId.Sand
        : h >= SNOW_HEIGHT && clima.temp < 0.6 ? BlockId.Snow
        : h >= ROCHA_HEIGHT ? BlockId.Stone
        : bioma.topo === "grama" ? gramaPorClima(clima)
        : bioma.topo;
      setBlock(world, x, h, z, topo);
    }
  }
  plantarMinerios(world, seed);
  plantarFeatures(world, seed);
  return world;
}

/** Superfície do mundo plano (o y da grama). */
export const FLAT_SURFACE_Y = 3;

/**
 * Mundo PLANO (cp12, preset pra cenários): rocha-matriz no fundo (aluno não
 * fura o chão do mapa), terra, grama na superfície — resto ar. Determinístico
 * sem seed (plano é plano).
 */
export function generateFlatWorld(dims: WorldDims = DEFAULT_WORLD_CHUNKS): World {
  const world = createWorld(dims);
  for (let x = 0; x < world.sizeX; x++) {
    for (let z = 0; z < world.sizeZ; z++) {
      setBlock(world, x, 0, z, BlockId.Bedrock);
      setBlock(world, x, 1, z, BlockId.Dirt);
      setBlock(world, x, 2, z, BlockId.Dirt);
      setBlock(world, x, FLAT_SURFACE_Y, z, BlockId.Grass);
    }
  }
  return world;
}

/** Lado do plot em blocos (footprint CABIN_SIZE×CABIN_SIZE no canto do chunk). */
export const CABIN_SIZE = 5;
/** Bloco da borda que demarca o plot de cada grupo, rente ao chão. */
export const PLOT_MARKER = BlockId.StoneBricks;

/**
 * Mundo-modelo "cabines" (cp14; paredes removidas 2026-07-16 a pedido do
 * usuário): plano + um PLOT demarcado no canto de CADA chunk — borda de
 * pedra-lavrada rente ao chão (CABIN_SIZE×CABIN_SIZE), SEM paredes. Delimita a
 * área de cada grupo sem obstruir o movimento nem tapar a visão. O plot do
 * professor guarda a sequência-gabarito; os grupos replicam nos deles (varinha
 * ou /regiao carimbar). Determinístico, sem seed.
 */
export function generateCabinsWorld(dims: WorldDims = DEFAULT_WORLD_CHUNKS): World {
  const world = generateFlatWorld(dims);
  for (let cx = 0; cx < dims.x; cx++) {
    for (let cz = 0; cz < dims.z; cz++) {
      const ox = cx * CHUNK_SIZE;
      const oz = cz * CHUNK_SIZE;
      // borda rente ao solo: substitui a grama SÓ no perímetro do footprint.
      for (let i = 0; i < CABIN_SIZE; i++) {
        for (let j = 0; j < CABIN_SIZE; j++) {
          const borda = i === 0 || i === CABIN_SIZE - 1 || j === 0 || j === CABIN_SIZE - 1;
          if (borda) setBlock(world, ox + i, FLAT_SURFACE_Y, oz + j, PLOT_MARKER);
        }
      }
    }
  }
  return world;
}

/** Gera o mundo NOVO do preset escolhido (mundo restaurado de save ignora isto). */
export function generateWorldForPreset(
  preset: WorldPreset,
  dims: WorldDims,
  seed: number,
): World {
  if (preset === "plano") return generateFlatWorld(dims);
  if (preset === "cabines") return generateCabinsWorld(dims);
  return generateWorld(dims, seed);
}
