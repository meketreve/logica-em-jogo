import { MAX_PIN_ATTEMPTS, PIN_LOCKOUT_MS, type Papel, isValidPin } from "./auth";
import { BlockId, isBreakable, isPlaceable } from "./blocks";
import {
  CHUNK_SIZE,
  DEFAULT_WORLD_CHUNKS,
  MAX_CHAT_LENGTH,
  MAX_NAME_LENGTH,
  PLAYER_REACH,
  SERVER_TICK_RATE,
} from "./constants";
import { PLAYER } from "./physics";
import {
  type ServerMessage,
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
import { ruleFor } from "./rules";
import { type SaveData, type SaveMeta } from "./save";
import { MAX_GRUPOS } from "./groups";
import {
  type Box,
  type GroupObjectiveState,
  MAX_OBJETIVOS,
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
import { type World, type WorldDims, findSpawnY, getBlock, inBounds, setBlock } from "./world";
import { type WorldPreset, generateWorldForPreset } from "./worldgen";

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

export class GameSession {
  readonly world: World;
  readonly seed: number;
  /** Spawn FIXO: calculado uma vez sobre o terreno pristino (na criação).
   *  Nunca recalcular no join — o mundo pode já estar escavado (bug-010). */
  readonly spawn: { x: number; y: number; z: number };
  tickCount = 0;

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
  /** Células a examinar no próximo tick (fila de vizinhança — regra de ouro). */
  private dirty = new Set<number>();
  /** Células já alteradas neste tick (máx. 1 mudança por célula por tick). */
  private changedThisTick = new Set<number>();

  constructor(
    private readonly send: SendFn,
    opts: SessionOptions = {},
  ) {
    this.now = opts.now ?? (() => Date.now());
    this.singleplayer = opts.singleplayer ?? false;
    this.codigo = opts.codigo ?? opts.restore?.codigo;
    if (opts.restore) {
      // mundo vem do save: NADA é recalculado (spawn é do terreno pristino —
      // recalcular sobre mundo escavado repetiria o bug-010)
      this.world = opts.restore.world;
      this.seed = opts.restore.seed;
      this.spawn = { ...opts.restore.spawn };
      for (const p of opts.restore.roster) {
        this.roster.set(p.name, { x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch });
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
    } else {
      this.seed = opts.seed ?? 1;
      const preset = opts.preset ?? (opts.flat ? "plano" : "normal");
      this.world = generateWorldForPreset(preset, opts.dims ?? DEFAULT_WORLD_CHUNKS, this.seed);
      // cabines: o centro exato do mundo é canto de chunk = dentro de uma
      // cabine — desloca o spawn pro MEIO do chunk (área aberta)
      const off = preset === "cabines" ? CHUNK_SIZE / 2 : 0;
      const sx = this.world.sizeX / 2 + off + 0.5;
      const sz = this.world.sizeZ / 2 + off + 0.5;
      this.spawn = {
        x: sx,
        y: findSpawnY(this.world, Math.floor(sx), Math.floor(sz)),
        z: sz,
      };
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
    return {
      seed: this.seed,
      spawn: { ...this.spawn },
      roster: [...merged.entries()].map(([name, pos]) => {
        const id = this.identity.get(name);
        return {
          name,
          ...pos,
          // JSON.stringify descarta undefined — aluno sem PIN sai enxuto
          pin: id?.pin,
          papel: id?.papel === "professor" ? ("professor" as const) : undefined,
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
    switch (msg.type) {
      case "join": {
        const name = msg.name.trim().slice(0, MAX_NAME_LENGTH) || "jogador";
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
        p.x = msg.x; p.y = msg.y; p.z = msg.z;
        p.yaw = msg.yaw; p.pitch = msg.pitch;
        // Relay pros OUTROS (nunca ecoa pro autor — cliente não precisa saber
        // o próprio id). Validação de física vem depois do MVP.
        this.broadcastExcept(clientId, {
          type: "player_moved",
          id: clientId,
          x: msg.x, y: msg.y, z: msg.z,
          yaw: msg.yaw, pitch: msg.pitch,
        });
        // objetivo "chegar" (cp12/13): pisar dentro da região conclui
        this.checkChegar(clientId);
        break;
      }
      case "place_block": {
        const p = this.players.get(clientId);
        if (!p) return;
        if (!inBounds(this.world, msg.x, msg.y, msg.z)) return;
        if (!isPlaceable(msg.blockId)) return;
        if (getBlock(this.world, msg.x, msg.y, msg.z) !== BlockId.Air) return;
        if (!this.withinReach(p, msg.x, msg.y, msg.z)) return;
        if (this.overlapsAnyPlayer(msg.x, msg.y, msg.z)) return;
        this.applyBlock(msg.x, msg.y, msg.z, msg.blockId);
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
        this.applyBlock(msg.x, msg.y, msg.z, BlockId.Air);
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
        if (p.papel !== "professor") {
          this.sendServerChat(clientId, "só o professor pode marcar regiões");
          return;
        }
        if (!inBounds(this.world, msg.x, msg.y, msg.z)) return;
        const marks = this.wandMarks.get(clientId) ?? {};
        const corner = { x: msg.x, y: msg.y, z: msg.z };
        if (msg.corner === 1) marks.c1 = corner;
        else marks.c2 = corner;
        this.wandMarks.set(clientId, marks);
        this.sendServerChat(
          clientId,
          `canto ${msg.corner}: (${msg.x}, ${msg.y}, ${msg.z})` +
            (marks.c1 && marks.c2 ? " — agora /regiao criar nome" : ""),
        );
        break;
      }
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
        const x = Number(parts[1]);
        const y = Number(parts[2]);
        const z = Number(parts[3]);
        const id = Number(parts[4]);
        if (parts.length !== 5 || ![x, y, z, id].every(Number.isInteger)) {
          return "Uso: /bloco x y z id — coordenadas inteiras. O id 0 apaga o bloco; os demais seguem a ordem do inventário.";
        }
        if (!inBounds(this.world, x, y, z)) return `As coordenadas (${x}, ${y}, ${z}) estão fora do mundo.`;
        if (id !== BlockId.Air && !isPlaceable(id)) return `Não existe bloco com o id ${id}.`;
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
      default:
        return `Comando desconhecido: ${text}. Os comandos disponíveis são /bloco, /resetpin, /regiao, /objetivo e /grupo.`;
    }
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
        const nome = parts[2];
        if (parts.length !== 3 || !nome) {
          return "Uso: /regiao criar nome (sem espaços). Marque os dois cantos com a varinha antes.";
        }
        if (nome.length > MAX_REGION_NAME) return `O nome é grande demais (máximo de ${MAX_REGION_NAME} caracteres).`;
        if (this.regions.has(nome)) return `Já existe uma região chamada "${nome}". Apague-a antes ou escolha outro nome.`;
        if (this.regions.size >= MAX_REGIONS) return `Limite de ${MAX_REGIONS} regiões atingido.`;
        const marks = this.wandMarks.get(clientId);
        if (!marks?.c1 || !marks.c2) {
          return "Marque os dois cantos com a varinha primeiro (tecla R: clique esquerdo marca o canto 1, o direito marca o canto 2).";
        }
        const region: NamedRegion = { nome, ...regionFromCorners(marks.c1, marks.c2) };
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
        // Passa pelo applyBlock — regras e detecção de objetivo acordam normal.
        const nome = parts[2];
        const id = Number(parts[3]);
        if (parts.length !== 4 || !nome || !Number.isInteger(id)) {
          return "Uso: /regiao encher nome id — o id 0 esvazia a região; os demais seguem a ordem do inventário.";
        }
        const r = this.regions.get(nome);
        if (!r) return `Não existe região chamada "${nome}".`;
        if (id !== BlockId.Air && !isPlaceable(id)) return `Não existe bloco com o id ${id}.`;
        if (boxVolume(r) > MAX_OBJETIVO_CELLS) {
          return `A região é grande demais para encher (máximo de ${MAX_OBJETIVO_CELLS} blocos).`;
        }
        let mudados = 0;
        for (let y = r.min.y; y <= r.max.y; y++) {
          for (let z = r.min.z; z <= r.max.z; z++) {
            for (let x = r.min.x; x <= r.max.x; x++) {
              if (getBlock(this.world, x, y, z) === id) continue;
              // nunca emparedar: célula com jogador dentro fica como está
              if (id !== BlockId.Air && this.overlapsAnyPlayer(x, y, z)) continue;
              this.applyBlock(x, y, z, id);
              mudados++;
            }
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
      default:
        return "Uso: /regiao criar nome · /regiao apagar nome · /regiao lista · /regiao encher nome id · /regiao carimbar modelo prefixo espacamento [z]";
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
    this.send(clientId, encodeSnapshot(this.world, this.seed));
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
              ? " Comandos: /bloco · /resetpin · /regiao (varinha: R) · /objetivo · /grupo"
              : ""),
    );
    // professor vê as regiões existentes desde o join (depois do snapshot)
    if (papel === "professor" && this.regions.size) this.sendRegions(clientId);
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
        } satisfies ServerMessage),
      );
    }
    this.broadcastExcept(clientId, {
      type: "player_moved",
      id: clientId,
      x: destino.x, y: destino.y, z: destino.z,
      yaw: destino.yaw, pitch: destino.pitch,
    });
  }

  /** Quem está conectado agora — o host precisa disto para migrar todo mundo. */
  jogadoresConectados(): { id: number; name: string; papel: Papel }[] {
    return [...this.players.entries()].map(([id, p]) => ({
      id,
      name: p.name,
      papel: p.papel,
    }));
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
        this.scenario.completos.clear();
        this.completosGrupo.clear();
        // tudo volta a valer — recheca já o que o mundo atual satisfaz? NÃO:
        // conclusão exige AÇÃO depois do reset (senão construir concluído
        // re-conclui na hora e o reset não serve pra re-jogar a aula)
        this.broadcastObjectives();
        return "Progresso zerado: os objetivos valem de novo.";
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
   * Aplica mudança no mundo autoritativo, avisa TODOS (inclusive o autor) e
   * marca a célula + vizinhos como sujos — é isso que faz areia (e circuitos
   * futuros) reagirem a QUALQUER mudança, sem código especial no chamador.
   */
  private applyBlock(x: number, y: number, z: number, blockId: number): void {
    setBlock(this.world, x, y, z, blockId);
    this.changedThisTick.add(this.packCoord(x, y, z));
    this.markDirtyAround(x, y, z);
    this.broadcast({ type: "block_changed", x, y, z, blockId });
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
    this.wandMarks.delete(clientId); // rascunho de canto morre com a conexão
    const p = this.players.get(clientId);
    if (!p) return;
    // mundo lembra onde o jogador parou (vai pro save; volta aqui no rejoin)
    this.roster.set(p.name, { x: p.x, y: p.y, z: p.z, yaw: p.yaw, pitch: p.pitch });
    // delete ANTES do broadcast — quem saiu não recebe (socket já fechou).
    this.players.delete(clientId);
    this.broadcast({ type: "player_left", id: clientId });
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

    this.changedThisTick.clear();
    const batch = this.dirty;
    this.dirty = new Set();
    for (const key of batch) {
      if (this.changedThisTick.has(key)) continue; // célula já mudou neste tick
      const x = key % this.world.sizeX;
      const rest = (key - x) / this.world.sizeX;
      const z = rest % this.world.sizeZ;
      const y = (rest - z) / this.world.sizeZ;
      const rule = ruleFor(getBlock(this.world, x, y, z));
      if (!rule) continue;
      const changes = rule(this.world, x, y, z);
      if (!changes) continue;
      for (const c of changes) {
        if (!inBounds(this.world, c.x, c.y, c.z)) continue; // regra defeituosa não vaza
        this.applyBlock(c.x, c.y, c.z, c.blockId);
      }
    }

    // cp12/13: recheca objetivos tocados por mudanças (dos jogadores E das
    // regras acima — areia caindo dentro do alvo também conta/desconta)
    if (this.objetivosDirty.size) {
      for (const key of this.objetivosDirty) {
        const [idS, gS] = key.split(":");
        const id = Number(idS);
        const g = Number(gS);
        const o = this.scenario.objetivos.find((obj) => obj.id === id);
        if (!o) continue;
        // sequencial: futuro só vale quando ativar (por grupo, se houver)
        if (!this.activeIdsFor(g).has(id)) continue;
        const box = g > 0 && o.alvos ? o.alvos[g - 1] : o;
        if (box && this.isObjectiveDone(o, box)) this.completeObjetivo(o, g);
      }
      this.objetivosDirty.clear();
      this.broadcastObjectives(); // contadores mudaram mesmo sem conclusão
    }

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
      });
      this.tickMsSum = this.tickMsMax = this.ticksInWindow = 0;
    }
  }
}
