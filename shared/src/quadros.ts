/**
 * Quadro (backlog 2026-07-19): bloco de parede com CONTEÚDO autoral — texto
 * e/ou imagem. Primeiro estado que NÃO cabe no id: o conteúdo mora num mapa
 * por POSIÇÃO na GameSession (servidor = verdade), viaja por mensagens
 * próprias (quadro_set / quadro_changed / quadros) e persiste no meta do
 * save. A imagem é um data URL JPEG pequeno (o cliente redimensiona ANTES de
 * enviar; o servidor só valida prefixo e teto de tamanho).
 */

export interface QuadroConteudo {
  x: number;
  y: number;
  z: number;
  texto: string;
  /** data URL "data:image/..." já comprimido pelo cliente. Ausente = só texto. */
  imagem?: string;
}

export const MAX_QUADRO_TEXTO = 300;
/** Teto do data URL da imagem (chars). 192px JPEG q0.75 cabe com folga;
 *  o cliente baixa a qualidade até caber ou desiste com aviso. */
export const MAX_QUADRO_IMAGEM_CHARS = 32768;

/** Chave canônica do mapa de conteúdos. */
export function quadroKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

/** Valida conteúdo vindo de FORA (fio ou save). null = entrada quebrada. */
export function parseQuadroConteudo(v: unknown): QuadroConteudo | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  const { x, y, z } = o;
  if (typeof x !== "number" || !Number.isInteger(x)) return null;
  if (typeof y !== "number" || !Number.isInteger(y)) return null;
  if (typeof z !== "number" || !Number.isInteger(z)) return null;
  if (typeof o["texto"] !== "string") return null;
  const texto = o["texto"].slice(0, MAX_QUADRO_TEXTO);
  const imagem = o["imagem"];
  if (imagem !== undefined) {
    if (
      typeof imagem !== "string" ||
      !imagem.startsWith("data:image/") ||
      imagem.length > MAX_QUADRO_IMAGEM_CHARS
    ) {
      return null;
    }
    return { x, y, z, texto, imagem };
  }
  return { x, y, z, texto };
}
