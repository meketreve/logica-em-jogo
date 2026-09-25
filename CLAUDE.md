# Lógica em Jogo

Jogo voxel educacional para aulas de lógica. Cliente (Three.js) + servidor
autoritativo compartilhado que roda em 3 hospedeiros sem reescrita: Web Worker
(singleplayer), .exe portátil do professor e servidor Node dedicado.

## Contexto entre sessões

Os quatro abaixo carregam sozinhos e substituem reconstruir contexto lendo código:

@.claude/context/STATUS.md
@.claude/context/TODO.md
@.claude/context/MAP.md
@.claude/context/LEARNINGS.md
@.claude/context/WORKFLOW.md

Dois NÃO carregam — são grandes e se consultam sob demanda:

- **`.claude/context/BUGS.md` — leia antes de caçar um bug.** 176 bugs já consertados, com causa
  raiz. Fazer `grep` pela mensagem de erro: o conserto pode já estar escrito ali.
- **`.claude/context/LEARNINGS-completo.md` — leia antes de decidir arquitetura.** O registro
  inteiro: preferências do usuário, Key Learnings, Do-Not-Repeat e o Decision Log com o *porquê*
  de cada escolha. O `LEARNINGS.md` importado é só a casca.

`todo.md` na raiz é o backlog detalhado (1300+ linhas, uma spec por ideia); o `TODO.md` do
contexto é só a fila de trabalho.

## Como achar código

`grep`/`glob` direto. **Não existe índice de arquivos**, e é decisão: havia um (`anatomy.md`) e
ele dava mais manutenção do que economizava — desatualizava a cada arquivo criado ou apagado,
enquanto a busca nunca mente. O `MAP.md` traz os comandos e só o que o nome da pasta não conta.
