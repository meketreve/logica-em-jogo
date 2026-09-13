import { MAX_BLOCK_ID } from "./blocks";
import { CHUNK_VOLUME } from "./constants";
import type { ChunkBlocos } from "./world";

/**
 * Chunk no DISCO e no FIO (2026-09-12, ids de 16 bits). Na memória todo chunk é
 * `Uint16Array`; aqui ele vira 1 byte de LARGURA + os dados:
 *
 *   u8 largura  0 = ESTREITO → CHUNK_VOLUME bytes (u8, todo id ≤ 255)
 *               1 = LARGO    → CHUNK_VOLUME × u16 little-endian
 *
 * Quase todo chunk é estreito (os 251 ids de antes da mudança cabem num byte),
 * então save e streaming NÃO crescem pra mundo nenhum que já existia — só o
 * chunk que tiver bloco ≥ 256 paga o dobro. É isso que protege o Wi-Fi da
 * escola (tablet puxa colunas por streaming) e os `.ljw` distribuídos.
 *
 * Os formatos antigos (`LJW0`, `LJC0`, `LJS2`) guardavam o chunk cru, sem o
 * byte de largura: quem lê eles usa `lerChunkCru`.
 */
export const LARGURA_ESTREITA = 0;
export const LARGURA_LARGA = 1;

/**
 * Todo id do chunk cabe num byte? Caminho QUENTE: o save denso passa por aqui
 * em cada chunk do mundo (P = 512 chunks = 2 M células), e o save roda no
 * Ctrl+C/fechar janela do host (bug-645) — lá cada milissegundo disputa com o
 * `npx`/`tsx` que embrulha o processo. A versão célula a célula deixou o
 * `encodeSave` 8× mais lento e o smoke do SIGINT começou a perder a corrida;
 * olhando 2 células por vez (u32) com a máscara dos BYTES ALTOS, volta ao chão.
 */
function ehEstreito(c: ChunkBlocos): boolean {
  if ((c.byteOffset & 3) === 0 && (c.length & 1) === 0) {
    const pares = new Uint32Array(c.buffer, c.byteOffset, c.length >>> 1);
    for (let i = 0; i < pares.length; i++) if ((pares[i]! & 0xff00ff00) !== 0) return false;
    return true;
  }
  for (let i = 0; i < c.length; i++) if (c[i]! > 0xff) return false;
  return true;
}

/** Quantos bytes o chunk ocupa codificado (chunk ausente = estreito de ar). */
export function bytesDoChunk(c: ChunkBlocos | undefined): number {
  return 1 + (c && !ehEstreito(c) ? 2 * CHUNK_VOLUME : CHUNK_VOLUME);
}

/** Escreve o chunk em `dest` a partir de `off`; devolve o offset seguinte.
 *  Ausente = ar (estreito, zeros — o buffer novo já nasce zerado). */
export function escreverChunk(dest: Uint8Array, off: number, c: ChunkBlocos | undefined): number {
  if (!c || ehEstreito(c)) {
    dest[off] = LARGURA_ESTREITA;
    if (c) dest.set(c, off + 1); // Uint8Array.set de Uint16Array trunca por elemento — todos ≤ 255 aqui
    return off + 1 + CHUNK_VOLUME;
  }
  dest[off] = LARGURA_LARGA;
  let o = off + 1;
  for (let i = 0; i < CHUNK_VOLUME; i++) {
    const v = c[i]!;
    dest[o++] = v & 0xff;
    dest[o++] = v >>> 8;
  }
  return o;
}

/**
 * Lê um chunk codificado de `src` a partir de `off` pra dentro de `dest`
 * (ausente = só pula); devolve o offset seguinte. VALIDA — arquivo vem de
 * fora (Drive, disco, rede): largura desconhecida, bytes faltando ou id acima
 * de `teto` (padrão `MAX_BLOCK_ID`: mundo gravado por uma versão MAIS NOVA do
 * jogo, com bloco que esta não conhece) lançam Error, com `rotulo` dizendo de
 * onde veio.
 */
export function lerChunk(
  src: Uint8Array,
  off: number,
  dest: ChunkBlocos | undefined,
  rotulo: string,
  teto: number = MAX_BLOCK_ID,
): number {
  if (off >= src.length) throw new Error(`${rotulo}: chunk truncado (sem byte de largura)`);
  const largura = src[off]!;
  if (largura === LARGURA_ESTREITA) {
    const fim = off + 1 + CHUNK_VOLUME;
    if (fim > src.length) throw new Error(`${rotulo}: chunk estreito truncado`);
    dest?.set(src.subarray(off + 1, fim));
    return fim;
  }
  if (largura === LARGURA_LARGA) {
    const fim = off + 1 + 2 * CHUNK_VOLUME;
    if (fim > src.length) throw new Error(`${rotulo}: chunk largo truncado`);
    let o = off + 1;
    for (let i = 0; i < CHUNK_VOLUME; i++) {
      const v = src[o]! | (src[o + 1]! << 8);
      if (v > teto) throw new Error(`${rotulo}: id de bloco ${v} não existe nesta versão do jogo`);
      if (dest) dest[i] = v;
      o += 2;
    }
    return fim;
  }
  throw new Error(`${rotulo}: largura de chunk desconhecida (${largura})`);
}

/** Formato ANTIGO (antes de 2026-09-12): `CHUNK_VOLUME` bytes crus, sem largura. */
export function lerChunkCru(src: Uint8Array, off: number, dest: ChunkBlocos | undefined): number {
  dest?.set(src.subarray(off, off + CHUNK_VOLUME));
  return off + CHUNK_VOLUME;
}
