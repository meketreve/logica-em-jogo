import { MAX_PIN_ATTEMPTS, PIN_LOCKOUT_MS, type Papel, isValidPin, sanitizeName } from "./auth";
import {
  BlockId,
  ITEM_BALDE_AGUA,
  ITEM_BALDE_VAZIO,
  camaHeadDir,
  fornalhaComEstado,
  isAgua,
  isAguaFonte,
  isBalde,
  isBreakable,
  isCama,
  isFornalha,
  isFullCube,
  isItem,
  isPlaceable,
  isPlantacao,
  isPorta,
  isInterativo,
  isJanela,
  isProfessorOnly,
  isQuadro,
  isReplaceable,
  isSolidBlock,
  interativoToggled,
  janelaComHinge,
  janelaEixoX,
  janelaHingeAlta,
  portaComHinge,
  portaEixoX,
  portaHingeAlta,
  precisaApoio,
  apoioValido,
} from "./blocks";
import { isComida, saciedadeDe } from "./comida";
import { dropsDe, formaCanonica } from "./drops";
import {
  INV_SLOTS,
  type Inventario,
  STACK_MAX,
  type SlotSalvo,
  adicionar,
  cabe,
  contar,
  definirSlot,
  estaVazio,
  inventarioParaSave,
  inventarioVazio,
  moverSlot,
  parseInventario,
  remover,
} from "./inventario";
import { MAX_QUADRO_TEXTO, type QuadroConteudo, quadroKey } from "./quadros";
import {
  type Container,
  type ContainerSalvo,
  containerDeSave,
  containerKey,
  containerParaSave,
  containerTemConteudo,
  containerTipoDe,
  containerVazio,
  moverEntre,
} from "./containers";
import { fornalhaAcesa, tickFornalha } from "./fornalha";
import { faltaFerramenta } from "./ferramentas";
import { RECEITAS, fabricar, receitaValida } from "./receitas";
import {
  AGUA_POR_TICK_PADRAO,
  CHUNK_SIZE,
  DEFAULT_WORLD_CHUNKS,
  DIA_SEGUNDOS,
  HORA_PADRAO,
  MAX_CHAT_LENGTH,
  PLAYER_REACH,
  SERVER_TICK_RATE,
} from "./constants";
import {
  MODO_PADRAO,
  type Modo,
  modoEfetivo,
  nomeModo,
  parseModo,
} from "./modo";
import { PLAYER, apoiadoNoChao } from "./physics";
import { REGRAS, parseRegras, regraDef, regrasParaSave, valorRegra } from "./regras";
import {
  type CausaDano,
  DANO_PVP,
  EXAUSTAO_POR_BLOCO_ANDADO,
  EXAUSTAO_POR_EDICAO,
  EXAUSTAO_POR_REGEN,
  type EstadoVital,
  FOLEGO_TICKS,
  FOME_MAX,
  PASSO_MAX_POR_AMOSTRA,
  TICKS_ENTRE_ATAQUES,
  VIDA_MAX,
  aplicarDano,
  danoDeQueda,
  estaVivo,
  gastarEsforco,
  novoEstadoVital,
  saciar,
  textoDaMorte,
  tickFolego,
  tickFome,
  tickRegen,
} from "./sobrevivencia";
import {
  COLUNAS_POR_TICK_PADRAO,
  type ColunaRef,
  FOLGA_DESCARTE,
  PEDIDOS_COLUNA_POR_S,
  RAIO_MAX,
  RAIO_MIN,
  RAIO_PADRAO,
  type ServerMessage,
  encodeColunas,
  encodeLazyInfo,
  encodeSnapshot,
  parseClientMessage,
} from "./protocol";
import {
  MAX_REGIONS,
  MAX_REGION_NAME,
  type NamedRegion,
  type Vec3i,
  regionContains,
  regionDims,
  regionFromCorners,
} from "./regions";
import {
  type Claim,
  MAX_AMIGOS,
  MAX_CLAIM_X,
  MAX_CLAIM_Z,
  MAX_CLAIM_NAME,
  caixasSeCruzam,
  claimDentroDoLimite,
} from "./claims";
import { TICKS_POR_CRESCIMENTO, crescerPlantacao, ruleFor } from "./rules";
import {
  VENTO_PARADO,
  type Vento,
  ventoIntensidade,
  ventoNoTick,
  ventoRumo,
} from "./vento";
import { type SaveData, type SaveMeta } from "./save";
import { MAX_GRUPOS } from "./groups";
import {
  type Box,
  type GroupObjectiveState,
  MAX_OBJETIVOS,
  MAX_ENCHER_CELLS,
  MAX_OBJETIVO_CELLS,
  MAX_OBJETIVO_TEXTO,
  type Objective,
  type ObjectiveState,
  type ScenarioModo,
  boxVolume,
  countSolid,
  matchRegion,
  snapshotRegion,
} from "./scenario";
import {
  type World,
  type WorldDims,
  chunkIndex,
  colunaGerada,
  findSpawnSeco,
  findSpawnY,
  getBlock,
  inBounds,
  setBlock,
} from "./world";
import {
  type WorldPreset,
  ehMundoLazy,
  cavernaEm,
  generateWorldForPreset,
  heightAt,
  gerarColunaDeChunks,
} from "./worldgen";

/**
 * GameSession: o SERVIDOR autoritativo, independente de hospedeiro.
 * TS puro — o host (Web Worker agora, Node+ws no checkpoint 5) só faz
 * transporte: entrega mensagens cruas e agenda tick() no ritmo de
 * SERVER_TICK_RATE. Toda decisão de estado do mundo mora aqui.
 */

export type SendFn = (clientId: number, data: string | ArrayBuffer) => void;

export interface SessionOptions {
  dims?: WorldDims;
  seed?: number;
  /** Relógio em ms (injetável nos testes). Hosts passam performance.now. */
  now?: () => number;
  /** Mundo carregado de um save (.ljw) — ignora dims/seed e NÃO gera terreno. */
  restore?: SaveData;
  /** Código de professor em texto puro (host Node: LJ_CODIGO). Sobrepõe o
   *  do restore — é o caminho de troca/recuperação de código. */
  codigo?: string;
  /**
   * Hospedeiro singleplayer (Web Worker): join sem PIN e todo jogador é
   * professor. Papel e PIN NÃO são registrados no save — um mundo single
   * exportado e hospedado na LAN não pode dar professor de graça pra quem
   * chegar primeiro com o nome do dono.
   */
  singleplayer?: boolean;
  /** Mundo NOVO nasce plano (preset de cenários, cp12). Ignorado com restore.
   *  Mantido por compat (testes, LJ_PLANO) — `preset` é o caminho novo. */
  flat?: boolean;
  /** Preset do mundo NOVO (cp14): normal | plano | cabines. Vence o `flat`. */
  preset?: WorldPreset;
  /**
   * §🍖 F9: o mundo NOVO já nasce em sobrevivência (modo do mundo +
   * ciclo dia/noite andando). Eixo à PARTE do `preset` — o terreno é escolha
   * de bytes, isto é escolha de partida. Ignorado com `restore` (o save traz o
   * que gravou) e vencido pelo `somenteLeitura` (aula é criativo, ponto).
   */
  sobrevivencia?: boolean;
  /** Mundo de aula/atividade (read-only, cp19): o host passa true. Aqui liga
   *  o CONFINAMENTO (cp25) por padrão — cada aluno só edita na área do grupo. */
  somenteLeitura?: boolean;
  /** Streaming (F2): colunas de chunks enviadas por TICK por jogador —
   *  config de desempenho do host (LJ_COLUNAS_TICK). Só vale em mundo lazy. */
  colunasPorTick?: number;
  /** Teto de células de água que MUDAM por tick (proteção de FPS na cascata
   *  gigante). Config de desempenho do host (LJ_AGUA_TICK). */
  aguaPorTick?: number;
  /**
   * §🍖 F6: ticks entre dois estágios da plantação (LJ_CRESCIMENTO). O padrão
   * é `TICKS_POR_CRESCIMENTO` (20 s por estágio); abaixar é o que deixa o smoke
   * ver a horta inteira amadurecer em segundos em vez de em um minuto, e é o
   * botão pra o professor experimentar o ritmo num playtest sem esperar a aula.
   */
  crescimentoPorEstagio?: number;
}

interface SessionPlayer {
  name: string;
  papel: Papel;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
}

/** Identidade que o MUNDO lembra (separada da posição — o roster). */
interface Identity {
  pin: string | undefined;
  papel: Papel;
}

/**
 * Coordenada digitada num comando: inteiro, "~" (coordenada atual do autor) ou
 * "~n" (atual + n) — convenção do Minecraft, o modelo mental do público.
 * `base` = célula onde o autor está. null = token inválido.
 */
/** Validade de um pedido de /tpr (aceite com /tpa) — 30 s. */
const TP_PEDIDO_MS = 30_000;

/** §🍖 F4: freio do aviso "mochila cheia" (quebrar é clique repetido). */
const AVISO_MOCHILA_MS = 5_000;

/** §🍖 F4: teto de um `/dar` (27 slots × 64 = a mochila inteira de uma vez). */
const MAX_DAR_QTD = INV_SLOTS * STACK_MAX;

function parseCoordArg(token: string | undefined, base: number): number | null {
  if (token === undefined) return null;
  if (token.startsWith("~")) {
    const off = token.slice(1);
    if (off === "") return base;
    const n = Number(off);
    return Number.isInteger(n) ? base + n : null;
  }
  const n = Number(token);
  return Number.isInteger(n) ? n : null;
}

export class GameSession {
  readonly world: World;
  readonly seed: number;
  /** Spawn FIXO: calculado uma vez sobre o terreno pristino (na criação).
   *  Nunca recalcular no join — o mundo pode já estar escavado (bug-010). */
  readonly spawn: { x: number; y: number; z: number };
  tickCount = 0;

  /** Hora do dia (0..24) do ciclo dia/noite (cp21). Server-autoritativa; SÓ
   *  visual (não afeta física/jogo). Mundo NOVO nasce ao meio-dia; PERSISTE no
   *  save (sobrevivência continua a hora — restore sobrescreve). */
  private horaDoDia = HORA_PADRAO;
  /** O ciclo avança sozinho? Mundo de atividade nasce PARADO (dia permanente);
   *  professor liga/desliga com /ciclo; persiste no save. */
  private cicloAtivo = false;
  /** Voo do modo criativo LIBERADO pra turma? O professor voa sempre; este
   *  flag decide se os alunos também podem (professor alterna com /voo).
   *  Transitório — NÃO persiste no save (nasce desligado a cada sessão). */
  private vooLiberado = false;
  /** O vento sopra? (§🌬️) SÓ visual — água/nuvens/folhas seguem, física não.
   *  Nasce LIGADO (é ambiência, não regra de atividade); o professor desliga
   *  com /vento quando quer o cenário parado. Persiste no save. */
  private ventoAtivo = true;
  /** Modo de jogo PADRÃO do mundo (§🍖 F1). Persiste no save; mundo-aula força
   *  criativo (não é escolha do professor: o host impõe, como o confinamento). */
  private modoMundo: Modo = MODO_PADRAO;
  /** Override pessoal de modo, por NOME (não por id de cliente — o modo tem de
   *  sobreviver ao rejoin, igual ao roster). Vence o padrão do mundo. Persiste. */
  private readonly modosPorJogador = new Map<string, Modo>();
  /** Regras de mundo (`/regra`, §🍖 F1) — guarda SÓ o que difere do padrão do
   *  registro (`regras.ts`). Persiste no save como MAPA. */
  private readonly regras = new Map<string, boolean>();
  /** Mundo de aula/atividade (read-only): trava o modo em criativo. */
  private readonly somenteLeitura: boolean;
  /** §🍖 F2: vida/fome/fôlego por NOME (como o modo — sobrevive ao rejoin).
   *  Só quem está machucado vai pro save. */
  private readonly vitais = new Map<string, EstadoVital>();
  /** §🍖 F2: ponto MAIS ALTO desde a última vez que o jogador estava apoiado,
   *  por cliente. A queda é fechada quando ele pousa. Rascunho de sessão: some
   *  no disconnect (quem volta não paga a queda de ontem). */
  private readonly picoQueda = new Map<number, number>();
  /** §🍖 F4: inventário AUTORITATIVO por NOME (mesma disciplina do modo e dos
   *  vitais — a mochila sobrevive ao rejoin e à troca de aula). Só existe
   *  entrada pra quem já pegou alguma coisa; criativo nunca cria uma. */
  private readonly inventarios = new Map<string, Inventario>();
  /** §🍖 F4: quando cada cliente ouviu "mochila cheia" pela última vez.
   *  Rascunho de sessão (some no disconnect) — é só o freio do aviso. */
  private readonly avisoMochila = new Map<number, number>();
  /** §🍖 F7: tick do último soco de cada cliente (o cooldown do ataque). Em
   *  TICKS, não em relógio de parede — mesma disciplina do ciclo e do vento.
   *  Rascunho de sessão: some no disconnect (quem volta bate na hora). */
  private readonly ultimoAtaque = new Map<number, number>();
  /** §🍖 F7: quando cada cliente ouviu "o pvp está desligado". Freio do aviso,
   *  igual ao da mochila cheia. */
  private readonly avisoPvp = new Map<number, number>();

  private readonly players = new Map<number, SessionPlayer>();
  /** Última POSIÇÃO conhecida por nome: volta onde parou, olhando pra onde
   *  olhava. Identidade (PIN/papel) mora no mapa separado `identity`. */
  private readonly roster = new Map<
    string,
    { x: number; y: number; z: number; yaw: number; pitch: number }
  >();
  /** PIN e papel por nome (cp9). Vazio no singleplayer — ver SessionOptions. */
  private readonly identity = new Map<string, Identity>();
  /** Regiões nomeadas (cp11), chave = nome. Persistem no meta do save. */
  private readonly regions = new Map<string, NamedRegion>();
  /** Cantos pendentes da varinha, por cliente (não persistem — são rascunho). */
  private readonly wandMarks = new Map<number, { c1?: Vec3i; c2?: Vec3i }>();
  /** Pedidos de /tpr pendentes, por DESTINATÁRIO (id do cliente). Rascunho de
   *  sessão: não persiste, expira em TP_PEDIDO_MS e morre no disconnect. */
  private readonly tpPedidos = new Map<
    number,
    { deId: number; deNome: string; expira: number }[]
  >();
  /** Cenário (cp12): objetivos + progresso do MUNDO. Persiste no save. */
  private readonly scenario: {
    modo: ScenarioModo;
    objetivos: Objective[];
    completos: Set<number>;
  } = { modo: "sequencial", objetivos: [], completos: new Set() };
  private nextObjetivoId = 1;
  /** Objetivos a rechecar no fim do tick (applyBlock marca — regra de ouro:
   *  detecção acorda por MUDANÇA, nunca por varredura periódica do mundo).
   *  Chave `${objetivoId}:${grupo}` — grupo 0 = área compartilhada/mundo. */
  private readonly objetivosDirty = new Set<string>();
  /** Último estado de cenário enviado (JSON) — evita broadcast repetido. */
  private lastObjectivesJson = "";
  /** Grupos (cp13): id → nomes dos membros. Persiste no save. */
  private readonly grupos = new Map<number, Set<string>>();
  /** Conclusões POR GRUPO, chave `${objetivoId}:${grupo}`. Persiste. */
  private completosGrupo = new Set<string>();
  /** Anti-griefing (cp24): proteção de áreas ligada? Professor alterna. Persiste. */
  private claimsAtivo = false;
  /** Claims por aluno (chave = nome do dono; 1 por aluno). Persiste. */
  private readonly claims = new Map<string, Claim>();
  /** Grupos de amigos (chave = dono; valor = membros SEM o dono). Persiste. */
  private readonly amigos = new Map<string, Set<string>>();
  /** Convites de amigo pendentes: convidado → donos que convidaram. Rascunho
   *  de sessão, NÃO persiste (morre no reboot). */
  private readonly convitesAmigo = new Map<string, Set<string>>();
  /** Nicks banidos pelo professor (2026-07-21). O join recusa quem está aqui;
   *  persiste no save de mundo livre (some em mundo-aula read-only). Guardado
   *  como o nick digitado; a checagem é case-insensitive. */
  private readonly banidos = new Set<string>();
  /** Confinamento (cp25): o aluno só coloca/quebra DENTRO da área do seu grupo.
   *  Inverte o claim (confina em vez de proteger). Professor alterna (/confinar)
   *  e em mundo-aula nasce ligado (opts.somenteLeitura). Persiste no save de
   *  mundo livre; em aula não salva (read-only) — reseta por turma. */
  private confinamentoAtivo = false;
  /** Quadros (2026-07-19): conteúdo (texto/imagem) por posição — primeiro
   *  estado FORA do id de bloco. Chave = quadroKey(x,y,z). Persiste. */
  private readonly quadros = new Map<string, QuadroConteudo>();
  /**
   * §🍖 F10: o que está DENTRO de cada fornalha/baú, por posição. Mesmo desenho
   * do mapa de quadros — o servidor é a verdade e o byte do chunk só guarda o
   * ESTADO (apagada/acesa).
   *
   * **Não há índice separado de fornalhas acesas**, ao contrário do índice de
   * plantações do §🍖 F6, e a razão é o tamanho: uma horta se esconde entre
   * milhões de células de mundo, e por isso precisava de índice; container é
   * uma entrada neste mapa, que tem dezenas — o tick varre o mapa inteiro e
   * pula quem não é fornalha.
   */
  private readonly containers = new Map<string, Container>();
  /** §🍖 F10: qual container cada cliente está com ABERTO (id → célula). É por
   *  ele que o servidor sabe pra quem mandar `container` quando o conteúdo muda
   *  — inclusive quando muda sozinho, no tick da fornalha. */
  private readonly containerAberto = new Map<number, Vec3i>();
  /** Tentativas erradas de PIN por nome — rate-limit da ameaça real (colega
   *  na LAN chutando 10 mil combinações). Não persiste no save. */
  private readonly pinFails = new Map<string, { fails: number; lockedUntil: number }>();
  private codigoFails = 0;
  private codigoLockedUntil = 0;
  private readonly singleplayer: boolean;
  private readonly codigo: string | undefined;
  private readonly now: () => number;
  private tickMsSum = 0;
  private tickMsMax = 0;
  private ticksInWindow = 0;
  /** Custo das REGRAS na janela de 1 s (§📊 item 5 do perfilador): quantas
   *  células a regra examinou, quantas mudanças saíram dali e quanto disso era
   *  água. É o que liga o `remesh(bloco)` caro do cliente à causa do servidor —
   *  antes, um pico de remesh não dizia se veio de água escorrendo ou de gente
   *  construindo. */
  private regrasCelulasSum = 0;
  private regrasCelulasMax = 0;
  private regrasMudancasSum = 0;
  private regrasAguaSum = 0;
  /** Células a examinar no próximo tick (fila de vizinhança — regra de ouro). */
  private dirty = new Set<number>();
  /** Células já alteradas neste tick (máx. 1 mudança por célula por tick). */
  private changedThisTick = new Set<number>();
  /**
   * Contador MONOTÔNICO de células escritas (§🍖 F3/F4). É o que responde "o
   * mundo mudou por causa desta mensagem?" — e tem de ser um contador, não o
   * tamanho do `changedThisTick`: aquele é um CONJUNTO de coordenadas, então
   * quebrar e recolocar a MESMA célula no mesmo tick não mexia no tamanho e a
   * colocação saía de graça (bloco infinito por clique rápido).
   */
  private edicoesAplicadas = 0;
  /** F2 streaming: mundo LAZY (gigante) — colunas materializam sob demanda e
   *  viajam por raio de interesse; o join manda só o header LJE0. */
  private lazy = false;
  private readonly colunasPorTick: number;
  /** Teto de mudanças de água por tick (proteção de FPS). Excedente escorre no
   *  tick seguinte. Configurável via LJ_AGUA_TICK no host. */
  private readonly aguaMaxPorTick: number;
  /** Estado de streaming por cliente: raio de interesse + colunas já enviadas
   *  (chave = cz*dims.x+cx). Sai do raio+folga = esquece → re-envia na volta
   *  (cliente descarta pela MESMA regra — sem mensagem de unload). */
  private readonly stream = new Map<
    number,
    {
      raio: number;
      enviadas: Set<number>;
      /** §🔁 teto de `pedir_coluna`: janela de 1 s (início + contador). */
      pedidos: number;
      pedidosDesde: number;
    }
  >();
  /** F3 save esparso: índices de chunk (chunkIndex) com EDIÇÃO — jogador ou
   *  gravidade, tudo passa por applyBlockQuieto. Terreno só-gerado NÃO entra
   *  (regenera do seed). Só o mundo lazy usa; no save vira o delta gravado. */
  private readonly editedChunks = new Set<number>();
  /** F5 eviction: colunas materializadas no servidor (chave cz*dims.x+cx).
   *  A eviction libera as que ninguém quer E que não têm edição. */
  private readonly residentCols = new Set<number>();
  /** F5: colunas com edição (chave de coluna) — derivado de editedChunks, pra
   *  a eviction consultar rápido. Coluna editada NUNCA é liberada (os bytes
   *  editados só vivem na RAM até o save). */
  private readonly editedCols = new Set<number>();
  /**
   * §🍖 F6: células com plantação (packCoord). É um ÍNDICE, não estado: a
   * verdade continua sendo o byte no chunk, e este conjunto só existe pra o
   * pulso de crescimento não ter de varrer o mundo atrás de horta. Nasce e
   * morre dentro do `applyBlockQuieto` (plantou entra, colheu sai), e o
   * `restore` o reconstrói varrendo os chunks que o save trouxe.
   */
  private readonly plantacoes = new Set<number>();
  /** §🍖 F6: ticks desde o último pulso de crescimento. */
  private crescimentoTicks = 0;
  /** §🍖 F6: de quantos em quantos ticks a horta anda um estágio. */
  private readonly crescimentoPorEstagio: number;

  constructor(
    private readonly send: SendFn,
    opts: SessionOptions = {},
  ) {
    this.now = opts.now ?? (() => Date.now());
    this.singleplayer = opts.singleplayer ?? false;
    this.colunasPorTick = Math.max(1, opts.colunasPorTick ?? COLUNAS_POR_TICK_PADRAO);
    this.aguaMaxPorTick = Math.max(1, opts.aguaPorTick ?? AGUA_POR_TICK_PADRAO);
    this.crescimentoPorEstagio = Math.max(
      1,
      opts.crescimentoPorEstagio ?? TICKS_POR_CRESCIMENTO,
    );
    this.codigo = opts.codigo ?? opts.restore?.codigo;
    this.somenteLeitura = opts.somenteLeitura ?? false;
    if (opts.restore) {
      // mundo vem do save: NADA é recalculado (spawn é do terreno pristino —
      // recalcular sobre mundo escavado repetiria o bug-010)
      this.world = opts.restore.world;
      this.seed = opts.restore.seed;
      this.spawn = { ...opts.restore.spawn };
      // F3 save esparso: mundo lazy restaurado nasce VAZIO — para cada chunk
      // editado, regenera a coluna do seed e sobrepõe os bytes salvos. O resto
      // do mundo continua vindo por streaming (regenera igual, é determinístico).
      this.lazy = ehMundoLazy(this.world.dims);
      if (this.lazy && opts.restore.editedChunks) {
        const dims = this.world.dims;
        for (const { index, bytes } of opts.restore.editedChunks) {
          const cx = index % dims.x;
          const rest = (index - cx) / dims.x;
          const cz = rest % dims.z;
          this.gerarColuna(cx, cz); // no-op se já gerada; marca residente
          this.world.chunks[index]?.set(bytes); // sobrepõe a edição salva
          this.editedChunks.add(index);
          this.editedCols.add(cz * dims.x + cx); // coluna editada nunca é liberada
        }
      }
      // §🍖 F6: a horta do mundo salvo tem de voltar a crescer. O índice se
      // reconstrói dos BYTES (não há campo novo no `.ljw` — a verdade já está
      // no chunk), varrendo só o que o save materializou: no mundo lazy são os
      // chunks EDITADOS, e worldgen nunca planta nada, então nenhuma plantação
      // escapa. Mundo antigo (sem plantação) sai da varredura com o índice vazio.
      this.indexarPlantacoes();
      for (const p of opts.restore.roster) {
        this.roster.set(p.name, { x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch });
        // §🍖 F2/F3: vida e fome ausentes no save = cheias (o parse já barrou
        // valor doente). Uma só entra no mapa se ALGUMA das duas veio.
        if (p.vida !== undefined || p.fome !== undefined) {
          this.vitais.set(p.name, {
            ...novoEstadoVital(),
            ...(p.vida !== undefined ? { vida: p.vida } : {}),
            ...(p.fome !== undefined ? { fome: p.fome } : {}),
          });
        }
        // §🍖 F4: mochila do save (ausente = vazia). O parse defensivo mora no
        // `parseInventario`, então o que chega aqui já está são.
        if (p.inventario?.length) {
          this.inventarios.set(p.name, parseInventario(p.inventario));
        }
        // identidade restaurada MESMO no singleplayer: mundo de LAN importado
        // e re-exportado não perde os PINs da turma (aqui ela só não é usada)
        if (p.pin || p.papel === "professor") {
          this.identity.set(p.name, { pin: p.pin, papel: p.papel ?? "aluno" });
        }
      }
      for (const r of opts.restore.regioes ?? []) this.regions.set(r.nome, r);
      if (opts.restore.cenario) {
        this.scenario.modo = opts.restore.cenario.modo;
        this.scenario.objetivos = [...opts.restore.cenario.objetivos];
        this.scenario.completos = new Set(opts.restore.cenario.completos);
        for (const g of opts.restore.cenario.completosGrupos ?? []) {
          for (const id of g.objetivos) this.completosGrupo.add(`${id}:${g.grupo}`);
        }
        for (const o of this.scenario.objetivos) {
          if (o.id >= this.nextObjetivoId) this.nextObjetivoId = o.id + 1;
        }
      }
      for (const g of opts.restore.grupos ?? []) {
        this.grupos.set(g.id, new Set(g.membros));
      }
      // cp24: proteção de áreas + claims + grupos de amigos (convites não persistem)
      this.claimsAtivo = opts.restore.claimsAtivo ?? false;
      // o claim cobre a coluna inteira (0..teto); saves antigos guardavam altura
      // parcial — sobe pra coluna cheia ao carregar (mesma semântica pra todos).
      for (const c of opts.restore.claims ?? []) {
        c.min.y = 0;
        c.max.y = this.world.sizeY - 1;
        this.claims.set(c.dono, c);
      }
      for (const g of opts.restore.amigos ?? []) this.amigos.set(g.dono, new Set(g.membros));
      for (const n of opts.restore.banidos ?? []) this.banidos.add(n); // 2026-07-21
      this.confinamentoAtivo = opts.restore.confinamento ?? false; // cp25
      // quadros (2026-07-19): só entra conteúdo cuja célula AINDA é quadro
      for (const q of opts.restore.quadros ?? []) {
        if (isQuadro(getBlock(this.world, q.x, q.y, q.z))) {
          this.quadros.set(quadroKey(q.x, q.y, q.z), q);
        }
      }
      // §🍖 F10: containers — mesma regra do quadro (o conteúdo só volta se a
      // célula AINDA é aquele tipo de container), e o mesmo motivo: um save
      // editado à mão não pode fazer nascer baú dentro de pedra.
      for (const c of opts.restore.containers ?? []) {
        if (containerTipoDe(getBlock(this.world, c.x, c.y, c.z)) !== c.tipo) continue;
        this.containers.set(containerKey(c.x, c.y, c.z), containerDeSave(c));
      }
      // cp21: hora/ciclo do save vencem o padrão (mundo de atividade guarda
      // ciclo OFF; sobrevivência guarda a hora corrente). Ausentes = padrão.
      if (typeof opts.restore.hora === "number" && Number.isFinite(opts.restore.hora)) {
        this.horaDoDia = ((opts.restore.hora % 24) + 24) % 24;
      }
      if (typeof opts.restore.ciclo === "boolean") this.cicloAtivo = opts.restore.ciclo;
      // §🌬️: vento ausente em save antigo = padrão do mundo novo (ligado)
      if (typeof opts.restore.vento === "boolean") this.ventoAtivo = opts.restore.vento;
      // §🍖 F1: modo do mundo + overrides pessoais + regras (ausentes = padrão)
      this.modoMundo = opts.restore.modo ?? MODO_PADRAO;
      for (const [nome, modo] of Object.entries(opts.restore.modosPorJogador ?? {})) {
        this.modosPorJogador.set(nome, modo);
      }
      for (const [nome, valor] of parseRegras(opts.restore.regras)) {
        this.regras.set(nome, valor);
      }
    } else {
      this.seed = opts.seed ?? 1;
      const preset = opts.preset ?? (opts.flat ? "plano" : "normal");
      this.world = generateWorldForPreset(preset, opts.dims ?? DEFAULT_WORLD_CHUNKS, this.seed);
      // F2 streaming: mundo LAZY nasce vazio — materializa o entorno do spawn
      // antes do findSpawnY (o resto vem por raio de interesse no tick)
      this.lazy = ehMundoLazy(this.world.dims);
      if (this.lazy) {
        const ccx = Math.floor(this.world.dims.x / 2);
        const ccz = Math.floor(this.world.dims.z / 2);
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            this.gerarColuna(ccx + dx, ccz + dz);
          }
        }
      }
      // cabines: o centro exato do mundo é canto de chunk = dentro de uma
      // cabine — desloca o spawn pro MEIO do chunk (área aberta)
      const off = preset === "cabines" ? CHUNK_SIZE / 2 : 0;
      // mar/lago (2026-07-26): se o centro do mundo caiu na água, anda até a
      // coluna SECA mais próxima — ninguém nasce nadando. Mundo sem água
      // (plano/cabines/aulas) devolve o próprio centro, sem mudar nada.
      // §🏔️ cavernas (2026-07-28): boca de caverna também desqualifica a coluna.
      // Só no preset "normal" — `cavernaEm` é ruído puro e não sabe de preset;
      // chamá-la em mundo plano/cabines vetaria colunas que não têm caverna
      // nenhuma. O teste é a função PURA, não `getBlock`: a coluna pode ter sido
      // editada, e o que interessa é o que a GERAÇÃO fez ali.
      const vetoCaverna =
        preset === "normal"
          ? (cx: number, cz: number): boolean => {
              const h = Math.min(
                heightAt(cx, cz, this.seed, this.world.sizeY),
                this.world.sizeY - 2,
              );
              return cavernaEm(cx, h, cz, h, this.seed);
            }
          : undefined;
      const seco = findSpawnSeco(
        this.world,
        Math.floor(this.world.sizeX / 2 + off),
        Math.floor(this.world.sizeZ / 2 + off),
        24,
        vetoCaverna,
      );
      const sx = seco.x + 0.5;
      const sz = seco.z + 0.5;
      this.spawn = {
        x: sx,
        y: findSpawnY(this.world, Math.floor(sx), Math.floor(sz)),
        z: sz,
      };
      // §🍖 F9 (2026-08-04): preset de mundo de sobrevivência — faz de UM
      // clique o que hoje é uma sequência de comandos na frente da turma
      // (`/modo sobrevivencia all` + `/ciclo ligar`).
      // O que ele deliberadamente NÃO escreve: `pvp` e `manter-inventario`
      // (regras) e o confinamento já nascem no valor certo pelos próprios
      // padrões — e o save guarda só o DIFF do padrão, então gravá-los aqui
      // prenderia o mundo ao padrão de hoje em vez de segui-lo.
      if (opts.sobrevivencia) {
        this.modoMundo = "sobrevivencia";
        // sem ciclo, sobrevivência é meio-dia eterno: não há noite pra que a
        // cama, a tocha e (no F8) o mob signifiquem alguma coisa.
        this.cicloAtivo = true;
      }
    }
    // cp25: mundo de aula/atividade nasce CONFINADO (cada aluno na área do seu
    // grupo). Vence o que veio do save (aula é read-only e distribui o modelo);
    // em mundo livre o padrão continua desligado até o professor usar /confinar.
    if (opts.somenteLeitura) this.confinamentoAtivo = true;
    // §🍖 F1: mundo de aula/atividade é CRIATIVO, ponto — não é escolha do modo,
    // é o host que impõe (a aula distribui um modelo, não uma partida). Vence o
    // que veio do save, inclusive overrides pessoais gravados noutro mundo.
    if (this.somenteLeitura) {
      this.modoMundo = "criativo";
      this.modosPorJogador.clear();
    }
  }

  /**
   * Metadados pro save (.ljw). Jogadores ONLINE entram com a posição atual;
   * quem já saiu fica com a última posição vista (roster). O host grava:
   * `encodeSave(session.world, session.toSave())`.
   */
  toSave(): SaveMeta {
    const merged = new Map(this.roster);
    for (const p of this.players.values()) {
      merged.set(p.name, { x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch });
    }
    const regrasSalvas = regrasParaSave(this.regras);
    const containersSalvos = this.containersParaSave();
    return {
      seed: this.seed,
      spawn: { ...this.spawn },
      roster: [...merged.entries()].map(([name, pos]) => {
        const id = this.identity.get(name);
        const vital = this.vitais.get(name);
        return {
          name,
          ...pos,
          // JSON.stringify descarta undefined — aluno sem PIN sai enxuto
          pin: id?.pin,
          papel: id?.papel === "professor" ? ("professor" as const) : undefined,
          // §🍖 F2/F3: só o MACHUCADO e o FAMINTO viajam (cheio = ausente = padrão)
          vida: vital && vital.vida < VIDA_MAX ? vital.vida : undefined,
          fome: vital && vital.fome < FOME_MAX ? vital.fome : undefined,
          // §🍖 F4: mochila vazia sai ausente — mundo criativo não engorda o save
          inventario: this.inventarioParaRoster(name),
        };
      }),
      ...(this.codigo ? { codigo: this.codigo } : {}),
      ...(this.regions.size ? { regioes: [...this.regions.values()] } : {}),
      ...(this.scenario.objetivos.length
        ? {
            cenario: {
              modo: this.scenario.modo,
              objetivos: this.scenario.objetivos,
              completos: [...this.scenario.completos],
              ...(this.completosGrupo.size
                ? { completosGrupos: this.completosGruposParaSave() }
                : {}),
            },
          }
        : {}),
      ...(this.grupos.size
        ? {
            grupos: [...this.grupos.entries()].map(([id, membros]) => ({
              id,
              membros: [...membros],
            })),
          }
        : {}),
      // cp24: proteção de áreas — só grava o que existe (save antigo enxuto)
      ...(this.claimsAtivo ? { claimsAtivo: true } : {}),
      ...(this.claims.size ? { claims: [...this.claims.values()] } : {}),
      ...(this.amigos.size
        ? {
            amigos: [...this.amigos.entries()].map(([dono, membros]) => ({
              dono,
              membros: [...membros],
            })),
          }
        : {}),
      ...(this.banidos.size ? { banidos: [...this.banidos] } : {}),
      // cp25: confinamento por área de grupo (só grava ligado)
      ...(this.confinamentoAtivo ? { confinamento: true } : {}),
      // quadros (2026-07-19): conteúdo autoral por posição (só grava se há)
      ...(this.quadros.size ? { quadros: [...this.quadros.values()] } : {}),
      // §🍖 F10: containers — só os que têm ALGUMA coisa dentro. Fornalha e baú
      // vazios se refazem do byte do chunk no restore, e um mundo de aula cheio
      // de baú vazio não paga por eles no save.
      ...(containersSalvos.length ? { containers: containersSalvos } : {}),
      // cp21: hora + ciclo SEMPRE gravados (mundo de atividade guarda ciclo OFF;
      // sobrevivência guarda a hora corrente pra continuar de onde parou)
      hora: +this.horaDoDia.toFixed(3),
      ciclo: this.cicloAtivo,
      // §🌬️: só grava DESLIGADO — ausente no save = ligado (padrão do mundo novo)
      ...(this.ventoAtivo ? {} : { vento: false }),
      // §🍖 F1: modo e regras só gravam o que DIFERE do padrão (save enxuto;
      // mundo que nunca viu sobrevivência sai byte a byte como antes)
      ...(this.modoMundo !== MODO_PADRAO ? { modo: this.modoMundo } : {}),
      ...(this.modosPorJogador.size
        ? { modosPorJogador: Object.fromEntries(this.modosPorJogador) }
        : {}),
      ...(regrasSalvas ? { regras: regrasSalvas } : {}),
    };
  }

  private completosGruposParaSave(): { grupo: number; objetivos: number[] }[] {
    const porGrupo = new Map<number, number[]>();
    for (const key of this.completosGrupo) {
      const [idS, gS] = key.split(":");
      const g = Number(gS);
      const lista = porGrupo.get(g) ?? [];
      lista.push(Number(idS));
      porGrupo.set(g, lista);
    }
    return [...porGrupo.entries()].map(([grupo, objetivos]) => ({ grupo, objetivos }));
  }

  /**
   * Valida a entrada (PIN + código de professor) e, se aceita, registra
   * PIN novo/papel no identity. Devolve o MOTIVO da recusa, ou null se ok.
   * Nunca chamada no singleplayer.
   */
  private authenticate(
    name: string,
    pin: string | undefined,
    codigo: string | undefined,
  ): string | null {
    // banido (2026-07-21): recusa antes de tudo — nem chega a pedir PIN certo.
    if (this.estaBanido(name)) return "Você foi banido desta sala pelo professor.";
    // nome já ONLINE: segundo cliente com o mesmo nome fundiria os dois no
    // roster (bug-061 — o PIN fecha o resto do caso)
    for (const p of this.players.values()) {
      if (p.name === name) return `Já existe alguém em jogo com o nome "${name}". Escolha outro nome.`;
    }
    const gate = this.pinFails.get(name);
    if (gate && gate.lockedUntil > this.now()) {
      return "Muitas tentativas com o PIN errado. Aguarde 30 segundos e tente de novo.";
    }
    if (pin === undefined || !isValidPin(pin)) return "O PIN precisa ter exatamente 4 números.";
    const id = this.identity.get(name);
    if (id?.pin) {
      if (pin !== id.pin) {
        const fails = (gate?.fails ?? 0) + 1;
        this.pinFails.set(name, {
          fails,
          lockedUntil: fails >= MAX_PIN_ATTEMPTS ? this.now() + PIN_LOCKOUT_MS : 0,
        });
        return "PIN incorreto para este nome.";
      }
      this.pinFails.delete(name);
    }
    // código de professor: errado NEGA (professor que digitou errado precisa
    // saber, não entrar como aluno em silêncio); rate-limit próprio, global —
    // chutar código troca de nome a cada tentativa, o gate por nome não pega
    let papel: Papel = id?.papel ?? "aluno";
    if (codigo !== undefined && codigo !== "") {
      if (this.codigoLockedUntil > this.now()) {
        return "Muitas tentativas com o código de professor. Aguarde 30 segundos e tente de novo.";
      }
      if (!this.codigo || codigo !== this.codigo) {
        this.codigoFails++;
        if (this.codigoFails >= MAX_PIN_ATTEMPTS) {
          this.codigoLockedUntil = this.now() + PIN_LOCKOUT_MS;
          this.codigoFails = 0;
        }
        return "Código de professor incorreto.";
      }
      this.codigoFails = 0;
      papel = "professor";
    }
    // 1ª entrada com o nome registra o PIN; papel fica gravado pro rejoin
    this.identity.set(name, { pin: id?.pin ?? pin, papel });
    return null;
  }

  /** Mensagem crua vinda do transporte. Inválida = descartada em silêncio. */
  handleMessage(clientId: number, raw: string): void {
    const msg = parseClientMessage(raw);
    if (!msg) return;
    // §🍖 F3: editar o mundo dá fome, e a cobrança mora NUM lugar só — depois do
    // switch. Cada caso já devolveu cedo quando recusou (bounds, alcance, claim,
    // confinamento), então "o mundo mudou" é o mesmo que "a edição valeu", e
    // ramo novo de bloco no futuro entra cobrando sem ninguém lembrar disso.
    const mudancasAntes = this.edicoesAplicadas;
    switch (msg.type) {
      case "join": {
        const name = sanitizeName(msg.name);
        // identidade (cp9): PIN + código de professor. Singleplayer dispensa
        // (mundo do próprio jogador) e todo join é professor.
        let papel: Papel = "professor";
        if (!this.singleplayer) {
          const denied = this.authenticate(name, msg.pin, msg.codigo);
          if (denied !== null) {
            this.send(
              clientId,
              JSON.stringify({ type: "join_denied", reason: denied } satisfies ServerMessage),
            );
            return;
          }
          papel = this.identity.get(name)?.papel ?? "aluno";
        }
        this.admitir(clientId, name, papel, false);
        break;
      }
      case "move": {
        const p = this.players.get(clientId);
        if (!p) return;
        // §🍖 F3: o passo sai da MESMA amostra que fecha a queda (10 Hz), antes
        // de a posição nova sobrescrever a antiga. Só o plano horizontal conta:
        // cair não é esforço (e já se paga em dano).
        const passo = Math.hypot(msg.x - p.x, msg.z - p.z);
        p.x = msg.x; p.y = msg.y; p.z = msg.z;
        p.yaw = msg.yaw; p.pitch = msg.pitch;
        // §🍖 F2: a queda se fecha AQUI — o servidor tem o mundo e não pergunta
        // ao cliente se pousou. Em criativo `machucar` é no-op.
        this.acompanharQueda(clientId, p);
        if (passo <= PASSO_MAX_POR_AMOSTRA) {
          this.esforcar(clientId, passo * EXAUSTAO_POR_BLOCO_ANDADO);
        }
        // Relay pros OUTROS (nunca ecoa pro autor — cliente não precisa saber
        // o próprio id). Validação de física vem depois do MVP.
        this.broadcastExcept(clientId, {
          type: "player_moved",
          id: clientId,
          x: msg.x, y: msg.y, z: msg.z,
          yaw: msg.yaw, pitch: msg.pitch,
          name: p.name,
        });
        // objetivo "chegar" (cp12/13): pisar dentro da região conclui
        this.checkChegar(clientId);
        break;
      }
      case "radius": {
        // F2 streaming: raio de interesse do cliente (config de desempenho).
        // Encolher o raio NÃO manda unload — cliente descarta pela mesma regra.
        const st = this.stream.get(clientId);
        if (!st) return; // mundo denso (ou sem join) — nada a fazer
        st.raio = Math.max(RAIO_MIN, Math.min(RAIO_MAX, msg.chunks));
        break;
      }
      case "pedir_coluna": {
        // §🔁 rede de segurança do streaming: o cliente viu um buraco dentro do
        // raio dele. NÃO existe caminho de envio paralelo — só ESQUECEMOS a
        // coluna e o `streamColunas` do tick seguinte reenvia pelo caminho
        // normal (mesmo lote, mesmo `colunasPorTick`).
        const st = this.stream.get(clientId);
        const p = this.players.get(clientId);
        if (!st || !p) return; // mundo denso (ou sem join) — nada a reenviar
        // teto por segundo: o comando chega pela rede da escola
        const agora = this.now();
        if (agora - st.pedidosDesde >= 1000) {
          st.pedidosDesde = agora;
          st.pedidos = 0;
        }
        if (++st.pedidos > PEDIDOS_COLUNA_POR_S) return;
        const dims = this.world.dims;
        if (msg.cx < 0 || msg.cz < 0 || msg.cx >= dims.x || msg.cz >= dims.z) return;
        // fora do raio de interesse = pedido sem sentido (o `streamColunas` nem
        // olharia essa coluna); a folga acompanha a regra de descarte
        const pcx = Math.max(0, Math.min(dims.x - 1, Math.floor(p.x / CHUNK_SIZE)));
        const pcz = Math.max(0, Math.min(dims.z - 1, Math.floor(p.z / CHUNK_SIZE)));
        if (Math.max(Math.abs(msg.cx - pcx), Math.abs(msg.cz - pcz)) > st.raio + FOLGA_DESCARTE) {
          return;
        }
        st.enviadas.delete(msg.cz * dims.x + msg.cx);
        break;
      }
      case "place_block": {
        const p = this.players.get(clientId);
        if (!p) return;
        if (!inBounds(this.world, msg.x, msg.y, msg.z)) return;
        if (!isPlaceable(msg.blockId)) return;
        // rocha-matriz é ferramenta de professor: aluno nem coloca (o cliente
        // já esconde, mas o servidor é a barreira real contra fio adulterado)
        if (isProfessorOnly(msg.blockId) && p.papel !== "professor") return;
        // §🍖 F4: em sobrevivência, colocar GASTA — e sem o bloco na mochila
        // não coloca. Aqui só o portão; o débito é depois do switch, junto com
        // o esforço, pra que os 4 ramos de materialização (porta, janela, cama,
        // comum) cobrem sozinhos. SILENCIOSO de propósito: o cliente tem o
        // inventário e apaga o slot vazio, então "não tenho" não é surpresa —
        // avisar no chat a cada clique viraria spam.
        if (
          this.inventarioVale(clientId) &&
          contar(this.inventarioDe(p.name), formaCanonica(msg.blockId)) < 1
        ) {
          return;
        }
        // célula precisa estar VAZIA ou com líquido substituível (água): colocar
        // por cima da água a troca direto, sem quebrar antes (decisão 2026-07-22).
        {
          const alvo = getBlock(this.world, msg.x, msg.y, msg.z);
          if (alvo !== BlockId.Air && !isReplaceable(alvo)) return;
        }
        if (!this.withinReach(p, msg.x, msg.y, msg.z)) return;
        if (this.overlapsAnyPlayer(msg.x, msg.y, msg.z)) return;
        // cp24/cp25: área protegida por outro aluno (claim) OU fora da área do
        // grupo (confinamento) — colocar barrado (porta ocupa 2 células, checa as
        // duas). Professor e dono/amigos passam; confinamento libera a área do grupo.
        {
          // blocos de 2 células checam TAMBÉM a 2ª célula: porta (vertical, y+1)
          // e cama (horizontal, direção da cabeceira).
          const camaDir = isCama(msg.blockId) ? camaHeadDir(msg.blockId) : null;
          const bloqueio =
            this.claimBloqueia(clientId, msg.x, msg.y, msg.z) ??
            (isPorta(msg.blockId) ? this.claimBloqueia(clientId, msg.x, msg.y + 1, msg.z) : null) ??
            (camaDir ? this.claimBloqueia(clientId, msg.x + camaDir.dx, msg.y, msg.z + camaDir.dz) : null) ??
            this.confinaBloqueia(clientId, msg.x, msg.y, msg.z) ??
            (isPorta(msg.blockId) ? this.confinaBloqueia(clientId, msg.x, msg.y + 1, msg.z) : null) ??
            (camaDir ? this.confinaBloqueia(clientId, msg.x + camaDir.dx, msg.y, msg.z + camaDir.dz) : null);
          if (bloqueio) {
            this.sendServerChat(clientId, bloqueio);
            return;
          }
        }
        if (isPorta(msg.blockId)) {
          // porta ocupa 2 células (cp23): valida o par ANTES de materializar
          const yCima = msg.y + 1;
          if (!inBounds(this.world, msg.x, yCima, msg.z)) return;
          const alvoCima = getBlock(this.world, msg.x, yCima, msg.z);
          if (alvoCima !== BlockId.Air && !isReplaceable(alvoCima)) return;
          if (this.overlapsAnyPlayer(msg.x, yCima, msg.z)) return;
          // dobradiça escolhida pelo mundo (parede/porta ao lado), não pelo
          // cliente — as 2 metades levam o MESMO id (par se reconhece por igualdade)
          const idPorta = this.escolherDobradica(
            msg.blockId, msg.x, msg.y, msg.z, 2, isPorta, portaEixoX, portaHingeAlta, portaComHinge,
          );
          this.applyBlock(msg.x, msg.y, msg.z, idPorta);
          this.applyBlock(msg.x, yCima, msg.z, idPorta);
          break;
        }
        if (isJanela(msg.blockId)) {
          // janela = 1 célula; dobradiça escolhida pelo mundo, igual à porta
          const idJanela = this.escolherDobradica(
            msg.blockId, msg.x, msg.y, msg.z, 1, isJanela, janelaEixoX, janelaHingeAlta, janelaComHinge,
          );
          this.applyBlock(msg.x, msg.y, msg.z, idJanela);
          break;
        }
        if (isCama(msg.blockId)) {
          // cama ocupa 2 células horizontais (pé + cabeceira): valida o par ANTES
          const { dx, dz } = camaHeadDir(msg.blockId);
          const hx = msg.x + dx;
          const hz = msg.z + dz;
          if (!inBounds(this.world, hx, msg.y, hz)) return;
          const alvoCama = getBlock(this.world, hx, msg.y, hz);
          if (alvoCama !== BlockId.Air && !isReplaceable(alvoCama)) return;
          if (this.overlapsAnyPlayer(hx, msg.y, hz)) return;
          this.applyBlock(msg.x, msg.y, msg.z, msg.blockId);
          this.applyBlock(hx, msg.y, hz, msg.blockId);
          break;
        }
        if (
          precisaApoio(msg.blockId) &&
          !apoioValido(msg.blockId, getBlock(this.world, msg.x, msg.y - 1, msg.z))
        ) {
          // tocha/tapete/flor exigem cubo cheio embaixo; a muda exige SOLO
          // (§🍖 F6) — mesma pergunta que a regra de vizinhança faz no tick,
          // pra não existir colocação que evapora no tick seguinte
          return;
        }
        this.applyBlock(msg.x, msg.y, msg.z, msg.blockId);
        break;
      }
      case "use_block": {
        const p = this.players.get(clientId);
        if (!p) return;
        if (!inBounds(this.world, msg.x, msg.y, msg.z)) return;
        if (!this.withinReach(p, msg.x, msg.y, msg.z)) return;
        const id = getBlock(this.world, msg.x, msg.y, msg.z);
        // §🍖 F10: container (fornalha, baú) — o clique direito ABRE, não
        // alterna. O gate de claim/confinamento vem ANTES de responder o
        // conteúdo (§🍖 F10f): ler o baú alheio é pior que mexer nele.
        if (containerTipoDe(id) !== null) {
          const bloqueio =
            this.claimBloqueia(clientId, msg.x, msg.y, msg.z) ??
            this.confinaBloqueia(clientId, msg.x, msg.y, msg.z);
          if (bloqueio) {
            this.sendServerChat(clientId, bloqueio);
            return;
          }
          this.containerAberto.set(clientId, { x: msg.x, y: msg.y, z: msg.z });
          this.sendContainer(clientId, msg.x, msg.y, msg.z);
          return;
        }
        if (!isInterativo(id)) return; // porta (cp23) e janela (2026-07-19)
        {
          const bloqueio =
            this.claimBloqueia(clientId, msg.x, msg.y, msg.z) ??
            this.confinaBloqueia(clientId, msg.x, msg.y, msg.z);
          if (bloqueio) {
            this.sendServerChat(clientId, bloqueio);
            return;
          }
        }
        const novo = interativoToggled(id);
        // par SÓ da porta (janela é 1 célula — duas janelas empilhadas com o
        // mesmo id NÃO são um par, alternariam juntas por engano)
        const yPar = !isPorta(id) ? null :
          getBlock(this.world, msg.x, msg.y + 1, msg.z) === id ? msg.y + 1 :
          getBlock(this.world, msg.x, msg.y - 1, msg.z) === id ? msg.y - 1 : null;
        // fechar não pode emparedar: jogador em qualquer célula da porta cancela
        if (isSolidBlock(novo)) {
          if (this.overlapsAnyPlayer(msg.x, msg.y, msg.z)) return;
          if (yPar !== null && this.overlapsAnyPlayer(msg.x, yPar, msg.z)) return;
        }
        this.applyBlock(msg.x, msg.y, msg.z, novo);
        if (yPar !== null) this.applyBlock(msg.x, yPar, msg.z, novo);
        break;
      }
      case "quadro_set": {
        // quadro (2026-07-19): editar conteúdo = mesma disciplina de editar
        // bloco (join, bounds, alcance, claim/confinamento)
        const p = this.players.get(clientId);
        if (!p) return;
        if (!inBounds(this.world, msg.x, msg.y, msg.z)) return;
        if (!this.withinReach(p, msg.x, msg.y, msg.z)) return;
        if (!isQuadro(getBlock(this.world, msg.x, msg.y, msg.z))) return;
        {
          const bloqueio =
            this.claimBloqueia(clientId, msg.x, msg.y, msg.z) ??
            this.confinaBloqueia(clientId, msg.x, msg.y, msg.z);
          if (bloqueio) {
            this.sendServerChat(clientId, bloqueio);
            return;
          }
        }
        const texto = msg.texto.trim().slice(0, MAX_QUADRO_TEXTO);
        const key = quadroKey(msg.x, msg.y, msg.z);
        if (!texto && !msg.imagem) {
          this.quadros.delete(key); // vazio = limpar o quadro
        } else {
          this.quadros.set(key, {
            x: msg.x, y: msg.y, z: msg.z, texto,
            ...(msg.imagem ? { imagem: msg.imagem } : {}),
          });
        }
        this.broadcast({
          type: "quadro_changed",
          x: msg.x, y: msg.y, z: msg.z, texto,
          ...(msg.imagem ? { imagem: msg.imagem } : {}),
        });
        break;
      }
      case "break_block": {
        const p = this.players.get(clientId);
        if (!p) return;
        if (!inBounds(this.world, msg.x, msg.y, msg.z)) return;
        const current = getBlock(this.world, msg.x, msg.y, msg.z);
        if (current === BlockId.Air) return;
        if (!isBreakable(current)) return; // bedrock: só /bloco remove
        if (!this.withinReach(p, msg.x, msg.y, msg.z)) return;
        // cp24/cp25: área protegida por outro aluno (claim) OU fora da área do
        // grupo (confinamento) — quebrar barrado
        {
          const bloqueio =
            this.claimBloqueia(clientId, msg.x, msg.y, msg.z) ??
            this.confinaBloqueia(clientId, msg.x, msg.y, msg.z);
          if (bloqueio) {
            this.sendServerChat(clientId, bloqueio);
            return;
          }
        }
        // §🍖 F10d: sem a ferramenta certa o bloco NÃO QUEBRA (decisão do
        // usuário; o Minecraft quebra sem drop, mas lá existe tempo de quebra
        // pra avisar antes — aqui é 1 clique, e "sumiu e não ganhei nada" é
        // frustração de aula). ANTES do applyBlock, como a recusa por mochila
        // cheia: recusa não pode deixar rastro no mundo. Criativo e mundo de
        // aula ficam de fora pelo portão que já existe (`inventarioVale`).
        if (this.inventarioVale(clientId)) {
          const falta = faltaFerramenta(this.inventarioDe(p.name), current);
          if (falta) {
            this.avisarComFreio(clientId, falta);
            return;
          }
        }
        // §🍖 F10: container com coisa dentro NÃO QUEBRA (decisão do usuário
        // pro baú, estendida à fornalha porque a regra é a mesma e a frase é a
        // mesma). Sem isto, um clique perdia a mochila inteira que o colega
        // guardou — e não existe item no chão pra devolver. Vale inclusive em
        // criativo: o professor que quebra um baú cheio também não quer isso.
        {
          const cont = this.containerDe(msg.x, msg.y, msg.z, current);
          if (cont && containerTemConteudo(cont)) {
            this.avisarContainerCheio(clientId);
            return;
          }
        }
        // §🍖 F4: quebrar DÁ o que a tabela diz — e, se não couber, NÃO QUEBRA.
        // Não existe item no chão (decisão travada no ROADMAP §🍖): recusar é
        // mais honesto que fazer o bloco evaporar. A conferência vem ANTES do
        // applyBlock justamente pra que a recusa não deixe rastro no mundo.
        const drops = this.inventarioVale(clientId) ? dropsDe(current) : [];
        if (drops.length && !GameSession.cabemTodos(this.inventarioDe(p.name), drops)) {
          this.avisarMochilaCheia(clientId);
          return;
        }
        this.applyBlock(msg.x, msg.y, msg.z, BlockId.Air);
        // Crédito DEPOIS do mundo mudar: a mochila e a célula andam juntas, e a
        // segunda metade da porta/cama, que o `doorRule`/`camaRule` apaga no
        // tick seguinte, NÃO passa por aqui (uma porta não vira duas).
        this.guardarDrops(clientId, drops);
        break;
      }
      case "balde": {
        // balde (2026-07-22): despeja/recolhe FONTE de água. Mesma disciplina
        // de place/break: join, bounds, alcance, claim/confinamento.
        const p = this.players.get(clientId);
        if (!p) return;
        if (!inBounds(this.world, msg.x, msg.y, msg.z)) return;
        if (!this.withinReach(p, msg.x, msg.y, msg.z)) return;
        {
          const bloqueio =
            this.claimBloqueia(clientId, msg.x, msg.y, msg.z) ??
            this.confinaBloqueia(clientId, msg.x, msg.y, msg.z);
          if (bloqueio) {
            this.sendServerChat(clientId, bloqueio);
            return;
          }
        }
        const alvo = getBlock(this.world, msg.x, msg.y, msg.z);
        // §🍖 F5: em sobrevivência o balde é ITEM da mochila. Confere ANTES de
        // mexer na água (senão a recusa deixaria rastro no mundo — a disciplina
        // da mochila cheia recusando a quebra): o slot informado tem de segurar
        // o balde do estado certo (vazio pra recolher, cheio pra despejar).
        const survival = this.inventarioVale(clientId);
        if (survival) {
          const precisa = msg.encher ? ITEM_BALDE_VAZIO : ITEM_BALDE_AGUA;
          if (msg.slot === undefined || this.inventarioDe(p.name)[msg.slot]?.id !== precisa) return;
        }
        if (msg.encher) {
          // balde VAZIO: só recolhe uma FONTE (o fluxo derivado seca sozinho)
          if (!isAguaFonte(alvo)) return;
          this.applyBlock(msg.x, msg.y, msg.z, BlockId.Air);
        } else {
          // balde CHEIO: célula vazia OU água substituível vira FONTE
          if (alvo !== BlockId.Air && !isReplaceable(alvo)) return;
          this.applyBlock(msg.x, msg.y, msg.z, BlockId.Agua);
        }
        // §🍖 F5: troca vazio↔cheio NO MESMO slot e reenvia a mochila (o cliente
        // não escreve o próprio inventário em sobrevivência).
        if (survival && msg.slot !== undefined) {
          const novo = msg.encher ? ITEM_BALDE_AGUA : ITEM_BALDE_VAZIO;
          this.inventarios.set(
            p.name,
            definirSlot(this.inventarioDe(p.name), msg.slot, { id: novo, qtd: 1 }),
          );
          this.sendInventario(clientId);
        }
        break;
      }
      case "comer": {
        // §🍖 F6: comer é a única ação que consome item SEM tocar no mundo — não
        // tem célula, não tem alcance, não tem claim. Só a mochila e a barra.
        const p = this.players.get(clientId);
        if (!p || !this.inventarioVale(clientId)) return;
        const item = this.inventarioDe(p.name)[msg.slot];
        if (!item || !isComida(item.id)) return;
        // barriga cheia RECUSA a mordida (senão o clique jogaria comida fora).
        // Com a regra `fome` desligada nunca há fome pra encher, então comer
        // vira no-op — e é o certo: mundo sem fome não gasta comida.
        if (!this.temFome()) return;
        const antes = this.vitalDe(p.name);
        const depois = saciar(antes, saciedadeDe(item.id));
        if (depois === antes) return; // barriga cheia (ou morto): não gasta
        const { inv, removido } = remover(this.inventarioDe(p.name), item.id, 1);
        if (!removido) return;
        // os dois lados mudam JUNTOS ou nenhum muda: a barra só sobe depois de
        // a comida sair da mochila de verdade
        this.inventarios.set(p.name, inv);
        this.vitais.set(p.name, depois);
        this.sendInventario(clientId);
        this.sendVida(clientId);
        break;
      }
      case "atacar": {
        // §🍖 F7: soco em outro jogador. O cliente manda só a INTENÇÃO (o id do
        // alvo); quem confere regra, modo, alcance e cooldown é aqui.
        this.atacar(clientId, msg.alvo);
        break;
      }
      case "mover_item": {
        // §🍖 F4: o aluno arruma a mochila. O cliente NÃO decide — manda os dois
        // índices e recebe o inventário inteiro de volta. `moverSlot` devolve o
        // mesmo objeto quando o movimento é impossível (índice do fio, origem
        // vazia, destino cheio), e aí nem mensagem sai.
        const p = this.players.get(clientId);
        if (!p || !this.inventarioVale(clientId)) return;
        const antes = this.inventarioDe(p.name);
        const depois = moverSlot(antes, msg.de, msg.para);
        if (depois === antes) return;
        this.inventarios.set(p.name, depois);
        this.sendInventario(clientId);
        break;
      }
      case "mover_container": {
        // §🍖 F10: transferência mochila↔container. O cliente manda dois
        // índices no espaço UNIFICADO e recebe os dois inventários de volta —
        // ele nunca escreve nem a mochila nem o baú.
        const p = this.players.get(clientId);
        if (!p || !this.inventarioVale(clientId)) return;
        // o aluno tem de estar com ESTE container aberto: sem isto, o fio podia
        // mexer em qualquer baú do mapa sem nunca ter chegado perto dele
        const aberto = this.containerAberto.get(clientId);
        if (!aberto || aberto.x !== msg.x || aberto.y !== msg.y || aberto.z !== msg.z) return;
        if (!inBounds(this.world, msg.x, msg.y, msg.z)) return;
        // alcance e claim RECONFERIDOS a cada movimento: quem abriu o baú e
        // saiu andando (ou perdeu o direito no meio) para aqui
        if (!this.withinReach(p, msg.x, msg.y, msg.z)) return;
        if (
          this.claimBloqueia(clientId, msg.x, msg.y, msg.z) ??
          this.confinaBloqueia(clientId, msg.x, msg.y, msg.z)
        ) {
          this.fecharContainer(clientId);
          return;
        }
        const atual = getBlock(this.world, msg.x, msg.y, msg.z);
        const cont = this.containerDe(msg.x, msg.y, msg.z, atual);
        if (!cont) return;
        const r = moverEntre(this.inventarioDe(p.name), cont, msg.de, msg.para);
        if (!r) return; // índice inválido, origem vazia, destino cheio/proibido
        this.inventarios.set(p.name, r.mochila);
        this.containers.set(containerKey(msg.x, msg.y, msg.z), r.container);
        this.sendInventario(clientId);
        // TODOS os que estão com este container aberto recebem o conteúdo novo
        // — senão um item some na cara do colega (o caso que a mochila não tem)
        this.avisarContainer(msg.x, msg.y, msg.z);
        break;
      }
      case "fechar_container": {
        this.containerAberto.delete(clientId);
        break;
      }
      case "fabricar": {
        // §🍖 F5: o aluno pediu uma receita pelo índice. O cliente NÃO decide —
        // o servidor confere ingredientes e espaço e responde com a mochila
        // inteira. Fora da sobrevivência (criativo tem paleta infinita) e
        // índice inválido são no-op silencioso, como o resto das ações.
        const p = this.players.get(clientId);
        if (!p || !this.inventarioVale(clientId) || !receitaValida(msg.receita)) return;
        const antes = this.inventarioDe(p.name);
        const depois = fabricar(antes, RECEITAS[msg.receita]!);
        if (depois === null) return; // faltou ingrediente ou mochila cheia
        this.inventarios.set(p.name, depois);
        this.sendInventario(clientId);
        break;
      }
      case "chat": {
        if (!this.players.has(clientId)) return;
        const text = msg.text.trim().slice(0, MAX_CHAT_LENGTH);
        if (!text) return;
        if (text.startsWith("/")) {
          // comando: executa no servidor, resposta SÓ pro autor
          this.sendServerChat(clientId, this.runCommand(clientId, text));
          return;
        }
        this.broadcast({ type: "chat", author: this.authorTag(clientId), text });
        break;
      }
      case "wand_mark": {
        const p = this.players.get(clientId);
        if (!p) return;
        // cp24: o aluno também marca cantos — pra criar CLAIM (quando a proteção
        // está ligada). Professor marca pra /regiao. Rejeita só o aluno sem
        // proteção ativa (não teria o que fazer com os cantos).
        if (p.papel !== "professor" && !this.claimsAtivo) {
          this.sendServerChat(clientId, "só o professor pode marcar regiões");
          return;
        }
        if (!inBounds(this.world, msg.x, msg.y, msg.z)) return;
        const marks = this.wandMarks.get(clientId) ?? {};
        const corner = { x: msg.x, y: msg.y, z: msg.z };
        if (msg.corner === 1) marks.c1 = corner;
        else marks.c2 = corner;
        this.wandMarks.set(clientId, marks);
        const pronto = marks.c1 && marks.c2;
        const dica = p.papel === "professor" ? " — agora /regiao criar nome" : " — agora /claim criar";
        this.sendServerChat(
          clientId,
          `canto ${msg.corner}: (${msg.x}, ${msg.y}, ${msg.z})` + (pronto ? dica : ""),
        );
        break;
      }
    }
    // §🍖 F3: UMA edição do jogador = um custo, mesmo quando ela materializa 2
    // células (porta, cama). Abrir porta (`use_block`) e teleoperação de
    // professor (`/bloco`, `/regiao encher`) NÃO cobram: não é o esforço do
    // aluno construindo.
    const mundoMudou = this.edicoesAplicadas > mudancasAntes;
    if (
      (msg.type === "place_block" || msg.type === "break_block" || msg.type === "balde") &&
      mundoMudou
    ) {
      this.esforcar(clientId, EXAUSTAO_POR_EDICAO);
    }
    // §🍖 F4: o DÉBITO mora no mesmo lugar e pelo mesmo motivo — "o mundo
    // mudou" é o mesmo que "a colocação valeu", e uma colocação que materializa
    // 2 células (porta, cama) custa UM item, não dois.
    if (msg.type === "place_block" && mundoMudou) {
      this.gastarItem(clientId, formaCanonica(msg.blockId));
    }
  }

  /**
   * Comandos de chat (prefixo "/"), resposta SÓ pro autor. Privilegiados
   * (/bloco, /resetpin) exigem papel professor (cp9). /bloco prova o
   * pipeline comando→estado→broadcast: a mudança sai como block_changed
   * normal e acorda as regras de vizinhança (areia cai), igual a qualquer
   * ação de jogador. Sem checagem de alcance: comando é teleoperação.
   */
  private runCommand(clientId: number, text: string): string {
    const parts = text.slice(1).split(/\s+/);
    const professor = this.players.get(clientId)?.papel === "professor";
    switch (parts[0]) {
      case "bloco": {
        if (!professor) return "Somente o professor pode usar /bloco.";
        const p = this.players.get(clientId);
        if (!p) return "Entre no mundo antes de usar /bloco.";
        const x = parseCoordArg(parts[1], Math.floor(p.x));
        const y = parseCoordArg(parts[2], Math.floor(p.y));
        const z = parseCoordArg(parts[3], Math.floor(p.z));
        const id = Number(parts[4]);
        if (parts.length !== 5 || x === null || y === null || z === null || !Number.isInteger(id)) {
          return "Uso: /bloco x y z id — coordenadas inteiras; o ~ copia a sua coordenada (~2 = a sua mais 2). O id 0 apaga o bloco; os demais seguem a ordem do inventário.";
        }
        if (!inBounds(this.world, x, y, z)) return `As coordenadas (${x}, ${y}, ${z}) estão fora do mundo.`;
        if (id !== BlockId.Air && !isPlaceable(id)) return `Não existe bloco com o id ${id}.`;
        if (isPorta(id)) return "A porta ocupa 2 blocos e se coloca com o clique direito, não por comando.";
        if (id !== BlockId.Air && this.overlapsAnyPlayer(x, y, z)) {
          return "Há um jogador nessa célula: o bloco não foi colocado.";
        }
        this.applyBlock(x, y, z, id);
        return `Bloco (${x}, ${y}, ${z}) definido como ${id}.`;
      }
      case "resetpin": {
        if (!professor) return "Somente o professor pode usar /resetpin.";
        const alvo = parts[1];
        if (parts.length !== 2 || !alvo) return "Uso: /resetpin nome.";
        const id = this.identity.get(alvo);
        if (!id?.pin) return `Ninguém entrou neste mundo com o nome "${alvo}" — não há PIN para apagar.`;
        id.pin = undefined;
        this.pinFails.delete(alvo); // destrava tentativas antigas junto
        return `PIN de "${alvo}" apagado. A próxima entrada com esse nome registra um novo PIN.`;
      }
      case "regiao": {
        if (!professor) return "Somente o professor pode usar /regiao.";
        return this.runRegiao(clientId, parts);
      }
      case "objetivo": {
        if (!professor) return "Somente o professor pode usar /objetivo.";
        return this.runObjetivo(parts);
      }
      case "grupo":
        return this.runGrupo(clientId, parts);
      case "tp": {
        if (!professor) {
          return "Somente o professor pode usar /tp. Para pedir teleporte até um colega, use /tpr nome.";
        }
        if (parts[1] === "grupos") return this.teleportarGrupos();
        return this.runTp(clientId, parts);
      }
      case "tpr":
        return this.runTpr(clientId, parts);
      case "tpa":
        return this.runTpa(clientId, parts);
      case "iniciar": {
        if (!professor) return "Somente o professor pode iniciar a atividade.";
        return this.runIniciar(clientId, parts);
      }
      case "hora": {
        // consultar a hora (`/hora` sem argumento) é de todos; MUDAR é do professor
        if (parts.length > 1 && !professor) return "Somente o professor pode mudar a hora do dia.";
        return this.runHora(parts, professor);
      }
      case "ciclo": {
        if (!professor) return "Somente o professor pode controlar o ciclo de dia e noite.";
        return this.runCiclo(parts);
      }
      case "voo": {
        if (!professor) return "Somente o professor pode liberar o voo. Você pode voar quando o professor liberar.";
        return this.runVoo(parts);
      }
      case "vento": {
        // consultar (`/vento` sem argumento) ALTERNA, então é do professor inteiro
        if (!professor) return "Somente o professor pode controlar o vento.";
        return this.runVento(parts);
      }
      case "modo": {
        // consultar (`/modo` sem argumento) é de TODOS — o aluno precisa saber
        // em que modo está; MUDAR é do professor
        if (parts.length > 1 && !professor) {
          return "Somente o professor pode mudar o modo de jogo. Use /modo para ver em qual você está.";
        }
        return this.runModo(clientId, parts);
      }
      case "regra": {
        if (parts.length > 2 && !professor) {
          return "Somente o professor pode mudar as regras do mundo. Use /regra para ver quais estão valendo.";
        }
        return this.runRegra(parts);
      }
      case "pvp": {
        // §🍖 F7: atalho pra `/regra pvp`, no molde do `/hora` — consultar é de
        // todos (o aluno precisa saber se pode apanhar), ligar/desligar é do
        // professor. Não é regra nova: é a MESMA entrada do registro.
        if (parts.length > 1 && !professor) {
          return "Somente o professor pode ligar ou desligar o ataque entre jogadores. Use /pvp para ver como está.";
        }
        return this.runPvp(parts);
      }
      case "dar": {
        if (!professor) return "Somente o professor pode usar /dar.";
        return this.runDar(clientId, parts);
      }
      case "claim":
        return this.runClaim(clientId, parts);
      case "amigos":
        return this.runAmigos(clientId, parts);
      case "confinar": {
        if (!professor) return "Somente o professor pode controlar o confinamento das áreas.";
        return this.runConfinar(parts);
      }
      default:
        return `Comando desconhecido: ${text}. Os comandos disponíveis são /bloco, /resetpin, /regiao, /objetivo, /grupo, /tp, /tpr, /tpa, /iniciar, /hora, /ciclo, /vento, /voo, /modo, /regra, /pvp, /claim, /amigos e /confinar.`;
    }
  }

  /** `/hora` (cp21): mostra (todos) ou ajusta (só professor) a hora do dia. */
  private runHora(parts: string[], professor: boolean): string {
    if (parts.length === 1) {
      return (
        `Agora são ${this.horaFormatada()} (${this.cicloAtivo ? "o tempo está passando" : "ciclo parado"}).` +
        (professor
          ? " Ajuste com /hora dia, /hora noite, /hora amanhecer, /hora entardecer, /hora meio-dia, /hora meia-noite ou /hora 0..23."
          : "")
      );
    }
    const alvo = (parts[1] ?? "").toLowerCase();
    const presets: Record<string, number> = {
      "meia-noite": 0,
      madrugada: 3,
      amanhecer: 6,
      manha: 8,
      manhã: 8,
      dia: 8,
      "meio-dia": 12,
      tarde: 15,
      entardecer: 18,
      noite: 21,
    };
    let h: number;
    if (alvo in presets) {
      h = presets[alvo]!;
    } else {
      const n = Number(alvo);
      if (!Number.isInteger(n) || n < 0 || n > 23) {
        return "Uso: /hora dia|noite|amanhecer|entardecer|meio-dia|meia-noite ou um número inteiro de 0 a 23.";
      }
      h = n;
    }
    this.horaDoDia = h;
    this.broadcastTime();
    return `Hora ajustada para ${this.horaFormatada()}.`;
  }

  /** `/ciclo` (cp21): liga/desliga o avanço do tempo. Sem argumento, alterna. */
  private runCiclo(parts: string[]): string {
    const arg = parts[1]?.toLowerCase();
    if (arg === "ligar" || arg === "on") this.cicloAtivo = true;
    else if (arg === "desligar" || arg === "off") this.cicloAtivo = false;
    else if (arg === undefined) this.cicloAtivo = !this.cicloAtivo;
    else return "Uso: /ciclo ligar ou /ciclo desligar (sem argumento, alterna).";
    this.broadcastTime();
    return this.cicloAtivo
      ? "Ciclo de dia e noite ativado — o tempo passa."
      : `Ciclo de dia e noite parado em ${this.horaFormatada()}.`;
  }

  /** Hora do dia como "08h30" (leitura do professor no chat). */
  private horaFormatada(): string {
    const h = Math.floor(this.horaDoDia) % 24;
    const m = Math.floor((this.horaDoDia - Math.floor(this.horaDoDia)) * 60);
    return `${String(h).padStart(2, "0")}h${String(m).padStart(2, "0")}`;
  }

  private sendTime(clientId: number): void {
    this.send(
      clientId,
      JSON.stringify({
        type: "time",
        hora: +this.horaDoDia.toFixed(3),
        ciclo: this.cicloAtivo,
      } satisfies ServerMessage),
    );
  }

  private broadcastTime(): void {
    this.broadcast({ type: "time", hora: +this.horaDoDia.toFixed(3), ciclo: this.cicloAtivo });
  }

  /** `/vento` (§🌬️): liga/desliga o vento. Sem argumento, alterna (molde do
   *  /ciclo). NÃO há ajuste manual de direção/força — o vento é procedural
   *  (decisão do usuário, 2026-07-27): o professor só escolhe entre cenário
   *  vivo e cenário parado. */
  private runVento(parts: string[]): string {
    const arg = parts[1]?.toLowerCase();
    if (arg === "ligar" || arg === "on") this.ventoAtivo = true;
    else if (arg === "desligar" || arg === "off") this.ventoAtivo = false;
    else if (arg === undefined) this.ventoAtivo = !this.ventoAtivo;
    else return "Uso: /vento ligar ou /vento desligar (sem argumento, alterna).";
    this.broadcastVento();
    if (!this.ventoAtivo) return "Vento desligado — água, nuvens e folhas param.";
    const v = this.ventoAgora();
    return `Vento ligado: ${ventoIntensidade(v.forca)} soprando para ${ventoRumo(v.dir)}.`;
  }

  /** Vento AGORA: função pura do tick + seed quando ligado, calmaria quando não.
   *  Fonte única — o comando, o join e o broadcast leem daqui. */
  private ventoAgora(): Vento {
    return this.ventoAtivo ? ventoNoTick(this.tickCount, this.seed) : VENTO_PARADO;
  }

  private ventoMsg(): ServerMessage {
    const v = this.ventoAgora();
    return {
      type: "vento",
      dir: +v.dir.toFixed(3),
      forca: +v.forca.toFixed(3),
      ativo: this.ventoAtivo,
    };
  }

  private sendVento(clientId: number): void {
    this.send(clientId, JSON.stringify(this.ventoMsg()));
  }

  private broadcastVento(): void {
    this.broadcast(this.ventoMsg());
  }

  /** `/voo`: libera/tranca o voo criativo pra TURMA. Sem argumento, alterna.
   *  O professor voa sempre (independe disto). */
  private runVoo(parts: string[]): string {
    const arg = parts[1]?.toLowerCase();
    if (arg === "ligar" || arg === "on") this.vooLiberado = true;
    else if (arg === "desligar" || arg === "off") this.vooLiberado = false;
    else if (arg === undefined) this.vooLiberado = !this.vooLiberado;
    else return "Uso: /voo ligar ou /voo desligar (sem argumento, alterna).";
    this.broadcastVoo();
    return this.vooLiberado
      ? "Voo liberado para a turma — dê dois toques no espaço para voar; espaço sobe e agachar desce."
      : "Voo trancado para a turma (você continua podendo voar).";
  }

  private sendVoo(clientId: number): void {
    this.send(clientId, JSON.stringify({ type: "voo", liberado: this.vooLiberado } satisfies ServerMessage));
  }

  private broadcastVoo(): void {
    this.broadcast({ type: "voo", liberado: this.vooLiberado });
  }

  // --- §🍖 F1: modo de jogo -------------------------------------------------

  /** Modo EFETIVO de um jogador pelo NOME: o override pessoal vence o mundo. */
  private modoDe(nome: string): Modo {
    return modoEfetivo(this.modoMundo, this.modosPorJogador.get(nome));
  }

  /** Modo efetivo de cada jogador ONLINE agora — fotografia pra comparar depois
   *  da mudança e avisar SÓ quem realmente mudou (mesma disciplina do dedup dos
   *  broadcasts de estado: nada de churn pra quem ficou igual). */
  private modosAgora(): Map<number, Modo> {
    const m = new Map<number, Modo>();
    for (const [clientId, p] of this.players) m.set(clientId, this.modoDe(p.name));
    return m;
  }

  private sendModo(clientId: number): void {
    const p = this.players.get(clientId);
    if (!p) return;
    this.send(
      clientId,
      JSON.stringify({
        type: "modo",
        efetivo: this.modoDe(p.name),
        // §🍖 F7: viaja junto porque é a MESMA pergunta ("como se joga aqui") e
        // porque a mira precisa saber, sem mensagem nova no protocolo
        pvp: this.temPvp(),
      } satisfies ServerMessage),
    );
  }

  /** Avisa quem MUDOU de modo (msg `modo` + uma linha no chat). O autor do
   *  comando recebe só a mensagem de protocolo — a confirmação em texto dele é
   *  o retorno do próprio comando, e duas linhas iguais confundem. */
  private avisarModos(antes: ReadonlyMap<number, Modo>, autorId: number): void {
    for (const [clientId, p] of this.players) {
      const agora = this.modoDe(p.name);
      if (antes.get(clientId) === agora) continue;
      this.sendModo(clientId);
      // §🍖 F2: quem estava VOANDO em criativo tem um pico de queda antigo
      // guardado; entrar em sobrevivência não pode cobrar essa altura
      this.picoQueda.set(clientId, p.y);
      if (agora === "sobrevivencia") {
        this.sendVida(clientId);
        // §🍖 F4: a mochila aparece na hora que ele entra em sobrevivência —
        // o cliente troca a paleta infinita pelo inventário de verdade e
        // precisa saber COM O QUE está entrando (rejoin traz a de ontem).
        this.sendInventario(clientId);
      }
      if (clientId === autorId) continue;
      this.sendServerChat(
        clientId,
        agora === "sobrevivencia"
          ? "Você entrou no modo sobrevivência — nele não dá para voar."
          : "Você voltou para o modo criativo.",
      );
    }
  }

  /**
   * `/modo` (§🍖 F1). Consultar é de todos; mudar é do professor (o dispatcher
   * já barrou o aluno). Semântica fixada com o usuário em 2026-07-27:
   *   /modo                  → mostra o do mundo e o seu
   *   /modo <modo>           → padrão do MUNDO (quem tem ajuste pessoal segue nele)
   *   /modo <modo> eu        → só quem digitou (demonstrar sem mexer na turma)
   *   /modo <modo> nome      → ajuste pessoal de um jogador (vence o do mundo)
   *   /modo <modo> all       → padrão do mundo + APAGA todos os ajustes pessoais
   * O `all` não pega o professor que digitou: ele fica como está (e se muda com
   * `eu`) — é ele que precisa continuar voando pra supervisionar a turma.
   */
  private runModo(clientId: number, parts: string[]): string {
    const p = this.players.get(clientId);
    if (!p) return "Entre no mundo antes de usar /modo.";
    const professor = p.papel === "professor";
    if (parts.length === 1) {
      const meu = this.modoDe(p.name);
      const linha =
        `O mundo está em modo ${nomeModo(this.modoMundo)} e você está em ${nomeModo(meu)}` +
        (this.modosPorJogador.has(p.name) ? " (ajuste pessoal)." : ".");
      return professor
        ? `${linha} Mude com /modo criativo|sobrevivencia (o mundo), /modo <modo> eu, /modo <modo> nome ou /modo <modo> all.`
        : linha;
    }
    if (this.somenteLeitura) {
      return "Este é um mundo de aula: ele é sempre criativo, e o modo não se troca aqui.";
    }
    const novo = parseModo(parts[1]);
    if (!novo || parts.length > 3) {
      return "Uso: /modo criativo|sobrevivencia [eu | all | nome do aluno]. Sem o terceiro termo, muda o padrão do mundo.";
    }
    const alvo = parts[2];
    const antes = this.modosAgora();

    if (alvo === undefined) {
      this.modoMundo = novo;
      this.avisarModos(antes, clientId);
      const presos = this.modosPorJogador.size;
      return (
        `Modo do mundo agora é ${nomeModo(novo)}.` +
        (presos
          ? ` ${presos} jogador(es) seguem com ajuste pessoal — use /modo ${parts[1]} all para apagar os ajustes.`
          : "")
      );
    }

    if (alvo === "all" || alvo === "todos") {
      // o autor não é arrastado junto: guarda o modo dele como ajuste pessoal
      // (só se for diferente do novo padrão — senão o save ganharia ruído)
      const meuAtual = this.modoDe(p.name);
      this.modosPorJogador.clear();
      this.modoMundo = novo;
      if (meuAtual !== novo) this.modosPorJogador.set(p.name, meuAtual);
      this.avisarModos(antes, clientId);
      return (
        `Modo ${nomeModo(novo)} aplicado a TODA a turma (agora e para quem entrar). ` +
        `Você continua em ${nomeModo(meuAtual)} — use /modo ${parts[1]} eu para acompanhar a turma.`
      );
    }

    const alvoNome = alvo === "eu" ? p.name : this.acharNomeConhecido(alvo);
    if (alvoNome === null) {
      return `Ninguém chamado "${alvo.replace(/^@/, "")}" neste mundo. Use /modo ${parts[1]} eu, /modo ${parts[1]} all ou o nome exato do aluno.`;
    }
    // ajuste pessoal só existe pra quem está DIFERENTE do mundo: igual ao padrão
    // = volta a seguir o mundo (mesmo efeito hoje, e o save fica enxuto)
    if (novo === this.modoMundo) this.modosPorJogador.delete(alvoNome);
    else this.modosPorJogador.set(alvoNome, novo);
    this.avisarModos(antes, clientId);
    const online = this.jogadoresConectados().some((j) => j.name === alvoNome);
    return (
      `${alvoNome === p.name ? "Você está" : `${alvoNome} está`} em modo ${nomeModo(novo)}.` +
      (online ? "" : " (ele não está conectado agora — vale quando entrar.)")
    );
  }

  /** Nome de jogador que o MUNDO conhece (online ou lembrado no roster), sem
   *  diferenciar maiúsculas e aceitando o `@nome` da tabela do comando. Devolve
   *  o nome como o mundo o guarda — é ele que vai pro save. */
  private acharNomeConhecido(digitado: string): string | null {
    const alvo = digitado.replace(/^@/, "").toLowerCase();
    if (!alvo) return null;
    for (const p of this.players.values()) {
      if (p.name.toLowerCase() === alvo) return p.name;
    }
    for (const nome of this.roster.keys()) {
      if (nome.toLowerCase() === alvo) return nome;
    }
    return null;
  }

  /**
   * `/regra` (§🍖 F1) — registro genérico de regras de mundo, no molde do
   * `/gamerule`. Listar/consultar é de todos; mudar é do professor (o
   * dispatcher já barrou o aluno). Regra nova = uma entrada em `regras.ts`,
   * sem comando novo e sem campo novo no save.
   */
  private runRegra(parts: string[]): string {
    if (parts.length === 1) {
      const lista = REGRAS.map(
        (r) => `${r.nome}: ${valorRegra(this.regras, r.nome) ? "ligada" : "desligada"}`,
      ).join(" · ");
      return `Regras deste mundo — ${lista}. Veja o que cada uma faz com /regra nome; mude com /regra nome ligar|desligar.`;
    }
    const nome = (parts[1] ?? "").toLowerCase();
    const def = regraDef(nome);
    if (!def) {
      return `Não existe a regra "${parts[1]}". As regras são: ${REGRAS.map((r) => r.nome).join(", ")}.`;
    }
    const atual = valorRegra(this.regras, nome);
    if (parts.length === 2) {
      return `${nome} está ${atual ? "ligada" : "desligada"} (padrão: ${def.padrao ? "ligada" : "desligada"}). ${def.ajuda}`;
    }
    const arg = (parts[2] ?? "").toLowerCase();
    let valor: boolean;
    if (arg === "ligar" || arg === "on") valor = true;
    else if (arg === "desligar" || arg === "off") valor = false;
    else return `Uso: /regra ${nome} ligar|desligar.`;
    if (parts.length > 3) return `Uso: /regra ${nome} ligar|desligar.`;
    // guarda SÓ o que difere do padrão do registro (ver regras.ts)
    if (valor === def.padrao) this.regras.delete(nome);
    else this.regras.set(nome, valor);
    if (valor === atual) return `A regra ${nome} já estava ${valor ? "ligada" : "desligada"}.`;
    // §🍖 F3: as coxas aparecem (ou somem) na hora — o HUD só conhece a fome
    // pelo campo da mensagem `vida`, então quem está em sobrevivência recebe uma
    if (nome === "fome") {
      for (const [id, j] of this.players) {
        if (this.modoDe(j.name) === "sobrevivencia") this.sendVida(id);
      }
    }
    // §🍖 F7: pelo `/regra pvp` o aviso à turma é o MESMO do `/pvp` — quem
    // apanha sem saber que ligou acha que é bug. Os dois comandos escrevem no
    // mesmo mapa; só o texto da resposta ao professor difere.
    if (nome === "pvp") this.anunciarPvp(valor);
    // regra ainda sem mecânica (F4 e F7) avisa; a `fome` parou de avisar no F3,
    // senão o professor liga, vê a barra andar e desconfia do que o jogo diz
    return (
      `Regra ${nome} ${valor ? "ligada" : "desligada"} e gravada neste mundo.` +
      (def.pendente ? " (Ela só passa a valer quando a mecânica correspondente existir.)" : "")
    );
  }

  /**
   * `/pvp` (§🍖 F7) — atalho de professor pra a regra `pvp`, no molde do
   * `/hora`. Escreve na MESMA `this.regras`, então `/regra pvp` e `/pvp` não
   * podem discordar, e o valor viaja no save pelo caminho que já existia.
   *
   * Mundo de aula responde a verdade e não muda nada: lá o pvp é desligado pelo
   * host, como o modo criativo (recusar calado faria o professor achar que
   * ligou).
   */
  private runPvp(parts: string[]): string {
    const def = regraDef("pvp")!;
    const atual = this.temPvp();
    if (parts.length === 1) {
      return this.somenteLeitura
        ? "Este é um mundo de aula: ninguém se ataca aqui, e isso não se troca."
        : `O ataque entre jogadores está ${atual ? "LIGADO" : "desligado"}. ${def.ajuda} Mude com /pvp ligar ou /pvp desligar.`;
    }
    if (parts.length > 2) return "Uso: /pvp ligar ou /pvp desligar.";
    const arg = (parts[1] ?? "").toLowerCase();
    let valor: boolean;
    if (arg === "ligar" || arg === "on") valor = true;
    else if (arg === "desligar" || arg === "off") valor = false;
    else return "Uso: /pvp ligar ou /pvp desligar.";
    if (this.somenteLeitura) {
      return "Este é um mundo de aula: ninguém se ataca aqui, e isso não se troca.";
    }
    if (valor === def.padrao) this.regras.delete("pvp");
    else this.regras.set("pvp", valor);
    if (valor === atual) return `O ataque entre jogadores já estava ${valor ? "ligado" : "desligado"}.`;
    this.anunciarPvp(valor);
    return `Ataque entre jogadores ${valor ? "ligado" : "desligado"} e gravado neste mundo.`;
  }

  /** A turma inteira precisa saber que o pvp mudou — quem apanha sem aviso acha
   *  que é bug —, e cada cliente recebe o `modo` de novo porque é ele que
   *  carrega o `pvp` da mira (§🍖 F7). */
  private anunciarPvp(valor: boolean): void {
    this.broadcast({
      type: "chat",
      author: "servidor",
      text: valor
        ? "O professor LIGOU o ataque entre jogadores (só em sobrevivência)."
        : "O professor desligou o ataque entre jogadores.",
    });
    for (const clientId of this.players.keys()) this.sendModo(clientId);
  }

  // --- §🍖 F2/F3: vida, dano, morte, fome -----------------------------------

  /** Estado vital de um NOME (nasce cheio na primeira vez que alguém pergunta). */
  private vitalDe(nome: string): EstadoVital {
    let e = this.vitais.get(nome);
    if (!e) {
      e = novoEstadoVital();
      this.vitais.set(nome, e);
    }
    return e;
  }

  /** A vida vale pra este cliente? SÓ em sobrevivência — criativo não machuca
   *  (é o mesmo mundo, a mesma física: o que muda é o modo do jogador). */
  private vidaVale(clientId: number): boolean {
    const p = this.players.get(clientId);
    return !!p && this.modoDe(p.name) === "sobrevivencia";
  }

  /** Bolhas de ar que o HUD desenha (0..10) — é a granularidade que decide se
   *  vale mandar mensagem, senão o fôlego geraria 10 msg/s por jogador. */
  private static bolhas(folego: number): number {
    return Math.max(0, Math.ceil(folego / (FOLEGO_TICKS / 10)));
  }

  private sendVida(
    clientId: number,
    extra: { causa?: CausaDano; morreu?: boolean } = {},
  ): void {
    const p = this.players.get(clientId);
    if (!p) return;
    const e = this.vitalDe(p.name);
    this.send(
      clientId,
      JSON.stringify({
        type: "vida",
        vida: e.vida,
        folego: Math.max(0, e.folego),
        // §🍖 F3: com a regra `fome` desligada o campo NÃO vai, e é assim que o
        // cliente sabe não desenhar coxa nenhuma (mundo sem fome não mostra
        // barra vazia nem barra cheia — mostra nada)
        ...(this.temFome() ? { fome: e.fome } : {}),
        ...extra,
      } satisfies ServerMessage),
    );
  }

  /** A fome vale neste mundo? (§🍖 F3 — regra de mundo, ligada por padrão; o
   *  professor desliga pro fundamental 1 com `/regra fome desligar`.) */
  private temFome(): boolean {
    return valorRegra(this.regras, "fome");
  }

  /**
   * §🍖 F3: gasta esforço de UM jogador — andar, editar bloco, regenerar. A
   * conversão de esforço em ponto de fome é do módulo puro; aqui só ficam os
   * dois portões (sobrevivência e a regra `fome`) e a decisão de avisar o
   * cliente, que só acontece quando a barra DESENHADA muda de número.
   */
  private esforcar(clientId: number, esforco: number): void {
    if (!this.vidaVale(clientId) || !this.temFome()) return;
    const p = this.players.get(clientId);
    if (!p) return;
    const antes = this.vitalDe(p.name);
    const depois = gastarEsforco(antes, esforco);
    if (depois === antes) return;
    this.vitais.set(p.name, depois);
    if (depois.fome !== antes.fome) this.sendVida(clientId);
  }

  /**
   * A ÚNICA porta de perda de vida do servidor. Queda e afogamento (lite), fome
   * (F3), PvP (F7) e mob (F8) entram todos por aqui — quem chama só diz quanto e
   * por quê. Fora da sobrevivência é no-op.
   *
   * `porQuem` (§🍖 F7) só existe pro texto da morte: é o NOME de quem bateu.
   */
  private machucar(clientId: number, pontos: number, causa: CausaDano, porQuem?: string): void {
    if (!this.vidaVale(clientId)) return;
    const p = this.players.get(clientId);
    if (!p) return;
    const r = aplicarDano(this.vitalDe(p.name), pontos, causa);
    if (r.aplicado === 0) return;
    this.vitais.set(p.name, r.estado);
    this.sendVida(clientId, { causa, ...(r.morreu ? { morreu: true } : {}) });
    if (r.morreu) this.matar(clientId, causa, porQuem);
  }

  // --- §🍖 F7: pvp ----------------------------------------------------------

  /**
   * O pvp vale neste mundo? Regra de mundo (padrão DESLIGADA), **e mundo de
   * aula/atividade força DESLIGADO**, do mesmo jeito que força criativo: a aula
   * distribui um modelo pra turma construir, e uma pancadaria no meio dela é
   * problema de sala, não jogo. Como a aula é read-only, a regra nem chega a
   * ser gravada — ela só não vale enquanto o mundo for de aula.
   */
  private temPvp(): boolean {
    return !this.somenteLeitura && valorRegra(this.regras, "pvp");
  }

  /**
   * Um soco (§🍖 F7). Recusa CALADA em quase tudo — a única exceção é o pvp
   * desligado, que ganha aviso com freio: sem ele o aluno bate, não acontece
   * nada e conclui que o jogo travou.
   *
   * O que é conferido, nesta ordem: os dois existem e não são a mesma pessoa ·
   * o pvp vale · **os DOIS estão em sobrevivência** (o professor supervisionando
   * em criativo não bate nem apanha — é o mesmo portão da vida e da mochila) ·
   * o alvo está vivo · alcance · cooldown.
   *
   * ⚠️ O alcance é medido entre as POSIÇÕES dos dois, não pela linha do olhar:
   * a direção chega a 10 Hz e a caixa do alvo desliza no cliente (lerp), então
   * validar mira aqui recusaria soco legítimo. Quem mira é o cliente; o
   * servidor garante que ninguém soca do outro lado do mapa.
   */
  private atacar(clientId: number, alvoId: number): void {
    const p = this.players.get(clientId);
    const alvo = this.players.get(alvoId);
    if (!p || !alvo || clientId === alvoId) return;
    if (!this.temPvp()) {
      this.avisarPvpDesligado(clientId);
      return;
    }
    // os dois têm de estar em sobrevivência: quem está em criativo não machuca
    // (não tem vida pra perder) nem é machucado
    if (!this.vidaVale(clientId) || !this.vidaVale(alvoId)) return;
    if (!estaVivo(this.vitalDe(alvo.name))) return;
    const dist = Math.hypot(alvo.x - p.x, alvo.y - p.y, alvo.z - p.z);
    if (dist > PLAYER_REACH + 2) return; // mesma folga do withinReach (10 Hz)
    const ultimo = this.ultimoAtaque.get(clientId) ?? -Infinity;
    if (this.tickCount - ultimo < TICKS_ENTRE_ATAQUES) return;
    this.ultimoAtaque.set(clientId, this.tickCount);
    this.machucar(alvoId, DANO_PVP, "pvp", p.name);
  }

  /** Aviso de "o pvp está desligado" com FREIO — bater é clique repetido, e sem
   *  teto o chat da aula viraria parede de texto (mesma disciplina do aviso de
   *  mochila cheia). */
  private avisarPvpDesligado(clientId: number): void {
    const agora = this.now();
    const ultimo = this.avisoPvp.get(clientId) ?? -Infinity;
    if (agora - ultimo < AVISO_MOCHILA_MS) return;
    this.avisoPvp.set(clientId, agora);
    this.sendServerChat(
      clientId,
      this.somenteLeitura
        ? "Mundo de aula: aqui ninguém se ataca."
        : "O ataque entre jogadores está desligado neste mundo (o professor liga com /pvp ligar).",
    );
  }

  /**
   * Morte: avisa a TURMA (o professor precisa ver o que aconteceu), devolve o
   * jogador inteiro ao spawn autoritativo do mundo e reabre o fôlego.
   *
   * O inventário na morte é a regra `manter-inventario` do F1 — ela nasce
   * LIGADA e, sem inventário autoritativo (F4), não há o que perder ainda. É
   * aqui que o F4 vai ler `valorRegra(this.regras, "manter-inventario")`.
   */
  private matar(clientId: number, causa: CausaDano, porQuem?: string): void {
    const p = this.players.get(clientId);
    if (!p) return;
    this.broadcast({
      type: "chat",
      author: "servidor",
      text: textoDaMorte(p.name, causa, porQuem),
    });
    this.vitais.set(p.name, novoEstadoVital());
    // §🍖 F4: aqui a regra `manter-inventario` finalmente decide alguma coisa.
    // LIGADA (o padrão de escola) = não se perde nada. DESLIGADA = a mochila
    // some, e some MESMO: não existe baú nem item no chão pra virar túmulo (o
    // ramo barato de propósito, anotado no ROADMAP §🍖 desde 2026-07-27).
    if (!valorRegra(this.regras, "manter-inventario")) {
      this.inventarios.delete(p.name);
      this.sendInventario(clientId);
    }
    this.teleportar(clientId, this.spawn.x, this.spawn.y, this.spawn.z);
    this.sendVida(clientId); // vida cheia de novo, agora sem causa
  }

  // --- §🍖 F4: inventário autoritativo ---------------------------------------

  /** Mochila de um NOME (nasce vazia na primeira vez que alguém pergunta). */
  private inventarioDe(nome: string): Inventario {
    let i = this.inventarios.get(nome);
    if (!i) {
      i = inventarioVazio();
      this.inventarios.set(nome, i);
    }
    return i;
  }

  /** O inventário FINITO vale pra este cliente? Mesmo portão da vida: só
   *  sobrevivência. Criativo segue com a paleta infinita do cliente, intocado —
   *  é o mesmo mundo, o que muda é o modo do jogador. */
  private inventarioVale(clientId: number): boolean {
    return this.vidaVale(clientId);
  }

  private sendInventario(clientId: number): void {
    const p = this.players.get(clientId);
    if (!p) return;
    this.send(
      clientId,
      JSON.stringify({
        type: "inventario",
        slots: inventarioParaSave(this.inventarioDe(p.name)),
      } satisfies ServerMessage),
    );
  }

  /** Forma esparsa pro roster do save — `undefined` se a mochila está vazia
   *  (mundo criativo não engorda o `.ljw` com 27 nulos por aluno). */
  private inventarioParaRoster(nome: string): SlotSalvo[] | undefined {
    const i = this.inventarios.get(nome);
    if (!i || estaVazio(i)) return undefined;
    return inventarioParaSave(i);
  }

  /**
   * Gasta UMA unidade do id ao colocar bloco. Fora da sobrevivência é no-op —
   * é o que mantém criativo intocado sem um `if` em cada ramo do `place_block`.
   * O id que sai da mochila é a FORMA CANÔNICA: o aluno guarda "porta", não
   * "porta do eixo Z aberta com dobradiça alta".
   */
  private gastarItem(clientId: number, id: number): void {
    if (!this.inventarioVale(clientId)) return;
    const p = this.players.get(clientId);
    if (!p) return;
    const { inv, removido } = remover(this.inventarioDe(p.name), id, 1);
    if (!removido) return;
    this.inventarios.set(p.name, inv);
    this.sendInventario(clientId);
  }

  /**
   * As pilhas cabem TODAS na mochila? Simula guardar uma a uma, porque duas
   * pilhas do mesmo id disputam o mesmo espaço — somar `espacoPara` de cada uma
   * contaria o slot vazio duas vezes.
   */
  private static cabemTodos(inv: Inventario, pilhas: readonly { id: number; qtd: number }[]): boolean {
    let atual = inv;
    for (const d of pilhas) {
      if (!cabe(atual, d.id, d.qtd)) return false;
      atual = adicionar(atual, d.id, d.qtd).inv;
    }
    return true;
  }

  /** Guarda o que caiu (já conferido por `cabemTodos`) e avisa o cliente. */
  private guardarDrops(clientId: number, pilhas: readonly { id: number; qtd: number }[]): void {
    const p = this.players.get(clientId);
    if (!p || !pilhas.length) return;
    let inv = this.inventarioDe(p.name);
    for (const d of pilhas) inv = adicionar(inv, d.id, d.qtd).inv;
    this.inventarios.set(p.name, inv);
    this.sendInventario(clientId);
  }

  /**
   * `/dar <quem> <id> [qtd]` — o professor enche a mochila de um aluno (ou da
   * turma). É a contraparte do `/bloco`: com o inventário AUTORITATIVO, o mundo
   * de sobrevivência começa com todo mundo de mãos vazias, e sem este comando o
   * professor não tem como preparar uma atividade nem consertar um acidente.
   * Teleoperação, como o `/bloco`: não custa esforço, não exige alcance.
   *
   * `<quem>` = `eu` · `all` · nome do aluno (o mesmo casamento do `/modo`).
   * `<id>` = número, igual ao `/bloco` (o cliente mostra o id no inventário).
   */
  private runDar(clientId: number, parts: string[]): string {
    const p = this.players.get(clientId);
    if (!p) return "Entre no mundo antes de usar /dar.";
    const alvo = parts[1]?.toLowerCase();
    const id = Number(parts[2]);
    const qtd = parts.length === 4 ? Number(parts[3]) : 1;
    if (parts.length < 3 || parts.length > 4 || !alvo || !Number.isInteger(id)) {
      return "Uso: /dar eu|all|nome id [quantidade] — o id segue a ordem do inventário, igual ao /bloco.";
    }
    // §🍖 F6: bloco OU item conhecido. Sem isto o professor não consegue dar
    // comida — e dar comida é a versão de sala de aula do "consertar acidente"
    // que justificou o /dar no F4.
    if (!isPlaceable(id) && !isItem(id)) return `Não existe item com o id ${id}.`;
    if (!Number.isInteger(qtd) || qtd < 1 || qtd > MAX_DAR_QTD) {
      return `Quantidade inválida: use de 1 a ${MAX_DAR_QTD}.`;
    }

    const nomes =
      alvo === "all" || alvo === "todos"
        ? this.jogadoresConectados().map((j) => j.name)
        : [alvo === "eu" ? p.name : this.acharNomeConhecido(alvo)].filter(
            (n): n is string => n !== null,
          );
    if (!nomes.length) {
      return `Ninguém chamado "${parts[1]?.replace(/^@/, "")}" neste mundo. Use /dar eu, /dar all ou o nome exato do aluno.`;
    }

    const cheias: string[] = [];
    let entregues = 0;
    for (const nome of nomes) {
      const { inv, sobra } = adicionar(this.inventarioDe(nome), id, qtd);
      if (sobra === qtd) {
        cheias.push(nome);
        continue;
      }
      this.inventarios.set(nome, inv);
      entregues++;
      // quem está online E em sobrevivência vê a mochila mudar na hora; quem
      // está em criativo recebe calado (o item fica guardado pra quando trocar)
      for (const [cid, j] of this.players) {
        if (j.name === nome && this.modoDe(nome) === "sobrevivencia") this.sendInventario(cid);
      }
      if (sobra) cheias.push(`${nome} (só ${qtd - sobra})`);
    }
    if (!entregues) return `Mochila cheia: ${cheias.join(", ")} não coube nada.`;
    return (
      `Entregue ${qtd}× do item ${id} para ${nomes.length === 1 ? nomes[0] : `${entregues} jogador(es)`}.` +
      (cheias.length ? ` Mochila cheia: ${cheias.join(", ")}.` : "") +
      (this.modoMundo === "criativo" ? " (O mundo está em criativo — a mochila só aparece em sobrevivência.)" : "")
    );
  }

  /**
   * Aviso da QUEBRA com FREIO. Quebrar é gesto de clique repetido, e sem teto o
   * chat da aula viraria uma parede de texto igual — um por `AVISO_MOCHILA_MS`
   * por aluno basta pra ele entender e resolver.
   *
   * O freio é UM por jogador, e não um por motivo: quem está com a mochila
   * cheia E sem picareta não precisa levar dois avisos no mesmo instante.
   */
  private avisarComFreio(clientId: number, texto: string): void {
    const agora = this.now();
    const ultimo = this.avisoMochila.get(clientId) ?? -Infinity;
    if (agora - ultimo < AVISO_MOCHILA_MS) return;
    this.avisoMochila.set(clientId, agora);
    this.sendServerChat(clientId, texto);
  }

  private avisarMochilaCheia(clientId: number): void {
    this.avisarComFreio(
      clientId,
      "Mochila cheia — guarde ou solte alguma coisa antes de continuar cavando.",
    );
  }

  // --- §🍖 F10: containers (fornalha, baú) --------------------------------

  /**
   * O container daquela célula, ou `null` se a célula não é um. Container
   * ainda sem entrada no mapa nasce VAZIO aqui e **não é guardado**: o mapa só
   * ganha entrada quando alguém põe alguma coisa dentro, e é isso que faz um
   * mundo de aula cheio de baú vazio não pesar no save nem na memória.
   */
  private containerDe(x: number, y: number, z: number, blockId: number): Container | null {
    const tipo = containerTipoDe(blockId);
    if (!tipo) return null;
    return this.containers.get(containerKey(x, y, z)) ?? containerVazio(tipo);
  }

  /** Os containers que têm ALGUMA coisa dentro, na forma do save. */
  private containersParaSave(): ContainerSalvo[] {
    const out: ContainerSalvo[] = [];
    for (const [key, c] of this.containers) {
      if (!containerTemConteudo(c)) continue;
      const [x, y, z] = key.split(",").map(Number) as [number, number, number];
      out.push(containerParaSave(x, y, z, c));
    }
    return out;
  }

  /** Manda o conteúdo daquela célula pra UM cliente (quem acabou de abrir). */
  private sendContainer(clientId: number, x: number, y: number, z: number): void {
    const c = this.containerDe(x, y, z, getBlock(this.world, x, y, z));
    if (!c) {
      this.fecharContainer(clientId);
      return;
    }
    const s = containerParaSave(x, y, z, c);
    this.send(
      clientId,
      JSON.stringify({
        type: "container",
        x, y, z,
        tipo: s.tipo,
        slots: s.slots,
        ...(s.queimando ? { queimando: s.queimando } : {}),
        ...(s.queimaTotal ? { queimaTotal: s.queimaTotal } : {}),
        ...(s.progresso ? { progresso: s.progresso } : {}),
      } satisfies ServerMessage),
    );
  }

  /** Manda o conteúdo pra TODOS que estão com aquela célula aberta. É por aqui
   *  que dois alunos no mesmo baú (e o dono que vê a fornalha cozinhando) veem
   *  a mesma coisa. */
  private avisarContainer(x: number, y: number, z: number): void {
    for (const [clientId, pos] of this.containerAberto) {
      if (pos.x === x && pos.y === y && pos.z === z) this.sendContainer(clientId, x, y, z);
    }
  }

  /** Fecha o painel deste cliente (bloco quebrou, direito mudou, célula sumiu). */
  private fecharContainer(clientId: number): void {
    if (!this.containerAberto.delete(clientId)) return;
    this.send(clientId, JSON.stringify({ type: "container_fechado" } satisfies ServerMessage));
  }

  /** Fecha o painel de TODOS que estão com aquela célula aberta. */
  private fecharContainerEm(x: number, y: number, z: number): void {
    for (const [clientId, pos] of [...this.containerAberto]) {
      if (pos.x === x && pos.y === y && pos.z === z) this.fecharContainer(clientId);
    }
  }

  /**
   * Aviso de "tem coisa dentro" com o MESMO freio do "mochila cheia", e pela
   * mesma razão: quebrar é clique repetido, e o aluno que insiste no baú cheio
   * encheria o chat da turma.
   */
  private avisarContainerCheio(clientId: number): void {
    this.avisarComFreio(
      clientId,
      "Tem coisa aí dentro — esvazie antes de quebrar (o que está guardado não cai no chão).",
    );
  }

  /**
   * §🍖 F10b: um tick de TODAS as fornalhas. Varre o mapa de containers (que
   * tem dezenas de entradas, não milhões — ver o comentário do campo), pula o
   * que não é fornalha e deixa o `tickFornalha` decidir. Ele devolve o MESMO
   * objeto quando nada muda, e é essa identidade que evita mensagem à toa.
   *
   * Duas coisas saem daqui quando o estado muda: o BYTE do bloco (apagada ↔
   * acesa, que é o que acende a luz e a boca de fogo pra turma inteira) e a
   * mensagem `container` pra quem está com o painel aberto.
   */
  private tickFornalhas(): void {
    if (this.containers.size === 0) return;
    for (const [key, antes] of [...this.containers]) {
      if (antes.tipo !== "fornalha") continue;
      const depois = tickFornalha(antes);
      if (depois === antes) continue;
      const [x, y, z] = key.split(",").map(Number) as [number, number, number];
      if (containerTemConteudo(depois)) this.containers.set(key, depois);
      else this.containers.delete(key); // fornalha que esvaziou volta a não custar nada
      if (fornalhaAcesa(depois) !== fornalhaAcesa(antes)) {
        // só troca o byte se a célula AINDA é fornalha (o bloco pode ter sido
        // quebrado neste mesmo tick por outro caminho). O id novo sai do id
        // VELHO, e não de uma constante: desde o refino da frente, acender uma
        // fornalha virada pro leste com `BlockId.FornalhaAcesa` a giraria pro
        // norte na frente da turma.
        const atual = getBlock(this.world, x, y, z);
        if (isFornalha(atual)) {
          this.applyBlock(x, y, z, fornalhaComEstado(atual, fornalhaAcesa(depois)));
        }
      }
      this.avisarContainer(x, y, z);
    }
  }

  /**
   * Fecha (ou continua) a queda a partir do fluxo de `move` — 10 Hz, que é o que
   * o servidor já recebe. **O cliente NÃO reporta dano**: seria autoridade no
   * lugar errado.
   *
   * ⚠️ Tolerância assumida: a 10 Hz, com a queda limitada em `terminalVelocity`
   * (40 b/s), cada amostra pode pular ~4 blocos. O pico e o pouso são AMOSTRAS,
   * então a altura medida erra PRA MENOS — o jogador sempre leva menos dano do
   * que a queda real, nunca mais. Num jogo de sala de aula, esse é o lado certo
   * do erro; fingir precisão exigiria física do jogador no servidor.
   */
  private acompanharQueda(clientId: number, p: SessionPlayer): void {
    const pico = this.picoQueda.get(clientId) ?? p.y;
    // água amortece: entrar nela ZERA a queda (mesma regra do Minecraft)
    const naAgua = isAgua(getBlock(this.world, Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)));
    const apoiado = apoiadoNoChao(this.world, { x: p.x, y: p.y, z: p.z });
    if (!naAgua && !apoiado) {
      if (p.y > pico) this.picoQueda.set(clientId, p.y);
      return;
    }
    this.picoQueda.set(clientId, p.y);
    if (naAgua) return;
    const dano = danoDeQueda(pico - p.y);
    if (dano > 0) this.machucar(clientId, dano, "queda");
  }

  /**
   * Um tick de vida por jogador em sobrevivência: fôlego debaixo d'água e
   * regeneração passiva. Roda no tick de 10 Hz que já existe — nenhum relógio
   * de parede, mesma regra do ciclo dia/noite e do vento.
   *
   * Só manda `vida` quando muda o que o HUD DESENHA (coração ou bolha), senão
   * seriam 10 mensagens por segundo por aluno.
   */
  private tickVitais(): void {
    const comFome = this.temFome();
    for (const [clientId, p] of this.players) {
      if (this.modoDe(p.name) !== "sobrevivencia") continue;
      const antes = this.vitalDe(p.name);
      const cabeca = getBlock(
        this.world,
        Math.floor(p.x),
        Math.floor(p.y + PLAYER.eyeHeight),
        Math.floor(p.z),
      );
      const folego = tickFolego(antes, isAgua(cabeca));
      // regra `fome` desligada = o corpo se comporta como bem alimentado, MESMO
      // que a barra tenha ficado baixa antes de ela ser desligada (senão o aluno
      // ficaria sem regeneração num mundo que não tem mais fome)
      let depois = tickRegen(folego.estado, comFome ? folego.estado.fome : FOME_MAX);
      // §🍖 F3: curar CUSTA comida (é o que amarra a fome ao dano). Cobrado aqui,
      // e não dentro do `tickRegen`, pra existir UM portão só da regra `fome`.
      if (comFome && depois.vida > folego.estado.vida) {
        depois = gastarEsforco(depois, EXAUSTAO_POR_REGEN);
      }
      let danoFome = 0;
      if (comFome) {
        const f = tickFome(depois);
        depois = f.estado;
        danoFome = f.dano;
      }
      this.vitais.set(p.name, depois);
      if (folego.dano > 0) {
        this.machucar(clientId, folego.dano, "afogamento"); // já manda a `vida`
        continue;
      }
      if (danoFome > 0) {
        this.machucar(clientId, danoFome, "fome"); // idem
        continue;
      }
      if (
        depois.vida !== antes.vida ||
        depois.fome !== antes.fome ||
        GameSession.bolhas(depois.folego) !== GameSession.bolhas(antes.folego)
      ) {
        this.sendVida(clientId);
      }
    }
  }

  /** `/confinar` (cp25): liga/desliga o confinamento por área de grupo. Só
   *  professor (o dispatcher já barrou o aluno). Sem argumento = mostra o estado.
   *  Avisa a turma no toggle; alerta o professor se ligou sem grupos/áreas
   *  (aí ninguém consegue construir — decisão de escopo: sem grupo, nada). */
  private runConfinar(parts: string[]): string {
    const arg = parts[1]?.toLowerCase();
    if (arg === undefined || arg === "status") {
      return `Confinamento por área de grupo está ${this.confinamentoAtivo ? "LIGADO" : "desligado"}. Use /confinar ligar ou /confinar desligar.`;
    }
    let novo: boolean;
    if (arg === "ligar" || arg === "on") novo = true;
    else if (arg === "desligar" || arg === "off") novo = false;
    else return "Uso: /confinar ligar ou /confinar desligar (ou /confinar status).";
    if (novo === this.confinamentoAtivo) {
      return `O confinamento já está ${novo ? "ligado" : "desligado"}.`;
    }
    this.confinamentoAtivo = novo;
    // a turma inteira precisa saber que a regra mudou (o aluno já vê a caixa
    // verde do objetivo, então não há UI nova — só o aviso de chat)
    this.broadcast({
      type: "chat",
      author: "servidor",
      text: novo
        ? "Modo confinamento LIGADO: cada aluno só constrói e quebra na área do seu grupo."
        : "Modo confinamento desligado: os alunos voltam a editar livremente.",
    });
    if (novo && (this.grupos.size === 0 || this.scenario.objetivos.length === 0)) {
      return (
        "Confinamento ligado, mas ATENÇÃO: ainda não há " +
        (this.grupos.size === 0 ? "grupos" : "áreas de objetivo") +
        " definidos — nenhum aluno conseguirá construir até você criar " +
        (this.grupos.size === 0 ? "os grupos (/grupo)" : "os objetivos com área de grupo (/objetivo)") +
        "."
      );
    }
    return novo
      ? "Confinamento ligado: cada aluno fica preso à área do seu grupo (você, professor, edita em qualquer lugar)."
      : "Confinamento desligado.";
  }

  /** Subcomandos de /regiao (cp11) — só chega aqui com papel professor. */
  private runRegiao(clientId: number, parts: string[]): string {
    switch (parts[1]) {
      case "lista": {
        if (this.regions.size === 0) {
          return "Nenhuma região foi criada ainda. Marque os dois cantos com a varinha (tecla R) e use /regiao criar nome.";
        }
        // uma região por linha (cliente renderiza \n com white-space: pre-line)
        return [...this.regions.values()]
          .map((r) => {
            const d = regionDims(r);
            return `${r.nome}: (${r.min.x},${r.min.y},${r.min.z})→(${r.max.x},${r.max.y},${r.max.z}) ${d.x}×${d.y}×${d.z}`;
          })
          .join("\n");
      }
      case "criar": {
        // duas formas: cantos da varinha (3 partes) ou coordenadas digitadas
        // (9 partes), com ~ / ~n relativos à célula do autor (estilo Minecraft)
        const nome = parts[2];
        if ((parts.length !== 3 && parts.length !== 9) || !nome) {
          return "Uso: /regiao criar nome (com os dois cantos da varinha) ou /regiao criar nome x1 y1 z1 x2 y2 z2 — o ~ copia a sua coordenada (ex.: /regiao criar teste ~ ~ ~ 64 64 64).";
        }
        if (nome.length > MAX_REGION_NAME) return `O nome é grande demais (máximo de ${MAX_REGION_NAME} caracteres).`;
        if (this.regions.has(nome)) return `Já existe uma região chamada "${nome}". Apague-a antes ou escolha outro nome.`;
        if (this.regions.size >= MAX_REGIONS) return `Limite de ${MAX_REGIONS} regiões atingido.`;
        let c1: Vec3i;
        let c2: Vec3i;
        if (parts.length === 9) {
          const p = this.players.get(clientId);
          if (!p) return "Entre no mundo antes de criar regiões.";
          const base = { x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) };
          const x1 = parseCoordArg(parts[3], base.x);
          const y1 = parseCoordArg(parts[4], base.y);
          const z1 = parseCoordArg(parts[5], base.z);
          const x2 = parseCoordArg(parts[6], base.x);
          const y2 = parseCoordArg(parts[7], base.y);
          const z2 = parseCoordArg(parts[8], base.z);
          if (x1 === null || y1 === null || z1 === null || x2 === null || y2 === null || z2 === null) {
            return "Não entendi as coordenadas. Use números inteiros, ~ (a sua coordenada) ou ~n (a sua coordenada mais n).";
          }
          c1 = { x: x1, y: y1, z: z1 };
          c2 = { x: x2, y: y2, z: z2 };
          for (const c of [c1, c2]) {
            if (!inBounds(this.world, c.x, c.y, c.z)) {
              return `As coordenadas (${c.x}, ${c.y}, ${c.z}) estão fora do mundo.`;
            }
          }
        } else {
          const marks = this.wandMarks.get(clientId);
          if (!marks?.c1 || !marks.c2) {
            return "Marque os dois cantos com a varinha primeiro (tecla R: clique esquerdo marca o canto 1, o direito marca o canto 2) — ou digite as coordenadas: /regiao criar nome x1 y1 z1 x2 y2 z2 (o ~ copia a sua coordenada).";
          }
          c1 = marks.c1;
          c2 = marks.c2;
        }
        const region: NamedRegion = { nome, ...regionFromCorners(c1, c2) };
        this.regions.set(nome, region);
        this.wandMarks.delete(clientId); // cantos são rascunho de UMA região
        this.broadcastRegions();
        const d = regionDims(region);
        return `Região "${nome}" criada: ${d.x}×${d.y}×${d.z} blocos.`;
      }
      case "apagar": {
        const nome = parts[2];
        if (parts.length !== 3 || !nome) return "Uso: /regiao apagar nome.";
        if (!this.regions.delete(nome)) return `Não existe região chamada "${nome}".`;
        this.broadcastRegions();
        return `Região "${nome}" apagada.`;
      }
      case "encher": {
        // ferramenta de autoria: /regiao encher nome id (id 0 = limpar tudo).
        // cp23b: aplica EM LOTE — regras e objetivos acordam célula a célula
        // (applyBlockQuieto), mas a rede recebe UMA blocks_filled no lugar de
        // milhares de block_changed. Por isso o teto é MAX_ENCHER_CELLS (16×
        // o dos objetivos).
        const nome = parts[2];
        const id = Number(parts[3]);
        if (parts.length !== 4 || !nome || !Number.isInteger(id)) {
          return "Uso: /regiao encher nome id — o id 0 esvazia a região; os demais seguem a ordem do inventário.";
        }
        const r = this.regions.get(nome);
        if (!r) return `Não existe região chamada "${nome}".`;
        if (id !== BlockId.Air && !isPlaceable(id)) return `Não existe bloco com o id ${id}.`;
        if (isPorta(id)) return "A porta ocupa 2 blocos e se coloca com o clique direito, não por comando.";
        if (boxVolume(r) > MAX_ENCHER_CELLS) {
          return `A região é grande demais para encher (máximo de ${MAX_ENCHER_CELLS} blocos).`;
        }
        let mudados = 0;
        // nunca emparedar: célula com jogador dentro fica como está — e é
        // corrigida na rede DEPOIS do lote (blocks_filled pinta a caixa toda)
        const puladas: { x: number; y: number; z: number }[] = [];
        for (let y = r.min.y; y <= r.max.y; y++) {
          for (let z = r.min.z; z <= r.max.z; z++) {
            for (let x = r.min.x; x <= r.max.x; x++) {
              if (getBlock(this.world, x, y, z) === id) continue;
              if (id !== BlockId.Air && this.overlapsAnyPlayer(x, y, z)) {
                puladas.push({ x, y, z });
                continue;
              }
              this.applyBlockQuieto(x, y, z, id);
              mudados++;
            }
          }
        }
        if (mudados > 0 || puladas.length > 0) {
          this.broadcast({
            type: "blocks_filled",
            x0: r.min.x, y0: r.min.y, z0: r.min.z,
            x1: r.max.x, y1: r.max.y, z1: r.max.z,
            blockId: id,
          });
          for (const c of puladas) {
            this.broadcast({
              type: "block_changed",
              x: c.x, y: c.y, z: c.z,
              blockId: getBlock(this.world, c.x, c.y, c.z),
            });
          }
        }
        return `Região "${nome}": ${mudados} bloco(s) alterado(s).`;
      }
      case "carimbar": {
        // /regiao carimbar modelo prefixo espacamento [z] — replica a região
        // modelo (BLOCOS inclusos — cabines!) uma vez POR GRUPO ao longo do
        // eixo, e nomeia prefixo-1…N. Insumo do objetivo per-grupo.
        const modelo = this.regions.get(parts[2] ?? "");
        const prefixo = parts[3];
        const esp = Number(parts[4]);
        const eixo = parts[5] === "z" ? "z" : "x";
        if (
          !modelo || !prefixo || !Number.isInteger(esp) || esp < 0 ||
          parts.length > 6 || (parts.length === 6 && parts[5] !== "z" && parts[5] !== "x")
        ) {
          return "Uso: /regiao carimbar modelo prefixo espacamento [z] — copia a região modelo uma vez para cada grupo, lado a lado.";
        }
        const n = this.grupos.size;
        if (n === 0) return "Crie os grupos antes (/grupo criar n): o carimbo faz uma cópia para cada grupo.";
        if (boxVolume(modelo) > MAX_OBJETIVO_CELLS) {
          return `A região é grande demais para carimbar (máximo de ${MAX_OBJETIVO_CELLS} blocos).`;
        }
        if (prefixo.length + 3 > MAX_REGION_NAME) return "O prefixo é grande demais.";
        if (this.regions.size + n > MAX_REGIONS) return `Limite de ${MAX_REGIONS} regiões atingido.`;
        const d = regionDims(modelo);
        const passo = (eixo === "x" ? d.x : d.z) + esp;
        // valida TUDO antes de mudar qualquer bloco (carimbo pela metade = lixo)
        for (let g = 1; g <= n; g++) {
          const off = g * passo;
          const maxX = modelo.max.x + (eixo === "x" ? off : 0);
          const maxZ = modelo.max.z + (eixo === "z" ? off : 0);
          if (!inBounds(this.world, maxX, modelo.max.y, maxZ)) {
            return `A cópia ${g} não cabe no mundo. Diminua o espaçamento ou carimbe no eixo ${eixo === "x" ? "z" : "x"}.`;
          }
        }
        let pulados = 0;
        for (let g = 1; g <= n; g++) {
          const ox = eixo === "x" ? g * passo : 0;
          const oz = eixo === "z" ? g * passo : 0;
          for (let y = modelo.min.y; y <= modelo.max.y; y++) {
            for (let z = modelo.min.z; z <= modelo.max.z; z++) {
              for (let x = modelo.min.x; x <= modelo.max.x; x++) {
                const bloco = getBlock(this.world, x, y, z);
                const tx = x + ox;
                const tz = z + oz;
                if (getBlock(this.world, tx, y, tz) === bloco) continue;
                if (bloco !== BlockId.Air && this.overlapsAnyPlayer(tx, y, tz)) {
                  pulados++;
                  continue;
                }
                this.applyBlock(tx, y, tz, bloco);
              }
            }
          }
          const nome = `${prefixo}-${g}`;
          this.regions.set(nome, {
            nome,
            min: { x: modelo.min.x + ox, y: modelo.min.y, z: modelo.min.z + oz },
            max: { x: modelo.max.x + ox, y: modelo.max.y, z: modelo.max.z + oz },
          });
        }
        this.broadcastRegions();
        return (
          `${n} cópia(s) de "${modelo.nome}" carimbadas: ${prefixo}-1…${prefixo}-${n}` +
          (pulados ? ` (${pulados} bloco(s) pulados por ter jogador no lugar)` : "")
        );
      }
      case "sortear": {
        // /regiao sortear nome id1 id2 … — preenche a região sorteando, célula a
        // célula, entre os blocos indicados (gabarito ALEATÓRIO na hora: o
        // professor sorteia, refotografa e reinicia). Passa por applyBlock, então
        // regras de vizinhança e detecção de objetivo acordam igual a /regiao encher.
        const nome = parts[2];
        const ids = parts.slice(3).map(Number);
        if (parts.length < 4 || !nome || ids.some((n) => !Number.isInteger(n))) {
          return "Uso: /regiao sortear nome id1 id2 … — preenche a região sorteando entre os blocos indicados (o id 0 é o ar).";
        }
        const r = this.regions.get(nome);
        if (!r) return `Não existe região chamada "${nome}".`;
        for (const id of ids) {
          if (id !== BlockId.Air && !isPlaceable(id)) return `Não existe bloco com o id ${id}.`;
          if (isPorta(id)) return "A porta ocupa 2 blocos e se coloca com o clique direito, não por comando.";
        }
        if (boxVolume(r) > MAX_OBJETIVO_CELLS) {
          return `A região é grande demais para sortear (máximo de ${MAX_OBJETIVO_CELLS} blocos).`;
        }
        let mudados = 0;
        for (let y = r.min.y; y <= r.max.y; y++) {
          for (let z = r.min.z; z <= r.max.z; z++) {
            for (let x = r.min.x; x <= r.max.x; x++) {
              const id = ids[Math.floor(Math.random() * ids.length)] as number;
              if (getBlock(this.world, x, y, z) === id) continue;
              // nunca emparedar: célula com jogador dentro fica como está
              if (id !== BlockId.Air && this.overlapsAnyPlayer(x, y, z)) continue;
              this.applyBlock(x, y, z, id);
              mudados++;
            }
          }
        }
        return `Região "${nome}": ${mudados} bloco(s) sorteado(s) entre ${ids.length} tipo(s).`;
      }
      default:
        return "Uso: /regiao criar nome [x1 y1 z1 x2 y2 z2] · /regiao apagar nome · /regiao lista · /regiao encher nome id · /regiao sortear nome id… · /regiao carimbar modelo prefixo espacamento [z]";
    }
  }

  /**
   * Coloca um jogador JÁ AUTORIZADO no mundo e manda tudo que ele precisa para
   * montar a tela: spawn, snapshot, teleporte, boas-vindas, regiões, grupo e
   * cenário. É a segunda metade do `join` — e é exatamente o que a troca de
   * mundo (cp19) precisa repetir para quem já está conectado.
   *
   * `migrado` = o cliente já estava em jogo e o mundo trocou debaixo dele.
   */
  private admitir(clientId: number, name: string, papel: Papel, migrado: boolean): void {
    // mundo salvo lembra o jogador: volta onde parou (senão, spawn do mundo)
    const returning = this.roster.get(name);
    const start = returning ?? this.spawn;
    this.players.set(clientId, {
      name,
      papel,
      x: start.x,
      y: start.y,
      z: start.z,
      yaw: returning?.yaw ?? 0,
      pitch: returning?.pitch ?? 0,
    });
    // spawn ANTES do snapshot (transporte preserva ordem) — quando o snapshot
    // chegar e o jogo começar, o cliente já sabe onde nascer. Leva o papel
    // junto: cliente habilita UI de professor (varinha).
    this.send(
      clientId,
      JSON.stringify({ type: "spawn", ...this.spawn, papel } satisfies ServerMessage),
    );
    if (this.lazy) {
      // F2 streaming: mundo gigante NÃO viaja inteiro — só o header; as
      // colunas chegam por raio de interesse no tick (o entorno do jogador
      // entra na primeira leva porque `enviadas` nasce vazio)
      this.stream.set(clientId, {
        raio: RAIO_PADRAO,
        enviadas: new Set(),
        pedidos: 0,
        pedidosDesde: this.now(),
      });
      this.send(clientId, encodeLazyInfo(this.world.dims, this.seed));
    } else {
      this.send(clientId, encodeSnapshot(this.world, this.seed));
    }
    this.sendTime(clientId); // céu certo desde o primeiro frame (cp21)
    this.sendVento(clientId); // §🌬️ idem vento: água já entra andando pro lado certo
    // §🍖 F1: modo SEMPRE, mesmo criativo (ao contrário do /voo, que só manda
    // quando liberado). Troca de aula é sessão NOVA e reusa este caminho: sem o
    // envio incondicional, quem estava em sobrevivência no mundo anterior
    // continuaria "em sobrevivência" num mundo criativo (família do bug-518).
    this.sendModo(clientId);
    // §🍖 F2: entrar não é cair, e quem volta machucado precisa ver os corações
    this.picoQueda.set(clientId, start.y);
    if (this.modoDe(name) === "sobrevivencia") {
      this.sendVida(clientId);
      // §🍖 F4: a mochila é por NOME, então quem volta encontra o que cavou
      // ontem. Em criativo a mensagem NÃO vai — ausência é o que diz ao cliente
      // "aqui a paleta é infinita".
      this.sendInventario(clientId);
    }
    // Na migração o teleporte é OBRIGATÓRIO mesmo sem roster: o jogador está
    // parado nas coordenadas do mundo ANTIGO, que no mundo novo podem ser
    // dentro da pedra ou no vazio.
    const destino = returning ?? { ...start, yaw: 0, pitch: 0 };
    if (returning || migrado) {
      // depois do snapshot: o cliente já montou o jogo quando isto chegar
      this.send(
        clientId,
        JSON.stringify({ type: "teleport", ...destino } satisfies ServerMessage),
      );
    }
    this.sendServerChat(
      clientId,
      migrado
        ? `A aula mudou: você está em um mundo novo${papel === "professor" ? "" : ". Confira o objetivo no canto da tela"}.`
        : `Bem-vindo, ${this.authorTag(clientId)}! Pressione Enter para abrir o chat.` +
            (papel === "professor"
              ? " Comandos: /bloco · /resetpin · /regiao (varinha: R) · /objetivo · /grupo · /tp grupos · /tp nome · /iniciar · /hora · /ciclo · /voo · /modo · /regra · /claim · /confinar"
              : " Comandos: /tpr nome (pedir teleporte até um colega) · /tpa (aceitar)" +
                (this.claimsAtivo
                  ? " · /claim criar (proteja sua área: marque com a varinha R) · /amigos convidar nome"
                  : "")),
    );
    // professor vê as regiões existentes desde o join (depois do snapshot)
    if (papel === "professor" && this.regions.size) this.sendRegions(clientId);
    // voo liberado pra turma: avisa o novo (default false = sem msg, sem churn no join)
    if (this.vooLiberado) this.sendVoo(clientId);
    // grupos (cp13): aluno novo cai no MENOR grupo ("até não ter aluno sem
    // grupo"); quem já tinha grupo salvo continua nele
    let entrouEmGrupo = false;
    if (this.grupos.size && papel === "aluno" && this.grupoDe(name) === null) {
      const menor = [...this.grupos.entries()].sort((a, b) => a[1].size - b[1].size)[0];
      if (menor) {
        menor[1].add(name);
        entrouEmGrupo = true;
        this.sendServerChat(
          clientId,
          `Você entrou no grupo ${menor[0]} (para trocar, use /grupo entrar n).`,
        );
      }
    }
    if (this.grupos.size) {
      this.sendGroup(clientId);
      // composição pro painel (cp14): mudou = avisa todos; senão só o novo
      if (entrouEmGrupo) this.broadcastGroups();
      else this.sendGroups(clientId);
    }
    // cenário vai pra TODOS (HUD do aluno vive disto)
    if (this.scenario.objetivos.length) this.sendObjectives(clientId);
    // cp24: claims — TODOS recebem (todo mundo vê as áreas protegidas e sabe se
    // a proteção está ligada). Só manda se há algo a mostrar (senão zero churn).
    if (this.claimsAtivo || this.claims.size) this.sendClaims(clientId);
    // quadros (2026-07-19): só se houver conteúdo (contagens do join intactas)
    if (this.quadros.size) {
      this.send(
        clientId,
        JSON.stringify({
          type: "quadros",
          lista: [...this.quadros.values()],
        } satisfies ServerMessage),
      );
    }
    // grupo de amigos + convites: só quem tem algo (rejoin de membro / convidado)
    if (this.equipeDe(name) !== null || this.convitesAmigo.get(name)?.size) {
      this.sendFriends(clientId);
    }
    // Presença (bug-064): jogador PARADO não manda move — sem isto o
    // recém-chegado só via quem se mexia. Estado atual de todo mundo pro novo
    // (depois do snapshot: o cliente já montou o jogo) e o novo pros outros.
    for (const [otherId, other] of this.players) {
      if (otherId === clientId) continue;
      this.send(
        clientId,
        JSON.stringify({
          type: "player_moved",
          id: otherId,
          x: other.x, y: other.y, z: other.z,
          yaw: other.yaw, pitch: other.pitch,
          name: other.name,
        } satisfies ServerMessage),
      );
    }
    this.broadcastExcept(clientId, {
      type: "player_moved",
      id: clientId,
      x: destino.x, y: destino.y, z: destino.z,
      yaw: destino.yaw, pitch: destino.pitch,
      name,
    });
    // painel de jogadores (2026-07-21): a lista mudou → avisa os professores
    // (inclui o recém-chegado se for professor).
    this.broadcastPlayers();
  }

  /** Quem está conectado agora — o host precisa disto para migrar todo mundo. */
  jogadoresConectados(): { id: number; name: string; papel: Papel }[] {
    return [...this.players.entries()].map(([id, p]) => ({
      id,
      name: p.name,
      papel: p.papel,
    }));
  }

  // --- Banimento + painel de jogadores (2026-07-21) ---
  // Estado (lista de banidos) e o gate de join moram AQUI (autoridade + save);
  // FECHAR o socket de quem foi banido é do HOST (index.ts), como o /kicar.

  /** Nick está banido? (case-insensitive — o nick é sanitizado no join). */
  estaBanido(name: string): boolean {
    const alvo = name.toLowerCase();
    for (const b of this.banidos) if (b.toLowerCase() === alvo) return true;
    return false;
  }

  /** Bane um nick (idempotente). false se já estava banido. Atualiza o painel
   *  dos professores. NÃO desconecta ninguém — o host fecha o socket. */
  banir(name: string): boolean {
    if (!name || this.estaBanido(name)) return false;
    this.banidos.add(name);
    this.broadcastPlayers();
    return true;
  }

  /** Tira o banimento de um nick (case-insensitive). false se não estava banido. */
  desbanir(name: string): boolean {
    const alvo = name.toLowerCase();
    for (const b of this.banidos) {
      if (b.toLowerCase() === alvo) {
        this.banidos.delete(b);
        this.broadcastPlayers();
        return true;
      }
    }
    return false;
  }

  /** Lista dos nicks banidos (cópia). */
  listaBanidos(): string[] {
    return [...this.banidos];
  }

  private playersJson(): string {
    return JSON.stringify({
      type: "players",
      conectados: [...this.players.values()].map((p) => ({ name: p.name, papel: p.papel })),
      banidos: [...this.banidos],
    } satisfies ServerMessage);
  }

  /** Estado dos jogadores (conectados + banidos) → SÓ professores (painel P).
   *  No singleplayer (Web Worker) não roda: não há turma a gerir e /kicar·/banir
   *  são do HOST (a Web Worker nem os intercepta). Mantém o retrato de mensagens
   *  do join/saída idêntico no singleplayer (testes de contrato). */
  private broadcastPlayers(): void {
    if (this.singleplayer) return;
    const raw = this.playersJson();
    for (const [id, p] of this.players) if (p.papel === "professor") this.send(id, raw);
  }

  /**
   * Traz para ESTA sessão um cliente que já estava autenticado em OUTRA (troca
   * de aula sem derrubar ninguém). Não pede PIN nem código: quem chama é o
   * próprio host, com um socket que já passou pela porta. Não é alcançável pelo
   * protocolo — nenhuma mensagem do cliente leva até aqui.
   */
  adotar(clientId: number, name: string, papel: Papel): void {
    // o papel viaja junto com o professor: ele não perde o comando ao trocar de
    // aula. Se o mundo novo já conhece o nome, o PIN gravado lá continua valendo.
    const atual = this.identity.get(name);
    if (papel === "professor" && atual?.papel !== "professor") {
      this.identity.set(name, { pin: atual?.pin, papel });
    }
    this.admitir(clientId, name, papel, true);
  }

  private sendRegions(clientId: number): void {
    this.send(
      clientId,
      JSON.stringify({
        type: "regions",
        regions: [...this.regions.values()],
      } satisfies ServerMessage),
    );
  }

  /** Regiões mudaram: avisa TODOS os professores online (alunos não recebem). */
  private broadcastRegions(): void {
    for (const [id, p] of this.players) {
      if (p.papel === "professor") this.sendRegions(id);
    }
  }

  // --- Anti-griefing (cp24): claims + grupos de amigos ---

  /** Claim que contém a célula, ou null. */
  private claimEm(x: number, y: number, z: number): Claim | null {
    for (const c of this.claims.values()) {
      if (regionContains(c, x, y, z)) return c;
    }
    return null;
  }

  /** Time de amigos do aluno (chave = dono), como dono OU membro. null = sem time. */
  private equipeDe(name: string): string | null {
    if (this.amigos.has(name)) return name;
    for (const [dono, membros] of this.amigos) {
      if (membros.has(name)) return dono;
    }
    return null;
  }

  /** Dois nomes no MESMO time de amigos? (o próprio nome conta). */
  private mesmaEquipe(a: string, b: string): boolean {
    if (a === b) return true;
    const ea = this.equipeDe(a);
    return ea !== null && ea === this.equipeDe(b);
  }

  /** Nomes do time (dono + membros). Vazio se o dono não tem time. */
  private membrosDaEquipe(dono: string): string[] {
    const membros = this.amigos.get(dono);
    return membros ? [dono, ...membros] : [];
  }

  /**
   * A célula está protegida contra ESTE cliente? Devolve a mensagem de recusa,
   * ou null se pode editar. Regra da rocha-matriz: o servidor é a barreira real.
   * Professor ignora todo claim; o dono e os amigos do dono passam.
   */
  private claimBloqueia(clientId: number, x: number, y: number, z: number): string | null {
    if (!this.claimsAtivo) return null;
    const p = this.players.get(clientId);
    if (!p || p.papel === "professor") return null;
    const c = this.claimEm(x, y, z);
    if (!c || c.dono === p.name || this.mesmaEquipe(p.name, c.dono)) return null;
    return `Esta área é protegida por ${c.dono}. Entre no grupo de amigos dele (/amigos) para construir aqui.`;
  }

  /**
   * Todas as caixas de trabalho do grupo: para CADA objetivo, a área do grupo
   * (`alvos[g-1]`, per-grupo) ou a área compartilhada (o próprio objetivo). O
   * aluno confinado edita dentro de QUALQUER uma (todos os objetivos do seu
   * grupo, não só o ativo); a área compartilhada é liberada para todo grupo.
   */
  private areasDoGrupo(grupo: number): Box[] {
    const boxes: Box[] = [];
    for (const o of this.scenario.objetivos) {
      const b = o.alvos && grupo > 0 ? o.alvos[grupo - 1] : o;
      if (b) boxes.push(b);
    }
    return boxes;
  }

  /**
   * Confinamento (cp25) — INVERSO do claim: em mundo de aula/atividade o aluno
   * só edita DENTRO da área do seu grupo. Devolve o motivo (string) se a célula
   * (x,y,z) está fora, ou null se pode editar. Professor ignora. Aluno SEM grupo
   * (ou grupo sem área) é barrado em tudo — decisão de escopo: sem grupo, nada.
   * Mesma barreira-no-servidor da rocha-matriz/claim; o cliente já vê a caixa
   * verde do objetivo, então não precisa de UI nova.
   */
  private confinaBloqueia(clientId: number, x: number, y: number, z: number): string | null {
    if (!this.confinamentoAtivo) return null;
    const p = this.players.get(clientId);
    if (!p || p.papel === "professor") return null;
    const grupo = this.grupoDe(p.name);
    if (grupo === null) {
      return "Modo confinamento: você ainda não está em um grupo. Peça ao professor para criar os grupos (/grupo) — só então poderá construir na área do seu grupo.";
    }
    for (const a of this.areasDoGrupo(grupo)) {
      if (
        x >= a.min.x && x <= a.max.x &&
        y >= a.min.y && y <= a.max.y &&
        z >= a.min.z && z <= a.max.z
      ) {
        return null;
      }
    }
    return "Modo confinamento: você só pode construir e quebrar na área do seu grupo. Use /tp grupos ou siga a caixa verde do seu objetivo.";
  }

  /** O nome é conhecido nesta aula? (online, roster salvo ou identidade). Evita
   *  convidar/remover um nome que nunca existiu. */
  private nomeConhecido(name: string): boolean {
    if (this.roster.has(name) || this.identity.has(name)) return true;
    for (const p of this.players.values()) {
      if (p.name === name) return true;
    }
    return false;
  }

  /** clientId de um nome ONLINE, ou null. */
  private clientIdDe(name: string): number | null {
    for (const [id, p] of this.players) {
      if (p.name === name) return id;
    }
    return null;
  }

  private claimsJson(): string {
    return JSON.stringify({
      type: "claims",
      ativo: this.claimsAtivo,
      claims: [...this.claims.values()],
    } satisfies ServerMessage);
  }

  /** Claims mudaram (ou o toggle liga/desliga): a lista COMPLETA vai pra todos. */
  private broadcastClaims(): void {
    const raw = this.claimsJson();
    for (const id of this.players.keys()) this.send(id, raw);
  }

  private sendClaims(clientId: number): void {
    this.send(clientId, this.claimsJson());
  }

  /** Convites que ESTE jogador mandou e que ninguém respondeu ainda. O mapa é
   *  indexado pelo CONVIDADO (alvo → quem convidou), então a volta é uma
   *  varredura — numa turma de 20 é barato, e evita um segundo índice pra
   *  manter em sincronia. */
  private convitesEnviadosPor(name: string): string[] {
    const alvos: string[] = [];
    for (const [alvo, quem] of this.convitesAmigo) {
      if (quem.has(name)) alvos.push(alvo);
    }
    return alvos;
  }

  /** Manda ao cliente o PRÓPRIO grupo de amigos + convites (recebidos e feitos). */
  private sendFriends(clientId: number): void {
    const p = this.players.get(clientId);
    if (!p) return;
    const dono = this.equipeDe(p.name);
    this.send(
      clientId,
      JSON.stringify({
        type: "friends",
        equipe: dono !== null ? { dono, membros: this.membrosDaEquipe(dono) } : null,
        convites: [...(this.convitesAmigo.get(p.name) ?? [])],
        enviados: this.convitesEnviadosPor(p.name),
      } satisfies ServerMessage),
    );
  }

  /** Reenvia o feed `friends` a todo membro ONLINE do time (entrar/sair/expulsar). */
  private atualizarEquipe(dono: string): void {
    for (const n of this.membrosDaEquipe(dono)) {
      const id = this.clientIdDe(n);
      if (id !== null) this.sendFriends(id);
    }
  }

  /** Chat do servidor a cada membro ONLINE do time. */
  private avisarEquipe(dono: string, texto: string): void {
    for (const n of this.membrosDaEquipe(dono)) {
      const id = this.clientIdDe(n);
      if (id !== null) this.sendServerChat(id, texto);
    }
  }

  /** `/claim` — proteção de áreas. ligar/desligar = professor; criar/remover/
   *  lista = aluno. O professor edita qualquer lugar (ignora claims). */
  private runClaim(clientId: number, parts: string[]): string {
    const p = this.players.get(clientId);
    if (!p) return "Entre no mundo primeiro.";
    const professor = p.papel === "professor";
    switch (parts[1]) {
      case "ligar":
      case "desligar": {
        if (!professor) return "Somente o professor liga ou desliga a proteção de áreas.";
        const novo = parts[1] === "ligar";
        if (novo === this.claimsAtivo) {
          return novo ? "A proteção de áreas já está ligada." : "A proteção de áreas já está desligada.";
        }
        this.claimsAtivo = novo;
        this.broadcastClaims();
        this.broadcast({
          type: "chat",
          author: "servidor",
          text: novo
            ? "Proteção de áreas LIGADA. Marque sua área com a varinha (tecla R) e use /claim criar; convide amigos com /amigos convidar nome."
            : "Proteção de áreas desligada — as áreas voltam a ser livres.",
        });
        return novo ? "Proteção de áreas ligada." : "Proteção de áreas desligada.";
      }
      case "criar": {
        // 2026-07-21: o PROFESSOR também reserva área (mesmo acesso do aluno).
        if (!this.claimsAtivo) return "A proteção de áreas está desligada. Ligue com /claim ligar.";
        if (this.claims.has(p.name)) return "Você já tem uma área reservada. Use /claim remover antes de marcar outra.";
        const marks = this.wandMarks.get(clientId);
        if (!marks?.c1 || !marks.c2) {
          return "Marque os dois cantos com a varinha primeiro (tecla R ou o botão 🪄: clique esquerdo = canto 1, direito = canto 2).";
        }
        const { min, max } = regionFromCorners(marks.c1, marks.c2);
        if (!claimDentroDoLimite(min, max)) {
          return `A área é grande demais (máximo de ${MAX_CLAIM_X}×${MAX_CLAIM_Z} blocos na horizontal).`;
        }
        // o claim protege a COLUNA inteira: da camada 0 (bedrock) ao teto do
        // mundo. Assim ninguém constrói ilha flutuante por cima nem escava por
        // baixo — só a pegada XZ que o autor marcou define a área.
        min.y = 0;
        max.y = this.world.sizeY - 1;
        for (const c of this.claims.values()) {
          if (caixasSeCruzam({ min, max }, c)) return `Sua área encosta na área de ${c.dono}. Marque em outro lugar.`;
        }
        for (const r of this.regions.values()) {
          if (caixasSeCruzam({ min, max }, r)) {
            return "Sua área encosta numa região reservada pelo professor. Marque em outro lugar.";
          }
        }
        const nome = parts[2];
        const claim: Claim = {
          dono: p.name,
          min,
          max,
          ...(nome && nome.length <= MAX_CLAIM_NAME ? { nome } : {}),
        };
        this.claims.set(p.name, claim);
        this.wandMarks.delete(clientId);
        this.broadcastClaims();
        const d = regionDims({ nome: "", min, max });
        return `Área reservada: coluna de ${d.x}×${d.z} blocos, da base ao topo do mundo. Só você e seus amigos constroem aqui (/amigos convidar nome).`;
      }
      case "remover": {
        const alvo = parts[2];
        if (alvo) {
          if (!professor) return "Você só pode remover a SUA área (/claim remover, sem nome).";
          if (!this.claims.delete(alvo)) return `${alvo} não tem área protegida.`;
          this.broadcastClaims();
          return `Área de ${alvo} removida.`;
        }
        if (!this.claims.delete(p.name)) return "Você não tem área protegida.";
        this.broadcastClaims();
        return "Sua área protegida foi removida.";
      }
      case "lista": {
        if (this.claims.size === 0) return "Nenhuma área protegida ainda.";
        return [...this.claims.values()]
          .map((c) => {
            const d = regionDims({ nome: "", min: c.min, max: c.max });
            return `${c.dono}${c.nome ? ` (${c.nome})` : ""}: (${c.min.x},${c.min.y},${c.min.z})→(${c.max.x},${c.max.y},${c.max.z}) ${d.x}×${d.y}×${d.z}`;
          })
          .join("\n");
      }
      default:
        return professor
          ? "Uso: /claim ligar · /claim desligar · /claim criar · /claim remover [nome] · /claim lista"
          : "Uso: /claim criar [nome] (marque a área com a varinha R antes) · /claim remover · /claim lista";
    }
  }

  /** `/amigos` — grupo de amigos do aluno. Entrada por convite + aceite. */
  private runAmigos(clientId: number, parts: string[]): string {
    const p = this.players.get(clientId);
    if (!p) return "Entre no mundo primeiro.";
    const me = p.name;
    switch (parts[1]) {
      case "convidar": {
        const alvo = parts.slice(2).join(" ").trim();
        if (!alvo) return "Uso: /amigos convidar nome.";
        if (alvo === me) return "Você não pode convidar a si mesmo.";
        const minha = this.equipeDe(me);
        if (minha !== null && minha !== me) {
          return "Você está no grupo de outra pessoa. Saia dele (/amigos sair) para criar o seu.";
        }
        if (!this.nomeConhecido(alvo)) return `Ninguém chamado "${alvo}" está nesta aula.`;
        if (this.equipeDe(alvo) !== null) return `${alvo} já está em um grupo de amigos.`;
        const membros = this.amigos.get(me) ?? new Set<string>();
        if (1 + membros.size >= MAX_AMIGOS) {
          return `Seu grupo já está cheio (máximo de ${MAX_AMIGOS}, contando você).`;
        }
        this.amigos.set(me, membros); // primeira vez cria o time (vazio)
        const conv = this.convitesAmigo.get(alvo) ?? new Set<string>();
        if (conv.has(me)) return `Você já convidou ${alvo}. Espere ele aceitar.`;
        conv.add(me);
        this.convitesAmigo.set(alvo, conv);
        const idAlvo = this.clientIdDe(alvo);
        if (idAlvo !== null) {
          this.sendServerChat(idAlvo, `${me} convidou você para o grupo de amigos. Aceite com /amigos aceitar ${me}.`);
          this.sendFriends(idAlvo);
        }
        // e pra quem convidou também: o time acabou de nascer (com ele dentro)
        // e o convite entrou nos `enviados` — sem isto o painel dele não muda
        this.sendFriends(clientId);
        return `Convite enviado para ${alvo}.`;
      }
      case "aceitar": {
        const conv = this.convitesAmigo.get(me);
        if (!conv || conv.size === 0) return "Você não tem convites de amigo pendentes.";
        let dono = parts.slice(2).join(" ").trim();
        if (!dono) {
          if (conv.size > 1) return `Você tem convites de ${[...conv].join(", ")}. Escolha: /amigos aceitar nome.`;
          dono = [...conv][0] ?? "";
        }
        if (!conv.has(dono)) return `${dono || "Esse jogador"} não te convidou.`;
        if (this.equipeDe(me) !== null) return "Você já está em um grupo. Saia dele antes (/amigos sair).";
        const membros = this.amigos.get(dono);
        if (!membros) {
          conv.delete(dono);
          return `O grupo de ${dono} não existe mais.`;
        }
        if (1 + membros.size >= MAX_AMIGOS) return `O grupo de ${dono} está cheio.`;
        membros.add(me);
        const descartados = [...conv].filter((n) => n !== dono);
        this.convitesAmigo.delete(me); // aceitou um: descarta os outros convites
        // os outros que convidaram param de esperar: o "aguardando" some do
        // painel deles junto com o convite que acabou de ser descartado
        for (const outro of descartados) {
          const id = this.clientIdDe(outro);
          if (id !== null) this.sendFriends(id);
        }
        this.avisarEquipe(dono, `${me} entrou no grupo de amigos.`);
        this.atualizarEquipe(dono);
        return `Você entrou no grupo de ${dono}.`;
      }
      case "recusar": {
        const conv = this.convitesAmigo.get(me);
        if (!conv || conv.size === 0) return "Você não tem convites pendentes.";
        let dono = parts.slice(2).join(" ").trim();
        if (!dono) {
          if (conv.size > 1) return `Escolha qual recusar: /amigos recusar nome (${[...conv].join(", ")}).`;
          dono = [...conv][0] ?? "";
        }
        if (!conv.delete(dono)) return `${dono || "Esse jogador"} não te convidou.`;
        if (conv.size === 0) this.convitesAmigo.delete(me);
        this.sendFriends(clientId);
        // quem convidou tira o "aguardando" da tela na hora (e fica sabendo
        // pelo chat: recusa em silêncio deixaria o convite pendente pra sempre)
        const idDono = this.clientIdDe(dono);
        if (idDono !== null) {
          this.sendServerChat(idDono, `${me} recusou o seu convite de amigos.`);
          this.sendFriends(idDono);
        }
        return `Convite de ${dono} recusado.`;
      }
      case "sair": {
        const equipe = this.equipeDe(me);
        if (equipe === null) return "Você não está em nenhum grupo de amigos.";
        if (equipe === me) {
          // dono saiu: dissolve o time (membros ficam livres)
          const outros = this.membrosDaEquipe(me).filter((n) => n !== me);
          this.amigos.delete(me);
          for (const n of outros) {
            const id = this.clientIdDe(n);
            if (id !== null) {
              this.sendServerChat(id, `${me} dissolveu o grupo de amigos.`);
              this.sendFriends(id);
            }
          }
          this.sendFriends(clientId);
          return "Seu grupo de amigos foi dissolvido.";
        }
        this.amigos.get(equipe)?.delete(me);
        this.avisarEquipe(equipe, `${me} saiu do grupo de amigos.`);
        this.atualizarEquipe(equipe);
        this.sendFriends(clientId);
        return `Você saiu do grupo de ${equipe}.`;
      }
      case "expulsar": {
        const alvo = parts.slice(2).join(" ").trim();
        if (!alvo) return "Uso: /amigos expulsar nome.";
        const membros = this.amigos.get(me);
        if (!membros) return "Você não é dono de um grupo de amigos.";
        if (!membros.delete(alvo)) return `${alvo} não está no seu grupo.`;
        const id = this.clientIdDe(alvo);
        if (id !== null) {
          this.sendServerChat(id, `${me} removeu você do grupo de amigos.`);
          this.sendFriends(id);
        }
        this.atualizarEquipe(me);
        this.sendFriends(clientId);
        return `${alvo} foi removido do seu grupo.`;
      }
      case "lista": {
        const equipe = this.equipeDe(me);
        const conv = this.convitesAmigo.get(me);
        const linhas: string[] = [];
        linhas.push(
          equipe !== null
            ? `Grupo de ${equipe}: ${this.membrosDaEquipe(equipe).join(", ")}`
            : "Você não está em nenhum grupo de amigos.",
        );
        if (conv && conv.size) {
          linhas.push(`Convites pendentes: ${[...conv].join(", ")} (aceite com /amigos aceitar nome).`);
        }
        return linhas.join("\n");
      }
      default:
        return "Uso: /amigos convidar nome · /amigos aceitar [nome] · /amigos recusar [nome] · /amigos sair · /amigos expulsar nome · /amigos lista";
    }
  }

  // --- Cenário (cp12) ---

  /**
   * Resolve o nome de área de um objetivo: região exata = COMPARTILHADA;
   * senão, com grupos criados, `nome-1`…`nome-N` = uma área POR GRUPO
   * (é o que o /regiao carimbar produz).
   */
  private resolveAlvos(
    nome: string,
  ): { shared?: NamedRegion; porGrupo?: NamedRegion[]; erro?: string } {
    const exata = this.regions.get(nome);
    if (exata) return { shared: exata };
    if (this.grupos.size > 0 && this.regions.has(`${nome}-1`)) {
      const porGrupo: NamedRegion[] = [];
      for (let g = 1; g <= this.grupos.size; g++) {
        const r = this.regions.get(`${nome}-${g}`);
        if (!r) {
          return {
            erro:
              `Falta a região "${nome}-${g}": o mundo tem ${this.grupos.size} grupos, ` +
              `então é preciso uma área para cada um (crie-as com /regiao carimbar).`,
          };
        }
        porGrupo.push(r);
      }
      return { porGrupo };
    }
    return {
      erro: this.grupos.size
        ? `Não existe região chamada "${nome}", nem "${nome}-1" (uma área para cada grupo).`
        : `Não existe região chamada "${nome}".`,
    };
  }

  /** Subcomandos de /objetivo — só chega aqui com papel professor. */
  private runObjetivo(parts: string[]): string {
    switch (parts[1]) {
      case "add": {
        const kind = parts[2];
        if (this.scenario.objetivos.length >= MAX_OBJETIVOS) {
          return `Limite de ${MAX_OBJETIVOS} objetivos atingido.`;
        }
        if (kind === "construir") {
          const modelo = this.regions.get(parts[3] ?? "");
          const res = this.resolveAlvos(parts[4] ?? "");
          const texto = parts.slice(5).join(" ").slice(0, MAX_OBJETIVO_TEXTO);
          if (!modelo || (!res.shared && !res.porGrupo) || !texto) {
            return (
              res.erro ??
              "Uso: /objetivo add construir modelo alvo enunciado… — o jogo fotografa a " +
                "região MODELO agora e passa a conferir a região ALVO, que precisa ter o " +
                "mesmo tamanho. O alvo pode ser um prefixo com uma área para cada grupo, " +
                "criado com /regiao carimbar."
            );
          }
          const caixas = res.porGrupo ?? [res.shared as NamedRegion];
          const dm = regionDims(modelo);
          for (const caixa of caixas) {
            const da = regionDims(caixa);
            if (dm.x !== da.x || dm.y !== da.y || dm.z !== da.z) {
              return `O modelo (${dm.x}×${dm.y}×${dm.z}) e a área "${caixa.nome}" (${da.x}×${da.y}×${da.z}) precisam ter o mesmo tamanho.`;
            }
          }
          if (boxVolume(modelo) > MAX_OBJETIVO_CELLS) {
            return `A região é grande demais (máximo de ${MAX_OBJETIVO_CELLS} blocos).`;
          }
          const gabarito = snapshotRegion(this.world, modelo);
          if (!gabarito.some((b) => b !== BlockId.Air)) {
            return `A região modelo "${modelo.nome}" está vazia. Construa o modelo antes de fotografá-lo.`;
          }
          for (const caixa of caixas) {
            const m = matchRegion(this.world, caixa, gabarito);
            if (m.corretos === m.alvo && m.extras === 0) {
              return (
                `a área "${caixa.nome}" JÁ bate com o modelo — apague o conteúdo ` +
                `dela (/regiao encher ${caixa.nome} 0) ou use outro alvo`
              );
            }
          }
          const alvoNome = res.porGrupo ? `${parts[4]}-1…${caixas.length}` : (res.shared?.nome ?? "");
          const o: Objective = {
            id: this.nextObjetivoId++,
            kind: "construir",
            regiao: alvoNome,
            modelo: modelo.nome,
            texto,
            // per-grupo: min/max = caixa do MODELO (referência visual pra todos);
            // compartilhado: a própria área alvo
            min: { ...(res.porGrupo ? modelo.min : (res.shared as NamedRegion).min) },
            max: { ...(res.porGrupo ? modelo.max : (res.shared as NamedRegion).max) },
            gabarito,
            ...(res.porGrupo
              ? { alvos: caixas.map((c) => ({ min: { ...c.min }, max: { ...c.max } })) }
              : {}),
          };
          this.capturarBaseline(o); // estado autoral da área (semente) → reiniciar restaura
          this.scenario.objetivos.push(o);
          this.broadcastObjectives();
          const alvoTotal = gabarito.filter((b) => b !== BlockId.Air).length;
          return `Objetivo #${o.id} criado: construir em "${alvoNome}" — ${alvoTotal} blocos, modelo "${modelo.nome}".`;
        }
        if (kind === "chegar" || kind === "limpar") {
          // chegar aceita regra opcional depois da região: todos | um (default)
          const regra =
            kind === "chegar" && (parts[4] === "todos" || parts[4] === "um")
              ? parts[4]
              : undefined;
          const res = this.resolveAlvos(parts[3] ?? "");
          const texto = parts
            .slice(regra ? 5 : 4)
            .join(" ")
            .slice(0, MAX_OBJETIVO_TEXTO);
          if ((!res.shared && !res.porGrupo) || !texto) {
            return (
              res.erro ??
              `Uso: /objetivo add ${kind} regiao ${
                kind === "chegar" ? "[todos|um] " : ""
              }enunciado…${
                kind === "chegar"
                  ? " — todos = o grupo inteiro precisa estar na região ao mesmo tempo; um = basta um integrante (padrão)."
                  : ""
              }`
            );
          }
          const caixas = res.porGrupo ?? [res.shared as NamedRegion];
          if (kind === "limpar") {
            for (const caixa of caixas) {
              if (boxVolume(caixa) > MAX_OBJETIVO_CELLS) {
                return `A região é grande demais (máximo de ${MAX_OBJETIVO_CELLS} blocos).`;
              }
              if (countSolid(this.world, caixa) === 0) {
                return `A região "${caixa.nome}" já está vazia: não há nada para limpar.`;
              }
            }
          }
          const primeira = caixas[0] as NamedRegion;
          const o: Objective = {
            id: this.nextObjetivoId++,
            kind,
            regiao: res.porGrupo ? `${parts[3]}-1…${caixas.length}` : primeira.nome,
            texto,
            min: { ...primeira.min },
            max: { ...primeira.max },
            ...(res.porGrupo
              ? { alvos: caixas.map((c) => ({ min: { ...c.min }, max: { ...c.max } })) }
              : {}),
            ...(regra ? { regra } : {}),
          };
          if (kind === "limpar") this.capturarBaseline(o); // reiniciar recompõe a bagunça
          this.scenario.objetivos.push(o);
          this.broadcastObjectives();
          const detalhe =
            regra === "todos"
              ? " — o grupo inteiro precisa estar na região ao mesmo tempo"
              : regra === "um"
                ? " — basta um integrante do grupo chegar"
                : "";
          return `Objetivo #${o.id} criado: ${kind} em "${o.regiao}"${detalhe}.`;
        }
        return "Uso: /objetivo add construir|chegar|limpar … — digite /objetivo para ver a lista completa.";
      }
      case "lista": {
        if (this.scenario.objetivos.length === 0) {
          return "Nenhum objetivo foi criado ainda. Use /objetivo add construir|chegar|limpar.";
        }
        const ativos = this.activeIdsFor(0);
        return this.scenario.objetivos
          .map((o) => {
            const estado = o.alvos
              ? [...this.grupos.keys()]
                  .map((g) => `g${g}${this.isCompleteFor(o, g) ? "✓" : ""}`)
                  .join(" ")
              : this.scenario.completos.has(o.id)
                ? "concluído"
                : ativos.has(o.id)
                  ? "ativo"
                  : "aguardando";
            const modelo = o.modelo && o.modelo !== o.regiao ? ` (modelo ${o.modelo})` : "";
            return `#${o.id} ${o.kind} → ${o.regiao}${modelo} — ${estado} — ${o.texto}`;
          })
          .join("\n");
      }
      case "texto": {
        // edição de autoria (cp14 — painel usa): troca só o enunciado
        const id = Number(parts[2]);
        const texto = parts.slice(3).join(" ").slice(0, MAX_OBJETIVO_TEXTO);
        if (!Number.isInteger(id) || !texto) return "Uso: /objetivo texto id novo enunciado…";
        const o = this.scenario.objetivos.find((obj) => obj.id === id);
        if (!o) return `Não existe objetivo #${id}.`;
        o.texto = texto;
        this.broadcastObjectives();
        return `Objetivo #${id}: enunciado atualizado.`;
      }
      case "mover": {
        // reordena (cp14 — painel usa): posição 1 = primeiro. Em modo
        // sequencial a ordem É o cenário, por isso o broadcast re-ativa certo.
        const id = Number(parts[2]);
        const pos = Number(parts[3]);
        if (parts.length !== 4 || !Number.isInteger(id) || !Number.isInteger(pos)) {
          return "Uso: /objetivo mover id posição (1 = primeiro da lista).";
        }
        const idx = this.scenario.objetivos.findIndex((o) => o.id === id);
        if (idx === -1) return `Não existe objetivo #${id}.`;
        const destino = Math.min(Math.max(pos, 1), this.scenario.objetivos.length) - 1;
        const [o] = this.scenario.objetivos.splice(idx, 1);
        if (o) this.scenario.objetivos.splice(destino, 0, o);
        this.broadcastObjectives();
        return `Objetivo #${id} agora é o ${destino + 1}º da lista.`;
      }
      case "remover": {
        const id = Number(parts[2]);
        if (parts.length !== 3 || !Number.isInteger(id)) return "Uso: /objetivo remover id.";
        const idx = this.scenario.objetivos.findIndex((o) => o.id === id);
        if (idx === -1) return `Não existe objetivo #${id}.`;
        this.scenario.objetivos.splice(idx, 1);
        this.scenario.completos.delete(id);
        for (const key of this.completosGrupo) {
          if (key.startsWith(`${id}:`)) this.completosGrupo.delete(key);
        }
        for (const key of this.objetivosDirty) {
          if (key.startsWith(`${id}:`)) this.objetivosDirty.delete(key);
        }
        this.broadcastObjectives();
        return `Objetivo #${id} removido.`;
      }
      case "modo": {
        const modo = parts[2];
        if (modo !== "sequencial" && modo !== "livre") {
          return "Uso: /objetivo modo sequencial|livre — no modo sequencial os objetivos valem um de cada vez, na ordem da lista.";
        }
        this.scenario.modo = modo;
        this.broadcastObjectives();
        return `Modo do cenário: ${modo}.`;
      }
      case "resetar": {
        const mudados = this.zerarProgresso();
        return mudados > 0
          ? `Progresso zerado e áreas restauradas ao estado inicial (${mudados} bloco(s) repostos). Os objetivos valem de novo.`
          : "Progresso zerado: os objetivos valem de novo.";
      }
      default:
        return (
          "Uso: /objetivo add construir modelo alvo enunciado… · /objetivo add chegar|limpar regiao enunciado… · " +
          "/objetivo lista · /objetivo texto id novo enunciado… · /objetivo mover id posição · " +
          "/objetivo remover id · /objetivo modo sequencial|livre · /objetivo resetar"
        );
    }
  }

  // --- Grupos (cp13) ---

  private grupoDe(name: string): number | null {
    for (const [id, membros] of this.grupos) {
      if (membros.has(name)) return id;
    }
    return null;
  }

  /** Manda ao cliente o PRÓPRIO grupo (join e mudanças). */
  private sendGroup(clientId: number): void {
    const p = this.players.get(clientId);
    if (!p) return;
    this.send(
      clientId,
      JSON.stringify({
        type: "group",
        grupo: this.grupoDe(p.name),
      } satisfies ServerMessage),
    );
  }

  private groupsJson(): string {
    return JSON.stringify({
      type: "groups",
      grupos: [...this.grupos.entries()].map(([id, membros]) => ({
        id,
        membros: [...membros],
      })),
    } satisfies ServerMessage);
  }

  /** Composição completa pro cliente novo (painéis do cp14 vivem disto). */
  private sendGroups(clientId: number): void {
    this.send(clientId, this.groupsJson());
  }

  /** Composição mudou (criar/entrar/sair/auto-distribuição): avisa TODOS. */
  private broadcastGroups(): void {
    const raw = this.groupsJson();
    for (const clientId of this.players.keys()) this.send(clientId, raw);
  }

  /** Subcomandos de /grupo. criar = só professor; entrar/sair/lista = todos. */
  private runGrupo(clientId: number, parts: string[]): string {
    const professor = this.players.get(clientId)?.papel === "professor";
    switch (parts[1]) {
      case "criar": {
        if (!professor) return "Somente o professor pode criar grupos.";
        const n = Number(parts[2]);
        const porAluno = parts[3] === "alunos";
        if (
          !Number.isInteger(n) || n < 1 ||
          (parts.length !== 3 && !(parts.length === 4 && porAluno))
        ) {
          return "Uso: /grupo criar 5 (cria 5 grupos) · /grupo criar 5 alunos (grupos de 5 alunos cada).";
        }
        const alunosOnline = [...this.players.values()]
          .filter((p) => p.papel === "aluno")
          .map((p) => p.name);
        const quantos = porAluno ? Math.max(1, Math.ceil(alunosOnline.length / n)) : n;
        if (quantos > MAX_GRUPOS) return `O máximo é ${MAX_GRUPOS} grupos.`;
        // recriar grupos ZERA composição e progresso por grupo (turma nova)
        this.grupos.clear();
        this.completosGrupo.clear();
        for (let g = 1; g <= quantos; g++) this.grupos.set(g, new Set());
        // round-robin: um pra cada grupo até não sobrar aluno sem grupo
        alunosOnline.forEach((name, i) => {
          this.grupos.get((i % quantos) + 1)?.add(name);
        });
        this.broadcast({
          type: "chat",
          author: "servidor",
          text: `${quantos} grupo(s) criados. Veja o seu no aviso da tela; para trocar, use /grupo entrar n.`,
        });
        for (const [id, p] of this.players) {
          const g = this.grupoDe(p.name);
          if (g !== null) this.sendServerChat(id, `você está no grupo ${g}`);
          this.sendGroup(id);
        }
        this.broadcastGroups();
        this.broadcastObjectives(true);
        return `grupos: ${[...this.grupos.entries()]
          .map(([g, m]) => `g${g}(${m.size})`)
          .join(" ")}`;
      }
      case "entrar": {
        const g = Number(parts[2]);
        if (parts.length !== 3 || !Number.isInteger(g)) return "Uso: /grupo entrar n.";
        if (!this.grupos.has(g)) return `Não existe o grupo ${g}.`;
        const p = this.players.get(clientId);
        if (!p) return "Entre no mundo primeiro.";
        const atual = this.grupoDe(p.name);
        if (atual !== null) this.grupos.get(atual)?.delete(p.name);
        this.grupos.get(g)?.add(p.name);
        this.sendGroup(clientId);
        this.broadcastGroups();
        return `Você agora está no grupo ${g}.`;
      }
      case "sair": {
        const p = this.players.get(clientId);
        if (!p) return "Entre no mundo primeiro.";
        const atual = this.grupoDe(p.name);
        if (atual === null) return "Você não está em nenhum grupo.";
        this.grupos.get(atual)?.delete(p.name);
        this.sendGroup(clientId);
        this.broadcastGroups();
        return `Você saiu do grupo ${atual}.`;
      }
      case "lista": {
        if (this.grupos.size === 0) return "Nenhum grupo foi criado. O professor cria os grupos com /grupo criar n.";
        return [...this.grupos.entries()]
          .map(([g, membros]) => `grupo ${g} (${membros.size}): ${[...membros].join(", ") || "—"}`)
          .join("\n");
      }
      default:
        return "Uso: /grupo criar n [alunos] · /grupo entrar n · /grupo sair · /grupo lista";
    }
  }

  // --- Teleporte de grupos e início da atividade (/tp, /iniciar) ---

  /**
   * Teleporta um jogador conectado: move no servidor e avisa a rede — o próprio
   * cliente pela msg `teleport` (reposiciona a câmera), os demais por
   * `player_moved` (veem o boneco no lugar novo). Zera a orientação para todos
   * olharem na mesma direção no começo da aula.
   */
  private teleportar(clientId: number, x: number, y: number, z: number): void {
    const p = this.players.get(clientId);
    if (!p) return;
    p.x = x;
    p.y = y;
    p.z = z;
    p.yaw = 0;
    p.pitch = 0;
    // §🍖 F2: teleporte NÃO é queda — quem cai 40 blocos por comando (ou por
    // respawn) não pode pousar machucado
    this.picoQueda.set(clientId, y);
    this.send(
      clientId,
      JSON.stringify({ type: "teleport", x, y, z, yaw: 0, pitch: 0 } satisfies ServerMessage),
    );
    this.broadcastExcept(clientId, {
      type: "player_moved",
      id: clientId,
      x,
      y,
      z,
      yaw: 0,
      pitch: 0,
      name: p.name,
    });
  }

  /**
   * Caixa-alvo para onde levar o grupo: a área do objetivo ATIVO do grupo (o
   * primeiro que ele ainda não fechou, no seu próprio ritmo); se já fechou
   * todos, a do primeiro objetivo. `null` se o cenário não tem objetivo. Um
   * objetivo per-grupo dá a área do grupo (`alvos[g-1]`); um compartilhado dá
   * a área única (o próprio objetivo tem min/max e serve de caixa).
   */
  private areaDoGrupo(grupo: number): Box | null {
    const objs = this.scenario.objetivos;
    if (objs.length === 0) return null;
    const ativos = this.activeIdsFor(grupo);
    const o = objs.find((x) => ativos.has(x.id)) ?? objs[0];
    if (!o) return null;
    return o.alvos && grupo > 0 ? (o.alvos[grupo - 1] ?? o) : o;
  }

  /** Ponto seguro para nascer dentro de uma caixa: centro no plano, chão da
   *  coluna (findSpawnY = primeira célula de ar — nunca dentro de um bloco). */
  private destinoNaCaixa(box: Box): { x: number; y: number; z: number } {
    const cx = Math.floor((box.min.x + box.max.x) / 2);
    const cz = Math.floor((box.min.z + box.max.z) / 2);
    return { x: cx + 0.5, y: findSpawnY(this.world, cx, cz), z: cz + 0.5 };
  }

  /** `/tp grupos`: leva os alunos conectados de cada grupo à área do seu objetivo. */
  /** Id do cliente ONLINE com este nome (identidade = nome, igual roster). */
  private clientePorNome(nome: string): number | null {
    for (const [id, p] of this.players) if (p.name === nome) return id;
    return null;
  }

  /** `/tp nome` = professor vai até o jogador; `/tp nome x y z` = envia o
   *  jogador (~ copia a SUA coordenada — a de QUEM digita, convenção Minecraft:
   *  ~ é relativo a quem executa). Teleoperação do professor: sem pedido, sem aceite. */
  private runTp(clientId: number, parts: string[]): string {
    const nome = parts[1];
    if (!nome || (parts.length !== 2 && parts.length !== 5)) {
      return "Uso: /tp grupos · /tp nome (ir até o jogador) · /tp nome x y z (enviar o jogador; ~ copia a SUA coordenada).";
    }
    const alvoId = this.clientePorNome(nome);
    const alvo = alvoId === null ? undefined : this.players.get(alvoId);
    if (alvoId === null || !alvo) return `"${nome}" não está no mundo agora.`;
    if (parts.length === 2) {
      if (alvoId === clientId) return "Você já está aí.";
      this.teleportar(clientId, alvo.x, alvo.y, alvo.z);
      return `Teleportado até ${nome}.`;
    }
    // ~ é relativo a QUEM DIGITA (o professor), não ao teleportado — igual ao
    // Minecraft (~ = posição de quem executa o comando).
    const autor = this.players.get(clientId);
    if (!autor) return "Entre no mundo antes de usar /tp.";
    const base = { x: Math.floor(autor.x), y: Math.floor(autor.y), z: Math.floor(autor.z) };
    const x = parseCoordArg(parts[2], base.x);
    const y = parseCoordArg(parts[3], base.y);
    const z = parseCoordArg(parts[4], base.z);
    if (x === null || y === null || z === null) {
      return "Não entendi as coordenadas. Use números inteiros, ~ (a sua coordenada) ou ~n.";
    }
    if (!inBounds(this.world, x, y, z)) return `As coordenadas (${x}, ${y}, ${z}) estão fora do mundo.`;
    this.teleportar(alvoId, x + 0.5, y, z + 0.5);
    if (alvoId !== clientId) this.sendServerChat(alvoId, "O professor teleportou você.");
    return `${nome} foi teleportado para (${x}, ${y}, ${z}).`;
  }

  /** `/tpr nome` (todos): pede para se teleportar até o jogador — ele aceita
   *  com /tpa. Um pedido por solicitante (o novo substitui o antigo). */
  private runTpr(clientId: number, parts: string[]): string {
    const nome = parts[1];
    if (parts.length !== 2 || !nome) {
      return "Uso: /tpr nome — pede para se teleportar até o jogador; ele aceita com /tpa.";
    }
    const de = this.players.get(clientId);
    if (!de) return "Entre no mundo antes de pedir teleporte.";
    const alvoId = this.clientePorNome(nome);
    if (alvoId === null) return `"${nome}" não está no mundo agora.`;
    if (alvoId === clientId) return "Você já está aí.";
    const fila = (this.tpPedidos.get(alvoId) ?? []).filter((p) => p.deId !== clientId);
    fila.push({ deId: clientId, deNome: de.name, expira: this.now() + TP_PEDIDO_MS });
    this.tpPedidos.set(alvoId, fila);
    this.sendServerChat(
      alvoId,
      `${de.name} quer se teleportar até você. Digite /tpa para aceitar — o pedido expira em 30 segundos.`,
    );
    return `Pedido enviado a ${nome}. Ele tem 30 segundos para aceitar com /tpa.`;
  }

  /** `/tpa [nome]`: aceita o pedido de teleporte mais recente (ou o de `nome`). */
  private runTpa(clientId: number, parts: string[]): string {
    if (parts.length > 2) return "Uso: /tpa (aceita o pedido mais recente) ou /tpa nome.";
    const eu = this.players.get(clientId);
    if (!eu) return "Entre no mundo antes.";
    const agora = this.now();
    // poda: pedidos expirados ou de quem já saiu do mundo
    const fila = (this.tpPedidos.get(clientId) ?? []).filter(
      (p) => p.expira > agora && this.players.has(p.deId),
    );
    const nome = parts[1];
    const pedido = nome ? fila.find((p) => p.deNome === nome) : fila.at(-1);
    if (!pedido) {
      this.tpPedidos.set(clientId, fila);
      return nome
        ? `Não há pedido de teleporte de "${nome}" — pode ter expirado (o prazo é de 30 segundos).`
        : "Não há pedido de teleporte pendente. Peça com /tpr nome (o pedido dura 30 segundos).";
    }
    this.tpPedidos.set(clientId, fila.filter((p) => p !== pedido));
    this.teleportar(pedido.deId, eu.x, eu.y, eu.z);
    this.sendServerChat(pedido.deId, `${eu.name} aceitou: você foi teleportado.`);
    return `Você aceitou o pedido de ${pedido.deNome}.`;
  }

  private teleportarGrupos(): string {
    if (this.grupos.size === 0) {
      return "Não há grupos. Crie-os com /grupo criar n antes de teleportar.";
    }
    if (this.scenario.objetivos.length === 0) {
      return "Não há objetivos com áreas definidas — nada para onde levar os grupos.";
    }
    let movidos = 0;
    let semArea = 0;
    for (const [g, membros] of this.grupos) {
      const box = this.areaDoGrupo(g);
      if (!box) {
        semArea++;
        continue;
      }
      const d = this.destinoNaCaixa(box);
      for (const [clientId, p] of this.players) {
        if (p.papel === "aluno" && membros.has(p.name)) {
          this.teleportar(clientId, d.x, d.y, d.z);
          movidos++;
        }
      }
    }
    if (movidos === 0) return "Nenhum aluno dos grupos está conectado para teleportar.";
    return (
      `${movidos} aluno(s) levado(s) para a área do seu grupo.` +
      (semArea > 0 ? ` ${semArea} grupo(s) ficaram sem área definida.` : "")
    );
  }

  /**
   * `/iniciar [n [alunos]]`: macro de abertura da atividade num comando só —
   * (opcional) recria os grupos com os alunos online, zera o progresso e leva
   * cada grupo para a sua área. Sem o número, mantém os grupos como estão.
   */
  private runIniciar(clientId: number, parts: string[]): string {
    const etapas: string[] = [];
    if (parts[1] !== undefined) {
      const args =
        parts[2] !== undefined
          ? ["grupo", "criar", parts[1], parts[2]]
          : ["grupo", "criar", parts[1]];
      const r = this.runGrupo(clientId, args);
      if (!r.startsWith("grupos:")) return `Não consegui criar os grupos — ${r}`;
      etapas.push("grupos formados");
    }
    // zera o progresso E restaura as áreas ao estado autoral (a faixa volta às
    // sementes — sem isto o mundo ficaria com o que os alunos construíram)
    const repostos = this.zerarProgresso();
    etapas.push(repostos > 0 ? `áreas restauradas (${repostos} bloco(s))` : "progresso zerado");
    etapas.push(this.teleportarGrupos());
    this.broadcast({
      type: "chat",
      author: "servidor",
      text: "A atividade começou! Confira o objetivo no canto da tela.",
    });
    return `Atividade iniciada: ${etapas.join(" · ")}.`;
  }

  /** Áreas (na ordem de `alvos`, ou a shared) de um objetivo com blocos. */
  private areasDe(o: Objective): Box[] {
    return o.alvos ?? [{ min: o.min, max: o.max }];
  }

  /** Fotografa o estado AUTORAL das áreas do objetivo (para reiniciar depois). */
  private capturarBaseline(o: Objective): void {
    o.baseline = this.areasDe(o).map((box) => snapshotRegion(this.world, box));
  }

  /**
   * Repõe cada área ao seu baseline autoral. É o que faz "reiniciar" resetar de
   * verdade: sem isto os blocos que os alunos colocaram ficariam, e na aula de
   * sequência o objetivo re-concluiria na hora. Passa pelo applyBlock (mesma
   * engrenagem do /regiao encher): block_changed + fila de vizinhança + recheca
   * o objetivo. Não emparedar jogador em pé numa célula que voltaria a ser bloco.
   */
  /** Repõe UMA área (índice k) de um objetivo ao seu baseline autoral. */
  private restaurarAreaBaseline(o: Objective, k: number): number {
    const blocks = o.baseline?.[k];
    const box = this.areasDe(o)[k];
    if (!blocks || !box) return 0;
    let mudados = 0;
    let i = 0;
    for (let y = box.min.y; y <= box.max.y; y++) {
      for (let z = box.min.z; z <= box.max.z; z++) {
        for (let x = box.min.x; x <= box.max.x; x++) {
          const alvo = blocks[i++];
          if (alvo === undefined) continue;
          if (getBlock(this.world, x, y, z) === alvo) continue;
          if (alvo !== BlockId.Air && this.overlapsAnyPlayer(x, y, z)) continue;
          this.applyBlock(x, y, z, alvo);
          mudados++;
        }
      }
    }
    return mudados;
  }

  /**
   * Repõe as áreas ao baseline autoral — é o que faz "reiniciar" resetar de
   * verdade (sem isto os blocos dos alunos ficariam e a sequência re-concluiria
   * na hora). Passa pelo applyBlock (mesma engrenagem do /regiao encher).
   *
   * SEQUENCIAL: só a faixa ATIVA (primeiro objetivo incompleto) de cada escopo
   * volta à semente — assim uma TRILHA de sequências na MESMA faixa começa na 1ª;
   * as próximas entram sozinhas ao concluir (ver carregarProximaSequencia).
   * LIVRE: todas as áreas (os objetivos valem ao mesmo tempo, cada faixa é sua).
   */
  private restaurarAreasBaseline(): number {
    let mudados = 0;
    if (this.scenario.modo === "sequencial") {
      const escopos = this.grupos.size ? [...this.grupos.keys()] : [0];
      for (const g of escopos) {
        for (const id of this.activeIdsFor(g)) {
          const o = this.scenario.objetivos.find((x) => x.id === id);
          if (!o?.baseline) continue;
          mudados += this.restaurarAreaBaseline(o, g > 0 && o.alvos ? g - 1 : 0);
        }
      }
      return mudados;
    }
    for (const o of this.scenario.objetivos) {
      if (!o.baseline) continue;
      this.areasDe(o).forEach((_box, k) => {
        mudados += this.restaurarAreaBaseline(o, k);
      });
    }
    return mudados;
  }

  /**
   * SEQUENCIAL: ao concluir a sequência atual de um escopo, limpa a faixa e
   * carrega a PRÓXIMA na MESMA área — repõe o baseline do novo objetivo ativo (a
   * semente, em geral vazia). Assim o professor só cria os modelos e o aluno
   * passa por cada sequência em ordem, sem ninguém limpar a faixa à mão. Se a
   * próxima usa outra faixa (ou não há próxima), vira quase no-op.
   */
  private carregarProximaSequencia(grupo: number): void {
    for (const id of this.activeIdsFor(grupo)) {
      const o = this.scenario.objetivos.find((x) => x.id === id);
      if (!o || o.kind === "chegar" || !o.baseline) continue;
      this.restaurarAreaBaseline(o, grupo > 0 && o.alvos ? grupo - 1 : 0);
    }
  }

  /** Zera as conclusões E restaura as áreas ao estado inicial. Devolve quantos
   *  blocos foram repostos (usado por /objetivo resetar e /iniciar). */
  private zerarProgresso(): number {
    this.scenario.completos.clear();
    this.completosGrupo.clear();
    const mudados = this.restaurarAreasBaseline();
    this.broadcastObjectives();
    return mudados;
  }

  // --- Detecção de objetivo (cp12/13) ---

  /**
   * Ids ativos pro ESCOPO dado: grupo 0 = mundo/compartilhado, g ≥ 1 = grupo.
   * Sequencial = primeiro incompleto NAQUELE escopo (grupos andam em ritmos
   * diferentes); livre = todos os incompletos.
   */
  private activeIdsFor(grupo: number): Set<number> {
    const ativos = new Set<number>();
    for (const o of this.scenario.objetivos) {
      if (this.isCompleteFor(o, grupo)) continue;
      ativos.add(o.id);
      if (this.scenario.modo === "sequencial") break;
    }
    return ativos;
  }

  /** Objetivo compartilhado concluído vale pra TODO grupo; per-grupo é próprio.
   *  chegar em modo grupos é SEMPRE por grupo (mesmo com região compartilhada). */
  private isCompleteFor(o: Objective, grupo: number): boolean {
    if (this.scenario.completos.has(o.id)) return true;
    return grupo > 0 && this.completosGrupo.has(`${o.id}:${grupo}`);
  }

  private isObjectiveDone(o: Objective, box: Box): boolean {
    if (o.kind === "construir" && o.gabarito) {
      const m = matchRegion(this.world, box, o.gabarito);
      return m.corretos === m.alvo && m.extras === 0;
    }
    if (o.kind === "limpar") return countSolid(this.world, box) === 0;
    return false; // chegar conclui pelo move, não por estado do mundo
  }

  /** Chats de conclusão aguardando — saem DEPOIS do broadcast de objectives
   *  (cliente toca o som de conquista e suprime o de notificação). */
  private pendingCompletionTexts: string[] = [];

  /** Marca concluído no escopo (0 = mundo) e agenda o anúncio — NUNCA desfaz. */
  private completeObjetivo(o: Objective, grupo: number): void {
    if (this.isCompleteFor(o, grupo)) return;
    if (grupo > 0) {
      this.completosGrupo.add(`${o.id}:${grupo}`);
      this.pendingCompletionTexts.push(`grupo ${grupo} concluiu: ${o.texto}`);
    } else {
      this.scenario.completos.add(o.id);
      this.pendingCompletionTexts.push(`objetivo concluído: ${o.texto}`);
    }
  }

  /**
   * Objetivo chegar (chamado a cada move de QUALQUER jogador): com grupos, a
   * conclusão é do GRUPO de quem pisou (sem grupo = não pontua); sem grupos,
   * é do mundo. Regra "todos": grupo inteiro (online) dentro da região.
   */
  private checkChegar(clientId: number): void {
    if (this.scenario.objetivos.length === 0) return;
    const p = this.players.get(clientId);
    if (!p) return;
    const temGrupos = this.grupos.size > 0;
    const g = temGrupos ? (this.grupoDe(p.name) ?? 0) : 0;
    if (temGrupos && g === 0) return; // sem grupo não participa (avisado no HUD)
    const ativos = this.activeIdsFor(g);
    let mudou = false;
    for (const o of this.scenario.objetivos) {
      if (o.kind !== "chegar" || !ativos.has(o.id)) continue;
      if (this.isCompleteFor(o, g)) continue;
      const box = o.alvos && g > 0 ? o.alvos[g - 1] : o;
      if (!box) continue;
      const dentro = (q: { x: number; y: number; z: number }): boolean =>
        regionContains(box, Math.floor(q.x), Math.floor(q.y), Math.floor(q.z));
      let completou: boolean;
      if (o.regra === "todos") {
        // todos os membros ONLINE do escopo dentro da região ao mesmo tempo
        const membros = [...this.players.values()].filter((q) =>
          g > 0 ? this.grupos.get(g)?.has(q.name) : q.papel === "aluno",
        );
        completou = membros.length > 0 && membros.every(dentro);
      } else {
        completou = dentro(p);
      }
      if (completou) {
        this.completeObjetivo(o, g);
        mudou = true;
      }
    }
    if (mudou) this.broadcastObjectives();
  }

  private buildObjectiveStates(): ObjectiveState[] {
    const temGrupos = this.grupos.size > 0;
    const ativosMundo = this.activeIdsFor(0);
    const ativosPorGrupo = new Map<number, Set<number>>();
    if (temGrupos) {
      for (const g of this.grupos.keys()) ativosPorGrupo.set(g, this.activeIdsFor(g));
    }
    const progresso = (o: Objective, box: Box): { atual: number; total: number; extras: number } => {
      if (o.kind === "construir" && o.gabarito) {
        const m = matchRegion(this.world, box, o.gabarito);
        return { atual: m.corretos, total: m.alvo, extras: m.extras };
      }
      if (o.kind === "limpar") {
        return { atual: countSolid(this.world, box), total: 0, extras: 0 };
      }
      return { atual: 0, total: 0, extras: 0 };
    };
    return this.scenario.objetivos.map((o) => {
      const base = progresso(o, o.alvos?.[0] ?? o);
      let porGrupo: GroupObjectiveState[] | undefined;
      if (temGrupos) {
        porGrupo = [...this.grupos.keys()].map((g) => {
          const box = o.alvos?.[g - 1] ?? o;
          const prog = o.alvos ? progresso(o, box) : base;
          return {
            grupo: g,
            min: box.min,
            max: box.max,
            ...prog,
            completo: this.isCompleteFor(o, g),
            ativo: ativosPorGrupo.get(g)?.has(o.id) ?? false,
          };
        });
      }
      return {
        id: o.id,
        kind: o.kind,
        regiao: o.regiao,
        texto: o.texto,
        min: o.min,
        max: o.max,
        // sem grupos: escopo mundo; com grupos: agregado (completo = todos)
        completo: temGrupos
          ? (porGrupo?.every((s) => s.completo) ?? false)
          : this.scenario.completos.has(o.id),
        ativo: temGrupos
          ? (porGrupo?.some((s) => s.ativo) ?? false)
          : ativosMundo.has(o.id),
        ...base,
        ...(porGrupo ? { porGrupo } : {}),
      };
    });
  }

  private objectivesJson(): string {
    return JSON.stringify({
      type: "objectives",
      modo: this.scenario.modo,
      objetivos: this.buildObjectiveStates(),
    } satisfies ServerMessage);
  }

  private sendObjectives(clientId: number): void {
    this.send(clientId, this.objectivesJson());
  }

  /** Manda o cenário pra TODOS — só se mudou desde o último broadcast. */
  private broadcastObjectives(force = false): void {
    const raw = this.objectivesJson();
    if (force || raw !== this.lastObjectivesJson) {
      this.lastObjectivesJson = raw;
      for (const clientId of this.players.keys()) this.send(clientId, raw);
    }
    // anúncio de conclusão SEMPRE depois do estado novo
    for (const texto of this.pendingCompletionTexts) {
      this.broadcast({ type: "chat", author: "servidor", text: `objetivo concluído: ${texto}` });
    }
    this.pendingCompletionTexts = [];
  }

  /** Nome público do jogador no chat: nome#id (distingue nomes repetidos). */
  private authorTag(clientId: number): string {
    return `${this.players.get(clientId)?.name ?? "?"}#${clientId}`;
  }

  /** Mensagem de chat do PRÓPRIO servidor (boas-vindas, resposta de comando). */
  private sendServerChat(clientId: number, text: string): void {
    this.send(
      clientId,
      JSON.stringify({ type: "chat", author: "servidor", text } satisfies ServerMessage),
    );
  }

  /**
   * Escolhe a DOBRADIÇA de uma porta OU janela ao colocar, pelo estado do mundo
   * (backlog "pivô da porta/janela", 2026-07-20). O cliente decide só o EIXO; o
   * servidor (a autoridade) decide o lado do pivô, na ordem: (1) porta/janela
   * vizinha do MESMO tipo e eixo ⇒ dobradiça OPOSTA à dela — 2 lado a lado abrem
   * pro meio (dupla, convenção Minecraft); (2) senão, dobradiça no lado que TEM
   * parede (cubo cheio), só quando um lado tem e o outro não; (3) empate/nenhum
   * ⇒ dobradiça baixa (base, comportamento antigo). "Flanco" = eixo que o painel
   * varre (perpendicular ao que o bloco bloqueia): eixo X flanca em Z, e vice-versa.
   * `alturas` = células que o bloco ocupa em Y (porta 2, janela 1); os predicados
   * `mesmoTipo/ehEixoX/hingeAlta/comHinge` vêm da família (porta ou janela).
   */
  private escolherDobradica(
    baseId: number, x: number, y: number, z: number,
    alturas: number,
    mesmoTipo: (id: number) => boolean,
    ehEixoX: (id: number) => boolean,
    hingeAlta: (id: number) => boolean,
    comHinge: (id: number, alta: boolean) => number,
  ): number {
    const eixoX = ehEixoX(baseId);
    const dx = eixoX ? 0 : 1; // eixo X flanca em Z; eixo Z flanca em X
    const dz = eixoX ? 1 : 0;
    const cheia = (cx: number, cz: number): boolean => {
      for (let h = 0; h < alturas; h++) {
        if (isFullCube(getBlock(this.world, cx, y + h, cz))) return true;
      }
      return false;
    };
    // (1) dupla: vizinha do MESMO tipo+eixo em QUALQUER lado do flanco → oposta
    for (const s of [-1, 1] as const) {
      const nb = getBlock(this.world, x + s * dx, y, z + s * dz);
      if (mesmoTipo(nb) && ehEixoX(nb) === eixoX) {
        return comHinge(baseId, !hingeAlta(nb));
      }
    }
    // (2) parede: dobradiça no lado do flanco que tem cubo cheio (o outro, não)
    const paredeBaixa = cheia(x - dx, z - dz);
    const paredeAlta = cheia(x + dx, z + dz);
    if (paredeAlta && !paredeBaixa) return comHinge(baseId, true);
    // (3) default: dobradiça na aresta baixa (base)
    return comHinge(baseId, false);
  }

  /**
   * Aplica mudança no mundo autoritativo, avisa TODOS (inclusive o autor) e
   * marca a célula + vizinhos como sujos — é isso que faz areia (e circuitos
   * futuros) reagirem a QUALQUER mudança, sem código especial no chamador.
   */
  private applyBlock(x: number, y: number, z: number, blockId: number): void {
    this.applyBlockQuieto(x, y, z, blockId);
    this.broadcast({ type: "block_changed", x, y, z, blockId });
  }

  /** Tudo do applyBlock MENOS o broadcast — o encher em lote (cp23b) avisa a
   *  rede com UMA mensagem blocks_filled no fim; regras de vizinhança e
   *  detecção de objetivo acordam exatamente igual. */
  private applyBlockQuieto(x: number, y: number, z: number, blockId: number): void {
    // F2 streaming: edição em coluna não materializada (teleoperação: /bloco,
    // /regiao encher) gera o terreno ANTES — o bloco novo entra por cima, e a
    // vizinhança 3×3 garante as leituras das regras/validações na borda
    if (this.lazy) {
      this.garantirColunas(x - 1, z - 1, x + 1, z + 1);
      // F3 save esparso: este chunk foi EDITADO (jogador ou gravidade) → entra
      // no delta gravado. O terreno só-gerado regenera do seed, não é salvo.
      if (inBounds(this.world, x, y, z)) {
        const cx = (x / CHUNK_SIZE) | 0;
        const cz = (z / CHUNK_SIZE) | 0;
        this.editedChunks.add(chunkIndex(this.world, cx, (y / CHUNK_SIZE) | 0, cz));
        this.editedCols.add(cz * this.world.dims.x + cx); // F5: coluna editada fica residente
      }
    }
    // quadro (2026-07-19): a célula deixou de ser quadro → conteúdo morre junto
    // (o cliente limpa pelo próprio block_changed/blocks_filled; sem msg extra)
    if (!isQuadro(blockId)) this.quadros.delete(quadroKey(x, y, z));
    // §🍖 F10: idem pro container. A célula que deixa de ser fornalha/baú perde
    // o conteúdo — e como quebrar container com coisa dentro é RECUSADO no
    // `break_block`, o que morre aqui é sempre um vazio (ou uma teleoperação de
    // professor, que é escolha dele).
    //
    // A pergunta é pelo TIPO, comparando o byte VELHO com o novo, e não por
    // "o novo ainda é container?" (bug-580): trocar fornalha por baú na mesma
    // célula deixava o conteúdo da fornalha para trás, e o `use_block` seguinte
    // respondia `tipo: "fornalha"` em cima de um baú — 3 slots com barra de
    // fogo desenhados sobre um bloco que não queima nada. Assim a fornalha
    // apagada↔acesa (o MESMO tipo) segue não caindo neste ramo, e um container
    // NOVO nasce sempre limpo, sem herdar sobra de quem estava ali.
    {
      const tipoAntes = containerTipoDe(getBlock(this.world, x, y, z));
      if (containerTipoDe(blockId) !== tipoAntes) {
        this.containers.delete(containerKey(x, y, z));
        this.fecharContainerEm(x, y, z);
      }
    }
    // §🍖 F6: o índice das plantações segue o byte — plantar entra, crescer
    // reescreve a mesma chave, colher/derrubar sai. Como TODA mudança de mundo
    // passa por aqui, não existe horta fora do índice.
    {
      const key = this.packCoord(x, y, z);
      if (isPlantacao(blockId)) this.plantacoes.add(key);
      else this.plantacoes.delete(key);
    }
    setBlock(this.world, x, y, z, blockId);
    this.edicoesAplicadas++;
    this.changedThisTick.add(this.packCoord(x, y, z));
    this.markDirtyAround(x, y, z);
    // cp12/13: mudança dentro de objetivo construir/limpar → rechecar no tick
    // (mesma filosofia da fila de vizinhança: acorda por mudança, sem scan)
    for (const o of this.scenario.objetivos) {
      if (o.kind === "chegar") continue;
      if (o.alvos) {
        // per-grupo: só a área tocada recheca
        o.alvos.forEach((box, i) => {
          const g = i + 1;
          if (!this.completosGrupo.has(`${o.id}:${g}`) && regionContains(box, x, y, z)) {
            this.objetivosDirty.add(`${o.id}:${g}`);
          }
        });
      } else if (!this.scenario.completos.has(o.id) && regionContains(o, x, y, z)) {
        this.objetivosDirty.add(`${o.id}:0`);
      }
    }
  }

  /** Chave inteira única da célula (mundo ≤ 256×256×128 cabe em int32). */
  private packCoord(x: number, y: number, z: number): number {
    return (y * this.world.sizeZ + z) * this.world.sizeX + x;
  }

  /**
   * §🍖 F6: varre os chunks JÁ MATERIALIZADOS atrás de plantação e reconstrói o
   * índice. Chamado uma vez, no `restore`. Custo = os chunks que existem naquele
   * instante (num mundo lazy, só os editados que o save trouxe); chunk ausente
   * é pulado, e o streaming que vier depois traz terreno gerado, onde não há
   * horta nenhuma pra indexar.
   */
  private indexarPlantacoes(): void {
    const { dims } = this.world;
    for (let cy = 0; cy < dims.y; cy++) {
      for (let cz = 0; cz < dims.z; cz++) {
        for (let cx = 0; cx < dims.x; cx++) {
          const chunk = this.world.chunks[chunkIndex(this.world, cx, cy, cz)];
          if (!chunk) continue;
          for (let i = 0; i < chunk.length; i++) {
            if (!isPlantacao(chunk[i]!)) continue;
            const lx = i % CHUNK_SIZE;
            const resto = (i - lx) / CHUNK_SIZE;
            const lz = resto % CHUNK_SIZE;
            const ly = (resto - lz) / CHUNK_SIZE;
            this.plantacoes.add(
              this.packCoord(
                cx * CHUNK_SIZE + lx,
                cy * CHUNK_SIZE + ly,
                cz * CHUNK_SIZE + lz,
              ),
            );
          }
        }
      }
    }
  }

  /** Inverso do `packCoord`. (O laço de regras do tick desempacota inline —
   *  é caminho quente e roda por célula suja.) */
  private unpackCoord(key: number): { x: number; y: number; z: number } {
    const x = key % this.world.sizeX;
    const rest = (key - x) / this.world.sizeX;
    const z = rest % this.world.sizeZ;
    return { x, y: (rest - z) / this.world.sizeZ, z };
  }

  private markDirty(x: number, y: number, z: number): void {
    if (inBounds(this.world, x, y, z)) this.dirty.add(this.packCoord(x, y, z));
  }

  private markDirtyAround(x: number, y: number, z: number): void {
    this.markDirty(x, y, z);
    this.markDirty(x - 1, y, z);
    this.markDirty(x + 1, y, z);
    this.markDirty(x, y - 1, z);
    this.markDirty(x, y + 1, z);
    this.markDirty(x, y, z - 1);
    this.markDirty(x, y, z + 1);
  }

  private broadcast(msg: ServerMessage): void {
    const raw = JSON.stringify(msg);
    for (const clientId of this.players.keys()) this.send(clientId, raw);
  }

  private broadcastExcept(exceptId: number, msg: ServerMessage): void {
    const raw = JSON.stringify(msg);
    for (const clientId of this.players.keys()) {
      if (clientId !== exceptId) this.send(clientId, raw);
    }
  }

  /** Distância olho→centro do bloco, com folga (pos do move chega a 10 Hz). */
  private withinReach(p: SessionPlayer, x: number, y: number, z: number): boolean {
    const dx = x + 0.5 - p.x;
    const dy = y + 0.5 - (p.y + PLAYER.eyeHeight);
    const dz = z + 0.5 - p.z;
    return Math.hypot(dx, dy, dz) <= PLAYER_REACH + 2;
  }

  /** Célula (x,y,z) sobrepõe o AABB de algum jogador? (não emparedar ninguém) */
  private overlapsAnyPlayer(x: number, y: number, z: number): boolean {
    const half = PLAYER.width / 2;
    for (const p of this.players.values()) {
      if (
        x < p.x + half && x + 1 > p.x - half &&
        y < p.y + PLAYER.height && y + 1 > p.y &&
        z < p.z + half && z + 1 > p.z - half
      ) {
        return true;
      }
    }
    return false;
  }

  handleDisconnect(clientId: number): void {
    this.stream.delete(clientId); // interesse de streaming morre com a conexão
    this.wandMarks.delete(clientId); // rascunho de canto morre com a conexão
    this.tpPedidos.delete(clientId); // pedidos ENDEREÇADOS a quem saiu morrem
    this.picoQueda.delete(clientId); // §🍖 quem volta não paga a queda de ontem
    this.ultimoAtaque.delete(clientId); // §🍖 F7: cooldown de soco é de sessão
    this.avisoPvp.delete(clientId);
    this.containerAberto.delete(clientId); // §🍖 F10: painel aberto é de sessão
    // (pedidos FEITOS por quem saiu são podados no /tpa — players.has(deId))
    const p = this.players.get(clientId);
    if (!p) return;
    // mundo lembra onde o jogador parou (vai pro save; volta aqui no rejoin)
    this.roster.set(p.name, { x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch });
    // delete ANTES do broadcast — quem saiu não recebe (socket já fechou).
    this.players.delete(clientId);
    this.broadcast({ type: "player_left", id: clientId });
    this.broadcastPlayers(); // painel dos professores (2026-07-21)
  }

  /**
   * Um tick do servidor: drena a fila de células sujas marcadas até o tick
   * anterior e roda a regra de cada bloco (areia hoje; circuitos depois —
   * MESMA engrenagem). Mudanças novas sujam vizinhos pro PRÓXIMO tick, então
   * areia cai 1 célula por tick (~10 células/s). A cada SERVER_TICK_RATE
   * ticks (~1 s) emite debug_stats pra todo mundo.
   */
  tick(): void {
    const t0 = this.now();

    // Ciclo dia/noite (cp21): a hora avança de forma determinística por tick
    // (não usa o relógio de parede — hosts diferentes andam igual). SÓ visual.
    if (this.cicloAtivo) {
      this.horaDoDia = (this.horaDoDia + 24 / (DIA_SEGUNDOS * SERVER_TICK_RATE)) % 24;
    }

    this.changedThisTick.clear();
    const batch = this.dirty;
    this.dirty = new Set();
    // Teto de água por tick (proteção de FPS): conta só células de água que
    // REALMENTE mudam; ao esgotar, as demais células de água voltam pra fila e
    // escorrem no tick seguinte. Areia/portas/etc não gastam orçamento.
    let aguaOrcamento = this.aguaMaxPorTick;
    let celulas = 0; // células que a regra REALMENTE examinou neste tick
    let mudancas = 0; // blocos que as regras mudaram neste tick
    let aguaCelulas = 0;
    for (const key of batch) {
      if (this.changedThisTick.has(key)) continue; // célula já mudou neste tick
      const x = key % this.world.sizeX;
      const rest = (key - x) / this.world.sizeX;
      const z = rest % this.world.sizeZ;
      const y = (rest - z) / this.world.sizeZ;
      const atual = getBlock(this.world, x, y, z);
      const rule = ruleFor(atual);
      if (!rule) continue;
      const ehAgua = isAgua(atual);
      if (ehAgua && aguaOrcamento <= 0) {
        this.dirty.add(key); // teto atingido → escorre no próximo tick
        continue;
      }
      celulas++;
      if (ehAgua) aguaCelulas++;
      const changes = rule(this.world, x, y, z);
      if (!changes) continue;
      if (ehAgua) aguaOrcamento--; // gastou orçamento só quando houve trabalho
      for (const c of changes) {
        if (!inBounds(this.world, c.x, c.y, c.z)) continue; // regra defeituosa não vaza
        this.applyBlock(c.x, c.y, c.z, c.blockId);
        mudancas++;
      }
    }
    this.regrasCelulasSum += celulas;
    this.regrasMudancasSum += mudancas;
    this.regrasAguaSum += aguaCelulas;
    if (celulas > this.regrasCelulasMax) this.regrasCelulasMax = celulas;

    // §🍖 F6: PULSO DE CRESCIMENTO. Fora da fila de vizinhança de propósito —
    // crescer não é reação a vizinho, é tempo passando (ver `crescerPlantacao`).
    // O custo é o TAMANHO DO ÍNDICE, uma vez a cada 20 s: uma horta de turma
    // inteira tem centenas de células, não milhões, então não há teto aqui como
    // o da água. A horta anda em bloco, e ver o canteiro inteiro amadurecer
    // junto é melhor de aula do que cada pé no seu tempo.
    if (this.plantacoes.size > 0 && ++this.crescimentoTicks >= this.crescimentoPorEstagio) {
      this.crescimentoTicks = 0;
      // cópia: o applyBlock de cada mudança mexe no próprio índice
      for (const key of [...this.plantacoes]) {
        const { x, y, z } = this.unpackCoord(key);
        const changes = crescerPlantacao(this.world, x, y, z);
        if (!changes) continue;
        for (const c of changes) this.applyBlock(c.x, c.y, c.z, c.blockId);
      }
    }

    // §🍖 F10b: as fornalhas. Fora da fila de vizinhança pela MESMA razão da
    // plantação — o fogo anda por TEMPO, não porque alguém mexeu do lado.
    this.tickFornalhas();

    // cp12/13: recheca objetivos tocados por mudanças (dos jogadores E das
    // regras acima — areia caindo dentro do alvo também conta/desconta)
    if (this.objetivosDirty.size) {
      const avancaram = new Set<number>(); // escopos que concluíram a sequência ativa
      for (const key of this.objetivosDirty) {
        const [idS, gS] = key.split(":");
        const id = Number(idS);
        const g = Number(gS);
        const o = this.scenario.objetivos.find((obj) => obj.id === id);
        if (!o) continue;
        // sequencial: futuro só vale quando ativar (por grupo, se houver)
        if (!this.activeIdsFor(g).has(id)) continue;
        const box = g > 0 && o.alvos ? o.alvos[g - 1] : o;
        if (box && this.isObjectiveDone(o, box)) {
          this.completeObjetivo(o, g); // ativo + feito = conclusão nova
          avancaram.add(g);
        }
      }
      this.objetivosDirty.clear();
      // sequencial: limpa a faixa e traz a próxima sequência pra MESMA área
      if (this.scenario.modo === "sequencial") {
        for (const g of avancaram) this.carregarProximaSequencia(g);
      }
      this.broadcastObjectives(); // contadores mudaram mesmo sem conclusão
    }

    // §🍖 F2: fôlego e regeneração de quem está em sobrevivência
    this.tickVitais();

    // F2 streaming: mundo lazy manda colunas por raio de interesse
    if (this.lazy) this.streamColunas();

    const ms = this.now() - t0;
    this.tickCount++;
    this.ticksInWindow++;
    this.tickMsSum += ms;
    if (ms > this.tickMsMax) this.tickMsMax = ms;

    if (this.ticksInWindow >= SERVER_TICK_RATE) {
      this.broadcast({
        type: "debug_stats",
        tickAvgMs: +(this.tickMsSum / this.ticksInWindow).toFixed(3),
        tickMaxMs: +this.tickMsMax.toFixed(3),
        tps: this.ticksInWindow,
        // §📊 custo das regras: média por tick na janela + o pior tick dela
        regrasCelulasAvg: +(this.regrasCelulasSum / this.ticksInWindow).toFixed(1),
        regrasCelulasMax: this.regrasCelulasMax,
        regrasMudancasAvg: +(this.regrasMudancasSum / this.ticksInWindow).toFixed(1),
        regrasAguaAvg: +(this.regrasAguaSum / this.ticksInWindow).toFixed(1),
      });
      // hora nova 1×/s: o cliente interpola o céu localmente entre estas (cp21)
      this.broadcastTime();
      // §🌬️ vento 1×/s, na mesma cadência: o giro é lento (1,2°/s) e o cliente
      // suaviza entre as sincronizações — nunca anda aos trancos
      if (this.ventoAtivo) this.broadcastVento();
      // F5: libera 1×/s as colunas que ninguém quer (mundo lazy só) — segura a
      // RAM do host numa sessão longa de exploração
      if (this.lazy) this.evictColunas();
      this.tickMsSum = this.tickMsMax = this.ticksInWindow = 0;
      this.regrasCelulasSum = this.regrasCelulasMax = 0;
      this.regrasMudancasSum = this.regrasAguaSum = 0;
    }
  }

  /** Mundo lazy (streaming F2)? Host escolhe o formato de save (esparso = F3). */
  get isLazy(): boolean {
    return this.lazy;
  }

  /** F3: índices de chunk editados (delta a gravar no save esparso do mundo
   *  lazy). Vazio em mundo denso — lá salva-se o mundo inteiro. */
  editedChunkIndices(): number[] {
    return [...this.editedChunks];
  }

  /** Materializa a coluna (cx,cz) e a marca RESIDENTE (F5 eviction). Toda
   *  geração do servidor passa por aqui — a eviction só conhece o que nasceu
   *  por este caminho. */
  private gerarColuna(cx: number, cz: number): void {
    gerarColunaDeChunks(this.world, cx, cz, this.seed); // no-op se já gerada
    this.residentCols.add(cz * this.world.dims.x + cx);
  }

  /** Materializa as colunas de chunks que intersectam o retângulo de BLOCOS
   *  [bx0..bx1]×[bz0..bz1] (clampado ao mundo). */
  private garantirColunas(bx0: number, bz0: number, bx1: number, bz1: number): void {
    const c0x = Math.max(0, Math.floor(bx0 / CHUNK_SIZE));
    const c1x = Math.min(this.world.dims.x - 1, Math.floor(bx1 / CHUNK_SIZE));
    const c0z = Math.max(0, Math.floor(bz0 / CHUNK_SIZE));
    const c1z = Math.min(this.world.dims.z - 1, Math.floor(bz1 / CHUNK_SIZE));
    for (let cx = c0x; cx <= c1x; cx++) {
      for (let cz = c0z; cz <= c1z; cz++) {
        this.gerarColuna(cx, cz);
      }
    }
  }

  /**
   * F5 eviction: libera colunas materializadas que NENHUM jogador quer mais
   * (fora de raio+FOLGA de todos) e que NÃO têm edição (bytes editados só
   * vivem na RAM até o save — regenerar as perderia). Coluna liberada regenera
   * idêntica do seed quando alguém voltar. Roda 1×/s no tick do mundo lazy.
   */
  private evictColunas(): void {
    const dims = this.world.dims;
    // pré-computa o centro/raio de interesse de cada jogador
    const interesses: { pcx: number; pcz: number; raio: number }[] = [];
    for (const [clientId, p] of this.players) {
      const st = this.stream.get(clientId);
      if (!st) continue;
      interesses.push({
        pcx: Math.max(0, Math.min(dims.x - 1, Math.floor(p.x / CHUNK_SIZE))),
        pcz: Math.max(0, Math.min(dims.z - 1, Math.floor(p.z / CHUNK_SIZE))),
        raio: st.raio + FOLGA_DESCARTE,
      });
    }
    for (const key of this.residentCols) {
      if (this.editedCols.has(key)) continue; // edição fica residente
      const cx = key % dims.x;
      const cz = (key - cx) / dims.x;
      const querido = interesses.some(
        (i) => Math.max(Math.abs(cx - i.pcx), Math.abs(cz - i.pcz)) <= i.raio,
      );
      if (querido) continue;
      // libera os bytes de todos os cy da coluna
      for (let cy = 0; cy < dims.y; cy++) {
        this.world.chunks[chunkIndex(this.world, cx, cy, cz)] = undefined;
      }
      this.residentCols.delete(key);
    }
  }

  /** F5: nº de colunas materializadas no servidor (debug/telemetria). */
  get residentColCount(): number {
    return this.residentCols.size;
  }

  /**
   * Motor de interesse (F2): por jogador, anda em ANÉIS do mais perto pro mais
   * longe e envia até `colunasPorTick` colunas que ainda faltam (materializa
   * na hora). Coluna além de raio+FOLGA_DESCARTE é esquecida — o cliente
   * descarta pela MESMA regra, então voltar re-envia sem mensagem de unload.
   */
  private streamColunas(): void {
    const dims = this.world.dims;
    for (const [clientId, p] of this.players) {
      const st = this.stream.get(clientId);
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
            this.gerarColuna(cx, cz);
            st.enviadas.add(key);
            lote.push({ cx, cz });
            if (lote.length >= this.colunasPorTick) break anel;
          }
        }
      }
      if (lote.length > 0) this.send(clientId, encodeColunas(this.world, lote));
    }
  }
}
