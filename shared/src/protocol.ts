import { type Papel } from "./auth";
import { type Claim, parseClaim } from "./claims";
import { type QuadroConteudo, parseQuadroConteudo } from "./quadros";
import { type ContainerTipo, type Preco, parseContainerSalvo, parsePreco } from "./containers";
import { CHUNK_VOLUME, MAX_WORLD_CHUNKS } from "./constants";
import { type GroupDef, parseGroups } from "./groups";
import { type SlotSalvo, inventarioParaSave, parseInventario } from "./inventario";
import { type Modo, parseModo } from "./modo";
import { type NamedRegion, parseNamedRegion } from "./regions";
import { type ObjectiveState, type ScenarioModo, parseObjectiveState } from "./scenario";
import { type CausaDano, parseCausaDano } from "./sobrevivencia";
import { type World, type WorldDims, alocarColuna, chunkIndex, createWorld } from "./world";

/**
 * Protocolo v0 (checkpoint 2). Mensagens JSON dos dois lados + world_snapshot
 * BINÁRIO (único frame binário do protocolo). O cliente fala isto com QUALQUER
 * hospedeiro (Web Worker agora, Node+ws no checkpoint 5) — mesmas mensagens.
 */

// --- Mensagens JSON cliente→servidor ---

export type ClientMessage =
  | {
      /**
       * Entrada no mundo. pin: 4 dígitos — 1ª entrada com um nome registra o
       * PIN, as seguintes exigem o mesmo (cp9). codigo: código de professor
       * (opcional) — certo eleva o papel; errado NEGA o join (professor que
       * digitou errado precisa saber, não entrar como aluno em silêncio).
       * Hospedeiro singleplayer dispensa os dois.
       */
      type: "join";
      name: string;
      pin?: string;
      codigo?: string;
    }
  | { type: "move"; x: number; y: number; z: number; yaw: number; pitch: number }
  | { type: "place_block"; x: number; y: number; z: number; blockId: number }
  | { type: "break_block"; x: number; y: number; z: number }
  /** Clique direito num bloco INTERATIVO (cp23: porta) — o servidor decide o
   *  efeito (alternar aberta/fechada) e responde com block_changed normais. */
  | { type: "use_block"; x: number; y: number; z: number }
  /** Balde (2026-07-22): `encher=false` (balde cheio) DESPEJA fonte de água na
   *  célula; `encher=true` (balde vazio) RECOLHE a fonte de volta. Servidor
   *  valida célula/alcance/gates de claim/confinamento e aplica via applyBlock.
   *  §🍖 F5: `slot?` é o slot do balde na mochila (sobrevivência) — o servidor
   *  confere que o item está lá e troca vazio↔cheio NAQUELE slot, pra o balde
   *  não pular de lugar. Ausente (criativo) = o cliente cuida do slot local. */
  | { type: "balde"; x: number; y: number; z: number; encher: boolean; slot?: number }
  /** Craft (§🍖 F5): fabrica a receita de índice `receita` na lista `RECEITAS`.
   *  Só vale em sobrevivência; o servidor consome os ingredientes e responde
   *  com o `inventario` inteiro. Índice inválido é ignorado (parse defensivo). */
  | { type: "fabricar"; receita: number }
  /** Comer (§🍖 F6): morde o item do slot `slot` da mochila. Só vale em
   *  sobrevivência; o servidor confere que o slot segura comida e que a barra
   *  não está cheia (barriga cheia RECUSA, pra a mordida não jogar comida
   *  fora), consome UMA unidade e responde com `vida` + `inventario`. */
  | { type: "comer"; slot: number }
  /** Atacar (§🍖 F7): soco no jogador de id `alvo` (o mesmo id que chega no
   *  `player_moved`). O cliente só manda a INTENÇÃO — quem confere a regra
   *  `pvp`, o modo dos dois, o alcance e o intervalo entre socos é o servidor,
   *  como em toda ação desde o F2. Recusa é silenciosa. */
  | { type: "atacar"; alvo: number }
  /** Quadro (2026-07-19): define o CONTEÚDO do quadro naquela célula (texto
   *  e/ou imagem data URL pequena). Servidor valida célula/alcance/gates e
   *  responde com quadro_changed broadcast. Texto vazio sem imagem = limpa. */
  | { type: "quadro_set"; x: number; y: number; z: number; texto: string; imagem?: string }
  /** Inventário (§🍖 F4): o aluno arrastou/tocou pra reorganizar a mochila.
   *  O cliente NÃO decide — manda os dois índices e o servidor aplica (ou não)
   *  e responde com o `inventario` inteiro. Índice inválido é ignorado. */
  | { type: "mover_item"; de: number; para: number; qtd?: number }
  /**
   * Container (§🍖 F10): move item entre a MOCHILA e o bloco com inventário
   * (fornalha, baú) daquela célula. O índice é UNIFICADO — `0..26` é a
   * mochila, `27 + i` é o slot `i` do container (ver `containers.ts`): um
   * número por ponta, como o `mover_item` já faz dentro da mochila.
   *
   * O cliente precisa estar com aquele container ABERTO (o `use_block` é que
   * abre), e o servidor reconfere alcance e claim a cada movimento — quem
   * abriu o baú e saiu andando não continua mexendo nele de longe.
   */
  | { type: "mover_container"; x: number; y: number; z: number; de: number; para: number; qtd?: number }
  /** Inventário (§🗑️ playtest 2026-08-25): o aluno JOGA FORA a pilha do slot
   *  (botão de lixeira). `qtd` opcional = só parte, como no `mover_item`. O
   *  item EVAPORA — não existe item no chão. Servidor confere modo e índice. */
  | { type: "descartar_item"; slot: number; qtd?: number }
  /** Container (§🗑️): o mesmo descarte com o baú/fornalha ABERTO — `slot` é o
   *  índice UNIFICADO (`0..26` mochila, `27 + i` container), como no
   *  `mover_container`, e valem os mesmos gates (aberto, alcance, claim). */
  | { type: "descartar_container"; x: number; y: number; z: number; slot: number; qtd?: number }
  /** Container (§🍖 F10): o aluno fechou o painel. Sem isto o servidor
   *  continuaria mandando o conteúdo daquele bloco a cada tick pra sempre. */
  | { type: "fechar_container" }
  /**
   * Loja (2026-09-01): o criador define (ou remove, `preco: null`) o preço de
   * UM tipo de item presente no estoque. Servidor confere `criador` — ver
   * `session/loja.ts`.
   */
  | { type: "definir_preco"; x: number; y: number; z: number; item: number; preco: Preco | null }
  /**
   * Loja: compra `qtd` unidades de `item` (o item À VENDA, não o pagamento —
   * o preço já diz o que se paga). Servidor confere estoque, pagamento e
   * espaço — ver `session/loja.ts`.
   */
  | { type: "comprar"; x: number; y: number; z: number; item: number; qtd: number }
  | { type: "chat"; text: string }
  | {
      /**
       * Varinha do professor (cp11): marca um canto de região na célula
       * mirada. Dois cantos marcados + /regiao criar nome = região nomeada.
       * Servidor valida papel e bounds — aluno mandando isto é ignorado
       * com aviso no chat.
       */
      type: "wand_mark";
      corner: 1 | 2;
      x: number;
      y: number;
      z: number;
    }
  | {
      /**
       * Profiler (backlog "ferramentas de dev"): cliente manda o snapshot do
       * HUD F3 (botão "enviar pro servidor") pro host persistir em disco —
       * roda o profile em vários dispositivos (notebook, tablet…) e centraliza
       * as medidas na MESMA pasta, sem precisar catar arquivo exportado de
       * cada máquina. Opaco: o servidor só grava, não interpreta — o shape
       * acompanha o que hud.ts exporta e pode crescer sem re-versionar o
       * protocolo. Tratado no HOST (como /mundo, /expulsar): gravar arquivo é
       * transporte, a GameSession não tem sistema de arquivos.
       */
      type: "profile_report";
      stats: Record<string, unknown>;
    }
  /** Streaming (F2): raio de interesse do cliente em COLUNAS de chunks —
   *  config de desempenho do menu. Servidor clampa em [RAIO_MIN, RAIO_MAX]. */
  | { type: "radius"; chunks: number }
  /**
   * Streaming (§🔁): rede de segurança. O cliente detectou que uma coluna
   * DENTRO do seu raio não chegou (lote perdido, decode falhou, mesh falhou) e
   * pede o re-envio. O servidor NÃO abre caminho de envio paralelo: só esquece
   * a coluna (`enviadas.delete`) e o `streamColunas` do tick seguinte reenvia
   * pelo caminho normal, respeitando `colunasPorTick`.
   */
  | { type: "pedir_coluna"; cx: number; cz: number };

/** Teto do texto bruto de um profile_report (chars) — payload é só números e
 *  strings curtas (sem imagem); acima disso é lixo/abuso, não perfilação real. */
export const MAX_PROFILE_REPORT_CHARS = 8192;

// --- Mensagens JSON servidor→cliente ---

export type ServerMessage =
  | {
      type: "debug_stats";
      /** Duração média/máxima do tick (ms) na última janela de 1 s. */
      tickAvgMs: number;
      tickMaxMs: number;
      /** Ticks executados na janela (alvo = SERVER_TICK_RATE). */
      tps: number;
      /** Custo das REGRAS (água/areia) na janela — média por tick e pior tick.
       *  OPCIONAIS: host de versão antiga não manda, e o cliente não pode
       *  descartar o `debug_stats` inteiro por causa disso. */
      regrasCelulasAvg?: number;
      regrasCelulasMax?: number;
      regrasMudancasAvg?: number;
      regrasAguaAvg?: number;
    }
  | {
      /** Bloco mudou no mundo autoritativo (ação de jogador OU regra do tick — o cliente não distingue). */
      type: "block_changed";
      x: number;
      y: number;
      z: number;
      blockId: number;
    }
  | {
      /**
       * Caixa INTEIRA virou um só bloco (/regiao encher em lote — cp23b).
       * UMA mensagem no lugar de milhares de block_changed; o cliente aplica
       * a caixa e remesha os chunks tocados uma vez. Células que o servidor
       * PULOU (jogador dentro) chegam logo atrás como block_changed normais.
       */
      type: "blocks_filled";
      x0: number; y0: number; z0: number;
      x1: number; y1: number; z1: number;
      blockId: number;
    }
  | {
      /** OUTRO jogador se moveu (o servidor nunca ecoa o move do próprio autor). */
      type: "player_moved";
      id: number;
      x: number;
      y: number;
      z: number;
      yaw: number;
      pitch: number;
      /** Nome do jogador — o cliente desenha a plaquinha sobre o boneco.
       *  Ausente = host antigo (compatível: caixa sem nome). */
      name?: string;
      /** Está DEITADO na cama (2026-08-17)? O cliente deita a caixa dele sobre
       *  a cama. Ausente = em pé — é o que faz o campo ser compatível com host
       *  antigo sem ramo de versão. */
      dormindo?: boolean;
      /** Célula da cama em que ele deitou. ⚠️ SEM isto o corpo deita onde o
       *  jogador está EM PÉ (ao lado da cama), porque `x/y/z` são os pés dele e
       *  o servidor não o move ao dormir — só o cliente leva a câmera. */
      cama?: { x: number; y: number; z: number };
    }
  | {
      /**
       * Lote de poses do tick (2026-08-31) — substitui N `player_moved`
       * individuais (um por `move` recebido) por UM broadcast por destinatário
       * a cada tick (10 Hz), sempre. Turma de 35 andando virava O(N²) sends/s
       * (cada `move` relayado pra todo mundo na hora): a fila do servidor
       * enchia e todo COMANDO atrasava, não só a posição de quem andava. O
       * autor de cada pose já vem excluído (nunca ecoa) e o gate do
       * `/invisivel` já filtrado — os DOIS por destinatário, como o
       * `player_moved` fazia por autor.
       */
      type: "players_moved";
      moves: {
        id: number;
        x: number;
        y: number;
        z: number;
        yaw: number;
        pitch: number;
        name?: string;
        dormindo?: boolean;
        cama?: { x: number; y: number; z: number };
      }[];
    }
  | {
      /** O PRÓPRIO jogador deitou ou levantou (2026-08-17). Só para o autor: o
       *  `player_moved` cobre os outros, mas o servidor nunca ecoa o move de
       *  quem o mandou, então a própria câmera precisa desta mensagem.
       *  `cama` é a célula onde ele deitou (ausente ao levantar). */
      type: "dormindo";
      dormindo: boolean;
      cama?: { x: number; y: number; z: number };
    }
  | {
      /** Jogador desconectou — cliente remove a representação dele. */
      type: "player_left";
      id: number;
    }
  | {
      /**
       * Ponto de spawn do mundo (fixo, calculado na CRIAÇÃO sobre o terreno
       * pristino). Cliente NUNCA deriva spawn do snapshot — o snapshot pode
       * já estar escavado/construído.
       */
      type: "spawn";
      x: number;
      y: number;
      z: number;
      /** Papel do PRÓPRIO jogador (cp11): o cliente habilita UI de professor
       *  (varinha, painel futuro). Ausente = aluno (compat com host antigo). */
      papel?: Papel;
    }
  | {
      /**
       * Lista COMPLETA de regiões nomeadas (cp11). Só professores recebem
       * (no join e após criar/apagar) — o que o aluno vê de cada região é
       * decisão do objetivo (cp12+), não deste canal.
       */
      type: "regions";
      regions: NamedRegion[];
    }
  | {
      /**
       * Estado COMPLETO do cenário (cp12) — TODOS recebem (o HUD do aluno
       * vive disto): no join e sempre que progresso/objetivos mudarem.
       * Cliente substitui, não mescla.
       */
      type: "objectives";
      modo: ScenarioModo;
      objetivos: ObjectiveState[];
    }
  | {
      /**
       * Grupo do PRÓPRIO jogador (cp13): no join e quando muda (/grupo
       * criar|entrar|sair). null = sem grupo. HUD usa pra destacar a
       * linha certa do porGrupo dos objetivos.
       */
      type: "group";
      grupo: number | null;
    }
  | {
      /**
       * Composição COMPLETA dos grupos (cp14) — TODOS recebem (o painel de
       * grupo do aluno vive disto; ele só abre depois de grupos criados):
       * no join e sempre que a composição mudar. Cliente substitui, não mescla.
       */
      type: "groups";
      grupos: GroupDef[];
    }
  | {
      /**
       * Anti-griefing (cp24) — lista COMPLETA de claims + se a proteção está
       * ligada. TODOS recebem (todo mundo vê as áreas protegidas como wireframe;
       * o servidor é quem barra a edição). No join e a cada mudança/toggle.
       */
      type: "claims";
      ativo: boolean;
      claims: Claim[];
    }
  | {
      /**
       * Grupo de amigos do PRÓPRIO jogador (cp24) + convites pendentes. `equipe`
       * null = sem grupo. Pessoal: no join (se houver algo) e quando muda.
       */
      type: "friends";
      equipe: { dono: string; membros: string[] } | null;
      /** Quem convidou ESTE jogador e espera resposta. */
      convites: string[];
      /** Quem ESTE jogador convidou e ainda não respondeu (2026-08-04, painel
       *  de amigos): sem isto, convidar pelo painel não muda nada na tela e o
       *  clique parece não ter funcionado. Host antigo não manda → lista vazia,
       *  que é o comportamento de antes. */
      enviados: string[];
    }
  | {
      /**
       * Painel de jogadores (2026-07-21) — SÓ para o professor: quem está
       * conectado agora + a lista de nicks banidos. No join do professor e a
       * cada join/saída/banimento. O painel manda /expulsar, /banir, /desbanir.
       */
      type: "players";
      conectados: { name: string; papel: "professor" | "aluno" }[];
      banidos: string[];
    }
  | {
      /**
       * Quadro (2026-07-19): conteúdo de UM quadro mudou. Broadcast a cada
       * quadro_set aceito. Texto vazio sem imagem = quadro limpo (o cliente
       * remove o painel de conteúdo).
       */
      type: "quadro_changed";
      x: number;
      y: number;
      z: number;
      texto: string;
      imagem?: string;
    }
  | {
      /**
       * Quadro (2026-07-19): lista COMPLETA de conteúdos — só no join, e só
       * se houver algum (senão nada é enviado; contagens do join não mudam).
       * Cliente substitui, não mescla.
       */
      type: "quadros";
      lista: QuadroConteudo[];
    }
  | {
      /**
       * Container (§🍖 F10): o conteúdo do bloco que ESTE cliente tem aberto.
       * Vai só pra quem está com ele aberto (não é broadcast de mundo): sai
       * quando o `use_block` abre, a cada movimento aceito, e a cada tick em
       * que a fornalha muda sozinha (o fogo anda, a peça fica pronta).
       *
       * Dois alunos no mesmo baú recebem os dois — é o que impede um item de
       * sumir na cara do colega, e é a razão de a mensagem ser por POSIÇÃO e
       * não por jogador.
       */
      type: "container";
      x: number;
      y: number;
      z: number;
      tipo: ContainerTipo;
      slots: SlotSalvo[];
      /** Fornalha: ticks de fogo que restam, a régua deles e o cozimento em
       *  curso. Ausentes (ou zero) = fogo apagado / nada cozinhando. */
      queimando?: number;
      queimaTotal?: number;
      progresso?: number;
      /** Loja (2026-09-01): ausente pros tipos fornalha/bau. */
      loja?: {
        criador: string;
        precos: { porItem: number; preco: Preco }[];
        /** Este DESTINATÁRIO é o criador? Calculado no servidor — evita o
         *  cliente ter de saber o próprio nome só pra esta comparação. */
        souOCriador: boolean;
      };
    }
  | {
      /**
       * Container (§🍖 F10): o servidor está FECHANDO o painel deste cliente —
       * o bloco foi quebrado, o aluno se afastou, ou o claim mudou de dono. O
       * cliente fecha sem perguntar; sem isto, o painel ficaria aberto sobre
       * um bloco que não existe mais.
       */
      type: "container_fechado";
    }
  | {
      /** Chat: mensagem de jogador (autor "nome#id") ou do servidor (autor "servidor"). */
      type: "chat";
      author: string;
      text: string;
    }
  | {
      /**
       * Join RECUSADO (PIN errado, nome já em uso, código de professor
       * errado, tentativas demais…). Cliente mostra o motivo e volta pro
       * menu — nenhuma outra mensagem chega depois desta.
       */
      type: "join_denied";
      reason: string;
    }
  | {
      /**
       * Servidor manda o jogador pra uma posição E orientação (volta-onde-
       * parou de mundo salvo; futuro /tp). Cliente aplica, zera velocidade
       * e aponta a câmera (yaw/pitch).
       */
      type: "teleport";
      x: number;
      y: number;
      z: number;
      yaw: number;
      pitch: number;
    }
  | {
      /**
       * Hora do dia (cp21) — ciclo dia/noite SÓ visual e server-autoritativo.
       * `hora` em [0,24); `ciclo` = o tempo está passando. No join e 1×/s;
       * o cliente interpola o céu localmente entre as sincronizações.
       */
      type: "time";
      hora: number;
      ciclo: boolean;
    }
  | {
      /**
       * Vento (§🌬️, 2026-07-27) — estado do mundo SÓ visual e server-autoritativo,
       * mesmo molde do `time`. `dir` em radianos [0,2π) = PRA ONDE sopra no plano
       * XZ; `forca` em [0,1] (já vem 0 com o vento desligado, então o cliente usa
       * o número direto). `ativo` é só leitura de professor/F3. No join e 1×/s;
       * o cliente suaviza entre as sincronizações (o giro é lento — 1,2°/s).
       */
      type: "vento";
      dir: number;
      forca: number;
      ativo: boolean;
    }
  | {
      /**
       * Troca de aula COMEÇANDO (cp19 + §🕐). Sai ANTES do trabalho pesado do
       * host (salvar o mundo atual → construir a sessão nova), que pode levar
       * segundos: o snapshot do mundo novo é o FIM dessa fila, não o começo.
       * Sem este aviso o aluno via o jogo normal e a tela de carregamento só
       * aparecia no fim, "quase pronta" (relatado no playtest de 2026-07-26).
       */
      type: "mundo_trocando";
      /** Nome da aula que está entrando (sem .ljw) — vai na tela. */
      nome: string;
    }
  | {
      /**
       * Voo liberado pra TURMA (modo criativo). O professor voa sempre; este
       * flag diz se os alunos também podem (professor alterna com /voo). No
       * join só é enviado quando `liberado` (default false = sem churn no join).
       */
      type: "voo";
      liberado: boolean;
    }
  | {
      /**
       * `/invisivel` (2026-08-22): o PRÓPRIO professor está invisível pros
       * alunos? Só o autor recebe — o aluno nunca sabe que alguém sumiu, que é
       * o ponto da feature. O cliente usa pra dois fins: o aviso permanente na
       * tela (senão o professor esquece e fala sozinho com a turma) e o noclip
       * do voo. A filtragem da POSE não depende desta mensagem: ela é do
       * servidor, por cliente — aqui só viaja o estado do próprio dono.
       */
      type: "invisivel";
      ativo: boolean;
    }
  | {
      /**
       * Modo de jogo EFETIVO deste jogador (§🍖 F1) — já resolvido no servidor
       * (override pessoal vence o padrão do mundo), porque quem decide o modo é
       * o servidor e o cliente não tem o mapa de overrides. Vai no join e a cada
       * troca que ALCANCE este jogador. Por enquanto ele só decide o rótulo e o
       * voo; vida/fome/inventário (F2..F4) leem daqui.
       */
      type: "modo";
      efetivo: Modo;
      /** §🍖 F7: o ataque entre jogadores vale neste mundo? OPCIONAL e
       *  tolerante (host antigo não manda → o cliente assume que não), como os
       *  campos novos do `debug_stats`. É só o que decide pintar a mira de
       *  vermelho: quem recusa o soco continua sendo o servidor. */
      pvp?: boolean;
    }
  | {
      /**
       * Vida do PRÓPRIO jogador (§🍖 F2) — o servidor é quem machuca, cura e
       * mata; o cliente só desenha. Vai no join (em sobrevivência), a cada
       * mudança e no respawn. `causa` e `morreu` existem pro cliente dar o
       * feedback certo (vinheta vermelha, aviso de morte) sem adivinhar pela
       * diferença de vida; `folego` alimenta as bolhas e é OPCIONAL — host
       * antigo não manda e o cliente não pode descartar a mensagem por isso.
       *
       * `fome` (§🍖 F3) é opcional pelo mesmo motivo E por um segundo: ausente
       * significa "este mundo não tem fome" (regra `fome` desligada), e aí o
       * cliente não desenha coxa nenhuma.
       */
      type: "vida";
      vida: number;
      causa?: CausaDano;
      morreu?: boolean;
      folego?: number;
      fome?: number;
    }
  | {
      /** Loja (2026-09-01): saldo de Dimas deste jogador. Mandado no join
       *  (`admitir`) e sempre que uma compra/venda muda o saldo. */
      type: "dimas";
      saldo: number;
    }
  | {
      /**
       * Inventário do PRÓPRIO jogador (§🍖 F4) — estado do SERVIDOR, mandado
       * inteiro (27 slots são ~poucas centenas de bytes na forma esparsa, e um
       * delta por slot custaria mais em bug do que economiza em byte). Vai no
       * join em sobrevivência e a cada mudança: colocar gasta, quebrar dá,
       * morrer pode zerar (regra `manter-inventario`).
       *
       * Forma ESPARSA (`slots`): só o que está ocupado, cada um com o índice.
       * Lista vazia = mochila vazia, que é diferente de "não tem inventário" —
       * em criativo a mensagem simplesmente NÃO é mandada (paleta infinita).
       */
      type: "inventario";
      slots: SlotSalvo[];
    }
  | {
      /**
       * Aluno REMOVIDO da aula pelo professor (cp22, /expulsar). Cliente mostra o
       * motivo e volta pro menu — mesmo caminho do join_denied. O socket cai
       * logo depois; ele pode entrar de novo com o PIN.
       */
      type: "kicked";
      reason: string;
    };

/** Parse defensivo: servidor autoritativo nunca confia no que chega do fio. */
export function parseClientMessage(raw: string): ClientMessage | null {
  let msg: unknown;
  try {
    msg = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof msg !== "object" || msg === null) return null;
  const m = msg as Record<string, unknown>;
  switch (m["type"]) {
    case "join": {
      if (typeof m["name"] !== "string") return null;
      // pin/codigo são opcionais, mas se vierem TÊM que ser string
      if (m["pin"] !== undefined && typeof m["pin"] !== "string") return null;
      if (m["codigo"] !== undefined && typeof m["codigo"] !== "string") return null;
      return {
        type: "join",
        name: m["name"],
        ...(typeof m["pin"] === "string" ? { pin: m["pin"] } : {}),
        ...(typeof m["codigo"] === "string" ? { codigo: m["codigo"] } : {}),
      };
    }
    case "move": {
      const nums = [m["x"], m["y"], m["z"], m["yaw"], m["pitch"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "move",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        yaw: m["yaw"] as number,
        pitch: m["pitch"] as number,
      };
    }
    case "place_block": {
      const ints = [m["x"], m["y"], m["z"], m["blockId"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "place_block",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        blockId: m["blockId"] as number,
      };
    }
    case "break_block": {
      const ints = [m["x"], m["y"], m["z"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "break_block",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
      };
    }
    case "use_block": {
      const ints = [m["x"], m["y"], m["z"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "use_block",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
      };
    }
    case "balde": {
      const ints = [m["x"], m["y"], m["z"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      if (typeof m["encher"] !== "boolean") return null;
      const slot = m["slot"];
      return {
        type: "balde",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        encher: m["encher"] as boolean,
        // §🍖 F5: slot opcional (sobrevivência); número não-inteiro é ignorado
        ...(typeof slot === "number" && Number.isInteger(slot) ? { slot } : {}),
      };
    }
    case "quadro_set": {
      const c = parseQuadroConteudo(m);
      if (!c) return null;
      return { type: "quadro_set", ...c };
    }
    case "mover_item": {
      const ints = [m["de"], m["para"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      // §🧹 (playtest): `qtd` opcional = move só PARTE da pilha (o PC divide com
      // clique direito); ausente = pilha inteira, como sempre.
      const qtd = m["qtd"];
      return {
        type: "mover_item",
        de: m["de"] as number,
        para: m["para"] as number,
        ...(typeof qtd === "number" && Number.isInteger(qtd) && qtd >= 1 ? { qtd } : {}),
      };
    }
    case "descartar_item": {
      // §🗑️: o slot é o único inteiro; `qtd` segue a régua do `mover_item`
      // (inteiro ≥ 1 ou ausente = pilha inteira).
      if (typeof m["slot"] !== "number" || !Number.isInteger(m["slot"])) return null;
      const qtd = m["qtd"];
      return {
        type: "descartar_item",
        slot: m["slot"],
        ...(typeof qtd === "number" && Number.isInteger(qtd) && qtd >= 1 ? { qtd } : {}),
      };
    }
    case "descartar_container": {
      // §🗑️: célula + índice UNIFICADO. A FAIXA do índice não é conferida aqui
      // (quem sabe quantos slots o container tem é o `descartarEm`).
      const ints = [m["x"], m["y"], m["z"], m["slot"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      const qtd = m["qtd"];
      return {
        type: "descartar_container",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        slot: m["slot"] as number,
        ...(typeof qtd === "number" && Number.isInteger(qtd) && qtd >= 1 ? { qtd } : {}),
      };
    }
    case "mover_container": {
      // §🍖 F10: os 5 inteiros são a célula + o par de índices unificados. A
      // FAIXA dos índices não é conferida aqui: quem sabe quantos slots aquele
      // container tem é o `moverEntre`, que já recusa o que sai da faixa.
      const ints = [m["x"], m["y"], m["z"], m["de"], m["para"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      const qtd = m["qtd"];
      return {
        type: "mover_container",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        de: m["de"] as number,
        para: m["para"] as number,
        ...(typeof qtd === "number" && Number.isInteger(qtd) && qtd >= 1 ? { qtd } : {}),
      };
    }
    case "fechar_container":
      return { type: "fechar_container" };
    case "definir_preco": {
      const ints = [m["x"], m["y"], m["z"], m["item"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      const precoRaw = m["preco"];
      const preco = precoRaw === null ? null : parsePreco(precoRaw);
      if (precoRaw !== null && preco === null) return null; // preço presente mas quebrado
      return {
        type: "definir_preco",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        item: m["item"] as number,
        preco,
      };
    }
    case "comprar": {
      const ints = [m["x"], m["y"], m["z"], m["item"], m["qtd"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      if ((m["qtd"] as number) < 1) return null;
      return {
        type: "comprar",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        item: m["item"] as number,
        qtd: m["qtd"] as number,
      };
    }
    case "fabricar": {
      const r = m["receita"];
      if (typeof r !== "number" || !Number.isInteger(r)) return null;
      return { type: "fabricar", receita: r };
    }
    case "comer": {
      const s = m["slot"];
      if (typeof s !== "number" || !Number.isInteger(s)) return null;
      return { type: "comer", slot: s };
    }
    case "atacar": {
      const a = m["alvo"];
      if (typeof a !== "number" || !Number.isInteger(a)) return null;
      return { type: "atacar", alvo: a };
    }
    case "chat":
      if (typeof m["text"] !== "string") return null;
      return { type: "chat", text: m["text"] };
    case "wand_mark": {
      const corner = m["corner"];
      if (corner !== 1 && corner !== 2) return null;
      const ints = [m["x"], m["y"], m["z"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "wand_mark",
        corner,
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
      };
    }
    case "profile_report": {
      if (raw.length > MAX_PROFILE_REPORT_CHARS) return null;
      const stats = m["stats"];
      if (typeof stats !== "object" || stats === null || Array.isArray(stats)) return null;
      return { type: "profile_report", stats: stats as Record<string, unknown> };
    }
    case "radius": {
      if (typeof m["chunks"] !== "number" || !Number.isInteger(m["chunks"])) return null;
      return { type: "radius", chunks: m["chunks"] };
    }
    case "pedir_coluna": {
      const ints = [m["cx"], m["cz"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return { type: "pedir_coluna", cx: m["cx"] as number, cz: m["cz"] as number };
    }
    default:
      return null;
  }
}

/** Célula da cama (2026-08-17), validada. Devolve `{}` quando não vier ou vier
 *  quebrada — o chamador decide o que fazer com a ausência. */
function parseCama(v: unknown): { cama?: { x: number; y: number; z: number } } {
  if (typeof v !== "object" || v === null) return {};
  const c = v as Record<string, unknown>;
  const ints = [c["x"], c["y"], c["z"]];
  if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return {};
  return { cama: { x: c["x"] as number, y: c["y"] as number, z: c["z"] as number } };
}

export function parseServerMessage(raw: string): ServerMessage | null {
  let msg: unknown;
  try {
    msg = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof msg !== "object" || msg === null) return null;
  const m = msg as Record<string, unknown>;
  switch (m["type"]) {
    case "debug_stats": {
      const nums = [m["tickAvgMs"], m["tickMaxMs"], m["tps"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      // opcionais das regras: número finito entra, qualquer outra coisa some
      const opc = (k: string): number | undefined => {
        const v = m[k];
        return typeof v === "number" && Number.isFinite(v) ? v : undefined;
      };
      return {
        type: "debug_stats",
        tickAvgMs: m["tickAvgMs"] as number,
        tickMaxMs: m["tickMaxMs"] as number,
        tps: m["tps"] as number,
        ...(opc("regrasCelulasAvg") !== undefined ? { regrasCelulasAvg: opc("regrasCelulasAvg") } : {}),
        ...(opc("regrasCelulasMax") !== undefined ? { regrasCelulasMax: opc("regrasCelulasMax") } : {}),
        ...(opc("regrasMudancasAvg") !== undefined ? { regrasMudancasAvg: opc("regrasMudancasAvg") } : {}),
        ...(opc("regrasAguaAvg") !== undefined ? { regrasAguaAvg: opc("regrasAguaAvg") } : {}),
      };
    }
    case "block_changed": {
      const ints = [m["x"], m["y"], m["z"], m["blockId"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "block_changed",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        blockId: m["blockId"] as number,
      };
    }
    case "blocks_filled": {
      const ints = [m["x0"], m["y0"], m["z0"], m["x1"], m["y1"], m["z1"], m["blockId"]];
      if (!ints.every((n) => typeof n === "number" && Number.isInteger(n))) return null;
      return {
        type: "blocks_filled",
        x0: m["x0"] as number, y0: m["y0"] as number, z0: m["z0"] as number,
        x1: m["x1"] as number, y1: m["y1"] as number, z1: m["z1"] as number,
        blockId: m["blockId"] as number,
      };
    }
    case "player_moved": {
      if (typeof m["id"] !== "number" || !Number.isInteger(m["id"])) return null;
      const nums = [m["x"], m["y"], m["z"], m["yaw"], m["pitch"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "player_moved",
        id: m["id"],
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        yaw: m["yaw"] as number,
        pitch: m["pitch"] as number,
        // nome inválido/ausente = sem plaquinha (host antigo compatível)
        ...(typeof m["name"] === "string" ? { name: m["name"] } : {}),
        // deitado (2026-08-17): só o `true` entra; ausente = em pé, que é o
        // que host antigo manda
        ...(m["dormindo"] === true ? { dormindo: true } : {}),
        ...(m["dormindo"] === true ? parseCama(m["cama"]) : {}),
      };
    }
    case "players_moved": {
      if (!Array.isArray(m["moves"])) return null;
      const moves: {
        id: number; x: number; y: number; z: number; yaw: number; pitch: number;
        name?: string; dormindo?: boolean; cama?: { x: number; y: number; z: number };
      }[] = [];
      for (const raw of m["moves"] as unknown[]) {
        if (typeof raw !== "object" || raw === null) return null;
        const mv = raw as Record<string, unknown>;
        if (typeof mv["id"] !== "number" || !Number.isInteger(mv["id"])) return null;
        const nums = [mv["x"], mv["y"], mv["z"], mv["yaw"], mv["pitch"]];
        if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
        moves.push({
          id: mv["id"],
          x: mv["x"] as number,
          y: mv["y"] as number,
          z: mv["z"] as number,
          yaw: mv["yaw"] as number,
          pitch: mv["pitch"] as number,
          ...(typeof mv["name"] === "string" ? { name: mv["name"] } : {}),
          ...(mv["dormindo"] === true ? { dormindo: true } : {}),
          ...(mv["dormindo"] === true ? parseCama(mv["cama"]) : {}),
        });
      }
      return { type: "players_moved", moves };
    }
    case "dormindo": {
      if (typeof m["dormindo"] !== "boolean") return null;
      const cama = parseCama(m["cama"]).cama;
      // sem cama válida, "deitado" não tem para onde levar a câmera: vira em pé
      if (m["dormindo"] === true && !cama) return { type: "dormindo", dormindo: false };
      return { type: "dormindo", dormindo: m["dormindo"], ...(cama ? { cama } : {}) };
    }
    case "player_left": {
      if (typeof m["id"] !== "number" || !Number.isInteger(m["id"])) return null;
      return { type: "player_left", id: m["id"] };
    }
    case "spawn": {
      const nums = [m["x"], m["y"], m["z"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "spawn",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        // papel inválido/ausente = aluno (host antigo continua compatível)
        ...(m["papel"] === "professor" || m["papel"] === "aluno"
          ? { papel: m["papel"] as Papel }
          : {}),
      };
    }
    case "regions": {
      if (!Array.isArray(m["regions"])) return null;
      const regions: NamedRegion[] = [];
      for (const entry of m["regions"]) {
        const r = parseNamedRegion(entry);
        if (r) regions.push(r); // entrada quebrada não derruba a lista inteira
      }
      return { type: "regions", regions };
    }
    case "objectives": {
      if (m["modo"] !== "sequencial" && m["modo"] !== "livre") return null;
      if (!Array.isArray(m["objetivos"])) return null;
      const objetivos: ObjectiveState[] = [];
      for (const entry of m["objetivos"]) {
        const s = parseObjectiveState(entry);
        if (s) objetivos.push(s);
      }
      return { type: "objectives", modo: m["modo"], objetivos };
    }
    case "group": {
      const g = m["grupo"];
      if (g !== null && (typeof g !== "number" || !Number.isInteger(g))) return null;
      return { type: "group", grupo: g };
    }
    case "groups":
      // parseGroups pula entrada quebrada — mesma tolerância do save
      return { type: "groups", grupos: parseGroups(m["grupos"]) };
    case "claims": {
      if (typeof m["ativo"] !== "boolean" || !Array.isArray(m["claims"])) return null;
      const claims: Claim[] = [];
      for (const entry of m["claims"]) {
        const c = parseClaim(entry);
        if (c) claims.push(c); // entrada quebrada não derruba a lista
      }
      return { type: "claims", ativo: m["ativo"], claims };
    }
    case "friends": {
      const onlyStrings = (v: unknown): string[] =>
        Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
      let equipe: { dono: string; membros: string[] } | null = null;
      const eq = m["equipe"];
      if (eq && typeof eq === "object") {
        const o = eq as Record<string, unknown>;
        if (typeof o["dono"] === "string") {
          equipe = { dono: o["dono"], membros: onlyStrings(o["membros"]) };
        }
      }
      return {
        type: "friends",
        equipe,
        convites: onlyStrings(m["convites"]),
        enviados: onlyStrings(m["enviados"]),
      };
    }
    case "players": {
      if (!Array.isArray(m["conectados"]) || !Array.isArray(m["banidos"])) return null;
      const conectados: { name: string; papel: "professor" | "aluno" }[] = [];
      for (const entry of m["conectados"]) {
        if (!entry || typeof entry !== "object") continue;
        const o = entry as Record<string, unknown>;
        if (typeof o["name"] !== "string") continue;
        conectados.push({
          name: o["name"],
          papel: o["papel"] === "professor" ? "professor" : "aluno",
        });
      }
      const banidos = m["banidos"].filter((s): s is string => typeof s === "string");
      return { type: "players", conectados, banidos };
    }
    case "quadro_changed": {
      const c = parseQuadroConteudo(m);
      if (!c) return null;
      return { type: "quadro_changed", ...c };
    }
    case "quadros": {
      if (!Array.isArray(m["lista"])) return null;
      const lista: QuadroConteudo[] = [];
      for (const entry of m["lista"]) {
        const c = parseQuadroConteudo(entry);
        if (c) lista.push(c); // entrada quebrada não derruba a lista
      }
      return { type: "quadros", lista };
    }
    case "container": {
      // §🍖 F10: reusa o parse do save (`parseContainerSalvo`) — o conteúdo de
      // um container tem a MESMA forma nos dois lugares, e duas validações
      // seriam duas chances de divergir.
      const c = parseContainerSalvo(m);
      if (!c) return null;
      // Loja (2026-09-01): `criador`/`precos`/`souOCriador` viajam ANINHADOS
      // em `loja` (não como campos soltos — `sendContainer` não os duplica no
      // topo), então o parse lê de `lojaRaw`, não de `c`.
      const lojaRaw = m["loja"];
      const lo = typeof lojaRaw === "object" && lojaRaw !== null
        ? (lojaRaw as Record<string, unknown>)
        : null;
      const precos: { porItem: number; preco: Preco }[] = [];
      if (lo && Array.isArray(lo["precos"])) {
        for (const e of lo["precos"]) {
          if (typeof e !== "object" || e === null) continue;
          const r = e as Record<string, unknown>;
          const porItem = r["porItem"];
          const preco = parsePreco(r["preco"]);
          if (typeof porItem === "number" && Number.isInteger(porItem) && porItem > 0 && preco) {
            precos.push({ porItem, preco }); // entrada doente é pulada, não derruba a loja
          }
        }
      }
      return {
        type: "container",
        x: c.x, y: c.y, z: c.z,
        tipo: c.tipo,
        slots: c.slots,
        ...(c.queimando ? { queimando: c.queimando } : {}),
        ...(c.queimaTotal ? { queimaTotal: c.queimaTotal } : {}),
        ...(c.progresso ? { progresso: c.progresso } : {}),
        ...(c.tipo === "loja" && lo
          ? {
              loja: {
                criador: typeof lo["criador"] === "string" ? lo["criador"] : "",
                precos,
                souOCriador: lo["souOCriador"] === true,
              },
            }
          : {}),
      };
    }
    case "container_fechado":
      return { type: "container_fechado" };
    case "chat":
      if (typeof m["author"] !== "string" || typeof m["text"] !== "string") return null;
      return { type: "chat", author: m["author"], text: m["text"] };
    case "join_denied":
      if (typeof m["reason"] !== "string") return null;
      return { type: "join_denied", reason: m["reason"] };
    case "teleport": {
      const nums = [m["x"], m["y"], m["z"], m["yaw"], m["pitch"]];
      if (!nums.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
      return {
        type: "teleport",
        x: m["x"] as number,
        y: m["y"] as number,
        z: m["z"] as number,
        yaw: m["yaw"] as number,
        pitch: m["pitch"] as number,
      };
    }
    case "time": {
      if (typeof m["hora"] !== "number" || !Number.isFinite(m["hora"])) return null;
      if (typeof m["ciclo"] !== "boolean") return null;
      return { type: "time", hora: m["hora"], ciclo: m["ciclo"] };
    }
    case "vento": {
      const dir = m["dir"];
      const forca = m["forca"];
      if (typeof dir !== "number" || !Number.isFinite(dir)) return null;
      if (typeof forca !== "number" || !Number.isFinite(forca)) return null;
      if (typeof m["ativo"] !== "boolean") return null;
      return { type: "vento", dir, forca, ativo: m["ativo"] };
    }
    case "mundo_trocando":
      if (typeof m["nome"] !== "string") return null;
      return { type: "mundo_trocando", nome: m["nome"] };
    case "voo":
      if (typeof m["liberado"] !== "boolean") return null;
      return { type: "voo", liberado: m["liberado"] };
    case "invisivel":
      // o flag É a mensagem inteira: sem ele não há o que aplicar (ao contrário
      // do `pvp` do `modo`, que é diagnóstico opcional)
      if (typeof m["ativo"] !== "boolean") return null;
      return { type: "invisivel", ativo: m["ativo"] };
    case "modo": {
      // §🍖 F1: modo desconhecido = mensagem descartada (é o campo INTEIRO da
      // mensagem, não um diagnóstico opcional — sem ele não há o que aplicar)
      const modo = parseModo(m["efetivo"]);
      if (!modo) return null;
      // §🍖 F7: `pvp` é diagnóstico opcional — host antigo não manda, e a
      // mensagem não pode se perder por causa dele
      const pvp = m["pvp"];
      return { type: "modo", efetivo: modo, ...(typeof pvp === "boolean" ? { pvp } : {}) };
    }
    case "vida": {
      // §🍖 F2: a VIDA é obrigatória; causa/morreu/folego são diagnóstico e
      // entram só se vierem válidos (host antigo não manda)
      const vida = m["vida"];
      if (typeof vida !== "number" || !Number.isFinite(vida)) return null;
      const causa = parseCausaDano(m["causa"]);
      const folego = m["folego"];
      const fome = m["fome"];
      return {
        type: "vida",
        vida,
        ...(causa ? { causa } : {}),
        ...(m["morreu"] === true ? { morreu: true } : {}),
        ...(typeof folego === "number" && Number.isFinite(folego) ? { folego } : {}),
        ...(typeof fome === "number" && Number.isFinite(fome) ? { fome } : {}),
      };
    }
    case "dimas": {
      if (typeof m["saldo"] !== "number" || !Number.isFinite(m["saldo"])) return null;
      return { type: "dimas", saldo: m["saldo"] };
    }
    case "inventario": {
      // §🍖 F4: `slots` tem de ser LISTA (mochila vazia é lista vazia, e isso é
      // informação: significa "gastou tudo"). Slot doente é pulado pelo
      // `parseInventario`, que é a MESMA porta de entrada do save — uma
      // validação só pros dois caminhos.
      if (!Array.isArray(m["slots"])) return null;
      return { type: "inventario", slots: inventarioParaSave(parseInventario(m["slots"])) };
    }
    case "kicked":
      if (typeof m["reason"] !== "string") return null;
      return { type: "kicked", reason: m["reason"] };
    default:
      return null;
  }
}

// --- world_snapshot binário ---
//
// Layout (little-endian):
//   u32  magic "LJW0" (0x304a574c lido como LE dos bytes L J W 0)
//   u8   dims.x   u8 dims.z   u8 dims.y   u8 reservado(0)
//   u32  seed (worldgen determinístico: mesma seed = mesmos bytes)
//   depois: chunks concatenados na ordem de chunkIndex(), CHUNK_VOLUME bytes cada.
// O header carrega as dimensões — o cliente NUNCA assume tamanho de mundo.

export const SNAPSHOT_MAGIC = 0x304a574c; // bytes "LJW0" em little-endian
export const SNAPSHOT_HEADER_BYTES = 12;

export interface Snapshot {
  world: World;
  seed: number;
}

export function encodeSnapshot(world: World, seed: number): ArrayBuffer {
  const buf = new ArrayBuffer(
    SNAPSHOT_HEADER_BYTES + world.chunks.length * CHUNK_VOLUME,
  );
  const view = new DataView(buf);
  view.setUint32(0, SNAPSHOT_MAGIC, true);
  view.setUint8(4, world.dims.x);
  view.setUint8(5, world.dims.z);
  view.setUint8(6, world.dims.y);
  view.setUint8(7, 0);
  view.setUint32(8, seed >>> 0, true);
  const body = new Uint8Array(buf, SNAPSHOT_HEADER_BYTES);
  for (let i = 0; i < world.chunks.length; i++) {
    const chunk = world.chunks[i];
    if (chunk) body.set(chunk, i * CHUNK_VOLUME);
  }
  return buf;
}

/** Decodifica e VALIDA um snapshot. Lança Error em dados inválidos. */
export function decodeSnapshot(buf: ArrayBuffer): Snapshot {
  if (buf.byteLength < SNAPSHOT_HEADER_BYTES) {
    throw new Error(`snapshot menor que o header (${buf.byteLength} bytes)`);
  }
  const view = new DataView(buf);
  if (view.getUint32(0, true) !== SNAPSHOT_MAGIC) {
    throw new Error("snapshot com magic inválido — não é um world_snapshot");
  }
  const dims = { x: view.getUint8(4), z: view.getUint8(5), y: view.getUint8(6) };
  if (
    dims.x < 1 || dims.z < 1 || dims.y < 1 ||
    dims.x > MAX_WORLD_CHUNKS.x || dims.z > MAX_WORLD_CHUNKS.z || dims.y > MAX_WORLD_CHUNKS.y
  ) {
    throw new Error(`snapshot com dims fora do limite: ${dims.x}×${dims.z}×${dims.y}`);
  }
  const seed = view.getUint32(8, true);
  const world = createWorld(dims);
  const expected = SNAPSHOT_HEADER_BYTES + world.chunks.length * CHUNK_VOLUME;
  if (buf.byteLength !== expected) {
    throw new Error(
      `snapshot com tamanho errado: ${buf.byteLength} bytes (esperado ${expected})`,
    );
  }
  for (let i = 0; i < world.chunks.length; i++) {
    world.chunks[i]?.set(
      new Uint8Array(buf, SNAPSHOT_HEADER_BYTES + i * CHUNK_VOLUME, CHUNK_VOLUME),
    );
  }
  return { world, seed };
}

// --- Mundo LAZY / streaming de colunas (F2, 2026-07-20) ---
// Mundo gigante NÃO viaja inteiro: o join manda só um header "LJE0" (dims em
// u16 + seed) e as colunas de chunks chegam depois em lotes binários "LJC0"
// conforme o raio de interesse. O cliente distingue os 3 formatos binários
// pelo magic (peekMagic).

export const LAZY_MAGIC = 0x30454a4c; // "LJE0" em little-endian
export const LAZY_HEADER_BYTES = 16;

/** Teto do mundo LAZY (dims em chunks, u16 no header — 240×240 = 3840²
 *  blocos, ~900× a área do P). Denso continua no teto antigo. */
export const MAX_LAZY_CHUNKS = { x: 240, z: 240, y: 8 } as const;

/** Raio de interesse (em colunas de chunks) — clamp do servidor. */
export const RAIO_MIN = 2;
export const RAIO_MAX = 12;
export const RAIO_PADRAO = 6;
/** Histerese de descarte: além de raio+FOLGA_DESCARTE, cliente E servidor
 *  esquecem a coluna (mesma regra dos dois lados = sem mensagem extra). */
export const FOLGA_DESCARTE = 2;
/** Colunas enviadas por tick por jogador (config de desempenho do host). */
export const COLUNAS_POR_TICK_PADRAO = 8;
/** Teto de `pedir_coluna` aceitos por cliente por segundo (§🔁). O comando
 *  chega pela rede da escola: cliente adulterado não vira gerador de carga.
 *  Acima do teto o servidor IGNORA em silêncio (o cliente honesto tem backoff
 *  próprio e nunca encosta nisso). */
export const PEDIDOS_COLUNA_POR_S = 8;

/** Magic dos primeiros 4 bytes de um frame binário (roteamento no cliente). */
export function peekMagic(buf: ArrayBuffer): number {
  if (buf.byteLength < 4) return 0;
  return new DataView(buf).getUint32(0, true);
}

export function encodeLazyInfo(dims: WorldDims, seed: number): ArrayBuffer {
  const buf = new ArrayBuffer(LAZY_HEADER_BYTES);
  const view = new DataView(buf);
  view.setUint32(0, LAZY_MAGIC, true);
  view.setUint16(4, dims.x, true);
  view.setUint16(6, dims.z, true);
  view.setUint16(8, dims.y, true);
  view.setUint16(10, 0, true);
  view.setUint32(12, seed >>> 0, true);
  return buf;
}

/** Decodifica e VALIDA um header LJE0 — devolve o mundo VAZIO (esparso). */
export function decodeLazyInfo(buf: ArrayBuffer): Snapshot {
  if (buf.byteLength !== LAZY_HEADER_BYTES) {
    throw new Error(`LJE0 com tamanho errado (${buf.byteLength} bytes)`);
  }
  const view = new DataView(buf);
  if (view.getUint32(0, true) !== LAZY_MAGIC) {
    throw new Error("LJE0 com magic inválido");
  }
  const dims = {
    x: view.getUint16(4, true),
    z: view.getUint16(6, true),
    y: view.getUint16(8, true),
  };
  if (
    dims.x < 1 || dims.z < 1 || dims.y < 1 ||
    dims.x > MAX_LAZY_CHUNKS.x || dims.z > MAX_LAZY_CHUNKS.z || dims.y > MAX_LAZY_CHUNKS.y
  ) {
    throw new Error(`LJE0 com dims fora do limite: ${dims.x}×${dims.z}×${dims.y}`);
  }
  return { world: createWorld(dims, false), seed: view.getUint32(12, true) };
}

export const COLUNAS_MAGIC = 0x30434a4c; // "LJC0" em little-endian
const COLUNAS_HEADER_BYTES = 8;

export interface ColunaRef {
  readonly cx: number;
  readonly cz: number;
}

/** Lote binário de colunas de chunks: header (magic + count) + por coluna
 *  [cx u16, cz u16, dims.y × CHUNK_VOLUME bytes]. Servidor SEMPRE manda
 *  coluna materializada (gera antes de enviar). */
export function encodeColunas(world: World, colunas: readonly ColunaRef[]): ArrayBuffer {
  const porColuna = 4 + world.dims.y * CHUNK_VOLUME;
  const buf = new ArrayBuffer(COLUNAS_HEADER_BYTES + colunas.length * porColuna);
  const view = new DataView(buf);
  view.setUint32(0, COLUNAS_MAGIC, true);
  view.setUint16(4, colunas.length, true);
  view.setUint16(6, 0, true);
  const body = new Uint8Array(buf);
  let off = COLUNAS_HEADER_BYTES;
  for (const { cx, cz } of colunas) {
    view.setUint16(off, cx, true);
    view.setUint16(off + 2, cz, true);
    off += 4;
    for (let cy = 0; cy < world.dims.y; cy++) {
      const chunk = world.chunks[chunkIndex(world, cx, cy, cz)];
      if (chunk) body.set(chunk, off);
      off += CHUNK_VOLUME;
    }
  }
  return buf;
}

/** Decodifica e APLICA um lote LJC0 no mundo (aloca as colunas e copia os
 *  bytes). Devolve as colunas aplicadas (o cliente remesha essas + bordas).
 *  Lança Error em dados inválidos. */
export function decodeColunas(buf: ArrayBuffer, world: World): ColunaRef[] {
  if (buf.byteLength < COLUNAS_HEADER_BYTES) {
    throw new Error(`LJC0 menor que o header (${buf.byteLength} bytes)`);
  }
  const view = new DataView(buf);
  if (view.getUint32(0, true) !== COLUNAS_MAGIC) {
    throw new Error("LJC0 com magic inválido");
  }
  const n = view.getUint16(4, true);
  const porColuna = 4 + world.dims.y * CHUNK_VOLUME;
  if (buf.byteLength !== COLUNAS_HEADER_BYTES + n * porColuna) {
    throw new Error(`LJC0 com tamanho errado (${buf.byteLength} bytes p/ ${n} colunas)`);
  }
  const out: ColunaRef[] = [];
  let off = COLUNAS_HEADER_BYTES;
  for (let i = 0; i < n; i++) {
    const cx = view.getUint16(off, true);
    const cz = view.getUint16(off + 2, true);
    off += 4;
    if (cx >= world.dims.x || cz >= world.dims.z) {
      throw new Error(`LJC0 com coluna fora do mundo: ${cx},${cz}`);
    }
    alocarColuna(world, cx, cz);
    for (let cy = 0; cy < world.dims.y; cy++) {
      world.chunks[chunkIndex(world, cx, cy, cz)]?.set(
        new Uint8Array(buf, off, CHUNK_VOLUME),
      );
      off += CHUNK_VOLUME;
    }
    out.push({ cx, cz });
  }
  return out;
}
