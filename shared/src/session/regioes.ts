import { BlockId, isPlaceable, isPorta } from "../blocks";
import { MAX_REGIONS, MAX_REGION_NAME, type NamedRegion, type Vec3i, regionDims, regionFromCorners } from "../regions";
import { MAX_ENCHER_CELLS, MAX_OBJETIVO_CELLS, boxVolume } from "../scenario";
import { getBlock, inBounds } from "../world";
import { parseCoordArg } from "./coords";
import type { GameSession } from "../session";

/**
 * §🗺️ REGIÕES nomeadas (cp11) — o `/regiao` do professor.
 *
 * Uma região é uma caixa com nome, e é a moeda de todo o resto da autoria:
 * objetivo aponta pra região, área de grupo é região, `carimbar` gera uma por
 * grupo. `encher` e `sortear` passam pelo applyBlock (mesma engrenagem da
 * edição do aluno: block_changed + fila de vizinhança + recheca objetivo).
 */

export function runRegiao(ses: GameSession, clientId: number, parts: string[]): string {
  switch (parts[1]) {
    case "lista": {
      if (ses.regions.size === 0) {
        return "Nenhuma região foi criada ainda. Marque os dois cantos com a varinha (tecla R) e use /regiao criar nome.";
      }
      // uma região por linha (cliente renderiza \n com white-space: pre-line)
      return [...ses.regions.values()]
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
      if (ses.regions.has(nome)) return `Já existe uma região chamada "${nome}". Apague-a antes ou escolha outro nome.`;
      if (ses.regions.size >= MAX_REGIONS) return `Limite de ${MAX_REGIONS} regiões atingido.`;
      let c1: Vec3i;
      let c2: Vec3i;
      if (parts.length === 9) {
        const p = ses.players.get(clientId);
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
          if (!inBounds(ses.world, c.x, c.y, c.z)) {
            return `As coordenadas (${c.x}, ${c.y}, ${c.z}) estão fora do mundo.`;
          }
        }
      } else {
        const marks = ses.wandMarks.get(clientId);
        if (!marks?.c1 || !marks.c2) {
          return "Marque os dois cantos com a varinha primeiro (tecla R: clique esquerdo marca o canto 1, o direito marca o canto 2) — ou digite as coordenadas: /regiao criar nome x1 y1 z1 x2 y2 z2 (o ~ copia a sua coordenada).";
        }
        c1 = marks.c1;
        c2 = marks.c2;
      }
      const region: NamedRegion = { nome, ...regionFromCorners(c1, c2) };
      ses.regions.set(nome, region);
      ses.wandMarks.delete(clientId); // cantos são rascunho de UMA região
      ses.broadcastRegions();
      const d = regionDims(region);
      return `Região "${nome}" criada: ${d.x}×${d.y}×${d.z} blocos.`;
    }
    case "apagar": {
      const nome = parts[2];
      if (parts.length !== 3 || !nome) return "Uso: /regiao apagar nome.";
      if (!ses.regions.delete(nome)) return `Não existe região chamada "${nome}".`;
      ses.broadcastRegions();
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
      const r = ses.regions.get(nome);
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
            if (getBlock(ses.world, x, y, z) === id) continue;
            if (id !== BlockId.Air && ses.overlapsAnyPlayer(x, y, z)) {
              puladas.push({ x, y, z });
              continue;
            }
            ses.applyBlockQuieto(x, y, z, id);
            mudados++;
          }
        }
      }
      if (mudados > 0 || puladas.length > 0) {
        ses.broadcast({
          type: "blocks_filled",
          x0: r.min.x, y0: r.min.y, z0: r.min.z,
          x1: r.max.x, y1: r.max.y, z1: r.max.z,
          blockId: id,
        });
        for (const c of puladas) {
          ses.broadcast({
            type: "block_changed",
            x: c.x, y: c.y, z: c.z,
            blockId: getBlock(ses.world, c.x, c.y, c.z),
          });
        }
      }
      return `Região "${nome}": ${mudados} bloco(s) alterado(s).`;
    }
    case "carimbar": {
      // /regiao carimbar modelo prefixo espacamento [z] — replica a região
      // modelo (BLOCOS inclusos — cabines!) uma vez POR GRUPO ao longo do
      // eixo, e nomeia prefixo-1…N. Insumo do objetivo per-grupo.
      const modelo = ses.regions.get(parts[2] ?? "");
      const prefixo = parts[3];
      const esp = Number(parts[4]);
      const eixo = parts[5] === "z" ? "z" : "x";
      if (
        !modelo || !prefixo || !Number.isInteger(esp) || esp < 0 ||
        parts.length > 6 || (parts.length === 6 && parts[5] !== "z" && parts[5] !== "x")
      ) {
        return "Uso: /regiao carimbar modelo prefixo espacamento [z] — copia a região modelo uma vez para cada grupo, lado a lado.";
      }
      const n = ses.grupos.size;
      if (n === 0) return "Crie os grupos antes (/grupo criar n): o carimbo faz uma cópia para cada grupo.";
      if (boxVolume(modelo) > MAX_OBJETIVO_CELLS) {
        return `A região é grande demais para carimbar (máximo de ${MAX_OBJETIVO_CELLS} blocos).`;
      }
      if (prefixo.length + 3 > MAX_REGION_NAME) return "O prefixo é grande demais.";
      if (ses.regions.size + n > MAX_REGIONS) return `Limite de ${MAX_REGIONS} regiões atingido.`;
      const d = regionDims(modelo);
      const passo = (eixo === "x" ? d.x : d.z) + esp;
      // valida TUDO antes de mudar qualquer bloco (carimbo pela metade = lixo)
      for (let g = 1; g <= n; g++) {
        const off = g * passo;
        const maxX = modelo.max.x + (eixo === "x" ? off : 0);
        const maxZ = modelo.max.z + (eixo === "z" ? off : 0);
        if (!inBounds(ses.world, maxX, modelo.max.y, maxZ)) {
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
              const bloco = getBlock(ses.world, x, y, z);
              const tx = x + ox;
              const tz = z + oz;
              if (getBlock(ses.world, tx, y, tz) === bloco) continue;
              if (bloco !== BlockId.Air && ses.overlapsAnyPlayer(tx, y, tz)) {
                pulados++;
                continue;
              }
              ses.applyBlock(tx, y, tz, bloco);
            }
          }
        }
        const nome = `${prefixo}-${g}`;
        ses.regions.set(nome, {
          nome,
          min: { x: modelo.min.x + ox, y: modelo.min.y, z: modelo.min.z + oz },
          max: { x: modelo.max.x + ox, y: modelo.max.y, z: modelo.max.z + oz },
        });
      }
      ses.broadcastRegions();
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
      const r = ses.regions.get(nome);
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
            if (getBlock(ses.world, x, y, z) === id) continue;
            // nunca emparedar: célula com jogador dentro fica como está
            if (id !== BlockId.Air && ses.overlapsAnyPlayer(x, y, z)) continue;
            ses.applyBlock(x, y, z, id);
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
