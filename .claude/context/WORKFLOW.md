---
updated: 2026-10-19
tier: 3
---

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
   topo de `client/src/changelog.ts` (o topo é sempre o build atual e não leva `data` à mão)
   → verify: `git diff client/src/changelog.ts` mostra o item no bloco do topo
   → ⚠️ **primeiro mesmo**: escrever o item ANTES de codar obriga a dizer o que o aluno ganha.
     Deixar pro fim faz o item sair como resumo do diff — e em 19/10 eu inverti em 3 lotes.
2. `npm run build` — gera `shared/src/build-info.json` e o `client/dist`
   → verify: o build sai 0 e o `build-info.json` aparece no `git status`
3. `npm run verify` e `npm run smoke` → verify: os dois saem verdes
4. Commit **com o `client/dist` e o `build-info.json` junto** — a escola roda o dist, não o src
   → verify: `npm run check:dist` verde e `git status` limpo em `client/dist`
5. Push **direto na `main`**: sem branch, sem PR
   → verify: `git status -sb` mostra `main...origin/main` sem `ahead`

### Bloco NOVO ou item no bloco de cima?

O bloco do topo é **o build que está rodando na escola agora** — por isso ele não leva `data`
à mão, e por isso acrescentar item nele muda o que o professor vê no "📜 novidades" do build
que ele já tem instalado.

- **Item no bloco do topo** quando a mudança CABE no título que já está lá. Ex. (19/10): a porta
  OU entrou no bloco "O jogo confere o seu circuito", que ainda a descrevia.
- **Bloco NOVO no topo** (sem `data`) quando o título deixaria de descrever o lote — e aí o
  bloco anterior ganha a `data:` dele, escrita à mão, no dia em que ficou pronto. Ex. (19/10):
  o redesenho das peças abriu "Agora dá pra ver o circuito" e datou o anterior.

Quem decide na prática é o `gerar-build-info.mjs`: a data do rótulo só anda quando o **título**
do topo muda. Então a pergunta "bloco novo?" é a mesma que "isto é um marco novo pro professor?".
Lote técnico que o aluno não vê não entra em nenhum dos dois.

→ verify: `cat shared/src/build-info.json` — título igual ao do bloco do topo, e a data andou
  só se o bloco é novo.

## Mudança de UI

Só é "feita" quando uma sonda a ENXERGA. As de `scripts/*-shot.mjs` sobem um host de verdade e
um Chrome de verdade e asseveram no DOM. Rodar `npm run build` antes (elas servem o compilado).

## Manter o contexto fresco faz parte do trabalho

1. **Quest fechada** (ou antes de sugerir `/clear`): reescrever `STATUS.md` — ele é reescrito,
   não acumulado; o histórico mora no `git log`. Riscar o item em `TODO.md`
   → verify: `updated:` do STATUS é a data de hoje e o item está riscado no TODO
2. **Usuário corrigiu o rumo, explicou uma escolha, ou apareceu convenção não óbvia:**
   anotar em `LEARNINGS.md` (ou, se for decisão de arquitetura com razão longa, no Decision Log
   de `LEARNINGS-completo.md`). **O limiar é BAIXO.**
   → verify: `grep` pela tag da entrada acha a linha com a data de hoje
3. **Bug consertado** (reportado, teste vermelho, build quebrado): registrar em `BUGS.md` com a
   mensagem de erro LITERAL, causa e correção. **Escrito à mão** — nada de detector automático
   → verify: `grep -i "<trecho do erro>" .claude/context/BUGS.md` acha a entrada
4. **Ideia nova do usuário:** vai pro `todo.md` da raiz, não se implementa na hora
   → verify: a ideia está no `todo.md` e o diff não tem código dela
