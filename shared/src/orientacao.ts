import {
  BlockId,
  escadaId,
  fornalhaComFrente,
  isCadeira,
  isCama,
  isFornalha,
  isJanela,
  isPorta,
  isQuadro,
  isSlab,
  isSofa,
  isStairs,
  slabMaterial,
  slabTop,
  stairsMaterial,
} from "./blocks";

/**
 * A regra de ORIENTAÇÃO na hora de colocar, e o caminho de volta.
 *
 * O jogador guarda UMA entrada na hotbar por família (uma porta, uma cadeira,
 * uma escada) e o eixo/direção/metade sai do GESTO: pra onde ele olha e qual
 * face ele clicou. Quem decidia isso era uma sequência de sete `if` dentro do
 * handler do botão direito do `main.ts` — sem teste, porque lá não há como
 * rodar um.
 *
 * As duas funções aqui são o mesmo contrato visto dos dois lados: `orientar`
 * transforma a âncora da mão no id final, e `ancoraDeCopia` faz o inverso
 * (botão do meio copia o bloco mirado pra mão, e o que vai pra mão é sempre a
 * entrada única da família — a direção é re-escolhida no próximo clique).
 * Ou seja: `ancoraDeCopia(orientar(a, …)) === ancoraDeCopia(a)`, e é isso que o
 * teste cobra.
 *
 * Funções PURAS: nada de mundo, conexão ou DOM.
 */

/**
 * Quadrante do olhar → 0..3, na MESMA ordem dos ids direcionais (+X, +Z, −X,
 * −Z). O `-` nos dois eixos é a convenção de câmera do three: yaw 0 olha pra
 * −Z.
 */
export function quadranteDoOlhar(yaw: number): number {
  const dx = -Math.sin(yaw);
  const dz = -Math.cos(yaw);
  return Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? 0 : 2) : dz > 0 ? 1 : 3;
}

/**
 * O id que vai de fato pro `place_block`.
 *
 * @param blockId  o que está na mão (a âncora da família)
 * @param yaw      pra onde o jogador olha
 * @param porBaixo clicou na face de BAIXO do bloco mirado (`target.ny < 0`)
 */
export function orientarParaColocar(blockId: number, yaw: number, porBaixo: boolean): number {
  // porta/janela: o EIXO sai da direção do olhar (a lâmina fecha a passagem que
  // o jogador está encarando). Aqui basta o eixo, não o sentido — por isso a
  // comparação é entre |sin| e |cos| e não passa pelo quadrante.
  // O teste é pelos DOIS ids fechados, não por `isPorta`: só eles chegam à mão
  // (o `ancoraDeCopia` os devolve, e porta aberta nem é colocável), e alargar
  // o alcance aqui seria inventar comportamento que nunca acontece.
  const eixoX = Math.abs(Math.sin(yaw)) > Math.abs(Math.cos(yaw));
  if (blockId === BlockId.PortaXFechada || blockId === BlockId.PortaZFechada) {
    return eixoX ? BlockId.PortaXFechada : BlockId.PortaZFechada;
  }
  if (blockId === BlockId.JanelaXFechada || blockId === BlockId.JanelaZFechada) {
    return eixoX ? BlockId.JanelaXFechada : BlockId.JanelaZFechada;
  }
  // móveis/quadro direcionais: a FRENTE encara o jogador (encosto/cabeceira/
  // parede pro lado de lá — convenção Minecraft).
  if (isCadeira(blockId) || isSofa(blockId) || isCama(blockId) || isQuadro(blockId)) {
    const frente = (quadranteDoOlhar(yaw) + 2) % 4; // oposto do olhar
    const anchor = isCadeira(blockId)
      ? BlockId.CadeiraXP
      : isSofa(blockId)
        ? BlockId.SofaXP
        : isCama(blockId)
          ? BlockId.CamaXP
          : BlockId.QuadroXP;
    return anchor + frente;
  }
  // §🍖 F10 (refino): a fornalha segue a MESMA convenção — a boca encara quem
  // colocou. Não entra no `if` de cima porque a família dela não é `âncora + k`:
  // os dois ids originais nasceram sem direção e viraram o −Z, então quem
  // traduz é a TABELA (`FORNALHA_POR_FRENTE`).
  if (isFornalha(blockId)) return fornalhaComFrente((quadranteDoOlhar(yaw) + 2) % 4);
  // laje (2026-07-25): mirou por BAIXO → laje de CIMA; senão laje de baixo
  // (piso). A hotbar guarda a âncora "baixo".
  if (isSlab(blockId)) {
    const baixo = blockId - (slabTop(blockId) ? 1 : 0);
    return porBaixo ? baixo + 1 : baixo;
  }
  // escada (2026-07-25): direção SOBE pra onde o jogador olha; metade
  // (base/cabeça-pra-baixo) pela face clicada.
  if (isStairs(blockId)) {
    return escadaId(stairsMaterial(blockId), quadranteDoOlhar(yaw), porBaixo);
  }
  return blockId;
}

/**
 * O caminho de volta: qualquer variante mirada vira a entrada ÚNICA da família
 * na hotbar (o eixo/direção é re-escolhido pelo olhar na hora de colocar).
 * Id sem família direcional volta igual.
 */
export function ancoraDeCopia(id: number): number {
  if (isPorta(id)) return BlockId.PortaXFechada;
  if (isJanela(id)) return BlockId.JanelaXFechada;
  if (isCadeira(id)) return BlockId.CadeiraXP;
  if (isSofa(id)) return BlockId.SofaXP;
  if (isCama(id)) return BlockId.CamaXP;
  if (isQuadro(id)) return BlockId.QuadroXP;
  // fornalha ACESA ou em qualquer direção copia pra entrada única
  if (isFornalha(id)) return BlockId.Fornalha;
  // laje/escada: copia pra âncora do MATERIAL (metade/direção re-escolhidas)
  if (isSlab(id)) return BlockId.LajePedraBaixo + slabMaterial(id) * 2;
  if (isStairs(id)) return BlockId.EscadaPedraXP + stairsMaterial(id) * 8;
  return id;
}
