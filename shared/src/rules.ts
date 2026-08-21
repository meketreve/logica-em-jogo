import {
  BlockId,
  aguaComNivel,
  aguaNivel,
  apoioValido,
  camaHeadDir,
  isAgua,
  isAguaFonte,
  isFullCube,
  isMuda,
  isPlantacao,
  isPlantacaoMadura,
  isTransparentBlock,
  mudaEstagio,
  mudaTipo,
  precisaApoio,
} from "./blocks";
import { celulasDaArvore } from "./arvores";
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
 * Ticks entre dois PASSOS da grama (2026-08-21, pedido do usuário: "deixa mais
 * demorado pra grama espalhar"). 10 Hz → **1 célula a cada 3 s**.
 *
 * Antes a `grassRule` corria na fila de vizinhança sem freio nenhum: a onda
 * andava 1 célula POR TICK, ~10 células/s, e um caminho de terra se fechava
 * quase instantaneamente — parecia bug, não mato crescendo.
 *
 * ⚠️ O freio NÃO está na regra: quem segura é a `session` no laço do tick, do
 * mesmo jeito que o teto de água — a célula de grama que não é da vez volta
 * pra fila de sujas e tenta de novo. Pôr sorteio dentro da `grassRule` MATARIA
 * o espalhamento, porque o laço descarta a célula que devolve `null` e ela
 * nunca mais seria acordada (só quem mexe ao lado suja uma célula).
 */
export const TICKS_POR_GRAMA = 30;

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

/**
 * §🪵 (2026-08-15): a muda de árvore avança UM estágio; a MADURA (estágio 3)
 * vira a árvore COMPLETA — tronco + copa da espécie (`celulasDaArvore`).
 *
 * Gira na MESMA engrenagem da plantação: é pulso de TEMPO (a session a chama
 * de `TICKS_POR_CRESCIMENTO` em `TICKS_POR_CRESCIMENTO`), NÃO regra de
 * vizinhança — crescer não é reação a "alguém mexeu do lado". Por isso não
 * entra no `RULES`.
 *
 * O último estágio materializa a árvore com O MESMO contrato do gen
 * (ver `aplicarCelula` em arvores.ts): tronco sobrescreve ar/folhas, copa só
 * enche ar. A muda ocupa a BASE do tronco — ela VIRA o primeiro tronco. Se
 * qualquer célula da copa estiver ocupada (a árvore não cabe no espaço), a
 * muda ABORTA e espera o próximo pulso. `varia` deriva de um hash da posição:
 * a MESMA muda em mundos iguais nasce a MESMA árvore — nada de Math.random
 * no servidor (mesma disciplina dos drops).
 */
export const crescerMuda: BlockRule = (world, x, y, z) => {
  const id = getBlock(world, x, y, z);
  if (!isMuda(id)) return null;
  const estagio = mudaEstagio(id);
  if (estagio < 3) {
    // sem solo embaixo a muda está de saída (torchRule) — não cresce no caminho
    if (!apoioValido(id, getBlock(world, x, y - 1, z))) return null;
    return [{ x, y, z, blockId: id + 1 }];
  }
  const tipo = mudaTipo(id) ?? "comum";
  const varia = variaPorPosicao(x, y, z);
  const changes: BlockChange[] = [];
  for (const c of celulasDaArvore(x, y, z, tipo, varia)) {
    if (c.x === x && c.y === y && c.z === z) {
      // a muda é a base: vira o primeiro tronco, sem polêmica
      changes.push({ x, y, z, blockId: c.id });
      continue;
    }
    const atual = getBlock(world, c.x, c.y, c.z);
    const cabe =
      atual === BlockId.Air || (c.tronco && isTransparentBlock(atual));
    if (!cabe) return null; // espaço ocupado → aborta, tenta no próximo pulso
    changes.push({ x: c.x, y: c.y, z: c.z, blockId: c.id });
  }
  return changes.length > 1 ? changes : null;
};

/** Variante [0,1) da árvore, HASH determinístico da posição da muda — mesmo
 *  esqueleto do hash2 do worldgen (mul 374761393/668265263, fusão e finalização
 *  xorshift), sem entrar no mundo de ruído. A MESMA posição entrega a MESMA
 *  árvore em qualquer execução. */
function variaPorPosicao(x: number, y: number, z: number): number {
  let h = (x ^ Math.imul(z, 374761393)) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** 4 vizinhos horizontais (água só espalha na MESMA camada + cai; a grama
 *  só espalha na MESMA camada — terra enterrada fica terra). */
const LADOS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/** É UMA das três gramas climáticas? */
export function isGrama(id: number): boolean {
  return id === BlockId.Grass || id === BlockId.GramaSeca || id === BlockId.GramaFria;
}

/**
 * Grama (2026-08-15): um bloco de grama sujo olha os 4 vizinhos da MESMA
 * camada; terra EXPOSTA (ar em cima) vira grama da MESMA variante (Grass →
 * Grass, GramaSeca → GramaSeca…), preservando o clima da vizinhança. Terra com
 * bloco por cima NÃO vira — é subsolo (o gen nasce com grama em cima de terra
 * por TODA a superfície; sem essa condição o mundo inteiro ser engolido no
 * primeiro tick de qualquer mudança). REGRA DE VIZINHANÇA de propósito: quem
 * acorda a célula é "alguém mexeu do lado" (quebrou grama, pôs terra) — sem
 * pulso periódico nem índice, e o custo é o perímetro da mudança, não o do
 * mundo. A onda anda 1 célula por tick (o applyBlock da conversão suja a grama
 * nova pro próximo tick), então reformar um caminho de terra na grama "cura"
 * visivelmente, célula a célula.
 */
export const grassRule: BlockRule = (world, x, y, z) => {
  const id = getBlock(world, x, y, z);
  if (!isGrama(id)) return null;
  const changes: BlockChange[] = [];
  for (const [dx, dz] of LADOS) {
    const nx = x + dx;
    const nz = z + dz;
    if (getBlock(world, nx, y, nz) !== BlockId.Dirt) continue;
    if (getBlock(world, nx, y + 1, nz) !== BlockId.Air) continue; // enterrada não pega
    changes.push({ x: nx, y, z: nz, blockId: id });
  }
  return changes.length ? changes : null;
};

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
// Cama (2026-07-20): as 4 direções usam a regra de órfão do par horizontal.
for (const id of [BlockId.CamaXP, BlockId.CamaZP, BlockId.CamaXN, BlockId.CamaZN]) {
  rulesMap.set(id, camaRule);
}
// APOIO (2026-08-05): quem responde `precisaApoio` ganha o `torchRule`, e é
// tudo. Antes eram quatro faixas de id escritas à mão aqui (tapete, flor,
// capim, plantação) ao lado da lista do `precisaApoio` — DUAS listas do mesmo
// conjunto, e esquecer uma é silencioso porque o bloco simplesmente flutua.
// Já custou dois bugs: o capim (bug-558, sessão 36→F6) e o ALGODÃO inteiro,
// cultivado e selvagem (bug-581) — o F10c pôs os 5 ids no `precisaApoio` e
// nenhum aqui, então cavar debaixo do canteiro deixava o pé no ar. Planta nova
// agora entra numa lista só.
for (let id = 0; id < 256; id++) {
  if (precisaApoio(id) && !rulesMap.has(id)) rulesMap.set(id, torchRule);
}
// Água FLUIDA (2026-07-22): fonte (129) + os 7 níveis fluidos ticam pelo
// waterRule (espalha, cai, seca, água infinita).
for (let id = BlockId.Agua; id <= BlockId.AguaFluida7; id++) {
  rulesMap.set(id, waterRule);
}
// GRAMA (2026-08-15): as três gramas climáticas espalham pra terra exposta ao
// lado (grassRule). Terra (Dirt) NÃO tem regra própria de propósito — quem
// espalha é a GRAMA, senão a terra toda do mundo viraria candidata a virar e
// o tick varria o mundo.
for (const id of [BlockId.Grass, BlockId.GramaSeca, BlockId.GramaFria]) {
  rulesMap.set(id, grassRule);
}
const RULES: ReadonlyMap<number, BlockRule> = rulesMap;

/** Regra registrada pro tipo de bloco, se houver. */
export function ruleFor(blockId: number): BlockRule | undefined {
  return RULES.get(blockId);
}
