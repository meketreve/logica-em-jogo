import { MAX_PIN_ATTEMPTS, PIN_LOCKOUT_MS, type Papel, isValidPin, sanitizeName } from "./auth";
import {
  BlockId,
  ITEM_BALDE_AGUA,
  ITEM_BALDE_VAZIO,
  camaHeadDir,
  isAgua,
  isAguaFonte,
  isBreakable,
  isCama,
  isFullCube,
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
  type Inventario,
  contar,
  definirSlot,
  moverSlot,
  parseInventario,
  remover,
} from "./inventario";
import { MAX_QUADRO_TEXTO, type QuadroConteudo, quadroKey } from "./quadros";
import {
  type Container,
  containerDeSave,
  containerKey,
  containerTemConteudo,
  containerTipoDe,
  moverEntre,
} from "./containers";
import {
  avisarContainer,
  avisarContainerCheio,
  containerDe,
  containersParaSave,
  fecharContainer,
  fecharContainerEm,
  sendContainer,
  tickFornalhas,
} from "./session/containers";
import {
  activeIdsFor,
  broadcastObjectives,
  carregarProximaSequencia,
  checkChegar,
  completeObjetivo,
  isObjectiveDone,
  runObjetivo,
  sendObjectives,
} from "./session/cenario";
import {
  broadcastGroups,
  claimBloqueia,
  confinaBloqueia,
  equipeDe,
  grupoDe,
  runAmigos,
  runClaim,
  runGrupo,
  sendClaims,
  sendFriends,
  sendGroup,
  sendGroups,
} from "./session/equipes";
import {
  runIniciar,
  runTp,
  runTpa,
  runTpr,
  teleportarGrupos,
} from "./session/tp";
import { parseCoordArg } from "./session/coords";
import {
  broadcastTime,
  broadcastVento,
  runCiclo,
  runHora,
  runVento,
  runVoo,
  sendTime,
  sendVento,
  sendVoo,
} from "./session/ambiente";
import { modoDe, runModo, runPvp, runRegra, sendModo } from "./session/modo";
import {
  acompanharQueda,
  atacar,
  esforcar,
  sendVida,
  temFome,
  tickVitais,
  vitalDe,
} from "./session/vitais";
import {
  avisarMochilaCheia,
  gastarItem,
  guardarDrops,
  inventarioDe,
  inventarioVale,
  cabemTodos,
  inventarioParaRoster,
  runDar,
  sendInventario,
} from "./session/inventario";
import { runConfinar } from "./session/equipes";
import { runRegiao } from "./session/regioes";
import { avisarComFreio } from "./session/avisos";
import { evictColunas, garantirColunas, gerarColuna, streamColunas } from "./session/streaming";
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
} from "./modo";
import { PLAYER } from "./physics";
import { parseRegras, regrasParaSave } from "./regras";
import {
  EXAUSTAO_POR_BLOCO_ANDADO,
  EXAUSTAO_POR_EDICAO,
  type EstadoVital,
  FOME_MAX,
  PASSO_MAX_POR_AMOSTRA,
  VIDA_MAX,
  novoEstadoVital,
  saciar,
} from "./sobrevivencia";
import {
  COLUNAS_POR_TICK_PADRAO,
  FOLGA_DESCARTE,
  PEDIDOS_COLUNA_POR_S,
  RAIO_MAX,
  RAIO_MIN,
  RAIO_PADRAO,
  type ServerMessage,
  encodeLazyInfo,
  encodeSnapshot,
  parseClientMessage,
} from "./protocol";
import {
  type NamedRegion,
  type Vec3i,
  regionContains,
} from "./regions";
import {
  type Claim,
} from "./claims";
import { TICKS_POR_CRESCIMENTO, crescerPlantacao, ruleFor } from "./rules";
import { type SaveData, type SaveMeta } from "./save";
import {
  type Objective,
  type ScenarioModo,
} from "./scenario";
import {
  type World,
  type WorldDims,
  chunkIndex,
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

export interface SessionPlayer {
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

export class GameSession {
  /**
   * ⚠️ **Por que quase nada aqui é `private`** (corte por domínio, 2026-08-06):
   * o servidor autoritativo é grande demais para um arquivo só, então ele se
   * divide em `session/` — cenário, equipes, vitais, inventário, containers,
   * regiões, streaming. TypeScript não tem visibilidade de PACOTE: `private` só
   * vale dentro do corpo da classe, e um módulo irmão não alcançaria o campo.
   *
   * O que NÃO muda: estes membros continuam INTERNOS. Nada fora de
   * `shared/src/session.ts` e `shared/src/session/` os toca — os 715 testes
   * usam só a API pública (`handleMessage`, `tick`, `toSave`, `adotar`,
   * `banir`…). Se um teste precisar espiar um campo daqui, o certo é expor um
   * método, não ler o campo.
   */
  readonly world: World;
  readonly seed: number;
  /** Spawn FIXO: calculado uma vez sobre o terreno pristino (na criação).
   *  Nunca recalcular no join — o mundo pode já estar escavado (bug-010). */
  readonly spawn: { x: number; y: number; z: number };
  tickCount = 0;

  /** Hora do dia (0..24) do ciclo dia/noite (cp21). Server-autoritativa; SÓ
   *  visual (não afeta física/jogo). Mundo NOVO nasce ao meio-dia; PERSISTE no
   *  save (sobrevivência continua a hora — restore sobrescreve). */
  horaDoDia = HORA_PADRAO;
  /** O ciclo avança sozinho? Mundo de atividade nasce PARADO (dia permanente);
   *  professor liga/desliga com /ciclo; persiste no save. */
  cicloAtivo = false;
  /** Voo do modo criativo LIBERADO pra turma? O professor voa sempre; este
   *  flag decide se os alunos também podem (professor alterna com /voo).
   *  Transitório — NÃO persiste no save (nasce desligado a cada sessão). */
  vooLiberado = false;
  /** O vento sopra? (§🌬️) SÓ visual — água/nuvens/folhas seguem, física não.
   *  Nasce LIGADO (é ambiência, não regra de atividade); o professor desliga
   *  com /vento quando quer o cenário parado. Persiste no save. */
  ventoAtivo = true;
  /** Modo de jogo PADRÃO do mundo (§🍖 F1). Persiste no save; mundo-aula força
   *  criativo (não é escolha do professor: o host impõe, como o confinamento). */
  modoMundo: Modo = MODO_PADRAO;
  /** Override pessoal de modo, por NOME (não por id de cliente — o modo tem de
   *  sobreviver ao rejoin, igual ao roster). Vence o padrão do mundo. Persiste. */
  readonly modosPorJogador = new Map<string, Modo>();
  /** Regras de mundo (`/regra`, §🍖 F1) — guarda SÓ o que difere do padrão do
   *  registro (`regras.ts`). Persiste no save como MAPA. */
  readonly regras = new Map<string, boolean>();
  /** Mundo de aula/atividade (read-only): trava o modo em criativo. */
  readonly somenteLeitura: boolean;
  /** §🍖 F2: vida/fome/fôlego por NOME (como o modo — sobrevive ao rejoin).
   *  Só quem está machucado vai pro save. */
  readonly vitais = new Map<string, EstadoVital>();
  /** §🍖 F2: ponto MAIS ALTO desde a última vez que o jogador estava apoiado,
   *  por cliente. A queda é fechada quando ele pousa. Rascunho de sessão: some
   *  no disconnect (quem volta não paga a queda de ontem). */
  readonly picoQueda = new Map<number, number>();
  /** §🍖 F4: inventário AUTORITATIVO por NOME (mesma disciplina do modo e dos
   *  vitais — a mochila sobrevive ao rejoin e à troca de aula). Só existe
   *  entrada pra quem já pegou alguma coisa; criativo nunca cria uma. */
  readonly inventarios = new Map<string, Inventario>();
  /** §🍖 F4: quando cada cliente ouviu "mochila cheia" pela última vez.
   *  Rascunho de sessão (some no disconnect) — é só o freio do aviso. */
  readonly avisoMochila = new Map<number, number>();
  /** §🍖 F7: tick do último soco de cada cliente (o cooldown do ataque). Em
   *  TICKS, não em relógio de parede — mesma disciplina do ciclo e do vento.
   *  Rascunho de sessão: some no disconnect (quem volta bate na hora). */
  readonly ultimoAtaque = new Map<number, number>();
  /** §🍖 F7: quando cada cliente ouviu "o pvp está desligado". Freio do aviso,
   *  igual ao da mochila cheia. */
  readonly avisoPvp = new Map<number, number>();

  readonly players = new Map<number, SessionPlayer>();
  /** Última POSIÇÃO conhecida por nome: volta onde parou, olhando pra onde
   *  olhava. Identidade (PIN/papel) mora no mapa separado `identity`. */
  readonly roster = new Map<
    string,
    { x: number; y: number; z: number; yaw: number; pitch: number }
  >();
  /** PIN e papel por nome (cp9). Vazio no singleplayer — ver SessionOptions. */
  readonly identity = new Map<string, Identity>();
  /** Regiões nomeadas (cp11), chave = nome. Persistem no meta do save. */
  readonly regions = new Map<string, NamedRegion>();
  /** Cantos pendentes da varinha, por cliente (não persistem — são rascunho). */
  readonly wandMarks = new Map<number, { c1?: Vec3i; c2?: Vec3i }>();
  /** Pedidos de /tpr pendentes, por DESTINATÁRIO (id do cliente). Rascunho de
   *  sessão: não persiste, expira em TP_PEDIDO_MS e morre no disconnect. */
  readonly tpPedidos = new Map<
    number,
    { deId: number; deNome: string; expira: number }[]
  >();
  /** Cenário (cp12): objetivos + progresso do MUNDO. Persiste no save. */
  readonly scenario: {
    modo: ScenarioModo;
    objetivos: Objective[];
    completos: Set<number>;
  } = { modo: "sequencial", objetivos: [], completos: new Set() };
  nextObjetivoId = 1;
  /** Objetivos a rechecar no fim do tick (applyBlock marca — regra de ouro:
   *  detecção acorda por MUDANÇA, nunca por varredura periódica do mundo).
   *  Chave `${objetivoId}:${grupo}` — grupo 0 = área compartilhada/mundo. */
  readonly objetivosDirty = new Set<string>();
  /** Último estado de cenário enviado (JSON) — evita broadcast repetido.
   */
  lastObjectivesJson = "";
  /** Chats de conclusão aguardando — saem DEPOIS do broadcast de objectives
   *  (cliente toca o som de conquista e suprime o de notificação).
   */
  pendingCompletionTexts: string[] = [];
  /** Grupos (cp13): id → nomes dos membros. Persiste no save. */
  readonly grupos = new Map<number, Set<string>>();
  /** Conclusões POR GRUPO, chave `${objetivoId}:${grupo}`. Persiste. */
  completosGrupo = new Set<string>();
  /** Anti-griefing (cp24): proteção de áreas ligada? Professor alterna. Persiste. */
  claimsAtivo = false;
  /** Claims por aluno (chave = nome do dono; 1 por aluno). Persiste. */
  readonly claims = new Map<string, Claim>();
  /** Grupos de amigos (chave = dono; valor = membros SEM o dono). Persiste. */
  readonly amigos = new Map<string, Set<string>>();
  /** Convites de amigo pendentes: convidado → donos que convidaram. Rascunho
   *  de sessão, NÃO persiste (morre no reboot). */
  readonly convitesAmigo = new Map<string, Set<string>>();
  /** Nicks banidos pelo professor (2026-07-21). O join recusa quem está aqui;
   *  persiste no save de mundo livre (some em mundo-aula read-only). Guardado
   *  como o nick digitado; a checagem é case-insensitive. */
  private readonly banidos = new Set<string>();
  /** Confinamento (cp25): o aluno só coloca/quebra DENTRO da área do seu grupo.
   *  Inverte o claim (confina em vez de proteger). Professor alterna (/confinar)
   *  e em mundo-aula nasce ligado (opts.somenteLeitura). Persiste no save de
   *  mundo livre; em aula não salva (read-only) — reseta por turma. */
  confinamentoAtivo = false;
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
  readonly containers = new Map<string, Container>();
  /** §🍖 F10: qual container cada cliente está com ABERTO (id → célula). É por
   *  ele que o servidor sabe pra quem mandar `container` quando o conteúdo muda
   *  — inclusive quando muda sozinho, no tick da fornalha. */
  readonly containerAberto = new Map<number, Vec3i>();
  /** Tentativas erradas de PIN por nome — rate-limit da ameaça real (colega
   *  na LAN chutando 10 mil combinações). Não persiste no save. */
  private readonly pinFails = new Map<string, { fails: number; lockedUntil: number }>();
  private codigoFails = 0;
  private codigoLockedUntil = 0;
  private readonly singleplayer: boolean;
  private readonly codigo: string | undefined;
  readonly now: () => number;
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
  readonly colunasPorTick: number;
  /** Teto de mudanças de água por tick (proteção de FPS). Excedente escorre no
   *  tick seguinte. Configurável via LJ_AGUA_TICK no host. */
  private readonly aguaMaxPorTick: number;
  /** Estado de streaming por cliente: raio de interesse + colunas já enviadas
   *  (chave = cz*dims.x+cx). Sai do raio+folga = esquece → re-envia na volta
   *  (cliente descarta pela MESMA regra — sem mensagem de unload). */
  readonly stream = new Map<
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
  readonly residentCols = new Set<number>();
  /** F5: colunas com edição (chave de coluna) — derivado de editedChunks, pra
   *  a eviction consultar rápido. Coluna editada NUNCA é liberada (os bytes
   *  editados só vivem na RAM até o save). */
  readonly editedCols = new Set<number>();
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
    readonly send: SendFn,
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
          gerarColuna(this, cx, cz); // no-op se já gerada; marca residente
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
            gerarColuna(this, ccx + dx, ccz + dz);
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
    const containersSalvos = containersParaSave(this);
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
          inventario: inventarioParaRoster(this, name),
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
        acompanharQueda(this, clientId, p);
        if (passo <= PASSO_MAX_POR_AMOSTRA) {
          esforcar(this, clientId, passo * EXAUSTAO_POR_BLOCO_ANDADO);
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
        checkChegar(this, clientId);
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
          inventarioVale(this, clientId) &&
          contar(inventarioDe(this, p.name), formaCanonica(msg.blockId)) < 1
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
            claimBloqueia(this, clientId, msg.x, msg.y, msg.z) ??
            (isPorta(msg.blockId) ? claimBloqueia(this, clientId, msg.x, msg.y + 1, msg.z) : null) ??
            (camaDir ? claimBloqueia(this, clientId, msg.x + camaDir.dx, msg.y, msg.z + camaDir.dz) : null) ??
            confinaBloqueia(this, clientId, msg.x, msg.y, msg.z) ??
            (isPorta(msg.blockId) ? confinaBloqueia(this, clientId, msg.x, msg.y + 1, msg.z) : null) ??
            (camaDir ? confinaBloqueia(this, clientId, msg.x + camaDir.dx, msg.y, msg.z + camaDir.dz) : null);
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
            claimBloqueia(this, clientId, msg.x, msg.y, msg.z) ??
            confinaBloqueia(this, clientId, msg.x, msg.y, msg.z);
          if (bloqueio) {
            this.sendServerChat(clientId, bloqueio);
            return;
          }
          this.containerAberto.set(clientId, { x: msg.x, y: msg.y, z: msg.z });
          sendContainer(this, clientId, msg.x, msg.y, msg.z);
          return;
        }
        if (!isInterativo(id)) return; // porta (cp23) e janela (2026-07-19)
        {
          const bloqueio =
            claimBloqueia(this, clientId, msg.x, msg.y, msg.z) ??
            confinaBloqueia(this, clientId, msg.x, msg.y, msg.z);
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
            claimBloqueia(this, clientId, msg.x, msg.y, msg.z) ??
            confinaBloqueia(this, clientId, msg.x, msg.y, msg.z);
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
            claimBloqueia(this, clientId, msg.x, msg.y, msg.z) ??
            confinaBloqueia(this, clientId, msg.x, msg.y, msg.z);
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
        if (inventarioVale(this, clientId)) {
          const falta = faltaFerramenta(inventarioDe(this, p.name), current);
          if (falta) {
            avisarComFreio(this, clientId, falta);
            return;
          }
        }
        // §🍖 F10: container com coisa dentro NÃO QUEBRA (decisão do usuário
        // pro baú, estendida à fornalha porque a regra é a mesma e a frase é a
        // mesma). Sem isto, um clique perdia a mochila inteira que o colega
        // guardou — e não existe item no chão pra devolver. Vale inclusive em
        // criativo: o professor que quebra um baú cheio também não quer isso.
        {
          const cont = containerDe(this, msg.x, msg.y, msg.z, current);
          if (cont && containerTemConteudo(cont)) {
            avisarContainerCheio(this, clientId);
            return;
          }
        }
        // §🍖 F4: quebrar DÁ o que a tabela diz — e, se não couber, NÃO QUEBRA.
        // Não existe item no chão (decisão travada no ROADMAP §🍖): recusar é
        // mais honesto que fazer o bloco evaporar. A conferência vem ANTES do
        // applyBlock justamente pra que a recusa não deixe rastro no mundo.
        const drops = inventarioVale(this, clientId) ? dropsDe(current) : [];
        if (drops.length && !cabemTodos(inventarioDe(this, p.name), drops)) {
          avisarMochilaCheia(this, clientId);
          return;
        }
        this.applyBlock(msg.x, msg.y, msg.z, BlockId.Air);
        // Crédito DEPOIS do mundo mudar: a mochila e a célula andam juntas, e a
        // segunda metade da porta/cama, que o `doorRule`/`camaRule` apaga no
        // tick seguinte, NÃO passa por aqui (uma porta não vira duas).
        guardarDrops(this, clientId, drops);
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
            claimBloqueia(this, clientId, msg.x, msg.y, msg.z) ??
            confinaBloqueia(this, clientId, msg.x, msg.y, msg.z);
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
        const survival = inventarioVale(this, clientId);
        if (survival) {
          const precisa = msg.encher ? ITEM_BALDE_VAZIO : ITEM_BALDE_AGUA;
          if (msg.slot === undefined || inventarioDe(this, p.name)[msg.slot]?.id !== precisa) return;
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
            definirSlot(inventarioDe(this, p.name), msg.slot, { id: novo, qtd: 1 }),
          );
          sendInventario(this, clientId);
        }
        break;
      }
      case "comer": {
        // §🍖 F6: comer é a única ação que consome item SEM tocar no mundo — não
        // tem célula, não tem alcance, não tem claim. Só a mochila e a barra.
        const p = this.players.get(clientId);
        if (!p || !inventarioVale(this, clientId)) return;
        const item = inventarioDe(this, p.name)[msg.slot];
        if (!item || !isComida(item.id)) return;
        // barriga cheia RECUSA a mordida (senão o clique jogaria comida fora).
        // Com a regra `fome` desligada nunca há fome pra encher, então comer
        // vira no-op — e é o certo: mundo sem fome não gasta comida.
        if (!temFome(this)) return;
        const antes = vitalDe(this, p.name);
        const depois = saciar(antes, saciedadeDe(item.id));
        if (depois === antes) return; // barriga cheia (ou morto): não gasta
        const { inv, removido } = remover(inventarioDe(this, p.name), item.id, 1);
        if (!removido) return;
        // os dois lados mudam JUNTOS ou nenhum muda: a barra só sobe depois de
        // a comida sair da mochila de verdade
        this.inventarios.set(p.name, inv);
        this.vitais.set(p.name, depois);
        sendInventario(this, clientId);
        sendVida(this, clientId);
        break;
      }
      case "atacar": {
        // §🍖 F7: soco em outro jogador. O cliente manda só a INTENÇÃO (o id do
        // alvo); quem confere regra, modo, alcance e cooldown é aqui.
        atacar(this, clientId, msg.alvo);
        break;
      }
      case "mover_item": {
        // §🍖 F4: o aluno arruma a mochila. O cliente NÃO decide — manda os dois
        // índices e recebe o inventário inteiro de volta. `moverSlot` devolve o
        // mesmo objeto quando o movimento é impossível (índice do fio, origem
        // vazia, destino cheio), e aí nem mensagem sai.
        const p = this.players.get(clientId);
        if (!p || !inventarioVale(this, clientId)) return;
        const antes = inventarioDe(this, p.name);
        const depois = moverSlot(antes, msg.de, msg.para);
        if (depois === antes) return;
        this.inventarios.set(p.name, depois);
        sendInventario(this, clientId);
        break;
      }
      case "mover_container": {
        // §🍖 F10: transferência mochila↔container. O cliente manda dois
        // índices no espaço UNIFICADO e recebe os dois inventários de volta —
        // ele nunca escreve nem a mochila nem o baú.
        const p = this.players.get(clientId);
        if (!p || !inventarioVale(this, clientId)) return;
        // o aluno tem de estar com ESTE container aberto: sem isto, o fio podia
        // mexer em qualquer baú do mapa sem nunca ter chegado perto dele
        const aberto = this.containerAberto.get(clientId);
        if (!aberto || aberto.x !== msg.x || aberto.y !== msg.y || aberto.z !== msg.z) return;
        if (!inBounds(this.world, msg.x, msg.y, msg.z)) return;
        // alcance e claim RECONFERIDOS a cada movimento: quem abriu o baú e
        // saiu andando (ou perdeu o direito no meio) para aqui
        if (!this.withinReach(p, msg.x, msg.y, msg.z)) return;
        if (
          claimBloqueia(this, clientId, msg.x, msg.y, msg.z) ??
          confinaBloqueia(this, clientId, msg.x, msg.y, msg.z)
        ) {
          fecharContainer(this, clientId);
          return;
        }
        const atual = getBlock(this.world, msg.x, msg.y, msg.z);
        const cont = containerDe(this, msg.x, msg.y, msg.z, atual);
        if (!cont) return;
        const r = moverEntre(inventarioDe(this, p.name), cont, msg.de, msg.para);
        if (!r) return; // índice inválido, origem vazia, destino cheio/proibido
        this.inventarios.set(p.name, r.mochila);
        this.containers.set(containerKey(msg.x, msg.y, msg.z), r.container);
        sendInventario(this, clientId);
        // TODOS os que estão com este container aberto recebem o conteúdo novo
        // — senão um item some na cara do colega (o caso que a mochila não tem)
        avisarContainer(this, msg.x, msg.y, msg.z);
        break;
      }
      case "fechar_container": {
        // CONFIRMA (bug-593). Sem a resposta o cliente não tem como saber quais
        // `container` ainda vêm por aí: a fornalha cozinhando manda 10×/s, e os
        // que já estavam no fio quando o pedido chegou reabririam o painel que o
        // aluno acabou de fechar — um painel que o servidor já esqueceu.
        fecharContainer(this, clientId);
        break;
      }
      case "fabricar": {
        // §🍖 F5: o aluno pediu uma receita pelo índice. O cliente NÃO decide —
        // o servidor confere ingredientes e espaço e responde com a mochila
        // inteira. Fora da sobrevivência (criativo tem paleta infinita) e
        // índice inválido são no-op silencioso, como o resto das ações.
        const p = this.players.get(clientId);
        if (!p || !inventarioVale(this, clientId) || !receitaValida(msg.receita)) return;
        const antes = inventarioDe(this, p.name);
        const depois = fabricar(antes, RECEITAS[msg.receita]!);
        if (depois === null) return; // faltou ingrediente ou mochila cheia
        this.inventarios.set(p.name, depois);
        sendInventario(this, clientId);
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
      esforcar(this, clientId, EXAUSTAO_POR_EDICAO);
    }
    // §🍖 F4: o DÉBITO mora no mesmo lugar e pelo mesmo motivo — "o mundo
    // mudou" é o mesmo que "a colocação valeu", e uma colocação que materializa
    // 2 células (porta, cama) custa UM item, não dois.
    if (msg.type === "place_block" && mundoMudou) {
      gastarItem(this, clientId, formaCanonica(msg.blockId));
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
        return runRegiao(this, clientId, parts);
      }
      case "objetivo": {
        if (!professor) return "Somente o professor pode usar /objetivo.";
        return runObjetivo(this, parts);
      }
      case "grupo":
        return runGrupo(this, clientId, parts);
      case "tp": {
        if (!professor) {
          return "Somente o professor pode usar /tp. Para pedir teleporte até um colega, use /tpr nome.";
        }
        if (parts[1] === "grupos") return teleportarGrupos(this);
        return runTp(this, clientId, parts);
      }
      case "tpr":
        return runTpr(this, clientId, parts);
      case "tpa":
        return runTpa(this, clientId, parts);
      case "iniciar": {
        if (!professor) return "Somente o professor pode iniciar a atividade.";
        return runIniciar(this, clientId, parts);
      }
      case "hora": {
        // consultar a hora (`/hora` sem argumento) é de todos; MUDAR é do professor
        if (parts.length > 1 && !professor) return "Somente o professor pode mudar a hora do dia.";
        return runHora(this, parts, professor);
      }
      case "ciclo": {
        if (!professor) return "Somente o professor pode controlar o ciclo de dia e noite.";
        return runCiclo(this, parts);
      }
      case "voo": {
        if (!professor) return "Somente o professor pode liberar o voo. Você pode voar quando o professor liberar.";
        return runVoo(this, parts);
      }
      case "vento": {
        // consultar (`/vento` sem argumento) ALTERNA, então é do professor inteiro
        if (!professor) return "Somente o professor pode controlar o vento.";
        return runVento(this, parts);
      }
      case "modo": {
        // consultar (`/modo` sem argumento) é de TODOS — o aluno precisa saber
        // em que modo está; MUDAR é do professor
        if (parts.length > 1 && !professor) {
          return "Somente o professor pode mudar o modo de jogo. Use /modo para ver em qual você está.";
        }
        return runModo(this, clientId, parts);
      }
      case "regra": {
        if (parts.length > 2 && !professor) {
          return "Somente o professor pode mudar as regras do mundo. Use /regra para ver quais estão valendo.";
        }
        return runRegra(this, parts);
      }
      case "pvp": {
        // §🍖 F7: atalho pra `/regra pvp`, no molde do `/hora` — consultar é de
        // todos (o aluno precisa saber se pode apanhar), ligar/desligar é do
        // professor. Não é regra nova: é a MESMA entrada do registro.
        if (parts.length > 1 && !professor) {
          return "Somente o professor pode ligar ou desligar o ataque entre jogadores. Use /pvp para ver como está.";
        }
        return runPvp(this, parts);
      }
      case "dar": {
        if (!professor) return "Somente o professor pode usar /dar.";
        return runDar(this, clientId, parts);
      }
      case "claim":
        return runClaim(this, clientId, parts);
      case "amigos":
        return runAmigos(this, clientId, parts);
      case "confinar": {
        if (!professor) return "Somente o professor pode controlar o confinamento das áreas.";
        return runConfinar(this, parts);
      }
      default:
        return `Comando desconhecido: ${text}. Os comandos disponíveis são /bloco, /resetpin, /regiao, /objetivo, /grupo, /tp, /tpr, /tpa, /iniciar, /hora, /ciclo, /vento, /voo, /modo, /regra, /pvp, /claim, /amigos e /confinar.`;
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
    sendTime(this, clientId); // céu certo desde o primeiro frame (cp21)
    sendVento(this, clientId); // §🌬️ idem vento: água já entra andando pro lado certo
    // §🍖 F1: modo SEMPRE, mesmo criativo (ao contrário do /voo, que só manda
    // quando liberado). Troca de aula é sessão NOVA e reusa este caminho: sem o
    // envio incondicional, quem estava em sobrevivência no mundo anterior
    // continuaria "em sobrevivência" num mundo criativo (família do bug-518).
    sendModo(this, clientId);
    // §🍖 F2: entrar não é cair, e quem volta machucado precisa ver os corações
    this.picoQueda.set(clientId, start.y);
    if (modoDe(this, name) === "sobrevivencia") {
      sendVida(this, clientId);
      // §🍖 F4: a mochila é por NOME, então quem volta encontra o que cavou
      // ontem. Em criativo a mensagem NÃO vai — ausência é o que diz ao cliente
      // "aqui a paleta é infinita".
      sendInventario(this, clientId);
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
    if (this.vooLiberado) sendVoo(this, clientId);
    // grupos (cp13): aluno novo cai no MENOR grupo ("até não ter aluno sem
    // grupo"); quem já tinha grupo salvo continua nele
    let entrouEmGrupo = false;
    if (this.grupos.size && papel === "aluno" && grupoDe(this, name) === null) {
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
      sendGroup(this, clientId);
      // composição pro painel (cp14): mudou = avisa todos; senão só o novo
      if (entrouEmGrupo) broadcastGroups(this);
      else sendGroups(this, clientId);
    }
    // cenário vai pra TODOS (HUD do aluno vive disto)
    if (this.scenario.objetivos.length) sendObjectives(this, clientId);
    // cp24: claims — TODOS recebem (todo mundo vê as áreas protegidas e sabe se
    // a proteção está ligada). Só manda se há algo a mostrar (senão zero churn).
    if (this.claimsAtivo || this.claims.size) sendClaims(this, clientId);
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
    if (equipeDe(this, name) !== null || this.convitesAmigo.get(name)?.size) {
      sendFriends(this, clientId);
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
  broadcastRegions(): void {
    for (const [id, p] of this.players) {
      if (p.papel === "professor") this.sendRegions(id);
    }
  }


  /** Nome público do jogador no chat: nome#id (distingue nomes repetidos). */
  private authorTag(clientId: number): string {
    return `${this.players.get(clientId)?.name ?? "?"}#${clientId}`;
  }

  /** Mensagem de chat do PRÓPRIO servidor (boas-vindas, resposta de comando). */
  sendServerChat(clientId: number, text: string): void {
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
  applyBlock(x: number, y: number, z: number, blockId: number): void {
    this.applyBlockQuieto(x, y, z, blockId);
    this.broadcast({ type: "block_changed", x, y, z, blockId });
  }

  /** Tudo do applyBlock MENOS o broadcast — o encher em lote (cp23b) avisa a
   *  rede com UMA mensagem blocks_filled no fim; regras de vizinhança e
   *  detecção de objetivo acordam exatamente igual. */
  applyBlockQuieto(x: number, y: number, z: number, blockId: number): void {
    // F2 streaming: edição em coluna não materializada (teleoperação: /bloco,
    // /regiao encher) gera o terreno ANTES — o bloco novo entra por cima, e a
    // vizinhança 3×3 garante as leituras das regras/validações na borda
    if (this.lazy) {
      garantirColunas(this, x - 1, z - 1, x + 1, z + 1);
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
        fecharContainerEm(this, x, y, z);
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

  broadcast(msg: ServerMessage): void {
    const raw = JSON.stringify(msg);
    for (const clientId of this.players.keys()) this.send(clientId, raw);
  }

  broadcastExcept(exceptId: number, msg: ServerMessage): void {
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
  overlapsAnyPlayer(x: number, y: number, z: number): boolean {
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
    tickFornalhas(this);

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
        if (!activeIdsFor(this, g).has(id)) continue;
        const box = g > 0 && o.alvos ? o.alvos[g - 1] : o;
        if (box && isObjectiveDone(this, o, box)) {
          completeObjetivo(this, o, g); // ativo + feito = conclusão nova
          avancaram.add(g);
        }
      }
      this.objetivosDirty.clear();
      // sequencial: limpa a faixa e traz a próxima sequência pra MESMA área
      if (this.scenario.modo === "sequencial") {
        for (const g of avancaram) carregarProximaSequencia(this, g);
      }
      broadcastObjectives(this); // contadores mudaram mesmo sem conclusão
    }

    // §🍖 F2: fôlego e regeneração de quem está em sobrevivência
    tickVitais(this);

    // F2 streaming: mundo lazy manda colunas por raio de interesse
    if (this.lazy) streamColunas(this);

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
      broadcastTime(this);
      // §🌬️ vento 1×/s, na mesma cadência: o giro é lento (1,2°/s) e o cliente
      // suaviza entre as sincronizações — nunca anda aos trancos
      if (this.ventoAtivo) broadcastVento(this);
      // F5: libera 1×/s as colunas que ninguém quer (mundo lazy só) — segura a
      // RAM do host numa sessão longa de exploração
      if (this.lazy) evictColunas(this);
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


  /** F5: nº de colunas materializadas no servidor (debug/telemetria). */
  get residentColCount(): number {
    return this.residentCols.size;
  }
}
