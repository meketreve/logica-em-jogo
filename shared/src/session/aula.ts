/**
 * Ajuste AO VIVO do número de cópias da área de atividade (2026-08-17).
 *
 * Aqui moram os dois primitivos de célula. A CÉLULA (um chunk inteiro, ver
 * `grade.ts`) é a unidade de cópia porque o `baseline` do objetivo cobre só a
 * caixa da ÁREA, e os `extras` do cenário ficam fora dela — a parede de manual
 * da aula 6 mora em x+3/x+4 de uma área que tem dx=3. Copiar por área daria ao
 * grupo novo a atividade SEM o enunciado.
 *
 * O gerador (`server/src/cenarios/gerar.ts`) usa os MESMOS primitivos: se eles
 * regredirem, `npm run cenarios` quebra antes de o mundo chegar na escola.
 */
import { BlockId } from "../blocks";
import { MAX_GRUPOS_AULA, REGIAO_PARTIDA, caixaDaCelula, chunkDoGrupo } from "../grade";
import { MAX_REGIONS } from "../regions";
import { type Box, snapshotRegion } from "../scenario";
import type { GameSession } from "../session";
import { getBlock, inBounds } from "../world";
import { broadcastObjectives } from "./cenario";
import { broadcastGroups, sendGroup } from "./equipes";

export interface ResultadoCelula {
  /** Células cujo bloco mudou de fato. */
  escritos: number;
  /** Células puladas por ter jogador em pé (o bloco emparedaria alguém). */
  pulados: number;
}

/**
 * Copia `origem` sobre `destino`, bloco a bloco, na ordem canônica y→z→x.
 * Passa por `applyBlock` (mesma engrenagem do `/regiao encher`): block_changed,
 * fila de vizinhança e recheca de objetivo acordam igual.
 *
 * SOBRESCREVE: célula que no molde é AR vira AR no destino. Sem isso, ajustar
 * duas vezes empilharia o resultado da primeira.
 */
export function copiarCelula(ses: GameSession, origem: Box, destino: Box): ResultadoCelula {
  const dx = destino.min.x - origem.min.x;
  const dy = destino.min.y - origem.min.y;
  const dz = destino.min.z - origem.min.z;
  let escritos = 0;
  let pulados = 0;
  for (let y = origem.min.y; y <= origem.max.y; y++) {
    for (let z = origem.min.z; z <= origem.max.z; z++) {
      for (let x = origem.min.x; x <= origem.max.x; x++) {
        const bloco = getBlock(ses.world, x, y, z);
        const tx = x + dx;
        const ty = y + dy;
        const tz = z + dz;
        if (getBlock(ses.world, tx, ty, tz) === bloco) continue;
        if (bloco !== BlockId.Air && ses.overlapsAnyPlayer(tx, ty, tz)) {
          pulados++;
          continue;
        }
        ses.applyBlock(tx, ty, tz, bloco);
        escritos++;
      }
    }
  }
  // o conteúdo do quadro mora FORA do id de bloco: sem esta linha o grupo novo
  // recebe a parede de manual em branco
  ses.moverQuadros(origem, dx, dy, dz);
  return { escritos, pulados };
}

export interface ResultadoLimpeza {
  /** Células que viraram ar. */
  apagados: number;
}

/** Zera a célula (blocos e conteúdo de quadro). É o que o encolher usa.
 *  Não há "pulados" aqui: virar AR nunca empareda ninguém. */
export function limparCelula(ses: GameSession, caixa: Box): ResultadoLimpeza {
  let apagados = 0;
  for (let y = caixa.min.y; y <= caixa.max.y; y++) {
    for (let z = caixa.min.z; z <= caixa.max.z; z++) {
      for (let x = caixa.min.x; x <= caixa.max.x; x++) {
        if (getBlock(ses.world, x, y, z) === BlockId.Air) continue;
        ses.applyBlock(x, y, z, BlockId.Air);
        apagados++;
      }
    }
  }
  ses.apagarQuadros(caixa);
  return { apagados };
}

/**
 * Prefixos de área que o cenário usa, um por fase: "area", "area2", "area3"…
 * Descobertos pelas regiões `<prefixo>-1` que existem no mundo.
 *
 * Uma região qualquer terminada em "-1" que o professor tenha criado entra aqui
 * também — é o preço de não guardar o layout no save, e o efeito é uma região
 * extra carimbada junto, não um mundo quebrado.
 */
function prefixosDeArea(ses: GameSession): string[] {
  const out: string[] = [];
  for (const nome of ses.regions.keys()) {
    if (!nome.endsWith("-1")) continue;
    const prefixo = nome.slice(0, -2);
    if (prefixo && !out.includes(prefixo)) out.push(prefixo);
  }
  return out.sort();
}

/** Caixa da área `<prefixo>-<g>`: a do grupo 1 transladada pela grade. */
function caixaDaArea(ses: GameSession, prefixo: string, g: number): Box | null {
  const base = ses.regions.get(`${prefixo}-1`);
  if (!base) return null;
  const c1 = caixaDaCelula(chunkDoGrupo(1));
  const cg = caixaDaCelula(chunkDoGrupo(g));
  const dx = cg.min.x - c1.min.x;
  const dz = cg.min.z - c1.min.z;
  return {
    min: { x: base.min.x + dx, y: base.min.y, z: base.min.z + dz },
    max: { x: base.max.x + dx, y: base.max.y, z: base.max.z + dz },
  };
}

/**
 * Encolher apaga trabalho de aluno, então é em DOIS passos: o primeiro só
 * relata o estrago, e o segundo (com "confirmar") executa. Mesmo padrão dos
 * botões de expulsar/banir do painel de jogadores.
 */
function encolher(
  ses: GameSession,
  alvo: number,
  atual: number,
  prefixos: string[],
  confirmado: boolean,
): string {
  const somem: number[] = [];
  for (let g = alvo + 1; g <= atual; g++) somem.push(g);

  if (!confirmado) {
    let alunos = 0;
    for (const g of somem) alunos += ses.grupos.get(g)?.size ?? 0;
    let blocos = 0;
    for (const g of somem) {
      const c = caixaDaCelula(chunkDoGrupo(g));
      for (let y = c.min.y; y <= c.max.y; y++) {
        for (let z = c.min.z; z <= c.max.z; z++) {
          for (let x = c.min.x; x <= c.max.x; x++) {
            if (getBlock(ses.world, x, y, z) !== BlockId.Air) blocos++;
          }
        }
      }
    }
    return (
      `Isto apaga os grupos ${somem.join(", ")}: ${alunos} aluno(s) serão remanejados e ` +
      `${blocos} bloco(s) das áreas deles somem. ` +
      `Para confirmar, digite: /aula grupos ${alvo} confirmar`
    );
  }

  // quem estava nos grupos que somem é recolhido ANTES de apagar
  const orfaos: string[] = [];
  for (const g of somem) {
    for (const nome of ses.grupos.get(g) ?? []) orfaos.push(nome);
  }
  for (const g of somem) {
    ses.grupos.delete(g);
    limparCelula(ses, caixaDaCelula(chunkDoGrupo(g)));
    for (const prefixo of prefixos) ses.regions.delete(`${prefixo}-${g}`);
    for (const o of ses.scenario.objetivos) ses.completosGrupo.delete(`${o.id}:${g}`);
  }
  orfaos.forEach((nome, i) => {
    const destino = (i % alvo) + 1;
    ses.grupos.get(destino)?.add(nome);
    for (const [id, p] of ses.players) {
      if (p.name === nome) {
        ses.sendServerChat(id, `seu grupo foi desfeito; você agora está no grupo ${destino}`);
      }
    }
  });

  for (const o of ses.scenario.objetivos) {
    if (o.alvos) o.alvos.length = Math.min(o.alvos.length, alvo);
    if (o.baseline) o.baseline.length = Math.min(o.baseline.length, alvo);
  }

  ses.broadcastRegions();
  broadcastGroups(ses);
  broadcastObjectives(ses, true);
  for (const [id] of ses.players) sendGroup(ses, id);
  return `Mundo ajustado para ${alvo} grupo(s) — ${somem.length} área(s) removida(s).`;
}

/**
 * `/aula grupos X [confirmar]` — ajusta o mundo para X grupos DURANTE a aula.
 *
 * Não é açúcar para `/grupo criar X`: aquele ZERA composição e progresso
 * ("turma nova"). Aqui os grupos 1..min(N,X) ficam intocados, e só a diferença
 * é criada ou removida — é o único comportamento que serve com a aula em
 * andamento.
 */
export function runAula(ses: GameSession, clientId: number, parts: string[]): string {
  if (ses.players.get(clientId)?.papel !== "professor") {
    return "Somente o professor pode usar /aula.";
  }
  if (parts[1] !== "grupos") {
    return "Uso: /aula grupos X — ajusta o mundo para X grupos, criando ou removendo áreas.";
  }
  const alvo = Number(parts[2]);
  if (!Number.isInteger(alvo) || alvo < 1 || alvo > MAX_GRUPOS_AULA) {
    return `Uso: /aula grupos X, com X de 1 a ${MAX_GRUPOS_AULA}.`;
  }
  const molde = ses.regions.get(REGIAO_PARTIDA);
  if (!molde) {
    return (
      `Este mundo não tem a região "${REGIAO_PARTIDA}" — ele foi gerado num modelo antigo. ` +
      "Baixe a aula de novo (o launcher atualiza sozinho) para poder ajustar os grupos."
    );
  }
  const atual = ses.grupos.size;
  const prefixos = prefixosDeArea(ses);
  if (prefixos.length === 0) return "Este mundo não tem áreas de grupo para ajustar.";
  if (alvo < atual) return encolher(ses, alvo, atual, prefixos, parts[3] === "confirmar");

  // --- crescer (ou re-executar com o MESMO número) ---
  // alvo === atual não é no-op: é o caminho de RE-TENTATIVA. Se um aluno estava
  // em pé numa célula, aqueles blocos foram pulados; rodar de novo completa.
  const novos = alvo - atual;
  if (ses.regions.size + novos * prefixos.length > MAX_REGIONS) {
    return `Limite de ${MAX_REGIONS} regiões atingido — não dá para criar as áreas.`;
  }
  // valida TUDO antes de mexer em bloco nenhum (carimbo pela metade = lixo)
  const desde = alvo === atual ? 1 : atual + 1;
  for (let g = desde; g <= alvo; g++) {
    const c = caixaDaCelula(chunkDoGrupo(g));
    if (!inBounds(ses.world, c.max.x, c.max.y, c.max.z)) {
      return `A área do grupo ${g} não cabe neste mundo.`;
    }
  }

  let pulados = 0;
  for (let g = desde; g <= alvo; g++) {
    const r = copiarCelula(ses, { min: molde.min, max: molde.max }, caixaDaCelula(chunkDoGrupo(g)));
    pulados += r.pulados;
    for (const prefixo of prefixos) {
      const caixa = caixaDaArea(ses, prefixo, g);
      if (!caixa) continue;
      const nome = `${prefixo}-${g}`;
      ses.regions.set(nome, { nome, min: caixa.min, max: caixa.max });
    }
    if (!ses.grupos.has(g)) ses.grupos.set(g, new Set());
  }

  // o objetivo per-grupo congela `alvos` na criação: sem estender aqui, o grupo
  // novo teria área e nenhum objetivo pendurado nela
  for (const o of ses.scenario.objetivos) {
    if (!o.alvos) continue;
    const prefixo = o.regiao.split("-")[0] ?? prefixos[0] ?? "";
    for (let g = o.alvos.length + 1; g <= alvo; g++) {
      const caixa = caixaDaArea(ses, prefixo, g);
      if (!caixa) continue;
      o.alvos.push({ min: { ...caixa.min }, max: { ...caixa.max } });
      o.baseline?.push(snapshotRegion(ses.world, caixa));
    }
    o.regiao = `${prefixo}-1…${o.alvos.length}`;
  }

  ses.broadcastRegions();
  broadcastGroups(ses);
  broadcastObjectives(ses, true);
  for (const [id] of ses.players) sendGroup(ses, id);
  const feito = alvo === atual ? "áreas recarimbadas" : `${novos} área(s) criada(s)`;
  return (
    `Mundo ajustado para ${alvo} grupo(s) — ${feito}.` +
    (pulados
      ? ` ${pulados} bloco(s) pulados por ter jogador no lugar; peça para saírem e rode /aula grupos ${alvo} de novo.`
      : "")
  );
}
