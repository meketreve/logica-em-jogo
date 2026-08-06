import { CHUNK_SIZE } from "../constants";
import { type ColunaRef, FOLGA_DESCARTE, encodeColunas } from "../protocol";
import { chunkIndex } from "../world";
import { gerarColunaDeChunks } from "../worldgen";
import type { GameSession } from "../session";

/**
 * §🔁 STREAMING de colunas (F2/F5) — o mundo GIGANTE que materializa sob
 * demanda.
 *
 * Três coisas, e a ordem entre elas importa: `gerarColuna` MATERIALIZA (e é o
 * único caminho por onde o servidor gera — a eviction só conhece o que nasceu
 * daqui), `evictColunas` LIBERA o que ninguém quer mais (nunca uma coluna com
 * edição: os bytes editados só vivem na RAM até o save), e `streamColunas`
 * ENVIA, andando em anéis do mais perto pro mais longe com teto por tick.
 */

/** Materializa a coluna (cx,cz) e a marca RESIDENTE (F5 eviction). Toda
 *  geração do servidor passa por aqui — a eviction só conhece o que nasceu
 *  por este caminho. */
export function gerarColuna(ses: GameSession, cx: number, cz: number): void {
  gerarColunaDeChunks(ses.world, cx, cz, ses.seed); // no-op se já gerada
  ses.residentCols.add(cz * ses.world.dims.x + cx);
}

/** Materializa as colunas de chunks que intersectam o retângulo de BLOCOS
 *  [bx0..bx1]×[bz0..bz1] (clampado ao mundo). */
export function garantirColunas(ses: GameSession, bx0: number, bz0: number, bx1: number, bz1: number): void {
  const c0x = Math.max(0, Math.floor(bx0 / CHUNK_SIZE));
  const c1x = Math.min(ses.world.dims.x - 1, Math.floor(bx1 / CHUNK_SIZE));
  const c0z = Math.max(0, Math.floor(bz0 / CHUNK_SIZE));
  const c1z = Math.min(ses.world.dims.z - 1, Math.floor(bz1 / CHUNK_SIZE));
  for (let cx = c0x; cx <= c1x; cx++) {
    for (let cz = c0z; cz <= c1z; cz++) {
      gerarColuna(ses, cx, cz);
    }
  }
}

/**
 * F5 eviction: libera colunas materializadas que NENHUM jogador quer mais
 * (fora de raio+FOLGA de todos) e que NÃO têm edição (bytes editados só
 * vivem na RAM até o save — regenerar as perderia). Coluna liberada regenera
 * idêntica do seed quando alguém voltar. Roda 1×/s no tick do mundo lazy.
 */
export function evictColunas(ses: GameSession): void {
  const dims = ses.world.dims;
  // pré-computa o centro/raio de interesse de cada jogador
  const interesses: { pcx: number; pcz: number; raio: number }[] = [];
  for (const [clientId, p] of ses.players) {
    const st = ses.stream.get(clientId);
    if (!st) continue;
    interesses.push({
      pcx: Math.max(0, Math.min(dims.x - 1, Math.floor(p.x / CHUNK_SIZE))),
      pcz: Math.max(0, Math.min(dims.z - 1, Math.floor(p.z / CHUNK_SIZE))),
      raio: st.raio + FOLGA_DESCARTE,
    });
  }
  for (const key of ses.residentCols) {
    if (ses.editedCols.has(key)) continue; // edição fica residente
    const cx = key % dims.x;
    const cz = (key - cx) / dims.x;
    const querido = interesses.some(
      (i) => Math.max(Math.abs(cx - i.pcx), Math.abs(cz - i.pcz)) <= i.raio,
    );
    if (querido) continue;
    // libera os bytes de todos os cy da coluna
    for (let cy = 0; cy < dims.y; cy++) {
      ses.world.chunks[chunkIndex(ses.world, cx, cy, cz)] = undefined;
    }
    ses.residentCols.delete(key);
  }
}

/**
 * Motor de interesse (F2): por jogador, anda em ANÉIS do mais perto pro mais
 * longe e envia até `colunasPorTick` colunas que ainda faltam (materializa
 * na hora). Coluna além de raio+FOLGA_DESCARTE é esquecida — o cliente
 * descarta pela MESMA regra, então voltar re-envia sem mensagem de unload.
 */
export function streamColunas(ses: GameSession): void {
  const dims = ses.world.dims;
  for (const [clientId, p] of ses.players) {
    const st = ses.stream.get(clientId);
    if (!st) continue;
    const pcx = Math.max(0, Math.min(dims.x - 1, Math.floor(p.x / CHUNK_SIZE)));
    const pcz = Math.max(0, Math.min(dims.z - 1, Math.floor(p.z / CHUNK_SIZE)));
    for (const key of st.enviadas) {
      const cx = key % dims.x;
      const cz = (key - cx) / dims.x;
      if (Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz)) > st.raio + FOLGA_DESCARTE) {
        st.enviadas.delete(key);
      }
    }
    const lote: ColunaRef[] = [];
    anel: for (let r = 0; r <= st.raio; r++) {
      for (let cx = pcx - r; cx <= pcx + r; cx++) {
        for (let cz = pcz - r; cz <= pcz + r; cz++) {
          if (Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz)) !== r) continue;
          if (cx < 0 || cz < 0 || cx >= dims.x || cz >= dims.z) continue;
          const key = cz * dims.x + cx;
          if (st.enviadas.has(key)) continue;
          gerarColuna(ses, cx, cz);
          st.enviadas.add(key);
          lote.push({ cx, cz });
          if (lote.length >= ses.colunasPorTick) break anel;
        }
      }
    }
    if (lote.length > 0) ses.send(clientId, encodeColunas(ses.world, lote));
  }
}
