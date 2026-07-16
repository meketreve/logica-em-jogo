/**
 * Conferência de um .ljw recém-gerado: abre o save num servidor NOVO (como o
 * professor faria no lab), entra como professor e como 2 alunos, e COMPLETA a
 * área do grupo 1 até o objetivo fechar.
 *
 * Roda dentro do gerador: cenário que não é jogável não vira arquivo.
 */
import {
  BlockId,
  CABIN_SIZE,
  CHUNK_SIZE,
  FLAT_SURFACE_Y,
  GameSession,
  decodeSave,
  getBlock,
} from "@logica/shared";
import type { Box, World } from "@logica/shared";

interface Grupo {
  id: number;
  membros: string[];
}
interface EstadoGrupo {
  grupo: number;
  atual: number;
  total: number;
  completo: boolean;
}
interface Objetivo {
  id: number;
  texto: string;
  atual: number;
  total: number;
  completo: boolean;
  porGrupo?: EstadoGrupo[];
}

export interface Conferencia {
  grupos: number;
  codigo: string;
}

/**
 * A faixa do grupo tem que estar NO CHÃO, FORA da cabine e DENTRO do chunk dela
 * — é o que o roteiro de aula promete ao professor ("alguns passos à frente da
 * porta"). Faixa flutuando ou enfiada na parede passaria em todo teste lógico.
 */
function conferirGeometria(world: World, alvos: Box[], problemas: string[]): void {
  const y = FLAT_SURFACE_Y + 1;
  alvos.forEach((a, i) => {
    const g = i + 1;
    if (a.min.y !== y || a.max.y !== y) {
      problemas.push(`área do grupo ${g} não está na altura do chão (y=${a.min.y}, esperado ${y})`);
      return;
    }
    const ox = Math.floor(a.min.x / CHUNK_SIZE) * CHUNK_SIZE;
    const oz = Math.floor(a.min.z / CHUNK_SIZE) * CHUNK_SIZE;
    if (getBlock(world, ox, FLAT_SURFACE_Y, oz) !== BlockId.StoneBricks) {
      problemas.push(`o grupo ${g} não tem o plot demarcado no chunk da área dele`);
    }
    for (let z = a.min.z; z <= a.max.z; z++) {
      for (let x = a.min.x; x <= a.max.x; x++) {
        if (getBlock(world, x, y - 1, z) !== BlockId.Grass) {
          problemas.push(`área do grupo ${g}: célula (${x},${z}) não tem chão de grama embaixo`);
          return;
        }
        if (x - ox < CABIN_SIZE && z - oz < CABIN_SIZE) {
          problemas.push(`área do grupo ${g}: célula (${x},${z}) cai dentro do plot`);
          return;
        }
        if (Math.floor(x / CHUNK_SIZE) * CHUNK_SIZE !== ox || Math.floor(z / CHUNK_SIZE) * CHUNK_SIZE !== oz) {
          problemas.push(`área do grupo ${g}: célula (${x},${z}) vazou pro chunk vizinho`);
          return;
        }
      }
    }
  });
}

/** Devolve a lista de problemas — vazia = cenário jogável. */
export function conferir(buf: ArrayBuffer, o: Conferencia): string[] {
  const problemas: string[] = [];
  const exigir = (cond: boolean, msg: string): void => {
    if (!cond) problemas.push(msg);
  };

  const save = decodeSave(buf); // valida o formato do arquivo de quebra
  exigir(save.roster.length === 0, "o save carrega identidade do autor (roster devia estar vazio)");
  exigir(save.grupos?.length === o.grupos, `esperava ${o.grupos} grupos no save`);
  exigir(save.cenario?.objetivos.length === 1, "esperava exatamente 1 objetivo no cenário");
  const objetivo = save.cenario?.objetivos[0];
  if (!objetivo?.gabarito || !objetivo.alvos?.length) {
    problemas.push("objetivo sem gabarito ou sem área por grupo");
    return problemas;
  }

  conferirGeometria(save.world, objetivo.alvos, problemas);

  const msgs = new Map<number, Record<string, unknown>[]>();
  const s = new GameSession(
    (id, data) => {
      if (typeof data !== "string") return;
      const lista = msgs.get(id) ?? [];
      lista.push(JSON.parse(data) as Record<string, unknown>);
      msgs.set(id, lista);
    },
    { restore: save, codigo: o.codigo },
  );
  const send = (id: number, m: unknown): void => s.handleMessage(id, JSON.stringify(m));
  const ultima = <T>(id: number, tipo: string): T | undefined =>
    msgs.get(id)?.filter((m) => m["type"] === tipo).at(-1) as T | undefined;

  // o professor real entra com o CÓDIGO (o save não trouxe ninguém)
  send(1, { type: "join", name: "profa", pin: "1234", codigo: o.codigo });
  exigir(
    ultima<{ papel?: string }>(1, "spawn")?.papel === "professor",
    "quem entra com o código não virou professor",
  );

  // alunos entram sem código e caem em grupos diferentes
  send(2, { type: "join", name: "ana", pin: "1111" });
  send(3, { type: "join", name: "bia", pin: "2222" });
  const grupos = ultima<{ grupos: Grupo[] }>(2, "groups")?.grupos ?? [];
  exigir(
    grupos.find((g) => g.membros.includes("ana"))?.id === 1 &&
      grupos.find((g) => g.membros.includes("bia"))?.id === 2,
    "alunos não foram auto-distribuídos em grupos diferentes",
  );

  const antes = ultima<{ objetivos: Objetivo[] }>(2, "objectives")?.objetivos[0];
  const g1 = antes?.porGrupo?.find((g) => g.grupo === 1);
  exigir(!!antes?.texto, "o aluno não recebeu o enunciado");
  exigir(!!g1 && !g1.completo && g1.atual < g1.total, "o objetivo já nasce completo pro grupo 1");

  // o grupo 1 monta o gabarito na SUA área, célula a célula (ordem canônica y→z→x)
  const alvo = objetivo.alvos[0]!;
  const { min, max } = objetivo;
  let i = 0;
  for (let y = min.y; y <= max.y; y++) {
    for (let z = min.z; z <= max.z; z++) {
      for (let x = min.x; x <= max.x; x++) {
        const id = objetivo.gabarito[i++]!;
        send(1, {
          type: "chat",
          text: `/bloco ${alvo.min.x + (x - min.x)} ${alvo.min.y + (y - min.y)} ${alvo.min.z + (z - min.z)} ${id}`,
        });
      }
    }
  }
  s.tick(); // a detecção roda no TICK do servidor (regra de ouro), não no clique

  const depois = ultima<{ objetivos: Objetivo[] }>(2, "objectives")?.objetivos[0];
  const f1 = depois?.porGrupo?.find((g) => g.grupo === 1);
  const f2 = depois?.porGrupo?.find((g) => g.grupo === 2);
  exigir(!!f1?.completo, `grupo 1 montou o gabarito e NÃO completou (${f1?.atual}/${f1?.total})`);
  exigir(!f2?.completo, "grupo 2 completou junto — o progresso não está isolado por grupo");
  const fala = msgs.get(2)?.filter((m) => m["type"] === "chat").at(-1)?.["text"];
  exigir(/conclu/i.test(String(fala ?? "")), "o chat não anunciou a conclusão pro aluno");

  return problemas;
}
