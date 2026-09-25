# Workflow do projeto

## O portão antes de commitar

```bash
npm run verify   # typecheck + testes + build (+ portão do dist versionado)
npm run smoke    # cenários de rede REAIS (--lista diz o que cada um prova)
```

**Critério de pronto:** os dois verdes. Não aceitar "passou" sem ter rodado.

## Ordem de um lote fechado (push)

Sem `npm version` — o launcher da escola compara COMMIT, nunca semver.

1. **Changelog primeiro**, se a mudança for visível a aluno ou professor: item novo no bloco do
   topo de `client/src/changelog.ts` (o topo é sempre o build atual e não leva `data` à mão).
2. `npm run build` — gera `shared/src/build-info.json` e o `client/dist`.
3. `npm run verify` e `npm run smoke`.
4. Commit **com o `client/dist` e o `build-info.json` junto** — a escola roda o dist, não o src.
5. Push **direto na `main`**: sem branch, sem PR.

## Mudança de UI

Só é "feita" quando uma sonda a ENXERGA. As de `scripts/*-shot.mjs` sobem um host de verdade e
um Chrome de verdade e asseveram no DOM. Rodar `npm run build` antes (elas servem o compilado).

## Manter o contexto fresco faz parte do trabalho

1. **Quest fechada** (ou antes de sugerir `/clear`): reescrever `STATUS.md` — ele é reescrito,
   não acumulado; o histórico mora no `git log`. Riscar o item em `TODO.md`.
2. **Usuário corrigiu o rumo, explicou uma escolha, ou apareceu convenção não óbvia:**
   anotar em `LEARNINGS.md` (ou, se for decisão de arquitetura com razão longa, no Decision Log
   de `LEARNINGS-completo.md`). **O limiar é BAIXO.**
3. **Bug consertado** (reportado, teste vermelho, build quebrado): registrar em `BUGS.md` com a
   mensagem de erro LITERAL, causa e correção. **Escrito à mão** — nada de detector automático.
4. **Ideia nova do usuário:** vai pro `todo.md` da raiz, não se implementa na hora.
