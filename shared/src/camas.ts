import { CHUNK_SIZE } from "./constants";
import { BlockId, camaCabeca, camaHeadDir, isCamaPe } from "./blocks";
import { type World, chunkIndex, getBlock, setBlock } from "./world";

/**
 * Migra as camas gravadas ANTES do bug-662 (2026-09-12). Até ali as duas
 * metades da cama tinham o mesmo id (`CamaXP..CamaZN`); agora esse id é só o
 * PÉ e a cabeceira tem id próprio (`CamaCabecaXP..`). Sem migrar, toda cama de
 * mundo salvo virava "pé + pé" e a regra do par evaporava as duas.
 *
 * **Idempotente sem marcador de versão:** no formato novo um pé NUNCA tem outro
 * pé igual logo à frente (ali mora a cabeceira), então só uma FILEIRA de 2+ pés
 * iguais no eixo da cama é legado. Cada fileira é emparelhada a partir da ponta
 * do pé — posições ímpares viram cabeceira —, que é exatamente como as camas em
 * fila foram colocadas. Sobra ímpar (a corrente que duplicava) é meia cama
 * órfã: vira ar, sem drop. Pé sozinho não é tocado — ou é cama nova (a
 * cabeceira está à frente) ou é órfão, e a regra do par cuida dele no tick.
 *
 * Varre só os chunks alocados (no mundo lazy, os que o save trouxe — o
 * worldgen nunca coloca cama). Devolve quantas camas foram emparelhadas.
 */
export function migrarCamasLegado(world: World): number {
  const { dims } = world;
  let camas = 0;
  for (let cy = 0; cy < dims.y; cy++) {
    for (let cz = 0; cz < dims.z; cz++) {
      for (let cx = 0; cx < dims.x; cx++) {
        const chunk = world.chunks[chunkIndex(world, cx, cy, cz)];
        if (!chunk) continue;
        for (let i = 0; i < chunk.length; i++) {
          const id = chunk[i]!;
          if (!isCamaPe(id)) continue;
          const lx = i % CHUNK_SIZE;
          const resto = (i - lx) / CHUNK_SIZE;
          const lz = resto % CHUNK_SIZE;
          const ly = (resto - lz) / CHUNK_SIZE;
          const x = cx * CHUNK_SIZE + lx;
          const y = cy * CHUNK_SIZE + ly;
          const z = cz * CHUNK_SIZE + lz;
          const { dx, dz } = camaHeadDir(id);
          if (getBlock(world, x - dx, y, z - dz) === id) continue; // não é a ponta do pé
          let n = 1;
          while (getBlock(world, x + n * dx, y, z + n * dz) === id) n++;
          if (n < 2) continue;
          for (let j = 1; j < n; j += 2) {
            setBlock(world, x + j * dx, y, z + j * dz, camaCabeca(id));
            camas++;
          }
          if (n % 2 === 1) setBlock(world, x + (n - 1) * dx, y, z + (n - 1) * dz, BlockId.Air);
        }
      }
    }
  }
  return camas;
}
