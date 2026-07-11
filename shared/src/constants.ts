/** Aresta do chunk em blocos (16³ = 4096 bytes, 1 byte por bloco). */
export const CHUNK_SIZE = 16;
export const CHUNK_VOLUME = CHUNK_SIZE ** 3;

/**
 * Dimensões do mundo em chunks (X×Z×Y). Parâmetro de CRIAÇÃO do mundo,
 * gravado no header do save e do world_snapshot — o cliente nunca assume tamanho.
 */
export const DEFAULT_WORLD_CHUNKS = { x: 8, z: 8, y: 4 } as const;
export const MAX_WORLD_CHUNKS = { x: 16, z: 16, y: 8 } as const;

/** Tick fixo do servidor (desacoplado do render do cliente). */
export const SERVER_TICK_RATE = 10;

/** Alcance de interação (colocar/quebrar) em blocos, medido do olho do jogador. */
export const PLAYER_REACH = 5;

/** Tamanho máximo de mensagem de chat (o servidor corta o excedente). */
export const MAX_CHAT_LENGTH = 200;

/** Tamanho máximo de nome de jogador (o servidor corta o excedente). */
export const MAX_NAME_LENGTH = 24;
