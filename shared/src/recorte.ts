import { ATLAS } from "./mesher";

/**
 * Parte os índices OPACOS do mesher em SÓLIDOS primeiro e RECORTE depois
 * (2026-10-27) — o resto (água, vidro) fica onde estava.
 *
 * Por que no CLIENTE e não dentro do mesher: quem sabe que tile tem furo é o PINTOR do
 * atlas (`tilesComFuro` lê os pixels), e o mesher é puro e roda no Worker sem
 * canvas. O tile de cada triângulo sai da UV do centro dele: o mesher põe toda
 * UV DENTRO do tile (recuo de meio texel), então o centro nunca cai no vizinho
 * — e vale pra face girada (`rotY`) também, que só troca os cantos de lugar.
 *
 * Custo: uma passada nos triângulos opacos do chunk na main thread (centenas,
 * não milhares — ~450 por chunk no bench). Chunk sem nenhum furo devolve o
 * MESMO array, sem cópia.
 */
export function separarRecorte(
  indices: Uint32Array,
  opacos: number,
  uvs: Float32Array,
  furos: Uint8Array,
): { indices: Uint32Array; solidos: number } {
  const n = ATLAS.tilesPerRow;
  const furado = (t: number): boolean => {
    const a = indices[t]!, b = indices[t + 1]!, c = indices[t + 2]!;
    const u = (uvs[a * 2]! + uvs[b * 2]! + uvs[c * 2]!) / 3;
    const v = (uvs[a * 2 + 1]! + uvs[b * 2 + 1]! + uvs[c * 2 + 1]!) / 3;
    const col = Math.floor(u * n);
    const row = n - 1 - Math.floor(v * n);
    return furos[row * n + col] === 1;
  };
  let recorte = 0;
  for (let t = 0; t < opacos; t += 3) if (furado(t)) recorte += 3;
  if (recorte === 0) return { indices, solidos: opacos };
  const saida = new Uint32Array(indices.length);
  let s = 0;
  let r = opacos - recorte;
  for (let t = 0; t < opacos; t += 3) {
    const alvo = furado(t) ? r : s;
    saida[alvo] = indices[t]!;
    saida[alvo + 1] = indices[t + 1]!;
    saida[alvo + 2] = indices[t + 2]!;
    if (alvo === s) s += 3;
    else r += 3;
  }
  saida.set(indices.subarray(opacos), opacos);
  return { indices: saida, solidos: opacos - recorte };
}
