/// <reference lib="webworker" />
/**
 * Worker do mesher (2026-07-26). Recebe uma VIZINHANÇA (o cubo 18³ de
 * `extrairVizinhanca`) e devolve os typed arrays da geometria por TRANSFER —
 * zero cópia na volta.
 *
 * Não conhece `World`, `THREE` nem a cena: `meshVizinhanca` é função pura, e é
 * exatamente por isso que ela cabe aqui sem sincronização nenhuma. Quem monta a
 * `BufferGeometry` e sobe pra GPU continua sendo a main thread (`chunks.ts`).
 */
import { meshVizinhanca } from "@logica/shared";

interface PedidoMesh {
  /** Id do job (o pool casa a resposta com o chunk; o worker não interpreta). */
  id: number;
  viz: Uint8Array;
  /** §💡 cubo 18³ de bytes de luz. Ausente = mundo sem grade de luz → o mesher
   *  monta tudo aceso (é como o jogo era antes do §💡). */
  luzViz?: Uint8Array;
}

const emitir = (msg: unknown, transfer?: Transferable[]): void => {
  (self as unknown as Worker).postMessage(msg, transfer ?? []);
};

self.onmessage = (e: MessageEvent<PedidoMesh>): void => {
  const { id, viz, luzViz } = e.data;
  const t0 = performance.now();
  try {
    const g = meshVizinhanca(viz, luzViz);
    // §🔁: erro aqui NÃO pode derrubar o worker — o pool marca a coluna como
    // suspeita e o cliente a repede, igual fazia no caminho síncrono.
    emitir(
      {
        id,
        ms: performance.now() - t0,
        positions: g.positions,
        normals: g.normals,
        uvs: g.uvs,
        sway: g.sway,
        luz: g.luz,
        indices: g.indices,
        opaqueIndexCount: g.opaqueIndexCount,
        aguaIndexCount: g.aguaIndexCount,
      },
      [
        g.positions.buffer, g.normals.buffer, g.uvs.buffer,
        g.sway.buffer, g.luz.buffer, g.indices.buffer,
      ],
    );
  } catch (err) {
    emitir({ id, ms: performance.now() - t0, erro: String(err) });
  }
};
