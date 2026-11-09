import { biomaPorClima } from "../biomas";
import { BICHOS, sortearPonderado, variantesDoBioma } from "../bichos";
import { ITEM_PEIXE_CRU, ITEM_VARA_PESCAR, isAgua } from "../blocks";
import { gastar } from "../ferramentas";
import { adicionar, cabe, definirSlot } from "../inventario";
import { ALCANCE_PESCA, LONGE_DA_BOIA, esperaDaPesca, faseDaPesca, sortearPesca } from "../pesca";
import type { ServerMessage } from "../protocol";
import type { GameSession } from "../session";
import { getBlock } from "../world";
import { climaAt } from "../worldgen";
import { avisarComFreio } from "./avisos";
import { inventarioDe, inventarioVale, sendInventario } from "./inventario";

/**
 * §🎣 A PESCARIA na sessão (2026-11-09). A regra pura (números, sorteio, a
 * janela) mora em `../pesca.ts`; aqui fica o estado por CONEXÃO e o fio.
 *
 * O ciclo, todo decidido no SERVIDOR (o tablet só pede):
 *   `pescar` (1º) → lança: confere a vara, a água e o alcance → `boia`
 *   tick: chegou a hora → `boia_fisgou` (a boia afunda; abre a janela de 2 s)
 *   `pescar` (2º) → puxa: dentro da janela tira o que o sorteio der; fora,
 *     recolhe a linha vazia → `boia_fim`
 *   tick: a janela passou sem puxão → o peixe "escapou": a boia volta a boiar
 *     (`boia` de novo) e a espera recomeça.
 *
 * A boia NÃO vai pro save (é da conexão, como o balcão de venda) e cai
 * sozinha em toda saída: trocar o item da mão, se afastar, a água sumir, a
 * coluna sair da RAM (a água "some" pro `getBlock`), desconectar.
 *
 * **Criativo DÁ peixe** (decisão dele, 09/11 — diverge dos bichos): lá a
 * mochila não existe no servidor, então o `boia_fim` leva o `item` e o
 * CLIENTE o põe na hotbar. Em sobrevivência quem guarda é aqui, e a vara gasta.
 */

export interface Pescaria {
  /** A célula de ÁGUA onde a boia boia (a de cima da coluna d'água mirada). */
  readonly x: number;
  readonly y: number;
  readonly z: number;
  /** Tick em que o peixe morde. */
  fisgaEm: number;
  /** Já avisamos a mordida (`boia_fisgou`) desta espera? */
  avisada: boolean;
}

export interface EstadoPesca {
  /** Por conexão — a boia é de quem a lançou, e some com ele. */
  readonly porCliente: Map<number, Pescaria>;
  /** RNG próprio (xorshift), semeado pelo mundo: os testes repetem a pescaria. */
  rng: number;
}

export function novoEstadoPesca(seed: number): EstadoPesca {
  return { porCliente: new Map(), rng: (seed ^ 0x5eca) >>> 0 || 1 };
}

function rand(st: EstadoPesca): number {
  let x = st.rng;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  st.rng = x >>> 0;
  return st.rng / 4294967296;
}

/** Manda pra todo mundo que PODE ver o pescador (o gate do `/invisivel` é o
 *  da pose) e pro próprio pescador. */
function anunciar(ses: GameSession, autor: number, msg: ServerMessage): void {
  ses.broadcastPose(autor, msg);
  ses.send(autor, JSON.stringify(msg));
}

/** O jogador está com a vara na mão? Sobrevivência: a pilha do slot dito;
 *  criativo: o que o cliente disse segurar (`mao`, como nos bichos). */
function varaNaMao(ses: GameSession, clientId: number, slot: number | undefined): boolean {
  const p = ses.players.get(clientId);
  if (!p) return false;
  if (inventarioVale(ses, clientId)) {
    if (slot === undefined || slot < 0 || slot > 8) return false;
    return inventarioDe(ses, p.name)[slot]?.id === ITEM_VARA_PESCAR;
  }
  return ses.bichos.mao.get(clientId) === ITEM_VARA_PESCAR;
}

/** A célula de água de CIMA da coluna (a boia boia na superfície). */
function superficie(ses: GameSession, x: number, y: number, z: number): number {
  let topo = y;
  for (let i = 0; i < 32 && isAgua(getBlock(ses.world, x, topo + 1, z)); i++) topo++;
  return topo;
}

/** Clique de pescar (`pescar`): lança se não há boia; puxa se há. */
export function pescar(
  ses: GameSession,
  clientId: number,
  alvo: { x: number; y: number; z: number },
  slot: number | undefined,
): void {
  const p = ses.players.get(clientId);
  if (!p) return;
  const st = ses.pesca;
  const atual = st.porCliente.get(clientId);
  if (atual) return puxar(ses, clientId, atual, slot);

  if (!varaNaMao(ses, clientId, slot)) return;
  const { x, z } = alvo;
  if (!isAgua(getBlock(ses.world, x, alvo.y, z))) {
    return avisarComFreio(ses, clientId, "A boia precisa cair na água.");
  }
  const olhoY = p.y + 1.6;
  if (Math.hypot(x + 0.5 - p.x, alvo.y + 0.5 - olhoY, z + 0.5 - p.z) > ALCANCE_PESCA + 0.9) return;
  const y = superficie(ses, x, alvo.y, z);
  st.porCliente.set(clientId, { x, y, z, fisgaEm: ses.tickCount + esperaDaPesca(rand(st)), avisada: false });
  ses.broadcast({ type: "gesto", id: clientId, gesto: "interagir" });
  anunciar(ses, clientId, { type: "boia", id: clientId, x, y, z });
}

function encerrar(
  ses: GameSession,
  clientId: number,
  motivo: "pegou" | "vazia" | "recolheu",
  item?: number,
): void {
  if (!ses.pesca.porCliente.delete(clientId)) return;
  anunciar(ses, clientId, { type: "boia_fim", id: clientId, motivo, ...(item !== undefined ? { item } : {}) });
}

/** O nome do peixe que saiu, pela tabela de variantes do BIOMA da boia —
 *  "Você pescou um tambaqui!" ensina que cada lugar tem os seus. */
function nomeDoPeixe(ses: GameSession, b: Pescaria): string {
  const bioma = biomaPorClima(climaAt(b.x, b.z, ses.seed)).nome;
  const vars = variantesDoBioma("peixe", bioma);
  const i = vars.length ? vars[sortearPonderado(vars, rand(ses.pesca))]!.i : 0;
  return BICHOS.peixe.variantes[i]?.nome ?? "peixe";
}

function puxar(ses: GameSession, clientId: number, b: Pescaria, slot: number | undefined): void {
  const p = ses.players.get(clientId);
  if (!p) return;
  ses.broadcast({ type: "gesto", id: clientId, gesto: "interagir" });
  if (faseDaPesca(ses.tickCount, b.fisgaEm) !== "fisgado") return encerrar(ses, clientId, "vazia");
  const sai = sortearPesca(rand(ses.pesca), rand(ses.pesca));
  const nome = sai.id === ITEM_PEIXE_CRU ? nomeDoPeixe(ses, b) : null;

  if (inventarioVale(ses, clientId)) {
    let inv = inventarioDe(ses, p.name);
    if (!cabe(inv, sai.id, sai.qtd)) {
      avisarComFreio(ses, clientId, "A mochila está cheia — o peixe escapou.");
      return encerrar(ses, clientId, "vazia");
    }
    inv = adicionar(inv, sai.id, sai.qtd).inv;
    // a vara gasta 1 por puxada que TROUXE algo (o slot é o que lançou e
    // continua com ela: trocar de item já teria recolhido a linha)
    let quebrou = false;
    if (slot !== undefined && inv[slot]?.id === ITEM_VARA_PESCAR) {
      const gasta = gastar(inv[slot]!, 1);
      inv = definirSlot(inv, slot, gasta);
      quebrou = gasta === null;
    }
    ses.inventarios.set(p.name, inv);
    sendInventario(ses, clientId);
    if (quebrou) {
      ses.send(clientId, JSON.stringify({ type: "ferramenta_quebrou", item: ITEM_VARA_PESCAR } satisfies ServerMessage));
    }
    encerrar(ses, clientId, "pegou");
  } else {
    // criativo: quem guarda é o cliente (a hotbar é dele)
    encerrar(ses, clientId, "pegou", sai.id);
  }
  ses.sendServerChat(clientId, nome ? `Você pescou um ${nome}!` : "Só veio lixo na linha desta vez.");
}

/** Um tick de todas as boias: a mordida, o peixe que escapa e as saídas. */
export function tickPesca(ses: GameSession): void {
  const st = ses.pesca;
  if (st.porCliente.size === 0) return;
  const t = ses.tickCount;
  for (const [clientId, b] of [...st.porCliente]) {
    const p = ses.players.get(clientId);
    if (!p) {
      st.porCliente.delete(clientId);
      continue;
    }
    // saídas: largou a vara, foi longe, a água sumiu (balde, coluna fora da RAM)
    if (
      ses.bichos.mao.get(clientId) !== ITEM_VARA_PESCAR ||
      Math.hypot(b.x + 0.5 - p.x, b.z + 0.5 - p.z) > LONGE_DA_BOIA ||
      !isAgua(getBlock(ses.world, b.x, b.y, b.z))
    ) {
      encerrar(ses, clientId, "recolheu");
      continue;
    }
    const fase = faseDaPesca(t, b.fisgaEm);
    if (fase === "fisgado" && !b.avisada) {
      b.avisada = true;
      anunciar(ses, clientId, { type: "boia_fisgou", id: clientId });
    } else if (fase === "escapou") {
      // ninguém puxou: o peixe foi embora, a boia volta a boiar e espera de novo
      b.fisgaEm = t + esperaDaPesca(rand(st));
      b.avisada = false;
      anunciar(ses, clientId, { type: "boia", id: clientId, x: b.x, y: b.y, z: b.z });
    }
  }
}

/** Quem sai leva a boia junto (os outros a veem sumir). */
export function esquecerPescaDoCliente(ses: GameSession, clientId: number): void {
  if (!ses.pesca.porCliente.has(clientId)) return;
  ses.pesca.porCliente.delete(clientId);
  ses.broadcastExcept(clientId, { type: "boia_fim", id: clientId, motivo: "recolheu" });
}

/** Quem ENTRA vê as boias que já estão na água (mesmo gate da pose). */
export function boiasParaQuemEntra(ses: GameSession, clientId: number, professor: boolean): void {
  for (const [autor, b] of ses.pesca.porCliente) {
    if (autor === clientId) continue;
    if (ses.invisiveis.has(autor) && !professor) continue;
    ses.send(clientId, JSON.stringify({ type: "boia", id: autor, x: b.x, y: b.y, z: b.z } satisfies ServerMessage));
  }
}
