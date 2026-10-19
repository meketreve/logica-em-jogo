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
 * aberto por minutos). O nome fica na lista de jogadores, e a própria criança
 * não conseguia voltar — hoje o join TOMA POSSE do nome com o PIN certo
 * (2026-10-13) e esta vigília fica pra quando NINGUÉM volta: aí o nome tem de
 * liberar sozinho.
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
/**
 * bug-675 (sobra, 2026-10-13): o silêncio só se cobra com esta quantidade de
 * PERGUNTAS atrás do último sinal. O tempo era cobrado em relógio de parede,
 * então um buraco do host abaixo de `PAUSA_DO_HOSPEDEIRO_MS` (7,8 s, sem
 * reset) somava com um engasgo de rede do aluno e estourava os 15 s num tick
 * em que ninguém foi perguntado de novo — queda sem causa do lado do aluno.
 * Três perguntas com a janela de resposta = três chances; aí sim o silêncio
 * é dele, e o host pode travar o quanto for que ninguém paga por isso.
 */
export const HEARTBEAT_PERGUNTAS_PARA_DERRUBAR = 3;
/**
 * Buraco entre duas rodadas da vigília que denuncia que o HOSPEDEIRO parou
 * (bug-675) — e não que a turma ficou calada. A vigília roda a cada tick
 * (~100 ms), então qualquer coisa acima de uma rodada de `ping` já é anomalia
 * do host; uso o dobro pra não disparar com um tick atrasado por carga normal.
 */
export const PAUSA_DO_HOSPEDEIRO_MS = HEARTBEAT_PING_MS * 2;

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

/**
 * Teto de BYTES da mensagem de chat (2026-10-19). Vive ao lado do teto de
 * CARACTERES porque os dois medem coisas diferentes e o menor dos dois ganha:
 * 200 caracteres de português são ~220 bytes e passam inteiros, mas 200 emojis
 * são 800 bytes — é esse caso que o número abaixo corta. Folgado de propósito:
 * ele existe contra abuso, não para encurtar frase com acento.
 */
export const MAX_CHAT_BYTES = 512;

/**
 * Teto de BYTES do frame CRU vindo do cliente, cobrado antes do `JSON.parse`
 * (2026-10-19). Os tetos por campo (chat, quadro, nome) só valem DEPOIS do
 * parse, então sem este um aluno com o console aberto fazia o host parsear
 * megabytes para o texto ser cortado a 512 bytes no fim. A maior mensagem
 * legítima é o `quadro_set` com imagem (`MAX_QUADRO_IMAGEM_CHARS` = 32 KiB de
 * data URL, ASCII), daí a folga de ~2× em cima dela.
 */
export const MAX_FRAME_BYTES = 64 * 1024;

/** Tamanho máximo de nome de jogador (o servidor corta o excedente). */
export const MAX_NAME_LENGTH = 24;
