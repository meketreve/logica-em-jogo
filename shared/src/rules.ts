import {
  BlockId,
  aguaComNivel,
  aguaNivel,
  apoioValido,
  camaHeadDir,
  isAgua,
  isAguaFonte,
  isFullCube,
  isPlantacao,
  isPlantacaoMadura,
} from "./blocks";
import { type World, getBlock, inBounds } from "./world";

/**
 * Sistema GENÉRICO de atualização de bloco por vizinhança — a REGRA DE OURO
 * da arquitetura: "bloco muda, avisa vizinhos, propaga no tick do servidor".
 * Areia usa 1 vizinho/1 regra hoje; circuitos lógicos (9º ano) usarão
 * N vizinhos/N regras na MESMA engrenagem. Nada aqui é código especial de areia:
 * pra criar comportamento novo, escreve-se uma regra e registra-se em RULES.
 */

export interface BlockChange {
  x: number;
  y: number;
  z: number;
  blockId: number;
}

/**
 * Regra de um tipo de bloco: chamada no tick do servidor quando a célula
 * (x,y,z) está "suja" (ela ou um vizinho mudou). SÓ LÊ o mundo — devolve as
 * mudanças desejadas (a sessão aplica e propaga) ou null se nada a fazer.
 */
export type BlockRule = (
  world: World,
  x: number,
  y: number,
  z: number,
) => BlockChange[] | null;

/** Queda: se a célula de baixo é ar, o bloco (o que ESTIVER na célula) desce 1
 *  por tick. Genérica — serve areia, cascalho e qualquer futuro "bloco que cai". */
export const fallingRule: BlockRule = (world, x, y, z) => {
  if (y === 0) return null; // fundo do mundo (fora = Air, mas não há onde cair)
  if (getBlock(world, x, y - 1, z) !== BlockId.Air) return null;
  return [
    // materializa embaixo ANTES de limpar a origem: o transiente (1 frame no
    // cliente) fica duplicado e invisível; na ordem inversa piscaria um buraco
    { x, y: y - 1, z, blockId: getBlock(world, x, y, z) },
    { x, y, z, blockId: BlockId.Air },
  ];
};

/** Porta (cp23): metade sem o PAR (mesmo id logo acima OU logo abaixo)
 *  evapora — quebrar uma célula derruba a outra no tick seguinte, sem
 *  código especial no break_block. */
export const doorRule: BlockRule = (world, x, y, z) => {
  const id = getBlock(world, x, y, z);
  if (getBlock(world, x, y + 1, z) === id) return null;
  if (getBlock(world, x, y - 1, z) === id) return null;
  return [{ x, y, z, blockId: BlockId.Air }];
};

/** Cama (2026-07-20): ocupa 2 células no horizontal (pé + cabeceira). A metade
 *  sem o PAR (mesma cama no eixo, de um lado OU do outro) evapora — quebrar uma
 *  derruba a outra no tick seguinte, sem código especial no break (igual à porta). */
export const camaRule: BlockRule = (world, x, y, z) => {
  const id = getBlock(world, x, y, z);
  const { dx, dz } = camaHeadDir(id);
  if (getBlock(world, x + dx, y, z + dz) === id) return null; // par na cabeceira (este é o pé)
  if (getBlock(world, x - dx, y, z - dz) === id) return null; // par no pé (este é a cabeceira)
  return [{ x, y, z, blockId: BlockId.Air }];
};

/**
 * Apoio (cp23): perdeu o que segurava embaixo, some. Vale pra tocha, tapete,
 * flor, capim e plantação — quem responde "este apoio serve?" é `apoioValido`,
 * a MESMA função que o `place_block` consulta, senão dava pra colocar uma coisa
 * que evapora no tick seguinte.
 */
export const torchRule: BlockRule = (world, x, y, z) => {
  const id = getBlock(world, x, y, z);
  if (apoioValido(id, getBlock(world, x, y - 1, z))) return null;
  return [{ x, y, z, blockId: BlockId.Air }];
};

/** §🍖 F6: ticks entre dois estágios da plantação (10 Hz → 20 s por estágio,
 *  ~1 min da muda ao trigo maduro). É O botão de ajuste do playtest: uma aula
 *  tem 50 min e a barra de fome leva a aula inteira pra esvaziar, então a horta
 *  tem de responder em minutos, não em temporadas. */
export const TICKS_POR_CRESCIMENTO = 200;

/**
 * §🍖 F6 — a plantação avança UM estágio.
 *
 * NÃO está no registro `RULES`, e isso é a decisão do desenho: a fila de células
 * sujas acorda por VIZINHANÇA ("alguém mexeu aqui do lado"), e crescer não é
 * reação a vizinho nenhum — é tempo passando. Se fosse regra registrada, colocar
 * um bloco ao lado da horta a faria amadurecer na hora. Então a session guarda
 * as células plantadas e chama esta função de `TICKS_POR_CRESCIMENTO` em
 * `TICKS_POR_CRESCIMENTO`; o resto (broadcast, sujar vizinho) é o `applyBlock`
 * de sempre. Pura e testável como qualquer `BlockRule`.
 *
 * **Não olha luz**: a luz do jogo mora 100% no cliente (§💡) e o servidor não
 * tem esse byte. Plantação cresce no escuro, e numa aula isso é uma dor a menos.
 */
export const crescerPlantacao: BlockRule = (world, x, y, z) => {
  const id = getBlock(world, x, y, z);
  if (!isPlantacao(id) || isPlantacaoMadura(id)) return null;
  // sem solo embaixo a planta está de saída (o torchRule a apaga no tick da
  // vizinhança) — não faz sentido ela crescer no caminho
  if (!apoioValido(id, getBlock(world, x, y - 1, z))) return null;
  return [{ x, y, z, blockId: id + 1 }];
};

/** 4 vizinhos horizontais (a água só espalha na MESMA camada + cai). */
const LADOS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/** Quantos dos 4 vizinhos laterais são FONTE (água infinita: ≥2 = vira fonte). */
function fontesLaterais(world: World, x: number, y: number, z: number): number {
  let n = 0;
  for (const [dx, dz] of LADOS) {
    if (isAguaFonte(getBlock(world, x + dx, y, z + dz))) n++;
  }
  return n;
}

/** Nível que ESTA célula fluida deveria ter, olhando o entorno. 0 = deve secar.
 *  Fonte de suprimento: água ACIMA (queda → nível cheio 7) OU o maior vizinho
 *  lateral menos 1 (fonte=8→7, fluida k→k−1). Recomputar a cada tick é o que
 *  faz o fluxo ENCHER e SECAR sozinho quando a fonte some. */
function nivelSuportado(world: World, x: number, y: number, z: number): number {
  if (isAgua(getBlock(world, x, y + 1, z))) return 7; // alimentada pela queda de cima
  let best = 0;
  for (const [dx, dz] of LADOS) {
    const nl = aguaNivel(getBlock(world, x + dx, y, z + dz));
    if (nl > 0) best = Math.max(best, nl - 1);
  }
  return best;
}

/** Alcance da busca pelo desnível mais próximo (fluxo estilo Minecraft): a água
 *  procura uma QUEDA em até 4 células andando na horizontal. Achou → escorre só
 *  na direção dela (não dá a volta no obstáculo); não achou → espalha nos 4
 *  lados (poça). Alcance curto = busca barata + água em FIO, não em disco. */
const DROP_SEARCH = 4;

/** true se a água nesta célula DESCERIA: há um desnível abaixo. Conta ar (queda
 *  seca) E água fluida (uma coluna já caindo ainda é descida — senão, assim que
 *  a água enche o buraco ela "some" como alvo e o fluxo volta a espalhar). Fonte
 *  e sólido embaixo NÃO são descida; o fundo do mundo também não (não vaza). */
function temQueda(world: World, x: number, y: number, z: number): boolean {
  if (!inBounds(world, x, y - 1, z)) return false;
  const b = getBlock(world, x, y - 1, z);
  return b === BlockId.Air || (isAgua(b) && !isAguaFonte(b));
}

/** Célula por onde a água correria na horizontal durante a busca: ar OU fluida
 *  (nunca fonte, nunca sólido, nunca fora do mundo). Parede/fonte BARRAM a busca
 *  — é o que faz a água ignorar o caminho longo quando a queda está mais perto. */
function aguaAtravessa(world: World, x: number, y: number, z: number): boolean {
  if (!inBounds(world, x, y, z)) return false;
  const b = getBlock(world, x, y, z);
  return b === BlockId.Air || (isAgua(b) && !isAguaFonte(b));
}

/** Passos até a queda mais próxima a partir de (x,z) na camada y, andando só por
 *  células que a água atravessa e sem voltar pela direção de onde veio. Busca em
 *  profundidade limitada a DROP_SEARCH; Infinity se nenhuma queda no alcance. */
function passosAteQueda(
  world: World,
  x: number,
  y: number,
  z: number,
  dist: number,
  veioDx: number,
  veioDz: number,
): number {
  let best = Infinity;
  for (const [dx, dz] of LADOS) {
    if (dx === veioDx && dz === veioDz) continue; // não volta pra trás
    const nx = x + dx;
    const nz = z + dz;
    if (!aguaAtravessa(world, nx, y, nz)) continue; // parede/fonte: barra a busca
    if (temQueda(world, nx, y, nz)) return dist; // achou o desnível
    if (dist >= DROP_SEARCH) continue; // fim do alcance por este ramo
    const sub = passosAteQueda(world, nx, y, nz, dist + 1, -dx, -dz);
    if (sub < best) best = sub;
  }
  return best;
}

/**
 * Água FLUIDA (2026-07-22): autômato celular na MESMA engrenagem da regra de
 * ouro. Cada célula de água (fonte ou fluida) recomputa o próprio nível e
 * EMPURRA água pros vizinhos elegíveis (ar embaixo → cai; senão espalha lateral
 * com nível−1). Fonte (nível 8) é permanente; fluida seca quando o suprimento
 * some (o recomputo baixa o nível → 0 = ar). Água infinita: fluida sobre chão
 * sólido com ≥2 fontes laterais VIRA fonte. Alcance horizontal = 7 células
 * (nível decrementa por distância) → bounded, não trava tablet.
 */
export const waterRule: BlockRule = (world, x, y, z) => {
  const cur = getBlock(world, x, y, z);
  const changes: BlockChange[] = [];
  const below = getBlock(world, x, y - 1, z);

  // nível efetivo desta célula (define o quanto espalha)
  let nivel: number;
  if (isAguaFonte(cur)) {
    nivel = 8; // fonte nunca seca pela regra — só balde/bloco por cima remove
  } else if (isFullCube(below) && !isAgua(below) && fontesLaterais(world, x, y, z) >= 2) {
    // ÁGUA INFINITA: fluida em chão sólido cercada por 2+ fontes vira fonte
    changes.push({ x, y, z, blockId: BlockId.Agua });
    nivel = 8;
  } else {
    const sup = nivelSuportado(world, x, y, z);
    if (sup <= 0) return [{ x, y, z, blockId: BlockId.Air }]; // secou → some (sem espalhar)
    if (sup !== aguaNivel(cur)) changes.push({ x, y, z, blockId: aguaComNivel(sup) });
    nivel = sup;
  }

  // ESPALHAMENTO.
  if (below === BlockId.Air) {
    // QUEDA preferível: há ar embaixo → despenca (coluna cheia 7) e NÃO espalha
    // lateral. Água sobre água/vazio nunca vira disco flutuante — só cai.
    changes.push({ x, y: y - 1, z, blockId: BlockId.AguaFluida7 });
  } else if (isFullCube(below) && !isAgua(below)) {
    // APOIADA em chão SÓLIDO de verdade → escorre na horizontal com nível−1.
    // (água fluida embaixo NÃO é apoio: seria coluna caindo, não alarga o topo.)
    // FLUXO PRIORIZADO (estilo Minecraft): procura o DESNÍVEL mais próximo e só
    // escorre naquela direção — a água não dá a volta na pirâmide/obstáculo
    // quando há uma queda perto. Sem queda no alcance → espalha nos 4 lados
    // (poça). Água em FIO em vez de disco = MUITO menos célula ativa = menos
    // custo de tick/remesh (o gargalo de FPS na cascata grande).
    const espalha = nivel - 1; // fonte(8)→7, fluida n→n−1
    if (espalha >= 1) {
      // Custo (passos até a queda) por direção medido sobre TODA célula por onde
      // a água corre — ar OU fluida (não só as que dá pra encher). Assim, se o
      // caminho do desnível JÁ está cheio de água (escorrendo), a gente NÃO
      // redireciona o fluxo pros lados: a beira continua vencendo. `empurra`
      // marca à parte quais dá pra de fato preencher (ar / fluida de nível menor).
      const custo = [Infinity, Infinity, Infinity, Infinity];
      const empurra = [false, false, false, false];
      let melhor = Infinity;
      for (const [i, [dx, dz]] of LADOS.entries()) {
        const nx = x + dx;
        const nz = z + dz;
        const viz = getBlock(world, nx, y, nz);
        empurra[i] =
          inBounds(world, nx, y, nz) &&
          (viz === BlockId.Air ||
            (isAgua(viz) && !isAguaFonte(viz) && aguaNivel(viz) < espalha));
        if (!aguaAtravessa(world, nx, y, nz)) continue; // parede/fonte: sem custo
        const c = temQueda(world, nx, y, nz)
          ? 0 // a própria célula-alvo já é a beira do desnível
          : passosAteQueda(world, nx, y, nz, 1, -dx, -dz);
        custo[i] = c;
        if (c < melhor) melhor = c;
      }
      const priorizar = melhor !== Infinity; // achou ao menos uma queda no alcance
      for (const [i, [dx, dz]] of LADOS.entries()) {
        if (!empurra[i]) continue;
        if (priorizar && (custo[i] ?? Infinity) > melhor) continue; // fora da rota do desnível
        changes.push({ x: x + dx, y, z: z + dz, blockId: aguaComNivel(espalha) });
      }
    }
  }
  // (below é água fluida/fonte: nem cai nem espalha — só ajusta o próprio nível)

  return changes.length ? changes : null;
};

const rulesMap = new Map<number, BlockRule>([
  [BlockId.Sand, fallingRule],
  [BlockId.Gravel, fallingRule],
  [BlockId.PortaXFechada, doorRule],
  [BlockId.PortaXAberta, doorRule],
  [BlockId.PortaZFechada, doorRule],
  [BlockId.PortaZAberta, doorRule],
  // portas R (dobradiça alta, 2026-07-20): mesma regra de órfão do par vertical
  [BlockId.PortaXFechadaR, doorRule],
  [BlockId.PortaXAbertaR, doorRule],
  [BlockId.PortaZFechadaR, doorRule],
  [BlockId.PortaZAbertaR, doorRule],
  [BlockId.Tocha, torchRule],
]);
// Tapetes (2026-07-19): mesma regra de apoio da tocha, pras 12 cores.
for (let id = BlockId.TapeteBranco; id <= BlockId.TapeteMarrom; id++) {
  rulesMap.set(id, torchRule);
}
// Cama (2026-07-20): as 4 direções usam a regra de órfão do par horizontal.
for (const id of [BlockId.CamaXP, BlockId.CamaZP, BlockId.CamaXN, BlockId.CamaZN]) {
  rulesMap.set(id, camaRule);
}
// Flores (2026-07-20): mesma regra de apoio da tocha — sem chão embaixo, some.
for (let id = BlockId.FlorVermelha; id <= BlockId.FlorBranca; id++) {
  rulesMap.set(id, torchRule);
}
// Grama alta (§🌬️ 2026-07-27): `precisaApoio` já a listava, mas ela nunca foi
// REGISTRADA aqui — então o capim ficava flutuando quando o chão sumia debaixo
// dele (achado na sessão 36, corrigido no §🍖 F6).
for (let id = BlockId.GramaAlta; id <= BlockId.GramaAltaFria; id++) {
  rulesMap.set(id, torchRule);
}
// Plantação (§🍖 F6 2026-08-04): a regra de vizinhança só cuida do APOIO (cavar
// a terra debaixo da horta derruba a horta). Crescer é `crescerPlantacao`, que
// a session chama por TEMPO — ver a nota lá.
for (let id = BlockId.Plantacao0; id <= BlockId.Plantacao3; id++) {
  rulesMap.set(id, torchRule);
}
// Água FLUIDA (2026-07-22): fonte (129) + os 7 níveis fluidos ticam pelo
// waterRule (espalha, cai, seca, água infinita).
for (let id = BlockId.Agua; id <= BlockId.AguaFluida7; id++) {
  rulesMap.set(id, waterRule);
}
const RULES: ReadonlyMap<number, BlockRule> = rulesMap;

/** Regra registrada pro tipo de bloco, se houver. */
export function ruleFor(blockId: number): BlockRule | undefined {
  return RULES.get(blockId);
}
