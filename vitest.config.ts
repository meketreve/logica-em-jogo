import compartilhada from "./shared/vitest.config";

/**
 * Config do vitest da RAIZ (2026-08-11, bug-612).
 *
 * Existe por um motivo medido, e não é estilo: os testes moram todos em
 * `shared/src`, mas `npm test` os roda de dentro do workspace
 * (`npm run test -w shared`, CWD = `shared/`) — é assim que o vitest achava a
 * `shared/vitest.config.ts`. Rodar `npx vitest run` da RAIZ, que é o que toda
 * sessão digita pra conferir uma coisa só, COLETA OS MESMOS 45 arquivos mas
 * SEM config nenhuma: `testTimeout` volta pro default de 5 s e o pool volta a
 * abrir um fork por núcleo (24 nesta máquina).
 *
 * O efeito é o bug-612: com a máquina ocupada, os testes que GERAM MUNDO
 * (128³) estouram os 5 s e a suíte vira sorteio — 3 suítes concorrentes deram
 * 9 rodadas vermelhas em 9 pela raiz e 6 verdes em 6 por `npm test`, no mesmo
 * commit e na mesma pressão. Com `--config shared/vitest.config.ts` forçada,
 * a raiz também ficou verde: quem decide é a CONFIG, não o diretório.
 *
 * Reexportar a config do shared (em vez de copiar os números) mantém UMA fonte
 * dos dois limites — o comentário que os justifica mora lá.
 */
export default compartilhada;
