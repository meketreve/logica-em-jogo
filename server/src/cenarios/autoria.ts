import {
  BlockId,
  GameSession,
  type SessionOptions,
} from "@logica/shared";

/**
 * O "professor de mentira" que os geradores de cenário usam.
 *
 * Extraído do `gerar.ts` em 2026-08-04 (§🏁), quando o gerador da corrida
 * precisou do mesmo autor: o `gerar.ts` roda uma CLI no corpo do módulo, então
 * importar dele geraria os 6 cenários como efeito colateral.
 *
 * A regra que este módulo existe pra manter: **não há caminho de autoria
 * privado.** Tudo aqui digita os MESMOS comandos de chat (ou manda as MESMAS
 * mensagens) que o professor manda de dentro do jogo — se um cenário não sai
 * daqui, ele também não sai da mão de quem dá a aula, e isso é atrito pra
 * corrigir no motor, não bug do script.
 */

export const AUTOR_ID = 1;
export const AUTOR_NOME = "autor";

export interface Vec {
  x: number;
  y: number;
  z: number;
}

/** Um "professor" de mentira: digita comando e EXIGE a resposta certa do servidor. */
export class Autoria {
  readonly session: GameSession;
  /** Um comando pode gerar VÁRIAS falas do servidor (ex.: /grupo criar avisa e depois lista). */
  private respostas: string[] = [];

  constructor(opts: SessionOptions) {
    this.session = new GameSession((id, data) => {
      if (id !== AUTOR_ID || typeof data !== "string") return;
      const m = JSON.parse(data) as { type?: string; author?: string; text?: string };
      if (m.type === "chat" && m.author === "servidor" && typeof m.text === "string") {
        this.respostas.push(m.text);
      }
    }, opts);
  }

  private send(msg: unknown): void {
    this.session.handleMessage(AUTOR_ID, JSON.stringify(msg));
  }

  entrar(codigo: string): void {
    this.send({ type: "join", name: AUTOR_NOME, pin: "0000", codigo });
  }

  /** Tira o autor do caminho: célula com jogador dentro é PULADA ao colocar bloco. */
  afastar(x: number, y: number, z: number): void {
    this.send({ type: "move", x, y, z, yaw: 0, pitch: 0 });
  }

  cmd(texto: string, esperado: string): void {
    this.respostas = [];
    this.send({ type: "chat", text: texto });
    if (!this.respostas.some((r) => r.includes(esperado))) {
      throw new Error(
        `comando "${texto}" não fez o esperado\n` +
          `  esperava conter: "${esperado}"\n` +
          `  servidor disse:  ${this.respostas.map((r) => `"${r}"`).join(" | ") || "(nada)"}`,
      );
    }
  }

  bloco(x: number, y: number, z: number, id: number): void {
    this.cmd(`/bloco ${x} ${y} ${z} ${id}`, `definido como ${id}.`);
  }

  regiao(nome: string, a: Vec, b: Vec): void {
    this.send({ type: "wand_mark", corner: 1, ...a });
    this.send({ type: "wand_mark", corner: 2, ...b });
    this.cmd(`/regiao criar ${nome}`, `Região "${nome}" criada`);
  }

  /** Quadro com conteúdo (aula 6): coloca o bloco e escreve o texto —
   *  `quadro_set` exige ALCANCE, então o autor chega perto antes. */
  quadro(x: number, y: number, z: number, id: number, texto: string): void {
    this.bloco(x, y, z, id);
    this.afastar(x - 2, y, z + 0.5);
    this.send({ type: "quadro_set", x, y, z, texto });
  }
}

