# Status — atualizado em 2026-09-25

## Estado atual

Jogo voxel educacional rodando, testado com turma real. Árvore limpa, `HEAD` = `origin/main`
(`a089663`). Único arquivo solto: `relatorio/…docx:Zone.Identifier`, do usuário — **não
commitar**. Ambiente é só LINUX (a cópia do WSL não existe mais); o `node_modules` deste clone é
o híbrido da sessão 98 e funciona.

O build atual (com §🔨 quebra por tempo, §🪓 machado e pá, heartbeat de presença e preço de item
na loja) **ainda NÃO foi publicado pra escola** — nada disso foi visto em tela pelo usuário. A
lista do que ele precisa testar em aula está no `TODO.md`, seção "Testar na escola".

## Próxima fase

**O 1º bloco de circuito lógico** — é a razão de os ids de 16 bits terem sido feitos, e está
**bloqueado numa pergunta ao usuário**: QUAL bloco, e como ele funciona na aula. Perguntar antes
de codar (feature grande = entrevista de escopo, ver `LEARNINGS.md`).

Atrás dela: `npm run bench:headless` antes/depois dos ids de 16 bits, ovelha+lã de verdade
(§🍖 F8) e sentar na cadeira.

## Pendências e bloqueios

- **Save no Ctrl+C disputa corrida com o `npx`/`tsx` que embrulha o host** (o sinal vai pro
  grupo). Hoje ganha com folga (~6 ms de encode), mas é frágil — ver bug-666 em `BUGS.md`.
  Conserto de verdade: o launcher chamar `node` direto.
- `scripts/f10-shot.mjs` quebrado ("botão ▣ não encontrado") — causa provável: o rótulo do botão
  muda com o item na mão ("colocar"/"interagir"). Não investigado.
- Singleplayer: o backup `dataAntesIds16` existe, mas o menu não oferece restaurar.
- 3ª pessoa é v1 funcional, não polida — distância/ângulo fixos, sem teste em aula real.
- Decisões pendentes DO USUÁRIO: quanto de Dimas cada aluno recebe ao entrar; e se o aviso de
  Dimas nova ao professor deve calar em turma cheia.
- Externas (não bloqueiam código): distribuição pelo Drive; certificado de assinatura de código
  (custo anual) só se sair da escola-piloto.

## Concluído (recente)

- **Sessão 102 (23/09):** §🪓 machado e pá — EXIGIR e ACELERAR viraram tabelas separadas, madeira
  ganhou dureza própria, 22 testes novos + passos 6/7 na sonda da quebra.
- **Sessão 101 (22-23/09):** heartbeat de presença (bug-672, tablet minimizado prendia o nome do
  aluno), preço de ITEM na loja (bug-671) e o desmonte do andaime de contexto.
- **Sessão 100 (17/09):** §🔨 ferramentas v2 inteira — segurar pra quebrar com rachadura, tempo
  por (bloco × ferramenta), ferramenta exigida na MÃO e durabilidade com barra de vida no slot.
