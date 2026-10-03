---
updated: 2026-10-03
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. Árvore limpa, `main` em sinc com o
`origin` (`346a955`). Ambiente é só LINUX.

**O build com §🔨 quebra por tempo, §🪓 machado e pá, heartbeat de presença e preço de item está
PUSHADO** — o launcher da escola já baixa isso na próxima vez que rodar. **Nada disso foi visto
em tela pelo usuário**: a lista do que testar em aula está no `TODO.md`, e ela deixou de ser
hipotética. O retorno dessa aula é o que decide se algum número precisa afrouxar.

## Próxima fase

**O 1º bloco de circuito lógico** — é a razão de os ids de 16 bits terem sido feitos, e está
**BLOQUEADO numa pergunta ao usuário**: QUAL bloco, e como ele funciona na aula. Feature grande =
entrevista de escopo antes de codar (`LEARNINGS.md`). Não começar sem a resposta.

Com a resposta na mão, o ponto de entrada é `shared/src/blocks.ts` (id novo abaixo de 900, nunca
renumerar id que já existe) + um módulo PURO novo em `shared/src/`, no molde de `ferramentas.ts`
→ **verify:** `npm run verify` verde e uma sonda `shots:*` que ENXERGUE o bloco na tela.

Atrás dela: `bench:headless` antes/depois dos ids de 16 bits, ovelha+lã (§🍖 F8), sentar na cadeira.

## Pendências e bloqueios

- **Save no Ctrl+C disputa corrida com o `npx`/`tsx` que embrulha o host** — hoje ganha por ~6 ms,
  mas é frágil (bug-666). Conserto de verdade: o launcher chamar `node` direto.
- `scripts/f10-shot.mjs` quebrado ("botão ▣ não encontrado") — o rótulo do botão muda com o item
  na mão. Não investigado.
- Singleplayer não oferece restaurar o backup `dataAntesIds16`; 3ª pessoa é v1 não polida.
- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe ao entrar; se o aviso de Dimas nova
  deve calar em turma cheia.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **03/10:** estes arquivos entraram nas convenções novas da skill (veredicto em LEARNINGS, teto
  medido fora dos blocos `auto`, WORKFLOW em `etapa → verify:`).
- **02/10:** push dos dois commits represados — o conserto do **bug-673** chegou ao repositório
  (era um conserto que não tinha saído daqui, e a escola roda o que está no repo).
- **28/09–02/10:** skill `/contexto` migrada pro modelo de TIERS (3 aqui) e estes arquivos
  passaram a ter frontmatter + blocos `auto` do script.
- **25/09:** contexto migrado de `.wolf/` pra `.claude/context/`; **bug-673** — o rótulo de build
  carregava o sha do HEAD, o `client/dist` versionado mudava sozinho a cada commit e o portão do
  dist ficava desarmado justo no pre-push. Rótulo virou só a data.
- **23/09 (sessão 102):** §🪓 machado e pá — EXIGIR e ACELERAR viraram tabelas separadas.
- **22-23/09 (101):** heartbeat de presença (bug-672) e preço de ITEM na loja (bug-671).
- **17/09 (100):** §🔨 ferramentas v2 — segurar pra quebrar, rachadura, durabilidade.

## Bruto do git (auto — não editar)

<!-- auto:start -->
data: 2026-10-03

```
346a955 docs(contexto): etapas do WORKFLOW no formato "etapa → verify: checagem"
4954987 chore(git): ignora o Zone.Identifier que o Windows grava em arquivo baixado
e310339 docs(contexto): regenera o bloco auto do STATUS (8 commits, status curto)
09209f8 docs(contexto): migra os 7 arquivos pro formato de tiers da skill
86df1d3 docs(contexto): registra o bug-673 (rótulo auto-referente) no BUGS.md
d60f2cd fix(build): tira o sha do commit do rótulo — o dist parava de ser função da fonte
cfda969 docs(contexto): migra .wolf para .claude/context com imports no CLAUDE.md
a089663 feat(ferramentas): machado e pá — aceleram sem exigir (§🪓)
--- status ---
 M .claude/context/LEARNINGS.md
 M .claude/context/MAP.md
 M .claude/context/STATUS.md
 M .claude/context/TODO.md
```
<!-- auto:end -->
