/**
 * Geometria da GRADE de áreas da aula (2026-08-17).
 *
 * Até aqui o gerador punha um grupo por chunk em X, todos na MESMA fileira de Z
 * (layout de fileira): 8 grupos = 128 blocos em linha, com o professor andando
 * ~64 blocos até cada ponta. Agora os grupos ocupam uma GRADE de COLUNAS_AULA
 * colunas, numerada em ordem de LEITURA (esquerda→direita, frente→fundo) — é
 * como o professor procura "o grupo 5".
 *
 * Este módulo é a ÚNICA fonte de "onde fica o grupo g": o gerador
 * (`server/src/cenarios/gerar.ts`) e o comando `/aula grupos` chamam as mesmas
 * funções. Se cada um fizesse a própria conta, um mundo gerado hoje e um ajuste
 * feito amanhã cairiam em lugares diferentes.
 *
 * É PURO de propósito (nada de World/GameSession): a aritmética é testável sem
 * montar mundo, e é ela que erra silenciosamente quando erra.
 */
import { CHUNK_SIZE } from "./constants";
import type { Box } from "./scenario";
import type { WorldDims } from "./world";
import { FLAT_SURFACE_Y } from "./worldgen";

/** Colunas da grade. 6 fecha os três tamanhos que interessam: 8 grupos = 6×2,
 *  20 = 6×4, e o teto futuro de 35 = 6×6 = 96×96 blocos (a pegada de hoje). */
export const COLUNAS_AULA = 6;

/** Teto de grupos que o mundo de aula comporta. Subir daqui é trocar esta
 *  constante e regerar os cenários — `dimsDaAula()` acompanha sozinha. */
export const MAX_GRUPOS_AULA = 20;

/** Base em Y da célula: em cima da grama, o mesmo chão da área do grupo.
 *  A borda da cabine fica em FLAT_SURFACE_Y, ou seja ABAIXO da célula — copiar
 *  ou limpar uma célula não mexe no plot desenhado pelo preset "cabines". */
export const CELULA_Y0 = FLAT_SURFACE_Y + 1;

/** Altura da célula. Cobre a área e os `extras` (o mais alto hoje é o quadro
 *  em o.y+1); o que sobra é AR, e copiar AR é inócuo. */
export const CELULA_DY = 8;

/** Nome da região que guarda o estado de PARTIDA (a célula-molde). */
export const REGIAO_PARTIDA = "partida";

/** Fileiras que o teto ocupa. */
export function linhasDaGrade(): number {
  return Math.ceil(MAX_GRUPOS_AULA / COLUNAS_AULA);
}

/**
 * Dimensões do mundo de aula, em chunks. Não dependem de quantos grupos o
 * `.ljw` nasce com: o mundo já vem do tamanho do TETO, e é isso que tira o
 * `inBounds` do caminho do professor no meio da aula.
 *
 * z = 2·(1 + linhas) põe o professor no chunk central (o spawn) com as fileiras
 * de grupo ocupando exatamente a metade da FRENTE.
 */
export function dimsDaAula(): WorldDims {
  return { x: COLUNAS_AULA, z: 2 * (1 + linhasDaGrade()), y: 4 };
}

/** Chunk da cabine do professor: o central — é onde todo mundo nasce. */
export function chunkDoProfessor(): { cx: number; cz: number } {
  const dims = dimsDaAula();
  return { cx: Math.floor(dims.x / 2), cz: Math.floor(dims.z / 2) };
}

/** Chunk da célula-molde: um ATRÁS do professor. Fica na metade de trás do
 *  mundo, que nenhuma fileira de grupo usa — assim os alunos não a sujam. */
export function chunkDoMolde(): { cx: number; cz: number } {
  const prof = chunkDoProfessor();
  return { cx: prof.cx, cz: prof.cz - 1 };
}

/** Chunk ABSOLUTO do grupo g (1-based), em ordem de leitura. */
export function chunkDoGrupo(g: number): { cx: number; cz: number } {
  const i = g - 1;
  const prof = chunkDoProfessor();
  return { cx: i % COLUNAS_AULA, cz: prof.cz + 1 + Math.floor(i / COLUNAS_AULA) };
}

/** Caixa de uma célula: o chunk inteiro em XZ, CELULA_DY em Y a partir de
 *  CELULA_Y0. É a unidade de cópia — pega a área E os extras que ficam fora
 *  dela (a parede de quadros da aula 6 mora em x+3/x+4, fora da área). */
export function caixaDaCelula(chunk: { cx: number; cz: number }): Box {
  const ox = chunk.cx * CHUNK_SIZE;
  const oz = chunk.cz * CHUNK_SIZE;
  return {
    min: { x: ox, y: CELULA_Y0, z: oz },
    max: { x: ox + CHUNK_SIZE - 1, y: CELULA_Y0 + CELULA_DY - 1, z: oz + CHUNK_SIZE - 1 },
  };
}
