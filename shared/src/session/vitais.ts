import { isAgua } from "../blocks";
import { PLAYER_REACH } from "../constants";
import { PLAYER, acharEspacoVago, apoiadoNoChao, sobrepoeSolidos } from "../physics";
import { type ServerMessage } from "../protocol";
import { valorRegra } from "../regras";
import {
  type CausaDano,
  DANO_PVP,
  EXAUSTAO_POR_REGEN,
  type EstadoVital,
  FOLEGO_TICKS,
  FOME_MAX,
  TICKS_ENTRE_ATAQUES,
  aplicarDano,
  danoDeQueda,
  estaVivo,
  gastarEsforco,
  novoEstadoVital,
  textoDaMorte,
  tickFolego,
  tickFome,
  tickRegen,
  tickSufocamento,
} from "../sobrevivencia";
import { getBlock } from "../world";
import { AVISO_MOCHILA_MS } from "./avisos";
import type { SessionPlayer } from "../session";
import { modoDe } from "./modo";
import { sendInventario } from "./inventario";
import { teleportar } from "./tp";
import type { GameSession } from "../session";

/**
 * §🍖 F2/F3/F7 — VIDA, FOME, FÔLEGO, QUEDA, MORTE e PVP.
 *
 * Tudo que tira ou devolve ponto de vida mora aqui, e o servidor é a única
 * autoridade: **o cliente NÃO reporta dano**. A queda se fecha a partir do
 * fluxo de `move` (10 Hz), que é o que o servidor já recebe — perguntar ao
 * cliente se pousou seria autoridade no lugar errado.
 *
 * O pvp entra no mesmo arquivo porque é a mesma engrenagem vista de outro
 * ângulo: `atacar` confere regra + modo dos DOIS + alcance + cooldown e cai no
 * mesmo `machucar`.
 */

/** Estado vital de um NOME (nasce cheio na primeira vez que alguém pergunta). */
export function vitalDe(ses: GameSession, nome: string): EstadoVital {
  let e = ses.vitais.get(nome);
  if (!e) {
    e = novoEstadoVital();
    ses.vitais.set(nome, e);
  }
  return e;
}

/** A vida vale pra este cliente? SÓ em sobrevivência — criativo não machuca
 *  (é o mesmo mundo, a mesma física: o que muda é o modo do jogador). */
export function vidaVale(ses: GameSession, clientId: number): boolean {
  const p = ses.players.get(clientId);
  return !!p && modoDe(ses, p.name) === "sobrevivencia";
}

/** Bolhas de ar que o HUD desenha (0..10) — é a granularidade que decide se
 *  vale mandar mensagem, senão o fôlego geraria 10 msg/s por jogador. */
function bolhas(folego: number): number {
  return Math.max(0, Math.ceil(folego / (FOLEGO_TICKS / 10)));
}

export function sendVida(
  ses: GameSession,
  clientId: number,
  extra: { causa?: CausaDano; morreu?: boolean } = {},
): void {
  const p = ses.players.get(clientId);
  if (!p) return;
  const e = vitalDe(ses, p.name);
  ses.send(
    clientId,
    JSON.stringify({
      type: "vida",
      vida: e.vida,
      folego: Math.max(0, e.folego),
      // §🍖 F3: com a regra `fome` desligada o campo NÃO vai, e é assim que o
      // cliente sabe não desenhar coxa nenhuma (mundo sem fome não mostra
      // barra vazia nem barra cheia — mostra nada)
      ...(temFome(ses) ? { fome: e.fome } : {}),
      ...extra,
    } satisfies ServerMessage),
  );
}

/** A fome vale neste mundo? (§🍖 F3 — regra de mundo, ligada por padrão; o
 *  professor desliga pro fundamental 1 com `/regra fome desligar`.) */
export function temFome(ses: GameSession): boolean {
  return valorRegra(ses.regras, "fome");
}

/**
 * §🍖 F3: gasta esforço de UM jogador — andar, editar bloco, regenerar. A
 * conversão de esforço em ponto de fome é do módulo puro; aqui só ficam os
 * dois portões (sobrevivência e a regra `fome`) e a decisão de avisar o
 * cliente, que só acontece quando a barra DESENHADA muda de número.
 */
export function esforcar(ses: GameSession, clientId: number, esforco: number): void {
  if (!vidaVale(ses, clientId) || !temFome(ses)) return;
  const p = ses.players.get(clientId);
  if (!p) return;
  const antes = vitalDe(ses, p.name);
  const depois = gastarEsforco(antes, esforco);
  if (depois === antes) return;
  ses.vitais.set(p.name, depois);
  if (depois.fome !== antes.fome) sendVida(ses, clientId);
}

/**
 * A ÚNICA porta de perda de vida do servidor. Queda e afogamento (lite), fome
 * (F3), PvP (F7) e mob (F8) entram todos por aqui — quem chama só diz quanto e
 * por quê. Fora da sobrevivência é no-op.
 *
 * `porQuem` (§🍖 F7) só existe pro texto da morte: é o NOME de quem bateu.
 */
export function machucar(ses: GameSession, clientId: number, pontos: number, causa: CausaDano, porQuem?: string): void {
  if (!vidaVale(ses, clientId)) return;
  const p = ses.players.get(clientId);
  if (!p) return;
  const r = aplicarDano(vitalDe(ses, p.name), pontos, causa);
  if (r.aplicado === 0) return;
  ses.vitais.set(p.name, r.estado);
  sendVida(ses, clientId, { causa, ...(r.morreu ? { morreu: true } : {}) });
  if (r.morreu) matar(ses, clientId, causa, porQuem);
}

/**
 * O pvp vale neste mundo? Regra de mundo (padrão DESLIGADA), **e mundo de
 * aula/atividade força DESLIGADO**, do mesmo jeito que força criativo: a aula
 * distribui um modelo pra turma construir, e uma pancadaria no meio dela é
 * problema de sala, não jogo. Como a aula é read-only, a regra nem chega a
 * ser gravada — ela só não vale enquanto o mundo for de aula.
 */
export function temPvp(ses: GameSession): boolean {
  return !ses.somenteLeitura && valorRegra(ses.regras, "pvp");
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
export function atacar(ses: GameSession, clientId: number, alvoId: number): void {
  const p = ses.players.get(clientId);
  const alvo = ses.players.get(alvoId);
  if (!p || !alvo || clientId === alvoId) return;
  if (!temPvp(ses)) {
    avisarPvpDesligado(ses, clientId);
    return;
  }
  // os dois têm de estar em sobrevivência: quem está em criativo não machuca
  // (não tem vida pra perder) nem é machucado
  if (!vidaVale(ses, clientId) || !vidaVale(ses, alvoId)) return;
  if (!estaVivo(vitalDe(ses, alvo.name))) return;
  const dist = Math.hypot(alvo.x - p.x, alvo.y - p.y, alvo.z - p.z);
  if (dist > PLAYER_REACH + 2) return; // mesma folga do withinReach (10 Hz)
  const ultimo = ses.ultimoAtaque.get(clientId) ?? -Infinity;
  if (ses.tickCount - ultimo < TICKS_ENTRE_ATAQUES) return;
  ses.ultimoAtaque.set(clientId, ses.tickCount);
  machucar(ses, alvoId, DANO_PVP, "pvp", p.name);
}

/** Aviso de "o pvp está desligado" com FREIO — bater é clique repetido, e sem
 *  teto o chat da aula viraria parede de texto (mesma disciplina do aviso de
 *  mochila cheia). */
export function avisarPvpDesligado(ses: GameSession, clientId: number): void {
  const agora = ses.now();
  const ultimo = ses.avisoPvp.get(clientId) ?? -Infinity;
  if (agora - ultimo < AVISO_MOCHILA_MS) return;
  ses.avisoPvp.set(clientId, agora);
  ses.sendServerChat(
    clientId,
    ses.somenteLeitura
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
 * aqui que o F4 vai ler `valorRegra(ses.regras, "manter-inventario")`.
 */
export function matar(ses: GameSession, clientId: number, causa: CausaDano, porQuem?: string): void {
  const p = ses.players.get(clientId);
  if (!p) return;
  ses.broadcast({
    type: "chat",
    author: "servidor",
    text: textoDaMorte(p.name, causa, porQuem),
  });
  ses.vitais.set(p.name, novoEstadoVital());
  // §🍖 F4: aqui a regra `manter-inventario` finalmente decide alguma coisa.
  // LIGADA (o padrão de escola) = não se perde nada. DESLIGADA = a mochila
  // some, e some MESMO: não existe baú nem item no chão pra virar túmulo (o
  // ramo barato de propósito, anotado no ROADMAP §🍖 desde 2026-07-27).
  if (!valorRegra(ses.regras, "manter-inventario")) {
    ses.inventarios.delete(p.name);
    sendInventario(ses, clientId);
  }
  teleportar(ses, clientId, ses.spawn.x, ses.spawn.y, ses.spawn.z);
  sendVida(ses, clientId); // vida cheia de novo, agora sem causa
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
export function acompanharQueda(ses: GameSession, clientId: number, p: SessionPlayer): void {
  const pico = ses.picoQueda.get(clientId) ?? p.y;
  // água amortece: entrar nela ZERA a queda (mesma regra do Minecraft)
  const naAgua = isAgua(getBlock(ses.world, Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)));
  const apoiado = apoiadoNoChao(ses.world, { x: p.x, y: p.y, z: p.z });
  if (!naAgua && !apoiado) {
    if (p.y > pico) ses.picoQueda.set(clientId, p.y);
    return;
  }
  ses.picoQueda.set(clientId, p.y);
  if (naAgua) return;
  const dano = danoDeQueda(pico - p.y);
  if (dano > 0) machucar(ses, clientId, dano, "queda");
}

/**
 * Um tick de vida por jogador em sobrevivência: fôlego debaixo d'água e
 * regeneração passiva. Roda no tick de 10 Hz que já existe — nenhum relógio
 * de parede, mesma regra do ciclo dia/noite e do vento.
 *
 * Só manda `vida` quando muda o que o HUD DESENHA (coração ou bolha), senão
 * seriam 10 mensagens por segundo por aluno.
 */
export function tickVitais(ses: GameSession): void {
  const comFome = temFome(ses);
  for (const [clientId, p] of ses.players) {
    if (modoDe(ses, p.name) !== "sobrevivencia") continue;
    const antes = vitalDe(ses, p.name);
    const cabeca = getBlock(
      ses.world,
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
    // bug-605: SOTERRADO — dano contínuo de sufocamento + levar pro vão livre
    // mais próximo (raio 2). Se achar o vão, teleporta na hora (o dano para);
    // se não achar, o jogador continua soterrado e o dano acumula até a morte.
    const soterrado = sobrepoeSolidos(ses.world, { x: p.x, y: p.y, z: p.z });
    const sufoc = tickSufocamento(depois, soterrado);
    depois = sufoc.estado;
    ses.vitais.set(p.name, depois);
    if (folego.dano > 0) {
      machucar(ses, clientId, folego.dano, "afogamento"); // já manda a `vida`
      continue;
    }
    if (danoFome > 0) {
      machucar(ses, clientId, danoFome, "fome"); // idem
      continue;
    }
    if (sufoc.dano > 0) {
      machucar(ses, clientId, sufoc.dano, "sufocamento"); // idem
      continue;
    }
    if (soterrado) {
      const vao = acharEspacoVago(
        ses.world,
        { x: p.x, y: p.y, z: p.z },
        2,
        (x, y, z) => ses.overlapsAnyPlayer(x, y, z),
      );
      if (vao) {
        teleportar(ses, clientId, vao.x, vao.y, vao.z);
        continue;
      }
    }
    if (
      depois.vida !== antes.vida ||
      depois.fome !== antes.fome ||
      bolhas(depois.folego) !== bolhas(antes.folego)
    ) {
      sendVida(ses, clientId);
    }
  }
}

/** `/confinar` (cp25): liga/desliga o confinamento por área de grupo. Só
 *  professor (o dispatcher já barrou o aluno). Sem argumento = mostra o estado.
 *  Avisa a turma no toggle; alerta o professor se ligou sem grupos/áreas
 *  (aí ninguém consegue construir — decisão de escopo: sem grupo, nada). */
