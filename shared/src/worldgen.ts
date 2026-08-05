import {
  ARVORE_RAIO_MAX,
  aplicarCelula,
  celulasDaArvore,
  celulasDoMandacaru,
} from "./arvores";
import {
  type ArvoreTipo,
  type Clima,
  biomaPorClima,
  gramaPorClima,
  relevoPorClima,
} from "./biomas";
import { BlockId } from "./blocks";
import { CHUNK_SIZE, DEFAULT_WORLD_CHUNKS, MAX_WORLD_CHUNKS } from "./constants";
import {
  type World,
  type WorldDims,
  alocarColuna,
  colunaGerada,
  createWorld,
  getBlock,
  setBlock,
} from "./world";

/** Preset de criação de mundo (cp14): escolhido no menu/host, só vale pra
 *  mundo NOVO. "plano" e "cabines" são determinísticos (ignoram seed). */
export type WorldPreset = "normal" | "plano" | "cabines";

export function parseWorldPreset(v: unknown): WorldPreset {
  return v === "plano" || v === "cabines" ? v : "normal";
}

/** Tamanho de mundo NOVO (2026-07-19): escolhido no menu/host, só vale na
 *  criação — mundo restaurado lê as dims do próprio save (header LJW0).
 *  P = o padrão de sempre; G = teto validado do motor. */
export type WorldTamanho = "P" | "M" | "G" | "E";

export const TAMANHO_CHUNKS: Record<WorldTamanho, WorldDims> = {
  // Altura 128 em TODOS os tamanhos (2026-07-20): montanhas de verdade — as
  // serras do heightAt sobem até ~120. Mundo plano/aula segue DEFAULT (64):
  // cenário não precisa de céu, e o save fica na metade.
  P: { x: 8, z: 8, y: 8 }, // 128×128×128 (2 MB)
  M: { x: 12, z: 12, y: 8 }, // 192×192×128 (~4,5 MB)
  G: MAX_WORLD_CHUNKS, // 256×256×128 (8 MB)
  // E = ENORME (F2 streaming): 3840×3840×128, ~900× a área do P. LAZY — as
  // colunas nascem sob demanda conforme os jogadores exploram; o join manda
  // só o header (LJE0) e as colunas viajam por raio de interesse.
  E: { x: 240, z: 240, y: 8 },
};

export function parseWorldTamanho(v: unknown): WorldTamanho {
  return v === "M" || v === "G" || v === "E" ? v : "P";
}

/** Mundo LAZY (streaming F2)? Qualquer coisa MAIOR que o teto denso (G) é
 *  gerada sob demanda — materializar tudo não cabe em memória/snapshot. */
export function ehMundoLazy(dims: WorldDims): boolean {
  return dims.x * dims.z * dims.y > MAX_WORLD_CHUNKS.x * MAX_WORLD_CHUNKS.z * MAX_WORLD_CHUNKS.y;
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

function hash3(ix: number, iy: number, iz: number, seed: number): number {
  let h =
    seed ^ Math.imul(ix, 374761393) ^ Math.imul(iy, 1013904223) ^ Math.imul(iz, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Escalas do ruído das cavernas. Y comprimido = túnel horizontal (caminhável). */
const CAV_XZ = 26;
const CAV_Y = 13;
const CAV_SEED_A = 0x0ca7e01;
const CAV_SEED_B = 0x5eca70f;

/**
 * Uma FATIA horizontal do value noise 3D: a bilinear em (x,z) no plano de
 * retículo `iy`. O ruído 3D completo é a interpolação de duas fatias vizinhas.
 *
 * A separação existe por DESEMPENHO, não por elegância: descendo uma coluna, os
 * índices e pesos de x e z não mudam NUNCA, e `iy` só muda a cada `CAV_Y`
 * blocos. Avaliar o ruído célula a célula custava 8 hashes por célula (16 com os
 * dois campos) e levou o worldgen de 2,6 para 28,6 ms por coluna — 10,9×, o
 * bastante pra derrubar o streaming (smoke `pedir-coluna`, 2026-07-28).
 * Amortizando por fatia, são 4 hashes a cada 13 células.
 */
function cavFatia(
  ix: number,
  iz: number,
  sx: number,
  sz: number,
  iy: number,
  seed: number,
): number {
  const v00 = hash3(ix, iy, iz, seed);
  const v10 = hash3(ix + 1, iy, iz, seed);
  const v01 = hash3(ix, iy, iz + 1, seed);
  const v11 = hash3(ix + 1, iy, iz + 1, seed);
  const a = v00 + (v10 - v00) * sx;
  const b = v01 + (v11 - v01) * sx;
  return a + (b - a) * sz;
}

/** Meia-largura da faixa de ruído que vira vazio, na altura y de uma coluna de
 *  topo h. Afina nas duas pontas — ver `cavernaEm`. */
function cavLimiar(y: number, h: number): number {
  const doFundo = Math.min(1, (y - 2) / 4);
  const daSuperficie = 0.4 + 0.6 * Math.min(1, (h - y) / 6);
  return LIMIAR_CAVERNA * doFundo * daSuperficie;
}

/**
 * §🏔️ CAVERNAS (2026-07-28) — a célula (x,y,z) é vazio de caverna?
 *
 * FUNÇÃO PURA de (x,y,z,h,seed), e tem de continuar sendo: o mundo E é lazy,
 * cada coluna nasce sozinha, e duas colunas vizinhas só fecham a mesma galeria
 * se as duas calcularem a MESMA resposta sem consultar o mundo nem estado algum.
 * É por isso que não há passe de pós-processamento (nem "alargar a caverna
 * depois", nem autômato celular): qualquer coisa que precise ver o vizinho já
 * gerado quebraria a borda.
 *
 * COMO A GALERIA NASCE: dois campos de ruído 3D independentes, e escava-se onde
 * os DOIS estão perto de 0,5. Cada condição sozinha é uma "fatia" do espaço;
 * a INTERSEÇÃO de duas fatias é um tubo — que é justamente o que se quer. Ruído
 * único com limiar daria bolha de queijo suíço, sem passagem ligando nada.
 *
 * O eixo Y é comprimido (÷13 contra ÷26 no plano): túnel mais horizontal que
 * vertical, ou seja, caminhável, em vez de poço.
 */
export function cavernaEm(x: number, y: number, z: number, h: number, seed: number): boolean {
  // y=0 é rocha-matriz e y=1 é o piso que sobra dela: nem um nem outro se abre
  // (chão furado até o fundo do mundo é buraco de cair fora, não caverna).
  if (y < 2 || y > h) return false;
  // afina nas duas pontas: perto do fundo (senão a rocha-matriz fica exposta em
  // toda parte) e perto da SUPERFÍCIE — ali o limiar cai a 40%, o que deixa a
  // boca de caverna rara o bastante pra ser um achado, e não um campo minado.
  const limiar = cavLimiar(y, h);
  if (limiar <= 0) return false;
  const fx = x / CAV_XZ;
  const fz = z / CAV_XZ;
  const fy = y / CAV_Y;
  const ix = Math.floor(fx);
  const iz = Math.floor(fz);
  const iy = Math.floor(fy);
  const sx = smooth(fx - ix);
  const sz = smooth(fz - iz);
  const sy = smooth(fy - iy);
  const a0 = cavFatia(ix, iz, sx, sz, iy, seed ^ CAV_SEED_A);
  const a1 = cavFatia(ix, iz, sx, sz, iy + 1, seed ^ CAV_SEED_A);
  // o campo B só é avaliado se o A já passou: ~88% das células morrem aqui, e
  // não vale calcular o segundo ruído pra elas.
  if (Math.abs(a0 + (a1 - a0) * sy - 0.5) >= limiar) return false;
  const b0 = cavFatia(ix, iz, sx, sz, iy, seed ^ CAV_SEED_B);
  const b1 = cavFatia(ix, iz, sx, sz, iy + 1, seed ^ CAV_SEED_B);
  return Math.abs(b0 + (b1 - b0) * sy - 0.5) < limiar;
}

/**
 * A coluna (x,z) inteira de uma vez: `saida[y] = 1` onde há vazio de caverna.
 *
 * Mesma resposta de `cavernaEm` célula a célula (há teste que compara as duas,
 * e ele é o que garante que otimizar aqui não muda mundo nenhum) — o que muda é
 * o custo: os índices/pesos de x e z saem UMA vez, e as fatias de ruído são
 * reaproveitadas enquanto `iy` não vira. É este o caminho que a geração usa.
 */
export function cavernasDaColuna(
  x: number,
  z: number,
  h: number,
  seed: number,
  saida: Uint8Array,
): void {
  saida.fill(0);
  if (h < 2) return;
  const fx = x / CAV_XZ;
  const fz = z / CAV_XZ;
  const ix = Math.floor(fx);
  const iz = Math.floor(fz);
  const sx = smooth(fx - ix);
  const sz = smooth(fz - iz);
  let iyAtual = -1;
  let a0 = 0;
  let a1 = 0;
  let b0 = 0;
  let b1 = 0;
  let temB = false;
  const limiteY = Math.min(h, saida.length - 1);
  for (let y = 2; y <= limiteY; y++) {
    const limiar = cavLimiar(y, h);
    if (limiar <= 0) continue;
    const fy = y / CAV_Y;
    const iy = Math.floor(fy);
    if (iy !== iyAtual) {
      a0 = cavFatia(ix, iz, sx, sz, iy, seed ^ CAV_SEED_A);
      a1 = cavFatia(ix, iz, sx, sz, iy + 1, seed ^ CAV_SEED_A);
      temB = false; // o campo B desta faixa só se calcula se alguém precisar
      iyAtual = iy;
    }
    const sy = smooth(fy - iy);
    if (Math.abs(a0 + (a1 - a0) * sy - 0.5) >= limiar) continue;
    if (!temB) {
      b0 = cavFatia(ix, iz, sx, sz, iy, seed ^ CAV_SEED_B);
      b1 = cavFatia(ix, iz, sx, sz, iy + 1, seed ^ CAV_SEED_B);
      temB = true;
    }
    if (Math.abs(b0 + (b1 - b0) * sy - 0.5) < limiar) saida[y] = 1;
  }
}

/** Meia-largura da faixa de cada campo de ruído que vira vazio. Calibrado em
 *  2026-07-28 contra a fração de subsolo escavado (ver worldgen.test.ts). */
const LIMIAR_CAVERNA = 0.06;

/** Altura do terreno (y do bloco de topo) na coluna (x,z).
 *  Colinas [16,32) como sempre + SERRAS (2026-07-20): máscara de cordilheira
 *  de frequência baixa levanta picos até ~120. A máscara é smoothstep — fora
 *  da serra o fator é 0 e o terreno é idêntico ao de antes (praias e vales
 *  preservados). Serra SÓ em mundo alto (sizeY ≥ 128): mundo baixo (64 —
 *  aulas/testes) manteria só uma mesa clampada; nele o relevo segue colinas.
 *
 *  §🏔️ RELEVO POR BIOMA (2026-07-30): a amplitude da serra é multiplicada por
 *  `relevoPorClima`. Duas consequências, as duas pedidas no playtest: cada
 *  bioma tem seu teto (duna de caatinga não vira pico de 106) e o fator cai a
 *  ZERO na divisa, então a serra nasce inteira dentro de um bioma só. As
 *  colinas (`base`) seguem GLOBAIS de propósito — é o que dá continuidade de
 *  terreno onde o relevo é zerado.
 *
 *  `clima` é opcional só por economia: quem já calculou o `climaAt` da coluna
 *  passa e evita 2 lookups de ruído por coluna no caminho quente do gen. */
export function heightAt(
  x: number,
  z: number,
  seed: number,
  sizeY = 128,
  clima?: Clima,
): number {
  const n1 = valueNoise2(x / 24, z / 24, seed);
  const n2 = valueNoise2(x / 7, z / 7, seed ^ 0x9e3779b9);
  const base = 16 + n1 * 12 + n2 * 4;
  if (sizeY < 128) return Math.floor(base);
  const rel = relevoPorClima(clima ?? climaAt(x, z, seed));
  // divisa de bioma (núcleo 0) e tabuleiro: o terreno é só colina, e sai daqui
  // sem pagar os 2 ruídos da serra
  if (rel <= 0) return Math.floor(base);
  const serra = valueNoise2(x / 90, z / 90, seed ^ 0x5e77a1);
  const fator = smooth(Math.min(1, Math.max(0, (serra - 0.52) / 0.3)));
  const pico = valueNoise2(x / 28, z / 28, seed ^ 0x91377b);
  return Math.floor(base + rel * fator * (28 + pico * 60));
}

/** Nível do mar (2026-07-26): toda coluna cujo terreno termina ABAIXO disto é
 *  inundada com água-FONTE de `h+1` até aqui — mar nas bacias grandes, lago nas
 *  depressões pequenas. Sai ~1/6 das colunas com água, fundo de até 4 blocos.
 *  A água nasce estática: a fila de vizinhança do tick só acorda quando alguém
 *  edita um bloco (`applyBlock`), então o oceano não custa tick nenhum no boot.
 *  Só vale pro preset "normal" — plano/cabines (aulas) não têm água. */
export const NIVEL_MAR = 22;

/** Abaixo (ou igual) a esta altura o topo vira areia — cria "praias" nas partes
 *  baixas. Fica 1 acima do mar: a faixa seca de areia contorna a água (praia) e
 *  o fundo submerso também é areia. */
export const SAND_HEIGHT = NIVEL_MAR + 1;

/** A partir desta altura o topo vira neve — SE o clima for frio (temp<0.6).
 *  58 fica ACIMA das colinas (máx ~31): neve agora é coisa de serra. */
export const SNOW_HEIGHT = 58;

/** Acima disto, montanha SEM neve (quente) expõe pedra nua — chapada.
 *
 *  ⚠️ INALCANÇÁVEL desde o §🏔️ relevo por bioma (2026-07-30) e isso é de
 *  propósito: só as araucárias passam de 85 (teto medido 106) e elas NEVAM, e o
 *  ramo da neve vem antes. Cerrado para em ~53 e mata em ~68. Medido: 0% das
 *  colunas de topo saem `Stone` em 5 seeds × 400×400. Fica de pé como rede de
 *  segurança — se um dia alguém subir o `relevo` do cerrado (0,35) buscando
 *  chapada de verdade, a pedra nua volta sozinha sem código novo. Se a chapada
 *  for pedida COMO FEATURE, o caminho é baixar este número, não mexer no gen. */
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

/** PRNG determinístico (mulberry32) — SÓ pro gen, com seed derivada POR
 *  COLUNA DE CHUNKS: a sequência é local e re-derivável por qualquer vizinho. */
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

/** Bloco do TOPO da coluna (x,z) — função PURA da fórmula, sem ler mundo.
 *  Praia é global por altura; neve exige altura E um bioma que NEVA
 *  (`Bioma.neve`, §🏔️ 2026-07-30 — antes era `temp < 0.6`, que pegava morro de
 *  cerrado e produziu o "areia, pedra, terra e neve junto" do playtest); serra
 *  muito alta em bioma que não neva expõe pedra (chapada). A geração por chunk
 *  depende disto ser puro: decisão de feature nunca lê o mundo (a ordem de
 *  geração não pode mudar bytes). */
export function topoPrevisto(x: number, z: number, seed: number, sizeY: number): number {
  const clima = climaAt(x, z, seed);
  const bioma = biomaPorClima(clima);
  const h = Math.min(heightAt(x, z, seed, sizeY, clima), sizeY - 2);
  return h <= SAND_HEIGHT ? BlockId.Sand
    : h >= SNOW_HEIGHT && bioma.neve ? BlockId.Snow
    : h >= ROCHA_HEIGHT ? BlockId.Stone
    : bioma.topo === "grama" ? gramaPorClima(clima)
    : bioma.topo;
}

/** Mistura (a,b,seed) num int 32 — seed derivada por coluna de chunks. */
function hashInt(a: number, b: number, seed: number): number {
  let h = seed ^ Math.imul(a, 374761393) ^ Math.imul(b, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) | 0;
}

interface Veia {
  readonly id: number;
  /** Células do passeio, em coordenadas ABSOLUTAS (podem vazar da coluna). */
  readonly celulas: readonly { x: number; y: number; z: number }[];
}

/** Veias de minério cuja ORIGEM cai na coluna de chunks (ccx,ccz) — função
 *  PURA de (ccx,ccz,seed): qualquer vizinho re-deriva a MESMA lista e aplica
 *  só a fatia que cai nele (passeio máx 8 passos < 1 chunk = margem 1). */
function veiasDaColuna(ccx: number, ccz: number, seed: number, sizeY: number): Veia[] {
  const rng = mulberry32(hashInt(ccx, ccz, seed ^ 0x0d1ce5));
  const out: Veia[] = [];
  const area = CHUNK_SIZE * CHUNK_SIZE;
  for (const m of MINERIOS) {
    const teto = Math.min(m.teto, sizeY - 1);
    const alvo = area * m.porColuna; // média de veias por coluna de chunks
    const n = Math.floor(alvo) + (rng() < alvo - Math.floor(alvo) ? 1 : 0);
    for (let v = 0; v < n; v++) {
      let x = ccx * CHUNK_SIZE + Math.floor(rng() * CHUNK_SIZE);
      let y = 1 + Math.floor(rng() * (teto - 1));
      let z = ccz * CHUNK_SIZE + Math.floor(rng() * CHUNK_SIZE);
      const tam = m.tamMin + Math.floor(rng() * (m.tamMax - m.tamMin + 1));
      const celulas: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i < tam; i++) {
        celulas.push({ x, y, z });
        const eixo = rng();
        const passo = rng() < 0.5 ? -1 : 1;
        if (eixo < 1 / 3) x += passo;
        else if (eixo < 2 / 3) z += passo;
        else y = Math.min(teto - 1, Math.max(1, y + passo));
      }
      out.push({ id: m.id, celulas });
    }
  }
  return out;
}

/** Árvore na coluna de blocos (x,z)? Decisão PURA (nunca lê o mundo). */
function arvoreDaColuna(
  x: number,
  z: number,
  seed: number,
  sizeY: number,
): { tipo: ArvoreTipo; varia: number } | null {
  const topo = topoPrevisto(x, z, seed, sizeY);
  const ehGrama =
    topo === BlockId.Grass || topo === BlockId.GramaSeca || topo === BlockId.GramaFria;
  if (!ehGrama) return null; // praia/neve/caatinga/chapada ficam de fora
  const bioma = biomaPorClima(climaAt(x, z, seed));
  const r = hash2(x, z, seed ^ 0x7ee5);
  let acc = 0;
  for (const [tipo, chance] of bioma.arvores) {
    acc += chance;
    if (r < acc) return { tipo, varia: hash2(x, z, seed ^ 0xa17a) };
  }
  return null;
}

/**
 * Gera a coluna de chunks (ccx,ccz) — TODOS os cy juntos (terreno é por
 * coluna de blocos). ORDEM-INDEPENDENTE: decisões são puras por coluna;
 * veias e árvores vizinhas são re-derivadas (margem) e só a fatia local é
 * escrita. Mesma seed = mesmos bytes, gere-se na ordem que for.
 */
export function gerarColunaDeChunks(
  world: World,
  ccx: number,
  ccz: number,
  seed: number,
): void {
  if (colunaGerada(world, ccx, ccz)) return;
  alocarColuna(world, ccx, ccz);
  const x0 = ccx * CHUNK_SIZE;
  const z0 = ccz * CHUNK_SIZE;
  const x1 = x0 + CHUNK_SIZE - 1;
  const z1 = z0 + CHUNK_SIZE - 1;
  const sizeY = world.sizeY;

  // 1) terreno das colunas locais
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      // um climaAt por coluna, reusado pelo relevo (heightAt) e pelo bioma
      const clima = climaAt(x, z, seed);
      const h = Math.min(heightAt(x, z, seed, sizeY, clima), sizeY - 2);
      const bioma = biomaPorClima(clima);
      // camada 0 = rocha-matriz (aluno não fura o fundo); igual ao plano
      setBlock(world, x, 0, z, BlockId.Bedrock);
      const iniSubsolo = Math.max(1, h - bioma.profundidadeSubsolo);
      for (let y = 1; y < iniSubsolo; y++) setBlock(world, x, y, z, BlockId.Stone);
      for (let y = iniSubsolo; y < h; y++) setBlock(world, x, y, z, bioma.subsolo);
      setBlock(world, x, h, z, topoPrevisto(x, z, seed, sizeY));
      // mar/lago: inunda o que ficou abaixo do nível do mar. FONTE (nível 8) em
      // toda célula — poça de fonte é auto-regenerativa (o aluno cava e enche
      // de volta pela regra dos 2 vizinhos-fonte) e não escorre sozinha.
      const mar = Math.min(NIVEL_MAR, sizeY - 2);
      for (let y = h + 1; y <= mar; y++) setBlock(world, x, y, z, BlockId.Agua);
    }
  }

  // 2) veias de minério: re-deriva as 3×3 colunas de chunks e aplica a fatia
  //    local (só substitui pedra — nunca fura superfície/subsolo/bedrock)
  for (let dcx = -1; dcx <= 1; dcx++) {
    for (let dcz = -1; dcz <= 1; dcz++) {
      for (const veia of veiasDaColuna(ccx + dcx, ccz + dcz, seed, sizeY)) {
        for (const c of veia.celulas) {
          if (c.x < x0 || c.x > x1 || c.z < z0 || c.z > z1) continue;
          if (getBlock(world, c.x, c.y, c.z) === BlockId.Stone) {
            setBlock(world, c.x, c.y, c.z, veia.id);
          }
        }
      }
    }
  }

  // 2.5) §🏔️ CAVERNAS: escava DEPOIS do minério, de propósito — assim a veia
  //      aparece cortada na parede da galeria (é o que faz explorar valer a
  //      pena) em vez de a caverna nascer sempre em pedra limpa.
  //      Só mexe em sólido: água nunca é escavada.
  const vazios = new Uint8Array(sizeY);
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      const h = Math.min(heightAt(x, z, seed, sizeY), sizeY - 2);
      // Coluna SUBMERSA guarda o topo como casca (decisão do usuário,
      // 2026-07-28): a caverna sob o mar nasce SECA, separada da água por essa
      // casca fina. Quem furar o teto depois deixa o mar entrar — e aí é a
      // regra da água que resolve, não a geração.
      const yMax = h <= Math.min(NIVEL_MAR, sizeY - 2) ? h - 1 : h;
      cavernasDaColuna(x, z, h, seed, vazios);
      for (let y = 2; y <= yMax; y++) {
        if (!vazios[y]) continue;
        const atual = getBlock(world, x, y, z);
        if (atual === BlockId.Air || atual === BlockId.Bedrock) continue;
        setBlock(world, x, y, z, BlockId.Air);
      }
    }
  }

  // 3) árvores: re-deriva troncos até ARVORE_RAIO_MAX além da borda; só a
  //    fatia local é escrita (filtro evita tocar coluna vizinha já gerada)
  const M = ARVORE_RAIO_MAX;
  for (let x = x0 - M; x <= x1 + M; x++) {
    for (let z = z0 - M; z <= z1 + M; z++) {
      const arv = arvoreDaColuna(x, z, seed, sizeY);
      if (!arv) continue;
      const h = Math.min(heightAt(x, z, seed, sizeY), sizeY - 2);
      // §🏔️ o chão do tronco pode ter virado boca de caverna. O teste é a função
      // PURA (não `getBlock`): o tronco pode estar numa coluna vizinha ainda não
      // gerada, e ler o mundo aqui faria a árvore depender da ORDEM de geração.
      if (cavernaEm(x, h, z, h, seed)) continue;
      for (const c of celulasDaArvore(x, h + 1, z, arv.tipo, arv.varia)) {
        if (c.x < x0 || c.x > x1 || c.z < z0 || c.z > z1) continue;
        aplicarCelula(world, c);
      }
    }
  }

  // 4) flores e mandacaru (margem zero — só colunas locais)
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      const clima = climaAt(x, z, seed);
      const h = Math.min(heightAt(x, z, seed, sizeY, clima), sizeY - 2);
      const topo = topoPrevisto(x, z, seed, sizeY);
      const bioma = biomaPorClima(clima);
      const ehGrama =
        topo === BlockId.Grass || topo === BlockId.GramaSeca || topo === BlockId.GramaFria;
      if (cavernaEm(x, h, z, h, seed)) continue; // §🏔️ boca de caverna não tem chão
      if (ehGrama) {
        if (arvoreDaColuna(x, z, seed, sizeY)) continue; // coluna já tem árvore
        if (bioma.flores > 0 && hash2(x, z, seed ^ 0xf10e) < bioma.flores) {
          // copa vizinha pode ocupar a célula — as árvores do passo 3 já
          // moram NESTA coluna, então a leitura é local e determinística
          if (getBlock(world, x, h + 1, z) === BlockId.Air) {
            const cor = Math.floor(hash2(x, z, seed ^ 0xc0e5) * 4);
            setBlock(world, x, h + 1, z, BlockId.FlorVermelha + cor);
          }
        } else if (bioma.algodao > 0 && hash2(x, z, seed ^ 0xa16d) < bioma.algodao) {
          // §🍖 F10c: o pé de algodão SELVAGEM. Entra ANTES do capim na cadeia
          // de `else if` (que é o que impede dois sorteios de escreverem na
          // mesma célula) porque é o mais RARO dos três: deixado por último,
          // o capim do cerrado — 1 em 6 — comeria quase toda coluna elegível,
          // e a descoberta que abre a cadeia da lã quase não aconteceria.
          if (getBlock(world, x, h + 1, z) === BlockId.Air) {
            setBlock(world, x, h + 1, z, BlockId.AlgodaoSelvagem);
          }
        } else if (bioma.gramaAlta > 0 && hash2(x, z, seed ^ 0x6a3a) < bioma.gramaAlta) {
          // §🌬️ capim (2026-07-27): SÓ onde não caiu flor (o `else if` evita que
          // um sorteie por cima do outro) e só em célula vazia. A variante segue
          // o topo da coluna: capim verde em cima de grama seca ficaria colado.
          if (getBlock(world, x, h + 1, z) === BlockId.Air) {
            const variante =
              topo === BlockId.GramaSeca
                ? BlockId.GramaAltaSeca
                : topo === BlockId.GramaFria
                  ? BlockId.GramaAltaFria
                  : BlockId.GramaAlta;
            setBlock(world, x, h + 1, z, variante);
          }
        }
        // gate do mandacaru = linha d'ÁGUA (2026-07-26), não mais SAND_HEIGHT:
        // com o mar, a faixa de areia desceu junto e a caatinga baixa perdia
        // TODOS os cactos. O que importa é o cacto não nascer molhado.
      } else if (topo === BlockId.Sand && h > NIVEL_MAR && bioma.mandacaru > 0) {
        if (hash2(x, z, seed ^ 0xcac70) < bioma.mandacaru) {
          for (const c of celulasDoMandacaru(x, h + 1, z, hash2(x, z, seed ^ 0xa17a))) {
            aplicarCelula(world, c);
          }
        }
      }
    }
  }
}

/** Gera o mundo INTEIRO (materializa todas as colunas) — comportamento dos
 *  tamanhos atuais. O streaming (F2) chamará gerarColunaDeChunks sob demanda. */
export function generateWorld(dims: WorldDims = DEFAULT_WORLD_CHUNKS, seed = 1): World {
  const world = createWorld(dims, false);
  for (let ccx = 0; ccx < dims.x; ccx++) {
    for (let ccz = 0; ccz < dims.z; ccz++) {
      gerarColunaDeChunks(world, ccx, ccz, seed);
    }
  }
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

/** Gera o mundo NOVO do preset escolhido (mundo restaurado de save ignora isto).
 *  Mundo LAZY (tamanho E): nasce VAZIO — a session materializa o spawn e o
 *  streaming gera o resto sob demanda (preset é sempre o terreno normal;
 *  plano/cabines gigantes não fazem sentido pedagógico). */
export function generateWorldForPreset(
  preset: WorldPreset,
  dims: WorldDims,
  seed: number,
): World {
  if (ehMundoLazy(dims)) return createWorld(dims, false);
  if (preset === "plano") return generateFlatWorld(dims);
  if (preset === "cabines") return generateCabinsWorld(dims);
  return generateWorld(dims, seed);
}
