/**
 * Ajuste AO VIVO do número de cópias da área de atividade (2026-08-17).
 *
 * Aqui moram os dois primitivos de célula. A CÉLULA (um chunk inteiro, ver
 * `grade.ts`) é a unidade de cópia porque o `baseline` do objetivo cobre só a
 * caixa da ÁREA, e os `extras` do cenário ficam fora dela — a parede de manual
 * da aula 6 mora em x+3/x+4 de uma área que tem dx=3. Copiar por área daria ao
 * grupo novo a atividade SEM o enunciado.
 *
 * O gerador (`server/src/cenarios/gerar.ts`) usa os MESMOS primitivos: se eles
 * regredirem, `npm run cenarios` quebra antes de o mundo chegar na escola.
 */
import { BlockId } from "../blocks";
import type { Box } from "../scenario";
import type { GameSession } from "../session";
import { getBlock } from "../world";

export interface ResultadoCelula {
  /** Células cujo bloco mudou de fato. */
  escritos: number;
  /** Células puladas por ter jogador em pé (o bloco emparedaria alguém). */
  pulados: number;
}

/**
 * Copia `origem` sobre `destino`, bloco a bloco, na ordem canônica y→z→x.
 * Passa por `applyBlock` (mesma engrenagem do `/regiao encher`): block_changed,
 * fila de vizinhança e recheca de objetivo acordam igual.
 *
 * SOBRESCREVE: célula que no molde é AR vira AR no destino. Sem isso, ajustar
 * duas vezes empilharia o resultado da primeira.
 */
export function copiarCelula(ses: GameSession, origem: Box, destino: Box): ResultadoCelula {
  const dx = destino.min.x - origem.min.x;
  const dy = destino.min.y - origem.min.y;
  const dz = destino.min.z - origem.min.z;
  let escritos = 0;
  let pulados = 0;
  for (let y = origem.min.y; y <= origem.max.y; y++) {
    for (let z = origem.min.z; z <= origem.max.z; z++) {
      for (let x = origem.min.x; x <= origem.max.x; x++) {
        const bloco = getBlock(ses.world, x, y, z);
        const tx = x + dx;
        const ty = y + dy;
        const tz = z + dz;
        if (getBlock(ses.world, tx, ty, tz) === bloco) continue;
        if (bloco !== BlockId.Air && ses.overlapsAnyPlayer(tx, ty, tz)) {
          pulados++;
          continue;
        }
        ses.applyBlock(tx, ty, tz, bloco);
        escritos++;
      }
    }
  }
  // o conteúdo do quadro mora FORA do id de bloco: sem esta linha o grupo novo
  // recebe a parede de manual em branco
  ses.moverQuadros(origem, dx, dy, dz);
  return { escritos, pulados };
}

export interface ResultadoLimpeza {
  /** Células que viraram ar. */
  apagados: number;
}

/** Zera a célula (blocos e conteúdo de quadro). É o que o encolher usa.
 *  Não há "pulados" aqui: virar AR nunca empareda ninguém. */
export function limparCelula(ses: GameSession, caixa: Box): ResultadoLimpeza {
  let apagados = 0;
  for (let y = caixa.min.y; y <= caixa.max.y; y++) {
    for (let z = caixa.min.z; z <= caixa.max.z; z++) {
      for (let x = caixa.min.x; x <= caixa.max.x; x++) {
        if (getBlock(ses.world, x, y, z) === BlockId.Air) continue;
        ses.applyBlock(x, y, z, BlockId.Air);
        apagados++;
      }
    }
  }
  ses.apagarQuadros(caixa);
  return { apagados };
}
