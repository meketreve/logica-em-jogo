import { describe, expect, it } from "vitest";
// o FONTE do runCommand como string (ver `raw.d.ts`): é dele que o portão lê a
// lista de comandos que o servidor de fato conhece
import sessionSrc from "./session.ts?raw";
import {
  candidatosPara,
  comandosPara,
  destinoDeToquePara,
  subcomandosPara,
  todosOsComandos,
} from "./comandos";
import { GameSession } from "./session";

/**
 * O FILTRO POR PAPEL da árvore de comandos (2026-10-15).
 *
 * Por que existe: no tablet o painel de comandos rápidos do chat mostrava os
 * **26 comandos a todo mundo**, e o aluno rolava por `/confinar`, `/silenciar`
 * e `/regiao` — que o servidor recusa a ele — pra chegar nos poucos que são
 * dele. O filtro é uma tabela nova, e tabela nova sem portão é lista que
 * envelhece em silêncio: estes testes são o portão.
 *
 * Três camadas, e cada uma pega um erro diferente:
 *   1. PARIDADE com o fonte — comando novo no `runCommand` que ninguém pôs na
 *      tabela derruba a suíte no mesmo commit;
 *   2. O SERVIDOR DE VERDADE — cada comando é mandado por um ALUNO numa sessão
 *      real, e a tabela tem de concordar com a recusa (ou a falta dela);
 *   3. CONTROLE NEGATIVO — com papel de professor a lista continua inteira, o
 *      que prova que a filtragem é do papel e não um corte cego.
 */

/** O `/mundo` e o `/expulsar` NÃO moram no `runCommand`: são do HOST
 *  (`server/mundos.ts` e `server/index.ts`), e pra sessão são desconhecidos.
 *  Estão na tabela porque quem LÊ a lista é o professor, e pra ele a origem não
 *  importa — mas o portão de paridade tem de saber disso. */
const SO_DO_HOST = new Set(["mundo", "expulsar"]);

/** `/painel` é do CLIENTE (o `main.ts` intercepta antes de mandar). Ele aparece
 *  no `runCommand` só pra responder ONDE mora, então conta na paridade. */
const DO_CLIENTE = new Set(["painel"]);

describe("paridade com o runCommand do servidor", () => {
  /** A mensagem de "Comando desconhecido" ENUMERA tudo que o servidor aceita —
   *  é a lista que o próprio servidor mantém, e por isso serve de gabarito. */
  const doServidor = (): string[] => {
    const m = /Comando desconhecido: \$\{text\}\. Os comandos disponíveis são ([^`]+?)\./.exec(
      sessionSrc,
    );
    expect(m, "a mensagem de comando desconhecido mudou de forma — ajuste o portão").toBeTruthy();
    return [...(m?.[1] ?? "").matchAll(/\/([a-z]+)/g)].map((x) => x[1] as string);
  };

  it("todo comando do servidor está na tabela", () => {
    const tabela = new Set(todosOsComandos().map((c) => c.nome));
    for (const nome of doServidor()) {
      expect(tabela.has(nome), `/${nome} existe no runCommand e falta em comandos.ts`).toBe(true);
    }
  });

  it("todo comando da tabela existe no servidor (ou é do host)", () => {
    const servidor = new Set(doServidor());
    for (const c of todosOsComandos()) {
      if (SO_DO_HOST.has(c.nome)) continue;
      expect(servidor.has(c.nome), `/${c.nome} está na tabela e não existe no runCommand`).toBe(
        true,
      );
    }
  });
});

describe("o papel de cada comando concorda com o servidor DE VERDADE", () => {
  /** Uma sessão com professor (id 1, o primeiro a entrar) e aluno (id 2). */
  function sala(): (text: string) => string {
    const respostas = new Map<number, string[]>();
    const session = new GameSession(
      (id, data) => {
        if (typeof data !== "string") return;
        const m = JSON.parse(data) as { type?: string; text?: string; author?: string };
        if (m.type !== "chat" || typeof m.text !== "string") return;
        if (!respostas.has(id)) respostas.set(id, []);
        respostas.get(id)?.push(m.text);
      },
      { dims: { x: 4, z: 4, y: 4 }, seed: 7, flat: true, codigo: "sala" },
    );
    // ⚠️ o que separa os dois é o CÓDIGO DE PROFESSOR no join, não a ordem de
    // entrada: `codigo` igual ao da sessão promove (session.ts: authenticate).
    // Mandar o código nos dois joins é o erro fácil — a "aluna" entraria como
    // professora e TODOS os comandos passariam, que é o teste passando a troco
    // de nada.
    session.handleMessage(
      1,
      JSON.stringify({ type: "join", name: "prof", pin: "0000", codigo: "sala" }),
    );
    session.handleMessage(2, JSON.stringify({ type: "join", name: "aluna", pin: "1111" }));
    return (text: string): string => {
      respostas.set(2, []);
      session.handleMessage(2, JSON.stringify({ type: "chat", text }));
      return (respostas.get(2) ?? []).join(" | ");
    };
  }

  const comoAluno = sala();

  for (const c of todosOsComandos()) {
    if (SO_DO_HOST.has(c.nome)) continue; // a sessão nem conhece — é do host
    if (DO_CLIENTE.has(c.nome)) continue; // nunca chega ao servidor
    it(`/${c.nome} é ${c.de === "todos" ? "de todo jogador" : "só do professor"}`, () => {
      const r = comoAluno(`/${c.nome}`);
      const recusou = /Somente o professor|Somente .* professor/i.test(r);
      expect(recusou, `o servidor respondeu: ${r}`).toBe(c.de === "professor");
    });
  }

  it("/grupo criar é do professor mesmo /grupo sendo de todos", () => {
    expect(comoAluno("/grupo criar 2")).toMatch(/professor/i);
    expect(subcomandosPara("grupo", "aluno")).not.toContain("criar");
    expect(subcomandosPara("grupo", "professor")).toContain("criar");
  });

  it("/terreno ligar é do professor mesmo /terreno sendo de todos", () => {
    expect(comoAluno("/terreno ligar")).toMatch(/professor/i);
    expect(subcomandosPara("terreno", "aluno")).not.toContain("ligar");
    expect(subcomandosPara("terreno", "aluno")).toContain("criar");
  });

  it("mudar a hora é do professor, consultar é de todos", () => {
    expect(comoAluno("/hora dia")).toMatch(/professor/i);
    expect(comoAluno("/hora")).not.toMatch(/Somente o professor/i);
    expect(subcomandosPara("hora", "aluno")).toEqual([]);
  });
});

describe("o que o aluno VÊ no painel do dedo", () => {
  it("não vê nenhum comando de professor", () => {
    const doAluno = new Set(comandosPara("aluno"));
    for (const c of todosOsComandos()) {
      if (c.de === "professor") {
        expect(doAluno.has(c.nome), `/${c.nome} é do professor e vazou pro aluno`).toBe(false);
      }
    }
  });

  it("vê os dez que são dele, com /painel e /amigos na frente", () => {
    const lista = comandosPara("aluno");
    expect(lista.slice(0, 2)).toEqual(["painel", "amigos"]);
    expect(lista).toHaveLength(10);
  });

  it("CONTROLE NEGATIVO: o professor continua vendo a lista inteira", () => {
    // sem isto, um filtro que cortasse TUDO passaria nos testes de cima
    expect(comandosPara("professor")).toHaveLength(todosOsComandos().length);
    expect(comandosPara("professor")).toContain("confinar");
    expect(comandosPara("professor")).toContain("amigos");
  });

  it("os de autoria vêm primeiro pro professor (a caixa do dedo ROLA)", () => {
    const lista = comandosPara("professor");
    expect(lista.indexOf("objetivo")).toBeLessThan(lista.indexOf("painel"));
  });

  it("o aluno não recebe subcomando de comando que não é dele", () => {
    expect(candidatosPara(["/confinar"], "aluno")).toEqual([]);
    expect(candidatosPara(["/confinar"], "professor")).toContain("ligar");
  });
});

describe("o papel muda o que um TOQUE faz", () => {
  it("/hora é um toque só pro aluno e um nível pro professor", () => {
    // é o ponto todo do filtro: consultar a hora não deve custar dois toques e
    // uma lista de seis botões que o servidor vai recusar
    expect(destinoDeToquePara(["/hora"], "aluno")).toBe("enviar");
    expect(destinoDeToquePara(["/hora"], "professor")).toBe("nivel");
  });

  it("/modo e /pvp também: consulta de um toque pro aluno", () => {
    expect(destinoDeToquePara(["/modo"], "aluno")).toBe("enviar");
    expect(destinoDeToquePara(["/pvp"], "aluno")).toBe("enviar");
    expect(destinoDeToquePara(["/modo"], "professor")).toBe("nivel");
  });

  it("/regra <nome> MOSTRA pro aluno e abre ligar/desligar pro professor", () => {
    expect(destinoDeToquePara(["/regra", "fome"], "aluno")).toBe("enviar");
    expect(destinoDeToquePara(["/regra", "fome"], "professor")).toBe("nivel");
  });

  it("/amigos segue igual pros dois — é de todo jogador", () => {
    for (const papel of ["aluno", "professor"] as const) {
      expect(destinoDeToquePara(["/amigos"], papel)).toBe("nivel");
      expect(destinoDeToquePara(["/amigos", "lista"], papel)).toBe("enviar");
      expect(destinoDeToquePara(["/amigos", "convidar"], papel)).toBe("preencher");
    }
  });

  it("/tpp pede nome pros dois (mandar sem nome é erro de uso)", () => {
    expect(destinoDeToquePara(["/tpp"], "aluno")).toBe("preencher");
    expect(destinoDeToquePara(["/tpa"], "aluno")).toBe("enviar");
  });
});
