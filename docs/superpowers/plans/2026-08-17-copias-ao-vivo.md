# Cópias da área de atividade ajustáveis ao vivo — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O professor ajusta o número de cópias da área de atividade durante a aula, com
`/aula grupos X`, sem regerar mundo nem reiniciar servidor.

**Architecture:** Uma função pura (`shared/src/grade.ts`) decide onde fica a célula de cada
grupo numa grade de 6 colunas. O gerador planta o estado de partida **uma vez só** numa
célula-molde atrás do professor e carimba os grupos com o **mesmo primitivo** que o comando ao
vivo usa (`copiarCelula`). Crescer copia a célula-molde e estende `alvos`/`baseline` dos
objetivos per-grupo; encolher apaga a célula e encurta os mesmos vetores, sob confirmação em
2 passos.

**Tech Stack:** TypeScript, workspaces npm (`shared`, `server`, `client`), Vitest, Vite.
Nada de dependência nova.

**Spec:** `docs/superpowers/specs/2026-08-17-copias-ao-vivo-design.md`

## Global Constraints

- `COLUNAS_AULA = 6` · `MAX_GRUPOS_AULA = 20` · `CELULA_DY = 8` — valores exatos.
- `MAX_REGIONS` passa de `64` para `256`.
- O workspace `shared` **não tem `@types/node` de propósito** — nada em `shared/src/**` pode
  importar `node:*`. Teste que precisa de arquivo mora em `scripts/`.
- Testes rodam com `npm test` (CWD em `shared/`, config `shared/vitest.config.ts`:
  `testTimeout: 20000`, `maxWorkers: 8`). Rodar `npx vitest` da raiz também funciona desde o
  `vitest.config.ts` da raiz, que reexporta o do shared.
- `client/dist` é **rastreado no git** e embute a versão — todo commit que muda o cliente leva o
  rebuild junto.
- Comentários e mensagens de usuário em **português**, seguindo o tom dos arquivos vizinhos.
- Ordem canônica de varredura de caixa é **y → z → x** (`snapshotRegion`). Qualquer laço novo
  sobre caixa segue a mesma ordem.
- Nunca usar `Math.random` em código de servidor (determinismo de save/teste).

---

### Task 1: Geometria da grade (`shared/src/grade.ts`)

Módulo puro: só aritmética de chunk, sem `World` nem `GameSession`. É a única fonte de "onde
fica o grupo g" — gerador e comando ao vivo chamam ele.

**Files:**
- Create: `shared/src/grade.ts`
- Test: `shared/src/grade.test.ts`
- Modify: `shared/src/index.ts` (export do módulo novo)

**Interfaces:**
- Consumes: `CHUNK_SIZE` de `./constants`, `FLAT_SURFACE_Y` de `./worldgen`,
  `WorldDims` de `./world`, `Box`/`Vec3i` de `./scenario` e `./regions`.
- Produces: `COLUNAS_AULA`, `MAX_GRUPOS_AULA`, `CELULA_DY`, `CELULA_Y0`, `REGIAO_PARTIDA`,
  `linhasDaGrade()`, `dimsDaAula()`, `chunkDoProfessor()`, `chunkDoMolde()`, `chunkDoGrupo(g)`,
  `caixaDaCelula(chunk)`.

- [ ] **Step 1: Write the failing test**

Create `shared/src/grade.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { CHUNK_SIZE } from "./constants";
import {
  CELULA_DY,
  CELULA_Y0,
  COLUNAS_AULA,
  MAX_GRUPOS_AULA,
  caixaDaCelula,
  chunkDoGrupo,
  chunkDoMolde,
  chunkDoProfessor,
  dimsDaAula,
  linhasDaGrade,
} from "./grade";

/**
 * A grade da aula (2026-08-17). O layout antigo era uma FILEIRA: um chunk por
 * grupo em X, todos no mesmo Z — 8 grupos = 128 blocos em linha. Agora é uma
 * grade de COLUNAS_AULA colunas, em ordem de LEITURA, e o mundo já nasce do
 * tamanho do teto, para o professor nunca esbarrar no inBounds durante a aula.
 */
describe("grade da aula", () => {
  it("mapeia o grupo na célula em ordem de leitura", () => {
    const prof = chunkDoProfessor();
    // primeira fileira: colunas 0..5, logo à frente do professor
    expect(chunkDoGrupo(1)).toEqual({ cx: 0, cz: prof.cz + 1 });
    expect(chunkDoGrupo(6)).toEqual({ cx: 5, cz: prof.cz + 1 });
    // grupo 7 quebra a linha
    expect(chunkDoGrupo(7)).toEqual({ cx: 0, cz: prof.cz + 2 });
    expect(chunkDoGrupo(20)).toEqual({ cx: 1, cz: prof.cz + 4 });
  });

  it("usa 6 colunas e 4 fileiras para o teto de 20", () => {
    expect(COLUNAS_AULA).toBe(6);
    expect(MAX_GRUPOS_AULA).toBe(20);
    expect(linhasDaGrade()).toBe(4);
  });

  it("dimensiona o mundo para caber o teto inteiro", () => {
    const dims = dimsDaAula();
    for (let g = 1; g <= MAX_GRUPOS_AULA; g++) {
      const c = chunkDoGrupo(g);
      expect(c.cx).toBeGreaterThanOrEqual(0);
      expect(c.cx).toBeLessThan(dims.x);
      expect(c.cz).toBeGreaterThanOrEqual(0);
      expect(c.cz).toBeLessThan(dims.z);
    }
  });

  it("põe a célula-molde fora do professor e de qualquer grupo", () => {
    const molde = chunkDoMolde();
    const dims = dimsDaAula();
    expect(molde).not.toEqual(chunkDoProfessor());
    expect(molde.cz).toBeGreaterThanOrEqual(0);
    expect(molde.cz).toBeLessThan(dims.z);
    for (let g = 1; g <= MAX_GRUPOS_AULA; g++) {
      expect(chunkDoGrupo(g)).not.toEqual(molde);
    }
  });

  it("a caixa da célula é o chunk inteiro em XZ e CELULA_DY em Y", () => {
    const b = caixaDaCelula({ cx: 2, cz: 3 });
    expect(b.min).toEqual({ x: 2 * CHUNK_SIZE, y: CELULA_Y0, z: 3 * CHUNK_SIZE });
    expect(b.max).toEqual({
      x: 2 * CHUNK_SIZE + CHUNK_SIZE - 1,
      y: CELULA_Y0 + CELULA_DY - 1,
      z: 3 * CHUNK_SIZE + CHUNK_SIZE - 1,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- grade`
Expected: FAIL — `Failed to resolve import "./grade"`.

- [ ] **Step 3: Write the implementation**

Create `shared/src/grade.ts`:

```ts
/**
 * Geometria da GRADE de áreas da aula (2026-08-17).
 *
 * Até aqui o gerador punha um grupo por chunk em X, todos na MESMA fileira de Z
 * (`gerar.ts`, layout de fileira): 8 grupos = 128 blocos em linha, com o
 * professor andando ~64 blocos até cada ponta. Agora os grupos ocupam uma
 * GRADE de COLUNAS_AULA colunas, numerada em ordem de LEITURA
 * (esquerda→direita, frente→fundo) — é como o professor procura "o grupo 5".
 *
 * Este módulo é a ÚNICA fonte de "onde fica o grupo g": o gerador e o comando
 * `/aula grupos` chamam as mesmas funções. Se cada um fizesse a própria conta,
 * um mundo gerado hoje e um ajuste feito amanhã cairiam em lugares diferentes.
 *
 * É PURO de propósito (nada de World/GameSession): a aritmética é testável sem
 * montar mundo, e é ela que erra silenciosamente quando erra.
 */
import { CHUNK_SIZE } from "./constants";
import type { Box } from "./scenario";
import type { WorldDims } from "./world";
import { FLAT_SURFACE_Y } from "./worldgen";

/** Colunas da grade. 6 fecha os três tamanhos que interessam: 8 grupos = 6×2,
 *  20 = 6×4, e o teto futuro de 35 = 6×6 = 96×96 blocos (a pegada de hoje). */
export const COLUNAS_AULA = 6;

/** Teto de grupos que o mundo de aula comporta. Subir daqui é trocar esta
 *  constante e regerar os cenários — `dimsDaAula()` acompanha sozinha. */
export const MAX_GRUPOS_AULA = 20;

/** Base em Y da célula: em cima da grama, o mesmo chão da área do grupo. */
export const CELULA_Y0 = FLAT_SURFACE_Y + 1;

/** Altura da célula. Cobre a área e os `extras` (o mais alto hoje é o quadro
 *  em o.y+1); o que sobra é AR, e copiar AR é inócuo. */
export const CELULA_DY = 8;

/** Nome da região que guarda o estado de PARTIDA (a célula-molde). */
export const REGIAO_PARTIDA = "partida";

/** Fileiras que o teto ocupa. */
export function linhasDaGrade(): number {
  return Math.ceil(MAX_GRUPOS_AULA / COLUNAS_AULA);
}

/**
 * Dimensões do mundo de aula, em chunks. Não dependem de quantos grupos o
 * `.ljw` nasce com: o mundo já vem do tamanho do TETO, e é isso que tira o
 * `inBounds` do caminho do professor no meio da aula.
 *
 * z = 2·(1 + linhas) põe o professor no chunk central (o spawn) com as fileiras
 * de grupo ocupando exatamente a metade da FRENTE.
 */
export function dimsDaAula(): WorldDims {
  return { x: COLUNAS_AULA, z: 2 * (1 + linhasDaGrade()), y: 4 };
}

/** Chunk da cabine do professor: o central — é onde todo mundo nasce. */
export function chunkDoProfessor(): { cx: number; cz: number } {
  const dims = dimsDaAula();
  return { cx: Math.floor(dims.x / 2), cz: Math.floor(dims.z / 2) };
}

/** Chunk da célula-molde: um ATRÁS do professor. Fica na metade de trás do
 *  mundo, que nenhuma fileira de grupo usa — assim os alunos não a sujam. */
export function chunkDoMolde(): { cx: number; cz: number } {
  const prof = chunkDoProfessor();
  return { cx: prof.cx, cz: prof.cz - 1 };
}

/** Chunk ABSOLUTO do grupo g (1-based), em ordem de leitura. */
export function chunkDoGrupo(g: number): { cx: number; cz: number } {
  const i = g - 1;
  const prof = chunkDoProfessor();
  return { cx: i % COLUNAS_AULA, cz: prof.cz + 1 + Math.floor(i / COLUNAS_AULA) };
}

/** Caixa de uma célula: o chunk inteiro em XZ, CELULA_DY em Y a partir de
 *  CELULA_Y0. É a unidade de cópia — pega a área E os extras que ficam fora
 *  dela (a parede de quadros da aula 6 mora em x+3/x+4, fora da área). */
export function caixaDaCelula(chunk: { cx: number; cz: number }): Box {
  const ox = chunk.cx * CHUNK_SIZE;
  const oz = chunk.cz * CHUNK_SIZE;
  return {
    min: { x: ox, y: CELULA_Y0, z: oz },
    max: { x: ox + CHUNK_SIZE - 1, y: CELULA_Y0 + CELULA_DY - 1, z: oz + CHUNK_SIZE - 1 },
  };
}
```

- [ ] **Step 4: Export from the package barrel**

In `shared/src/index.ts`, add next to the other `export *` lines (mantenha a ordem alfabética
usada no arquivo):

```ts
export * from "./grade";
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- grade`
Expected: PASS, 5 testes.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: 3/3 sem erro.

- [ ] **Step 7: Commit**

```bash
git add shared/src/grade.ts shared/src/grade.test.ts shared/src/index.ts
git commit -m "feat(aula): grade de 6 colunas como fonte unica da geometria"
```

---

### Task 2: Quadros movíveis e `MAX_REGIONS`

O conteúdo do quadro vive FORA do id de bloco (`ses.quadros`, `Map<quadroKey, QuadroConteudo>`,
`session.ts:410`, `private`). Copiar uma célula sem mover essas entradas deixaria o grupo novo
com os 3 quadros-manual **em branco**. Como o mapa é privado, a API pública nasce aqui.

**Files:**
- Modify: `shared/src/session.ts` (dois métodos públicos novos, junto de `applyBlock`)
- Modify: `shared/src/regions.ts:22` (`MAX_REGIONS`)
- Test: `shared/src/quadros-mover.test.ts`

**Interfaces:**
- Consumes: `Box` de `./scenario`, `quadroKey`/`QuadroConteudo` de `./quadros` (já importados
  em `session.ts:42`).
- Produces:
  - `GameSession.moverQuadros(origem: Box, dx: number, dy: number, dz: number): number`
  - `GameSession.apagarQuadros(caixa: Box): number`
  - `MAX_REGIONS === 256`

- [ ] **Step 1: Write the failing test**

Create `shared/src/quadros-mover.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { MAX_REGIONS } from "./regions";
import { GameSession } from "./session";

/**
 * Conteúdo de quadro mora FORA do id de bloco (mapa por posição). Copiar uma
 * célula da aula tem de levar o conteúdo junto, senão o grupo novo recebe a
 * parede de manual EM BRANCO — que é justamente o enunciado da atividade.
 */
function sessaoComQuadro() {
  const session = new GameSession(() => {}, {
    dims: { x: 4, z: 4, y: 2 },
    seed: 7,
    flat: true,
    codigo: "sala",
  });
  session.handleMessage(1, JSON.stringify({ type: "join", name: "prof", pin: "0000", codigo: "sala" }));
  return session;
}

/** `quadro_set` exige ALCANCE (`session.ts:1149`), então o autor chega perto —
 *  é o mesmo truque do helper `Autoria.quadro` do gerador. */
function escrever(ses: GameSession, x: number, y: number, z: number, texto: string): void {
  ses.applyBlock(x, y, z, BlockId.QuadroXN);
  ses.handleMessage(1, JSON.stringify({ type: "move", x: x - 2, y, z: z + 0.5, yaw: 0, pitch: 0 }));
  ses.handleMessage(1, JSON.stringify({ type: "quadro_set", x, y, z, texto }));
}

describe("mover e apagar conteúdo de quadro", () => {
  it("move o conteúdo junto com o deslocamento", () => {
    const ses = sessaoComQuadro();
    escrever(ses, 4, 5, 6, "passo 1");
    ses.applyBlock(14, 5, 6, BlockId.QuadroXN); // destino já tem o BLOCO

    const movidos = ses.moverQuadros(
      { min: { x: 0, y: 0, z: 0 }, max: { x: 9, y: 9, z: 9 } },
      10,
      0,
      0,
    );

    expect(movidos).toBe(1);
    expect(ses.toSave().quadros).toEqual(
      expect.arrayContaining([expect.objectContaining({ x: 14, y: 5, z: 6, texto: "passo 1" })]),
    );
  });

  it("não apaga a origem ao mover (o molde continua servindo)", () => {
    const ses = sessaoComQuadro();
    escrever(ses, 4, 5, 6, "passo 1");
    ses.applyBlock(14, 5, 6, BlockId.QuadroXN);

    ses.moverQuadros({ min: { x: 0, y: 0, z: 0 }, max: { x: 9, y: 9, z: 9 } }, 10, 0, 0);

    expect(ses.toSave().quadros).toEqual(
      expect.arrayContaining([expect.objectContaining({ x: 4, y: 5, z: 6, texto: "passo 1" })]),
    );
  });

  it("não escreve onde o destino não é quadro", () => {
    const ses = sessaoComQuadro();
    escrever(ses, 4, 5, 6, "passo 1");
    // destino SEM o bloco de quadro

    const movidos = ses.moverQuadros(
      { min: { x: 0, y: 0, z: 0 }, max: { x: 9, y: 9, z: 9 } },
      10,
      0,
      0,
    );

    expect(movidos).toBe(0);
  });

  it("apaga só o conteúdo de dentro da caixa", () => {
    const ses = sessaoComQuadro();
    escrever(ses, 4, 5, 6, "dentro");
    escrever(ses, 20, 5, 6, "fora");

    const apagados = ses.apagarQuadros({ min: { x: 0, y: 0, z: 0 }, max: { x: 9, y: 9, z: 9 } });

    expect(apagados).toBe(1);
    const restantes = ses.toSave().quadros ?? [];
    expect(restantes.map((q) => q.texto)).toEqual(["fora"]);
  });

  it("MAX_REGIONS comporta o teto de grupos com folga", () => {
    // 20 grupos × 3 fases + 3 modelos + 1 partida = 64 — o valor antigo era
    // exatamente isso, zero folga para o professor criar região própria.
    expect(MAX_REGIONS).toBe(256);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- quadros-mover`
Expected: FAIL — `ses.moverQuadros is not a function` e `expected 64 to be 256`.

- [ ] **Step 3: Raise `MAX_REGIONS`**

In `shared/src/regions.ts:22`, replace:

```ts
export const MAX_REGIONS = 64;
```

with:

```ts
/** Teto de regiões nomeadas por mundo. 256 desde 2026-08-17: o mundo de aula
 *  no teto usa 20 grupos × 3 fases + 3 modelos + 1 partida = 64, que era o
 *  valor antigo INTEIRO — não sobrava uma região para o professor. */
export const MAX_REGIONS = 256;
```

- [ ] **Step 4: Add the two public methods**

In `shared/src/session.ts`, logo depois de `applyBlockQuieto` (por volta da linha 1895),
insira:

```ts
  /**
   * Copia o CONTEÚDO dos quadros de dentro de `origem` para a caixa deslocada
   * por (dx,dy,dz). O bloco do quadro já tem de estar no destino — quem copia
   * blocos é o chamador; aqui vai só o texto/imagem, que mora fora do id.
   *
   * A ORIGEM fica intacta: a célula-molde da aula é copiada muitas vezes.
   * Devolve quantas entradas foram escritas.
   */
  moverQuadros(origem: Box, dx: number, dy: number, dz: number): number {
    let movidos = 0;
    for (const q of [...this.quadros.values()]) {
      if (!regionContains(origem, q.x, q.y, q.z)) continue;
      const alvo = { ...q, x: q.x + dx, y: q.y + dy, z: q.z + dz };
      // só entra onde a célula É quadro (mesma tolerância do restore)
      if (!isQuadro(getBlock(this.world, alvo.x, alvo.y, alvo.z))) continue;
      this.quadros.set(quadroKey(alvo.x, alvo.y, alvo.z), alvo);
      movidos++;
    }
    return movidos;
  }

  /** Apaga o conteúdo de quadro dentro da caixa (o bloco é problema do
   *  chamador). Devolve quantas entradas saíram. */
  apagarQuadros(caixa: Box): number {
    let apagados = 0;
    for (const q of [...this.quadros.values()]) {
      if (!regionContains(caixa, q.x, q.y, q.z)) continue;
      this.quadros.delete(quadroKey(q.x, q.y, q.z));
      apagados++;
    }
    return apagados;
  }
```

Confira que `Box`, `regionContains`, `isQuadro`, `getBlock` e `quadroKey` já estão importados no
topo de `session.ts` — `quadroKey` está (linha 42), `regionContains` vem de `./regions`,
`isQuadro` de `./blocks`, `getBlock` de `./world`, `Box` de `./scenario`. Adicione ao import
existente o que faltar; não crie linha de import nova para um símbolo do mesmo módulo.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- quadros-mover`
Expected: PASS, 5 testes.

- [ ] **Step 6: Run the full suite (o teto de regiões é lido em vários testes)**

Run: `npm test`
Expected: tudo verde. Se algum teste afirmava `MAX_REGIONS === 64`, atualize-o — a mudança é
deliberada e o teste tem de dizer 256.

- [ ] **Step 7: Commit**

```bash
git add shared/src/session.ts shared/src/regions.ts shared/src/quadros-mover.test.ts
git commit -m "feat(aula): mover/apagar conteudo de quadro e MAX_REGIONS 256"
```

---

### Task 3: `copiarCelula` e `limparCelula`

O primitivo que o gerador **e** o comando ao vivo usam. Uma célula é a unidade de cópia porque é
o único recorte que pega a área **e** os `extras` que ficam fora dela.

**Files:**
- Create: `shared/src/session/aula.ts`
- Test: `shared/src/aula-celula.test.ts`
- Modify: `shared/src/index.ts` (export)

**Interfaces:**
- Consumes: `caixaDaCelula`/`chunkDoGrupo`/`chunkDoMolde` da Task 1;
  `moverQuadros`/`apagarQuadros` da Task 2.
- Produces:
  - `copiarCelula(ses: GameSession, origem: Box, destino: Box): { escritos: number; pulados: number }`
  - `limparCelula(ses: GameSession, caixa: Box): { apagados: number; pulados: number }`

- [ ] **Step 1: Write the failing test**

Create `shared/src/aula-celula.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import { CELULA_Y0, caixaDaCelula } from "./grade";
import { GameSession } from "./session";
import { copiarCelula, limparCelula } from "./session/aula";
import { getBlock } from "./world";

/**
 * A CÉLULA é a unidade de cópia da aula (2026-08-17). O baseline do objetivo
 * cobre só a caixa da ÁREA, e os `extras` do cenário (a parede de manual da
 * aula 6) ficam FORA dela — copiar por área deixaria o grupo novo sem o
 * enunciado. A célula é o chunk inteiro, então pega os dois.
 */
function sessaoDeAula() {
  const session = new GameSession(() => {}, {
    dims: { x: 4, z: 4, y: 2 },
    seed: 11,
    flat: true,
    codigo: "sala",
  });
  session.handleMessage(1, JSON.stringify({ type: "join", name: "prof", pin: "0000", codigo: "sala" }));
  // o autor fica longe: célula com jogador em pé é PULADA
  session.handleMessage(1, JSON.stringify({ type: "move", x: 1.5, y: 20, z: 1.5, yaw: 0, pitch: 0 }));
  return session;
}

describe("copiarCelula / limparCelula", () => {
  it("copia bloco de dentro da área e extra de fora dela", () => {
    const ses = sessaoDeAula();
    const origem = caixaDaCelula({ cx: 0, cz: 0 });
    const destino = caixaDaCelula({ cx: 1, cz: 0 });
    // "área": perto do canto. "extra": longe, mas dentro do mesmo chunk.
    ses.applyBlock(origem.min.x + 1, CELULA_Y0, origem.min.z + 1, BlockId.Stone);
    ses.applyBlock(origem.min.x + 12, CELULA_Y0 + 1, origem.min.z + 9, BlockId.Cobblestone);

    const r = copiarCelula(ses, origem, destino);

    expect(r.pulados).toBe(0);
    expect(getBlock(ses.world, destino.min.x + 1, CELULA_Y0, destino.min.z + 1)).toBe(BlockId.Stone);
    expect(getBlock(ses.world, destino.min.x + 12, CELULA_Y0 + 1, destino.min.z + 9)).toBe(
      BlockId.Cobblestone,
    );
  });

  it("leva o conteúdo do quadro junto", () => {
    const ses = sessaoDeAula();
    const origem = caixaDaCelula({ cx: 0, cz: 0 });
    const destino = caixaDaCelula({ cx: 1, cz: 0 });
    const qx = origem.min.x + 3;
    const qy = CELULA_Y0 + 1;
    const qz = origem.min.z + 2;
    ses.applyBlock(qx, qy, qz, BlockId.QuadroXN);
    // quadro_set exige ALCANCE (session.ts:1149) — o autor chega perto
    ses.handleMessage(1, JSON.stringify({ type: "move", x: qx - 2, y: qy, z: qz + 0.5, yaw: 0, pitch: 0 }));
    ses.handleMessage(1, JSON.stringify({ type: "quadro_set", x: qx, y: qy, z: qz, texto: "passo 1" }));
    // e sai de cima da célula de destino antes de copiar
    ses.handleMessage(1, JSON.stringify({ type: "move", x: 1.5, y: 30, z: 1.5, yaw: 0, pitch: 0 }));

    copiarCelula(ses, origem, destino);

    expect(ses.toSave().quadros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ x: destino.min.x + 3, z: destino.min.z + 2, texto: "passo 1" }),
      ]),
    );
  });

  it("sobrescreve o destino: célula que era bloco e virou ar volta a ar", () => {
    const ses = sessaoDeAula();
    const origem = caixaDaCelula({ cx: 0, cz: 0 });
    const destino = caixaDaCelula({ cx: 1, cz: 0 });
    ses.applyBlock(destino.min.x + 2, CELULA_Y0, destino.min.z + 2, BlockId.Stone);

    copiarCelula(ses, origem, destino);

    expect(getBlock(ses.world, destino.min.x + 2, CELULA_Y0, destino.min.z + 2)).toBe(BlockId.Air);
  });

  it("pula a célula onde há jogador em pé e conta o pulo", () => {
    const ses = sessaoDeAula();
    const origem = caixaDaCelula({ cx: 0, cz: 0 });
    const destino = caixaDaCelula({ cx: 1, cz: 0 });
    ses.applyBlock(origem.min.x + 1, CELULA_Y0, origem.min.z + 1, BlockId.Stone);
    // põe o professor exatamente na célula de destino correspondente
    ses.handleMessage(
      1,
      JSON.stringify({
        type: "move",
        x: destino.min.x + 1.5,
        y: CELULA_Y0,
        z: destino.min.z + 1.5,
        yaw: 0,
        pitch: 0,
      }),
    );

    const r = copiarCelula(ses, origem, destino);

    expect(r.pulados).toBeGreaterThan(0);
  });

  it("limparCelula zera blocos e conteúdo de quadro", () => {
    const ses = sessaoDeAula();
    const caixa = caixaDaCelula({ cx: 2, cz: 2 });
    const qx = caixa.min.x + 2;
    const qy = CELULA_Y0 + 1;
    const qz = caixa.min.z + 2;
    ses.applyBlock(caixa.min.x + 1, CELULA_Y0, caixa.min.z + 1, BlockId.Stone);
    ses.applyBlock(qx, qy, qz, BlockId.QuadroXN);
    ses.handleMessage(1, JSON.stringify({ type: "move", x: qx - 2, y: qy, z: qz + 0.5, yaw: 0, pitch: 0 }));
    ses.handleMessage(1, JSON.stringify({ type: "quadro_set", x: qx, y: qy, z: qz, texto: "x" }));
    ses.handleMessage(1, JSON.stringify({ type: "move", x: 1.5, y: 30, z: 1.5, yaw: 0, pitch: 0 }));

    const r = limparCelula(ses, caixa);

    expect(r.apagados).toBeGreaterThan(0);
    expect(getBlock(ses.world, caixa.min.x + 1, CELULA_Y0, caixa.min.z + 1)).toBe(BlockId.Air);
    expect(ses.toSave().quadros ?? []).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- aula-celula`
Expected: FAIL — `Failed to resolve import "./session/aula"`.

- [ ] **Step 3: Write the implementation**

Create `shared/src/session/aula.ts`:

```ts
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
import type { Box } from "../scenario";
import type { GameSession } from "../session";
import { getBlock } from "../world";

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
```

- [ ] **Step 4: Export from the barrel**

In `shared/src/index.ts`, junto dos outros módulos de `./session/`:

```ts
export * from "./session/aula";
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- aula-celula`
Expected: PASS, 5 testes.

- [ ] **Step 6: Commit**

```bash
git add shared/src/session/aula.ts shared/src/aula-celula.test.ts shared/src/index.ts
git commit -m "feat(aula): copiarCelula/limparCelula como unidade de copia"
```

---

### Task 4: Gerador na grade, com célula-molde

O gerador para de plantar grupo a grupo: planta o molde **uma vez** e carimba com
`copiarCelula`. E o mundo passa a nascer no tamanho do teto.

**Files:**
- Modify: `server/src/cenarios/gerar.ts` (constantes `FAIXA_*`, `dims`, o bloco 336-359,
  `conferirExtra` da aula 6 em :270-275, o teto de `--grupos` em :393)
- Modify: `cenarios/*.ljw` (regerados pelo comando, não à mão)

**Interfaces:**
- Consumes: `caixaDaCelula`, `chunkDoGrupo`, `chunkDoMolde`, `chunkDoProfessor`, `dimsDaAula`,
  `CELULA_Y0`, `MAX_GRUPOS_AULA`, `REGIAO_PARTIDA` (Task 1); `copiarCelula` (Task 3).
- Produces: `.ljw` com a região `partida` registrada e as áreas na grade.

- [ ] **Step 1: Trocar as constantes de layout pela grade**

Em `server/src/cenarios/gerar.ts`, substitua a linha 46:

```ts
const FAIXA_Y = FLAT_SURFACE_Y + 1; // em cima da grama
```

por:

```ts
// a base em Y da célula é a MESMA do shared: o comando /aula grupos copia
// exatamente esta fatia, e duas contas separadas divergiriam no primeiro ajuste
const FAIXA_Y = CELULA_Y0;
```

Adicione ao import de `@logica/shared` (linha 25-33) os símbolos novos:
`CELULA_Y0`, `MAX_GRUPOS_AULA`, `REGIAO_PARTIDA`, `caixaDaCelula`, `chunkDoGrupo`,
`chunkDoMolde`, `chunkDoProfessor`, `copiarCelula`, `dimsDaAula`. Remova `FLAT_SURFACE_Y` do
import se ele não for mais usado no arquivo (o typecheck aponta).

- [ ] **Step 2: Trocar `dims` e as origens**

Substitua as linhas 302-311:

```ts
  // mundo par (o spawn cai no CANTO do chunk central) e largo o bastante pra
  // uma cabine por grupo lado a lado
  const dims = { x: Math.max(6, n % 2 ? n + 1 : n), z: 6, y: 4 };
  const a = new Autoria({ dims, preset: "cabines", seed: SEED, codigo: o.codigo });
  a.entrar(o.codigo);
  a.afastar(1.5, 20, 1.5); // longe de qualquer área: bloco não é colocado em cima de jogador

  // cabine do professor = chunk central (é onde todo mundo nasce)
  const profOx = a.session.world.sizeX / 2;
  const profOz = a.session.world.sizeZ / 2;
```

por:

```ts
  // o mundo nasce no tamanho do TETO, não do `--grupos` pedido: é isso que tira
  // o inBounds do caminho do professor quando ele ajusta os grupos na aula
  const dims = dimsDaAula();
  const a = new Autoria({ dims, preset: "cabines", seed: SEED, codigo: o.codigo });
  a.entrar(o.codigo);
  a.afastar(1.5, 20, 1.5); // longe de qualquer área: bloco não é colocado em cima de jogador

  // cabine do professor = chunk central (é onde todo mundo nasce)
  const chunkProf = chunkDoProfessor();
  const profOx = chunkProf.cx * CHUNK_SIZE;
  const profOz = chunkProf.cz * CHUNK_SIZE;
```

- [ ] **Step 3: Trocar o plantio por grupo pela célula-molde + carimbo**

Substitua as linhas 336-359 (do comentário "uma cabine por grupo…" até o fim do laço `for (let
g = 1; g <= n; g++)`), incluindo o cálculo de `profCx`/`cz`/`cx0`:

```ts
  // uma cabine por grupo, na fileira de chunks logo à frente (+z), centrada no professor
  const profCx = profOx / CHUNK_SIZE;
  const cz = profOz / CHUNK_SIZE + 1;
  const cx0 = Math.min(Math.max(profCx - Math.floor((n - 1) / 2), 0), dims.x - n);

  // modelo de CADA fase na cabine do professor — o estado certo, fotografado
  c.fases.forEach((fase, f) => {
    const org = canto(profOx, profOz, f);
    a.regiao(`modelo${suf(f)}`, org, fim(org, fase));
    plantar(org, fase, fase.gabarito);
  });

  // áreas de cada grupo (todas as fases), com partida + extras (dica/quadros)
  for (let g = 1; g <= n; g++) {
    const ox = (cx0 + g - 1) * CHUNK_SIZE;
    const oz = cz * CHUNK_SIZE;
    c.fases.forEach((fase, f) => {
      const org = canto(ox, oz, f);
      a.regiao(`area${suf(f)}-${g}`, org, fim(org, fase));
      plantar(org, fase, fase.partida);
      fase.extras?.(a, org);
    });
    a.afastar(1.5, 20, 1.5); // extras podem ter chegado perto — volta pro alto
  }
```

por:

```ts
  // modelo de CADA fase na cabine do professor — o GABARITO, fotografado
  c.fases.forEach((fase, f) => {
    const org = canto(profOx, profOz, f);
    a.regiao(`modelo${suf(f)}`, org, fim(org, fase));
    plantar(org, fase, fase.gabarito);
  });

  // CÉLULA-MOLDE: o estado de PARTIDA + os extras, plantados UMA vez só, no
  // chunk atrás do professor. É a fonte que o /aula grupos copia durante a aula
  // — e é por isso que ela NÃO é esvaziada junto com o gabarito lá embaixo.
  const chunkMolde = chunkDoMolde();
  const moldeOx = chunkMolde.cx * CHUNK_SIZE;
  const moldeOz = chunkMolde.cz * CHUNK_SIZE;
  c.fases.forEach((fase, f) => {
    const org = canto(moldeOx, moldeOz, f);
    plantar(org, fase, fase.partida);
    fase.extras?.(a, org);
  });
  a.afastar(1.5, 20, 1.5); // extras chegaram perto — volta pro alto
  const caixaMolde = caixaDaCelula(chunkMolde);
  a.regiao(REGIAO_PARTIDA, caixaMolde.min, caixaMolde.max);

  // áreas de cada grupo: carimbo da célula-molde pelo MESMO primitivo que o
  // /aula grupos usa ao vivo — um caminho de código só
  for (let g = 1; g <= n; g++) {
    const chunkG = chunkDoGrupo(g);
    const r = copiarCelula(a.session, caixaMolde, caixaDaCelula(chunkG));
    if (r.pulados > 0) {
      throw new Error(`${c.arquivo}: grupo ${g} teve ${r.pulados} bloco(s) pulados na geração`);
    }
    const ox = chunkG.cx * CHUNK_SIZE;
    const oz = chunkG.cz * CHUNK_SIZE;
    c.fases.forEach((fase, f) => {
      const org = canto(ox, oz, f);
      a.regiao(`area${suf(f)}-${g}`, org, fim(org, fase));
    });
  }
```

- [ ] **Step 4: Acertar o conferidor de quadros da aula 6**

A célula-molde ganhou a própria parede de manual, então o save tem uma parede a mais.
Substitua as linhas 270-275:

```ts
    conferirExtra: (buf, grupos) => {
      const q = decodeSave(buf).quadros ?? [];
      return q.length === grupos * PASSOS.length
        ? []
        : [`esperava ${grupos * PASSOS.length} quadros com conteúdo, save tem ${q.length}`];
    },
```

por:

```ts
    conferirExtra: (buf, grupos) => {
      // grupos + 1: a célula-molde tem a própria parede de manual, e é dela que
      // o /aula grupos copia quando o professor aumenta a turma na aula
      const esperado = (grupos + 1) * PASSOS.length;
      const q = decodeSave(buf).quadros ?? [];
      return q.length === esperado
        ? []
        : [`esperava ${esperado} quadros com conteúdo, save tem ${q.length}`];
    },
```

- [ ] **Step 5: Subir o teto do `--grupos`**

Substitua as linhas 392-394:

```ts
  const grupos = Number(flag("grupos") ?? 5);
  if (!Number.isInteger(grupos) || grupos < 1 || grupos > 8) {
    throw new Error("--grupos precisa ser um inteiro de 1 a 8");
  }
```

por:

```ts
  const grupos = Number(flag("grupos") ?? 5);
  if (!Number.isInteger(grupos) || grupos < 1 || grupos > MAX_GRUPOS_AULA) {
    throw new Error(`--grupos precisa ser um inteiro de 1 a ${MAX_GRUPOS_AULA}`);
  }
```

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`
Expected: 3/3. Erros esperados aqui são imports não usados (`FLAT_SURFACE_Y`) — remova.

- [ ] **Step 7: Regerar os cenários**

Run: `npm run cenarios`
Expected: gera todos os `.ljw` e o `conferir` de cada um passa, incluindo o `conferirExtra` da
aula 6 com a contagem nova. Se o conferidor da aula 6 reclamar de contagem, **não relaxe o
conferidor** — a conta certa é `(grupos + 1) × PASSOS.length` e divergência aponta bug no
carimbo.

- [ ] **Step 8: Commit**

```bash
git add server/src/cenarios/gerar.ts cenarios
git commit -m "feat(cenarios): grade de aula e celula-molde de partida"
```

---

### Task 5: `/aula grupos X` — crescer

**Files:**
- Modify: `shared/src/session/aula.ts` (adiciona `runAula` e os ajudantes de objetivo)
- Modify: `shared/src/session.ts:1499` (registrar o comando) e a linha de ajuda em `:1570`
- Test: `shared/src/aula-crescer.test.ts`

**Interfaces:**
- Consumes: `copiarCelula`/`limparCelula` (Task 3), a grade (Task 1).
- Produces: `runAula(ses: GameSession, clientId: number, parts: string[]): string`.

- [ ] **Step 1: Write the failing test**

Create `shared/src/aula-crescer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import {
  CELULA_Y0,
  REGIAO_PARTIDA,
  caixaDaCelula,
  chunkDoGrupo,
  chunkDoMolde,
  chunkDoProfessor,
} from "./grade";
import { GameSession } from "./session";
import { getBlock } from "./world";

/**
 * `/aula grupos X` crescendo. O que importa e não é óbvio: os grupos que já
 * existiam ficam INTOCADOS (composição, progresso e os blocos que os alunos já
 * puseram), e os objetivos per-grupo passam a valer para os grupos novos — o
 * `o.alvos` é congelado na criação, então criar a região sozinha não bastaria.
 */
function mundoDeAula(quantos = 2) {
  const session = new GameSession(() => {}, {
    dims: { x: 6, z: 10, y: 4 },
    seed: 13,
    flat: true,
    codigo: "sala",
  });
  const cmd = (id: number, text: string): void =>
    session.handleMessage(id, JSON.stringify({ type: "chat", text }));
  session.handleMessage(1, JSON.stringify({ type: "join", name: "prof", pin: "0000", codigo: "sala" }));
  session.handleMessage(1, JSON.stringify({ type: "move", x: 1.5, y: 30, z: 1.5, yaw: 0, pitch: 0 }));

  // célula-molde: o estado de PARTIDA, atrás do professor
  const molde = caixaDaCelula(chunkDoMolde());
  session.applyBlock(molde.min.x + 1, CELULA_Y0, molde.min.z + 1, BlockId.Stone);
  session.regions.set(REGIAO_PARTIDA, { nome: REGIAO_PARTIDA, min: molde.min, max: molde.max });

  // modelo (GABARITO) na cabine do professor — NÃO na célula-molde, senão o
  // carimbo copiaria a resposta para dentro da área de cada grupo
  const prof = caixaDaCelula(chunkDoProfessor());
  session.applyBlock(prof.min.x + 5, CELULA_Y0, prof.min.z + 5, BlockId.Cobblestone);
  session.regions.set("modelo", {
    nome: "modelo",
    min: { x: prof.min.x + 5, y: CELULA_Y0, z: prof.min.z + 5 },
    max: { x: prof.min.x + 7, y: CELULA_Y0, z: prof.min.z + 7 },
  });

  cmd(1, `/grupo criar ${quantos}`);
  // as áreas de grupo, como se tivessem saído do carimbo do gerador
  for (let g = 1; g <= quantos; g++) {
    const c = caixaDaCelula(chunkDoGrupo(g));
    session.applyBlock(c.min.x + 1, CELULA_Y0, c.min.z + 1, BlockId.Stone);
    session.regions.set(`area-${g}`, {
      nome: `area-${g}`,
      min: { x: c.min.x, y: CELULA_Y0, z: c.min.z },
      max: { x: c.min.x + 2, y: CELULA_Y0, z: c.min.z + 2 },
    });
  }
  cmd(1, "/objetivo add construir modelo area monte a figura");
  return { session, cmd };
}

describe("/aula grupos — crescer", () => {
  it("cria as áreas dos grupos novos a partir da célula-molde", () => {
    const { session, cmd } = mundoDeAula();
    cmd(1, "/aula grupos 4");

    for (const g of [3, 4]) {
      const c = caixaDaCelula(chunkDoGrupo(g));
      expect(getBlock(session.world, c.min.x + 1, CELULA_Y0, c.min.z + 1)).toBe(BlockId.Stone);
      expect(session.regions.has(`area-${g}`)).toBe(true);
    }
    expect(session.grupos.size).toBe(4);
  });

  it("preserva composição e blocos dos grupos que já existiam", () => {
    const { session, cmd } = mundoDeAula();
    session.grupos.get(1)?.add("ana");
    const c1 = caixaDaCelula(chunkDoGrupo(1));
    session.applyBlock(c1.min.x + 4, CELULA_Y0, c1.min.z + 4, BlockId.Cobblestone);

    cmd(1, "/aula grupos 4");

    expect([...(session.grupos.get(1) ?? [])]).toEqual(["ana"]);
    expect(getBlock(session.world, c1.min.x + 4, CELULA_Y0, c1.min.z + 4)).toBe(BlockId.Cobblestone);
  });

  it("estende alvos e baseline do objetivo per-grupo", () => {
    const { session, cmd } = mundoDeAula();
    const o = session.scenario.objetivos[0];
    expect(o?.alvos).toHaveLength(2);

    cmd(1, "/aula grupos 4");

    expect(o?.alvos).toHaveLength(4);
    expect(o?.baseline).toHaveLength(4);
  });

  it("recusa acima do teto sem tocar em nada", () => {
    const { session, cmd } = mundoDeAula();
    cmd(1, "/aula grupos 99");
    expect(session.grupos.size).toBe(2);
  });

  it("recusa em mundo sem a região partida", () => {
    const { session, cmd } = mundoDeAula();
    session.regions.delete(REGIAO_PARTIDA);
    cmd(1, "/aula grupos 4");
    expect(session.grupos.size).toBe(2);
  });

  it("aluno não usa o comando", () => {
    const { session } = mundoDeAula();
    session.handleMessage(2, JSON.stringify({ type: "join", name: "ana", pin: "1111" }));
    session.handleMessage(2, JSON.stringify({ type: "chat", text: "/aula grupos 4" }));
    expect(session.grupos.size).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- aula-crescer`
Expected: FAIL — o comando não existe, `grupos.size` continua 2 no primeiro teste.

- [ ] **Step 3: Adicionar `runAula` (só o ramo de crescer) em `shared/src/session/aula.ts`**

Primeiro, **no topo do arquivo**, junto dos imports que a Task 3 já pôs lá (imports vão no topo,
não no meio):

```ts
import { MAX_GRUPOS_AULA, REGIAO_PARTIDA, caixaDaCelula, chunkDoGrupo } from "../grade";
import { MAX_REGIONS } from "../regions";
import { snapshotRegion } from "../scenario";
import { getBlock, inBounds } from "../world";
import { broadcastObjectives } from "./cenario";
import { broadcastGroups, sendGroup } from "./equipes";
```

A Task 3 já importou `getBlock` de `"../world"` — funda as duas numa linha só, como acima, em vez
de criar um import duplicado.

Depois, acrescente ao fim do arquivo:

```ts
/** Prefixos de área que o cenário usa, um por fase: "area", "area2", "area3"…
 *  Descobertos pelas regiões `<prefixo>-1` que existem no mundo. Uma região
 *  qualquer terminada em "-1" que o professor tenha criado entra aqui também —
 *  é o preço de não guardar o layout no save, e o efeito é uma região extra
 *  carimbada junto, não um mundo quebrado. */
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

  // o objetivo per-grupo congela `alvos` na criação (cenario.ts:124): sem
  // estender aqui, o grupo novo teria área e nenhum objetivo pendurado nela
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
```

Adicione `import type { Box } from "../scenario";` ao import de tipo já existente no topo (ele já
importa `Box`; não duplique). O `encolher` é escrito na Task 6 — por enquanto, adicione o esboço
mínimo abaixo para o arquivo compilar, e substitua-o inteiro na Task 6:

```ts
function encolher(
  _ses: GameSession,
  _alvo: number,
  _atual: number,
  _prefixos: string[],
  _confirmado: boolean,
): string {
  return "Diminuir o número de grupos ainda não está disponível.";
}
```

- [ ] **Step 4: Registrar o comando**

Em `shared/src/session.ts`, adicione ao import de `./session/aula` a função `runAula` e,
logo depois do `case "grupo":` (linha 1499-1500), insira:

```ts
      case "aula":
        return runAula(this, clientId, parts);
```

Na linha de ajuda de comando desconhecido (`session.ts:1570`), acrescente `/aula` à lista.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- aula-crescer`
Expected: PASS, 6 testes.

- [ ] **Step 6: Commit**

```bash
git add shared/src/session/aula.ts shared/src/session.ts shared/src/aula-crescer.test.ts
git commit -m "feat(aula): /aula grupos X cresce copiando a celula-molde"
```

---

### Task 6: `/aula grupos X` — encolher em 2 passos

**Files:**
- Modify: `shared/src/session/aula.ts` (substituir o esboço `encolher`)
- Test: `shared/src/aula-encolher.test.ts`

**Interfaces:**
- Consumes: `limparCelula` (Task 3), `runAula` (Task 5).
- Produces: nada novo — `encolher` continua interno.

- [ ] **Step 1: Write the failing test**

Create `shared/src/aula-encolher.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { BlockId } from "./blocks";
import {
  CELULA_Y0,
  REGIAO_PARTIDA,
  caixaDaCelula,
  chunkDoGrupo,
  chunkDoMolde,
  chunkDoProfessor,
} from "./grade";
import { GameSession } from "./session";
import { getBlock } from "./world";

/**
 * `/aula grupos X` diminuindo. Apaga trabalho de aluno, então é em DOIS passos:
 * o primeiro só relata o estrago e não escreve nada; o segundo, com "confirmar",
 * executa. Mesmo padrão de 2 cliques dos botões de expulsar/banir do painel.
 */
function mundoDeAula(quantos = 4) {
  const session = new GameSession(() => {}, {
    dims: { x: 6, z: 10, y: 4 },
    seed: 13,
    flat: true,
    codigo: "sala",
  });
  const cmd = (id: number, text: string): void =>
    session.handleMessage(id, JSON.stringify({ type: "chat", text }));
  session.handleMessage(1, JSON.stringify({ type: "join", name: "prof", pin: "0000", codigo: "sala" }));
  session.handleMessage(1, JSON.stringify({ type: "move", x: 1.5, y: 30, z: 1.5, yaw: 0, pitch: 0 }));

  const molde = caixaDaCelula(chunkDoMolde());
  session.applyBlock(molde.min.x + 1, CELULA_Y0, molde.min.z + 1, BlockId.Stone);
  session.regions.set(REGIAO_PARTIDA, { nome: REGIAO_PARTIDA, min: molde.min, max: molde.max });

  const prof = caixaDaCelula(chunkDoProfessor());
  session.applyBlock(prof.min.x + 5, CELULA_Y0, prof.min.z + 5, BlockId.Cobblestone);
  session.regions.set("modelo", {
    nome: "modelo",
    min: { x: prof.min.x + 5, y: CELULA_Y0, z: prof.min.z + 5 },
    max: { x: prof.min.x + 7, y: CELULA_Y0, z: prof.min.z + 7 },
  });

  cmd(1, `/grupo criar ${quantos}`);
  for (let g = 1; g <= quantos; g++) {
    const c = caixaDaCelula(chunkDoGrupo(g));
    session.applyBlock(c.min.x + 1, CELULA_Y0, c.min.z + 1, BlockId.Stone);
    session.regions.set(`area-${g}`, {
      nome: `area-${g}`,
      min: { x: c.min.x, y: CELULA_Y0, z: c.min.z },
      max: { x: c.min.x + 2, y: CELULA_Y0, z: c.min.z + 2 },
    });
  }
  cmd(1, "/objetivo add construir modelo area monte a figura");
  return { session, cmd };
}

describe("/aula grupos — encolher", () => {
  it("sem confirmar, não muda bloco nem grupo", () => {
    const { session, cmd } = mundoDeAula();
    const c4 = caixaDaCelula(chunkDoGrupo(4));
    cmd(1, "/aula grupos 2");
    expect(session.grupos.size).toBe(4);
    expect(getBlock(session.world, c4.min.x + 1, CELULA_Y0, c4.min.z + 1)).toBe(BlockId.Stone);
    expect(session.regions.has("area-4")).toBe(true);
  });

  it("com confirmar, apaga células, regiões e grupos", () => {
    const { session, cmd } = mundoDeAula();
    const c4 = caixaDaCelula(chunkDoGrupo(4));
    cmd(1, "/aula grupos 2 confirmar");
    expect(session.grupos.size).toBe(2);
    expect(session.regions.has("area-4")).toBe(false);
    expect(getBlock(session.world, c4.min.x + 1, CELULA_Y0, c4.min.z + 1)).toBe(BlockId.Air);
  });

  it("encurta alvos e baseline do objetivo", () => {
    const { session, cmd } = mundoDeAula();
    const o = session.scenario.objetivos[0];
    expect(o?.alvos).toHaveLength(4);
    cmd(1, "/aula grupos 2 confirmar");
    expect(o?.alvos).toHaveLength(2);
    expect(o?.baseline).toHaveLength(2);
  });

  it("realoca os alunos dos grupos que sumiram", () => {
    const { session, cmd } = mundoDeAula();
    session.grupos.get(3)?.add("ana");
    session.grupos.get(4)?.add("bia");
    cmd(1, "/aula grupos 2 confirmar");
    const todos = [...(session.grupos.get(1) ?? []), ...(session.grupos.get(2) ?? [])];
    expect(todos.sort()).toEqual(["ana", "bia"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- aula-encolher`
Expected: FAIL — o esboço devolve "ainda não está disponível", `grupos.size` continua 4.

- [ ] **Step 3: Escrever o `encolher` de verdade**

Substitua o esboço em `shared/src/session/aula.ts` por:

```ts
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

  // alunos primeiro: round-robin nos grupos que ficam, com aviso a cada um
  const orfaos: string[] = [];
  for (const g of somem) {
    for (const nome of ses.grupos.get(g) ?? []) orfaos.push(nome);
  }
  for (const g of somem) {
    ses.grupos.delete(g);
    const c = caixaDaCelula(chunkDoGrupo(g));
    limparCelula(ses, c);
    for (const prefixo of prefixos) ses.regions.delete(`${prefixo}-${g}`);
    for (const o of ses.scenario.objetivos) ses.completosGrupo.delete(`${o.id}:${g}`);
  }
  orfaos.forEach((nome, i) => {
    const destino = (i % alvo) + 1;
    ses.grupos.get(destino)?.add(nome);
    for (const [id, p] of ses.players) {
      if (p.name === nome) ses.sendServerChat(id, `seu grupo foi desfeito; você agora está no grupo ${destino}`);
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- aula-encolher`
Expected: PASS, 4 testes.

- [ ] **Step 5: Run the whole suite**

Run: `npm test`
Expected: tudo verde.

- [ ] **Step 6: Commit**

```bash
git add shared/src/session/aula.ts shared/src/aula-encolher.test.ts
git commit -m "feat(aula): encolher grupos com confirmacao em 2 passos"
```

---

### Task 7: Superfície do professor (textos, autocompletar, painel P)

**Files:**
- Modify: `shared/src/session/cenario.ts:52` e `:84` (textos que apontam pra `/regiao carimbar`)
- Modify: `client/src/commands.ts:13-52`
- Modify: `client/src/players.ts` (aba nova)

**Interfaces:**
- Consumes: `/aula grupos X` (Tasks 5-6), `MAX_GRUPOS_AULA` (Task 1).
- Produces: nada consumido por tarefas seguintes.

- [ ] **Step 1: Apontar os textos para o comando novo**

Em `shared/src/session/cenario.ts:50-53`, troque a frase

```
`então é preciso uma área para cada um (crie-as com /regiao carimbar).`
```

por

```
`então é preciso uma área para cada um (ajuste com /aula grupos ${ses.grupos.size}).`
```

E em `:83-84`, troque

```
"criado com /regiao carimbar."
```

por

```
"criado com /aula grupos."
```

- [ ] **Step 2: Autocompletar**

Em `client/src/commands.ts`, adicione `"aula"` ao array `COMANDOS` (depois de `"grupo"`) e

```ts
  aula: ["grupos"],
```

ao objeto `SUBCOMANDOS`.

- [ ] **Step 3: Aba de grupos no painel P**

Em `client/src/players.ts`:

Troque o tipo da aba (linha ~15, `type Aba = "conectados" | "banidos"`) por

```ts
type Aba = "conectados" | "banidos" | "grupos";
```

Adicione a aba na lista de `tabs` dentro de `render()`:

```ts
      { id: "grupos", label: "grupos" },
```

Adicione o despacho, junto de `if (this.aba === "conectados") …`:

```ts
    if (this.aba === "conectados") this.renderConectados(lista);
    else if (this.aba === "grupos") this.renderGrupos(lista);
    else this.renderBanidos(lista);
```

E o método novo, ao lado de `renderBanidos`:

```ts
  /** Ajuste do número de grupos (2026-08-17). Cada botão é um comando de chat,
   *  como o resto do painel — o servidor é quem decide. Diminuir passa pelos
   *  2 cliques do `armedBtn` e manda "confirmar" no segundo. */
  private renderGrupos(lista: HTMLElement): void {
    lista.append(
      this.hint("quantos grupos a turma tem? aumentar cria as áreas; diminuir apaga as que sobram."),
    );
    const grade = document.createElement("div");
    grade.className = "jog-row";
    for (let n = 1; n <= MAX_GRUPOS_AULA; n++) {
      grade.append(
        this.armedBtn(String(n), () => this.send(`/aula grupos ${n} confirmar`)),
      );
    }
    lista.append(grade);
  }
```

Importe a constante no topo do arquivo:

```ts
import { MAX_GRUPOS_AULA } from "@logica/shared";
```

- [ ] **Step 4: Typecheck e build**

Run: `npm run typecheck && npm run build`
Expected: 3/3 e build verde.

- [ ] **Step 5: Commit**

```bash
git add shared/src/session/cenario.ts client/src/commands.ts client/src/players.ts client/dist
git commit -m "feat(aula): painel de grupos, autocompletar e textos de ajuda"
```

---

### Task 8: Bateria completa, documentação e entrega

**Files:**
- Modify: `todo.md` (item para `[x]` com a evidência; anotar o que ficou de fora)
- Modify: `.wolf/STATUS.md`, `.wolf/memory.md`, `.wolf/cerebrum.md`, `.wolf/anatomy.md`
- Modify: `client/dist` (rebuild final)

- [ ] **Step 1: Bateria completa**

Run, nesta ordem, e **cole a saída de cada uma no relatório**:

```bash
npm run check:launchers
npm run typecheck
npm test
npm run build
npm run smoke
npm run cenarios
```

Expected: `check:launchers` 5/5 · typecheck 3/3 · todos os testes verdes (o número sobe: +5
grade, +5 quadros, +5 célula, +6 crescer, +4 encolher = **+25**) · build · 15/15 smokes ·
cenários gerados e conferidos.

- [ ] **Step 2: A/B da sonda (a lição do bug-610: sonda que não cai é sonda vazia)**

Reverta temporariamente a linha `ses.moverQuadros(origem, dx, dy, dz);` de `copiarCelula` e rode
`npm test -- aula-celula`. Expected: o teste "leva o conteúdo do quadro junto" **FALHA**.
Restaure a linha e confirme que volta a passar.

- [ ] **Step 3: Atualizar `todo.md`**

Marque o item "AJUSTAR AO VIVO O NÚMERO DE CÓPIAS DA ÁREA DA ATIVIDADE" como `[x]` com a data
2026-08-17 e o resumo do que saiu. Anote como itens NOVOS e abertos:
- subir o teto para 35 grupos (turma individual) — trocar `MAX_GRUPOS_AULA` e regerar
- proteger a célula-molde contra edição do professor

- [ ] **Step 4: Atualizar `.wolf/`**

- `STATUS.md`: bloco de HANDOFF novo no topo, com o que saiu, a bateria e a fila.
- `memory.md`: uma linha por ação significativa da sessão.
- `cerebrum.md`: Key Learnings (o `baseline` não cobre `extras`; `porGrupo` é derivado no
  broadcast, `alvos`/`baseline` não; conteúdo de quadro mora fora do id de bloco) e Decision Log
  (grade de 6 colunas, teto 20, célula-molde).
- `anatomy.md`: entradas para `shared/src/grade.ts`, `shared/src/session/aula.ts` e os 5 testes
  novos. Regenere com `openwolf scan` se disponível.

- [ ] **Step 5: Commit e push**

```bash
git add -A
git commit -m "docs(aula): todo, wolf e spec das copias ao vivo"
git push origin main
```

---

## Notas de execução

- **Rode a suíte com `npm test`**, não `npx vitest run` da raiz sem config: o `testTimeout` de
  5000 ms dos defaults derruba os testes que geram mundo (bug-612).
- **Não deixe servidor de dev vivo** entre tarefas: Chrome/vite órfãos já custaram sessões
  inteiras neste projeto (bug-612).
- Se um teste de worldgen falhar, **é falha de verdade** — a regra "3 falhas = baseline" morreu
  no bug-612.
