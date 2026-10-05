---
updated: 2026-10-05
tier: 3
---

# Status — tier 3

<!-- TETO: 60 linhas. Resumir "Concluído" quando crescer. -->

## Estado atual

Jogo voxel educacional rodando, testado com turma real. Árvore limpa, `main` em sinc com o
`origin` (`1c7cbd5`). Ambiente é só LINUX.

**O build está PUSHADO e rotulado "Cada ferramenta serve pra uma coisa · 05/10"** — o launcher
da escola baixa na próxima vez que rodar. **Nada dele foi visto em tela pelo usuário**: a lista
do que testar está no `TODO.md`, e o retorno da aula é o que decide se algum número afrouxa.

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
- **Decisões do USUÁRIO:** quanto de Dimas cada aluno recebe; se o aviso de Dimas nova cala em
  turma cheia.
- Externas: distribuição pelo Drive; certificado de assinatura de código só se sair da piloto.

## Concluído (recente)

- **05/10:** **bug-674** (voo liberado voltava desligado: era runtime, fora do `SaveMeta`) +
  portão de que aula nasce sem voo salvo modelo criado assim; changelog com os 3 itens que
  faltavam e título novo (a data do build andou sozinha). E **logs de sessão** — `mundos/<nome>/logs/`, um par por sessão (`-chat.log` de
  gente, `-eventos.log` de servidor); o arquivo único chegou a 344 KB, 2434/2434 de sistema.
- **28/09–03/10:** skill `/contexto` migrada pro modelo de TIERS (3 aqui); estes arquivos ganharam
  frontmatter, blocos `auto` e as convenções novas (veredicto, teto fora do `auto`, `→ verify:`).
- **25/09:** contexto migrado de `.wolf/` pra `.claude/context/`; **bug-673** — o rótulo de build
  carregava o sha do HEAD, o `client/dist` versionado mudava sozinho a cada commit e o portão do
  dist ficava desarmado justo no pre-push. Rótulo virou só a data.
- **17-23/09 (100-102):** §🔨 ferramentas v2 (segurar, rachar, gastar), §🪓 machado e pá,
  heartbeat de presença (bug-672) e preço de ITEM na loja (bug-671).

## Bruto do git (auto — não editar)

<!-- auto:start -->
data: 2026-10-05

```
1c7cbd5 docs(changelog): o lote vira marco próprio — 'Cada ferramenta serve pra uma coisa'
1d90d17 docs(changelog): voo por aula e os logs de sessão, que foram sem entrada
6d561c2 test(voo): portão — aula nasce sem voo, e abre voando se o MODELO foi salvo assim
c87591c fix(voo): o voo liberado pelo professor persiste no mundo (bug-674)
b855994 docs(contexto): logs de sessão no STATUS/MAP e dois aprendizados novos
2b8d2f9 feat(logs): log de sessão por arquivo, e fala de gente separada de evento
42e4d09 docs(contexto): handoff de fim de sessão
346a955 docs(contexto): etapas do WORKFLOW no formato "etapa → verify: checagem"
--- status ---
 M .claude/context/LEARNINGS.md
 M .claude/context/STATUS.md
 M .claude/context/TODO.md
```
<!-- auto:end -->
