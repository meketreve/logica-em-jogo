# Lógica em Jogo

Jogo voxel educacional para aulas de lógica. Cliente (Three.js) + servidor
autoritativo compartilhado que roda em 3 hospedeiros sem reescrita: Web Worker
(singleplayer), .exe portátil do professor e servidor Node dedicado.

## Memória entre sessões — leia antes de começar

Três arquivos, e só três. Eles substituem reconstruir contexto lendo código:

- **`.wolf/STATUS.md` — leia PRIMEIRO, sempre.** O handoff: o que acabou de ser
  concluído, qual é a próxima quest com as decisões já tomadas, o que está
  pendente e o que ainda não foi visto em tela pelo usuário.
- **`.wolf/cerebrum.md` — leia antes de decidir ou gerar código.** O *porquê* de
  cada escolha (Decision Log), o que já deu errado e não deve se repetir
  (Do-Not-Repeat), as convenções do projeto e as preferências do usuário.
- **`.wolf/buglog.json` — leia antes de caçar um bug.** O conserto pode já estar
  descrito ali, com causa raiz. São bugs ESCRITOS à mão: nada de detector
  automático (ele já encheu o arquivo de 148 entradas falsas uma vez).

**Manter os três frescos faz parte do trabalho, não é papelada:**

1. Quando uma quest fecha (ou antes de sugerir `/clear`): mova o concluído e
   escreva a próxima no `STATUS.md`. Ele é reescrito, não acumulado — o
   histórico já mora no `git log`.
2. Quando o usuário corrigir seu rumo, explicar uma escolha ou você descobrir
   uma convenção não óbvia: anote no `cerebrum.md`. O limiar é BAIXO.
3. Quando consertar qualquer bug (reportado, teste vermelho, build quebrado):
   registre no `buglog.json` com `error_message`, `root_cause`, `fix` e `tags`.

## Como achar código

`grep`/`glob` direto. Não existe índice de arquivos pra consultar antes — havia
um (`anatomy.md`), e ele dava mais manutenção do que economizava: desatualizava
a cada arquivo criado ou apagado, enquanto a busca nunca mente.

## O portão antes de commitar

```bash
npm run verify   # typecheck + testes + build (+ portão do dist versionado)
npm run smoke    # cenários de rede REAIS (--lista diz o que cada um prova)
```

O `client/dist` é versionado: a escola roda o `dist`, não o `src`. Commite os
dois juntos. Mudança de UI só é "feita" com uma sonda que a ENXERGUE (as de
`scripts/*-shot.mjs` rodam Chrome de verdade contra um host de verdade).
