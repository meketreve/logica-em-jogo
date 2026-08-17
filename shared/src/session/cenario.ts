import { BlockId } from "../blocks";
import { type ServerMessage } from "../protocol";
import { type NamedRegion, regionContains, regionDims } from "../regions";
import {
  type Box,
  type GroupObjectiveState,
  MAX_OBJETIVOS,
  MAX_OBJETIVO_CELLS,
  MAX_OBJETIVO_TEXTO,
  type Objective,
  type ObjectiveState,
  boxVolume,
  countSolid,
  matchRegion,
  snapshotRegion,
} from "../scenario";
import { getBlock } from "../world";
import { grupoDe } from "./equipes";
import type { GameSession } from "../session";

/**
 * Cenário (cp12/13) — os OBJETIVOS de uma aula, do lado do servidor.
 *
 * Três coisas moram aqui: o comando `/objetivo` do professor, o BASELINE (a
 * foto do estado autoral que faz "reiniciar" resetar de verdade) e a DETECÇÃO,
 * que acorda por MUDANÇA (applyBlock marca sujo) e nunca por varredura
 * periódica do mundo — a regra de ouro do projeto.
 *
 * O que NÃO mora aqui: a comparação de região com gabarito, que é lógica pura
 * e vive em `../scenario.ts`. Este módulo é a parte que precisa da sessão.
 */

/**
 * Resolve o nome de área de um objetivo: região exata = COMPARTILHADA;
 * senão, com grupos criados, `nome-1`…`nome-N` = uma área POR GRUPO
 * (é o que o /regiao carimbar produz).
 */
export function resolveAlvos(
  ses: GameSession,
  nome: string,
): { shared?: NamedRegion; porGrupo?: NamedRegion[]; erro?: string } {
  const exata = ses.regions.get(nome);
  if (exata) return { shared: exata };
  if (ses.grupos.size > 0 && ses.regions.has(`${nome}-1`)) {
    const porGrupo: NamedRegion[] = [];
    for (let g = 1; g <= ses.grupos.size; g++) {
      const r = ses.regions.get(`${nome}-${g}`);
      if (!r) {
        return {
          erro:
            `Falta a região "${nome}-${g}": o mundo tem ${ses.grupos.size} grupos, ` +
            `então é preciso uma área para cada um (ajuste com /aula grupos ${ses.grupos.size}).`,
        };
      }
      porGrupo.push(r);
    }
    return { porGrupo };
  }
  return {
    erro: ses.grupos.size
      ? `Não existe região chamada "${nome}", nem "${nome}-1" (uma área para cada grupo).`
      : `Não existe região chamada "${nome}".`,
  };
}

/** Subcomandos de /objetivo — só chega aqui com papel professor. */
export function runObjetivo(ses: GameSession, parts: string[]): string {
  switch (parts[1]) {
    case "add": {
      const kind = parts[2];
      if (ses.scenario.objetivos.length >= MAX_OBJETIVOS) {
        return `Limite de ${MAX_OBJETIVOS} objetivos atingido.`;
      }
      if (kind === "construir") {
        const modelo = ses.regions.get(parts[3] ?? "");
        const res = resolveAlvos(ses, parts[4] ?? "");
        const texto = parts.slice(5).join(" ").slice(0, MAX_OBJETIVO_TEXTO);
        if (!modelo || (!res.shared && !res.porGrupo) || !texto) {
          return (
            res.erro ??
            "Uso: /objetivo add construir modelo alvo enunciado… — o jogo fotografa a " +
              "região MODELO agora e passa a conferir a região ALVO, que precisa ter o " +
              "mesmo tamanho. O alvo pode ser um prefixo com uma área para cada grupo, " +
              "criado com /aula grupos."
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
        const gabarito = snapshotRegion(ses.world, modelo);
        if (!gabarito.some((b) => b !== BlockId.Air)) {
          return `A região modelo "${modelo.nome}" está vazia. Construa o modelo antes de fotografá-lo.`;
        }
        for (const caixa of caixas) {
          const m = matchRegion(ses.world, caixa, gabarito);
          if (m.corretos === m.alvo && m.extras === 0) {
            return (
              `a área "${caixa.nome}" JÁ bate com o modelo — apague o conteúdo ` +
              `dela (/regiao encher ${caixa.nome} 0) ou use outro alvo`
            );
          }
        }
        const alvoNome = res.porGrupo ? `${parts[4]}-1…${caixas.length}` : (res.shared?.nome ?? "");
        const o: Objective = {
          id: ses.nextObjetivoId++,
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
        capturarBaseline(ses, o); // estado autoral da área (semente) → reiniciar restaura
        ses.scenario.objetivos.push(o);
        broadcastObjectives(ses);
        const alvoTotal = gabarito.filter((b) => b !== BlockId.Air).length;
        return `Objetivo #${o.id} criado: construir em "${alvoNome}" — ${alvoTotal} blocos, modelo "${modelo.nome}".`;
      }
      if (kind === "chegar" || kind === "limpar") {
        // chegar aceita regra opcional depois da região: todos | um (default)
        const regra =
          kind === "chegar" && (parts[4] === "todos" || parts[4] === "um")
            ? parts[4]
            : undefined;
        const res = resolveAlvos(ses, parts[3] ?? "");
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
            if (countSolid(ses.world, caixa) === 0) {
              return `A região "${caixa.nome}" já está vazia: não há nada para limpar.`;
            }
          }
        }
        const primeira = caixas[0] as NamedRegion;
        const o: Objective = {
          id: ses.nextObjetivoId++,
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
        if (kind === "limpar") capturarBaseline(ses, o); // reiniciar recompõe a bagunça
        ses.scenario.objetivos.push(o);
        broadcastObjectives(ses);
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
      if (ses.scenario.objetivos.length === 0) {
        return "Nenhum objetivo foi criado ainda. Use /objetivo add construir|chegar|limpar.";
      }
      const ativos = activeIdsFor(ses, 0);
      return ses.scenario.objetivos
        .map((o) => {
          const estado = o.alvos
            ? [...ses.grupos.keys()]
                .map((g) => `g${g}${isCompleteFor(ses, o, g) ? "✓" : ""}`)
                .join(" ")
            : ses.scenario.completos.has(o.id)
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
      const o = ses.scenario.objetivos.find((obj) => obj.id === id);
      if (!o) return `Não existe objetivo #${id}.`;
      o.texto = texto;
      broadcastObjectives(ses);
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
      const idx = ses.scenario.objetivos.findIndex((o) => o.id === id);
      if (idx === -1) return `Não existe objetivo #${id}.`;
      const destino = Math.min(Math.max(pos, 1), ses.scenario.objetivos.length) - 1;
      const [o] = ses.scenario.objetivos.splice(idx, 1);
      if (o) ses.scenario.objetivos.splice(destino, 0, o);
      broadcastObjectives(ses);
      return `Objetivo #${id} agora é o ${destino + 1}º da lista.`;
    }
    case "remover": {
      const id = Number(parts[2]);
      if (parts.length !== 3 || !Number.isInteger(id)) return "Uso: /objetivo remover id.";
      const idx = ses.scenario.objetivos.findIndex((o) => o.id === id);
      if (idx === -1) return `Não existe objetivo #${id}.`;
      ses.scenario.objetivos.splice(idx, 1);
      ses.scenario.completos.delete(id);
      for (const key of ses.completosGrupo) {
        if (key.startsWith(`${id}:`)) ses.completosGrupo.delete(key);
      }
      for (const key of ses.objetivosDirty) {
        if (key.startsWith(`${id}:`)) ses.objetivosDirty.delete(key);
      }
      broadcastObjectives(ses);
      return `Objetivo #${id} removido.`;
    }
    case "modo": {
      const modo = parts[2];
      if (modo !== "sequencial" && modo !== "livre") {
        return "Uso: /objetivo modo sequencial|livre — no modo sequencial os objetivos valem um de cada vez, na ordem da lista.";
      }
      ses.scenario.modo = modo;
      broadcastObjectives(ses);
      return `Modo do cenário: ${modo}.`;
    }
    case "resetar": {
      const mudados = zerarProgresso(ses);
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
export function areasDe(ses: GameSession, o: Objective): Box[] {
  return o.alvos ?? [{ min: o.min, max: o.max }];
}

/** Fotografa o estado AUTORAL das áreas do objetivo (para reiniciar depois). */
export function capturarBaseline(ses: GameSession, o: Objective): void {
  o.baseline = areasDe(ses, o).map((box) => snapshotRegion(ses.world, box));
}

/**
 * Repõe cada área ao seu baseline autoral. É o que faz "reiniciar" resetar de
 * verdade: sem isto os blocos que os alunos colocaram ficariam, e na aula de
 * sequência o objetivo re-concluiria na hora. Passa pelo applyBlock (mesma
 * engrenagem do /regiao encher): block_changed + fila de vizinhança + recheca
 * o objetivo. Não emparedar jogador em pé numa célula que voltaria a ser bloco.
 */
/** Repõe UMA área (índice k) de um objetivo ao seu baseline autoral. */
export function restaurarAreaBaseline(ses: GameSession, o: Objective, k: number): number {
  const blocks = o.baseline?.[k];
  const box = areasDe(ses, o)[k];
  if (!blocks || !box) return 0;
  let mudados = 0;
  let i = 0;
  for (let y = box.min.y; y <= box.max.y; y++) {
    for (let z = box.min.z; z <= box.max.z; z++) {
      for (let x = box.min.x; x <= box.max.x; x++) {
        const alvo = blocks[i++];
        if (alvo === undefined) continue;
        if (getBlock(ses.world, x, y, z) === alvo) continue;
        if (alvo !== BlockId.Air && ses.overlapsAnyPlayer(x, y, z)) continue;
        ses.applyBlock(x, y, z, alvo);
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
export function restaurarAreasBaseline(ses: GameSession): number {
  let mudados = 0;
  if (ses.scenario.modo === "sequencial") {
    const escopos = ses.grupos.size ? [...ses.grupos.keys()] : [0];
    for (const g of escopos) {
      for (const id of activeIdsFor(ses, g)) {
        const o = ses.scenario.objetivos.find((x) => x.id === id);
        if (!o?.baseline) continue;
        mudados += restaurarAreaBaseline(ses, o, g > 0 && o.alvos ? g - 1 : 0);
      }
    }
    return mudados;
  }
  for (const o of ses.scenario.objetivos) {
    if (!o.baseline) continue;
    areasDe(ses, o).forEach((_box, k) => {
      mudados += restaurarAreaBaseline(ses, o, k);
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
export function carregarProximaSequencia(ses: GameSession, grupo: number): void {
  for (const id of activeIdsFor(ses, grupo)) {
    const o = ses.scenario.objetivos.find((x) => x.id === id);
    if (!o || o.kind === "chegar" || !o.baseline) continue;
    restaurarAreaBaseline(ses, o, grupo > 0 && o.alvos ? grupo - 1 : 0);
  }
}

/** Zera as conclusões E restaura as áreas ao estado inicial. Devolve quantos
 *  blocos foram repostos (usado por /objetivo resetar e /iniciar). */
export function zerarProgresso(ses: GameSession): number {
  ses.scenario.completos.clear();
  ses.completosGrupo.clear();
  const mudados = restaurarAreasBaseline(ses);
  broadcastObjectives(ses);
  return mudados;
}

/**
 * Ids ativos pro ESCOPO dado: grupo 0 = mundo/compartilhado, g ≥ 1 = grupo.
 * Sequencial = primeiro incompleto NAQUELE escopo (grupos andam em ritmos
 * diferentes); livre = todos os incompletos.
 */
export function activeIdsFor(ses: GameSession, grupo: number): Set<number> {
  const ativos = new Set<number>();
  for (const o of ses.scenario.objetivos) {
    if (isCompleteFor(ses, o, grupo)) continue;
    ativos.add(o.id);
    if (ses.scenario.modo === "sequencial") break;
  }
  return ativos;
}

/** Objetivo compartilhado concluído vale pra TODO grupo; per-grupo é próprio.
 *  chegar em modo grupos é SEMPRE por grupo (mesmo com região compartilhada). */
export function isCompleteFor(ses: GameSession, o: Objective, grupo: number): boolean {
  if (ses.scenario.completos.has(o.id)) return true;
  return grupo > 0 && ses.completosGrupo.has(`${o.id}:${grupo}`);
}

export function isObjectiveDone(ses: GameSession, o: Objective, box: Box): boolean {
  if (o.kind === "construir" && o.gabarito) {
    const m = matchRegion(ses.world, box, o.gabarito);
    return m.corretos === m.alvo && m.extras === 0;
  }
  if (o.kind === "limpar") return countSolid(ses.world, box) === 0;
  return false; // chegar conclui pelo move, não por estado do mundo
}

/** Marca concluído no escopo (0 = mundo) e agenda o anúncio — NUNCA desfaz. */
export function completeObjetivo(ses: GameSession, o: Objective, grupo: number): void {
  if (isCompleteFor(ses, o, grupo)) return;
  if (grupo > 0) {
    ses.completosGrupo.add(`${o.id}:${grupo}`);
    ses.pendingCompletionTexts.push(`grupo ${grupo} concluiu: ${o.texto}`);
  } else {
    ses.scenario.completos.add(o.id);
    ses.pendingCompletionTexts.push(`objetivo concluído: ${o.texto}`);
  }
}

/**
 * Objetivo chegar (chamado a cada move de QUALQUER jogador): com grupos, a
 * conclusão é do GRUPO de quem pisou (sem grupo = não pontua); sem grupos,
 * é do mundo. Regra "todos": grupo inteiro (online) dentro da região.
 */
export function checkChegar(ses: GameSession, clientId: number): void {
  if (ses.scenario.objetivos.length === 0) return;
  const p = ses.players.get(clientId);
  if (!p) return;
  const temGrupos = ses.grupos.size > 0;
  const g = temGrupos ? (grupoDe(ses, p.name) ?? 0) : 0;
  if (temGrupos && g === 0) return; // sem grupo não participa (avisado no HUD)
  const ativos = activeIdsFor(ses, g);
  let mudou = false;
  for (const o of ses.scenario.objetivos) {
    if (o.kind !== "chegar" || !ativos.has(o.id)) continue;
    if (isCompleteFor(ses, o, g)) continue;
    const box = o.alvos && g > 0 ? o.alvos[g - 1] : o;
    if (!box) continue;
    const dentro = (q: { x: number; y: number; z: number }): boolean =>
      regionContains(box, Math.floor(q.x), Math.floor(q.y), Math.floor(q.z));
    let completou: boolean;
    if (o.regra === "todos") {
      // todos os membros ONLINE do escopo dentro da região ao mesmo tempo
      const membros = [...ses.players.values()].filter((q) =>
        g > 0 ? ses.grupos.get(g)?.has(q.name) : q.papel === "aluno",
      );
      completou = membros.length > 0 && membros.every(dentro);
    } else {
      completou = dentro(p);
    }
    if (completou) {
      completeObjetivo(ses, o, g);
      mudou = true;
    }
  }
  if (mudou) broadcastObjectives(ses);
}

export function buildObjectiveStates(ses: GameSession): ObjectiveState[] {
  const temGrupos = ses.grupos.size > 0;
  const ativosMundo = activeIdsFor(ses, 0);
  const ativosPorGrupo = new Map<number, Set<number>>();
  if (temGrupos) {
    for (const g of ses.grupos.keys()) ativosPorGrupo.set(g, activeIdsFor(ses, g));
  }
  const progresso = (o: Objective, box: Box): { atual: number; total: number; extras: number } => {
    if (o.kind === "construir" && o.gabarito) {
      const m = matchRegion(ses.world, box, o.gabarito);
      return { atual: m.corretos, total: m.alvo, extras: m.extras };
    }
    if (o.kind === "limpar") {
      return { atual: countSolid(ses.world, box), total: 0, extras: 0 };
    }
    return { atual: 0, total: 0, extras: 0 };
  };
  return ses.scenario.objetivos.map((o) => {
    const base = progresso(o, o.alvos?.[0] ?? o);
    let porGrupo: GroupObjectiveState[] | undefined;
    if (temGrupos) {
      porGrupo = [...ses.grupos.keys()].map((g) => {
        const box = o.alvos?.[g - 1] ?? o;
        const prog = o.alvos ? progresso(o, box) : base;
        return {
          grupo: g,
          min: box.min,
          max: box.max,
          ...prog,
          completo: isCompleteFor(ses, o, g),
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
        : ses.scenario.completos.has(o.id),
      ativo: temGrupos
        ? (porGrupo?.some((s) => s.ativo) ?? false)
        : ativosMundo.has(o.id),
      ...base,
      ...(porGrupo ? { porGrupo } : {}),
    };
  });
}

export function objectivesJson(ses: GameSession): string {
  return JSON.stringify({
    type: "objectives",
    modo: ses.scenario.modo,
    objetivos: buildObjectiveStates(ses),
  } satisfies ServerMessage);
}

export function sendObjectives(ses: GameSession, clientId: number): void {
  ses.send(clientId, objectivesJson(ses));
}

/** Manda o cenário pra TODOS — só se mudou desde o último broadcast. */
export function broadcastObjectives(ses: GameSession, force = false): void {
  const raw = objectivesJson(ses);
  if (force || raw !== ses.lastObjectivesJson) {
    ses.lastObjectivesJson = raw;
    for (const clientId of ses.players.keys()) ses.send(clientId, raw);
  }
  // anúncio de conclusão SEMPRE depois do estado novo
  for (const texto of ses.pendingCompletionTexts) {
    ses.broadcast({ type: "chat", author: "servidor", text: `objetivo concluído: ${texto}` });
  }
  ses.pendingCompletionTexts = [];
}
