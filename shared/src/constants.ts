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

/**
 * PRESENÇA (2026-09-22, bug-672) — o servidor pergunta "você ainda está aí?".
 *
 * Nasceu da queixa da escola: no tablet, quem MINIMIZA ou FECHA o navegador
 * nem sempre fecha o socket (o aparelho congela a aba, e o TCP fica meio
 * aberto por minutos). O nome continua na lista de jogadores, e como o join
 * recusa nome repetido, a própria criança não consegue voltar.
 *
 * O ping é de APLICAÇÃO, não o do protocolo WebSocket, e isso é o ponto: o
 * ping do protocolo é respondido pela pilha de rede do aparelho mesmo com a
 * aba congelada — ele diria "vivo" justamente no caso que queremos pegar.
 * Este aqui só é respondido por JavaScript rodando, que é a definição prática
 * de "o aluno ainda está no jogo".
 *
 * Os números são de sala de aula: 4 s entre perguntas e 15 s de silêncio pra
 * derrubar dão ~3 chances. Curto o bastante pra criança reabrir o navegador e
 * já conseguir entrar; longo o bastante pra um engasgo do Wi-Fi da escola (ou
 * um tablet velho trocando de app por uns segundos) não derrubar ninguém no
 * meio da aula.
 */
export const HEARTBEAT_PING_MS = 4000;
export const HEARTBEAT_TIMEOUT_MS = 15000;

/** Ciclo dia/noite (cp21): duração de um dia completo em segundos reais.
 *  20 min (convenção Minecraft) — 10 min de sol pleno dá tempo de construir
 *  sem o céu correr (backlog 2026-07-19: 10 min ficava rápido demais). */
export const DIA_SEGUNDOS = 1200;
/** Hora (0..24) padrão de um mundo NOVO: MEIO-DIA. Mundo de atividade nasce em
 *  DIA PERMANENTE com o ciclo PARADO (o céu não muda durante a aula) — o ciclo
 *  e a hora corrente persistem no save (sobrevivência, futuro, continua a hora). */
export const HORA_PADRAO = 12;

/** Teto de células de ÁGUA que MUDAM por tick (proteção de FPS). Com MUITA água
 *  mexendo (cascata gigante), o excedente escorre no tick SEGUINTE — a água flui
 *  um pouco mais devagar, mas o cliente não afoga em remesh. Água parada (nível
 *  já assentado) não gasta orçamento. Configurável no host via LJ_AGUA_TICK. */
export const AGUA_POR_TICK_PADRAO = 256;

/** Loja (2026-09-01): saldo de Dimas que todo aluno recebe na 1ª vez que
 *  entra no mundo — se a turma votar essa moeda (`docs/loja-perguntas-alunos.md`).
 *  Host pode sobrepor com LJ_DIMAS_INICIAL. */
export const DIMAS_INICIAL_PADRAO = 50;

/** Alcance de interação (colocar/quebrar) em blocos, medido do olho do jogador. */
export const PLAYER_REACH = 5;

/** Tamanho máximo de mensagem de chat (o servidor corta o excedente). */
export const MAX_CHAT_LENGTH = 200;

/** Tamanho máximo de nome de jogador (o servidor corta o excedente). */
export const MAX_NAME_LENGTH = 24;
